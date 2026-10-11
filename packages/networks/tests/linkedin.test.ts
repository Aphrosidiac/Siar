import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { buildCommentary, escapeCommentary, LINKEDIN_VERSION, linkedin } from '../src/adapters/linkedin.js';
import { MB } from '../src/lib/validate.js';
import { harness, media, video, type Harness } from './harness.js';
import type { AccountRuntime, MiscArgs } from '../src/types.js';

let h: Harness;
let acc: AccountRuntime;
const ctx = () => h.ctx('LINKEDIN');
const misc = (op: string, a: Partial<Omit<MiscArgs, 'lookup'>> & { lookup?: any }, account = acc) =>
  linkedin.misc![op](ctx(), account, { query: {}, body: {}, params: {}, lookup: {} as any, ...a } as MiscArgs) as Promise<any>;
const asOrg = (): AccountRuntime => ({ ...acc, channelId: '5515715', externalId: '5515715' });

beforeAll(async () => { h = await harness(); });
beforeEach(async () => { h.registry.state = {}; acc = await h.connect(linkedin); });
afterAll(() => h.close());

describe('linkedin', () => {
  it('connects via OIDC, lists administered organizations as channels, refreshes', async () => {
    expect(acc.displayName).toBe('Siar Test');
    expect(acc.providerPageId).toBe('Qk4xmZp7aD');
    expect(acc.channels).toEqual([expect.objectContaining({ id: '5515715', name: 'Siar Labs', username: 'siar-labs', avatarUrl: expect.stringContaining('siar-logo') })]);
    const t2 = await linkedin.refresh!(ctx(), acc);
    expect(t2.accessToken).not.toBe(acc.token.accessToken);
    expect(await linkedin.checkConnection(ctx(), { ...acc, token: { accessToken: 'dead' } })).toBe(false);
    await expect(linkedin.refresh!(ctx(), { ...acc, token: { ...acc.token, refreshToken: 'gone' } })).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
    // An app without the organization scopes still connects, just with no channels.
    h.state().linkedin.noOrgScope = true;
    expect((await linkedin.refreshProfile(ctx(), acc)).channels).toEqual([]);
  });

  it('posts text with escaped commentary, versioned headers, images, a document and an article', async () => {
    // Unescaped "(" would truncate; the adapter escapes it. LINKEDIN_VERSION is what the mock gated on.
    expect(LINKEDIN_VERSION).toMatch(/^\d{6}$/);
    const t = await linkedin.publish(ctx(), h.input(acc, { text: 'Launch day (finally) #siar', privacy: 'CONNECTIONS', hideFromFeed: true, disableReshare: true }));
    expect(t.status).toBe('POSTED');
    const st = h.state().linkedin;
    const urn = (t as any).externalPostId as string;
    expect(urn).toMatch(/^urn:li:share:\d+$/);
    expect(st.posts[urn]).toMatchObject({ author: 'urn:li:person:Qk4xmZp7aD', visibility: 'CONNECTIONS', isReshareDisabledByAuthor: true, distribution: { feedDistribution: 'NONE' } });
    expect(st.posts[urn].commentary).toBe('Launch day \\(finally\\) #siar');
    expect(st.posts[urn].rendered).toBe(st.posts[urn].commentary); // nothing cut off
    expect((t as any).permalink).toBe(`https://www.linkedin.com/feed/update/${urn}/`);

    const imgs = await linkedin.publish(ctx(), h.input(acc, { text: 'Two images' }, [media({ altText: 'one' }), media()]));
    expect(st.posts[(imgs as any).externalPostId].content.multiImage.images).toHaveLength(2);
    expect(st.posts[(imgs as any).externalPostId].content.multiImage.images[0].altText).toBe('one');

    const pdf = media({ type: 'document', mime: 'application/pdf', ext: 'pdf' });
    const d = await linkedin.publish(ctx(), h.input(acc, { text: 'Deck' }, [pdf]));
    expect(d.status).toBe('POSTED'); // documents are AVAILABLE straight away
    expect(st.posts[(d as any).externalPostId].content.media.title).toMatch(/\.pdf$/);

    const art = await linkedin.publish(ctx(), h.input(acc, { text: 'Read this', link: 'https://siar.dev/blog', mediaTitle: 'The blog', thumbnail: 't1' }));
    expect(st.posts[(art as any).externalPostId].content.article).toMatchObject({ source: 'https://siar.dev/blog', title: 'The blog', thumbnail: expect.stringMatching(/^urn:li:image:/) });
  });

  it('uploads video in parts, waits for AVAILABLE, then posts as the organization', async () => {
    const input = h.input(asOrg(), { text: 'Org video', mediaTitle: 'Demo' }, [video(20, 9 * MB)]);
    const first = await linkedin.publish(ctx(), input);
    expect(first.status).toBe('PROCESSING');
    expect(Object.keys(h.state().linkedin.posts)).toHaveLength(0);
    const vid = Object.values<any>(h.state().linkedin.media).find(x => x.kind === 'video');
    expect(vid).toMatchObject({ parts: 3, bytes: 9 * MB, finalized: true });
    const r = await linkedin.poll!(ctx(), input, (first as any).pendingRef);
    expect(r.status).toBe('POSTED');
    expect((r as any).externalPostId).toMatch(/^urn:li:ugcPost:/);
    expect(h.state().linkedin.posts[(r as any).externalPostId]).toMatchObject({ author: 'urn:li:organization:5515715', content: { media: { title: 'Demo' } } });
  });

  it('comments, replies, edits, deletes, imports; reads analytics and history; edits and deletes posts', async () => {
    const p = await linkedin.publish(ctx(), h.input(acc, { text: 'Hello LinkedIn' }));
    const urn = (p as any).externalPostId as string;
    const c = await linkedin.comment!(ctx(), { account: acc, externalPostId: urn, text: 'First (comment)', media: [], data: {} });
    expect(c.externalId).toBe(`urn:li:comment:(${urn},${(c.externalData as any).id})`);
    const reply = await linkedin.comment!(ctx(), { account: acc, externalPostId: urn, parentExternalId: c.externalId, text: 'reply', media: [], data: {} });
    await misc('misc.linkedin.editComment', { body: { commentId: 'c1', text: 'edited' }, lookup: { comment: async () => ({ externalId: c.externalId, externalPostId: urn }) } });
    const page = await linkedin.importComments!(ctx(), acc, { externalPostId: urn, limit: 10 });
    expect(page.items.map(x => x.text)).toEqual(['edited', 'reply']);
    expect(page.items[1].externalParentId).toBe(c.externalId);
    expect(page.nextCursor).toBeNull();
    await linkedin.commentAction!(ctx(), acc, { externalId: reply.externalId, externalPostId: urn }, 'DELETE');
    await expect(linkedin.commentAction!(ctx(), acc, { externalId: c.externalId }, 'HIDE')).rejects.toMatchObject({ code: 'NOT_SUPPORTED' });
    // Someone else's comment: LinkedIn's words, verbatim.
    h.state().linkedin.comments[c.externalId].actor = 'urn:li:person:other';
    await expect(linkedin.deleteComment!(ctx(), acc, c.externalId)).rejects.toMatchObject({ code: 'PERMISSION', message: expect.stringContaining('Only the comment author') });

    const lookup = { post: async () => ({ externalPostId: urn, permalink: null, data: {} }) };
    expect(await misc('misc.linkedin.editPost', { body: { postId: 'p', description: 'Edited (v2)' }, lookup })).toMatchObject({ success: true });
    expect(h.state().linkedin.posts[urn].commentary).toBe('Edited \\(v2\\)');
    expect(await linkedin.postAnalytics!(ctx(), acc, urn)).toMatchObject({ impressions: 1800, impressionsUnique: 1300, likes: 40, shares: 2 });
    expect(await linkedin.postAnalytics!(ctx(), asOrg(), urn)).toMatchObject({ impressions: 3100, likes: 52 });
    expect(await linkedin.accountAnalytics!(ctx(), acc)).toMatchObject({ followers: 512 });
    expect((await linkedin.accountAnalytics!(ctx(), asOrg())).followers).toBe(3120);
    const hist = await linkedin.importHistory!(ctx(), acc, { limit: 10 });
    expect(hist.items[0]).toMatchObject({ externalId: urn, type: 'POST' });

    const re = await misc('misc.linkedin.resharePost', { body: { parentPostUrn: urn, commentary: 'Worth a read', visibility: 'PUBLIC' } });
    expect(re).toMatchObject({ success: true, id: expect.stringMatching(/^urn:li:share:/) });
    expect(h.state().linkedin.posts[re.id].reshareContext).toEqual({ parent: urn });
    expect(await misc('misc.linkedin.deletePost', { body: { postId: 'p' }, lookup })).toEqual({ success: true });
    expect(h.state().linkedin.posts[urn]).toBeUndefined();
  });

  it('builds mention commentary and resolves tags', async () => {
    expect(escapeCommentary('a (b) [c] *d* #tag')).toBe('a \\(b\\) \\[c\\] \\*d\\* #tag');
    expect(escapeCommentary(escapeCommentary('x (y)'))).toBe('x \\(y\\)'); // idempotent
    const built = buildCommentary('Thanks @Jane Doe (CEO) and @Siar Labs!', [{ display: 'Jane Doe', urn: 'urn:li:person:jane1' }, { display: 'Siar Labs', urn: 'urn:li:organization:5515715' }]);
    expect(built).toBe('Thanks @[Jane Doe](urn:li:person:jane1) \\(CEO\\) and @[Siar Labs](urn:li:organization:5515715)!');
    const viaMisc = await misc('misc.linkedin.buildCommentary', { body: { text: 'Hi @Jane Doe', tags: [{ display: 'Jane Doe', urn: 'urn:li:person:jane1' }] } });
    expect(viaMisc.commentary).toBe('Hi @[Jane Doe](urn:li:person:jane1)');
    // A built mention survives publishing and is not cut off.
    const p = await linkedin.publish(ctx(), h.input(acc, { text: built }));
    const stored = h.state().linkedin.posts[(p as any).externalPostId];
    expect(stored.commentary).toBe(built);
    expect(stored.rendered).toBe(built);

    const orgs = await misc('misc.linkedin.getTags', { query: { q: 'https://www.linkedin.com/company/siar-labs/' } });
    expect(orgs.organizations[0]).toMatchObject({ kind: 'organization', urn: 'urn:li:organization:5515715', display: 'Siar Labs', vanityName: 'siar-labs' });
    const known = await misc('misc.linkedin.getTags', { query: { q: 'urn:li:person:jane1' } });
    expect(known.people[0]).toMatchObject({ urn: 'urn:li:person:jane1', display: 'Jane Doe', needsDisplayName: false });
    // LinkedIn refuses member lookups for most apps: the caller must supply the name.
    const unknown = await misc('misc.linkedin.getTags', { query: { q: 'urn:li:person:zzz9' } });
    expect(unknown.people[0]).toMatchObject({ display: '', needsDisplayName: true });
    expect((await misc('misc.linkedin.getTags', { query: { q: 'urn:li:person:zzz9', displayName: 'Zed' } })).people[0]).toMatchObject({ display: 'Zed', needsDisplayName: false });
    expect(Object.keys(linkedin.misc!)).toHaveLength(7);
  });

  it('reports LinkedIn errors in its own words', async () => {
    await linkedin.publish(ctx(), h.input(acc, { text: 'Same text' }));
    await expect(linkedin.publish(ctx(), h.input(acc, { text: 'Same text' }))).rejects.toMatchObject({ code: 'DUPLICATE', message: expect.stringContaining('duplicate of urn:li:share:') });
    await expect(linkedin.publish(ctx(), h.input({ ...acc, channelId: '999' }, { text: 'As someone else' }))).rejects.toMatchObject({ code: 'PERMISSION', message: expect.stringContaining('Not enough permissions') });
    await expect(linkedin.deletePost!(ctx(), acc, 'urn:li:share:1')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    h.state().linkedin.failVideo = true;
    const input = h.input(acc, { text: 'Broken video' }, [video(10, 2 * MB)]);
    const first = await linkedin.publish(ctx(), input);
    await linkedin.poll!(ctx(), input, (first as any).pendingRef).catch(() => undefined);
    await expect(linkedin.poll!(ctx(), input, (first as any).pendingRef)).rejects.toMatchObject({ code: 'MEDIA_INVALID' });
    h.state().linkedin.rateLimited = true;
    await expect(linkedin.publish(ctx(), h.input(acc, { text: 'Too many' }))).rejects.toMatchObject({ code: 'RATE_LIMITED', rateLimitResetAt: expect.any(Date) });
    h.state().linkedin.rateLimited = false;
    await expect(linkedin.postAnalytics!(ctx(), { ...acc, token: { accessToken: 'dead' } }, 'urn:li:share:1')).rejects.toMatchObject({ code: 'TOKEN_INVALID' });
  });

  it('validates data', () => {
    const v = (data: any, m: any[] = []) => linkedin.validate(data, m).map(i => i.code);
    expect(v({})).toContain('required');
    expect(v({ text: 'x'.repeat(3001) })).toContain('too_long');
    expect(v({ text: 'ok' }, [video(), media()])).toContain('mixed');
    expect(v({ text: 'ok' }, Array.from({ length: 21 }, () => media()))).toContain('too_many');
    expect(v({ text: 'ok' }, [media({ type: 'document', mime: 'image/png' })])).toContain('mime');
    expect(v({ text: 'ok', link: 'javascript:alert(1)' })).toContain('invalid');
    expect(v({ text: 'ok', privacy: 'EVERYONE' })).toContain('invalid');
    expect(v({ text: 'ok', privacy: 'PUBLIC', link: 'https://siar.dev' }, [media()])).toEqual([]);
  });
});
