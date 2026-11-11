Verified 2026-11-12: 12 corrections

> **Verification pass (2026-11-12).** Every vendor fact in section 1 was re-opened on the vendor's own page; the
> Siar facts were checked against `docs/approvals/*`, `siar-truth.md` and the adapter code. Fixed: Meta review dates,
> TikTok caps (TikTok does publish them), Pinterest access tiers (the page loads now), a wrong row reference, two
> over-strong labels, one false claim about which gates Siar went through, the YouTube bucket date, a miscount (118 → 119 unmeasured SERPs), and the
> Instagram "nobody explains the conflict" angle (bundle.social already does); the Ayrshare 25 / Later 50 claims are now unverified. **Not re-checked:** the SERP orders
> ("Top 5 now") and the autocomplete counts. The shared search budget was used up before this pass could re-run any
> query, so every SERP and AC figure below is a single run by the original author: treat as **unverified** until
> re-run.

# Per-network API keywords: Siar

Checked 2026-11-12. Builds on `docs/geo/plan.md` (P3 "per-network how to post" item), `docs/seo/research/current-site.md`
(inventory, indexing, section 5 gaps) and `docs/seo/research/siar-truth.md` (what Siar may claim). It does not redo them.

## How to read this

Labels: **[measured]** I saw it · **[sourced]** vendor's own page, URL given, checked 2026-11-12 · **[doc]** Siar's own
repo records (owner notes, not independent proof) · **[inferred]** my judgement.

- **Demand** (H/M/L) is always [inferred]. There is no volume tool. Evidence used:
  - **AC** = Google autocomplete, measured 2026-11-12 via `suggestqueries.google.com` (hl=en, gl=us), 145 seeds.
    "AC 10" = the seed returns 10 completions; "AC 0" = none. "AC child of X" = this phrase is itself offered as a
    completion when typing X, which means people type it often enough for Google to suggest it.
  - Competitor page targeting: which vendors built a page or blog post for the phrase (from the competitor files in
    `docs/seo/research/competitors/`).
- **Top 5 now**: measured for 9 queries with the WebSearch tool (US results, engine not Google, order as returned,
  distinct domains), plus 3 DuckDuckGo checks already in `current-site.md` (top 3 only). **The shared search budget ran
  out after 9 queries**, so every other row says "n/m" (not measured) and gives the *likely* rankers from competitor
  page targeting, labelled [inferred]. These rows need a SERP check before a page is built.
- **Win** (realistic for siaran.my, a one-month-old domain that ranks only for its own name today): **weeks** /
  **months** / **long** (6–12+ months, needs links) / **unlikely**. Always [inferred].
- **Siar page**: an existing URL from https://siaran.my/sitemap-0.xml (89 URLs, fetched 2026-11-12) or a **NEW** slug.
  New slugs follow one pattern, `/<net>-api/<topic>`, so each network page becomes a hub with its own cluster.
- **Claim limits** (from `siar-truth.md`): Siar can sell publishing on Facebook, Instagram, Threads, X, LinkedIn
  *profiles*, Bluesky, Mastodon, Discord and Slack. TikTok, YouTube public uploads, Pinterest publishing, LinkedIn
  company pages, Reddit, Snapchat and Google Business Profile are built but **not open**. Rows for those networks are
  marked **guide only**: the page explains the native API honestly and never says "post to <network> with Siar".

---

## 1. The pain map: what each network makes developers go through

This is the hook for every page. Each line is the native network's rule, from the network's own page.

| Network | Gate (approval) | Quota / limit | Price | Fresh change worth a page |
|---|---|---|---|---|
| **Instagram** | Professional account; permissions `instagram_business_content_publish` (Instagram Login) or `instagram_content_publish` (Facebook Login); Page Publishing Authorization can block publishing [sourced: developers.facebook.com/docs/instagram-platform/content-publishing] | "100 API-published posts within a 24-hour moving period"; a carousel counts as one; carousels up to 20 items. **The same page also says "50 published posts within a 24-hour period"** in its carousel section [sourced, same URL] | No fee [inferred: no price on Meta's page] | Meta's own page contradicts itself (100 vs 50). Third parties were seen in the SERP saying 25 (Ayrshare, "Error 9") and 50 (Later help) [third-party, **unverified**: Later's help page returns 403 and no Ayrshare "Error 9" URL was found on re-check]. bundle.social's `/blog/instagram-api-rate-limits` already explains the 100 vs 50 conflict and says 25 is not in Meta's docs [measured] |
| **Facebook** | Pages only: `pages_manage_posts`, `pages_read_engagement`, `pages_manage_engagement`, `pages_read_user_engagement`, `publish_video` for video, Page access token [sourced: developers.facebook.com/docs/pages-api/posts]. App Review / Advanced Access for other people's Pages [inferred from Meta's docs structure; Siar's own review: submitted 2026-10-14, approved 2026-10-27 after a resubmission that day, doc: `docs/approvals/meta-review-submission.md`, `meta.md`] | not checked | No fee [inferred] | Meta App Review is a pain on its own (bundle.social has `/meta-app-review-rejected` and "meta-app-review-20-days") |
| **Threads** | `threads_basic` + `threads_content_publish` (+ `threads_manage_replies`, `threads_delete`) [sourced: developers.facebook.com/docs/threads/overview] | 250 API-published posts, 1,000 replies, 100 deletions per 24 h moving window; `GET /{id}/threads_publishing_limit` [sourced, same URL] | No fee [inferred] | — |
| **X** | None; credits bought in the Developer Console [sourced: docs.x.com/x-api/getting-started/pricing] | 3 million post reads per monthly billing cycle on pay-per-usage; above that, Enterprise [sourced, same URL] | **Pay-per-usage, "No subscriptions"**: create post $0.015, post with URL $0.200, post read $0.005, user read $0.010, owned reads $0.001; $20 credit after first card + purchase; spending limits block requests at the cap [sourced, same URL]. Basic/Pro tiers are not mentioned on the page [measured] | Pay-per-use replaced the monthly tiers; "x api pay per use", "x api credits depleted", "x api 402" are live autocomplete phrases [measured]. **Risk:** Ayrshare argues a provider that holds one X app and bills customers for X usage breaks X's "service bureau" clause since 2026-03-31 [third-party: ayrshare.com/blog/x-api-compliance-byo-app/, unverified against X's terms; see `competitors/ayrshare.md`] |
| **LinkedIn** | Profiles: "Share on LinkedIn" is self-serve, gives `w_member_social` [sourced: learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin]. Company pages: Community Management API is a "Vetted Product" with Development and Standard tiers; Standard needs a screencast per use case; must be requested on a new app with no other products; `r_member_social` is closed [sourced: learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview] | Share on LinkedIn: 150 requests/member/day, 100,000/app/day [sourced, share page]. CM Development tier: 500 per app, 100 per member [sourced, CM page] | No fee [inferred] | Marketing version 202511 sunsets 2026-11-16 [sourced, CM page]. Siar's own CM dev-tier request was **denied, no reason** [doc] — the pain is first-hand |
| **TikTok** | Content Posting API: "All content posted by unaudited clients will be restricted to private viewing mode"; an audit lifts it [sourced: developers.tiktok.com/doc/content-posting-api-get-started]. Error `unaudited_client_can_only_post_to_private_accounts` blocks at `/publish/video/init/` [sourced: developers.tiktok.com/doc/content-posting-api-reference-direct-post] | "Each user access_token is limited to 6 requests per minute"; a per-user daily post cap (`spam_risk_too_many_posts`) and a daily active-user cap (`reached_active_user_cap`) exist; the direct-post page gives no numbers [sourced, direct-post page]. TikTok's own guidelines do give numbers: "Unaudited API Clients can allow up to 5 users to post in a 24 hour window", accounts must be private, `SELF_ONLY` only; the creator cap is "typically around 15 posts per day" [sourced: developers.tiktok.com/doc/content-sharing-guidelines] | No fee [inferred: none published] | Siar's own audit was **rejected 2026-10-20** (films must be hand-recorded) [doc]. Audit criteria are not public [third-party: postproxy.dev, via SERP] |
| **YouTube** | OAuth verification for sensitive scopes [doc]. Quota extension by form [sourced: developers.google.com/youtube/v3/getting-started] | 10,000 units/day for most endpoints **plus a separate bucket: 100 `videos.insert` calls per day** (1 unit each) and 100 `search.list` [sourced: getting-started; developers.google.com/youtube/v3/docs/videos/insert] | No fee [inferred] | **2026-11-02: "Videos uploaded through the videos.insert method from unverified API projects are no longer restricted to private viewing mode."** This reverses the 2020 rule [sourced: developers.google.com/youtube/v3/revision_history]. 2026-11-03: custom thumbnails for Shorts [sourced, same]. Almost every ranking "upload private" / "quota 1,600 units" page is now out of date [inferred] |
| **Pinterest** | Trial access is reviewed at registration; sandbox for test calls; test tokens expire after 24 h [sourced: developers.pinterest.com/docs/getting-started/connect-app/]. Trial: "all Pins and Boards created with Trial access are only visible to their creator as Sandbox entities"; rate-limited per app per day. Standard: needs Trial first plus a demo video of the OAuth flow and a live integration (required even for a sole user); submitted via "Upgrade" on the app card [sourced: developers.pinterest.com/docs/key-concepts/access-tiers/]. Siar's adapter: Trial "cannot create public pins" [code: `pinterest.ts` line 42] | Trial: per app per day; Standard: per minute, per user and per app [sourced, access-tiers page]; exact numbers not checked | No fee [inferred] | "pinterest api trial access denied" is an autocomplete phrase [measured] |
| **Reddit** | **Unverified on Reddit's pages** (support.reddithelp.com returned 403; reddit.com refused the fetcher). Siar's notes: self-serve tokens for new apps ended Nov 2025, every new app is reviewed by hand, commercial use needs separate written approval [doc: `docs/approvals/reddit.md`, owner note] | unverified | unverified (the commonly quoted per-call price is third-party) | Autocomplete has "reddit api access request form", "reddit api access request how long", "reddit api access 2026" [measured] |
| **Bluesky** | None (no app review, no key) [doc]. | 5,000 points/hour and 35,000/day per account; create = 3 points → "at most 1,666 records per hour and 11,666 records per day" [sourced: github.com/bluesky-social/bsky-docs, file docs/advanced-guides/rate-limits.md, the source of docs.bsky.app] | Free [inferred] | — |
| **Mastodon** | None (per-server OAuth app) [doc] | 300 requests/5 min per account and per IP; media uploads 30 per 30 min; status deletes 30 per 30 min [sourced: docs.joinmastodon.org/api/rate-limits/] | Free [inferred] | — |
| **Discord** | None below 100 servers [doc, not checked on Discord's page] | 50 requests/s global per bot; 10,000 invalid requests per 10 min before an IP ban [sourced: docs.discord.com/developers/topics/rate-limits] | Free [inferred] | — |
| **Slack** | Public distribution; Marketplace optional [doc] | Since 2025-05-29, new non-Marketplace commercial apps get `conversations.history` / `conversations.replies` at 1 request/min, 15 objects [sourced: docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps]. `chat.postMessage` not mentioned there | Free [inferred] | Comment import in Siar is slow for this reason [doc] |
| **Google Business Profile** | Access form "Application for Basic API Access"; profile "verified and active for 60+ days"; a website on the profile; quota 0 QPM until approved, 300 QPM after [sourced: developers.google.com/my-business/content/prereqs] | 300 QPM once approved [sourced] | Free [inferred] | FF itself is not eligible, so Siar is parked [doc] |
| **Snapchat** | Public Profile API is allowlist-only: OAuth app from Ads Manager → Business Details, then email a Snap contact the client ID [sourced: developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted]. That page describes reads only; Siar's adapter cites publishing endpoints (Stories, Spotlight, Saved Stories) from other Snap pages [code: `snapchat.ts` lines 2–36] | not checked | not published | No partner contact = no access. Pure gatekeeping |

**Pattern [inferred]:** the pain splits three ways. (1) *Approval* is the wall for TikTok, LinkedIn pages, Pinterest,
Reddit, Google Business and Snapchat. (2) *Quota and caps* for Instagram, Threads, YouTube and TikTok. (3) *Price* is a
direct pain only on X. Bluesky, Mastodon, Discord and Slack have little pain to sell against, so their pages should sell
convenience (one call, same shape as the other networks), not rescue.

---

## 2. Keyword table

Columns: **Intent** I = informational, C = commercial, T = transactional, N = navigational. "n/m" = SERP not measured.

### Cross-network

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 1 | social media api approval by platform | I/C | L–M. No AC tested for exact phrase; Outstand has `social-media-api-approval-by-platform` [competitors/outstand.md] | n/m · likely outstand.so, bundle.social blog [inferred] | months | comparison table of the gates in section 1 | NEW `/platforms/approvals` (or a section on `/platforms`) |
| 2 | social media api rate limits by platform / posting limits per day api | I | M. ShortSync "Social Media Posting Limits 2026" and bundle.social rate-limit posts rank for IG-limit query [measured, #4 SERP] | n/m · likely shortsync.app, adaptlypost.com, bundle.social [inferred] | months | table generated from Siar's own per-network caps (`lib/networks.ts`) | NEW `/platforms/limits` |

### Instagram (live, claimable)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 3 | instagram api | N/I | **H**. AC 10, completions: key, documentation, cost, access, pricing, "for posting" | n/m · likely developers.facebook.com, Wikipedia-style docs [inferred] | unlikely | — (don't chase the head term) | `/instagram-api` (keep, retitle to a modifier) |
| 4 | instagram posting api | C | M. AC 10 incl. "documentation", "pricing", "free", "python" | **postpeer.dev, blotato.com, docs.publora.com, unipile.com, getlate.dev** (then mallary.ai, contentstudio.io, ayrshare.com, adaptlypost.com, bundle.social) [measured] | months | product landing: one call → feed, reel, story, carousel | `/instagram-api` (retitle "Instagram posting API: reels, stories, carousels") |
| 5 | instagram api for posting | C | M. AC child of "instagram api" | n/m · likely same as #4 [inferred] | months | same page as #4 | `/instagram-api` |
| 6 | post to instagram via api | I | M. AC 9 for the seed; siblings "upload to/publish to instagram via api", "can you post to instagram via api" | n/m · likely postproxy.dev, getlate.dev/zernio.com, ayrshare.com [inferred] | months | how-to with curl + SDK, answer-first | NEW `/instagram-api/how-to-post` |
| 7 | instagram graph api post reel / instagram reels api | I | M. "instagram reels api" AC 10 (upload, documentation, free); "instagram api post reels" AC child | **submagic.co (9 locale copies), ayrshare.com, developers.facebook.com, developers.qodex.ai, getphyllo.com** (then postpeer.dev, bundle.social) [measured] | months | how-to: REELS container → poll → publish, with Siar equivalent | NEW `/instagram-api/reels` |
| 8 | instagram api post story / post instagram story via api | I | M. AC child of "instagram api post" and "post to instagram via api" | **ayrshare.com, docs.publora.com, rapidevelopers.com, docs.contentstudio.io, storrito.com** (then blotato, getlate.dev, upload-post.com, postfa.st) [measured] | months | how-to + Story limits (no link stickers, etc.) | NEW `/instagram-api/stories` |
| 9 | instagram carousel api / instagram graph api carousel | I | L–M. AC 5 | n/m · likely developers.facebook.com, ayrshare.com [inferred] | months | section in reels/stories cluster, "up to 20 items" [sourced] | `/instagram-api` section |
| 10 | instagram api post limit / instagram api 100 posts per 24 hours | I | M. AC "instagram api post limit", "instagram api limits" AC 10; adaptlypost has 3 posts on it; bundle.social "instagram-api-rate-limits" | **ayrshare.com, help.zoomsphere.com, help.later.com, developers.facebook.com, adaptlypost.com** (then bundle.social, shortsync.app) [measured] | **months** (was weeks–months): the top 3 reportedly give 25 / 50 / 50 [unverified] and Meta's own page says both 100 and 50 [sourced], but bundle.social already publishes the 100-vs-50 explanation [measured], so the angle is not unique | explainer: the real number, the conflict, `content_publishing_limit` call, dated vendor quotes | NEW `/instagram-api/publishing-limit` |
| 11 | instagram api rate limit / instagram graph api rate limit | I | L–M. AC 5 | n/m · likely developers.facebook.com, getphyllo.com [inferred] | months | merge into #10 | NEW `/instagram-api/publishing-limit` |
| 12 | instagram api pricing / instagram api cost | C | M. "instagram api pricing" AC 10; "instagram api cost" AC 10 (fee, free or paid, free tier) | **getphyllo.com, wati.io, blotato.com, bird.com, data365.co** (then apify.com, xpoz.ai, muapi.ai, socialcrawl.dev, schedpilot.com) [measured] | long: SERP is data-scraper and DM vendors, mixed intent | pricing explainer: Meta charges nothing; the cost is review + build; Siar per-organization price | NEW `/instagram-api/pricing` (or one `/social-media-api-pricing` page, see #131) |
| 13 | instagram api with instagram login | I | M. AC 10 (tutorial, setup, business login) | **apis.apievangelist.com, developers.facebook.com, getphyllo.com, buddhathemes gitbook, keyapi.ai** (then getlate.dev, zernio.com) [measured] | long: Meta docs hold most slots | explainer: Instagram Login vs Facebook Login (Siar supports both [doc: siar-truth 1a]) | NEW `/instagram-api/instagram-login-vs-facebook-login` |
| 14 | instagram api without facebook (page) | I | L. AC 4 | n/m | months | section of #13 | same as #13 |
| 15 | instagram_content_publish permission | I | L. AC child of "instagram content publishing" | n/m · likely developers.facebook.com [inferred] | months | permission reference (Siar lists scopes on network pages already) | `/instagram-api` scopes section |
| 16 | instagram api error / instagram graph api error codes | I | L–M. AC 4; "instagram api errors how to fix" DDG: upgrow.com, instagrapi.com, postpeer.dev/errors/instagram [measured in current-site.md] | DDG top 3 above [measured] | **weeks–months**: postpeer, a small vendor, already ranks with the same page type | error reference, one H2 per code | `/instagram-api/errors` |
| 17 | schedule instagram posts api / auto post to instagram api | C | L. AC 3 | n/m · likely ayrshare.com, getlate.dev [inferred] | months | scheduling section | `/use-cases/social-media-scheduling-api` + link from `/instagram-api` |

### Facebook / Meta (live, claimable)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 18 | facebook api | N | **H**. AC 10 | n/m · developers.facebook.com [inferred] | unlikely | — | `/facebook-api` (retitle) |
| 19 | facebook graph api post to page | I | M. AC child of "facebook graph api post" and "facebook api post to page" | n/m · likely developers.facebook.com, stackoverflow.com [inferred] | months | how-to: Page token + `/feed` vs Siar one call | NEW `/facebook-api/post-to-page` |
| 20 | facebook page api post | I/C | M. AC child of "facebook page api" | n/m | months | same as #19 | same as #19 |
| 21 | facebook api for posts | C | M. AC child of "facebook api" | n/m · likely ayrshare.com, getlate.dev [inferred] | months | product landing | `/facebook-api` |
| 22 | facebook reels api / facebook publish reel api | I | L–M. AC 10 incl. "facebook reels upload api" | n/m | months | how-to | NEW `/facebook-api/reels` |
| 23 | facebook page access token (long-lived) | I | M. "facebook page api access token" AC child; Outstand has `facebook-instagram-long-lived-page-access-token` | n/m · developers.facebook.com, outstand.so [inferred] | months | explainer: why tokens expire, how Siar refreshes and flags reconnects | NEW `/facebook-api/page-access-token` |
| 24 | facebook api pricing / facebook graph api pricing | C | L–M. AC 10 / AC 5 | n/m | months | fold into one pricing explainer (#131) | NEW `/social-media-api-pricing` |
| 25 | facebook graph api post to group | I | L–M. AC child | n/m | — | **skip**: Siar posts to Pages only (siar-truth). Meta's Pages API page documents Page posts and never mentions Groups [sourced]; that groups are out of reach is [inferred] | none |
| 26 | meta app review | I | M. AC 10 (process, reddit, time, video, instagram, requirements, "taking time") | n/m · likely developers.facebook.com, bundle.social (`/meta-app-review-rejected`), reddit.com [inferred] | months | first-hand guide: what Siar submitted for 27 permissions, screencast rules, timeline (submitted 2026-10-14, approved 2026-10-27 after a resubmission [doc]) | NEW `/facebook-api/meta-app-review` |
| 27 | meta app review time / meta app review taking time | I | M. AC children | n/m | weeks–months: first-hand dated timeline is rare | section of #26 | same as #26 |
| 28 | meta app review rejected / instagram api without app review | C | L–M. bundle.social and social-api.ai built pages for it [competitors] | n/m · bundle.social, social-api.ai [inferred] | months | commercial angle: "skip the review: Siar is approved" (true for Meta [doc]) | same as #26, CTA block |
| 29 | facebook api limits / facebook graph api rate limits | I | L–M. AC 7 | n/m · developers.facebook.com [inferred] | long | section | `/facebook-api` |
| 30 | facebook api errors | I | L. — | n/m | months | error reference | `/facebook-api/errors` |

### Threads (live, claimable)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 31 | threads api | N/I | **M–H**. AC 10 (key, pricing, free, github, token, meta, post, python, documentation) | n/m · developers.facebook.com/docs/threads, outstand.so (`threads-api`), bundle.social [inferred] | long | network hub | `/threads-api` |
| 32 | threads api post / publish to threads api | I | L. AC 6 for "threads api post", but "post to threads via api" AC 0 | n/m | **weeks–months**: low demand, low competition | how-to | NEW `/threads-api/how-to-post` |
| 33 | threads api pricing / threads api free | C | L–M. AC child of "threads api" | n/m | weeks–months | short answer: no fee on Meta's page [inferred], capped at 250 posts/24 h [sourced] | section of `/threads-api` |
| 34 | threads api rate limit / threads api limits | I | L. AC 2–3 | n/m | weeks | limits explainer (250 posts, 1,000 replies, 100 deletes) | NEW `/threads-api/limits` (or section) |
| 35 | threads api documentation | N | L–M. AC 4 | n/m · developers.facebook.com [inferred] | unlikely | — | none |
| 36 | threads api python | I | L–M. AC child | n/m · github.com, pypi.org [inferred] | long | code sample in how-to | section of #32 |
| 37 | schedule threads posts api / threads api schedule | C | L. AC 0 for "threads api schedule" | n/m · bundle.social `/threads` scheduler page [inferred] | weeks | scheduling section | `/use-cases/social-media-scheduling-api` |
| 38 | threads api errors (e.g. empty 500 missing permission) | I | L. social-api.ai targets "threads-api-empty-500-missing-permission" [competitors] | n/m | weeks | error reference | `/threads-api/errors` |

### X / Twitter (live, claimable; see the service-bureau risk in section 1)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 39 | x api pricing | C | **H**. AC 10 (tiers, plans, free tier, reddit, changes, calculator, "2026", "pay as you go", enterprise) | n/m · docs.x.com, plus pricing explainers from bundle.social, outstand.so, zernio, social-api.ai, postproxy [inferred, competitor slugs] | long: every API vendor has this post | pricing explainer with a cost calculator in USD and MYR, X prices quoted from docs.x.com | NEW `/x-api/pricing` |
| 40 | twitter api pricing | C | **H**. AC 10 (free, reddit, change, per month, pay as you go) | n/m · same as #39 [inferred] | long | same page (both names in title) | NEW `/x-api/pricing` |
| 41 | x api pay per use / x api pay as you go | C | M. AC 10 incl. "pricing", "model", "pilot application", "reddit" | n/m | months: newer phrase, thinner SERP [inferred] | section of #39 | NEW `/x-api/pricing` |
| 42 | x api cost per post / per tweet / twitter api cost per post | C | M. AC children of "x api cost" and "twitter api cost" | n/m | **weeks–months**: one exact answer ($0.015, $0.20 with a URL [sourced]) | answer-first block + calculator | NEW `/x-api/pricing` |
| 43 | x api free tier / twitter api free | I/C | M–H. AC 10 each ("limits", "2026", "for students") | n/m | long | section: no free tier on the page; $20 credit after first purchase [sourced] | NEW `/x-api/pricing` |
| 44 | x api basic / x api basic plan pricing | C | M. AC 10 (incl. Japanese) | n/m | months | section: Basic/Pro not on X's pricing page any more [measured] | NEW `/x-api/pricing` |
| 45 | x api credits / x api credits depleted / buy x api credits | T/I | M. AC 10 ("voucher", "depleted", "free credits") | n/m | **weeks–months** | explainer + how Siar's prepaid X credit works | NEW `/x-api/credits` (or section of #39) |
| 46 | x api 402 / x api error 402 payment required / CreditsDepleted | I | L–M. AC 5. DDG for "x api 402 CreditsDepleted": opentweet.io, note.com, x.com [measured in current-site.md] | DDG top 3 above [measured] | **weeks** | error page, one H2 per code | `/x-api/errors` |
| 47 | twitter api post tweet / x api create post | I | M. "twitter api post tweet" AC child; "x api post tweet" AC 1 | n/m · docs.x.com [inferred] | months | how-to | NEW `/x-api/how-to-post` |
| 48 | post to twitter via api / post on x using api | I | M. AC child of "post to instagram via api" (cross-suggested) | n/m | months | same as #47 | NEW `/x-api/how-to-post` |
| 49 | twitter api upload media / video | I | L–M. AC child of "twitter api post" | n/m | months | section | NEW `/x-api/how-to-post` |
| 50 | twitter api rate limits / x api rate limits | I | M. AC children | n/m · docs.x.com [inferred] | long | section | `/x-api` |
| 51 | x api enterprise | C | L. AC child | n/m | — | skip (not Siar's buyer) | none |

### LinkedIn (profiles live; company pages NOT open)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 52 | linkedin api | N | **H**. AC 10 (pricing, access, key, documentation, "for job search") | n/m · learn.microsoft.com, developer.linkedin.com [inferred] | unlikely | — | `/linkedin-api` |
| 53 | linkedin api post | I | M. AC 10 (content, analytics, to company page, article, comments) | n/m · learn.microsoft.com, ayrshare.com, getlate.dev [inferred] | months | how-to for member posts | NEW `/linkedin-api/how-to-post` |
| 54 | post to linkedin via api / can you post to linkedin via api | I | L–M. AC 5 | n/m | months | same as #53 | same |
| 55 | linkedin api post to company page | I/C | M. AC child of 3 seeds | n/m · likely zernio/getlate, outstand.so, learn.microsoft.com [inferred] | months | **guide only** for pages: explain CM API vetting honestly; Siar does profiles today | NEW `/linkedin-api/company-pages` |
| 56 | linkedin community management api | I | L–M. AC 4 ("access", "development tier access form") | n/m · learn.microsoft.com [inferred] | **weeks–months**: few non-LinkedIn pages | first-hand explainer: dev vs standard tier, new-app rule, screencast, Siar's own denial | NEW `/linkedin-api/community-management-api` |
| 57 | linkedin community management api development tier access form | I | L. AC child | n/m | weeks | section of #56 | same |
| 58 | linkedin api access / linkedin api access denied | I | M. AC 10 for "linkedin api access" | n/m | months | section of #56 | same |
| 59 | linkedin api pricing | C | M. AC 10 (per month, plans, reddit, free tier); Zernio and Outstand have `linkedin-api-pricing` [competitors] | n/m | long | pricing explainer: no fee, gated access | NEW `/social-media-api-pricing` section or `/linkedin-api/pricing` |
| 60 | linkedin share api / share on linkedin api / w_member_social | I | L. AC 3 | n/m · learn.microsoft.com [inferred] | months | scope reference | `/linkedin-api` scopes section |
| 61 | linkedin posts api | I | M. AC 10 (documentation, pricing, example) | n/m · learn.microsoft.com [inferred] | long | how-to | NEW `/linkedin-api/how-to-post` |
| 62 | linkedin api rate limits | I | L–M. — | n/m | months | section: 150/member/day, 100,000/app/day [sourced] | NEW `/linkedin-api/how-to-post` |
| 63 | linkedin api error 426 / linkedin api errors | I | L. AC 4. LinkedIn answers a deprecated version with HTTP 426 `NONEXISTENT_VERSION` "Requested version … is not active" [sourced: learn.microsoft.com/en-us/linkedin/marketing/error-responses, Example 5] | n/m | **weeks** (version 202511 sunsets 2026-11-16 [sourced]) | error reference with the version-sunset code | `/linkedin-api/errors` |
| 64 | linkedin api post analytics | I | L–M. AC child | n/m | — | **do not target** until LinkedIn analytics is tested (siar-truth 2) | none |
| 65 | linkedin api key for posting | T | L. AC child | n/m | months | quickstart block | `/linkedin-api` |

### TikTok (NOT open: audit rejected, sandbox only; guide only)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 66 | tiktok api | N | **H**. AC 10 (key, documentation, for business, pricing, status, free) | n/m · developers.tiktok.com [inferred] | unlikely | — | `/tiktok-api` |
| 67 | tiktok content posting api | I | M. AC 10 ("reddit", "docs", "audit", "how to get") | **developers.tiktok.com, ayrshare.com, blotato.com, getlate.dev, bundle.social** (then postpeer.dev, zernio.com, posteverywhere.ai) [measured] | long | **guide only**: how the API works, Direct Post vs inbox upload | `/tiktok-api` (retitle; status line "opening after TikTok approves Siar") |
| 68 | tiktok api post video | I | M. AC child of "tiktok api post" | **ayrshare.com, getlate.dev, developers.tiktok.com, docs.publora.com, developers.posteverywhere.ai** (then postfa.st, zernio.com) [measured] | long | guide only | NEW `/tiktok-api/how-to-post` |
| 69 | post to tiktok via api / can you post to tiktok via api | I | L–M. AC 7 | n/m | months | same as #68 | same |
| 70 | tiktok api upload video python | I | M. AC child of "tiktok api upload" | n/m · github.com, pypi [inferred] | long | code section | same as #68 |
| 71 | tiktok content posting api audit / tiktok api approval | I | M. AC child; "tiktok api audit" AC 5; bundle.social has `tiktok-api-approval` | **blotato.com, website-apn.pages.dev (postproxy mirror), rapidevelopers.com, developers.tiktok.com, mediawell.ssrc.org** (then vorplabs.com, ayrshare.com, getphyllo.com, adaptlypost.com, postpeer.dev, postproxy.dev, bundle.social) [measured] | **months**: page 1 is thin vendor posts; first-hand audit experience is rare | first-hand guide: what the audit checks, why Siar's films were rejected (hand-recorded, URL visible) [doc] | NEW `/tiktok-api/audit` |
| 72 | unaudited_client_can_only_post_to_private_accounts / tiktok api private | I | L. AC 3 for "tiktok api private"; the code appears in competitor error pages | n/m (search budget hit on this exact query) | **weeks** | error H2 with the TikTok quote | `/tiktok-api/errors` (already lists it) |
| 73 | tiktok api error codes / tiktok api error 40002 | I | L–M. AC 6 | n/m · postpeer.dev/errors/tiktok seen in audit SERP [measured, #71] | weeks–months | error reference | `/tiktok-api/errors` |
| 74 | tiktok api pricing / does tiktok api cost money | C | M. AC 9 / AC 8 | n/m | long | short section: no published fee [inferred] | `/tiktok-api` section |
| 75 | tiktok direct post / tiktok direct post api | I | L. AC 5 | n/m | months | section of #68 | same |
| 76 | tiktok api rate limit | I | L. AC 10 but all Shop/Ads/Research variants (other products) | n/m | weeks | section: 6 requests/min per token [sourced] | `/tiktok-api` section |
| 77 | tiktok api sandbox | I | L. AC 10 but Business/Shop/Ads variants | n/m | months | section of #71 | same as #71 |
| 78 | schedule tiktok posts api / tiktok scheduler api | C | L. AC 3–5 | n/m · social-api.ai `/how-to/schedule-tiktok-posts` [competitors] | — | **wait**: commercial page only after TikTok approval | none yet |

### YouTube (connect + upload live; public uploads were locked private; see finding 3)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 79 | youtube api | N | **H**. AC 10 | n/m · developers.google.com [inferred] | unlikely | — | `/youtube-api` |
| 80 | youtube upload api / youtube api upload video | I | M–H. AC 10 each (limit, key, python, documentation, shorts, quota, "from url") | n/m · developers.google.com, stackoverflow.com [inferred] | long | how-to | NEW `/youtube-api/how-to-upload` |
| 81 | upload video to youtube via api | I | L–M. AC 3 | n/m | months | same as #80 | same |
| 82 | youtube api upload shorts / youtube shorts api upload | I | M. AC children of 3 seeds | n/m · likely ayrshare.com, getlate.dev [inferred] | months | how-to section: Shorts + the 2026-11-03 Shorts thumbnail change [sourced] | NEW `/youtube-api/shorts` |
| 83 | youtube data api quota | I | M–H. AC 10 (exceeded, calculator, cost, "and compliance audits", increase) | n/m · developers.google.com, bundle.social (`youtube-api-quota-exceeded-limits-fixes`), social-api.ai (`youtube-api-quota-2026-upload-limit`) [inferred] | **months**: the 2026 upload bucket makes old "1,600 units per upload" posts wrong | quota explainer with the new numbers (10,000 units + 100 uploads/day) [sourced] | NEW `/youtube-api/quota` |
| 84 | youtube api quota exceeded | I | M. AC child | n/m | months | section of #83 | same |
| 85 | youtube api quota increase / extension | I | M. AC 5 ("request", "v3") | n/m · developers.google.com form [inferred] | months | section of #83 + Siar's own experience (submitted 2026-10-15, no answer [doc]) | same |
| 86 | youtube data api quota calculator | I/T | L–M. AC child | n/m | **weeks–months** | small tool on the quota page | same, embedded calculator |
| 87 | youtube api upload limit / daily upload limit | I | M. AC 7 | n/m | **weeks** (new 100/day bucket [sourced]) | section of #83 | same |
| 88 | youtube api audit / youtube api compliance audit | I | L–M. AC 6 ("form", "services audit and quota extension") | n/m · developers.google.com [inferred] | months | explainer of the audit + what changed on 2026-11-02 | NEW `/youtube-api/audit` |
| 89 | youtube api upload private video / videos locked private | I | M. AC child of "youtube api private" | n/m | **weeks**: Google reversed the rule on 2026-11-02 [sourced]; ranking pages still describe the 2020 rule [inferred] | news-style explainer, dated | section of #88 + `/youtube-api/errors` ("locked private" entry must be updated) |
| 90 | youtube api pricing / is youtube api free | C | M. AC 10 | n/m · Outstand `youtube-api-pricing-quota` [competitors] | long | short answer section | `/youtube-api/quota` |

### Pinterest (connect + read live; publishing NOT open; guide only)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 91 | pinterest api | N | **H**. AC 10 (key, documentation, pricing, access, token, "method not found", free) | n/m · developers.pinterest.com [inferred] | unlikely | — | `/pinterest-api` |
| 92 | pinterest api create pin / pinterest api for posting | I | L. AC 5 each | n/m | months | guide only | NEW `/pinterest-api/how-to-post` |
| 93 | pinterest api standard access | I | L. AC child of "pinterest api access" | n/m | **weeks–months** [inferred]: low competition; Pinterest's access-tiers page now states the Standard rules (demo video of OAuth + live integration) [sourced], so the page must add first-hand detail, not just the rules | first-hand explainer: trial vs standard, what the demo must show | NEW `/pinterest-api/access` |
| 94 | pinterest api trial access denied | I | L. AC child | n/m | weeks | section of #93 | same |
| 95 | pinterest api pricing / free | C | M. AC child | n/m | months | short section | `/pinterest-api` |
| 96 | pinterest api method not found | I | L–M. AC child | n/m | weeks | error entry | `/pinterest-api/errors` |

### Reddit (parked; guide only, low priority)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 97 | reddit api pricing / reddit api cost | C | **H**. AC 10 ("changes", "controversy", "2025", "price increase") | n/m · news sites, reddit.com, Wikipedia (the 2023 protest) [inferred] | unlikely | — | none |
| 98 | reddit api key / how to get | T/I | **H**. AC 10 | n/m · reddit.com [inferred] | unlikely | — | none |
| 99 | reddit api access request form / how long | I | M. AC 10 ("request", "form", "2026", "how long") | n/m | months, but Siar has nothing to sell | first-hand guide only if Siar applies | `/reddit-api` section (later) |
| 100 | reddit api post to subreddit | I | L–M. AC child | n/m · praw docs, stackoverflow [inferred] | long | — | `/reddit-api` |
| 101 | reddit responsible builder policy | I | L. AC 2 | n/m | weeks | section | `/reddit-api` section (later) |

### Bluesky (live, claimable)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 102 | bluesky api | N/I | M. AC 10 (key, free, docs, pricing, access, python, rate limit) | n/m · docs.bsky.app, atproto.com [inferred] | long | hub | `/bluesky-api` |
| 103 | bluesky api create post / post to bluesky via api | I | L. AC 4; "post to bluesky via api" AC 0 | n/m | **weeks**: low competition | how-to (createRecord, facets for links/mentions) | NEW `/bluesky-api/how-to-post` |
| 104 | bluesky api post schedule / schedule bluesky posts api | C | L. DDG: bsky.app, postfa.st (2) [measured in current-site.md] | DDG top 3 above [measured] | **weeks** | scheduling landing | `/bluesky-api` scheduling section |
| 105 | bluesky api rate limit / limits | I | L–M. AC children | n/m · docs.bsky.app [inferred] | weeks–months | section: 1,666 posts/hour, 11,666/day [sourced] | `/bluesky-api` section |
| 106 | bluesky api pricing / free | C | L. AC 4 | n/m | weeks | one-line answer: free | `/bluesky-api` section |
| 107 | bluesky api python | I | L. AC 2 | n/m · github.com (atproto SDK) [inferred] | long | code sample | NEW `/bluesky-api/how-to-post` |

### Mastodon (live, claimable)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 108 | mastodon api | N | M. AC 10 but only 2 popular-type completions; "mastodon api post" is offered | n/m · docs.joinmastodon.org [inferred] | long | hub | `/mastodon-api` |
| 109 | mastodon api post status | I | L. "mastodon api post" AC 1 | n/m | weeks | how-to section | `/mastodon-api` section |
| 110 | mastodon bot api / mastodon bot python | I | L. AC children of "mastodon bot" | n/m · github, docs.joinmastodon.org [inferred] | months | how-to | `/mastodon-api` section |
| 111 | mastodon api rate limit | I | L. — | n/m | weeks | section: 300 req/5 min, media 30/30 min [sourced] | `/mastodon-api` section; also fills the thin `/mastodon-api/errors` (203 words) |

### Discord (live, claimable)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 112 | discord webhook | N/T | **H**. AC 10 (url, sender, maker, generator, tester, api, rate limit) | n/m · discord.com support, webhook tools [inferred] | unlikely | — | none |
| 113 | discord api send message / discord bot send message to channel | I | M. AC 10 each ("at certain time", "every hour", "python") | n/m · discord.com docs, stackoverflow, discordjs.guide [inferred] | long | how-to | `/discord-api` section |
| 114 | discord bot send message at certain time / schedule discord message | C | L–M. AC child | n/m | **months**: matches Siar's scheduling | scheduling how-to | NEW `/discord-api/schedule-messages` |
| 115 | discord api rate limits | I | M. AC child | n/m · docs.discord.com [inferred] | long | section: 50 req/s global [sourced] | `/discord-api` section |

### Slack (live, claimable)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 116 | slack api post message | I | M. AC 10 (to channel, with file, in thread, markdown, image) | n/m · docs.slack.dev / api.slack.com [inferred] | long | how-to | `/slack-api` section |
| 117 | slack chat.postmessage | N/I | M. AC 10 ("rate limit", "curl", "blocks") | n/m · docs.slack.dev [inferred] | unlikely | — | none |
| 118 | slack chat.postmessage rate limit / slack api rate limits | I | L–M. AC child | n/m | months | section | `/slack-api` section |
| 119 | slack api rate limits non-marketplace apps / conversations.history 1 per minute | I | L. — (no AC test) | n/m | **weeks** | explainer: the 2025-05-29 change [sourced] and what it means for comment import | NEW `/slack-api/rate-limits` |
| 120 | slack schedule message api | C | L. AC 3 | n/m · docs.slack.dev (`chat.scheduleMessage`) [inferred] | months | scheduling section | `/slack-api` section |

### Google Business Profile (parked; guide only)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 121 | google business profile api | N | **H**. AC 10 (access request form, access, contact form, key, documentation, prerequisites, pricing) | n/m · developers.google.com [inferred] | unlikely | — | `/google-business-profile-api` |
| 122 | google business profile api access request form / how to get access | I | M. AC 10 for "google business profile api access" | n/m · developers.google.com, support threads [inferred] | months | first-hand guide (60-day profile rule, 0 → 300 QPM [sourced]) | NEW `/google-business-profile-api/access` |
| 123 | google my business api / gmb api | N | M–H. AC 10 each (reviews, v4, pricing) | n/m | unlikely | — | none |
| 124 | google business profile api pricing / free | C | L–M. AC 6 | n/m | weeks–months | one-line answer | section of #122 |
| 125 | google business profile api post (local posts) | I | L. AC 3, mostly off-topic; "local posts api" AC 0 | n/m | months | **guide only** | `/google-business-profile-api` |
| 126 | google my business api reviews / get reviews | I | M. AC child | n/m | — | skip until open (siar-truth: never claim "manage reviews") | none |

### Snapchat (parked; guide only, lowest priority)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 127 | snapchat api | N | M. AC 10 (documentation, key, github, send message, bot, pricing) | n/m · developers.snap.com [inferred] | unlikely | — | `/snapchat-api` |
| 128 | snapchat public profile api | I | L. AC 5 but all consumer questions ("what is a snapchat public profile") | n/m | weeks (almost no developer content) [inferred] | short explainer of the allowlist [sourced] | `/snapchat-api` section |
| 129 | snapchat api post story / spotlight api | I | L. "snapchat story api" AC child of "instagram story api" | n/m | — | **wait** | none |
| 130 | snapchat marketing api / ads api | N | L–M. AC 7 | n/m | — | skip (Siar has no ads endpoints) | none |

### Pricing hub (cross-network)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 131 | social media api pricing / how much does a social media api cost | C | M. Already P3 in `geo/plan.md`; Zernio, social-api.ai and Outstand all have this post [competitors] | n/m | long | one explainer that links every `/<net>-api/pricing` section; per-account vs per-organization; X pass-through | NEW `/social-media-api-pricing` |

130 network keywords plus the hub. 12 SERPs measured once, 119 not; none re-run in verification.

---

## 3. New pages proposed (grouped)

| Priority [inferred] | New slug | Rows it covers | Why first |
|---|---|---|---|
| 1 | `/instagram-api/publishing-limit` | 10, 11 | Medium demand, the ranking pages disagree (25 / 50 / 100) [unverified], Meta's page contradicts itself [sourced], Siar can claim Instagram. bundle.social already covers the conflict [measured] |
| 1 | `/youtube-api/quota` (+ calculator) and `/youtube-api/audit` | 83–90 | Google changed the rules on 2026-11-02 and 2026-11-03; every older page is stale. Dependent on finding 3 below |
| 1 | `/x-api/pricing` (+ credits section) | 39–45 | Highest commercial demand Siar can serve; exact prices from docs.x.com. **Hold until Fakhrul reads X's Developer Agreement** (service-bureau risk) |
| 2 | `/facebook-api/meta-app-review` | 26–28 | First-hand, dated, approved (27 permissions) [doc]; doubles as "skip the review" pitch |
| 2 | `/tiktok-api/audit`, `/linkedin-api/community-management-api`, `/pinterest-api/access` | 56–58, 71, 93–94 | First-hand gate stories with low competition; guide only, no posting claim |
| 2 | `/instagram-api/reels`, `/instagram-api/stories`, `/instagram-api/how-to-post` | 6–8 | Medium demand; SERPs are small vendors, so beatable |
| 3 | `/threads-api/how-to-post`, `/bluesky-api/how-to-post`, `/x-api/how-to-post`, `/linkedin-api/how-to-post`, `/facebook-api/post-to-page` | 19, 32, 47, 53, 103 | Lower demand but low competition and all claimable |
| 3 | `/platforms/approvals`, `/platforms/limits`, `/social-media-api-pricing` | 1, 2, 131 | Hubs that link the clusters; data comes from section 1 and `lib/networks.ts` |
| 4 | `/slack-api/rate-limits`, `/discord-api/schedule-messages`, `/google-business-profile-api/access`, `/youtube-api/shorts`, `/facebook-api/reels`, `/facebook-api/page-access-token`, `/instagram-api/instagram-login-vs-facebook-login`, `/tiktok-api/how-to-post` | various | Fill-in |

Existing pages to retitle (draft, owner approves): the 15 `/<net>-api` titles "X API: post, schedule and analyze | Siar"
aim at head terms Siar cannot win (rows 3, 18, 52, 66, 79, 91, 102, 121, 127). Aim each at its posting modifier instead,
e.g. "Instagram posting API: reels, stories and carousels | Siar", and add the generated status line for networks that
are not open (`current-site.md` section 7).

---

## 4. What this sweep tells us

1. **Posting queries are won by small API vendors, not by the networks' own docs.** For "instagram posting api" the
   top 5 are postpeer.dev, blotato.com, publora.com, unipile.com and getlate.dev (Zernio). Meta's docs are not in the top
   10 [measured]. For TikTok, only `developers.tiktok.com` holds a top slot; the rest are vendors [measured]. So a
   focused page from a young domain can rank in months [inferred]. But about 15 vendors publish the same page set
   (postpeer, blotato, publora, zernio/getlate, ayrshare, bundle.social, upload-post, posteverywhere, postfa.st,
   postproxy, adaptlypost, shortsync, social-api.ai, outstand). Another "how to post to Instagram via API" page will not
   stand out. Two things will: numbers taken from the enforcing code, and Siar's own first-hand approval history.

2. **The pain worth targeting is approvals and quotas. Price is the pain only on X.** Approval phrases appear as
   autocomplete children: "tiktok content posting api audit", "linkedin community management api development tier
   access form", "pinterest api trial access denied", "reddit api access request how long", "google business profile
   api access request form", "meta app review taking time". These SERPs are thin [measured for TikTok audit; inferred
   for the rest]. Siar has been through most of these gates in the last month: Meta (approved), TikTok (rejected),
   LinkedIn Community Management (denied), Google OAuth (approved) and the YouTube audit (pending), Pinterest Trial
   (approved; Standard not yet applied for) [doc: `docs/approvals/README.md`]. Reddit, Google Business Profile and
   Snapchat were parked on 2026-10-14 with nothing submitted [doc], so there is no first-hand story for those three.
   Few competitors write first-hand dated accounts. That is the content edge.

3. **YouTube changed the rules ten days ago, and Siar's own copy is now stale.** On 2026-11-02 Google wrote that
   uploads from unverified API projects "are no longer restricted to private viewing mode". Uploads also have their
   own quota bucket of 100 `videos.insert` calls per day, a change dated 2026-06-01, not November [sourced:
   developers.google.com/youtube/v3/revision_history, /docs/videos/insert]. Since 2026-11-02 an upload with no
   `status.privacyStatus` defaults to public [sourced, revision history]. `siar-truth.md` 1b, the YouTube adapter's "locked private" warning
   (`packages/networks/src/adapters/youtube.ts` lines 264, 382–384) and the `/youtube-api/errors` entry all describe the
   old rule.
   - **Action for Fakhrul:** test one public upload on production before any copy changes. If it stays public,
     YouTube moves to the claimable list.
   - **The new constraint is quota.** [inferred] 100 uploads per day is probably per Google Cloud project, shared by
     every Siar customer, unless the extension request (pending since 2026-10-15 [doc]) is granted.
   - For SEO, the YouTube quota and audit pages are the fastest wins in this sweep: demand is medium, and the ranking
     pages very likely predate the change [inferred: those SERPs were never measured].

4. **The networks with the most demand are the ones Siar cannot sell yet.** By autocomplete, TikTok, YouTube, LinkedIn
   company pages, Pinterest, Reddit and Google Business Profile carry the most demand. Of these, only YouTube might open
   soon (finding 3). Pages for the rest must be honest guides about the native API, with the status line and no
   "post to X with Siar" claim. The money pages should go to the live networks with real demand: Instagram (limits,
   reels, stories), Facebook/Meta App Review, X pricing, Threads.

5. **X pricing is the biggest commercial keyword Siar can serve, and it carries a legal question.** "x api pricing" and
   "twitter api pricing" both return 10 completions, including "pay as you go", "calculator" and "2026". X's own page
   now shows pay-per-usage only, with no Basic or Pro tier [sourced].
   - Siar's pass-through credit is a real convenience, and a page with a calculator in USD and MYR fits the intent.
   - Ayrshare publicly argues this model breaks X's service-bureau clause [third-party]. Fakhrul should check X's
     Developer Agreement before Siar promotes X credits on a ranking page.

6. **Bluesky, Threads and Mastodon are low demand, low competition and live: cheap wins.** "post to threads via
   api", "post to bluesky via api" and "threads api schedule" return no autocomplete at all [measured]. DuckDuckGo shows
   only bsky.app and postfa.st for the Bluesky scheduling query [measured, current-site.md]. These pages will rank
   quickly but bring little traffic [inferred]. They are worth adding as sections on the existing network pages
   rather than as many new URLs.

7. **Head terms are not winnable.** "instagram api", "tiktok api", "x api", "reddit api", "discord webhook",
   "google business profile api", "youtube api" and "pinterest api" all autocomplete 10 ways, and are owned by the
   network's docs [inferred]. Siar's network pages currently title-chase these. Retitle them to the posting modifier
   (section 3).

8. **Vendor documentation contradicts itself and third parties, and that is an opening.**
   - Instagram: Meta's page says both 100 and 50 posts per 24 hours [sourced]; Ayrshare reportedly says 25 and Later
     50 [third-party, unverified]. bundle.social already has a page explaining the 100 vs 50 conflict [measured].
   - TikTok: the direct-post reference names the daily post cap and active-user cap without numbers, while TikTok's
     content-sharing guidelines give them (5 posting users per 24 h for unaudited clients; about 15 posts per day per
     creator) [sourced]. TikTok's docs are split across pages, not silent.

   An answer-first page that quotes every vendor page, dates the quote and shows the API call to check it
   (`content_publishing_limit`, `threads_publishing_limit`) is still useful, but at least bundle.social does this for
   Instagram already, so the edge is completeness across networks plus first-hand numbers, not being first [inferred].

9. **Gaps in this sweep.**
   - Only 12 of 131 SERPs were measured (the shared search budget ran out), and none of the 12 was re-run in the
     verification pass, so they are single measurements [unverified].
   - Reddit's rules could not be fetched from Reddit (support.reddithelp.com still 403 on 2026-11-12), so they stay
     unverified. Pinterest's Standard-access rules now load and are sourced in section 1.
   - Discord's "no review below 100 servers" is still [doc] only: Discord's support article returned 403.
   - Next: run the "n/m" rows for the priority-1 and priority-2 pages before writing them. Once Search Console is
     verified (`geo/owner-todo.md`), replace these demand estimates with real impressions.

## Sources (vendor pages, all checked 2026-11-12)

- https://developers.facebook.com/docs/instagram-platform/content-publishing
- https://developers.facebook.com/docs/pages-api/posts
- https://developers.facebook.com/docs/threads/overview
- https://docs.x.com/x-api/getting-started/pricing
- https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/community-management-overview
- https://developers.tiktok.com/doc/content-posting-api-get-started
- https://developers.tiktok.com/doc/content-posting-api-reference-direct-post
- https://developers.google.com/youtube/v3/getting-started
- https://developers.google.com/youtube/v3/docs/videos/insert
- https://developers.google.com/youtube/v3/revision_history
- https://developers.tiktok.com/doc/content-sharing-guidelines
- https://learn.microsoft.com/en-us/linkedin/marketing/error-responses
- https://developers.pinterest.com/docs/getting-started/connect-app/
- https://developers.pinterest.com/docs/key-concepts/access-tiers/
- https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/rate-limits.md (source of docs.bsky.app)
- https://docs.joinmastodon.org/api/rate-limits/
- https://docs.discord.com/developers/topics/rate-limits
- https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps
- https://developers.google.com/my-business/content/prereqs
- https://developers.snap.com/api/marketing-api/Public-Profile-API/GetStarted
- Reddit: support.reddithelp.com (403) and reddit.com (fetch refused), unverified
- Third-party, labelled where used: ayrshare.com/blog/x-api-compliance-byo-app/ (exists, dated 2026-05-15, argues
  BYO app is "the only compliant way" since 2026-03-31; checked 2026-11-12); bundle.social/blog/instagram-api-rate-limits
  (exists, checked 2026-11-12); Ayrshare "Error 9" page, help.later.com (403), help.zoomsphere.com: seen in the SERP
  only, not reachable or not found on re-check, unverified; postproxy.dev / website-apn.pages.dev (not re-checked)
- Autocomplete raw output: 145 seeds, `suggestqueries.google.com`, 2026-11-12 (not committed; re-runnable)
