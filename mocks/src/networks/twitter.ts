import { consent, id, num, type MockRegistry, type MockRequest } from '../registry.js';

/**
 * X API v2 — x.com (consent) + api.x.com. Error bodies follow X's problem format
 * ({ title, detail, type, status }). Knobs in state.twitter: credits (0 → 402 CreditsDepleted),
 * rateLimitNext (next call answers 429 with x-rate-limit-reset), subscriptionType.
 */
export default function twitter(m: MockRegistry) {
  const s = () => m.ns('twitter', () => ({
    tokens: {} as Record<string, string>, refresh: {} as Record<string, string>, tweets: [] as any[], media: {} as Record<string, any>,
    retweets: [] as string[], likes: [] as string[], hidden: [] as string[], credits: 1000, rateLimitNext: false, subscriptionType: 'None',
  }));
  const H = 'api.x.com';
  const me = () => ({
    id: '1460000000000000001', name: 'Siar Test', username: 'siartest', profile_image_url: 'https://pbs.twimg.com/profile_images/1/siar_normal.png',
    description: 'Testing Siar', verified: false, verified_type: 'none', subscription_type: s().subscriptionType,
    public_metrics: { followers_count: 321, following_count: 45, tweet_count: s().tweets.filter((t: any) => !t.deleted).length, listed_count: 2, like_count: 9 },
  });
  const fan = { id: '99', name: 'A Fan', username: 'fan', profile_image_url: 'https://pbs.twimg.com/profile_images/2/fan_normal.png' };
  const problem = (status: number, title: string, detail: string, type = 'about:blank', extra: object = {}) => ({ status, json: { title, detail, type, status, ...extra } });
  const unauth = () => problem(401, 'Unauthorized', 'Unauthorized');
  const reset = () => String(Math.floor(Date.now() / 1000) + 900);
  /** Common gate: auth, injected rate limit, credits for billable writes. */
  const gate = (req: MockRequest, billable = false) => {
    if (s().rateLimitNext) { s().rateLimitNext = false; return { ...problem(429, 'Too Many Requests', 'Too Many Requests'), headers: { 'x-rate-limit-limit': '100', 'x-rate-limit-remaining': '0', 'x-rate-limit-reset': reset() } }; }
    if (!req.bearer || !s().tokens[req.bearer]) return unauth();
    if (billable && s().credits <= 0) return problem(402, 'CreditsDepleted', 'Your enrolled account [1] does not have any credits to fulfill this request.', 'https://api.twitter.com/2/problems/credits');
    return null;
  };
  const basicOk = (req: MockRequest) => /^Basic\s+/i.test(req.headers.authorization ?? '');
  const issue = () => {
    const access = id('xat_'); const refresh = id('xrt_');
    s().tokens[access] = me().id; s().refresh[refresh] = me().id;
    return { token_type: 'bearer', expires_in: 7200, access_token: access, scope: 'tweet.read tweet.write users.read offline.access media.write like.read like.write tweet.moderate.write', refresh_token: refresh };
  };
  const live = (tid: string) => s().tweets.find((t: any) => t.id === tid && !t.deleted);

  m.on('GET', 'x.com', '/i/oauth2/authorize', req => {
    if (req.query.code_challenge_method !== 'S256' || !req.query.code_challenge) return { status: 400, json: { error: 'invalid_request', error_description: 'PKCE is required' } };
    return consent(req);
  });
  m.on('POST', H, '/2/oauth2/token', req => {
    if (!basicOk(req)) return { status: 401, json: { error: 'unauthorized_client', error_description: 'Missing valid authorization header' } };
    if (req.body.grant_type === 'authorization_code') {
      if (!String(req.body.code ?? '').startsWith('mockcode_') || !req.body.code_verifier) return { status: 400, json: { error: 'invalid_request', error_description: 'Value passed for the authorization code was invalid.' } };
      return { json: issue() };
    }
    if (req.body.grant_type === 'refresh_token') {
      // Rotation: the old refresh token dies on use.
      if (!s().refresh[req.body.refresh_token]) return { status: 400, json: { error: 'invalid_request', error_description: 'Value passed for the token was invalid.' } };
      delete s().refresh[req.body.refresh_token];
      return { json: issue() };
    }
    return { status: 400, json: { error: 'unsupported_grant_type' } };
  });
  m.on('POST', H, '/2/oauth2/revoke', req => { delete s().tokens[req.body.token]; delete s().refresh[req.body.token]; return { json: { revoked: true } }; });
  m.on('GET', H, '/2/users/me', req => gate(req) ?? { json: { data: me() } });

  // ── media ──
  m.on('POST', H, '/2/media/upload', req => {
    const g = gate(req); if (g) return g;
    const file = req.form?.get('media') as File | null;
    if (!file || !req.body.media_category) return problem(400, 'Invalid Request', 'One or more parameters to your request was invalid.', 'https://api.twitter.com/2/problems/invalid-request', { errors: [{ message: 'media and media_category are required' }] });
    const mid = num();
    s().media[mid] = { id: mid, media_key: `3_${mid}`, category: req.body.media_category, size: file.size, state: 'succeeded' };
    return { json: { data: { id: mid, media_key: `3_${mid}`, size: file.size, expires_after_secs: 86400, image: { image_type: file.type, w: 64, h: 64 } } } };
  });
  m.on('POST', H, '/2/media/upload/initialize', req => {
    const g = gate(req); if (g) return g;
    const mid = num();
    s().media[mid] = { id: mid, media_key: `7_${mid}`, category: req.body.media_category, media_type: req.body.media_type, total: Number(req.body.total_bytes), received: 0, segments: [] as number[], state: 'init' };
    return { json: { data: { id: mid, media_key: `7_${mid}`, expires_after_secs: 86400 } } };
  });
  m.on('POST', H, '/2/media/upload/:id/append', req => {
    const g = gate(req); if (g) return g;
    const md = s().media[req.params.id]; if (!md) return problem(404, 'Not Found Error', 'Media not found', 'https://api.twitter.com/2/problems/resource-not-found');
    const chunk = req.form?.get('media') as File | null;
    md.received += chunk?.size ?? 0; md.segments.push(Number(req.body.segment_index));
    return { json: { data: { expires_at: Math.floor(Date.now() / 1000) + 86400 } } };
  });
  m.on('POST', H, '/2/media/upload/:id/finalize', req => {
    const g = gate(req); if (g) return g;
    const md = s().media[req.params.id]; if (!md) return problem(404, 'Not Found Error', 'Media not found', 'https://api.twitter.com/2/problems/resource-not-found');
    if (md.received !== md.total) return problem(400, 'Invalid Request', `File size mismatch: expected ${md.total}, received ${md.received}.`, 'https://api.twitter.com/2/problems/invalid-request', { errors: [{ message: 'InvalidMedia: total_bytes does not match uploaded bytes' }] });
    md.state = 'pending'; md.checks = 0;
    return { json: { data: { id: md.id, media_key: md.media_key, size: md.total, expires_after_secs: 86400, processing_info: { state: 'pending', check_after_secs: 1 } } } };
  });
  m.on('GET', H, '/2/media/upload', req => {
    const g = gate(req); if (g) return g;
    const md = s().media[req.query.media_id]; if (!md || req.query.command !== 'STATUS') return problem(404, 'Not Found Error', 'Media not found', 'https://api.twitter.com/2/problems/resource-not-found');
    // Video goes pending → in_progress → succeeded over two STATUS checks (or stays pending when `stuck`).
    if (md.state !== 'succeeded' && !md.stuck) { md.checks++; md.state = md.checks >= 2 ? 'succeeded' : 'in_progress'; }
    return { json: { data: { id: md.id, media_key: md.media_key, processing_info: md.state === 'succeeded' ? { state: 'succeeded', progress_percent: 100 } : { state: 'in_progress', check_after_secs: 1, progress_percent: 50 } } } };
  });
  m.on('POST', H, '/2/media/metadata', req => {
    const g = gate(req); if (g) return g;
    const md = s().media[req.body.id]; if (!md) return problem(404, 'Not Found Error', 'Media not found', 'https://api.twitter.com/2/problems/resource-not-found');
    md.alt_text = req.body.metadata?.alt_text?.text;
    return { json: { data: { id: md.id, associated_metadata: req.body.metadata } } };
  });

  // ── tweets ──
  m.on('POST', H, '/2/tweets', req => {
    const g = gate(req, true); if (g) return g;
    const b = req.body;
    const text: string = b.text ?? '';
    const ids: string[] = b.media?.media_ids ?? [];
    const invalid = (msg: string) => problem(400, 'Invalid Request', 'One or more parameters to your request was invalid.', 'https://api.twitter.com/2/problems/invalid-request', { errors: [{ parameters: {}, message: msg }] });
    if (!text && !ids.length) return invalid('$.text or $.media is required');
    for (const x of ids) { const md = s().media[x]; if (!md) return invalid(`Your media IDs are invalid.`); if (md.state !== 'succeeded') return invalid(`Media ${x} is not ready (processing).`); }
    if (b.poll && (b.poll.options?.length < 2 || b.poll.options?.length > 4)) return invalid('$.poll.options must contain 2 to 4 items');
    if (b.reply_settings && !['following', 'mentionedUsers', 'subscribers', 'verified'].includes(b.reply_settings)) return invalid(`$.reply_settings: '${b.reply_settings}' is not one of [following, mentionedUsers, subscribers, verified]`);
    if (b.reply && !s().tweets.find((t: any) => t.id === b.reply.in_reply_to_tweet_id)) return problem(403, 'Forbidden', 'Reply to this Tweet is not allowed because you have not been mentioned or otherwise engaged by the author of the Tweet you are replying to.');
    if (text && s().subscriptionType === 'None' && [...text].length > 280) return problem(403, 'Forbidden', 'Your Tweet text is too long. For more information on how X determines text length see https://github.com/twitter/twitter-text.');
    if (text && s().tweets.some((t: any) => !t.deleted && t.text === text)) return problem(403, 'Forbidden', 'You are not allowed to create a Tweet with duplicate content.');
    s().credits--;
    const tid = num();
    const parent = b.reply ? s().tweets.find((t: any) => t.id === b.reply.in_reply_to_tweet_id) : null;
    const t = {
      id: tid, text, author_id: me().id, created_at: new Date().toISOString(), conversation_id: parent ? parent.conversation_id : tid, edit_history_tweet_ids: [tid],
      media_ids: ids, poll: b.poll ?? null, quote_tweet_id: b.quote_tweet_id ?? null, reply_settings: b.reply_settings ?? 'everyone',
      for_super_followers_only: !!b.for_super_followers_only, made_with_ai: !!b.made_with_ai,
      referenced_tweets: parent ? [{ type: 'replied_to', id: parent.id }] : b.quote_tweet_id ? [{ type: 'quoted', id: b.quote_tweet_id }] : undefined,
      in_reply_to_tweet_id: parent?.id ?? null,
    };
    s().tweets.push(t);
    return { status: 201, json: { data: { id: tid, text, edit_history_tweet_ids: [tid] } } };
  });
  m.on('DELETE', H, '/2/tweets/:id', req => {
    const g = gate(req, true); if (g) return g;
    const t = live(req.params.id); if (!t) return problem(404, 'Not Found Error', `Could not find tweet with id: [${req.params.id}].`, 'https://api.twitter.com/2/problems/resource-not-found');
    t.deleted = true;
    return { json: { data: { deleted: true } } };
  });
  m.on('GET', H, '/2/tweets/search/recent', req => {
    const g = gate(req); if (g) return g;
    const conv = String(req.query.query ?? '').match(/conversation_id:(\d+)/)?.[1];
    const max = Number(req.query.max_results ?? 10);
    if (max < 10 || max > 100) return problem(400, 'Invalid Request', 'One or more parameters to your request was invalid.', 'https://api.twitter.com/2/problems/invalid-request', { errors: [{ message: 'The `max_results` query parameter value [' + max + '] is not between 10 and 100' }] });
    const own = s().tweets.filter((t: any) => !t.deleted && t.conversation_id === conv && t.id !== conv);
    const data = [...own, { id: '1800000000000000099', text: '@siartest Great post!', author_id: fan.id, conversation_id: conv, created_at: new Date().toISOString(), referenced_tweets: [{ type: 'replied_to', id: conv }], public_metrics: { like_count: 1, reply_count: 0, retweet_count: 0, quote_count: 0 } }];
    return { json: { data, includes: { users: [me(), fan] }, meta: { result_count: data.length, newest_id: data[0].id } } };
  });
  m.on('GET', H, '/2/tweets/:id', req => {
    const g = gate(req); if (g) return g;
    const t = live(req.params.id);
    if (!t) return { json: { errors: [{ value: req.params.id, detail: `Could not find tweet with id: [${req.params.id}].`, title: 'Not Found Error', resource_type: 'tweet', parameter: 'id', resource_id: req.params.id, type: 'https://api.twitter.com/2/problems/resource-not-found' }] } };
    const fields = String(req.query['tweet.fields'] ?? '');
    const old = Date.now() - new Date(t.created_at).getTime() > 30 * 86400_000 || t.forceOld;
    if (/non_public_metrics|organic_metrics/.test(fields) && old) return problem(400, 'Invalid Request', 'One or more parameters to your request was invalid.', 'https://api.twitter.com/2/problems/invalid-request', { errors: [{ message: 'Sorry, you are not authorized to access non_public_metrics on Tweets older than 30 days.' }] });
    const data: any = { id: t.id, text: t.text, created_at: t.created_at, public_metrics: { retweet_count: 2, reply_count: 1, like_count: 7, quote_count: 1, bookmark_count: 3, impression_count: 150 } };
    if (/non_public_metrics/.test(fields)) data.non_public_metrics = { impression_count: 160, url_link_clicks: 4, user_profile_clicks: 2 };
    if (/organic_metrics/.test(fields)) data.organic_metrics = { impression_count: 160, like_count: 7, reply_count: 1, retweet_count: 2, url_link_clicks: 4, user_profile_clicks: 2 };
    return { json: { data } };
  });
  m.on('PUT', H, '/2/tweets/:id/hidden', req => {
    const g = gate(req); if (g) return g;
    if (req.body.hidden) s().hidden.push(req.params.id); else s().hidden = s().hidden.filter((x: string) => x !== req.params.id);
    return { json: { data: { hidden: !!req.body.hidden } } };
  });
  m.on('GET', H, '/2/users/:id/tweets', req => {
    const g = gate(req); if (g) return g;
    const since = req.query.start_time ? new Date(req.query.start_time).getTime() : 0;
    const excl = String(req.query.exclude ?? '');
    let list = [...s().tweets].reverse().filter((t: any) => !t.deleted && new Date(t.created_at).getTime() >= since && !(excl.includes('replies') && t.in_reply_to_tweet_id));
    const start = Number(req.query.pagination_token ?? 0);
    const max = Number(req.query.max_results ?? 10);
    const page = list.slice(start, start + max);
    list = page.map((t: any) => ({ id: t.id, text: t.text, created_at: t.created_at, conversation_id: t.conversation_id, public_metrics: { retweet_count: 0, reply_count: 0, like_count: 1, quote_count: 0, bookmark_count: 0, impression_count: 10 } }));
    return { json: { data: list, meta: { result_count: list.length, next_token: start + max < s().tweets.length ? String(start + max) : undefined } } };
  });
  m.on('POST', H, '/2/users/:id/retweets', req => {
    const g = gate(req, true); if (g) return g;
    if (req.params.id !== me().id) return problem(403, 'Forbidden', 'You are not permitted to perform this action.');
    s().retweets.push(req.body.tweet_id);
    return { json: { data: { id: req.body.tweet_id, retweeted: true } } };
  });
  m.on('DELETE', H, '/2/users/:id/retweets/:tweetId', req => {
    const g = gate(req, true); if (g) return g;
    s().retweets = s().retweets.filter((x: string) => x !== req.params.tweetId);
    return { json: { data: { retweeted: false } } };
  });
  m.on('POST', H, '/2/users/:id/likes', req => { const g = gate(req, true); if (g) return g; s().likes.push(req.body.tweet_id); return { json: { data: { liked: true } } }; });
  m.on('DELETE', H, '/2/users/:id/likes/:tweetId', req => { const g = gate(req, true); if (g) return g; s().likes = s().likes.filter((x: string) => x !== req.params.tweetId); return { json: { data: { liked: false } } }; });
}
