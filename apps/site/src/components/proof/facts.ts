/**
 * Engine numbers the proof pages print, read from the API's source text at build time.
 *
 * publisher.ts, webhooks.ts and ratelimit.ts import the database, Redis or the queue, so the site cannot import
 * them. Like lib/events.ts, this reads the constant from the file instead. Each value has a fallback equal to the
 * value in this checkout and a build warning when the pattern stops matching, so a refactor shows up in the build
 * log instead of silently printing a stale number.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ADAPTERS } from '../../../../../packages/networks/src/index.ts';
import type { NetworkType } from '../../../../../packages/networks/src/index.ts';
import { OPEN_ORDER, NETWORK_STATUS } from '../../lib/status';
import { META } from '../../lib/networks';

/** Reads a file by its path from the repo root. Tries this module's location, then the build's working directory
 * (apps/site), because a bundled chunk's import.meta.url is not this file. */
export function repoFile(fromRoot: string): string {
  const tries = [() => fileURLToPath(new URL(`../../../../../${fromRoot}`, import.meta.url)), () => path.resolve(process.cwd(), '../..', fromRoot), () => path.resolve(process.cwd(), fromRoot)];
  for (const t of tries) {
    try { return readFileSync(t(), 'utf8'); } catch {}
  }
  return '';
}
const PUBLISHER = repoFile('apps/api/src/engine/publisher.ts');
const WEBHOOKS = repoFile('apps/api/src/engine/webhooks.ts');
const RATELIMIT = repoFile('apps/api/src/platform/ratelimit.ts');
const TWITTER = repoFile('packages/networks/src/adapters/twitter.ts');
const BLUESKY = repoFile('packages/networks/src/adapters/bluesky.ts');
const MAINTENANCE = repoFile('apps/api/src/engine/maintenance.ts');
const SCHEMA = repoFile('apps/api/prisma/schema.prisma');

function num(text: string, re: RegExp, fallback: number, what: string): number {
  const m = text.match(re);
  if (!m) { console.warn(`[proof/facts] could not read ${what}; using ${fallback}`); return fallback; }
  // "20 * 60_000" style expressions: multiply the parts.
  return m[1].split('*').map((x) => Number(x.trim().replace(/_/g, ''))).reduce((a, b) => a * b, 1);
}

/** Automatic attempts per network target (first send included). */
export const AUTO_ATTEMPTS = num(PUBLISHER, /const AUTO_ATTEMPTS\s*=\s*([\d_]+)/, 3, 'AUTO_ATTEMPTS');
/** Minutes before an interrupted send is looked up on the account. */
export const STALE_CLAIM_MIN = num(PUBLISHER, /const STALE_CLAIM_MS\s*=\s*([\d_\s*]+);/, 20 * 60_000, 'STALE_CLAIM_MS') / 60_000;

/** Webhook retry schedule, in minutes. */
export const BACKOFF_MIN: number[] = (() => {
  const m = WEBHOOKS.match(/const BACKOFF_MIN\s*=\s*\[([^\]]+)\]/);
  if (!m) { console.warn('[proof/facts] could not read BACKOFF_MIN'); return [1, 5, 30, 120, 360, 720, 1440]; }
  return m[1].split(',').map((x) => Number(x.trim().replace(/_/g, '')));
})();
/** Seconds a receiver has to answer a webhook delivery. */
export const WEBHOOK_TIMEOUT_S = num(WEBHOOKS, /AbortSignal\.timeout\(([\d_]+)\)/, 15_000, 'webhook timeout') / 1000;
export const WEBHOOK_RETRIES = BACKOFF_MIN.length;
export const WEBHOOK_HOURS = Math.round(BACKOFF_MIN.reduce((a, b) => a + b, 0) / 60);

/** Hours between connection checks on each account. */
export const CHECK_HOURS = num(MAINTENANCE, /lastCheckedAt:\s*\{\s*lt:\s*new Date\(Date\.now\(\)\s*-\s*([\d_]+)\s*\*\s*3600_000/, 6, 'connection check interval');
/** Default hours before an account that needs reconnecting is removed. */
export const GRACE_HOURS = num(SCHEMA, /deleteAccountAfter\s+Int\s+@default\((\d+)\)/, 72, 'deleteAccountAfter default');

/** Siar API rate-limit windows. */
export const RATE_WINDOWS: { ms: number; max: number }[] = (() => {
  const m = RATELIMIT.match(/export const WINDOWS\s*=\s*\[([\s\S]*?)\]\s*as const/);
  const list = m ? [...m[1].matchAll(/ms:\s*([\d_]+),\s*max:\s*([\d_]+)/g)].map((x) => ({ ms: Number(x[1].replace(/_/g, '')), max: Number(x[2].replace(/_/g, '')) })) : [];
  if (!list.length) { console.warn('[proof/facts] could not read WINDOWS'); return [{ ms: 1_000, max: 100 }, { ms: 10_000, max: 500 }, { ms: 60_000, max: 2_000 }]; }
  return list;
})();

/** X text limits: standard and Premium accounts. */
export const X_STANDARD_MAX = num(TWITTER, /const STANDARD_MAX\s*=\s*([\d_]+)/, 280, 'X STANDARD_MAX');
export const X_PREMIUM_MAX = num(TWITTER, /const PREMIUM_MAX\s*=\s*([\d_]+)/, 25_000, 'X PREMIUM_MAX');
/** Bluesky's byte cap on post text. */
export const BLUESKY_MAX_BYTES = num(BLUESKY, /const TEXT_MAX_BYTES\s*=\s*([\d_]+)/, 3000, 'Bluesky TEXT_MAX_BYTES');

/** Open networks that give Siar no way to read recent posts, so an interrupted send is never re-sent on a guess. */
export const NO_LOOKUP: NetworkType[] = OPEN_ORDER.filter((t) => NETWORK_STATUS[t].status === 'open' && !ADAPTERS[t].recentPosts);
export const NO_LOOKUP_NAMES = NO_LOOKUP.map((t) => META[t].name);

/** "1 minute, 5 minutes, 30 minutes, 2 hours, …" */
export const duration = (min: number) => (min >= 60 ? `${min / 60} ${min === 60 ? 'hour' : 'hours'}` : `${min} ${min === 1 ? 'minute' : 'minutes'}`);
export const window = (ms: number) => (ms === 1000 ? 'second' : ms === 60_000 ? 'minute' : ms % 60_000 === 0 ? `${ms / 60_000} minutes` : `${ms / 1000} seconds`);

/** "a, b and c" */
export const and = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export const fmt = (n: number) => n.toLocaleString('en-US');

/** "12 November 2026" from an ISO date. */
export const human = (iso: string) => new Date(`${iso.slice(0, 10)}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** The day the network facts on these pages were last read on the networks' own pages. */
export const CHECKED = '2026-11-12';
