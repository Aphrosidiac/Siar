/**
 * Siar's business numbers for FF Analytics (FF Ops docs/ANALYTICS.md §4): signups by channel and landing page, the
 * funnel (signed up → connected an account → published a post → trial → paying), MRR and collected revenue, and the
 * staff sign-in IPs (FF Ops counts those visits as staff). The same rules as the Metrics report (metrics.ts):
 * staff and internal accounts are left out, plus any email domain FF Ops passes in `exclude`.
 *
 * Range: Malaysia calendar days, today included ("7 days" = today and the six days before), as FF Ops counts them.
 * Money is in minor units (cents) with its currency.
 */
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../platform/db.js';
import { staffIps } from './traffic/ingest.js';

const TZ = 'Asia/Kuala_Lumpur';
const n = (v: unknown) => Number(v ?? 0);
const DOMAIN = /^[a-z0-9.-]+\.[a-z]{2,}$/;

export function rangeFor(days: number, now = new Date()) {
  const d = Math.min(Math.max(Math.round(days) || 30, 1), 400);
  const today = new Date(now.getTime() + 8 * 3_600_000).toISOString().slice(0, 10);
  const from = new Date(new Date(`${today}T00:00:00+08:00`).getTime() - (d - 1) * 86_400_000);
  return { days: d, from, to: now };
}

/** Email domains to leave out, from FF Ops' ?exclude=a.com,b.com (anything that isn't a domain is dropped). */
export const excludeList = (raw: unknown) => String(raw ?? '').split(',').map((s) => s.trim().toLowerCase()).filter((s) => DOMAIN.test(s)).slice(0, 20);

export async function businessNumbers(opts: { days?: number; exclude?: string[]; now?: Date } = {}) {
  const { days, from, to } = rangeFor(opts.days ?? 30, opts.now);
  const extra = (opts.exclude ?? []).map((d) => `%@${d}`);
  const internal = Prisma.sql`(u.role = 'ADMIN' OR u.email ILIKE '%@siaran.my' OR u.email ILIKE '%@ffdev.studio'${extra.length ? Prisma.sql` OR u.email ILIKE ANY(${extra})` : Prisma.empty})`;

  const cohort = await prisma.$queryRaw<any[]>`
    SELECT u.id, u."signupChannel" AS channel, u."signupLanding" AS landing, u."signupRefHost" AS ref,
      EXISTS (SELECT 1 FROM "SocialAccount" sa JOIN "Team" t ON t.id = sa."teamId" WHERE t."organizationId" = o.id) AS connected,
      EXISTS (SELECT 1 FROM "Post" p WHERE p."organizationId" = o.id AND p.status = 'POSTED') AS posted,
      EXISTS (SELECT 1 FROM "Subscription" s WHERE s."organizationId" = o.id AND s.tier <> 'FREE' AND s.status IN ('active', 'past_due') AND (s."trialEnd" IS NULL OR s."trialEnd" < now())) AS paying,
      EXISTS (SELECT 1 FROM "Subscription" s WHERE s."organizationId" = o.id AND s.status = 'trialing') AS trialing
    FROM "User" u LEFT JOIN LATERAL (SELECT id FROM "Organization" WHERE "createdById" = u.id ORDER BY "createdAt" LIMIT 1) o ON true
    WHERE u."createdAt" >= ${from} AND u."createdAt" < ${to} AND u."deletedAt" IS NULL AND NOT ${internal}`;
  const daily = await prisma.$queryRaw<any[]>`
    SELECT (timezone(${TZ}, u."createdAt" AT TIME ZONE 'UTC'))::date AS day, count(*) AS signups
    FROM "User" u WHERE u."createdAt" >= ${from} AND u."createdAt" < ${to} AND u."deletedAt" IS NULL AND NOT ${internal}
    GROUP BY 1 ORDER BY 1`;
  const allTime = await prisma.$queryRaw<any[]>`SELECT count(*) AS users FROM "User" u WHERE u."deletedAt" IS NULL AND NOT ${internal}`;
  const subs = await prisma.$queryRaw<any[]>`
    SELECT s.tier, s.currency, s."billingInterval" AS interval, s.status, count(*) AS subs,
      sum(CASE WHEN s."billingInterval" = 'YEARLY' THEN s."unitAmountCents" / 12.0 ELSE s."unitAmountCents" END) AS mrr_cents
    FROM "Subscription" s JOIN "Organization" o ON o.id = s."organizationId" JOIN "User" u ON u.id = o."createdById"
    WHERE s.tier <> 'FREE' AND s.status IN ('active', 'past_due', 'trialing') AND NOT ${internal}
    GROUP BY 1, 2, 3, 4 ORDER BY 1`;
  const payments = await prisma.$queryRaw<any[]>`
    SELECT p.currency, p.purpose, count(*) AS payments, sum(p."amountCents") AS amount_cents
    FROM "BillingPayment" p JOIN "Organization" o ON o.id = p."organizationId" JOIN "User" u ON u.id = o."createdById"
    WHERE p.status = 'PAID' AND coalesce(p."settledAt", p."createdAt") >= ${from} AND coalesce(p."settledAt", p."createdAt") < ${to} AND NOT ${internal}
    GROUP BY 1, 2`;
  const churn = await prisma.$queryRaw<any[]>`
    SELECT count(*) FILTER (WHERE s."createdAt" >= ${from} AND s.tier <> 'FREE') AS started,
      count(*) FILTER (WHERE s."canceledAt" >= ${from} AND s."canceledAt" < ${to}) AS canceled,
      count(*) FILTER (WHERE s."cancelAtPeriodEnd") AS canceling
    FROM "Subscription" s JOIN "Organization" o ON o.id = s."organizationId" JOIN "User" u ON u.id = o."createdById" WHERE NOT ${internal}`;

  const by = (key: string) => {
    const m = new Map<string, { signups: number; activated: number; paying: number }>();
    for (const c of cohort) {
      const k = (c[key] as string | null) ?? 'Unknown';
      const v = m.get(k) ?? { signups: 0, activated: 0, paying: 0 };
      v.signups++; if (c.connected) v.activated++; if (c.paying) v.paying++;
      m.set(k, v);
    }
    return [...m].sort((a, b) => b[1].signups - a[1].signups).map(([name, v]) => ({ name, ...v }));
  };
  const count = (f: (c: any) => boolean) => cohort.filter(f).length;
  const signups = cohort.length;
  const mrr = new Map<string, number>();
  for (const r of subs) if (r.status !== 'trialing') mrr.set(r.currency, (mrr.get(r.currency) ?? 0) + n(r.mrr_cents));

  return {
    generatedAt: new Date().toISOString(),
    range: { from: from.toISOString(), to: to.toISOString(), days, timezone: TZ },
    signups,
    activated: count((c) => c.connected),
    activatedLabel: 'Connected an account',
    trialing: count((c) => c.trialing),
    paying: count((c) => c.paying),
    steps: [
      { label: 'Signed up', people: signups },
      { label: 'Connected an account', people: count((c) => c.connected) },
      { label: 'Published a post', people: count((c) => c.posted) },
      { label: 'On a trial', people: count((c) => c.trialing) },
      { label: 'Paying', people: count((c) => c.paying) },
    ],
    daily: daily.map((r) => ({ day: (r.day as Date).toISOString().slice(0, 10), signups: n(r.signups) })),
    byChannel: by('channel'),
    byLanding: by('landing'),
    byReferrer: by('ref'),
    allTimeCustomers: n(allTime[0]?.users),
    revenue: {
      mrr: [...mrr].map(([currency, cents]) => ({ currency: String(currency).toUpperCase(), amount: Math.round(cents) })),
      collected: payments.map((r) => ({ currency: String(r.currency).toUpperCase(), amount: n(r.amount_cents), payments: n(r.payments), purpose: r.purpose })),
      subscriptions: subs.map((r) => ({ plan: r.tier, currency: String(r.currency).toUpperCase(), interval: r.interval, status: r.status, count: n(r.subs), amount: Math.round(n(r.mrr_cents)) })),
      started: n(churn[0]?.started), canceled: n(churn[0]?.canceled), cancelingAtPeriodEnd: n(churn[0]?.canceling),
    },
    staffIps: [...(await staffIps())].slice(0, 200),
  };
}
