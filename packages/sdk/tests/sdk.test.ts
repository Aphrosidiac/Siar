import { createHmac } from 'node:crypto';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Siar, SiarError, SiarWebhookError, computeSignature, webhooks, toQueryString, parseRetryAfter, OPERATIONS } from '../src/index.js';

interface Call { method: string; url: URL; headers: Headers; body: unknown }
type Handler = (c: Call, n: number) => Response | Promise<Response>;

const json = (data: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json', ...headers } });

/** A fake fetch that records every call and answers from `handler`. */
function fakeFetch(handler: Handler) {
  const calls: Call[] = [];
  const fn = (async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const headers = new Headers(init.headers);
    let body: unknown = init.body;
    if (typeof body === 'string' && headers.get('content-type')?.includes('json')) body = JSON.parse(body);
    const call = { method: init.method ?? 'GET', url: new URL(String(input)), headers, body };
    calls.push(call);
    if (init.signal?.aborted) throw new DOMException('aborted', 'AbortError');
    return handler(call, calls.length);
  }) as typeof fetch;
  return { fn, calls };
}

const client = (handler: Handler, opts: ConstructorParameters<typeof Siar>[0] = {}) => {
  const f = fakeFetch(handler);
  const siar = new Siar({ apiKey: 'sk_test_123', baseUrl: 'http://api.test/', fetch: f.fn, retryDelayMs: 1, ...opts });
  return { siar, calls: f.calls };
};

describe('request building', () => {
  it('generates one method per operation, grouped by prefix', () => {
    const { siar } = client(() => json({}));
    expect(Object.keys(OPERATIONS)).toHaveLength(259);
    expect(typeof siar.post.create).toBe('function');
    expect(typeof siar.socialAccount.connect).toBe('function');
    expect(typeof siar.misc.youtube.getChannelPlaylist).toBe('function');
    expect(typeof siar.misc.google_business.getReviews).toBe('function');
  });

  it('sends JSON bodies with the auth header to the right URL', async () => {
    const { siar, calls } = client(() => json({ id: 'p1' }));
    const res = await siar.post.create({
      teamId: 't1', title: 'Hello', postDate: '2026-10-11T00:00:00Z', status: 'SCHEDULED',
      socialAccountTypes: ['BLUESKY'], data: { BLUESKY: { text: 'Hello' } },
    });
    expect(res.id).toBe('p1');
    expect(calls).toHaveLength(1);
    const c = calls[0];
    expect(c.method).toBe('POST');
    expect(c.url.href).toBe('http://api.test/api/v1/post/');
    expect(c.headers.get('x-api-key')).toBe('sk_test_123');
    expect(c.headers.get('content-type')).toBe('application/json');
    expect((c.body as { data: unknown }).data).toEqual({ BLUESKY: { text: 'Hello' } });
  });

  it('encodes path params and serialises queries (arrays repeat, nulls dropped)', async () => {
    const { siar, calls } = client(() => json({ items: [], total: 0 }));
    await siar.post.get({ id: 'a/b c' });
    await siar.post.getList({ teamId: 't1', platforms: ['TWITTER', 'BLUESKY'], q: null, limit: 5 });
    await siar.misc.youtube.deleteChannelPlaylist({ playlistId: 'PL1' }, { teamId: 't1' });
    expect(calls[0].url.pathname).toBe('/api/v1/post/a%2Fb%20c');
    expect(calls[0].method).toBe('GET');
    expect(calls[0].body).toBeUndefined();
    expect(calls[1].url.searchParams.getAll('platforms')).toEqual(['TWITTER', 'BLUESKY']);
    expect(calls[1].url.searchParams.has('q')).toBe(false);
    expect(calls[1].url.searchParams.get('limit')).toBe('5');
    expect(calls[2].method).toBe('DELETE');
    expect(calls[2].url.pathname + calls[2].url.search).toBe('/api/v1/misc/youtube/playlist/PL1?teamId=t1');
  });

  it('reaches any operation through request(operationId)', async () => {
    const { siar, calls } = client(() => json({ url: 'https://connect' }));
    const r = await siar.request('socialAccount.connect', { body: { type: 'BLUESKY', teamId: 't', redirectUrl: 'https://x.test' } });
    expect(r.url).toBe('https://connect');
    expect(calls[0].url.pathname).toBe('/api/v1/social-account/connect');
    await expect(siar.request('nope.nothing' as never)).rejects.toThrow(/Unknown operationId/);
    await expect(siar.post.get({} as { id: string })).rejects.toThrow(/missing path parameter "id"/);
  });

  it('omits x-api-key when no key is configured', async () => {
    const f = fakeFetch(() => json({ ok: true }));
    const siar = new Siar({ apiKey: '', baseUrl: 'http://api.test', fetch: f.fn });
    await siar.app.getHealth();
    expect(f.calls[0].headers.has('x-api-key')).toBe(false);
  });

  it('helpers', () => {
    expect(toQueryString({ a: 1, b: [1, 2], c: undefined, d: new Date(0) })).toBe('?a=1&b=1&b=2&d=1970-01-01T00%3A00%3A00.000Z');
    expect(parseRetryAfter('3')).toBe(3);
    expect(parseRetryAfter(null)).toBeUndefined();
  });
});

describe('errors', () => {
  it('maps API errors to SiarError with statusCode, message and issues', async () => {
    const { siar } = client(() => json({ statusCode: 400, message: 'Validation failed', issues: [{ code: 'required', message: 'teamId is required', path: ['teamId'] }] }, 400));
    const err = await siar.team.createTeam({ name: 'x' }).catch(e => e);
    expect(err).toBeInstanceOf(SiarError);
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('Validation failed');
    expect(err.issues[0].path).toEqual(['teamId']);
    expect(err.kind).toBe('validation');
    expect(err.operationId).toBe('team.createTeam');
    expect(err.toJSON()).toMatchObject({ statusCode: 400, message: 'Validation failed' });
  });

  it('classifies auth / not found / non-JSON bodies', async () => {
    const { siar } = client((_c, n) => n === 1 ? json({ statusCode: 401, message: 'Invalid API key' }, 401) : new Response('Bad gateway', { status: 404 }));
    const a = await siar.team.getList().catch(e => e);
    expect([a.statusCode, a.kind, a.message]).toEqual([401, 'auth', 'Invalid API key']);
    const b = await siar.team.getTeam({ id: 'x' }).catch(e => e);
    expect([b.statusCode, b.kind, b.message]).toEqual([404, 'not_found', 'Bad gateway']);
  });

  it('times out with code "timeout"', async () => {
    const f = fakeFetch(() => new Promise<Response>(() => {}));
    const slow = (async (u: RequestInfo | URL, init: RequestInit = {}) => {
      void f.fn(u, init);
      return new Promise<Response>((_, rej) => init.signal?.addEventListener('abort', () => rej(new DOMException('aborted', 'AbortError'))));
    }) as typeof fetch;
    const siar = new Siar({ apiKey: 'k', baseUrl: 'http://api.test', fetch: slow, timeoutMs: 20, maxRetries: 0 });
    const err = await siar.team.getList().catch(e => e);
    expect(err).toBeInstanceOf(SiarError);
    expect(err.statusCode).toBe(0);
    expect(err.code).toBe('timeout');
  });
});

describe('retries', () => {
  it('retries idempotent requests on 5xx and 429, then succeeds', async () => {
    const { siar, calls } = client((_c, n) => n === 1 ? json({ statusCode: 503, message: 'busy' }, 503) : n === 2 ? json({ statusCode: 429, message: 'slow down' }, 429, { 'retry-after': '0' }) : json({ items: [], total: 0 }));
    const res = await siar.team.getList();
    expect(res.total).toBe(0);
    expect(calls).toHaveLength(3);
  });

  it('gives up after maxRetries and throws the last error', async () => {
    const { siar, calls } = client(() => json({ statusCode: 500, message: 'boom' }, 500), { maxRetries: 2 });
    const err = await siar.team.getList().catch(e => e);
    expect(err.statusCode).toBe(500);
    expect(calls).toHaveLength(3);
  });

  it('does not retry POST unless the caller opts in', async () => {
    const a = client(() => json({ statusCode: 503, message: 'busy' }, 503));
    await expect(a.siar.team.createTeam({ name: 'Acme' })).rejects.toThrow('busy');
    expect(a.calls).toHaveLength(1);

    const b = client((_c, n) => n === 1 ? json({ statusCode: 503, message: 'busy' }, 503) : json({ id: 't1' }));
    const t = await b.siar.team.createTeam({ name: 'Acme' }, { retry: true });
    expect(t.id).toBe('t1');
    expect(b.calls).toHaveLength(2);
  });

  it('does not retry 4xx or 501', async () => {
    const a = client(() => json({ statusCode: 404, message: 'Not found' }, 404));
    await expect(a.siar.team.getTeam({ id: 'x' })).rejects.toThrow('Not found');
    expect(a.calls).toHaveLength(1);
    const b = client(() => json({ statusCode: 501, message: 'Not implemented' }, 501));
    await expect(b.siar.team.getList()).rejects.toThrow('Not implemented');
    expect(b.calls).toHaveLength(1);
  });

  it('retries network errors on GET', async () => {
    const { siar, calls } = client((_c, n) => { if (n === 1) throw new TypeError('fetch failed'); return json({ items: [], total: 0 }); });
    await siar.team.getList();
    expect(calls).toHaveLength(2);
  });

  it('respects Retry-After, and fails fast when it exceeds maxRetryDelayMs', async () => {
    const { siar } = client(() => json({}));
    expect(siar.retryDelay(0, 2)).toBe(2000);
    const d = siar.retryDelay(3);
    expect(d).toBeGreaterThanOrEqual(4);
    expect(d).toBeLessThanOrEqual(8);

    const slow = client(() => json({ statusCode: 429, message: 'Too many requests' }, 429, { 'retry-after': '120' }), { maxRetryDelayMs: 1000 });
    const err = await slow.siar.team.getList().catch(e => e);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfter).toBe(120);
    expect(slow.calls).toHaveLength(1);

    const started = Date.now();
    const ok = client((_c, n) => n === 1 ? json({ statusCode: 429, message: 'wait' }, 429, { 'retry-after': '1' }) : json({ items: [], total: 0 }));
    await ok.siar.team.getList();
    expect(Date.now() - started).toBeGreaterThanOrEqual(950);
  });
});

describe('pagination', () => {
  it('iterates every page using total', async () => {
    const all = Array.from({ length: 5 }, (_, i) => ({ id: `p${i}` }));
    const { siar, calls } = client(c => {
      const off = Number(c.url.searchParams.get('offset'));
      const lim = Number(c.url.searchParams.get('limit'));
      return json({ items: all.slice(off, off + lim), total: all.length });
    });
    const ids: string[] = [];
    for await (const p of siar.paginate('post.getList', { teamId: 't1' }, { pageSize: 2 })) ids.push(p.id);
    expect(ids).toEqual(['p0', 'p1', 'p2', 'p3', 'p4']);
    expect(calls.map(c => c.url.searchParams.get('offset'))).toEqual(['0', '2', '4']);
    expect(calls[0].url.searchParams.get('teamId')).toBe('t1');
  });

  it('honours maxItems and path params', async () => {
    const { siar, calls } = client(() => json({ items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }], total: 99 }));
    const got: unknown[] = [];
    for await (const d of siar.paginate('webhook.deliveries', {}, { path: { id: 'wh1' }, maxItems: 2 })) got.push(d);
    expect(got).toHaveLength(2);
    expect(calls).toHaveLength(1);
    expect(calls[0].url.pathname).toBe('/api/v1/webhook/wh1/deliveries');
  });

  it('stops on a short page when the response is a bare array', async () => {
    const { siar, calls } = client(c => json(Number(c.url.searchParams.get('offset')) === 0 ? [{ id: 1 }, { id: 2 }] : [{ id: 3 }]));
    const got: unknown[] = [];
    for await (const u of siar.paginate('upload.getList', {}, { pageSize: 2 })) got.push(u);
    expect(got).toHaveLength(3);
    expect(calls).toHaveLength(2);
  });
});

describe('webhooks', () => {
  const secret = 'whsec_test';
  const body = JSON.stringify({ id: 'evt_1', type: 'post.published', createdAt: '2026-10-11T00:00:00Z', organizationId: 'o1', data: { postId: 'p1' } });
  const now = () => Math.floor(Date.now() / 1000);

  it('matches the server signature scheme', () => {
    // hex HMAC-SHA256(secret, `${timestamp}.${rawBody}`) — same as apps/api engine/webhooks.ts
    const expected = createHmac('sha256', 's').update('1700000000.{"a":1}').digest('hex');
    expect(computeSignature('s', 1700000000, '{"a":1}')).toBe(expected);
    expect(computeSignature('s', '1700000000', Buffer.from('{"a":1}'))).toBe(expected);
  });

  it('verifies a good signature (Fetch Headers and Node header objects)', () => {
    const ts = now();
    const h = { 'X-Siar-Signature': computeSignature(secret, ts, body), 'X-Siar-Timestamp': String(ts), 'x-siar-delivery': ['dlv_1'] as string[] };
    expect(webhooks.verify(body, h, secret)).toBe(true);
    expect(webhooks.verify(Buffer.from(body), new Headers(h as unknown as Record<string, string>), secret)).toBe(true);
    const ev = webhooks.constructEvent<{ postId: string }>(body, h, secret);
    expect(ev.type).toBe('post.published');
    expect(ev.data.postId).toBe('p1');
    expect(ev.deliveryId).toBe('dlv_1');
  });

  it('rejects wrong secrets, tampered bodies, stale timestamps and missing headers', () => {
    const ts = now();
    const good = webhooks.sign(body, secret, { timestamp: ts });
    expect(webhooks.verify(body, good, 'other')).toBe(false);
    expect(webhooks.verify(body.replace('p1', 'p2'), good, secret)).toBe(false);
    const old = webhooks.sign(body, secret, { timestamp: ts - 301 });
    expect(webhooks.verify(body, old, secret)).toBe(false);
    expect(webhooks.verify(body, old, secret, 600)).toBe(true);
    expect(webhooks.verify(body, old, secret, 0)).toBe(true);

    const reason = (fn: () => unknown) => { try { fn(); } catch (e) { expect(e).toBeInstanceOf(SiarWebhookError); return (e as SiarWebhookError).reason; } return 'none'; };
    expect(reason(() => webhooks.constructEvent(body, good, 'other'))).toBe('bad_signature');
    expect(reason(() => webhooks.constructEvent(body, old, secret))).toBe('expired');
    expect(reason(() => webhooks.constructEvent(body, {}, secret))).toBe('missing_header');
    expect(reason(() => webhooks.constructEvent(body, { ...good, 'x-siar-timestamp': 'abc' }, secret))).toBe('bad_timestamp');
    expect(reason(() => webhooks.constructEvent('not json', webhooks.sign('not json', secret), secret))).toBe('bad_payload');
    expect(reason(() => webhooks.constructEvent(body, { ...good, 'x-siar-signature': 'zz' }, secret))).toBe('bad_signature');
  });

  it('is available on the client and statically', () => {
    expect(Siar.webhooks.verify(body, webhooks.sign(body, secret), secret)).toBe(true);
    const { siar } = client(() => json({}));
    expect(siar.webhooks.verify(body, webhooks.sign(body, secret), secret)).toBe(true);
  });
});

describe('uploads', () => {
  const upload = { id: 'up1', type: 'image', url: 'https://cdn.test/up1.png' };

  it('uses one multipart/form-data request for small files', async () => {
    const { siar, calls } = client(() => json(upload));
    const res = await siar.uploads.fromFile(Buffer.from('hello'), { teamId: 't1', fileName: 'a.png' });
    expect(res.id).toBe('up1');
    expect(calls).toHaveLength(1);
    expect(calls[0].url.pathname).toBe('/api/v1/upload/');
    const fd = calls[0].body as FormData;
    expect(fd).toBeInstanceOf(FormData);
    expect(fd.get('teamId')).toBe('t1');
    const file = fd.get('file') as File;
    expect(file.name).toBe('a.png');
    expect(file.type).toBe('image/png');
    expect(await file.text()).toBe('hello');
    expect(calls[0].headers.has('content-type')).toBe(false); // fetch sets the boundary
  });

  it('runs init → sign → PUT parts → complete for large files', async () => {
    const data = Buffer.from('0123456789'); // 10 bytes, partSize 4 → 3 parts
    const progress: number[] = [];
    const { siar, calls } = client(async c => {
      const p = c.url.pathname;
      if (p === '/api/v1/upload/multipart/init') return json({ uploadId: 'mu1', path: 'incoming/o/x.mp4', partSize: 4, partCount: 3 });
      if (p === '/api/v1/upload/multipart/sign') return json({ parts: (c.body as { partNumbers: number[] }).partNumbers.map(n => ({ partNumber: n, url: `http://storage.test/part/${n}` })) });
      if (p.startsWith('/part/')) return new Response(null, { status: 200, headers: { etag: `"etag-${p.split('/').pop()}-${await (c.body as Blob).text()}"` } });
      if (p === '/api/v1/upload/multipart/complete') return json({ ...upload, type: 'video' });
      return json({ statusCode: 404, message: 'unexpected ' + p }, 404);
    });
    const res = await siar.uploads.fromFile(data, { teamId: 't1', fileName: 'clip.mp4', multipartThresholdBytes: 5, concurrency: 2, onProgress: p => progress.push(p.uploadedBytes) });
    expect(res.type).toBe('video');

    const init = calls.find(c => c.url.pathname.endsWith('/multipart/init'))!;
    expect(init.body).toEqual({ fileName: 'clip.mp4', mimeType: 'video/mp4', fileSize: 10, teamId: 't1' });
    const sign = calls.find(c => c.url.pathname.endsWith('/multipart/sign'))!;
    expect(sign.body).toMatchObject({ uploadId: 'mu1', path: 'incoming/o/x.mp4', partNumbers: [1, 2, 3] });

    const puts = calls.filter(c => c.method === 'PUT');
    expect(puts).toHaveLength(3);
    for (const p of puts) {
      expect(p.url.host).toBe('storage.test');
      expect(p.headers.has('x-api-key')).toBe(false); // never leak the key to storage
    }
    const complete = calls.find(c => c.url.pathname.endsWith('/multipart/complete'))!;
    expect(complete.body).toEqual({
      uploadId: 'mu1', path: 'incoming/o/x.mp4', teamId: 't1',
      parts: [{ partNumber: 1, etag: '"etag-1-0123"' }, { partNumber: 2, etag: '"etag-2-4567"' }, { partNumber: 3, etag: '"etag-3-89"' }],
    });
    expect(progress.at(-1)).toBe(10);
  });

  it('uses signed URLs returned by init and retries a failed part PUT', async () => {
    let failed = false;
    const { siar, calls } = client(c => {
      const p = c.url.pathname;
      if (p.endsWith('/multipart/init')) return json({ uploadId: 'mu', path: 'x', partSize: 8, parts: [{ partNumber: 1, url: 'http://s.test/1' }, { partNumber: 2, url: 'http://s.test/2' }] });
      if (p === '/2' && !failed) { failed = true; return new Response('oops', { status: 503 }); }
      if (c.method === 'PUT') return new Response(null, { headers: { etag: `e${p}` } });
      return json(upload);
    });
    await siar.uploads.fromFile(new Uint8Array(12), { mimeType: 'video/mp4', multipartThresholdBytes: 1 });
    expect(calls.some(c => c.url.pathname.endsWith('/multipart/sign'))).toBe(false);
    expect(calls.filter(c => c.method === 'PUT')).toHaveLength(3);
  });

  it('aborts the multipart session when a part fails', async () => {
    const { siar, calls } = client(c => {
      const p = c.url.pathname;
      if (p.endsWith('/multipart/init')) return json({ uploadId: 'mu', path: 'x', partSize: 4, parts: [{ partNumber: 1, url: 'http://s.test/1' }, { partNumber: 2, url: 'http://s.test/2' }] });
      if (c.method === 'PUT') return new Response('denied', { status: 403 });
      if (p.endsWith('/multipart/abort')) return json({ success: true });
      return json({ statusCode: 404, message: p }, 404);
    });
    const err = await siar.uploads.fromFile(new Uint8Array(6), { mimeType: 'video/mp4', multipartThresholdBytes: 1 }).catch(e => e);
    expect(err).toBeInstanceOf(SiarError);
    expect(err.statusCode).toBe(403);
    const abort = calls.find(c => c.url.pathname.endsWith('/multipart/abort'));
    expect(abort?.body).toEqual({ uploadId: 'mu', path: 'x' });
    expect(calls.some(c => c.url.pathname.endsWith('/complete'))).toBe(false);
  });

  it('reads local files by path and guesses the MIME type', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'siar-sdk-'));
    const file = join(dir, 'photo.jpg');
    writeFileSync(file, 'jpegbytes');
    const { siar, calls } = client(() => json(upload));
    await siar.uploads.fromFile(file);
    const f = (calls[0].body as FormData).get('file') as File;
    expect([f.name, f.type, await f.text()]).toEqual(['photo.jpg', 'image/jpeg', 'jpegbytes']);
    await expect(siar.uploads.fromFile('https://example.com/a.png')).rejects.toThrow(/fromUrl/);
  });

  it('imports from a URL', async () => {
    const { siar, calls } = client(() => json(upload));
    await siar.uploads.fromUrl('https://example.com/a.png', { teamId: 't1' });
    expect(calls[0].url.pathname).toBe('/api/v1/upload/from-url');
    expect(calls[0].body).toEqual({ url: 'https://example.com/a.png', teamId: 't1' });
  });
});
