import { badRequest } from './errors.js';

/** offset/limit pagination → { items, total } (wire shape). limit defaults to 10, max 100. */
export function pageOf(q: Record<string, any>, max = 100) {
  const offset = q.offset === undefined ? 0 : Number(q.offset);
  const limit = q.limit === undefined ? 10 : Number(q.limit);
  if (!Number.isInteger(offset) || offset < 0) throw badRequest('offset must be a non-negative integer', [{ code: 'invalid', message: 'Invalid offset', path: ['offset'] }]);
  if (!Number.isInteger(limit) || limit < 1 || limit > max) throw badRequest(`limit must be between 1 and ${max}`, [{ code: 'invalid', message: 'Invalid limit', path: ['limit'] }]);
  return { skip: offset, take: limit };
}

export const listOf = <T>(items: T[], total: number) => ({ items, total });

/** Dates → ISO strings, BigInt → number, recursively (JSON-safe). */
export function plain<T>(v: T): any {
  return JSON.parse(JSON.stringify(v, (_k, x) => (typeof x === 'bigint' ? Number(x) : x)));
}

/** Keep only keys the client actually sent (PATCH semantics). */
export function sent<T extends object>(body: T, keys: (keyof T)[]): Partial<T> {
  const out: Partial<T> = {};
  for (const k of keys) if (body && Object.prototype.hasOwnProperty.call(body, k)) out[k] = body[k];
  return out;
}
