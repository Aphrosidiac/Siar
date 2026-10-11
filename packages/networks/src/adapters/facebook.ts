/**
 * Facebook Pages — Graph API with Facebook Login.
 *
 * Connect: Facebook Login dialog → code → user token → long-lived user token (fb_exchange_token).
 * The user's Pages are the channels (GET /me/accounts). Selecting a Page stores its Page access
 * token in token.secrets.pageToken (a Page token minted from a long-lived user token does not
 * expire); every Page call uses it.
 *
 * Publishing (all media pulled by URL from our media domain):
 *   text / link              POST /{page}/feed
 *   one image                POST /{page}/photos (url)
 *   several images           POST /{page}/photos published=false ×n → /{page}/feed attached_media
 *   video                    POST /{page}/videos (file_url)
 *   REEL                     /{page}/video_reels start → rupload (file_url header) → finish → poll status
 *   STORY                    /{page}/photo_stories (unpublished photo) or /{page}/video_stories
 *
 * Docs: https://developers.facebook.com/docs/pages-api
 *       https://developers.facebook.com/docs/video-api/guides/reels-publishing
 *       https://developers.facebook.com/docs/page-stories-api
 */
import { NetworkError } from '../lib/errors.js';
import { request } from '../lib/http.js';
import { charCount, checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type { AccountRuntime, Channel, FetchedCommentInput, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, PublishResult, ReviewInput } from '../types.js';
import {
  FB_GRAPH, FB_RUPLOAD, facebookDialogUrl, facebookLoginTokens, graph, metaMapError, metaMessaging, nextAfter, pageAccessToken, parseRef, pickErrors, unix,
} from './meta-common.js';

const BASE_SCOPES = [
  'public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_read_user_content', 'pages_manage_posts',
  'pages_manage_engagement', 'pages_manage_metadata', 'read_insights', 'business_management',
];
const MESSAGING_SCOPES = ['pages_messaging'];
const PAGE_FIELDS = 'id,name,username,link,category,tasks,picture.type(large){url},instagram_business_account{id,username}';
const WEBHOOK_FIELDS = ['messages', 'messaging_postbacks', 'message_reactions', 'message_reads', 'message_echoes', 'messaging_referrals', 'feed'];

/** Feed scheduling window (Meta: 10 minutes to 30 days ahead; Reels: under 29 days). */
const MIN_SCHEDULE_MS = 10 * 60_000;
const MAX_SCHEDULE_DAYS = { feed: 30, reel: 29 };

/** Static Facebook background-text presets (text-only posts ≤ 130 chars). Meta exposes no listing endpoint. */
const TEXT_PRESETS = [
  { id: '106018623298955', label: 'Solid purple', kind: 'color', color: '#8B5CF6' },
  { id: '1903718606535395', label: 'Solid red', kind: 'color', color: '#E11D48' },
  { id: '1881421442117417', label: 'Solid blue', kind: 'color', color: '#2563EB' },
  { id: '1777259169190672', label: 'Solid black', kind: 'color', color: '#111827' },
  { id: '191761991491375', label: 'Purple–pink gradient', kind: 'gradient', color: null },
  { id: '204187940028597', label: 'Orange–red gradient', kind: 'gradient', color: null },
  { id: '1679427598947616', label: 'Blue–teal gradient', kind: 'gradient', color: null },
  { id: '303063890126415', label: 'Hearts', kind: 'illustration', color: null },
] as const;

const fail = (msg: string) => new NetworkError('VALIDATION', msg);

const pageIdOf = (a: AccountRuntime) => {
  const id = a.channelId ?? (a.token.secrets?.pageId as string | undefined);
  if (!id) throw new NetworkError('VALIDATION', 'Pick a Facebook Page for this account before posting.');
  return id;
};

/** The Page token: from secrets when it belongs to the selected Page, else minted from the user token. */
async function pageToken(ctx: NetworkContext, a: AccountRuntime): Promise<string> {
  const page = pageIdOf(a);
  const s = a.token.secrets ?? {};
  if (s.pageToken && (!s.pageId || s.pageId === page)) return String(s.pageToken);
  return pageAccessToken(ctx, a.token.accessToken, page);
}

/** Page-scoped call: resolves the Page token first. */
async function pg<T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: Parameters<typeof graph>[3] = {}) {
  return graph<T>(ctx, `${FB_GRAPH}${path}`, await pageToken(ctx, a), opts);
}

const channelOf = (p: any): Channel => ({
  id: String(p.id), name: p.name ?? null, username: p.username ?? null, avatarUrl: p.picture?.data?.url ?? null, address: p.link ?? null,
  metadata: { category: p.category ?? null, tasks: p.tasks ?? [], instagramBusinessAccountId: p.instagram_business_account?.id ?? null },
});

async function listPages(ctx: NetworkContext, userToken: string): Promise<Channel[]> {
  const out: Channel[] = [];
  let after: string | null = null;
  for (let i = 0; i < 10; i++) {
    const res: any = await graph(ctx, `${FB_GRAPH}/me/accounts`, userToken, { query: { fields: PAGE_FIELDS, limit: 100, after: after ?? undefined } });
    out.push(...(res.data ?? []).map(channelOf));
    after = nextAfter(res);
    if (!after) break;
  }
  return out;
}

const userProfile = (me: any) => ({
  externalId: String(me.id), providerPageId: String(me.id), username: null, displayName: me.name ?? null, avatarUrl: me.picture?.data?.url ?? null,
  userId: String(me.id), userDisplayName: me.name ?? null, userEmail: me.email ?? null,
});

const scheduleOf = (d: Record<string, any>) => (d.nativeScheduleTime ? unix(d.nativeScheduleTime) : null);

async function permalinkOf(ctx: NetworkContext, a: AccountRuntime, id: string): Promise<string | null> {
  const r = await pg<{ permalink_url?: string }>(ctx, a, `/${id}`, { query: { fields: 'permalink_url' } }).catch(() => null);
  return r?.permalink_url ? (r.permalink_url.startsWith('http') ? r.permalink_url : `https://www.facebook.com${r.permalink_url}`) : null;
}

/** Hosted-file upload to rupload.facebook.com (Reels and video Stories). */
async function ruploadFromUrl(ctx: NetworkContext, token: string, videoId: string, uploadUrl: string | undefined, m: MediaRef) {
  const res = await request<{ success?: boolean }>(ctx, uploadUrl || `${FB_RUPLOAD}/${videoId}`, {
    method: 'POST', headers: { authorization: `OAuth ${token}`, file_url: m.url }, timeoutMs: 300_000,
    mapError: metaMapError,
  });
  if (res && res.success === false) throw new NetworkError('MEDIA_INVALID', 'Facebook could not fetch the video from its URL.');
}

async function setThumbnail(ctx: NetworkContext, token: string, videoId: string, thumb: MediaRef | null) {
  if (!thumb) return;
  const form = new FormData();
  form.set('source', new Blob([new Uint8Array(await thumb.read())], { type: thumb.mime }), `thumb.${thumb.ext}`);
  form.set('is_preferred', 'true');
  await graph(ctx, `${FB_GRAPH}/${videoId}/thumbnails`, token, { method: 'POST', body: form });
}

async function publishReel(ctx: NetworkContext, a: AccountRuntime, d: Record<string, any>, v: MediaRef, thumb: MediaRef | null): Promise<PublishResult> {
  const page = pageIdOf(a);
  const tok = await pageToken(ctx, a);
  const start = await graph<{ video_id: string; upload_url?: string }>(ctx, `${FB_GRAPH}/${page}/video_reels`, tok, { method: 'POST', form: { upload_phase: 'start' } });
  await ruploadFromUrl(ctx, tok, start.video_id, start.upload_url, v);
  await setThumbnail(ctx, tok, start.video_id, thumb).catch(err => ctx.log.warn({ err: (err as Error).message }, 'reel thumbnail failed'));
  const sched = scheduleOf(d);
  await graph(ctx, `${FB_GRAPH}/${page}/video_reels`, tok, {
    method: 'POST',
    form: { upload_phase: 'finish', video_id: start.video_id, video_state: sched ? 'SCHEDULED' : 'PUBLISHED', scheduled_publish_time: sched, description: d.text ?? undefined, title: d.mediaTitle ?? undefined },
  });
  return { status: 'PROCESSING', pendingRef: JSON.stringify({ k: 'reel', videoId: start.video_id, scheduled: !!sched }), pollAfterMs: 10_000, externalData: { videoId: start.video_id } };
}

async function publishStory(ctx: NetworkContext, a: AccountRuntime, m: MediaRef): Promise<PublishResult> {
  const page = pageIdOf(a);
  const tok = await pageToken(ctx, a);
  if (m.type === 'image') {
    const photo = await graph<{ id: string }>(ctx, `${FB_GRAPH}/${page}/photos`, tok, { method: 'POST', form: { url: m.url, published: false } });
    const st = await graph<{ success: boolean; post_id: string }>(ctx, `${FB_GRAPH}/${page}/photo_stories`, tok, { method: 'POST', form: { photo_id: photo.id } });
    return { status: 'POSTED', externalPostId: st.post_id, externalAlternatePostId: photo.id, permalink: `https://www.facebook.com/stories/${page}`, externalData: { story: true, photoId: photo.id } };
  }
  const start = await graph<{ video_id: string; upload_url?: string }>(ctx, `${FB_GRAPH}/${page}/video_stories`, tok, { method: 'POST', form: { upload_phase: 'start' } });
  await ruploadFromUrl(ctx, tok, start.video_id, start.upload_url, m);
  const st = await graph<{ success: boolean; post_id: string }>(ctx, `${FB_GRAPH}/${page}/video_stories`, tok, { method: 'POST', form: { upload_phase: 'finish', video_id: start.video_id } });
  return { status: 'POSTED', externalPostId: st.post_id, externalVideoId: start.video_id, permalink: `https://www.facebook.com/stories/${page}`, externalData: { story: true, videoId: start.video_id } };
}

const metricsOf = (p: any, ins: Record<string, number>): PostMetrics => ({
  likes: p?.reactions?.summary?.total_count ?? 0,
  comments: p?.comments?.summary?.total_count ?? 0,
  shares: p?.shares?.count ?? 0,
  impressions: ins.post_media_view ?? ins.blue_reels_play_count ?? ins.total_video_views,
  views: ins.post_media_view ?? ins.blue_reels_play_count ?? ins.total_video_views,
  impressionsUnique: ins.post_total_media_view_unique,
  raw: { reactions: p?.reactions?.summary?.total_count ?? 0, comments: p?.comments?.summary?.total_count ?? 0, shares: p?.shares?.count ?? 0, insights: ins },
});

/** insights {data:[{name, values:[{value}]}]} → { name: latest value } */
const insightValues = (res: any): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const m of res?.data ?? []) {
    const v = m.values?.[m.values.length - 1]?.value ?? m.total_value?.value;
    out[m.name] = typeof v === 'number' ? v : typeof v === 'object' && v ? Object.values(v as Record<string, number>).reduce((s, x) => s + Number(x || 0), 0) : 0;
  }
  return out;
};

const toComment = (c: any, postId: string): FetchedCommentInput => ({
  externalId: String(c.id),
  externalParentId: c.parent?.id && c.parent.id !== postId ? String(c.parent.id) : null,
  externalPostId: postId,
  authorName: c.from?.name ?? null,
  authorExternalId: c.from?.id ? String(c.from.id) : null,
  authorAvatarUrl: c.from?.picture?.data?.url ?? null,
  text: c.message ?? '',
  likesCount: c.like_count ?? 0,
  repliesCount: c.comment_count ?? 0,
  publishedAt: c.created_time ? new Date(c.created_time) : null,
  platformData: { is_hidden: c.is_hidden ?? false, permalink_url: c.permalink_url ?? null, attachment: c.attachment ?? null, can_hide: c.can_hide ?? null },
});

const REC_FIELDS = 'created_time,has_rating,has_review,rating,recommendation_type,review_text,reviewer{id,name,picture},open_graph_story{id,comments{id,message,from,created_time}}';

const recommendationOf = (r: any, pageId: string): ReviewInput => {
  const story = r.open_graph_story ?? {};
  const own = (story.comments?.data ?? []).filter((c: any) => String(c.from?.id) === pageId).pop();
  return {
    externalId: String(story.id ?? `${r.reviewer?.id ?? 'anon'}_${r.created_time}`),
    reviewerName: r.reviewer?.name ?? null,
    reviewerAvatarUrl: r.reviewer?.picture?.data?.url ?? null,
    rating: r.has_rating ? r.rating ?? null : null,
    recommendationType: r.recommendation_type === 'positive' ? 'RECOMMEND' : r.recommendation_type === 'negative' ? 'NOT_RECOMMEND' : 'UNKNOWN',
    text: r.review_text ?? null,
    replyText: own?.message ?? null,
    replyUpdatedAt: own?.created_time ? new Date(own.created_time) : null,
    publishedAt: r.created_time ? new Date(r.created_time) : null,
    platformData: { openGraphStoryId: story.id ?? null, ownerReplyCommentId: own?.id ?? null, hasReview: r.has_review ?? null, commentsCount: story.comments?.data?.length ?? 0 },
  };
};

export const facebook: NetworkAdapter = {
  type: 'FACEBOOK',
  displayName: 'Facebook',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: [...BASE_SCOPES, ...MESSAGING_SCOPES],
  capabilities: {
    connect: 'oauth2', channels: 'required', postTypes: ['POST', 'REEL', 'STORY'],
    comments: true, firstComment: true, editPost: true, deletePost: true, editComment: true, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'HIDE', 'UNHIDE', 'LIKE', 'UNLIKE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: true, metered: false,
  },
  limits: {
    textMax: 63206,
    commentMax: 8000,
    media: {
      maxItems: 10,
      image: { mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/tiff', 'image/webp'], maxBytes: 10 * MB },
      // Hosted-file (non-resumable) video uploads: up to 1 GB and 20 minutes.
      video: { mimes: ['video/mp4', 'video/quicktime'], maxBytes: 1 * GB, maxSeconds: 1200 },
    },
  },
  errorReference: pickErrors('190', '4', '17', '32', '613', '10', '200', '100', '368', '506', '2018278', '551'),

  async authorize(ctx, input) {
    const scopes = [...BASE_SCOPES, ...(input.options?.withMessagingScope ? MESSAGING_SCOPES : [])];
    return { url: facebookDialogUrl(ctx, String(ctx.credentials.clientId ?? ''), scopes, input.state, input.forceLogin) };
  },

  async exchange(ctx, input) {
    const tok = await facebookLoginTokens(ctx, String(ctx.credentials.clientId ?? ''), String(ctx.credentials.clientSecret ?? ''), input.code);
    const me = await graph(ctx, `${FB_GRAPH}/me`, tok.accessToken, { query: { fields: 'id,name,email,picture.type(large){url}' } });
    const channels = await listPages(ctx, tok.accessToken);
    return { token: { accessToken: tok.accessToken, expiresAt: tok.expiresAt, scopes: tok.scopes }, profile: { ...userProfile(me), channels } };
  },

  async refresh(ctx, a) {
    // A still-valid long-lived user token can be exchanged again; Page tokens minted from it never expire.
    const r = await graph<{ access_token: string; expires_in?: number }>(ctx, `${FB_GRAPH}/oauth/access_token`, null, {
      query: { grant_type: 'fb_exchange_token', client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret, fb_exchange_token: a.token.accessToken },
    });
    return { ...a.token, accessToken: r.access_token, expiresAt: r.expires_in ? new Date(ctx.now().getTime() + r.expires_in * 1000) : a.token.expiresAt ?? null };
  },

  async refreshProfile(ctx, a) {
    const me = await graph(ctx, `${FB_GRAPH}/me`, a.token.accessToken, { query: { fields: 'id,name,email,picture.type(large){url}' } });
    const base = userProfile(me);
    if (!a.channelId) return base;
    const p = await pg(ctx, a, `/${a.channelId}`, { query: { fields: 'id,name,username,about,picture.type(large){url}' } });
    return { ...base, externalId: String(p.id), username: p.username ?? null, displayName: p.name ?? null, avatarUrl: p.picture?.data?.url ?? null, bio: p.about ?? null };
  },

  async listChannels(ctx, a) {
    return listPages(ctx, a.token.accessToken);
  },

  async selectChannel(ctx, a, channel) {
    const p = await graph(ctx, `${FB_GRAPH}/${channel.id}`, a.token.accessToken, { query: { fields: 'id,name,username,access_token,picture.type(large){url}' } });
    if (!p.access_token) throw new NetworkError('PERMISSION', 'Facebook did not return a Page access token. The connected user needs a task on this Page.');
    return {
      externalId: String(p.id),
      token: { ...a.token, secrets: { ...(a.token.secrets ?? {}), pageToken: p.access_token, pageId: String(p.id) } },
      profile: { username: p.username ?? null, displayName: p.name ?? null, avatarUrl: p.picture?.data?.url ?? null },
    };
  },

  async checkConnection(ctx, a) {
    try {
      if (a.channelId) await pg(ctx, a, `/${a.channelId}`, { query: { fields: 'id' } });
      else await graph(ctx, `${FB_GRAPH}/me`, a.token.accessToken, { query: { fields: 'id' } });
      return true;
    } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await graph(ctx, `${FB_GRAPH}/me/permissions`, a.token.accessToken, { method: 'DELETE' }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const type = data.type ?? 'POST';
    const images = media.filter(m => m.type === 'image');
    const videos = media.filter(m => m.type === 'video');
    checkText(issues, data.text, facebook.limits.textMax, ['text']);
    checkMedia(issues, media, facebook.limits, ['uploadIds'], { types: ['image', 'video'] });
    const sched = data.nativeScheduleTime ? new Date(data.nativeScheduleTime).getTime() : null;
    if (data.nativeScheduleTime && Number.isNaN(sched)) issues.push({ code: 'invalid', message: 'nativeScheduleTime is not a valid date.', path: ['nativeScheduleTime'] });
    else if (sched !== null) {
      const ahead = sched - Date.now();
      const maxDays = type === 'REEL' ? MAX_SCHEDULE_DAYS.reel : MAX_SCHEDULE_DAYS.feed;
      if (type === 'STORY') issues.push({ code: 'not_supported', message: 'Facebook Stories cannot be natively scheduled.', path: ['nativeScheduleTime'] });
      else if (ahead < MIN_SCHEDULE_MS || ahead > maxDays * 86_400_000) issues.push({ code: 'out_of_range', message: `nativeScheduleTime must be between 10 minutes and ${maxDays} days from now.`, path: ['nativeScheduleTime'] });
    }
    if (type === 'REEL') {
      if (videos.length !== 1 || images.length) issues.push({ code: 'media', message: 'A Facebook Reel needs exactly one video.', path: ['uploadIds'] });
      for (const [i, v] of media.entries()) {
        if (v.type !== 'video' || v.duration == null) continue;
        if (v.duration < 3 || v.duration > 90) issues.push({ code: 'duration', message: `Reels must be 3–90 seconds; this video is ${Math.round(v.duration)}s.`, path: ['uploadIds', i] });
        if (v.width && v.height && v.width > v.height) issues.push({ code: 'aspect', message: 'Reels must be vertical (9:16).', path: ['uploadIds', i] });
      }
      if (data.link) issues.push({ code: 'not_supported', message: 'Reels cannot carry a link.', path: ['link'] });
    } else if (type === 'STORY') {
      if (media.length !== 1) issues.push({ code: 'media', message: 'A Facebook Story needs exactly one image or video.', path: ['uploadIds'] });
      for (const [i, v] of media.entries()) if (v.type === 'video' && v.duration != null && (v.duration < 3 || v.duration > 60)) issues.push({ code: 'duration', message: `Story videos must be 3–60 seconds; this one is ${Math.round(v.duration)}s.`, path: ['uploadIds', i] });
      if (data.link) issues.push({ code: 'not_supported', message: 'Stories cannot carry a link.', path: ['link'] });
    } else {
      if (!media.length && !data.link && !(typeof data.text === 'string' && data.text.trim())) issues.push({ code: 'required', message: 'A Facebook post needs text, a link or media.', path: ['text'] });
      if (videos.length > 1 || (videos.length && images.length)) issues.push({ code: 'mixed', message: 'A Facebook post takes several images or one video, not both.', path: ['uploadIds'] });
      if (data.link && media.length) issues.push({ code: 'link_with_media', message: 'A link post cannot also attach media; the link preview is the attachment.', path: ['link'] });
    }
    if (data.link) { try { new URL(data.link); } catch { issues.push({ code: 'invalid', message: 'link must be an absolute URL.', path: ['link'] }); } }
    if (data.thumbnail && !videos.length) issues.push({ code: 'not_supported', message: 'A thumbnail only applies to video posts.', path: ['thumbnail'] });
    if (data.mediaTitle && !videos.length) issues.push({ code: 'not_supported', message: 'mediaTitle only applies to video posts.', path: ['mediaTitle'] });
    if (data.textFormatPresetId) {
      if (type !== 'POST' || media.length || data.link) issues.push({ code: 'not_supported', message: 'Background text presets apply to text-only posts.', path: ['textFormatPresetId'] });
      if (typeof data.text === 'string' && charCount(data.text) > 130) issues.push({ code: 'too_long', message: 'Text with a background preset is limited to 130 characters.', path: ['text'] });
    }
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const d = input.data;
    const type = d.type ?? 'POST';
    const page = pageIdOf(a);
    const thumb = d.thumbnail ? await input.resolveUpload(d.thumbnail).catch(() => null) : null;
    const images = input.media.filter(m => m.type === 'image');
    const videos = input.media.filter(m => m.type === 'video');

    if (type === 'REEL') {
      if (videos.length !== 1) throw fail('A Facebook Reel needs exactly one video.');
      return publishReel(ctx, a, d, videos[0], thumb);
    }
    if (type === 'STORY') {
      if (input.media.length !== 1) throw fail('A Facebook Story needs exactly one image or video.');
      return publishStory(ctx, a, input.media[0]);
    }

    const sched = scheduleOf(d);
    const when = sched ? { published: false, scheduled_publish_time: sched } : {};
    const extra = (o: Record<string, unknown>) => ({ ...o, scheduled: !!sched });

    if (videos.length) {
      const v = videos[0];
      const tok = await pageToken(ctx, a);
      let res: { id: string };
      if (thumb) {
        const form = new FormData();
        form.set('file_url', v.url);
        if (d.text) form.set('description', d.text);
        if (d.mediaTitle) form.set('title', d.mediaTitle);
        if (sched) { form.set('published', 'false'); form.set('scheduled_publish_time', String(sched)); }
        form.set('thumb', new Blob([new Uint8Array(await thumb.read())], { type: thumb.mime }), `thumb.${thumb.ext}`);
        res = await graph(ctx, `${FB_GRAPH}/${page}/videos`, tok, { method: 'POST', body: form, timeoutMs: 300_000 });
      } else {
        res = await graph(ctx, `${FB_GRAPH}/${page}/videos`, tok, { method: 'POST', form: { file_url: v.url, description: d.text ?? undefined, title: d.mediaTitle ?? undefined, ...when }, timeoutMs: 300_000 });
      }
      return { status: 'POSTED', externalPostId: res.id, externalVideoId: res.id, permalink: `https://www.facebook.com/${page}/videos/${res.id}`, externalData: extra({ videoId: res.id, kind: 'video' }) };
    }

    if (images.length === 1) {
      const m = images[0];
      const res = await pg<{ id: string; post_id: string }>(ctx, a, `/${page}/photos`, { method: 'POST', form: { url: m.url, caption: d.text ?? undefined, alt_text_custom: m.altText ?? undefined, ...when } });
      const postId = res.post_id ?? `${page}_${res.id}`;
      return { status: 'POSTED', externalPostId: postId, externalAlternatePostId: res.id, permalink: (await permalinkOf(ctx, a, postId)) ?? `https://www.facebook.com/${postId}`, externalData: extra({ photoId: res.id, postId }) };
    }

    let attached: { media_fbid: string }[] | undefined;
    if (images.length > 1) {
      attached = [];
      for (const m of images) {
        // Unpublished photos become the post's attachments; `temporary` is required for scheduled posts.
        const ph = await pg<{ id: string }>(ctx, a, `/${page}/photos`, { method: 'POST', form: { url: m.url, published: false, temporary: sched ? true : undefined, alt_text_custom: m.altText ?? undefined } });
        attached.push({ media_fbid: ph.id });
      }
    }
    const res = await pg<{ id: string }>(ctx, a, `/${page}/feed`, {
      method: 'POST',
      json: {
        message: d.text ?? undefined, link: d.link ?? undefined, attached_media: attached,
        text_format_preset_id: d.textFormatPresetId ?? undefined, ...when,
      },
    });
    return { status: 'POSTED', externalPostId: res.id, permalink: (await permalinkOf(ctx, a, res.id)) ?? `https://www.facebook.com/${res.id}`, externalData: extra({ postId: res.id, photoIds: attached?.map(x => x.media_fbid) ?? [] }) };
  },

  async poll(ctx, input, ref) {
    const p = parseRef<{ k: string; videoId: string; scheduled?: boolean }>(ref);
    if (p.k !== 'reel') throw fail(`Unknown Facebook pending reference ${p.k}.`);
    const a = input.account;
    const v = await pg(ctx, a, `/${p.videoId}`, { query: { fields: 'status,permalink_url,post_id' } });
    const st = v.status ?? {};
    const failed = ['error', 'expired', 'upload_failed'].includes(st.video_status) || st.processing_phase?.status === 'error' || st.publishing_phase?.status === 'error' || st.uploading_phase?.status === 'error';
    if (failed) {
      const why = st.processing_phase?.error?.message ?? st.publishing_phase?.error?.message ?? st.uploading_phase?.errors?.[0]?.message ?? `Facebook reports the Reel as ${st.video_status}.`;
      throw new NetworkError('MEDIA_INVALID', why, { meta: { status: st } });
    }
    const done = st.publishing_phase?.status === 'complete' || ['published', 'scheduled'].includes(st.publishing_phase?.publish_status);
    if (!done) return { status: 'PROCESSING', pendingRef: ref, pollAfterMs: 15_000 };
    const permalink = v.permalink_url ? (v.permalink_url.startsWith('http') ? v.permalink_url : `https://www.facebook.com${v.permalink_url}`) : `https://www.facebook.com/reel/${p.videoId}`;
    return { status: 'POSTED', externalPostId: p.videoId, externalVideoId: p.videoId, externalAlternatePostId: v.post_id ?? null, permalink, externalData: { videoId: p.videoId, kind: 'reel', scheduled: !!p.scheduled } };
  },

  async recentPosts(ctx, a, since) {
    const res = await pg(ctx, a, `/${pageIdOf(a)}/published_posts`, { query: { fields: 'id,message,created_time,permalink_url', since: unix(since), limit: 25 } });
    return (res.data ?? []).map((p: any) => ({ externalId: p.id, text: p.message ?? null, createdAt: p.created_time ? new Date(p.created_time) : null, permalink: p.permalink_url ?? null }));
  },

  async deletePost(ctx, a, id) {
    await pg(ctx, a, `/${id}`, { method: 'DELETE' });
  },

  async editPost(ctx, a, id, data) {
    const text = data.text ?? data.description;
    if (typeof text !== 'string') throw fail('Editing a Facebook post needs the new text.');
    // Posts take `message`; videos and reels take `description`.
    const isVideo = !String(id).includes('_') && data.kind !== 'post';
    await pg(ctx, a, `/${id}`, { method: 'POST', form: isVideo ? { description: text } : { message: text } });
  },

  async comment(ctx, input) {
    const a = input.account;
    const res = await pg<{ id: string }>(ctx, a, `/${input.parentExternalId ?? input.externalPostId}/comments`, {
      method: 'POST', form: { message: input.text, attachment_url: input.media.find(m => m.type === 'image')?.url },
    });
    return { externalId: res.id, permalink: null };
  },

  async editComment(ctx, a, id, text) {
    await pg(ctx, a, `/${id}`, { method: 'POST', form: { message: text } });
  },

  async deleteComment(ctx, a, id) {
    await pg(ctx, a, `/${id}`, { method: 'DELETE' });
  },

  async importComments(ctx, a, input) {
    const res = await pg(ctx, a, `/${input.externalPostId}/comments`, {
      query: {
        fields: 'id,message,from{id,name,picture},created_time,like_count,comment_count,parent{id},is_hidden,can_hide,permalink_url,attachment',
        filter: 'stream', order: 'chronological', limit: Math.min(100, input.limit), after: input.cursor ?? undefined,
      },
    });
    return { items: (res.data ?? []).map((c: any) => toComment(c, input.externalPostId)), nextCursor: nextAfter(res) };
  },

  async commentAction(ctx, a, comment, action) {
    const id = comment.externalId;
    switch (action) {
      case 'DELETE': return void (await pg(ctx, a, `/${id}`, { method: 'DELETE' }));
      case 'HIDE': return void (await pg(ctx, a, `/${id}`, { method: 'POST', form: { is_hidden: true } }));
      case 'UNHIDE': return void (await pg(ctx, a, `/${id}`, { method: 'POST', form: { is_hidden: false } }));
      case 'LIKE': return void (await pg(ctx, a, `/${id}/likes`, { method: 'POST' }));
      case 'UNLIKE': return void (await pg(ctx, a, `/${id}/likes`, { method: 'DELETE' }));
      default: throw new NetworkError('NOT_SUPPORTED', `Facebook does not support ${action} on comments.`);
    }
  },

  async accountAnalytics(ctx, a) {
    const page = pageIdOf(a);
    const p = await pg(ctx, a, `/${page}`, { query: { fields: 'followers_count,fan_count,name' } });
    let ins: Record<string, number> = {};
    let insightsError: string | null = null;
    try {
      ins = insightValues(await pg(ctx, a, `/${page}/insights`, { query: { metric: 'page_media_view,page_total_media_view_unique,page_post_engagements,page_follows', period: 'days_28' } }));
    } catch (e) {
      if (!(e instanceof NetworkError) || !['VALIDATION', 'PERMISSION'].includes(e.code)) throw e;
      insightsError = e.message;
    }
    return {
      followers: p.followers_count ?? p.fan_count ?? 0,
      impressions: ins.page_media_view, views: ins.page_media_view, impressionsUnique: ins.page_total_media_view_unique,
      likes: ins.page_post_engagements,
      raw: { followers_count: p.followers_count, fan_count: p.fan_count, insights: ins, insightsError },
    };
  },

  async postAnalytics(ctx, a, id) {
    const isVideo = !String(id).includes('_');
    if (isVideo) {
      const [v, ins] = await Promise.all([
        pg(ctx, a, `/${id}`, { query: { fields: 'likes.summary(true).limit(0),comments.summary(true).limit(0)' } }),
        pg(ctx, a, `/${id}/video_insights`, { query: { metric: 'blue_reels_play_count,total_video_views,post_video_likes_by_reaction_type' } }).catch(() => ({ data: [] })),
      ]);
      const vals = insightValues(ins);
      return { ...metricsOf(v, vals), likes: v?.likes?.summary?.total_count ?? vals.post_video_likes_by_reaction_type ?? 0 };
    }
    const [p, ins] = await Promise.all([
      pg(ctx, a, `/${id}`, { query: { fields: 'reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),shares' } }),
      pg(ctx, a, `/${id}/insights`, { query: { metric: 'post_media_view,post_total_media_view_unique,post_clicks' } }).catch(() => ({ data: [] })),
    ]);
    return metricsOf(p, insightValues(ins));
  },

  async importHistory(ctx, a, input) {
    const res = await pg(ctx, a, `/${pageIdOf(a)}/published_posts`, {
      query: {
        fields: 'id,message,created_time,permalink_url,full_picture,attachments{media_type,type,media{image{src}}},reactions.summary(total_count).limit(0),comments.summary(total_count).limit(0),shares',
        limit: Math.min(100, input.limit), after: input.cursor ?? undefined,
      },
    });
    const items: HistoryPost[] = (res.data ?? []).map((p: any) => {
      const att = p.attachments?.data?.[0];
      const mt = String(att?.media_type ?? att?.type ?? '').toLowerCase();
      return {
        externalId: p.id, title: (p.message ?? '').slice(0, 200) || null, permalink: p.permalink_url ?? null,
        publishedAt: p.created_time ? new Date(p.created_time) : null,
        type: mt.includes('video') ? 'VIDEO' : mt.includes('photo') || mt.includes('album') ? 'IMAGE' : 'POST',
        thumbnail: p.full_picture ?? att?.media?.image?.src ?? null, smallThumbnail: att?.media?.image?.src ?? p.full_picture ?? null,
        metrics: metricsOf(p, {}),
      };
    });
    return { items, nextCursor: nextAfter(res) };
  },

  reviews: {
    async list(ctx, a, input) {
      const page = pageIdOf(a);
      const res = await pg(ctx, a, `/${page}/ratings`, { query: { fields: REC_FIELDS, limit: Math.min(100, input.limit), after: input.cursor ?? undefined } });
      return { items: (res.data ?? []).map((r: any) => recommendationOf(r, page)), nextCursor: nextAfter(res) };
    },
    async reply(ctx, a, externalId, text) {
      await pg(ctx, a, `/${externalId}/comments`, { method: 'POST', form: { message: text } });
    },
    async deleteReply(ctx, a, externalId) {
      const page = pageIdOf(a);
      const res = await pg(ctx, a, `/${externalId}/comments`, { query: { fields: 'id,from', limit: 100 } });
      const own = (res.data ?? []).filter((c: any) => String(c.from?.id) === page);
      for (const c of own) await pg(ctx, a, `/${c.id}`, { method: 'DELETE' });
    },
    async comments(ctx, a, externalId) {
      const res = await pg(ctx, a, `/${externalId}/comments`, { query: { fields: 'id,message,from{id,name,picture},created_time,like_count,comment_count,parent{id}', filter: 'stream', order: 'chronological', limit: 100 } });
      return (res.data ?? []).map((c: any) => toComment(c, externalId));
    },
    async replyToComment(ctx, a, externalCommentId, text) {
      const r = await pg<{ id: string }>(ctx, a, `/${externalCommentId}/comments`, { method: 'POST', form: { message: text } });
      return { externalId: r.id };
    },
  },

  misc: {
    'misc.facebook.searchPages': async (ctx, a, { query }) => {
      const res = await graph(ctx, `${FB_GRAPH}/pages/search`, a.token.accessToken, { query: { q: query.q, fields: 'id,name,link,location', limit: Number(query.limit ?? 10) } });
      return { items: (res.data ?? []).map((p: any) => ({ pageId: String(p.id), name: p.name, link: p.link ?? null, location: locationOf(p.location) })) };
    },
    'misc.facebook.getTextFormatPresets': async () => ({ presets: TEXT_PRESETS.map(p => ({ ...p })) }),
    'misc.facebook.getTokenDebug': async (ctx, a) => {
      const input = a.channelId ? await pageToken(ctx, a) : a.token.accessToken;
      const res = await graph(ctx, `${FB_GRAPH}/debug_token`, `${ctx.credentials.clientId}|${ctx.credentials.clientSecret}`, { query: { input_token: input } });
      const d = res.data ?? {};
      return {
        type: d.type === 'PAGE' ? 'PAGE' : 'USER', application: d.application, data_access_expires_at: d.data_access_expires_at, is_valid: !!d.is_valid,
        issued_at: d.issued_at, scopes: d.scopes ?? [], granular_scopes: d.granular_scopes ?? [],
        ...(d.error ? { error: { code: d.error.code, message: d.error.message, subcode: d.error.subcode } } : {}),
      };
    },
    'misc.facebook.editPost': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await facebook.editPost!(ctx, a, p.externalPostId, { text: body.description ?? '', kind: p.externalVideoId === p.externalPostId ? 'video' : 'post' });
      return { success: true, permalink: p.permalink ?? '' };
    },
    'misc.facebook.deletePost': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await facebook.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
    'misc.facebook.editComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await facebook.editComment!(ctx, a, c.externalId, body.text);
      return { success: true, permalink: null };
    },
    'misc.facebook.deleteComment': async (ctx, a, { body, lookup }) => {
      const c = await lookup.comment(body.commentId);
      await facebook.deleteComment!(ctx, a, c.externalId);
      return { success: true };
    },
    /**
     * The recommendation row lives in our DB; the API resolves recommendationId → the external
     * open_graph_story id and passes it as body.externalRecommendationId (falls back to the path id).
     */
    'misc.facebook.replyToRecommendation': async (ctx, a, { body, params }) => {
      const ext = String(body.externalRecommendationId ?? params.recommendationId);
      const r = await pg<{ id: string }>(ctx, a, `/${ext}/comments`, { method: 'POST', form: { message: body.comment } });
      return { externalRecommendationId: ext, ownerReplyComment: body.comment, ownerReplyCommentId: r.id, ownerReplyUpdatedAt: ctx.now().toISOString() };
    },
    'misc.facebook.replyToRecommendationComment': async (ctx, a, { body, params }) => {
      const r = await facebook.reviews!.replyToComment!(ctx, a, String(body.externalCommentId ?? params.commentId), body.comment);
      return { id: r.externalId };
    },
  },

  messaging: metaMessaging('FACEBOOK', async (ctx, a) => {
    const page = pageIdOf(a);
    return { base: FB_GRAPH, senderId: page, token: await pageToken(ctx, a), platform: null, subscribe: { id: page, fields: WEBHOOK_FIELDS } };
  }),
};

export const locationOf = (l: any) => (l ? { city: l.city ?? null, country: l.country ?? null, latitude: l.latitude ?? null, longitude: l.longitude ?? null, state: l.state ?? null, street: l.street ?? null, zip: l.zip ?? null } : null);
