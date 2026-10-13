/**
 * When a page's own content last changed: the last commit touching the files that produce its main
 * content (not the shared header/footer). One date feeds the sitemap lastmod, TechArticle dateModified
 * and the visible "Updated" line, so the three never disagree. Unknown pages get no date.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const REPO = path.resolve(SITE, '../..');
const ADAPTER = { 'x-api': 'twitter', 'google-business-profile-api': 'google-business' };

function sources(p) {
  const s = (f) => path.join(SITE, 'src', f);
  if (p === '/') return [s('pages/index.astro'), s('components/home'), s('lib/snippets.ts')];
  if (p === '/pricing') return [s('pages/pricing.astro'), s('components/PricingTables.astro'), s('components/PlanCards.astro'), path.join(REPO, 'apps/api/src/domain/plans.ts')];
  if (p.startsWith('/docs/api')) return [s('pages/docs/api'), s('components/OpDoc.astro'), s('components/SchemaFields.astro'), path.join(REPO, 'packages/contract/openapi.json')];
  if (p.startsWith('/use-cases')) return [s('pages/use-cases'), s('lib/usecases.ts')];
  const net = p.match(/^\/([a-z-]+-api)(\/errors)?$/);
  if (net) {
    const a = ADAPTER[net[1]] ?? net[1].replace(/-api$/, '');
    return [s(`pages/[api]/${net[2] ? 'errors' : 'index'}.astro`), s('lib/networks.ts'), s('components/NetworkFacts.astro'), path.join(REPO, `packages/networks/src/adapters/${a}.ts`)];
  }
  for (const ext of ['.astro', '.mdx', '/index.astro', '/index.mdx']) if (existsSync(s(`pages${p}${ext}`))) return [s(`pages${p}${ext}`)];
  return [];
}

const cache = new Map();
/** ISO date (YYYY-MM-DD) of the last commit that changed this path's content, or undefined. */
export function updatedAt(urlPath) {
  const p = urlPath.replace(/\/$/, '') || '/';
  if (cache.has(p)) return cache.get(p);
  const files = sources(p).filter((f) => existsSync(f));
  let d;
  if (files.length) {
    try { d = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...files], { cwd: REPO, encoding: 'utf8' }).trim() || undefined; } catch { d = undefined; }
  }
  cache.set(p, d);
  return d;
}
