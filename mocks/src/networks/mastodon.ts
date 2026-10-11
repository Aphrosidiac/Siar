import { consent, id, num, unauthorized, type MockRegistry } from '../registry.js';

/** Mastodon — any host matched by the catch-all: tests use https://mastodon.example */
export default function mastodon(m: MockRegistry) {
  m.seedToken('mastodon', () => '1090');
  const s = () => m.ns('mastodon', () => ({ apps: [] as any[], tokens: {} as Record<string, string>, statuses: [] as any[], media: {} as Record<string, any> }));
  const H = '*';
  const me = { id: '1090', username: 'siartest', acct: 'siartest', display_name: 'Siar Test', avatar: 'https://files.example/avatar.png', note: '<p>Testing Siar</p>', followers_count: 120, following_count: 30, statuses_count: 0, url: 'https://mastodon.example/@siartest' };
  const authed = (bearer: string | null) => bearer && s().tokens[bearer];

  m.on('POST', H, '/api/v1/apps', req => {
    const app = { client_id: id('cid_'), client_secret: id('sec_'), name: req.body.client_name, redirect_uri: req.body.redirect_uris };
    s().apps.push(app);
    return { json: app };
  });
  m.on('GET', H, '/oauth/authorize', req => consent(req));
  m.on('POST', H, '/oauth/token', req => {
    if (!String(req.body.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error: 'invalid_grant', error_description: 'The provided authorization grant is invalid' } };
    const token = id('mtok_');
    s().tokens[token] = me.id;
    return { json: { access_token: token, token_type: 'Bearer', scope: 'read write', created_at: Date.now() / 1000 } };
  });
  m.on('POST', H, '/oauth/revoke', req => { delete s().tokens[req.body.token]; return { json: {} }; });
  m.on('GET', H, '/api/v1/accounts/verify_credentials', req => authed(req.bearer) ? { json: { ...me, statuses_count: s().statuses.length } } : unauthorized());
  m.on('POST', H, '/api/v2/media', req => {
    if (!authed(req.bearer)) return unauthorized();
    const file = req.form?.get('file') as File | null;
    if (!file) return { status: 422, json: { error: 'Validation failed: File content type is invalid' } };
    const mid = num();
    const isVideo = file.type.startsWith('video/');
    s().media[mid] = { id: mid, type: isVideo ? 'video' : 'image', size: file.size, description: req.body.description ?? null, url: isVideo ? null : `https://files.example/${mid}`, preview_url: `https://files.example/${mid}_p` };
    if (isVideo) setTimeout(() => { s().media[mid].url = `https://files.example/${mid}.mp4`; }, 30);
    return { status: isVideo ? 202 : 200, json: s().media[mid] };
  });
  m.on('GET', H, '/api/v1/media/:id', req => s().media[req.params.id] ? { json: s().media[req.params.id] } : { status: 404, json: { error: 'Record not found' } });
  m.on('POST', H, '/api/v1/statuses', req => {
    if (!authed(req.bearer)) return unauthorized();
    const key = req.headers['idempotency-key'];
    const dup = key && s().statuses.find((x: any) => x.idempotencyKey === key);
    if (dup) return { json: dup };
    const mediaIds: string[] = req.body.media_ids ?? [];
    if (!req.body.status && !mediaIds.length) return { status: 422, json: { error: "Validation failed: Text can't be blank" } };
    const sid = num();
    const st = {
      id: sid, idempotencyKey: key, created_at: new Date().toISOString(), in_reply_to_id: req.body.in_reply_to_id ?? null, visibility: req.body.visibility ?? 'public',
      spoiler_text: req.body.spoiler_text ?? '', content: `<p>${req.body.status ?? ''}</p>`, url: `https://mastodon.example/@siartest/${sid}`, uri: `https://mastodon.example/users/siartest/statuses/${sid}`,
      media_attachments: mediaIds.map(x => s().media[x]).filter(Boolean), favourites_count: 0, reblogs_count: 0, replies_count: 0, account: me,
    };
    s().statuses.push(st);
    if (st.in_reply_to_id) { const parent = s().statuses.find((x: any) => x.id === st.in_reply_to_id); if (parent) parent.replies_count++; }
    return { json: st };
  });
  const find = (sid: string) => s().statuses.find((x: any) => x.id === sid && !x.deleted);
  m.on('GET', H, '/api/v1/statuses/:id', req => find(req.params.id) ? { json: { ...find(req.params.id), favourites_count: 7, reblogs_count: 2 } } : { status: 404, json: { error: 'Record not found' } });
  m.on('PUT', H, '/api/v1/statuses/:id', req => {
    const st = find(req.params.id); if (!st) return { status: 404, json: { error: 'Record not found' } };
    st.content = `<p>${req.body.status}</p>`; st.spoiler_text = req.body.spoiler_text ?? st.spoiler_text; st.edited_at = new Date().toISOString();
    return { json: st };
  });
  m.on('DELETE', H, '/api/v1/statuses/:id', req => { const st = find(req.params.id); if (!st) return { status: 404, json: { error: 'Record not found' } }; st.deleted = true; return { json: st }; });
  m.on('GET', H, '/api/v1/statuses/:id/context', req => ({ json: { ancestors: [], descendants: [
    ...s().statuses.filter((x: any) => x.in_reply_to_id === req.params.id && !x.deleted),
    { id: num(), in_reply_to_id: req.params.id, created_at: new Date().toISOString(), content: '<p>Great post!</p>', favourites_count: 1, replies_count: 0, url: 'https://mastodon.example/@fan/1', account: { id: '77', acct: 'fan@other.example', display_name: 'A Fan', avatar: 'https://files.example/fan.png', url: 'https://other.example/@fan' } },
  ] } }));
  m.on('POST', H, '/api/v1/statuses/:id/favourite', req => ({ json: { id: req.params.id, favourited: true } }));
  m.on('POST', H, '/api/v1/statuses/:id/unfavourite', req => ({ json: { id: req.params.id, favourited: false } }));
  m.on('GET', H, '/api/v1/accounts/:id/statuses', req => {
    const max = req.query.max_id;
    const list = [...s().statuses].filter((x: any) => !x.deleted && !x.in_reply_to_id).reverse().filter((x: any) => !max || x.id < max).slice(0, Number(req.query.limit ?? 20));
    return { json: list };
  });
}
