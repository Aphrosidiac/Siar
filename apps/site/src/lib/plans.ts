/** Re-export of the API's enforced constants. Never copy a number into the site. */
export { PLANS, TIER_ORDER, dailyPostCaps, dailyCommentCaps, COMMENT_LENGTH, RESOURCE_LIMITS, X_PRICES, priceOf, formatPrice, currencyFor } from '../../../api/src/domain/plans.ts';
export type { Tier, PlanDef, Currency, Interval } from '../../../api/src/domain/plans.ts';
import { PLANS, TIER_ORDER, X_PRICES, priceOf, formatPrice } from '../../../api/src/domain/plans.ts';
import type { Tier, Currency, Interval } from '../../../api/src/domain/plans.ts';

export const TIERS: Tier[] = TIER_ORDER;
export const PAID_TIERS: Tier[] = TIER_ORDER.filter((t) => (PLANS[t].prices?.myr.monthly ?? 0) > 0);

/** Daily caps are per network, not per plan: Starter shares Pro's, so the tables carry three columns. */
export const CAP_COLUMNS: { tier: Tier; label: string }[] = [
  { tier: 'FREE', label: PLANS.FREE.name },
  { tier: 'PRO', label: `${PLANS.STARTER.name} and ${PLANS.PRO.name}` },
  { tier: 'BUSINESS', label: PLANS.BUSINESS.name },
];

/** The 14-day trial is Pro only (`PLANS.PRO.trial`); the length lives in billing, not in the plan table. */
export const TRIAL_DAYS = 14;
export const TRIAL_TIER: Tier = (TIER_ORDER.find((t) => PLANS[t].trial) ?? 'PRO') as Tier;

export const CURRENCY_LABEL: Record<Currency, string> = { myr: 'Malaysia, in ringgit', usd: 'Elsewhere, in US dollars' };

export const fmtInt = (n: number) => n.toLocaleString('en-US');
export const fmtQuota = (n: number | null | undefined) => (n === null || n === undefined ? 'Unlimited' : n === 0 ? 'Not included' : fmtInt(n));
export const fmtMicro = (m: number) => `$${(m / 1_000_000).toFixed(3)}`;

/** "RM39" / "$19" / "RM3,990", or "Custom" for Enterprise. */
export const money = (tier: Tier, interval: Interval, currency: Currency) => {
  const v = priceOf(tier, interval, currency);
  return v === null ? 'Custom' : formatPrice(v, currency);
};
export const isFree = (tier: Tier) => PLANS[tier].prices !== null && PLANS[tier].prices!.myr.monthly === 0;
export const isCustom = (tier: Tier) => PLANS[tier].prices === null;
/** Months of a year that yearly billing does not charge (yearly is 10x monthly, so 2). */
export const monthsFree = (tier: Tier) => {
  const p = PLANS[tier].prices;
  return p && p.myr.monthly ? 12 - p.myr.yearly / p.myr.monthly : 0;
};
/** Minor units of the lowest paid monthly price. */
export const paidFromMinor = (currency: Currency) => Math.min(...PAID_TIERS.map((t) => priceOf(t, 'MONTHLY', currency)!));
/** "RM39" or "$19": the lowest paid monthly price. */
export const paidFrom = (currency: Currency) => formatPrice(paidFromMinor(currency), currency);
/** "$19 / $49 / $149": monthly prices of the paid plans that have a public price. */
export const paidList = (currency: Currency) => PAID_TIERS.map((t) => money(t, 'MONTHLY', currency)).join(' / ');
/** "RM39, RM99 and RM399" style list for prose. */
export const paidProse = (currency: Currency, interval: Interval = 'MONTHLY') => {
  const l = PAID_TIERS.map((t) => money(t, interval, currency));
  return `${l.slice(0, -1).join(', ')} and ${l[l.length - 1]}`;
};

/** Brands (teams) in words: "1 brand", "10 brands", "Unlimited brands". */
export const brandsLabel = (n: number | null) => (n === null ? 'Unlimited brands' : n === 1 ? '1 brand' : `${n} brands`);

export const PRICE_LOCK = 'Your price never goes up while you stay subscribed.';
export const INBOX_NOTE = 'Facebook and Instagram, opening after Meta approval';
export const X_CREDIT_NOTE = 'Organizations billed in Malaysia buy credit in ringgit; the rate is shown before you pay.';

export const X_PRICE_LABELS: Record<keyof typeof X_PRICES, { label: string; unit: string }> = {
  TWITTER_CONTENT_CREATE: { label: 'Publish a post or reply', unit: 'per request' },
  TWITTER_CONTENT_CREATE_WITH_URL: { label: 'Publish a post that contains a link', unit: 'per request' },
  TWITTER_POST_READ: { label: 'Read a post (analytics, comment import)', unit: 'per post returned' },
  TWITTER_USER_READ: { label: 'Look up another account', unit: 'per account returned' },
  TWITTER_CONTENT_MANAGE: { label: 'Edit or manage existing content', unit: 'per request' },
  TWITTER_INTERACTION_DELETE: { label: 'Delete a post or reply', unit: 'per request' },
  TWITTER_USER_INTERACTION_CREATE: { label: 'Repost, like or follow', unit: 'per request' },
};
