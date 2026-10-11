import { consent, id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Discord — OAuth2 bot install, the bot REST API (guilds, channels, webhooks) and webhook execution.
 * Bot calls need `Authorization: Bot mock-botToken` (the harness fills missing credentials with
 * `mock-<key>`); webhook calls are authenticated by the token in the URL.
 */
export default function discord(m: MockRegistry) {
  const s = () => m.ns('discord', () => ({
    tokens: {} as Record<string, string>, webhooks: {} as Record<string, any>, messages: [] as any[],
    channels: [{ id: '2001', name: 'general', type: 0, position: 0 }, { id: '2002', name: 'announcements', type: 5, position: 1 }, { id: '2003', name: 'Voice', type: 2, position: 2 }, { id: '2004', name: 'Text', type: 4, position: 3 }],
  }));
  const H = 'discord.com';
  const B = '/api/v10';
  const guild = { id: '1001', name: 'Siar Test Server', icon: 'abc123' };
  const err = (status: number, code: number, message: string): MockResponse => ({ status, json: { code, message } });
  const isBot = (req: MockRequest) => req.headers.authorization === 'Bot mock-botToken';

  m.on('GET', H, '/oauth2/authorize', req => consent(req, { extra: { guild_id: guild.id, permissions: req.query.permissions ?? '0' } }));
  m.on('POST', H, `${B}/oauth2/token`, req => {
    if (!String(req.body.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error: 'invalid_grant', error_description: 'Invalid "code" in request.' } };
    const token = id('dtok_');
    s().tokens[token] = '77';
    return { json: { access_token: token, token_type: 'Bearer', expires_in: 604800, refresh_token: id('drt_'), scope: 'bot identify', guild } };
  });
  m.on('GET', H, `${B}/users/@me`, req => (req.bearer && s().tokens[req.bearer] ? { json: { id: '77', username: 'siartester', global_name: 'Siar Tester' } } : err(401, 0, '401: Unauthorized')));

  m.on('GET', H, `${B}/guilds/:id`, req => {
    if (!isBot(req)) return err(401, 0, '401: Unauthorized');
    return req.params.id === guild.id ? { json: guild } : err(404, 10004, 'Unknown Guild');
  });
  m.on('GET', H, `${B}/guilds/:id/channels`, req => {
    if (!isBot(req)) return err(401, 0, '401: Unauthorized');
    return req.params.id === guild.id ? { json: s().channels } : err(404, 10004, 'Unknown Guild');
  });
  m.on('GET', H, `${B}/channels/:id/webhooks`, req => {
    if (!isBot(req)) return err(401, 0, '401: Unauthorized');
    return { json: Object.values(s().webhooks).filter((w: any) => w.channel_id === req.params.id && !w.deleted) };
  });
  m.on('POST', H, `${B}/channels/:id/webhooks`, req => {
    if (!isBot(req)) return err(401, 0, '401: Unauthorized');
    if (!s().channels.some((c: any) => c.id === req.params.id)) return err(404, 10003, 'Unknown Channel');
    const w = { id: num(), token: id('whk_'), name: req.body.name, channel_id: req.params.id, guild_id: guild.id, type: 1 };
    s().webhooks[w.id] = w;
    return { json: w };
  });

  const hook = (req: MockRequest) => {
    const w = s().webhooks[req.params.wid];
    return w && !w.deleted && w.token === req.params.token ? w : null;
  };
  m.on('POST', H, `${B}/webhooks/:wid/:token`, req => {
    const w = hook(req); if (!w) return err(404, 10015, 'Unknown Webhook');
    const body = req.body.payload_json ? JSON.parse(req.body.payload_json) : req.body;
    const files = req.form ? [...req.form.entries()].filter(([, v]) => typeof v !== 'string').map(([, v]) => ({ filename: (v as File).name, size: (v as File).size, content_type: (v as File).type })) : [];
    if (!body.content && !files.length) return { status: 400, json: { code: 50006, message: 'Cannot send an empty message' } };
    if ((body.content ?? '').length > 2000) return { status: 400, json: { code: 50035, message: 'Invalid Form Body', errors: { content: { _errors: [{ code: 'BASE_TYPE_MAX_LENGTH', message: 'Must be 2000 or fewer in length.' }] } } } };
    const msg = {
      id: num(), channel_id: w.channel_id, webhook_id: w.id, content: body.content ?? '', timestamp: new Date().toISOString(), author: { id: w.id, bot: true, username: body.username ?? w.name, avatar_url: body.avatar_url ?? null },
      username: body.username ?? null, avatar_url: body.avatar_url ?? null, allowed_mentions: body.allowed_mentions ?? null, attachments: files.map((f, i) => ({ id: String(i), ...f })),
    };
    s().messages.push(msg);
    return { json: msg };
  });
  m.on('DELETE', H, `${B}/webhooks/:wid/:token/messages/:mid`, req => {
    const w = hook(req); if (!w) return err(404, 10015, 'Unknown Webhook');
    const msg = s().messages.find((x: any) => x.id === req.params.mid && x.webhook_id === w.id && !x.deleted);
    if (!msg) return err(404, 10008, 'Unknown Message');
    msg.deleted = true;
    return { status: 204 };
  });
  m.on('DELETE', H, `${B}/webhooks/:wid/:token`, req => { const w = hook(req); if (!w) return err(404, 10015, 'Unknown Webhook'); w.deleted = true; return { status: 204 }; });

  m.on('POST', H, `${B}/channels/:cid/messages`, req => {
    if (!isBot(req)) return err(401, 0, '401: Unauthorized');
    const body = req.body.payload_json ? JSON.parse(req.body.payload_json) : req.body;
    const msg = { id: num(), channel_id: req.params.cid, content: body.content ?? '', message_reference: body.message_reference ?? null, author: { id: 'bot', bot: true }, timestamp: new Date().toISOString() };
    s().messages.push(msg);
    return { json: msg };
  });
  m.on('DELETE', H, `${B}/channels/:cid/messages/:mid`, req => {
    if (!isBot(req)) return err(401, 0, '401: Unauthorized');
    const msg = s().messages.find((x: any) => x.id === req.params.mid && !x.deleted);
    if (!msg) return err(404, 10008, 'Unknown Message');
    msg.deleted = true;
    return { status: 204 };
  });
}
