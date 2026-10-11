// Builds Siar's OpenAPI document.
//
// Siar's public API is wire-compatible with bundle.social's v1 API (docs/PLAN.md D1): same paths,
// operation ids, request and response shapes. The shapes are taken from their published spec
// (docs/reference/<date>/swagger.json); their prose is not. Every `description` and `example`
// is stripped here, and our own wording comes from overlay/descriptions.json. Operations that
// only exist on our side (dashboard auth, API keys, webhooks, bio pages, portal…) are added from
// overlay/extra-paths.json.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..');
const refDir = join(root, '../../docs/reference');
const latest = readdirSync(refDir).filter(d => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort().pop();
const ref = JSON.parse(readFileSync(join(refDir, latest, 'swagger.json'), 'utf8'));

const strip = v => {
  if (Array.isArray(v)) return v.map(strip);
  if (v && typeof v === 'object') {
    const out = {};
    for (const [k, x] of Object.entries(v)) {
      // Prose annotations are strings; a *property* called "description" is a schema object.
      if ((k === 'description' && typeof x === 'string') || k === 'example' || k === 'examples') continue;
      out[k] = strip(x);
    }
    return out;
  }
  if (typeof v === 'string') return v.replace(/bundle\.social/gi, 'Siar').replace(/bundlesocial/gi, 'siar');
  return v;
};

/** Reference operations that need no API key on Siar. */
const PUBLIC_OPS = new Set(['app.getHealth']);

const read = f => JSON.parse(readFileSync(join(root, 'overlay', f), 'utf8'));
const descriptions = read('descriptions.json');
const { extraPaths: extra } = await import('../overlay/extra-paths.mjs');

const paths = {};
for (const [p, ops] of Object.entries(ref.paths)) {
  paths[p] = {};
  for (const [m, op] of Object.entries(ops)) {
    const o = strip(op);
    if (descriptions[o.operationId]) o.description = descriptions[o.operationId];
    if (PUBLIC_OPS.has(o.operationId)) o.security = [];
    paths[p][m] = o;
  }
}
for (const [p, ops] of Object.entries(extra)) paths[p] = { ...(paths[p] ?? {}), ...ops };

const doc = {
  openapi: '3.0.2',
  info: {
    title: 'Siar API',
    version: '1.0.0',
    description: 'One REST API to publish, schedule, comment on and measure social media across 15 networks. Authenticate with your organization API key in the x-api-key header.',
    contact: { name: 'FF DEV STUDIO', email: 'hello@ffdev.studio', url: 'https://ffdev.studio' },
  },
  servers: [{ url: process.env.SIAR_API_URL ?? 'https://api.siar.dev' }],
  security: [{ ApiKeyAuth: [] }],
  components: { securitySchemes: { ApiKeyAuth: { type: 'apiKey', name: 'x-api-key', in: 'header' } } },
  tags: [...new Set(Object.values(paths).flatMap(o => Object.values(o).flatMap(x => x.tags ?? [])))].map(name => ({ name })),
  paths,
};
writeFileSync(join(root, 'openapi.json'), JSON.stringify(doc, null, 1));
const ops = Object.values(paths).reduce((n, o) => n + Object.keys(o).length, 0);
console.log(`openapi.json: ${ops} operations (${latest} reference + overlay)`);
