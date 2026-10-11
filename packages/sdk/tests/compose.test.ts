import { describe, expect, it } from 'vitest';
import { composePost, parseNetworks } from '../src/index.js';

describe('composePost', () => {
  it('builds a post.create body with the same text/media on every network', () => {
    const b = composePost({ teamId: 't1', networks: 'twitter, x, bluesky', text: 'Hi there', uploadIds: ['u1'], at: '2026-10-12T09:00:00Z', firstComment: 'Link below', referenceKey: 'r1', data: { BLUESKY: { text: 'Hi sky' } } });
    expect(b).toEqual({
      teamId: 't1', title: 'Hi there', postDate: '2026-10-12T09:00:00.000Z', status: 'SCHEDULED', referenceKey: 'r1',
      socialAccountTypes: ['TWITTER', 'BLUESKY'],
      data: { TWITTER: { text: 'Hi there', uploadIds: ['u1'] }, BLUESKY: { text: 'Hi sky', uploadIds: ['u1'] } },
      firstComment: { TWITTER: 'Link below', BLUESKY: 'Link below' },
    });
  });

  it('drafts default to now; scheduled posts need at or now', () => {
    expect(composePost({ teamId: 't', networks: ['MASTODON'], text: 'x', draft: true }).status).toBe('DRAFT');
    expect(() => composePost({ teamId: 't', networks: ['MASTODON'], text: 'x' })).toThrow(/publish time/);
    expect(() => composePost({ teamId: 't', networks: ['MASTODON'], text: 'x', at: 'tomorrow' })).toThrow(/Invalid date/);
    expect(() => composePost({ teamId: 't', networks: ['MASTODON'], text: 'x', now: true, data: { TWITTER: {} } })).toThrow(/not one of the selected/);
  });

  it('rejects unknown networks', () => {
    expect(parseNetworks(['google-business', 'gbp'])).toEqual(['GOOGLE_BUSINESS']);
    expect(() => parseNetworks('myspace')).toThrow(/Unknown network/);
  });
});
