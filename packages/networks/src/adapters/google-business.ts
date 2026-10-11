/**
 * Google Business Profile — behind Google OAuth 2.0 (scope business.manage).
 *
 * Docs: https://developers.google.com/my-business
 *   OAuth            accounts.google.com/o/oauth2/v2/auth (access_type=offline, prompt=consent) →
 *                    oauth2.googleapis.com/token. Refreshes carry no new refresh token.
 *   Channels         accounts: mybusinessaccountmanagement v1 /accounts (1 request/min quota!) and, per account,
 *                    mybusinessbusinessinformation v1 /accounts/{a}/locations. A channel is a location;
 *                    its id is the v4 parent "accounts/{a}/locations/{l}" which every v4 call needs.
 *   Posts            mybusiness v4 {parent}/localPosts: topicType STANDARD | EVENT | OFFER | ALERT,
 *                    callToAction, media[{mediaFormat:PHOTO, sourceUrl}] (Google pulls the URL).
 *                    state LIVE | PROCESSING | REJECTED.
 *   Reviews          mybusiness v4 {parent}/reviews · PUT|DELETE …/reviews/{id}/reply
 *   Performance      businessprofileperformance v1 locations/{l}:fetchMultiDailyMetricsTimeSeries
 *                    · locations/{l}/searchkeywords/impressions/monthly
 *   Profile data     Business Information v1 (locations, attributes, categories, serviceItems),
 *                    Place Actions v1 (placeActionLinks), v4 foodMenus and media.
 * Google Business has no comments; reviews are handled through adapter.reviews.
 */
import { NetworkError } from '../lib/errors.js';
import { request, resetFrom, type RequestOptions } from '../lib/http.js';
import { authorizeUrl, expiresIn } from '../lib/oauth.js';
import { charCount, checkMedia, MB } from '../lib/validate.js';
import type {
  AccountProfile, AccountRuntime, Channel, HistoryPost, Issue, MiscHandler, NetworkAdapter, NetworkContext, PublishResult, ReviewInput, TokenSet,
} from '../types.js';

const ACCOUNTS = 'https://mybusinessaccountmanagement.googleapis.com/v1';
const INFO = 'https://mybusinessbusinessinformation.googleapis.com/v1';
const V4 = 'https://mybusiness.googleapis.com/v4';
const PERF = 'https://businessprofileperformance.googleapis.com/v1';
const PLACE_ACTIONS = 'https://mybusinessplaceactions.googleapis.com/v1';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const REVOKE_URL = 'https://oauth2.googleapis.com/revoke';
const SCOPES = ['https://www.googleapis.com/auth/business.manage'];

const SUMMARY_MAX = 1500;
const EVENT_TITLE_MAX = 58;
const COUPON_MAX = 58;
const TERMS_MAX = 5000;
const TOPICS = ['STANDARD', 'EVENT', 'OFFER', 'ALERT'];
const CTA_TYPES = ['BOOK', 'ORDER', 'SHOP', 'LEARN_MORE', 'SIGN_UP', 'CALL'];
const LANG_RE = /^[A-Za-z]{2,3}(-[A-Za-z0-9]{2,8})*$/;
const CHANNEL_RE = /^accounts\/[^/]+\/locations\/[^/]+$/;
const LOCATION_READ_MASK = 'name,title,storefrontAddress,websiteUri,metadata';
const LOCATION_FIELDS = ['name', 'languageCode', 'storeCode', 'title', 'phoneNumbers', 'categories', 'storefrontAddress', 'websiteUri', 'regularHours', 'specialHours', 'serviceArea', 'labels', 'latlng', 'openInfo', 'metadata', 'profile', 'moreHours', 'serviceItems'];
const LOCATION_WRITABLE = ['profile', 'websiteUri', 'phoneNumbers', 'categories', 'storefrontAddress', 'regularHours', 'specialHours', 'moreHours', 'openInfo', 'serviceArea', 'latlng'];
const IMPRESSION_METRICS = ['BUSINESS_IMPRESSIONS_DESKTOP_MAPS', 'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH', 'BUSINESS_IMPRESSIONS_MOBILE_MAPS', 'BUSINESS_IMPRESSIONS_MOBILE_SEARCH'];
const ACTION_METRICS = ['WEBSITE_CLICKS', 'CALL_CLICKS', 'BUSINESS_DIRECTION_REQUESTS', 'BUSINESS_CONVERSATIONS', 'BUSINESS_BOOKINGS', 'BUSINESS_FOOD_ORDERS'];
const STARS: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

// ───────────────────────────── errors ─────────────────────────────

/** Google API errors: { error: { code, message, status, details: [{ reason, fieldViolations }] } } — or OAuth style { error: 'invalid_grant' }. */
function mapError(status: number, body: any, res: Response): NetworkError | undefined {
  if (typeof body?.error === 'string') {
    const msg = body.error_description ?? body.error;
    if (['invalid_grant', 'invalid_token', 'unauthorized_client'].includes(body.error)) return new NetworkError('TOKEN_INVALID', msg, { httpStatus: status, meta: body });
    if (body.error === 'invalid_client') return new NetworkError('NOT_CONFIGURED', msg, { httpStatus: status, meta: body, userFacingMessage: 'The Google OAuth client for Siar is misconfigured.' });
    return undefined;
  }
  const e = body?.error;
  if (!e || typeof e !== 'object') return undefined;
  const msg: string = e.message ?? `Google returned HTTP ${status}`;
  const gstatus: string = e.status ?? '';
  const details: any[] = Array.isArray(e.details) ? e.details : [];
  const reason: string = details.find(d => d?.reason)?.reason ?? e.errors?.[0]?.reason ?? '';
  const violation = details.flatMap(d => d?.fieldViolations ?? [])[0];
  const opts = { httpStatus: status, meta: body, userFacingMessage: violation ? `${msg} (${violation.field}: ${violation.description})` : undefined };

  if (status === 401 || gstatus === 'UNAUTHENTICATED') return new NetworkError('TOKEN_INVALID', msg, opts);
  if (['SERVICE_DISABLED', 'accessNotConfigured'].includes(reason)) {
    return new NetworkError('NOT_CONFIGURED', msg, { ...opts, userFacingMessage: 'The Business Profile APIs are not enabled for the Google Cloud project behind Siar.' });
  }
  if (status === 429 || gstatus === 'RESOURCE_EXHAUSTED' || ['RATE_LIMIT_EXCEEDED', 'rateLimitExceeded', 'RESOURCE_EXHAUSTED'].includes(reason)) {
    // Quotas are per minute; without a Retry-After the next window opens within a minute.
    return new NetworkError('RATE_LIMITED', msg, { ...opts, rateLimitResetAt: resetFrom(res) ?? new Date(Date.now() + 60_000) });
  }
  if (gstatus === 'PERMISSION_DENIED' || status === 403) {
    const scope = reason === 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' ? 'Siar needs the business.manage permission. Reconnect and allow it.' : undefined;
    return new NetworkError('PERMISSION', msg, { ...opts, userFacingMessage: scope ?? opts.userFacingMessage });
  }
  if (gstatus === 'NOT_FOUND' || status === 404) return new NetworkError('NOT_FOUND', msg, opts);
  if (gstatus === 'ALREADY_EXISTS' || status === 409) return new NetworkError('DUPLICATE', msg, opts);
  if (gstatus === 'FAILED_PRECONDITION') return new NetworkError(/verif/i.test(msg) ? 'PERMISSION' : 'VALIDATION', msg, opts);
  if (gstatus === 'INVALID_ARGUMENT' || status === 400) {
    const media = /photo|media|sourceUrl|image|video/i.test(`${msg} ${violation?.field ?? ''}`);
    return new NetworkError(media ? 'MEDIA_INVALID' : 'VALIDATION', msg, opts);
  }
  if (['UNAVAILABLE', 'INTERNAL', 'DEADLINE_EXCEEDED'].includes(gstatus) || status >= 500) return new NetworkError('NETWORK_UNAVAILABLE', msg, opts);
  return undefined;
}

const api = <T = any>(ctx: NetworkContext, a: { token: TokenSet }, url: string, opts: RequestOptions = {}) =>
  request<T>(ctx, url, { bearer: a.token.accessToken, mapError, ...opts });

/** A URL with repeated query parameters (dailyMetrics=…&dailyMetrics=…). */
const multi = (base: string, params: [string, string | number | undefined | null][]) => {
  const u = new URL(base);
  for (const [k, v] of params) if (v !== undefined && v !== null && v !== '') u.searchParams.append(k, String(v));
  return u.toString();
};

// ───────────────────────────── helpers ─────────────────────────────

const channelOf = (a: AccountRuntime): string => {
  const id = a.channelId ?? a.externalId;
  if (!id || !CHANNEL_RE.test(id)) throw new NetworkError('VALIDATION', 'Pick a Google Business location (channel) for this account first.');
  return id;
};
/** "accounts/1/locations/2" → "locations/2" */
const locationOf = (a: AccountRuntime) => channelOf(a).split('/').slice(2).join('/');
const lastSegment = (name: string) => name.split('/').pop() ?? name;
const fullName = (a: AccountRuntime, kind: string, id: string) => (id.startsWith('accounts/') || id.startsWith('locations/') ? id : `${channelOf(a)}/${kind}/${id}`);
const list = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : typeof v === 'string' && v ? v.split(',').map(s => s.trim()).filter(Boolean) : []);

const addressLine = (l: any) => {
  const ad = l?.storefrontAddress;
  return ad ? [...(ad.addressLines ?? []), ad.locality, ad.administrativeArea, ad.postalCode].filter(Boolean).join(', ') : null;
};
const toChannel = (accountName: string, accountLabel: string | null, l: any): Channel => ({
  id: `${accountName}/${l.name}`, name: l.title ?? null, username: null, address: addressLine(l) || null, avatarUrl: null,
  metadata: {
    accountName, accountDisplayName: accountLabel, locationName: l.name, websiteUri: l.websiteUri ?? null, placeId: l.metadata?.placeId ?? null,
    mapsUri: l.metadata?.mapsUri ?? null, newReviewUri: l.metadata?.newReviewUri ?? null, verified: l.metadata?.hasVoiceOfMerchant ?? null,
  },
});

async function listAccounts(ctx: NetworkContext, a: { token: TokenSet }): Promise<any[]> {
  const out: any[] = [];
  let pageToken: string | undefined;
  for (let i = 0; i < 10; i++) {
    const r = await api(ctx, a, `${ACCOUNTS}/accounts`, { query: { pageSize: 20, pageToken } });
    out.push(...(r?.accounts ?? []));
    pageToken = r?.nextPageToken;
    if (!pageToken) break;
  }
  return out;
}

async function listAllChannels(ctx: NetworkContext, a: { token: TokenSet }, accounts: any[]): Promise<Channel[]> {
  const out: Channel[] = [];
  for (const acct of accounts) {
    let pageToken: string | undefined;
    for (let i = 0; i < 10; i++) {
      const r = await api(ctx, a, `${INFO}/${acct.name}/locations`, { query: { readMask: LOCATION_READ_MASK, pageSize: 100, pageToken } });
      out.push(...(r?.locations ?? []).map((l: any) => toChannel(acct.name, acct.accountName ?? null, l)));
      pageToken = r?.nextPageToken;
      if (!pageToken) break;
    }
  }
  return out;
}

const profileOf = (acct: any, channels: Channel[]): AccountProfile => {
  const id = lastSegment(acct.name);
  return {
    externalId: acct.name, providerPageId: id, username: null, displayName: acct.accountName ?? null, avatarUrl: null, bio: null,
    userId: id, userUsername: null, userDisplayName: acct.accountName ?? null, channels,
  };
};

async function tokenRequest(ctx: NetworkContext, form: Record<string, string>, prev?: TokenSet): Promise<TokenSet> {
  const tok = await request(ctx, TOKEN_URL, { form: { ...form, client_id: String(ctx.credentials.clientId ?? ''), client_secret: String(ctx.credentials.clientSecret ?? '') }, mapError });
  return {
    accessToken: tok.access_token,
    // Google only returns a refresh token on the consent exchange; refreshes keep the one we have.
    refreshToken: tok.refresh_token ?? prev?.refreshToken ?? null,
    expiresAt: expiresIn(tok.expires_in, ctx.now()),
    scopes: String(tok.scope ?? SCOPES.join(' ')).split(/\s+/),
    secrets: { ...(prev?.secrets ?? {}) },
  };
}

const ymd = (d: Date) => ({ year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() });
const hms = (d: Date) => ({ hours: d.getUTCHours(), minutes: d.getUTCMinutes(), seconds: d.getUTCSeconds(), nanos: 0 });
const monthParts = (m: string) => { const [y, mo] = m.split('-').map(Number); return { year: y, month: mo }; };
const isUrl = (s?: string | null) => { try { return !!s && ['http:', 'https:'].includes(new URL(s).protocol); } catch { return false; } };
const permalinkOf = (p: any): string | null => p?.searchUrl ?? null;

function postBody(d: Record<string, any>, m?: { url: string }) {
  const topic: string = d.topicType ?? 'STANDARD';
  const body: Record<string, unknown> = { languageCode: d.languageCode || 'en', topicType: topic };
  if (d.text) body.summary = d.text;
  if (d.callToActionType) body.callToAction = d.callToActionType === 'CALL' ? { actionType: 'CALL' } : { actionType: d.callToActionType, url: d.callToActionUrl };
  if (m) body.media = [{ mediaFormat: 'PHOTO', sourceUrl: m.url }];
  if (topic === 'EVENT' || topic === 'OFFER') {
    const start = new Date(d.eventStartDate); const end = new Date(d.eventEndDate);
    body.event = { title: d.eventTitle, schedule: { startDate: ymd(start), startTime: hms(start), endDate: ymd(end), endTime: hms(end) } };
  }
  if (topic === 'OFFER') {
    body.offer = { couponCode: d.offerCouponCode || undefined, redeemOnlineUrl: d.offerRedeemOnlineUrl || undefined, termsConditions: d.offerTermsConditions || undefined };
  }
  if (topic === 'ALERT') body.alertType = d.alertType ?? 'COVID_19';
  return body;
}

function resultOf(p: any, ref?: string): PublishResult {
  if (p?.state === 'REJECTED') throw new NetworkError('CONTENT_REJECTED', 'Google rejected the post: it does not meet the Business Profile content policy.', { meta: p });
  if (p?.state === 'PROCESSING') return { status: 'PROCESSING', pendingRef: ref ?? p.name, pollAfterMs: 10_000, externalData: { name: p.name } };
  return { status: 'POSTED', externalPostId: p.name, externalAlternatePostId: lastSegment(p.name), permalink: permalinkOf(p), externalData: { topicType: p.topicType, state: p.state ?? 'LIVE' } };
}

const sumSeries = (res: any): Record<string, number> => {
  const out: Record<string, number> = {};
  for (const grp of res?.multiDailyMetricTimeSeries ?? []) {
    for (const s of grp?.dailyMetricTimeSeries ?? []) {
      out[s.dailyMetric] = (s.timeSeries?.datedValues ?? []).reduce((t: number, v: any) => t + Number(v?.value ?? 0), 0);
    }
  }
  return out;
};

const toReview = (r: any): ReviewInput => ({
  externalId: String(r.reviewId ?? lastSegment(r.name ?? '')),
  reviewerName: r.reviewer?.isAnonymous ? 'A Google user' : r.reviewer?.displayName ?? null,
  reviewerAvatarUrl: r.reviewer?.profilePhotoUrl ?? null,
  rating: STARS[r.starRating] ?? null,
  text: r.comment ?? null,
  replyText: r.reviewReply?.comment ?? null,
  replyUpdatedAt: r.reviewReply?.updateTime ? new Date(r.reviewReply.updateTime) : null,
  publishedAt: r.createTime ? new Date(r.createTime) : null,
  platformData: { name: r.name ?? null, updateTime: r.updateTime ?? null, isAnonymous: !!r.reviewer?.isAnonymous },
});

// ───────────────────────────── misc operations ─────────────────────────────

const locationPatch = async (ctx: NetworkContext, a: AccountRuntime, mask: string[], payload: Record<string, unknown>, validateOnly?: boolean) =>
  api(ctx, a, `${INFO}/${locationOf(a)}`, { method: 'PATCH', query: { updateMask: mask.join(','), validateOnly: validateOnly ? 'true' : undefined }, json: payload });

const placeLinkName = (a: AccountRuntime, name: string) => (name.startsWith('locations/') ? name : `${locationOf(a)}/placeActionLinks/${name}`);

const misc: Record<string, MiscHandler> = {
  'misc.google_business.getLocation': async (ctx, a, { query }) => {
    const fields = list(query.fields);
    return api(ctx, a, `${INFO}/${locationOf(a)}`, { query: { readMask: (fields.length ? fields : LOCATION_FIELDS).join(',') } });
  },
  'misc.google_business.updateLocation': async (ctx, a, { body }) => {
    const mask = LOCATION_WRITABLE.filter(k => body[k] !== undefined);
    if (!mask.length) throw new NetworkError('VALIDATION', 'Nothing to update: send at least one location field.');
    const payload = Object.fromEntries(mask.filter(k => body[k] !== null).map(k => [k, body[k]]));
    return locationPatch(ctx, a, mask, payload, !!body.validateOnly);
  },
  'misc.google_business.updateHours': async (ctx, a, { body }) => {
    const fields = list(body.fields);
    if (!fields.length) throw new NetworkError('VALIDATION', 'fields is required: regularHours, specialHours and/or moreHours.');
    // A field named in the mask but absent from the body is cleared.
    const payload = Object.fromEntries(fields.filter(k => body[k] !== undefined && body[k] !== null).map(k => [k, body[k]]));
    return locationPatch(ctx, a, fields, payload, !!body.validateOnly);
  },
  'misc.google_business.getAttributes': async (ctx, a) => {
    const r = await api(ctx, a, `${INFO}/${locationOf(a)}/attributes`);
    return { name: r?.name ?? `${locationOf(a)}/attributes`, attributes: r?.attributes ?? [] };
  },
  'misc.google_business.updateAttributes': async (ctx, a, { body }) => {
    const attributes: any[] = body.attributes ?? [];
    const mask = body.attributeMask || attributes.map(x => x.name).join(',');
    if (!mask) throw new NetworkError('VALIDATION', 'attributeMask or attributes is required.');
    const r = await api(ctx, a, `${INFO}/${locationOf(a)}/attributes`, { method: 'PATCH', query: { attributeMask: mask }, json: { name: `${locationOf(a)}/attributes`, attributes } });
    return { name: r?.name ?? `${locationOf(a)}/attributes`, attributes: r?.attributes ?? [] };
  },
  'misc.google_business.listAvailableAttributes': async (ctx, a, { query }) => {
    const languageCode = query.languageCode || 'en';
    if (query.regionCode) {
      // Attributes available for the location's primary category in a region.
      const loc = await api(ctx, a, `${INFO}/${locationOf(a)}`, { query: { readMask: 'categories' } });
      const categoryName = loc?.categories?.primaryCategory?.name;
      if (!categoryName) throw new NetworkError('VALIDATION', 'This location has no primary category; set one before looking attributes up by region.');
      const r = await api(ctx, a, `${INFO}/attributes`, { query: { categoryName, regionCode: query.regionCode, languageCode, pageSize: query.pageSize, pageToken: query.pageToken } });
      return { attributes: r?.attributes ?? [], nextPageToken: r?.nextPageToken, lookup: { by: 'category', categoryName, regionCode: query.regionCode, languageCode } };
    }
    const r = await api(ctx, a, `${INFO}/attributes`, { query: { parent: locationOf(a), languageCode, pageSize: query.pageSize, pageToken: query.pageToken } });
    return { attributes: r?.attributes ?? [], nextPageToken: r?.nextPageToken, lookup: { by: 'location', languageCode } };
  },
  'misc.google_business.listSearchKeywords': async (ctx, a, { query }) => {
    const s = monthParts(String(query.startMonth)); const e = monthParts(String(query.endMonth));
    const r = await api(ctx, a, multi(`${PERF}/${locationOf(a)}/searchkeywords/impressions/monthly`, [
      ['monthlyRange.startMonth.year', s.year], ['monthlyRange.startMonth.month', s.month], ['monthlyRange.endMonth.year', e.year], ['monthlyRange.endMonth.month', e.month],
      ['pageSize', query.pageSize], ['pageToken', query.pageToken],
    ]));
    return {
      location: locationOf(a), range: { startMonth: String(query.startMonth), endMonth: String(query.endMonth) },
      searchKeywords: (r?.searchKeywordsCounts ?? []).map((k: any) => ({
        searchKeyword: k.searchKeyword, value: k.insightsValue?.value !== undefined ? Number(k.insightsValue.value) : null, threshold: k.insightsValue?.threshold !== undefined ? Number(k.insightsValue.threshold) : null,
      })),
      nextPageToken: r?.nextPageToken,
    };
  },
  'misc.google_business.listCategories': async (ctx, a, { query }) => {
    const names = list(query.names);
    const base: [string, string | number | undefined][] = [['regionCode', query.regionCode], ['languageCode', query.languageCode], ['view', query.view ?? 'BASIC']];
    const r = names.length
      ? await api(ctx, a, multi(`${INFO}/categories:batchGet`, [...names.map(n => ['names', n] as [string, string]), ...base]))
      : await api(ctx, a, multi(`${INFO}/categories`, [...base, ['filter', query.filter], ['pageSize', query.pageSize ?? 50], ['pageToken', query.pageToken]]));
    return { categories: r?.categories ?? [], nextPageToken: r?.nextPageToken };
  },
  'misc.google_business.getServiceList': async (ctx, a) => {
    const r = await api(ctx, a, `${INFO}/${locationOf(a)}`, { query: { readMask: 'name,serviceItems' } });
    return { name: r?.name ?? locationOf(a), serviceItems: r?.serviceItems ?? [] };
  },
  'misc.google_business.updateServiceList': async (ctx, a, { body }) => {
    const r = await locationPatch(ctx, a, ['serviceItems'], { serviceItems: body.serviceItems ?? [] });
    return { name: r?.name ?? locationOf(a), serviceItems: r?.serviceItems ?? body.serviceItems ?? [] };
  },
  'misc.google_business.getFoodMenus': async (ctx, a, { query }) => {
    const fields = list(query.fields);
    const r = await api(ctx, a, `${V4}/${channelOf(a)}/foodMenus`, { query: { readMask: fields.length ? fields.join(',') : undefined } });
    return { name: r?.name ?? `${channelOf(a)}/foodMenus`, menus: r?.menus ?? [] };
  },
  'misc.google_business.updateFoodMenus': async (ctx, a, { body }) => {
    const r = await api(ctx, a, `${V4}/${channelOf(a)}/foodMenus`, { method: 'PATCH', query: { updateMask: 'menus' }, json: { name: `${channelOf(a)}/foodMenus`, menus: body.menus ?? [] } });
    return { name: r?.name ?? `${channelOf(a)}/foodMenus`, menus: r?.menus ?? [] };
  },
  'misc.google_business.listPlaceActionLinks': async (ctx, a, { query }) => {
    const r = await api(ctx, a, `${PLACE_ACTIONS}/${locationOf(a)}/placeActionLinks`, { query: { pageSize: query.pageSize, pageToken: query.pageToken } });
    return { placeActionLinks: r?.placeActionLinks ?? [], nextPageToken: r?.nextPageToken };
  },
  'misc.google_business.createPlaceActionLink': async (ctx, a, { body }) => {
    const { uri, placeActionType, isPreferred } = body.placeActionLink ?? {};
    return api(ctx, a, `${PLACE_ACTIONS}/${locationOf(a)}/placeActionLinks`, { method: 'POST', json: { uri, placeActionType, isPreferred } });
  },
  'misc.google_business.updatePlaceActionLink': async (ctx, a, { body }) => {
    const fields = list(body.fields);
    const link = body.placeActionLink ?? {};
    return api(ctx, a, `${PLACE_ACTIONS}/${placeLinkName(a, String(body.name))}`, {
      method: 'PATCH', query: { updateMask: fields.join(',') }, json: Object.fromEntries(fields.filter(f => link[f] !== undefined).map(f => [f, link[f]])),
    });
  },
  'misc.google_business.deletePlaceActionLink': async (ctx, a, { body }) => {
    await api(ctx, a, `${PLACE_ACTIONS}/${placeLinkName(a, String(body.name))}`, { method: 'DELETE' });
    return { success: true };
  },
  'misc.google_business.addMedia': async (ctx, a, { body, lookup }) => {
    const m = await lookup.upload(body.uploadId);
    const category = body.category ?? 'ADDITIONAL';
    if (m.type === 'video' && ['COVER', 'PROFILE', 'LOGO'].includes(category)) throw new NetworkError('VALIDATION', `${category} must be a photo.`);
    if (m.type === 'document') throw new NetworkError('VALIDATION', 'Google Business media must be a photo or a video.');
    return api(ctx, a, `${V4}/${channelOf(a)}/media`, {
      method: 'POST', json: { mediaFormat: m.type === 'video' ? 'VIDEO' : 'PHOTO', locationAssociation: { category }, sourceUrl: m.url },
    });
  },
  'misc.google_business.listMedia': async (ctx, a, { query }) => {
    const r = await api(ctx, a, `${V4}/${channelOf(a)}/media`, { query: { pageSize: query.pageSize, pageToken: query.pageToken } });
    return { mediaItems: r?.mediaItems ?? [], nextPageToken: r?.nextPageToken, totalMediaItemCount: r?.totalMediaItemCount };
  },
  'misc.google_business.deleteMedia': async (ctx, a, { body }) => {
    await api(ctx, a, `${V4}/${fullName(a, 'media', String(body.mediaName))}`, { method: 'DELETE' });
    return { success: true };
  },
  'misc.google_business.deletePost': async (ctx, a, { body, lookup }) => {
    const p = await lookup.post(body.postId);
    await googleBusiness.deletePost!(ctx, a, p.externalPostId);
    return { success: true };
  },
};

// ───────────────────────────── adapter ─────────────────────────────

export const googleBusiness: NetworkAdapter = {
  type: 'GOOGLE_BUSINESS',
  displayName: 'Google Business Profile',
  credentialKeys: ['clientId', 'clientSecret'],
  scopes: SCOPES,
  capabilities: {
    connect: 'oauth2', channels: 'required', postTypes: ['STANDARD', 'EVENT', 'OFFER', 'ALERT'],
    comments: false, firstComment: false, editPost: true, deletePost: true, editComment: false, deleteComment: false,
    commentImport: false, commentActions: [],
    accountAnalytics: true, postAnalytics: false, historyImport: true, messaging: false, metered: false,
  },
  limits: {
    textMax: SUMMARY_MAX,
    commentMax: null,
    media: {
      // A local post carries one photo; Google fetches it from sourceUrl.
      maxItems: 1,
      image: { mimes: ['image/jpeg', 'image/png'], maxBytes: 5 * MB, minWidth: 400 },
    },
  },
  errorReference: [
    { code: '401 UNAUTHENTICATED', message: 'Request had invalid authentication credentials.', meaning: 'The access token expired or the user revoked access in their Google account.', fix: 'Siar refreshes automatically; if it still fails, reconnect the Google Business account.' },
    { code: '403 SERVICE_DISABLED', message: 'My Business Business Information API has not been used in project … before or it is disabled.', meaning: 'A Business Profile API is not enabled for the Google Cloud project behind Siar.', fix: 'Enable the Business Profile APIs in the Google Cloud console (and request access to them).' },
    { code: '403 ACCESS_TOKEN_SCOPE_INSUFFICIENT', message: 'Request had insufficient authentication scopes.', meaning: 'The user did not grant the business.manage permission.', fix: 'Reconnect and allow every permission.' },
    { code: '429 RATE_LIMIT_EXCEEDED', message: "Quota exceeded for quota metric 'Requests' and limit 'Requests per minute' of service 'mybusinessaccountmanagement.googleapis.com'.", meaning: 'Business Profile APIs have strict per-minute quotas (the Accounts API allows 1 request per minute).', fix: 'Siar retries after a minute. Pick a location once instead of re-listing accounts.' },
    { code: '400 FAILED_PRECONDITION', message: 'Location is not verified.', meaning: 'Posts, reviews and media need a verified location.', fix: 'Verify the location in the Google Business Profile manager, then retry.' },
    { code: '400 INVALID_ARGUMENT (summary)', message: 'Request contains an invalid argument.', meaning: 'A post field failed validation: summary over 1,500 characters, a phone number or link in the text, or an event without a schedule.', fix: 'Read the field named in the error and correct it; EVENT and OFFER posts need a title and start and end dates.' },
    { code: '400 INVALID_ARGUMENT (media)', message: 'The photo could not be fetched or is too small.', meaning: 'Google could not download sourceUrl, or the photo is under 400 × 300 px or over 5 MB.', fix: 'Use a JPEG or PNG between 10 KB and 5 MB that is at least 400 × 300 px.' },
    { code: '404 NOT_FOUND', message: 'Requested entity was not found.', meaning: 'The location, post or review was deleted, or the user lost access to it.', fix: 'Reconnect and pick the location again.' },
    { code: 'state REJECTED', message: 'LocalPost.state = REJECTED', meaning: 'Google accepted the post and then removed it for breaking the content policy.', fix: 'Edit the text or photo (no phone numbers or promotional claims it cannot verify) and post again.' },
    { code: 'invalid_grant', message: 'Token has been expired or revoked.', meaning: 'The refresh token is no longer valid (password change, access removed, or 6 months without use).', fix: 'Reconnect the Google Business account.' },
  ],

  async authorize(ctx, input) {
    return {
      url: authorizeUrl(AUTH_URL, {
        client_id: String(ctx.credentials.clientId ?? ''), redirect_uri: ctx.redirectUri, response_type: 'code', scope: SCOPES.join(' '), state: input.state,
        access_type: 'offline', prompt: 'consent', include_granted_scopes: 'true', code_challenge: input.codeChallenge, code_challenge_method: 'S256',
      }),
    };
  },

  async exchange(ctx, input) {
    const token = await tokenRequest(ctx, { grant_type: 'authorization_code', code: input.code, redirect_uri: ctx.redirectUri, code_verifier: input.codeVerifier });
    const accounts = await listAccounts(ctx, { token });
    if (!accounts.length) throw new NetworkError('PERMISSION', 'This Google account does not manage any Business Profile.', { userFacingMessage: 'This Google account does not manage any Business Profile. Sign in with the account that owns or manages the location.' });
    const channels = await listAllChannels(ctx, { token }, accounts);
    const owner = accounts.find(x => x.type === 'PERSONAL') ?? accounts[0];
    return { token, profile: profileOf(owner, channels) };
  },

  async refresh(ctx, a) {
    if (!a.token.refreshToken) throw new NetworkError('TOKEN_INVALID', 'No Google refresh token; reconnect the account.');
    return tokenRequest(ctx, { grant_type: 'refresh_token', refresh_token: a.token.refreshToken }, a.token);
  },

  async refreshProfile(ctx, a) {
    if (a.channelId) {
      const l = await api(ctx, a, `${INFO}/${locationOf(a)}`, { query: { readMask: 'name,title,storefrontAddress,websiteUri,profile' } });
      return { externalId: a.channelId, displayName: l.title ?? null, bio: l.profile?.description ?? null };
    }
    const accounts = await listAccounts(ctx, a);
    const owner = accounts.find(x => x.type === 'PERSONAL') ?? accounts[0];
    return owner ? profileOf(owner, await listAllChannels(ctx, a, accounts)) : {};
  },

  async listChannels(ctx, a) {
    return listAllChannels(ctx, a, await listAccounts(ctx, a));
  },

  async selectChannel(ctx, a, channel) {
    if (!CHANNEL_RE.test(channel.id)) throw new NetworkError('VALIDATION', `${channel.id} is not a Google Business location (expected accounts/{id}/locations/{id}).`);
    return { externalId: channel.id, profile: { displayName: channel.name ?? null, username: null, avatarUrl: channel.avatarUrl ?? null } };
  },

  async checkConnection(ctx, a) {
    try {
      if (a.channelId) await api(ctx, a, `${INFO}/${locationOf(a)}`, { query: { readMask: 'name' } });
      else await api(ctx, a, `${ACCOUNTS}/accounts`, { query: { pageSize: 1 } });
      return true;
    } catch (e) {
      if (e instanceof NetworkError && e.code === 'TOKEN_INVALID') return false;
      throw e;
    }
  },

  async revoke(ctx, a) {
    await request(ctx, REVOKE_URL, { form: { token: a.token.refreshToken ?? a.token.accessToken } }).catch(() => undefined);
  },

  validate(data, media) {
    const issues: Issue[] = [];
    const topic: string = data.topicType ?? 'STANDARD';
    const text: string = typeof data.text === 'string' ? data.text : '';
    if (!TOPICS.includes(topic)) issues.push({ code: 'invalid', message: `topicType must be one of ${TOPICS.join(', ')}.`, path: ['topicType'] });
    if (charCount(text) > SUMMARY_MAX) issues.push({ code: 'too_long', message: `Text is ${charCount(text)} characters; Google allows ${SUMMARY_MAX}.`, path: ['text'] });
    if ((topic === 'STANDARD' || topic === 'ALERT') && !text.trim() && !media.length) issues.push({ code: 'required', message: 'A Google Business post needs text or a photo.', path: ['text'] });
    checkMedia(issues, media, googleBusiness.limits, ['uploadIds'], { types: ['image'] });
    media.forEach((m, i) => {
      if (m.type === 'image' && ((m.width ?? 400) < 400 || (m.height ?? 300) < 300)) issues.push({ code: 'too_small', message: 'Photos must be at least 400 × 300 pixels.', path: ['uploadIds', i] });
    });
    if (data.languageCode && !LANG_RE.test(String(data.languageCode))) issues.push({ code: 'invalid', message: 'languageCode must be a BCP-47 tag such as "en" or "ms-MY".', path: ['languageCode'] });

    const cta = data.callToActionType;
    if (cta) {
      if (!CTA_TYPES.includes(cta)) issues.push({ code: 'invalid', message: `callToActionType must be one of ${CTA_TYPES.join(', ')}.`, path: ['callToActionType'] });
      else if (cta !== 'CALL' && !isUrl(data.callToActionUrl)) issues.push({ code: 'required', message: `callToActionUrl (an http(s) URL) is required for ${cta}.`, path: ['callToActionUrl'] });
    } else if (data.callToActionUrl) issues.push({ code: 'required', message: 'callToActionUrl needs a callToActionType.', path: ['callToActionType'] });
    if (topic === 'ALERT' && cta) issues.push({ code: 'not_supported', message: 'Alert posts cannot carry a call to action.', path: ['callToActionType'] });

    if (topic === 'EVENT' || topic === 'OFFER') {
      if (!data.eventTitle || !String(data.eventTitle).trim()) issues.push({ code: 'required', message: `${topic} posts need eventTitle.`, path: ['eventTitle'] });
      else if (charCount(String(data.eventTitle)) > EVENT_TITLE_MAX) issues.push({ code: 'too_long', message: `eventTitle is limited to ${EVENT_TITLE_MAX} characters.`, path: ['eventTitle'] });
      const start = data.eventStartDate ? new Date(data.eventStartDate).getTime() : NaN;
      const end = data.eventEndDate ? new Date(data.eventEndDate).getTime() : NaN;
      if (Number.isNaN(start)) issues.push({ code: 'required', message: `${topic} posts need a valid eventStartDate.`, path: ['eventStartDate'] });
      if (Number.isNaN(end)) issues.push({ code: 'required', message: `${topic} posts need a valid eventEndDate.`, path: ['eventEndDate'] });
      if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) issues.push({ code: 'range', message: 'eventEndDate must be after eventStartDate.', path: ['eventEndDate'] });
    } else {
      for (const k of ['eventTitle', 'eventStartDate', 'eventEndDate']) if (data[k]) issues.push({ code: 'not_supported', message: `${k} only applies to EVENT and OFFER posts.`, path: [k] });
    }
    if (topic === 'OFFER') {
      if (data.offerCouponCode && charCount(String(data.offerCouponCode)) > COUPON_MAX) issues.push({ code: 'too_long', message: `offerCouponCode is limited to ${COUPON_MAX} characters.`, path: ['offerCouponCode'] });
      if (data.offerRedeemOnlineUrl && !isUrl(data.offerRedeemOnlineUrl)) issues.push({ code: 'invalid', message: 'offerRedeemOnlineUrl must be an http(s) URL.', path: ['offerRedeemOnlineUrl'] });
      if (data.offerTermsConditions && charCount(String(data.offerTermsConditions)) > TERMS_MAX) issues.push({ code: 'too_long', message: `offerTermsConditions is limited to ${TERMS_MAX} characters.`, path: ['offerTermsConditions'] });
    } else {
      for (const k of ['offerCouponCode', 'offerRedeemOnlineUrl', 'offerTermsConditions']) if (data[k]) issues.push({ code: 'not_supported', message: `${k} only applies to OFFER posts.`, path: [k] });
    }
    return issues;
  },

  async publish(ctx, input) {
    const a = input.account;
    const m = input.media.find(x => x.type === 'image');
    if (input.media.some(x => x.type !== 'image')) throw new NetworkError('VALIDATION', 'Google Business posts accept a photo only.');
    const post = await api(ctx, a, `${V4}/${channelOf(a)}/localPosts`, { method: 'POST', json: postBody(input.data, m) });
    return resultOf(post);
  },

  async poll(ctx, input, ref) {
    const post = await api(ctx, input.account, `${V4}/${ref}`);
    return resultOf(post, ref);
  },

  async recentPosts(ctx, a, since) {
    const r = await api(ctx, a, `${V4}/${channelOf(a)}/localPosts`, { query: { pageSize: 20 } });
    return (r?.localPosts ?? []).filter((p: any) => !p.createTime || new Date(p.createTime) >= since)
      .map((p: any) => ({ externalId: p.name, text: p.summary ?? null, createdAt: p.createTime ? new Date(p.createTime) : null, permalink: permalinkOf(p) }));
  },

  async deletePost(ctx, a, id) {
    await api(ctx, a, `${V4}/${fullName(a, 'localPosts', id)}`, { method: 'DELETE' });
  },

  async editPost(ctx, a, id, data) {
    const text = data.text ?? data.summary;
    if (typeof text !== 'string') throw new NetworkError('VALIDATION', 'Editing a Google Business post needs the new text.');
    await api(ctx, a, `${V4}/${fullName(a, 'localPosts', id)}`, { method: 'PATCH', query: { updateMask: 'summary' }, json: { summary: text } });
  },

  async accountAnalytics(ctx, a) {
    const end = new Date(ctx.now().getTime() - 86_400_000);
    const start = new Date(end.getTime() - 27 * 86_400_000);
    const r = await api(ctx, a, multi(`${PERF}/${locationOf(a)}:fetchMultiDailyMetricsTimeSeries`, [
      ...[...IMPRESSION_METRICS, ...ACTION_METRICS].map(mname => ['dailyMetrics', mname] as [string, string]),
      ['dailyRange.startDate.year', ymd(start).year], ['dailyRange.startDate.month', ymd(start).month], ['dailyRange.startDate.day', ymd(start).day],
      ['dailyRange.endDate.year', ymd(end).year], ['dailyRange.endDate.month', ymd(end).month], ['dailyRange.endDate.day', ymd(end).day],
    ]));
    const totals = sumSeries(r);
    const impressions = IMPRESSION_METRICS.reduce((t, k) => t + (totals[k] ?? 0), 0);
    return { impressions, views: impressions, raw: { totals, range: { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) } } };
  },

  async importHistory(ctx, a, input) {
    const r = await api(ctx, a, `${V4}/${channelOf(a)}/localPosts`, { query: { pageSize: Math.min(100, input.limit), pageToken: input.cursor ?? undefined } });
    const items: HistoryPost[] = (r?.localPosts ?? []).map((p: any) => {
      const photo = p.media?.find((x: any) => x.mediaFormat === 'PHOTO');
      return {
        externalId: p.name, title: (p.summary ?? p.event?.title ?? '').slice(0, 200) || null, permalink: permalinkOf(p),
        thumbnail: photo?.googleUrl ?? photo?.sourceUrl ?? null, smallThumbnail: photo?.googleUrl ?? photo?.sourceUrl ?? null,
        publishedAt: p.createTime ? new Date(p.createTime) : null, type: photo ? ('IMAGE' as const) : ('POST' as const),
        extraData: { topicType: p.topicType ?? null, state: p.state ?? null, callToAction: p.callToAction ?? null },
      };
    });
    return { items, nextCursor: r?.nextPageToken ?? null };
  },

  reviews: {
    async list(ctx, a, input) {
      const r = await api(ctx, a, `${V4}/${channelOf(a)}/reviews`, { query: { pageSize: Math.min(50, input.limit), pageToken: input.cursor ?? undefined, orderBy: 'updateTime desc' } });
      return { items: (r?.reviews ?? []).map(toReview), nextCursor: r?.nextPageToken ?? null };
    },
    async reply(ctx, a, externalId, text) {
      await api(ctx, a, `${V4}/${fullName(a, 'reviews', externalId)}/reply`, { method: 'PUT', json: { comment: text } });
    },
    async deleteReply(ctx, a, externalId) {
      await api(ctx, a, `${V4}/${fullName(a, 'reviews', externalId)}/reply`, { method: 'DELETE' });
    },
  },

  misc,
};
