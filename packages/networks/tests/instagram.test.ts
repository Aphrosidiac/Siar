import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { instagram } from '../src/adapters/instagram.js';
import { NetworkError } from '../src/lib/errors.js';
import { harness, media, video, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const ctx = () => h.ctx('INSTAGRAM');
const connect = () => h.connect(instagram, { options: { instagramConnectionMethod: 'INSTAGRAM' } });

/** publish() then poll() until the network is done, like the engine does. */
async function post(acc: Awaited<ReturnType<typeof connect>>, data: Record<string, any>, m = [media({ type: 'image', mime: 'image/jpeg', ext: 'jpg', url: 'https://media.siar.test/a.jpg' })]) {
  const input = h.input(acc, data, m);
  let r = await instagram.publish(ctx(), input);
  expect(r.status).toBe('PROCESSING');
  for (let i = 0; i < 5 && r.status === 'PROCESSING'; i++) r = await instagram.poll!(ctx(), input, (r as any).pendingRef);
  return r;
}

describe('instagram (Instagram Login)', () => {
  it('connects, publishes via container + poll, comments, reads insights and history, messages', async () => {
    const acc = await connect();
    expect(acc.instagramConnectionMethod).toBe('INSTAGRAM');
    expect(acc.username).toBe('siar.test');
    expect(acc.externalId).toBe('17841400000000001');
    expect(acc.token.expiresAt).toBeTruthy();
    expect((await instagram.refresh!(ctx(), acc)).accessToken).not.toBe(acc.token.accessToken);
    expect(await instagram.checkConnection(ctx(), acc)).toBe(true);

    // single image: PROCESSING → FINISHED → media_publish
    const r = await post(acc, { text: 'Hello Instagram #siar', tagged: [{ username: 'friend' }], collaborators: ['pal'], locationId: '123' });
    expect(r.status).toBe('POSTED');
    const id = (r as any).externalPostId;
    expect((r as any).permalink).toContain('instagram.com/p/');
    const st = h.state().instagram;
    expect(st.media).toHaveLength(1);
    expect(st.containers[st.media[0].containerId]).toMatchObject({ caption: 'Hello Instagram #siar', location_id: '123', collaborators: '["pal"]' });
    expect(JSON.parse(st.containers[st.media[0].containerId].user_tags)).toEqual([{ username: 'friend', x: 0.5, y: 0.5 }]);

    // reel with cover offset: video container stays IN_PROGRESS on the first poll
    const reelInput = h.input(acc, { type: 'REEL', text: 'A reel', shareToFeed: false, thumbnailOffset: 1500 }, [video()]);
    const started = await instagram.publish(ctx(), reelInput);
    expect(started.status).toBe('PROCESSING');
    const first = await instagram.poll!(ctx(), reelInput, (started as any).pendingRef);
    expect(first.status).toBe('PROCESSING');
    const done = await instagram.poll!(ctx(), reelInput, (started as any).pendingRef);
    expect(done.status).toBe('POSTED');
    const reel = Object.values<any>(st.containers).find(c => c.media_type === 'REELS');
    expect(reel).toMatchObject({ share_to_feed: 'false', thumb_offset: '1500' });

    // carousel: two children, then the parent
    const car = await post(acc, { text: 'Two images' }, [media({ mime: 'image/jpeg', url: 'https://media.siar.test/1.jpg' }), media({ mime: 'image/jpeg', url: 'https://media.siar.test/2.jpg' })]);
    expect(car.status).toBe('POSTED');
    expect(Object.values<any>(st.containers).filter(c => c.is_carousel_item === 'true')).toHaveLength(2);

    // comments
    const c = await instagram.comment!(ctx(), { account: acc, externalPostId: id, text: 'first', media: [], data: {} });
    expect(c.externalId).toBeTruthy();
    const imported = await instagram.importComments!(ctx(), acc, { externalPostId: id, limit: 10 });
    const fan = imported.items.find(x => x.authorName === 'fan_account')!;
    expect(imported.items.some(x => x.externalParentId === fan.externalId)).toBe(true);
    const reply = await instagram.comment!(ctx(), { account: acc, externalPostId: id, parentExternalId: fan.externalId, text: 'thanks', media: [], data: {} });
    await instagram.commentAction!(ctx(), acc, { externalId: fan.externalId }, 'HIDE');
    expect(st.comments.find((x: any) => x.id === fan.externalId).hidden).toBe(true);
    await instagram.deleteComment!(ctx(), acc, reply.externalId);
    expect(st.comments.find((x: any) => x.id === reply.externalId).deleted).toBe(true);

    // insights + history + misc
    const pm = await instagram.postAnalytics!(ctx(), acc, id);
    expect(pm).toMatchObject({ likes: 55, saves: 9, views: 1200 });
    const am = await instagram.accountAnalytics!(ctx(), acc);
    expect(am.followers).toBe(1840);
    expect(am.audience).toEqual({ countries: { MY: 900, SG: 200 } });
    const hist = await instagram.importHistory!(ctx(), acc, { limit: 10 });
    expect(hist.items.map(x => x.type)).toContain('REEL');
    const bd = await instagram.misc!['misc.instagram.businessDiscovery'](ctx(), acc, { query: { username: '@brand' }, body: {}, params: {}, lookup: null as any }) as any;
    expect(bd.exists).toBe(true);
    const none = await instagram.misc!['misc.instagram.businessDiscovery'](ctx(), acc, { query: { username: 'nobody_here' }, body: {}, params: {}, lookup: null as any }) as any;
    expect(none).toEqual({ exists: false, data: null });
    await expect(instagram.misc!['misc.instagram.searchAudio'](ctx(), acc, { query: { audioType: 'music' }, body: {}, params: {}, lookup: null as any })).rejects.toMatchObject({ code: 'NOT_SUPPORTED' });

    // messaging
    const msg = instagram.messaging!;
    const sent = await msg.send(ctx(), acc, { recipientId: '900', text: 'hi' });
    expect(sent.externalMessageId).toBeTruthy();
    await msg.privateReply(ctx(), acc, { commentExternalId: fan.externalId, text: 'dm' });
    await msg.markSeen(ctx(), acc, '900');
    await msg.syncProviderSetting(ctx(), acc, { type: 'INSTAGRAM_ICE_BREAKERS', config: { iceBreakers: [{ question: 'Pricing?', payload: 'PRICE' }] } });
    expect(st.profileSettings.at(-1).ice_breakers[0].call_to_actions[0]).toMatchObject({ question: 'Pricing?' });
    await msg.enable(ctx(), acc);
    expect(st.subscribed[0].id).toBe('17841400000000001');
    const parsed = msg.parseWebhook({ object: 'instagram', entry: [{ id: '17841400000000001', time: 1790000000, messaging: [{ sender: { id: '900' }, recipient: { id: '17841400000000001' }, timestamp: 1790000000000, message: { mid: 'm1', text: 'hello' } }], changes: [{ field: 'comments', value: { id: 'c1', text: 'nice', from: { id: '900', username: 'fan' }, media: { id: id } } }] }] });
    expect(parsed[0].messages[0]).toMatchObject({ direction: 'INBOUND', text: 'hello' });
    expect(parsed[0].comments[0].externalPostId).toBe(id);
  });

  it('validates the spec fields and maps Meta errors', async () => {
    const jpg = { type: 'image' as const, mime: 'image/jpeg', fileSize: 1000, width: 1080, height: 1080 };
    expect(instagram.validate({ text: 'x' }, []).map(i => i.code)).toContain('required');
    expect(instagram.validate({ text: 'x'.repeat(2201) }, [jpg])[0].code).toBe('too_long');
    expect(instagram.validate({ type: 'REEL' }, [jpg]).some(i => i.path[0] === 'uploadIds')).toBe(true);
    expect(instagram.validate({ shareToFeed: false, collaborators: ['a', 'b', 'c', 'd'] }, [jpg]).map(i => i.path[0])).toEqual(expect.arrayContaining(['shareToFeed', 'collaborators']));
    expect(instagram.validate({ text: 'ok', collaborators: ['a'] }, [{ ...jpg, width: 3000, height: 1000 }]).some(i => i.code === 'aspect')).toBe(true);
    expect(instagram.validate({ text: 'ok' }, [jpg])).toEqual([]);

    const acc = await connect();
    // media Meta cannot fetch → 9004 → MEDIA_INVALID
    await expect(instagram.publish(ctx(), h.input(acc, { text: 'x' }, [media({ url: 'https://media.siar.test/bad.jpg' })]))).rejects.toMatchObject({ code: 'MEDIA_INVALID', httpStatus: 400 } satisfies Partial<NetworkError>);
    // a video that fails processing surfaces from poll()
    const input = h.input(acc, { type: 'REEL' }, [video(12)].map(v => ({ ...v, url: 'https://media.siar.test/bad.mp4' })));
    const started = await instagram.publish(ctx(), input);
    await expect(instagram.poll!(ctx(), input, (started as any).pendingRef)).rejects.toMatchObject({ code: 'MEDIA_INVALID' });
    // expired token
    const bad = { ...acc, token: { accessToken: 'nope' } };
    await expect(instagram.publish(ctx(), h.input(bad, { text: 'x' }, [media()]))).rejects.toMatchObject({ code: 'TOKEN_INVALID', meta: expect.objectContaining({ code: 190 }) });
    expect(await instagram.checkConnection(ctx(), bad)).toBe(false);
  });

  it('builds the Facebook Login dialog and reads the Facebook-only audio library', async () => {
    const a = await instagram.authorize(ctx(), { state: 's1', codeVerifier: 'v', codeChallenge: 'c', options: { instagramConnectionMethod: 'FACEBOOK' } });
    expect(a.url).toContain('facebook.com');
    expect(a.url).toContain('instagram_content_publish');
    expect(a.extra).toEqual({ method: 'FACEBOOK' });
    const acc = { ...(await connect()), instagramConnectionMethod: 'FACEBOOK' as const, channelId: '17841400000000001' };
    const res = await instagram.misc!['misc.instagram.searchAudio'](ctx(), acc, { query: { audioType: 'music', searchQuery: 'sunrise' }, body: {}, params: {}, lookup: null as any }) as any;
    expect(res.audio[0]).toMatchObject({ audio_id: '587784541076604', audio_type: 'music' });
  });
});
