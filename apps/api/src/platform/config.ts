import { z } from 'zod';

/**
 * Every setting the API reads, validated once at start. A missing or malformed value stops the
 * process with a readable list instead of failing later inside a request.
 * Network app credentials are read separately (NETWORK_<TYPE>_<KEY>) by platform/networks.ts.
 */
const bool = (d: 'true' | 'false') => z.string().default(d).transform(v => v === 'true' || v === '1');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3290),
  HOST: z.string().default('127.0.0.1'),
  DATABASE_URL: z.string().min(1),
  DB_POOL_MAX: z.coerce.number().default(15),
  REDIS_URL: z.string().default('redis://127.0.0.1:6379/5'),
  SESSION_SECRET: z.string().min(32),
  /** 32 bytes, base64. Encrypts network tokens and webhook secrets at rest. */
  ENCRYPTION_KEY: z.string().min(40),
  /** Comma-separated older keys still accepted for decryption (rotation). */
  ENCRYPTION_KEYS_OLD: z.string().default(''),
  /** Dashboard origin (emails, OAuth return, checkout return). */
  APP_URL: z.string().default('http://localhost:5290'),
  /** Public API origin (OAuth callbacks, webhooks networks call, signed media). */
  API_URL: z.string().default('http://localhost:3290'),
  /** Public origin of media files (a dedicated domain in production — TikTok/Meta pull from it). */
  MEDIA_URL: z.string().default('http://localhost:3290/media'),
  SITE_URL: z.string().default('http://localhost:4290'),
  LOG_LEVEL: z.string().default('info'),
  STORAGE_DRIVER: z.enum(['local', 's3']).default('local'),
  STORAGE_DIR: z.string().default('storage'),
  S3_ENDPOINT: z.string().default(''),
  S3_REGION: z.string().default('auto'),
  S3_BUCKET: z.string().default(''),
  S3_ACCESS_KEY_ID: z.string().default(''),
  S3_SECRET_ACCESS_KEY: z.string().default(''),
  MAX_UPLOAD_MB: z.coerce.number().default(1024),
  /** live = real networks; mock = everything goes to MOCK_NETWORKS_URL (mocks/). */
  NETWORK_MODE: z.enum(['live', 'mock']).default('mock'),
  MOCK_NETWORKS_URL: z.string().default('http://127.0.0.1:3299'),
  /** mock = local checkout stand-in; live = real Stripe/CHIP (test vs live money decided by the keys). */
  BILLING_MODE: z.enum(['mock', 'live']).default('mock'),
  STRIPE_SECRET_KEY: z.string().default(''),
  STRIPE_WEBHOOK_SECRET: z.string().default(''),
  CHIP_SECRET_KEY: z.string().default(''),
  CHIP_BRAND_ID: z.string().default(''),
  CHIP_API_URL: z.string().default('https://gate.chip-in.asia/api/v1'),
  /** MYR per USD used to price CHIP checkouts (CHIP settles in MYR). */
  CHIP_USD_MYR: z.coerce.number().default(4.7),
  SMTP_URL: z.string().default(''),
  MAIL_FROM: z.string().default('Siar <hello@siaran.my>'),
  RUN_JOBS_IN_API: bool('false'),
  /** Emails that become Siar staff (User.role = ADMIN) on sign-up. */
  STAFF_EMAILS: z.string().default('hello@ffdev.studio'),
  TRIAL_DAYS: z.coerce.number().default(14),
});

const env = Object.fromEntries(Object.entries(process.env).filter(([, v]) => v !== ''));
const parsed = schema.safeParse(env);
if (!parsed.success) {
  console.error('Invalid configuration:\n' + parsed.error.issues.map(i => `  ${i.path.join('.')}: ${i.message}`).join('\n'));
  process.exit(1);
}
export const config = parsed.data;
export const isProd = config.NODE_ENV === 'production';
export const isTest = config.NODE_ENV === 'test';
const join = (base: string, path: string) => base.replace(/\/$/, '') + path;
export const appUrl = (path = '') => join(config.APP_URL, path);
export const apiUrl = (path = '') => join(config.API_URL, path);
export const siteUrl = (path = '') => join(config.SITE_URL, path);
