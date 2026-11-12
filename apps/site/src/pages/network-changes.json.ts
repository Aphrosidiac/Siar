/** JSON Feed 1.1 of /network-changes, newest first. */
import { SITE_URL } from '../config';
import { META } from '../lib/networks';
import { CHANGES, tensed, plain, entryHtml } from '../data/network-changes';

export const GET = () => {
  const now = new Date();
  const feed = {
    version: 'https://jsonfeed.org/version/1.1',
    title: 'Siar: social media API changes',
    home_page_url: `${SITE_URL}/network-changes`,
    feed_url: `${SITE_URL}/network-changes.json`,
    description: "Network API changes that break posting apps, newest first. Each one sourced to the network's own page.",
    language: 'en',
    items: CHANGES.map((c) => ({
      id: `${SITE_URL}/network-changes#${c.id}`,
      url: `${SITE_URL}/network-changes#${c.id}`,
      external_url: c.sources[0]?.url,
      title: c.title,
      summary: plain(tensed(c, c.summary, now)),
      content_html: entryHtml(c, now),
      date_published: `${c.published}T00:00:00Z`,
      date_modified: `${c.checked}T00:00:00Z`,
      tags: [META[c.network].name],
      _siar: { network: c.network, effective: c.effective, sources: c.sources },
    })),
  };
  return new Response(JSON.stringify(feed, null, 2), { headers: { 'Content-Type': 'application/feed+json; charset=utf-8' } });
};
