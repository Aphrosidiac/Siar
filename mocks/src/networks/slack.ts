import { consent, id, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Slack — OAuth v2 install, the Web API (always HTTP 200 with { ok } in the body; errors are
 * { ok: false, error }) and the external file upload host. Bot tokens start with xoxb-.
 * Channels: C1 general, C2 random (public), C3 ops (private, bot is a member), C9 secret (private,
 * bot is NOT a member — posting there answers not_in_channel), C4 old (archived).
 */
export default function slack(m: MockRegistry) {
  m.seedToken('slack', () => true);
  const s = () => m.ns('slack', () => ({
    tokens: {} as Record<string, true>, messages: [] as any[], files: {} as Record<string, any>, seq: 0, infoCalls: {} as Record<string, number>,
    channels: [
      { id: 'C1', name: 'general', is_private: false, is_member: true, num_members: 12 }, { id: 'C2', name: 'random', is_private: false, is_member: false, num_members: 9 },
      { id: 'C3', name: 'ops', is_private: true, is_member: true, num_members: 3 }, { id: 'C9', name: 'secret', is_private: true, is_member: false, num_members: 2 },
      { id: 'C4', name: 'old', is_private: false, is_member: false, is_archived: true, num_members: 0 },
    ],
  }));
  const H = 'slack.com';
  const fail = (error: string, extra: Record<string, unknown> = {}): MockResponse => ({ json: { ok: false, error, ...extra } });
  const ok = (extra: Record<string, unknown> = {}): MockResponse => ({ json: { ok: true, ...extra } });
  const authed = (req: MockRequest) => !!req.bearer && !!s().tokens[req.bearer];
  /** Slack accepts JSON bodies, form bodies and query strings for the same method. */
  const arg = (req: MockRequest) => ({ ...req.query, ...req.body });
  const newTs = () => `${Math.floor(Date.now() / 1000)}.${String(++s().seq).padStart(6, '0')}`;
  const chan = (cid: string) => s().channels.find((c: any) => c.id === cid);
  /** Channel checks shared by everything that posts. */
  const postable = (cid: string): MockResponse | null => {
    const c = chan(cid);
    if (!c) return fail('channel_not_found');
    if (c.is_archived) return fail('is_archived');
    if (c.is_private && !c.is_member) return fail('not_in_channel');
    return null;
  };
  const method = (name: string, fn: (req: MockRequest, a: Record<string, any>) => MockResponse) =>
    m.on('ANY', H, `/api/${name}`, req => (authed(req) || name === 'oauth.v2.access' ? fn(req, arg(req)) : fail('invalid_auth')));

  m.on('GET', H, '/oauth/v2/authorize', req => consent(req));
  method('oauth.v2.access', (req, a) => {
    if (a.grant_type === 'refresh_token') return ok({ access_token: id('xoxb-'), refresh_token: id('xoxe-'), expires_in: 43200, scope: 'chat:write', team: { id: 'T1', name: 'Siar Test Workspace' }, bot_user_id: 'U0BOT' });
    if (!String(a.code ?? '').startsWith('mockcode_')) return fail('invalid_code');
    const access_token = `xoxb-${id()}`;
    s().tokens[access_token] = true;
    return ok({ access_token, token_type: 'bot', scope: 'chat:write,channels:read,files:write', bot_user_id: 'U0BOT', app_id: 'A1', team: { id: 'T1', name: 'Siar Test Workspace' }, authed_user: { id: 'U1' }, is_enterprise_install: false });
  });
  method('auth.test', () => ok({ url: 'https://siartest.slack.com/', team: 'Siar Test Workspace', team_id: 'T1', user_id: 'U0BOT', bot_id: 'B1' }));
  method('auth.revoke', (req) => { delete s().tokens[req.bearer!]; return ok({ revoked: true }); });
  method('conversations.list', (_req, a) => {
    const all = s().channels.filter((c: any) => (a.exclude_archived === 'true' || a.exclude_archived === true ? !c.is_archived : true) && (!c.is_private || c.is_member));
    const start = Number(a.cursor ?? 0); const size = Math.min(Number(a.limit ?? 100), 2);
    const page = all.slice(start, start + size);
    return ok({ channels: page, response_metadata: { next_cursor: start + size < all.length ? String(start + size) : '' } });
  });
  method('chat.postMessage', (_req, a) => {
    const bad = postable(a.channel); if (bad) return bad;
    if (!a.text) return fail('no_text');
    if (String(a.text).length > 40_000) return fail('msg_too_long');
    const msg = { channel: a.channel, ts: newTs(), text: a.text, username: a.username ?? null, icon_url: a.icon_url ?? null, thread_ts: a.thread_ts ?? null, reactions: [] as any[], user: 'U0BOT', bot_id: 'B1' };
    s().messages.push(msg);
    return ok({ channel: a.channel, ts: msg.ts, message: msg });
  });
  const find = (a: Record<string, any>) => s().messages.find((x: any) => x.channel === a.channel && x.ts === (a.ts ?? a.timestamp) && !x.deleted);
  method('chat.update', (_req, a) => {
    const msg = find(a); if (!msg) return fail('message_not_found');
    if (msg.files) return fail('cant_update_message');
    msg.text = a.text; msg.edited = true;
    return ok({ channel: a.channel, ts: msg.ts, text: msg.text });
  });
  method('chat.delete', (_req, a) => { const msg = find(a); if (!msg) return fail('message_not_found'); msg.deleted = true; return ok({ channel: a.channel, ts: msg.ts }); });
  method('reactions.add', (_req, a) => {
    const msg = find(a); if (!msg) return fail('message_not_found');
    if (msg.reactions.some((r: any) => r.name === a.name)) return fail('already_reacted');
    msg.reactions.push({ name: a.name, count: 1, users: ['U0BOT'] });
    return ok();
  });
  method('reactions.remove', (_req, a) => {
    const msg = find(a); if (!msg) return fail('message_not_found');
    if (!msg.reactions.some((r: any) => r.name === a.name)) return fail('no_reaction');
    msg.reactions = msg.reactions.filter((r: any) => r.name !== a.name);
    return ok();
  });
  method('conversations.replies', (_req, a) => {
    const parent = find(a); if (!parent) return fail('thread_not_found');
    const replies = s().messages.filter((x: any) => x.channel === a.channel && x.thread_ts === a.ts && !x.deleted);
    const fan = { type: 'message', user: 'U7', text: 'Nice one!', ts: `${Number(a.ts) + 5}`, thread_ts: a.ts, reactions: [{ name: '+1', count: 2 }] };
    return ok({ messages: [parent, ...replies, fan], has_more: false, response_metadata: { next_cursor: '' } });
  });
  method('conversations.history', (_req, a) => {
    const msg = find({ channel: a.channel, ts: a.latest }); if (!msg) return ok({ messages: [] });
    return ok({ messages: [{ ...msg, reply_count: s().messages.filter((x: any) => x.thread_ts === msg.ts && !x.deleted).length + 1, reactions: [...msg.reactions, { name: '+1', count: 3 }] }] });
  });
  method('users.info', (_req, a) => ok({ user: { id: a.user, name: 'fan', real_name: 'A Fan', profile: { display_name: 'fan.user' } } }));

  // ── external uploads ──
  method('files.getUploadURLExternal', (req, a) => {
    if (!a.filename || !a.length) return fail('invalid_arguments');
    const file_id = id('F');
    s().files[file_id] = { id: file_id, name: a.filename, length: Number(a.length), received: null, shares: {} };
    return ok({ upload_url: `https://files.slack.com/upload/v1/${file_id}`, file_id });
  });
  m.on('POST', 'files.slack.com', '/upload/v1/:fid', req => {
    const f = s().files[req.params.fid];
    if (!f) return { status: 404, text: 'not found' };
    f.received = req.raw.length; f.mime = req.headers['content-type'];
    return { status: 200, text: `OK - ${req.raw.length}` };
  });
  method('files.completeUploadExternal', (_req, a) => {
    const bad = postable(a.channel_id); if (bad) return bad;
    const files = a.files as { id: string; title: string }[];
    for (const f of files) { const rec = s().files[f.id]; if (!rec || rec.received !== rec.length) return fail('invalid_file'); }
    const msg = { channel: a.channel_id, ts: newTs(), text: a.initial_comment ?? '', thread_ts: a.thread_ts ?? null, files: files.map(f => f.id), reactions: [] as any[], user: 'U0BOT' };
    s().messages.push(msg);
    for (const f of files) s().files[f.id].shares = { [chan(a.channel_id)?.is_private ? 'private' : 'public']: { [a.channel_id]: [{ ts: msg.ts }] } };
    return ok({ files: files.map(f => ({ id: f.id, title: f.title })) });
  });
  method('files.info', (_req, a) => {
    const f = s().files[a.file]; if (!f) return fail('file_not_found');
    // Shares appear a moment after completing, like the real thing: the first look is empty.
    const n = (s().infoCalls[a.file] = (s().infoCalls[a.file] ?? 0) + 1);
    return ok({ file: { id: f.id, name: f.name, shares: n > 1 ? f.shares : {} } });
  });
  method('files.delete', (_req, a) => {
    if (!s().files[a.file]) return fail('file_not_found');
    for (const msg of s().messages) if (msg.files?.includes(a.file)) msg.deleted = true;
    delete s().files[a.file];
    return ok();
  });
}
