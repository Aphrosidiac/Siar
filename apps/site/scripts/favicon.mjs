// Renders public/favicon.svg to public/favicon.ico (16, 32 and 48 px PNG entries).
// Some clients and Bing ask for /favicon.ico at the root. Run: node apps/site/scripts/favicon.mjs
import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const pub = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public');
const svg = readFileSync(path.join(pub, 'favicon.svg'), 'utf8');
const sizes = [16, 32, 48];
const browser = await chromium.launch({ channel: 'chrome' });
const pngs = [];
for (const s of sizes) {
  const page = await browser.newPage({ viewport: { width: s, height: s }, deviceScaleFactor: 1 });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${s}" height="${s}" `)}</body></html>`);
  pngs.push(await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: s, height: s } }));
  await page.close();
}
await browser.close();

// ICO: 6-byte header, 16-byte entry per image, then the PNG data.
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(pngs.length, 4);
let offset = 6 + 16 * pngs.length;
const entries = pngs.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(sizes[i] % 256, 0); e.writeUInt8(sizes[i] % 256, 1);
  e.writeUInt8(0, 2); e.writeUInt8(0, 3); e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6);
  e.writeUInt32LE(png.length, 8); e.writeUInt32LE(offset, 12);
  offset += png.length;
  return e;
});
writeFileSync(path.join(pub, 'favicon.ico'), Buffer.concat([header, ...entries, ...pngs]));
console.log('favicon.ico', sizes.join(', '));
