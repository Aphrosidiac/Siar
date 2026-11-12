/** RSS 2.0 feed of /network-changes, newest first, full entry HTML in each item. */
import { SITE_URL } from '../config';
import { META } from '../lib/networks';
import { CHANGES, entryHtml } from '../data/network-changes';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString();

export const GET = () => {
  const now = new Date();
  const items = CHANGES.map((c) => {
    const link = `${SITE_URL}/network-changes#${c.id}`;
    return `    <item>
      <title>${esc(c.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(c.published)}</pubDate>
      <category>${esc(META[c.network].name)}</category>
      <description>${esc(entryHtml(c, now))}</description>
    </item>`;
  }).join('\n');
  const latest = CHANGES.map((c) => c.checked).sort().at(-1)!;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Siar: social media API changes</title>
    <link>${SITE_URL}/network-changes</link>
    <atom:link href="${SITE_URL}/network-changes.xml" rel="self" type="application/rss+xml" />
    <description>Network API changes that break posting apps, newest first. Each one sourced to the network's own page.</description>
    <language>en</language>
    <lastBuildDate>${rfc822(latest)}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
