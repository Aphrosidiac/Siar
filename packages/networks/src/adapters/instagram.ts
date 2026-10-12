/**
 * Instagram — Content Publishing, comments, insights and messaging for professional accounts,
 * over two connection methods (options.instagramConnectionMethod, stored on the account):
 *
 *   FACEBOOK   Facebook Login. Pages that have an instagram_business_account are the channels
 *              (GET /me/accounts); the channel id is the Instagram account id. Calls go to
 *              graph.facebook.com with the Page token (secrets.pageToken) once a channel is picked.
 *   INSTAGRAM  Instagram Login: www.instagram.com/oauth/authorize → api.instagram.com/oauth/access_token →
 *              graph.instagram.com/access_token (ig_exchange_token, ≈60 days) → refresh_access_token
 *              (ig_refresh_token). The account itself is the identity; there are no channels.
 *
 * Publishing is two-step and asynchronous: POST /{ig}/media creates a container (image_url /
 * REELS video_url / STORIES / CAROUSEL children), publish() answers PROCESSING with a pendingRef,
 * poll() reads status_code and, once FINISHED, calls /{ig}/media_publish → POSTED with the permalink.
 * Instagram has no API to edit or delete media, or to edit a comment.
 *
 * Audio search and location search only exist on the Facebook Login host (graph.facebook.com).
 *
 * Docs: https://developers.facebook.com/docs/instagram-platform/content-publishing
 *       https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login
 *       https://developers.facebook.com/docs/instagram-platform/content-publishing/audio-api
 */
import { NetworkError } from '../lib/errors.js';
import { request, sleep } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { charCount, checkMedia, checkText, MB } from '../lib/validate.js';
import type { AccountRuntime, Channel, FetchedCommentInput, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, PublishResult } from '../types.js';
import {
  FB_GRAPH, IG_GRAPH, IG_GRAPH_ROOT, facebookDialogUrl, facebookLoginTokens, graph, metaMapError, metaMessaging, nextAfter, pageAccessToken, parseRef, pickErrors, unix,
} from './meta-common.js';

const IG_WWW = 'https://www.instagram.com';
const IG_API = 'https://api.instagram.com';

const FB_SCOPES = [
  'instagram_basic', 'instagram_content_publish', 'instagram_manage_comments', 'instagram_manage_insights',
  'pages_show_list', 'pages_read_engagement', 'business_management',
];
const FB_MESSAGING_SCOPES = ['instagram_manage_messages', 'pages_messaging'];
const IG_SCOPES = ['instagram_business_basic', 'instagram_business_content_publish', 'instagram_business_manage_comments', 'instagram_business_manage_insights'];
const IG_MESSAGING_SCOPES = ['instagram_business_manage_messages'];

const IG_WEBHOOK_FIELDS = ['messages', 'messaging_postbacks', 'messaging_seen', 'message_reactions', 'messaging_referral', 'comments', 'live_comments'];
/** The Page's own field names (a Page rejects Instagram's messaging_seen / messaging_referral). */
const PAGE_WEBHOOK_FIELDS = ['messages', 'messaging_postbacks', 'message_reactions', 'message_reads', 'messaging_referrals'];

const CHANNEL_FIELDS = 'id,name,picture{url},instagram_business_account{id,username,name,profile_picture_url}';
const PROFILE_FIELDS = 'user_id,username,name,account_type,profile_picture_url,biography,followers_count,follows_count,media_count';
const MEDIA_FIELDS = 'id,caption,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count';

const fail = (msg: string) => new NetworkError('VALIDATION', msg);

type Method = 'FACEBOOK' | 'INSTAGRAM';
const methodOf = (a: { instagramConnectionMethod?: Method | null }): Method => (a.instagramConnectionMethod === 'INSTAGRAM' ? 'INSTAGRAM' : 'FACEBOOK');

/** The Instagram professional account id every publishing/insights call is made against. */
const igId = (a: AccountRuntime) => {
  const id = a.channelId ?? (methodOf(a) === 'INSTAGRAM' ? a.externalId : null);
  if (!id) throw fail('Pick an Instagram account for this connection before posting.');
  return id;
};

const base = (a: AccountRuntime) => (methodOf(a) === 'INSTAGRAM' ? IG_GRAPH : FB_GRAPH);

/** Instagram Login: the user token. Facebook Login: the selected Page's token when we hold it. */
const tokenOf = (a: AccountRuntime) => {
  const s = a.token.secrets ?? {};
  return methodOf(a) === 'FACEBOOK' && s.pageToken ? String(s.pageToken) : a.token.accessToken;
};

const ig = <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: Parameters<typeof graph>[3] = {}) =>
  graph<T>(ctx, `${base(a)}${path}`, tokenOf(a), opts);

/** The Facebook Page that owns the selected Instagram account (Facebook Login only). */
function pageIdOf(a: AccountRuntime): string {
  const id = (a.token.secrets?.pageId as string | undefined) ?? (a.channels.find(c => c.id === a.channelId)?.metadata?.pageId as string | undefined);
  if (!id) throw fail('This Instagram account has no linked Facebook Page. Reconnect it.');
  return id;
}

const appId = (ctx: NetworkContext, key: 'clientId' | 'clientSecret') =>
  String((key === 'clientId' ? ctx.credentials.instagramClientId : ctx.credentials.instagramClientSecret) ?? ctx.credentials[key] ?? '');

const json = (v: unknown) => (Array.isArray(v) ? (v.length ? JSON.stringify(v) : undefined) : v && typeof v === 'object' ? JSON.stringify(v) : undefined);

const channelOf = (p: any): Channel => {
  const acc = p.instagram_business_account;
  return {
    id: String(acc.id), name: acc.name ?? acc.username ?? null, username: acc.username ?? null, avatarUrl: acc.profile_picture_url ?? null,
    address: acc.username ? `https://www.instagram.com/${acc.username}` : null,
    metadata: { pageId: String(p.id), pageName: p.name ?? null },
  };
};

async function listChannels(ctx: NetworkContext, userToken: string): Promise<Channel[]> {
  const out: Channel[] = [];
  let after: string | null = null;
  for (let i = 0; i < 10; i++) {
    const res: any = await graph(ctx, `${FB_GRAPH}/me/accounts`, userToken, { query: { fields: CHANNEL_FIELDS, limit: 100, after: after ?? undefined } });
    out.push(...(res.data ?? []).filter((p: any) => p.instagram_business_account?.id).map(channelOf));
    after = nextAfter(res);
    if (!after) break;
  }
  return out;
}

const igProfile = (p: any) => ({
  externalId: String(p.user_id ?? p.id), username: p.username ?? null, displayName: p.name ?? p.username ?? null,
  avatarUrl: p.profile_picture_url ?? null, bio: p.biography ?? null,
});

// ───────────────────────────── containers ─────────────────────────────

/** Wait for a container to leave IN_PROGRESS (carousel video children must be ready before the parent). */
async function waitFinished(ctx: NetworkContext, a: AccountRuntime, id: string) {
  for (let i = 0; i < 90; i++) {
    const c = await ig<{ status_code?: string; status?: string }>(ctx, a, `/${id}`, { query: { fields: 'status_code,status' } });
    if (c.status_code === 'FINISHED' || c.status_code === 'PUBLISHED') return;
    if (c.status_code === 'ERROR' || c.status_code === 'EXPIRED') throw new NetworkError('MEDIA_INVALID', c.status ?? `Instagram reports the media container as ${c.status_code}.`, { meta: { status: c } });
    await sleep(ctx.mode === 'mock' ? 10 : 3000);
  }
  throw new NetworkError('MEDIA_INVALID', 'Instagram did not finish processing the media in time.', { retryability: 'retryable' });
}

const tagsOf = (tagged: any[] | null | undefined, positioned: boolean) => {
  const list = (tagged ?? []).map(t => (positioned ? { username: t.username, x: t.x ?? 0.5, y: t.y ?? 0.5 } : { username: t.username }));
  return list.length ? JSON.stringify(list) : undefined;
};

async function createContainer(ctx: NetworkContext, a: AccountRuntime, form: Record<string, string | number | boolean | undefined | null>) {
  return ig<{ id: string }>(ctx, a, `/${igId(a)}/media`, { method: 'POST', form, timeoutMs: 120_000 });
}

/** Fields shared by every top-level (non-child) container. */
function topLevel(d: Record<string, any>, extra: Record<string, any> = {}) {
  const out: Record<string, any> = {
    caption: d.text || undefined, collaborators: json(d.collaborators), location_id: d.locationId || undefined, ...extra,
  };
  // branded_content_sponsor_ids: up to 2 sponsor Instagram user ids (Facebook Login only).
  if (d.isPaidPartnership) { out.is_paid_partnership = true; out.branded_content_sponsor_ids = json(d.brandedContentSponsors); }
  if (d.isAiGenerated) out.is_ai_generated = true;
  return out;
}

async function buildContainer(ctx: NetworkContext, input: { account: AccountRuntime; data: Record<string, any>; media: MediaRef[]; resolveUpload(id: string): Promise<MediaRef> }): Promise<{ id: string; type: string }> {
  const a = input.account;
  const d = input.data;
  const type: string = d.type ?? 'POST';
  const media = input.media;

  if (type === 'STORY') {
    const m = media[0];
    if (!m || media.length !== 1) throw fail('An Instagram Story needs exactly one image or video.');
    const c = await createContainer(ctx, a, { media_type: 'STORIES', ...(m.type === 'video' ? { video_url: m.url } : { image_url: m.url }), user_tags: tagsOf(d.tagged, true) });
    return { id: c.id, type };
  }

  const reelOf = async (v: MediaRef) => {
    const thumb = d.thumbnail ? await input.resolveUpload(d.thumbnail).catch(() => null) : null;
    // Instagram Audio API (Facebook Login only): audio_configuration = JSON { audio_id, audio_volume, video_volume }.
    const music = d.musicSoundInfo?.musicSoundId
      ? JSON.stringify({ audio_id: d.musicSoundInfo.musicSoundId, audio_volume: d.musicSoundInfo.musicSoundVolume ?? undefined, video_volume: d.musicSoundInfo.videoOriginalSoundVolume ?? undefined })
      : undefined;
    const c = await createContainer(ctx, a, {
      media_type: 'REELS', video_url: v.url, share_to_feed: d.shareToFeed ?? true,
      cover_url: thumb?.url, thumb_offset: thumb ? undefined : d.thumbnailOffset ?? undefined,
      user_tags: tagsOf(d.tagged, false), audio_configuration: music, trial_params: d.trialParams ? JSON.stringify({ graduation_strategy: d.trialParams.graduationStrategy }) : undefined,
      ...topLevel(d),
    });
    return { id: c.id, type: 'REEL' };
  };

  if (type === 'REEL') {
    const v = media.find(m => m.type === 'video');
    if (!v || media.length !== 1) throw fail('An Instagram Reel needs exactly one video.');
    return reelOf(v);
  }

  if (media.length === 1) {
    const m = media[0];
    // Feed videos are published as Reels.
    if (m.type === 'video') return reelOf(m);
    const c = await createContainer(ctx, a, { image_url: m.url, alt_text: d.altText ?? m.altText ?? undefined, user_tags: tagsOf(d.tagged, true), ...topLevel(d) });
    return { id: c.id, type };
  }

  if (media.length < 2) throw fail('An Instagram post needs media.');
  const items: any[] = d.carouselItems ?? [];
  const children: string[] = [];
  const videos: string[] = [];
  for (const m of media) {
    const item = items.find(x => x.uploadId === m.id);
    const alt = item?.altText ?? m.altText ?? undefined;
    const c = await createContainer(ctx, a, {
      is_carousel_item: true, ...(m.type === 'video' ? { media_type: 'VIDEO', video_url: m.url } : { image_url: m.url, alt_text: alt }),
      user_tags: tagsOf(item?.tagged, true),
    });
    children.push(c.id);
    if (m.type === 'video') videos.push(c.id);
  }
  for (const id of videos) await waitFinished(ctx, a, id);
  const parent = await createContainer(ctx, a, { media_type: 'CAROUSEL', children: children.join(','), ...topLevel(d) });
  return { id: parent.id, type };
}

async function permalinkOf(ctx: NetworkContext, a: AccountRuntime, mediaId: string): Promise<string | null> {
  const r = await ig<{ permalink?: string }>(ctx, a, `/${mediaId}`, { query: { fields: 'permalink' } }).catch(() => null);
  return r?.permalink ?? null;
}

// ───────────────────────────── data mapping ─────────────────────────────

/** insights {data:[{name, values:[{value}] | total_value:{value}}]} → { name: number } */
const insightValues = (res: any): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const m of res?.data ?? []) {
    const v = m.total_value?.value ?? m.values?.[m.values.length - 1]?.value;
    out[m.name] = typeof v === 'number' ? v : 0;
  }
  return out;
};

const toComment = (c: any, postId: string, parentId: string | null): FetchedCommentInput => ({
  externalId: String(c.id), externalParentId: parentId ?? (c.parent_id && c.parent_id !== postId ? String(c.parent_id) : null), externalPostId: postId,
  authorName: c.username ?? c.from?.username ?? null, authorExternalId: c.from?.id ? String(c.from.id) : null,
  authorProfileUrl: (c.username ?? c.from?.username) ? `https://www.instagram.com/${c.username ?? c.from.username}` : null,
  text: c.text ?? '', likesCount: c.like_count ?? 0, repliesCount: c.replies_count ?? c.replies?.data?.length ?? 0,
  publishedAt: c.timestamp ? new Date(c.timestamp) : null, platformData: { hidden: c.hidden ?? false },
});

const historyType = (m: any): HistoryPost['type'] =>
  m.media_product_type === 'REELS' ? 'REEL' : m.media_product_type === 'STORY' ? 'STORY' : m.media_type === 'VIDEO' ? 'VIDEO' : m.media_type === 'IMAGE' ? 'IMAGE' : 'POST';

const hashtags = (t: string) => (t.match(/#[\p{L}\p{N}_]+/gu) ?? []).length;
const mentions = (t: string) => (t.match(/@[\w.]+/g) ?? []).length;

export const instagram: NetworkAdapter = {
  type: 'INSTAGRAM',
  displayName: 'Instagram',
  // The Instagram Login app id/secret (instagramClientId / instagramClientSecret) are optional and fall back to these.
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: [...new Set([...FB_SCOPES, ...FB_MESSAGING_SCOPES, ...IG_SCOPES, ...IG_MESSAGING_SCOPES])],
  capabilities: {
    connect: 'oauth2', channels: 'optional', postTypes: ['POST', 'REEL', 'STORY'],
    comments: true, firstComment: true, editPost: false, deletePost: false, editComment: false, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'HIDE', 'UNHIDE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: true, metered: false,
  },
  limits: {
    textMax: 2200,
    commentMax: 2200,
    media: {
      maxItems: 10,
      image: { mimes: ['image/jpeg'], maxBytes: 8 * MB },
      video: { mimes: ['video/mp4', 'video/quicktime'], maxBytes: 300 * MB, minSeconds: 3, maxSeconds: 900 },
    },
  },
  errorReference: pickErrors('190', '4', '10', '100', '9004', '36003', '9007', '2207042', '2018278', '551'),

  async authorize(ctx, input) {
    const method: Method = input.options?.instagramConnectionMethod === 'INSTAGRAM' ? 'INSTAGRAM' : 'FACEBOOK';
    const messaging = !!input.options?.withMessagingScope;
    if (method === 'FACEBOOK') {
      const scopes = [...FB_SCOPES, ...(messaging ? FB_MESSAGING_SCOPES : [])];
      return { url: facebookDialogUrl(ctx, String(ctx.credentials.clientId ?? ''), scopes, input.state, input.forceLogin, messaging), extra: { method } };
    }
    return {
      url: authorizeUrl(`${IG_WWW}/oauth/authorize`, {
        client_id: appId(ctx, 'clientId'), redirect_uri: ctx.redirectUri, response_type: 'code', state: input.state,
        scope: [...IG_SCOPES, ...(messaging ? IG_MESSAGING_SCOPES : [])].join(','), force_reauth: input.forceLogin ? 'true' : undefined,
      }),
      extra: { method },
    };
  },

  async exchange(ctx, input) {
    const method: Method = (input.extra?.method ?? (input.extra?.options as any)?.instagramConnectionMethod) === 'INSTAGRAM' ? 'INSTAGRAM' : 'FACEBOOK';
    if (method === 'FACEBOOK') {
      const tok = await facebookLoginTokens(ctx, String(ctx.credentials.clientId ?? ''), String(ctx.credentials.clientSecret ?? ''), input.code);
      const me = await graph(ctx, `${FB_GRAPH}/me`, tok.accessToken, { query: { fields: 'id,name,email,picture.type(large){url}' } });
      const channels = await listChannels(ctx, tok.accessToken);
      return {
        token: { accessToken: tok.accessToken, expiresAt: tok.expiresAt, scopes: tok.scopes },
        profile: {
          externalId: String(me.id), providerPageId: String(me.id), username: null, displayName: me.name ?? null, avatarUrl: me.picture?.data?.url ?? null,
          userId: String(me.id), userDisplayName: me.name ?? null, userEmail: me.email ?? null, channels, instagramConnectionMethod: 'FACEBOOK',
        },
      };
    }
    // Instagram Login: the code may carry a trailing "#_".
    const short = await request<any>(ctx, `${IG_API}/oauth/access_token`, {
      method: 'POST', mapError: metaMapError,
      form: { client_id: appId(ctx, 'clientId'), client_secret: appId(ctx, 'clientSecret'), grant_type: 'authorization_code', redirect_uri: ctx.redirectUri, code: input.code.replace(/#_$/, '') },
    });
    const first = short.data?.[0] ?? short;
    const long = await graph<{ access_token: string; expires_in?: number }>(ctx, `${IG_GRAPH_ROOT}/access_token`, first.access_token, {
      query: { grant_type: 'ig_exchange_token', client_secret: appId(ctx, 'clientSecret') },
    });
    const me = await graph(ctx, `${IG_GRAPH}/me`, long.access_token, { query: { fields: PROFILE_FIELDS } });
    const p = igProfile(me);
    return {
      token: { accessToken: long.access_token, expiresAt: expiresIn(long.expires_in, ctx.now()), scopes: String(first.permissions ?? '').split(',').filter(Boolean) },
      profile: { ...p, providerPageId: p.externalId, userId: p.externalId, userUsername: p.username, userDisplayName: p.displayName, channels: [], instagramConnectionMethod: 'INSTAGRAM' },
    };
  },

  async refresh(ctx, a) {
    if (methodOf(a) === 'INSTAGRAM') {
      const r = await graph<{ access_token: string; expires_in?: number }>(ctx, `${IG_GRAPH_ROOT}/refresh_access_token`, a.token.accessToken, { query: { grant_type: 'ig_refresh_token' } });
      return { ...a.token, accessToken: r.access_token, expiresAt: expiresIn(r.expires_in, ctx.now()) ?? a.token.expiresAt ?? null };
    }
    const r = await graph<{ access_token: string; expires_in?: number }>(ctx, `${FB_GRAPH}/oauth/access_token`, null, {
      query: { grant_type: 'fb_exchange_token', client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret, fb_exchange_token: a.token.accessToken },
    });
    return { ...a.token, accessToken: r.access_token, expiresAt: expiresIn(r.expires_in, ctx.now()) ?? a.token.expiresAt ?? null };
  },

  async refreshProfile(ctx, a) {
    if (methodOf(a) === 'INSTAGRAM') {
      const me = await graph(ctx, `${IG_GRAPH}/me`, a.token.accessToken, { query: { fields: PROFILE_FIELDS } });
      const p = igProfile(me);
      return { ...p, providerPageId: p.externalId, userId: p.externalId, userUsername: p.username, userDisplayName: p.displayName };
    }
    const me = await graph(ctx, `${FB_GRAPH}/me`, a.token.accessToken, { query: { fields: 'id,name,email,picture.type(large){url}' } });
    const base = { providerPageId: String(me.id), userId: String(me.id), userDisplayName: me.name ?? null, userEmail: me.email ?? null };
    if (!a.channelId) return { ...base, externalId: String(me.id), displayName: me.name ?? null, avatarUrl: me.picture?.data?.url ?? null };
    const p = await ig(ctx, a, `/${a.channelId}`, { query: { fields: 'id,username,name,biography,profile_picture_url' } });
    return { ...base, externalId: String(p.id), username: p.username ?? null, displayName: p.name ?? p.username ?? null, avatarUrl: p.profile_picture_url ?? null, bio: p.biography ?? null };
  },

  async listChannels(ctx, a) {
    return methodOf(a) === 'INSTAGRAM' ? [] : listChannels(ctx, a.token.accessToken);
  },

  async selectChannel(ctx, a, channel) {
    if (methodOf(a) === 'INSTAGRAM') return { externalId: a.externalId ?? channel.id };
    const pageId = String(channel.metadata?.pageId ?? '');
    if (!pageId) throw fail('This Instagram account is not linked to a Facebook Page.');
    const pageToken = await pageAccessToken(ctx, a.token.accessToken, pageId);
    const p = await graph(ctx, `${FB_GRAPH}/${channel.id}`, pageToken, { query: { fields: 'id,username,name,profile_picture_url' } });
    return {
      externalId: String(p.id),
      token: { ...a.token, secrets: { ...(a.token.secrets ?? {}), pageToken, pageId } },
      profile: { username: p.username ?? null, displayName: p.name ?? p.username ?? null, avatarUrl: p.profile_picture_url ?? null },
    };
  },

  async checkConnection(ctx, a) {
    try {
      if (methodOf(a) === 'INSTAGRAM') await graph(ctx, `${IG_GRAPH}/me`, a.token.accessToken, { query: { fields: 'user_id' } });
      else if (a.channelId) await ig(ctx, a, `/${a.channelId}`, { query: { fields: 'id' } });
      else await graph(ctx, `${FB_GRAPH}/me`, a.token.accessToken, { query: { fields: 'id' } });
      return true;
    } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    // Instagram Login has no revoke endpoint; the user removes the app in Instagram settings.
    if (methodOf(a) === 'FACEBOOK') await graph(ctx, `${FB_GRAPH}/me/permissions`, a.token.accessToken, { method: 'DELETE' }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const type = data.type ?? 'POST';
    const videos = media.filter(m => m.type === 'video');
    const images = media.filter(m => m.type === 'image');
    const text = typeof data.text === 'string' ? data.text : '';
    checkText(issues, data.text, instagram.limits.textMax, ['text']);
    if (hashtags(text) > 30) issues.push({ code: 'too_many', message: 'Instagram allows at most 30 hashtags.', path: ['text'] });
    if (mentions(text) > 20) issues.push({ code: 'too_many', message: 'Instagram allows at most 20 @mentions.', path: ['text'] });
    checkMedia(issues, media, instagram.limits, ['uploadIds'], { required: true, types: ['image', 'video'] });

    if (type === 'REEL') {
      if (videos.length !== 1 || images.length) issues.push({ code: 'media', message: 'An Instagram Reel needs exactly one video.', path: ['uploadIds'] });
    } else if (type === 'STORY') {
      if (media.length !== 1) issues.push({ code: 'media', message: 'An Instagram Story needs exactly one image or video.', path: ['uploadIds'] });
      media.forEach((v, i) => { if (v.type === 'video' && v.duration != null && v.duration > 60) issues.push({ code: 'too_long', message: `Story videos are limited to 60 seconds; this one is ${Math.round(v.duration)}s.`, path: ['uploadIds', i] }); });
      media.forEach((v, i) => { if (v.type === 'video' && v.fileSize > 100 * MB) issues.push({ code: 'too_large', message: 'Story videos are limited to 100 MB.', path: ['uploadIds', i] }); });
    } else if (media.length > 1) {
      media.forEach((v, i) => { if (v.type === 'video' && v.duration != null && v.duration > 180) issues.push({ code: 'too_long', message: `Carousel videos are limited to 3 minutes; this one is ${Math.round(v.duration)}s.`, path: ['uploadIds', i] }); });
    }
    if (type !== 'REEL') {
      if (data.shareToFeed === false) issues.push({ code: 'not_supported', message: 'shareToFeed only applies to Reels.', path: ['shareToFeed'] });
      if (data.thumbnail) issues.push({ code: 'not_supported', message: 'A cover image only applies to Reels.', path: ['thumbnail'] });
      if (data.trialParams) issues.push({ code: 'not_supported', message: 'Trial reels only apply to Reels.', path: ['trialParams'] });
      if (data.musicSoundInfo) issues.push({ code: 'not_supported', message: 'Music only applies to Reels.', path: ['musicSoundInfo'] });
    }
    if (type === 'POST' && !(data.autoFitImage || data.autoCropImage)) {
      media.forEach((m, i) => {
        if (m.type !== 'image' || !m.width || !m.height) return;
        const ratio = m.width / m.height;
        if (ratio < 0.8 || ratio > 1.91) issues.push({ code: 'aspect', message: `Feed images must be between 4:5 and 1.91:1; this one is ${ratio.toFixed(2)}:1. Enable autoCropImage or autoFitImage.`, path: ['uploadIds', i] });
      });
    }
    if (Array.isArray(data.collaborators) && data.collaborators.length > 3) issues.push({ code: 'too_many', message: 'At most 3 collaborators.', path: ['collaborators'] });
    if (Array.isArray(data.tagged) && data.tagged.length > 20) issues.push({ code: 'too_many', message: 'At most 20 tagged accounts.', path: ['tagged'] });
    if (data.thumbnailOffset != null && (typeof data.thumbnailOffset !== 'number' || data.thumbnailOffset < 0)) issues.push({ code: 'invalid', message: 'thumbnailOffset must be 0 or more (milliseconds).', path: ['thumbnailOffset'] });
    if (Array.isArray(data.carouselItems) && data.carouselItems.length > 10) issues.push({ code: 'too_many', message: 'At most 10 carousel items.', path: ['carouselItems'] });
    if (data.brandedContentSponsors?.length && !data.isPaidPartnership) issues.push({ code: 'invalid', message: 'brandedContentSponsors needs isPaidPartnership.', path: ['brandedContentSponsors'] });
    (data.brandedContentSponsors ?? []).forEach((v: unknown, i: number) => { if (!/^\d+$/.test(String(v))) issues.push({ code: 'invalid', message: 'brandedContentSponsors takes the sponsor\'s Instagram user id (numeric), not a username.', path: ['brandedContentSponsors', i] }); });
    if (data.altText && charCount(String(data.altText)) > 1000) issues.push({ code: 'too_long', message: 'Alt text is limited to 1000 characters.', path: ['altText'] });
    return issues;
  },

  async publish(ctx, input) {
    const c = await buildContainer(ctx, input);
    return {
      status: 'PROCESSING', pendingRef: JSON.stringify({ k: 'ig', c: c.id, u: igId(input.account), t: c.type }),
      pollAfterMs: c.type === 'REEL' ? 10_000 : 5_000, externalData: { containerId: c.id, type: c.type },
    };
  },

  async poll(ctx, input, ref): Promise<PublishResult> {
    const p = parseRef<{ k: string; c: string; u: string; t?: string }>(ref);
    if (p.k !== 'ig') throw fail(`Unknown Instagram pending reference ${p.k}.`);
    const a = input.account;
    const st = await ig<{ status_code?: string; status?: string }>(ctx, a, `/${p.c}`, { query: { fields: 'status_code,status' } });
    if (st.status_code === 'ERROR' || st.status_code === 'EXPIRED') throw new NetworkError('MEDIA_INVALID', st.status ?? `Instagram reports the media container as ${st.status_code}.`, { meta: { status: st } });
    if (st.status_code === 'IN_PROGRESS') return { status: 'PROCESSING', pendingRef: ref, pollAfterMs: p.t === 'REEL' ? 15_000 : 5_000 };
    let mediaId: string;
    if (st.status_code === 'PUBLISHED') {
      // A previous poll published but crashed before saving: the newest media is ours.
      const last = await ig<{ data?: { id: string }[] }>(ctx, a, `/${p.u}/media`, { query: { fields: 'id', limit: 1 } });
      if (!last.data?.[0]) throw new NetworkError('UNKNOWN', 'The container is published but the media could not be found.');
      mediaId = last.data[0].id;
    } else {
      mediaId = (await ig<{ id: string }>(ctx, a, `/${p.u}/media_publish`, { method: 'POST', form: { creation_id: p.c } })).id;
    }
    return { status: 'POSTED', externalPostId: mediaId, permalink: await permalinkOf(ctx, a, mediaId), externalData: { containerId: p.c, type: p.t ?? 'POST' } };
  },

  async recentPosts(ctx, a, since) {
    const res = await ig(ctx, a, `/${igId(a)}/media`, { query: { fields: 'id,caption,timestamp,permalink', since: unix(since), limit: 25 } });
    return (res.data ?? [])
      .filter((p: any) => !p.timestamp || new Date(p.timestamp) >= since)
      .map((p: any) => ({ externalId: p.id, text: p.caption ?? null, createdAt: p.timestamp ? new Date(p.timestamp) : null, permalink: p.permalink ?? null }));
  },

  async comment(ctx, input) {
    const a = input.account;
    const target = input.parentExternalId ? `/${input.parentExternalId}/replies` : `/${input.externalPostId}/comments`;
    const r = await ig<{ id: string }>(ctx, a, target, { method: 'POST', form: { message: input.text } });
    return { externalId: r.id };
  },

  async deleteComment(ctx, a, id) {
    await ig(ctx, a, `/${id}`, { method: 'DELETE' });
  },

  async importComments(ctx, a, input) {
    // IG Comment fields (there is no replies_count; the count comes from replies{…}).
    const sub = 'id,text,timestamp,username,like_count,hidden,from';
    const res = await ig(ctx, a, `/${input.externalPostId}/comments`, {
      query: { fields: `${sub},replies{${sub}}`, limit: Math.min(50, input.limit), after: input.cursor ?? undefined },
    });
    const items: FetchedCommentInput[] = [];
    for (const c of res.data ?? []) {
      items.push(toComment(c, input.externalPostId, null));
      for (const r of c.replies?.data ?? []) items.push(toComment(r, input.externalPostId, String(c.id)));
    }
    return { items, nextCursor: nextAfter(res) };
  },

  async commentAction(ctx, a, comment, action) {
    if (action === 'DELETE') return void (await ig(ctx, a, `/${comment.externalId}`, { method: 'DELETE' }));
    if (action === 'HIDE' || action === 'UNHIDE') return void (await ig(ctx, a, `/${comment.externalId}`, { method: 'POST', form: { hide: action === 'HIDE' } }));
    throw new NetworkError('NOT_SUPPORTED', `Instagram comments do not support ${action}.`);
  },

  async accountAnalytics(ctx, a) {
    const id = igId(a);
    const until = ctx.now();
    const since = new Date(until.getTime() - 28 * 86_400_000);
    const [p, ins, demo] = await Promise.all([
      ig(ctx, a, `/${id}`, { query: { fields: 'followers_count,follows_count,media_count' } }),
      ig(ctx, a, `/${id}/insights`, { query: { metric: 'reach,views,likes,comments,accounts_engaged', metric_type: 'total_value', period: 'day', since: unix(since), until: unix(until) } }).catch(() => ({ data: [] })),
      ig(ctx, a, `/${id}/insights`, { query: { metric: 'follower_demographics', metric_type: 'total_value', period: 'lifetime', breakdown: 'country' } }).catch(() => null),
    ]);
    const v = insightValues(ins);
    const countries: Record<string, number> = {};
    for (const r of demo?.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? []) countries[String(r.dimension_values?.[0])] = Number(r.value ?? 0);
    return {
      followers: p.followers_count, following: p.follows_count, postCount: p.media_count,
      views: v.views, impressions: v.views, impressionsUnique: v.reach, viewsUnique: v.reach, likes: v.likes, comments: v.comments,
      audience: Object.keys(countries).length ? { countries } : null, raw: { profile: p, insights: v },
    };
  },

  async postAnalytics(ctx, a, id): Promise<PostMetrics> {
    const obj = await ig(ctx, a, `/${id}`, { query: { fields: 'like_count,comments_count,media_product_type' } });
    const metric = obj.media_product_type === 'STORY' ? 'reach,views,replies,shares,total_interactions' : 'reach,views,likes,comments,shares,saved,total_interactions';
    const v = insightValues(await ig(ctx, a, `/${id}/insights`, { query: { metric } }).catch(() => ({ data: [] })));
    return {
      likes: v.likes ?? obj.like_count ?? 0, comments: v.comments ?? v.replies ?? obj.comments_count ?? 0, shares: v.shares, saves: v.saved,
      views: v.views, impressions: v.views, viewsUnique: v.reach, impressionsUnique: v.reach, raw: { media: obj, insights: v },
    };
  },

  async importHistory(ctx, a, input) {
    const res = await ig(ctx, a, `/${igId(a)}/media`, { query: { fields: MEDIA_FIELDS, limit: Math.min(100, input.limit), after: input.cursor ?? undefined } });
    const items: HistoryPost[] = (res.data ?? []).map((m: any) => ({
      externalId: String(m.id), title: (m.caption ?? '').slice(0, 200) || null, permalink: m.permalink ?? null,
      publishedAt: m.timestamp ? new Date(m.timestamp) : null, type: historyType(m),
      thumbnail: m.thumbnail_url ?? m.media_url ?? null, smallThumbnail: m.thumbnail_url ?? m.media_url ?? null,
      extraData: { mediaType: m.media_type ?? null, mediaProductType: m.media_product_type ?? null },
      metrics: { likes: m.like_count ?? 0, comments: m.comments_count ?? 0 },
    }));
    return { items, nextCursor: nextAfter(res) };
  },

  misc: {
    'misc.instagram.businessDiscovery': async (ctx, a, { query }) => {
      const username = String(query.username ?? '').replace(/^@/, '');
      const fields = `business_discovery.username(${username}){id,username,followers_count,media_count,profile_picture_url,biography,name,media.limit(12){id,media_type,like_count,comments_count,timestamp,caption}}`;
      try {
        const res = await ig(ctx, a, `/${igId(a)}`, { query: { fields } });
        return { exists: !!res.business_discovery, data: res.business_discovery ?? null };
      } catch (e) {
        if (e instanceof NetworkError && (e.code === 'NOT_FOUND' || e.code === 'VALIDATION')) return { exists: false, data: null };
        throw e;
      }
    },
    'misc.instagram.searchLocations': async (ctx, a, { query }) => {
      if (methodOf(a) === 'INSTAGRAM') throw new NetworkError('NOT_SUPPORTED', 'Location search needs an Instagram account connected through Facebook Login.');
      const res = await graph(ctx, `${FB_GRAPH}/pages/search`, tokenOf(a), { query: { q: query.q, fields: 'id,name,link,location', limit: Number(query.limit ?? 10) } });
      return {
        items: (res.data ?? []).map((p: any) => ({
          locationId: String(p.id), name: p.name, link: p.link ?? null,
          location: p.location ? { city: p.location.city ?? null, country: p.location.country ?? null, latitude: p.location.latitude ?? null, longitude: p.location.longitude ?? null, state: p.location.state ?? null, street: p.location.street ?? null, zip: p.location.zip ?? null } : null,
        })),
      };
    },
    'misc.instagram.searchAudio': async (ctx, a, { query }) => {
      if (methodOf(a) === 'INSTAGRAM') throw new NetworkError('NOT_SUPPORTED', 'Audio search needs an Instagram account connected through Facebook Login.');
      const res = await graph(ctx, `${FB_GRAPH}/ig_audio`, tokenOf(a), {
        query: { audio_type: query.audioType ?? 'music', user_id: igId(a), search_query: query.searchQuery || undefined },
      });
      return {
        audio: (res.data ?? []).map((x: any) => ({
          audio_id: String(x.audio_id ?? x.id), audio_type: x.audio_type ?? query.audioType ?? 'music', title: x.title ?? null, display_artist: x.display_artist ?? null,
          duration_in_ms: x.duration_in_ms ?? null, download_url: x.download_url ?? null, cover_artwork_thumbnail_uri: x.cover_artwork_thumbnail_uri ?? null,
          cover_artwork_thumbnail_url: x.cover_artwork_thumbnail_url ?? null, ig_username: x.ig_username ?? null, profile_picture_url: x.profile_picture_url ?? null,
        })),
      };
    },
    'misc.instagram.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await instagram.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
  },

  messaging: metaMessaging('INSTAGRAM', async (ctx, a) => {
    if (methodOf(a) === 'INSTAGRAM') {
      const id = igId(a);
      return { base: IG_GRAPH, senderId: id, token: a.token.accessToken, platform: null, subscribe: { id, fields: IG_WEBHOOK_FIELDS } };
    }
    const page = pageIdOf(a);
    const s = a.token.secrets ?? {};
    const token = s.pageToken && s.pageId === page ? String(s.pageToken) : await pageAccessToken(ctx, a.token.accessToken, page);
    return { base: FB_GRAPH, senderId: page, token, platform: 'instagram', subscribe: { id: page, fields: PAGE_WEBHOOK_FIELDS } };
  }),
};
