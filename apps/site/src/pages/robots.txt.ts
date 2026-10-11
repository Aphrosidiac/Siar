import { SITE_URL } from '../config';
export const GET = () =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap-index.xml\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
