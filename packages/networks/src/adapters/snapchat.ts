/**
 * Snapchat — the Snap Public Profile API (publishing Stories, Spotlight and Saved Stories as a
 * public profile). Written against the current docs:
 *   https://developers.snap.com/marketing-api/Public-Profile-API/GetStarted
 *   https://developers.snap.com/marketing-api/Public-Profile-API/Profiles
 *   https://developers.snap.com/marketing-api/Public-Profile-API/ProfileAssetManagement
 *   https://developers.snap.com/marketing-api/Ads-API/authentication   (the OAuth endpoints are shared)
 *
 *   Access        Allowlist only: the OAuth app must be created in Ads Manager → Business Dashboard →
 *                 Business Details (Developer Portal client ids do not work), and its client id sent to a
 *                 Snap contact. Until then every call answers 403 AUTHORIZATION_PERMISSION_DENIED.
 *   OAuth 2.0     GET https://accounts.snapchat.com/login/oauth2/authorize (client_id, redirect_uri,
 *                 response_type=code, scope, state) → POST https://accounts.snapchat.com/login/oauth2/access_token
 *                 (form: grant_type, client_id, client_secret, code + redirect_uri | refresh_token).
 *                 Scope `snapchat-profile-api`. Access tokens last 3600 s; the refresh_token grant renews them.
 *                 PKCE is not documented, so it is not sent.
 *   API host      https://businessapi.snapchat.com, `Authorization: Bearer`.
 *   Identity      GET /v1/public_profiles/my_profile → { public_profile }; the channels are
 *                 GET /v1/organizations/{organization_id}/public_profiles (paged with cursor).
 *   Media         POST /v1/public_profiles/{profile}/media { type: VIDEO|IMAGE, name, key, iv } →
 *                 { media_id, add_path, finalize_path }. The file is AES-256-CBC encrypted (key 32 B, iv 16 B,
 *                 both base64 here, generated per upload), split into ≤ 32 MB chunks and sent as multipart to
 *                 {host}{add_path} with action=ADD, part_number 1–35 and `file`; then action=FINALIZE.
 *                 There is no INIT step and no media status to poll. A media object lives 24 h.
 *   Story         POST /v1/public_profiles/{profile}/stories { media_id, customized_ttl: { ttl } } →
 *                 { request_status } — NO story id. One Story per media item.
 *   Spotlight     POST …/spotlights { media_id, description ≤ 160, locale } → { spotlight_id }, status
 *                 SUBMITTED → LIVE | REJECTED (GET …/spotlights/{id}).
 *   Saved Story   POST …/saved_stories { saved_stories: [{ title ≤ 45, snap_sources: [{ media_id }] }] } →
 *                 saved_stories[].saved_story.id. One saved story per request, ≤ 5 minutes in total.
 *   Errors        { request_status: 'ERROR', debug_message, display_message, error_code } for API calls,
 *                 { error, error_description } for OAuth.
 *
 * Not confirmed by the docs (kept conservative, marked below): image format/size rules, whether Snap
 * needs a moment after FINALIZE before the media can be posted, the HTTP status behind
 * MEDIA_POSTING_ALREADY_IN_PROGRESS, the public Spotlight URL shape, and the rate limits.
 */
import { createCipheriv, randomBytes } from 'node:crypto';
import { NetworkError } from '../lib/errors.js';
import { request, resetFrom, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { charCount, checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type { AccountRuntime, Channel, Issue, MediaRef, NetworkAdapter, NetworkContext, PublishInput, PublishResult, TokenSet } from '../types.js';

const AUTH_URL = 'https://accounts.snapchat.com/login/oauth2/authorize';
const TOKEN_URL = 'https://accounts.snapchat.com/login/oauth2/access_token';
const HOST = 'https://businessapi.snapchat.com';
const SCOPES = ['snapchat-profile-api'];
const TYPES = ['STORY', 'SPOTLIGHT', 'SAVED_STORY'] as const;
type SnapType = (typeof TYPES)[number];
const STORY_TTLS = ['ONE_DAY', 'TWO_DAYS', 'THREE_DAYS', 'ONE_WEEK'];
const PART = 32 * MB; // docs: chunks up to 32 MB (`split -b 32m`)
const MAX_PARTS = 35; // docs: part_number 1–35
const READ = 8 * MB;
const SPOTLIGHT_DESC_MAX = 160;
const TITLE_MAX = 45;
const MIN_WIDTH = 540;
const MIN_HEIGHT = 960;
const SAVED_STORY_MAX_SECONDS = 300;
const LOCALE = /^[a-z]{2,3}_[A-Z]{2}$/;
const DEFAULT_LOCALE = 'en_US';
const ALREADY_IN_PROGRESS = 'MEDIA_POSTING_ALREADY_IN_PROGRESS';

// ───────────────────────────── errors ─────────────────────────────

function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const code: string = String(body?.error_code ?? '');
  const msg: string = body?.display_message ?? body?.debug_message ?? body?.error_description ?? (typeof body?.error === 'string' ? body.error : undefined) ?? `Snapchat returned HTTP ${status}`;
  const opts = { httpStatus: status, meta: body };
  if (code === ALREADY_IN_PROGRESS) return new NetworkError('DUPLICATE', msg, { ...opts, retryability: 'non_retryable' });
  if (code === 'MEDIA_EXPIRED') return new NetworkError('MEDIA_INVALID', msg, { ...opts, retryability: 'retryable' });
  if (status === 401 || ['invalid_grant', 'invalid_token', 'invalid_client'].includes(body?.error)) return new NetworkError('TOKEN_INVALID', msg, opts);
  if (status === 429) return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: resetFrom(res) });
  if (status === 403 || code === 'AUTHORIZATION_PERMISSION_DENIED') return new NetworkError('PERMISSION', msg, opts);
  if (status === 404) return new NetworkError('NOT_FOUND', msg, opts);
  if (status === 409) return new NetworkError('DUPLICATE', msg, opts);
  if (status === 400 || status === 422) {
    if (/media|video|image|duration|resolution|codec|format|file|decrypt/i.test(`${code} ${msg}`)) return new NetworkError('MEDIA_INVALID', msg, opts);
    if (/guideline|policy|prohibited|not allowed/i.test(msg)) return new NetworkError('CONTENT_REJECTED', msg, opts);
    return new NetworkError('VALIDATION', msg, opts);
  }
  return undefined;
}

/** `path` is the full path from the API root, e.g. `/v1/public_profiles/my_profile`, or the `add_path` Snap returned. */
const api = <T = any>(ctx: NetworkContext, a: { token: TokenSet }, path: string, opts: RequestOptions = {}) =>
  request<T>(ctx, path.startsWith('http') ? path : `${HOST}${path}`, { bearer: a.token.accessToken, mapError, ...opts });

// ───────────────────────────── helpers ─────────────────────────────

const profileId = (a: AccountRuntime): string => {
  const id = a.channelId ?? a.externalId;
  if (!id) throw new NetworkError('VALIDATION', 'This Snapchat account has no public profile; reconnect it.');
  return id;
};

const toChannel = (p: any): Channel => ({
  id: String(p.id), name: p.display_name ?? null, username: p.snap_user_name ?? null,
  avatarUrl: p.logo_urls?.manage_profile_logo_url ?? p.logo_urls?.original_logo_url ?? null,
  metadata: { organizationId: p.organization_id ?? null, profileType: p.profile_type ?? null },
});

/** my_profile is the profile the token's user belongs to; the organisation list is every profile they can post to. */
async function profilesOf(ctx: NetworkContext, token: TokenSet): Promise<{ me: any; channels: Channel[] }> {
  const me = (await api(ctx, { token }, '/v1/public_profiles/my_profile')).public_profile;
  if (!me?.id) throw new NetworkError('UNKNOWN', 'Snapchat did not return a public profile for this token.', { meta: me });
  const rows: any[] = [];
  try {
    let cursor: string | undefined;
    for (let page = 0; page < 20; page++) {
      const r = await api(ctx, { token }, `/v1/organizations/${me.organization_id}/public_profiles`, { query: { cursor } });
      for (const x of r.public_profiles ?? []) if (x.public_profile?.id) rows.push(x.public_profile);
      cursor = r.paging?.next_page_id || undefined;
      if (!cursor) break;
    }
  } catch (e) {
    if (!(e instanceof NetworkError) || (e.code !== 'PERMISSION' && e.code !== 'NOT_FOUND')) throw e;
  }
  const channels = rows.map(toChannel);
  if (!channels.some(c => c.id === String(me.id))) channels.unshift(toChannel(me));
  return { me, channels };
}

async function tokenRequest(ctx: NetworkContext, form: Record<string, string | undefined>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, TOKEN_URL, { form: { ...form, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret }, mapError });
  return {
    accessToken: tok.access_token, refreshToken: tok.refresh_token ?? prev?.refreshToken ?? null, expiresAt: expiresIn(tok.expires_in ?? 3600, ctx.now()),
    scopes: String(tok.scope ?? SCOPES.join(' ')).split(/[\s,]+/).filter(Boolean),
  };
}

/** AES-256-CBC over the whole file, cut into ≤ 32 MB parts as it streams, so a 1 GB video never sits in memory. */
async function* encryptedParts(m: MediaRef, key: Buffer, iv: Buffer): AsyncGenerator<Buffer> {
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let pending = Buffer.alloc(0);
  for (let off = 0; off < m.fileSize; off += READ) {
    pending = Buffer.concat([pending, cipher.update(await m.readRange(off, Math.min(off + READ, m.fileSize)))]);
    while (pending.length >= PART) { yield pending.subarray(0, PART); pending = pending.subarray(PART); }
  }
  pending = Buffer.concat([pending, cipher.final()]);
  while (pending.length > PART) { yield pending.subarray(0, PART); pending = pending.subarray(PART); }
  yield pending;
}

/** Create the media object, upload it encrypted in parts, finalize. Returns the media id (valid for 24 h). */
async function uploadMedia(ctx: NetworkContext, a: AccountRuntime, m: MediaRef): Promise<string> {
  if (Math.ceil((Math.floor(m.fileSize / 16) + 1) * 16 / PART) > MAX_PARTS) throw new NetworkError('MEDIA_INVALID', `The file is too large for Snapchat (up to 1 GB).`);
  const key = randomBytes(32);
  const iv = randomBytes(16);
  const created = await api(ctx, a, `/v1/public_profiles/${profileId(a)}/media`, {
    json: { type: m.type === 'video' ? 'VIDEO' : 'IMAGE', name: `${m.id}.${m.ext}`, key: key.toString('base64'), iv: iv.toString('base64') },
  });
  const { media_id: mediaId, add_path: addPath, finalize_path: finalizePath } = created ?? {};
  if (!mediaId || !addPath || !finalizePath) throw new NetworkError('UNKNOWN', 'Snapchat did not return an upload session.', { meta: created });
  let n = 0;
  for await (const part of encryptedParts(m, key, iv)) {
    n++;
    const form = new FormData();
    form.set('action', 'ADD');
    form.set('part_number', String(n));
    form.set('file', new Blob([new Uint8Array(part)], { type: 'application/octet-stream' }), `${m.id}.enc.part${n}`);
    await api(ctx, a, addPath, { method: 'POST', body: form, timeoutMs: 600_000 });
  }
  const fin = new FormData();
  fin.set('action', 'FINALIZE');
  await api(ctx, a, finalizePath, { method: 'POST', body: fin, timeoutMs: 120_000 });
  return mediaId;
}

/**
 * The posting call. Snap answers with no id for Stories, so a call whose outcome we cannot see
 * (timeout, 5xx, or a failure after earlier Snaps already went out) must never become an automatic
 * retry: that would post the same Snap twice. Those are reported as UNKNOWN.
 */
async function postOnce(ctx: NetworkContext, a: AccountRuntime, path: string, json: unknown, done = 0, total = 1): Promise<{ body: any; alreadyInProgress: boolean }> {
  try {
    return { body: await api(ctx, a, path, { json }), alreadyInProgress: false };
  } catch (e) {
    if (!(e instanceof NetworkError)) throw e;
    if ((e.meta as any)?.error_code === ALREADY_IN_PROGRESS) return { body: null, alreadyInProgress: true };
    if (e.code === 'TOKEN_INVALID') throw e;
    if (done > 0) throw new NetworkError('UNKNOWN', `${done} of ${total} Snaps were already posted before this failed (${e.message}). Retrying would post them again; check the profile first.`, { httpStatus: e.httpStatus, meta: e.meta, retryability: 'non_retryable' });
    if (e.code === 'NETWORK_UNAVAILABLE') throw new NetworkError('UNKNOWN', `${e.message} Snapchat may have posted this already; check the profile before retrying.`, { httpStatus: e.httpStatus, meta: e.meta, retryability: 'unknown' });
    throw e;
  }
}

async function createPosts(ctx: NetworkContext, input: PublishInput, mediaIds: string[]): Promise<PublishResult> {
  const a = input.account;
  const d = input.data;
  const type: SnapType = (d.type ?? 'STORY') as SnapType;
  const pid = profileId(a);
  const base = { mediaId: mediaIds[0], mediaIds, type, profileId: pid, sourceUploadId: input.media[0]?.id ?? null, sourceUploadIds: input.media.map(m => m.id), mediaUploadedAt: ctx.now().toISOString() };

  if (type === 'STORY') {
    let inProgress = false;
    for (let i = 0; i < mediaIds.length; i++) {
      const r = await postOnce(ctx, a, `/v1/public_profiles/${pid}/stories`, { media_id: mediaIds[i], ...(d.storyDuration ? { customized_ttl: { ttl: d.storyDuration } } : {}) }, i, mediaIds.length);
      inProgress ||= r.alreadyInProgress;
    }
    // The Story endpoint returns no story id, so the first media id stands in as our reference.
    return { status: 'POSTED', externalPostId: mediaIds[0], permalink: null, externalData: { ...base, status: 'PUBLISHED', storyIdAvailable: false, ...(inProgress ? { alreadyInProgress: true } : {}) } };
  }

  if (type === 'SPOTLIGHT') {
    const { body, alreadyInProgress } = await postOnce(ctx, a, `/v1/public_profiles/${pid}/spotlights`, { media_id: mediaIds[0], description: d.description ?? d.text ?? '', locale: d.locale || DEFAULT_LOCALE });
    const id: string | undefined = body?.spotlight_id;
    if (!id) {
      if (alreadyInProgress) return { status: 'POSTED', externalPostId: mediaIds[0], permalink: null, externalData: { ...base, status: 'PUBLISHED', spotlightIdAvailable: false, alreadyInProgress: true } };
      throw new NetworkError('UNKNOWN', 'Snapchat did not return a spotlight id. The Spotlight may have been submitted; check the profile before retrying.', { meta: body, retryability: 'non_retryable' });
    }
    // Starts SUBMITTED and needs Snap's approval before it is LIVE (or REJECTED): poll for it.
    return { status: 'REVIEW', externalPostId: id, pendingRef: id, pollAfterMs: 60_000, permalink: null, externalData: { ...base, id, status: 'SUBMITTED' } };
  }

  const { body } = await postOnce(ctx, a, `/v1/public_profiles/${pid}/saved_stories`, { saved_stories: [{ title: d.title, snap_sources: mediaIds.map(media_id => ({ media_id })) }] });
  const id: string | undefined = body?.saved_stories?.[0]?.saved_story?.id;
  if (!id) throw new NetworkError('UNKNOWN', 'Snapchat did not return a saved story id. It may have been created; check the profile before retrying.', { meta: body, retryability: 'non_retryable' });
  return { status: 'POSTED', externalPostId: id, permalink: null, externalData: { ...base, id, status: 'PUBLISHED' } };
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
      maxItems: 10, // Siar's own cap: Snap documents none for Stories; a Saved Story is limited to 5 minutes in total.
      // The docs list no image rules (UNCONFIRMED): jpeg/png and the 1 GB upload ceiling are conservative guesses.
      image: { mimes: ['image/jpeg', 'image/png'], maxBytes: GB },
      // Docs: .mp4 only, up to 1 GB, 5–60 s (Spotlight 6–60 s, checked in validate), at least 540×960.
      video: { mimes: ['video/mp4'], maxBytes: GB, minSeconds: 5, maxSeconds: 60 },
    },
  },
  errorReference: [
    { code: '401', message: 'Unauthorized / invalid_token', meaning: 'The 60-minute access token expired and the refresh token is gone, or the member revoked access in Snapchat.', fix: 'Reconnect the Snapchat account.' },
    { code: 'AUTHORIZATION_PERMISSION_DENIED', message: 'The caller does not have access to this public profile', meaning: 'The OAuth client id is not on Snap\'s allowlist for the Public Profile API, or the member has no permission on the profile.', fix: 'Ask Snap to allowlist the app\'s client id, and pick a profile the member can post to.' },
    { code: '429', message: 'Rate limit exceeded', meaning: 'Too many API calls for this app or profile.', fix: 'Retry after the Retry-After delay.' },
    { code: 'media_invalid', message: 'Media does not meet requirements', meaning: 'Videos must be .mp4, at least 540×960, 5–60 s (Spotlight 6–60 s).', fix: 'Re-encode as a vertical H.264 MP4 within the limits.' },
    { code: 'MEDIA_EXPIRED', message: 'The media is more than 24 hours old', meaning: 'Snapchat only accepts a media object for 24 hours after it was created.', fix: 'Nothing: Siar uploads fresh media on every attempt, so retry the post.' },
    { code: 'MEDIA_POSTING_ALREADY_IN_PROGRESS', message: 'This media is already being posted', meaning: 'An earlier request for the same media is still publishing; it completes on its own.', fix: 'Do not retry. Siar treats the post as sent.' },
    { code: 'spotlight_rejected', message: 'Spotlight status REJECTED', meaning: 'Snapchat moderation refused the Spotlight after review.', fix: 'Edit the content and post again.' },
    { code: 'invalid_grant', message: 'invalid_grant', meaning: 'The authorization code was used, expired, or the redirect URI differs from the registered one.', fix: 'Start the connection again.' },
    { code: 'spotlight_requires_one_video', message: 'Spotlight needs exactly one video', meaning: 'Spotlight accepts a single .mp4 video; images and multiple items are refused.', fix: 'Attach one video, or use STORY.' },
  ],

  async authorize(ctx, input) {
    return {
      url: authorizeUrl(AUTH_URL, { client_id: ctx.credentials.clientId, redirect_uri: ctx.redirectUri, response_type: 'code', scope: SCOPES.join(' '), state: input.state }),
    };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri });
    const { me, channels } = await profilesOf(ctx, token);
    const current = channels.find(c => c.id === String(me.id)) ?? channels[0];
    return {
      token,
      profile: {
        externalId: String(me.id), providerPageId: String(me.id), username: current?.username ?? null, displayName: current?.name ?? null, avatarUrl: current?.avatarUrl ?? null,
        userUsername: me.snap_user_name ?? null, userDisplayName: me.display_name ?? null, channels,
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
    try { await api(ctx, a, '/v1/public_profiles/my_profile'); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const type = data.type ?? 'STORY';
    if (!TYPES.includes(type)) issues.push({ code: 'invalid', message: `type must be one of ${TYPES.join(', ')}.`, path: ['type'] });
    checkMedia(issues, media, snapchat.limits, ['uploadIds'], { required: true });
    media.forEach((m, i) => {
      if (m.type === 'video' && m.width != null && m.height != null && (m.width < MIN_WIDTH || m.height < MIN_HEIGHT)) {
        issues.push({ code: 'too_small', message: `Video is ${m.width}×${m.height}; Snapchat needs at least ${MIN_WIDTH}×${MIN_HEIGHT}.`, path: ['uploadIds', i] });
      }
    });
    if (type === 'SPOTLIGHT') {
      if (media.length !== 1 || media[0]?.type !== 'video') issues.push({ code: 'type', message: 'Spotlight needs exactly one video.', path: ['uploadIds'] });
      const d = media[0]?.duration;
      if (media[0]?.type === 'video' && d != null && d >= 5 && d < 6) issues.push({ code: 'too_short', message: `Video is ${Math.round(d)}s; a Spotlight must be at least 6s.`, path: ['uploadIds', 0] });
      checkText(issues, data.description ?? data.text, SPOTLIGHT_DESC_MAX, ['description']);
      // Snap requires a locale; an omitted one defaults to en_US (DEFAULT_LOCALE) rather than failing the post.
      if (data.locale && !LOCALE.test(String(data.locale))) issues.push({ code: 'invalid', message: 'locale must look like en_US.', path: ['locale'] });
    }
    if (type === 'SAVED_STORY') {
      if (!data.title || !String(data.title).trim()) issues.push({ code: 'required', message: 'A Saved Story needs a title.', path: ['title'] });
      else if (charCount(String(data.title)) > TITLE_MAX) issues.push({ code: 'too_long', message: `Title is limited to ${TITLE_MAX} characters.`, path: ['title'] });
      const total = media.reduce((s, m) => s + (m.type === 'video' ? m.duration ?? 0 : 0), 0);
      if (total > SAVED_STORY_MAX_SECONDS) issues.push({ code: 'too_long', message: `The videos add up to ${Math.round(total)}s; a Saved Story is limited to ${SAVED_STORY_MAX_SECONDS / 60} minutes.`, path: ['uploadIds'] });
    }
    if (type !== 'STORY' && data.storyDuration) issues.push({ code: 'ignored', message: 'storyDuration only applies to STORY.', path: ['storyDuration'] });
    if (data.storyDuration && !STORY_TTLS.includes(data.storyDuration)) issues.push({ code: 'invalid', message: `storyDuration must be one of ${STORY_TTLS.join(', ')}.`, path: ['storyDuration'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    if (!input.media.length) throw new NetworkError('VALIDATION', 'Snapchat posts need media.');
    // Uploads are safe to repeat (a retry just makes fresh media); only the posting call below is not.
    const mediaIds: string[] = [];
    for (const m of input.media) mediaIds.push(await uploadMedia(ctx, a, m));
    return createPosts(ctx, input, mediaIds);
  },

  /** Only Spotlights are asynchronous: SUBMITTED → LIVE | REJECTED. */
  async poll(ctx, input, pendingRef) {
    const a = input.account;
    const r = await api(ctx, a, `/v1/public_profiles/${profileId(a)}/spotlights/${pendingRef}`);
    const sp = r.spotlights?.[0]?.spotlight;
    const status: string = sp?.status ?? 'SUBMITTED';
    if (status === 'REJECTED') throw new NetworkError('CONTENT_REJECTED', 'Snapchat rejected this Spotlight after review.', { meta: sp, retryability: 'non_retryable' });
    if (status === 'LIVE') {
      // UNCONFIRMED: the docs' `link` is an attached URL, not the Spotlight page, so the public URL shape is assumed.
      const permalink = `https://www.snapchat.com/spotlight/${pendingRef}`;
      return { status: 'POSTED', externalPostId: pendingRef, permalink, externalData: { id: pendingRef, status: 'LIVE', permalink, profileId: profileId(a), duration: sp?.duration ?? null } };
    }
    return { status: 'REVIEW', externalPostId: pendingRef, pendingRef, pollAfterMs: 60_000, externalData: { id: pendingRef, status } };
  },
};
