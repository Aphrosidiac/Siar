import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { googleBusiness } from '../src/adapters/google-business.js';
import { harness, media, video, type Harness } from './harness.js';
import type { AccountRuntime, MiscArgs } from '../src/types.js';

let h: Harness;
let acc: AccountRuntime;
const ctx = () => h.ctx('GOOGLE_BUSINESS');
const gb = () => h.state().googleBusiness;
const photo = () => media({ mime: 'image/jpeg', ext: 'jpg', width: 1200, height: 800, url: 'https://media.siar.test/shop.jpg' });
const misc = (op: string, a: Partial<MiscArgs>) =>
  googleBusiness.misc![op](ctx(), acc, { query: {}, body: {}, params: {}, lookup: {} as any, ...a } as MiscArgs) as Promise<any>;

beforeAll(async () => {
  h = await harness();
  const user = await h.connect(googleBusiness);
  const channel = user.channels[0];
  const sel = await googleBusiness.selectChannel!(ctx(), user, channel);
  acc = { ...user, channelId: channel.id, externalId: sel.externalId ?? user.externalId, displayName: sel.profile?.displayName ?? null };
});
afterAll(() => h.close());

describe('google business', () => {
  it('connects with accounts + locations, posts every topic type, reads reviews and metrics, runs the misc ops', async () => {
    expect(acc.channels.map(c => c.name)).toEqual(['Siar Coffee', 'Siar Bakery', 'Siar Roastery']);
    expect(acc.channels[0].id).toBe('accounts/100000000000000001/locations/5000000001');
    expect(acc.channels[2].id).toBe('accounts/100000000000000002/locations/5000000003');
    expect(acc.channels[0].metadata).toMatchObject({ placeId: 'ChIJsiarcoffee', verified: true });
    expect(acc.providerPageId).toBe('100000000000000001');
    expect(acc.externalId).toBe(acc.channelId);
    expect(acc.displayName).toBe('Siar Coffee');
    expect(acc.token.refreshToken).toBeTruthy();
    expect((await googleBusiness.refresh!(ctx(), acc)).refreshToken).toBe(acc.token.refreshToken);
    expect(await googleBusiness.checkConnection(ctx(), acc)).toBe(true);
    expect(await googleBusiness.checkConnection(ctx(), { ...acc, token: { accessToken: 'dead' } })).toBe(false);
    expect(await googleBusiness.refreshProfile(ctx(), acc)).toMatchObject({ displayName: 'Siar Coffee', bio: 'Coffee, tested.' });

    // STANDARD with a photo and a call to action
    const std = await googleBusiness.publish(ctx(), h.input(acc, { text: 'Fresh beans in', topicType: 'STANDARD', languageCode: 'ms', callToActionType: 'LEARN_MORE', callToActionUrl: 'https://siar-coffee.example/beans' }, [photo()]));
    expect(std.status).toBe('POSTED');
    const postName = (std as any).externalPostId as string;
    expect(postName).toMatch(/^accounts\/100000000000000001\/locations\/5000000001\/localPosts\//);
    expect((std as any).permalink).toContain('local.google.example');
    expect(gb().posts[0]).toMatchObject({ summary: 'Fresh beans in', languageCode: 'ms', topicType: 'STANDARD', callToAction: { actionType: 'LEARN_MORE', url: 'https://siar-coffee.example/beans' }, media: [{ mediaFormat: 'PHOTO', sourceUrl: 'https://media.siar.test/shop.jpg' }] });

    // EVENT and OFFER carry a schedule; CALL carries no url
    const ev = await googleBusiness.publish(ctx(), h.input(acc, { text: 'Latte art night', topicType: 'EVENT', eventTitle: 'Latte art', eventStartDate: '2026-11-01T10:00:00Z', eventEndDate: '2026-11-01T12:30:00Z', callToActionType: 'CALL' }));
    expect(ev.status).toBe('POSTED');
    expect(gb().posts[1].event).toEqual({ title: 'Latte art', schedule: { startDate: { year: 2026, month: 11, day: 1 }, startTime: { hours: 10, minutes: 0, seconds: 0, nanos: 0 }, endDate: { year: 2026, month: 11, day: 1 }, endTime: { hours: 12, minutes: 30, seconds: 0, nanos: 0 } } });
    expect(gb().posts[1].callToAction).toEqual({ actionType: 'CALL' });
    await googleBusiness.publish(ctx(), h.input(acc, { text: '20% off', topicType: 'OFFER', eventTitle: 'Opening deal', eventStartDate: '2026-11-02T00:00:00Z', eventEndDate: '2026-11-09T00:00:00Z', offerCouponCode: 'SIAR20', offerRedeemOnlineUrl: 'https://siar-coffee.example/deal', offerTermsConditions: 'One per customer' }));
    expect(gb().posts[2].offer).toEqual({ couponCode: 'SIAR20', redeemOnlineUrl: 'https://siar-coffee.example/deal', termsConditions: 'One per customer' });
    await googleBusiness.publish(ctx(), h.input(acc, { text: 'Closed for a day', topicType: 'ALERT' }));
    expect(gb().posts[3].alertType).toBe('COVID_19');

    // a post Google is still processing
    const slowInput = h.input(acc, { text: 'a slow one' });
    const slow = await googleBusiness.publish(ctx(), slowInput);
    expect(slow.status).toBe('PROCESSING');
    expect((await googleBusiness.poll!(ctx(), slowInput, (slow as any).pendingRef)).status).toBe('PROCESSING');
    expect((await googleBusiness.poll!(ctx(), slowInput, (slow as any).pendingRef)).status).toBe('POSTED');

    // edit, list, history, delete
    await googleBusiness.editPost!(ctx(), acc, postName, { text: 'Fresh beans just landed' });
    expect(gb().posts[0].summary).toBe('Fresh beans just landed');
    const recent = await googleBusiness.recentPosts!(ctx(), acc, new Date(Date.now() - 3600_000));
    expect(recent).toHaveLength(5);
    const hist = await googleBusiness.importHistory!(ctx(), acc, { limit: 2 });
    expect(hist.items).toHaveLength(2);
    expect(hist.nextCursor).toBeTruthy();
    expect((await googleBusiness.importHistory!(ctx(), acc, { limit: 10 })).items.map(x => x.type)).toContain('IMAGE');
    const lookup = { post: async () => ({ externalPostId: postName, data: {} }), upload: async () => photo() } as any;
    expect(await misc('misc.google_business.deletePost', { body: { postId: 'p' }, lookup })).toEqual({ success: true });
    expect(gb().posts[0].deleted).toBe(true);

    // reviews: list, reply, delete reply
    const before = await googleBusiness.reviews!.list(ctx(), acc, { limit: 10 });
    expect(before.items.map(r => r.rating)).toEqual([3, 1, 5]); // newest first: rev_3, rev_2, rev_1
    expect(before.items.find(r => r.externalId === 'rev_2')).toMatchObject({ reviewerName: 'A Google user', text: null });
    expect(before.items.find(r => r.externalId === 'rev_3')!.replyText).toBe('Thanks Carol!');
    await googleBusiness.reviews!.reply(ctx(), acc, 'rev_1', 'Thank you Bob!');
    expect((await googleBusiness.reviews!.list(ctx(), acc, { limit: 10 })).items.find(r => r.externalId === 'rev_1')!.replyText).toBe('Thank you Bob!');
    await googleBusiness.reviews!.deleteReply!(ctx(), acc, 'rev_1');
    expect((await googleBusiness.reviews!.list(ctx(), acc, { limit: 10 })).items.find(r => r.externalId === 'rev_1')!.replyText).toBeNull();

    // performance
    const am = await googleBusiness.accountAnalytics!(ctx(), acc);
    expect(am).toMatchObject({ impressions: 2800, views: 2800 });
    expect((am.raw as any).totals).toMatchObject({ WEBSITE_CLICKS: 140, CALL_CLICKS: 56, BUSINESS_DIRECTION_REQUESTS: 84 });

    // location profile
    const loc = await misc('misc.google_business.getLocation', { query: { fields: ['title', 'websiteUri'] } });
    expect(loc).toEqual({ name: 'locations/5000000001', title: 'Siar Coffee', websiteUri: 'https://siar-coffee.example' });
    await misc('misc.google_business.updateLocation', { body: { websiteUri: 'https://siar-coffee.example/new', phoneNumbers: { primaryPhone: '+60 3-9999 0000' } } });
    expect(gb().locations[0].doc).toMatchObject({ websiteUri: 'https://siar-coffee.example/new', phoneNumbers: { primaryPhone: '+60 3-9999 0000' } });
    await misc('misc.google_business.updateLocation', { body: { websiteUri: 'https://ignored.example', validateOnly: true } });
    expect(gb().locations[0].doc.websiteUri).toBe('https://siar-coffee.example/new');
    await expect(misc('misc.google_business.updateLocation', { body: {} })).rejects.toMatchObject({ code: 'VALIDATION' });
    const hours = { periods: [{ openDay: 'TUESDAY', openTime: { hours: 9 }, closeDay: 'TUESDAY', closeTime: { hours: 17 } }] };
    await misc('misc.google_business.updateHours', { body: { fields: ['regularHours', 'specialHours'], regularHours: hours } });
    expect(gb().locations[0].doc.regularHours).toEqual(hours);
    expect(gb().locations[0].doc.specialHours).toBeUndefined(); // named in the mask, absent from the body → cleared

    // attributes, categories, service list, food menus
    const attrs = await misc('misc.google_business.updateAttributes', { body: { attributes: [{ name: 'attributes/wi_fi', repeatedEnumValue: { setValues: ['free_wifi'] } }] } });
    expect(attrs.attributes[0].name).toBe('attributes/wi_fi');
    expect((await misc('misc.google_business.getAttributes', {})).attributes).toHaveLength(1);
    const byLoc = await misc('misc.google_business.listAvailableAttributes', { query: {} });
    expect(byLoc.lookup).toEqual({ by: 'location', languageCode: 'en' });
    expect(byLoc.attributes.length).toBeGreaterThan(0);
    const byCat = await misc('misc.google_business.listAvailableAttributes', { query: { regionCode: 'MY', languageCode: 'ms' } });
    expect(byCat.lookup).toEqual({ by: 'category', categoryName: 'categories/gcid:cafe', regionCode: 'MY', languageCode: 'ms' });
    const cats = await misc('misc.google_business.listCategories', { query: { regionCode: 'MY', languageCode: 'en', filter: 'displayName=bak' } });
    expect(cats.categories.map((c: any) => c.displayName)).toEqual(['Bakery']);
    expect((await misc('misc.google_business.listCategories', { query: { regionCode: 'MY', languageCode: 'en', names: ['categories/gcid:cafe'] } })).categories).toHaveLength(1);
    const kw = await misc('misc.google_business.listSearchKeywords', { query: { startMonth: '2026-08', endMonth: '2026-09' } });
    expect(kw.location).toBe('locations/5000000001');
    expect(kw.range).toEqual({ startMonth: '2026-08', endMonth: '2026-09' });
    expect(kw.searchKeywords).toEqual([
      { searchKeyword: 'coffee near me', value: 320, threshold: null }, { searchKeyword: 'cafe kuala lumpur', value: 145, threshold: null }, { searchKeyword: 'oat latte', value: null, threshold: 15 },
    ]);
    const items = [{ structuredServiceItem: { serviceTypeId: 'job_type_id:espresso', description: 'Espresso' } }, { freeFormServiceItem: { category: 'categories/gcid:cafe', label: { displayName: 'Cold brew', languageCode: 'en' } } }];
    expect((await misc('misc.google_business.updateServiceList', { body: { fields: ['serviceItems'], serviceItems: items } })).serviceItems).toHaveLength(2);
    expect((await misc('misc.google_business.getServiceList', {})).serviceItems).toEqual(items);
    const menus = [{ labels: [{ displayName: 'Drinks' }], sections: [] }];
    await misc('misc.google_business.updateFoodMenus', { body: { fields: ['menus'], menus } });
    expect(await misc('misc.google_business.getFoodMenus', {})).toEqual({ name: `${acc.channelId}/foodMenus`, menus });

    // place action links
    const link = await misc('misc.google_business.createPlaceActionLink', { body: { placeActionLink: { uri: 'https://siar-coffee.example/order', placeActionType: 'FOOD_ORDERING', isPreferred: true } } });
    expect(link.name).toMatch(/^locations\/5000000001\/placeActionLinks\//);
    await expect(misc('misc.google_business.createPlaceActionLink', { body: { placeActionLink: { uri: 'https://siar-coffee.example/order', placeActionType: 'FOOD_ORDERING' } } })).rejects.toMatchObject({ code: 'DUPLICATE' });
    const upd = await misc('misc.google_business.updatePlaceActionLink', { body: { name: link.name, fields: ['uri'], placeActionLink: { uri: 'https://siar-coffee.example/order-v2' } } });
    expect(upd.uri).toBe('https://siar-coffee.example/order-v2');
    expect((await misc('misc.google_business.listPlaceActionLinks', {})).placeActionLinks).toHaveLength(1);
    expect(await misc('misc.google_business.deletePlaceActionLink', { body: { name: link.name } })).toEqual({ success: true });
    expect((await misc('misc.google_business.listPlaceActionLinks', {})).placeActionLinks).toHaveLength(0);

    // media
    const added = await misc('misc.google_business.addMedia', { body: { uploadId: 'u1', category: 'EXTERIOR' }, lookup });
    expect(added).toMatchObject({ mediaFormat: 'PHOTO', sourceUrl: 'https://media.siar.test/shop.jpg', locationAssociation: { category: 'EXTERIOR' } });
    expect((await misc('misc.google_business.listMedia', {})).totalMediaItemCount).toBe(1);
    expect(await misc('misc.google_business.deleteMedia', { body: { mediaName: added.name } })).toEqual({ success: true });
    expect((await misc('misc.google_business.listMedia', {})).mediaItems).toEqual([]);
    await expect(misc('misc.google_business.addMedia', { body: { uploadId: 'v', category: 'LOGO' }, lookup: { upload: async () => video(10) } as any })).rejects.toMatchObject({ code: 'VALIDATION' });
  });

  it('validates and maps Google errors (unverified location, bad photo, rejected post, quota, expired token)', async () => {
    const jpg = { type: 'image' as const, mime: 'image/jpeg', fileSize: 1000, width: 1200, height: 800 };
    expect(googleBusiness.validate({}, []).map(i => i.code)).toContain('required');
    expect(googleBusiness.validate({ text: 'x'.repeat(1501) }, [])[0].code).toBe('too_long');
    expect(googleBusiness.validate({ text: 'x', topicType: 'EVENT' }, []).map(i => i.path[0])).toEqual(expect.arrayContaining(['eventTitle', 'eventStartDate', 'eventEndDate']));
    expect(googleBusiness.validate({ text: 'x', topicType: 'EVENT', eventTitle: 'e', eventStartDate: '2026-11-02T00:00:00Z', eventEndDate: '2026-11-01T00:00:00Z' }, []).some(i => i.code === 'range')).toBe(true);
    expect(googleBusiness.validate({ text: 'x', callToActionType: 'SHOP' }, []).some(i => i.path[0] === 'callToActionUrl')).toBe(true);
    expect(googleBusiness.validate({ text: 'x', callToActionType: 'CALL' }, [])).toEqual([]);
    expect(googleBusiness.validate({ text: 'x', offerCouponCode: 'A' }, []).some(i => i.code === 'not_supported')).toBe(true);
    expect(googleBusiness.validate({ text: 'x' }, [jpg, jpg]).some(i => i.code === 'too_many')).toBe(true);
    expect(googleBusiness.validate({ text: 'x' }, [{ ...jpg, width: 200, height: 100 }]).some(i => i.code === 'too_small')).toBe(true);
    expect(googleBusiness.validate({ text: 'x' }, [{ ...jpg, type: 'video', mime: 'video/mp4' }]).some(i => i.code === 'type')).toBe(true);
    expect(googleBusiness.validate({ text: 'ok', topicType: 'STANDARD', callToActionType: 'BOOK', callToActionUrl: 'https://x.test/book' }, [jpg])).toEqual([]);
    expect(googleBusiness.errorReference!.length).toBeGreaterThanOrEqual(6);

    // not verified → FAILED_PRECONDITION → PERMISSION
    const bakery = { ...acc, channelId: acc.channels[1].id, externalId: acc.channels[1].id };
    await expect(googleBusiness.publish(ctx(), h.input(bakery, { text: 'Fresh bread' }))).rejects.toMatchObject({ code: 'PERMISSION', httpStatus: 400, message: expect.stringContaining('not verified') });
    // a photo Google cannot fetch → MEDIA_INVALID, with the field in the user-facing message
    await expect(googleBusiness.publish(ctx(), h.input(acc, { text: 'x' }, [media({ mime: 'image/jpeg', url: 'https://media.siar.test/bad.jpg' })]))).rejects.toMatchObject({ code: 'MEDIA_INVALID', userFacingMessage: expect.stringContaining('media[0].source_url') });
    // policy rejection after accepting the post
    await expect(googleBusiness.publish(ctx(), h.input(acc, { text: 'please reject me' }))).rejects.toMatchObject({ code: 'CONTENT_REJECTED' });
    // a location that is not ours
    await expect(googleBusiness.deletePost!(ctx(), acc, 'nope')).rejects.toMatchObject({ code: 'NOT_FOUND', httpStatus: 404 });
    // no location picked yet
    await expect(googleBusiness.publish(ctx(), h.input({ ...acc, channelId: null, externalId: 'accounts/100000000000000001' }, { text: 'x' }))).rejects.toMatchObject({ code: 'VALIDATION' });
    // expired token
    await expect(googleBusiness.publish(ctx(), h.input({ ...acc, token: { accessToken: 'nope' } }, { text: 'x' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID', httpStatus: 401 });
    // quota
    gb().quota = true;
    try {
      const err = await googleBusiness.reviews!.list(ctx(), acc, { limit: 5 }).catch(e => e);
      expect(err).toMatchObject({ code: 'RATE_LIMITED', isTransient: true, httpStatus: 429 });
      expect(err.rateLimitResetAt.getTime()).toBeGreaterThan(Date.now());
    } finally { gb().quota = false; }
    // a revoked refresh token
    await expect(googleBusiness.refresh!(ctx(), { ...acc, token: { ...acc.token, refreshToken: 'revoked' } })).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
  });
});
