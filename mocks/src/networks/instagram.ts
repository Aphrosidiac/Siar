import { consent, id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Instagram — Instagram Login (www.instagram.com, api.instagram.com, graph.instagram.com) and the
 * Content Publishing / comments / insights / messaging edges, answering as the Graph API does
 * (`{ error: { message, type, code, error_subcode, fbtrace_id } }` on failure).
 *
 * Containers: images are FINISHED at once; a video container answers IN_PROGRESS on its first status
 * read, then FINISHED. A media URL containing "bad" fails: images at creation (9004), videos with
 * status_code ERROR. media_publish on an unfinished container answers 9007 / 2207027.
 * The Facebook Login host only carries GET /ig_audio here; the Facebook mock owns the rest of it.
 * State: state.instagram.{containers, media, comments, messages, subscribed, profileSettings}.
 */
export default function instagram(m: MockRegistry) {
  m.seedToken('instagram', () => USER_ID);
  const s = () => m.ns('instagram', () => ({
    tokens: {} as Record<string, string>, containers: {} as Record<string, any>, media: [] as any[], comments: [] as any[],
    messages: [] as any[], subscribed: [] as any[], profileSettings: [] as any[],
  }));
  const IG = 'graph.instagram.com';
  const USER_ID = '17841400000000001';
  const user = {
    id: '2500000001', user_id: USER_ID, username: 'siar.test', name: 'Siar Test', account_type: 'BUSINESS', profile_picture_url: 'https://cdn.instagram.example/avatar.jpg',
    biography: 'Testing Siar', followers_count: 1840, follows_count: 120, media_count: 0,
  };
  const trace = () => id('tr');
  const gerr = (status: number, code: number, message: string, sub?: number, type = 'OAuthException'): MockResponse =>
    ({ status, json: { error: { message, type, code, ...(sub ? { error_subcode: sub } : {}), fbtrace_id: trace() } } });
  const badToken = () => gerr(400, 190, 'Invalid OAuth access token - Cannot parse access token');
  const tokenOf = (req: MockRequest) => req.query.access_token ?? req.bearer ?? '';
  const authed = (req: MockRequest) => !!s().tokens[tokenOf(req)];
  const issue = () => { const t = id('igtok_'); s().tokens[t] = USER_ID; return t; };
  const paged = (all: any[], req: MockRequest) => {
    const limit = Number(req.query.limit ?? 25);
    const start = Number(req.query.after ?? 0);
    const data = all.slice(start, start + limit);
    const more = start + limit < all.length;
    return { data, paging: { cursors: { before: String(start), after: String(start + limit) }, ...(more ? { next: 'https://graph.instagram.com/next' } : {}) } };
  };

  // ── OAuth (Instagram Login)
  m.on('GET', 'www.instagram.com', '/oauth/authorize', req => consent(req));
  m.on('POST', 'api.instagram.com', '/oauth/access_token', req => {
    if (!String(req.body.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error_type: 'OAuthException', code: 400, error_message: 'Invalid authorization code' } };
    return { json: { data: [{ access_token: issue(), user_id: USER_ID, permissions: 'instagram_business_basic,instagram_business_content_publish,instagram_business_manage_comments,instagram_business_manage_insights' }] } };
  });
  m.on('GET', IG, '/access_token', req => {
    if (!authed(req)) return badToken();
    return { json: { access_token: issue(), token_type: 'bearer', expires_in: 5184000 } };
  });
  m.on('GET', IG, '/refresh_access_token', req => {
    if (!authed(req)) return badToken();
    return { json: { access_token: issue(), token_type: 'bearer', expires_in: 5184000 } };
  });

  // ── Graph reads
  m.on('GET', IG, '/:ver/:id', req => {
    if (!authed(req)) return badToken();
    const target = req.params.id;
    if (target === 'me' || target === USER_ID) {
      const fields = req.query.fields ?? '';
      const bd = fields.match(/business_discovery\.username\(([^)]+)\)/);
      if (bd) {
        if (bd[1].startsWith('nobody')) return gerr(400, 110, 'Invalid user id', undefined, 'IGApiException');
        return { json: { id: USER_ID, business_discovery: {
          id: '17841499999999999', username: bd[1], followers_count: 52000, media_count: 310, profile_picture_url: 'https://cdn.instagram.example/other.jpg', biography: 'A public business account', name: bd[1],
          media: { data: [{ id: '18000000000000001', media_type: 'IMAGE', like_count: 410, comments_count: 12, timestamp: '2026-10-01T09:00:00+0000', caption: 'Hello' }] },
        } } };
      }
      return { json: { ...user, media_count: s().media.length } };
    }
    const c = s().containers[target];
    if (c) {
      c.polls++;
      const status_code = c.published ? 'PUBLISHED' : c.failed ? 'ERROR' : c.video && c.polls <= 1 ? 'IN_PROGRESS' : 'FINISHED';
      return { json: { id: c.id, status_code, status: status_code === 'ERROR' ? 'Error: Media upload has failed with error code 2207026' : status_code === 'FINISHED' ? 'Finished: Media is ready to be published' : 'In progress: Media is still being processed' } };
    }
    const md = s().media.find((x: any) => x.id === target);
    if (md) return { json: md };
    const cm = s().comments.find((x: any) => x.id === target);
    if (cm) return { json: cm };
    return gerr(400, 100, 'Unsupported get request. Object does not exist, cannot be loaded due to missing permissions, or does not support this operation', 33);
  });

  m.on('GET', IG, '/:ver/:id/media', req => authed(req) ? { json: paged([...s().media].reverse(), req) } : badToken());

  const mediaInsights = (names: string[]) => {
    const base: Record<string, number> = { reach: 800, views: 1200, likes: 55, comments: 6, shares: 4, saved: 9, total_interactions: 74, replies: 2, accounts_engaged: 150 };
    return names.filter(n => n in base).map(n => ({ name: n, period: 'lifetime', values: [{ value: base[n] }], title: n, id: `${n}/lifetime` }));
  };
  m.on('GET', IG, '/:ver/:id/insights', req => {
    if (!authed(req)) return badToken();
    const names = String(req.query.metric ?? '').split(',');
    if (req.params.id !== USER_ID) return { json: { data: mediaInsights(names) } };
    if (names.includes('follower_demographics')) {
      return { json: { data: [{ name: 'follower_demographics', period: 'lifetime', total_value: { breakdowns: [{ dimension_keys: ['country'], results: [{ dimension_values: ['MY'], value: 900 }, { dimension_values: ['SG'], value: 200 }] }] } }] } };
    }
    return { json: { data: mediaInsights(names).map(d => ({ name: d.name, period: 'day', total_value: { value: d.values[0].value * 10 }, id: d.id })) } };
  });

  // ── Comments
  const seed = (mediaId: string) => {
    if (!s().comments.some((c: any) => c.mediaId === mediaId && c.username === 'fan_account')) {
      const root = { id: id('cmt_'), mediaId, text: 'Love this!', timestamp: new Date().toISOString(), username: 'fan_account', from: { id: '900', username: 'fan_account' }, like_count: 3, hidden: false, replies: { data: [] as any[] } };
      const reply = { id: id('cmt_'), mediaId, parent_id: root.id, text: 'Same here', timestamp: new Date().toISOString(), username: 'another_fan', from: { id: '901', username: 'another_fan' }, like_count: 0, hidden: false };
      root.replies.data.push(reply);
      s().comments.push(root, reply);
    }
  };
  m.on('GET', IG, '/:ver/:id/comments', req => {
    if (!authed(req)) return badToken();
    // IG Comment has no replies_count (or any field outside this set): Graph rejects the whole call.
    const COMMENT_FIELDS = new Set(['id', 'text', 'timestamp', 'username', 'like_count', 'hidden', 'from', 'media', 'parent_id', 'replies', 'user', 'legacy_instagram_comment_id']);
    const bad = String(req.query.fields ?? '').replace(/\{[^}]*\}/g, '').split(',').map(f => f.trim()).filter(f => f && !COMMENT_FIELDS.has(f));
    if (bad.length) return gerr(400, 100, `(#100) Tried accessing nonexisting field (${bad[0]}) on node type (IGComment)`);
    seed(req.params.id);
    return { json: paged(s().comments.filter((c: any) => c.mediaId === req.params.id && !c.parent_id && !c.deleted), req) };
  });
  m.on('POST', IG, '/:ver/:id/comments', req => {
    if (!authed(req)) return badToken();
    if (!req.body.message) return gerr(400, 100, 'Invalid parameter', 33);
    const c = { id: id('cmt_'), mediaId: req.params.id, text: req.body.message, timestamp: new Date().toISOString(), username: user.username, from: { id: USER_ID, username: user.username }, like_count: 0, hidden: false };
    s().comments.push(c);
    return { json: { id: c.id } };
  });
  m.on('POST', IG, '/:ver/:id/replies', req => {
    if (!authed(req)) return badToken();
    const parent = s().comments.find((c: any) => c.id === req.params.id);
    if (!parent) return gerr(400, 100, 'Unsupported post request. Object with ID does not exist', 33);
    const c = { id: id('cmt_'), mediaId: parent.mediaId, parent_id: parent.id, text: req.body.message, timestamp: new Date().toISOString(), username: user.username, from: { id: USER_ID, username: user.username }, like_count: 0, hidden: false };
    s().comments.push(c);
    return { json: { id: c.id } };
  });
  m.on('POST', IG, '/:ver/:id', req => {
    if (!authed(req)) return badToken();
    const c = s().comments.find((x: any) => x.id === req.params.id);
    if (!c) return gerr(400, 100, 'Unsupported post request. Object with ID does not exist', 33);
    c.hidden = String(req.body.hide) === 'true';
    return { json: { success: true } };
  });
  m.on('DELETE', IG, '/:ver/:id', req => {
    if (!authed(req)) return badToken();
    const c = s().comments.find((x: any) => x.id === req.params.id);
    if (!c) return gerr(400, 100, 'Unsupported delete request. Object with ID does not exist', 33);
    c.deleted = true;
    return { json: { success: true } };
  });

  // ── Content Publishing
  m.on('POST', IG, '/:ver/:id/media', req => {
    if (!authed(req)) return badToken();
    const b = req.body;
    const type: string = b.media_type ?? 'IMAGE';
    const url: string = b.video_url ?? b.image_url ?? '';
    if (type === 'CAROUSEL') {
      const kids = String(b.children ?? '').split(',').filter(Boolean);
      if (kids.length < 2 || kids.some(k => !s().containers[k])) return gerr(400, 100, 'Invalid parameter', 2207057);
    } else if (!url) {
      return gerr(400, 9004, 'Only photo or video can be accepted as media type.', 2207052);
    } else if (type === 'REELS' && !b.video_url) {
      return gerr(400, 100, 'Invalid parameter', 2207023);
    } else if (!b.video_url && url.includes('bad')) {
      return gerr(400, 9004, 'The media could not be fetched from this URI: ' + url, 2207052);
    }
    const cid = id('cont_');
    s().containers[cid] = { id: cid, ...b, media_type: type, video: !!b.video_url, failed: !!b.video_url && url.includes('bad'), polls: 0, published: false };
    return { json: { id: cid } };
  });
  m.on('POST', IG, '/:ver/:id/media_publish', req => {
    if (!authed(req)) return badToken();
    const c = s().containers[req.body.creation_id];
    if (!c) return gerr(400, 100, 'Invalid parameter', 2207006);
    if (c.failed || (c.video && c.polls < 2)) return gerr(400, 9007, 'Media ID is not available', 2207027);
    const mid = num();
    const product = c.media_type === 'REELS' ? 'REELS' : c.media_type === 'STORIES' ? 'STORY' : 'FEED';
    const md = {
      id: mid, caption: c.caption ?? null, media_type: c.media_type === 'CAROUSEL' ? 'CAROUSEL_ALBUM' : c.video ? 'VIDEO' : 'IMAGE', media_product_type: product,
      media_url: c.video_url ?? c.image_url ?? null, thumbnail_url: c.cover_url ?? null, permalink: `https://www.instagram.com/${product === 'REELS' ? 'reel' : 'p'}/${mid}/`,
      timestamp: new Date().toISOString(), like_count: 0, comments_count: 0, containerId: c.id,
    };
    c.published = true;
    s().media.push(md);
    return { json: { id: mid } };
  });

  // ── Messaging
  m.on('POST', IG, '/:ver/:id/messages', req => {
    if (!authed(req)) return badToken();
    const b = req.body;
    const mid = id('mid_');
    s().messages.push({ ...b, mid, from: req.params.id });
    return { json: { recipient_id: b.recipient?.id ?? '900', message_id: mid } };
  });
  m.on('POST', IG, '/:ver/:id/subscribed_apps', req => { if (!authed(req)) return badToken(); s().subscribed.push({ id: req.params.id, fields: req.query.subscribed_fields }); return { json: { success: true } }; });
  m.on('DELETE', IG, '/:ver/:id/subscribed_apps', req => { if (!authed(req)) return badToken(); s().subscribed.length = 0; return { json: { success: true } }; });
  m.on('POST', IG, '/:ver/:id/messenger_profile', req => { if (!authed(req)) return badToken(); s().profileSettings.push(req.body); return { json: { result: 'success' } }; });
  m.on('DELETE', IG, '/:ver/:id/messenger_profile', req => { if (!authed(req)) return badToken(); s().profileSettings.push({ deleted: req.body.fields }); return { json: { result: 'success' } }; });

  // ── Audio library (Facebook Login host only)
  m.on('GET', 'graph.facebook.com', '/:ver/ig_audio', req => {
    if (!req.query.access_token) return badToken();
    const q = (req.query.search_query ?? '').toLowerCase();
    const all = [
      { audio_id: '587784541076604', audio_type: 'music', title: 'Sunrise Drive', display_artist: 'The Mocks', duration_in_ms: 184000, download_url: 'https://cdn.instagram.example/a1.m4a', cover_artwork_thumbnail_url: 'https://cdn.instagram.example/a1.jpg' },
      { audio_id: '587784541076999', audio_type: 'original_sound', title: 'Original audio', ig_username: 'siar.test', duration_in_ms: 12000, download_url: 'https://cdn.instagram.example/a2.m4a' },
    ].filter(a => a.audio_type === (req.query.audio_type ?? 'music') && (!q || a.title.toLowerCase().includes(q)));
    return { json: { data: all } };
  });
}
