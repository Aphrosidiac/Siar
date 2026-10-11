import { createHash, createPublicKey, verify } from 'node:crypto';
import { id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Bluesky (atproto): the entryway/PDS (bsky.social + pds.siar.test), plc.directory and the video
 * service. Accepts both session kinds the adapter uses: app-password Bearer JWTs and OAuth DPoP
 * tokens (proof signature, htm/htu, nonce and `ath` are verified for real).
 * Test credentials: identifier siartest.bsky.social, app password abcd-efgh-ijkl-mnop.
 */
export default function bluesky(m: MockRegistry) {
  const s = () => m.ns('bluesky', () => ({
    access: {} as Record<string, number>, refresh: {} as Record<string, true>, oauth: {} as Record<string, { x: string }>, par: {} as Record<string, any>, codes: {} as Record<string, any>,
    records: {} as Record<string, any>, blobs: {} as Record<string, any>, jobs: {} as Record<string, any>,
  }));
  const DID = 'did:plc:siartest1234567890abcdef';
  const FRIEND = 'did:plc:friend0000000000000000';
  const PDS = 'https://pds.siar.test';
  const ISSUER = 'https://bsky.social';
  const me = { did: DID, handle: 'siartest.bsky.social', displayName: 'Siar Test', avatar: 'https://cdn.bsky.app/img/avatar/siartest.jpg', description: 'Testing Siar' };
  const friend = { did: FRIEND, handle: 'friend.bsky.social', displayName: 'A Friend', avatar: 'https://cdn.bsky.app/img/avatar/friend.jpg' };
  const author = (did: string) => (did === DID ? me : friend);
  const b64 = (o: unknown) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const jwt = (extra: Record<string, unknown>) => `${b64({ alg: 'ES256K', typ: 'JWT' })}.${b64({ sub: DID, ...extra })}.${id('sig')}`;
  const cidOf = (v: unknown) => 'bafyrei' + createHash('sha256').update(JSON.stringify(v)).digest('hex').slice(0, 40);
  const nonceFor = (host: string) => `nonce-${host}`;
  const bad = (status: number, error: string, message: string): MockResponse => ({ status, json: { error, message } });

  /** Verify a DPoP proof; returns the key's x (the binding) or an error response. */
  const checkDpop = (req: MockRequest, token: string | null, rs: boolean): { x: string } | MockResponse => {
    const nonceErr: MockResponse = { status: rs ? 401 : 400, json: { error: 'use_dpop_nonce', error_description: 'Authorization server requires nonce in DPoP proof' }, headers: { 'DPoP-Nonce': nonceFor(req.host), 'WWW-Authenticate': 'DPoP error="use_dpop_nonce"' } };
    const proof = req.headers.dpop;
    if (!proof) return bad(400, 'invalid_dpop_proof', 'DPoP proof required');
    try {
      const [h, p, sig] = proof.split('.');
      const header = JSON.parse(Buffer.from(h, 'base64url').toString());
      const payload = JSON.parse(Buffer.from(p, 'base64url').toString());
      const ok = verify('sha256', Buffer.from(`${h}.${p}`), { key: createPublicKey({ key: header.jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' }, Buffer.from(sig, 'base64url'));
      if (header.typ !== 'dpop+jwt' || !ok) return bad(400, 'invalid_dpop_proof', 'Invalid DPoP signature');
      if (payload.htm !== req.method || payload.htu !== `https://${req.host}${req.path}`) return bad(400, 'invalid_dpop_proof', 'DPoP htm/htu mismatch');
      if (payload.nonce !== nonceFor(req.host)) return nonceErr;
      if (token && payload.ath !== createHash('sha256').update(token).digest('base64url')) return bad(401, 'invalid_token', 'DPoP ath mismatch');
      return { x: header.jwk.x };
    } catch { return bad(400, 'invalid_dpop_proof', 'Malformed DPoP proof'); }
  };

  /** Resource-server auth: Bearer (app password) or DPoP. Returns null when authorised. */
  const guard = (req: MockRequest): MockResponse | null => {
    const auth = req.headers.authorization ?? '';
    if (!auth) return bad(401, 'AuthMissing', 'Authentication Required');
    if (auth.startsWith('DPoP ')) {
      const token = auth.slice(5);
      const bound = s().oauth[token];
      if (!bound) return bad(400, 'InvalidToken', 'Token could not be verified');
      const r = checkDpop(req, token, true);
      if (!('x' in r)) return r;
      return r.x === bound.x ? null : bad(401, 'invalid_token', 'DPoP key mismatch');
    }
    const token = auth.replace(/^Bearer\s+/i, '');
    if (!s().access[token]) return bad(400, 'InvalidToken', 'Token could not be verified');
    return null;
  };

  const postView = (rec: any) => {
    const { repo } = parse(rec.uri);
    const like = Object.values(s().records).find((r: any) => r.value.$type === 'app.bsky.feed.like' && r.value.subject.uri === rec.uri && r.uri.includes(DID));
    const imgs = rec.value.embed?.images;
    return {
      uri: rec.uri, cid: rec.cid, author: author(repo), record: rec.value, indexedAt: rec.value.createdAt,
      likeCount: 5, repostCount: 1, quoteCount: 2, replyCount: Object.values(s().records).filter((r: any) => r.value.reply?.parent?.uri === rec.uri).length,
      ...(imgs ? { embed: { $type: 'app.bsky.embed.images#view', images: imgs.map((i: any) => ({ thumb: 'https://cdn.bsky.app/thumb.jpg', fullsize: 'https://cdn.bsky.app/full.jpg', alt: i.alt })) } } : {}),
      viewer: like ? { like: (like as any).uri } : {},
    };
  };
  const parse = (uri: string) => { const p = uri.replace('at://', '').split('/'); return { repo: p[0], collection: p[1], rkey: p[2] }; };
  const fanReply = (rootUri: string) => ({ uri: `at://${FRIEND}/app.bsky.feed.post/3fanreply0000`, cid: cidOf('fan' + rootUri), author: friend, record: { $type: 'app.bsky.feed.post', text: 'Great post!', createdAt: new Date().toISOString() }, likeCount: 2, replyCount: 0, indexedAt: new Date().toISOString() });
  const thread = (rec: any, root: boolean): any => ({
    $type: 'app.bsky.feed.defs#threadViewPost', post: postView(rec),
    replies: [
      ...Object.values(s().records).filter((r: any) => r.value.reply?.parent?.uri === rec.uri).map((r: any) => thread(r, false)),
      ...(root ? [{ $type: 'app.bsky.feed.defs#threadViewPost', post: fanReply(rec.uri), replies: [] }] : []),
    ],
  });

  // ── the PDS, reachable as the entryway and as the user's own host ──
  for (const H of ['bsky.social', 'pds.siar.test']) {
    const x = (name: string) => `/xrpc/${name}`;

    m.on('POST', H, x('com.atproto.server.createSession'), req => {
      if (![me.handle, DID].includes(req.body.identifier) || req.body.password !== 'abcd-efgh-ijkl-mnop') return bad(401, 'AuthenticationRequired', 'Invalid identifier or password');
      const accessJwt = jwt({ scope: 'com.atproto.appPass', exp: Math.floor(Date.now() / 1000) + 7200 });
      const refreshJwt = jwt({ scope: 'com.atproto.refresh', jti: id() });
      s().access[accessJwt] = 1; s().refresh[refreshJwt] = true;
      return { json: { accessJwt, refreshJwt, handle: me.handle, did: DID, didDoc: { id: DID, service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: PDS }] } } };
    });
    m.on('POST', H, x('com.atproto.server.refreshSession'), req => {
      if (!req.bearer || !s().refresh[req.bearer]) return bad(400, 'ExpiredToken', 'Token has expired');
      delete s().refresh[req.bearer];
      const accessJwt = jwt({ scope: 'com.atproto.appPass', exp: Math.floor(Date.now() / 1000) + 7200 });
      const refreshJwt = jwt({ scope: 'com.atproto.refresh', jti: id() });
      s().access[accessJwt] = 1; s().refresh[refreshJwt] = true;
      return { json: { accessJwt, refreshJwt, handle: me.handle, did: DID } };
    });
    m.on('POST', H, x('com.atproto.server.deleteSession'), req => { if (req.bearer) delete s().refresh[req.bearer]; return { status: 200, json: {} }; });
    m.on('GET', H, x('com.atproto.identity.resolveHandle'), req => {
      const h = req.query.handle;
      return h === me.handle ? { json: { did: DID } } : h === friend.handle ? { json: { did: FRIEND } } : bad(400, 'InvalidRequest', 'Unable to resolve handle');
    });
    m.on('GET', H, x('app.bsky.actor.getProfile'), req => guard(req) ?? { json: { ...author(req.query.actor), followersCount: 120, followsCount: 30, postsCount: Object.values(s().records).filter((r: any) => r.value.$type === 'app.bsky.feed.post').length } });

    m.on('POST', H, x('com.atproto.repo.uploadBlob'), req => {
      const g = guard(req); if (g) return g;
      if (req.raw.length > 1_000_000) return bad(400, 'BlobTooLarge', 'This file is too large. It is 1.0MB but the maximum size is 976.56KB');
      const mime = req.headers['content-type'] ?? 'application/octet-stream';
      if (!/^(image|video)\//.test(mime)) return bad(400, 'InvalidMimeType', `Unsupported mime type ${mime}`);
      const cid = 'bafkrei' + createHash('sha256').update(req.raw).digest('hex').slice(0, 40);
      const blob = { $type: 'blob', ref: { $link: cid }, mimeType: mime, size: req.raw.length };
      s().blobs[cid] = blob;
      return { json: { blob } };
    });
    m.on('POST', H, x('com.atproto.repo.createRecord'), req => {
      const g = guard(req); if (g) return g;
      const { repo, collection, rkey, record } = req.body;
      if (repo !== DID) return bad(400, 'InvalidRequest', 'Invalid repo');
      if (collection === 'app.bsky.feed.post') {
        const n = [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(record.text ?? '')].length;
        if (n > 300) return bad(400, 'InvalidRequest', 'Record/text must not be longer than 300 graphemes');
        for (const i of record.embed?.images ?? record.embed?.media?.images ?? []) if (!s().blobs[i.image?.ref?.$link]) return bad(400, 'InvalidRequest', 'Blob not found');
      }
      const key = rkey ?? num();
      const uri = `at://${DID}/${collection}/${key}`;
      if (s().records[uri]) return bad(400, 'InvalidRequest', 'Record already exists');
      const rec = { uri, cid: cidOf({ uri, record }), value: record };
      s().records[uri] = rec;
      return { json: { uri, cid: rec.cid, validationStatus: 'valid' } };
    });
    m.on('GET', H, x('com.atproto.repo.getRecord'), req => {
      const rec = s().records[`at://${req.query.repo}/${req.query.collection}/${req.query.rkey}`];
      return rec ? { json: rec } : bad(400, 'RecordNotFound', 'Could not locate record');
    });
    m.on('POST', H, x('com.atproto.repo.deleteRecord'), req => {
      const g = guard(req); if (g) return g;
      delete s().records[`at://${req.body.repo}/${req.body.collection}/${req.body.rkey}`];
      return { json: {} };
    });
    m.on('GET', H, x('com.atproto.server.getServiceAuth'), req => {
      const g = guard(req); if (g) return g;
      if (req.query.aud !== 'did:web:pds.siar.test' && req.query.aud !== 'did:web:bsky.social') return bad(400, 'InvalidRequest', 'Invalid audience');
      return { json: { token: jwt({ aud: req.query.aud, lxm: req.query.lxm, exp: Number(req.query.exp) }) } };
    });
    m.on('GET', H, x('app.bsky.feed.getPosts'), req => {
      const g = guard(req); if (g) return g;
      const rec = s().records[req.query.uris];
      return { json: { posts: rec ? [postView(rec)] : [] } };
    });
    m.on('GET', H, x('app.bsky.feed.getPostThread'), req => {
      const g = guard(req); if (g) return g;
      const rec = s().records[req.query.uri];
      return rec ? { json: { thread: thread(rec, true) } } : bad(400, 'NotFound', `Post not found: ${req.query.uri}`);
    });
    m.on('GET', H, x('app.bsky.feed.getAuthorFeed'), req => {
      const g = guard(req); if (g) return g;
      const posts = Object.values(s().records).filter((r: any) => r.value.$type === 'app.bsky.feed.post' && !r.value.reply).reverse().slice(0, Number(req.query.limit ?? 50));
      return { json: { feed: posts.map((r: any) => ({ post: postView(r) })), cursor: undefined } };
    });

    // atproto OAuth: the PDS is a protected resource; the entryway is the authorization server.
    m.on('GET', H, '/.well-known/oauth-protected-resource', () => ({ json: { resource: PDS, authorization_servers: [ISSUER] } }));
  }

  m.on('GET', 'bsky.social', '/.well-known/oauth-authorization-server', () => ({
    json: {
      issuer: ISSUER, authorization_endpoint: `${ISSUER}/oauth/authorize`, token_endpoint: `${ISSUER}/oauth/token`, pushed_authorization_request_endpoint: `${ISSUER}/oauth/par`,
      revocation_endpoint: `${ISSUER}/oauth/revoke`, require_pushed_authorization_requests: true, dpop_signing_alg_values_supported: ['ES256'], scopes_supported: ['atproto', 'transition:generic'],
      code_challenge_methods_supported: ['S256'], token_endpoint_auth_methods_supported: ['none', 'private_key_jwt'],
    },
  }));
  m.on('POST', 'bsky.social', '/oauth/par', req => {
    const d = checkDpop(req, null, false); if (!('x' in d)) return d;
    if (!String(req.body.client_id).endsWith('/api/v1/oauth/bluesky/client-metadata.json') || req.body.code_challenge_method !== 'S256' || !req.body.redirect_uri) return bad(400, 'invalid_request', 'Invalid pushed authorization request');
    const request_uri = `urn:ietf:params:oauth:request_uri:req-${id()}`;
    s().par[request_uri] = { ...req.body, x: d.x };
    return { status: 201, json: { request_uri, expires_in: 300 } };
  });
  m.on('GET', 'bsky.social', '/oauth/authorize', req => {
    const p = s().par[req.query.request_uri];
    if (!p) return bad(400, 'invalid_request', 'Unknown request_uri');
    const code = `mockcode_${id()}`;
    s().codes[code] = p;
    const u = new URL(p.redirect_uri);
    u.searchParams.set('iss', ISSUER); u.searchParams.set('state', p.state); u.searchParams.set('code', code);
    return { redirect: u.toString() };
  });
  m.on('POST', 'bsky.social', '/oauth/token', req => {
    const d = checkDpop(req, null, false); if (!('x' in d)) return d;
    const issue = () => {
      const access_token = id('atok_'); const refresh_token = id('rtok_');
      s().oauth[access_token] = { x: d.x };
      s().refresh[refresh_token] = true;
      return { json: { access_token, token_type: 'DPoP', refresh_token, expires_in: 1800, scope: 'atproto transition:generic', sub: DID } };
    };
    if (req.body.grant_type === 'refresh_token') {
      if (!s().refresh[req.body.refresh_token]) return bad(400, 'invalid_grant', 'refresh token is invalid, expired or revoked');
      delete s().refresh[req.body.refresh_token];
      return issue();
    }
    const p = s().codes[req.body.code];
    const challenge = createHash('sha256').update(String(req.body.code_verifier ?? '')).digest('base64url');
    if (!p || p.code_challenge !== challenge || p.x !== d.x || p.redirect_uri !== req.body.redirect_uri) return bad(400, 'invalid_grant', 'Invalid authorization code');
    delete s().codes[req.body.code];
    return issue();
  });
  m.on('POST', 'bsky.social', '/oauth/revoke', req => { delete s().refresh[req.body.token]; return { json: {} }; });

  // The app-password flow ends on our own callback; in tests that host is api.siar.test.
  m.on('GET', 'api.siar.test', '/api/v1/social-account/callback/BLUESKY', req => ({ redirect: `https://api.siar.test/api/v1/social-account/callback/BLUESKY?${new URLSearchParams(req.query)}` }));

  m.on('GET', 'plc.directory', '/:did', req => (
    [DID, FRIEND].includes(req.params.did)
      ? { json: { id: req.params.did, alsoKnownAs: [`at://${author(req.params.did).handle}`], service: [{ id: '#atproto_pds', type: 'AtprotoPersonalDataServer', serviceEndpoint: PDS }] } }
      : { status: 404, json: { message: `DID not registered: ${req.params.did}` } }
  ));

  // ── video service ──
  m.on('POST', 'video.bsky.app', '/xrpc/app.bsky.video.uploadVideo', req => {
    if (!req.bearer || !req.bearer.includes('.')) return bad(401, 'AuthMissing', 'Authentication Required');
    const cid = 'bafkrei' + createHash('sha256').update(req.raw).digest('hex').slice(0, 40);
    const blob = { $type: 'blob', ref: { $link: cid }, mimeType: 'video/mp4', size: req.raw.length };
    s().blobs[cid] = blob;
    const jobId = id('job_');
    s().jobs[jobId] = { jobId, did: req.query.did, state: 'JOB_STATE_COMPLETED', progress: 100, blob };
    return { json: { jobStatus: { jobId, did: req.query.did, state: 'JOB_STATE_CREATED' } } };
  });
  m.on('GET', 'video.bsky.app', '/xrpc/app.bsky.video.getJobStatus', req => s().jobs[req.query.jobId] ? { json: { jobStatus: s().jobs[req.query.jobId] } } : bad(400, 'InvalidRequest', 'Job not found'));
}
