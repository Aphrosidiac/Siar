import { consent, id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Pinterest — API v5 (api.pinterest.com/v5), OAuth at www.pinterest.com/oauth/.
 *
 * Errors answer `{ code, message }` with the HTTP status carrying the category. The token
 * endpoint wants HTTP Basic client auth. Video pins go media register → multipart POST to an
 * S3-style upload host (file field last) → GET /v5/media/:id (processing → succeeded on the
 * second read) → pin with media_source.video_id.
 * Toggles for tests: state.pinterest.trial (403 on pin create), .rateLimited (429 everywhere),
 * .failMedia (media ends in "failed").
 */
export default function pinterest(m: MockRegistry) {
  m.seedToken('pinterest', () => true);
  const s = () => m.ns('pinterest', () => ({
    tokens: {} as Record<string, true>, refresh: {} as Record<string, true>,
    boards: [
      { id: '549755885175', name: 'Product Shots', description: 'Hero images', privacy: 'PUBLIC', pin_count: 0, media: { image_cover_url: 'https://i.pinimg.example/boards/1.jpg' } },
      { id: '549755885176', name: 'Behind the scenes', description: '', privacy: 'PROTECTED', pin_count: 0, media: { image_cover_url: 'https://i.pinimg.example/boards/2.jpg' } },
    ] as any[],
    pins: [] as any[], media: {} as Record<string, any>, uploads: [] as { key: string; size: number }[],
    trial: false, rateLimited: false, failMedia: false,
  }));
  const API = 'api.pinterest.com';
  const UPLOAD = 'pinterest-media-upload.s3-accelerate.amazonaws.com';
  const user = { account_type: 'BUSINESS', id: '1234567890123456789', username: 'siartest', business_name: 'Siar Test', profile_image: 'https://i.pinimg.example/avatar.jpg', about: 'Testing Siar', website_url: 'https://siar.dev', board_count: 2, follower_count: 840, following_count: 12, monthly_views: 15400 };
  const err = (status: number, code: number, message: string): MockResponse => ({ status, json: { code, message } });
  const check = (req: MockRequest): MockResponse | null => {
    if (!req.bearer || !s().tokens[req.bearer]) return err(401, 2, 'Authentication failed.');
    if (s().rateLimited) return { status: 429, json: { code: 8, message: 'You have exceeded your rate limit. Try again later.' }, headers: { 'retry-after': '60' } };
    return null;
  };
  const issue = () => { const access = id('pina_'); s().tokens[access] = true; return access; };

  // ── OAuth ──
  m.on('GET', 'www.pinterest.com', '/oauth', req => {
    if (!req.query.client_id || !req.query.scope) return { status: 400, json: { code: 1, message: 'client_id and scope are required.' } };
    if (!req.query.scope.includes(',')) return { status: 400, json: { code: 1, message: 'Scopes must be comma-separated.' } };
    return consent(req);
  });
  m.on('POST', API, '/v5/oauth/token', req => {
    if (!/^Basic /.test(req.headers.authorization ?? '')) return err(401, 2, 'Authentication failed. Client credentials are required.');
    const b = req.body;
    if (b.grant_type === 'authorization_code') {
      if (!String(b.code ?? '').startsWith('mockcode_')) return err(400, 4, 'Invalid authorization code.');
      if (!b.redirect_uri) return err(400, 1, 'redirect_uri is required.');
      const refresh = id('pinr_'); s().refresh[refresh] = true;
      return { json: { response_type: 'authorization_code', access_token: issue(), refresh_token: refresh, token_type: 'bearer', expires_in: 2592000, refresh_token_expires_in: 31536000, scope: 'boards:read,boards:write,pins:read,pins:write,user_accounts:read' } };
    }
    if (b.grant_type === 'refresh_token') {
      if (!s().refresh[b.refresh_token]) return err(401, 4, 'Invalid refresh token.');
      return { json: { response_type: 'refresh', access_token: issue(), token_type: 'bearer', expires_in: 2592000, scope: 'boards:read,boards:write,pins:read,pins:write,user_accounts:read' } };
    }
    return err(400, 1, 'Unsupported grant_type.');
  });
  m.on('POST', API, '/v5/oauth/token/revoke', req => { delete s().tokens[req.body.token]; return { status: 200, json: {} }; });

  // ── account & boards ──
  m.on('GET', API, '/v5/user_account', req => {
    const e = check(req); if (e) return e;
    return { json: { ...user, pin_count: s().pins.length } };
  });
  m.on('GET', API, '/v5/boards', req => {
    const e = check(req); if (e) return e;
    const size = Number(req.query.page_size ?? 25);
    const start = Number(req.query.bookmark ?? 0);
    const items = s().boards.slice(start, start + size);
    return { json: { items, bookmark: start + size < s().boards.length ? String(start + size) : null } };
  });

  // ── media (video) ──
  m.on('POST', API, '/v5/media', req => {
    const e = check(req); if (e) return e;
    if (req.body.media_type !== 'video') return err(400, 1, 'media_type must be video.');
    const mid = num();
    s().media[mid] = { media_id: mid, media_type: 'video', status: 'registered', polls: 0 };
    return { status: 201, json: { media_id: mid, media_type: 'video', upload_url: `https://${UPLOAD}/`, upload_parameters: { 'x-amz-date': '20261012T000000Z', 'Content-Type': 'multipart/form-data', key: `video/${mid}.mp4`, policy: 'eyJtb2NrIjp0cnVlfQ==', 'x-amz-signature': id('sig') } } };
  });
  m.on('POST', UPLOAD, '/', req => {
    const f = req.form;
    if (!f || !f.get('key') || !f.get('policy')) return { status: 403, text: '<Error><Code>AccessDenied</Code><Message>Invalid according to Policy: missing form fields</Message></Error>' };
    // Every field must precede `file`.
    const names = [...f.keys()];
    if (names[names.length - 1] !== 'file') return { status: 400, text: '<Error><Code>InvalidArgument</Code><Message>The file field must be the last field.</Message></Error>' };
    const mid = String(f.get('key')).replace(/^video\//, '').replace(/\.mp4$/, '');
    const media = s().media[mid];
    if (!media) return { status: 404, text: '<Error><Code>NoSuchKey</Code></Error>' };
    media.status = 'processing'; media.size = (f.get('file') as File).size;
    s().uploads.push({ key: String(f.get('key')), size: media.size });
    return { status: 204 };
  });
  m.on('GET', API, '/v5/media/:id', req => {
    const e = check(req); if (e) return e;
    const media = s().media[req.params.id];
    if (!media) return err(404, 40, 'Media not found.');
    if (media.status === 'processing' && ++media.polls >= 2) media.status = s().failMedia ? 'failed' : 'succeeded';
    return { json: { media_id: media.media_id, media_type: 'video', status: media.status } };
  });

  // ── pins ──
  const ref = (pin: any) => ({
    id: pin.id, created_at: pin.created_at, link: pin.link ?? null, title: pin.title ?? null, description: pin.description ?? null, alt_text: pin.alt_text ?? null,
    board_id: pin.board_id, board_owner: { username: user.username }, is_owner: true, note: pin.note ?? null, dominant_color: pin.dominant_color ?? null,
    media: pin.video
      ? { media_type: 'video', cover_image_url: 'https://i.pinimg.example/cover.jpg', images: { '150x150': { width: 150, height: 150, url: 'https://i.pinimg.example/150/v.jpg' }, '600x': { width: 600, height: 1067, url: 'https://i.pinimg.example/600/v.jpg' } } }
      : { media_type: 'image', images: { '150x150': { width: 150, height: 150, url: 'https://i.pinimg.example/150/p.jpg' }, '400x300': { width: 400, height: 300, url: 'https://i.pinimg.example/400/p.jpg' }, '600x': { width: 600, height: 400, url: 'https://i.pinimg.example/600/p.jpg' } } },
  });
  m.on('POST', API, '/v5/pins', req => {
    const e = check(req); if (e) return e;
    if (s().trial) return err(403, 29, 'Your application consumer type is not supported: Trial access can only create pins in sandbox.');
    const b = req.body;
    if (!s().boards.some(x => x.id === b.board_id)) return err(404, 40, 'Board not found.');
    if (b.title && b.title.length > 100) return err(400, 1, 'Invalid parameters: title must be at most 100 characters.');
    if (b.description && b.description.length > 800) return err(400, 1, 'Invalid parameters: description must be at most 800 characters.');
    const src = b.media_source ?? {};
    let video = false;
    if (src.source_type === 'image_url') {
      if (!/^https:\/\//.test(src.url ?? '')) return err(400, 1, 'Invalid image URL.');
    } else if (src.source_type === 'multiple_image_urls') {
      if (!Array.isArray(src.items) || src.items.length < 2 || src.items.length > 5) return err(400, 1, 'Invalid parameters: multiple_image_urls requires 2 to 5 items.');
    } else if (src.source_type === 'video_id') {
      const media = s().media[src.media_id];
      if (!media) return err(404, 40, 'Media not found.');
      if (media.status !== 'succeeded') return err(400, 1, 'The media is not ready: wait until its status is succeeded.');
      if (!src.cover_image_url && src.cover_image_key_frame_time === undefined) return err(400, 1, 'A cover image is required: cover_image_url or cover_image_key_frame_time.');
      video = true;
    } else return err(400, 1, 'Invalid parameters: media_source.source_type is required.');
    const pin = { id: num().slice(-19), created_at: new Date().toISOString(), board_id: b.board_id, title: b.title, description: b.description, link: b.link, alt_text: b.alt_text, note: b.note, dominant_color: b.dominant_color, source: src, video };
    s().pins.unshift(pin);
    return { status: 201, json: ref(pin) };
  });
  m.on('GET', API, '/v5/pins', req => {
    const e = check(req); if (e) return e;
    const size = Number(req.query.page_size ?? 25);
    const start = Number(req.query.bookmark ?? 0);
    return { json: { items: s().pins.slice(start, start + size).map(ref), bookmark: start + size < s().pins.length ? String(start + size) : null } };
  });
  m.on('GET', API, '/v5/pins/:id', req => {
    const e = check(req); if (e) return e;
    const p = s().pins.find(x => x.id === req.params.id);
    return p ? { json: ref(p) } : err(404, 20, 'Pin not found.');
  });
  m.on('PATCH', API, '/v5/pins/:id', req => {
    const e = check(req); if (e) return e;
    const p = s().pins.find(x => x.id === req.params.id);
    if (!p) return err(404, 20, 'Pin not found.');
    if (req.body.title && req.body.title.length > 100) return err(400, 1, 'Invalid parameters: title must be at most 100 characters.');
    for (const k of ['title', 'description', 'link', 'alt_text', 'note']) if (k in req.body) p[k] = req.body[k];
    return { json: ref(p) };
  });
  m.on('DELETE', API, '/v5/pins/:id', req => {
    const e = check(req); if (e) return e;
    const i = s().pins.findIndex(x => x.id === req.params.id);
    if (i < 0) return err(404, 20, 'Pin not found.');
    s().pins.splice(i, 1);
    return { status: 204 };
  });

  // ── analytics ──
  m.on('GET', API, '/v5/pins/:id/analytics', req => {
    const e = check(req); if (e) return e;
    if (!s().pins.some(x => x.id === req.params.id)) return err(404, 20, 'Pin not found.');
    if (!req.query.start_date || !req.query.end_date || !req.query.metric_types) return err(400, 1, 'Invalid parameters: start_date, end_date and metric_types are required.');
    return { json: { all: { daily_metrics: [], lifetime_metrics: {}, summary_metrics: { IMPRESSION: 5400, SAVE: 61, PIN_CLICK: 120, OUTBOUND_CLICK: 33, TOTAL_REACTIONS: 18, TOTAL_COMMENTS: 4 } } } };
  });
  m.on('GET', API, '/v5/user_account/analytics', req => {
    const e = check(req); if (e) return e;
    if (!req.query.start_date || !req.query.end_date) return err(400, 1, 'Invalid parameters: start_date and end_date are required.');
    return { json: { all: { daily_metrics: [], summary_metrics: { IMPRESSION: 90500, SAVE: 740, PIN_CLICK: 1900, OUTBOUND_CLICK: 410, ENGAGEMENT: 3050 } } } };
  });
}
