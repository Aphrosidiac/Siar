/**
 * Adapter test harness. Starts the mock network server in-process on a random port and builds a
 * NetworkContext whose fetch rewrites https://<host>/<path> → mock, exactly like the API does in
 * NETWORK_MODE=mock. Every adapter test is self-contained: no shared server, no database.
 *
 *   const h = await harness();
 *   const acc = await h.connect(mastodon, { serverUrl: 'https://mastodon.example' });
 *   const r = await mastodon.publish(h.ctx('MASTODON'), h.input(acc, { text: 'hi' }));
 *   h.state().mastodon.statuses …
 *   await h.close();
 */
import { createServer, type Server } from 'node:http';
import { createHash, randomBytes } from 'node:crypto';
import { AddressInfo } from 'node:net';
import { MockRegistry, type MockRequest } from '@siar/mocks/registry';
import { registerAll } from '@siar/mocks/networks';
import type { AccountRuntime, MediaRef, NetworkAdapter, NetworkContext, NetworkType, PublishInput } from '../src/types.js';

export interface Harness {
  base: string;
  registry: MockRegistry;
  ctx(type: NetworkType, credentials?: Record<string, string>): NetworkContext;
  /** Run the full OAuth round trip through the mock consent screen and return the runtime account. */
  connect(adapter: NetworkAdapter, opts?: { serverUrl?: string; extra?: Record<string, unknown>; options?: Record<string, unknown> }): Promise<AccountRuntime>;
  input(account: AccountRuntime, data: Record<string, any>, media?: MediaRef[]): PublishInput;
  state(): any;
  close(): Promise<void>;
}

export function media(opts: Partial<MediaRef> & { bytes?: Buffer } = {}): MediaRef {
  const bytes = opts.bytes ?? PNG;
  return {
    id: opts.id ?? `upl_${randomBytes(4).toString('hex')}`, type: opts.type ?? 'image', mime: opts.mime ?? 'image/png', ext: opts.ext ?? 'png',
    url: opts.url ?? 'https://media.siar.test/file.png', fileSize: opts.fileSize ?? bytes.length, width: opts.width ?? 64, height: opts.height ?? 64,
    duration: opts.duration ?? null, altText: opts.altText ?? null,
    read: async () => bytes,
    readRange: async (s, e) => bytes.subarray(s, e),
    stream: async () => new Blob([new Uint8Array(bytes)]).stream() as ReadableStream<Uint8Array>,
    poster: (opts.type ?? 'image') === 'video' ? { mime: 'image/png', ext: 'png', read: async () => PNG } : null,
  };
}
export const video = (seconds = 12, size = 2 * 1024 * 1024) => media({ type: 'video', mime: 'video/mp4', ext: 'mp4', duration: seconds, width: 1080, height: 1920, bytes: Buffer.alloc(size, 1), url: 'https://media.siar.test/clip.mp4' });

/** 1×1 PNG */
const PNG = Buffer.from('89504e470d0a1a0a0000000d4948445200000001000000010806000000' + '1f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082', 'hex');

async function body(req: import('node:http').IncomingMessage) { const c: Buffer[] = []; for await (const x of req) c.push(x as Buffer); return Buffer.concat(c); }

export async function harness(): Promise<Harness> {
  const registry = new MockRegistry();
  registerAll(registry);
  const server: Server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const raw = await body(req);
    const m = url.pathname.match(/^\/__host\/([^/]+)(\/.*)?$/);
    if (!m) { res.writeHead(404); return res.end(); }
    const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v ?? '')]));
    const fail = registry.failures.find(f => f.host === m[1] && (m[2] ?? '/').startsWith(f.path) && f.times > 0);
    if (fail) { fail.times--; res.writeHead(fail.status, { 'content-type': 'application/json' }); return res.end(JSON.stringify(fail.body ?? {})); }
    const hit = registry.match(req.method ?? 'GET', m[1], m[2] ?? '/');
    if (!hit) { res.writeHead(404, { 'content-type': 'application/json' }); return res.end(JSON.stringify({ error: `mock: no route for ${req.method} ${m[1]}${m[2]}` })); }
    const ct = headers['content-type'] ?? '';
    let parsed: any = {}; let form: FormData | null = null;
    try {
      if (ct.includes('json') && raw.length) parsed = JSON.parse(raw.toString());
      else if (ct.includes('x-www-form-urlencoded')) parsed = Object.fromEntries(new URLSearchParams(raw.toString()));
      else if (ct.includes('multipart/form-data')) { form = await new Request('http://x', { method: 'POST', headers: { 'content-type': ct }, body: new Uint8Array(raw) }).formData(); parsed = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string')); }
    } catch { parsed = {}; }
    const mreq: MockRequest = { method: req.method ?? 'GET', host: m[1], path: m[2] ?? '/', params: hit.params, query: Object.fromEntries(url.searchParams), headers, raw, body: parsed, form, bearer: headers.authorization?.match(/^(?:Bearer|OAuth)\s+(.+)$/i)?.[1] ?? null };
    try {
      const out = await hit.route.handler(mreq);
      if (out.redirect) { res.writeHead(302, { location: out.redirect, ...(out.headers ?? {}) }); return res.end(); }
      if (out.text !== undefined) { res.writeHead(out.status ?? 200, { 'content-type': 'text/plain', ...(out.headers ?? {}) }); return res.end(out.text); }
      if (out.json === undefined) { res.writeHead(out.status ?? 204, out.headers ?? {}); return res.end(); }
      res.writeHead(out.status ?? 200, { 'content-type': 'application/json', ...(out.headers ?? {}) }); res.end(JSON.stringify(out.json));
    } catch (err) { res.writeHead(500, { 'content-type': 'application/json' }); res.end(JSON.stringify({ error: 'mock crashed', message: (err as Error).message })); }
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const rewrite = (url: string) => { const u = new URL(url); return u.hostname === '127.0.0.1' ? url : `${base}/__host/${u.host}${u.pathname}${u.search}`; };
  const silent = { debug() {}, info() {}, warn() {}, error() {} };

  const ctx = (type: NetworkType, credentials: Record<string, string> = {}): NetworkContext => ({
    mode: 'mock',
    credentials: new Proxy(credentials, { get: (t, k: string) => t[k] ?? `mock-${k}` }),
    redirectUri: `https://api.siar.test/api/v1/social-account/callback/${type}`,
    apiUrl: 'https://api.siar.test',
    log: silent,
    now: () => new Date(),
    fetch: (url, init = {}) => { const { timeoutMs: _t, ...rest } = init; return fetch(rewrite(url), rest); },
  });

  async function connect(adapter: NetworkAdapter, opts: { serverUrl?: string; extra?: Record<string, unknown>; options?: Record<string, unknown> } = {}): Promise<AccountRuntime> {
    const c = ctx(adapter.type);
    let extra: Record<string, unknown> = { ...(opts.extra ?? {}) };
    if (adapter.prepareServer && opts.serverUrl) extra = { ...extra, ...(await adapter.prepareServer(c, opts.serverUrl)) };
    const verifier = randomBytes(32).toString('base64url');
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    const state = randomBytes(12).toString('hex');
    const a = await adapter.authorize(c, { state, codeVerifier: verifier, codeChallenge: challenge, serverUrl: opts.serverUrl ?? null, extra, options: opts.options });
    extra = { ...extra, ...(a.extra ?? {}) };
    // Follow the consent screen until it redirects to our callback.
    let next = rewrite(a.url); let query: Record<string, string> = {};
    for (let i = 0; i < 6; i++) {
      const r = await fetch(next, { redirect: 'manual' });
      const loc = r.headers.get('location');
      if (!loc) throw new Error(`consent did not redirect (HTTP ${r.status}): ${await r.text()}`);
      const u = new URL(loc, next);
      if (u.pathname.includes('/social-account/callback/')) { query = Object.fromEntries(u.searchParams); break; }
      next = rewrite(u.toString());
    }
    if (query.state && query.state !== state && !query.oauth_token) throw new Error('state mismatch');
    const conn = await adapter.exchange(c, { code: query.code ?? query.oauth_verifier ?? '', state, codeVerifier: verifier, serverUrl: opts.serverUrl ?? null, extra, query });
    const channels = conn.profile.channels ?? [];
    return {
      id: `acc_${randomBytes(4).toString('hex')}`, type: adapter.type, externalId: conn.profile.externalId, providerPageId: conn.profile.providerPageId,
      username: conn.profile.username ?? null, displayName: conn.profile.displayName ?? null, channelId: null, channels, token: conn.token,
      serverUrl: opts.serverUrl ?? null, instagramConnectionMethod: conn.profile.instagramConnectionMethod ?? null,
    };
  }

  const input = (account: AccountRuntime, data: Record<string, any>, m: MediaRef[] = []): PublishInput => ({
    account, postId: `post_${randomBytes(4).toString('hex')}`, title: 'Test post', data, media: m,
    resolveUpload: async id => m.find(x => x.id === id) ?? media({ id }), bot: null,
  });

  return { base, registry, ctx, connect, input, state: () => registry.state, close: () => new Promise(r => server.close(() => r())) };
}
