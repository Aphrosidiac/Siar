/**
 * Each network's own published posting and rate limits, for /platforms/limits. These are the networks' numbers,
 * quoted from their own developer pages, with the day each page was read. Siar's own numbers are never typed here:
 * the page renders them from the code that enforces them (plans.ts, the adapters, ratelimit.ts).
 *
 * Source: docs/seo/landing-copy/platforms-limits.md (every page fetched 2026-11-12). The build warns when a `checked`
 * date is more than 30 days old (strike plan §5.0 rule 3).
 */
import type { NetworkType } from '../../../../../packages/networks/src/index.ts';

export interface NetworkLimit {
  type: NetworkType;
  /** Table cell: what the network limits. Empty when unverified. */
  limit: string;
  window: string;
  /** The block's paragraph on the network's own limit (HTML; quotes word for word). */
  detail: string;
  sources: { label: string; url: string }[];
  checked: string | null;
}

const C = '2026-11-12';

export const NETWORK_LIMITS: NetworkLimit[] = [
  { type: 'INSTAGRAM', limit: '100 API-published posts per account. The same page also says 50 published posts. A carousel counts as one post', window: '24-hour moving period', checked: C,
    detail: 'Meta\'s content publishing page says, under "Rate Limit": "Instagram accounts are limited to 100 API-published posts within a 24-hour moving period." Under the carousel section\'s "Limitations", the same page says: "Accounts are limited to 50 published posts within a 24-hour period." Both say a carousel counts as one post. Meta doesn\'t explain the difference.',
    sources: [{ label: 'Meta: Instagram content publishing', url: 'https://developers.facebook.com/docs/instagram-platform/content-publishing' }] },
  { type: 'FACEBOOK', limit: 'No fixed number of Page posts is published. API calls with a Page token: 4,800 × the Page\'s engaged users', window: '24 hours', checked: C,
    detail: 'Meta publishes no fixed number of Page posts per day. Calls made with a Page token are capped at "4800 * Number of Engaged Users" within 24 hours, so a quiet Page has less room than a busy one. Usage comes back in the <code>X-Business-Use-Case-Usage</code> header.',
    sources: [{ label: 'Meta: Graph API rate limiting', url: 'https://developers.facebook.com/docs/graph-api/overview/rate-limiting' }] },
  { type: 'THREADS', limit: '250 API-published posts, 1,000 replies, 100 deletions, 500 location searches per profile. A carousel counts as one post', window: '24-hour moving period', checked: C,
    detail: '"Threads profiles are limited to 250 API-published posts within a 24-hour moving period." The same section allows 1,000 replies, 100 deletions and 500 location searches in the same window, and a carousel counts as one post.',
    sources: [{ label: 'Meta: Threads API overview', url: 'https://developers.facebook.com/docs/threads/overview' }] },
  { type: 'TWITTER', limit: 'Create a post: 100 per user per 15 minutes, 10,000 per app per 24 hours. Delete: 50 per user per 15 minutes. Every call is also billed', window: '15 minutes; 24 hours', checked: C,
    detail: 'Creating a post: 100 per user every 15 minutes and 10,000 per app every 24 hours. Deleting: 50 per user every 15 minutes. X adds: "You can be within rate limits but still incur usage costs."',
    sources: [{ label: 'X: rate limits', url: 'https://docs.x.com/x-api/fundamentals/rate-limits' }] },
  { type: 'LINKEDIN', limit: '150 requests per member, 100,000 per app', window: 'Per day, UTC', checked: C,
    detail: 'Share on LinkedIn allows 150 requests per member and 100,000 per application, per UTC day. These are requests, not posts: an image or video post takes three steps on the same page (register the upload, upload the file, create the post).',
    sources: [{ label: 'LinkedIn: Share on LinkedIn', url: 'https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin' }] },
  { type: 'BLUESKY', limit: '5,000 points an hour and 35,000 a day per account; a new record costs 3, so at most 1,666 records an hour and 11,666 a day', window: '1 hour; 1 day', checked: C,
    detail: 'Each account gets 5,000 points an hour and 35,000 a day. Creating a record costs 3 points, so "an account may create at most 1,666 records per hour and 11,666 records per day." Logins (<code>createSession</code>) are limited to 30 per 5 minutes and 300 per day per account, and all requests to 3,000 per 5 minutes per IP.',
    sources: [{ label: 'Bluesky: rate limits', url: 'https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/rate-limits.md' }] },
  { type: 'MASTODON', limit: '300 requests per account (and per IP); media uploads 30; status deletes 30', window: '5 minutes; 30 minutes', checked: C,
    detail: '"All endpoints and methods can be called 300 times within 5 minutes," per account and per IP. Media uploads are limited to 30 in 30 minutes, and status deletes to 30 in 30 minutes. Servers report the state in <code>X-RateLimit-Limit</code>, <code>X-RateLimit-Remaining</code> and <code>X-RateLimit-Reset</code>. These are the defaults of Mastodon\'s software; a server\'s admin can change them.',
    sources: [{ label: 'Mastodon: rate limits', url: 'https://docs.joinmastodon.org/api/rate-limits/' }] },
  { type: 'DISCORD', limit: '50 requests a second per bot; 10,000 invalid requests before a block. Per-route limits come back in headers', window: '1 second; 10 minutes', checked: C,
    detail: '"All bots can make up to 50 requests per second." 10,000 invalid requests (401, 403 or 429) in 10 minutes lead to a temporary block. Per-route limits are returned in response headers, and Discord says they "should not be hard coded".',
    sources: [{ label: 'Discord: rate limits', url: 'https://docs.discord.com/developers/topics/rate-limits' }] },
  { type: 'SLACK', limit: 'About 1 message a second per channel, with bursts; several hundred a minute per workspace', window: '1 second; 1 minute', checked: C,
    detail: '<code>chat.postMessage</code> "will generally allow an app to post 1 message per second to a specific channel", with bursts allowed and several hundred messages a minute per workspace. Slack truncates text above 40,000 characters and recommends 4,000. Since 29 May 2025, new apps outside the Slack Marketplace can read message history once a minute (<a href="https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps" rel="noopener">Slack changelog</a>). That is why reply import is slow.',
    sources: [{ label: 'Slack: chat.postMessage', url: 'https://docs.slack.dev/reference/methods/chat.postMessage' }] },
  { type: 'YOUTUBE', limit: '100 uploads (<code>videos.insert</code>) per project, separate from the 10,000 units for other calls', window: 'Per day', checked: C,
    detail: 'A project gets "100 <code>videos.insert</code> calls, and 10,000 units per day combined for all other endpoints", plus 100 <code>search.list</code> calls. An upload costs 1 unit. On 2 November 2026 Google stopped restricting uploads from unverified projects to private.',
    sources: [{ label: 'Google: YouTube Data API, getting started', url: 'https://developers.google.com/youtube/v3/getting-started' }, { label: 'revision history', url: 'https://developers.google.com/youtube/v3/revision_history' }] },
  { type: 'TIKTOK', limit: '6 requests a minute per user token; a daily post cap per creator, "typically around 15", shared across all apps', window: '1 minute; 1 day', checked: C,
    detail: '"Each user access_token is limited to 6 requests per minute." Each creator also has a daily post cap, "typically around 15 posts per day", shared across every app that posts for them. Until an app passes TikTok\'s audit, at most 5 users can post through it in 24 hours, and only privately.',
    sources: [{ label: 'TikTok: Direct Post reference', url: 'https://developers.tiktok.com/doc/content-posting-api-reference-direct-post' }, { label: 'TikTok: content sharing guidelines', url: 'https://developers.tiktok.com/doc/content-sharing-guidelines' }] },
  { type: 'PINTEREST', limit: 'Creating Pins (<code>org_write</code>): 300 calls a day per app on Trial access; 100 a minute per user per app on Standard', window: '1 day; 1 minute', checked: C,
    detail: 'Creating Pins falls under <code>org_write</code>: 300 calls a day per app on Trial access, and 100 a minute per user per app on Standard access. Pinterest notes the limits can change without notice.',
    sources: [{ label: 'Pinterest: rate limits', url: 'https://developers.pinterest.com/docs/reference/rate-limits/' }] },
  { type: 'REDDIT', limit: '', window: '—', checked: null,
    detail: 'Unverified. Reddit\'s developer pages could not be read on 12 November 2026, so this page quotes no figure.', sources: [] },
  { type: 'SNAPCHAT', limit: '', window: '—', checked: null,
    detail: 'Unverified. Siar has not read a Snapchat page that states a posting rate.', sources: [] },
  { type: 'GOOGLE_BUSINESS', limit: '300 queries a minute once Google approves the project; 0 before', window: '1 minute', checked: C,
    detail: 'A project\'s quota is 0 queries a minute until Google approves it, and 300 a minute after.',
    sources: [{ label: 'Google: Business Profile API prerequisites', url: 'https://developers.google.com/my-business/content/prereqs' }] },
];

/** Per-app or per-project limits that cover every Siar customer on that network (owner check pending, see copy). */
export const PER_APP: { type: NetworkType; text: string }[] = [
  { type: 'LINKEDIN', text: 'LinkedIn: 100,000 requests per app per UTC day.' },
  { type: 'TWITTER', text: 'X: 10,000 new posts per app per 24 hours.' },
  { type: 'YOUTUBE', text: 'YouTube: 100 uploads per project per day.' },
  { type: 'PINTEREST', text: 'Pinterest on Trial access: 300 Pin writes per app per day (Pinterest publishing is not open yet).' },
];

const stale = NETWORK_LIMITS.filter((l) => l.checked && Date.now() - Date.parse(`${l.checked}T00:00:00Z`) > 30 * 86_400_000);
if (stale.length) console.warn(`[network-limits] re-check these sources (checked more than 30 days ago): ${stale.map((l) => l.type).join(', ')}`);
