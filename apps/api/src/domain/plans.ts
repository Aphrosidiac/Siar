import type { NetworkType } from '@siar/networks';

/**
 * Plans, quotas and caps: the single source the API enforces, the billing page renders and the
 * site's pricing pages / pricing.md / llms.txt are generated from. Prices are set in ringgit for
 * Malaysia and in USD for everywhere else (docs/pricing.md); yearly is 10x monthly.
 * Free is a one-time allowance, not a monthly one (quota.ts counts it in the `free` period).
 */
export type Tier = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type Interval = 'MONTHLY' | 'YEARLY';
export type Currency = 'myr' | 'usd';

/** One period's price in minor units (sen / cents). `yearly` is the whole year. */
export interface Price { monthly: number; yearly: number }

export interface PlanDef {
  tier: Tier;
  name: string;
  tagline: string;
  /** null = priced per contract (Enterprise). */
  prices: Record<Currency, Price> | null;
  /** Free: the whole one-time allowance. Paid plans: per month. */
  posts: number;
  comments: number;
  uploads: number;
  /** Brands (teams). null = unlimited */
  teams: number | null;
  analytics: boolean;
  /** Free only: the allowances above never reset. */
  oneTime: boolean;
  /** Only this plan offers a free trial (an organization's first paid plan, by card). */
  trial: boolean;
  importPostsPerAccount: number;
  commentImportPerPost: number;
  reviewImportPerAccount: number;
  dmsPerAccount: number;
  automationRunsPerAccount: number;
}

const price = (monthly: number): Price => ({ monthly, yearly: monthly * 10 });

export const PLANS: Record<Tier, PlanDef> = {
  FREE: { tier: 'FREE', name: 'Free', tagline: 'Try every network', prices: { myr: price(0), usd: price(0) }, posts: 20, comments: 50, uploads: 60, teams: 1, analytics: false, oneTime: true, trial: false, importPostsPerAccount: 5, commentImportPerPost: 25, reviewImportPerAccount: 5, dmsPerAccount: 0, automationRunsPerAccount: 0 },
  STARTER: { tier: 'STARTER', name: 'Starter', tagline: 'For one business', prices: { myr: price(3_900), usd: price(1_900) }, posts: 300, comments: 1_000, uploads: 3_000, teams: 1, analytics: true, oneTime: false, trial: false, importPostsPerAccount: 50, commentImportPerPost: 100, reviewImportPerAccount: 50, dmsPerAccount: 500, automationRunsPerAccount: 200 },
  PRO: { tier: 'PRO', name: 'Pro', tagline: 'For freelancers and agencies', prices: { myr: price(9_900), usd: price(4_900) }, posts: 10_000, comments: 5_000, uploads: 100_000, teams: 10, analytics: true, oneTime: false, trial: true, importPostsPerAccount: 100, commentImportPerPost: 200, reviewImportPerAccount: 200, dmsPerAccount: 1_000, automationRunsPerAccount: 1_000 },
  BUSINESS: { tier: 'BUSINESS', name: 'Business', tagline: 'For apps built on Siar', prices: { myr: price(39_900), usd: price(14_900) }, posts: 100_000, comments: 50_000, uploads: 1_000_000, teams: null, analytics: true, oneTime: false, trial: false, importPostsPerAccount: 500, commentImportPerPost: 1_000, reviewImportPerAccount: 1_000, dmsPerAccount: 5_000, automationRunsPerAccount: 5_000 },
  ENTERPRISE: { tier: 'ENTERPRISE', name: 'Enterprise', tagline: 'For large organizations', prices: null, posts: 1_000_000, comments: 500_000, uploads: 10_000_000, teams: null, analytics: true, oneTime: false, trial: false, importPostsPerAccount: 5_000, commentImportPerPost: 5_000, reviewImportPerAccount: 1_000, dmsPerAccount: 10_000, automationRunsPerAccount: 10_000 },
};

/**
 * How a yearly plan can be paid once, as customers read it. Only methods that work today: add DuitNow
 * here (and on the site) when CHIP opens it for the brand.
 */
export const ONCE_METHODS = 'FPX or GrabPay';

/** A yearly plan paid once (renewal LINK) stays active this many days after its end date while unpaid. */
export const LINK_GRACE_DAYS = 3;
/** Reminders before a link-renewed plan's end date, in days. */
export const LINK_REMIND_DAYS = [7, 1];

export const TIER_ORDER: Tier[] = ['FREE', 'STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'];

/** Ringgit for organizations billed in Malaysia, USD for everyone else. */
export const currencyFor = (country: string | null | undefined): Currency => (!country || country.toUpperCase() === 'MY' ? 'myr' : 'usd');

/** One period of a plan in minor units, or null when it is priced per contract. */
export function priceOf(tier: Tier, interval: Interval, currency: Currency): number | null {
  const p = PLANS[tier].prices;
  return p ? (interval === 'YEARLY' ? p[currency].yearly : p[currency].monthly) : null;
}

/** "RM39", "$19", "RM3,990": whole units (every list price is a whole number). */
export function formatPrice(minor: number, currency: Currency) {
  const v = (minor / 100).toLocaleString('en-US', { maximumFractionDigits: minor % 100 ? 2 : 0, minimumFractionDigits: minor % 100 ? 2 : 0 });
  return currency === 'myr' ? `RM${v}` : `$${v}`;
}

type Caps = Record<NetworkType, number>;
const caps = (free: number, pro: number, business: number): [number, number, number] => [free, pro, business];
const POST_CAPS: Record<NetworkType, [number, number, number]> = {
  TIKTOK: caps(5, 10, 15), YOUTUBE: caps(10, 10, 15), INSTAGRAM: caps(10, 50, 100), FACEBOOK: caps(10, 50, 100), TWITTER: caps(5, 15, 15),
  THREADS: caps(10, 200, 250), LINKEDIN: caps(10, 18, 24), PINTEREST: caps(10, 24, 36), REDDIT: caps(10, 24, 36), MASTODON: caps(10, 50, 100),
  DISCORD: caps(10, 100, 200), SLACK: caps(10, 100, 200), BLUESKY: caps(10, 50, 100), GOOGLE_BUSINESS: caps(10, 20, 40), SNAPCHAT: caps(5, 20, 40),
};
const COMMENT_CAPS: Record<NetworkType, [number, number, number]> = {
  TIKTOK: caps(3, 10, 15), YOUTUBE: caps(3, 10, 15), INSTAGRAM: caps(3, 50, 100), FACEBOOK: caps(3, 50, 100), TWITTER: caps(3, 15, 15),
  THREADS: caps(3, 200, 250), LINKEDIN: caps(3, 18, 24), PINTEREST: caps(3, 24, 36), REDDIT: caps(3, 24, 36), MASTODON: caps(3, 50, 100),
  DISCORD: caps(3, 100, 200), SLACK: caps(3, 100, 200), BLUESKY: caps(3, 50, 100), GOOGLE_BUSINESS: caps(3, 20, 40), SNAPCHAT: caps(3, 24, 36),
};
/** Starter shares Pro's daily caps: they protect the accounts with the networks, not Siar's margin. */
const idx = (t: Tier) => (t === 'FREE' ? 0 : t === 'STARTER' || t === 'PRO' ? 1 : 2);
const pick = (table: Record<NetworkType, [number, number, number]>, t: Tier) =>
  Object.fromEntries(Object.entries(table).map(([k, v]) => [k, v[idx(t)]])) as Caps;

export const dailyPostCaps = (t: Tier) => pick(POST_CAPS, t);
export const dailyCommentCaps = (t: Tier) => pick(COMMENT_CAPS, t);

/** Comment/firstComment length caps (networks absent here do not take comments through Siar). */
export const COMMENT_LENGTH: Partial<Record<NetworkType, number>> = {
  TIKTOK: 1200, YOUTUBE: 10_000, INSTAGRAM: 2200, FACEBOOK: 8000, TWITTER: 25_000, THREADS: 500, LINKEDIN: 1250,
  REDDIT: 10_000, MASTODON: 500, DISCORD: 2000, SLACK: 30_000, BLUESKY: 300,
};

export const RESOURCE_LIMITS = { apiKeys: 50, webhooks: 5, botsPerTeam: 50, maxRetries: 6, mediaRetentionDays: 14, softDeletedMediaDays: 2, historyImportPerCall: 100, reviewImportPerCall: 250 } as const;

/** X pass-through, micro-USD. Writes per request; reads per resource returned. */
export const X_PRICES = {
  TWITTER_CONTENT_CREATE: 15_000,
  TWITTER_CONTENT_CREATE_WITH_URL: 200_000,
  TWITTER_POST_READ: 5_000,
  TWITTER_USER_READ: 10_000,
  TWITTER_CONTENT_MANAGE: 5_000,
  TWITTER_INTERACTION_DELETE: 10_000,
  TWITTER_USER_INTERACTION_CREATE: 15_000,
} as const;
export type XAction = keyof typeof X_PRICES;

/** Effective limits for an organization: plan defaults, then per-org overrides (Enterprise). */
export function limitsFor(org: { tier: Tier; monthlyPostLimit?: number | null; monthlyCommentLimit?: number | null; monthlyUploadLimit?: number | null; dailyPostLimit?: unknown; dailyCommentLimit?: unknown; monthlyImportLimitPerAccount?: number | null; commentImportLimitPerPost?: number | null; monthlyReviewImportLimitPerAccount?: number | null; monthlyMessageLimitPerAccount?: number | null; monthlyAutomationExecutionLimitPerAccount?: number | null }) {
  const p = PLANS[org.tier];
  const capsTier: Tier = org.tier === 'ENTERPRISE' ? 'BUSINESS' : org.tier;
  return {
    plan: p,
    posts: org.monthlyPostLimit ?? p.posts,
    comments: org.monthlyCommentLimit ?? p.comments,
    uploads: org.monthlyUploadLimit ?? p.uploads,
    teams: p.teams,
    analytics: p.analytics,
    dailyPosts: { ...dailyPostCaps(capsTier), ...((org.dailyPostLimit as Partial<Caps>) ?? {}) } as Caps,
    dailyComments: { ...dailyCommentCaps(capsTier), ...((org.dailyCommentLimit as Partial<Caps>) ?? {}) } as Caps,
    importPostsPerAccount: org.monthlyImportLimitPerAccount ?? p.importPostsPerAccount,
    commentImportPerPost: org.commentImportLimitPerPost ?? p.commentImportPerPost,
    reviewImportPerAccount: org.monthlyReviewImportLimitPerAccount ?? p.reviewImportPerAccount,
    dmsPerAccount: org.monthlyMessageLimitPerAccount ?? p.dmsPerAccount,
    automationRunsPerAccount: org.monthlyAutomationExecutionLimitPerAccount ?? p.automationRunsPerAccount,
  };
}

export const period = (d = new Date()) => d.toISOString().slice(0, 7);
/** The counter period for a plan: Free's allowance is one-time, paid plans reset every month (UTC). */
export const quotaPeriod = (tier: Tier, d = new Date()) => (PLANS[tier].oneTime ? 'free' : period(d));
export const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);
