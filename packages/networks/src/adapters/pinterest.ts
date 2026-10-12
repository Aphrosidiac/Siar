/**
 * Pinterest — API v5.
 *
 * Docs: https://developers.pinterest.com/docs/api/v5/
 *   OAuth 2.0        www.pinterest.com/oauth/ (scopes comma-separated, no PKCE) →
 *                    api.pinterest.com/v5/oauth/token with HTTP Basic client auth. Access tokens
 *                    last 30 days; refresh tokens last 60 days and each refresh returns a new one (stored).
 *   Boards           GET /v5/boards (bookmark pagination). Boards are the account's channels;
 *                    data.boardName is resolved against them by name, case-insensitively.
 *   Pins             POST /v5/pins with media_source: image_url | multiple_image_urls (2–5) | video_id
 *   Video            POST /v5/media (register) → multipart POST to the returned S3 upload_url with the
 *                    returned upload_parameters, file last → GET /v5/media/:id until status is
 *                    "succeeded" → pin with media_source.video_id and a cover.
 *   Edit / delete    PATCH|DELETE /v5/pins/:id
 *   Analytics        GET /v5/pins/:id/analytics, GET /v5/user_account/analytics (90-day window)
 * Pinterest has no public comments API. isAiGenerated → ai_disclosures { values: ['AI_MODIFIED'] } (API 5.28).
 */
import { NetworkError } from '../lib/errors.js';
import { request, resetFrom, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, basicAuth, expiresIn } from '../lib/oauth.js';
import { checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type { AccountProfile, AccountRuntime, Channel, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, PublishInput, PublishResult, TokenSet } from '../types.js';

const API = 'https://api.pinterest.com/v5';
const AUTH_URL = 'https://www.pinterest.com/oauth/';
const SCOPES = ['boards:read', 'boards:write', 'pins:read', 'pins:write', 'user_accounts:read'];
const TITLE_MAX = 100;
const DESCRIPTION_MAX = 800;
const NOTE_MAX = 500;
const ALT_MAX = 500;
const MAX_IMAGES = 5;

// ───────────────────────────── errors ─────────────────────────────

/** Pinterest errors: { code, message } — the HTTP status carries the category. */
function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const msg: string = body?.message ?? body?.error_description ?? (typeof body?.error === 'string' ? body.error : undefined) ?? `Pinterest returned HTTP ${status}`;
  const opts = { httpStatus: status, meta: body };
  if (status === 401 || body?.error === 'invalid_grant') return new NetworkError('TOKEN_INVALID', msg, opts);
  if (status === 429) return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: resetFrom(res) });
  if (status === 403 && /trial|sandbox|consumer type|not.*(approved|upgraded)/i.test(msg)) {
    return new NetworkError('PERMISSION', msg, { ...opts, userFacingMessage: 'The Pinterest app only has Trial access, so it cannot create public pins yet. Apply for Standard access in the Pinterest developer portal.' });
  }
  if (status === 403) return new NetworkError('PERMISSION', msg, opts);
  if (status === 404) return new NetworkError('NOT_FOUND', msg, opts);
  if (status === 409 || /already (saved|exists)|duplicate/i.test(msg)) return new NetworkError('DUPLICATE', msg, opts);
  if (status === 400 && /image|media|video|cover|upload/i.test(msg)) return new NetworkError('MEDIA_INVALID', msg, opts);
  if (status === 400 || status === 422) return new NetworkError('VALIDATION', msg, opts);
  return undefined;
}

const api = <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: RequestOptions = {}) =>
  request<T>(ctx, `${API}${path}`, { bearer: a.token.accessToken, mapError, ...opts });

const ymd = (d: Date) => d.toISOString().slice(0, 10);
const pinUrl = (id: string) => `https://www.pinterest.com/pin/${id}/`;

// ───────────────────────────── boards ─────────────────────────────

const toChannel = (b: any): Channel => ({
  id: String(b.id), name: b.name ?? null, avatarUrl: b.media?.image_cover_url ?? null,
  metadata: { privacy: b.privacy, pinCount: b.pin_count, description: b.description ?? null },
});

async function allBoards(ctx: NetworkContext, token: string): Promise<any[]> {
  const out: any[] = [];
  let bookmark: string | undefined;
  for (let i = 0; i < 20; i++) {
    const r = await request(ctx, `${API}/boards`, { bearer: token, mapError, query: { page_size: 250, bookmark } });
    out.push(...(r.items ?? []));
    bookmark = r.bookmark ?? undefined;
    if (!bookmark) break;
  }
  return out;
}

async function resolveBoard(ctx: NetworkContext, a: AccountRuntime, name: string): Promise<string> {
  const boards = await allBoards(ctx, a.token.accessToken);
  const want = name.trim().toLowerCase();
  const hit = boards.find(b => String(b.name).trim().toLowerCase() === want) ?? boards.find(b => String(b.id) === name.trim());
  if (!hit) {
    throw new NetworkError('NOT_FOUND', `Pinterest board "${name}" was not found on this account. Boards: ${boards.slice(0, 10).map(b => b.name).join(', ') || 'none'}.`, {
      userFacingMessage: `There is no Pinterest board named "${name}". Create it on Pinterest first, or use one of the connected account's boards.`,
    });
  }
  return String(hit.id);
}

// ───────────────────────────── mapping ─────────────────────────────

const profileOf = (u: any, boards: any[] = []): AccountProfile => {
  const id = String(u.id ?? u.username);
  return {
    externalId: id, providerPageId: id, username: u.username ?? null, displayName: u.business_name ?? u.username ?? null,
    avatarUrl: u.profile_image ?? null, bio: u.about ?? null, userId: id, userUsername: u.username ?? null, userDisplayName: u.business_name ?? u.username ?? null,
    channels: boards.map(toChannel),
  };
};

async function tokenRequest(ctx: NetworkContext, form: Record<string, string>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, `${API}/oauth/token`, {
    form,
    headers: { authorization: basicAuth(ctx.credentials.clientId ?? '', ctx.credentials.clientSecret ?? '') },
    mapError: (status, body, res) => (status === 400 || status === 401) ? new NetworkError('TOKEN_INVALID', body?.message ?? body?.error_description ?? 'Pinterest rejected the token request.', { httpStatus: status, meta: body }) : mapError(status, body, res),
  });
  return {
    accessToken: tok.access_token, refreshToken: tok.refresh_token ?? prev?.refreshToken ?? null,
    expiresAt: expiresIn(tok.expires_in, ctx.now()),
    refreshTokenExpiresAt: tok.refresh_token_expires_in ? expiresIn(tok.refresh_token_expires_in, ctx.now()) : prev?.refreshTokenExpiresAt ?? null,
    scopes: String(tok.scope ?? SCOPES.join(',')).split(/[\s,]+/).filter(Boolean), secrets: { ...(prev?.secrets ?? {}) },
  };
}

const imageUrlOf = (pin: any): string | null => {
  const im = pin.media?.images ?? {};
  return im['600x']?.url ?? im['400x300']?.url ?? im['1200x']?.url ?? im['150x150']?.url ?? pin.media?.cover_image_url ?? null;
};

const metricsOf = (all: any): PostMetrics => {
  const s = all?.summary_metrics ?? all?.lifetime_metrics ?? {};
  return {
    impressions: s.IMPRESSION ?? 0, saves: s.SAVE ?? 0, likes: s.TOTAL_REACTIONS ?? s.REACTION ?? 0, comments: s.TOTAL_COMMENTS ?? s.COMMENT ?? 0,
    views: s.VIDEO_MRC_VIEW, raw: { pinClicks: s.PIN_CLICK, outboundClicks: s.OUTBOUND_CLICK, ...s },
  };
};

// ───────────────────────────── video ─────────────────────────────

/** Register → upload to the S3 form Pinterest hands back. The file field must come last. */
async function uploadVideo(ctx: NetworkContext, a: AccountRuntime, m: MediaRef): Promise<string> {
  const reg = await api(ctx, a, '/media', { method: 'POST', json: { media_type: 'video' } });
  const form = new FormData();
  for (const [k, v] of Object.entries<string>(reg.upload_parameters ?? {})) form.set(k, v);
  form.set('file', new Blob([new Uint8Array(await m.read())], { type: m.mime }), `upload.${m.ext}`);
  // The upload URL is a pre-signed S3 form: no Authorization header.
  await request(ctx, reg.upload_url, { method: 'POST', body: form, timeoutMs: 600_000 });
  return String(reg.media_id);
}

interface PendingVideo { mediaId: string; body: Record<string, unknown>; startedAt: number }

/** One status read. 'succeeded' → ready to pin. */
async function videoReady(ctx: NetworkContext, a: AccountRuntime, mediaId: string): Promise<boolean> {
  const r = await api(ctx, a, `/media/${mediaId}`);
  if (r.status === 'failed') throw new NetworkError('MEDIA_INVALID', 'Pinterest could not process the video.', { meta: r });
  return r.status === 'succeeded';
}

async function createPin(ctx: NetworkContext, input: PublishInput, body: Record<string, unknown>): Promise<PublishResult> {
  const pin = await api(ctx, input.account, '/pins', { method: 'POST', json: body });
  return {
    status: 'POSTED', externalPostId: String(pin.id), permalink: pinUrl(pin.id),
    externalData: { id: pin.id, boardId: pin.board_id ?? body.board_id, link: pin.link ?? null, isAiGenerated: !!input.data.isAiGenerated },
  };
}

// ───────────────────────────── adapter ─────────────────────────────

export const pinterest: NetworkAdapter = {
  type: 'PINTEREST',
  displayName: 'Pinterest',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'optional', postTypes: ['PIN'],
    comments: false, firstComment: false, editPost: true, deletePost: true, editComment: false, deleteComment: false,
    commentImport: false, commentActions: [],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    textMax: TITLE_MAX, titleMax: TITLE_MAX, commentMax: null,
    media: {
      maxItems: MAX_IMAGES,
      image: { mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/tiff'], maxBytes: 20 * MB },
      video: { mimes: ['video/mp4', 'video/quicktime', 'video/x-m4v'], maxBytes: 2 * GB, minSeconds: 4, maxSeconds: 15 * 60 },
    },
  },
  errorReference: [
    { code: '401', message: 'Authentication failed.', meaning: 'The access token expired or the user removed the app from their Pinterest account.', fix: 'Siar refreshes automatically; if it still fails, reconnect the Pinterest account.' },
    { code: '403 trial', message: 'Your application consumer type is not supported / Trial access.', meaning: 'The Pinterest app only has Trial access, which cannot create public pins.', fix: 'Apply for Standard access in the Pinterest developer portal, then retry.' },
    { code: '403 scope', message: 'Not authorized to access this resource.', meaning: 'The token lacks a scope this call needs (for example boards:write or user_accounts:read).', fix: 'Reconnect the account and accept every permission.' },
    { code: '404 board', message: 'Board not found.', meaning: 'data.boardName does not match any board on the connected account.', fix: 'Use the exact board name (case does not matter) or create the board on Pinterest first.' },
    { code: '404 pin', message: 'Pin not found.', meaning: 'The pin was deleted on Pinterest or belongs to another account.', fix: 'Check the pin still exists.' },
    { code: '400 image', message: 'Invalid image URL / the image could not be fetched.', meaning: 'Pinterest could not download the image from our media URL, or the file is not a supported image.', fix: 'Use JPEG or PNG under 20 MB; Siar retries the post.' },
    { code: '400 params', message: 'Invalid parameters.', meaning: 'A field failed validation: title over 100, description over 800, a bad link, or an unsupported carousel size.', fix: 'Fix the field named in the error meta; carousels need 2 to 5 images.' },
    { code: '400 video', message: 'The media is not ready / cover image is required.', meaning: 'A video pin was created before Pinterest finished processing, or no cover was given.', fix: 'Siar waits for the media to reach "succeeded" first; set a thumbnail upload if it keeps failing.' },
    { code: '429', message: 'You have exceeded your rate limit.', meaning: 'The per-user or per-app request limit is used up.', fix: 'Siar retries after the reset time; spread scheduled pins out.' },
    { code: '5xx', message: 'Internal Server Error', meaning: 'Pinterest is having trouble.', fix: 'Transient; Siar retries automatically.' },
  ],

  async authorize(ctx, input) {
    const url = authorizeUrl(AUTH_URL, {
      client_id: ctx.credentials.clientId, redirect_uri: ctx.redirectUri, response_type: 'code', scope: SCOPES.join(','), state: input.state,
    });
    return { url };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri });
    const u = await request(ctx, `${API}/user_account`, { bearer: token.accessToken, mapError });
    // Boards are best effort: a token without boards:read must still connect.
    const boards = await allBoards(ctx, token.accessToken).catch(() => []);
    return { token, profile: profileOf(u, boards) };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No Pinterest refresh token; reconnect the account.');
    return tokenRequest(ctx, { grant_type: 'refresh_token', refresh_token: a.token.refreshToken, scope: SCOPES.join(',') }, a.token);
  },

  async refreshProfile(ctx, a) {
    const u = await api(ctx, a, '/user_account');
    const boards = await allBoards(ctx, a.token.accessToken).catch(() => []);
    return profileOf(u, boards);
  },

  async listChannels(ctx, a) {
    return (await allBoards(ctx, a.token.accessToken)).map(toChannel);
  },

  async selectChannel() {
    // Posting always goes through data.boardName; nothing about the identity or token changes.
    return {};
  },

  async checkConnection(ctx, a) {
    try { await api(ctx, a, '/user_account'); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await request(ctx, `${API}/oauth/token/revoke`, {
      method: 'POST', form: { token: a.token.accessToken },
      headers: { authorization: basicAuth(ctx.credentials.clientId ?? '', ctx.credentials.clientSecret ?? '') },
    }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    if (typeof data.boardName !== 'string' || !data.boardName.trim()) issues.push({ code: 'required', message: 'boardName is required: the Pinterest board to pin to.', path: ['boardName'] });
    checkText(issues, data.text, TITLE_MAX, ['text']);
    checkText(issues, data.description, DESCRIPTION_MAX, ['description']);
    checkText(issues, data.note, NOTE_MAX, ['note']);
    checkText(issues, data.altText, ALT_MAX, ['altText']);
    checkMedia(issues, media, pinterest.limits, ['uploadIds'], { required: true, types: ['image', 'video'] });
    const videos = media.filter(m => m.type === 'video').length;
    const images = media.filter(m => m.type === 'image').length;
    if (videos && images) issues.push({ code: 'mixed', message: 'A pin is either one video or 1 to 5 images, not both.', path: ['uploadIds'] });
    if (videos > 1) issues.push({ code: 'too_many', message: 'A video pin takes exactly one video.', path: ['uploadIds'] });
    if (data.link) {
      try { const u = new URL(String(data.link)); if (!/^https?:$/.test(u.protocol) || String(data.link).length > 2048) throw new Error(); } catch {
        issues.push({ code: 'invalid', message: 'link must be an http(s) URL of at most 2048 characters.', path: ['link'] });
      }
    }
    if (data.dominantColor && !/^#[0-9a-f]{6}$/i.test(String(data.dominantColor))) issues.push({ code: 'invalid', message: 'dominantColor must be a hex colour such as #6E7874.', path: ['dominantColor'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const d = input.data;
    const boardId = await resolveBoard(ctx, a, String(d.boardName ?? ''));
    const body: Record<string, unknown> = {
      board_id: boardId, title: String(d.text || input.title || '').slice(0, TITLE_MAX) || undefined, description: d.description || undefined, link: d.link || undefined,
      alt_text: d.altText || undefined, note: d.note || undefined, dominant_color: d.dominantColor || undefined,
      ai_disclosures: d.isAiGenerated ? { values: ['AI_MODIFIED'] } : undefined,
    };
    const vid = input.media.find(m => m.type === 'video');
    if (vid) {
      let cover: Record<string, unknown> = { cover_image_key_frame_time: 0 };
      if (d.thumbnail) cover = { cover_image_url: (await input.resolveUpload(d.thumbnail)).url };
      const mediaId = await uploadVideo(ctx, a, vid);
      body.media_source = { source_type: 'video_id', media_id: mediaId, ...cover };
      if (!(await videoReady(ctx, a, mediaId))) {
        const state: PendingVideo = { mediaId, body, startedAt: ctx.now().getTime() };
        return { status: 'PROCESSING', pendingRef: JSON.stringify(state), pollAfterMs: 15_000, externalData: { mediaId } };
      }
      return createPin(ctx, input, body);
    }
    const images = input.media.filter(m => m.type === 'image');
    body.media_source = images.length === 1
      ? { source_type: 'image_url', url: images[0].url }
      : { source_type: 'multiple_image_urls', items: images.map(m => ({ url: m.url })), index: 0 };
    return createPin(ctx, input, body);
  },

  async poll(ctx, input, pendingRef) {
    const st = JSON.parse(pendingRef) as PendingVideo;
    if (!(await videoReady(ctx, input.account, st.mediaId))) {
      if (ctx.now().getTime() - st.startedAt > 3 * 3600_000) throw new NetworkError('MEDIA_INVALID', 'Pinterest did not finish processing the video within 3 hours.', { retryability: 'retryable' });
      return { status: 'PROCESSING', pendingRef, pollAfterMs: 30_000 };
    }
    return createPin(ctx, input, st.body);
  },

  async recentPosts(ctx, a, since) {
    const r = await api(ctx, a, '/pins', { query: { page_size: 25 } });
    return (r.items ?? []).filter((p: any) => !p.created_at || new Date(p.created_at) >= since)
      .map((p: any) => ({ externalId: String(p.id), text: p.title ?? p.description ?? null, createdAt: p.created_at ? new Date(p.created_at) : null, permalink: pinUrl(p.id) }));
  },

  async deletePost(ctx, a, id) {
    await api(ctx, a, `/pins/${encodeURIComponent(id)}`, { method: 'DELETE' });
  },

  async editPost(ctx, a, id, data) {
    const patch = { title: data.title ?? data.text, description: data.description, link: data.link, alt_text: data.altText, note: data.note };
    await api(ctx, a, `/pins/${encodeURIComponent(id)}`, { method: 'PATCH', json: Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)) });
  },

  async accountAnalytics(ctx, a) {
    const u = await api(ctx, a, '/user_account');
    const now = ctx.now();
    let all: any = null;
    try {
      all = (await api(ctx, a, '/user_account/analytics', { query: { start_date: ymd(new Date(now.getTime() - 89 * 86400_000)), end_date: ymd(now), metric_types: 'IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE,ENGAGEMENT' } })).all;
    } catch (e) {
      if (!(e instanceof NetworkError) || e.code === 'TOKEN_INVALID') throw e;
    }
    const s = all?.summary_metrics ?? {};
    return {
      followers: u.follower_count ?? 0, following: u.following_count ?? 0, postCount: u.pin_count ?? 0, impressions: s.IMPRESSION, views: u.monthly_views,
      raw: { user: { follower_count: u.follower_count, following_count: u.following_count, pin_count: u.pin_count, board_count: u.board_count, monthly_views: u.monthly_views }, summary_metrics: s },
    };
  },

  async postAnalytics(ctx, a, id) {
    const now = ctx.now();
    const r = await api(ctx, a, `/pins/${encodeURIComponent(id)}/analytics`, {
      query: { start_date: ymd(new Date(now.getTime() - 89 * 86400_000)), end_date: ymd(now), metric_types: 'IMPRESSION,PIN_CLICK,OUTBOUND_CLICK,SAVE,TOTAL_REACTIONS,TOTAL_COMMENTS' },
    });
    return metricsOf(r.all);
  },

  async importHistory(ctx, a, input) {
    const r = await api(ctx, a, '/pins', { query: { page_size: Math.max(1, Math.min(100, input.limit)), bookmark: input.cursor ?? undefined } });
    const items: HistoryPost[] = (r.items ?? []).map((p: any) => ({
      externalId: String(p.id), title: p.title ?? p.description ?? null, permalink: pinUrl(p.id), publishedAt: p.created_at ? new Date(p.created_at) : null,
      type: p.media?.media_type === 'video' ? 'VIDEO' : 'IMAGE', thumbnail: imageUrlOf(p), smallThumbnail: p.media?.images?.['150x150']?.url ?? imageUrlOf(p),
      extraData: { boardId: p.board_id ?? null, link: p.link ?? null },
    }));
    return { items, nextCursor: r.bookmark ?? null };
  },

  misc: {
    'misc.pinterest.editPin': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await pinterest.editPost!(ctx, a, p.externalPostId, { title: body.title, description: body.description, link: body.link, altText: body.altText, note: body.note });
      return { success: true, permalink: p.permalink ?? pinUrl(p.externalPostId) };
    },
    'misc.pinterest.deletePin': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await pinterest.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
  },
};
