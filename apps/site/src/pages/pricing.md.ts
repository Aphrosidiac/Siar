import { SITE_URL, LEGAL_NAME, LEGAL_REG } from '../config';
import { PLANS, TIERS, CAP_COLUMNS, TRIAL_DAYS, PRICE_LOCK, X_CREDIT_NOTE, dailyPostCaps, dailyCommentCaps, COMMENT_LENGTH, RESOURCE_LIMITS, X_PRICES, X_PRICE_LABELS, fmtQuota, fmtInt, fmtMicro, money, isFree, monthsFree, paidFrom } from '../lib/plans';
import { NETWORKS } from '../lib/networks';
import { CANONICAL, STATUS_SUMMARY, DM_LINE, STATUS_CHECKED } from '../lib/status';

/** Free's tagline reads "Try Siar" (strike plan 0.13) until PLANS.FREE.tagline changes in the API's plans.ts. */
const tagline = (t: (typeof TIERS)[number]) => (t === 'FREE' ? 'Try Siar' : PLANS[t].tagline);

export const GET = () => {
  const L: string[] = [];
  const table = (head: string[], rows: string[][], left: number[] = [0]) => { L.push(`| ${head.join(' | ')} |`, `| ${head.map((_, i) => (left.includes(i) ? '---' : '---:')).join(' | ')} |`); rows.forEach((r) => L.push(`| ${r.join(' | ')} |`)); L.push(''); };
  const price = (t: (typeof TIERS)[number], i: 'MONTHLY' | 'YEARLY', c: 'myr' | 'usd') => (isFree(t) ? 'Free' : money(t, i, c));
  const period = (t: (typeof TIERS)[number]) => (PLANS[t].oneTime ? 'one-time' : 'a month');
  const heads = ['', ...TIERS.map((t) => `${PLANS[t].name} (${period(t)})`)];
  const { STARTER: S, PRO: P, BUSINESS: B, FREE: F } = PLANS;
  L.push('# Siar pricing', '', CANONICAL, '');
  L.push(
    `Siar, a unified social media API and dashboard, is priced per organization: by the brands you run and the posts you create. No per-account fees. ${S.name} has ${S.teams} brand and ${fmtInt(S.posts)} posts a month, ${P.name} ${P.teams} brands and ${fmtInt(P.posts)} posts, ${B.name} unlimited brands and ${fmtInt(B.posts)} posts. Each brand connects one account on every open network. Start with ${F.posts} free posts to try, then pay from ${paidFrom('usd')} a month (${paidFrom('myr')} in Malaysia).`,
    '',
    `Source: ${SITE_URL}/pricing. Organizations billed in Malaysia pay in ringgit (MYR); everywhere else pays in US dollars (USD). Paid to ${LEGAL_NAME} (SSM ${LEGAL_REG}), a Malaysian company, with a numbered receipt for every payment. Prices are final.`,
    '',
  );
  L.push('## Plans', '');
  table(['Plan', 'Monthly, Malaysia (MYR)', 'Monthly, elsewhere (USD)', 'Yearly, Malaysia (MYR)', 'Yearly, elsewhere (USD)', 'Brands (teams)', 'For'], TIERS.map((t) => [PLANS[t].name, price(t, 'MONTHLY', 'myr'), price(t, 'MONTHLY', 'usd'), price(t, 'YEARLY', 'myr'), price(t, 'YEARLY', 'usd'), fmtQuota(PLANS[t].teams), tagline(t)]), [0, 6]);
  L.push(
    `- Yearly is ${monthsFree('PRO')} months free (10 times the monthly price).`,
    `- ${PRICE_LOCK}`,
    `- ${TRIAL_DAYS}-day free trial on ${P.name}, once per organization, by card.`,
    `- The free start is ${F.posts} free posts to try, one-time: no card, no time limit, it never resets.`,
    '- Malaysia pays by card monthly, or for a year at a time by card or once with FPX or DuitNow. Elsewhere pays by card.',
    '- A post that goes to each network you have connected counts as one post. Drafts and retries do not count.',
    '- No per-account fees. Each brand connects one account on every open network; a second account on the same network goes in a second brand.',
    '- Email support on every plan.',
    '',
  );
  L.push('## Which networks every plan reaches today', '', `Every plan, Free included, publishes to the same networks. ${STATUS_SUMMARY} Checked ${STATUS_CHECKED}; the status of each network, with dates: ${SITE_URL}/platforms`, '');
  L.push('## Quotas', '', 'The free start is one-time. Paid plans count per UTC calendar month.', '');
  table(heads, [
    ['Posts', ...TIERS.map((t) => fmtQuota(PLANS[t].posts))],
    ['Comments', ...TIERS.map((t) => fmtQuota(PLANS[t].comments))],
    ['Uploads', ...TIERS.map((t) => fmtQuota(PLANS[t].uploads))],
    ['Brands (teams)', ...TIERS.map((t) => fmtQuota(PLANS[t].teams))],
    ['Accounts per brand', ...TIERS.map(() => 'One per open network')],
    ['Per-account fees', ...TIERS.map(() => 'None')],
    ['REST API and signed webhooks', ...TIERS.map(() => 'Included')],
    ['Analytics', ...TIERS.map((t) => (PLANS[t].analytics ? 'Yes' : 'No'))],
    ['History import posts per account', ...TIERS.map((t) => fmtQuota(PLANS[t].importPostsPerAccount))],
    ['Comments stored per imported post', ...TIERS.map((t) => fmtQuota(PLANS[t].commentImportPerPost))],
    ['Reviews per account', ...TIERS.map((t) => fmtQuota(PLANS[t].reviewImportPerAccount))],
    ['Direct messages per account', ...TIERS.map((t) => fmtQuota(PLANS[t].dmsPerAccount))],
    ['Automation runs per account', ...TIERS.map((t) => fmtQuota(PLANS[t].automationRunsPerAccount))],
  ]);
  L.push(DM_LINE, '', 'A scheduled post counts when it is created. Drafts are free until they leave DRAFT. Retries of a failed post do not count again. At the limit, a new post gets a 403 that names the limit; posts already scheduled still go out.', '');
  const pc = CAP_COLUMNS.map((c) => dailyPostCaps(c.tier));
  const cc = CAP_COLUMNS.map((c) => dailyCommentCaps(c.tier));
  L.push('## Daily caps per connected account (UTC day)', '');
  table(['Network', ...CAP_COLUMNS.map((c) => `${c.label} posts`), ...CAP_COLUMNS.map((c) => `${c.label} comments`)], NETWORKS.map((n) => [n.name, ...pc.map((c) => fmtInt(c[n.type])), ...cc.map((c) => fmtInt(c[n.type]))]));
  L.push('Enterprise uses the Business caps unless agreed otherwise.', '', '## Comment length', '');
  table(['Network', 'Max characters'], NETWORKS.filter((n) => COMMENT_LENGTH[n.type] !== undefined).map((n) => [n.name, fmtInt(COMMENT_LENGTH[n.type]!)]));
  L.push('## Resource limits (every plan)', '', `- API keys per organization: ${RESOURCE_LIMITS.apiKeys}`, `- Webhooks per organization: ${RESOURCE_LIMITS.webhooks}`, `- Bot identities per team: ${RESOURCE_LIMITS.botsPerTeam}`, `- Retries of a failed post: ${RESOURCE_LIMITS.maxRetries}`, `- Media retention after last use: ${RESOURCE_LIMITS.mediaRetentionDays} days`, '');
  L.push('## X (Twitter) prices', '', "X bills per API call, so X actions are paid from a prepaid credit balance at X's own prices in USD. A failed publish is never charged. Anything not listed is free.", X_CREDIT_NOTE, '');
  table(['Action', 'Billed', 'USD'], (Object.keys(X_PRICES) as (keyof typeof X_PRICES)[]).map((k) => [X_PRICE_LABELS[k].label, X_PRICE_LABELS[k].unit, fmtMicro(X_PRICES[k])]));
  return new Response(L.join('\n'), { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
};
