import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mastodon } from '../src/adapters/mastodon.js';
import { NetworkError } from '../src/lib/errors.js';
import { harness, media, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

describe('mastodon', () => {
  it('connects, publishes text + media idempotently, comments, reads analytics and history', async () => {
    const acc = await h.connect(mastodon, { serverUrl: 'https://mastodon.example' });
    expect(acc.username).toBe('siartest');
    const input = h.input(acc, { text: 'Hello Mastodon', privacy: 'UNLISTED' }, [media({ altText: 'a square' })]);
    const r = await mastodon.publish(h.ctx('MASTODON'), input);
    expect(r.status).toBe('POSTED');
    const again = await mastodon.publish(h.ctx('MASTODON'), input);
    expect(again.status === 'POSTED' && r.status === 'POSTED' && again.externalPostId).toBe(r.status === 'POSTED' ? r.externalPostId : '');
    const st = h.state().mastodon.statuses;
    expect(st).toHaveLength(1);
    expect(st[0].visibility).toBe('unlisted');
    expect(st[0].media_attachments[0].description).toBe('a square');
    const id = (r as any).externalPostId;
    const c = await mastodon.comment!(h.ctx('MASTODON'), { account: acc, externalPostId: id, text: 'first', media: [], data: {} });
    expect(c.externalId).toBeTruthy();
    const imported = await mastodon.importComments!(h.ctx('MASTODON'), acc, { externalPostId: id, limit: 10 });
    expect(imported.items.length).toBeGreaterThanOrEqual(1);
    const m = await mastodon.postAnalytics!(h.ctx('MASTODON'), acc, id);
    expect(m.likes).toBe(7);
    const hist = await mastodon.importHistory!(h.ctx('MASTODON'), acc, { limit: 10 });
    expect(hist.items[0].externalId).toBe(id);
  });

  it('validates length and maps 401 to TOKEN_INVALID', async () => {
    expect(mastodon.validate({ text: 'x'.repeat(501) }, [])[0].code).toBe('too_long');
    const acc = await h.connect(mastodon, { serverUrl: 'https://mastodon.example' });
    const bad = { ...acc, token: { accessToken: 'nope' } };
    await expect(mastodon.publish(h.ctx('MASTODON'), h.input(bad, { text: 'x' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID' } satisfies Partial<NetworkError>);
  });
});
