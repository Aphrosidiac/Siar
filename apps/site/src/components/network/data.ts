/**
 * Shared data for the network hubs, error pages and network topic pages.
 *
 * Status comes only from lib/status.ts. Network facts here carry the network's own URL and the date they
 * were checked (strike-plan.md §5.0 rule 4). Siar facts come from docs/approvals and the adapters.
 */
import type { NetworkType } from '../../lib/networks';
import { NETWORK_STATUS, OPEN_ORDER } from '../../lib/status';

/** The day the network facts on these pages were read on the networks' own pages. */
export const CHECKED = '2026-11-12';
export const CHECKED_HUMAN = '12 November 2026';

/** Networks whose examples may show a Siar request (rule 5: examples use open networks only). */
export const EXAMPLE_OK = (t: NetworkType) => OPEN_ORDER.includes(t) && NETWORK_STATUS[t].status !== 'waiting' && NETWORK_STATUS[t].status !== 'not-open';

/**
 * Pages built by sibling builders in the same wave. Links to them render only when the flag is true, so a
 * hub never links a page that does not exist (strike-plan.md §6 rule 11). Flip a flag the day a page ships.
 */
export const LIVE = {
  approvals: true, // /platforms/approvals
  howPublishing: true, // /how-publishing-works
  errorsHub: true, // /errors
  networkChanges: false, // /network-changes
};

/** Retitles to the posting form (keyword-map.md §F). The layout appends " | Siar". */
export const HUB_TITLE: Record<NetworkType, string> = {
  INSTAGRAM: 'Instagram posting API: reels, stories and carousels',
  FACEBOOK: 'Facebook Page posting API',
  THREADS: 'Threads posting API',
  TWITTER: 'X (Twitter) posting API',
  LINKEDIN: 'LinkedIn profile posting API',
  BLUESKY: 'Bluesky posting and scheduling API',
  MASTODON: 'Mastodon API: post statuses on any server',
  DISCORD: 'Discord posting API: bot messages per brand',
  SLACK: 'Slack API: post and schedule channel messages',
  YOUTUBE: 'YouTube upload API guide: quota, audit and status',
  TIKTOK: 'TikTok Content Posting API guide',
  PINTEREST: 'Pinterest API for posting Pins: access guide',
  REDDIT: 'Reddit API posting guide',
  SNAPCHAT: 'Snapchat Public Profile API guide',
  GOOGLE_BUSINESS: 'Google Business Profile API posting guide',
};

/** Meta descriptions, 120–160 characters, unique per hub. */
export const HUB_DESCRIPTION: Record<NetworkType, string> = {
  INSTAGRAM: 'Post Instagram reels, stories, carousels and feed posts through one REST API. The request, limits, scopes and error codes for professional accounts.',
  FACEBOOK: 'Publish and schedule Facebook Page posts, reels and stories through one REST API: the request, Page limits, permissions, Meta App Review and error codes.',
  THREADS: "Publish text, image, video and carousel posts to Threads through one REST API: the request, Meta's 250-post daily limit, scopes and error codes.",
  TWITTER: "Post to X through one REST API: posts, threads, polls and replies paid from a prepaid credit at X's own USD prices. Request, limits and error codes.",
  LINKEDIN: "Post to LinkedIn member profiles through one REST API: the request, the Linkedin-Version header, rate limits, scopes and the status of company pages.",
  BLUESKY: 'Post and schedule Bluesky posts with images, video and link cards through one REST API: the request, rate limits, app passwords and error codes.',
  MASTODON: 'Post Mastodon statuses on any server through one REST API: the request, visibility and content warnings, rate limits and errors by HTTP status.',
  DISCORD: 'Send and schedule Discord channel messages from a bot with a name and avatar per brand, through one REST API: the request, limits and error codes.',
  SLACK: "Post and schedule Slack channel messages with files and a custom bot name through one REST API: the request, Slack's rate limits and error codes.",
  YOUTUBE: "How YouTube Data API uploads work today: Google's quota, the API audit, the 2 November 2026 privacy change, and where Siar's YouTube integration stands.",
  TIKTOK: "How TikTok's Content Posting API works: the audit, private-only posting for unaudited apps, rate limits and error codes, and where Siar's TikTok stands.",
  PINTEREST: "How posting Pins through Pinterest's API works: Trial and Standard access, scopes, limits and error codes, and where Siar's Pinterest integration stands.",
  REDDIT: "A reference for Reddit's API from Siar's built integration: what a submission needs, flair rules, error codes, and the status of Reddit in Siar.",
  SNAPCHAT: "A reference for Snap's Public Profile API: allowlisting, Stories and Spotlight, error codes, and the status of Siar's Snapchat integration.",
  GOOGLE_BUSINESS: "A reference for Google Business Profile's APIs: access requirements, quota, local post rules, error codes, and the status of Siar's integration.",
};

/** Topic pages that exist, per network, with query-worded anchors. */
export const TOPICS: Partial<Record<NetworkType, { href: string; anchor: string; blurb: string }[]>> = {
  FACEBOOK: [{ href: '/facebook-api/meta-app-review', anchor: 'Meta App Review: our dates and lessons', blurb: 'What Siar submitted, the screencast rules and the 13 days from submission to approval.' }],
  INSTAGRAM: [{ href: '/facebook-api/meta-app-review', anchor: 'Instagram API without App Review', blurb: "When Meta's review is needed for Instagram, and when it isn't." }],
  THREADS: [
    { href: '/threads-api/how-to-post', anchor: 'How to post to Threads via API', blurb: "Containers, publishing, Meta's limits and the same post through Siar." },
    { href: '/facebook-api/meta-app-review', anchor: 'Meta App Review for the Threads API', blurb: 'The threads_* permissions Siar holds and how the review went.' },
  ],
  LINKEDIN: [{ href: '/linkedin-api/community-management-api', anchor: 'LinkedIn Community Management API access', blurb: 'What company pages need, the access tiers, and where Siar stands.' }],
  YOUTUBE: [
    { href: '/youtube-api/quota', anchor: 'YouTube Data API quota, explained', blurb: "Google's daily allocation, the separate upload bucket, quotaExceeded and extensions." },
    { href: '/youtube-api/audit', anchor: 'YouTube API audit and the 2 November 2026 change', blurb: 'What the audit covers and what changed for private uploads.' },
  ],
  PINTEREST: [{ href: '/pinterest-api/access', anchor: 'Pinterest API Trial and Standard access', blurb: 'What Trial access allows, what Standard needs, and where Siar stands.' }],
  SLACK: [{ href: '/slack-api/rate-limits', anchor: 'Slack API rate limits for non-Marketplace apps', blurb: 'The 29 May 2025 change to conversations.history and replies, and chat.postMessage.' }],
  BLUESKY: [{ href: '/bluesky-api/how-to-post', anchor: 'How to post to Bluesky via API', blurb: 'Sessions, createRecord, facets, images, rate limits and the same post through Siar.' }],
};

/**
 * The network's own limits, from its own page, checked on CHECKED. Text may hold inline HTML (code, links).
 * Only facts read on the network's page; nothing inferred.
 */
export const NET_LIMITS: Partial<Record<NetworkType, { text: string; url: string; source: string }[]>> = {
  INSTAGRAM: [
    { text: 'Instagram accounts are limited to 100 API-published posts in a moving 24-hour period, and a carousel counts as one. The same page also says 50 in its carousel section, so plan for the lower number if you post carousels heavily. Check usage with <code>GET /{ig-user-id}/content_publishing_limit</code>.', url: 'https://developers.facebook.com/docs/instagram-platform/content-publishing/', source: 'Meta, content publishing' },
  ],
  THREADS: [
    { text: 'A Threads profile can publish 250 posts, 1,000 replies and 100 deletions through the API in a moving 24-hour period. Text posts are limited to 500 characters. Check usage with <code>GET /{threads-user-id}/threads_publishing_limit</code>.', url: 'https://developers.facebook.com/docs/threads/overview', source: 'Meta, Threads API overview' },
  ],
  TWITTER: [
    { text: 'X bills API use per request with no subscription: creating a post costs $0.015, and a post with a URL $0.200. X blocks requests once a spending limit or the credit balance is reached.', url: 'https://docs.x.com/x-api/getting-started/pricing', source: 'X, pricing' },
  ],
  LINKEDIN: [
    { text: 'Share on LinkedIn allows 150 requests per member per day and 100,000 per app per day.', url: 'https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin', source: 'LinkedIn, Share on LinkedIn' },
    { text: 'Every call to <code>https://api.linkedin.com/rest/</code> needs a <code>Linkedin-Version</code> header in YYYYMM form, and LinkedIn supports each version for at least one year. Version 202511 retires on 16 November 2026.', url: 'https://learn.microsoft.com/en-us/linkedin/marketing/versioning', source: 'LinkedIn, versioning' },
  ],
  BLUESKY: [
    { text: 'Each account gets 5,000 points an hour and 35,000 a day, and creating a record costs 3 points: at most 1,666 records an hour and 11,666 a day.', url: 'https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/rate-limits.md', source: 'Bluesky, rate limits' },
    { text: 'A post holds up to four images, each with its own alt text and aspect ratio, and the guide limits each image to 1,000,000 bytes.', url: 'https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/posts.md', source: 'Bluesky, creating a post' },
  ],
  MASTODON: [
    { text: 'By default every endpoint can be called 300 times in 5 minutes per account and per IP; media uploads and status deletions 30 times in 30 minutes. Servers can change these, and the <code>X-RateLimit-Remaining</code> and <code>X-RateLimit-Reset</code> headers say where you stand.', url: 'https://docs.joinmastodon.org/api/rate-limits/', source: 'Mastodon, rate limits' },
  ],
  DISCORD: [
    { text: 'A bot can make 50 requests a second globally, and 10,000 invalid requests in 10 minutes lead to a temporary IP ban. A 429 response carries <code>retry_after</code>.', url: 'https://docs.discord.com/developers/topics/rate-limits', source: 'Discord, rate limits' },
  ],
  SLACK: [
    { text: '<code>chat.postMessage</code> "will generally allow an app to post 1 message per second to a specific channel", with workspace limits of several hundred messages a minute above that.', url: 'https://docs.slack.dev/reference/methods/chat.postMessage', source: 'Slack, chat.postMessage' },
    { text: 'Since 29 May 2025, commercially distributed apps outside the Slack Marketplace get <code>conversations.history</code> and <code>conversations.replies</code> at 1 request a minute, with at most 15 objects per page, on new installs.', url: 'https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps', source: 'Slack changelog' },
  ],
  YOUTUBE: [
    { text: 'A project gets 10,000 units a day for most endpoints, with separate allocations for <code>videos.insert</code> and <code>search.list</code> calls. Every request, including an invalid one, costs at least one unit. More quota is requested with the quota extension form.', url: 'https://developers.google.com/youtube/v3/getting-started', source: 'Google, YouTube Data API getting started' },
  ],
  TIKTOK: [
    { text: 'Each user access token is limited to 6 requests a minute on the posting endpoints.', url: 'https://developers.tiktok.com/doc/content-posting-api-reference-direct-post', source: 'TikTok, Direct Post reference' },
    { text: 'Creators have a daily cap on API posts, typically around 15 a day. An app TikTok has not audited can let at most 5 users post in 24 hours, only as <code>SELF_ONLY</code> to private accounts.', url: 'https://developers.tiktok.com/doc/content-sharing-guidelines', source: 'TikTok, content sharing guidelines' },
  ],
  PINTEREST: [
    { text: 'Trial access is rate-limited per app per day, and Pins and boards made with Trial access are visible only to their creator. Standard access is rate-limited per minute, per user and per app.', url: 'https://developers.pinterest.com/docs/key-concepts/access-tiers/', source: 'Pinterest, access tiers' },
  ],
  GOOGLE_BUSINESS: [
    { text: 'Projects start at 0 requests a minute until Google approves API access, then 300 a minute. Access needs a profile that has been verified and active for 60 days or more.', url: 'https://developers.google.com/my-business/content/prereqs', source: 'Google, Business Profile APIs prerequisites' },
  ],
};

/** How the network's own API posts, for the not-open hubs (guide framing, no Siar posting claim). */
export const NATIVE_HOWTO: Partial<Record<NetworkType, { steps: string[]; url: string; source: string }>> = {
  YOUTUBE: {
    steps: [
      'Verify your Google Cloud project\'s OAuth consent screen for the <code>youtube.upload</code> scope, then have the channel owner sign in with Google.',
      'Upload the file with <code>videos.insert</code>, sending <code>snippet</code> (title, description) and <code>status.privacyStatus</code>.',
      'Since 2 November 2026, uploads from projects that have not passed the API audit are no longer forced to private, and an upload with no privacy set defaults to public.',
      'Poll <code>videos.list</code> for <code>status.uploadStatus</code> until YouTube finishes processing.',
    ],
    url: 'https://developers.google.com/youtube/v3/revision_history', source: 'Google, YouTube Data API revision history',
  },
  TIKTOK: {
    steps: [
      'Have the creator authorize your app with <code>video.publish</code> (Direct Post) or <code>video.upload</code> (upload to the creator\'s inbox).',
      'Call <code>creator_info</code> first and use only the privacy levels and interaction settings it returns.',
      'Start the post with <code>/publish/video/init/</code>, then upload the file or let TikTok pull it from a verified URL prefix.',
      'Until TikTok audits the app, posts must be <code>SELF_ONLY</code> to private accounts; anything else returns <code>unaudited_client_can_only_post_to_private_accounts</code>.',
    ],
    url: 'https://developers.tiktok.com/doc/content-posting-api-reference-direct-post', source: 'TikTok, Direct Post reference',
  },
  PINTEREST: {
    steps: [
      'Register an app; Trial access is reviewed at registration and works in a sandbox.',
      'Have the user authorize the app with <code>boards:read</code>, <code>pins:write</code> and the other scopes you need.',
      'Create the Pin on a board with an image or video, a title, a description and a destination link.',
      'With Trial access, Pins are sandbox entities visible only to their creator. Public Pins need Standard access.',
    ],
    url: 'https://developers.pinterest.com/docs/key-concepts/access-tiers/', source: 'Pinterest, access tiers',
  },
  SNAPCHAT: {
    steps: [
      'Create an OAuth app in Snap\'s Ads Manager under Business Details.',
      'Email the client ID to a Snap partner contact to be allowlisted for the Public Profile API.',
      'Only then can the app act on a public profile.',
    ],
    url: 'https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted', source: 'Snap, Public Profile API',
  },
  GOOGLE_BUSINESS: {
    steps: [
      'Apply with the "Application for Basic API Access" form from an account that manages a profile verified and active for 60 days or more.',
      'Enable the Business Profile APIs on the approved Cloud project; quota is 0 requests a minute until then.',
      'Have the user grant <code>business.manage</code>, pick a location, and create local posts on it.',
    ],
    url: 'https://developers.google.com/my-business/content/prereqs', source: 'Google, Business Profile APIs prerequisites',
  },
};

/**
 * Scopes Siar requests in production, where they differ from the adapter's full list.
 * LinkedIn: organization scopes are off until LinkedIn grants Community Management (linkedin.ts lines 40–53).
 * TikTok: only Login Kit scopes are shown; the Business API group carries comment scopes Siar cannot use.
 */
export const SCOPES_SHOWN: Partial<Record<NetworkType, { label: string; scopes: string[] }[]>> = {
  LINKEDIN: [{ label: 'Member profiles (Sign In with LinkedIn and Share on LinkedIn)', scopes: ['openid', 'profile', 'email', 'w_member_social'] }],
};

/** Capability rows hidden per network, because they are not claimable (siar-truth.md §2). */
export const HIDE_CAPS: Partial<Record<NetworkType, string[]>> = {
  LINKEDIN: ['Comments and replies', 'First comment', 'Edit a comment', 'Delete a comment', 'Import comments', 'Post analytics', 'Account analytics'],
};

/** Siar's own approval record per network, for hubs and topic pages (docs/approvals, checked 2026-11-12). */
export const APPROVAL: Partial<Record<NetworkType, string>> = {
  FACEBOOK: "Siar's Meta app passed App Review on 27 October 2026, with all 27 permissions it asked for.",
  INSTAGRAM: "Siar's Meta app passed App Review on 27 October 2026, under both Facebook Login and Instagram Login.",
  THREADS: "Siar's Meta app passed App Review on 27 October 2026, including the six threads_* permissions.",
  LINKEDIN: "Siar's LinkedIn app for member profiles is live. Its Community Management API request for company pages shows \"Access denied\", with no reason given.",
  YOUTUBE: "Google approved Siar's OAuth verification on 15 October 2026. Siar's YouTube API audit and quota request were submitted the same day and are in review.",
  TIKTOK: "TikTok has not passed Siar's Content Posting API audit, so Siar runs on sandbox keys.",
  PINTEREST: 'Pinterest granted Siar Trial access on 21 October 2026. Publishing Pins needs Standard access.',
};

/** Use cases every open hub links (strike-plan.md §6 rule 4). */
export const USE_CASE_LINKS = [
  { href: '/use-cases/social-media-posting-api', anchor: 'social media posting API' },
  { href: '/use-cases/social-media-scheduling-api', anchor: 'social media scheduling API' },
];

export const humanDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
