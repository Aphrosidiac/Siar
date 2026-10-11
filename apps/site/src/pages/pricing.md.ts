import { SITE_URL } from '../config';
import { PLANS, TIERS, CAP_TIERS, dailyPostCaps, dailyCommentCaps, COMMENT_LENGTH, RESOURCE_LIMITS, X_PRICES, X_PRICE_LABELS, fmtQuota, fmtCents, fmtInt, fmtMicro } from '../lib/plans';
import { NETWORKS } from '../lib/networks';

export const GET = () => {
  const L: string[] = [];
  const table = (head: string[], rows: string[][]) => { L.push(`| ${head.join(' | ')} |`, `| ${head.map((_, i) => (i ? '---:' : '---')).join(' | ')} |`); rows.forEach((r) => L.push(`| ${r.join(' | ')} |`)); L.push(''); };
  L.push('# Siar pricing', '', `Source: ${SITE_URL}/pricing. Priced per organization, not per connected account. Prices in USD. Quotas count what an organization creates in a UTC calendar month.`, '');
  L.push('## Plans', '');
  table(['Plan', 'Monthly', 'Yearly (per month)', 'For'], TIERS.map((t) => [PLANS[t].name, fmtCents(PLANS[t].priceMonthlyCents), fmtCents(PLANS[t].priceYearlyMonthlyCents), PLANS[t].tagline]));
  L.push('## Monthly quotas', '');
  table(['', ...TIERS.map((t) => PLANS[t].name)], [
    ['Posts', ...TIERS.map((t) => fmtQuota(PLANS[t].posts))],
    ['Comments', ...TIERS.map((t) => fmtQuota(PLANS[t].comments))],
    ['Uploads', ...TIERS.map((t) => fmtQuota(PLANS[t].uploads))],
    ['Teams (unlimited teams means unlimited connected accounts)', ...TIERS.map((t) => fmtQuota(PLANS[t].teams))],
    ['Analytics', ...TIERS.map((t) => (PLANS[t].analytics ? 'Yes' : 'No'))],
    ['History import posts per account', ...TIERS.map((t) => fmtQuota(PLANS[t].importPostsPerAccount))],
    ['Comments stored per imported post', ...TIERS.map((t) => fmtQuota(PLANS[t].commentImportPerPost))],
    ['Reviews per account', ...TIERS.map((t) => fmtQuota(PLANS[t].reviewImportPerAccount))],
    ['Direct messages per account', ...TIERS.map((t) => fmtQuota(PLANS[t].dmsPerAccount))],
    ['Automation runs per account', ...TIERS.map((t) => fmtQuota(PLANS[t].automationRunsPerAccount))],
  ]);
  L.push('A scheduled post counts in the month it is created. Drafts are free until they leave DRAFT. Retries of a failed post do not count again.', '');
  const pc = CAP_TIERS.map((t) => dailyPostCaps(t));
  const cc = CAP_TIERS.map((t) => dailyCommentCaps(t));
  L.push('## Daily caps per connected account (UTC day)', '');
  table(['Network', ...CAP_TIERS.map((t) => `${PLANS[t].name} posts`), ...CAP_TIERS.map((t) => `${PLANS[t].name} comments`)], NETWORKS.map((n) => [n.name, ...pc.map((c) => fmtInt(c[n.type])), ...cc.map((c) => fmtInt(c[n.type]))]));
  L.push('Enterprise uses the Business caps unless agreed otherwise.', '', '## Comment length', '');
  table(['Network', 'Max characters'], NETWORKS.filter((n) => COMMENT_LENGTH[n.type] !== undefined).map((n) => [n.name, fmtInt(COMMENT_LENGTH[n.type]!)]));
  L.push('## Resource limits (every plan)', '', `- API keys per organization: ${RESOURCE_LIMITS.apiKeys}`, `- Webhooks per organization: ${RESOURCE_LIMITS.webhooks}`, `- Bot identities per team: ${RESOURCE_LIMITS.botsPerTeam}`, `- Retries of a failed post: ${RESOURCE_LIMITS.maxRetries}`, `- Media retention after last use: ${RESOURCE_LIMITS.mediaRetentionDays} days`, '');
  L.push('## X (Twitter) pass-through prices', '', 'X bills per API call; Siar passes the charge through at cost from a prepaid credit balance. Anything not listed is free.', '');
  table(['Action', 'Billed', 'USD'], (Object.keys(X_PRICES) as (keyof typeof X_PRICES)[]).map((k) => [X_PRICE_LABELS[k].label, X_PRICE_LABELS[k].unit, fmtMicro(X_PRICES[k])]));
  return new Response(L.join('\n'), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
