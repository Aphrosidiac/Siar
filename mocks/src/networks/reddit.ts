import { consent, id, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Reddit — OAuth2 (www.reddit.com), oauth.reddit.com and the S3 bucket media is uploaded to.
 *
 * Behaves the way Reddit does where it matters to an integration:
 *   - the token endpoint wants HTTP Basic and answers a bad code/refresh token with HTTP 200 {"error":"invalid_grant"};
 *   - every oauth.reddit.com call needs a descriptive User-Agent (the default "node" one answers 429);
 *   - /api/submit, /api/comment … fail with HTTP 200 {json:{errors:[[CODE, message, field]]}};
 *   - image/video submits answer a websocket_url only (no post id); the post shows up in
 *     /user/{name}/submitted from the second listing on (the first hides it, like Reddit's processing).
 * Subreddits: "siartest" (flairs, not required) · "flairreq" (flair required) · "private" (403 private) ·
 * any other name does not exist. A title containing "ratelimit" answers RATELIMIT.
 * State: state.reddit.{posts, comments, uploads, tokens}.
 */
export default function reddit(m: MockRegistry) {
  const s = () => m.ns('reddit', () => ({
    tokens: {} as Record<string, true>, refresh: {} as Record<string, true>, codes: {} as Record<string, true>,
    posts: [] as any[], comments: [] as any[], uploads: {} as Record<string, any>, deleted: [] as string[],
  }));
  const API = 'oauth.reddit.com';
  const ME = { id: 'a1b2c3', name: 'siar_test', icon_img: 'https://styles.redditmedia.example/avatar.png', snoovatar_img: '', link_karma: 120, comment_karma: 45, total_karma: 165, awardee_karma: 0, created_utc: 1700000000,
    subreddit: { display_name: 'u_siar_test', title: 'Siar Test', public_description: 'Testing Siar', subscribers: 14, icon_img: '' } };
  const SUBS: Record<string, { flairRequired: boolean; flairs: any[] }> = {
    siartest: { flairRequired: false, flairs: [
      { id: 'flair-discuss', text: 'Discussion', css_class: 'discuss', text_color: 'dark', background_color: '#dadada', mod_only: false, allowable_content: 'all', max_emojis: 10 },
      { id: 'flair-news', text: 'News', css_class: 'news', text_color: 'light', background_color: '#0079d3', mod_only: false, allowable_content: 'text', max_emojis: 10 },
    ] },
    flairreq: { flairRequired: true, flairs: [{ id: 'flair-req', text: 'Required', css_class: '', text_color: 'dark', background_color: '', mod_only: false, allowable_content: 'all', max_emojis: 10 }] },
  };
  const rerr = (...errors: [string, string, string?][]): MockResponse => ({ json: { json: { errors } } });
  const unauth = (): MockResponse => ({ status: 401, json: { message: 'Unauthorized', error: 401 } });
  const authorize = (req: MockRequest): MockResponse | null => {
    const ua = req.headers['user-agent'] ?? '';
    if (ua.length < 12 || ua === 'node') return { status: 429, headers: { 'x-ratelimit-reset': '60' }, json: { message: 'Too Many Requests', error: 429 } };
    return req.bearer && s().tokens[req.bearer] ? null : unauth();
  };
  const fullname = (kind: 't1' | 't3', rid: string) => `${kind}_${rid}`;
  const bare = (n: string) => String(n).replace(/^t\d_/, '');
  const issue = () => { const access = id('rdtok_'); s().tokens[access] = true; return access; };
  const postData = (p: any) => ({
    id: p.id, name: fullname('t3', p.id), title: p.title, subreddit: p.sr, selftext: p.text ?? '', url: p.url ?? `https://www.reddit.com/r/${p.sr}/comments/${p.id}/x/`,
    permalink: `/r/${p.sr}/comments/${p.id}/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}/`, created_utc: p.created, author: ME.name, over_18: p.nsfw, link_flair_text: p.flairText ?? null,
    score: 42, ups: 42, upvote_ratio: 0.9, num_comments: s().comments.filter(c => c.postId === p.id && !c.deleted).length, num_crossposts: 3, view_count: null,
    is_video: p.kind === 'video', post_hint: p.kind === 'image' ? 'image' : undefined, thumbnail: p.kind === 'image' ? 'https://b.thumbs.redditmedia.example/t.jpg' : 'self',
  });
  const commentData = (c: any) => ({
    id: c.id, name: fullname('t1', c.id), body: c.text, author: c.author, author_fullname: c.author === ME.name ? `t2_${ME.id}` : `t2_${c.author}`, parent_id: c.parentId, link_id: fullname('t3', c.postId),
    permalink: `/r/${c.sr}/comments/${c.postId}/x/${c.id}/`, created_utc: c.created, score: c.score, edited: c.edited ?? false, replies: '' as any,
  });
  const seedComments = (p: any) => {
    if (s().comments.some(c => c.postId === p.id && c.author === 'fan_user')) return;
    const top = { id: id('c'), postId: p.id, sr: p.sr, parentId: fullname('t3', p.id), author: 'fan_user', text: 'Nice one!', created: Math.floor(Date.now() / 1000), score: 5 };
    s().comments.push(top, { id: id('c'), postId: p.id, sr: p.sr, parentId: fullname('t1', top.id), author: 'other_user', text: 'Agreed.', created: Math.floor(Date.now() / 1000), score: 1 });
  };
  const tree = (postId: string, parent: string): any[] => s().comments.filter(c => c.postId === postId && c.parentId === parent && !c.deleted).map(c => {
    const d = commentData(c);
    const kids = tree(postId, fullname('t1', c.id));
    d.replies = kids.length ? { kind: 'Listing', data: { children: kids } } : '';
    return { kind: 't1', data: d };
  });

  // ── OAuth
  m.on('GET', 'www.reddit.com', '/api/v1/authorize', req => {
    if (req.query.duration !== 'permanent') return { status: 400, json: { error: 'invalid_request', message: 'duration must be permanent to get a refresh token' } };
    if (!req.query.client_id || !req.query.scope) return { status: 400, json: { error: 'invalid_request' } };
    const out = consent(req);
    if (out.redirect) { const code = new URL(out.redirect).searchParams.get('code')!; s().codes[code] = true; }
    return out;
  });
  m.on('POST', 'www.reddit.com', '/api/v1/access_token', req => {
    if (!/^Basic /i.test(req.headers.authorization ?? '')) return unauth();
    const b = req.body;
    if (b.grant_type === 'authorization_code') {
      if (!s().codes[b.code]) return { json: { error: 'invalid_grant' } };
      delete s().codes[b.code];
      const refresh = id('rdref_'); s().refresh[refresh] = true;
      return { json: { access_token: issue(), token_type: 'bearer', expires_in: 3600, refresh_token: refresh, scope: 'identity submit edit read flair history mysubreddits' } };
    }
    if (b.grant_type === 'refresh_token') {
      if (!s().refresh[b.refresh_token]) return { json: { error: 'invalid_grant' } };
      return { json: { access_token: issue(), token_type: 'bearer', expires_in: 3600, scope: 'identity submit edit read flair history mysubreddits' } };
    }
    return { status: 400, json: { error: 'unsupported_grant_type' } };
  });
  m.on('POST', 'www.reddit.com', '/api/v1/revoke_token', req => { delete s().tokens[req.body.token]; delete s().refresh[req.body.token]; return { status: 204 }; });

  // ── Identity
  m.on('GET', API, '/api/v1/me', req => authorize(req) ?? { json: ME });

  // ── Submit
  m.on('POST', API, '/api/submit', req => {
    const bad = authorize(req); if (bad) return bad;
    const b = req.body;
    const sub = SUBS[String(b.sr).toLowerCase()];
    if (String(b.sr).toLowerCase() === 'private') return { status: 403, json: { message: 'Forbidden', reason: 'private', error: 403 } };
    if (!sub) return rerr(['SUBREDDIT_NOEXIST', "that subreddit doesn't exist", 'sr']);
    if (!b.title) return rerr(['NO_TEXT', 'we need something here', 'title']);
    if (String(b.title).length > 300) return rerr(['TOO_LONG', 'this is too long (max: 300)', 'title']);
    if (String(b.title).includes('ratelimit')) return { json: { json: { ratelimit: 540, errors: [['RATELIMIT', 'you are doing that too much. try again in 9 minutes.', 'ratelimit']] } } };
    if (sub.flairRequired && !b.flair_id) return rerr(['SUBMIT_VALIDATION_FLAIR_REQUIRED', 'Your post must contain post flair.', 'flair']);
    if (b.flair_id && !sub.flairs.some(f => f.id === b.flair_id)) return rerr(['BAD_FLAIR_TEMPLATE_ID', 'invalid flair template id', 'flair_id']);
    const kind: string = b.kind;
    if (!['self', 'link', 'image', 'video'].includes(kind)) return rerr(['INVALID_OPTION', 'invalid option', 'kind']);
    if (kind !== 'self' && !b.url) return rerr(['NO_URL', 'a url is required', 'url']);
    if ((kind === 'image' || kind === 'video') && !s().uploads[b.url]) return rerr(['BAD_URL', "that url isn't valid", 'url']);
    const pid = id('').slice(0, 7);
    const post = { id: pid, sr: String(b.sr), title: b.title, text: kind === 'self' ? b.text ?? '' : undefined, url: kind === 'self' ? undefined : b.url, kind, nsfw: String(b.nsfw) === 'true', flairId: b.flair_id ?? null,
      flairText: sub.flairs.find(f => f.id === b.flair_id)?.text, created: Math.floor(Date.now() / 1000), pending: kind === 'image' || kind === 'video', resubmit: b.resubmit, sendreplies: b.sendreplies };
    s().posts.push(post);
    if (post.pending) return { json: { json: { errors: [], data: { user_submitted_page: `https://www.reddit.com/user/${ME.name}/submitted`, websocket_url: `wss://ws-mock.reddit.example/${id('ws')}` } } } };
    return { json: { json: { errors: [], data: { id: pid, name: fullname('t3', pid), url: `https://www.reddit.com/r/${post.sr}/comments/${pid}/x/`, drafts_count: 0 } } } };
  });

  // ── Media upload lease + the S3 bucket
  m.on('POST', API, '/api/media/asset.json', req => {
    const bad = authorize(req); if (bad) return bad;
    if (!req.body.filepath || !req.body.mimetype) return { status: 400, json: { message: 'Bad Request', error: 400 } };
    const key = `rte_images/${id('k')}`;
    const assetId = id('asset');
    s().uploads[`https://reddit-uploaded-media.s3-accelerate.amazonaws.com/${key}`] = { assetId, mimetype: req.body.mimetype, received: false };
    return { json: {
      args: { action: '//reddit-uploaded-media.s3-accelerate.amazonaws.com', fields: [{ name: 'acl', value: 'private' }, { name: 'key', value: key }, { name: 'X-Amz-Signature', value: id('sig') }, { name: 'Content-Type', value: req.body.mimetype }] },
      asset: { asset_id: assetId, processing_state: 'incomplete', payload: { filepath: key }, websocket_url: `wss://ws-mock.reddit.example/${assetId}` },
    } };
  });
  m.on('POST', 'reddit-uploaded-media.s3-accelerate.amazonaws.com', '/', req => {
    const key = String(req.form?.get('key') ?? '');
    const url = `https://reddit-uploaded-media.s3-accelerate.amazonaws.com/${key}`;
    const lease = s().uploads[url];
    const file = req.form?.get('file');
    if (!lease || !file || typeof file === 'string') return { status: 403, text: '<Error><Code>AccessDenied</Code></Error>' };
    lease.received = true; lease.size = file.size;
    return { status: 201, text: `<?xml version="1.0" encoding="UTF-8"?><PostResponse><Location>${url}</Location><Bucket>reddit-uploaded-media</Bucket><Key>${key}</Key></PostResponse>` };
  });

  // ── Subreddit metadata
  m.on('GET', API, '/r/:sr/api/link_flair_v2', req => {
    const bad = authorize(req); if (bad) return bad;
    const sub = SUBS[req.params.sr.toLowerCase()];
    if (req.params.sr.toLowerCase() === 'private') return { status: 403, json: { message: 'Forbidden', reason: 'private', error: 403 } };
    return sub ? { json: sub.flairs } : { status: 404, json: { message: 'Not Found', error: 404 } };
  });
  m.on('GET', API, '/r/:sr/api/post_requirements', req => {
    const bad = authorize(req); if (bad) return bad;
    const sub = SUBS[req.params.sr.toLowerCase()];
    if (!sub) return { status: 404, json: { message: 'Not Found', error: 404 } };
    return { json: { title_text_max_length: 300, title_required_strings: [], is_flair_required: sub.flairRequired, body_restriction_policy: 'none', link_restriction_policy: 'none', gallery_min_items: 2, gallery_max_items: 20 } };
  });

  // ── Comments
  m.on('POST', API, '/api/comment', req => {
    const bad = authorize(req); if (bad) return bad;
    const thing = String(req.body.thing_id ?? '');
    if (!req.body.text) return rerr(['NO_TEXT', 'we need something here', 'text']);
    const bid = bare(thing);
    let post: any; let parent = thing;
    if (thing.startsWith('t3_')) post = s().posts.find(p => p.id === bid);
    else { const pc = s().comments.find(c => c.id === bid && !c.deleted); post = pc && s().posts.find(p => p.id === pc.postId); }
    if (!post) return rerr([thing.startsWith('t1_') ? 'DELETED_COMMENT' : 'DELETED_LINK', 'the thing you are replying to has been deleted', 'parent']);
    if (post.locked) return rerr(['THREAD_LOCKED', 'that thread is locked', 'parent']);
    const c = { id: id('c'), postId: post.id, sr: post.sr, parentId: parent, author: ME.name, text: req.body.text, created: Math.floor(Date.now() / 1000), score: 1 };
    s().comments.push(c);
    return { json: { json: { errors: [], data: { things: [{ kind: 't1', data: commentData(c) }] } } } };
  });
  m.on('POST', API, '/api/editusertext', req => {
    const bad = authorize(req); if (bad) return bad;
    const thing = String(req.body.thing_id ?? ''); const bid = bare(thing);
    if (thing.startsWith('t1_')) {
      const c = s().comments.find(x => x.id === bid && !x.deleted);
      if (!c) return rerr(['DELETED_COMMENT', 'that comment has been deleted', 'thing_id']);
      if (c.author !== ME.name) return rerr(['NOT_AUTHOR', "you can't do that", 'thing_id']);
      c.text = req.body.text; c.edited = Math.floor(Date.now() / 1000);
      return { json: { json: { errors: [], data: { things: [{ kind: 't1', data: commentData(c) }] } } } };
    }
    const p = s().posts.find(x => x.id === bid);
    if (!p) return rerr(['DELETED_LINK', 'that link has been deleted', 'thing_id']);
    if (p.kind !== 'self') return rerr(['NOT_AUTHOR', "you can't do that", 'thing_id']);
    p.text = req.body.text;
    return { json: { json: { errors: [], data: { things: [{ kind: 't3', data: postData(p) }] } } } };
  });
  m.on('POST', API, '/api/del', req => {
    const bad = authorize(req); if (bad) return bad;
    const thing = String(req.body.id ?? ''); const bid = bare(thing);
    const target = thing.startsWith('t1_') ? s().comments.find(c => c.id === bid) : s().posts.find(p => p.id === bid);
    if (!target) return { status: 404, json: { message: 'Not Found', error: 404 } };
    target.deleted = true; s().deleted.push(thing);
    return { json: {} };
  });

  // ── Reads
  m.on('GET', API, '/comments/:id', req => {
    const bad = authorize(req); if (bad) return bad;
    const p = s().posts.find(x => x.id === req.params.id && !x.deleted);
    if (!p) return { status: 404, json: { message: 'Not Found', error: 404 } };
    seedComments(p);
    return { json: [{ kind: 'Listing', data: { children: [{ kind: 't3', data: postData(p) }] } }, { kind: 'Listing', data: { children: tree(p.id, fullname('t3', p.id)) } }] };
  });
  m.on('GET', API, '/api/info', req => {
    const bad = authorize(req); if (bad) return bad;
    const children = String(req.query.id ?? '').split(',').map(bare).map(x => s().posts.find(p => p.id === x && !p.deleted)).filter(Boolean).map(p => ({ kind: 't3', data: postData(p) }));
    return { json: { kind: 'Listing', data: { children, after: null, before: null } } };
  });
  m.on('GET', API, '/user/:name/submitted', req => {
    const bad = authorize(req); if (bad) return bad;
    if (req.params.name !== ME.name) return { status: 404, json: { message: 'Not Found', error: 404 } };
    // A media post is still processing the first time it would be listed.
    const mine = s().posts.filter(p => !p.deleted).filter(p => { if (p.pending && !p.seen) { p.seen = true; return false; } return true; }).reverse();
    const limit = Number(req.query.limit ?? 25);
    const start = req.query.after ? mine.findIndex(p => fullname('t3', p.id) === req.query.after) + 1 : 0;
    const page = mine.slice(start, start + limit);
    return { json: { kind: 'Listing', data: { children: page.map(p => ({ kind: 't3', data: postData(p) })), after: start + limit < mine.length ? fullname('t3', page[page.length - 1].id) : null, before: null } } };
  });
}
