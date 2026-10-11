import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { authenticate, loadSessionUser, type Actor, type SessionUser } from './auth.js';
import { AppError, notImplemented, tooMany, unauthenticated } from './errors.js';
import { hit } from './ratelimit.js';
import { prisma } from './db.js';

/**
 * Routes come from the OpenAPI document (packages/contract/openapi.json), not the other way round:
 * every operation is mounted at its path with its request schema (Ajv validates params, query
 * and JSON bodies before a handler runs), and dispatched to the handler registered under its
 * operationId. An operation without a handler answers 501 — so the parity ledger can count what is
 * missing, and a client never hits a silent 404 on a documented route.
 */
export interface Ctx<B = any, Q = any, P = any> {
  req: FastifyRequest;
  reply: FastifyReply;
  /** Undefined only on public operations. */
  actor: Actor;
  /** Set on routes that accept a signed-in user without an organization (auth/user). */
  sessionUser?: SessionUser;
  body: B;
  query: Q;
  params: P;
  operationId: string;
}
export type Handler = (ctx: Ctx) => Promise<unknown> | unknown;

const handlers = new Map<string, Handler>();
const options = new Map<string, { sessionOnly?: boolean; multipart?: boolean; rawBody?: boolean }>();

/** Register handlers for operationIds. `sessionOnly` = a signed-in user is enough (no org needed). */
export function define(map: Record<string, Handler>, opts: { sessionOnly?: boolean; multipart?: boolean } = {}) {
  for (const [id, h] of Object.entries(map)) {
    if (handlers.has(id)) throw new Error(`Handler for ${id} registered twice`);
    handlers.set(id, h);
    if (opts.sessionOnly || opts.multipart) options.set(id, opts);
  }
}
export const implemented = () => new Set(handlers.keys());

const require_ = createRequire(import.meta.url);
export function loadSpec(): any {
  return JSON.parse(readFileSync(require_.resolve('@siar/contract/openapi.json'), 'utf8'));
}

const toFastifyPath = (p: string) => p.replace(/\{([^}]+)\}/g, ':$1');

const FORMATS = new Set(['date', 'time', 'date-time', 'duration', 'uri', 'uri-reference', 'url', 'email', 'hostname', 'ipv4', 'ipv6', 'uuid', 'regex']);
/**
 * OpenAPI 3.0 schema → JSON Schema Ajv accepts: `nullable` becomes a null branch, unknown formats
 * (binary, int64…) are dropped, `readOnly`/`deprecated` annotations are ignored.
 */
export function toJsonSchema(s: any): any {
  if (Array.isArray(s)) return s.map(toJsonSchema);
  if (!s || typeof s !== 'object') return s;
  const out: any = {};
  for (const [k, v] of Object.entries(s)) {
    if (k === 'nullable' || k === 'readOnly' || k === 'writeOnly' || k === 'deprecated' || k === 'xml' || k === 'discriminator') continue;
    if (k === 'format' && !FORMATS.has(String(v))) continue;
    if (k === 'properties' || k === 'patternProperties' || k === 'definitions' || k === '$defs') out[k] = Object.fromEntries(Object.entries(v as object).map(([pk, pv]) => [pk, toJsonSchema(pv)]));
    else out[k] = typeof v === 'object' ? toJsonSchema(v) : v;
  }
  if (s.nullable === true) {
    if (typeof out.type === 'string') { out.type = [out.type, 'null']; if (out.enum) out.enum = [...out.enum, null]; }
    else if (!out.type) return { anyOf: [out, { type: 'null' }] };
  }
  return out;
}

const schemaFor = (op: any) => {
  const params = (op.parameters ?? []).filter((x: any) => x.in === 'path');
  const query = (op.parameters ?? []).filter((x: any) => x.in === 'query');
  const s: Record<string, unknown> = {};
  if (params.length) s.params = { type: 'object', properties: Object.fromEntries(params.map((p: any) => [p.name, toJsonSchema(p.schema ?? { type: 'string' })])), required: params.filter((p: any) => p.required).map((p: any) => p.name) };
  if (query.length) s.querystring = { type: 'object', properties: Object.fromEntries(query.map((p: any) => [p.name, toJsonSchema(p.schema ?? { type: 'string' })])), required: query.filter((p: any) => p.required).map((p: any) => p.name) };
  const json = op.requestBody?.content?.['application/json']?.schema;
  if (json) s.body = toJsonSchema(json);
  return s;
};

const successCode = (op: any) => Number(Object.keys(op.responses ?? {}).find(c => c.startsWith('2')) ?? 200);

export async function registerSpecRoutes(app: FastifyInstance) {
  const spec = loadSpec();
  for (const [path, ops] of Object.entries<any>(spec.paths)) {
    for (const [method, op] of Object.entries<any>(ops)) {
      const operationId: string = op.operationId;
      const isPublic = Array.isArray(op.security) && op.security.length === 0;
      const multipart = !!op.requestBody?.content?.['multipart/form-data'];
      const code = successCode(op);
      app.route({
        method: method.toUpperCase() as any,
        url: toFastifyPath(path),
        schema: multipart ? { ...schemaFor(op), body: undefined } : schemaFor(op),
        config: { operationId },
        handler: async (req, reply) => {
          const h = handlers.get(operationId);
          const opt = options.get(operationId) ?? {};
          let actor: Actor | undefined;
          let sessionUser: SessionUser | undefined;
          if (!isPublic) {
            if (opt.sessionOnly) {
              sessionUser = (await loadSessionUser(req)) ?? undefined;
              if (!sessionUser) throw unauthenticated('Please sign in.');
              req.sessionUser = sessionUser;
              actor = await authenticate(req).catch(() => undefined);
            } else {
              actor = await authenticate(req);
              sessionUser = req.sessionUser;
            }
          }
          // Rate limit: per endpoint for API keys, whole-app per session/IP otherwise.
          const bucket = actor?.kind === 'API_KEY' ? `k:${actor.apiKeyId}:${operationId}` : actor ? `o:${actor.organizationId}:${actor.userId ?? ''}` : `ip:${req.ip}`;
          const mult = actor ? await multiplierFor(actor.organizationId) : 1;
          const rl = await hit(bucket, mult);
          reply.header('x-ratelimit-limit', rl.limit).header('x-ratelimit-remaining', rl.remaining);
          if (!rl.ok) { reply.header('retry-after', Math.ceil(rl.retryAfterMs / 1000)); throw tooMany(undefined, Math.ceil(rl.retryAfterMs / 1000)); }
          if (!h) throw notImplemented(operationId);
          const out = await h({ req, reply, actor: actor as Actor, sessionUser, body: (req.body ?? {}) as any, query: (req.query ?? {}) as any, params: (req.params ?? {}) as any, operationId });
          if (reply.sent) return reply;
          if (out === undefined) return reply.status(code).send({ success: true });
          return reply.status(code).send(out);
        },
      });
    }
  }
}

const multCache = new Map<string, { v: number; at: number }>();
async function multiplierFor(orgId: string) {
  const c = multCache.get(orgId);
  if (c && Date.now() - c.at < 60_000) return c.v;
  const o = await prisma.organization.findUnique({ where: { id: orgId }, select: { rateLimitMultiplier: true } });
  const v = Math.max(1, o?.rateLimitMultiplier ?? 1);
  multCache.set(orgId, { v, at: Date.now() });
  return v;
}

/** Fastify error handler → the public error envelope. */
export function errorHandler(err: any, req: FastifyRequest, reply: FastifyReply) {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) req.log.error({ err }, err.message);
    return reply.status(err.statusCode).send(err.toJSON());
  }
  if (err?.validation) {
    const issues = err.validation.map((v: any) => {
      const base = (v.instancePath || '').split('/').filter(Boolean);
      const path = v.params?.missingProperty ? [...base, v.params.missingProperty] : base;
      return { code: v.keyword, message: v.params?.missingProperty ? `${v.params.missingProperty} is required` : `${path.join('.') || err.validationContext} ${v.message}`, path: [err.validationContext === 'body' ? null : err.validationContext, ...path].filter(Boolean) };
    });
    return reply.status(400).send({ statusCode: 400, message: issues[0]?.message ? `Validation failed: ${issues[0].message}` : 'Validation failed', issues });
  }
  const pe = err as { code?: string; meta?: any; statusCode?: number; message?: string };
  if (pe?.code === 'P2025') return reply.status(404).send({ statusCode: 404, message: 'Resource not found.' });
  if (pe?.code === 'P2002') return reply.status(409).send({ statusCode: 409, message: 'A resource with these values already exists.' });
  if (pe?.statusCode && pe.statusCode < 500) return reply.status(pe.statusCode).send({ statusCode: pe.statusCode, message: pe.message ?? 'Request failed.' });
  req.log.error({ err }, 'unhandled error');
  return reply.status(500).send({ statusCode: 500, message: 'Internal server error. It has been logged.' });
}
