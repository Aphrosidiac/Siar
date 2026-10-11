import type { NetworkType } from '@siar/networks';

/**
 * Plans, quotas and caps — the single source the API enforces, the billing page renders and the
 * site's pricing.md / llms.txt are generated from. Defaults mirror the reference rate card
 * (docs/reference/2026-10-11/pricing.md). Fakhrul sets final prices before launch (PLAN D4).
 */
export type Tier = 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
export type Interval = 'MONTHLY' | 'YEARLY';

export interface PlanDef {
  tier: Tier;
  name: string;
  tagline: string;
  /** USD cents per month; yearly = per-month rate when billed yearly. null = custom. */
  priceMonthlyCents: number | null;
  priceYearlyMonthlyCents: number | null;
  posts: number;
  comments: number;
  uploads: number;
  /** null = unlimited */
  teams: number | null;
  analytics: boolean;
  importPostsPerAccount: number;
  commentImportPerPost: number;
  reviewImportPerAccount: number;
  dmsPerAccount: number;
  automationRunsPerAccount: number;
}

export const PLANS: Record<Tier, PlanDef> = {
  FREE: { tier: 'FREE', name: 'Free', tagline: 'For trying out', priceMonthlyCents: 0, priceYearlyMonthlyCents: 0, posts: 20, comments: 50, uploads: 200, teams: 3, analytics: false, importPostsPerAccount: 5, commentImportPerPost: 25, reviewImportPerAccount: 5, dmsPerAccount: 0, automationRunsPerAccount: 0 },
  PRO: { tier: 'PRO', name: 'Pro', tagline: 'For power users', priceMonthlyCents: 10_000, priceYearlyMonthlyCents: 9_000, posts: 10_000, comments: 5_000, uploads: 100_000, teams: null, analytics: true, importPostsPerAccount: 100, commentImportPerPost: 200, reviewImportPerAccount: 200, dmsPerAccount: 200, automationRunsPerAccount: 200 },
  BUSINESS: { tier: 'BUSINESS', name: 'Business', tagline: 'For growing businesses', priceMonthlyCents: 40_000, priceYearlyMonthlyCents: 36_000, posts: 100_000, comments: 50_000, uploads: 1_000_000, teams: null, analytics: true, importPostsPerAccount: 500, commentImportPerPost: 1_000, reviewImportPerAccount: 200, dmsPerAccount: 1_000, automationRunsPerAccount: 1_000 },
  ENTERPRISE: { tier: 'ENTERPRISE', name: 'Enterprise', tagline: 'For large organizations', priceMonthlyCents: null, priceYearlyMonthlyCents: null, posts: 1_000_000, comments: 500_000, uploads: 10_000_000, teams: null, analytics: true, importPostsPerAccount: 5_000, commentImportPerPost: 5_000, reviewImportPerAccount: 1_000, dmsPerAccount: 10_000, automationRunsPerAccount: 10_000 },
};

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
const idx = (t: Tier) => (t === 'FREE' ? 0 : t === 'PRO' ? 1 : 2);
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
export const utcDay = (d = new Date()) => d.toISOString().slice(0, 10);
