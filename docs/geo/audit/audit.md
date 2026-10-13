# GEO / AEO / SEO audit — https://siaran.my

Run 2026-10-13 13:40 · 60 pages sampled of 87 in sitemaps · raw HTML only (no JavaScript)

Scores are a triage aid for ordering work, not a KPI. The KPI is measured citation/mention rate (ai_visibility.py).

| Area | Score |
|---|---|
| AI crawler access | 100 |
| Rendering (raw HTML) | 100 |
| Indexability & canonicals | 92 |
| Structured data & entity | 90 |
| Content extractability (AEO) | 99 |
| Trust & E-E-A-T signals | 96 |
| Delivery & performance | 100 |
| Agent operability | 100 |
| International | 100 |
| **Overall** | **79** |

Overall is capped at 49 while any critical finding exists and at 79 while any high finding exists.

## AI crawler access (robots.txt, path `/`)

| Crawler | Purpose | Named in robots.txt | Allowed | Deciding rule |
|---|---|---|---|---|
| Googlebot | search | no | ✅ | `Allow: /` |
| Google-Extended | control | no | ✅ | `Allow: /` |
| Bingbot | search | no | ✅ | `Allow: /` |
| OAI-SearchBot | search | no | ✅ | `Allow: /` |
| ChatGPT-User | user | no | ✅ | `Allow: /` |
| GPTBot | training | no | ✅ | `Allow: /` |
| Claude-SearchBot | search | no | ✅ | `Allow: /` |
| Claude-User | user | no | ✅ | `Allow: /` |
| ClaudeBot | training | no | ✅ | `Allow: /` |
| PerplexityBot | search | no | ✅ | `Allow: /` |
| Perplexity-User | user | no | ✅ | `Allow: /` |
| Applebot | search | no | ✅ | `Allow: /` |
| Applebot-Extended | control | no | ✅ | `Allow: /` |
| meta-webindexer | search | no | ✅ | `Allow: /` |

robots.txt is only the first gate: a CDN/WAF can still 403 these bots. Run `bot_access.py`.

## Findings

### HIGH

- **[Structured data & entity]** 8 FAQ question(s) in markup are not visible on the page — markup must match visible content (spam policy) — 14 page(s): https://siaran.my/bluesky-api/errors, https://siaran.my/linkedin-api/errors, https://siaran.my/snapchat-api/errors …
- **[Structured data & entity]** price 100.00 is in JSON-LD but not visible on the page — live-fetching AI tools read only visible text, and hidden-only markup breaks Google policy — 1 page(s): https://siaran.my/
- **[Delivery & performance]** HTML is 2044 KiB; Googlebot reads only the first 2 MB of HTML (since 2026) — content past that is not indexed — 1 page(s): https://siaran.my/docs/api/automation
  - Fix: Move inline data/scripts out, paginate, or trim hydration payloads

### MEDIUM

- **[Content extractability (AEO)]** 1 run(s) of text split into single-character elements — text extractors read 'S M O O T H' — 2 page(s): https://siaran.my/platforms, https://siaran.my/docs/api/automation
  - Fix: Keep real words in the server HTML; split letters at runtime in JS (after load) for the animation
- **[Indexability & canonicals]** Sitemap has no <lastmod>; Bing and Google use accurate lastmod to schedule recrawls (freshness matters for AI answers) — 1 page(s): https://siaran.my/sitemap-index.xml

### LOW

- **[Structured data & entity]** Organization could add: sameAs, description, contactPoint, legalName — 59 page(s): https://siaran.my/, https://siaran.my/docs/api/user, https://siaran.my/use-cases/social-media-scheduling-api …
- **[Trust & E-E-A-T signals]** Email address hidden from crawlers by Cloudflare Email Obfuscation — live AI fetchers can't read the contact email — 59 page(s): https://siaran.my/, https://siaran.my/docs/api/user, https://siaran.my/use-cases/social-media-scheduling-api …
  - Fix: Turn off Email Obfuscation (Scrape Shield) or also show the address as plain text on the Contact/About page
- **[Structured data & entity]** TechArticle could add: image — 10 page(s): https://siaran.my/docs/api/user, https://siaran.my/docs/api/api-key, https://siaran.my/docs/api/app …
- **[Structured data & entity]** author Person has no url/sameAs: link it to an author page so the byline resolves to an entity — 10 page(s): https://siaran.my/docs/api/user, https://siaran.my/docs/api/api-key, https://siaran.my/docs/api/app …
- **[Trust & E-E-A-T signals]** Dates only in schema; show them on the page too — 10 page(s): https://siaran.my/docs/api/user, https://siaran.my/docs/api/api-key, https://siaran.my/docs/api/app …
- **[Content extractability (AEO)]** No question-phrased headings; answer engines match sub-queries to headings — 8 page(s): https://siaran.my/, https://siaran.my/docs/api/user, https://siaran.my/platforms …
  - Fix: Phrase key H2/H3s as the questions buyers ask
- **[Content extractability (AEO)]** Heading levels skip (e.g. h2 -> h4); extraction uses the outline — 8 page(s): https://siaran.my/docs/api/user, https://siaran.my/platforms, https://siaran.my/pricing …
- **[Structured data & entity]** No BreadcrumbList — 7 page(s): https://siaran.my/about, https://siaran.my/changelog, https://siaran.my/contact …
- **[Structured data & entity]** SoftwareApplication could add: aggregateRating, review — 2 page(s): https://siaran.my/, https://siaran.my/pricing
- **[Trust & E-E-A-T signals]** No HSTS header — 1 page(s): https://siaran.my
  - Fix: Strict-Transport-Security: max-age=31536000; includeSubDomains
- **[Structured data & entity]** Homepage has no WebSite entity (site name for Google) — 1 page(s): https://siaran.my
- **[Content extractability (AEO)]** Title is only 10 chars: 'About Siar' — 1 page(s): https://siaran.my/about
- **[Content extractability (AEO)]** Title is only 14 chars: 'Contact | Siar' — 1 page(s): https://siaran.my/contact
- **[Content extractability (AEO)]** Title is only 14 chars: 'Pricing | Siar' — 1 page(s): https://siaran.my/pricing

## Pages

| URL | Type | Status | Words | H2/H3 | Schema | Q-heads | Author | Dates | Issues |
|---|---|---|---|---|---|---|---|---|---|
| https://siaran.my/ | home | 200 | 1431 | 18 | FAQPage, Organization, SoftwareApplication | 0 |  | ✓ | 5 |
| https://siaran.my/docs/api/user | article | 200 | 931 | 11 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 7 |
| https://siaran.my/use-cases/social-media-scheduling-api | page | 200 | 493 | 7 | BreadcrumbList, FAQPage, Organization | 0 |  |  | 2 |
| https://siaran.my/bluesky-api/errors | page | 200 | 551 | 12 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/discord-api | page | 200 | 627 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/facebook-api | page | 200 | 812 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/google-business-profile-api | page | 200 | 1032 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/instagram-api | page | 200 | 826 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/linkedin-api/errors | page | 200 | 546 | 12 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/mastodon-api | page | 200 | 664 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/pinterest-api | page | 200 | 675 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/reddit-api | page | 200 | 705 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/slack-api | page | 200 | 665 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/snapchat-api/errors | page | 200 | 484 | 11 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/threads-api/errors | page | 200 | 463 | 10 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/tiktok-api/errors | page | 200 | 660 | 17 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/x-api | page | 200 | 911 | 14 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/youtube-api/errors | page | 200 | 582 | 13 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/about | about | 200 | 249 | 3 | Organization | 2 |  |  | 4 |
| https://siaran.my/changelog | page | 200 | 190 | 1 | Organization | 0 |  |  | 3 |
| https://siaran.my/contact | contact | 200 | 152 | 0 | Organization | 0 |  |  | 4 |
| https://siaran.my/data-deletion | page | 200 | 466 | 6 | Organization | 1 |  | ✓ | 3 |
| https://siaran.my/features | service | 200 | 657 | 15 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/platforms | page | 200 | 648 | 17 | BreadcrumbList, Organization | 0 |  |  | 5 |
| https://siaran.my/pricing | service | 200 | 1346 | 17 | BreadcrumbList, FAQPage, Organization, SoftwareApplication | 1 |  |  | 5 |
| https://siaran.my/privacy | utility | 200 | 737 | 10 | Organization | 5 |  | ✓ | 3 |
| https://siaran.my/terms | utility | 200 | 877 | 11 | Organization | 0 |  | ✓ | 3 |
| https://siaran.my/openapi.json |  | 200 |  |  |  |  |  |  | 0 |
| https://siaran.my/docs/api/api-key | article | 200 | 305 | 4 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 6 |
| https://siaran.my/use-cases/social-media-webhooks | page | 200 | 416 | 7 | BreadcrumbList, FAQPage, Organization | 0 |  |  | 2 |
| https://siaran.my/bluesky-api | page | 200 | 650 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/discord-api/errors | page | 200 | 456 | 11 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/facebook-api/errors | page | 200 | 611 | 14 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/google-business-profile-api/errors | page | 200 | 615 | 12 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/instagram-api/errors | page | 200 | 545 | 12 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/linkedin-api | page | 200 | 732 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/mastodon-api/errors | page | 200 | 191 | 2 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/pinterest-api/errors | page | 200 | 541 | 12 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/reddit-api/errors | page | 200 | 513 | 12 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/slack-api/errors | page | 200 | 455 | 12 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/snapchat-api | page | 200 | 610 | 12 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/threads-api | page | 200 | 651 | 12 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/tiktok-api | page | 200 | 803 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/x-api/errors | page | 200 | 651 | 15 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 3 |
| https://siaran.my/youtube-api | page | 200 | 819 | 13 | BreadcrumbList, FAQPage, Organization | 2 |  |  | 2 |
| https://siaran.my/docs/api/app | article | 200 | 343 | 1 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 6 |
| https://siaran.my/use-cases/multi-tenant-social-media-api | page | 200 | 432 | 7 | BreadcrumbList, FAQPage, Organization | 0 |  |  | 2 |
| https://siaran.my/docs/quickstart | article | 200 | 692 | 7 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 6 |
| https://siaran.my/use-cases/social-media-posting-api | page | 200 | 511 | 7 | BreadcrumbList, FAQPage, Organization | 0 |  |  | 3 |
| https://siaran.my/docs/api/automation | article | 200 | 39341 | 17 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 9 |
| https://siaran.my/use-cases/hosted-connect-oauth | page | 200 | 466 | 7 | BreadcrumbList, FAQPage, Organization | 0 |  |  | 2 |
| https://siaran.my/docs/api/team | article | 200 | 1670 | 5 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 7 |
| https://siaran.my/use-cases/social-media-api-for-ai-agents | page | 200 | 427 | 7 | BreadcrumbList, FAQPage, Organization | 0 |  |  | 2 |
| https://siaran.my/docs/sdk-cli-mcp | article | 200 | 444 | 3 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 5 |
| https://siaran.my/use-cases/social-media-comments-api | page | 200 | 380 | 7 | BreadcrumbList, FAQPage, Organization | 0 |  |  | 2 |
| https://siaran.my/docs/data-model | article | 200 | 337 | 7 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 5 |
| https://siaran.my/use-cases | page | 200 | 304 | 1 | Organization | 0 |  |  | 3 |
| https://siaran.my/docs/api/notification | article | 200 | 202 | 3 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 6 |
| https://siaran.my/use-cases/social-media-analytics-api | page | 200 | 401 | 7 | BreadcrumbList, FAQPage, Organization | 1 |  |  | 2 |
| https://siaran.my/docs/posting | article | 200 | 889 | 6 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 6 |

## Site facts

- home_final: `"https://siaran.my"`
- http_redirect: `{"status_chain": [301], "final": "https://siaran.my/"}`
- alt_host: `{"host": "www.siaran.my", "status": 200, "final": "https://siaran.my/", "error": ""}`
- soft404_status: `404`
- markdown_negotiation: `false`
- llms.txt: `{"status": 200, "content_type": "text/plain", "bytes": 9949, "h1": true, "links": 68}`
- llms-full.txt: `{"status": 404, "content_type": "text/html", "bytes": 16390}`
- sitemap_url_count: `87`

## Not measured here

- JavaScript-rendered content → `node scripts/render_diff.mjs <url>`
- CDN/WAF blocking of AI bots → `python3 scripts/bot_access.py <url>`
- Core Web Vitals field data → PageSpeed Insights / CrUX (references/seo-foundations.md)
- What AI engines actually say about the brand → `python3 scripts/ai_visibility.py`
- Off-site authority (mentions, reviews, Wikipedia/Wikidata, Reddit, YouTube) → references/offsite-authority.md
