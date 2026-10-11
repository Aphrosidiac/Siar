import { logger } from '../platform/logger.js';
import { JOBS, SCHEDULES, startQueue } from '../platform/queue.js';
import { registeredJobs, runJob } from './jobs.js';
import './maintenance.js';
import '../modules/index.js';

let dispatchTimer: NodeJS.Timeout | null = null;

/** Register schedules (UTC) and every registered job handler on pg-boss. */
export async function startWorker() {
  const boss = await startQueue();
  for (const [name, cron] of Object.entries(SCHEDULES)) await boss.schedule(name, cron!, {}, { tz: 'UTC' });
  for (const name of registeredJobs()) {
    // Batches run concurrently; one failing job does not fail its batch-mates (each logs its own error).
    const batchSize = name.startsWith('cron.') ? 1 : name === JOBS.processUpload ? 2 : 10;
    await boss.work(name, { batchSize, pollingIntervalSeconds: 0.5 }, async jobs => {
      await Promise.all(jobs.map(j => runJob(name, j.data).catch(() => undefined)));
    });
  }
  // Cron is per minute; due posts are also swept every 15 s so "publish now" never waits a minute.
  dispatchTimer = setInterval(() => void runJob(JOBS.dispatchDue, {}).catch(() => undefined), 15_000);
  logger.info({ jobs: registeredJobs().length }, 'worker running');
}

export function stopWorker() {
  if (dispatchTimer) clearInterval(dispatchTimer);
  dispatchTimer = null;
}
