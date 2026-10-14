/**
 * Shared Meta Graph API plumbing for the Facebook, Instagram and Threads adapters:
 *   1. API versions and hosts (one constant each)
 *   2. graph() + metaMapError(): Meta's {error:{message,type,code,error_subcode,fbtrace_id}} → NetworkError
 *   3. the error reference shared by the public error pages
 *   4. metaMessaging(): the Messenger Platform send/react/seen/private-reply/profile/subscription calls
 *      (Messenger API for Facebook Pages and Instagram, both login methods)
 *   5. parseMetaWebhook(): page/instagram webhook deliveries → messages + comments per account
 *
 * Docs: https://developers.facebook.com/docs/graph-api/guides/error-handling
 *       https://developers.facebook.com/docs/messenger-platform/reference/send-api
 *       https://developers.facebook.com/docs/graph-api/webhooks/reference
 */
import { NetworkError, type ErrorCode } from '../lib/errors.js';
import { request, resetFrom, type RequestOptions } from '../lib/http.js';
import type { AccountRuntime, FetchedCommentInput, InboundMessage, MediaRef, MessagingAdapter, NetworkContext } from '../types.js';

/** Graph API version for graph.facebook.com and graph.instagram.com. Bump here only. */
export const GRAPH_VERSION = 'v25.0';
export const FB_WWW = 'https://www.facebook.com';
export const FB_GRAPH = `https://graph.facebook.com/${GRAPH_VERSION}`;
export const FB_GRAPH_ROOT = 'https://graph.facebook.com';
export const FB_RUPLOAD = `https://rupload.facebook.com/video-upload/${GRAPH_VERSION}`;
export const IG_GRAPH = `https://graph.instagram.com/${GRAPH_VERSION}`;
export const IG_GRAPH_ROOT = 'https://graph.instagram.com';
/** The Threads API is versioned separately (v1.0). */
export const THREADS_VERSION = 'v1.0';
// Current docs use the .com hosts (threads.net is the pre-rebrand domain).
export const THREADS_GRAPH = `https://graph.threads.com/${THREADS_VERSION}`;
export const THREADS_GRAPH_ROOT = 'https://graph.threads.com';

// ───────────────────────────── errors ─────────────────────────────

const RATE_CODES = new Set([4, 17, 32, 613, 80001, 80002, 80003, 80004, 80005, 80006, 80008, 80014]);
const MEDIA_CODES = new Set([9004, 36000, 36001, 36003, 36004, 352, 1363019, 1363030]);
const MEDIA_SUBCODES = new Set([2207001, 2207003, 2207004, 2207005, 2207006, 2207009, 2207010, 2207020, 2207023, 2207026, 2207028, 2207052, 2207053]);
const NOT_READY_SUBCODES = new Set([2207027]);

/** Estimated wait from Meta's usage headers (minutes), falling back to Retry-After. */
function metaReset(res?: Response): Date | null {
  if (!res) return null;
  for (const h of ['x-business-use-case-usage', 'x-ad-account-usage', 'x-app-usage']) {
    const raw = res.headers.get(h);
    if (!raw) continue;
    try {
      let mins = 0;
      const walk = (v: any) => { if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') { if (v.estimated_time_to_regain_access) mins = Math.max(mins, Number(v.estimated_time_to_regain_access)); Object.values(v).forEach(walk); } };
      walk(JSON.parse(raw));
      if (mins > 0) return new Date(Date.now() + mins * 60_000);
    } catch { /* malformed header */ }
  }
  return resetFrom(res);
}

/**
 * Meta error body → NetworkError. Handles the Graph shape ({error:{…}}) and the shape the
 * Instagram Login token endpoint uses ({error_type, code, error_message}).
 */
export function metaMapError(status: number, body: any, res?: Response): NetworkError | undefined {
  const e = body?.error && typeof body.error === 'object' ? body.error
    : body?.error_type ? { type: body.error_type, code: body.code, message: body.error_message }
    : null;
  if (!e) return undefined;
  const code = Number(e.code);
  const sub = Number(e.error_subcode);
  const message: string = e.error_user_msg || e.message || `Meta error ${code}`;
  const meta = { code, subcode: Number.isFinite(sub) ? sub : null, type: e.type ?? null, fbtrace_id: e.fbtrace_id ?? null, title: e.error_user_title ?? null, is_transient: e.is_transient ?? null };
  const mk = (c: ErrorCode, extra: { retryability?: 'retryable' | 'non_retryable' | 'unknown'; rateLimitResetAt?: Date | null } = {}) =>
    new NetworkError(c, message, { httpStatus: status, meta, ...extra });

  if (code === 190 || code === 102 || code === 2500 || (e.type === 'OAuthException' && e.code === 400 && body?.error_type)) return mk('TOKEN_INVALID');
  if (RATE_CODES.has(code) || (code === 9 && sub === 2207042)) return mk('RATE_LIMITED', { rateLimitResetAt: metaReset(res) });
  if (code === 368) return mk('CONTENT_REJECTED');
  if (code === 506) return mk('DUPLICATE');
  if (/THREADS_API__LINK_LIMIT_EXCEEDED/.test(message) || e.error_subcode === 'THREADS_API__LINK_LIMIT_EXCEEDED') return mk('CONTENT_REJECTED');
  if (code === 9007 || NOT_READY_SUBCODES.has(sub)) return mk('MEDIA_INVALID', { retryability: 'retryable' });
  if (MEDIA_CODES.has(code) || MEDIA_SUBCODES.has(sub)) return mk('MEDIA_INVALID');
  if (code === 10 || code === 3 || code === 551 || code === 230 || (code >= 200 && code < 300)) return mk('PERMISSION');
  if (code === 803 || code === 24 || (code === 100 && sub === 33) || code === 110) return mk('NOT_FOUND');
  if (code === 1 || code === 2 || e.is_transient === true || status >= 500) return mk('NETWORK_UNAVAILABLE');
  if (code === 100 || code === 1500 || code === 12) return mk('VALIDATION');
  return undefined;
}

/** One Graph call. The token travels as `access_token` (Meta's documented form; logs redact it). */
export const graph = <T = any>(ctx: NetworkContext, url: string, token: string | null | undefined, opts: RequestOptions = {}) =>
  request<T>(ctx, url, { mapError: metaMapError, ...opts, query: { ...(opts.query ?? {}), access_token: token ?? undefined } });

/** Graph cursor pagination: the `after` cursor when there is a next page. */
export const nextAfter = (res: any): string | null => (res?.paging?.next ? res.paging?.cursors?.after ?? null : null);

export const unix = (d: string | Date) => Math.floor(new Date(d).getTime() / 1000);
export const parseRef = <T>(ref: string): T => { try { return JSON.parse(ref) as T; } catch { throw new NetworkError('VALIDATION', `Unreadable pending reference: ${ref.slice(0, 80)}`); } };
export const metaCode = (e: unknown) => (e instanceof NetworkError ? (e.meta as any)?.code ?? null : null);

export type ErrorRef = { code: string; message: string; meaning: string; fix: string };

/** Real Meta error codes, shared by the three adapters' public error pages. */
export const META_ERRORS: Record<string, ErrorRef> = {
  '190': { code: '190', message: 'Error validating access token: The session has been invalidated because the user changed their password or Facebook has changed the session for security reasons.', meaning: 'The access token expired, was revoked, or the user changed their password or removed the app.', fix: 'Reconnect the account. Siar marks it NEEDS_RECONNECT automatically.' },
  '4': { code: '4', message: '(#4) Application request limit reached', meaning: 'The app-level rate limit was hit.', fix: 'Wait; Siar retries automatically once the window resets.' },
  '17': { code: '17', message: '(#17) User request limit reached', meaning: 'The connected user made too many calls in the last hour.', fix: 'Wait for the window to reset; spread scheduled posts out.' },
  '32': { code: '32', message: '(#32) Page request limit reached', meaning: 'The Page hit its Business Use Case rate limit.', fix: 'Wait; the reset time is in the error meta when Meta sends it.' },
  '613': { code: '613', message: '(#613) Calls to this api have exceeded the rate limit.', meaning: 'A per-endpoint rate limit was exceeded.', fix: 'Retry later.' },
  '10': { code: '10', message: '(#10) Application does not have permission for this action', meaning: 'A required permission was not granted, or the app lacks Advanced Access.', fix: 'Reconnect and grant every requested permission.' },
  '200': { code: '200', message: '(#200) Requires either publish_to_groups permission and app being installed in the group, or manage_pages and publish_pages as an admin', meaning: 'The user lacks the Page task (CREATE_CONTENT / MODERATE) or the permission for this call.', fix: 'Ask a Page admin to give the connected user full control, then reconnect.' },
  '100': { code: '100', message: '(#100) Invalid parameter', meaning: 'A parameter was missing or invalid (bad URL, unsupported field, wrong id).', fix: 'Check the post data; the message names the parameter.' },
  '368': { code: '368', message: 'The action attempted has been deemed abusive or is otherwise disallowed', meaning: 'Meta temporarily blocked the account from this action for policy reasons.', fix: 'Review the content; the block lifts after a while.' },
  '506': { code: '506', message: '(#506) Duplicate status message', meaning: 'The same text was just posted to this Page.', fix: 'Change the text or wait before posting it again.' },
  '9004': { code: '9004', message: 'Only photo or video can be accepted as media type.', meaning: 'Meta could not fetch or read the media at the URL.', fix: 'Use a JPEG/PNG image or an MP4/MOV video; Siar serves it from a public URL.' },
  '36003': { code: '36003', message: 'The aspect ratio is not supported.', meaning: 'The image aspect ratio is outside 4:5–1.91:1.', fix: 'Crop the image or enable autoCropImage.' },
  '9007': { code: '9007', message: 'Media ID is not available', meaning: 'The container was published before Meta finished processing it.', fix: 'Nothing; Siar waits for the container to be FINISHED and retries.' },
  '2207042': { code: '2207042', message: 'You reached maximum number of posts that is allowed to be published by Content Publishing API.', meaning: 'The account hit its 24-hour API publishing limit.', fix: 'Wait until the oldest post in the window is 24 hours old.' },
  '2018278': { code: '2018278', message: '(#10) This message is sent outside of allowed window.', meaning: 'Messages can only be sent within 24 hours of the person\'s last message.', fix: 'Wait for the person to message again, or use an approved message tag.' },
  '551': { code: '551', message: 'This person isn\'t available right now.', meaning: 'The recipient blocked the Page or deactivated messaging.', fix: 'Nothing to fix on our side.' },
  'LINK_LIMIT': { code: 'THREADS_API__LINK_LIMIT_EXCEEDED', message: 'THREADS_API__LINK_LIMIT_EXCEEDED', meaning: 'A Threads post may contain at most 5 unique links.', fix: 'Remove links until there are five or fewer.' },
};
export const pickErrors = (...codes: string[]) => codes.map(c => META_ERRORS[c]).filter(Boolean);

// ───────────────────────────── messaging ─────────────────────────────

export interface MessagingTarget {
  /** Graph base (with version). */
  base: string;
  /** The id whose /messages edge sends (Page id, or IG user id under Instagram Login). */
  senderId: string;
  token: string;
  /** messenger_profile `platform` param (instagram under Facebook Login). */
  platform?: 'instagram' | null;
  /** subscribed_apps owner + fields; null = subscription is not ours to change (see adapter). */
  subscribe: { id: string; fields: string[] } | null;
}

const attachmentType = (m: MediaRef) => m.mime.startsWith('audio/') ? 'audio' : m.type === 'image' ? 'image' : m.type === 'video' ? 'video' : 'file';

function buttonOf(b: any, network: 'FACEBOOK' | 'INSTAGRAM') {
  const type = String(b?.type ?? '').toUpperCase();
  if (type === 'URL') return { type: 'web_url', url: b.url, title: b.label ?? b.title };
  if (type === 'PHONE') {
    if (network === 'INSTAGRAM') throw new NetworkError('NOT_SUPPORTED', 'Instagram messages do not support call buttons.');
    return { type: 'phone_number', title: b.label ?? b.title, payload: b.phoneNumber };
  }
  return { type: 'postback', title: b.label ?? b.title, payload: b.payload };
}

/** Messenger Platform calls, shared by Facebook Pages and Instagram (both login methods). */
export function metaMessaging(network: 'FACEBOOK' | 'INSTAGRAM', target: (ctx: NetworkContext, a: AccountRuntime) => Promise<MessagingTarget>): MessagingAdapter {
  const send = async (ctx: NetworkContext, t: MessagingTarget, body: Record<string, unknown>) =>
    graph<{ recipient_id?: string; message_id?: string }>(ctx, `${t.base}/${t.senderId}/messages`, t.token, { method: 'POST', json: body });

  /** Instagram sends no DMs to any app until the owner turns on Connected tools → Allow access to messages
   *  (off by default, no API to change it). Meta answers "disabled access" while it is off: say so, with the steps. */
  const checkAccess = async (ctx: NetworkContext, t: MessagingTarget) => {
    if (network !== 'INSTAGRAM') return;
    const probe = t.base === FB_GRAPH ? `${t.base}/${t.senderId}/conversations` : `${t.base}/me/conversations`;
    await graph(ctx, probe, t.token, { query: { platform: 'instagram', limit: 1 } }).catch((err) => {
      if (/disabled access to instagram direct messages|access to messages/i.test(String((err as Error).message))) {
        throw new NetworkError('PERMISSION', 'Instagram is blocking DMs for this account, so none reach Siar. In the Instagram app: Settings and activity → Messages and story replies → Message controls → Connected tools → turn on "Allow access to messages". Then press Check again.');
      }
    });
  };

  return {
    // A Facebook Page's subscription is shared: the Facebook account and an Instagram account connected
    // through that Page both subscribe Siar's app on the same Page, and a POST replaces the field list.
    // So enable adds to the fields already there, and disable leaves a Page subscription in place (Siar
    // stops ingesting for the account via messagingStatus). Instagram Login owns its own subscription.
    async enable(ctx, a) {
      const t = await target(ctx, a);
      if (!t.subscribe) return;
      const url = `${t.base}/${t.subscribe.id}/subscribed_apps`;
      const appIds = [ctx.credentials.clientId, ctx.credentials.instagramClientId].filter(Boolean).map(String);
      const cur = await graph<{ data?: { id?: string; subscribed_fields?: string[] }[] }>(ctx, url, t.token).catch(() => ({ data: [] as { id?: string; subscribed_fields?: string[] }[] }));
      const have = (cur.data ?? []).filter(x => appIds.includes(String(x.id))).flatMap(x => x.subscribed_fields ?? []);
      const fields = [...new Set([...have, ...t.subscribe.fields])];
      await graph(ctx, url, t.token, { method: 'POST', query: { subscribed_fields: fields.join(',') } });
      await checkAccess(ctx, t);
    },

    async check(ctx, a) { await checkAccess(ctx, await target(ctx, a)); },

    async disable(ctx, a) {
      const t = await target(ctx, a);
      if (!t.subscribe || t.base === FB_GRAPH) return;
      await graph(ctx, `${t.base}/${t.subscribe.id}/subscribed_apps`, t.token, { method: 'DELETE' });
    },

    async participant(ctx, a, id) {
      const t = await target(ctx, a);
      // The profile (name + picture) needs Business Asset User Profile Access at advanced level; until
      // that is approved, the conversation's participant list still gives the name (pages_messaging).
      try {
        if (network === 'FACEBOOK') {
          const p = await graph<{ name?: string; first_name?: string; last_name?: string; profile_pic?: string }>(ctx, `${t.base}/${id}`, t.token, { query: { fields: 'name,first_name,last_name,profile_pic' } });
          return { displayName: p.name ?? ([p.first_name, p.last_name].filter(Boolean).join(' ') || null), username: null, avatarUrl: p.profile_pic ?? null };
        }
        const p = await graph<{ name?: string; username?: string; profile_pic?: string }>(ctx, `${t.base}/${id}`, t.token, { query: { fields: 'name,username,profile_pic' } });
        return { displayName: p.name ?? p.username ?? null, username: p.username ?? null, avatarUrl: p.profile_pic ?? null };
      } catch (err) {
        const owner = t.base === FB_GRAPH ? t.senderId : 'me';
        const r = await graph<{ data?: { participants?: { data?: { id?: string; name?: string; username?: string }[] } }[] }>(ctx, `${t.base}/${owner}/conversations`, t.token, {
          query: { user_id: id, fields: 'participants', ...(network === 'INSTAGRAM' ? { platform: 'instagram' } : {}) },
        }).catch(() => { throw err; });
        const who = (r.data ?? []).flatMap(c => c.participants?.data ?? []).find(x => String(x.id) === String(id));
        if (!who) throw err;
        return { displayName: who.name ?? who.username ?? null, username: who.username ?? null, avatarUrl: null };
      }
    },

    async send(ctx, a, input) {
      const t = await target(ctx, a);
      const recipient = { id: input.recipientId };
      let last: string | null = null;
      for (const m of input.media ?? []) {
        const r = await send(ctx, t, { recipient, messaging_type: 'RESPONSE', message: { attachment: { type: attachmentType(m), payload: { url: m.url, is_reusable: true } } } });
        last = r.message_id ?? last;
      }
      const buttons = (input.buttons ?? []) as any[];
      const quick = (input.quickReplies ?? []) as any[];
      if (input.text || buttons.length || quick.length) {
        const message: Record<string, unknown> = buttons.length
          ? { attachment: { type: 'template', payload: { template_type: 'button', text: input.text ?? '', buttons: buttons.map(b => buttonOf(b, network)) } } }
          : { text: input.text ?? '' };
        if (quick.length) message.quick_replies = quick.map(q => ({ content_type: 'text', title: q.label ?? q.title, payload: q.payload }));
        const r = await send(ctx, t, { recipient, messaging_type: 'RESPONSE', message });
        last = r.message_id ?? last;
      }
      if (!last) throw new NetworkError('VALIDATION', 'A message needs text, media or buttons.');
      return { externalMessageId: last };
    },

    async react(ctx, a, input) {
      const t = await target(ctx, a);
      await send(ctx, t, {
        recipient: { id: input.recipientId }, sender_action: input.unreact ? 'unreact' : 'react',
        payload: input.unreact ? { message_id: input.externalMessageId } : { message_id: input.externalMessageId, reaction: input.reaction },
      });
    },

    async markSeen(ctx, a, recipientId) {
      const t = await target(ctx, a);
      await send(ctx, t, { recipient: { id: recipientId }, sender_action: 'mark_seen' });
    },

    async privateReply(ctx, a, input) {
      const t = await target(ctx, a);
      const r = await send(ctx, t, { recipient: { comment_id: input.commentExternalId }, message: { text: input.text } });
      if (!r.message_id) throw new NetworkError('UNKNOWN', 'Meta accepted the private reply but returned no message id.');
      return { externalMessageId: r.message_id, recipientId: r.recipient_id ?? null };
    },

    async syncProviderSetting(ctx, a, input) {
      const t = await target(ctx, a);
      const url = `${t.base}/me/messenger_profile`;
      const cfg = (input.config ?? {}) as Record<string, any>;
      const platform = t.platform ?? undefined;
      if (input.type === 'FACEBOOK_PERSISTENT_MENU') {
        const items = (cfg.items ?? []) as any[];
        if (!items.length) return graph(ctx, url, t.token, { method: 'DELETE', json: { fields: ['persistent_menu'], platform } });
        return graph(ctx, url, t.token, {
          method: 'POST',
          json: {
            platform,
            // A persistent menu requires a Get Started button.
            get_started: { payload: cfg.getStartedPayload ?? 'GET_STARTED' },
            persistent_menu: [{
              locale: 'default', composer_input_disabled: !!cfg.composerInputDisabled,
              call_to_actions: items.map(i => String(i.type).toUpperCase() === 'URL' ? { type: 'web_url', title: i.title, url: i.url, webview_height_ratio: 'full' } : { type: 'postback', title: i.title, payload: i.payload }),
            }],
          },
        });
      }
      if (input.type === 'INSTAGRAM_ICE_BREAKERS') {
        if (network !== 'INSTAGRAM') throw new NetworkError('NOT_SUPPORTED', 'Ice breakers are configured on the Instagram account.');
        const qs = (cfg.iceBreakers ?? []) as any[];
        if (!qs.length) return graph(ctx, url, t.token, { method: 'DELETE', json: { fields: ['ice_breakers'], platform } });
        return graph(ctx, url, t.token, {
          method: 'POST',
          json: { platform, ice_breakers: [{ locale: 'default', call_to_actions: qs.slice(0, 4).map(q => ({ question: q.question, payload: q.payload })) }] },
        });
      }
      throw new NetworkError('NOT_SUPPORTED', `${input.type} is not a ${network === 'FACEBOOK' ? 'Facebook' : 'Instagram'} messaging setting.`);
    },

    parseWebhook: parseMetaWebhook,
  };
}

// ───────────────────────────── webhooks ─────────────────────────────

type ParsedEntry = { accountExternalId: string; messages: InboundMessage[]; comments: (FetchedCommentInput & { externalPostId: string })[] };

const attachmentsOf = (msg: any) => (msg?.attachments ?? []).map((x: any) => ({ type: String(x.type ?? 'unknown').toUpperCase(), url: x.payload?.url ?? null, externalId: x.payload?.id ?? x.payload?.reel_video_id ?? null, title: x.payload?.title ?? null }));

/**
 * One Meta webhook delivery (object = page | instagram) → per-account messages and comments.
 * entry.id is the Page id (Facebook) or the Instagram professional account id (Instagram).
 */
export function parseMetaWebhook(body: unknown): ParsedEntry[] {
  const b = body as any;
  if (!b || !Array.isArray(b.entry)) return [];
  const out = new Map<string, ParsedEntry>();
  const slot = (id: string) => { let e = out.get(id); if (!e) { e = { accountExternalId: id, messages: [], comments: [] }; out.set(id, e); } return e; };

  for (const entry of b.entry) {
    const accountId = String(entry.id ?? '');
    if (!accountId) continue;
    const s = slot(accountId);
    for (const ev of [...(entry.messaging ?? []), ...(entry.standby ?? [])]) {
      const sender = String(ev.sender?.id ?? '');
      const recipient = String(ev.recipient?.id ?? '');
      const outbound = !!ev.message?.is_echo || sender === accountId;
      const participant = outbound ? recipient : sender;
      const sentAt = new Date(Number(ev.timestamp ?? entry.time ?? Date.now()));
      if (ev.message?.is_deleted) {
        // Instagram: the sender unsent a message. It arrives with the original mid and no text.
        s.messages.push({
          externalMessageId: String(ev.message.mid), externalParticipantId: participant, direction: outbound ? 'OUTBOUND' : 'INBOUND',
          text: null, attachments: [], sentAt, isEcho: !!ev.message.is_echo, replyToExternalId: null,
          platformData: { isUnsent: true, unsentAt: sentAt.toISOString() },
        });
      } else if (ev.message) {
        s.messages.push({
          externalMessageId: String(ev.message.mid), externalParticipantId: participant, direction: outbound ? 'OUTBOUND' : 'INBOUND',
          text: ev.message.text ?? null, attachments: attachmentsOf(ev.message), sentAt, isEcho: !!ev.message.is_echo,
          replyToExternalId: ev.message.reply_to?.mid ?? null,
          platformData: { quickReplyPayload: ev.message.quick_reply?.payload ?? null, replyToStory: ev.message.reply_to?.story ?? null, referral: ev.message.referral ?? null, standby: !!entry.standby?.includes?.(ev) },
        });
      } else if (ev.postback) {
        s.messages.push({
          externalMessageId: String(ev.postback.mid ?? `postback_${sender}_${ev.timestamp}`), externalParticipantId: participant, direction: 'INBOUND',
          text: ev.postback.title ?? null, attachments: [], sentAt, isEcho: false, replyToExternalId: null,
          platformData: { postback: { payload: ev.postback.payload ?? null, title: ev.postback.title ?? null, referral: ev.postback.referral ?? null } },
        });
      }
    }
    for (const ch of entry.changes ?? []) {
      const v = ch.value ?? {};
      if (ch.field === 'feed' && v.item === 'comment' && v.verb === 'add' && v.comment_id) {
        s.comments.push({
          externalId: String(v.comment_id), externalPostId: String(v.post_id),
          externalParentId: v.parent_id && v.parent_id !== v.post_id ? String(v.parent_id) : null,
          authorName: v.from?.name ?? null, authorExternalId: v.from?.id ? String(v.from.id) : null, text: v.message ?? null,
          publishedAt: v.created_time ? new Date(Number(v.created_time) * 1000) : null,
          platformData: { fromPage: String(v.from?.id ?? '') === accountId, photo: v.photo ?? null, video: v.video ?? null },
        });
      } else if ((ch.field === 'comments' || ch.field === 'live_comments') && v.id && v.media?.id) {
        s.comments.push({
          externalId: String(v.id), externalPostId: String(v.media.id), externalParentId: v.parent_id ? String(v.parent_id) : null,
          authorName: v.from?.username ?? null, authorExternalId: v.from?.id ? String(v.from.id) : null,
          authorProfileUrl: v.from?.username ? `https://www.instagram.com/${v.from.username}` : null, text: v.text ?? null,
          publishedAt: entry.time ? new Date(Number(entry.time) * (Number(entry.time) > 1e12 ? 1 : 1000)) : null,
          platformData: { mediaProductType: v.media.media_product_type ?? null, live: ch.field === 'live_comments', fromSelf: String(v.from?.id ?? '') === accountId },
        });
      }
    }
  }
  return [...out.values()].filter(e => e.messages.length || e.comments.length);
}

// ───────────────────────────── Facebook Login (shared by Facebook + Instagram) ─────────────────────────────

/** code → short-lived user token → long-lived user token (≈60 days). */
export async function facebookLoginTokens(ctx: NetworkContext, clientId: string, clientSecret: string, code: string) {
  const short = await graph<{ access_token: string; expires_in?: number }>(ctx, `${FB_GRAPH}/oauth/access_token`, null, {
    query: { client_id: clientId, client_secret: clientSecret, redirect_uri: ctx.redirectUri, code },
  });
  const long = await graph<{ access_token: string; expires_in?: number }>(ctx, `${FB_GRAPH}/oauth/access_token`, null, {
    query: { grant_type: 'fb_exchange_token', client_id: clientId, client_secret: clientSecret, fb_exchange_token: short.access_token },
  });
  const perms = await graph<{ data: { permission: string; status: string }[] }>(ctx, `${FB_GRAPH}/me/permissions`, long.access_token).catch(() => ({ data: [] }));
  return {
    accessToken: long.access_token,
    expiresAt: long.expires_in ? new Date(ctx.now().getTime() + Number(long.expires_in) * 1000) : null,
    scopes: perms.data.filter(p => p.status === 'granted').map(p => p.permission),
  };
}

/** The Facebook Login dialog URL. */
export function facebookDialogUrl(ctx: NetworkContext, clientId: string, scopes: string[], state: string, forceLogin?: boolean, messaging?: boolean) {
  const u = new URL(`${FB_WWW}/${GRAPH_VERSION}/dialog/oauth`);
  u.searchParams.set('client_id', clientId);
  u.searchParams.set('redirect_uri', ctx.redirectUri);
  u.searchParams.set('state', state);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', scopes.join(','));
  // Business apps on Facebook Login for Business: a login configuration (NETWORK_<TYPE>_LOGIN_CONFIG_ID,
  // or NETWORK_<TYPE>_MESSAGING_LOGIN_CONFIG_ID when messaging was asked for) defines the permissions;
  // Meta then ignores `scope`.
  const configId = ctx.mode === 'live'
    ? (messaging ? ctx.credentials.messagingLoginConfigId : undefined) ?? ctx.credentials.loginConfigId
    : undefined;
  if (configId) u.searchParams.set('config_id', configId);
  u.searchParams.set('auth_type', forceLogin ? 'reauthenticate' : 'rerequest');
  return u.toString();
}

/** A Page access token for the Page (never stored in channels: those are plain JSON). */
export async function pageAccessToken(ctx: NetworkContext, userToken: string, pageId: string): Promise<string> {
  const p = await graph<{ access_token?: string }>(ctx, `${FB_GRAPH}/${pageId}`, userToken, { query: { fields: 'access_token' } });
  if (!p.access_token) throw new NetworkError('PERMISSION', 'Facebook did not return a Page access token. The connected user needs a task on this Page.');
  return p.access_token;
}

export const requireCred = (ctx: NetworkContext, key: string, label: string) => {
  const v = ctx.credentials[key];
  if (!v) throw new NetworkError('NOT_CONFIGURED', `${label} is not configured on this server.`);
  return v;
};

/** Meta's emoji counting for Threads: an emoji counts as its UTF-8 byte length. */
export const threadsLength = (s: string) => {
  let n = 0;
  for (const { segment } of new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(s)) n += /\p{Extended_Pictographic}/u.test(segment) ? Buffer.byteLength(segment) : 1;
  return n;
};
