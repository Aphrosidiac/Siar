# /platforms/limits: final copy

Status: publish-ready copy for a NEW Wave 2 page (strike plan §5.3 row `/platforms/limits`, keyword map C05).
Written 2026-11-12. The page does not exist yet: there is no `apps/site/src/pages/platforms/limits*` [measured].
The nearest live copy is the "Daily caps" block on each network page (`apps/site/src/pages/[api]/index.astro`
lines 75-83), the "Per-network daily caps" table on `/pricing` and `/docs/rate-limits`. This page keeps their wording
where it works ("Per connected account, per UTC day", the pricing FAQ's reason for caps) and puts every limit in one
place, with the network's own source next to each number.

**Generated, not typed.** Every Siar number on this page is rendered at build time from the code that enforces it.
No Siar number is copied into the page by hand (the rule already written at the top of `apps/site/src/lib/plans.ts`).

| Block on the page | Generated from |
|---|---|
| Daily caps by plan | `dailyPostCaps`, `dailyCommentCaps`, `CAP_COLUMNS` (`apps/api/src/domain/plans.ts`, `apps/site/src/lib/plans.ts`), via `NETWORKS[].dailyPosts / dailyComments` in `apps/site/src/lib/networks.ts` |
| Text and media limits | each adapter's `limits` (`packages/networks/src/adapters/*.ts`) via `NETWORKS[].adapter.limits`; comment length from `COMMENT_LENGTH` (the value the comments and first-comment code enforces: `content-comments.ts` line 135, `posts.ts` line 81) |
| Siar API rate limits | `WINDOWS` in `apps/api/src/platform/ratelimit.ts` lines 13-15 |
| Monthly quotas (one line) | `PLANS` in `apps/api/src/domain/plans.ts` |
| Status line per network | the one status constant (messaging §9, strike plan §5.0 rule 2), never the health endpoint |
| Network's own limits | a new data file, `apps/site/src/data/network-limits.ts`: one entry per network with the quoted figure, the source URL and the checked date. The build warns when a `checked` date is older than 30 days (same rule as rival facts, strike plan §5.0 rule 3) |

Sources for every fact on this page:

- **Siar, code** (this checkout): files above, plus `apps/api/src/domain/quota.ts` lines 62-67 (`accountKey` =
  network + the network's own account id, "so reconnecting/duplicating an account shares the cap"; the 403 message);
  `apps/api/src/modules/posts.ts` lines 90-97 and 185-193 (caps counted when a post leaves DRAFT, on the UTC day of its
  `postDate`; moving the date moves the cap); `apps/api/src/modules/teams.ts` lines 115-124
  (`GET /api/v1/organization/usage/daily-limits`); `apps/api/src/platform/routes.ts` lines 114-119 (bucket per key and
  operation, headers, `retry-after`, Enterprise multiplier); `apps/api/src/platform/errors.ts` (403 and 429 envelopes);
  `packages/networks/src/adapters/twitter.ts` lines 27-28 and 214-217 (280 / 25,000 and the `tweetStorm` hint).
- **Siar, truth file**: `docs/seo/research/siar-truth.md` (status wording, rate limits line, "daily caps follow the
  network identity", what may not be said about TikTok).
- **Networks, sourced, all fetched and checked 2026-11-12** (quotes in section 4 are word for word from these):
  - Instagram: https://developers.facebook.com/docs/instagram-platform/content-publishing ("Rate Limit": "Instagram
    accounts are limited to 100 API-published posts within a 24-hour moving period."; "Create a carousel container >
    Limitations": "Accounts are limited to 50 published posts within a 24-hour period."; both: carousels count as one)
  - Threads: https://developers.facebook.com/docs/threads/overview ("Rate limiting": 250 posts, 1,000 replies,
    100 deletions, 500 location searches, each "within a 24-hour moving period"; `threads_publishing_limit`)
  - Facebook Pages: https://developers.facebook.com/docs/graph-api/overview/rate-limiting ("Calls within 24 hours =
    4800 * Number of Engaged Users"; no fixed Page-post count stated; `X-Business-Use-Case-Usage`)
  - LinkedIn: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin ("Rate
    Limits" table, "Daily Request Limit (UTC)": Member 150 Requests, Application 100,000 Requests)
  - X: https://docs.x.com/x-api/fundamentals/rate-limits (`POST /2/tweets` 100/15min per user, 10,000/24hrs per app;
    `DELETE /2/tweets/:id` 50/15min per user; "You can be within rate limits but still incur usage costs")
  - Bluesky: https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/rate-limits.md (source of
    docs.bsky.app, which redirected to bsky.network and rendered empty on 2026-11-12): 5,000 points per hour and
    35,000 per day; create 3, update 2, delete 1 point; "at most 1,666 records per hour and 11,666 records per day";
    createSession 30 per 5 minutes and 300 per day; 3,000 requests per 5 minutes per IP
  - Mastodon: https://docs.joinmastodon.org/api/rate-limits/ (300 calls in 5 minutes per account and per IP;
    `POST /api/v1/media` 30 in 30 minutes; status deletes 30 in 30 minutes; `X-RateLimit-*` headers)
  - Discord: https://docs.discord.com/developers/topics/rate-limits ("All bots can make up to 50 requests per second";
    invalid requests 10,000 per 10 minutes; "rate limits should not be hard coded")
  - Slack: https://docs.slack.dev/reference/methods/chat.postMessage ("generally allow an app to post 1 message per
    second to a specific channel"; bursts allowed; workspace "several hundred messages per minute"; truncates above
    40,000 characters, recommends 4,000) and
    https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps (`conversations.history`
    1 request a minute for new non-Marketplace apps; checked 2026-11-12 in `research/keywords/per-network.md`, not
    re-fetched for this file)
  - YouTube: https://developers.google.com/youtube/v3/getting-started (100 `search.list` calls, 100 `videos.insert`
    calls and 10,000 units a day for everything else; an upload costs 1 unit) and
    https://developers.google.com/youtube/v3/revision_history (2 November 2026: uploads from unverified projects no
    longer restricted to private)
  - TikTok: https://developers.tiktok.com/doc/content-posting-api-reference-direct-post ("Each user access_token is
    limited to 6 requests per minute"; `spam_risk_too_many_posts`, `reached_active_user_cap`) and
    https://developers.tiktok.com/doc/content-sharing-guidelines ("typically around 15 posts per day/ creator account",
    shared across all apps; unaudited apps: 5 users in 24 hours, `SELF_ONLY`)
  - Pinterest: https://developers.pinterest.com/docs/reference/rate-limits/ (`org_write`, which covers creating Pins:
    Trial 300 calls a day per app, all requests 1,000 a day; Standard 100 calls a minute per user per app, all requests
    100 a second per user per app) and https://developers.pinterest.com/docs/key-concepts/access-tiers/
  - Google Business Profile: https://developers.google.com/my-business/content/prereqs (0 QPM until approved, 300 QPM
    after)
  - Reddit and Snapchat: **unverified**. Reddit's pages refused the fetcher on 2026-11-12 (`per-network.md` §1). No
    Snapchat rate-limit page was read.
- **Demand evidence** (from `docs/seo/keyword-map.md` C05, C82, C90, C105, C111 and `research/keywords/per-network.md`
  rows 2, 10, 11, 34, 62, 105, 111, measured 2026-11-12 by the keyword sweeps). **No new web search ran for this
  file:** the shared search budget for this turn was already used up. Every network page above was fetched directly.

Labels in editor notes: **[code]** this checkout, **[sourced]** the network's own page with URL, **[measured]** seen by
me on 2026-11-12, **[inferred]** judgement, **[doc]** Siar's own records.

---

## Meta

| Field | Value |
|---|---|
| URL | `https://siaran.my/platforms/limits` |
| Meta title (54 chars) | `Social media API rate limits by platform (2026) \| Siar` |
| Meta description (149 chars) | `Posting and rate limits for Instagram, Threads, LinkedIn, X, Bluesky, Mastodon and more, each from the network's own page, next to Siar's daily caps.` |
| H1 | Social media API rate limits and posting limits, by network |
| Visible date line (under the H1) | Updated 12 November 2026. Each network's figure links its own page and shows the day it was checked. |
| Canonical | `https://siaran.my/platforms/limits` |
| Breadcrumb | Home › Networks › Limits |

Editor note: "| Siar" is allowed because the title already carries "social media API" (strike plan §5.0 rule 6; same
call as `/platforms`). "(2026)" stays only while every `checked` date is in 2026; the build should render the year
from the newest checked date.

---

## Hero

**H1:** Social media API rate limits and posting limits, by network

**Intro (the answer, 60 words):**

> Each network sets its own posting limits. Meta's page gives Instagram 100 API posts per account per 24 hours (and,
> in another section, 50); Threads 250 posts and 1,000 replies; LinkedIn 150 requests per member per day; Mastodon
> 300 requests per 5 minutes; Bluesky 11,666 records a day. Siar, a unified social media API, lists every one with
> its source.

**Second line (smaller, under the intro):**

> Below them sit Siar's own daily caps per account and plan, the text and media limits Siar checks before it sends
> anything, and the rate limits on Siar's API. Every Siar number is generated from the code that enforces it.

**Primary CTA:** Get an API key
**Secondary CTA:** Read the quickstart (links `/docs/quickstart`)

Under the buttons, one plain line: "20 free posts to try, once. No card."

**Jump links (plain text links in one line, not chips):** Instagram · Facebook · Threads · X · LinkedIn · Bluesky ·
Mastodon · Discord · Slack · YouTube · TikTok · Pinterest · Reddit · Snapchat · Google Business Profile · Siar's API
limits

Editor notes:
- The intro is the network figures first because that is what the query asks. Siar is named with its category inside
  the first 60 words (strike plan §5.0 rule 1).
- Do not shorten the Instagram line to "100". Meta's own page states both numbers; the page quotes both (section 4).
- Jump links are ordinary text links separated by middle dots. No pills, no arrows (messaging §8).

---

## Section 1: the network's own limits, in one table

**H2:** Each network's published limits (checked 12 November 2026)

**Intro (2 sentences):**

> These are the networks' rules, not Siar's. Each figure is quoted from the network's own developer page, linked in
> the last column with the day it was read.

**Table.** One row per network. Columns: Network · Status · What the network limits · Window · Source

| Network | Status | What the network limits | Window | Source (checked 2026-11-12) |
|---|---|---|---|---|
| Instagram | Open | 100 API-published posts per account. The same page also says 50 published posts. A carousel counts as one post | 24-hour moving period | [Meta: Instagram content publishing](https://developers.facebook.com/docs/instagram-platform/content-publishing) |
| Facebook | Open | No fixed number of Page posts is published. API calls with a Page token: 4,800 × the Page's engaged users | 24 hours | [Meta: Graph API rate limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting) |
| Threads | Open | 250 API-published posts, 1,000 replies, 100 deletions, 500 location searches per profile. A carousel counts as one post | 24-hour moving period | [Meta: Threads API overview](https://developers.facebook.com/docs/threads/overview) |
| X | Open | Create a post: 100 per user per 15 minutes, 10,000 per app per 24 hours. Delete: 50 per user per 15 minutes. Every call is also billed | 15 minutes; 24 hours | [X: rate limits](https://docs.x.com/x-api/fundamentals/rate-limits) |
| LinkedIn (profiles) | Open | 150 requests per member, 100,000 per app | Per day, UTC | [LinkedIn: Share on LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin) |
| Bluesky | Open | 5,000 points an hour and 35,000 a day per account; a new record costs 3, so at most 1,666 records an hour and 11,666 a day | 1 hour; 1 day | [Bluesky: rate limits](https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/rate-limits.md) |
| Mastodon | Open | 300 requests per account (and per IP); media uploads 30; status deletes 30 | 5 minutes; 30 minutes | [Mastodon: rate limits](https://docs.joinmastodon.org/api/rate-limits/) |
| Discord | Open | 50 requests a second per bot; 10,000 invalid requests before a block. Per-route limits come back in headers | 1 second; 10 minutes | [Discord: rate limits](https://docs.discord.com/developers/topics/rate-limits) |
| Slack | Open | About 1 message a second per channel, with bursts; several hundred a minute per workspace | 1 second; 1 minute | [Slack: chat.postMessage](https://docs.slack.dev/reference/methods/chat.postMessage) |
| YouTube | Not confirmed | 100 uploads (`videos.insert`) per project, separate from the 10,000 units for other calls | Per day | [Google: YouTube Data API, getting started](https://developers.google.com/youtube/v3/getting-started) |
| TikTok | Opening after approval | 6 requests a minute per user token; a daily post cap per creator, "typically around 15", shared across all apps | 1 minute; 1 day | [TikTok: Direct Post reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post), [TikTok: content sharing guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines) |
| Pinterest | Opening after approval | Creating Pins (`org_write`): 300 calls a day per app on Trial access; 100 a minute per user per app on Standard | 1 day; 1 minute | [Pinterest: rate limits](https://developers.pinterest.com/docs/reference/rate-limits/) |
| Reddit | Not open | Unverified: Reddit's pages could not be read on 12 November 2026 | — | — |
| Snapchat | Not open | Unverified | — | — |
| Google Business Profile | Not open | 300 queries a minute once Google approves the project; 0 before | 1 minute | [Google: Business Profile API prerequisites](https://developers.google.com/my-business/content/prereqs) |

**Under the table (small type):**

> Networks change these numbers without notice, and Pinterest and Discord say so on the pages above. When one
> changes, this row changes and the change is logged on [network changes](/network-changes). Network names are
> trademarks of their owners. Siar is not affiliated with or endorsed by any of them.

**Phone layout:** each row becomes a block: network name and status on one line, then the limit, the window and the
source as short lines. No horizontal scroll.

Editor notes:
- Status labels are the four values used on `/platforms` (Open, Not confirmed, Opening after approval, Not open), from
  the one status constant.
- Drop the `/network-changes` link until that page ships (W1); keep the sentence without the link.
- Every row's source is the network's own page; no competitor is named on this page, so messaging §11 does not apply.
- Re-fetch every source within 7 days of publishing and every 30 days after (strike plan §5.0 rule 3).

---

## Section 2: Siar's daily caps, by plan

**H2:** Siar's daily posting caps per account, by plan

**Body:**

> On top of each network's rules, Siar caps how many posts and comments one connected account can send in a UTC day.
> Networks throttle or flag accounts that publish too often, and the caps keep each account inside what its network
> tolerates. Starter shares Pro's caps.

**Table (generated):** Posts and comments per connected account, per UTC day

| Network | Posts: Free | Posts: Starter and Pro | Posts: Business | Comments: Free | Comments: Starter and Pro | Comments: Business |
|---|---|---|---|---|---|---|
| Instagram | 10 | 50 | 100 | 3 | 50 | 100 |
| Facebook | 10 | 50 | 100 | 3 | 50 | 100 |
| Threads | 10 | 200 | 250 | 3 | 200 | 250 |
| X | 5 | 15 | 15 | 3 | 15 | 15 |
| LinkedIn | 10 | 18 | 24 | 3 | 18 | 24 |
| Bluesky | 10 | 50 | 100 | 3 | 50 | 100 |
| Mastodon | 10 | 50 | 100 | 3 | 50 | 100 |
| Discord | 10 | 100 | 200 | 3 | 100 | 200 |
| Slack | 10 | 100 | 200 | 3 | 100 | 200 |
| YouTube | 10 | 10 | 15 | 3 | 10 | 15 |
| TikTok | 5 | 10 | 15 | — | — | — |
| Pinterest | 10 | 24 | 36 | — | — | — |
| Reddit | 10 | 24 | 36 | 3 | 24 | 36 |
| Snapchat | 5 | 20 | 40 | — | — | — |
| Google Business Profile | 10 | 20 | 40 | — | — | — |

**How the caps count (short list under the table):**

> - **Per account, not per organization.** Each connected account has its own count.
> - **Caps follow the network identity.** Siar counts by the network's own account id. Disconnecting and reconnecting,
>   or adding the account to another brand, does not reset its daily cap.
> - **Counted on the day the post is due.** A post counts when it leaves draft, against the UTC day of its
>   `postDate`. Move it to another day and the count moves with it. Drafts don't count.
> - **Refused at create time.** The 51st Instagram post you schedule for one day on Pro is refused when you create it,
>   with a `403` that names the network, the day and the cap, not at the time it was due to go out.
> - **Enterprise** uses the Business caps unless agreed otherwise, and can have them raised.

**Example response (label it "Example"):**

```json
{
  "statusCode": 403,
  "message": "Instagram post daily limit reached for this account on 2026-11-13 (UTC). Limit is 50 per day."
}
```

**Check an account's count before you schedule:**

```bash
curl "https://api.siaran.my/api/v1/organization/usage/daily-limits?socialAccountId=<id>&date=2026-11-13" \
  -H "x-api-key: $SIAR_API_KEY"
```

```json
{
  "date": "2026-11-13",
  "socialAccountId": "<id>",
  "type": "INSTAGRAM",
  "posts": { "used": 48, "limit": 50, "remaining": 2 },
  "comments": { "used": 0, "limit": 50, "remaining": 50 }
}
```

> Daily caps are separate from your plan's monthly posts: 20 free posts to try (once), then 300 a month on Starter,
> 10,000 on Pro and 100,000 on Business. A post sent to every connected network counts as one monthly post, and one
> daily post on each account it goes to. See [pricing](/pricing) for the rest.

Editor notes:
- Columns come from `CAP_COLUMNS`; labels "Free", "Starter and Pro", "Business" are generated, not typed.
- **TikTok, Pinterest, Snapchat and Google Business Profile comment cells render "—".** The cap exists in
  `COMMENT_CAPS`, but comments are not available through Siar on those networks (`COMMENT_LENGTH` has no entry, so
  `content-comments.ts` line 130 refuses them). For TikTok this is also a truth rule: "Do not mention TikTok comments
  at all" (siar-truth §2). The generator should render "—" whenever `COMMENT_LENGTH[type]` is absent. Note that the
  `/tiktok-api` page still says "Comments and replies: Yes" (siar-truth §6 item 17); fix both together.
- The response values in the usage example are illustrative and labelled "Example". The endpoint, query names and
  response keys are real [code: `teams.ts` lines 115-124].
- "Refused at create time" is true for posts created with `status: SCHEDULED` or moved out of draft
  [code: `posts.ts` lines 90-97, 185-193].
- The caps' reason is the pricing page's own FAQ wording ("Networks throttle or flag accounts that publish too often").
  Do not add a claim that caps "prevent bans".

---

## Section 3: text and media limits Siar checks before sending

**H2:** Text and media limits per network, checked when you create the post

**Body:**

> Siar checks every post against these limits when you create it. A post that breaks one fails with a `400` and an
> `issues` array that points at the field, so you fix it before it is due, not after a network refuses it.

**Table (generated):** Text and media limits per post

| Network | Text | Comment or first comment | Media per post | Images | Video |
|---|---|---|---|---|---|
| Instagram | 2,200 | 2,200 | 10 | JPEG, up to 8 MB | MP4 or MOV, up to 300 MB, 3 s to 15 min |
| Facebook | 63,206 | 8,000 | 10 | JPEG, PNG, GIF, BMP, TIFF, WebP, up to 10 MB | MP4 or MOV, up to 1 GB, up to 20 min |
| Threads | 500 | 500 | 20 | JPEG or PNG, up to 8 MB | MP4 or MOV, up to 1 GB, up to 5 min |
| X | 280, or 25,000 on X Premium accounts | 25,000 | 4 | JPEG, PNG, WebP, GIF, up to 15 MB | MP4 or MOV, up to 8 GB, 0.5 s to 20 min |
| LinkedIn | 3,000 | 1,250 | 20 images | JPEG, PNG, GIF, up to 20 MB | MP4, up to 500 MB, 3 s to 30 min; documents up to 100 MB |
| Bluesky | 300 (and 3,000 bytes) | 300 | 4 | JPEG, PNG, WebP, GIF, up to 1 MB | MP4, MPEG, WebM, MOV, up to 100 MB, up to 3 min |
| Mastodon | 500 (the server default) | 500 | 4 | JPEG, PNG, GIF, WebP, AVIF, HEIC, up to 16 MB | MP4, WebM, MOV, up to 99 MB, up to 2 h |
| Discord | 2,000 | 2,000 | 10 files | Up to 10 MB each | Up to 10 MB each |
| Slack | 40,000 | 30,000 | 10 files | Up to 1 GB each | Up to 1 GB each |
| YouTube | Title 100 | 10,000 | 1 video | — | MP4, MOV, WebM, AVI, MKV, MPEG, 3GP, up to 256 GB, up to 12 h |
| TikTok | 2,200 | — | 35 photos or 1 video | JPEG or WebP, up to 20 MB | MP4, WebM, MOV, up to 4 GB, 3 s to 10 min |
| Pinterest | Title 100 | — | 5 images | JPEG, PNG, GIF, WebP, BMP, TIFF, up to 20 MB | MP4, MOV, M4V, up to 2 GB, 4 s to 15 min |
| Reddit | Title 300, body 40,000 | 10,000 | 1 | JPEG, PNG, GIF, up to 20 MB | MP4 or MOV, up to 1 GB, 1 s to 15 min |
| Snapchat | Title 45, Spotlight description 160 | — | 10 | JPEG or PNG | MP4, up to 1 GB, 5 s to 60 s |
| Google Business Profile | 1,500 | — | 1 photo | JPEG or PNG, up to 5 MB, at least 400 px wide | — |

**Under the table (small type):**

> Text limits are in characters. X counts weighted characters; Threads counts emoji by their UTF-8 length; Bluesky
> also caps the post at 3,000 bytes. Mastodon servers can raise the 500-character default, but Siar checks against the
> default. Discord's 10 MB is the floor for every server; boosted servers allow more.

Editor notes:
- Every cell is rendered from `adapter.limits` (`textMax`, `titleMax`, `media.maxItems`, `media.image`,
  `media.video`, `media.document`) with `mb()` and `seconds()` from `lib/networks.ts`, and the comment column from
  `COMMENT_LENGTH`. Mime types render as short names (image/jpeg → JPEG).
- **Mismatches the generator will expose; fix in code before W2, not on the page:**
  1. Comment length: `COMMENT_LENGTH` (enforced) vs `adapter.limits.commentMax` (shown on the network pages):
     TikTok 1,200 vs 150, Slack 30,000 vs 40,000, X 25,000 vs 280. The network pages and this page must use the same
     value. This page uses `COMMENT_LENGTH` because that is what the API checks.
  2. X video "up to 8 GB" and Bluesky video "up to 100 MB" come from the adapters. Neither was re-checked against X's
     or Bluesky's media docs for this file; Bluesky's rate-limit page gives a 50 MB blob limit, which may not apply
     to video uploads. Owner or engineer check before publishing [inferred risk].
  3. Snapchat image rules are marked "UNCONFIRMED" in the adapter comment (`snapchat.ts`). Render "JPEG or PNG"
     without a size, or "—".
- The X text cell is true to the code: Siar reads the account's subscription and checks 280 or 25,000
  (`twitter.ts` lines 214-217); long text can be split into a thread with `tweetStorm`.
- The Threads emoji rule is how Siar counts (`threads.ts` comment, `threadsLength`), not a quote from Meta.

---

## Section 4: limits by network

**H2:** Limits by network, with the network's own words

> One block per network. Each gives the status, the network's published limit with its source, Siar's daily caps and
> what the two mean together. Network pages link straight to their block.

Each block is an H3 with the anchor shown. Status lines are word for word from messaging §9.

### Instagram {#instagram}

**Instagram professional accounts: open today (Facebook Login or Instagram Login).**

> **Instagram's limit.** Meta's content publishing page says, under "Rate Limit": "Instagram accounts are limited to
> 100 API-published posts within a 24-hour moving period." Under the carousel section's "Limitations", the same page
> says: "Accounts are limited to 50 published posts within a 24-hour period." Both say a carousel counts as one post.
> Meta doesn't explain the difference.
> ([Meta](https://developers.facebook.com/docs/instagram-platform/content-publishing), checked 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 50 on Starter and Pro, 100 on Business, per account per UTC day. Pro sits
> at Meta's lower figure and Business at the higher one. If Instagram still refuses a post, you get Instagram's own
> code and message on the post, plus a plain-English fix.
>
> **Checked before sending.** Captions up to 2,200 characters, up to 10 items, JPEG images up to 8 MB, video from
> 3 seconds to 15 minutes.

Links: [Instagram API reference](/instagram-api) · [Instagram API error codes](/instagram-api/errors)

### Facebook {#facebook}

**Facebook Pages: open today.**

> **Facebook's limit.** Meta publishes no fixed number of Page posts per day. Calls made with a Page token are capped
> at "4800 * Number of Engaged Users" within 24 hours, so a quiet Page has less room than a busy one. Usage comes back
> in the `X-Business-Use-Case-Usage` header.
> ([Meta](https://developers.facebook.com/docs/graph-api/overview/rate-limiting), checked 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 50 on Starter and Pro, 100 on Business, per Page per UTC day.
>
> **Checked before sending.** Up to 63,206 characters, 10 media items, images up to 10 MB, video up to 1 GB and
> 20 minutes.

Links: [Facebook API reference](/facebook-api) · [Facebook API error codes](/facebook-api/errors)

### Threads {#threads}

**Threads: open today.**

> **Threads' limits.** "Threads profiles are limited to 250 API-published posts within a 24-hour moving period."
> The same section allows 1,000 replies, 100 deletions and 500 location searches in the same window, and a carousel
> counts as one post. ([Meta](https://developers.facebook.com/docs/threads/overview), checked 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 200 on Starter and Pro, 250 on Business. Replies: 3, 200 and 250. The
> Business post cap equals Meta's 250.
>
> **Checked before sending.** 500 characters, up to 20 carousel items, images up to 8 MB, video up to 5 minutes.

Links: [Threads API reference](/threads-api) · [Threads API error codes](/threads-api/errors)

### X {#x}

**X: open today, billed from a prepaid credit at X's own USD prices.**

> **X's limits.** Creating a post: 100 per user every 15 minutes and 10,000 per app every 24 hours. Deleting: 50 per
> user every 15 minutes. X adds: "You can be within rate limits but still incur usage costs."
> ([X](https://docs.x.com/x-api/fundamentals/rate-limits), checked 12 November 2026)
>
> **Siar's daily caps.** 5 posts on Free, 15 on Starter, Pro and Business. Replies: 3, 15 and 15. These are well
> under X's rate limit because X bills every post and flags accounts that post in bursts.
>
> **Checked before sending.** 280 characters, or 25,000 on X Premium accounts (Siar reads the account's
> subscription). Longer text can be split into a thread. Up to 4 images, or a video up to 20 minutes.

Links: [X API reference](/x-api) · [X API error codes](/x-api/errors)

Editor note: "flags accounts that post in bursts" is the pricing FAQ's general reason applied to X [inferred]. If the
owner prefers no network-specific reason, cut the second sentence of the caps paragraph after "X bills every post".

### LinkedIn {#linkedin}

**LinkedIn: personal profiles today; company pages open after LinkedIn grants page access.**

> **LinkedIn's limits.** Share on LinkedIn allows 150 requests per member and 100,000 per application, per UTC day.
> These are requests, not posts: an image or video post takes three steps on the same page (register the upload,
> upload the file, create the post).
> ([LinkedIn](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/share-on-linkedin),
> checked 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 18 on Starter and Pro, 24 on Business, per profile per UTC day.
>
> **Checked before sending.** 3,000 characters, comments up to 1,250, up to 20 images, video from 3 seconds to
> 30 minutes, documents up to 100 MB.

Links: [LinkedIn API reference](/linkedin-api) · [LinkedIn API error codes](/linkedin-api/errors)

Editor note: "three steps" is read from the image-share walkthrough on LinkedIn's page; "so a media post uses several
of the 150" is the inference, left implicit in the copy.

### Bluesky {#bluesky}

**Bluesky: open today.**

> **Bluesky's limits.** Each account gets 5,000 points an hour and 35,000 a day. Creating a record costs 3 points, so
> "an account may create at most 1,666 records per hour and 11,666 records per day." Logins (`createSession`) are
> limited to 30 per 5 minutes and 300 per day per account, and all requests to 3,000 per 5 minutes per IP.
> ([Bluesky](https://github.com/bluesky-social/bsky-docs/blob/main/docs/advanced-guides/rate-limits.md), checked
> 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 50 on Starter and Pro, 100 on Business.
>
> **Checked before sending.** 300 characters and 3,000 bytes, up to 4 images of 1 MB each, video up to 3 minutes.

Links: [Bluesky API reference](/bluesky-api) · [Bluesky API error codes](/bluesky-api/errors)

### Mastodon {#mastodon}

**Mastodon: open today, on any server.**

> **Mastodon's limits.** "All endpoints and methods can be called 300 times within 5 minutes," per account and per IP.
> Media uploads are limited to 30 in 30 minutes, and status deletes to 30 in 30 minutes. Servers report the state in
> `X-RateLimit-Limit`, `X-RateLimit-Remaining` and `X-RateLimit-Reset`.
> ([Mastodon](https://docs.joinmastodon.org/api/rate-limits/), checked 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 50 on Starter and Pro, 100 on Business.
>
> **Checked before sending.** 500 characters (the server default), up to 4 media files, images up to 16 MB, video up
> to 99 MB. Each image or video is one upload, so four-image posts reach the 30-upload window sooner.

Links: [Mastodon API reference](/mastodon-api)

Editor note: these are the defaults of Mastodon's own software; a server's admin can change them [sourced: the page
describes defaults]. "Each image is one upload" follows from `POST /api/v1/media` taking one file [inferred]. Link
`/mastodon-api/errors` only after it is filled or noindexed (strike plan §5.4).

### Discord {#discord}

**Discord: open today, posting as a bot with a name and avatar per brand.**

> **Discord's limits.** "All bots can make up to 50 requests per second." 10,000 invalid requests (401, 403 or 429)
> in 10 minutes lead to a temporary block. Per-route limits are returned in response headers, and Discord says they
> "should not be hard coded". ([Discord](https://docs.discord.com/developers/topics/rate-limits), checked
> 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 100 on Starter and Pro, 200 on Business, per server.
>
> **Checked before sending.** 2,000 characters, up to 10 files of 10 MB each (more on boosted servers).

Links: [Discord API reference](/discord-api) · [Discord API error codes](/discord-api/errors)

### Slack {#slack}

**Slack: open today. Importing replies is slow, because Slack limits apps outside its Marketplace.**

> **Slack's limits.** `chat.postMessage` "will generally allow an app to post 1 message per second to a specific
> channel", with bursts allowed and several hundred messages a minute per workspace. Slack truncates text above
> 40,000 characters and recommends 4,000.
> ([Slack](https://docs.slack.dev/reference/methods/chat.postMessage), checked 12 November 2026). Since
> 29 May 2025, new apps outside the Slack Marketplace can read message history once a minute
> ([Slack changelog](https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps),
> checked 12 November 2026). That is why reply import is slow.
>
> **Siar's daily caps.** 10 posts on Free, 100 on Starter and Pro, 200 on Business, per workspace.
>
> **Checked before sending.** 40,000 characters, up to 10 files of up to 1 GB each.

Links: [Slack API reference](/slack-api) · [Slack API rate limits for non-Marketplace apps](/slack-api/rate-limits)

Editor note: link `/slack-api/rate-limits` only once it is live (W1); until then link `/slack-api/errors` with the
anchor "Slack API error codes".

### YouTube {#youtube}

**YouTube: connect and upload now; public uploads not yet confirmed.**

> **YouTube's limits.** A project gets "100 `videos.insert` calls, and 10,000 units per day combined for all other
> endpoints", plus 100 `search.list` calls. An upload costs 1 unit. On 2 November 2026 Google stopped restricting
> uploads from unverified projects to private.
> ([Google](https://developers.google.com/youtube/v3/getting-started), [revision history](https://developers.google.com/youtube/v3/revision_history),
> checked 12 November 2026)
>
> **Siar's daily caps.** 10 uploads on Free, 10 on Starter and Pro, 15 on Business, per channel.
>
> **Checked before sending.** One video per post, title up to 100 characters, up to 256 GB and 12 hours.

Links: [YouTube API reference](/youtube-api) · [YouTube API quota](/youtube-api/quota)

Editor note: link `/youtube-api/quota` only once it is live (W1); otherwise `/youtube-api/errors`.

### TikTok {#tiktok}

**TikTok: built, opening after TikTok approves Siar.**

> **TikTok's limits.** "Each user access_token is limited to 6 requests per minute." Each creator also has a daily
> post cap, "typically around 15 posts per day", shared across every app that posts for them. Until an app passes
> TikTok's audit, at most 5 users can post through it in 24 hours, and only privately.
> ([TikTok Direct Post](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post),
> [content sharing guidelines](https://developers.tiktok.com/doc/content-sharing-guidelines), checked 12 November 2026)
>
> **Siar's daily caps, for when TikTok opens.** 5 posts on Free, 10 on Starter and Pro, 15 on Business. Business
> matches TikTok's usual creator cap.
>
> **What Siar checks.** Captions up to 2,200 characters, up to 35 photos, video from 3 seconds to 10 minutes.

Links: [TikTok API reference](/tiktok-api)

Editor note: no TikTok comment figure anywhere in this block (siar-truth §2). No "post to TikTok" anchor (strike plan
§6 rule 11).

### Pinterest {#pinterest}

**Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access.**

> **Pinterest's limits.** Creating Pins falls under `org_write`: 300 calls a day per app on Trial access, and 100 a
> minute per user per app on Standard access. Pinterest notes the limits can change without notice.
> ([Pinterest](https://developers.pinterest.com/docs/reference/rate-limits/), checked 12 November 2026)
>
> **Siar's daily caps, for when publishing opens.** 10 Pins on Free, 24 on Starter and Pro, 36 on Business.
>
> **What Siar checks.** Title up to 100 characters, up to 5 images of 20 MB, video from 4 seconds to 15 minutes.

Links: [Pinterest API reference](/pinterest-api)

### Reddit {#reddit}

**Reddit: built, not open yet.**

> **Reddit's limits.** Unverified. Reddit's developer pages could not be read on 12 November 2026, so this page
> quotes no figure.
>
> **Siar's daily caps.** 10 posts on Free, 24 on Starter and Pro, 36 on Business. Titles up to 300 characters,
> bodies up to 40,000.

Links: [Reddit API reference](/reddit-api)

### Snapchat {#snapchat}

**Snapchat: built, not open yet.**

> **Snapchat's limits.** Unverified. Siar has not read a Snapchat page that states a posting rate.
>
> **Siar's daily caps.** 5 posts on Free, 20 on Starter and Pro, 40 on Business. Video in MP4, 5 to 60 seconds.

Links: [Snapchat API reference](/snapchat-api)

### Google Business Profile {#google-business-profile}

**Google Business Profile: built, not open yet.**

> **Google's limit.** A project's quota is 0 queries a minute until Google approves it, and 300 a minute after.
> ([Google](https://developers.google.com/my-business/content/prereqs), checked 12 November 2026)
>
> **Siar's daily caps.** 10 posts on Free, 20 on Starter and Pro, 40 on Business. Summaries up to 1,500 characters,
> one photo.

Links: [Google Business Profile API reference](/google-business-profile-api)

---

## Section 5: limits that apply to Siar's apps as a whole

**H2:** Limits counted per app, not per account

> Your customers connect through Siar's own network apps, so Siar never asks you for your own. The flip side: where a
> network counts per app or per project, the count covers every Siar customer on that network.
>
> - LinkedIn: 100,000 requests per app per UTC day.
> - X: 10,000 new posts per app per 24 hours.
> - YouTube: 100 uploads per project per day.
> - Pinterest on Trial access: 300 Pin writes per app per day (Pinterest publishing is not open yet).
>
> Siar's daily caps per account keep any one customer from using a large share. If a network refuses a post because
> an app-wide limit is reached, the post keeps the network's own error and message, and you can retry it later
> without using another post from your plan.

Editor notes:
- **Owner check before publishing (Fakhrul).** This section is true by construction [inferred: one Siar app per
  network, `docs/approvals/*.md`; the per-app figures are sourced above], and it answers a pain buyers name ("One busy
  account can exhaust limits for all others", Postiz issue #1016, `research/market/buyers-pains.md`). It is also the
  first place the site says it. YouTube's 100 uploads a day per project is the tightest; Siar's quota extension was
  submitted on 2026-10-15 with no answer yet [doc]. Options: (a) publish as written; (b) drop the YouTube bullet until
  the quota answer; (c) cut the section. My recommendation is (a): it is the honest version of pillar 2, and buyers
  who hit it later will check this page.
- "Retry later without using another post": retries of a failed post do not count again, up to 6
  (`RESOURCE_LIMITS.maxRetries`) [code]. Daily-cap behaviour on retry was not traced; the sentence says only "another
  post from your plan" (the monthly quota), which is the documented rule.

---

## Section 6: Siar's own API rate limits

**H2:** Siar API rate limits: 100 a second, 500 per 10 seconds, 2,000 a minute

> Every request to Siar's API must pass three windows at once. A verified API key gets its own bucket for each
> endpoint, so a burst of list calls does not slow your post creation.

| Window | Requests per API key, per endpoint |
|---|---|
| 1 second | 100 |
| 10 seconds | 500 |
| 1 minute | 2,000 |

> Responses carry `x-ratelimit-limit` and `x-ratelimit-remaining`. A request over a limit gets `429` with a
> `retry-after` header in seconds and the same number in the body. Dashboard sessions share one bucket for the whole
> app. Enterprise organizations can have these limits multiplied.

**Example response (label it "Example"):**

```json
{ "statusCode": 429, "message": "Too many requests. Back off and retry.", "retryAfter": 1 }
```

> These limits protect the API. For publishing, the limits that matter are the daily caps above and your plan's
> monthly posts. Backoff code and the SDK's retry rules are in the [rate limits docs](/docs/rate-limits).

Editor notes:
- Numbers render from `WINDOWS` in `ratelimit.ts`; the per-key-and-endpoint bucket, the headers, `retryAfter` in the
  body and the Enterprise multiplier are all in `routes.ts` lines 114-119 and `errors.ts` [code].
- Do not mention what happens when the limiter's store is unavailable (internal behaviour).
- Do not print SDK install commands (not on npm, siar-truth §2).

---

## Section 7: how Siar handles limits (the three-line box)

**H3 (box):** How Siar handles this

> - Checked before it's sent: text, media and daily caps are checked when you create the post ([how it's checked](/how-publishing-works#checked)).
> - If a network still says no, you get its own code and message, plus the fix ([what happens on errors](/how-publishing-works#errors)).
> - A signed webhook tells you each network's result, retried for about 45 hours ([webhooks](/how-publishing-works#webhooks)).

Editor note: strike plan §6 rule 2 (mechanism anchors, at most 3 lines). The anchor text is the mechanism, not
"learn more".

---

## Section 8: objections

**H2:** Questions developers ask before they rely on these numbers

> **"Instagram allows 100 a day. Why does Pro stop me at 50?"**
> Meta's own page states both 100 and 50 for the same 24 hours. Pro uses the lower number, so a schedule that fits on
> Pro fits under either. Business allows 100. If you need more on one account, Enterprise caps are set per
> organization.
>
> **"X allows 100 posts every 15 minutes. Fifteen a day is low."**
> It is, on purpose. X charges for every post, and accounts that post in bursts get flagged. For more, Enterprise caps
> are set per organization; X's own per-app limit of 10,000 a day still applies.
>
> **"Will another Siar customer use up my limits?"**
> Not Siar's: API rate limits are per key and endpoint, and daily caps are per account. Some networks count per app
> (LinkedIn, X, YouTube), and that count covers all Siar customers. The per-account caps keep any one customer from
> taking a large share.
>
> **"Can I reset a cap by reconnecting the account?"**
> No. Caps follow the network's own account id, so reconnecting it, or adding it to another brand, keeps the same
> count for that day.
>
> **"How current are these numbers?"**
> Each network figure shows the day it was read from the network's page. Siar re-reads them at least every 30 days.
> Siar's own numbers are generated from the code on every release, so they can't drift from what the API enforces.

Editor notes:
- "accounts that post in bursts get flagged" generalises the pricing FAQ line to X [inferred]; see the X block note.
- "re-reads at least every 30 days" is a promise only if the 30-day build warning ships with the data file. If it
  doesn't, change to "Each network figure shows the day it was read."
- No competitor objection is answered here: this page names no rival (see "Comparison table" below).

---

## Section 9: closing CTA

**H2:** Write it once. Siar it everywhere.

> One request publishes to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack,
> checked against every limit on this page before it goes. You pay one price for your organization, not for each
> account: 20 free posts to try, then from $19 a month (RM39 in Malaysia). Your price never goes up while you stay
> subscribed.

**Primary CTA:** Get an API key
**Secondary CTA:** See pricing (links `/pricing`)

Editor note: the price line is messaging §2 level 3; "$19 a month (RM39 in Malaysia)" is the global form. The brand
line is the one heading allowed in title case style (messaging §6 rule 9).

---

## FAQ

**H2:** Social media API limits: frequently asked questions

Each answer is answer-first, 40-60 words. All of them are visible on the page, so FAQPage schema may use them.

**What is the Instagram API posting limit per day?**
Meta's content publishing page says Instagram accounts can publish 100 posts through the API in a 24-hour moving
period. The same page, in its carousel section, says 50. A carousel counts as one post either way. Siar caps Instagram
at 50 posts a day per account on Starter and Pro, and 100 on Business. (54 words)

**What are the Threads API limits?**
Meta allows each Threads profile 250 API-published posts, 1,000 replies, 100 deletions and 500 location searches in a
24-hour moving period. A carousel counts as one post. Through Siar, a Threads account can send 200 posts and 200
replies a day on Starter and Pro, and 250 of each on Business. (51 words)

**What is the Bluesky API rate limit?**
Bluesky gives each account 5,000 points an hour and 35,000 a day. Creating a post costs 3 points, so an account can
create at most 1,666 records an hour and 11,666 a day. Logins are limited to 30 per 5 minutes. Siar caps Bluesky at
50 posts a day on Starter and Pro. (53 words)

**What is the Mastodon API rate limit?**
Mastodon's default is 300 requests per 5 minutes per account, and the same per IP address. Media uploads are limited
to 30 per 30 minutes, and deleting statuses to 30 per 30 minutes. A server's admin can change these defaults. Siar
caps Mastodon at 50 posts a day per account on Starter and Pro. (54 words)

**How many LinkedIn posts can an app publish per day?**
LinkedIn limits Share on LinkedIn to 150 requests per member and 100,000 per app each UTC day. Those are requests, not
posts: an image or video post takes three steps, so it uses more than one. Siar caps LinkedIn profiles at 18 posts a
day on Starter and Pro, and 24 on Business. (53 words)

**What is the X API rate limit for creating posts?**
X allows 100 new posts per user every 15 minutes and 10,000 per app every 24 hours, and bills each post on top. Through
Siar, an X account can publish 15 posts a day on Starter, Pro and Business, billed from a prepaid credit at X's own
USD prices. (49 words)

**Why are Siar's daily caps lower than the networks' limits?**
Networks throttle or flag accounts that publish too often, and a network's published maximum is not a safe daily
target. Siar's caps keep each connected account inside what its network tolerates. They apply per account and UTC day,
Starter shares Pro's caps, and Enterprise organizations can have them raised. (49 words)

**Does reconnecting an account reset the daily cap?**
No. Siar counts daily caps by the network's own account id, not by the connection. Disconnecting and reconnecting an
account, or adding it to another brand in the same organization, keeps the same count for that UTC day. A post
counts against the day it is scheduled for. (48 words)

**What happens when I hit a limit?**
It depends on which one. A Siar daily cap refuses the post when you create it, with a 403 naming the network, day and
cap. Siar's API rate limit returns 429 with retry-after. A network's own limit is reported on the post with the
network's code and message, plus a fix. (51 words)

**What are Siar's API rate limits?**
Every request must pass three windows: 100 requests a second, 500 per 10 seconds and 2,000 a minute. Each API key gets
its own bucket per endpoint. Responses carry x-ratelimit-limit and x-ratelimit-remaining, and a 429 includes
retry-after in seconds. Enterprise organizations can have the limits multiplied. (46 words)

**Does a post to five networks count as five posts?**
Against your monthly quota, no: a post sent to every connected network counts as one post. Against daily caps, each
account it goes to counts one post for that day. Drafts count for neither, and retrying a failed post does not use
another monthly post. (45 words)

Editor notes:
- Word counts measured with a script on the final text (40-60 each).
- The Bluesky answer's "Logins" is `createSession`. The Mastodon "admin can change" line reflects that the page
  documents the software's defaults.
- "in the same organization" in the reconnect answer is narrower than the code (the key ignores organization). That is
  deliberate: do not suggest moving accounts between organizations to test it. The free allowance is also counted per
  social account across organizations (siar-truth §3b rule 1).

---

## Comparison table

None on this page, by design. The comparison here is each network's limit against Siar's cap (sections 1, 2 and 4).
Rivals are named only on `/compare/*`, the pricing explainers, `/malaysia`, the webhook table and
`/compare/failure-handling` (messaging §11). A rival limits page is not a reason to name one here.

For the record, from the keyword research (not for the page): pages from at least two API vendors already rank for
the Instagram-limit query, and one of them already explains Meta's 100-versus-50 conflict [measured once 2026-11-12,
`research/keywords/per-network.md` row 10]. What none of the measured pages does is put every network's figure next to
its source, the checked date and the caps the API itself enforces, generated from code [inferred from the measured
result list; not re-searched today, search budget spent].

---

## Internal links

**Out of this page (add in the copy above; descriptive anchors, one exact anchor per target):**

| Anchor text | Target | Where |
|---|---|---|
| Instagram API reference (and the same pattern per network) | `/<net>-api` | each block in section 4 |
| Instagram API error codes (same pattern) | `/<net>-api/errors` | each open-network block (Mastodon excepted until filled) |
| pricing | `/pricing` | section 2 closing paragraph, section 9 secondary CTA |
| rate limits docs | `/docs/rate-limits` | section 6 |
| how it's checked · what happens on errors · webhooks | `/how-publishing-works#checked`, `#errors`, `#webhooks` | section 7 box |
| network changes | `/network-changes` | section 1 note (after W1 ships) |
| Slack API rate limits for non-Marketplace apps | `/slack-api/rate-limits` | Slack block (after W1 ships) |
| YouTube API quota | `/youtube-api/quota` | YouTube block (after W1 ships) |
| Read the quickstart | `/docs/quickstart` | hero secondary CTA |
| Get an API key | sign-up URL | hero and section 9 primary CTA |

**Into this page (minimum 3 at launch, strike plan §6 rule 10):**

| From | Anchor text | Target |
|---|---|---|
| `/platforms` (under the status table) | social media API limits by network | `/platforms/limits` |
| Every network hub, its "Daily caps" H2 (`[api]/index.astro` line 83, replacing "See pricing for monthly quotas") | Instagram API limits (per network) | `/platforms/limits#instagram` (per network) |
| `/pricing`, "Per-network daily caps" section | daily caps and each network's own limits | `/platforms/limits` |
| `/docs/rate-limits`, "Not the same as network limits" section | each network's own rate limits | `/platforms/limits` |
| `/instagram-api/publishing-limit` (W2) | Instagram API limits next to every other network | `/platforms/limits#instagram` |
| `/threads-api` limits H2, `/linkedin-api/how-to-post` (W2), `/bluesky-api`, `/mastodon-api` limit sections | <Network> API rate limit | `/platforms/limits#<net>` |
| Footer | Limits | `/platforms/limits` |

Rules kept: no "post to TikTok" or other not-open "post to" anchor; network blocks for closed networks link only
their reference page; breadcrumbs Home › Networks › Limits.

---

## Schema notes

- **TechArticle** (or WebPage with `about`): `headline` = H1, `datePublished` and `dateModified` = the page's
  "Updated" date (ISO, 2026-11-12), `author` and `publisher` = the Organization entity already on the site
  (FF DEV STUDIO / Siar), `about` = "social media API rate limits".
- **Dataset** for the two generated tables (section 1 and section 2), because they are real, visible data:
  `name` "Social media API limits by network", `description` one sentence, `dateModified`, `creator` the Organization,
  `isBasedOn` = the list of network source URLs from section 1, `variableMeasured` = "posts per day", "requests per
  window". Add `distribution` only if a machine-readable twin ships (below).
- **BreadcrumbList**: Home › Networks (`/platforms`) › Limits (`/platforms/limits`).
- **FAQPage**: the 11 visible Q&As above, word for word.
- No AggregateRating, Review or Product offers on this page.
- **Twins for AI readers (recommended):** generate `/platforms/limits.md` (and optionally `/platforms/limits.json`)
  from the same data at build time, and list the `.md` in `llms.txt` under the networks section. Same numbers, same
  checked dates, no extra claims (strike plan §5.12, ".md twins").
- Every network figure in the HTML carries a visible "checked 12 November 2026" next to it; the JSON-LD
  `dateModified` must equal the visible "Updated" date (strike plan §5.0 rule 4).

---

## Why this wins

**Keywords it targets** (demand from the keyword sweeps, measured 2026-11-12; grades inferred):

| Keyword | Evidence | Where on the page |
|---|---|---|
| social media api rate limits by platform (primary) | C05, PN row 2: medium demand [inferred]; vendor limit posts rank for the Instagram-limit query [measured once] | Title, H1, intro, section 1 |
| posting limits per day api | PN row 2 | Section 2 H2, FAQ "Why are Siar's daily caps lower" |
| instagram api 100 posts per 24 hours / instagram api post limit | PN rows 10-11: autocomplete returns 10 completions for "instagram api post limit" [measured]; the ranking pages disagree (25 / 50 / 100) [unverified third-party] | Intro, `#instagram`, FAQ 1 |
| threads api limits / threads api rate limit | PN row 34: low demand, autocomplete 2-3 [measured]; grade "weeks" [inferred] | `#threads`, FAQ 2 |
| bluesky api rate limit | PN row 105: autocomplete child of "bluesky api" [measured] | `#bluesky`, FAQ 3 |
| mastodon api rate limit | PN row 111: low, grade "weeks" [inferred] | `#mastodon`, FAQ 4 |
| linkedin api rate limits | PN row 62 | `#linkedin`, FAQ 5 |
| twitter / x api rate limits | PN row 50: medium, long-term [inferred] | `#x`, FAQ 6 |
| slack chat.postmessage rate limit, discord api rate limits, youtube api upload limit, tiktok api rate limit | PN rows 76, 87, 115, 118 | Network blocks |

**AI prompts it is built to be cited for** (answer-first blocks with a number, a source and a date are what answer
engines lift [inferred]):

- "What are the API posting limits for Instagram, Threads and LinkedIn?"
- "How many posts per day can I publish to Instagram through the API?" (p-set: the Instagram limit cluster)
- "What is the Bluesky / Mastodon API rate limit?"
- "Which social media API tells me its rate limits per network?" / "What are Siar's rate limits?"
- "Instagram reel duration limits for API publishing" (prompt p043, answered by the text and media table)
- "TikTok video upload limits API" (prompt p044, reference only; TikTok shown as not open)

**Why it can win:**

1. **Every number has its source and date next to it**, quoted from the network's own page, including the two Instagram
   figures Meta itself prints. Most ranking pages give one number with no source [inferred from the measured result
   list].
2. **Siar's caps are generated from the code that enforces them**, so the page cannot drift from the API. That also
   fixes the problem that an AI answer misquoted Siar's limits (`research/current-site.md`, the Copilot pricing
   misquote).
3. **One page, 15 anchors.** Each hub links its block, so the page collects internal links from every network page
   without 15 thin limit pages (strike plan §5.12: "One page, not 15 thin ones").
4. **It says where the limits bite**, including the per-app counts that cover every Siar customer, which no vendor page
   in the measured results states about itself [inferred].
5. **It sells without overclaiming:** status lines are verbatim, closed networks are labelled, TikTok comments are not
   mentioned, and the only CTA claims are "20 free posts to try" and the price line.

**Before publishing (checklist):**

- [ ] Owner decision on section 5 (per-app limits), options (a)/(b)/(c).
- [ ] Fix the comment-length mismatch (`COMMENT_LENGTH` vs `commentMax`) so hubs and this page agree.
- [ ] Engineer check of X video 8 GB and Bluesky video 100 MB in the adapters against the networks' media docs.
- [ ] Ship `apps/site/src/data/network-limits.ts` with the 30-day `checked` warning, or soften the "re-reads every
      30 days" line.
- [ ] Re-fetch all network sources within 7 days of publishing; try Reddit and Snapchat again.
- [ ] Hold the `/network-changes`, `/slack-api/rate-limits` and `/youtube-api/quota` links until those pages are live.
