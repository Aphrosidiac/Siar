# Siar keyword map

Checked 2026-11-12. This is the single keyword map for siaran.my: one cluster = one page. It deduplicates and merges the
seven keyword sweeps in `research/keywords/`, the live-site inventory in `research/current-site.md`, the truth inventory
`research/siar-truth.md`, the competitor teardowns in `research/competitors/` and the market files in `research/market/`.
It builds on `docs/geo/plan.md` (P3 comparison and pricing pages), `docs/geo/offsite-plan.md` and `docs/geo/prompts_v1.csv`,
and does not redo them.

Every page proposed here needs Fakhrul's go before it is deployed. Every Siar claim on these pages must match
`research/siar-truth.md`.

---

## 0. How to read this

### Labels

- **[measured]**: seen by a sweep on 2026-11-12 (autocomplete, a result page, a sitemap, the live site or the code).
- **[sourced]**: a vendor's own page, URL in the sweep file named, checked 2026-11-12.
- **[inferred]**: judgement from the evidence. **Every demand grade and every winnability grade in this file is inferred.**
  There is no keyword-volume tool.
- **[unverified]**: could not be checked.

### Codes used in the tables

| Code | Meaning | Where it came from |
|---|---|---|
| HU n | row n of `research/keywords/head-unified.md` | |
| PN n | row n of `research/keywords/per-network.md` | |
| AV n | row n of `research/keywords/alternatives-vs.md` | |
| AG n | row n of `research/keywords/ai-agents-mcp.md` | |
| US n | row n of `research/keywords/use-case-segments.md` | |
| MY n | row n of `research/keywords/malaysia-bm.md` | |
| AA n | row n of `research/keywords/ai-answers.md` | |
| CS | `research/current-site.md` | |
| AC n | Google autocomplete returned n completions for the seed (max 10), gl=us unless "AC-my" (hl=ms, gl=my) | measured 2026-11-12 |
| D: | DuckDuckGo top results, in order | measured once 2026-11-12, **not re-verified** (DDG then blocked the scraper) |
| W: | WebSearch tool top results, in order (a proxy for Google; order indicative) | measured once 2026-11-12, **not re-verified** (search budget spent) |
| B: | Brave top results | measured once 2026-11-12, **not re-verified** |
| T: | pages that **target** the term, from competitor sitemaps. This is who competes, not who ranks | measured 2026-11-12 |
| n/m | result page not measured | |

### Limits, stated plainly

- **No new search ran for this file.** The shared limit of 200 WebSearch calls per turn was already used up by the
  sibling sweeps; my one test query ("link in bio api") was refused. I did not work around the limit. So every "top
  rankers" cell is either a single, unrepeated measurement from a sibling sweep or a list of pages that *target* the term.
- Only about 35 of roughly 600 keyword rows across the sweeps have a measured result list. Section 8 lists the checks to
  run first; they decide whether the "weeks" grades hold.
- No Search Console or Bing Webmaster data exists yet (both unverified, `docs/geo/owner-todo.md`), so there are no real
  impressions to correct these estimates.
- People Also Ask, Google Trends and Reddit were not reachable by any sweep.

### Winnability scale (inferred, same as the sweeps)

- **weeks**: an exact-match page can enter the Bing/DDG top 10 within weeks of being indexed. Evidence: domains first
  seen in 2026 hold DDG #1–3 with exact-match pages (social-api.ai, first Wayback capture 2026-06-10, #1 for "unified
  social media api"; postwire.io, first capture 2026-10-03, #1 for "post to multiple social networks api") [HU, Wayback
  measured; ranks measured once].
- **months**: 2–6 months, needs internal links and a few off-site mentions.
- **long-term**: 6–12+ months, needs authority Siar does not have.
- **unlikely**: Siar cannot truthfully serve the intent, or the brand or network owner always wins.

Google is slower than Bing everywhere. Bing matters because it feeds ChatGPT search and Copilot (`docs/geo/plan.md`).

### Page types

landing · use-case (existing `/use-cases/*` template) · network hub (`/<net>-api`) · network topic (`/<net>-api/<topic>`) ·
error ref · guide (how-to with code) · compare (sourced, dated, says where the rival wins) · hub · listicle (stated method,
sources per row, does not rank Siar first) · local landing · BM guide · H2 (a section, not a URL) · FAQ (one Q&A on a page).

---

## 1. Summary

1. **siaran.my ranks only for its own name** [CS, measured]. About 32 of 89 URLs are in Google; 43 were not returned,
   including all docs guides but three, all 25 `/docs/api/*` pages, 3 use cases and 5 error pages [CS, measured, `site:`
   approximation]. Indexing comes before any new page.
2. **The head terms are owned.** "social media api" (AC 10), "unified social media api", "social media posting api" have
   exact-match vendor pages from bundle.social, Ayrshare, Zernio, PostPeer and others [HU]. Siar already has the right
   URLs for most capability terms; it lacks a home title that targets anything, plus guides, comparisons and a pricing
   explainer [CS, HU].
3. **The winnable demand is long-tail and first-hand:** exact error codes (147 already written), per-network gates
   (Meta App Review, TikTok audit, LinkedIn Community Management, Pinterest Standard access, YouTube audit), quotas
   (Instagram 100 vs 50 per 24 h, YouTube's new 100-uploads bucket, Threads 250), and the live niche networks
   (Threads, Bluesky, Mastodon, Discord, Slack) [PN].
4. **Three time-sensitive openings:** YouTube stopped forcing unverified-project uploads private on 2026-11-02 [sourced,
   PN]; LinkedIn marketing version 202511 sunsets 2026-11-16 [sourced, PN]; Buffer's legacy REST API has a brownout on
   2026-12-09 and shuts down 2027-02-01 [sourced, `competitors/buffer.md`].
5. **Comparison demand centres on Ayrshare**, but Google's top 5 for "ayrshare alternatives" is directories
   (AlternativeTo, Capterra/GetApp) plus one vendor blog [AV1, W measured once]. Directory listings beat a new page there.
   The thinnest comparison fields are "<dashboard tool> API" terms: Hootsuite, Metricool, Publer, Sprout, Buffer [AV].
6. **The AI/MCP cluster is real and rising but blocked:** `@siar/sdk`, `@siar/cli` and `@siar/mcp` return 404 on npm,
   the MCP server is stdio only, and Siar is in no MCP directory [AG, measured]. n8n guides are the one agent cluster
   open today (they use the REST API) [AG].
7. **AI answers for "best / alternatives / cheapest" are decided by about 20 vendor roundups; Siar is on 0 of 18** [AA,
   measured]. Getting included is faster than ranking.
8. **Malaysia:** no one searches for a "Malaysian scheduler" (AC-my 0) but the one measured result page is thin
   (Duta #1) [MY]. Real BM demand is per-network how-to in mixed BM-English ("cara schedule post", AC-my 10) [MY].
   Recommendation: one English `/malaysia` page plus a 7-page BM test (section 6).
9. **Several high-demand clusters must wait** for product or owner decisions: TikTok, YouTube public uploads, LinkedIn
   pages, Pinterest publishing, DMs/comment-to-DM, white label, bundle.social naming, X pricing (legal check) [siar-truth].
10. **Fix what engines already repeat wrong** before adding pages: the home calculator default (Bing Copilot now says
    "RM399/month for up to 240 connected accounts"), "15 networks" copy with no qualifier, the LinkedIn company-page
    claim, glued H1 text [CS, measured].

---

## 2. Wave 0: prerequisites (before any new page)

These come from `current-site.md` §10 and `siar-truth.md` §6. They are not keyword pages, but every wave depends on them.

| # | Fix | Why it matters for keywords | Source |
|---|---|---|---|
| 0.1 | Verify Google Search Console and Bing Webmaster Tools, submit the sitemap, turn on BWT AI Performance | No query data exists; Bing feeds ChatGPT search and Copilot | `owner-todo.md`, CS §4 |
| 0.2 | Put a space or `<br>` between split headline spans (42+ pages) | Google shows "Discord API errorsand how to fix them." | CS §2 [measured] |
| 0.3 | Fix the home calculator's server-rendered default (40 brands → "RM99 Pro", 240 accounts) | Copilot repeats a wrong price/limit | CS §4 [measured] |
| 0.4 | Generated status line on `/platforms` and every network page (live / waiting for approval / not open); remove the LinkedIn company-page claim; YouTube private-upload note | Engines repeat "15 networks" as fact | CS §7, siar-truth §2 |
| 0.5 | Replace unqualified "15 networks" in the home, `/features`, posting, scheduling and hosted-connect meta descriptions and in the GitHub repo description | siar-truth allows only "built for 15 networks" | HU finding 9, AA |
| 0.6 | Error pages: code + message + plain name in each H2, answer-first intro, more in-links; noindex or fill `/mastodon-api/errors` (203 words) | 147 codes are the best long-tail asset | CS §3 |
| 0.7 | Body links to `/use-cases/social-media-{analytics-api,comments-api,webhooks}` and `/use-cases/hosted-connect-oauth`; add them to the footer | 3 of them are not in Google; 2–4 in-links each | CS §2, §4 |
| 0.8 | `X-Robots-Tag: noindex` on app.siaran.my; real robots.txt on app. and api.; `/pricing.md` as `text/markdown` | Sign-in pages are indexed under the brand | CS §4, §9 |
| 0.9 | Re-run IndexNow after each deploy | Bing recrawl | `docs/geo/plan.md` |

### Owner decisions that gate clusters

| Decision | Clusters it unblocks |
|---|---|
| Go / no-go on comparison pages (`owner-todo.md`) | C46–C58, C61–C62 |
| Naming bundle.social publicly (parked) | C59, C60 |
| "Unlimited accounts" wording. `siar-truth.md` §1c allows "unlimited connected social accounts on every plan, Free included" (plans.ts has no account limit), but the schema allows one live account per network per brand, so Free/Starter cap at 15 and Pro at 150 in practice [US facts table, `competitors/bundle-social.md`]. The two research files disagree until Fakhrul rules | C06 H2, C17, C26, C47, every pricing comparison |
| Read X's Developer Agreement (Ayrshare argues shared-app X billing breaks the "service bureau" clause; third-party, unverified) | C87, X rows in C26 and C47 |
| Publish `@siar/sdk|cli|mcp` to npm (and, optionally, an HTTP MCP transport) | C41–C45, MCP H2 install lines, directory listings |
| Open the DM / comment-to-DM beta to every paid organization | C19 DM wording, C20, C73, /ms auto-reply |
| Test one public YouTube upload on production (Google lifted the private lock 2026-11-02) | C99, C100, YouTube status line |
| Whether to publish the TikTok rejection story | C94 |
| BM test (contradicts `geo/plan.md` "no BM version") | C121–C127 |

---

## 3. The map

Columns: **ID** · **Target URL** (existing or NEW) · **Type** · **Primary keyword** · **Secondaries** (merged into the
same page, as H2 or wording) · **Intent** (I informational, C commercial, T transactional, N navigational) · **Demand**
(inferred, with the evidence) · **Top rankers now** · **Win** · **Wave**.

### A. Core and hub pages (existing; retitle)

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C01 | `/` (existing) | landing | unified social media API | social media api (head); unified social api; unified api for social media; social media rest api; social media management api (H2); post once publish everywhere (H2, AC 10, US58); social media api aggregator (one line only) | C | Med for "unified" (AC returns the phrase only; 6 vendors title-target it, HU11). **High** for "social media api" (AC 10, HN 10 stories, HU1) | "unified": D: social-api.ai, postpeer.dev, docs.unified.to, unified.to, ayrshare.com · W: ayrshare.com, docs.unified.to, getlate.dev→zernio.com, unipile.com, flockler.com. "social media api": D: sociavault.com, postpeer.dev, socialcrawl.dev, social-api.ai, socialapis.io | "unified": months (Bing weeks). "social media api": long-term | retitle W1; ranking W3 |
| C02 | `/features` (existing, now "Product tour") | landing | social media scheduler with api | social media management tools with api; multi channel social media posting; social media bulk upload / bulk schedule csv (US116); comment management tool (US89); auto posting tools (head, no target) | C | Low for "with api" forms (AC under "social media management tools with api", HU25–26). Dashboard heads are High but unwinnable (MY4, MY7) | W: planable.io, opus.pro, dev.to, producthunt.com, pallyy.com (HU25) | months | retitle W1 |
| C03 | `/platforms` (existing) | hub | which networks does Siar support (p033) | social media api supported networks; "<network> API status" | N | Very low (branded) | own page (CS) | weeks | W0/W1 |
| C04 | NEW `/platforms/approvals` | hub | social media api approval by platform | app review per network; which social APIs need approval; links to C76, C91, C94, C98, C103, C113 | I/C | L–M (no AC test; Outstand has the page, PN1) | n/m · T: outstand.so | months | W2 |
| C05 | NEW `/platforms/limits` | hub | social media api rate limits by platform | posting limits per day api; table generated from `lib/networks.ts` caps | I | M (ShortSync and bundle.social limit posts rank for the IG-limit query, PN2) | n/m · likely shortsync.app, adaptlypost.com, bundle.social [inferred] | months | W2 |
| C06 | `/pricing` (existing) | landing + H2s | Siar pricing | H2 "Is there a free social media API?" (honest: 20 free posts to try, one-time; HU21/59, AA63); H2 "Unlimited social accounts…" (**wording decision first**, HU63, US10); "per organization, no seat fees" (US11); price lock (AA65); "social media scheduler free" honest answer (MY5) | N/C | Low per H2; "free social media api" is Med–high but **unlikely** for Siar | W (free): buffer.com/resources, getlate.dev/blog, postpeer.dev, contentstudio.io, mcpservers.org (HU21) | weeks for the H2s; free: unlikely | W1 |
| C07 | `/about` (existing) | landing | who makes Siar (p035) | is Siar legit (p034); FF DEV STUDIO, SSM 202603234793. Take "unified social media API" out of the title (it competes with home, CS §8) | N | Very low | own page | weeks | W1 |
| C08 | `/use-cases` (existing) | hub | what you can build with a social media API | (draft title from CS §6) | I | Low | n/m | months | W1 retitle |

### B. Use cases

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C09 | `/use-cases/social-media-posting-api` | use-case | social media posting api | social media publishing api; post to social media api; api to post to social media; api for social media posting; social posting api; social media automation api; auto post to social media api; cross-posting api (H2); API that validates media before posting (H2, AA32) | C/T | **Med–high** (AC 8, HU14) | D: postforme.dev, postpeer.dev, github.com/ayrshare/social-media-api, upload-post.com, zernio.com · W: getlate.dev/blog, socket.dev, docs.ayrshare.com, ecosyste.ms, postpeer.dev (HU14) | months | W2 |
| C10 | `/use-cases/social-media-scheduling-api` | use-case | social media scheduling api | social media post scheduler api; social media scheduler api; schedule social media posts with an api (HU24, merged here instead of a separate guide); schedule instagram posts api (PN17, US71); threads api schedule (PN37) | C | Med (HU22) | D: publora.com, postpeer.dev, socialschedule.ai, bundle.social · W: planable.io, ayrshare.com/blog, postly.ai, postpeer.dev, opus.pro (HU22) | months | W2 |
| C11 | `/use-cases/multi-tenant-social-media-api` (retitle "Social media API for SaaS: multi-tenant by design") | use-case | multi-tenant social media api | social media api for saas (p004); multi-tenant social media API one key many customers (p050); embedded social media api / embeddable scheduler (H2; "embedded social media" alone is a trap); multi-tenant social media architecture (H2) | C | Low (AC 0 for every form; every API vendor has a page, HU49–50, US28, US41) | W: bundle.social, vinquery.com, ayrshare.com (2), mallary.ai (HU50) · Bing: bundle.social, bundle.social/blog, social-api.ai/blog (CS) | weeks–months | W1 |
| C12 | `/use-cases/hosted-connect-oauth` (retitle "Social media OAuth API: a hosted, branded connect link") | use-case | social media oauth api | connect social media accounts api; hosted oauth social accounts; oauth for social media accounts; how to let my customers connect their own social accounts (p016); white-label connect link (p017: answer honestly "branded, Powered by Siar", never "white-label") | C | Low (AC 2, HU79) | W: ayrshare.com/connect, bundle.social/social-media-oauth-api, docs.whop.com, info.bundle.social, docs.postiz.com (HU79) · Bing: bundle.social, docs.social-api.ai, crevio.co (CS) | weeks–months | W1 |
| C13 | `/use-cases/social-media-api-for-ai-agents` | use-case | social media api for ai agents | social media apis for agentic workflows; ai agent post to social media; can ai agents post on social media (FAQ); ai agents for posting on social media; agentic social media scheduler; social media api for llm; can chatgpt post to linkedin (FAQ, honest "not from ChatGPT yet"); how to give an agent posting access safely (H2) | C | Med, rising (AC 6 own; 3rd completion of "social media api for", HU53, AG12) | W: blotato.com/social-media-api, ayrshare.com/use-cases/ai-startups, ayrshare.com/index.md, ayrshare.com/ai-agent.md, postpeer.dev (HU53) · Bing: social-api.ai, social-api.ai/solutions/…, postproxy.dev (CS) | months | W2 (copy now; install lines after npm) |
| C14 | `/use-cases/social-media-analytics-api` | use-case | social media analytics api | social media metrics / insights / reporting api; analytics API for multiple networks (p020). Say "paid plans only" | C | Med, mixed with listening/scraping (AC 6, HU74) | W: getlate.dev/blog, marketplace.gohighlevel.com, postpeer.dev/blog, ayrshare.com, shortimize.com (HU74) | months | W2 |
| C15 | `/use-cases/social-media-comments-api` | use-case | social media comments api | social media engagement api; reply to / hide comments api; comment moderation api (H2, disambiguate from ML toxicity); read and reply to comments on Instagram and Facebook (p019); DMs from an agent (H2, beta wording) | C | Low (AC 2, HU75, US83) | W: postpeer.dev, bundle.social, ayrshare.com, getlate.dev/blog, zernio.com (HU75) | weeks–months | W1 |
| C16 | `/use-cases/social-media-webhooks` | use-case | social media webhooks api | social media webhooks; social media API with webhooks when a post is published (p018); n8n trigger (H2) | C | Low (AC 2, HU78) | W: developer.synup.com, docs.publora.com, docs.rs, bundle.social/social-media-webhooks-api, postproxy.userjot.com (HU78) | weeks | W1 |
| C17 | NEW `/use-cases/social-media-api-for-agencies` | use-case | social media api for agencies | agency social media api; posting API for agencies with many client accounts (p005); social media scheduler for agencies (H2); tools for freelancers (H2: Pro's tagline is "For freelancers and agencies"); ayrshare alternative for agencies (link to C47). Wording: "your UI on Siar's API, with a branded connect link"; never "white-label" | C | Low (no completion of its own, HU48, US23) | W: ayrshare.com/use-cases/digital-agencies, zernio.com/use-cases/agencies (HU48) · T: social-api.ai, postpeer.dev | months | W2 (blocked on the "unlimited accounts" wording) |
| C18 | NEW `/use-cases/link-in-bio-api` | use-case | link in bio api | linktree api (H2: Linktree's developer page is an interest form, no documented links API, sourced); bio link api; link in bio page api; link in bio analytics | C | Low (AC 5, only the phrase keeps intent); "linktree api" AC 8 (US105–108) | n/m · T: no API vendor has a link-in-bio API page; bundle.social has no bio endpoints in its public spec (US105, measured) | **weeks** | W1 |
| C19 | NEW `/use-cases/social-media-inbox-api` | use-case | unified inbox api | social media inbox api; social inbox api; unified social media inbox; social media dm api (beta wording); unified inbox API for Instagram and Facebook DMs | C | Low (AC 4, HU77, US94) | W: getlate.dev/social-media-inbox, getlate.dev/blog, postly.ai, zernio.featurebase.app, ayrshare.com (HU77) | months | W2 (comments live; DMs "beta, on request") |
| C20 | HOLD `/use-cases/comment-to-dm-api` | use-case | comment to dm api | instagram comment to dm api; instagram auto reply; facebook auto reply (MY78–83); consumer "comment to dm" head (AC 10) stays a skip | C | High for consumer forms, Low–med for API forms (US102–103, MY73) | n/m · T: bundle.social, postpeer.dev, zernio.com, outstand.so | months | HOLD (DM beta) |
| C21 | HOLD `/use-cases/video-publishing-api` | use-case | upload video to multiple platforms at once | api automation for content creators; cross posting tiktok instagram youtube | C | Low (HU40, US59–61) | W: ayrshare.com/use-cases/video-content-platforms, docs.upload-post.com, postpeer.dev, upload-post.com (HU40) | unlikely now | HOLD (TikTok, YouTube) |

### C. Developer guides (all NEW under `/guides/`)

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C22 | `/guides/post-to-multiple-social-networks-api` | guide | post to multiple social networks api | post to multiple social platforms api; how do I post to multiple social networks from one API (p002); multi-platform posting api; multi platform social media api; cross-posting api; how to post to Instagram, TikTok and LinkedIn from my app (TikTok marked "opening after approval") | C/I | Low–med (API form has no AC; consumer form is High, HU27–33) | D: postwire.io, postoria.io, buffer.com/resources, ayrshare.com, postproxy.dev · W: postly.ai, prnewswire.com, getlate.dev/blog, ayrshare.com, postpeer.dev (HU27) | **weeks** (Bing) / months (Google) | W1 |
| C23 | `/guides/post-to-bluesky-mastodon-threads-api` | guide | API to publish to Bluesky, Mastodon and Threads (p010) | post to bluesky and mastodon api; decentralized social posting api [inferred phrasing, no AC] | C | Low (no AC run) | n/m. Not rare: Publora, Upload-Post and bundle.social also cover Mastodon; Zernio does not (AA20) | weeks | W1 |
| C24 | `/guides/idempotent-social-media-posting` | guide | how to avoid double posting when retrying a social media API (p045) | idempotent social media posting; duplicate post on retry | I | Low (no AC run) | n/m | weeks | W1 |
| C25 | `/guides/post-release-notes-from-ci` | guide | post release notes to Slack, Discord, LinkedIn and X from CI (p049) | (variants not measured) | I | Low (no AC run) | n/m | weeks | W1 |
| C26 | `/guides/social-media-api-pricing` | guide (pricing explainer, GEO plan P3) | social media api pricing | social media api cost; how much does a social media API cost (p027); per account vs per post (H2); pay per account pricing; social media api pricing comparison (table); API priced per organization (p006, do not claim unique); cheapest social media api (H2 "it depends: accounts vs posts", three worked scenarios, AV78); cheap / affordable social media api; cheapest with unlimited accounts (p007); instagram / facebook / linkedin api pricing (H2 "the networks charge nothing; X charges per call", PN12, PN24, PN59) | C/I | Med (AC 7, HU60, AV80). "cheapest" has AC 0 but only 2 rival pages (AV78) | W: socialdata.tools, contentstudio.io, getphyllo.com, glama.ai, ayrshare.com/pricing.md; zernio.com/blog/social-media-api-pricing also ranks (HU60) · T (cheapest): getsocialclaw.com, social-api.ai | months; "cheapest" H2 weeks–months | W1 (start; GEO priority) |
| C27 | `/guides/social-media-api-integration` | guide | social media api integration | social media integration api; integrate social media into saas app; add social publishing to your saas; add social media posting to my app; let users post from my app; build vs buy (H2); alternatives to building every integration yourself (p024); open source vs hosted (p026, H2: Siar is hosted, not open source); social media API vs management tool (H2). Uses `docs/approvals/` as first-hand evidence | I | Med (AC 6, HU70); the SaaS forms are AC 0 (US29–31, US35) | W: juicer.io, zylalabs.com, flockler.com, rapidevelopers.com, apidog.com; bundle.social/blog also ranks (HU70) | months | W2 |
| C28 | `/guides/what-is-a-unified-social-media-api` | guide (answer-first) | what is a unified social media API (p001) | what is a social media api; social media api meaning; api for social media platforms; unified API vs native platform APIs (table) | I | Med (AC "social media api meaning" under 4 seeds, HU7) | W (meaning): brandwatch.com, agorapulse.com, blog.hootsuite.com, sproutsocial.com, socialchamp.com (HU7) | months (unified) / long-term (meaning) | W3 |
| C29 | `/guides/best-social-media-apis` | listicle | best social media api | social media apis; best social media apis for developers; best social media posting / scheduling / unified api; best social media api 2026 (year in title, not URL); best social media API for AI agents | C | Med (AC, HU2–6, AV70–76) | W: buffer.com/resources, blotato.com, dev.to, octolens.com, upload-post.com (each vendor ranks itself first) · T: 13 vendor listicles | long-term | W3 (roundup inclusion off-site is W1) |
| C30 | `/guides/n8n-social-media-posting` (hub) | guide | n8n social media posting | n8n post to social media; n8n social media automation (+ workflow/template); automated social media posting n8n; n8n social media api; n8n post to bluesky / facebook / linkedin / x (H2s); zapier alternative for social media (H2 "without Zapier") | I/C | Med; Med–high for "n8n social media automation" (AC 10, AG62–63, HU72) | W: growwstacks.com, skool.com, ayrshare.com/docs, getlate.dev/blog, buldrr.com (HU72) | months | W2 |
| C31 | `/guides/n8n-instagram-posting` | guide | n8n post to instagram | can n8n post to instagram (first H2); n8n upload / publish to instagram; reels, story, image; n8n instagram comment automation (H2) | I | **Med–high** (AC 10, AG65) | n/m · T: upload-post.com has 60 `/n8n/` URLs; n8n.io has no Instagram integration page (404) | months | W2 |
| C32 | `/guides/n8n-threads-posting` | guide | n8n threads | n8n auto post threads; n8n threads api / post / node | I | Med (AC 10 with noise, AG68) | n/m · no n8n Threads integration page | weeks–months | W1 |
| C33 | `/guides/make-social-media-posting` | guide | make.com social media automation | make com instagram / linkedin / facebook / threads post | I | Low–med (AC 5, AG81–85, US114) | n/m · T: upload-post.com/make-templates | months | W3 |
| C34 | `/guides/ai-agent-linkedin-posting` | guide | ai agent to post on linkedin | build ai agent to post on linkedin; ai agent linkedin post (profiles only) | I/C | Med ("ai agent linkedin" AC 10, AG40) | n/m | months | W2 (REST now; MCP lines after npm) |
| C35 | `/guides/manage-social-media-for-multiple-clients` | guide | how to manage multiple clients social media accounts | social media management tools for multiple clients; let clients connect social media accounts (H2, merges the proposed `/guides/let-clients-connect-social-accounts`); one brand per client | I | Low–med (AC child of 2 seeds, US7–8, US46) | n/m · T: upload-post.com/how-to/let-clients-connect…, sproutsocial.com/insights | months | W2 |
| C36 | `/guides/auto-post-new-products-to-social-media` | guide | auto post new products to social media | shopify auto post to instagram (H2, no Shopify app: say so); woocommerce auto post to social media (H2); post products to instagram automatically; ecommerce social media automation | T | Low (AC 0–2, US62–69) | n/m · T: upload-post.com, zernio.com/shopify | months | W3 |
| C37 | `/guides/social-media-api-python` | guide | social media api python | (plain `requests`; Siar has no Python SDK) | I | Low (AC 3, HU67) | W: ecosyste.ms, pypi.org/social-post-api, socket.dev, ayrshare.com/docs (HU67) | months | W3 |
| C38 | `/guides/build-a-social-media-scheduler` | guide | how to build a social media scheduler | build your own scheduler (developer slice only) | I | Low (completions drift to content calendars, US36) | n/m | months | W3 |
| C39 | `/guides/post-to-multiple-social-media-accounts-at-once` | guide (consumer) | post to multiple social media accounts at once | post to all social media at once; post to multiple platforms at once; auto post to all social media; automate posting to social media; cross post to social media (US57) | I/C | **High** (AC 10, HU35–39) | W: socialpilot.co, blog.hootsuite.com, contentstudio.io, sproutsocial.com, socialchamp.com (HU35) | long-term | W3 |
| C40 | `/guides/social-media-scheduler-pricing` | guide (dashboard buyer) | cheapest social media scheduler | most affordable social media scheduler; per user / per seat vs per organization. May merge into C26 if Fakhrul prefers one page | C | Med–high (AC 10, US12) | n/m · likely listicles and Reddit [inferred] | long-term | W3 |

### D. MCP and AI clients (blocked until `@siar/mcp` is on npm)

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C41 | NEW `/social-media-mcp-server` | landing | social media mcp server | social media mcp; mcp for social media; social media mcp for claude; social media scheduler / management mcp; mcp server for social media posting (title wording); API with an MCP server for AI agents (p008); best mcp server for social media (roundup inclusion, not an own list). Angle: publishes through each network's official API | C/N | Med, rising ("social media mcp" AC 10; "…server" AC 3; AG1–8, HU55) | B: mcpmarket.com, TensorBlock/awesome-mcp-servers, outstand.so/mcp, brightdata.com, sociality.io/mcp · W: planable.io/blog, lobehub.com, mcpservers.org, speakeasy.com, glama.ai | months after npm; directory listings weeks after npm | W2 (blocked) |
| C42 | NEW `/mcp/instagram`, `/mcp/linkedin`, `/mcp/threads` (3 pages) | landing | instagram mcp / linkedin mcp / threads mcp | instagram mcp server; instagram post mcp server; linkedin mcp server; mcp server linkedin post; threads mcp server. Until npm: an "<Network> MCP" H2 on `/instagram-api`, `/linkedin-api`, `/threads-api`, `/x-api`, `/bluesky-api`, `/facebook-api` (describe the 19 tools, no install line) | C/N | Med–high for instagram and linkedin (AC 10 each); Low–med for threads (AG14, AG19, AG26) | n/m · T: upload-post.com (22 `/mcp/<net>`), outstand.so (9), zernio.com, blotato.com | months after npm; threads weeks–months | H2s W1; pages W2 (blocked) |
| C43 | NEW `/guides/post-to-social-media-from-claude` | guide | can claude post to social media | can claude post to linkedin (H2; profiles only); claude linkedin mcp; claude twitter mcp; can claude schedule instagram posts (FAQ); how to use claude to post on social media. Merges AG45–46 and US118 into one page | I | Low–med; "claude linkedin" Med (AC 10) (AG21, AG45–50, US118) | n/m · T: postiz.com/claude, outstand.so/claude, zernio.com/claude, blotato.com/claude | months after npm; "connector" phrasing unlikely (no remote MCP) | W2 (blocked) |
| C44 | NEW `/guides/claude-code-social-media` | guide | claude code social media | claude code social media automation / post; claude skills social media (needs a Siar skill, none exists) | I | Med (AC 10, AG48–49) | n/m · T: postiz.com/claude-code, outstand.so/claude-code-social-media | months after npm | W2 (blocked) |
| C45 | NEW `/guides/openai-agents-sdk-social-media` | guide | openai agents sdk social media | openai agents sdk mcp server (H2; `MCPServerStdio` fits Siar's stdio server, sourced) | I | Low (AC 0, AG58–59) | n/m | weeks after npm | W2 (blocked) |
| — | `/docs/sdk-cli-mcp` (existing) | docs | does Siar have an MCP server (p037) | social media sdk; social media scheduling sdk (US34) | N | Very low | own page | weeks | fix wording W0 (no install line until npm) |

### E. Comparisons (all need the comparison-page go; every competitor fact needs the vendor's own URL and "checked <date>")

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C46 | NEW `/compare` | hub | social media api alternatives | ayrshare competitors; later / socialpilot / loomly / postproxy / post for me api alternative (H2 rows, AV63–67) | C | Very low (AC 0 for the generic, AV90) | T: 11 vendor `/compare` or `/alternatives` hubs | months | W1 (with the first compare pages) |
| C47 | NEW `/compare/ayrshare` | compare | ayrshare alternatives | ayrshare alternative; ayrshare api alternatives; ayrshare pricing (H2, "checked <date>"); ayrshare api pricing; ayrshare cost; ayrshare free plan / trial (FAQ); ayrshare free alternative (honest); cheaper ayrshare alternative (worked cost table); ayrshare alternative for agencies (H2); zernio vs ayrshare (H2 "Ayrshare vs Zernio vs Siar"); Siar vs Ayrshare (p036); Ayrshare pricing per profile (p028); ayrshare mcp (H2) | C | **Med**, the strongest comparison term (AC 4; "ayrshare" AC 10; 60 HN stories; 13 of 16 rival sitemaps target it, AV1–20) | W: alternativeto.net, blotato.com/blog/ayrshare-alternatives, capterra.ca, capterra.in, getapp.com.au (AV1) | Google long-term; Bing months; "Siar vs Ayrshare" weeks | W2 page; W1 directory listings |
| C48 | NEW `/compare/zernio` | compare | zernio alternative | zernio api alternative; late api alternative; getlate alternative; ayrshare vs late; Late API vs Ayrshare (p025); zernio pricing (H2: per connected account). Intro: "Zernio, formerly Late" | C | Low–med (AC 3; "zernio" AC 10, AV28–32) | W: alternativeto.net, bundle.social/zernio-alternative, postiz.com, producthunt.com, postproxy.dev/compare/zernio (HU84) | months | W2 |
| C49 | NEW `/compare/upload-post` | compare | upload-post alternative | upload post free alternative; upload post api alternative; upload-post pricing (H2); ayrshare vs upload-post | C | Low–med (AC 5, AV36–39) | W: alternativeto.net, ayrshare.com/compare/upload-post-api-alternative, info.bundle.social, bundle.social/blog, blotato.com (HU86) | months | W2 |
| C50 | NEW `/compare/buffer-api` | compare | buffer api alternative | buffer alternative with api; does buffer have an api (answer first: yes, GraphQL since 2026-05-27, acts on Buffer accounts only); buffer api pricing; what happened to buffer api / Buffer REST API shutdown (H2, dated); buffer mcp (H2); ayrshare vs buffer | C/I | Low (AC 2; "buffer api" AC 10 but collides with Node.js `Buffer`, AV41–47) | n/m · T: 6 vendors (ayrshare, outstand.so/buffer-api, postproxy, zernio, publora, posteverywhere) | months | **W1** (trigger: brownout 2026-12-09, shutdown 2027-02-01) |
| C51 | NEW `/compare/hootsuite-api` | compare | hootsuite api alternative | hootsuite api pricing (H2: API free, needs approved access and Hootsuite seats from $99/user/month, sourced); does hootsuite have an api; hootsuite alternative for developers; hootsuite mcp (H2: drafts/replies limits); ayrshare vs hootsuite | C | Low; "hootsuite api" AC 10 (AV48–51, HU43) | W ("hootsuite api"): activepieces.com, silicon.co.uk, supergood.ai, hootsuite.com newsroom, apievangelist.com (HU43) · T: 5 vendors | **weeks–months** | W1 |
| C52 | NEW `/compare/sprout-social-api` | compare | sprout social api alternative | sprout social api pricing / access (H2: drafts only, Advanced plan, sourced); sprout social mcp | C | Low; "sprout social api" AC 10 (AV53–54) | n/m · T: 3 vendors | months | W2 |
| C53 | NEW `/compare/metricool-api` | compare | metricool api alternative | metricool api pricing (H2: Advanced, sourced); metricool mcp (H2) | C | Low–med; "metricool api" AC 10 (AV62) | n/m · T: 1 vendor (ayrshare) | **weeks–months** | W1 |
| C54 | NEW `/compare/publer-api` | compare | publer api alternative | publer api pricing (H2: Business/Enterprise only, sourced) | C | Low–med; "publer api" AC 10 (AV61) | n/m · T: 3 vendors | weeks–months | W1 |
| C55 | NEW `/compare/blotato` | compare | blotato alternative | blotato api alternative; blotato mcp | C | Low–med (AC 5, AV59, AG110) | n/m · T: 10 vendors | months | W2 |
| C56 | NEW `/compare/postiz` | compare | postiz alternative | postiz api rate limit / pricing (H2); frame "hosted API instead of self-hosting" | C | Low–med (AC 4, AV57–58) | n/m · T: 8+ vendors; much self-host intent | long-term | W3 |
| C57 | NEW `/compare/outstand` | compare | outstand alternative | must say Outstand includes 3,000 posts for $19 and is cheaper below about 7,300 posts a month | C | Low (AV60) | n/m · T: 6 vendors | months | W3 |
| C58 | NEW `/compare/mixpost` | compare | mixpost alternative | mixpost api / mcp; "if you must own the server, Mixpost is the better buy" | C | Low (AC 3, AV68) | n/m · T: 10+ vendors | months | W3 |
| C59 | PARKED `/compare/bundle-social` | compare | bundle.social alternative | bundle social alternatives (p022); ayrshare vs bundle.social (p023); bundle.social pricing; bundle.social vs zernio | C | Low (AV18, AV21–25) | W: getapp/capterra, alternativeto.net, ayrshare.com/compare/…, bundle.social/alternatives (HU88) | months | PARKED (naming) |
| C60 | PARKED `/guides/migrate-from-bundle-social` | guide | switch from bundle.social | bundle.social migration; "compatible with the v1 API as of October 2026", "change the base URL, then reconnect accounts" | T | Not observed; tiny now (AV26) | n/m | weeks once named (only Siar can answer it truthfully) | PARKED |
| C61 | NEW `/compare/meta-business-suite` | compare | meta business suite alternative | (Malaysia dashboard buyer); multi-network vs Meta-only | C | Low–med (AC-my 6, MY10) | n/m | months | W2 |
| C62 | NEW `/compare/zoho-social` | compare | zoho social alternative | zoho social pricing (H2, ringgit, sourced) | C | Med for "zoho social pricing" (AC-my 9), low for "alternative" (MY12) | n/m | months | W3 |
| C63 | HOLD `/compare/manychat` | compare | manychat alternative | for instagram / facebook / free | C | Med–high (AC-my 10, MY86) | n/m | months | HOLD (DM beta) |

### F. Network hubs and topic pages

Retitle all 15 `/<net>-api` hubs away from the head term ("<Net> API: post, schedule and analyze") to the posting
modifier, and add the status line (wave 0). Head terms such as "instagram api", "tiktok api", "x api", "youtube api",
"pinterest api", "discord webhook", "google business profile api" are **unlikely** (AC 10 each, owned by the networks'
docs, PN3, 18, 52, 66, 79, 91, 112, 121, 127).

**Instagram (live)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C64 | `/instagram-api` (retitle "Instagram posting API: reels, stories and carousels") | network hub | instagram posting api | instagram api for posting; instagram carousel api (H2, up to 20 items, sourced); instagram_content_publish (scopes H2); post to Instagram via API without building a Meta app (p012: customers connect through Siar's Meta app, approved 2026-10-27; no badge wording); instagram api pricing (H2); Instagram MCP (H2); post from an AI agent (H2); auto post instagram to threads / discord (H2, MY66); connect instagram account api (H2); instagram dm api (H2, "beta, on request") | C | M (AC 10, PN4–5, PN9, PN15) | W: postpeer.dev, blotato.com, docs.publora.com, unipile.com, getlate.dev (PN4) | months | retitle W1; rank W2 |
| C65 | NEW `/instagram-api/how-to-post` | network topic | post to instagram via api | upload / publish to instagram via api; can you post to instagram via api | I | M (AC 9, PN6) | n/m · likely postproxy.dev, zernio.com, ayrshare.com [inferred] | months | W2 |
| C66 | NEW `/instagram-api/reels` | network topic | instagram reels api | instagram graph api post reel; instagram api post reels; reel aspect ratio and duration limits for API publishing (p043, limits generated from code) | I | M (AC 10, PN7) | W: submagic.co, ayrshare.com, developers.facebook.com, developers.qodex.ai, getphyllo.com (PN7) | months | W2 |
| C67 | NEW `/instagram-api/stories` | network topic | instagram api post story | post instagram story via api | I | M (AC child, PN8) | W: ayrshare.com, docs.publora.com, rapidevelopers.com, docs.contentstudio.io, storrito.com (PN8) | months | W2 |
| C68 | NEW `/instagram-api/publishing-limit` | network topic | instagram api post limit | instagram api 100 posts per 24 hours; instagram api rate limit; graph api rate limit; `content_publishing_limit` call. Meta's own page says both 100 and 50 (sourced); bundle.social already explains that conflict, so the edge is first-hand numbers from Siar's caps | I | M (AC 10, PN10–11) | W: ayrshare.com, help.zoomsphere.com, help.later.com, developers.facebook.com, adaptlypost.com (PN10) | months | W2 (first in wave) |
| C69 | NEW `/instagram-api/instagram-login-vs-facebook-login` | network topic | instagram api with instagram login | instagram api without facebook page; instagram login api (US49) | I | M (AC 10, PN13–14) | W: apis.apievangelist.com, developers.facebook.com, getphyllo.com, buddhathemes gitbook, keyapi.ai (PN13) | long-term | W3 |
| C70 | NEW `/instagram-api/comments` | network topic | instagram comments api | instagram api comment reply; instagram api comment on post | C/I | **Med–high** (AC 10, US84–85) | n/m · T: bundle.social/instagram-comments-api, postpeer.dev, zernio.com | months | W2 |
| C71 | NEW `/instagram-api/insights` | network topic | instagram analytics api | instagram post analytics api (paid plans) | C/I | Med (AC 6, US76) | n/m · T: postpeer.dev | months | W2 |
| C72 | `/instagram-api/errors` | error ref | instagram api error codes | instagram graph api error codes; Instagram API error 2207042 (p038); instagram api errors how to fix | I | L–M (AC 4, PN16, CS) | D: upgrow.com, instagrapi.com, postpeer.dev/errors/instagram (CS) | weeks–months | W1 |
| C73 | HOLD `/instagram-api/dm` | network topic | instagram dm api | instagram direct message api; instagram messaging api | C/I | Med–high (AC 10, US98–99) | n/m · T: bundle.social, postpeer.dev, zernio.com | months | HOLD (DM beta) |

**Facebook (live, Pages only)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C74 | `/facebook-api` (retitle "Facebook Page posting API") | network hub | facebook api for posts | facebook api limits (H2); facebook mcp (H2); FAQ "Siar posts to Pages through Meta's official API, not to groups or personal profiles" (catches "auto post facebook group", "schedule post facebook personal/group" without chasing them, MY52, MY62) | C | M (PN21, PN29) | n/m | months | retitle W1; W2 |
| C75 | NEW `/facebook-api/post-to-page` | network topic | facebook graph api post to page | facebook page api post | I | M (AC child, PN19–20) | n/m · likely developers.facebook.com, stackoverflow.com [inferred] | months | W2 |
| C76 | NEW `/facebook-api/meta-app-review` | network topic (first-hand) | meta app review | meta app review time / taking time; meta app review rejected; instagram api without app review (CTA: Siar's app passed review 2026-10-27, so customers need no review of their own); meta app review video / requirements | I/C | M (AC 10 incl. process, time, video, requirements, "taking time", PN26–28) | n/m · likely developers.facebook.com, bundle.social (`/meta-app-review-rejected`), reddit.com [inferred] | months; "time" variant weeks–months | **W1** |
| C77 | NEW `/facebook-api/page-access-token` | network topic | facebook page access token long-lived | why tokens expire; Siar's reconnect webhook | I | M (PN23; "Permanent Page Access Token?" has 208k views on Stack Overflow, `market/buyers-pains.md`) | n/m · T: outstand.so | months | W2 |
| C78 | NEW `/facebook-api/comments` | network topic | facebook comments api | facebook comment reply api; facebook page comment api. Open by saying it is about Page comments, not the website Comments Plugin | C/I | Med (AC 10, US86) | n/m · T: bundle.social, postpeer.dev | months | W2 |
| C79 | NEW `/facebook-api/reels` | network topic | facebook reels api | facebook publish reel api; facebook reels upload api | I | L–M (AC 10, PN22) | n/m | months | W3 |
| C80 | NEW `/facebook-api/insights` | network topic | facebook insights api | facebook post analytics api | N/I | Med (AC 10, US77) | n/m · likely developers.facebook.com | long-term | W3 |
| C81 | `/facebook-api/errors` | error ref | facebook api errors | OAuthException 190 etc. (codes in H2s) | I | L (PN30) | n/m | months | W1 (with 0.6) |

**Threads (live)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C82 | `/threads-api` (retitle "Threads posting API") | network hub | threads api post | threads api pricing / free (H2: no fee on Meta's page, inferred); threads api limits (H2: 250 posts, 1,000 replies, 100 deletes per 24 h, sourced); threads api python (code); schedule threads posts api (H2); threads mcp (H2); schedule post threads (consumer H2, MY53) | I/C | Head M–H (AC 10, PN31); modifiers L | n/m · likely developers.facebook.com, outstand.so, bundle.social [inferred] | head long-term; modifiers weeks | W1 |
| C83 | NEW `/threads-api/how-to-post` | network topic | publish to threads api | post to threads via api (AC 0); threads api post (AC 6) | I | L (PN32) | n/m | weeks–months | W1 |
| C84 | `/threads-api/errors` | error ref | threads api errors | empty 500 / missing permission (social-api.ai targets it) | I | L (PN38) | n/m | weeks | W1 |

**X (live; X pricing page held)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C85 | `/x-api` (retitle "X (Twitter) posting API") | network hub | post on x using api | twitter api rate limits (H2); X MCP (H2, `quote_x_cost` tool); ai agent for twitter posting (H2); keep the pass-through explanation (do not chase "x api alternative": Siar is not cheaper, AV83) | C | M (PN48–50) | n/m | months | retitle W1; W2 |
| C86 | NEW `/x-api/how-to-post` | network topic | twitter api post tweet | x api create post; post to twitter via api; twitter api upload media / video | I | M (PN47–49) | n/m · likely docs.x.com [inferred] | months | W2 |
| C87 | HELD `/x-api/pricing` | network topic | x api pricing | twitter api pricing; x api pay per use / pay as you go; X API cost per post 2026 (p029: $0.015, $0.20 with a URL, sourced docs.x.com); x api free tier; x api basic plan (not on X's page any more); x api credits / buy x api credits (H2); calculator in USD (MYR only with the 4.20 rate caveat) | C | **High** (AC 10 each, PN39–45) | n/m · T: bundle.social, zernio, upload-post, postproxy, outstand (AV84) | long-term; cost-per-post and credits weeks–months | HELD (X terms check) |
| C88 | `/x-api/errors` | error ref | x api 402 creditsdepleted | x api error 402 payment required; X API 403 duplicate content (p042) | I | L–M (AC 5, PN46) | D: opentweet.io, note.com, x.com (CS) | **weeks** | W1 |

**LinkedIn (profiles live; company pages denied)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C89 | `/linkedin-api` (retitle "LinkedIn profile posting API"; remove the company-page claim) | network hub | linkedin api key for posting | share on linkedin api / w_member_social (scopes H2); LinkedIn MCP (H2) | C | L (PN60, PN65) | n/m | months | W0 fix, W1 retitle |
| C90 | NEW `/linkedin-api/how-to-post` | network topic | linkedin api post | post to linkedin via api; linkedin posts api; linkedin api rate limits (H2: 150/member/day, 100,000/app/day, sourced); how to post to LinkedIn via API (personal profile) | I | M (AC 10, PN53–54, PN61–62) | n/m · likely learn.microsoft.com, ayrshare.com, getlate.dev [inferred] | months | W2 |
| C91 | NEW `/linkedin-api/community-management-api` | network topic (guide only, first-hand) | linkedin community management api | development tier access form; linkedin api access / access denied; linkedin api post to company page (merges the proposed `/linkedin-api/company-pages`); how to post to a LinkedIn company page via API (p014). Honest: Siar's own request was denied, profiles only today | I | L–M; "linkedin api access" AC 10; "…post to company page" M (PN55–58) | n/m · likely learn.microsoft.com, zernio/getlate, outstand.so [inferred] | **weeks–months** | W1 |
| C92 | `/linkedin-api/errors` | error ref | linkedin api error 426 | NONEXISTENT_VERSION / version sunset (202511 sunsets 2026-11-16, sourced); LinkedIn API 422 duplicate post (p041) | I | L (AC 4, PN63) | n/m | **weeks** | **W1, urgent** |

**TikTok (audit rejected, sandbox: guide only, never "post to TikTok with Siar")**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C93 | `/tiktok-api` (retitle "TikTok Content Posting API guide"; status "built, opening after TikTok approves Siar") | network hub | tiktok content posting api | tiktok api pricing (H2); tiktok api rate limit (H2: 6 requests/min per token, sourced); tiktok direct post; TikTok video upload limits API (p044) | I | M (AC 10, PN67, PN74–76) | W: developers.tiktok.com, ayrshare.com, blotato.com, getlate.dev, bundle.social (PN67) | long-term | W0 status; W3 |
| C94 | NEW `/tiktok-api/audit` | network topic (first-hand) | tiktok content posting api audit | tiktok api approval; tiktok api audit; tiktok api sandbox | I | M (AC 5, PN71, PN77) | W: blotato.com, website-apn.pages.dev, rapidevelopers.com, developers.tiktok.com, mediawell.ssrc.org (PN71) | months | W2 (Fakhrul's call to publish) |
| C95 | `/tiktok-api/errors` | error ref | tiktok api error codes | unaudited_client_can_only_post_to_private_accounts; TikTok API spam_risk_too_many_posts (p039); tiktok api error 40002; tiktok api private | I | L–M (AC 6, PN72–73) | n/m · T: postpeer.dev/errors/tiktok | weeks | W1 |
| C96 | NEW `/tiktok-api/how-to-post` | network topic (guide only) | tiktok api post video | post to tiktok via api; How to post to TikTok via API (p013); tiktok api upload video python | I | M (PN68–70) | W: ayrshare.com, getlate.dev, developers.tiktok.com, docs.publora.com, developers.posteverywhere.ai (PN68) | long-term | W3 |

**YouTube (connect + upload; public uploads not yet claimable, test pending)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C97 | NEW `/youtube-api/quota` (+ calculator) | network topic | youtube data api quota | youtube api quota exceeded; quota increase / extension (Siar's own request pending since 2026-10-15); quota calculator; youtube api upload limit / daily upload limit (100 `videos.insert` per day, separate bucket, sourced); youtube api pricing / is youtube api free | I | M–H (AC 10, PN83–87, PN90) | n/m · T: bundle.social, social-api.ai, outstand.so | months; upload-limit variant **weeks** | **W1** |
| C98 | NEW `/youtube-api/audit` | network topic | youtube api audit | youtube api compliance audit; youtube api upload private video / videos locked private (rule lifted 2026-11-02, sourced); services audit and quota extension form | I | L–M; "private" M (PN88–89) | n/m | weeks for "locked private"; months for "audit" | **W1** |
| C99 | NEW `/youtube-api/shorts` | network topic | youtube shorts api upload | youtube api upload shorts; how to schedule a YouTube Short via API (p015); Shorts thumbnails (2026-11-03, sourced) | I | M (PN82) | n/m · likely ayrshare.com, getlate.dev [inferred] | months | HOLD → W2 after a public upload test |
| C100 | NEW `/youtube-api/how-to-upload` | network topic | youtube upload api | youtube api upload video; upload video to youtube via api | I | M–H (AC 10, PN80–81) | n/m · likely developers.google.com, stackoverflow.com | long-term | W3 (after test) |
| C101 | NEW `/youtube-api/comments` | network topic | youtube comments api | comments.list, comment threads | I | Med–high (AC 10, US87) | n/m · likely developers.google.com | long-term | W3 |
| C102 | `/youtube-api/errors` | error ref | youtube api errors | update the "locked private" entry to Google's 2026-11-02 change | I | L | n/m | weeks | W0/W1 |

**Pinterest (connect + read; publishing needs Standard access)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C103 | NEW `/pinterest-api/access` | network topic (first-hand) | pinterest api standard access | pinterest api trial access denied; trial vs standard (demo video of OAuth + live integration, sourced) | I | L (AC child, PN93–94) | n/m | weeks–months | W1 |
| C104 | `/pinterest-api/errors` | error ref | pinterest api method not found | | I | L–M (PN96) | n/m | weeks | W1 |
| C105 | `/pinterest-api` (status line) | network hub | pinterest api for posting | pinterest api pricing / free (H2); `/pinterest-api/how-to-post` guide only later | I | L–M (PN92, PN95) | n/m | months | W0 status; W3 |

**Bluesky, Mastodon, Discord, Slack (live; low demand, low competition)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C106 | `/bluesky-api` (retitle "Bluesky posting and scheduling API") | network hub | schedule bluesky posts api | bluesky api post schedule; bluesky api rate limit (H2: 1,666 posts/hour, 11,666/day, sourced); bluesky api pricing / free (one line); Bluesky MCP (H2) | C | L (PN104–106) | D: bsky.app, postfa.st (2) (CS) | **weeks** | W1 |
| C107 | NEW `/bluesky-api/how-to-post` | network topic | bluesky api create post | post to bluesky via api; bluesky api python | I | L (AC 4, PN103, PN107) | n/m | **weeks** | W1 |
| C108 | `/bluesky-api/errors` | error ref | bluesky api errors | Bluesky API ExpiredToken fix (p040) | I | L | n/m | weeks | W1 |
| C109 | `/mastodon-api` | network hub | mastodon api post status | mastodon bot api / python (H2); mastodon api rate limit (H2: 300 req/5 min, sourced). Fill or noindex `/mastodon-api/errors` | I | L (PN108–111) | n/m | weeks | W1 |
| C110 | NEW `/discord-api/schedule-messages` | network topic | discord bot send message at certain time | schedule discord message; discord api send message (H2 on the hub); discord api rate limits (H2) | C/I | L–M (PN113–115) | n/m | months | W2 |
| C111 | NEW `/slack-api/rate-limits` | network topic | slack api rate limits non-marketplace apps | conversations.history 1 per minute (2025-05-29 change, sourced); slack chat.postmessage rate limit | I | L (PN118–119) | n/m | **weeks** | W1 |
| C112 | `/slack-api` | network hub | slack api post message | slack schedule message api (H2) | I | M (AC 10, PN116, PN120) | n/m · likely docs.slack.dev | long-term | W3 |

**Google Business Profile, Reddit, Snapchat (parked)**

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C113 | NEW `/google-business-profile-api/access` | network topic (guide only) | google business profile api access request form | how to get access; gbp api pricing / free; API to post to GBP programmatically (p011, reference only) | I | M (AC 10, PN121–125) | n/m · likely developers.google.com | months | W3 |
| — | `/reddit-api`, `/snapchat-api` | network hub | status line only | reddit api access request form (later, only if Siar applies); snapchat public profile api (short explainer) | I | Reddit H for pricing/key but unlikely; Snapchat L (PN97–101, PN127–130) | n/m | unlikely | W0 status; no new pages |

### G. Errors hub

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C114 | NEW `/errors` | hub | social media api error codes | instagram api error codes; tiktok api error codes (both autocomplete, CS); links to all 15 error pages. Title must not reuse `/docs/errors` wording (CS §8) | I | L–M | T: bundle.social/errors | weeks–months | W1 |

### H. Malaysia (English)

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C115 | NEW `/malaysia` | local landing (EN) | social media scheduler malaysia | social media management tools malaysia; social media API Malaysia (p046); scheduling tool for Malaysian agencies with API (p048); API untuk post ke Instagram dan TikTok serentak (p047, one BM FAQ line; Instagram yes, TikTok "opening after approval"); ringgit pricing / pay by FPX or DuitNow; freelance social media manager malaysia (H2: "10 brands for RM99"); hootsuite / social media management price malaysia (H2). Never "first" or "only" (Duta claims "first") | C | Low / very low (AC-my 0 for all, MY1–3, HU91–92) | B: getduta.com, nineten.ai, planable.io/blog, shinjiru.com.my/blog, newnormz.com.my (MY1) · Bing for "social media api malaysia": muapi.ai, developer.data.gov.my, WhatsApp resellers (CS) | **weeks** | W1 |
| C116 | NEW `/guides/social-media-management-cost-malaysia` | guide | social media management price malaysia | social media management package malaysia; social media management malaysia (cost H2); social media marketing malaysia price. Agency ranges sourced to agencies' own pages | C | Low–med / Med (AC-my 1–9, MY16–18) | n/m; neighbouring query shows agency pages (MY16) | months | W2 |
| C117 | NEW `/guides/schedule-instagram-posts` | guide (dashboard) | schedule post instagram | not showing / not working / desktop / web / business account (troubleshooting H2s) | I | **High** (AC-my 10, MY50) | n/m | long-term | W3 |
| C118 | NEW `/guides/schedule-facebook-posts` | guide (dashboard) | schedule post facebook business page | (Pages only; personal/group: one honest line) | I | High head; months for "business page" (MY51) | n/m | long-term | W3 |
| C119 | NEW `/guides/meta-business-suite-scheduling` | guide | meta business suite schedule post | bulk schedule posts (H2: Siar has CSV import); time zone; not working; limit | I | **High** (AC-my 10, MY54–56) | n/m | long-term head; months long tail | W3 |
| C120 | NEW `/guides/auto-post-facebook-instagram` | guide | auto post facebook instagram | auto cross post facebook to instagram; cross post facebook instagram; auto post facebook page (H2, merges the proposed `/guides/auto-post-to-facebook-page`); auto post instagram to threads / discord (H2) | C | Med; "cross post facebook instagram" Med–high (MY63–66) | n/m · likely Meta help [inferred] | months (long-term for heads) | W3 (English twin of C125) |

### I. Bahasa Melayu test set (`/ms/`, `lang="ms"`, `hreflang` to the English twin where one exists)

| ID | Target URL | Type | Primary | Secondaries | Intent | Demand (inferred) | Top rankers now | Win | Wave |
|---|---|---|---|---|---|---|---|---|---|
| C121 | NEW `/ms/cara-schedule-post` (hub) | BM guide | cara schedule post | cara schedule post twitter / x (H2, X credit in USD); cara schedule post linkedin (H2, profiles only); aplikasi schedule post; cara schedule tweet | I | **High** for BM (AC-my 10, MY30, MY39–40, MY44) | n/m · expected Meta/TikTok help, YouTube tutorials, Indonesian media [inferred] | months | W1 (test) |
| C122 | NEW `/ms/cara-schedule-post-instagram` | BM guide | cara schedule post instagram | di pc / laptop / hp / web; story, reels; cara check / cek schedule post; schedule post instagram tidak muncul (troubleshooting) | I | Med–high (AC-my 10, MY31–35) | n/m | months | W1 (test) |
| C123 | NEW `/ms/cara-schedule-post-facebook` | BM guide | cara schedule post di facebook | cara nak schedule post di facebook; cara melihat schedule post facebook. Pages only, said plainly | I | Med (AC-my 5, MY36–37) | n/m | months | W1 (test) |
| C124 | NEW `/ms/cara-schedule-post-threads` | BM guide | cara schedule post threads | di threads | I | Low–med (AC-my 3+1, MY38) | n/m · expected few BM pages [inferred] | **weeks** | W1 (test) |
| C125 | NEW `/ms/cara-auto-post-facebook-instagram` | BM guide | cara auto post | aplikasi auto post facebook / instagram; cara buat auto post di facebook (Pages through Meta's official API; not groups) | I/C | Med (AC-my 9, MY68–70) | n/m | months | W1 (test) |
| C126 | NEW `/ms/cara-buat-link-bio` | BM guide | cara buat link bio | di tiktok / ig; cara buat link whatsapp di bio ig; cara letak link di bio instagram. Must not imply the bio page itself is in BM | I | Med–high (AC-my 10, MY93–95) | n/m | months | W1 (test) |
| C127 | NEW `/ms/harga` | BM pricing | harga (Siar) | RM39 / RM99 / RM399; yearly paid once by FPX or DuitNow; 20 free posts to try; price lock; H2 "Berapa kos urus media sosial?" | C | Low (completions are Indonesian, MY25) | n/m | weeks | W1 (test) |
| — | HOLD `/ms/cara-auto-reply-instagram`; BM TikTok and YouTube how-tos | BM guide | cara auto reply instagram; cara schedule post tiktok | | I | Med (AC-my 10, MY41, MY79) | n/m | months | HOLD (DM beta; TikTok; YouTube) |

---

## 4. Priority order

Waves are about **when to build and how fast a page can rank**, not importance alone. Every wave assumes wave 0 is done.

### Wave 1: winnable in weeks (start now)

Long-tail, per-network pain, thin comparison fields and Malaysian terms. About 55 URLs: about 26 existing pages
retitled or upgraded (error pages, hubs, use cases) and 29 new (7 of them the BM test set).

| Order | Cluster(s) | Why now |
|---|---|---|
| 1 | C92 LinkedIn 426 / version sunset | 202511 sunsets 2026-11-16 [sourced]; dated answer, exact code |
| 2 | C72, C81, C84, C88, C95, C104, C108, C102 error pages + C114 `/errors` hub | 147 codes already written; small vendors (postpeer.dev) already rank with the same page type [CS]; p038–p042 are exact codes Siar already has [AA, measured] |
| 3 | C01, C02, C03, C07, C08, C11, C12 retitles; network hub retitles C64, C74, C82, C85, C89, C106 | Home targets no keyword today; hosted-connect targets a phrase with no demand [CS] |
| 4 | C97 `/youtube-api/quota`, C98 `/youtube-api/audit` | Google changed upload rules 2026-11-02 and the bucket is separate; ranking pages predate the change [PN, inferred] |
| 5 | C15, C16 (comments, webhooks use cases): indexing + links + H2s | Thin fields (AC 2 each), pages exist but are not in Google [CS] |
| 6 | C18 `/use-cases/link-in-bio-api` | No API vendor has this page; Siar has full CRUD + analytics [US, code] |
| 7 | C22 `/guides/post-to-multiple-social-networks-api` | A domain first seen 2026-10-03 holds DDG #1 [HU] |
| 8 | C76 `/facebook-api/meta-app-review`, C91 `/linkedin-api/community-management-api`, C103 `/pinterest-api/access` | First-hand, dated gate stories; thin SERPs [PN, inferred]. Meta: "already approved" is a true CTA |
| 9 | C106/C107 Bluesky, C82/C83 Threads, C109 Mastodon, C111 Slack rate limits | Live networks, low competition, cheap [PN] |
| 10 | C23, C24, C25 (p010, p045, p049 guides) | Code-backed answers nobody targets [AA] |
| 11 | C26 `/guides/social-media-api-pricing` | GEO P3; "cheapest" has 2 rival pages; answers p006, p007, p027. Scenario arithmetic only, no "cheapest" headline |
| 12 | C46 `/compare` + C50 buffer-api, C51 hootsuite-api, C53 metricool-api, C54 publer-api | Thinnest comparison fields (1–6 rival pages) [AV]; Buffer has a shutdown trigger. Needs the comparison go |
| 13 | C32 `/guides/n8n-threads-posting` | No n8n Threads node; uses the live REST API [AG] |
| 14 | C115 `/malaysia` + C121–C127 BM test set | Thin MY SERP (Duta #1 with 23 URLs) [MY]; BM how-to demand is real [MY] |
| 15 | C42 "<Network> MCP" H2s on six network hubs (no install lines) | Captures per-network MCP demand on existing pages [AG] |
| 16 | C06 `/pricing` H2s (free, per organization, price lock) | The "unlimited accounts" H2 waits for the wording decision |

**Off-site in wave 1** (not pages, but they decide AI answers faster than any page; Fakhrul's go, real facts only):
AlternativeTo, Capterra/GetApp, G2 and SourceForge listings that name Ayrshare as the product replaced [AV, AA]; a short
factual pitch to the maintained roundups (Buffer, Blotato, Upload-Post, Zernio, PostPlanify, Ayrshare; updated
2026-09-23 to 2026-11-06) [AA, measured]; the GitHub README and description fix [AA].

### Wave 2: months

Head-adjacent commercial terms, the Instagram/Facebook/X/LinkedIn clusters, most comparisons and the AI clusters once
npm unblocks. About 38 new pages plus 4 existing use cases.

| Order | Cluster(s) | Note |
|---|---|---|
| 1 | C68 `/instagram-api/publishing-limit`, C66 reels, C67 stories, C65 how-to-post, C70 comments, C71 insights | Live network, medium demand, small-vendor SERPs [PN, US] |
| 2 | C09 posting, C10 scheduling, C13 AI agents, C14 analytics (use cases) | Exist; need links, mentions and indexing |
| 3 | C47 `/compare/ayrshare`, C48 zernio, C49 upload-post, C52 sprout-social-api, C55 blotato | Ayrshare page lands while directory listings do the early work |
| 4 | C75, C77, C78 Facebook topics; C86 X how-to; C90 LinkedIn how-to; C110 Discord scheduling | |
| 5 | C27 `/guides/social-media-api-integration`, C35 multiple clients, C17 agencies use case, C19 inbox use case | C17 waits for the "unlimited accounts" wording; C19 for the DM beta wording |
| 6 | C30 n8n hub, C31 n8n Instagram, C34 AI agent LinkedIn | REST only, not blocked |
| 7 | C41 MCP page, C42 `/mcp/*` pages, C43–C45 Claude / Claude Code / OpenAI guides | Blocked on npm; then directory listings first (official registry, PulseMCP, Glama, mcp.so, awesome-mcp-servers) |
| 8 | C04 `/platforms/approvals`, C05 `/platforms/limits` | Hubs linking the gate and quota pages |
| 9 | C94 `/tiktok-api/audit` | Fakhrul's call |
| 10 | C87 `/x-api/pricing` | Only after the X terms check; the highest commercial demand Siar can serve |
| 11 | C99 `/youtube-api/shorts` | Only after a recorded public upload |
| 12 | C61 `/compare/meta-business-suite`, C116 Malaysia cost guide | |

### Wave 3: long-term (head terms and dashboard heads)

| Cluster(s) | Note |
|---|---|
| C01 ranking for "social media api" and "unified social media api" on Google | Needs authority built by waves 1–2 |
| C29 `/guides/best-social-media-apis`, C28 what-is guide | Own listicle with a stated method; must not rank Siar first |
| C39 post to multiple accounts at once; C40 scheduler pricing; C117–C120 English dashboard how-tos | High demand, owned by Hootsuite, Sprout, SocialPilot and Meta help |
| C56 postiz, C57 outstand, C58 mixpost, C62 zoho-social | Crowded or low value |
| C33 Make, C36 e-commerce, C37 Python, C38 build-a-scheduler | Low demand |
| C69, C79, C80, C93, C96, C100, C101, C105, C112, C113 | Network heads and guide-only pages for networks not open |

### Hold (do not publish until the gate clears)

| Cluster | Gate |
|---|---|
| C59 `/compare/bundle-social`, C60 migration guide | bundle.social naming decision |
| C20 comment-to-DM, C73 Instagram DM, C63 ManyChat, BM auto-reply | DM beta opened to every paid organization |
| C21 video publishing, BM TikTok/YouTube how-tos, TikTok scheduling terms | TikTok audit; YouTube public upload test |
| C87 X pricing | X Developer Agreement check |
| C41–C45 MCP pages | npm publish |
| Any "white label" wording (HU44–47, US25–26, US52) | A connect page without "Powered by Siar" on the customer's domain |

### Skip (traps and wrong intent)

| Term | Why | Source |
|---|---|---|
| free social media api / social media posting api free | Free is 20 free posts to try, one-time; answer as an honest H2 only | HU21, HU59 |
| social media api open source; ayrshare open source alternative; ai social media manager open source | Siar is not open source | HU64, AV4 |
| embedded social media; social media api aggregator | Website feed widgets | HU10, HU52 |
| hosted oauth; social media login api; connect social accounts | OAuth servers, social sign-in, consumer brands | HU80, US45, US48, US50 |
| crosspost api; cross posting app | dev.to/Hashnode/Facebook video; reseller tools | HU34, US56 |
| buffer api (head) | Collides with Node.js `Buffer` | HU42 |
| late alternative | Dictionary noise | AV27 |
| x / twitter api alternative | Siar charges X's own price, not cheaper | AV83 |
| linkedin community management api alternative | Siar's own Pages access was denied | AV86 |
| generic hootsuite / buffer / later alternatives | SMB scheduler field, very high authority | AV52, MY11 |
| ayrshare reviews; ayrshare alternatives reddit | No reviews to offer; answer in threads instead | AV2, AV11 |
| rival-vs-rival pairs (zernio vs blotato, postiz vs zernio, upload post vs blotato) | Siar is in neither name | AV33–34, AV40 |
| white label social media management / software / reports | Rebrandable dashboard; product gap | HU45–47, US20 |
| social media approval workflow; client approval; client portal | No approval step; Notion templates | US15–18 |
| social media data / monitoring / listening api; comment moderation (ML sense) | Scraping and toxicity, not Siar | US81, US90 |
| unified messaging api; omnichannel inbox api | Telephony / CPaaS | US104 |
| shopify instagram integration; wordpress auto post | Feed widgets; plugin seekers | US66, US68 |
| auto post facebook group(s), fewfeed | Grey group posting; one FAQ line only | MY61–62 |
| best time to post (any locale), waktu terbaik post, jadual post | Siar has no posting data of its own | MY46–48, MY113 |
| WhatsApp API / chatbot (MY), grant terms, Singapore and Indonesian pages | No WhatsApp; not on MDEC panel; no demand or no local pricing | MY89, MY105–121 |
| remote MCP url / connector terms (instagram mcp url, claude connector, chatgpt connector) | No remote MCP endpoint | AG10, AG15–16, AG55 |
| zapier alternative; n8n mcp; make mcp; ai social media manager; ai agent social media | Wrong market (automation platforms, consumer AI tools, agent social networks) | AG36–37, AG80, AG87–88, AG102 |
| creator tool heads; analytics tool heads; link in bio / linktree alternatives (consumer) | Dashboard heads Siar cannot win today | US53–55, US82, US109–112 |
| TikTok / YouTube / Pinterest / Reddit variants of n8n, MCP, Claude, Zapier | Networks not open | AG28–31, AG73–75 |

---

## 5. AI-answer prompt clusters and the page that should earn each citation

Source: `research/keywords/ai-answers.md` (AA), which fetched the 18 pages engines draw on for the commercial prompts.
Siar appears on 0 of 18 [measured]. What ChatGPT, Perplexity, Gemini and AI Mode actually answer is **not measured**:
the wave-0 sheet `docs/geo/visibility/manual-2026-10-13/manual.csv` is still empty.

### 5a. The ten clusters

| # | Cluster | Prompts | What engines draw on today | Page that should earn the citation | State |
|---|---|---|---|---|---|
| 1 | Definition / discovery | p001, p002, p009, p024 | SaaS blogs for "what is"; vendor explainers for "unified" and "post to multiple networks" (HU7, HU11, HU27) | C28 (what-is), C22 (multiple networks), C13 (agents), C27 (build vs buy) + home FAQ | None of the guides exist |
| 2 | "Best X for Y" | p003, p004, p005, p010, p050 | 15 of 18 pool pages are vendor-written; 14 rank their author first (AA, measured) | **Roundup inclusion first**; then C10, C11, C17, C23 | Absent from all 18 |
| 3 | Capability | p016, p017, p018, p019, p020 | Vendor feature pages with exact-match slugs (HU75–79) | C12, C16, C15, C14 (exist); p017 has no honest page (white label) | Pages exist; 3 not indexed |
| 4 | AI agents / MCP | p008, p009, p037 | MCP directories, the official registry (lists Zernio, Upload-Post, Outstand, Blotato, Publora), the MCP column in every roundup | Directory listings + C41 + `/docs/sdk-cli-mcp` | Blocked: npm 404, stdio only, in no registry |
| 5 | Alternatives / vs | p021, p022, p023, p025, p026, p036 | AlternativeTo, Capterra/GetApp, then 13 vendor alternative pages (AV1) | Directory listings, then C47, C48, C27 H2; p022/p023 parked | No listings, no compare pages |
| 6 | Pricing / cheapest / free | p006, p007, p027, p028, p029, p030 | Vendor pricing pages (often `.md`), 2 "cheapest" posts, Zernio and social-api.ai explainers | C26, `/pricing` + `/pricing.md` (unit in the first line), C47 H2, C87 | Copilot misquotes Siar (fix 0.3 first) |
| 7 | Branded facts | p031–p035, p037 | siaran.my for "siar api" (DDG #3–4), "Siar social media API" (Bing #2–3) (CS) | `/`, `/about`, `/pricing`, `/platforms`, `/llms.txt`, GitHub README: all must agree | Inconsistent today (calculator, "15 networks", GitHub description) |
| 8 | How-to per network | p011–p015, p043, p044, p045, p049 | Native docs plus vendor how-tos (PN4, PN68) | Network hubs and topic pages (C64–C113), C24, C25 | Live-network pages can win; TikTok/LinkedIn pages/YouTube Shorts/GBP only as reference with a status line |
| 9 | Troubleshooting codes | p038–p042 | Per-code error pages (PN16, PN46) | Error pages C72, C95, C108, C92, C88 | All 5 codes already on Siar's pages [measured]; indexing is the blocker |
| 10 | Malaysia | p046, p047, p048 | No relevant result / thin small-blog SERP (HU91–92) | C115 `/malaysia` | Not built |

### 5b. Every prompt in `prompts_v1.csv` → its page

| Prompt | Text (short) | Citation page | Can Siar be the recommendation? |
|---|---|---|---|
| p001 | what is a unified social media API | C28 + `/` FAQ | Yes, as a definition source |
| p002 | post to multiple networks from one API | C22 | Yes (live networks) |
| p003 | best API to schedule IG, TikTok, LinkedIn | C10 | **No** while TikTok is unaudited and LinkedIn pages denied; reference only |
| p004 | best social media API for SaaS | C11 + roundup inclusion | Yes |
| p005 | posting API for agencies | C17 | Yes, after the accounts wording |
| p006 | priced per organization, not per account | `/pricing` first line + C26 | Yes, but not unique (bundle.social, Outstand, Post for Me) |
| p007 | cheapest with unlimited accounts | C26 (scenarios) | Only for the "many accounts, few brands" case |
| p008 | API with an MCP server | C41 + registries | Blocked (npm) |
| p009 | how can an AI agent post | C13 | Yes (REST today; MCP after npm) |
| p010 | Bluesky, Mastodon, Threads at once | C23 | Yes, all three live |
| p011 | post to Google Business Profile | `/google-business-profile-api` (status) | No (parked) |
| p012 | Instagram via API without a Meta app | C64 / C65 | Yes (Siar's Meta app approved 2026-10-27) |
| p013 | post to TikTok via API | C96 (guide only) + C94 | No |
| p014 | LinkedIn company page via API | C91 (guide only) | No |
| p015 | schedule a YouTube Short via API | C99 | Not until a public upload is tested |
| p016 | let customers connect with OAuth | C12 (+ C35 H2) | Yes ("branded connect link") |
| p017 | white-label connect link | C12, honest | No (Powered by Siar) |
| p018 | webhooks when a post is published | C16 | Yes |
| p019 | read and reply to IG/FB comments | C15 + C70, C78 | Yes |
| p020 | analytics API for multiple networks | C14 | Yes (paid plans) |
| p021 | Ayrshare alternatives | directory listings + C47 | Yes, once listed |
| p022 | bundle.social alternatives | C59 | Parked |
| p023 | Ayrshare vs bundle.social | C59 / C47 H2 | Parked |
| p024 | alternatives to building every integration | C27 | Yes |
| p025 | Late API vs Ayrshare | C48 | Yes ("Zernio, formerly Late") |
| p026 | open source vs hosted posting API | C27 H2 | As the hosted option, honestly |
| p027 | how much does a social media API cost | C26 | Yes |
| p028 | Ayrshare pricing per profile | C47 H2 | As a cited second source |
| p029 | X API cost per post 2026 | C87 (held); meanwhile `/x-api` credit table | Yes, from docs.x.com prices |
| p030 | free social media posting API | `/pricing` FAQ | No as "free API"; "20 free posts to try" |
| p031 | what is Siar | `/`, `/about`, `/llms.txt` | Yes, if facts agree |
| p032 | Siar pricing | `/pricing`, `/pricing.md` | Yes, after fix 0.3 |
| p033 | which networks Siar supports | `/platforms` with status | Yes, after fix 0.4 |
| p034 | is Siar legit | `/about` + directory listings | Needs third-party confirmation; no invented reviews |
| p035 | who makes Siar | `/about` | Yes |
| p036 | Siar vs Ayrshare | C47 | Yes |
| p037 | does Siar have an MCP server | `/docs/sdk-cli-mcp` | "Yes, not installable yet" until npm |
| p038 | Instagram error 2207042 | C72 | Yes |
| p039 | TikTok spam_risk_too_many_posts | C95 | Yes, as reference |
| p040 | Bluesky ExpiredToken | C108 | Yes |
| p041 | LinkedIn 422 duplicate | C92 | Yes |
| p042 | X 403 duplicate content | C88 | Yes |
| p043 | Instagram reel limits for API | C66 | Yes (limits from code) |
| p044 | TikTok video upload limits API | C93 | Reference only |
| p045 | avoid double posting on retry | C24 | Yes (code-backed) |
| p046 | social media API Malaysia | C115 | Yes |
| p047 | API untuk post ke IG dan TikTok serentak | C115 FAQ | Instagram half only |
| p048 | Malaysian agency tool with API | C115 | Yes |
| p049 | release notes to Slack, Discord, LinkedIn, X from CI | C25 | Yes (LinkedIn profiles) |
| p050 | multi-tenant, one key many customers | C11 | Yes |

### 5c. Off-site surfaces that decide citations (by cluster)

| Surface | Clusters | Blocker |
|---|---|---|
| AlternativeTo, Capterra/GetApp, G2, SourceForge listings | 2, 5, 7 | Comparison go; real facts only |
| Maintained roundups (CP 1–5, 7, 14 in AA) | 2, 4, 6 | Fakhrul's go; send the table facts: networks open today, entry price, pricing unit, MCP, SDK, webhooks, free tier |
| Official MCP registry, PulseMCP, Glama, mcp.so, awesome-mcp-servers | 4 | npm publish; a namespace Siar controls |
| n8n template gallery | 1, 4 | None |
| GitHub README and description | 7 | Fix "on 15 social networks" wording |

---

## 6. Bahasa Melayu: recommendation

**Build a small BM test set, not a BM site.** Evidence from `malaysia-bm.md` (autocomplete measured; demand inferred):

- Malaysians do not search for a Malaysian *tool*: "social media scheduler malaysia", "…api malaysia", "harga / pakej
  pengurusan media sosial", "aplikasi jadual post" all return 0 completions.
- BM demand is **how-to per network, typed in mixed BM-English**: "cara schedule post" (AC-my 10), "cara schedule post
  instagram" (10), "cara auto post" (9), "cara buat link bio" (10), "cara auto reply instagram" (10).
- Formal Malay returns nothing: "jadualkan", "hantaran", "serentak", "pakej" (0 each). Write the words people type
  ("schedule post", "auto post", "link bio"), not dictionary Malay.
- Traps: hl=ms autocomplete mixes in Indonesian completions, so BM pages compete with Indonesian content; in Indonesian
  "api" means fire ("api tiktok" is the TikTok streak).

**The set (wave 1):** C121 `/ms/cara-schedule-post` (hub), C122 `-instagram`, C123 `-facebook`, C124 `-threads`,
C125 `/ms/cara-auto-post-facebook-instagram`, C126 `/ms/cara-buat-link-bio`, C127 `/ms/harga`. Each opens with the free
native answer (Meta Business Suite, Instagram's own scheduler), then shows Siar for several networks at once, and links
to `/ms/harga`.

**Hold:** `/ms/cara-auto-reply-instagram` and anything comment-to-DM (DM beta), TikTok and YouTube how-tos (approvals).
"Comment HARGA" / "PM harga" are not searches (AC-my 0, or Indonesian and time-of-day meanings); they are ad copy, and
siar-truth bans that ad until DMs open to everyone.

**Do not build:** a translated home page, translated network or docs pages, BM agency/"pakej" pages, Indonesian or
Singapore pages.

**Known costs:** the dashboard and the hosted connect page are English only, so a BM reader who signs up lands in English;
say so on the page. The site layout is `<html lang="en">`, so `lang` and `hreflang` are new work.

**Kill rule:** this contradicts `docs/geo/plan.md` ("buyers search in English; revisit if GSC shows demand"). Resolve
with data: verify GSC first, publish the 7 pages, drop the set if it earns no impressions within 8–12 weeks of being
indexed. The English `/malaysia` page (C115) stays either way.

---

## 7. Deduplication decisions (where the sweeps disagreed)

| Sweeps proposed | Decision | Why |
|---|---|---|
| `/guides/social-media-api-pricing` (HU, AV, AA) · `/social-media-api-pricing` (PN) · `/instagram-api/pricing` (PN) | One page: C26 `/guides/social-media-api-pricing`; per-network fee answers as H2s there and on the hubs | Same intent; the per-network pricing SERPs are data vendors (PN12) |
| `/guides/social-media-scheduler-pricing` (US) | Separate page C40, wave 3; may merge into C26 | Dashboard buyer, different SERP |
| `/guides/what-is-a-social-media-api` (HU) · `/guides/what-is-a-unified-social-media-api` (AA) | One page C28 | Same question, "meaning" as H2 |
| `/guides/social-media-api-integration` (HU) · `/guides/build-vs-buy-social-media-api` (AA) · `/guides/add-social-publishing-to-your-saas` (HU, US) | One page C27 | The SaaS and build-vs-buy forms have AC 0; "social media api integration" carries the demand (AC 6) |
| `/guides/schedule-social-media-posts-with-an-api` (HU24) | Merged into C10 scheduling use case | Same intent as the use case |
| `/guides/let-clients-connect-social-accounts` (US46) | H2 in C35, linked from C12 | Low demand; p016 is cited from C12 |
| `/linkedin-api/company-pages` (PN55) | Merged into C91 | The honest answer to "post to company page" is the gate |
| `/x-api/credits` (PN45) | H2 in C87 | Same buyer; held together |
| `/guides/post-to-linkedin-from-claude` (AG) · `/guides/post-to-social-media-from-claude` (US) | One page C43 with a LinkedIn H2 | Avoid two thin npm-blocked pages |
| `/guides/auto-post-to-facebook-page` (MY63) | H2 in C120 | Overlapping completions |
| `/link-in-bio` (MY96, consumer) · `/use-cases/link-in-bio-api` (US) | Only C18 (API) + C126 (BM how-to) | Consumer heads unwinnable (US109–110) |
| `/compare/hootsuite`, `/compare/buffer` (MY11, dashboard) · `/compare/hootsuite-api`, `/compare/buffer-api` (HU, AV) | Only the `-api` pages; generic "alternatives" skipped | Generic SMB field is unwinnable (AV52) |
| Threads scheduling guide (MY53) | H2 on C82 | Low demand |
| `/use-cases/social-media-api-for-video-tools` (US61) · `/use-cases/video-publishing-api` (HU40) | One held page C21 | Same gate |
| `/compare/post-for-me`, `/compare/postproxy` (others-dev-apis) | H2 rows on C46 hub | Very low brand demand (AV66–67) |

---

## 8. Measurements to run next (with fresh search budget)

The "weeks" grades in wave 1 rest on very few measured result pages. Run these first, in this order (Google `gl=us`
via GSC once verified; Bing; and Brave or Google `gl=my` for the Malaysian rows):

1. Wave-1 deciders: "linkedin api error 426", "youtube data api quota", "youtube api upload limit", "youtube api upload
   private", "meta app review taking time", "linkedin community management api", "pinterest api standard access",
   "link in bio api", "hootsuite api alternative", "metricool api alternative", "buffer api alternative", "cheapest social
   media api", "n8n threads", "threads api post", "bluesky api create post", "slack api rate limits non marketplace".
2. Wave-2 deciders: "instagram api post limit" (re-run), "instagram comments api", "facebook comments api", "instagram
   analytics api", "ayrshare pricing", "zernio alternative", "upload-post alternative", "tiktok content posting api
   audit", "n8n post to instagram".
3. Malaysia: "cara schedule post", "cara schedule post instagram", "cara schedule post di facebook", "cara schedule post
   threads", "cara buat link bio", "meta business suite alternative", plus a re-run of "social media scheduler malaysia".
4. Re-run at least 10 of the single D/W measurements in sections A–C before quoting any rank.
5. Fill wave 0 of the AI-visibility sheet (`docs/geo/visibility/manual-2026-10-13/manual.csv`), then compare the 18-page
   citation pool with what ChatGPT and Perplexity actually cite for p004, p008, p021, p027 and p038.
6. Once GSC and BWT are verified, replace every demand grade here with impressions, and re-wave clusters that earn none.

---

## Sources

All checked or measured 2026-11-12 by the sweeps named; this file adds no new measurements.

- `docs/seo/research/keywords/head-unified.md`, `per-network.md`, `alternatives-vs.md`, `malaysia-bm.md`,
  `ai-agents-mcp.md`, `use-case-segments.md`, `ai-answers.md` (row codes HU, PN, AV, MY, AG, US, AA)
- `docs/seo/research/current-site.md` (CS), `docs/seo/research/siar-truth.md`
- `docs/seo/research/competitors/*.md` (vendor facts, each sourced to the vendor's own page with URL)
- `docs/seo/research/market/buyers-pains.md`, `docs/seo/research/market/malaysia-market.md`
- `docs/geo/plan.md`, `docs/geo/offsite-plan.md`, `docs/geo/owner-todo.md`, `docs/geo/prompts_v1.csv`
- Vendor and network pages quoted above are cited with their URLs in those files, for example
  https://developers.google.com/youtube/v3/revision_history, https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview,
  https://docs.x.com/x-api/getting-started/pricing, https://developers.facebook.com/docs/instagram-platform/content-publishing,
  https://developers.tiktok.com/doc/content-sharing-guidelines, https://linktr.ee/marketplace/developer,
  https://developer.hootsuite.com/docs/faq, https://api.sproutsocial.com/docs/, https://publer.com/docs,
  https://metricool.com/pricing/, https://zernio.com/pricing.md, https://www.ayrshare.com/pricing/,
  https://www.outstand.so/pricing.md, https://bundle.social/pricing
- Not used: any new web search. The shared WebSearch budget for this turn was already spent (one test query refused).
