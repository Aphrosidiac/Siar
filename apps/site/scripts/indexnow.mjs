// Tell IndexNow engines (Bing, Yandex, Seznam, Naver; Bing feeds ChatGPT search and Copilot) which URLs changed.
// Run after a deploy, never before: node apps/site/scripts/indexnow.mjs [url…]   (no args = every sitemap URL)
// The key file public/<key>.txt must already be live at https://siaran.my/<key>.txt.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const KEY = 'f951eb9754502deb86d63bfec972f56e';
const HOST = 'siaran.my';
const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [...readFileSync(dist + 'sitemap-0.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urls.length} URL(s)`);
if (res.status >= 400) process.exitCode = 1;
