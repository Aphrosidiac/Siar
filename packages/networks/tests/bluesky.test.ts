import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { bluesky } from '../src/adapters/bluesky.js';
import { harness, media, video, type Harness } from './harness.js';

let h: Harness;
beforeAll(async () => { h = await harness(); });
afterAll(() => h.close());

const APP = { identifier: '@siartest.bsky.social', appPassword: 'abcd-efgh-ijkl-mnop' };
const records = () => Object.values(h.state().bluesky.records) as any[];
const posts = () => records().filter(r => r.value.$type === 'app.bsky.feed.post');

describe('bluesky (app password)', () => {
  it('connects, publishes with facets + image + quote + video, replies, imports, likes, reads metrics, deletes', async () => {
    const ctx = h.ctx('BLUESKY');
    const acc = await h.connect(bluesky, { options: APP });
    expect(acc.username).toBe('siartest.bsky.social');
    expect(acc.token.refreshToken).toBeTruthy();
    expect(acc.token.expiresAt).toBeInstanceOf(Date);

    // Facets use UTF-8 byte offsets (the emoji is 4 bytes, é is 2).
    const text = 'Héllo 🌍 @friend.bsky.social read https://siaran.my/docs. #siar';
    const input = h.input(acc, { text, tags: ['dev'], labels: ['graphic-media'] }, [media({ altText: 'a square' })]);
    const r = await bluesky.publish(ctx, input);
    expect(r.status).toBe('POSTED');
    const uri = (r as any).externalPostId as string;
    expect(uri).toMatch(/^at:\/\/did:plc:siartest\d+[a-f]*\/app\.bsky\.feed\.post\/[2-7a-j][2-7a-z]{12}$/);
    const rec = posts()[0].value;
    const slice = (f: any) => Buffer.from(text).subarray(f.index.byteStart, f.index.byteEnd).toString();
    expect(rec.facets.map((f: any) => [f.features[0].$type.split('#')[1], slice(f)])).toEqual([['mention', '@friend.bsky.social'], ['link', 'https://siaran.my/docs'], ['tag', '#siar']]);
    expect(rec.facets[0].features[0].did).toBe('did:plc:friend0000000000000000');
    expect(rec.facets[1].features[0].uri).toBe('https://siaran.my/docs');
    expect(rec.embed.images[0]).toMatchObject({ alt: 'a square', aspectRatio: { width: 64, height: 64 } });
    expect(rec.labels.values).toEqual([{ val: 'graphic-media' }]);
    expect(rec.tags).toEqual(['dev']);

    // A retried publish finds the record it already wrote.
    const again = await bluesky.publish(ctx, input);
    expect(again.status === 'POSTED' && again.externalPostId).toBe(uri);
    expect(posts()).toHaveLength(1);

    // Quote post, then a video post.
    const q = await bluesky.publish(ctx, h.input(acc, { text: 'quoting', quoteUri: uri }));
    expect(posts()[1].value.embed).toMatchObject({ $type: 'app.bsky.embed.record', record: { uri } });
    const v = await bluesky.publish(ctx, h.input(acc, { text: 'a clip', videoAlt: 'spinning' }, [video()]));
    expect(v.status).toBe('POSTED');
    expect(posts()[2].value.embed).toMatchObject({ $type: 'app.bsky.embed.video', alt: 'spinning', aspectRatio: { width: 1080, height: 1920 } });
    expect(q.status).toBe('POSTED');

    // Comments are replies with root + parent.
    const c = await bluesky.comment!(ctx, { account: acc, externalPostId: uri, text: 'first!', media: [], data: {} });
    const reply = records().find(x => x.uri === c.externalId).value;
    expect(reply.reply.root.uri).toBe(uri);
    expect(reply.reply.parent.uri).toBe(uri);
    const imported = await bluesky.importComments!(ctx, acc, { externalPostId: uri, limit: 10 });
    expect(imported.items.map(i => i.text)).toEqual(expect.arrayContaining(['first!', 'Great post!']));
    expect(imported.items.every(i => i.externalParentId === null)).toBe(true);

    // Likes are records; unliking deletes the one the viewer owns.
    await bluesky.commentAction!(ctx, acc, { externalId: uri }, 'LIKE');
    expect(records().filter(x => x.value.$type === 'app.bsky.feed.like')).toHaveLength(1);
    await bluesky.commentAction!(ctx, acc, { externalId: uri }, 'LIKE');
    expect(records().filter(x => x.value.$type === 'app.bsky.feed.like')).toHaveLength(1);
    await bluesky.commentAction!(ctx, acc, { externalId: uri }, 'UNLIKE');
    expect(records().filter(x => x.value.$type === 'app.bsky.feed.like')).toHaveLength(0);

    expect(await bluesky.postAnalytics!(ctx, acc, uri)).toMatchObject({ likes: 5, shares: 3 });
    expect((await bluesky.accountAnalytics!(ctx, acc)).followers).toBe(120);
    const hist = await bluesky.importHistory!(ctx, acc, { limit: 10 });
    expect(hist.items.map(i => i.externalId)).toContain(uri);
    expect(hist.items.find(i => i.externalId === uri)?.type).toBe('IMAGE');

    // Refresh rotates both tokens; the old refresh token is dead.
    const t = await bluesky.refresh!(ctx, acc);
    expect(t.accessToken).not.toBe(acc.token.accessToken);
    await expect(bluesky.refresh!(ctx, acc)).rejects.toMatchObject({ code: 'TOKEN_INVALID' });

    const lookup = { post: async () => ({ externalPostId: uri, data: {} }), comment: async () => ({ externalId: c.externalId }), upload: async () => media() } as any;
    await bluesky.misc!['misc.bluesky.deleteComment'](ctx, acc, { query: {}, body: { commentId: 'x' }, params: {}, lookup });
    expect(records().some(x => x.uri === c.externalId)).toBe(false);
    await bluesky.misc!['misc.bluesky.deletePost'](ctx, acc, { query: {}, body: { postId: 'x' }, params: {}, lookup });
    expect(records().some(x => x.uri === uri)).toBe(false);
  });

  it('validates, maps server errors, and refuses a wrong app password', async () => {
    const ctx = h.ctx('BLUESKY');
    expect(bluesky.validate({ text: '🌍'.repeat(301) }, [])[0].code).toBe('too_long');
    expect(bluesky.validate({ text: 'x' }, [media(), video()]).map(i => i.code)).toEqual(expect.arrayContaining(['mixed']));
    expect(bluesky.validate({ text: 'x', labels: ['spicy'] }, [])[0].code).toBe('invalid');
    expect(bluesky.validate({ text: 'x'.repeat(300) }, [])).toEqual([]);

    const acc = await h.connect(bluesky, { options: APP });
    await expect(bluesky.publish(ctx, h.input({ ...acc, token: { accessToken: 'nope' } }, { text: 'x' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID', httpStatus: 400 });
    // The server's own limit is surfaced when validate() was bypassed.
    await expect(bluesky.publish(ctx, h.input(acc, { text: 'y'.repeat(301) }))).rejects.toMatchObject({ code: 'CONTENT_REJECTED', message: expect.stringContaining('300 graphemes') });
    await expect(bluesky.publish(ctx, h.input(acc, { text: 'big' }, [media({ bytes: Buffer.alloc(1_200_000, 1), fileSize: 1_200_000 })]))).rejects.toMatchObject({ code: 'MEDIA_INVALID' });
    await expect(h.connect(bluesky, { options: { identifier: 'siartest.bsky.social', appPassword: 'wrong' } })).rejects.toMatchObject({ code: 'TOKEN_INVALID', message: 'Invalid identifier or password' });
    await expect(h.connect(bluesky, { options: { appPassword: 'abcd-efgh-ijkl-mnop' } })).rejects.toMatchObject({ code: 'VALIDATION' });
    expect(await bluesky.checkConnection(ctx, { ...acc, token: { accessToken: 'nope' } })).toBe(false);
    expect(await bluesky.checkConnection(ctx, acc)).toBe(true);
  });
});

describe('bluesky (atproto OAuth + DPoP)', () => {
  it('runs PAR + PKCE + DPoP, posts with a DPoP-bound token and refreshes it', async () => {
    const ctx = h.ctx('BLUESKY');
    expect(bluesky.clientMetadata(ctx)).toMatchObject({ client_id: 'https://api.siar.test/api/v1/oauth/bluesky/client-metadata.json', dpop_bound_access_tokens: true, redirect_uris: [ctx.redirectUri] });
    const acc = await h.connect(bluesky, { options: { identifier: 'siartest.bsky.social' } });
    const sec = acc.token.secrets as any;
    expect(sec).toMatchObject({ auth: 'oauth', did: 'did:plc:siartest1234567890abcdef', pds: 'https://pds.siar.test' });
    expect(sec.dpopJwk.d).toBeTruthy();
    const r = await bluesky.publish(ctx, h.input(acc, { text: 'hello over DPoP' }));
    expect(r.status).toBe('POSTED');
    const t = await bluesky.refresh!(ctx, acc);
    expect(t.accessToken).not.toBe(acc.token.accessToken);
    expect(await bluesky.checkConnection(ctx, { ...acc, token: t })).toBe(true);
    // A token used with a different key is refused by the server.
    const stolen = { ...acc, token: { ...acc.token, secrets: { ...sec, dpopJwk: (await h.connect(bluesky, { options: { identifier: 'siartest.bsky.social' } })).token.secrets!.dpopJwk } } };
    await expect(bluesky.publish(ctx, h.input(stolen as any, { text: 'nope' }))).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
  });
});
