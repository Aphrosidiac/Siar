import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { config } from './config.js';

/** Session timezone pinned to UTC so Prisma and raw SQL agree on every timestamp. */
const adapter = new PrismaPg({ connectionString: config.DATABASE_URL, max: config.DB_POOL_MAX, options: '-c TimeZone=UTC' });

export const prisma = new PrismaClient({ adapter, log: ['error'], transactionOptions: { maxWait: 10_000, timeout: 30_000 } });

export type Tx = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>;
export type Db = PrismaClient | Tx;
