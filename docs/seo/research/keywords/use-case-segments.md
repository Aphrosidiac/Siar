Verified 2026-11-12: 10 corrections

# Keyword sweep: use-case and segment terms

> **Verification pass (2026-11-12).** Re-checked against primary sources: Siar code in this checkout, `../siar-truth.md`,
> bundle.social's live OpenAPI (`https://api.bundle.social/swagger-json`, 148 paths), the eight vendor sitemaps listed in
> Sources (every SM URL cited below was found in them), the Hootsuite/Sprout sitemaps in the shared scratchpad,
> https://linktr.ee/marketplace/developer, the live `https://siaran.my/sitemap-0.xml` (89 URLs) and 63 autocomplete seeds
> re-fetched the same day. Corrections are marked "(corrected 2026-11-12)". **Not re-verified:** the "who ranks" (W\*) cells.
> The shared WebSearch budget was already used up when this pass started, so no SERP could be re-run; W\* cells were
> only checked for consistency with `head-unified.md` and stay **unverified** by this pass. Autocomplete counts drift
> between fetches by 1–3 completions; where the re-check differed, both numbers are shown.

Checked 2026-11-12. This sweep covers buyer segments and capability terms: agencies and freelancers, SaaS builders,
creators, e-commerce, analytics, comments, the inbox and DMs, link in bio, hosted OAuth, multi-tenant, plus the no-code
and vertical terms those segments use.

It builds on these files and does not repeat them:
- `head-unified.md` in this folder. Its rows 44–52 (white label, agencies, SaaS, multi-tenant) and 72–80 (n8n, analytics,
  comments, inbox, webhooks, OAuth) were the first pass. This sweep widens each cluster and adds the segment terms.
- `per-network.md` (the `/<net>-api/<topic>` slug pattern and the Instagram/Facebook rows) and `alternatives-vs.md`.
- `../competitors/*.md` for vendor page inventories, and `../current-site.md` for indexing and titles.
- `docs/geo/plan.md`.

Siar wording follows `../siar-truth.md`. Where it and the research brief disagree, the truth file wins: 270 operations in
an OpenAPI 3.0 document; publishing open on 9 networks; DMs are a per-organization beta on Facebook and Instagram only.

## Method, labels and limits

| Code | What it is | Label |
|---|---|---|
| **AC** | Google autocomplete (`suggestqueries.google.com`, `client=firefox`, `hl=en`, `gl=us`). 237 seeds were fetched for this sweep on 2026-11-12. "AC n" = the number of completions returned, up to 10. "AC child of X" = Google offers this phrase when you type X. "AC 0" = no completions, which means little or no volume. When the completions point somewhere else (for example "build a social media scheduler" → "creating a social media schedule"), the row says so | measured |
| **W\*** | WebSearch results recorded the same day in `head-unified.md` (US; engine not disclosed; a proxy for Google, so the order is indicative) | measured (by sibling) |
| **SM** | Pages that **target** the term, read from the vendors' own sitemaps fetched 2026-11-12: bundle.social, ayrshare.com, zernio.com, postpeer.dev, social-api.ai, publora.com, outstand.so, upload-post.com, plus blog.hootsuite.com and sproutsocial.com from the shared research scratchpad, fetched the same day. This shows who competes for a term, not who ranks for it | sourced (vendor sitemap) |
| **V** | A vendor page I read directly (URL given) | sourced |

**The search budget ran out before this sweep's first query.** The shared limit of 200 WebSearch calls per turn had been
used up by the parallel sweeps, so this sweep has **no new SERP data of its own**. The rules forbid scraping search
engines another way, so I did not. As a result, "Top 5 now" is measured only where `head-unified.md` already ran the
query (W\*). Every other row says **n/m** (not measured) and names the vendors with exact-match pages (SM), labelled
[inferred]. Those rows need a SERP check before a page is built. The ones to check first are marked ▲.

**Demand** is always [inferred]. It is graded from autocomplete depth, whether the completions keep the intent, and how
many vendors built a page for the term (vendors build pages where they see traffic).

**Win** (realistic for siaran.my, a one-month-old domain that ranks for its own name only and has about 32 of 89 URLs in
Google per `current-site.md`). *weeks* = an exact-match page can reach the Bing/DDG top 10 within weeks of indexing.
*months* = 2–6 months, with internal links and a few mentions. *long-term* = 6–12+ months, and it needs authority.
*unlikely* = the intent does not match what Siar can truthfully offer today, or a platform owner always wins. Always [inferred].

**Page types.** use-case = the existing `/use-cases/*` template · guide = a how-to with code · H2 = a section on an existing
page, not a new URL · hub-topic = `/<net>-api/<topic>` (the pattern from `per-network.md`) · skip = do not target.

**Siar page.** An existing URL from https://siaran.my/sitemap-0.xml (89 URLs, fetched 2026-11-12), or **NEW** `/slug`.

### Product facts that decide these rows (code, checked 2026-11-12)

| Fact | Evidence | Effect on keywords |
|---|---|---|
| No post approval workflow. No client-report export | `grep -ri approv` over apps/api/src and apps/web/src: hits are comment moderation (`content-comments.ts`; the `APPROVE`/`REJECT` actions are defined in `packages/networks/src/types.ts` line 212), billing, Google Business review-reply states, and UI text about networks approving Siar's app. None is a post approval step (corrected 2026-11-12: the earlier wording said comments and billing were the only hits). `Analytics.vue` has no export | Agency "approval" and "client reporting" terms are product gaps |
| Roles are OWNER / ADMIN / MEMBER per organization | `apps/api/prisma/schema.prisma` lines 122–126 | No "client" or "viewer" role to sell to agencies |
| One live account per network per team (brand) | `schema.prisma` line 4 and line 519. Brand caps: Free 1, Starter 1, Pro 10, Business and Enterprise unlimited (`plans.ts`) | "Unlimited social accounts on every plan" is literally true only on Business and Enterprise [code + inferred: brands × one account per network caps Free/Starter at 15 and Pro at 150]. This is the honesty trap already flagged in `../competitors/bundle-social.md`. **Conflict:** `../siar-truth.md` §1c still allows "Unlimited connected social accounts on every plan, Free included" (plans.ts has no account-limit field), so the two files disagree until Fakhrul rules (noted 2026-11-12). Agency and "unlimited accounts" copy must say "a brand per client: 10 on Pro, unlimited on Business" |
| Link in bio: one page per team, public at `app.siaran.my/b/<slug>`. Link, header, social and text items; views and clicks per item. Full CRUD in the API (`/api/v1/bio`, `/bio-item`, `/bio-analytics`) | `apps/api/src/modules/bio.ts` line 9; `Bio.vue` line 56; `packages/contract/openapi.json` | A real API capability few vendors document. No custom domain |
| DMs and comment-to-DM: beta, switched on per organization, Facebook and Instagram, not on Free | `messaging-shared.ts` line 25 (`BETA_MESSAGE`), line 33 | DM terms have demand, but a page can only say "beta, on request" |
| Comments: the adapter list includes 12 networks. They are usable only where publishing is open (Facebook, Instagram, Threads, X, Bluesky, Mastodon, Slack, YouTube). Discord: the bot can post and delete replies but there is no comment import (`discord.ts` `commentImport: false`, per `../siar-truth.md` 1c) (Discord note added 2026-11-12) | `content-comments.ts` line 60 (`COMMENTABLE`, 12 networks); `../siar-truth.md` 1c | Never "comments on every network". No TikTok comment pages |
| Analytics: paid plans only (Starter and up) | `plans.ts` `analytics: false` on Free | Analytics pages must say so |
| Hosted connect: branded (logo, name, colour) with a "Powered by Siar" footer on Siar's domain, English only | `../siar-truth.md` section 4 | Never "white-label" |
| Bulk CSV import exists | `Bulk.vue`, `/docs/api/post-csv-import` | Can target bulk-upload terms |
| No Shopify app, WooCommerce plugin, Zapier app or n8n node | not in the repo [measured: no such packages] | E-commerce and no-code terms get guides (webhook or HTTP request into the API), not "install" pages |
| Open for publishing: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack. YouTube uploads stay private until YouTube's audit. TikTok, Pinterest publishing, LinkedIn pages, Reddit, Snapchat, GBP: not open | `../siar-truth.md` 1a/1b, `docs/approvals/README.md` | The creator segment (TikTok, YouTube, Reels) is mostly blocked |

---

## Keyword table

### A. Agencies and freelancers: dashboard intent (they want a tool, not an API)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 1 | social media management tools for agencies | Commercial | **High**. AC child of 4 seeds ("…recurpost" is a brand pinned in completions) | n/m · likely Sprout, Hootsuite, SocialPilot, Sendible, Agorapulse listicles [inferred]; Hootsuite and Sprout run agency hubs (SM: sproutsocial.com/agencies/…, blog.hootsuite.com/franchise-social-media-marketing) | unlikely | skip (headline) | — |
| 2 | social media management software for agencies | Commercial | High. AC 8 | n/m · as #1 [inferred] | unlikely | skip | — |
| 3 | best social media management tool(s) for agencies | Commercial (listicle) | Med–high. AC 3 (re-check 2026-11-12: 5) | n/m · as #1 [inferred] | unlikely | skip | — |
| 4 | social media scheduler for agencies / social media scheduling tool(s) for agencies | Commercial | Med–high. AC 6 and 8 (re-check 2026-11-12: 6 and 7) | n/m · zernio.com/blog/hootsuite-alternative-for-agencies, publora.com/blog/agency-guide-social-media-scheduling-workflows target it (SM) | long-term | use-case (H2) | **NEW** `/use-cases/social-media-api-for-agencies` (H2 "Use the Siar dashboard for clients") |
| 5 | social media tools for agencies | Commercial | Med. AC 6 | n/m | unlikely | skip | — |
| 6 | social media agency software / social media agency tools | Commercial | Med. AC 10 each, but the completions drift to "social media marketing software/tools" | n/m | unlikely | skip | — |
| 7 | how to manage multiple clients social media accounts | Informational | Low–med. AC child of 2 seeds | n/m · likely Hootsuite and Sprout blogs (SM: sproutsocial.com/insights/collaborate-with-clients) [inferred] ▲ | months | guide | **NEW** `/guides/manage-social-media-for-multiple-clients` (one brand per client, branded connect link so the client never shares a password) |
| 8 | social media management tools for multiple clients | Commercial | Low–med. AC 3 | n/m | long-term | H2 | same as #7 |
| 9 | best social media scheduler for multiple accounts | Commercial | Low–med. AC child of 2 seeds | n/m | long-term | H2 | `/pricing` H2 "Unlimited accounts per brand…" (honest wording, see facts) |
| 10 | social media scheduler unlimited accounts / social media management unlimited accounts | Commercial | Low. AC 0 for both. bundle.social, Ayrshare and others still lead with the phrase (`../competitors/`) | n/m | weeks–months | H2 | `/pricing`. **Blocked:** the claim is literally true only on Business/Enterprise (one account per network per brand). Fakhrul decides the wording first |
| 11 | social media tool pricing per user / per seat | Commercial | Low. AC 0 | n/m | months | H2 | `/pricing` ("per organization, no seat fees") |
| 12 | cheapest social media scheduler / cheap social media scheduler | Commercial | **Med–high**. AC 10, incl. "reddit", "tool", "app", "planner" | n/m · likely listicles and Reddit threads [inferred] ▲ | long-term | guide | **NEW** `/guides/social-media-scheduler-pricing` (per channel vs per seat vs per organization, using vendors' own price pages). It merges with `head-unified.md`'s planned `/guides/social-media-api-pricing` if Fakhrul prefers one page |
| 13 | most affordable social media scheduler | Commercial | Low. AC 2 | n/m | long-term | H2 | same as #12 |
| 14 | social media management tools for freelancers | Commercial | Low–med. AC child of 3 seeds | n/m · blog.hootsuite.com/freelance-social-media-manager targets the adjacent topic (SM) | long-term | H2 | `/use-cases/social-media-api-for-agencies` (Pro's own tagline in `plans.ts` is "For freelancers and agencies") |
| 15 | social media approval workflow / social media tool with approval workflow | Commercial + info | Med. AC 5 (process, template, "tool with approval workflow") | n/m · SM: blog.hootsuite.com/social-media-approval-workflow, sproutsocial.com/insights/social-media-approval, publora.com/glossary/approval-workflow | unlikely | skip | — (**product gap**: no approval step in Siar) |
| 16 | social media content approval tool | Commercial | Low. AC 3 | n/m | unlikely | skip | — (gap) |
| 17 | client approval social media | Commercial | Low. AC 0 | n/m | unlikely | skip | — (gap) |
| 18 | social media client portal | Mixed (Notion templates) | Low. AC 4, all "notion" / "manager client portal" | n/m | unlikely, wrong intent | skip | — |
| 19 | social media agency dashboard | Mixed (templates, Hootsuite) | Low–med. AC 7 | n/m | unlikely | skip | — |
| 20 | white label social media reports | Commercial | Low. AC 0 | n/m | unlikely | skip | — (gap: no reports) |
| 21 | social media analytics for agencies | Commercial | Low. AC 3, completions drift ("social media analytics agency") | n/m | long-term | skip | — |
| 22 | best social media management tools for teams / social media collaboration tools | Commercial | Low–med. AC 3 / AC 6 | n/m | unlikely | skip | — |

### B. Agencies: API intent (they want to build their own tool)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 23 | social media api for agencies | Commercial | Low. No completion of its own ("social media api for" → "ai agents") | W\* (head-unified #48): ayrshare.com/use-cases/digital-agencies, zernio.com/use-cases/agencies. SM also: social-api.ai/solutions/social-media-api-for-agencies, postpeer.dev/use-cases/marketing-agencies | months | use-case | **NEW** `/use-cases/social-media-api-for-agencies` |
| 24 | agency social media api | Commercial | Low. AC 0 | n/m | months | H2 | same as #23 |
| 25 | white label social media api | Commercial | Low. AC 0 | W\* (head-unified #44): ayrshare.com/use-cases/digital-agencies (ayrshare.com/solutions/digital-agencies 308-redirects to it, so the two URLs listed earlier are one page; measured 2026-11-12, corrected), bundle.social/white-label-social-media-api, juicer.io/white-label, cloudcampaign.com | unlikely until the connect page can drop "Powered by Siar" | skip the phrase | same as #23, worded "your UI, Siar's API, a branded connect link" |
| 26 | white label social media scheduler | Commercial | Low. AC 1 | W\* (head-unified #47): oneupapp.io, getlate.dev/blog, cloudcampaign.com, socialchamp.com. SM: zernio.com/blog/white-label-social-media-scheduler | unlikely | skip | — |
| 27 | build an agency social media dashboard (with an API / with Claude Code) | Informational | Low. Not AC-checked. One vendor post targets it (SM: social-api.ai/blog/build-agency-social-media-dashboard-claude-code) | n/m | weeks–months | guide | **NEW** `/guides/build-a-client-social-media-dashboard` (needs `@siar/mcp` on npm if it uses Claude Code, `../siar-truth.md` section 5) |

### C. SaaS builders: "add social to my product"

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 28 | social media api for saas | Commercial | Low. AC 0. Every API vendor has a page (SM: bundle.social/social-media-api-for-saas, ayrshare.com/use-cases/saas-platforms, zernio.com/use-cases/saas-platforms, postpeer.dev/use-cases/saas-products, social-api.ai/blog/best-social-media-api-saas-builders-2026) | W\* (head-unified #49): ayrshare.com, contentstudio.io, getlate.dev/blog, bundle.social, sourceforge.net | months | use-case | `/use-cases/multi-tenant-social-media-api`, retitled "Social media API for SaaS: multi-tenant by design" (as `head-unified.md` advises; no second page) |
| 29 | integrate social media into saas app / add social publishing to your saas | Informational | Low. AC 0 for "integrate social media into app" | W\* (head-unified #51): cloudcampaign.com, postiz.com/enterprise, ayrshare.com, opus.pro, dev.to. SM: zernio.com/blog/integrate-social-media-saas-app | months | guide | **NEW** `/guides/add-social-publishing-to-your-saas` (already planned in `head-unified.md`) |
| 30 | add social media posting to my app / add social media scheduling to my app | Informational | Low. AC 0 for 3 variants | n/m | weeks–months | H2 | same guide as #29 |
| 31 | let users post to social media from my app / allow users to post to instagram from my app | Informational | Low. AC 0 | n/m | weeks–months | H2 | same guide as #29, plus `/use-cases/hosted-connect-oauth` |
| 32 | post to instagram from my app / post to tiktok from my app | Informational | Low. AC 0 | n/m | months (Instagram); TikTok guide only | H2 | `/instagram-api` (TikTok: no Siar claim until approval) |
| 33 | embedded social media api / embed social media scheduler / embeddable social media scheduler | Commercial | Low. AC 0 for all three "embed scheduler" variants. Ayrshare titles a page "Embedded Social Media API" (`../competitors/ayrshare.md`) | n/m | months | H2 | `/use-cases/multi-tenant-social-media-api`. **Trap:** "embedded social media" alone means website feed widgets (head-unified #52) |
| 34 | social media scheduling sdk / social media posting sdk | Commercial | Low. AC 3 and 6, but every completion turns back into "…api" | n/m | months | H2 | `/docs/sdk-cli-mcp` (no install line until the SDK is on npm) |
| 35 | build vs buy social media integration | Informational | Low. AC 0 | n/m | weeks | H2 | same guide as #29 (the per-network pain map in `per-network.md` section 1 is the argument) |
| 36 | how to build a social media scheduler | Informational | Low for developers. AC 7, but the completions are mostly content-calendar ("how to make a social media schedule") | n/m | months for the developer slice | guide | **NEW** `/guides/build-a-social-media-scheduler` (one network adapter vs one API, with code). Low priority |
| 37 | build your own social media scheduler / build social media management tool | Informational | Low. AC 0 | n/m | months | H2 | same as #36 |
| 38 | social media scheduler open source | Commercial | **Med–high**. AC 10 (github, free, "postiz…") | n/m · likely postiz, mixpost, GitHub [inferred] | unlikely (Siar is not open source) | skip | — |
| 39 | social media sharing api / share to social media api | Mixed: share buttons, Web Share API | Low. AC 1 / 0 | n/m | unlikely, wrong intent | skip | — |
| 40 | social media management api | Commercial | Low–med. AC 3 ("buffer social media management api", "…tools with api") | n/m (head-unified #41) | months | H2 | `/` |

### D. Hosted OAuth and multi-tenant

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 41 | multi-tenant social media api | Commercial | Low. AC 0 for "multi tenant social media api" and "multi-tenant social media". SM: bundle.social/multi-tenant-social-media-api and /blog/multi-tenant-social-media-api-architecture, zernio.com/blog/multi-tenant-social-media | W\* (head-unified #50): bundle.social, vinquery.com, ayrshare.com (2), mallary.ai | **weeks–months** (thin SERP) | use-case | `/use-cases/multi-tenant-social-media-api` |
| 42 | multi-tenant social media architecture | Informational | Low. Not AC-checked; bundle.social wrote a blog post for it (SM) | n/m | weeks–months | H2 | same as #41 (a "how tenancy works" H2: organization → brand → one account per network) |
| 43 | social media oauth api / social media oauth | Commercial | Low. AC 2 for "social media oauth" | W\* (head-unified #79): ayrshare.com/connect, bundle.social/social-media-oauth-api, docs.whop.com, info.bundle.social, docs.postiz.com | weeks–months | use-case | `/use-cases/hosted-connect-oauth`, retitled "Social media OAuth API: a hosted connect link" |
| 44 | hosted oauth social accounts / oauth for social media accounts | Commercial | Low. AC 0 for both | n/m | weeks | H2 | same as #43 |
| 45 | hosted oauth | Wrong intent (self-hosted OAuth servers) | AC 10, all OAuth-server terms (head-unified #80) | — | skip | — | — |
| 46 | let clients connect social media accounts / client connect link | Informational | Low. Not AC-checked. upload-post.com/how-to/let-clients-connect-social-media-accounts and an n8n template "generate secure client connect links" target it (SM) | n/m ▲ | weeks–months | guide | **NEW** `/guides/let-clients-connect-social-accounts` (agency + SaaS; links from #23 and #43) |
| 47 | connect instagram account api | Informational | Low–med. AC 5, but the completions are "how to get / access / use instagram api" | n/m | months | H2 | `/instagram-api` |
| 48 | connect social accounts / social account linking api | Navigational (Canva, HubSpot, Xbox, Epic) | AC 10, all consumer brands; "social account linking api" AC 0 | — | skip | — | — |
| 49 | facebook login for business / instagram login api | Navigational (Meta docs) | AC 10 each | n/m · developers.facebook.com [inferred] | unlikely | — | `/instagram-api` H2 "Instagram Login vs Facebook Login" (per-network.md #13) |
| 50 | social media login api / social media authentication api | Wrong intent (sign in with Google/Facebook) | AC 3, all "login api" (re-check 2026-11-12: AC 1, the phrase itself) | — | skip | — | — |
| 51 | bring your own oauth app (social api) | Commercial | Low. Not AC-checked. SM: postpeer.dev/blog/bring-your-own-oauth-apps | n/m | unlikely (product gap) | skip | — (corrected 2026-11-12: Siar does **not** support customer-owned network apps. The OpenAPI document has no client id/secret fields for customer apps, and the only per-app credentials in `accounts.ts` are the Mastodon server apps Siar registers itself [code]) |
| 52 | white label oauth | Commercial | Low. AC 0 | n/m | unlikely (product gap) | skip | — |

### E. Creators

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 53 | social media tools for content creators | Commercial | Med. AC 6 | n/m · SM: sproutsocial.com/insights/creator-tools, zernio.com/creators, ayrshare.com/use-cases/content-creator-platforms | unlikely now | skip | — |
| 54 | best social media management tools for content creators | Commercial | Low–med. AC 2 | n/m | unlikely now | skip | — |
| 55 | best social media scheduler for content creators / social media planner for content creators | Commercial | Low–med. AC child of 3 seeds | n/m | unlikely now | skip | — (creators' core networks are TikTok, YouTube and Reels. Only Reels is open; YouTube uploads stay private; TikTok is not open) |
| 56 | cross posting app / crossposting tool | Mixed: resellers (Poshmark, eBay) + social | Med. AC 10 (half are "for resellers") / AC 7 | n/m | unlikely, split intent | skip | — |
| 57 | cross post to social media / how to cross post on all social media | Informational | Med. AC 7 | n/m · likely Buffer, Hootsuite, Later blogs [inferred] | long-term | guide | `head-unified.md`'s planned `/guides/post-to-multiple-social-media-accounts-at-once` (H2) |
| 58 | post once publish everywhere | Commercial (tagline-shaped) | Med. AC 10, incl. "ai", "free", and two vendor taglines | n/m ▲ | months | H2 | `/` (it describes Siar's model: one post counts once across networks) |
| 59 | cross posting tiktok instagram youtube | Informational | Low. AC 2 | n/m | unlikely now (TikTok and YouTube not open) | skip | — |
| 60 | repurpose content across platforms | Informational | Low–med. AC 3 | n/m · likely content-marketing blogs [inferred] | long-term | skip | — |
| 61 | api automation for content creators / creator platform social api | Commercial | Low. Not AC-checked. SM: bundle.social/blog/api-automation-for-content-creators, ayrshare.com/use-cases/content-creator-platforms, zernio.com/use-cases/clipping and /use-cases/ai-video-tools | n/m | months, after TikTok/YouTube open | use-case (hold) | **NEW (hold)** `/use-cases/social-media-api-for-video-tools` (same hold as head-unified #40) |

### F. E-commerce

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 62 | auto post products to instagram / post products to instagram automatically | Transactional | Low. AC 0 for both | n/m | months | H2 | **NEW** `/guides/auto-post-new-products-to-social-media` |
| 63 | auto post new products to social media | Transactional | Low. AC 0 | n/m | months | guide | same as #62 |
| 64 | shopify auto post to instagram | Transactional | Low. AC 2 | n/m · SM: upload-post.com/how-to/auto-post-shopify-products-to-social-media, zernio.com/shopify ▲ | months | guide (H2) | same as #62, H2 "Shopify: product webhook → Siar API". No Shopify app, so the page says that plainly |
| 65 | shopify social media automation / shopify social media scheduler | Commercial | Low. AC 3 / AC 2 | n/m · likely the Shopify App Store [inferred] | long-term (app listings win) | H2 | same as #62 |
| 66 | shopify instagram integration | Wrong intent (Instagram feed widgets on a store) | AC 10, all "feed" | — | skip | — | — |
| 67 | auto post woocommerce products to facebook / woocommerce auto post to social media | Transactional | Low–med. AC child of "auto post products to facebook" | n/m · SM: upload-post.com/how-to/auto-share-woocommerce-products-on-social-media | months | guide (H2) | same as #62, H2 "WooCommerce" |
| 68 | wordpress auto post to social media (free / plugin) | Transactional (wants a plugin) | Med. AC child, 4 variants | n/m · likely wordpress.org plugins (Jetpack, Blog2Social) [inferred] | unlikely (no plugin) | skip | — |
| 69 | social media tools for ecommerce / ecommerce social media automation | Commercial | Low. Not AC-checked / AC 0. SM: publora.com/blog/social-media-tools-for-ecommerce, postpeer.dev/use-cases/e-commerce | n/m | months | H2 | same as #62 |
| 70 | auto post to instagram (from facebook) / automatically post to instagram | Consumer (Meta Business Suite) | High. AC 10 | n/m · likely help.instagram.com, Meta, Later [inferred] | unlikely | skip | — |
| 71 | instagram auto post api / instagram scheduling api | Commercial (developer) | Low–med. AC 4 / AC 7 | n/m (per-network.md #17) | months | H2 | `/instagram-api` + `/use-cases/social-media-scheduling-api` |
| 72 | new product launch social media post | Informational (content ideas) | Med. AC 6 | — | skip | — | — |

### G. Analytics

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 73 | social media analytics api | Commercial (mixed with listening and scraping) | Med. AC 6 (free, monitoring, sentiment). SM: bundle.social, ayrshare.com, postpeer.dev (plus 7 per-network child pages), zernio.com/social-media-analytics, social-api.ai/blog | W\* (head-unified #74): getlate.dev/blog, marketplace.gohighlevel.com, postpeer.dev/blog, ayrshare.com, shortimize.com | months | use-case | `/use-cases/social-media-analytics-api` (say "paid plans"; not indexed yet per `current-site.md`) |
| 74 | social media analytics api free | Commercial | Low. AC 4 | n/m | unlikely (Free has no analytics) | skip | — |
| 75 | social media metrics api / social media insights api / social media reporting api | Commercial | Low. AC 5 / AC 2 / AC 4 (reporting → "analytics api") | n/m | months | H2 | `/use-cases/social-media-analytics-api` |
| 76 | instagram analytics api / instagram post analytics api | Commercial + info | Med. AC 6 (free, post, data, "apify") | n/m · SM: postpeer.dev/social-media-analytics-api/instagram, bundle.social blog; likely developers.facebook.com [inferred] ▲ | months | hub-topic | **NEW** `/instagram-api/insights` |
| 77 | facebook insights api / facebook post analytics api | Navigational (Meta docs) | Med. AC 10 | n/m · likely developers.facebook.com [inferred] | long-term | hub-topic | **NEW** `/facebook-api/insights` (low priority) |
| 78 | youtube analytics api | Navigational (Google docs) | High. AC 10 | n/m · developers.google.com [inferred] | unlikely | skip | — |
| 79 | linkedin analytics api / linkedin post analytics api | Navigational + info | Med. AC 10 | n/m · learn.microsoft.com [inferred]; SM: zernio.com/blog/linkedin-analytics-api | — | skip | — (per-network.md #64: hold until LinkedIn analytics is tested) |
| 80 | tiktok analytics api | Navigational | Med. AC 10 | — | skip | — | — (not open) |
| 81 | social media data api / social media monitoring api / social listening api | Wrong intent (public data, scraping, listening) | Med. AC 7 / 5 / 10 (Bright Data, Apify) | n/m | unlikely: Siar reads only the accounts its customers connect | skip | — |
| 82 | social media analytics tools (free) / social media analytics dashboard | Consumer/commercial (dashboard tools, templates) | **High**. AC 10 each | n/m · SM: Hootsuite, Sprout, Zernio, Publora all have "best social media analytics tools" posts | unlikely | skip | — |

### H. Comments

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 83 | social media comments api | Commercial | Low. AC 2. SM: bundle.social, postpeer.dev (+6 per-network children), zernio.com/social-media-comments, social-api.ai/blog | W\* (head-unified #75): postpeer.dev, bundle.social, ayrshare.com, getlate.dev/blog, zernio.com | weeks–months | use-case | `/use-cases/social-media-comments-api` (not indexed yet; add body links) |
| 84 | instagram comments api / instagram comment api | Commercial + info (part scraper) | **Med–high**. AC 10 each (reply, get, delete, "scraper apify", "meta") | n/m · SM: bundle.social/instagram-comments-api, postpeer.dev/social-media-comments-api/instagram, zernio.com/blog/instagram-comment-moderation-api ▲ | months | hub-topic | **NEW** `/instagram-api/comments` |
| 85 | instagram api comment reply / instagram api comment on post | Informational | Med. AC child of #84 | n/m | months | H2 | same as #84 |
| 86 | facebook comments api / facebook comment reply api / facebook page comment api | Mixed: the website Comments Plugin vs Page comments | Med. AC 10 | n/m · SM: bundle.social/facebook-comments-api, postpeer.dev blog ▲ | months | hub-topic | **NEW** `/facebook-api/comments` (open by saying it is about Page comments, not the website plugin) |
| 87 | youtube comments api | Informational (devs, plus scraping) | Med–high. AC 10 (python, key, comments.list, comment threads) | n/m · developers.google.com likely #1 [inferred]; SM: zernio.com/blog/youtube-comments-api | long-term | hub-topic | **NEW** `/youtube-api/comments` (comments are claimable for YouTube per `../siar-truth.md` 1b; low priority) |
| 88 | tiktok comments api | Mixed (scrapers) | Med. AC 10 | — | skip (not open) | — | — |
| 89 | social media comment management (tool) / comment management tool | Commercial (dashboard) | Low–med. AC 4 / AC 9. SM: zernio.com/blog/social-media-comment-management | n/m | long-term | H2 | `/features` (inbox section) |
| 90 | comment moderation api | Mixed: ML content moderation (toxicity) vs social comments | Low. AC 1. SM: social-api.ai/blog/comment-moderation-api | n/m | months | H2 | `/use-cases/social-media-comments-api` (hide, delete, like, approve or reject where the network allows) |
| 91 | reply to comments api / auto reply comments api / hide comments api | Commercial | Low. AC 0 for all three | n/m | weeks | H2 | same as #90 |
| 92 | social media engagement api | Commercial | Low. AC 2 (head-unified #76: Ayrshare's page title) | n/m | months | H2 | same as #90 |
| 93 | moderate instagram comments | Consumer | Low–med. AC 4 | — | skip | — | — |

### I. Inbox, DMs and comment-to-DM (beta: Facebook and Instagram, per organization, on request)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 94 | unified inbox api | Commercial | Low. AC 4 | W\* (head-unified #77): getlate.dev/social-media-inbox, getlate.dev/blog, postly.ai, zernio.featurebase.app, ayrshare.com. SM: social-api.ai/solutions/unified-inbox-api, zernio.com/social-media-inbox | months | use-case | **NEW** `/use-cases/social-media-inbox-api`: comments (live) + FB/IG DMs (beta). Until it exists, an H2 on `/use-cases/social-media-comments-api` |
| 95 | social media inbox api / social inbox api | Commercial | Low. AC 0 for both | n/m | weeks–months | H2 | same as #94 |
| 96 | unified social inbox / unified social media inbox | Commercial (dashboard) | Low–med. AC 4. SM: blog.hootsuite.com/social-inbox-tools, zernio.com/blog/best-unified-social-media-inbox-tools | n/m | long-term | H2 | same as #94 + `/features` |
| 97 | social media inbox (management tool) | Commercial (dashboard) | Med. AC 9 | n/m · Hootsuite, Sprout Smart Inbox [inferred] | unlikely | skip | — |
| 98 | instagram dm api / instagram direct message api | Commercial + info | **Med–high**. AC 10 (github, python, pricing, send, automation, "meta") | n/m · SM: bundle.social/instagram-dm-api, postpeer.dev/social-media-messaging-api/instagram, zernio.com/blog/instagram-dm-api-for-saas-apps | months | hub-topic | **NEW (hold)** `/instagram-api/dm`, built when DMs leave beta. Until then, an H2 on `/instagram-api` that says "beta, on request" |
| 99 | instagram messaging api | Navigational + info | Med–high. AC 10 (documentation, pricing, tutorial, meta) | n/m · developers.facebook.com likely #1 [inferred]; SM: bundle.social/blog/instagram-messaging-api, zernio.com/blog/instagram-messaging-api | long-term | H2 | same as #98 |
| 100 | messenger api / facebook messenger api | Navigational (Meta) | High. AC 10 | — | unlikely | skip | — |
| 101 | social media dm api / direct messaging api | Commercial | Low. Not AC-checked. SM: bundle.social/social-media-dm-api, social-api.ai/blog/direct-messaging-api-2026, zernio.com/social-media-dms | n/m | months | H2 | same as #94 |
| 102 | comment to dm automation / instagram comment to dm (automation) | Consumer + commercial (ManyChat-type tools) | **High**. AC 10 each (free, tiktok, meta business suite, n8n, github) | n/m · likely ManyChat, Meta, consumer tools [inferred]. SM: bundle.social/comment-to-dm-api, postpeer.dev/comment-to-dm-api, zernio.com/comment-to-dm, outstand.so/solutions/comment-to-dm | long-term for the consumer head | skip (consumer head) | — |
| 103 | comment to dm api / instagram comment to dm api | Commercial (developer) | Low–med. AC child ("instagram comment to dm github", "…n8n") | n/m ▲ | months | use-case | **NEW (hold)** `/use-cases/comment-to-dm-api`, when automations leave beta. The truth file also bans BM SME ads on this until then |
| 104 | unified messaging api / omnichannel inbox api / customer messaging api | Wrong intent (telephony, CPaaS) / no demand | AC 5 (all "unified communications") / AC 0 / AC 0 | — | skip | — | — |

### J. Link in bio

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 105 | link in bio api | Commercial (developer) | Low. AC 5, but only the phrase itself keeps the intent | n/m ▲ | **weeks**: few vendors have a page. bundle.social has **no** link-in-bio endpoints in its public API (148 paths in `https://api.bundle.social/swagger-json`, none for bio, fetched 2026-11-12; `../competitors/bundle-social.md` lists link-in-bio on Siar's side only) and no landing page in its sitemap (corrected 2026-11-12). Ayrshare has only blog posts on link-in-bio pages, Publora a glossary entry; Zernio none (SM) | use-case | **NEW** `/use-cases/link-in-bio-api` (create a page, add, reorder and toggle links, read views and clicks per link. One page per brand at `app.siaran.my/b/<slug>`, no custom domain) |
| 106 | linktree api | Navigational + commercial | Low–med. AC 8 (documentation, key, apify) | n/m · likely linktr.ee and Apify scrapers [inferred]. V: Linktree's developer page is an "expression of interest" form; it says Linktree is expanding API access and documents no public API for managing links (https://linktr.ee/marketplace/developer, checked 2026-11-12) | months | H2 | same as #105, H2 "Linktree has no public links API; this one does". Link to the Linktree page; no other Linktree claims |
| 107 | bio link api / link in bio page api | Commercial | Low. AC 0 | n/m | weeks | H2 | same as #105 |
| 108 | link in bio analytics | Commercial | Low–med. AC 5 | n/m | long-term | H2 | same as #105 |
| 109 | link in bio / link in bio tool(s) / link in bio free | Consumer | **High**. AC 10 each | n/m · SM: Hootsuite and Sprout both have link-in-bio guides and tools; Linktree, Beacons, Later [inferred] | unlikely | skip | — |
| 110 | linktree alternative(s) | Commercial (consumer) | **High**. AC 10 (free, reddit, business, artists) | n/m | unlikely (Siar's page is a basic per-brand page with no custom domain) | skip | — |
| 111 | link in bio for business / linktree for business | Commercial | Med. AC 6 / AC 10 | n/m | unlikely | skip | — |
| 112 | link in bio builder / link in bio website | Consumer | High. AC 10 each | — | skip | — | — |

### K. No-code, bulk and AI (segment phrasings; head terms are in `head-unified.md`)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 113 | n8n social media automation (template / workflow / posting) | Info + commercial | **Med–high**. AC 10 | W\* for the sibling "n8n post to social media" (head-unified #72): growwstacks.com, skool.com, ayrshare.com/docs, getlate.dev/blog, buldrr.com. SM: upload-post.com has 60+ n8n pages (63 English URLs), bundle.social 11 n8n template pages plus a hub, integration page and blog post (corrected 2026-11-12 from 10), postpeer.dev, social-api.ai/solutions/n8n-social-media-api | months | guide | **NEW** `/guides/n8n-social-media-posting` (already planned; HTTP Request node, since Siar has no n8n node) |
| 114 | make.com social media automation | Info + commercial | Low–med. AC 5 (template) (re-check 2026-11-12: AC 3) | n/m · SM: upload-post.com/make-templates | months | guide | **NEW** `/guides/make-social-media-posting` (low priority) |
| 115 | zapier instagram post / zapier post to multiple social media | Info | Low. AC 2 / AC 0 | n/m | months | skip | — (head-unified #73: skip until a Zapier app exists) |
| 116 | social media bulk upload / bulk schedule social media posts csv | Commercial | Low. AC 4 / AC 0 | n/m | weeks–months | H2 | `/features` + `/docs/api/post-csv-import` (bulk CSV exists) |
| 117 | ai social media agent (github / langchain) | Info + commercial | **Med–high**. AC 10 (github, langchain, claude, free) | n/m | months | H2 | `/use-cases/social-media-api-for-ai-agents` (MCP install line blocked until npm publish) |
| 118 | can claude post to social media / how to use claude to post on social media | Informational (rising) | Low–med. AC 6 (re-check 2026-11-12: 8) | n/m ▲ | **weeks–months**: a question with few dedicated answers [inferred] | guide | **NEW** `/guides/post-to-social-media-from-claude` (only after `@siar/mcp` is on npm) |
| 119 | can chatgpt post to social media | Informational | Low–med. AC 5 | n/m | months | H2 | same as #118 |

### L. Verticals and small business

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 120 | social media scheduler for small business (free) | Commercial | **High**. AC 10 | n/m · likely Buffer, Hootsuite, Later, RecurPost [inferred] | unlikely | skip | — (`head-unified.md` keeps the Malaysia angle: **NEW** `/malaysia`, which does not exist yet: 404 on 2026-11-12, corrected) |
| 121 | social media management for franchises / multi location social media management | Commercial | Low–med. The completions drift ("management franchise" = buying an agency franchise; "multi social media management tool") | n/m · SM: blog.hootsuite.com/franchise-social-media-marketing, sproutsocial.com/insights/guides/franchise-marketing-guide | unlikely (multi-location depends on Google Business Profile, which is parked) | skip | — |
| 122 | social media api for real estate / restaurants / marketplaces | Commercial | None. AC 0 for all three. Ayrshare has real-estate case studies (SM) | n/m | — | skip | — |
| 123 | social media management malaysia | Mixed (agencies, salaries, statistics) | Med. AC 10 | see head-unified #93 | — | — | see head-unified #91–93 |

---

## What this sweep tells us

1. **Segment terms split into two different markets.** The dashboard phrases ("social media management tools for
   agencies", "cheapest social media scheduler", "link in bio", "linktree alternatives", "social media inbox",
   "comment to dm automation", "social media scheduler for small business") have the volume: AC 10 nearly everywhere
   [measured]. The API phrases ("social media api for agencies", "multi-tenant social media api", "social inbox api",
   "add social media posting to my app") mostly return **AC 0** [measured]. Siar cannot win the dashboard heads: Hootsuite,
   Sprout and the listicle sites own them, and Siar lacks the features those buyers check for (see 3). The API phrases are
   small but winnable, and the people searching them are the buyers Siar is built for [inferred].

2. **The demand sits in per-network capability terms, not segment terms.** "instagram comments api", "facebook comments api",
   "youtube comments api", "instagram dm api" and "instagram messaging api" each return AC 10; "instagram analytics api"
   returns AC 6 (corrected 2026-11-12; row 76 already said 6) [measured]. The generic "social media comments api" returns AC 2. postpeer.dev and bundle.social already split each
   capability by network (`/social-media-comments-api/instagram`, `/instagram-comments-api`) [sourced: vendor sitemaps]. For Siar this means
   capability × network pages under the existing hub pattern: `/instagram-api/comments`, `/facebook-api/comments`,
   `/instagram-api/insights`. The generic use-case pages become hubs that link down to them [inferred].

3. **Agencies are the segment the product fits least on the dashboard side.** There is no approval workflow, no client role,
   no report export, and the connect page is branded but not white-label [code]. Approval workflow (AC 5) and the agency
   tool listicles are therefore out of reach. What Siar can honestly say to agencies: a brand per client (10 on Pro,
   unlimited on Business), a connect link so clients never share passwords, one price per organization, and the API to build
   their own tool. Build one page, `/use-cases/social-media-api-for-agencies`, plus the
   `/guides/manage-social-media-for-multiple-clients` and `/guides/let-clients-connect-social-accounts` guides. Don't build
   for the dashboard heads [inferred].

4. **The "unlimited accounts" claim needs a decision before any agency or pricing page pushes it.** The code allows one live
   account per network per brand, and Starter has one brand [code]. "Unlimited social accounts on every plan" is literally
   true only on Business and Enterprise. Rows 9, 10 and 23 depend on Fakhrul's wording. This repeats the warning in
   `../competitors/bundle-social.md` because this sweep is where it bites.

5. **Link in bio API is the one open niche.** It has small but real developer demand ("link in bio api", "linktree api" AC 8)
   [measured]. Linktree documents no public API for managing links: its developer page is an interest form
   [sourced: linktr.ee/marketplace/developer, checked 2026-11-12]. None of Ayrshare, Zernio, postpeer, social-api.ai or Publora has
   a link-in-bio API page in its sitemap [sourced: SM]. bundle.social has neither link-in-bio endpoints in its public API nor a
   landing page [measured: its OpenAPI and sitemap, 2026-11-12; corrected from "has the endpoints"]. Siar has full CRUD
   plus click analytics in its API [code]. A `/use-cases/link-in-bio-api` page is cheap and likely to rank within weeks on
   Bing/DDG [inferred]. Leave the consumer link-in-bio heads alone: Siar's page is basic and has no custom domain.

6. **Creators: wait.** Creator demand is real ("social media tools for content creators" AC 6, "post once publish everywhere"
   AC 10) [measured], but creators post to TikTok, YouTube Shorts and Reels. TikTok is not open and YouTube uploads stay
   private [doc]. Any creator page today would either over-claim or disappoint. Revisit when TikTok's audit passes [inferred].

7. **E-commerce is a guide play.** "auto post products to instagram" and its variants return AC 0. "shopify auto post to
   instagram" returns AC 2, and the WooCommerce phrase is a completion [measured]. Upload-Post and Zernio already wrote these
   how-tos [sourced: SM]. Siar has no Shopify app or WooCommerce plugin [code], so the honest page is one guide:
   `/guides/auto-post-new-products-to-social-media`, a product webhook into the Siar API with Shopify and WooCommerce H2s.
   Avoid "shopify instagram integration" (feed widgets) and "wordpress auto post" (plugin seekers) [measured completions].

8. **DM and comment-to-DM demand is high, but the feature is in beta.** "instagram dm api" and "comment to dm" return AC 10
   [measured], and at least four API vendors have dedicated pages [sourced: SM]. Siar's DMs are a beta switched on per
   organization, Facebook and Instagram only [code]. Build `/use-cases/social-media-inbox-api` now: comments are live, and
   it can say DMs are "beta, on request". Hold `/instagram-api/dm` and `/use-cases/comment-to-dm-api` until the beta
   opens to everyone [inferred].

9. **Traps found in this sweep** (in addition to `head-unified.md` section 5): "cross posting app" (resellers),
   "shopify instagram integration" (feed widgets), "facebook comments api" (the website plugin; the page must open by
   disambiguating), "comment moderation api" (ML toxicity), "social media data / monitoring / listening api" (scraping),
   "unified messaging api" (telephony), "connect social accounts" (Canva, Xbox), "social media login api" (social sign-in),
   "social media client portal" (Notion templates), "how to build a social media scheduler" (content calendars),
   "social media management franchise" (buying an agency) [measured: autocomplete completions].

10. **Indexing still comes first.** Three of the pages this sweep leans on (`/use-cases/social-media-analytics-api`,
    `/use-cases/social-media-comments-api`, `/use-cases/social-media-webhooks`) were not returned by Google `site:`, are not in the footer,
    and have only 2–3 in-links each (`current-site.md` sections 2 and 4; corrected 2026-11-12 from "no body in-links") [measured there]. New capability × network pages should link up to these
    hubs, and the hubs should link from `/features` and the network pages.

### Suggested pages, in order (inferred; each needs Fakhrul's go before deploy)

| Priority | Page | Rows | Blocker |
|---|---|---|---|
| P1 | Body in-links to `/use-cases/social-media-comments-api`, `/social-media-analytics-api`, `/hosted-connect-oauth`; retitle hosted-connect and multi-tenant (as `head-unified.md` P1) | 28, 41, 43, 73, 83 | none |
| P1 | **NEW** `/use-cases/link-in-bio-api` | 105–108 | none |
| P2 | **NEW** `/instagram-api/comments`, `/facebook-api/comments` | 84–86 | none (open networks) |
| P2 | **NEW** `/use-cases/social-media-api-for-agencies` + `/guides/let-clients-connect-social-accounts` | 4, 14, 23–25, 46 | "unlimited accounts" wording (Fakhrul) |
| P2 | **NEW** `/use-cases/social-media-inbox-api` (comments live, DMs beta) | 94–96, 101 | inbox wording for the beta (Fakhrul; `../siar-truth.md` item 24) |
| P3 | **NEW** `/instagram-api/insights`, `/guides/add-social-publishing-to-your-saas`, `/guides/manage-social-media-for-multiple-clients`, `/guides/auto-post-new-products-to-social-media` | 7–8, 29–31, 35, 62–69, 76 | none |
| P3 | **NEW** `/guides/n8n-social-media-posting` (already in `head-unified.md`), `/guides/post-to-social-media-from-claude` | 113, 118–119 | Claude guide: `@siar/mcp` on npm |
| P4 | **NEW** `/guides/social-media-scheduler-pricing`, `/youtube-api/comments`, `/facebook-api/insights`, `/guides/build-a-social-media-scheduler`, `/guides/make-social-media-posting` | 12–13, 36, 77, 87, 114 | pricing guide: competitor prices from their own pages, dated |
| Hold | `/instagram-api/dm`, `/use-cases/comment-to-dm-api`, `/use-cases/social-media-api-for-video-tools` (creators) | 61, 98–99, 103 | DM beta; TikTok and YouTube approvals |
| Never (as things stand) | Agency dashboard heads, approval workflow, white-label, link-in-bio consumer heads, Linktree alternatives, social listening/data APIs, small-business scheduler heads | 1–3, 5–6, 15–22, 26, 52, 81–82, 109–112, 120 | product gaps or wrong intent |

**Next research step:** with a fresh search budget, run the SERP checks marked ▲ first (rows 7, 12, 46, 58, 64, 76, 84, 86,
103, 105, 118). Then rerun the rows where W\* is borrowed, to see whether the use-case pages enter the top 10 once they are indexed.

## Sources

Vendor sitemaps fetched 2026-11-12 (page-targeting evidence, not rankings): https://bundle.social/sitemap.xml,
https://www.ayrshare.com/sitemap_index.xml, https://zernio.com/sitemap-0.xml, https://postpeer.dev/sitemap.xml,
https://social-api.ai/sitemap.xml, https://publora.com/sitemap.xml, https://www.outstand.so/sitemap.xml,
https://www.upload-post.com/sitemap-0.xml; blog.hootsuite.com and sproutsocial.com sitemaps (shared research scratchpad, same day).

Vendor page read: https://linktr.ee/marketplace/developer (checked 2026-11-12; re-read in the verification pass: an "expression of interest" form, no link-management endpoints documented).

Verification pass: https://api.bundle.social/swagger-json (148 paths, 2026-11-12); `curl -I https://www.ayrshare.com/solutions/digital-agencies` → 308 to `/use-cases/digital-agencies/`; https://siaran.my/malaysia → 404; npm registry `@siar/sdk|cli|mcp` → 404 (all 2026-11-12).

Autocomplete: `https://suggestqueries.google.com/complete/search?client=firefox&hl=en&gl=us&q=<seed>`, 237 seeds, 2026-11-12.
