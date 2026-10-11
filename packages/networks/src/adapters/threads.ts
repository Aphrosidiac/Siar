/**
 * Threads — graph.threads.net.
 *
 * Connect: threads.net/oauth/authorize → code → graph.threads.net/oauth/access_token (short-lived) →
 * /access_token?grant_type=th_exchange_token (long-lived, ≈60 days) → /refresh_access_token
 * (th_refresh_token; the token must be at least 24 hours old and not expired). The account is the
 * identity; there are no channels.
 *
 * Publishing is two-step: POST /{user}/threads creates a container (media_type TEXT | IMAGE | VIDEO |
 * CAROUSEL; reply_control, topic_tag, link_attachment, poll_attachment, gif_attachment,
 * allowlisted_country_codes), publish() answers PROCESSING with a pendingRef, poll() reads
 * status and, once FINISHED, calls /{user}/threads_publish → POSTED with the permalink.
 * Replies are Threads posts with reply_to_id, so they are comments here. Threads cannot edit posts.
 * crosspostToInstagramStory has no documented container parameter and is not forwarded.
 *
 * Docs: https://developers.facebook.com/docs/threads
 */
import { NetworkError } from '../lib/errors.js';
import { request, sleep } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { checkMedia, checkText, GB, MB } from '../lib/validate.js';
import type { AccountRuntime, FetchedCommentInput, HistoryPost, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, PublishResult } from '../types.js';
import { graph, metaMapError, nextAfter, parseRef, pickErrors, THREADS_GRAPH, THREADS_GRAPH_ROOT, threadsLength, unix } from './meta-common.js';

const THREADS_WWW = 'https://threads.net';
const SCOPES = ['threads_basic', 'threads_content_publish', 'threads_manage_replies', 'threads_read_replies', 'threads_manage_insights', 'threads_delete'];
const REPLY_CONTROLS = ['everyone', 'accounts_you_follow', 'mentioned_only', 'parent_post_author_only', 'followers_only'];
const PROFILE_FIELDS = 'id,username,name,threads_profile_picture_url,threads_biography';
const POST_FIELDS = 'id,text,media_type,media_product_type,media_url,thumbnail_url,permalink,timestamp,username,is_quote_post';

const fail = (msg: string) => new NetworkError('VALIDATION', msg);

const th = <T = any>(ctx: NetworkContext, a: AccountRuntime, path: string, opts: Parameters<typeof graph>[3] = {}) =>
  graph<T>(ctx, `${THREADS_GRAPH}${path}`, a.token.accessToken, opts);

const userId = (a: AccountRuntime) => {
  if (!a.externalId) throw fail('This Threads account has no user id. Reconnect it.');
  return a.externalId;
};

const profileOf = (me: any) => ({
  externalId: String(me.id), providerPageId: String(me.id), username: me.username ?? null, displayName: me.name ?? me.username ?? null,
  avatarUrl: me.threads_profile_picture_url ?? null, bio: me.threads_biography ?? null,
  userId: String(me.id), userUsername: me.username ?? null, userDisplayName: me.name ?? me.username ?? null,
});

/** Wait for a container to leave IN_PROGRESS. */
async function waitFinished(ctx: NetworkContext, a: AccountRuntime, id: string) {
  for (let i = 0; i < 90; i++) {
    const c = await th<{ status?: string; error_message?: string }>(ctx, a, `/${id}`, { query: { fields: 'status,error_message' } });
    if (c.status === 'FINISHED' || c.status === 'PUBLISHED') return;
    if (c.status === 'ERROR' || c.status === 'EXPIRED') throw new NetworkError('MEDIA_INVALID', c.error_message ?? `Threads reports the container as ${c.status}.`, { meta: { status: c } });
    await sleep(ctx.mode === 'mock' ? 10 : 3000);
  }
  throw new NetworkError('MEDIA_INVALID', 'Threads did not finish processing the media in time.', { retryability: 'retryable' });
}

const createContainer = (ctx: NetworkContext, a: AccountRuntime, form: Record<string, string | number | boolean | undefined | null>) =>
  th<{ id: string }>(ctx, a, `/${userId(a)}/threads`, { method: 'POST', form, timeoutMs: 120_000 });

const mediaFields = (m: MediaRef, alt?: string | null) =>
  m.type === 'video' ? { media_type: 'VIDEO', video_url: m.url } : { media_type: 'IMAGE', image_url: m.url, alt_text: alt ?? m.altText ?? undefined };

async function publishContainer(ctx: NetworkContext, a: AccountRuntime, containerId: string): Promise<{ id: string; permalink: string | null }> {
  const r = await th<{ id: string }>(ctx, a, `/${userId(a)}/threads_publish`, { method: 'POST', form: { creation_id: containerId } });
  const p = await th<{ permalink?: string }>(ctx, a, `/${r.id}`, { query: { fields: 'permalink' } }).catch(() => null);
  return { id: r.id, permalink: p?.permalink ?? null };
}

const insightValues = (res: any): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const m of res?.data ?? []) {
    const v = m.total_value?.value ?? m.values?.[m.values.length - 1]?.value;
    out[m.name] = typeof v === 'number' ? v : 0;
  }
  return out;
};

const linksIn = (s: string) => new Set(s.match(/https?:\/\/[^\s]+/g) ?? []);

const toComment = (r: any, postId: string): FetchedCommentInput => ({
  externalId: String(r.id), externalPostId: postId,
  externalParentId: r.replied_to?.id && String(r.replied_to.id) !== postId ? String(r.replied_to.id) : null,
  authorName: r.username ?? null, authorProfileUrl: r.username ? `https://www.threads.net/@${r.username}` : null,
  text: r.text ?? '', publishedAt: r.timestamp ? new Date(r.timestamp) : null,
  platformData: { permalink: r.permalink ?? null, hideStatus: r.hide_status ?? null, hasReplies: r.has_replies ?? null },
});

export const threads: NetworkAdapter = {
  type: 'THREADS',
  displayName: 'Threads',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'none', postTypes: ['POST'],
    comments: true, firstComment: true, editPost: false, deletePost: true, editComment: false, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'HIDE', 'UNHIDE'],
    accountAnalytics: true, postAnalytics: true, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    // Text counts emoji by their UTF-8 length (threadsLength).
    textMax: 500,
    commentMax: 500,
    media: {
      maxItems: 20,
      image: { mimes: ['image/jpeg', 'image/png'], maxBytes: 8 * MB },
      video: { mimes: ['video/mp4', 'video/quicktime'], maxBytes: 1 * GB, minSeconds: 0, maxSeconds: 300 },
    },
  },
  errorReference: pickErrors('190', '4', '10', '100', '368', '9004', '9007', 'LINK_LIMIT'),

  async authorize(ctx, input) {
    return {
      url: authorizeUrl(`${THREADS_WWW}/oauth/authorize`, {
        client_id: String(ctx.credentials.clientId ?? ''), redirect_uri: ctx.redirectUri, scope: SCOPES.join(','), response_type: 'code', state: input.state,
      }),
    };
  },

  async exchange(ctx, input) {
    const short = await request<{ access_token: string; user_id: number | string }>(ctx, `${THREADS_GRAPH_ROOT}/oauth/access_token`, {
      method: 'POST', mapError: metaMapError,
      form: { client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret, grant_type: 'authorization_code', redirect_uri: ctx.redirectUri, code: input.code.replace(/#_$/, '') },
    });
    const long = await graph<{ access_token: string; expires_in?: number }>(ctx, `${THREADS_GRAPH_ROOT}/access_token`, short.access_token, {
      query: { grant_type: 'th_exchange_token', client_secret: ctx.credentials.clientSecret },
    });
    const me = await graph(ctx, `${THREADS_GRAPH}/me`, long.access_token, { query: { fields: PROFILE_FIELDS } });
    return { token: { accessToken: long.access_token, expiresAt: expiresIn(long.expires_in, ctx.now()), scopes: SCOPES }, profile: { ...profileOf(me), channels: [] } };
  },

  async refresh(ctx, a) {
    const r = await graph<{ access_token: string; expires_in?: number }>(ctx, `${THREADS_GRAPH_ROOT}/refresh_access_token`, a.token.accessToken, { query: { grant_type: 'th_refresh_token' } });
    return { ...a.token, accessToken: r.access_token, expiresAt: expiresIn(r.expires_in, ctx.now()) ?? a.token.expiresAt ?? null };
  },

  async refreshProfile(ctx, a) {
    return profileOf(await th(ctx, a, '/me', { query: { fields: PROFILE_FIELDS } }));
  },

  async checkConnection(ctx, a) {
    try {
      await th(ctx, a, '/me', { query: { fields: 'id' } });
      return true;
    } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const text = typeof data.text === 'string' ? data.text : '';
    checkText(issues, data.text, null, ['text']);
    if (text && threadsLength(text) > 500) issues.push({ code: 'too_long', message: `Text is ${threadsLength(text)} characters (emoji count as their byte length); the limit is 500.`, path: ['text'] });
    checkMedia(issues, media, threads.limits, ['uploadIds'], { types: ['image', 'video'] });
    if (!media.length && !text.trim() && !data.poll && !data.gif) issues.push({ code: 'required', message: 'A Threads post needs text or media.', path: ['text'] });

    if (data.replyControl != null && !REPLY_CONTROLS.includes(data.replyControl)) issues.push({ code: 'invalid', message: `replyControl must be one of ${REPLY_CONTROLS.join(', ')}.`, path: ['replyControl'] });
    if (data.topicTag != null) {
      const t = String(data.topicTag);
      if (!t.length || t.length > 50 || /[.&]/.test(t)) issues.push({ code: 'invalid', message: 'topicTag must be 1 to 50 characters and contain no periods or ampersands.', path: ['topicTag'] });
    }
    const links = linksIn(text);
    if (data.linkAttachment) {
      try { new URL(data.linkAttachment); links.add(String(data.linkAttachment)); } catch { issues.push({ code: 'invalid', message: 'linkAttachment must be an absolute URL.', path: ['linkAttachment'] }); }
      if (media.length) issues.push({ code: 'not_supported', message: 'A link attachment only applies to text posts.', path: ['linkAttachment'] });
    }
    if (links.size > 5) issues.push({ code: 'too_many', message: 'A Threads post may contain at most 5 unique links.', path: ['text'] });
    if (data.poll) {
      const opts = [data.poll.optionA, data.poll.optionB, data.poll.optionC, data.poll.optionD].filter(o => o != null && o !== '');
      if (opts.length < 2) issues.push({ code: 'required', message: 'A poll needs at least two options.', path: ['poll'] });
      opts.forEach(o => { if (String(o).length > 25) issues.push({ code: 'too_long', message: 'Poll options are limited to 25 characters.', path: ['poll'] }); });
      if (media.length || data.linkAttachment || data.gif) issues.push({ code: 'not_supported', message: 'A poll cannot be combined with media, a link attachment or a GIF.', path: ['poll'] });
    }
    if (data.gif && (media.length || data.linkAttachment)) issues.push({ code: 'not_supported', message: 'A GIF cannot be combined with media or a link attachment.', path: ['gif'] });
    if (Array.isArray(data.allowlistedCountryCodes) && data.allowlistedCountryCodes.some((c: unknown) => !/^[A-Za-z]{2}$/.test(String(c)))) issues.push({ code: 'invalid', message: 'allowlistedCountryCodes takes two-letter country codes.', path: ['allowlistedCountryCodes'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const d = input.data;
    const media = input.media;
    const shared = {
      reply_control: d.replyControl || undefined, topic_tag: d.topicTag || undefined,
      allowlisted_country_codes: d.allowlistedCountryCodes?.length ? d.allowlistedCountryCodes.join(',') : undefined,
    };
    const items: any[] = d.mediaItems ?? [];
    const altOf = (m: MediaRef) => items.find(x => x.uploadId === m.id)?.altText ?? m.altText ?? undefined;
    let container: { id: string };
    if (media.length > 1) {
      const children: string[] = [];
      for (const m of media) children.push((await createContainer(ctx, a, { ...mediaFields(m, altOf(m)), is_carousel_item: true })).id);
      for (const id of children) await waitFinished(ctx, a, id);
      container = await createContainer(ctx, a, { media_type: 'CAROUSEL', children: children.join(','), text: d.text || undefined, ...shared });
    } else if (media.length === 1) {
      container = await createContainer(ctx, a, { ...mediaFields(media[0], altOf(media[0])), text: d.text || undefined, ...shared });
    } else {
      if (!d.text && !d.poll && !d.gif) throw fail('A Threads post needs text or media.');
      container = await createContainer(ctx, a, {
        media_type: 'TEXT', text: d.text || undefined, link_attachment: d.linkAttachment || undefined,
        poll_attachment: d.poll ? JSON.stringify({ option_a: d.poll.optionA, option_b: d.poll.optionB, option_c: d.poll.optionC || undefined, option_d: d.poll.optionD || undefined }) : undefined,
        gif_attachment: d.gif ? JSON.stringify({ gif_id: d.gif.gifId, provider: d.gif.provider ?? 'GIPHY' }) : undefined,
        ...shared,
      });
    }
    return { status: 'PROCESSING', pendingRef: JSON.stringify({ k: 'th', c: container.id, u: userId(a) }), pollAfterMs: 5_000, externalData: { containerId: container.id } };
  },

  async poll(ctx, input, ref): Promise<PublishResult> {
    const p = parseRef<{ k: string; c: string; u: string }>(ref);
    if (p.k !== 'th') throw fail(`Unknown Threads pending reference ${p.k}.`);
    const a = input.account;
    const st = await th<{ status?: string; error_message?: string }>(ctx, a, `/${p.c}`, { query: { fields: 'status,error_message' } });
    if (st.status === 'ERROR' || st.status === 'EXPIRED') throw new NetworkError('MEDIA_INVALID', st.error_message ?? `Threads reports the container as ${st.status}.`, { meta: { status: st } });
    if (st.status === 'IN_PROGRESS') return { status: 'PROCESSING', pendingRef: ref, pollAfterMs: 5_000 };
    if (st.status === 'PUBLISHED') {
      const last = await th<{ data?: { id: string; permalink?: string }[] }>(ctx, a, `/${p.u}/threads`, { query: { fields: 'id,permalink', limit: 1 } });
      if (!last.data?.[0]) throw new NetworkError('UNKNOWN', 'The container is published but the post could not be found.');
      return { status: 'POSTED', externalPostId: last.data[0].id, permalink: last.data[0].permalink ?? null, externalData: { containerId: p.c } };
    }
    const r = await publishContainer(ctx, a, p.c);
    return { status: 'POSTED', externalPostId: r.id, permalink: r.permalink, externalData: { containerId: p.c } };
  },

  async recentPosts(ctx, a, since) {
    const res = await th(ctx, a, `/${userId(a)}/threads`, { query: { fields: POST_FIELDS, since: unix(since), limit: 25 } });
    return (res.data ?? [])
      .filter((p: any) => !p.timestamp || new Date(p.timestamp) >= since)
      .map((p: any) => ({ externalId: String(p.id), text: p.text ?? null, createdAt: p.timestamp ? new Date(p.timestamp) : null, permalink: p.permalink ?? null }));
  },

  async deletePost(ctx, a, id) {
    await th(ctx, a, `/${id}`, { method: 'DELETE' });
  },

  async comment(ctx, input) {
    const a = input.account;
    const m = input.media[0];
    const c = await createContainer(ctx, a, { ...(m ? mediaFields(m) : { media_type: 'TEXT' }), text: input.text || undefined, reply_to_id: input.parentExternalId ?? input.externalPostId });
    await waitFinished(ctx, a, c.id);
    const r = await publishContainer(ctx, a, c.id);
    return { externalId: r.id, permalink: r.permalink };
  },

  async deleteComment(ctx, a, id) {
    await th(ctx, a, `/${id}`, { method: 'DELETE' });
  },

  async importComments(ctx, a, input) {
    const res = await th(ctx, a, `/${input.externalPostId}/conversation`, {
      query: { fields: 'id,text,username,timestamp,permalink,hide_status,has_replies,replied_to{id}', reverse: false, limit: Math.min(100, input.limit), after: input.cursor ?? undefined },
    });
    return { items: (res.data ?? []).map((r: any) => toComment(r, input.externalPostId)), nextCursor: nextAfter(res) };
  },

  async commentAction(ctx, a, comment, action) {
    if (action === 'DELETE') return void (await th(ctx, a, `/${comment.externalId}`, { method: 'DELETE' }));
    if (action === 'HIDE' || action === 'UNHIDE') return void (await th(ctx, a, `/${comment.externalId}/manage_reply`, { method: 'POST', form: { hide: action === 'HIDE' } }));
    throw new NetworkError('NOT_SUPPORTED', `Threads replies do not support ${action}.`);
  },

  async accountAnalytics(ctx, a) {
    const id = userId(a);
    const until = ctx.now();
    const since = new Date(until.getTime() - 28 * 86_400_000);
    const [totals, followers, demo] = await Promise.all([
      th(ctx, a, `/${id}/threads_insights`, { query: { metric: 'views,likes,replies,reposts,quotes', metric_type: 'total_value', since: unix(since), until: unix(until) } }).catch(() => ({ data: [] })),
      th(ctx, a, `/${id}/threads_insights`, { query: { metric: 'followers_count' } }).catch(() => ({ data: [] })),
      th(ctx, a, `/${id}/threads_insights`, { query: { metric: 'follower_demographics', breakdown: 'country' } }).catch(() => null),
    ]);
    const v = insightValues(totals);
    const countries: Record<string, number> = {};
    for (const r of demo?.data?.[0]?.total_value?.breakdowns?.[0]?.results ?? []) countries[String(r.dimension_values?.[0])] = Number(r.count ?? r.value ?? 0);
    return {
      followers: insightValues(followers).followers_count, views: v.views, impressions: v.views, likes: v.likes, comments: v.replies,
      audience: Object.keys(countries).length ? { countries } : null, raw: { insights: v },
    };
  },

  async postAnalytics(ctx, a, id): Promise<PostMetrics> {
    const v = insightValues(await th(ctx, a, `/${id}/insights`, { query: { metric: 'views,likes,replies,reposts,quotes,shares' } }));
    return {
      views: v.views, impressions: v.views, likes: v.likes ?? 0, comments: v.replies ?? 0,
      shares: v.shares ?? (v.reposts ?? 0) + (v.quotes ?? 0), raw: v,
    };
  },

  async importHistory(ctx, a, input) {
    const res = await th(ctx, a, `/${userId(a)}/threads`, { query: { fields: POST_FIELDS, limit: Math.min(100, input.limit), after: input.cursor ?? undefined } });
    const items: HistoryPost[] = (res.data ?? []).map((p: any) => ({
      externalId: String(p.id), title: (p.text ?? '').slice(0, 200) || null, permalink: p.permalink ?? null,
      publishedAt: p.timestamp ? new Date(p.timestamp) : null,
      type: p.media_type === 'VIDEO' ? 'VIDEO' : p.media_type === 'IMAGE' ? 'IMAGE' : 'POST',
      thumbnail: p.thumbnail_url ?? p.media_url ?? null, smallThumbnail: p.thumbnail_url ?? p.media_url ?? null,
      extraData: { mediaType: p.media_type ?? null, isQuotePost: p.is_quote_post ?? false },
    }));
    return { items, nextCursor: nextAfter(res) };
  },
};
