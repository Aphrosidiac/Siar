import { defineConfig } from 'tsup';
export default defineConfig({ entry: ['src/index.ts', 'src/worker.ts'], format: ['esm'], target: 'node22', sourcemap: true, clean: true, noExternal: ['@siar/networks', '@siar/contract'], external: ['bcryptjs', 'pg', 'pg-boss', 'nodemailer', 'sharp', 'stripe', 'ioredis', '@aws-sdk/client-s3', '@aws-sdk/s3-request-presigner'] });
