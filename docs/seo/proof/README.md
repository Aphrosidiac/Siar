# Proof: the Siar landing build against the acceptance standard

Branch `feat/seo-landing`, checked 12 November 2026. The standard is [../ACCEPTANCE.md](../ACCEPTANCE.md). Nothing here
is deployed: gate D (live hosts, crawlers, Search Console, IndexNow) waits for Fakhrul's go.

## Gates A and B: `apps/site/scripts/seo-gate.mjs`

| Run | Scope | Result |
|---|---|---|
| Full run 1 ([gate-full-run-1.md](gate-full-run-1.md)) | 128 sitemap pages, 256 Lighthouse runs | 29 failures: 26 layout shift from the font swap, 3 LCP/TBT on large API reference pages. Accessibility, Best Practices and SEO 100 on every run |
| Fixes | Fonts no longer swap on a page that has painted; docs entrance transform-only; reference pages split and deduplicated | See the commits on the branch |
| Final run ([gate-final.md](gate-final.md)) | Static gate on all 128 sitemap pages, plus Lighthouse on the 28 pages that failed (56 runs, mobile and desktop) | **Exit 0. 0 failures.** Every run 100 / 100 / 100 / 100 |

The second full Lighthouse pass was skipped on Fakhrul's instruction (12 Nov): only the pages that failed were re-run.
The 16 warnings in the final report are reviewed: quoted rival facts inside dated tables, negated phrases ("not
white-label", "no free plan" quoted from Postiz), legal pages, and every `lastmod` being today because every page's
content changed today.

Re-run it: `pnpm --filter @siar/site seo-gate` (full) or `-- --no-lh` (static, about a minute).

## Gate C: what a reviewer reads

| Check | How | Result |
|---|---|---|
| Answer first | Script: the first ~70 words of every sitemap page (navigation removed) must name Siar and its category | All 128 pass, after leads were added to the 15 error pages, 8 docs guides and 2 legal pages |
| Claims true today | Network status from `lib/status.ts` only, prices from `plans.ts`; sweep of every page for `messaging.md` §10 phrases (OpenAPI 3.1, 262/263 operations, npm/npx, trusted by, uptime, at cost, drop-in, bundle.social, Meta partner…) | Hits were all negations or concessions, except "at cost" on the X hub, now "at X's own USD prices" |
| Rival facts | Every rival cell is a `Fact` in `apps/site/src/data/rivals.ts` with the vendor URL and "checked 12 November 2026"; facts without a vendor source were left out | Pass |
| No JavaScript | The gate parses the raw built HTML (no JS): one `<title>`, a self-canonical, JSON-LD and one `<h1>` on every page; `/errors` shows all 147 codes with the filter only narrowing them | Pass |
| Browser sizes | Script on every sitemap page at 1920 × 1080 (DPR 1) and 390 × 844, light and dark: no sideways scroll, no element wider than the viewport. Screenshots of the new templates read by hand | Pass |
| Rich results | Every JSON-LD node checked against the schema.org vocabulary (types and properties, with supertypes). Types used: Organization, WebSite, SoftwareApplication, Offer, BreadcrumbList, TechArticle, CollectionPage, ItemList, Dataset | 0 errors. No FAQPage, Review or AggregateRating anywhere |

## Before and after (head of the key pages)

Before, live on siaran.my ([before-live.md](before-live.md)):

| Page | Title | H1 as text (no JS) |
|---|---|---|
| `/` | Siar | "Write it once.Siar it everywhere." (glued) |
| `/pricing` | Pricing: pay by business, not by channel \| Siar | "One price per business.Every account included." |
| `/platforms` | Supported platforms \| Siar | "15 networks.One integration." |
| `/features` | Product tour \| Siar | "One dashboard.15 networks. No tab juggling." |
| `/use-cases` | Use cases \| Siar | "What people buildwith Siar." |

After, this branch ([after-build.md](after-build.md)):

| Page | Title | H1 |
|---|---|---|
| `/` | Unified social media API, every post accounted for \| Siar | Write it once. Siar it everywhere. |
| `/pricing` | Siar pricing: social media API priced per organization | One price per organization, never per connected account. |
| `/platforms` | Social media API networks: what is open today \| Siar | Supported networks: what the Siar API can post to today |
| `/features` | Social media scheduler and inbox on the same API \| Siar | Social media scheduler and inbox, built on the same API |
| `/use-cases` | What you can build with a social media API \| Siar | What you can build with a social media API |

Also removed from the live site: TikTok, Google Business and LinkedIn company pages shown as "Posted"; the scripted
"Live" feed; "all 15 networks" in `llms.txt` and the pricing hero; npm install lines; the calculator's server-rendered
"RM399 for 240 accounts" pairing that Bing Copilot quoted.

Sitemap: 89 URLs live → 128 on this branch (new: proof hubs, 14 compare pages, 6 guides, agencies, Malaysia, network
topic pages, two use cases, per-network API reference pages).

## Trade-offs to know about

- **Fonts.** To reach Performance 100 on mobile, the first page a visitor opens in a tab paints in the system sans
  while IBM Plex downloads into the cache; every later page in that tab uses Plex at once. No page ever swaps fonts
  after it has painted, so there is no shift or flash. With JavaScript off, Plex loads normally.
- **API reference.** Very deep schemas are shown three or four levels deep, with a pointer to `/openapi.json` for
  the rest; repeated response shapes link to the first. `/docs/api/misc` is now an index of per-network pages.

## Not done here (gate D and owner items)

- Deploy, then the live re-run of gates A and B, the 14 crawler user-agents, HSTS, the one-hop 301s
  (`deploy/nginx/siar.conf` now has them, untested on a live nginx).
- Search Console and Bing: add the property, submit the sitemap, URL Inspection on one page per template, IndexNow.
- Cloudflare Email Obfuscation off, `X-Robots-Tag: noindex` on app.siaran.my (`docs/geo/owner-todo.md`).
