import { tagsInOrder, tagMeta, opsForTag } from './openapi';

export interface NavGroup { title: string; items: { href: string; label: string }[] }

export const GUIDE_NAV: NavGroup[] = [
  { title: 'Get started', items: [
    { href: '/docs', label: 'Overview' },
    { href: '/docs/quickstart', label: 'Quickstart' },
    { href: '/docs/authentication', label: 'Authentication' },
    { href: '/docs/data-model', label: 'Data model' },
  ] },
  { title: 'Guides', items: [
    { href: '/docs/connecting-accounts', label: 'Connecting accounts' },
    { href: '/docs/posting', label: 'Posting and statuses' },
    { href: '/docs/media-uploads', label: 'Media uploads' },
    { href: '/docs/webhooks', label: 'Webhooks' },
  ] },
  { title: 'Reference', items: [
    { href: '/docs/rate-limits', label: 'Rate limits' },
    { href: '/docs/errors', label: 'Errors' },
    { href: '/docs/pagination', label: 'Pagination' },
    { href: '/docs/sdk-cli-mcp', label: 'SDK, CLI and MCP' },
    { href: '/docs/api', label: 'API reference' },
  ] },
];

export const API_NAV: NavGroup[] = [
  { title: 'API reference', items: [{ href: '/docs/api', label: 'Overview' }, ...tagsInOrder().map((t) => ({ href: `/docs/api/${tagMeta(t).slug}`, label: `${tagMeta(t).title} (${opsForTag(t).length})` }))] },
];

export const flatGuide = () => GUIDE_NAV.flatMap((g) => g.items);
