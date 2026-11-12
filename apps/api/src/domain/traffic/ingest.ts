/**
 * Reads nginx's analytics log (one JSON line per request, deploy/nginx/siar.conf `siar_json`), classifies every
 * request and stores it. Runs every 10 minutes (modules/metrics.ts) and is safe to run twice: a cursor (inode +
 * byte offset) records how far it got, and it follows logrotate's rename to `<file>.1`.
 *
 * How a request becomes "human" (docs/ANALYTICS.md):
 * 1. Not a claimed crawler, monitor, tool, scanner or scanner path, not from a datacenter range, not loopback.
 * 2. Its page view is matched by the site's JS beacon (/_e) from the same visitor within 30 minutes, and the beacon
 *    reports navigator.webdriver = false. Until then it is "unconfirmed" (no JS ran: a fast bounce, a blocker, or a
 *    scraper with a browser User-Agent). A visitor that pulls more than 60 pages in 10 minutes is "automation".
 * 3. Visits from an IP a Siar staff account signed in from in the last 30 days are "staff", not customers.
 */
import { createHash } from 'node:crypto';
import { open, stat } from 'node:fs/promises';
import { prisma } from '../../platform/db.js';
import { config } from '../../platform/config.js';
import { logger } from '../../platform/logger.js';
import { parseUa, isScannerPath, deviceOf } from './agents.js';
import { verifyClaim, datacenterOf, type Verdict } from './ipranges.js';

export interface LogLine { t: string; h: string; ip: string; m: string; u: string; s: number; b?: number; rt?: number; ua?: string; r?: string; c?: string; q?: string }

const siteHost = () => new URL(config.SITE_URL).hostname.replace(/^www\./, '');
export function hostKind(h: string) {
  const d = siteHost();
  const host = h.toLowerCase();
  if (host === d) return 'site';
  if (host === `www.${d}`) return 'www';
  if (host === `app.${d}`) return 'app';
  if (host === `api.${d}`) return 'api';
  if (host === `media.${d}`) return 'media';
  return 'other';
}

const ASSET = /^\/(_astro|fonts|shots|clips|images|email|assets)\/|\.(css|js|mjs|map|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|mp4|webm|pdf)$/i;
const FILE = /^\/(robots\.txt|sitemap[\w-]*\.xml|llms\.txt|openapi\.json|pricing\.md|network-changes\.(xml|json)|[0-9a-f]{32}\.txt|\.well-known\/.*)$/i;

export function kindOf(host: string, path: string) {
  if (host === 'site' || host === 'www') {
    if (path === '/_e') return 'beacon';
    if (FILE.test(path)) return 'file';
    if (ASSET.test(path)) return 'asset';
    return 'page';
  }
  if (path.startsWith('/api/')) return 'api';
  if (path.startsWith('/media/') || ASSET.test(path)) return 'asset';
  return 'page';
}

/** "/pricing/", "/pricing?x=1" and "/pricing" are one page; the root stays "/". */
export const normPath = (p: string) => { const s = (p || '/').split('?')[0].split('#')[0]; return s.length > 1 ? s.replace(/\/+$/, '') || '/' : '/'; };

const salt = () => createHash('sha256').update(`siar-visitor:${config.SESSION_SECRET}`).digest('hex');
/** One id per person per UTC day; the IP itself is never kept for people. */
export const visitorOf = (ip: string, ua: string, day: string) => createHash('sha256').update(`${salt()}|${day}|${ip}|${ua}`).digest('hex').slice(0, 20);

export interface Classified { class: string; agent: string | null; verified: Verdict | 'n/a' }

export interface ClassifyContext { staffIps: Set<string>; cache: Map<string, Classified> }

const PEOPLE = new Set(['human', 'unconfirmed', 'staff']);
export const isPersonClass = (c: string) => PEOPLE.has(c);

export async function classify(l: LogLine, host: string, path: string, ctx: ClassifyContext): Promise<Classified> {
  const ua = l.ua ?? '';
  if (l.ip === '127.0.0.1' || l.ip === '::1') return { class: 'internal', agent: 'Siar server', verified: 'n/a' };
  const key = `${l.ip}|${ua}`;
  const scanPath = (host === 'site' || host === 'www') && isScannerPath(path);
  const cached = ctx.cache.get(key);
  if (cached && !scanPath) return cached;
  const p = parseUa(ua);
  let out: Classified;
  if (p.kind === 'bot') {
    const v = await verifyClaim(l.ip, p.bot.verify);
    out = v === 'failed' ? { class: 'impostor', agent: p.bot.name, verified: v } : { class: p.bot.category, agent: p.bot.name, verified: v };
  } else if (p.kind === 'monitor') out = { class: 'monitor', agent: p.name, verified: 'n/a' };
  else if (p.kind === 'scanner') out = { class: 'scanner', agent: p.name, verified: 'n/a' };
  else if (p.kind === 'tool') out = { class: p.name === 'Siar check' ? 'internal' : 'tool', agent: p.name, verified: 'n/a' };
  else if (p.kind === 'unknown-bot') out = { class: 'other-bot', agent: p.name, verified: 'unverifiable' };
  else if (p.kind === 'browser') {
    const dc = ctx.staffIps.has(l.ip) ? null : await datacenterOf(l.ip);
    out = ctx.staffIps.has(l.ip) ? { class: 'staff', agent: p.name, verified: 'n/a' }
      : dc ? { class: 'datacenter', agent: `${p.name} on ${dc}`, verified: 'n/a' }
      : { class: 'unconfirmed', agent: p.name, verified: 'n/a' };
  } else out = { class: 'other-bot', agent: p.name || 'No user agent', verified: 'unverifiable' };
  // FF's own requests (tests, audits, curl) from a staff sign-in IP are internal, not bots; real crawlers stay crawlers
  if (ctx.staffIps.has(l.ip) && out.class !== 'staff' && !(out.verified === 'verified')) out = { ...out, class: 'internal' };
  ctx.cache.set(key, out);
  if (scanPath && (out.class === 'unconfirmed' || out.class === 'datacenter' || out.class === 'other-bot')) return { ...out, class: 'scanner' };
  return out;
}

/** IPs Siar staff signed in from in the last 30 days (their visits are not customer traffic). */
export async function staffIps(): Promise<Set<string>> {
  const rows = await prisma.session.findMany({ where: { user: { role: 'ADMIN' }, createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) }, ip: { not: null } }, select: { ip: true } });
  return new Set(rows.map((r) => r.ip!).filter(Boolean));
}

function beaconData(q: string | undefined) {
  const sp = new URLSearchParams(q ?? '');
  const g = (k: string, n = 200) => (sp.get(k) ?? '').slice(0, n) || undefined;
  return { p: normPath(g('p') ?? '/'), r: g('r', 120), us: g('us', 80), um: g('um', 80), uc: g('uc', 120), w: Number(sp.get('w')) || undefined, wd: sp.get('wd') === '1', e: g('e', 4) };
}

export interface Prepared { hit: any | null; daily: { date: string; host: string; kind: string; class: string } }

/** One log line → a row to store (or null: counted only) and its daily counter key. */
export async function prepare(l: LogLine, ctx: ClassifyContext): Promise<Prepared | null> {
  if (!l || !l.t || !l.h || !l.ip) return null;
  const at = new Date(l.t);
  if (Number.isNaN(at.getTime())) return null;
  const host = hostKind(l.h);
  const path = normPath(l.u);
  const kind = kindOf(host, path);
  const ua = (l.ua ?? '').slice(0, 400);
  let c = await classify(l, host, path, ctx);
  let data: any = undefined;
  if (kind === 'beacon') {
    data = beaconData(l.q);
    if (data.wd && isPersonClass(c.class)) c = { ...c, class: 'automation', agent: `${c.agent ?? 'Browser'} (webdriver)` };
    else if (c.class === 'unconfirmed') c = { ...c, class: 'human' };
    if (data.w) data.device = deviceOf(ua, data.w);
  }
  const date = l.t.slice(0, 10);
  const daily = { date, host, kind, class: c.class };
  const person = isPersonClass(c.class);
  const store = (host === 'site' || host === 'www') ? kind !== 'asset' : !person && c.class !== 'tool' && c.class !== 'internal';
  if (!store) return { hit: null, daily };
  return {
    daily,
    hit: {
      at, host, method: (l.m ?? 'GET').slice(0, 10), path: path.slice(0, 300), status: Number(l.s) || 0, bytes: Number(l.b) || 0,
      ms: Math.round((Number(l.rt) || 0) * 1000), country: l.c && l.c !== 'XX' && l.c !== 'T1' ? l.c.slice(0, 2) : null,
      refHost: l.r ? l.r.toLowerCase().slice(0, 120) : null, kind, class: c.class, agent: c.agent?.slice(0, 80) ?? null,
      verified: c.verified, visitor: visitorOf(l.ip, ua, date), ip: person ? null : l.ip, ua, data,
    },
  };
}

const CURSOR = 'traffic-log';

async function readFrom(file: string, from: bigint, max: number): Promise<{ text: string; end: bigint } | null> {
  const fh = await open(file, 'r').catch(() => null);
  if (!fh) return null;
  try {
    const size = BigInt((await fh.stat()).size);
    if (from >= size) return { text: '', end: from };
    const len = Number(size - from > BigInt(max) ? BigInt(max) : size - from);
    const buf = Buffer.alloc(len);
    await fh.read(buf, 0, len, Number(from));
    const lastNl = buf.lastIndexOf(10);
    if (lastNl < 0) return { text: '', end: from };
    return { text: buf.subarray(0, lastNl + 1).toString('utf8'), end: from + BigInt(lastNl + 1) };
  } finally { await fh.close(); }
}

/** New lines since the last run, across a rotation. Advances the cursor only past complete lines. */
async function newLines(file: string): Promise<{ lines: string[]; save: () => Promise<void> }> {
  const MAX = 32 * 1024 * 1024;
  const cur = await prisma.trafficCursor.findUnique({ where: { id: CURSOR } });
  const st = await stat(file).catch(() => null);
  if (!st) return { lines: [], save: async () => undefined };
  const inode = BigInt(st.ino);
  const chunks: string[] = [];
  let offset = 0n;
  if (cur && cur.inode !== inode) {
    // rotated since the last run: finish the old file (now <file>.1) first
    const old = await stat(`${file}.1`).catch(() => null);
    if (old && BigInt(old.ino) === cur.inode) { const r = await readFrom(`${file}.1`, cur.offset, MAX); if (r) chunks.push(r.text); }
  } else if (cur) offset = cur.offset > BigInt(st.size) ? 0n : cur.offset;
  const r = await readFrom(file, offset, MAX);
  if (r) chunks.push(r.text);
  const end = r?.end ?? offset;
  return {
    lines: chunks.join('').split('\n').filter(Boolean),
    save: async () => { await prisma.trafficCursor.upsert({ where: { id: CURSOR }, create: { id: CURSOR, inode, offset: end }, update: { inode, offset: end } }); },
  };
}

/** Mark page views whose beacon arrived (human), and turn page floods into automation. */
export async function confirmPages(since: Date) {
  const confirmed = await prisma.$executeRaw`
    UPDATE "TrafficHit" p SET beacon = true, class = CASE WHEN b.class = 'automation' THEN 'automation' WHEN p.class = 'unconfirmed' THEN 'human' ELSE p.class END
    FROM "TrafficHit" b
    WHERE p.kind = 'page' AND p.beacon = false AND p.at >= ${since} AND p.class IN ('unconfirmed', 'staff')
      AND b.kind = 'beacon' AND b.visitor = p.visitor AND b.data->>'p' = p.path
      AND b.at >= p.at AND b.at <= p.at + interval '30 minutes'`;
  const flooded = await prisma.$executeRaw`
    UPDATE "TrafficHit" SET class = 'automation'
    WHERE kind IN ('page', 'beacon') AND class IN ('unconfirmed', 'human') AND at >= ${since}
      AND (visitor, date_trunc('hour', at) + floor(date_part('minute', at) / 10) * interval '10 minutes') IN (
        SELECT visitor, date_trunc('hour', at) + floor(date_part('minute', at) / 10) * interval '10 minutes' AS w
        FROM "TrafficHit" WHERE kind = 'page' AND at >= ${since} GROUP BY 1, 2 HAVING count(*) > 60)`;
  // a visitor that collects 10+ not-founds in 10 minutes is probing for files, whatever its User-Agent says
  const probing = await prisma.$executeRaw`
    UPDATE "TrafficHit" SET class = 'scanner'
    WHERE host IN ('site', 'www') AND class IN ('unconfirmed', 'automation', 'other-bot', 'datacenter') AND at >= ${since}
      AND (visitor, date_trunc('hour', at) + floor(date_part('minute', at) / 10) * interval '10 minutes') IN (
        SELECT visitor, date_trunc('hour', at) + floor(date_part('minute', at) / 10) * interval '10 minutes' AS w
        FROM "TrafficHit" WHERE host IN ('site', 'www') AND status = 404 AND at >= ${since} GROUP BY 1, 2 HAVING count(*) >= 10)`;
  return { confirmed, flooded, probing };
}

let running = false;

export async function ingestTraffic(file = config.TRAFFIC_LOG_PATH) {
  // One API process runs the jobs (RUN_JOBS_IN_API); a run that outlasts the 10-minute schedule just skips a tick.
  if (running) return { skipped: 'already running' };
  running = true;
  const started = Date.now();
  try {
    const { lines, save } = await newLines(file);
    const ctx: ClassifyContext = { staffIps: await staffIps(), cache: new Map() };
    const hits: any[] = [];
    const daily = new Map<string, number>();
    let bad = 0;
    let first: Date | null = null;
    for (const line of lines) {
      let l: LogLine;
      try { l = JSON.parse(line); } catch { bad++; continue; }
      const p = await prepare(l, ctx);
      if (!p) { bad++; continue; }
      const k = `${p.daily.date}|${p.daily.host}|${p.daily.kind}|${p.daily.class}`;
      daily.set(k, (daily.get(k) ?? 0) + 1);
      if (p.hit) { hits.push(p.hit); if (!first || p.hit.at < first) first = p.hit.at; }
    }
    for (let i = 0; i < hits.length; i += 1000) await prisma.trafficHit.createMany({ data: hits.slice(i, i + 1000) });
    for (const [k, n] of daily) {
      const [date, host, kind, cls] = k.split('|');
      await prisma.$executeRaw`INSERT INTO "TrafficDaily" (date, host, kind, class, requests) VALUES (${date}::date, ${host}, ${kind}, ${cls}, ${n})
        ON CONFLICT (date, host, kind, class) DO UPDATE SET requests = "TrafficDaily".requests + ${n}`;
    }
    await save();
    const since = new Date(Math.min(first?.getTime() ?? Date.now(), Date.now() - 2 * 3_600_000) - 30 * 60_000);
    const conf = await confirmPages(since);
    // beacon matching may have upgraded unconfirmed → human after the daily counters were written; the report
    // reads people from TrafficHit, so the counters only carry assets and app/api volume.
    await prisma.trafficHit.deleteMany({ where: { at: { lt: new Date(Date.now() - 120 * 86_400_000) } } });
    const res = { lines: lines.length, stored: hits.length, bad, ...conf, ms: Date.now() - started };
    await prisma.collectorRun.upsert({ where: { id: 'traffic' }, create: { id: 'traffic', ok: true, rows: hits.length, detail: JSON.stringify(res) }, update: { ok: true, rows: hits.length, detail: JSON.stringify(res), ranAt: new Date() } });
    return res;
  } catch (err) {
    logger.error({ err }, 'traffic ingest failed');
    await prisma.collectorRun.upsert({ where: { id: 'traffic' }, create: { id: 'traffic', ok: false, detail: String(err) }, update: { ok: false, detail: String(err).slice(0, 500), ranAt: new Date() } });
    throw err;
  } finally {
    running = false;
  }
}
