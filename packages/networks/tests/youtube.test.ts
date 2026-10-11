import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { youtube } from '../src/adapters/youtube.js';
import { MB } from '../src/lib/validate.js';
import { harness, media, video, type Harness } from './harness.js';
import type { AccountRuntime, MiscArgs } from '../src/types.js';

let h: Harness;
let acc: AccountRuntime;
const ctx = () => h.ctx('YOUTUBE');
const misc = (op: string, a: Partial<Omit<MiscArgs, 'lookup'>> & { lookup?: any }) =>
  youtube.misc![op](ctx(), acc, { query: {}, body: {}, params: {}, lookup: {} as any, ...a } as MiscArgs) as Promise<any>;

beforeAll(async () => { h = await harness(); });
beforeEach(async () => { h.registry.state = {}; acc = await h.connect(youtube); });
afterAll(() => h.close());

describe('youtube', () => {
  it('connects offline, uploads resumably in chunks, polls to POSTED, then comments and reads stats', async () => {
    expect(acc.username).toBe('@siartest');
    expect(acc.channels.map(c => c.id)).toEqual([acc.externalId]);
    expect(acc.token.refreshToken).toBeTruthy();
    const t2 = await youtube.refresh!(ctx(), acc);
    expect(t2.refreshToken).toBe(acc.token.refreshToken); // Google does not rotate
    expect(await youtube.checkConnection(ctx(), { ...acc, token: { accessToken: 'dead' } })).toBe(false);

    const clip = video(45, 18 * MB); // 8 MB chunks → 3 PUTs
    const thumb = media({ id: 'thumb1', mime: 'image/png' });
    const input = h.input(acc, { type: 'SHORT', text: 'Siar short', description: 'made with Siar', privacy: 'UNLISTED', madeForKids: false, containsSyntheticMedia: true, defaultLanguage: 'en', thumbnail: 'thumb1' }, [clip]);
    input.resolveUpload = async () => thumb;
    const first = await youtube.publish(ctx(), input);
    expect(first.status).toBe('PROCESSING');
    const vid = JSON.parse((first as any).pendingRef).videoId as string;
    const stored = h.state().youtube.videos[vid];
    expect(stored.chunks).toBe(3);
    expect(stored.snippet).toMatchObject({ title: 'Siar short', defaultLanguage: 'en' });
    expect(stored.snippet.description).toContain('#Shorts');
    expect(stored.status).toMatchObject({ privacyStatus: 'unlisted', selfDeclaredMadeForKids: false, containsSyntheticMedia: true });
    expect(h.state().youtube.thumbnails[vid].mime).toBe('image/png');

    let r = await youtube.poll!(ctx(), input, (first as any).pendingRef);
    expect(r.status).toBe('PROCESSING'); // first read: still "uploaded"
    r = await youtube.poll!(ctx(), input, (first as any).pendingRef);
    expect(r).toMatchObject({ status: 'POSTED', externalPostId: vid, permalink: `https://www.youtube.com/shorts/${vid}` });

    const top = await youtube.comment!(ctx(), { account: acc, externalPostId: vid, text: 'First!', media: [], data: {} });
    const reply = await youtube.comment!(ctx(), { account: acc, externalPostId: vid, parentExternalId: top.externalId, text: 'a reply', media: [], data: {} });
    await youtube.editComment!(ctx(), acc, top.externalId, 'First, edited');
    const page = await youtube.importComments!(ctx(), acc, { externalPostId: vid, limit: 10 });
    expect(page.items.map(c => c.text)).toEqual(['First, edited', 'a reply']);
    expect(page.items[1].externalParentId).toBe(top.externalId);
    await youtube.commentAction!(ctx(), acc, { externalId: reply.externalId, externalPostId: vid }, 'REJECT');
    expect(h.state().youtube.comments[reply.externalId].moderation).toBe('rejected');
    await youtube.deleteComment!(ctx(), acc, top.externalId);
    expect(h.state().youtube.comments[top.externalId]).toBeUndefined();

    const m = await youtube.postAnalytics!(ctx(), acc, vid);
    expect(m).toMatchObject({ views: 1200, likes: 80, shares: 21 });
    expect(await youtube.accountAnalytics!(ctx(), acc)).toMatchObject({ followers: 1520, postCount: 1, comments: 9 });
    const hist = await youtube.importHistory!(ctx(), acc, { limit: 10 });
    expect(hist.items[0]).toMatchObject({ externalId: vid, type: 'VIDEO', metrics: { views: 1200 } });

    // Misc: playlist round trip, edit, categories.
    const pl = await misc('misc.youtube.createNewChannelPlaylist', { body: { title: 'Launch', description: 'd', privacyStatus: 'public' } });
    const lookup = { post: async () => ({ externalPostId: vid, externalVideoId: vid, data: { type: 'SHORT' } }) };
    const item = await misc('misc.youtube.addVideoToPlaylist', { body: { playlistId: pl.id, postId: 'p1' }, lookup });
    expect((await misc('misc.youtube.getVideosFromPlaylist', { query: { playlistId: pl.id } })).items).toHaveLength(1);
    await expect(misc('misc.youtube.addVideoToPlaylist', { body: { playlistId: pl.id, postId: 'p1' }, lookup })).rejects.toMatchObject({ code: 'DUPLICATE' });
    expect(await misc('misc.youtube.deleteVideoFromPlaylist', { params: { playlistItemId: item.id } })).toBe(true);
    expect(await misc('misc.youtube.deleteChannelPlaylist', { params: { playlistId: pl.id } })).toBe(true);
    const edited = await misc('misc.youtube.editVideo', { body: { postId: 'p1', title: 'Renamed', privacyStatus: 'public' }, lookup });
    expect(edited).toMatchObject({ success: true });
    expect(h.state().youtube.videos[vid].snippet.title).toBe('Renamed');
    expect((await misc('misc.youtube.getVideoCategories', { query: {} })).items.length).toBeGreaterThan(1);
    expect(Object.keys(youtube.misc!)).toHaveLength(14);

    await misc('misc.youtube.deleteVideo', { body: { postId: 'p1' }, lookup });
    expect(h.state().youtube.videos[vid]).toBeUndefined();
  });

  it('keeps the upload when the thumbnail is refused, and surfaces Google errors verbatim', async () => {
    h.state().youtube.noThumbnailPermission = true;
    const input = h.input(acc, { type: 'VIDEO', text: 'Long form', thumbnail: 'thumb1' }, [video(300, 2 * MB)]);
    input.resolveUpload = async () => media({ mime: 'image/jpeg' });
    const r = await youtube.publish(ctx(), input);
    expect(r.status).toBe('PROCESSING');
    expect((r as any).externalData.thumbnailError).toContain('custom video thumbnails');

    // Unaudited API projects get privacy forced to private: say so in the result.
    h.state().youtube.unaudited = true;
    const locked = await youtube.publish(ctx(), h.input(acc, { type: 'VIDEO', text: 'Locked', privacy: 'PUBLIC' }, [video(60)]));
    expect((locked as any).externalData).toMatchObject({ privacyStatus: 'private', requestedPrivacy: 'public' });

    h.state().youtube.quotaExceeded = true;
    await expect(youtube.publish(ctx(), h.input(acc, { text: 'x' }, [video(10)]))).rejects.toMatchObject({
      code: 'RATE_LIMITED', message: expect.stringContaining('exceeded your'), rateLimitResetAt: expect.any(Date),
    });
    h.state().youtube.quotaExceeded = false;
    await expect(youtube.publish(ctx(), h.input(acc, { text: 'bad <title>' }, [video(10)]))).rejects.toMatchObject({ code: 'VALIDATION', message: expect.stringContaining('invalid or empty video title') });
    await expect(youtube.deletePost!(ctx(), acc, 'nope')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    await expect(youtube.refresh!(ctx(), { ...acc, token: { ...acc.token, refreshToken: 'revoked' } })).rejects.toMatchObject({ code: 'TOKEN_INVALID' });

    h.state().youtube.failProcessing = true;
    const dup = await youtube.publish(ctx(), h.input(acc, { text: 'Dup' }, [video(10)]));
    await youtube.poll!(ctx(), h.input(acc, {}), (dup as any).pendingRef);
    await expect(youtube.poll!(ctx(), h.input(acc, {}), (dup as any).pendingRef)).rejects.toMatchObject({ code: 'DUPLICATE' });
  });

  it('validates data', () => {
    const v = (data: any, m: any[] = [video(30)]) => youtube.validate(data, m).map(i => i.code);
    expect(v({ text: 'ok' }, [])).toContain('required'); // no video
    expect(v({ text: 'x'.repeat(101) })).toContain('too_long');
    expect(v({ text: 'a<b' })).toContain('invalid');
    expect(v({ type: 'SHORT' }, [video(240)])).toContain('too_long');
    expect(v({ type: 'VIDEO' }, [video(240)])).toEqual([]);
    expect(v({ privacy: 'SECRET' })).toContain('invalid');
    expect(v({ defaultLanguage: 'not a tag' })).toContain('invalid');
    expect(v({ description: 'é'.repeat(2600) })).toContain('too_long'); // 5,200 bytes
    expect(v({ text: 'ok' }, [media()])).toContain('type');
  });
});
