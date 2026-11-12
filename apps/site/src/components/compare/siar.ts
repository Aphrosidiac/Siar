/**
 * Siar's side of every compare table. Numbers come only from lib/plans.ts and lib/status.ts, so a price or a
 * network status changes on every compare page at the next build.
 */
import { PLANS, money, brandsLabel, fmtInt, PRICE_LOCK, TRIAL_DAYS, RESOURCE_LIMITS } from '../../lib/plans';
import { OPEN_LIST, NETWORK_STATUS, TOOLING_LINE, STATUS_CHECKED } from '../../lib/status';
import type { CellKey } from '../../data/rivals';

const usd = (t: 'STARTER' | 'PRO' | 'BUSINESS') => money(t, 'MONTHLY', 'usd');
const myr = (t: 'STARTER' | 'PRO' | 'BUSINESS') => money(t, 'MONTHLY', 'myr');
const brands = (t: 'STARTER' | 'PRO' | 'BUSINESS') => brandsLabel(PLANS[t].teams).replace(/^Unlimited/, 'unlimited');
const posts = (t: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS') => fmtInt(PLANS[t].posts);

/** Plain facts for prose. */
export const S = {
  starterUsd: usd('STARTER'), starterMyr: myr('STARTER'),
  proUsd: usd('PRO'), proMyr: myr('PRO'),
  businessUsd: usd('BUSINESS'), businessMyr: myr('BUSINESS'),
  starterYearMyr: money('STARTER', 'YEARLY', 'myr'),
  proYearUsd: money('PRO', 'YEARLY', 'usd'),
  starterBrands: brands('STARTER'), proBrands: brands('PRO'), businessBrands: brands('BUSINESS'),
  starterPosts: posts('STARTER'), proPosts: posts('PRO'), businessPosts: posts('BUSINESS'),
  freePosts: PLANS.FREE.posts,
  trialDays: TRIAL_DAYS,
  webhookCap: RESOURCE_LIMITS.webhooks,
  priceLock: PRICE_LOCK,
  tooling: TOOLING_LINE,
  openList: OPEN_LIST,
  youtube: NETWORK_STATUS.YOUTUBE.line,
  tiktok: NETWORK_STATUS.TIKTOK.line,
  pinterest: NETWORK_STATUS.PINTEREST.line,
  linkedin: NETWORK_STATUS.LINKEDIN.line,
  statusChecked: STATUS_CHECKED,
  /** "20 free posts to try" with its condition, the only allowed wording of the free start. */
  freeStart: `${PLANS.FREE.posts} free posts to try, no card`,
  unitLine: 'No per-account fees. Each brand connects one account on every open network.',
};

/** HTML for Siar's column. `market` picks the scenario currency. */
export function siarCells(market: 'global' | 'my' = 'global'): Record<CellKey, string> {
  const g = market === 'global';
  return {
    unit: `Per organization, not per account. ${S.unitLine} Starter ${S.starterBrands}, Pro ${S.proBrands}, Business ${S.businessBrands}.`,
    entry: g
      ? `Starter ${S.starterUsd} a month (${S.starterMyr} in Malaysia): ${S.starterBrands}, ${S.starterPosts} posts a month. ${S.freeStart}.`
      : `Starter ${S.starterMyr} a month: ${S.starterBrands}, ${S.starterPosts} posts a month. ${S.freeStart}.`,
    scenario: g
      ? `Pro ${S.proUsd} a month (${S.proMyr} in Malaysia): ${S.proBrands}, ${S.proPosts} posts a month.`
      : `Pro ${S.proMyr} a month: ${S.proBrands}, ${S.proPosts} posts a month.`,
    networks: `Open today: ${S.openList}. ${S.youtube} <a href="/platforms">Network status today</a>.`,
    webhooks: `Signed, retried for about 45 hours; up to ${S.webhookCap} endpoints per organization.`,
    connect: 'Yes, on every plan: a branded connect link. Your customers sign in to each network themselves.',
    mcp: 'MCP server (version 0.1.0), not on npm yet.',
  };
}
