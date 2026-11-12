/** The guides, in the order /guides lists them. Titles here are the H1s. */
export interface Guide {
  slug: string;
  title: string;
  summary: string;
  group: 'Pricing and reliability' | 'Recipes';
}

export const GUIDES: Guide[] = [
  {
    slug: 'social-media-api-pricing',
    title: 'Social media API pricing: per profile, per account, per delivery or per organization',
    summary: 'The four ways social media APIs bill, priced at 500, 50, 10 and 1 brands from each vendor’s own price list, and where each one is cheaper.',
    group: 'Pricing and reliability',
  },
  {
    slug: 'idempotent-social-media-posting',
    title: 'How to stop duplicate posts when retrying a social media API',
    summary: 'Client idempotency keys, unique reference keys and server-side claims: what each one protects, and what Siar does and does not do.',
    group: 'Pricing and reliability',
  },
  {
    slug: 'post-to-multiple-social-networks-api',
    title: 'Post to multiple social networks with one API request',
    summary: 'One request with per-network text and settings, then a result per network: posted, failed with the network’s own error, or still processing.',
    group: 'Recipes',
  },
  {
    slug: 'post-to-bluesky-mastodon-threads-api',
    title: 'Post to Bluesky, Mastodon and Threads from one API request',
    summary: 'The three text-first networks in one call: their limits, the fields each one takes, and what comes back.',
    group: 'Recipes',
  },
  {
    slug: 'post-release-notes-from-ci',
    title: 'Post release notes to Slack, Discord, LinkedIn and X from CI',
    summary: 'A GitHub Actions and a GitLab CI step with plain curl and jq, which fails the job when a network refuses the post.',
    group: 'Recipes',
  },
  {
    slug: 'n8n-threads-posting',
    title: 'Post to Threads from n8n with the HTTP Request node',
    summary: 'A workflow you can import: create the post, wait, read the result and branch on the network’s verdict.',
    group: 'Recipes',
  },
];

export const guideHref = (slug: string) => `/guides/${slug}`;
export const guide = (slug: string) => GUIDES.find((g) => g.slug === slug)!;
