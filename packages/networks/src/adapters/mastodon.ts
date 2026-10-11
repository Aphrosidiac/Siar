/**
 * Mastodon — the reference adapter. Every other adapter follows its shape:
 *   1. constants (API base, limits, capabilities)
 *   2. small private helpers (api(), mapError(), toMetrics())
 *   3. the NetworkAdapter object, methods in interface order
 *
 * Docs: https://docs.joinmastodon.org/methods/
 * Each Mastodon server is its own OAuth provider: the app is registered per server
 * (prepareServer) and the API stores the client credentials in MastodonServer.
 */
import { NetworkError } from '../lib/errors.js';
import { request, sleep, type RequestOptions } from '../lib/http.js';
import { authorizeUrl } from '../lib/oauth.js';
import { checkMedia, checkText, MB } from '../lib/validate.js';
import type { AccountRuntime, FetchedCommentInput, HistoryPost, MediaRef, NetworkAdapter, NetworkContext, PostMetrics } from '../types.js';

const SCOPES = ['read', 'write'];
const VISIBILITY: Record<string, string> = { PUBLIC: 'public', UNLISTED: 'unlisted', PRIVATE: 'private', DIRECT: 'direct' };

const server = (a: { serverUrl: string | null }) => {
  if (!a.serverUrl) throw new NetworkError('VALIDATION', 'This Mastodon account has no server URL.');
  return a.serverUrl.replace(/\/$/, '');
};

function mapError(status: number, body: any): NetworkError | undefined {
  const msg = body?.error ?? body?.error_description;
  if (status === 401 || body?.error === 'invalid_grant') return new NetworkError('TOKEN_INVALID', msg ?? 'The Mastodon access token is no longer valid.', { httpStatus: status, meta: body });
  if (status === 422) {
    if (/already|duplicate/i.test(msg ?? '')) return new NetworkError('DUPLICATE', msg, { httpStatus: status, meta: body });
    return new NetworkError('CONTENT_REJECTED', msg ?? 'Mastodon rejected the status.', { httpStatus: status, meta: body });
  }
  return undefined;
}

const api = <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: RequestOptions = {}) =>
  request<T>(ctx, `${server(a)}${path}`, { bearer: a.token.accessToken, mapError, ...opts });

/** Upload one media item; waits briefly for server-side processing (202 → poll). */
async function uploadMedia(ctx: NetworkContext, a: AccountRuntime, m: MediaRef, thumbnail?: MediaRef | null): Promise<string> {
  const form = new FormData();
  form.set('file', new Blob([new Uint8Array(await m.read())], { type: m.mime }), `upload.${m.ext}`);
  if (m.altText) form.set('description', m.altText);
  if (thumbnail) form.set('thumbnail', new Blob([new Uint8Array(await thumbnail.read())], { type: thumbnail.mime }), `thumb.${thumbnail.ext}`);
  const res = await api<{ id: string; url: string | null }>(ctx, a, '/api/v2/media', { method: 'POST', body: form, timeoutMs: 300_000 });
  if (res.url) return res.id;
  for (let i = 0; i < 60; i++) {
    await sleep(ctx.mode === 'mock' ? 10 : 2000);
    const m2 = await api<{ id: string; url: string | null }>(ctx, a, `/api/v1/media/${res.id}`);
    if (m2.url) return m2.id;
  }
  throw new NetworkError('MEDIA_INVALID', 'Mastodon did not finish processing the media in time.', { retryability: 'retryable' });
}

const metrics = (s: any): PostMetrics => ({
  likes: s.favourites_count ?? 0,
  shares: s.reblogs_count ?? 0,
  comments: s.replies_count ?? 0,
  raw: { favourites_count: s.favourites_count, reblogs_count: s.reblogs_count, replies_count: s.replies_count },
});

const stripHtml = (html: string | null | undefined) =>
  (html ?? '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p>/gi, '\n\n').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();

const toComment = (s: any, rootId: string): FetchedCommentInput => ({
  externalId: s.id,
  externalParentId: s.in_reply_to_id && s.in_reply_to_id !== rootId ? s.in_reply_to_id : null,
  externalPostId: rootId,
  authorName: s.account?.display_name || s.account?.acct,
  authorExternalId: s.account?.id,
  authorProfileUrl: s.account?.url,
  authorAvatarUrl: s.account?.avatar,
  text: stripHtml(s.content),
  likesCount: s.favourites_count ?? 0,
  repliesCount: s.replies_count ?? 0,
  publishedAt: s.created_at ? new Date(s.created_at) : null,
  platformData: { uri: s.uri, url: s.url, visibility: s.visibility, favourited: s.favourited ?? false },
});

const profileOf = (me: any) => ({
  externalId: String(me.id),
  providerPageId: String(me.id),
  username: me.acct ?? me.username,
  displayName: me.display_name || me.username,
  avatarUrl: me.avatar,
  bio: stripHtml(me.note),
  userId: String(me.id),
  userUsername: me.username,
  userDisplayName: me.display_name || me.username,
});

export const mastodon: NetworkAdapter = {
  type: 'MASTODON',
  displayName: 'Mastodon',
  credentialKeys: [],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'none', postTypes: ['POST'],
    comments: true, firstComment: true, editPost: true, deletePost: true, editComment: true, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'LIKE', 'UNLIKE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    // 500 is the default; servers can raise it. We validate against the default.
    textMax: 500,
    commentMax: 500,
    media: {
      maxItems: 4,
      image: { mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif', 'image/heic'], maxBytes: 16 * MB },
      video: { mimes: ['video/mp4', 'video/webm', 'video/quicktime'], maxBytes: 99 * MB, maxSeconds: 7200 },
    },
  },

  async prepareServer(ctx, serverUrl) {
    const res = await request<{ client_id: string; client_secret: string }>(ctx, `${serverUrl.replace(/\/$/, '')}/api/v1/apps`, {
      method: 'POST',
      json: { client_name: 'Siar', redirect_uris: ctx.redirectUri, scopes: SCOPES.join(' '), website: 'https://siaran.my' },
    });
    return { clientId: res.client_id, clientSecret: res.client_secret };
  },

  async authorize(ctx, input) {
    if (!input.serverUrl) throw new NetworkError('VALIDATION', 'serverUrl is required to connect Mastodon (e.g. https://mastodon.social).');
    const clientId = String(input.extra?.clientId ?? '');
    const url = authorizeUrl(`${input.serverUrl.replace(/\/$/, '')}/oauth/authorize`, {
      client_id: clientId, redirect_uri: ctx.redirectUri, response_type: 'code', scope: SCOPES.join(' '), state: input.state,
      code_challenge: input.codeChallenge, code_challenge_method: 'S256', force_login: input.forceLogin ? 'true' : undefined,
    });
    return { url };
  },

  async exchange(ctx, input) {
    const base = String(input.serverUrl ?? '').replace(/\/$/, '');
    const tok = await request<{ access_token: string; scope?: string }>(ctx, `${base}/oauth/token`, {
      form: {
        grant_type: 'authorization_code', code: input.code, client_id: String(input.extra?.clientId ?? ''), client_secret: String(input.extra?.clientSecret ?? ''),
        redirect_uri: ctx.redirectUri, code_verifier: input.codeVerifier, scope: SCOPES.join(' '),
      },
    });
    const me = await request(ctx, `${base}/api/v1/accounts/verify_credentials`, { bearer: tok.access_token, mapError });
    return { token: { accessToken: tok.access_token, scopes: (tok.scope ?? SCOPES.join(' ')).split(/\s+/) }, profile: profileOf(me) };
  },

  async refreshProfile(ctx, a) {
    return profileOf(await api(ctx, a, '/api/v1/accounts/verify_credentials'));
  },

  async checkConnection(ctx, a) {
    try { await api(ctx, a, '/api/v1/accounts/verify_credentials'); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await api(ctx, a, '/oauth/revoke', { method: 'POST', form: { token: a.token.accessToken } }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: ReturnType<NetworkAdapter['validate']> = [];
    checkText(issues, data.text, 500, ['text'], media.length === 0);
    checkMedia(issues, media, mastodon.limits);
    if (media.some(m => m.type === 'video') && media.length > 1) issues.push({ code: 'mixed', message: 'Mastodon allows one video per status, without images.', path: ['uploadIds'] });
    if (data.spoiler && String(data.spoiler).length > 500) issues.push({ code: 'too_long', message: 'Content warning is limited to 500 characters.', path: ['spoiler'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const thumb = input.data.thumbnail ? await input.resolveUpload(input.data.thumbnail).catch(() => null) : null;
    const mediaIds: string[] = [];
    for (const m of input.media) mediaIds.push(await uploadMedia(ctx, a, m, m.type === 'video' ? thumb : null));
    const status = await api(ctx, a, '/api/v1/statuses', {
      method: 'POST',
      // Mastodon de-duplicates on Idempotency-Key for an hour — a retried publish cannot double-post.
      headers: { 'Idempotency-Key': `siar-${input.postId}-${a.id}` },
      json: {
        status: input.data.text ?? '',
        media_ids: mediaIds,
        visibility: VISIBILITY[input.data.privacy ?? 'PUBLIC'] ?? 'public',
        spoiler_text: input.data.spoiler || undefined,
        sensitive: input.data.spoiler ? true : undefined,
      },
    });
    return { status: 'POSTED', externalPostId: status.id, permalink: status.url ?? status.uri, externalData: { id: status.id, uri: status.uri, url: status.url } };
  },

  async recentPosts(ctx, a, since) {
    const list = await api<any[]>(ctx, a, `/api/v1/accounts/${a.providerPageId}/statuses`, { query: { limit: 20, exclude_replies: true } });
    return list.filter(s => new Date(s.created_at) >= since).map(s => ({ externalId: s.id, text: stripHtml(s.content), createdAt: new Date(s.created_at), permalink: s.url }));
  },

  async deletePost(ctx, a, id) {
    await api(ctx, a, `/api/v1/statuses/${id}`, { method: 'DELETE' });
  },

  async editPost(ctx, a, id, data) {
    await api(ctx, a, `/api/v1/statuses/${id}`, { method: 'PUT', json: { status: data.text ?? data.description, spoiler_text: data.spoiler ?? data.spoilerText } });
  },

  async comment(ctx, input) {
    const a = input.account;
    const mediaIds: string[] = [];
    for (const m of input.media) mediaIds.push(await uploadMedia(ctx, a, m));
    const s = await api(ctx, a, '/api/v1/statuses', {
      method: 'POST',
      headers: { 'Idempotency-Key': `siar-c-${input.parentExternalId ?? input.externalPostId}-${Buffer.from(input.text).toString('base64url').slice(0, 40)}` },
      json: { status: input.text, in_reply_to_id: input.parentExternalId ?? input.externalPostId, media_ids: mediaIds, visibility: 'public' },
    });
    return { externalId: s.id, permalink: s.url };
  },

  async editComment(ctx, a, id, text) {
    await api(ctx, a, `/api/v1/statuses/${id}`, { method: 'PUT', json: { status: text } });
  },

  async deleteComment(ctx, a, id) {
    await api(ctx, a, `/api/v1/statuses/${id}`, { method: 'DELETE' });
  },

  async importComments(ctx, a, input) {
    const c = await api<{ descendants: any[] }>(ctx, a, `/api/v1/statuses/${input.externalPostId}/context`);
    return { items: c.descendants.slice(0, input.limit).map(s => toComment(s, input.externalPostId)), nextCursor: null };
  },

  async commentAction(ctx, a, comment, action) {
    const path = { LIKE: 'favourite', UNLIKE: 'unfavourite' }[action as 'LIKE' | 'UNLIKE'];
    if (action === 'DELETE') return void (await api(ctx, a, `/api/v1/statuses/${comment.externalId}`, { method: 'DELETE' }));
    if (!path) throw new NetworkError('NOT_SUPPORTED', `Mastodon does not support ${action} on replies.`);
    await api(ctx, a, `/api/v1/statuses/${comment.externalId}/${path}`, { method: 'POST' });
  },

  async accountAnalytics(ctx, a) {
    const me = await api(ctx, a, '/api/v1/accounts/verify_credentials');
    return { followers: me.followers_count ?? 0, following: me.following_count ?? 0, postCount: me.statuses_count ?? 0, raw: { followers_count: me.followers_count, following_count: me.following_count, statuses_count: me.statuses_count } };
  },

  async postAnalytics(ctx, a, id) {
    return metrics(await api(ctx, a, `/api/v1/statuses/${id}`));
  },

  async importHistory(ctx, a, input) {
    const list = await api<any[]>(ctx, a, `/api/v1/accounts/${a.providerPageId}/statuses`, { query: { limit: Math.min(40, input.limit), max_id: input.cursor ?? undefined, exclude_reblogs: true } });
    const items: HistoryPost[] = list.map(s => ({
      externalId: s.id,
      title: stripHtml(s.content).slice(0, 200),
      permalink: s.url,
      publishedAt: new Date(s.created_at),
      type: s.media_attachments?.[0]?.type === 'video' ? 'VIDEO' : s.media_attachments?.length ? 'IMAGE' : 'POST',
      thumbnail: s.media_attachments?.[0]?.preview_url ?? null,
      smallThumbnail: s.media_attachments?.[0]?.preview_url ?? null,
      metrics: metrics(s),
    }));
    return { items, nextCursor: list.length ? list[list.length - 1].id : null };
  },

  misc: {
    'misc.mastodon.editStatus': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await mastodon.editPost!(ctx, a, p.externalPostId, { text: body.description, spoiler: body.spoilerText });
      return { success: true, permalink: p.permalink ?? '' };
    },
    'misc.mastodon.deleteStatus': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await mastodon.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
    'misc.mastodon.editComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await mastodon.editComment!(ctx, a, c.externalId, body.description ?? body.text);
      return { success: true };
    },
    'misc.mastodon.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await mastodon.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
  },
};
