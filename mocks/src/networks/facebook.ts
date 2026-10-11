import { consent, id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Facebook Pages — Facebook Login (www.facebook.com dialog) and graph.facebook.com, answering as the
 * Graph API does (`{ error: { message, type, code, error_subcode, fbtrace_id } }` on failure).
 *
 * Tokens: `mockcode_*` → short-lived user token → fb_exchange_token → long-lived user token. /me/accounts
 * lists two Pages with their Page tokens; every Page write needs that Page's token (a user token answers
 * (#200)). Posting the same message twice to one Page answers (#506). Videos/Reels: a Reel's status is
 * "processing" on its first read, then "complete"; a video_url containing "bad" ends in error.
 * Ratings (recommendations) carry an open_graph_story whose comments are the owner replies.
 * Rupload (rupload.facebook.com) accepts the file_url header. A GET on an object answers every field
 * the adapter asks for at once.
 * State: state.facebook.{posts, videos, comments, reels, stories, messages, subscribed, profileSettings}.
 */
export default function facebook(m: MockRegistry) {
  const s = () => m.ns('facebook', () => ({
    tokens: { fbpage_1: { kind: 'page', pageId: '1090000000000001' }, fbpage_2: { kind: 'page', pageId: '1090000000000002' } } as Record<string, { kind: 'user' | 'page'; pageId?: string }>,
    posts: [] as any[], photos: [] as any[], videos: [] as any[], comments: [] as any[], likes: [] as string[], reels: {} as Record<string, any>, stories: [] as any[],
    messages: [] as any[], subscribed: [] as any[], profileSettings: [] as any[], ratings: null as any[] | null,
  }));
  const G = 'graph.facebook.com';
  const USER = { id: '1000000000000001', name: 'Siar Tester', email: 'tester@siar.test', picture: { data: { url: 'https://cdn.facebook.example/user.jpg' } } };
  const PAGES = [
    { id: '1090000000000001', name: 'Siar Test Page', username: 'siartestpage', link: 'https://www.facebook.com/siartestpage', category: 'Software company', about: 'Testing Siar', tasks: ['CREATE_CONTENT', 'MODERATE', 'MANAGE'], fan_count: 420, followers_count: 450, picture: { data: { url: 'https://cdn.facebook.example/page1.jpg' } }, instagram_business_account: { id: '17841400000000001', username: 'siar.test' }, access_token: 'fbpage_1' },
    { id: '1090000000000002', name: 'Siar Second Page', username: 'siarsecond', link: 'https://www.facebook.com/siarsecond', category: 'Brand', about: '', tasks: ['CREATE_CONTENT'], fan_count: 12, followers_count: 15, picture: { data: { url: 'https://cdn.facebook.example/page2.jpg' } }, access_token: 'fbpage_2' },
  ];
  const trace = () => id('tr');
  const gerr = (status: number, code: number, message: string, sub?: number, type = 'OAuthException'): MockResponse =>
    ({ status, json: { error: { message, type, code, ...(sub ? { error_subcode: sub } : {}), fbtrace_id: trace() } } });
  const badToken = () => gerr(400, 190, 'Error validating access token: Session has expired or the token is invalid', 463);
  const noPerm = () => gerr(403, 200, '(#200) Requires either publish_to_groups permission and app being installed in the group, or manage_pages and publish_pages as an admin with sufficient administrative permission');
  const notFound = () => gerr(400, 100, 'Unsupported get request. Object with ID does not exist, cannot be loaded due to missing permissions, or does not support this operation', 33);
  const tokenOf = (req: MockRequest) => req.query.access_token ?? req.bearer ?? '';
  const rec = (req: MockRequest) => s().tokens[tokenOf(req)] ?? null;
  const issueUser = () => { const t = id('fbuser_'); s().tokens[t] = { kind: 'user' }; return t; };
  const pageById = (pid: string) => PAGES.find(p => p.id === pid);
  const paged = (all: any[], req: MockRequest) => {
    const limit = Number(req.query.limit ?? 25);
    const start = Number(req.query.after ?? 0);
    return { data: all.slice(start, start + limit), paging: { cursors: { before: String(start), after: String(start + limit) }, ...(start + limit < all.length ? { next: 'https://graph.facebook.com/next' } : {}) } };
  };
  /** A Page write: valid Page token for this Page, else the Graph error. */
  const pageWrite = (req: MockRequest, pageId: string): MockResponse | null => {
    const r = rec(req);
    if (!r) return badToken();
    if (r.kind !== 'page' || r.pageId !== pageId || !pageById(pageId)) return noPerm();
    return null;
  };
  const summary = (n: number) => ({ summary: { total_count: n } });
  const permalink = (pid: string, local: string) => `https://www.facebook.com/${pid}/posts/${local}`;

  // ── Login
  m.on('GET', 'www.facebook.com', '/:ver/dialog/oauth', req => consent(req));
  m.on('GET', G, '/:ver/oauth/access_token', req => {
    if (req.query.grant_type === 'fb_exchange_token') {
      if (!rec({ ...req, query: { access_token: req.query.fb_exchange_token } } as MockRequest)) return badToken();
      return { json: { access_token: issueUser(), token_type: 'bearer', expires_in: 5184000 } };
    }
    if (!String(req.query.code ?? '').startsWith('mockcode_')) return gerr(400, 100, 'Invalid verification code format.', undefined, 'OAuthException');
    return { json: { access_token: issueUser(), token_type: 'bearer', expires_in: 7200 } };
  });
  m.on('GET', G, '/:ver/debug_token', req => {
    const r = s().tokens[req.query.input_token];
    return { json: { data: r ? { app_id: 'mock-clientId', type: r.kind === 'page' ? 'PAGE' : 'USER', application: 'Siar', is_valid: true, issued_at: 1790000000, data_access_expires_at: 1797000000, scopes: ['pages_manage_posts', 'pages_show_list'], granular_scopes: [] } : { is_valid: false, error: { code: 190, message: 'Invalid OAuth access token.', subcode: 463 } } } };
  });
  m.on('GET', G, '/:ver/me/permissions', req => rec(req) ? { json: { data: ['public_profile', 'pages_show_list', 'pages_read_engagement', 'pages_manage_posts', 'pages_manage_engagement', 'read_insights'].map(permission => ({ permission, status: 'granted' })) } } : badToken());
  m.on('DELETE', G, '/:ver/me/permissions', req => rec(req) ? { json: { success: true } } : badToken());
  m.on('GET', G, '/:ver/me/accounts', req => rec(req)?.kind === 'user' ? { json: paged(PAGES, req) } : badToken());
  m.on('GET', G, '/:ver/pages/search', req => {
    if (!rec(req)) return badToken();
    return { json: { data: PAGES.filter(p => p.name.toLowerCase().includes(String(req.query.q ?? '').toLowerCase())).map(p => ({ id: p.id, name: p.name, link: p.link, location: { city: 'Kuala Lumpur', country: 'Malaysia' } })) } };
  });

  // ── Objects
  const videoStatus = (v: any) => {
    v.polls++;
    if (v.failed) return { video_status: 'error', processing_phase: { status: 'error', error: { message: 'The video could not be processed (unsupported format).' } } };
    if (v.polls <= 1) return { video_status: 'processing', uploading_phase: { status: 'complete' }, processing_phase: { status: 'in_progress' }, publishing_phase: { status: 'not_started' } };
    return { video_status: 'ready', uploading_phase: { status: 'complete' }, processing_phase: { status: 'complete' }, publishing_phase: { status: 'complete', publish_status: 'published' } };
  };
  m.on('GET', G, '/:ver/:id', req => {
    const r = rec(req);
    if (!r) return badToken();
    const oid = req.params.id;
    if (oid === 'me') return { json: USER };
    const page = pageById(oid);
    if (page) {
      const { access_token, ...rest } = page;
      return { json: { ...rest, access_token } };
    }
    const reel = s().reels[oid];
    if (reel) return { json: { id: oid, permalink_url: `/reel/${oid}`, post_id: `${reel.pageId}_${oid}`, status: videoStatus(reel) } };
    const v = s().videos.find((x: any) => x.id === oid);
    if (v) return { json: { id: v.id, description: v.description, permalink_url: `/${v.pageId}/videos/${v.id}`, likes: summary(v.likes), comments: summary(s().comments.filter((c: any) => c.parentId === v.id && !c.deleted).length) } };
    const p = s().posts.find((x: any) => x.id === oid);
    if (p) return { json: { id: p.id, message: p.message, created_time: p.created_time, permalink_url: p.permalink_url, reactions: summary(p.reactions), comments: summary(s().comments.filter((c: any) => c.parentId === p.id && !c.deleted).length), shares: { count: p.shares } } };
    const c = s().comments.find((x: any) => x.id === oid);
    if (c) return { json: c };
    return notFound();
  });

  // ── Publishing
  m.on('POST', G, '/:ver/:id/feed', req => {
    const bad = pageWrite(req, req.params.id);
    if (bad) return bad;
    const b = req.body;
    if (!b.message && !b.link && !b.attached_media) return gerr(400, 100, '(#100) The parameter message is required', 1349);
    if (b.message && s().posts.some(p => p.pageId === req.params.id && p.message === b.message)) return gerr(400, 506, '(#506) Duplicate status message', 1455006);
    const local = num();
    const post = { id: `${req.params.id}_${local}`, pageId: req.params.id, message: b.message ?? null, link: b.link ?? null, attached: b.attached_media ?? [], preset: b.text_format_preset_id ?? null, published: b.published !== false, scheduled: b.scheduled_publish_time ?? null, created_time: new Date().toISOString(), permalink_url: permalink(req.params.id, local), reactions: 7, shares: 2 };
    s().posts.push(post);
    return { json: { id: post.id } };
  });
  m.on('POST', G, '/:ver/:id/photos', req => {
    const bad = pageWrite(req, req.params.id);
    if (bad) return bad;
    const b = req.body;
    const url: string = b.url ?? '';
    if (!url && !req.form) return gerr(400, 100, '(#100) Missing or invalid image file', 324);
    if (url.includes('bad')) return gerr(400, 1366046, 'The URL could not be fetched.', 1366046);
    const photoId = num();
    const unpublished = String(b.published) === 'false';
    const ph = { id: photoId, pageId: req.params.id, url, caption: b.caption ?? null, alt: b.alt_text_custom ?? null, published: !unpublished, temporary: b.temporary ?? null };
    s().photos.push(ph);
    if (unpublished) return { json: { id: photoId } };
    const local = num();
    const post = { id: `${req.params.id}_${local}`, pageId: req.params.id, message: b.caption ?? null, photoId, published: true, created_time: new Date().toISOString(), permalink_url: permalink(req.params.id, local), reactions: 7, shares: 0 };
    s().posts.push(post);
    return { json: { id: photoId, post_id: post.id } };
  });
  m.on('POST', G, '/:ver/:id/videos', req => {
    const bad = pageWrite(req, req.params.id);
    if (bad) return bad;
    const fileUrl: string = req.body.file_url ?? '';
    if (!fileUrl && !req.form) return gerr(400, 100, '(#100) The parameter file_url or source is required', 1363030);
    const vid = num();
    s().videos.push({ id: vid, pageId: req.params.id, file_url: fileUrl, description: req.body.description ?? null, title: req.body.title ?? null, likes: 11, scheduled: req.body.scheduled_publish_time ?? null });
    return { json: { id: vid } };
  });
  m.on('POST', G, '/:ver/:id/thumbnails', req => rec(req) ? { json: { success: true } } : badToken());

  const reelsLike = (kind: 'reel' | 'story') => (req: MockRequest): MockResponse => {
    const bad = pageWrite(req, req.params.id);
    if (bad) return bad;
    const b = req.body;
    if (b.upload_phase === 'start') {
      const vid = num();
      s().reels[vid] = { id: vid, pageId: req.params.id, kind, polls: 0, failed: false, uploaded: false };
      return { json: { video_id: vid, upload_url: `https://rupload.facebook.com/video-upload/v25.0/${vid}` } };
    }
    const r = s().reels[b.video_id];
    if (!r) return gerr(400, 100, '(#100) Invalid video_id', 33);
    if (b.upload_phase !== 'finish') return gerr(400, 100, '(#100) upload_phase must be start or finish');
    if (!r.uploaded) return gerr(400, 100, '(#100) The video has not been uploaded', 1363019);
    Object.assign(r, { description: b.description ?? null, title: b.title ?? null, state: b.video_state ?? 'PUBLISHED' });
    if (kind === 'story') { const sid = `${req.params.id}_${num()}`; s().stories.push({ id: sid, videoId: r.id }); return { json: { success: true, post_id: sid } }; }
    return { json: { success: true } };
  };
  m.on('POST', G, '/:ver/:id/video_reels', reelsLike('reel'));
  m.on('POST', G, '/:ver/:id/video_stories', reelsLike('story'));
  m.on('POST', 'rupload.facebook.com', '/video-upload/:ver/:id', req => {
    const r = s().reels[req.params.id];
    if (!rec(req) && !req.headers.authorization) return badToken();
    if (!r) return gerr(400, 100, '(#100) Invalid video id', 33);
    const fileUrl = req.headers.file_url ?? '';
    if (!fileUrl) return { json: { success: false, message: 'file_url header missing' } };
    if (fileUrl.includes('bad')) { r.failed = true; }
    r.uploaded = true; r.file_url = fileUrl;
    return { json: { success: true } };
  });
  m.on('POST', G, '/:ver/:id/photo_stories', req => {
    const bad = pageWrite(req, req.params.id);
    if (bad) return bad;
    const ph = s().photos.find((p: any) => p.id === req.body.photo_id);
    if (!ph) return gerr(400, 100, '(#100) photo_id is invalid', 33);
    const sid = `${req.params.id}_${num()}`;
    s().stories.push({ id: sid, photoId: ph.id });
    return { json: { success: true, post_id: sid } };
  });

  m.on('GET', G, '/:ver/:id/published_posts', req => {
    if (!rec(req)) return badToken();
    const all = s().posts.filter((p: any) => p.pageId === req.params.id && p.published).reverse().map((p: any) => ({
      id: p.id, message: p.message, created_time: p.created_time, permalink_url: p.permalink_url, full_picture: p.photoId ? 'https://cdn.facebook.example/photo.jpg' : undefined,
      attachments: p.photoId ? { data: [{ media_type: 'photo', type: 'photo', media: { image: { src: 'https://cdn.facebook.example/photo.jpg' } } }] } : { data: [] },
      reactions: summary(p.reactions), comments: summary(s().comments.filter((c: any) => c.parentId === p.id).length), shares: { count: p.shares },
    }));
    return { json: paged(all, req) };
  });

  // ── Comments
  const seedComments = (parentId: string) => {
    if (!s().comments.some((c: any) => c.parentId === parentId && c.from.id === '2001')) {
      s().comments.push({ id: `${parentId}_${num()}`, parentId, message: 'Looks great!', from: { id: '2001', name: 'Alice Fan', picture: { data: { url: 'https://cdn.facebook.example/alice.jpg' } } }, created_time: new Date().toISOString(), like_count: 2, comment_count: 0, is_hidden: false, can_hide: true });
    }
  };
  m.on('GET', G, '/:ver/:id/comments', req => {
    if (!rec(req)) return badToken();
    const pid = req.params.id;
    const known = s().posts.some((p: any) => p.id === pid) || s().videos.some((v: any) => v.id === pid) || s().comments.some((c: any) => c.id === pid);
    if (!known && !String(pid).startsWith('story_')) return notFound();
    if (s().posts.some((p: any) => p.id === pid)) seedComments(pid);
    const rows = s().comments.filter((c: any) => c.parentId === pid && !c.deleted).map((c: any) => ({ ...c, parent: { id: pid } }));
    return { json: paged(rows, req) };
  });
  m.on('POST', G, '/:ver/:id/comments', req => {
    const r = rec(req);
    if (!r) return badToken();
    if (r.kind !== 'page') return noPerm();
    if (!req.body.message) return gerr(400, 100, '(#100) The parameter message is required', 1349);
    const pid = req.params.id;
    const known = s().posts.some((p: any) => p.id === pid) || s().videos.some((v: any) => v.id === pid) || s().comments.some((c: any) => c.id === pid) || pid.startsWith('story_');
    if (!known) return notFound();
    const page = pageById(r.pageId!)!;
    const c = { id: `${pid}_${num()}`, parentId: pid, message: req.body.message, from: { id: page.id, name: page.name }, created_time: new Date().toISOString(), like_count: 0, comment_count: 0, is_hidden: false, can_hide: true, attachment_url: req.body.attachment_url ?? null };
    s().comments.push(c);
    return { json: { id: c.id } };
  });
  m.on('POST', G, '/:ver/:id/likes', req => { if (!rec(req)) return badToken(); s().likes.push(req.params.id); return { json: { success: true } }; });
  m.on('DELETE', G, '/:ver/:id/likes', req => { if (!rec(req)) return badToken(); s().likes = s().likes.filter(x => x !== req.params.id); return { json: { success: true } }; });
  m.on('POST', G, '/:ver/:id', req => {
    const r = rec(req);
    if (!r) return badToken();
    if (r.kind !== 'page') return noPerm();
    const oid = req.params.id;
    const c = s().comments.find((x: any) => x.id === oid);
    if (c) { if (req.body.message !== undefined) c.message = req.body.message; if (req.body.is_hidden !== undefined) c.is_hidden = String(req.body.is_hidden) === 'true'; return { json: { success: true } }; }
    const p = s().posts.find((x: any) => x.id === oid);
    if (p) { p.message = req.body.message ?? p.message; return { json: { success: true } }; }
    const v = s().videos.find((x: any) => x.id === oid) ?? s().reels[oid];
    if (v) { v.description = req.body.description ?? v.description; return { json: { success: true } }; }
    return notFound();
  });
  m.on('DELETE', G, '/:ver/:id', req => {
    const r = rec(req);
    if (!r) return badToken();
    if (r.kind !== 'page') return noPerm();
    const oid = req.params.id;
    const c = s().comments.find((x: any) => x.id === oid);
    if (c) { c.deleted = true; return { json: { success: true } }; }
    const p = s().posts.find((x: any) => x.id === oid);
    if (p) { s().posts = s().posts.filter((x: any) => x !== p); return { json: { success: true } }; }
    const vi = s().videos.findIndex((x: any) => x.id === oid);
    if (vi >= 0) { s().videos.splice(vi, 1); return { json: { success: true } }; }
    return notFound();
  });

  // ── Insights
  const PAGE_METRICS: Record<string, number> = { page_media_view: 5400, page_total_media_view_unique: 3100, page_post_engagements: 210, page_follows: 450 };
  const POST_METRICS: Record<string, number> = { post_media_view: 960, post_total_media_view_unique: 700, post_clicks: 31 };
  const VIDEO_METRICS: Record<string, number> = { blue_reels_play_count: 1500, total_video_views: 1800, post_video_likes_by_reaction_type: 40 };
  const insights = (table: Record<string, number>, req: MockRequest, period: string) =>
    ({ json: { data: String(req.query.metric ?? '').split(',').filter(n => n in table).map(name => ({ name, period, values: [{ value: table[name], end_time: new Date().toISOString() }], title: name, id: `${req.params.id}/insights/${name}/${period}` })) } });
  m.on('GET', G, '/:ver/:id/insights', req => {
    if (!rec(req)) return badToken();
    return pageById(req.params.id) ? insights(PAGE_METRICS, req, req.query.period ?? 'day') : insights(POST_METRICS, req, 'lifetime');
  });
  m.on('GET', G, '/:ver/:id/video_insights', req => rec(req) ? insights(VIDEO_METRICS, req, 'lifetime') : badToken());

  // ── Ratings (recommendations)
  m.on('GET', G, '/:ver/:id/ratings', req => {
    if (!rec(req)) return badToken();
    if (!pageById(req.params.id)) return notFound();
    const st = s();
    st.ratings ??= [
      { created_time: '2026-10-02T08:00:00+0000', has_rating: false, has_review: true, recommendation_type: 'positive', review_text: 'Great service, would recommend.', reviewer: { id: '3001', name: 'Bob Reviewer', picture: { data: { url: 'https://cdn.facebook.example/bob.jpg' } } }, story: 'story_rec_1' },
      { created_time: '2026-10-03T08:00:00+0000', has_rating: false, has_review: true, recommendation_type: 'negative', review_text: 'Slow reply.', reviewer: { id: '3002', name: 'Carol Reviewer' }, story: 'story_rec_2' },
    ];
    const rows = st.ratings.map(({ story, ...r }: any) => ({ ...r, open_graph_story: { id: story, comments: { data: st.comments.filter((c: any) => c.parentId === story && !c.deleted).map((c: any) => ({ id: c.id, message: c.message, from: c.from, created_time: c.created_time })) } } }));
    return { json: paged(rows, req) };
  });

  // ── Messenger Platform
  m.on('POST', G, '/:ver/:id/messages', req => {
    if (!rec(req)) return badToken();
    const b = req.body;
    if (b.recipient?.id === '999') return gerr(400, 10, 'This message is sent outside of allowed window.', 2018278);
    const mid = id('mid_');
    s().messages.push({ ...b, mid, from: req.params.id });
    return { json: { recipient_id: b.recipient?.id ?? '900', message_id: mid } };
  });
  m.on('POST', G, '/:ver/:id/subscribed_apps', req => { if (!rec(req)) return badToken(); s().subscribed.push({ id: req.params.id, fields: req.query.subscribed_fields }); return { json: { success: true } }; });
  m.on('DELETE', G, '/:ver/:id/subscribed_apps', req => { if (!rec(req)) return badToken(); s().subscribed.length = 0; return { json: { success: true } }; });
  m.on('POST', G, '/:ver/:id/messenger_profile', req => { if (!rec(req)) return badToken(); s().profileSettings.push(req.body); return { json: { result: 'success' } }; });
  m.on('DELETE', G, '/:ver/:id/messenger_profile', req => { if (!rec(req)) return badToken(); s().profileSettings.push({ deleted: req.body.fields }); return { json: { result: 'success' } }; });
}
