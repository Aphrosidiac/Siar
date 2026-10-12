import { consent, id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * TikTok — Login Kit + Content Posting API v2 (open.tiktokapis.com, upload host
 * open-upload.tiktokapis.com) and TikTok API for Business v1.3 (business-api.tiktok.com).
 *
 * Content Posting answers `{ data, error: { code, message, log_id } }` (code "ok" on success);
 * the Business API answers HTTP 200 `{ code, message, request_id, data }` (code 0 on success).
 * Publishing is asynchronous: each status fetch advances PROCESSING_* → PUBLISH_COMPLETE
 * (or SEND_TO_USER_INBOX for inbox uploads). Toggles for tests: state.tiktok.unaudited,
 * state.tiktok.creator (creator_info), state.tiktok.verifiedPrefixes (PULL_FROM_URL domains).
 */
export default function tiktok(m: MockRegistry) {
  m.seedToken('tiktok', () => OPEN_ID);
  const s = () => m.ns('tiktok', () => ({
    tokens: {} as Record<string, string>, refresh: {} as Record<string, string>, bizTokens: {} as Record<string, string>, bizRefresh: {} as Record<string, string>,
    publishes: {} as Record<string, any>, videos: [] as any[], comments: [] as any[], unaudited: false,
    verifiedPrefixes: ['https://media.siar.test/'],
    creator: { creator_avatar_url: 'https://p16.tiktokcdn.example/avatar.jpeg', creator_username: 'siartest', creator_nickname: 'Siar Test', privacy_level_options: ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'], comment_disabled: false, duet_disabled: false, stitch_disabled: true, max_video_post_duration_sec: 600 } as Record<string, any>,
  }));
  const OPEN = 'open.tiktokapis.com';
  const BIZ = 'business-api.tiktok.com';
  const OPEN_ID = '-000ZsiarTestOpenId0000';
  const user = { open_id: OPEN_ID, union_id: 'u-siar-1', avatar_url: 'https://p16.tiktokcdn.example/avatar.jpeg', display_name: 'Siar Test', username: 'siartest', bio_description: 'Testing Siar', profile_deep_link: 'https://vm.tiktok.com/siartest', is_verified: false, follower_count: 1520, following_count: 33, likes_count: 8800 };
  const logId = () => `2026${num()}`;
  const ok = (data: unknown): MockResponse => ({ json: { data, error: { code: 'ok', message: '', log_id: logId() } } });
  const err = (status: number, code: string, message: string): MockResponse => ({ status, json: { data: {}, error: { code, message, log_id: logId() } } });
  const bizOk = (data: unknown): MockResponse => ({ json: { code: 0, message: 'OK', request_id: logId(), data } });
  const bizErr = (code: number, message: string): MockResponse => ({ json: { code, message, request_id: logId(), data: {} } });
  const authed = (req: MockRequest) => req.bearer && s().tokens[req.bearer];
  const bizAuthed = (req: MockRequest) => s().bizTokens[req.headers['access-token'] ?? ''];
  const invalidToken = () => err(401, 'access_token_invalid', 'The access token is invalid or not found in the request.');
  const pick = (obj: Record<string, any>, fields: string) => Object.fromEntries(fields.split(',').filter(f => f in obj).map(f => [f, obj[f]]));

  const issue = (prefix: 'content' | 'business') => {
    const access = id(prefix === 'content' ? 'act.' : 'bat.');
    const refresh = id(prefix === 'content' ? 'rft.' : 'brt.');
    if (prefix === 'content') { s().tokens[access] = OPEN_ID; s().refresh[refresh] = OPEN_ID; } else { s().bizTokens[access] = OPEN_ID; s().bizRefresh[refresh] = OPEN_ID; }
    return { access, refresh };
  };

  // ── Login Kit ──
  m.on('GET', 'www.tiktok.com', '/v2/auth/authorize', req => {
    if (!req.query.client_key) return { status: 400, json: { error: 'invalid_request', error_description: 'client_key is required' } };
    return consent(req, { extra: { scopes: req.query.scope ?? '' } });
  });
  m.on('POST', OPEN, '/v2/oauth/token', req => {
    const b = req.body;
    if (b.grant_type === 'authorization_code') {
      if (!String(b.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error: 'invalid_grant', error_description: 'Authorization code is expired.', log_id: logId() } };
      // Web apps send no code_verifier (PKCE is for mobile/desktop apps).
    } else if (b.grant_type === 'refresh_token') {
      // Refresh tokens rotate: the old one is spent.
      if (!s().refresh[b.refresh_token]) return { status: 400, json: { error: 'invalid_grant', error_description: 'Refresh token is invalid or expired.', log_id: logId() } };
      delete s().refresh[b.refresh_token];
    } else return { status: 400, json: { error: 'unsupported_grant_type', error_description: 'Grant type is not supported.', log_id: logId() } };
    const t = issue('content');
    return { json: { access_token: t.access, expires_in: 86400, open_id: OPEN_ID, refresh_expires_in: 31536000, refresh_token: t.refresh, scope: 'user.info.basic,user.info.profile,user.info.stats,video.list,video.publish,video.upload', token_type: 'Bearer' } };
  });
  m.on('POST', OPEN, '/v2/oauth/revoke', req => { delete s().tokens[req.body.token]; return { json: {} }; });
  m.on('GET', OPEN, '/v2/user/info', req => {
    if (!authed(req)) return invalidToken();
    const fields = req.query.fields;
    if (!fields) return err(400, 'invalid_params', 'fields is required');
    return ok({ user: pick({ ...user, video_count: s().videos.length }, fields) });
  });

  // ── Content Posting ──
  m.on('POST', OPEN, '/v2/post/publish/creator_info/query', req => authed(req) ? ok(s().creator) : invalidToken());

  const startPublish = (req: MockRequest, kind: 'video' | 'inbox' | 'photo'): MockResponse => {
    if (!authed(req)) return invalidToken();
    const b = req.body;
    const post = b.post_info ?? {};
    const inbox = kind === 'inbox' || b.post_mode === 'MEDIA_UPLOAD';
    if (!inbox) {
      if (!post.privacy_level) return err(400, 'invalid_params', 'privacy_level is required for direct post.');
      if (!s().creator.privacy_level_options.includes(post.privacy_level)) return err(400, 'privacy_level_option_mismatch', 'privacy_level is not in the privacy_level_options returned by creator_info.');
      if (s().unaudited && post.privacy_level !== 'SELF_ONLY') return err(403, 'unaudited_client_can_only_post_to_private_accounts', 'Please review our integration guidelines at https://developers.tiktok.com/doc/content-sharing-guidelines/');
      if (post.brand_content_toggle && post.privacy_level === 'SELF_ONLY') return err(400, 'invalid_params', 'Branded content cannot be posted with SELF_ONLY privacy.');
    }
    const src = b.source_info ?? {};
    const pid = `v_pub_${kind === 'photo' ? 'url' : 'file'}~v2.${num()}`;
    const p: any = { publish_id: pid, kind, inbox, post_info: post, source_info: src, polls: 0, received: 0, chunks: [] as number[], media_type: b.media_type ?? 'VIDEO' };
    let upload_url: string | undefined;
    if (kind === 'photo') {
      if (b.media_type !== 'PHOTO') return err(400, 'invalid_params', 'media_type must be PHOTO.');
      const imgs: string[] = src.photo_images ?? [];
      if (!imgs.length || imgs.length > 35) return err(400, 'invalid_params', 'photo_images must contain 1 to 35 urls.');
      if (imgs.some(u => !s().verifiedPrefixes.some(x => u.startsWith(x)))) return err(403, 'url_ownership_unverified', 'The URL prefix of the photo is not verified for this app.');
    } else if (src.source === 'PULL_FROM_URL') {
      if (!s().verifiedPrefixes.some(x => String(src.video_url ?? '').startsWith(x))) return err(403, 'url_ownership_unverified', 'The URL prefix of the video is not verified for this app.');
      p.received = Infinity;
    } else if (src.source === 'FILE_UPLOAD') {
      const { video_size: size, chunk_size: chunk, total_chunk_count: count } = src;
      const MB = 1024 * 1024;
      const single = count === 1 && chunk === size;
      const lastChunk = size - chunk * (count - 1);
      if (!size || !chunk || !count || (!single && (chunk < 5 * MB || chunk > 64 * MB)) || count !== Math.max(1, Math.floor(size / chunk)) || lastChunk > 128 * MB || count > 1000) {
        return err(400, 'invalid_params', 'The chunk_size and total_chunk_count do not match the video_size per the media transfer guide.');
      }
      upload_url = `https://open-upload.tiktokapis.com/upload/?upload_id=${num()}&upload_token=${id('ut')}`;
      p.uploadUrl = upload_url; p.size = size; p.chunkSize = chunk; p.count = count;
    } else return err(400, 'invalid_params', 'source_info.source must be FILE_UPLOAD or PULL_FROM_URL.');
    s().publishes[pid] = p;
    if (upload_url) s().publishes[new URL(upload_url).searchParams.get('upload_id')!] = p;
    return ok(upload_url ? { publish_id: pid, upload_url } : { publish_id: pid });
  };
  m.on('POST', OPEN, '/v2/post/publish/video/init', req => startPublish(req, 'video'));
  m.on('POST', OPEN, '/v2/post/publish/inbox/video/init', req => startPublish(req, 'inbox'));
  m.on('POST', OPEN, '/v2/post/publish/content/init', req => startPublish(req, 'photo'));

  m.on('PUT', 'open-upload.tiktokapis.com', '/upload', req => {
    const p = s().publishes[req.query.upload_id];
    if (!p) return { status: 404, json: { error: { code: 'invalid_upload_id', message: 'Upload session not found.' } } };
    const range = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(req.headers['content-range'] ?? '');
    if (!range) return { status: 400, json: { error: { code: 'invalid_file_upload', message: 'Content-Range header is missing or malformed.' } } };
    const [start, end, total] = range.slice(1).map(Number);
    const idx = Math.floor(start / p.chunkSize);
    const expectedEnd = idx === p.count - 1 ? p.size - 1 : start + p.chunkSize - 1;
    if (total !== p.size || start !== idx * p.chunkSize || end !== expectedEnd || req.raw.length !== end - start + 1) {
      return { status: 416, json: { error: { code: 'invalid_file_upload', message: `Chunk ${start}-${end} does not match the declared chunk layout.` } } };
    }
    if (!p.chunks.includes(idx)) { p.chunks.push(idx); p.received += req.raw.length; }
    return { status: p.received >= p.size ? 201 : 206, text: '' };
  });

  const advance = (p: any) => {
    p.polls++;
    if (p.received < (p.size ?? 0)) return { status: 'PROCESSING_UPLOAD', uploaded_bytes: p.received };
    if (p.polls < 2) return { status: p.source_info.source === 'FILE_UPLOAD' ? 'PROCESSING_UPLOAD' : 'PROCESSING_DOWNLOAD', uploaded_bytes: p.received === Infinity ? 0 : p.received };
    if (p.inbox) return { status: 'SEND_TO_USER_INBOX' };
    if (!p.videoId) {
      p.videoId = '7' + num().slice(-18); // int64, above Number.MAX_SAFE_INTEGER like real ids
      s().videos.unshift({
        id: p.videoId, title: p.post_info.title ?? p.post_info.description ?? '', video_description: p.post_info.title ?? p.post_info.description ?? '', create_time: Math.floor(Date.now() / 1000),
        cover_image_url: `https://p16.tiktokcdn.example/cover/${p.videoId}.jpeg`, share_url: `https://www.tiktok.com/@siartest/${p.kind === 'photo' ? 'photo' : 'video'}/${p.videoId}`, embed_link: `https://www.tiktok.com/embed/v2/${p.videoId}`,
        duration: 12, height: 1920, width: 1080, like_count: 42, comment_count: 3, share_count: 2, view_count: 1200, privacy_level: p.post_info.privacy_level,
      });
    }
    return { status: 'PUBLISH_COMPLETE', publicaly_available_post_id: p.post_info.privacy_level === 'SELF_ONLY' ? [] : [p.videoId as string], uploaded_bytes: p.size ?? 0 };
  };
  m.on('POST', OPEN, '/v2/post/publish/status/fetch', req => {
    if (!authed(req)) return invalidToken();
    const p = s().publishes[req.body.publish_id];
    if (!p) return err(400, 'invalid_publish_id', 'publish_id does not exist.');
    const st: any = advance(p);
    if (!st.publicaly_available_post_id) return ok(st);
    // TikTok sends these ids as bare int64 JSON numbers.
    const ids: string[] = st.publicaly_available_post_id;
    const body = JSON.stringify({ data: { ...st, publicaly_available_post_id: '__IDS__' }, error: { code: 'ok', message: '', log_id: logId() } }).replace('"__IDS__"', `[${ids.join(',')}]`);
    return { text: body, headers: { 'content-type': 'application/json' } };
  });

  // ── Display API: video list / query ──
  const visible = () => s().videos.filter(v => v.privacy_level !== 'SELF_ONLY');
  m.on('POST', OPEN, '/v2/video/list', req => {
    if (!authed(req)) return invalidToken();
    const max = Math.min(20, Number(req.body.max_count ?? 10));
    const cursor = Number(req.body.cursor ?? Date.now() + 1);
    const list = visible().filter(v => v.create_time * 1000 < cursor || !req.body.cursor);
    const page = list.slice(0, max);
    return ok({ videos: page.map(v => pick(v, req.query.fields ?? 'id')), cursor: page.length ? page[page.length - 1].create_time * 1000 : 0, has_more: list.length > max });
  });
  m.on('POST', OPEN, '/v2/video/query', req => {
    if (!authed(req)) return invalidToken();
    const ids: string[] = (req.body.filters?.video_ids ?? []).map(String);
    if (!ids.length || ids.length > 20) return err(400, 'invalid_params', 'filters.video_ids must contain 1 to 20 ids.');
    return ok({ videos: visible().filter(v => ids.includes(v.id)).map(v => pick(v, req.query.fields ?? 'id')) });
  });

  // ── TikTok API for Business v1.3 ──
  m.on('POST', BIZ, '/open_api/v1.3/tt_user/oauth2/token', req => {
    const b = req.body;
    if (!b.client_id || !b.client_secret) return bizErr(40002, 'client_id and client_secret are required.');
    if (!String(b.auth_code ?? '').startsWith('mockcode_')) return bizErr(40002, 'auth_code is invalid or expired.');
    const t = issue('business');
    return bizOk({ open_id: OPEN_ID, scope: 'user.info.basic,user.info.stats,video.list,video.insights,video.publish,comment.list,comment.list.manage', access_token: t.access, expires_in: 86400, refresh_token: t.refresh, refresh_token_expires_in: 31536000, token_type: 'Bearer' });
  });
  m.on('POST', BIZ, '/open_api/v1.3/tt_user/oauth2/refresh_token', req => {
    if (!s().bizRefresh[req.body.refresh_token]) return bizErr(40105, 'Refresh token is invalid or expired.');
    delete s().bizRefresh[req.body.refresh_token];
    const t = issue('business');
    return bizOk({ open_id: OPEN_ID, access_token: t.access, expires_in: 86400, refresh_token: t.refresh, refresh_token_expires_in: 31536000, token_type: 'Bearer' });
  });
  m.on('POST', BIZ, '/open_api/v1.3/tt_user/oauth2/revoke', req => { delete s().bizTokens[req.body.access_token]; return bizOk({}); });

  const bizGuard = (req: MockRequest): MockResponse | null => {
    if (!req.headers['access-token']) return bizErr(40104, 'Access token is null, please pass it in the request header.');
    if (!bizAuthed(req)) return bizErr(40105, 'Access token is invalid or expired.');
    const bid = req.query.business_id ?? req.body.business_id;
    if (bid !== OPEN_ID) return bizErr(40001, 'No permission to operate the business account.');
    return null;
  };
  m.on('GET', BIZ, '/open_api/v1.3/business/get', req => bizGuard(req) ?? bizOk({ username: user.username, display_name: user.display_name, profile_image: user.avatar_url, bio_description: user.bio_description, is_verified: false, followers_count: 2310, following_count: 12, likes_count: 9100, videos_count: s().videos.length, is_business_account: true }));

  const bizVideo = (v: any) => ({ item_id: v.id, create_time: v.create_time, thumbnail_url: v.cover_image_url, share_url: v.share_url, embed_url: v.embed_link, caption: v.title, video_duration: v.duration, video_views: v.view_count, likes: v.like_count, comments: v.comment_count, shares: v.share_count, reach: 900 });
  m.on('GET', BIZ, '/open_api/v1.3/business/video/list', req => {
    const g = bizGuard(req); if (g) return g;
    let list = s().videos.map(bizVideo);
    const filters = req.query.filters ? JSON.parse(req.query.filters) : {};
    if (filters.video_ids) list = list.filter(v => filters.video_ids.map(String).includes(v.item_id));
    const max = Number(req.query.max_count ?? 20);
    return bizOk({ videos: list.slice(0, max), cursor: 0, has_more: list.length > max });
  });

  const bizPublish = (req: MockRequest, kind: 'video' | 'photo') => {
    const g = bizGuard(req); if (g) return g;
    const b = req.body;
    if (kind === 'video' && !b.video_url) return bizErr(40002, 'video_url is required.');
    if (kind === 'photo' && !(b.photo_images ?? []).length) return bizErr(40002, 'photo_images is required.');
    const ms = b.post_info?.music_sound_info;
    if (ms && !String(ms.music_sound_id ?? '').startsWith('clip_')) return bizErr(40002, 'music_sound_id is not a valid song clip id.');
    const share = `p_pub_${num()}`;
    s().publishes[share] = { publish_id: share, kind, inbox: !!b.post_info?.upload_to_draft, post_info: { ...b.post_info, title: b.post_info?.caption }, source_info: { source: 'PULL_FROM_URL' }, polls: 0, received: Infinity, music: ms ?? null };
    return bizOk({ share_id: share });
  };
  m.on('POST', BIZ, '/open_api/v1.3/business/video/publish', req => bizPublish(req, 'video'));
  m.on('POST', BIZ, '/open_api/v1.3/business/photo/publish', req => bizPublish(req, 'photo'));
  m.on('GET', BIZ, '/open_api/v1.3/business/publish/status', req => {
    const g = bizGuard(req); if (g) return g;
    const p = s().publishes[req.query.publish_id];
    if (!p) return bizErr(40002, 'publish_id does not exist.');
    const st: any = advance(p);
    return bizOk({ status: st.status, post_ids: st.publicaly_available_post_id ?? [] });
  });

  m.on('GET', BIZ, '/open_api/v1.3/business/comment/list', req => {
    const g = bizGuard(req); if (g) return g;
    const vid = req.query.video_id;
    if (!s().videos.some(v => v.id === vid)) return bizErr(40002, 'video_id is invalid.');
    const seeded = { comment_id: `${vid}01`, video_id: vid, user_id: 'u_fan', create_time: Math.floor(Date.now() / 1000) - 60, text: 'Love this!', likes: 4, replies: 0, owner: false, liked: false, pinned: false, status: 'PUBLIC', username: 'fan', display_name: 'A Fan', profile_image: 'https://p16.tiktokcdn.example/fan.jpeg', parent_comment_id: vid };
    const list = [seeded, ...s().comments.filter(c => c.video_id === vid && !c.deleted)];
    return bizOk({ comments: list, cursor: list.length, has_more: false });
  });
  const createComment = (req: MockRequest, reply: boolean) => {
    const g = bizGuard(req); if (g) return g;
    const b = req.body;
    if (!s().videos.some(v => v.id === b.video_id)) return bizErr(40002, 'video_id is invalid.');
    if (!b.text || [...b.text].length > 150) return bizErr(40002, 'text must be 1 to 150 characters.');
    const c = { comment_id: num(), video_id: b.video_id, user_id: OPEN_ID, create_time: Math.floor(Date.now() / 1000), text: b.text, likes: 0, replies: 0, owner: true, liked: false, pinned: false, status: 'PUBLIC', username: user.username, display_name: user.display_name, profile_image: user.avatar_url, parent_comment_id: reply ? b.comment_id : b.video_id };
    s().comments.push(c);
    return bizOk(c);
  };
  m.on('POST', BIZ, '/open_api/v1.3/business/comment/create', req => createComment(req, false));
  m.on('POST', BIZ, '/open_api/v1.3/business/comment/reply/create', req => createComment(req, true));
  m.on('POST', BIZ, '/open_api/v1.3/business/comment/delete', req => {
    const g = bizGuard(req); if (g) return g;
    const c = s().comments.find(x => x.comment_id === req.body.comment_id && !x.deleted);
    if (!c) return bizErr(40002, 'comment_id is invalid.');
    // Only the account's own comments can be deleted; others can be hidden.
    if (!c.owner) return bizErr(40001, 'You can only delete comments created by this business account.');
    c.deleted = true;
    return bizOk({});
  });
  m.on('POST', BIZ, '/open_api/v1.3/business/comment/hide', req => {
    const g = bizGuard(req); if (g) return g;
    if (!['HIDE', 'UNHIDE'].includes(req.body.action)) return bizErr(40002, 'action must be HIDE or UNHIDE.');
    const c = s().comments.find(x => x.comment_id === req.body.comment_id);
    if (c) c.status = req.body.action === 'HIDE' ? 'HIDDEN' : 'PUBLIC';
    return bizOk({});
  });

  m.on('GET', BIZ, '/open_api/v1.3/business/cml/trending_list', req => {
    const g = bizGuard(req); if (g) return g;
    if (!['1DAY', '7DAY', '30DAY'].includes(req.query.date_range)) return bizErr(40002, 'date_range must be one of 1DAY, 7DAY, 30DAY.');
    const genre = req.query.genre ?? 'POP';
    const trending_list = Array.from({ length: 3 }, (_, i) => ({
      commercial_music_id: `cm_${i + 1}`, commercial_music_name: `${genre} Track ${i + 1}`, duration: 60 + i * 15, thumbnail_url: `https://p16.tiktokcdn.example/cml/${i + 1}.jpeg`, artist: `Artist ${i + 1}`,
      preview_url: `https://sf16.tiktokcdn.example/cml/${i + 1}.mp3`, genres: [genre], rank_position: String(i + 1),
      trending_history: [{ date: new Date(Date.now() - 86400_000).toISOString().slice(0, 10), rank_position_daily: String(i + 2) }],
      full_duration_song_clip: { preview_url: `https://sf16.tiktokcdn.example/cml/${i + 1}_full.mp3`, duration: 60 + i * 15, song_clip_id: `clip_full_${i + 1}` },
      trending_song_clip: { preview_url: `https://sf16.tiktokcdn.example/cml/${i + 1}_trend.mp3`, duration: 30, song_clip_id: `clip_trend_${i + 1}` },
    }));
    return bizOk({ trending_list });
  });
}
