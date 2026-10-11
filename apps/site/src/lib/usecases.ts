import { NETWORKS } from './networks';
import { WEBHOOK_EVENTS } from './events';
import { RESOURCE_LIMITS, PLANS, fmtInt } from './plans';
import { API_BASE } from '../config';
import { createPostCurl, connectCurl, portalCurl, teamCurl, analyticsCurl, commentCurl, webhookCreateCurl, importCurl, mcpConfig, cliSample, uploadCurl, POST_BODY } from './snippets';

export interface UseCase {
  slug: string;
  nav: string;
  title: string;
  h1: string;
  description: string;
  lead: string;
  points: string[];
  sections: { h: string; p: string[]; code?: { lang: string; code: string } }[];
  faq: { q: string; a: string }[];
  related: [string, string][];
}

const N = NETWORKS.length;
const names = NETWORKS.map((n) => n.name);

const scheduleBody = { ...POST_BODY, postDate: '2026-11-02T09:00:00.000Z', status: 'SCHEDULED' };

export const USE_CASES: UseCase[] = [
  {
    slug: 'social-media-posting-api',
    nav: 'Posting API',
    title: 'Social media posting API',
    h1: 'A posting API for every network you need',
    description: `Publish text, images, video and carousels to ${N} social networks with one REST request. Per-network payloads, validation up front, and the network's own error when something fails.`,
    lead: `Siar accepts one request, validates a payload for each network in it, and publishes to all of them. You get a post id back immediately and a status that moves from scheduled to posted, or to an error you can read.`,
    points: [
      'One request, several networks, each with its own text and options.',
      'Validation against each network\'s limits before the post is accepted.',
      'Per-network results on the post, with the network\'s own message when it fails.',
      'Retry a failed post, delete a published one where the network allows it.',
    ],
    sections: [
      { h: 'One request, many networks', p: [`A post lists the networks it targets in <code>socialAccountTypes</code> and carries one payload per network under <code>data</code>. The team decides which connected account each network resolves to, so the request itself never contains tokens.`, 'A single post can mix very different shapes: an Instagram reel with a cover, a LinkedIn text post and a Bluesky link card.'], code: { lang: 'bash', code: createPostCurl() } },
      { h: 'Validated before it leaves', p: ['Text length, media type, file size, duration and aspect ratio are checked against the limits of each network at create time. A request that cannot work returns <code>400</code> with an <code>issues</code> array whose <code>path</code> points at the field, for example <code>data.INSTAGRAM.text</code>.', 'Limits that depend on the connected account (TikTok creator privacy options, for instance) are read from the network and checked as well.'] },
      { h: 'Statuses you can act on', p: ['A post moves through <code>DRAFT</code>, <code>SCHEDULED</code>, <code>PROCESSING</code> and ends at <code>POSTED</code> or <code>ERROR</code>; <code>RETRYING</code> and <code>REVIEW</code> cover transient states. See <a href="/docs/posting">posting and statuses</a> for what each means and what to poll or listen for.'] },
    ],
    faq: [
      { q: 'Can I post different text to each network?', a: 'Yes. Every network has its own entry under <code>data</code>, so text, hashtags, media and options can differ per network inside one post.' },
      { q: 'What happens if one network fails and the others succeed?', a: 'The post records a result per network. Networks that succeeded stay published; the failed ones carry the network\'s message, and a retry only re-sends what failed.' },
      { q: 'Can I edit a post after it is published?', a: 'Where the network allows editing through its API, yes, with <code>PATCH /post/{id}</code>. The platform pages list which networks support edit and delete.' },
    ],
    related: [['/use-cases/social-media-scheduling-api', 'Scheduling API'], ['/docs/posting', 'Posting guide'], ['/docs/api/post', 'Posts reference']],
  },
  {
    slug: 'social-media-scheduling-api',
    nav: 'Scheduling API',
    title: 'Social media scheduling API',
    h1: 'Schedule posts from your own code',
    description: `Schedule posts to ${N} social networks with a UTC timestamp. Siar publishes on time, never twice, retries failures and tells you through a webhook.`,
    lead: 'Set a future postDate and a status of SCHEDULED. Siar holds the post, publishes it when the time comes, and tells you what happened. Nothing needs to stay running on your side.',
    points: [
      'UTC <code>postDate</code> in the future; no scheduler to run yourself.',
      'Drafts for work in progress, free of quota until you schedule them.',
      'A target is claimed atomically, so a post is never published twice.',
      'Quotas are checked when you schedule, never at publish time.',
    ],
    sections: [
      { h: 'A scheduled post is a normal post', p: ['Create it with a future <code>postDate</code> and <code>status: "SCHEDULED"</code>. Move it by patching <code>postDate</code>, or turn it back into a draft.'], code: { lang: 'bash', code: createPostCurl(scheduleBody) } },
      { h: 'Reliable by construction', p: ['Publishing a target starts with a conditional database update that claims it, so a restart, a retry sweep or a second worker cannot send the same post twice. If a network is slow to finish processing video, Siar keeps polling it and settles the post when the network answers.', `Failed targets are retried with backoff and can be retried by hand up to ${RESOURCE_LIMITS.maxRetries} times; retries do not count against your quota.`] },
      { h: 'Quotas fit scheduling', p: ['A scheduled post counts in the month you create it, not the month it publishes. That means you can fill next quarter\'s calendar today if the quota allows, and a post that is already scheduled is never refused later because the month rolled over.', `Daily caps per account (for example ${fmtInt(NETWORKS.find((n) => n.type === 'TIKTOK')!.dailyPosts[0])} TikTok posts a day on the Free plan) are checked against the post's date, so over-booking a day fails when you schedule, not at 9 a.m.`] },
    ],
    faq: [
      { q: 'Which time zone does postDate use?', a: 'UTC, as an ISO 8601 timestamp. Convert the user\'s local time before you send it.' },
      { q: 'How far ahead can I schedule?', a: 'As far as your monthly quota allows. The quota counts when you create the post, not when it publishes.' },
      { q: 'How do I know a scheduled post went out?', a: 'Subscribe to the <code>post.published</code> webhook, which fires once when the post reaches a final state, or read the post and check its status.' },
    ],
    related: [['/use-cases/social-media-webhooks', 'Webhooks'], ['/docs/posting', 'Posting guide'], ['/pricing', 'Pricing and quotas']],
  },
  {
    slug: 'multi-tenant-social-media-api',
    nav: 'Multi-tenant',
    title: 'Multi-tenant social media API',
    h1: 'Social publishing for every customer of your product',
    description: 'Run social publishing for many customers from one organization: a team per customer, isolated accounts and posts, and pricing that does not scale with the number of accounts.',
    lead: 'If your product posts to social media on behalf of its users, you need isolation, an easy way for each user to connect their accounts, and a bill that does not grow with every account. Siar is built around that.',
    points: [
      'A team per customer, brand or location, with at most one account per network.',
      `Unlimited teams (and so accounts) on paid plans; ${PLANS.FREE.teams} teams on Free.`,
      'Hosted connect pages for your users, with your logo and name.',
      'Every query is scoped to your organization; ids from elsewhere return 404.',
    ],
    sections: [
      { h: 'Teams are your tenants', p: ['Create a team when a customer signs up and store its id against your own user record. Every upload, post, comment and connected account lives under a team, so listing a customer\'s posts is one query with their <code>teamId</code>.'], code: { lang: 'bash', code: teamCurl } },
      { h: 'Customers connect their own accounts', p: ['Send each customer a hosted connect link, or call the connect endpoint from your own settings page. They sign in with the network, and the account appears in their team. Siar notices when a network revokes access and fires a <code>social-account.updated</code> webhook so you can prompt a reconnect.'] },
      { h: 'Pricing that follows usage', p: ['Quotas count what your organization creates each month. Adding a customer, or a customer adding an Instagram account, costs nothing until they actually publish. Daily caps per account protect each customer\'s accounts from being throttled by the networks.'] },
    ],
    faq: [
      { q: 'Can one team connect two Instagram accounts?', a: 'No. A team holds at most one account per network. Create a second team for the second account.' },
      { q: 'Can I give customers their own API keys?', a: 'API keys belong to the organization. Keep them on your server and call Siar on behalf of the customer\'s team. Customer-facing connect pages use short-lived portal tokens, not your key.' },
      { q: 'Is data from one customer visible to another?', a: 'Queries are scoped to your organization, and within it to the team you name. Foreign ids return 404 rather than 403, so ids cannot be probed.' },
    ],
    related: [['/use-cases/hosted-connect-oauth', 'Hosted connect'], ['/docs/data-model', 'Data model'], ['/pricing', 'Pricing']],
  },
  {
    slug: 'social-media-analytics-api',
    nav: 'Analytics API',
    title: 'Social media analytics API',
    h1: 'Post and account analytics, normalised',
    description: `Read post and account metrics from ${N} networks through one API, with a normalised shape and the raw network payload kept alongside.`,
    lead: 'Impressions, reach, engagement and follower counts mean slightly different things on every network. Siar returns them in one shape and keeps the original payload next to it, so you can chart across networks or drill into what a network actually said.',
    points: [
      'Post analytics and account analytics under one set of endpoints.',
      'Raw network payloads available at <code>/raw</code> variants.',
      'Bulk read for many posts at once; force a refresh on demand.',
      'Backfill content published elsewhere with post history import.',
    ],
    sections: [
      { h: 'Read metrics for a post or an account', p: ['Pass a post id and the network, or a team id and the network for account-level metrics. Analytics are included on paid plans.'], code: { lang: 'bash', code: analyticsCurl } },
      { h: 'Import history', p: ['Post history import pulls posts that were published outside Siar, optionally with their analytics, so a new customer has a full picture from day one. It runs as a job you can poll, within the import quotas of your plan.'], code: { lang: 'bash', code: importCurl } },
      { h: 'What to expect', p: ['Networks report their numbers on their own schedule, and some withhold metrics for a while after publishing. Siar refreshes metrics in the background and keeps each snapshot with its time; you can force a refresh, which is capped per day. X is the exception: X bills every read, so X analytics are only fetched when you force a refresh.'] },
    ],
    faq: [
      { q: 'Are analytics included in the Free plan?', a: 'No. Analytics are part of the paid plans. See the pricing page for the exact table.' },
      { q: 'Which networks have analytics?', a: 'The platform pages list, per network, whether post analytics, account analytics and history import are supported.' },
      { q: 'Can I get the original payload?', a: 'Yes. The <code>/raw</code> endpoints return what the network sent, unmodified.' },
    ],
    related: [['/docs/api/analytics', 'Analytics reference'], ['/platforms', 'Platforms'], ['/pricing', 'Pricing']],
  },
  {
    slug: 'social-media-comments-api',
    nav: 'Comments API',
    title: 'Social media comments API',
    h1: 'Read, reply to and moderate comments',
    description: 'Publish comments and replies, import the comments people leave on your posts and moderate them through one API, on the networks that expose comments.',
    lead: 'Comments are where the conversation happens. Siar lets you answer as the connected account, pull in what people wrote, and react to new comments through a webhook.',
    points: [
      'Create comments and replies on several networks in one call.',
      'Import comments on your posts and moderate them where the network allows.',
      '<code>comment.received</code> and <code>comment.published</code> webhooks.',
      'A first comment on every post, per network.',
    ],
    sections: [
      { h: 'Comment on a post', p: ['A comment targets a post you published through Siar or one you imported, and carries a payload per network just like a post does.'], code: { lang: 'bash', code: commentCurl } },
      { h: 'Import and react', p: ['Start a comment import for a post, then read the comments and run moderation actions on them (such as hide, delete or like) where the network permits. When a new comment arrives, a <code>comment.received</code> event tells your system so you can respond without polling.', 'Comment length limits and daily caps differ per network and are listed on each platform page.'] },
      { h: 'Limits that protect the account', p: ['Networks watch for spam-like replies. Siar applies a daily comment cap per connected account and the network\'s own length limit, and refuses a request that would exceed either, with a message that names the limit.'] },
    ],
    faq: [
      { q: 'Do all networks support comments?', a: 'No. Some networks do not expose comments through their API. The platform pages show which do.' },
      { q: 'Can I post a first comment with the post?', a: 'Yes, <code>firstComment</code> on the post takes one text per network, within that network\'s comment length.' },
      { q: 'Do comments count toward a quota?', a: 'Yes. Comments have a monthly quota and daily caps; see pricing.' },
    ],
    related: [['/docs/api/comment', 'Comments reference'], ['/use-cases/social-media-webhooks', 'Webhooks'], ['/pricing', 'Pricing']],
  },
  {
    slug: 'social-media-webhooks',
    nav: 'Webhooks',
    title: 'Social media webhooks',
    h1: 'Signed webhooks for everything that changes',
    description: `Subscribe to ${WEBHOOK_EVENTS.length} signed event types: posts, comments, accounts, X credit and conversations. HMAC-SHA256 signatures, retries with backoff, a delivery log and resend.`,
    lead: 'Instead of polling, give Siar an HTTPS endpoint and the events you care about. Each delivery is signed so you can trust it, retried when your endpoint is down, and visible in a delivery log.',
    points: [
      `${WEBHOOK_EVENTS.length} event types across posts, comments, teams, accounts, credit and conversations.`,
      'HMAC-SHA256 over <code>timestamp.rawBody</code>, in the <code>x-siar-signature</code> header.',
      'Retries with backoff from one minute up to a day.',
      'Inspect deliveries, resend one, send a test, rotate the secret.',
    ],
    sections: [
      { h: 'Create an endpoint', p: [`Organization owners and admins register endpoints from the dashboard (API keys cannot manage webhooks). You can have up to ${RESOURCE_LIMITS.webhooks} per organization, and the response includes the signing secret once; store it.`], code: { lang: 'bash', code: webhookCreateCurl } },
      { h: 'Verify, then act', p: ['Compute the HMAC over the raw body exactly as received and compare in constant time. Reject timestamps that are far from now to stop replays. The <a href="/docs/webhooks">webhook guide</a> has complete Node.js and Python verifiers.'] },
      { h: 'Built for flaky receivers', p: ['A non-2xx response or a timeout schedules a retry. Deliveries have a stable id in <code>x-siar-delivery</code>, so make your handler idempotent and return 200 quickly.'] },
    ],
    faq: [
      { q: 'Which events exist?', a: `${WEBHOOK_EVENTS.map((e) => `<code>${e}</code>`).join(', ')}.` },
      { q: 'What if my endpoint is down?', a: 'Siar retries after 1 minute, 5 minutes, 30 minutes, 2, 6, 12 and 24 hours, then marks the delivery failed. You can resend any delivery from the API.' },
      { q: 'Can I test without publishing a real post?', a: 'Yes. Send a test event to your endpoint from the dashboard, or with <code>POST /webhook/{id}/test</code> from a signed-in owner or admin session.' },
    ],
    related: [['/docs/webhooks', 'Webhook guide'], ['/docs/api/webhook', 'Webhooks reference'], ['/use-cases/social-media-scheduling-api', 'Scheduling API']],
  },
  {
    slug: 'hosted-connect-oauth',
    nav: 'Hosted connect',
    title: 'Hosted social account connect',
    h1: 'Let your users connect their accounts without building OAuth',
    description: `A hosted connect page for ${N} networks: send a link, the user signs in with the network, and the account lands in their team. Branded with your logo and name.`,
    lead: 'Connecting a social account means OAuth redirects, state handling, token storage and a different consent screen per network. Siar does all of it, and gives you a page you can send your users to.',
    points: [
      'One link covers every network you choose to offer.',
      'Your logo, name, language and redirect URL; optional "powered by" hiding.',
      'Short-lived link (set <code>expiresIn</code> in minutes) tied to one team.',
      'Or drive the flow yourself with <code>POST /social-account/connect</code>.',
    ],
    sections: [
      { h: 'Create a link, send your user', p: ['Ask for a portal link for a team and the networks to offer. The URL opens a Siar-hosted page that lists those networks, runs the consent flow and returns the user to your <code>redirectUrl</code>.'], code: { lang: 'bash', code: portalCurl } },
      { h: 'Or run the flow in your own UI', p: ['For one network at a time, request an authorization URL and redirect the user to it. After consent the account is attached to the team and the user returns to your <code>redirectUrl</code>.'], code: { lang: 'bash', code: connectCurl } },
      { h: 'After they connect', p: ['A <code>social-account.created</code> webhook fires. Networks with channels (Facebook Pages, LinkedIn company pages, YouTube brand channels, Business Profile locations) ask the user to choose one, or you can set it with the API. Siar monitors the connection and fires <code>social-account.updated</code> when a network revokes it.'] },
    ],
    faq: [
      { q: 'Do my users need a Siar account?', a: 'No. The portal link carries a token for the team; the user only signs in with the network.' },
      { q: 'Can I limit which networks appear?', a: 'Yes. <code>socialAccountTypes</code> in the request lists exactly the networks to show, and <code>maxSocialAccountsConnected</code> caps how many can be connected through the link.' },
      { q: 'Does Siar see my users\' network passwords?', a: 'No. Consent happens on the network\'s own page, and tokens are encrypted at rest.' },
    ],
    related: [['/docs/connecting-accounts', 'Connecting accounts'], ['/use-cases/multi-tenant-social-media-api', 'Multi-tenant'], ['/docs/api/portal', 'Portal reference']],
  },
  {
    slug: 'social-media-api-for-ai-agents',
    nav: 'For AI agents',
    title: 'Social media API for AI agents',
    h1: 'Give your agent the ability to publish',
    description: 'An MCP server, a JSON-first CLI and a typed SDK for AI agents that post, schedule and read analytics across 15 networks, generated from the same contract as the API.',
    lead: 'An agent that can write a post should be able to publish it, check that it went out and read how it did. Siar ships an MCP server and a CLI that return JSON, so agents can use it without glue code.',
    points: [
      'MCP server for Claude, Cursor and any MCP client.',
      'CLI with JSON on stdout and distinct exit codes, plus a SKILL.md for agent runtimes.',
      'A generic <code>call</code> escape hatch reaches every operation by its operationId.',
      'X costs are quoted before they are incurred.',
    ],
    sections: [
      { h: 'MCP server', p: ['Add the server to your MCP client with an API key. It exposes tools for teams, accounts, uploads, posts, comments, analytics, usage and X credit, plus <code>call_operation</code> for everything else.'], code: { lang: 'json', code: mcpConfig } },
      { h: 'CLI for shells, CI and agents', p: ['Every command prints JSON, sends progress to stderr and uses exit codes an agent can branch on: usage, auth, not found, validation, rate limited, server error.'], code: { lang: 'bash', code: cliSample } },
      { h: 'Guard rails you can rely on', p: ['Quotas, daily caps and per-network validation apply to agents exactly as to any client, so a runaway loop hits a documented limit and not a network\'s spam filter. For X, the credit tools show the balance and quote the cost of an action first.'] },
    ],
    faq: [
      { q: 'Which MCP tools are available?', a: 'Listing and creating teams, listing accounts and getting a connect URL, uploading media, creating and scheduling posts, listing, reading, retrying and deleting posts, comments and replies, post and account analytics, usage, X credit balance and quote, and a generic operation call.' },
      { q: 'Can the agent post to a real account by mistake?', a: 'It can do anything its API key can do. Use a draft status, a dedicated team connected to a test account, or review before scheduling while you build confidence.' },
      { q: 'Is there a plain-text description of the site for LLMs?', a: 'Yes: <a href="/llms.txt">/llms.txt</a> and <a href="/pricing.md">/pricing.md</a>.' },
    ],
    related: [['/docs/sdk-cli-mcp', 'SDK, CLI and MCP'], ['/llms.txt', 'llms.txt'], ['/docs/quickstart', 'Quickstart']],
  },
];

export const useCase = (slug: string) => USE_CASES.find((u) => u.slug === slug)!;
