import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { snapchat } from '../src/adapters/snapchat.js';
import { harness, media, video, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const MB = 1024 * 1024;
const plainOf = (mediaId: string): Buffer => h.state().snapchat.media[mediaId].plain;

describe('snapchat (Public Profile API)', () => {
  it('connects through my_profile + the paged organisation list', async () => {
    const acc = await h.connect(snapchat);
    expect(acc.externalId).toBe('pp1');
    expect(acc.username).toBe('siartest');
    expect(acc.channels).toHaveLength(11); // 10 on the first page + 1 via paging.next_page_id
    expect(acc.channels.slice(0, 2).map(c => c.id)).toEqual(['pp1', 'pp2']);
    expect(acc.channels[0].avatarUrl).toMatch(/logo-640/);
    expect(acc.token.expiresAt).toBeInstanceOf(Date);
    expect(acc.token.expiresAt!.getTime() - Date.now()).toBeGreaterThan(3500 * 1000);
  });

  it('sends the documented authorize URL', async () => {
    const { url } = await snapchat.authorize(h.ctx('SNAPCHAT'), { state: 's1', codeVerifier: 'v', codeChallenge: 'c', serverUrl: null, extra: {} });
    const u = new URL(url);
    expect(`${u.origin}${u.pathname}`).toBe('https://accounts.snapchat.com/login/oauth2/authorize');
    expect(Object.fromEntries(u.searchParams)).toMatchObject({ response_type: 'code', scope: 'snapchat-profile-api', state: 's1' });
  });

  it('encrypts and uploads media in parts, then posts a Story per item, a Spotlight and a Saved Story', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const acc = await h.connect(snapchat);
    const posts = h.state().snapchat.posts;

    const img = media();
    const vid = video(12);
    const story = await snapchat.publish(ctx, h.input(acc, { type: 'STORY', storyDuration: 'TWO_DAYS' }, [img, vid]));
    // The Story endpoint returns no id: the first media id is the reference and the data says so.
    expect(story.status).toBe('POSTED');
    const sd = (story as any).externalData;
    expect(sd).toMatchObject({ type: 'STORY', status: 'PUBLISHED', profileId: 'pp1', storyIdAvailable: false });
    expect((story as any).externalPostId).toBe(sd.mediaIds[0]);
    const stories = posts.filter((p: any) => p.kind === 'story');
    expect(stories).toHaveLength(2);
    expect(stories[0]).toMatchObject({ profile: 'pp1', customized_ttl: { ttl: 'TWO_DAYS' } });
    // The mock decrypted what Siar uploaded with the key/iv it declared: it must be the original bytes.
    expect(plainOf(sd.mediaIds[1]).equals(Buffer.alloc(2 * MB, 1))).toBe(true);
    expect(h.state().snapchat.media[sd.mediaIds[1]]).toMatchObject({ type: 'VIDEO' });
    expect(h.state().snapchat.media[sd.mediaIds[0]]).toMatchObject({ type: 'IMAGE' });

    const spot = await snapchat.publish(ctx, h.input({ ...acc, channelId: 'pp2' }, { type: 'SPOTLIGHT', description: 'Look at this #siar', locale: 'en_US' }, [video()]));
    expect(spot.status).toBe('REVIEW'); // SUBMITTED until Snap approves
    const spotId = (spot as any).externalPostId as string;
    expect((spot as any).pendingRef).toBe(spotId);
    expect(posts.find((p: any) => p.kind === 'spotlight')).toMatchObject({ profile: 'pp2', description: 'Look at this #siar', locale: 'en_US' });
    expect(posts.find((p: any) => p.kind === 'spotlight')).not.toHaveProperty('skip_save_to_profile');
    const spotInput = h.input({ ...acc, channelId: 'pp2' }, { type: 'SPOTLIGHT' }, []);
    // First look: the mock still has it SUBMITTED; second look: LIVE.
    const first = await snapchat.poll!(ctx, spotInput, spotId);
    expect(first.status).toBe('REVIEW');
    const live = await snapchat.poll!(ctx, spotInput, spotId);
    expect(live.status).toBe('POSTED');
    expect(live.status === 'POSTED' && live.permalink).toContain(spotId);

    const saved = await snapchat.publish(ctx, h.input(acc, { type: 'SAVED_STORY', title: 'Highlights' }, [media(), media()]));
    expect(saved.status).toBe('POSTED');
    const ss = posts.find((p: any) => p.kind === 'saved_story');
    expect(ss.media_ids).toHaveLength(2);
    expect((saved as any).externalPostId).toBe(ss.saved_story_id);

    const t = await snapchat.refresh!(ctx, acc);
    expect(t.accessToken).not.toBe(acc.token.accessToken);
    expect(await snapchat.checkConnection(ctx, { ...acc, token: t })).toBe(true);
  });

  it('splits a large file into ≤ 32 MB encrypted parts that decrypt back to the original', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const acc = await h.connect(snapchat);
    const big = video(30, 70 * MB);
    const r = await snapchat.publish(ctx, h.input(acc, { type: 'STORY' }, [big]));
    const mediaId = (r as any).externalData.mediaIds[0];
    const stored = h.state().snapchat.media[mediaId];
    expect([...stored.parts.keys()]).toEqual([1, 2, 3]); // 70 MB + padding = 32 + 32 + 6
    for (const part of stored.parts.values()) expect(part.length).toBeLessThanOrEqual(32 * MB);
    expect(stored.plain.length).toBe(70 * MB);
    expect(stored.plain.equals(Buffer.alloc(70 * MB, 1))).toBe(true);
  }, 60_000);

  it('treats MEDIA_POSTING_ALREADY_IN_PROGRESS as the post being sent, never as a failure that re-posts', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const acc = await h.connect(snapchat);
    h.registry.failures.push({ host: 'businessapi.snapchat.com', path: '/v1/public_profiles/pp1/stories', status: 400, times: 1, body: { request_status: 'ERROR', error_code: 'MEDIA_POSTING_ALREADY_IN_PROGRESS', display_message: 'already in progress', debug_message: 'already in progress' } });
    const r = await snapchat.publish(ctx, h.input(acc, { type: 'STORY' }, [media()]));
    expect(r.status).toBe('POSTED');
    expect((r as any).externalData.alreadyInProgress).toBe(true);
  });

  it('never reports an unseen outcome of the posting call as retryable', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const acc = await h.connect(snapchat);
    h.registry.failures.push({ host: 'businessapi.snapchat.com', path: '/v1/public_profiles/pp1/stories', status: 502, times: 1, body: { error: 'bad gateway' } });
    await expect(snapchat.publish(ctx, h.input(acc, { type: 'STORY' }, [media()]))).rejects.toMatchObject({ code: 'UNKNOWN', isTransient: false, httpStatus: 502 });
  });

  it('turns a rejected Spotlight into CONTENT_REJECTED', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const acc = await h.connect(snapchat);
    const spot = await snapchat.publish(ctx, h.input(acc, { type: 'SPOTLIGHT', description: 'reject-me', locale: 'en_US' }, [video()]));
    const inp = h.input(acc, { type: 'SPOTLIGHT' }, []);
    await snapchat.poll!(ctx, inp, (spot as any).pendingRef);
    await expect(snapchat.poll!(ctx, inp, (spot as any).pendingRef)).rejects.toMatchObject({ code: 'CONTENT_REJECTED' });
  });

  it('validates per type and maps API errors', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const img = { type: 'image' as const, mime: 'image/png', fileSize: 100 };
    const vid = { type: 'video' as const, mime: 'video/mp4', fileSize: 100, duration: 20, width: 1080, height: 1920 };
    expect(snapchat.validate({ type: 'SPOTLIGHT', locale: 'en_US' }, [img]).map(i => i.code)).toContain('type');
    expect(snapchat.validate({ type: 'SPOTLIGHT', locale: 'en_US', description: 'x'.repeat(161) }, [vid])[0].code).toBe('too_long');
    expect(snapchat.validate({ type: 'SPOTLIGHT' }, [vid])).toEqual([]); // locale defaults to en_US
    expect(snapchat.validate({ type: 'SPOTLIGHT', locale: 'english' }, [vid])[0]).toMatchObject({ code: 'invalid', path: ['locale'] });
    expect(snapchat.validate({ type: 'SPOTLIGHT', locale: 'en_US' }, [{ ...vid, duration: 5.5 }])[0]).toMatchObject({ code: 'too_short' });
    expect(snapchat.validate({ type: 'STORY' }, [{ ...vid, duration: 5.5 }])).toEqual([]);
    expect(snapchat.validate({ type: 'SAVED_STORY' }, [img])[0]).toMatchObject({ code: 'required', path: ['title'] });
    expect(snapchat.validate({ type: 'SAVED_STORY', title: 'y'.repeat(46) }, [img])[0].code).toBe('too_long');
    expect(snapchat.validate({ type: 'SAVED_STORY', title: 'ok' }, [vid, vid, vid, vid, vid, vid, vid, vid, vid, vid].map(v => ({ ...v, duration: 40 }))).map(i => i.code)).toEqual(['too_long']);
    expect(snapchat.validate({ type: 'STORY' }, [])[0].code).toBe('required');
    expect(snapchat.validate({ type: 'STORY' }, [{ ...vid, duration: 90 }])[0].code).toBe('too_long');
    expect(snapchat.validate({ type: 'STORY' }, [{ ...vid, mime: 'video/quicktime' }])[0].code).toBe('mime'); // .mp4 only
    expect(snapchat.validate({ type: 'STORY' }, [{ ...vid, width: 480, height: 640 }])[0].code).toBe('too_small');
    expect(snapchat.validate({ type: 'STORY', storyDuration: 'FOREVER' }, [img])[0]).toMatchObject({ code: 'invalid', path: ['storyDuration'] });
    expect(snapchat.validate({ type: 'STORY', storyDuration: 'ONE_WEEK' }, [img, vid])).toEqual([]);

    const acc = await h.connect(snapchat);
    await expect(snapchat.publish(ctx, h.input({ ...acc, token: { accessToken: 'expired' } }, { type: 'STORY' }, [media()]))).rejects.toMatchObject({ code: 'TOKEN_INVALID', httpStatus: 401 });
    // The service refuses a Spotlight made of an image: its message is surfaced verbatim.
    await expect(snapchat.publish(ctx, h.input(acc, { type: 'SPOTLIGHT', locale: 'en_US' }, [media()]))).rejects.toMatchObject({ code: 'MEDIA_INVALID', message: 'Spotlight media must be a video' });
    // A profile the member cannot post to is the allowlist / permission error.
    await expect(snapchat.publish(ctx, h.input({ ...acc, channelId: 'nope' }, { type: 'STORY' }, [media()]))).rejects.toMatchObject({ code: 'PERMISSION', httpStatus: 403 });
    expect(await snapchat.checkConnection(ctx, { ...acc, token: { accessToken: 'expired' } })).toBe(false);
  });
});
