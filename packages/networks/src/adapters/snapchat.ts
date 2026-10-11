/**
 * Snapchat — the Snap Public Profile API (publishing Stories, Spotlight and Saved Stories as a
 * public profile).
 *
 * !! Written from memory of Snap's Marketing API conventions, which the Public Profile API shares
 * !! (OAuth at accounts.snapchat.com, `request_status` envelopes, multipart-upload-v2 for media).
 * !! The Public Profile endpoints and field names below are NOT verified against current docs —
 * !! every guess is marked UNVERIFIED. Re-check each one before the first live connection
 * !! (https://developers.snap.com/ → Public Profile API), then drop the markers.
 *
 *   OAuth 2.0     https://accounts.snapchat.com/accounts/oauth2/auth → POST
 *                 https://accounts.snapchat.com/login/oauth2/access_token (client_id + client_secret in
 *                 the form). Access tokens last 30 minutes; refresh_token grant renews them.
 *                 Scope: snapchat-profile-api (UNVERIFIED name). PKCE is sent too; harmless if ignored.
 *   Identity      GET /v1/me → organization; GET /v1/organizations/{id}/public_profiles → the profiles
 *                 the member manages = optional channels (UNVERIFIED path).
 *   Media         POST /v1/public_profiles/{profile}/media {media:[{name,type}]} → media id;
 *                 POST /v1/media/{id}/multipart-upload-v2?action=INIT|ADD|FINALIZE (INIT returns
 *                 add_path/finalize_path/upload_id; ADD is multipart with part_number; FINALIZE closes);
 *                 GET /v1/media/{id} until media_status = READY. (UNVERIFIED for public profiles; this is
 *                 the Marketing API flow.)
 *   Publishing    POST /v1/public_profiles/{profile}/{stories|spotlights|saved_stories} with media ids
 *                 (UNVERIFIED). A Story is one Snap per media item; Spotlight is one video; a Saved
 *                 Story groups its items under a title.
 *   Errors        { request_status: 'ERROR', debug_message, display_message, error_code } for API calls,
 *                 { error, error_description } for OAuth.
 */
import { NetworkError } from '../lib/errors.js';
import { request, resetFrom, sleep, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { charCount, checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type { AccountRuntime, Channel, Issue, MediaRef, NetworkAdapter, NetworkContext, PublishInput, PublishResult, TokenSet } from '../types.js';

const AUTH_URL = 'https://accounts.snapchat.com/accounts/oauth2/auth';
const TOKEN_URL = 'https://accounts.snapchat.com/login/oauth2/access_token';
/** UNVERIFIED host: the Marketing API lives on adsapi.snapchat.com; the Public Profile API is assumed to sit on businessapi. */
const HOST = 'https://businessapi.snapchat.com';
const API = `${HOST}/v1`;
const SCOPES = ['snapchat-profile-api'];
const TYPES = ['STORY', 'SPOTLIGHT', 'SAVED_STORY'] as const;
type SnapType = (typeof TYPES)[number];
const STORY_HOURS: Record<string, number> = { ONE_DAY: 24, TWO_DAYS: 48, THREE_DAYS: 72, ONE_WEEK: 168 };
const PART = 8 * MB; // UNVERIFIED: multipart-upload-v2 wants parts of at least 5 MB except the last.
const SPOTLIGHT_DESC_MAX = 160;
const TITLE_MAX = 45; // UNVERIFIED

// ───────────────────────────── errors ─────────────────────────────

function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const msg: string = body?.display_message ?? body?.debug_message ?? body?.error_description ?? (typeof body?.error === 'string' ? body.error : undefined) ?? `Snapchat returned HTTP ${status}`;
  const opts = { httpStatus: status, meta: body };
  if (status === 401 || ['invalid_grant', 'invalid_token', 'invalid_client'].includes(body?.error) || /E1001|unauthorized|token.*(expired|invalid)/i.test(`${body?.error_code ?? ''} ${msg}`)) return new NetworkError('TOKEN_INVALID', msg, opts);
  if (status === 429) return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: resetFrom(res) });
  if (status === 403) return new NetworkError('PERMISSION', msg, opts);
  if (status === 404) return new NetworkError('NOT_FOUND', msg, opts);
  if (status === 409 || /already (exists|published)|duplicate/i.test(msg)) return new NetworkError('DUPLICATE', msg, opts);
  if (status === 400 || status === 422) {
    if (/media|video|image|duration|resolution|aspect|codec|format|file/i.test(msg)) return new NetworkError('MEDIA_INVALID', msg, opts);
    if (/guideline|policy|prohibited|not allowed/i.test(msg)) return new NetworkError('CONTENT_REJECTED', msg, opts);
    return new NetworkError('VALIDATION', msg, opts);
  }
  return undefined;
}

const api = <T = any>(ctx: NetworkContext, a: { token: TokenSet }, path: string, opts: RequestOptions = {}) =>
  request<T>(ctx, path.startsWith('http') ? path : path.startsWith('/v1/') ? `${HOST}${path}` : `${API}${path}`, { bearer: a.token.accessToken, mapError, ...opts });

// ───────────────────────────── helpers ─────────────────────────────

const profileId = (a: AccountRuntime): string => {
  const id = a.channelId ?? a.externalId;
  if (!id) throw new NetworkError('VALIDATION', 'This Snapchat account has no public profile; reconnect it.');
  return id;
};

const toChannel = (p: any): Channel => ({
  id: String(p.id), name: p.display_name ?? p.name ?? null, username: p.snap_user_name ?? p.username ?? null, avatarUrl: p.logo_url ?? p.logo_urls?.[0] ?? null,
  metadata: { organizationId: p.organization_id ?? null },
});

/** Snap list responses wrap each row: { sub_request_status, public_profile: {…} }. */
async function profilesOf(ctx: NetworkContext, token: TokenSet): Promise<{ me: any; channels: Channel[] }> {
  const me = (await api(ctx, { token }, '/me')).me ?? {};
  const orgId = me.organization_id;
  if (!orgId) return { me, channels: [] };
  const r = await api(ctx, { token }, `/organizations/${orgId}/public_profiles`);
  return { me, channels: (r.public_profiles ?? []).map((x: any) => toChannel({ organization_id: orgId, ...(x.public_profile ?? x) })).filter((c: Channel) => c.id) };
}

async function tokenRequest(ctx: NetworkContext, form: Record<string, string | undefined>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, TOKEN_URL, { form: { ...form, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret }, mapError });
  return {
    accessToken: tok.access_token, refreshToken: tok.refresh_token ?? prev?.refreshToken ?? null, expiresAt: expiresIn(tok.expires_in ?? 1800, ctx.now()),
    scopes: String(tok.scope ?? SCOPES.join(' ')).split(/[\s,]+/).filter(Boolean),
  };
}

const kindOf = (m: MediaRef) => (m.type === 'video' ? 'VIDEO' : 'IMAGE');

/** Create the media object, upload it in parts, finalize. Returns the media id. UNVERIFIED for public profiles. */
async function uploadMedia(ctx: NetworkContext, a: AccountRuntime, m: MediaRef): Promise<string> {
  const created = await api(ctx, a, `/public_profiles/${profileId(a)}/media`, { json: { media: [{ name: `${m.id}.${m.ext}`, type: kindOf(m) }] } });
  const mediaId: string | undefined = created.media?.[0]?.media?.id ?? created.media?.[0]?.id;
  if (!mediaId) throw new NetworkError('UNKNOWN', 'Snapchat did not return a media id.', { meta: created });
  const parts = Math.max(1, Math.ceil(m.fileSize / PART));
  const init = await api(ctx, a, `/media/${mediaId}/multipart-upload-v2`, { method: 'POST', query: { action: 'INIT' }, json: { file_name: `${m.id}.${m.ext}`, file_size: m.fileSize, number_of_parts: parts } });
  const { upload_id: uploadId, add_path: addPath, finalize_path: finalizePath } = init;
  if (!uploadId || !addPath || !finalizePath) throw new NetworkError('UNKNOWN', 'Snapchat did not return an upload session.', { meta: init });
  for (let i = 0; i < parts; i++) {
    const form = new FormData();
    form.set('upload_id', uploadId);
    form.set('part_number', String(i + 1));
    form.set('content', new Blob([new Uint8Array(await m.readRange(i * PART, Math.min((i + 1) * PART, m.fileSize)))], { type: 'application/octet-stream' }), `${m.id}.part${i + 1}`);
    await api(ctx, a, addPath, { method: 'POST', body: form, timeoutMs: 600_000 });
  }
  await api(ctx, a, finalizePath, { method: 'POST', json: { upload_id: uploadId } });
  return mediaId;
}

/** READY ids only when every media object finished processing. FAILED throws. */
async function mediaReady(ctx: NetworkContext, a: AccountRuntime, ids: string[]): Promise<boolean> {
  for (const id of ids) {
    const r = await api(ctx, a, `/media/${id}`);
    const st: string = r.media?.[0]?.media?.media_status ?? r.media?.media_status ?? 'PENDING_UPLOAD';
    if (st === 'FAILED' || st === 'ERROR') throw new NetworkError('MEDIA_INVALID', r.media?.[0]?.media?.error_message ?? 'Snapchat could not process the media.', { meta: r });
    if (st !== 'READY') return false;
  }
  return true;
}

const idOf = (r: any): string | undefined => {
  for (const k of ['story', 'spotlight', 'saved_story', 'stories', 'spotlights', 'saved_stories']) {
    const v = r?.[k]; const row = Array.isArray(v) ? v[0] : v;
    const id = row?.[k.replace(/ies$/, 'y').replace(/s$/, '')]?.id ?? row?.id;
    if (id) return String(id);
  }
  return undefined;
};

async function createPosts(ctx: NetworkContext, input: PublishInput, mediaIds: string[]): Promise<PublishResult> {
  const a = input.account;
  const d = input.data;
  const type: SnapType = (d.type ?? 'STORY') as SnapType;
  const pid = profileId(a);
  const ids: string[] = [];
  if (type === 'STORY') {
    for (const mediaId of mediaIds) {
      const r = await api(ctx, a, `/public_profiles/${pid}/stories`, { json: { media_id: mediaId, ...(d.storyDuration ? { duration_hours: STORY_HOURS[d.storyDuration] } : {}), ...(d.text ? { text: d.text } : {}) } });
      const id = idOf(r); if (!id) throw new NetworkError('UNKNOWN', 'Snapchat did not return a story id.', { meta: r });
      ids.push(id);
    }
  } else if (type === 'SPOTLIGHT') {
    const r = await api(ctx, a, `/public_profiles/${pid}/spotlights`, {
      json: { media_id: mediaIds[0], description: d.description ?? d.text ?? '', locale: d.locale ?? undefined, skip_save_to_profile: !!d.skipSaveToProfile },
    });
    const id = idOf(r); if (!id) throw new NetworkError('UNKNOWN', 'Snapchat did not return a spotlight id.', { meta: r });
    ids.push(id);
  } else {
    const r = await api(ctx, a, `/public_profiles/${pid}/saved_stories`, { json: { title: d.title, media_ids: mediaIds } });
    const id = idOf(r); if (!id) throw new NetworkError('UNKNOWN', 'Snapchat did not return a saved story id.', { meta: r });
    ids.push(id);
  }
  const permalink = type === 'SPOTLIGHT' ? `https://www.snapchat.com/spotlight/${ids[0]}` : null; // UNVERIFIED shape
  return {
    status: 'POSTED', externalPostId: ids[0], permalink,
    externalData: {
      id: ids[0], mediaId: mediaIds[0], mediaIds, type, profileId: pid, sourceUploadId: input.media[0]?.id ?? null, sourceUploadIds: input.media.map(m => m.id),
      mediaUploadedAt: ctx.now().toISOString(), permalink, status: 'PUBLISHED',
    },
  };
}

// ───────────────────────────── the adapter ─────────────────────────────

export const snapchat: NetworkAdapter = {
  type: 'SNAPCHAT',
  displayName: 'Snapchat',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'optional', postTypes: [...TYPES],
    comments: false, firstComment: false, editPost: false, deletePost: false, editComment: false, deleteComment: false,
    commentImport: false, commentActions: [],
    accountAnalytics: false, postAnalytics: false, historyImport: false, messaging: false, metered: false,
  },
  limits: {
    textMax: SPOTLIGHT_DESC_MAX,
    titleMax: TITLE_MAX,
    commentMax: null,
    media: {
      maxItems: 10, // UNVERIFIED
      // UNVERIFIED limits; Snap wants vertical 9:16 media (1080×1920) and recommends it for every type.
      image: { mimes: ['image/jpeg', 'image/png'], maxBytes: 20 * MB },
      video: { mimes: ['video/mp4', 'video/quicktime'], maxBytes: GB, minSeconds: 5, maxSeconds: 60, aspect: [9, 16] },
    },
  },
  errorReference: [
    { code: '401', message: 'Unauthorized / invalid_token', meaning: 'The 30-minute access token expired and the refresh token is gone, or the member revoked access in Snapchat.', fix: 'Reconnect the Snapchat account.' },
    { code: '403', message: 'The caller does not have access to this public profile', meaning: 'The member is not an admin/editor of the public profile, or the app lacks the Public Profile API scope/approval.', fix: 'Pick a profile the member can post to, and check the app is approved for the Public Profile API.' },
    { code: '429', message: 'Rate limit exceeded', meaning: 'Too many API calls for this app or profile.', fix: 'Retry after the Retry-After delay.' },
    { code: 'media_invalid', message: 'Media does not meet requirements', meaning: 'Wrong aspect ratio, resolution, codec or duration (Spotlight videos are 5–60 s, vertical 9:16).', fix: 'Re-encode as 1080×1920 H.264 MP4 within the duration limits.' },
    { code: 'media_not_ready', message: 'media_status is not READY', meaning: 'Snapchat is still processing the upload; posting before READY is refused.', fix: 'Nothing: Siar waits and polls until the media is READY.' },
    { code: 'content_policy', message: 'Content violates Snap Community Guidelines', meaning: 'Snapchat moderation refused the Snap.', fix: 'Edit the content and post again.' },
    { code: 'invalid_grant', message: 'invalid_grant', meaning: 'The authorization code was used, expired, or the redirect URI differs from the registered one.', fix: 'Start the connection again.' },
    { code: 'spotlight_requires_one_video', message: 'Spotlight needs exactly one video', meaning: 'Spotlight accepts a single video; images and multiple items are refused.', fix: 'Attach one video, or use STORY.' },
  ],

  async authorize(ctx, input) {
    return {
      url: authorizeUrl(AUTH_URL, {
        client_id: ctx.credentials.clientId, redirect_uri: ctx.redirectUri, response_type: 'code', scope: SCOPES.join(' '), state: input.state,
        code_challenge: input.codeChallenge, code_challenge_method: 'S256',
      }),
    };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri, code_verifier: input.codeVerifier });
    const { me, channels } = await profilesOf(ctx, token);
    const first = channels[0];
    return {
      token,
      profile: {
        externalId: first?.id ?? String(me.id), providerPageId: String(me.id), username: first?.username ?? null, displayName: first?.name ?? me.display_name ?? null, avatarUrl: first?.avatarUrl ?? null,
        userId: String(me.id), userDisplayName: me.display_name ?? null, userEmail: me.email ?? null, channels,
      },
    };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No refresh token stored for this Snapchat account; reconnect it.');
    return tokenRequest(ctx, { grant_type: 'refresh_token', refresh_token: a.token.refreshToken }, a.token);
  },

  async refreshProfile(ctx, a) {
    const { channels } = await profilesOf(ctx, a.token);
    const current = channels.find(c => c.id === (a.channelId ?? a.externalId)) ?? channels[0];
    return { channels, username: current?.username ?? null, displayName: current?.name ?? null, avatarUrl: current?.avatarUrl ?? null };
  },

  async listChannels(ctx, a) {
    return (await profilesOf(ctx, a.token)).channels;
  },

  async checkConnection(ctx, a) {
    try { await api(ctx, a, '/me'); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const type = data.type ?? 'STORY';
    if (!TYPES.includes(type)) issues.push({ code: 'invalid', message: `type must be one of ${TYPES.join(', ')}.`, path: ['type'] });
    checkMedia(issues, media, snapchat.limits, ['uploadIds'], { required: true });
    if (type === 'SPOTLIGHT') {
      if (media.length !== 1 || media[0]?.type !== 'video') issues.push({ code: 'type', message: 'Spotlight needs exactly one video.', path: ['uploadIds'] });
      checkText(issues, data.description ?? data.text, SPOTLIGHT_DESC_MAX, ['description']);
    }
    if (type === 'SAVED_STORY') {
      if (!data.title || !String(data.title).trim()) issues.push({ code: 'required', message: 'A Saved Story needs a title.', path: ['title'] });
      else if (charCount(String(data.title)) > TITLE_MAX) issues.push({ code: 'too_long', message: `Title is limited to ${TITLE_MAX} characters.`, path: ['title'] });
    }
    if (type !== 'STORY' && data.storyDuration) issues.push({ code: 'ignored', message: 'storyDuration only applies to STORY.', path: ['storyDuration'] });
    if (data.storyDuration && !STORY_HOURS[data.storyDuration]) issues.push({ code: 'invalid', message: `storyDuration must be one of ${Object.keys(STORY_HOURS).join(', ')}.`, path: ['storyDuration'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    if (!input.media.length) throw new NetworkError('VALIDATION', 'Snapchat posts need media.');
    const mediaIds: string[] = [];
    for (const m of input.media) mediaIds.push(await uploadMedia(ctx, a, m));
    for (let i = 0; i < 12; i++) {
      if (await mediaReady(ctx, a, mediaIds)) return createPosts(ctx, input, mediaIds);
      await sleep(ctx.mode === 'mock' ? 10 : 2500);
    }
    return { status: 'PROCESSING', pendingRef: mediaIds.join(','), pollAfterMs: 15_000, externalData: { mediaIds, status: 'MEDIA_PROCESSING', profileId: profileId(a) } };
  },

  async poll(ctx, input, pendingRef) {
    const mediaIds = pendingRef.split(',').filter(Boolean);
    if (!(await mediaReady(ctx, input.account, mediaIds))) return { status: 'PROCESSING', pendingRef, pollAfterMs: 15_000, externalData: { mediaIds, status: 'MEDIA_PROCESSING' } };
    return createPosts(ctx, input, mediaIds);
  },
};
