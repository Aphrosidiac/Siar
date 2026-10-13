import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chunkPlan, tiktok } from '../src/adapters/tiktok.js';
import { MB } from '../src/lib/validate.js';
import { harness, media, video, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const ctx = (creds: Record<string, string> = {}) => h.ctx('TIKTOK', creds);

async function settle(input: Parameters<typeof tiktok.publish>[1], first: Awaited<ReturnType<typeof tiktok.publish>>) {
  let r = first;
  for (let i = 0; i < 5 && r.status === 'PROCESSING'; i++) r = await tiktok.poll!(ctx(), input, r.pendingRef);
  return r;
}

describe('tiktok (Content Posting API)', () => {
  it('connects with PKCE, refreshes with rotation, reads the profile', async () => {
    const acc = await h.connect(tiktok);
    expect(acc.username).toBe('siartest');
    expect(acc.token.secrets?.tiktokApi).toBe('content');
    expect(acc.token.expiresAt).toBeInstanceOf(Date);
    const t2 = await tiktok.refresh!(ctx(), acc);
    expect(t2.refreshToken).not.toBe(acc.token.refreshToken);
    // The spent refresh token no longer works.
    await expect(tiktok.refresh!(ctx(), acc)).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
    expect(await tiktok.checkConnection(ctx(), { ...acc, token: { ...acc.token, accessToken: 'nope' } })).toBe(false);
  });

  it('direct-posts a chunked FILE_UPLOAD video and polls to POSTED', async () => {
    const acc = await h.connect(tiktok);
    const clip = video(20, 25 * MB);
    expect(chunkPlan(clip.fileSize)).toEqual({ chunkSize: 10 * MB, count: 2 });
    const input = h.input(acc, { type: 'VIDEO', text: 'Hello TikTok #siar', privacy: 'PUBLIC_TO_EVERYONE', disableDuet: true, isAiGenerated: true, thumbnailOffset: 1500 }, [clip]);
    const first = await tiktok.publish(ctx(), input);
    expect(first.status).toBe('PROCESSING');
    const p = Object.values(h.state().tiktok.publishes).find((x: any) => x.publish_id === (first as any).pendingRef) as any;
    expect(p.chunks.sort()).toEqual([0, 1]);
    expect(p.post_info).toMatchObject({ privacy_level: 'PUBLIC_TO_EVERYONE', disable_duet: true, disable_stitch: true /* creator has stitch off */, video_cover_timestamp_ms: 1500, is_aigc: true });
    const r = await settle(input, first);
    expect(r.status).toBe('POSTED');
    expect((r as any).permalink).toMatch(/^https:\/\/www\.tiktok\.com\/@siartest\/video\/\d+$/);
    const id = (r as any).externalPostId;
    const m = await tiktok.postAnalytics!(ctx(), acc, id);
    expect(m.views).toBe(1200);
    const hist = await tiktok.importHistory!(ctx(), acc, { limit: 10 });
    expect(hist.items[0].externalId).toBe(id);
    const acct = await tiktok.accountAnalytics!(ctx(), acc);
    expect(acct.followers).toBe(1520);
  });

  it('pulls a video from URL, posts photos, uploads to the inbox (REVIEW)', async () => {
    const acc = await h.connect(tiktok);
    const pull = h.input(acc, { text: 'pulled', privacy: 'SELF_ONLY' }, [video(8)]);
    const r1 = await settle(pull, await tiktok.publish(ctx({ mediaSource: 'PULL_FROM_URL' }), pull));
    // SELF_ONLY posts get no public id; the publish id is the handle.
    expect(r1.status === 'POSTED' && r1.externalPostId.startsWith('v_pub_')).toBe(true);

    const photos = h.input(acc, { type: 'IMAGE', text: 'carousel', privacy: 'FOLLOWER_OF_CREATOR', photoCoverIndex: 1, autoAddMusic: true }, [media({ mime: 'image/jpeg' }), media({ mime: 'image/jpeg' })]);
    const r2 = await settle(photos, await tiktok.publish(ctx(), photos));
    expect(r2.status === 'POSTED' && r2.permalink).toMatch(/\/photo\//);

    const draft = h.input(acc, { text: 'draft', uploadToDraft: true }, [video(8)]);
    const r3 = await settle(draft, await tiktok.publish(ctx(), draft));
    expect(r3.status).toBe('REVIEW');
  });

  it('surfaces the unaudited-app error verbatim and checks creator_info privacy', async () => {
    const acc = await h.connect(tiktok);
    h.state().tiktok.unaudited = true;
    await expect(tiktok.publish(ctx(), h.input(acc, { privacy: 'PUBLIC_TO_EVERYONE' }, [video(8)]))).rejects.toMatchObject({
      code: 'PERMISSION', message: expect.stringContaining('integration guidelines'),
    });
    h.state().tiktok.unaudited = false;
    h.state().tiktok.creator.privacy_level_options = ['SELF_ONLY', 'FOLLOWER_OF_CREATOR'];
    await expect(tiktok.publish(ctx(), h.input(acc, { privacy: 'PUBLIC_TO_EVERYONE' }, [video(8)]))).rejects.toMatchObject({ code: 'VALIDATION' });
    h.state().tiktok.creator.privacy_level_options = ['PUBLIC_TO_EVERYONE', 'MUTUAL_FOLLOW_FRIENDS', 'FOLLOWER_OF_CREATOR', 'SELF_ONLY'];
    await expect(tiktok.publish(ctx(), h.input(acc, { privacy: 'SELF_ONLY' }, [video(900)]))).rejects.toMatchObject({ code: 'MEDIA_INVALID' });
    // Comments need the Business API.
    await expect(tiktok.importComments!(ctx(), acc, { externalPostId: '1', limit: 10 })).rejects.toMatchObject({ code: 'NOT_SUPPORTED' });
  });

  it('reads creator_info for the post form and reports a posting cap as canPost false', async () => {
    const acc = await h.connect(tiktok);
    const get = tiktok.misc!['misc.tiktok.getCreatorInfo']!;
    const args = { query: {}, body: {}, params: {}, lookup: {} as any };
    expect(await get(ctx(), acc, args)).toMatchObject({ canPost: true, business: false, creatorNickname: 'Siar Test', creatorUsername: 'siartest', stitchDisabled: true, commentDisabled: false, maxVideoPostDurationSec: 600, privacyLevelOptions: expect.arrayContaining(['SELF_ONLY']) });
    h.state().tiktok.creatorError = 'spam_risk_too_many_posts';
    expect(await get(ctx(), acc, args)).toMatchObject({ canPost: false, reason: expect.stringContaining('daily posting limit'), privacyLevelOptions: [] });
    h.state().tiktok.creatorError = null;
    await expect(get(ctx(), { ...acc, token: { ...acc.token, accessToken: 'nope' } }, args)).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
  });

  it('validates data', () => {
    const v = (data: any, m: any[]) => tiktok.validate(data, m).map(i => i.code);
    expect(v({ text: 'x' }, [video()])).toContain('required'); // no privacy
    expect(v({ privacy: 'SELF_ONLY' }, [])).toContain('required');
    expect(v({ privacy: 'SELF_ONLY', isBrandContent: true }, [video()])).toContain('invalid');
    expect(v({ privacy: 'PUBLIC_TO_EVERYONE', text: 'x'.repeat(2201) }, [video()])).toContain('too_long');
    expect(v({ type: 'IMAGE', privacy: 'SELF_ONLY', photoCoverIndex: 3 }, [media(), media()])).toContain('invalid');
    expect(v({ type: 'IMAGE', privacy: 'SELF_ONLY', musicSoundInfo: { musicSoundId: 'clip_1' } }, [media({ mime: 'image/jpeg' })])).toContain('unsupported');
    expect(v({ uploadToDraft: true }, [video()])).toEqual([]);
  });
});

describe('tiktok (API for Business)', () => {
  it('connects a business account, posts with commercial music, manages comments, reads CML', async () => {
    const acc = await h.connect(tiktok, { options: { withBusinessScope: true } });
    expect(acc.token.secrets).toMatchObject({ tiktokApi: 'business', businessId: acc.externalId });
    const trending = await tiktok.misc!['misc.tiktok.getCommercialMusicTrendingList'](ctx(), acc, { query: { genre: 'POP', dateRange: '7DAY' }, body: {}, params: {}, lookup: {} as any }) as any[];
    expect(trending[0].trending_song_clip.song_clip_id).toBe('clip_trend_1');
    expect(trending[0]).not.toHaveProperty('commercial_music_id');

    const input = h.input(acc, { text: 'with music', privacy: 'PUBLIC_TO_EVERYONE', musicSoundInfo: { musicSoundId: trending[0].trending_song_clip.song_clip_id, musicSoundVolume: 60 } }, [video(10)]);
    const r = await settle(input, await tiktok.publish(ctx(), input));
    expect(r.status).toBe('POSTED');
    const vid = (r as any).externalPostId;
    expect(h.state().tiktok.publishes[(r as any).externalData.publish_id].music).toMatchObject({ music_sound_id: 'clip_trend_1', music_sound_volume: 60 });

    const c = await tiktok.comment!(ctx(), { account: acc, externalPostId: vid, text: 'Thanks for watching', media: [], data: {} });
    const reply = await tiktok.comment!(ctx(), { account: acc, externalPostId: vid, parentExternalId: `${vid}01`, text: 'reply', media: [], data: {} });
    const page = await tiktok.importComments!(ctx(), acc, { externalPostId: vid, limit: 20 });
    expect(page.items.map(x => x.externalId)).toEqual(expect.arrayContaining([`${vid}01`, c.externalId, reply.externalId]));
    expect(page.items.find(x => x.externalId === reply.externalId)?.externalParentId).toBe(`${vid}01`);
    await tiktok.commentAction!(ctx(), acc, { externalId: `${vid}01`, externalPostId: vid }, 'HIDE');
    await tiktok.misc!['misc.tiktok.deleteComment'](ctx(), acc, { query: {}, body: { commentId: 'cm1' }, params: {}, lookup: { comment: async () => ({ externalId: c.externalId }) } as any });
    expect(h.state().tiktok.comments.find((x: any) => x.comment_id === c.externalId).deleted).toBe(true);
    // Someone else's comment cannot be deleted: TikTok's words, verbatim.
    h.state().tiktok.comments.push({ comment_id: 'other1', video_id: vid, owner: false });
    await expect(tiktok.deleteComment!(ctx(), acc, 'other1')).rejects.toMatchObject({ code: 'PERMISSION', message: expect.stringContaining('only delete comments') });

    expect((await tiktok.accountAnalytics!(ctx(), acc)).followers).toBe(2310);
    expect((await tiktok.postAnalytics!(ctx(), acc, vid)).impressionsUnique).toBe(900);
    const t = await tiktok.refresh!(ctx(), acc);
    expect(t.secrets).toMatchObject({ tiktokApi: 'business' });
    await expect(tiktok.refreshProfile(ctx(), { ...acc, token: { ...acc.token, accessToken: 'bad' } })).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
  });
});
