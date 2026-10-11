import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { splitStorm, twitter, xLength } from '../src/adapters/twitter.js';
import { harness, media, video, type Harness } from './harness.js';
import type { AccountRuntime } from '../src/types.js';

let h: Harness;
let acc: AccountRuntime;
const ctx = () => h.ctx('TWITTER');
beforeAll(async () => { h = await harness(); });
beforeEach(async () => { h.registry.state = {}; acc = await h.connect(twitter); });
afterAll(() => h.close());

describe('twitter (X)', () => {
  it('connects with PKCE, reads the subscription tier and rotates refresh tokens', async () => {
    expect(acc.username).toBe('siartest');
    expect(acc.token.secrets?.subscriptionType).toBe('none');
    expect(acc.token.refreshToken).toBeTruthy();
    const next = await twitter.refresh!(ctx(), acc);
    expect(next.refreshToken).not.toBe(acc.token.refreshToken);
    expect(next.secrets?.subscriptionType).toBe('none');
    // The old refresh token died on use.
    await expect(twitter.refresh!(ctx(), acc)).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
    expect(await twitter.checkConnection(ctx(), { ...acc, token: next })).toBe(true);
    expect(await twitter.checkConnection(ctx(), { ...acc, token: { accessToken: 'dead' } })).toBe(false);
  });

  it('publishes text + images with alt text, reply settings, AI label', async () => {
    const img = media({ id: 'u1' });
    const r = await twitter.publish(ctx(), h.input(acc, { text: 'Hello X', replySettings: 'FOLLOWING', isAiGenerated: true, mediaItems: [{ uploadId: 'u1', altText: 'a pixel' }] }, [img]));
    expect(r.status).toBe('POSTED');
    const st = h.state().twitter;
    expect(st.tweets).toHaveLength(1);
    expect(st.tweets[0]).toMatchObject({ text: 'Hello X', reply_settings: 'following', made_with_ai: true });
    expect(st.media[st.tweets[0].media_ids[0]].alt_text).toBe('a pixel');
    expect((r as any).permalink).toBe(`https://x.com/siartest/status/${(r as any).externalPostId}`);
  });

  it('uploads video in chunks, waits for processing, and posts a poll-free thread', async () => {
    const v = video(12, 9 * 1024 * 1024);
    const r = await twitter.publish(ctx(), h.input(acc, { text: 'Video', thread: [{ text: 'part two' }, { text: 'part three', uploadIds: ['img2'] }] }, [v]));
    expect(r.status).toBe('POSTED');
    const st = h.state().twitter;
    const vm = st.media[st.tweets[0].media_ids[0]];
    expect(vm.segments).toEqual([0, 1, 2]);
    expect(vm.category).toBe('tweet_video');
    expect(st.tweets).toHaveLength(3);
    expect(st.tweets[1].in_reply_to_tweet_id).toBe(st.tweets[0].id);
    expect(st.tweets[2].in_reply_to_tweet_id).toBe(st.tweets[1].id);
    expect((r as any).externalData.threadIds).toHaveLength(3);
  });

  it('returns PROCESSING when video is still processing and finishes in poll()', async () => {
    const v = video(5, 1024);
    const input = h.input(acc, { text: 'slow video' }, [v]);
    // Make every new upload stick in processing until we release it.
    const orig = h.registry.routes.find(r => r.method === 'POST' && r.re.test('/2/media/upload/1/finalize'))!;
    const handler = orig.handler;
    orig.handler = async req => { const out = await handler(req); h.state().twitter.media[req.params.id].stuck = true; return out; };
    const r = await twitter.publish(ctx(), input);
    orig.handler = handler;
    expect(r.status).toBe('PROCESSING');
    for (const md of Object.values<any>(h.state().twitter.media)) md.stuck = false;
    const mid = await twitter.poll!(ctx(), input, (r as any).pendingRef);
    expect(mid.status).toBe('PROCESSING');
    const done = await twitter.poll!(ctx(), input, (mid as any).pendingRef);
    expect(done.status).toBe('POSTED');
    expect(h.state().twitter.tweets).toHaveLength(1);
  });

  it('splits a tweet storm with numbering and rejects >280 on standard accounts before spending credit', async () => {
    const long = Array.from({ length: 120 }, (_, i) => `word${i}`).join(' ');
    expect(xLength(long)).toBeGreaterThan(280);
    const parts = splitStorm(long, true);
    expect(parts.every(p => xLength(p) <= 280)).toBe(true);
    expect(parts[0]).toMatch(/ 1\/\d+$/);
    await expect(twitter.publish(ctx(), h.input(acc, { text: long }))).rejects.toMatchObject({ code: 'VALIDATION' });
    const credits = h.state().twitter.credits;
    const r = await twitter.publish(ctx(), h.input(acc, { text: long, tweetStorm: true, tweetStormNumbering: true }));
    expect(r.status).toBe('POSTED');
    expect(h.state().twitter.tweets).toHaveLength(parts.length);
    expect(h.state().twitter.credits).toBe(credits - parts.length);
  });

  it('sends poll, quote and reply fields on the head tweet', async () => {
    const first = await twitter.publish(ctx(), h.input(acc, { text: 'original' }));
    const id = (first as any).externalPostId;
    await twitter.publish(ctx(), h.input(acc, { text: 'Which?', poll: { options: ['A', 'B'], durationMinutes: 60 }, replyToTweetId: id, subscribersOnly: true }));
    const t = h.state().twitter.tweets[1];
    expect(t.poll).toEqual({ options: ['A', 'B'], duration_minutes: 60 });
    expect(t.in_reply_to_tweet_id).toBe(id);
    expect(t.for_super_followers_only).toBe(true);
  });

  it('comments, imports replies, likes/hides/deletes, reads metrics with fallback, history, reposts', async () => {
    const r = await twitter.publish(ctx(), h.input(acc, { text: 'Metrics please' }));
    const id = (r as any).externalPostId;
    const c = await twitter.comment!(ctx(), { account: acc, externalPostId: id, text: 'first reply', media: [], data: {} });
    const imported = await twitter.importComments!(ctx(), acc, { externalPostId: id, limit: 5 });
    expect(imported.items.map(i => i.externalId)).toContain(c.externalId);
    expect(imported.items.find(i => i.authorName === 'A Fan')?.text).toContain('Great post');
    await twitter.commentAction!(ctx(), acc, { externalId: '1800000000000000099' }, 'LIKE');
    await twitter.commentAction!(ctx(), acc, { externalId: '1800000000000000099' }, 'HIDE');
    expect(h.state().twitter.likes).toContain('1800000000000000099');
    expect(h.state().twitter.hidden).toContain('1800000000000000099');
    await twitter.deleteComment!(ctx(), acc, c.externalId);

    let m = await twitter.postAnalytics!(ctx(), acc, id);
    expect(m.impressions).toBe(160);
    h.state().twitter.tweets.find((t: any) => t.id === id).forceOld = true;
    m = await twitter.postAnalytics!(ctx(), acc, id);
    expect(m.impressions).toBe(150);
    expect(m.likes).toBe(7);
    await expect(twitter.postAnalytics!(ctx(), acc, '123')).rejects.toMatchObject({ code: 'NOT_FOUND' });

    const am = await twitter.accountAnalytics!(ctx(), acc);
    expect(am.followers).toBe(321);
    const hist = await twitter.importHistory!(ctx(), acc, { limit: 10 });
    expect(hist.items[0].externalId).toBe(id);
    const recent = await twitter.recentPosts!(ctx(), acc, new Date(Date.now() - 60_000));
    expect(recent.map(x => x.externalId)).toContain(id);

    const args = (body: any) => ({ query: {}, params: {}, body, lookup: { post: async () => ({ externalPostId: id, data: {} }), comment: async () => ({ externalId: id }), upload: async () => media() } });
    expect(await twitter.misc!['misc.twitter.retweet'](ctx(), acc, args({ tweetId: '555' }))).toEqual({ success: true });
    expect(h.state().twitter.retweets).toContain('555');
    await twitter.misc!['misc.twitter.unretweet'](ctx(), acc, args({ tweetId: '555' }));
    expect(h.state().twitter.retweets).not.toContain('555');
    await twitter.misc!['misc.twitter.deleteTweet'](ctx(), acc, args({ postId: 'p1' }));
    expect(h.state().twitter.tweets.find((t: any) => t.id === id).deleted).toBe(true);
  });

  it('maps duplicate, credits, rate limit and auth errors', async () => {
    await twitter.publish(ctx(), h.input(acc, { text: 'same' }));
    await expect(twitter.publish(ctx(), h.input(acc, { text: 'same' }))).rejects.toMatchObject({ code: 'DUPLICATE', message: 'You are not allowed to create a Tweet with duplicate content.' });
    h.state().twitter.rateLimitNext = true;
    const rl = await twitter.publish(ctx(), h.input(acc, { text: 'rl' })).catch(e => e);
    expect(rl.code).toBe('RATE_LIMITED');
    expect(rl.rateLimitResetAt.getTime()).toBeGreaterThan(Date.now());
    h.state().twitter.credits = 0;
    const cr = await twitter.publish(ctx(), h.input(acc, { text: 'broke' })).catch(e => e);
    expect(cr.code).toBe('PERMISSION');
    expect(cr.userFacingMessage).toMatch(/credit/);
    await expect(twitter.publish(ctx(), h.input({ ...acc, token: { accessToken: 'nope' } }, { text: 'x' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
  });

  it('validates text, media mix, polls and thread items', () => {
    const img = { type: 'image' as const, mime: 'image/png', fileSize: 1000 };
    const vid = { type: 'video' as const, mime: 'video/mp4', fileSize: 1000, duration: 10 };
    expect(twitter.validate({}, [])[0].code).toBe('required');
    expect(twitter.validate({ text: 'x'.repeat(25_001) }, [])[0].code).toBe('too_long');
    expect(twitter.validate({ text: 'x' }, [img, vid]).map(i => i.code)).toContain('mixed');
    expect(twitter.validate({ text: 'x' }, [img, img, img, img, img]).map(i => i.code)).toContain('too_many');
    expect(twitter.validate({ text: 'q', poll: { options: ['only'], durationMinutes: 1 } }, []).map(i => i.code)).toEqual(['poll_options', 'poll_duration']);
    expect(twitter.validate({ text: 'q', poll: { options: ['a', 'b'], durationMinutes: 60 } }, [img]).map(i => i.code)).toContain('poll_media');
    expect(twitter.validate({ text: 'x', replyToTweetId: 'abc' }, []).map(i => i.code)).toContain('invalid_id');
    expect(twitter.validate({ thread: [{ text: '' }] }, []).map(i => i.path.join('.'))).toContain('thread.0');
    expect(twitter.validate({ text: 'fine', replySettings: 'VERIFIED' }, [img])).toEqual([]);
    expect(xLength('https://example.com/a/very/long/path/that/is/long ok')).toBe(26);
    expect(xLength('日本')).toBe(4);
  });
});
