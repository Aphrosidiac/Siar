import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { config } from './config.js';

/**
 * Secrets at rest (network tokens, webhook secrets): AES-256-GCM, "v1:<iv>:<tag>:<ciphertext>"
 * in base64url. Old keys in ENCRYPTION_KEYS_OLD still decrypt, so the key can be rotated by
 * moving the current key there and re-encrypting in the background.
 */
const key = (b64: string) => {
  const k = Buffer.from(b64, 'base64');
  if (k.length !== 32) throw new Error('ENCRYPTION_KEY must be 32 bytes, base64-encoded.');
  return k;
};
const CURRENT = key(config.ENCRYPTION_KEY);
const OLD = config.ENCRYPTION_KEYS_OLD.split(',').map(s => s.trim()).filter(Boolean).map(key);

export function encrypt(plain: string): string {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', CURRENT, iv);
  const ct = Buffer.concat([c.update(plain, 'utf8'), c.final()]);
  return ['v1', iv.toString('base64url'), c.getAuthTag().toString('base64url'), ct.toString('base64url')].join(':');
}

export function decrypt(blob: string): string {
  const [v, iv, tag, ct] = blob.split(':');
  if (v !== 'v1' || !iv || !tag || !ct) throw new Error('Unrecognised ciphertext.');
  for (const k of [CURRENT, ...OLD]) {
    try {
      const d = createDecipheriv('aes-256-gcm', k, Buffer.from(iv, 'base64url'));
      d.setAuthTag(Buffer.from(tag, 'base64url'));
      return Buffer.concat([d.update(Buffer.from(ct, 'base64url')), d.final()]).toString('utf8');
    } catch { /* try the next key */ }
  }
  throw new Error('Could not decrypt with any configured key.');
}

export const encryptJson = (v: unknown) => encrypt(JSON.stringify(v));
export const decryptJson = <T = unknown>(blob: string | null | undefined): T | null => (blob ? (JSON.parse(decrypt(blob)) as T) : null);

export const sha256 = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
export const randomToken = (bytes = 32) => randomBytes(bytes).toString('base64url');
export const hmac = (secret: string, data: string) => createHmac('sha256', secret).update(data).digest('hex');
export const safeEqual = (a: string, b: string) => {
  const x = Buffer.from(a); const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};
