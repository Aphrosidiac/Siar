/**
 * Product screenshots for the marketing site, taken from the running dashboard with the demo seed.
 *
 *   pnpm --filter @siar/api db:seed            # fresh demo data first
 *   node apps/site/scripts/shots.mjs [scene…]  # dashboard on :5290, API on :3290
 *
 * Every scene writes public/shots/<name>.webp (2x, light theme) and a dark twin where asked.
 * The composer flow is a sequence (flow-1 … flow-n) the home page plays as a walkthrough.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const APP = process.env.APP_URL ?? 'http://localhost:5290';
const OUT = fileURLToPath(new URL('../public/shots/', import.meta.url));
const TMP = fileURLToPath(new URL('../.shots-tmp/', import.meta.url));
const W = 1440, H = 900;
mkdirSync(OUT, { recursive: true }); mkdirSync(TMP, { recursive: true });

const only = new Set(process.argv.slice(2));
const browser = await chromium.launch();

async function context(theme = 'light', size = { width: W, height: H }) {
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-siar': '1' }, viewport: size, deviceScaleFactor: 2, colorScheme: theme, reducedMotion: 'reduce', locale: 'en-GB', timezoneId: 'Asia/Kuala_Lumpur' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('siar.theme', t); } catch {} }, theme);
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
await scene('accounts', '/social-accounts');
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
  const r = await ctx.request.post(`${APP}/api/v1/social-account/create-portal-link`, { data: { teamId: team.id, socialAccountTypes: ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'FACEBOOK', 'LINKEDIN', 'THREADS'], expiresIn: 24, redirectUrl: `${APP}/social-accounts` } });
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
  for (const n of ['Facebook', 'Threads', 'Google Business']) await page.locator('button').filter({ hasText: new RegExp(`^\\s*${n}`) }).first().click();
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

await browser.close();
rmSync(TMP, { recursive: true, force: true });
