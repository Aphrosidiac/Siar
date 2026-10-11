import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { discord } from '../src/adapters/discord.js';
import { harness, media, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const lookupOf = (externalPostId: string) => ({ post: async () => ({ externalPostId, data: {} }), comment: async () => ({ externalId: externalPostId }), upload: async () => media() }) as any;

describe('discord', () => {
  it('installs the bot, lists text channels, posts through a per-channel webhook, replies and deletes', async () => {
    const ctx = h.ctx('DISCORD');
    const conn = await h.connect(discord);
    expect(conn.providerPageId).toBe('1001');
    expect(conn.channels.map(c => c.id)).toEqual(['2001', '2002']); // text + announcement, not voice/category
    expect(conn.channels[0]).toMatchObject({ name: '#general', metadata: { guildId: '1001' } });

    // Choosing the channel creates (once) the Siar webhook and keeps it in the token secrets.
    const sel = await discord.selectChannel!(ctx, conn, conn.channels[0]);
    const again = await discord.selectChannel!(ctx, conn, conn.channels[0]);
    expect((sel.token!.secrets as any).webhook.id).toBe((again.token!.secrets as any).webhook.id);
    expect(Object.keys(h.state().discord.webhooks)).toHaveLength(1);
    const acc = { ...conn, channelId: '2001', externalId: '2001', token: sel.token! };

    const r = await discord.publish(ctx, { ...h.input(acc, { channelId: '2001', text: 'Hello Discord' }, [media()]), bot: { name: 'Siar Bot', avatarUrl: 'https://cdn.example/a.png' } });
    expect(r.status).toBe('POSTED');
    const id = (r as any).externalPostId as string;
    expect(id).toMatch(/^2001:\d+$/);
    expect((r as any).permalink).toBe(`https://discord.com/channels/1001/2001/${id.split(':')[1]}`);
    const msg = h.state().discord.messages[0];
    expect(msg).toMatchObject({ content: 'Hello Discord', username: 'Siar Bot', avatar_url: 'https://cdn.example/a.png', allowed_mentions: { parse: ['users', 'roles'] } });
    expect(msg.attachments).toHaveLength(1);

    const c = await discord.comment!(ctx, { account: acc, externalPostId: id, text: 'a reply', media: [], data: {} });
    expect(h.state().discord.messages[1].message_reference.message_id).toBe(id.split(':')[1]);

    // A webhook deleted in Discord heals itself: Siar creates a new one and retries once.
    for (const w of Object.values(h.state().discord.webhooks) as any[]) w.deleted = true;
    const r2 = await discord.publish(ctx, h.input(acc, { channelId: '2001', text: 'after the webhook vanished' }));
    expect(r2.status).toBe('POSTED');
    expect(Object.keys(h.state().discord.webhooks)).toHaveLength(2);

    await discord.misc!['misc.discord.deleteMessage'](ctx, acc, { query: {}, body: { postId: 'p' }, params: {}, lookup: lookupOf(id) });
    expect(h.state().discord.messages[0].deleted).toBe(true);
    await discord.deleteComment!(ctx, acc, c.externalId);
    expect(h.state().discord.messages[1].deleted).toBe(true);
    expect(await discord.checkConnection(ctx, acc)).toBe(true);
  });

  it('validates and maps Discord error codes', async () => {
    const ctx = h.ctx('DISCORD');
    expect(discord.validate({ channelId: '1', text: 'x'.repeat(2001) }, [])[0].code).toBe('too_long');
    expect(discord.validate({ channelId: '1', text: 'hi', username: 'Discord Helper' }, [])[0].path).toEqual(['username']);
    expect(discord.validate({ channelId: '1', text: 'hi' }, Array.from({ length: 11 }, () => ({ type: 'image' as const, mime: 'image/png', fileSize: 10 })))[0].code).toBe('too_many');

    const conn = await h.connect(discord);
    const acc = { ...conn, channelId: '2001' };
    await expect(discord.publish(ctx, h.input(acc, { channelId: '9999', text: 'x' }))).rejects.toMatchObject({ code: 'NOT_FOUND', message: 'Unknown Channel' });
    h.registry.failures.push({ host: 'discord.com', path: '/api/v10/channels/2001/webhooks', status: 403, body: { code: 50013, message: 'Missing Permissions' }, times: 1 });
    await expect(discord.selectChannel!(ctx, acc, conn.channels[0])).rejects.toMatchObject({ code: 'PERMISSION', message: 'Missing Permissions' });
    h.registry.failures.push({ host: 'discord.com', path: '/api/v10/channels/2001/webhooks', status: 429, body: { message: 'You are being rate limited.', retry_after: 2.5, global: false }, times: 1 });
    await expect(discord.selectChannel!(ctx, acc, conn.channels[0])).rejects.toMatchObject({ code: 'RATE_LIMITED', isTransient: true });
    // The bot was kicked from the server.
    expect(await discord.checkConnection(ctx, { ...acc, token: { accessToken: '', secrets: { guildId: '555' } } })).toBe(false);
  });
});
