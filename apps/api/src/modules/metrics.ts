/**
 * Analytics for Siar staff (docs/ANALYTICS.md): the collectors' schedules and GET /api/internal/metrics.
 * Not part of the public API contract: staff sessions only, never an API key.
 */
import type { FastifyInstance } from 'fastify';
import { registerJob } from '../engine/jobs.js';
import { JOBS } from '../platform/queue.js';
import { loadSessionUser } from '../platform/auth.js';
import { ingestTraffic } from '../domain/traffic/ingest.js';
import { pullBing, pullGoogle } from '../domain/search.js';
import { buildReport, reportMarkdown } from '../domain/metrics.js';
import { businessNumbers, excludeList } from '../domain/ff-analytics.js';
import { config } from '../platform/config.js';
import { safeEqual } from '../platform/crypto.js';

registerJob(JOBS.trafficIngest, () => ingestTraffic());
registerJob(JOBS.searchPull, async () => ({ google: await pullGoogle(), bing: await pullBing() }));

export async function metricsRawRoutes(app: FastifyInstance) {
  app.get<{ Querystring: { days?: string; format?: string } }>('/api/internal/metrics', async (req, reply) => {
    const su = await loadSessionUser(req);
    if (!su) return reply.code(401).send({ statusCode: 401, message: 'Sign in first.' });
    if (!su.isStaff) return reply.code(404).send({ statusCode: 404, message: 'Not found.' });
    const report = await buildReport({ days: Number(req.query.days) || 30 });
    reply.header('cache-control', 'no-store');
    if (req.query.format === 'md') return reply.type('text/markdown; charset=utf-8').send(reportMarkdown(report));
    return report;
  });

  /**
   * FF Ops' business pull (FF Analytics): signups, funnel, revenue and staff IPs as JSON. Read-only, bearer token
   * only (FF_ANALYTICS_TOKEN); off (404) until the token is set. Never a session or an API key.
   */
  app.get<{ Querystring: { days?: string; exclude?: string } }>('/api/internal/ff-analytics', async (req, reply) => {
    const token = req.headers.authorization?.match(/^Bearer\s+(\S+)$/)?.[1] ?? '';
    if (!config.FF_ANALYTICS_TOKEN) return reply.code(404).send({ statusCode: 404, message: 'Not found.' });
    if (!token || !safeEqual(token, config.FF_ANALYTICS_TOKEN)) return reply.code(401).send({ statusCode: 401, message: 'Bad token.' });
    reply.header('cache-control', 'no-store');
    return businessNumbers({ days: Number(req.query.days) || 30, exclude: excludeList(req.query.exclude) });
  });
}
