/**
 * X (Twitter) — API v2, pay-per-use. Every write is billed to our developer account, so the
 * adapter is `metered`: the engine holds X credit before publish and captures/releases after.
 *
 * Docs: https://docs.x.com/x-api
 *   OAuth 2.0 PKCE   x.com/i/oauth2/authorize → api.x.com/2/oauth2/token (confidential client:
 *                    Basic auth). Refresh tokens ROTATE: every refresh returns a new one and the
 *                    old one dies, so the engine must persist the returned TokenSet atomically.
 *   Media upload v2  POST /2/media/upload (one-shot, images) · /2/media/upload/initialize →
 *                    /{id}/append → /{id}/finalize → GET /2/media/upload?command=STATUS (video, GIF)
 *                    · POST /2/media/metadata (alt text)
 *   Posts            POST /2/tweets · DELETE /2/tweets/:id · GET /2/tweets/:id
 *   Reposts / likes  POST|DELETE /2/users/:id/retweets · POST|DELETE /2/users/:id/likes
 *   Replies          GET /2/tweets/search/recent?query=conversation_id:… (last 7 days only)
 */
import { NetworkError } from '../lib/errors.js';
import { request, resetFrom, sleep, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, basicAuth, expiresIn } from '../lib/oauth.js';
import { checkMedia, GB, MB } from '../lib/validate.js';
import type { AccountProfile, AccountRuntime, FetchedCommentInput, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, PublishInput, PublishResult, TokenSet } from '../types.js';

const API = 'https://api.x.com/2';
const SCOPES = ['tweet.read', 'tweet.write', 'users.read', 'offline.access', 'media.write', 'like.read', 'like.write', 'tweet.moderate.write'];
const USER_FIELDS = 'id,name,username,profile_image_url,description,verified,verified_type,subscription_type,public_metrics,created_at';
const TWEET_FIELDS = 'id,text,created_at,author_id,conversation_id,in_reply_to_user_id,referenced_tweets,public_metrics,attachments';
/** Standard accounts: 280 weighted characters. X Premium: 25,000. */
const STANDARD_MAX = 280;
const PREMIUM_MAX = 25_000;
const CHUNK = 4 * MB;
const REPLY_SETTINGS: Record<string, string | undefined> = { EVERYONE: undefined, FOLLOWING: 'following', MENTIONED_USERS: 'mentionedUsers', SUBSCRIBERS: 'subscribers', VERIFIED: 'verified' };

// ───────────────────────────── text ─────────────────────────────

const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
const URL_RE = /https?:\/\/[^\s]+/g;

/**
 * X's weighted length (twitter-text v3): URLs count 23, Latin/General Punctuation ranges 1,
 * everything else (CJK, emoji) 2.
 */
export function xLength(text: string): number {
  let len = 0;
  const rest = text.replace(URL_RE, () => { len += 23; return ''; });
  for (const { segment } of segmenter.segment(rest)) {
    if (/\p{Extended_Pictographic}/u.test(segment)) { len += 2; continue; }
    const cp = segment.codePointAt(0) ?? 0;
    len += cp <= 4351 || (cp >= 8192 && cp <= 8205) || (cp >= 8208 && cp <= 8223) || (cp >= 8242 && cp <= 8247) ? 1 : 2;
  }
  return len;
}

/** Split long text into tweets of ≤280 weighted characters on word boundaries; optional " 1/3" numbering. */
export function splitStorm(text: string, numbering: boolean): string[] {
  const budget = STANDARD_MAX - (numbering ? 8 : 0);
  const parts: string[] = [];
  let cur = '';
  const push = () => { if (cur.trim()) parts.push(cur.trim()); cur = ''; };
  for (const tok of text.split(/(\s+)/)) {
    if (xLength(cur + tok) <= budget) { cur += tok; continue; }
    push();
    if (/^\s+$/.test(tok)) continue;
    if (xLength(tok) <= budget) { cur = tok; continue; }
    // A single word longer than a tweet: hard-split by grapheme.
    for (const { segment } of segmenter.segment(tok)) { if (xLength(cur + segment) > budget) push(); cur += segment; }
  }
  push();
  return numbering && parts.length > 1 ? parts.map((p, i) => `${p} ${i + 1}/${parts.length}`) : parts;
}

// ───────────────────────────── errors ─────────────────────────────

function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const detail: string = body?.errors?.[0]?.message ?? body?.detail ?? body?.title ?? body?.error_description ?? (typeof body?.error === 'string' ? body.error : undefined) ?? `X returned HTTP ${status}`;
  const opts = { httpStatus: status, meta: body };
  const type = String(body?.type ?? '');
  if (status === 401 || body?.error === 'invalid_grant' || body?.error === 'invalid_token') return new NetworkError('TOKEN_INVALID', detail, opts);
  if (status === 402 || body?.title === 'CreditsDepleted' || /\/problems\/credits/.test(type)) {
    return new NetworkError('PERMISSION', detail, { ...opts, userFacingMessage: 'X rejected the request because the X API credit balance is used up. Top up X credit and retry.' });
  }
  if (status === 429) return new NetworkError('RATE_LIMITED', detail, { ...opts, rateLimitResetAt: resetFrom(res) });
  if (/duplicate content/i.test(detail)) return new NetworkError('DUPLICATE', detail, opts);
  if (body?.reason === 'client-not-enrolled' || /client-forbidden/.test(type)) return new NetworkError('NOT_CONFIGURED', detail, { ...opts, userFacingMessage: 'The X app is not attached to a project with API access.' });
  if (/video longer|media.*(invalid|not found|expired)|InvalidMedia/i.test(detail)) return new NetworkError('MEDIA_INVALID', detail, opts);
  if (/too long/i.test(detail)) return new NetworkError('CONTENT_REJECTED', detail, { ...opts, userFacingMessage: `${detail} Accounts without X Premium are limited to 280 characters; set tweetStorm to split it into a thread.` });
  if (status === 404 || /resource-not-found/.test(type)) return new NetworkError('NOT_FOUND', detail, opts);
  if (status === 403) return new NetworkError('PERMISSION', detail, opts);
  if (status === 400) return new NetworkError('VALIDATION', detail, opts);
  return undefined;
}

const api = <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: RequestOptions = {}) =>
  request<T>(ctx, `${API}${path}`, { bearer: a.token.accessToken, mapError, ...opts });

const userId = (a: AccountRuntime) => {
  const id = a.providerPageId ?? a.externalId;
  if (!id) throw new NetworkError('VALIDATION', 'This X account has no user id; refresh the profile.');
  return id;
};

// ───────────────────────────── media ─────────────────────────────

const category = (m: MediaRef) => (m.type === 'video' ? 'tweet_video' : m.mime === 'image/gif' ? 'tweet_gif' : 'tweet_image');

/** Upload one media item. Returns the media id and, for video/GIF, whether X is still processing it. */
async function uploadMedia(ctx: NetworkContext, a: AccountRuntime, m: MediaRef): Promise<{ id: string; pending: boolean }> {
  let id: string;
  let info: any;
  if (category(m) === 'tweet_image') {
    const form = new FormData();
    form.set('media', new Blob([new Uint8Array(await m.read())], { type: m.mime }), `upload.${m.ext}`);
    form.set('media_category', 'tweet_image');
    const r = await api(ctx, a, '/media/upload', { method: 'POST', body: form, timeoutMs: 120_000 });
    id = r.data.id; info = r.data.processing_info;
  } else {
    const init = await api(ctx, a, '/media/upload/initialize', { method: 'POST', json: { media_type: m.mime, total_bytes: m.fileSize, media_category: category(m) } });
    id = init.data.id;
    for (let start = 0, seg = 0; start < m.fileSize; start += CHUNK, seg++) {
      const form = new FormData();
      form.set('segment_index', String(seg));
      form.set('media', new Blob([new Uint8Array(await m.readRange(start, Math.min(m.fileSize, start + CHUNK)))], { type: 'application/octet-stream' }), 'chunk');
      await api(ctx, a, `/media/upload/${id}/append`, { method: 'POST', body: form, timeoutMs: 300_000 });
    }
    const fin = await api(ctx, a, `/media/upload/${id}/finalize`, { method: 'POST' });
    info = fin.data?.processing_info;
  }
  if (m.altText) await api(ctx, a, '/media/metadata', { method: 'POST', json: { id, metadata: { alt_text: { text: m.altText.slice(0, 1000) } } } });
  if (info?.state === 'failed') throw new NetworkError('MEDIA_INVALID', info.error?.message ?? 'X could not process the media.', { meta: info });
  return { id, pending: !!info && info.state !== 'succeeded' };
}

/** One STATUS check per pending id. Returns ids still processing; throws when X failed one. */
async function stillProcessing(ctx: NetworkContext, a: AccountRuntime, ids: string[]): Promise<{ left: string[]; waitMs: number }> {
  const left: string[] = [];
  let waitMs = 1000;
  for (const id of ids) {
    const r = await api(ctx, a, '/media/upload', { query: { command: 'STATUS', media_id: id } });
    const info = r.data?.processing_info;
    if (!info || info.state === 'succeeded') continue;
    if (info.state === 'failed') throw new NetworkError('MEDIA_INVALID', info.error?.message ?? `X could not process media ${id}.`, { meta: info });
    left.push(id);
    waitMs = Math.max(waitMs, (info.check_after_secs ?? 1) * 1000);
  }
  return { left, waitMs };
}

// ───────────────────────────── publishing plan ─────────────────────────────

interface PlannedTweet { text: string; mediaIds: string[] }
interface Pending { tweets: PlannedTweet[]; pending: string[]; head: Record<string, unknown>; startedAt: number }

/** The head tweet's extras: they only apply to the first tweet of a thread. */
function headExtras(d: Record<string, any>) {
  return {
    quote_tweet_id: d.quoteTweetId || undefined,
    reply_settings: REPLY_SETTINGS[d.replySettings ?? 'EVERYONE'],
    for_super_followers_only: d.subscribersOnly ? true : undefined,
    poll: d.poll?.options?.length ? { options: d.poll.options, duration_minutes: d.poll.durationMinutes } : undefined,
    reply: d.replyToTweetId ? { in_reply_to_tweet_id: String(d.replyToTweetId) } : undefined,
  };
}

async function resolvePlan(input: PublishInput): Promise<{ text: string; media: MediaRef[] }[]> {
  const d = input.data;
  const alt = new Map<string, string>((d.mediaItems ?? []).filter((x: any) => x?.altText).map((x: any) => [x.uploadId, x.altText]));
  const withAlt = (m: MediaRef) => (alt.has(m.id) ? { ...m, altText: alt.get(m.id)! } : m);
  const plan: { text: string; media: MediaRef[] }[] = [];
  const text: string = d.text ?? '';
  const headMedia = input.media.map(withAlt);
  if (text.trim() || headMedia.length || d.poll || d.quoteTweetId) {
    const parts = d.tweetStorm && xLength(text) > STANDARD_MAX ? splitStorm(text, !!d.tweetStormNumbering) : [text];
    parts.forEach((p, i) => plan.push({ text: p, media: i === 0 ? headMedia : [] }));
  }
  for (const t of d.thread ?? []) {
    const media = await Promise.all((t.uploadIds ?? []).map((id: string) => input.resolveUpload(id).then(withAlt)));
    plan.push({ text: t.text ?? '', media });
  }
  return plan;
}

/** Post the planned tweets as a reply chain. A failure after the head is reported, not thrown (never post twice). */
async function postChain(ctx: NetworkContext, input: PublishInput, tweets: PlannedTweet[], head: Record<string, any>): Promise<PublishResult> {
  const a = input.account;
  const ai = input.data.isAiGenerated ? true : undefined;
  const ids: string[] = [];
  for (let i = 0; i < tweets.length; i++) {
    const t = tweets[i];
    const body: Record<string, unknown> = {
      text: t.text,
      media: t.mediaIds.length ? { media_ids: t.mediaIds } : undefined,
      made_with_ai: t.mediaIds.length ? ai : undefined,
      ...(i === 0 ? head : { reply: { in_reply_to_tweet_id: ids[i - 1] }, reply_settings: head.reply_settings }),
    };
    try {
      const r = await api(ctx, a, '/tweets', { method: 'POST', json: body });
      ids.push(r.data.id);
    } catch (e) {
      if (i === 0) throw e;
      ctx.log.warn({ postId: input.postId, posted: ids, err: (e as Error).message }, 'x thread stopped part-way');
      return posted(a, ids, { threadError: (e as Error).message, threadPosted: ids.length, threadPlanned: tweets.length });
    }
  }
  return posted(a, ids);
}

const permalink = (a: AccountRuntime, id: string) => `https://x.com/${a.username ?? 'i'}/status/${id}`;
const posted = (a: AccountRuntime, ids: string[], extra: Record<string, unknown> = {}): PublishResult => ({
  status: 'POSTED', externalPostId: ids[0], permalink: permalink(a, ids[0]), externalData: { id: ids[0], threadIds: ids, ...extra },
});

/** Standard accounts can't post >280 weighted chars; reject before spending credit. */
function checkLength(a: AccountRuntime, tweets: PlannedTweet[]) {
  const sub = String(a.token.secrets?.subscriptionType ?? 'none');
  const max = sub === 'none' ? STANDARD_MAX : PREMIUM_MAX;
  const long = tweets.find(t => xLength(t.text) > max);
  if (long) throw new NetworkError('VALIDATION', `Post is ${xLength(long.text)} characters; this X account can post ${max}.`, {
    userFacingMessage: `This X account can post up to ${max} characters (X Premium allows ${PREMIUM_MAX}). Set tweetStorm to split long text into a thread.`,
  });
}

// ───────────────────────────── mapping ─────────────────────────────

const subType = (u: any): AccountProfile['twitterSubType'] => {
  const s = String(u.subscription_type ?? '').toLowerCase();
  if (s === 'premiumplus') return 'premium_plus';
  if (s === 'premium') return 'premium';
  if (s === 'basic') return 'basic';
  return u.verified_type === 'blue' ? 'premium' : 'none';
};

const profileOf = (u: any): AccountProfile => ({
  externalId: u.id, providerPageId: u.id, username: u.username, displayName: u.name, avatarUrl: u.profile_image_url ?? null, bio: u.description ?? null,
  userId: u.id, userUsername: u.username, userDisplayName: u.name, twitterSubType: subType(u),
});

const metrics = (t: any): PostMetrics => {
  const p = t.public_metrics ?? {};
  const np = t.non_public_metrics ?? {};
  const org = t.organic_metrics ?? {};
  return {
    impressions: org.impression_count ?? np.impression_count ?? p.impression_count ?? 0,
    likes: p.like_count ?? 0, comments: p.reply_count ?? 0, shares: (p.retweet_count ?? 0) + (p.quote_count ?? 0), saves: p.bookmark_count ?? 0,
    raw: { public_metrics: t.public_metrics, non_public_metrics: t.non_public_metrics, organic_metrics: t.organic_metrics },
  };
};

const toComment = (t: any, users: Map<string, any>, rootId: string): FetchedCommentInput => {
  const parent = t.referenced_tweets?.find((r: any) => r.type === 'replied_to')?.id ?? null;
  const u = users.get(t.author_id);
  return {
    externalId: t.id, externalParentId: parent && parent !== rootId ? parent : null, externalPostId: rootId,
    authorName: u?.name ?? null, authorExternalId: t.author_id, authorProfileUrl: u ? `https://x.com/${u.username}` : null, authorAvatarUrl: u?.profile_image_url ?? null,
    text: t.text, likesCount: t.public_metrics?.like_count ?? 0, repliesCount: t.public_metrics?.reply_count ?? 0,
    publishedAt: t.created_at ? new Date(t.created_at) : null, platformData: { conversationId: t.conversation_id, username: u?.username },
  };
};

async function tokenRequest(ctx: NetworkContext, form: Record<string, string>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, `${API}/oauth2/token`, {
    form: { ...form, client_id: ctx.credentials.clientId },
    headers: { authorization: basicAuth(ctx.credentials.clientId ?? '', ctx.credentials.clientSecret ?? '') },
    // A dead/rotated refresh token or a bad code comes back as 400 invalid_request: the grant is gone.
    mapError: (status, body, res) => (status === 400 || status === 401) && /invalid_(request|grant)/.test(String(body?.error))
      ? new NetworkError('TOKEN_INVALID', body.error_description ?? body.error, { httpStatus: status, meta: body })
      : mapError(status, body, res),
  });
  return {
    accessToken: tok.access_token, refreshToken: tok.refresh_token ?? null, expiresAt: expiresIn(tok.expires_in, ctx.now()),
    scopes: String(tok.scope ?? SCOPES.join(' ')).split(/\s+/), secrets: { ...(prev?.secrets ?? {}) },
  };
}

const me = (ctx: NetworkContext, a: AccountRuntime) => api(ctx, a, '/users/me', { query: { 'user.fields': USER_FIELDS } }).then(r => r.data);

// ───────────────────────────── adapter ─────────────────────────────

export const twitter: NetworkAdapter = {
  type: 'TWITTER',
  displayName: 'X',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'none', postTypes: ['POST', 'THREAD'],
    comments: true, firstComment: true, editPost: false, deletePost: true, editComment: false, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'LIKE', 'UNLIKE', 'HIDE', 'UNHIDE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: true,
  },
  limits: {
    textMax: STANDARD_MAX,
    commentMax: STANDARD_MAX,
    media: {
      maxItems: 4,
      image: { mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'], maxBytes: 15 * MB },
      video: { mimes: ['video/mp4', 'video/quicktime'], maxBytes: 8 * GB, minSeconds: 0.5, maxSeconds: 1200 },
    },
  },
  errorReference: [
    { code: '401', message: 'Unauthorized', meaning: 'The access token expired or the user revoked the app.', fix: 'Siar refreshes automatically; if it still fails, reconnect the X account.' },
    { code: '402 CreditsDepleted', message: 'Your enrolled account does not have any credits to fulfill this request.', meaning: 'The X API pay-per-use balance behind the app is empty.', fix: 'Top up X credit, then retry the post.' },
    { code: '403 duplicate', message: 'You are not allowed to create a Tweet with duplicate content.', meaning: 'The same text was posted by this account recently.', fix: 'Change the text; X blocks identical consecutive posts.' },
    { code: '403 reply', message: 'Reply to this Tweet is not allowed because you have not been mentioned or otherwise engaged by the author of the Tweet you are replying to.', meaning: 'API replies are only allowed to conversations that mention or quote the account.', fix: 'Only reply to posts that mention the connected account, or to its own posts.' },
    { code: '403 video', message: 'This user is not allowed to post a video longer than 20 minutes.', meaning: 'Video length exceeds the account tier (20 min standard, 125 min Premium).', fix: 'Trim the video or post from a Premium account.' },
    { code: '403 too long', message: 'Your Tweet text is too long.', meaning: 'Text exceeds 280 weighted characters on a non-Premium account (URLs count 23, emoji and CJK count 2).', fix: 'Shorten it, or set tweetStorm: true to split into a numbered thread.' },
    { code: '403 client-not-enrolled', message: 'Client Forbidden', meaning: 'The X app is not attached to a project with API access.', fix: 'Attach the app to a project in the X developer console.' },
    { code: '403 quote', message: 'Quoting is not available on this access tier.', meaning: 'quote_tweet_id needs a higher X API access level.', fix: 'Post a link to the post instead of quoting it.' },
    { code: '400 invalid-request', message: 'One or more parameters to your request was invalid.', meaning: 'A field failed X validation (poll options, media ids, reply id).', fix: 'Read errors[].message in the error meta and correct that field.' },
    { code: '400 media', message: 'Your media IDs are invalid.', meaning: 'A media id expired (24 h) or failed processing.', fix: 'Re-upload the media; Siar retries the upload on the next attempt.' },
    { code: '404', message: 'Could not find tweet with id.', meaning: 'The post was deleted or is from a protected account.', fix: 'Check the post still exists.' },
    { code: '429', message: 'Too Many Requests', meaning: 'Per-user or per-app rate limit window exhausted.', fix: 'Siar retries after x-rate-limit-reset; spread scheduled posts out.' },
    { code: '503', message: 'Service Unavailable', meaning: 'X is overloaded.', fix: 'Transient; Siar retries automatically.' },
  ],

  async authorize(ctx, input) {
    const url = authorizeUrl('https://x.com/i/oauth2/authorize', {
      response_type: 'code', client_id: ctx.credentials.clientId, redirect_uri: ctx.redirectUri, scope: SCOPES.join(' '), state: input.state,
      code_challenge: input.codeChallenge, code_challenge_method: 'S256',
    });
    return { url };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri, code_verifier: input.codeVerifier });
    const u = (await request(ctx, `${API}/users/me`, { bearer: token.accessToken, query: { 'user.fields': USER_FIELDS }, mapError })).data;
    const profile = profileOf(u);
    token.secrets = { ...token.secrets, subscriptionType: profile.twitterSubType };
    return { token, profile };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No X refresh token; reconnect the account.');
    // Rotation: the returned refresh token replaces the old one, which is now dead.
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
    await request(ctx, `${API}/oauth2/revoke`, {
      form: { token: a.token.refreshToken ?? a.token.accessToken, token_type_hint: a.token.refreshToken ? 'refresh_token' : 'access_token', client_id: ctx.credentials.clientId },
      headers: { authorization: basicAuth(ctx.credentials.clientId ?? '', ctx.credentials.clientSecret ?? '') },
    }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const text: string = data.text ?? '';
    const thread: any[] = Array.isArray(data.thread) ? data.thread : [];
    if (!text.trim() && !media.length && !thread.length && !data.poll && !data.quoteTweetId) issues.push({ code: 'required', message: 'A post needs text, media, a poll or a thread.', path: ['text'] });
    if (xLength(text) > PREMIUM_MAX) issues.push({ code: 'too_long', message: `Text is ${xLength(text)} weighted characters; X allows ${PREMIUM_MAX} (Premium) or ${STANDARD_MAX}.`, path: ['text'] });
    checkMedia(issues, media, twitter.limits);
    for (const [i, m] of media.entries()) if (m.type === 'image' && m.mime !== 'image/gif' && m.fileSize > 5 * MB) issues.push({ code: 'too_large', message: 'Images are limited to 5 MB (GIFs 15 MB).', path: ['uploadIds', i] });
    const videos = media.filter(m => m.type === 'video' || m.mime === 'image/gif').length;
    if (videos && media.length > 1) issues.push({ code: 'mixed', message: 'X allows up to 4 images, or exactly 1 video or GIF.', path: ['uploadIds'] });
    for (const [i, it] of (data.mediaItems ?? []).entries()) if (it?.altText && String(it.altText).length > 1000) issues.push({ code: 'too_long', message: 'Alt text is limited to 1000 characters.', path: ['mediaItems', i, 'altText'] });
    if (data.poll) {
      const opts: unknown[] = data.poll.options ?? [];
      if (opts.length < 2 || opts.length > 4) issues.push({ code: 'poll_options', message: 'A poll needs 2 to 4 options.', path: ['poll', 'options'] });
      opts.forEach((o, i) => { if (typeof o !== 'string' || !o.trim() || o.length > 25) issues.push({ code: 'poll_option', message: 'Each poll option is 1 to 25 characters.', path: ['poll', 'options', i] }); });
      const dm = Number(data.poll.durationMinutes);
      if (!Number.isInteger(dm) || dm < 5 || dm > 10080) issues.push({ code: 'poll_duration', message: 'Poll duration is 5 to 10080 minutes (7 days).', path: ['poll', 'durationMinutes'] });
      if (media.length) issues.push({ code: 'poll_media', message: 'A post cannot have both a poll and media.', path: ['poll'] });
      if (!text.trim()) issues.push({ code: 'required', message: 'A poll needs text.', path: ['text'] });
    }
    for (const k of ['quoteTweetId', 'replyToTweetId'] as const) if (data[k] && !/^\d{1,19}$/.test(String(data[k]))) issues.push({ code: 'invalid_id', message: `${k} must be a numeric post id.`, path: [k] });
    if (data.replySettings && !(data.replySettings in REPLY_SETTINGS)) issues.push({ code: 'invalid', message: 'Unknown replySettings value.', path: ['replySettings'] });
    thread.forEach((t, i) => {
      if (!String(t?.text ?? '').trim() && !(t?.uploadIds ?? []).length) issues.push({ code: 'required', message: 'Each thread item needs text or media.', path: ['thread', i] });
      if (xLength(String(t?.text ?? '')) > PREMIUM_MAX) issues.push({ code: 'too_long', message: `Thread item is over ${PREMIUM_MAX} weighted characters.`, path: ['thread', i, 'text'] });
      if ((t?.uploadIds ?? []).length > 4) issues.push({ code: 'too_many', message: 'At most 4 media items per post.', path: ['thread', i, 'uploadIds'] });
    });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const plan = await resolvePlan(input);
    if (!plan.length) throw new NetworkError('VALIDATION', 'Nothing to post: text, media or thread is required.');
    const tweets: PlannedTweet[] = plan.map(p => ({ text: p.text, mediaIds: [] }));
    checkLength(a, tweets);
    const pending: string[] = [];
    for (const [i, p] of plan.entries()) for (const m of p.media) {
      const r = await uploadMedia(ctx, a, m);
      tweets[i].mediaIds.push(r.id);
      if (r.pending) pending.push(r.id);
    }
    const state: Pending = { tweets, pending, head: headExtras(input.data), startedAt: ctx.now().getTime() };
    // Wait a short while for video processing here; longer jobs continue in poll().
    const deadline = Date.now() + (ctx.mode === 'mock' ? 300 : 45_000);
    while (state.pending.length && Date.now() < deadline) {
      const { left, waitMs } = await stillProcessing(ctx, a, state.pending);
      state.pending = left;
      if (left.length) await sleep(ctx.mode === 'mock' ? 10 : Math.min(waitMs, 10_000));
    }
    if (state.pending.length) return { status: 'PROCESSING', pendingRef: JSON.stringify(state), pollAfterMs: 15_000, externalData: { mediaIds: tweets.flatMap(t => t.mediaIds) } };
    return postChain(ctx, input, tweets, state.head);
  },

  async poll(ctx, input, pendingRef) {
    const state = JSON.parse(pendingRef) as Pending;
    const { left } = await stillProcessing(ctx, input.account, state.pending);
    if (left.length) {
      // Uploaded media expire after 24 h; give up well before that.
      if (ctx.now().getTime() - state.startedAt > 2 * 3600_000) throw new NetworkError('MEDIA_INVALID', 'X did not finish processing the video within 2 hours.');
      return { status: 'PROCESSING', pendingRef: JSON.stringify({ ...state, pending: left }), pollAfterMs: 30_000 };
    }
    return postChain(ctx, input, state.tweets, state.head);
  },

  async recentPosts(ctx, a, since) {
    const r = await api(ctx, a, `/users/${userId(a)}/tweets`, { query: { max_results: 20, start_time: since.toISOString(), 'tweet.fields': 'created_at,text' } });
    return (r.data ?? []).map((t: any) => ({ externalId: t.id, text: t.text, createdAt: t.created_at ? new Date(t.created_at) : null, permalink: permalink(a, t.id) }));
  },

  async deletePost(ctx, a, id) {
    await api(ctx, a, `/tweets/${id}`, { method: 'DELETE' });
  },

  async comment(ctx, input) {
    const a = input.account;
    const mediaIds: string[] = [];
    for (const m of input.media) {
      const r = await uploadMedia(ctx, a, m);
      if (r.pending) {
        let left = [r.id];
        for (let i = 0; i < 30 && left.length; i++) { await sleep(ctx.mode === 'mock' ? 10 : 2000); left = (await stillProcessing(ctx, a, left)).left; }
        if (left.length) throw new NetworkError('MEDIA_INVALID', 'X is still processing the reply video; retry shortly.', { retryability: 'retryable' });
      }
      mediaIds.push(r.id);
    }
    const r = await api(ctx, a, '/tweets', {
      method: 'POST',
      json: { text: input.text, reply: { in_reply_to_tweet_id: input.parentExternalId ?? input.externalPostId }, media: mediaIds.length ? { media_ids: mediaIds } : undefined },
    });
    return { externalId: r.data.id, permalink: permalink(a, r.data.id) };
  },

  async deleteComment(ctx, a, id) {
    await api(ctx, a, `/tweets/${id}`, { method: 'DELETE' });
  },

  async importComments(ctx, a, input) {
    // Recent search only covers the last 7 days; older replies are not reachable on self-serve tiers.
    const r = await api(ctx, a, '/tweets/search/recent', {
      query: {
        query: `conversation_id:${input.externalPostId}`, max_results: Math.max(10, Math.min(100, input.limit)), next_token: input.cursor ?? undefined,
        'tweet.fields': TWEET_FIELDS, expansions: 'author_id', 'user.fields': 'username,name,profile_image_url',
      },
    });
    const users = new Map<string, any>((r.includes?.users ?? []).map((u: any) => [u.id, u]));
    return { items: (r.data ?? []).slice(0, input.limit).map((t: any) => toComment(t, users, input.externalPostId)), nextCursor: r.meta?.next_token ?? null };
  },

  async commentAction(ctx, a, comment, action) {
    const id = comment.externalId;
    if (action === 'DELETE') return void (await api(ctx, a, `/tweets/${id}`, { method: 'DELETE' }));
    if (action === 'LIKE') return void (await api(ctx, a, `/users/${userId(a)}/likes`, { method: 'POST', json: { tweet_id: id } }));
    if (action === 'UNLIKE') return void (await api(ctx, a, `/users/${userId(a)}/likes/${id}`, { method: 'DELETE' }));
    if (action === 'HIDE' || action === 'UNHIDE') return void (await api(ctx, a, `/tweets/${id}/hidden`, { method: 'PUT', json: { hidden: action === 'HIDE' } }));
    throw new NetworkError('NOT_SUPPORTED', `X does not support ${action} on replies.`);
  },

  async accountAnalytics(ctx, a) {
    const u = await me(ctx, a);
    const m = u.public_metrics ?? {};
    return { followers: m.followers_count ?? 0, following: m.following_count ?? 0, postCount: m.tweet_count ?? 0, likes: m.like_count ?? 0, raw: m };
  },

  async postAnalytics(ctx, a, id) {
    // Non-public and organic metrics exist only for the owner's posts from the last 30 days.
    let r: any;
    try {
      r = await api(ctx, a, `/tweets/${id}`, { query: { 'tweet.fields': 'public_metrics,non_public_metrics,organic_metrics,created_at' } });
      if (!r?.data) throw new NetworkError('PERMISSION', 'private metrics unavailable');
    } catch (e) {
      if (!(e instanceof NetworkError) || !['PERMISSION', 'VALIDATION'].includes(e.code)) throw e;
      r = await api(ctx, a, `/tweets/${id}`, { query: { 'tweet.fields': 'public_metrics,created_at' } });
    }
    if (!r?.data) throw new NetworkError('NOT_FOUND', r?.errors?.[0]?.detail ?? `X post ${id} was not found.`, { meta: r?.errors });
    return metrics(r.data);
  },

  async importHistory(ctx, a, input) {
    const r = await api(ctx, a, `/users/${userId(a)}/tweets`, {
      query: { max_results: Math.max(5, Math.min(100, input.limit)), pagination_token: input.cursor ?? undefined, exclude: 'replies,retweets', 'tweet.fields': TWEET_FIELDS, expansions: 'attachments.media_keys', 'media.fields': 'type,url,preview_image_url' },
    });
    const media = new Map<string, any>((r.includes?.media ?? []).map((m: any) => [m.media_key, m]));
    const items: HistoryPost[] = (r.data ?? []).map((t: any) => {
      const m = media.get(t.attachments?.media_keys?.[0]);
      return {
        externalId: t.id, title: String(t.text ?? '').slice(0, 200), permalink: permalink(a, t.id), publishedAt: t.created_at ? new Date(t.created_at) : null,
        type: m?.type === 'video' || m?.type === 'animated_gif' ? 'VIDEO' : m ? 'IMAGE' : 'POST', thumbnail: m?.url ?? m?.preview_image_url ?? null, smallThumbnail: m?.preview_image_url ?? m?.url ?? null,
        metrics: metrics(t),
      };
    });
    return { items, nextCursor: r.meta?.next_token ?? null };
  },

  misc: {
    'misc.twitter.deleteTweet': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await twitter.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
    'misc.twitter.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await twitter.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
    'misc.twitter.retweet': async (ctx, a, { body }) => {
      await api(ctx, a, `/users/${userId(a)}/retweets`, { method: 'POST', json: { tweet_id: String(body.tweetId) } });
      return { success: true };
    },
    'misc.twitter.unretweet': async (ctx, a, { body }) => {
      await api(ctx, a, `/users/${userId(a)}/retweets/${encodeURIComponent(String(body.tweetId))}`, { method: 'DELETE' });
      return { success: true };
    },
  },
};
