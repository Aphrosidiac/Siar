Verified 2026-11-12: 15 corrections

> **Verification note (2026-11-12).** All 18 citation-pool pages were re-fetched and their dates and brand lists compared;
> the vendor price anchors were re-read on each vendor's own page; REG, AMS, npm, the GitHub API, the sitemap, `/openapi.json`,
> the error pages and the home calculator were re-measured; X, LinkedIn and YouTube facts were re-read on docs.x.com,
> learn.microsoft.com and developers.google.com. **The "who ranks" result lists (W / D columns) could NOT be re-run:** the
> shared 200-search budget for this turn was already spent, and every WebSearch call was refused. Those columns were
> checked only against the sibling files they cite (HU 1–92, AV 1–88, PN 4–116 sampled: about 45 rows). They remain
> "measured by sibling, not re-verified". Corrections are marked *(corrected 2026-11-12)* in place.

# Keyword sweep: AI answer engines (prompts and the pages they cite)

Checked 2026-11-12. This sweep covers the prompt-shaped questions people put to ChatGPT, Perplexity, Gemini, Copilot and
Google AI Mode. For each one it asks which pages and brands those engines draw on, and which kind of page wins the citation.

It builds on these files and does not repeat them:
- `head-unified.md`, `alternatives-vs.md` and `per-network.md` in this folder (same-day keyword sweeps, rows cited as HU, AV, PN)
- `../current-site.md` (indexing and the live site), `../siar-truth.md` (what Siar may claim) and `../competitors/*.md`
- `docs/geo/plan.md` (P3 comparison and pricing pages), `docs/geo/offsite-plan.md` and the frozen `docs/geo/prompts_v1.csv` (50 prompts)

Siar wording follows `../siar-truth.md`. Where that file and the brief disagree, the truth file wins. Two examples:
- The API has **270 operations in an OpenAPI 3.0 document**, not "3.1 / ~263".
- Siar can publish today to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack.
  TikTok, YouTube public uploads, Pinterest publishing, LinkedIn company pages, Reddit, Snapchat and Google Business
  Profile are built but **not open**.
  - *(corrected 2026-11-12)* YouTube: the truth file's "locked private" rule is now stale. Google's revision history for
    2026-11-02 says uploads through `videos.insert` from unverified API projects "are no longer restricted to private
    viewing mode" [sourced: https://developers.google.com/youtube/v3/revision_history, checked 2026-11-12]. Siar's adapter
    requests `public` by default (`packages/networks/src/adapters/youtube.ts` line 340), so public uploads may now work, but
    no public upload by Siar has been recorded since [unverified]. Until one is tested on a real channel, keep the truth-file
    wording and do not claim public YouTube publishing.

## Method, labels and limits

**Read this first: this sweep ran zero web searches.** The shared limit of 200 searches per turn was already used up by
the sibling sweeps before this one began. My first five searches were refused. Search engines were not queried any other
way (curl, browser, proxies). So:

| Code | What it is | Label |
|---|---|---|
| **CP** | **Citation pool.** I fetched the roundups, listicles and directory pages that same-day search results show ranking for these prompts, plus the obvious sibling pages from the same publishers. For each page I recorded which brands it recommends. Engines build "best / alternatives / cheapest / MCP" answers from pages like these. The 18 pages are listed below | measured (page fetch, 2026-11-12) |
| **REG** | The official MCP registry API (`registry.modelcontextprotocol.io/v0/servers?search=`), queried per vendor name | measured |
| **AMS** | `punkpeye/awesome-mcp-servers` README, "Social Media" section (73 entries) | measured |
| **HU / AV / PN n** | A row in the sibling sweeps `head-unified.md` / `alternatives-vs.md` / `per-network.md`. Their result lists (W = WebSearch tool, D = DuckDuckGo) and autocomplete counts (AC) were measured today by those sweeps | measured (by sibling); W/D lists not re-run by the 2026-11-12 verifier (search budget spent) |
| **CS** | `../current-site.md`, including one measured Bing Copilot answer about Siar | measured (by sibling); ranks and the Copilot answer not re-run by the 2026-11-12 verifier (search budget spent) |
| **Siar live** | siaran.my pages fetched by me today (error pages, titles, `/llms.txt`, `/pricing.md`), the GitHub API for the Siar repo, and npm | measured |

**What is not measured:** the answers ChatGPT, Perplexity, Gemini or AI Mode actually give, and the URLs they cite. The
wave-0 sheet `docs/geo/visibility/manual-2026-10-13/manual.csv` is still empty, and there are no engine API keys. So the
"cited now" column means "the pages the retrieval layer returns, and the brands those pages name". It does **not** mean
"what ChatGPT said". Reddit stayed unreadable, as it was for the sibling sweeps.

**Demand** is always **inferred**. No volume tool exists. Conversational prompts almost never show in autocomplete, so I
grade the demand of the underlying head phrase (its AC evidence from the sibling rows), then adjust it by how many vendors
built pages for the phrase.

**Win** (realistic for siaran.my, inferred) has two parts:
- *Search*: how soon Siar can rank, on the scale used in the sibling files (weeks / months / long-term / unlikely).
- *Answer*: how soon an engine is likely to **name** Siar. For the "best / alternatives / MCP" prompts, being named mostly
  depends on being inside the pages engines cite, not on Siar's own ranking.

"Unlikely" also covers cases where Siar cannot truthfully be the answer, for example TikTok publishing.

**Page type** = the kind of page that earns the citation:
- *answer-first explainer*
- *use-case* (existing `/use-cases/*`)
- *network ref* (existing `/<net>-api`)
- *error ref* (existing `/<net>-api/errors`)
- *compare*
- *listicle* (own "best X" with a stated method)
- *pricing explainer*
- *roundup inclusion* (off-site: be listed in someone else's roundup)
- *directory listing* (AlternativeTo / G2 / Capterra / MCP registries)
- *GitHub README*
- *H2* (a section on an existing page)

**Siar page** = an existing URL from `https://siaran.my/sitemap-0.xml` (89 URLs, fetched 2026-11-12) or a **NEW** slug.
The NEW slugs are the same ones the sibling sweeps proposed, so the three files point at one URL plan.

## The citation pool (measured: CP, fetched 2026-11-12)

These are the pages that the same-day result lists (HU/AV/PN) show for "best social media API", "ayrshare alternatives",
"cheapest social media API" and "social media MCP", plus sibling pages from the same publishers. "Self-ranked" means the
publisher sells a listed product and puts it first.

| # | Page | Publisher | Date on page | Self-ranked | Brands recommended (order) | Siar |
|---|---|---|---|---|---|---|
| 1 | https://buffer.com/resources/best-social-media-apis/ | Buffer | 2026-05-28 | yes | Buffer, Ayrshare, Postiz, Upload-Post, Zernio, Phyllo, Post for Me, Outstand, Genviral, PostEverywhere | no |
| 2 | https://www.blotato.com/blog/best-social-media-api-tools | Blotato | upd. 2026-11-02 | yes | Blotato, Ayrshare, SocialAPI.ai, Outstand, Zernio, Post for Me, Postiz, Mixpost, Upload-Post, Buffer | no |
| 3 | https://www.upload-post.com/best-social-media-apis/ | Upload-Post | upd. 2026-10-30 | yes | 18: Upload-Post, Ayrshare, Zernio, Outstand, Post for Me, bundle.social, Buffer, Postiz, Blotato, Post Bridge, Mixpost, Unipile, Postproxy, Social API, Socialync, SocialClaw, PostFast, PostSyncer | no |
| 4 | https://zernio.com/blog/top-12-social-media-apis-for-developers | Zernio | upd. 2026-10-16 | yes | 11 unified (Zernio, Ayrshare, Upload-Post, bundle.social, Outstand, Postiz, Buffer, Post for Me, Unipile, Octolens, Phyllo) + 9 native APIs | no |
| 5 | https://postplanify.com/blog/best-social-media-apis-for-developers | PostPlanify | upd. 2026-11-06 | yes | PostPlanify, Ayrshare, Zernio, Buffer, Postiz, Publer, Blotato, Hootsuite, Sendible, Vista Social | no |
| 6 | https://www.socialchamp.com/blog/best-social-media-apis/ | Social Champ | 2026-08-24 | no (own product 3rd) | Ayrshare, Postiz, Social Champ, Post for Me, Zernio, Outstand, Blotato | no |
| 7 | https://www.ayrshare.com/blog/best-social-media-posting-and-scheduling-apis/ | Ayrshare | upd. 2026-09-23 | yes | Ayrshare, Zernio, Post for Me, bundle.social, Upload-Post, Mallary, Postiz, Mixpost, Buffer, Hootsuite | no |
| 8 | https://www.blotato.com/blog/ayrshare-alternatives | Blotato | upd. 2026-11-02 | yes | Blotato, Postiz, Mixpost, Upload-Post, Buffer, Zernio, Hootsuite (+ SocialAPI.ai, Outstand) | no |
| 9 | https://woopsocial.com/blog/ayrshare-alternatives | WoopSocial | 2026-04-23 | yes | WoopSocial, bundle.social, Publer, Buffer, Outstand, Zernio, Postiz | no |
| 10 | https://posteverywhere.ai/blog/ayrshare-alternatives | PostEverywhere | 2026-10-22 | yes (disclosed) | PostEverywhere, Zernio, Upload-Post, Outstand, bundle.social, Postiz | no |
| 11 | https://alternativeto.net/software/ayrshare/ | AlternativeTo | upd. 2026-11-11 | no | 12 of 65 shown: Buffer, Hootsuite, PlanVortex, Post Bridge, Mavic AI, SophieFlow, Zernio, PromoRepublic, Postnify, Sprout Social, SocialDog, Presly | no |
| 12 | https://getsocialclaw.com/blog/cheapest-social-media-api | SocialClaw | 2026-08-31 | yes | SocialClaw, Postiz, Ayrshare, native APIs | no |
| 13 | https://social-api.ai/blog/cheapest-social-media-api-inbox-2026 | SocialAPI.ai | upd. 2026-10-07 | yes | SocialAPI.ai, Zernio, Ayrshare, Outstand, Post for Me | no |
| 14 | https://www.upload-post.com/best-social-media-mcp-servers | Upload-Post | endpoints checked 2026-10-23 | yes | Upload-Post, Postiz, Buffer, Zernio, Ayrshare, Blotato, Metricool, Post Bridge, Outstand, bundle.social, Post for Me, Mixpost (+ Zapier MCP) | no |
| 15 | https://getsocialclaw.com/blog/best-social-media-mcp-servers | SocialClaw | 2026-07-04 | yes | SocialClaw, Postiz, Ayrshare, Blotato, OpenTweet | no |
| 16 | https://publora.com/blog/best-social-media-api-for-ai-agents-2026 | Publora | upd. 2026-10-11 | yes | Publora, native APIs (LinkedIn, X, Bluesky, Mastodon, Threads, Telegram), Buffer, Hootsuite, then native Pinterest, TikTok and YouTube APIs *(corrected 2026-11-12: the last three were missing)* | no |
| 17 | https://dev.to/perufitlife/9-social-media-posting-apis-compared-by-price-october-2026-read-from-each-pricing-page-509b | dev.to (PostWire's builder, disclosed) | 2026-10-21 | disclosed, not ranked | Post for Me, PostWire, Zernio, Upload-Post, Publer, Buffer, Postiz, Blotato, Ayrshare | no |
| 18 | https://dev.to/haneem/best-7-social-media-scheduler-apis-for-agents-developers-21p3 | dev.to (no disclosure) | Jun 23, year not shown | no | Buffer, Postiz, Outstand, Ayrshare, Zernio, Publer, bundle.social | no |

**How often each brand appears across the 18 pages (measured, counting the publisher's own entry):**

| Brand | Pages | Brand | Pages |
|---|---|---|---|
| Postiz | 15 | Blotato | 8 |
| Zernio (ex-Late) | 15 | bundle.social | 7 |
| Buffer | 13 | Mixpost, Hootsuite | 5 each |
| Ayrshare | 13 (subject of 4 more) | SocialAPI.ai, Publer | 4 each |
| Outstand | 11 | SocialClaw, Post Bridge | 3 each |
| Post for Me, Upload-Post | 9 each | **Siar** | **0** |

Two more pages could not be read: G2's Ayrshare competitors page and Frank Heijdenrijk's Medium post both returned 403.

**MCP surfaces (measured):**
- REG has entries for `com.zernio/zernio`, `com.upload-post/mcp`, `so.outstand/outstand`, `com.blotato/mcp` and
  `com.publora/mcp-server`. A search for "siar" returns only an unrelated "asiaref" server. Siar is not listed.
- AMS lists 73 servers under Social Media, including posteverywhere, publora, Upload-Post, postfast and postwire. Siar is not listed.
- Siar's own MCP has two gaps:
  - **It is stdio only** (`packages/mcp/src/server.ts`, `StdioServerTransport`), so there is no remote URL to give a client.
  - **`@siar/mcp` returns 404 on npm** [live]. The install command on `/docs/sdk-cli-mcp` fails for anyone who runs it (`siar-truth.md`).
- Rivals publish remote MCP endpoints: mcp.zernio.com, mcp.upload-post.com, mcp.outstand.so, mcp.buffer.com,
  mcp.blotato.com and mcp.publer.com (recorded in `../competitors/*.md`).

**Siar's own surfaces (measured):**
- `/llms.txt` and `/pricing.md` return 200.
- The error pages contain every code in prompts p038–p042: 2207042, `spam_risk_too_many_posts`, `ExpiredToken`, LinkedIn 422
  duplicate and X 403 duplicate. They also cover `CreditsDepleted` and `unaudited_client_can_only_post_to_private_accounts`.
- The GitHub repo `Aphrosidiac/Siar` is public, with 0 stars. Its topics are `astro`, `fastify`, `social-media-api`,
  `typescript`, `unified-api` and `vue` *(corrected 2026-11-12: there are six topics, not two)*. Its description
  says "…on 15 social networks", which breaks the truth-file rule ("built for 15 networks" only).
- CS records Bing Copilot telling people "RM399/month for up to 240 connected accounts". That is wrong: every plan has
  unlimited accounts. The cause is the home price calculator's server-rendered default.

---

## Prompt cluster → page type that earns the citation

Every prompt in `prompts_v1.csv` is assigned to one cluster.

| Cluster | Prompts | What engines cite today (evidence) | Page type that earns it | Siar's state |
|---|---|---|---|---|
| **1. Definition / discovery** | p001, p002, p009, p024 | Big SaaS blogs for "what is a social media API": brandwatch, agorapulse, hootsuite, sprout, socialchamp (HU7). Vendor explainers for "unified" and "post to multiple networks API": ayrshare, unified.to, zernio, postwire, postproxy (HU11, HU27). All 5 vendor listicles in CP open with a "what is it / unified vs native" section | Answer-first explainer: a 40–60 word definition, a "unified vs native API" table and a code sample. Plus the home FAQ | Home lead and FAQ exist (GEO P2). No guide exists |
| **2. "Best X for Y" roundups** | p003, p004, p005, p010, p050 | Vendor-written listicles: 15 of the 18 CP pages are by a vendor, and 14 of those rank their author first (Social Champ puts itself 3rd). They list 3–18 brands. Common columns are platforms, entry price, pricing unit and MCP; the exact set varies by page (CP 3's columns: platforms, MCP / agent-ready, SDKs, comments·DMs·analytics, entry price, cost per connected profile, free tier) *(corrected 2026-11-12)* | **Roundup inclusion** first, then Siar's own listicle (with a stated method and sources) and use-case pages that answer "for SaaS / agencies / multi-tenant" | Absent from all 18 pages. Use-case pages exist for multi-tenant, hosted connect, AI agents |
| **3. Capability ("API with X")** | p016, p017, p018, p019, p020 | Vendor feature pages with exact-match slugs: bundle.social `/*-api` pages, ayrshare `/use-cases/*`, postpeer, zernio (HU75–HU79) | Use-case page whose H1 matches the capability, an answer-first lead, and a request/response sample | 5 matching use-case pages exist. White label (p017) is a product gap |
| **4. AI agents / MCP** | p008, p009, p037 | MCP directories (lobehub, glama, mcpservers.org), planable and speakeasy (HU55). The REG and AMS lists. Vendor MCP roundups (CP 14, 15). The MCP column in every CP listicle | **Directory listing** (REG, AMS, Glama, Smithery, mcp.so), a GitHub README, and a `/social-media-mcp-server` page whose first screen gives an install command or remote URL | Blocked: stdio only, not on npm, in no registry |
| **5. Alternatives / vs** | p021, p022, p023, p025, p026, p036 | For "ayrshare alternatives" the top 5 is alternativeto.net, a Blotato post, then Capterra/GetApp country sites (AV1). Below that come 13 vendor alternative pages (AV1 SM). CP 8–11 name 6–12 rivals each | Directory listing (AlternativeTo, Capterra/GetApp, G2, SourceForge), then a sourced, dated `/compare/<brand>` page | No listings. No compare pages (owner go/no-go, `owner-todo.md`) |
| **6. Pricing / cheapest / free** | p006, p007, p027, p028, p029, p030 | Vendor pricing pages, often `.md` (ayrshare.com/pricing.md ranks, HU60). Vendor "cheapest" posts (CP 12, 13). Zernio and social-api.ai pricing explainers (AV80) | Pricing explainer with worked scenarios. `/pricing` + `/pricing.md` with the unit stated in the first line. `/x-api/pricing` for X costs | `/pricing` and `/pricing.md` exist. No explainer. A Copilot answer misquotes Siar's limits (CS) |
| **7. Branded facts** | p031, p032, p033, p034, p035, p037 | siaran.my ranks for "siar api" (DDG #3–4) and "Siar social media API" (Bing #2–3) (CS). No third-party page about Siar found in CP | Own pages (home, about, pricing, platforms, llms.txt) that agree exactly. A GitHub README. Directory listings that confirm the entity | Inconsistent: the GitHub description and network pages overclaim. The price calculator default misleads Copilot |
| **8. How-to per network** | p011, p012, p013, p014, p015, p043, p044, p045, p049 | Native docs (developers.facebook.com, developers.tiktok.com) mixed with vendor how-tos. Instagram posting API: postpeer, blotato, publora docs, unipile, getlate (PN4). TikTok: ayrshare, getlate, tiktok docs, publora, posteverywhere (PN68) | Network ref + how-to guide with code, written from the enforcing code (limits, media rules) | 15 network pages exist and are generated from code. They present all 15 networks as working (CS) |
| **9. Troubleshooting codes** | p038, p039, p040, p041, p042 | Per-code error pages. For Instagram errors, DDG shows upgrow.com, instagrapi.com, postpeer.dev/errors/instagram (PN16). For X 402: opentweet.io, note.com, x.com (PN46) | Error ref: the exact code in a heading, cause, and fix | All 5 codes are present on Siar's error pages [measured]. At least 5 of 15 error pages are not indexed by Google, 4 are, 6 unknown (CS) |
| **10. Malaysia** | p046, p047, p048 | No relevant result for "social media api malaysia". "social media scheduler malaysia" returns small blogs and pages.dev sites (HU91, HU92) | Local landing in English: ringgit, FPX/DuitNow, FF DEV STUDIO SSM number | None |

---

## Keyword table

Prompt IDs refer to `docs/geo/prompts_v1.csv`. Rows without an ID are new variants found in this sweep.

### 1. Definition and discovery

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 1 | what is a unified social media API | p001 | Informational | Med. "unified social media api" AC gives the phrase plus 3 unrelated completions; heavy vendor targeting (HU11) | W: ayrshare.com, docs.unified.to, getlate.dev→zernio.com, unipile.com, flockler.com (HU11) | months · months | answer-first explainer | **NEW** `/guides/what-is-a-unified-social-media-api` + `/` FAQ |
| 2 | what is a social media API / social media API meaning | — | Informational | Med. "social media api meaning" AC under 4 seeds (HU7) | W: brandwatch.com, agorapulse.com, blog.hootsuite.com, sproutsocial.com, socialchamp.com (HU7) | long-term · long-term | answer-first explainer | same new guide (H2) |
| 3 | how do I post to multiple social networks from one API | p002 | Informational | Low–med. The consumer form is high (HU35–37); the API form has no AC (HU27) | D: postwire.io, postoria.io, buffer.com/resources, ayrshare.com, postproxy.dev · W: postly.ai, prnewswire.com, getlate.dev, ayrshare.com, postpeer.dev (HU27) | weeks (Bing) / months · months | guide with code | **NEW** `/guides/post-to-multiple-social-networks-api` |
| 4 | API to post to social media | — | Commercial | Med. AC (HU16) | D: postforme.dev, postpeer.dev, github.com/ayrshare, upload-post.com, muapi.ai (HU16) | months · months | use-case | `/use-cases/social-media-posting-api` |
| 5 | how can an AI agent post to social media | p009 | Informational | Med, rising *(corrected 2026-11-12: HU53 grades it Med)*. "social media api for ai agents" is an AC completion (HU53) | W: blotato.com/social-media-api, ayrshare.com/use-cases/ai-startups, ayrshare.com/index.md, ayrshare.com/ai-agent.md, postpeer.dev (HU53) | months · blocked by MCP state | use-case + MCP setup H2 | `/use-cases/social-media-api-for-ai-agents` |
| 6 | alternatives to building every social network integration yourself / build vs buy | p024 | Informational | Low. No AC run; 2 vendor posts target it (AV88) | not measured. Targeted by bundle.social/blog/social-media-api-startups-build-vs-buy and postproxy.dev (AV88) | months · months | answer-first explainer | **NEW** `/guides/build-vs-buy-social-media-api` |
| 7 | unified API vs native platform APIs | — | Informational | Low (inferred). Every vendor listicle in CP 1, 4, 5, 6 has this section | not measured. The section exists on CP 1, 4, 5, 6 | months · months | H2 + table | H2 in the row 1 guide |
| 8 | social media API vs social media management tool | — | Informational | Low. No AC run (AV87) | not measured. Targeted by postproxy.dev, getsocialclaw.com (AV87) | weeks–months · months | H2 | H2 in the row 1 guide |

### 2. "Best X for Y" roundups

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 9 | best social media API for developers | — | Commercial | Med. AC (AV72) | W: buffer.com/resources, blotato.com, dev.to, octolens.com, upload-post.com (AV72). In CP, Siar is on 0 of 18 pages; Postiz and Zernio are on 15, Buffer and Ayrshare on 13 | long-term · **weeks–months via roundup inclusion** | roundup inclusion + listicle | **NEW** `/guides/best-social-media-apis` |
| 10 | best social media API 2026 | — | Commercial | Med (the dated form; 3 vendors put the year in the slug, AV71) | as row 9. CP 2, 3, 4, 5, 7 were all updated between 2026-09-23 and 2026-11-06 | long-term · weeks–months via inclusion | roundup inclusion | same |
| 11 | best social media posting API | — | Commercial | Low–med. AC (HU5) | W: same cluster + postpeer.dev/blog (HU5) | months · weeks–months via inclusion | listicle H2 | same |
| 12 | best social media scheduling API | — | Commercial | Low. AC 0 (AV74) | W: ayrshare.com/blog (= CP 7), opus.pro, getlate.dev/blog (AV74) | months · months | listicle H2 | same |
| 13 | best unified social media API | — | Commercial | Low. AC 0 (AV75) | not measured | months · months | listicle H2 | same |
| 14 | social media API comparison / pricing comparison table | — | Commercial | Low. AC 0 (AV81) | not measured. upload-post.com/pricing-comparison targets it (AV81). CP 3 holds an 18-row table | weeks–months · months | listicle (table) | same |
| 15 | best API to schedule posts on Instagram, TikTok and LinkedIn | p003 | Commercial | Low as typed; "social media scheduling api" is Med (HU22) | W: planable.io, ayrshare.com/blog, postly.ai, postpeer.dev, opus.pro (HU22) | months · **unlikely** while TikTok is unaudited and LinkedIn pages are denied | use-case | `/use-cases/social-media-scheduling-api` (Instagram + LinkedIn profiles only) |
| 16 | how to post to Instagram, TikTok and LinkedIn from my app | — | Informational | Low as typed (inferred); the per-network forms are Med (PN4, PN67) | not measured as typed. The per-network SERPs are vendor how-tos plus native docs (PN4, PN68) | months · unlikely for TikTok today | guide with code | **NEW** `/guides/post-to-multiple-social-networks-api` (TikTok marked "opening after approval") |
| 17 | best social media API for SaaS products | p004 | Commercial | Low. AC 0 (HU49) | W: ayrshare.com/use-cases/saas-platforms, contentstudio.io, getlate.dev/blog, bundle.social/social-media-api-for-saas, sourceforge.net (HU49) | months · months | use-case | `/use-cases/multi-tenant-social-media-api` (retitle toward "for SaaS") |
| 18 | social media posting API for agencies with many client accounts | p005 | Commercial | Low (HU48) | W: ayrshare.com/use-cases/digital-agencies, zernio.com/use-cases/agencies (HU48) | months · months | use-case | **NEW** `/use-cases/social-media-api-for-agencies` |
| 19 | multi-tenant social media API, one key many customers | p050 | Commercial | Low (HU50) | W: bundle.social/multi-tenant-social-media-api, vinquery.com, ayrshare.com (2), mallary.ai (HU50) | weeks–months · months | use-case | `/use-cases/multi-tenant-social-media-api` |
| 20 | API to publish to Bluesky, Mastodon and Threads at once | p010 | Commercial | Low (inferred; no AC run). *(corrected 2026-11-12)* Publora supports all three (its own page lists "Threads Bluesky … Mastodon", https://publora.com/pricing, checked 2026-11-12). Zernio does **not** list Mastodon (https://zernio.com/pricing.md, checked 2026-11-12). CP 4 names Upload-Post and bundle.social as Mastodon-capable (third-party) | not measured | **weeks · weeks–months**: all three are live in Siar today (truth file). Mastodon is a differentiator against Zernio, Ayrshare-class APIs and others, but at least Publora (own page), Upload-Post and bundle.social (CP 4, third-party) also cover it, so do not claim rarity | guide + H2 | **NEW** `/guides/post-to-bluesky-mastodon-threads-api` |
| 21 | social media APIs for agentic workflows | — | Commercial | Low (new phrase, AC) (HU54) | W: postpeer.dev, ayrshare.com/ai-agent, getlate.dev/blog, dev.to, blotato.com (HU54) | weeks–months · blocked by MCP state | H2 | `/use-cases/social-media-api-for-ai-agents` |
| 22 | best social media API for AI agents | — | Commercial | Low–med, rising (AV76) | CP 16 (Publora ranks itself #1, then six native APIs, Buffer, Hootsuite, and the Pinterest, TikTok and YouTube APIs); CP 2 is titled "for Developers & AI Agents" | months · blocked by MCP state | roundup inclusion + use-case | `/use-cases/social-media-api-for-ai-agents` |
| 23 | social media API with no per-account fees for agencies | — | Commercial | Low (inferred) | not measured. The CP "pricing unit" column is where this is decided | weeks–months · months | listicle row + `/pricing` H2 | `/pricing` |

### 3. Capability prompts

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 24 | how to let my customers connect their own social accounts with OAuth | p016 | Informational | Low. "social media oauth" AC 2 (HU79) | W: ayrshare.com/connect, bundle.social/social-media-oauth-api, docs.whop.com, info.bundle.social, docs.postiz.com (HU79) | weeks–months · months | use-case | `/use-cases/hosted-connect-oauth` |
| 25 | connect social media accounts API | — | Commercial | Low. Consumer completions dominate (HU79) | as row 24 | weeks–months · months | use-case H2 | `/use-cases/hosted-connect-oauth` |
| 26 | white-label social media connect link for SaaS | p017 | Commercial | Low. "white label social media api" AC 0 (HU44) | W: ayrshare.com/use-cases/digital-agencies (the /solutions/ URL 308-redirects to it, so it is one page, HU44; *corrected 2026-11-12*), bundle.social/white-label-social-media-api, juicer.io, cloudcampaign.com (HU44) | **unlikely** until the connect page drops "Powered by Siar" (truth file) | skip; say "branded connect link" | `/use-cases/hosted-connect-oauth` (no "white-label" claim) |
| 27 | social media API with webhooks when a post is published | p018 | Commercial | Low. AC 2 (HU78) | W: developer.synup.com, docs.publora.com, docs.rs (late crate), bundle.social/social-media-webhooks-api, postproxy.userjot.com (HU78) | **weeks** · weeks–months | use-case | `/use-cases/social-media-webhooks` |
| 28 | API to read and reply to comments on Instagram and Facebook | p019 | Commercial | Low. "social media comments api" AC 2 (HU75) | W: postpeer.dev, bundle.social, ayrshare.com, getlate.dev/blog, zernio.com (HU75) | weeks–months · months | use-case | `/use-cases/social-media-comments-api` |
| 29 | social media analytics API for multiple networks | p020 | Commercial | Med; mixed with listening/data APIs. AC 6 (HU74) | W: getlate.dev/blog, marketplace.gohighlevel.com, postpeer.dev/blog, ayrshare.com, shortimize.com (HU74) | months · months | use-case | `/use-cases/social-media-analytics-api` (paid plans only; say so) |
| 30 | unified inbox API for Instagram and Facebook DMs | — | Commercial | Low. "unified inbox api" AC 4 (HU77) | W: getlate.dev/social-media-inbox, getlate.dev/blog, postly.ai, zernio.featurebase.app, ayrshare.com (HU77). CP 13 argues for "inbox-first" | months · **unlikely** while DMs are a beta switch (truth file) | H2 only | `/use-cases/social-media-comments-api` (H2, beta stated) |
| 31 | schedule social media posts with an API | — | Info/commercial | Low–med (HU24) | D: upload-post.com/how-to, postpeer.dev, planable.io/blog, publora (HU24) | months · months | use-case | `/use-cases/social-media-scheduling-api` |
| 32 | social media API that validates media before posting | — | Commercial | Low (inferred; no AC run) | not measured | weeks · months. Validation before send is a code fact (truth file 1c) | H2 | `/docs/posting` + `/use-cases/social-media-posting-api` H2 |

### 4. AI agents and MCP

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 33 | social media API with an MCP server for AI agents | p008 | Commercial | Med, rising. "social media mcp" AC 10 (HU55) | W: planable.io/blog, lobehub.com, mcpservers.org, speakeasy.com, glama.ai; bundle.social and posteverywhere.ai also rank (HU55). REG lists Zernio, Upload-Post, Outstand, Blotato, Publora; Siar absent | **blocked** (not on npm, stdio only). After publishing: weeks for directories, months for search | directory listing + MCP page | **NEW** `/social-media-mcp-server` |
| 34 | social media MCP server | — | Commercial/nav | Med. AC 10 (HU55) | as row 33. AMS: 73 social media servers, Siar absent | blocked → weeks after publish | directory listing | same |
| 35 | best social media MCP servers | — | Commercial | Low–med (AV77) | CP 14 (Upload-Post, 12 servers + Zapier) and CP 15 (SocialClaw, 5). Siar on neither | blocked → months | roundup inclusion | same |
| 36 | social media MCP for Claude / post to social media from Claude | — | Commercial | Low–med. AC (HU56) | not measured. CP 14 has a "setup for Claude, ChatGPT, code editors" section | blocked → months | MCP page H2 (setup per client) | same |
| 37 | social media scheduler MCP / social media management MCP | — | Commercial | Low. AC (HU57) | W: lobehub.com, glama.ai tool pages (HU57) | blocked → weeks | directory listing | same |
| 38 | remote MCP server URL for social media posting | — | Commercial | Low (inferred) | not measured. Rivals publish remote endpoints (mcp.zernio.com, mcp.upload-post.com, mcp.outstand.so, mcp.buffer.com, mcp.blotato.com) | **unlikely** until Siar ships an HTTP transport | MCP page | same |
| 39 | does Siar have an MCP server | p037 | Navigational | Very low (new brand) | Siar's own `/docs/sdk-cli-mcp` (its install command fails, npm 404) | weeks · answer would be "yes, but not installable" today | docs | `/docs/sdk-cli-mcp` |
| 40 | n8n post to social media | — | Info/commercial | Med. AC 7 (HU72) | W: growwstacks.com, skool.com, ayrshare.com/docs, getlate.dev/blog, buldrr.com (HU72) | months · months | guide | **NEW** `/guides/n8n-social-media-posting` |
| 41 | how to give an AI agent posting access safely (API key scopes, approval step) | — | Informational | Low (inferred) | not measured | weeks–months · months | H2 | `/use-cases/social-media-api-for-ai-agents` H2 (drafts + API keys; claim only what the code does) |

### 5. Alternatives and comparisons

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 42 | Ayrshare alternatives | p021 | Commercial | **Med**, the strongest comparison term (AV1) | W: alternativeto.net, blotato.com/blog/ayrshare-alternatives, capterra.ca, capterra.in, getapp.com.au (AV1). CP 8–11 name 6–12 rivals each; Siar on none | long-term (Google) / months (Bing) · **weeks–months via directory listings** | directory listing + compare | **NEW** `/compare/ayrshare` |
| 43 | Ayrshare alternatives reddit | — | Commercial | Low–med (AV2) | W: alternativeto.net (2), data365.co, getlate.dev→zernio.com, ayrshare.com/blog (AV2) | unlikely as a page · answer in the threads themselves | community answer (disclosed) | none |
| 44 | cheaper Ayrshare alternative / Ayrshare too expensive | — | Commercial | Low. Price is the lead angle on CP 8 ("Pricing That Stops Scaling") | CP 8 (cost table at 10, 40 and 150 accounts) and CP 10 (one cost table, at 10 accounts only) *(corrected 2026-11-12)* | months · months | compare H2 (cost table at 10/100 accounts) | `/compare/ayrshare` |
| 45 | Siar vs Ayrshare | p036 | Commercial | Very low now | none found | **weeks** once the page exists (no rival will write it) · weeks | compare | `/compare/ayrshare` |
| 46 | Ayrshare vs bundle.social | p023 | Commercial | Low. No AC (AV18) | not measured. Targeted by ayrshare.com/compare/bundle-social-api-alternative and bundle.social/ayrshare-alternative (AV18) | months · PARKED (naming) | compare H2 | PARKED |
| 47 | bundle.social alternatives | p022 | Commercial | Low (AV21) | W: getapp/capterra, alternativeto.net, ayrshare.com/compare/bundle-social-api-alternative (AV21) | months · PARKED | compare / migration | PARKED |
| 48 | Late API vs Ayrshare | p025 | Commercial (old brand) | Low (AV13) | W: sourceforge.net/software/compare/Ayrshare-vs-Late (AV13). Late is now Zernio (CP 8, 10) | months, shrinking | compare H2 ("Zernio, formerly Late") | **NEW** `/compare/zernio` |
| 49 | Zernio alternative | — | Commercial | Low–med (AV31) | W: alternativeto.net, bundle.social/zernio-alternative, postiz.com, producthunt.com, postproxy.dev/compare/zernio (AV31) | weeks–months · months | compare | `/compare/zernio` |
| 50 | Upload-Post alternative | — | Commercial | Low–med (AV36) | W: alternativeto.net, ayrshare.com/compare/upload-post-api-alternative, info.bundle.social, bundle.social/blog, blotato.com (AV36) | months · months | compare | **NEW** `/compare/upload-post` |
| 51 | Postiz alternative (hosted) | — | Commercial | Low–med (AV57) | not measured. Postiz appears on 15 of 18 CP pages | months · months | compare | later `/compare/postiz` |
| 52 | Outstand alternative | — | Commercial | Low (AV60) | not measured. Outstand is on 11 of 18 CP pages; its pricing model is closest to Siar's ("connected social accounts are unlimited and free on every plan", AV price anchors) | weeks–months · months | compare | later `/compare/outstand` |
| 53 | open source vs hosted social media posting API | p026 | Informational | Low (inferred). "social media api open source" Med (HU64) | W (open source): github.com/rodrgds/openpost, ecosyste.ms, github.com/trypostit/trypost, mcpservers.org, jentic.com (HU64) | months · months, honest framing only (Siar is hosted, not open source) | answer-first explainer | H2 in `/guides/build-vs-buy-social-media-api` |
| 54 | Buffer API alternative / does Buffer have an API | — | Commercial | Low–med (AV41, AV43) | not measured. 6 vendor pages target it (AV41). Buffer is on 13 of 18 CP pages with a free API key | weeks–months · months | compare | **NEW** `/compare/buffer-api` |
| 55 | Hootsuite API alternative | — | Commercial | Low (AV48) | not measured. 5 vendor pages target it (AV48) | weeks–months · months | compare | **NEW** `/compare/hootsuite-api` |

### 6. Pricing, cheapest, free

Vendor price anchors (each vendor's own page, re-read and confirmed 2026-11-12):
- Ayrshare Premium: $149/mo for 1 profile; no free plan (Launch has a 28-day trial) (https://www.ayrshare.com/pricing/)
- Zernio: no plans; accounts 1–2 free, 3–10 $6 each, 11–100 $3 each, 101+ $1 each; posting unlimited (https://zernio.com/pricing.md)
- Outstand: $19/mo with 3,000 posts, "Connected social accounts are unlimited and free on every plan"; no free tier (https://www.outstand.so/pricing.md)
- bundle.social: Free (20 posts/mo, 3 accounts), Pro $100 (10,000 posts), Business $400 (100,000 posts), all "per organization", unlimited accounts on paid plans (https://bundle.social/pricing)
- Upload-Post: Free (10 uploads/mo, 2 profiles, no TikTok), then Basic $24/mo or $16/mo billed yearly (https://www.upload-post.com/pricing/)
- Added 2026-11-12: Post for Me $10/mo, up to 1,000 posts, unlimited accounts (https://www.postforme.dev/pricing);
  PostEverywhere Lite $9/mo, 2 accounts (https://posteverywhere.ai/pricing); SocialClaw "starting at a flat $15 a month"
  (its own post, https://getsocialclaw.com/blog/cheapest-social-media-api); SocialAPI.ai Hobby $0 (2 profiles), Side Hustle
  $29 (10 profiles), billed per "social profile" = "one brand, client or location, holding at most one account on each
  platform" (https://social-api.ai/pricing). All checked 2026-11-12.

Prices shown inside CP pages are **third-party claims**, and some disagree with each other. Outstand, for example, is
shown as "$0.01 per post" on CP 1 and "$5/month for 1,000 posts" on CP 9.

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 56 | how much does a social media API cost | p027 | Informational | Low–med. "social media api pricing" AC 7 (HU60) | W: socialdata.tools, contentstudio.io, getphyllo.com, glama.ai, ayrshare.com/pricing.md; zernio.com/blog/social-media-api-pricing (HU60) | months · months | pricing explainer | **NEW** `/guides/social-media-api-pricing` |
| 57 | social media API priced per organization, not per account | p006 | Commercial | Low. No AC (HU62) | W: postpeer.dev (3), blotato.com, website-apn.pages.dev (HU62). Similar models exist elsewhere *(corrected 2026-11-12)*: bundle.social prices "per organization" with unlimited accounts on paid plans (its own page, https://bundle.social/pricing; not only a third-party claim); Outstand gives unlimited accounts (vendor page); Post for Me gives unlimited accounts at $10 (vendor page). SocialAPI.ai bills per brand-like "social profile", but each profile holds at most one account per platform, so it is not an unlimited-accounts model (https://social-api.ai/pricing) | weeks–months · months. **Do not claim it is unique** | pricing explainer H2 + `/pricing` first line | `/pricing` + the row 56 guide |
| 58 | cheapest social media API with unlimited connected accounts | p007 | Commercial | Low. AC 0 (AV78, HU63) | W (unlimited accounts): blotato.com, website-apn.pages.dev, postpeer.dev, contentstudio.io, ayrshare.com/pricing.md (HU63). CP 12, 13 | weeks–months · months. Honest only: Outstand $19 includes 3,000 posts vs Siar Starter's 300; Siar wins on many accounts in few brands | pricing explainer (scenarios) | the row 56 guide |
| 59 | cheapest unified social media API | — | Commercial | Low. AC 0 (AV78) | CP 12 (SocialClaw $15 flat, self-ranked), CP 13 (SocialAPI.ai, self-ranked). Only 2 pages target it (AV78) | weeks–months · months, but no "cheapest" headline | pricing explainer | same |
| 60 | social media API pricing per account vs per post | — | Informational | Low (HU62, AV82) | W: postpeer.dev (3), blotato.com (HU62). Targeted by zernio.com/blog/pay-per-account-pricing (AV82) | weeks–months · months | pricing explainer H2 | same |
| 61 | Ayrshare pricing per profile | p028 | Navigational | Med (AV6) | not measured. ayrshare.com/pricing is #1 (inferred); 3 rivals have Ayrshare pricing pages (AV6) | unlikely #1 · months as a cited second source | compare H2 | `/compare/ayrshare` |
| 62 | X / Twitter API cost per post 2026 | p029 | Commercial | Med (PN42) | not measured. Targeted by bundle.social, zernio, outstand, social-api.ai, postproxy (PN39). X's own price page is the source to quote | weeks–months · weeks–months (one exact answer: $0.015 per post, $0.20 with a URL, PN42) | answer-first explainer | **NEW** `/x-api/pricing` |
| 63 | is there a free social media posting API | p030 | Transactional | Med–high (HU21, HU59) | W: buffer.com/resources, getlate.dev/blog, postpeer.dev, contentstudio.io, mcpservers.org (HU21). Ongoing free tiers, confirmed on vendor pages 2026-11-12: Zernio (2 accounts), Upload-Post (10 uploads/mo), bundle.social (20 posts/mo), SocialAPI.ai (2 profiles); Buffer Free includes 1 API key (buffer.com/pricing.md via `../competitors/buffer.md`). Ayrshare and Outstand have no free plan | **unlikely** as "free API". Siar has 20 free posts to try, one-time | `/pricing` FAQ | `/pricing` |
| 64 | social media API with ringgit pricing / pay by FPX | — | Transactional (MY) | Very low (inferred) | not measured | weeks · weeks (no rival offers it, inferred) | local landing H2 | **NEW** `/malaysia` |
| 65 | social media API price lock | — | Commercial | Very low (inferred) | not measured | weeks · low value | `/pricing` H2 | `/pricing` |

### 7. Branded facts

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 66 | what is Siar social media API | p031 | Navigational | Very low (new brand, inferred) | siaran.my: Bing #2–3 for "Siar social media API", DDG #3–4 for "siar api" (CS) | weeks · weeks, if the facts agree everywhere | home + about + llms.txt | `/`, `/about` |
| 67 | Siar siaran.my pricing | p032 | Navigational | Very low | Bing Copilot answered "RM399/month for up to 240 connected accounts", which is wrong (CS) | weeks · **fix first**: the calculator default feeds the wrong answer | `/pricing` + `/pricing.md` | `/pricing` |
| 68 | which networks does Siar support | p033 | Navigational | Very low | `/platforms`; network pages present all 15 as working (CS); GitHub description says "on 15 social networks" | weeks · risk of an overclaim answer until fixed | `/platforms` with live / built-not-open status | `/platforms` |
| 69 | is Siar legit | p034 | Navigational | Very low | No third-party page about Siar found (CP, AV1) | weeks–months · needs third-party confirmation | about (SSM 202603234793, live since 2026-10-12) + directory listings; no reviews invented | `/about` |
| 70 | who makes Siar API | p035 | Navigational | Very low | siaran.my Organization schema (GEO P1) | weeks · weeks | about | `/about` |
| 71 | Siar API GitHub | — | Navigational | Very low | github.com/Aphrosidiac/Siar (public, 0 stars) [measured] | weeks · weeks | GitHub README | repo README (fix the description wording) |

### 8. How-to per network

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 72 | how to post to Instagram via API without building a Meta app | p012 | Informational | Med. "post to instagram via api" AC 9 (PN6) | Instagram posting API: postpeer.dev, blotato.com, docs.publora.com, unipile.com, getlate.dev (PN4) | months · months. The true angle: customers connect through Siar's Meta app (approved 2026-10-27, `docs/approvals/meta.md`); no badge wording | network ref + H2 | `/instagram-api` |
| 73 | Instagram reel aspect ratio and duration limits for API publishing | p043 | Informational | Med. "instagram reels api" AC 10 (PN7) | submagic.co, ayrshare.com, developers.facebook.com, developers.qodex.ai, getphyllo.com (PN7) | months · months | network ref (limits generated from code) | `/instagram-api` |
| 74 | how to post to TikTok via API | p013 | Informational | Med (PN67–69) | tiktok content posting api: developers.tiktok.com, ayrshare.com, blotato.com, getlate.dev, bundle.social (PN67) | long-term · **unlikely** as a recommendation (audit rejected 2026-10-20) | guide only | **NEW** `/tiktok-api/how-to-post` (guide only) |
| 75 | TikTok video upload limits API | p044 | Informational | Low–med (inferred) | not measured | weeks–months · months as a reference source | network ref | `/tiktok-api` |
| 76 | how to post to a LinkedIn company page via API | p014 | Informational | Med (PN55) | not measured. Likely zernio/getlate, outstand.so, learn.microsoft.com (PN55, inferred) | months · **unlikely** as a recommendation (Pages access denied) | guide only | **NEW** `/linkedin-api/how-to-post` |
| 77 | how to post to LinkedIn via API (personal profile) | — | Informational | Med (PN53) | not measured | months · months (live in Siar) | guide | same |
| 78 | how to schedule a YouTube Short via API | p015 | Informational | Med (PN82) | not measured. Likely ayrshare.com, getlate.dev (PN82, inferred) | months · *(corrected 2026-11-12)* the truth file 1b "locked private" rule is stale: Google lifted it on 2026-11-02 (revision history). Siar has not yet recorded a public upload [unverified], so still guide only until one is tested | guide only (re-grade after a real public upload) | **NEW** `/youtube-api/shorts` |
| 79 | API to post to Google Business Profile programmatically | p011 | Informational | Low (inferred) | not measured | unlikely · unlikely (parked) | skip | `/google-business-profile-api` (mark "built, not open") |
| 80 | post to Bluesky via API | — | Informational | Low. AC 4 (PN103) | not measured; low competition (PN103) | **weeks** · weeks | guide | **NEW** `/bluesky-api/how-to-post` |
| 81 | schedule Bluesky posts API | — | Commercial | Low (PN104) | DDG: bsky.app, postfa.st (2) (PN104) | **weeks** · weeks | network ref H2 | `/bluesky-api` |
| 82 | post to Threads via API | — | Informational | Low (PN32) | not measured | weeks–months · weeks–months | guide | **NEW** `/threads-api/how-to-post` |
| 83 | how to avoid double posting when retrying a social media API | p045 | Informational | Low (inferred; no AC run) | not measured | **weeks** · weeks–months. A code fact backs it (`engine/publisher.ts` claim + reconcile, truth file 1c) | answer-first explainer | **NEW** `/guides/idempotent-social-media-posting` (or `/docs/posting` H2) |
| 84 | post release notes to Slack, Discord, LinkedIn and X from CI | p049 | Informational | Low (inferred) | not measured | **weeks** · weeks–months | guide with a CI example | **NEW** `/guides/post-release-notes-from-ci` |
| 85 | Slack API post message / schedule message | — | Informational | Med (PN116) | not measured; docs.slack.dev (inferred) | long-term · months | network ref H2 | `/slack-api` |

### 9. Troubleshooting codes

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 86 | Instagram API error 2207042 | p038 | Informational | Low–med. "instagram api error" AC 4 (PN16) | DDG (Instagram errors): upgrow.com, instagrapi.com, postpeer.dev/errors/instagram (PN16) | **weeks** · weeks. The code is on Siar's page [measured] | error ref | `/instagram-api/errors` |
| 87 | TikTok API spam_risk_too_many_posts | p039 | Informational | Low (inferred) | not measured. postpeer.dev/errors/tiktok seen in an audit SERP (PN73) | weeks · weeks [code present, measured] | error ref | `/tiktok-api/errors` |
| 88 | unaudited_client_can_only_post_to_private_accounts | — | Informational | Low. "tiktok api private" AC 3 (PN72) | not measured | **weeks** · weeks [code present, measured] | error ref | `/tiktok-api/errors` |
| 89 | Bluesky API ExpiredToken fix | p040 | Informational | Low (inferred) | not measured | weeks · weeks [code present, measured] | error ref | `/bluesky-api/errors` |
| 90 | LinkedIn API 422 duplicate post | p041 | Informational | Low (inferred) | not measured | weeks · weeks [present, measured] | error ref | `/linkedin-api/errors` |
| 91 | LinkedIn API error 426 (version sunset) | — | Informational | Low. AC 4 (PN63) | not measured | **weeks** (version 202511 sunsets 2026-11-16, PN63) · weeks | error ref | `/linkedin-api/errors` |
| 92 | X API 403 duplicate content | p042 | Informational | Low (inferred) | not measured | weeks · weeks [present, measured] | error ref | `/x-api/errors` |
| 93 | X API 402 CreditsDepleted | — | Informational | Low–med. AC 5 (PN46) | DDG: opentweet.io, note.com, x.com (PN46) | **weeks** · weeks [present, measured] | error ref | `/x-api/errors` |
| 94 | YouTube API uploads locked private | — | Informational | Med (PN89) | not measured | **weeks** (the rule changed 2026-11-02, PN89) · weeks | network ref H2 | `/youtube-api` |

### 10. Malaysia

| # | Prompt / keyword | Prompts | Intent | Demand (evidence) | Ranks or cited now | Win (search · answer) | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 95 | social media API Malaysia | p046 | Commercial | Very low. AC 0 (HU92) | W: no relevant result (HU92) | **weeks** · weeks (empty field) | local landing | **NEW** `/malaysia` |
| 96 | API untuk post ke Instagram dan TikTok serentak | p047 | Commercial (BM) | Very low (inferred) | not measured | weeks · **unlikely** for the TikTok half; an Instagram-only answer is truthful | `/malaysia` FAQ line (the site stays English, `brief.md`) | `/malaysia` |
| 97 | social media scheduling tool for Malaysian agencies with API | p048 | Commercial | Low. "social media scheduler malaysia" AC 0 (HU91) | W: shinjiru.com.my/blog, dark-factory-labs.pages.dev, postla-page.pages.dev, zynex-ai-v2.pages.dev, storehub.com (HU91) | **weeks** · weeks | local landing | `/malaysia` |

---

## What this sweep tells us

1. **For the commercial prompts, the answer is decided by a pool of about 20 vendor-written roundups, and Siar is in none of
   them.**
   - *(corrected 2026-11-12)* 14 of the 18 pages are written by a vendor that ranks itself first. A 15th (Social Champ,
     CP 6) is vendor-written but puts itself 3rd. The other three are AlternativeTo and two dev.to posts, and one of the
     dev.to posts is by a vendor (PostWire, disclosed, unranked) [measured].
   - The same 9 brands recur across the pool: Postiz and Zernio (15 of 18), Buffer and Ayrshare (13), Outstand (11),
     Post for Me and Upload-Post (9), Blotato (8), bundle.social (7). Siar appears 0 times [measured].
   - An engine that grounds "best social media API" or "Ayrshare alternatives" on these pages will name those brands
     [inferred]. Siar's own ranking does not change that for months.
2. **Getting into the pool is easier than ranking.**
   - The roundups are maintained: CP 2, 3, 4, 5 and 7 were updated between 2026-09-23 and 2026-11-06.
   - Several are wide. Upload-Post lists 18 APIs, including small entrants such as SocialClaw, Socialync, PostFast and
     PostSyncer [measured]. Whether these launched in 2026 is unverified.
   - The realistic route is a short factual pitch to each maintaining author, sending the facts their table needs, plus
     listings on AlternativeTo, Capterra/GetApp, G2 and SourceForge [inferred]. The facts: networks open today, starting
     price, pricing unit, MCP, SDK, webhooks, free tier.
   - This belongs at the top of `offsite-plan.md`, ahead of a Siar-written listicle. It needs Fakhrul's go, and it must
     use real activity only: no paid placement and no invented reviews.
3. **The roundups share a common row schema, and Siar's row would currently read badly on one column.**
   - *(corrected 2026-11-12)* The columns vary by page, but platforms, entry price, pricing unit and MCP recur [measured on
     CP 3, inferred for the rest]. CP 3's exact columns are platforms, MCP / agent-ready, SDKs, comments·DMs·analytics,
     entry price, cost per connected profile and free tier. "Open source" and "best for" were not confirmed as columns.
   - MCP is now a standard column or section on CP 1, 2, 3, 4, 5 and 14.
   - Siar's MCP is stdio-only, not on npm and in no registry. REG already lists Zernio, Upload-Post, Outstand, Blotato and Publora [measured].
   - Publishing `@siar/mcp` (Fakhrul's go) unblocks the whole AI/MCP cluster (rows 5, 21, 22, 33–39). A remote HTTP transport
     would match what six rivals already ship. Until then, rows 33–39 cannot be won.
4. **Siar's pricing message must not claim to be unique.**
   - "Per organization, unlimited accounts" is real but shared *(corrected 2026-11-12)*. bundle.social uses the same model
     on its own page ("per organization", unlimited accounts on paid plans, Free 20 posts/mo, Pro $100 for 10,000 posts,
     Business $400 for 100,000) [sourced: https://bundle.social/pricing]. Outstand and Post for Me give unlimited accounts on
     every plan (their own pages). SocialAPI.ai bills per brand-like profile but caps each at one account per platform
     (its own page) [sourced, checked 2026-11-12].
   - *(corrected 2026-11-12)* Siar Starter's $19 equals Outstand's $19 entry plan. Zernio has **no** $19 starting point: it
     charges per account, with 2 accounts free and $6 per account from the 3rd (https://zernio.com/pricing.md). Post for Me
     ($10, postforme.dev/pricing), PostEverywhere Lite ($9, 2 accounts, posteverywhere.ai/pricing) and SocialClaw ("from
     $15", its own blog) are lower [sourced, vendor pages, checked 2026-11-12].
   - The defensible claim is the scenario: many accounts in few brands, for example 100 accounts in 10 brands on Pro, with the
     arithmetic shown.
   - Also fix the home calculator default. Bing Copilot is already repeating a wrong "240 connected accounts" limit (CS).
5. **The prompts Siar can win soonest are the ones nobody pitches: exact error codes, niche networks and engineering how-tos.**
   - All five troubleshooting prompts (p038–p042) already have their exact code on a Siar error page [measured].
   - Bluesky, Mastodon and Threads publishing (p010) is live in Siar. *(corrected 2026-11-12)* Mastodon is not rare:
     Publora (own page), Upload-Post and bundle.social (CP 4, third-party) cover it; Zernio does not list it.
   - Idempotent retries (p045) and release notes from CI (p049) are backed by real code, and no page was seen targeting them.
   - The blocker here is indexing, not content: at least 5 of 15 error pages (6 more unknown) and most of `/docs` are not in Google (CS).
     Search Console and the sitemap come first.
6. **The truth-file limits rule out several prompts as recommendations.** Rows 15, 16, 74, 76, 78, 79 and 96 (TikTok,
   LinkedIn pages, YouTube Shorts, Google Business Profile) can only earn a citation as a reference source, with an honest
   status line. *(corrected 2026-11-12)* YouTube may leave this list: Google stopped locking unverified-project uploads
   private on 2026-11-02 (developers.google.com/youtube/v3/revision_history). Test one public upload, then update the truth
   file and re-grade row 78. Row 26 (white label) and row 30 (DMs) stay off until the product changes. Branded answers will also go wrong
   while two things overstate the networks: the GitHub description ("on 15 social networks") and network pages that present
   all 15 as working. Fix both before any outreach.
7. **Map from cluster to page type** (the table above, in short):
   - definitions → answer-first explainer
   - "best for" → roundup inclusion, then use-case pages
   - capabilities → use-case pages (already built)
   - MCP → registries and a README, after the npm publish
   - alternatives → directory listings, then `/compare/*`
   - pricing → a scenario explainer + `/pricing.md`
   - branded → consistent facts on every surface
   - how-to and errors → network reference pages (already built, under-indexed)
8. **What is still unmeasured:** the engines' actual answers and citations. Fill wave 0 (`docs/geo/visibility/manual-2026-10-13/manual.csv`)
   next. Then check rows 9, 33, 42, 56 and 86 in a turn with search budget, so this file's "cited pool" can be compared with
   what ChatGPT and Perplexity really cite.

### Suggested order (inferred; each item needs Fakhrul's go)

| Priority | Action | Rows |
|---|---|---|
| P0 | Fix the facts engines are already repeating: the home calculator default (Copilot answer), the GitHub description wording, and live / built-not-open status on `/platforms` and the network pages | 67, 68, 71 |
| P0 | Search Console + sitemap + internal links, so the error and docs pages get indexed | 86–94 |
| P1 | Publish `@siar/mcp` to npm, then list it in REG, AMS, Glama, Smithery and mcp.so; then **NEW** `/social-media-mcp-server` | 5, 21, 22, 33–39 |
| P1 | Off-site: AlternativeTo, Capterra/GetApp, G2, SourceForge listings + a factual pitch to the maintained roundups (CP 1–5, 7, 14) | 9–14, 35, 42, 44 |
| P2 | **NEW** `/guides/social-media-api-pricing` (scenarios, no "cheapest" headline), `/x-api/pricing` | 23, 56–60, 62 |
| P2 | **NEW** `/guides/post-to-bluesky-mastodon-threads-api`, `/guides/idempotent-social-media-posting`, `/guides/post-release-notes-from-ci`, `/bluesky-api/how-to-post` | 20, 80, 83, 84 |
| P2 | **NEW** `/compare/ayrshare` (owner go/no-go on comparison pages) | 42, 44, 45, 61 |
| P3 | **NEW** `/guides/what-is-a-unified-social-media-api`, `/guides/post-to-multiple-social-networks-api`, `/guides/build-vs-buy-social-media-api` | 1–3, 6–8, 16, 53 |
| P3 | **NEW** `/malaysia`, `/use-cases/social-media-api-for-agencies` | 18, 64, 95–97 |
| Hold | TikTok, LinkedIn Pages, YouTube Shorts (until a public upload is tested; Google lifted the private lock 2026-11-02), GBP how-tos as recommendations; white label; DMs; bundle.social pages | 15, 26, 30, 46, 47, 74, 76, 78, 79 |
