/**
 * Use-case pages (docs/seo/strike-plan.md §5.6, copy rules in docs/seo/messaging.md).
 *
 * Every network name, status and capability on these pages is generated: status from lib/status.ts, capabilities
 * from the adapters, prices and caps from lib/plans.ts, the webhook retry schedule from the API's webhook engine.
 * Nothing here may say "every/all networks", name a network that is not open as usable, print an npm install line,
 * show a timing, or call the connect page anything but a branded connect link.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { NETWORKS, META, type NetworkType } from './networks';
import { WEBHOOK_EVENTS, EVENT_TEXT } from './events';
import { RESOURCE_LIMITS, PLANS, TIERS, PAID_TIERS, TRIAL_DAYS, fmtInt, money, PRICE_LOCK, type Tier } from './plans';
import { NETWORK_STATUS, OPEN_ORDER, OPEN_LIST, DM_LINE, TOOLING_LINE, STATUS_SUMMARY, isOpen } from './status';
import { API_BASE, DASHBOARD_URL } from '../config';
import { createPostCurl, createPostPython, connectCurl, teamCurl, analyticsCurl, importCurl, verifyNode, webhookCreateCurl, POST_BODY } from './snippets';

/* ───────────────────────── types ───────────────────────── */

export type UseCaseGroup = 'publish' | 'product' | 'reply' | 'measure' | 'more';
/** Which network table the page shows: what a customer can do per network today. */
export type NetworkMode = 'publish' | 'connect' | 'comments' | 'analytics';

export interface Section {
  id?: string;
  h: string;
  p: string[];
  code?: { lang: string; code: string; title?: string };
  table?: { head: string[]; rows: string[][]; caption?: string };
  list?: string[];
  after?: string[];
}

export interface UseCase {
  slug: string;
  /** Short name for breadcrumbs and the hub card title. */
  nav: string;
  /** The <title> (category always in it). Also used by llms.txt. */
  title: string;
  h1: string;
  description: string;
  /** Answer-first lead, 40–60 words, names "Siar, a unified social media API". HTML. */
  lead: string;
  /** One sentence for the hub card, open networks only. */
  card: string;
  group: UseCaseGroup;
  /** ISO date this page's copy was last checked. */
  updated: string;
  points: string[];
  sections: Section[];
  networks?: NetworkMode;
  /** "What this doesn't cover yet": plain lines. */
  limits: string[];
  faq: { q: string; a: string }[];
  related: [string, string][];
  /** False keeps a page out of the build, the hub, the ItemList and llms.txt. */
  live: boolean;
}

/* ───────────────────────── generated facts ───────────────────────── */

const UPDATED = '2026-11-12';

const names: Record<string, string> = { TWITTER: 'X', LINKEDIN: 'LinkedIn' };
export const netName = (t: NetworkType) => names[t] ?? META[t].name;
const join = (xs: string[], word = 'and') => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} ${word} ${xs[xs.length - 1]}`);
const caps = (t: NetworkType) => NETWORKS.find((n) => n.type === t)!.adapter.capabilities;

/** Open networks, in the order buyers ask about them (lib/status.ts). */
export const OPEN: NetworkType[] = OPEN_ORDER.filter((t) => isOpen(t));
/** Built but not (fully) open: shown as status lines, never as usable. */
export const NOT_OPEN: NetworkType[] = (Object.keys(NETWORK_STATUS) as NetworkType[]).filter((t) => !OPEN.includes(t));

/**
 * LinkedIn's adapter declares comments and analytics, but the member scopes they need sit in the scope group that is
 * off in production; docs/seo/research/siar-truth.md §2 says "leave out until tested on a real profile".
 */
const UNTESTED: Partial<Record<'comments' | 'analytics', NetworkType[]>> = { comments: ['LINKEDIN'], analytics: ['LINKEDIN'] };

/** Open networks where the adapter publishes comments and replies. */
export const COMMENT_NETS = OPEN.filter((t) => caps(t).comments && !UNTESTED.comments!.includes(t));
/** Of those, the ones that can also import the comments people left. */
export const COMMENT_IMPORT_NETS = COMMENT_NETS.filter((t) => caps(t).commentImport);
const COMMENT_REPLY_ONLY = COMMENT_NETS.filter((t) => !caps(t).commentImport);
/** Open networks with post or account analytics. */
export const ANALYTICS_NETS = OPEN.filter((t) => (caps(t).postAnalytics || caps(t).accountAnalytics) && !UNTESTED.analytics!.includes(t));
const ANALYTICS_FULL = ANALYTICS_NETS.filter((t) => caps(t).postAnalytics && caps(t).accountAnalytics);

export const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const nameList = (ts: NetworkType[], word = 'and') => join(ts.map(netName), word);
const actionWords: Record<string, string> = { HIDE: 'hide', DELETE: 'delete', LIKE: 'like' };

/** One cell per network and mode, from the adapter's capabilities. */
export function networkCell(t: NetworkType, mode: 'comments' | 'analytics'): string {
  const c = caps(t);
  if (UNTESTED[mode]?.includes(t)) return 'Not offered yet';
  if (mode === 'comments') {
    if (!c.comments) return 'No';
    const acts = ['HIDE', 'DELETE', 'LIKE'].filter((a) => (c.commentActions as string[]).includes(a)).map((a) => actionWords[a]);
    if (!c.commentImport) return `Reply and ${acts.join(', ')}; no import`;
    const base = ['Reply', 'import', ...acts].join(', ');
    return t === 'TWITTER' ? `${base} (X's reply limits apply)` : base;
  }
  if (!c.postAnalytics && !c.accountAnalytics) return 'No';
  const what = c.postAnalytics && c.accountAnalytics ? 'Post and account' : c.postAnalytics ? 'Post only' : 'Account only';
  return c.metered ? `${what}, fetched when you ask, billed from your X credit` : what;
}

/** Webhook backoff, read from the API's webhook engine so the page cannot drift from the code. */
function backoff(): number[] {
  try {
    const src = readFileSync(fileURLToPath(new URL('../../../api/src/engine/webhooks.ts', import.meta.url)), 'utf8');
    const m = src.match(/BACKOFF_MIN\s*=\s*\[([^\]]+)\]/);
    if (m) {
      const xs = m[1].split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0);
      if (xs.length) return xs;
    }
  } catch {}
  throw new Error('usecases.ts: could not read BACKOFF_MIN from apps/api/src/engine/webhooks.ts');
}
export const BACKOFF_MIN = backoff();
const dur = (min: number) => (min < 60 ? `${min} minute${min === 1 ? '' : 's'}` : `${min / 60} hour${min === 60 ? '' : 's'}`);
const elapsed = (min: number) => {
  const h = Math.floor(min / 60), m = min % 60;
  return h ? `${h} h${m ? ` ${m} min` : ''}` : `${m} min`;
};
const TOTAL_MIN = BACKOFF_MIN.reduce((a, b) => a + b, 0);
export const RETRY_COUNT = BACKOFF_MIN.length;
export const RETRY_HOURS = Math.round(TOTAL_MIN / 60);
/** "1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours, 12 hours and 24 hours" */
export const RETRY_STEPS = join(BACKOFF_MIN.map(dur));
export const RETRY_LINE = `retried ${RETRY_COUNT} times over about ${RETRY_HOURS} hours`;

/** Prices in the house form: "$49 a month (RM99 in Malaysia)". */
const price = (t: Tier) => `${money(t, 'MONTHLY', 'usd')} a month (${money(t, 'MONTHLY', 'myr')} in Malaysia)`;
const brandsWord = (n: number | null) => (n === null ? 'unlimited brands' : n === 1 ? '1 brand' : `${n} brands`);
const { STARTER, PRO, BUSINESS, FREE } = PLANS;
const ig = NETWORKS.find((n) => n.type === 'INSTAGRAM')!;

/** Cheapest public plan that covers n brands. */
const planFor = (n: number) => PAID_TIERS.find((t) => PLANS[t].prices && (PLANS[t].teams === null || PLANS[t].teams! >= n))!;
const SCENARIO = [500, 50, 10, 1].map((n) => {
  const t = planFor(n);
  const p = PLANS[t];
  return [fmtInt(n), p.name, `${money(t, 'MONTHLY', 'usd')} (${money(t, 'MONTHLY', 'myr')})`, fmtInt(p.posts), fmtInt(Math.floor(p.posts / n))];
});
const big = PLANS[planFor(500)];

/* ───────────────────────── examples (open networks only) ───────────────────────── */

const J = (o: unknown) => JSON.stringify(o, null, 2).replace(/\n/g, '\n  ');
const curlJson = (method: string, path: string, body: unknown) => `curl -X ${method} "${API_BASE}${path}" \\
  -H "x-api-key: $SIAR_API_KEY" \\
  -H "content-type: application/json" \\
  -d '${J(body)}'`;

const scheduleBody = { ...POST_BODY, postDate: '2026-12-01T01:00:00.000Z', status: 'SCHEDULED' };

const portalExample = `${curlJson('POST', '/social-account/create-portal-link', {
  teamId: 'TEAM_ID',
  socialAccountTypes: ['FACEBOOK', 'INSTAGRAM', 'THREADS', 'LINKEDIN'],
  redirectUrl: 'https://yourapp.example/settings/social',
  logoUrl: 'https://yourapp.example/logo.png',
})}
# → { "url": "${DASHBOARD_URL}/connect/..." }  a hosted page your customer opens`;

const commentExample = curlJson('POST', '/comment', {
  teamId: 'TEAM_ID',
  internalPostId: 'POST_ID',
  socialAccountTypes: ['FACEBOOK', 'INSTAGRAM'],
  data: {
    FACEBOOK: { text: 'Thanks for all the questions. Answers below.' },
    INSTAGRAM: { text: 'Thanks for all the questions. Answers below.' },
  },
});

const inboxExample = `# Every comment Siar has fetched for one brand, newest first
curl "${API_BASE}/comment/import/comments?teamId=TEAM_ID&platform=INSTAGRAM" \\
  -H "x-api-key: $SIAR_API_KEY"

# Reply to one of them as the connected account
${curlJson('POST', '/comment', {
  teamId: 'TEAM_ID',
  fetchedParentCommentId: 'FETCHED_COMMENT_ID',
  socialAccountTypes: ['INSTAGRAM'],
  data: { INSTAGRAM: { text: 'Thank you. The link is in our bio.' } },
})}`;

const bioExample = `# One page per brand. It starts unpublished.
${curlJson('POST', '/bio', { teamId: 'TEAM_ID', slug: 'acme-bakery', title: 'Acme Bakery', description: 'Bread from 7 a.m.' })}
# → { "id": "BIO_ID", "slug": "acme-bakery", "published": false, "items": [], ... }

# Add a link
${curlJson('POST', '/bio-item', { bioId: 'BIO_ID', type: 'LINK', title: 'Order online', url: 'https://acme.example/order' })}

# Publish the page
${curlJson('PATCH', '/bio/BIO_ID', { published: true })}`;

const bioAnalyticsExample = `curl "${API_BASE}/bio-analytics?bioId=BIO_ID&from=2026-11-01&to=2026-11-30" \\
  -H "x-api-key: $SIAR_API_KEY"`;

const agentBody = {
  teamId: 'TEAM_ID',
  title: 'Release 2.4',
  postDate: '2026-12-01T01:00:00.000Z',
  status: 'SCHEDULED',
  socialAccountTypes: ['BLUESKY', 'MASTODON'],
  data: {
    BLUESKY: { text: 'Release 2.4 is out: faster exports and a new calendar view.' },
    MASTODON: { text: 'Release 2.4 is out: faster exports and a new calendar view.' },
  },
};

const agentResult = `// Example: post.published for a post where one network said no (fields trimmed)
{
  "id": "evt_...",
  "type": "post.published",
  "data": {
    "id": "POST_ID",
    "status": "ERROR",
    "errors": { "MASTODON": "<a plain-English fix>" },
    "errorsVerbose": {
      "MASTODON": {
        "code": "PERMISSION",
        "errorMessage": "<the network's own message>",
        "httpStatus": 403,
        "retryability": "non_retryable",
        "userFacingMessage": "<a plain-English fix>"
      }
    }
  }
}`;

/** Networks that connect through Siar's Meta app; the rest of the open list connects through Siar's own apps. */
const META_APP: NetworkType[] = ['FACEBOOK', 'INSTAGRAM', 'THREADS'];
const OWN_APPS = join(OPEN.filter((t) => !META_APP.includes(t)).map((t) => (t === 'LINKEDIN' ? 'LinkedIn profiles' : netName(t))));

/** Event table for the webhooks page. lib/events.ts says post.published is "sent once per post per network"; it is not. */
const EVENT_OVERRIDE: Record<string, string> = {
  'post.published': 'A post reached a final state: published, or failed on one or more networks. Carries each network\'s result. Sent once per post, and again after a retry settles.',
};
const eventRows = WEBHOOK_EVENTS.map((e) => [`<code>${e}</code>`, `${EVENT_OVERRIDE[e] ?? EVENT_TEXT[e] ?? ''}${e.startsWith('conversation.') ? ' (DM beta)' : ''}`]);

/* ───────────────────────── pages ───────────────────────── */

const ALL: UseCase[] = [
  {
    slug: 'social-media-posting-api',
    nav: 'Social media posting API',
    title: 'Social media posting API: one request, many networks',
    h1: 'Social media posting API: one request, many networks',
    description: `One REST request posts to ${OPEN_LIST}, checked before it is sent and sent once.`,
    lead: `A social media posting API publishes from your code instead of each network's app. Siar, a <a href="/">unified social media API</a>, takes one request with a payload per network and posts to ${OPEN_LIST}. Each network's rules are checked before Siar accepts the post, and each account gets it once.`,
    card: `One request posts to ${OPEN_LIST}. Each network gets its own text and media, and a request that breaks a network's rules gets a <code>400</code> naming the field.`,
    group: 'publish',
    updated: UPDATED,
    points: [
      'One request, several networks, each with its own text, media and options.',
      'Checked against each network\'s limits before the post is accepted.',
      'Each network target is claimed once, so retries and restarts cannot post it twice.',
      'A result per network, with the network\'s own error when it fails.',
    ],
    sections: [
      {
        id: 'one-request', h: 'One request, many networks',
        p: [
          'A post lists the networks it targets in <code>socialAccountTypes</code> and carries one payload per network under <code>data</code>. The brand decides which connected account each network resolves to, so the request never contains a token.',
          'One post can mix very different shapes: an Instagram post with a first comment, a LinkedIn profile post and a short Bluesky post.',
        ],
        code: { lang: 'bash', code: createPostCurl(), title: 'Example: one post to Instagram, a LinkedIn profile and Bluesky' },
      },
      {
        id: 'validation', h: 'Validation before send',
        p: [
          'Text length, media type, file size, duration and aspect ratio are checked against each network\'s limits when you create the post. A request that cannot work returns <code>400</code> with an <code>issues</code> array whose <code>path</code> points at the field, for example <code>data.INSTAGRAM.text</code>.',
          'You fix it while you are still in the request, not at 9 a.m. when the post was due. Networks can still reject a post that passed; then you get the network\'s own error.',
        ],
      },
      {
        id: 'sent-once', h: 'Sent once',
        p: [
          'Publishing starts by claiming each network target with a conditional database update and a fresh attempt id. Only the claimant publishes, so a retry, a restart or a double click cannot send the same post twice.',
          'If a send is interrupted, Siar looks for the post on the account before sending again. Where a network gives no way to look, Siar stops and marks it "could not be confirmed" instead of risking a second post.',
          'There is no idempotency key on post creation. Resending a create call makes a second post, so check by your own reference first.',
        ],
      },
      {
        id: 'errors', h: 'When a network says no',
        p: [
          'The other networks still publish. The failed one keeps the network\'s own code and message, plus a plain-English fix and a verdict: retry, don\'t retry, or unknown.',
          `Retry the post and only the failed networks are sent again. A retry does not use another post from your plan, up to ${RESOURCE_LIMITS.maxRetries} times. Siar's <a href="/docs/errors">error envelope</a> and each network's error page, such as the <a href="/instagram-api/errors">Instagram API error codes</a>, list what you can get back.`,
        ],
      },
      {
        id: 'statuses', h: 'Statuses you can act on',
        p: ['A post moves from <code>DRAFT</code> or <code>SCHEDULED</code> to <code>PROCESSING</code>, and ends at <code>POSTED</code> or <code>ERROR</code>. <code>RETRYING</code> covers a retry in progress and <code>REVIEW</code> a post the network is still checking. The <a href="/docs/posting">posting guide</a> says what to poll or listen for.'],
      },
    ],
    networks: 'publish',
    limits: [
      'No idempotency key on post creation: resending a create call makes a second post.',
      'Networks still reject posts. Siar tells you which network said no and why; it does not promise that every post publishes.',
    ],
    faq: [
      { q: 'Which networks can I post to with Siar today?', a: STATUS_SUMMARY },
      { q: 'Can I post different text to each network?', a: 'Yes. Each network has its own entry under <code>data</code>, so text, media and options can differ per network inside one post.' },
      { q: 'What happens if one network fails and the others succeed?', a: 'The networks that succeeded stay published. The failed one keeps the network\'s own error and a plain-English fix. A retry re-sends only the failed networks and does not use another post from your plan.' },
      { q: 'Does a post to five networks count as five posts?', a: 'No. A post sent to every connected network counts as one post. Drafts don\'t count, and retrying a failed post doesn\'t count again.' },
      { q: 'Can I edit a post after it is published?', a: 'Where the network allows editing through its API, yes, with <code>PATCH /post/{id}</code>. Each network\'s page lists whether it allows edit and delete.' },
    ],
    related: [['/use-cases/social-media-scheduling-api', 'Social media scheduling API'], ['/docs/posting', 'Posting guide'], ['/docs/api/post', 'Posts API reference']],
    live: true,
  },
  {
    slug: 'social-media-scheduling-api',
    nav: 'Social media scheduling API',
    title: 'Social media scheduling API: post at a set time',
    h1: 'Social media scheduling API: set a time, get the result',
    description: 'Schedule posts with a UTC time. Siar checks them when you schedule, publishes when the time comes, and tells you by signed webhook what happened.',
    lead: 'A social media scheduling API holds a post until a set time and publishes it for you. Siar, a <a href="/">unified social media API</a>, takes a future <code>postDate</code> in UTC, checks the post and your caps when you schedule, publishes when the time comes, and tells you by signed webhook what happened on each network.',
    card: 'Set a future time in UTC and Siar publishes when it comes, on every open network. Each account gets the post once, even after a retry or a restart.',
    group: 'publish',
    updated: UPDATED,
    points: [
      'A UTC <code>postDate</code> in the future. No scheduler to run yourself.',
      'Drafts for work in progress. They don\'t count against your quota.',
      'Monthly quota and daily caps are checked when you schedule, not when the post is due.',
      'Each network target is claimed once, so a scheduled post is never sent twice.',
    ],
    sections: [
      {
        id: 'scheduled', h: 'A scheduled post is a normal post',
        p: ['Create it with a future <code>postDate</code> and <code>status: "SCHEDULED"</code>. Move it by patching <code>postDate</code>, or turn it back into a draft.'],
        code: { lang: 'bash', code: createPostCurl(scheduleBody), title: 'Example: schedule a post for 9 a.m. in Malaysia (01:00 UTC)' },
      },
      {
        id: 'checked-early', h: 'Checked when you schedule',
        p: [
          'A post counts against your monthly quota when it leaves draft, not when it publishes. So a post that is already scheduled is never refused later because the month rolled over.',
          `Daily caps per account are checked against the post's date in UTC. For example, an Instagram account takes ${fmtInt(ig.dailyPosts[0])} posts a day on ${FREE.name}. Over-booking a day fails when you schedule, not at 9 a.m. Moving a post to another day moves its daily cap with it.`,
        ],
      },
      {
        id: 'nine-am', h: 'What happens at 9 a.m. if it fails',
        p: [
          'If the network has a passing problem, such as a timeout, a rate limit or a server error, Siar tries again on its own: up to 3 attempts in all, waiting longer each time or until the network\'s rate limit resets.',
          'If the network refuses the post, that network ends in <code>ERROR</code> with its own code and message and a plain-English fix. The other networks still publish. The <code>post.published</code> webhook fires with each network\'s result, and the dashboard shows a notification.',
          `Fix the cause and retry the post. Only the failed networks are sent again, up to ${RESOURCE_LIMITS.maxRetries} times, and a retry does not use another post from your plan.`,
          'If the account was disconnected or needs reconnecting, the post fails for that network with a message saying so, before anything is sent.',
        ],
      },
      {
        id: 'webhook', h: 'Know without polling',
        p: [`Subscribe an HTTPS endpoint to <code>post.published</code>. Each delivery is signed with HMAC-SHA256 and, if your server is down, ${RETRY_LINE}. See the <a href="/use-cases/social-media-webhooks">social media webhooks API</a> for the schedule.`],
      },
    ],
    networks: 'publish',
    limits: [
      'Times are UTC. Convert the user\'s local time before you send it.',
      'No idempotency key on post creation: resending a create call schedules a second post.',
    ],
    faq: [
      { q: 'Which time zone does postDate use?', a: 'UTC, as an ISO 8601 timestamp. Convert the user\'s local time before you send it.' },
      { q: 'How far ahead can I schedule?', a: 'As far as your quota allows. A post counts against the monthly quota when it leaves draft, not when it publishes.' },
      { q: 'How do I know a scheduled post went out?', a: 'Subscribe to the <code>post.published</code> webhook, which fires when the post has published or failed, with each network\'s result. Or read the post and check its status.' },
      { q: 'What if a scheduled post fails?', a: `The other networks still publish. The failed one keeps the network's own error and a fix. Retry the post and only the failed networks are sent again, up to ${RESOURCE_LIMITS.maxRetries} times, without using another post from your plan.` },
    ],
    related: [['/use-cases/social-media-posting-api', 'Social media posting API'], ['/docs/posting', 'Posting guide'], ['/pricing', 'Pricing and quotas']],
    live: true,
  },
  {
    slug: 'multi-tenant-social-media-api',
    nav: 'Social media API for SaaS',
    title: 'Social media API for SaaS: multi-tenant by design',
    h1: 'Social media API for SaaS: multi-tenant by design',
    description: 'Run social publishing for every customer of your SaaS from one organization: a brand per customer, a branded connect link, one API key, no per-account fees.',
    lead: `Add social publishing to your product without building ${WORDS[OPEN.length] ?? OPEN.length} integrations or sitting through Meta's review. Siar, a <a href="/">unified social media API</a>, gives each customer their own brand, a connect link with your name on it and one API key for all of them. You pay per organization, so the bill stops growing with every account.`,
    card: `Give each customer their own brand, keep one API key for all of them, and pay per organization. ${BUSINESS.name} is ${price('BUSINESS')} for unlimited brands and ${fmtInt(BUSINESS.posts)} posts.`,
    group: 'product',
    updated: UPDATED,
    points: [
      'A brand per customer. A brand is a team in the API, and it holds at most one account per network.',
      `No per-account fees. Each brand connects one account on every open network: ${STARTER.name} ${brandsWord(STARTER.teams)}, ${PRO.name} ${brandsWord(PRO.teams)}, ${BUSINESS.name} ${brandsWord(BUSINESS.teams)}.`,
      'Customers connect through a branded connect link. You never see a password or token.',
      'Every query is scoped to your organization. An id from another organization returns 404.',
    ],
    sections: [
      {
        id: 'accounted-for', h: 'Your customers\' posts, accounted for',
        p: [
          'Every post ends in a recorded state: posted, failed with the network\'s own reason and a fix, or could not be confirmed when an interrupted send cannot be checked. Your product reads that state per customer and per network.',
          'Each network\'s limits are checked when the post is created, so a bad request fails with a <code>400</code> you can show your customer. Each network target is claimed once, so retries and restarts cannot publish it twice. A signed <code>post.published</code> webhook tells your server each network\'s result.',
          'See <a href="/docs/posting">how posting works</a> for the statuses.',
        ],
      },
      {
        id: 'bill', h: 'A bill that stops growing',
        p: [
          'Siar is priced per organization, not per connected account. A customer who adds an Instagram account costs you nothing extra. You pay for brands and posts.',
          `At 500 brands, ${big.name} is ${price(planFor(500))}: ${fmtInt(big.posts)} posts a month across them, or ${fmtInt(Math.floor(big.posts / 500))} a brand. ${PRICE_LOCK}`,
        ],
        table: { head: ['Brands', 'Plan', 'A month (Malaysia)', 'Posts a month', 'Posts per brand'], rows: SCENARIO, caption: 'Monthly prices from the price list. A post sent to every connected network counts as one post.' },
        after: ['Posts are capped every month. Drafts don\'t count, and retrying a failed post doesn\'t count again. The <a href="/pricing">pricing page</a> has the full table.'],
      },
      {
        id: 'brands', h: 'One brand per customer',
        p: [
          'Create a brand when a customer signs up and store its id against your own user record. Every upload, post, comment and connected account lives under it, so listing one customer\'s posts is one query with their <code>teamId</code>.',
          'A brand holds at most one account per network. A customer with two Facebook Pages needs two brands.',
        ],
        code: { lang: 'bash', code: teamCurl, title: 'Example: create a brand (a team in the API)' },
      },
      {
        id: 'connect', h: 'Customers connect through your link',
        p: [
          'Create a <a href="/use-cases/hosted-connect-oauth">branded connect link</a> for the customer\'s brand and the networks you offer. They sign in to each network in their own browser and return to your app. The page shows your name, logo and color; it also says "Powered by Siar", runs on app.siaran.my and is in English.',
          'When a network revokes access, Siar flags the account and fires a <code>social-account.updated</code> webhook, so you can ask the customer to reconnect.',
        ],
      },
      {
        id: 'keys', h: 'One API key, kept on your server',
        p: [`API keys belong to the organization and work across every brand in it, up to ${RESOURCE_LIMITS.apiKeys} keys. Keep them on your server and call Siar for the customer's brand. Customers never see a key: the connect link carries a token for one brand.`],
      },
    ],
    networks: 'connect',
    limits: [
      'One account per network per brand.',
      'No customer logins to the Siar dashboard. Your product is the interface your customers see.',
      'No idempotency key on post creation: resending a create call makes a second post.',
    ],
    faq: [
      { q: 'How do I give each customer their own social accounts?', a: 'Create a brand (a team in the API) per customer and send them a connect link for it. Each brand holds one account per network, and every post, comment and upload is filed under it.' },
      { q: 'Does the price grow with the number of connected accounts?', a: `No. There are no per-account fees. ${PRO.name} runs ${brandsWord(PRO.teams)} for ${price('PRO')}, and ${BUSINESS.name} runs unlimited brands and ${fmtInt(BUSINESS.posts)} posts for ${price('BUSINESS')}. ${PRICE_LOCK}` },
      { q: 'Can I give customers their own API keys?', a: 'No. API keys belong to the organization. Keep them on your server and call Siar for the customer\'s brand. The connect link uses a token for one brand, never your key.' },
      { q: 'Is data from one customer visible to another?', a: 'Every query is scoped to your organization, and within it to the brand you name. Ids from another organization return 404, not 403, so they cannot be probed.' },
      { q: 'Which networks can my customers connect today?', a: STATUS_SUMMARY },
    ],
    related: [['/use-cases/hosted-connect-oauth', 'Social media OAuth API: a branded connect link'], ['/docs/data-model', 'Data model: organizations, brands and accounts'], ['/docs/api/team', 'Teams API reference'], ['/pricing', 'Pricing and quotas']],
    live: true,
  },
  {
    slug: 'hosted-connect-oauth',
    nav: 'Social media OAuth API',
    title: 'Social media OAuth API: a branded connect link',
    h1: 'Social media OAuth API: a branded connect link',
    description: `Let customers connect ${nameList(OPEN.slice(0, 4))} and more through a link with your name, logo and color. Siar runs the OAuth flow.`,
    lead: 'A branded connect link lets your customers connect their social accounts without you building OAuth. Siar, a <a href="/">unified social media API</a>, hosts the page: your customer signs in to each network in their own browser and comes back to your app. You never see a password or token, and Siar stores the tokens encrypted.',
    card: `Send one link with your name, logo and color. Your customer signs in to ${nameList(OPEN, 'or')} in their own browser, and you never see a password or token.`,
    group: 'product',
    updated: UPDATED,
    points: [
      'One link per brand, listing only the networks you choose.',
      'Your name, logo and accent color, set once for the organization. A link can carry its own logo.',
      'The page says "Powered by Siar", runs on app.siaran.my and is in English.',
      'Or run one network at a time from your own settings page with <code>POST /social-account/connect</code>.',
    ],
    sections: [
      {
        id: 'link', h: 'Create a link, send your customer',
        p: ['Ask for a connect link for a brand and the networks to offer. The URL opens a page that lists those networks, runs each network\'s consent screen and returns your customer to your <code>redirectUrl</code>. A link works for 24 hours.'],
        code: { lang: 'bash', code: portalExample, title: 'Example: a connect link for four open networks' },
      },
      {
        id: 'own-ui', h: 'Or run the flow in your own UI',
        p: ['For one network at a time, ask for an authorization URL and send your customer to it. After consent the account joins the brand and your customer lands on your <code>redirectUrl</code>.'],
        code: { lang: 'bash', code: connectCurl, title: 'Example: connect one LinkedIn profile' },
      },
      {
        id: 'apps', h: 'The apps behind the link',
        p: [
          'Each network has its own consent screen, scopes, token lifetimes and review. Facebook, Instagram and Threads connect through Siar\'s Meta app, which passed Meta\'s App Review on 27 October 2026 with all 27 permissions it asked for.',
          `${OWN_APPS} connect through Siar's own apps, which are live today.`,
        ],
      },
      {
        id: 'brand', h: 'What your customer sees',
        p: [
          'Your name, logo and accent color at the top, then the networks you offered. A line at the bottom says "Powered by Siar". The page runs on app.siaran.my and is in English.',
          'Set the name, logo and color once in organization settings, from the dashboard or with <code>PATCH /organization/settings</code>. A link can carry its own <code>logoUrl</code>.',
        ],
      },
      {
        id: 'after', h: 'After they connect',
        p: ['A <code>social-account.created</code> webhook fires. For Facebook, your customer picks the Page to connect after sign-in, or you set it through the API. When a network revokes access, Siar flags the account and fires <code>social-account.updated</code>.'],
      },
    ],
    networks: 'connect',
    limits: [
      'The connect page says "Powered by Siar", runs on app.siaran.my and is in English.',
      'A brand holds one account per network. A second Instagram account for the same customer needs a second brand.',
    ],
    faq: [
      { q: 'What is a social media OAuth API?', a: 'It runs each network\'s sign-in and consent flow for you and stores the tokens. With Siar you create a branded connect link, your customer signs in to each network, and the account appears under their brand, ready to post.' },
      { q: 'Do my customers need a Siar account?', a: 'No. The link carries a token for one brand. Your customer only signs in to the network.' },
      { q: 'Can I limit which networks appear?', a: 'Yes. <code>socialAccountTypes</code> lists exactly the networks the page shows.' },
      { q: 'Does Siar see my customers\' passwords?', a: 'No. Consent happens on the network\'s own page. Tokens are encrypted at rest and never returned by the API.' },
      { q: 'Can the page carry my brand?', a: 'It shows your name, logo and accent color. It also says "Powered by Siar", runs on app.siaran.my and is in English.' },
    ],
    related: [['/docs/connecting-accounts', 'Connecting accounts guide'], ['/docs/api/social-account', 'Social accounts API reference'], ['/use-cases/multi-tenant-social-media-api', 'Social media API for SaaS']],
    live: true,
  },
  {
    slug: 'social-media-comments-api',
    nav: 'Social media comments API',
    title: 'Social media comments API: reply, import, moderate',
    h1: 'Social media comments API: reply, import and moderate',
    description: `Reply to comments, import what people wrote, and hide, delete or like comments through one API. Live on ${COMMENT_NETS.length} networks today.`,
    lead: `A social media comments API lets your code answer comments as the connected account and pull in what people wrote. Siar, a <a href="/">unified social media API</a>, has comments live on ${COMMENT_NETS.length} networks: ${nameList(COMMENT_NETS)}. ${COMMENT_REPLY_ONLY.length ? `${nameList(COMMENT_REPLY_ONLY)} can reply and delete, but not import.` : ''}`,
    card: `Publish replies and import the comments people leave on ${nameList(COMMENT_IMPORT_NETS)}. Then hide, delete or like them where the network allows.`,
    group: 'reply',
    updated: UPDATED,
    points: [
      'Create comments and replies on several networks in one call, each with its own text.',
      'Import the comments on a post, then hide, delete or like them where the network allows.',
      'A <code>comment.received</code> webhook for each new comment, and <code>comment.published</code> for yours.',
      'A first comment with the post, per network.',
    ],
    sections: [
      {
        id: 'reply', h: 'Comment on a post',
        p: ['A comment targets a post you published through Siar or one you imported, and carries a payload per network, just like a post. To answer someone, pass the comment you are replying to.'],
        code: { lang: 'bash', code: commentExample, title: 'Example: one reply on Facebook and Instagram' },
      },
      {
        id: 'import', h: 'Import, then moderate',
        p: [
          'Start a comment import for a post. Siar reads the comments from the network, fires <code>comment.received</code> for each new one, and lets you hide, delete or like them where the network allows.',
          `Each plan sets how many comments one import reads: ${fmtInt(FREE.commentImportPerPost)} on ${FREE.name} up to ${fmtInt(BUSINESS.commentImportPerPost)} on ${BUSINESS.name}.`,
        ],
      },
      {
        id: 'limits', h: 'Caps that protect the account',
        p: [
          'Networks watch for spam-like replies. Siar applies a daily comment cap per connected account and the network\'s own length limit, and refuses a request that would pass either, with a message that names the limit.',
          `Comments also count toward a monthly quota: ${fmtInt(STARTER.comments)} on ${STARTER.name}, ${fmtInt(PRO.comments)} on ${PRO.name} and ${fmtInt(BUSINESS.comments)} on ${BUSINESS.name}. On X, replies and imports are billed from your X credit at X's own USD prices.`,
        ],
      },
      {
        id: 'dms', h: 'Direct messages',
        p: [`${DM_LINE} No other network has DMs in Siar. The <a href="/use-cases/social-media-inbox-api">social media inbox API</a> page covers both.`],
      },
    ],
    networks: 'comments',
    limits: [
      'LinkedIn comments are not offered yet.',
      ...COMMENT_REPLY_ONLY.map((t) => `${netName(t)}: the bot can reply and delete, but cannot import comments.`),
      NETWORK_STATUS.SLACK.line,
      DM_LINE,
    ],
    faq: [
      { q: 'Which networks support comments through Siar?', a: `${nameList(COMMENT_IMPORT_NETS)}: reply, import and moderate where the network allows. ${COMMENT_REPLY_ONLY.length ? `${nameList(COMMENT_REPLY_ONLY)}: reply and delete only. ` : ''}LinkedIn comments are not offered yet.` },
      { q: 'Can I post a first comment with the post?', a: 'Yes. <code>firstComment</code> on the post takes one text per network, within that network\'s comment length.' },
      { q: 'Do comments count toward a quota?', a: `Yes. Comments have a monthly quota (${fmtInt(STARTER.comments)} on ${STARTER.name}, ${fmtInt(PRO.comments)} on ${PRO.name}) and a daily cap per connected account.` },
      { q: 'Can I send DMs with Siar?', a: `${DM_LINE} No other network has DMs in Siar.` },
    ],
    related: [['/docs/api/comment', 'Comments API reference'], ['/use-cases/social-media-inbox-api', 'Social media inbox API'], ['/use-cases/social-media-webhooks', 'Social media webhooks API']],
    live: true,
  },
  {
    slug: 'social-media-inbox-api',
    nav: 'Social media inbox API',
    title: 'Social media inbox API: comments now, DMs in beta',
    h1: 'Social media inbox API: one inbox for comments',
    description: `Pull comments from ${nameList(COMMENT_IMPORT_NETS.slice(0, 6))} into one inbox and reply through one API. Facebook and Instagram DMs are in beta.`,
    lead: `A social media inbox API puts comments from several networks in one place your code can read and answer. Siar, a <a href="/">unified social media API</a>, does this for comments today on ${nameList(COMMENT_IMPORT_NETS)}. Direct messages are a beta: Facebook and Instagram only, turned on per organization on request.`,
    card: `Answer comments from ${nameList(COMMENT_IMPORT_NETS)} in one inbox. Facebook and Instagram DMs are in beta, turned on per organization on request (paid plans).`,
    group: 'reply',
    updated: UPDATED,
    points: [
      'Every comment Siar has fetched for a brand, in one list you can filter by network or post.',
      'Reply as the connected account; hide, delete or like where the network allows.',
      'A <code>comment.received</code> webhook for each new comment.',
      DM_LINE,
    ],
    sections: [
      {
        id: 'list', h: 'Comments in one list',
        p: [
          'Import the comments on your posts, then read them for the whole brand in one call. Filter by network, post or account. Each comment carries its author, text, network and the post it belongs to.',
          'Siar\'s own dashboard inbox is built on the same endpoints.',
        ],
        code: { lang: 'bash', code: inboxExample, title: 'Example: read a brand\'s Instagram comments and answer one' },
      },
      {
        id: 'new', h: 'New comments without polling',
        p: ['Subscribe to <code>comment.received</code>. It fires for each new comment Siar picks up, signed like every Siar webhook. Your own replies fire <code>comment.published</code> when the network accepts them, or when it refuses them.'],
      },
      {
        id: 'dms', h: 'Direct messages, in beta',
        p: [
          `${DM_LINE} When it is on, conversations and messages from those two networks join the same API, with <code>conversation.*</code> webhooks.`,
          'No other network has DMs in Siar. To ask for the beta, write to us from the organization\'s owner account.',
        ],
      },
    ],
    networks: 'comments',
    limits: [
      'LinkedIn comments are not offered yet.',
      ...COMMENT_REPLY_ONLY.map((t) => `${netName(t)}: the bot can reply and delete, but cannot import comments, so they do not reach the inbox.`),
      NETWORK_STATUS.SLACK.line,
      'DMs: Facebook and Instagram only, in beta, on paid plans.',
    ],
    faq: [
      { q: 'What is a social media inbox API?', a: 'It gathers comments, and where a network allows it messages, from several networks into one list your code can read and answer. With Siar, comments work today; Facebook and Instagram DMs are a beta turned on per organization.' },
      { q: 'Which networks reach the inbox?', a: `Comments from ${nameList(COMMENT_IMPORT_NETS)}. LinkedIn comments are not offered yet.` },
      { q: 'Can I answer DMs through the API?', a: `${DM_LINE} No other network has DMs in Siar.` },
      { q: 'Do I have to poll for new comments?', a: 'No. Subscribe to the <code>comment.received</code> webhook. It fires for each new comment Siar picks up.' },
    ],
    related: [['/use-cases/social-media-comments-api', 'Social media comments API'], ['/docs/api/comment', 'Comments API reference'], ['/docs/api/conversation', 'Conversations API reference']],
    live: true,
  },
  {
    slug: 'social-media-webhooks',
    nav: 'Social media webhooks API',
    title: 'Social media webhooks API: signed and retried',
    h1: 'Social media webhooks API: signed, retried and resendable',
    description: `Get a signed webhook when a post publishes or fails, with each network's result. ${RETRY_LINE[0].toUpperCase()}${RETRY_LINE.slice(1)}, with a delivery log and resend.`,
    lead: `A social media webhook tells your server what happened to a post without polling. Siar, a <a href="/">unified social media API</a>, signs every delivery with HMAC-SHA256 and sends <code>post.published</code> when a post has published or failed, with each network's result. If your server is down, Siar retries ${RETRY_COUNT} times over about ${RETRY_HOURS} hours.`,
    card: `Get a signed <code>post.published</code> event with each network's result. If your server is down, Siar retries ${RETRY_COUNT} times over about ${RETRY_HOURS} hours, with a delivery log you can inspect and resend.`,
    group: 'measure',
    updated: UPDATED,
    points: [
      `${WEBHOOK_EVENTS.length} event types across posts, comments, brands, accounts, X credit and conversations.`,
      'HMAC-SHA256 over <code>timestamp.rawBody</code>, in the <code>x-siar-signature</code> header.',
      `Failed deliveries are ${RETRY_LINE}: ${RETRY_STEPS}.`,
      'A delivery log per endpoint: inspect, resend, send a test, rotate the secret.',
    ],
    sections: [
      {
        id: 'retry-schedule', h: 'The retry schedule',
        p: ['A <code>2xx</code> response within 15 seconds means delivered. Anything else, a timeout or a redirect schedules the next attempt. After the last one the delivery is marked failed and stays in the log.'],
        table: {
          head: ['Attempt', 'Sent', 'Time since the first try'],
          rows: [['1', 'When the event happens', '0'], ...BACKOFF_MIN.map((m, i) => [String(i + 2), `${dur(m)} after attempt ${i + 1}`, elapsed(BACKOFF_MIN.slice(0, i + 1).reduce((a, b) => a + b, 0))])],
        },
        after: [`That is ${RETRY_COUNT} retries over ${elapsed(TOTAL_MIN)}, about ${RETRY_HOURS} hours. Events can arrive out of order and more than once, so deduplicate on the event <code>id</code>.`],
      },
      {
        id: 'signature', h: 'Verify the signature',
        p: [
          'Each delivery carries <code>x-siar-event</code>, <code>x-siar-delivery</code>, <code>x-siar-timestamp</code> and <code>x-siar-signature</code>. The signature is a hex HMAC-SHA256 of <code>timestamp + "." + rawBody</code> with your endpoint\'s secret.',
          'Compute it over the raw body exactly as received, compare in constant time, and reject timestamps far from now to stop replays. The <a href="/docs/webhooks">webhook guide</a> also has a Python verifier.',
        ],
        code: { lang: 'js', code: verifyNode, title: 'Example: verify a delivery in Node.js' },
      },
      {
        id: 'on-failure', h: 'What you get when a post fails',
        p: [
          '<code>post.published</code> fires when a post reaches its final state: published, or failed on one or more networks. It fires again after a retry settles. The payload is the post with each network\'s result.',
          'For each network that failed you get the network\'s own code and message, a plain-English fix and a verdict: retry, don\'t retry, or unknown. The other networks still publish, so your handler can tell the user exactly which network said no and why.',
        ],
        code: { lang: 'json', code: agentResult.replace('// Example: ', '// '), title: 'Example: a post where one network said no' },
      },
      {
        id: 'resend', h: 'Inspect and resend',
        p: [
          'Every delivery is logged with its status, response code and the start of the response body. Organization owners and admins can resend any delivery, send a test event and rotate the secret from the dashboard. API keys cannot change webhooks.',
          'A resend is a new delivery of the same event, with a new <code>x-siar-delivery</code> id and the same event <code>id</code>.',
        ],
      },
      {
        id: 'endpoint', h: 'Create an endpoint',
        p: [`Up to ${RESOURCE_LIMITS.webhooks} endpoints per organization, each subscribed to the events it needs. The signing secret is shown once, when you create the endpoint.`],
        code: { lang: 'bash', code: webhookCreateCurl, title: 'Example: the request behind the dashboard' },
      },
      {
        id: 'events', h: 'Events',
        p: [`${WEBHOOK_EVENTS.length} event types. Conversation events need the DM beta.`],
        table: { head: ['Event', 'When it fires'], rows: eventRows },
      },
    ],
    limits: [
      `Up to ${RESOURCE_LIMITS.webhooks} endpoints per organization.`,
      'Only owners and admins manage webhooks, from the dashboard. API keys cannot.',
      'Events can arrive out of order and more than once.',
    ],
    faq: [
      { q: 'What is a social media webhooks API?', a: 'It sends your server an HTTPS request when something happens on a social account, so you don\'t poll. Siar signs each delivery, sends <code>post.published</code> with each network\'s result, and retries failed deliveries.' },
      { q: 'What if my endpoint is down?', a: `Siar retries after ${RETRY_STEPS}, about ${RETRY_HOURS} hours in all, then marks the delivery failed. Owners and admins can resend it from the delivery log.` },
      { q: 'How do I verify a delivery?', a: 'Compute a hex HMAC-SHA256 of the timestamp, a dot and the raw body with your endpoint\'s secret, and compare it in constant time with <code>x-siar-signature</code>. Reject old timestamps.' },
      { q: 'Which events exist?', a: `${WEBHOOK_EVENTS.map((e) => `<code>${e}</code>`).join(', ')}.` },
      { q: 'Can I test without publishing a real post?', a: 'Yes. Send a test event to your endpoint from the dashboard. It is signed like any other delivery.' },
    ],
    related: [['/docs/webhooks', 'Webhook guide'], ['/docs/api/webhook', 'Webhooks API reference'], ['/use-cases/social-media-scheduling-api', 'Social media scheduling API']],
    live: true,
  },
  {
    slug: 'social-media-analytics-api',
    nav: 'Social media analytics API',
    title: 'Social media analytics API: one shape, raw data kept',
    h1: 'Social media analytics API: post and account metrics in one shape',
    description: `Read post and account metrics from ${nameList(ANALYTICS_FULL)} in one shape, with the raw payload kept. On paid plans.`,
    lead: `A social media analytics API reads post and account metrics from each network. Siar, a <a href="/">unified social media API</a>, returns them in one shape for ${nameList(ANALYTICS_NETS)}, and keeps each network's raw payload beside it. Analytics are on paid plans, from ${price('STARTER')}.`,
    card: `Read post and account metrics from ${nameList(ANALYTICS_FULL)} in one shape, with the network's raw payload kept beside it. Analytics are on every paid plan.`,
    group: 'measure',
    updated: UPDATED,
    points: [
      'Post and account metrics through one set of endpoints.',
      'The raw network payload at the <code>/raw</code> variants.',
      'Bulk reads for many posts; force a refresh when you need it now.',
      'Post history import to backfill posts published outside Siar.',
    ],
    sections: [
      {
        id: 'read', h: 'Read metrics for a post or an account',
        p: ['Pass a post id and the network, or a brand and the network for account metrics. Impressions, reach, engagement and follower counts mean slightly different things on each network, so the raw payload stays next to the normalised numbers.'],
        code: { lang: 'bash', code: analyticsCurl, title: 'Example: one Instagram post' },
      },
      {
        id: 'fresh', h: 'How fresh the numbers are',
        p: [
          'Networks report on their own schedule, and some hold metrics back for a while after publishing. Siar refreshes in the background: accounts daily, posts often in their first day and then daily for 30 days. Each snapshot is kept with its time. You can force a refresh, which is capped per day.',
          'X bills every read, so X analytics are fetched only when you ask, at most 5 times per post or account a day, billed from your X credit at X\'s own USD prices.',
        ],
      },
      {
        id: 'history', h: 'Import history',
        p: ['Post history import pulls posts that were published outside Siar, optionally with their metrics, so a new customer has a full picture from day one. It runs as a job you can poll, within your plan\'s import quota.'],
        code: { lang: 'bash', code: importCurl, title: 'Example: import the last 50 Instagram posts' },
      },
    ],
    networks: 'analytics',
    limits: [
      `Analytics come with the paid plans. The ${FREE.posts} free posts to try do not include them.`,
      'LinkedIn analytics are not offered yet.',
      ...OPEN.filter((t) => !ANALYTICS_NETS.includes(t) && t !== 'LINKEDIN').map((t) => `${netName(t)}: no analytics.`),
    ],
    faq: [
      { q: 'Are analytics included in the free posts to try?', a: `No. Analytics are on the paid plans, from ${price('STARTER')}.` },
      { q: 'Which networks have analytics?', a: `${nameList(ANALYTICS_FULL)}: post and account metrics. ${nameList(ANALYTICS_NETS.filter((t) => !ANALYTICS_FULL.includes(t)))}: post metrics only. LinkedIn analytics are not offered yet.` },
      { q: 'Can I get the original payload?', a: 'Yes. The <code>/raw</code> endpoints return what the network sent, unmodified.' },
      { q: 'Why are X analytics different?', a: 'X bills every API read. Siar fetches X metrics only when you ask, at most 5 times per post or account a day, and charges your X credit at X\'s own USD prices.' },
    ],
    related: [['/docs/api/analytics', 'Analytics API reference'], ['/platforms', 'Each network\'s status and approvals'], ['/pricing', 'Pricing and quotas']],
    live: true,
  },
  {
    slug: 'social-media-api-for-ai-agents',
    nav: 'Social media API for AI agents',
    title: 'Social media API for AI agents: publish and confirm',
    h1: 'Social media API for AI agents: know whether the post went out',
    description: 'Let an AI agent publish with one REST call and learn from a signed webhook whether each network took the post, with the network\'s own error if not.',
    lead: 'An agent needs to know whether its post went out. Siar, a <a href="/">unified social media API</a>, gives it one REST call to publish and a signed webhook with each network\'s result. When a network says no, the agent gets that network\'s own code and message, plus a verdict: retry, don\'t retry, or unknown.',
    card: 'Your agent publishes with one REST call and learns from a signed webhook whether the post went out. When a network says no, the webhook carries that network\'s own error.',
    group: 'more',
    updated: UPDATED,
    points: [
      'Publish with one REST call; the API key goes in the <code>x-api-key</code> header.',
      'A signed <code>post.published</code> webhook with each network\'s result.',
      'The network\'s own error and a verdict an agent can branch on.',
      'Quotas, daily caps and per-network checks apply, so a runaway loop hits a documented limit.',
    ],
    sections: [
      {
        id: 'publish', h: 'Publish with one call',
        p: ['Any HTTP tool your agent has will do. The request names the networks and carries the text for each. A request that breaks a network\'s rules fails at once with a <code>400</code> naming the field, so the agent can fix it in the same turn.'],
        code: { lang: 'python', code: createPostPython(agentBody), title: 'Example: an agent schedules a post to Bluesky and Mastodon' },
      },
      {
        id: 'result', h: 'Learn the result',
        p: [
          'Subscribe an endpoint to <code>post.published</code>. It fires when the post has published or failed, with each network\'s result. Or read the post with <code>GET /post/{id}</code> and check its status.',
          `Each failed network carries a <code>retryability</code> of <code>retryable</code>, <code>non_retryable</code> or <code>unknown</code>, and a <code>userFacingMessage</code> the agent can show or act on. Deliveries are signed and ${RETRY_LINE}.`,
        ],
        code: { lang: 'json', code: agentResult, title: 'Example: the webhook when one network said no' },
      },
      {
        id: 'guard-rails', h: 'Guard rails',
        p: [
          'Quotas, daily caps and per-network validation apply to agents exactly as to any client. A loop that runs away hits a documented limit, not a network\'s spam filter.',
          'For X, your organization pays from a prepaid credit at X\'s own USD prices. The credit endpoints show the balance and quote an action before the agent runs it.',
          'Start with a draft status, or a brand connected to a test account, while you build trust in the agent.',
        ],
      },
      {
        id: 'tooling', h: 'SDK, CLI and MCP server',
        p: [`${TOOLING_LINE} Until they are published, call the REST API from your agent's HTTP tool. The <a href="/docs/quickstart">quickstart</a> shows the first request.`],
      },
    ],
    networks: 'publish',
    limits: [
      TOOLING_LINE,
      'There is no hosted MCP endpoint.',
      'No idempotency key on post creation: if an agent resends a create call, it makes a second post. Check by your own reference first.',
    ],
    faq: [
      { q: 'Can an AI agent post to social media through Siar?', a: 'Yes, through the REST API. The agent publishes with one call and reads the result from a signed webhook or from the post\'s status, including the network\'s own error if it failed. An MCP server and CLI are built, but they are not on npm yet, so there is no install command today.' },
      { q: 'Is there an MCP server?', a: `${TOOLING_LINE} There is no hosted MCP endpoint.` },
      { q: 'Can the agent post to a real account by mistake?', a: 'It can do anything its API key can do. Use a draft status, a brand connected to a test account, or review before scheduling while you build confidence.' },
      { q: 'Is there a plain-text description of Siar for LLMs?', a: 'Yes: <a href="/llms.txt">/llms.txt</a> and <a href="/pricing.md">/pricing.md</a>.' },
    ],
    related: [['/docs/quickstart', 'Quickstart'], ['/docs/webhooks', 'Webhook guide'], ['/docs/errors', 'Error envelope']],
    live: true,
  },
  {
    slug: 'link-in-bio-api',
    nav: 'Link-in-bio API',
    title: 'Link-in-bio API: build pages and count clicks',
    h1: 'Link-in-bio API: pages, links and clicks per day',
    description: 'Create a link-in-bio page per brand, add and reorder links, and read views and clicks per link per day through a REST API, at no extra cost.',
    lead: 'A link-in-bio API lets your code build the page behind the link in a social profile. Siar, a <a href="/">unified social media API</a>, gives each brand one public page at app.siaran.my/b/your-brand. You create it, add and reorder links, publish it, and read views and clicks per link per day.',
    card: 'Each brand gets a public link-in-bio page you can build and reorder through the API. Views and clicks are counted per link per day, at no extra cost.',
    group: 'more',
    updated: UPDATED,
    points: [
      'One page per brand, at a slug of 3 to 40 lowercase letters, numbers and dashes.',
      'Four item types: links, social links, headers and text.',
      'Reorder every item in one call; hide an item without deleting it.',
      'Views and clicks per day, and clicks per link, for any date range (30 days by default).',
    ],
    sections: [
      {
        id: 'create', h: 'Create, fill and publish a page',
        p: ['A new page starts unpublished. Add items, then publish it; it appears at app.siaran.my/b/acme-bakery with a "Made with Siar" line at the bottom. It follows the visitor\'s light or dark setting and uses your accent color.'],
        code: { lang: 'bash', code: bioExample, title: 'Example: create, add a link, publish' },
      },
      {
        id: 'edit', h: 'Reorder and edit',
        p: ['<code>POST /bio-item/reorder</code> takes the ids of every item on the page in the new order. <code>PATCH /bio-item/{id}</code> changes a title or URL, or sets <code>active</code> to false to hide an item and keep it for later.'],
        table: {
          head: ['Operation', 'What it does'],
          rows: [
            ['<code>GET /bio</code>, <code>POST /bio</code>', 'List pages, or create the brand\'s page'],
            ['<code>GET</code>, <code>PATCH</code>, <code>DELETE /bio/{id}</code>', 'Read, change (title, slug, description, avatar, theme, published) or delete a page'],
            ['<code>POST /bio-item</code>', 'Add a link, social link, header or text'],
            ['<code>PATCH</code>, <code>DELETE /bio-item/{id}</code>', 'Change, hide or delete an item'],
            ['<code>POST /bio-item/reorder</code>', 'Set the order of every item'],
            ['<code>GET /bio-analytics</code>', 'Views and clicks per day and clicks per link'],
          ],
        },
      },
      {
        id: 'analytics', h: 'Views and clicks per link',
        p: ['Siar counts a view each time the page opens and a click each time a link is followed. Ask for any date range; without one you get the last 30 days. The answer has total views and clicks, one row per day, and clicks per item.'],
        code: { lang: 'bash', code: bioAnalyticsExample, title: 'Example: November for one page' },
      },
      {
        id: 'linktree-api', h: 'Looking for a Linktree API?',
        p: [
          'Linktree\'s developer page is an interest form. It says Linktree is expanding API access and documents no public API for managing links (<a href="https://linktr.ee/marketplace/developer" rel="nofollow noopener">Linktree developer page</a>, checked 12 November 2026).',
          'Siar\'s link-in-bio API is in its public <a href="/openapi.json">OpenAPI file</a>: create, read, update and delete pages and items, reorder, and daily analytics. Siar\'s page is a simple page per brand, though: one layout, your accent color, and no custom domain.',
        ],
      },
    ],
    limits: [
      'One page per brand. A second page needs a second brand.',
      'The page runs on app.siaran.my/b/<slug> and carries a "Made with Siar" line.',
      'One layout, with your accent color. No custom domain.',
    ],
    faq: [
      { q: 'What is a link-in-bio API?', a: 'It lets your code create and update the page people reach from the link in a social profile, and read how many people opened it and which links they followed. Siar gives each brand one such page.' },
      { q: 'Does Linktree have a public API?', a: 'Not one for managing links. Linktree\'s developer page is an interest form (checked 12 November 2026). Siar\'s link-in-bio API is public and documented in its OpenAPI file.' },
      { q: 'Does the link-in-bio page cost extra?', a: 'No. Each brand gets one page at no extra cost.' },
      { q: 'Can I see which link people click?', a: 'Yes. <code>GET /bio-analytics</code> returns views and clicks per day and clicks per link for any date range, 30 days by default.' },
    ],
    related: [['/docs/api/bio', 'Bio pages API reference'], ['/docs/api/bio-analytics', 'Bio analytics API reference'], ['/use-cases/multi-tenant-social-media-api', 'Social media API for SaaS']],
    live: true,
  },
];

export const USE_CASES: UseCase[] = ALL.filter((u) => u.live);
export const useCase = (slug: string) => USE_CASES.find((u) => u.slug === slug)!;

/* ───────────────────────── hub data ───────────────────────── */

export const GROUPS: { id: UseCaseGroup; h: string; intro: string }[] = [
  { id: 'publish', h: 'Publish and schedule posts', intro: 'Write it once. Each network gets its own text and media, checked against that network\'s rules before Siar accepts the post.' },
  { id: 'product', h: 'Put social posting inside your product', intro: 'Your customers connect their own accounts. You never handle their passwords, and your bill does not grow with every account they add.' },
  { id: 'reply', h: 'Reply to comments', intro: 'Most of the conversation happens under the post. Answer it as the connected account, from your code or the dashboard.' },
  { id: 'measure', h: 'Know what happened, and how it did', intro: 'Find out whether a post went out without polling, and see how it did in one shape across networks.' },
  { id: 'more', h: 'Agents and link in bio', intro: '' },
];

/** Prices and plan facts the hub prints, in house form. */
export const HUB = {
  price,
  brandsWord,
  trialDays: TRIAL_DAYS,
  tiers: TIERS,
};
