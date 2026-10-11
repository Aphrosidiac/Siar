import { consent, id, num, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * LinkedIn — OAuth 2.0 + OIDC (www.linkedin.com, api.linkedin.com/v2/userinfo) and the versioned
 * REST APIs (api.linkedin.com/rest/*).
 *
 * Every /rest call must carry Linkedin-Version (YYYYMM, 202409 or newer here) and
 * X-Restli-Protocol-Version: 2.0.0. Creating a post answers 201 with the URN in the x-restli-id
 * header and an empty body. Commentary is "little text": the mock records what LinkedIn would
 * render, which stops at the first unescaped ( or [ — the real-world truncation trap.
 * Media: initializeUpload → PUT to the returned URL(s) → (video) finalizeUpload with part ETags;
 * a video reads PROCESSING once before AVAILABLE.
 * Toggles for tests: state.linkedin.rateLimited, .noOrgScope, .failVideo.
 */
export default function linkedin(m: MockRegistry) {
  const SUB = 'Qk4xmZp7aD';
  const ORG = '5515715';
  const s = () => m.ns('linkedin', () => ({
    tokens: {} as Record<string, true>, refresh: {} as Record<string, true>,
    media: {} as Record<string, any>, uploads: {} as Record<string, any>, posts: {} as Record<string, any>, comments: {} as Record<string, any>,
    rateLimited: false, noOrgScope: false, failVideo: false,
  }));
  const API = 'api.linkedin.com';
  const WWW = 'www.linkedin.com';
  const ME = `urn:li:person:${SUB}`;
  const ORG_URN = `urn:li:organization:${ORG}`;
  const err = (status: number, message: string, code?: string, serviceErrorCode?: number): MockResponse => ({ status, json: { status, ...(serviceErrorCode ? { serviceErrorCode } : {}), ...(code ? { code } : {}), message } });
  const gate = (req: MockRequest): MockResponse | null => {
    if (!req.bearer || !s().tokens[req.bearer]) return err(401, 'The token used in the request has been revoked by the user.', 'REVOKED_ACCESS_TOKEN', 65601);
    if (req.path.startsWith('/rest/')) {
      const v = req.headers['linkedin-version'];
      if (!v || !/^\d{6}$/.test(v)) return err(400, 'A fully qualified version string must be provided in the Linkedin-Version header (YYYYMM).', 'VERSION_MISSING');
      if (v < '202409') return err(426, `Requested version ${v} is not active`, 'NONEXISTENT_VERSION');
      if (req.headers['x-restli-protocol-version'] !== '2.0.0') return err(400, 'X-Restli-Protocol-Version must be 2.0.0.');
    }
    if (s().rateLimited) return { status: 429, json: { status: 429, code: 'TOO_MANY_REQUESTS', message: 'Resource level throttle APPLICATION DAY limit for calls to this resource is reached.' } };
    return null;
  };
  const issue = () => { const access = id('AQ'); const refresh = id('AQR'); s().tokens[access] = true; s().refresh[refresh] = true; return { access, refresh }; };
  const canAuthor = (author: string) => author === ME || (author === ORG_URN && !s().noOrgScope);

  // ── OAuth ──
  m.on('GET', WWW, '/oauth/v2/authorization', req => {
    if (req.query.response_type !== 'code' || !req.query.client_id || !req.query.scope) return { status: 400, json: { error: 'invalid_request', error_description: 'response_type, client_id and scope are required' } };
    if (!req.query.scope.includes('w_member_social')) return { status: 400, json: { error: 'invalid_scope_error', error_description: 'w_member_social is required to post' } };
    return consent(req);
  });
  const SCOPE = 'openid,profile,email,w_member_social,r_member_postAnalytics,r_organization_social,w_organization_social,rw_organization_admin';
  m.on('POST', WWW, '/oauth/v2/accessToken', req => {
    const b = req.body;
    if (!b.client_id || !b.client_secret) return { status: 401, json: { error: 'invalid_client', error_description: 'Client authentication failed' } };
    if (b.grant_type === 'authorization_code') {
      if (!String(b.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error: 'invalid_request', error_description: 'Unable to retrieve access token: authorization code not found' } };
      const t = issue();
      return { json: { access_token: t.access, expires_in: 5184000, refresh_token: t.refresh, refresh_token_expires_in: 31536000, scope: SCOPE } };
    }
    if (b.grant_type === 'refresh_token') {
      if (!s().refresh[b.refresh_token]) return { status: 400, json: { error: 'invalid_request', error_description: 'The provided authorization grant or refresh token is invalid, expired or revoked.' } };
      const t = issue();
      return { json: { access_token: t.access, expires_in: 5184000, refresh_token: b.refresh_token, refresh_token_expires_in: 30000000, scope: SCOPE } };
    }
    return { status: 400, json: { error: 'unsupported_grant_type', error_description: 'grant_type is not supported' } };
  });
  m.on('POST', WWW, '/oauth/v2/revoke', req => { delete s().tokens[req.body.token]; return { status: 200, json: {} }; });
  m.on('GET', API, '/v2/userinfo', req => {
    const e = gate(req); if (e) return e;
    return { json: { sub: SUB, email_verified: true, name: 'Siar Test', locale: { country: 'US', language: 'en' }, given_name: 'Siar', family_name: 'Test', email: 'siar@example.test', picture: 'https://media.licdn.example/me.jpg' } };
  });

  // ── organizations ──
  const org = { id: Number(ORG), localizedName: 'Siar Labs', vanityName: 'siar-labs', logoV2: { 'original~': { elements: [{ identifiers: [{ identifier: 'https://media.licdn.example/siar-logo.png' }] }] } } };
  m.on('GET', API, '/rest/organizationAcls', req => {
    const e = gate(req); if (e) return e;
    if (s().noOrgScope) return err(403, 'Not enough permissions to access: organizationAcls.FINDER-roleAssignee.' + req.headers['linkedin-version'], 'ACCESS_DENIED');
    return { json: { paging: { start: 0, count: 50, links: [], total: 1 }, elements: [{ role: 'ADMINISTRATOR', organization: ORG_URN, roleAssignee: ME, state: 'APPROVED' }] } };
  });
  m.on('GET', API, '/rest/organizations/:id', req => {
    const e = gate(req); if (e) return e;
    return req.params.id === ORG ? { json: org } : err(404, 'Not Found', 'NOT_FOUND');
  });
  m.on('GET', API, '/rest/organizations', req => {
    const e = gate(req); if (e) return e;
    return { json: { elements: req.query.vanityName === org.vanityName ? [org] : [], paging: { start: 0, count: 10, links: [] } } };
  });
  m.on('GET', API, '/rest/people/:ref', req => {
    const e = gate(req); if (e) return e;
    return req.params.ref === '(id:jane1)' ? { json: { id: 'jane1', localizedFirstName: 'Jane', localizedLastName: 'Doe', profilePicture: { displayImage: 'urn:li:digitalmediaAsset:jane' } } } : err(403, 'Not enough permissions to access: people.GET.' + req.headers['linkedin-version'], 'ACCESS_DENIED');
  });

  // ── media ──
  const initUpload = (kind: 'image' | 'video' | 'document') => (req: MockRequest): MockResponse => {
    const e = gate(req); if (e) return e;
    const action = req.query.action;
    const body = req.body;
    if (action === 'finalizeUpload' && kind === 'video') {
      const f = body.finalizeUploadRequest ?? {};
      const media = s().media[f.video];
      if (!media) return err(404, `Video ${f.video} not found`, 'NOT_FOUND');
      const parts: string[] = f.uploadedPartIds ?? [];
      if (parts.length !== media.parts || parts.some((p, i) => p !== `etag-${media.id}-${i}`)) return err(400, 'Video upload failed: uploadedPartIds do not match the uploaded parts.', 'INVALID_PARTS');
      media.finalized = true;
      return { status: 200, json: {} };
    }
    if (action !== 'initializeUpload') return err(400, 'action must be initializeUpload.');
    const r = body.initializeUploadRequest ?? {};
    if (!canAuthor(r.owner)) return err(403, `Not enough permissions to access owner ${r.owner}`, 'ACCESS_DENIED');
    const mid = num();
    const urn = `urn:li:${kind}:${mid}`;
    const media: any = { id: mid, urn, kind, owner: r.owner, polls: 0, bytes: 0 };
    s().media[urn] = media;
    if (kind === 'video') {
      if (!r.fileSizeBytes) return err(400, 'fileSizeBytes is required for videos.');
      const PART = 4 * 1024 * 1024;
      const n = Math.ceil(r.fileSizeBytes / PART);
      media.parts = n; media.size = r.fileSizeBytes;
      return { json: { value: { uploadUrlsExpireAt: Date.now() + 3600_000, video: urn, uploadInstructions: Array.from({ length: n }, (_, i) => ({ uploadUrl: `https://www.linkedin.com/dms-uploads/video/${mid}/${i}`, firstByte: i * PART, lastByte: Math.min(r.fileSizeBytes, (i + 1) * PART) - 1 })), uploadToken: '', } } };
    }
    media.status = 'AVAILABLE';
    return { json: { value: { uploadUrlExpiresAt: Date.now() + 3600_000, uploadUrl: `https://www.linkedin.com/dms-uploads/${kind}/${mid}`, [kind]: urn } } };
  };
  m.on('POST', API, '/rest/images', initUpload('image'));
  m.on('POST', API, '/rest/videos', initUpload('video'));
  m.on('POST', API, '/rest/documents', initUpload('document'));
  m.on('PUT', WWW, '/dms-uploads/:kind/:mid', req => {
    if (!req.bearer || !s().tokens[req.bearer]) return err(401, 'Unauthorized');
    const media = s().media[`urn:li:${req.params.kind}:${req.params.mid}`];
    if (!media) return err(404, 'Upload target not found');
    media.bytes = req.raw.length;
    return { status: 201, text: '' };
  });
  m.on('PUT', WWW, '/dms-uploads/video/:mid/:part', req => {
    if (!req.bearer || !s().tokens[req.bearer]) return err(401, 'Unauthorized');
    const media = s().media[`urn:li:video:${req.params.mid}`];
    if (!media) return err(404, 'Upload target not found');
    media.bytes += req.raw.length;
    return { status: 200, text: '', headers: { etag: `"etag-${media.id}-${req.params.part}"` } };
  });
  m.on('GET', API, '/rest/videos/:urn', req => {
    const e = gate(req); if (e) return e;
    const v = s().media[req.params.urn];
    if (!v || !v.finalized) return err(404, `Video ${req.params.urn} not found`, 'NOT_FOUND');
    if (v.status !== 'AVAILABLE' && ++v.polls >= 2) v.status = s().failVideo ? 'PROCESSING_FAILED' : 'AVAILABLE';
    return { json: { id: v.urn, status: v.status ?? 'PROCESSING', owner: v.owner, fileSizeBytes: v.size } };
  });
  m.on('GET', API, '/rest/documents/:urn', req => {
    const e = gate(req); if (e) return e;
    const d = s().media[req.params.urn];
    return d ? { json: { id: d.urn, status: 'AVAILABLE', owner: d.owner } } : err(404, 'Document not found', 'NOT_FOUND');
  });

  // ── posts ──
  /** What LinkedIn renders: text stops at the first unescaped ( or [ that is not part of a mention. */
  const render = (c: string) => {
    const t = c.replace(/@\[(?:\\.|[^\]\\])*\]\(urn:li:(?:person|organization):[^)\s]+\)/g, '\u0000').replace(/\\./g, '\u0001');
    const cut = t.search(/[([{]/);
    return cut < 0 ? c : t.slice(0, cut);
  };
  m.on('POST', API, '/rest/posts', req => {
    const e = gate(req); if (e) return e;
    const b = req.body;
    if (!canAuthor(b.author)) return err(403, `Not enough permissions to access: partnerApiPostsExternal.CREATE.${req.headers['linkedin-version']}`, 'ACCESS_DENIED');
    if (!['PUBLIC', 'CONNECTIONS', 'LOGGED_IN', 'CONTAINER'].includes(b.visibility)) return err(400, 'Unpermitted fields present in REQUEST_BODY: visibility', 'INVALID_VISIBILITY');
    if (b.lifecycleState !== 'PUBLISHED') return err(400, 'lifecycleState must be PUBLISHED or DRAFT.');
    if (typeof b.commentary !== 'string' || !b.commentary.trim()) return err(422, 'Content cannot be empty', 'EMPTY_CONTENT');
    if (b.commentary.length > 3000) return err(422, 'Commentary exceeds the 3000 character limit.');
    const dup = Object.values<any>(s().posts).find(p => p.author === b.author && p.commentary === b.commentary && !b.reshareContext);
    if (dup) return err(422, `Content is a duplicate of ${dup.id}`, 'DUPLICATE_POST');
    const c = b.content ?? {};
    const assets: string[] = [c.media?.id, ...(c.multiImage?.images ?? []).map((i: any) => i.id), c.article?.thumbnail].filter(Boolean);
    for (const a of assets) {
      const md = s().media[a];
      if (!md || (md.kind === 'video' && md.status !== 'AVAILABLE') || md.owner !== b.author) return err(400, `Media asset ${a} is not available.`, 'INVALID_MEDIA');
    }
    if (c.multiImage && (c.multiImage.images.length < 2 || c.multiImage.images.length > 20)) return err(400, 'multiImage takes 2 to 20 images.');
    if (c.article && (!c.article.source || !c.article.title)) return err(400, 'article.source and article.title are required.');
    if (c.media?.id?.startsWith('urn:li:document:') && !c.media.title) return err(400, 'A document post requires media.title.');
    const urn = `urn:li:${c.media?.id?.startsWith('urn:li:video:') ? 'ugcPost' : 'share'}:${num()}`;
    s().posts[urn] = { id: urn, author: b.author, commentary: b.commentary, rendered: render(b.commentary), visibility: b.visibility, distribution: b.distribution, content: b.content, isReshareDisabledByAuthor: b.isReshareDisabledByAuthor, reshareContext: b.reshareContext, lifecycleState: 'PUBLISHED', createdAt: Date.now(), publishedAt: Date.now() };
    return { status: 201, headers: { 'x-restli-id': urn } };
  });
  m.on('GET', API, '/rest/posts', req => {
    const e = gate(req); if (e) return e;
    if (req.query.q !== 'author' || !req.query.author) return err(400, 'q=author and author are required.');
    const all = Object.values<any>(s().posts).filter(p => p.author === req.query.author).reverse();
    const start = Number(req.query.start ?? 0); const count = Number(req.query.count ?? 10);
    return { json: { paging: { start, count, total: all.length, links: [] }, elements: all.slice(start, start + count) } };
  });
  m.on('POST', API, '/rest/posts/:urn', req => {
    const e = gate(req); if (e) return e;
    if (req.headers['x-restli-method'] !== 'PARTIAL_UPDATE') return err(400, 'X-RestLi-Method: PARTIAL_UPDATE is required.');
    const p = s().posts[req.params.urn];
    if (!p) return err(404, 'Post not found', 'NOT_FOUND');
    const set = req.body.patch?.$set ?? {};
    if (typeof set.commentary === 'string') { p.commentary = set.commentary; p.rendered = render(set.commentary); }
    return { status: 204 };
  });
  m.on('DELETE', API, '/rest/posts/:urn', req => {
    const e = gate(req); if (e) return e;
    if (req.headers['x-restli-method'] !== 'DELETE') return err(400, 'X-RestLi-Method: DELETE is required.');
    if (!s().posts[req.params.urn]) return err(404, 'Post not found', 'NOT_FOUND');
    delete s().posts[req.params.urn];
    return { status: 204 };
  });

  // ── comments ──
  const commentView = (c: any) => ({ id: c.id, '$URN': c.urn, actor: c.actor, object: c.object, message: { text: c.text }, created: { actor: c.actor, time: c.at }, parentComment: c.parent, likesSummary: { totalLikes: 0 }, commentsSummary: { totalFirstLevelComments: 0 } });
  m.on('POST', API, '/rest/socialActions/:urn/comments', req => {
    const e = gate(req); if (e) return e;
    const b = req.body;
    if (!s().posts[req.params.urn]) return err(404, `Resource ${req.params.urn} does not exist`, 'NOT_FOUND');
    if (!canAuthor(b.actor)) return err(403, 'Not enough permissions to access: socialActions.CREATE_COMMENT', 'ACCESS_DENIED');
    if (!b.message?.text?.trim()) return err(422, 'Comment text cannot be empty');
    if (b.message.text.length > 1250) return err(422, 'Comment exceeds the 1250 character limit.');
    if (b.parentComment && !s().comments[b.parentComment]) return err(404, `Parent comment ${b.parentComment} does not exist`, 'NOT_FOUND');
    const cid = num();
    const c = { id: cid, urn: `urn:li:comment:(${req.params.urn},${cid})`, actor: b.actor, object: req.params.urn, text: b.message.text, parent: b.parentComment, at: Date.now() };
    s().comments[c.urn] = c;
    return { status: 201, json: commentView(c) };
  });
  m.on('GET', API, '/rest/socialActions/:urn/comments', req => {
    const e = gate(req); if (e) return e;
    const all = Object.values<any>(s().comments).filter(c => c.object === req.params.urn);
    const start = Number(req.query.start ?? 0); const count = Number(req.query.count ?? 10);
    return { json: { paging: { start, count, total: all.length, links: [] }, elements: all.slice(start, start + count).map(commentView) } };
  });
  m.on('DELETE', API, '/rest/socialActions/:urn/comments/:cid', req => {
    const e = gate(req); if (e) return e;
    const c = s().comments[`urn:li:comment:(${req.params.urn},${req.params.cid})`];
    if (!c) return err(404, 'Comment not found', 'NOT_FOUND');
    if (c.actor !== req.query.actor) return err(403, 'Only the comment author can delete it.', 'ACCESS_DENIED');
    delete s().comments[c.urn];
    return { status: 204 };
  });
  m.on('POST', API, '/rest/socialActions/:urn/comments/:cid', req => {
    const e = gate(req); if (e) return e;
    const c = s().comments[`urn:li:comment:(${req.params.urn},${req.params.cid})`];
    if (!c) return err(404, 'Comment not found', 'NOT_FOUND');
    if (c.actor !== req.query.actor) return err(403, 'Only the comment author can edit it.', 'ACCESS_DENIED');
    c.text = req.body.patch?.message?.$set?.text ?? c.text;
    return { status: 204 };
  });

  // ── analytics ──
  m.on('GET', API, '/rest/organizationalEntityShareStatistics', req => {
    const e = gate(req); if (e) return e;
    const urn = /List\((.+)\)/.exec(req.query.shares ?? '')?.[1];
    if (req.query.organizationalEntity !== ORG_URN || !urn) return err(400, 'organizationalEntity and shares are required.');
    if (!s().posts[urn]) return { json: { elements: [], paging: { start: 0, count: 10, links: [] } } };
    return { json: { elements: [{ share: urn, organizationalEntity: ORG_URN, totalShareStatistics: { impressionCount: 3100, uniqueImpressionsCount: 2400, clickCount: 85, likeCount: 52, commentCount: 7, shareCount: 3, engagement: 0.048 } }] } };
  });
  m.on('GET', API, '/rest/memberCreatorPostAnalytics', req => {
    const e = gate(req); if (e) return e;
    const urn = /^\((?:share|ugc):(.+)\)$/.exec(req.query.entity ?? '')?.[1];
    if (!urn || !s().posts[urn]) return err(404, 'Post not found', 'NOT_FOUND');
    const count: Record<string, number> = { IMPRESSION: 1800, MEMBERS_REACHED: 1300, REACTION: 40, COMMENT: 6, RESHARE: 2 };
    if (!(req.query.queryType in count)) return err(400, 'queryType is invalid.');
    return { json: { elements: [{ count: count[req.query.queryType], metricType: { [req.query.queryType === 'IMPRESSION' ? 'impression' : 'other']: 'x' } }], paging: { start: 0, count: 10, links: [] } } };
  });
  m.on('GET', API, '/rest/networkSizes/:urn', req => {
    const e = gate(req); if (e) return e;
    return req.params.urn === ORG_URN && req.query.edgeType === 'COMPANY_FOLLOWED_BY_MEMBER' ? { json: { firstDegreeSize: 3120 } } : err(404, 'Not Found', 'NOT_FOUND');
  });
  m.on('GET', API, '/rest/memberFollowersCount', req => {
    const e = gate(req); if (e) return e;
    return { json: { elements: [{ memberFollowersCount: 512 }], paging: { start: 0, count: 10, links: [] } } };
  });
}
