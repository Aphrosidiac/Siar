/**
 * Reddit — OAuth2 "permanent" grant + oauth.reddit.com.
 *
 * Docs: https://www.reddit.com/dev/api · https://github.com/reddit-archive/reddit/wiki/OAuth2
 *   OAuth            www.reddit.com/api/v1/authorize (duration=permanent) → POST /api/v1/access_token with
 *                    HTTP Basic (client id : secret). Access tokens last 1 h, the refresh token never rotates.
 *                    A bad code answers HTTP 200 with {"error":"invalid_grant"} — the body must be checked.
 *   User-Agent       Every call carries a descriptive User-Agent; Reddit throttles/blocks the default ones.
 *   Submit           POST /api/submit (kind self | link | image | video). Failures are HTTP 200 with
 *                    {json:{errors:[[CODE, message, field]]}}, so every response is checked, not just non-2xx.
 *   Media            POST /api/media/asset.json leases an S3 upload (action + fields) → multipart POST of the
 *                    file → its Location is the url for kind=image|video. The post id arrives over a websocket,
 *                    so we find the post again in /user/{name}/submitted (poll()).
 *   Comments         POST /api/comment · /api/editusertext · /api/del · GET /comments/{id}
 *   Analytics        GET /api/info?id=t3_… (score, upvote_ratio, num_comments, num_crossposts)
 *   History          GET /user/{name}/submitted
 *   Rate limits      ~100 requests/min per client; RATELIMIT errors say "try again in N minutes".
 */
import { NetworkError, type ErrorCode } from '../lib/errors.js';
import { request, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, basicAuth, expiresIn } from '../lib/oauth.js';
import { checkMedia, charCount, GB, MB } from '../lib/validate.js';
import type { AccountProfile, AccountRuntime, FetchedCommentInput, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, PublishResult, TokenSet } from '../types.js';

const API = 'https://oauth.reddit.com';
const WWW = 'https://www.reddit.com';
const USER_AGENT = 'web:dev.siar.api:v1.0 (by /u/siar-dev)';
const SCOPES = ['identity', 'submit', 'edit', 'read', 'flair', 'history'];
const TITLE_MAX = 300;
const TEXT_MAX = 40_000;
const COMMENT_MAX = 10_000;
const SR_RE = /^[A-Za-z0-9_]{2,21}$/;
/** The post id only shows up over a websocket; stop waiting for it after this long. */
const MEDIA_WAIT_MS = 15 * 60_000;

// ───────────────────────────── errors ─────────────────────────────

/** Reddit's own error codes (json.errors[][0]) → our categories. */
function codeFor(code: string): ErrorCode {
  const c = code.toUpperCase();
  if (c === 'RATELIMIT') return 'RATE_LIMITED';
  if (['USER_REQUIRED', 'INVALID_TOKEN', 'LOGIN_REQUIRED'].includes(c)) return 'TOKEN_INVALID';
  if (['SUBREDDIT_NOEXIST', 'DELETED_LINK', 'DELETED_COMMENT', 'NO_THING_ID', 'THING_NOT_FOUND', 'USER_DOESNT_EXIST'].includes(c)) return 'NOT_FOUND';
  if (['SUBREDDIT_NOTALLOWED', 'SUBREDDIT_NOTALLOWED_BANNED', 'SUBREDDIT_NOTALLOWED_BANNED_PM', 'NOT_AUTHOR', 'THREAD_LOCKED', 'FORBIDDEN', 'RESTRICTED_TO_PM', 'SUBREDDIT_OWNER_LIMIT', 'OVER_18_ONLY', 'QUARANTINE_REQUIRED', 'SUBREDDIT_RULES_REQUIRED'].includes(c)) return 'PERMISSION';
  if (c === 'ALREADY_SUB') return 'DUPLICATE';
  if (c.startsWith('SUBMIT_VALIDATION_') || ['NO_SELFS', 'NO_LINKS', 'NO_IMAGES', 'NO_VIDEOS', 'NO_POLLS', 'NO_GALLERIES'].includes(c)) return 'CONTENT_REJECTED';
  if (['INVALID_IMAGE', 'IMAGE_ERROR', 'VIDEO_ERROR', 'BAD_VIDEO'].includes(c)) return 'MEDIA_INVALID';
  if (['INTERNAL_ERROR', 'SERVICE_UNAVAILABLE'].includes(c)) return 'NETWORK_UNAVAILABLE';
  return 'VALIDATION';
}

/** "you are doing that too much. try again in 9 minutes." / "… 45 seconds." → a Date. */
function waitFrom(message: string, seconds?: number): Date | null {
  if (typeof seconds === 'number' && seconds > 0) return new Date(Date.now() + Math.ceil(seconds) * 1000);
  const m = message.match(/(\d+)\s*(second|minute|hour)/i);
  if (!m) return null;
  const unit = m[2].toLowerCase() === 'second' ? 1000 : m[2].toLowerCase() === 'minute' ? 60_000 : 3_600_000;
  return new Date(Date.now() + Number(m[1]) * unit);
}

/** HTTP-level failures (token endpoint, 401/403/404/429, and the {message, error} body). */
function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const message: string = (typeof body === 'object' && body ? body.error_description ?? body.message ?? body.reason ?? (typeof body.error === 'string' ? body.error : undefined) : undefined) ?? `Reddit returned HTTP ${status}`;
  const opts = { httpStatus: status, meta: body };
  if (body?.error === 'invalid_grant' || body?.error === 'invalid_token' || status === 401) return new NetworkError('TOKEN_INVALID', message, opts);
  if (status === 429) {
    const secs = Number(res.headers.get('x-ratelimit-reset') ?? res.headers.get('retry-after'));
    return new NetworkError('RATE_LIMITED', message, { ...opts, rateLimitResetAt: Number.isFinite(secs) && secs > 0 ? new Date(Date.now() + secs * 1000) : null });
  }
  if (status === 403) {
    const reason = String(body?.reason ?? '');
    const why: Record<string, string> = {
      private: 'This subreddit is private; the connected account is not an approved member.',
      quarantined: 'This subreddit is quarantined; the account has not opted in to view it.',
      banned: 'This subreddit is banned.',
    };
    return new NetworkError('PERMISSION', message, { ...opts, userFacingMessage: why[reason] });
  }
  if (status === 404) return new NetworkError('NOT_FOUND', message, opts);
  return undefined;
}

/** Reddit reports most failures as HTTP 200 + json.errors. Throw the first one. */
function throwIfErrors(body: any): void {
  const errs: unknown[] = body?.json?.errors;
  if (!Array.isArray(errs) || !errs.length) return;
  const [code, message, field] = errs[0] as [string, string, string?];
  const text = message ? String(message) : String(code);
  const category = codeFor(String(code));
  throw new NetworkError(category, text, {
    httpStatus: 200, meta: { code, field: field ?? null, errors: errs },
    rateLimitResetAt: category === 'RATE_LIMITED' ? waitFrom(text, body?.json?.ratelimit) : null,
    userFacingMessage: String(code).toUpperCase() === 'SUBMIT_VALIDATION_FLAIR_REQUIRED' ? 'This subreddit requires post flair. Pick one with flairId (see the subreddit-flairs endpoint).' : undefined,
  });
}

const api = async <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: RequestOptions = {}): Promise<T> => {
  const res = await request<T>(ctx, `${API}${path}`, {
    bearer: a.token.accessToken, mapError, ...opts,
    headers: { 'user-agent': USER_AGENT, ...(opts.headers ?? {}) },
    query: { raw_json: 1, ...(opts.query ?? {}) },
  });
  throwIfErrors(res);
  return res;
};

// ───────────────────────────── helpers ─────────────────────────────

const bare = (id: string) => String(id).replace(/^t\d_/, '');
const t1 = (id: string) => `t1_${bare(id)}`;
const t3 = (id: string) => `t3_${bare(id)}`;
const normSr = (s: string) => String(s).trim().replace(/^\/?r\//i, '').replace(/^\/?u\//i, 'u_');
const absolute = (p?: string | null) => (p ? (p.startsWith('http') ? p : `${WWW}${p}`) : null);
const isUrl = (s?: string | null) => !!s && /^https?:\/\//.test(s);
const permalinkOf = (d: any) => absolute(d?.permalink) ?? (d?.id ? `${WWW}/comments/${d.id}` : null);

async function me(ctx: NetworkContext, a: { token: TokenSet }) {
  return request(ctx, `${API}/api/v1/me`, { bearer: a.token.accessToken, mapError, headers: { 'user-agent': USER_AGENT }, query: { raw_json: 1 } });
}

const profileOf = (u: any): AccountProfile => ({
  externalId: String(u.id), providerPageId: String(u.id), username: u.name ?? null, displayName: u.subreddit?.title || u.name || null,
  avatarUrl: u.snoovatar_img || u.icon_img || u.subreddit?.icon_img || null, bio: u.subreddit?.public_description ?? null,
  userId: String(u.id), userUsername: u.name ?? null, userDisplayName: u.name ?? null,
});

async function usernameOf(ctx: NetworkContext, a: AccountRuntime): Promise<string> {
  if (a.username) return a.username;
  const u = await me(ctx, a);
  if (!u?.name) throw new NetworkError('VALIDATION', 'This Reddit account has no username; refresh the profile.');
  return u.name;
}

async function tokenRequest(ctx: NetworkContext, form: Record<string, string>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, `${WWW}/api/v1/access_token`, {
    form, mapError, headers: { authorization: basicAuth(String(ctx.credentials.clientId ?? ''), String(ctx.credentials.clientSecret ?? '')), 'user-agent': USER_AGENT },
  });
  // Reddit answers HTTP 200 for a rejected grant.
  if (!tok || typeof tok !== 'object' || tok.error || !tok.access_token) {
    const err = String(tok?.error ?? 'unknown');
    throw new NetworkError(err === 'invalid_grant' || err === 'invalid_token' ? 'TOKEN_INVALID' : 'VALIDATION', tok?.error_description ?? tok?.message ?? `Reddit rejected the token request (${err}).`, { httpStatus: 200, meta: tok });
  }
  return {
    accessToken: tok.access_token,
    refreshToken: tok.refresh_token ?? prev?.refreshToken ?? null,
    expiresAt: expiresIn(tok.expires_in, ctx.now()),
    scopes: String(tok.scope ?? SCOPES.join(' ')).split(/[\s,]+/).filter(Boolean),
    secrets: { ...(prev?.secrets ?? {}) },
  };
}

/** Lease an S3 upload, send the file, and return the hosted URL Reddit accepts as kind=image|video. */
async function uploadAsset(ctx: NetworkContext, a: AccountRuntime, m: Pick<MediaRef, 'mime' | 'ext' | 'read'>): Promise<string> {
  const lease = await api(ctx, a, '/api/media/asset.json', { method: 'POST', form: { filepath: `upload.${m.ext}`, mimetype: m.mime } });
  const args = lease?.args;
  if (!args?.action || !Array.isArray(args.fields)) throw new NetworkError('MEDIA_INVALID', 'Reddit did not return an upload lease for this media.', { meta: lease });
  const action: string = String(args.action).startsWith('//') ? `https:${args.action}` : String(args.action);
  const fd = new FormData();
  for (const f of args.fields as { name: string; value: string }[]) fd.append(f.name, f.value);
  fd.append('file', new Blob([new Uint8Array(await m.read())], { type: m.mime }), `upload.${m.ext}`);
  const res = await request<string>(ctx, action, {
    method: 'POST', body: fd, timeoutMs: 600_000,
    mapError: (status, body) => new NetworkError('MEDIA_INVALID', `Reddit's media storage rejected the upload (HTTP ${status}).`, { httpStatus: status, meta: typeof body === 'string' ? body.slice(0, 500) : body }),
  });
  const key = (args.fields as { name: string; value: string }[]).find(f => f.name === 'key')?.value;
  // `<action>/<key>` is what Reddit's own clients submit (PRAW); the S3 <Location> is URL-encoded (%2F).
  const loc = typeof res === 'string' ? res.match(/<Location>([^<]+)<\/Location>/)?.[1] : null;
  const url = key ? `${action}/${key}` : loc ? decodeURIComponent(loc.replace(/&amp;/g, '&')) : null;
  if (!url) throw new NetworkError('MEDIA_INVALID', 'Reddit accepted the upload but returned no media URL.');
  return url;
}

const toMetrics = (d: any): PostMetrics => {
  const ups = Number(d?.ups ?? d?.score ?? 0);
  const ratio = typeof d?.upvote_ratio === 'number' && d.upvote_ratio > 0 ? d.upvote_ratio : null;
  return {
    likes: ups, dislikes: ratio && ratio < 1 ? Math.round(ups / ratio - ups) : 0, comments: Number(d?.num_comments ?? 0), shares: Number(d?.num_crossposts ?? 0),
    views: typeof d?.view_count === 'number' ? d.view_count : undefined,
    raw: { score: d?.score, ups: d?.ups, upvote_ratio: d?.upvote_ratio, num_comments: d?.num_comments, num_crossposts: d?.num_crossposts, view_count: d?.view_count ?? null },
  };
};

const toHistory = (d: any): HistoryPost => {
  const thumb = isUrl(d.thumbnail) ? d.thumbnail : null;
  return {
    externalId: d.id, title: d.title ?? null, thumbnail: thumb, smallThumbnail: thumb, permalink: permalinkOf(d), subreddit: d.subreddit ?? null,
    publishedAt: d.created_utc ? new Date(Number(d.created_utc) * 1000) : null,
    type: d.is_video ? 'VIDEO' : d.post_hint === 'image' ? 'IMAGE' : 'POST',
    extraData: { url: d.url ?? null, nsfw: !!d.over_18, flair: d.link_flair_text ?? null, selftext: d.selftext ? String(d.selftext).slice(0, 500) : null },
    metrics: toMetrics(d),
  };
};

/** /comments/{id} → [post listing, comment listing]; flatten the reply tree. */
function flattenComments(children: any[], postId: string, out: FetchedCommentInput[] = []): FetchedCommentInput[] {
  for (const ch of children ?? []) {
    if (ch?.kind !== 't1') continue;
    const d = ch.data;
    const replies = d.replies && typeof d.replies === 'object' ? (d.replies.data?.children ?? []).filter((x: any) => x.kind === 't1') : [];
    out.push({
      externalId: d.id, externalParentId: String(d.parent_id ?? '').startsWith('t1_') ? bare(d.parent_id) : null, externalPostId: postId,
      authorName: d.author ?? null, authorExternalId: d.author_fullname ?? null, authorProfileUrl: d.author && d.author !== '[deleted]' ? `${WWW}/user/${d.author}` : null,
      text: d.body ?? '', likesCount: Number(d.score ?? 0), repliesCount: replies.length, publishedAt: d.created_utc ? new Date(Number(d.created_utc) * 1000) : null,
      platformData: { permalink: permalinkOf(d), edited: d.edited ?? false, distinguished: d.distinguished ?? null, stickied: !!d.stickied },
    });
    if (d.replies && typeof d.replies === 'object') flattenComments(d.replies.data?.children ?? [], postId, out);
  }
  return out;
}

async function submitted(ctx: NetworkContext, a: AccountRuntime, query: Record<string, string | number | undefined>) {
  const name = await usernameOf(ctx, a);
  return api(ctx, a, `/user/${encodeURIComponent(name)}/submitted`, { query: { sort: 'new', ...query } });
}

async function editThing(ctx: NetworkContext, a: AccountRuntime, fullname: string, text: string) {
  const res = await api(ctx, a, '/api/editusertext', { method: 'POST', form: { api_type: 'json', thing_id: fullname, text } });
  return res?.json?.data?.things?.[0]?.data ?? null;
}

async function removeThing(ctx: NetworkContext, a: AccountRuntime, fullname: string) {
  await api(ctx, a, '/api/del', { method: 'POST', form: { id: fullname } });
}

async function flairs(ctx: NetworkContext, a: AccountRuntime, sr: string): Promise<any[]> {
  const res = await api(ctx, a, `/r/${encodeURIComponent(normSr(sr))}/api/link_flair_v2`);
  return Array.isArray(res) ? res : [];
}

// ───────────────────────────── adapter ─────────────────────────────

export const reddit: NetworkAdapter = {
  type: 'REDDIT',
  displayName: 'Reddit',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'none', postTypes: ['TEXT', 'LINK', 'IMAGE', 'VIDEO'],
    comments: true, firstComment: true, editPost: true, deletePost: true, editComment: true, deleteComment: true,
    commentImport: true, commentActions: ['DELETE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    textMax: TEXT_MAX,
    titleMax: TITLE_MAX,
    commentMax: COMMENT_MAX,
    media: {
      maxItems: 1,
      image: { mimes: ['image/jpeg', 'image/png', 'image/gif'], maxBytes: 20 * MB },
      video: { mimes: ['video/mp4', 'video/quicktime'], maxBytes: 1 * GB, minSeconds: 1, maxSeconds: 15 * 60 },
    },
  },
  errorReference: [
    { code: '401', message: 'Unauthorized', meaning: 'The access token expired or the user revoked the app at reddit.com/prefs/apps.', fix: 'Siar refreshes automatically; if it still fails, reconnect the Reddit account.' },
    { code: '403 private', message: 'Forbidden', meaning: 'The subreddit is private, quarantined or banned for this account.', fix: 'Join the subreddit with the connected account, or pick another one.' },
    { code: '429 / RATELIMIT', message: 'you are doing that too much. try again in 9 minutes.', meaning: 'New or low-karma accounts may post only once every few minutes; the client also has a request-per-minute limit.', fix: 'Siar retries after the wait. Build up karma or spread posts out.' },
    { code: 'SUBREDDIT_NOEXIST', message: "that subreddit doesn't exist", meaning: 'The sr value names no subreddit (typo, or it was banned or renamed).', fix: 'Use the subreddit name without "r/".' },
    { code: 'SUBREDDIT_NOTALLOWED', message: "you aren't allowed to post there.", meaning: 'The subreddit restricts posting to approved users, or the account is banned there.', fix: 'Ask the moderators for approval, or post somewhere else.' },
    { code: 'SUBMIT_VALIDATION_FLAIR_REQUIRED', message: 'Your post must contain post flair.', meaning: 'The subreddit requires a flair on every post.', fix: 'Fetch the flairs with GET /misc/reddit/subreddit-flairs and send flairId.' },
    { code: 'BAD_FLAIR_TEMPLATE_ID', message: 'invalid flair template id', meaning: 'flairId does not belong to this subreddit, or is mod-only.', fix: 'Use an id returned by the subreddit-flairs endpoint (modOnly: false).' },
    { code: 'NO_LINKS / NO_SELFS', message: 'this subreddit only allows text posts', meaning: 'The subreddit disables this post type (links, text, images or video).', fix: 'Check the subreddit post requirements and change the post type.' },
    { code: 'TOO_LONG', message: 'this is too long (max: 300)', meaning: 'The title is over 300 characters, or the text is over 40,000.', fix: 'Shorten it.' },
    { code: 'invalid_grant', message: 'invalid_grant', meaning: 'The refresh token was revoked or the authorization code was reused (Reddit answers this with HTTP 200).', fix: 'Reconnect the Reddit account.' },
  ],

  async authorize(ctx, input) {
    return {
      url: authorizeUrl(`${WWW}/api/v1/authorize`, {
        client_id: String(ctx.credentials.clientId ?? ''), response_type: 'code', state: input.state, redirect_uri: ctx.redirectUri,
        duration: 'permanent', scope: SCOPES.join(' '),
      }),
    };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri });
    return { token, profile: profileOf(await me(ctx, { token })) };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No Reddit refresh token; reconnect the account.');
    return tokenRequest(ctx, { grant_type: 'refresh_token', refresh_token: a.token.refreshToken }, a.token);
  },

  async refreshProfile(ctx, a) {
    return profileOf(await me(ctx, a));
  },

  async checkConnection(ctx, a) {
    try { await me(ctx, a); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await request(ctx, `${WWW}/api/v1/revoke_token`, {
      form: { token: a.token.refreshToken ?? a.token.accessToken, token_type_hint: a.token.refreshToken ? 'refresh_token' : 'access_token' },
      headers: { authorization: basicAuth(String(ctx.credentials.clientId ?? ''), String(ctx.credentials.clientSecret ?? '')), 'user-agent': USER_AGENT },
    }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const sr = typeof data.sr === 'string' ? normSr(data.sr) : '';
    if (!sr) issues.push({ code: 'required', message: 'sr (the subreddit name) is required.', path: ['sr'] });
    else if (!SR_RE.test(sr)) issues.push({ code: 'invalid', message: 'sr must be a subreddit name: 2 to 21 letters, digits or underscores, without "r/".', path: ['sr'] });
    if (typeof data.text === 'string' && charCount(data.text) > TEXT_MAX) issues.push({ code: 'too_long', message: `Text is ${charCount(data.text)} characters; Reddit allows ${TEXT_MAX}.`, path: ['text'] });
    if (data.link) {
      if (!isUrl(String(data.link))) issues.push({ code: 'invalid', message: 'link must be an absolute http(s) URL.', path: ['link'] });
      if (media.length) issues.push({ code: 'link_with_media', message: 'A Reddit post is either a link or an image/video, not both.', path: ['link'] });
    }
    checkMedia(issues, media, reddit.limits, ['uploadIds'], { types: ['image', 'video'] });
    if (data.nsfw !== undefined && data.nsfw !== null && typeof data.nsfw !== 'boolean') issues.push({ code: 'invalid', message: 'nsfw must be true or false.', path: ['nsfw'] });
    if (data.flairId !== undefined && data.flairId !== null && (typeof data.flairId !== 'string' || !data.flairId.trim())) issues.push({ code: 'invalid', message: 'flairId must be a flair template id.', path: ['flairId'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const d = input.data;
    const title = String(input.title ?? '').trim();
    const sr = normSr(String(d.sr ?? ''));
    if (!sr) throw new NetworkError('VALIDATION', 'sr (the subreddit name) is required.');
    if (!title) throw new NetworkError('VALIDATION', 'A Reddit post needs a title.');
    if (charCount(title) > TITLE_MAX) throw new NetworkError('CONTENT_REJECTED', `The title is ${charCount(title)} characters; Reddit allows ${TITLE_MAX}.`);
    const m = input.media[0];

    const form: Record<string, string | number | boolean | undefined> = {
      api_type: 'json', sr, title, resubmit: true, sendreplies: true, nsfw: !!d.nsfw, flair_id: d.flairId || undefined,
    };
    if (m) {
      form.kind = m.type === 'video' ? 'video' : 'image';
      form.url = await uploadAsset(ctx, a, m);
      // Video posts need a poster image, uploaded the same way (video_poster_url).
      if (m.type === 'video') {
        if (!m.poster) throw new NetworkError('MEDIA_INVALID', 'Reddit video posts need a poster frame; re-upload the video so Siar can generate one.');
        form.video_poster_url = await uploadAsset(ctx, a, m.poster);
      }
    } else if (d.link) {
      form.kind = 'link';
      form.url = d.link;
      if (d.text) form.text = d.text;
    } else {
      form.kind = 'self';
      form.text = d.text ?? '';
    }

    const res = await api(ctx, a, '/api/submit', { method: 'POST', form });
    const data = res?.json?.data;
    if (data?.id) {
      return { status: 'POSTED', externalPostId: String(data.id), externalAlternatePostId: data.name ?? t3(data.id), permalink: data.url ?? permalinkOf(data), externalData: { subreddit: sr, kind: form.kind } };
    }
    if (m) {
      // Image/video posts are created asynchronously; find the post again in the user's submissions.
      return {
        status: 'PROCESSING', pollAfterMs: 5000, externalData: { subreddit: sr, kind: form.kind },
        pendingRef: JSON.stringify({ sr, title, since: Math.floor(ctx.now().getTime() / 1000) - 30, startedAt: ctx.now().getTime() }),
      };
    }
    throw new NetworkError('UNKNOWN', 'Reddit accepted the submission but returned no post id.', { meta: res });
  },

  async poll(ctx, input, ref) {
    let p: { sr: string; title: string; since: number; startedAt: number };
    try { p = JSON.parse(ref); } catch { throw new NetworkError('VALIDATION', 'Unreadable Reddit pending reference.'); }
    const res = await submitted(ctx, input.account, { limit: 25 });
    const hit = (res?.data?.children ?? []).map((c: any) => c.data).find((x: any) =>
      x && x.title === p.title && String(x.subreddit).toLowerCase() === p.sr.toLowerCase() && Number(x.created_utc) >= p.since);
    if (hit) return { status: 'POSTED', externalPostId: hit.id, externalAlternatePostId: hit.name ?? t3(hit.id), permalink: permalinkOf(hit), externalData: { subreddit: hit.subreddit, kind: hit.is_video ? 'video' : 'image' } } satisfies PublishResult;
    if (ctx.now().getTime() - p.startedAt > MEDIA_WAIT_MS) throw new NetworkError('MEDIA_INVALID', 'Reddit did not publish the image or video post within 15 minutes; it may have failed processing.');
    return { status: 'PROCESSING', pendingRef: ref, pollAfterMs: 10_000 };
  },

  async recentPosts(ctx, a, since) {
    const res = await submitted(ctx, a, { limit: 25 });
    return (res?.data?.children ?? []).map((c: any) => c.data).filter((x: any) => x && Number(x.created_utc) * 1000 >= since.getTime())
      .map((x: any) => ({ externalId: x.id, text: x.title ?? null, createdAt: new Date(Number(x.created_utc) * 1000), permalink: permalinkOf(x) }));
  },

  async deletePost(ctx, a, id) {
    await removeThing(ctx, a, t3(id));
  },

  async editPost(ctx, a, id, data) {
    const text = data.text ?? data.description;
    if (typeof text !== 'string') throw new NetworkError('VALIDATION', 'Editing a Reddit post needs the new text.');
    await editThing(ctx, a, t3(id), text);
  },

  async comment(ctx, input) {
    if (input.media.length) throw new NetworkError('NOT_SUPPORTED', 'The Reddit API does not accept media on comments.');
    const res = await api(ctx, input.account, '/api/comment', {
      method: 'POST', form: { api_type: 'json', thing_id: input.parentExternalId ? t1(input.parentExternalId) : t3(input.externalPostId), text: input.text },
    });
    const c = res?.json?.data?.things?.[0]?.data;
    if (!c?.id) throw new NetworkError('UNKNOWN', 'Reddit accepted the comment but returned no id.', { meta: res });
    return { externalId: String(c.id), permalink: permalinkOf(c) };
  },

  async editComment(ctx, a, id, text) {
    await editThing(ctx, a, t1(id), text);
  },

  async deleteComment(ctx, a, id) {
    await removeThing(ctx, a, t1(id));
  },

  async importComments(ctx, a, input) {
    const res = await api(ctx, a, `/comments/${bare(input.externalPostId)}`, { query: { limit: Math.min(500, input.limit), depth: 10, sort: 'old', showmore: false } });
    const tree = Array.isArray(res) ? res[1]?.data?.children ?? [] : [];
    return { items: flattenComments(tree, bare(input.externalPostId)).slice(0, input.limit), nextCursor: null };
  },

  async commentAction(ctx, a, comment, action) {
    if (action !== 'DELETE') throw new NetworkError('NOT_SUPPORTED', `Reddit does not support ${action} on comments through the API.`);
    await removeThing(ctx, a, t1(comment.externalId));
  },

  async accountAnalytics(ctx, a) {
    const u = await me(ctx, a);
    return {
      followers: Number(u.subreddit?.subscribers ?? 0),
      raw: { link_karma: u.link_karma ?? 0, comment_karma: u.comment_karma ?? 0, total_karma: u.total_karma ?? 0, awardee_karma: u.awardee_karma ?? 0, created_utc: u.created_utc ?? null },
    };
  },

  async postAnalytics(ctx, a, id) {
    const res = await api(ctx, a, '/api/info', { query: { id: t3(id) } });
    const d = res?.data?.children?.[0]?.data;
    if (!d) throw new NetworkError('NOT_FOUND', 'Reddit has no post with this id (deleted or removed).', { httpStatus: 404 });
    return toMetrics(d);
  },

  async importHistory(ctx, a, input) {
    const res = await submitted(ctx, a, { limit: Math.min(100, input.limit), after: input.cursor ?? undefined });
    return { items: (res?.data?.children ?? []).filter((c: any) => c.kind === 't3').map((c: any) => toHistory(c.data)), nextCursor: res?.data?.after ?? null };
  },

  misc: {
    'misc.reddit.getPostRequirements': async (ctx, a, { query }) => {
      const sr = normSr(String(query.subreddit ?? ''));
      if (!sr) throw new NetworkError('VALIDATION', 'subreddit is required.');
      const req = await api(ctx, a, `/api/v1/${encodeURIComponent(sr)}/post_requirements`);
      const list = await flairs(ctx, a, sr).catch(e => {
        // A subreddit without flair, or where the account may not read it, simply has none.
        if (e instanceof NetworkError && ['NOT_FOUND', 'PERMISSION'].includes(e.code)) return [];
        throw e;
      });
      return { isFlairRequired: !!(req?.is_flair_required ?? req?.flair_required), isFlairEnabled: list.length > 0 };
    },
    'misc.reddit.getSubredditFlairs': async (ctx, a, { query }) => {
      const list = await flairs(ctx, a, String(query.subreddit ?? ''));
      return list.map((f: any) => ({
        id: String(f.id), text: f.text ?? '', cssClass: f.css_class ?? '', textColor: f.text_color ?? '', backgroundColor: f.background_color ?? '',
        modOnly: !!f.mod_only, allowableContent: f.allowable_content ?? 'all', maxEmojis: Number(f.max_emojis ?? 10),
      }));
    },
    'misc.reddit.editPost': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await reddit.editPost!(ctx, a, p.externalPostId, { text: body.description ?? '' });
      return { success: true, permalink: p.permalink ?? '' };
    },
    'misc.reddit.deletePost': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await reddit.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
    'misc.reddit.editComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      const edited = await editThing(ctx, a, t1(c.externalId), body.text);
      return { success: true, permalink: permalinkOf(edited) };
    },
    'misc.reddit.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await reddit.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
  },
};
