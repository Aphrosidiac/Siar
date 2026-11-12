/**
 * Every fact about another vendor that a compare page prints (docs/seo/strike-plan.md §5.0 rule 3).
 *
 * One fact = the value as printed, the vendor's own URL it came from, and the date it was checked.
 * Sources: docs/seo/competitors.md and docs/seo/research/competitors/*.md (only cells that carry the vendor's URL),
 * with docs/seo/strike-plan.md §2 overriding them (Hootsuite's MCP publishes; PostWire; Duta's API; Buffer dates).
 * A fact we could not source is left out, never guessed; pages print "Not checked yet" in its place.
 *
 * Re-check every cell within 7 days of publishing and change `checked` when you do. The build warns
 * about any cell older than 30 days.
 */

export const CHECKED = '2026-11-12';
const MAX_AGE_DAYS = 30;

export interface Fact {
  /** The fact as it is printed, in our words or the vendor's (quotes are marked with quotation marks). */
  value: string;
  /** The vendor's own page. */
  url: string;
  /** ISO date the page was read. */
  checked: string;
}

/** The six first-screen rows of every compare page, plus the index's MCP column. */
export type CellKey = 'unit' | 'entry' | 'scenario' | 'networks' | 'webhooks' | 'connect' | 'mcp';

export interface Rival {
  key: string;
  name: string;
  /** Home page, printed as the vendor's link on /compare. */
  home: string;
  /** Our compare page, when there is one. */
  page?: string;
  group: 'api' | 'dashboard' | 'malaysia';
  cells: Partial<Record<CellKey, Fact>>;
  /** One line for the "Where they win" column on /compare. */
  win?: Fact;
  /** Other facts the page's prose uses. */
  facts: Record<string, Fact>;
}

const f = (value: string, url: string, checked = CHECKED): Fact => ({ value, url, checked });

/** The dated scenario used in the "price in the dated scenario" row of the API compare pages. */
export const SCENARIO = '10 brands with 5 social accounts each (50 accounts), 1,000 posts a month, billed monthly in USD';
/** The scenario for the Malaysian pages. */
export const SCENARIO_MY = '10 brands (clients), billed monthly in ringgit';

export const CELL_LABEL: Record<CellKey, string> = {
  unit: 'What you pay for',
  entry: 'Entry price',
  scenario: 'Price in the dated scenario',
  networks: 'Networks',
  webhooks: 'Webhooks',
  connect: 'Your customers connect their accounts',
  mcp: 'MCP server',
};

// ---------------------------------------------------------------- dashboard tools with an API

const BUFFER_PRICING = 'https://buffer.com/pricing.md';
const BUFFER_DEV = 'https://developers.buffer.com/llms.txt';
const BUFFER_RETIRED = 'https://buffer.com/resources/legacy-rest-api-retired/';

const buffer: Rival = {
  key: 'buffer', name: 'Buffer', home: 'https://buffer.com/', page: '/compare/buffer-api', group: 'dashboard',
  cells: {
    unit: f('Per channel: "A channel is one social account you connect to Buffer"', BUFFER_PRICING),
    entry: f('Essentials from $6 per channel a month ($5 billed yearly). Free tier: 3 channels', BUFFER_PRICING),
    scenario: f("$195 on Essentials, $255 on Team (Buffer's own 50-channel example)", BUFFER_PRICING),
    networks: f('Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, Google Business, Mastodon, X and Substack', 'https://buffer.com/'),
    webhooks: f('None documented', BUFFER_DEV),
    connect: f('No: each of your users needs a Buffer account and connects channels inside Buffer', BUFFER_DEV),
    mcp: f('Hosted, "Free on every Buffer plan"', 'https://buffer.com/mcp'),
  },
  win: f('A free tier, a hosted MCP, live TikTok, YouTube Shorts, Pinterest and LinkedIn Pages', BUFFER_PRICING),
  facts: {
    brownouts: f('"Two brownouts are planned before sunset: November 11 and December 9, 2026"', BUFFER_RETIRED),
    retired: f('Buffer is "retiring Buffer\'s legacy REST API on February 1, 2027"', BUFFER_RETIRED),
    replacement: f('The replacement is a GraphQL API "with an MCP server, a CLI, and managed OAuth"', BUFFER_RETIRED),
    graphqlSince: f('The GraphQL API went public on 27 May 2026', 'https://buffer.com/resources/buffer-api-is-here/'),
    ownAccount: f('"With the current Buffer API, you can perform actions against your own Buffer account and organization."', 'https://buffer.com/api'),
    community: f('Comments are not in the API; Buffer lists "community features for personal use cases" as planned', 'https://buffer.com/api'),
    noUpload: f('No media upload endpoint: files must sit at public URLs until the post publishes', BUFFER_DEV),
    freePlan: f('Free: 3 channels, 10 queued posts per channel, API included', BUFFER_PRICING),
    fairUse: f('Paid plans: "Unlimited" scheduled posts, with a fair-use cap of 5,000 posts per channel', BUFFER_PRICING),
  },
};

const HOOT_PLANS = 'https://www.hootsuite.com/plans';
const HOOT_DEV = 'https://developer.hootsuite.com/llms.txt';
const hootsuite: Rival = {
  key: 'hootsuite', name: 'Hootsuite', home: 'https://www.hootsuite.com/', page: '/compare/hootsuite-api', group: 'dashboard',
  cells: {
    unit: f('Per user seat; Standard is capped at 10 social accounts', HOOT_PLANS),
    entry: f('Standard $99 per user a month, billed annually. No free tier; 14-day trial', HOOT_PLANS),
    scenario: f('Professional $199 per user a month, billed annually (no account cap, one seat)', HOOT_PLANS),
    networks: f('Facebook, TikTok, Instagram, X, LinkedIn, YouTube, Threads, Bluesky and Pinterest in the app', 'https://www.hootsuite.com/plans/standard'),
    webhooks: f('Four event types (ping, comments, messages, apps); no signing documented', HOOT_DEV),
    connect: f('No: the API acts for Hootsuite users on their own Hootsuite accounts', HOOT_DEV),
    mcp: f('Hosted: Perch can "Create social media posts and publish them to X and Instagram at the same time"', 'https://www.hootsuite.com/integrations/mcp'),
  },
  win: f('Listening, approvals and enterprise governance; an MCP that publishes', HOOT_PLANS),
  facts: {
    apiNetworks: f('"The following networks are currently not supported by the publishing API: Tiktok, Youtube, Bluesky."', HOOT_DEV),
    apiFree: f('"Access to the Hootsuite REST APIs is free", after you request developer access', HOOT_DEV),
    perch: f('Perch can "Create social media posts and publish them to X and Instagram at the same time" and schedules to LinkedIn and Instagram; Nest can "reply with saved responses"', 'https://www.hootsuite.com/integrations/mcp'),
    rate: f('"20 requests / second to a maximum daily quota of 100,000 calls per day"', HOOT_DEV),
    enterprise: f('SSO, compliance integrations, Salesforce and advanced analytics are Enterprise-only', HOOT_PLANS),
  },
};

const SPROUT_PRICING = 'https://sproutsocial.com/pricing/';
const SPROUT_API = 'https://api.sproutsocial.com/docs/';
const sprout: Rival = {
  key: 'sprout', name: 'Sprout Social', home: 'https://sproutsocial.com/', page: '/compare/sprout-social-api', group: 'dashboard',
  cells: {
    unit: f('Per seat; 5 social profiles on Essentials and Standard', SPROUT_PRICING),
    entry: f('Essentials $79 per seat a month billed annually, $99 monthly. No free tier; 30-day trial', SPROUT_PRICING),
    scenario: f('The API needs Advanced: $499 per seat a month, or $399 billed annually', SPROUT_PRICING),
    networks: f('Bluesky, Facebook, Instagram, LinkedIn, Pinterest, Reddit, Snapchat, Threads, TikTok, X and YouTube, plus Messenger and WhatsApp', 'https://sproutsocial.com/integrations/'),
    webhooks: f('None documented', SPROUT_API),
    connect: f('No: the API reads "your owned social profile data"', SPROUT_API),
    mcp: f('ChatGPT only, "TikTok data only", no write actions', 'https://support.sproutsocial.com/hc/en-us/articles/41236268336653'),
  },
  win: f('Analytics, listening and enterprise reporting; the API is built for reporting', SPROUT_API),
  facts: {
    drafts: f('"Create a Publishing Post (currently only supports posts in Draft status)"', SPROUT_API),
    noError: f('Unsupported media on one profile means that profile is "dropped. No error is returned"', SPROUT_API),
    readOnly: f('Messages are read-only: there is no reply or send endpoint', SPROUT_API),
    rate: f('"60 requests per minute" and "250,000 requests per month"', SPROUT_API),
  },
};

const PUBLER_PLANS = 'https://publer.com/plans';
const PUBLER_DOCS = 'https://publer.com/docs/llms.txt';
const publer: Rival = {
  key: 'publer', name: 'Publer', home: 'https://publer.com/', page: '/compare/publer-api', group: 'dashboard',
  cells: {
    unit: f('Per social account plus per team member; every 10th account is free', PUBLER_PLANS),
    entry: f('Professional $5 a month (no API). The API starts on Business: $10 a month for one account', PUBLER_PLANS),
    scenario: f('$252 a month billed yearly on Business (50 accounts)', PUBLER_PLANS),
    networks: f('Facebook, Instagram, Threads, X (paid plans), LinkedIn profiles and pages, Bluesky, Mastodon, TikTok, YouTube, Pinterest, Google Business Profile, Telegram and WordPress', PUBLER_PLANS),
    webhooks: f('None documented', PUBLER_DOCS),
    connect: f('No: the Accounts API only lists and reads accounts connected in Publer', PUBLER_DOCS),
    mcp: f('Hosted, on Business and Enterprise', 'https://publer.com/help/en/article/how-to-set-up-and-use-publers-mcp-server-14orlq0/'),
  },
  win: f("$10 a month for one account's API; live TikTok, YouTube, Pinterest and LinkedIn pages", PUBLER_PLANS),
  facts: {
    gate: f('"Publer does not offer a public API that is available to everyone."', 'https://publer.com/help/en/article/does-publer-have-a-public-api-194nknf/'),
    oneAccount: f('Business with one social account: $10 a month, or $8 billed yearly', PUBLER_PLANS),
    rate: f('100 requests per 2-minute window, per user across all keys', 'https://publer.com/docs/getting-started/rate-limits'),
  },
};

const METRICOOL_PRICING = 'https://metricool.com/pricing/';
const metricool: Rival = {
  key: 'metricool', name: 'Metricool', home: 'https://metricool.com/', page: '/compare/metricool-api', group: 'dashboard',
  cells: {
    unit: f('Per brand, with one profile per network per brand', METRICOOL_PRICING),
    entry: f('Starter $25 a month (5 brands, no API). The API starts on Advanced: $67 a month, $53 billed yearly', METRICOOL_PRICING),
    scenario: f('Advanced $67 a month (up to 15 brands), plus $10 a month for each connected X account', METRICOOL_PRICING),
    networks: f('Facebook, Instagram, Threads, X (add-on), LinkedIn, Bluesky, TikTok, YouTube, Pinterest and Google Business Profile, plus ad platforms', METRICOOL_PRICING),
    webhooks: f('None outbound in its API description', 'https://app.metricool.com/api/swagger.json'),
    connect: f('A connect-link API for integrators on the Custom plan, on mtr.cool', 'https://help.metricool.com/wli-brand-connections-panel-for-end-clients-through-api-4m5b3'),
    mcp: f('Hosted, on every plan including Free', 'https://metricool.com/metricool-mcp-claude/'),
  },
  win: f('A free hosted MCP on every plan; analytics and ads depth', 'https://metricool.com/metricool-mcp-claude/'),
  facts: {
    gate: f('"Free and Starter plans do not include API access."', 'https://help.metricool.com/basic-guide-for-api-integration-r97af'),
    xAddon: f('Twitter/X add-on: $10 a month per connected account', METRICOOL_PRICING),
    freePlan: f('Free: 1 brand, 20 posts a month, no LinkedIn or X', METRICOOL_PRICING),
  },
};

// ---------------------------------------------------------------- developer APIs

const AYR_PRICING = 'https://www.ayrshare.com/pricing/';
const ayrshare: Rival = {
  key: 'ayrshare', name: 'Ayrshare', home: 'https://www.ayrshare.com/', page: '/compare/ayrshare', group: 'api',
  cells: {
    unit: f('Per social profile: one customer, brand or location', AYR_PRICING),
    entry: f('Premium $149 a month ($129 billed yearly), 1 profile. No free tier; a 28-day trial on Launch only', AYR_PRICING),
    scenario: f('Launch $299 a month (up to 10 profiles)', AYR_PRICING),
    networks: f('Facebook Pages, Instagram, X, LinkedIn pages and profiles, TikTok, YouTube, Pinterest, Reddit, Threads, Bluesky, Snapchat, Telegram and Google Business Profile, plus WhatsApp in beta', 'https://www.ayrshare.com/supported-networks/'),
    webhooks: f('From Launch; HMAC signing optional; retried for about 16 hours', 'https://www.ayrshare.com/docs/apis/webhooks/overview'),
    connect: f('Yes: a hosted linking page with your logo and colours; full CSS needs the $300-a-month Max Pack', 'https://www.ayrshare.com/connect/'),
    mcp: f('Hosted', 'https://www.ayrshare.com/ai-agent/'),
  },
  win: f('Live TikTok, YouTube, Pinterest, LinkedIn Pages and Google Business; unlimited posts; a hosted MCP', 'https://www.ayrshare.com/supported-networks/'),
  facts: {
    hundred: f('100 profiles cost $1,228 a month by its own calculator', AYR_PRICING),
    p1: f('$149 (Premium, 1 profile)', AYR_PRICING),
    p10: f('$299 (Launch, up to 10 profiles)', AYR_PRICING),
    p30: f('$599 (Business, 30 profiles included)', AYR_PRICING),
    p100: f('$1,228 (its own calculator)', AYR_PRICING),
    business: f('Business $599 a month with 30 profiles included', AYR_PRICING),
    unlimited: f('"Every plan includes unlimited API calls and unlimited posts"', AYR_PRICING),
    noMastodon: f('No Mastodon, Discord or Slack: "If your product needs Discord, Slack, or Mastodon, plan a separate integration"', 'https://www.ayrshare.com/supported-networks/'),
    rate: f('"300 requests per 5 minutes per user profile"', AYR_PRICING),
    extras: f('A History API, a Validation API and approval workflows', 'https://www.ayrshare.com/social-media-publishing-api/'),
  },
};

const ZERNIO_PRICING = 'https://zernio.com/pricing.md';
const ZERNIO_LLMS = 'https://zernio.com/llms.txt';
const ZERNIO_OPENAPI = 'https://zernio.com/openapi.json';
const zernio: Rival = {
  key: 'zernio', name: 'Zernio', home: 'https://zernio.com/', page: '/compare/zernio', group: 'api',
  cells: {
    unit: f('Per connected account, graduated: 1–2 free, 3–10 $6, 11–100 $3, 101 and up $1 a month each', ZERNIO_PRICING),
    entry: f('First 2 accounts free, with unlimited posts; then $6 per account a month', ZERNIO_PRICING),
    scenario: f('$168 a month (8 × $6 + 40 × $3, from its rate card)', ZERNIO_PRICING),
    networks: f('Facebook, Instagram, LinkedIn, X, TikTok, YouTube, Threads, Pinterest, Bluesky, Google Business, Telegram, Discord, Slack and WhatsApp; Reddit returns 503 and Snapchat is a closed beta; no Mastodon', ZERNIO_LLMS),
    webhooks: f('HMAC-signed, 158 event types, up to 50 endpoints, redelivery', ZERNIO_OPENAPI),
    connect: f('Yes: hosted or headless, with your own OAuth app and a branded welcome screen', ZERNIO_OPENAPI),
    mcp: f('Hosted, in the official MCP registry', ZERNIO_LLMS),
  },
  win: f('Free for 2 accounts with unlimited posts; more networks, events and SDKs; a hosted MCP', ZERNIO_PRICING),
  facts: {
    hundred: f('100 accounts: $318 a month (its own example)', ZERNIO_PRICING),
    thousand: f('1,000 accounts: $1,218 a month (its own example)', ZERNIO_PRICING),
    rebrand: f('"Late is now Zernio."', 'https://zernio.com/rebrand'),
    forty: f('40 accounts: $138 a month (2 free, 8 × $6, 30 × $3, from its rate card)', ZERNIO_PRICING),
    included: f('Included on every account: unlimited posts, analytics, comments and reviews, webhooks and the full API', ZERNIO_PRICING),
  },
};

const UP_PRICING = 'https://www.upload-post.com/pricing/';
const uploadPost: Rival = {
  key: 'upload-post', name: 'Upload-Post', home: 'https://www.upload-post.com/', page: '/compare/upload-post', group: 'api',
  cells: {
    unit: f('Per profile: "one person or client", with one account per network per profile', UP_PRICING),
    entry: f('Basic $24 a month ($16 billed yearly), 5 profiles. Free: 10 uploads a month, 2 profiles, no TikTok', UP_PRICING),
    scenario: f('$39 a month: Basic plus a 5-profile pack ($15)', UP_PRICING),
    networks: f('22 listed, including TikTok, Instagram, YouTube, LinkedIn pages, Facebook, Threads, X, Pinterest, Bluesky, Google Business, Discord, Telegram, Slack and Mastodon; Reddit returns 503', 'https://www.upload-post.com/llms.txt'),
    webhooks: f('HMAC-signed, 6 events, "Single delivery attempt (no redelivery)"', 'https://docs.upload-post.com/api/webhooks'),
    connect: f('Yes, from Professional ($50): a hosted page with your logo, on its domain', 'https://www.upload-post.com/whitelabel/'),
    mcp: f('Hosted', 'https://www.upload-post.com/mcp/'),
  },
  win: f('Cheaper for 2–75 clients; 22 networks; media processing; a free tier every month', UP_PRICING),
  facts: {
    advanced: f('Advanced $147 a month for 75 profiles', UP_PRICING),
    hundred: f('100 profiles: $212 a month (Advanced plus a 25-profile pack at $65)', UP_PRICING),
    business: f('Business $438 a month for 225 profiles', UP_PRICING),
    unlimited: f('Paid plans include unlimited uploads', UP_PRICING),
    media: f('An FFmpeg editor API and automatic transcoding to each network\'s specs', 'https://docs.upload-post.com/llms.txt'),
  },
};

const OUT_PRICING = 'https://www.outstand.so/pricing.md';
const outstand: Rival = {
  key: 'outstand', name: 'Outstand', home: 'https://www.outstand.so/', page: '/compare/outstand', group: 'api',
  cells: {
    unit: f('Per delivered post: "A post published to 3 connected accounts counts as 3 posts"', OUT_PRICING),
    entry: f('$19 a month with 3,000 deliveries. "Outstand is not free and has no permanently free tier"', OUT_PRICING),
    scenario: f('$33 a month for 5,000 deliveries (its own example)', OUT_PRICING),
    networks: f('X, LinkedIn, Instagram, TikTok, Facebook, Threads, Bluesky, YouTube, Pinterest, Google Business, Vimeo and Reddit; X, Google Business, Vimeo and Reddit need your own app', 'https://www.outstand.so/facts'),
    webhooks: f('HMAC-signed only "if signing secret is configured"', 'https://www.outstand.so/llms.txt'),
    connect: f('You build the connect flow yourself from its API', 'https://www.outstand.so/white-label-social-media-management'),
    mcp: f('Hosted, 30 tools', 'https://www.outstand.so/mcp'),
  },
  win: f('Cheaper below about 7,300 deliveries a month; more networks; a hosted MCP', OUT_PRICING),
  facts: {
    failed: f('"pending, published, and failed deliveries all count. Retries do not double-count."', OUT_PRICING),
    tenK: f('10,000 deliveries: $68 a month (its own example)', OUT_PRICING),
    accounts: f('Connected accounts and seats: unlimited, $0', OUT_PRICING),
    ownApp: f('X fees are paid "by you directly to the platform"', OUT_PRICING),
  },
};

const POSTIZ_PRICING = 'https://postiz.com/pricing';
const postiz: Rival = {
  key: 'postiz', name: 'Postiz', home: 'https://postiz.com/', page: '/compare/postiz', group: 'api',
  cells: {
    unit: f('Per organization, capped by channels; each connected account is one channel', POSTIZ_PRICING),
    entry: f('Standard $29 a month, 5 channels. No free cloud tier; self-hosting is free (AGPL-3.0)', 'https://docs.postiz.com/cloud/plans'),
    scenario: f('Ultimate $99 a month (100 channels; Pro stops at 30)', POSTIZ_PRICING),
    networks: f('30+ (35 rows in its docs), including TikTok, YouTube, Pinterest, LinkedIn pages, Reddit, Telegram, Discord, Slack and Mastodon', 'https://docs.postiz.com/general/platforms/overview'),
    webhooks: f('Fires when a post publishes; no signature or retry policy documented', 'https://docs.postiz.com/general/automations/webhooks'),
    connect: f('Invite links that add a channel to your Postiz organization; white-label Enterprise is "not accepting new applications"', 'https://postiz.com/enterprise'),
    mcp: f('Hosted, with OAuth', 'https://docs.postiz.com/mcp/introduction'),
  },
  win: f('Open source and self-hostable; 30+ networks; unlimited posts', 'https://docs.postiz.com/general/platforms/overview'),
  facts: {
    rate: f('Create-post is limited to "90 requests per hour (100 for the cloud)", and that is "not something that scales with your plan"', 'https://docs.postiz.com/public-api/introduction'),
    comments: f('Its agent cannot "Read or reply to comments on your posts"', 'https://docs.postiz.com/general/agents'),
    unlimited: f('Unlimited posts on every cloud plan', POSTIZ_PRICING),
    noFree: f('"There is no free plan. An organisation without a subscription cannot use the app"', 'https://docs.postiz.com/cloud/plans'),
  },
};

const mixpost: Rival = {
  key: 'mixpost', name: 'Mixpost', home: 'https://mixpost.app/', page: '/compare/mixpost', group: 'api',
  cells: {
    unit: f('A licence you pay once and host yourself, or Cloud per workspace with a channel cap', 'https://mixpost.app/pricing'),
    entry: f('Pro licence $299 once. Cloud from $29 a month, with the API from Momentum at $49', 'https://mixpost.app/cloud'),
    scenario: f('Cloud Agency $149 a month (180 channels; Business stops at 48)', 'https://mixpost.app/cloud'),
    networks: f('Self-hosted Pro: Facebook Pages, Instagram, X, LinkedIn, YouTube, TikTok, Pinterest, Threads, Bluesky, Mastodon, Pixelfed and Google Business Profile, through your own approved apps. Cloud: 11, without X', 'https://mixpost.app/cloud'),
    webhooks: f('8 events, 3 attempts, signing secret optional', 'https://docs.mixpost.app/webhooks/'),
    connect: f('No: the API lists accounts connected in the Mixpost dashboard', 'https://docs.mixpost.app/assets/files/mixpost-2835c6937c8fde2142b94e940790a14c.yaml'),
    mcp: f('Built in, 31 tools', 'https://docs.mixpost.app/mcp/tools'),
  },
  win: f('Your own server, the source code and a one-time price', 'https://mixpost.app/pricing'),
  facts: {
    approvals: f('Self-hosters get their own app approved on each network, which "can take weeks per network"', 'https://docs.mixpost.app/cloud/vs-self-hosted'),
    lite: f('Lite is free and self-hosted, for Facebook Pages, X and Mastodon', 'https://mixpost.app/pricing'),
    enterprise: f('Enterprise licence $1,199 once, for running Mixpost as your own SaaS', 'https://mixpost.app/pricing'),
  },
};

// ---------------------------------------------------------------- Malaysia

const ZOHO_PRICING = 'https://www.zoho.com/social/pricing.html';
const zoho: Rival = {
  key: 'zoho', name: 'Zoho Social', home: 'https://www.zoho.com/social/', page: '/compare/zoho-social', group: 'malaysia',
  cells: {
    unit: f('Per brand plus per team member, priced in ringgit in Malaysia', ZOHO_PRICING),
    entry: f('Standard RM60 a month, or RM40 a month billed yearly: 1 brand, 14 channels, 1 member. Free: 1 brand, 6 channels', ZOHO_PRICING),
    scenario: f('Agency RM1,280 a month, or RM920 a month billed yearly: 10 clients, 160 channels, 5 members', ZOHO_PRICING),
  },
  win: f('A free tier with 6 channels; 14 channels per brand on Standard; an inbox on Premium', ZOHO_PRICING),
  facts: {
    tax: f('"Local taxes … will be charged in addition"', ZOHO_PRICING),
    premium: f('Inbox on Premium: RM260 a month, or RM160 billed yearly', ZOHO_PRICING),
    extra: f('Extra brand RM58–92 a month; extra member RM40–48 a month', ZOHO_PRICING),
  },
};

const DUTA_PRICING = 'https://getduta.com/pricing';
const DUTA_LLMS = 'https://getduta.com/llms.txt';
const duta: Rival = {
  key: 'duta', name: 'Duta', home: 'https://getduta.com/', page: '/compare/duta', group: 'malaysia',
  cells: {
    unit: f('"One plan. Every channel Duta supports, connected as many times as you like."', DUTA_PRICING),
    entry: f('RM99 a month or RM990 a year; 7-day trial with a card at sign-up', DUTA_PRICING),
    scenario: f('RM99 a month; the pricing page lists no brands or teams', DUTA_PRICING),
    networks: f('Live: X, Instagram, Facebook Pages, LinkedIn, Threads, Telegram and Discord. "Built, waiting for approval": TikTok, Pinterest, YouTube and Google Business Profile', DUTA_LLMS),
    webhooks: f('None listed', DUTA_LLMS),
    connect: f('You connect your own accounts, "as many times as you like"', DUTA_PRICING),
    mcp: f('Hosted connector for Claude and ChatGPT', 'https://getduta.com/how-to-use'),
  },
  win: f('Launched first; Telegram; a hosted MCP; no post cap except X', DUTA_PRICING),
  facts: {
    api: f('"Duta has a public API and an MCP connector"', DUTA_LLMS),
    card: f('"A card is needed to start"', DUTA_LLMS),
    xCap: f('X is capped at 300 posts a month (20 during the trial)', DUTA_PRICING),
    founding: f('"The first 1000 people keep RM99 a month for as long as they stay"', DUTA_PRICING),
    fpx: f('"Both plans take a card. The yearly plan also takes FPX."', DUTA_PRICING),
  },
};

const META_HELP = 'https://www.facebook.com/business/help/1252240869631062';
const metaSuite: Rival = {
  key: 'meta-business-suite', name: 'Meta Business Suite', home: META_HELP, page: '/compare/meta-business-suite', group: 'malaysia',
  cells: {
    unit: f('Free', META_HELP),
    entry: f('Free', META_HELP),
    networks: f('Facebook and Instagram', META_HELP),
  },
  win: f('Free, native and built by Meta for Facebook and Instagram', META_HELP),
  facts: {
    free: f('Free scheduling for Facebook and Instagram', META_HELP),
  },
};

// ---------------------------------------------------------------- rows on /compare only (no page of their own)

const postwire: Rival = {
  key: 'postwire', name: 'PostWire', home: 'https://postwire.io/', group: 'api',
  cells: {
    unit: f('"Priced per business."', 'https://postwire.io/pricing'),
    entry: f('Starter $19: 3 brands, 1,000 posts. Free: 10 posts a month', 'https://postwire.io/pricing'),
    networks: f('Dated approvals for TikTok, Meta and YouTube; Threads and Pinterest "not offered yet"; LinkedIn Company Pages "not yet"', 'https://postwire.io/'),
    webhooks: f('2 to 50 endpoints by plan', 'https://postwire.io/pricing'),
    mcp: f('Hosted, "in Claude\'s connector directory"', 'https://postwire.io/'),
  },
  win: f('Cheaper from 1 to 50 brands; client idempotency keys; dated approvals; TikTok and YouTube', 'https://postwire.io/pricing'),
  facts: {},
};

const postproxy: Rival = {
  key: 'postproxy', name: 'Postproxy', home: 'https://postproxy.dev/', group: 'api',
  cells: {
    unit: f('Per profile (Agentic) or per profile group (Business)', 'https://postproxy.dev/pricing/'),
    entry: f('Agentic $17, 5 profiles. Free: 10 posts a month, no card', 'https://postproxy.dev/pricing/'),
    networks: f('12, including Telegram and WhatsApp; no Mastodon, Discord or Slack', 'https://postproxy.dev/llms.txt'),
    webhooks: f('HMAC-signed', 'https://postproxy.dev/llms.txt'),
    connect: f('A neutral "Social Media Linker" app, or your own keys', 'https://postproxy.dev/white-label/'),
    mcp: f('Hosted', 'https://postproxy.dev/llms.txt'),
  },
  win: f('Cheaper at 10–20 brands ($49 for 20 profile groups); TikTok, LinkedIn pages, Google Business', 'https://postproxy.dev/pricing/'),
  facts: {},
};

const postForMe: Rival = {
  key: 'post-for-me', name: 'Post for Me', home: 'https://www.postforme.dev/', group: 'api',
  cells: {
    unit: f('Per successful post; unlimited accounts', 'https://www.postforme.dev/pricing'),
    entry: f('$10 for 1,000 posts; no free tier', 'https://www.postforme.dev/pricing'),
    networks: f('9, with TikTok, LinkedIn pages, Pinterest and YouTube access claimed', 'https://www.postforme.dev/resources/quickstart-api-access-level'),
    webhooks: f('Connections and post status', 'https://www.postforme.dev/'),
    connect: f('A hosted flow that shows "Post for Me"; white label with your own credentials', 'https://www.postforme.dev/'),
    mcp: f('Local, 2 tools', 'https://www.postforme.dev/resources/ai-integration-using-the-mcp-server'),
  },
  win: f('A $10 entry price; open source (AGPL); network approvals it claims', 'https://www.postforme.dev/pricing'),
  facts: {},
};

const socialApi: Rival = {
  key: 'socialapi', name: 'SocialAPI.ai', home: 'https://social-api.ai/', group: 'api',
  cells: {
    unit: f('Per brand; one account per platform per brand', 'https://social-api.ai/pricing'),
    entry: f('Side Hustle $29, 10 brands. Hobby: 2 brands, 10 posts a month, free', 'https://social-api.ai/pricing'),
    networks: f('13; X needs your own X app', 'https://docs.social-api.ai/llms.txt'),
    webhooks: f('Signed and retried, on every plan', 'https://social-api.ai/pricing'),
    mcp: f('Hosted, 75+ tools', 'https://social-api.ai/'),
  },
  win: f('$29 for 10 brands; a free tier every month; WhatsApp, Telegram and reviews; a hosted MCP', 'https://social-api.ai/pricing'),
  facts: {},
};

const woop: Rival = {
  key: 'woopsocial', name: 'WoopSocial', home: 'https://woopsocial.com/', group: 'api',
  cells: {
    unit: f('Per account, in stackable bands', 'https://woopsocial.com/pricing'),
    entry: f('Pro $19 for 20 accounts. Free: 2 accounts, unlimited posts, API and MCP', 'https://woopsocial.com/pricing'),
    networks: f('9', 'https://woopsocial.com/llms.txt'),
    connect: f('An unbranded OAuth URL from the API', 'https://woopsocial.com/llms.txt'),
    mcp: f('Hosted', 'https://woopsocial.com/.well-known/mcp/server-card.json'),
  },
  win: f('A free plan with unlimited posts on 2 accounts; $19 for 20 accounts', 'https://woopsocial.com/pricing'),
  facts: {},
};

/** Seen ranking for our terms, not torn down yet: no fact is printed until their own pages are read. */
const unchecked = (key: string, name: string, home: string): Rival => ({ key, name, home, group: 'api', cells: {}, facts: {} });

export const RIVALS = {
  buffer, hootsuite, sprout, publer, metricool,
  ayrshare, zernio, uploadPost, outstand, postiz, mixpost,
  zoho, duta, metaSuite,
  postwire, postproxy, postForMe, socialApi, woop,
  postpeer: unchecked('postpeer', 'PostPeer', 'https://postpeer.dev/'),
  publora: unchecked('publora', 'Publora', 'https://publora.com/'),
  crosspostapi: unchecked('crosspostapi', 'CrosspostAPI', 'https://crosspostapi.com/'),
} satisfies Record<string, Rival>;

export type RivalKey = keyof typeof RIVALS;

/** Every fact a rival carries, cells first. */
export const allFacts = (r: Rival): Fact[] => [...Object.values(r.cells), ...(r.win ? [r.win] : []), ...Object.values(r.facts)];

/** "buffer.com/pricing.md": a descriptive label for a source link. */
export const sourceLabel = (url: string) => {
  const u = new URL(url);
  return u.hostname.replace(/^www\./, '');
};

/** "12 November 2026". */
export const humanDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

/** " (vendor.com/page, checked 12 November 2026)": a source note for HTML strings such as FAQ answers. */
export const citeHtml = (f: Fact) => ` (<a href="${f.url}" rel="nofollow">${sourceLabel(f.url)}</a>, checked ${humanDate(f.checked)})`;

/** The oldest checked date across a rival's facts (the page's "checked" line). */
export const checkedOf = (r: Rival) => allFacts(r).map((x) => x.checked).sort()[0] ?? CHECKED;

/** Cells older than 30 days, so the build can warn (strike-plan §5.0 rule 3). */
export function staleFacts(now = new Date()) {
  const out: { rival: string; fact: Fact }[] = [];
  for (const r of Object.values(RIVALS) as Rival[]) {
    for (const fact of allFacts(r)) {
      const age = (now.getTime() - new Date(`${fact.checked}T00:00:00Z`).getTime()) / 86_400_000;
      if (age > MAX_AGE_DAYS) out.push({ rival: r.name, fact });
    }
  }
  return out;
}

const stale = staleFacts();
if (stale.length) {
  console.warn(`[rivals] ${stale.length} rival fact(s) older than ${MAX_AGE_DAYS} days. Re-check before publishing:`);
  for (const s of stale.slice(0, 20)) console.warn(`  ${s.rival}: ${s.fact.url} (checked ${s.fact.checked})`);
}
