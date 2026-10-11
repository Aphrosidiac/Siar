import { consent, id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Threads — threads.net OAuth and graph.threads.net (v1.0).
 *
 * Containers: a TEXT/IMAGE container is FINISHED at once; a VIDEO container answers IN_PROGRESS on
 * its first status read. A media URL containing "bad" makes the container ERROR. threads_publish on an
 * unfinished container answers 24 / 4279009. Posts posted with reply_to_id become replies of that post.
 * State: state.threads.{containers, posts}.
 */
export default function threads(m: MockRegistry) {
  const s = () => m.ns('threads', () => ({ tokens: {} as Record<string, string>, containers: {} as Record<string, any>, posts: [] as any[] }));
  const G = 'graph.threads.net';
  const USER_ID = '26000000000000001';
  const me = { id: USER_ID, username: 'siar.test', name: 'Siar Test', threads_profile_picture_url: 'https://cdn.threads.example/avatar.jpg', threads_biography: 'Testing Siar' };
  const gerr = (status: number, code: number, message: string, sub?: number): MockResponse =>
    ({ status, json: { error: { message, type: 'THApiException', code, ...(sub ? { error_subcode: sub } : {}), fbtrace_id: id('tr') } } });
  const badToken = () => gerr(400, 190, 'Error validating access token: Cannot parse access token');
  const tokenOf = (req: MockRequest) => req.query.access_token ?? req.bearer ?? '';
  const authed = (req: MockRequest) => !!s().tokens[tokenOf(req)];
  const issue = () => { const t = id('thtok_'); s().tokens[t] = USER_ID; return t; };
  const paged = (all: any[], req: MockRequest) => {
    const limit = Number(req.query.limit ?? 25);
    const start = Number(req.query.after ?? 0);
    return { data: all.slice(start, start + limit), paging: { cursors: { before: String(start), after: String(start + limit) }, ...(start + limit < all.length ? { next: 'https://graph.threads.net/next' } : {}) } };
  };

  m.on('GET', 'threads.net', '/oauth/authorize', req => consent(req));
  m.on('POST', G, '/oauth/access_token', req => {
    if (!String(req.body.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error_type: 'OAuthException', code: 400, error_message: 'Invalid authorization code' } };
    return { json: { access_token: issue(), user_id: Number(USER_ID) } };
  });
  m.on('GET', G, '/access_token', req => {
    if (!authed(req)) return badToken();
    if (req.query.grant_type !== 'th_exchange_token') return gerr(400, 100, 'Invalid grant_type');
    return { json: { access_token: issue(), token_type: 'bearer', expires_in: 5184000 } };
  });
  m.on('GET', G, '/refresh_access_token', req => {
    if (!authed(req)) return badToken();
    return { json: { access_token: issue(), token_type: 'bearer', expires_in: 5184000 } };
  });

  m.on('GET', G, '/:ver/:id', req => {
    if (!authed(req)) return badToken();
    const t = req.params.id;
    if (t === 'me' || t === USER_ID) return { json: me };
    const c = s().containers[t];
    if (c) {
      c.polls++;
      const status = c.published ? 'PUBLISHED' : c.failed ? 'ERROR' : c.video && c.polls <= 1 ? 'IN_PROGRESS' : 'FINISHED';
      return { json: { id: c.id, status, ...(status === 'ERROR' ? { error_message: 'The media could not be fetched or is in an unsupported format.' } : {}) } };
    }
    const p = s().posts.find((x: any) => x.id === t && !x.deleted);
    if (p) return { json: p };
    return gerr(400, 24, 'The requested resource does not exist', 4279009);
  });

  m.on('POST', G, '/:ver/:id/threads', req => {
    if (!authed(req)) return badToken();
    const b = req.body;
    const type: string = b.media_type ?? 'TEXT';
    if (type === 'TEXT' && !b.text && !b.poll_attachment && !b.gif_attachment) return gerr(400, 100, 'The parameter text is required.');
    if (b.text && [...String(b.text)].length > 500) return gerr(400, 100, 'The text is too long.', 4279017);
    if (type === 'CAROUSEL') {
      const kids = String(b.children ?? '').split(',').filter(Boolean);
      if (kids.length < 2 || kids.some(k => !s().containers[k])) return gerr(400, 100, 'Invalid parameter children');
    }
    const url: string = b.video_url ?? b.image_url ?? '';
    const cid = id('tcont_');
    s().containers[cid] = { id: cid, ...b, media_type: type, video: !!b.video_url, failed: !!url && url.includes('bad'), polls: 0, published: false };
    return { json: { id: cid } };
  });
  m.on('POST', G, '/:ver/:id/threads_publish', req => {
    if (!authed(req)) return badToken();
    const c = s().containers[req.body.creation_id];
    if (!c) return gerr(400, 24, 'The requested resource does not exist', 4279009);
    if (c.failed || (c.video && c.polls < 2)) return gerr(400, 24, 'The media is not ready for publishing, please wait for a moment', 4279009);
    const pid = num();
    const post = {
      id: pid, text: c.text ?? null, media_type: c.media_type === 'TEXT' ? 'TEXT_POST' : c.media_type === 'CAROUSEL' ? 'CAROUSEL_ALBUM' : c.media_type, media_product_type: 'THREADS',
      media_url: c.video_url ?? c.image_url ?? null, permalink: `https://www.threads.net/@siar.test/post/${pid}`, timestamp: new Date().toISOString(), username: me.username,
      is_quote_post: false, reply_to: c.reply_to_id ?? null, reply_control: c.reply_control ?? null, topic_tag: c.topic_tag ?? null, containerId: c.id,
    };
    c.published = true;
    s().posts.push(post);
    return { json: { id: pid } };
  });

  m.on('GET', G, '/:ver/:id/threads', req => authed(req) ? { json: paged([...s().posts].filter((p: any) => !p.reply_to && !p.deleted).reverse(), req) } : badToken());
  const replies = (req: MockRequest) => {
    if (!authed(req)) return badToken();
    const mine = s().posts.filter((p: any) => p.reply_to === req.params.id && !p.deleted).map((p: any) => ({ ...p, replied_to: { id: p.reply_to }, has_replies: false }));
    const seeded = [{ id: `fan_${req.params.id}`, text: 'Great thread!', username: 'fan_account', timestamp: new Date().toISOString(), permalink: 'https://www.threads.net/@fan_account/post/1', hide_status: 'NOT_HUSHED', has_replies: false, replied_to: { id: req.params.id } }];
    return { json: paged([...seeded, ...mine], req) };
  };
  m.on('GET', G, '/:ver/:id/replies', replies);
  m.on('GET', G, '/:ver/:id/conversation', replies);
  m.on('POST', G, '/:ver/:id/manage_reply', req => {
    if (!authed(req)) return badToken();
    const p = s().posts.find((x: any) => x.id === req.params.id);
    if (p) p.hidden = String(req.body.hide) === 'true';
    return { json: { success: true } };
  });
  m.on('DELETE', G, '/:ver/:id', req => {
    if (!authed(req)) return badToken();
    const p = s().posts.find((x: any) => x.id === req.params.id && !x.deleted);
    if (!p) return gerr(400, 24, 'The requested resource does not exist', 4279009);
    p.deleted = true;
    return { json: { success: true, deleted_id: p.id } };
  });

  m.on('GET', G, '/:ver/:id/insights', req => {
    if (!authed(req)) return badToken();
    const base: Record<string, number> = { views: 900, likes: 40, replies: 5, reposts: 3, quotes: 1, shares: 2 };
    return { json: { data: String(req.query.metric ?? '').split(',').filter(n => n in base).map(n => ({ name: n, period: 'lifetime', values: [{ value: base[n] }], title: n, id: `${req.params.id}/insights/${n}/lifetime` })) } };
  });
  m.on('GET', G, '/:ver/:id/threads_insights', req => {
    if (!authed(req)) return badToken();
    const names = String(req.query.metric ?? '').split(',');
    if (names.includes('follower_demographics')) return { json: { data: [{ name: 'follower_demographics', total_value: { breakdowns: [{ dimension_keys: ['country'], results: [{ dimension_values: ['MY'], count: 300 }] }] } }] } };
    const base: Record<string, number> = { views: 12000, likes: 800, replies: 90, reposts: 40, quotes: 10, followers_count: 2300 };
    return { json: { data: names.filter(n => n in base).map(n => ({ name: n, period: 'day', total_value: { value: base[n] }, title: n, id: `${req.params.id}/threads_insights/${n}/day` })) } };
  });
}
