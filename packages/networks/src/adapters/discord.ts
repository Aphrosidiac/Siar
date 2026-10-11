/**
 * Discord — a bot installed into a server (guild), posting through a per-channel webhook.
 *
 * Docs: https://discord.com/developers/docs/
 *   Install        https://discord.com/oauth2/authorize with scope=bot (+ identify) and a permission
 *                  bitfield; response_type=code makes the callback carry `code` AND `guild_id`. The code
 *                  is exchanged only to learn who installed the bot; everything after that is the bot
 *                  token (ctx.credentials.botToken, ours, never stored per account). Discord can also
 *                  redirect with just guild_id (no code) — that is accepted too.
 *   Channels       GET /guilds/{id}/channels with `Authorization: Bot …`; text (0) and announcement (5)
 *                  channels are the account's `channels` and must be chosen before posting.
 *   Webhooks       selectChannel() finds or creates a webhook named "Siar" on the channel; {id, token}
 *                  is kept in token.secrets.webhook. Posting = POST /webhooks/{id}/{token}?wait=true,
 *                  which allows per-message username / avatar_url overrides and multipart `files[n]`.
 *                  Webhook messages can only be edited/deleted through the same webhook.
 *   Ids            A message's external id is "<channelId>:<messageId>" — the channel is needed to find
 *                  the webhook again when deleting (a post's data.channelId can differ from the
 *                  selected channel).
 *   Replies        Webhooks cannot reply to a message, so comments are sent as the bot itself with a
 *                  message_reference.
 *   Errors         { code: 50013, message } — Discord's numeric code decides the category; 429 carries
 *                  retry_after seconds.
 */
import { NetworkError } from '../lib/errors.js';
import { request, type RequestOptions } from '../lib/http.js';
import { authorizeUrl } from '../lib/oauth.js';
import { checkMedia, checkText, MB } from '../lib/validate.js';
import type { AccountRuntime, Channel, Issue, MediaRef, NetworkAdapter, NetworkContext, TokenSet } from '../types.js';

const API = 'https://discord.com/api/v10';
const SCOPES = ['bot', 'identify'];
// ViewChannel | SendMessages | ManageMessages | EmbedLinks | AttachFiles | ReadMessageHistory | ManageWebhooks
const PERMISSIONS = String((1 << 10) | (1 << 11) | (1 << 13) | (1 << 14) | (1 << 15) | (1 << 16) | (1 << 29));
const TEXT_MAX = 2000;
const WEBHOOK_NAME = 'Siar';
const TEXT_CHANNELS = [0, 5];

// ───────────────────────────── errors ─────────────────────────────

function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  const code: number | undefined = typeof body?.code === 'number' ? body.code : undefined;
  const msg: string = body?.message ?? body?.error_description ?? `Discord returned HTTP ${status}`;
  const opts = { httpStatus: status, meta: body };
  if (status === 429) {
    const retry = Number(body?.retry_after ?? res.headers.get('retry-after') ?? 1);
    return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: new Date(Date.now() + Math.ceil(retry) * 1000) });
  }
  if (status === 401 || body?.error === 'invalid_grant' || body?.error === 'invalid_client') return new NetworkError('TOKEN_INVALID', msg, opts);
  if (code === 40005 || status === 413) return new NetworkError('MEDIA_INVALID', msg, opts);
  if (code === 10003 || code === 10008 || code === 10004 || code === 10015) return new NetworkError('NOT_FOUND', msg, opts);
  if (code === 50001 || code === 50013 || code === 50007 || code === 50027 || status === 403) return new NetworkError('PERMISSION', msg, opts);
  if (code === 50035) return new NetworkError(/content|files|attachments|embeds/i.test(JSON.stringify(body?.errors ?? {})) ? 'CONTENT_REJECTED' : 'VALIDATION', `${msg}${body?.errors ? `: ${flatten(body.errors)}` : ''}`, opts);
  if (code === 20028 || code === 20016) return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: new Date(Date.now() + 60_000) });
  if (status === 404) return new NetworkError('NOT_FOUND', msg, opts);
  if (status === 400) return new NetworkError('VALIDATION', msg, opts);
  return undefined;
}

/** Discord nests field errors ({ content: { _errors: [{ message }] } }); pull the messages out. */
function flatten(errors: any, path = ''): string {
  if (!errors || typeof errors !== 'object') return '';
  if (Array.isArray(errors._errors)) return errors._errors.map((e: any) => `${path || 'request'}: ${e.message}`).join('; ');
  return Object.entries(errors).map(([k, v]) => flatten(v, path ? `${path}.${k}` : k)).filter(Boolean).join('; ');
}

const bot = (ctx: NetworkContext) => {
  const t = ctx.credentials.botToken;
  if (!t) throw new NetworkError('NOT_CONFIGURED', 'The Discord bot token (NETWORK_DISCORD_BOT_TOKEN) is not configured on this server.');
  return t;
};

/** A call as the bot. */
const asBot = <T = any>(ctx: NetworkContext, path: string, opts: RequestOptions = {}) =>
  request<T>(ctx, `${API}${path}`, { headers: { authorization: `Bot ${bot(ctx)}` }, mapError, ...opts });

// ───────────────────────────── helpers ─────────────────────────────

interface Webhook { id: string; token: string; channelId: string }
const secretsOf = (a: AccountRuntime) => (a.token.secrets ?? {}) as { guildId?: string; guildName?: string; webhook?: Webhook };

const guildOf = (a: AccountRuntime): string => {
  const g = secretsOf(a).guildId ?? a.channels[0]?.metadata?.guildId ?? a.providerPageId;
  if (!g) throw new NetworkError('VALIDATION', 'This Discord account has no server id; reconnect it.');
  return String(g);
};

const iconUrl = (g: any) => (g?.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png` : null);

const toChannel = (c: any, guild: { id: string; name?: string }): Channel => ({
  id: String(c.id), name: `#${c.name}`, username: c.name, metadata: { guildId: guild.id, guildName: guild.name ?? null, type: c.type, parentId: c.parent_id ?? null, topic: c.topic ?? null, nsfw: !!c.nsfw },
});

async function textChannels(ctx: NetworkContext, guild: { id: string; name?: string }): Promise<Channel[]> {
  const list = await asBot<any[]>(ctx, `/guilds/${guild.id}/channels`);
  return list.filter(c => TEXT_CHANNELS.includes(c.type)).sort((a, b) => (a.position ?? 0) - (b.position ?? 0)).map(c => toChannel(c, guild));
}

/** The webhook Siar owns on a channel: reuse ours (a webhook created by the bot carries a token), else create one. */
async function ensureWebhook(ctx: NetworkContext, channelId: string): Promise<Webhook> {
  const existing = await asBot<any[]>(ctx, `/channels/${channelId}/webhooks`);
  const mine = existing.find(w => w.name === WEBHOOK_NAME && w.token);
  if (mine) return { id: mine.id, token: mine.token, channelId };
  const w = await asBot(ctx, `/channels/${channelId}/webhooks`, { method: 'POST', json: { name: WEBHOOK_NAME } });
  return { id: w.id, token: w.token, channelId };
}

const webhookFor = async (ctx: NetworkContext, a: AccountRuntime, channelId: string): Promise<Webhook> => {
  const w = secretsOf(a).webhook;
  return w && w.channelId === channelId ? w : ensureWebhook(ctx, channelId);
};

const hookUrl = (w: Webhook, rest = '') => `${API}/webhooks/${w.id}/${w.token}${rest}`;

const splitId = (a: AccountRuntime, id: string): { channelId: string; messageId: string } => {
  const i = id.indexOf(':');
  if (i > 0) return { channelId: id.slice(0, i), messageId: id.slice(i + 1) };
  const channelId = a.channelId ?? a.externalId;
  if (!channelId) throw new NetworkError('VALIDATION', `"${id}" is not a Discord message id (<channelId>:<messageId>).`);
  return { channelId, messageId: id };
};

/** A deleted webhook (10015) or a stale token (50027) is healed once by creating a fresh one. */
async function viaWebhook<T>(ctx: NetworkContext, a: AccountRuntime, channelId: string, run: (w: Webhook) => Promise<T>): Promise<T> {
  try { return await run(await webhookFor(ctx, a, channelId)); } catch (e) {
    const code = (e as NetworkError).meta && ((e as NetworkError).meta as any).code;
    if (e instanceof NetworkError && (code === 10015 || code === 50027)) return run(await ensureWebhook(ctx, channelId));
    throw e;
  }
}

async function multipart(payload: Record<string, unknown>, media: MediaRef[]): Promise<FormData> {
  const form = new FormData();
  const attachments = media.map((m, i) => ({ id: i, filename: `${m.id}.${m.ext}`, ...(m.altText ? { description: m.altText } : {}) }));
  form.set('payload_json', JSON.stringify({ ...payload, attachments }));
  for (const [i, m] of media.entries()) form.set(`files[${i}]`, new Blob([new Uint8Array(await m.read())], { type: m.mime }), `${m.id}.${m.ext}`);
  return form;
}

// ───────────────────────────── the adapter ─────────────────────────────

export const discord: NetworkAdapter = {
  type: 'DISCORD',
  displayName: 'Discord',
  credentialKeys: ['clientId', 'clientSecret', 'botToken'],
  scopes: SCOPES,
  capabilities: {
    connect: 'bot', channels: 'required', postTypes: ['POST'],
    comments: true, firstComment: true, editPost: false, deletePost: true, editComment: false, deleteComment: true,
    commentImport: false, commentActions: ['DELETE'],
    accountAnalytics: false, postAnalytics: false, historyImport: false, messaging: false, metered: false,
  },
  limits: {
    textMax: TEXT_MAX,
    commentMax: TEXT_MAX,
    media: {
      maxItems: 10,
      // Upload size follows the server's boost level; 10 MB is the floor for every server.
      image: { mimes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'], maxBytes: 10 * MB },
      video: { mimes: ['video/mp4', 'video/webm', 'video/quicktime'], maxBytes: 10 * MB, maxSeconds: 86_400 },
      document: { mimes: [], maxBytes: 10 * MB },
    },
  },
  errorReference: [
    { code: '50013', message: 'Missing Permissions', meaning: 'The bot (or its role) lacks a permission in that channel, e.g. Manage Webhooks or Send Messages.', fix: 'Grant the Siar bot role View Channel, Send Messages, Attach Files and Manage Webhooks in the channel.' },
    { code: '50001', message: 'Missing Access', meaning: 'The bot cannot see the channel or server (removed, or the channel is private to other roles).', fix: 'Re-invite the bot, or give its role access to the channel.' },
    { code: '10003', message: 'Unknown Channel', meaning: 'The channel was deleted.', fix: 'Choose another channel (refresh channels first).' },
    { code: '10015', message: 'Unknown Webhook', meaning: 'The Siar webhook was deleted in Discord.', fix: 'Nothing: Siar creates a new webhook and retries once.' },
    { code: '10008', message: 'Unknown Message', meaning: 'The message was already deleted in Discord.', fix: 'Nothing to delete.' },
    { code: '50035', message: 'Invalid Form Body', meaning: 'A field was rejected, usually content over 2000 characters, more than 10 files, or a username containing "discord" or "clyde".', fix: 'Shorten the text, send at most 10 files, change the username.' },
    { code: '40005', message: 'Request entity too large', meaning: 'A file or the whole upload is over the server\'s upload limit (10 MB unless the server is boosted).', fix: 'Compress the file or post a link.' },
    { code: '429', message: 'You are being rate limited.', meaning: 'Webhooks allow about 5 requests per 2 seconds per webhook; retry_after says when.', fix: 'Retry after retry_after seconds (Siar does).' },
    { code: '401', message: '401: Unauthorized', meaning: 'The server\'s bot token is wrong or was reset.', fix: 'Ask the Siar operator to update NETWORK_DISCORD_BOT_TOKEN.' },
  ],

  async authorize(ctx, input) {
    const url = authorizeUrl('https://discord.com/oauth2/authorize', {
      client_id: ctx.credentials.clientId, scope: SCOPES.join(' '), permissions: PERMISSIONS, response_type: 'code', redirect_uri: ctx.redirectUri, state: input.state,
      integration_type: '0', prompt: input.forceLogin ? 'consent' : undefined,
    });
    return { url };
  },

  async exchange(ctx, input) {
    let guild: { id: string; name?: string; icon?: string | null } | undefined = input.query.guild_id ? { id: input.query.guild_id } : undefined;
    let token: TokenSet = { accessToken: '', scopes: SCOPES };
    let who: any = null;
    if (input.code) {
      const tok = await request(ctx, `${API}/oauth2/token`, {
        form: { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri, client_id: ctx.credentials.clientId, client_secret: ctx.credentials.clientSecret }, mapError,
      });
      token = { accessToken: tok.access_token, scopes: String(tok.scope ?? SCOPES.join(' ')).split(/\s+/) };
      guild = guild ?? tok.guild;
      who = await request(ctx, `${API}/users/@me`, { bearer: tok.access_token, mapError }).catch(() => null);
    }
    if (!guild?.id) throw new NetworkError('VALIDATION', 'Discord did not say which server the bot was added to. Start again and pick a server.');
    // The bot must really be in the server now — this also proves the install worked.
    const g = await asBot(ctx, `/guilds/${guild.id}`);
    const channels = await textChannels(ctx, { id: g.id, name: g.name });
    return {
      token: { ...token, secrets: { guildId: g.id, guildName: g.name } },
      profile: {
        externalId: g.id, providerPageId: g.id, username: g.name, displayName: g.name, avatarUrl: iconUrl(g), channels,
        userId: who?.id ?? null, userUsername: who?.username ?? null, userDisplayName: who?.global_name ?? who?.username ?? null,
      },
    };
  },

  async refreshProfile(ctx, a) {
    const g = await asBot(ctx, `/guilds/${guildOf(a)}`);
    return { avatarUrl: iconUrl(g), channels: await textChannels(ctx, { id: g.id, name: g.name }) };
  },

  async listChannels(ctx, a) {
    const g = await asBot(ctx, `/guilds/${guildOf(a)}`);
    return textChannels(ctx, { id: g.id, name: g.name });
  },

  async selectChannel(ctx, a, channel) {
    const webhook = await ensureWebhook(ctx, channel.id);
    return { token: { ...a.token, secrets: { ...secretsOf(a), webhook } } };
  },

  async checkConnection(ctx, a) {
    try { await asBot(ctx, `/guilds/${guildOf(a)}`); return true; } catch (e) {
      // 404/10004 or 403/50001: the bot was kicked from the server — the install is gone.
      if (e instanceof NetworkError && (e.code === 'NOT_FOUND' || e.code === 'PERMISSION')) return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    // Uninstalling = remove our webhook. The bot itself stays in the server until an admin kicks it.
    const w = secretsOf(a).webhook;
    if (w) await request(ctx, hookUrl(w), { method: 'DELETE', mapError }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    checkText(issues, data.text, TEXT_MAX, ['text'], media.length === 0);
    checkMedia(issues, media, discord.limits);
    if (data.username != null) {
      const u = String(data.username);
      if (u.length < 1 || u.length > 80) issues.push({ code: 'invalid', message: 'username must be 1–80 characters.', path: ['username'] });
      else if (/discord|clyde|everyone|here|```/i.test(u)) issues.push({ code: 'invalid', message: 'Discord does not allow "discord", "clyde", "everyone", "here" or ``` in a webhook username.', path: ['username'] });
    }
    if (data.avatarUrl && !/^https?:\/\//i.test(data.avatarUrl)) issues.push({ code: 'invalid', message: 'avatarUrl must be an http(s) URL.', path: ['avatarUrl'] });
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const channelId = String(input.data.channelId ?? a.channelId ?? '');
    if (!channelId) throw new NetworkError('VALIDATION', 'Choose a Discord channel (data.DISCORD.channelId or social-account/set-channel).');
    const username = input.bot?.name ?? input.data.username;
    const avatar = input.bot?.avatarUrl ?? input.data.avatarUrl;
    const payload = {
      content: input.data.text ?? '', username: username || undefined, avatar_url: avatar || undefined,
      // @everyone / @here stay inert; people and roles can still be mentioned.
      allowed_mentions: { parse: ['users', 'roles'] },
    };
    const msg = await viaWebhook(ctx, a, channelId, async w =>
      request(ctx, hookUrl(w, '?wait=true'), {
        method: 'POST', mapError, timeoutMs: 300_000,
        ...(input.media.length ? { body: await multipart(payload, input.media) } : { json: payload }),
      }));
    const guildId = secretsOf(a).guildId;
    const permalink = `https://discord.com/channels/${guildId ?? '@me'}/${msg.channel_id ?? channelId}/${msg.id}`;
    return { status: 'POSTED', externalPostId: `${msg.channel_id ?? channelId}:${msg.id}`, permalink, externalData: { id: msg.id, permalink, channelId: msg.channel_id ?? channelId } };
  },

  async deletePost(ctx, a, id) {
    const { channelId, messageId } = splitId(a, id);
    try {
      await viaWebhook(ctx, a, channelId, w => request(ctx, hookUrl(w, `/messages/${messageId}`), { method: 'DELETE', mapError }));
    } catch (e) {
      // A message posted by an earlier (since deleted) webhook is out of that webhook's reach; the
      // bot can still remove it when it has Manage Messages.
      if (!(e instanceof NetworkError) || (e.code !== 'NOT_FOUND' && e.code !== 'PERMISSION')) throw e;
      await asBot(ctx, `/channels/${channelId}/messages/${messageId}`, { method: 'DELETE' }).catch(() => { throw e; });
    }
  },

  async comment(ctx, input) {
    const { channelId, messageId } = splitId(input.account, input.parentExternalId ?? input.externalPostId);
    const payload = { content: input.text, message_reference: { message_id: messageId, fail_if_not_exists: false }, allowed_mentions: { parse: ['users', 'roles'], replied_user: false } };
    const msg = await asBot(ctx, `/channels/${channelId}/messages`, {
      method: 'POST', timeoutMs: 300_000, ...(input.media.length ? { body: await multipart(payload, input.media) } : { json: payload }),
    });
    const guildId = secretsOf(input.account).guildId;
    return { externalId: `${channelId}:${msg.id}`, permalink: `https://discord.com/channels/${guildId ?? '@me'}/${channelId}/${msg.id}`, externalData: { id: msg.id, permalink: null } };
  },

  async deleteComment(ctx, a, id) {
    const { channelId, messageId } = splitId(a, id);
    await asBot(ctx, `/channels/${channelId}/messages/${messageId}`, { method: 'DELETE' });
  },

  async commentAction(ctx, a, comment, action) {
    if (action !== 'DELETE') throw new NetworkError('NOT_SUPPORTED', `Discord does not support ${action} on replies.`);
    await discord.deleteComment!(ctx, a, comment.externalId);
  },

  misc: {
    'misc.discord.deleteMessage': async (ctx, a, { body, lookup }) => {
      const p = await lookup.post(body.postId);
      await discord.deletePost!(ctx, a, p.externalPostId);
      return { success: true };
    },
  },
};
