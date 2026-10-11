import type { NetworkType } from '@siar/networks';
import type { Db } from '../platform/db.js';
import { quotaExceeded } from '../platform/errors.js';
import { period, utcDay } from './plans.js';

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

export async function consumeOrg(db: Db, organizationId: string, metric: OrgMetric, n: number, limit: number, at = new Date()) {
  if (!(await consume(db, 'UsageCounter', { organizationId, period: period(at) }, metric, n, limit)))
    throw quotaExceeded(`${ORG_LABEL[metric]} limit reached. Limit is ${limit.toLocaleString('en-US')} per month on your plan. Upgrade or wait for the next month (UTC).`);
}
export const releaseOrg = (db: Db, organizationId: string, metric: OrgMetric, n: number, at = new Date()) => release(db, 'UsageCounter', { organizationId, period: period(at) }, metric, n);

export async function orgUsage(db: Db, organizationId: string, metric: string, at = new Date()) {
  const r = await db.usageCounter.findUnique({ where: { organizationId_period_metric: { organizationId, period: period(at), metric } } });
  return r?.used ?? 0;
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

export async function consumeAccountMonth(db: Db, key: string, metric: 'imports' | 'reviews' | 'dms' | 'automationRuns', n: number, limit: number, label: string, at = new Date()) {
  if (!(await consume(db, 'AccountMonthCounter', { accountKey: key, period: period(at) }, metric, n, limit)))
    throw quotaExceeded(`${label} limit reached for this account. Limit is ${limit} per month on your plan.`);
}
export async function accountMonthUsage(db: Db, key: string, metric: string, at = new Date()) {
  const r = await db.accountMonthCounter.findUnique({ where: { accountKey_period_metric: { accountKey: key, period: period(at), metric } } });
  return r?.used ?? 0;
}
