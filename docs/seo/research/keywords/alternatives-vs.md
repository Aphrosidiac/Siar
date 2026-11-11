Verified 2026-11-12: 12 corrections

# Keyword sweep: alternative and comparison terms

> **Verification pass, 2026-11-12.** I re-checked against primary sources: every price anchor (vendors' own pricing
> pages), the Ayrshare free-plan quote, 95 cited competitor URLs (all 200 except g2.com, which returns 403 to bots), the
> sitemap counts for Postiz, Ayrshare, Zernio, Upload-Post, bundle.social, Posteverywhere and Mallary, 65 autocomplete seeds,
> Siar's sitemap, rate limits and npm status. **I could not re-run any search-result ("who ranks") check**: the shared limit
> of 200 WebSearch calls per turn was already used up when this pass started, and working around it is not allowed. So every
> W and W\* result list below is **unverified on re-check** (measured once by the original sweep or its sibling). The
> Capterra, GetApp and AlternativeTo pages return 403 to scripts, so nothing on them was re-checked. Corrections are marked
> "(corrected 2026-11-12)".

Checked 2026-11-12. Covers "<competitor> alternative(s)", "<competitor> api alternative", "X vs Y", "<competitor> pricing",
"best social media API (2026)" and "cheapest social media API".

Builds on, and does not repeat:
- `head-unified.md` in this folder (rows 81–90 first listed the alternative terms; this sweep expands them to about 90 rows and adds who targets each one)
- the competitor teardowns in `../competitors/` (prices, page inventories, autocomplete per brand)
- `docs/geo/plan.md` P3 (comparison pages) and `docs/geo/owner-todo.md` (comparison pages go or no-go; bundle.social naming parked)

Siar wording follows `../siar-truth.md`.

## Method, labels and limits

| Code | What it is | Label |
|---|---|---|
| **AC** | Google autocomplete (`suggestqueries.google.com`, `client=firefox`, `hl=en`, `gl=us`), 75 seeds fetched 2026-11-12. "AC n" = completions returned. A seed that returns 0 has little or no volume. Rows marked "AC (T)" use autocomplete already measured today in a teardown file | measured |
| **W** | The WebSearch tool (US; engine not disclosed), first 5 results in the order returned. It is a proxy for Google, so treat the order as indicative. **This sweep ran only 2 W queries** ("ayrshare alternatives", "ayrshare alternatives reddit"). After those, the shared limit of 200 searches per turn across all agents was used up, so no more searching was possible | measured |
| **W\*** | W results from the sibling sweep `head-unified.md`, same day | measured (by sibling) |
| **SM** | Competitor sitemaps that I walked on 2026-11-12. These are the vendors' own sitemap.xml files plus one level of child sitemaps: bundle.social, ayrshare.com, zernio.com, upload-post.com, outstand.so, postproxy.dev, social-api.ai, postforme.dev, blotato.com, postiz.com, postpeer.dev, buffer.com, publora.com, mallary.ai, getsocialclaw.com, posteverywhere.ai. "SM n" = number of **vendors** with a dedicated URL for the term (not a ranking) | measured |
| **T** | Search results or autocomplete already recorded today in `../competitors/*.md` | measured (by sibling) |

**What this means for the "Top 5 now" column.** Only rows 1–3, 21, 31, 37 and the "best / pricing" rows have measured result
lists (W or W\*). For the other rows, the column says "not checked" and names the pages **targeting** the term (SM). That
shows who competes, not who ranks. A follow-up turn with fresh search budget should fill these in. The rows to run first are
marked ▲.

**Demand** is always **inferred**, because no volume tool exists. It is graded from autocomplete depth, how many vendors build
pages for the term (vendors only build these pages when they see traffic), and the W\* evidence. Reddit stayed unreadable
(WebSearch refuses reddit.com; the teardowns record 403s), so no thread counts.

**Winnability** (inferred; same scale as `head-unified.md`):
- *weeks*: a strong exact-match page can enter the Bing/DDG top 10 within weeks of indexing. The sibling sweep measured
  2026 domains holding DDG #1–3.
- *months*: 2–6 months, with internal links and a few mentions.
- *long-term*: 6–12+ months on Google, because review aggregators and old vendor pages hold the top.
- *unlikely*: the brand owner wins, or the intent does not fit what Siar can truthfully offer.

Siar has **no** `/compare/*` or `/guides/*` URL today. Its sitemap (`https://siaran.my/sitemap-0.xml`, 89 URLs, fetched
2026-11-12) has `/`, `/pricing`, `/platforms`, `/features`, 15 `/<network>-api` pages, 8 `/use-cases/*` and `/docs/*`.

### Price anchors used in this file (vendor's own pages, checked 2026-11-12)

These matter for the "cheapest" and "pricing" rows. Every comparison page must re-check them on the day it ships.

| Vendor | Entry price and unit | Source |
|---|---|---|
| Ayrshare | Premium $149/mo for 1 profile; Launch $299 for up to 10; Business from $599 for 30. "Ayrshare does not have a free plan, but its Launch plan includes a 28-day free trial" | https://www.ayrshare.com/pricing/ and https://www.ayrshare.com/compare/ (measured in `../competitors/ayrshare.md`) |
| Zernio (ex-Late) | Billed per connected account: accounts 1–2 free, 3–10 at $6/mo each, 11–100 at $3, 101+ at $1. Their examples: 10 accounts $48/mo, 100 accounts $318/mo | https://zernio.com/pricing.md (measured by me) |
| Outstand | "Pay as you go" $19/mo with 3,000 posts, then $0.007 up to 10,000 and $0.005 above. Business $129 with 50,000, then $0.005. "Connected social accounts are unlimited and free on every plan"; unlimited team members; no brand or workspace limit stated. "Outstand is not free and has no permanently free tier" | https://www.outstand.so/pricing.md, "Last updated 2026-11-11" (re-checked 2026-11-12) |
| bundle.social | Free $0, 20 posts per month and 3 social accounts; Pro $100/mo (10,000 posts, 14-day trial); Business $400/mo (100,000 posts) | https://bundle.social/pricing (re-checked 2026-11-12) |
| Upload-Post | Page title "Upload-Post Pricing: Free Plan, Then $24/month (2026)" | https://www.upload-post.com/pricing/ (measured in `../competitors/upload-post.md`) |
| Siar | 20 free posts to try (one-time), then Starter RM39 / $19 (1 brand, 300 posts/mo), Pro RM99 / $49 (10 brands, 10,000 posts, 14-day trial), Business RM399 / $149 (unlimited brands, 100,000 posts). Unlimited social accounts on every plan | `../siar-truth.md` §3 |

[inferred] **Siar is not the cheapest social media API in every case.** At $19, Outstand includes 3,000 posts and Siar
Starter includes 300. For 1–2 accounts, Zernio is free. (corrected 2026-11-12) The earlier line "Siar is cheapest where
accounts are many and brands are few" was wrong: Outstand also has unlimited accounts and states no brand limit, so
100 accounts with up to 3,000 posts a month cost $19 on Outstand against $49 on Siar Pro. What the anchors do support:
- **Against per-account pricing (Zernio, Ayrshare):** 100 accounts in 10 brands is $49/mo on Siar Pro against $318/mo on
  Zernio's own example bill and $299+ on Ayrshare (Launch covers 10 profiles).
- **Against per-post pricing (Outstand):** Siar Pro ($49, 10,000 posts) is cheaper once volume passes about 7,300 posts a
  month (Outstand: $19 + $0.007 per post above 3,000 = $68 at 10,000). Siar Business ($149, 100,000 posts) against Outstand
  Business at 100,000 posts: $129 + 50,000 × $0.005 = $379.
- **Trying it free:** Siar has 20 free posts to try (one-time); Outstand has no free tier; Zernio is free for 2 accounts;
  bundle.social is free for 20 posts a month on 3 accounts.

Any "cheapest" page must say which case it means.

---

## Keyword table

Page types: **compare** = sourced, dated head-to-head page (`/compare/<vendor>`) · **hub** = `/compare` index ·
**listicle** = "best X" with a stated method · **guide** = explainer · **H2** = a section on another page · **off-site** = win it through
someone else's page · **skip** = do not build.

### A. Ayrshare (the centre of comparison demand)

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 1 | ayrshare alternatives / ayrshare alternative | Commercial | **Med** (highest in this sweep). AC 4 under "ayrshare alternative"; "alternatives" is the 2nd completion of "ayrshare a…"; 60 HN stories mention Ayrshare (W\*/head-unified) | **W (unverified on re-check, search limit):** alternativeto.net, blotato.com/blog/ayrshare-alternatives, capterra.ca, capterra.in, getapp.com.au. Below the top 5: postiz.com/alternatives/ayrshare, g2.com, sourceforge.net, stackreaction.com, bundle.social/blog/ayrshare-alternative (by Marcel Czuryszkiewicz; the page shows "August 16, 2026", corrected 2026-11-12 from "2026-03-23"), opentweet.io, changelog.zernio.com (its root returns 404 on 2026-11-12). **SM 13 vendors** have a dedicated page: bundle.social (2), zernio (2), upload-post, outstand, postproxy, social-api.ai (2), postforme, blotato (2), postiz (1 + 17 `/compare/ayrshare/*`), postpeer, getsocialclaw (2), posteverywhere, publora | Google **long-term** (aggregators plus 13 vendors); Bing **months** | compare | **NEW** `/compare/ayrshare` |
| 2 | ayrshare alternatives reddit | Commercial (wants unbiased views) | Low–med. AC (2nd completion) | **W (unverified on re-check, search limit):** alternativeto.net (2 pages), data365.co/blog/best-ayrshare-alternative, getlate.dev/blog/ayrshare-alternative (301 → zernio.com), ayrshare.com/blog/why-you-shouldnt-use-ayrshare. No Reddit thread came back | **unlikely** as a page. The searcher wants Reddit | off-site | none. Genuine, disclosed answers in Reddit threads (`docs/geo/offsite-plan.md` item 5) |
| 3 | ayrshare api alternatives | Commercial | Low–med. AC | **unverified** (corrected 2026-11-12: this was labelled W\*, but `head-unified.md` records no result list for this query and does not mention g2.com/products/ayrshare-api/competitors; that URL exists but returns 403 to scripts). [inferred] Probably the same set as row 1 | months | compare | `/compare/ayrshare` |
| 4 | ayrshare open source alternative | Commercial | Low. AC | not checked. [inferred] Postiz and Mixpost (open source) own it | **unlikely** (Siar is not open source) | skip | none |
| 5 | ayrshare free alternative | Transactional | Low. AC (under "ayrshare free") | not checked | months, partial fit: Ayrshare has no free plan [sourced above]; Siar has 20 free posts to try, one-time, not a free tier | H2 | `/compare/ayrshare` H2 "Is there a free way to try an Ayrshare alternative?" |
| 6 | ayrshare pricing ▲ | Navigational / commercial | **Med**. AC 2 (pricing, api pricing); "ayrshare p…" gives 9 incl. plans, premium, free plan, business plan (T; 10 on re-check 2026-11-12, adding "basic plan" and "ayrshare vs postiz") | not checked; [inferred] ayrshare.com/pricing is #1. **SM 3 rivals** run dedicated "Ayrshare pricing" pages: upload-post.com/ayrshare-pricing, blotato.com/blog/ayrshare-pricing, social-api.ai/blog/ayrshare-pricing-social-media-api-2026 | **unlikely** for #1; **months** for a top-5 explainer slot | H2 | `/compare/ayrshare` H2 "Ayrshare pricing (checked <date>)" + `/guides/social-media-api-pricing` |
| 7 | ayrshare api pricing | Commercial | Low–med. AC | not checked; same set as row 6 | months | H2 | as row 6 |
| 8 | ayrshare cost | Informational | Low. AC 1 | not checked | months | H2 | as row 6 |
| 9 | ayrshare free plan / ayrshare free trial | Navigational | Low–med. AC 4 under "ayrshare free" | not checked; [inferred] Ayrshare's own page | **unlikely** | H2 (FAQ) | `/compare/ayrshare` FAQ: "Ayrshare does not have a free plan… 28-day free trial" with source |
| 10 | ayrshare competitors | Commercial | Low. AC 1 (itself only) | not checked; [inferred] the same aggregator set as row 1 | long-term | hub | **NEW** `/compare` |
| 11 | ayrshare reviews | Navigational | Low. AC | not checked. SM: Ayrshare runs its own /blog/ayrshare-reviews | **unlikely**. Siar has no reviews to offer and must not invent any | skip | none |
| 12 | zernio vs ayrshare / ayrshare vs zernio | Commercial | Low–med. AC ("zernio vs ayrshare" is a completion of "ayrshare vs") | not checked. SM 4: ayrshare.com/compare/ayrshare-vs-zernio, postiz.com/compare/ayrshare/zernio, upload-post.com/ayrshare-vs-zernio-vs-blotato, postpeer.dev/blog/ayrshare-vs-zernio-vs-postpeer | months, as a "third option" page | H2 | `/compare/ayrshare` + `/compare/zernio` |
| 13 | ayrshare vs late | Commercial (old brand) | Low. No AC measured | W (row 2 results) included sourceforge.net/software/compare/Ayrshare-vs-Late | months; shrinking (Late is now Zernio) | H2 | `/compare/zernio` |
| 14 | ayrshare vs postiz | Commercial | Low–med. AC (2nd completion of "ayrshare vs") | not checked. SM: blotato.com/blog/postiz-vs-ayrshare, ayrshare.com/compare/postiz-api-alternative, getsocialclaw.com/blog/socialclaw-vs-ayrshare (adjacent) | months | H2 | `/compare/postiz` |
| 15 | ayrshare vs upload-post | Commercial | Low. No AC | not checked. SM: postiz.com/compare/ayrshare/upload-post, ayrshare.com/compare/upload-post-api-alternative, upload-post.com/ayrshare-alternative | months | H2 | `/compare/upload-post` |
| 16 | ayrshare vs buffer | Commercial | Low. No AC | W (row 1 results) included postiz.com/compare/ayrshare/buffer | months | H2 | `/compare/buffer-api` |
| 17 | ayrshare vs hootsuite | Commercial | Low. No AC | not checked. SM: ayrshare.com/compare/hootsuite-api-alternative | months | H2 | `/compare/hootsuite-api` |
| 18 | ayrshare vs bundle.social | Commercial | Low. No AC ("bundle.social vs" returns only unrelated "social bundle vs data bundle") | not checked. SM: ayrshare.com/compare/bundle-social-api-alternative, bundle.social/ayrshare-alternative | months | compare | **PARKED** (bundle.social naming decision) |
| 19 | ayrshare alternative for agencies | Commercial | Low. AC 0 for "ayrshare alternative for" | not checked. SM: social-api.ai/blog/best-ayrshare-alternative-agencies-2026 | weeks–months (one page targets it) | H2 | `/compare/ayrshare` H2 "For agencies: billed per organization, not per profile" |
| 20 | cheaper ayrshare alternative / ayrshare too expensive | Commercial | Low. No AC. Price is the most common Ayrshare complaint in rival pages (T; third-party, **unverified** at source) | not checked. [inferred] The price-led headlines of row 1's vendors: upload-post.com/ayrshare-alternative "$24/mo vs $149/mo"; bundle.social/ayrshare-alternative "Stop paying a $149 monthly floor before your first customer" (both confirmed at the URL 2026-11-12; corrected from the paraphrase "no $149 profile minimum", which is not on the page) | months | H2 | `/compare/ayrshare`, with a worked example from the price anchors |

### B. bundle.social (all parked)

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 21 | bundle.social alternative / bundle social alternatives | Commercial | Low. AC: "bundle social alternative" → "bundle social alternatives", then off-topic | W\*: getapp/capterra (several), alternativeto.net, ayrshare.com/compare/bundle-social-api-alternative, bundle.social/alternatives, changelog.zernio.com. **SM 6 vendors:** zernio.com/alternatives/bundle, upload-post.com/bundle-social-alternative, postproxy.dev/compare/bundle-social, blotato.com/blog/bundle-social-alternatives (+ blotato-vs-bundle-social), postpeer.dev/alternatives/bundle-social, ayrshare | months | compare | **PARKED** `/compare/bundle-social` |
| 22 | bundle.social pricing | Navigational | Low–med. AC (2nd completion) | not checked | unlikely | none | PARKED |
| 23 | bundle social api | Navigational | Low–med. AC | not checked; [inferred] the brand | unlikely for the term | guide | PARKED. When the decision clears, the strongest page is a migration guide (row 26) |
| 24 | bundle social reviews / bundle social reddit / bundle social status | Navigational | Low. AC | not checked | unlikely | skip | none |
| 25 | bundle.social vs zernio / vs upload-post | Commercial | Low. No AC | not checked. SM: zernio.com/alternatives/bundle, upload-post.com/bundle-social-alternative | months | H2 | PARKED |
| 26 | switch from bundle.social / bundle.social migration | Informational / transactional | Not observed (inferred: tiny now, grows if bundle.social changes price or terms) | not checked | **weeks** once named: Siar is the only vendor that can truthfully say "same paths, change the base URL" (`siar-truth.md` §4) | guide | PARKED **NEW** `/guides/migrate-from-bundle-social` |

### C. Late / Zernio

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 27 | late alternative | Ambiguous | High volume, wrong intent. AC: "late alternative word", "…crossword", "later alternatives" | not checked | **unlikely** (a generic word; Zernio renamed itself over this) | skip | none |
| 28 | late api alternative | Commercial | Low. AC 0 | not checked | months | H2 | `/compare/zernio` ("formerly Late" in the intro) |
| 29 | getlate alternative / getlate.dev alternative | Commercial | Very low. AC: "getlate alternative" → only "getdate alternative" | not checked. SM: bundle.social/getlate-alternative, bundle.social/blog/getlate-alternative | weeks, but the term is fading (getlate.dev has 301'd to zernio.com since March 2026, T) | H2 | `/compare/zernio` |
| 30 | late api / late api social media / late api pricing | Navigational (old brand) | Med. AC 10 under "late api" | not checked; getlate.dev URLs still showed in W\* results (index lag, inferred) | **unlikely** | H2 mention | `/compare/zernio` |
| 31 | zernio alternative / zernio api alternative ▲ | Commercial | Low–med. AC 3; "zernio" AC 10 incl. alternative | W\*: alternativeto.net, bundle.social/zernio-alternative, postiz.com, producthunt.com, postproxy.dev/compare/zernio. **SM 10 vendors:** bundle.social (2), upload-post, postproxy, social-api.ai, postforme, blotato, postpeer (2), getsocialclaw, ayrshare, mallary (4 pages) | months | compare | **NEW** `/compare/zernio` |
| 32 | zernio pricing | Navigational | Low–med. AC | not checked. SM: mallary.ai/alternatives/zernio-pricing | unlikely for #1 | H2 | `/compare/zernio` + `/guides/social-media-api-pricing` (per-account vs per-organization) |
| 33 | zernio vs blotato / blotato vs zernio | Commercial | Low. AC (1st completion of "zernio vs"; also under "blotato vs") | not checked. SM: blotato.com/blog/blotato-vs-zernio, postiz.com/compare/blotato/zernio | months, but Siar is in neither name | skip | none (a pair Siar is not part of) |
| 34 | zernio vs postiz / postiz vs zernio | Commercial | Low. AC both ways | not checked. SM: zernio.com/alternatives/postiz, postiz.com/compare/buffer/zernio (adjacent) | as row 33 | skip | none |
| 35 | zernio vs metricool / zernio reviews | Commercial / nav | Low. AC | not checked | unlikely | skip | none |

### D. Upload-Post

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 36 | upload-post alternative / upload post alternative ▲ | Commercial | Low–med. AC 5 (free alternative, api alternative); "upload-post" AC 10 incl. alternative | W\*: alternativeto.net, ayrshare.com/compare/upload-post-api-alternative, info.bundle.social, bundle.social/blog, blotato.com. **SM 9 vendors:** bundle.social (2), zernio, social-api.ai, postforme, blotato, postiz, postpeer, ayrshare, mallary (4) | months | compare | **NEW** `/compare/upload-post` |
| 37 | upload post free alternative | Transactional | Low. AC | not checked | months, partial fit (one-time Free) | H2 | `/compare/upload-post` |
| 38 | upload post api alternative | Commercial | Low. AC | not checked; as row 36 | months | compare | `/compare/upload-post` |
| 39 | upload-post pricing / upload-post api pricing | Navigational | Low–med. AC 2 | not checked; [inferred] upload-post.com/pricing, plus mallary.ai/alternatives/upload-post-pricing (SM) | unlikely for #1 | H2 | `/compare/upload-post` |
| 40 | upload post vs blotato / blotato vs upload post | Commercial | Low. AC (1st completion of "upload post vs") | not checked. SM: blotato.com/blog/blotato-vs-upload-post, postiz.com/compare/blotato/upload-post | Siar is in neither name | skip | none |

### E. Buffer API

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 41 | buffer api alternative ▲ | Commercial | Low. AC: completes only to "buffer alternative with api" and "buffer free alternative" | not checked. **SM 6 vendors:** ayrshare.com/compare/buffer-api-alternative, outstand.so/buffer-api, postproxy.dev/blog/what-happened-to-buffer-api-alternatives-for-developers (2026-02-25), zernio.com/blog/buffer-api + /blog/buffer-alternative-for-developers, publora.com/blog/publora-vs-buffer-api-first, posteverywhere.ai/blog/migrate-from-buffer-api-to-posteverywhere. T adds postzen.dev and blog.dohoo.ai | **months** | compare | **NEW** `/compare/buffer-api` |
| 42 | buffer alternative with api | Commercial | Low. AC (1st completion of "buffer alternative with"; also under "buffer alternative", T) | not checked; as row 41 | months | compare | `/compare/buffer-api` |
| 43 | does buffer have an api | Informational | Low–med. AC (itself) | not checked. T: Ayrshare targets it | months | H2 (answer first: yes. Buffer launched a public GraphQL API on 2026-05-27; it acts on Buffer accounts only, your own or other Buffer users' through an app, every end user needs a Buffer account and pays Buffer per channel, and there is no API call to connect a social account; the legacy REST API retires 2027-02-01. Per `../competitors/buffer.md`, sourced to buffer.com/resources/buffer-api-is-here and developers.buffer.com. Corrected 2026-11-12 from "automates Buffer's own accounts", which left out third-party apps) | `/compare/buffer-api` |
| 44 | buffer api pricing | Commercial | Low–med. AC (3rd completion of "buffer api") | not checked | months for an explainer slot | H2 | `/compare/buffer-api` |
| 45 | buffer api key / token / access / docs | Navigational | Med. AC | W\*: the "buffer api" SERP mixes in Node.js `Buffer` pages | **unlikely** (the searcher wants Buffer's docs) | skip | none |
| 46 | buffer api n8n | Informational | Low. AC | not checked | months | H2 | `/guides/n8n-social-media-posting` (proposed in head-unified) |
| 47 | what happened to buffer api / buffer api deprecated | Informational | Low. AC 0 for "buffer api deprecated", but 2 rivals wrote "what happened" posts (postproxy, Ayrshare per T) | not checked | months | H2 | `/compare/buffer-api`. Check the current state in `buffer.md` before writing it |

### F. Hootsuite and Sprout Social APIs

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 48 | hootsuite api alternative ▲ | Commercial | Low. AC 0 (also 0 for "hootsuite for developers", T) | not checked. **SM 5 vendors:** ayrshare.com/compare/hootsuite-api-alternative, outstand.so/hootsuite-api, postproxy.dev/blog/hootsuite-api-alternative-lightweight-publishing-apis, zernio.com/blog/hootsuite-api-alternative (+ /hootsuite-alternative-api), publora.com/blog/publora-vs-hootsuite-api-first | **weeks–months** (low demand, thin field) | compare | **NEW** `/compare/hootsuite-api` |
| 49 | hootsuite api pricing | Commercial | Low–med. AC (2nd completion of "hootsuite api") | not checked | months. This is the real wedge: "Access to the Hootsuite REST APIs is free" (https://developer.hootsuite.com/docs/faq, checked 2026-11-12), but it needs approved developer access and works on Hootsuite accounts, which are sold per user, from $99 per user/month on Standard (hootsuite.com/plans, checked 2026-11-12). Corrected 2026-11-12: the vendor does not say "needs a seat plan"; the seat cost is [inferred] from the API acting on Hootsuite accounts | H2 | `/compare/hootsuite-api` |
| 50 | hootsuite api access / does hootsuite have an api | Informational | Low–med. AC (both) | W\* ("hootsuite api"): activepieces.com, silicon.co.uk, supergood.ai, hootsuite.com newsroom, apievangelist.com | months | H2 | `/compare/hootsuite-api` |
| 51 | hootsuite alternative api / hootsuite alternative for developers | Commercial | Low. AC 0 ("hootsuite alternative for" → small business, nonprofits, individuals) | not checked. SM: zernio.com/blog/hootsuite-alternative-api | weeks–months | H2 | `/compare/hootsuite-api` |
| 52 | hootsuite alternatives (generic) | Commercial | **High**. AC (free, reddit, small business, open source, 2026; T) | not checked. T: Sprout, SMB schedulers, recurpost. SM: bundle.social, upload-post, zernio, blotato, posteverywhere, getsocialclaw, mallary and publora all have pages | **unlikely** (end-user scheduler intent; very high-authority field) | skip | none |
| 53 | sprout social api alternative | Commercial | Low. "sprout social api" AC 10; no "alternative" completion | not checked. SM 3: ayrshare.com/compare/sprout-social-api-alternative, zernio.com/blog/sprout-social-api-alternative, social-api.ai/blog/sprout-social-api | months | compare | **NEW** `/compare/sprout-social-api` |
| 54 | sprout social api pricing / sprout social api access | Commercial | Low–med. AC | not checked | months. Sourced fact for the page: "Only posts created in draft status are supported at this time" (https://api.sproutsocial.com/docs/, checked 2026-11-12); the API is on the Advanced plan, $399 per seat per month (https://sproutsocial.com/pricing/, checked 2026-11-12; billed annually per `hootsuite-sprout.md`) | H2 | `/compare/sprout-social-api` |
| 55 | sprout social cheaper alternative | Commercial | Low–med. AC (under "sprout social alternative", T) | not checked | long-term; SMB intent | skip | none |
| 56 | hootsuite / social media management price malaysia | Commercial | Low. `gl=my`: "hootsuite malaysia" returns only itself; "social media management malaysia" → "…price malaysia" (T) | not checked; head-unified says the MY scheduler SERP is weak | weeks–months | landing | **NEW** `/malaysia` (proposed in head-unified): ringgit, FPX/DuitNow yearly |

### G. Other API vendors

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 57 | postiz alternative | Commercial | Low–med. AC 4 (open source, reddit, self hosted) | not checked. T saw postfa.st, blotato, outstand, posteverywhere, ryandoser.com, maevesocial, postjay, zernio, postplanify, mallary, socialk.it. SM: bundle.social, zernio, upload-post, outstand, blotato, postpeer, getsocialclaw (4), mallary (4) | long-term (crowded; much of it is self-host intent) | compare | **NEW** `/compare/postiz` (frame: "hosted API instead of self-hosting") |
| 58 | postiz api / postiz api pricing / postiz api rate limit | Commercial | Low–med. AC 10 under "postiz api" | not checked. SM: getsocialclaw.com/postiz-api-alternative, ayrshare.com/compare/postiz-api-alternative | months | H2 | `/compare/postiz` (rate-limit H2: Siar's limits are 100/s, 500/10 s, 2,000/min per key and endpoint, `siar-truth.md`) |
| 59 | blotato alternative(s) / blotato api alternative | Commercial | Low–med. AC 5 incl. "blotato api alternative", "…reddit", "…open source" | not checked. SM 10: bundle.social, zernio (2), upload-post, ayrshare (blotato-api-alternative), postpeer, getsocialclaw (2), posteverywhere, mallary (4), postproxy | months | compare | later: **NEW** `/compare/blotato` |
| 60 | outstand alternative / outstand api alternative | Commercial | Low. AC `gl=my` "outstand alternative" (T); "outstand" in `gl=us` drowns in "outstanding" | not checked. SM 6: ayrshare, zernio (blog), upload-post, postpeer, getsocialclaw (2), postproxy | months | compare | later: **NEW** `/compare/outstand`. It must say plainly that Outstand includes more posts for $19 (price anchors) |
| 61 | publer api alternative / publer api pricing | Commercial | Low–med. AC 10 under "publer api" incl. pricing, docs | not checked. SM 3: ayrshare.com/compare/publer-api-alternative, getsocialclaw.com/blog/publer-api-alternative-for-embedded-saas, postproxy.dev/compare/publer | months | compare | **NEW** `/compare/publer-api` (Publer: "The Publer API is available exclusively to Business and Enterprise customers", https://publer.com/docs, checked 2026-11-12; corrected from "its Business plan") |
| 62 | metricool api alternative / metricool api pricing | Commercial | Low–med. AC 10 under "metricool api" incl. pricing, claude, n8n | not checked. SM 1: ayrshare.com/compare/metricool-api-alternative | **weeks–months** (one rival page) | compare | **NEW** `/compare/metricool-api` (API on Advanced, up to 15 brands: $53/mo billed yearly or $67 monthly, https://metricool.com/pricing/, re-checked 2026-11-12) |
| 63 | later api alternative | Commercial | Low. AC "later api" → documentation, key | not checked. SM 1: ayrshare.com/compare/later-api-alternative | weeks–months, low value | H2 | `/compare` hub |
| 64 | socialpilot api alternative | Commercial | Low. AC "socialpilot api" 3 | not checked. SM 2: ayrshare, zernio (blog) | weeks–months, low value | H2 | `/compare` hub |
| 65 | loomly api alternative | Commercial | Very low. No AC measured | not checked. SM 2: ayrshare, zernio (blog) | low value | H2 | `/compare` hub |
| 66 | postproxy alternative | Commercial | Very low. AC "postproxy" 4 (api, pricing, mcp; no alternative) | not checked. SM 3: ayrshare, postpeer, blotato | low value | H2 | `/compare` hub |
| 67 | post for me alternative | Commercial | Very low. The brand name is noisy in AC (T) | not checked. SM 4: upload-post, postpeer, blotato, postproxy | low value | H2 | `/compare` hub |
| 68 | mixpost alternative | Commercial | Low. AC 3 (open source, free) | not checked. T: 10+ vendors | months; much of it is self-host intent | compare | later: `/compare/mixpost` (`mixpost.md`) |
| 69 | publora / mallary / socialclaw alternative | Commercial | Very low. Brand AC only, no alternative completions | not checked | not worth a page | skip | none |

### H. Best, cheapest, pricing and "vs" concept terms

| # | Keyword | Intent | Demand (evidence) | Top 5 now / who targets it | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 70 | best social media api | Commercial | **Med**. AC 2 ("best social media api", "best social media posting api") | W\*: buffer.com/resources, blotato.com, dev.to, octolens.com, upload-post.com (vendor listicles that rank themselves first). **SM 13 vendor listicles:** bundle.social, ayrshare, upload-post, social-api.ai (2), blotato, postpeer, mallary, getsocialclaw, posteverywhere, postproxy, publora, buffer | **long-term** | listicle | **NEW** `/guides/best-social-media-apis` |
| 71 | best social media api 2026 / best social media apis 2026 | Commercial | Med (the dated form of row 70). AC 0 for the year phrase, but 3 vendors put the year in the slug: social-api.ai/blog/best-social-media-apis-2026, publora…-2026, mallary.ai/blog/10-best-social-media-apis-for-developers-in-2026. Ayrshare's roundup is already titled "(2027)" (T) | not checked; as row 70 | long-term | listicle with a visible "checked" date and a stated method | `/guides/best-social-media-apis` (put the year in the title, not the URL) |
| 72 | best social media apis for developers | Commercial | Low–med (corrected 2026-11-12 from "Med"). AC 0 on re-check 2026-11-12; T had recorded a completion. The W\* list came from the non-"best" query "social media apis for developers" | W\*: buffer.com/resources, blotato.com, dev.to, octolens.com, upload-post.com. SM: getsocialclaw, mallary | months | listicle | same |
| 73 | best social media posting api | Commercial | Low–med. AC | W\*: same cluster, plus postpeer.dev/blog/best-social-media-posting-apis | months | H2 | same |
| 74 | best social media scheduling api | Commercial | Low. AC 0 | W\* (for "social media scheduling api", not this exact query): ayrshare.com/blog/best-social-media-posting-and-scheduling-apis, opus.pro, getlate.dev/blog. SM: postproxy.dev/blog/best-social-media-scheduling-apis-compared | months | H2 | same |
| 75 | best unified social media api | Commercial | Low. AC 0 | not checked | months | H2 | same |
| 76 | best social media api for ai agents | Commercial | Low–med, rising. AC "social media api for ai agents" (W\*) | not checked. SM: publora.com/blog/best-social-media-api-for-ai-agents-2026 | months | H2 | same + `/use-cases/social-media-api-for-ai-agents` |
| 77 | best social media mcp server / best mcp server for social media content | Commercial | Low–med. AC 1 | not checked. SM: upload-post.com/best-social-media-mcp-servers, getsocialclaw.com/blog/best-social-media-mcp-servers | months; **blocked** until `@siar/mcp` is on npm (no install command) | H2 | `/social-media-mcp-server` (head-unified; blocked) |
| 78 | cheapest social media api ▲ | Commercial | Low. AC 0. But 2 vendors built pages for it | not checked. **SM 2 only:** getsocialclaw.com/blog/cheapest-social-media-api, social-api.ai/blog/cheapest-social-media-api-inbox-2026 | **weeks–months** (thinnest field in this sweep), **but only with an honest answer**: Siar is not cheapest for 1–2 accounts (Zernio) or below about 7,300 posts a month (Outstand, which also has unlimited accounts); Siar Pro is cheaper than Outstand above that and cheaper than per-account APIs at many accounts (price anchors, corrected 2026-11-12) | guide | `/guides/social-media-api-pricing` H2 "Which social media API is cheapest? It depends on accounts vs posts", with three worked scenarios |
| 79 | cheap social media api / affordable social media api | Commercial | Very low. AC 0 for both | not checked | weeks–months | H2 | same |
| 80 | social media api pricing | Commercial | **Med**. AC 7 | W\* (cost query): socialdata.tools, contentstudio.io, getphyllo.com, glama.ai, ayrshare.com/pricing.md; zernio.com/blog/social-media-api-pricing also ranks. SM: zernio (2: social-media-api-pricing, pay-per-account-pricing), social-api.ai/blog/social-media-api-pricing-2026, upload-post.com/pricing-comparison | months | guide | **NEW** `/guides/social-media-api-pricing` (GEO plan P3) |
| 81 | social media api pricing comparison / social media api comparison | Commercial | Low. AC 0 for both | not checked. SM: upload-post.com/pricing-comparison | weeks–months | guide (table) | same |
| 82 | social media api pay per account / per account pricing | Informational | Low. No AC | not checked. SM: zernio.com/blog/pay-per-account-pricing | weeks–months | H2 | same (Siar is a third model: per organization) |
| 83 | x api alternative / twitter api alternative | Commercial | Med. AC 4–5 (reddit, free, "twitter api io alternative") | not checked. SM: bundle.social/x-api + /apitwitter-alternative, zernio.com/blog/x-api-cheaper-alternative + /alternatives/apitwitter | **unlikely**. The intent is cheaper X access or scraping. Siar passes X through at X's own price, so it is not cheaper | skip | `/x-api` keeps its pass-through explanation |
| 84 | x api pricing / twitter api pricing | Informational | Med–high (inferred). AC 10 for "x api pricing" on 2026-11-12 (tiers, plans, free tier, reddit, 2026, pay as you go); 4 API vendors wrote pages | not checked. SM: bundle.social/blog/x-api-pricing-2026-costs-limits, zernio.com/blog/twitter-api-pricing, upload-post.com/x-api-pricing, postproxy.dev/blog/x-api-pricing-2026 | months | H2 | `/x-api` H2. Siar's `X_PRICES` match X's page (`siar-truth.md`). Read X's terms first (`ayrshare.md` §8 note) |
| 85 | instagram graph api alternative / youtube api alternative | Commercial | Low. No AC run | not checked. SM: zernio.com/blog/instagram-graph-api-alternative, /youtube-api-alternative; mallary.ai/blog/instagram-api-alternative | months | H2 | `/instagram-api`, `/youtube-api` (YouTube with the private-upload qualifier) |
| 86 | linkedin community management api alternative | Commercial | Low. No AC run | not checked. SM: zernio.com/blog/linkedin-community-management-api-alternative | **unlikely**. Siar's own LinkedIn Pages access was denied | skip | none |
| 87 | social media api vs social media management tool | Informational | Low. No AC run | not checked. SM: postproxy.dev/blog/social-media-apis-vs-management-tools-when-to-use-which, getsocialclaw.com/blog/social-media-scheduler-api-vs-social-media-management-tool | weeks–months | H2 | `/guides/best-social-media-apis` (intro H2) |
| 88 | build vs buy social media api / in-house vs unified api | Informational | Low. No AC run | not checked. SM: bundle.social/blog/social-media-api-startups-build-vs-buy, postproxy.dev/blog/building-social-media-publishing-in-house-vs-unified-api | months | guide | `/guides/social-media-api-integration` (head-unified). The `docs/approvals/` pack is first-hand evidence of the app-review cost |
| 89 | mcp vs api for social media posting | Informational | Very low | not checked. SM: getsocialclaw.com/blog/mcp-vs-api-vs-zapier-ai-agent-posting | low value | skip | none |
| 90 | social media api alternatives (generic) | Commercial | Very low. AC 0 for "social media api alternative" | not checked. SM: bundle.social/alternatives, social-api.ai/alternatives, postpeer.dev/alternatives, postiz.com/alternatives, mallary.ai/alternatives, ayrshare.com/compare, postproxy.dev/compare, postforme.dev/compare, getsocialclaw.com/compare, zernio.com/compare, buffer.com/compare | months | hub | **NEW** `/compare` |

---

## Who writes the pages that rank

[measured from W, W\*, SM and T; the labels inside each point say what is measured and what is inferred]

1. **Review aggregators hold the Google top 5 for brand-alternative terms.** For "ayrshare alternatives" the top 5 is
   alternativeto.net, one vendor blog (Blotato), then the Capterra/GetApp country sites [measured once by W; **unverified
   on re-check 2026-11-12**: no search budget]. The same Ayrshare product IDs (213297 on Capterra, 2061418 on GetApp)
   appear on 15+ country domains, so it is one directory network [measured once from result URLs; **unverified on
   re-check**: Capterra, GetApp and AlternativeTo return 403 to scripts].
   G2, SourceForge/Slashdot, StackReaction and Software Advice fill the next places. For "bundle.social alternative" and
   "upload-post alternative" (W\*), alternativeto.net is #1 again. **Siar is listed on none of them** [inferred: no listing
   found in any result]. `docs/geo/offsite-plan.md` names G2 but not AlternativeTo, Capterra/GetApp or SourceForge.
2. **Everything else is rival vendors, mostly at programmatic scale** [measured, SM]:
   - Postiz: 630 `/compare/*` URLs, of which 613 are `/compare/<a>/<b>` pair pages and 17 are single-brand pages, plus 44
     `/alternatives/*` (re-counted 2026-11-12; corrected from "630 pair pages")
   - Blotato: 112 "alternatives" and "vs" posts
   - Posteverywhere: 42 alternatives posts
   - Mallary: 37 pages (alternatives, pricing, reviews for each rival)
   - Getsocialclaw: 33 pages
   - Upload-Post: 26 alternatives pages
   - Ayrshare: 25 `/compare/*` pages
   - Zernio: 24 `/alternatives/*` plus 23 alternative posts
   - bundle.social: 22 alternatives pages

   Each page ranks its own author first. Re-counted 2026-11-12 from the sitemaps and matching: Ayrshare 25, Zernio 24
   `/alternatives/*`, Upload-Post 26, bundle.social 22 (plus the `/alternatives` index), Mallary 37, Posteverywhere 42.
   Blotato and Getsocialclaw were not re-counted (Blotato's sitemap is at `/sitemap-index.xml`; Getsocialclaw's count
   depends on which URLs are classed as comparison pages).
3. **No neutral publisher was found.** The independent-looking pages are an affiliate-style review (ryandoser.com), a Medium
   post by Frank Heijdenrijk, a data-API vendor (data365.co) and tool vendors (opentweet.io, shortsync.app)
   [measured once: W; not re-checked]. Corrected 2026-11-12: Frank Heijdenrijk is not neutral either. He is co-founder
   and CMO of WoopSocial, a social media tool ("Co-founders: Frank Heijdenrijk (CMO), Attila Kun (Technical Co-founder)",
   https://woopsocial.com/llms.txt, checked 2026-11-12).
4. **Every vendor targets Ayrshare.** 13 of the 16 sitemaps have an Ayrshare alternative or comparison page. Zernio (10) and
   Upload-Post (9) come next. Then bundle.social (6), Buffer API (6), Hootsuite API (5), Sprout API (3) and Metricool API (1) [measured, SM].

## What this sweep tells us

1. **Comparison demand is mostly Ayrshare, and Google's top 5 belongs to directories.** "ayrshare alternatives" is the only
   term here with medium demand on the evidence. A new `/compare/ayrshare` page is a months job on Bing and a long-term job
   on Google [inferred]. The faster way into that result list is a **listing on AlternativeTo, Capterra/GetApp, G2 and
   SourceForge that names Ayrshare as the product it replaces**, because those pages are the result list [inferred from W].
   Add them to the off-site plan. Use real facts only: no reviews, no ratings.
2. **The best openings are API-of-a-dashboard terms with thin fields:** "hootsuite api alternative/pricing" (5 rival pages),
   "metricool api alternative/pricing" (1), "publer api alternative/pricing" (3), "sprout social api alternative" (3),
   "buffer api alternative" / "buffer alternative with api" (6). Each has autocomplete evidence on the "[brand] api pricing/access"
   side. Each has a measured, sourced weakness Siar can state, such as seat plans, gated plans, or drafts only (teardowns).
   Each is a **weeks–months** target [inferred].
3. **"Cheapest social media API" has the thinnest field (2 pages), but Siar cannot claim it.** Outstand includes 3,000 posts for
   $19 with unlimited accounts. Siar Starter includes 300. Zernio is free for 1–2 accounts [sourced]. The page that can win is
   an honest explainer by scenario inside `/guides/social-media-api-pricing`. Siar's real advantages there (corrected
   2026-11-12; "many accounts, few brands" alone does not beat Outstand): against per-account APIs, 100 accounts in 10 brands
   is $49/mo on Siar Pro against $318 on Zernio's own example; against Outstand, Siar Pro is cheaper above about 7,300 posts a
   month ($49 vs $68 at 10,000) [sourced + inferred arithmetic]. Do not use a "cheapest" headline.
4. **"X vs Y" pairs Siar is not in are an arms race. Do not join it.** Postiz has 630 pair pages, and the autocompleted pairs
   (zernio vs blotato, postiz vs zernio, upload post vs blotato, ayrshare vs postiz) are all rival-against-rival. Catch the
   pairs that involve one brand as H2s on that brand's `/compare/<brand>` page ("Ayrshare vs Zernio vs Siar") [inferred].
5. **"Best social media API (2026)" needs a listicle, and every competitor already has one that ranks itself first.** Siar's
   version should have a stated method and per-vendor source links, and its own row should hold only truth-file facts
   (open networks listed, TikTok/Pinterest/LinkedIn pages "opening after approval"). It should also not rank Siar #1.
   It is a long-term bet [inferred]. W\* showed Buffer, Blotato, dev.to, Octolens and Upload-Post in the top 5 (unverified on
   re-check 2026-11-12).
6. **Traps, do not build:**
   - "late alternative" (dictionary noise)
   - "ayrshare open source alternative"
   - "x/twitter api alternative" (Siar charges X's own price, so it is not cheaper)
   - "linkedin community management api alternative" (Siar's own Pages access was denied)
   - generic "hootsuite alternatives" (SMB scheduler field)
   - "ayrshare reviews" (Siar has none to offer)
   - "ayrshare alternatives reddit" (answer on Reddit instead)
7. **bundle.social terms stay parked, and they have the one unique win.** The demand for "bundle.social alternative" is low
   and already covered by 6 rivals. But "switch from bundle.social" is a term only Siar can answer truthfully
   (same v1 paths; 194 of 194 operations from the 2026-10-11 spec present, 3 newer ones missing, `siar-truth.md` §4).
   Build it the day Fakhrul lifts the naming hold, phrased "compatible with the v1 API as of October 2026".
8. **Measurement gap:** only 2 live result lists were captured in this sweep (the search limit), and the 2026-11-12
   verification pass could re-run none (same limit). So the "Top 5" column for most rows names who **targets** a term, not
   who **ranks**, and the W/W\* lists that exist are single, unrepeated measurements. The ▲ rows (6, 31, 36, 41, 48, 78) are the ones to check first
   in a follow-up turn.

### Suggested pages, in order (inferred; each needs Fakhrul's go on comparison pages, `owner-todo.md`)

| Priority | Page | Rows |
|---|---|---|
| P1 | **NEW** `/compare/ayrshare` (pricing H2, free-trial FAQ, agencies H2, "Ayrshare vs Zernio vs Siar" H2) | 1, 3, 5–9, 12, 19, 20 |
| P1 | **NEW** `/guides/social-media-api-pricing` (per account vs per post vs per organization; honest "cheapest" scenarios) | 6, 32, 78–82 |
| P1 | Off-site: AlternativeTo, Capterra/GetApp, G2, SourceForge listings (Siar's real facts, Ayrshare named as the product replaced) | 1, 2, 21, 36 |
| P2 | **NEW** `/compare/hootsuite-api`, `/compare/buffer-api`, `/compare/sprout-social-api` | 41–51, 53–54 |
| P2 | **NEW** `/compare/metricool-api`, `/compare/publer-api` | 61, 62 |
| P2 | **NEW** `/compare/zernio`, `/compare/upload-post` | 12–15, 28–32, 36–39 |
| P3 | **NEW** `/guides/best-social-media-apis` (method stated, sources per row, dated) | 70–77, 87 |
| P3 | **NEW** `/compare` hub, linking every compare page | 10, 63–67, 90 |
| Later | `/compare/postiz`, `/compare/outstand`, `/compare/blotato`, `/compare/mixpost` | 57–60, 68 |
| Hold | `/compare/bundle-social`, `/guides/migrate-from-bundle-social` (naming decision) | 18, 21–26 |

Every compare page needs the competitor's own URL and "checked <date>" beside each fact, and must say where the competitor
wins (GEO plan P3 rule).
