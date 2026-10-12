import { createDecipheriv } from 'node:crypto';
import { consent, id, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Snapchat — accounts.snapchat.com OAuth and the Snap Public Profile API on businessapi.snapchat.com,
 * as documented at developers.snap.com/marketing-api/Public-Profile-API (GetStarted, Profiles,
 * ProfileAssetManagement): my_profile + organisation profile list (cursor paging), media create with
 * an AES-256-CBC key/iv, multipart ADD/FINALIZE on the returned add_path (≤ 32 MB parts, part_number
 * 1–35, decrypted and checked at FINALIZE), then Story / Spotlight / Saved Story posts.
 * A Story answers with no id; a Spotlight starts SUBMITTED and becomes LIVE (or REJECTED when its
 * description contains "reject-me"). Posting the same media twice answers
 * MEDIA_POSTING_ALREADY_IN_PROGRESS.
 */
const PART_MAX = 32 * 1024 * 1024;
const TTLS = ['ONE_DAY', 'TWO_DAYS', 'THREE_DAYS', 'ONE_WEEK'];

export default function snapchat(m: MockRegistry) {
  m.seedToken('snapchat', () => 'u1');
  const s = () => m.ns('snapchat', () => ({ tokens: {} as Record<string, string>, refresh: {} as Record<string, true>, media: {} as Record<string, any>, spotlights: {} as Record<string, any>, posts: [] as any[] }));
  const A = 'accounts.snapchat.com';
  const B = 'businessapi.snapchat.com';
  const ok = (extra: Record<string, unknown> = {}): MockResponse => ({ json: { request_id: id('req_'), request_status: 'SUCCESS', ...extra } });
  const err = (status: number, display_message: string, error_code = 'E1000'): MockResponse => ({ status, json: { request_id: id('req_'), request_status: 'ERROR', debug_message: display_message, display_message, error_code } });
  const authed = (req: MockRequest) => !!req.bearer && !!s().tokens[req.bearer];
  const guard = (fn: (req: MockRequest) => MockResponse | Promise<MockResponse>) => (req: MockRequest) => (authed(req) ? fn(req) : err(401, 'Unauthorized: invalid or expired access token', 'E1001'));
  const issue = () => {
    const access_token = id('snap_'); const refresh_token = id('snaprt_');
    s().tokens[access_token] = 'u1'; s().refresh[refresh_token] = true;
    return { json: { access_token, token_type: 'Bearer', expires_in: 3600, refresh_token, scope: 'snapchat-profile-api' } };
  };

  const profile = (n: number) => ({
    id: `pp${n}`, organization_id: 'org1', display_name: n === 1 ? 'Siar Test Profile' : `Siar Profile ${n}`, snap_user_name: n === 1 ? 'siartest' : `siartest${n}`,
    profile_type: 'PUBLIC_PROFILE', profile_tier: 'TIER_STANDARD', internal_profile_category: 'BUSINESS', share_authorized_data_with_api_partners: false,
    logo_urls: { original_logo_url: 'https://cf-st.sc-cdn.net/logo-1280.png', manage_profile_logo_url: 'https://cf-st.sc-cdn.net/logo-640.png' },
  });
  const PROFILES = Array.from({ length: 11 }, (_, i) => profile(i + 1)); // 11 → the default page of 10 plus one

  // ── OAuth ──
  m.on('GET', A, '/login/oauth2/authorize', req => {
    if (req.query.response_type !== 'code' || !req.query.client_id) return { status: 400, json: { error: 'invalid_request', error_description: 'client_id and response_type=code are required' } };
    if (!String(req.query.scope ?? '').split(' ').includes('snapchat-profile-api')) return { status: 400, json: { error: 'invalid_scope', error_description: 'scope must include snapchat-profile-api' } };
    return consent(req);
  });
  m.on('POST', A, '/login/oauth2/access_token', req => {
    if (!req.body.client_id || !req.body.client_secret) return { status: 401, json: { error: 'invalid_client', error_description: 'client_id and client_secret are required' } };
    if (req.body.grant_type === 'refresh_token') return s().refresh[req.body.refresh_token] ? issue() : { status: 400, json: { error: 'invalid_grant', error_description: 'refresh token is invalid' } };
    if (req.body.grant_type !== 'authorization_code' || !req.body.redirect_uri) return { status: 400, json: { error: 'invalid_request', error_description: 'grant_type authorization_code needs redirect_uri' } };
    if (!String(req.body.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error: 'invalid_grant', error_description: 'The authorization code is invalid' } };
    return issue();
  });

  // ── Profiles ──
  m.on('GET', B, '/v1/public_profiles/my_profile', guard(() => ok({ public_profile: PROFILES[0] })));
  m.on('GET', B, '/v1/organizations/:org/public_profiles', guard(req => {
    if (req.params.org !== 'org1') return err(403, 'The user is not a member of this organization', 'AUTHORIZATION_PERMISSION_DENIED');
    const limit = Number(req.query.limit ?? 10);
    if (!(limit > 0)) return err(400, 'limit must be greater than 0');
    const from = req.query.cursor ? Number(Buffer.from(req.query.cursor, 'base64url').toString()) : 0;
    const rows = PROFILES.slice(from, from + limit).map(public_profile => ({ sub_request_status: 'SUCCESS', public_profile }));
    const next = from + limit < PROFILES.length ? Buffer.from(String(from + limit)).toString('base64url') : undefined;
    return ok({ public_profiles: rows, paging: next ? { next_page_id: next, next_link: `https://businessapi.snapchat.com/v1/organizations/org1/public_profiles?limit=${limit}&cursor=${next}` } : {} });
  }));
  const allowed = (pid: string) => PROFILES.some(p => p.id === pid);

  // ── Media: create → ADD parts → FINALIZE (no INIT, no status to poll) ──
  m.on('POST', B, '/v1/public_profiles/:pid/media', guard(req => {
    if (!allowed(req.params.pid)) return err(403, 'No access to this public profile', 'AUTHORIZATION_PERMISSION_DENIED');
    const { type, name, key, iv } = req.body ?? {};
    if (!['VIDEO', 'IMAGE'].includes(type)) return err(400, 'type must be VIDEO or IMAGE');
    if (!name) return err(400, 'name is required');
    const k = Buffer.from(String(key ?? ''), 'base64'); const v = Buffer.from(String(iv ?? ''), 'base64');
    if (k.length !== 32) return err(400, 'key must be a base64 encoded 32 byte AES-256 key');
    if (v.length !== 16) return err(400, 'iv must be a base64 encoded 16 byte initialization vector');
    const media_id = id('m_');
    s().media[media_id] = { id: media_id, profile: req.params.pid, type, name, key: k, iv: v, parts: new Map<number, Buffer>(), finalized: false, plain: null as Buffer | null, posted: false, createdAt: Date.now() };
    const path = `/us/v1/public_profiles/${req.params.pid}/media/${media_id}/multipart-upload`;
    return ok({ media_id, add_path: path, finalize_path: path });
  }));
  m.on('POST', B, '/us/v1/public_profiles/:pid/media/:mid/multipart-upload', guard(async req => {
    const media = s().media[req.params.mid];
    if (!media || media.profile !== req.params.pid) return err(404, 'Media not found');
    const action = req.form?.get('action');
    if (action === 'ADD') {
      const n = Number(req.form?.get('part_number'));
      if (!Number.isInteger(n) || n < 1 || n > 35) return err(400, 'part_number must be between 1 and 35');
      const file = req.form?.get('file') as File | null;
      if (!file || typeof file === 'string') return err(400, 'file is required');
      if (file.size > PART_MAX) return err(400, 'A part can be at most 32 MB');
      if (media.finalized) return err(400, 'The upload is already finalized');
      media.parts.set(n, Buffer.from(await file.arrayBuffer()));
      return ok();
    }
    if (action === 'FINALIZE') {
      const nums = [...media.parts.keys()].sort((a: number, b: number) => a - b);
      if (!nums.length || nums.some((n, i) => n !== i + 1)) return err(400, 'The uploaded parts are missing or not contiguous');
      try {
        const d = createDecipheriv('aes-256-cbc', media.key, media.iv);
        media.plain = Buffer.concat([d.update(Buffer.concat(nums.map((n: number) => media.parts.get(n)))), d.final()]);
      } catch { return err(400, 'The media file could not be decrypted with the key and iv provided'); }
      media.finalized = true;
      return ok();
    }
    return err(400, 'action must be ADD or FINALIZE');
  }));

  /** The shared checks before a media id may be posted. */
  const usable = (pid: string, mediaId: unknown): MockResponse | null => {
    const media = s().media[String(mediaId)];
    if (!media || media.profile !== pid) return err(400, 'The media does not exist for this profile', 'INVALID_MEDIA');
    if (Date.now() - media.createdAt > 24 * 3600_000) return err(400, 'The media is older than 24 hours', 'MEDIA_EXPIRED');
    if (!media.finalized) return err(400, 'The media upload has not been finalized');
    return null;
  };
  const claim = (mediaId: string): MockResponse | null => {
    const media = s().media[mediaId];
    if (media.posted) return err(400, 'This media is already being posted', 'MEDIA_POSTING_ALREADY_IN_PROGRESS');
    media.posted = true;
    return null;
  };

  // ── Story: no id comes back ──
  m.on('POST', B, '/v1/public_profiles/:pid/stories', guard(req => {
    const pid = req.params.pid;
    if (!allowed(pid)) return err(403, 'No access to this public profile', 'AUTHORIZATION_PERMISSION_DENIED');
    const b = req.body ?? {};
    const bad = usable(pid, b.media_id); if (bad) return bad;
    if (b.customized_ttl !== undefined && !TTLS.includes(b.customized_ttl?.ttl)) return err(400, `customized_ttl.ttl must be one of ${TTLS.join(', ')}`);
    const dup = claim(b.media_id); if (dup) return dup;
    s().posts.push({ kind: 'story', profile: pid, media_id: b.media_id, customized_ttl: b.customized_ttl ?? null });
    return ok();
  }));

  // ── Spotlight: SUBMITTED, then LIVE | REJECTED ──
  m.on('POST', B, '/v1/public_profiles/:pid/spotlights', guard(req => {
    const pid = req.params.pid;
    if (!allowed(pid)) return err(403, 'No access to this public profile', 'AUTHORIZATION_PERMISSION_DENIED');
    const b = req.body ?? {};
    const bad = usable(pid, b.media_id); if (bad) return bad;
    if (s().media[b.media_id].type !== 'VIDEO') return err(400, 'Spotlight media must be a video');
    if (!/^[a-z]{2,3}_[A-Z]{2}$/.test(String(b.locale ?? ''))) return err(400, 'locale is required, e.g. en_US');
    if (String(b.description ?? '').length > 160) return err(400, 'description can be at most 160 characters');
    const dup = claim(b.media_id); if (dup) return dup;
    const spotlight_id = id('sp_');
    s().spotlights[spotlight_id] = { id: spotlight_id, profile_id: pid, polls: 0, reject: String(b.description ?? '').includes('reject-me') };
    s().posts.push({ kind: 'spotlight', profile: pid, spotlight_id, media_id: b.media_id, description: b.description ?? null, locale: b.locale });
    return ok({ spotlight_id });
  }));
  m.on('GET', B, '/v1/public_profiles/:pid/spotlights/:sid', guard(req => {
    const sp = s().spotlights[req.params.sid];
    if (!sp || sp.profile_id !== req.params.pid) return err(404, 'Spotlight not found');
    sp.polls++;
    const status = sp.polls < 2 ? 'SUBMITTED' : sp.reject ? 'REJECTED' : 'LIVE';
    return ok({ spotlights: [{ sub_request_status: 'SUCCESS', spotlight: { id: sp.id, profile_id: sp.profile_id, thumbnail_url: 'https://cf-st.sc-cdn.net/thumb.jpg', media_url: 'https://cf-st.sc-cdn.net/media.mp4', created_at: new Date().toISOString(), duration: 12, status } }] });
  }));

  // ── Saved Story: exactly one per request ──
  m.on('POST', B, '/v1/public_profiles/:pid/saved_stories', guard(req => {
    const pid = req.params.pid;
    if (!allowed(pid)) return err(403, 'No access to this public profile', 'AUTHORIZATION_PERMISSION_DENIED');
    const list = req.body?.saved_stories;
    if (!Array.isArray(list) || list.length !== 1) return err(400, 'Exactly one saved story can be created per request');
    const { title, snap_sources } = list[0] ?? {};
    if (!title || String(title).length > 45) return err(400, 'title is required and can be at most 45 characters');
    if (!Array.isArray(snap_sources) || !snap_sources.length) return err(400, 'snap_sources must not be empty');
    for (const src of snap_sources) {
      if (!src.snap_id && !src.media_id && !src.spotlight_id) return err(400, 'Each snap source needs a snap_id, media_id or spotlight_id');
      if (src.media_id) { const bad = usable(pid, src.media_id); if (bad) return bad; }
    }
    const mediaIds = snap_sources.map((x: any) => x.media_id).filter(Boolean);
    for (const mid of mediaIds) { const dup = claim(mid); if (dup) return dup; }
    const saved = { id: id('ss_') };
    s().posts.push({ kind: 'saved_story', profile: pid, saved_story_id: saved.id, title, media_ids: mediaIds });
    return ok({ saved_stories: [{ sub_request_status: 'SUCCESS', saved_story: saved }] });
  }));
}
