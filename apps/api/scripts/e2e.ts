/**
 * End-to-end run against a live dev API + mock networks (pnpm --filter @siar/api e2e).
 * Drives the product the way a customer does: sign up, team, connect, upload, post, webhooks,
 * quotas — and asserts on what reached the (mock) networks. Exits non-zero on the first failure.
 */
import { createServer } from 'node:http';
import { deflateSync } from 'node:zlib';
import { prisma } from '../src/platform/db.js';
import { linkCycle } from '../src/modules/billing-core.js';

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
  // Free posts are also counted per social account across organizations (one-time): start each run at zero.
  await prisma.accountMonthCounter.deleteMany({ where: { accountKey: { startsWith: 'MASTODON' }, period: 'free' } });
  const health = await call('GET', '/api/v1/');
  ok(health.status === 200 && health.json.platforms?.MASTODON, 'health is public and lists networks');

  // Webhook receiver
  const received: any[] = [];
  const hook = createServer((req, res) => { let b = ''; req.on('data', c => (b += c)); req.on('end', () => { received.push({ headers: req.headers, body: JSON.parse(b || '{}') }); res.end('ok'); }); }).listen(3298);

  const email = `e2e+${Date.now()}@example.com`;
  const su = await call('POST', '/api/v1/auth/signup', { email, password: 'correct horse battery', firstName: 'E2E', organizationName: 'E2E Org' }, { expect: 201 });
  ok(su.json.currentOrganizationId && cookie, 'sign up creates an organization and a session');
  ok(!su.json.user.onboardedAt, 'a new owner starts on the welcome');
  const first = await call('GET', '/api/v1/team/', undefined, { expect: 200 });
  ok(first.json.total === 1 && first.json.items[0].name === 'E2E Org', 'sign up comes with a first team named after the organization');
  const welcomed = await call('POST', '/api/v1/user/me/onboarding', undefined, { expect: 200 });
  ok(welcomed.json.user.onboardedAt, 'finishing the welcome is remembered');
  ok((await call('POST', '/api/v1/auth/login', { email, password: 'wrong password!!' })).status === 401, 'wrong password is refused');

  const key = await call('POST', '/api/v1/api-key', { name: 'e2e' }, { expect: 201 });
  apiKey = key.json.key;
  ok(apiKey.startsWith('sk_live_'), 'API key is created and shown once');
  ok((await call('GET', '/api/v1/api-key', undefined, { key: true })).status === 403, 'API keys cannot manage API keys');
  ok((await fetch(`${API}/api/v1/team`, { headers: { 'x-api-key': 'sk_live_nope' } })).status === 401, 'bad API key → 401');

  const wh = await call('POST', '/api/v1/webhook', { url: 'http://127.0.0.1:3298/hook', events: ['post.published', 'team.created', 'social-account.created'] }, { expect: 201 });
  ok(wh.json.secret?.startsWith('whsec_'), 'webhook created with a signing secret');

  // Free includes one brand, the team made at sign up: swap it for Brand A (so team.created fires).
  ok((await call('DELETE', `/api/v1/team/${first.json.items[0].id}`, undefined, { key: true })).status < 300, 'the sign-up team can be deleted');
  const team = await call('POST', '/api/v1/team/', { name: 'Brand A' }, { key: true, expect: 201 });
  ok(team.json.id && team.json.socialAccounts.length === 0, 'team created through the API key');
  const second = await call('POST', '/api/v1/team/', { name: 'Brand B' }, { key: true });
  ok(second.status === 403 && /Social sets limit reached/.test(second.json.message) && /Free plan includes 1 brand/.test(second.json.message), 'Free includes one brand, with the reference message');

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
  ok(usage.json.used === 1 && usage.json.limit === 20 && usage.json.resets === false, 'Free post usage counted as a one-time allowance (1/20, no reset)');

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

  // ── Free is one-time: the organization's 20 posts, and each account's 20 across organizations ──
  const freeDraft = () => call('POST', '/api/v1/post/', { teamId: team.json.id, title: 'free', postDate: new Date(Date.now() + 3600_000).toISOString(), status: 'SCHEDULED', socialAccountTypes: ['MASTODON'], data: { MASTODON: { text: `Free check ${Date.now()}` } } }, { key: true });
  const orgFree = { organizationId: su.json.currentOrganizationId, period: 'free', metric: 'posts' };
  await prisma.usageCounter.update({ where: { organizationId_period_metric: orgFree }, data: { used: 20 } });
  const spent = await freeDraft();
  ok(spent.status === 403 && /20 free posts/.test(spent.json.message), `Free stops after 20 posts, pointing at a plan (${spent.status})`);
  await prisma.usageCounter.update({ where: { organizationId_period_metric: orgFree }, data: { used: 2 } });
  const mastodonKey = (await prisma.accountMonthCounter.findFirst({ where: { accountKey: { startsWith: 'MASTODON' }, period: 'free', metric: 'freePosts' } }))!.accountKey;
  await prisma.accountMonthCounter.update({ where: { accountKey_period_metric: { accountKey: mastodonKey, period: 'free', metric: 'freePosts' } }, data: { used: 20 } });
  const reused = await freeDraft();
  ok(reused.status === 403 && /This social account has already used the 20 free posts/.test(reused.json.message), 'an account that used its free posts elsewhere does not get a fresh allowance');
  await prisma.accountMonthCounter.update({ where: { accountKey_period_metric: { accountKey: mastodonKey, period: 'free', metric: 'freePosts' } }, data: { used: 2 } });

  // ── billing (mock provider): ringgit list, Starter, upgrade, price lock ──
  const pay = async (url: string, q = '') => fetch(`${API}/mock-billing/${new URL(url).pathname.split('/').pop()}/pay${q}`, { method: 'POST', redirect: 'manual' });
  const plans = await call('GET', '/api/v1/billing/plans', undefined, { expect: 200 });
  const offer = (t: string) => plans.json.plans.find((p: any) => p.tier === t);
  ok(plans.json.currency === 'myr' && offer('STARTER').price.monthly === 3_900 && offer('PRO').price.yearly === 99_000 && offer('FREE').oneTime, 'Malaysia sees the ringgit list (Starter RM39, Pro RM990 a year, Free one-time)');
  ok(offer('PRO').trial && !offer('STARTER').trial && plans.json.trialDays === 14, 'only Pro offers the 14-day trial');
  const co = await call('POST', '/api/v1/billing/checkout', { plan: 'STARTER', interval: 'MONTHLY' });
  ok(co.status < 300 && co.json.url && co.json.currency === 'myr' && co.json.amountCents === 3_900 && co.json.trialDays === 0, `Starter checkout charges exactly RM39.00, no trial (${co.status} ${co.json?.message ?? co.json?.amountCents})`);
  ok((await pay(co.json.url)).status < 400, 'mock payment settles');
  const sub = await until(() => call('GET', '/api/v1/billing/subscription'), r => r.json.plan === 'STARTER');
  ok(sub.json.plan === 'STARTER' && sub.json.currency === 'myr' && sub.json.amountCents === 3_900 && sub.json.renewal === 'AUTO' && sub.json.priceLocked, `organization is on Starter at a locked RM39 (${sub.json.plan} ${sub.json.amountCents})`);
  const inv = await call('GET', '/api/v1/billing/invoices');
  ok(inv.json.items[0].currency === 'myr' && inv.json.items[0].amountCents === 3_900, 'the invoice is in ringgit');
  const starterCap = await call('POST', '/api/v1/team/', { name: 'Brand B' }, { key: true });
  ok(starterCap.status === 403 && /Starter plan includes 1 brand/.test(starterCap.json.message), 'Starter includes one brand');
  const upgrade = await call('POST', '/api/v1/billing/checkout', { plan: 'PRO', interval: 'MONTHLY' });
  ok(upgrade.status < 300 && upgrade.json.url, `upgrade to Pro opens a checkout (${upgrade.status} ${upgrade.json?.message ?? ''})`);
  await pay(upgrade.json.url);
  const pro = await until(() => call('GET', '/api/v1/billing/subscription'), r => r.json.plan === 'PRO');
  ok(pro.json.plan === 'PRO' && pro.json.amountCents === 9_900, `upgrade lands on Pro at RM99 (${pro.json.plan} ${pro.json.amountCents})`);
  for (const n of ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']) await call('POST', '/api/v1/team/', { name: `Brand ${n}` }, { key: true, expect: 201 });
  const eleventh = await call('POST', '/api/v1/team/', { name: 'Brand K' }, { key: true });
  ok(eleventh.status === 403 && /Pro plan includes 10 brands/.test(eleventh.json.message), 'Pro includes ten brands');
  // Price lock: a renewal charges the subscription's own price, not today's list price.
  await prisma.subscription.update({ where: { organizationId: su.json.currentOrganizationId }, data: { unitAmountCents: 7_900 } });
  const renewed = await call('POST', '/mock-billing/renew', {});
  ok(renewed.json.subscription?.amountCents === 7_900 && renewed.json.result?.paid === 1, `a renewal keeps the locked price (RM79 while the list says RM99): ${JSON.stringify(renewed.json.result)}`);
  const lastInv = await call('GET', '/api/v1/billing/invoices');
  ok(lastInv.json.items[0].amountCents === 7_900 && /renewal/.test(lastInv.json.items[0].description), 'the renewal invoice charged the locked price');
  const top = await call('POST', '/api/v1/billing/credits/top-up', { amountUsd: 10 });
  const tpid = new URL(top.json.url).pathname.split('/').pop();
  await fetch(`${API}/mock-billing/${tpid}/pay`, { method: 'POST', redirect: 'manual' });
  const bal = await until(() => call('GET', '/api/v1/billing/credits/balance', undefined, { key: true }), r => r.json.balanceMicros >= 10_000_000);
  ok(top.json.currency === 'myr' && top.json.amountCents === 4_200 && bal.json.balanceMicros === 10_000_000, `$10 of X credit is charged RM42.00 and lands as $10 in the ledger (${top.json.amountCents} → ${bal.json.balanceMicros})`);

  // ── a second organization: USD outside Malaysia, a yearly plan paid once (FPX), link renewal ──
  const ownerCookie = cookie;
  cookie = '';
  const su2 = await call('POST', '/api/v1/auth/signup', { email: `e2e-link+${Date.now()}@example.com`, password: 'correct horse battery', firstName: 'Link', organizationName: 'E2E Link Org' }, { expect: 201 });
  const linkOrgId = su2.json.currentOrganizationId;
  await call('PATCH', '/api/v1/billing/details', { country: 'SG' }, { expect: 200 });
  const sg = await call('GET', '/api/v1/billing/plans');
  ok(sg.json.currency === 'usd' && sg.json.plans.find((p: any) => p.tier === 'PRO').price.monthly === 4_900 && !sg.json.methods.bank, 'billed outside Malaysia: the USD list (Pro $49), card only');
  const sgBank = await call('POST', '/api/v1/billing/checkout', { plan: 'PRO', interval: 'YEARLY', method: 'bank' });
  ok(sgBank.status === 400, 'paying once by FPX is refused outside Malaysia');
  await call('PATCH', '/api/v1/billing/details', { country: 'MY' }, { expect: 200 });
  const monthlyBank = await call('POST', '/api/v1/billing/checkout', { plan: 'PRO', interval: 'MONTHLY', method: 'bank' });
  ok(monthlyBank.status === 400, 'paying once is for yearly plans only');
  const once = await call('POST', '/api/v1/billing/checkout', { plan: 'PRO', interval: 'YEARLY', method: 'bank' });
  ok(once.status < 300 && once.json.amountCents === 99_000 && once.json.trialDays === 0, `Pro yearly paid once costs RM990.00 with no trial (${once.json?.amountCents ?? once.json?.message})`);
  await pay(once.json.url, '?cardCountry=SG');
  const linked = await until(() => call('GET', '/api/v1/billing/subscription'), r => r.json.plan === 'PRO');
  ok(linked.json.renewal === 'LINK' && linked.json.currency === 'myr' && linked.json.amountCents === 99_000, `a plan paid once renews by link (${linked.json.renewal})`);
  const flagged = await prisma.auditLog.count({ where: { action: 'billing.cardCountry', organizationId: linkOrgId } });
  ok(flagged >= 1, 'a ringgit payment with a foreign card is recorded in the audit log');
  const early = await call('POST', '/api/v1/billing/checkout', { plan: 'PRO', interval: 'YEARLY', renew: true });
  ok(early.status === 409 && /Renewal opens 30 days before/.test(early.json.message), 'renewal opens 30 days before the end date');
  // Reminders: 7 days and 1 day before the end date, each sent once (the clock moves, the end date does not).
  const linkSub = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: linkOrgId } });
  const endAt = linkSub.currentPeriodEnd!.getTime();
  const r1 = await linkCycle(linkSub.id, new Date(endAt - 5 * 86400_000));
  const r2 = await linkCycle(linkSub.id, new Date(endAt - 4 * 86400_000));
  const r3 = await linkCycle(linkSub.id, new Date(endAt - 12 * 3600_000));
  const reminded = ((await prisma.subscription.findUniqueOrThrow({ where: { id: linkSub.id } })).metadata as any)?.reminded ?? [];
  ok(r1 === 'reminded' && r2 === 'idle' && r3 === 'reminded' && reminded.length === 2, `a link plan is reminded at 7 days and at 1 day, each once (${r1}, ${r2}, ${r3}: ${reminded.join(' ')})`);
  const ended = await call('POST', '/mock-billing/renew', {});
  ok(ended.json.subscription?.status === 'past_due' && ended.json.result?.['link-grace'] >= 1, `an unpaid link plan gets its grace period at the end date (${JSON.stringify(ended.json.result)})`);
  const renewal = await call('POST', '/api/v1/billing/checkout', { plan: 'PRO', interval: 'YEARLY', renew: true });
  ok(renewal.status < 300 && renewal.json.amountCents === 99_000, `the renewal link charges the locked RM990 (${renewal.json?.amountCents ?? renewal.json?.message})`);
  const before = await prisma.subscription.findUniqueOrThrow({ where: { organizationId: linkOrgId } });
  await pay(renewal.json.url);
  const after = await until(() => call('GET', '/api/v1/billing/subscription'), r => r.json.status === 'active');
  ok(after.json.status === 'active' && new Date(after.json.currentPeriodEnd).getTime() > before.currentPeriodEnd!.getTime() + 300 * 86400_000, 'paying the renewal extends the plan by a year from its old end date');
  cookie = ownerCookie;

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
