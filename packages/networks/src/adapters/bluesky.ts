/**
 * Bluesky — the AT Protocol (atproto). Posts are records in the user's own repository on their PDS.
 *
 * Docs: https://docs.bsky.app/ and https://atproto.com/specs/oauth
 *   Connect (primary)  App password: options.identifier + options.appPassword →
 *                      com.atproto.server.createSession on the PDS (default https://bsky.social, or
 *                      the connect call's serverUrl). accessJwt is short-lived, refreshJwt is used by
 *                      com.atproto.server.refreshSession (a refresh also rotates the refresh token).
 *                      The app password itself is never stored.
 *   Connect (OAuth)    atproto OAuth: client metadata document at
 *                      <apiUrl>/api/v1/oauth/bluesky/client-metadata.json (served by
 *                      apps/api/src/modules/bluesky-oauth.ts), PAR + PKCE (S256), and DPoP (ES256) on
 *                      every token and resource request. Public client (no client secret). The DPoP
 *                      private key is kept in token.secrets and each server's DPoP-Nonce is cached.
 *                      Used when no appPassword is given; options.identifier (a handle or DID) is an
 *                      optional login hint that also lets us find the user's PDS up front.
 *   Posts              com.atproto.repo.createRecord, collection app.bsky.feed.post. The rkey is a TID
 *                      derived from (post, account), so a retried publish finds the record it already
 *                      wrote instead of posting twice.
 *   Rich text          Links, @mentions and #tags are `facets` with UTF-8 BYTE offsets (not characters).
 *   Media              Images: uploadBlob (≤ 1,000,000 bytes each), up to 4, with alt + aspectRatio.
 *                      Video: service auth (getServiceAuth, aud = did:web:<pds host>, lxm = uploadBlob)
 *                      → POST video.bsky.app app.bsky.video.uploadVideo → poll getJobStatus → blob.
 *   External card      app.bsky.embed.external (+ thumb blob). Quote: embed.record / recordWithMedia.
 *   Ids                A post's / comment's external id is its AT-URI (at://did/app.bsky.feed.post/rkey).
 */
import { createHash, createPrivateKey, generateKeyPairSync, sign } from 'node:crypto';
import { NetworkError } from '../lib/errors.js';
import { httpError, sleep, withQuery, formBody } from '../lib/http.js';
import { authorizeUrl, expiresIn, randomString } from '../lib/oauth.js';
import { charCount, checkMedia, checkText, MB } from '../lib/validate.js';
import type {
  AccountMetrics, AccountProfile, AccountRuntime, FetchedCommentInput, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext,
  PostMetrics, PublishInput, PublishResult, TokenSet,
} from '../types.js';

const DEFAULT_PDS = 'https://bsky.social';
const VIDEO_SERVICE = 'https://video.bsky.app';
const PLC = 'https://plc.directory';
const SCOPES = ['atproto', 'transition:generic'];
const TEXT_MAX = 300;
const TEXT_MAX_BYTES = 3000;
const IMAGE_MAX_BYTES = 1_000_000;
const LABELS = ['!no-unauthenticated', 'porn', 'sexual', 'nudity', 'graphic-media'];
const POST = 'app.bsky.feed.post';

// ───────────────────────────── errors ─────────────────────────────

/** Bluesky errors: { error: 'ExpiredToken', message } — OAuth errors: { error: 'invalid_grant', error_description }. */
function mapError(status: number, body: any, res?: Response): NetworkError | undefined {
  const code: string = typeof body?.error === 'string' ? body.error : '';
  const msg: string = body?.message ?? body?.error_description ?? (code || `Bluesky returned HTTP ${status}`);
  const opts = { httpStatus: status, meta: body };
  if (['AccountTakedown', 'AccountDeactivated', 'Forbidden', 'AuthFactorTokenRequired'].includes(code) || status === 403) return new NetworkError('PERMISSION', msg, opts);
  if (code === 'RateLimitExceeded' || status === 429) {
    const reset = res?.headers.get('ratelimit-reset') ?? res?.headers.get('retry-after');
    const at = reset && /^\d+$/.test(reset) ? new Date(Number(reset) > 1e9 ? Number(reset) * 1000 : Date.now() + Number(reset) * 1000) : null;
    return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: at });
  }
  if (['ExpiredToken', 'InvalidToken', 'AuthMissing', 'AuthenticationRequired', 'invalid_token', 'invalid_grant'].includes(code) || status === 401) return new NetworkError('TOKEN_INVALID', msg, opts);
  if (['BlobTooLarge', 'InvalidMimeType', 'UnsupportedMimeType'].includes(code) || status === 413 || (/blob|image|video/i.test(msg) && /too large|exceeds|mime|unsupported|invalid/i.test(msg))) return new NetworkError('MEDIA_INVALID', msg, opts);
  if (code === 'InvalidSwap' || code === 'already_exists') return new NetworkError('DUPLICATE', msg, opts);
  if (status === 404 || ['RecordNotFound', 'NotFound', 'RepoNotFound', 'PostNotFound'].includes(code)) return new NetworkError('NOT_FOUND', msg, opts);
  if (code === 'InvalidRequest' && /must not be longer|too long|graphemes|longer than/i.test(msg)) return new NetworkError('CONTENT_REJECTED', msg, opts);
  if (status === 400 || code === 'InvalidRequest') return new NetworkError('VALIDATION', msg, opts);
  return undefined;
}

// ───────────────────────────── DPoP ─────────────────────────────

const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');

const newDpopKey = (): JsonWebKey => generateKeyPairSync('ec', { namedCurve: 'P-256' }).privateKey.export({ format: 'jwk' });

/** A DPoP proof (RFC 9449), ES256. `ath` binds it to the access token on resource requests. */
function dpopProof(ctx: NetworkContext, jwk: JsonWebKey, p: { method: string; url: string; nonce?: string; accessToken?: string }): string {
  const u = new URL(p.url);
  const header = { typ: 'dpop+jwt', alg: 'ES256', jwk: { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y } };
  const payload: Record<string, unknown> = {
    jti: randomString(16), htm: p.method.toUpperCase(), htu: `${u.origin}${u.pathname}`, iat: Math.floor(ctx.now().getTime() / 1000),
    ...(p.nonce ? { nonce: p.nonce } : {}), ...(p.accessToken ? { ath: createHash('sha256').update(p.accessToken).digest('base64url') } : {}),
  };
  const input = `${b64u(JSON.stringify(header))}.${b64u(JSON.stringify(payload))}`;
  const sig = sign('sha256', Buffer.from(input), { key: createPrivateKey({ key: jwk, format: 'jwk' }), dsaEncoding: 'ieee-p1363' });
  return `${input}.${b64u(sig)}`;
}

/** Latest DPoP-Nonce per server origin (authorization server and PDS each issue their own). */
const nonces = new Map<string, string>();

interface Dpop { jwk: JsonWebKey; accessToken?: string }
interface CallOpts {
  method?: string;
  json?: unknown;
  form?: Record<string, string | undefined | null>;
  body?: BodyInit;
  query?: Record<string, string | number | boolean | undefined | null>;
  headers?: Record<string, string>;
  bearer?: string | null;
  dpop?: Dpop;
  timeoutMs?: number;
}

/** One HTTP call. With `dpop`, signs the request and transparently retries once on a use_dpop_nonce challenge. */
async function call<T = any>(ctx: NetworkContext, url: string, o: CallOpts = {}): Promise<T> {
  const full = withQuery(url, o.query);
  const headers: Record<string, string> = { accept: 'application/json', ...(o.headers ?? {}) };
  let body = o.body;
  if (o.json !== undefined) { body = JSON.stringify(o.json); headers['content-type'] = 'application/json'; }
  if (o.form) { body = formBody(o.form); headers['content-type'] = 'application/x-www-form-urlencoded'; }
  if (o.bearer) headers.authorization = `Bearer ${o.bearer}`;
  const method = o.method ?? (body ? 'POST' : 'GET');
  const origin = new URL(url).origin;
  for (let attempt = 0; ; attempt++) {
    if (o.dpop) {
      headers.dpop = dpopProof(ctx, o.dpop.jwk, { method, url, nonce: nonces.get(origin), accessToken: o.dpop.accessToken });
      if (o.dpop.accessToken) headers.authorization = `DPoP ${o.dpop.accessToken}`;
    }
    let res: Response;
    try { res = await ctx.fetch(full, { method, headers, body, timeoutMs: o.timeoutMs }); } catch (err) {
      throw new NetworkError('NETWORK_UNAVAILABLE', `Could not reach ${new URL(url).host}: ${(err as Error).message}`);
    }
    const nonce = res.headers.get('dpop-nonce');
    if (nonce) nonces.set(origin, nonce);
    const text = await res.text();
    let parsed: any = null;
    if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
    if (res.ok) return parsed as T;
    if (o.dpop && attempt === 0 && nonce && (parsed?.error === 'use_dpop_nonce' || /use_dpop_nonce/.test(res.headers.get('www-authenticate') ?? ''))) continue;
    throw mapError(res.status, parsed, res) ?? httpError(res, parsed);
  }
}

// ───────────────────────────── sessions ─────────────────────────────

interface Session { pds: string; did: string; accessToken: string; dpopJwk?: JsonWebKey }

const trim = (u: string) => u.replace(/\/+$/, '');
const secretsOf = (a: AccountRuntime) => (a.token.secrets ?? {}) as Record<string, any>;

const sessionOf = (a: AccountRuntime): Session => {
  const s = secretsOf(a);
  const did = a.providerPageId ?? a.externalId ?? s.did;
  if (!did) throw new NetworkError('VALIDATION', 'This Bluesky account has no DID; reconnect it.');
  return { pds: trim(String(s.pds ?? a.serverUrl ?? DEFAULT_PDS)), did, accessToken: a.token.accessToken, dpopJwk: s.auth === 'oauth' ? s.dpopJwk : undefined };
};

const xrpc = <T = any>(ctx: NetworkContext, s: Session, nsid: string, o: CallOpts = {}) =>
  call<T>(ctx, `${s.pds}/xrpc/${nsid}`, { ...o, ...(s.dpopJwk ? { dpop: { jwk: s.dpopJwk, accessToken: s.accessToken } } : { bearer: s.accessToken }) });

const jwtExp = (jwt: string): Date | null => {
  try { const p = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString()); return p.exp ? new Date(p.exp * 1000) : null; } catch { return null; }
};

const pdsFromDoc = (doc: any): string | null =>
  trim(String((doc?.service ?? []).find((x: any) => x.id === '#atproto_pds' || x.type === 'AtprotoPersonalDataServer')?.serviceEndpoint ?? '')) || null;

const profileOf = (p: any): AccountProfile => ({
  externalId: p.did, providerPageId: p.did, username: p.handle, displayName: p.displayName || p.handle, avatarUrl: p.avatar ?? null, bio: p.description ?? null,
  userId: p.did, userUsername: p.handle, userDisplayName: p.displayName || p.handle,
});

// ───────────────────────────── identity & OAuth discovery ─────────────────────────────

async function resolveDidDoc(ctx: NetworkContext, did: string): Promise<any> {
  if (did.startsWith('did:plc:')) return call(ctx, `${PLC}/${did}`);
  if (did.startsWith('did:web:')) return call(ctx, `https://${decodeURIComponent(did.slice(8))}/.well-known/did.json`);
  throw new NetworkError('VALIDATION', `"${did}" is not a did:plc or did:web identifier.`);
}

async function resolveHandle(ctx: NetworkContext, pds: string, handle: string): Promise<string> {
  const r = await call<{ did: string }>(ctx, `${pds}/xrpc/com.atproto.identity.resolveHandle`, { query: { handle } });
  return r.did;
}

/** PDS → its authorization server's metadata (RFC 9728 protected resource, then RFC 8414). */
async function authServerOf(ctx: NetworkContext, pds: string): Promise<{ issuer: string; meta: any }> {
  const pr = await call(ctx, `${pds}/.well-known/oauth-protected-resource`);
  const issuer = trim(String(pr.authorization_servers?.[0] ?? ''));
  if (!issuer) throw new NetworkError('NOT_SUPPORTED', 'This PDS does not advertise an OAuth authorization server.');
  const meta = await call(ctx, `${issuer}/.well-known/oauth-authorization-server`);
  if (trim(String(meta.issuer)) !== issuer) throw new NetworkError('VALIDATION', 'The authorization server metadata does not match its issuer.');
  return { issuer, meta };
}

/** The client metadata document atproto OAuth servers fetch from our client_id URL. */
const clientId = (ctx: Pick<NetworkContext, 'apiUrl'>) => `${trim(ctx.apiUrl)}/api/v1/oauth/bluesky/client-metadata.json`;
const clientMetadata = (ctx: Pick<NetworkContext, 'apiUrl' | 'redirectUri'>) => ({
  client_id: clientId(ctx), client_name: 'Siar', client_uri: trim(ctx.apiUrl), redirect_uris: [ctx.redirectUri], scope: SCOPES.join(' '),
  grant_types: ['authorization_code', 'refresh_token'], response_types: ['code'], token_endpoint_auth_method: 'none', application_type: 'web', dpop_bound_access_tokens: true,
});

function oauthTokenSet(ctx: NetworkContext, tok: any, prev: Record<string, unknown>): TokenSet {
  if (!tok.access_token) throw new NetworkError('UNKNOWN', 'Bluesky did not return an access token.', { meta: tok });
  return {
    accessToken: tok.access_token, refreshToken: tok.refresh_token ?? null, expiresAt: expiresIn(tok.expires_in, ctx.now()),
    scopes: String(tok.scope ?? SCOPES.join(' ')).split(/\s+/).filter(Boolean), secrets: prev,
  };
}

const clean = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/^@/, '') : '');

// ───────────────────────────── rich text ─────────────────────────────

const byteOffset = (text: string, index: number) => Buffer.byteLength(text.slice(0, index));
const TRAIL = /[.,;:!?'")\]}]+$/;
const MENTION_RE = /(^|\s|\()@([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+)/g;
const LINK_RE = /(^|\s|\()(https?:\/\/[^\s]+)/g;
const TAG_RE = /(^|\s)#([^\d\s#][^\s#]*)/g;

interface Facet { index: { byteStart: number; byteEnd: number }; features: Record<string, unknown>[] }

/** Links, mentions (resolved to DIDs) and hashtags as facets with UTF-8 byte offsets. Unresolvable mentions stay plain text. */
async function buildFacets(ctx: NetworkContext, s: Session, text: string): Promise<Facet[]> {
  const facets: Facet[] = [];
  const range = (start: number, str: string) => ({ byteStart: byteOffset(text, start), byteEnd: byteOffset(text, start) + Buffer.byteLength(str) });
  for (const m of text.matchAll(MENTION_RE)) {
    const handle = m[2];
    const did = await resolveHandle(ctx, s.pds, handle).catch(() => null);
    if (!did) continue;
    const start = m.index! + m[1].length;
    facets.push({ index: range(start, `@${handle}`), features: [{ $type: 'app.bsky.richtext.facet#mention', did }] });
  }
  for (const m of text.matchAll(LINK_RE)) {
    const uri = m[2].replace(TRAIL, '');
    try { new URL(uri); } catch { continue; }
    facets.push({ index: range(m.index! + m[1].length, uri), features: [{ $type: 'app.bsky.richtext.facet#link', uri }] });
  }
  for (const m of text.matchAll(TAG_RE)) {
    const tag = m[2].replace(TRAIL, '');
    if (!tag || charCount(tag) > 64) continue;
    const start = m.index! + m[1].length;
    // Inside a link (a URL fragment) is not a hashtag.
    if (facets.some(f => f.features[0].$type?.toString().endsWith('#link') && byteOffset(text, start) >= f.index.byteStart && byteOffset(text, start) < f.index.byteEnd)) continue;
    facets.push({ index: range(start, `#${m[2].replace(TRAIL, '')}`), features: [{ $type: 'app.bsky.richtext.facet#tag', tag }] });
  }
  return facets.sort((a, b) => a.index.byteStart - b.index.byteStart);
}

// ───────────────────────────── records ─────────────────────────────

const B32 = '234567abcdefghijklmnopqrstuvwxyz';
/** A valid TID record key (13 chars, base32-sortable) derived from a seed: same seed, same key. */
function tidFor(seed: string): string {
  let n = createHash('sha256').update(seed).digest().readBigUInt64BE(0) & 0x7fffffffffffffffn;
  let out = '';
  for (let i = 0; i < 13; i++) { out = B32[Number(n & 31n)] + out; n >>= 5n; }
  return out;
}

const parseUri = (uri: string) => {
  const m = /^at:\/\/([^/]+)\/([^/]+)\/([^/]+)$/.exec(uri);
  if (!m) throw new NetworkError('VALIDATION', `"${uri}" is not an AT-URI (at://<did>/<collection>/<rkey>).`);
  return { repo: m[1], collection: m[2], rkey: m[3] };
};

/** createRecord with a deterministic rkey; if that record is already there, return it instead of failing. */
async function createRecord(ctx: NetworkContext, s: Session, collection: string, record: unknown, rkey: string): Promise<{ uri: string; cid: string }> {
  try {
    return await xrpc(ctx, s, 'com.atproto.repo.createRecord', { json: { repo: s.did, collection, rkey, record } });
  } catch (e) {
    if (e instanceof NetworkError && (e.code === 'DUPLICATE' || /already exists/i.test(e.message))) {
      const r = await xrpc(ctx, s, 'com.atproto.repo.getRecord', { query: { repo: s.did, collection, rkey } }).catch(() => null);
      if (r?.uri) return { uri: r.uri, cid: r.cid };
    }
    throw e;
  }
}

async function deleteRecord(ctx: NetworkContext, s: Session, uri: string) {
  const { repo, collection, rkey } = parseUri(uri);
  await xrpc(ctx, s, 'com.atproto.repo.deleteRecord', { json: { repo, collection, rkey } });
}

async function uploadBlob(ctx: NetworkContext, s: Session, bytes: Buffer, mime: string): Promise<any> {
  const r = await xrpc(ctx, s, 'com.atproto.repo.uploadBlob', { body: new Uint8Array(bytes), headers: { 'content-type': mime }, timeoutMs: 120_000 });
  return r.blob;
}

async function postView(ctx: NetworkContext, s: Session, uri: string): Promise<any> {
  const r = await xrpc(ctx, s, 'app.bsky.feed.getPosts', { query: { uris: uri } });
  const p = r.posts?.[0];
  if (!p) throw new NetworkError('NOT_FOUND', `Bluesky has no post at ${uri}.`);
  return p;
}

const aspect = (m: Pick<MediaRef, 'width' | 'height'>) => (m.width && m.height ? { aspectRatio: { width: m.width, height: m.height } } : {});

// ───────────────────────────── video ─────────────────────────────

const jobOf = (r: any) => r?.jobStatus ?? r;

async function startVideo(ctx: NetworkContext, s: Session, m: MediaRef): Promise<string> {
  const auth = await xrpc(ctx, s, 'com.atproto.server.getServiceAuth', {
    query: { aud: `did:web:${new URL(s.pds).host}`, lxm: 'com.atproto.repo.uploadBlob', exp: Math.floor(ctx.now().getTime() / 1000) + 1800 },
  });
  try {
    const r = await call(ctx, `${VIDEO_SERVICE}/xrpc/app.bsky.video.uploadVideo`, {
      method: 'POST', bearer: auth.token, query: { did: s.did, name: `${m.id}.${m.ext}` }, headers: { 'content-type': m.mime }, body: new Uint8Array(await m.read()), timeoutMs: 600_000,
    });
    return jobOf(r).jobId;
  } catch (e) {
    // The video service refuses a second upload of the same bytes but names the job: pick it up.
    if (e instanceof NetworkError && e.code === 'DUPLICATE' && (e.meta as any)?.jobId) return (e.meta as any).jobId;
    throw e;
  }
}

/** { blob } when processing finished, { blob: null } while it is still running. Failures throw. */
async function videoJob(ctx: NetworkContext, jobId: string): Promise<{ blob: any | null }> {
  const j = jobOf(await call(ctx, `${VIDEO_SERVICE}/xrpc/app.bsky.video.getJobStatus`, { query: { jobId } }));
  if (j.state === 'JOB_STATE_COMPLETED' && j.blob) return { blob: j.blob };
  if (j.state === 'JOB_STATE_FAILED') throw new NetworkError('MEDIA_INVALID', j.message ?? j.error ?? 'Bluesky could not process the video.', { meta: j });
  return { blob: null };
}

// ───────────────────────────── building a post ─────────────────────────────

const permalinkOf = (a: AccountRuntime, uri: string) => `https://bsky.app/profile/${a.username ?? parseUri(uri).repo}/post/${parseUri(uri).rkey}`;

async function buildRecord(ctx: NetworkContext, s: Session, o: {
  text: string; data: Record<string, any>; media: MediaRef[]; reply?: { root: { uri: string; cid: string }; parent: { uri: string; cid: string } }; videoBlob?: any;
}): Promise<Record<string, unknown>> {
  const { text, data, media } = o;
  let embed: Record<string, any> | undefined;
  const images = media.filter(m => m.type === 'image');
  const video = media.find(m => m.type === 'video');
  if (video) {
    embed = { $type: 'app.bsky.embed.video', video: o.videoBlob, alt: data.videoAlt ?? video.altText ?? '', ...aspect(video) };
  } else if (images.length) {
    const out = [];
    for (const m of images) out.push({ alt: m.altText ?? '', image: await uploadBlob(ctx, s, await m.read(), m.mime), ...aspect(m) });
    embed = { $type: 'app.bsky.embed.images', images: out };
  } else if (data.externalUrl) {
    const external: Record<string, unknown> = { uri: data.externalUrl, title: data.externalTitle ?? data.externalUrl, description: data.externalDescription ?? '' };
    if (data.thumbnail) {
      // Best effort: a card without a thumbnail is still a card.
      try {
        const res = await ctx.fetch(String(data.thumbnail));
        const bytes = Buffer.from(await res.arrayBuffer());
        const mime = res.headers.get('content-type')?.split(';')[0] ?? 'image/jpeg';
        if (res.ok && bytes.length > 0 && bytes.length <= IMAGE_MAX_BYTES && mime.startsWith('image/')) external.thumb = await uploadBlob(ctx, s, bytes, mime);
      } catch (err) { ctx.log.warn({ err }, 'bluesky: external card thumbnail skipped'); }
    }
    embed = { $type: 'app.bsky.embed.external', external };
  }
  if (data.quoteUri) {
    const q = await postView(ctx, s, data.quoteUri);
    const rec = { $type: 'app.bsky.embed.record', record: { uri: q.uri, cid: q.cid } };
    embed = embed ? { $type: 'app.bsky.embed.recordWithMedia', record: rec, media: embed } : rec;
  }
  const facets = await buildFacets(ctx, s, text);
  return {
    $type: POST, text, createdAt: ctx.now().toISOString(),
    ...(facets.length ? { facets } : {}),
    ...(embed ? { embed } : {}),
    ...(o.reply ? { reply: o.reply } : {}),
    ...(data.labels?.length ? { labels: { $type: 'com.atproto.label.defs#selfLabels', values: (data.labels as string[]).map(val => ({ val })) } } : {}),
    ...(data.tags?.length ? { tags: data.tags } : {}),
  };
}

async function finishPost(ctx: NetworkContext, input: PublishInput, videoBlob?: any): Promise<PublishResult> {
  const a = input.account;
  const s = sessionOf(a);
  const record = await buildRecord(ctx, s, { text: input.data.text ?? '', data: input.data, media: input.media, videoBlob });
  const r = await createRecord(ctx, s, POST, record, tidFor(`${input.postId}:${a.id}`));
  const permalink = permalinkOf(a, r.uri);
  return { status: 'POSTED', externalPostId: r.uri, permalink, externalData: { id: parseUri(r.uri).rkey, uri: r.uri, cid: r.cid, permalink, did: s.did } };
}

// ───────────────────────────── mapping ─────────────────────────────

const metrics = (p: any): PostMetrics => ({
  likes: p.likeCount ?? 0, shares: (p.repostCount ?? 0) + (p.quoteCount ?? 0), comments: p.replyCount ?? 0,
  raw: { likeCount: p.likeCount, repostCount: p.repostCount, replyCount: p.replyCount, quoteCount: p.quoteCount },
});

const toComment = (p: any, parentUri: string | null, rootUri: string): FetchedCommentInput => ({
  externalId: p.uri, externalParentId: parentUri && parentUri !== rootUri ? parentUri : null, externalPostId: rootUri,
  authorName: p.author?.displayName || p.author?.handle, authorExternalId: p.author?.did, authorProfileUrl: p.author?.handle ? `https://bsky.app/profile/${p.author.handle}` : null,
  authorAvatarUrl: p.author?.avatar ?? null, text: p.record?.text ?? '', likesCount: p.likeCount ?? 0, repliesCount: p.replyCount ?? 0,
  publishedAt: p.record?.createdAt ? new Date(p.record.createdAt) : p.indexedAt ? new Date(p.indexedAt) : null,
  platformData: { cid: p.cid, liked: !!p.viewer?.like },
});

function walkReplies(node: any, rootUri: string, out: FetchedCommentInput[]) {
  for (const r of node.replies ?? []) {
    if (!r.post) continue; // notFound / blocked placeholders carry no post
    out.push(toComment(r.post, node.post?.uri ?? rootUri, rootUri));
    walkReplies(r, rootUri, out);
  }
}

const historyType = (embedType: string | undefined): HistoryPost['type'] =>
  embedType?.startsWith('app.bsky.embed.video') ? 'VIDEO' : embedType?.startsWith('app.bsky.embed.images') ? 'IMAGE' : 'POST';

// ───────────────────────────── the adapter ─────────────────────────────

export const bluesky: NetworkAdapter & { clientMetadata: typeof clientMetadata } = {
  type: 'BLUESKY',
  displayName: 'Bluesky',
  // App passwords and the public-client OAuth flow need no app credentials of ours.
  credentialKeys: [],
  scopes: SCOPES,
  clientMetadata,
  capabilities: {
    connect: 'app-password', channels: 'none', postTypes: ['POST'],
    comments: true, firstComment: true, editPost: false, deletePost: true, editComment: false, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'LIKE', 'UNLIKE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    textMax: TEXT_MAX,
    commentMax: TEXT_MAX,
    media: {
      maxItems: 4,
      image: { mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], maxBytes: IMAGE_MAX_BYTES },
      video: { mimes: ['video/mp4', 'video/mpeg', 'video/webm', 'video/quicktime'], maxBytes: 100 * MB, maxSeconds: 180 },
    },
  },
  errorReference: [
    { code: 'AuthenticationRequired', message: 'Invalid identifier or password', meaning: 'The handle or app password given at connect time is wrong (or the app password was deleted).', fix: 'Create a new app password in Bluesky (Settings → Privacy and security → App passwords) and reconnect.' },
    { code: 'ExpiredToken', message: 'Token has expired', meaning: 'The session could not be refreshed: the refresh token expired or the app password was revoked.', fix: 'Reconnect the Bluesky account.' },
    { code: 'AccountTakedown', message: 'Account has been taken down', meaning: 'Bluesky moderation took the account down or the user deactivated it.', fix: 'Resolve it with Bluesky; the account cannot post until then.' },
    { code: 'InvalidRequest', message: 'Record/text must not be longer than 300 graphemes', meaning: 'Bluesky counts graphemes; the text is over 300 (or over 3000 bytes).', fix: 'Shorten the text or split it into replies.' },
    { code: 'BlobTooLarge', message: 'This file is too large', meaning: 'An image is over 1,000,000 bytes (about 976 KB) or a video is over the service limit.', fix: 'Compress the image; videos must be ≤ 100 MB and ≤ 3 minutes.' },
    { code: 'InvalidMimeType', message: 'Unsupported or mismatched media type', meaning: 'The blob is not a supported image/video format, or its bytes do not match the declared type.', fix: 'Use JPEG, PNG, WebP or GIF images and MP4/WebM/MOV video.' },
    { code: 'RateLimitExceeded', message: 'Rate Limit Exceeded', meaning: 'A PDS limit was hit (about 1,666 record creates an hour and 11,666 a day per account, plus per-IP limits on createSession).', fix: 'Retry after the ratelimit-reset time.' },
    { code: 'use_dpop_nonce', message: 'Authorization server requires nonce in DPoP proof', meaning: 'OAuth servers rotate a DPoP nonce; the first request of a session is always rejected with it.', fix: 'Handled automatically: Siar retries once with the supplied DPoP-Nonce.' },
    { code: 'invalid_grant', message: 'refresh token is invalid, expired or revoked', meaning: 'OAuth refresh failed (public clients get shorter refresh lifetimes) so the grant is gone.', fix: 'Reconnect the Bluesky account.' },
    { code: 'InvalidSwap', message: 'Record already exists', meaning: 'A record with the same key was already written, which is how a retried publish is detected.', fix: 'Nothing: Siar treats it as already posted.' },
  ],

  async authorize(ctx, input) {
    const o = { ...(input.extra?.options as Record<string, unknown> | undefined), ...(input.options ?? {}) };
    const identifier = clean(o.identifier ?? o.handle);
    const startPds = input.serverUrl ? trim(input.serverUrl) : DEFAULT_PDS;

    // Primary: app password. The session is created now; the callback just carries it to exchange().
    if (o.appPassword) {
      if (!identifier) throw new NetworkError('VALIDATION', 'identifier (your handle, e.g. you.bsky.social) is required with appPassword.');
      const sess = await call(ctx, `${startPds}/xrpc/com.atproto.server.createSession`, { json: { identifier, password: String(o.appPassword) } });
      const url = authorizeUrl(ctx.redirectUri, { code: 'app-password', state: input.state });
      // NOTE: the session tokens ride in OAuthState.extra until the callback (short-lived, single use).
      return { url, extra: { auth: 'password', session: { accessJwt: sess.accessJwt, refreshJwt: sess.refreshJwt, did: sess.did, handle: sess.handle, pds: pdsFromDoc(sess.didDoc) ?? startPds } } };
    }

    // atproto OAuth: find the user's PDS (when we know who they are), its authorization server, then PAR.
    let pds = startPds;
    let did: string | null = null;
    if (identifier) {
      did = identifier.startsWith('did:') ? identifier : await resolveHandle(ctx, startPds, identifier);
      pds = pdsFromDoc(await resolveDidDoc(ctx, did)) ?? startPds;
    }
    const { issuer, meta } = await authServerOf(ctx, pds);
    if (!meta.pushed_authorization_request_endpoint) throw new NetworkError('NOT_SUPPORTED', 'This authorization server does not offer pushed authorization requests.');
    const dpopJwk = newDpopKey();
    const par = await call(ctx, meta.pushed_authorization_request_endpoint, {
      dpop: { jwk: dpopJwk },
      form: {
        client_id: clientId(ctx), response_type: 'code', redirect_uri: ctx.redirectUri, scope: SCOPES.join(' '), state: input.state,
        code_challenge: input.codeChallenge, code_challenge_method: 'S256', login_hint: identifier || undefined,
      },
    });
    const url = authorizeUrl(meta.authorization_endpoint, { client_id: clientId(ctx), request_uri: par.request_uri });
    return { url, extra: { auth: 'oauth', issuer, tokenEndpoint: meta.token_endpoint, revocationEndpoint: meta.revocation_endpoint ?? null, dpopJwk, pds, did } };
  },

  async exchange(ctx, input) {
    const ex = (input.extra ?? {}) as Record<string, any>;
    if (ex.auth === 'password') {
      const sess = ex.session;
      const s: Session = { pds: trim(sess.pds), did: sess.did, accessToken: sess.accessJwt };
      const me = await xrpc(ctx, s, 'app.bsky.actor.getProfile', { query: { actor: sess.did } });
      return {
        token: { accessToken: sess.accessJwt, refreshToken: sess.refreshJwt, expiresAt: jwtExp(sess.accessJwt), scopes: [], secrets: { auth: 'password', pds: s.pds, did: sess.did } },
        profile: profileOf(me),
      };
    }
    if (ex.auth !== 'oauth' || !ex.tokenEndpoint) throw new NetworkError('VALIDATION', 'This Bluesky connection did not start correctly; try again.');
    const tok = await call(ctx, ex.tokenEndpoint, {
      dpop: { jwk: ex.dpopJwk },
      form: { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri, code_verifier: input.codeVerifier, client_id: clientId(ctx) },
    });
    const did = String(tok.sub ?? '');
    if (!did.startsWith('did:') || !String(tok.scope ?? '').split(/\s+/).includes('atproto')) throw new NetworkError('VALIDATION', 'Bluesky did not grant the atproto scope.', { meta: { sub: tok.sub, scope: tok.scope } });
    // The token's `sub` is only trusted if that account's PDS is protected by the issuer that answered.
    const pds = pdsFromDoc(await resolveDidDoc(ctx, did)) ?? ex.pds ?? DEFAULT_PDS;
    const owner = await authServerOf(ctx, pds);
    if (owner.issuer !== ex.issuer) throw new NetworkError('PERMISSION', 'The account that signed in is not served by the authorization server that issued the token.', { meta: { issuer: ex.issuer, expected: owner.issuer } });
    const secrets = { auth: 'oauth', pds, did, issuer: ex.issuer, tokenEndpoint: ex.tokenEndpoint, revocationEndpoint: ex.revocationEndpoint ?? null, dpopJwk: ex.dpopJwk };
    const token = oauthTokenSet(ctx, tok, secrets);
    const me = await xrpc(ctx, { pds, did, accessToken: token.accessToken, dpopJwk: ex.dpopJwk }, 'app.bsky.actor.getProfile', { query: { actor: did } });
    return { token, profile: profileOf(me) };
  },

  async refresh(ctx, a) {
    const sec = secretsOf(a);
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No refresh token stored for this Bluesky account; reconnect it.');
    if (sec.auth === 'oauth') {
      const tok = await call(ctx, sec.tokenEndpoint, {
        dpop: { jwk: sec.dpopJwk }, form: { grant_type: 'refresh_token', refresh_token: a.token.refreshToken, client_id: clientId(ctx) },
      });
      return oauthTokenSet(ctx, tok, sec);
    }
    const s = sessionOf(a);
    const r = await call(ctx, `${s.pds}/xrpc/com.atproto.server.refreshSession`, { method: 'POST', bearer: a.token.refreshToken });
    return { accessToken: r.accessJwt, refreshToken: r.refreshJwt, expiresAt: jwtExp(r.accessJwt), scopes: a.token.scopes ?? [], secrets: { ...sec, pds: pdsFromDoc(r.didDoc) ?? s.pds } };
  },

  async refreshProfile(ctx, a) {
    const s = sessionOf(a);
    return profileOf(await xrpc(ctx, s, 'app.bsky.actor.getProfile', { query: { actor: s.did } }));
  },

  async checkConnection(ctx, a) {
    try { const s = sessionOf(a); await xrpc(ctx, s, 'app.bsky.actor.getProfile', { query: { actor: s.did } }); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    const sec = secretsOf(a);
    if (sec.auth === 'oauth') {
      if (sec.revocationEndpoint && a.token.refreshToken) {
        await call(ctx, sec.revocationEndpoint, { dpop: { jwk: sec.dpopJwk }, form: { token: a.token.refreshToken, token_type_hint: 'refresh_token', client_id: clientId(ctx) } }).catch(() => undefined);
      }
      return;
    }
    if (a.token.refreshToken) await call(ctx, `${sessionOf(a).pds}/xrpc/com.atproto.server.deleteSession`, { method: 'POST', bearer: a.token.refreshToken }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const text: string = typeof data.text === 'string' ? data.text : '';
    const hasCard = !!data.externalUrl;
    checkText(issues, data.text, TEXT_MAX, ['text'], media.length === 0 && !hasCard && !data.quoteUri);
    if (Buffer.byteLength(text) > TEXT_MAX_BYTES) issues.push({ code: 'too_long', message: `Text is ${Buffer.byteLength(text)} bytes; the limit is ${TEXT_MAX_BYTES}.`, path: ['text'] });
    checkMedia(issues, media, bluesky.limits);
    const videos = media.filter(m => m.type === 'video');
    if (videos.length > 1) issues.push({ code: 'too_many', message: 'Bluesky allows one video per post.', path: ['uploadIds'] });
    if (videos.length && media.length > videos.length) issues.push({ code: 'mixed', message: 'A post carries either images or a video, not both.', path: ['uploadIds'] });
    if (hasCard && media.length) issues.push({ code: 'conflict', message: 'A link card and media cannot be combined; drop externalUrl or the media.', path: ['externalUrl'] });
    if (media.some(m => m.type === 'document')) issues.push({ code: 'type', message: 'Bluesky does not accept documents.', path: ['uploadIds'] });
    if (data.tags) {
      if (data.tags.length > 8) issues.push({ code: 'too_many', message: 'At most 8 tags.', path: ['tags'] });
      (data.tags as string[]).forEach((t, i) => { if (charCount(t) > 64) issues.push({ code: 'too_long', message: 'A tag is limited to 64 characters.', path: ['tags', i] }); });
    }
    (data.labels as string[] | undefined)?.forEach((l, i) => { if (!LABELS.includes(l)) issues.push({ code: 'invalid', message: `"${l}" is not a Bluesky self-label (${LABELS.join(', ')}).`, path: ['labels', i] }); });
    if (data.quoteUri && !/^at:\/\/\S+$/.test(data.quoteUri)) issues.push({ code: 'invalid', message: 'quoteUri must be an AT-URI (at://…).', path: ['quoteUri'] });
    return issues;
  },

  async publish(ctx, input) {
    const video = input.media.find(m => m.type === 'video');
    if (!video) return finishPost(ctx, input);
    const s = sessionOf(input.account);
    const jobId = await startVideo(ctx, s, video);
    for (let i = 0; i < 20; i++) {
      const job = await videoJob(ctx, jobId);
      if (job.blob) return finishPost(ctx, input, job.blob);
      await sleep(ctx.mode === 'mock' ? 10 : 2000);
    }
    return { status: 'PROCESSING', pendingRef: jobId, pollAfterMs: 5000 };
  },

  async poll(ctx, input, jobId) {
    const job = await videoJob(ctx, jobId);
    return job.blob ? finishPost(ctx, input, job.blob) : { status: 'PROCESSING', pendingRef: jobId, pollAfterMs: 5000 };
  },

  async recentPosts(ctx, a, since) {
    const s = sessionOf(a);
    const r = await xrpc(ctx, s, 'app.bsky.feed.getAuthorFeed', { query: { actor: s.did, limit: 20, filter: 'posts_no_replies' } });
    return (r.feed ?? [])
      .filter((f: any) => !f.reason && f.post?.author?.did === s.did && new Date(f.post.record?.createdAt ?? f.post.indexedAt) >= since)
      .map((f: any) => ({ externalId: f.post.uri, text: f.post.record?.text, createdAt: new Date(f.post.record?.createdAt ?? f.post.indexedAt), permalink: permalinkOf(a, f.post.uri) }));
  },

  async deletePost(ctx, a, uri) {
    await deleteRecord(ctx, sessionOf(a), uri);
  },

  async comment(ctx, input) {
    const a = input.account;
    const s = sessionOf(a);
    const parentUri = input.parentExternalId ?? input.externalPostId;
    const parent = await postView(ctx, s, parentUri);
    const root = parent.record?.reply?.root ?? { uri: parent.uri, cid: parent.cid };
    const record = await buildRecord(ctx, s, { text: input.text, data: input.data, media: input.media, reply: { root, parent: { uri: parent.uri, cid: parent.cid } } });
    const r = await createRecord(ctx, s, POST, record, tidFor(`c:${parentUri}:${a.id}:${input.text}`));
    return { externalId: r.uri, permalink: permalinkOf(a, r.uri), externalData: { uri: r.uri, cid: r.cid } };
  },

  async deleteComment(ctx, a, uri) {
    await deleteRecord(ctx, sessionOf(a), uri);
  },

  async importComments(ctx, a, input) {
    const s = sessionOf(a);
    const r = await xrpc(ctx, s, 'app.bsky.feed.getPostThread', { query: { uri: input.externalPostId, depth: 6, parentHeight: 0 } });
    const out: FetchedCommentInput[] = [];
    if (r.thread?.post) walkReplies(r.thread, input.externalPostId, out);
    return { items: out.slice(0, input.limit), nextCursor: null };
  },

  async commentAction(ctx, a, comment, action) {
    const s = sessionOf(a);
    if (action === 'DELETE') return deleteRecord(ctx, s, comment.externalId);
    if (action !== 'LIKE' && action !== 'UNLIKE') throw new NetworkError('NOT_SUPPORTED', `Bluesky does not support ${action} on replies.`);
    const p = await postView(ctx, s, comment.externalId);
    if (action === 'LIKE') {
      if (p.viewer?.like) return;
      await createRecord(ctx, s, 'app.bsky.feed.like', { $type: 'app.bsky.feed.like', subject: { uri: p.uri, cid: p.cid }, createdAt: ctx.now().toISOString() }, tidFor(`like:${s.did}:${p.uri}`));
    } else if (p.viewer?.like) {
      await deleteRecord(ctx, s, p.viewer.like);
    }
  },

  async accountAnalytics(ctx, a): Promise<AccountMetrics> {
    const s = sessionOf(a);
    const p = await xrpc(ctx, s, 'app.bsky.actor.getProfile', { query: { actor: s.did } });
    return { followers: p.followersCount ?? 0, following: p.followsCount ?? 0, postCount: p.postsCount ?? 0, raw: { followersCount: p.followersCount, followsCount: p.followsCount, postsCount: p.postsCount } };
  },

  async postAnalytics(ctx, a, uri) {
    return metrics(await postView(ctx, sessionOf(a), uri));
  },

  async importHistory(ctx, a, input) {
    const s = sessionOf(a);
    const r = await xrpc(ctx, s, 'app.bsky.feed.getAuthorFeed', { query: { actor: s.did, limit: Math.min(100, input.limit), cursor: input.cursor ?? undefined, filter: 'posts_no_replies' } });
    const items: HistoryPost[] = (r.feed ?? [])
      .filter((f: any) => !f.reason && f.post?.author?.did === s.did)
      .map((f: any): HistoryPost => {
        const p = f.post;
        const e = p.embed;
        return {
          externalId: p.uri, title: String(p.record?.text ?? '').slice(0, 200), permalink: permalinkOf(a, p.uri),
          publishedAt: new Date(p.record?.createdAt ?? p.indexedAt), type: historyType(e?.$type),
          thumbnail: e?.images?.[0]?.thumb ?? e?.thumbnail ?? e?.external?.thumb ?? null, smallThumbnail: e?.images?.[0]?.thumb ?? e?.thumbnail ?? e?.external?.thumb ?? null,
          metrics: metrics(p),
        };
      });
    return { items, nextCursor: r.cursor ?? null };
  },

  misc: {
    'misc.bluesky.deletePost': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await bluesky.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
    'misc.bluesky.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await bluesky.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
  },
};
