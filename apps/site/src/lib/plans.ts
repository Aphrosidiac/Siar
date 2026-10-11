/** Re-export of the API's enforced constants. Never copy a number into the site. */
export { PLANS, dailyPostCaps, dailyCommentCaps, COMMENT_LENGTH, RESOURCE_LIMITS, X_PRICES } from '../../../api/src/domain/plans.ts';
export type { Tier, PlanDef } from '../../../api/src/domain/plans.ts';
import { PLANS, X_PRICES } from '../../../api/src/domain/plans.ts';
import type { Tier } from '../../../api/src/domain/plans.ts';

export const TIERS: Tier[] = ['FREE', 'PRO', 'BUSINESS', 'ENTERPRISE'];
export const CAP_TIERS: Tier[] = ['FREE', 'PRO', 'BUSINESS'];

export const fmtInt = (n: number) => n.toLocaleString('en-US');
export const fmtQuota = (n: number | null | undefined) => (n === null || n === undefined ? 'Unlimited' : n === 0 ? 'Not included' : fmtInt(n));
export const fmtCents = (c: number | null) => (c === null ? 'Custom' : `$${fmtInt(Math.round(c / 100))}`);
export const fmtMicro = (m: number) => `$${(m / 1_000_000).toFixed(3)}`;

export const X_PRICE_LABELS: Record<keyof typeof X_PRICES, { label: string; unit: string }> = {
  TWITTER_CONTENT_CREATE: { label: 'Publish a post or reply', unit: 'per request' },
  TWITTER_CONTENT_CREATE_WITH_URL: { label: 'Publish a post that contains a link', unit: 'per request' },
  TWITTER_POST_READ: { label: 'Read a post (analytics, comment import)', unit: 'per post returned' },
  TWITTER_USER_READ: { label: 'Look up another account', unit: 'per account returned' },
  TWITTER_CONTENT_MANAGE: { label: 'Edit or manage existing content', unit: 'per request' },
  TWITTER_INTERACTION_DELETE: { label: 'Delete a post or reply', unit: 'per request' },
  TWITTER_USER_INTERACTION_CREATE: { label: 'Repost, like or follow', unit: 'per request' },
};

export const paidFrom = () => {
  const paid = TIERS.map((t) => PLANS[t]).filter((p) => (p.priceMonthlyCents ?? 0) > 0);
  return paid.length ? Math.min(...paid.map((p) => p.priceYearlyMonthlyCents ?? p.priceMonthlyCents ?? 0)) : 0;
};
