// Siar landing pages: SEO acceptance gate (docs/seo/ACCEPTANCE.md, gates A and B).
// Builds apps/site into a temp folder, checks every built page against ACCEPTANCE.md, then runs Lighthouse
// (mobile + desktop, all four categories) on every sitemap page, served over HTTPS as siaran.my.
//
//   pnpm --filter @siar/site seo-gate                  build + static checks + Lighthouse on every page
//   pnpm --filter @siar/site seo-gate -- --no-build    reuse the last build
//   pnpm --filter @siar/site seo-gate -- --no-lh       static checks only
//   pnpm --filter @siar/site seo-gate -- --only=/pricing,/platforms   Lighthouse on these paths only
//
// Exit 0 only when there are zero failures. Report: <tmp>/siar-seo-gate/report.md and report.json.
// Needs openssl (self-signed cert for the local HTTPS server) and Chrome.
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const WT = path.resolve(SITE, '../..');
const HERE = process.env.SEO_GATE_DIR ?? path.join(os.tmpdir(), 'siar-seo-gate');
fs.mkdirSync(HERE, { recursive: true });
const OUT = process.env.SIAR_OUT ?? path.join(HERE, 'dist');
const ORIGIN = 'https://siaran.my';
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const only = args.find((a) => a.startsWith('--only='))?.slice(7).split(',');

const fails = [];
const warns = [];
const fail = (where, rule, what) => fails.push({ where, rule, what });
const warn = (where, rule, what) => warns.push({ where, rule, what });

// ---------- build ----------
if (!flag('--no-build')) {
  fs.rmSync(OUT, { recursive: true, force: true });
  console.error('building apps/site →', OUT);
  execSync(`pnpm --filter @siar/site exec astro build --outDir ${OUT}`, { cwd: WT, stdio: ['ignore', 'ignore', 'inherit'] });
}

// ---------- page map ----------
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
const files = walk(OUT);
const fileSet = new Set(files.map((f) => '/' + path.relative(OUT, f)));
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pathOf = (f) => { const r = '/' + path.relative(OUT, f).replace(/\\/g, '/'); return r === '/index.html' ? '/' : r.replace(/\/index\.html$/, '').replace(/\.html$/, ''); };
const resolveFile = (p) => {
  p = decodeURIComponent(p);
  if (fileSet.has(p) && !p.endsWith('/')) return p;
  const a = (p === '/' ? '' : p.replace(/\/$/, '')) + '/index.html';
  if (fileSet.has(a)) return a;
  if (fileSet.has(p + '.html')) return p + '.html';
  return null;
};

// ---------- sitemaps ----------
const read = (p) => fs.readFileSync(path.join(OUT, p), 'utf8');
const locs = (x) => [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const sitemap = new Map(); // path -> lastmod
if (!fileSet.has('/sitemap-index.xml')) fail('/sitemap-index.xml', 'S-sitemap', 'missing');
else {
  for (const child of locs(read('/sitemap-index.xml'))) {
    const cp = new URL(child).pathname;
    if (!fileSet.has(cp)) { fail(cp, 'S-sitemap', 'child sitemap listed in the index does not exist'); continue; }
    const x = read(cp);
    if (/<priority>|<changefreq>/.test(x)) fail(cp, 'S-sitemap', 'priority/changefreq present');
    for (const m of x.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
      const loc = m[1].match(/<loc>([^<]+)<\/loc>/)?.[1].trim();
      const lm = m[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
      if (!loc.startsWith(ORIGIN + '/') && loc !== ORIGIN) fail(loc, 'S-sitemap', 'loc not on https://siaran.my');
      const p = new URL(loc).pathname.replace(/\/$/, '') || '/';
      if (sitemap.has(p)) fail(p, 'S-sitemap', 'listed twice');
      sitemap.set(p, lm ?? null);
      if (!lm) fail(p, 'S-sitemap', 'no lastmod');
    }
  }
  const today = new Date().toISOString().slice(0, 10);
  const lms = [...sitemap.values()].filter(Boolean);
  if (lms.length && lms.filter((d) => d.startsWith(today)).length / lms.length > 0.5) warn('sitemap', 'S-sitemap', `${lms.filter((d) => d.startsWith(today)).length}/${lms.length} lastmod = today (build time, not content time?)`);
}

// robots
if (!fileSet.has('/robots.txt')) fail('/robots.txt', 'S-robots', 'missing');
else {
  const r = read('/robots.txt');
  if (/^\s*Disallow:\s*\/\s*$/m.test(r)) fail('/robots.txt', 'S-robots', 'Disallow: /');
  if (!new RegExp(`Sitemap:\\s*${ORIGIN}/sitemap-index.xml`).test(r)) fail('/robots.txt', 'S-robots', 'no absolute Sitemap line');
}
for (const f of ['/favicon.ico', '/404.html']) if (!fileSet.has(f)) fail(f, 'S-files', 'missing');

// ---------- per-page ----------
const BANNED = ['seamless', 'effortless', 'powerful', 'robust', 'cutting-edge', 'revolutionary', 'game-changing', 'best-in-class', 'world-class', 'supercharge', 'unlock', 'empower', 'leverage', 'streamline', 'reliable', 'enterprise-grade', 'production-grade', 'battle-tested', 'rock-solid', 'guaranteed', 'never fails', 'zero duplicates', '99.9%', 'white-label', 'white label', 'free forever', 'free plan', 'free api', 'meta partner', 'official partner', 'certified', '#1', 'cheapest', 'half the price', 'in seconds', 'in minutes', 'all networks', 'every network', 'unlimited everything', 'skip the review', 'no app review'];
const LEGAL = new Set(['/terms', '/privacy', '/refunds', '/data-deletion', '/delivery']);
const LEFTOVER = [/\{\{/, /\bTODO\b/, /\blorem\b/i, /\[OWNER/, /\bundefined\b/, /\bNaN\b/, /\[object Object\]/, /\bTBD\b/];
const pages = new Map();
const titles = new Map(), descs = new Map(), canons = new Map();
const linkChecks = []; // [fromPath, href]

for (const f of htmlFiles) {
  const p = pathOf(f);
  const html = fs.readFileSync(f, 'utf8');
  const $ = cheerio.load(html);
  const robots = $('meta[name="robots"]').attr('content') ?? '';
  const noindex = /noindex/i.test(robots);
  const inSm = sitemap.has(p);
  const special = p === '/404' || p === '/og-card';
  pages.set(p, { $, html, noindex, inSm });
  if (special) { if (p === '/404' && !noindex) fail(p, 'S-404', '404 page must be noindex'); continue; }
  if (!inSm && !noindex) fail(p, 'S-index', 'indexable page missing from the sitemap');
  if (inSm && noindex) fail(p, 'S-index', 'sitemap page is noindex');
  if (!inSm) continue;

  // head
  const t = $('title'); const d = $('meta[name="description"]'); const c = $('link[rel="canonical"]');
  if (t.length !== 1) fail(p, 'S-title', `${t.length} <title>`);
  if (d.length !== 1) fail(p, 'S-desc', `${d.length} meta descriptions`);
  if (c.length !== 1) fail(p, 'S-canonical', `${c.length} canonicals`);
  const title = t.first().text().trim(); const desc = d.attr('content')?.trim() ?? ''; const canon = c.attr('href') ?? '';
  const want = p === '/' ? ORIGIN : ORIGIN + p;
  if (canon !== want) fail(p, 'S-canonical', `canonical ${canon} ≠ ${want}`);
  if (title.length > 60) fail(p, 'S-title', `title ${title.length} chars (max 60): "${title}"`);
  if (title.length < 25) fail(p, 'S-title', `title ${title.length} chars (min 25): "${title}"`);
  if (desc.length < 120 || desc.length > 160) fail(p, 'S-desc', `description ${desc.length} chars (120–160)`);
  titles.set(title, [...(titles.get(title) ?? []), p]); descs.set(desc, [...(descs.get(desc) ?? []), p]); canons.set(canon, [...(canons.get(canon) ?? []), p]);
  const lang = $('html').attr('lang');
  const isMs = p === '/ms' || p.startsWith('/ms/');
  if (lang !== (isMs ? 'ms' : 'en')) fail(p, 'S-lang', `html lang="${lang}", want "${isMs ? 'ms' : 'en'}"`);
  const ogl = $('meta[property="og:locale"]').attr('content');
  if (isMs && ogl !== 'ms_MY') fail(p, 'S-lang', `og:locale ${ogl} on a Malay page`);
  if (!$('meta[name="viewport"]').length) fail(p, 'S-head', 'no viewport');
  for (const k of ['og:title', 'og:description', 'og:type', 'og:url', 'og:image']) if (!$(`meta[property="${k}"]`).attr('content')) fail(p, 'S-og', `${k} missing`);
  if ($('meta[property="og:url"]').attr('content') !== want) fail(p, 'S-og', 'og:url ≠ canonical');
  const ogi = $('meta[property="og:image"]').attr('content') ?? '';
  if (!ogi.startsWith(ORIGIN + '/') || !resolveFile(new URL(ogi).pathname)) fail(p, 'S-og', `og:image ${ogi} not a built file on siaran.my`);
  if (!$('meta[name="twitter:card"]').length) fail(p, 'S-og', 'twitter:card missing');
  const hl = $('link[rel="alternate"][hreflang]');
  if (hl.length) fail(p, 'S-hreflang', 'hreflang present: the plan says BM pages are not translations (no hreflang)');

  // headings
  const h1 = $('h1');
  if (h1.length !== 1) fail(p, 'S-h1', `${h1.length} <h1>`);
  if (h1.length && !h1.first().text().trim()) fail(p, 'S-h1', 'empty h1');
  let prev = 1;
  $('main h1, main h2, main h3, main h4, main h5, main h6').each((_, el) => {
    const n = +el.tagName[1];
    if (!$(el).text().trim()) fail(p, 'S-headings', `empty <${el.tagName}>`);
    if (n > prev + 1) fail(p, 'S-headings', `<${el.tagName}> "${$(el).text().trim().slice(0, 50)}" skips a level after h${prev}`);
    prev = n;
  });

  // JSON-LD
  const lds = [];
  $('script[type="application/ld+json"]').each((_, el) => { try { lds.push(JSON.parse($(el).text())); } catch { fail(p, 'S-ld', 'JSON-LD does not parse'); } });
  const nodes = [];
  const walkLd = (o) => { if (Array.isArray(o)) o.forEach(walkLd); else if (o && typeof o === 'object') { nodes.push(o); Object.values(o).forEach(walkLd); } };
  lds.forEach(walkLd);
  const types = nodes.flatMap((n) => [].concat(n['@type'] ?? []));
  for (const bad of ['FAQPage', 'AggregateRating', 'Review', 'QAPage', 'HowTo']) if (types.includes(bad)) fail(p, 'S-ld', `${bad} markup (baseline: no FAQ/HowTo rich-result markup, no ratings without real reviews)`);
  if (nodes.some((n) => n.aggregateRating || n.review)) fail(p, 'S-ld', 'aggregateRating/review property');
  const bodyText = $('body').clone().find('script,style,noscript').remove().end().text().replace(/\s+/g, ' ');
  for (const n of nodes) {
    for (const k of ['url', 'item', 'mainEntityOfPage']) {
      const v = typeof n[k] === 'string' ? n[k] : null;
      if (v && v.startsWith(ORIGIN)) { const u = new URL(v); const tp = u.pathname.replace(/\/$/, '') || '/'; if (!resolveFile(tp) && !sitemap.has(tp)) fail(p, 'S-ld', `${k} ${v} does not resolve`); }
    }
    if (n['@type'] === 'Offer' && n.price != null && +n.price > 0) {
      const pr = String(n.price).replace(/\.0+$/, '');
      if (!bodyText.includes(pr)) fail(p, 'S-ld', `Offer price ${n.price} ${n.priceCurrency ?? ''} not visible on the page`);
    }
    if (n.dateModified) {
      const dt = new Date(n.dateModified);
      const vis = [dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }), dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }), n.dateModified.slice(0, 10)];
      if (!vis.some((v) => bodyText.includes(v))) warn(p, 'S-ld', `dateModified ${n.dateModified} not shown on the page`);
    }
  }
  const bc = nodes.find((n) => n['@type'] === 'BreadcrumbList');
  if (bc && p !== '/') { const last = [].concat(bc.itemListElement ?? []).at(-1); const li = typeof last?.item === 'string' ? last.item : last?.item?.['@id']; if (li && li !== want) fail(p, 'S-ld', `breadcrumb last item ${li} ≠ canonical`); }
  if (!bc && p !== '/') warn(p, 'S-ld', 'no BreadcrumbList');

  // body text
  const prose = $('main').clone().find('pre,code,script,style,.code,[data-code],table').remove().end().text().replace(/\s+/g, ' ');
  const tableText = $('main table').text().replace(/\s+/g, ' ');
  for (const re of LEFTOVER) if (re.test(prose)) fail(p, 'S-leftover', `text matches ${re}`);
  const lower = ' ' + prose.toLowerCase() + ' ';
  for (const w of BANNED) {
    const re = new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\#%]/g, '\\$&')}([^a-z]|$)`);
    if (re.test(lower)) {
      const i = lower.search(re); const ctx = prose.slice(Math.max(0, i - 40), i + w.length + 40).trim();
      const negated = /\b(not|never|no)\s+$/.test(lower.slice(Math.max(0, i - 8), i + 1));
      (LEGAL.has(p) || negated ? warn : fail)(p, 'S-words', `banned "${w}": …${ctx}…`);
    }
    if (re.test(' ' + tableText.toLowerCase() + ' ')) warn(p, 'S-words', `"${w}" inside a table (rival fact? check it is quoted and dated)`);
  }
  const words = prose.split(' ').filter(Boolean).length;
  if (words < 250 && !LEGAL.has(p) && !p.startsWith('/docs')) warn(p, 'S-thin', `${words} words in <main>`);
  if (html.length > 1024 * 1024) fail(p, 'S-size', `${Math.round(html.length / 1024)} KB HTML`);
  else if (html.length > 400 * 1024) warn(p, 'S-size', `${Math.round(html.length / 1024)} KB HTML`);

  // anchors
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href'); const txt = $(el).text().replace(/\s+/g, ' ').trim();
    if (/^unified social media api$/i.test(txt)) { const u = new URL(href, want); if (u.origin !== ORIGIN || (u.pathname !== '/' && u.pathname !== '')) fail(p, 'S-anchor', `"${txt}" links to ${href}, must only link to /`); }
    if (!txt && !$(el).attr('aria-label') && !$(el).find('img[alt]').filter((_, i) => $(i).attr('alt')).length && !$(el).find('svg[aria-label],[aria-label]').length) fail(p, 'S-anchor', `link to ${href} has no text`);
    if (/^(click here|here|read more|learn more|more)$/i.test(txt)) fail(p, 'S-anchor', `non-descriptive anchor "${txt}" → ${href}`);
    linkChecks.push([p, href, 'a']);
  });
  $('img').each((_, el) => {
    const s = $(el).attr('src');
    if ($(el).attr('alt') === undefined) fail(p, 'S-img', `img ${s} has no alt`);
    if (!$(el).attr('width') || !$(el).attr('height')) fail(p, 'S-img', `img ${s} has no width/height`);
    if (s) linkChecks.push([p, s, 'src']);
    for (const part of ($(el).attr('srcset') ?? '').split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) linkChecks.push([p, u, 'src']); }
  });
  $('source[srcset]').each((_, el) => { for (const part of $(el).attr('srcset').split(',')) { const u = part.trim().split(/\s+/)[0]; if (u) linkChecks.push([p, u, 'src']); } });
  $('link[href]').each((_, el) => { if ($(el).attr('rel') !== 'canonical') linkChecks.push([p, $(el).attr('href'), 'src']); });
  $('script[src]').each((_, el) => linkChecks.push([p, $(el).attr('src'), 'src']));
}
for (const [m, k] of [[titles, 'title'], [descs, 'description'], [canons, 'canonical']]) for (const [v, ps] of m) if (ps.length > 1) fail(ps.join(', '), 'S-unique', `duplicate ${k}: "${v}"`);
for (const p of sitemap.keys()) if (!pages.has(p) && !resolveFile(p)) fail(p, 'S-sitemap', 'sitemap URL has no built page');

// internal links
const seen = new Set();
for (const [from, href, kind] of linkChecks) {
  if (!href || /^(mailto:|tel:|javascript:|data:)/.test(href)) continue;
  let u; try { u = new URL(href, ORIGIN + (from === '/' ? '/' : from)); } catch { fail(from, 'S-links', `bad URL ${href}`); continue; }
  if (u.origin !== ORIGIN) continue;
  const key = from + ' ' + href; if (seen.has(key)) continue; seen.add(key);
  const p = u.pathname;
  if (u.pathname === (from === '/' ? '/' : from) && u.hash && kind === 'a') {
    const id = decodeURIComponent(u.hash.slice(1)); if (id && !pages.get(from)?.$(`[id="${id}"]`).length && !pages.get(from)?.$(`a[name="${id}"]`).length) fail(from, 'S-links', `#${id} has no target on the page`);
    continue;
  }
  if (kind === 'a') {
    if (p !== '/' && p.endsWith('/')) fail(from, 'S-links', `${href}: trailing slash (redirect/duplicate)`);
    if (/\.html$/.test(p) || /[A-Z]/.test(p)) fail(from, 'S-links', `${href}: not canonical form`);
  }
  const r = resolveFile(p);
  if (!r) { if (!/^\/(b|v1|api|media)\//.test(p)) fail(from, 'S-links', `${href} → 404`); continue; }
  const tp = p.replace(/\/$/, '') || '/';
  if (kind === 'a' && pages.get(tp)?.noindex && !['/404'].includes(tp)) warn(from, 'S-links', `${href} links to a noindex page`);
  if (kind === 'a' && u.hash) { const tgt = pages.get(tp); const id = decodeURIComponent(u.hash.slice(1)); if (tgt && id && !tgt.$(`[id="${id}"]`).length) fail(from, 'S-links', `${href}: #${id} missing on target`); }
}

// orphans: sitemap pages no other sitemap page links to
const inbound = new Map([...sitemap.keys()].map((k) => [k, 0]));
for (const [from, href, kind] of linkChecks) { if (kind !== 'a') continue; try { const u = new URL(href, ORIGIN + from); if (u.origin === ORIGIN) { const tp = u.pathname.replace(/\/$/, '') || '/'; if (tp !== from && inbound.has(tp)) inbound.set(tp, inbound.get(tp) + 1); } } catch {} }
for (const [p, n] of inbound) if (n === 0 && p !== '/') fail(p, 'S-orphan', 'no internal link from any other page');

// ---------- Lighthouse ----------
const lh = [];
if (!flag('--no-lh')) {
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm', '.md': 'text/markdown; charset=utf-8' };
  const handler = (req, res) => {
    const u = new URL(req.url, 'http://x');
    let f = resolveFile(u.pathname); let status = 200;
    if (!f) { f = '/404.html'; status = 404; }
    let body = fs.readFileSync(path.join(OUT, f));
    const type = types[path.extname(f)] ?? 'application/octet-stream';
    const h = { 'content-type': type, 'cache-control': /\.(css|js|woff2|svg|png|jpg|webp|avif)$/.test(f) ? 'public, max-age=2592000, immutable' : 'no-cache' };
    if (/text|json|xml|svg|javascript/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')) { body = zlib.gzipSync(body); h['content-encoding'] = 'gzip'; }
    res.writeHead(status, h); res.end(body);
  };
  // https://siaran.my → this server (self-signed cert trusted by SPKI); http://siaran.my → one 301 to https, like nginx
  const key = path.join(HERE, 'key.pem'), cert = path.join(HERE, 'cert.pem'), spkiFile = path.join(HERE, 'spki.txt');
  if (!fs.existsSync(spkiFile)) {
    execSync(`openssl req -x509 -newkey rsa:2048 -nodes -days 30 -subj /CN=siaran.my -addext subjectAltName=DNS:siaran.my -keyout ${key} -out ${cert}`, { stdio: 'ignore' });
    fs.writeFileSync(spkiFile, execSync(`openssl x509 -in ${cert} -pubkey -noout | openssl pkey -pubin -outform der | openssl dgst -sha256 -binary | base64`).toString().trim());
  }
  const server = https.createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert) }, handler);
  const plain = http.createServer((req, res) => { res.writeHead(301, { location: 'https://siaran.my' + req.url }); res.end(); });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  await new Promise((r) => plain.listen(0, '127.0.0.1', r));
  const port = server.address().port; const pport = plain.address().port;
  const spki = fs.readFileSync(path.join(HERE, 'spki.txt'), 'utf8').trim();
  const { default: lighthouse } = await import('lighthouse');
  const chromeLauncher = await import('chrome-launcher');
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', `--host-resolver-rules=MAP siaran.my:443 127.0.0.1:${port}, MAP siaran.my:80 127.0.0.1:${pport}`, `--ignore-certificate-errors-spki-list=${spki}`, '--no-first-run'] });
  const targets = [...sitemap.keys()].filter((p) => !only || only.includes(p));
  const desktop = (await import('lighthouse/core/config/desktop-config.js')).default;
  for (const p of targets) {
    for (const ff of ['mobile', 'desktop']) {
      const url = `https://siaran.my${p}`;
      let r;
      try { r = await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, ff === 'desktop' ? desktop : undefined); }
      catch (e) { fail(p, 'L-run', `${ff}: lighthouse error ${e.message}`); continue; }
      if (r.lhr.categories.performance.score < 1) {
        // lab variance: take the median of three runs for performance
        const runs = [r];
        for (let i = 0; i < 2; i++) { try { runs.push(await lighthouse(url, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] }, ff === 'desktop' ? desktop : undefined)); } catch {} }
        runs.sort((a, b) => a.lhr.categories.performance.score - b.lhr.categories.performance.score);
        r = runs[Math.floor(runs.length / 2)];
      }
      const cats = r.lhr.categories; const row = { p, ff };
      for (const [k, v] of Object.entries(cats)) {
        row[k] = Math.round(v.score * 100);
        if (v.score < 1) {
          const bad = v.auditRefs.filter((a) => a.weight > 0 && r.lhr.audits[a.id].score !== null && r.lhr.audits[a.id].score < 1).map((a) => `${a.id}${r.lhr.audits[a.id].displayValue ? ' (' + r.lhr.audits[a.id].displayValue + ')' : ''}`);
          fail(p, `L-${k}`, `${ff} ${Math.round(v.score * 100)}: ${bad.join('; ')}`);
        }
      }
      row.lcp = r.lhr.audits['largest-contentful-paint']?.displayValue; row.cls = r.lhr.audits['cumulative-layout-shift']?.displayValue; row.tbt = r.lhr.audits['total-blocking-time']?.displayValue;
      if (r.lhr.runtimeError) fail(p, 'L-run', `${ff}: ${r.lhr.runtimeError.code}`);
      lh.push(row);
      console.error(`${ff.padEnd(7)} ${p.padEnd(50)} P${row.performance} A${row.accessibility} BP${row['best-practices']} SEO${row.seo}  LCP ${row.lcp}`);
    }
  }
  await chrome.kill(); server.close(); plain.close();
}

// ---------- report ----------
const rep = path.join(HERE, 'report');
const md = [`# Siar SEO acceptance: ${new Date().toISOString()}`, '', `Pages built: ${htmlFiles.length}. Sitemap URLs: ${sitemap.size}. Lighthouse runs: ${lh.length}.`, '', `**${fails.length} failures, ${warns.length} warnings.** Pass = 0 failures.`, '', '## Failures', '', ...fails.map((f) => `- \`${f.rule}\` ${f.where}: ${f.what}`), '', '## Warnings', '', ...warns.map((f) => `- \`${f.rule}\` ${f.where}: ${f.what}`), '', '## Lighthouse', '', '| Page | Form | Perf | A11y | BP | SEO | LCP | CLS | TBT |', '|---|---|---|---|---|---|---|---|---|', ...lh.map((r) => `| ${r.p} | ${r.ff} | ${r.performance} | ${r.accessibility} | ${r['best-practices']} | ${r.seo} | ${r.lcp} | ${r.cls} | ${r.tbt} |`)].join('\n');
fs.writeFileSync(rep + '.md', md);
fs.writeFileSync(rep + '.json', JSON.stringify({ fails, warns, lh }, null, 1));
console.log(`${fails.length} failures, ${warns.length} warnings → ${rep}.md`);
process.exit(fails.length ? 1 : 0);
