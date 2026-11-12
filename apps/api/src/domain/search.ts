/**
 * Search performance from Google Search Console and Bing Webmaster Tools into SearchDaily (docs/ANALYTICS.md).
 * Rows: query '*' + page '*' = the day's total; query '*' + a page = that page; a query + page '*' = that query
 * (Bing) or a query + page pair (Google). Google hides rare queries in per-query rows, so totals come from their
 * own request and never from summing queries.
 *
 * Google: a service account with read access to the property (GSC_SERVICE_ACCOUNT_JSON), Search Analytics API,
 * the last 16 days re-read every run (fresh days are revised). Bing: API key (BING_WEBMASTER_API_KEY),
 * GetRankAndTrafficStats (daily totals), GetQueryStats and GetPageStats (Bing updates these weekly).
 */
import { createSign } from 'node:crypto';
import { prisma } from '../platform/db.js';
import { config } from '../platform/config.js';
import { logger } from '../platform/logger.js';

const day = (d: Date) => d.toISOString().slice(0, 10);

async function upsertRows(engine: string, rows: { date: string; query: string; page: string; clicks: number; impressions: number; position: number }[]) {
  for (let i = 0; i < rows.length; i += 500) {
    const chunk = rows.slice(i, i + 500);
    await prisma.$transaction(chunk.map((r) => prisma.searchDaily.upsert({
      where: { engine_date_query_page: { engine, date: new Date(`${r.date}T00:00:00Z`), query: r.query.slice(0, 300), page: r.page.slice(0, 500) } },
      create: { engine, date: new Date(`${r.date}T00:00:00Z`), query: r.query.slice(0, 300), page: r.page.slice(0, 500), clicks: r.clicks, impressions: r.impressions, position: r.position },
      update: { clicks: r.clicks, impressions: r.impressions, position: r.position },
    })));
  }
  return rows.length;
}

async function record(id: string, ok: boolean, rows: number, detail: string) {
  await prisma.collectorRun.upsert({ where: { id }, create: { id, ok, rows, detail }, update: { ok, rows, detail: detail.slice(0, 500), ranAt: new Date() } });
}

// ── Google ────────────────────────────────────────────────────────────────────────────────────────────

function serviceAccount() {
  const raw = config.GSC_SERVICE_ACCOUNT_JSON.trim();
  if (!raw) return null;
  const json = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  const j = JSON.parse(json);
  return { email: j.client_email as string, key: j.private_key as string };
}

async function googleToken(sa: { email: string; key: string }) {
  const b64 = (o: object | string) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const unsigned = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({ iss: sa.email, scope: 'https://www.googleapis.com/auth/webmasters.readonly', aud: 'https://oauth2.googleapis.com/token', iat: now, exp: now + 3600 })}`;
  const sig = createSign('RSA-SHA256').update(unsigned).sign(sa.key).toString('base64url');
  const r = await fetch('https://oauth2.googleapis.com/token', { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${unsigned}.${sig}` }) });
  const j: any = await r.json();
  if (!r.ok) throw new Error(`google token ${r.status}: ${j.error_description ?? j.error ?? ''}`);
  return j.access_token as string;
}

async function gscQuery(token: string, body: object) {
  const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(config.GSC_PROPERTY)}/searchAnalytics/query`;
  const out: any[] = [];
  for (let startRow = 0; ; startRow += 25000) {
    const r = await fetch(url, { method: 'POST', headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' }, body: JSON.stringify({ ...body, rowLimit: 25000, startRow, dataState: 'all' }) });
    const j: any = await r.json();
    if (!r.ok) throw new Error(`search console ${r.status}: ${j.error?.message ?? ''}`);
    out.push(...(j.rows ?? []));
    if ((j.rows ?? []).length < 25000) return out;
  }
}

export async function pullGoogle(days = 16) {
  const sa = serviceAccount();
  if (!sa) { await record('search:google', false, 0, 'not configured: set GSC_SERVICE_ACCOUNT_JSON'); return { skipped: 'not configured' }; }
  try {
    const token = await googleToken(sa);
    const endDate = day(new Date());
    const startDate = day(new Date(Date.now() - days * 86_400_000));
    const base = { startDate, endDate, type: 'web' };
    const [totals, pages, pairs] = await Promise.all([
      gscQuery(token, { ...base, dimensions: ['date'] }),
      gscQuery(token, { ...base, dimensions: ['date', 'page'] }),
      gscQuery(token, { ...base, dimensions: ['date', 'query', 'page'] }),
    ]);
    const m = (r: any, query: string, page: string) => ({ date: r.keys[0], query, page, clicks: r.clicks, impressions: r.impressions, position: r.position });
    const n = await upsertRows('google', [
      ...totals.map((r) => m(r, '*', '*')),
      ...pages.map((r) => m(r, '*', r.keys[1])),
      ...pairs.map((r) => m(r, r.keys[1], r.keys[2])),
    ]);
    await record('search:google', true, n, `${startDate}..${endDate}`);
    return { rows: n };
  } catch (err) {
    logger.warn({ err }, 'google search pull failed');
    await record('search:google', false, 0, String(err));
    return { error: String(err) };
  }
}

// ── Bing ──────────────────────────────────────────────────────────────────────────────────────────────

/** Bing's WCF JSON dates: "/Date(1316156400000-0700)/". */
const bingDate = (v: string) => { const ms = Number(String(v).match(/\/Date\((-?\d+)/)?.[1]); return Number.isFinite(ms) ? day(new Date(ms)) : null; };

async function bing(method: string) {
  const url = `https://ssl.bing.com/webmaster/api.svc/json/${method}?siteUrl=${encodeURIComponent(config.BING_SITE_URL)}&apikey=${encodeURIComponent(config.BING_WEBMASTER_API_KEY)}`;
  const r = await fetch(url, { headers: { 'content-type': 'application/json; charset=utf-8' } });
  const text = await r.text();
  if (!r.ok) throw new Error(`bing ${method} ${r.status}: ${text.slice(0, 200)}`);
  return (JSON.parse(text).d ?? []) as any[];
}

export async function pullBing() {
  if (!config.BING_WEBMASTER_API_KEY) { await record('search:bing', false, 0, 'not configured: set BING_WEBMASTER_API_KEY'); return { skipped: 'not configured' }; }
  try {
    const [traffic, queries, pages] = await Promise.all([bing('GetRankAndTrafficStats'), bing('GetQueryStats'), bing('GetPageStats')]);
    const rows: any[] = [];
    for (const r of traffic) { const d = bingDate(r.Date); if (d) rows.push({ date: d, query: '*', page: '*', clicks: r.Clicks ?? 0, impressions: r.Impressions ?? 0, position: 0 }); }
    for (const r of queries) { const d = bingDate(r.Date); if (d && r.Query) rows.push({ date: d, query: r.Query, page: '*', clicks: r.Clicks ?? 0, impressions: r.Impressions ?? 0, position: r.AvgImpressionPosition ?? 0 }); }
    for (const r of pages) { const d = bingDate(r.Date); const page = r.Page ?? r.Query; if (d && page) rows.push({ date: d, query: '*', page, clicks: r.Clicks ?? 0, impressions: r.Impressions ?? 0, position: r.AvgImpressionPosition ?? 0 }); }
    const n = await upsertRows('bing', rows);
    await record('search:bing', true, n, `${traffic.length} days, ${queries.length} query rows, ${pages.length} page rows`);
    return { rows: n };
  } catch (err) {
    logger.warn({ err }, 'bing search pull failed');
    await record('search:bing', false, 0, String(err));
    return { error: String(err) };
  }
}
