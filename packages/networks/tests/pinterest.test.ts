import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { pinterest } from '../src/adapters/pinterest.js';
import { MB } from '../src/lib/validate.js';
import { harness, media, video, type Harness } from './harness.js';
import type { AccountRuntime, MiscArgs } from '../src/types.js';

let h: Harness;
let acc: AccountRuntime;
const ctx = () => h.ctx('PINTEREST');
const misc = (op: string, a: Partial<Omit<MiscArgs, 'lookup'>> & { lookup?: any }) =>
  pinterest.misc![op](ctx(), acc, { query: {}, body: {}, params: {}, lookup: {} as any, ...a } as MiscArgs) as Promise<any>;

beforeAll(async () => { h = await harness(); });
beforeEach(async () => { h.registry.state = {}; acc = await h.connect(pinterest); });
afterAll(() => h.close());

describe('pinterest (v5)', () => {
  it('connects with Basic auth, lists boards as channels, refreshes', async () => {
    expect(acc.username).toBe('siartest');
    expect(acc.channels.map(c => c.name)).toEqual(['Product Shots', 'Behind the scenes']);
    expect(acc.token.scopes).toContain('pins:write');
    const t2 = await pinterest.refresh!(ctx(), acc);
    expect(t2.refreshToken).toBe(acc.token.refreshToken);
    expect(t2.accessToken).not.toBe(acc.token.accessToken);
    await expect(pinterest.refresh!(ctx(), { ...acc, token: { ...acc.token, refreshToken: 'gone' } })).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
    expect(await pinterest.checkConnection(ctx(), { ...acc, token: { accessToken: 'dead' } })).toBe(false);
  });

  it('pins an image and a carousel to a board resolved by name, then edits, reads and deletes', async () => {
    const one = await pinterest.publish(ctx(), h.input(acc, { text: 'Hero', description: 'Spring drop', boardName: 'product shots', link: 'https://siar.dev', altText: 'a pixel', isAiGenerated: true }, [media()]));
    expect(one.status).toBe('POSTED');
    const st = h.state().pinterest;
    expect(st.pins[0]).toMatchObject({ board_id: '549755885175', title: 'Hero', link: 'https://siar.dev', alt_text: 'a pixel' });
    expect(st.pins[0].source).toEqual({ source_type: 'image_url', url: 'https://media.siar.test/file.png' });
    const id = (one as any).externalPostId;
    expect((one as any).permalink).toBe(`https://www.pinterest.com/pin/${id}/`);

    const car = await pinterest.publish(ctx(), h.input(acc, { text: 'Set', boardName: 'Behind the scenes' }, [media(), media(), media()]));
    expect(st.pins[0].source.source_type).toBe('multiple_image_urls');
    expect(st.pins[0].source.items).toHaveLength(3);
    expect(car.status).toBe('POSTED');

    const lookup = { post: async () => ({ externalPostId: id, permalink: null, data: {} }) };
    expect(await misc('misc.pinterest.editPin', { body: { postId: 'p', title: 'Hero v2', note: 'n' }, lookup })).toMatchObject({ success: true, permalink: `https://www.pinterest.com/pin/${id}/` });
    expect(st.pins.find((p: any) => p.id === id)).toMatchObject({ title: 'Hero v2', note: 'n' });

    expect(await pinterest.postAnalytics!(ctx(), acc, id)).toMatchObject({ impressions: 5400, saves: 61, likes: 18, comments: 4 });
    expect(await pinterest.accountAnalytics!(ctx(), acc)).toMatchObject({ followers: 840, impressions: 90500 });
    const hist = await pinterest.importHistory!(ctx(), acc, { limit: 10 });
    expect(hist.items).toHaveLength(2);
    expect(hist.items[0]).toMatchObject({ type: 'IMAGE', thumbnail: expect.stringContaining('600') });

    expect(await misc('misc.pinterest.deletePin', { body: { postId: 'p' }, lookup })).toEqual({ success: true });
    expect(st.pins.find((p: any) => p.id === id)).toBeUndefined();
  });

  it('registers, uploads and polls a video pin before creating it', async () => {
    const input = h.input(acc, { text: 'Clip', boardName: 'Product Shots' }, [video(12, 3 * MB)]);
    const first = await pinterest.publish(ctx(), input);
    expect(first.status).toBe('PROCESSING'); // media still "processing" on the first read
    expect(h.state().pinterest.uploads[0].size).toBe(3 * MB);
    expect(h.state().pinterest.pins).toHaveLength(0); // no pin until the media is ready
    const r = await pinterest.poll!(ctx(), input, (first as any).pendingRef);
    expect(r.status).toBe('POSTED');
    expect(h.state().pinterest.pins[0].source).toMatchObject({ source_type: 'video_id', cover_image_key_frame_time: 0 });
    expect(h.state().pinterest.pins[0].video).toBe(true);
  });

  it('reports Pinterest errors in its own words', async () => {
    await expect(pinterest.publish(ctx(), h.input(acc, { text: 'x', boardName: 'Nope' }, [media()]))).rejects.toMatchObject({ code: 'NOT_FOUND', message: expect.stringContaining('"Nope" was not found') });
    h.state().pinterest.trial = true;
    await expect(pinterest.publish(ctx(), h.input(acc, { text: 'x', boardName: 'Product Shots' }, [media()]))).rejects.toMatchObject({ code: 'PERMISSION', message: expect.stringContaining('Trial access') });
    h.state().pinterest.trial = false;
    h.state().pinterest.failMedia = true;
    const input = h.input(acc, { text: 'x', boardName: 'Product Shots' }, [video(8)]);
    const first = await pinterest.publish(ctx(), input);
    await expect(pinterest.poll!(ctx(), input, (first as any).pendingRef)).rejects.toMatchObject({ code: 'MEDIA_INVALID' });
    h.state().pinterest.rateLimited = true;
    await expect(pinterest.deletePost!(ctx(), acc, '1')).rejects.toMatchObject({ code: 'RATE_LIMITED', rateLimitResetAt: expect.any(Date) });
  });

  it('validates data', () => {
    const v = (data: any, m: any[] = [media()]) => pinterest.validate(data, m).map(i => i.code);
    expect(v({ text: 'ok' })).toContain('required'); // no boardName
    expect(v({ boardName: 'b' }, [])).toContain('required'); // no media
    expect(v({ boardName: 'b', text: 'x'.repeat(101) })).toContain('too_long');
    expect(v({ boardName: 'b' }, [media(), video()])).toContain('mixed');
    expect(v({ boardName: 'b' }, Array.from({ length: 6 }, () => media()))).toContain('too_many');
    expect(v({ boardName: 'b', link: 'ftp://x' })).toContain('invalid');
    expect(v({ boardName: 'b', dominantColor: 'red' })).toContain('invalid');
    expect(v({ boardName: 'b', text: 'ok', description: 'd', link: 'https://siar.dev', dominantColor: '#aabbcc' })).toEqual([]);
  });
});
