# Strategy: developer-first, win "social media API" from below

Checked 2026-11-12. One of three strategist briefs. Angle: Siar wins the global developer and SaaS-builder search
category by taking the narrow, specific, first-hand pages the big vendors leave thin. It does not try to take the head
term first. It builds on `docs/geo/*`, `docs/seo/competitors.md`, `keyword-map.md`, `market.md`, `research/siar-truth.md`
and `research/current-site.md`, and does not redo them. Cluster IDs (C01–C127) are the ones in `keyword-map.md`.

**Labels.** **[measured]**: seen in this pass or by a sibling sweep (named), on 2026-11-12. **[sourced]**: the vendor's own
page, with URL, checked 2026-11-12. **[third-party]**: someone else's page. **[code]** / **[doc]**: this checkout
(`/Users/fakhrul/Desktop/dev/Siar-seo-research`). **[inferred]**: my judgement. **[unverified]**: not checked.

**Limit of this pass.** The shared WebSearch budget (200 calls per turn) was already spent when I started; all three
search calls I tried were refused. I did not work around it. So **no search result page was measured in this pass**:
every "who ranks" statement below is a sibling's single measurement, or a list of pages that *target* the term. I did
fetch vendors' own pages directly (WebFetch, 11 fetches); those facts are new and labelled [sourced] or [measured].

---

## 0. The call, in eight lines

1. **Do not fight for "social media API" now.** It is owned by vendors with 300–3,000 URLs, npm downloads in the tens
   of thousands and a year of links. Take it last, with authority built from below [inferred, `competitors.md` §4].
2. **Strike where Siar is first-hand and rivals are second-hand:** error codes, network gates and quotas, webhook
   delivery semantics, the dated network status table, and migrations that have a deadline (Buffer REST, LinkedIn
   versions). Siar holds the code and the approval records; most rival pages paraphrase docs [inferred].
3. **The only uncopyable weapon is the bundle.social v1 wire compatibility** (194 of 197 current operations) [measured,
   siar-truth §4]. It is parked. Unparking it is the single highest-value decision on the developer side.
4. **The second weapon is price per business at 10+ brands**, but it is no longer rare: bundle.social, SocialAPI.ai,
   Postproxy and now **PostWire** (per business, $29 for 10 brands, unlimited posts, hosted MCP, Discord/Slack/Mastodon)
   sell the same unit [sourced, §2]. Lead with it in comparisons; never as "only" or "cheapest".
5. **The agent/MCP lane is closed until the packages ship.** 49 "social" servers already sit in the official MCP registry
   search, and hosted connectors are the norm [measured, §2]. A local stdio server that is not on npm cannot be ranked,
   listed or recommended.
6. **Clean the house first.** The live site over-claims in 29 places (siar-truth §6). A developer reads `/platforms`,
   then the home hero showing TikTok and Google Business as "Posted", and leaves. Every comparison page is a liability
   until those are fixed.
7. **Proof is artefacts, not numbers.** Siar may claim no customers, uptime or speed. It can show a public OpenAPI file,
   generated limit and error pages, the webhook event list, a dated approval log and a price list. Make those the
   most linkable pages on the site.
8. **Sequence content by winnability, not by importance:** time-boxed and first-hand pages first, then the "dashboard
   tool API" comparisons, then the per-profile API comparisons, then MCP, head terms last (§7).

---

## 1. What Siar can sell to a developer today (the box every page stays inside)

All from `research/siar-truth.md`; nothing here is new.

| Can say | Cannot say |
|---|---|
| Publish to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack today | "15 networks" without "built for"; any TikTok, Pinterest-publishing, LinkedIn-company-page, Reddit, Snapchat, GBP posting claim; YouTube public uploads |
| One REST API, **OpenAPI 3.0.2, 270 operations** at `/openapi.json` [live] | "OpenAPI 3.1", "263 operations" (the research brief's numbers are stale) |
| Facebook, Instagram, Threads through Siar's Meta app, which passed App Review on 2026-10-27 | "Meta partner", "skip app review" for any non-Meta network |
| 16 HMAC-signed webhook events, retried 7 times over about 45 hours, delivery log, resend, managed in the API | "retried for a day" (under-claim, fine); uptime or delivery-rate figures |
| Validation at create time (`400` with an `issues` array); each network target claimed once; verbatim network errors with a plain-English fix | "zero duplicates", any measured rate; client-side idempotency keys (see §5 note) |
| Branded connect link: your name, logo, colour; customers sign in themselves | "white-label", "your domain", "in your customer's language" |
| Per organization; unlimited social accounts on every plan; brands 1 / 10 / unlimited | the "unlimited accounts" line *alone* in any comparison table (one account per network per brand, decision pending) |
| 20 free posts to try (one-time, no card); Starter $19 / RM39; Pro $49 / RM99; Business $149 / RM399 | "free plan", "free API", bare "20 posts", "cheapest" |
| X passed through at X's own USD price from a prepaid credit | X as a selling point in comparisons until the X-terms read (§2.4) |
| TypeScript SDK, JSON CLI, MCP server with 19 tools, built from the same contract | any install command; "on npm"; "hosted MCP" |
| Rate limits 100/s, 500/10 s, 2,000/min per key and endpoint | |
| Link in bio with views and clicks per link per day | |

---

## 2. New facts from this pass (all checked 2026-11-12)

### 2.1 Four rivals the siblings flagged but had not torn down

| Vendor | Unit and price (quoted from its own page) | Networks it lists | MCP / connect / webhooks | Read for Siar [inferred] |
|---|---|---|---|---|
| **PostWire** ([postwire.io](https://postwire.io/)) | Per business: "Connect two networks or nine on any plan — same price." Free $0 (1 business, 10 posts/month, 2 networks per post, "Posted with postwire.io" mark); Starter $19 (1,000 posts, 3 brands); **Pro $29 (unlimited posts, fair use 10,000, 10 brands)**; Agency $99 (50 clients); Scale $299 (200 clients). X is a pay-per-use add-on | TikTok, Instagram, Facebook Pages, YouTube, LinkedIn profiles ("Company Pages not yet"), Bluesky, Mastodon, Telegram, Discord, WordPress, Dev.to, Hashnode, Slack, Nostr; Reddit pending; **no Threads, no Pinterest** | Hosted MCP at `https://postwire.io/api/mcp`, listed in Claude's connector directory; n8n community node on npm; OpenAPI at `/openapi.json`; webhook endpoints 2–50 by plan; Agency removes its mark from client pages but "the networks' own sign-in screens still name PostWire" | **The closest analogue to Siar found so far**: same billing unit, same honest LinkedIn-profiles-only line, Discord/Slack/Mastodon, cheaper at 10 brands with more posts. Siar must not claim "per business" or "Discord, Slack and Mastodon" as rare. Its builder wrote roundup CP 17 on dev.to (`keywords/ai-answers.md`) |
| **PostPeer** ([pricing](https://postpeer.dev/pricing), [sitemap](https://postpeer.dev/sitemap.xml)) | Credits per API action; "Unlimited Connected Accounts". Free 20 credits; Starter $23.10/mo billed yearly ($277.20) for 2,000 credits; Standard $30 (6,000); Pro $84 (20,000). X post = 5 credits, 50 with a URL | X, Instagram, YouTube, TikTok, Facebook, Pinterest, Bluesky, LinkedIn, Threads | MCP page exists (hosted or local not stated on pricing) [unverified]; webhooks and white-label not on the pricing page | 334 URLs: **10 error pages**, 12 `/alternatives/*` (one is **bundle-social**), 38 `/social-media-*-api/{network}` pages, 40 free tools [measured, sitemap]. It copies the exact page types Siar has and adds the ones Siar lacks. Held DDG #2 on 9 of 17 head terms (`head-unified.md`, measured once) |
| **Publora** ([pricing](https://publora.com/pricing), [sitemap](https://publora.com/sitemap.xml)) | Per connected account: Starter free forever (3 accounts, 15 posts/month, no X); Pro $5.99 / $2.99 / $0.99 per account by tier; Agency $59 incl. 10 accounts | Instagram, TikTok, YouTube, Facebook, Threads, Bluesky, X, Mastodon, LinkedIn, Telegram | "API & MCP access" on all plans; webhooks on Pro and Agency | 588 URLs, **346 of them glossary**, 188 blog posts, 0 error pages, 13 compare pages incl. "publora vs buffer/hootsuite **api-first**" [measured]. Volume play; weak on reference depth |
| **CrosspostAPI** ([home](https://crosspostapi.com/)) | Developer $0 (50 posts, 3 accounts); Pro $29 (1,500 posts, 15 accounts); overages per post. "A single call that publishes to three platforms counts as three posts" | X, Instagram Business, Facebook Pages **and Groups**, LinkedIn profiles and Pages, Pinterest, Threads | Hosted connect flow; webhooks for success, failure, deauthorization; MCP not mentioned | Small. Its per-platform counting is a clean contrast to Siar's "one post counts once" |

### 2.2 Corrections to sibling files

| File | Says | Now [sourced 2026-11-12] | Effect |
|---|---|---|---|
| `competitors.md` §5.9, keyword-map C51 | Hootsuite MCP "Perch saves drafts but does not publish"; "Nest cannot send replies" | [hootsuite.com/integrations/mcp](https://www.hootsuite.com/integrations/mcp): Perch can "Create social media posts and publish them to X and Instagram at the same time" and "schedule it to LinkedIn and Instagram"; Nest can "reply with saved responses" | **Drop the "drafts only" attack on `/compare/hootsuite-api`.** The seat price, no connect API for your customers and unsigned webhooks still stand (re-check before publishing). The teardown's own "Watch" item has fired |
| `market.md` §6, keyword-map C92 | LinkedIn 202511 sunset is a trigger for Siar | [learn.microsoft.com/…/versioning](https://learn.microsoft.com/en-us/linkedin/marketing/versioning) confirms "Marketing Version 202511 … will be sunset on November 16, 2026"; latest is 202610. **Siar sends `202609`** [code: `packages/networks/src/adapters/linkedin.ts` line 38], so Siar is not affected | The 426 page can say, truthfully, that Siar already runs a current version. Add a dated reminder: 202609 sunsets about September 2027 (LinkedIn supports each version "for a minimum of one year") [inferred date] |
| research brief | "OpenAPI 3.1, ~263 operations" | 3.0.2, 270 operations [siar-truth §7] | Every developer page uses 3.0 / 270, generated, never typed |
| `competitors.md` §2a bundle.social row | (fine) | [bundle.social/pricing.md](https://bundle.social/pricing.md) ("Last updated 2026-07-30"): Pro $100 / $90 yearly, 10,000 posts, **unlimited teams**; Free 20 posts a month, 3 teams; 5 webhooks per org; DMs by email request | Siar Pro (10 brands) connects **fewer** accounts than bundle.social Pro (unlimited teams). Siar's case against bundle.social is price, a $19 tier, API-managed webhooks and ringgit, not account count |

### 2.3 Deadlines confirmed

- **Buffer legacy REST:** brownouts on "November 11, 2026" and "December 9, 2026"; after **February 1, 2027** "requests
  to legacy endpoints will no longer return data". Replacement: the GraphQL API with an MCP server, CLI and managed
  OAuth. The article does not say whether apps can connect users who have no Buffer account [sourced:
  https://buffer.com/resources/legacy-rest-api-retired/]. The teardown says they cannot [`competitors/buffer.md`,
  measured from Buffer's docs]; re-check before quoting.
- **bundle.social `teams` field** on `GET /organization` "will be removed on 2026-11-15" [sourced via
  `competitors/bundle-social.md` line 240]. Siar's serializer must decide whether to follow; it matters only if the
  compatibility page ships.

### 2.4 The X question, now quotable

X's Developer Agreement III.A(e) bars using the API to "provide use of the X API on a service bureau, rental or managed
services basis" and to "make available to a third party any token, key, password, or other login credentials"; III.L
describes self-serve use as "supporting applications with a limited number of end-users" [sourced:
https://docs.x.com/developer-terms/agreement]. Whether Siar's shared-app pass-through fits is **unverified** and a legal
question. Until Fakhrul has read it: X stays a capability line on `/x-api`, never a price weapon in a comparison, and
C87 `/x-api/pricing` stays held.

### 2.5 The MCP field

The official registry's search for "social" returns 49 distinct servers on the first page, most of them remote
(hosted): WoopSocial, SocialAPI.ai, Social Champ, Planagram, PostingCat, Publinio, SocialPostFlow and others [measured:
https://registry.modelcontextprotocol.io/v0/servers?search=social&limit=100]. Earlier sweeps add Zernio, Upload-Post,
Outstand, Blotato and Postproxy (`keywords/ai-agents-mcp.md`). bundle.social's MCP is local stdio with hosted "on the
roadmap" (`competitors.md` §2b). **Read:** being in the registry is table stakes and not a ranking edge; a
hosted endpoint is what lets a listing turn into usage [inferred].

### 2.6 bundle.social's page footprint (the slug-for-slug rival)

291 URLs; 163 match API, compare, MCP or error patterns [measured: https://bundle.social/sitemap.xml]. Among them:
24 `<brand>-alternative` pages, `/tools/social-media-api-cost-calculator`, `/blog/migrate-from-zernio`,
`/social-media-mcp-server`, `/social-media-cli`, `/claude-code-social-media`, `/cursor-social-media`, 15 `/<net>-api`
and 15 `/<net>-api/errors` plus `/errors`, and DM, auto-reply, ads and Google Business feature pages. Siar uses the same
slug scheme for networks and errors (`current-site.md` §5). **Read:** Siar cannot out-publish bundle.social on breadth;
it can out-answer it page by page on the networks both have open, and it alone can publish "switch from bundle.social".

---

## 3. Where to strike: gaps rivals leave open

Ranked by (honest fit today) × (thinness of the field) × (time pressure). Each gap says what Siar has, who is there,
and what kills it.

### G1. "Switch from bundle.social" — the only door no rival can open (PARKED)

- **What Siar has:** bundle.social v1 wire compatibility: same paths under `/api/v1`, same `x-api-key`, field names and
  error shape; all 194 operations of the 2026-10-11 spec, 194 of 197 in the current one [measured, siar-truth §4].
- **Who is there:** PostPeer has `/alternatives/bundle-social`; Ayrshare, Zernio, Upload-Post, Postproxy, Blotato and
  WoopSocial name bundle.social [measured]. None can say "change the base URL". bundle.social itself has
  `/blog/migrate-from-zernio`, so migration pages are a format it already believes in [measured].
- **The pitch, all true:** $49 vs $100 at 10,000 posts; $149 vs $400 at 100,000; a $19 / RM39 tier where bundle.social
  has none between $0 and $100 ("Hobbyist and need a smaller plan? Message us") [sourced: bundle.social/pricing];
  webhooks you create and manage from the API; ringgit and FPX/DuitNow; price lock.
- **The honest concessions:** bundle.social sells 15 networks as live (Siar 9); its Pro has unlimited teams (Siar Pro
  10 brands); it has scale proof Siar does not; OAuth tokens never move, so customers reconnect their accounts.
- **Kills it:** the naming decision; the 3 missing operations (`/misc/tiktok/locations`, `/misc/tiktok/post-settings`,
  `/organization/usage/messages`) and the `teams` field change on 2026-11-15. Close them before any page says
  "compatible".
- **Recommendation to Fakhrul:** unpark it, with a legal read of naming a competitor and describing API
  compatibility in Poland/EU terms first [inferred; the brief already lists "legal review undecided"]. Wording
  ceiling: "Siar speaks the bundle.social v1 API as of <month>; most apps switch by changing the base URL and
  reconnecting accounts." Never "drop-in replacement", "100% compatible", "official".

### G2. Deadline migrations off dashboard-tool APIs

- **What Siar has:** an API your customers connect to through your own branded link, without an account at the
  dashboard vendor; REST + OpenAPI; signed webhooks; comments in the API; on every plan.
- **Who is there:** 1–6 vendor pages per term (Outstand `/buffer-api`, `/hootsuite-api`; Ayrshare
  `/compare/*-api-alternative`; Publora "vs buffer api-first") [measured, `alternatives-vs.md`, §2.1].
- **Time pressure:** Buffer brownout 2026-12-09, shutdown 2027-02-01 [sourced §2.3]. A page live and indexed before
  2026-12-09 meets people at the moment their integration errors.
- **Kills it:** implying REST compatibility with Buffer (there is none: a migrator rewrites either way); the Hootsuite
  "drafts only" line (now false, §2.2).

### G3. First-hand network gates and quotas

- **What Siar has:** its own approval records with dates (`docs/approvals/*`): Meta approved 2026-10-27 (27
  permissions), Google OAuth approved 2026-10-15, YouTube audit pending, Pinterest Trial, LinkedIn Community Management
  denied, TikTok audit rejected 2026-10-20 [doc]. Plus per-network caps generated from code.
- **Who is there:** bundle.social has `/blog/tiktok-api-approval`, `/blog/youtube-api-quota-exceeded-limits-fixes`,
  `/meta-app-review-rejected`; Outstand has an approvals page [measured]. They are written by people who did it, too, but
  **nobody publishes a dated, per-network approval log of their own app** [inferred from sitemaps; unverified as an
  absolute].
- **Why it wins:** "meta app review taking time", "tiktok content posting api audit", "linkedin community management
  api development tier access form", "pinterest api trial access denied" autocomplete [measured, sibling sweeps]. Thin
  result pages; Stack Overflow threads on tokens have 189k–208k views (`market.md` §3).
- **Honest CTA per page:** Meta pages: "Siar's app already passed review, so your customers connect through it."
  LinkedIn, TikTok, Pinterest, YouTube pages: a guide only, with Siar's own status line. Never "skip the review".
- **Kills it:** sounding like a sales page for networks Siar cannot sell. The TikTok story needs Fakhrul's yes.

### G4. Error codes, answer-first (Siar is level or ahead today)

- **What Siar has:** 15 error pages, 147 codes, generated from the adapters [measured, `current-site.md`].
- **Who is there:** bundle.social 14 + hub, Ayrshare 30, Zernio 12, PostPeer 10, SocialAPI.ai as blog posts [measured].
  postpeer.dev ranked on DDG for "instagram api errors how to fix" (measured once).
- **Why it loses today:** H2s are bare codes ("190", "2207042"), intros explain Siar instead of the error, 2 in-links
  each, about a third not in Google, no `/errors` hub [measured, `current-site.md` §3–4].
- **Fix that wins:** H2 = code + network's message + plain name ("190 · Error validating access token · token
  expired"); first 50 words answer "what it means and the fix"; a one-line "what Siar does with it" after; `/errors`
  hub; per-code anchors; `dateModified` per page.

### G5. Webhook delivery semantics as a buying criterion

- **What Siar has:** 16 events, HMAC by default, 7 retries over about 45 h, delivery log, resend, test event, secret
  rotation, `x-siar-delivery` id for receiver-side idempotency [code: `engine/webhooks.ts` line 9].
- **Field (vendors' own docs, per teardowns):** Upload-Post one attempt, no retry; bundle.social 3 attempts, dashboard
  only, 5 per org; Mixpost 3 tries in about 6 min, secret optional; Outstand signing optional; Ayrshare HMAC optional,
  about 16 h; Buffer, Sprout, Publer, Metricool none documented [sourced in `competitors.md` §2b].
- **Why it wins:** no rival makes webhook reliability a page; "social media webhooks api" has 2 autocomplete
  completions and a scattered result list (`keyword-map` C16). It is the one technical comparison where Siar's row is
  the strongest without caveats.
- **Kills it:** stale rows. Re-fetch each vendor's webhook doc on the day of publishing.

### G6. The developer-community networks: Threads, Bluesky, Mastodon, Discord, Slack

- **What Siar has:** all five open today, no review needed for four of them [doc].
- **Who is there:** bundle.social, Upload-Post, Postiz and now PostWire list Discord, Slack and Mastodon [sourced]. None
  makes the *combination* a page; nobody targets "post release notes to Slack, Discord, LinkedIn and X from CI"
  (p049), "Bluesky, Mastodon and Threads from one API" (p010) [measured absence in the AA pool].
- **Why it wins:** low demand, very low competition, and the buyer is exactly Siar's: a developer with a script.
- **Kills it:** calling it rare. Say "open today", not "only".

### G7. Docs and reference SEO (the asset that compounds)

- **What Siar has:** 12 guides, 26 generated reference pages, `/openapi.json`, `/llms.txt`, `/pricing.md`.
- **Problem:** about 40 of these are not in Google, the docs titles carry no topic ("Webhooks | Siar docs"), and the
  biggest reference page is 1.27 MB [measured, `current-site.md`].
- **Why it matters:** developers evaluate an API by its docs, and AI coding agents (Claude Code, Cursor) fetch docs pages
  directly when a developer asks them to integrate [inferred]. Ayrshare ships a `.md` copy of every page; Outstand has
  `/facts` and an AI catalog [measured, `competitors.md` §4a]. This is where "proof by artefact" lives.

### G8. Per-business pricing, explained with numbers

- **What Siar has:** a real per-organization model; scenario arithmetic from vendors' own price lists
  (`competitors.md` §2a).
- **Who is there:** Zernio owns "pay-per-account pricing"; bundle.social has a cost calculator tool; SocialClaw and
  SocialAPI.ai have self-ranked "cheapest" posts [measured].
- **Why it still wins:** nobody publishes a dated, sourced, multi-vendor table that says where each vendor is cheaper.
  Honesty is the differentiator: Siar is not cheapest at 1 brand (Zernio free, Post for Me $10, Publer $10) or at 10
  brands (SocialAPI.ai $29, PostWire $29, Outstand $33, Upload-Post $39) [sourced].
- **Kills it:** the "unlimited accounts" wording (decision 1) and any "cheapest" headline.

### G9. Link-in-bio API

- **What Siar has:** full CRUD plus views and clicks per link per day (`bio.ts`, tags `bio`, `bio-item`,
  `bio-analytics` in the OpenAPI) [code].
- **Who is there:** no API vendor has the page; Linktree's developer page is an interest form; bundle.social has no bio
  endpoints in its public spec [measured, `use-case-segments.md`].
- **Why it wins:** an empty field, a real feature, "linktree api" autocompletes [measured]. Small but free.

### Strike nowhere near (now)

Head terms ("social media api", "instagram api", "tiktok api"); "best social media APIs" own listicle (CP pool is 15
of 18 vendor-written, self-ranked [measured]); anything TikTok, YouTube-public, Pinterest-publishing, LinkedIn-Pages,
GBP, Reddit, Snapchat as a capability; DMs and comment-to-DM; "white-label"; "open source"; "free social media API";
X pricing (§2.4); MCP pages before npm; generic "Buffer/Hootsuite alternative" (SMB dashboard field).

---

## 4. Siar's unfair advantages that are true today

"Unfair" = rivals cannot copy it this quarter, or have chosen not to. Each row: the claim (siar-truth wording), why it
is hard to copy, the artefact that proves it on the page.

| # | Advantage | Why rivals don't have it | Proof to show (no numbers invented) |
|---|---|---|---|
| A1 | **bundle.social v1 wire compatibility** (parked) | A rival would have to rebuild its API on another vendor's contract | Diff of `/openapi.json` vs bundle.social's swagger: operation list, generated at build time |
| A2 | **Reference generated from the enforcing code** (limits, media rules, scopes, 147 error codes) | Rival pages are written by hand and drift; their own pages contradict themselves (Ayrshare, Zernio, Outstand, Upload-Post, Buffer counts disagree) [measured, `competitors.md` §3] | "Generated from the adapter that validates your post" note + `dateModified` + link to the field in `/openapi.json` |
| A3 | **A network-status table that is exactly true** | Zernio and Upload-Post sell Reddit while it returns 503; Zernio sells Snapchat in closed beta [measured] | `/platforms` status column from one constant (not the health endpoint), with approval dates |
| A4 | **Webhooks: signed by default, 7 retries over ~45 h, log, resend, API-managed** | Strongest row in the field on vendors' own docs (§G5) | The retry schedule and the 16 event names, rendered from `lib/events.ts` |
| A5 | **One post to many networks counts once; drafts and retries never count** | CrosspostAPI and Outstand count per platform; Post for Me's unit unclear [sourced] | The pricing page's "How quotas work" block, quoted on compare pages |
| A6 | **Never-post-twice claiming + validation at create time + verbatim errors** | Rivals' reviews complain of duplicates and swallowed errors [third-party]; Upload-Post returns `success: true` on a TikTok fallback [measured] | Code-level description, a real `400` `issues` example, a real error relay example. Design guarantee, not a rate |
| A7 | **Meta already cleared, on the record** | True of most rivals too, but few publish the date and scope list | The approval log page (C04) with the date and the 27 permissions' names |
| A8 | **API on every plan, Free included; 100 req/s** | Publer, Metricool, Sprout, Mixpost gate the API to upper tiers; Postiz create-post ~100/hour [sourced] | Rate-limit doc + plan table |
| A9 | **Price lock + per-organization price** | Zernio, Postproxy, Outstand changed models in 2026 [sourced]; none promises a lock [measured absence in teardowns] | Exact line: "Your price never goes up while you stay subscribed." |
| A10 | **The dashboard is a client of the same API** | Dashboard vendors' APIs are add-ons; API vendors' dashboards are thin | One short screen recording of the dashboard's network calls hitting `/api/v1` [inferred format] |

**Not advantages, stop treating them as such:**

- Per-organization billing: shared with bundle.social, SocialAPI.ai, Postproxy, PostWire [sourced].
- Discord + Slack + Mastodon: shared with bundle.social, Upload-Post, Postiz, PostWire [sourced].
- "Unlimited accounts": bundle.social paid plans give unlimited teams; Siar Pro gives 10 brands [sourced + code].
- X without your own developer app: a liability until the X terms are read (§2.4).
- The SDK, CLI and MCP: invisible until on npm; rivals have 25k–340k monthly npm downloads (`competitors.md` §4c).
- Ringgit: real for Malaysia, irrelevant to the global developer (handled by the Malaysia strategist).

---

## 5. Page and content architecture

Rules for every page in this section:

- Competitor facts link the vendor's own page with "checked <date>", re-fetched within 7 days of publishing.
- Every page names Siar's status for the network it discusses, from one constant.
- Every page answers its query in the first 50–60 words, then shows Siar.
- No page goes live before the siar-truth §6 fixes it depends on (noted per row as **W0**).
- "Gate" = an owner decision from `keyword-map.md` §2 or below.

### 5.0 Prerequisites (W0, from siar-truth §6 and current-site §10; not new pages)

The 29 over-claims; the glued H1/H2 text (42 pages); the calculator's static default; the `npx @siar/mcp` lines removed
(or published); network status lines; `noindex` on app.siaran.my; `/pricing.md` content type; GSC + Bing Webmaster
verified and sitemaps submitted; IndexNow after each deploy. **Developer-specific additions:**

- Replace "OpenAPI 3.1" and "262/263 operations" wherever they appear (README badge, facts.md) with a build-time count.
- Retitle `/docs/*` and `/docs/api/*` (5.6) so they stop competing with use cases.
- Put the GitHub repo description in line ("built for 15 networks", open list) [`keyword-map` §5c].

### 5.1 Core pages (existing, retitled)

| Slug | Title direction (draft) | Target cluster | Purpose |
|---|---|---|---|
| `/` | "Siar: unified social media API and dashboard" | C01 unified social media API | Entity page. First 60 words: what Siar is, the open-network list, the pricing unit. Head-term ranking is wave 3 |
| `/platforms` | "Social media API: networks and approval status" | C03 | The status table (A3). The most linked page on the site |
| `/pricing` | "Siar pricing: per organization, not per account" | C06 H2s | Unit in the first line; "Is there a free social media API?" H2 answered honestly |
| `/use-cases/multi-tenant-social-media-api` | "Social media API for SaaS: multi-tenant by design" | C11 | The SaaS-builder landing: teams per customer, branded connect, webhooks, one key |
| `/use-cases/hosted-connect-oauth` | "Social media OAuth API: a branded connect link" | C12 | Never "white-label"; say "Powered by Siar" plainly and what is configurable |
| `/use-cases/social-media-webhooks` | "Social media webhooks API: signed, retried, replayable" | C16 + G5 | Holds the cross-vendor webhook table (no new URL) |
| `/use-cases/social-media-comments-api` | "Social media comments API" | C15 | Comments live on 8 networks; DMs "beta, on request" |
| `/use-cases/social-media-posting-api`, `-scheduling-api`, `-analytics-api`, `-api-for-ai-agents` | keep, add answer-first leads | C09, C10, C14, C13 | Index them (3 are not in Google); AI-agents page: REST today, no MCP install line |
| `/docs` | "Siar API docs: quickstart, guides and reference" | navigational | Hub for 5.6 |

### 5.2 New hubs

| Slug | Target | Purpose | Gate |
|---|---|---|---|
| `/errors` (C114) | social media api error codes | Lists all 147 codes by network with anchors; search box over the codes (static, client-side) | W0 error-page fixes |
| `/compare` (C46) | social media api alternatives | Index of compare pages + a dated one-table summary (pricing unit, entry price, open networks, MCP, webhooks, connect) with "where they win" column; rows for PostWire, PostPeer, Post for Me, Postproxy, SocialAPI.ai, WoopSocial, CrosspostAPI, Publora (no own pages for these) | Comparison go |
| `/guides` | (none; navigational) | Index of 5.4 | — |
| `/platforms/approvals` (C04) | social media api approval by platform | **The dated approval log** (A7): per network, what Siar applied for, when, the outcome, what it means for customers. Links each gate guide | TikTok row needs Fakhrul's yes; otherwise "audit not passed, sandbox only" |
| `/platforms/limits` (C05) | social media api rate limits by platform | One generated table: per-network daily caps by plan, media limits, network rate limits (sourced), Siar's own rate limits | — |
| `/facts` (new) | "Siar facts" (branded, for AI fetchers) | One page, generated from `plans.ts`, the status constant and the OpenAPI count: what it is, open networks, prices in USD and MYR, unit, caps, operator, contact, last updated. Mirrors `/llms.txt`; the HTML version is what engines quote [inferred; Outstand runs `/facts`, measured] | W0 |

### 5.3 Per-network layer (live networks get depth; others get a status and a guide)

Hub retitles from `keyword-map` C64, C74, C82, C85, C89, C106, C109 ("<Net> posting API …"). Each hub gets: status
line; "How to post to <Net> via API" answer in the first screen (curl + response); limits table; scopes; "<Net> MCP" H2
describing the tools with **no install line** until npm; links to its topic pages, errors page, `/platforms/limits`,
relevant use cases.

| Slug | Cluster | Purpose | Order |
|---|---|---|---|
| `/linkedin-api/errors` (426 H2 upgraded) | C92 | "LinkedIn API 426 NONEXISTENT_VERSION: 202511 sunsets 2026-11-16"; state that Siar sends 202609 [code] | 1 (dated) |
| `/linkedin-api` hub fix | C89 | Remove the company-page claim; "profiles today; company pages after LinkedIn grants access" | W0 |
| `/linkedin-api/community-management-api` | C91 | First-hand: the dev-tier form, the denial (no reason given), what profile posting still allows | 2 |
| `/facebook-api/meta-app-review` | C76 | First-hand checklist from `docs/approvals/meta*.md`: permissions, screencasts, Business Verification, dates. CTA: Siar's app is approved | 2 |
| `/facebook-api/page-access-token` | C77 | Token lifetimes, why they expire, Siar's `social-account.updated` webhook | 3 |
| `/instagram-api/publishing-limit` | C68 | Meta's two numbers (100 vs 50 per 24 h) quoted, Siar's caps from code | 3 |
| `/instagram-api/how-to-post`, `/reels`, `/stories`, `/comments`, `/insights` | C65–C67, C70, C71 | Live network, medium demand; one page per job | 4 |
| `/threads-api/how-to-post` + hub H2s (250 posts / 24 h, sourced) | C82, C83 | Low competition | 2 |
| `/bluesky-api/how-to-post` + hub | C106, C107 | AT Protocol posting with Siar vs raw `createRecord` | 2 |
| `/mastodon-api` hub + fill or noindex `/mastodon-api/errors` | C109 | "Any server", visibility, CW | 2 |
| `/discord-api/schedule-messages` | C110 | Scheduled bot messages with per-team name and avatar | 3 |
| `/slack-api/rate-limits` | C111 | `conversations.history` 1/min for non-Marketplace apps (2025-05-29, sourced in PN); honest about Siar's own slow comment import | 2 |
| `/x-api/errors` (402, 403 duplicate H2s) | C88 | "x api 402 creditsdepleted" | 1 |
| `/x-api/how-to-post` | C86 | Posting; credit explained neutrally | 4 |
| `/youtube-api/quota`, `/youtube-api/audit` | C97, C98 | Google's 2026-11-02 change; Siar's own pending audit; **no public-upload claim until Fakhrul tests one** | 2 |
| `/pinterest-api/access` | C103 | Trial vs Standard, first-hand | 3 |
| `/tiktok-api` status + `/tiktok-api/errors` | C93, C95 | Reference only; "opening after TikTok approves Siar" | W0 status, 2 errors |
| HELD: `/x-api/pricing` (C87), `/youtube-api/shorts` (C99), `/instagram-api/dm` (C73), `/tiktok-api/audit` (C94) | | X terms; public upload test; DM beta; Fakhrul's call | — |

### 5.4 Guides (`/guides/*`)

| Slug | Cluster | Purpose | Order |
|---|---|---|---|
| `/guides/post-to-multiple-social-networks-api` | C22 | One request, many networks; per-network overrides; status for unopened networks | 2 |
| `/guides/post-to-bluesky-mastodon-threads-api` | C23 (p010) | The three open-protocol-ish networks in one call | 2 |
| `/guides/post-release-notes-from-ci` | C25 (p049) | GitHub Actions / GitLab CI step posting to Slack, Discord, LinkedIn profile, X; plain `curl`, no SDK install line | 2 |
| `/guides/idempotent-social-media-posting` | C24 (p045) | How duplicates happen; per-target claiming; `x-siar-delivery` on webhooks. **Must say plainly:** Siar has no client idempotency key on post creation [code: `idempotencyKey` appears in the OpenAPI only on automation-execution responses; none in `apps/api/src/modules/posts.ts`]; a client that resends a create call creates a second post, so check by your own reference before retrying | 2 |
| `/guides/social-media-api-pricing` | C26 (G8) | Three dated scenarios (1 brand, 10 brands/50 accounts, 500 brands) from vendors' own price lists; per account vs per post vs per organization; X per-call costs from docs.x.com (neutral); where each vendor is cheaper | 3 (gate: accounts wording) |
| `/guides/social-media-api-integration` | C27 (p024, p026) | Build vs buy with Siar's approval log as evidence; "hosted, not open source" H2 | 4 |
| `/guides/manage-social-media-for-multiple-clients` | C35 | One brand per client; connect link per client | 4 |
| `/guides/n8n-threads-posting`, `/guides/n8n-instagram-posting`, `/guides/n8n-social-media-posting` | C32, C31, C30 | HTTP Request node recipes with exportable workflow JSON | 3–4 |
| `/guides/ai-agent-linkedin-posting` | C34 | Profiles only; REST from an agent; no MCP install line | 4 |
| `/guides/what-is-a-unified-social-media-api` | C28 | Definition with a unified vs native table | 5 |
| `/guides/best-social-media-apis` | C29 | Stated method, sources per row, Siar not ranked first | 6 (last) |

### 5.5 Compare and migrate (`/compare/*`, gate: comparison go)

Template: H1 "<Rival> alternative: <one honest line>"; first screen = a 6-row table (unit, entry price, price at the
dated scenario, open networks, webhooks, connect), each rival cell linked and dated; "Where <Rival> is the better
choice" section above the fold-ish, not at the bottom; "Moving your code" section (field map) where useful; FAQ only
with visible Q&A.

| Slug | Cluster | Lead (true) | Concede (must appear) | Order |
|---|---|---|---|---|
| `/compare/buffer-api` | C50 | Your customers connect without a Buffer account; REST + webhooks; Buffer REST shutdown dates and what to do | Buffer's free plan, hosted MCP, TikTok/YouTube/Pinterest/LinkedIn Pages; no REST compatibility | 1 (before 2026-12-09) |
| `/compare/metricool-api` | C53 | API on every plan; webhooks; connect link for your customers | Metricool's free hosted MCP, analytics depth, networks | 2 |
| `/compare/publer-api` | C54 | API on every plan; connect API; webhooks | Publer API $10 for one account vs Siar $19 | 2 |
| `/compare/hootsuite-api` | C51 | Per organization vs per seat; connect for your customers; signed webhooks | **Perch now publishes** (§2.2); listening, approvals, enterprise | 2 |
| `/compare/sprout-social-api` | C52 | API on every plan vs Advanced $399–499/seat; publishes vs drafts (re-check Sprout's docs on the day) | Analytics and enterprise | 3 |
| `/compare/ayrshare` | C47 | Per business vs per profile ($19/$49/$149 vs $149/$299/$599, sourced); 20 free posts to try; Discord/Slack/Mastodon; signed webhooks by default; field map (Ayrshare profiles → Siar teams) | TikTok, YouTube, Pinterest, LinkedIn Pages, GBP live; hosted MCP; unlimited posts; **no X row** until §2.4 | 3 |
| `/compare/zernio` | C48 | Per organization vs per account (arithmetic at 40, 100, 1,000 accounts); price lock; Mastodon | Free for 2 accounts; unlimited posts; networks; SDKs; hosted MCP | 3 |
| `/compare/upload-post` | C49 | Retried signed webhooks vs one attempt; verbatim errors vs flags inside a 200; above 75 brands | Cheaper for 2–75 clients; 22 networks; media processing | 4 |
| `/compare/outstand` | C57 | One post counts once; X without your own app (after §2.4); dashboard + connect | Cheaper below ~7,300 deliveries | 5 |
| `/compare/postiz` | C56 | 100 req/s vs ~100 create-post/hour; comments API; signed webhooks | Open source, self-host, 30+ networks | 5 |
| `/compare/mixpost` | C58 | An API to build on vs an app to install | "If you must own the server, Mixpost is the better buy" | 5 |
| `/compare/blotato` | C55 | Connect for your customers; never-post-twice; API on Free | Hosted MCP; content machine | 5 |
| PARKED `/compare/bundle-social` | C59 | G1 | G1 | after decision |
| PARKED `/migrate/bundle-social` | C60 | "Change the base URL, then reconnect accounts"; operation diff generated from both specs; the 3 gaps listed until closed | Networks; unlimited teams on Pro | after decision; then **order 1** |

No pages for PostWire, PostPeer, Publora, CrosspostAPI, Post for Me, Postproxy, SocialAPI.ai, WoopSocial: rows on
`/compare` only (brand demand very low, `keyword-map` §7) [inferred].

### 5.6 Docs SEO (`/docs/*`)

| Change | Why |
|---|---|
| Titles: "Webhook signatures and retries · Siar API docs", "Connect accounts with a hosted link · Siar API docs", "Rate limits · Siar API docs", reference pages "<Tag> API reference · Siar" | Separate the guide/reference intent from the use-case pages (`current-site.md` §8) |
| Every docs guide gets runnable `curl`, TypeScript (`fetch`, no SDK until npm) and Python (`requests`) tabs | "social media api python" demand exists and Siar has no Python SDK (C37) [inferred] |
| A `.md` twin of every docs guide and use case (`/docs/quickstart.md`), linked with `rel="alternate" type="text/markdown"` | Coding agents fetch docs; Ayrshare and bundle.social ship markdown copies [measured]. Value is inferred, cheap to generate |
| `/docs/api/*`: split `automation` (1.27 MB) by sub-tag or cap schema depth with a link to `/openapi.json` | Page weight; GEO plan P4 |
| Link every `/docs/api/<tag>` to its use case with the commercial anchor ("social media webhooks API") and every use case back to its reference with the navigational anchor ("Webhooks API reference") | Fixes the cannibalisation without merging pages |
| A docs sidebar that lists reference tags, not only guides | 25 tag pages are orphans (2 in-links) [measured] |
| "Run in Postman" / public Postman collection generated from `/openapi.json` | Off-site listing that also helps evaluation (§6) |
| `/docs/sdk-cli-mcp`: "version 0.1.0, built from the same OpenAPI contract"; no install commands until npm | siar-truth §2 |

### 5.7 MCP and agents (gate: npm publish; better with a hosted endpoint)

| Slug | Cluster | Purpose |
|---|---|---|
| `/social-media-mcp-server` | C41 | First screen: install command or remote URL, the 19 tools, which networks are open, auth with an API key. Only after `@siar/mcp` is on npm |
| `/mcp/instagram`, `/mcp/linkedin`, `/mcp/threads` | C42 | Only after npm; LinkedIn page says profiles only |
| `/guides/post-to-social-media-from-claude`, `/guides/claude-code-social-media`, `/guides/openai-agents-sdk-social-media` | C43–C45 | Client setup guides |

**Product note (not phasing advice; Fakhrul builds it whole):** a streamable-HTTP MCP endpoint (for example
`https://api.siaran.my/mcp`, API-key auth) is what turns registry listings into use: 40+ of the 49 registry entries
seen are remote, PostWire is in Claude's connector directory, and searchers type "mcp url" and "connector" terms that
`keyword-map.md` currently skips for lack of a remote endpoint [measured, inferred].

### 5.8 Page count

About 70 URLs in this angle: ~20 existing pages retitled or upgraded, ~38 new pages live now, ~12 gated (MCP 7,
bundle.social 2, held network topics 4). It is less than a third of bundle.social's 163 matching URLs, by design:
depth on fewer pages [inferred].

---

## 6. Internal linking

**Spine.** `/` → `/platforms`, `/pricing`, `/docs`, `/use-cases`, `/compare`, `/errors`, `/guides`. Footer adds
`/errors`, `/compare`, `/guides`, `/platforms/approvals` and the four use cases missing today (analytics, comments,
webhooks, hosted connect) [`current-site.md` §2].

**Rules (enforced in templates, not by hand):**

1. **Every network hub** links: its errors page, its topic pages, `/platforms` (status anchor), `/platforms/limits#<net>`,
   `/platforms/approvals#<net>`, the posting and scheduling use cases. Anchor text uses the network's query wording
   ("Instagram API error codes", not "Errors").
2. **Every error page** links: `/errors`, its hub, the topic page each code concerns (190 → `/facebook-api/page-access-token`),
   `/docs/errors` for Siar's envelope. Per-code anchors (`#code-190`) so guides can deep-link.
3. **Every gate guide** (C76, C91, C98, C103) links `/platforms/approvals#<net>` and its hub; the Meta guide also links
   `/use-cases/hosted-connect-oauth` ("customers connect through Siar's approved app").
4. **Every compare page** links `/compare`, `/guides/social-media-api-pricing` (scenario anchor), `/platforms` (status),
   `/use-cases/social-media-webhooks` (the webhook table), and the relevant migrate page. Compare pages never link to
   each other in body copy except through `/compare` (keeps each page about one rival).
5. **Every guide** links the exact `/docs/api/<tag>` operation it uses and one use case; the use case links back.
6. **The pricing explainer** is the only page that links all compare pages in body copy (as evidence rows).
7. **Never link to held or parked pages**; never link a network that is not open with a "post to <net>" anchor.
8. **Breadcrumbs** on every nested page (Home › Networks › Instagram › Errors), with BreadcrumbList that mirrors them.
9. **Status as a component.** The status line is one component rendered on hubs, topic pages, guides and compare pages,
   so a change in `docs/approvals` updates every page at the next build.

---

## 7. Sequencing content by winnability (not product phasing)

Assumes 5.0 is done. "Weeks" grades rest on very few measured result pages (`keyword-map.md` §8); re-measure first.

| Order | Pages | Why now |
|---|---|---|
| 1 | `/linkedin-api/errors` 426 H2; `/x-api/errors` 402/403; all 15 error pages upgraded + `/errors`; `/compare/buffer-api` (if comparison go) | Dated (LinkedIn 2026-11-16, Buffer 2026-12-09); 147 codes already written |
| 2 | Core retitles (5.1); `/platforms` status; `/platforms/approvals`; `/facts`; gate guides (Meta, LinkedIn CM, YouTube quota/audit); Threads, Bluesky, Mastodon, Slack pages; guides C22, C23, C24, C25; `/use-cases/link-in-bio-api`; webhook table on C16 | First-hand, thin fields, live networks |
| 3 | `/compare` hub; metricool-api, publer-api, hootsuite-api; pricing explainer (after the accounts wording); `/platforms/limits`; Instagram publishing-limit; token guide; n8n Threads | Thin comparison fields; quota pages |
| 4 | Ayrshare, Zernio, Sprout compare pages; Instagram topic set; X/LinkedIn how-tos; integration and multiple-clients guides; n8n Instagram and hub | Crowded but commercial |
| 5 | Upload-Post, Outstand, Postiz, Mixpost, Blotato compares; what-is guide | Crowded or low value |
| On decision | bundle.social migrate + compare (**jumps to order 1**); MCP pages and directory listings (jump to order 2); `/x-api/pricing`; YouTube Shorts | Owner gates |
| Last | `/guides/best-social-media-apis`; ranking work on the head terms | Needs the authority built above |

---

## 8. Off-site plan (developer-first)

Real activity under the real name, after the 5.0 fixes (a listing that sends people to a page showing TikTok as
"Posted" is a net loss). Ordered by expected effect for a developer API [inferred, building on `docs/geo/offsite-plan.md`].

| # | Surface | Action | Gate |
|---|---|---|---|
| 1 | **npm** | Publish `@siar/sdk`, `@siar/cli`, `@siar/mcp`; each README opens with one sentence and siaran.my | Fakhrul's npm go |
| 2 | **Official MCP registry** | Publish under a namespace Siar controls (DNS-verified `my.siaran/*` or the GitHub namespace) [registry naming per its docs, unverified detail]; then PulseMCP, Glama, Smithery, mcp.so, awesome-mcp-servers PR | npm (and better, a remote endpoint) |
| 3 | **GitHub** | Repo description and README: "built for 15 networks", open list, links to `/platforms`, `/openapi.json`, `/docs`; topics `social-media-api`, `openapi`, `mcp-server`, `webhooks` | — |
| 4 | **OpenAPI directories** | Submit `/openapi.json` to APIs.guru (it lists public OpenAPI specs) and publish a Postman public workspace/collection | — |
| 5 | **Maintained roundups** (all vendor-written, updated 2026-09 to 2026-11): Buffer, Blotato, Upload-Post (APIs and MCP lists), Zernio, PostPlanify, Ayrshare, Social Champ; dev.to authors (CP 17, CP 18) | A five-line factual row: open networks today, pricing unit, entry price, webhooks, MCP state, free tier wording. No ask to rank | Fakhrul's go |
| 6 | **Directories** | AlternativeTo (as an alternative to Ayrshare, Zernio, Buffer), G2 "Social Media APIs", Capterra/GetApp, SourceForge, Product Hunt launch. Factual listings, no ratings solicited by swap | Comparison go |
| 7 | **n8n** | A community node (`n8n-nodes-siar`) and 3 workflow templates (Threads, Instagram, multi-network) in n8n's gallery; PostWire already ships a node [sourced] | npm |
| 8 | **Answers** | Stack Overflow and the n8n forum: token, 426, 402, Meta review, Threads limit questions. Answer first, disclose, link the exact error or gate page only when it is the answer. A few a week | — |
| 9 | **Technical posts** | dev.to / Hashnode posts with canonical to siaran.my: "How we passed Meta App Review (27 permissions)", "What LinkedIn's version sunsets break", "Webhook delivery across social media APIs" (sourced table) | Fakhrul's go on first-hand stories |
| 10 | **Show HN** | Only when npm is live and the site is clean; strongest if the bundle.social compatibility is public ("a bundle.social v1–compatible social media API") | npm, G1 |
| 11 | **Claude connector directory** | PostWire is listed [sourced]; requires a remote MCP | Remote MCP |

Not doing: paid listicle placements, review swaps, self-ranked "best" lists, Wikipedia, astroturfed Reddit.

---

## 9. What to say and never say

### 9.1 The developer one-liner (all true today)

> **Siar is a social media API you pay for per business, not per account.** One REST API with a public OpenAPI file
> (270 operations) to publish, schedule, reply to and measure posts on Facebook, Instagram, Threads, X, LinkedIn
> profiles, Bluesky, Mastodon, Discord and Slack, with a dashboard built on the same API. 20 free posts to try, no card;
> then from $19 a month.

### 9.2 Proof lines (pick per page)

- "Every limit on this page is generated from the code that validates your post."
- "If a network says no, you get its own code and message, plus a plain-English fix."
- "Each network target is claimed once. Retries, restarts and double clicks cannot publish the same post again."
- "16 HMAC-signed events, retried with backoff for up to two days, with a delivery log you can inspect and resend."
- "Facebook, Instagram and Threads connect through Siar's Meta app, which passed App Review on 2026-10-27."
- "A post sent to every connected network counts as one post."
- "Your price never goes up while you stay subscribed."
- Status wording verbatim from siar-truth §1a and §2 for every unopened network.

### 9.3 Never say (adds to siar-truth §5)

| Never | Because |
|---|---|
| "the only per-business social media API", "only API with Discord, Slack and Mastodon" | PostWire, bundle.social, SocialAPI.ai, Postproxy share the unit; four rivals list all three networks [sourced] |
| "cheapest", "half the price" without the rival and scenario named | Not true at 1 or 10 brands [sourced] |
| "Hootsuite's MCP only saves drafts" | Contradicted by Hootsuite's page on 2026-11-12 [sourced] |
| "drop-in replacement" for Buffer, Ayrshare or anyone except bundle.social (and that only after G1) | No compatibility |
| "idempotent API" / "send it twice, safe" | No client idempotency key on create; the guarantee is per target inside one post |
| "X at cost, no developer account, no terms risk" | §2.4 open |
| "OpenAPI 3.1", "263 operations" | 3.0.2, 270 |
| "unlimited accounts" in a comparison cell without "one account per network per brand" | Decision 1 |
| "MCP server, install in one line" | Not on npm |
| "faster", "reliable", "production-grade", "battle-tested", any ms, any % | Not measured |
| Rival complaints quoted from Trustpilot/G2/GitHub | Only with the URL opened by hand and labelled third-party; prefer quoting the rival's own docs |
| Ranking Siar first in any list Siar publishes | GEO plan rule |

---

## 10. Decisions this angle needs from Fakhrul (ranked by what they unlock here)

1. **bundle.social naming** (with a legal read): unlocks G1, the most valuable segment, and a Show HN story.
2. **npm publish of SDK, CLI, MCP, and a remote MCP endpoint**: unlocks 5.7, registries, n8n node, roundup MCP columns.
3. **"Unlimited accounts" wording**: unlocks the pricing explainer and every comparison table. Suggested:
   "No per-account fees. Each brand connects one account on every open network; Starter 1 brand, Pro 10, Business
   unlimited." [`competitors.md` §7b].
4. **Comparison pages go**: unlocks 5.5 and the directory listings.
5. **X Developer Agreement read** (§2.4): unlocks X rows and `/x-api/pricing`.
6. **Publishing first-hand gate stories** (Meta yes by default; TikTok rejection and LinkedIn denial are his call).
7. **One public YouTube upload test**: unlocks the YouTube status change and C99.

---

## 11. Measurement and kill rules

- **Before publishing:** verify GSC and Bing Webmaster; run the `keyword-map.md` §8 checks with a fresh search budget;
  fill the wave-0 AI sheet for p004, p008, p010, p018, p021, p027, p038, p045, p049, p050.
- **Per page, after indexing:** impressions at 4 weeks (Bing) and 8 weeks (Google). Error and gate pages that earn no
  impressions in 8 weeks get a title/H2 rewrite once, then merge into the hub.
- **Compare pages:** if a rival's price or feature changes, the page is updated within 7 days or taken down; a stale
  rival fact is worse than no page.
- **AI answers:** every 4 weeks on the frozen prompts. The developer-angle target is Siar named in answers to p010,
  p018, p045, p049 and p050 (the prompts where Siar is honestly the best fit) before chasing p004 and p021.

---

## Sources (fetched in this pass, 2026-11-12)

- https://postwire.io/ (pricing, networks, MCP, webhooks, connect)
- https://postpeer.dev/pricing and https://postpeer.dev/sitemap.xml
- https://publora.com/pricing and https://publora.com/sitemap.xml
- https://crosspostapi.com/
- https://www.hootsuite.com/integrations/mcp
- https://bundle.social/pricing.md ("Last updated 2026-07-30") and https://bundle.social/sitemap.xml
- https://buffer.com/resources/legacy-rest-api-retired/
- https://learn.microsoft.com/en-us/linkedin/marketing/versioning
- https://docs.x.com/developer-terms/agreement
- https://registry.modelcontextprotocol.io/v0/servers?search=social&limit=100
- Code: `packages/networks/src/adapters/linkedin.ts` (line 38, `LINKEDIN_VERSION = '202609'`), `apps/api/src/engine/webhooks.ts`
  (line 9, `x-siar-delivery`), `packages/contract/openapi.json` (tags), `packages/mcp/README.md` (19 tools),
  `apps/site/src/lib/usecases.ts`, `apps/site/src/pages/`.

Everything else is cited to the sibling files: `docs/seo/competitors.md`, `keyword-map.md`, `market.md`,
`research/siar-truth.md`, `research/current-site.md`, `research/keywords/*.md`, `research/competitors/*.md`.
