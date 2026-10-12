/**
 * TikTok — two APIs behind one adapter:
 *   - Content Posting API v2 + Login Kit (open.tiktokapis.com) for every creator account:
 *     direct post (video FILE_UPLOAD / PULL_FROM_URL, photo PULL_FROM_URL), upload to the creator's
 *     inbox (drafts), publish status, user info and the video list/query used for analytics.
 *   - TikTok API for Business v1.3 (business-api.tiktok.com) when the account is connected with
 *     `withBusinessScope`: the same posting plus comments and the Commercial Music Library, which
 *     only the Business API exposes. A business token cannot call open.tiktokapis.com, so the
 *     account's `secrets.tiktokApi` decides which API every call goes to.
 *
 * Docs: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
 *       https://developers.tiktok.com/doc/content-posting-api-reference-upload-video
 *       https://developers.tiktok.com/doc/content-posting-api-reference-photo-post
 *       https://developers.tiktok.com/doc/oauth-user-access-token-management
 *       https://business-api.tiktok.com/portal/docs (Accounts API: business/*, tt_user/oauth2/*)
 *
 * Unaudited Content Posting apps can only post SELF_ONLY; TikTok's own error is surfaced verbatim.
 */
import { NetworkError, type ErrorCode } from '../lib/errors.js';
import { httpError, request, resetFrom, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type { AccountRuntime, FetchedCommentInput, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, PublishInput, PublishResult, TokenSet } from '../types.js';

const OPEN = 'https://open.tiktokapis.com';
const BIZ = 'https://business-api.tiktok.com/open_api/v1.3';
const SCOPES = ['user.info.basic', 'user.info.profile', 'user.info.stats', 'video.list', 'video.publish', 'video.upload'];
/** TikTok API for Business "TikTok account" scopes (a separate app in the Business developer portal). */
const BUSINESS_SCOPES = ['user.info.basic', 'user.info.username', 'user.info.stats', 'user.info.profile', 'user.account.type', 'user.insights', 'video.list', 'video.insights', 'video.publish', 'comment.list', 'comment.list.manage'];
const USER_FIELDS = 'open_id,union_id,avatar_url,display_name,username,bio_description,profile_deep_link,is_verified,follower_count,following_count,likes_count,video_count';
const VIDEO_FIELDS = 'id,title,video_description,create_time,cover_image_url,share_url,embed_link,duration,height,width,like_count,comment_count,share_count,view_count';
const BIZ_PROFILE_FIELDS = ['username', 'display_name', 'profile_image', 'bio_description', 'is_verified', 'followers_count', 'following_count', 'likes_count', 'videos_count'];
const BIZ_VIDEO_FIELDS = ['item_id', 'create_time', 'thumbnail_url', 'share_url', 'embed_url', 'caption', 'video_duration', 'video_views', 'likes', 'comments', 'shares', 'reach'];
const PRIVACY = ['SELF_ONLY', 'PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR'];
/** FILE_UPLOAD chunking: chunks 5–64 MB, the last may hold the remainder (≤128 MB); under 10 MB goes whole. */
const CHUNK = 10 * MB;
const POLL_MS = 10_000;

// ───────────────────────────── errors ─────────────────────────────

/** Content Posting API `error.code`, OAuth `error` and publish `fail_reason` values. */
const CODES: Record<string, ErrorCode> = {
  access_token_invalid: 'TOKEN_INVALID', invalid_grant: 'TOKEN_INVALID', auth_removed: 'TOKEN_INVALID',
  scope_not_authorized: 'PERMISSION', scope_permission_missed: 'PERMISSION', unaudited_client_can_only_post_to_private_accounts: 'PERMISSION',
  url_ownership_unverified: 'PERMISSION', reached_active_user_cap: 'PERMISSION', invalid_client: 'NOT_CONFIGURED', unauthorized_client: 'NOT_CONFIGURED',
  rate_limit_exceeded: 'RATE_LIMITED', spam_risk_too_many_posts: 'RATE_LIMITED', spam_risk_too_many_pending_share: 'RATE_LIMITED',
  spam_risk_user_banned_from_posting: 'CONTENT_REJECTED', spam_risk_text: 'CONTENT_REJECTED', spam_risk: 'CONTENT_REJECTED', publish_cancelled: 'CONTENT_REJECTED',
  privacy_level_option_mismatch: 'VALIDATION', invalid_param: 'VALIDATION', invalid_params: 'VALIDATION', invalid_request: 'VALIDATION', invalid_publish_id: 'NOT_FOUND',
  file_format_check_failed: 'MEDIA_INVALID', duration_check_failed: 'MEDIA_INVALID', frame_rate_check_failed: 'MEDIA_INVALID', picture_size_check_failed: 'MEDIA_INVALID',
  video_pull_failed: 'MEDIA_INVALID', photo_pull_failed: 'MEDIA_INVALID', invalid_file_upload: 'MEDIA_INVALID',
  internal_error: 'NETWORK_UNAVAILABLE', internal: 'NETWORK_UNAVAILABLE',
};

/** Business API answers HTTP 200 with a numeric `code` (0 = OK). */
const BIZ_CODES: Record<number, ErrorCode> = {
  40001: 'PERMISSION', 40002: 'VALIDATION', 40100: 'RATE_LIMITED', 40104: 'TOKEN_INVALID', 40105: 'TOKEN_INVALID', 50000: 'NETWORK_UNAVAILABLE',
};

function mapError(status: number, body: any, res?: Response): NetworkError | undefined {
  const code: string | undefined = typeof body?.error === 'string' ? body.error : body?.error?.code;
  if (!code || code === 'ok') return undefined;
  const c = CODES[code] ?? (status === 401 ? 'TOKEN_INVALID' : undefined);
  if (!c) return undefined;
  const msg = body?.error_description || body?.error?.message || code;
  return new NetworkError(c, msg, { httpStatus: status, meta: body, rateLimitResetAt: c === 'RATE_LIMITED' && res ? resetFrom(res) : null });
}

const bizError = (body: any) =>
  new NetworkError(BIZ_CODES[body?.code] ?? 'UNKNOWN', body?.message ?? 'TikTok API for Business rejected the request.', { meta: body });

// ───────────────────────────── helpers ─────────────────────────────

const need = (ctx: NetworkContext, key: string) => {
  const v = ctx.credentials[key];
  if (!v) throw new NetworkError('NOT_CONFIGURED', `TikTok is not configured (NETWORK_TIKTOK_${key.replace(/[A-Z]/g, c => '_' + c).toUpperCase()}).`);
  return v;
};
const isBiz = (a: AccountRuntime) => a.token.secrets?.tiktokApi === 'business';
const businessId = (a: AccountRuntime) => String(a.token.secrets?.businessId ?? a.providerPageId ?? a.externalId);

/** Content Posting API call. A 2xx body can still carry error.code ≠ ok. */
async function open<T = any>(ctx: NetworkContext, accessToken: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await request(ctx, `${OPEN}${path}`, { bearer: accessToken, mapError, ...opts });
  if (res?.error && res.error.code && res.error.code !== 'ok') throw mapError(200, res) ?? new NetworkError('UNKNOWN', res.error.message || res.error.code, { meta: res });
  return res?.data as T;
}

/**
 * Publish status. publicaly_available_post_id holds int64 ids (above 2^53) as bare JSON numbers,
 * which JSON.parse silently rounds — so they are read from the raw text.
 */
async function fetchStatus(ctx: NetworkContext, accessToken: string, publishId: string) {
  let res: Response;
  try {
    res = await ctx.fetch(`${OPEN}/v2/post/publish/status/fetch/`, {
      method: 'POST', body: JSON.stringify({ publish_id: publishId }),
      headers: { accept: 'application/json', 'content-type': 'application/json', authorization: `Bearer ${accessToken}` },
    });
  } catch (err) {
    throw new NetworkError('NETWORK_UNAVAILABLE', `Could not reach open.tiktokapis.com: ${(err as Error).message}`);
  }
  const text = await res.text();
  let body: any = text;
  try { body = JSON.parse(text); } catch { /* not JSON */ }
  if (!res.ok || (body?.error?.code && body.error.code !== 'ok')) throw mapError(res.status, body, res) ?? httpError(res, body);
  const ids = /"publicaly_available_post_id"\s*:\s*\[([^\]]*)\]/.exec(text);
  if (ids) body.data.publicaly_available_post_id = ids[1].split(',').map(x => x.trim().replace(/"/g, '')).filter(Boolean);
  return body.data;
}

async function biz<T = any>(ctx: NetworkContext, accessToken: string, path: string, opts: RequestOptions = {}): Promise<T> {
  const res = await request(ctx, `${BIZ}${path}`, { ...opts, headers: { 'Access-Token': accessToken, ...(opts.headers ?? {}) } });
  if (res?.code !== 0) throw bizError(res);
  return res.data as T;
}

const tokenOf = (t: any, now: Date, api: 'content' | 'business', extra: Record<string, unknown> = {}): TokenSet => ({
  accessToken: t.access_token,
  refreshToken: t.refresh_token ?? null,
  expiresAt: expiresIn(t.expires_in, now),
  refreshTokenExpiresAt: expiresIn(t.refresh_expires_in ?? t.refresh_token_expires_in, now),
  scopes: String(t.scope ?? '').split(',').filter(Boolean),
  secrets: { tiktokApi: api, ...extra },
});

const profileOf = (u: any) => ({
  externalId: u.open_id, providerPageId: u.open_id, username: u.username || u.display_name, displayName: u.display_name, avatarUrl: u.avatar_url ?? null,
  bio: u.bio_description ?? null, userId: u.open_id, userUsername: u.username ?? null, userDisplayName: u.display_name, isTiktokBusinessAccount: false,
});
const bizProfileOf = (openId: string, b: any) => ({
  externalId: openId, providerPageId: openId, username: b.username, displayName: b.display_name || b.username, avatarUrl: b.profile_image ?? null,
  bio: b.bio_description ?? null, userId: openId, userUsername: b.username, userDisplayName: b.display_name, isTiktokBusinessAccount: true,
});

const userInfo = (ctx: NetworkContext, token: string) => open<{ user: any }>(ctx, token, '/v2/user/info/', { query: { fields: USER_FIELDS } }).then(d => d.user);
const bizInfo = (ctx: NetworkContext, token: string, openId: string) => biz(ctx, token, '/business/get/', { query: { business_id: openId, fields: JSON.stringify(BIZ_PROFILE_FIELDS) } });

const metrics = (v: any): PostMetrics => ({
  views: v.view_count ?? v.video_views ?? 0, likes: v.like_count ?? v.likes ?? 0, comments: v.comment_count ?? v.comments ?? 0, shares: v.share_count ?? v.shares ?? 0,
  ...(v.reach != null ? { impressionsUnique: v.reach } : {}),
  raw: v,
});

const toHistory = (v: any): HistoryPost => ({
  externalId: String(v.id ?? v.item_id),
  title: (v.title || v.video_description || v.caption || '').slice(0, 200),
  thumbnail: v.cover_image_url ?? v.thumbnail_url ?? null,
  smallThumbnail: v.cover_image_url ?? v.thumbnail_url ?? null,
  permalink: v.share_url ?? null,
  publishedAt: v.create_time ? new Date(Number(v.create_time) * 1000) : null,
  type: 'VIDEO',
  extraData: { duration: v.duration ?? v.video_duration ?? null, embed: v.embed_link ?? v.embed_url ?? null },
  metrics: metrics(v),
});

/** The single chunk plan TikTok accepts for a given size. */
export function chunkPlan(size: number) {
  const chunkSize = size <= CHUNK ? size : CHUNK;
  return { chunkSize, count: Math.max(1, Math.floor(size / chunkSize)) };
}

async function uploadChunks(ctx: NetworkContext, uploadUrl: string, m: MediaRef) {
  const { chunkSize, count } = chunkPlan(m.fileSize);
  for (let i = 0; i < count; i++) {
    const start = i * chunkSize;
    const end = i === count - 1 ? m.fileSize : start + chunkSize;
    const bytes = await m.readRange(start, end);
    const res = await ctx.fetch(uploadUrl, {
      method: 'PUT', body: new Uint8Array(bytes), timeoutMs: 600_000,
      headers: { 'Content-Type': m.mime, 'Content-Range': `bytes ${start}-${end - 1}/${m.fileSize}` },
    });
    if (!res.ok) {
      const text = await res.text();
      let body: any = text; try { body = JSON.parse(text); } catch { /* text */ }
      throw mapError(res.status, body, res) ?? new NetworkError('MEDIA_INVALID', `TikTok rejected upload chunk ${i + 1}/${count} (HTTP ${res.status}).`, { httpStatus: res.status, meta: body });
    }
  }
}

const sourceFor = (ctx: NetworkContext, m: MediaRef) => {
  if (ctx.credentials.mediaSource === 'PULL_FROM_URL') return { source: 'PULL_FROM_URL', video_url: m.url };
  const { chunkSize, count } = chunkPlan(m.fileSize);
  return { source: 'FILE_UPLOAD', video_size: m.fileSize, chunk_size: chunkSize, total_chunk_count: count };
};

const typeOf = (input: Pick<PublishInput, 'data' | 'media'>) =>
  input.data.type ?? (input.media.length && input.media.every(m => m.type === 'image') ? 'IMAGE' : 'VIDEO');

const permalinkOf = (a: AccountRuntime, id: string, type: string) => a.username ? `https://www.tiktok.com/@${a.username}/${type === 'IMAGE' ? 'photo' : 'video'}/${id}` : null;

function statusResult(a: AccountRuntime, ref: string, type: string, st: any): PublishResult {
  const status = st.status;
  if (status === 'PUBLISH_COMPLETE') {
    const ids: unknown[] = st.publicaly_available_post_id ?? st.post_ids ?? [];
    const id = ids.length ? String(ids[0]) : null;
    // Private (SELF_ONLY) posts never get a public id; the publish id stays the handle.
    return { status: 'POSTED', externalPostId: id ?? ref, permalink: id ? permalinkOf(a, id, type) : null, externalData: { publish_id: ref, publicaly_available_post_id: ids } };
  }
  if (status === 'SEND_TO_USER_INBOX') {
    return { status: 'REVIEW', externalPostId: null, pendingRef: null, externalData: { publish_id: ref, note: 'Sent to the creator\'s TikTok inbox; they finish and post it in the TikTok app.' } };
  }
  if (status === 'FAILED') {
    const reason = String(st.fail_reason ?? st.reason ?? 'unknown');
    throw new NetworkError(CODES[reason] ?? 'CONTENT_REJECTED', `TikTok could not publish the post: ${reason}`, { meta: st });
  }
  return { status: 'PROCESSING', pendingRef: ref, pollAfterMs: POLL_MS, externalData: { publish_id: ref, status, uploaded_bytes: st.uploaded_bytes, downloaded_bytes: st.downloaded_bytes } };
}

const requireBiz = (a: AccountRuntime, what: string) => {
  if (!isBiz(a)) throw new NetworkError('NOT_SUPPORTED', `${what} on TikTok needs a business account connected through TikTok API for Business (connect with withBusinessScope).`);
};

const toComment = (c: any, videoId: string): FetchedCommentInput => ({
  externalId: String(c.comment_id),
  externalParentId: c.parent_comment_id && c.parent_comment_id !== c.comment_id ? String(c.parent_comment_id) : null,
  externalPostId: videoId,
  authorName: c.display_name ?? c.username ?? null,
  authorExternalId: c.user_id ?? null,
  authorProfileUrl: c.username ? `https://www.tiktok.com/@${c.username}` : null,
  authorAvatarUrl: c.profile_image ?? null,
  text: c.text ?? '',
  likesCount: c.likes ?? 0,
  repliesCount: c.replies ?? 0,
  publishedAt: c.create_time ? new Date(Number(c.create_time) * 1000) : null,
  platformData: { owner: c.owner ?? false, liked: c.liked ?? false, pinned: c.pinned ?? false, status: c.status ?? null },
});

// ───────────────────────────── the adapter ─────────────────────────────

export const tiktok: NetworkAdapter = {
  type: 'TIKTOK',
  displayName: 'TikTok',
  credentialKeys: ['clientKey', 'clientSecret'],
  // Login Kit scopes + TikTok API for Business account scopes (deduplicated): both go to app review.
  scopes: [...new Set([...SCOPES, ...BUSINESS_SCOPES])],
  capabilities: {
    connect: 'oauth2', channels: 'none', postTypes: ['VIDEO', 'IMAGE'],
    // Comments exist only through the Business API: business-connected accounts. Others get NOT_SUPPORTED.
    comments: true, firstComment: true, editPost: false, deletePost: false, editComment: false, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'HIDE', 'UNHIDE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    textMax: 2200,
    commentMax: 150,
    media: {
      maxItems: 35,
      image: { mimes: ['image/jpeg', 'image/webp'], maxBytes: 20 * MB },
      video: { mimes: ['video/mp4', 'video/webm', 'video/quicktime'], maxBytes: 4 * GB, minSeconds: 3, maxSeconds: 600 },
    },
  },
  errorReference: [
    { code: 'unaudited_client_can_only_post_to_private_accounts', message: 'Please review our integration guidelines…', meaning: 'The TikTok app has not passed the Content Posting audit; only SELF_ONLY posts are allowed.', fix: 'Post with privacy SELF_ONLY until the app is audited.' },
    { code: 'privacy_level_option_mismatch', message: 'privacy_level is not one of the creator\'s privacy_level_options.', meaning: 'The creator\'s account does not offer that privacy level (e.g. private accounts cannot post PUBLIC_TO_EVERYONE).', fix: 'Pick one of the levels creator_info returns for this account.' },
    { code: 'spam_risk_too_many_posts', message: 'The daily post cap for this creator was reached.', meaning: 'TikTok limits direct posts per creator per day (about 15).', fix: 'Retry tomorrow or post fewer times a day.' },
    { code: 'spam_risk_too_many_pending_share', message: 'Too many pending shares in the inbox.', meaning: 'Up to 5 drafts may wait in the creator\'s inbox within 24 hours.', fix: 'Have the creator post or delete pending drafts in the TikTok app.' },
    { code: 'spam_risk_user_banned_from_posting', message: 'The user is banned from posting.', meaning: 'TikTok blocked this creator from posting.', fix: 'The creator resolves it with TikTok.' },
    { code: 'access_token_invalid', message: 'The access token is invalid or not found in the request.', meaning: 'The grant expired or was revoked.', fix: 'Reconnect the TikTok account.' },
    { code: 'scope_not_authorized', message: 'The user did not authorize the scope required for completing this request.', meaning: 'video.publish or video.upload was not granted.', fix: 'Reconnect and approve every requested permission.' },
    { code: 'url_ownership_unverified', message: 'The URL prefix is not verified for this app.', meaning: 'PULL_FROM_URL needs the media domain verified in the TikTok developer portal.', fix: 'Verify the media domain, or use FILE_UPLOAD.' },
    { code: 'rate_limit_exceeded', message: 'API rate limit exceeded.', meaning: 'Too many requests for this token (e.g. 6/min for init).', fix: 'Retry after a minute.' },
    { code: 'duration_check_failed', message: 'Video duration exceeds the creator\'s max_video_post_duration_sec.', meaning: 'The video is longer than this creator may post.', fix: 'Trim the video.' },
    { code: 'file_format_check_failed', message: 'Unsupported media format.', meaning: 'Video must be MP4/WebM/MOV (H.264/H.265/VP8/VP9); photos JPEG/WebP.', fix: 'Re-encode the media.' },
    { code: 'picture_size_check_failed', message: 'Picture size check failed.', meaning: 'Photos must be at most 1080p and 20 MB.', fix: 'Resize the image.' },
    { code: 'reached_active_user_cap', message: 'The daily quota for active publishing users was reached.', meaning: 'Unaudited apps are capped at a few active creators per day.', fix: 'Complete the TikTok audit to raise the cap.' },
    { code: '40001', message: 'No permission to operate this business account.', meaning: 'Business API: the token lacks the scope or the account is not a business account.', fix: 'Reconnect with withBusinessScope and approve comment scopes.' },
    { code: '40105', message: 'Access token is invalid or expired.', meaning: 'Business API token expired and could not be refreshed.', fix: 'Reconnect the TikTok account.' },
  ],

  async authorize(ctx, input) {
    const business = !!input.options?.withBusinessScope;
    const url = authorizeUrl('https://www.tiktok.com/v2/auth/authorize/', {
      client_key: business ? need(ctx, 'businessClientKey') : need(ctx, 'clientKey'),
      scope: (business ? BUSINESS_SCOPES : SCOPES).join(','),
      response_type: 'code', redirect_uri: ctx.redirectUri, state: input.state,
      // No PKCE: TikTok's web Login Kit does not use it (code_verifier is for mobile/desktop apps, whose
      // challenge is hex SHA-256, not base64url — sending ours risks a failed exchange).
      disable_auto_auth: input.forceLogin ? '1' : undefined,
    });
    return { url, extra: { tiktokApi: business ? 'business' : 'content' } };
  },

  async exchange(ctx, input) {
    if (input.query.error) throw new NetworkError('PERMISSION', input.query.error_description || input.query.error);
    if (input.extra?.tiktokApi === 'business') {
      const t = await biz(ctx, '', '/tt_user/oauth2/token/', {
        method: 'POST', json: { client_id: need(ctx, 'businessClientKey'), client_secret: need(ctx, 'businessClientSecret'), grant_type: 'authorization_code', auth_code: input.code, redirect_uri: ctx.redirectUri },
      });
      const info = await bizInfo(ctx, t.access_token, t.open_id);
      return { token: tokenOf(t, ctx.now(), 'business', { businessId: t.open_id }), profile: bizProfileOf(t.open_id, info) };
    }
    const t = await request(ctx, `${OPEN}/v2/oauth/token/`, {
      form: { client_key: need(ctx, 'clientKey'), client_secret: need(ctx, 'clientSecret'), code: input.code, grant_type: 'authorization_code', redirect_uri: ctx.redirectUri },
      mapError,
    });
    if (t?.error) throw mapError(400, t) ?? new NetworkError('TOKEN_INVALID', t.error_description || t.error, { meta: t });
    const me = await userInfo(ctx, t.access_token);
    return { token: tokenOf(t, ctx.now(), 'content'), profile: profileOf(me) };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No TikTok refresh token; reconnect the account.');
    if (isBiz(a)) {
      const t = await biz(ctx, '', '/tt_user/oauth2/refresh_token/', {
        method: 'POST', json: { client_id: need(ctx, 'businessClientKey'), client_secret: need(ctx, 'businessClientSecret'), grant_type: 'refresh_token', refresh_token: a.token.refreshToken },
      });
      return tokenOf(t, ctx.now(), 'business', { businessId: businessId(a) });
    }
    // TikTok rotates refresh tokens: the old one stops working once this returns.
    const t = await request(ctx, `${OPEN}/v2/oauth/token/`, {
      form: { client_key: need(ctx, 'clientKey'), client_secret: need(ctx, 'clientSecret'), grant_type: 'refresh_token', refresh_token: a.token.refreshToken },
      mapError,
    });
    if (t?.error) throw mapError(400, t) ?? new NetworkError('TOKEN_INVALID', t.error_description || t.error, { meta: t });
    return tokenOf(t, ctx.now(), 'content');
  },

  async refreshProfile(ctx, a) {
    if (isBiz(a)) return bizProfileOf(businessId(a), await bizInfo(ctx, a.token.accessToken, businessId(a)));
    return profileOf(await userInfo(ctx, a.token.accessToken));
  },

  async checkConnection(ctx, a) {
    try { await tiktok.refreshProfile(ctx, a); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    if (isBiz(a)) {
      await biz(ctx, a.token.accessToken, '/tt_user/oauth2/revoke/', { method: 'POST', json: { client_id: ctx.credentials.businessClientKey, client_secret: ctx.credentials.businessClientSecret, access_token: a.token.accessToken } }).catch(() => undefined);
      return;
    }
    await request(ctx, `${OPEN}/v2/oauth/revoke/`, { form: { client_key: ctx.credentials.clientKey, client_secret: ctx.credentials.clientSecret, token: a.token.accessToken } }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const type = data.type ?? (media.length && media.every(m => m.type === 'image') ? 'IMAGE' : 'VIDEO');
    if (type === 'VIDEO') {
      checkText(issues, data.text, 2200, ['text']);
      if (media.length !== 1 || media[0].type !== 'video') issues.push({ code: media.length ? 'type' : 'required', message: 'A TikTok video post needs exactly one video.', path: ['uploadIds'] });
      else checkMedia(issues, media, tiktok.limits, ['uploadIds'], { types: ['video'] });
      const dur = media[0]?.duration;
      if (data.thumbnailOffset != null && (data.thumbnailOffset < 0 || (dur != null && data.thumbnailOffset > dur * 1000))) issues.push({ code: 'invalid', message: 'thumbnailOffset is the cover frame in milliseconds and must fall inside the video.', path: ['thumbnailOffset'] });
    } else if (type === 'IMAGE') {
      checkText(issues, data.text, 4000, ['text']);
      checkMedia(issues, media, tiktok.limits, ['uploadIds'], { required: true, types: ['image'] });
      if (data.photoCoverIndex != null && data.photoCoverIndex >= Math.max(1, media.length)) issues.push({ code: 'invalid', message: 'photoCoverIndex must point at one of the photos.', path: ['photoCoverIndex'] });
      if (data.musicSoundInfo) issues.push({ code: 'unsupported', message: 'Music can only be added to TikTok video posts.', path: ['musicSoundInfo'] });
    } else {
      issues.push({ code: 'invalid', message: 'type must be VIDEO or IMAGE.', path: ['type'] });
    }
    if (data.privacy != null && !PRIVACY.includes(data.privacy)) issues.push({ code: 'invalid', message: `privacy must be one of ${PRIVACY.join(', ')}.`, path: ['privacy'] });
    // TikTok's posting guidelines: the creator chooses the privacy level; there is no default.
    if (!data.privacy && !data.uploadToDraft) issues.push({ code: 'required', message: 'Choose a TikTok privacy level (TikTok requires the creator to pick one; there is no default).', path: ['privacy'] });
    if (data.isBrandContent && data.privacy === 'SELF_ONLY') issues.push({ code: 'invalid', message: 'Branded content cannot be private (SELF_ONLY) on TikTok.', path: ['privacy'] });
    const ms = data.musicSoundInfo;
    if (ms && ms.musicSoundStart != null && ms.musicSoundEnd != null && ms.musicSoundEnd <= ms.musicSoundStart) issues.push({ code: 'invalid', message: 'musicSoundEnd must be after musicSoundStart.', path: ['musicSoundInfo', 'musicSoundEnd'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const d = input.data;
    const type = typeOf(input);
    if (isBiz(a)) return publishBusiness(ctx, input, type);
    if (d.musicSoundInfo) throw new NetworkError('NOT_SUPPORTED', 'Commercial music needs a TikTok business account connected with withBusinessScope.');
    const tok = a.token.accessToken;
    const draft = !!d.uploadToDraft;

    if (type === 'IMAGE') {
      const post_info: Record<string, unknown> = {
        description: d.text ?? '', auto_add_music: !!d.autoAddMusic,
      };
      if (!draft) {
        // disable_comment and the brand toggles are DIRECT_POST-only (the creator sets them in the app for drafts).
        Object.assign(post_info, { disable_comment: !!d.disableComments, brand_content_toggle: !!d.isBrandContent, brand_organic_toggle: !!d.isOrganicBrandContent });
        const c = await creatorInfo(ctx, tok, d, null);
        post_info.privacy_level = c.privacy;
        post_info.disable_comment = !!d.disableComments || !!c.info.comment_disabled;
      }
      const r = await open<{ publish_id: string }>(ctx, tok, '/v2/post/publish/content/init/', {
        method: 'POST',
        json: {
          post_info, post_mode: draft ? 'MEDIA_UPLOAD' : 'DIRECT_POST', media_type: 'PHOTO',
          source_info: { source: 'PULL_FROM_URL', photo_cover_index: d.photoCoverIndex ?? 0, photo_images: input.media.map(m => m.url) },
        },
      });
      return { status: 'PROCESSING', pendingRef: r.publish_id, pollAfterMs: POLL_MS, externalData: { publish_id: r.publish_id, post_mode: draft ? 'MEDIA_UPLOAD' : 'DIRECT_POST' } };
    }

    const video = input.media.find(m => m.type === 'video');
    if (!video) throw new NetworkError('VALIDATION', 'A TikTok video post needs one video.');
    const source_info = sourceFor(ctx, video);
    let r: { publish_id: string; upload_url?: string };
    if (draft) {
      r = await open(ctx, tok, '/v2/post/publish/inbox/video/init/', { method: 'POST', json: { source_info } });
    } else {
      const { privacy, info } = await creatorInfo(ctx, tok, d, video);
      r = await open(ctx, tok, '/v2/post/publish/video/init/', {
        method: 'POST',
        json: {
          post_info: {
            title: d.text ?? '', privacy_level: privacy,
            // A creator who switched an interaction off in TikTok cannot have it switched on by us.
            disable_comment: !!d.disableComments || !!info.comment_disabled,
            disable_duet: !!d.disableDuet || !!info.duet_disabled,
            disable_stitch: !!d.disableStitch || !!info.stitch_disabled,
            video_cover_timestamp_ms: d.thumbnailOffset ? Math.round(d.thumbnailOffset) : undefined,
            brand_content_toggle: !!d.isBrandContent, brand_organic_toggle: !!d.isOrganicBrandContent, is_aigc: !!d.isAiGenerated,
          },
          source_info,
        },
      });
    }
    if (source_info.source === 'FILE_UPLOAD') {
      if (!r.upload_url) throw new NetworkError('UNKNOWN', 'TikTok did not return an upload_url.', { meta: r });
      await uploadChunks(ctx, r.upload_url, video);
    }
    return { status: 'PROCESSING', pendingRef: r.publish_id, pollAfterMs: POLL_MS, externalData: { publish_id: r.publish_id, source: source_info.source, inbox: draft } };
  },

  async poll(ctx, input, ref) {
    const a = input.account;
    const type = typeOf(input);
    if (isBiz(a)) {
      const st = await biz(ctx, a.token.accessToken, '/business/publish/status/', { query: { business_id: businessId(a), publish_id: ref } });
      return statusResult(a, ref, type, st);
    }
    return statusResult(a, ref, type, await fetchStatus(ctx, a.token.accessToken, ref));
  },

  async recentPosts(ctx, a, since) {
    const page = await tiktok.importHistory!(ctx, a, { limit: 20 });
    return page.items.filter(p => !p.publishedAt || p.publishedAt >= since).map(p => ({ externalId: p.externalId, text: p.title, createdAt: p.publishedAt, permalink: p.permalink }));
  },

  async comment(ctx, input) {
    const a = input.account;
    requireBiz(a, 'Commenting');
    const body = { business_id: businessId(a), video_id: input.externalPostId, text: input.text };
    const r = input.parentExternalId
      ? await biz(ctx, a.token.accessToken, '/business/comment/reply/create/', { method: 'POST', json: { ...body, comment_id: input.parentExternalId } })
      : await biz(ctx, a.token.accessToken, '/business/comment/create/', { method: 'POST', json: body });
    return { externalId: String(r.comment_id), externalData: r };
  },

  async deleteComment(ctx, a, id) {
    requireBiz(a, 'Deleting comments');
    await biz(ctx, a.token.accessToken, '/business/comment/delete/', { method: 'POST', json: { business_id: businessId(a), comment_id: id } });
  },

  async importComments(ctx, a, input) {
    requireBiz(a, 'Reading comments');
    const r = await biz(ctx, a.token.accessToken, '/business/comment/list/', {
      query: { business_id: businessId(a), video_id: input.externalPostId, cursor: input.cursor ?? undefined, max_count: Math.min(30, input.limit) },
    });
    return { items: (r.comments ?? []).map((c: any) => toComment(c, input.externalPostId)), nextCursor: r.has_more ? String(r.cursor) : null };
  },

  async commentAction(ctx, a, comment, action) {
    requireBiz(a, 'Moderating comments');
    if (action === 'DELETE') return tiktok.deleteComment!(ctx, a, comment.externalId);
    if (action !== 'HIDE' && action !== 'UNHIDE') throw new NetworkError('NOT_SUPPORTED', `TikTok does not support ${action} on comments through its API.`);
    if (!comment.externalPostId) throw new NetworkError('VALIDATION', 'Hiding a TikTok comment needs the video id.');
    await biz(ctx, a.token.accessToken, '/business/comment/hide/', { method: 'POST', json: { business_id: businessId(a), video_id: comment.externalPostId, comment_id: comment.externalId, action } });
  },

  async accountAnalytics(ctx, a) {
    if (isBiz(a)) {
      const b = await bizInfo(ctx, a.token.accessToken, businessId(a));
      return { followers: b.followers_count ?? 0, following: b.following_count ?? 0, likes: b.likes_count ?? 0, postCount: b.videos_count ?? 0, raw: b };
    }
    const u = await userInfo(ctx, a.token.accessToken);
    return { followers: u.follower_count ?? 0, following: u.following_count ?? 0, likes: u.likes_count ?? 0, postCount: u.video_count ?? 0, raw: { follower_count: u.follower_count, following_count: u.following_count, likes_count: u.likes_count, video_count: u.video_count } };
  },

  async postAnalytics(ctx, a, id) {
    if (isBiz(a)) {
      const r = await biz(ctx, a.token.accessToken, '/business/video/list/', { query: { business_id: businessId(a), fields: JSON.stringify(BIZ_VIDEO_FIELDS), filters: JSON.stringify({ video_ids: [id] }) } });
      const v = r.videos?.[0];
      if (!v) throw new NetworkError('NOT_FOUND', `TikTok video ${id} was not found.`);
      return metrics(v);
    }
    const r = await open<{ videos: any[] }>(ctx, a.token.accessToken, '/v2/video/query/', { method: 'POST', query: { fields: VIDEO_FIELDS }, json: { filters: { video_ids: [id] } } });
    const v = r.videos?.[0];
    if (!v) throw new NetworkError('NOT_FOUND', `TikTok video ${id} was not found (private videos and other accounts' videos are not returned).`);
    return metrics(v);
  },

  async importHistory(ctx, a, input) {
    if (isBiz(a)) {
      const r = await biz(ctx, a.token.accessToken, '/business/video/list/', { query: { business_id: businessId(a), fields: JSON.stringify(BIZ_VIDEO_FIELDS), cursor: input.cursor ?? undefined, max_count: Math.min(20, input.limit) } });
      return { items: (r.videos ?? []).map(toHistory), nextCursor: r.has_more ? String(r.cursor) : null };
    }
    const r = await open<{ videos: any[]; cursor: number; has_more: boolean }>(ctx, a.token.accessToken, '/v2/video/list/', {
      method: 'POST', query: { fields: VIDEO_FIELDS }, json: { max_count: Math.min(20, input.limit), ...(input.cursor ? { cursor: Number(input.cursor) } : {}) },
    });
    return { items: (r.videos ?? []).map(toHistory), nextCursor: r.has_more ? String(r.cursor) : null };
  },

  misc: {
    'misc.tiktok.getCommercialMusicTrendingList': async (ctx, a, { query }) => {
      requireBiz(a, 'The Commercial Music Library');
      const r = await biz(ctx, a.token.accessToken, '/business/cml/trending_list/', {
        query: { business_id: businessId(a), genre: query.genre ?? 'POP', date_range: query.dateRange ?? '7DAY' },
      });
      // commercial_music_id is dropped: publishing needs a song_clip_id, and TikTok rejects the music id.
      return (r.trending_list ?? r.list ?? []).slice(0, 100).map(({ commercial_music_id: _drop, ...t }: any) => ({
        commercial_music_name: t.commercial_music_name ?? null, duration: t.duration ?? null, thumbnail_url: t.thumbnail_url, artist: t.artist,
        preview_url: t.preview_url ?? null, genres: t.genres ?? [], rank_position: String(t.rank_position), trending_history: t.trending_history ?? [],
        full_duration_song_clip: t.full_duration_song_clip ?? null, trending_song_clip: t.trending_song_clip ?? null,
      }));
    },
    'misc.tiktok.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await tiktok.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
  },
};

// ───────────────────────────── publishing internals ─────────────────────────────

/**
 * TikTok requires querying creator_info before every direct post: the privacy level must be one
 * of the creator's options and the video must fit their max duration.
 */
async function creatorInfo(ctx: NetworkContext, tok: string, d: Record<string, any>, video: MediaRef | null): Promise<{ privacy: string; info: any }> {
  const info = await open(ctx, tok, '/v2/post/publish/creator_info/query/', { method: 'POST', json: {} });
  const options: string[] = info.privacy_level_options ?? [];
  if (!d.privacy) throw new NetworkError('VALIDATION', `Choose a TikTok privacy level: ${options.join(', ')}.`);
  if (options.length && !options.includes(d.privacy)) throw new NetworkError('VALIDATION', `This TikTok account cannot post with privacy ${d.privacy}; it allows ${options.join(', ')}.`, { meta: { privacy_level_options: options } });
  if (video?.duration && info.max_video_post_duration_sec && video.duration > info.max_video_post_duration_sec) {
    throw new NetworkError('MEDIA_INVALID', `The video is ${Math.round(video.duration)}s; this creator can post at most ${info.max_video_post_duration_sec}s.`);
  }
  return { privacy: d.privacy as string, info };
}

async function publishBusiness(ctx: NetworkContext, input: PublishInput, type: string): Promise<PublishResult> {
  const a = input.account;
  const d = input.data;
  const ms = d.musicSoundInfo;
  const post_info: Record<string, unknown> = {
    caption: d.text ?? '', privacy_level: d.privacy ?? undefined, disable_comment: !!d.disableComments,
    is_branded_content: !!d.isBrandContent, is_brand_organic: !!d.isOrganicBrandContent, is_ai_generated: !!d.isAiGenerated, upload_to_draft: !!d.uploadToDraft,
  };
  let r: { share_id: string };
  if (type === 'IMAGE') {
    r = await biz(ctx, a.token.accessToken, '/business/photo/publish/', {
      method: 'POST',
      json: { business_id: businessId(a), photo_images: input.media.map(m => m.url), photo_cover_index: d.photoCoverIndex ?? 0, post_info: { ...post_info, auto_add_music: !!d.autoAddMusic } },
    });
  } else {
    const video = input.media.find(m => m.type === 'video');
    if (!video) throw new NetworkError('VALIDATION', 'A TikTok video post needs one video.');
    r = await biz(ctx, a.token.accessToken, '/business/video/publish/', {
      method: 'POST',
      json: {
        business_id: businessId(a), video_url: video.url,
        post_info: {
          ...post_info, disable_duet: !!d.disableDuet, disable_stitch: !!d.disableStitch, thumbnail_offset: d.thumbnailOffset ? Math.round(d.thumbnailOffset) : undefined,
          music_sound_info: ms ? { music_sound_id: ms.musicSoundId, music_sound_volume: ms.musicSoundVolume ?? undefined, music_sound_start: ms.musicSoundStart ?? undefined, music_sound_end: ms.musicSoundEnd ?? undefined, video_original_sound_volume: ms.videoOriginalSoundVolume ?? undefined } : undefined,
        },
      },
    });
  }
  return { status: 'PROCESSING', pendingRef: r.share_id, pollAfterMs: POLL_MS, externalData: { share_id: r.share_id, api: 'business' } };
}
