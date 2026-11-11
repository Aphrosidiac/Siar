Verified 2026-11-12: 8 corrections

# Keyword sweep: head and core "unified social media API" terms

Checked 2026-11-12. Builds on `docs/geo/plan.md` (P3 comparison pages and pricing explainer), `docs/seo/research/current-site.md`
(page inventory, indexing, cannibalisation) and the competitor teardowns in `docs/seo/research/competitors/`. It does not repeat them.
Siar wording follows `docs/seo/research/siar-truth.md`. Where that file and the brief disagree, the truth file wins: it says
270 operations in an OpenAPI 3.0 document, not "3.1 / ~263".

## Method and labels

There is no keyword-volume tool, so demand is an estimate from the evidence below. Every demand grade is **inferred**.

| Code | What it is | Label |
|---|---|---|
| **AC** | Google autocomplete (`suggestqueries.google.com`, `client=firefox`, `hl=en`, `gl=us`; one run with `gl=my`), fetched 2026-11-12. "AC n" = number of completions returned for the seed. A seed that returns its own phrase plus related phrases is a real query. A seed with 0 completions has little or no volume | measured |
| **D** | DuckDuckGo HTML results (`kl=us-en`, Bing-backed index), top 5 in rank order, fetched 2026-11-12. DuckDuckGo blocked the scraper ("anomaly" page) after 17 queries, so only rows 1–17 have D data | measured |
| **W** | The WebSearch tool (US; the engine is not disclosed). These are the first 5 results in the order the tool returned them. It is a proxy for Google, not a Google SERP: treat the order as indicative | measured (tool output), order indicative |
| **Wayback** | First Wayback Machine capture of a ranking domain, a proxy for domain age | measured |
| **HN** | Hacker News stories containing the exact phrase (Algolia API) | measured |

**Re-check status (verification pass, 2026-11-12).** Autocomplete was re-run for 90+ seeds and matches the AC column except
where a row says otherwise. HN counts (10 for "social media api", 60 for Ayrshare, typo tolerance off) and the Wayback first
captures (social-api.ai 2026-06-10, postwire.io 2026-10-03, postpeer.dev 2026-03-31, crosspostapi.com none) were re-measured and
match. Every competitor URL named below was fetched and returns 200 unless a row says otherwise. **The "Top 5 now" columns
(D and W) could NOT be re-run:** DuckDuckGo served its block page to the verification script and the WebSearch budget for this
run was exhausted before the sample searches went out. Treat every D/W ranking, and the "siaran.my ranks for none" line below,
as a single unreplicated run: **unverified on re-check**. Re-run at least 10 of them before quoting a rank anywhere.

Not reachable: Google Trends (HTTP 429), Google and Startpage SERPs (no results to a script), Bing (it returns unrelated
filler to scripts) and Reddit search JSON (blocked). People Also Ask was not visible through any of these routes, so PAA is not used.

siaran.my ranks for none of the 17 D-checked terms (it is not in the top 10 for any of them) [measured in the first run; unverified on re-check]. That matches `current-site.md`.
Google has indexed about 32 of the site's 89 URLs, and there is no Search Console access [measured in `current-site.md`].

**Winnability scale (inferred):** *weeks* = a strong exact-match page can enter the Bing/DDG top 10 within weeks of being indexed;
*months* = 2–6 months, and it needs internal links plus a few off-site mentions; *long-term* = 6–12+ months, and it needs
authority Siar does not have; *unlikely* = the intent does not match what Siar can truthfully offer, or the brand owner always wins.
The evidence for "weeks" on Bing/DDG: domains first captured in 2026 already hold the top 3 for several terms
(social-api.ai, first captured 2026-06-10, is #1 for "unified social media api"; postwire.io, first captured 2026-10-03, is #1 for
"post to multiple social networks api"; postpeer.dev, first captured 2026-03-31, is #2 on 9 of 17 terms) [Wayback dates re-measured; D ranks measured once, unverified on re-check].
On Google (W), older vendors such as Ayrshare, Zernio/getlate.dev and bundle.social and the big SaaS blogs hold more of the top 5.

**Page types:** landing = commercial product page · use-case = existing `/use-cases/*` template · guide = how-to with code ·
compare = sourced, dated comparison page (GEO plan P3) · listicle = "best X" with a stated method · H2 = a section on an existing page, not a new URL.

## Keyword table

Siar page: an existing URL from `https://siaran.my/sitemap-0.xml` (89 URLs, fetched 2026-11-12), or **NEW** `/slug`.

### A. Generic head terms

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 1 | social media api | Mixed: info + commercial | **High** | AC 10 (free, github, meaning, late, integration, open source, for developers, key, aggregator); HN 10 stories | D: sociavault.com, postpeer.dev, socialcrawl.dev, social-api.ai, socialapis.io · W: blog.hootsuite.com, getstream.io, api7.ai, toptal.com, dataforseo.com | long-term | landing (home) | `/` (retitle; it targets no keyword today) |
| 2 | social media apis | Commercial (lists) | Med | AC 10 (for developers, for posting, for agentic workflows, free, github) | D: rapidapi.com, bundle.social, influencers.club, data365.co, ayrshare.com/blog | long-term | listicle | **NEW** `/guides/best-social-media-apis` |
| 3 | social media apis for developers / social media api for developers | Commercial | Med | AC: under "social media apis" and "social media api for"; "the social media and messaging api for developers and ai agents" is also a completion (a competitor tagline) | W: buffer.com/resources, blotato.com, dev.to, octolens.com, upload-post.com | months | listicle | **NEW** `/guides/best-social-media-apis` |
| 4 | best social media api | Commercial | Med | AC ("best social media api", "best social media posting api") | W: buffer.com, blotato.com, dev.to, octolens.com, upload-post.com (vendor listicles, each ranks itself first) | long-term | listicle | **NEW** `/guides/best-social-media-apis` |
| 5 | best social media posting api | Commercial | Low–med | AC | W: same cluster; postpeer.dev/blog/best-social-media-posting-apis also ranks | months | listicle | **NEW** `/guides/best-social-media-apis` (H2) |
| 6 | best social media scheduling api | Commercial | Low | No AC of its own; W for "social media scheduling api" shows "best" listicles | W: ayrshare.com/blog (best posting and scheduling APIs), opus.pro, getlate.dev/blog | months | listicle | **NEW** `/guides/best-social-media-apis` (H2) |
| 7 | what is a social media api / social media api meaning | Informational | Med | AC "social media api meaning" appears under 4 seeds | W: brandwatch.com, agorapulse.com, blog.hootsuite.com, sproutsocial.com, socialchamp.com | long-term | guide (glossary) | **NEW** `/guides/what-is-a-social-media-api` (low priority) |
| 8 | api for social media platforms | Informational | Low–med | AC under "api for social media" | not checked | long-term | guide | `/guides/what-is-a-social-media-api` (H2) |
| 9 | social media rest api | Commercial | Low | AC "social media rest api" | not checked | months | H2 | `/` |
| 10 | social media api aggregator | Mixed (feed widgets + publishing) | Low–med | AC (also "what is a social media aggregator") | not checked; [inferred] feed aggregators (Juicer, Flockler) share it | months, intent mismatch | H2 | `/` (one line) or skip |

### B. "Unified" terms

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 11 | unified social media api | Commercial | Med | AC: the phrase plus 3 unrelated "unified … meaning" completions (re-check 2026-11-12), so no phrase-specific completions beneath it. Vendors using the exact phrase in a title or URL [measured 2026-11-12]: Ayrshare home title ("Unified Social Media API for 14+ Networks"), bundle.social `/unified-social-media-api`, zernio.com/blog/unified-social-media-api, keyapi.ai (home title), social-api.ai (home title), crosspostapi.com ("Unified Social Publishing API"). unified.to has a social category in its docs but does not use the phrase on its home page. flockler.com ranks but sells a social media *aggregation* (feed) API and does not use the phrase (sitemap checked) | D: social-api.ai, postpeer.dev, docs.unified.to, unified.to, ayrshare.com · W: ayrshare.com, docs.unified.to, getlate.dev/blog (301 → zernio.com), unipile.com, flockler.com | months (Bing: weeks) | landing (home) | `/` (title + H1 subline) |
| 12 | unified social api | Commercial | Low | AC | D: social-api.ai, postpeer.dev, unified.to, bundle.social, postforme.dev | months | landing | `/` |
| 13 | unified api for social media / unified api social media | Commercial | Low | AC under "api for social media" and "unified api social" | D: social-api.ai, postpeer.dev, unified.to, ayrshare.com, bundle.social | months | landing | `/` |

### C. Posting and publishing API

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 14 | social media posting api | Commercial/transactional | **Med–high** | AC 8 (free, best, publishing api, post scheduler api); `gl=my` AC for "api social media" also returns "api social media posting" | D: postforme.dev, postpeer.dev, github.com/ayrshare/social-media-api, upload-post.com, zernio.com · W: getlate.dev/blog, socket.dev, docs.ayrshare.com, ecosyste.ms (Ayrshare repo), postpeer.dev | months | use-case | `/use-cases/social-media-posting-api` (already titled for it) |
| 15 | social media publishing api | Commercial | Low–med | AC | D: publora.com, ayrshare.com/social-media-publishing-api, postproxy.dev, social-api.ai, muapi.ai | months | H2 + meta | `/use-cases/social-media-posting-api` |
| 16 | post to social media api / api to post to social media | Commercial | Med | AC: "post to social media api"; "api to post to social media" sits among the per-network variants (instagram, tiktok, facebook, twitter) | D (post to…): postforme.dev, postpeer.dev, github ayrshare, upload-post.com, muapi.ai · D (api to…): ayrshare.com/blog, github ayrshare, postpeer.dev, buffer.com/resources, muapi.ai | months | use-case | `/use-cases/social-media-posting-api` |
| 17 | api for social media posting / social media apis for posting | Commercial | Low–med | AC under "api for social media" and "social media apis" | not checked | months | use-case | `/use-cases/social-media-posting-api` |
| 18 | social posting api | Commercial | Low | AC returns only generic "social media api" completions | not checked | months | — | `/use-cases/social-media-posting-api` |
| 19 | social media automation api | Commercial | Low | AC 2 | W: contentstudio.io, zylalabs.com, planable.io, blotato.com, getlate.dev/blog | months | H2 | `/use-cases/social-media-posting-api` |
| 20 | auto post to social media api | Commercial | Low | No AC for the API form; consumer forms are big (see F) | not checked | months | H2 | `/use-cases/social-media-posting-api` |
| 21 | social media posting api free / free social media posting api | Transactional | Med | AC (2nd completion of "social media posting api"; also under "free social media api") | W: buffer.com/resources, getlate.dev/blog/social-media-api-free, postpeer.dev, contentstudio.io, mcpservers.org | **unlikely** as "free API": Siar Free is 20 free posts to try, one-time. Vendors with a monthly free tier win this | H2 (honest answer) | `/pricing` (H2 "Is there a free social media API?") |

### D. Scheduling API

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 22 | social media scheduling api | Commercial | Med | AC: completions include "social media management api", "post scheduler api", "buffer social media management api" | D: publora.com, postpeer.dev, socialschedule.ai, bundle.social (2 URLs) · W: planable.io, ayrshare.com/blog, postly.ai, postpeer.dev, opus.pro | months | use-case | `/use-cases/social-media-scheduling-api` |
| 23 | social media post scheduler api / social media scheduler api | Commercial | Low–med | AC | D: publora.com, postpeer.dev (2), ayrshare.com (2) | months | use-case | `/use-cases/social-media-scheduling-api` |
| 24 | schedule social media posts with an api / schedule social media posts api | Info/commercial | Low–med | AC "late schedule social media posts with an api" (a leftover of Late's brand) | D: upload-post.com/how-to, postpeer.dev, planable.io/blog, publora.com, postpone.app | months | guide | **NEW** `/guides/schedule-social-media-posts-with-an-api` |
| 25 | social media scheduler with api | Commercial (tool buyers who want an API) | Low | AC "social media management tools with api" | W: planable.io, opus.pro, dev.to, producthunt.com (SchedPilot), pallyy.com | months | landing | `/features` (retitle from "Product tour") |
| 26 | social media management tools with api | Commercial | Low | AC | W: as row 25 | months | landing | `/features` |

### E. Cross-posting and multi-platform (developer phrasing)

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 27 | post to multiple social networks api | Commercial/info | Low–med | No AC for the API form (the consumer form is high, see F) | D: postwire.io (first Wayback 2026-10-03), postoria.io, buffer.com/resources, ayrshare.com, postproxy.dev · W: postly.ai, prnewswire.com (Ayrshare), getlate.dev/blog, ayrshare.com, postpeer.dev | **weeks** (Bing) / months (Google) | guide | **NEW** `/guides/post-to-multiple-social-networks-api` |
| 28 | post to multiple social platforms api | Commercial/info | Low | — | D: buffer.com/resources, postwire.io, zernio.com/blog, postoria.io, fanout.digital | weeks–months | guide | **NEW** `/guides/post-to-multiple-social-networks-api` |
| 29 | how to post to multiple social media platforms with one api | Informational | Low | AC "how to post to multiple social media platforms" (consumer form) | W: as row 27 | weeks–months | guide | **NEW** `/guides/post-to-multiple-social-networks-api` |
| 30 | multi-platform posting api | Commercial | Low | AC: 0 completions | W: buffer.com/resources (multi-platform posting), postly.ai, website-apn.pages.dev (a copy of postproxy.dev), docs.publora.com, postpeer.dev | weeks–months | guide | **NEW** `/guides/post-to-multiple-social-networks-api` (H2) |
| 31 | multi platform social media api | Commercial | Low | — | W: zernio.com/blog/multi-platform-social-media-api (plus its changelog copy) | months | guide | **NEW** `/guides/post-to-multiple-social-networks-api` (H2) |
| 32 | multi channel social media posting | Commercial | Low | AC "multi channel social media posting" | not checked | months | H2 | `/features` |
| 33 | cross-posting api | Commercial | Low | AC: the phrase only | D: crosspostapi.com (no Wayback capture, so very new), crosspostapi.com/blog, postwire.io, postproxy.dev (2) · W: website-apn.pages.dev, docsearch.algolia.com, postproxy.dev, developers.facebook.com, ecosyste.ms | **weeks** | guide + H2 | **NEW** `/guides/post-to-multiple-social-networks-api` + H2 on `/use-cases/social-media-posting-api` |
| 34 | crosspost api | Mixed (dev.to/Hashnode, Facebook Page video crossposting, npm libs) | Low | AC | D: cross-post.app, github.com/humanwhocodes/crosspost, developers.facebook.com (video crossposting), postwire.io, github.com/mjardin17 | weeks, low value | skip | — |

### F. Consumer "post everywhere" terms (dashboard intent, not API)

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 35 | post to multiple social media accounts at once | Info/commercial (end users) | **High** | AC: top completion of "post to multiple social" (10 completions) | W (for "post to all social media at once"): socialpilot.co, blog.hootsuite.com, contentstudio.io, sproutsocial.com, socialchamp.com | long-term | guide | **NEW** `/guides/post-to-multiple-social-media-accounts-at-once` |
| 36 | post to all social media at once | Info/commercial | **High** | AC 10 (free, reddit, app, "tool to post on all social media at once") | W: as row 35; popsci.com also ranks | long-term | guide | **NEW** (same as 35) |
| 37 | post to multiple social media platforms at once / how to post to multiple social media platforms | Info | **High** | AC | W: as row 35 | long-term | guide | **NEW** (same as 35) |
| 38 | auto post to all social media / auto post to multiple social media | Commercial | Med–high | AC 10 (free, wordpress plugin, n8n, github) | not checked | long-term | H2 | **NEW** (same as 35) |
| 39 | automate posting to social media | Informational | Med | AC 8 | W (API form): contentstudio.io, zylalabs.com, planable.io | long-term | H2 | **NEW** (same as 35) |
| 40 | upload video to multiple platforms at once | Commercial | Low | AC 3 on re-check, and neither extra completion is about multi-platform upload (YouTube batch upload, Facebook multi-video post); the first run's "AC 7" did not replicate | W (API form, "upload video to TikTok Instagram YouTube with one API"): ayrshare.com/use-cases/video-content-platforms, docs.upload-post.com, postpeer.dev, upload-post.com | **unlikely now**: TikTok is on sandbox keys and YouTube uploads stay private until the audit (siar-truth §2) | use-case | **NEW** `/use-cases/video-publishing-api`, **held** until TikTok and YouTube approve |

### G. Management API and incumbents' API terms

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 41 | social media management api | Commercial | Low–med | AC 3 ("buffer social media management api", "social media management tools with api") | D: social-api.ai/solutions/social-media-management-api, ayrshare.com, influencers.club, getphyllo.com, rapidapi.com · W: planable.io/blog, getlate.dev/blog, ayrshare.com | months | landing + H2 | `/` (H2) and `/features` |
| 42 | buffer social media management api / buffer api | Navigational (Buffer) | Med | AC "buffer api" 10 (key, pricing, docs, n8n, instagram) | W for "Buffer API": only unrelated Node.js and HAProxy "buffer" pages, so the term is ambiguous | **unlikely** for the head term; months for "buffer api alternative" | compare | **NEW** `/compare/buffer-api` |
| 43 | hootsuite api | Navigational | Med | AC 10 (pricing, documentation, key, access) | W: activepieces.com, silicon.co.uk, supergood.ai, hootsuite.com (newsroom), apievangelist.com | unlikely for the head term; months for "hootsuite api alternative" | compare | **NEW** `/compare/hootsuite-api` (Outstand already runs `/hootsuite-api` and `/buffer-api`, measured in `outstand.md`) |

### H. White label (product gap: read before targeting)

`siar-truth.md`: the hosted connect page is on app.siaran.my and shows "Powered by Siar". It is **branded, not white-label**.
Siar must not use "white-label" in H1s, titles or claims until that changes.

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 44 | white label social media api | Commercial | Low | AC: 0 completions | W: ayrshare.com/use-cases/digital-agencies (title "White-label Social Media API"; ayrshare.com/solutions/digital-agencies 308-redirects to it, so the two listed URLs are one page), bundle.social/white-label-social-media-api, juicer.io/white-label, cloudcampaign.com | **unlikely until product change** (months after) | use-case | **NEW** `/use-cases/social-media-api-for-agencies`, worded "your UI on Siar's API, with a branded connect link". Retarget to "white label" only after a custom-domain or footer-free connect page |
| 45 | white label social media management | Commercial (agencies buying a rebrandable dashboard) | **High** | AC 9–10 completions | W (software): sendible.com, contentstudio.io, cloudcampaign.com, vendasta.com, synup.com | **unlikely** (wrong product: the Siar dashboard is not rebrandable) | skip | — |
| 46 | white label social media management software / platform / tools | Commercial | Med–high | AC | W: as row 45 | unlikely | skip | — |
| 47 | white label social media scheduler | Commercial | Low | AC 1 | W (for agencies): oneupapp.io, getlate.dev/blog, cloudcampaign.com, socialchamp.com | unlikely now | skip | — |
| 48 | social media api for agencies | Commercial | Low | AC: no completion for agencies; "social media api for" goes to ai agents | W: ayrshare.com/use-cases/digital-agencies, zernio.com/use-cases/agencies (seen under row 44) | months | use-case | **NEW** `/use-cases/social-media-api-for-agencies` |

### I. SaaS, multi-tenant, embedding

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 49 | social media api for saas | Commercial | Low | AC: 0 completions. Every API vendor has a page (Ayrshare, bundle.social, Zernio, PostPeer, Upload-Post) | W: ayrshare.com/use-cases/saas-platforms, contentstudio.io, getlate.dev/blog, bundle.social/social-media-api-for-saas, sourceforge.net | months | use-case | `/use-cases/multi-tenant-social-media-api` (retitle "Social media API for SaaS: multi-tenant by design" rather than add a second page) |
| 50 | multi-tenant social media api | Commercial | Low | AC: "multi tenant social" gives no social-media completions | W: bundle.social/multi-tenant-social-media-api, vinquery.com, ayrshare.com (2), mallary.ai | weeks–months | use-case | `/use-cases/multi-tenant-social-media-api` |
| 51 | integrate social media into saas app / add social publishing to your saas | Informational | Low | — | W: cloudcampaign.com, postiz.com/enterprise, ayrshare.com, opus.pro, dev.to | months | guide | **NEW** `/guides/add-social-publishing-to-your-saas` |
| 52 | embedded social media | Wrong intent (feed embeds on websites) | — | AC 10, all "embed social media feed" | — | skip (trap) | — | — |

### J. AI agents and MCP (rising)

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 53 | social media api for ai agents | Commercial | **Med, rising** | AC: 3rd completion of "social media api for" and 1st of "social media api for ai" | W: blotato.com/social-media-api, ayrshare.com/use-cases/ai-startups, ayrshare.com/index.md, ayrshare.com/ai-agent.md, postpeer.dev | months | use-case | `/use-cases/social-media-api-for-ai-agents` |
| 54 | social media apis for agentic workflows | Commercial | Low (new phrase) | AC (under "social media api for" and "social media apis") | W: postpeer.dev, ayrshare.com/ai-agent, getlate.dev/blog, dev.to, blotato.com | weeks–months | H2 | `/use-cases/social-media-api-for-ai-agents` |
| 55 | social media mcp / social media mcp server | Commercial/nav | **Med, rising** | AC 10 (server, for claude, github, buffer social media mcp, later social media mcp, management mcp, scheduler mcp) | W: planable.io/blog, lobehub.com (several), mcpservers.org, speakeasy.com, glama.ai; bundle.social/social-media-mcp-server and posteverywhere.ai/mcp also rank | months | landing | **NEW** `/social-media-mcp-server`. **Blocked:** `@siar/mcp` returns 404 on npm, so the page can describe the 19 tools but cannot print install commands |
| 56 | social media mcp for claude | Commercial | Low–med | AC | not checked | months | H2 | **NEW** `/social-media-mcp-server` |
| 57 | social media scheduler mcp / social media management mcp | Commercial | Low | AC | W: lobehub.com (cybeleri scheduler MCP), glama.ai tool pages | weeks | H2 | **NEW** `/social-media-mcp-server` |
| 58 | best mcp server for social media content | Commercial | Low | AC (under "mcp server social media") | not checked | months | H2 | **NEW** `/social-media-mcp-server` |

### K. Price, cost, free

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 59 | social media api free / free social media api | Transactional | **Med–high** | AC: 2nd completion of "social media api"; "free social media api" AC 10, mostly data and downloader APIs | W: as row 21 | **unlikely** (one-time Free tier) | H2 | `/pricing` |
| 60 | social media api pricing | Commercial | Med | AC 7 | W (cost query): socialdata.tools, contentstudio.io, getphyllo.com, glama.ai, ayrshare.com/pricing.md; zernio.com/blog/social-media-api-pricing also ranks | months | guide (GEO plan P3 explainer) | **NEW** `/guides/social-media-api-pricing` |
| 61 | social media api cost / how much does a social media api cost | Informational | Low | AC 2 | W: as row 60 | months | guide | **NEW** `/guides/social-media-api-pricing` |
| 62 | social media api pricing per account vs per post | Info/commercial | Low | No AC | W: postpeer.dev (3 URLs), blotato.com, website-apn.pages.dev | weeks–months | guide H2 (Siar prices per organization, a third model) | **NEW** `/guides/social-media-api-pricing` |
| 63 | social media api unlimited accounts | Commercial | Low | AC: 0 completions | W: blotato.com, website-apn.pages.dev, postpeer.dev, contentstudio.io, ayrshare.com/pricing.md | weeks–months | H2 | `/pricing` (H2 "Unlimited social accounts on every plan") |

### L. Open source, GitHub, SDKs, integration guides

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 64 | social media api open source | Commercial/info | Med | AC | W: github.com/rodrgds/openpost, ecosyste.ms, github.com/trypostit/trypost, mcpservers.org, jentic.com | **unlikely** (Siar is not open source) | skip | — |
| 65 | social media api github | Navigational | Med | AC | W: ecosyste.ms (ayrshare/social-media-api), zylalabs.com marketplace pages | unlikely for siaran.my; possible through a public examples repo (owner decision) | GitHub repo | — (no site page) |
| 66 | social media sdk / social network sdk | Commercial | Low | AC | not checked | months | docs | `/docs/sdk-cli-mcp` (no install commands until npm publish) |
| 67 | social media api python | Informational | Low | AC 3 | W: ecosyste.ms (Ayrshare Python repo), pypi.org/social-post-api, socket.dev, ayrshare.com/docs (python); bundle.social/blog/social-media-api-python-guide also ranks | months | guide | **NEW** `/guides/social-media-api-python` (plain `requests` against the REST API; Siar has no Python SDK, but the site already ships Python request and webhook-verification snippets in `apps/site/src/lib/snippets.ts` to reuse) |
| 68 | social media api typescript / node | Informational | Low | AC: 0 completions for both | not checked | months | docs | `/docs/quickstart` + `/docs/sdk-cli-mcp` |
| 69 | social media api key | Navigational/info | Med | AC (also "social media profile finder api key") | not checked; [inferred] mostly "how to get a Facebook/Instagram API key" intent | long-term, low value | docs | `/docs/authentication` |
| 70 | social media api integration | Informational | Med | AC 6 (also "the social media api that replaces 13 integrations", a competitor tagline) | W: juicer.io, zylalabs.com, flockler.com, rapidevelopers.com, apidog.com; bundle.social/blog/social-media-api-integration-guide also ranks | months | guide (build vs buy: OAuth, app review, tokens, retries; the `docs/approvals/` pack is first-hand material) | **NEW** `/guides/social-media-api-integration` |
| 71 | social media integration api | Informational | Low | AC 4 | not checked | months | guide | **NEW** `/guides/social-media-api-integration` |
| 72 | n8n post to social media / n8n post to all social media | Info/commercial | Med | AC 7 (upload to, publish to, post to all, multiple, auto post) | W: growwstacks.com, skool.com, ayrshare.com/docs (MCP + n8n), getlate.dev/blog, buldrr.com | months | guide | **NEW** `/guides/n8n-social-media-posting` (HTTP Request node; Siar has no n8n node, found nowhere in the repo) |
| 73 | zapier post to multiple social media | Info | Low | AC: 0 completions | not checked | months | — | skip until a Zapier app exists |

### M. Capability long tail (existing use-case pages)

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 74 | social media analytics api | Commercial (mixed with listening and data APIs) | Med | AC 6 (free, monitoring, sentiment analysis) | W: getlate.dev/blog, marketplace.gohighlevel.com, postpeer.dev/blog, ayrshare.com, shortimize.com | months | use-case | `/use-cases/social-media-analytics-api` (paid plans only: say so) |
| 75 | social media comments api | Commercial | Low | AC 2 | W: postpeer.dev, bundle.social, ayrshare.com (engagement API), getlate.dev/blog, zernio.com | weeks–months | use-case | `/use-cases/social-media-comments-api` |
| 76 | social media engagement api | Commercial | Low | Not AC-checked; it is Ayrshare's page title | W: ayrshare.com/social-media-engagement-api (under row 75) | months | H2 | `/use-cases/social-media-comments-api` |
| 77 | unified inbox api / social media inbox api | Commercial | Low | AC "unified inbox api" 4 | W: getlate.dev/social-media-inbox, getlate.dev/blog, postly.ai, zernio.featurebase.app, ayrshare.com | months | H2 | `/use-cases/social-media-comments-api` (DMs: "beta, Facebook and Instagram, on request, paid plans" per siar-truth) |
| 78 | social media webhooks / social media webhooks api | Commercial | Low | AC 2 | W: developer.synup.com, docs.publora.com, docs.rs (late crate), bundle.social/social-media-webhooks-api, postproxy.userjot.com | weeks | use-case | `/use-cases/social-media-webhooks` |
| 79 | social media oauth api / connect social media accounts api | Commercial | Low | AC "social media oauth" 2; "connect social accounts" completions are consumer (Canva, HubSpot, Xbox) | W: ayrshare.com/connect, bundle.social/social-media-oauth-api, docs.whop.com, info.bundle.social (hosted flow), docs.postiz.com | weeks–months | use-case | `/use-cases/hosted-connect-oauth` (retitle "Social media OAuth API: a hosted connect link") |
| 80 | hosted oauth | Wrong intent (self-hosted OAuth servers) | — | AC 10, all OAuth-server terms | — | skip (trap) | — | — |

### N. Competitor alternatives (commercial investigation)

Comparison pages follow GEO plan P3: every competitor fact links to the vendor's own page and is dated. The pages listed
are the existing teardowns in `docs/seo/research/competitors/`.

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 81 | ayrshare alternatives / ayrshare alternative | Commercial | **Med** | AC 4 (alternatives reddit, api alternatives, open source alternative); "ayrshare" AC 10 incl. pricing, plans, mcp; HN 60 stories mention Ayrshare | W: alternativeto.net, capterra (several country sites), blotato.com/blog, getapp, postiz.com/alternatives; bundle.social/blog and changelog.zernio.com also ranked in the first run (changelog.zernio.com returns 404 at its root on 2026-11-12; Zernio's changelog is now at zernio.com/changelog) | months | compare | **NEW** `/compare/ayrshare` |
| 82 | ayrshare api alternatives | Commercial | Low–med | AC | W: g2.com (Ayrshare API competitors), as row 81 | months | compare | **NEW** `/compare/ayrshare` |
| 83 | ayrshare pricing | Navigational | Med | AC | not checked; [inferred] Ayrshare's own page wins | unlikely | H2 | **NEW** `/compare/ayrshare` (H2) |
| 84 | zernio alternative / zernio api alternative | Commercial | Low–med | AC 3; "zernio" AC 10 | W: alternativeto.net, bundle.social/zernio-alternative, postiz.com, producthunt.com, postproxy.dev/compare/zernio | weeks–months | compare | **NEW** `/compare/zernio` |
| 85 | late api / late api alternative | Navigational (old brand) | Med for "late api" | AC "late api" 10 (social media, pricing, key, docs); "social media api late" is a completion of the head term | not checked; getlate.dev URLs still show in W results despite the 301 to zernio.com (index lag, inferred) | unlikely for "late api"; months for the alternative | compare | **NEW** `/compare/zernio` ("formerly Late" in the intro) |
| 86 | upload-post alternative | Commercial | Low–med | AC (under "upload-post") | W: alternativeto.net, ayrshare.com/compare/upload-post-api-alternative, info.bundle.social, bundle.social/blog, blotato.com | months | compare | **NEW** `/compare/upload-post` |
| 87 | blotato api alternative | Commercial | Low | AC (under "blotato api") | not checked | months | compare | later: **NEW** `/compare/blotato` |
| 88 | bundle.social alternative | Commercial | Low | AC for "bundle.social" has no "alternative" completion (pricing, api, mcp, reviews, docs) | W: getapp/capterra (several), alternativeto.net, ayrshare.com/compare/bundle-social-api-alternative, bundle.social/alternatives, changelog.zernio.com (404 at root on 2026-11-12, see row 81) | months | compare | **PARKED** (naming decision on the wire-compatibility story) |
| 89 | buffer api alternative | Commercial | Low | AC 2 on re-check, both reworded: "buffer alternative with api", "buffer free alternative"; "buffer api" AC 10 | not checked | months | compare | **NEW** `/compare/buffer-api` |
| 90 | hootsuite api alternative | Commercial | Low | No AC; "hootsuite api" AC 10 | not checked | months | compare | **NEW** `/compare/hootsuite-api` |

### O. Malaysia

| # | Keyword | Intent | Demand | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 91 | social media scheduler malaysia | Commercial | Low | AC: 0 completions (`gl=us`); "social media scheduler" with `gl=my` returns only generic completions | W: shinjiru.com.my/blog, dark-factory-labs.pages.dev, postla-page.pages.dev, zynex-ai-v2.pages.dev, storehub.com | **weeks** (weak SERP: small blogs and pages.dev sites) | local landing | **NEW** `/malaysia` (English, ringgit prices, FPX/DuitNow yearly) |
| 92 | social media api malaysia | Commercial | Very low | AC: 0 completions | W: no relevant result (jobs, agencies, generic lists) | weeks | local landing | **NEW** `/malaysia` |
| 93 | social media management malaysia | Commercial (agency services) | Med | AC 10, but the completions are agencies, salaries, packages and statistics | not checked | unlikely (service intent) | skip | — |

## What this sweep tells us

1. **Every head term is already claimed by a pack of API vendors with exact-match pages.** bundle.social has a dedicated
   landing page for almost every term in sections B–M (measured in `bundle-social.md`). PostPeer, Zernio, Ayrshare, Publora
   and PostProxy show up on most of them. siaran.my is not in the DDG top 10 for any of the 17 measured terms [measured once; unverified on re-check].
   Siar already has the right URLs for posting, scheduling, multi-tenant, AI agents, analytics, comments, webhooks and OAuth.
   What it lacks is a home page that targets a keyword, plus guide, comparison and pricing pages [inferred].
2. **Bing/DDG can be won in weeks. Google is the slow part, and indexing is the bottleneck.** Domains first seen in 2026 hold
   DDG #1–#3 with exact-match pages (social-api.ai, postwire.io, postpeer.dev, crosspostapi.com) [measured once; ranks unverified on re-check]. Bing also feeds
   ChatGPT search and Copilot (GEO plan). On Google (W), older vendors and big SaaS blogs dominate. Google has indexed only about
   32 of 89 Siar URLs [measured, `current-site.md`]. Fix that first: Search Console, sitemap, internal links to `/docs`.
3. **Demand for the API phrasing is real but small and split.** The best developer terms by autocomplete evidence are
   "social media api", "social media posting api", "social media api for ai agents", "social media mcp", "ayrshare alternatives"
   and "social media api pricing" [inferred]. Four of the brief's seed terms have no completions of their own: "multi platform
   posting api", "white label social media api", "social media api for saas" and "cross posting api" (beyond itself) [measured].
   Treat those as H2s and secondary phrases, not as standalone pages, except where a cheap guide also catches the cross-posting cluster.
4. **The big-volume phrases belong to end users, not developers.** "post to all social media at once" and "post to multiple social
   media accounts at once" are high and owned by Hootsuite, Sprout, SocialPilot and ContentStudio blogs [measured once, W; unverified on re-check]. One honest
   guide that shows the Siar dashboard is a long-term bet, not a quick win.
5. **Traps where the intent does not fit Siar (do not build for them):**
   - "white label social media management/software": agencies want a rebrandable dashboard, and Siar's connect page says "Powered by Siar".
   - "free social media api": Siar Free is 20 free posts to try, one-time.
   - "social media api open source".
   - "embedded social media" and "social media api aggregator": both mean website feed widgets.
   - "hosted oauth": self-hosted OAuth servers.
   - "crosspost api": dev.to, Hashnode and Facebook video crossposting.
   - "buffer api": the term collides with Node.js `Buffer`.
   - Part of "social media api" itself is **data/scraping** intent: sociavault, socialcrawl, data365 and rapidapi rank on DDG.
6. **AI agents and MCP is the rising cluster.** Autocomplete already offers "social media api for ai agents", "social media
   apis for agentic workflows", "social media mcp server" and "social media mcp for claude" [measured]. Siar has the use-case
   page and a 19-tool MCP server in code. The `/social-media-mcp-server` page is **blocked on publishing `@siar/mcp` to npm**:
   without that it cannot give an install command, and every competitor page leads with one.
7. **Comparison demand centres on Ayrshare.** It has the most alternative-intent completions and 60 HN stories. Zernio/Late and
   Upload-Post come next. The bundle.social page stays parked on the naming decision.
8. **Malaysia has no API search demand,** but the "social media scheduler malaysia" SERP is weak (small blogs and pages.dev sites).
   One English `/malaysia` page with ringgit prices and FPX/DuitNow is a cheap win, and it keeps to the English-only call in `docs/geo/brief.md` ("no BM version is planned now", labelled inferred there).
9. **Copy fixes this sweep surfaced:** the live meta descriptions of `/use-cases/social-media-posting-api` ("to 15 social networks"),
   `/use-cases/social-media-scheduling-api` ("to 15 social networks"), and also the home page ("across 15 networks"), `/features`
   ("across 15 social networks") and `/use-cases/hosted-connect-oauth` ("for 15 networks") state 15 networks with no qualifier
   [measured, fetched 2026-11-12]. `siar-truth.md` allows only "built for 15 networks". Fix all five before pushing these pages harder.

### Suggested order (inferred; each item needs Fakhrul's go before deploy)

| Priority | Action | Targets (rows) |
|---|---|---|
| P1 | Retitle home to target "unified social media API" (keep the brand line in the H1). Fix the "15 networks" meta copy on all five pages (item 9). Retitle `/features`, `/use-cases/multi-tenant-social-media-api` and `/use-cases/hosted-connect-oauth` | 1, 9, 11–13, 25–26, 41, 49–50, 79 |
| P1 | Search Console + sitemap + internal links, so the existing use-case and docs pages get indexed | all |
| P2 | **NEW** `/guides/post-to-multiple-social-networks-api` (catches the cross-posting and multi-platform cluster, which Bing can rank in weeks) | 27–31, 33 |
| P2 | **NEW** `/guides/social-media-api-pricing` (per account vs per post vs per organization) + `/pricing` H2s (free, unlimited accounts) | 21, 59–63 |
| P2 | **NEW** `/compare/ayrshare`, `/compare/zernio`, `/compare/upload-post` | 81–86 |
| P3 | **NEW** `/social-media-mcp-server` (after the npm publish), `/guides/n8n-social-media-posting`, `/use-cases/social-media-api-for-agencies`, `/malaysia` | 48, 53–58, 72, 91–92 |
| P4 | **NEW** `/guides/best-social-media-apis`, `/guides/social-media-api-integration`, `/guides/social-media-api-python`, `/guides/post-to-multiple-social-media-accounts-at-once` | 2–7, 35–39, 67, 70–71 |
| Hold | `/use-cases/video-publishing-api` (TikTok/YouTube approvals), white-label wording (connect page), `/compare/bundle-social` (naming) | 40, 44–47, 88 |
