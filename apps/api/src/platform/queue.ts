import { PgBoss } from 'pg-boss';
import { config } from './config.js';
import { logger } from './logger.js';

/**
 * Background work on Postgres (pg-boss). Two kinds:
 *   on-demand jobs — enqueued by requests (publish a target, run an import, deliver a webhook)
 *   schedules      — cron (UTC) sweeps that also catch anything an on-demand job missed
 * The worker (src/worker.ts) runs handlers from engine/jobs.ts; in development
 * RUN_JOBS_IN_API=true runs them inside the API process.
 */
export const JOBS = {
  publishTarget: 'post.publish-target',
  pollTarget: 'post.poll-target',
  publishComment: 'comment.publish',
  importHistory: 'import.history',
  importComments: 'import.comments',
  importCsv: 'import.csv',
  importReviews: 'import.reviews',
  deliverWebhook: 'webhook.deliver',
  runAutomation: 'automation.run',
  refreshAccountAnalytics: 'analytics.account',
  refreshPostAnalytics: 'analytics.post',
  processUpload: 'upload.process',
  // schedules
  dispatchDue: 'cron.dispatch-due',
  refreshTokens: 'cron.refresh-tokens',
  connectionChecks: 'cron.connection-checks',
  purgeAccounts: 'cron.purge-accounts',
  analyticsSweep: 'cron.analytics',
  retention: 'cron.media-retention',
  webhookRetry: 'cron.webhook-retry',
  mailFlush: 'cron.mail-flush',
  billingRenewals: 'cron.billing-renewals',
  staleClaims: 'cron.stale-claims',
} as const;

export const SCHEDULES: Partial<Record<(typeof JOBS)[keyof typeof JOBS], string>> = {
  [JOBS.dispatchDue]: '* * * * *',
  [JOBS.refreshTokens]: '*/10 * * * *',
  [JOBS.connectionChecks]: '17 */6 * * *',
  [JOBS.purgeAccounts]: '23 * * * *',
  [JOBS.analyticsSweep]: '41 */3 * * *',
  [JOBS.retention]: '7 3 * * *',
  [JOBS.webhookRetry]: '* * * * *',
  [JOBS.mailFlush]: '* * * * *',
  [JOBS.billingRenewals]: '0 * * * *',
  [JOBS.staleClaims]: '*/5 * * * *',
};

let boss: PgBoss | null = null;

export async function startQueue(): Promise<PgBoss> {
  if (boss) return boss;
  boss = new PgBoss({ connectionString: config.DATABASE_URL, schema: 'pgboss' });
  boss.on('error', err => logger.error({ err }, 'queue error'));
  await boss.start();
  for (const name of Object.values(JOBS)) await boss.createQueue(name).catch(() => undefined);
  return boss;
}

export async function stopQueue() {
  if (boss) await boss.stop({ graceful: true, timeout: 5000 });
  boss = null;
}

export interface EnqueueOpts { singletonKey?: string; startAfter?: Date | number; retryLimit?: number; priority?: number }

/**
 * Hand work to the worker. Never throws: a failed enqueue is logged and the cron sweeps
 * (dispatchDue, webhookRetry …) pick the work up from the database a minute later.
 */
export async function enqueue(name: string, data: object = {}, opts: EnqueueOpts = {}) {
  if (!boss) return null;
  const o: Record<string, unknown> = { retryLimit: opts.retryLimit ?? 2, retryBackoff: true };
  if (opts.singletonKey) o.singletonKey = opts.singletonKey;
  if (opts.startAfter instanceof Date) o.startAfter = opts.startAfter;
  else if (typeof opts.startAfter === 'number') o.startAfter = new Date(Date.now() + opts.startAfter);
  if (Number.isInteger(opts.priority)) o.priority = opts.priority;
  try { return await boss.send(name, data, o); }
  catch (err) { logger.error({ err, name }, 'enqueue failed (the sweep will retry)'); return null; }
}
export const queue = () => boss;
