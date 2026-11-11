# Home page copy: `/` (English)

Written 2026-11-12. This is final, publish-ready copy for `apps/site/src/pages/index.astro` and its components.

**Status:** LIVE-FIX (Wave 0) first, then RETITLE (Wave 1). See `strike-plan.md` §5.1 items 0.3–0.10, 0.21 and §5.2.

**Built on these files** (nothing in them is redone here):
- `research/siar-truth.md`, as corrected by `strike-plan.md` §2. Row 7 changes the YouTube wording.
- `messaging.md`: §1 canonical paragraph, §2 hierarchy, §3 pillars, §5 objections, §6 voice, §9 status lines.
- `keyword-map.md`, cluster C01.
- `research/keywords/head-unified.md`, rows 1, 9, 11–13 and 41.
- `market.md` §8, buyer vocabulary.
- `research/current-site.md` §4, the Copilot misquote.

**Labels in the notes:**
- **[code]**: read in this checkout today.
- **[doc]**: owner records in `docs/`.
- **[sourced]**: a network's own page, with its URL.
- **[measured]**: something seen today or in a sibling file's measurement, named where used.
- **[inferred]**: judgement.

The copy itself carries no labels. The evidence table at the end covers every claim on the page.

**Page rules** (from the task and `messaging.md` §8):
- No competitor names anywhere on this page.
- No stat rows and no numbered eyebrows.
- No mono-caps labels used as decoration.
- No arrow glyphs in CTAs.
- Every illustrative request or response is labelled "Example" and uses open networks only.
- No millisecond timings, no invented handles, no "Live" labels.

---

## Meta

| Field | Final value | Length |
|---|---|---|
| Title | `Unified social media API, every post accounted for \| Siar` | 57 chars |
| Meta description | `Siar is a unified social media API: each post checked before it's sent, sent once, and its result in a signed webhook. From $19 a month (RM39 in Malaysia).` | 155 chars |
| URL | `https://siaran.my/` (canonical `https://siaran.my/`, matching the sitemap) | |
| OG title | `Siar: the unified social media API where every post is accounted for` | |
| OG description | Same as the meta description | |

**Also change `DESCRIPTION` in `apps/site/src/config.ts`.** It is the site-wide default description, and it still says "across 15 networks" and "Unlimited connected accounts". Replace it with:

> Siar is a unified social media API and dashboard. Each post is checked before it's sent, sent to each account once, and reported by a signed webhook. Priced per organization, from $19 a month (RM39 in Malaysia).

---

## 1. Hero

**Kicker (optional, plain text, not mono-caps):**
> siar /ˈsi.ar/, Malay for "to broadcast"

Keep it. It also tells readers and engines that Siar is not siar.my or SiAR.

**H1 (keep, split over two lines with a real line break):**
> Write it once. Siar it everywhere.

**Hero subhead (the positioning line):**
> The unified social media API where every post is accounted for.

**Lead (the canonical entity paragraph, word for word from `messaging.md` §1):**

Generate it from the plan and network-status constants, so it changes the day a network opens. Design may set the first two sentences larger.

> Siar is a unified social media API and dashboard by FF Dev Studio, a software studio in Malaysia. It checks each post
> against each network's rules before sending, sends it to each connected account once, returns the network's own
> error with a plain-English fix, and reports the result through signed webhooks that are retried for about 45 hours.
> It is priced per organization, not per connected account: 20 free posts to try, then from $19 a month (RM39 in
> Malaysia). Publishing is open today on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord
> and Slack. YouTube uploads work, and public visibility is not yet confirmed. TikTok, Pinterest publishing and
> LinkedIn company pages are waiting on those networks' approval. Reddit, Snapchat and Google Business Profile are built
> but not open yet.

The answer to "what is a unified social media API / what is Siar" is complete within the first 60 words of the page: H1 (6) + subhead (11) + the lead's first two sentences (about 58).

**Primary CTA:** `Start with 20 free posts` → `https://app.siaran.my/signup`

**Secondary CTA:** `Read the quickstart` → `/docs/quickstart`

**Note under the CTAs:**
> No card. A one-time allowance, with no time limit.

**Hero visual.** Keep the real dashboard screenshot (`/shots/posts.webp`, with light, dark and phone versions). Check that it shows no TikTok, Pinterest, Google Business, Reddit, Snapchat or LinkedIn company-page post as published. If it does, retake it with open networks only.

**Remove `ApiPanel` from the hero.** It shows TikTok, a LinkedIn company page and Google Business as "Posted", with millisecond timings. Its place is taken by the Example section (section 3).

---

## 2. The three pillars (directly under the hero)

**H2:**
> What changes when your posts go through Siar

Lay out three columns. Each one has an H3, a promise line, two or three proof sentences and one text link. Don't number them.

### Every post accounted for

> You always know what happened to a post, and why.
>
> Each network's limits are checked when you create the post, so a bad request fails with a 400 you can fix, not at
> 9 a.m. Each account gets your post once. If a network says no, you get its own code and message, plus the fix. A
> signed webhook tells you how it went, retried for about 45 hours.

Link: `How publishing works` → `/how-publishing-works`

### Your customers connect through Siar's live apps, under your brand

> You don't build nine sign-in flows or sit through Meta's review.
>
> Facebook, Instagram and Threads connect through Siar's Meta app, which passed Meta's App Review on 27 October 2026.
> X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack connect through Siar's own apps, live today. Your customers
> sign in through a link with your name, logo and color, and you never see a password or token.

Link: `What is open on every network` → `/platforms`

### One price for the whole organization

> You pay for your organization, not for each account you connect.
>
> No per-account fees. Each brand connects one account on every open network: Starter 1 brand, Pro 10, Business
> unlimited. A post sent to every connected network counts as one post. Your price never goes up while you stay
> subscribed.

Link: `See every plan` → `/pricing`

**Wave note.** `/how-publishing-works` is a new W1 page (N1). If this section ships in W0, before that page exists, point the first link at `/docs/posting` with the anchor `How posting works`. Switch it the day N1 goes live. Never link a page that is not published.

---

## 3. Example: one post, start to finish

This replaces both `ApiPanel` and `EventLog`, the "Live siar · events" feed. Ship it as one static, labelled block, not an animation. Every payload below matches the real field names and messages in the code (see the evidence table).

**Kicker:** `Example`. One plain kicker. It is the label the voice guide requires, not decoration.

**H2:**
> What happens to a post, start to finish

**Intro:**
> One post to Threads, X, Bluesky and a LinkedIn profile, from first request to final webhook. The IDs, dates and text
> are made up. The shapes, fields and messages are the ones the API returns.

Use a plain ordered list here, because the order is real. Each step has a short H3, one or two sentences and a code block.

### 1. The request is checked before anything is scheduled

> The Threads text is too long. Siar answers at once with a 400 that points at the field. Nothing is created and
> nothing counts against your plan.

```http
POST /api/v1/post
x-api-key: sk_live_…
```
```json
{
  "teamId": "TEAM_ID",
  "title": "Release 2.4",
  "postDate": "2026-11-20T01:00:00.000Z",
  "status": "SCHEDULED",
  "socialAccountTypes": ["THREADS", "TWITTER", "BLUESKY", "LINKEDIN"],
  "data": {
    "THREADS":  { "text": "…512 characters…" },
    "TWITTER":  { "text": "Release 2.4 is out." },
    "BLUESKY":  { "text": "Release 2.4 is out." },
    "LINKEDIN": { "text": "Release 2.4 is out. Here is what changed and why." }
  }
}
```
```json
{
  "statusCode": 400,
  "message": "Validation failed: Text is 512 characters (emoji count as their byte length); the limit is 500.",
  "issues": [
    {
      "code": "too_long",
      "message": "Text is 512 characters (emoji count as their byte length); the limit is 500.",
      "path": ["data", "THREADS", "text"]
    }
  ]
}
```

### 2. Fixed, scheduled, sent once

> Shorten the Threads line and send it again. The post is scheduled. At 9 a.m. each network target is claimed once,
> so a retry, a restart or a double click cannot publish it twice.

```json
{ "id": "POST_ID", "status": "SCHEDULED", "postDate": "2026-11-20T01:00:00.000Z" }
```

### 3. One network says no, in its own words

> Threads, X and LinkedIn publish. Bluesky refuses, because the account's session has expired. Siar keeps Bluesky's own
> code and message on the post, marks the account for reconnecting and sends a `social-account.updated` webhook.
> Siar's Bluesky error reference gives the fix: reconnect the Bluesky account.

```json
"errorsVerbose": {
  "BLUESKY": {
    "code": "TOKEN_INVALID",
    "errorMessage": "Token has expired",
    "httpStatus": 400,
    "retryability": "non_retryable",
    "isTransient": false,
    "userFacingMessage": "Token has expired",
    "meta": { "error": "ExpiredToken", "message": "Token has expired" }
  }
}
```

Link under the block: `Bluesky API error codes` → `/bluesky-api/errors`

### 4. Your server hears the result, signed

> `post.published` fires once, when the whole post has published or failed. It carries each network's result. It is
> signed with HMAC-SHA256. If your server doesn't answer, it is retried 7 times over about 45 hours.

```http
POST https://your-app.example/webhooks/siar
x-siar-event: post.published
x-siar-delivery: DELIVERY_ID
x-siar-timestamp: 1763600460
x-siar-signature: 5f1c…
```
```json
{
  "id": "evt_…",
  "type": "post.published",
  "createdAt": "2026-11-20T01:01:00.000Z",
  "organizationId": "ORG_ID",
  "data": {
    "id": "POST_ID",
    "status": "ERROR",
    "error": "BLUESKY: Token has expired",
    "errors": { "BLUESKY": "Token has expired" },
    "externalData": {
      "THREADS":  { "status": "POSTED", "permalink": "https://www.threads.net/…" },
      "TWITTER":  { "status": "POSTED", "permalink": "https://x.com/…" },
      "LINKEDIN": { "status": "POSTED", "permalink": "https://www.linkedin.com/…" }
    }
  }
}
```

### 5. Retry sends only what failed

> Once the account is reconnected, retry the post. Only Bluesky is sent again, and the retry doesn't use another post
> from your plan.

```http
POST /api/v1/post/POST_ID/retry
```

**Closing line under the example:**
> The post's status is `ERROR` because one network failed. Each network's own result sits beside it. That is what
> "accounted for" means: posted, failed with the network's reason, or "could not be confirmed" when an interrupted send
> can't be checked. Siar promises that you'll know which. It can't promise that every network will say yes.

Link: `How publishing works` → `/how-publishing-works` (W0 fallback: `/docs/webhooks`, anchor `Webhooks guide`)

---

## 4. Post once, publish everywhere Siar is open

This replaces "One request. 15 networks." and its lead.

**H2:**
> Post once, publish everywhere Siar is open

**Lead:**
> Siar is built for 15 networks. Publish to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon,
> Discord and Slack today. TikTok, YouTube (public uploads), Pinterest publishing, LinkedIn company pages, Reddit,
> Snapchat and Google Business Profile are built and open as each network approves Siar.

**Second paragraph:**
> One request carries a block per network, so each one keeps what makes it different: an Instagram reel, a thread on
> X, a Mastodon content warning, a Discord message with your bot's name. Each network's rules are checked before
> anything leaves.

**Network grid.** It renders from the one status constant (`strike-plan.md` 0.2), never from the health endpoint.
- Open networks come first, then "waiting", then "not open".
- Each tile shows the network mark, its name and the exact line from `messaging.md` §9.
- Post types show on open tiles only.
- Each tile links its hub (`/<net>-api`).

| Network | Tile line (exact) |
|---|---|
| Facebook | Facebook Pages: open today. |
| Instagram | Instagram professional accounts: open today (Facebook Login or Instagram Login). |
| Threads | Threads: open today. |
| X | X: open today, billed from a prepaid credit at X's own USD prices. |
| LinkedIn | LinkedIn: personal profiles today; company pages open after LinkedIn grants page access. |
| Bluesky | Bluesky: open today. |
| Mastodon | Mastodon: open today, on any server. |
| Discord | Discord: open today, posting as a bot with a name and avatar per brand. |
| Slack | Slack: open today. Importing replies is slow, because Slack limits apps outside its Marketplace. |
| YouTube | YouTube: connect and upload now; public uploads not yet confirmed. |
| TikTok | TikTok: built, opening after TikTok approves Siar. |
| Pinterest | Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access. |
| Reddit | Reddit: built, not open yet. |
| Snapchat | Snapchat: built, not open yet. |
| Google Business Profile | Google Business Profile: built, not open yet. |

**Link under the grid:** `Every network's status, with dates` → `/platforms`

---

## 5. The dashboard on the same API

**H2 (covers "social media management api"):**
> A social media management API, with the dashboard built on it

**Lead:**
> The dashboard is a client of the same API you get. Your team writes, schedules, replies and reports there. Your code
> does the same over REST.

**Flow player (fixes to `home/Flow.astro`):**
- Keep the five tabs, named by their tags only: Connect, Write, Tailor, Schedule, Measure.
- Drop the "01 / 05" counters and the mono-caps tab labels.
- Before shipping, re-check each clip (`/clips/*.mp4`). None may show a TikTok, Pinterest, Google Business or LinkedIn company-page post, or a DM inbox presented as available to everyone [inferred risk; the clips were not watched for this file].

| Tab | H3 | Body |
|---|---|---|
| Connect | Customers connect their own accounts. | Send a branded link with your name, logo and color. They sign in to each network themselves and come back to your app. You never touch a password or a token. |
| Write | One post, every connected network. | Pick the accounts and write it once. Each network's character limit updates as you type. |
| Tailor | Then make each one fit. | Give Threads a shorter line, Instagram a first comment, X a thread. Each network's own fields are checked before anything is sent. |
| Schedule | Schedule it and move on. | Siar publishes on time in your timezone, retries temporary network errors on its own, and shows you each network's result. |
| Measure | See what landed. | Account and post analytics on every paid plan. Comments from Facebook, Instagram, Threads, X, Bluesky, Mastodon, Slack and YouTube in one inbox. Facebook and Instagram DMs are in beta, turned on per organization on request. |

**Link:** `Take the product tour` → `/features`

---

## 6. Price

**H2:**
> One price for your organization, not for each account

**Lead (the price line):**
> $19 a month (RM39 in Malaysia); unlimited brands on Business, $149 (RM399). Every plan connects unlimited social
> accounts, and a post sent to every connected network counts as one post.

**Body:**
> Plans are fenced by brands and posts. Starter is 1 brand and 300 posts a month. Pro is 10 brands and 10,000 posts,
> with a 14-day trial. Business is unlimited brands and 100,000 posts. A brand is a team in the API, and each brand
> connects one account on every open network. Yearly is 10 times monthly, so 2 months are free. Your price never goes
> up while you stay subscribed.

**Payment line:**
> Ringgit for organizations billed in Malaysia: card monthly, or pay a year once by FPX or DuitNow. US dollars by card
> everywhere else.

**Trust line (Level 5, global form):**
> Who you pay: FF DEV STUDIO (SSM 202603234793), Malaysia. Siar's Meta app passed App Review on 27 October 2026.

Owner decision 14 in `strike-plan.md` §10 is still open: may the legal name and SSM number appear outside the price pages and `/about`? Until he rules, use this fallback on the home page:
> Who you pay: Siar by FF Dev Studio, Malaysia. Siar's Meta app passed App Review on 27 October 2026.

**Calculator (fixes to `home/PriceCalc.astro`).** This fixes the Copilot misquote "RM399/month for up to 240 connected accounts".
- The server-rendered HTML must already show a correct pairing, computed at build time with the same plan function the script uses.
- Default: 8 brands, 5 networks per brand, 1,000 posts a month.
- The "networks per brand" slider maxes out at the number of open networks from the status constant (9 today), not 15. One brand holds one account per network.
- On this English page, show US dollars first with ringgit in brackets.

| Control or output | Label | Server-rendered default |
|---|---|---|
| Slider | Brands you run | 8 |
| Slider | Networks per brand (open today) | 5 |
| Slider | Posts a month | 1,000 |
| Output | Connected accounts | 40 |
| Output | Your plan, billed monthly | Pro: $49 a month (RM99 in Malaysia) |
| Output, sub-line | | 10 brands, up to 10,000 posts a month |
| Output | Per connected account | $1.23 (RM2.48) |

Caption under the calculator:
> In this example: 8 brands with 5 networks each. Drag the networks slider and the price stays the same.

Remove the old sub-line "and falling as you grow".

**CTA:** `See every plan` → `/pricing`

---

## 7. Developers

This replaces "First post in five minutes." and removes the `npx -y @siar/mcp` block.

**H2:**
> Your first post is one request away.

**Steps (a plain ordered list, because the order is real):**
1. **Create a key** in the dashboard. It works for every brand in your organization.
2. **Connect an account** yourself, or send your customer a branded connect link.
3. **Send one request** with a block per network. One signed webhook reports each network's result.

**Under the steps:**
> One REST API, described by a public OpenAPI 3.0 file (270 operations). The TypeScript SDK, CLI and MCP server
> (version 0.1.0) are built from the same OpenAPI contract and are not on npm yet. Today, call the API with curl,
> fetch or requests.

Generate the operation count at build time (`operations().length`). Never type it in.

**Code tabs:** keep `CodeTabs` with `postTabs()` (curl, Node.js, Python). Its sample uses Instagram, LinkedIn and Bluesky, which are all open. Change `postDate` in `POST_BODY` (`lib/snippets.ts`) to a date in the future; it reads 2026-11-02 today.

**Links:**
- `Read the quickstart` → `/docs/quickstart`
- `OpenAPI file` → `/openapi.json`
- `Webhooks guide` → `/docs/webhooks`

---

## 8. Who it's for

**H2 (keep):**
> Built for people who post for a living.

Show these as rows with no numbers and no arrow glyphs. The whole row is the link.

| Row | Copy | Link |
|---|---|---|
| SaaS products | Add social publishing to your product without building nine integrations or sitting through Meta's review. A brand per customer, one key for all of them. | `/use-cases/multi-tenant-social-media-api` |
| Agencies | 10 brands for $49 a month (RM99 in Malaysia). Each client connects through a link with your name and logo, and you never ask for a password. | `/for-agencies` when it ships (W1); until then `/use-cases/hosted-connect-oauth` |
| AI agents | An agent needs to know whether its post went out: one REST call to publish, a signed webhook with the result. | `/use-cases/social-media-api-for-ai-agents` |
| Product and ops teams | Release notes to Slack, Discord, your LinkedIn profile and X in one request, on a schedule, from your CI. | `/use-cases/social-media-scheduling-api` |

The old "Forty brands, one login" line goes. It needs Business, and the agency line must carry its price.

---

## 9. Objection handling: "What Siar doesn't do yet"

Put this section just before the FAQ. Title it plainly; it is part of the pitch, not a footnote.

**H2:**
> What Siar doesn't do yet

**Intro:**
> Better you read it here than find it after you've built on it.

- **No track record to show yet.** Siar has been live since 12 October 2026, so there are no case studies or uptime
  record. What you can check today: the public OpenAPI file, the generated network and error references, every
  network's dated status, and a price list with a price lock.
- **Some networks are still closed.** TikTok's audit has not passed. LinkedIn company pages wait on LinkedIn granting
  page access. Pinterest publishing waits on Standard access. Public YouTube uploads are not yet confirmed.
- **The connect page is branded, not white-label.** It carries your name, logo and color, but it says "Powered by
  Siar", runs on app.siaran.my and is in English.
- **One account per network per brand.** A client with two Instagram accounts uses two brands. Pro has 10.
- **Posts are capped.** 300 a month on Starter, 10,000 on Pro, 100,000 on Business. Drafts don't count, and retrying a
  failed post doesn't count again.
- **No idempotency key on post creation.** Each network target is claimed once, but resending the create call makes a
  second post. Check by your own reference first.
- **No npm packages yet.** The SDK, CLI and MCP server are built but not published. Use the REST API directly.
- **No client logins, approval step or report export,** and the dashboard is in English.

**Link:** `Every network's status, with dates` → `/platforms`

---

## 10. FAQ

**H2:**
> Questions, answered straight

Each answer opens with its answer, in 40 to 60 words (word counts in brackets, measured on the text below). The one exception is "What is Siar?". `messaging.md` §1 requires the canonical paragraph word for word in the home FAQ, so it runs to about 140 words.

Render the FAQ and its `FAQPage` JSON-LD from one array. The network answer and "What is Siar?" come from the status constant.

**What is a unified social media API?** (54)
> A unified social media API is one API that publishes to many social networks through a single request format, one
> key and one set of webhooks. You stop maintaining a separate integration, login flow and error handler for each
> network. Siar is one: it adds a check before sending and a signed result after.

**What is Siar?** (canonical paragraph, word for word)
> Siar is a unified social media API and dashboard by FF Dev Studio, a software studio in Malaysia. It checks each post
> against each network's rules before sending, sends it to each connected account once, returns the network's own
> error with a plain-English fix, and reports the result through signed webhooks that are retried for about 45 hours.
> It is priced per organization, not per connected account: 20 free posts to try, then from $19 a month (RM39 in
> Malaysia). Publishing is open today on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord
> and Slack. YouTube uploads work, and public visibility is not yet confirmed. TikTok, Pinterest publishing and
> LinkedIn company pages are waiting on those networks' approval. Reddit, Snapchat and Google Business Profile are built
> but not open yet.

**Which social networks does Siar support?** (51)
> Publishing is open today on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack.
> YouTube uploads work, and public visibility is not yet confirmed. TikTok, Pinterest publishing and LinkedIn company
> pages are waiting on those networks' approval. Reddit, Snapchat and Google Business Profile are built but not open
> yet.

**How is Siar priced?** (51)
> Per organization, never per connected account. Start with 20 free posts to try. Then Starter is $19 a month (RM39 in
> Malaysia) for 1 brand, Pro $49 (RM99) for 10 brands, and Business $149 (RM399) for unlimited brands. Yearly is 10
> times monthly. Your price never goes up while you stay subscribed.

**Is there a free plan?** (47)
> Siar starts with 20 free posts to try. It is a one-time allowance, not a monthly one: no card, no time limit, and it
> does not refill. Free includes the API, webhooks and comments, but no analytics. After that, Starter is $19 a month
> (RM39 in Malaysia).

**Can my customers connect their own accounts?** (53)
> Yes. Create a brand for each customer and send them a branded connect link with your name, logo and color. They sign
> in to each network in their own browser and come back to your app. You never see a password or token. The page says
> "Powered by Siar" and is in English.

**Do I need my own developer app on each network?** (49)
> Not for the networks that are open today. Facebook, Instagram and Threads connect through Siar's Meta app, which
> passed Meta's App Review on 27 October 2026. X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack connect
> through Siar's own live apps. Each network page lists what the account itself needs.

**What happens if a post fails on one network?** (53)
> The other networks still publish. The failed one keeps the network's own code and message, with a plain-English fix
> from Siar's error reference. A signed `post.published` webhook tells your server each network's result. Fix the
> cause and retry: only the failed networks are sent again, and the retry does not use another post.

**How do I know a post was published?** (51)
> Subscribe to the `post.published` webhook. It fires once, when the whole post has published or failed, with each
> network's result, link and error. Every delivery is HMAC-signed. If your server does not answer, Siar retries 7
> times over about 45 hours, and you can inspect and resend deliveries from the log.

**Can a retry post the same thing twice?** (54)
> Siar claims each network target once, so retries, restarts and double clicks cannot publish the same post again. An
> interrupted send is checked against the account before anything is re-sent. There is no idempotency key on post
> creation, though: resending the create call makes a second post, so check by your own reference first.

**What happens when a token expires?** (48)
> Siar flags a connection when the network revokes the grant or it is about to expire, and sends a
> `social-account.updated` webhook. A post to that account fails with "Reconnect this account, then retry the post."
> Your customer reconnects through the same connect link, and you retry the post.

**Can I post to TikTok?** (41)
> Not yet. TikTok's audit of Siar's app has not passed, so TikTok stays closed until it does. Siar shows each network's
> status, with dates, on its networks page. Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky,
> Mastodon, Discord and Slack.

**Who makes Siar?** (45)
> Siar is made by FF DEV STUDIO (SSM 202603234793), a software studio in Malaysia, and has been live since 12 October
> 2026. It is not siar.my, the Malaysian film service, or SiAR, the Spanish irrigation API. Contact details are in the
> footer of every page.

(If decision 14 keeps the legal name off the home page, use "FF Dev Studio, a software studio in Malaysia" in this answer and drop the SSM number.)

**Questions removed from the current FAQ, and why:**
- "Is Siar an API or an app?" is now covered by section 5.
- The old "Which social networks…" answer listed all 15 with no status (siar-truth §6.9). It is replaced above.
- The old "Do I need developer apps…" answer lacked "for the networks that are open today" (§6.10). It is replaced above.

---

## 11. Closing CTA band

**H2:**
> Write it once. Know how it went.

**Body:**
> Start with 20 free posts to try. No card, no time limit. When you need more, Starter is $19 a month (RM39 in
> Malaysia).

**Primary CTA:** `Start with 20 free posts`

**Secondary CTA:** `Read the quickstart`

The footer button "Start free" becomes "Start with 20 free posts" site-wide (`messaging.md` §6).

---

## 12. What to delete from the current page

| Current element | File | Why |
|---|---|---|
| `stats` row: "15 networks behind one request · 270 API operations · 16 signed webhook events · $0 per connected account" | `index.astro` | A stat row (banned furniture), and "15 networks" without "built for". The numbers move into sentences: 270 in section 7, the webhook detail in section 3 |
| `ApiPanel` (TikTok, LinkedIn company page and Google Business shown as "Posted", with ms timings) | `home/ApiPanel.astro` | siar-truth §6.1. Replaced by section 3 |
| `EventLog` "Live siar · events" (TikTok, YouTube, Pinterest, Reddit and Google Business lines, `@kopisenja`, timings) | `home/EventLog.astro` | §6.2. Replaced by section 3 |
| "One request. 15 networks." + "a Reddit link post, a Google Business offer" | `index.astro` | §6.3. Replaced by section 4 |
| "The parts that break are ours now" + "Fifteen networks means fifteen OAuth flows…" + the six guarantee tiles | `index.astro` | "15" claims; "Grants are renewed before they lapse" and "Media, made to fit" are not in the truth file; "for a day" is wrong (about 45 hours). The true mechanisms now live in pillar 1 and section 3 |
| Flow step 03 "Pinterest a board"; step 05 "DMs in a shared inbox"; "01 / 05" counters | `home/Flow.astro` lines 13, 15 | §6.4–5; numbered eyebrows |
| "First post in five minutes." + `claude mcp add … npx -y @siar/mcp` block | `index.astro`, `lib/snippets.ts` | §6.6–7; the package returns 404 on npm |
| Calculator static default of 40 brands / 6 networks / 240 accounts / "RM99 Pro" / "RM0.41" | `home/PriceCalc.astro` lines 10–24 | §6.8; the source of Copilot's misquote |
| Audience rows numbered "01–04" with arrow glyphs; "Forty brands, one login"; "An MCP server and a JSON-first CLI" | `index.astro` | Banned furniture; the MCP is not installable; 40 brands needs Business |
| Kickers with side claims ("Pricing · per organization", "Reliability · the boring parts", "REST · SDK · CLI · MCP") | `index.astro` | `messaging.md` §8: a kicker names a section and carries no claim |
| "Start free" and the arrow glyph in the hero CTA; "Free plan · 20 posts to try · no card" | `index.astro` | CTA wording rules; §6.11 |
| Page title "Siar \| Write it once. Siar it everywhere." | `index.astro` | Targets no keyword (`current-site.md` §1) |

---

## 13. Comparison table

None on this page, on purpose. The task and `strike-plan.md` §5.2 keep competitor names off the home page. Rival facts belong on `/compare/*`, the two pricing explainers and the other surfaces listed in `messaging.md` §11. The home page links to them only through `/compare`, after the comparison go.

---

## 14. Internal links

**Outgoing links on this page.** Each anchor is used once, describes its target, and is never "click here".

| Anchor | Target | Where | Wave |
|---|---|---|---|
| How publishing works | `/how-publishing-works` | Pillar 1; after the example | W1 (fallbacks: `/docs/posting`, `/docs/webhooks`) |
| What is open on every network / Every network's status, with dates | `/platforms` | Pillar 2; section 4; section 9 | W0 (needs the status table) |
| See every plan | `/pricing` | Pillar 3; section 6 | W0 |
| Bluesky API error codes | `/bluesky-api/errors` | Section 3, step 3 | W0 |
| Take the product tour | `/features` | Section 5 | W0 |
| Read the quickstart | `/docs/quickstart` | Hero; section 7; closing band | W0 |
| OpenAPI file | `/openapi.json` | Section 7 | W0 |
| Webhooks guide | `/docs/webhooks` | Section 7 | W0 |
| Social media API for SaaS | `/use-cases/multi-tenant-social-media-api` | Section 8 | W0 (retitled in W1) |
| For agencies | `/for-agencies` | Section 8 | W1 (fallback `/use-cases/hosted-connect-oauth`) |
| Social media API for AI agents | `/use-cases/social-media-api-for-ai-agents` | Section 8 | W0 |
| Social media scheduling API | `/use-cases/social-media-scheduling-api` | Section 8 | W0 |
| Each network's name | `/<net>-api` (15 hubs) | Section 4 grid | W0 |

**Links to add elsewhere that point here.** These follow `strike-plan.md` §6 rule 1.
- The exact anchor "unified social media API" points only to `/`. Use it once in the lead of each of the 15 network hubs.
- Take the phrase "unified social media API" out of the `/about` title ("About Siar and FF Dev Studio"). It competes with the home page (`current-site.md` §8).
- Add "the dashboard is built on the same unified social media API" with a link to `/` in the `/features` lead.
- Do not link this page from error-page bodies with that anchor. They link `/errors` and their hub.

---

## 15. Schema notes

- **One graph**, keeping the IDs from `docs/geo/plan.md` P1:
  - `WebSite` (with `name` "Siar" and `alternateName` "siaran.my");
  - `Organization` (parent FF DEV STUDIO with `legalName` and `@id`; `contactPoint` as today);
  - `SoftwareApplication` (`applicationCategory` "DeveloperApplication", `operatingSystem` "Web").
- **`SoftwareApplication.description`:** the first two sentences of the canonical paragraph, generated from the same constant as the lead.
- **Offers:** only prices that are visible on this page.
  - Free: price 0, with the description "20 free posts to try, one-time".
  - Starter: USD 19 a month.
  - Business: USD 149 a month.
  - Add the MYR equivalents as separate `Offer`s only if the page shows them in the same sentence. It does: "RM39 in Malaysia", "RM399".
  - Pro ($49 / RM99) appears visibly in sections 6 and 8, so it may be added too.
  - Use `UnitPriceSpecification` with `billingDuration` P1M. Do not use an `AggregateOffer` whose range includes Enterprise, which has no price.
- **`FAQPage`:** exactly the 13 questions in section 10, generated from the same array as the visible FAQ. Questions stay `<h3>` inside `<summary>`, as today.
- **Never:** `AggregateRating`, `Review`, or any badge, award or certification property.
- **`dateModified`** on the `WebPage` must match a visible "Updated 2026-11-xx" line near the footer.
- **Code blocks in section 3** get no schema. They are illustrative and labelled "Example".
- **`sameAs`:** only profiles that exist and are public. Do not add the GitHub repo unless it is public [unverified for this file].
- **`llms.txt`:** the top paragraph must be the same canonical paragraph (`strike-plan.md` 0.15), so `/`, `/llms.txt`, `/pricing.md` and `/about` say the same thing.

---

## 16. Why this wins

**Keywords this page targets.** Demand grades are the sibling sweep's measurements (Google autocomplete, DDG and WebSearch, 2026-11-12, in `research/keywords/head-unified.md` and `keyword-map.md` C01). They are used here as **[inferred]** demand. I did not re-measure them: the shared WebSearch budget for this run was already spent.

| Keyword | Where it sits | Evidence (sibling) | Expected win [inferred] |
|---|---|---|---|
| unified social media API (primary) | Title, subhead, lead sentence 1, FAQ 1 | AC returns the phrase itself; 6 vendors title-target it; social-api.ai (first captured 2026-06-10) held #1 on DDG, so a new domain can rank on Bing/DDG | Bing/DDG in weeks to months; Google in months |
| social media api | Title (contained), lead, H2s | AC 10, HN 10 stories; held by large vendors and blogs | Long-term; needs off-site work (strike-plan §7) |
| unified social api / unified api for social media | Body ("unified social media API" contains both word sets) and FAQ 1 | AC for both | Rides on the primary |
| social media management api | Section 5 H2 | AC 3 ("buffer social media management api", "social media management tools with api") | Months; shared with `/features` |
| post once publish everywhere | Section 4 H2 ("Post once, publish everywhere Siar is open") | AC 10 in `keyword-map.md` C01 | Months. The honest qualifier "Siar is open" keeps the phrase intact |
| what is a unified social media API (p001) | FAQ 1 and the lead | Prompt set v1 | A definition source for AI answers until C28 exists |

**AI prompts it answers** (from `docs/geo/prompts_v1.csv` and the `prompts_v2` set in `strike-plan.md` §8):

- **Branded:**
  - p031 "what is Siar": lead and FAQ 2.
  - p032 "Siar pricing": price line, FAQ 4 and the corrected calculator HTML.
  - p033 "which networks Siar supports": FAQ 3 and section 4, with the status split.
  - p035 "who makes Siar": FAQ 13 and the trust line.
  - p037 "does Siar have an MCP server": section 7, "built, not on npm yet".
- **Category:**
  - p001: FAQ 1.
  - p002 "post to multiple networks from one API": section 4.
  - p016 "let customers connect with OAuth": pillar 2 and FAQ 6.
  - p012 "Instagram via API without a Meta app": FAQ 7.
  - p018 "webhooks when a post is published": section 3, step 4 and FAQ 9.
  - p045 "avoid double posting on retry": FAQ 10.
- **Positioning set (v2):**
  - "what happens if a social media API post fails on one network": section 3 and FAQ 8.
  - "which social media API retries webhooks": FAQ 9.
  - "social media API that prevents duplicate posts when retrying": FAQ 10.
  - "social media API that returns the platform's own error message": section 3, step 3.
  - "social media API with signed webhooks": section 3, step 4.

**Why it should beat the current page** [inferred]:
1. **The title targets the category term.** Today it targets nothing (`current-site.md` §1). The category term also travels with the name, which separates Siar from siar.my and SiAR.
2. **Every engine reading the static HTML gets the same facts.** That holds for the lead, the FAQ, the JSON-LD and `llms.txt`. The Copilot misquote came from one bad server-rendered default; that default is gone.
3. **The example is copy no rival can lift.** It is a real `400` with `issues`, a verbatim network error with its fix, and the actual `post.published` payload. The idea, "every post accounted for", is shown rather than claimed, and every line survives a hostile developer checking it against the API.
4. **The honesty section and the status grid answer the first objection every segment raises** ("does it post to TikTok?") on the page itself. They also remove the liability of a home page that contradicts `/platforms`.

---

## Evidence for every claim on this page

| Claim on the page | Label | Source |
|---|---|---|
| Validation at create time; 400 with `issues` (`code`, `message`, `path`) | [code] | `apps/api/src/modules/posts.ts` lines 57–86; `apps/api/src/platform/errors.ts` (envelope `statusCode`, `message`, `issues`) |
| Threads limit message "Text is N characters (emoji count as their byte length); the limit is 500." | [code] | `packages/networks/src/adapters/threads.ts` line 155 |
| Nothing created on a 400 | [code] | `checkDraft` throws before the post is written (`posts.ts` lines 62, 86) |
| Each network target claimed once; interrupted sends checked before re-sending; "could not be confirmed" | [code] | `apps/api/src/engine/publisher.ts` lines 20–23 and 262–289 (siar-truth §1c; strike-plan §2 row 12) |
| Network error kept verbatim (`code`, `errorMessage`, `httpStatus`, `retryability`, `isTransient`, `userFacingMessage`, `meta`) | [code] | `packages/networks/src/lib/errors.ts` `toVerbose()` |
| Bluesky "ExpiredToken / Token has expired" → TOKEN_INVALID; fix "Reconnect the Bluesky account." | [code] | `packages/networks/src/adapters/bluesky.ts` lines 60, 424 |
| HTTP 400 for Bluesky's ExpiredToken in the example | [inferred] | The AT Protocol returns 400 for ExpiredToken. Not read from Bluesky's docs today; it appears only in the labelled example |
| Account marked for reconnect; "Reconnect this account, then retry the post." | [code] | `publisher.ts` lines 106 and 166 |
| `social-account.updated` webhook on revoked or expiring grants | [code] | `apps/site/src/lib/events.ts`; maintenance engine (siar-truth §1c) |
| `post.published` fires once at the post's final state, with `errors`, `errorsVerbose`, `externalData` (status, permalink); post status `ERROR` if any target failed | [code] | `publisher.ts` `recomputePost` lines 227–260; `apps/api/src/domain/serialize.ts` `targetMaps`, `post()`; envelope `id`, `type`, `createdAt`, `organizationId`, `data` in `apps/api/src/platform/events.ts` line 22 |
| Webhook headers `x-siar-event`, `x-siar-delivery`, `x-siar-timestamp`, `x-siar-signature` (HMAC-SHA256 over `timestamp.body`) | [code] | `apps/api/src/engine/webhooks.ts` lines 7–33 |
| Retried 7 times over about 45 hours (1 min, 5 min, 30 min, 2 h, 6 h, 12 h, 24 h) | [code] | `webhooks.ts` lines 12–14 (siar-truth §1c, §6.29) |
| Retry re-sends only failed networks; retries (up to 6) don't count again; only posts in ERROR can be retried; `POST /api/v1/post/{id}/retry` | [code] | `posts.ts` `post.retry` lines 243–255; `plans.ts` `RESOURCE_LIMITS.maxRetries: 6`; `packages/contract/openapi.json` path |
| Transient errors retried automatically | [code] | `publisher.ts` lines 167–172 |
| Open, waiting and not-open network lines | [doc] + [sourced] | `messaging.md` §9; siar-truth §1a, §2; YouTube per strike-plan §2 row 7 (https://developers.google.com/youtube/v3/revision_history, checked 2026-11-12 by the strike-plan pass) |
| Meta App Review passed 27 October 2026 | [doc] | `docs/approvals/meta.md`, `docs/approvals/README.md` |
| Branded connect link (name, logo, color); "Powered by Siar"; app.siaran.my; English only | [code] | `apps/web/src/views/Portal.vue` (line 96), `accounts.ts` `socialAccount.createPortalLink` |
| Prices, brands, posts, trial, yearly = 10×, unlimited accounts, Free one-time with no analytics | [code] | `apps/api/src/domain/plans.ts` lines 43–47; siar-truth §3 |
| Webhooks and comments on Free | [code] | Webhooks are not plan-gated in `plans.ts` (`RESOURCE_LIMITS.webhooks: 5` per organization); Free comments 50 one-time |
| One account per network per brand | [code] | `schema.prisma` line 4 (`market.md` §1) |
| Price lock line | [code] | `PRICE_LOCK` in `apps/site/src/lib/plans.ts` line 54 |
| Ringgit; FPX or DuitNow for yearly; card elsewhere | [code] + [doc] | `ONCE_METHODS` in `plans.ts`; `docs/pricing.md` |
| Comments inbox networks; DMs in beta per organization | [code] | siar-truth §1c, §2 (`messaging-shared.ts` line 25, `schema.prisma` line 161) |
| 270 operations, OpenAPI 3.0 | [measured] | siar-truth §9 (live `/openapi.json` = `packages/contract/openapi.json`); generated at build |
| SDK, CLI and MCP 0.1.0, not on npm | [measured] | siar-truth §2 (npm 404, checked 2026-11-12) |
| No idempotency key on create | [code] | strike-plan §2 row 11 |
| Live since 12 October 2026; FF DEV STUDIO, SSM 202603234793 | [doc] + [code] | `README.md` Status; `apps/site/src/config.ts` |
| siar.my is a Malaysian film service; SiAR is a Spanish irrigation API | [measured] | `current-site.md` §4 (search results, 2026-11-12) |
| Calculator: 8 × 5 = 40 accounts; Pro $49 / RM99; $1.23 / RM2.48 per account | [inferred] (arithmetic) | `plans.ts` prices; 49 / 40 = 1.225, 99 / 40 = 2.475 |

## Open items for Fakhrul

1. **Decision 14 (trust line).** Section 6 and FAQ 13 each give two versions. Use the SSM version only if he allows the legal name on the home page.
2. **YouTube wording.** This page follows `messaging.md` and strike-plan row 7: uploads work, public visibility not yet confirmed. `siar-truth.md` §1b still says "videos stay private until YouTube's API audit is complete". Update the truth file, or change both lines here the day one public test upload is confirmed (decision 6).
3. **Flow clips and the dashboard screenshot.** Watch them once for networks that are not open, and for DMs shown as available to everyone, before shipping.
4. **Deploy.** Nothing here ships without his go (decision 1).
