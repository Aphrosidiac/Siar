/**
 * Product screenshots for the marketing site, taken from the running dashboard with the demo seed.
 *
 *   pnpm --filter @siar/api db:seed            # fresh demo data first
 *   node apps/site/scripts/shots.mjs [scene…]  # dashboard on :5290 (APP_URL), API on :3290, mocks on :3299
 *
 * Every scene writes public/shots/<name>.webp (2x, light theme) and a dark twin where asked.
 * The composer flow is a sequence (flow-1 … flow-n) the home page plays as a walkthrough.
 * Shots show only networks that are open today (apps/site/src/lib/status.ts): the demo seed has no others,
 * and the few dashboard controls listed for every network (the Google Business nav item, the bulk
 * template's network boxes) are hidden for the closed ones at capture time.
 * `flow`, `post-detail` and `bulk` write demo data (posts, an import): reseed after.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const APP = process.env.APP_URL ?? 'http://localhost:5290';
const OUT = fileURLToPath(new URL('../public/shots/', import.meta.url));
const TMP = fileURLToPath(new URL('../.shots-tmp/', import.meta.url));
const W = 1440, H = 900;
/** Networks that are not open today, by the names the dashboard shows. */
const CLOSED = ['TikTok', 'YouTube', 'Pinterest', 'Reddit', 'Snapchat', 'Google Business'];
mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true });

const only = new Set(process.argv.slice(2));
// PW_CHANNEL=chrome uses the installed Chrome when Playwright's own browser isn't downloaded
const browser = await chromium.launch(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {});

async function context(theme = 'light', size = { width: W, height: H }) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-siar': '1' }, viewport: size, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: 'reduce', locale: 'en-GB', timezoneId: 'Asia/Kuala_Lumpur' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('siar.theme', t); } catch {} }, theme);
  await ctx.addInitScript(() => addEventListener('DOMContentLoaded', () => { const st = document.createElement('style'); st.textContent = 'a[href="/google-business"] { display: none !important }'; document.head.appendChild(st); }));
  const res = await ctx.request.post(`${APP}/api/v1/auth/login`, { data: { email: 'demo@siaran.my', password: 'demo-password-123' } });
  if (!res.ok()) throw new Error(`login failed: ${res.status()}`);
  return ctx;
}

async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(350);
}

async function save(page, name, clip) {
  const png = `${TMP}${name}.png`;
  await page.screenshot({ path: png, clip });
  execFileSync('cwebp', ['-quiet', '-q', '86', '-m', '6', png, '-o', `${OUT}${name}.webp`]);
  console.log('shot', name);
}

/** Open a page, optionally prepare it, and save it in light (and dark) themes. */
async function scene(name, path, { prep, dark = false, size } = {}) {
  if (only.size && !only.has(name)) return;
  for (const theme of dark ? ['light', 'dark'] : ['light']) {
    const ctx = await context(theme, size);
    const page = await ctx.newPage();
    await page.goto(`${APP}${path}`);
    await settle(page);
    if (prep) await prep(page);
    await save(page, theme === 'dark' ? `${name}-dark` : name);
    await ctx.close();
  }
}

// 16:9, the hero's frame
await scene('posts', '/posts', { dark: true, size: { width: 1536, height: 864 } });
await scene('calendar', '/calendar');
await scene('analytics', '/analytics', { dark: true });
await scene('inbox', '/inbox');
// "Add a network" lists every network the API is built for; show the open ones (and count those)
await scene('accounts', '/social-accounts', { prep: (page) => page.evaluate((closed) => {
  const rows = [...document.querySelectorAll('.av-row')];
  for (const r of rows) if (closed.includes(r.querySelector('.net')?.textContent.trim())) r.style.display = 'none';
  const num = document.querySelector('.list.avail')?.closest('section')?.querySelector('.num');
  if (num) num.textContent = String(rows.filter((r) => r.style.display !== 'none').length);
}, CLOSED) });
await scene('webhooks', '/webhooks', { prep: async (page) => { await page.getByRole('button', { name: 'Deliveries' }).first().click(); await settle(page); } });
await scene('api-keys', '/api-keys');
// the public link reads the browser's origin; show the production one, not localhost
await scene('bio', '/bio', { prep: (page) => page.evaluate(() => document.querySelectorAll('input').forEach((i) => { if (i.value.includes('localhost')) i.value = i.value.replace(/^https?:\/\/[^/]+/, 'https://app.siaran.my'); })) });
await scene('posts-phone', '/posts', { size: { width: 390, height: 844 } });
await scene('calendar-phone', '/calendar', { size: { width: 390, height: 844 } });

// Hosted connect: the page a customer sees from a connect link.
if (!only.size || only.has('portal')) {
  const ctx = await context();
  const teams = await (await ctx.request.get(`${APP}/api/v1/team?limit=20`)).json();
  const team = teams.items.find((t) => t.name === 'Halo Fitness') ?? teams.items[0];
  const r = await ctx.request.post(`${APP}/api/v1/social-account/create-portal-link`, { data: { teamId: team.id, socialAccountTypes: ['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'BLUESKY', 'MASTODON'], expiresIn: 24, redirectUrl: `${APP}/social-accounts` } });
  const body = await r.json(); if (!body.url) throw new Error(JSON.stringify(body)); const { url } = body;
  const page = await ctx.newPage();
  await page.goto(url.replace(/^https?:\/\/[^/]+/, APP));
  await settle(page);
  await save(page, 'portal');
  await ctx.close();
}

// The composer walkthrough: pick networks, write once, tailor one network, schedule, see it land.
if (!only.size || only.has('flow')) {
  const ctx = await context();
  const page = await ctx.newPage();
  await page.goto(`${APP}/compose`);
  await settle(page);
  const top = async () => { await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(250); };
  await save(page, 'flow-1');
  for (const n of ['Facebook', 'Threads', 'X']) await page.locator('button').filter({ hasText: new RegExp(`^\\s*${n}`) }).first().click();
  await page.locator('textarea').first().fill('Pandan latte is back from Friday at Bangsar, Uptown and Mont Kiara. Iced or hot? Tell us below.');
  await page.getByRole('spinbutton', { name: 'Hour' }).first().click();
  await page.keyboard.type('0930');
  await page.locator('textarea').first().click();
  await top();
  await save(page, 'flow-2');
  await page.getByRole('tab', { name: 'Threads', exact: true }).click();
  await page.waitForTimeout(200);
  const own = page.locator('textarea:visible').first();
  await own.fill('Pandan latte is back Friday. Iced or hot? 🌿');
  await top();
  await save(page, 'flow-3');
  await page.getByRole('button', { name: /Schedule post/ }).click();
  await page.waitForTimeout(1200);
  await settle(page);
  await save(page, 'flow-4');
  await ctx.close();
}

const teamId = async (ctx, name) => { const teams = await (await ctx.request.get(`${APP}/api/v1/team?limit=20`)).json(); return (teams.items.find((t) => t.name === name) ?? teams.items[0]).id; };
const until = async (fn, ok, ms = 30_000) => { for (const end = Date.now() + ms; Date.now() < end; await new Promise((r) => setTimeout(r, 500))) { const v = await fn(); if (ok(v)) return v; } throw new Error('timed out'); };
const getPost = async (ctx, id) => (await ctx.request.get(`${APP}/api/v1/post/${id}`)).json();

// Post detail: published on Facebook and Instagram, refused by X with X's own error (the mock X refuses a
// duplicate of a tweet the account already posted, as the real one does).
if (!only.size || only.has('post-detail')) {
  const ctx = await context();
  const team = await teamId(ctx, 'Kopi Senja');
  const text = 'Pandan latte is back from Friday at Bangsar, Uptown and Mont Kiara. Iced or hot? Tell us below.';
  const now = () => new Date().toISOString();
  const create = async (body) => { const r = await ctx.request.post(`${APP}/api/v1/post/`, { data: { teamId: team, title: 'Pandan latte is back', postDate: now(), status: 'SCHEDULED', ...body } }); const j = await r.json(); if (!j.id) throw new Error(JSON.stringify(j)); return j; };
  const earlier = await create({ socialAccountTypes: ['TWITTER'], data: { TWITTER: { text } } });
  await until(() => getPost(ctx, earlier.id), (p) => ['POSTED', 'ERROR'].includes(p.status));
  const img = `${TMP}pandan.jpg`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'lavfi', '-i', 'gradients=s=1080x1350:c0=0x6f9a5a:c1=0xefe6d2:x0=0:y0=0:x1=1080:y1=1350:nb_colors=2', '-frames:v', '1', img]);
  const up = await (await ctx.request.post(`${APP}/api/v1/upload/`, { multipart: { teamId: team, file: { name: 'pandan-latte.jpg', mimeType: 'image/jpeg', buffer: (await import('node:fs')).readFileSync(img) } } })).json();
  if (!up.id) throw new Error(JSON.stringify(up));
  const post = await create({ socialAccountTypes: ['FACEBOOK', 'INSTAGRAM', 'TWITTER'], data: { FACEBOOK: { text, uploadIds: [up.id] }, INSTAGRAM: { text, uploadIds: [up.id] }, TWITTER: { text } } });
  await until(() => getPost(ctx, post.id), (p) => ['POSTED', 'ERROR'].includes(p.status));
  const page = await ctx.newPage();
  await page.goto(`${APP}/posts/${post.id}`);
  await settle(page);
  await page.waitForTimeout(400);
  await save(page, 'post-detail');
  await ctx.close();
}

// Bulk: a CSV of a week's posts, one row refused with its reason, the import's rows open.
if (!only.size || only.has('bulk')) {
  const ctx = await context();
  const team = await teamId(ctx, 'Kopi Senja');
  const day = (d, h) => { const t = new Date(); t.setUTCHours(h - 8, 0, 0, 0); return new Date(t.getTime() + d * 86400_000).toISOString(); };
  const rows = [
    ['Weekend hours', 'Weekend hours: 8am to 10pm at Bangsar, Uptown and Mont Kiara.', day(1, 9), 'FACEBOOK#THREADS#TWITTER'],
    ['Kaya toast', 'Rainy morning? Kaya toast and kopi O for RM12 until 11am.', day(2, 8), 'FACEBOOK#THREADS'],
    ['New beans', 'New beans in from Bukit Tinggi. Chocolatey, low acid, roasted Tuesday.', day(2, 15), 'THREADS#TWITTER#BLUESKY'],
    ['Latte art class', 'Latte art class on Saturday, 10am. Six seats left.', day(3, 11), 'INSTAGRAM#FACEBOOK'],
    ['Cold brew', 'Cold brew in 1-litre bottles, made daily. Pick up at any outlet.', day(4, 10), 'FACEBOOK#TWITTER'],
    ['Catering', 'Coffee cart catering for offices: now booking for December.', day(5, 14), 'FACEBOOK#THREADS#BLUESKY'],
  ];
  const q = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  const csv = ['teamId,title,text,postDate,status,socialAccountTypes', ...rows.map(([title, text, at, types]) => [team, title, text, at, 'SCHEDULED', types].map(q).join(','))].join('\r\n') + '\r\n';
  const page = await ctx.newPage();
  await page.goto(`${APP}/bulk`);
  await settle(page);
  await page.locator('input[type=file]').setInputFiles({ name: 'kopi-senja-week-47.csv', mimeType: 'text/csv', buffer: Buffer.from(csv) });
  await page.getByText('kopi-senja-week-47.csv').first().waitFor();
  await until(async () => (await (await ctx.request.get(`${APP}/api/v1/post-csv-import/?limit=5`)).json()).items[0], (i) => i && i.processedRows === i.totalRows && i.status !== 'PENDING' && i.status !== 'PROCESSING');
  await page.reload();
  await settle(page);
  // the template lists every network the API takes; show the open ones
  await page.evaluate((closed) => document.querySelectorAll('label').forEach((l) => { if (closed.includes(l.textContent.trim())) (l.closest('.check, .checkbox, label') ?? l).style.display = 'none'; }), CLOSED);
  await page.getByText('kopi-senja-week-47.csv').first().click();
  await settle(page);
  await page.waitForTimeout(400);
  await save(page, 'bulk');
  await ctx.close();
}

await browser.close();
rmSync(TMP, { recursive: true, force: true });
