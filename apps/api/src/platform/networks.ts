import { ADAPTERS, NetworkError, isNetworkError, type AccountRuntime, type MediaRef, type NetworkContext, type NetworkType, type TokenSet } from '@siar/networks';
import { Readable } from 'node:stream';
import type { SocialAccount, Upload } from '../generated/prisma/client.js';
import { apiUrl, config } from './config.js';
import { decrypt, decryptJson, encrypt, encryptJson } from './crypto.js';
import { prisma, type Db } from './db.js';
import { logger } from './logger.js';
import * as storage from './storage.js';

/**
 * The bridge between the API and the adapters: builds the NetworkContext (credentials, mock-mode
 * URL rewriting), turns SocialAccount rows into AccountRuntime (decrypting tokens), refreshes
 * tokens exactly once at a time, and turns Upload rows into MediaRef.
 */

export const adapter = (type: NetworkType) => ADAPTERS[type];

/** NETWORK_<TYPE>_<KEY> from env, e.g. NETWORK_FACEBOOK_CLIENT_ID → { clientId }. */
export function credentialsFor(type: NetworkType) {
  const prefix = `NETWORK_${type}_`;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(process.env)) {
    if (!k.startsWith(prefix) || !v) continue;
    const key = k.slice(prefix.length).toLowerCase().replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = v;
  }
  return out;
}

/** A network is usable when we are in mock mode or every credential key it needs is present. */
export function isConfigured(type: NetworkType) {
  if (config.NETWORK_MODE === 'mock') return true;
  const creds = credentialsFor(type);
  return adapter(type).credentialKeys.every(k => !!creds[k]);
}

export const rewriteForMock = (url: string) => {
  if (config.NETWORK_MODE !== 'mock') return url;
  const u = new URL(url);
  if (u.hostname === '127.0.0.1' || u.hostname === 'localhost') return url;
  return `${config.MOCK_NETWORKS_URL.replace(/\/$/, '')}/__host/${u.host}${u.pathname}${u.search}`;
};

export const callbackUrl = (type: NetworkType) => apiUrl(`/api/v1/social-account/callback/${type}`);

export function networkContext(type: NetworkType): NetworkContext {
  const log = logger.child({ network: type });
  return {
    mode: config.NETWORK_MODE,
    credentials: config.NETWORK_MODE === 'mock' ? new Proxy(credentialsFor(type), { get: (t, k: string) => t[k] ?? `mock-${k}` }) : credentialsFor(type),
    redirectUri: callbackUrl(type),
    apiUrl: config.API_URL,
    log,
    now: () => new Date(),
    async fetch(url, init = {}) {
      const target = rewriteForMock(url);
      const { timeoutMs, ...rest } = init;
      const started = Date.now();
      const res = await fetch(target, { ...rest, signal: AbortSignal.timeout(timeoutMs ?? 60_000), redirect: rest.redirect ?? 'follow' });
      log.debug({ method: rest.method ?? 'GET', url: url.replace(/(access_token|token|key)=[^&]+/g, '$1=…'), status: res.status, ms: Date.now() - started }, 'network call');
      return res;
    },
  };
}

// ───────────────────────────── accounts ─────────────────────────────

export function tokenOf(a: Pick<SocialAccount, 'accessTokenEnc' | 'refreshTokenEnc' | 'tokenExpiresAt' | 'refreshTokenExpiresAt' | 'scopes' | 'secretsEnc'>): TokenSet {
  return {
    accessToken: a.accessTokenEnc ? decrypt(a.accessTokenEnc) : '',
    refreshToken: a.refreshTokenEnc ? decrypt(a.refreshTokenEnc) : null,
    expiresAt: a.tokenExpiresAt,
    refreshTokenExpiresAt: a.refreshTokenExpiresAt,
    scopes: a.scopes,
    secrets: decryptJson<Record<string, unknown>>(a.secretsEnc) ?? {},
  };
}

export const tokenColumns = (t: TokenSet) => ({
  accessTokenEnc: t.accessToken ? encrypt(t.accessToken) : null,
  refreshTokenEnc: t.refreshToken ? encrypt(t.refreshToken) : null,
  tokenExpiresAt: t.expiresAt ?? null,
  refreshTokenExpiresAt: t.refreshTokenExpiresAt ?? null,
  scopes: t.scopes ?? [],
  secretsEnc: t.secrets && Object.keys(t.secrets).length ? encryptJson(t.secrets) : null,
});

export function runtimeOf(a: SocialAccount & { mastodonServer?: { url: string } | null }): AccountRuntime {
  const channels = (Array.isArray(a.channels) ? a.channels : []) as any[];
  return {
    id: a.id, type: a.type as NetworkType, externalId: a.externalId, providerPageId: a.providerPageId, username: a.username, displayName: a.displayName,
    channelId: a.channelId,
    channels, token: tokenOf(a), serverUrl: a.mastodonServer?.url ?? a.serverUrl, instagramConnectionMethod: a.instagramConnectionMethod,
  };
}

const REFRESH_MARGIN_MS = 10 * 60_000;

/**
 * The account, ready to call the network: if its token expires within 10 minutes it is refreshed
 * first. Refreshes are single-flight per account (Postgres advisory lock) because X and TikTok
 * rotate refresh tokens — two concurrent refreshes would invalidate each other and lose the grant.
 */
export async function loadAccount(id: string, opts: { forceRefresh?: boolean } = {}): Promise<AccountRuntime> {
  const a = await prisma.socialAccount.findUnique({ where: { id }, include: { mastodonServer: true } });
  if (!a || a.deletedAt) throw new NetworkError('NOT_FOUND', 'Social account not found.');
  const needs = opts.forceRefresh || (a.tokenExpiresAt && a.tokenExpiresAt.getTime() - Date.now() < REFRESH_MARGIN_MS);
  if (!needs || !adapter(a.type as NetworkType).refresh) return runtimeOf(a);
  return refreshAccount(a.id);
}

export async function refreshAccount(id: string): Promise<AccountRuntime> {
  return prisma.$transaction(async tx => {
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'refresh:' + id}))`;
    const a = await tx.socialAccount.findUniqueOrThrow({ where: { id }, include: { mastodonServer: true } });
    // Another worker may have refreshed while we waited for the lock.
    if (a.lastRefreshedAt && Date.now() - a.lastRefreshedAt.getTime() < 60_000 && (!a.tokenExpiresAt || a.tokenExpiresAt.getTime() - Date.now() > REFRESH_MARGIN_MS)) return runtimeOf(a);
    const ad = adapter(a.type as NetworkType);
    try {
      const t = await ad.refresh!(networkContext(a.type as NetworkType), runtimeOf(a));
      const merged: TokenSet = { ...tokenOf(a), ...t, refreshToken: t.refreshToken ?? tokenOf(a).refreshToken, secrets: { ...(tokenOf(a).secrets ?? {}), ...(t.secrets ?? {}) } };
      const updated = await tx.socialAccount.update({ where: { id }, data: { ...tokenColumns(merged), lastRefreshedAt: new Date(), state: 'CONNECTED', stateReason: null }, include: { mastodonServer: true } });
      return runtimeOf(updated);
    } catch (err) {
      if (isNetworkError(err) && (err.code === 'TOKEN_INVALID' || err.code === 'PERMISSION')) await markNeedsReconnect(tx, id, err.message);
      throw err;
    }
  }, { timeout: 60_000 });
}

export async function markNeedsReconnect(db: Db, id: string, reason: string) {
  await db.socialAccount.update({ where: { id }, data: { state: 'NEEDS_RECONNECT', stateReason: reason.slice(0, 500), disconnectedCheckTryAt: new Date() } });
}

// ───────────────────────────── media ─────────────────────────────

export function mediaRef(u: Upload, altText?: string | null): MediaRef {
  const key = u.path!;
  return {
    id: u.id, type: u.type, mime: u.mime ?? 'application/octet-stream', ext: u.ext ?? 'bin', url: storage.signedUrl(key), fileSize: u.fileSize ?? 0,
    width: u.width, height: u.height, duration: u.videoLength, altText: altText ?? null,
    read: () => storage.get(key),
    readRange: (s, e) => storage.getRange(key, s, e),
    stream: async () => Readable.toWeb(await storage.stream(key)) as ReadableStream<Uint8Array>,
  };
}
