/**
 * Siar's approval record, one row per network gate, for /platforms/approvals.
 *
 * Dates come from docs/approvals/*.md (Siar's own application records). Each date names the file it is read from,
 * and the build warns when that date no longer appears in that file, so the page cannot drift from the records
 * without the build log saying so. "What you can do today" is never typed here: the page reads it from
 * lib/status.ts. "Live since" dates for networks with no review are the status constant's `since`.
 */
import type { NetworkType } from '../../../../../packages/networks/src/index.ts';
import { repoFile } from './facts';

export interface Dated { iso: string; src: string }
export interface ApprovalRow {
  /** Row and section anchor. */
  id: string;
  /** Extra anchors that land on this row (e.g. #facebook for the Meta row). */
  aliases?: string[];
  types: NetworkType[];
  label: string;
  gate: string;
  applied: string | (Dated & { prefix?: string })[];
  decided: string | (Dated & { prefix?: string; suffix?: string })[];
  outcome: string;
  /** Which part of a split status line applies (LinkedIn profiles vs company pages). */
  part?: 0 | 1;
}

export const APPROVAL_ROWS: ApprovalRow[] = [
  { id: 'meta', aliases: ['facebook', 'instagram', 'threads'], types: ['FACEBOOK', 'INSTAGRAM', 'THREADS'], label: 'Facebook, Instagram, Threads', gate: 'Meta App Review, plus business verification', applied: [{ iso: '2026-10-14', src: 'meta-review-audit.md' }], decided: [{ iso: '2026-10-27', src: 'meta.md' }], outcome: 'Approved: all PERMS permissions' },
  { id: 'youtube', types: ['YOUTUBE'], label: 'YouTube', gate: 'Google OAuth verification, then a YouTube API compliance audit for more quota', applied: [{ prefix: 'OAuth', iso: '2026-10-14', src: 'README.md' }, { prefix: 'audit', iso: '2026-10-15', src: 'google.md' }], decided: [{ prefix: 'OAuth', iso: '2026-10-15', src: 'google.md' }], outcome: 'OAuth verified. Audit acknowledged ACK, nothing since' },
  { id: 'pinterest', types: ['PINTEREST'], label: 'Pinterest', gate: 'Trial access, then Standard access with a demo film', applied: 'Trial at registration', decided: [{ prefix: 'Trial', iso: '2026-10-21', src: 'pinterest.md' }], outcome: 'Trial approved. Standard not requested yet' },
  { id: 'linkedin', aliases: ['linkedin-profiles'], types: ['LINKEDIN'], label: 'LinkedIn (personal profiles)', gate: 'None: Share on LinkedIn is self-serve', applied: [{ iso: '2026-10-12', src: 'linkedin.md' }], decided: 'Self-serve', outcome: 'Live', part: 0 },
  { id: 'linkedin-company-pages', types: ['LINKEDIN'], label: 'LinkedIn (company pages)', gate: 'Community Management API, vetted, Development then Standard tier', applied: [{ iso: '2026-10-14', src: 'linkedin.md' }], decided: 'No date given', outcome: 'Access denied, no reason given', part: 1 },
  { id: 'tiktok', types: ['TIKTOK'], label: 'TikTok', gate: 'Content Posting API audit', applied: [{ iso: '2026-10-13', src: 'tiktok.md' }], decided: '—', outcome: 'Audit not passed yet; sandbox only' },
  { id: 'x', types: ['TWITTER'], label: 'X', gate: 'None: pay per use', applied: '—', decided: '—', outcome: 'LIVE' },
  { id: 'bluesky', types: ['BLUESKY'], label: 'Bluesky', gate: 'None', applied: '—', decided: '—', outcome: 'LIVE' },
  { id: 'mastodon', types: ['MASTODON'], label: 'Mastodon', gate: 'None: Siar registers itself on each server', applied: '—', decided: '—', outcome: 'LIVE' },
  { id: 'discord', types: ['DISCORD'], label: 'Discord', gate: 'None below 100 servers', applied: '—', decided: '—', outcome: 'LIVE' },
  { id: 'slack', types: ['SLACK'], label: 'Slack', gate: 'None for public distribution', applied: '—', decided: '—', outcome: 'LIVE' },
  { id: 'reddit', types: ['REDDIT'], label: 'Reddit', gate: 'A Reddit API access request', applied: 'Not filed', decided: '—', outcome: 'Built, not open' },
  { id: 'snapchat', types: ['SNAPCHAT'], label: 'Snapchat', gate: 'An allowlist, through a Snap contact', applied: 'Not filed', decided: '—', outcome: 'Built, not open' },
  { id: 'google-business-profile', types: ['GOOGLE_BUSINESS'], label: 'Google Business Profile', gate: 'An access request from a profile verified 60+ days', applied: 'Not filed', decided: '—', outcome: 'Built, not open' },
];

/** Google acknowledged the YouTube audit on this day (README status). */
export const YT_AUDIT_ACK: Dated = { iso: '2026-10-16', src: 'README.md' };

/** The permission names Meta approved: the keys of the submission file, so the count cannot drift. */
export const META_PERMISSIONS: string[] = (() => {
  try { return Object.keys(JSON.parse(repoFile('docs/approvals/meta-review-submission.json'))); } catch { return []; }
})();
if (!META_PERMISSIONS.length) console.warn('[approvals] could not read docs/approvals/meta-review-submission.json');

// Build check: every date must still be in the record it cites.
const seen = new Map<string, string>();
const check = (d: Dated) => {
  if (!seen.has(d.src)) seen.set(d.src, repoFile(`docs/approvals/${d.src}`));
  const text = seen.get(d.src)!;
  if (!text) console.warn(`[approvals] cannot read docs/approvals/${d.src}`);
  else if (!text.includes(d.iso)) console.warn(`[approvals] ${d.iso} is no longer in docs/approvals/${d.src}; re-check the record`);
};
for (const r of APPROVAL_ROWS) for (const v of [r.applied, r.decided]) if (Array.isArray(v)) v.forEach(check);
check(YT_AUDIT_ACK);
