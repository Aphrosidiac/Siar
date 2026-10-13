import type { NetworkType } from '@siar/networks';
import type { Db } from '../platform/db.js';
import { quotaExceeded } from '../platform/errors.js';
import { PLANS, quotaPeriod, type Tier, utcDay } from './plans.js';

/**
 * Atomic counters. A quota is consumed with one conditional upsert:
 *   INSERT … ON CONFLICT DO UPDATE SET used = used + n WHERE used + n <= limit RETURNING used
 * No row returned = the limit would be crossed, and nothing was consumed. Two requests racing
 * for the last slot cannot both win (docs/PLAN.md §3 rule 4).
 */
async function consume(db: Db, table: 'UsageCounter' | 'DailyCounter' | 'AccountMonthCounter', keyCols: Record<string, string>, metric: string, n: number, limit: number) {
  if (n <= 0) return true;
  if (n > limit) return false;
  const cols = Object.keys(keyCols);
  const vals = Object.values(keyCols);
  const sql = `INSERT INTO "${table}" (${cols.map(c => `"${c}"`).join(', ')}, "metric", "used") VALUES (${cols.map((_, i) => `$${i + 1}`).join(', ')}, $${cols.length + 1}, $${cols.length + 2})
    ON CONFLICT (${cols.map(c => `"${c}"`).join(', ')}, "metric") DO UPDATE SET "used" = "${table}"."used" + EXCLUDED."used"
    WHERE "${table}"."used" + EXCLUDED."used" <= $${cols.length + 3} RETURNING "used"`;
  const rows = await db.$queryRawUnsafe<{ used: number }[]>(sql, ...vals, metric, n, limit);
  return rows.length > 0;
}

async function release(db: Db, table: 'UsageCounter' | 'DailyCounter' | 'AccountMonthCounter', keyCols: Record<string, string>, metric: string, n: number) {
  const cols = Object.keys(keyCols);
  await db.$executeRawUnsafe(`UPDATE "${table}" SET "used" = GREATEST(0, "used" - $${cols.length + 2}) WHERE ${cols.map((c, i) => `"${c}" = $${i + 1}`).join(' AND ')} AND "metric" = $${cols.length + 1}`, ...Object.values(keyCols), metric, n);
}

export type OrgMetric = 'posts' | 'comments' | 'uploads';
const ORG_LABEL: Record<OrgMetric, string> = { posts: 'Monthly post', comments: 'Monthly comment', uploads: 'Monthly upload' };
type OrgRef = { id: string; tier: Tier };

/** Free is a one-time allowance: when it runs out, the way on is a plan (no prices here: they depend on the billing country). */
const freeUsedUp = (metric: OrgMetric | 'imports' | 'reviews', limit: number) =>
  quotaExceeded(`You have used the ${limit.toLocaleString('en-US')} free ${metric} included with the Free plan. Choose Starter or start the 14-day Pro trial in Billing to keep going.`);

export async function consumeOrg(db: Db, org: OrgRef, metric: OrgMetric, n: number, limit: number, at = new Date()) {
  if (!(await consume(db, 'UsageCounter', { organizationId: org.id, period: quotaPeriod(org.tier, at) }, metric, n, limit))) {
    if (PLANS[org.tier].oneTime) throw freeUsedUp(metric, limit);
    throw quotaExceeded(`${ORG_LABEL[metric]} limit reached. Limit is ${limit.toLocaleString('en-US')} per month on your plan. Upgrade or wait for the next month (UTC).`);
  }
}
export const releaseOrg = (db: Db, org: OrgRef, metric: OrgMetric, n: number, at = new Date()) => release(db, 'UsageCounter', { organizationId: org.id, period: quotaPeriod(org.tier, at) }, metric, n);

export async function orgUsage(db: Db, org: OrgRef, metric: string, at = new Date()) {
  const r = await db.usageCounter.findUnique({ where: { organizationId_period_metric: { organizationId: org.id, period: quotaPeriod(org.tier, at), metric } } });
  return r?.used ?? 0;
}

/**
 * Free posts are also counted on every social account a post goes to, across organizations, so a
 * new organization that reconnects the same accounts does not get a fresh allowance.
 */
export async function consumeFreePosts(db: Db, keys: string[]) {
  const limit = PLANS.FREE.posts;
  for (const key of keys) {
    if (!(await consume(db, 'AccountMonthCounter', { accountKey: key, period: 'free' }, 'freePosts', 1, limit)))
      throw quotaExceeded(`This social account has already used the ${limit} free posts included with the Free plan (in this or another organization). Choose Starter or start the 14-day Pro trial in Billing to keep posting.`);
  }
}

/** Daily caps key on network + the connected user's id, so reconnecting/duplicating an account shares the cap. */
export const accountKey = (type: NetworkType | string, providerPageId: string | null, fallbackId: string) => `${type}:${providerPageId ?? fallbackId}`;

export async function consumeDaily(db: Db, key: string, metric: 'posts' | 'comments' | 'forcedPost' | 'forcedAccount', n: number, limit: number, day: Date, label: string) {
  if (!(await consume(db, 'DailyCounter', { accountKey: key, day: utcDay(day) }, metric, n, limit)))
    throw quotaExceeded(`${label} daily limit reached for this account on ${utcDay(day)} (UTC). Limit is ${limit} per day.`);
}
export const releaseDaily = (db: Db, key: string, metric: string, n: number, day: Date) => release(db, 'DailyCounter', { accountKey: key, day: utcDay(day) }, metric, n);
export async function dailyUsage(db: Db, key: string, metric: string, day: Date) {
  const r = await db.dailyCounter.findUnique({ where: { accountKey_day_metric: { accountKey: key, day: utcDay(day), metric } } });
  return r?.used ?? 0;
}

/** Per-account monthly counters (one-time on Free: pass the organization's tier). */
export async function consumeAccountMonth(db: Db, key: string, metric: 'imports' | 'reviews' | 'dms' | 'automationRuns', n: number, limit: number, label: string, tier?: Tier) {
  const oneTime = !!tier && PLANS[tier].oneTime;
  if (!(await consume(db, 'AccountMonthCounter', { accountKey: key, period: tier ? quotaPeriod(tier) : quotaPeriod('PRO') }, metric, n, limit))) {
    if (oneTime && (metric === 'imports' || metric === 'reviews')) throw freeUsedUp(metric, limit);
    throw quotaExceeded(`${label} limit reached for this account. Limit is ${limit} ${oneTime ? 'on the Free plan' : 'per month on your plan'}.`);
  }
}
export async function accountMonthUsage(db: Db, key: string, metric: string, tier?: Tier) {
  const r = await db.accountMonthCounter.findUnique({ where: { accountKey_period_metric: { accountKey: key, period: tier ? quotaPeriod(tier) : quotaPeriod('PRO'), metric } } });
  return r?.used ?? 0;
}
