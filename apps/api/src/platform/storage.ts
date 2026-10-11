import { createReadStream, existsSync } from 'node:fs';
import { mkdir, readFile, rm, stat, writeFile, open } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { Readable } from 'node:stream';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from './config.js';
import { hmac, safeEqual } from './crypto.js';

/**
 * Object storage behind one interface. Production: S3-compatible (Cloudflare R2), private bucket.
 * Development: files under STORAGE_DIR. Either way media is only ever reachable through a
 * short-lived signed URL on MEDIA_URL (/media/<key>?exp=&sig=), which networks that pull media
 * (Instagram, Threads, TikTok PULL_FROM_URL) fetch from.
 */
const root = resolve(config.STORAGE_DIR);
const s3 = config.STORAGE_DRIVER === 's3'
  ? new S3Client({ region: config.S3_REGION, endpoint: config.S3_ENDPOINT || undefined, credentials: { accessKeyId: config.S3_ACCESS_KEY_ID, secretAccessKey: config.S3_SECRET_ACCESS_KEY }, forcePathStyle: true })
  : null;

const localPath = (key: string) => {
  const p = resolve(root, key);
  if (!p.startsWith(root)) throw new Error('bad storage key');
  return p;
};

export async function put(key: string, data: Buffer, contentType?: string) {
  if (s3) { await s3.send(new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: key, Body: data, ContentType: contentType })); return; }
  const p = localPath(key);
  await mkdir(dirname(p), { recursive: true });
  await writeFile(p, data);
}

export async function get(key: string): Promise<Buffer> {
  if (s3) {
    const r = await s3.send(new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key }));
    return Buffer.from(await r.Body!.transformToByteArray());
  }
  return readFile(localPath(key));
}

export async function getRange(key: string, start: number, endExclusive: number): Promise<Buffer> {
  if (s3) {
    const r = await s3.send(new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key, Range: `bytes=${start}-${endExclusive - 1}` }));
    return Buffer.from(await r.Body!.transformToByteArray());
  }
  const fh = await open(localPath(key), 'r');
  try {
    const buf = Buffer.alloc(endExclusive - start);
    const { bytesRead } = await fh.read(buf, 0, buf.length, start);
    return buf.subarray(0, bytesRead);
  } finally { await fh.close(); }
}

export async function stream(key: string): Promise<Readable> {
  if (s3) {
    const r = await s3.send(new GetObjectCommand({ Bucket: config.S3_BUCKET, Key: key }));
    return r.Body as Readable;
  }
  return createReadStream(localPath(key));
}

export async function size(key: string): Promise<number | null> {
  try {
    if (s3) return (await s3.send(new HeadObjectCommand({ Bucket: config.S3_BUCKET, Key: key }))).ContentLength ?? null;
    return (await stat(localPath(key))).size;
  } catch { return null; }
}

export async function remove(key: string) {
  if (s3) { await s3.send(new DeleteObjectCommand({ Bucket: config.S3_BUCKET, Key: key })).catch(() => undefined); return; }
  await rm(localPath(key), { force: true });
}

export const localFile = (key: string) => (s3 ? null : localPath(key));
export const exists = (key: string) => (s3 ? size(key).then(s => s !== null) : Promise.resolve(existsSync(localPath(key))));

// ── multipart (client-side direct upload of very large files) ──
export const multipart = {
  supported: () => !!s3,
  async init(key: string, contentType: string) {
    const r = await s3!.send(new CreateMultipartUploadCommand({ Bucket: config.S3_BUCKET, Key: key, ContentType: contentType }));
    return r.UploadId!;
  },
  async signPart(key: string, uploadId: string, partNumber: number, ttlSeconds = 3600) {
    return getSignedUrl(s3!, new UploadPartCommand({ Bucket: config.S3_BUCKET, Key: key, UploadId: uploadId, PartNumber: partNumber }), { expiresIn: ttlSeconds });
  },
  async complete(key: string, uploadId: string, parts: { partNumber: number; etag: string }[]) {
    await s3!.send(new CompleteMultipartUploadCommand({ Bucket: config.S3_BUCKET, Key: key, UploadId: uploadId, MultipartUpload: { Parts: parts.map(p => ({ PartNumber: p.partNumber, ETag: p.etag })) } }));
  },
  async abort(key: string, uploadId: string) {
    await s3!.send(new AbortMultipartUploadCommand({ Bucket: config.S3_BUCKET, Key: key, UploadId: uploadId })).catch(() => undefined);
  },
  /** Presigned single PUT (large upload init/finalize flow). */
  async signPut(key: string, contentType: string, ttlSeconds = 3600) {
    return getSignedUrl(s3!, new PutObjectCommand({ Bucket: config.S3_BUCKET, Key: key, ContentType: contentType }), { expiresIn: ttlSeconds });
  },
};

// ── signed public URLs ──
const SIGN_SECRET = config.SESSION_SECRET + ':media';
export function signedUrl(key: string, ttlSeconds = 6 * 3600) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const sig = hmac(SIGN_SECRET, `${key}:${exp}`).slice(0, 32);
  return `${config.MEDIA_URL.replace(/\/$/, '')}/${key.split('/').map(encodeURIComponent).join('/')}?exp=${exp}&sig=${sig}`;
}
export function verifySignature(key: string, exp: string, sig: string) {
  if (!/^\d+$/.test(exp) || Number(exp) < Date.now() / 1000) return false;
  return safeEqual(hmac(SIGN_SECRET, `${key}:${exp}`).slice(0, 32), sig ?? '');
}
