import '@fastify/cookie';
import bcrypt from 'bcryptjs';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { MemberRole } from '../generated/prisma/enums.js';
import { isProd } from './config.js';
import { randomToken, sha256 } from './crypto.js';
import { prisma } from './db.js';
import { forbidden, unauthenticated } from './errors.js';

export const hashPassword = (plain: string) => bcrypt.hash(plain, 11);
export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);

export const SESSION_COOKIE = 'siar_session';
export const SESSION_DAYS = 30;
const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Who is calling. Every request that reaches a handler has exactly one actor, scoped to exactly one
 * organization — every query a handler makes filters on `actor.organizationId`.
 */
export type Actor =
  | { kind: 'USER'; userId: string; organizationId: string; role: MemberRole; name: string; sessionId: string; isStaff: boolean }
  | { kind: 'API_KEY'; apiKeyId: string; organizationId: string; role: 'API_KEY'; name: string; userId: null }
  | { kind: 'SYSTEM'; organizationId: string; role: 'SYSTEM'; name: string; userId: null };

/** A signed-in user who has not picked (or has no) organization yet — only auth/user routes accept this. */
export interface SessionUser { userId: string; sessionId: string; organizationId: string | null; isStaff: boolean; name: string }

declare module 'fastify' {
  interface FastifyRequest { actor?: Actor; sessionUser?: SessionUser }
}

export const apiKeyPrefix = (key: string) => key.slice(0, 12);
export const newApiKey = () => `sk_live_${randomToken(30)}`;

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE, token, { path: '/', httpOnly: true, sameSite: 'lax', secure: isProd, maxAge: SESSION_DAYS * 86400 });
}
export const clearSessionCookie = (reply: FastifyReply) => reply.clearCookie(SESSION_COOKIE, { path: '/' });

export async function createSession(userId: string, organizationId: string | null, req: FastifyRequest) {
  const token = randomToken();
  await prisma.session.create({ data: { id: sha256(token), userId, organizationId, userAgent: req.headers['user-agent']?.slice(0, 250), ip: req.ip, expiresAt: new Date(Date.now() + SESSION_DAYS * 86400_000) } });
  return token;
}

const displayName = (u: { firstName: string | null; lastName: string | null; email: string }) => [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;

/** Resolve the session cookie to a user (no organization requirement). */
export async function loadSessionUser(req: FastifyRequest): Promise<SessionUser | null> {
  const raw = req.cookies?.[SESSION_COOKIE];
  if (!raw) return null;
  const s = await prisma.session.findUnique({ where: { id: sha256(raw) }, include: { user: true } });
  if (!s || s.revokedAt || s.expiresAt < new Date() || s.user.deletedAt) return null;
  // Cookie-authenticated writes need a header a cross-site form cannot send (CSRF guard).
  if (MUTATING.has(req.method) && req.headers['x-siar'] !== '1') throw forbidden('Missing x-siar request header.');
  return { userId: s.userId, sessionId: s.id, organizationId: s.organizationId, isStaff: s.user.role === 'ADMIN', name: displayName(s.user) };
}

/**
 * Authenticate a request against the public API: `x-api-key` (organization key) or the dashboard
 * session cookie (+ optional `x-organization-id`). Sets req.actor or throws 401/403.
 */
export async function authenticate(req: FastifyRequest): Promise<Actor> {
  const key = req.headers['x-api-key'];
  if (typeof key === 'string' && key) {
    const k = await prisma.apiKey.findUnique({ where: { hash: sha256(key) }, include: { organization: { select: { id: true, deletedAt: true, suspended: true, apiAccess: true } } } });
    if (!k || k.revokedAt || k.organization.deletedAt) throw unauthenticated('Invalid API key.');
    if (k.organization.suspended) throw forbidden('This organization is suspended. Contact support.');
    if (!k.organization.apiAccess) throw forbidden('API access is disabled for this organization.');
    if (!k.lastUsedAt || Date.now() - k.lastUsedAt.getTime() > 60_000) void prisma.apiKey.update({ where: { id: k.id }, data: { lastUsedAt: new Date() } }).catch(() => undefined);
    return (req.actor = { kind: 'API_KEY', apiKeyId: k.id, organizationId: k.organizationId, role: 'API_KEY', name: `API key "${k.name}"`, userId: null });
  }
  const su = req.sessionUser ?? (await loadSessionUser(req));
  if (!su) throw unauthenticated('Missing or invalid API key.');
  req.sessionUser = su;
  const wanted = (req.headers['x-organization-id'] as string | undefined) || su.organizationId;
  const m = wanted
    ? await prisma.organizationMember.findUnique({ where: { organizationId_userId: { organizationId: wanted, userId: su.userId } }, include: { organization: true } })
    : await prisma.organizationMember.findFirst({ where: { userId: su.userId, organization: { deletedAt: null } }, orderBy: { createdAt: 'asc' }, include: { organization: true } });
  if (!m || m.organization.deletedAt) {
    if (su.isStaff && wanted) {
      const org = await prisma.organization.findUnique({ where: { id: wanted } });
      if (org) return (req.actor = { kind: 'USER', userId: su.userId, organizationId: org.id, role: 'OWNER', name: `${su.name} (staff)`, sessionId: su.sessionId, isStaff: true });
    }
    throw forbidden('You are not a member of this organization.');
  }
  return (req.actor = { kind: 'USER', userId: su.userId, organizationId: m.organizationId, role: m.role, name: su.name, sessionId: su.sessionId, isStaff: su.isStaff });
}

// ───────────────────────── permission matrix (docs/PLAN.md §7) ─────────────────────────

export type Permission = 'billing' | 'org.delete' | 'apiKeys' | 'webhooks' | 'members' | 'teams.manage' | 'org.settings' | 'credits.topUp' | 'content';

const MATRIX: Record<Permission, ('OWNER' | 'ADMIN' | 'MEMBER' | 'API_KEY')[]> = {
  billing: ['OWNER'],
  'org.delete': ['OWNER'],
  'credits.topUp': ['OWNER'],
  apiKeys: ['OWNER', 'ADMIN'],
  webhooks: ['OWNER', 'ADMIN'],
  members: ['OWNER', 'ADMIN'],
  'org.settings': ['OWNER', 'ADMIN'],
  'teams.manage': ['OWNER', 'ADMIN', 'API_KEY'],
  content: ['OWNER', 'ADMIN', 'MEMBER', 'API_KEY'],
};

export function can(actor: Actor, p: Permission) {
  if (actor.kind === 'SYSTEM') return true;
  return (MATRIX[p] as string[]).includes(actor.role);
}
export function requirePermission(actor: Actor, p: Permission) {
  if (!can(actor, p)) throw forbidden(actor.kind === 'API_KEY' ? 'API keys cannot do this; use the dashboard as an organization owner or admin.' : 'Your role does not allow this. Ask an owner or admin.');
}
