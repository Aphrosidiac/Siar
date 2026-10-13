# GEO / AEO / SEO audit — https://siaran.my

Run 2026-10-13 13:59 · 40 pages sampled of 87 in sitemaps · raw HTML only (no JavaScript)

Scores are a triage aid for ordering work, not a KPI. The KPI is measured citation/mention rate (ai_visibility.py).

| Area | Score |
|---|---|
| AI crawler access | 100 |
| Rendering (raw HTML) | 100 |
| Indexability & canonicals | 100 |
| Structured data & entity | 98 |
| Content extractability (AEO) | 100 |
| Trust & E-E-A-T signals | 96 |
| Delivery & performance | 100 |
| Agent operability | 100 |
| International | 100 |
| **Overall** | **99** |

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

### LOW

- **[Structured data & entity]** Organization could add: sameAs, legalName — 39 page(s): https://siaran.my/, https://siaran.my/docs/api/user, https://siaran.my/use-cases/social-media-scheduling-api …
- **[Trust & E-E-A-T signals]** Email address hidden from crawlers by Cloudflare Email Obfuscation — live AI fetchers can't read the contact email — 39 page(s): https://siaran.my/, https://siaran.my/docs/api/user, https://siaran.my/use-cases/social-media-scheduling-api …
  - Fix: Turn off Email Obfuscation (Scrape Shield) or also show the address as plain text on the Contact/About page
- **[Structured data & entity]** No BreadcrumbList — 6 page(s): https://siaran.my/about, https://siaran.my/changelog, https://siaran.my/contact …
- **[Content extractability (AEO)]** Heading levels skip (e.g. h2 -> h4); extraction uses the outline — 4 page(s): https://siaran.my/docs/api/user, https://siaran.my/platforms, https://siaran.my/pricing …
- **[Structured data & entity]** SoftwareApplication could add: aggregateRating, review — 2 page(s): https://siaran.my/, https://siaran.my/pricing
- **[Content extractability (AEO)]** No question-phrased headings; answer engines match sub-queries to headings — 2 page(s): https://siaran.my/docs/api/user, https://siaran.my/platforms
  - Fix: Phrase key H2/H3s as the questions buyers ask
- **[Trust & E-E-A-T signals]** No HSTS header — 1 page(s): https://siaran.my
  - Fix: Strict-Transport-Security: max-age=31536000; includeSubDomains

## Pages

| URL | Type | Status | Words | H2/H3 | Schema | Q-heads | Author | Dates | Issues |
|---|---|---|---|---|---|---|---|---|---|
| https://siaran.my/ | home | 200 | 1478 | 24 | FAQPage, Organization, SoftwareApplication, WebSite | 6 |  | ✓ | 3 |
| https://siaran.my/docs/api/user | article | 200 | 935 | 11 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 4 |
| https://siaran.my/use-cases/social-media-scheduling-api | page | 200 | 493 | 10 | BreadcrumbList, FAQPage, Organization | 3 |  |  | 2 |
| https://siaran.my/bluesky-api/errors | page | 200 | 551 | 12 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/discord-api | page | 200 | 627 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/facebook-api | page | 200 | 812 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/google-business-profile-api | page | 200 | 1032 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/instagram-api | page | 200 | 826 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/linkedin-api/errors | page | 200 | 546 | 12 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/mastodon-api | page | 200 | 664 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/pinterest-api | page | 200 | 675 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/reddit-api | page | 200 | 705 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/slack-api | page | 200 | 665 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/snapchat-api/errors | page | 200 | 484 | 11 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/threads-api/errors | page | 200 | 463 | 10 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/tiktok-api/errors | page | 200 | 660 | 17 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/x-api | page | 200 | 911 | 19 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/youtube-api/errors | page | 200 | 582 | 13 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/about | about | 200 | 249 | 3 | Organization | 2 |  |  | 3 |
| https://siaran.my/changelog | page | 200 | 190 | 1 | Organization | 0 |  |  | 3 |
| https://siaran.my/contact | contact | 200 | 152 | 0 | Organization | 0 |  |  | 3 |
| https://siaran.my/data-deletion | page | 200 | 466 | 6 | Organization | 1 |  | ✓ | 3 |
| https://siaran.my/features | service | 200 | 657 | 15 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/platforms | page | 200 | 648 | 17 | BreadcrumbList, Organization | 0 |  |  | 4 |
| https://siaran.my/pricing | service | 200 | 1346 | 24 | BreadcrumbList, FAQPage, Organization, SoftwareApplication | 8 |  |  | 4 |
| https://siaran.my/privacy | utility | 200 | 737 | 10 | Organization | 5 |  | ✓ | 3 |
| https://siaran.my/terms | utility | 200 | 877 | 11 | Organization | 0 |  | ✓ | 3 |
| https://siaran.my/openapi.json |  | 200 |  |  |  |  |  |  | 0 |
| https://siaran.my/docs/api/api-key | article | 200 | 309 | 4 | BreadcrumbList, Organization, TechArticle | 0 | ✓ | ✓ | 3 |
| https://siaran.my/use-cases/social-media-webhooks | page | 200 | 416 | 10 | BreadcrumbList, FAQPage, Organization | 3 |  |  | 2 |
| https://siaran.my/bluesky-api | page | 200 | 650 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/discord-api/errors | page | 200 | 456 | 11 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/facebook-api/errors | page | 200 | 611 | 14 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/google-business-profile-api/errors | page | 200 | 615 | 12 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/instagram-api/errors | page | 200 | 545 | 12 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/linkedin-api | page | 200 | 732 | 18 | BreadcrumbList, FAQPage, Organization | 7 |  |  | 2 |
| https://siaran.my/mastodon-api/errors | page | 200 | 191 | 2 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/pinterest-api/errors | page | 200 | 541 | 12 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/reddit-api/errors | page | 200 | 513 | 12 | BreadcrumbList, Organization | 1 |  |  | 2 |
| https://siaran.my/slack-api/errors | page | 200 | 455 | 12 | BreadcrumbList, Organization | 1 |  |  | 2 |

## Site facts

- home_final: `"https://siaran.my"`
- http_redirect: `{"status_chain": [301], "final": "https://siaran.my/"}`
- alt_host: `{"host": "www.siaran.my", "status": 200, "final": "https://siaran.my/", "error": ""}`
- soft404_status: `404`
- markdown_negotiation: `false`
- llms.txt: `{"status": 200, "content_type": "text/plain", "bytes": 9949, "h1": true, "links": 68}`
- llms-full.txt: `{"status": 404, "content_type": "text/html", "bytes": 16795}`
- sitemap_url_count: `87`

## Not measured here

- JavaScript-rendered content → `node scripts/render_diff.mjs <url>`
- CDN/WAF blocking of AI bots → `python3 scripts/bot_access.py <url>`
- Core Web Vitals field data → PageSpeed Insights / CrUX (references/seo-foundations.md)
- What AI engines actually say about the brand → `python3 scripts/ai_visibility.py`
- Off-site authority (mentions, reviews, Wikipedia/Wikidata, Reddit, YouTube) → references/offsite-authority.md
