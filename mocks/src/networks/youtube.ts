import { consent, id, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * YouTube — Google OAuth 2.0 (accounts.google.com, oauth2.googleapis.com), YouTube Data API v3
 * (www.googleapis.com/youtube/v3, uploads on /upload/youtube/v3) and the Analytics API v2.
 *
 * Errors use Google's shape `{ error: { code, message, errors: [{ reason }] } }`. Uploads are
 * resumable (init → Location → PUT with Content-Range; 308 until the last byte). Each
 * videos.list read of a freshly uploaded video advances uploadStatus uploaded → processed.
 * Toggles for tests: state.youtube.quotaExceeded, .unaudited (uploads locked private),
 * .noThumbnailPermission, .failProcessing (uploadStatus rejected).
 */
export default function youtube(m: MockRegistry) {
  const s = () => m.ns('youtube', () => ({
    tokens: {} as Record<string, true>, refresh: {} as Record<string, true>,
    channel: {
      id: 'UCsiarTestChannel000001', snippet: { title: 'Siar Test Channel', description: 'Testing Siar', customUrl: '@siartest', thumbnails: { default: { url: 'https://yt3.ggpht.example/a/default.jpg' }, high: { url: 'https://yt3.ggpht.example/a/high.jpg' } } },
      statistics: { viewCount: '48200', subscriberCount: '1520', hiddenSubscriberCount: false, videoCount: '0' },
    } as Record<string, any>,
    videos: {} as Record<string, any>, sessions: {} as Record<string, any>, thumbnails: {} as Record<string, { mime: string; size: number }>,
    playlists: {} as Record<string, any>, playlistItems: {} as Record<string, any>, threads: [] as any[], comments: {} as Record<string, any>,
    quotaExceeded: false, unaudited: false, noThumbnailPermission: false, failProcessing: false,
  }));
  const GOOGLE = 'www.googleapis.com';
  const gerr = (status: number, reason: string, message: string): MockResponse => ({ status, json: { error: { code: status, message, errors: [{ message, domain: 'youtube.video', reason }], status: status === 401 ? 'UNAUTHENTICATED' : undefined } } });
  const authed = (req: MockRequest) => !!req.bearer && !!s().tokens[req.bearer];
  const bad = (req: MockRequest): MockResponse | null => {
    if (!authed(req)) return { status: 401, json: { error: { code: 401, message: 'Invalid Credentials', errors: [{ message: 'Invalid Credentials', domain: 'global', reason: 'authError', location: 'Authorization', locationType: 'header' }], status: 'UNAUTHENTICATED' } } };
    if (s().quotaExceeded) return gerr(403, 'quotaExceeded', 'The request cannot be completed because you have exceeded your <a href="/youtube/v3/getting-started#quota">quota</a>.');
    return null;
  };
  const list = (items: unknown[], extra: Record<string, unknown> = {}) => ({ json: { kind: 'youtube#listResponse', etag: id('e'), pageInfo: { totalResults: items.length, resultsPerPage: items.length }, items, ...extra } });
  const thumbs = (key: string) => ({ default: { url: `https://i.ytimg.example/vi/${key}/default.jpg`, width: 120, height: 90 }, medium: { url: `https://i.ytimg.example/vi/${key}/mqdefault.jpg`, width: 320, height: 180 }, high: { url: `https://i.ytimg.example/vi/${key}/hqdefault.jpg`, width: 480, height: 360 } });
  const issue = () => { const access = id('ya29.'); const refresh = id('1//'); s().tokens[access] = true; s().refresh[refresh] = true; return { access, refresh }; };

  // ── OAuth ──
  m.on('GET', 'accounts.google.com', '/o/oauth2/v2/auth', req => {
    if (!req.query.client_id) return { status: 400, json: { error: 'invalid_request', error_description: 'client_id is required' } };
    if (req.query.access_type !== 'offline') return { status: 400, json: { error: 'invalid_request', error_description: 'access_type=offline is required for a refresh token' } };
    return consent(req);
  });
  m.on('POST', 'oauth2.googleapis.com', '/token', req => {
    const b = req.body;
    if (!b.client_id || !b.client_secret) return { status: 401, json: { error: 'invalid_client', error_description: 'The OAuth client was not found.' } };
    if (b.grant_type === 'authorization_code') {
      if (!String(b.code ?? '').startsWith('mockcode_')) return { status: 400, json: { error: 'invalid_grant', error_description: 'Malformed auth code.' } };
      const t = issue();
      return { json: { access_token: t.access, expires_in: 3599, refresh_token: t.refresh, scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl https://www.googleapis.com/auth/yt-analytics.readonly', token_type: 'Bearer' } };
    }
    if (b.grant_type === 'refresh_token') {
      if (!s().refresh[b.refresh_token]) return { status: 400, json: { error: 'invalid_grant', error_description: 'Token has been expired or revoked.' } };
      const access = id('ya29.'); s().tokens[access] = true;
      return { json: { access_token: access, expires_in: 3599, scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.force-ssl', token_type: 'Bearer' } };
    }
    return { status: 400, json: { error: 'unsupported_grant_type', error_description: 'Invalid grant_type' } };
  });
  m.on('POST', 'oauth2.googleapis.com', '/revoke', req => { delete s().tokens[req.body.token]; delete s().refresh[req.body.token]; return { json: {} }; });

  // ── channels ──
  m.on('GET', GOOGLE, '/youtube/v3/channels', req => {
    const e = bad(req); if (e) return e;
    const c = s().channel;
    const mine = req.query.mine === 'true' || req.query.id === c.id;
    if (!mine) return list([]);
    const parts = String(req.query.part ?? 'id').split(',');
    const out: Record<string, any> = { kind: 'youtube#channel', etag: id('e'), id: c.id };
    if (parts.includes('snippet')) out.snippet = c.snippet;
    if (parts.includes('statistics')) out.statistics = { ...c.statistics, videoCount: String(Object.keys(s().videos).length) };
    if (parts.includes('contentDetails')) out.contentDetails = { relatedPlaylists: { uploads: `UU${c.id.slice(2)}` } };
    return list([out]);
  });

  // ── resumable upload ──
  m.on('POST', GOOGLE, '/upload/youtube/v3/videos', req => {
    const e = bad(req); if (e) return e;
    if (req.query.uploadType !== 'resumable') return gerr(400, 'invalidRequest', 'uploadType must be resumable.');
    const b = req.body;
    const title = b.snippet?.title;
    if (!title || /[<>]/.test(title) || title.length > 100) return gerr(400, 'invalidTitle', 'The request metadata specifies an invalid or empty video title.');
    if (b.snippet?.description && Buffer.byteLength(b.snippet.description) > 5000) return gerr(400, 'invalidDescription', 'The request metadata specifies an invalid video description.');
    const size = Number(req.headers['x-upload-content-length']);
    if (!size || !req.headers['x-upload-content-type']?.startsWith('video/')) return gerr(400, 'mediaBodyRequired', 'The request does not include the video content.');
    const uploadId = id('AEnB2U');
    s().sessions[uploadId] = { size, received: 0, metadata: b, parts: req.query.part, bytes: 0 };
    return { json: {}, headers: { location: `https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&upload_id=${uploadId}` } };
  });
  m.on('PUT', GOOGLE, '/upload/youtube/v3/videos', req => {
    const e = bad(req); if (e) return e;
    const sess = s().sessions[req.query.upload_id];
    if (!sess) return { status: 404, json: { error: { code: 404, message: 'Not Found', errors: [{ reason: 'notFound' }] } } };
    const range = req.headers['content-range'] ?? '';
    const progress = (): MockResponse => ({ status: 308, text: '', headers: sess.received ? { range: `bytes=0-${sess.received - 1}` } : {} });
    if (/^bytes \*\//.test(range)) return progress();
    const mm = /^bytes (\d+)-(\d+)\/(\d+)$/.exec(range);
    if (!mm) return gerr(400, 'invalidRequest', 'Content-Range header is missing or malformed.');
    const [start, end, total] = mm.slice(1).map(Number);
    if (total !== sess.size || start !== sess.received || req.raw.length !== end - start + 1) return gerr(400, 'invalidRequest', `Chunk ${start}-${end} does not follow the ${sess.received} bytes already received.`);
    if (start % (256 * 1024) !== 0) return gerr(400, 'invalidRequest', 'Chunks must be multiples of 256 KiB.');
    sess.received = end + 1; sess.chunks = (sess.chunks ?? 0) + 1;
    if (sess.received < sess.size) return progress();
    const md = sess.metadata;
    const vid = id('vid').slice(0, 11);
    const locked = s().unaudited;
    const video = {
      kind: 'youtube#video', etag: id('e'), id: vid,
      snippet: { publishedAt: new Date().toISOString(), channelId: s().channel.id, title: md.snippet.title, description: md.snippet.description ?? '', thumbnails: thumbs(vid), channelTitle: s().channel.snippet.title, categoryId: md.snippet.categoryId ?? '22', defaultLanguage: md.snippet.defaultLanguage, defaultAudioLanguage: md.snippet.defaultAudioLanguage, tags: md.snippet.tags },
      status: { uploadStatus: 'uploaded', privacyStatus: locked ? 'private' : md.status?.privacyStatus ?? 'private', selfDeclaredMadeForKids: !!md.status?.selfDeclaredMadeForKids, madeForKids: !!md.status?.selfDeclaredMadeForKids, containsSyntheticMedia: !!md.status?.containsSyntheticMedia, embeddable: true, license: 'youtube', publicStatsViewable: true },
      paidProductPlacementDetails: md.paidProductPlacementDetails,
      statistics: { viewCount: '1200', likeCount: '80', commentCount: '12', favoriteCount: '0' },
      polls: 0, chunks: sess.chunks, size: sess.size, requestedParts: sess.parts,
    };
    s().videos[vid] = video;
    const { polls: _p, chunks: _c, size: _s, requestedParts: _r, ...wire } = video;
    return { json: wire };
  });

  // ── videos ──
  m.on('GET', GOOGLE, '/youtube/v3/videos', req => {
    const e = bad(req); if (e) return e;
    const ids = String(req.query.id ?? '').split(',').filter(Boolean);
    const parts = String(req.query.part ?? 'id').split(',');
    const out = ids.map(i => s().videos[i]).filter(Boolean).map(v => {
      const o: Record<string, any> = { kind: v.kind, etag: v.etag, id: v.id };
      for (const p of parts) if (p in v) o[p] = v[p];
      if (parts.includes('status') || parts.includes('processingDetails')) {
        v.polls++;
        if (v.status.uploadStatus === 'uploaded' && v.polls >= 2) {
          if (s().failProcessing) { v.status.uploadStatus = 'rejected'; v.status.rejectionReason = 'duplicate'; } else v.status.uploadStatus = 'processed';
        }
        if (parts.includes('status')) o.status = { ...v.status };
        if (parts.includes('processingDetails')) o.processingDetails = { processingStatus: v.status.uploadStatus === 'processed' ? 'succeeded' : 'processing' };
      }
      return o;
    });
    return list(out);
  });
  m.on('PUT', GOOGLE, '/youtube/v3/videos', req => {
    const e = bad(req); if (e) return e;
    const v = s().videos[req.body.id];
    if (!v) return gerr(404, 'videoNotFound', 'The video that you are trying to update cannot be found.');
    if (!req.body.snippet?.title) return gerr(400, 'invalidTitle', 'The request metadata specifies an invalid or empty video title.');
    if (!req.body.snippet?.categoryId) return gerr(400, 'invalidCategoryId', 'The snippet.categoryId property specifies an invalid category ID.');
    v.snippet = { ...v.snippet, ...Object.fromEntries(Object.entries(req.body.snippet).filter(([, x]) => x !== undefined)) };
    if (req.body.status?.privacyStatus && !s().unaudited) v.status.privacyStatus = req.body.status.privacyStatus;
    return { json: { kind: v.kind, etag: v.etag, id: v.id, snippet: v.snippet, status: v.status } };
  });
  m.on('DELETE', GOOGLE, '/youtube/v3/videos', req => {
    const e = bad(req); if (e) return e;
    if (!s().videos[req.query.id]) return gerr(404, 'videoNotFound', 'The video that you are trying to delete cannot be found.');
    delete s().videos[req.query.id];
    return { status: 204 };
  });
  m.on('POST', GOOGLE, '/upload/youtube/v3/thumbnails/set', req => {
    const e = bad(req); if (e) return e;
    const v = s().videos[req.query.videoId];
    if (!v) return gerr(404, 'videoNotFound', 'The video that you are trying to update cannot be found.');
    if (s().noThumbnailPermission) return gerr(403, 'forbidden', "The authenticated user doesn't have permissions to upload and set custom video thumbnails.");
    const mime = req.headers['content-type'] ?? '';
    if (!['image/jpeg', 'image/png'].includes(mime) || req.raw.length > 2 * 1024 * 1024) return gerr(400, 'invalidImage', 'The image is not a JPEG or PNG, or is larger than 2 MB.');
    s().thumbnails[v.id] = { mime, size: req.raw.length };
    return { json: { kind: 'youtube#thumbnailSetResponse', etag: id('e'), items: [thumbs(`${v.id}-custom`)] } };
  });

  // ── comments ──
  const commentRes = (c: any) => ({ kind: 'youtube#comment', etag: id('e'), id: c.id, snippet: { authorDisplayName: 'Siar Test Channel', authorChannelId: { value: s().channel.id }, authorChannelUrl: 'https://www.youtube.com/@siartest', authorProfileImageUrl: s().channel.snippet.thumbnails.default.url, textDisplay: c.text, textOriginal: c.text, parentId: c.parentId, likeCount: c.likes ?? 0, publishedAt: c.at, updatedAt: c.at, moderationStatus: c.moderation } });
  const addComment = (text: string, videoId: string, parentId?: string) => {
    const parent = parentId ? s().comments[parentId] : null;
    const cid = parent ? `${parentId}.${id('r').slice(0, 8)}` : id('Ugz').slice(0, 20);
    const c = { id: cid, text, videoId, parentId, at: new Date().toISOString(), moderation: 'published', likes: 0 };
    s().comments[cid] = c;
    return c;
  };
  const threadRes = (t: any, withReplies = true) => {
    const replies = Object.values<any>(s().comments).filter(c => c.parentId === t.id);
    return { kind: 'youtube#commentThread', etag: id('e'), id: t.id, snippet: { channelId: s().channel.id, videoId: t.videoId, topLevelComment: commentRes(t), canReply: true, totalReplyCount: replies.length, isPublic: true }, ...(withReplies && replies.length ? { replies: { comments: replies.slice(0, 5).map(commentRes) } } : {}) };
  };
  m.on('POST', GOOGLE, '/youtube/v3/commentThreads', req => {
    const e = bad(req); if (e) return e;
    const sn = req.body.snippet;
    if (!sn?.videoId || !sn.topLevelComment?.snippet?.textOriginal) return gerr(400, 'invalidCommentText', 'The comment text is required.');
    return { json: threadRes(addComment(sn.topLevelComment.snippet.textOriginal, sn.videoId)) };
  });
  m.on('GET', GOOGLE, '/youtube/v3/commentThreads', req => {
    const e = bad(req); if (e) return e;
    const tops = Object.values<any>(s().comments).filter(c => !c.parentId && c.videoId === req.query.videoId && c.moderation === 'published').reverse();
    const max = Number(req.query.maxResults ?? 20);
    const start = Number(req.query.pageToken ?? 0);
    const page = tops.slice(start, start + max);
    return list(page.map(t => threadRes(t)), start + max < tops.length ? { nextPageToken: String(start + max) } : {});
  });
  m.on('POST', GOOGLE, '/youtube/v3/comments', req => {
    const e = bad(req); if (e) return e;
    const sn = req.body.snippet;
    if (!sn?.parentId || !s().comments[sn.parentId]) return gerr(404, 'commentNotFound', 'The comment that you are trying to reply to cannot be found.');
    if (sn.parentId.includes('.')) return gerr(400, 'invalidValue', 'Replies must target a top-level comment.');
    return { json: commentRes(addComment(sn.textOriginal, s().comments[sn.parentId].videoId, sn.parentId)) };
  });
  m.on('GET', GOOGLE, '/youtube/v3/comments', req => {
    const e = bad(req); if (e) return e;
    return list(Object.values<any>(s().comments).filter(c => c.parentId === req.query.parentId).map(commentRes));
  });
  m.on('PUT', GOOGLE, '/youtube/v3/comments', req => {
    const e = bad(req); if (e) return e;
    const c = s().comments[req.body.id];
    if (!c) return gerr(404, 'commentNotFound', 'The comment that you are trying to update cannot be found.');
    c.text = req.body.snippet.textOriginal;
    return { json: commentRes(c) };
  });
  m.on('DELETE', GOOGLE, '/youtube/v3/comments', req => {
    const e = bad(req); if (e) return e;
    if (!s().comments[req.query.id]) return gerr(404, 'commentNotFound', 'The comment that you are trying to delete cannot be found.');
    delete s().comments[req.query.id];
    return { status: 204 };
  });
  m.on('POST', GOOGLE, '/youtube/v3/comments/setModerationStatus', req => {
    const e = bad(req); if (e) return e;
    if (!['heldForReview', 'published', 'rejected'].includes(req.query.moderationStatus)) return gerr(400, 'invalidValue', 'moderationStatus must be heldForReview, published or rejected.');
    const c = s().comments[req.query.id];
    if (!c) return gerr(404, 'commentNotFound', 'The comment cannot be found.');
    c.moderation = req.query.moderationStatus;
    return { status: 204 };
  });

  // ── playlists ──
  const playlistRes = (p: any) => ({ kind: 'youtube#playlist', etag: id('e'), id: p.id, snippet: { publishedAt: p.at, channelId: s().channel.id, title: p.title, description: p.description, thumbnails: thumbs(p.id), channelTitle: s().channel.snippet.title, localized: { title: p.title, description: p.description } }, status: { privacyStatus: p.privacy }, contentDetails: { itemCount: Object.values<any>(s().playlistItems).filter(i => i.playlistId === p.id).length } });
  m.on('GET', GOOGLE, '/youtube/v3/playlists', req => {
    const e = bad(req); if (e) return e;
    return list(Object.values<any>(s().playlists).map(playlistRes));
  });
  m.on('POST', GOOGLE, '/youtube/v3/playlists', req => {
    const e = bad(req); if (e) return e;
    if (!req.body.snippet?.title) return gerr(400, 'playlistTitleRequired', 'Playlist title is required.');
    const p = { id: id('PL'), title: req.body.snippet.title, description: req.body.snippet.description ?? '', privacy: req.body.status?.privacyStatus ?? 'private', at: new Date().toISOString() };
    s().playlists[p.id] = p;
    return { json: playlistRes(p) };
  });
  m.on('PUT', GOOGLE, '/youtube/v3/playlists', req => {
    const e = bad(req); if (e) return e;
    const p = s().playlists[req.body.id];
    if (!p) return gerr(404, 'playlistNotFound', 'The playlist identified with the requests playlistId parameter cannot be found.');
    Object.assign(p, { title: req.body.snippet.title, description: req.body.snippet.description ?? p.description, privacy: req.body.status?.privacyStatus ?? p.privacy });
    return { json: playlistRes(p) };
  });
  m.on('DELETE', GOOGLE, '/youtube/v3/playlists', req => {
    const e = bad(req); if (e) return e;
    if (!s().playlists[req.query.id]) return gerr(404, 'playlistNotFound', 'The playlist identified with the requests playlistId parameter cannot be found.');
    delete s().playlists[req.query.id];
    return { status: 204 };
  });
  const itemRes = (i: any) => ({ kind: 'youtube#playlistItem', etag: id('e'), id: i.id, snippet: { publishedAt: i.at, channelId: s().channel.id, title: s().videos[i.videoId]?.snippet.title ?? '', description: '', thumbnails: thumbs(i.videoId), channelTitle: s().channel.snippet.title, playlistId: i.playlistId, position: i.position, resourceId: { kind: 'youtube#video', videoId: i.videoId } }, contentDetails: { videoId: i.videoId, videoPublishedAt: s().videos[i.videoId]?.snippet.publishedAt } });
  m.on('GET', GOOGLE, '/youtube/v3/playlistItems', req => {
    const e = bad(req); if (e) return e;
    const pid: string = req.query.playlistId;
    // The uploads playlist is implicit: every video on the channel, newest first.
    if (pid === `UU${s().channel.id.slice(2)}`) {
      const vids = Object.values<any>(s().videos).reverse();
      const max = Number(req.query.maxResults ?? 5);
      const start = Number(req.query.pageToken ?? 0);
      const page = vids.slice(start, start + max);
      return list(page.map((v, i) => itemRes({ id: `UU.${v.id}`, videoId: v.id, playlistId: pid, position: start + i, at: v.snippet.publishedAt })), start + max < vids.length ? { nextPageToken: String(start + max) } : {});
    }
    if (!s().playlists[pid]) return gerr(404, 'playlistNotFound', 'The playlist identified with the requests playlistId parameter cannot be found.');
    return list(Object.values<any>(s().playlistItems).filter(i => i.playlistId === pid).map(itemRes));
  });
  m.on('POST', GOOGLE, '/youtube/v3/playlistItems', req => {
    const e = bad(req); if (e) return e;
    const sn = req.body.snippet ?? {};
    if (!s().playlists[sn.playlistId]) return gerr(404, 'playlistNotFound', 'The playlist identified with the requests playlistId parameter cannot be found.');
    const videoId = sn.resourceId?.videoId;
    if (!s().videos[videoId]) return gerr(404, 'videoNotFound', 'Video not found.');
    if (Object.values<any>(s().playlistItems).some(i => i.playlistId === sn.playlistId && i.videoId === videoId)) return gerr(409, 'videoAlreadyInPlaylist', 'Video already in playlist.');
    const i = { id: id('PLI'), playlistId: sn.playlistId, videoId, position: sn.position ?? 0, at: new Date().toISOString() };
    s().playlistItems[i.id] = i;
    return { json: itemRes(i) };
  });
  m.on('DELETE', GOOGLE, '/youtube/v3/playlistItems', req => {
    const e = bad(req); if (e) return e;
    if (!s().playlistItems[req.query.id]) return gerr(404, 'playlistItemNotFound', 'The playlist item identified with the requests id parameter cannot be found.');
    delete s().playlistItems[req.query.id];
    return { status: 204 };
  });

  // ── reference data ──
  m.on('GET', GOOGLE, '/youtube/v3/videoCategories', req => {
    const e = bad(req); if (e) return e;
    return list([{ id: '1', title: 'Film & Animation' }, { id: '10', title: 'Music' }, { id: '22', title: 'People & Blogs' }, { id: '28', title: 'Science & Technology' }].map(c => ({ kind: 'youtube#videoCategory', etag: id('e'), id: c.id, snippet: { channelId: 'UCBR8-60-B28hp2BmDPdntcQ', title: c.title, assignable: true } })));
  });
  m.on('GET', GOOGLE, '/youtube/v3/i18nRegions', req => {
    const e = bad(req); if (e) return e;
    return list([['US', 'United States'], ['MY', 'Malaysia'], ['GB', 'United Kingdom']].map(([gl, name]) => ({ kind: 'youtube#i18nRegion', etag: id('e'), id: gl, snippet: { gl, name } })));
  });

  // ── Analytics ──
  m.on('GET', 'youtubeanalytics.googleapis.com', '/v2/reports', req => {
    if (!authed(req)) return { status: 401, json: { error: { code: 401, message: 'Invalid Credentials', errors: [{ reason: 'authError' }] } } };
    const cols = String(req.query.metrics ?? '').split(',').filter(Boolean);
    if (!req.query.startDate || !req.query.endDate || !cols.length) return gerr(400, 'badRequest', 'startDate, endDate and metrics are required.');
    const sample: Record<string, number> = { views: 910, likes: 64, comments: 9, shares: 21, subscribersGained: 17, estimatedMinutesWatched: 2300, averageViewDuration: 41 };
    return { json: { kind: 'youtubeAnalytics#resultTable', columnHeaders: cols.map(name => ({ name, columnType: 'METRIC', dataType: 'INTEGER' })), rows: [cols.map(c => sample[c] ?? 0)] } };
  });
}
