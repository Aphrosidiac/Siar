import { logger } from '../platform/logger.js';

/**
 * Job handlers register themselves here (at import), so a module that owns a job also owns its
 * handler: engine/publisher → post.*, modules/comments → comment.publish, etc. The worker runs
 * whatever is registered; a job with no handler is logged and dropped.
 */
export type JobHandler = (data: any) => Promise<unknown>;
const handlers = new Map<string, JobHandler>();

export function registerJob(name: string, h: JobHandler) {
  if (handlers.has(name)) throw new Error(`Job ${name} registered twice`);
  handlers.set(name, h);
}

export async function runJob(name: string, data: any) {
  const h = handlers.get(name);
  if (!h) { logger.warn({ name }, 'no handler for job'); return; }
  const started = Date.now();
  try {
    const r = await h(data ?? {});
    logger.debug({ name, ms: Date.now() - started, r }, 'job done');
    return r;
  } catch (err) {
    logger.error({ err, name, data }, 'job failed');
    throw err;
  }
}
export const registeredJobs = () => [...handlers.keys()];
