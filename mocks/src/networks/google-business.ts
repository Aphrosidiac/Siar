import { id, type MockRegistry, type MockRequest, type MockResponse } from '../registry.js';

/**
 * Google Business Profile — the Business Profile APIs on their own hosts, answering as Google APIs do
 * (`{ error: { code, message, status, details } }`).
 *
 *   mybusinessaccountmanagement  /v1/accounts
 *   mybusinessbusinessinformation /v1/accounts/{a}/locations · /v1/locations/{l} (GET/PATCH, readMask/updateMask)
 *                                 · /attributes · /v1/attributes · /v1/categories(:batchGet)
 *   mybusiness (v4)              localPosts · reviews (+ /reply) · media · foodMenus
 *   businessprofileperformance   :fetchMultiDailyMetricsTimeSeries · searchkeywords/impressions/monthly
 *   mybusinessplaceactions       placeActionLinks
 *
 * Sign-in is Google's own (accounts.google.com / oauth2.googleapis.com), which the YouTube mock already
 * serves: its access tokens are accepted here. Fixtures: three locations in two accounts; the second one
 * ("Siar Bakery") is unverified, so posting to it answers FAILED_PRECONDITION. A post summary containing
 * "reject" ends REJECTED; one containing "slow" stays PROCESSING for its first read; a media sourceUrl
 * containing "bad" cannot be fetched. state.googleBusiness.quota = true answers 429 everywhere.
 * Repeated query parameters (dailyMetrics, names) collapse to the last value in this server's request model.
 * State: state.googleBusiness.{locations, posts, reviews, media, placeLinks, foodMenus}.
 */
export default function googleBusiness(m: MockRegistry) {
  const A1 = 'accounts/100000000000000001';
  const A2 = 'accounts/100000000000000002';
  const s = () => m.ns('googleBusiness', () => ({
    quota: false,
    accounts: [
      { name: A1, accountName: 'Siar Tester', type: 'PERSONAL', role: 'PRIMARY_OWNER', state: { status: 'VERIFIED' }, verificationState: 'VERIFIED', vettedState: 'NOT_VETTED' },
      { name: A2, accountName: 'Siar Group', type: 'LOCATION_GROUP', role: 'OWNER', state: { status: 'VERIFIED' }, verificationState: 'VERIFIED', vettedState: 'NOT_VETTED' },
    ] as any[],
    locations: [
      { account: A1, verified: true, doc: { name: 'locations/5000000001', title: 'Siar Coffee', languageCode: 'en', websiteUri: 'https://siar-coffee.example', phoneNumbers: { primaryPhone: '+60 3-1234 5678' },
        storefrontAddress: { regionCode: 'MY', postalCode: '50450', administrativeArea: 'Kuala Lumpur', locality: 'Kuala Lumpur', addressLines: ['1 Jalan Siar'] },
        categories: { primaryCategory: { name: 'categories/gcid:cafe', displayName: 'Cafe' }, additionalCategories: [] },
        regularHours: { periods: [{ openDay: 'MONDAY', openTime: { hours: 8 }, closeDay: 'MONDAY', closeTime: { hours: 18 } }] },
        profile: { description: 'Coffee, tested.' }, latlng: { latitude: 3.139, longitude: 101.6869 }, openInfo: { status: 'OPEN' },
        metadata: { placeId: 'ChIJsiarcoffee', mapsUri: 'https://maps.google.example/?cid=1', newReviewUri: 'https://search.google.example/writereview?placeid=ChIJsiarcoffee', hasVoiceOfMerchant: true }, serviceItems: [] as any[] } },
      { account: A1, verified: false, doc: { name: 'locations/5000000002', title: 'Siar Bakery', languageCode: 'en', websiteUri: 'https://siar-bakery.example', storefrontAddress: { regionCode: 'MY', locality: 'Petaling Jaya', addressLines: ['2 Jalan Roti'] },
        categories: { primaryCategory: { name: 'categories/gcid:bakery', displayName: 'Bakery' } }, metadata: { placeId: 'ChIJsiarbakery', hasVoiceOfMerchant: false }, serviceItems: [] as any[] } },
      { account: A2, verified: true, doc: { name: 'locations/5000000003', title: 'Siar Roastery', languageCode: 'en', storefrontAddress: { regionCode: 'MY', locality: 'Shah Alam', addressLines: ['3 Jalan Biji'] },
        categories: { primaryCategory: { name: 'categories/gcid:cafe', displayName: 'Cafe' } }, metadata: { placeId: 'ChIJsiarroastery', hasVoiceOfMerchant: true }, serviceItems: [] as any[] } },
    ] as { account: string; verified: boolean; doc: any }[],
    attributes: {} as Record<string, any[]>,
    posts: [] as any[], reviews: {} as Record<string, any[]>, media: [] as any[], placeLinks: [] as any[], foodMenus: {} as Record<string, any[]>,
  }));

  const gerr = (status: number, gstatus: string, message: string, extra: { reason?: string; field?: string; description?: string } = {}): MockResponse => ({
    status, json: { error: { code: status, message, status: gstatus, details: [
      ...(extra.reason ? [{ '@type': 'type.googleapis.com/google.rpc.ErrorInfo', reason: extra.reason, domain: 'googleapis.com' }] : []),
      ...(extra.field ? [{ '@type': 'type.googleapis.com/google.rpc.BadRequest', fieldViolations: [{ field: extra.field, description: extra.description ?? message }] }] : []),
    ] } },
  });
  const invalid = (message: string, field?: string, description?: string) => gerr(400, 'INVALID_ARGUMENT', message, { field, description });
  const notFound = (what = 'Requested entity was not found.') => gerr(404, 'NOT_FOUND', what);
  const guard = (req: MockRequest): MockResponse | null => {
    const tokens = (m.state.youtube?.tokens ?? {}) as Record<string, true>;
    if (!req.bearer || !(tokens[req.bearer] || m.isSeedToken(req.bearer))) return gerr(401, 'UNAUTHENTICATED', 'Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential.');
    if (s().quota) return gerr(429, 'RESOURCE_EXHAUSTED', "Quota exceeded for quota metric 'Requests' and limit 'Requests per minute' of service 'mybusinessaccountmanagement.googleapis.com'", { reason: 'RATE_LIMIT_EXCEEDED' });
    return null;
  };
  const page = <T,>(all: T[], req: MockRequest, key: string, extra: Record<string, unknown> = {}) => {
    const size = Number(req.query.pageSize ?? 20);
    const start = Number(req.query.pageToken ?? 0);
    const items = all.slice(start, start + size);
    return { json: { [key]: items, ...extra, ...(start + size < all.length ? { nextPageToken: String(start + size) } : {}) } };
  };
  const locOf = (name: string) => s().locations.find(l => l.doc.name === name);
  const v4Loc = (req: MockRequest) => { const l = locOf(`locations/${req.params.loc}`); return l && l.account === `accounts/${req.params.acct}` ? l : null; };
  const parent = (req: MockRequest) => `accounts/${req.params.acct}/locations/${req.params.loc}`;
  const mask = (v?: string) => String(v ?? '').split(',').map(x => x.trim()).filter(Boolean);
  const FIELDS = ['name', 'languageCode', 'storeCode', 'title', 'phoneNumbers', 'categories', 'storefrontAddress', 'websiteUri', 'regularHours', 'specialHours', 'serviceArea', 'labels', 'latlng', 'openInfo', 'metadata', 'profile', 'moreHours', 'serviceItems', 'relationshipData', 'adWordsLocationExtensions'];

  // ── Accounts
  m.on('GET', 'mybusinessaccountmanagement.googleapis.com', '/v1/accounts', req => guard(req) ?? page(s().accounts, req, 'accounts'));

  // ── Business Information
  const BI = 'mybusinessbusinessinformation.googleapis.com';
  m.on('GET', BI, '/v1/accounts/:acct/locations', req => {
    const bad = guard(req); if (bad) return bad;
    if (!req.query.readMask) return invalid('Request contains an invalid argument.', 'read_mask', 'read_mask is required');
    const rows = s().locations.filter(l => l.account === `accounts/${req.params.acct}`);
    if (!s().accounts.some(a => a.name === `accounts/${req.params.acct}`)) return notFound();
    const fields = mask(req.query.readMask);
    return page(rows.map(l => Object.fromEntries(Object.entries(l.doc).filter(([k]) => k === 'name' || fields.includes(k)))), req, 'locations');
  });
  m.on('GET', BI, '/v1/locations/:loc', req => {
    const bad = guard(req); if (bad) return bad;
    const l = locOf(`locations/${req.params.loc}`); if (!l) return notFound();
    const fields = mask(req.query.readMask);
    if (!fields.length) return invalid('Request contains an invalid argument.', 'read_mask', 'read_mask is required');
    const unknown = fields.find(f => !FIELDS.includes(f));
    if (unknown) return invalid(`Invalid field mask: ${unknown}`, 'read_mask', `unknown field ${unknown}`);
    return { json: Object.fromEntries(Object.entries(l.doc).filter(([k]) => k === 'name' || fields.includes(k))) };
  });
  m.on('PATCH', BI, '/v1/locations/:loc', req => {
    const bad = guard(req); if (bad) return bad;
    const l = locOf(`locations/${req.params.loc}`); if (!l) return notFound();
    const fields = mask(req.query.updateMask);
    if (!fields.length) return invalid('Request contains an invalid argument.', 'update_mask', 'update_mask is required');
    const unknown = fields.find(f => !FIELDS.includes(f) || f === 'name' || f === 'metadata');
    if (unknown) return invalid(`Invalid field mask: ${unknown}`, 'update_mask', `field ${unknown} cannot be updated`);
    const next = { ...l.doc };
    for (const f of fields) { if (req.body[f] === undefined) delete next[f]; else next[f] = req.body[f]; }
    if (req.query.validateOnly !== 'true') l.doc = next;
    return { json: next };
  });
  m.on('GET', BI, '/v1/locations/:loc/attributes', req => {
    const bad = guard(req); if (bad) return bad;
    if (!locOf(`locations/${req.params.loc}`)) return notFound();
    return { json: { name: `locations/${req.params.loc}/attributes`, attributes: s().attributes[req.params.loc] ?? [] } };
  });
  m.on('PATCH', BI, '/v1/locations/:loc/attributes', req => {
    const bad = guard(req); if (bad) return bad;
    if (!locOf(`locations/${req.params.loc}`)) return notFound();
    if (!req.query.attributeMask) return invalid('Request contains an invalid argument.', 'attribute_mask', 'attribute_mask is required');
    const cur = s().attributes[req.params.loc] ?? [];
    for (const attr of req.body.attributes ?? []) {
      const i = cur.findIndex(x => x.name === attr.name);
      if (i >= 0) cur[i] = attr; else cur.push(attr);
    }
    s().attributes[req.params.loc] = cur;
    return { json: { name: `locations/${req.params.loc}/attributes`, attributes: cur } };
  });
  m.on('GET', BI, '/v1/attributes', req => {
    const bad = guard(req); if (bad) return bad;
    const byLocation = !!req.query.parent;
    if (!byLocation && !(req.query.categoryName && req.query.regionCode && req.query.languageCode)) return invalid('Request contains an invalid argument.', 'parent', 'Either parent, or category_name with region_code and language_code, is required');
    if (byLocation && !locOf(req.query.parent)) return notFound();
    return page([
      { parent: 'attributes/wi_fi', valueType: 'ENUM', displayName: 'Wi-Fi', groupDisplayName: 'Amenities', valueMetadata: [{ value: 'free_wifi', displayName: 'Free Wi-Fi' }, { value: 'paid_wifi', displayName: 'Paid Wi-Fi' }] },
      { parent: 'attributes/has_outdoor_seating', valueType: 'BOOL', displayName: 'Outdoor seating', groupDisplayName: 'Amenities', valueMetadata: [{ value: true, displayName: 'Yes' }, { value: false, displayName: 'No' }] },
    ], req, 'attributes');
  });
  m.on('GET', BI, '/v1/categories*', req => {
    const bad = guard(req); if (bad) return bad;
    if (!req.query.regionCode || !req.query.languageCode) return invalid('Request contains an invalid argument.', 'region_code', 'region_code and language_code are required');
    const all = [{ name: 'categories/gcid:cafe', displayName: 'Cafe' }, { name: 'categories/gcid:bakery', displayName: 'Bakery' }, { name: 'categories/gcid:coffee_roasters', displayName: 'Coffee roasters' }];
    if (req.path.endsWith(':batchGet')) {
      const names = mask(req.query.names);
      if (!names.length) return invalid('Request contains an invalid argument.', 'names', 'names is required');
      return { json: { categories: all.filter(c => names.includes(c.name)) } };
    }
    const f = String(req.query.filter ?? '').replace(/^displayName=/, '').replace(/"/g, '').toLowerCase();
    return page(all.filter(c => !f || c.displayName.toLowerCase().includes(f)), req, 'categories');
  });

  // ── Performance
  const PERF = 'businessprofileperformance.googleapis.com';
  m.on('GET', PERF, '/v1/locations/:loc/searchkeywords/impressions/monthly', req => {
    const bad = guard(req); if (bad) return bad;
    if (!locOf(`locations/${req.params.loc}`)) return notFound();
    if (!req.query['monthlyRange.startMonth.year'] || !req.query['monthlyRange.endMonth.month']) return invalid('Request contains an invalid argument.', 'monthly_range', 'monthly_range is required');
    return page([
      { searchKeyword: 'coffee near me', insightsValue: { value: '320' } },
      { searchKeyword: 'cafe kuala lumpur', insightsValue: { value: '145' } },
      { searchKeyword: 'oat latte', insightsValue: { threshold: '15' } },
    ], req, 'searchKeywordsCounts');
  });
  m.on('GET', PERF, '/v1/locations/*', req => {
    const bad = guard(req); if (bad) return bad;
    const loc = req.path.match(/^\/v1\/locations\/([^/:]+)/)?.[1];
    if (!req.path.endsWith(':fetchMultiDailyMetricsTimeSeries') || !loc) return notFound();
    if (!locOf(`locations/${loc}`)) return notFound();
    const q = req.query;
    const need = ['startDate', 'endDate'].flatMap(k => ['year', 'month', 'day'].map(p => `dailyRange.${k}.${p}`));
    if (need.some(k => !q[k])) return invalid('Request contains an invalid argument.', 'daily_range', 'daily_range is required');
    const start = Date.UTC(+q['dailyRange.startDate.year'], +q['dailyRange.startDate.month'] - 1, +q['dailyRange.startDate.day']);
    const end = Date.UTC(+q['dailyRange.endDate.year'], +q['dailyRange.endDate.month'] - 1, +q['dailyRange.endDate.day']);
    const days = Math.floor((end - start) / 86_400_000) + 1;
    if (days < 1) return invalid('Request contains an invalid argument.', 'daily_range', 'end date is before start date');
    // dailyMetrics repeats in the request; this server sees only the last, so every metric is answered.
    const per: Record<string, number> = {
      BUSINESS_IMPRESSIONS_DESKTOP_MAPS: 10, BUSINESS_IMPRESSIONS_DESKTOP_SEARCH: 20, BUSINESS_IMPRESSIONS_MOBILE_MAPS: 30, BUSINESS_IMPRESSIONS_MOBILE_SEARCH: 40,
      WEBSITE_CLICKS: 5, CALL_CLICKS: 2, BUSINESS_DIRECTION_REQUESTS: 3, BUSINESS_CONVERSATIONS: 1, BUSINESS_BOOKINGS: 0, BUSINESS_FOOD_ORDERS: 0,
    };
    return { json: { multiDailyMetricTimeSeries: [{ dailyMetricTimeSeries: Object.entries(per).map(([dailyMetric, v]) => ({
      dailyMetric, timeSeries: { datedValues: Array.from({ length: days }, (_, i) => { const d = new Date(start + i * 86_400_000); return { date: { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() }, ...(v ? { value: String(v) } : {}) }; }) },
    })) }] } };
  });

  // ── Place Actions
  const PA = 'mybusinessplaceactions.googleapis.com';
  const TYPES = ['APPOINTMENT', 'ONLINE_APPOINTMENT', 'DINING_RESERVATION', 'FOOD_ORDERING', 'FOOD_DELIVERY', 'FOOD_TAKEOUT', 'SHOP_ONLINE'];
  m.on('GET', PA, '/v1/locations/:loc/placeActionLinks', req => {
    const bad = guard(req); if (bad) return bad;
    if (!locOf(`locations/${req.params.loc}`)) return notFound();
    return page(s().placeLinks.filter(p => p.loc === req.params.loc).map(p => p.link), req, 'placeActionLinks');
  });
  m.on('POST', PA, '/v1/locations/:loc/placeActionLinks', req => {
    const bad = guard(req); if (bad) return bad;
    if (!locOf(`locations/${req.params.loc}`)) return notFound();
    const b = req.body;
    if (!b.uri || !TYPES.includes(b.placeActionType)) return invalid('Request contains an invalid argument.', 'place_action_link', 'uri and a valid place_action_type are required');
    if (s().placeLinks.some(p => p.loc === req.params.loc && p.link.uri === b.uri && p.link.placeActionType === b.placeActionType)) return gerr(409, 'ALREADY_EXISTS', 'A place action link with this uri and type already exists.');
    const link = { name: `locations/${req.params.loc}/placeActionLinks/${id('pal')}`, uri: b.uri, placeActionType: b.placeActionType, isPreferred: !!b.isPreferred, isEditable: true, providerType: 'MERCHANT', createTime: new Date().toISOString(), updateTime: new Date().toISOString() };
    s().placeLinks.push({ loc: req.params.loc, link });
    return { json: link };
  });
  m.on('PATCH', PA, '/v1/locations/:loc/placeActionLinks/:pid', req => {
    const bad = guard(req); if (bad) return bad;
    const row = s().placeLinks.find(p => p.link.name === `locations/${req.params.loc}/placeActionLinks/${req.params.pid}`);
    if (!row) return notFound();
    const fields = mask(req.query.updateMask);
    if (!fields.length || fields.some(f => !['uri', 'placeActionType', 'isPreferred'].includes(f))) return invalid('Request contains an invalid argument.', 'update_mask', 'update_mask must name uri, placeActionType or isPreferred');
    for (const f of fields) if (req.body[f] !== undefined) row.link[f] = req.body[f];
    row.link.updateTime = new Date().toISOString();
    return { json: row.link };
  });
  m.on('DELETE', PA, '/v1/locations/:loc/placeActionLinks/:pid', req => {
    const bad = guard(req); if (bad) return bad;
    const i = s().placeLinks.findIndex(p => p.link.name === `locations/${req.params.loc}/placeActionLinks/${req.params.pid}`);
    if (i < 0) return notFound();
    s().placeLinks.splice(i, 1);
    return { json: {} };
  });

  // ── v4: local posts
  const V4 = 'mybusiness.googleapis.com';
  const base = '/v4/accounts/:acct/locations/:loc';
  const day = (d: any) => d && d.year && d.month && d.day;
  m.on('POST', V4, `${base}/localPosts`, req => {
    const bad = guard(req); if (bad) return bad;
    const l = v4Loc(req); if (!l) return notFound();
    if (!l.verified) return gerr(400, 'FAILED_PRECONDITION', 'Location is not verified. Verify the location to publish posts.');
    const b = req.body;
    const topic = b.topicType ?? 'STANDARD';
    if (!['STANDARD', 'EVENT', 'OFFER', 'ALERT'].includes(topic)) return invalid('Request contains an invalid argument.', 'topic_type', 'unknown topic type');
    if (b.summary && [...b.summary].length > 1500) return invalid('Request contains an invalid argument.', 'summary', 'summary must be at most 1500 characters');
    if (!b.summary && !b.media?.length) return invalid('Request contains an invalid argument.', 'summary', 'summary or media is required');
    if ((topic === 'EVENT' || topic === 'OFFER') && !(b.event?.title && day(b.event?.schedule?.startDate) && day(b.event?.schedule?.endDate))) return invalid('Request contains an invalid argument.', 'event', 'event title and schedule are required');
    if (b.callToAction && b.callToAction.actionType !== 'CALL' && !b.callToAction.url) return invalid('Request contains an invalid argument.', 'call_to_action.url', 'url is required for this action type');
    const photo = b.media?.[0];
    if (photo && String(photo.sourceUrl ?? '').includes('bad')) return invalid('The photo could not be fetched from the given sourceUrl.', 'media[0].source_url', 'The media could not be downloaded');
    const pid = id('lp');
    const post = {
      name: `${parent(req)}/localPosts/${pid}`, languageCode: b.languageCode ?? 'en', summary: b.summary, topicType: topic, callToAction: b.callToAction, event: b.event, offer: b.offer, alertType: b.alertType,
      media: photo ? [{ name: `${parent(req)}/media/${id('m')}`, mediaFormat: photo.mediaFormat, sourceUrl: photo.sourceUrl, googleUrl: `https://lh3.googleusercontent.example/${pid}` }] : undefined,
      createTime: new Date().toISOString(), updateTime: new Date().toISOString(), searchUrl: `https://local.google.example/place?id=${l.doc.metadata.placeId}&use=posts&lpsid=${pid}`,
      state: String(b.summary ?? '').includes('reject') ? 'REJECTED' : String(b.summary ?? '').includes('slow') ? 'PROCESSING' : 'LIVE', reads: 0,
    };
    s().posts.push(post);
    const { reads, ...wire } = post;
    return { json: wire };
  });
  m.on('GET', V4, `${base}/localPosts`, req => {
    const bad = guard(req); if (bad) return bad;
    if (!v4Loc(req)) return notFound();
    return page(s().posts.filter(p => p.name.startsWith(`${parent(req)}/`) && !p.deleted).reverse().map(({ reads, ...w }) => w), req, 'localPosts');
  });
  m.on('GET', V4, `${base}/localPosts/:pid`, req => {
    const bad = guard(req); if (bad) return bad;
    const p = s().posts.find(x => x.name === `${parent(req)}/localPosts/${req.params.pid}` && !x.deleted);
    if (!p) return notFound();
    if (p.state === 'PROCESSING' && ++p.reads >= 2) p.state = 'LIVE';
    const { reads, ...wire } = p;
    return { json: wire };
  });
  m.on('PATCH', V4, `${base}/localPosts/:pid`, req => {
    const bad = guard(req); if (bad) return bad;
    const p = s().posts.find(x => x.name === `${parent(req)}/localPosts/${req.params.pid}` && !x.deleted);
    if (!p) return notFound();
    const fields = mask(req.query.updateMask);
    if (!fields.length) return invalid('Request contains an invalid argument.', 'update_mask', 'update_mask is required');
    for (const f of fields) if (req.body[f] !== undefined) p[f] = req.body[f];
    p.updateTime = new Date().toISOString();
    const { reads, ...wire } = p;
    return { json: wire };
  });
  m.on('DELETE', V4, `${base}/localPosts/:pid`, req => {
    const bad = guard(req); if (bad) return bad;
    const p = s().posts.find(x => x.name === `${parent(req)}/localPosts/${req.params.pid}` && !x.deleted);
    if (!p) return notFound();
    p.deleted = true;
    return { json: {} };
  });

  // ── v4: reviews
  const STAR = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE'];
  const reviewsOf = (req: MockRequest) => (s().reviews[req.params.loc] ??= [
    { reviewId: 'rev_1', reviewer: { displayName: 'Bob Reviewer', profilePhotoUrl: 'https://lh3.googleusercontent.example/bob' }, starRating: 'FIVE', comment: 'Best flat white in town.', createTime: '2026-10-01T08:00:00Z', updateTime: '2026-10-01T08:00:00Z' },
    { reviewId: 'rev_2', reviewer: { displayName: 'Anon', isAnonymous: true }, starRating: 'ONE', createTime: '2026-10-02T08:00:00Z', updateTime: '2026-10-02T08:00:00Z' },
    { reviewId: 'rev_3', reviewer: { displayName: 'Carol Reviewer' }, starRating: 'THREE', comment: 'Okay.', createTime: '2026-10-03T08:00:00Z', updateTime: '2026-10-03T08:00:00Z', reviewReply: { comment: 'Thanks Carol!', updateTime: '2026-10-04T08:00:00Z' } },
  ].map(r => ({ ...r, name: `${parent(req)}/reviews/${r.reviewId}` })));
  m.on('GET', V4, `${base}/reviews`, req => {
    const bad = guard(req); if (bad) return bad;
    if (!v4Loc(req)) return notFound();
    const all = reviewsOf(req);
    const avg = all.reduce((t, r) => t + STAR.indexOf(r.starRating) + 1, 0) / all.length;
    return page([...all].sort((x, y) => y.updateTime.localeCompare(x.updateTime)), req, 'reviews', { averageRating: Math.round(avg * 10) / 10, totalReviewCount: all.length });
  });
  m.on('PUT', V4, `${base}/reviews/:rid/reply`, req => {
    const bad = guard(req); if (bad) return bad;
    if (!v4Loc(req)) return notFound();
    const r = reviewsOf(req).find(x => x.reviewId === req.params.rid);
    if (!r) return notFound();
    if (!req.body.comment) return invalid('Request contains an invalid argument.', 'comment', 'comment is required');
    r.reviewReply = { comment: req.body.comment, updateTime: new Date().toISOString() };
    return { json: r.reviewReply };
  });
  m.on('DELETE', V4, `${base}/reviews/:rid/reply`, req => {
    const bad = guard(req); if (bad) return bad;
    const r = v4Loc(req) && reviewsOf(req).find(x => x.reviewId === req.params.rid);
    if (!r || !r.reviewReply) return notFound();
    delete r.reviewReply;
    return { json: {} };
  });

  // ── v4: media
  const CATS = ['CATEGORY_UNSPECIFIED', 'COVER', 'PROFILE', 'LOGO', 'EXTERIOR', 'INTERIOR', 'PRODUCT', 'AT_WORK', 'FOOD_AND_DRINK', 'MENU', 'COMMON_AREA', 'ROOMS', 'TEAMS', 'ADDITIONAL'];
  m.on('POST', V4, `${base}/media`, req => {
    const bad = guard(req); if (bad) return bad;
    if (!v4Loc(req)) return notFound();
    const b = req.body;
    const cat = b.locationAssociation?.category ?? 'ADDITIONAL';
    if (!b.sourceUrl || !['PHOTO', 'VIDEO'].includes(b.mediaFormat) || !CATS.includes(cat)) return invalid('Request contains an invalid argument.', 'media_item', 'sourceUrl, mediaFormat and a valid category are required');
    if (String(b.sourceUrl).includes('bad')) return invalid('The photo could not be fetched from the given sourceUrl.', 'source_url', 'The media could not be downloaded');
    if (['COVER', 'PROFILE', 'LOGO'].includes(cat) && b.mediaFormat !== 'PHOTO') return invalid('Request contains an invalid argument.', 'media_format', `${cat} must be a photo`);
    const mid = id('med');
    const item = { name: `${parent(req)}/media/${mid}`, mediaFormat: b.mediaFormat, sourceUrl: b.sourceUrl, googleUrl: `https://lh3.googleusercontent.example/${mid}`, thumbnailUrl: `https://lh3.googleusercontent.example/${mid}=s200`, createTime: new Date().toISOString(), locationAssociation: { category: cat } };
    s().media.push(item);
    return { json: item };
  });
  m.on('GET', V4, `${base}/media`, req => {
    const bad = guard(req); if (bad) return bad;
    if (!v4Loc(req)) return notFound();
    const mine = s().media.filter(x => x.name.startsWith(`${parent(req)}/`) && !x.deleted);
    return page(mine, req, 'mediaItems', { totalMediaItemCount: mine.length });
  });
  m.on('DELETE', V4, `${base}/media/:mid`, req => {
    const bad = guard(req); if (bad) return bad;
    const it = s().media.find(x => x.name === `${parent(req)}/media/${req.params.mid}` && !x.deleted);
    if (!it) return notFound();
    it.deleted = true;
    return { json: {} };
  });

  // ── v4: food menus
  m.on('GET', V4, `${base}/foodMenus`, req => {
    const bad = guard(req); if (bad) return bad;
    if (!v4Loc(req)) return notFound();
    return { json: { name: `${parent(req)}/foodMenus`, menus: s().foodMenus[req.params.loc] ?? [] } };
  });
  m.on('PATCH', V4, `${base}/foodMenus`, req => {
    const bad = guard(req); if (bad) return bad;
    if (!v4Loc(req)) return notFound();
    if (req.query.updateMask !== 'menus') return invalid('Request contains an invalid argument.', 'update_mask', 'update_mask must be menus');
    s().foodMenus[req.params.loc] = req.body.menus ?? [];
    return { json: { name: `${parent(req)}/foodMenus`, menus: s().foodMenus[req.params.loc] } };
  });
}
