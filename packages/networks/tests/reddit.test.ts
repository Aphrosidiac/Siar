import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { reddit } from '../src/adapters/reddit.js';
import { harness, media, video, type Harness } from './harness.js';
import type { AccountRuntime, MiscArgs } from '../src/types.js';

let h: Harness;
let acc: AccountRuntime;
const ctx = () => h.ctx('REDDIT');
const misc = (op: string, a: Partial<MiscArgs>) =>
  reddit.misc![op](ctx(), acc, { query: {}, body: {}, params: {}, lookup: {} as any, ...a } as MiscArgs) as Promise<any>;

beforeAll(async () => { h = await harness(); acc = await h.connect(reddit); });
afterAll(() => h.close());

const pub = (data: Record<string, any>, title = 'A post from Siar', m = [] as ReturnType<typeof media>[]) => {
  const input = h.input(acc, data, m);
  input.title = title;
  return { input, run: () => reddit.publish(ctx(), input) };
};

describe('reddit', () => {
  it('connects permanently, posts self/link/image, comments, reads analytics and history, and runs the misc ops', async () => {
    expect(acc.username).toBe('siar_test');
    expect(acc.externalId).toBe('a1b2c3');
    expect(acc.token.refreshToken).toBeTruthy();
    expect(acc.token.scopes).toContain('submit');
    const t2 = await reddit.refresh!(ctx(), acc);
    expect(t2.refreshToken).toBe(acc.token.refreshToken); // Reddit does not rotate
    expect(t2.accessToken).not.toBe(acc.token.accessToken);
    expect(await reddit.checkConnection(ctx(), acc)).toBe(true);
    expect(await reddit.checkConnection(ctx(), { ...acc, token: { accessToken: 'dead' } })).toBe(false);
    const st = h.state().reddit;

    // self post with flair + nsfw
    const self = await pub({ sr: 'r/siartest', text: 'Body **markdown**', nsfw: true, flairId: 'flair-discuss' }).run();
    expect(self.status).toBe('POSTED');
    const selfId = (self as any).externalPostId as string;
    expect((self as any).permalink).toContain('/r/siartest/comments/');
    expect(st.posts[0]).toMatchObject({ sr: 'siartest', kind: 'self', title: 'A post from Siar', text: 'Body **markdown**', nsfw: true, flairId: 'flair-discuss', resubmit: 'true' });

    // link post
    const link = await pub({ sr: 'siartest', text: '', link: 'https://siaran.my/launch' }, 'Siar launched').run();
    expect(link.status).toBe('POSTED');
    expect(st.posts[1]).toMatchObject({ kind: 'link', url: 'https://siaran.my/launch' });

    // image: lease → S3 upload → submit → PROCESSING → poll → POSTED
    const img = pub({ sr: 'siartest', text: '' }, 'Look at this', [media({ mime: 'image/png' })]);
    const started = await img.run();
    expect(started.status).toBe('PROCESSING');
    expect(Object.values<any>(st.uploads)[0]).toMatchObject({ received: true, mimetype: 'image/png' });
    expect((await reddit.poll!(ctx(), img.input, (started as any).pendingRef)).status).toBe('PROCESSING'); // not listed yet
    const done = await reddit.poll!(ctx(), img.input, (started as any).pendingRef);
    expect(done).toMatchObject({ status: 'POSTED', externalData: { kind: 'image' } });
    expect((done as any).permalink).toContain('/r/siartest/comments/');

    // comments: top level, reply to the seeded fan comment, edit, delete
    const c = await reddit.comment!(ctx(), { account: acc, externalPostId: selfId, text: 'first!', media: [], data: {} });
    expect(c.permalink).toContain(`/comments/${selfId}/`);
    const imported = await reddit.importComments!(ctx(), acc, { externalPostId: selfId, limit: 50 });
    const fan = imported.items.find(x => x.authorName === 'fan_user')!;
    expect(imported.items.find(x => x.authorName === 'other_user')!.externalParentId).toBe(fan.externalId);
    const reply = await reddit.comment!(ctx(), { account: acc, externalPostId: selfId, parentExternalId: fan.externalId, text: 'thanks', media: [], data: {} });
    await reddit.editComment!(ctx(), acc, reply.externalId, 'thanks, edited');
    expect(st.comments.find((x: any) => x.id === reply.externalId).text).toBe('thanks, edited');
    await reddit.commentAction!(ctx(), acc, { externalId: reply.externalId }, 'DELETE');
    expect(st.comments.find((x: any) => x.id === reply.externalId).deleted).toBe(true);
    await expect(reddit.commentAction!(ctx(), acc, { externalId: fan.externalId }, 'HIDE')).rejects.toMatchObject({ code: 'NOT_SUPPORTED' });

    // analytics + history
    const pm = await reddit.postAnalytics!(ctx(), acc, selfId);
    expect(pm).toMatchObject({ likes: 42, comments: 3, shares: 3 });
    expect(pm.dislikes).toBe(5);
    expect((await reddit.accountAnalytics!(ctx(), acc)).followers).toBe(14);
    const hist = await reddit.importHistory!(ctx(), acc, { limit: 2 });
    expect(hist.items).toHaveLength(2);
    expect(hist.nextCursor).toBeTruthy();
    const next = await reddit.importHistory!(ctx(), acc, { limit: 2, cursor: hist.nextCursor });
    expect(next.items.length).toBeGreaterThan(0);
    expect(hist.items.concat(next.items).map(x => x.type)).toContain('IMAGE');
    expect((await reddit.recentPosts!(ctx(), acc, new Date(Date.now() - 3600_000))).length).toBe(3);

    // misc.reddit.*
    expect(await misc('misc.reddit.getPostRequirements', { query: { subreddit: 'flairreq' } })).toEqual({ isFlairRequired: true, isFlairEnabled: true });
    const flairs = await misc('misc.reddit.getSubredditFlairs', { query: { subreddit: 'siartest' } });
    expect(flairs.map((f: any) => f.id)).toEqual(['flair-discuss', 'flair-news']);
    expect(flairs[0]).toMatchObject({ text: 'Discussion', modOnly: false, allowableContent: 'all' });
    const lookup = {
      post: async () => ({ externalPostId: selfId, permalink: 'https://www.reddit.com/x', data: {} }),
      comment: async () => ({ externalId: c.externalId, externalPostId: selfId }),
    } as any;
    expect(await misc('misc.reddit.editPost', { body: { postId: 'p', description: 'Edited body' }, lookup })).toMatchObject({ success: true });
    expect(st.posts[0].text).toBe('Edited body');
    expect(await misc('misc.reddit.editComment', { body: { commentId: 'c', text: 'edited top' }, lookup })).toMatchObject({ success: true });
    expect((await misc('misc.reddit.editComment', { body: { commentId: 'c', text: 'again' }, lookup })).permalink).toContain('/comments/');
    expect(await misc('misc.reddit.deleteComment', { body: { commentId: 'c' }, lookup })).toEqual({ success: true });
    expect(await misc('misc.reddit.deletePost', { body: { postId: 'p' }, lookup })).toEqual({ success: true });
    expect(st.deleted).toContain(`t3_${selfId}`);
    await expect(reddit.postAnalytics!(ctx(), acc, selfId)).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('validates and maps Reddit errors (json.errors arrays, 403, expired grants)', async () => {
    const png = { type: 'image' as const, mime: 'image/png', fileSize: 1000, width: 100, height: 100 };
    expect(reddit.validate({ text: 'x' }, []).map(i => i.path[0])).toContain('sr');
    expect(reddit.validate({ sr: 'a b', text: '' }, []).some(i => i.code === 'invalid')).toBe(true);
    expect(reddit.validate({ sr: 'siartest', text: 'x'.repeat(40_001) }, [])[0].code).toBe('too_long');
    expect(reddit.validate({ sr: 'siartest', text: '', link: 'nope' }, []).some(i => i.path[0] === 'link')).toBe(true);
    expect(reddit.validate({ sr: 'siartest', text: '', link: 'https://x.test' }, [png]).some(i => i.code === 'link_with_media')).toBe(true);
    expect(reddit.validate({ sr: 'siartest', text: '' }, [png, png]).some(i => i.code === 'too_many')).toBe(true);
    expect(reddit.validate({ sr: 'r/siartest', text: 'hi', flairId: 'x' }, [])).toEqual([]);
    expect(reddit.errorReference!.length).toBeGreaterThanOrEqual(6);

    // HTTP 200 + json.errors
    await expect(pub({ sr: 'nosuchsub', text: 'x' }).run()).rejects.toMatchObject({ code: 'NOT_FOUND', message: "that subreddit doesn't exist", httpStatus: 200 });
    await expect(pub({ sr: 'flairreq', text: 'x' }).run()).rejects.toMatchObject({ code: 'CONTENT_REJECTED', meta: expect.objectContaining({ code: 'SUBMIT_VALIDATION_FLAIR_REQUIRED' }) });
    await expect(pub({ sr: 'siartest', text: 'x', flairId: 'nope' }).run()).rejects.toMatchObject({ code: 'VALIDATION' });
    const limited = await pub({ sr: 'siartest', text: 'x' }, 'hit the ratelimit').run().catch(e => e);
    expect(limited).toMatchObject({ code: 'RATE_LIMITED', isTransient: true });
    expect(limited.rateLimitResetAt.getTime()).toBeGreaterThan(Date.now() + 8 * 60_000);
    await expect(pub({ sr: 'siartest', text: 'x' }, 'x'.repeat(301)).run()).rejects.toMatchObject({ code: 'CONTENT_REJECTED' });
    // real HTTP statuses
    await expect(pub({ sr: 'private', text: 'x' }).run()).rejects.toMatchObject({ code: 'PERMISSION', httpStatus: 403 });
    const bad = h.input({ ...acc, token: { accessToken: 'dead' } }, { sr: 'siartest', text: 'x' });
    bad.title = 't';
    await expect(reddit.publish(ctx(), bad)).rejects.toMatchObject({ code: 'TOKEN_INVALID', httpStatus: 401 });
    // a revoked refresh token is an HTTP 200 {"error":"invalid_grant"}
    await expect(reddit.refresh!(ctx(), { ...acc, token: { ...acc.token, refreshToken: 'revoked' } })).rejects.toMatchObject({ code: 'TOKEN_INVALID', message: 'Reddit rejected the token request (invalid_grant).' });
    // video media is posted as kind=video; a missing video is rejected before any call
    expect(reddit.validate({ sr: 'siartest', text: '' }, [{ type: 'video', mime: 'video/mp4', fileSize: 1000, duration: 12 }])).toEqual([]);
    const vid = pub({ sr: 'siartest', text: '' }, 'A clip', [video(12)]);
    expect((await vid.run()).status).toBe('PROCESSING');
    expect(h.state().reddit.posts.at(-1).kind).toBe('video');
  });
});
