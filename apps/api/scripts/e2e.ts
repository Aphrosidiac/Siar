/**
 * End-to-end run against a live dev API + mock networks (pnpm --filter @siar/api e2e).
 * Drives the product the way a customer does: sign up, team, connect, upload, post, webhooks,
 * quotas — and asserts on what reached the (mock) networks. Exits non-zero on the first failure.
 */
import { createServer } from 'node:http';
import { deflateSync } from 'node:zlib';
import { prisma } from '../src/platform/db.js';

const API = process.env.API ?? 'http://localhost:3290';
const MOCK = process.env.MOCK ?? 'http://127.0.0.1:3299';
let cookie = '';
let apiKey = '';
let passed = 0;

function ok(cond: unknown, msg: string): asserts cond {
  if (!cond) { console.error(`✗ ${msg}`); process.exit(1); }
  passed++; console.log(`✓ ${msg}`);
}

async function call(method: string, path: string, body?: unknown, opts: { key?: boolean; form?: FormData; expect?: number } = {}) {
  const headers: Record<string, string> = {};
  if (opts.key && apiKey) headers['x-api-key'] = apiKey;
  else if (cookie) { headers.cookie = cookie; headers['x-siar'] = '1'; }
  if (body !== undefined) headers['content-type'] = 'application/json';
  const res = await fetch(API + path, { method, headers, body: opts.form ?? (body !== undefined ? JSON.stringify(body) : undefined), redirect: 'manual' });
  const set = res.headers.get('set-cookie');
  if (set?.includes('siar_session=')) cookie = set.split(';')[0];
  const text = await res.text();
  let json: any = null; try { json = text ? JSON.parse(text) : null; } catch { json = text; }
  if (opts.expect !== undefined && res.status !== opts.expect && !(opts.expect === 201 && res.status === 200)) { console.error(`✗ ${method} ${path} → ${res.status} (wanted ${opts.expect})`, json); process.exit(1); }
  return { status: res.status, json, headers: res.headers };
}

/** Follow an OAuth URL through the mock consent screen back to our callback. */
async function followOAuth(url: string) {
  let next = url; let last: Response | null = null;
  for (let i = 0; i < 6 && next; i++) {
    last = await fetch(next, { redirect: 'manual' });
    const loc = last.headers.get('location');
    if (!loc) break;
    next = new URL(loc, next).toString();
    if (next.includes('success=')) return new URL(next);
  }
  throw new Error(`OAuth did not return to the app (last ${last?.status} ${next})`);
}

function png(w = 64, h = 64) {
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b: Buffer) => { let c = 0xffffffff; for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (t: string, d: Buffer) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const raw = Buffer.alloc((w * 3 + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const o = y * (w * 3 + 1) + 1 + x * 3; raw[o] = x * 4; raw[o + 1] = y * 4; raw[o + 2] = 160; }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const wait = (ms: number) => new Promise(r => setTimeout(r, ms));
async function until<T>(fn: () => Promise<T>, check: (v: T) => boolean, ms = 30_000) {
  const end = Date.now() + ms; let v = await fn();
  while (!check(v) && Date.now() < end) { await wait(500); v = await fn(); }
  return v;
}

async function main() {
  await fetch(`${MOCK}/__reset`, { method: 'POST' });
  // The mock hands every run the same Mastodon account, and daily caps follow the network account
  // across organizations — so repeated runs on one day would hit the cap. Start each run at zero.
  await prisma.dailyCounter.deleteMany({ where: { accountKey: { startsWith: 'MASTODON' } } });
  const health = await call('GET', '/api/v1/');
  ok(health.status === 200 && health.json.platforms?.MASTODON, 'health is public and lists networks');

  // Webhook receiver
  const received: any[] = [];
  const hook = createServer((req, res) => { let b = ''; req.on('data', c => (b += c)); req.on('end', () => { received.push({ headers: req.headers, body: JSON.parse(b || '{}') }); res.end('ok'); }); }).listen(3298);

  const email = `e2e+${Date.now()}@example.com`;
  const su = await call('POST', '/api/v1/auth/signup', { email, password: 'correct horse battery', firstName: 'E2E', organizationName: 'E2E Org' }, { expect: 201 });
  ok(su.json.currentOrganizationId && cookie, 'sign up creates an organization and a session');
  ok((await call('POST', '/api/v1/auth/login', { email, password: 'wrong password!!' })).status === 401, 'wrong password is refused');

  const key = await call('POST', '/api/v1/api-key', { name: 'e2e' }, { expect: 201 });
  apiKey = key.json.key;
  ok(apiKey.startsWith('sk_live_'), 'API key is created and shown once');
  ok((await call('GET', '/api/v1/api-key', undefined, { key: true })).status === 403, 'API keys cannot manage API keys');
  ok((await fetch(`${API}/api/v1/team`, { headers: { 'x-api-key': 'sk_live_nope' } })).status === 401, 'bad API key → 401');

  const wh = await call('POST', '/api/v1/webhook', { url: 'http://127.0.0.1:3298/hook', events: ['post.published', 'team.created', 'social-account.created'] }, { expect: 201 });
  ok(wh.json.secret?.startsWith('whsec_'), 'webhook created with a signing secret');

  const team = await call('POST', '/api/v1/team/', { name: 'Brand A' }, { key: true, expect: 201 });
  ok(team.json.id && team.json.socialAccounts.length === 0, 'team created through the API key');
  await call('POST', '/api/v1/team/', { name: 'Brand B' }, { key: true, expect: 201 });
  await call('POST', '/api/v1/team/', { name: 'Brand C' }, { key: true, expect: 201 });
  const fourth = await call('POST', '/api/v1/team/', { name: 'Brand D' }, { key: true });
  ok(fourth.status === 403 && /Social sets limit reached/.test(fourth.json.message), 'free plan stops at 3 social sets with the reference message');

  const bad = await call('POST', '/api/v1/team/', { avatarUrl: 'x' }, { key: true });
  ok(bad.status === 400 && Array.isArray(bad.json.issues), 'validation errors carry issues[]');

  const conn = await call('POST', '/api/v1/social-account/connect', { type: 'MASTODON', teamId: team.json.id, redirectUrl: 'https://app.example.com/done', serverUrl: 'https://mastodon.example' }, { key: true, expect: 200 });
  ok(conn.json.url.includes('/oauth/authorize'), 'connect returns the network authorize URL');
  const back = await followOAuth(conn.json.url);
  ok(back.searchParams.get('success') === 'true' && back.origin === 'https://app.example.com', 'OAuth returns to the customer redirectUrl with success=true');
  const acc = await call('GET', `/api/v1/social-account/by-type?type=MASTODON&teamId=${team.json.id}`, undefined, { key: true, expect: 200 });
  ok(acc.json.username === 'siartest' && !('accessTokenEnc' in acc.json), 'account stored; tokens never returned');

  const form = new FormData();
  form.set('teamId', team.json.id);
  form.set('file', new Blob([png()], { type: 'image/png' }), 'pic.png');
  const up = await call('POST', '/api/v1/upload/', undefined, { key: true, form, expect: 201 });
  ok(up.json.type === 'image' && up.json.width === 64 && up.json.url, 'image upload probed (64×64) with a signed URL');
  ok((await fetch(up.json.url)).status === 200, 'signed media URL serves the file');
  ok((await fetch(up.json.url.replace(/sig=[^&]+/, 'sig=bad'))).status === 403, 'tampered media URL is refused');

  const tooLong = await call('POST', '/api/v1/post/', { teamId: team.json.id, title: 'x', postDate: new Date().toISOString(), status: 'SCHEDULED', socialAccountTypes: ['MASTODON'], data: { MASTODON: { text: 'a'.repeat(501) } } }, { key: true });
  ok(tooLong.status === 400 && tooLong.json.issues?.[0]?.path?.join('.') === 'data.MASTODON.text', 'network rules validated with a precise path');

  const post = await call('POST', '/api/v1/post/', {
    teamId: team.json.id, title: 'Launch', postDate: new Date().toISOString(), status: 'SCHEDULED', referenceKey: `ref-${Date.now()}`,
    socialAccountTypes: ['MASTODON'], data: { MASTODON: { text: 'Hello from Siar e2e', uploadIds: [up.json.id] } }, firstComment: { MASTODON: 'First!' },
  }, { key: true, expect: 201 });
  ok(post.json.status === 'SCHEDULED', 'post created as SCHEDULED');
  const done = await until(() => call('GET', `/api/v1/post/${post.json.id}`, undefined, { key: true }), r => ['POSTED', 'ERROR'].includes(r.json.status));
  ok(done.json.status === 'POSTED', `post published (status ${done.json.status}${done.json.error ? `: ${done.json.error}` : ''})`);
  ok(done.json.socialAccounts[0].externalPostId && done.json.externalData?.MASTODON?.permalink, 'external id + permalink saved');
  const state = await (await fetch(`${MOCK}/__state`)).json();
  const st = state.mastodon.statuses.find((s: any) => s.id === done.json.socialAccounts[0].externalPostId);
  ok(st && st.content.includes('Hello from Siar e2e') && st.media_attachments.length === 1, 'the mock network received text + media');
  ok(state.mastodon.statuses.some((s: any) => s.in_reply_to_id === st.id && s.content.includes('First!')), 'first comment published as a reply');
  const dup = await call('POST', '/api/v1/post/', { teamId: team.json.id, title: 'dup', postDate: new Date().toISOString(), status: 'DRAFT', referenceKey: post.json.referenceKey, socialAccountTypes: ['MASTODON'], data: { MASTODON: { text: 'x' } } }, { key: true });
  ok(dup.status === 409, 'referenceKey is unique per organization');
  ok((await call('GET', `/api/v1/post/reference-key/${encodeURIComponent(post.json.referenceKey)}`, undefined, { key: true })).json.id === post.json.id, 'get by reference key');

  const usage = await call('GET', '/api/v1/organization/usage/posts', undefined, { key: true });
  ok(usage.json.used === 1 && usage.json.limit === 20, 'monthly post usage counted (1/20)');

  await until(async () => received.filter(r => r.body.type === 'post.published').length, n => n >= 1, 15_000);
  ok(received.some(r => r.body.type === 'post.published' && r.headers['x-siar-signature']), 'post.published webhook delivered and signed');
  ok(received.some(r => r.body.type === 'team.created'), 'team.created webhook delivered');

  const list = await call('GET', `/api/v1/post/?teamId=${team.json.id}&limit=5`, undefined, { key: true });
  ok(list.json.total >= 1 && Array.isArray(list.json.items), 'post list uses { items, total }');

  // ── comments ──
  const cm = await call('POST', '/api/v1/comment/', { teamId: team.json.id, title: 'reply', internalPostId: post.json.id, postDate: new Date().toISOString(), status: 'SCHEDULED', socialAccountTypes: ['MASTODON'], data: { MASTODON: { text: 'Comment via API' } } }, { key: true });
  ok(cm.status < 300, `comment created (${cm.status} ${cm.json?.message ?? ''})`);
  const cmDone = await until(() => call('GET', `/api/v1/comment/${cm.json.id}`, undefined, { key: true }), r => ['POSTED', 'ERROR'].includes(r.json.status));
  ok(cmDone.json.status === 'POSTED', `comment published (${cmDone.json.status} ${cmDone.json.error ?? ''})`);

  // ── billing (mock provider) ──
  const co = await call('POST', '/api/v1/billing/checkout', { plan: 'PRO', interval: 'MONTHLY' });
  ok(co.status < 300 && co.json.url, `checkout returns a URL (${co.status} ${co.json?.message ?? ''})`);
  const pid = new URL(co.json.url).pathname.split('/').pop();
  const pay = await fetch(`${API}/mock-billing/${pid}/pay`, { method: 'POST', redirect: 'manual' });
  ok(pay.status < 400, `mock payment settles (${pay.status})`);
  const sub = await until(() => call('GET', '/api/v1/billing/subscription'), r => r.json.plan === 'PRO');
  ok(sub.json.plan === 'PRO', `organization is on PRO after payment (${sub.json.plan})`);
  ok((await call('POST', '/api/v1/team/', { name: 'Brand D' }, { key: true })).status < 300, 'team cap lifted on PRO');
  const top = await call('POST', '/api/v1/billing/credits/top-up', { amountUsd: 10 });
  const tpid = new URL(top.json.url).pathname.split('/').pop();
  await fetch(`${API}/mock-billing/${tpid}/pay`, { method: 'POST', redirect: 'manual' });
  const bal = await until(() => call('GET', '/api/v1/billing/credits/balance', undefined, { key: true }), r => r.json.balanceMicros >= 10_000_000);
  ok(bal.json.balanceMicros === 10_000_000, `X credit top-up lands in the ledger (${bal.json.balanceMicros})`);

  // ── link in bio ──
  const slug = `e2e-${Date.now().toString(36)}`;
  const bio = await call('POST', '/api/v1/bio', { teamId: team.json.id, slug, title: 'E2E Bio' }, { key: true });
  ok(bio.status < 300, `bio created (${bio.status} ${bio.json?.message ?? ''})`);
  const it = await call('POST', '/api/v1/bio-item', { bioId: bio.json.id, type: 'LINK', title: 'Site', url: 'https://example.com' }, { key: true });
  await call('PATCH', `/api/v1/bio/${bio.json.id}`, { published: true }, { key: true });
  const pub = await fetch(`${API}/b/${slug}`);
  ok(pub.status === 200 && (await pub.text()).includes('E2E Bio'), 'public bio page renders');
  const go = await fetch(`${API}/b/${slug}/go/${it.json.id}`, { redirect: 'manual' });
  ok(go.status === 302 && go.headers.get('location') === 'https://example.com', 'bio link redirects and counts the click');

  hook.close();
  await prisma.$disconnect();
  console.log(`\n${passed} checks passed`);
}
main().catch(err => { console.error(err); process.exit(1); });
