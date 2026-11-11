# Use cases hub copy: `/use-cases` (English)

Written 2026-11-12. Final, publish-ready copy for `apps/site/src/pages/use-cases/index.astro`.

**Status:** LIVE-RETITLE, Wave 1 (`strike-plan.md` §5.2 row `/use-cases`, cluster C08 in `keyword-map.md`). The page
exists and is in Google (`research/current-site.md` §2). Today its title is "Use cases | Siar" and it targets no keyword.

**Job of this page:**
1. Answer "what can you build with a social media API" in the first 60 words.
2. Send each buyer to the right page. Agencies go to `/for-agencies`. SaaS builders go to
   `/use-cases/multi-tenant-social-media-api`.
3. Give every use case a body in-link. The analytics, comments, webhooks and hosted-connect pages have only 2 to 4
   in-links today (`current-site.md` §4).

**Built on these files** (nothing in them is redone here):
- `research/siar-truth.md`, as corrected by `strike-plan.md` §2. Row 7 changes the YouTube wording.
- `messaging.md`: §3 pillars, §4 segment leads, §5 objections, §6 voice, §9 status lines, §11 naming rules.
- `strike-plan.md` §5.6 (use case list, waves, holds) and §6 (linking rules 7, 10, 11, 13).
- `keyword-map.md` rows C08 to C21.
- `research/keywords/use-case-segments.md` and `head-unified.md`.
- `market.md` §4 (pains), §5 (jobs) and §8 (buyer vocabulary).
- `landing-copy/home.md` §8, so the routing lines match.

**Labels in the notes:**
- **[code]**: read in this checkout today.
- **[doc]**: owner records in `docs/`.
- **[sourced]**: a vendor's or network's own page, with its URL, checked 2026-11-12.
- **[measured]**: seen today.
- **[inferred]**: judgement.

The copy itself carries no labels. The evidence table at the end covers every claim on the page.

**Page rules:**
- No competitor names. `messaging.md` §11 allows rival names only on `/compare/*`, the two pricing explainers, the
  `/malaysia` table and the webhook tables. This hub is none of those.
- No held pages are listed or linked: no comment-to-DM page, no video-publishing page (`strike-plan.md` §5.6, rule 11).
- Every card sentence names open networks only. Never "15 networks".
- No numbered eyebrows. Today's hub prints `01`–`08` before each row; remove that.
- No stat rows, no mono-caps labels, no arrow glyphs. Today's rows end in `→`; remove it.
- Button labels are words only.

---

## Meta

| Field | Final value | Length |
|---|---|---|
| Title | `What you can build with a social media API \| Siar` | 49 chars |
| Meta description | `Post and schedule to Facebook, Instagram, Threads, X and LinkedIn profiles, let customers connect accounts, answer comments and get results by webhook.` | 151 chars |
| URL | `https://siaran.my/use-cases` (unchanged; indexed in Google) | |
| Canonical | `https://siaran.my/use-cases` | |
| OG title | `What you can build with a social media API` | |
| OG description | Same as the meta description | |
| Breadcrumb | Home › Use cases | |

The title is the strike plan's wording (`strike-plan.md` §5.2), plus the brand.

---

## Hero

**H1:** What you can build with a social media API

**Subhead (the answer to the main query, 59 words):**
A social media API lets your code publish, schedule, reply and measure. With Siar, a unified social media API, you can
post to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack in one request. You
can also let customers connect through your branded link, answer comments, read analytics and get every result in a
signed webhook.

**Second line (pain, then outcome):**
Add social publishing without building nine integrations or going through Meta's review yourself. Pick the job below.
Each page shows the request, the limits and the questions that come up.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart (`/docs/quickstart`)

**Under the buttons (small):**
No card needed. The API is on every plan, the free one included.

Link inside the subhead: the words "unified social media API" link to `/`. This is the one exact-match anchor to home on
this page (`strike-plan.md` §6 rules 1 and 13).

---

## Section: Start from who you are (`#who`)

**H2:** Start from who you are

**Body:**
Most buyers fall into one of four groups. If one fits you, start with its page. Every other page below still applies.

**Four route rows** (title, one sentence, then the link in words):

- **You're adding social posting to your SaaS product.**
  Give each customer their own brand, let them connect through a link with your name on it, and keep one API key for
  all of them.
  Link: `Social media API for SaaS` → `/use-cases/multi-tenant-social-media-api`

- **You're an agency or freelancer running client accounts.**
  10 brands for $49 a month (RM99 in Malaysia). Each client connects through a link with your name and logo, and you
  never ask for a password.
  Link: `Siar for agencies` → `/for-agencies`
  (Wave note: until `/for-agencies` is live, point this row at `/use-cases/hosted-connect-oauth` with the anchor
  `Branded connect link for clients`. Switch it the day the agency page ships.)

- **You're building an AI agent or an automation.**
  An agent needs to know whether its post went out: one REST call to publish, a signed webhook with the result.
  Link: `Social media API for AI agents` → `/use-cases/social-media-api-for-ai-agents`

- **You're posting from your own code, CI or workflow tool.**
  One HTTP call posts your release notes to Slack, Discord, your LinkedIn profile and X.
  Link: `Social media posting API` → `/use-cases/social-media-posting-api`

---

## Section: Publish and schedule (`#publish`)

**H2:** Publish and schedule posts

**Intro line:**
Write it once. Each network gets its own text and media, checked against that network's rules before Siar accepts the
post.

**Card: Social media posting API** → `/use-cases/social-media-posting-api`
One request posts to Facebook Pages, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack.
Each network gets its own text and media, and a request that breaks a network's rules gets a `400` naming the field.

**Card: Social media scheduling API** → `/use-cases/social-media-scheduling-api`
Set a future time in UTC and Siar publishes when it comes, on every open network. Each account gets the post once, even
after a retry or a restart.

---

## Section: Put social into your product (`#product`)

**H2:** Put social posting inside your product

**Intro line:**
Your customers connect their own accounts. You never handle their passwords, and your bill does not grow with every
account they add.

**Card: Social media API for SaaS (multi-tenant)** → `/use-cases/multi-tenant-social-media-api`
Give each customer their own brand, keep one API key for all of them, and pay per organization. Business is $149 a
month (RM399 in Malaysia) for unlimited brands and 100,000 posts.

**Card: Social media OAuth API: a branded connect link** → `/use-cases/hosted-connect-oauth`
Send one link with your name, logo and color. Your customer signs in to Facebook, Instagram, Threads, X, LinkedIn,
Bluesky, Mastodon, Discord or Slack in their own browser, and you never see a password or token.

---

## Section: Comments and the inbox (`#reply`)

**H2:** Reply to comments

**Intro line:**
Most of the conversation happens under the post. Answer it as the connected account, from your code or the dashboard.

**Card: Social media comments API** → `/use-cases/social-media-comments-api`
Publish replies and import the comments people leave on Facebook, Instagram, Threads, X, Bluesky and Mastodon. Then
hide, delete or like them where the network allows.

**Card: Social media inbox API** → `/use-cases/social-media-inbox-api` (**ships in W2: add this card the day that page
is published, never before**)
Answer comments from Facebook, Instagram, Threads, X, Bluesky and Mastodon in one inbox. Facebook and Instagram DMs are
in beta, turned on per organization on request (paid plans).

---

## Section: Measure and react (`#measure`)

**H2:** Know what happened, and how it did

**Intro line:**
Find out whether a post went out without polling, and see how it did in one shape across networks.

**Card: Social media webhooks API** → `/use-cases/social-media-webhooks`
Get a signed `post.published` event with each network's result. If your server is down, Siar retries 7 times over
about 45 hours, with a delivery log you can inspect and resend.

**Card: Social media analytics API** → `/use-cases/social-media-analytics-api`
Read post and account metrics from Facebook, Instagram, Threads, X, Bluesky and Mastodon in one shape, with the
network's raw payload kept beside it. Analytics are on every paid plan.

---

## Section: Agents and your own pages (`#more`)

**H2:** Agents and link in bio

**Card: Social media API for AI agents** → `/use-cases/social-media-api-for-ai-agents`
Your agent publishes with one REST call and learns from a signed webhook whether the post went out. When a network
says no, the webhook carries that network's own error.

**Card: Link-in-bio API** → `/use-cases/link-in-bio-api` (W1, new page. **Add this card the day that page is
published.** Until then, link the same sentence to `/features#bio` with the anchor `Link in bio in the dashboard`.)
Each brand gets a public link-in-bio page you can build and reorder through the API. Views and clicks are counted per
link per day, at no extra cost.

---

## Section: What every use case shares (`#shared`)

**H2:** Every post accounted for, whatever you build

**Body:**
The same publishing engine sits under every page above. It works the same from the API and from the dashboard, because
the dashboard is a client of the same API.

- **Checked before it's sent.** Each network's limits on text, media, size, duration and aspect ratio are checked when
  you create the post. A bad request fails then with a `400` you can fix, not at 9 a.m.
- **Sent once.** Each network target is claimed once. Retries, restarts and double clicks cannot publish the same post
  again.
- **The network's own words.** If a network says no, you get its own code and message, plus a plain-English fix.
- **The others still go out.** If one network fails, the rest still publish. A retry re-sends only the networks that
  failed, and it does not use another post from your plan.

Link: `How publishing works` → `/how-publishing-works` (W1, N1). Until that page is live, use `/docs/posting` with the
anchor `How posting works`. Never link a page that is not published.

**Concession line (same section, plain text):**
Networks still reject posts. Siar tells you which network said no and why; it does not promise that every post
publishes.

---

## Section: Networks open today (`#networks`): the comparison table

**H2:** What works on each network today

**Intro line:**
Each use case only works where the network has opened to Siar. This table shows what you can use today.

| Network | Publish and schedule | Comments | Analytics |
|---|---|---|---|
| Facebook Pages | Yes | Reply, import, hide, delete, like | Post and account |
| Instagram (professional accounts) | Yes | Reply, import, hide, delete | Post and account |
| Threads | Yes | Reply, import, hide, delete | Post and account |
| X | Yes, billed from a prepaid credit at X's own USD prices | Reply, import, hide, delete, like (X's reply limits apply) | Post and account, fetched when you ask, billed from your X credit |
| LinkedIn (personal profiles) | Yes | Not offered yet | Not offered yet |
| Bluesky | Yes | Reply, import, delete, like | Post and account |
| Mastodon (any server) | Yes | Reply, import, delete, like | Post and account |
| Discord | Yes, as a bot with a name and avatar per brand | The bot can reply and delete; no import | No |
| Slack | Yes, with a custom bot name | Reply, import (slow: Slack limits apps outside its Marketplace), delete, like | Post reactions and replies |

**Under the table (exact status lines from `messaging.md` §9):**
- YouTube: connect and upload now; public uploads not yet confirmed.
- TikTok: built, opening after TikTok approves Siar.
- Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access.
- LinkedIn: personal profiles today; company pages open after LinkedIn grants page access.
- Reddit, Snapchat and Google Business Profile: built, not open yet.

Link: `Every network's status` → `/platforms`

**Source of each cell** (notes, not on the page): adapter `capabilities` blocks [code, read today]:
- `facebook.ts` 234–236
- `instagram.ts` 245–247
- `threads.ts` 96–98
- `twitter.ts` 284–286 (`metered: true`)
- `bluesky.ts` 409–411
- `mastodon.ts` 98–100
- `discord.ts` 148–150 (`commentImport: false`, no analytics)
- `slack.ts` 173–175 (`accountAnalytics: false`, `postAnalytics: true`)

More sources for the X, LinkedIn and Slack cells:
- X analytics only on a forced refresh: `/use-cases/social-media-analytics-api` copy and the X metering [code].
- LinkedIn comments and analytics: the adapter declares them, but `siar-truth.md` §2 says "leave out until tested on a
  real profile", so the cells say "Not offered yet".
- Slack import speed: `siar-truth.md` §1a.

**Build note:** generate this table from the single network-status constant (Wave 0 item, `strike-plan.md` §3 strike
1). It must not come from the health endpoint (`siar-truth.md` §0). No page writes its own status.

---

## Section: What Siar doesn't do yet (`#limits`): objection handling on the page

**H2:** What these use cases don't cover yet

- **TikTok.** Not yet. TikTok's audit of Siar's app has not passed, so TikTok stays closed until it does.
- **YouTube.** Connect and upload now. Public uploads are not yet confirmed on production.
- **LinkedIn company pages.** Personal profiles today. LinkedIn has not granted Siar page access.
- **Pinterest Pins.** Connect today. Publishing Pins opens after Pinterest grants Standard access.
- **DMs and comment-to-DM.** Facebook and Instagram only, in beta, turned on per organization on request (paid plans).
- **White-label.** The connect link carries your name, logo and color. The page still says "Powered by Siar", runs on
  app.siaran.my and is in English.
- **Client logins and approvals.** Members see the whole organization. There is no approval step and no report export
  today.
- **SDK and MCP installs.** The TypeScript SDK, CLI and MCP server (version 0.1.0) are built from the same OpenAPI
  contract but are not on npm yet. Today, call the REST API with curl, fetch or requests.
- **Idempotency keys.** Not on post creation. If you resend a create call, you create a second post, so check by your
  own reference first.

---

## Section: Price (`#price`)

**H2:** One price for your organization, whatever you build

**Body:**
Siar is priced per organization, not per connected account. You start with 20 free posts to try, no card needed. Then
plans start at $19 a month (RM39 in Malaysia) for 1 brand and 300 posts.

Pro is $49 a month (RM99 in Malaysia) for 10 brands and 10,000 posts, with a 14-day trial. Business is $149 a month
(RM399 in Malaysia) for unlimited brands and 100,000 posts.

No per-account fees. Each brand connects one account on every open network. A post sent to every connected network
counts as one post. Your price never goes up while you stay subscribed.

Link: `See pricing and quotas` → `/pricing`

---

## FAQ (`#faq`, also FAQPage JSON-LD from the same array)

Each answer is answer-first, 40 to 60 words (counts in brackets, not on the page).

**What can you build with a social media API?**
You can build anything that posts, schedules, replies or measures on social networks from your own code. Common
examples: a scheduler inside your SaaS product, a client portal for an agency, an AI agent that publishes, release
notes from CI, a comments inbox, an analytics report and a link-in-bio page. [50]

**What is a social media API used for?**
A social media API lets software do what a person does in each network's app. It can publish and schedule posts,
connect accounts, read and answer comments, and pull metrics. A unified API like Siar does this for several networks
through one set of requests, one key and one error format. [51]

**Which networks can I publish to with Siar today?**
Facebook Pages, Instagram professional accounts, Threads, X, LinkedIn personal profiles, Bluesky, Mastodon, Discord and
Slack. YouTube uploads work, but public uploads are not yet confirmed. TikTok, Pinterest publishing and LinkedIn company
pages open after those networks approve Siar. Reddit, Snapchat and Google Business Profile are built but not open yet.
[50]

**Can my customers connect their own social accounts?**
Yes. Send each customer a connect link with your name, logo and color. They sign in to each network in their own
browser and return to your app. You never see a password or token, and tokens are encrypted at rest and never returned
by the API. [47]

**Do I need my own Meta app to post to Instagram and Facebook?**
No. Facebook, Instagram and Threads connect through Siar's Meta app, which passed Meta's App Review on 27 October 2026
with all 27 permissions it asked for. Your customers connect through it, so you do not wait on your own review for
those three networks. [44]

**Is Siar a good fit for an agency with many clients?**
Yes, if your clients use the open networks. Pro gives you 10 brands for $49 a month (RM99 in Malaysia), and each client
connects through your branded link. A brand holds one account per network, so a client with two Facebook Pages uses two
brands. There are no client logins yet. [51]

**Can an AI agent post to social media through Siar?**
Yes, through the REST API. The agent publishes with one call and reads the result from a signed webhook or from the
post's status, including the network's own error if it failed. An MCP server and CLI are built, but they are not on
npm yet, so there is no install command today. [53]

**Can I send DMs or auto-reply to comments with Siar?**
Partly. Comments and replies are live on Facebook, Instagram, Threads, X, Bluesky and Mastodon. Facebook and Instagram
DMs and comment-to-DM automations are in beta, turned on per organization on request, on paid plans. No other network
has DMs in Siar. [40]

**How much does a social media API cost with Siar?**
Siar charges per organization, not per account. You start with 20 free posts to try, with no card. Then it costs $19 a
month (RM39 in Malaysia) for 1 brand, $49 (RM99) for 10 brands, or $149 (RM399) for unlimited brands. Your price never
goes up while you stay subscribed. [50]

**What happens if a post fails on one network?**
The other networks still publish. The failed one keeps the network's own error and a plain-English fix, and the
`post.published` webhook tells your server each network's result. Fix the cause and retry: only the failed networks are
sent again, and the retry doesn't use another post from your plan. [49]

---

## Closing CTA band (site `Cta` component, copy for this page)

**Heading:** Write it once. Siar it everywhere.
**Line:** Pick a use case, send one request, and see what happened on every network. 20 free posts to try, no card.
**Primary button:** Start with 20 free posts
**Secondary button:** Read the quickstart

---

## Objection handling (for sales and the copy team; the on-page version is the "What these use cases don't cover yet" section)

| The buyer says | Answer (allowed wording) | Where it is answered on this page |
|---|---|---|
| "Can I post to TikTok?" | "Not yet. TikTok's audit of Siar's app has not passed, so TikTok stays closed until it does. Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack." | Limits section, FAQ 3 |
| "Your table says 15 networks somewhere else." | "Siar is built for 15 networks. Nine are open for publishing today; the table shows which." | Network table |
| "Is it white-label?" | "It's a branded connect link: your name, logo and color. The page still says 'Powered by Siar', runs on app.siaran.my and is in English." | Limits section |
| "Who uses you? What's your uptime?" | "Siar has been live since 12 October 2026, so there are no case studies or uptime record to show yet. What you can check today: the public OpenAPI file, the generated network and error references, the dated status of every network, and a price list with a price lock. Try it with 20 free posts, no card." | Not on this page; `/about` |
| "Others give unlimited posts." | "Siar caps posts: 300 a month on Starter, 10,000 on Pro, 100,000 on Business. A post sent to every connected network counts as one, and drafts and retries don't count." | Price section |
| "Why not build it ourselves?" | "You can. Budget for the gates: Siar's Meta review took from 14 to 27 October 2026, LinkedIn denied page access, TikTok's audit has not passed." | Hero second line (by implication); full answer on `/guides/social-media-api-integration` (W2) |
| "Can I connect two Instagram accounts for one client?" | "Each brand holds one account per network. Put the second account in a second brand; Pro has 10." | FAQ 6 |
| "`npx -y @siar/mcp` fails." | "The TypeScript SDK, CLI and MCP server (version 0.1.0) are built from the same OpenAPI contract but are not on npm yet. Today, call the REST API directly." | Limits section, FAQ 7 |

---

## Comparison table: why there is no rival table here

No competitor table belongs on this page. `messaging.md` §11 limits rival names to `/compare/*`, the pricing
explainers, the `/malaysia` table and the webhook tables. The comparison a hub visitor needs is "what works on which
network". The Siar-only table above answers that, from the code.

Measured for context only (not on the page). Neither of these returns a hub at `/use-cases`. Both run separate
use-case pages instead:
- https://www.ayrshare.com/use-cases/ returned HTTP 404 [measured 2026-11-12, WebFetch]. Ayrshare's own pages include
  `/use-cases/saas-platforms/`, `/use-cases/ai-startups/` and `/use-cases/digital-agencies/`
  (`research/competitors/ayrshare.md` row 78–80, sourced from its sitemap).
- https://zernio.com/use-cases returned HTTP 404 [measured 2026-11-12, WebFetch]. Zernio's own pages include
  `/use-cases/saas-platforms` (`research/competitors/late.md` line 83).

---

## Internal links

### Out of this page (all contextual, descriptive anchors, one exact-match anchor per target)

| Anchor | Target | Where on the page | Wave |
|---|---|---|---|
| unified social media API | `/` | Subhead | Now |
| Read the quickstart | `/docs/quickstart` | Hero, closing CTA | Now |
| Social media API for SaaS | `/use-cases/multi-tenant-social-media-api` | Routing row | Now (retitled W1) |
| Siar for agencies | `/for-agencies` | Routing row | W1 (fallback `/use-cases/hosted-connect-oauth`) |
| Social media API for AI agents | `/use-cases/social-media-api-for-ai-agents` | Routing row + card | Now |
| Social media posting API | `/use-cases/social-media-posting-api` | Routing row + card | Now |
| Social media scheduling API | `/use-cases/social-media-scheduling-api` | Card | Now |
| Social media OAuth API: a branded connect link | `/use-cases/hosted-connect-oauth` | Card | Now (retitled W1) |
| Social media comments API | `/use-cases/social-media-comments-api` | Card | Now |
| Social media inbox API | `/use-cases/social-media-inbox-api` | Card | W2, only once published |
| Social media webhooks API | `/use-cases/social-media-webhooks` | Card | Now |
| Social media analytics API | `/use-cases/social-media-analytics-api` | Card | Now |
| Link-in-bio API | `/use-cases/link-in-bio-api` | Card | W1, only once published (fallback `/features#bio`) |
| How publishing works | `/how-publishing-works` | Shared section | W1 (fallback `/docs/posting`) |
| Every network's status | `/platforms` | Under the table | Now |
| See pricing and quotas | `/pricing` | Price section | Now |

The routing row and the card link the same target for posting and AI agents. Use the same anchor both times, so the page
still has one exact-match anchor per target. Or drop the card link and keep the row link.

**Never link:** `/use-cases/comment-to-dm`, `/use-cases/video-publishing-api`, or any network hub with a "post to
<network>" anchor for a network that is not open (`strike-plan.md` §6 rule 11).

### Into this page (add these)

| From | Anchor | Note |
|---|---|---|
| `/` section 8 "Who it's for" | What you can build with a social media API | `home.md` §14 lists the segment links; add the hub as the closing link of that section |
| Every `/use-cases/*` page | Use cases (breadcrumb) + "More social media API use cases" in "Keep reading" | Today `[slug].astro` has no link back to the hub except the breadcrumb JSON-LD |
| `/features` developers band | Social media API use cases | One line under the API block |
| `/docs` index | Social media API use cases | Separates the use cases from docs guides (`current-site.md` §8) |
| `/for-agencies` and `/use-cases/multi-tenant-social-media-api` | Everything else you can build | One line in "Keep reading" |
| Footer, Product column | Use cases | Already there. Also add the four orphaned use cases to the footer "Use cases" column: analytics, comments, webhooks, hosted connect (`strike-plan.md` §6 rule 9) |

---

## Schema notes

- **`CollectionPage`**, with `name` = the H1, `url` = `https://siaran.my/use-cases`, `description` = the meta description,
  `isPartOf` → the `WebSite` `@id`, `about` → the `SoftwareApplication`/`Organization` `@id` already on home.
- **`ItemList`** as `mainEntity`: one `ListItem` per card that is live on the day of publishing, with `position`,
  `name` (the card title) and `url`. Generate it from the same array that renders the cards. Then the inbox and
  link-in-bio items appear only when their pages exist, and held pages never appear.
- **`BreadcrumbList`**: Home › Use cases.
- **`FAQPage`** from the same FAQ array that renders on the page. The answers must match the visible text word for word.
- **No `AggregateRating`, `Review` or `Offer` with ratings.** There are no reviews (`siar-truth.md` §5). If an `Offer`
  is added, use the exact plan prices from the plan constants, in USD and MYR, with no "free plan" wording.
- The table's network names come from the status constant, so the schema and the visible table cannot disagree.
- Add a `.md` twin at `/use-cases.md` with the same copy, linked with `rel="alternate" type="text/markdown"`
  (`strike-plan.md` §5.11, cheap to generate).

---

## Why this wins

**Keywords.** Demand is [inferred] from the evidence named. Autocomplete is [measured 2026-11-12]: Google suggest,
`client=firefox`, `hl=en`, `gl=us`, one request per seed.

- **what you can build with a social media API** (primary, from `strike-plan.md` §5.2).
  - Evidence: "what can you build with social media api", "things to build with social media api", "social media api
    ideas" and "what can you do with a social media api" all return 0 completions [measured].
  - Demand: near zero as typed [inferred]. The title is still right for the page. It is the question the hub answers,
    and the phrase AI answer engines can lift as a definition. The page earns its keep by routing and by passing links,
    not by its own traffic.
- **social media api use cases** (secondary).
  - Evidence: 0 completions for the phrase and for "use cases for social media api" [measured].
  - Demand: low [inferred]. Covered by the H2s and the card titles.
- **what is social media api / social media api meaning** (bonus, FAQ 2).
  - Evidence: "what is social media api" returns itself, "what social media apis are free" and "social media api
    meaning" [measured]. "social media api examples" returns "social media api example" and "social media api meaning"
    [measured].
  - Demand: low to medium, informational [inferred]. FAQ 2 answers it in 50 words, with the definition first.
- **social media api for …** (routing).
  - Evidence: "social media api for" completes to "developers", "posting", "ai agents", "free" and "agentic workflows"
    [measured].
  - Each completion matches a route or card: posting → posting card, AI agents → agents card, developers → quickstart.
    "Free" is answered with "20 free posts to try", never "free API".
- **Card titles carry the cluster keywords**, so the hub gives each use case its anchor. C09 posting, C10 scheduling,
  C11 SaaS/multi-tenant, C12 OAuth, C14 analytics, C15 comments, C16 webhooks, C18 link in bio and C19 inbox are all
  in `keyword-map.md`. This answers `keyword-map.md` item 0.7 and `strike-plan.md` §6 rule 9: the four orphaned use
  cases get body links.

**AI prompts targeted** (`docs/geo/prompts_v1.csv`):
- p001 "what is a unified social media API": the subhead and FAQ 2 give a quotable definition.
- p002 "how do I post to multiple social networks from one API": posting card plus FAQ 3.
- p004 "best social media API for SaaS products" and p050 "multi-tenant social media API one key many customers":
  SaaS route and card.
- p005 "social media posting API for agencies with many client accounts": agency route plus FAQ 6.
- p009 "how can an AI agent post to social media": agent route plus FAQ 7, with an honest "not on npm".
- p012 "how to post to Instagram via API without building a Meta app": FAQ 5.
- p016 "how to let my customers connect their own social accounts with OAuth": FAQ 4 plus the OAuth card.
- p018 "social media API with webhooks when a post is published": webhooks card.
- p019 "API to read and reply to comments on Instagram and Facebook": comments card plus FAQ 8.
- p020 "social media analytics API for multiple networks": analytics card.
- p033 "which networks does Siar support": the network table and FAQ 3 give engines the correct open/closed split.
  Today the home FAQ's "15 networks" line is what they would repeat.

**Why it can win:** neither of the two vendor sites checked has a `/use-cases` hub; both return 404 [measured]. So a
hub that defines the term, routes by buyer and states per-network capability from the code fills a gap. AI answers
can quote it. This is [inferred]: no SERP was measured for this page. A one-month-old domain will not rank a head term
from it, but the hub raises every spoke's in-links on day one (`strike-plan.md` §6 rule 10).

**Evidence note:** WebSearch refused all three queries made for this page. The shared 200-call budget for this turn
was spent. So no result page or People Also Ask box was measured today. Ranking claims above are limited to the two
vendor 404s (direct WebFetch of the vendors' own URLs) and the sibling sweeps' measurements named. No further search
was attempted after the refusal.

---

## Evidence for every claim on this page

| Claim on the page | Source | Label |
|---|---|---|
| Publishing open on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack | `siar-truth.md` §1a; `docs/approvals/README.md` | [doc] |
| YouTube "connect and upload now; public uploads not yet confirmed" | `strike-plan.md` §2 row 7 (overrides `siar-truth.md` §1b); `messaging.md` §9 | [doc], [sourced: developers.google.com/youtube/v3/revision_history via the strike plan] |
| TikTok, Pinterest, LinkedIn pages, Reddit, Snapchat, GBP status lines | `messaging.md` §9; `siar-truth.md` §2 | [doc] |
| One request, per-network text and media, `400` naming the field | `apps/api/src/modules/posts.ts` (`issues`), adapters' `validate` | [code via siar-truth §1c] |
| Each account gets the post once; retries and restarts cannot re-send | `apps/api/src/engine/publisher.ts` 20–23, 284 | [code via siar-truth §1c] |
| If one network fails, the others publish; a retry re-sends only failed ones and doesn't count | `posts.ts` `post.retry`; `plans.ts` `maxRetries: 6`; pricing page | [code via messaging §3] |
| Webhook retried 7 times over about 45 hours, delivery log, resend | `apps/api/src/engine/webhooks.ts` 12–14; `system.ts` `webhook.resend` | [code via siar-truth §1c, §4] |
| Branded connect link: name, logo, color; "Powered by Siar", app.siaran.my, English only | `apps/web/src/views/Portal.vue` (line 96); `accounts.ts` 235 | [code via siar-truth §1c, §4] |
| Tokens encrypted at rest and never returned by the API | README; Meta data-use answer | [doc] |
| Meta App Review passed 27 October 2026, all 27 permissions | `docs/approvals/meta.md` | [doc] |
| Comments on Facebook, Instagram, Threads, X, Bluesky, Mastodon; actions per network | Adapter `capabilities` (lines in the table notes) | [code, read today] |
| Analytics on Facebook, Instagram, Threads, X, Bluesky, Mastodon; paid plans only | Adapter `capabilities`; `plans.ts` `analytics: false` on Free | [code] |
| Discord: bot replies and deletes, no import, no analytics | `discord.ts` 148–150 | [code, read today] |
| Slack: post analytics only; slow import | `slack.ts` 173–175; `siar-truth.md` §1a | [code], [doc] |
| LinkedIn comments and analytics "not offered yet" | `siar-truth.md` §2 ("leave out until tested") | [doc] |
| DMs: Facebook and Instagram only, beta, per organization on request, paid plans | `messaging-shared.ts` 25; `schema.prisma` 161 | [code via siar-truth §2] |
| Link in bio: one page per brand, API build and reorder, views and clicks per link per day, no extra cost | `apps/api/src/modules/bio.ts` line 9 ("views and clicks counted per day"); `/api/v1/bio-item/reorder` and `/api/v1/bio-analytics` in `packages/contract/openapi.json` | [code, read today] |
| Prices, brands, posts, trial, price lock, 20 free posts to try, no card | `apps/api/src/domain/plans.ts`; `PRICE_LOCK` in `apps/site/src/lib/plans.ts` | [code via siar-truth §3] |
| One account per network per brand | `schema.prisma` line 4 | [code via messaging §3] |
| API on every plan, Free included | `siar-truth.md` §4 | [code] |
| SDK, CLI, MCP 0.1.0 built, not on npm | npm registry 404 for `@siar/sdk`, `@siar/cli`, `@siar/mcp` | [measured by siar-truth, 2026-11-12] |
| No client logins, approvals or report export | `use-case-segments.md` product facts (roles OWNER/ADMIN/MEMBER; no approval step; no export) | [code via sibling] |
| No idempotency key on create | `strike-plan.md` §2 row 11 | [code via strike plan] |
| Dashboard is a client of the same API | `apps/web` calls `/api/v1` | [code via siar-truth §4] |

---

## Changes from the live page (checklist for `use-cases/index.astro` and `lib/usecases.ts`)

- `<Base title>`: "Use cases" → the meta title above. Description → the meta description above.
- `PageHero`: kicker "Use cases", title "What people build", dim "with Siar." → the H1, subhead and CTAs above.
- Remove the row numbers (`String(i + 1).padStart(2, '0')`) and the `→` span. These are a numbered eyebrow and an arrow
  glyph (`messaging.md` §8).
- Do not render `u.description` on the hub. Five of those descriptions say "15 social networks" or "15 networks"
  (posting, scheduling, analytics, hosted connect, AI agents). Add a `card` field to `UseCase` carrying the one-sentence
  copy above, plus a `group` field for the section it sits in. Fix the descriptions themselves on each page's own
  rewrite.
- Add a `live` flag (or publish date) to each entry. Then the inbox and link-in-bio cards, and their `ItemList` items,
  appear only once their pages exist. Held pages (comment-to-DM, video) never get an entry.
- Add the routing section, the shared-mechanism section, the network table (from the status constant), the limits
  section, the price section and the FAQ with FAQPage JSON-LD. Today the hub has no JSON-LD.
- Closing `Cta`: button "Start free" → "Start with 20 free posts".
- Out of scope here but found while reading: `[slug].astro` heads every use case's network grid with "Works with every
  supported network". "Every" is on the banned list (`messaging.md` §6). Change it to "Networks open today" and render
  the grid from the status constant.
