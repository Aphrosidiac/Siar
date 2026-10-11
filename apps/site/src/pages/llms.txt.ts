import { SITE_URL, API_BASE, DESCRIPTION, LEGAL_ENTITY, CONTACT_EMAIL } from '../config';
import { NETWORKS } from '../lib/networks';
import { PLANS, TIERS, fmtQuota, fmtCents } from '../lib/plans';
import { USE_CASES } from '../lib/usecases';
import { tagsInOrder, tagMeta, opsForTag, operations } from '../lib/openapi';
import { WEBHOOK_EVENTS } from '../lib/events';

export const GET = () => {
  const L: string[] = [];
  L.push('# Siar', '', `> ${DESCRIPTION}`, '');
  L.push(`Siar is operated by ${LEGAL_ENTITY}. Contact: ${CONTACT_EMAIL}. API base URL: ${API_BASE}. Authentication: organization API key in the x-api-key header. ${operations().length} operations are described in an OpenAPI document.`, '');
  L.push('## Docs', '');
  for (const [p, t, d] of [
    ['/docs/quickstart', 'Quickstart', 'Get a key, create a team, connect an account and publish.'],
    ['/docs/authentication', 'Authentication', 'API keys and what they can do.'],
    ['/docs/data-model', 'Data model', 'Organization, team, social account, upload, post, comment.'],
    ['/docs/connecting-accounts', 'Connecting accounts', 'OAuth endpoint and hosted connect links.'],
    ['/docs/posting', 'Posting and statuses', 'Per-network payloads, scheduling, retries, statuses.'],
    ['/docs/media-uploads', 'Media uploads', 'Simple, URL, large and multipart uploads.'],
    ['/docs/webhooks', 'Webhooks', `${WEBHOOK_EVENTS.length} signed event types and signature verification.`],
    ['/docs/rate-limits', 'Rate limits', '100/s, 500/10s, 2000/min per key and endpoint.'],
    ['/docs/errors', 'Errors', 'Error envelope and status codes.'],
    ['/docs/pagination', 'Pagination', 'offset/limit with items and total.'],
    ['/docs/sdk-cli-mcp', 'SDK, CLI and MCP', 'TypeScript SDK, JSON-first CLI, MCP server.'],
    ['/docs/api', 'API reference', 'Every operation with parameters, body fields and curl examples.'],
    ['/openapi.json', 'OpenAPI document', 'Machine-readable contract.'],
  ]) L.push(`- [${t}](${SITE_URL}${p}): ${d}`);
  L.push('', '## API reference by area', '');
  for (const t of tagsInOrder()) L.push(`- [${tagMeta(t).title}](${SITE_URL}/docs/api/${tagMeta(t).slug}): ${opsForTag(t).length} operations. ${tagMeta(t).text}`);
  L.push('', '## Platforms', '');
  for (const n of NETWORKS) L.push(`- [${n.name} API](${SITE_URL}/${n.apiSlug}): ${n.postTypes.join(', ').toLowerCase().replace(/_/g, ' ')}. Errors: ${SITE_URL}/${n.apiSlug}/errors`);
  L.push('', '## Use cases', '');
  for (const u of USE_CASES) L.push(`- [${u.title}](${SITE_URL}/use-cases/${u.slug}): ${u.description}`);
  L.push('', '## Pricing', '', `Per organization, not per connected account. Full tables: ${SITE_URL}/pricing.md`, '');
  for (const t of TIERS) {
    const p = PLANS[t];
    L.push(`- ${p.name}: ${p.priceMonthlyCents === null ? 'custom price' : `${fmtCents(p.priceMonthlyCents)}/month (${fmtCents(p.priceYearlyMonthlyCents)}/month billed yearly)`}; ${fmtQuota(p.posts)} posts, ${fmtQuota(p.comments)} comments, ${fmtQuota(p.uploads)} uploads per month; ${p.teams === null ? 'unlimited' : p.teams} teams.`);
  }
  L.push('', '## Optional', '', `- [Features](${SITE_URL}/features)`, `- [Platforms](${SITE_URL}/platforms)`, `- [Changelog](${SITE_URL}/changelog)`, `- [About](${SITE_URL}/about)`, `- [Terms](${SITE_URL}/terms)`, `- [Privacy](${SITE_URL}/privacy)`, `- [Data deletion](${SITE_URL}/data-deletion)`, '');
  return new Response(L.join('\n'), { headers: { 'content-type': 'text/plain; charset=utf-8' } });
};
