import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { threads } from '../src/adapters/threads.js';
import { harness, media, video, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const ctx = () => h.ctx('THREADS');

async function post(acc: Awaited<ReturnType<typeof h.connect>>, data: Record<string, any>, m: ReturnType<typeof media>[] = []) {
  const input = h.input(acc, data, m);
  let r = await threads.publish(ctx(), input);
  expect(r.status).toBe('PROCESSING');
  for (let i = 0; i < 5 && r.status === 'PROCESSING'; i++) r = await threads.poll!(ctx(), input, (r as any).pendingRef);
  return r;
}

describe('threads', () => {
  it('connects, publishes text/media/carousel via container + poll, replies, insights, history', async () => {
    const acc = await h.connect(threads);
    expect(acc.username).toBe('siar.test');
    expect(acc.token.expiresAt).toBeTruthy();
    expect((await threads.refresh!(ctx(), acc)).accessToken).not.toBe(acc.token.accessToken);

    const r = await post(acc, { text: 'Hello Threads', replyControl: 'mentioned_only', topicTag: 'siar', linkAttachment: 'https://siaran.my', poll: undefined });
    expect(r.status).toBe('POSTED');
    const id = (r as any).externalPostId;
    expect((r as any).permalink).toContain('threads.com');
    const st = h.state().threads;
    expect(st.containers[st.posts[0].containerId]).toMatchObject({ media_type: 'TEXT', reply_control: 'mentioned_only', topic_tag: 'siar', link_attachment: 'https://siaran.my' });

    const poll = await post(acc, { text: 'Vote', poll: { optionA: 'Yes', optionB: 'No' } });
    expect(poll.status).toBe('POSTED');
    expect(JSON.parse(Object.values<any>(st.containers).find(c => c.poll_attachment).poll_attachment)).toEqual({ option_a: 'Yes', option_b: 'No' });

    // video: IN_PROGRESS first, then published
    const vInput = h.input(acc, { text: 'clip' }, [video()]);
    const started = await threads.publish(ctx(), vInput);
    expect((await threads.poll!(ctx(), vInput, (started as any).pendingRef)).status).toBe('PROCESSING');
    expect((await threads.poll!(ctx(), vInput, (started as any).pendingRef)).status).toBe('POSTED');

    const car = await post(acc, { text: 'two' }, [media({ mime: 'image/jpeg', url: 'https://media.siar.test/1.jpg' }), media({ mime: 'image/jpeg', url: 'https://media.siar.test/2.jpg' })]);
    expect(car.status).toBe('POSTED');
    expect(Object.values<any>(st.containers).filter(c => c.is_carousel_item === 'true')).toHaveLength(2);

    // replies are comments
    const c = await threads.comment!(ctx(), { account: acc, externalPostId: id, text: 'first reply', media: [], data: {} });
    expect(st.posts.find((p: any) => p.id === c.externalId).reply_to).toBe(id);
    const imported = await threads.importComments!(ctx(), acc, { externalPostId: id, limit: 10 });
    const fan = imported.items.find(x => x.authorName === 'fan_account')!;
    expect(fan.externalParentId).toBeNull();
    await threads.commentAction!(ctx(), acc, { externalId: c.externalId }, 'HIDE');
    expect(st.posts.find((p: any) => p.id === c.externalId).hidden).toBe(true);
    await threads.deleteComment!(ctx(), acc, c.externalId);

    expect(await threads.postAnalytics!(ctx(), acc, id)).toMatchObject({ views: 900, likes: 40, comments: 5, shares: 2 });
    const am = await threads.accountAnalytics!(ctx(), acc);
    expect(am).toMatchObject({ followers: 2300, views: 12000 });
    const hist = await threads.importHistory!(ctx(), acc, { limit: 2 });
    expect(hist.items).toHaveLength(2);
    expect(hist.nextCursor).toBeTruthy();
    await threads.deletePost!(ctx(), acc, id);
    expect(st.posts.find((p: any) => p.id === id).deleted).toBe(true);
  });

  it('validates the spec fields and maps errors', async () => {
    const img = { type: 'image' as const, mime: 'image/jpeg', fileSize: 1000 };
    expect(threads.validate({}, []).map(i => i.code)).toContain('required');
    expect(threads.validate({ text: 'x'.repeat(501) }, [])[0].code).toBe('too_long');
    expect(threads.validate({ text: 'x'.repeat(130) + '🙂'.repeat(100) }, [])[0].code).toBe('too_long');
    expect(threads.validate({ text: 'hi', topicTag: 'a.b' }, [])[0].path).toEqual(['topicTag']);
    expect(threads.validate({ text: 'hi', replyControl: 'nobody' }, [])[0].path).toEqual(['replyControl']);
    expect(threads.validate({ text: 'hi', poll: { optionA: 'a', optionB: 'b' }, linkAttachment: 'https://x.dev' }, []).some(i => i.path[0] === 'poll')).toBe(true);
    expect(threads.validate({ text: 'hi', linkAttachment: 'https://x.dev' }, [img]).some(i => i.path[0] === 'linkAttachment')).toBe(true);
    expect(threads.validate({ text: Array.from({ length: 6 }, (_, i) => `https://e${i}.dev`).join(' ') }, [])[0].code).toBe('too_many');
    expect(threads.validate({ text: 'hello', replyControl: 'everyone' }, [])).toEqual([]);

    const acc = await h.connect(threads);
    // media that fails processing
    const input = h.input(acc, { text: 'x' }, [media({ url: 'https://media.siar.test/bad.png' })]);
    const started = await threads.publish(ctx(), input);
    await expect(threads.poll!(ctx(), input, (started as any).pendingRef)).rejects.toMatchObject({ code: 'MEDIA_INVALID' });
    // bad token
    const bad = { ...acc, token: { accessToken: 'nope' } };
    await expect(threads.publish(ctx(), h.input(bad, { text: 'x' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
    expect(await threads.checkConnection(ctx(), bad)).toBe(false);
  });
});
