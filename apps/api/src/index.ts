import { buildApp } from './app.js';
import { config } from './platform/config.js';
import { prisma } from './platform/db.js';
import { logger } from './platform/logger.js';
import { startQueue, stopQueue } from './platform/queue.js';
import { redis } from './platform/redis.js';
import { startWorker, stopWorker } from './engine/worker.js';

const main = async () => {
  await startQueue();
  if (config.RUN_JOBS_IN_API) await startWorker();
  const app = await buildApp();
  await app.listen({ port: config.PORT, host: config.HOST });
  logger.info({ port: config.PORT, networks: config.NETWORK_MODE, billing: config.BILLING_MODE, jobs: config.RUN_JOBS_IN_API ? 'in-process' : 'worker' }, 'siar api listening');
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'shutting down');
    await app.close(); stopWorker(); await stopQueue(); await prisma.$disconnect(); redis.disconnect(); process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  if (process.send) process.send('ready');
};
process.on('unhandledRejection', err => logger.error({ err }, 'unhandled rejection'));
main().catch(err => { logger.fatal({ err }, 'failed to start'); process.exit(1); });
