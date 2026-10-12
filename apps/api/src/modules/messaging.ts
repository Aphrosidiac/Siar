import type { FastifyInstance } from 'fastify';
import { registerJob } from '../engine/jobs.js';
import { JOBS } from '../platform/queue.js';
import './messaging-conversations.js';
import { runExecution } from './messaging-automations.js';
import { ingestMetaWebhook, metaWebhookRoutes } from './messaging-webhook.js';
import { metaCallbackRoutes } from './meta-callbacks.js';

/**
 * DMs and automations (Meta): handlers live in messaging-conversations.ts (inbox, messaging
 * switch), messaging-automations.ts (flows, engine, provider settings) and messaging-webhook.ts
 * (Meta webhook ingestion). Shared shapes and gating: messaging-shared.ts.
 *
 * One job queue (automation.run) carries both kinds of messaging work, keyed by `kind`:
 *   { kind: 'meta-webhook', platform, body }  → ingest a webhook delivery
 *   { kind: 'execute', executionId }          → run one automation execution
 */
registerJob(JOBS.runAutomation, async (data: any) => {
  if (data?.kind === 'meta-webhook') return ingestMetaWebhook(data.platform, data.body);
  if (data?.executionId) return runExecution(data.executionId);
  return null;
});

/** Raw (non-OpenAPI) routes owned by this module: the Meta webhook (GET verify + POST deliveries). */
export async function messagingRawRoutes(app: FastifyInstance) {
  await metaWebhookRoutes(app);
  await metaCallbackRoutes(app);
}
