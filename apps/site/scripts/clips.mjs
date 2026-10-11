/**
 * Screen recordings of the real dashboard for the home walkthrough: public/clips/<step>.mp4 plus a
 * poster (<step>.webp, first frame). Recorded with the demo seed, a drawn cursor and real typing.
 *
 *   node apps/site/scripts/clips.mjs [clip…]   # dashboard on :5290, API on :3290, mocks on :3299
 *
 * Writes demo data (connects LinkedIn for Halo Fitness, schedules a post for Kopi Senja): reseed after.
 * Frames come from the CDP screencast, which sends a frame only when something changes; they are sorted
 * (they can arrive out of order) and resampled to 30 fps, each capture held until the next one.
 */
import { chromium } from 'playwright';
import { execFileSync } from 'node:child_process';
import { mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';

const APP = 'http://localhost:5290';
const OUT = new URL('../public/clips/', import.meta.url).pathname;
const TMP = new URL('../.clips-tmp/', import.meta.url).pathname;
const W = 1200, H = 750; // 16:10, a little narrower than a laptop so the UI reads larger in the frame
mkdirSync(OUT, { recursive: true });
const only = new Set(process.argv.slice(2));
const want = (n) => !only.size || only.has(n);
const browser = await chromium.launch();

// a drawn pointer (headless captures have none) with a ring on each click
const CURSOR = () => {
  const put = () => {
    if (document.getElementById('rec-cursor')) return;
    const c = document.createElement('div');
    c.id = 'rec-cursor';
    c.innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24"><path d="M5 3l14 8.2-6.3 1.3 3.6 6.6-2.7 1.4-3.6-6.6L5 18.6z" fill="#0b0b0a" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>';
    Object.assign(c.style, { position: 'fixed', left: '0', top: '0', zIndex: '2147483647', pointerEvents: 'none', transform: `translate(${innerWidth * 0.62}px, ${innerHeight * 0.7}px)`, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.25))' });
    document.body.appendChild(c);
    const style = document.createElement('style');
    style.textContent = '@keyframes rec-ring { from { transform: translate(-50%,-50%) scale(.3); opacity: .55 } to { transform: translate(-50%,-50%) scale(1); opacity: 0 } }';
    document.head.appendChild(style);
    addEventListener('mousemove', (e) => { c.style.transform = `translate(${e.clientX - 5}px, ${e.clientY - 3}px)`; }, true);
    addEventListener('mousedown', (e) => {
      const r = document.createElement('div');
      Object.assign(r.style, { position: 'fixed', left: `${e.clientX}px`, top: `${e.clientY}px`, width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(11,11,10,.35)', zIndex: '2147483646', pointerEvents: 'none', animation: 'rec-ring 450ms ease-out forwards' });
      document.body.appendChild(r); setTimeout(() => r.remove(), 500);
    }, true);
  };
  if (document.body) put(); else addEventListener('DOMContentLoaded', put);
};

async function context(size = { width: W, height: H }) {
  at = { x: size.width * 0.62, y: size.height * 0.7 };
  const ctx = await browser.newContext({ extraHTTPHeaders: { 'x-siar': '1' }, viewport: size, deviceScaleFactor: 2, colorScheme: 'light', locale: 'en-GB', timezoneId: 'Asia/Kuala_Lumpur' });
  await ctx.addInitScript(() => { try { localStorage.setItem('siar.theme', 'light'); } catch {} });
  await ctx.addInitScript(CURSOR);
  const res = await ctx.request.post(`${APP}/api/v1/auth/login`, { data: { email: 'demo@siar.dev', password: 'demo-password-123' } });
  if (!res.ok()) throw new Error(`login failed: ${res.status()}`);
  return ctx;
}

async function settle(page) {
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(300);
}

// eased pointer travel, then a click with a beat either side
let at = { x: W * 0.62, y: H * 0.7 };
async function glide(page, x, y, ms = 520) {
  const n = Math.max(12, Math.round(ms / 16)), from = { ...at };
  for (let k = 1; k <= n; k++) {
    const t = k / n, e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    await page.mouse.move(from.x + (x - from.x) * e, from.y + (y - from.y) * e);
    await page.waitForTimeout(16);
  }
  at = { x, y };
}
async function click(page, locator, { dx = 0.5, dy = 0.5, ms } = {}) {
  const b = await locator.boundingBox();
  if (!b) throw new Error(`no box for ${locator}`);
  await glide(page, b.x + b.width * dx, b.y + b.height * dy, ms);
  await page.waitForTimeout(120);
  await page.mouse.down(); await page.waitForTimeout(70); await page.mouse.up();
  await page.waitForTimeout(160);
}

async function record(page, name, run) {
  if (!want(name)) { await run(); return; }
  const dir = `${TMP}${name}/`; mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    frames.push({ data, t: metadata.timestamp, got: Date.now() / 1000 });
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: page.viewportSize().width * 2, maxHeight: page.viewportSize().height * 2, everyNthFrame: 1 });
  await page.waitForTimeout(250);
  await run();
  await page.waitForTimeout(900); // hold the result
  const end = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  await cdp.detach();
  frames.sort((a, b) => a.t - b.t);
  // frame timestamps run on the browser's clock, behind ours: move the end onto that clock
  const lag = frames.map((f) => f.got - f.t).sort((a, b) => a - b)[Math.floor(frames.length / 2)];
  const stop = end - lag;
  // resample to a steady 30 fps: each output frame shows the latest capture at or before its time
  frames.forEach((f, i) => writeFileSync(`${dir}u${i}.jpg`, Buffer.from(f.data, 'base64')));
  const FPS = 30, total = Math.ceil((stop - frames[0].t) * FPS);
  for (let k = 0, j = 0; k < total; k++) {
    const t = frames[0].t + k / FPS;
    while (j + 1 < frames.length && frames[j + 1].t <= t) j++;
    symlinkSync(`${dir}u${j}.jpg`, `${dir}s${String(k).padStart(5, '0')}.jpg`);
  }
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', `${dir}s%05d.jpg`,
    '-vf', 'scale=1920:1200:flags=lanczos:out_color_matrix=bt709,format=yuv420p',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '24', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
    '-movflags', '+faststart', '-an', `${OUT}${name}.mp4`]);
  execFileSync('cwebp', ['-quiet', '-q', '82', '-resize', '1920', '1200', `${dir}u0.jpg`, '-o', `${OUT}${name}.webp`]);
  const dur = stop - frames[0].t;
  console.log('clip', name, `${dur.toFixed(1)}s`, `${frames.length} frames`);
}

// 01 Connect: the hosted link a customer opens; they connect LinkedIn and land back on the page
if (want('connect')) {
  const ctx = await context({ width: 1000, height: 625 }); // the portal is a narrow column: a smaller window shows it larger
  const teams = await (await ctx.request.get(`${APP}/api/v1/team?limit=20`)).json();
  const team = teams.items.find((t) => t.name === 'Halo Fitness') ?? teams.items[0];
  const r = await ctx.request.post(`${APP}/api/v1/social-account/create-portal-link`, { data: { teamId: team.id, socialAccountTypes: ['INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'LINKEDIN'], expiresIn: 24, redirectUrl: `${APP}/social-accounts` } });
  const { url } = await r.json();
  const page = await ctx.newPage();
  // the mock network's test profile is named after the brand, as a real one would be
  await page.addInitScript(() => {
    const fix = () => document.querySelectorAll('body *').forEach((el) => { for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.includes('Siar Test')) n.nodeValue = n.nodeValue.replace('Siar Test', '@halofitness'); });
    addEventListener('DOMContentLoaded', () => { new MutationObserver(fix).observe(document.body, { childList: true, subtree: true, characterData: true }); fix(); });
  });
  await page.goto(url.replace(/^https?:\/\/[^/]+/, APP));
  await settle(page);
  await page.mouse.move(at.x, at.y);
  await record(page, 'connect', async () => {
    await page.waitForTimeout(400);
    await click(page, page.getByRole('button', { name: 'Connect', exact: true }).first(), { ms: 700 });
    await page.getByText('LinkedIn connected.').waitFor({ timeout: 8_000 });
    await settle(page);
    await page.waitForTimeout(500);
  });
  await ctx.close();
}

// 02–04 one continuous session in the composer: write once, tailor Threads, schedule
if (want('write') || want('tailor') || want('schedule')) {
  const ctx = await context();
  const page = await ctx.newPage();
  await page.goto(`${APP}/compose`);
  await settle(page);
  await page.mouse.move(at.x, at.y);
  const tile = (n) => page.locator('button').filter({ hasText: new RegExp(`^\\s*${n}`) }).first();
  await record(page, 'write', async () => {
    for (const n of ['Facebook', 'Threads', 'Google Business']) await click(page, tile(n), { ms: 420 });
    const box = page.locator('textarea').first();
    await click(page, box, { dx: 0.3, dy: 0.3, ms: 500 });
    await box.pressSequentially('Pandan latte is back from Friday at Bangsar, Uptown and Mont Kiara. Iced or hot?', { delay: 16 });
  });
  await record(page, 'tailor', async () => {
    await click(page, page.getByRole('tab', { name: 'Threads', exact: true }), { ms: 520 });
    // bring the Threads fields up smoothly (a click on the box would jump the page)
    await page.evaluate(() => window.scrollTo({ top: 250, behavior: 'smooth' }));
    await page.waitForTimeout(650);
    const own = page.locator('textarea:visible').first();
    await click(page, own, { dx: 0.3, dy: 0.3, ms: 420 });
    await own.press('ControlOrMeta+a');
    await own.pressSequentially('Pandan latte is back Friday. Iced or hot? 🌿', { delay: 22 });
  });
  await record(page, 'schedule', async () => {
    await click(page, page.getByRole('spinbutton', { name: 'Hour' }).first(), { ms: 560 });
    await page.keyboard.type('0930', { delay: 90 });
    await page.waitForTimeout(250);
    await click(page, page.getByRole('button', { name: /Schedule post/ }), { ms: 520 });
    await page.waitForTimeout(900);
    await settle(page);
  });
  await ctx.close();
}

// 05 Measure: analytics, flipping between networks
if (want('measure')) {
  const ctx = await context();
  const page = await ctx.newPage();
  await page.goto(`${APP}/analytics`);
  await settle(page);
  await page.mouse.move(at.x, at.y);
  await record(page, 'measure', async () => {
    for (const n of ['Facebook', 'TikTok', 'Threads']) {
      await click(page, page.locator('button.nchip').filter({ hasText: new RegExp(`^\\s*${n}\\s*$`) }).first(), { ms: 480 });
      await page.waitForTimeout(500);
    }
  });
  await ctx.close();
}

await browser.close();
rmSync(TMP, { recursive: true, force: true });
