import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';

const target = process.env.SIAR_API ?? 'http://localhost:3290';
const contractPath = fileURLToPath(new URL('../../packages/contract/openapi.json', import.meta.url));

/**
 * `virtual:post-schema` — the per-network `data` schemas and `firstComment` limits of the
 * post-create body, cut out of the OpenAPI contract at build time (refs resolved). The composer
 * renders its network forms from this, so a contract change shows up in the UI without edits.
 */
function postSchema(): Plugin {
  const id = 'virtual:post-schema';
  return {
    name: 'siar-post-schema',
    resolveId: (s) => (s === id ? '\0' + id : null),
    load(s) {
      if (s !== '\0' + id) return null;
      this.addWatchFile(contractPath);
      const doc = JSON.parse(readFileSync(contractPath, 'utf8'));
      const resolve = (node: any, seen = new Set<string>()): any => {
        if (Array.isArray(node)) return node.map((n) => resolve(n, seen));
        if (!node || typeof node !== 'object') return node;
        if (node.$ref) {
          if (seen.has(node.$ref)) return {};
          const target = node.$ref.split('/').slice(1).reduce((a: any, k: string) => a[k], doc);
          return resolve(target, new Set([...seen, node.$ref]));
        }
        const out: any = {};
        for (const [k, v] of Object.entries(node)) {
          // Drop prose, but keep a *property* that happens to be named "description" (its value is an object).
          if ((k === 'description' || k === 'example') && typeof v === 'string') continue;
          if (k === 'examples' || k === 'example') continue;
          out[k] = resolve(v, seen);
        }
        return out;
      };
      const op = doc.paths['/api/v1/post/'].post;
      const body = resolve(op.requestBody.content['application/json'].schema);
      const data = body.properties.data.properties;
      const fc = body.properties.firstComment?.properties ?? {};
      const firstComment = Object.fromEntries(Object.entries<any>(fc).map(([k, v]) => [k, v.maxLength ?? null]));
      return `export default ${JSON.stringify({ data, firstComment })};`;
    },
  };
}

export default defineConfig({
  plugins: [vue(), postSchema()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: {
    port: 5290,
    strictPort: true,
    // Regex keys with the trailing slash: a bare '/api' or '/b' prefix also swallows SPA routes like /api-keys and /billing.
    proxy: Object.fromEntries(['^/api/', '^/media/', '^/b/', '^/mock-billing/'].map((p) => [p, { target, changeOrigin: false }])),
  },
  preview: { port: 5290 },
  build: { target: 'es2022', sourcemap: false, chunkSizeWarningLimit: 900 },
});
