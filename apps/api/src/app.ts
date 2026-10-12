import Fastify, { type FastifyBaseLogger } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import formbody from '@fastify/formbody';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import ajvFormats from 'ajv-formats';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { config, isProd } from './platform/config.js';
import { logger } from './platform/logger.js';
import { errorHandler, registerSpecRoutes } from './platform/routes.js';
import { registerModules, registerRawRoutes } from './modules/index.js';

/**
 * Siar API. Callers:
 *   developers — x-api-key (organization key), the public /api/v1 surface
 *   dashboard  — siar_session cookie (+ x-siar CSRF header, x-organization-id)
 *   end users  — the hosted connect portal (/api/v1/portal/<token>)
 *   networks   — OAuth callbacks and webhooks (Meta, TikTok…); payment providers (Stripe, CHIP)
 * In production the same process serves the built dashboard (WEB_DIST) on APP_URL's host.
 */
const CACHE_PURGE_COOKIE = 'siar_cache_purged_1';

export async function buildApp() {
  const app = Fastify({
    loggerInstance: logger as unknown as FastifyBaseLogger,
    trustProxy: true,
    bodyLimit: 20 * 1024 * 1024,
    forceCloseConnections: true,
    routerOptions: { ignoreTrailingSlash: true, ignoreDuplicateSlashes: true },
    ajv: { customOptions: { strict: false, coerceTypes: 'array', useDefaults: true, removeAdditional: false, allErrors: false }, plugins: [ajvFormats as any] },
  });
  await app.register(helmet, { contentSecurityPolicy: false, crossOriginResourcePolicy: { policy: 'cross-origin' } });
  await app.register(cors, {
    origin: (origin, cb) => cb(null, !origin || origin === new URL(config.APP_URL).origin || origin === new URL(config.SITE_URL).origin || config.NODE_ENV !== 'production'),
    credentials: true,
    allowedHeaders: ['content-type', 'x-api-key', 'x-siar', 'x-organization-id', 'authorization'],
  });
  await app.register(cookie, { secret: config.SESSION_SECRET });
  await app.register(formbody);
  await app.register(multipart, { limits: { fileSize: config.MAX_UPLOAD_MB * 1024 * 1024, files: 1, fields: 30 } });
  app.setErrorHandler(errorHandler);
  app.setNotFoundHandler((req, reply) => {
    // a missing hashed asset is a 404, never the app page: an old bundle asking for a chunk from an earlier
    // release must fail loudly so the dashboard reloads (see lib/stale.ts)
    if (req.url.startsWith('/api/') || req.url.startsWith('/assets/') || req.method !== 'GET' || !webRoot) return reply.status(404).send({ statusCode: 404, message: `Route ${req.method} ${req.url.split('?')[0]} not found.` });
    return reply.header('Cache-Control', 'no-cache').sendFile('index.html');
  });
  app.addHook('onSend', async (req, reply) => {
    if (!req.url.startsWith('/api/')) return;
    reply.header('Cache-Control', 'no-store');
    // Releases before 2026-10-12 sent dashboard pages with a one-year max-age, so a browser can hold an old
    // dashboard for a URL it saw then (the OAuth return URL is always the same). Purge that browser's HTTP
    // cache once, on its first API call, and remember with a cookie.
    if (isProd && !req.cookies?.[CACHE_PURGE_COOKIE]) {
      reply.header('Clear-Site-Data', '"cache"');
      reply.setCookie(CACHE_PURGE_COOKIE, '1', { path: '/', maxAge: 400 * 86400, httpOnly: true, secure: true, sameSite: 'lax' });
    }
  });

  registerModules();
  await registerSpecRoutes(app);
  await registerRawRoutes(app);

  const webRoot = process.env.WEB_DIST ? resolve(process.env.WEB_DIST) : null;
  if (webRoot && existsSync(webRoot)) {
    // cacheControl: false — @fastify/static's own maxAge header lands after setHeaders and made index.html
    // immutable for a year, so browsers kept an old dashboard after a release. Hashed assets stay immutable.
    await app.register(fastifyStatic, {
      root: webRoot, wildcard: false, cacheControl: false,
      setHeaders: (res, path) => res.setHeader('Cache-Control', path.endsWith('.html') ? 'no-cache' : 'public, max-age=31536000, immutable'),
    });
  }
  return app;
}
