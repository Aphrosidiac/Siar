/**
 * The one analytics report (docs/ANALYTICS.md). The staff Metrics page, GET /api/internal/metrics and the CLI
 * (`metrics-cli`) all read this, so a number means the same thing everywhere. Days are Malaysia days (UTC+8).
 *
 * People on the site: "human" = a page view whose JS beacon arrived (ran JavaScript, no webdriver);
 * "unconfirmed" = a browser User-Agent that never ran the beacon; "staff" = FF's own visits. Visitors are one
 * id per person per day, so a range's visitor count is the sum of daily visitors (a person on 3 days counts 3).
 * Signups, activation and revenue exclude staff and internal accounts (@siaran.my, @ffdev.studio).
 */
import { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../platform/db.js';
import { channelOf } from './traffic/channel.js';
import { KNOWN_BOTS } from './traffic/agents.js';

const TZ = 'Asia/Kuala_Lumpur';
const n = (v: unknown) => Number(v ?? 0);
// a constant, inlined: DISTINCT ON must see the same expression as ORDER BY (two bound parameters would differ)
const localDay = Prisma.raw(`(timezone('${TZ}', h.at AT TIME ZONE 'UTC'))::date`);
const INTERNAL_USER = Prisma.sql`(u.role = 'ADMIN' OR u.email ILIKE '%@siaran.my' OR u.email ILIKE '%@ffdev.studio')`;

/** Search terms the SEO plan targets (docs/seo/keyword-map.md); the report shows their position over time. */
export const TRACKED_QUERIES = [
  'social media api', 'unified social media api', 'social media posting api', 'social media scheduling api', 'social media management api',
  'ayrshare alternative', 'buffer api alternative', 'post to multiple social networks api', 'instagram posting api', 'tiktok posting api',
  'threads api', 'linkedin posting api', 'social media scheduler malaysia', 'social media management tool malaysia', 'siar', 'siaran',
];

export interface ReportOptions { days?: number; end?: Date }

export async function buildReport(opts: ReportOptions = {}) {
  const days = Math.min(Math.max(Math.round(opts.days ?? 30), 1), 400);
  const to = opts.end ?? new Date();
  const from = new Date(to.getTime() - days * 86_400_000);
  const range = Prisma.sql`h.at >= ${from} AND h.at < ${to}`;
  const site = Prisma.sql`h.host IN ('site', 'www')`;

  // ── sources ──
  const runs = await prisma.collectorRun.findMany();
  const coverage = await prisma.$queryRaw<{ first: Date | null; last: Date | null }[]>`SELECT min(at) AS first, max(at) AS last FROM "TrafficHit"`;

  // ── people on the site ──
  const people = await prisma.$queryRaw<any[]>`
    SELECT h.class, count(*) AS views, count(DISTINCT (h.visitor, ${localDay})) AS visitors
    FROM "TrafficHit" h WHERE ${range} AND ${site} AND h.kind = 'page' AND h.status < 400 AND h.class IN ('human', 'unconfirmed', 'staff', 'automation')
    GROUP BY h.class`;
  const byClass = Object.fromEntries(people.map((r) => [r.class, { views: n(r.views), visitors: n(r.visitors) }]));
  const daily = await prisma.$queryRaw<any[]>`
    SELECT ${localDay} AS day,
      count(*) FILTER (WHERE h.class = 'human') AS human_views,
      count(DISTINCT h.visitor) FILTER (WHERE h.class = 'human') AS human_visitors,
      count(*) FILTER (WHERE h.class = 'unconfirmed') AS unconfirmed_views,
      count(*) FILTER (WHERE h.class NOT IN ('human', 'unconfirmed', 'staff', 'internal')) AS bot_pages
    FROM "TrafficHit" h WHERE ${range} AND ${site} AND h.kind = 'page' AND h.status < 400
    GROUP BY 1 ORDER BY 1`;
  const topPages = await prisma.$queryRaw<any[]>`
    SELECT h.path, count(*) AS views, count(DISTINCT (h.visitor, ${localDay})) AS visitors
    FROM "TrafficHit" h WHERE ${range} AND ${site} AND h.kind = 'page' AND h.class = 'human' AND h.status < 400
    GROUP BY 1 ORDER BY 2 DESC LIMIT 25`;
  // a visit's source: the first beacon of each visitor-day (it carries the referrer host and UTM tags)
  const entries = await prisma.$queryRaw<any[]>`
    SELECT DISTINCT ON (h.visitor, ${localDay}) h.data->>'r' AS r, h.data->>'us' AS us, h.data->>'p' AS p, h.data->>'device' AS device, h.country, h.agent
    FROM "TrafficHit" h WHERE ${range} AND ${site} AND h.kind = 'beacon' AND h.class = 'human'
    ORDER BY h.visitor, ${localDay}, h.at`;
  const tally = (pick: (e: any) => string | null | undefined) => {
    const m = new Map<string, number>();
    for (const e of entries) { const k = pick(e) || 'Unknown'; m.set(k, (m.get(k) ?? 0) + 1); }
    return [...m].sort((a, b) => b[1] - a[1]).map(([name, visits]) => ({ name, visits }));
  };
  const unconfirmedPages = await prisma.$queryRaw<any[]>`
    SELECT h.path, h.agent, count(*) AS views FROM "TrafficHit" h
    WHERE ${range} AND ${site} AND h.kind = 'page' AND h.class = 'unconfirmed' GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 15`;
  const humanErrors = await prisma.$queryRaw<any[]>`
    SELECT h.path, h.status, count(*) AS hits FROM "TrafficHit" h
    WHERE ${range} AND ${site} AND h.kind = 'page' AND h.class IN ('human', 'unconfirmed') AND h.status >= 400 GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 15`;

  // ── bots, every host ──
  const botClasses = await prisma.$queryRaw<any[]>`
    SELECT h.class, count(*) AS requests, count(*) FILTER (WHERE h.kind = 'page') AS pages, count(DISTINCT h.ip) AS ips
    FROM "TrafficHit" h WHERE ${range} AND h.class NOT IN ('human', 'unconfirmed', 'staff', 'internal') GROUP BY 1 ORDER BY 2 DESC`;
  const botAgents = await prisma.$queryRaw<any[]>`
    SELECT h.agent, h.class, h.verified, count(*) AS requests, count(*) FILTER (WHERE h.kind = 'page') AS pages,
      count(*) FILTER (WHERE h.kind = 'file') AS files, count(DISTINCT h.path) AS distinct_paths, max(h.at) AS last_seen
    FROM "TrafficHit" h WHERE ${range} AND h.class IN ('search-bot', 'ai-bot', 'other-bot', 'impostor', 'monitor', 'tool', 'automation', 'datacenter')
    GROUP BY 1, 2, 3 ORDER BY 4 DESC LIMIT 60`;
  const aiPaths = await prisma.$queryRaw<any[]>`
    SELECT h.agent, h.path, count(*) AS hits FROM "TrafficHit" h
    WHERE ${range} AND h.class IN ('ai-bot', 'search-bot') AND h.kind IN ('page', 'file') GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 80`;
  const impostors = await prisma.$queryRaw<any[]>`
    SELECT h.agent, count(*) AS requests, count(DISTINCT h.ip) AS ips, (array_agg(DISTINCT h.ip))[1:5] AS sample_ips
    FROM "TrafficHit" h WHERE ${range} AND h.class = 'impostor' GROUP BY 1 ORDER BY 2 DESC LIMIT 20`;
  const scanners = await prisma.$queryRaw<any[]>`
    SELECT h.path, count(*) AS hits, count(DISTINCT h.ip) AS ips FROM "TrafficHit" h
    WHERE ${range} AND h.class = 'scanner' GROUP BY 1 ORDER BY 2 DESC LIMIT 15`;
  const botErrors = await prisma.$queryRaw<any[]>`
    SELECT h.path, h.status, count(*) AS hits FROM "TrafficHit" h
    WHERE ${range} AND ${site} AND h.class IN ('search-bot', 'ai-bot') AND h.status >= 400 GROUP BY 1, 2 ORDER BY 3 DESC LIMIT 15`;
  const volume = await prisma.$queryRaw<any[]>`
    SELECT host, class, sum(requests) AS requests FROM "TrafficDaily"
    WHERE date >= ${from}::date AND date <= ${to}::date GROUP BY 1, 2 ORDER BY 1, 3 DESC`;

  // ── signups, activation, paying (customers only) ──
  const funnelDaily = await prisma.$queryRaw<any[]>`
    SELECT (timezone(${TZ}, u."createdAt" AT TIME ZONE 'UTC'))::date AS day, count(*) AS signups
    FROM "User" u WHERE u."createdAt" >= ${from} AND u."createdAt" < ${to} AND u."deletedAt" IS NULL AND NOT ${INTERNAL_USER}
    GROUP BY 1 ORDER BY 1`;
  const cohort = await prisma.$queryRaw<any[]>`
    SELECT u.id, u."createdAt", u."signupChannel" AS channel, u."signupLanding" AS landing, u."signupRefHost" AS ref,
      EXISTS (SELECT 1 FROM "SocialAccount" sa JOIN "Team" t ON t.id = sa."teamId" WHERE t."organizationId" = o.id) AS connected,
      EXISTS (SELECT 1 FROM "Post" p WHERE p."organizationId" = o.id AND p.status = 'POSTED') AS posted,
      EXISTS (SELECT 1 FROM "Subscription" s WHERE s."organizationId" = o.id AND s.tier <> 'FREE' AND s.status IN ('active', 'past_due') AND (s."trialEnd" IS NULL OR s."trialEnd" < now())) AS paying,
      EXISTS (SELECT 1 FROM "Subscription" s WHERE s."organizationId" = o.id AND s.status = 'trialing') AS trialing
    FROM "User" u LEFT JOIN LATERAL (SELECT id FROM "Organization" WHERE "createdById" = u.id ORDER BY "createdAt" LIMIT 1) o ON true
    WHERE u."createdAt" >= ${from} AND u."createdAt" < ${to} AND u."deletedAt" IS NULL AND NOT ${INTERNAL_USER}`;
  const allTime = await prisma.$queryRaw<any[]>`
    SELECT count(*) AS users FROM "User" u WHERE u."deletedAt" IS NULL AND NOT ${INTERNAL_USER}`;
  const by = (key: string) => {
    const m = new Map<string, { signups: number; connected: number; posted: number; paying: number }>();
    for (const c of cohort) {
      const k = (c[key] as string | null) ?? 'Unknown (no first-visit cookie)';
      const v = m.get(k) ?? { signups: 0, connected: 0, posted: 0, paying: 0 };
      v.signups++; if (c.connected) v.connected++; if (c.posted) v.posted++; if (c.paying) v.paying++;
      m.set(k, v);
    }
    return [...m].sort((a, b) => b[1].signups - a[1].signups).map(([name, v]) => ({ name, ...v }));
  };

  // ── revenue ──
  const subs = await prisma.$queryRaw<any[]>`
    SELECT s.tier, s.currency, s."billingInterval" AS interval, s.status, count(*) AS subs,
      sum(CASE WHEN s."billingInterval" = 'YEARLY' THEN s."unitAmountCents" / 12.0 ELSE s."unitAmountCents" END) AS mrr_cents
    FROM "Subscription" s JOIN "Organization" o ON o.id = s."organizationId" JOIN "User" u ON u.id = o."createdById"
    WHERE s.tier <> 'FREE' AND s.status IN ('active', 'past_due', 'trialing') AND NOT ${INTERNAL_USER}
    GROUP BY 1, 2, 3, 4 ORDER BY 1`;
  const payments = await prisma.$queryRaw<any[]>`
    SELECT p.currency, p.purpose, count(*) AS payments, sum(p."amountCents") AS amount_cents
    FROM "BillingPayment" p JOIN "Organization" o ON o.id = p."organizationId" JOIN "User" u ON u.id = o."createdById"
    WHERE p.status = 'PAID' AND coalesce(p."settledAt", p."createdAt") >= ${from} AND coalesce(p."settledAt", p."createdAt") < ${to} AND NOT ${INTERNAL_USER}
    GROUP BY 1, 2`;
  const churn = await prisma.$queryRaw<any[]>`
    SELECT count(*) FILTER (WHERE s."createdAt" >= ${from} AND s.tier <> 'FREE') AS started,
      count(*) FILTER (WHERE s."canceledAt" >= ${from} AND s."canceledAt" < ${to}) AS canceled,
      count(*) FILTER (WHERE s."cancelAtPeriodEnd") AS canceling
    FROM "Subscription" s JOIN "Organization" o ON o.id = s."organizationId" JOIN "User" u ON u.id = o."createdById" WHERE NOT ${INTERNAL_USER}`;

  // ── search ──
  const search = async (engine: string) => {
    const totals = await prisma.$queryRaw<any[]>`
      SELECT date, clicks, impressions, position FROM "SearchDaily" WHERE engine = ${engine} AND query = '*' AND page = '*' AND date >= ${from}::date ORDER BY date`;
    const queries = await prisma.$queryRaw<any[]>`
      SELECT query, sum(clicks) AS clicks, sum(impressions) AS impressions, sum(position * impressions) / nullif(sum(impressions), 0) AS position
      FROM "SearchDaily" WHERE engine = ${engine} AND query <> '*' AND date >= ${from}::date GROUP BY 1 ORDER BY 3 DESC LIMIT 30`;
    const pages = await prisma.$queryRaw<any[]>`
      SELECT page, sum(clicks) AS clicks, sum(impressions) AS impressions, sum(position * impressions) / nullif(sum(impressions), 0) AS position
      FROM "SearchDaily" WHERE engine = ${engine} AND query = '*' AND page <> '*' AND date >= ${from}::date GROUP BY 1 ORDER BY 3 DESC LIMIT 30`;
    const tracked = await prisma.$queryRaw<any[]>`
      SELECT query, sum(clicks) AS clicks, sum(impressions) AS impressions, sum(position * impressions) / nullif(sum(impressions), 0) AS position
      FROM "SearchDaily" WHERE engine = ${engine} AND lower(query) IN (${Prisma.join(TRACKED_QUERIES)}) AND date >= ${from}::date GROUP BY 1`;
    const sum = (k: string) => totals.reduce((a, r) => a + n(r[k]), 0);
    const impressions = sum('impressions');
    return {
      clicks: sum('clicks'), impressions, ctr: impressions ? sum('clicks') / impressions : 0,
      position: engine === 'google' && impressions ? totals.reduce((a, r) => a + n(r.position) * n(r.impressions), 0) / impressions : null,
      daily: totals.map((r) => ({ day: r.date.toISOString().slice(0, 10), clicks: n(r.clicks), impressions: n(r.impressions) })),
      queries: queries.map((r) => ({ query: r.query, clicks: n(r.clicks), impressions: n(r.impressions), position: r.position == null ? null : +n(r.position).toFixed(1) })),
      pages: pages.map((r) => ({ page: r.page, clicks: n(r.clicks), impressions: n(r.impressions), position: r.position == null ? null : +n(r.position).toFixed(1) })),
      tracked: TRACKED_QUERIES.map((q) => { const r = tracked.find((t) => t.query.toLowerCase() === q); return { query: q, clicks: n(r?.clicks), impressions: n(r?.impressions), position: r?.position == null ? null : +n(r.position).toFixed(1) }; }),
    };
  };

  const purposeOf = (agent: string | null) => KNOWN_BOTS.find((b) => b.name === agent)?.purpose ?? null;
  const ownerOf = (agent: string | null) => KNOWN_BOTS.find((b) => b.name === agent)?.owner ?? null;
  const visitsFrom = tally((e) => channelOf(e.r, e.us));

  return {
    range: { from: from.toISOString(), to: to.toISOString(), days, timezone: TZ },
    generatedAt: new Date().toISOString(),
    sources: {
      trafficLogFrom: coverage[0]?.first?.toISOString() ?? null, trafficLogTo: coverage[0]?.last?.toISOString() ?? null,
      collectors: runs.map((r) => ({ id: r.id, ok: r.ok, ranAt: r.ranAt.toISOString(), rows: r.rows, detail: r.detail })),
    },
    people: {
      human: byClass.human ?? { views: 0, visitors: 0 },
      unconfirmed: byClass.unconfirmed ?? { views: 0, visitors: 0 },
      staff: byClass.staff ?? { views: 0, visitors: 0 },
      automation: byClass.automation ?? { views: 0, visitors: 0 },
      daily: daily.map((r) => ({ day: r.day.toISOString().slice(0, 10), humanViews: n(r.human_views), humanVisitors: n(r.human_visitors), unconfirmedViews: n(r.unconfirmed_views), botPages: n(r.bot_pages) })),
      topPages: topPages.map((r) => ({ path: r.path, views: n(r.views), visitors: n(r.visitors) })),
      channels: visitsFrom,
      referrers: tally((e) => e.r || null).filter((r) => r.name !== 'Unknown'),
      landingPages: tally((e) => e.p),
      countries: tally((e) => e.country),
      devices: tally((e) => e.device),
      browsers: tally((e) => e.agent),
      unconfirmedPages: unconfirmedPages.map((r) => ({ path: r.path, agent: r.agent, views: n(r.views) })),
      errors: humanErrors.map((r) => ({ path: r.path, status: r.status, hits: n(r.hits) })),
    },
    bots: {
      byClass: botClasses.map((r) => ({ class: r.class, requests: n(r.requests), pages: n(r.pages), ips: n(r.ips) })),
      agents: botAgents.map((r) => ({ agent: r.agent, owner: ownerOf(r.agent), purpose: purposeOf(r.agent), class: r.class, verified: r.verified, requests: n(r.requests), pages: n(r.pages), files: n(r.files), distinctPaths: n(r.distinct_paths), lastSeen: r.last_seen?.toISOString() ?? null })),
      crawledPaths: aiPaths.map((r) => ({ agent: r.agent, path: r.path, hits: n(r.hits) })),
      impostors: impostors.map((r) => ({ claimed: r.agent, requests: n(r.requests), ips: n(r.ips), sampleIps: r.sample_ips ?? [] })),
      scannerPaths: scanners.map((r) => ({ path: r.path, hits: n(r.hits), ips: n(r.ips) })),
      crawlErrors: botErrors.map((r) => ({ path: r.path, status: r.status, hits: n(r.hits) })),
      volumeByHost: volume.map((r) => ({ host: r.host, class: r.class, requests: n(r.requests) })),
    },
    funnel: {
      allTimeCustomers: n(allTime[0]?.users),
      signups: cohort.length,
      connectedAccount: cohort.filter((c) => c.connected).length,
      publishedPost: cohort.filter((c) => c.posted).length,
      trialing: cohort.filter((c) => c.trialing).length,
      paying: cohort.filter((c) => c.paying).length,
      daily: funnelDaily.map((r) => ({ day: r.day.toISOString().slice(0, 10), signups: n(r.signups) })),
      byChannel: by('channel'),
      byLanding: by('landing'),
      byReferrer: by('ref'),
    },
    revenue: {
      subscriptions: subs.map((r) => ({ tier: r.tier, currency: r.currency, interval: r.interval, status: r.status, subs: n(r.subs), mrrCents: Math.round(n(r.mrr_cents)) })),
      mrrByCurrency: Object.entries(subs.filter((r) => r.status !== 'trialing').reduce<Record<string, number>>((a, r) => ({ ...a, [r.currency]: (a[r.currency] ?? 0) + n(r.mrr_cents) }), {})).map(([currency, cents]) => ({ currency, mrrCents: Math.round(cents) })),
      payments: payments.map((r) => ({ currency: r.currency, purpose: r.purpose, payments: n(r.payments), amountCents: n(r.amount_cents) })),
      started: n(churn[0]?.started), canceled: n(churn[0]?.canceled), cancelingAtPeriodEnd: n(churn[0]?.canceling),
    },
    search: { google: await search('google'), bing: await search('bing') },
    ai: {
      crawlers: botAgents.filter((r) => r.class === 'ai-bot').map((r) => ({ agent: r.agent, owner: ownerOf(r.agent), purpose: purposeOf(r.agent), verified: r.verified, requests: n(r.requests), pages: n(r.pages) })),
      visitsFromAssistants: visitsFrom.find((c) => c.name === 'AI assistant')?.visits ?? 0,
      signupsFromAssistants: cohort.filter((c) => c.channel === 'AI assistant').length,
      note: 'Copilot and Bing AI citations: Bing Webmaster Tools → AI Performance (no API).',
    },
  };
}

export type Report = Awaited<ReturnType<typeof buildReport>>;

// ── markdown, for reading in a terminal or a chat ──
const fmt = (v: number) => v.toLocaleString('en-US');
const money = (cents: number, cur: string) => `${cur.toUpperCase() === 'MYR' ? 'RM' : '$'}${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
const table = (head: string[], rows: (string | number | null | undefined)[][]) =>
  rows.length ? [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`, ...rows.map((r) => `| ${r.map((c) => (c == null ? '' : typeof c === 'number' ? fmt(c) : String(c).replace(/\|/g, '/'))).join(' | ')} |`)].join('\n') : '_none_';

export function reportMarkdown(r: Report) {
  const p = r.people;
  const L: string[] = [];
  L.push(`# Siar metrics: last ${r.range.days} days`, '', `${r.range.from.slice(0, 10)} to ${r.range.to.slice(0, 16).replace('T', ' ')} UTC, days in ${r.range.timezone}. Generated ${r.generatedAt.slice(0, 16).replace('T', ' ')} UTC.`, '');
  L.push('## Sources', '', `Traffic log covers ${r.sources.trafficLogFrom?.slice(0, 16) ?? 'nothing yet'} to ${r.sources.trafficLogTo?.slice(0, 16) ?? '-'}.`, '',
    table(['Collector', 'OK', 'Last run (UTC)', 'Rows', 'Detail'], r.sources.collectors.map((c) => [c.id, c.ok ? 'yes' : 'NO', c.ranAt.slice(0, 16), c.rows, (c.detail ?? '').slice(0, 120)])), '');
  L.push('## People on siaran.my', '',
    table(['Who', 'Page views', 'Visitors (daily, summed)'], [
      ['Humans (ran the beacon)', p.human.views, p.human.visitors], ['Unconfirmed browsers (no JS ran)', p.unconfirmed.views, p.unconfirmed.visitors],
      ['Automation (webdriver or page flood)', p.automation.views, p.automation.visitors], ['Staff (FF)', p.staff.views, p.staff.visitors]]), '',
    '### Per day', '', table(['Day', 'Human views', 'Human visitors', 'Unconfirmed', 'Bot page hits'], p.daily.map((d) => [d.day, d.humanViews, d.humanVisitors, d.unconfirmedViews, d.botPages])), '',
    '### Top pages (humans)', '', table(['Page', 'Views', 'Visitors'], p.topPages.map((x) => [x.path, x.views, x.visitors])), '',
    '### Where visits came from', '', table(['Channel', 'Visits'], p.channels.map((x) => [x.name, x.visits])), '',
    '### Referrers', '', table(['Site', 'Visits'], p.referrers.slice(0, 15).map((x) => [x.name, x.visits])), '',
    '### Landing pages', '', table(['Page', 'Visits'], p.landingPages.slice(0, 15).map((x) => [x.name, x.visits])), '',
    '### Countries, devices, browsers', '', table(['Country', 'Visits'], p.countries.slice(0, 10).map((x) => [x.name, x.visits])), '', table(['Device', 'Visits'], p.devices.map((x) => [x.name, x.visits])), '', table(['Browser', 'Visits'], p.browsers.slice(0, 8).map((x) => [x.name, x.visits])), '',
    '### Unconfirmed browser hits (no JavaScript ran)', '', table(['Page', 'Browser claimed', 'Hits'], p.unconfirmedPages.map((x) => [x.path, x.agent, x.views])), '',
    '### Errors people hit', '', table(['Page', 'Status', 'Hits'], p.errors.map((x) => [x.path, x.status, x.hits])), '');
  const b = r.bots;
  L.push('## Bots (all hosts)', '', table(['Class', 'Requests', 'Page hits', 'IPs'], b.byClass.map((x) => [x.class, x.requests, x.pages, x.ips])), '',
    '### By crawler', '', table(['Agent', 'Owner', 'Class', 'Purpose', 'Verified', 'Requests', 'Pages', 'robots/sitemap/llms', 'Last seen (UTC)'], b.agents.map((x) => [x.agent, x.owner, x.class, x.purpose, x.verified, x.requests, x.pages, x.files, x.lastSeen?.slice(0, 16)])), '',
    '### What search and AI crawlers read', '', table(['Agent', 'Path', 'Hits'], b.crawledPaths.slice(0, 40).map((x) => [x.agent, x.path, x.hits])), '',
    '### Impostors (claimed a crawler, failed verification)', '', table(['Claimed', 'Requests', 'IPs', 'Sample IPs'], b.impostors.map((x) => [x.claimed, x.requests, x.ips, x.sampleIps.join(' ')])), '',
    '### Scanner paths', '', table(['Path', 'Hits', 'IPs'], b.scannerPaths.map((x) => [x.path, x.hits, x.ips])), '',
    '### Errors crawlers hit', '', table(['Path', 'Status', 'Hits'], b.crawlErrors.map((x) => [x.path, x.status, x.hits])), '');
  const f = r.funnel;
  const pct = (a: number, z: number) => (z ? `${Math.round((a / z) * 100)}%` : '-');
  L.push('## Signups to paying (customers only)', '',
    table(['Step', 'People', 'Of signups'], [['Signed up', f.signups, ''], ['Connected an account', f.connectedAccount, pct(f.connectedAccount, f.signups)], ['Published a post', f.publishedPost, pct(f.publishedPost, f.signups)], ['On a trial', f.trialing, pct(f.trialing, f.signups)], ['Paying', f.paying, pct(f.paying, f.signups)]]),
    '', `All-time customer accounts: ${fmt(f.allTimeCustomers)}.`, '',
    '### Signups by channel', '', table(['Channel', 'Signups', 'Connected', 'Posted', 'Paying'], f.byChannel.map((x) => [x.name, x.signups, x.connected, x.posted, x.paying])), '',
    '### Signups by landing page', '', table(['Landing page', 'Signups', 'Connected', 'Posted', 'Paying'], f.byLanding.map((x) => [x.name, x.signups, x.connected, x.posted, x.paying])), '');
  const rv = r.revenue;
  L.push('## Revenue', '', `MRR: ${rv.mrrByCurrency.map((m) => money(m.mrrCents, m.currency)).join(' + ') || 'none'}. Started in range: ${rv.started}. Canceled in range: ${rv.canceled}. Canceling at period end: ${rv.cancelingAtPeriodEnd}.`, '',
    table(['Plan', 'Currency', 'Interval', 'Status', 'Subscriptions', 'Monthly value'], rv.subscriptions.map((s) => [s.tier, s.currency, s.interval, s.status, s.subs, money(s.mrrCents, s.currency)])), '',
    table(['Currency', 'Purpose', 'Payments', 'Collected'], rv.payments.map((x) => [x.currency, x.purpose, x.payments, money(x.amountCents, x.currency)])), '');
  for (const [name, s] of [['Google', r.search.google], ['Bing', r.search.bing]] as const) {
    L.push(`## ${name} search`, '', `Clicks ${fmt(s.clicks)}, impressions ${fmt(s.impressions)}, CTR ${(s.ctr * 100).toFixed(1)}%${s.position ? `, average position ${s.position.toFixed(1)}` : ''}.`, '',
      '### Queries', '', table(['Query', 'Clicks', 'Impressions', 'Position'], s.queries.slice(0, 20).map((x) => [x.query, x.clicks, x.impressions, x.position])), '',
      '### Pages', '', table(['Page', 'Clicks', 'Impressions', 'Position'], s.pages.slice(0, 20).map((x) => [x.page.replace('https://siaran.my', ''), x.clicks, x.impressions, x.position])), '',
      '### Target keywords', '', table(['Query', 'Clicks', 'Impressions', 'Position'], s.tracked.map((x) => [x.query, x.clicks, x.impressions, x.position ?? 'not ranking'])), '');
  }
  L.push('## AI', '', `Visits from AI assistants: ${r.ai.visitsFromAssistants}. Signups from AI assistants: ${r.ai.signupsFromAssistants}. ${r.ai.note}`, '',
    table(['Crawler', 'Owner', 'Purpose', 'Verified', 'Requests', 'Pages'], r.ai.crawlers.map((x) => [x.agent, x.owner, x.purpose, x.verified, x.requests, x.pages])), '');
  return L.join('\n');
}
