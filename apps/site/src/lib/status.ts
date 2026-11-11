/**
 * The one network-status constant (docs/seo/strike-plan.md §5.0 rule 2, messaging.md §9).
 *
 * Every page, llms.txt, pricing.md and FAQ answer that names a network reads its status from here.
 * Never use the API health endpoint or an adapter's key presence as proof a network is open: "available"
 * there only means keys are on the server (docs/seo/research/siar-truth.md §0).
 *
 * The source of truth is docs/approvals/README.md. When an approval changes, change it here and every
 * page follows at the next build.
 */
import type { NetworkType } from '../../../../packages/networks/src/index.ts';
import { OP_COUNT } from './openapi';

export type Status = 'open' | 'partial' | 'waiting' | 'not-open';

export interface NetworkStatus {
  status: Status;
  /** The exact status line (messaging.md §9). */
  line: string;
  /** Short label for tables. */
  label: string;
  /** What a customer can do today, one sentence. */
  today: string;
  /** ISO date the current status began, where there is a record. */
  since?: string;
  /** Why it is not fully open, when it isn't. */
  why?: string;
}

export const STATUS_LABEL: Record<Status, string> = {
  open: 'Open today',
  partial: 'Partly open',
  waiting: 'Opening after approval',
  'not-open': 'Built, not open yet',
};

export const NETWORK_STATUS: Record<NetworkType, NetworkStatus> = {
  FACEBOOK: { status: 'open', label: 'Open today', line: 'Facebook Pages: open today.', today: 'Publish, schedule, edit and delete Page posts, reels and stories; read and answer comments; Page and post insights.', since: '2026-10-27', },
  INSTAGRAM: { status: 'open', label: 'Open today', line: 'Instagram professional accounts: open today (Facebook Login or Instagram Login).', today: 'Feed posts, carousels, reels and stories on business and creator accounts; comments, first comment and insights.', since: '2026-10-27' },
  THREADS: { status: 'open', label: 'Open today', line: 'Threads: open today.', today: 'Text, image, video and carousel posts, replies, insights and delete.', since: '2026-10-27' },
  TWITTER: { status: 'open', label: 'Open today', line: "X: open today, billed from a prepaid credit at X's own USD prices.", today: "Posts, threads, polls, quotes and replies, paid from a prepaid X credit at X's own USD prices.", since: '2026-10-12' },
  LINKEDIN: { status: 'partial', label: 'Profiles open', line: 'LinkedIn: personal profiles today; company pages open after LinkedIn grants page access.', today: "Posts to a member's own profile with text, images, video, documents and links.", since: '2026-10-12', why: 'LinkedIn has not granted Siar Community Management access, which company pages need.' },
  BLUESKY: { status: 'open', label: 'Open today', line: 'Bluesky: open today.', today: 'Posts with images, video, link cards, quotes, tags and self-labels.', since: '2026-10-12' },
  MASTODON: { status: 'open', label: 'Open today', line: 'Mastodon: open today, on any server.', today: 'Statuses on any Mastodon server, with visibility, content warnings and media.', since: '2026-10-12' },
  DISCORD: { status: 'open', label: 'Open today', line: 'Discord: open today, posting as a bot with a name and avatar per brand.', today: 'Channel messages from a bot whose name and avatar you set per brand.', since: '2026-10-12' },
  SLACK: { status: 'open', label: 'Open today', line: 'Slack: open today. Importing replies is slow, because Slack limits apps outside its Marketplace.', today: 'Channel messages with files and a custom bot name. Reply import runs at one request a minute.', since: '2026-10-12' },
  YOUTUBE: { status: 'partial', label: 'Uploads, public not confirmed', line: 'YouTube: connect and upload now; public uploads not yet confirmed.', today: 'Connect a channel, upload videos and Shorts, read analytics and comments.', since: '2026-10-15', why: "Google lifted the private-only rule for unaudited projects on 2 November 2026; Siar has not yet confirmed a public upload in production. Siar's quota audit is in review." },
  TIKTOK: { status: 'waiting', label: 'Opening after approval', line: 'TikTok: built, opening after TikTok approves Siar.', today: 'Nothing yet. The adapter is built and tested against sandbox accounts.', why: "TikTok's audit of Siar's app has not passed; Siar runs on sandbox keys." },
  PINTEREST: { status: 'waiting', label: 'Connect only', line: 'Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access.', today: 'Connect an account and read boards. Creating Pins waits for Standard access.', why: 'Siar has Trial access; publishing needs Standard access.' },
  REDDIT: { status: 'not-open', label: 'Built, not open yet', line: 'Reddit: built, not open yet.', today: 'Nothing yet.' },
  SNAPCHAT: { status: 'not-open', label: 'Built, not open yet', line: 'Snapchat: built, not open yet.', today: 'Nothing yet.' },
  GOOGLE_BUSINESS: { status: 'not-open', label: 'Built, not open yet', line: 'Google Business Profile: built, not open yet.', today: 'Nothing yet.' },
};

export const statusOf = (t: NetworkType) => NETWORK_STATUS[t];
export const isOpen = (t: NetworkType) => NETWORK_STATUS[t].status === 'open' || NETWORK_STATUS[t].status === 'partial';
/** Networks a customer can publish to today, in the order buyers ask about them. */
export const OPEN_ORDER: NetworkType[] = ['FACEBOOK', 'INSTAGRAM', 'THREADS', 'TWITTER', 'LINKEDIN', 'BLUESKY', 'MASTODON', 'DISCORD', 'SLACK'];
const OPEN_NAMES: Record<string, string> = { FACEBOOK: 'Facebook', INSTAGRAM: 'Instagram', THREADS: 'Threads', TWITTER: 'X', LINKEDIN: 'LinkedIn profiles', BLUESKY: 'Bluesky', MASTODON: 'Mastodon', DISCORD: 'Discord', SLACK: 'Slack' };
const list = (xs: string[]) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}`);
export const OPEN_LIST = list(OPEN_ORDER.filter((t) => NETWORK_STATUS[t].status !== 'waiting' && NETWORK_STATUS[t].status !== 'not-open').map((t) => OPEN_NAMES[t]));

/** The date the status table was last checked against docs/approvals. */
export const STATUS_CHECKED = '2026-11-12';

/** Feature status lines (messaging.md §9). */
export const DM_LINE = 'Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request (paid plans).';
export const TOOLING_LINE = 'TypeScript SDK, CLI and MCP server (version 0.1.0), built from the same OpenAPI contract. Not on npm yet.';
export const OPENAPI_LINE = () => `One REST API, described by a public OpenAPI 3.0 file (${OP_COUNT()} operations).`;

/** "Built for 15 networks" is the only allowed use of the total. */
export const BUILT_FOR = (n: number) => `built for ${n} networks`;

/** The canonical entity paragraph (messaging.md §1), generated so it changes the day a network opens. */
export const CANONICAL =
  'Siar is a unified social media API and dashboard by FF Dev Studio, a software studio in Malaysia. It checks each post against each network\'s rules before sending, sends it to each connected account once, returns the network\'s own error with a plain-English fix, and reports the result through signed webhooks that are retried for about 45 hours. It is priced per organization, not per connected account: 20 free posts to try, then from $19 a month (RM39 in Malaysia). ' +
  `Publishing is open today on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack. YouTube uploads work, and public visibility is not yet confirmed. TikTok, Pinterest publishing and LinkedIn company pages are waiting on those networks' approval. Reddit, Snapchat and Google Business Profile are built but not open yet.`;

/** Status in one short paragraph for meta descriptions and FAQ answers. */
export const STATUS_SUMMARY = `Open today: ${OPEN_LIST}. YouTube uploads work; public uploads are not yet confirmed. TikTok, Pinterest publishing and LinkedIn company pages open after those networks approve Siar. Reddit, Snapchat and Google Business Profile are built, not open yet.`;
