import { createHash, randomBytes } from 'node:crypto';

export const randomString = (bytes = 32) => randomBytes(bytes).toString('base64url');
export const pkceChallenge = (verifier: string) => createHash('sha256').update(verifier).digest('base64url');

export function authorizeUrl(base: string, params: Record<string, string | undefined | null>) {
  const u = new URL(base);
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null) u.searchParams.set(k, v);
  return u.toString();
}

/** expires_in seconds → Date */
export const expiresIn = (seconds: number | string | undefined | null, now = new Date()) =>
  seconds === undefined || seconds === null || seconds === '' ? null : new Date(now.getTime() + Number(seconds) * 1000);

export const basicAuth = (id: string, secret: string) => 'Basic ' + Buffer.from(`${id}:${secret}`).toString('base64');
