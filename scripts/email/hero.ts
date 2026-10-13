/**
 * Renders the transactional-email header art to apps/site/public/email/hero.png (served at
 * siaran.my/email/hero.png): the sign-in fan turned into a broadcast — the Siar mark at the bottom,
 * the 15 network marks arcing above it — on ink, 2x for retina mail apps. Run: pnpm tsx scripts/email/hero.ts
 */
import { createRequire } from 'node:module';
const { chromium } = createRequire(new URL('../../apps/site/package.json', import.meta.url))('playwright');
import { GLYPHS } from '../../apps/web/src/lib/glyphs';

const ORDER = ['TIKTOK', 'YOUTUBE', 'INSTAGRAM', 'FACEBOOK', 'TWITTER', 'THREADS', 'LINKEDIN', 'PINTEREST', 'REDDIT', 'MASTODON', 'DISCORD', 'SLACK', 'BLUESKY', 'GOOGLE_BUSINESS', 'SNAPCHAT'];
const W = 600, H = 252;                 // display size in the email (rendered at 2x)
const R = 196, T = 30, HUB = 30;        // arc radius, tile size, hub radius
const hub = { x: W / 2, y: H - 50 };
const rad = (d: number) => (d * Math.PI) / 180;
const unit = (dx: number, dy: number) => { const l = Math.hypot(dx, dy); return [dx / l, dy / l]; };
// a few marks "lit" so the still reads like the moment a post lands
const LIT = new Set(['INSTAGRAM', 'LINKEDIN', 'THREADS', 'BLUESKY', 'YOUTUBE']);

const nodes = ORDER.map((type, i) => {
  const a = rad(-166 + (152 * i) / (ORDER.length - 1));   // left → right across the top
  const x = hub.x + R * Math.cos(a), y = hub.y + R * Math.sin(a) * 0.86;
  const cx = hub.x + (x - hub.x) * 0.55, cy = hub.y - R * 0.42;
  const [vx, vy] = unit(x - cx, y - cy);
  const edge = T / 2 / Math.max(Math.abs(vx), Math.abs(vy)) + 3;
  const [wx, wy] = unit(cx - hub.x, cy - hub.y);
  const d = `M${(hub.x + (HUB + 3) * wx).toFixed(1)} ${(hub.y + (HUB + 3) * wy).toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${(x - edge * vx).toFixed(1)} ${(y - edge * vy).toFixed(1)}`;
  return { type, x, y, d, lit: LIT.has(type) };
});
const S = 1.22;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><radialGradient id="g" cx="50%" cy="100%" r="75%"><stop offset="0" stop-color="#2a2925"/><stop offset="1" stop-color="#0b0b0a"/></radialGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
${nodes.map(n => `<path d="${n.d}" fill="none" stroke="${n.lit ? 'rgba(243,239,228,.55)' : 'rgba(243,239,228,.16)'}" stroke-width="${n.lit ? 1.4 : 1}"/>`).join('')}
${nodes.map(n => `<g transform="translate(${(n.x - T / 2).toFixed(1)} ${(n.y - T / 2).toFixed(1)})"><rect width="${T}" height="${T}" rx="8" fill="${n.lit ? '#f3efe4' : '#1a1a18'}" stroke="${n.lit ? '#f3efe4' : 'rgba(243,239,228,.18)'}"/><path transform="translate(${(T - 15) / 2} ${(T - 15) / 2}) scale(${15 / 24})" d="${GLYPHS[n.type]}" fill="${n.lit ? '#0b0b0a' : '#f3efe4'}"/></g>`).join('')}
<circle cx="${hub.x}" cy="${hub.y}" r="${HUB + 10}" fill="rgba(243,239,228,.06)"/>
<circle cx="${hub.x}" cy="${hub.y}" r="${HUB}" fill="#f3efe4"/>
<g transform="translate(${(hub.x - 12.05 * S).toFixed(1)} ${(hub.y - 11.2 * S).toFixed(1)}) scale(${S})" fill="#0b0b0a"><path d="M5.6 7.2a4 4 0 1 1-2.4 7.2l-1.6 1.2.5-2.6a4 4 0 0 1 3.5-5.8Z"/><path transform="rotate(-38 5.6 11.2)" d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z"/><path d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z"/><path transform="rotate(38 5.6 11.2)" d="M11 10.5 20 8.7a2.5 2.5 0 0 1 0 5L11 11.9Z"/></g>
</svg>`;

const out = new URL('../../apps/site/public/email/hero.png', import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
await page.setContent(`<html><body style="margin:0;background:#0b0b0a">${svg}</body></html>`);
await page.locator('svg').screenshot({ path: out });
await browser.close();
console.log('wrote', out);
