/**
 * YouTube — Data API v3 + Analytics API v2, behind Google OAuth 2.0.
 *
 * Docs: https://developers.google.com/youtube/v3
 *   OAuth            accounts.google.com/o/oauth2/v2/auth (access_type=offline, prompt=consent so a
 *                    refresh token is always issued) → oauth2.googleapis.com/token (client_id and
 *                    client_secret in the form body). Refresh responses carry no new refresh token.
 *   Channel          GET /youtube/v3/channels?mine=true → the channel the user picked at consent
 *   Upload           resumable: POST /upload/youtube/v3/videos?uploadType=resumable (metadata, answers
 *                    a Location) → PUT chunks with Content-Range (308 until the last) → video resource.
 *                    Processing then runs on YouTube's side: uploadStatus uploaded → processed.
 *   Thumbnail        POST /upload/youtube/v3/thumbnails/set?videoId=
 *   Comments         commentThreads.insert (top level) · comments.insert (reply) · comments.update ·
 *                    comments.delete · comments/setModerationStatus (heldForReview | published | rejected)
 *   History          the channel's uploads playlist is "UU" + channelId.slice(2)
 *   Quota            10,000 units/day per project; videos.insert costs 1,600 (see errorReference)
 */
import { NetworkError } from '../lib/errors.js';
import { httpError, request, resetFrom, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type {
  AccountMetrics, AccountProfile, AccountRuntime, Channel, FetchedCommentInput, HistoryPost, Issue, MediaRef, MiscHandler, NetworkAdapter, NetworkContext,
  PostMetrics, PublishInput, PublishResult, TokenSet,
} from '../types.js';

const API = 'https://www.googleapis.com/youtube/v3';
const UPLOAD = 'https://www.googleapis.com/upload/youtube/v3';
const ANALYTICS = 'https://youtubeanalytics.googleapis.com/v2/reports';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/yt-analytics.readonly',
];
/** Must be a multiple of 256 KiB. */
const CHUNK = 8 * MB;
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 5000; // bytes, not characters
const COMMENT_MAX = 10_000;
const SHORT_MAX_SECONDS = 180;
const PRIVACY: Record<string, string> = { PUBLIC: 'public', UNLISTED: 'unlisted', PRIVATE: 'private' };
const LANG_RE = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;

// ───────────────────────────── errors ─────────────────────────────

const next8amUtc = (now = new Date()) => { const d = new Date(now); d.setUTCHours(8, 0, 0, 0); if (d <= now) d.setUTCDate(d.getUTCDate() + 1); return d; };

/** Google error bodies: { error: { code, message, errors: [{ reason, domain }] } } — or OAuth style { error: 'invalid_grant', error_description }. */
function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const opts = { httpStatus: status, meta: body };
  if (typeof body?.error === 'string') {
    const msg = body.error_description ?? body.error;
    if (['invalid_grant', 'invalid_token', 'unauthorized_client'].includes(body.error)) return new NetworkError('TOKEN_INVALID', msg, opts);
    if (body.error === 'invalid_client') return new NetworkError('NOT_CONFIGURED', msg, { ...opts, userFacingMessage: 'The Google OAuth client for Siar is misconfigured.' });
    return undefined;
  }
  const e = body?.error;
  const msg: string = e?.message ?? `YouTube returned HTTP ${status}`;
  const reason: string = e?.errors?.[0]?.reason ?? '';
  if (status === 401 || reason === 'authError') return new NetworkError('TOKEN_INVALID', msg, opts);
  if (['quotaExceeded', 'dailyLimitExceeded'].includes(reason)) {
    return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: next8amUtc(), userFacingMessage: 'The YouTube API quota for this project is used up for today. It resets at midnight Pacific time.' });
  }
  if (['rateLimitExceeded', 'userRateLimitExceeded', 'uploadLimitExceeded'].includes(reason) || status === 429) return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: resetFrom(res) });
  if (['videoNotFound', 'commentNotFound', 'playlistNotFound', 'playlistItemNotFound', 'channelNotFound', 'notFound'].includes(reason)) return new NetworkError('NOT_FOUND', msg, opts);
  if (['duplicate', 'videoAlreadyInPlaylist'].includes(reason)) return new NetworkError('DUPLICATE', msg, opts);
  if (['invalidImage', 'imageTooLarge', 'mediaBodyRequired', 'unsupportedMediaType'].includes(reason) || status === 413 || status === 415) return new NetworkError('MEDIA_INVALID', msg, opts);
  if (['youtubeSignupRequired', 'insufficientPermissions', 'forbidden', 'commentsDisabled', 'accountClosed', 'accountSuspended', 'ineligibleAccount', 'accountDelegationForbidden'].includes(reason)) {
    const userFacing = reason === 'youtubeSignupRequired' ? 'This Google account has no YouTube channel. Create one at youtube.com and reconnect.' : undefined;
    return new NetworkError('PERMISSION', msg, { ...opts, userFacingMessage: userFacing });
  }
  if (['invalidTitle', 'invalidDescription', 'invalidTags', 'invalidVideoMetadata', 'invalidCategoryId', 'invalidPrivacyStatus', 'defaultLanguageNotSupported', 'invalidCommentText'].includes(reason)) return new NetworkError('VALIDATION', msg, opts);
  return undefined;
}

const authHeader = (a: AccountRuntime) => ({ authorization: `Bearer ${a.token.accessToken}` });

const api = <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: RequestOptions = {}) =>
  request<T>(ctx, `${API}${path}`, { bearer: a.token.accessToken, mapError, ...opts });

/** A call where the status and headers matter (resumable upload answers 308 and a Location header). */
async function raw(ctx: NetworkContext, url: string, init: { method: string; headers: Record<string, string>; body?: BodyInit; timeoutMs?: number }, also: number[] = []): Promise<{ res: Response; body: any }> {
  let res: Response;
  try { res = await ctx.fetch(url, init); } catch (err) {
    throw new NetworkError('NETWORK_UNAVAILABLE', `Could not reach ${new URL(url).host}: ${(err as Error).message}`);
  }
  const text = await res.text();
  let body: any = null;
  if (text) { try { body = JSON.parse(text); } catch { body = text; } }
  if (!res.ok && !also.includes(res.status)) throw mapError(res.status, body, res) ?? httpError(res, body);
  return { res, body };
}

// ───────────────────────────── helpers ─────────────────────────────

const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
const permalinkFor = (id: string, type?: string) => (type === 'SHORT' ? `https://www.youtube.com/shorts/${id}` : watchUrl(id));
const uploadsPlaylist = (channelId: string) => (channelId.startsWith('UC') ? `UU${channelId.slice(2)}` : channelId);
const ymd = (d: Date) => d.toISOString().slice(0, 10);
const num = (v: unknown) => (v === undefined || v === null || v === '' ? undefined : Number(v));
const channelOf = (a: AccountRuntime) => {
  const id = a.channelId ?? a.externalId;
  if (!id) throw new NetworkError('VALIDATION', 'This YouTube account has no channel id; refresh the profile.');
  return id;
};
const bytes = (s: string) => Buffer.byteLength(s, 'utf8');

const toChannel = (c: any): Channel => ({
  id: c.id, name: c.snippet?.title ?? null, username: c.snippet?.customUrl ?? null,
  avatarUrl: c.snippet?.thumbnails?.high?.url ?? c.snippet?.thumbnails?.default?.url ?? null,
  metadata: { subscriberCount: num(c.statistics?.subscriberCount), videoCount: num(c.statistics?.videoCount), uploadsPlaylistId: c.contentDetails?.relatedPlaylists?.uploads ?? uploadsPlaylist(c.id) },
});

const profileOf = (c: any, channels: any[]): AccountProfile => ({
  externalId: c.id, providerPageId: c.id, username: c.snippet?.customUrl ?? null, displayName: c.snippet?.title ?? null,
  avatarUrl: c.snippet?.thumbnails?.high?.url ?? c.snippet?.thumbnails?.default?.url ?? null, bio: c.snippet?.description ?? null,
  userId: c.id, userUsername: c.snippet?.customUrl ?? null, userDisplayName: c.snippet?.title ?? null,
  channels: channels.map(toChannel),
});

async function mineChannels(ctx: NetworkContext, token: string): Promise<any[]> {
  const r = await request(ctx, `${API}/channels`, { bearer: token, mapError, query: { part: 'snippet,statistics,contentDetails', mine: 'true', maxResults: 50 } });
  if (!r?.items?.length) throw new NetworkError('PERMISSION', 'This Google account has no YouTube channel. Create a channel at youtube.com and reconnect.', { userFacingMessage: 'This Google account has no YouTube channel. Create one at youtube.com and reconnect.' });
  return r.items;
}

async function tokenRequest(ctx: NetworkContext, form: Record<string, string>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, TOKEN_URL, { form: { ...form, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret }, mapError });
  return {
    accessToken: tok.access_token,
    // Google only returns a refresh token on the consent exchange; refreshes keep the one we have.
    refreshToken: tok.refresh_token ?? prev?.refreshToken ?? null,
    expiresAt: expiresIn(tok.expires_in, ctx.now()),
    scopes: String(tok.scope ?? SCOPES.join(' ')).split(/\s+/),
    secrets: { ...(prev?.secrets ?? {}) },
  };
}

const metrics = (v: any): PostMetrics => ({
  views: num(v.statistics?.viewCount) ?? 0, likes: num(v.statistics?.likeCount) ?? 0, comments: num(v.statistics?.commentCount) ?? 0,
  raw: { statistics: v.statistics },
});

/** Analytics API rows → { metric: value }. Fails soft: analytics needs a scope and a channel with data. */
async function report(ctx: NetworkContext, a: AccountRuntime, params: Record<string, string>): Promise<Record<string, number> | null> {
  try {
    const r = await request(ctx, ANALYTICS, { bearer: a.token.accessToken, mapError, query: { ids: 'channel==MINE', ...params } });
    const row = r?.rows?.[0];
    if (!row) return null;
    return Object.fromEntries((r.columnHeaders as { name: string }[]).map((h, i) => [h.name, Number(row[i])]));
  } catch (e) {
    if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') throw e;
    return null;
  }
}

// ───────────────────────────── upload ─────────────────────────────

const nextOffset = (res: Response) => { const m = /bytes=0-(\d+)/.exec(res.headers.get('range') ?? ''); return m ? Number(m[1]) + 1 : 0; };

/** Resumable upload. A dropped connection asks Google how far it got instead of starting over. */
async function uploadVideo(ctx: NetworkContext, a: AccountRuntime, m: MediaRef, metadata: unknown, parts: string): Promise<any> {
  const init = await raw(ctx, `${UPLOAD}/videos?uploadType=resumable&part=${encodeURIComponent(parts)}`, {
    method: 'POST',
    headers: { ...authHeader(a), 'content-type': 'application/json; charset=UTF-8', 'x-upload-content-length': String(m.fileSize), 'x-upload-content-type': m.mime },
    body: JSON.stringify(metadata),
  });
  const location = init.res.headers.get('location');
  if (!location) throw new NetworkError('UNKNOWN', 'YouTube did not return a resumable upload URL.', { meta: init.body });
  let offset = 0;
  let retries = 0;
  while (true) {
    const end = Math.min(m.fileSize, offset + CHUNK);
    try {
      const chunk = await m.readRange(offset, end);
      const r = await raw(ctx, location, {
        method: 'PUT', headers: { ...authHeader(a), 'content-type': m.mime, 'content-range': `bytes ${offset}-${end - 1}/${m.fileSize}` }, body: new Uint8Array(chunk), timeoutMs: 600_000,
      }, [308]);
      if (r.res.status !== 308) return r.body;
      offset = nextOffset(r.res) || end;
    } catch (e) {
      if (!(e instanceof NetworkError) || e.code !== 'NETWORK_UNAVAILABLE' || ++retries > 3) throw e;
      const s = await raw(ctx, location, { method: 'PUT', headers: { ...authHeader(a), 'content-range': `bytes */${m.fileSize}` } }, [308]);
      if (s.res.status !== 308) return s.body;
      offset = nextOffset(s.res);
    }
  }
}

async function setThumbnail(ctx: NetworkContext, a: AccountRuntime, videoId: string, bytesIn: Buffer, mime: string) {
  return raw(ctx, `${UPLOAD}/thumbnails/set?videoId=${encodeURIComponent(videoId)}&uploadType=media`, {
    method: 'POST', headers: { ...authHeader(a), 'content-type': mime }, body: new Uint8Array(bytesIn), timeoutMs: 120_000,
  }).then(r => r.body);
}

// ───────────────────────────── video resource ─────────────────────────────

/** videos.update replaces whole parts: read the video, change what was asked, write it back. */
async function updateVideo(ctx: NetworkContext, a: AccountRuntime, id: string, d: Record<string, any>) {
  const cur = (await api(ctx, a, '/videos', { query: { part: 'snippet,status', id } })).items?.[0];
  if (!cur) throw new NetworkError('NOT_FOUND', 'The video was not found.', { httpStatus: 404 });
  const s = cur.snippet ?? {};
  const privacy = d.privacyStatus ?? (d.privacy ? PRIVACY[d.privacy] : undefined);
  return api(ctx, a, '/videos', {
    method: 'PUT', query: { part: 'snippet,status' },
    json: {
      id,
      snippet: {
        title: d.title ?? d.text ?? s.title, description: d.description ?? s.description, tags: d.tags ?? s.tags, categoryId: d.categoryId ?? s.categoryId,
        defaultLanguage: d.defaultLanguage ?? s.defaultLanguage, defaultAudioLanguage: d.defaultAudioLanguage ?? s.defaultAudioLanguage,
      },
      status: { privacyStatus: privacy ?? cur.status?.privacyStatus, selfDeclaredMadeForKids: cur.status?.selfDeclaredMadeForKids ?? false },
    },
  });
}

const parseCommentThread = (t: any, videoId: string): FetchedCommentInput[] => {
  const top = t.snippet?.topLevelComment;
  const toC = (c: any, parent: string | null): FetchedCommentInput => ({
    externalId: c.id, externalParentId: parent, externalPostId: videoId,
    authorName: c.snippet?.authorDisplayName ?? null, authorExternalId: c.snippet?.authorChannelId?.value ?? null, authorProfileUrl: c.snippet?.authorChannelUrl ?? null,
    authorAvatarUrl: c.snippet?.authorProfileImageUrl ?? null, text: c.snippet?.textOriginal ?? c.snippet?.textDisplay ?? null,
    likesCount: c.snippet?.likeCount ?? 0, repliesCount: parent ? 0 : t.snippet?.totalReplyCount ?? 0,
    publishedAt: c.snippet?.publishedAt ? new Date(c.snippet.publishedAt) : null, platformData: { updatedAt: c.snippet?.updatedAt, canRate: c.snippet?.canRate },
  });
  return [toC(top, null)];
};

// ───────────────────────────── adapter ─────────────────────────────

export const youtube: NetworkAdapter = {
  type: 'YOUTUBE',
  displayName: 'YouTube',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'optional', postTypes: ['VIDEO', 'SHORT'],
    comments: true, firstComment: true, editPost: true, deletePost: true, editComment: true, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'HIDE', 'UNHIDE', 'APPROVE', 'REJECT'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    textMax: TITLE_MAX, titleMax: TITLE_MAX, commentMax: COMMENT_MAX,
    media: {
      maxItems: 1,
      video: { mimes: ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska', 'video/mpeg', 'video/3gpp'], maxBytes: 256 * GB, maxSeconds: 12 * 3600 },
    },
  },
  errorReference: [
    { code: '401 authError', message: 'Invalid Credentials', meaning: 'The access token expired or the user revoked access in their Google account.', fix: 'Siar refreshes automatically; if it still fails, reconnect the YouTube account.' },
    { code: '403 quotaExceeded', message: 'The request cannot be completed because you have exceeded your quota.', meaning: 'The Google Cloud project spent its daily 10,000 units (one upload costs 1,600).', fix: 'Wait for midnight Pacific time, or request a quota extension for the project.' },
    { code: '400 uploadLimitExceeded', message: 'The user has exceeded the number of videos they may upload.', meaning: 'The channel hit its daily upload limit.', fix: 'Verify the channel by phone to raise the limit, or try again in 24 hours.' },
    { code: '403 forbidden (thumbnails)', message: "The authenticated user doesn't have permissions to upload and set custom video thumbnails.", meaning: 'Custom thumbnails need a verified channel.', fix: 'Verify the channel at youtube.com/verify. The video itself is still posted.' },
    { code: '401 youtubeSignupRequired', message: 'Unauthorized', meaning: 'The Google account has no YouTube channel.', fix: 'Create a channel at youtube.com and reconnect.' },
    { code: '400 invalidTitle', message: 'The request metadata specifies an invalid or empty video title.', meaning: 'The title is empty, longer than 100 characters, or contains < or >.', fix: 'Use a title of 1 to 100 characters without angle brackets.' },
    { code: '400 invalidDescription', message: 'The request metadata specifies an invalid video description.', meaning: 'The description is over 5,000 bytes or contains < or >.', fix: 'Shorten it and remove angle brackets.' },
    { code: '409 videoAlreadyInPlaylist', message: 'Video already in playlist.', meaning: 'The video is already in that playlist.', fix: 'Nothing to do, or remove it first.' },
    { code: '403 commentsDisabled', message: 'The video identified by the videoId parameter has disabled comments.', meaning: 'Comments are turned off on this video.', fix: 'Turn comments on in YouTube Studio.' },
    { code: 'uploadStatus rejected', message: 'rejectionReason: duplicate | copyright | claim | length | termsOfUse …', meaning: 'YouTube finished processing and refused the video.', fix: 'Read the reason in the post error; fix the content and post again.' },
    { code: 'locked private', message: 'privacyStatus came back private although public was requested.', meaning: 'Videos uploaded by an API project that has not passed the YouTube API compliance audit are locked private.', fix: 'Complete the audit for the Google Cloud project, then re-upload.' },
  ],

  async authorize(ctx, input) {
    const url = authorizeUrl(AUTH_URL, {
      client_id: ctx.credentials.clientId, redirect_uri: ctx.redirectUri, response_type: 'code', scope: SCOPES.join(' '), state: input.state,
      access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', code_challenge: input.codeChallenge, code_challenge_method: 'S256',
    });
    return { url };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri, code_verifier: input.codeVerifier });
    const channels = await mineChannels(ctx, token.accessToken);
    return { token, profile: profileOf(channels[0], channels) };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No Google refresh token; reconnect the account.');
    return tokenRequest(ctx, { grant_type: 'refresh_token', refresh_token: a.token.refreshToken }, a.token);
  },

  async refreshProfile(ctx, a) {
    const channels = await mineChannels(ctx, a.token.accessToken);
    return profileOf(channels.find(c => c.id === a.externalId) ?? channels[0], channels);
  },

  async listChannels(ctx, a) {
    return (await mineChannels(ctx, a.token.accessToken)).map(toChannel);
  },

  async selectChannel(ctx, a, channel) {
    return { externalId: channel.id, profile: { username: channel.username ?? null, displayName: channel.name ?? null, avatarUrl: channel.avatarUrl ?? null } };
  },

  async checkConnection(ctx, a) {
    try { await api(ctx, a, '/channels', { query: { part: 'id', mine: 'true' } }); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await request(ctx, REVOKE_URL, { form: { token: a.token.refreshToken ?? a.token.accessToken } }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    checkText(issues, data.text, TITLE_MAX, ['text']);
    checkMedia(issues, media, youtube.limits, ['uploadIds'], { required: true, types: ['video'] });
    for (const k of ['text', 'description'] as const) if (/[<>]/.test(String(data[k] ?? ''))) issues.push({ code: 'invalid', message: 'YouTube does not allow < or > in titles and descriptions.', path: [k] });
    if (data.description && bytes(String(data.description)) > DESCRIPTION_MAX) issues.push({ code: 'too_long', message: `Description is ${bytes(String(data.description))} bytes; the limit is ${DESCRIPTION_MAX}.`, path: ['description'] });
    if (data.type && !['VIDEO', 'SHORT'].includes(data.type)) issues.push({ code: 'invalid', message: 'type must be VIDEO or SHORT.', path: ['type'] });
    if ((data.type ?? 'SHORT') === 'SHORT') {
      media.forEach((m, i) => { if (m.type === 'video' && m.duration != null && m.duration > SHORT_MAX_SECONDS) issues.push({ code: 'too_long', message: `Shorts are at most ${SHORT_MAX_SECONDS} seconds; this video is ${Math.round(m.duration)}s. Use type VIDEO.`, path: ['uploadIds', i] }); });
    }
    if (data.privacy && !(data.privacy in PRIVACY)) issues.push({ code: 'invalid', message: 'privacy must be PUBLIC, UNLISTED or PRIVATE.', path: ['privacy'] });
    for (const k of ['defaultLanguage', 'defaultAudioLanguage'] as const) if (data[k] && !LANG_RE.test(String(data[k]))) issues.push({ code: 'invalid', message: `${k} must be a BCP-47 language tag such as en or pt-BR.`, path: [k] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const d = input.data;
    const m = input.media[0];
    if (!m) throw new NetworkError('VALIDATION', 'YouTube needs a video.');
    const type: string = d.type ?? 'SHORT';
    let thumb: MediaRef | null = null;
    if (d.thumbnail) {
      thumb = await input.resolveUpload(d.thumbnail);
      if (!['image/jpeg', 'image/png'].includes(thumb.mime) || thumb.fileSize > 2 * MB) throw new NetworkError('MEDIA_INVALID', 'A YouTube thumbnail must be a JPEG or PNG of at most 2 MB.');
    }
    const title = String(d.text || input.title || '').slice(0, TITLE_MAX);
    let description: string = d.description ?? '';
    if (type === 'SHORT' && !/#shorts\b/i.test(`${title} ${description}`)) description = `${description}${description ? '\n\n' : ''}#Shorts`;
    const status: Record<string, unknown> = {
      privacyStatus: PRIVACY[d.privacy ?? 'PUBLIC'], selfDeclaredMadeForKids: !!d.madeForKids, containsSyntheticMedia: !!d.containsSyntheticMedia,
    };
    const parts = ['snippet', 'status'];
    const body: Record<string, unknown> = {
      snippet: { title, description, categoryId: '22', defaultLanguage: d.defaultLanguage || undefined, defaultAudioLanguage: d.defaultAudioLanguage || undefined },
      status,
    };
    if (d.hasPaidProductPlacement) { body.paidProductPlacementDetails = { hasPaidProductPlacement: true }; parts.push('paidProductPlacementDetails'); }
    const video = await uploadVideo(ctx, a, m, body, parts.join(','));
    // Thumbnails can be set while YouTube is still processing; a failure here must not lose the upload.
    let thumbnailError: string | undefined;
    if (thumb) {
      try { await setThumbnail(ctx, a, video.id, await thumb.read(), thumb.mime); } catch (e) {
        thumbnailError = (e as Error).message;
        ctx.log.warn({ postId: input.postId, videoId: video.id, err: thumbnailError }, 'youtube thumbnail not set');
      }
    }
    return {
      status: 'PROCESSING', pendingRef: JSON.stringify({ videoId: video.id, startedAt: ctx.now().getTime() }), pollAfterMs: 20_000,
      externalData: { videoId: video.id, uploadStatus: video.status?.uploadStatus, privacyStatus: video.status?.privacyStatus, requestedPrivacy: status.privacyStatus, thumbnailError },
    };
  },

  async poll(ctx, input, pendingRef): Promise<PublishResult> {
    const a = input.account;
    const ref = JSON.parse(pendingRef) as { videoId: string; startedAt: number };
    const v = (await api(ctx, a, '/videos', { query: { part: 'status,processingDetails', id: ref.videoId } })).items?.[0];
    if (!v) throw new NetworkError('NOT_FOUND', 'YouTube no longer lists the uploaded video; it may have been removed in YouTube Studio.', { httpStatus: 404 });
    const st = v.status ?? {};
    if (st.uploadStatus === 'failed') throw new NetworkError('MEDIA_INVALID', `YouTube could not process the video (failureReason: ${st.failureReason ?? 'unknown'}).`, { meta: st });
    if (st.uploadStatus === 'rejected') {
      throw new NetworkError(st.rejectionReason === 'duplicate' ? 'DUPLICATE' : 'CONTENT_REJECTED', `YouTube rejected the video (rejectionReason: ${st.rejectionReason ?? 'unknown'}).`, { meta: st });
    }
    if (st.uploadStatus === 'deleted') throw new NetworkError('NOT_FOUND', 'The uploaded video was deleted before processing finished.', { meta: st });
    if (st.uploadStatus !== 'processed') {
      if (ctx.now().getTime() - ref.startedAt > 6 * 3600_000) throw new NetworkError('MEDIA_INVALID', 'YouTube did not finish processing the video within 6 hours.', { retryability: 'retryable' });
      return { status: 'PROCESSING', pendingRef, pollAfterMs: 30_000, externalData: { videoId: ref.videoId, uploadStatus: st.uploadStatus } };
    }
    return {
      status: 'POSTED', externalPostId: ref.videoId, externalVideoId: ref.videoId, permalink: permalinkFor(ref.videoId, input.data.type ?? 'SHORT'),
      externalData: { videoId: ref.videoId, privacyStatus: st.privacyStatus, uploadStatus: st.uploadStatus },
    };
  },

  async recentPosts(ctx, a, since) {
    const r = await api(ctx, a, '/playlistItems', { query: { part: 'snippet,contentDetails', playlistId: uploadsPlaylist(channelOf(a)), maxResults: 20 } });
    return (r.items ?? [])
      .map((i: any) => ({ externalId: i.contentDetails?.videoId ?? i.snippet?.resourceId?.videoId, text: i.snippet?.title ?? null, createdAt: i.contentDetails?.videoPublishedAt ?? i.snippet?.publishedAt ? new Date(i.contentDetails?.videoPublishedAt ?? i.snippet?.publishedAt) : null }))
      .filter((p: any) => p.externalId && (!p.createdAt || p.createdAt >= since))
      .map((p: any) => ({ ...p, permalink: watchUrl(p.externalId) }));
  },

  async deletePost(ctx, a, id) {
    await api(ctx, a, '/videos', { method: 'DELETE', query: { id } });
  },

  async editPost(ctx, a, id, data) {
    await updateVideo(ctx, a, id, data);
  },

  async comment(ctx, input) {
    const a = input.account;
    // YouTube replies are one level deep: replying to a reply (id "<top>.<n>") replies to the top comment.
    const top = input.parentExternalId?.split('.')[0];
    const r = top
      ? await api(ctx, a, '/comments', { method: 'POST', query: { part: 'snippet' }, json: { snippet: { parentId: top, textOriginal: input.text } } })
      : await api(ctx, a, '/commentThreads', { method: 'POST', query: { part: 'snippet' }, json: { snippet: { videoId: input.externalPostId, topLevelComment: { snippet: { textOriginal: input.text } } } } });
    return { externalId: r.id, permalink: `${watchUrl(input.externalPostId)}&lc=${r.id}` };
  },

  async editComment(ctx, a, id, text) {
    await api(ctx, a, '/comments', { method: 'PUT', query: { part: 'snippet' }, json: { id, snippet: { textOriginal: text } } });
  },

  async deleteComment(ctx, a, id) {
    await api(ctx, a, '/comments', { method: 'DELETE', query: { id } });
  },

  async importComments(ctx, a, input) {
    const r = await api(ctx, a, '/commentThreads', {
      query: { part: 'snippet,replies', videoId: input.externalPostId, maxResults: Math.max(1, Math.min(100, input.limit)), pageToken: input.cursor ?? undefined, order: 'time', textFormat: 'plainText' },
    });
    const items: FetchedCommentInput[] = [];
    for (const t of r.items ?? []) {
      items.push(...parseCommentThread(t, input.externalPostId));
      const total = t.snippet?.totalReplyCount ?? 0;
      let replies: any[] = t.replies?.comments ?? [];
      // commentThreads embeds at most five replies; fetch the rest.
      if (total > replies.length) replies = (await api(ctx, a, '/comments', { query: { part: 'snippet', parentId: t.id, maxResults: 100, textFormat: 'plainText' } })).items ?? replies;
      for (const c of replies) items.push({ ...parseCommentThread({ snippet: { topLevelComment: c } }, input.externalPostId)[0], externalParentId: t.id });
    }
    return { items, nextCursor: r.nextPageToken ?? null };
  },

  async commentAction(ctx, a, comment, action) {
    const status = { HIDE: 'heldForReview', UNHIDE: 'published', APPROVE: 'published', REJECT: 'rejected' }[action as 'HIDE'];
    if (action === 'DELETE') return void (await youtube.deleteComment!(ctx, a, comment.externalId));
    if (!status) throw new NetworkError('NOT_SUPPORTED', `YouTube does not support ${action} on comments through the API.`);
    await api(ctx, a, '/comments/setModerationStatus', { method: 'POST', query: { id: comment.externalId, moderationStatus: status } });
  },

  async accountAnalytics(ctx, a): Promise<AccountMetrics> {
    const c = (await api(ctx, a, '/channels', { query: { part: 'statistics', id: channelOf(a) } })).items?.[0];
    if (!c) throw new NetworkError('NOT_FOUND', 'The YouTube channel was not found.', { httpStatus: 404 });
    const now = ctx.now();
    const rep = await report(ctx, a, { startDate: ymd(new Date(now.getTime() - 28 * 86400_000)), endDate: ymd(new Date(now.getTime() - 86400_000)), metrics: 'views,likes,comments,shares,subscribersGained,estimatedMinutesWatched' });
    const s = c.statistics ?? {};
    return {
      followers: s.hiddenSubscriberCount ? undefined : num(s.subscriberCount), postCount: num(s.videoCount), views: num(s.viewCount),
      likes: rep?.likes, comments: rep?.comments, raw: { statistics: s, last28Days: rep },
    };
  },

  async postAnalytics(ctx, a, id): Promise<PostMetrics> {
    const v = (await api(ctx, a, '/videos', { query: { part: 'statistics', id } })).items?.[0];
    if (!v) throw new NetworkError('NOT_FOUND', `YouTube video ${id} was not found.`, { httpStatus: 404 });
    const base = metrics(v);
    const rep = await report(ctx, a, { startDate: '2005-02-14', endDate: ymd(ctx.now()), metrics: 'views,likes,comments,shares,estimatedMinutesWatched,averageViewDuration', filters: `video==${id}` });
    return rep ? { ...base, shares: rep.shares, raw: { statistics: v.statistics, analytics: rep } } : base;
  },

  async importHistory(ctx, a, input) {
    const r = await api(ctx, a, '/playlistItems', { query: { part: 'snippet,contentDetails', playlistId: uploadsPlaylist(channelOf(a)), maxResults: Math.max(1, Math.min(50, input.limit)), pageToken: input.cursor ?? undefined } });
    const ids: string[] = (r.items ?? []).map((i: any) => i.contentDetails?.videoId).filter(Boolean);
    const stats = new Map<string, any>();
    if (ids.length) for (const v of (await api(ctx, a, '/videos', { query: { part: 'statistics', id: ids.join(',') } })).items ?? []) stats.set(v.id, v);
    const items: HistoryPost[] = (r.items ?? []).filter((i: any) => i.contentDetails?.videoId).map((i: any) => {
      const id = i.contentDetails.videoId;
      const th = i.snippet?.thumbnails ?? {};
      return {
        externalId: id, title: i.snippet?.title ?? null, permalink: watchUrl(id), publishedAt: i.contentDetails.videoPublishedAt ? new Date(i.contentDetails.videoPublishedAt) : i.snippet?.publishedAt ? new Date(i.snippet.publishedAt) : null,
        type: 'VIDEO', thumbnail: th.high?.url ?? th.medium?.url ?? th.default?.url ?? null, smallThumbnail: th.default?.url ?? th.medium?.url ?? null,
        metrics: stats.has(id) ? metrics(stats.get(id)) : null,
      } as HistoryPost;
    });
    return { items, nextCursor: r.nextPageToken ?? null };
  },

  misc: ((): Record<string, MiscHandler> => {
    const playlistBody = (b: Record<string, any>) => ({ snippet: { title: b.title, description: b.description }, status: { privacyStatus: b.privacyStatus ?? 'private' } });
    return {
      'misc.youtube.setThumbnail': async (ctx, a, { body, lookup }) => {
        const p = await lookup.post(body.postId);
        let bytesIn: Buffer; let mime: string;
        if (/^https?:\/\//i.test(String(body.url))) {
          const res = await ctx.fetch(String(body.url)).catch((e: Error) => { throw new NetworkError('MEDIA_INVALID', `Could not download the thumbnail: ${e.message}`); });
          if (!res.ok) throw new NetworkError('MEDIA_INVALID', `Could not download the thumbnail (HTTP ${res.status}).`, { httpStatus: res.status });
          bytesIn = Buffer.from(await res.arrayBuffer()); mime = (res.headers.get('content-type') ?? 'image/jpeg').split(';')[0];
        } else {
          const up = await lookup.upload(String(body.url)); bytesIn = await up.read(); mime = up.mime;
        }
        return setThumbnail(ctx, a, p.externalVideoId ?? p.externalPostId, bytesIn, mime);
      },
      'misc.youtube.getChannelPlaylist': (ctx, a, { query }) => api(ctx, a, '/playlists', { query: { part: 'snippet,status,contentDetails', mine: 'true', maxResults: query.maxResults ?? 25 } }),
      'misc.youtube.createNewChannelPlaylist': (ctx, a, { body }) => api(ctx, a, '/playlists', { method: 'POST', query: { part: 'snippet,status' }, json: playlistBody(body) }),
      'misc.youtube.updateChannelPlaylist': (ctx, a, { body }) => api(ctx, a, '/playlists', { method: 'PUT', query: { part: 'snippet,status' }, json: { id: body.playlistId, ...playlistBody(body) } }),
      'misc.youtube.deleteChannelPlaylist': async (ctx, a, { params }) => { await api(ctx, a, '/playlists', { method: 'DELETE', query: { id: params.playlistId } }); return true; },
      'misc.youtube.addVideoToPlaylist': async (ctx, a, { body, lookup }) => {
        const p = await lookup.post(body.postId);
        return api(ctx, a, '/playlistItems', {
          method: 'POST', query: { part: 'snippet,contentDetails' },
          json: { snippet: { playlistId: body.playlistId, position: body.position, resourceId: { kind: 'youtube#video', videoId: p.externalVideoId ?? p.externalPostId } } },
        });
      },
      'misc.youtube.getVideosFromPlaylist': (ctx, a, { query }) => api(ctx, a, '/playlistItems', { query: { part: 'snippet,contentDetails', playlistId: query.playlistId, maxResults: query.maxResults ?? 25 } }),
      'misc.youtube.deleteVideoFromPlaylist': async (ctx, a, { params }) => { await api(ctx, a, '/playlistItems', { method: 'DELETE', query: { id: params.playlistItemId } }); return true; },
      'misc.youtube.editVideo': async (ctx, a, { body, lookup }) => {
        const p = await lookup.post(body.postId);
        const id = p.externalVideoId ?? p.externalPostId;
        await updateVideo(ctx, a, id, body);
        return { success: true, permalink: p.permalink ?? permalinkFor(id, p.data?.type) };
      },
      'misc.youtube.deleteVideo': async (ctx, a, { body, lookup }) => {
        const p = await lookup.post(body.postId);
        await youtube.deletePost!(ctx, a, p.externalVideoId ?? p.externalPostId);
        return { success: true };
      },
      'misc.youtube.editComment': async (ctx, a, { body, lookup }) => {
        const c = await lookup.comment(body.commentId);
        await youtube.editComment!(ctx, a, c.externalId, body.text);
        return { success: true, permalink: c.externalPostId ? `${watchUrl(c.externalPostId)}&lc=${c.externalId}` : null };
      },
      'misc.youtube.deleteComment': async (ctx, a, { body, lookup }) => {
        const c = await lookup.comment(body.commentId);
        await youtube.deleteComment!(ctx, a, c.externalId);
        return { success: true };
      },
      'misc.youtube.getVideoCategories': (ctx, a, { query }) => api(ctx, a, '/videoCategories', { query: { part: 'snippet', regionCode: query.regionCode ?? 'US' } }),
      'misc.youtube.getRegions': (ctx, a) => api(ctx, a, '/i18nRegions', { query: { part: 'snippet' } }),
    };
  })(),
};
