# Siar strike plan

Final plan, checked 2026-11-12. This is the judge's version. It scores the three strategy proposals
(`research/strategy-developer-api.md`, `research/strategy-malaysia-agency.md`, `research/strategy-category-creator.md`)
and combines their strongest parts into one plan. It builds on `competitors.md`, `keyword-map.md`, `market.md`,
`research/siar-truth.md`, `research/current-site.md` and `docs/geo/*` and does not repeat their work.

The order of authority:
- This file overrules the three proposals.
- `siar-truth.md` overrules this file on any Siar fact, except for the corrections in section 2, which update it.
- The companion file `docs/seo/messaging.md` holds the positioning, the pillars, the voice and the never-claim list.

Cluster IDs (C01–C127) come from `keyword-map.md`. New IDs: N1–N6 for new pages from this plan, M1–M2 from the Malaysia
proposal.

**Labels.**
- **[measured]**: I saw it today: a page fetched or code read.
- **[sourced]**: the vendor's or network's own page, with its URL, checked 2026-11-12, by me or by the sibling file named.
- **[code] / [doc]**: this checkout, `/Users/fakhrul/Desktop/dev/Siar-seo-research`.
- **[third-party]**: someone else's page.
- **[inferred]**: my judgement or arithmetic.
- **[unverified]**: not checked.

**What I checked myself today:**
- **Pages fetched (WebFetch):**
  - postwire.io and postwire.io/pricing
  - hootsuite.com/integrations/mcp
  - buffer.com/resources/legacy-rest-api-retired/
  - bundle.social/pricing.md
  - getduta.com/llms.txt
  - learn.microsoft.com/en-us/linkedin/marketing/versioning and /error-responses
  - developers.google.com/youtube/v3/revision_history
- **Code read:**
  - `schema.prisma` line 4
  - `engine/publisher.ts`: the claim, the final-state webhook and the crash reconciliation
  - `engine/webhooks.ts`
  - `site/lib/events.ts` line 25
  - `modules/posts.ts`
  - `domain/plans.ts` (`RESOURCE_LIMITS`, taglines, `ONCE_METHODS`) and `site/lib/plans.ts`
  - `llms.txt.ts`, `pricing.astro`, `Footer.astro`, `refunds.mdx`
  - `billing-core.ts`
  - `linkedin.ts` (lines 38, 103, 361) and `youtube.ts` (lines 264, 382–384)
  - `openapi.json`

**Limits:**
- WebSearch was refused because the shared 200-call budget for this turn was already spent. Under the terms of that
  refusal I did not query search engines any other way. So in this pass no ranking, autocomplete or People Also Ask
  result was measured again.
- Every demand grade below is a sibling sweep's measurement, used as **[inferred]** demand.
- AI answers are still not measured: the wave-0 sheet is empty.

---

## 0. The call

1. **Content spine: the developer-first plan.** Win "social media API" from below with pages only Siar can write
   first-hand:
   - the error reference (147 codes);
   - network gates, from its own approval records;
   - quotas generated from code;
   - webhook delivery;
   - dated migrations.

   Head terms come last. This plan scores highest on winnability and on fit with the real prices (section 1).
2. **Message: the category creator's idea, "Every post accounted for."** Per-organization pricing is no longer
   distinctive:
   - PostWire says "Priced per business" and charges $29 for 10 brands [sourced: postwire.io/pricing].
   - bundle.social's home title says "Unlimited Social Accounts" (category proposal).

   So price is the second line, carried by the one number nobody beats: **unlimited brands and 100,000 posts for $149
   (RM399)**.
3. **Malaysia is a bounded wing, not the spine.** Keep:
   - the agency page;
   - the `/malaysia` answer page with a fair, dated table;
   - the ringgit comparisons;
   - the trust line beside every price;
   - a 7-page BM test with a kill rule.

   One global Business customer ($149) pays about what six Malaysian Pro customers pay (RM99 ≈ $23.6 at the 4.20
   rate) [inferred]. Malaysia is still the likeliest place to find the first paying customers fast [inferred].
4. **Nothing ships next to a fake.** The site over-claims in at least 32 places: the 29 items in siar-truth §6, plus 3
   found today. Examples: TikTok, Google Business and LinkedIn company pages shown as "Posted"; a scripted "Live" feed;
   "all 15 networks" in `llms.txt`. Wave 0 is strike point 1.
5. **Two dated triggers come first:**
   - LinkedIn retires API version 202511 on **2026-11-16**. A retired version returns HTTP 426 `NONEXISTENT_VERSION`.
     Siar already sends 202609.
   - Buffer's legacy REST API has a brownout on **2026-12-09** and stops on **2027-02-01**. The first brownout was
     yesterday.
6. **Biggest locked door: the bundle.social switch.** Siar implements 194 of bundle.social's 197 current v1 operations.
   It is parked on Fakhrul's naming decision. The day he decides, it moves to the top of the content list, right after
   Wave 0.
7. **Other locked doors, by size:**
   - the DM beta (comment-to-DM, the largest Malaysian SME prize);
   - npm plus a remote MCP endpoint (the agent lane);
   - one public YouTube test upload (Google lifted the private-only rule on 2026-11-02);
   - TikTok approval;
   - the X terms read.
8. **Proof is artefacts, never numbers.** Siar may claim no customers, uptime, speed or reviews. What it can show:
   - a public OpenAPI file (3.0.2, 270 operations);
   - generated network and error pages;
   - the webhook schedule;
   - a dated approval record;
   - a price list with a price lock.

---

## 1. How the three angles score

Scale 1–5. Weights: winnability 0.4, revenue fit 0.35, truthfulness 0.25. Truthfulness is also a gate: any claim
that fails it is cut, whatever the score.

| | Developer-first | Malaysia-first | Category creator |
|---|---|---|---|
| **Winnability** | **4.** Long-tail pages where 2026 domains reach Bing/DDG top 3 within weeks (social-api.ai, postwire.io, measured once in `keyword-map.md`). 147 codes are already written. Head terms are held back on purpose | **3.** Thin results pages and a contestable AI answer (Duta's llms.txt). But demand for a Malaysian tool is near zero: "social media scheduler malaysia" returns AC 0. BM how-to searchers want the free native answer first | **3.** The idea itself has no search demand: every "reliable / duplicate / webhook / approval" + "social media api" probe returned AC 0 (their measurement). Its content engine, the "failure library", is the developer angle's engine under another name |
| **Revenue fit** (real prices) | **4.** Aims at Pro $49 and Business $149 buyers. Switchers from Ayrshare ($149 for 1 profile) and Zernio (per account) are the highest-value segment open today. Holds the bundle.social door | **2.5.** Pro RM99 for 10 brands is a decisive agency offer, but it is about $23.6. SMEs buy Starter at RM39 (about $9.3). The biggest SME job (comment-to-DM) and the main seller channel (TikTok) are both gated | **4.** Aims at SaaS builders and switchers. Leads the pricing story with the 500-brand case, where Siar wins outright ($149 Business vs about $734 Postproxy, $799 WoopSocial, $1,218 Zernio at 1,000 accounts; `competitors.md` §2c) |
| **Truthfulness** | **5.** Corrects stale facts (OpenAPI 3.0.2/270, Hootsuite MCP, LinkedIn 202609, no idempotency key on create). Holds MCP pages until npm | **4.** One overreach: "the only public API from a Malaysian vendor". Duta's own llms.txt says "Duta has a public API and an MCP connector" [sourced, today] | **4.** Two overreaches. "Disconnected accounts are flagged before your next post fails" asserts a timing nobody has measured. "Every post accounted for" can be read as a delivery promise unless a mechanism always follows it |
| **Weighted** | **4.25** | **3.1** | **3.6** |
| **Kept in the final plan** | Content engine, compare set, docs SEO, OpenAPI/npm/registry off-site work, decision list, kill rules | `/for-agencies`, `/malaysia` with an alphabetical sourced table, trust line, Zoho/Duta/Meta Business Suite compares, MY cost guide, BM test with kill rule, MY never-say list, `prompts_my_v1` | Positioning line and hierarchy, `/how-publishing-works`, `/network-changes`, failure-handling columns, canonical entity paragraph, `prompts_v2`, the PostWire diagnosis |
| **Dropped or changed** | "Per business" as the lead line; `/facts` (merged into `/about`); separate pages for tiny rivals | "Only public API"; BM moved to W2; Zoho/Duta pulled back to W2 | Failure-handling page cut to vendors already sourced and moved to W3; the "before your next post fails" line; `/use-cases/social-media-api-for-agencies` folded into `/for-agencies` |

**Why the developer angle leads and the other two are grafted onto it:**
- Its pages can rank (errors, gates, quotas, dated migrations).
- Its buyers pay the most (Pro, Business, switchers).
- Its claims survive a hostile reader.

**Why it needs the category idea:** its own one-liner leads with "a social media API you pay for per business". On
2026-11-12 PostWire says the same thing, cheaper at 10 brands.

**Why Malaysia stays:**
- Fakhrul's own pricing brief was "make Siar the best option for Malaysians" (`docs/pricing.md`).
- The agency arithmetic is decisive.
- The AI answer to "is there a Malaysian tool?" is open to a fairer page.
- It costs little.

---

## 2. Corrections from this pass (they change pages)

| # | Topic | What the files said | What is true today (checked 2026-11-12) | Effect |
|---|---|---|---|---|
| 1 | Hootsuite MCP | `competitors.md` §5.9: Perch only saves drafts | Perch: "Create social media posts and publish them to X and Instagram at the same time"; schedules to LinkedIn and Instagram; Nest can "reply with saved responses" [sourced: https://www.hootsuite.com/integrations/mcp] | Drop the "drafts only" attack. `/compare/hootsuite-api` leads with per-seat pricing, no connect API for your customers, and unsigned webhooks (re-check developer.hootsuite.com the day it ships) |
| 2 | PostWire (new close rival) | Teardown missing | See the note below this table [sourced: https://postwire.io/pricing, https://postwire.io/] | PostWire is **cheaper than Siar from 1 to 50 brands**. Siar's ground: above 50 brands, Threads, documented webhook retries, a public error reference, ringgit. Never "only per-business", "only dated approvals" or "only duplicate protection" |
| 3 | Duta | MY proposal G8: no Malaysian vendor publishes API docs | Duta's llms.txt: "Duta has a public API and an MCP connector". "First" is qualified there: "about where the tool was built, not about who served the market first". "A card is needed to start" [sourced: https://getduta.com/llms.txt] | Never "only Malaysian API". The most a page may say: "Siar's API docs and OpenAPI file are public" (Duta's docs sit behind a login per the teardown; re-check before printing) |
| 4 | bundle.social | Hobbyist "Message us" line; 14-day trial | `pricing.md` ("Last updated: 2026-07-30"): Free 20 posts **a month**, 3 teams; Pro $100 ($90 yearly), 10,000 posts, unlimited teams; Business $400 ($360); **webhooks 5 per organization on every plan**; DMs by email request, Instagram and Messenger only. The `.md` has no hobbyist line and no trial [sourced] | Siar also caps webhooks at 5 per org [code: `RESOURCE_LIMITS.webhooks`], so never compare endpoint counts. Quote the hobbyist line or the trial only after re-reading the HTML pricing page on the day |
| 5 | Buffer | As proposed | "Two brownouts are planned before sunset: November 11 and December 9, 2026"; "retiring Buffer's legacy REST API on February 1, 2027"; the replacement is a GraphQL API "with an MCP server, a CLI, and managed OAuth"; published 2026-07-27. The article says nothing about users who have no Buffer account [sourced] | `/compare/buffer-api` goes live before 2026-12-09. The "your users need Buffer accounts" point comes from Buffer's developer docs via the teardown: re-check developers.buffer.com when the page ships |
| 6 | LinkedIn | As proposed | 202511 "will be sunset on November 16, 2026"; latest version 202610; each version supported "a minimum of one (1) year". A retired version returns `{"status": 426, "code": "NONEXISTENT_VERSION", "message": "Requested version yyyymmdd is not active"}`; a missing header returns 400 `VERSION_MISSING` [sourced: learn.microsoft.com …/versioning, …/error-responses]. Siar sends 202609 [code: `linkedin.ts` line 38]; its error reference already lists 426 [code: line 361] | The 426 section says, truthfully, that Siar runs a current version. Calendar reminder: bump the version before 202609 retires, which is not before about September 2027 [inferred from the one-year minimum] |
| 7 | YouTube | siar-truth: uploads locked private until the audit | 2026-11-02: uploads through `videos.insert` from unverified projects "are no longer restricted to private viewing mode"; privacy defaults to public if unset. 2026-11-03: custom Shorts thumbnails. The October–November entries give no "100 per day" figure; `videos.insert` got its own quota bucket on 2026-06-01 [sourced: revision history] | Siar's adapter sends the privacy the customer asks for and flags "locked private" only when YouTube returns private [code: `youtube.ts` 382–384]. So uploads may now be public. Until one production test: "YouTube: connect and upload now; public uploads not yet confirmed." Update the "locked private" error entry (`youtube.ts` line 264). Never print "100 uploads a day" without the quota page |
| 8 | `llms.txt` | Not flagged | "Every plan has unlimited social accounts and all ${N} networks." [code: `llms.txt.ts` line 34] | Wave 0. AI fetchers read this file first |
| 9 | Pricing hero | Partly flagged | Title "One price per business." + "Every account included." + "…unlimited social accounts across all 15 networks" [code: `pricing.astro` line 34] | Wave 0 rewrite (`messaging.md` §10) |
| 10 | Webhook event docs | Category proposal | `events.ts` line 25 says `post.published` is "Sent once per post per network". The code sends it once per post when the whole post reaches POSTED or ERROR, and again if a retried post later reaches a new final state [code: `publisher.ts` 227–260] | Fix the description before any page quotes it. The wire name stays |
| 11 | Duplicate protection | Developer proposal | No idempotency handling in `posts.ts`. `idempotencyKey` appears in the OpenAPI only on automation execution responses [code] | The duplicates guide says so plainly. PostWire offers a client key [sourced]; Siar does not |
| 12 | Crash handling | Not described in the proposals | A claim older than 20 minutes is checked against the account's recent posts before anything is re-sent. Where an adapter cannot look, the target ends as "Publishing was interrupted and the result could not be confirmed" instead of being re-sent [code: `publisher.ts` 262–289] | This is the strongest true proof of "accounted for". Use it on `/how-publishing-works` |

**PostWire, quoted from its own pages (row 2):**
- **Billing unit:** "Priced per business."
- **Free:** 10 posts a month, 2 networks per post.
- **Paid plans:**
  - Starter $19: 3 brands, 1,000 posts.
  - Pro $29: 10 brands, fair use 10,000 posts.
  - Agency $99: 50 clients, fair use 50,000.
  - Scale $299: 200 clients, fair use 150,000.
- **Webhooks:** 2 to 50 endpoints by plan. No retry claim on its home or pricing page.
- **X:** 1 credit per post, 10 per link post; 80 credits for $5.
- **MCP:** hosted at `https://postwire.io/api/mcp`, "in Claude's connector directory".
- **Dated approvals:** TikTok Direct Post audit "July 7, 2026", Meta App Review "July 14, 2026", YouTube "July 1, 2026".
- **Duplicates:** "An identical post is refused for two minutes, or 24 hours with your own idempotency_key".
- **Gaps:** LinkedIn "Company Pages: not yet"; Threads and Pinterest "not offered yet".

---

## 3. Where to strike, ranked by impact and speed

Impact (I) and speed (S) are 1–5 and inferred. Score = I × S. Dated triggers break ties. A gate is a decision only
Fakhrul can make (section 10).

| # | Strike | I | S | Score | Gate | When |
|---|---|---|---|---|---|---|
| 1 | Make the site true (Wave 0) | 5 | 5 | 25 | His go to deploy | Days |
| 2 | Error library + `/errors`, LinkedIn 426 first | 3 | 5 | 15 | None | Days–weeks; 426 by 2026-11-16 |
| 3 | Buffer REST deadline page | 3 | 5 | 15 | Comparison go | Before 2026-12-09 |
| 4 | SaaS at scale: the bill that stops growing | 5 | 3 | 15 | Accounts wording (a default is given) | Weeks–months |
| 5 | "Meta already cleared" + dated approval record + gate guides | 4 | 3 | 12 | TikTok row wording | Weeks |
| 6 | Failure handling as the buying criterion | 3 | 4 | 12 | Comparison go for rival columns | Weeks |
| 7 | Dashboard-tool API comparisons (Hootsuite, Metricool, Publer, Sprout) | 3 | 4 | 12 | Comparison go | Weeks–months |
| 8 | YouTube reopening after Google's 2026-11-02 change | 3 | 4 | 12 | One public test upload | Weeks after the test |
| 9 | Agencies at one price (global + Malaysia) | 3 | 3 | 9 | Accounts wording; comparison go for the MY table | Weeks |
| 10 | Per-profile / per-account switchers (directories first) | 4 | 2 | 8 | Comparison go | Months |
| 11 | Open-network depth: Threads, Bluesky, Mastodon, Discord, Slack, CI, n8n, link in bio | 2 | 4 | 8 | None | Weeks |
| 12 | BM test set (7 pages) | 2 | 2 | 4 | BM go; Fakhrul edits the BM | Weeks 5–12 |
| — | bundle.social switch | 5 | 5 | 25 | Naming + legal read | **Becomes #2 the day it is unparked** |
| — | Comment-to-DM (DM beta) | 4 | 3 | 12 | Open the beta to every paid org | Then rank with #5 |
| — | MCP and agents | 3 | 1 | 3 | npm; a remote endpoint | After both |

If Fakhrul wants the first customers soon rather than the highest revenue per customer, move #9 up to #4. It costs
little and blocks nothing [inferred].

### 1. Make the site true (Wave 0)

- **Why:** engines already repeat Siar's mistakes. Bing Copilot quotes "RM399/month for up to 240 connected accounts",
  which comes from the calculator's server-rendered default [measured, `current-site.md` §4]. A buyer who reads the
  status table and then sees TikTok marked "Posted" on the home page leaves. Every honesty-led page is a liability until
  this ships.
- **What:** the full list is in section 5.1. It covers the 29 items in siar-truth §6 plus the `llms.txt` line, the
  pricing hero and the webhook event description. It also covers:
  - one network-status constant that drives every page;
  - the glued H1/H2 text on 42 pages;
  - `noindex` on app.siaran.my;
  - GSC and Bing Webmaster verified;
  - IndexNow after each deploy.
- **Kills it:** shipping new pages first.

### 2. The error library and `/errors`, starting with LinkedIn 426

- **Why it wins:**
  - **Already built:** 147 codes are already written, generated from the adapters [measured].
  - **Small fields:** rival families are small: bundle.social 14 pages plus a hub, Ayrshare 30, Zernio 12, PostPeer 10.
  - **Proven page type:** postpeer.dev ranked on DDG for "instagram api errors how to fix" with exactly this kind of
    page (measured once).
  - **Prompts already answerable:** p038–p042 are exact codes Siar already has [measured, `keyword-map.md` §5].
- **First:** the LinkedIn 426 section, written for any developer who hits it: "Requested version yyyymmdd is not
  active" means the `Linkedin-Version` header points at a retired version; 202511 retires 2026-11-16; the latest is
  202610. Then one line: Siar sends 202609, so Siar users are not affected. Then X 402 `CreditsDepleted` and 403
  duplicate content.
- **Template fix for all 15 pages:**
  - **H2 format:** code + the network's message + a plain name ("190 · Error validating access token · the token
    expired").
  - **Opening:** the first 50 words answer "what it means and the fix".
  - **Siar's part:** one "What Siar does with it" line after that.
  - **Links:** per-code anchors (`#code-190`) and a visible `dateModified`.
  - **Mastodon:** fill its page with HTTP-status guidance or set it to noindex.
- **Kills it:** intros that explain Siar instead of the error; bare-number H2s.

### 3. The Buffer REST deadline: `/compare/buffer-api` before 2026-12-09

- **Why it wins:** developers whose Buffer integration is about to stop working have a deadline. At most six rival
  pages target "buffer api alternative": Ayrshare, Outstand, Postproxy, Zernio, Publora, PostEverywhere
  [measured, `keyword-map.md` C50].
- **Siar's true lead:** your customers connect their own accounts through your branded link, with no Buffer account;
  REST with a public OpenAPI file; signed webhooks; comments in the API; every plan.
- **Must concede:**
  - Buffer has a free plan, a hosted MCP and more live networks (TikTok, YouTube Shorts, Pinterest, LinkedIn Pages).
  - Siar is **not** REST-compatible with Buffer: a migrator rewrites either way.
- **Kills it:** missing 2026-12-09; implying a drop-in replacement.

### 4. SaaS at scale: the bill that stops growing

- **Why it wins:** the highest revenue per customer, and the one price comparison Siar wins outright.
- **The arithmetic** (all `competitors.md` §2c, sourced):
  - **500 brands and 20,000 posts a month:** Siar Business $149, Post for Me about $150, Postproxy about $734,
    WoopSocial $799.
  - **1,000 accounts:** Zernio is $1,218 by its own example.
  - **Next tier up:** PostWire Scale is $299 for 200 clients; bundle.social Business is $400.
- **Pages:** `/guides/social-media-api-pricing` (C26) with dated scenarios at 1, 10, 50 and 500 brands, **leading
  with 500**, and an honest H2 on where each rival is cheaper. `/use-cases/multi-tenant-social-media-api` (C11)
  retitled "Social media API for SaaS: multi-tenant by design". `/use-cases/hosted-connect-oauth` (C12) retitled
  "Social media OAuth API: a branded connect link".
- **Must concede:**
  - Siar is not cheapest at 1 brand: Zernio is free for 2 accounts; Post for Me and Publer's API cost $10.
  - It is not cheapest at 10 brands either: PostWire $29, SocialAPI.ai $29, Outstand $33, Upload-Post $39.
  - Siar caps posts; several rivals do not.
- **Kills it:** "unlimited accounts" without the per-brand rule; any "cheapest" headline.

### 5. "Meta already cleared", the dated approval record and the gate guides

- **Why it wins:**
  - **The biggest pain:** the gate in front of each network is the top pain across every segment
    (`market.md` P1).
  - **Real demand:** "meta app review" returns 10 completions, including "taking time" (measured by a sibling).
  - **An honest CTA:** Meta is the one network where "your customers connect through our already-approved app" is
    true. Siar's Meta app was submitted 2026-10-14 and approved 2026-10-27 after a same-day resubmission, with all 27
    permissions [doc: `docs/approvals/meta.md`].
  - **Nobody publishes the record:** no rival publishes a dated per-network record of its own approvals with the
    failures included. PostWire shows its approval dates; Duta shows "waiting for approval" [inferred from sitemaps
    and pages].
- **Pages:**
  - `/platforms/approvals` (C04);
  - `/facebook-api/meta-app-review` (C76);
  - `/linkedin-api/community-management-api` (C91: denied, no reason given);
  - `/youtube-api/audit` (C98) and `/youtube-api/quota` (C97);
  - `/pinterest-api/access` (C103: Trial vs Standard).
- **Kills it:**
  - "Skip the review" for any network other than Meta.
  - Publishing the TikTok rejection without Fakhrul's yes. The default TikTok row reads "audit not passed yet;
    sandbox only".

### 6. Failure handling as the buying criterion

- **Why it wins:**
  - **Not a headline anywhere:** none of the roughly 20 vendor home pages quoted in `competitors.md` §3 leads with it.
  - **The open question shows:** PostPeer's FAQ heading "What happens if a post fails on one platform?" shows the
    question with no answer under it (category proposal, fetched today).
  - **Siar's row is the strongest:** the webhook field is where Siar's row is clearly ahead on vendors' own docs.
    Upload-Post sends each event once with no retry; bundle.social makes 3 attempts; Mixpost 3 in about 6 minutes;
    Ayrshare about 16 hours with optional HMAC; Postiz documents no signing or retry; PostWire states no retry policy
    on its home or pricing page. Siar retries 7 times over about 45 hours, signed by default [sourced in
    `competitors.md` §2b; code].
- **Pages:**
  - **`/how-publishing-works`** (N1): the canonical page for the idea.
  - **`/use-cases/social-media-webhooks`** (C16): holds the cross-vendor webhook table.
  - **`/guides/idempotent-social-media-posting`** (C24): states plainly that Siar has no client key on create, and
    that resending a create call makes a second post.
  - **`/network-changes`** (N2): a dated log.
  - **`/compare/failure-handling`** (N3): later, in W3.
- **Kills it:**
  - Claiming the most events (Zernio lists 158).
  - Any delivery rate.
  - "Guaranteed".

### 7. Dashboard-tool API comparisons

- **Why it wins:** these are the thinnest comparison fields, with 1–6 rival pages each [measured, `alternatives-vs.md`].
- **The gaps quoted from the tools' own docs** (all sourced in `competitors.md` §5.9–5.10):
  - Sprout: publishing "currently only supports posts in Draft status", from $399 a seat.
  - Publer: no connect API, and the API only on Business.
  - Metricool: the API from Advanced, $10 per X account, no outbound webhooks.
  - Hootsuite: per seat, no connect API, unsigned webhooks.
- **Order:**
  - W1: `/compare/hootsuite-api`, `/compare/metricool-api`, `/compare/publer-api`.
  - W2: `/compare/sprout-social-api`.
- **Kills it:** the stale Hootsuite line (row 1); comparing app to app instead of API to API.

### 8. YouTube reopening

- **Why it matters:** after Google's 2026-11-02 change, one public upload on production may move YouTube from "private
  only" to open. That makes 10 open networks and the first video-capable one. Every page that ranks for "youtube api
  upload private" predates the change [sourced + inferred].
- **Pages:** C97 and C98 now (they explain the change and Siar's own audit). C99 Shorts and C100 how-to-upload after
  the test.
- **Check before marketing YouTube widely:** all customers share Siar's one Google project quota until the quota
  extension is granted (submitted 2026-10-15) [doc]. Upload cost: about 100 units since 2025-12-04 [sourced].
- **Kills it:** changing any status line before a recorded public upload.

### 9. Agencies at one price (global and Malaysia)

- **Why it wins:**
  - **In Malaysia:** Pro is 10 brands for RM99. Zoho Social Agency is RM920–1,280 for 10 clients (teardown, Malaysian
    browser), Synova Business RM799, MarketOS Pro RM1,499 for 5 workspaces. Duta is RM99 with no brands at all
    [sourced in `my-sea-schedulers.md`, `strategy-malaysia-agency.md` §3].
  - **Elsewhere:** 10 brands cost $49.
- **Pages:**
  - `/for-agencies` (M1), which also answers the API intent of C17;
  - `/malaysia` (C115);
  - `/compare/zoho-social`, `/compare/duta`, `/compare/meta-business-suite`;
  - `/guides/social-media-management-cost-malaysia` (C116).
- **Off-site matters more than ranking here** (section 7).
- **Must concede:**
  - Only one account per network per brand.
  - No client logins, approvals or report export.
  - TikTok and LinkedIn company pages are not open.
  - The dashboard is English only.
- **Kills it:** "unlimited clients" below Business; "first" or "only".

### 10. Per-profile and per-account API switchers

- **Why it wins:** this segment ranks first in `market.md` §3. 100 Ayrshare profiles cost $1,228 by its own
  calculator; Siar Business is $149.
- **Directories first:** Google's top 5 for "ayrshare alternatives" is AlternativeTo, Capterra, GetApp and one vendor
  blog [measured once, AV1]. So directory listings carry W1 and the pages follow in W2:
  - `/compare/ayrshare`;
  - `/compare/zernio` ("formerly Late" once in the intro);
  - `/compare/upload-post`.
- **Kills it:** an X row before the X terms are read.

### 11. Open-network depth

- **Why it wins:** demand is low and so is competition, and the buyer is Siar's: a developer with a script.
- **Pages:**
  - **Threads, Bluesky, Mastodon, Discord and Slack:** the hub upgrades and how-tos;
  - `/guides/post-to-bluesky-mastodon-threads-api` (C23, prompt p010);
  - `/guides/post-release-notes-from-ci` (C25, p049);
  - `/guides/n8n-threads-posting` (C32): no n8n Threads node exists;
  - `/use-cases/link-in-bio-api` (C18): no API vendor has the page.
- **Kills it:** calling any of these networks rare. bundle.social, Upload-Post, Postiz and PostWire list Discord, Slack
  and Mastodon [sourced].

### 12. The BM test set

- **Why it is in the plan:**
  - Real mixed BM-English how-to demand ("cara schedule post" AC-my 10; "cara buat link bio" 10) with no tool vendor
    attached [measured by sibling].
  - Rivals' BM is formal or machine-translated.
- **Why it is W2 and not W1:**
  - It funnels readers to an English dashboard.
  - Its buyers are mostly Starter-sized.
  - Fakhrul must write or edit the final BM himself.
  - The kill-rule clock should start once GSC can measure it.
- **Kill rule:** no impressions within 8–12 weeks of indexing drops the set. Also count sign-ups whose first page was
  under `/ms/`.

### Gated doors

- **bundle.social (parked):**
  - **Pages:** `/migrate/bundle-social` and `/compare/bundle-social`.
  - **Wording ceiling:** "Siar speaks the bundle.social v1 API as of October 2026; most apps switch by changing the base
    URL and reconnecting accounts."
  - **Before the pages ship:** close the 3 missing operations (`/misc/tiktok/locations`, `/misc/tiktok/post-settings`,
    `/organization/usage/messages`) and decide on the `teams` field change of 2026-11-15.
- **DM beta:** opens `/use-cases/comment-to-dm`, `/compare/manychat`, `/ms/cara-auto-reply-instagram` and the "Comment
  HARGA" ads.
- **npm, ideally with a remote MCP endpoint:**
  - **What it opens:** `/social-media-mcp-server`, `/mcp/*`, registry listings, an n8n node, Show HN.
  - **The field:** 49 "social" servers are already in the official registry, most of them hosted [measured by the
    developer proposal].
- **TikTok approval:** opens the TikTok how-tos and the Malaysian seller segment.
- **X terms read:** opens `/x-api/pricing` and the X rows in comparisons.

---

## 4. Unfair advantages that are true today

Ranked by how hard they are to copy. "Ahead" means ahead on the vendors' own documents in our files, not proven
superiority.

| # | Advantage | Standing | Proof to show (artefacts, no invented numbers) |
|---|---|---|---|
| U1 | **bundle.social v1 wire compatibility**: 194 of 197 current operations | **Unique.** Parked | An operation diff of `/openapi.json` against bundle.social's swagger, generated at build time |
| U2 | **The bill stops growing**: unlimited brands and 100,000 posts for $149 / RM399 | **Ahead** above about 50 brands: PostWire Agency stops at 50 clients ($99) and Scale at 200 ($299); bundle.social Business $400; Zernio $1,218 at 1,000 accounts. **Tied** with Post for Me at about 20,000 posts [sourced] | The 500-brand scenario on `/guides/social-media-api-pricing` |
| U3 | **Agency unit price in ringgit**: 10 brands for RM99 | **Ahead** of every ringgit tool checked; Duta matches the price with no brands [sourced] | The sourced scenario table on `/for-agencies` and the MY cost guide |
| U4 | **Documented outcome webhooks**: `post.published` on success *and* failure, HMAC on by default, 7 retries over about 45 hours, delivery log, resend, managed from the API | **Ahead** of bundle.social, Upload-Post, Mixpost, Ayrshare, Postiz, Buffer and Sprout on documented retries. **Not** ahead of Zernio on events (158) or endpoints (50). PostWire states no retry policy [sourced; Zernio's retry window unverified] | The retry schedule and 16 event names rendered from `lib/events.ts`; a real payload |
| U5 | **Reference generated from the enforcing code**: 15 network pages, 147 error codes, limits and scopes | **Level or ahead** of bundle.social (14 + hub), Ayrshare (30), Zernio (12), PostPeer (10). Rivals' own pages contradict themselves on counts [measured] | "Generated from the adapter that validates your post" + `dateModified` + a link to the field in `/openapi.json` |
| U6 | **Accounted-for publishing**: validation at create (`400` with `issues`); each network target claimed once; crash reconciliation that checks the account before re-sending, or stops and says "could not be confirmed"; the network's own error, verbatim, with a fix and a retry verdict | **Different mechanism, not unique.** PostWire, Ayrshare, Upload-Post and Outstand offer client keys or duplicate checks [sourced]. Siar's guarantee needs no key but covers retries of the same post only | A real `400` example, a real relayed network error, the "could not be confirmed" state |
| U7 | **Candour as a feature**: a dated approval record and a status table that is exactly true (after Wave 0) | **Rare.** Zernio and Upload-Post sell Reddit while it returns 503 [measured in teardowns]. Shared in part with PostWire (dates) and Duta ("waiting for approval") | `/platforms` and `/platforms/approvals`, built from one constant |
| U8 | **Ringgit, FPX or DuitNow paid once a year, a Malaysian company, numbered receipts (SIAR-YYYY-NNNNN), a price lock** | **Unique among the API vendors checked.** No price lock was seen at bundle.social or Zernio [measured]; PostWire's pricing page shows none [unverified absence] | The trust line beside every price |
| U9 | **Link-in-bio API** with views and clicks per link per day | **Unique among the API vendors checked**; Linktree's developer page is an interest form [measured by sibling] | `/use-cases/link-in-bio-api` with the `bio` tags of the OpenAPI |
| U10 | **One post to many networks counts once**; drafts and retries of a failed post (up to 6) don't count again | **Ahead** of CrosspostAPI (each platform counts) and Outstand (each delivery counts, failed ones too) [sourced] | The "How quotas work" block on `/pricing` |
| U11 | **API on every plan, Free included; 100 requests a second per key and endpoint** | **Ahead** of Publer, Metricool and Sprout (API on upper tiers) and Postiz (about 100 create-post requests an hour) [sourced] | `/docs/rate-limits` + plan table |

**Things that look like advantages but are not:**
- **Per-organization billing as unique.** PostWire, bundle.social, SocialAPI.ai and Postproxy share the model.
- **"Unlimited accounts".** There is one live account per network per brand [code: `schema.prisma` line 4], and
  bundle.social's paid plans allow unlimited teams.
- **The free tier.** Siar's is one-time. Zernio, Buffer, Upload-Post, PostWire, WoopSocial and bundle.social recur.
- **Network count.** Siar publishes to 9; rivals list 12–30.
- **SDK, CLI, MCP.** None is on npm (404).
- **Discord, Slack and Mastodon as rare.** Four or more rivals list all three.
- **"Built in Malaysia".** Duta says "first".
- **X pass-through.** It stays out until X's Developer Agreement III.A(e) "service bureau" clause is read
  [sourced: https://docs.x.com/developer-terms/agreement, via the developer proposal].

---

## 5. Page architecture

**Status legend:**
- **LIVE**: in the sitemap today.
- **LIVE-FIX**: the copy has untrue lines that must change.
- **LIVE-RETITLE**: the title or lead changes.
- **NEW**: does not exist yet.
- **HOLD**: written now, published when the gate clears.
- **PARKED**: owner decision.

**Waves (content order by how fast a page can win, not product phasing; Fakhrul builds the product whole):**
- **W0:** days, before any new page.
- **W1:** weeks 1–4.
- **W2:** weeks 5–12.
- **W3:** months 4–12.

### 5.0 Rules for every page

1. **Answer first.** The first 40–60 words answer the page's question and name Siar with its category ("Siar, a
   unified social media API"), never "it".
2. **Status from one constant.** Every page that mentions a network shows that network's status from a single constant
   (not the health endpoint). A change in `docs/approvals` updates every page at the next build.
3. **Sourced rival facts.** Every competitor fact links the vendor's own page with "checked <date>" and is re-fetched
   within 7 days of publishing. Rival facts live in one data file (value, URL, checked date per cell). The build warns
   when a cell is older than 30 days.
4. **Visible dates.** "Updated <date>" on the page, the same date in JSON-LD; "Checked <date>" next to network facts.
5. **Schema only for what is visible.** FAQPage only for Q&A on the page; no AggregateRating or Review schema; one
   BreadcrumbList per nested page.
6. **The name always travels with its category.** Never "Siar" alone in a title. Brand and money pages say "Siar
   social media API" or "Siar (siaran.my)". Deep reference pages may end in "| Siar" when the title already contains
   a network name and "API". The reason: SiAR, a Spanish irrigation API, and siar.my, a Malaysian film service, share
   the name [measured, `current-site.md` §4].
7. **Copy follows `messaging.md`.** That covers the never-claim list, the status wording and the page-furniture rules
   (no numbered eyebrows, stat rows, mono-caps labels, or arrows and chips everywhere).

### 5.1 Wave 0: make the live site true (existing pages and fact surfaces)

| # | Fix | Where | Source |
|---|---|---|---|
| 0.1 | Verify Google Search Console and Bing Webmaster Tools (DNS TXT), submit `sitemap-index.xml`, turn on the BWT AI Performance report, request indexing for `/`, `/pricing`, `/platforms` | Owner | `geo/owner-todo.md` |
| 0.2 | One network-status constant (Open / Opening after approval / Not open + date + reason), rendered as a component on `/platforms`, every hub, guides, compares, `llms.txt`, `pricing.md` and the FAQ JSON-LD | `lib/networks.ts` + new component | siar-truth §0, §6 items 16–20 |
| 0.3 | Home hero request/response: live networks only, no millisecond timings, labelled "Example" | `home/ApiPanel.astro` | siar-truth §6.1 |
| 0.4 | Home "Live" event feed: rename to "Example events"; live networks only; no made-up handle | `home/EventLog.astro` | §6.2 |
| 0.5 | "One request. 15 networks." → "Built for 15 networks", plus the open list | home, `/features`, `/platforms`, meta descriptions, GitHub description | §6.3, 15, 16 |
| 0.6 | Flow step 03 ("Pinterest a board") and step 05 ("DMs") | `home/Flow.astro` lines 13, 15 | §6.4–5 |
| 0.7 | Remove `npx -y @siar/mcp` and every install command until npm | home, `/docs/sdk-cli-mcp`, `lib/snippets.ts` | §6.6 |
| 0.8 | "First post in five minutes" → "Your first post is one request away." | home | §6.7 |
| 0.9 | Calculator server-rendered default: compute it with the plan function, or default to 8 brands × 5 networks on Pro | `home/PriceCalc.astro` lines 10–24 | §6.8 |
| 0.10 | Home FAQ (and its JSON-LD): open list first, then "opening after approval", and "for the networks that are open today" | `index.astro` | §6.9–10 |
| 0.11 | `/features`: no "DMs from every connected network", no "in your client's language", no "company pages, locations", no Google Business tile, no TikTok alt text | `features.astro` 17, 19, 25 | §6.12–14 |
| 0.12 | Network pages: LinkedIn company-page claim removed (`networks.ts` line 28); TikTok comment claims removed and the 150 vs 1,200 comment-length conflict fixed; YouTube status per section 2 row 7; status lines on Pinterest, Reddit, Snapchat and GBP | `lib/networks.ts`, adapters | §6.17–20 |
| 0.13 | Pricing hero and lead: unit plus caps, no "across all 15 networks", no bare "Every account included"; Free tagline "Try Siar" instead of "Try every network"; plan cards without "All networks" and "SDK, CLI, MCP" until npm | `pricing.astro` line 34, `plans.ts` | §6.21–23 + row 9 |
| 0.14 | DM line: replace "opening after Meta approval" with the beta wording; DM gate error "Upgrade to Starter or higher" | `INBOX_NOTE`, `Billing.vue` 303, `messaging-shared.ts` 35–36 | §6.24, 28 |
| 0.15 | `llms.txt`: canonical paragraph first; status split; "all ${N} networks" removed; a Malaysia Q&A that names Duta, Zoho Social, PostLa, Synova and MarketOS factually with dates, never "first" | `llms.txt.ts` line 34 | Row 8; MY0.4 |
| 0.16 | `/pricing.md` served as `text/markdown; charset=utf-8`; same fixes as the pricing page | `pricing.md.ts` + nginx | `current-site.md` §9 |
| 0.17 | Changelog: add Starter; "built for 15 networks"; tooling "not on npm yet" | `changelog.mdx` | §6.25–26 |
| 0.18 | Dashboard connect list: show TikTok and Pinterest as their real status, not "ready" | `Accounts.vue` line 256 | §6.27 |
| 0.19 | Split headline spans: add a real space or `<br>` (42 pages, including "Your first post isone request away.") | `PageHero` and the marketing heroes | `current-site.md` §2 |
| 0.20 | `X-Robots-Tag: noindex` on app.siaran.my; a real `robots.txt` on app. and api.; 301 for trailing-slash and `/index.html` variants | nginx | §4, §9 |
| 0.21 | Webhook event description for `post.published` (row 10); "retried with backoff for a day" → "for about 45 hours" | `lib/events.ts` 25, `index.astro` 40 | Row 10; §6.29 |
| 0.22 | Regenerate the stale internal facts: `docs/geo/facts.md` (263 → 270 operations, OpenAPI 3.0.2, status split) and the README badges | docs | siar-truth §7 |
| 0.23 | Cloudflare Email Obfuscation off (or `<!--email_off-->`); HSTS | Owner | `geo/owner-todo.md` |
| 0.24 | IndexNow after every site deploy (`scripts/indexnow.mjs`) | Deploy | `geo/plan.md` |

### 5.2 Core and positioning pages

| Slug | Status | Cluster | Purpose and the line it carries | Wave |
|---|---|---|---|---|
| `/` | LIVE-FIX, then RETITLE | C01 | Entity page; owns "unified social media API". Title "Unified social media API, every post accounted for \| Siar". The H1 stays "Write it once. Siar it everywhere." The lead is the canonical paragraph (`messaging.md` §1). Under the hero: the three pillars, each linking to its proof page. Replace the fake feed with one labelled example of a post's life: a `400` with `issues`, a relayed network error, the webhook payload | W0, W1 |
| `/pricing` | LIVE-FIX | C06 | First line: the unit and the caps. Trust line beside the price. H2s: "Is there a free plan?"; "Per organization, not per account"; "One post counts once; drafts and retries don't"; "Your price never goes up while you stay subscribed"; "Pay in ringgit: card monthly, FPX or DuitNow yearly". No competitor names | W0, W1 |
| `/platforms` | LIVE-FIX + RETITLE | C03 | The status table: per network, open / waiting / not open, since when, why, what you can do today. Title "Social media API networks: what is open today \| Siar". The most linked page on the site | W0 |
| `/features` | LIVE-FIX + RETITLE | C02 | Dashboard buyer. Title "Social media scheduler and inbox, built on the same API \| Siar". The post timeline shows each network's outcome and error | W0, W1 |
| `/about` | LIVE-RETITLE | C07 | Company page plus a **generated facts block** (replaces the proposed `/facts`): operator, SSM, address, contact line, live since 2026-10-12, approval dates, open networks, prices in USD and MYR, the canonical paragraph. Title "About Siar and FF Dev Studio" (the old title competes with home) | W1 |
| `/how-publishing-works` | NEW | N1 | **The canonical page for the idea.** One H2 per mechanism with a real-shaped example; anchors `#checked`, `#sent-once`, `#errors`, `#webhooks`, `#accounts`, `#status`. FAQ phrased as prompts: "What happens if a post fails on one network?", "How do I avoid double posting when I retry?", "How do I know a post was published?", "What happens when a token expires?", "Which networks are open today?" | W1 |
| `/use-cases` | LIVE-RETITLE | C08 | "What you can build with a social media API" | W1 |
| `/changelog` | LIVE-FIX | — | 0.17 | W0 |
| `/docs` and docs guides | LIVE-RETITLE | — | Section 5.11 | W1 |
| `/llms.txt`, `/pricing.md`, `/openapi.json` | LIVE-FIX | — | 0.15, 0.16; the operation count is generated, never typed | W0 |

### 5.3 Proof hubs

| Slug | Status | Cluster | Purpose | Wave | Gate |
|---|---|---|---|---|---|
| `/errors` | NEW | C114 | All 147 codes by network, with anchors and a client-side filter by network and by retry verdict (`retryable` / `non_retryable` / `unknown`). Title "Social media API error codes, by network \| Siar" (must not echo `/docs/errors`) | W1 | — |
| `/platforms/approvals` | NEW | C04 | One dated row per network: applied, decided, outcome, what the network asked for, what it means for customers. From `docs/approvals/`. Links each gate guide | W1 | TikTok row: "audit not passed yet; sandbox only" unless Fakhrul says more |
| `/network-changes` | NEW | N2 | A dated log of network API changes, newest first, 80–150 words each, every entry sourced to the network's own page. Hubs show their latest 3 entries. RSS and JSON feeds. Seed: LinkedIn 202511 sunset (2026-11-16); YouTube private-only rule lifted (2026-11-02) and Shorts thumbnails (2026-11-03); Slack `conversations.history` limit for non-Marketplace apps (2025-05-29) | W1, then weekly | — |
| `/platforms/limits` | NEW | C05 | One generated table: daily caps by plan, text and media limits, the network's own rate limits (sourced), Siar's rate limits | W2 | — |
| `/compare` | NEW | C46 | Index plus one dated summary table (unit, entry price, open networks, MCP, webhooks, connect) with a "where they win" column. Rows, not pages, for PostWire, PostPeer, Publora, CrosspostAPI, Postproxy, Post for Me, SocialAPI.ai and WoopSocial | W1, with the first compare page | Comparison go |
| `/compare/failure-handling` | NEW | N3 | "What happens when a post fails: social media APIs compared (checked <date>)". Columns: validation before send; duplicate protection (key or automatic); error passthrough; webhook signing; documented retry window; outcome event on failure; log or resend; dated approvals. Only vendors already sourced in `competitors.md` §2b plus PostWire. Says where rivals win (Zernio events, PostWire keys, Ayrshare Validation API, Upload-Post media conversion) | W3 | Go + PostWire teardown + every cell re-checked |

### 5.4 Network hubs and topic pages

All 15 hubs are LIVE. Every hub gets:
- the W0 status line;
- a retitle from the head term to the posting form (keyword map §F);
- the opening answer "How to post to <Net> via API" (curl + response);
- a limits H2, a scopes H2, and a "<Net> MCP" H2 with no install line;
- links per section 6.

Open networks:

| Network | Hub (status, retitle) | Topic pages: slug → cluster → wave |
|---|---|---|
| Instagram | `/instagram-api`: open (professional accounts, Facebook Login or Instagram Login). "Instagram posting API: reels, stories and carousels" (C64) | `/publishing-limit` C68 W2 (first) · `/how-to-post` C65 W2 · `/reels` C66 W2 · `/stories` C67 W2 · `/comments` C70 W2 · `/insights` C71 W2 · `/access-token` N4 W2 · `/instagram-login-vs-facebook-login` C69 W3 · `/dm` C73 HOLD (DM beta) |
| Facebook | `/facebook-api`: open (Pages only). "Facebook Page posting API" (C74) | `/meta-app-review` C76 **W1** · `/page-access-token` C77 W2 · `/post-to-page` C75 W2 · `/comments` C78 W2 · `/reels` C79 W3 · `/insights` C80 W3 |
| Threads | `/threads-api`: open. "Threads posting API" (C82); limits H2 from Meta's page (250 posts, 1,000 replies, 100 deletes per 24 h, sourced via PN; re-check) | `/how-to-post` C83 W1 |
| X | `/x-api`: open, from a prepaid credit at X's own USD prices. "X (Twitter) posting API" (C85) | `/how-to-post` C86 W2 · `/pricing` C87 HOLD (X terms) |
| LinkedIn | `/linkedin-api`: profiles open; company pages "after LinkedIn grants page access". "LinkedIn profile posting API" (C89) | `/community-management-api` C91 **W1** · `/how-to-post` C90 W2 |
| Bluesky | `/bluesky-api`: open. "Bluesky posting and scheduling API" (C106) | `/how-to-post` C107 W1 |
| Mastodon | `/mastodon-api`: open, any server (C109) | Hub only; fill or noindex `/mastodon-api/errors` |
| Discord | `/discord-api`: open, bot with a per-brand name and avatar; no comment import | `/schedule-messages` C110 W2 |
| Slack | `/slack-api`: open, custom bot name; slow comment import (1 request a minute for non-Marketplace apps) | `/rate-limits` C111 W1 |

Not open:

| Network | Hub framing | Topic pages |
|---|---|---|
| YouTube | `/youtube-api`: "connect and upload now; public uploads not yet confirmed" (row 7) | `/quota` C97 **W1** · `/audit` C98 **W1** · `/comments` C101 W3 · `/shorts` C99 HOLD → after the test · `/how-to-upload` C100 HOLD → after the test |
| TikTok | `/tiktok-api`: guide framing, "built, opening after TikTok approves Siar"; no comment claims | `/how-to-post` C96 W3 (reference only) · `/audit` C94 HOLD (Fakhrul's call) |
| Pinterest | `/pinterest-api`: "connect today; publishing Pins opens after Standard access" | `/access` C103 **W1** |
| Google Business Profile | `/google-business-profile-api`: "built, not open yet" | `/access` C113 W3 (reference only) |
| Reddit, Snapchat | Status line only, "built, not open yet" | None |

### 5.5 Error pages

All 15 `/<net>-api/errors` pages are LIVE-FIX, W1, with the template changes in strike 2.
- **LinkedIn first:** the 426 section by 2026-11-16.
- **Then the codes engines are asked about:** X 402/403, Instagram 2207042, TikTok `spam_risk_too_many_posts`
  (reference), Bluesky `ExpiredToken`.
- **No URL per error code.** 147 one-code pages would be thin, near-duplicate pages; anchors do the job.

### 5.6 Use cases

| Slug | Status | Cluster | Purpose | Wave | Gate |
|---|---|---|---|---|---|
| `/use-cases/multi-tenant-social-media-api` | LIVE-RETITLE | C11 | **The SaaS-builder landing.** "Social media API for SaaS: multi-tenant by design." Lead: your customers' posts accounted for; a bill that stops growing (500-brand scenario); a brand per customer; branded connect; one key | W1 | — |
| `/use-cases/hosted-connect-oauth` | LIVE-RETITLE | C12 | "Social media OAuth API: a branded connect link." Say "Powered by Siar", app.siaran.my and English only; never "white-label" | W1 | — |
| `/use-cases/social-media-webhooks` | LIVE (index + H2s) | C16 | Owns "social media webhooks API": the retry schedule, signature, outcome on failure, resend, and the cross-vendor webhook table | W1 | Go (table) |
| `/use-cases/social-media-comments-api` | LIVE (index + H2s) | C15 | Comments live on 8 networks; DMs "beta, on request" | W1 | — |
| `/use-cases/link-in-bio-api` | NEW | C18 | Full CRUD plus per-link daily analytics; "linktree api" H2 (Linktree's developer page is an interest form) | W1 | — |
| `/use-cases/social-media-posting-api` | LIVE (refresh) | C09 | "Validation before send" and "sent once" H2s | W2 | — |
| `/use-cases/social-media-scheduling-api` | LIVE (refresh) | C10 | "What happens at 9 a.m. if it fails" H2 | W2 | — |
| `/use-cases/social-media-analytics-api` | LIVE (index) | C14 | Paid plans only; no LinkedIn analytics claim | W2 | — |
| `/use-cases/social-media-api-for-ai-agents` | LIVE-FIX | C13 | "An agent needs to know whether its post went out": a REST call plus the webhook. No install lines until npm | W0 fix, W2 refresh | — |
| `/use-cases/social-media-inbox-api` | NEW | C19 | Comments live; Facebook and Instagram DMs in beta wording | W2 | — |
| `/use-cases/comment-to-dm` | HOLD | C20 / MY73 | "Comment HARGA, they get the price in a DM" for Facebook and Instagram (dashboard automation + API). Starter: 200 runs and 500 DMs per account | — | DM beta open to every paid org |
| `/use-cases/video-publishing-api` | HOLD | C21 | Needs TikTok and public YouTube | — | Approvals |

C17 (`/use-cases/social-media-api-for-agencies`) is **merged into `/for-agencies`** as an H2 "Social media API for
agencies". Demand for both forms is tiny, so one strong page beats two thin ones. Split later only if GSC shows separate
API-intent impressions [inferred].

### 5.7 Guides

| Slug | Status | Cluster | Purpose | Wave |
|---|---|---|---|---|
| `/guides/social-media-api-pricing` | NEW | C26 | The pricing explainer: per profile vs per account vs per delivery vs per organization; dated scenarios at 1, 10, 50 and 500 brands, **leading with 500**; "where each vendor is cheaper"; "Do retries and failed posts cost you?" (Outstand bills failed deliveries; Siar counts a post once). The networks charge nothing except X (neutral, docs.x.com prices) | W1 |
| `/guides/idempotent-social-media-posting` | NEW | C24 | "How to stop duplicate posts when retrying a social media API." Key-based approaches (which rivals offer) vs Siar's automatic claim and reconciliation. **Must say:** Siar has no client idempotency key on create; resending a create call makes a second post, so check by your own reference first | W1 |
| `/guides/post-to-multiple-social-networks-api` | NEW | C22 | One request, many networks; per-network overrides and outcomes; status for networks that are not open | W1 |
| `/guides/post-to-bluesky-mastodon-threads-api` | NEW | C23 | p010 | W1 |
| `/guides/post-release-notes-from-ci` | NEW | C25 | GitHub Actions / GitLab CI step to Slack, Discord, a LinkedIn profile and X with plain `curl`; exit codes on failure (p049) | W1 |
| `/guides/n8n-threads-posting` | NEW | C32 | HTTP Request node recipe plus exportable workflow JSON; branch on the failure verdict | W1 |
| `/guides/social-media-api-integration` | NEW | C27 | Build vs buy, using Siar's own approval record as the evidence of cost; "hosted, not open source" H2 | W2 |
| `/guides/what-is-a-unified-social-media-api` | NEW | C28 | Definition + unified vs native table; H2 "What a unified API should do when a network says no" | W2 |
| `/guides/n8n-social-media-posting`, `/guides/n8n-instagram-posting` | NEW | C30, C31 | Recipes; no n8n node until npm | W2 |
| `/guides/ai-agent-linkedin-posting` | NEW | C34 | Profiles only; REST from an agent | W2 |
| `/guides/social-media-management-cost-malaysia` | NEW | C116 | Section 5.9 | W2 |
| `/guides/meta-business-suite-scheduling` | NEW | C119 | Section 5.9 | W2 |
| `/guides/why-scheduled-posts-fail` | NEW | N5 | Dashboard-buyer pain ("scheduled post not posted" returns 7 completions, measured by sibling) mapped to causes (token, media, limit, permission) and to the error pages | W3 |
| `/guides/best-social-media-apis` | NEW | C29 | Stated method, sources per row, failure-handling columns, **does not rank Siar first** | W3 (last) |
| `/guides/make-social-media-posting` | NEW | C33 | Make.com recipes | W3 |
| `/guides/post-to-multiple-social-media-accounts-at-once` | NEW | C39 | Consumer head; long-term | W3 |
| `/guides/schedule-instagram-posts`, `/guides/schedule-facebook-posts`, `/guides/auto-post-facebook-instagram` | NEW | C117, C118, C120 | English twins of the BM pages; **only if the BM test survives its kill rule** | W3 |

**Cut from the keyword map:**
- **C35, multiple clients:** an H2 on `/for-agencies` instead.
- **C36, auto-post new products:** no Shopify app, AC 0–2.
- **C37, Python:** the Python tab in every docs guide covers it.
- **C38, build a scheduler:** demand drifts to content calendars.
- **C40, scheduler pricing:** an H2 in C26 until GSC shows its own demand.

### 5.8 Compare and migrate

Template for every page:
- **H1:** "<Rival> alternative: <one honest line>". One URL serves both "alternative" and "vs" searches, so there are
  no separate `/alternatives/*` URLs.
- **First screen:** a 6-row table (unit, entry price, price in the dated scenario, open networks, webhooks, connect).
  Every rival cell is linked and dated.
- **High on the page:** "Where <Rival> is the better choice".
- **Where it helps:** "Moving your code".
- **FAQ:** only with visible Q&A.

| Slug | Status | Cluster | Lead (true) | Must concede | Wave |
|---|---|---|---|---|---|
| `/compare/buffer-api` | NEW | C50 | Customers connect without Buffer accounts; REST + OpenAPI; signed webhooks; comments; the shutdown dates | Free plan, hosted MCP, TikTok/YouTube/Pinterest/LinkedIn Pages; **no REST compatibility** | **W1, before 2026-12-09** |
| `/compare/hootsuite-api` | NEW | C51 | Per organization vs per seat ($99+ per user); a connect link for your customers; signed webhooks | Perch **publishes** (row 1); listening, approvals, enterprise | W1 |
| `/compare/metricool-api` | NEW | C53 | API on every plan vs Advanced; webhooks; connect for your customers; no $10 per X account | Free hosted MCP on every plan; analytics depth; networks | W1 |
| `/compare/publer-api` | NEW | C54 | API on every plan; connect API; webhooks | Publer's API is $10 for one account vs Siar $19 | W1 |
| `/compare/sprout-social-api` | NEW | C52 | Publishes vs "Draft status" only; every plan vs Advanced $399–499 a seat (re-check) | Analytics, listening, enterprise | W2 |
| `/compare/ayrshare` | NEW | C47 | Per business vs per profile ($19/$49/$149 vs $149/$299/$599); 20 free posts to try; Discord, Slack, Mastodon; HMAC by default, longer retries; field map (profiles → brands) | TikTok, YouTube, Pinterest, LinkedIn Pages, GBP live; hosted MCP; unlimited posts; **no X row** | W2 (directories in W1) |
| `/compare/zernio` | NEW | C48 | Per organization vs per account at 40, 100 and 1,000 accounts; price lock; Mastodon | Free for 2 accounts; unlimited posts; networks; SDKs; hosted MCP; events | W2 |
| `/compare/upload-post` | NEW | C49 | Retried signed webhooks vs one attempt; verbatim errors vs flags inside a `200`; cheaper above 75 brands | Cheaper for 2–75 clients; 22 networks; media processing; recurring free tier | W2 |
| `/compare/outstand` | NEW | C57 | One post counts once vs per delivery (failed ones too); dashboard + connect link | Cheaper below about 7,300 deliveries a month; networks; hosted MCP | W3 |
| `/compare/postiz` | NEW | C56 | 100 requests a second vs about 100 create-post requests an hour; comments API; signed webhooks | Open source, self-host, 30+ networks | W3 |
| `/compare/mixpost` | NEW | C58 | An API to build on vs an app to install | "If you must own the server, Mixpost is the better buy" | W3 |
| `/compare/blotato` | NEW | C55 | Connect for your customers; API on Free; never-post-twice | Hosted MCP; content machine | W3 |
| `/compare/zoho-social` | NEW | C62 | 10 brands RM99 vs Agency RM920–1,280 (Malaysian browser read; re-check by hand) | Zoho's channels per brand, listening and approvals depth, maturity; Starter vs Standard is close (RM390 vs RM480 a year) | W2 |
| `/compare/duta` | NEW | M2 | RM39 entry; 20 free posts to try with no card; comments, analytics, brands, webhooks; public API docs and OpenAPI file | Duta launched first; Telegram; hosted MCP; a public API (its own claim); channels connect "as many times as you like"; no post cap except X. Respectful tone | W2 |
| `/compare/meta-business-suite` | NEW | C61 | "Free for Facebook and Instagram. Use Siar when the same post also goes to Threads, X, LinkedIn and more, or when you run several brands." | Free, native, Meta's own | W2 |
| `/compare/postwire` | HOLD | N6 | Above 50 brands; Threads; documented webhook retries; public error reference; ringgit | Cheaper at 1–50 brands; TikTok and YouTube live; hosted MCP in Claude's directory; client idempotency keys; dated approvals | After a full teardown and any sign of brand demand |
| `/compare/manychat` | HOLD | C63 | Ringgit, per account; RM39 includes 200 comment-to-DM runs per account | ManyChat's depth, channels | DM beta |
| `/compare/bundle-social` | PARKED | C59 | $49 vs $100 at 10,000 posts; $149 vs $400 at 100,000; a $19 tier; webhooks managed from the API; ringgit; price lock | 15 networks sold as live; unlimited teams on Pro (Siar Pro: 10 brands); scale proof; same 5-webhook cap | Naming decision |
| `/migrate/bundle-social` | PARKED | C60 | "Change the base URL, then reconnect accounts"; an operation diff generated from both specs; the 3 gaps listed until closed | Tokens never move between vendors | Naming decision → order 1 |

No own pages for PostPeer, Publora, CrosspostAPI, Postproxy, Post for Me, SocialAPI.ai or WoopSocial. Brand demand is
very low (AV66–67), so each is a row on `/compare`. Promote a row to a page when GSC shows brand impressions or an AI
prompt pairs it with Siar.

### 5.9 Malaysia (English) and the BM test

| Slug | Status | Cluster | Purpose | Wave | Gate |
|---|---|---|---|---|---|
| `/for-agencies` | NEW | M1 (+ C17, C35 as H2s) | **The agency conversion page, Malaysia and abroad** (ringgit for MY, USD elsewhere). H1 "One login for every client." Line: "10 brands for RM99 a month ($49 outside Malaysia)." Sections: a brand per client; branded connect link (no passwords); comments inbox; CSV month planning; a bio page per brand; analytics; "Social media API for agencies" H2 for agencies building their own portal. Sourced scenario table. FAQ answers "Can my client log in?" (not today), "Two Facebook Pages for one client?" (two brands), "Client reports?" (in the dashboard; no export today), "TikTok?" (opening after approval) | W1 | Accounts wording (default in section 10) |
| `/malaysia` | NEW | C115 | **The AI-answer page.** Title "Social media scheduler and API for Malaysia, priced in ringgit \| Siar". First 60 words: what Siar is, RM39/RM99/RM399, FPX or DuitNow yearly, FF DEV STUDIO with its SSM number, open networks. H2s: "Is there a Malaysian social media scheduling tool?" ("Yes, several", with an **alphabetical**, sourced, dated table: Duta, MarketOS, PostLa, Siar, Synova, Zoho Social); "Which networks work today"; "For freelancers and agencies"; "For developers in Malaysia"; "How you pay"; "What Siar does not do" | W1 (rival table the day the go is given) | Go for the table |
| `/guides/social-media-management-cost-malaysia` | NEW | C116 | **The link magnet.** Agency and freelancer ranges, each sourced to the agency's own page and labelled as its claim; what tools cost (ringgit table); what a tool replaces and what it doesn't. Never "replace your agency" | W2 | — |
| `/guides/meta-business-suite-scheduling` | NEW | C119 | Troubleshooting first ("not working", "time zone", "limit", "bulk"), with steps from Meta's help. Then "When to use a scheduler instead" (CSV bulk import is true) | W2 | — |
| `/ms/cara-schedule-post` | NEW | C121 | BM hub. One H2 per open network (X with its credit note, LinkedIn profiles only). TikTok and YouTube: one honest line, no how-to | W2 | BM go |
| `/ms/cara-schedule-post-instagram` | NEW | C122 | PC, laptop, phone; story, reels; "tidak muncul" troubleshooting; then Siar | W2 | BM go |
| `/ms/cara-schedule-post-facebook` | NEW | C123 | Pages only, said in the first paragraph | W2 | BM go |
| `/ms/cara-schedule-post-threads` | NEW | C124 | Threads is open; probably the fastest of the set [inferred] | W2 | BM go |
| `/ms/cara-auto-post-facebook-instagram` | NEW | C125 | Native cross-posting first; official API only; the groups line | W2 | BM go |
| `/ms/cara-buat-link-bio` | NEW | C126 | The native bio link, then Siar's bio page per brand; must not imply the bio page itself is in BM | W2 | BM go |
| `/ms/harga` | NEW | C127 | RM39 / RM99 / RM399; yearly by FPX or DuitNow; "20 post percuma untuk cuba"; price lock; trust line; agency-cost H2 linking to the English cost guide | W2 | BM go |
| `/ms/cara-auto-reply-instagram` | HOLD | MY79 | Native first, then automations | — | DM beta |
| `/ms/cara-schedule-post-tiktok`, `/guides/schedule-tiktok-posts` | HOLD | MY41, MY57 | The biggest BM how-to topic | — | TikTok approval + production keys |

BM rules:
- **Voice:** `lang="ms"`, colloquial mixed BM-English (`messaging.md` §7).
- **Honesty lines on every page:** the dashboard is in English; TikTok is not open yet; Pages and professional
  accounts only.
- **hreflang:** only between true equivalents, so none until the English twins (C117–C120) exist.
- **Not built:**
  - a translated home, network or docs page;
  - "best time to post" (Siar has no posting data of its own);
  - grant pages (Siar is not on MDEC's panel);
  - WhatsApp pages;
  - "auto post Facebook group" pages;
  - Singapore or Indonesia pages;
  - a self-ranked "best Malaysian tools" list.

### 5.10 MCP and agents (HOLD: npm publish, ideally with a streamable-HTTP endpoint)

| Slug | Cluster | Purpose |
|---|---|---|
| `/social-media-mcp-server` | C41 | First screen: the install command or remote URL, the 19 tools, which networks are open, API-key auth |
| `/mcp/instagram`, `/mcp/linkedin`, `/mcp/threads` | C42 | LinkedIn page says profiles only |
| `/guides/post-to-social-media-from-claude`, `/guides/claude-code-social-media`, `/guides/openai-agents-sdk-social-media` | C43–C45 | Client setup guides |

Until then:
- Each open-network hub carries a "<Net> MCP" H2 that describes the tools, with no install line.
- `/docs/sdk-cli-mcp` says "version 0.1.0, not yet on npm".

### 5.11 Docs changes (existing pages, W1)

- **Titles:** describe the topic, e.g. "Webhook signatures and retries · Siar API docs", "Connect accounts with a hosted
  link · Siar API docs", "<Tag> API reference · Siar". This separates them from the use cases.
- **Code tabs:** every guide gets curl, TypeScript (`fetch`, no SDK until npm) and Python (`requests`).
- **Markdown copies:** a `.md` twin of every docs guide and use case, linked with `rel="alternate" type="text/markdown"`.
- **Page weight:** `/docs/api/automation` (1.27 MB) is split by sub-tag or its schema depth capped.
- **Sidebar:** lists the reference tags; 25 tag pages are orphans today.
- **Postman:** a public collection generated from `/openapi.json`.

### 5.12 Programmatic pages: only where the data is real

| Build | Why it is useful |
|---|---|
| Network hubs + error pages (exist) | Generated from the code that enforces the rules: the data is the product |
| `/platforms/limits`: one generated table | One page, not 15 thin ones |
| `/network-changes`: one data file, anchored entries, latest 3 shown on hubs | Freshness with no thin URLs |
| `/errors`: one hub with per-code anchors | Covers 147 codes without 147 pages |
| Rival facts data file feeding `/compare` and compare pages | One re-check updates every page; stale cells are caught by the build |
| `.md` twins of docs and use cases | Coding agents read them; generated at no cost [inferred value] |

| Do not build | Why |
|---|---|
| A URL per error code | Thin near-duplicates |
| Network × capability matrices beyond the topic pages with demand | Doorway pattern |
| Network × MCP × client pages (Postiz runs 225) | Blocked and thin |
| "<tool> vs <tool>" pairs without Siar (Postiz runs 631) | Siar is in neither name |
| Glossaries (Publora 346, Hootsuite 274) | No authority gain for an API |
| Free tools for their own sake | Only where a page needs a calculator (pricing explainer, YouTube quota) |
| Translated network or docs pages | Dashboard is English; no demand measured |
| Country pages | No local prices outside Malaysia |

### 5.13 Page count

| | Existing pages touched | New pages |
|---|---|---|
| W0 | About 60 (home, pricing, platforms, features, changelog, 15 hubs, 15 error pages, use cases, docs, fact surfaces) | 0 |
| W1 | Retitles and upgrades above | 26 |
| W2 | — | 36 (7 of them the BM test) |
| W3 | — | 18 (3 conditional on the BM test) |
| HOLD | — | 19 |
| PARKED | — | 2 |

That is about 80 new pages over a year, plus about 60 fixed. bundle.social has 291 URLs and Postiz over 1,200 [measured].
Siar wins on depth and truth, not on count.

---

## 6. Internal linking map

```
                                   /   home: the ONLY target of the anchor "unified social media API"
                                   │
   ┌───────────┬──────────┬────────┼──────────────┬──────────────┬──────────────┬───────────┐
/platforms  /pricing  /how-publishing-works  /compare     /for-agencies   /malaysia      /docs
 │   │                  ▲  mechanism anchors   │  │           ▲   │         ▲   │          ▲
 │   ├─► /platforms/approvals                  │  │           │   └─────────┘   └─► /ms/*  │
 │   └─► /platforms/limits                     │  └─► /compare/failure-handling (W3)       │
 ▼                                             ▼                                           │
15 network hubs ──► /<net>-api/errors ──► /errors     API compare pages ──► /guides/social-media-api-pricing
   │  ├──► topic pages (how-to, limits, access, tokens)  MY compare pages ──► /guides/social-media-management-cost-malaysia
   │  ├──► latest 3 entries of /network-changes
   │  └──► posting + scheduling use cases ◄──► /docs guide + /docs/api/<tag>
   └──► matching BM how-to (no hreflang)

/ms/cara-schedule-post (BM hub) ◄──► each /ms/cara-* ──► /ms/harga ──► /pricing
/guides/meta-business-suite-scheduling ◄──► /compare/meta-business-suite ◄──► /ms/cara-schedule-post-facebook
```

**Rules, enforced in templates rather than by hand:**

1. **Category anchor.** The exact anchor "unified social media API" points only to `/`, once in each network hub's lead.
   `/about` drops the phrase from its title.
2. **Mechanism anchors.** Every library page has a "How Siar handles this" box, at most 3 lines. It links one anchor
   on `/how-publishing-works` (`#checked`, `#sent-once`, `#errors`, `#webhooks`, `#accounts`, `#status`), using the
   mechanism as the anchor text ("checked before it's sent").
3. **Up-links:**
   - error pages → `/errors` and the hub;
   - gate pages → `/platforms/approvals#<net>` and the hub;
   - limit content → `/platforms/limits#<net>`;
   - change entries → the affected page;
   - hubs show their latest 3 changes.
4. **Network hub template.** It links:
   - its errors page and topic pages;
   - `/platforms` (status anchor), `/platforms/limits#<net>` and `/platforms/approvals#<net>`;
   - the posting and scheduling use cases;
   - the BM how-to where one exists (BM anchor text, no hreflang).

   Anchors use the query wording ("Instagram API error codes", not "Errors").
5. **Error pages.**
   - Per-code anchors (`#code-190`).
   - Each code links its topic page where one exists (190 → `/facebook-api/page-access-token`).
   - `/docs/errors` for Siar's own envelope.
6. **Compare pages.**
   - Each links `/compare`, its pricing explainer (API compares → C26; Malaysian compares → C116), `/platforms`
     (status), and the webhook table on C16 (later `/compare/failure-handling`).
   - Compare pages never link each other in body copy, only through `/compare`.
   - `/pricing` never links a compare page (truth rule 12).
   - The two pricing explainers are the only pages that link all their compare pages in body copy.
7. **Use case ↔ docs.**
   - The use case links its docs guide and `/docs/api/<tag>` with a navigational anchor ("Webhooks API reference").
   - Docs link back with the commercial anchor ("social media webhooks API"). This settles the cannibalisation in
     `current-site.md` §8.
8. **Malaysia.**
   - Every Malaysian page links `/malaysia` once, and `/malaysia` links every Malaysian page.
   - Every price mention links `/pricing` (English) or `/ms/harga` (BM).
   - `/for-agencies` and `/malaysia` link each other.
9. **Footer (site-wide) adds:**
   - `/how-publishing-works`, `/errors`, `/platforms/approvals`;
   - `/compare` (after the go);
   - `/for-agencies` and "Malaysia" → `/malaysia`;
   - the four orphaned use cases (analytics, comments, webhooks, hosted connect).
10. **Minimum 3 contextual in-links** for every new page at launch. Hubs ship with their spokes.
11. **Never link held or parked pages.** No "coming soon" stubs indexed. No "post to <net>" anchor for a network that
    is not open.
12. **Breadcrumbs** on every nested page (Home › Networks › Instagram API › Errors), mirrored in BreadcrumbList.
13. **Anchor hygiene.** Descriptive anchors only; at most one exact-match anchor per target per page; never "click
    here".

---

## 7. Off-site and authority plan

Everything is done under the real name, with the affiliation disclosed. Nothing goes out before Wave 0 is live: a
listing that sends people to a page showing TikTok as "Posted" is a net loss. Ordered by expected effect per hour of
work [inferred].

| # | Action | What it carries | Target | Gate / owner |
|---|---|---|---|---|
| O1 | **Fix the fact surfaces:** GitHub repo description and README first lines (the canonical paragraph, "built for 15 networks" with the open list); ffdev.studio/projects/siar, which Copilot already cites [measured]; topics `social-media-api`, `openapi`, `webhooks`, `mcp-server` | The entity sentence | `/`, `/platforms` | Copy goes live: his go |
| O2 | **GSC + Bing Webmaster + IndexNow** (0.1, 0.24) | Indexing (43 of 89 URLs not in Google) | — | Fakhrul |
| O3 | **OpenAPI listings:** submit `/openapi.json` to APIs.guru; publish a public Postman collection [acceptance rules unverified] | Checkable artefact | `/docs/api` | His go |
| O4 | **Directories:** AlternativeTo, G2 ("Social Media APIs"), Capterra/GetApp, SourceForge; later Product Hunt. Alternative to Ayrshare, Zernio, Upload-Post and Buffer (API). Not bundle.social while parked. Location Malaysia, currency MYR where the form allows [unverified fields]. Description = canonical paragraph. No solicited ratings | They hold Google's top 5 for "ayrshare alternatives" [measured once, AV1] | `/`, then compares | Comparison go |
| O5 | **Roundup pitches**, only after Wave 0: Buffer, Blotato, Upload-Post (API and MCP lists), Zernio, PostPlanify, Ayrshare, Social Champ; the dev.to price comparison by PostWire's builder (CP 17) and CP 18. Send a five-line factual row (open networks, unit, entry price, webhooks, free tier, MCP "not yet published"), the `/pricing.md` link, and the failure-handling columns. Never ask to be ranked | Inclusion + new comparison criteria | `/pricing.md`, C16, later N3 | His go |
| O6 | **Open error catalogue** on GitHub: every code from the adapters as JSON + Markdown (verbatim message, category, retry verdict, fix, link to the error page), permissive licence | A dataset developers star, fork and link | `/errors` | His go |
| O7 | **First-hand write-ups** canonical on siaran.my, syndicated to dev.to/Hashnode with `rel=canonical`, posted on the FF Dev Studio LinkedIn: "Meta App Review: submitted 14 October, approved 27 October 2026"; "LinkedIn Community Management: denied, no reason given"; "Waiting on YouTube's audit"; TikTok only with his yes | Expertise + candour | C76, C91, C98, `/platforms/approvals` | His go per story |
| O8 | **Answers where the failure questions are asked:** Stack Overflow ("Permanent Page Access Token?" has 208k views), the n8n forum, network SDKs' GitHub Discussions. Answer first, disclose, link a Siar page only when it is the answer. A few a week. Never in a rival's issue tracker | Citations from the sources engines trust for troubleshooting | Library pages | Disclosure |
| O9 | **Malaysia:** (a) pitch the pages that answer "social media scheduler malaysia" (nineten.ai, planable.io/blog, shinjiru.com.my/blog, newnormz.com.my, neeko.my, flowdigital.my, justsimple.com.my, zenweb.my: Brave, measured once) and xwork.my's "AI marketing tools Malaysia 2026" (contact form) with a 3-line note; (b) Malaysian tech press with the Meta App Review story, never "first" or "partner" (Vulcan Post, Digital News Asia, SoyaCincau, Lowyat.NET, Digital Edge, e27, Tech in Asia; routes unverified); (c) real answers in freelancer and SME groups after reading each group's rules; (d) Siar's own socials posted through Siar in colloquial BM; (e) ask CHIP about partner features [unverified]; (f) the MDEC panel when a round opens | AI answers for MY prompts + local trust | `/malaysia`, `/for-agencies`, cost guide | His go and his accounts |
| O10 | **After npm:** official MCP registry under a namespace Siar controls; PulseMCP, Glama, Smithery, mcp.so, awesome-mcp-servers; an n8n community node + 3 gallery templates; with a remote endpoint, Claude's connector directory (PostWire is listed [sourced]) | The agent lane | C41–C45 | npm go |
| O11 | **Show HN**, only with npm live and a clean site; strongest with the bundle.social compatibility public | Developer reach | `/` | npm + G1 |
| O12 | **Network-changes syndication:** RSS/JSON feed; a short FF Dev Studio LinkedIn post per major change | Freshness | `/network-changes` | — |
| O13 | **Video:** 2–3 minutes, "what happens when a post fails", on mock networks: a `400` with `issues`, a relayed error, the delivery log. No network shown as "Posted" that is not open | The idea, shown | `/how-publishing-works` | His go |

**Not doing:**
- paid listicle placements or review swaps;
- self-ranked "best" lists that put Siar first;
- Wikipedia or Wikidata;
- astroturfing on Reddit or in groups, including fake buyer posts;
- posting in rivals' issue trackers;
- using FF's own brands as "customers" (if they post through Siar, say "FF's own brands, same owner").

---

## 8. AI-answer plan

**How the engines answer today** [inferred from `ai-answers.md`]:
- Commercial prompts ("best", "alternatives", "cheapest") come from about 20 vendor roundups. Siar is on 0 of the 18
  that were fetched.
- How-to and troubleshooting prompts come from reference pages. Siar has the pages; indexing is the blocker.
- Branded prompts come from whatever Siar's own surfaces say. Today they disagree with each other.

**Levers, in order:**

1. **One fact source.** The canonical entity paragraph (`messaging.md` §1) and the status line are generated from the
   same constants into `/`, `/about`, `/llms.txt`, `/pricing.md`, the home FAQ, the GitHub README, directory listings
   and pitches. Engines repeat what is consistent [inferred].
2. **Answer-first pages that name the entity.** "Siar, a unified social media API, …" in the first 60 words; visible
   dates; FAQ only where it is visible.
3. **Third-party mentions:** roundups (O5), directories (O4), GitHub (O1, O6), dev.to (O7), Malaysian pages (O9).
4. **Dated, first-hand content** engines can cite for "when" and "why" questions: `/platforms/approvals`,
   `/network-changes`, the 426 and YouTube pages.
5. **Bing first.** It feeds ChatGPT search and Copilot. So: IndexNow after each deploy, and the BWT AI Performance
   report to see the grounding queries.

**Prompt → page.** `keyword-map.md` §5b stands, with these changes:
- p006 (per organization) is answered honestly as shared, not unique.
- p017 (white label) has no honest page.
- p022 and p023 stay parked.
- p008 and p037 are blocked until npm.
- p015 waits for the YouTube test.
- p005 moves to `/for-agencies`.

**Prompt sets** (frozen once first run; never edit a set after its first run):

| Set | Prompts | Win condition |
|---|---|---|
| `prompts_v1.csv` (exists, 50) | Unchanged | Branded facts right (p031–p037) within 4–8 weeks of Wave 0; Siar named for p002, p010, p012, p016, p018, p019, p038–p042, p045, p049, p050 within 2–3 months |
| `prompts_v2` (positioning) | "what happens if a social media API post fails on one network"; "which social media API retries webhooks"; "social media API that prevents duplicate posts when retrying"; "social media API that returns the platform's own error message"; "social media API with signed webhooks"; "which social media APIs are approved for Instagram publishing"; "what changed in the LinkedIn API in November 2026"; "list of Instagram API error codes and fixes"; "Buffer API shutdown alternative for my app"; "Hootsuite API alternative where my customers connect their own accounts"; "cheapest social media API for 500 customer brands" | Siar named **and** a mechanism repeated ("retries webhooks", "returns the network's error") |
| `prompts_my_v1` (Malaysia) | "Is there a Malaysian social media scheduling tool?"; "Social media scheduler priced in ringgit"; "Cheapest way for a freelancer in Malaysia to manage 10 clients' social media"; "Zoho Social alternative Malaysia"; "Cara schedule post Instagram dan Facebook serentak"; "Social media API Malaysia"; "Social media tool for agencies in Malaysia that accepts FPX" | Siar named with the right price, in the same answer as Duta |

**Scoring per answer:**
- Is Siar named?
- Is the price right (unit included)?
- Is the network status right?
- Is a mechanism or pillar repeated?
- Is a siaran.my URL cited?
- Which rivals are named?

Run by hand every 4 weeks in ChatGPT, Perplexity, Gemini, Copilot and Google AI Mode, logged out, one fresh chat per
prompt. Ingest with the existing `ai_visibility.py --ingest-manual` flow (`geo/owner-todo.md`).

**Never, for AI visibility:**
- fake reviews or AggregateRating;
- FAQ schema for hidden Q&A;
- self-ranked lists;
- llms-full.txt as a "lever". The existing `llms.txt` stays because it is cheap and accurate, not because engines are
  known to use it (`geo/plan.md`).

---

## 9. Measurement

**Prerequisites (Wave 0):**
- GSC and Bing Webmaster verified, with sitemaps submitted.
- The wave-0 AI sheet filled (`docs/geo/visibility/manual-2026-10-13/manual.csv`).
- Without these, no kill rule below can run.

**Google Search Console.** Track by page group, using URL filters:
- `/errors` + `/*-api/errors`;
- gate and topic pages;
- `/compare/*`;
- `/guides/*`;
- `/malaysia`, `/for-agencies`, the MY cost guide (country filter = Malaysia);
- `/ms/*`;
- branded queries containing "siar". Watch that "siar" + "social media api" grows while the SiAR and siar.my
  collisions shrink.

Check coverage weekly for the first month (the 43 unindexed URLs first), then monthly.

**Bing Webmaster Tools:**
- impressions by page group;
- the AI Performance report (grounding queries that led ChatGPT or Copilot to cite siaran.my);
- IndexNow 200/202 on every deploy.

**AI answers:** the three prompt sets in section 8, every 4 weeks.

**Business:**
- sign-ups and Pro trials by first landing page;
- organizations whose billing country is MY;
- sign-ups whose first page was `/ms/*`.

This needs the first landing path and referrer stored at sign-up (small product item; no third-party analytics
needed) [inferred].

**Kill and fix rules:**
- **Error and gate pages:** no impressions 8 weeks after indexing → one rewrite of title and H2s, then merge into the
  hub.
- **BM set:** no impressions within 8–12 weeks of indexing → drop it. Impressions but no `/ms/` sign-ups after 12
  weeks → stop adding BM pages.
- **`/compare/duta`:** no AI citation and no impressions in 12 weeks → merge into `/malaysia`.
- **Any compare page:** a rival's price or feature changes → update within 7 days or take the page down. A stale
  rival fact is worse than no page.
- **Rows promoted to pages** (section 5.8): only on evidence.

---

## 10. Owner decisions, ranked by what they unlock

| # | Decision | Unlocks | Recommended default |
|---|---|---|---|
| 1 | **Approve and deploy Wave 0** | Everything; Copilot's wrong price; every comparison | Yes. Code changes are ready to make; the deploy is his call |
| 2 | **Comparison pages and directory listings, separated from the bundle.social question** | Strikes 3, 6, 7, 9, 10; `/malaysia` table; O4 | Go for every rival **except** bundle.social |
| 3 | **"Unlimited accounts" wording** | `/for-agencies`, C26, `/pricing` H2, every compare table | "No per-account fees. Each brand connects one account on every open network: Starter 1 brand, Pro 10, Business unlimited." Never "unlimited accounts" alone |
| 4 | **Adopt "Every post accounted for"** | Home title, `/how-publishing-works`, pitches | Yes, with the wording rules in `messaging.md` |
| 5 | **bundle.social naming** (with a legal read of naming a competitor and describing compatibility) | The single most valuable page; Show HN story | Unpark, with the wording ceiling in section 3 |
| 6 | **One public YouTube upload on production** (a live post: his yes) | YouTube status; C99, C100; video segment | Do it; record it |
| 7 | **Open the DM beta to every paid organization** | Comment-to-DM, ManyChat, BM auto-reply, SME ads | His product call |
| 8 | **npm publish (SDK, CLI, MCP) + a remote MCP endpoint** | Section 5.10, O10, O11 | His call; a remote endpoint is what turns listings into use |
| 9 | **Read X's Developer Agreement III.A(e)** | X rows, `/x-api/pricing` | Until read, X stays a capability line |
| 10 | **Publish first-hand gate stories** | O7, C91, C94 | Meta yes; LinkedIn yes (no reason was given, which is the story); TikTok his call |
| 11 | **BM test** (it reverses `geo/plan.md`'s "no BM version") | Section 5.9 | Run it in W2 with the kill rule; Fakhrul edits the BM |
| 12 | **TikTok resubmission** (films recorded by hand, full URL visible) | Malaysian sellers, creators | Product track, not content |
| 13 | **Open-source the error catalogue** (O6) | Links, stars | Yes |
| 14 | **Legal entity name in the trust line on price pages** (house style keeps FF to "Siar by FF Dev Studio" in footer and legal pages) | MY0.2 trust line | Allow it on price pages and `/about` only, as a billing fact |

---

## Sources

**Fetched in this pass, 2026-11-12:**
- https://postwire.io/ and https://postwire.io/pricing
- https://www.hootsuite.com/integrations/mcp
- https://buffer.com/resources/legacy-rest-api-retired/
- https://bundle.social/pricing.md ("Last updated: 2026-07-30")
- https://learn.microsoft.com/en-us/linkedin/marketing/versioning and https://learn.microsoft.com/en-us/linkedin/marketing/error-responses
- https://getduta.com/llms.txt
- https://developers.google.com/youtube/v3/revision_history

**Code read:**
- `apps/api/prisma/schema.prisma`
- `apps/api/src/engine/publisher.ts`, `apps/api/src/engine/webhooks.ts`
- `apps/api/src/modules/posts.ts`, `apps/api/src/modules/billing-core.ts`
- `apps/api/src/domain/plans.ts`
- `apps/site/src/lib/events.ts`, `apps/site/src/lib/plans.ts`, `apps/site/src/lib/networks.ts`, `apps/site/src/lib/usecases.ts`
- `apps/site/src/pages/llms.txt.ts`, `apps/site/src/pages/pricing.astro`, `apps/site/src/pages/refunds.mdx`
- `apps/site/src/components/Footer.astro`
- `packages/networks/src/adapters/linkedin.ts`, `packages/networks/src/adapters/youtube.ts`
- `packages/contract/openapi.json`
- `docs/approvals/README.md`, `meta.md`, `linkedin.md`

**Everything else** is cited to the sibling files with their own sources and dates:
- `docs/seo/competitors.md`, `docs/seo/keyword-map.md`, `docs/seo/market.md`
- `docs/seo/research/siar-truth.md`, `docs/seo/research/current-site.md`
- `docs/seo/research/strategy-*.md`
- `docs/seo/research/competitors/*.md`, `docs/seo/research/keywords/*.md`
- `docs/geo/*`

**Not done:**
- No WebSearch (budget spent), so no new ranking, autocomplete or People Also Ask data.
- No Zoho price re-check: Zoho renders prices by region.
- No PostWire docs read beyond its home and pricing pages.
