import { consent, id, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Snapchat — accounts.snapchat.com OAuth and the (UNVERIFIED, see adapters/snapchat.ts) Public
 * Profile API: media create + multipart-upload-v2 + status, then stories / spotlights / saved stories.
 * Responses use Snap's envelope: { request_status: 'SUCCESS', request_id, … }.
 */
export default function snapchat(m: MockRegistry) {
  const s = () => m.ns('snapchat', () => ({ tokens: {} as Record<string, string>, refresh: {} as Record<string, true>, media: {} as Record<string, any>, uploads: {} as Record<string, any>, posts: [] as any[] }));
  const A = 'accounts.snapchat.com';
  const B = 'businessapi.snapchat.com';
  const ok = (extra: Record<string, unknown>): MockResponse => ({ json: { request_status: 'SUCCESS', request_id: id('req_'), ...extra } });
  const err = (status: number, display_message: string, error_code = 'E1000'): MockResponse => ({ status, json: { request_status: 'ERROR', request_id: id('req_'), debug_message: display_message, display_message, error_code } });
  const authed = (req: MockRequest) => !!req.bearer && !!s().tokens[req.bearer];
  const guard = (fn: (req: MockRequest) => MockResponse) => (req: MockRequest) => (authed(req) ? fn(req) : err(401, 'Unauthorized: invalid or expired access token', 'E1001'));
  const issue = () => {
    const access_token = id('snap_'); const refresh_token = id('snaprt_');
    s().tokens[access_token] = 'u1'; s().refresh[refresh_token] = true;
    return { json: { access_token, refresh_token, token_type: 'Bearer', expires_in: 1800, scope: 'snapchat-profile-api' } };
  };

  m.on('GET', A, '/accounts/oauth2/auth', req => consent(req));
  m.on('POST', A, '/login/oauth2/access_token', req => {
    if (req.body.grant_type === 'refresh_token') return s().refresh[req.body.refresh_token] ? issue() : { status: 400, json: { error: 'invalid_grant', error_description: 'refresh token is invalid' } };
    if (!String(req.body.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error: 'invalid_grant', error_description: 'The authorization code is invalid' } };
    return issue();
  });

  m.on('GET', B, '/v1/me', guard(() => ok({ me: { id: 'u1', email: 'tester@example.com', organization_id: 'org1', display_name: 'Snap Tester' } })));
  m.on('GET', B, '/v1/organizations/:org/public_profiles', guard(() => ok({
    public_profiles: [
      { sub_request_status: 'SUCCESS', public_profile: { id: 'pp1', display_name: 'Siar Test Profile', snap_user_name: 'siartest', logo_url: 'https://cf-st.sc-cdn.net/logo.png' } },
      { sub_request_status: 'SUCCESS', public_profile: { id: 'pp2', display_name: 'Siar Second Profile', snap_user_name: 'siartest2' } },
    ],
  })));

  m.on('POST', B, '/v1/public_profiles/:pid/media', guard(req => {
    const out = (req.body.media ?? []).map((x: any) => {
      const media = { id: id('m_'), name: x.name, type: x.type, media_status: 'PENDING_UPLOAD', profile: req.params.pid, parts: 0, polls: 0 };
      s().media[media.id] = media;
      return { sub_request_status: 'SUCCESS', media };
    });
    return ok({ media: out });
  }));
  m.on('POST', B, '/v1/media/:mid/multipart-upload-v2', guard(req => {
    const media = s().media[req.params.mid]; if (!media) return err(404, 'Media not found');
    if (req.query.action === 'INIT') {
      const upload_id = id('up_');
      s().uploads[upload_id] = { mediaId: media.id, expected: req.body.number_of_parts, size: req.body.file_size, received: 0, bytes: 0 };
      return ok({ upload_id, add_path: `/v1/media/${media.id}/multipart-upload-v2?action=ADD`, finalize_path: `/v1/media/${media.id}/multipart-upload-v2?action=FINALIZE` });
    }
    if (req.query.action === 'ADD') {
      const up = s().uploads[String(req.form?.get('upload_id'))]; if (!up) return err(400, 'Unknown upload_id');
      const part = req.form?.get('content') as File | null; if (!part) return err(400, 'Missing part content');
      up.received++; up.bytes += part.size;
      return ok({ part_number: Number(req.form?.get('part_number')) });
    }
    if (req.query.action === 'FINALIZE') {
      const up = s().uploads[req.body.upload_id]; if (!up) return err(400, 'Unknown upload_id');
      if (up.received !== up.expected || up.bytes !== up.size) return err(400, 'Uploaded media does not match the declared file size');
      media.media_status = 'PENDING_PROCESSING';
      return ok({ result: 'FINALIZED' });
    }
    return err(400, 'Unknown action');
  }));
  m.on('GET', B, '/v1/media/:mid', guard(req => {
    const media = s().media[req.params.mid]; if (!media) return err(404, 'Media not found');
    // Processing takes one extra look, like the real service.
    if (media.media_status === 'PENDING_PROCESSING' && ++media.polls > 1) media.media_status = 'READY';
    return ok({ media: [{ sub_request_status: 'SUCCESS', media }] });
  }));

  const create = (kind: 'story' | 'spotlight' | 'saved_story', collection: string) => guard(req => {
    const ids: string[] = req.body.media_ids ?? [req.body.media_id];
    for (const mid of ids) if (s().media[mid]?.media_status !== 'READY') return err(400, 'The media is not READY');
    if (kind === 'spotlight' && s().media[ids[0]].type !== 'VIDEO') return err(400, 'Spotlight media must be a video');
    if (kind === 'spotlight' && String(req.body.description ?? '').length > 160) return err(400, 'Spotlight description is too long');
    const row = { id: id(`${kind}_`), kind, profile: req.params.pid, media_ids: ids, ...req.body };
    s().posts.push(row);
    return ok({ [collection]: [{ sub_request_status: 'SUCCESS', [kind]: row }] });
  });
  m.on('POST', B, '/v1/public_profiles/:pid/stories', create('story', 'stories'));
  m.on('POST', B, '/v1/public_profiles/:pid/spotlights', create('spotlight', 'spotlights'));
  m.on('POST', B, '/v1/public_profiles/:pid/saved_stories', create('saved_story', 'saved_stories'));
}
