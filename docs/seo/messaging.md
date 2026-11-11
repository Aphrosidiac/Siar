# Siar messaging

Checked 2026-11-12. Companion to `docs/seo/strike-plan.md`. Every page, ad, directory listing, roundup pitch and social
post about Siar follows this file.

Facts come from `research/siar-truth.md`, as corrected by `strike-plan.md` §2. If a line needs a fact that is in
neither file, it does not go out until the fact is added with evidence.

**Labels used here:**
- **[code]** / **[doc]**: this checkout.
- **[sourced]**: the vendor's own page, checked 2026-11-12.
- **[inferred]**: judgement.

---

## 1. Positioning

### The line

> **Siar is the unified social media API where every post is accounted for.**

### In one breath

Put this next to the line on the home page, `/about` and listings:

> Siar checks each post against each network's rules before it goes, sends it to each account once, and tells you what
> happened, in the network's own words, through a signed webhook. You pay one price for your organization, not for each
> account: 20 free posts to try, then from $19 a month (RM39 in Malaysia).

### What "accounted for" means, and the only thing it may mean

- Every post ends in a recorded state: **posted**, **failed** (with the network's own reason and a fix), or **could not
  be confirmed** (when an interrupted send cannot be checked).
- You are told which one.
- It is a promise about **knowing**, not about delivery. Networks still reject posts. Siar promises no uptime and no
  success rate.

Every use of the line is followed, on the same screen, by at least one mechanism from pillar 1.

### Canonical entity paragraph

Use it word for word in the home FAQ, `/about`, the top of `/llms.txt` and `/pricing.md`, the GitHub README, every
directory listing and every pitch. Generate it from the plan and status constants, so it changes the day a network
opens.

> Siar is a unified social media API and dashboard by FF Dev Studio, a software studio in Malaysia. It checks each post
> against each network's rules before sending, sends it to each connected account once, returns the network's own
> error with a plain-English fix, and reports the result through signed webhooks that are retried for about 45 hours.
> It is priced per organization, not per connected account: 20 free posts to try, then from $19 a month (RM39 in
> Malaysia). Publishing is open today on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord
> and Slack. YouTube uploads work, and public visibility is not yet confirmed. TikTok, Pinterest publishing and
> LinkedIn company pages are waiting on those networks' approval. Reddit, Snapchat and Google Business Profile are built
> but not open yet.

---

## 2. Message hierarchy

Five levels. Every surface uses them in this order unless the table below says otherwise.

| Level | What it says | Exact allowed lines |
|---|---|---|
| 1. Category + idea | What Siar is and what makes it different | "Unified social media API. Every post accounted for." |
| 2. Mechanism | Proof of level 1 (pick 2–4 for the space) | "Checked against each network's rules before it's sent." · "Each account gets your post once." · "If a network says no, you get its own code and message, plus the fix." · "A signed webhook tells you how it went, retried for about 45 hours." · "Every network's status, with dates." |
| 3. Price line | The unit, the entry price and the scale number | "One price per organization, not per account. From $19 a month (RM39 in Malaysia). Unlimited brands on Business: $149 (RM399)." Then: "Your price never goes up while you stay subscribed." |
| 4. Status line | What is open, from the status constant only | Section 9 |
| 5. Trust line | Who you pay | Global: "FF DEV STUDIO (SSM 202603234793), Malaysia. Meta App Review passed on 27 October 2026." Malaysian price pages: "Paid to FF DEV STUDIO (SSM 202603234793), a Malaysian company · ringgit · yearly paid once by FPX or DuitNow · a numbered receipt for every payment · your price never goes up while you stay subscribed · cancel any time, nothing is deleted." |

| Surface | Order |
|---|---|
| Home | 1 → 2 → 3 → 4 → 5 |
| `/pricing`, `/ms/harga` | 3 → 5 → 4 → 2 |
| Network hubs | 4 (status first) → the how-to answer → 2 |
| Error and gate pages | The answer to the error or the gate first; 2 as a three-line "How Siar handles this" box |
| Compare pages | The dated table → "where <rival> is the better choice" → 2 → 3 |
| `/for-agencies`, `/malaysia` | 3 (Malaysian or agency form) → 5 → 4 → 2 |
| Directory listings, pitches | Canonical paragraph, then the price line |

---

## 3. The three pillars

The pillars follow a buyer's path: connect, publish, pay. The positioning line never changes. Segment pages may change
the pillar order (section 4).

### Pillar 1: Every post accounted for

**Promise.** You always know what happened to a post, and why.

**Proof** (all [code] unless marked):

| Claim (allowed wording) | Evidence | Show it on |
|---|---|---|
| "Each network's limits are checked when you create the post, so a bad request fails with a `400` you can fix, not at 9 a.m." | `apps/api/src/modules/posts.ts` (`issues` array), adapters' `validate` | `/how-publishing-works#checked`, posting use case |
| "Each network target is claimed once. Retries, restarts and double clicks cannot publish the same post again." | `engine/publisher.ts`: conditional claim with a fresh attempt id | `#sent-once` |
| "If a send is interrupted, Siar looks for the post on the account before sending again. Where a network gives no way to look, Siar stops and marks it 'could not be confirmed' instead of risking a second post." | `publisher.ts` `staleClaims` (claims older than 20 minutes) | `#sent-once` |
| "If one network fails, the others still publish. Retrying the post re-sends only the networks that failed." | `posts.ts` `post.retry` resets only `ERROR` targets | `#errors`, scheduling use case |
| "If a network says no, you get its own code and message, plus a plain-English fix and a verdict: retry, don't retry, or unknown." | `packages/networks/src/lib/errors.ts` | `#errors`, `/errors` |
| "147 error codes, by network, generated from the code that relays them." | Network error pages [live] | `/errors` |
| "A signed webhook tells you how it went. `post.published` fires when a post has published or failed, with each network's result. Failed deliveries are retried 7 times over about 45 hours (1 minute up to 24 hours), with a log you can inspect and resend." | `engine/webhooks.ts` lines 12–14; `publisher.ts` line 255 | `#webhooks`, `/use-cases/social-media-webhooks` |
| "16 HMAC-signed event types; test events and secret rotation." | `apps/site/src/lib/events.ts`; `system.ts` `webhook.resend` | Webhooks use case and docs |
| "Revoked or expiring connections are flagged, with a `social-account.updated` webhook." | `events.ts`, maintenance engine | `#accounts` |
| "Drafts don't count. Retrying a failed post (up to 6 times) doesn't count again." | `plans.ts` `RESOURCE_LIMITS.maxRetries: 6`; pricing page | `/pricing` |

**It must never become:**
- "never fails", "guaranteed delivery", "100% delivered", "reliable" (alone);
- any rate or count of posts;
- "idempotent API";
- "flagged before your next post fails";
- "the only API that…".

**Concede, plainly:**
- Networks still reject posts.
- There is no client idempotency key on post creation, so resending a create call makes a second post.
- Zernio lists more webhook event types (158) and endpoints.
- Siar allows 5 webhook endpoints per organization.

### Pillar 2: Your customers connect through Siar's live apps, under your brand

**Promise.** You don't build nine OAuth flows or sit through Meta's review. Your customers sign in themselves, through
a link with your name on it, and you can see exactly what is open.

**Proof:**

| Claim (allowed wording) | Evidence | Show it on |
|---|---|---|
| "Facebook, Instagram and Threads connect through Siar's Meta app, which passed Meta's App Review on 27 October 2026, with all 27 permissions it asked for." | [doc] `docs/approvals/meta.md` (submitted 14 October, approved 27 October after a same-day resubmission) | `/facebook-api/meta-app-review`, `/platforms/approvals`, Meta hubs |
| "X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack connect through Siar's own apps, which are live today." | [doc] `docs/approvals/README.md` status table | `/platforms` |
| "A branded connect link: your name, logo and color. Customers sign in to each network in their own browser and come back to your app. You never see a password or token." | `apps/web/src/views/Portal.vue`, `accounts.ts` `socialAccount.createPortalLink` | `/use-cases/hosted-connect-oauth` |
| "Tokens are encrypted at rest and never returned by the API." | [doc] README; Meta data-use answer | Connect and security sections |
| "Every network's status, with dates: what is open, what is waiting, and since when." | `/platforms`, `/platforms/approvals` (built in Wave 0 / W1) | Everywhere networks are named |

**It must never become:**
- "skip the review" for any network but Meta;
- "Meta partner", "approved by Meta" as a badge, "official";
- "white-label", "your domain", "in your customer's language";
- "every network", "all 15 networks".

**Concede, plainly:**
- The connect page says "Powered by Siar", runs on app.siaran.my and is in English.
- What is not open yet:
  - TikTok: the audit has not passed.
  - YouTube: public uploads are not yet confirmed.
  - Pinterest publishing: needs Standard access.
  - LinkedIn company pages: page access was denied.
  - Reddit, Snapchat and Google Business Profile: not open.
- Several rivals hold more network approvals.

### Pillar 3: One price for the whole organization

**Promise.** You pay for your organization, fenced by brands and posts, not for each account you connect. The price
never goes up while you stay.

**Proof:**

| Claim (allowed wording) | Evidence |
|---|---|
| "No per-account fees. Each brand connects one account on every open network: Starter 1 brand, Pro 10, Business unlimited." (the default until Fakhrul rules; `strike-plan.md` §10 decision 3) | `plans.ts` (no account limit); `schema.prisma` line 4 (one live account per network per team) [code] |
| Starter: $19 / RM39 a month, 1 brand, 300 posts. Pro: $49 / RM99, 10 brands, 10,000 posts, 14-day trial. Business: $149 / RM399, unlimited brands, 100,000 posts. Enterprise: custom. Yearly = 10× monthly ("2 months free"). | `plans.ts` [code] |
| "A post sent to every connected network counts as one post." | `posts.ts`, pricing page |
| "Your price never goes up while you stay subscribed." | `PRICE_LOCK` [code] |
| "20 free posts to try. No card." (one-time) | `plans.ts` `oneTime` [code] |
| "Ringgit prices for Malaysian organizations. Card monthly, or pay a year once by FPX or DuitNow. A numbered receipt for every payment." | `ONCE_METHODS`; `billing-core.ts` (SIAR-YYYY-NNNNN) [code] |
| "Cancel any time from the dashboard. The plan runs to the end of the paid period, then moves to Free. Nothing is deleted." | `refunds.mdx` [code] |
| "The API is on every plan, Free included." | siar-truth §4 |

**It must never become:**
- "cheapest";
- "unlimited accounts" alone, or "unlimited everything";
- "free plan", "free forever" or a bare "20 posts";
- "no FX fees";
- "at cost" for X in ringgit.

**Concede, plainly:**
- Not cheapest at 1 brand: Zernio is free for 2 accounts; Post for Me and Publer's API cost $10.
- Not cheapest at 10 brands: PostWire $29 ([pricing](https://postwire.io/pricing)), SocialAPI.ai $29, Outstand $33,
  Upload-Post $39.
- Posts are capped every month.
- The free start is one-time.

The scale number (unlimited brands and 100,000 posts for $149) is where Siar wins.

---

## 4. Per-segment messages

Each segment: who they are, the lead line, what follows, what to concede, the call to action, and the pages that carry
it.

### 4.1 SaaS builders adding social publishing (Pro, Business)

- **Lead:** "Add social publishing to your product without building nine integrations or sitting through Meta's review."
- **Then:**
  - "Your customers connect through a link with your brand. You never touch a token."
  - "Every post accounted for: checked before sending, sent once, the network's own error, a signed webhook."
  - "Business: unlimited brands and 100,000 posts for $149 a month."
- **Concede:** TikTok, public YouTube, Pinterest publishing and LinkedIn company pages are not open yet.
- **CTA:** "Start the 14-day Pro trial" · "Read the quickstart".
- **Pages:** `/use-cases/multi-tenant-social-media-api`, `/how-publishing-works`, `/guides/social-media-api-pricing`.

### 4.2 Developers leaving a per-profile or per-account API (Ayrshare, Zernio, Upload-Post, Blotato)

- **Lead:** "Pay for your organization, not for every profile or account you connect."
- **Then:**
  - The dated scenario table, with sources.
  - "A post sent to every connected network counts as one post."
  - The price lock.
  - "20 free posts to try. No card."
- **Concede:**
  - Rivals have more networks and unlimited posts.
  - Some have free tiers that reset each month.
  - Siar is not cheapest at 1 or 10 brands.
- **CTA:** "Start with 20 free posts".
- **Pages:** `/compare/ayrshare`, `/compare/zernio`, `/compare/upload-post`, the pricing explainer.

### 4.3 Developers leaving a dashboard tool's API (Buffer, Hootsuite, Sprout Social, Metricool, Publer)

- **Lead:** "Your customers connect their own accounts in your product. They don't need a Buffer account."
  Swap in the tool's name per page.
- **Then:**
  - "One REST API with a public OpenAPI file."
  - "Signed webhooks and a comments API, on every plan."
  - Buffer only: "Buffer's legacy REST API stops returning data on 1 February 2027; the next brownout is 9 December
    2026." ([source](https://buffer.com/resources/legacy-rest-api-retired/), checked 2026-11-12)
- **Concede:**
  - Siar is not compatible with Buffer's REST API: you rewrite either way.
  - Buffer has a free plan and a hosted MCP.
  - Hootsuite's MCP now publishes.
  - Each tool has analytics and listening depth Siar lacks.
- **CTA:** "Get an API key".
- **Pages:** `/compare/buffer-api`, `/compare/hootsuite-api`, `/compare/metricool-api`, `/compare/publer-api`,
  `/compare/sprout-social-api`.

### 4.4 Developers stuck at a network's gate (Meta review, tokens, error codes)

- **Lead:** "Facebook, Instagram and Threads through an app that passed Meta's App Review on 27 October 2026."
- **Then:**
  - The exact error and its fix.
  - Siar's own approval record (14 to 27 October).
  - "Revoked or expiring connections are flagged, with a webhook."
- **Concede:** Siar faces the same gates on TikTok, YouTube, Pinterest and LinkedIn Pages, and says so on the page.
- **CTA:** "Start with 20 free posts".
- **Pages:** `/facebook-api/meta-app-review`, `/errors`, the error pages, `/platforms/approvals`, token guides.

### 4.5 Agencies and freelancers (global in USD, Malaysia in ringgit)

- **Lead, Malaysia:** "10 clients, RM99. Your clients connect their own accounts; you never ask for a password."
- **Lead, elsewhere:** "10 brands for $49 a month. Each client connects through a link with your name and logo."
- **Then:**
  - "Answer comments from Facebook, Instagram, Threads, X, Bluesky and Mastodon in one inbox."
  - "Plan a month for a client in a CSV and schedule it at once."
  - "Each brand gets a link-in-bio page with views and clicks per link."
  - "Account and post analytics on every paid plan."
  - "Building your own client portal? The same API is on every plan."
- **Concede:**
  - One account per network per brand (a client with two Facebook Pages uses two brands).
  - No client logins, approval step or report export today.
  - TikTok and LinkedIn company pages are not open.
  - The dashboard is in English.
- **CTA:** "Start the 14-day Pro trial".
- **Pages:** `/for-agencies`, `/malaysia`, `/compare/zoho-social`, the Malaysian cost guide.

### 4.6 Malaysian businesses running one brand (Starter)

- **Lead (BM):** "Post sekali, keluar kat Facebook, Instagram, Threads dan X. RM39 sebulan."
- **Lead (English):** "Post once to Facebook, Instagram, Threads and X. RM39 a month."
- **Then:**
  - Ringgit, with yearly paid once by FPX or DuitNow.
  - A Malaysian company and numbered receipts.
  - Comments in one inbox.
  - "20 free posts to try."
- **Concede:**
  - Meta Business Suite is free for Facebook and Instagram.
  - No TikTok yet and no WhatsApp.
  - DMs are a beta on request.
  - The dashboard is in English.
- **Held until the gate clears:** "Comment HARGA, terus dapat DM." (DM beta) · "Schedule TikTok pun boleh." (TikTok).
- **Pages:** the `/ms/*` set, `/compare/meta-business-suite`, `/guides/meta-business-suite-scheduling`.

### 4.7 Workflow builders and the open-protocol networks (n8n, CI, Bluesky, Mastodon, Threads, Discord, Slack)

- **Lead:** "One HTTP call posts your release notes to Slack, Discord, your LinkedIn profile and X."
- **Then:**
  - "Bluesky, Mastodon and Threads from one request."
  - "Discord and Slack posts carry a bot name and avatar per brand."
  - "Works from n8n's HTTP Request node."
  - "X is billed from a prepaid credit at X's own prices."
- **Concede:** no n8n node and no SDK install until npm.
- **CTA:** "Get an API key".
- **Pages:** `/guides/post-release-notes-from-ci`, `/guides/post-to-bluesky-mastodon-threads-api`,
  `/guides/n8n-threads-posting`, the network hubs.

### 4.8 AI-agent builders (held lines until npm)

- **Now:** "An agent needs to know whether its post went out: one REST call to publish, a signed webhook with the
  result."
- **Held until npm:** any install command; "MCP server" as a headline.
- **Concede:** there is no hosted MCP, the packages are not on npm yet, and "for AI agents" is every rival's title.
- **Pages:** `/use-cases/social-media-api-for-ai-agents`; later `/social-media-mcp-server`.

### 4.9 bundle.social users (parked until Fakhrul decides)

- **Held line:** "Siar speaks the bundle.social v1 API as of October 2026. Most apps switch by changing the base URL and
  reconnecting accounts."
- **Then:**
  - $49 vs $100 at 10,000 posts; $149 vs $400 at 100,000 ([pricing.md](https://bundle.social/pricing.md), checked
    2026-11-12).
  - A $19 tier.
  - Webhooks you manage from the API, retried 7 times.
  - Ringgit and a price lock.
- **Concede:**
  - 15 networks are sold as live there.
  - Unlimited teams on its Pro plan (Siar Pro: 10 brands).
  - Its scale.
  - Both cap webhooks at 5 per organization.
  - Tokens never move between vendors.
- **Never:** "drop-in replacement", "100% compatible", "official".

---

## 5. Objections and answers

| The buyer says | Answer (allowed wording) | Who answers it next |
|---|---|---|
| "Can I post to TikTok?" | "Not yet. TikTok's audit of Siar's app has not passed, so TikTok stays closed until it does. Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack." | TikTok resubmission |
| "And YouTube?" | "Connect and upload now. Google lifted its private-only rule for unaudited projects on 2 November 2026. Siar lists public uploads as open once one is confirmed on production." | One test upload |
| "LinkedIn company pages?" | "Personal profiles today. LinkedIn has not granted Siar page access; our request was denied without a reason. Company pages open if that changes." | — |
| "Pinterest?" | "Connect your account today. Publishing Pins opens after Pinterest grants Standard access." | — |
| "Your home page shows TikTok posts as Posted." | No answer exists. This is why Wave 0 ships first. | Site fix |
| "Who uses you? What's your uptime?" | "Siar has been live since 12 October 2026, so there are no case studies or uptime record to show yet. What you can check today: the public OpenAPI file, the generated network and error references, the dated status of every network, and a price list with a price lock. Try it with 20 free posts, no card." | Time |
| "Is it white-label?" | "It's a branded connect link: your name, logo and color. The page still says 'Powered by Siar', runs on app.siaran.my and is in English." | Product decision |
| "Can I connect two Instagram accounts for one client?" | "Each brand holds one account per network. Put the second account in a second brand; Pro has 10." | Accounts decision |
| "Others give unlimited posts." | "Siar caps posts: 300 a month on Starter, 10,000 on Pro, 100,000 on Business. A post sent to every connected network counts as one, and drafts and retries don't count." | — |
| "Zernio, Buffer and bundle.social have free plans that reset." | "Siar's free start is 20 free posts to try, once, with no card. After that it's $19 a month (RM39 in Malaysia)." | Pricing decision |
| "PostWire is $29 for 10 brands." | "It costs less from 1 to 50 brands ([postwire.io/pricing](https://postwire.io/pricing), checked 2026-11-12). Above 50, Siar Business is $149 a month for unlimited brands; PostWire Scale is $299 for 200 clients. Siar also includes Threads, publishes its error reference and documents its webhook retries." | — |
| "Do you support idempotency keys?" | "Not on post creation. Each network target in a post is claimed once, and an interrupted send is checked against the account before anything is re-sent. If you resend a create call, you create a second post, so check by your own reference first." | Product decision |
| "`npx -y @siar/mcp` fails. Where's the SDK?" | "The TypeScript SDK, CLI and MCP server (version 0.1.0) are built from the same OpenAPI contract but are not on npm yet. Today, call the REST API directly with curl, fetch or requests." | npm go |
| "Is your X pass-through allowed under X's terms?" | Until Fakhrul has read X's Developer Agreement III.A(e), say only how it works: "X usage runs through Siar's X app, billed at X's own USD prices from a prepaid credit." Never market it as an advantage. | Fakhrul |
| "Can it send DMs, or auto-DM people who comment HARGA?" | "Facebook and Instagram DMs and comment-to-DM automations are in beta, turned on per organization on request, on paid plans." | DM beta |
| "Meta Business Suite is free." | "It is, for Facebook and Instagram. Use Siar when the same post also goes to Threads, X and LinkedIn, or when you run several brands." | — |
| "Why not build it ourselves?" | "You can. Budget for the gates: Siar's Meta review took from 14 to 27 October 2026, LinkedIn denied page access, TikTok's audit has not passed. LinkedIn also ships a new API version every month and retires each one after about a year. Siar's approval record shows the work." | — |
| "Will a small Malaysian company still be here in a year?" | "Your price never goes up while you stay subscribed, and the API is described in a public OpenAPI file. You can cancel any time; nothing is deleted. Enterprise plans can include an SLA by contract." | Time |
| "Is this a real company?" | "FF DEV STUDIO, SSM 202603234793, Setiu, Terengganu, Malaysia. Contact details are in the footer of every page." | — |
| "Do you have WhatsApp or BM support?" | "Email support on every plan. The dashboard is in English. No WhatsApp." | — |
| "Why not Duta?" | "Duta suits you if you want one plan with every channel connected as many times as you like, plus Telegram and a hosted MCP. Siar starts at RM39 with 20 free posts to try and no card, and adds comments, analytics, brands for each client, webhooks and public API docs." (On `/compare/duta`, with Duta's URL and the check date.) | — |
| "Can my client log in, approve posts or get a PDF report?" | "Not today. Members see the whole organization, there is no approval step, and reports stay in the dashboard with no export." | Product |
| "e-Invoice or MyInvois?" | "Not today. Every payment gets a numbered receipt from FF DEV STUDIO." | Product |
| "Is SST included?" | "Prices are final. There's no SST line." | — |
| "Is Siar the same as siar.my, or the SiAR API?" | "No. Siar (siaran.my) is a social media API and dashboard by FF Dev Studio." | — |
| "What happens if a post fails on one network?" | "The other networks still publish. The failed one keeps the network's own error and a fix, and `post.published` tells your server each network's result. Fix the cause and retry: only the failed networks are sent again, and the retry doesn't use another post from your plan." | — |
| "What happens when a token expires?" | "Siar flags the connection when a grant is revoked or about to expire and sends a `social-account.updated` webhook. Your customer reconnects through the same link." | — |

---

## 6. Voice guide (English)

### Tone

- **Plain and specific.** Like an engineer telling a peer exactly what will happen.
- **Calm.** No hype and no exclamation marks.
- **Honest in the same breath:** the limit sits next to the strength, not in a footnote.
- **Respectful to rivals.** Every compare page says where the rival is the better buy.

### Rules

1. **Answer first.** The first sentence answers the question the page was found for.
2. **Name the thing.** First mention: "Siar, a unified social media API" (or "Siar (siaran.my)"). Never open with "it",
   and never write "Siar" alone in a title.
3. **Short sentences.** One idea per sentence, under about 25 words. On marketing pages, at most 3 sentences per
   paragraph.
4. **Mechanism over adjective.** Say what happens ("retried 7 times over about 45 hours"), not how good it is.
5. **Numbers carry their unit and condition.** "RM99 a month for 10 brands", "300 posts a month", "about 45 hours".
6. **Every rival fact has a link and "checked <date>".**
7. **Say what Siar doesn't do** on the page where a buyer would look for it.
8. **Label examples.** Write "Example" and use only networks that are open. No invented handles, timings or "Live"
   labels.
9. **Headings in sentence case.** No title case, no puns. The exception is the brand line "Write it once. Siar it
   everywhere."
10. **Spelling.** US, to match the API and the site ("organization", "color"). Quote sources as written.

### Words and phrases to use

| Use | Meaning or rule |
|---|---|
| unified social media API | The category. The exact anchor points only to the home page |
| publish, schedule, reply, measure | The four verbs of the product |
| network | Facebook, Instagram and the rest. "Platform" only in slugs and search titles |
| organization | The billing unit |
| brand | One client or business. "A brand is a team in the API": say it once per page where both appear |
| social account | A connected account on a network |
| connect link / branded connect link | The hosted connect page. Never "white-label" |
| open today · opening after <network> approves Siar · built, not open yet | The only three status phrases |
| built for 15 networks | The only allowed use of "15" |
| 20 free posts to try | The free start, always with "to try" |
| per organization, not per account · no per-account fees | The unit |
| your price never goes up while you stay subscribed | The price lock, word for word |
| the network's own error · a plain-English fix | The error promise |
| signed webhook, retried for about 45 hours | The webhook promise ("up to two days" is also fine) |
| checked <date> | After every rival or network fact |
| Example | On every illustrative request, response or screen |

### Words and phrases to ban

| Banned | Why | Say instead |
|---|---|---|
| seamless, effortless, powerful, robust, cutting-edge, revolutionary, game-changing, best-in-class, world-class, supercharge, unlock, empower, leverage, streamline | Filler; claims nothing checkable | The mechanism |
| reliable, enterprise-grade, production-grade, battle-tested, rock-solid | Not measured | The mechanism and its numbers |
| guaranteed, never fails, 100%, zero duplicates, 99.9% | Design guarantees are not rates | "Each network target is claimed once." |
| fast, instant, in minutes, in seconds, any ms figure, "first post in five minutes" | Not measured | "Your first post is one request away." |
| only, first, #1, leading, cheapest, half the price | False, or someone else's claim (PostWire, Duta) | Dated scenario arithmetic |
| unlimited accounts (alone), unlimited everything, unlimited clients (below Business) | One account per network per brand; posts capped | "No per-account fees. Each brand connects one account on every open network." |
| all networks, every network, 15 networks (bare), supports 15 networks | 9 are open | "built for 15 networks" + the open list |
| free plan, free forever, free API, 20 posts (bare), free monthly posts | The free start is one-time | "20 free posts to try" |
| white-label, your domain, in your client's language | "Powered by Siar", app.siaran.my, English only | "branded connect link" |
| skip the review / no app review needed (non-Meta) | Gated like everyone on TikTok, YouTube, Pinterest, LinkedIn Pages | "Meta already cleared: App Review passed 27 October 2026" |
| Meta partner, official partner, approved by Meta (as a badge), certified | Approval of Siar's app is not a partnership | "Siar's Meta app passed App Review on 27 October 2026" |
| idempotent API, send it twice safely | No client key on create | Pillar 1 wording |
| for AI agents (as the lead), install the MCP in one line, `npx` / `npm i` lines | Saturated; not on npm | "MCP server (0.1.0), not yet on npm" |
| drop-in replacement (Buffer, Ayrshare, anyone) | No compatibility | "a migrator rewrites either way" |
| trusted by, thousands of, join N teams, testimonials, logos, ratings | None exist | Checkable artefacts |
| simply, just, easy (as reassurance) | Talks down; unmeasured | Show the request |
| AI-powered | Siar writes no content | — |

### Numbers, money and dates

- **Money:** "RM39" and "$19" with no space; "a month" in sentences ("/mo" only in tables).
- **Global pages:** "$19 a month (RM39 in Malaysia)".
- **Malaysian pages:** "RM39 a month". Never show only USD to a Malaysian reader. Never show ringgit as the overseas
  price.
- **Yearly:** "RM390 a year (2 months free)".
- **X:** "at X's own USD prices". In ringgit, the rate is shown before paying and includes a buffer, so never "at cost".
- **Dates:** "27 October 2026" in prose; ISO (2026-10-27) in tables, data and JSON-LD; always with the year.

### Calls to action

| Label | Where |
|---|---|
| "Start with 20 free posts" | Primary, everywhere |
| "Get an API key" | Developer pages; same sign-up URL |
| "Start the 14-day Pro trial" | SaaS and agency pages |
| "Read the quickstart" | Developer pages |
| "Talk to us" | Enterprise only |
| "Cuba 20 post percuma" | BM pages |

The current footer button "Start free" becomes "Start with 20 free posts". Write CTAs in words: no arrow glyphs in
copy.

---

## 7. Malay voice (BM)

The rule from `docs/pricing.md`: social ads are colloquial Malaysian BM (English trade words are fine), never bahasa
baku. It applies to every `/ms/` page too.

### Rules

1. **Write the way Malaysians type:** mixed BM-English with English trade words. Formal Malay returned 0 autocomplete
   completions for "jadualkan", "hantaran", "serentak" and "pakej" (sibling sweep, `keyword-map.md` §6).
2. **Fakhrul writes or edits every final BM line.** Machine BM is what SleekFlow and Simplified publish, and the
   reason to compete at all.
3. **Pronouns.** Drop the pronoun where you can. Avoid "anda" in headlines and ads. Never use Indonesian forms.
4. **Short lines.** One idea each, numbers kept as numbers ("RM39 sebulan").
5. **Page order:**
   1. The free native way first (Meta Business Suite, the Instagram app).
   2. Then posting to several networks at once with Siar.
   3. Then the price, linked to `/ms/harga`.
6. **Honesty lines** on every `/ms/` page (Fakhrul may change "sahaja" to "je"):
   - "Dashboard Siar dalam Bahasa Inggeris."
   - "TikTok: belum dibuka lagi."
   - "Siar post ke Page dan akaun profesional sahaja, bukan group atau profil peribadi."

### Words

| Use | Avoid (bahasa baku) | Avoid (Indonesian) |
|---|---|---|
| post, schedule, auto post, link bio, client, brand, page, akaun, comment, DM, inbox, dashboard | jadualkan / menjadualkan, hantaran, pautan, papan pemuka, langganan | postingan, menjadwalkan, unggah, akun, gratis, tautan |
| sebulan, setahun, percuma, cuba, harga, bayar, kad, FPX, DuitNow, resit | "akaun media sosial anda" | kamu (as "you") |
| tak payah, tak perlu, boleh, senang, sekali, keluar kat, sambung akaun, syarikat Malaysia | — | — |

"Serentak", "pakej" and "pengurusan media sosial" are fine inside a sentence. They are not the keyword of a title,
because nobody types them as a search.

### Lines allowed now

- "Post sekali, keluar kat Facebook, Instagram, Threads dan X. RM39 sebulan."
- "10 client, RM99. Kurang RM10 satu client."
- "Harga Malaysia. Bayar dalam ringgit: kad bulanan, atau FPX/DuitNow sekali setahun."
- "20 post percuma untuk cuba. Tak perlu kad."
- "Client sambung akaun sendiri. Tak payah minta password."
- "Tahu apa jadi pada setiap post." (the idea in BM; untested, Fakhrul's call)

### Lines held until the gate clears

| Held line | Why it is held |
|---|---|
| "Post sekali, keluar kat semua platform." (`docs/pricing.md`) | "Semua platform" over-claims while TikTok is closed. Use the named list |
| "Comment HARGA, terus dapat DM." | The DM beta is not open to everyone |
| "Schedule TikTok pun boleh." | TikTok is not open |

### Draft BM headings (Fakhrul edits)

| Page | H1 draft |
|---|---|
| `/ms/cara-schedule-post` | "Cara schedule post kat Facebook, Instagram, Threads dan X" |
| `/ms/cara-schedule-post-instagram` | "Cara schedule post Instagram (PC, laptop dan phone)" |
| `/ms/cara-schedule-post-facebook` | "Cara schedule post kat Facebook Page" |
| `/ms/cara-schedule-post-threads` | "Cara schedule post Threads" |
| `/ms/cara-auto-post-facebook-instagram` | "Cara auto post ke Facebook dan Instagram sekali gus" |
| `/ms/cara-buat-link-bio` | "Cara buat link bio Instagram" |
| `/ms/harga` | "Harga Siar: RM39, RM99 atau RM399 sebulan" |

---

## 8. Page furniture: how copy sits on the page

The house style is FF Ops (`~/Desktop/dev/FFOps/docs/UI.md`) with Siar's own mark.

### Look

- **Colors:** cream paper `#f3efe4`, panels `#fbfaf6`, ink `#0b0b0a`.
- **No lime, anywhere.**
- **One extra color:** the on-air red, and only for something that is actually live.
- **FF mentions:** FF appears only as "Siar by FF Dev Studio" in the footer and on legal pages. The legal name
  FF DEV STUDIO with its SSM number may also appear in the trust line on price pages and on `/about`, as a billing fact
  (pending Fakhrul's decision 14 in `strike-plan.md`).

### What copy must not lean on

- **No numbered eyebrows** ("01 / Validate"). Number steps only when the order is real, as a plain ordered list in a
  how-to.
- **No stat rows** ("270 operations · 16 events · 147 codes"). A number goes in the sentence that explains it.
- **No mono-caps labels as decoration.** Mono is for code, field names and data. A heading gets at most one plain
  kicker that names the section. A claim never goes into a kicker's side note (today `/pricing` has "per
  organization" as one); it belongs in a sentence.
- **No arrows or chips sprinkled through copy.** One primary action per section, labelled in words.

### What leads instead

- **Real data:** the price list, the network status table, a real request and its response.
- **Real screenshots:** product shots come from the real dashboard.
- **Real network marks:** the monochrome glyphs, never initials.
- **Plain docs:** docs pages keep the plain layer.

---

## 9. Status lines (exact wording)

These go into the one status constant. No page writes its own.

| Network or feature | Status | Exact line |
|---|---|---|
| Facebook | Open | "Facebook Pages: open today." |
| Instagram | Open | "Instagram professional accounts: open today (Facebook Login or Instagram Login)." |
| Threads | Open | "Threads: open today." |
| X | Open | "X: open today, billed from a prepaid credit at X's own USD prices." |
| LinkedIn | Open (profiles) | "LinkedIn: personal profiles today; company pages open after LinkedIn grants page access." |
| Bluesky, Mastodon | Open | "<Network>: open today." (Mastodon: "on any server") |
| Discord | Open | "Discord: open today, posting as a bot with a name and avatar per brand." |
| Slack | Open | "Slack: open today. Importing replies is slow, because Slack limits apps outside its Marketplace." |
| YouTube | Not confirmed | "YouTube: connect and upload now; public uploads not yet confirmed." (After a confirmed public upload: "YouTube: open today.") |
| TikTok | Waiting | "TikTok: built, opening after TikTok approves Siar." |
| Pinterest | Waiting | "Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access." |
| Reddit, Snapchat, Google Business Profile | Not open | "<Network>: built, not open yet." No date |
| DMs and comment-to-DM | Beta | "Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request (paid plans)." |
| SDK, CLI, MCP | Built | "TypeScript SDK, CLI and MCP server (version 0.1.0), built from the same OpenAPI contract. Not on npm yet." |
| OpenAPI | Live | "One REST API, described by a public OpenAPI 3.0 file (270 operations)." The count is generated at build time |

---

## 10. Never claim

**Product and networks:**
- Posting to TikTok, TikTok comments, any TikTok demo shown as "Posted".
- Public YouTube uploads, until one is confirmed on production.
- Creating Pins.
- LinkedIn company pages or LinkedIn analytics.
- Reddit, Snapchat or Google Business Profile as usable.
- "15 networks" without "built for", or "every / all networks" for any feature.
- DMs from every network, or DMs as generally available; "Comment HARGA, terus dapat DM." before the beta opens to
  everyone.
- Hosted or remote MCP; any npm install command; "on npm".
- "OpenAPI 3.1"; "263 operations" or "262 operations" (it is 3.0.2 and 270, generated).
- "`post.published` is sent once per post per network". It fires once per post when the post reaches its final state.
- "Disconnected accounts are flagged before your next post fails".
- Client logins, client approval workflows, report or PDF export.
- e-Invoice, MyInvois or LHDN compliance.
- A BM dashboard, BM support, WhatsApp support, phone support, reply times, support hours, "priority support".
- White-label, a custom domain or "in your client's language" for the connect page.

**Proof:**
- Customers, users, logos, testimonials, case studies, reviews, ratings, AggregateRating schema.
- Usage numbers of any kind, "trusted by", "thousands of".
- Uptime, availability or SLA figures (allowed: "Enterprise: custom limits and an SLA by contract. Talk to us.").
- Speed or latency figures; "first post in five minutes"; millisecond timings in examples.
- SOC 2, ISO 27001, GDPR or PDPA certification beyond the privacy policy; "bank-grade" or "end-to-end" encryption.
  Allowed: "tokens are encrypted at rest and never returned by the API".
- "Meta partner", "TikTok partner", "Google verified partner", "official", "endorsed by".
- Using FF's own brands as customers. If they post through Siar, say "FF's own brands, same owner".

**Price:**
- "Cheapest", "half the price" or "the lowest" without the rival, the scenario, the source and the date.
- "Unlimited accounts" alone; "unlimited clients" below Business; "unlimited" for posts, comments, uploads or brands
  below Business.
- "Free plan", "free forever", "free API", "20 posts" bare, "20 posts a month".
- "No FX fees"; X "at cost" in ringgit; X credits as an advantage before X's terms are read.
- "Inclusive of SST" or "plus SST".
- "Grant eligible", "claim 50% back" (Siar is not on MDEC's panel).
- "Pay by card through CHIP" (say "card").

**Competitors:**
- "The only per-business / per-organization API" (PostWire, bundle.social, SocialAPI.ai and Postproxy share the model).
- "The only API with Discord, Slack and Mastodon" (bundle.social, Upload-Post, Postiz and PostWire list all three).
- "The only one with duplicate protection" or "with dated approvals" (PostWire has both).
- "The first" or "the only Malaysian" scheduler or API (Duta claims "first" and says it has a public API).
- "Hootsuite's MCP only saves drafts" (its page now says Perch publishes).
- "Drop-in replacement" for Buffer, Ayrshare or anyone. For bundle.social, only the held wording, after the naming
  decision.
- bundle.social by name, anywhere, until the naming decision.
- More webhook event types or endpoints than Zernio; more endpoints than anyone (Siar allows 5 per organization).
- A rival price, limit or network list without the rival's own URL and "checked <date>".
- A rival complaint unless the page was opened by hand and labelled third-party. Prefer the rival's own docs.
- Ranking Siar first in any list Siar publishes.
- Competitor names on `/pricing`.

---

## 11. Rules for naming competitors

1. **Where rivals may be named:**
   - `/compare/*`;
   - the two pricing explainers;
   - the `/malaysia` table;
   - the webhook table on `/use-cases/social-media-webhooks`;
   - `/compare/failure-handling`.

   Never on `/pricing`.
2. **Every fact:** the vendor's own page, linked, with "checked <date>", re-checked within 7 days of publishing.
3. **Every page** says where the rival is the better choice, near the top.
4. **Tone:** factual and respectful, including toward Duta, which is honest about its own approvals.
5. **X:** never a price weapon until the X terms are read.

---

## Sources

- **Siar facts:**
  - `docs/seo/research/siar-truth.md`, as corrected by `docs/seo/strike-plan.md` §2.
  - Code read 2026-11-12: `publisher.ts`, `webhooks.ts`, `posts.ts`, `plans.ts`, `schema.prisma`, `events.ts`,
    `billing-core.ts`, `refunds.mdx`, `pricing.astro`, `llms.txt.ts`, `PageHero.astro`, `Footer.astro`.
  - Owner records: `docs/approvals/meta.md`, `linkedin.md`, `README.md`.
- **Rival facts, checked 2026-11-12:**
  - https://postwire.io/ and https://postwire.io/pricing
  - https://bundle.social/pricing.md
  - https://www.hootsuite.com/integrations/mcp
  - https://buffer.com/resources/legacy-rest-api-retired/
  - https://getduta.com/llms.txt
  - The sibling teardowns in `docs/seo/research/competitors/`, each with its own URLs.
- **Voice:**
  - `docs/pricing.md` (BM ad voice).
  - `docs/seo/keyword-map.md` §6 and `research/keywords/malaysia-bm.md` (what Malaysians type).
  - `docs/seo/market.md` §8 (buyer vocabulary).
  - The Siar `CLAUDE.md` "Look" section (house style).
