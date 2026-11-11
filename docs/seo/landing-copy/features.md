# /features: landing copy (en)

Checked 2026-11-12. Cluster C02 (`keyword-map.md`). Strike-plan row: LIVE-FIX W0, RETITLE W1 (`strike-plan.md` §5,
items 0.5 and 0.11). Replaces the "Product tour" copy in `apps/site/src/pages/features.astro`.

Facts follow `research/siar-truth.md` as corrected by `strike-plan.md` §2, and the wording rules in `messaging.md`.
Labels used in the notes (not on the page): **[code]** read in this checkout today, **[doc]** owner record,
**[measured]** seen today, **[inferred]** judgement.

Segment: agencies and freelancers (`messaging.md` §4.5), read globally, so prices are "$ (RM in Malaysia)".
No competitor is named on this page: `messaging.md` §11 allows rival names only on `/compare/*`, the two pricing
explainers, the `/malaysia` table and the webhook tables. The comparison table below is therefore Siar's own network
status table, not a rival table.

---

## Meta

| Field | Copy | Length |
|---|---|---|
| Meta title | Social media scheduler and inbox on the same API \| Siar | 55 |
| Meta description | Schedule posts, plan a client's month in one CSV and answer comments in one inbox. Each post shows every network's result and its own error. | 140 |
| URL | `https://siaran.my/features` (unchanged; keep the URL, it is indexed in Google per `current-site.md`) | |
| OG title | Social media scheduler and inbox, built on the same API | |
| OG description | Same as the meta description | |

Why the title differs from the strike plan: the plan's title "Social media scheduler and inbox, built on the same API
| Siar" is 62 characters and gets cut in results. The 55-character version keeps every word that carries the query
("social media scheduler", "inbox", "API") and matches the category-creator draft (`strategy-category-creator.md`
line 257). The full plan wording becomes the H1.

---

## Hero

**H1:** Social media scheduler and inbox, built on the same API

**Subhead (the answer, first 60 words):**
Siar is a social media scheduler with an API underneath, for agencies and freelancers who run several brands.
Plan each client's month in the calendar or one CSV, answer comments in one inbox, and see what happened to every post
on every network, in the network's own words when one says no. The same REST API is on every plan.

(60 words.)

**Primary CTA:** Start the 14-day Pro trial
**Secondary CTA:** Start with 20 free posts
**Text link under the buttons:** Skip to the API (anchor `#developers`)

**Demo-data note (keep, directly under the CTAs):**
Every screen on this page is the real Siar dashboard running on demo data: one café with three outlets, posting where
its customers are.

**Jump links (plain words, no numbers):** Composer · Calendar · Post results · Bulk CSV · Inbox · Analytics ·
Connect link · Link in bio · Brands and roles · API

---

## Section: Composer (`#publishing`)

**H2:** Write it once. Siar it everywhere.

**Body:**
Pick the brand's accounts and write the post once. Open any network's tab to give it its own text, media, first
comment or options, or leave it on the main text. A character count for each network updates as you type.

Each network's rules are checked when you save: length, media type, file size, video duration and aspect ratio. A
problem is pinned to the field that caused it, so the post fails while you are still writing, not at 9 a.m.

**Points:**
- Per-network text, media, first comment and options in one post
- Schedule it, publish now, or save a draft. Drafts don't count against your posts
- An account that needs reconnecting is greyed out with the reason, so you can't schedule into a dead connection

**Link:** Social media posting API (`/use-cases/social-media-posting-api`)

**Shot:** `flow-3` (composer). **Re-shoot required**, see "Screenshots" below.
**Alt:** The Siar composer with a Threads-specific version of a café's post, going to Facebook, Instagram and Threads

---

## Section: Calendar (`#calendar`)

**H2:** Each client's month, in your time zone.

**Body:**
Every scheduled, published, failed and draft post for the brand sits on one calendar, in your team's time zone. Drag
a scheduled post to another day to move it. Click a day to write a post for it, or open it to see what goes out, at
what time, and where.

**Points:**
- A colour for each state: scheduled, published, failed, draft
- Drag to reschedule, click to edit
- A day panel with times and networks

**Link:** Social media scheduling API (`/use-cases/social-media-scheduling-api`)

**Shot:** `calendar`. **Re-shoot required.**
**Alt:** A month of a café's scheduled and published posts in the Siar calendar, in Kuala Lumpur time

---

## Section: Post results (`#results`) — pillar 1 in dashboard terms

**H2:** See what happened to every post, on every network.

**Body:**
Open any post and each network gets its own line: published, with a link to the live post, failed, or still waiting.
When a network says no, the line shows a plain-English explanation, then what the network said, with its error code
and HTTP status. The full network response is one click away.

If one network fails, the others still publish. Fix the cause and press Retry: only the networks that failed are sent
again, and the retry doesn't use another post from your plan.

**Points:**
- Each network's result on one screen, with the network's own error when it refuses
- Each network gets your post once. Retries, restarts and double clicks can't publish it again
- If a send is interrupted, Siar looks for the post on the account before sending again. Where a network gives no way
  to look, Siar marks it "could not be confirmed" instead of risking a second post
- Likes, comments and views for each network on the same screen, on paid plans

**Link:** How publishing works (`/how-publishing-works#errors`, once N1 is live; until then `/docs/errors`)

**Shot:** a new `post-detail` shot of the post drawer (`apps/web/src/components/PostDrawer.vue`) with one failed
network. Build it on mock networks, never a real account.
**Alt:** A post's detail in Siar: published on Facebook and Instagram, failed on X with X's own error message and code

Evidence: `PostDrawer.vue` (per-network status, permalink, "Network said", code, HTTP status, raw response, Retry)
[code]; `posts.ts` `post.retry` resets only `ERROR` targets [code]; `publisher.ts` claim and stale-claim check
[code]; `RESOURCE_LIMITS.maxRetries: 6` and "retries don't count again" [code, live pricing page].

---

## Section: Bulk CSV (`#bulk`)

**H2:** Plan a client's month in one spreadsheet.

**Body:**
Download a CSV template for the networks you need, already filled in with the brand's ID. Each row is one post: its
text, date, status, networks, and, for each network, its own text, media links and first comment. Upload the file and
watch every row turn into a post.

Rows that fail show the reason, and you can filter to failed rows only. Rows that worked link straight to their post.

**Points:**
- One template per brand, with columns for the networks you tick
- Files up to 10 MB; dates in ISO 8601; each row scheduled or saved as a draft
- A result for every row, and a link to every post it created

**Link:** CSV import in the API reference (`/docs/api/post-csv-import`)

**Shot:** a new `bulk` shot of `Bulk.vue` after an import with one failed row (mock networks).
**Alt:** A finished CSV import in Siar with each row's result and one failed row's reason

Evidence: `apps/web/src/views/Bulk.vue` (template download pre-filled with the team ID, per-network columns
`<net>MediaUrls` / `<net>FirstComment`, 10 MB, ISO 8601, SCHEDULED or DRAFT, per-row result, failed filter, "Open post")
[code]; `content-csv.ts` [code].

---

## Section: Inbox (`#inbox`)

**H2:** Answer comments without opening six apps.

**Body:**
Pick a published post and import its comments into the brand's inbox. Reply as the account, and like, hide or delete
where the network allows it. Comments come in from Facebook, Instagram, Threads, X, Bluesky and Mastodon.

Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request (paid plans).

**Points:**
- One inbox per brand, every comment next to the post it belongs to
- Reply on every network listed above (X's own reply limits apply); hide on Facebook, Instagram, Threads and X; like on Facebook, X, Bluesky and
  Mastodon; delete on all six
- Imported comments are other people's words, so Siar deletes them after 30 days

**Link:** Social media comments API (`/use-cases/social-media-comments-api`)

**Shot:** `inbox`. Content can stay (Threads and Instagram comments only). Re-shoot with the rest anyway so the
sidebar and the seed match (see below).
**Alt:** The Siar inbox with customer comments from Threads and Instagram, each with Reply, Like and Hide

Evidence: `Inbox.vue` (import per post, actions), adapters' `commentActions` (Facebook hide/like/delete; Instagram and
Threads hide/delete; X like/hide/delete; Bluesky and Mastodon like/delete) [code]; `maintenance.ts` line 86
(imported comments deleted after 30 days) [code]; DM status line from `messaging.md` §9.

---

## Section: Analytics (`#analytics`)

**H2:** Show each client what landed.

**Body:**
Followers, impressions, views, likes and comments for each network, over time, so you can compare a brand's networks
side by side. Numbers are collected daily and are the network's own totals; Facebook, Instagram and Threads count the
last 28 days. Each network's raw numbers are kept alongside.

Analytics come with every paid plan, from Starter.

**Points:**
- Account growth and post performance for Facebook, Instagram, Threads, Bluesky and Mastodon
- X is left out of the daily collection, because X bills every read
- Refresh a post's figures on demand, within each network's limits

**Link:** Social media analytics API (`/use-cases/social-media-analytics-api`)

**Shot:** `analytics` (Instagram, 30 days). Check it shows no closed network, then keep.
**Alt:** Siar analytics for a café's Instagram account over 30 days

Evidence: `Analytics.vue` subtitle and empty states [code]; `ANALYTICS_TYPES` [code]; `content-analytics.ts` (X left out
of the daily sweep; `PostDrawer.vue` hides Refresh for X) [code]; Free has no analytics [code: `plans.ts`].
LinkedIn analytics are left out on purpose (siar-truth §2).

---

## Section: Connect link (`#connect`)

**H2:** Clients connect their own accounts. You never ask for a password.

**Body:**
Make a connect link for the networks you need, set it to expire after anything from an hour to 30 days, and send it.
Your client sees your name and logo, signs in to each network in their own browser and picks the Page or channel to
post to. They don't need a Siar login.

Tokens are encrypted at rest and never returned by the API. When a connection is revoked or about to expire, Siar
flags it in the dashboard and sends a `social-account.updated` webhook, and your client reconnects through a new link.

**Points:**
- One link for any set of open networks
- Facebook, Instagram and Threads connect through Siar's Meta app, which passed Meta's App Review on 27 October 2026
- The page says "Powered by Siar", runs on app.siaran.my and is in English

**Link:** Social media OAuth API: a branded connect link (`/use-cases/hosted-connect-oauth`)

**Shot:** `portal`. **Re-shoot required.**
**Alt:** The branded connect page a client sees, with Instagram and Facebook connected and Threads ready to connect

Evidence: `Accounts.vue` line 319 (expiry options 1 hour to 30 days) and the "no Siar login needed" description
[code]; `Portal.vue` (brand name, logo, accent colour; "Powered by Siar" line 96) [code]; Meta approval [doc:
`docs/approvals/meta.md`].

---

## Section: Link in bio (`#bio`)

**H2:** A link-in-bio page for every brand, included.

**Body:**
Each brand gets one public page of links for its profiles. Add headings, text, link buttons and social icons in any
order, with the brand's own avatar and accent colour. Views and clicks are counted per link, per day.

No extra tool and no extra bill.

**Points:**
- One page per brand, on every plan
- Your order, your accent colour, your avatar
- Views and clicks per link for the last 30 days

**Shot:** `bio`. Check, then keep.
**Alt:** Editing a café's link-in-bio page in Siar, with a live preview

Evidence: `Bio.vue` (item types, accent colour, avatar, "Last 30 days"), `bio.ts` [code].

---

## Section: Brands and roles (`#brands`)

**H2:** One login for every client.

**Body:**
A brand holds one client's accounts, posts, media and link-in-bio page. (A brand is a team in the API.) Switch between
brands from the top bar. If you already connected a login for one brand, copy it into another without signing in to
the network again.

Invite your team as owners, admins or members. The audit log records who did what.

**Points:**
- Starter 1 brand, Pro 10, Business unlimited
- No per-account fees. Each brand connects one account on every open network
- Owners, admins and members, with an audit log

Evidence: `TeamSettings.vue` ("Copy accounts from another team"), `OrgSettings.vue` (roles OWNER, ADMIN, MEMBER;
"Audit log" tab) [code]; brands per plan [code: `plans.ts`]; one live account per network per team
[code: `schema.prisma` line 4]. Accounts wording is the strike plan's recommended default (§10 decision 3).

---

## Section: And the rest (`#more`)

**H2:** The rest of the toolbox.

Three short items (heading + one sentence):

- **Media library.** Upload once and reuse it in any post. Files are kept for 14 days after their last use.
- **Bots for Discord and Slack.** Post to channels under a bot name and avatar you choose, per brand.
- **X credit.** X bills every API call, so X actions draw from a prepaid balance at X's own USD prices. Siar adds no
  markup in USD.

Removed from the live page: the Google Business tile (parked; siar-truth §2, §6 item 14).

Evidence: `RESOURCE_LIMITS.mediaRetentionDays: 14` (generated on the page, keep it generated) [code]; `Bots.vue` [code];
`X_PRICES` [code + sourced in siar-truth §1c]. X line follows `messaging.md` §5: describe how it works, never sell it
as an advantage.

---

## Section: Developers (`#developers`, ink band)

**H2:** The dashboard is a client of the same API you get.

**Body:**
Everything above is a call to Siar's REST API, described in a public OpenAPI 3.0 file with 270 operations. Build your
own client portal, push posts from your CMS, or let a script fill the calendar. Keys belong to the organization and
work across all its brands.

A signed webhook tells your server how each post went. Failed deliveries are retried 7 times over about 45 hours, with
a log you can inspect and resend. The API is on every plan, including the 20 free posts to try.

**Points (under the two shots):**
- 16 HMAC-signed webhook events, with test events and secret rotation
- An `x-api-key` header, up to 50 keys per organization
- TypeScript SDK, CLI and MCP server (version 0.1.0), built from the same OpenAPI contract. Not on npm yet

**Buttons:** Read the quickstart (`/docs/quickstart`) · API reference (`/docs/api`)

**Shots:** `api-keys`, `webhooks` (keep; check the webhook log shows no closed network).
**Alts:** "API keys in Siar, with when each was last used" · "A webhook endpoint's delivery log in Siar"

Implementation note: the operation count and event count stay generated (`operations().length`,
`WEBHOOK_EVENTS.length`), never typed. Drop the link to `/docs/sdk-cli-mcp` as a button until the packages are on npm;
that page still prints install commands (siar-truth §6 item 6).

---

## Section: Networks (`#networks`) — the comparison table

**H2:** Built for 15 networks. Here is what is open today.

**Lead:**
Siar is built for 15 networks. You can schedule and publish to nine of them today. The rest wait on each network's own
approval, and this table changes the day one opens.

| Network | Status |
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

**Link under the table:** Every network's status, with dates (`/platforms`)

Source: the status lines in `messaging.md` §9, from `docs/approvals/README.md` [doc], as of 2026-11-12. Render this
table from the single network-status constant that Wave 0 introduces (`strike-plan.md` §3 strike 1), not from this
file and never from the health endpoint (siar-truth §0).

---

## Section: What it doesn't do yet (`#limits`) — objection handling on the page

**H2:** What Siar doesn't do yet.

**Body (intro):**
Better you read it here than find it in week two.

- **Client logins and approvals.** Members see the whole organization. There is no client login, no approval step and
  no PDF report export today.
- **Two accounts on one network for one client.** Each brand holds one account per network. A client with two
  Facebook Pages uses two brands; Pro has 10.
- **TikTok and LinkedIn company pages.** Not open yet; see the table above.
- **A white-label connect page.** The link carries your name and logo, but says "Powered by Siar", runs on
  app.siaran.my and is in English.
- **Unlimited posts.** Posts are capped: 300 a month on Starter, 10,000 on Pro, 100,000 on Business. A post sent to
  every connected network counts as one, and drafts and retries don't count.
- **Support by chat.** Email support on every plan. The dashboard is in English.

Evidence: `messaging.md` §4.5 concessions and §5 objections, word for word where possible.

---

## Section: Price (`#price`)

**H2:** One price for the agency, not for each account.

**Body:**
10 brands for $49 a month (RM99 in Malaysia), with 10,000 posts and a 14-day trial. Unlimited brands and 100,000 posts
on Business: $149 a month (RM399). Starter is $19 (RM39) for one brand and 300 posts.

Your price never goes up while you stay subscribed.

**Buttons:** Start the 14-day Pro trial · See pricing (`/pricing`)

Notes: currency follows the billing country on the pricing page; on this global page show "$ (RM in Malaysia)"
(`messaging.md` §6, numbers). The trial is Pro only, once per organization, by card (siar-truth §3b rule 8): if the
sign-up flow cannot start a trial directly, the button still goes to sign-up and the trial starts at the first Pro
checkout.

---

## FAQ (`#faq`, also FAQPage JSON-LD from the same array)

**Is there a social media scheduler with an API?**
Yes. Siar is a social media scheduler and inbox whose dashboard runs on the same public REST API you get on every plan,
including the 20 free posts to try. Schedule from the calendar, a CSV or your own code, and a signed webhook tells your
server how each post went on each network. (54 words)

**Can I bulk schedule social media posts from a CSV?**
Yes. Download Siar's CSV template for the networks you need, with one row per post: text, date, networks, and each
network's own text, media links and first comment. Upload a file of up to 10 MB. Every row gets a result, and failed
rows show the reason. (47 words)

**Which networks can I schedule to today?**
Facebook Pages, Instagram professional accounts, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack
are open today. YouTube uploads work, but public uploads are not yet confirmed. TikTok, Pinterest publishing and
LinkedIn company pages are waiting on those networks' approval. Reddit, Snapchat and Google Business Profile are built
but not open yet. (52 words)

**Does the inbox include direct messages?**
Comments, yes: import a post's comments from Facebook, Instagram, Threads, X, Bluesky or Mastodon, then reply, and
like, hide or delete where the network allows. Facebook and Instagram DMs and comment-to-DM automations are in beta,
turned on per organization on request, on paid plans. Other networks' DMs aren't available. (49 words)

**What happens if a post fails on one network?**
The other networks still publish. The failed network's line shows a plain-English explanation and the network's own
error, code and HTTP status. Fix the cause and press Retry: only the failed networks are sent again, and the retry
doesn't use another post from your plan. Up to six retries per post. (51 words)

**Can clients connect their accounts without giving me their passwords?**
Yes. Send a connect link with your name and logo. Your client signs in to each network in their own browser and picks
the Page or channel, with no Siar login. You never see a password or token. The page says "Powered by Siar" and is in
English, so it isn't white-label. (52 words)

**How much does Siar cost for an agency with 10 clients?**
Pro covers 10 brands for $49 a month (RM99 in Malaysia), with 10,000 posts and analytics, and a 14-day trial. There
are no per-account fees: each brand connects one account on every open network. Above 10 clients, Business is $149
(RM399) for unlimited brands. Your price never goes up while you stay subscribed. (53 words)

**Can my clients log in and approve posts?**
Not today. Siar has owners, admins and members per organization, with an audit log, but members see the whole
organization and there is no client login, approval step or report export. If you need client approvals now, build
the step in your own portal on Siar's API, or wait for the feature. (52 words)

**Are analytics included on every plan?**
On every paid plan, from Starter at $19 a month (RM39 in Malaysia). The 20 free posts to try have no analytics.
Analytics show followers, impressions, views, likes and comments for Facebook, Instagram, Threads, Bluesky and
Mastodon, collected daily from each network's own totals. X is left out because X bills every read. (53 words)

**Do I need to write code to use Siar?**
No. The dashboard covers scheduling, the calendar, CSV import, the inbox, analytics, connect links and link-in-bio
pages without code. The API is there when you want it: the dashboard itself runs on it, so anything you do by hand you
can later automate with an API key. (47 words)

Note on the approvals question: "social media scheduler with approval process" is the first Google completion for
"social media scheduler with" [measured 2026-11-12, see the evidence note at the end]. The honest "Not today" answer is
the point: it stops a mismatched trial and is what an AI answer should repeat.

---

## Closing CTA (site `Cta` component, copy for this page)

**H2:** Plan next month for every client, today.
**Body:** Start with 20 free posts to try, no card. Or start the 14-day Pro trial and bring 10 brands.
**Buttons:** Start the 14-day Pro trial · Start with 20 free posts

---

## Objection handling (for sales and the copy team; the on-page version is the "What Siar doesn't do yet" section)

| Buyer says | Answer (allowed wording) | Source |
|---|---|---|
| "Is it white-label?" | "It's a branded connect link: your name, logo and color. The page still says 'Powered by Siar', runs on app.siaran.my and is in English." | messaging §5 |
| "Can my client log in, approve posts or get a PDF report?" | "Not today. Members see the whole organization, there is no approval step, and reports stay in the dashboard with no export." | messaging §5 |
| "Can I connect two Instagram accounts for one client?" | "Each brand holds one account per network. Put the second account in a second brand; Pro has 10." | messaging §5 |
| "Can I post to TikTok?" | "Not yet. TikTok's audit of Siar's app has not passed, so TikTok stays closed until it does. Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack." | messaging §5 |
| "Others give unlimited posts." | "Siar caps posts: 300 a month on Starter, 10,000 on Pro, 100,000 on Business. A post sent to every connected network counts as one, and drafts and retries don't count." | messaging §5 |
| "Meta Business Suite is free." | "It is, for Facebook and Instagram. Use Siar when the same post also goes to Threads, X and LinkedIn, or when you run several brands." | messaging §5 |
| "Who uses you? What's your uptime?" | "Siar has been live since 12 October 2026, so there are no case studies or uptime record to show yet. What you can check today: the public OpenAPI file, the generated network and error references, the dated status of every network, and a price list with a price lock. Try it with 20 free posts, no card." | messaging §5 |
| "Do you have WhatsApp or BM support?" | "Email support on every plan. The dashboard is in English. No WhatsApp." | messaging §5 |

---

## Screenshots (blocking for W0)

"Real screenshots only" holds, but four of the live shots show closed networks as usable, which breaks siar-truth §2
on the image even after the text is fixed [measured: viewed each `.webp` on 2026-11-12]:

| Shot | Problem seen | Action |
|---|---|---|
| `flow-3.webp` (composer) | TikTok and Google Business as selectable accounts; a Google Business tab and "Going to: Google Business" | Re-shoot |
| `calendar.webp` | Google Business ("G") posts in the day panel | Re-shoot |
| `posts.webp` (used on home and as `posts-dark`, `posts-phone`) | Most rows go to Google Business | Re-shoot (affects home too) |
| `portal.webp` | TikTok and YouTube shown as connected; LinkedIn subtitle "Profile and company pages" | Re-shoot; also fix the LinkedIn subtitle in `Portal.vue` to "Personal profile" |
| `inbox.webp` | Comments are Threads and Instagram only (fine). The sidebar shows "Google Business" | Re-shoot with the others so the seed matches; hiding the Google Business nav item while parked is a product call |

How: change the demo seed so the café's brands connect only open networks (Facebook, Instagram, Threads, X, LinkedIn
profile, Bluesky), reseed, run `node apps/site/scripts/shots.mjs` (dashboard :5290, API :3290), then reseed again
because the `flow` scene schedules a post (`CLAUDE.md`, "Look"). New shots needed: `post-detail` (one failed network on
mock X) and `bulk` (an import with one failed row). Both on mock networks only.

---

## Internal links

**Out from this page (add):**
- `/use-cases/social-media-posting-api` (composer), anchor "Social media posting API"
- `/use-cases/social-media-scheduling-api` (calendar), anchor "Social media scheduling API"
- `/use-cases/social-media-comments-api` (inbox), anchor "Social media comments API"
- `/use-cases/social-media-analytics-api` (analytics), anchor "Social media analytics API"
- `/use-cases/hosted-connect-oauth` (connect link), anchor "branded connect link"
- `/docs/api/post-csv-import` (CSV), anchor "CSV import API reference"
- `/platforms` (status table), anchor "every network's status"
- `/pricing` (price section), anchor "See pricing"
- `/docs/quickstart`, `/docs/api` (developers band)
- When live: `/how-publishing-works#errors` (post results, anchor "how Siar handles a failed post"),
  `/for-agencies` (price section, anchor "Siar for agencies"), `/errors` (post results, anchor "every network's error
  codes")

**In to this page (add):**
- Home: the product walkthrough's "See the whole dashboard" link, anchor "social media scheduler and inbox"
- `/for-agencies` (M1): "the dashboard tour" next to the composer and inbox lines
- `/use-cases/social-media-scheduling-api` and `/use-cases/social-media-comments-api`: one line each, "Prefer a
  dashboard? The same scheduler and inbox are in Siar's dashboard", anchor "social media scheduler with an API"
- `/pricing`: "What each plan includes" links here, anchor "tour the dashboard"

**Never:** the anchor "unified social media API" (home only), any "post to TikTok" or "Google Business" anchor, the
`/docs/sdk-cli-mcp` install page as a button until npm.

---

## Schema notes

- Keep `BreadcrumbList` (Home › Product), renaming the crumb to "Dashboard".
- Add `FAQPage` generated from the same FAQ array the page renders (`faqLd` in `apps/site/src/lib/seo.ts`), so the
  visible answers and the JSON-LD never differ.
- Add `WebPage` with `about` pointing at the home page's `SoftwareApplication` by `@id`. Do not repeat `offers` here;
  prices live in one place (home/pricing `softwareLd`).
- Each product shot as an `ImageObject` with `caption` = the alt text, only if the template already supports it.
- No `AggregateRating`, `Review`, customer logos or usage numbers (siar-truth §5).
- `dateModified` from the build date, and regenerate whenever the network-status constant changes.

---

## Why this wins

**Keywords (demand all [inferred] from the evidence named):**
- **social media scheduler with api** (primary). Google autocomplete returns it as the second completion for "social
  media scheduler with" [measured 2026-11-12]; head-unified row 25 graded it Low demand, months to win, with
  planable.io, opus.pro, dev.to, producthunt.com and pallyy.com in the top results (measured once by a sibling sweep).
  It sits in the H1 wording, the title and the first sentence.
- **social media management tools with api** (head-unified row 26; the phrase autocompletes as itself
  [measured 2026-11-12]). Answered by the subhead and the developers band.
- **social media inbox** / **unified social media inbox** / **social media comment management tool**: all autocomplete
  [measured 2026-11-12]; use-case row 96 (AC 4) and row 89 (AC 4 / AC 9). The head "social media inbox" is High and
  owned by incumbents (row 97: skip as a target); this page targets the comment-management and "unified inbox" forms
  in the inbox H2 and FAQ.
- **bulk schedule posts csv**: autocomplete returns nothing for that exact phrase [measured 2026-11-12]; use-case
  row 116 found "social media bulk upload" at AC 4. Kept as an H2 and FAQ because Siar has the feature and the
  wording matches what buyers type when they do search.
- **multi channel social media posting**: autocompletes as itself [measured 2026-11-12]. Covered by the composer
  section and "Write it once. Siar it everywhere."
- **social media scheduler for agencies** autocompletes [measured 2026-11-12]; the conversion page for it is
  `/for-agencies`, so this page uses it only in the price section and links there.

**AI prompts targeted** (`docs/geo/prompts_v1.csv`):
- p005 "social media posting API for agencies with many client accounts" (brands, connect link, price section)
- p019 "API to read and reply to comments on Instagram and Facebook" (inbox section and DM FAQ)
- p048 "social media scheduling tool for Malaysian agencies with API" (subhead + RM prices in the price section)
- p003 "best API to schedule posts on Instagram TikTok and LinkedIn": the honest status table gives engines a correct
  "TikTok not open, LinkedIn profiles only" answer instead of the wrong one the live page implies

**Why it can win:** the ranking pages for the "with api" forms are listicles and dashboard tools that bolt an API on;
none shows a post's per-network result with the network's own error, a CSV with per-row results and a status table
that admits what is closed. Every claim here can be checked in the product, which is what AI answers lift.

**Evidence note:** WebSearch refused both queries made for this page (the shared 200-call budget for this turn was
spent), so no result page was re-measured today; ranking pages quoted above are the sibling sweeps' measurements. The
Google autocomplete lists marked [measured 2026-11-12] came from one suggest-endpoint request per seed, sent in the
same batch as those searches and returned before the refusal was seen. No further queries were made after it.

---

## Changes from the live page (checklist for the W0 fix in `features.astro`)

- `<Base title>`: "Product tour" → the meta title above; description → the meta description above
- Hero: kicker "Product tour" and "One dashboard. / 15 networks. No tab juggling." → H1 and subhead above
- Remove the numbered kickers (`String(i + 1).padStart(2, '0')`): no numbered eyebrows (`messaging.md` §8)
- Inbox: drop "direct messages from every connected network" and the TikTok alt text
- Connect: drop "in your client's language" and "company pages, ... locations"
- "And the rest": drop the Google Business tile; "Bulk post" becomes its own section; "Teams and roles" becomes
  "Brands and roles"
- Add the post-results, CSV, networks, limits, price and FAQ sections
- Footer CTA "Start free" → "Start with 20 free posts"; no arrow glyphs in button copy (`messaging.md` §6)
