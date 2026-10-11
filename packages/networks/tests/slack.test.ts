import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { slack } from '../src/adapters/slack.js';
import { harness, media, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const lookupOf = (externalPostId: string) => ({ post: async () => ({ externalPostId, data: {} }), comment: async () => ({ externalId: externalPostId }), upload: async () => media() }) as any;

describe('slack', () => {
  it('installs via OAuth v2, lists channels, posts text and files, threads replies, reacts, edits and deletes', async () => {
    const ctx = h.ctx('SLACK');
    const acc = { ...(await h.connect(slack)), channelId: 'C1' };
    expect(acc.providerPageId).toBe('T1');
    expect(acc.token.accessToken).toMatch(/^xoxb-/);
    // Paged, archived hidden, private only where the bot is a member.
    expect(acc.channels.map(c => c.id).sort()).toEqual(['C1', 'C2', 'C3']);
    expect(acc.channels.find(c => c.id === 'C3')?.metadata).toMatchObject({ isPrivate: true });

    const r = await slack.publish(ctx, { ...h.input(acc, { channelId: 'C1', text: 'Hello Slack' }), bot: { name: 'Siar Bot', avatarUrl: 'https://cdn.example/a.png' } });
    expect(r.status).toBe('POSTED');
    const id = (r as any).externalPostId as string;
    expect(id).toMatch(/^C1:\d+\.\d{6}$/);
    expect((r as any).permalink).toMatch(/^https:\/\/siartest\.slack\.com\/archives\/C1\/p\d+$/);
    expect(h.state().slack.messages[0]).toMatchObject({ text: 'Hello Slack', username: 'Siar Bot', icon_url: 'https://cdn.example/a.png' });

    // Files: external upload flow, one message with the text as initial_comment.
    const f = await slack.publish(ctx, h.input(acc, { channelId: 'C1', text: 'with a file' }, [media({ altText: 'square' })]));
    const fid = (f as any).externalPostId as string;
    expect(fid).toMatch(/^C1:\d+\.\d{6}$/);
    const fileMsg = h.state().slack.messages[1];
    expect(fileMsg).toMatchObject({ text: 'with a file', channel: 'C1' });
    expect(Object.values(h.state().slack.files)).toHaveLength(1);

    const c = await slack.comment!(ctx, { account: acc, externalPostId: id, text: 'thread reply', media: [], data: {} });
    expect(h.state().slack.messages.at(-1).thread_ts).toBe(id.split(':')[1]);
    const imported = await slack.importComments!(ctx, acc, { externalPostId: id, limit: 10 });
    expect(imported.items.map(i => i.text)).toEqual(['thread reply', 'Nice one!']);
    expect(imported.items[1]).toMatchObject({ authorName: 'fan.user', likesCount: 2 });

    await slack.commentAction!(ctx, acc, { externalId: id }, 'LIKE');
    await slack.commentAction!(ctx, acc, { externalId: id }, 'LIKE'); // already_reacted is fine
    expect(h.state().slack.messages[0].reactions).toHaveLength(1);
    expect(await slack.postAnalytics!(ctx, acc, id)).toMatchObject({ likes: 4, comments: 2 });
    await slack.commentAction!(ctx, acc, { externalId: id }, 'UNLIKE');
    expect(h.state().slack.messages[0].reactions).toHaveLength(0);

    const edited = await slack.misc!['misc.slack.editMessage'](ctx, acc, { query: {}, body: { postId: 'p', description: 'Hello (edited)' }, params: {}, lookup: lookupOf(id) });
    expect(edited).toMatchObject({ success: true });
    expect(h.state().slack.messages[0].text).toBe('Hello (edited)');
    await slack.misc!['misc.slack.deleteMessage'](ctx, acc, { query: {}, body: { postId: 'p' }, params: {}, lookup: lookupOf(id) });
    expect(h.state().slack.messages[0].deleted).toBe(true);
    await slack.deleteComment!(ctx, acc, c.externalId);
    await slack.deletePost!(ctx, acc, fid);
    expect(h.state().slack.messages[1].deleted).toBe(true);
    expect(await slack.checkConnection(ctx, acc)).toBe(true);
  });

  it('maps { ok: false } bodies to NetworkErrors', async () => {
    const ctx = h.ctx('SLACK');
    expect(slack.validate({ channelId: 'C1', text: 'x'.repeat(40_001) }, [])[0].code).toBe('too_long');
    const acc = { ...(await h.connect(slack)), channelId: 'C1' };
    await expect(slack.publish(ctx, h.input(acc, { channelId: 'C9', text: 'x' }))).rejects.toMatchObject({ code: 'PERMISSION', message: 'not_in_channel', httpStatus: 200 });
    await expect(slack.publish(ctx, h.input(acc, { channelId: 'C404', text: 'x' }))).rejects.toMatchObject({ code: 'NOT_FOUND', message: 'channel_not_found' });
    await expect(slack.publish(ctx, h.input({ ...acc, token: { accessToken: 'xoxb-bad' } }, { channelId: 'C1', text: 'x' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID', message: 'invalid_auth' });
    expect(await slack.checkConnection(ctx, { ...acc, token: { accessToken: 'xoxb-bad' } })).toBe(false);
    h.registry.failures.push({ host: 'slack.com', path: '/api/chat.postMessage', status: 429, body: { ok: false, error: 'ratelimited' }, times: 1 });
    await expect(slack.publish(ctx, h.input(acc, { channelId: 'C1', text: 'x' }))).rejects.toMatchObject({ code: 'RATE_LIMITED', isTransient: true });
  });
});
