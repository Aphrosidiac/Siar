import { prisma } from './platform/db.js';
import { logger } from './platform/logger.js';
import { startQueue, stopQueue } from './platform/queue.js';
import { redis } from './platform/redis.js';
import { startWorker, stopWorker } from './engine/worker.js';

/** Standalone worker process (production). In development the API runs jobs itself. */
process.on('unhandledRejection', err => logger.error({ err }, 'unhandled rejection'));
startQueue().then(startWorker).catch(err => { logger.fatal({ err }, 'worker failed'); process.exit(1); });
const stop = async () => { stopWorker(); await stopQueue(); await prisma.$disconnect(); redis.disconnect(); process.exit(0); };
process.on('SIGTERM', () => void stop());
process.on('SIGINT', () => void stop());
