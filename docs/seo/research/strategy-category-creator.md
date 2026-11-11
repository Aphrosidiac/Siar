# Strategy: category and positioning first

Written 2026-11-12 by the "category creator" strategist (one of three). It builds on `docs/seo/competitors.md`,
`docs/seo/keyword-map.md` (cluster IDs C01–C127 are used throughout), `docs/seo/market.md`,
`research/siar-truth.md`, `research/current-site.md`, `research/keywords/ai-answers.md` and `docs/geo/*`. It does not
redo them. Every Siar claim follows `siar-truth.md`; where this file and the truth file disagree, the truth file wins.

## Labels and limits

| Label | Meaning |
|---|---|
| **[measured]** | I (or a named sibling file) saw it on 2026-11-12 |
| **[sourced]** | The vendor's own page, URL given, checked 2026-11-12 |
| **[third-party]** | Someone else's page or review. A claim, not a fact |
| **[code] / [doc]** | Siar's checkout (`/Users/fakhrul/Desktop/dev/Siar-seo-research`) or its owner records |
| **[inferred]** | My judgement or arithmetic. Not proven |
| **[unverified]** | Could not be checked |

**What I could and could not do in this pass:**

- **WebSearch was refused.** The run-wide budget (200 calls) was already spent. Both of my queries were refused, and I did
  not work around that.
- **Before I learned of the refusal**, I ran about 40 Google autocomplete probes with curl (`suggestqueries.google.com`),
  the same method the sibling sweeps used. I quote those results as [measured] and ran no more after the refusal.
- **I fetched six vendor pages directly** with WebFetch: postpeer.dev, publora.com, postwire.io, postwire.io/pricing,
  bundle.social and docs.upload-post.com/api/webhooks. Fetching a vendor's own page is not a search.
- **No volume data, no People Also Ask, no Google Trends, no Reddit.** Every demand statement is inferred.
- **AI answers are not measured.** The wave-0 sheet is still empty, so which brands the engines actually name was not
  observed. The citation pool (18 pages) comes from `ai-answers.md`.

---

## 1. The verdict

1. **The single idea is "Every post accounted for."** Internally it is "the parts that break are ours." Siar is the
   unified social media API whose whole pitch is about what happens around a post:
   - each post is checked against every network's rules before it is sent;
   - each network target is sent once;
   - every failure comes back as the network's own words, plus a fix and a retry verdict;
   - you are told the outcome by a signed webhook that is retried for about 45 hours;
   - the network list says what is really live, with dates.

   Everything Siar can prove today sits inside that idea, and almost no rival leads with it [inferred, section 2].
2. **"Pay per business, not per channel" cannot be the lead.**
   - PostWire uses almost the same words: "Priced per business" [sourced: https://postwire.io/pricing].
   - bundle.social's title is "Unified Social Media API, Unlimited Social Accounts" [sourced: https://bundle.social/].
   - SocialAPI.ai uses the same per-brand model at $29 for 10 brands, against Siar Pro at $49 [sourced via `competitors.md` §2a].
   - So the billing unit is shared, and Siar is not cheapest on it below about 50 brands.

   Keep it as the second sentence of everything, with the one number only Siar has: **unlimited brands and 100,000 posts
   for $149 (RM399)**.
3. **Do not invent a search category.** "Accountable", "reliable", "duplicate", "webhook" and "approval" combined with
   "social media api" return **zero** autocomplete completions [measured]. People search for "unified social media api",
   "social media api pricing", "<network> api errors" and "meta app review".

   The move is category *design*, not category naming: stay inside "unified social media API" and **change what buyers
   and roundups compare**. Today the roundups compare platforms, MCP, SDKs, entry price and price per profile
   [measured, CP 3 in `ai-answers.md`], and Siar loses two of those five columns. Add the columns Siar wins: what happens
   when a post fails, how webhooks are retried, how errors come back, and which networks are approved, with dates.
4. **The content engine is a "failure library":** errors, limits, access gates, tokens and dated network changes for
   every network, generated from the code that enforces them. It is the only content type where:
   - a one-month-old company can out-proof incumbents;
   - developers link naturally (error codes, quotas, version sunsets);
   - the AI-answer prompts Siar can already win live (p038–p042, p045, p018) [measured: every code in p038–p042 is
     already on a Siar page].
5. **The off-site engine is the same idea, carried outward:**
   - open-source the error catalogue on GitHub;
   - publish the first-hand, dated approval records;
   - answer real failure questions where developers ask them;
   - pitch the roundups a factual row plus the new comparison columns.
6. **The idea is fatal while the site fakes things.** The home page shows a scripted "Live" event feed with made-up
   timings, TikTok, LinkedIn company page and Google Business shown as "Posted", and an `npx @siar/mcp` command that
   fails [measured, siar-truth §6]. "Every post accounted for" next to a fake live feed is worse than no positioning.
   Wave 0 is not housekeeping here; it is the precondition.
7. **A new direct threat: PostWire** (postwire.io), seen ranking but never torn down. On its own pages it already claims:
   - "Priced per business", from $19, with Pro at $29 for 10 brands;
   - "never double-posts" with an idempotency key;
   - dated approvals ("Meta App Review approved July 14, 2026"; "TikTok Direct Post audit approved July 7, 2026");
   - 14 networks "publishing live today", including TikTok, YouTube, Discord, Slack and Mastodon
     [sourced: https://postwire.io/, https://postwire.io/pricing].

   It occupies most of the positions Siar would take. Section 5 says what is left. Tear it down before any comparison
   page ships.

---

## 2. The single idea

### 2a. Statement

> **Siar: the unified social media API where every post is accounted for.** It checks each post against each network's
> rules before sending, sends each network target once, returns the network's own error with a fix, and signs and
> retries the result webhook for about 45 hours. Priced per organization, from $19 a month (RM39 in Malaysia).

**Proof points, all [code] or [doc] via siar-truth:**

| Mechanism | What is true | Where |
|---|---|---|
| Checked before sending | Per-network text length, media type, size, duration and aspect ratio are checked when the post is created. A bad request gets a `400` with an `issues` array pointing at the field | `apps/api/src/modules/posts.ts`, adapters' `validate` |
| Sent once | Each network target is claimed by a conditional database update with a fresh attempt id. A claim that dies mid-flight is reconciled by reading the account's recent posts before anything is re-sent. The customer does not need to send an idempotency key | `apps/api/src/engine/publisher.ts` lines 20–23, 89–91 |
| Failure in the network's own words | Adapters keep the network's code, message and HTTP status, and add a plain-English fix. Each failure is classed `retryable`, `non_retryable` or `unknown`. Transient failures retry automatically up to 3 attempts | `packages/networks/src/lib/errors.ts`; `AUTO_ATTEMPTS = 3` in `publisher.ts` line 26 |
| Told the outcome | The `post.published` event fires when a post reaches a final state, **posted or failed**, with each network's result. It is HMAC-signed and retried at 1 min, 5 min, 30 min, 2 h, 6 h, 12 h and 24 h (about 45 h in total), with a delivery log, manual resend, a test event and secret rotation | `publisher.ts` lines 246–255; `engine/webhooks.ts` lines 12–14 |
| Accounts that break are flagged | Revoked or expiring grants are flagged and a `social-account.updated` webhook is sent | events.ts, maintenance engine |
| Public reference | 15 network pages and 15 error pages (147 codes), generated from the enforcing code | `apps/site/src/lib/networks.ts`, `[api]/errors.astro`; live 200 [measured in current-site.md] |
| Status said plainly | Allowed wording: "Publish to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack today…" | siar-truth §1a (the site does **not** do this yet) |
| Retries don't cost posts | Drafts don't count. Retries of a failed post (up to 6) don't count again. One post to many networks counts once | `plans.ts` `RESOURCE_LIMITS.maxRetries`, `docs/pricing.md` |

**Check before writing copy** [code, inferred mismatch]: `apps/site/src/lib/events.ts` line 25 describes `post.published`
as "Sent once per post per network". `publisher.ts` emits it once per post, when the whole post reaches POSTED or ERROR.
Make the docs and the code say the same thing before `/how-publishing-works` quotes either.

### 2b. Why this idea and not the others

| Candidate | Verdict | Evidence |
|---|---|---|
| "Pay per business, not per channel" | **Second line, never the lead.** Shared by bundle.social, PostWire, SocialAPI.ai and Postproxy. Siar is not cheapest at 1 brand (Post for Me $10, Zernio free for 2 accounts) or at 10 brands (SocialAPI.ai $29, PostWire $29). The literal "unlimited accounts" claim is also shaky: one account per network per brand caps Pro at 150 [code: `schema.prisma`]. It does win at SaaS scale: $149 for unlimited brands | competitors.md §2a, §2c; https://postwire.io/pricing; https://bundle.social/ [sourced] |
| "For AI agents" | **Never.** It is in the title of Zernio, Outstand, Postproxy, PostPeer, Publora, Blotato, WoopSocial and SocialAPI.ai. Siar's MCP is not on npm (404) and is stdio only | competitors.md §3; https://postpeer.dev/ ("Unified Social Media API for Developers and AI Agents"); https://publora.com/ ("The Social Media Scheduler Built for AI Agents") [sourced] |
| "Skip the approvals" | **Meta only.** Zernio, Upload-Post and Outstand lead with it. Siar is rejected, denied or waiting on TikTok, LinkedIn Pages, YouTube and Pinterest | siar-truth §2; competitors.md §3 |
| "Most networks" | **Never.** Siar publishes to 9; rivals list 12–30 | competitors.md §2b |
| "Cheapest" | **Never.** False at 1 and at 10 brands | competitors.md §0 |
| "Every post accounted for" | **Lead.** It answers 4 of the top 5 buyer pains (gates, silent failures, webhooks, tokens; market.md P1, P3–P5). Every proof is a checkable artefact, which matters because Siar may not claim customers, uptime or reviews (siar-truth §5). It is not the headline of any of the ~20 vendor home pages quoted in competitors.md §3 [measured from that table; the phrase itself was not searched]. One ranking rival even shows the category's open question unanswered: PostPeer's FAQ has the heading "What happens if a post fails on one platform?" with no answer visible [sourced: https://postpeer.dev/] | as cited |

**What the idea is not:**

- It is not "never fails" or "guaranteed delivery". Networks still reject posts.
- It is not uptime.
- It is not "zero duplicates across N posts", because nothing has been measured.

It is a promise about *knowing*: every post ends in a recorded state with a reason, and you are told.

### 2c. Message hierarchy, used on every surface

1. **Category + idea:** "Unified social media API. Every post accounted for."
2. **Mechanism (pick 2–4 for the space available):** checked before it's sent · sent once · the network's own error plus
   the fix · a signed webhook, retried for about 45 hours · status of every network, dated.
3. **Price line:** "Priced per organization: no per-account fees. From $19 (RM39) a month; unlimited brands on Business,
   $149 (RM399)." The per-account wording depends on Fakhrul's decision; see section 11.
4. **Status line:** "Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack.
   Built for 15; the rest open as each network approves Siar."
5. **Trust line:** "FF DEV STUDIO, SSM 202603234793, Malaysia. Meta App Review passed 2026-10-27."

### 2d. The sentence engines should repeat (the canonical entity paragraph)

Use it word for word in the home page FAQ, `/about`, `/llms.txt`, the GitHub README, every directory listing and every
roundup pitch. Engines echo what is consistent across sources [inferred].

> Siar is a unified social media API and dashboard by FF Dev Studio in Malaysia. It checks each post against each
> network's rules before sending, publishes each network target once, returns the network's own error with a
> plain-English fix, and reports the result through signed webhooks retried for about 45 hours. It is priced per
> organization, from $19 a month (RM39 in Malaysia), with 20 free posts to try. Publishing is open today on Facebook,
> Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack.

---

## 3. Where to strike: the gaps competitors leave open

Ranked by fit with the idea × winnability [inferred]. "Who is there" uses only the sourced and measured facts in the
sibling files.

| # | Gap | Evidence it is open | Who is there | Siar's move |
|---|---|---|---|---|
| G1 | **No roundup compares failure handling.** Columns are platforms, MCP, SDKs, comments·DMs·analytics, entry price, cost per profile and free tier | CP 3's columns [measured, ai-answers.md]; MCP is a column on CP 1–5 and 14 | Nobody | Publish `/compare/failure-handling` (section 6, layer 2) and pitch its columns to roundup authors. This is the category-design move |
| G2 | **Webhooks that are not trustworthy** | Upload-Post: "each event is sent once" and is "not retried or queued for later" [sourced: https://docs.upload-post.com/api/webhooks, checked 2026-11-12]. bundle.social: 3 attempts. Mixpost: 3 tries in about 6 min. Ayrshare: about 16 h, HMAC optional. Postiz: no signature or retry documented. Buffer and Sprout: none [sourced in teardowns] | Zernio is strong (158 events, 50 endpoints, redeliver); its retry window is not in our files [unverified] | Own "social media webhooks" (C16) and the retry columns. **Do not** claim the most events: Zernio has more. Claim the longest *documented* retry window only among the vendors listed, with dates |
| G3 | **The error layer is thin across the field** | Error-page families: bundle.social 14, Ayrshare 30, Zernio 12, everyone else 0 on their sites; Siar 15 pages with 147 codes [measured, competitors.md §4a]. Small vendors rank with this page type (postpeer.dev/errors/instagram) [measured once] | bundle.social, Ayrshare, Zernio | Make Siar's the reference: an answer-first H2 per code, a `/errors` hub, a JSON copy on GitHub. Wins p038–p042 |
| G4 | **"Skip approvals" is everyone's claim; no one publishes the record** | "meta app review" returns 10 completions incl. "time", "taking time", "reddit", "video", "requirements" [measured today]. Zernio: "Skip months of platform approvals". PostWire shows dated approvals [sourced] | PostWire (dates only), Duta ("waiting for approval") | First-hand, dated gate guides from `docs/approvals/`: Meta submitted 2026-10-14, approved 2026-10-27 on a resubmission [doc: meta-review-submission.md, meta.md]. Also LinkedIn CM denied, YouTube audit waiting, Pinterest Trial→Standard, and TikTok (Fakhrul's call). Meta is the one page with a true "already done for you" CTA |
| G5 | **SaaS bill that stops growing** | At 500 brands / 20,000 posts: Siar Business $149, Post for Me about $150, Postproxy about $734, WoopSocial $799; Zernio's own example for 1,000 accounts is $1,218; bundle.social Business $400; PostWire Scale $299 caps at 200 clients [sourced + arithmetic: competitors.md §2c, https://postwire.io/pricing] | Post for Me ties | The SaaS page (C11) and the pricing explainer (C26) lead with this scenario, not the 10-brand one |
| G6 | **Dashboard-tool APIs that cannot embed** | Buffer: every end user needs a Buffer account; REST brownout 2026-12-09, shutdown 2027-02-01. Sprout: drafts only, from $399/seat. Hootsuite: API publishing excludes TikTok, YouTube and Bluesky. Publer: no connect API [sourced in teardowns] | 1–6 rival pages per term | `/compare/buffer-api` before 2026-12-09, then Hootsuite, Metricool, Publer, Sprout (C50–C54) |
| G7 | **Network changes nobody logs** | LinkedIn 202511 sunset 2026-11-16; YouTube upload rules changed 2026-11-02; Slack's `conversations.history` limit; Buffer REST [sourced via keyword-map]. Outstand has "Known issues" docs (X token refresh, TikTok cap, Facebook insights) [measured, outstand.md]; no rival dated changelog of network API changes was seen in the teardowns [inferred, not searched] | Outstand (partly) | `/network-changes`: a dated log, one entry per change, each linked to the affected network page. A freshness asset engines cite for dated questions |
| G8 | **Consumer pain: "scheduled post failed"** | "your scheduled post could not be posted", "instagram scheduled post not posting", "why is my scheduled post not showing on instagram" and similar return 7–10 completions [measured today] | Meta help, scheduler blogs [inferred] | One guide, `/guides/why-scheduled-posts-fail`, in wave 3. It is the idea's entry for dashboard buyers. High demand, long-term |
| G9 | **Ringgit + public API + brands** | Duta is ringgit but has no public API docs or brands; Zoho is ringgit per brand + member [sourced in my-sea-schedulers.md] | Duta | `/malaysia` (C115) with the trust line. Never "first" or "only" |
| G10 | **Link-in-bio API** | No API vendor has the page; Linktree's developer page is an interest form [measured, US105] | Nobody | C18. Small, true, cheap |
| G11 | **Switch from bundle.social** | Wire-compatible: 194 of 197 operations [measured] | Nobody can answer truthfully | **Parked** (naming decision). When cleared, it is the highest-value page on the site |
| G12 | **X at X's own price without your own X app** | Outstand, SocialAPI.ai and Postproxy require your own X app. PostWire sells credits: 80 for $5, 1 credit per post, 10 per link post, so about $0.06 a post and about $0.63 a link post against X's $0.015 and $0.20 [sourced: https://postwire.io/pricing, docs.x.com via siar-truth; arithmetic inferred] | — | **Held** until the X service-bureau clause is read (competitors.md §7b decision 3). Then it becomes a sharp row in every comparison |

**Gaps to leave alone** (rivals own them, or Siar cannot serve them honestly):

- AI agents and MCP (until the npm publish).
- Network breadth.
- TikTok, YouTube Shorts and LinkedIn company pages as recommendations.
- White label.
- DMs and comment-to-DM.
- Unlimited posts.
- Self-hosting.
- Generic "Hootsuite / Buffer alternatives".

---

## 4. Unfair advantages that are true today

Ruthless rule: an advantage counts only if it is (a) true in code or docs, (b) checkable by a stranger and (c) either
unique or clearly ahead of the rivals we have sourced.

| Advantage | Status vs field | Evidence | How to use it |
|---|---|---|---|
| bundle.social v1 wire compatibility | **Unique** | 194 of the 197 current operations match [measured, siar-truth §4] | Parked; when cleared, one migration page plus one compare page |
| Bill stops growing at Business: unlimited brands, 100k posts, $149 / RM399 | **Ahead** at 50+ brands; tied with Post for Me at about 20k posts | G5 | SaaS page, pricing explainer, every compare page's scale row |
| Webhook outcome on both success and failure, signed, 7 retries over about 45 h, log, resend from the API | **Ahead** of bundle.social, Upload-Post, Mixpost, Ayrshare, Postiz, Buffer and Sprout on the documented retry window; **not** ahead of Zernio on events or endpoints | G2 | C16, `/how-publishing-works`, failure-handling columns |
| Verbatim network errors + public 147-code reference generated from code | **Ahead** of all but bundle.social, Ayrshare and Zernio; level or ahead on depth [inferred from page counts] | G3 | `/errors`, open error catalogue, SO and forum answers |
| First-hand, dated approval records (Meta passed; others honestly not) | **Shared** with PostWire and Duta; ahead of every "skip approvals" vendor on candour | `docs/approvals/README.md` | Gate guides, `/platforms/approvals`, the about page |
| Ringgit, FPX/DuitNow pay-once yearly, Malaysian company, price lock | **Unique among the API vendors checked** (price lock: bundle.social and Zernio show none [measured]; Duta's founding offer is similar) | siar-truth §3b | `/malaysia`, `/ms/harga`, the trust line |
| Discord, Slack and Mastodon live | **Shared** with bundle.social, Upload-Post, Postiz and PostWire [sourced]; ahead of Ayrshare, Zernio, Outstand and the dashboard tools | competitors.md §0.5; https://postwire.io/ | Network hubs, C23, C25 |
| API on every plan, Free included; dashboard built on the same API | **Shared** (Zernio, WoopSocial, Buffer free) | siar-truth §4 | One line, never a headline |
| Sent-once without a client key, with crash reconciliation | **Shared feature, different mechanism.** Ayrshare, Upload-Post, Outstand and PostWire offer idempotency keys or duplicate checks [sourced in teardowns; https://postwire.io/] | publisher.ts | C24 guide; say "automatic", never "only" |
| Link-in-bio API | **Unique among API vendors checked** | US105 | C18 |

**Not advantages** (stop treating them as if they were):

- **"Per organization".** Shared with four or more rivals.
- **"Unlimited accounts".** bundle.social owns the phrase, and Siar's cap is one account per network per brand.
- **The free tier.** It is one-time; Zernio, Buffer, Upload-Post, PostWire and WoopSocial recur.
- **Network count.**
- **MCP.**
- **"Built in Malaysia".** Duta says "first".

---

## 5. PostWire, PostPeer, Publora: what changes

All three rank on Bing/DDG for head terms but have no teardown [measured once, competitors.md §1]. I read their home
pages (and PostWire's pricing) on 2026-11-12.

| Vendor | Positioning (quoted) | Unit and entry | What it takes from Siar | What it leaves |
|---|---|---|---|---|
| PostWire (https://postwire.io/, /pricing) | H1 "One idea in. A native post for every social network — published at once." | "Priced per business. Connect every network free." Free $0; Starter $19 (3 brands); Pro $29 (10 brands, "Unlimited · fair use 10,000"); Agency $99 (50 clients); Scale $299 (200 clients) | Per business, a $19 entry, never-double-post, dated approvals, Discord/Slack/Mastodon, TikTok and YouTube live | No delivery or retry claim for webhooks (only endpoint counts); X sold as marked-up credits; AI-writing-first positioning; USD only; nothing above 200 clients |
| PostPeer (https://postpeer.dev/) | "Unified Social Media API for Developers and AI Agents" | "Start with 20 free credits. No credit card required."; no price shown | The "20 free … no card" offer shape | Failure FAQ heading with no answer; no error pages on the home page; no pricing unit stated |
| Publora (https://publora.com/) | "The Social Media Scheduler Built for AI Agents." | "Pay per connected account"; "3 accounts free forever"; from $3.99/account/month yearly | — | Per-account billing: Siar's scale arithmetic applies |

**Implications** [inferred]:

1. PostWire is the closest analogue to Siar's planned positioning, and it is cheaper at 10 brands. Never put price at 10
   brands in a headline.
2. Siar's distinct ground against PostWire:
   - the documented webhook outcome and retry window;
   - verbatim errors with a public reference;
   - X at X's own price (held);
   - unlimited brands at $149;
   - ringgit;
   - the bundle.social switch (parked).
3. PostWire's builder wrote one of the 18 pool pages (CP 17, a dev.to price comparison "read from each pricing page").
   Send that author Siar's `/pricing.md`; do not attack PostWire.
4. Next teardown: PostWire first, then PostPeer, Publora and crosspostapi.com (competitors.md already lists them).

---

## 6. Page and content architecture

Seven layers. Every page names its slug, its cluster (keyword-map C-ID, or **NEW-S** for a page this strategy adds), its
job, and how it carries the idea. "Wave" is content sequencing by winnability (section 9).

### Layer 1: the spine (positioning pages; all exist)

| Slug | Cluster | Title (draft) | Purpose and how it carries the idea | Wave |
|---|---|---|---|---|
| `/` | C01 | "Unified social media API, every post accounted for \| Siar" (56 chars) | Owns "unified social media API". H1 stays "Write it once. Siar it everywhere." The lead is the canonical paragraph (2d). The first block under the hero is the four mechanisms, each linking to its proof. Replace the fake "Live" feed with a real, labelled example of a failed post: a 400 with `issues`, a network error relayed verbatim, the webhook payload | W0 fix, W1 retitle |
| `/pricing` | C06 | "Pricing: per organization, from $19 (RM39) \| Siar" | First line states the unit and the caps. H2s: free (honest), per organization, price lock, "retries and drafts don't count" (the idea in pricing terms). No competitor names (siar-truth rule 12) | W1 |
| `/platforms` | C03 | "Social media API networks: what is live today \| Siar" | A dated status table (Open / Opening after approval / Not open) driven from one constant, not the health endpoint. "Count what's live, not what's listed" is the idea applied to coverage | W0 |
| `/features` | C02 | "Social media scheduler and inbox on the same API \| Siar" | Dashboard buyer. The post timeline shows each network's outcome and error | W1 |
| `/about` | C07 | "About Siar and FF Dev Studio" | Company facts, SSM, live since 2026-10-12, approval dates. Drop "unified social media API" from the title (it cannibalises home) | W1 |
| `/how-publishing-works` | **NEW-S** | "What happens to a post: validation, sending once, errors, webhooks \| Siar" | **The canonical page for the idea.** One H2 per mechanism, each with a code-shaped example and a link to its reference. FAQ headings phrased as prompts: "What happens if a post fails on one network?", "How do I avoid double posting when I retry?", "How do I know a post was published?", "What happens when a token expires?", "Which networks are open today?" No search demand of its own (autocomplete 0 [measured]); it exists for AI citation, conversion and as the link hub | W1 |

### Layer 2: proof hubs (where the idea is shown, not said)

| Slug | Cluster | Purpose | Wave |
|---|---|---|---|
| `/errors` | C114 | Hub for 15 error pages and 147 codes, with a filter by network and by retry verdict (`retryable` / `non_retryable` / `unknown`, from `errors.ts`). Title must not reuse `/docs/errors` wording | W1 |
| `/platforms/approvals` | C04 | One dated row per network: applied, decided, outcome, what the network asked for. From `docs/approvals/`. Links to each gate guide | W1 (Meta, LinkedIn, Pinterest, YouTube rows); TikTok row is Fakhrul's call |
| `/platforms/limits` | C05 | Every per-network cap Siar enforces (daily posts, text, media), generated from `lib/networks.ts`, each with the network's source URL. Developers bookmark this | W2 |
| `/network-changes` | **NEW-S** | A dated log of network API changes, newest first, 80–150 words each, each linked to the affected topic page; network hubs show their latest 3 entries. Seed entries: LinkedIn 202511 sunset (2026-11-16), YouTube upload rule and quota change (2026-11-02), Buffer REST brownout and shutdown (2026-12-09 / 2027-02-01), Slack `conversations.history` limit for non-Marketplace apps (2025-05-29). Each from the network's own page. RSS and JSON feeds. Targets dated queries ("linkedin api version sunset", "youtube api upload limit") and gives engines a fresh, citable source | W1 seed, then weekly |
| `/compare/failure-handling` | **NEW-S** | "What happens when a post fails: 20 social media APIs compared (checked <date>)". Columns: validation before send; duplicate protection (key-based or automatic); error passthrough; webhook signing; documented retry window; outcome event on failure; delivery log or resend; dated per-network approval status. Every cell links the vendor's own docs. Says where rivals win (Zernio events and endpoints, PostWire idempotency, Ayrshare Validation API, Upload-Post media conversion). The linkable, criterion-changing asset (G1) | W2 (needs the comparison go and a fresh re-check of every cell) |

### Layer 3: the failure library, per network (the content engine)

Pattern for every **open** network: `/<net>-api` (hub) · `/errors` · `/limits` (H2 on the hub until it has 300+ words of
its own) · `/access` (the gate) · `/how-to-post` · topic pages where demand exists. Networks that are not open keep only
the hub with a status line, their errors page, and gate guides written as references.

**Rules for every library page:**

- Open with a 40–60 word answer.
- Show a visible "Checked <date>" and a source URL for every network fact.
- Add a "How Siar handles this" box of at most 3 lines, linking to the matching mechanism on `/how-publishing-works`.
- Say "generated from Siar's code" where that is true.
- Network hub titles move off the head term to the posting modifier (keyword-map §F).

| Network | Pages (slug → cluster) | Notes |
|---|---|---|
| Instagram | `/instagram-api` C64 · `/instagram-api/errors` C72 · `/instagram-api/publishing-limit` C68 · `/instagram-api/how-to-post` C65 · `/reels` C66 · `/stories` C67 · `/comments` C70 · `/insights` C71 · `/instagram-api/access-token` **NEW-S** ("instagram access token expired", "instagram api token expiration" return 3–4 completions [measured today]; shows the reconnect webhook) · `/instagram-api/dm` C73 HOLD | `/publishing-limit` first: the 100 vs 50 conflict on Meta's own page [sourced via PN] |
| Facebook | `/facebook-api` C74 · `/errors` C81 · `/facebook-api/meta-app-review` C76 · `/page-access-token` C77 · `/post-to-page` C75 · `/comments` C78 · `/reels` C79 · `/insights` C80 | `/meta-app-review`: dates from `docs/approvals/meta.md`; CTA "Siar's Meta app passed review on 2026-10-27, so your customers connect through it" |
| Threads | `/threads-api` C82 · `/how-to-post` C83 · `/errors` C84 | Limits H2: 250 posts, 1,000 replies, 100 deletes per 24 h [sourced via PN] |
| X | `/x-api` C85 · `/how-to-post` C86 · `/errors` C88 · `/x-api/pricing` C87 HOLD | 402 `CreditsDepleted` H2 first |
| LinkedIn | `/linkedin-api` C89 (company-page claim removed) · `/how-to-post` C90 · `/community-management-api` C91 · `/errors` C92 | **C92 is urgent**: version 202511 sunsets 2026-11-16 |
| Bluesky | `/bluesky-api` C106 · `/how-to-post` C107 · `/errors` C108 | Cheap, live |
| Mastodon | `/mastodon-api` C109 · `/errors` (fill with HTTP status guidance, or noindex) | |
| Discord | `/discord-api` · `/discord-api/schedule-messages` C110 · `/errors` | |
| Slack | `/slack-api` C112 · `/slack-api/rate-limits` C111 · `/errors` | |
| YouTube | `/youtube-api` (status line) · `/youtube-api/quota` C97 · `/youtube-api/audit` C98 · `/errors` C102 · `/shorts` C99 HOLD · `/how-to-upload` C100 · `/comments` C101 | Quota and audit now; Shorts after a recorded public upload |
| TikTok | `/tiktok-api` C93 (status line) · `/errors` C95 · `/tiktok-api/audit` C94 (Fakhrul's call) · `/how-to-post` C96 (W3, reference only) | Never "post to TikTok with Siar" |
| Pinterest | `/pinterest-api` C105 · `/pinterest-api/access` C103 · `/errors` C104 | |
| GBP, Reddit, Snapchat | hub with status line + errors only; `/google-business-profile-api/access` C113 (W3) | No how-to pages while parked |

### Layer 4: use cases (buyer jobs; exist unless marked)

| Slug | Cluster | Job, and how the idea enters | Wave |
|---|---|---|---|
| `/use-cases/multi-tenant-social-media-api` | C11 | **The main conversion page for SaaS builders.** Retitle "Social media API for SaaS: multi-tenant by design". Lead: "Your customers' posts, accounted for; your bill doesn't grow with your customers" (G5 scenario) | W1 |
| `/use-cases/hosted-connect-oauth` | C12 | Retitle "Social media OAuth API: a branded connect link". Reconnect detection is the idea here. Never "white-label" | W1 |
| `/use-cases/social-media-webhooks` | C16 | Owns "social media webhooks". Retry schedule, signature, outcome-on-failure, resend | W1 |
| `/use-cases/social-media-comments-api` | C15 | Comments on 8 networks; DMs as beta wording | W1 |
| `/use-cases/link-in-bio-api` | C18 NEW | G10 | W1 |
| `/use-cases/social-media-posting-api` | C09 | Validation and sent-once H2s | W2 |
| `/use-cases/social-media-scheduling-api` | C10 | "What happens at 9 a.m. if it fails" H2 | W2 |
| `/use-cases/social-media-analytics-api` | C14 | Paid plans only | W2 |
| `/use-cases/social-media-api-for-ai-agents` | C13 | Angle: "an agent needs to know whether its post went out": a REST call plus the webhook. No install lines until npm | W2 |
| `/use-cases/social-media-api-for-agencies` | C17 NEW | After the accounts-wording decision | W2 |
| `/use-cases/social-media-inbox-api` | C19 NEW | DMs as beta wording | W2 |
| `/use-cases/comment-to-dm-api`, `/use-cases/video-publishing-api` | C20, C21 | HOLD | — |
| `/use-cases` | C08 | Retitle "What you can build with a social media API" | W1 |

### Layer 5: guides

| Slug | Cluster | Purpose | Wave |
|---|---|---|---|
| `/guides/idempotent-social-media-posting` | C24 | **The idea as a tutorial.** Retitle "How to stop duplicate posts when retrying a social media API". Covers key-based approaches (and that rivals offer them) and Siar's automatic claim + reconciliation | W1 |
| `/guides/post-to-multiple-social-networks-api` | C22 | Thin SERP; per-network outcome handling as an H2 | W1 |
| `/guides/post-to-bluesky-mastodon-threads-api` | C23 | p010 | W1 |
| `/guides/post-release-notes-from-ci` | C25 | p049; exit codes on failure | W1 |
| `/guides/social-media-api-pricing` | C26 | The price-line proof: per profile vs per account vs per delivery vs per organization, with dated scenarios at 1, 10, 50 and 500 brands. Leads with the 500-brand scenario. H2 "Do retries and failed posts cost you?" (Outstand bills failed deliveries; Siar does not count retries [sourced: outstand.md; doc]) | W1 |
| `/guides/social-media-api-integration` | C27 | Build vs buy, using Siar's own approval records as the evidence of cost | W2 |
| `/guides/n8n-threads-posting`, `/guides/n8n-social-media-posting`, `/guides/n8n-instagram-posting` | C32, C30, C31 | Each recipe includes "branch on the failure" using the error verdict | W1 / W2 / W2 |
| `/guides/manage-social-media-for-multiple-clients` | C35 | | W2 |
| `/guides/ai-agent-linkedin-posting` | C34 | Profiles only | W2 |
| `/guides/what-is-a-unified-social-media-api` | C28 | H2 "What a unified API should do when a network says no" plants the criterion in the definitional answer | W2 (moved up from W3: the definition is where engines learn the criteria [inferred]) |
| `/guides/best-social-media-apis` | C29 | Own listicle, stated method, includes the failure-handling columns, does not rank Siar first | W3 |
| `/guides/why-scheduled-posts-fail` | **NEW-S** | G8: consumer/dashboard demand, mapped to causes (token expired, media rejected, rate limit, permission) and to the error pages | W3 |
| C33, C36–C40 | — | As in keyword-map | W3 |
| C41–C45 | — | MCP and Claude pages: HOLD until npm | — |

### Layer 6: comparisons (all need the comparison go; every competitor cell has the vendor URL and "checked <date>")

| Slug | Cluster | Lead angle (true today) | Concede | Wave |
|---|---|---|---|---|
| `/compare` | C46 | Hub; links to `/compare/failure-handling` first | — | W1 |
| `/compare/buffer-api` | C50 | Your customers don't need Buffer accounts; webhooks; dated REST shutdown | Free plan, networks, hosted MCP | **W1, before 2026-12-09** |
| `/compare/hootsuite-api`, `/compare/metricool-api`, `/compare/publer-api` | C51, C53, C54 | Drafts-only or tier-gated APIs; no outbound webhooks | Analytics depth, networks | W1 |
| `/compare/sprout-social-api` | C52 | Publishing is "Draft status" only, from $399/seat | Listening, enterprise | W2 |
| `/compare/ayrshare` | C47 | Per business vs per profile; Discord/Slack/Mastodon; HMAC on by default, longer retry window | Networks, hosted MCP, unlimited posts. No X row until the X terms are read | W2 (directories carry W1) |
| `/compare/zernio` | C48 | Per organization vs per account at 100 and 1,000 accounts; price lock | Free for 2 accounts, networks, SDKs, events count | W2 |
| `/compare/upload-post` | C49 | Webhooks retried vs "sent once"; verbatim errors vs `success: true` with a fallback flag | Price under 75 brands, networks, media processing | W2 |
| `/compare/blotato`, `/compare/postiz`, `/compare/outstand`, `/compare/mixpost` | C55–C58 | Per keyword-map | Per keyword-map | W2–W3 |
| `/compare/postwire` | **NEW-S, HOLD** | Only after a teardown; low brand demand [unverified] | Most of section 5 | — |
| `/compare/duta`, `/compare/zoho-social`, `/compare/meta-business-suite` | competitors.md §8, C62, C61 | Ringgit with an API and brands; RM39 entry | Duta: posts and multiple accounts per network | W2–W3 |
| `/compare/bundle-social`, `/guides/migrate-from-bundle-social` | C59, C60 | PARKED | — | — |

### Layer 7: Malaysia

`/malaysia` (C115, W1), `/guides/social-media-management-cost-malaysia` (C116, W2), and the BM test set
`/ms/cara-schedule-post`, `-instagram`, `-facebook`, `-threads`, `/ms/cara-auto-post-facebook-instagram`,
`/ms/cara-buat-link-bio`, `/ms/harga` (C121–C127, W1, with keyword-map's 8–12-week kill rule).

The idea carries into BM as **"Tahu apa jadi pada setiap post"** ("know what happened to every post"), shown as the
post timeline. That phrasing is my suggestion, not tested.

### Pages to fix, not add

- **Docs titles:** follow current-site §6 (for example "Webhook signatures and retries | Siar API docs").
- **`/docs/webhooks`:** say plainly that `post.published` also fires on failure. Rename the event in prose only; the wire
  name must stay for compatibility.
- **`app.siaran.my`:** noindex.
- **`/pricing.md`:** serve as `text/markdown`.
- **`/mastodon-api/errors`:** fill it or noindex it.

---

## 7. Internal linking

The graph has one centre for the idea (`/how-publishing-works`), one for the category term (`/`), and one per network
(the hubs). Library pages feed upward. Commercial pages pull from the proof.

1. **Up-links.** Every library page links to its network hub in the first paragraph and to the matching proof hub:
   - error pages → `/errors`;
   - access pages → `/platforms/approvals`;
   - limit pages → `/platforms/limits`;
   - change entries → `/network-changes`.
2. **Mechanism links.** Each "How Siar handles this" box links to one anchor on `/how-publishing-works` (`#checked`,
   `#sent-once`, `#errors`, `#webhooks`, `#reconnect`), using the mechanism as the anchor text ("checked before it's
   sent"). Those few anchors repeat across about 100 pages, so they define the entity [inferred].
3. **Category anchor.** Each network hub links to `/` once, in its lead, with the anchor "unified social media API". No
   other page uses that exact anchor. This protects home as the owner of the head term and stops `/about` competing
   (current-site §8).
4. **Use case ↔ docs.**
   - Each use case links to its docs guide and API tag ("reference").
   - Each docs page links back to the use case with the commercial anchor ("social media webhooks API").
   - This settles the cannibalisation listed in current-site §8.
5. **Compare pages:**
   - Each links to `/guides/social-media-api-pricing` (scenario), `/compare/failure-handling` (criteria), `/platforms`
     (status) and the `/compare` hub.
   - `/pricing` never links to a compare page (rule 12).
6. **Network changes ↔ topic pages.** Each entry links to the affected page. Each hub shows its latest 3 entries from
   the same data file.
7. **Footer** (site-wide) adds:
   - `/how-publishing-works`, `/errors`, `/platforms/approvals`, `/compare`, `/malaysia`;
   - the four orphaned use cases (analytics, comments, webhooks, hosted connect).
8. **Minimum in-links.** No page ships with fewer than 3 contextual in-links. The new layer-2 hubs get links from home
   and every network hub on day one.
9. **Breadcrumbs and schema.** BreadcrumbList on every page (Home › Platforms › Instagram API › Errors). TechArticle with
   visible `dateModified` on library pages.
10. **Anchor hygiene.**
    - Descriptive anchors only.
    - At most one exact-match anchor per target per page.
    - Never link to a page that is not yet indexed from a page that does not exist yet. Ship the hub with its spokes.

---

## 8. Winning AI answers and head terms, long-term

**The mechanism** [inferred from `ai-answers.md`]:

- **Commercial prompts.** Engines answer "best / alternatives / cheapest" from about 20 vendor roundups, and Siar is on
  0 of the 18 fetched. Two levers work there: getting a row into those roundups, and changing the columns they use.
- **How-to and troubleshooting prompts.** Engines cite reference pages. Siar already has the content; indexing is the
  blocker.
- **Head terms.** These follow authority. For a developer tool, authority comes from reference content that others
  link to: error codes, quotas, gate guides, change logs and an open dataset. That is the failure library.

**Rules for every page:**

1. The first 40–60 words answer the page's question and name Siar with its category ("Siar, a unified social media API").
   Never "it".
2. Name the brand and the category together: "Siar social media API". The name collides with SiAR (a Spanish irrigation
   API) and siar.my (a film service) [measured, current-site §4].
3. Show dates: "Checked <date>" for network facts and "Updated <date>" for pages, with the same date in JSON-LD.
4. One fact source. `/llms.txt`, `/pricing.md`, the home FAQ, `/about` and the GitHub README carry the canonical paragraph
   (2d) and the status line, generated from the same constants.

**The prompts the idea wins, and where:**

| Prompt (prompts_v1) | Page that should earn it |
|---|---|
| p018 (webhooks when a post is published) | C16 + `/how-publishing-works#webhooks` |
| p045 (avoid double posting on retry) | C24 |
| p038–p042 (exact error codes) | error pages |
| p012 (Instagram without a Meta app) | C76 + C64 |
| p004 and p050 (SaaS, multi-tenant) | C11 |
| p006 (per organization) | C26, honest about shared |
| p033 (which networks) | `/platforms` |

**Add a frozen `prompts_v2.csv` for the positioning** (leave v1 untouched). Score each run on whether Siar is named and
whether the answer repeats the mechanism. Candidate prompts:

- "what happens if a social media API post fails"
- "social media API with reliable webhooks"
- "which social media API retries webhooks"
- "social media API that prevents duplicate posts"
- "social media API that returns the platform's error message"
- "which social media APIs are approved for Instagram publishing"
- "what changed in the LinkedIn API in November 2026"
- "is there a list of Instagram API error codes"

**Head terms** ("social media api", "unified social media api", "social media posting api"):

- Do not chase them with new pages.
- Home and C09 own them.
- Rank arrives through the library's in-links and through off-site mentions that use the canonical paragraph.
- Expect long-term, 6–12 months+ (keyword-map wave 3).

---

## 9. Sequencing (content only, by winnability)

Fakhrul builds the product all at once. This orders *content and off-site*, by how soon each item can rank or be cited.

| When | Content and off-site | Why this order |
|---|---|---|
| **Now (days)** | All of wave 0: hero demo, "Live" feed, "15 networks", calculator default, `npx` lines, glued H1s, status lines, LinkedIn company-page claim, GitHub description. Verify GSC and BWT. IndexNow | The idea cannot ship next to fakes |
| **Now (days)** | C92 LinkedIn 426 / 202511 note | Sunset 2026-11-16 |
| **Weeks 1–2** | `/how-publishing-works`, `/platforms` status + `/platforms/approvals`, `/errors` hub + error-page H2 upgrades, `/network-changes` (4 seed entries), home and hub retitles with the canonical paragraph, C16 and C24 | Establishes the idea's centre and its proof before any outreach points at it |
| **Weeks 1–4** | `/compare/buffer-api` (before 2026-12-09), C76 Meta App Review, C97/C98 YouTube quota and audit, C26 pricing explainer, C11 SaaS retitle, C18 link-in-bio, Threads/Bluesky/Mastodon/Slack pages, C22, C23, C25, C32, `/malaysia` + BM test | Thin SERPs and dated triggers |
| **Weeks 2–6, off-site** | Directory listings; open error catalogue repo; first-hand Meta write-up; roundup pitches (only after the site is clean) | Section 10 |
| **Months 2–6** | Instagram cluster (C68 first), `/instagram-api/access-token`, LinkedIn C90/C91, Pinterest C103, `/platforms/limits`, `/compare/failure-handling`, compare pages for Ayrshare, Zernio, Upload-Post, Hootsuite, Metricool, Publer and Sprout, C27, C28, n8n hub and Instagram, agencies and inbox use cases | Medium SERPs; needs the in-links built above |
| **Months 6–12** | Head-term pushes on `/` and C09; C29 own listicle; `/guides/why-scheduled-posts-fail`; English dashboard how-tos; MCP layer once npm is published | Authority-bound |

---

## 10. Off-site plan

Ordered by expected effect on AI answers per hour of work [inferred]. Rules for all of it:

- Real activity under the real name.
- Affiliation disclosed.
- No paid listicles, review swaps or self-ranked lists that put Siar first.
- Every item needs Fakhrul's go where `owner-todo.md` says so.

| # | Action | What it carries | Link target | Gate |
|---|---|---|---|---|
| O1 | **Fix the fact surfaces:** GitHub README and description ("built for 15 networks", the canonical paragraph), and the FF Dev Studio project page that Copilot cites (ffdev.studio/projects/siar) | The entity sentence | `/`, `/platforms` | None (but the copy goes live, so his go) |
| O2 | **Open error catalogue:** a public GitHub repo (`siar-social-api-errors` or similar) with every code from `errors.ts` as JSON + Markdown. Each entry carries the network's verbatim message, Siar's category, the retry verdict and the fix, and links to the error page. Permissive licence | "The parts that break" as a dataset developers star, fork and link. GitHub is heavily cited for developer queries [sourced in offsite-plan.md] | `/errors` | Fakhrul's go (it exposes code-derived content) |
| O3 | **Directory listings:** AlternativeTo, G2, Capterra/GetApp, SourceForge, Product Hunt. Category "social media API"; alternative to Ayrshare, Zernio and Upload-Post (not bundle.social while the naming decision is parked). Description = the canonical paragraph | These sites hold Google's top 5 for "ayrshare alternatives" [measured once, AV1] | `/`, `/compare/ayrshare` later | Comparison/directory go |
| O4 | **Roundup pitches** to the maintained pool: Buffer, Blotato, Upload-Post, Zernio, PostPlanify and Ayrshare (CP 1–5, 7), plus the CP 17 dev.to price comparison author. Send a factual row (networks open today, entry price, unit, webhooks, free tier, MCP "not yet published") and offer the failure-handling columns with `/compare/failure-handling` as a source | Inclusion + new criteria | `/compare/failure-handling`, `/pricing.md` | Fakhrul's go; only after wave 0 |
| O5 | **First-hand gate write-ups:**<br>• "Meta App Review: submitted 2026-10-14, approved 2026-10-27 after a resubmission" [doc]<br>• "LinkedIn Community Management: denied, no reason given" [doc]<br>• YouTube audit waiting since 2026-10-15 [doc]<br>• TikTok rejection (Fakhrul's call)<br>Canonical on siaran.my, syndicated to dev.to with `rel=canonical`, posted on the FF Dev Studio LinkedIn | Expertise, plus the honest-status angle | C76, C91, C98, `/platforms/approvals` | Fakhrul's go per story |
| O6 | **Answer the failure questions where they are asked:** Stack Overflow ("Permanent Page Access Token?" has 208k views [measured in buyers-pains.md]), the n8n community forum, GitHub Discussions of network SDKs. Answer first; link a Siar error, limit or gate page only when it *is* the answer. A few a week. Never in a rival's issue tracker | Citations from the sources engines trust for troubleshooting | Library pages | None beyond disclosure |
| O7 | **OpenAPI directories:** list `https://siaran.my/openapi.json` where API catalogues accept public specs (for example the Postman API Network or APIs.guru) [inferred; acceptance rules unverified] | "Checkable artefact" proof | `/docs/api` | Fakhrul's go |
| O8 | **Network-changes syndication:** the `/network-changes` RSS feed, plus a short LinkedIn post per major change (LinkedIn version sunsets, YouTube quota, Buffer shutdown) | Freshness; journalists and newsletter writers link change logs [inferred] | `/network-changes` | None |
| O9 | **Video:** a 2–3 minute "what happens when a post fails" walkthrough. It shows a 400 with `issues`, a verbatim network error and the webhook delivery log, using mock networks and no fake networks shown as "Posted" (CLAUDE.md: real posts need his yes) | The idea, shown | `/how-publishing-works` | Fakhrul's go |
| O10 | **After npm publish:** the official MCP registry, PulseMCP, Glama, mcp.so and awesome-mcp-servers; then the MCP pages (C41–C45) | Unblocks the AI/MCP prompt cluster | `/docs/sdk-cli-mcp` | npm decision |
| O11 | **Malaysia:** the FF Dev Studio channels; local directories and communities are **unresearched** (Lowyat and FB groups were unreachable in every sweep) | Ringgit trust line | `/malaysia` | Research first |

**Not doing:**

- Wikipedia or Wikidata (not notable yet).
- Paid placements.
- "Best API" lists that rank Siar first.
- Seeding reviews.
- Posting in rivals' GitHub issues.
- A BM site beyond the 7-page test.

---

## 11. What to say and never say

### Say (all allowed by siar-truth)

| Context | Line |
|---|---|
| Headline | "Unified social media API. Every post accounted for." |
| Mechanism | "Checked against each network's rules before it's sent." · "Each network gets your post once." · "If a network says no, you get its own code and message, plus the fix." · "A signed webhook tells you how it went, retried for about 45 hours." · "Disconnected accounts are flagged before your next post fails." |
| Price | "Priced per organization: no per-account fees. From $19 a month, RM39 in Malaysia. Unlimited brands on Business, $149 (RM399)." "A post sent to every connected network counts as one post. Drafts and retries don't count." "Your price never goes up while you stay subscribed." |
| Free | "20 free posts to try. No card." |
| Status | "Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack. Built for 15; the rest open as each network approves Siar." |
| Meta | "Facebook, Instagram and Threads connect through Siar's Meta app, which passed App Review on 2026-10-27, so your customers don't need your own." |
| Connect | "A branded connect link (your name, logo, colour). Customers sign in to each network themselves; you never touch a password or token." |
| Company | "FF DEV STUDIO, SSM 202603234793, Malaysia." |
| Comparison posture | "Where <rival> is the better buy" as an H2 on every compare page |

### Never say

| Never | Why |
|---|---|
| "Never fails", "guaranteed delivery", "100% delivery", "zero duplicates across N posts", any rate | Design guarantees, not measurements (siar-truth §4–5) |
| "Reliable", "enterprise-grade", "production-proven" as bare adjectives | Unproven. Name the mechanism instead |
| "The parts that break are ours" in public copy without the mechanism next to it | It reads as an uptime or approval promise. Keep it as the internal brief; in public, at most as a section heading followed by the list |
| Uptime, SLA figures, customers, logos, testimonials, "trusted by", usage counts | siar-truth §5 |
| "Pay per business" as a claim of uniqueness; "the only per-organization API" | PostWire, bundle.social, SocialAPI.ai and Postproxy [sourced] |
| "Unlimited accounts" without the per-brand rule, until Fakhrul rules | `schema.prisma` one-per-network-per-brand (competitors.md §7b) |
| "Cheapest", "first", "only" (including "only Malaysian") | False or Duta's claim |
| "15 networks" bare, "every network", "all networks" | 9 open |
| "Skip the approvals" (non-Meta), "Meta partner", "approved by Meta" as a badge | siar-truth §5; market.md §8e |
| "For AI agents" as the lead; any `npx`/`npm i` line | Saturated; not on npm |
| "White-label" | "Powered by Siar", English only |
| "Free plan", "free forever", "20 posts" bare | One-time |
| X "at cost" in ringgit; X credits as an advantage | 4.20 buffer; service-bureau clause unread |
| bundle.social by name | Parked |
| A rival's complaint quote not opened by hand; a rival's price without URL and date | competitors.md §7c |
| "Sent once per post per network" for `post.published` | Code emits per post on final state; reconcile first (section 2a) |

---

## 12. Decisions this strategy depends on

Most are already listed in competitors.md §7b and keyword-map §2. Only the ones that change *this* strategy:

1. **Adopt "Every post accounted for" as the positioning.** It changes the home title, the lead, the
   `/how-publishing-works` page and every pitch.
2. **Accounts wording.** The price line uses "no per-account fees" until decided.
3. **Comparison go.** This unlocks `/compare/failure-handling`, the asset that changes roundup criteria.
4. **Open-sourcing the error catalogue** (O2).
5. **Publishing the approval stories** (O5; TikTok separately).
6. **Commission a PostWire teardown** before any compare page.
7. **The `post.published` docs fix** (code/docs owner; not a positioning call, but the idea quotes it).

---

## 13. How to tell it is working

All of these depend on GSC, BWT and the visibility sheet existing; none exist yet [measured, owner-todo.md].

| Signal | Source | Target direction |
|---|---|---|
| Engines describe Siar with a mechanism ("returns the network's error", "retries webhooks") instead of "15 networks" or a wrong price | prompts_v1 p031–p033 + prompts_v2, monthly | Mechanism named in most branded answers |
| Siar named in roundup pool pages | Re-fetch the CP pages monthly | From 0 of 18 to any |
| A roundup adds a failure-handling or webhook column | Same | Any |
| Impressions on error, limit, access and change pages | GSC/BWT | Library carries most early non-brand impressions |
| Branded queries pairing "siar" with "social media api" | GSC | Rising; SiAR and siar.my collisions falling |
| Stars, forks and inbound links to the error catalogue | GitHub | Any |

---

## Sources

**Fetched this pass (2026-11-12):**

- https://postwire.io/ and https://postwire.io/pricing (PostWire positioning, per-business pricing, X credits, dated approvals, idempotency)
- https://postpeer.dev/ (title, "20 free credits", unanswered failure FAQ)
- https://publora.com/ (per-account pricing, AI-agent positioning)
- https://bundle.social/ (title "Unified Social Media API, Unlimited Social Accounts", per organization, proof numbers)
- https://docs.upload-post.com/api/webhooks ("each event is sent once", not retried)

**Autocomplete (Google, measured 2026-11-12, about 40 seeds; no further probes after the search refusal):**

- Zero completions: "social media api per", "…duplicate", "…webhook", "…without", "…approval", "…unlimited", "…reliable", "…for saas", "…agency", "social media posting api cheap", "social media api comparison", "social media api malaysia".
- Rich completions: "meta app review" (10), "post failed to publish" (10), "why did my scheduled post" (10), "scheduled post not posted" (7), "instagram api token expired" (4), "social media api" (10), "social media api for" (8), "ayrshare" (10), "zernio vs" (10), "postiz api" (10), "bundle.social" (10), "social media mcp" (10).

**Siar code and docs** (checkout `/Users/fakhrul/Desktop/dev/Siar-seo-research`):

- `apps/api/src/engine/publisher.ts`
- `apps/api/src/engine/webhooks.ts`
- `apps/api/src/platform/events.ts`
- `apps/site/src/lib/events.ts`
- `packages/networks/src/lib/errors.ts`
- `docs/approvals/README.md`, `meta.md`, `meta-review-submission.md`

**Sibling research:**

- `docs/seo/competitors.md`
- `docs/seo/keyword-map.md`
- `docs/seo/market.md`
- `docs/seo/research/siar-truth.md`
- `docs/seo/research/current-site.md`
- `docs/seo/research/keywords/ai-answers.md`
- `docs/seo/research/competitors/*.md` (vendor URLs per cell)
- `docs/geo/plan.md`, `offsite-plan.md`, `owner-todo.md`, `prompts_v1.csv`
