/**
 * LinkedIn — Community Management APIs (versioned REST, /rest/*) plus Sign In with LinkedIn (OIDC).
 *
 * Docs: https://learn.microsoft.com/linkedin/marketing/
 *   OAuth 2.0        www.linkedin.com/oauth/v2/authorization → /oauth/v2/accessToken (client_id and
 *                    client_secret in the form). Access tokens last 60 days; refresh tokens exist
 *                    only for approved partner apps — otherwise the member reconnects.
 *   Identity         GET /v2/userinfo (openid profile email): `sub` is the person id → urn:li:person:<sub>
 *   Organizations    GET /rest/organizationAcls?q=roleAssignee (ADMINISTRATOR, APPROVED) → optional
 *                    channels; posting as one sets the author to urn:li:organization:<id>
 *   Posts            POST /rest/posts → 201, the new URN is in the x-restli-id header, body empty.
 *                    Every /rest call sends Linkedin-Version (constant below) and
 *                    X-Restli-Protocol-Version: 2.0.0. Edit = PARTIAL_UPDATE, delete = DELETE.
 *   Media            POST /rest/{images|videos|documents}?action=initializeUpload → PUT bytes to the
 *                    returned URL(s) → (video: finalizeUpload with part ETags) → wait for AVAILABLE.
 *   Commentary       "little text" format: | { } @ [ ] ( ) < > * _ ~ and \ must be backslash-escaped
 *                    or the post is silently truncated. Mentions are @[Name](urn:li:person:…).
 *   Comments         /rest/socialActions/{urn}/comments. A comment's external id is its URN
 *                    urn:li:comment:(<object urn>,<id>), which carries the object it belongs to.
 */
import { NetworkError } from '../lib/errors.js';
import { httpError, request, resetFrom, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type {
  AccountMetrics, AccountProfile, AccountRuntime, Channel, FetchedCommentInput, HistoryPost, Issue, MediaRef, MiscHandler, NetworkAdapter, NetworkContext,
  PostMetrics, PublishInput, PublishResult, TokenSet,
} from '../types.js';

const API = 'https://api.linkedin.com';
const REST = `${API}/rest`;
const AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
/** The LinkedIn-Version header (YYYYMM). LinkedIn sunsets versions after about a year: bump with a retest. */
export const LINKEDIN_VERSION = '202510';
const SCOPES = ['openid', 'profile', 'email', 'w_member_social', 'r_member_postAnalytics', 'r_organization_social', 'w_organization_social', 'rw_organization_admin'];
const TEXT_MAX = 3000;
const COMMENT_MAX = 1250;
const MAX_IMAGES = 20;
const PART = 4 * MB;
const VISIBILITY = ['PUBLIC', 'CONNECTIONS', 'LOGGED_IN', 'CONTAINER'];
const DOC_MIMES = [
  'application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// ───────────────────────────── commentary ("little text") ─────────────────────────────

const MENTION = /@\[(?:\\.|[^\]\\])*\]\(urn:li:(?:person|organization):[^)\s]+\)/;
const LITTLE = new RegExp(`${MENTION.source}|\\\\[\\\\|{}@\\[\\]()<>#*_~]|[\\\\|{}@\\[\\]()<>*_~]`, 'g');

/**
 * Escape reserved characters. Idempotent: existing mentions and already-escaped pairs are left alone,
 * so text built by buildCommentary() can be posted as is. `#` stays raw so hashtags still link.
 */
export const escapeCommentary = (text: string) => text.replace(LITTLE, m => (m.length > 1 ? m : `\\${m}`));

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Turn `@Display Name` in plain text into mention syntax for the given tags; everything else is escaped. */
export function buildCommentary(text: string, tags: { display: string; urn: string }[]): string {
  const byDisplay = new Map(tags.map(t => [t.display, t]));
  const names = [...byDisplay.keys()].sort((a, b) => b.length - a.length);
  if (!names.length) return escapeCommentary(text);
  const re = new RegExp(names.map(n => `@${escapeRe(n)}`).join('|'), 'g');
  let out = '';
  let last = 0;
  for (const m of text.matchAll(re)) {
    const t = byDisplay.get(m[0].slice(1))!;
    out += escapeCommentary(text.slice(last, m.index)) + `@[${escapeCommentary(t.display)}](${t.urn})`;
    last = m.index! + m[0].length;
  }
  return out + escapeCommentary(text.slice(last));
}

// ───────────────────────────── errors ─────────────────────────────

const nextMidnightUtc = (now = new Date()) => { const d = new Date(now); d.setUTCHours(24, 0, 0, 0); return d; };

/** LinkedIn errors: { status, serviceErrorCode, code, message } — OAuth errors: { error, error_description }. */
function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const msg: string = body?.message ?? body?.error_description ?? (typeof body?.error === 'string' ? body.error : undefined) ?? `LinkedIn returned HTTP ${status}`;
  const opts = { httpStatus: status, meta: body };
  if (status === 401 || ['invalid_grant', 'invalid_token'].includes(body?.error) || /unable to retrieve access token|refresh token.*(invalid|expired)/i.test(msg)) return new NetworkError('TOKEN_INVALID', msg, opts);
  if (status === 429) return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: resetFrom(res) ?? nextMidnightUtc() });
  if (status === 426 || /version.*(not active|does not exist)/i.test(msg)) return new NetworkError('NOT_CONFIGURED', msg, { ...opts, userFacingMessage: 'Siar is using a LinkedIn API version that LinkedIn has retired. This needs a Siar update.' });
  if (status === 403) return new NetworkError('PERMISSION', msg, opts);
  if (status === 404) return new NetworkError('NOT_FOUND', msg, opts);
  if (status === 409 || (status === 422 && /duplicate/i.test(msg))) return new NetworkError('DUPLICATE', msg, opts);
  if (status === 422) return new NetworkError('CONTENT_REJECTED', msg, opts);
  if (status === 400 && /(image|video|document|media|thumbnail).*(not found|not available|invalid|unsupported|failed)/i.test(msg)) return new NetworkError('MEDIA_INVALID', msg, opts);
  if (status === 400) return new NetworkError('VALIDATION', msg, opts);
  return undefined;
}

const restHeaders = (token: string, extra: Record<string, string> = {}) => ({
  authorization: `Bearer ${token}`, 'linkedin-version': LINKEDIN_VERSION, 'x-restli-protocol-version': '2.0.0', ...extra,
});

/** A call where response headers matter (x-restli-id, ETag) or the body is empty. */
async function raw(ctx: NetworkContext, url: string, init: { method: string; headers: Record<string, string>; body?: BodyInit; timeoutMs?: number }): Promise<{ res: Response; body: any }> {
  let res: Response;
  try { res = await ctx.fetch(url, init); } catch (err) {
    throw new NetworkError('NETWORK_UNAVAILABLE', `Could not reach ${new URL(url).host}: ${(err as Error).message}`);
  }
  const text = await res.text();
  let body: any = null;
  if (text) { try { body = JSON.parse(text); } catch { body = text; } }
  if (!res.ok) throw mapError(res.status, body, res) ?? httpError(res, body);
  return { res, body };
}

const rest = (ctx: NetworkContext, a: AccountRuntime, path: string, init: { method?: string; json?: unknown; headers?: Record<string, string> } = {}) =>
  raw(ctx, `${REST}${path}`, {
    method: init.method ?? (init.json !== undefined ? 'POST' : 'GET'),
    headers: restHeaders(a.token.accessToken, { ...(init.json !== undefined ? { 'content-type': 'application/json' } : {}), ...(init.headers ?? {}) }),
    body: init.json !== undefined ? JSON.stringify(init.json) : undefined,
  });

const restJson = async <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, init?: Parameters<typeof rest>[3]): Promise<T> => (await rest(ctx, a, path, init)).body as T;

const api = <T = any>(ctx: NetworkContext, token: string, url: string, opts: RequestOptions = {}) => request<T>(ctx, url, { bearer: token, mapError, ...opts });

// ───────────────────────────── helpers ─────────────────────────────

const enc = encodeURIComponent;
const num = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : Number(v));
const feedUrl = (urn: string) => `https://www.linkedin.com/feed/update/${urn}/`;

/** The selected organization id, or null when posting as the member. */
const orgId = (a: AccountRuntime): string | null => a.channelId ?? (a.externalId && a.channels.some(c => c.id === a.externalId) ? a.externalId : null);
const authorUrn = (a: AccountRuntime): string => {
  const org = orgId(a);
  if (org) return `urn:li:organization:${org}`;
  const id = a.providerPageId ?? a.externalId;
  if (!id) throw new NetworkError('VALIDATION', 'This LinkedIn account has no member id; refresh the profile.');
  return `urn:li:person:${id}`;
};

const COMMENT_URN = /^urn:li:comment:\((urn:li:[A-Za-z]+:[^,]+),(\d+)\)$/;
const parseComment = (urn: string) => {
  const m = COMMENT_URN.exec(urn);
  if (!m) throw new NetworkError('VALIDATION', `"${urn}" is not a LinkedIn comment URN (urn:li:comment:(<object urn>,<id>)).`);
  return { objectUrn: m[1], commentId: m[2] };
};

const logoOf = (o: any): string | null => o.logoV2?.['original~']?.elements?.[0]?.identifiers?.[0]?.identifier ?? o.logoV2?.['cropped~']?.elements?.[0]?.identifiers?.[0]?.identifier ?? null;

const toChannel = (o: any, role?: string): Channel => ({
  id: String(o.id), name: o.localizedName ?? null, username: o.vanityName ?? null, avatarUrl: logoOf(o),
  metadata: { urn: `urn:li:organization:${o.id}`, role: role ?? null },
});

/** Organizations the member administers. Best effort: apps without the organization scopes get none. */
async function adminOrgs(ctx: NetworkContext, token: string): Promise<Channel[]> {
  const headers = restHeaders(token);
  try {
    const acls = await api(ctx, token, `${REST}/organizationAcls`, { headers, query: { q: 'roleAssignee', role: 'ADMINISTRATOR', state: 'APPROVED', count: 50 } });
    const out: Channel[] = [];
    for (const e of acls.elements ?? []) {
      const id = String(e.organization ?? '').split(':').pop();
      if (!id) continue;
      const o = await api(ctx, token, `${REST}/organizations/${id}`, { headers }).catch(() => ({ id, localizedName: null }));
      out.push(toChannel(o, e.role));
    }
    return out;
  } catch (e) {
    if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') throw e;
    return [];
  }
}

const profileOf = (u: any, channels: Channel[] = []): AccountProfile => ({
  externalId: String(u.sub), providerPageId: String(u.sub), username: null, displayName: u.name ?? null, avatarUrl: u.picture ?? null,
  userId: String(u.sub), userUsername: null, userDisplayName: u.name ?? null, userEmail: u.email ?? null, channels,
});

async function tokenRequest(ctx: NetworkContext, form: Record<string, string>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, TOKEN_URL, { form: { ...form, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret }, mapError });
  return {
    accessToken: tok.access_token, refreshToken: tok.refresh_token ?? prev?.refreshToken ?? null, expiresAt: expiresIn(tok.expires_in, ctx.now()),
    refreshTokenExpiresAt: tok.refresh_token_expires_in ? expiresIn(tok.refresh_token_expires_in, ctx.now()) : prev?.refreshTokenExpiresAt ?? null,
    scopes: String(tok.scope ?? SCOPES.join(',')).split(/[\s,]+/).filter(Boolean), secrets: { ...(prev?.secrets ?? {}) },
  };
}

// ───────────────────────────── media ─────────────────────────────

type Kind = 'images' | 'videos' | 'documents';

/** Upload one file and return its URN. Videos go up in parts; their ETags are handed back at finalize. */
async function upload(ctx: NetworkContext, a: AccountRuntime, kind: Kind, m: MediaRef): Promise<string> {
  const owner = authorUrn(a);
  const init = await restJson(ctx, a, `/${kind}?action=initializeUpload`, {
    json: { initializeUploadRequest: kind === 'videos' ? { owner, fileSizeBytes: m.fileSize, uploadCaptions: false, uploadThumbnail: false } : { owner } },
  });
  const v = init.value ?? {};
  const urn: string = v.image ?? v.video ?? v.document;
  if (!urn) throw new NetworkError('UNKNOWN', 'LinkedIn did not return a media URN.', { meta: init });
  const send = (url: string, body: Buffer) => raw(ctx, url, { method: 'PUT', headers: { authorization: `Bearer ${a.token.accessToken}`, 'content-type': 'application/octet-stream' }, body: new Uint8Array(body), timeoutMs: 600_000 });
  if (kind !== 'videos') {
    await send(v.uploadUrl, await m.read());
    return urn;
  }
  const etags: string[] = [];
  for (const part of (v.uploadInstructions ?? []) as { uploadUrl: string; firstByte: number; lastByte: number }[]) {
    // Parts are at most 4 MB; LinkedIn tells us the exact ranges.
    const r = await send(part.uploadUrl, await m.readRange(part.firstByte, Math.min(m.fileSize, part.lastByte + 1)));
    const etag = r.res.headers.get('etag');
    if (!etag) throw new NetworkError('MEDIA_INVALID', 'LinkedIn accepted a video part without an ETag.', { meta: part });
    etags.push(etag.replace(/"/g, ''));
  }
  await rest(ctx, a, '/videos?action=finalizeUpload', { json: { finalizeUploadRequest: { video: urn, uploadToken: v.uploadToken ?? '', uploadedPartIds: etags } } });
  return urn;
}

const kindOf = (urn: string): Kind | null => (urn.startsWith('urn:li:video:') ? 'videos' : urn.startsWith('urn:li:document:') ? 'documents' : null);

/** URNs LinkedIn is still processing (video, document). Throws when it gave up on one. */
async function stillProcessing(ctx: NetworkContext, a: AccountRuntime, urns: string[]): Promise<string[]> {
  const left: string[] = [];
  for (const urn of urns) {
    const kind = kindOf(urn);
    if (!kind) continue;
    const r = await restJson(ctx, a, `/${kind}/${enc(urn)}`);
    if (r.status === 'PROCESSING_FAILED') throw new NetworkError('MEDIA_INVALID', `LinkedIn could not process ${kind === 'videos' ? 'the video' : 'the document'}.`, { meta: r });
    if (r.status !== 'AVAILABLE') left.push(urn);
  }
  return left;
}

// ───────────────────────────── posting ─────────────────────────────

interface Pending { body: Record<string, unknown>; pending: string[]; startedAt: number }

const distribution = (d: Record<string, any>) => ({ feedDistribution: d.hideFromFeed ? 'NONE' : 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] });

async function buildBody(ctx: NetworkContext, input: PublishInput): Promise<{ body: Record<string, unknown>; pending: string[] }> {
  const a = input.account;
  const d = input.data;
  const body: Record<string, unknown> = {
    author: authorUrn(a), commentary: escapeCommentary(String(d.text ?? '')), visibility: d.privacy ?? 'PUBLIC', distribution: distribution(d),
    lifecycleState: 'PUBLISHED', isReshareDisabledByAuthor: !!d.disableReshare,
  };
  const pending: string[] = [];
  const images = input.media.filter(m => m.type === 'image');
  const vid = input.media.find(m => m.type === 'video');
  const doc = input.media.find(m => m.type === 'document');
  if (vid) {
    const urn = await upload(ctx, a, 'videos', vid);
    body.content = { media: { id: urn, ...(d.mediaTitle ? { title: String(d.mediaTitle) } : {}), ...(vid.altText ? { altText: vid.altText } : {}) } };
    pending.push(urn);
  } else if (doc) {
    const urn = await upload(ctx, a, 'documents', doc);
    // LinkedIn requires a title on document posts.
    body.content = { media: { id: urn, title: String(d.mediaTitle || `${input.title || 'Document'}.${doc.ext}`) } };
    pending.push(urn);
  } else if (images.length) {
    const urns: string[] = [];
    for (const m of images) urns.push(await upload(ctx, a, 'images', m));
    body.content = images.length === 1
      ? { media: { id: urns[0], ...(images[0].altText ? { altText: images[0].altText } : {}), ...(d.mediaTitle ? { title: String(d.mediaTitle) } : {}) } }
      : { multiImage: { images: urns.map((id, i) => ({ id, ...(images[i].altText ? { altText: images[i].altText } : {}) })) } };
  } else if (d.link) {
    const article: Record<string, unknown> = { source: String(d.link), title: String(d.mediaTitle || new URL(String(d.link)).hostname) };
    if (d.thumbnail) article.thumbnail = await upload(ctx, a, 'images', await input.resolveUpload(d.thumbnail));
    body.content = { article };
  }
  return { body, pending };
}

async function createPost(ctx: NetworkContext, a: AccountRuntime, body: Record<string, unknown>): Promise<PublishResult> {
  const { res } = await rest(ctx, a, '/posts', { json: body });
  const urn = res.headers.get('x-restli-id');
  if (!urn) throw new NetworkError('UNKNOWN', 'LinkedIn created the post but returned no x-restli-id header.');
  return { status: 'POSTED', externalPostId: urn, permalink: feedUrl(urn), externalData: { urn, author: body.author, visibility: body.visibility } };
}

const metricsOf = (s: any): PostMetrics => ({
  impressions: s.impressionCount, impressionsUnique: s.uniqueImpressionsCount, likes: s.likeCount, comments: s.commentCount, shares: s.shareCount, raw: s,
});

const commentOf = (c: any, objectUrn: string): FetchedCommentInput => {
  const id = String(c.id);
  return {
    externalId: c['$URN'] ?? `urn:li:comment:(${c.object ?? objectUrn},${id})`, externalParentId: c.parentComment ?? null, externalPostId: objectUrn,
    authorExternalId: c.actor ?? null, text: c.message?.text ?? null, likesCount: c.likesSummary?.totalLikes ?? 0, repliesCount: c.commentsSummary?.totalFirstLevelComments ?? 0,
    publishedAt: c.created?.time ? new Date(c.created.time) : null, platformData: { actor: c.actor, object: c.object ?? objectUrn },
  };
};

const mediaTypeOf = (p: any): HistoryPost['type'] => {
  const id: string = p.content?.media?.id ?? '';
  if (id.startsWith('urn:li:video:')) return 'VIDEO';
  if (id.startsWith('urn:li:image:') || p.content?.multiImage) return 'IMAGE';
  return 'POST';
};

async function listPosts(ctx: NetworkContext, a: AccountRuntime, start: number, count: number) {
  return restJson(ctx, a, `/posts?author=${enc(authorUrn(a))}&q=author&count=${count}&start=${start}&sortBy=LAST_MODIFIED`, { headers: { 'x-restli-method': 'FINDER' } });
}

// ───────────────────────────── adapter ─────────────────────────────

export const linkedin: NetworkAdapter = {
  type: 'LINKEDIN',
  displayName: 'LinkedIn',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'optional', postTypes: ['POST'],
    comments: true, firstComment: true, editPost: true, deletePost: true, editComment: true, deleteComment: true,
    commentImport: true, commentActions: ['DELETE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    textMax: TEXT_MAX, commentMax: COMMENT_MAX,
    media: {
      maxItems: MAX_IMAGES,
      image: { mimes: ['image/jpeg', 'image/png', 'image/gif'], maxBytes: 20 * MB },
      video: { mimes: ['video/mp4'], maxBytes: 5 * GB, minSeconds: 3, maxSeconds: 30 * 60 },
      document: { mimes: DOC_MIMES, maxBytes: 100 * MB },
    },
  },
  errorReference: [
    { code: '401 65601', message: 'The token used in the request has been revoked by the user.', meaning: 'The member removed the app, or the 60-day access token expired.', fix: 'Reconnect the LinkedIn account; Siar cannot refresh tokens unless LinkedIn approved refresh for the app.' },
    { code: '403 ACCESS_DENIED', message: 'Not enough permissions to access: partnerApiPostsExternal.CREATE', meaning: 'The token is missing a scope, or the app is not approved for the Community Management API.', fix: 'Reconnect and accept every permission; organization posting needs the app approved for Community Management.' },
    { code: '422 duplicate', message: 'Content is a duplicate of urn:li:share:…', meaning: 'The same commentary was posted by this author recently.', fix: 'Change the text; LinkedIn blocks identical posts.' },
    { code: '422 empty', message: 'Content cannot be empty', meaning: 'A post needs commentary even when it has media.', fix: 'Add text to the post.' },
    { code: '429', message: 'Resource level throttle APPLICATION DAY limit for calls to this resource is reached.', meaning: 'The app used its daily quota for this endpoint (resets at midnight UTC).', fix: 'Siar retries after the reset.' },
    { code: '426 NONEXISTENT_VERSION', message: 'Requested version 20230101 is not active', meaning: 'The LinkedIn-Version Siar sends has been retired.', fix: 'Update Siar; this is not something you can change per post.' },
    { code: '400 media', message: 'Media asset urn:li:image:… is not available.', meaning: 'An uploaded asset was not found, expired, or is still processing.', fix: 'Siar waits for videos and documents to become AVAILABLE; re-upload an image if it keeps failing.' },
    { code: '400 commentary', message: 'Unpermitted fields present in REQUEST_BODY', meaning: 'A field combination LinkedIn does not allow (for example CONTAINER visibility without a container).', fix: 'Use PUBLIC, CONNECTIONS or LOGGED_IN unless the post is inside a container.' },
    { code: '404', message: 'Not Found', meaning: 'The post or comment was deleted, or belongs to another author.', fix: 'Check it still exists on LinkedIn.' },
    { code: 'truncated text', message: '(no error — the post is cut off at the first unescaped ( or [ )', meaning: 'Reserved characters in commentary were not escaped.', fix: 'Siar escapes them for you; use the mentions builder for @mentions.' },
  ],

  async authorize(ctx, input) {
    const url = authorizeUrl(AUTH_URL, {
      response_type: 'code', client_id: ctx.credentials.clientId, redirect_uri: ctx.redirectUri, state: input.state, scope: SCOPES.join(' '),
    });
    return { url };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri });
    const u = await api(ctx, token.accessToken, `${API}/v2/userinfo`);
    return { token, profile: profileOf(u, await adminOrgs(ctx, token.accessToken)) };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'LinkedIn only issues refresh tokens to approved partner apps; reconnect the account.');
    return tokenRequest(ctx, { grant_type: 'refresh_token', refresh_token: a.token.refreshToken }, a.token);
  },

  async refreshProfile(ctx, a) {
    const u = await api(ctx, a.token.accessToken, `${API}/v2/userinfo`);
    return profileOf(u, await adminOrgs(ctx, a.token.accessToken));
  },

  async listChannels(ctx, a) {
    return adminOrgs(ctx, a.token.accessToken);
  },

  async selectChannel(_ctx, _a, channel) {
    return { externalId: channel.id, profile: { username: channel.username ?? null, displayName: channel.name ?? null, avatarUrl: channel.avatarUrl ?? null } };
  },

  async checkConnection(ctx, a) {
    try { await api(ctx, a.token.accessToken, `${API}/v2/userinfo`); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await request(ctx, 'https://www.linkedin.com/oauth/v2/revoke', {
      form: { token: a.token.accessToken, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret },
    }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    checkText(issues, data.text, TEXT_MAX, ['text'], true);
    checkMedia(issues, media, linkedin.limits);
    const by = (t: string) => media.filter(m => m.type === t).length;
    if (by('video') > 1 || by('document') > 1) issues.push({ code: 'too_many', message: 'A LinkedIn post takes one video, or one document, or up to 20 images.', path: ['uploadIds'] });
    if ((by('video') || by('document')) && media.length > 1) issues.push({ code: 'mixed', message: 'A LinkedIn post takes one video, or one document, or up to 20 images — not a mix.', path: ['uploadIds'] });
    if (data.link) {
      try { if (!/^https?:$/.test(new URL(String(data.link)).protocol)) throw new Error(); } catch { issues.push({ code: 'invalid', message: 'link must be an http(s) URL.', path: ['link'] }); }
    }
    if (data.privacy && !VISIBILITY.includes(data.privacy)) issues.push({ code: 'invalid', message: `privacy must be one of ${VISIBILITY.join(', ')}.`, path: ['privacy'] });
    if (data.mediaTitle && String(data.mediaTitle).length > 400) issues.push({ code: 'too_long', message: 'mediaTitle is limited to 400 characters.', path: ['mediaTitle'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const { body, pending } = await buildBody(ctx, input);
    const left = await stillProcessing(ctx, a, pending);
    if (left.length) {
      const state: Pending = { body, pending: left, startedAt: ctx.now().getTime() };
      return { status: 'PROCESSING', pendingRef: JSON.stringify(state), pollAfterMs: 15_000, externalData: { pending: left } };
    }
    return createPost(ctx, a, body);
  },

  async poll(ctx, input, pendingRef) {
    const st = JSON.parse(pendingRef) as Pending;
    const left = await stillProcessing(ctx, input.account, st.pending);
    if (left.length) {
      if (ctx.now().getTime() - st.startedAt > 3 * 3600_000) throw new NetworkError('MEDIA_INVALID', 'LinkedIn did not finish processing the media within 3 hours.', { retryability: 'retryable' });
      return { status: 'PROCESSING', pendingRef: JSON.stringify({ ...st, pending: left }), pollAfterMs: 30_000 };
    }
    return createPost(ctx, input.account, st.body);
  },

  async recentPosts(ctx, a, since) {
    const r = await listPosts(ctx, a, 0, 20);
    return (r.elements ?? []).filter((p: any) => p.lifecycleState === 'PUBLISHED' && new Date(p.publishedAt ?? p.createdAt) >= since)
      .map((p: any) => ({ externalId: p.id, text: p.commentary ?? null, createdAt: new Date(p.publishedAt ?? p.createdAt), permalink: feedUrl(p.id) }));
  },

  async deletePost(ctx, a, urn) {
    await rest(ctx, a, `/posts/${enc(urn)}`, { method: 'DELETE', headers: { 'x-restli-method': 'DELETE' } });
  },

  async editPost(ctx, a, urn, data) {
    const text = data.description ?? data.text ?? data.commentary;
    if (typeof text !== 'string' || !text.trim()) throw new NetworkError('VALIDATION', 'LinkedIn only lets you edit the commentary; send the new text.');
    await rest(ctx, a, `/posts/${enc(urn)}`, { json: { patch: { $set: { commentary: escapeCommentary(text) } } }, headers: { 'x-restli-method': 'PARTIAL_UPDATE' } });
  },

  async comment(ctx, input) {
    const a = input.account;
    const actor = authorUrn(a);
    const objectUrn = input.externalPostId;
    const r = await restJson(ctx, a, `/socialActions/${enc(objectUrn)}/comments`, {
      json: { actor, object: objectUrn, message: { text: escapeCommentary(input.text) }, ...(input.parentExternalId ? { parentComment: input.parentExternalId } : {}) },
    });
    const externalId = r['$URN'] ?? `urn:li:comment:(${objectUrn},${r.id})`;
    return { externalId, permalink: feedUrl(objectUrn), externalData: { id: r.id } };
  },

  async editComment(ctx, a, urn, text) {
    const { objectUrn, commentId } = parseComment(urn);
    await rest(ctx, a, `/socialActions/${enc(objectUrn)}/comments/${commentId}?actor=${enc(authorUrn(a))}`, { json: { patch: { message: { $set: { text: escapeCommentary(text) } } } } });
  },

  async deleteComment(ctx, a, urn) {
    const { objectUrn, commentId } = parseComment(urn);
    await rest(ctx, a, `/socialActions/${enc(objectUrn)}/comments/${commentId}?actor=${enc(authorUrn(a))}`, { method: 'DELETE' });
  },

  async importComments(ctx, a, input) {
    const start = Number(input.cursor ?? 0) || 0;
    const count = Math.max(1, Math.min(100, input.limit));
    const r = await restJson(ctx, a, `/socialActions/${enc(input.externalPostId)}/comments?start=${start}&count=${count}`);
    const items = (r.elements ?? []).map((c: any) => commentOf(c, input.externalPostId));
    const total = r.paging?.total;
    return { items, nextCursor: items.length && (total === undefined ? items.length === count : start + items.length < total) ? String(start + items.length) : null };
  },

  async commentAction(ctx, a, comment, action) {
    if (action !== 'DELETE') throw new NetworkError('NOT_SUPPORTED', `LinkedIn does not support ${action} on comments.`);
    await linkedin.deleteComment!(ctx, a, comment.externalId);
  },

  async accountAnalytics(ctx, a): Promise<AccountMetrics> {
    const org = orgId(a);
    let followers: number | undefined;
    let raw: unknown = null;
    try {
      if (org) {
        raw = await restJson(ctx, a, `/networkSizes/${enc(`urn:li:organization:${org}`)}?edgeType=COMPANY_FOLLOWED_BY_MEMBER`);
        followers = num((raw as any)?.firstDegreeSize);
      } else {
        raw = await restJson(ctx, a, '/memberFollowersCount?q=me');
        followers = num((raw as any)?.elements?.[0]?.memberFollowersCount);
      }
    } catch (e) {
      if (!(e instanceof NetworkError) || e.code === 'TOKEN_INVALID') throw e;
    }
    return { followers, raw };
  },

  async postAnalytics(ctx, a, urn): Promise<PostMetrics> {
    const org = orgId(a);
    if (org) {
      const r = await restJson(ctx, a, `/organizationalEntityShareStatistics?q=organizationalEntity&organizationalEntity=${enc(`urn:li:organization:${org}`)}&shares=List(${enc(urn)})`);
      const s = r.elements?.[0]?.totalShareStatistics;
      if (!s) throw new NetworkError('NOT_FOUND', `LinkedIn has no statistics for ${urn}.`, { httpStatus: 404 });
      return metricsOf(s);
    }
    // Member posts: one call per metric (memberCreatorPostAnalytics).
    const entity = `(${urn.startsWith('urn:li:ugcPost:') ? 'ugc' : 'share'}:${enc(urn)})`;
    const types = ['IMPRESSION', 'MEMBERS_REACHED', 'REACTION', 'COMMENT', 'RESHARE'] as const;
    const got = await Promise.all(types.map(t => restJson(ctx, a, `/memberCreatorPostAnalytics?q=entity&entity=${entity}&queryType=${t}&aggregation=TOTAL`).then(r => num(r.elements?.[0]?.count) ?? 0)));
    const [impressions, reach, likes, comments, shares] = got;
    return { impressions, impressionsUnique: reach, likes, comments, shares, raw: Object.fromEntries(types.map((t, i) => [t, got[i]])) };
  },

  async importHistory(ctx, a, input) {
    const start = Number(input.cursor ?? 0) || 0;
    const count = Math.max(1, Math.min(100, input.limit));
    const r = await listPosts(ctx, a, start, count);
    const items: HistoryPost[] = (r.elements ?? []).filter((p: any) => p.lifecycleState === 'PUBLISHED').map((p: any) => ({
      externalId: p.id, title: String(p.commentary ?? '').slice(0, 200) || null, permalink: feedUrl(p.id), publishedAt: new Date(p.publishedAt ?? p.createdAt),
      type: mediaTypeOf(p), extraData: { visibility: p.visibility ?? null, author: p.author ?? null },
    }));
    const total = r.paging?.total;
    return { items, nextCursor: (r.elements ?? []).length && (total === undefined ? (r.elements ?? []).length === count : start + (r.elements ?? []).length < total) ? String(start + (r.elements ?? []).length) : null };
  },

  misc: ((): Record<string, MiscHandler> => ({
    'misc.linkedin.getTags': async (ctx, a, { query }) => {
      const scope = String(query.scope ?? 'all').toLowerCase();
      const term = String(query.q ?? query.url ?? '').trim();
      const out = { people: [] as any[], organizations: [] as any[] };
      const person = /urn:li:person:([A-Za-z0-9_-]+)/.exec(term) ?? /urn:li:person:([A-Za-z0-9_-]+)/.exec(String(query.url ?? ''));
      if (person && ['all', 'people'].includes(scope)) {
        let display = String(query.displayName ?? '');
        let photoUrl: string | undefined;
        if (!display) {
          // Member lookups are restricted to approved apps: when LinkedIn refuses, the caller supplies the name.
          const p = await restJson(ctx, a, `/people/(id:${person[1]})`).catch(() => null);
          display = [p?.localizedFirstName, p?.localizedLastName].filter(Boolean).join(' ');
          photoUrl = p?.profilePicture?.displayImage;
        }
        out.people.push({ kind: 'person', urn: `urn:li:person:${person[1]}`, display, needsDisplayName: !display, ...(photoUrl ? { photoUrl } : {}) });
      }
      if (!person && term && ['all', 'organizations'].includes(scope)) {
        const vanity = /linkedin\.com\/company\/([^/?#]+)/i.exec(term)?.[1] ?? term.toLowerCase().replace(/^@/, '').replace(/\s+/g, '-');
        const r = await restJson(ctx, a, `/organizations?q=vanityName&vanityName=${enc(vanity)}`).catch((e: unknown) => {
          if (e instanceof NetworkError && ['NOT_FOUND', 'PERMISSION', 'VALIDATION'].includes(e.code)) return { elements: [] };
          throw e;
        });
        for (const o of r.elements ?? []) {
          out.organizations.push({ kind: 'organization', urn: `urn:li:organization:${o.id}`, display: o.localizedName ?? o.vanityName ?? String(o.id), ...(o.vanityName ? { vanityName: o.vanityName } : {}), ...(logoOf(o) ? { logoUrl: logoOf(o) } : {}) });
        }
      }
      return out;
    },
    'misc.linkedin.buildCommentary': async (_ctx, _a, { body }) => ({ commentary: buildCommentary(String(body.text ?? ''), body.tags ?? []) }),
    'misc.linkedin.resharePost': async (ctx, a, { body }) => {
      const r = await createPost(ctx, a, {
        author: authorUrn(a), commentary: escapeCommentary(String(body.commentary)), visibility: body.visibility ?? 'PUBLIC', distribution: distribution({}),
        lifecycleState: 'PUBLISHED', isReshareDisabledByAuthor: !!body.disableReshare, reshareContext: { parent: body.parentPostUrn },
      });
      if (r.status !== 'POSTED') throw new NetworkError('UNKNOWN', 'Unexpected reshare state.');
      return { success: true, id: r.externalPostId, activity: null, permalink: r.permalink ?? null };
    },
    'misc.linkedin.editPost': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await linkedin.editPost!(ctx, a, p.externalPostId, { description: body.description });
      return { success: true, permalink: p.permalink ?? feedUrl(p.externalPostId) };
    },
    'misc.linkedin.deletePost': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await linkedin.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
    'misc.linkedin.editComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await linkedin.editComment!(ctx, a, c.externalId, body.text);
      return { success: true, permalink: c.externalPostId ? feedUrl(c.externalPostId) : null };
    },
    'misc.linkedin.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await linkedin.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
  }))(),
};
