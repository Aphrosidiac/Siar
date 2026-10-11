/**
 * Slack — a Slack app installed into a workspace (OAuth v2, bot token), posting to channels.
 *
 * Docs: https://api.slack.com/methods
 *   OAuth v2   https://slack.com/oauth/v2/authorize (bot `scope`) → POST /api/oauth.v2.access with
 *              client_id + client_secret. No PKCE. The bot token (xoxb-…) does not expire unless the
 *              app opted into token rotation, in which case refresh_token + expires_in come back and
 *              refresh() uses grant_type=refresh_token on the same endpoint.
 *   Errors     Web API calls answer HTTP 200 with { ok: false, error: 'channel_not_found' } — slackCall()
 *              turns that into a NetworkError. Only 429 (Retry-After) is a real HTTP error.
 *   Channels   conversations.list (public + private channels the bot is in, cursor-paginated). The
 *              chosen channel is required. chat:write.public lets the bot post to public channels it
 *              has not joined.
 *   Posting    chat.postMessage { channel, text, username, icon_url } (the overrides need
 *              chat:write.customize). Files use the external upload flow: files.getUploadURLExternal →
 *              PUT bytes to upload_url → files.completeUploadExternal { channel_id, initial_comment }.
 *              A file share is posted by the app under its own name, so username/icon_url do not apply
 *              to posts with files.
 *   Ids        A message's external id is "<channel>:<ts>" — chat.update/delete/reactions need both.
 *              A file share whose message ts is not visible yet is "<channel>:file-<fileId>" (deleted
 *              with files.delete).
 *   Comments   Thread replies (thread_ts = the post's ts); conversations.replies imports them.
 *   Likes      reactions.add / reactions.remove with the :heart: emoji.
 */
import { NetworkError } from '../lib/errors.js';
import { request, sleep, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { checkMedia, checkText, GB } from '../lib/validate.js';
import type { AccountRuntime, Channel, FetchedCommentInput, Issue, MediaRef, NetworkAdapter, NetworkContext, PostMetrics, TokenSet } from '../types.js';

const API = 'https://slack.com/api';
const SCOPES = ['chat:write', 'chat:write.public', 'chat:write.customize', 'channels:read', 'groups:read', 'channels:history', 'groups:history', 'files:write', 'files:read', 'reactions:write', 'users:read'];
const TEXT_MAX = 40_000;
const LIKE_EMOJI = 'heart';

// ───────────────────────────── errors ─────────────────────────────

/** The HTTP-level errors (429, 5xx). The `{ ok: false }` case is mapSlack. */
function mapHttp(status: number, body: any, res: Response): NetworkError | undefined {
  if (status === 429) {
    const secs = Number(res.headers.get('retry-after') ?? 30);
    return new NetworkError('RATE_LIMITED', body?.error ?? 'ratelimited', { httpStatus: status, meta: body, rateLimitResetAt: new Date(Date.now() + secs * 1000) });
  }
  return undefined;
}

const TOKEN_ERRORS = ['invalid_auth', 'not_authed', 'account_inactive', 'token_revoked', 'token_expired', 'invalid_refresh_token', 'invalid_code', 'bad_client_secret', 'invalid_client_id', 'invalid_grant_type'];
const PERMISSION_ERRORS = ['missing_scope', 'not_allowed_token_type', 'no_permission', 'restricted_action', 'not_in_channel', 'is_archived', 'cant_update_message', 'cant_delete_message', 'edit_window_closed', 'team_access_not_granted', 'access_denied', 'channel_not_found_or_private'];
const NOT_FOUND_ERRORS = ['channel_not_found', 'message_not_found', 'thread_not_found', 'file_not_found', 'no_such_subteam'];
const CONTENT_ERRORS = ['msg_too_long', 'no_text', 'invalid_blocks', 'invalid_blocks_format', 'invalid_attachments', 'too_many_attachments', 'message_limit_exceeded'];
const MEDIA_ERRORS = ['invalid_file', 'file_uploads_disabled', 'file_upload_failed', 'upload_failed', 'file_too_large', 'invalid_file_type'];

export function mapSlack(error: string, body: any, status = 200): NetworkError {
  const meta = { ...body, ...(body?.response_metadata?.messages ? { details: body.response_metadata.messages } : {}) };
  const detail = body?.response_metadata?.messages?.length ? ` (${body.response_metadata.messages.join('; ')})` : body?.needed ? ` (needs ${body.needed})` : '';
  const msg = `${error}${detail}`;
  const opts = { httpStatus: status, meta };
  if (TOKEN_ERRORS.includes(error)) return new NetworkError('TOKEN_INVALID', msg, opts);
  if (error === 'ratelimited' || error === 'rate_limited') return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: new Date(Date.now() + 30_000) });
  if (PERMISSION_ERRORS.includes(error)) return new NetworkError('PERMISSION', msg, opts);
  if (NOT_FOUND_ERRORS.includes(error)) return new NetworkError('NOT_FOUND', msg, opts);
  if (MEDIA_ERRORS.includes(error)) return new NetworkError('MEDIA_INVALID', msg, opts);
  if (CONTENT_ERRORS.includes(error)) return new NetworkError('CONTENT_REJECTED', msg, opts);
  if (['fatal_error', 'internal_error', 'service_unavailable', 'request_timeout', 'ratelimit_unavailable'].includes(error)) return new NetworkError('NETWORK_UNAVAILABLE', msg, opts);
  if (['invalid_arguments', 'invalid_arg_name', 'invalid_array_arg', 'invalid_charset', 'invalid_cursor', 'invalid_form_data', 'invalid_json', 'invalid_post_type', 'missing_post_type', 'too_long', 'invalid_ts_latest', 'bad_timestamp', 'invalid_name'].includes(error)) return new NetworkError('VALIDATION', msg, opts);
  return new NetworkError('UNKNOWN', msg, opts);
}

/** One Web API method call. `json` for write methods, `query` (GET) for reads. */
async function slackCall<T = any>(ctx: NetworkContext, token: string | null, method: string, opts: RequestOptions = {}): Promise<T> {
  const body = await request<any>(ctx, `${API}/${method}`, { bearer: token, mapError: mapHttp, ...opts });
  if (!body || body.ok !== true) throw mapSlack(String(body?.error ?? 'unknown_error'), body);
  return body as T;
}

const api = <T = any>(ctx: NetworkContext, a: AccountRuntime, method: string, opts: RequestOptions = {}) => slackCall<T>(ctx, a.token.accessToken, method, opts);

// ───────────────────────────── helpers ─────────────────────────────

const splitId = (a: AccountRuntime, id: string): { channel: string; ts: string } => {
  const i = id.indexOf(':');
  if (i > 0) return { channel: id.slice(0, i), ts: id.slice(i + 1) };
  const channel = a.channelId ?? a.externalId;
  if (!channel) throw new NetworkError('VALIDATION', `"${id}" is not a Slack message id (<channel>:<ts>).`);
  return { channel, ts: id };
};

const tsDate = (ts: string) => new Date(Number(ts) * 1000);
const teamUrl = (a: AccountRuntime) => ((a.token.secrets ?? {}) as { teamUrl?: string }).teamUrl ?? null;
const permalink = (a: AccountRuntime, channel: string, ts: string) => {
  const base = teamUrl(a);
  return base ? `${base.replace(/\/$/, '')}/archives/${channel}/p${ts.replace('.', '')}` : null;
};

const toChannel = (c: any): Channel => ({
  id: String(c.id), name: `#${c.name}`, username: c.name,
  metadata: { isPrivate: !!(c.is_private || c.is_group), isMember: !!c.is_member, numMembers: c.num_members ?? null, topic: c.topic?.value ?? null, purpose: c.purpose?.value ?? null },
});

async function listAll(ctx: NetworkContext, token: string): Promise<Channel[]> {
  const out: Channel[] = [];
  let cursor: string | undefined;
  for (let page = 0; page < 20; page++) {
    const r = await slackCall(ctx, token, 'conversations.list', { query: { types: 'public_channel,private_channel', exclude_archived: true, limit: 200, cursor } });
    for (const c of r.channels ?? []) if (!c.is_archived) out.push(toChannel(c));
    cursor = r.response_metadata?.next_cursor || undefined;
    if (!cursor) break;
  }
  return out.sort((x, y) => String(x.name).localeCompare(String(y.name)));
}

/** External upload flow. Returns the file ids after files.completeUploadExternal shared them. */
async function uploadFiles(ctx: NetworkContext, a: AccountRuntime, media: MediaRef[], share: { channel: string; text?: string; threadTs?: string }): Promise<string[]> {
  const ids: { id: string; title: string }[] = [];
  for (const m of media) {
    const filename = `${m.id}.${m.ext}`;
    const slot = await api(ctx, a, 'files.getUploadURLExternal', { query: { filename, length: m.fileSize, ...(m.altText ? { alt_txt: m.altText } : {}) } });
    const put = await ctx.fetch(slot.upload_url, { method: 'POST', headers: { 'content-type': m.mime }, body: new Uint8Array(await m.read()), timeoutMs: 600_000 }).catch(err => {
      throw new NetworkError('NETWORK_UNAVAILABLE', `Could not reach Slack's upload server: ${(err as Error).message}`);
    });
    if (!put.ok) throw new NetworkError('MEDIA_INVALID', `Slack's upload server rejected ${filename} (HTTP ${put.status}).`, { httpStatus: put.status });
    ids.push({ id: slot.file_id, title: filename });
  }
  await api(ctx, a, 'files.completeUploadExternal', {
    json: { files: ids, channel_id: share.channel, ...(share.text ? { initial_comment: share.text } : {}), ...(share.threadTs ? { thread_ts: share.threadTs } : {}) },
  });
  return ids.map(f => f.id);
}

/** The ts of the message a file share created (it shows up on files.info a moment after completing). */
async function shareTs(ctx: NetworkContext, a: AccountRuntime, fileId: string, channel: string): Promise<string | null> {
  for (let i = 0; i < 6; i++) {
    const r = await api(ctx, a, 'files.info', { query: { file: fileId } }).catch(() => null);
    const shares = [...(r?.file?.shares?.public?.[channel] ?? []), ...(r?.file?.shares?.private?.[channel] ?? [])];
    if (shares[0]?.ts) return shares[0].ts;
    await sleep(ctx.mode === 'mock' ? 10 : 1000);
  }
  return null;
}

async function send(ctx: NetworkContext, a: AccountRuntime, o: { channel: string; text: string; media: MediaRef[]; threadTs?: string; username?: string | null; iconUrl?: string | null }) {
  if (o.media.length) {
    const fileIds = await uploadFiles(ctx, a, o.media, { channel: o.channel, text: o.text, threadTs: o.threadTs });
    const ts = await shareTs(ctx, a, fileIds[0], o.channel);
    return { id: ts ? `${o.channel}:${ts}` : `${o.channel}:file-${fileIds[0]}`, ts, fileIds };
  }
  const r = await api(ctx, a, 'chat.postMessage', {
    json: { channel: o.channel, text: o.text, thread_ts: o.threadTs, username: o.username || undefined, icon_url: o.iconUrl || undefined, unfurl_links: true },
  });
  return { id: `${r.channel}:${r.ts}`, ts: r.ts as string, fileIds: [] as string[] };
}

const reactionTotal = (m: any) => (m?.reactions ?? []).reduce((n: number, r: any) => n + (r.count ?? 0), 0);

function tokenOf(ctx: NetworkContext, r: any, prev: TokenSet | null): TokenSet {
  const secrets = { ...(prev?.secrets ?? {}), ...(r.team ? { teamId: r.team.id, teamName: r.team.name } : {}), ...(r.bot_user_id ? { botUserId: r.bot_user_id } : {}) };
  return {
    accessToken: r.access_token, refreshToken: r.refresh_token ?? prev?.refreshToken ?? null, expiresAt: expiresIn(r.expires_in, ctx.now()),
    scopes: String(r.scope ?? SCOPES.join(',')).split(/[\s,]+/).filter(Boolean), secrets,
  };
}

// ───────────────────────────── the adapter ─────────────────────────────

export const slack: NetworkAdapter = {
  type: 'SLACK',
  displayName: 'Slack',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'required', postTypes: ['POST'],
    comments: true, firstComment: true, editPost: true, deletePost: true, editComment: false, deleteComment: true,
    commentImport: true, commentActions: ['DELETE', 'LIKE', 'UNLIKE'],
    accountAnalytics: false, postAnalytics: true, historyImport: false, messaging: false, metered: false,
  },
  limits: {
    textMax: TEXT_MAX,
    commentMax: TEXT_MAX,
    media: {
      maxItems: 10,
      image: { mimes: [], maxBytes: GB },
      video: { mimes: [], maxBytes: GB, maxSeconds: 86_400 },
      document: { mimes: [], maxBytes: GB },
    },
  },
  errorReference: [
    { code: 'not_in_channel', message: 'not_in_channel', meaning: 'The app is not a member of the channel (always the case for private channels, and for public ones without chat:write.public).', fix: 'Invite the app in Slack: /invite @Siar in the channel.' },
    { code: 'channel_not_found', message: 'channel_not_found', meaning: 'The channel does not exist or is private and the app was not invited.', fix: 'Refresh channels and pick again, or invite the app to the private channel.' },
    { code: 'is_archived', message: 'is_archived', meaning: 'The channel was archived.', fix: 'Unarchive it or choose another channel.' },
    { code: 'invalid_auth', message: 'invalid_auth', meaning: 'The bot token is invalid, revoked or the app was uninstalled.', fix: 'Reconnect the Slack workspace.' },
    { code: 'token_revoked', message: 'token_revoked', meaning: 'A workspace admin removed the app or revoked its token.', fix: 'Reconnect the Slack workspace.' },
    { code: 'missing_scope', message: 'missing_scope (needs chat:write.customize)', meaning: 'A feature (custom username/icon, reactions, private channel history) needs a scope the install does not have.', fix: 'Reconnect to grant the new scopes.' },
    { code: 'msg_too_long', message: 'msg_too_long', meaning: 'The text is over Slack\'s 40,000 character limit.', fix: 'Shorten the text.' },
    { code: 'cant_delete_message', message: 'cant_delete_message', meaning: 'The app may only delete its own messages, and the workspace may restrict deletion.', fix: 'Delete it in Slack as a member with permission.' },
    { code: 'edit_window_closed', message: 'edit_window_closed', meaning: 'The workspace limits how long a message can be edited.', fix: 'Post a new message instead.' },
    { code: 'ratelimited', message: 'ratelimited', meaning: 'chat.postMessage allows about 1 message per second per channel; Retry-After says when.', fix: 'Retry after the delay (Siar does).' },
  ],

  async authorize(ctx, input) {
    return { url: authorizeUrl('https://slack.com/oauth/v2/authorize', { client_id: ctx.credentials.clientId, scope: SCOPES.join(','), redirect_uri: ctx.redirectUri, state: input.state }) };
  },

  async exchange(ctx, input) {
    const r = await slackCall(ctx, null, 'oauth.v2.access', { form: { code: input.code, redirect_uri: ctx.redirectUri, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret } });
    if (!r.access_token) throw new NetworkError('NOT_SUPPORTED', 'Slack returned no bot token. The app needs bot scopes.', { meta: { scope: r.scope } });
    const auth = await slackCall(ctx, r.access_token, 'auth.test');
    const token = tokenOf(ctx, r, null);
    token.secrets = { ...token.secrets, teamUrl: auth.url ?? null };
    return {
      token,
      profile: {
        externalId: r.team.id, providerPageId: r.team.id, username: r.team.name, displayName: r.team.name, avatarUrl: null,
        channels: await listAll(ctx, r.access_token), userId: r.authed_user?.id ?? null, userDisplayName: r.team.name,
      },
    };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) return a.token;
    const r = await slackCall(ctx, null, 'oauth.v2.access', { form: { grant_type: 'refresh_token', refresh_token: a.token.refreshToken, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret } });
    return tokenOf(ctx, r, a.token);
  },

  async refreshProfile(ctx, a) {
    return { channels: await listAll(ctx, a.token.accessToken) };
  },

  async listChannels(ctx, a) {
    return listAll(ctx, a.token.accessToken);
  },

  async checkConnection(ctx, a) {
    try { await api(ctx, a, 'auth.test'); return true; } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await api(ctx, a, 'auth.revoke').catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    checkText(issues, data.text, TEXT_MAX, ['text'], media.length === 0);
    checkMedia(issues, media, slack.limits);
    if (data.avatarUrl && !/^https?:\/\//i.test(data.avatarUrl)) issues.push({ code: 'invalid', message: 'avatarUrl must be an http(s) URL.', path: ['avatarUrl'] });
    if (data.username && String(data.username).length > 80) issues.push({ code: 'too_long', message: 'username is limited to 80 characters.', path: ['username'] });
    if (media.length && (data.username || data.avatarUrl)) issues.push({ code: 'ignored', message: 'Slack posts files under the app\'s own name; username and avatarUrl only apply to text posts.', path: ['username'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const channel = String(input.data.channelId ?? a.channelId ?? '');
    if (!channel) throw new NetworkError('VALIDATION', 'Choose a Slack channel (data.SLACK.channelId or social-account/set-channel).');
    const r = await send(ctx, a, { channel, text: input.data.text ?? '', media: input.media, username: input.bot?.name ?? input.data.username, iconUrl: input.bot?.avatarUrl ?? input.data.avatarUrl });
    const link = r.ts ? permalink(a, channel, r.ts) : null;
    return { status: 'POSTED', externalPostId: r.id, permalink: link, externalData: { id: r.ts ?? r.fileIds[0], permalink: link, channelId: channel } };
  },

  async deletePost(ctx, a, id) {
    const { channel, ts } = splitId(a, id);
    if (ts.startsWith('file-')) return void (await api(ctx, a, 'files.delete', { json: { file: ts.slice(5) } }));
    await api(ctx, a, 'chat.delete', { json: { channel, ts } });
  },

  async editPost(ctx, a, id, data) {
    const { channel, ts } = splitId(a, id);
    await api(ctx, a, 'chat.update', { json: { channel, ts, text: data.text ?? data.description } });
  },

  async comment(ctx, input) {
    const a = input.account;
    const { channel, ts } = splitId(a, input.externalPostId);
    // Slack threads are flat: a reply to a reply still hangs off the thread's root.
    const r = await send(ctx, a, { channel, text: input.text, media: input.media, threadTs: ts });
    return { externalId: r.id, permalink: r.ts ? permalink(a, channel, r.ts) : null, externalData: { id: r.ts } };
  },

  async deleteComment(ctx, a, id) {
    await slack.deletePost!(ctx, a, id);
  },

  async importComments(ctx, a, input) {
    const { channel, ts } = splitId(a, input.externalPostId);
    const r = await api(ctx, a, 'conversations.replies', { query: { channel, ts, limit: Math.min(input.limit + 1, 200), cursor: input.cursor ?? undefined } });
    const names = new Map<string, string | null>();
    const nameOf = async (user?: string) => {
      if (!user) return null;
      if (!names.has(user)) {
        const u = await api(ctx, a, 'users.info', { query: { user } }).then(x => x.user?.profile?.display_name || x.user?.real_name || x.user?.name || null).catch(() => null);
        names.set(user, u);
      }
      return names.get(user) ?? null;
    };
    const items: FetchedCommentInput[] = [];
    for (const msg of (r.messages ?? []) as any[]) {
      if (msg.ts === ts) continue; // the parent comes first in the thread
      items.push({
        externalId: `${channel}:${msg.ts}`, externalParentId: null, externalPostId: input.externalPostId,
        authorName: (await nameOf(msg.user)) ?? msg.username ?? msg.user ?? null, authorExternalId: msg.user ?? msg.bot_id ?? null,
        text: msg.text ?? '', likesCount: reactionTotal(msg), repliesCount: 0, publishedAt: tsDate(msg.ts),
        platformData: { ts: msg.ts, subtype: msg.subtype ?? null, botId: msg.bot_id ?? null },
      });
    }
    return { items: items.slice(0, input.limit), nextCursor: r.response_metadata?.next_cursor || null };
  },

  async commentAction(ctx, a, comment, action) {
    const { channel, ts } = splitId(a, comment.externalId);
    if (action === 'DELETE') return slack.deletePost!(ctx, a, comment.externalId);
    if (action !== 'LIKE' && action !== 'UNLIKE') throw new NetworkError('NOT_SUPPORTED', `Slack does not support ${action} on replies.`);
    try {
      await api(ctx, a, action === 'LIKE' ? 'reactions.add' : 'reactions.remove', { json: { channel, timestamp: ts, name: LIKE_EMOJI } });
    } catch (e) {
      const err = (e as NetworkError).meta as any;
      if (err?.error === 'already_reacted' || err?.error === 'no_reaction') return; // already in the wanted state
      throw e;
    }
  },

  async postAnalytics(ctx, a, id): Promise<PostMetrics> {
    const { channel, ts } = splitId(a, id);
    const r = await api(ctx, a, 'conversations.history', { query: { channel, latest: ts, inclusive: true, limit: 1 } });
    const msg = r.messages?.[0];
    if (!msg || msg.ts !== ts) throw new NetworkError('NOT_FOUND', 'message_not_found');
    return { likes: reactionTotal(msg), comments: msg.reply_count ?? 0, raw: { reactions: msg.reactions ?? [], reply_count: msg.reply_count ?? 0 } };
  },

  misc: {
    'misc.slack.editMessage': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await slack.editPost!(ctx, a, p.externalPostId, { text: body.description ?? body.text });
      const { channel, ts } = splitId(a, p.externalPostId);
      return { success: true, permalink: permalink(a, channel, ts) ?? p.permalink ?? '' };
    },
    'misc.slack.deleteMessage': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await slack.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
  },
};

