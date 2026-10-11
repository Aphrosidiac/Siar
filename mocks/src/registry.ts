/**
 * The mock network server. Adapters call real URLs; in NETWORK_MODE=mock the API rewrites
 *   https://<host>/<path>  →  http://localhost:3299/__host/<host>/<path>
 * and this server answers as that network would, per its published API docs.
 *
 * State is in memory, per process. GET /__state returns it (tests assert on what was posted);
 * POST /__reset clears it; POST /__fail { host, path, status, body, times } injects failures.
 */
import { randomUUID } from 'node:crypto';

export interface MockRequest {
  method: string;
  host: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string>;
  headers: Record<string, string>;
  raw: Buffer;
  /** Parsed JSON / urlencoded body (or {} ). */
  body: any;
  /** Multipart form, when the request is multipart. */
  form: FormData | null;
  bearer: string | null;
}

export interface MockResponse {
  status?: number;
  json?: unknown;
  text?: string;
  headers?: Record<string, string>;
  redirect?: string;
}

export type Handler = (req: MockRequest) => MockResponse | Promise<MockResponse>;

interface Route { method: string; host: string; re: RegExp; keys: string[]; handler: Handler }

export class MockRegistry {
  routes: Route[] = [];
  /** Free-form per-network state: state.mastodon.statuses … */
  state: Record<string, any> = {};
  failures: { host: string; path: string; status: number; body: unknown; times: number }[] = [];

  on(method: string, host: string, pattern: string, handler: Handler) {
    const keys: string[] = [];
    const re = new RegExp('^' + pattern.replace(/\/$/, '').replace(/:([A-Za-z_]+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }).replace(/\*/g, '.*') + '/?$');
    this.routes.push({ method: method.toUpperCase(), host, re, keys, handler });
  }

  /** Host patterns may start with "*." to match any subdomain (mastodon servers, regional APIs). */
  match(method: string, host: string, path: string) {
    for (const r of this.routes) {
      if (r.method !== method && r.method !== 'ANY') continue;
      const hostOk = r.host === host || (r.host.startsWith('*.') && (host.endsWith(r.host.slice(1)) || host === r.host.slice(2))) || r.host === '*';
      if (!hostOk) continue;
      const m = path.match(r.re);
      if (m) return { route: r, params: Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])])) };
    }
    return null;
  }

  ns<T extends object>(name: string, init: () => T): T {
    if (!this.state[name]) {
      const st = init() as any;
      if (st.tokens && typeof st.tokens === 'object') st.tokens = this.acceptSeeded(name, st.tokens);
      this.state[name] = st;
    }
    return this.state[name];
  }

  /**
   * The dev seed (apps/api/prisma/seed.ts) inserts accounts with `seed-…` access tokens that no
   * mock ever issued. Each network declares what its own token map holds for a user, and a
   * `seed-` token reads as that, so seeded demo accounts pass connection checks and profile reads.
   */
  private seeded = new Map<string, () => unknown>();
  seedToken(name: string, value: () => unknown) { this.seeded.set(name, value); }
  isSeedToken = (t: unknown) => typeof t === 'string' && t.startsWith('seed-') && !t.startsWith('seed-r-');
  private acceptSeeded(name: string, tokens: Record<string, unknown>) {
    return new Proxy(tokens, {
      get: (t, k) => (k in t || !this.isSeedToken(k) || !this.seeded.has(name) ? Reflect.get(t, k) : this.seeded.get(name)!()),
      has: (t, k) => k in t || (this.isSeedToken(k) && this.seeded.has(name)),
    });
  }
}

export const id = (prefix = '') => prefix + randomUUID().replace(/-/g, '').slice(0, 16);
export const num = () => String(Date.now()) + String(Math.floor(Math.random() * 1e6)).padStart(6, '0');

/**
 * The OAuth consent screen every mock network uses: no login, just "Allow" →
 * redirect back with ?code&state. Tests follow the redirect automatically (GET auto-approves).
 */
export function consent(req: MockRequest, opts: { codeParam?: string; extra?: Record<string, string> } = {}): MockResponse {
  const redirect = req.query.redirect_uri ?? req.query.redirect_url ?? req.query.oauth_callback;
  if (!redirect) return { status: 400, json: { error: 'invalid_request', error_description: 'redirect_uri missing' } };
  const u = new URL(redirect);
  u.searchParams.set(opts.codeParam ?? 'code', `mockcode_${id()}`);
  if (req.query.state) u.searchParams.set('state', req.query.state);
  for (const [k, v] of Object.entries(opts.extra ?? {})) u.searchParams.set(k, v);
  if (req.query.deny === '1') { u.searchParams.delete('code'); u.searchParams.set('error', 'access_denied'); }
  return { redirect: u.toString() };
}

export const unauthorized = (msg = 'The access token is invalid') => ({ status: 401, json: { error: msg } });
