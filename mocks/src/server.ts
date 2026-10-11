import { createServer, type IncomingMessage } from 'node:http';
import { MockRegistry, type MockRequest } from './registry.js';
import { registerAll } from './networks/index.js';

const PORT = Number(process.env.MOCK_PORT ?? 3299);
export const registry = new MockRegistry();
registerAll(registry);

async function readBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
}

async function parse(raw: Buffer, headers: Record<string, string>, url: URL) {
  const ct = headers['content-type'] ?? '';
  let body: any = {};
  let form: FormData | null = null;
  try {
    if (ct.includes('application/json') && raw.length) body = JSON.parse(raw.toString('utf8'));
    else if (ct.includes('application/x-www-form-urlencoded')) body = Object.fromEntries(new URLSearchParams(raw.toString('utf8')));
    else if (ct.includes('multipart/form-data')) {
      form = await new Request(url, { method: 'POST', headers: { 'content-type': ct }, body: new Uint8Array(raw) }).formData();
      body = Object.fromEntries([...form.entries()].filter(([, v]) => typeof v === 'string'));
    }
  } catch { body = {}; }
  return { body, form };
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  const send = (status: number, payload: unknown, headers: Record<string, string> = {}) => {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    res.writeHead(status, { 'content-type': typeof payload === 'string' ? 'text/plain' : 'application/json', ...headers });
    res.end(text);
  };
  try {
    if (url.pathname === '/__state') return send(200, registry.state);
    if (url.pathname === '/__reset') { registry.state = {}; registry.failures = []; return send(200, { ok: true }); }
    if (url.pathname === '/__health') return send(200, { ok: true, routes: registry.routes.length });
    const raw = await readBody(req);
    if (url.pathname === '/__fail') { registry.failures.push({ times: 1, ...JSON.parse(raw.toString() || '{}') }); return send(200, { ok: true }); }

    const m = url.pathname.match(/^\/__host\/([^/]+)(\/.*)?$/);
    if (!m) return send(404, { error: 'mock: use /__host/<host>/<path>' });
    const host = m[1];
    const path = m[2] ?? '/';
    const headers = Object.fromEntries(Object.entries(req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : String(v ?? '')]));
    const fail = registry.failures.find(f => f.host === host && path.startsWith(f.path) && f.times > 0);
    if (fail) { fail.times--; return send(fail.status, fail.body ?? { error: 'injected failure' }); }

    const hit = registry.match(req.method ?? 'GET', host, path);
    if (!hit) return send(404, { error: `mock: no route for ${req.method} ${host}${path}` });
    const { body, form } = await parse(raw, headers, url);
    const mreq: MockRequest = {
      method: req.method ?? 'GET', host, path, params: hit.params, query: Object.fromEntries(url.searchParams), headers, raw, body, form,
      bearer: headers.authorization?.match(/^(?:Bearer|OAuth)\s+(.+)$/i)?.[1] ?? null,
    };
    const out = await hit.route.handler(mreq);
    if (out.redirect) { res.writeHead(302, { location: out.redirect, ...(out.headers ?? {}) }); return res.end(); }
    if (out.text !== undefined) { res.writeHead(out.status ?? 200, { 'content-type': 'text/plain', ...(out.headers ?? {}) }); return res.end(out.text); }
    if (out.json === undefined) { res.writeHead(out.status ?? 204, out.headers ?? {}); return res.end(); }
    return send(out.status ?? 200, out.json, out.headers);
  } catch (err) {
    return send(500, { error: 'mock crashed', message: (err as Error).message });
  }
});

server.listen(PORT, '127.0.0.1', () => console.log(`mock networks on http://127.0.0.1:${PORT} (${registry.routes.length} routes)`));
