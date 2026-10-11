import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { facebook } from '../src/adapters/facebook.js';
import { harness, media, video, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const ctx = () => h.ctx('FACEBOOK');
const jpg = () => media({ mime: 'image/jpeg', ext: 'jpg', url: 'https://media.siar.test/a.jpg' });

/** Connect, then select the first Page like the API does (swap in the token + externalId). */
async function connectPage() {
  const acc = await h.connect(facebook);
  const channel = acc.channels[0];
  const sel = await facebook.selectChannel!(ctx(), acc, channel);
  return { ...acc, channelId: channel.id, externalId: sel.externalId ?? acc.externalId, token: sel.token ?? acc.token, username: sel.profile?.username ?? null };
}

describe('facebook', () => {
  it('connects, selects a Page, publishes text + image + reel, comments, reads insights and ratings', async () => {
    const user = await h.connect(facebook);
    expect(user.displayName).toBe('Siar Tester');
    expect(user.channels.map(c => c.name)).toEqual(['Siar Test Page', 'Siar Second Page']);
    expect(user.channels[0].metadata).toMatchObject({ instagramBusinessAccountId: '17841400000000001' });
    expect(user.token.expiresAt).toBeTruthy();
    expect(user.token.scopes).toContain('pages_manage_posts');

    const acc = await connectPage();
    expect(acc.externalId).toBe('1090000000000001');
    expect(acc.token.secrets).toMatchObject({ pageToken: 'fbpage_1', pageId: '1090000000000001' });
    expect(acc.username).toBe('siartestpage');
    expect(await facebook.checkConnection(ctx(), acc)).toBe(true);
    expect((await facebook.refresh!(ctx(), acc)).accessToken).not.toBe(acc.token.accessToken);
    expect((await facebook.refreshProfile(ctx(), acc)).displayName ?? 'Siar Test Page').toBe('Siar Test Page');

    // text post
    const t = await facebook.publish(ctx(), h.input(acc, { text: 'Hello Facebook from Siar' }));
    expect(t.status).toBe('POSTED');
    const textId = (t as any).externalPostId as string;
    expect(textId).toMatch(/^1090000000000001_/);
    expect((t as any).permalink).toContain('facebook.com/1090000000000001/posts/');

    // one image → /photos with post_id
    const img = await facebook.publish(ctx(), h.input(acc, { text: 'A photo' }, [jpg()]));
    expect(img.status).toBe('POSTED');
    expect((img as any).externalAlternatePostId).toBeTruthy();
    const st = h.state().facebook;
    expect(st.photos.at(-1)).toMatchObject({ url: 'https://media.siar.test/a.jpg', caption: 'A photo', published: true });

    // two images → unpublished photos attached to a feed post
    const two = await facebook.publish(ctx(), h.input(acc, { text: 'Two photos' }, [jpg(), jpg()]));
    expect(two.status).toBe('POSTED');
    expect(st.posts.at(-1).attached).toHaveLength(2);

    // reel: start → rupload → finish → poll until complete
    const reelInput = h.input(acc, { type: 'REEL', text: 'A reel' }, [video()]);
    const started = await facebook.publish(ctx(), reelInput);
    expect(started.status).toBe('PROCESSING');
    const first = await facebook.poll!(ctx(), reelInput, (started as any).pendingRef);
    expect(first.status).toBe('PROCESSING');
    const done = await facebook.poll!(ctx(), reelInput, (started as any).pendingRef);
    expect(done.status).toBe('POSTED');
    expect(Object.values<any>(st.reels).at(-1)).toMatchObject({ uploaded: true, description: 'A reel', state: 'PUBLISHED' });

    // story from an image
    const story = await facebook.publish(ctx(), h.input(acc, { type: 'STORY' }, [jpg()]));
    expect(story.status).toBe('POSTED');

    // comments: ours, an import, a reply, hide, delete
    const c = await facebook.comment!(ctx(), { account: acc, externalPostId: textId, text: 'first!', media: [], data: {} });
    expect(c.externalId).toContain(textId);
    const imported = await facebook.importComments!(ctx(), acc, { externalPostId: textId, limit: 25 });
    const alice = imported.items.find(x => x.authorName === 'Alice Fan')!;
    expect(alice.text).toBe('Looks great!');
    expect(imported.items.some(x => x.text === 'first!')).toBe(true);
    const reply = await facebook.comment!(ctx(), { account: acc, externalPostId: textId, parentExternalId: alice.externalId, text: 'thanks', media: [], data: {} });
    await facebook.commentAction!(ctx(), acc, { externalId: alice.externalId }, 'HIDE');
    expect(st.comments.find((x: any) => x.id === alice.externalId).is_hidden).toBe(true);
    await facebook.deleteComment!(ctx(), acc, reply.externalId);
    expect(st.comments.find((x: any) => x.id === reply.externalId).deleted).toBe(true);
    await facebook.editPost!(ctx(), acc, textId, { text: 'Edited text' });
    expect(st.posts.find((x: any) => x.id === textId).message).toBe('Edited text');

    // insights, history, recent posts
    const pm = await facebook.postAnalytics!(ctx(), acc, textId);
    expect(pm).toMatchObject({ likes: 7, shares: 2, views: 960, impressionsUnique: 700 });
    const am = await facebook.accountAnalytics!(ctx(), acc);
    expect(am).toMatchObject({ followers: 450, views: 5400, impressionsUnique: 3100 });
    const hist = await facebook.importHistory!(ctx(), acc, { limit: 10 });
    expect(hist.items.length).toBeGreaterThanOrEqual(3);
    expect(hist.items.map(x => x.type)).toContain('IMAGE');
    expect((await facebook.recentPosts!(ctx(), acc, new Date(Date.now() - 3600_000))).length).toBeGreaterThan(0);

    // ratings: list, reply, then the reply shows as ours
    const before = await facebook.reviews!.list(ctx(), acc, { limit: 10 });
    expect(before.items).toHaveLength(2);
    expect(before.items[0]).toMatchObject({ recommendationType: 'RECOMMEND', reviewerName: 'Bob Reviewer', replyText: null });
    await facebook.reviews!.reply(ctx(), acc, before.items[0].externalId, 'Thank you Bob!');
    const after = await facebook.reviews!.list(ctx(), acc, { limit: 10 });
    expect(after.items[0].replyText).toBe('Thank you Bob!');
    await facebook.reviews!.deleteReply!(ctx(), acc, before.items[0].externalId);
    expect((await facebook.reviews!.list(ctx(), acc, { limit: 10 })).items[0].replyText).toBeNull();

    // misc + messaging
    const dbg = await facebook.misc!['misc.facebook.getTokenDebug'](ctx(), acc, { query: {}, body: {}, params: {}, lookup: null as any }) as any;
    expect(dbg).toMatchObject({ type: 'PAGE', is_valid: true });
    const search = await facebook.misc!['misc.facebook.searchPages'](ctx(), acc, { query: { q: 'second' }, body: {}, params: {}, lookup: null as any }) as any;
    expect(search.items[0].name).toBe('Siar Second Page');
    const sent = await facebook.messaging!.send(ctx(), acc, { recipientId: '900', text: 'hi' });
    expect(sent.externalMessageId).toBeTruthy();
    await facebook.deletePost!(ctx(), acc, textId);
    expect(st.posts.some((x: any) => x.id === textId)).toBe(false);
  });

  it('validates and maps Meta errors (duplicate, Page permission, expired token)', async () => {
    const vid = { type: 'video' as const, mime: 'video/mp4', fileSize: 1000, width: 1080, height: 1920, duration: 12 };
    expect(facebook.validate({}, []).map(i => i.code)).toContain('required');
    expect(facebook.validate({ type: 'REEL' }, []).some(i => i.path[0] === 'uploadIds')).toBe(true);
    expect(facebook.validate({ type: 'REEL' }, [{ ...vid, duration: 120 }]).some(i => i.code === 'duration')).toBe(true);
    expect(facebook.validate({ type: 'STORY', link: 'https://x.test' }, [vid]).some(i => i.path[0] === 'link')).toBe(true);
    expect(facebook.validate({ text: 'x', nativeScheduleTime: new Date(Date.now() + 60_000).toISOString() }, []).some(i => i.code === 'out_of_range')).toBe(true);
    expect(facebook.validate({ text: 'ok' }, [])).toEqual([]);

    const acc = await connectPage();
    await facebook.publish(ctx(), h.input(acc, { text: 'Same words twice' }));
    await expect(facebook.publish(ctx(), h.input(acc, { text: 'Same words twice' }))).rejects.toMatchObject({ code: 'DUPLICATE', meta: expect.objectContaining({ code: 506 }) });

    // a user token (no Page token in secrets, wrong page) cannot write to the Page
    const wrongPage = { ...acc, channelId: '1090000000000002', token: { ...acc.token, secrets: { pageToken: 'fbpage_1', pageId: '1090000000000002' } } };
    await expect(facebook.publish(ctx(), h.input(wrongPage, { text: 'not allowed' }))).rejects.toMatchObject({ code: 'PERMISSION', httpStatus: 403 });

    const bad = { ...acc, token: { accessToken: 'nope', secrets: { pageToken: 'dead', pageId: acc.channelId } } };
    await expect(facebook.publish(ctx(), h.input(bad, { text: 'x' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID', meta: expect.objectContaining({ code: 190 }) });
    expect(await facebook.checkConnection(ctx(), bad)).toBe(false);
    expect(facebook.errorReference!.length).toBeGreaterThanOrEqual(6);
  });
});
