Verified 2026-11-12: 8 corrections

# Siar truth inventory (checked 2026-11-12)

Every page, ad, comparison table, FAQ answer and social post about Siar must agree with this file.
If copy needs a fact that is not here, it does not go out until the fact is added with evidence.

How claims are labelled:

- **[live]**: I fetched it from the live site or API on 2026-11-12.
- **[code]**: I read it in this checkout (`/Users/fakhrul/Desktop/dev/Siar-seo-research`, release 878b698 / docs commit 56c8716).
- **[doc]**: written in the repo's own docs (approvals, pricing). These are owner records, not independent proof.
- **[sourced]**: a third party's own page, with URL.
- **[inferred]**: my reading of the evidence. Not proven.

Builds on `docs/geo/facts.md`, which is now partly out of date (see section 7).

---

## 0. The one rule that catches most mistakes

`GET https://api.siaran.my/api/v1/` reports `available: true` for 12 networks, TikTok, YouTube and Pinterest
among them [live]. **"available" only means the network's keys are on the server** (`docs/approvals/README.md`,
"A network turns on the moment its keys are present"). It says nothing about approval. TikTok's keys are
**sandbox** keys, Pinterest's are **trial** keys, and YouTube's project has not passed its audit. Never use the
health endpoint or the dashboard's connect list as proof that a network can be sold.

---

## 1. Claimable now (live, verified)

### 1a. Networks you can publish to today

| Network | What a customer can do today | Evidence |
|---|---|---|
| Facebook | Publish, schedule, edit and delete Page posts, reels and stories. Comments (read, reply, hide, delete), Page and post insights | Meta App Review approved 2026-10-27, all 27 permissions, Advanced Access [doc: `docs/approvals/meta.md`, `docs/approvals/README.md`]; `FACEBOOK available: true` [live] |
| Instagram | Feed posts, carousels, reels, stories on professional (business/creator) accounts, via Facebook Login or Instagram Login. Comments, first comment, insights | Same Meta approval [doc]; `INSTAGRAM available: true` [live] |
| Threads | Text, image, video, carousel posts, replies, insights, delete | Same Meta approval (threads_* permissions) [doc]; `THREADS available: true` [live] |
| X (Twitter) | Posts, threads, polls, quotes, replies, from a prepaid X credit | No review needed; app live [doc: `docs/approvals/x.md`]; `TWITTER available: true` [live]. Caveat: `README.md` in approvals says "$20 balance, no usage yet", so no production post is recorded [doc] |
| LinkedIn (member profiles only) | Posts to a person's own LinkedIn profile: text, images, video, documents, links | "Siar" app (Share on LinkedIn + OIDC) live in production [doc: `docs/approvals/linkedin.md`]; adapter requests member scopes only unless `NETWORK_LINKEDIN_COMMUNITY_MANAGEMENT=true` [code: `packages/networks/src/adapters/linkedin.ts` lines 40-53] |
| Bluesky | Posts with images, video, link cards, quotes, tags, labels | No review exists [doc: `docs/approvals/discord-slack-bluesky-mastodon.md`]; available [live] |
| Mastodon | Statuses on any server, visibility, content warnings, media | No review exists [doc]; available [live] |
| Discord | Channel messages from a bot with a per-team name and avatar | No review below 100 servers [doc]; available [live] |
| Slack | Channel messages with files and a custom bot name | Public distribution, no review [doc]; available [live]. Caveat: comment import is slow until Slack Marketplace listing (1 request/min) [doc] |

**Allowed count wording:** "Publish to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord
and Slack today. TikTok, YouTube (public uploads), Pinterest publishing, LinkedIn company pages, Reddit, Snapchat and
Google Business Profile are built and open as each network approves Siar."

"15 networks" is allowed **only** as "built for 15 networks" / "15 network integrations in the API", never as
"post to 15 networks today" or "supports 15 networks" without the qualifier.

### 1b. YouTube (claimable with a qualifier)

- Connect a channel, upload videos and Shorts, read analytics, comments: works [doc: `docs/approvals/google.md`, OAuth verification approved 2026-10-15].
- **But every upload is forced private by YouTube** until the YouTube API audit passes. The adapter flags it: "Uploads
  from an API project that has not passed YouTube's compliance audit are locked private" [code: `packages/networks/src/adapters/youtube.ts` line 384].
- Allowed: "YouTube: connect and upload now; videos stay private until YouTube's API audit is complete."
- Not allowed: "Publish YouTube videos and Shorts" with no qualifier, or any copy showing a public YouTube post.

### 1c. Product features that are true in code and live

| Claim (allowed wording) | Evidence |
|---|---|
| One REST API with an OpenAPI document of **270 operations** at `/openapi.json` | Counted 270 operations, 207 paths in `https://siaran.my/openapi.json` [live]. Declares `"openapi": "3.0.2"` [live, code: `packages/contract/openapi.json`]. Say "OpenAPI", or "OpenAPI 3.0". **Not "OpenAPI 3.1"** |
| A dashboard built on the same API (composer, calendar, posts, inbox, analytics, media, bulk CSV, teams, API keys, webhooks, billing) | `apps/web/src/views/*.vue` [code]; product tour at siaran.my/features [live] |
| Scheduling: future `postDate` + `status: SCHEDULED`; drafts; per-network text and media in one post; first comment | `apps/site/src/pages/docs/posting.mdx`, `apps/api/src/modules/posts.ts` [code] |
| Unlimited connected social accounts on every plan, Free included; billed per organization | `apps/api/src/domain/plans.ts` (no account limit field), `docs/pricing.md` [code, doc]; siaran.my/pricing [live] |
| One post to many networks counts as one post | `docs/pricing.md` "posts.ts consumes 1 per post" [doc]; pricing page [live] |
| Drafts do not count; a scheduled post counts when it leaves DRAFT; retries of a failed post (up to 6) do not count again | `RESOURCE_LIMITS.maxRetries: 6` in `plans.ts` [code]; pricing page "How quotas work" [live] |
| Validation before send: text length, media type, size, duration, aspect ratio checked per network at create time; bad requests get a `400` with an `issues` array pointing at the field | `apps/api/src/modules/posts.ts` (issues array), adapters' `validate` [code] |
| TikTok creator settings (privacy levels, interaction toggles, max duration) read from TikTok before posting | `docs/approvals/tiktok.md` guideline table; adapter [code]. Claimable as a design fact, not as "post to TikTok" (see 2a) |
| Never posts twice: each network target is claimed with a conditional database update and a fresh attempt id; a crashed claim is reconciled by reading the account's recent posts before anything is re-sent | `apps/api/src/engine/publisher.ts` lines 20-23 and 284 [code] |
| Network errors are kept verbatim (code, message, HTTP status) on the post, with a plain-English fix from Siar's error reference | `packages/networks/src/lib/errors.ts` `toVerbose()` [code]; per-network error pages, e.g. siaran.my/tiktok-api/errors returns 200 [live] |
| Per-network reference pages generated from the enforcing code (post types, media rules, daily caps, permissions, error reference) | `apps/site/src/lib/networks.ts`, `pages/[api]/index.astro`, `pages/[api]/errors.astro` [code]; 15 network pages return 200 [live] |
| Webhooks: 16 HMAC-signed event types, retried with backoff (1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h), delivery log, manual resend, test event, secret rotation | `apps/site/src/lib/events.ts` (16 events), `apps/api/src/engine/webhooks.ts` lines 12-14, `system.ts` `webhook.resend` [code] |
| Hosted connect link: your brand name, logo and accent colour; the customer signs in to each network in their own browser and returns to your app; you never see passwords or tokens | `apps/web/src/views/Portal.vue` (brandName, logoUrl, accentColor), `accounts.ts` `socialAccount.createPortalLink` [code]. **The page is on app.siaran.my and shows "Powered by Siar · Siar by FF Dev Studio"** (Portal.vue line 96). So: "branded", never "fully white-label" or "on your domain" |
| Reconnect detection: revoked/expiring grants flagged, `social-account.updated` webhook | events.ts, maintenance engine [code] |
| Rate limits 100 requests/s, 500 per 10 s, 2,000 per minute, per key and endpoint | `apps/api/src/platform/ratelimit.ts` lines 13-15 [code] |
| Auth: organization API key in the `x-api-key` header; keys work across all teams in the organization; up to 50 keys | `app.ts`, `RESOURCE_LIMITS.apiKeys` [code] |
| X usage passed through at X's own USD prices from a prepaid credit (hold before the call, capture on success, release on failure) | `X_PRICES` in `plans.ts`, `apps/api/src/domain/credits.ts` [code]. Prices match X's page: post $0.015, post with URL $0.20, post read $0.005, user read $0.010, delete $0.010, like/repost/follow $0.015, content manage $0.005 (X lists it as "Content: Manage $0.005 per request") [sourced: https://docs.x.com/x-api/getting-started/pricing, checked 2026-11-12]. All seven `X_PRICES` entries match X's page |
| Malaysian organizations buy X credit in ringgit at a rate shown before paying | `X_CREDIT_NOTE` in `apps/site/src/lib/plans.ts`; `USD_MYR_RATE` default 4.20 includes a card/FX buffer over the mid rate [doc: `docs/pricing.md`]. So in ringgit the credit is **not** exactly "at cost". Say "at X's own price, in USD" |
| Link in bio: a public link page per team, with views and clicks per link per day | `apps/api/src/modules/bio.ts`, `apps/web/src/views/Bio.vue` [code]; README screenshots [doc] |
| Comments: publish comments and replies, import comments people left, like/hide/delete where the network allows | content-comments.ts, adapters' `capabilities` [code]. Live for Facebook, Instagram, Threads, X (with X's reply limits), Bluesky, Mastodon, Slack, YouTube. Discord: the bot can post replies and delete them, but there is no comment import (`commentImport: false` in `discord.ts` line 149) [code] |
| Analytics: account and post metrics normalised across networks, raw payload kept | content-analytics.ts [code]. Paid plans only (Free: no analytics) |
| Post history import and CSV bulk import | `content-history.ts`, `content-csv.ts` [code] |
| Teams (brands) and roles: owners, admins, members, audit log | teams.ts, identity.ts [code] |
| Sign in with email or with Google | `docs/approvals/google.md` (live 2026-11-12) [doc]; changelog [live] |
| Wire-compatible with bundle.social's v1 API | See 4 below. True, but **naming bundle.social publicly is parked** |

### 1d. Company facts that may be stated

- Operator: FF DEV STUDIO, SSM 202603234793, Malaysia [code: `apps/site/src/config.ts`].
- Contact: siaran@ffdev.studio and +60 13 907 8719 [code: `config.ts` lines 11-13]. The phone number is in the footer of every page and in the pricing page's JSON-LD `ContactPoint` (`contactType: "customer support"`) [live]. It is a contact line, not a support promise: support is ordinary email support on every plan [doc: `docs/pricing.md`]. Do not turn the number into "phone support" or "WhatsApp support".
- Live since 2026-10-12 on siaran.my, app., api., media. [doc: `README.md` Status].
- Meta App Review approved 2026-10-27 [doc]. Google OAuth verification approved 2026-10-15 [doc]. These are
  facts about Siar's apps; do not turn them into "Meta partner", "Google certified" or any badge.

---

## 2. Built but NOT claimable yet

| Network / feature | Real state (2026-11-12) | Exact allowed wording | Never say |
|---|---|---|---|
| **TikTok** | Content Posting API audit **rejected 2026-10-20** (demo films must be recorded by hand). Production runs on **sandbox keys**: only the sandbox target user (FF's own account) can connect [doc: `docs/approvals/tiktok.md`]. TikTok's own rule for unaudited clients: posts are `SELF_ONLY` (private viewing), the posting account must be private, and at most 5 users can post in 24 hours [sourced: https://developers.tiktok.com/doc/content-sharing-guidelines, checked 2026-11-12]. Health shows `TIKTOK available: true` anyway [live] | "TikTok: built, opening after TikTok approves Siar." | "Post to TikTok", "TikTok scheduling", any demo showing a TikTok post as Posted |
| **TikTok comments** | Need a separate TikTok API for Business app that was never applied for; adapter: "Comments exist only through the Business API" [code: `tiktok.ts` line 242] | Do not mention TikTok comments at all | "TikTok comments in your inbox" |
| **YouTube public uploads** | OAuth approved; API audit + quota submitted 2026-10-15, no answer since [doc]. Uploads locked private [code] | "YouTube: connect and upload now; videos stay private until YouTube's API audit is complete." | "Publish to YouTube" with no qualifier |
| **LinkedIn company pages** | "Siar Pages" Community Management API dev tier: **Access denied**, no reason given [doc: `linkedin.md`, status 2026-11-12]. Org scopes are off in production [code] | "LinkedIn: personal profiles today; company pages open after LinkedIn grants page access." | "Post to LinkedIn company pages", "LinkedIn Pages analytics" |
| **LinkedIn comments/analytics** | Member-post analytics scope (`r_member_postAnalytics`) sits in the org scope group that is off [code: linkedin.ts line 42]. [inferred] LinkedIn comment import and post analytics on profiles probably do not work in production | Leave out until tested on a real profile | "LinkedIn analytics" |
| **Pinterest publishing** | Trial access approved 2026-10-21, keys live 2026-11-12: **connect and read work, creating Pins needs Standard access** [doc: `pinterest.md`]. Adapter returns "The Pinterest app only has Trial access, so it cannot create public pins yet" [code: `pinterest.ts` line 42] | "Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access." | "Post Pins", "Give Pinterest a board" as a live feature |
| **Reddit** | **Parked 2026-10-14**, nothing submitted; `available: false` [doc, live] | "Reddit: built, not open yet." (The dashboard's own label is "Opening soon"; do not give a date) | "Post to subreddits" |
| **Snapchat** | **Parked 2026-10-14**: allowlisting needs a Snap partner contact FF does not have; `available: false` [doc, live] | "Snapchat: built, not open yet." | "Snapchat Stories/Spotlight" as live |
| **Google Business Profile** | **Parked 2026-10-14** (FF not eligible for a profile); the v4 API refuses to enable; `available: false` [doc: `google.md`, live] | "Google Business Profile: built, not open yet." | "Post offers/events to your locations", "manage reviews" |
| **Inbox DMs and comment-to-DM (Facebook, Instagram)** | Meta approved the messaging permissions on 2026-10-27 (`pages_messaging`, `instagram_manage_messages`, `instagram_business_manage_messages` are among the 27) [doc: `meta-review-submission.json`, `meta.md`]. In Siar, DMs are a **beta switch per organization**, off by default (`messagingEnabled @default(false)`); API answers "Direct messages and automations are in beta and are enabled per organization. Contact support to turn them on" [code: `messaging-shared.ts` line 25, `schema.prisma` line 161]. DMs exist for Facebook and Instagram only (`MESSAGING_TYPES`) [code]. Not on Free | Until Fakhrul decides to open it: "Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request (paid plans)." The current site line "opening after Meta approval" is now stale (Meta has approved), see section 6 | "DMs from every network", "auto-DM on TikTok/X", the BM ad "Comment HARGA, terus dapat DM." before the beta is opened to everyone |
| **SDK, CLI, MCP on npm** | `@siar/sdk`, `@siar/cli`, `@siar/mcp` all return **404 on registry.npmjs.org** [live, checked 2026-11-12]. Publishing to npm waits for Fakhrul's go [doc: `docs/PLAN.md` item 12, README] | "TypeScript SDK, CLI and MCP server (version 0.1.0), built from the same OpenAPI contract." Do not print install commands until they are on npm | "`npm i @siar/sdk`", "`npx -y @siar/mcp`", "install the MCP server in one line" |
| **CHIP card payments** | CHIP opened FPX, FPX B2B, DuitNow QR on 2026-11-12; cards not yet approved, so card plans still go through Stripe [doc: pricing.md, README Status] | Say "card" without naming the processor | "Pay by card through CHIP" |

---

## 3. Plans and wording rules

### 3a. The table (source of truth: `apps/api/src/domain/plans.ts`; same on siaran.my/pricing [live])

| | Free | Starter | Pro | Business | Enterprise |
|---|---|---|---|---|---|
| Malaysia, monthly | RM0 | RM39 | RM99 | RM399 | Custom |
| Malaysia, yearly | | RM390 | RM990 | RM3,990 | Custom |
| Elsewhere, monthly | $0 | $19 | $49 | $149 | Custom |
| Elsewhere, yearly | | $190 | $490 | $1,490 | Custom |
| Brands (teams) | 1 | 1 | 10 | Unlimited | Unlimited |
| Posts | 20, one-time | 300 / month | 10,000 / month | 100,000 / month | 1,000,000 / month |
| Comments | 50, one-time | 1,000 / month | 5,000 / month | 50,000 / month | 500,000 / month |
| Uploads | 60, one-time | 3,000 / month | 100,000 / month | 1,000,000 / month | 10,000,000 / month |
| Connected social accounts | Unlimited | Unlimited | Unlimited | Unlimited | Unlimited |
| Analytics | No | Yes | Yes | Yes | Yes |
| DMs per account / month (beta, FB + IG) | 0 | 500 | 1,000 | 5,000 | 10,000 |
| Comment-to-DM runs per account / month (beta) | 0 | 200 | 1,000 | 5,000 | 10,000 |
| Free trial | | | 14 days | | |
| Daily caps | Free caps | Pro caps | Pro caps | Business caps | Business caps |

Enterprise numbers are starting points; each Enterprise organization can have its own quotas [live: pricing page].

### 3b. Wording rules

1. **Free is one-time.** Write "20 free posts to try" (or "a one-time allowance of 20 posts"). Never a bare "20 posts",
   never "20 posts a month", never "free forever plan". Free never resets, has no time limit, needs no card, and is counted
   per social account across organizations, so reconnecting the same account in a new organization does not refill it
   [code: `plans.ts` `oneTime`, doc: pricing.md].
2. **Per organization, never per connected account.** "Unlimited social accounts on every plan." Plans are fenced by
   brands and volume. Do not write "unlimited everything": posts, comments, uploads and brands are capped.
3. **Brands = teams.** Starter 1, Pro 10, Business and Enterprise unlimited. Do not promise "unlimited clients" below Business.
4. **Currency by billing country.** Ringgit for organizations billed in Malaysia, US dollars everywhere else. The billing
   country comes from the first checkout (Cloudflare country, MY when unknown) and the owner can change it for the next
   checkout [doc: pricing.md]. Never show only USD to a Malaysian audience; never show ringgit prices as the overseas price.
5. **Yearly = 10x monthly**, shown as "2 months free".
6. **Price lock.** Exact line: "Your price never goes up while you stay subscribed." (`PRICE_LOCK` in
   `apps/site/src/lib/plans.ts`). A subscription renews at the amount it started at [code: `billing-core.ts`, doc].
7. **Payments.** Monthly: card, renewed automatically. Yearly: card, or (Malaysia) paid once by **FPX or DuitNow**
   (`ONCE_METHODS` in `plans.ts`), renewed by a link that opens 30 days before the end; reminders 7 and 1 days before;
   3 days' grace, then the organization moves to Free. No GrabPay claim. Elsewhere: card only.
8. **Trial.** 14 days, Pro only, once per organization, on its first paid plan, by card.
9. **No SST line.** FF DEV STUDIO is not SST-registered, so prices are final [doc: pricing.md]. Do not write "inclusive of SST" or "plus SST".
10. **Enterprise.** "Custom. Talk to us." Higher volume, invoices, custom limits, and an SLA by contract. No price, no SLA figures.
11. **Support.** "Email support on every plan." No "priority support", no WhatsApp line, no reply-time promise.
12. **Pricing page has no competitor names.** Comparisons go on `/compare/*` pages with sourced, dated competitor facts.

---

## 4. Differentiators that are true in code

| Differentiator | Allowed wording | Evidence | Caveat |
|---|---|---|---|
| bundle.social v1 wire compatibility | "Speaks the bundle.social v1 API: same paths under `/api/v1`, same `x-api-key` header, field names and error shape. An app built for it switches by changing the base URL." | I compared method+path sets: all **194** operations in bundle.social's spec of 2026-10-11 (`docs/reference/2026-10-11/swagger.json`) exist in Siar's live spec; Siar adds 76 of its own [measured]. bundle.social's **current** spec (`https://api.bundle.social/swagger-json`, fetched 2026-11-12) has 197; **3 are missing in Siar**: `GET /misc/tiktok/locations`, `GET /misc/tiktok/post-settings`, `GET /organization/usage/messages` [measured] | (1) Naming bundle.social on the site is a **parked owner decision** (`docs/geo/brief.md`, `owner-todo.md`); the live site does not name it today [live]. (2) Say "compatible with the v1 API as of October 2026", not "100% compatible", until the 3 new operations are added. (3) Never "Siar is bundle.social" or "official alternative" |
| Pay by business, not by channel | "Unlimited social accounts on every plan, from RM39 / $19 a month." | plans.ts | Free is one-time |
| Priced for Malaysia | "Ringgit prices for Malaysian organizations; pay yearly once by FPX or DuitNow; paid to a Malaysian company." | plans.ts, pricing.md | Do not claim "no FX fees" for cards issued abroad |
| Validation before send | "Each network's limits are checked when you create the post, so a bad request fails with a 400 you can fix, not at 9 a.m." | posts.ts issues, adapters | Network-side rejections can still happen; then the verbatim error applies |
| Never posts twice | "Each network target is claimed once. Retries, restarts and double clicks cannot publish the same post again." | publisher.ts | This is a design guarantee, not a measured rate. No "0 duplicates across N posts" |
| Verbatim network errors | "If a network says no, you get its own code and message, plus a plain-English fix." | errors.ts, error reference pages | Mastodon's adapter has no `errorReference` list [code]; its error page (siaran.my/mastodon-api/errors, 200) says Mastodon has no stable error codes, so there is no code table, and Siar relays the HTTP status and message [live] |
| Per-network error reference pages | "Every network has a public error reference generated from the code." | `/[api]/errors` pages, 200 [live] | |
| Hosted connect | "A branded connect link (your name, logo, colour). Customers sign in to each network themselves; you never touch a password or token." | Portal.vue, accounts.ts | "Powered by Siar" footer, Siar domain. Not "white-label". `language` is stored but **not used**: the page is English only [code: Portal.vue has no language handling; `language` is only written in accounts.ts line 235] |
| MCP server, CLI, SDK | "An MCP server with 19 tools, a JSON-first CLI and a typed TypeScript SDK, all generated from the same OpenAPI contract." | `packages/mcp/README.md` (19 tools listed), `packages/cli/README.md`, `packages/sdk` [code] | **Not on npm** (404). No install commands until published |
| Webhooks with replay | "16 HMAC-signed events, retried with backoff, with a delivery log you can inspect and resend." | events.ts, webhooks.ts | The backoff runs about 45 hours in total (sum of the steps), not "a day" |
| X at cost | "X usage is passed through at X's own USD prices from a prepaid credit; Siar adds no markup on X." | X_PRICES = X's price list [sourced] | Ringgit purchases use a rate with a card/FX buffer (4.20 default). "At cost" holds in USD |
| One post counts once | "A post sent to every connected network counts as one post." | pricing.md, posts.ts | |
| Daily caps follow the network identity | "Disconnecting and reconnecting, or adding the account to another team, does not reset its daily cap." | pricing page [live], plans.ts | |
| Link in bio included | "Each team gets a link-in-bio page with views and clicks per link, at no extra cost." | bio.ts, Bio.vue | |
| Dashboard and API are the same thing | "The dashboard is a client of the same API you get." | apps/web calls `/api/v1` [code] | |
| TikTok-guideline-complete composer | "The TikTok composer follows TikTok's content-sharing guidelines line by line." | tiktok.md table [doc] | Only usable once TikTok approves; do not use as a TikTok selling point yet |

---

## 5. Never claim

- **Customers, users, logos, testimonials, case studies, reviews, ratings.** None exist [doc: `owner-todo.md` "None exists yet"].
  No AggregateRating/Review schema.
- **Usage numbers:** posts published, accounts connected, organizations, messages sent, "trusted by", "thousands of".
- **Uptime, availability percentages, SLA figures**, "99.9%", "enterprise-grade reliability". The only allowed SLA
  wording: "Enterprise: custom limits and an SLA by contract. Talk to us." The health endpoint's "All systems operational"
  is a status string, not a record.
- **Speed and latency numbers** as facts: "posts in 400 ms", "first post in five minutes", "minutes to integrate".
  None are measured. The home page shows both (see section 6).
- **Reply times or support hours** ("we reply within 24 hours", "24/7 support", "priority support", WhatsApp support).
- **Certifications and badges:** SOC 2, ISO 27001, GDPR certification, PDPA compliance claims beyond what the privacy
  policy says, "Meta Business Partner", "TikTok partner", "Google verified partner", "official API partner".
- **Affiliation:** "official", "endorsed by", "integrated partner" of any network. The site's own line stands: "not
  affiliated with or endorsed by any of them".
- **Network availability without approval:** see section 2. Also no "every network", "all 15 networks" for any
  feature (publishing, comments, DMs, analytics, Free plan).
- **"Unlimited"** for anything except connected social accounts and (Business/Enterprise) brands.
- **"Free forever" / "free monthly posts".**
- **Security specifics not in code:** "bank-grade encryption", "end-to-end encrypted". Allowed: "tokens are encrypted at
  rest and never returned by the API" [doc: meta.md data-use answer; README "Tokens are encrypted and never returned"].
- **Install commands for npm packages** that are not published.
- **Fully white-label / custom domain** for hosted connect.
- **Comparisons** that state a competitor's price, limit or network list without the competitor's own URL and
  "checked <date>". bundle.social by name only after Fakhrul lifts the parked decision.
- **Malaysian SME BM ads that depend on TikTok or DMs** ("Comment HARGA, terus dapat DM.") until those are open to
  everyone [doc: pricing.md "Timing"].

---

## 6. Live-site copy that over-claims (checked 2026-11-12)

Each item: page, exact live text, the problem, and the fix that matches sections 1-5. Code location given so it can be changed.

### Home (https://siaran.my)

1. **Hero demo "Going out 16 Oct"** shows `"TIKTOK"` and `"GOOGLE_BUSINESS"` in the request and the rows
   "TikTok Video 1120 ms ... Posted", "LinkedIn Company page 698 ms ... Posted", "Google Business 3 outlets 873 ms ... Posted".
   TikTok is sandbox-only, LinkedIn company pages are denied, Google Business is parked. The millisecond timings read
   as measurements. Code: `apps/site/src/components/home/ApiPanel.astro` lines 11-25.
   Fix: use live networks only (Instagram, Facebook, Threads, LinkedIn profile, X, Bluesky) and drop the ms figures or label the panel "Example".
2. **"Live siar · events" feed** includes `token.refreshed tiktok`, `media.converted youtube mov → mp4 1080p`,
   `post.published linkedin company page`, `retry pinterest 503 ... → ok`, and (in source) `account.flagged reddit`,
   `post.published google business 3 locations`, `validation tiktok`, plus a made-up handle `@kopisenja` and timings.
   Labelled "Live", so it reads as real activity. Code: `apps/site/src/components/home/EventLog.astro` lines 4-15 (the `lines` array; "Live" label on line 22).
   Fix: remove "Live" (call it "Example events"), and use live networks only.
3. **"One request. 15 networks."** and lead "Siar knows the rules for every one... a Reddit link post, a Google Business offer".
   Fix: "Built for 15 networks" plus the open/opening split from 1a.
4. **Flow step 03:** "Give Threads a shorter line, Instagram a first comment, **Pinterest a board**." Pinterest cannot publish yet.
   Code: `apps/site/src/components/home/Flow.astro` line 13. Fix: swap Pinterest for a live network (e.g. "X a thread").
5. **Flow step 05:** "with comments and **DMs** in a shared inbox." DMs are a per-organization beta, FB + IG only.
   Code: Flow.astro line 15. Fix: "comments in a shared inbox; Facebook and Instagram DMs in beta".
6. **Developers block:** `claude mcp add siar -e SIAR_API_KEY=sk_live_... -- npx -y @siar/mcp`. `@siar/mcp` is not on npm,
   so this command fails for anyone who runs it [live: npm 404]. Same commands on `/docs/sdk-cli-mcp` and in
   `apps/site/src/lib/snippets.ts`. Fix: publish the packages (Fakhrul's go) or remove the commands.
7. **"First post in five minutes."** Not measured. Fix: "Your first post is one request away." (the exact line already used on /platforms and /features [live]).
8. **Price calculator, server-rendered default:** "Brands you look after 40 ... Your plan, billed monthly RM99 /mo Pro ...
   Per account RM0.41". Pro allows 10 brands; 40 brands needs Business (RM399, about RM1.66 per account). The script
   corrects it in the browser, but the static HTML (what crawlers and AI fetchers read) is wrong.
   Code: `apps/site/src/components/home/PriceCalc.astro` lines 10-24. Fix: default to a combination Pro actually covers
   (e.g. 8 brands) or render the computed values at build time.
9. **FAQ "Which social networks does Siar support?"** answers "15 networks: TikTok, YouTube, ..." with no status. This is also
   in the FAQPage JSON-LD, so AI answers will repeat it. Fix: list open networks, then "opening after approval: ...".
10. **FAQ "Do I need developer apps on every network? No. Accounts connect through the network apps Siar operates."**
    True only for the open networks. Fix: add "for the networks that are open today".
11. Hero badge "Free plan · 20 posts to try · no card" is acceptable but not the canonical "20 free posts to try". Low priority.

### Product tour (https://siaran.my/features)

12. **Inbox:** "Comments on your posts and **direct messages from every connected network**". DMs: FB + IG only, beta.
    Image alt: "customer comments from Threads, Facebook and **TikTok**". Code: `apps/site/src/pages/features.astro` line 17.
13. **Hosted connect:** "One link for any set of networks, **in your client's language**". The portal is English only; the
    `language` field is stored and never used. "Channel picking after sign-in: Pages, **company pages**, channels, **locations**":
    company pages denied, locations parked. Code: features.astro line 19.
14. **"Google Business: Reviews, replies, hours, offers and events for every location"** extra tile. Parked. Code: features.astro line 25.
15. "One dashboard. 15 networks." headline: same fix as item 3. (The page does honestly say it runs on demo data.)

### Networks (https://siaran.my/platforms and per-network pages)

16. "15 networks. One integration." with no status per network; the comparison table shows TikTok, Pinterest, Reddit,
    Google Business, Snapchat capabilities as if usable. Fix: a status column (Open / Opening after approval / Not open yet)
    driven from one constant, not from the health endpoint (see section 0).
17. **TikTok page** (`/tiktok-api`): "Comments and replies: Yes", "Import comments: Yes". Needs the TikTok Business API app that
    was never applied for [code: tiktok.ts line 242]. Also "Comment length 150 characters" here vs "TikTok 1,200" in the
    pricing page's comment-length table: the two live pages disagree (adapter `commentMax: 150` vs `COMMENT_LENGTH.TIKTOK: 1200` in plans.ts).
18. **LinkedIn page** (`/linkedin-api`): "A LinkedIn member profile, or a company page the member administers." Company pages denied.
    Code: `apps/site/src/lib/networks.ts` line 28 (`account` and `about`; line 29 is Pinterest).
19. **YouTube page:** privacy "One of: PRIVATE PUBLIC UNLISTED" with no note that uploads are locked private until the audit.
20. **Google Business Profile, Snapchat, Reddit, Pinterest pages** describe publishing with no status line.

### Pricing (https://siaran.my/pricing, /pricing.md)

21. "Every plan connects unlimited social accounts **across all 15 networks**." Fix: "...on every network Siar has open".
22. Free plan tagline **"Try every network"** (also in `/pricing.md`, from `PLANS.FREE.tagline` in `plans.ts`). Fix: e.g. "Try Siar".
23. Plan cards: "**All networks**, API, SDK, CLI, MCP, webhooks" on every plan, and table row "All 15 networks, API, SDK, CLI, MCP,
    webhooks: Included". Over-claims networks, and SDK/CLI/MCP are not installable from npm.
24. "Inbox and comment-to-DM: Facebook and Instagram, **opening after Meta approval**." Now **stale the other way**: Meta
    approved on 2026-10-27; DMs are a per-organization beta. Same line in the dashboard (`apps/web/src/views/Billing.vue` line 303)
    and `INBOX_NOTE` in `apps/site/src/lib/plans.ts`. Fakhrul decides the new wording (section 2 has a suggestion).

### Changelog (https://siaran.my/changelog)

25. "Pricing: Free, Pro, Business and Enterprise plans" omits **Starter**. "15 networks: TikTok, ..." stated as released.
26. "Tooling: TypeScript SDK, JSON-first CLI and MCP server (all version 0.1.0)" implies they are available; not on npm.

### Dashboard (app.siaran.my), product copy

27. Connect list marks TikTok and Pinterest as ready because health reports them `available` (`apps/web/src/views/Accounts.vue`
    line 256 `ready(n.type)`). A customer can start a TikTok connect that only the sandbox user can finish, and connect
    Pinterest but not publish. [inferred from code + health; not clicked through]
28. DM gate error says "Upgrade to Pro or higher to send DMs" but Starter includes 500 DMs; the check itself only blocks Free
    (`apps/api/src/modules/messaging-shared.ts` lines 35-36). Fix: "Upgrade to Starter or higher".

### Smaller accuracy items

29. Webhooks "retried with backoff **for a day**" (home, from `apps/site/src/pages/index.astro` line 40; and `docs/geo/facts.md`). `/docs/webhooks` does **not** say this: it lists the real schedule (1 min to 24 h) [live]. Code retries over about 45 hours (44 h 36 min). Under-claim; fine to leave or say "for up to two days".

---

## 7. Internal docs that are out of date (fix before anyone copies from them)

| File | Says | Truth |
|---|---|---|
| `docs/geo/facts.md` | "API size: 263 operations"; "16 signed event types, retried with backoff for a day"; "Networks: 15" with no status | 270 operations live; ~45 h of retries; see section 1a/2 for status |
| `README.md` | "REST API (OpenAPI 3.1)", "contract/ OpenAPI 3.1 document"; badge "API: 262/262 operations"; badge "Status: built, not deployed"; "12 networks live (Pinterest, Reddit, Snapchat, Google Business show 'Opening soon')"; "Reply: Comments and DMs from every network in one inbox" | OpenAPI 3.0.2; 270 operations; live since 2026-10-12; 12 have keys but only 9 publish fully (+YouTube private); Pinterest now has keys; DMs FB + IG beta |
| `docs/pricing.md` "What not to claim yet" | Inbox and comment-to-DM "opening after Meta approval until App Review passes" | App Review passed 2026-10-27; feature is a per-org beta |
| `docs/approvals/README.md` tracker | TikTok "submitted 2026-10-13, in review"; YouTube OAuth "in review"; LinkedIn "dev tier submitted, in review" | Status table in the same file is current: TikTok rejected, Google OAuth approved, LinkedIn Pages denied |
| `docs/approvals/meta-review-submission.md` | "Submitted 2026-10-14; review in progress" | Approved 2026-10-27 (meta.md) |
| Research brief for this team | "OpenAPI 3.1, ~263 operations" | OpenAPI 3.0.2, 270 operations |

---

## 8. Quick reference: one-line answers copywriters can reuse

- What is Siar? "Siar is a social media API and dashboard by FF Dev Studio in Malaysia: one REST API to publish, schedule,
  reply to and measure posts, with a dashboard built on the same API."
- How is it priced? "Per organization, never per connected account. 20 free posts to try, then from RM39 a month in Malaysia
  or $19 elsewhere, with unlimited social accounts on every plan. Your price never goes up while you stay subscribed."
- Which networks? "Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack.
  YouTube uploads work but stay private until YouTube's audit completes. TikTok, Pinterest publishing, LinkedIn company pages,
  Reddit, Snapchat and Google Business Profile are built and open as each network approves Siar."
- Can I switch from bundle.social? Hold until the naming decision. When cleared: "Siar speaks the bundle.social v1 API as of
  October 2026; most apps switch by changing the base URL."

---

## 9. Verification log (2026-11-12, adversarial re-check)

Re-checked against the primary source; everything not listed under "Corrected" held.

- **Live API** [measured]: `GET https://api.siaran.my/api/v1/` returns `available: true` for 12 networks (TIKTOK, YOUTUBE, INSTAGRAM, FACEBOOK, TWITTER, THREADS, LINKEDIN, PINTEREST, MASTODON, DISCORD, SLACK, BLUESKY), `false` for REDDIT, GOOGLE_BUSINESS, SNAPCHAT.
- **OpenAPI** [measured]: live `https://siaran.my/openapi.json` = `packages/contract/openapi.json` = 3.0.2, 207 paths, 270 operations. bundle.social: 2026-10-11 spec 194 operations, all present in Siar; Siar adds 76; current `https://api.bundle.social/swagger-json` has 197, the same 3 missing in Siar.
- **npm** [measured]: `@siar/sdk`, `@siar/cli`, `@siar/mcp` all 404 on registry.npmjs.org.
- **X prices** [sourced]: all seven match https://docs.x.com/x-api/getting-started/pricing.
- **Plans** [code + live]: every row of 3a matches `apps/api/src/domain/plans.ts` and the live pricing page (incl. Enterprise "starting points" line, 14-day trial, yearly = 10x).
- **Code citations** checked line by line: linkedin.ts 40-53/42, youtube.ts 384, tiktok.ts 242 (+ `commentMax: 150` line 249), pinterest.ts 42, publisher.ts 20-23/284, ratelimit.ts 13-15, webhooks.ts 12-14, events.ts (16 events), Portal.vue 96, accounts.ts 235, Accounts.vue 256 (`ready()` = health `available`), messaging-shared.ts 25/35-36, schema.prisma 161, Billing.vue 303, plans.ts `INBOX_NOTE`/`PRICE_LOCK`/`X_CREDIT_NOTE`, Flow.astro 13/15, ApiPanel.astro, PriceCalc.astro, features.astro 17/19/25, MCP README (19 tools, and 19 tools registered in `packages/mcp/src/server.ts`).
- **Live-site quotes in section 6**: each one fetched and found on its page on 2026-11-12 (home, /features, /platforms, /tiktok-api, /linkedin-api, /youtube-api, /pricing, /pricing.md, /changelog, /docs/sdk-cli-mcp). Every network page and its `/errors` page returns 200 (X is `/x-api`, Google Business is `/google-business-profile-api`).
- **"Who ranks" claims**: this file makes none, so no search re-run applies here.

Corrected: (1) X "Content: Manage $0.005" is on X's page, no longer unverified; (2) `/docs/webhooks` does not say "for a day"; (3) LinkedIn copy is `networks.ts` line 28, not 29; (4) the /platforms line is "Your first post is one request away."; (5) Discord was missing from the comments list (reply + delete, no import); (6) the public phone number +60 13 907 8719 was missing from company facts; (7) Mastodon error page is measured, not inferred; (8) EventLog line range.
