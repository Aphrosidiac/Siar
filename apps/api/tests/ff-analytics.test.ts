// FF Analytics business endpoint (domain/ff-analytics.ts): the range FF Ops counts and the exclude list it sends.
import { beforeAll, describe, expect, it } from 'vitest';

process.env.DATABASE_URL ??= 'postgresql://localhost:5432/unused';
process.env.SESSION_SECRET ??= 'x'.repeat(40);
process.env.ENCRYPTION_KEY ??= 'y'.repeat(48);

let ff: typeof import('../src/domain/ff-analytics.js');
beforeAll(async () => { ff = await import('../src/domain/ff-analytics.js'); });

describe('ff-analytics', () => {
  it('counts Malaysia calendar days, today included', () => {
    const now = new Date('2026-11-14T00:30:00Z'); // 08:30 MYT on 14 Nov
    expect(ff.rangeFor(7, now).from.toISOString()).toBe('2026-11-07T16:00:00.000Z'); // 8 Nov 00:00 MYT
    expect(ff.rangeFor(1, now).from.toISOString()).toBe('2026-11-13T16:00:00.000Z');
    expect(ff.rangeFor(0, now).days).toBe(30);
    expect(ff.rangeFor(9999, now).days).toBe(400);
  });
  it('keeps only real domains from ?exclude', () => {
    expect(ff.excludeList('FFdev.studio, a.com,,not a domain,b;c.com')).toEqual(['ffdev.studio', 'a.com']);
    expect(ff.excludeList(undefined)).toEqual([]);
  });
});
