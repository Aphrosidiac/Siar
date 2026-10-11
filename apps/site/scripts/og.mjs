/**
 * Renders the share card (src/pages/og-card.astro) to public/og.png at 1200×630.
 *   node apps/site/scripts/og.mjs        # site dev server on :4290
 */
import { chromium } from 'playwright';
const OUT = new URL('../public/og.png', import.meta.url).pathname;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'light', reducedMotion: 'reduce' });
await page.goto('http://localhost:4290/og-card', { waitUntil: 'networkidle' });
await page.evaluate(() => { document.querySelector('astro-dev-toolbar')?.remove(); document.querySelectorAll('[data-reveal],[data-lines]').forEach((e) => e.classList.add('in')); return document.fonts.ready; });
await page.waitForTimeout(400);
await page.locator('.card').screenshot({ path: OUT });
await browser.close();
console.log('og', OUT);
