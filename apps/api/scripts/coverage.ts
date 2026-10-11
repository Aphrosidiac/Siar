/**
 * Contract coverage: which OpenAPI operations have a handler. Exits 1 if any are missing.
 *   pnpm --filter @siar/api exec tsx --env-file=.env scripts/coverage.ts [--json]
 */
import '../src/modules/index.js';
import { implemented, loadSpec } from '../src/platform/routes.js';

const spec = loadSpec();
const have = implemented();
const rows: { operationId: string; method: string; path: string; done: boolean }[] = [];
for (const [path, ops] of Object.entries<any>(spec.paths)) for (const [method, op] of Object.entries<any>(ops)) rows.push({ operationId: op.operationId, method: method.toUpperCase(), path, done: have.has(op.operationId) });
const missing = rows.filter(r => !r.done);
if (process.argv.includes('--json')) console.log(JSON.stringify(rows, null, 1));
else {
  const byGroup = new Map<string, { done: number; total: number }>();
  for (const r of rows) { const g = r.operationId.split('.').slice(0, r.operationId.startsWith('misc.') ? 2 : 1).join('.'); const v = byGroup.get(g) ?? { done: 0, total: 0 }; v.total++; if (r.done) v.done++; byGroup.set(g, v); }
  for (const [g, v] of [...byGroup].sort()) console.log(`${v.done === v.total ? '✓' : '·'} ${g.padEnd(28)} ${v.done}/${v.total}`);
  console.log(`\n${rows.length - missing.length}/${rows.length} operations implemented`);
  if (missing.length) console.log('missing:\n' + missing.map(m => `  ${m.operationId}  ${m.method} ${m.path}`).join('\n'));
}
process.exit(missing.length ? 1 : 0);
