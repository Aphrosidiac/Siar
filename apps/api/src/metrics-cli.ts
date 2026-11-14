/**
 * Siar analytics from a terminal (docs/ANALYTICS.md). On the box it runs as the siar user with the server env:
 *   node --env-file=/srv/siar/shared/.env /srv/siar/current/api/dist/metrics-cli.js report --days 7 [--json]
 * From the Mac: scripts/metrics.sh report 7 | json 30 | ingest | search | sql "SELECT …"
 *
 *   report [--days N] [--json]   the full report (markdown, or JSON with --json)
 *   ingest                        read the traffic log now (normally every 10 minutes)
 *   search                        pull Google and Bing now (normally 02:20 and 14:20 UTC)
 *   sql "<SELECT …>"              any read-only query; rows as JSON. Tables: TrafficHit, TrafficDaily, SearchDaily,
 *                                 CollectorRun, User (signup* columns), Organization, Subscription, BillingPayment …
 */
import { prisma } from './platform/db.js';
import { buildReport, reportMarkdown } from './domain/metrics.js';
import { ingestTraffic } from './domain/traffic/ingest.js';
import { pullBing, pullGoogle } from './domain/search.js';

const [cmd = 'report', ...rest] = process.argv.slice(2);
const flag = (name: string) => rest.includes(`--${name}`);
const value = (name: string) => { const i = rest.indexOf(`--${name}`); return i >= 0 ? rest[i + 1] : undefined; };
const json = (v: unknown) => JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? Number(x) : x), 2);

async function main() {
  if (cmd === 'report') {
    const r = await buildReport({ days: Number(value('days') ?? rest.find((a) => /^\d+$/.test(a)) ?? 30) });
    process.stdout.write(flag('json') ? json(r) : reportMarkdown(r));
  } else if (cmd === 'ingest') process.stdout.write(json(await ingestTraffic(value('file'))));
  else if (cmd === 'search') process.stdout.write(json({ google: await pullGoogle(Number(value('days') ?? 16)), bing: await pullBing() }));
  else if (cmd === 'sql') {
    const q = rest.filter((a) => !a.startsWith('--')).join(' ').trim();
    if (!/^\s*(select|with)\b/i.test(q)) throw new Error('Only SELECT / WITH queries.');
    const rows = await prisma.$transaction(async (tx) => { await tx.$executeRawUnsafe('SET TRANSACTION READ ONLY'); return tx.$queryRawUnsafe(q); });
    process.stdout.write(json(rows));
  } else throw new Error(`Unknown command ${cmd}. Use report, ingest, search or sql.`);
  process.stdout.write('\n');
}

// exit only after stdout drained: a large answer piped over SSH was cut at 64 KB when the process exited first
const flushed = () => new Promise<void>((r) => process.stdout.write('', () => r()));
main().then(() => prisma.$disconnect()).then(flushed).then(() => process.exit(0)).catch(async (err) => { console.error(String(err?.message ?? err)); await prisma.$disconnect(); process.exit(1); });
