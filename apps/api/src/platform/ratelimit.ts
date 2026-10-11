import { redis } from './redis.js';
import { logger } from './logger.js';

/**
 * Three windows at once (docs/reference pricing.md): 100/s, 500/10s, 2,000/min. A request must pass
 * all three. A verified API key gets one bucket per endpoint; sessions and the anonymous IP
 * fallback share one whole-app bucket per credential. Enterprise orgs multiply the limits.
 *
 * Fixed windows in Redis (INCR + PEXPIRE in one MULTI). If Redis is down we let traffic through
 * rather than take the API down with it — and log loudly.
 */
export const WINDOWS = [
  { ms: 1_000, max: 100 },
  { ms: 10_000, max: 500 },
  { ms: 60_000, max: 2_000 },
] as const;

export interface RateResult { ok: boolean; retryAfterMs: number; limit: number; remaining: number }

export async function hit(bucket: string, multiplier = 1): Promise<RateResult> {
  const now = Date.now();
  try {
    const m = redis.multi();
    for (const w of WINDOWS) {
      const k = `rl:${bucket}:${w.ms}:${Math.floor(now / w.ms)}`;
      m.incr(k).pexpire(k, w.ms + 1000);
    }
    const res = (await m.exec()) ?? [];
    let worst: RateResult = { ok: true, retryAfterMs: 0, limit: WINDOWS[2].max * multiplier, remaining: WINDOWS[2].max * multiplier };
    WINDOWS.forEach((w, i) => {
      const count = Number(res[i * 2]?.[1] ?? 0);
      const max = w.max * multiplier;
      if (count > max) {
        const retry = w.ms - (now % w.ms);
        if (worst.ok || retry > worst.retryAfterMs) worst = { ok: false, retryAfterMs: retry, limit: max, remaining: 0 };
      } else if (worst.ok && i === 2) worst = { ok: true, retryAfterMs: 0, limit: max, remaining: max - count };
    });
    return worst;
  } catch (err) {
    logger.error({ err }, 'rate limiter unavailable; allowing request');
    return { ok: true, retryAfterMs: 0, limit: 0, remaining: 0 };
  }
}
