import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { snapchat } from '../src/adapters/snapchat.js';
import { harness, media, video, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

describe('snapchat (endpoints unverified — see adapter header)', () => {
  it('connects, uploads media in parts, waits for READY and publishes a Story, a Spotlight and a Saved Story', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const acc = await h.connect(snapchat);
    expect(acc.externalId).toBe('pp1');
    expect(acc.channels.map(c => c.id)).toEqual(['pp1', 'pp2']);
    expect(acc.token.expiresAt).toBeInstanceOf(Date);

    const story = await snapchat.publish(ctx, h.input(acc, { type: 'STORY', storyDuration: 'TWO_DAYS' }, [media(), video()]));
    expect(story.status).toBe('POSTED');
    expect((story as any).externalData).toMatchObject({ type: 'STORY', status: 'PUBLISHED', profileId: 'pp1' });
    expect((story as any).externalData.mediaIds).toHaveLength(2);
    const posts = h.state().snapchat.posts;
    expect(posts.filter((p: any) => p.kind === 'story')).toHaveLength(2);
    expect(posts[0]).toMatchObject({ profile: 'pp1', duration_hours: 48 });

    const spot = await snapchat.publish(ctx, h.input({ ...acc, channelId: 'pp2' }, { type: 'SPOTLIGHT', description: 'Look at this #siar', locale: 'en_US' }, [video()]));
    expect(spot.status === 'POSTED' && spot.permalink).toMatch(/spotlight\//);
    expect(posts.find((p: any) => p.kind === 'spotlight')).toMatchObject({ profile: 'pp2', description: 'Look at this #siar', skip_save_to_profile: false });

    const saved = await snapchat.publish(ctx, h.input(acc, { type: 'SAVED_STORY', title: 'Highlights' }, [media(), media()]));
    expect(saved.status).toBe('POSTED');
    expect(posts.find((p: any) => p.kind === 'saved_story').media_ids).toHaveLength(2);

    const t = await snapchat.refresh!(ctx, acc);
    expect(t.accessToken).not.toBe(acc.token.accessToken);
    expect(await snapchat.checkConnection(ctx, { ...acc, token: t })).toBe(true);
  });

  it('validates per type and maps API errors', async () => {
    const ctx = h.ctx('SNAPCHAT');
    const img = { type: 'image' as const, mime: 'image/png', fileSize: 100 };
    const vid = { type: 'video' as const, mime: 'video/mp4', fileSize: 100, duration: 20 };
    expect(snapchat.validate({ type: 'SPOTLIGHT' }, [img]).map(i => i.code)).toContain('type');
    expect(snapchat.validate({ type: 'SPOTLIGHT', description: 'x'.repeat(161) }, [vid])[0].code).toBe('too_long');
    expect(snapchat.validate({ type: 'SAVED_STORY' }, [img])[0]).toMatchObject({ code: 'required', path: ['title'] });
    expect(snapchat.validate({ type: 'STORY' }, [])[0].code).toBe('required');
    expect(snapchat.validate({ type: 'STORY' }, [{ ...vid, duration: 90 }])[0].code).toBe('too_long');
    expect(snapchat.validate({ type: 'STORY' }, [img, vid])).toEqual([]);

    const acc = await h.connect(snapchat);
    await expect(snapchat.publish(ctx, h.input({ ...acc, token: { accessToken: 'expired' } }, { type: 'STORY' }, [media()]))).rejects.toMatchObject({ code: 'TOKEN_INVALID', httpStatus: 401 });
    // The service refuses a Spotlight made of an image: its message is surfaced verbatim.
    await expect(snapchat.publish(ctx, h.input(acc, { type: 'SPOTLIGHT' }, [media()]))).rejects.toMatchObject({ code: 'MEDIA_INVALID', message: 'Spotlight media must be a video' });
    expect(await snapchat.checkConnection(ctx, { ...acc, token: { accessToken: 'expired' } })).toBe(false);
  });
});
