/**
 * Network API changes that can break a posting app: one source for /network-changes, its RSS and JSON feeds, and
 * (later) the "Latest <Network> changes" block on each network hub (strike plan §5.12).
 *
 * Rules (docs/seo/landing-copy/network-changes.md §13):
 * - `id` is the anchor, `<effective>-<network>-<slug>`. Never change it.
 * - `published` is the first day on siaran.my; never back-date it. `checked` is the last day the sources were re-read.
 * - Every entry is sourced to the network's own pages (see SOURCE_HOSTS). Third-party reports are not sources.
 * - Text that depends on whether the change has happened yet takes `{ before, after }`; the build picks by date, so
 *   nobody has to remember to switch the tense.
 * - The four paragraphs are HTML (inline only) and together run 80 to 150 words.
 */
import type { NetworkType } from '../../../../packages/networks/src/index.ts';
import { SITE_URL } from '../config';

export type Tensed = string | { before: string; after: string };

export interface NetworkChange {
  id: string;
  network: NetworkType;
  title: string;
  /** When the change takes effect (sort key, newest first). */
  effective: string;
  published: string;
  checked: string;
  /** Hub blocks and feed summaries, at most 30 words, plain text. */
  summary: Tensed;
  changed: Tensed;
  breaks: Tensed;
  todo: Tensed;
  siar: Tensed;
  sources: { label: string; url: string }[];
  affects: { label: string; href: string }[];
  corrections?: { date: string; note: string }[];
}

/** Hosts an entry's sources may point at: the networks' own developer sites. */
export const SOURCE_HOSTS = ['learn.microsoft.com', 'developers.google.com', 'docs.slack.dev', 'developers.facebook.com', 'developers.tiktok.com', 'docs.x.com', 'developers.pinterest.com', 'docs.discord.com', 'docs.joinmastodon.org', 'docs.bsky.app', 'github.com/bluesky-social', 'developers.snap.com', 'support.reddithelp.com'];

export const NETWORK_CHANGES: NetworkChange[] = [
  {
    id: '2026-11-16-linkedin-202511-sunset',
    network: 'LINKEDIN',
    title: 'LinkedIn Marketing API version 202511 sunset',
    effective: '2026-11-16',
    published: '2026-11-12',
    checked: '2026-11-12',
    summary: {
      before: 'LinkedIn retires Marketing API version 202511 on 16 November 2026. Calls that still send it get 426 NONEXISTENT_VERSION. Move to 202610.',
      after: 'LinkedIn retired Marketing API version 202511 on 16 November 2026. Calls that still send it get 426 NONEXISTENT_VERSION. Move to 202610.',
    },
    changed: {
      before: 'On 16 November 2026 LinkedIn retires Marketing API version 202511. A request that sends <code>Linkedin-Version: 202511</code> gets HTTP 426 <code>NONEXISTENT_VERSION</code>, "Requested version yyyymmdd is not active". LinkedIn does not fall back to a newer version.',
      after: 'On 16 November 2026 LinkedIn retired Marketing API version 202511. A request that sends <code>Linkedin-Version: 202511</code> gets HTTP 426 <code>NONEXISTENT_VERSION</code>, "Requested version yyyymmdd is not active". LinkedIn does not fall back to a newer version.',
    },
    breaks: 'Any app that pins 202511 on calls under <code>https://api.linkedin.com/rest/</code>, including posts to member profiles and company pages.',
    todo: 'Send a supported version in YYYYMM form. The latest is 202610, supported until 15 October 2027. There is no 202512. The next version to retire is 202601, on 15 January 2027.',
    siar: 'Nothing was needed. Siar sends 202609, supported until 15 September 2027, so posts to LinkedIn profiles through Siar are not affected.',
    sources: [
      { label: 'Versioning', url: 'https://learn.microsoft.com/en-us/linkedin/marketing/versioning' },
      { label: 'API Migration Status', url: 'https://learn.microsoft.com/en-us/linkedin/marketing/integrations/migrations#api-migration-status' },
      { label: 'Error responses, example 5', url: 'https://learn.microsoft.com/en-us/linkedin/marketing/error-responses' },
    ],
    affects: [
      { label: 'LinkedIn API errors: 426', href: '/linkedin-api/errors#426-nonexistent-version' },
      { label: 'LinkedIn API', href: '/linkedin-api' },
    ],
  },
  {
    id: '2026-11-03-youtube-shorts-custom-thumbnails',
    network: 'YOUTUBE',
    title: 'YouTube API custom thumbnails for Shorts',
    effective: '2026-11-03',
    published: '2026-11-12',
    checked: '2026-11-12',
    summary: "YouTube's API now takes custom thumbnails for Shorts, set with thumbnails.set after the video finishes processing. Setting one earlier may not apply.",
    changed: 'Since 3 November 2026, <code>thumbnails.set</code> accepts a custom thumbnail for a YouTube Short once the video has finished processing. Google also added a <code>shortsAspectRatio</code> property to the <code>thumbnails</code> resource.',
    breaks: 'Nothing stops working. It matters to apps that set the thumbnail straight after upload: Google says a thumbnail set before processing completes may not be applied.',
    todo: 'Wait until <code>processingDetails.processingStatus</code> is <code>succeeded</code>, then call <code>thumbnails.set</code> with a JPEG or PNG of up to 50 MB. Each call costs about 50 quota units.',
    siar: 'Not yet changed. Siar sets a thumbnail right after upload, which can be too early for a Short. For Shorts, send it with <a href="/docs/api/misc#misc-youtube-setThumbnail"><code>POST /api/v1/misc/youtube/thumbnail</code></a> after the <a href="/docs/webhooks"><code>post.published</code> webhook</a>.',
    sources: [
      { label: 'Revision history, 3 November 2026', url: 'https://developers.google.com/youtube/v3/revision_history' },
      { label: 'thumbnails.set', url: 'https://developers.google.com/youtube/v3/docs/thumbnails/set' },
    ],
    affects: [
      { label: 'YouTube API', href: '/youtube-api' },
      { label: 'YouTube API errors', href: '/youtube-api/errors' },
    ],
  },
  {
    id: '2026-11-02-youtube-unverified-uploads-not-private',
    network: 'YOUTUBE',
    title: 'YouTube API uploads from unverified projects no longer forced private',
    effective: '2026-11-02',
    published: '2026-11-12',
    checked: '2026-11-12',
    summary: 'YouTube no longer forces uploads from unverified API projects to private. If you leave privacyStatus unset, the video now goes public. Set it on every upload.',
    changed: 'On 2 November 2026 Google reversed its July 2020 rule. Videos uploaded with <code>videos.insert</code> from unverified API projects "are no longer restricted to private viewing" mode. If a request leaves <code>status.privacyStatus</code> unset, the video now defaults to public, though a creator\'s account settings can still make it private.',
    breaks: 'Apps that left privacy unset and relied on the private lock as a safety net. Test and draft uploads from those apps can now go out public.',
    todo: 'Set <code>status.privacyStatus</code> on every upload. Recheck any screen that tells users their videos will stay private.',
    siar: 'Siar always sends a privacy value (public unless you choose otherwise) and warns when YouTube returns private after you asked for public. Siar has not yet confirmed a public upload on its own project, so its YouTube status stays: connect and upload now; public uploads not yet confirmed.',
    sources: [
      { label: 'Revision history, 2 November 2026', url: 'https://developers.google.com/youtube/v3/revision_history' },
      { label: 'videos.insert', url: 'https://developers.google.com/youtube/v3/docs/videos/insert' },
    ],
    affects: [
      { label: 'YouTube API', href: '/youtube-api' },
      { label: 'YouTube API errors: locked private', href: '/youtube-api/errors#locked-private' },
      { label: 'YouTube approval record', href: '/platforms/approvals#youtube' },
    ],
  },
  {
    id: '2026-06-01-youtube-upload-quota-bucket',
    network: 'YOUTUBE',
    title: 'YouTube API uploads get their own quota bucket',
    effective: '2026-06-01',
    published: '2026-11-12',
    checked: '2026-11-12',
    summary: 'YouTube uploads now draw on their own quota bucket, listed at 100 videos.insert calls a day. Check it in the Cloud Console before you scale.',
    changed: 'Since 1 June 2026 the YouTube Data API charges <code>videos.insert</code> and <code>search.list</code> to their own quota buckets. Every other method stays in the existing bucket. The <code>videos.insert</code> page lists 100 calls a day, at 1 unit each, in the Video Uploads bucket.',
    breaks: 'Upload-heavy apps that planned volume from the general quota. They can now run out of uploads while plenty of general quota is left.',
    todo: "Check both buckets in the Google Cloud Console. Ask for more through Google's Quota Extension Form before you need it.",
    siar: "Siar treats YouTube's <code>quotaExceeded</code> as a rate limit: the post keeps YouTube's own error, is marked retryable, and carries the time the quota resets.",
    sources: [
      { label: 'Revision history, 1 June 2026', url: 'https://developers.google.com/youtube/v3/revision_history' },
      { label: 'videos.insert', url: 'https://developers.google.com/youtube/v3/docs/videos/insert' },
    ],
    affects: [
      { label: 'YouTube API errors: quotaExceeded', href: '/youtube-api/errors#403-quotaexceeded' },
      { label: 'YouTube API limits', href: '/platforms/limits#youtube' },
    ],
  },
  {
    id: '2025-05-29-slack-non-marketplace-rate-limits',
    network: 'SLACK',
    title: 'Slack rate limits for apps outside the Marketplace',
    effective: '2025-05-29',
    published: '2026-11-12',
    checked: '2026-11-12',
    summary: 'Slack apps outside its Marketplace can read conversations.history and conversations.replies once a minute, 15 messages at a time. Posting is not affected.',
    changed: 'Since 29 May 2025, Slack apps distributed outside the Slack Marketplace get <code>conversations.history</code> and <code>conversations.replies</code> at 1 request a minute, with at most 15 messages per request. It applies to new apps and new installations. Existing installations keep their old limits, and internal customer-built apps are not affected.',
    breaks: 'Unlisted apps that read channel history or thread replies: archivers, comment importers, support bots. The method reference still lists 50+ requests a minute, so the changelog is the page to trust.',
    todo: 'List the app on the Slack Marketplace, or build it as an internal app for one workspace. Otherwise ask for 15 messages per page and honor <code>Retry-After</code>.',
    siar: 'Siar is not on the Slack Marketplace. It reads replies 15 at a time and waits out each limit, so replies arrive slowly. Posting to channels is not part of this change.',
    sources: [
      { label: 'Rate limit changes for non-Marketplace apps', url: 'https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps' },
      { label: 'conversations.history', url: 'https://docs.slack.dev/reference/methods/conversations.history' },
    ],
    affects: [
      { label: 'Slack API', href: '/slack-api' },
      { label: 'Slack API limits', href: '/platforms/limits#slack' },
    ],
  },
];

// ── helpers ──

/** True while the change is still ahead of `now` (UTC day). */
export const upcoming = (c: NetworkChange, now = new Date()) => c.effective > now.toISOString().slice(0, 10);
/** Picks the before/after text for a tensed field. */
export const tensed = (c: NetworkChange, v: Tensed, now = new Date()) => (typeof v === 'string' ? v : upcoming(c, now) ? v.before : v.after);
export const plain = (html: string) => html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const words = (s: string) => plain(s).split(' ').filter(Boolean).length;

/** All entries, newest first by effective date. */
export const CHANGES: NetworkChange[] = [...NETWORK_CHANGES].sort((a, b) => b.effective.localeCompare(a.effective) || b.published.localeCompare(a.published));
/** The newest `n` entries for one network (hub blocks). */
export const latestFor = (network: NetworkType, n = 3) => CHANGES.filter((c) => c.network === network).slice(0, n);
/** The last day any entry was checked: the page's "Updated" date. */
export const CHANGES_CHECKED = CHANGES.map((c) => c.checked).sort().at(-1)!;

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const abs = (html: string) => html.replace(/href="\//g, `href="${SITE_URL}/`);
const human = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** The entry's four paragraphs and Source line as HTML with absolute links, for the feeds. */
export function entryHtml(c: NetworkChange, now = new Date()) {
  const p = (label: string, v: Parameters<typeof tensed>[1]) => `<p><strong>${label}</strong> ${abs(tensed(c, v, now))}</p>`;
  const src = c.sources.map((s) => `<a href="${s.url}">${esc(s.label)}</a>`).join(', ');
  return [p('What changed.', c.changed), p('Who it breaks.', c.breaks), p('What to do.', c.todo), p('What Siar did.', c.siar), `<p>Source: ${src}, checked ${human(c.checked)}.</p>`].join('');
}


// Build checks: cheap, and they keep the rules honest. They warn rather than fail so one bad entry never takes the
// whole site build down; the warning names the entry.
for (const c of NETWORK_CHANGES) {
  const body = ['changed', 'breaks', 'todo', 'siar'] as const;
  for (const now of [new Date(`${c.effective}T00:00:00Z`), new Date(Date.parse(`${c.effective}T00:00:00Z`) - 86_400_000)]) {
    const n = body.reduce((s, k) => s + words(tensed(c, c[k], now)), 0) + 11; // + the four bold lead-ins
    if (n < 80 || n > 150) console.warn(`[network-changes] ${c.id}: ${n} words; keep entries between 80 and 150`);
    const sw = words(tensed(c, c.summary, now));
    if (sw > 30) console.warn(`[network-changes] ${c.id}: summary is ${sw} words; keep it to 30`);
  }
  if (!c.sources.length) console.warn(`[network-changes] ${c.id}: no source`);
  for (const s of c.sources) if (!SOURCE_HOSTS.some((h) => s.url.replace(/^https:\/\//, '').startsWith(h))) console.warn(`[network-changes] ${c.id}: ${s.url} is not on a network's own site`);
  if (!c.id.startsWith(c.effective)) console.warn(`[network-changes] ${c.id}: id must start with the effective date`);
}
