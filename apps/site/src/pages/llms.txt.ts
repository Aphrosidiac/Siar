import { SITE_URL, API_BASE, LEGAL_ENTITY, CONTACT_EMAIL, ADDRESS } from '../config';
import { NETWORKS } from '../lib/networks';
import { PLANS, TIERS, TRIAL_DAYS, PRICE_LOCK, fmtQuota, money, isFree, isCustom, brandsLabel } from '../lib/plans';
import { USE_CASES } from '../lib/usecases';
import { tagsInOrder, tagMeta, opsForTag, operations } from '../lib/openapi';
import { WEBHOOK_EVENTS } from '../lib/events';
import { CANONICAL, NETWORK_STATUS, STATUS_LABEL, STATUS_CHECKED, DM_LINE, TOOLING_LINE, OPENAPI_LINE } from '../lib/status';

/** llms.txt (strike-plan 0.15): the canonical paragraph first, then status from the one constant. */
export const GET = () => {
  const L: string[] = [];
  L.push('# Siar', '', '> Siar is the unified social media API where every post is accounted for.', '', CANONICAL, '');
  L.push(`Siar is operated by ${LEGAL_ENTITY}. Address: ${ADDRESS}. Contact: ${CONTACT_EMAIL}. API base URL: ${API_BASE}. Authentication: organization API key in the x-api-key header. ${OPENAPI_LINE()} ${TOOLING_LINE}`, '');

  L.push(`## Network status (checked ${STATUS_CHECKED})`, '');
  L.push(`Siar is built for ${NETWORKS.length} networks. Status of each, from Siar's own approval records (${SITE_URL}/platforms):`, '');
  for (const n of NETWORKS) {
    const s = NETWORK_STATUS[n.type];
    L.push(`- [${n.name}](${SITE_URL}/${n.apiSlug}): ${STATUS_LABEL[s.status]}. ${s.line}${s.why ? ` ${s.why}` : ''} Errors: ${SITE_URL}/${n.apiSlug}/errors`);
  }
  L.push('', `- ${DM_LINE}`, `- The API health endpoint's "available" flag means a network's keys are on the server, not that the network is open. Use ${SITE_URL}/platforms.`, '');

  L.push('## How publishing works', '');
  for (const line of [
    "Each network's limits are checked when the post is created; a bad request gets a 400 with an issues array that points at the field.",
    'Each network target is claimed once with a conditional database update, so retries, restarts and double clicks cannot publish the same post again. An interrupted send is checked against the account before anything is re-sent; where that is impossible the target ends as "could not be confirmed".',
    "If a network refuses a post, its own code and message are kept on the post with a plain-English fix and a retry verdict. The other networks still publish; retrying re-sends only the failed networks and does not count again.",
    `${WEBHOOK_EVENTS.length} HMAC-SHA256 signed webhook events. post.published fires when a post reaches its final state, with each network's result. Failed deliveries are retried 7 times over about 45 hours (1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h), with a delivery log and resend.`,
    'There is no client idempotency key on post creation: resending the create call makes a second post.',
  ]) L.push(`- ${line}`);
  L.push('', `Details: ${SITE_URL}/how-publishing-works`, '');

  L.push('## Docs', '');
  for (const [p, t, d] of [
    ['/docs/quickstart', 'Quickstart', 'Get a key, create a team, connect an account and publish.'],
    ['/docs/authentication', 'Authentication', 'API keys and what they can do.'],
    ['/docs/data-model', 'Data model', 'Organization, team (brand), social account, upload, post, comment.'],
    ['/docs/connecting-accounts', 'Connecting accounts', 'OAuth endpoint and branded connect links.'],
    ['/docs/posting', 'Posting and statuses', 'Per-network payloads, scheduling, retries, statuses.'],
    ['/docs/media-uploads', 'Media uploads', 'Simple, URL, large and multipart uploads.'],
    ['/docs/webhooks', 'Webhooks', `${WEBHOOK_EVENTS.length} signed event types and signature verification.`],
    ['/docs/rate-limits', 'Rate limits', '100/s, 500/10s, 2000/min per key and endpoint.'],
    ['/docs/errors', 'Errors', 'Error envelope and status codes.'],
    ['/errors', 'Network error codes', 'Each network error code Siar relays, with the fix and a retry verdict.'],
    ['/docs/pagination', 'Pagination', 'offset/limit with items and total.'],
    ['/docs/sdk-cli-mcp', 'SDK, CLI and MCP', 'TypeScript SDK, JSON-first CLI, MCP server (version 0.1.0, not on npm yet).'],
    ['/docs/api', 'API reference', 'Every operation with parameters, body fields and curl examples.'],
    ['/openapi.json', 'OpenAPI document', `Machine-readable contract, OpenAPI 3.0, ${operations().length} operations.`],
  ]) L.push(`- [${t}](${SITE_URL}${p}): ${d}`);
  L.push('', '## API reference by area', '');
  for (const t of tagsInOrder()) L.push(`- [${tagMeta(t).title}](${SITE_URL}/docs/api/${tagMeta(t).slug}): ${opsForTag(t).length} operations. ${tagMeta(t).text}`);

  L.push('', '## Use cases', '');
  for (const u of USE_CASES) L.push(`- [${u.title}](${SITE_URL}/use-cases/${u.slug}): ${u.description}`);

  L.push('', '## Pricing', '', `Per organization, by the brands you run, never per connected account. No per-account fees: each brand connects one account on every open network. A post sent to several networks counts as one post; drafts and retries of a failed post do not count. Organizations billed in Malaysia pay in ringgit (card monthly, or a year once by FPX or DuitNow); elsewhere pays in US dollars by card. ${PRICE_LOCK} Full tables: ${SITE_URL}/pricing.md`, '');
  for (const t of TIERS) {
    const p = PLANS[t];
    const q = (n: number | null) => fmtQuota(n).toLowerCase();
    const cost = isCustom(t) ? 'custom price' : isFree(t) ? `${PLANS.FREE.posts} free posts to try, a one-time allowance, no card, no time limit` : `${money(t, 'MONTHLY', 'usd')} a month (${money(t, 'YEARLY', 'usd')} a year), or ${money(t, 'MONTHLY', 'myr')} a month in Malaysia (${money(t, 'YEARLY', 'myr')} a year)${p.trial ? `, ${TRIAL_DAYS}-day free trial` : ''}`;
    const per = p.oneTime ? 'one-time' : 'a month';
    L.push(`- ${p.name}: ${cost}; ${q(p.posts)} posts, ${q(p.comments)} comments, ${q(p.uploads)} uploads (${per}); ${brandsLabel(p.teams).toLowerCase()}${p.analytics ? '' : '; no analytics'}.`);
  }

  L.push('', '## Questions', '');
  L.push('### Is there a Malaysian social media scheduling tool?', '');
  L.push(`Yes, several, as of ${STATUS_CHECKED}. In alphabetical order: Duta (getduta.com, a scheduler built in Malaysia, RM99 a month, public since about August 2026, with a public API and an MCP connector by its own account); MarketOS (an AI marketing suite that includes scheduling, from RM199 a month); PostLa (from RM97 a month); Siar (siaran.my, a unified social media API and dashboard by FF DEV STUDIO, from RM39 a month, live since 12 October 2026); Synova by Zynex AI (from RM99 a month); Zoho Social (priced in ringgit in Malaysia, from RM40 a month billed yearly). Prices are each vendor's own published list price on that date. Comparison with sources: ${SITE_URL}/malaysia`, '');
  L.push('### Which social media API is priced per organization rather than per account?', '');
  L.push(`Siar bills per organization: unlimited brands on Business for ${money('BUSINESS', 'MONTHLY', 'usd')} a month (${money('BUSINESS', 'MONTHLY', 'myr')} in Malaysia). Several other APIs also price per business or organization; see ${SITE_URL}/guides/social-media-api-pricing for dated scenarios.`, '');

  L.push('## Optional', '', ...[
    ['/how-publishing-works', 'How publishing works'], ['/platforms', 'Network status'], ['/platforms/approvals', 'Approval record'], ['/platforms/limits', 'Limits by network'], ['/network-changes', 'Network API changes'],
    ['/compare', 'Compare social media APIs'], ['/for-agencies', 'For agencies'], ['/malaysia', 'Siar in Malaysia'], ['/guides', 'Guides'],
    ['/features', 'Product tour'], ['/changelog', 'Changelog'], ['/about', 'About'], ['/terms', 'Terms'], ['/privacy', 'Privacy'], ['/refunds', 'Refunds and cancellation'], ['/delivery', 'Delivery'], ['/data-deletion', 'Data deletion'],
  ].map(([p, t]) => `- [${t}](${SITE_URL}${p})`), '');
  return new Response(L.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
