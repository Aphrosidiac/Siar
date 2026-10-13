import { SITE_URL } from '../config';
import { PLANS, TIERS, CAP_COLUMNS, TRIAL_DAYS, PRICE_LOCK, INBOX_NOTE, X_CREDIT_NOTE, dailyPostCaps, dailyCommentCaps, COMMENT_LENGTH, RESOURCE_LIMITS, X_PRICES, X_PRICE_LABELS, fmtQuota, fmtInt, fmtMicro, money, isFree, monthsFree, brandsLabel } from '../lib/plans';
import { NETWORKS } from '../lib/networks';

export const GET = () => {
  const L: string[] = [];
  const table = (head: string[], rows: string[][], left: number[] = [0]) => { L.push(`| ${head.join(' | ')} |`, `| ${head.map((_, i) => (left.includes(i) ? '---' : '---:')).join(' | ')} |`); rows.forEach((r) => L.push(`| ${r.join(' | ')} |`)); L.push(''); };
  const price = (t: (typeof TIERS)[number], i: 'MONTHLY' | 'YEARLY', c: 'myr' | 'usd') => (isFree(t) ? 'Free' : money(t, i, c));
  const period = (t: (typeof TIERS)[number]) => (PLANS[t].oneTime ? 'one-time' : 'a month');
  const heads = ['', ...TIERS.map((t) => `${PLANS[t].name} (${period(t)})`)];
  L.push('# Siar pricing', '', `Source: ${SITE_URL}/pricing. Priced per organization, by the brands you run, never per channel or connected account. Every plan connects unlimited social accounts. Organizations billed in Malaysia pay in ringgit (MYR); everywhere else pays in US dollars (USD).`, '');
  L.push('## Plans', '');
  table(['Plan', 'Monthly, Malaysia (MYR)', 'Monthly, elsewhere (USD)', 'Yearly, Malaysia (MYR)', 'Yearly, elsewhere (USD)', 'Brands (teams)', 'For'], TIERS.map((t) => [PLANS[t].name, price(t, 'MONTHLY', 'myr'), price(t, 'MONTHLY', 'usd'), price(t, 'YEARLY', 'myr'), price(t, 'YEARLY', 'usd'), fmtQuota(PLANS[t].teams), PLANS[t].tagline]), [0, 6]);
  L.push(`- Yearly is ${monthsFree('PRO')} months free (10 times the monthly price).`, `- ${PRICE_LOCK}`, `- ${TRIAL_DAYS}-day free trial on ${PLANS.PRO.name}.`, `- The Free plan is a one-time allowance of ${PLANS.FREE.posts} posts to try: no card, no time limit, it never resets.`, '- Malaysia pays by card or, for a year at a time, once with FPX or GrabPay. Elsewhere pays by card.', '- A post that goes to every network you have connected counts as one post.', '');
  L.push('## Quotas', '', `Free is a one-time allowance. Paid plans count per UTC calendar month.`, '');
  table(heads, [
    ['Posts', ...TIERS.map((t) => fmtQuota(PLANS[t].posts))],
    ['Comments', ...TIERS.map((t) => fmtQuota(PLANS[t].comments))],
    ['Uploads', ...TIERS.map((t) => fmtQuota(PLANS[t].uploads))],
    ['Brands (teams)', ...TIERS.map((t) => fmtQuota(PLANS[t].teams))],
    ['Connected social accounts', ...TIERS.map(() => 'Unlimited')],
    [`All ${NETWORKS.length} networks, API, SDK, CLI, MCP, webhooks`, ...TIERS.map(() => 'Included')],
    ['Analytics', ...TIERS.map((t) => (PLANS[t].analytics ? 'Yes' : 'No'))],
    ['History import posts per account', ...TIERS.map((t) => fmtQuota(PLANS[t].importPostsPerAccount))],
    ['Comments stored per imported post', ...TIERS.map((t) => fmtQuota(PLANS[t].commentImportPerPost))],
    ['Reviews per account', ...TIERS.map((t) => fmtQuota(PLANS[t].reviewImportPerAccount))],
    ['Direct messages per account', ...TIERS.map((t) => fmtQuota(PLANS[t].dmsPerAccount))],
    ['Automation runs per account', ...TIERS.map((t) => fmtQuota(PLANS[t].automationRunsPerAccount))],
  ]);
  L.push(`Direct messages and comment-to-DM automations: ${INBOX_NOTE}.`, '', 'A scheduled post counts when it is created. Drafts are free until they leave DRAFT. Retries of a failed post do not count again.', '');
  const pc = CAP_COLUMNS.map((c) => dailyPostCaps(c.tier));
  const cc = CAP_COLUMNS.map((c) => dailyCommentCaps(c.tier));
  L.push('## Daily caps per connected account (UTC day)', '');
  table(['Network', ...CAP_COLUMNS.map((c) => `${c.label} posts`), ...CAP_COLUMNS.map((c) => `${c.label} comments`)], NETWORKS.map((n) => [n.name, ...pc.map((c) => fmtInt(c[n.type])), ...cc.map((c) => fmtInt(c[n.type]))]));
  L.push('Enterprise uses the Business caps unless agreed otherwise.', '', '## Comment length', '');
  table(['Network', 'Max characters'], NETWORKS.filter((n) => COMMENT_LENGTH[n.type] !== undefined).map((n) => [n.name, fmtInt(COMMENT_LENGTH[n.type]!)]));
  L.push('## Resource limits (every plan)', '', `- API keys per organization: ${RESOURCE_LIMITS.apiKeys}`, `- Webhooks per organization: ${RESOURCE_LIMITS.webhooks}`, `- Bot identities per team: ${RESOURCE_LIMITS.botsPerTeam}`, `- Retries of a failed post: ${RESOURCE_LIMITS.maxRetries}`, `- Media retention after last use: ${RESOURCE_LIMITS.mediaRetentionDays} days`, '');
  L.push('## X (Twitter) pass-through prices', '', 'X bills per API call; Siar passes the charge through at cost, at X\'s own prices in USD, from a prepaid credit balance. Anything not listed is free.', X_CREDIT_NOTE, '');
  table(['Action', 'Billed', 'USD'], (Object.keys(X_PRICES) as (keyof typeof X_PRICES)[]).map((k) => [X_PRICE_LABELS[k].label, X_PRICE_LABELS[k].unit, fmtMicro(X_PRICES[k])]));
  return new Response(L.join('\n'), { headers: { 'content-type': 'text/markdown; charset=utf-8' } });
};
