# /errors: final copy

Status: publish-ready copy for Wave 1 (strike plan §2 strike 2, §5.3 row `/errors`, keyword map C114). Written
2026-11-12. This is a NEW page; no `apps/site/src/pages/errors.astro` exists today. It sits above the 15 live
`/<net>-api/errors` pages (`apps/site/src/pages/[api]/errors.astro`) and does not replace them.

Sources for every Siar fact: `docs/seo/research/siar-truth.md` (checked 2026-11-12), `docs/seo/messaging.md` (§2
hierarchy, §6 voice, §8 furniture, §9 status lines, used word for word), and this checkout at docs commit 56c8716
(2026-11-12). The 147 codes, their messages and fixes are the adapters' `errorReference` lists
(`packages/networks/src/adapters/*.ts`, Meta's shared list in `meta-common.ts` `META_ERRORS`). Retry verdicts come from
each adapter's `mapError` and `packages/networks/src/lib/errors.ts`. Network facts in the quick answers were re-read
on the networks' own pages on 2026-11-12 (URLs inline).

Labels in the editor notes: **[code]** read in this checkout, **[sourced]** the network's own page with URL,
**[measured]** seen by me on 2026-11-12, **[third-party]** someone else's claim, **[inferred]** judgement.

Counts on this page are generated at build time, never typed: 147 codes, 14 networks with codes, 27 retryable, 120 not
retryable, 0 unknown [code, counted 2026-11-12 from the adapters; see the appendix].

---

## Meta

| Field | Value |
|---|---|
| URL | `https://siaran.my/errors` |
| Meta title (47 chars) | `Social media API error codes, by network \| Siar` |
| Meta description (154 chars) | `147 error codes from Facebook, Instagram, X, LinkedIn, TikTok and 9 more networks: each network's own message, a plain name, and whether a retry can work.` |
| H1 | Social media API error codes, by network |
| Visible date line (under the intro) | Updated 12 November 2026, from the error references in Siar's network code. |
| Canonical | `https://siaran.my/errors` (filter query strings canonicalise here) |
| Breadcrumb | Home › Error codes |

Editor notes:
- The title follows strike plan §5.3 exactly. It shares no wording with `/docs/errors` (live title "Errors \| Siar docs";
  that page is Siar's own error envelope) [measured, `current-site.md` row `/docs/errors`].
- "147", "14" and "9 more" in the description are generated from the adapter data. If a network gains or loses codes,
  the description changes with it.
- The date is `updatedAt('/errors')` (see build notes); the same value feeds the sitemap `lastmod` and `dateModified`.

---

## Hero

**H1:** Social media API error codes, by network

**Intro (the answer, 55 words):**

> Social media API error codes are what a network sends back when it refuses a request: Instagram's 2207042, X's 402
> CreditsDepleted, LinkedIn's 426. This page lists 147 of them from 14 networks, each with the network's own message, a
> plain name and a retry verdict. Filter by network, or by whether a retry can work.

**Second paragraph (smaller):**

> The list is generated from the error references in Siar, a unified social media API that relays these errors to its users,
> so it changes when the code does. These are the codes Siar has documented, not every code each network can return.
> Each row links to the full meaning and fix.

**Date line:** Updated 12 November 2026, from the error references in Siar's network code.

**CTAs:** none in the hero. The table must start in the first screen on a 1080p laptop, because people arrive with a
code to look up. The primary and secondary CTAs sit in the "How Siar handles a failed post" box and the closing
section:
- **Primary CTA:** Start with 20 free posts
- **Secondary CTA:** How Siar handles a failed post (links `/how-publishing-works#errors`)

Under the primary button, one plain line: "20 free posts to try, once. No card."

Editor note: no kicker, no side note, no count row above the table (messaging §8). The numbers live in the intro
sentence only.

---

## Section 1: the table

**H2:** Every code, by network

**Filter labels (two selects above the table, side by side; stacked on phones):**

- **Network:** "All networks" (default), then, in this order: Facebook, Instagram, Threads, X (Twitter), LinkedIn,
  Bluesky, Mastodon, Discord, Slack, YouTube, TikTok, Pinterest, Reddit, Snapchat, Google Business Profile.
  Each option shows its count in plain text, e.g. "Instagram (10)". Mastodon shows "Mastodon (no codes)".
- **Retry verdict:** "Any verdict" (default), "Retryable (27)", "Not retryable (120)", "Unknown (0)".

Order rationale: networks open today first, in the order of the status constant, then the ones that are not open
(messaging §9). The same order drives the table rows.

**Count line (under the filters, updates live, `aria-live="polite"`):**

> Showing 147 of 147 codes.

Filtered form: "Showing 10 of 147 codes: Instagram." / "Showing 27 of 147 codes: retryable." /
"Showing 3 of 147 codes: Instagram, retryable."

**Column headers:**

| Network | Code | Message from the network | Plain name | Retry verdict | Meaning and fix |
|---|---|---|---|---|---|

Cell rules:
- **Network:** the network name as on its hub ("X (Twitter)", "Google Business Profile").
- **Code:** the code exactly as the adapter records it, in code type (`402 CreditsDepleted`, `2207042`,
  `spam_risk_too_many_posts`).
- **Message from the network:** the adapter's `message`, verbatim. Shortened by the adapter where the network's text
  is long; never rewritten.
- **Plain name:** the new `name` field (appendix). Sentence case, no full stop.
- **Retry verdict:** plain text "Retryable", "Not retryable" or "Unknown". Not a coloured pill. The `data-verdict`
  attribute carries `retryable` / `non_retryable` / `unknown` for the filter.
- **Meaning and fix:** a link with the visible text "Meaning and fix" and the accessible name "Meaning and fix for
  {Network} {code}", to `/<net>-api/errors#code-<slug>`.

**Example rows (Example: the real rows are generated at build time from the adapters):**

| Network | Code | Message from the network | Plain name | Retry verdict | Meaning and fix |
|---|---|---|---|---|---|
| Facebook | `190` | Error validating access token: The session has been invalidated because the user changed their password or Facebook has changed the session for security reasons. | Access token expired or revoked | Not retryable | [Meaning and fix](/facebook-api/errors#code-190) |
| Instagram | `2207042` | You reached maximum number of posts that is allowed to be published by Content Publishing API. | 24-hour publishing limit reached | Retryable | [Meaning and fix](/instagram-api/errors#code-2207042) |
| X (Twitter) | `402 CreditsDepleted` | Your enrolled account does not have any credits to fulfill this request. | X API credit used up | Not retryable | [Meaning and fix](/x-api/errors#code-402-creditsdepleted) |
| X (Twitter) | `403 duplicate` | You are not allowed to create a Tweet with duplicate content. | Same text posted recently | Not retryable | [Meaning and fix](/x-api/errors#code-403-duplicate) |
| LinkedIn | `426 NONEXISTENT_VERSION` | Requested version 20230101 is not active | API version retired | Not retryable | [Meaning and fix](/linkedin-api/errors#code-426-nonexistent-version) |
| LinkedIn | `422 duplicate` | Content is a duplicate of urn:li:share:… | Same text posted recently | Not retryable | [Meaning and fix](/linkedin-api/errors#code-422-duplicate) |
| Bluesky | `ExpiredToken` | Token has expired | Session expired and could not refresh | Not retryable | [Meaning and fix](/bluesky-api/errors#code-expiredtoken) |
| TikTok | `spam_risk_too_many_posts` | The daily post cap for this creator was reached. | Creator daily post cap reached | Retryable | [Meaning and fix](/tiktok-api/errors#code-spam-risk-too-many-posts) |

**Note under the table (always visible, one paragraph):**

> Mastodon has no stable error codes: each server answers with an HTTP status and a short message, and Siar relays
> both. TikTok, Pinterest publishing, Reddit, Snapchat and Google Business Profile are built in Siar and not open yet;
> their codes are here so you can read an error from your own integration.

**Empty state when the network filter is Mastodon (replaces the rows, in the table area; text only, no card):**

> Mastodon doesn't use stable error codes. Each server sends an HTTP status and a short message, and Siar relays both
> on the post. Read the status: 401 means reconnect, 422 means the server refused the status, 429 means slow down,
> 5xx means try again later. [Mastodon API errors](/mastodon-api/errors)

**Empty state when the verdict filter is Unknown:**

> No listed code has the verdict unknown. Siar uses it at run time, when a send was interrupted and it can't tell
> whether the network published the post. Check the account before you retry.

**Empty state for any other combination with no rows:**

> No codes match both filters. [Show every code](/errors)

**Without JavaScript:** all 147 rows show, the selects are hidden, and the count line reads "147 codes." Nothing is
behind a click.

---

## Section 2: what the verdicts mean

**H2:** What the retry verdicts mean

**Retryable.** The same request can work later. The network hit a rate limit, had a server error, or was still
processing media. Siar waits and tries again by itself for rate limits and outages, up to 3 attempts in all, after the
reset time when the network sends one.

**Not retryable.** Sending the same request again fails the same way. Change something first: reconnect the account,
edit the text or media, grant a permission, or top up a credit. Then retry the post.

**Unknown.** Siar can't tell whether the network acted, usually because a send was interrupted. Check the account
before you send again, so you don't post twice.

In Siar's API the verdict is the `retryability` field, with the values `retryable`, `non_retryable` and `unknown`.

Editor note [code]: verdicts are the `retryability` each adapter's `mapError` assigns, through
`packages/networks/src/lib/errors.ts` (rate limits and network outages are transient and retryable; a few named media
cases are retryable by override; `UNKNOWN` is unknown; everything else is non_retryable). Automatic retries:
`AUTO_ATTEMPTS = 3` and the delay rule are in `apps/api/src/engine/publisher.ts` lines 26 and 168–171. Only transient
categories are retried automatically, so "Siar waits and tries again by itself for rate limits and outages" is exact;
do not widen it to "every retryable error".

---

## Section 3: quick answers

**H2:** Quick answers for eight codes

Format for each H3 (strike plan §2 template): code · the network's message · plain name. Each answer is 40–60 words
and starts with the answer. The last line of each is "What Siar does with it". Each H3 carries an `id` that matches its
table row (`#linkedin-code-426-nonexistent-version` and so on), so the row and the answer share one anchor.

### LinkedIn 426 NONEXISTENT_VERSION · "Requested version … is not active" · API version retired

LinkedIn returns HTTP 426 when the `Linkedin-Version` header names a retired version. Change it to a supported
`YYYYMM` value and resend. LinkedIn supports each monthly version for at least a year, set 16 November 2026 as the
retirement date for 202511, and lists 202610 as the latest
([LinkedIn versioning](https://learn.microsoft.com/en-us/linkedin/marketing/versioning), checked 12 November 2026).

What Siar does with it: Siar sends `Linkedin-Version: 202609`, so posts through Siar are not affected by the 202511
retirement. If Siar's version is ever retired, the fix is a Siar update, not a change you make per post.
[LinkedIn API error codes](/linkedin-api/errors#code-426-nonexistent-version)

### X 402 CreditsDepleted · "Your enrolled account does not have any credits to fulfill this request." · X API credit used up

X returns HTTP 402 `CreditsDepleted` when the pay-per-use credit behind the X app is empty. Top up the credit, then
retry. Sending the same request before the top-up fails the same way, which is why the verdict is not retryable.

What Siar does with it: Siar takes X's own price from your prepaid X credit before each call. When the balance is
empty, the post stops in Siar with "Not enough X credit" before X is called, other networks keep publishing, and a
`credit.exhausted` webhook tells your server. [X API error codes](/x-api/errors#code-402-creditsdepleted)

### X 403 duplicate · "You are not allowed to create a Tweet with duplicate content." · Same text posted recently

X refuses a post whose text matches one the same account posted recently. Change the text and send it again.
Resending the same text gets the same 403, so automatic retries don't help here. If you post the same update on a
schedule, change part of the wording each time.

What Siar does with it: Siar keeps X's message on the post unchanged. When you retry after editing, only X is sent
again; networks that already published are left alone. [X API error codes](/x-api/errors#code-403-duplicate)

### Instagram 2207042 · "You reached maximum number of posts that is allowed to be published by Content Publishing API." · 24-hour publishing limit reached

Meta returns code 9 with subcode 2207042 when an Instagram account has reached its 24-hour limit for posts published
through the API. Meta's own fix: "try again the following day"
([Instagram error codes](https://developers.facebook.com/docs/instagram-platform/instagram-graph-api/reference/error-codes),
checked 12 November 2026). The window rolls, so spacing posts out avoids it.

What Siar does with it: Siar treats it as a rate limit and tries again by itself, up to 3 attempts in all. If the
window is still full, the post fails with Meta's message and you retry it later.
[Instagram API error codes](/instagram-api/errors#code-2207042)

### TikTok spam_risk_too_many_posts · "The daily post cap for this creator was reached." · Creator daily post cap reached

TikTok returns `spam_risk_too_many_posts` (HTTP 403) when "the daily post cap from the API is reached for the current
user" ([TikTok Direct Post reference](https://developers.tiktok.com/doc/content-posting-api-reference-direct-post),
checked 12 November 2026). TikTok's sharing guidelines put the cap at around 15 posts a day per creator. Wait for the
next day, or post less often.

What Siar does with it: TikTok: built, opening after TikTok approves Siar. The code is listed so you can read it from
your own integration. [TikTok API error codes](/tiktok-api/errors#code-spam-risk-too-many-posts)

### Bluesky ExpiredToken · "Token has expired" · Session expired and could not refresh

Bluesky returns `ExpiredToken` when a session token has expired. A client normally refreshes the session and carries
on, so you see this error only when that refresh fails: the refresh token has expired too, or the app password was
deleted. Then nothing but a new sign-in will work.

What Siar does with it: Siar refreshes sessions by itself. When a refresh fails, it flags the account for
reconnection and sends a `social-account.updated` webhook. Reconnect with a new app password.
[Bluesky API error codes](/bluesky-api/errors#code-expiredtoken)

### LinkedIn 422 duplicate · "Content is a duplicate of urn:li:share:…" · Same text posted recently

LinkedIn returns 422 when the same author posted the same commentary recently. The message names the earlier post's
URN, so check it first: that post already went out. Change the text and post again; a retry with the same text fails
the same way.

What Siar does with it: Siar keeps LinkedIn's message on the post. A retry after editing re-sends only LinkedIn, not
the networks that already published. [LinkedIn API error codes](/linkedin-api/errors#code-422-duplicate)

### Facebook 190 · "Error validating access token" · Access token expired or revoked

Meta error 190 means the access token expired or was revoked: the user changed their password, removed the app, or
Meta ended the session for security reasons. No retry will work. The person has to sign in again to grant a new
token. Instagram and Threads return the same code.

What Siar does with it: Siar flags the account for reconnection and sends a `social-account.updated` webhook. Your
customer reconnects through your branded connect link. [Facebook API error codes](/facebook-api/errors#code-190)

Editor notes:
- LinkedIn [sourced]: "202511 … will be sunset on November 16, 2026", latest version 202610, "supported and stable
  for a minimum of one year", and the 426 example "Requested version yyyymmdd is not active" (code
  `NONEXISTENT_VERSION`) are all on learn.microsoft.com/en-us/linkedin/marketing/versioning and
  /error-responses Example 5, fetched 2026-11-12. "Siar sends 202609": `LINKEDIN_VERSION = '202609'` in
  `packages/networks/src/adapters/linkedin.ts` line 38 [code]. The wording "set 16 November 2026 as the retirement
  date" stays true after that date passes.
- X 402 [code + third-party]: message and meaning from `twitter.ts` line 299; X's
  docs.x.com/x-api/fundamentals/response-codes-and-errors does not mention 402 or CreditsDepleted [measured
  2026-11-12], so no X URL is cited. The error also appears in Postiz issue #2231 [third-party, `buyers-pains.md`].
  Siar's hold-before-call and the "Not enough X credit" message: `apps/api/src/engine/publisher.ts` line 114,
  `apps/api/src/domain/credits.ts` [code]; `credit.exhausted` in `apps/site/src/lib/events.ts` line 35 [code].
- X 403 duplicate [code]: `twitter.ts` line 300 and mapper line 81. X's response-codes page does not describe it
  [measured]. Do not state how long X remembers a post; nobody has a source.
- Instagram [sourced]: code 9, subcode 2207042, message and "Advise the app's user to try again the following day" on
  developers.facebook.com (URL above), fetched 2026-11-12. The adapter's table code is "2207042" (the subcode); the
  mapper keys on `code === 9 && sub === 2207042` (`meta-common.ts` line 72) [code]. No post count is given on purpose:
  Meta's own content-publishing page says 100 in one place and 50 in another (`per-network.md` §1) [sourced there].
- TikTok [sourced]: the quoted cap wording is on the Direct Post reference, fetched 2026-11-12. "Around 15 posts a day"
  is from developers.tiktok.com/doc/content-sharing-guidelines as recorded in `per-network.md` §1 ("typically around 15
  posts per day") [sourced there, not re-fetched by me]. Status line word for word from messaging §9.
- Bluesky [code]: `bluesky.ts` lines 60 and 422–431. No Bluesky URL was re-checked today; the answer makes no claim
  beyond the code.
- Facebook 190 [code]: `META_ERRORS['190']`; reconnect flag and webhook: siar-truth §1c "Reconnect detection". "Branded
  connect link", never "white-label" (messaging §6).
- "Retry re-sends only the failed networks" and "doesn't use another post": `posts.ts` `post.retry` resets only
  `ERROR` targets; retries do not count again, up to 6 per post [code, siar-truth §1c].

---
## Section 4: how Siar handles a failed post (the box)

Three lines, in a plain bordered box after the quick answers (messaging §2: error pages carry pillar 1 as a
three-line "How Siar handles this" box).

**Box heading (H2):** How Siar handles a failed post

> If a network says no, the post keeps its own code and message, plus a plain-English fix and a retry verdict.
> Rate limits and outages are retried by Siar, up to 3 attempts, after the network's reset time when it sends one.
> The other networks still publish. Retrying re-sends only the failed ones and doesn't use another post from your plan.

**Link under the box:** [How Siar handles a failed post](/how-publishing-works#errors)

**Primary button (in the box):** Start with 20 free posts
Line under it: "20 free posts to try, once. No card."

---

## Section 5: reading an error in Siar's API

**H2:** Where the error shows up in Siar's API

A network's refusal arrives on the post, not as an HTTP error on the create call. Siar accepts the post first, then
sends it, so the network answers later.

- **`GET /post/{id}`:** `errors` holds one message per network: the network's own words, or Siar's plainer version
  where the code has one. `errorsVerbose` adds the detail: Siar's category, the network's message, the HTTP status,
  the network's raw response and `retryability`.
- **Turn on the detail:** `errorsVerbose` is off by default. Set `verboseErrors: true` with
  `PATCH /organization/settings`.
- **`post.published` webhook:** fires when the post reaches a final state, published or failed, with each network's
  result.
- **`POST /post/{id}/retry`:** re-sends only the networks that failed. A post can be retried up to 6 times, and a
  retry doesn't count against your plan again.

**Code block (labelled "Example: a post refused by X for duplicate text, shortened"):**

```json
{
  "errors": {
    "TWITTER": "You are not allowed to create a Tweet with duplicate content."
  },
  "errorsVerbose": {
    "TWITTER": {
      "code": "DUPLICATE",
      "errorMessage": "You are not allowed to create a Tweet with duplicate content.",
      "isTransient": false,
      "retryability": "non_retryable",
      "httpStatus": 403,
      "meta": { "…": "X's response body, unchanged" },
      "userFacingMessage": "You are not allowed to create a Tweet with duplicate content."
    }
  }
}
```

**Line under the block:** Siar's own errors, such as a `400` with an `issues` array or a `403` for a plan limit, use a
different envelope. [Siar API error envelope and status codes](/docs/errors)

Editor notes [code]:
- `errors` = `userFacingMessage ?? errorMessage` per network; `errorsVerbose` only when the organization's
  `showVerboseErrors` is true (`apps/api/src/domain/serialize.ts` lines 94–116; default `false` in
  `apps/api/prisma/schema.prisma` line 157; request field `verboseErrors` on `PATCH /api/v1/organization/settings`,
  `organization.updateSettings`).
- The verbose shape is `NetworkError.toVerbose()` in `packages/networks/src/lib/errors.ts`. The X mapper sends a body
  containing "duplicate content" to `DUPLICATE` (`twitter.ts` line 81). The example is X because X is open today
  (messaging §6 rule 8: label examples, open networks only).
- "Accepted first, then sent": `/docs/errors` "Errors from networks" [live, code].

---

## Section 6: Mastodon

**H2:** Mastodon: HTTP status instead of codes

Mastodon has no stable error codes. Each server answers with an HTTP status and a short message, and the wording can
differ from server to server. Siar relays both on the post.

- **401:** the token is no longer valid. Reconnect the account. Not retryable.
- **422:** the server refused the status, as a duplicate or for its content. Change it. Not retryable.
- **429:** too many requests. Mastodon's documented default is 300 requests per 5 minutes per account. Retryable.
- **5xx:** the server is having trouble. Retryable.

Siar sends an `Idempotency-Key` with every status, so a retried send can't post twice.
[Mastodon API errors](/mastodon-api/errors)

Editor notes: 401 and 422 mapping in `mastodon.ts` lines 25–31; 429 and 5xx fall to the default status mapping in
`lib/errors.ts` `codeForStatus` [code]. 300 requests per 5 minutes: docs.joinmastodon.org/api/rate-limits/ as recorded
in `per-network.md` §1 [sourced there, not re-fetched by me]. Idempotency-Key: `mastodon.ts` line 175 [code].

---

## Section 7: FAQ (visible on the page; same text in FAQPage JSON-LD)

**H2:** Questions about social media API errors

### Should I retry a social media API error automatically?

Only when the verdict is retryable: rate limits, server errors, and media the network is still processing. Wait for
the reset time the network sends, and cap the attempts. Every other error fails the same way until something changes:
the text, the media, a permission, a token or a credit balance.

### Why does a post fail on one network and publish on the others?

Each network checks a post against its own rules, limits and permissions, so one can refuse what the others accept: a
duplicate on X, the 24-hour cap on Instagram, a missing scope on LinkedIn. In Siar the other networks still publish,
and a retry re-sends only the network that failed.

### How do I avoid posting twice when I retry?

Retry only what failed, and check the account before re-sending anything whose result you don't know. Siar claims
each network target once, so retries and restarts can't publish it again, and it looks for an interrupted post on the
account first. Sending the create request a second time does make a second post.

### Why do Facebook, Instagram and Threads share error codes?

All three are Meta APIs and answer with Meta's error format, so the same numbers mean the same thing on each: 190 for
an invalid token, 4 for the app's rate limit, 100 for a bad parameter. The table lists each code once per network, so
the network filter shows the full set for each.

### Does Mastodon have API error codes?

No. Mastodon servers answer with an HTTP status and a short message, and the wording differs by server. Read the
status: 401 means reconnect, 422 means the server refused the status, 429 means slow down, 5xx means try later. Siar
relays the status and the message on the post.

### Are these the networks' errors or Siar's?

The networks'. They arrive on the post after Siar has sent it, not as an HTTP error on the create call. Siar's own
errors, such as a 400 with an issues array or a 403 for a plan limit, are on the Siar API error envelope page, with
the status codes Siar returns.

### How current is this list?

It is built from the error references in Siar's network adapters, the same code that maps these errors when a post
is sent. The date at the top is the last change to that code. Messages are quoted as the networks send them,
shortened where they run long.

Editor notes:
- Word counts: 51, 50, 53, 55, 49, 53, 48 [measured on this text].
- Q3 concession is required by messaging §3 pillar 1 ("There is no client idempotency key on post creation, so
  resending a create call makes a second post"). Mechanism: `publisher.ts` lines 20–23, 284 [code].
- In the visible FAQ, "Siar API error envelope page" in Q6 links `/docs/errors`. JSON-LD answers carry no links.
- Questions are phrased as people type them into AI assistants (strike plan §5.2, FAQ-as-prompts rule).

---

## Section 8: closing

**H2:** Write it once. Siar it everywhere.

> Siar, a [unified social media API](/), checks text length, media type, size, duration and aspect ratio against each
> network's rules when you create a post. Errors like X's 280 characters or Bluesky's 300 graphemes come back as a
> `400` you fix before anything is sent. When a network still says no, you get its own code and message, a fix and a
> verdict.

> One price per organization, not per account: 20 free posts to try, then from $19 a month (RM39 in Malaysia).

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart (links `/docs/quickstart`)

Editor note: X 280 check `twitter.ts` line 216, Bluesky `TEXT_MAX = 300` `bluesky.ts` line 42; validation list from
siar-truth §1c [code]. Price line word for word from messaging §2 level 3 (first sentence) and §6.

---

## Objection handling (where each is answered on the page)

| Objection | Answer on the page | Where |
|---|---|---|
| "Why trust a vendor's error list?" | The messages are the networks' own, quoted; the eight quick answers link the networks' own pages with a checked date; the list is generated from the code that maps the errors | Intro, quick answers, FAQ "How current is this list?" |
| "Is this every code?" | "These are the codes Siar has documented, not every code each network can return." | Intro, second paragraph |
| "I don't use Siar." | Nothing on the table needs Siar; the codes, messages and verdicts are the networks'. The non-open networks' codes are there for your own integration | Note under the table, TikTok quick answer |
| "Will Siar fix the error for me?" | Only rate limits and outages are retried by Siar; everything else needs a change from you, and the page says what | Verdicts section, box |
| "Can I post to TikTok, Pinterest or Reddit through Siar?" | The status lines, word for word: TikTok built, opening after TikTok approves Siar; the others built, not open yet | Note under the table, TikTok quick answer |
| "Will retrying post twice?" | Siar claims each target once; the create call itself is not protected, and the FAQ says so | FAQ |
| "Who uses you? What's your uptime?" | Not answered on this page and never with numbers (siar-truth §5). The page's proof is the checkable list itself | — |

---

## Comparison table

None on the page. The brief says not to name rival hubs on `/errors`, and the page is a reference, not a pitch. For
the team's own planning, the rival hubs as recorded in the research files:

| Rival | Error pages | Source | Label |
|---|---|---|---|
| bundle.social | 14 network error pages plus a hub at https://bundle.social/errors (in its sitemap); no Snapchat page | `research/competitors/bundle-social.md` line 267; `current-site.md` §3 | measured by the research team from the vendor's own sitemap; not re-checked by me on 2026-11-12 |
| Ayrshare | 30 pages: a "Social Media API Error Fixes" hub plus 29 `/solutions/…` pages | `research/competitors/ayrshare.md` line 197 | same |
| Zernio (Late) | 12 network error references, e.g. `/x/errors` | `research/competitors/late.md` line 175 | same |
| PostPeer | 10 pages; `postpeer.dev/errors/instagram` ranked on DDG for "instagram api errors how to fix" | `strike-plan.md` §2; `current-site.md` §3 | measured once by the research team |

Where they win: Ayrshare has more pages per code and how-to depth; bundle.social's hub is older and already in its
sitemap. Where `/errors` wins: one page holds all 147 codes with the network's message and a retry verdict per row,
which none of the hubs above is recorded as offering [inferred from the research files; not re-checked].

---

## Internal links

**From `/errors` (all in body copy):**

| Anchor text | Target | Where |
|---|---|---|
| Meaning and fix (×147, accessible name per row) | `/<net>-api/errors#code-<slug>` | Table |
| Facebook / Instagram / … API error codes (one per quick answer) | `/<net>-api/errors#code-<slug>` | Quick answers |
| Mastodon API errors | `/mastodon-api/errors` | Mastodon empty state, Section 6 |
| How Siar handles a failed post | `/how-publishing-works#errors` | Box |
| Siar API error envelope and status codes | `/docs/errors` | Section 5, FAQ |
| unified social media API (once) | `/` | Closing |
| Read the quickstart | `/docs/quickstart` | Closing |
| Start with 20 free posts | sign-up URL | Box, closing |

Do not link `/platforms/approvals`, `/network-changes` or `/how-publishing-works` until each is live (strike plan §6
rule 11). If `/how-publishing-works` is not live at launch, the box link points to `/docs/posting` with the anchor
"What to do when a post fails", and switches when the page ships.

**To `/errors` (add at launch; minimum 3, strike plan §6 rule 10):**

| From | Anchor text | Where |
|---|---|---|
| Each `/<net>-api/errors` (15) | All social media API error codes | Under the hero lead, and in breadcrumbs (Home › Networks › Instagram API › Errors) |
| `/docs/errors` | Every network's error codes, in one table | Replaces the bare per-network list in "Errors from networks", or sits above it |
| `/how-publishing-works#errors` | 147 error codes, by network | In the `#errors` section |
| Site-wide footer | Error codes | Strike plan §6 rule 9 |
| `/llms.txt` | `- [Social media API error codes, by network](https://siaran.my/errors): every documented network error code with its message and retry verdict` | Docs section |
| `/docs/posting` | social media API error codes | The sentence that today links TikTok and Instagram errors |

---

## Schema notes

- **`TechArticle`** for the page: `headline` = H1, `description` = meta description, `dateModified` =
  `updatedAt('/errors')` (same value as the visible date and the sitemap `lastmod`), `author` and `publisher` = the
  site's existing `Organization` node, `about` = "social media API error codes", `inLanguage` = "en".
- **`BreadcrumbList`**: Home › Error codes, via `breadcrumbLd` in `apps/site/src/lib/seo.ts`.
- **`FAQPage`** with the seven Q&As exactly as written. Google shows FAQ rich results only for a few sites, but AI
  answer engines read the markup [inferred].
- **No `Dataset`** yet. Add it only if the open error catalogue (strike plan §7 O6, waiting on Fakhrul's go) ships a
  downloadable JSON; then `distribution` points at it.
- **No `AggregateRating`, `Review` or `SoftwareApplication` offers** on this page (siar-truth §5).
- **Markdown twin:** `/errors.md`, the same table as plain Markdown, linked with `rel="alternate"
  type="text/markdown"` (strike plan §5.11). It is what coding agents fetch when asked "what does Instagram error
  2207042 mean".

---

## Build notes (for whoever wires it)

1. **Two new fields on every error reference entry.** Extend the type in `packages/networks/src/types.ts` line 343 to
   `{ code; message; meaning; fix; name: string; retry: Retryability }`, and fill both for all 147 entries (including
   `META_ERRORS` in `meta-common.ts`) from the appendix below.
2. **Keep `retry` honest with a test.** For each entry, run the adapter's own `mapError` on a sample body for that code
   and assert `retryability === retry`. Without it, the hub drifts from the code [inferred; the appendix verdicts are
   my reading of each mapper, so the test is also their check].
3. **Anchors.** Per-network pages move to `id="code-<slug>"`, with
   `slug = code.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')`. The trailing-hyphen trim matters:
   today `403 forbidden (thumbnails)` gets the id `403-forbidden-thumbnails-` [code, `[api]/errors.astro` line 31].
   Keep each old id as an empty `<span id="…">` inside the section so links already in the wild still land. On the hub,
   row ids are `<net>-code-<slug>` (`#instagram-code-2207042`, `#x-code-402-creditsdepleted`), because Meta's codes
   repeat across three networks.
4. **Per-network H2s.** While there, apply strike plan §2's template on the 15 pages: H2 = code · message · plain name
   (the new `name` field), and add the "All social media API error codes" up-link.
5. **Page file.** `apps/site/src/pages/errors.astro`, built from `NETWORKS` in `apps/site/src/lib/networks.ts`, in
   the status-constant order (open networks first). All counts in the description, intro, filter options and count
   line are computed from the data.
6. **Filter.** Two native `<select>` elements (keep native keyboard behaviour), rows hidden with the `hidden`
   attribute, state mirrored to `?network=instagram&verdict=retryable` with `history.replaceState` so filtered views
   can be shared. The canonical stays `/errors`. With no JavaScript, every row shows and the selects are hidden.
7. **Date.** Add `/errors` to `sources()` in `apps/site/src/lib/updated.mjs`: the page file,
   `packages/networks/src/adapters/` and `packages/networks/src/lib/errors.ts`. Today `updatedAt('/errors')` would
   only see the page file.
8. **Phones.** Under 640px each row becomes a stacked block (network and code on one line, then message, plain name,
   verdict, link). No horizontal page scroll; code cells use `overflow-wrap: anywhere` (some TikTok codes are 49
   characters).
9. **Headings.** A real space or `<br>` between split heading spans (strike plan 0.2; Google shows "Discord API
   errorsand how to fix them" today [measured, `current-site.md`]).
10. **Stale entry to fix before launch.** YouTube's `locked private` entry describes the pre-2 November 2026 rule; the
    keyword map (C102) says to update it to Google's 2 November 2026 change. The hub mirrors the adapter, so fix the
    adapter first. The hub's plain name ("Upload came back private") is neutral either way.
11. **Look.** Plain table on the house style (messaging §8). No coloured verdict pills, no count row, no mono-caps
    labels. Mono only for codes and field names.

---

## Why this wins

**Keywords this page targets** (keyword map C114 and the error clusters; demand levels are the research team's
evidence, labelled there):
- Primary: "social media API error codes" [inferred demand from rival hubs targeting it; no volume data].
- Secondary: "instagram api error codes", "tiktok api error codes" (both Google autocomplete [measured in
  `current-site.md` §3]); "facebook api errors"; "x api 402 creditsdepleted" (autocomplete 5, PN46 [measured in
  `per-network.md`]); "linkedin api 426" (autocomplete 4, PN63 [measured]).
- Long tail by row anchor: "OAuthException 190 error validating access token", "tiktok api error 40001",
  "unaudited_client_can_only_post_to_private_accounts", "pinterest api 403 trial", "discord api 50013" and every other
  code-plus-message string, now that each sits in a row with its message.

**AI prompts it answers** (`docs/geo/prompts_v1.csv`): p038 "Instagram API error 2207042 what does it mean", p039
"TikTok API spam_risk_too_many_posts error", p040 "Bluesky API ExpiredToken error fix", p041 "LinkedIn API 422
duplicate post error", p042 "X API 403 duplicate content error". Each has a quick answer here that starts with the
answer, plus a row and a link to the full entry.

**Why it can rank** [inferred, from the research files]:
- The fields are small: rival error families run 10 to 30 pages, and a small vendor (PostPeer) already ranks with this
  page type.
- It is the only page on the site that links all 15 error pages; today each has 2 in-links, both from its own network
  page, and at least 5 of 15 are not in Google [measured, `current-site.md` §2, §5]. The hub plus the footer link
  gives every code page a crawl path.
- The answer to "what are social media API error codes" is in the first 55 words, and each quick answer opens with the
  fix, which is what answer engines lift.
- The data is the product: 147 codes generated from the code that maps them, with a verdict nobody else is recorded
  as giving per row.

---

## Appendix: plain name and retry verdict for all 147 codes

Data for the new `name` and `retry` fields (build note 1). Messages, meanings and fixes stay as they are in the
adapters. Verdicts are my reading of each adapter's `mapError` [code, inferred until the build note 2 test passes].
Order = the table order. Totals: 147 codes, 27 `retryable`, 120 `non_retryable`, 0 `unknown`.

Rows to check by hand when wiring the test, because the adapter treats them specially:
- Meta `9007` and Snapchat `MEDIA_EXPIRED`: `MEDIA_INVALID` with a `retryable` override (`meta-common.ts` line 76,
  `snapchat.ts` line 71).
- Bluesky `use_dpop_nonce`: Siar retries once with the nonce; marked `retryable`.
- Bluesky `InvalidSwap`, Snapchat `MEDIA_POSTING_ALREADY_IN_PROGRESS`, Discord `10015`: Siar handles them (treats as
  posted, or recreates the webhook); marked `non_retryable` because re-sending the same request does not help.
- LinkedIn `truncated text` and YouTube `locked private`: not errors from the network; `non_retryable` because the same
  request gives the same result.
- Pinterest `5xx`: not mapped in `pinterest.ts`; assumed to fall to `codeForStatus` (`NETWORK_UNAVAILABLE`,
  retryable). Confirm.
- YouTube `403 quotaExceeded` and `400 uploadLimitExceeded`: `RATE_LIMITED`, so retryable, but the reset can be a day
  away (`youtube.ts` lines 65–68).

| Network | Code | Plain name (`name`) | Verdict (`retry`) | Per-network anchor | Hub row id |
|---|---|---|---|---|---|
| Facebook | `190` | Access token expired or revoked | `non_retryable` | `/facebook-api/errors#code-190` | `#facebook-code-190` |
| Facebook | `4` | App rate limit reached | `retryable` | `/facebook-api/errors#code-4` | `#facebook-code-4` |
| Facebook | `17` | User rate limit reached | `retryable` | `/facebook-api/errors#code-17` | `#facebook-code-17` |
| Facebook | `32` | Page rate limit reached | `retryable` | `/facebook-api/errors#code-32` | `#facebook-code-32` |
| Facebook | `613` | Endpoint rate limit reached | `retryable` | `/facebook-api/errors#code-613` | `#facebook-code-613` |
| Facebook | `10` | Permission not granted | `non_retryable` | `/facebook-api/errors#code-10` | `#facebook-code-10` |
| Facebook | `200` | Missing Page role or permission | `non_retryable` | `/facebook-api/errors#code-200` | `#facebook-code-200` |
| Facebook | `100` | Invalid or missing parameter | `non_retryable` | `/facebook-api/errors#code-100` | `#facebook-code-100` |
| Facebook | `368` | Action blocked as abusive | `non_retryable` | `/facebook-api/errors#code-368` | `#facebook-code-368` |
| Facebook | `506` | Same text just posted to this Page | `non_retryable` | `/facebook-api/errors#code-506` | `#facebook-code-506` |
| Facebook | `2018278` | Outside the 24-hour messaging window | `non_retryable` | `/facebook-api/errors#code-2018278` | `#facebook-code-2018278` |
| Facebook | `551` | Recipient not available | `non_retryable` | `/facebook-api/errors#code-551` | `#facebook-code-551` |
| Instagram | `190` | Access token expired or revoked | `non_retryable` | `/instagram-api/errors#code-190` | `#instagram-code-190` |
| Instagram | `4` | App rate limit reached | `retryable` | `/instagram-api/errors#code-4` | `#instagram-code-4` |
| Instagram | `10` | Permission not granted | `non_retryable` | `/instagram-api/errors#code-10` | `#instagram-code-10` |
| Instagram | `100` | Invalid or missing parameter | `non_retryable` | `/instagram-api/errors#code-100` | `#instagram-code-100` |
| Instagram | `9004` | Media could not be read | `non_retryable` | `/instagram-api/errors#code-9004` | `#instagram-code-9004` |
| Instagram | `36003` | Image aspect ratio not supported | `non_retryable` | `/instagram-api/errors#code-36003` | `#instagram-code-36003` |
| Instagram | `9007` | Media still processing | `retryable` | `/instagram-api/errors#code-9007` | `#instagram-code-9007` |
| Instagram | `2207042` | 24-hour publishing limit reached | `retryable` | `/instagram-api/errors#code-2207042` | `#instagram-code-2207042` |
| Instagram | `2018278` | Outside the 24-hour messaging window | `non_retryable` | `/instagram-api/errors#code-2018278` | `#instagram-code-2018278` |
| Instagram | `551` | Recipient not available | `non_retryable` | `/instagram-api/errors#code-551` | `#instagram-code-551` |
| Threads | `190` | Access token expired or revoked | `non_retryable` | `/threads-api/errors#code-190` | `#threads-code-190` |
| Threads | `4` | App rate limit reached | `retryable` | `/threads-api/errors#code-4` | `#threads-code-4` |
| Threads | `10` | Permission not granted | `non_retryable` | `/threads-api/errors#code-10` | `#threads-code-10` |
| Threads | `100` | Invalid or missing parameter | `non_retryable` | `/threads-api/errors#code-100` | `#threads-code-100` |
| Threads | `368` | Action blocked as abusive | `non_retryable` | `/threads-api/errors#code-368` | `#threads-code-368` |
| Threads | `9004` | Media could not be read | `non_retryable` | `/threads-api/errors#code-9004` | `#threads-code-9004` |
| Threads | `9007` | Media still processing | `retryable` | `/threads-api/errors#code-9007` | `#threads-code-9007` |
| Threads | `THREADS_API__LINK_LIMIT_EXCEEDED` | More than 5 links in one post | `non_retryable` | `/threads-api/errors#code-threads-api-link-limit-exceeded` | `#threads-code-threads-api-link-limit-exceeded` |
| X (Twitter) | `401` | Access token expired or revoked | `non_retryable` | `/x-api/errors#code-401` | `#x-code-401` |
| X (Twitter) | `402 CreditsDepleted` | X API credit used up | `non_retryable` | `/x-api/errors#code-402-creditsdepleted` | `#x-code-402-creditsdepleted` |
| X (Twitter) | `403 duplicate` | Same text posted recently | `non_retryable` | `/x-api/errors#code-403-duplicate` | `#x-code-403-duplicate` |
| X (Twitter) | `403 reply` | Reply not allowed to this post | `non_retryable` | `/x-api/errors#code-403-reply` | `#x-code-403-reply` |
| X (Twitter) | `403 video` | Video too long for this account | `non_retryable` | `/x-api/errors#code-403-video` | `#x-code-403-video` |
| X (Twitter) | `403 too long` | Text over 280 characters | `non_retryable` | `/x-api/errors#code-403-too-long` | `#x-code-403-too-long` |
| X (Twitter) | `403 client-not-enrolled` | X app not attached to a project | `non_retryable` | `/x-api/errors#code-403-client-not-enrolled` | `#x-code-403-client-not-enrolled` |
| X (Twitter) | `403 quote` | Quoting not on this access tier | `non_retryable` | `/x-api/errors#code-403-quote` | `#x-code-403-quote` |
| X (Twitter) | `400 invalid-request` | A field failed X validation | `non_retryable` | `/x-api/errors#code-400-invalid-request` | `#x-code-400-invalid-request` |
| X (Twitter) | `400 media` | Media id expired or failed | `non_retryable` | `/x-api/errors#code-400-media` | `#x-code-400-media` |
| X (Twitter) | `404` | Post not found | `non_retryable` | `/x-api/errors#code-404` | `#x-code-404` |
| X (Twitter) | `429` | Rate limit reached | `retryable` | `/x-api/errors#code-429` | `#x-code-429` |
| X (Twitter) | `503` | X is overloaded | `retryable` | `/x-api/errors#code-503` | `#x-code-503` |
| LinkedIn | `401 65601` | Token revoked or expired | `non_retryable` | `/linkedin-api/errors#code-401-65601` | `#linkedin-code-401-65601` |
| LinkedIn | `403 ACCESS_DENIED` | Missing scope or product access | `non_retryable` | `/linkedin-api/errors#code-403-access-denied` | `#linkedin-code-403-access-denied` |
| LinkedIn | `422 duplicate` | Same text posted recently | `non_retryable` | `/linkedin-api/errors#code-422-duplicate` | `#linkedin-code-422-duplicate` |
| LinkedIn | `422 empty` | Post has no text | `non_retryable` | `/linkedin-api/errors#code-422-empty` | `#linkedin-code-422-empty` |
| LinkedIn | `429` | Daily app limit reached | `retryable` | `/linkedin-api/errors#code-429` | `#linkedin-code-429` |
| LinkedIn | `426 NONEXISTENT_VERSION` | API version retired | `non_retryable` | `/linkedin-api/errors#code-426-nonexistent-version` | `#linkedin-code-426-nonexistent-version` |
| LinkedIn | `400 media` | Media not available | `non_retryable` | `/linkedin-api/errors#code-400-media` | `#linkedin-code-400-media` |
| LinkedIn | `400 commentary` | Field combination not allowed | `non_retryable` | `/linkedin-api/errors#code-400-commentary` | `#linkedin-code-400-commentary` |
| LinkedIn | `404` | Post or comment not found | `non_retryable` | `/linkedin-api/errors#code-404` | `#linkedin-code-404` |
| LinkedIn | `truncated text` | Text cut off at ( or [ | `non_retryable` | `/linkedin-api/errors#code-truncated-text` | `#linkedin-code-truncated-text` |
| Bluesky | `AuthenticationRequired` | Wrong handle or app password | `non_retryable` | `/bluesky-api/errors#code-authenticationrequired` | `#bluesky-code-authenticationrequired` |
| Bluesky | `ExpiredToken` | Session expired and could not refresh | `non_retryable` | `/bluesky-api/errors#code-expiredtoken` | `#bluesky-code-expiredtoken` |
| Bluesky | `AccountTakedown` | Account taken down | `non_retryable` | `/bluesky-api/errors#code-accounttakedown` | `#bluesky-code-accounttakedown` |
| Bluesky | `InvalidRequest` | Text over 300 graphemes | `non_retryable` | `/bluesky-api/errors#code-invalidrequest` | `#bluesky-code-invalidrequest` |
| Bluesky | `BlobTooLarge` | File too large | `non_retryable` | `/bluesky-api/errors#code-blobtoolarge` | `#bluesky-code-blobtoolarge` |
| Bluesky | `InvalidMimeType` | Unsupported media type | `non_retryable` | `/bluesky-api/errors#code-invalidmimetype` | `#bluesky-code-invalidmimetype` |
| Bluesky | `RateLimitExceeded` | Rate limit reached | `retryable` | `/bluesky-api/errors#code-ratelimitexceeded` | `#bluesky-code-ratelimitexceeded` |
| Bluesky | `use_dpop_nonce` | DPoP nonce required | `retryable` | `/bluesky-api/errors#code-use-dpop-nonce` | `#bluesky-code-use-dpop-nonce` |
| Bluesky | `invalid_grant` | Refresh token expired or revoked | `non_retryable` | `/bluesky-api/errors#code-invalid-grant` | `#bluesky-code-invalid-grant` |
| Bluesky | `InvalidSwap` | Record already exists | `non_retryable` | `/bluesky-api/errors#code-invalidswap` | `#bluesky-code-invalidswap` |
| Discord | `50013` | Bot missing a channel permission | `non_retryable` | `/discord-api/errors#code-50013` | `#discord-code-50013` |
| Discord | `50001` | Bot cannot see the channel | `non_retryable` | `/discord-api/errors#code-50001` | `#discord-code-50001` |
| Discord | `10003` | Channel deleted | `non_retryable` | `/discord-api/errors#code-10003` | `#discord-code-10003` |
| Discord | `10015` | Siar webhook deleted | `non_retryable` | `/discord-api/errors#code-10015` | `#discord-code-10015` |
| Discord | `10008` | Message already deleted | `non_retryable` | `/discord-api/errors#code-10008` | `#discord-code-10008` |
| Discord | `50035` | A field was rejected | `non_retryable` | `/discord-api/errors#code-50035` | `#discord-code-50035` |
| Discord | `40005` | Upload too large | `non_retryable` | `/discord-api/errors#code-40005` | `#discord-code-40005` |
| Discord | `429` | Rate limit reached | `retryable` | `/discord-api/errors#code-429` | `#discord-code-429` |
| Discord | `401` | Bot token invalid | `non_retryable` | `/discord-api/errors#code-401` | `#discord-code-401` |
| Slack | `not_in_channel` | App not in the channel | `non_retryable` | `/slack-api/errors#code-not-in-channel` | `#slack-code-not-in-channel` |
| Slack | `channel_not_found` | Channel missing or private | `non_retryable` | `/slack-api/errors#code-channel-not-found` | `#slack-code-channel-not-found` |
| Slack | `is_archived` | Channel archived | `non_retryable` | `/slack-api/errors#code-is-archived` | `#slack-code-is-archived` |
| Slack | `invalid_auth` | Bot token invalid | `non_retryable` | `/slack-api/errors#code-invalid-auth` | `#slack-code-invalid-auth` |
| Slack | `token_revoked` | App removed or token revoked | `non_retryable` | `/slack-api/errors#code-token-revoked` | `#slack-code-token-revoked` |
| Slack | `missing_scope` | Missing scope | `non_retryable` | `/slack-api/errors#code-missing-scope` | `#slack-code-missing-scope` |
| Slack | `msg_too_long` | Message too long | `non_retryable` | `/slack-api/errors#code-msg-too-long` | `#slack-code-msg-too-long` |
| Slack | `cant_delete_message` | Cannot delete this message | `non_retryable` | `/slack-api/errors#code-cant-delete-message` | `#slack-code-cant-delete-message` |
| Slack | `edit_window_closed` | Edit window closed | `non_retryable` | `/slack-api/errors#code-edit-window-closed` | `#slack-code-edit-window-closed` |
| Slack | `ratelimited` | Rate limit reached | `retryable` | `/slack-api/errors#code-ratelimited` | `#slack-code-ratelimited` |
| YouTube | `401 authError` | Access token expired or revoked | `non_retryable` | `/youtube-api/errors#code-401-autherror` | `#youtube-code-401-autherror` |
| YouTube | `403 quotaExceeded` | Daily project quota used up | `retryable` | `/youtube-api/errors#code-403-quotaexceeded` | `#youtube-code-403-quotaexceeded` |
| YouTube | `400 uploadLimitExceeded` | Channel upload limit reached | `retryable` | `/youtube-api/errors#code-400-uploadlimitexceeded` | `#youtube-code-400-uploadlimitexceeded` |
| YouTube | `403 forbidden (thumbnails)` | Channel not verified for thumbnails | `non_retryable` | `/youtube-api/errors#code-403-forbidden-thumbnails` | `#youtube-code-403-forbidden-thumbnails` |
| YouTube | `401 youtubeSignupRequired` | Google account has no channel | `non_retryable` | `/youtube-api/errors#code-401-youtubesignuprequired` | `#youtube-code-401-youtubesignuprequired` |
| YouTube | `400 invalidTitle` | Invalid title | `non_retryable` | `/youtube-api/errors#code-400-invalidtitle` | `#youtube-code-400-invalidtitle` |
| YouTube | `400 invalidDescription` | Invalid description | `non_retryable` | `/youtube-api/errors#code-400-invaliddescription` | `#youtube-code-400-invaliddescription` |
| YouTube | `409 videoAlreadyInPlaylist` | Already in the playlist | `non_retryable` | `/youtube-api/errors#code-409-videoalreadyinplaylist` | `#youtube-code-409-videoalreadyinplaylist` |
| YouTube | `403 commentsDisabled` | Comments turned off | `non_retryable` | `/youtube-api/errors#code-403-commentsdisabled` | `#youtube-code-403-commentsdisabled` |
| YouTube | `uploadStatus rejected` | Video refused after processing | `non_retryable` | `/youtube-api/errors#code-uploadstatus-rejected` | `#youtube-code-uploadstatus-rejected` |
| YouTube | `locked private` | Upload came back private | `non_retryable` | `/youtube-api/errors#code-locked-private` | `#youtube-code-locked-private` |
| TikTok | `unaudited_client_can_only_post_to_private_accounts` | App not audited: private posts only | `non_retryable` | `/tiktok-api/errors#code-unaudited-client-can-only-post-to-private-accounts` | `#tiktok-code-unaudited-client-can-only-post-to-private-accounts` |
| TikTok | `privacy_level_option_mismatch` | Privacy level not offered to this creator | `non_retryable` | `/tiktok-api/errors#code-privacy-level-option-mismatch` | `#tiktok-code-privacy-level-option-mismatch` |
| TikTok | `spam_risk_too_many_posts` | Creator daily post cap reached | `retryable` | `/tiktok-api/errors#code-spam-risk-too-many-posts` | `#tiktok-code-spam-risk-too-many-posts` |
| TikTok | `spam_risk_too_many_pending_share` | Too many drafts waiting in the inbox | `retryable` | `/tiktok-api/errors#code-spam-risk-too-many-pending-share` | `#tiktok-code-spam-risk-too-many-pending-share` |
| TikTok | `spam_risk_user_banned_from_posting` | Creator banned from posting | `non_retryable` | `/tiktok-api/errors#code-spam-risk-user-banned-from-posting` | `#tiktok-code-spam-risk-user-banned-from-posting` |
| TikTok | `access_token_invalid` | Access token expired or revoked | `non_retryable` | `/tiktok-api/errors#code-access-token-invalid` | `#tiktok-code-access-token-invalid` |
| TikTok | `scope_not_authorized` | Permission not granted | `non_retryable` | `/tiktok-api/errors#code-scope-not-authorized` | `#tiktok-code-scope-not-authorized` |
| TikTok | `url_ownership_unverified` | Media domain not verified | `non_retryable` | `/tiktok-api/errors#code-url-ownership-unverified` | `#tiktok-code-url-ownership-unverified` |
| TikTok | `rate_limit_exceeded` | Rate limit reached | `retryable` | `/tiktok-api/errors#code-rate-limit-exceeded` | `#tiktok-code-rate-limit-exceeded` |
| TikTok | `duration_check_failed` | Video too long for this creator | `non_retryable` | `/tiktok-api/errors#code-duration-check-failed` | `#tiktok-code-duration-check-failed` |
| TikTok | `file_format_check_failed` | Unsupported media format | `non_retryable` | `/tiktok-api/errors#code-file-format-check-failed` | `#tiktok-code-file-format-check-failed` |
| TikTok | `picture_size_check_failed` | Photo too large | `non_retryable` | `/tiktok-api/errors#code-picture-size-check-failed` | `#tiktok-code-picture-size-check-failed` |
| TikTok | `reached_active_user_cap` | App daily creator cap reached | `non_retryable` | `/tiktok-api/errors#code-reached-active-user-cap` | `#tiktok-code-reached-active-user-cap` |
| TikTok | `40001` | No permission on the business account | `non_retryable` | `/tiktok-api/errors#code-40001` | `#tiktok-code-40001` |
| TikTok | `40105` | Business token expired | `non_retryable` | `/tiktok-api/errors#code-40105` | `#tiktok-code-40105` |
| Pinterest | `401` | Access token expired or revoked | `non_retryable` | `/pinterest-api/errors#code-401` | `#pinterest-code-401` |
| Pinterest | `403 trial` | Trial access cannot create Pins | `non_retryable` | `/pinterest-api/errors#code-403-trial` | `#pinterest-code-403-trial` |
| Pinterest | `403 scope` | Missing scope | `non_retryable` | `/pinterest-api/errors#code-403-scope` | `#pinterest-code-403-scope` |
| Pinterest | `404 board` | Board not found | `non_retryable` | `/pinterest-api/errors#code-404-board` | `#pinterest-code-404-board` |
| Pinterest | `404 pin` | Pin not found | `non_retryable` | `/pinterest-api/errors#code-404-pin` | `#pinterest-code-404-pin` |
| Pinterest | `400 image` | Image could not be fetched | `non_retryable` | `/pinterest-api/errors#code-400-image` | `#pinterest-code-400-image` |
| Pinterest | `400 params` | A field failed validation | `non_retryable` | `/pinterest-api/errors#code-400-params` | `#pinterest-code-400-params` |
| Pinterest | `400 video` | Video not ready or no cover | `non_retryable` | `/pinterest-api/errors#code-400-video` | `#pinterest-code-400-video` |
| Pinterest | `429` | Rate limit reached | `retryable` | `/pinterest-api/errors#code-429` | `#pinterest-code-429` |
| Pinterest | `5xx` | Pinterest server error | `retryable` | `/pinterest-api/errors#code-5xx` | `#pinterest-code-5xx` |
| Reddit | `401` | Access token expired or revoked | `non_retryable` | `/reddit-api/errors#code-401` | `#reddit-code-401` |
| Reddit | `403 private` | Subreddit private, quarantined or banned | `non_retryable` | `/reddit-api/errors#code-403-private` | `#reddit-code-403-private` |
| Reddit | `429 / RATELIMIT` | Posting too often | `retryable` | `/reddit-api/errors#code-429-ratelimit` | `#reddit-code-429-ratelimit` |
| Reddit | `SUBREDDIT_NOEXIST` | Subreddit does not exist | `non_retryable` | `/reddit-api/errors#code-subreddit-noexist` | `#reddit-code-subreddit-noexist` |
| Reddit | `SUBREDDIT_NOTALLOWED` | Not allowed to post there | `non_retryable` | `/reddit-api/errors#code-subreddit-notallowed` | `#reddit-code-subreddit-notallowed` |
| Reddit | `SUBMIT_VALIDATION_FLAIR_REQUIRED` | Flair required | `non_retryable` | `/reddit-api/errors#code-submit-validation-flair-required` | `#reddit-code-submit-validation-flair-required` |
| Reddit | `BAD_FLAIR_TEMPLATE_ID` | Invalid flair id | `non_retryable` | `/reddit-api/errors#code-bad-flair-template-id` | `#reddit-code-bad-flair-template-id` |
| Reddit | `NO_LINKS / NO_SELFS` | Post type not allowed here | `non_retryable` | `/reddit-api/errors#code-no-links-no-selfs` | `#reddit-code-no-links-no-selfs` |
| Reddit | `TOO_LONG` | Title or text too long | `non_retryable` | `/reddit-api/errors#code-too-long` | `#reddit-code-too-long` |
| Reddit | `invalid_grant` | Refresh token revoked | `non_retryable` | `/reddit-api/errors#code-invalid-grant` | `#reddit-code-invalid-grant` |
| Snapchat | `401` | Token expired | `non_retryable` | `/snapchat-api/errors#code-401` | `#snapchat-code-401` |
| Snapchat | `AUTHORIZATION_PERMISSION_DENIED` | App not allowlisted by Snap | `non_retryable` | `/snapchat-api/errors#code-authorization-permission-denied` | `#snapchat-code-authorization-permission-denied` |
| Snapchat | `429` | Rate limit reached | `retryable` | `/snapchat-api/errors#code-429` | `#snapchat-code-429` |
| Snapchat | `media_invalid` | Media outside the limits | `non_retryable` | `/snapchat-api/errors#code-media-invalid` | `#snapchat-code-media-invalid` |
| Snapchat | `MEDIA_EXPIRED` | Media older than 24 hours | `retryable` | `/snapchat-api/errors#code-media-expired` | `#snapchat-code-media-expired` |
| Snapchat | `MEDIA_POSTING_ALREADY_IN_PROGRESS` | Already being posted | `non_retryable` | `/snapchat-api/errors#code-media-posting-already-in-progress` | `#snapchat-code-media-posting-already-in-progress` |
| Snapchat | `spotlight_rejected` | Spotlight refused by moderation | `non_retryable` | `/snapchat-api/errors#code-spotlight-rejected` | `#snapchat-code-spotlight-rejected` |
| Snapchat | `invalid_grant` | Authorization code invalid | `non_retryable` | `/snapchat-api/errors#code-invalid-grant` | `#snapchat-code-invalid-grant` |
| Snapchat | `spotlight_requires_one_video` | Spotlight needs exactly one video | `non_retryable` | `/snapchat-api/errors#code-spotlight-requires-one-video` | `#snapchat-code-spotlight-requires-one-video` |
| Google Business Profile | `401 UNAUTHENTICATED` | Access token expired or revoked | `non_retryable` | `/google-business-profile-api/errors#code-401-unauthenticated` | `#google-business-profile-code-401-unauthenticated` |
| Google Business Profile | `403 SERVICE_DISABLED` | API not enabled for the project | `non_retryable` | `/google-business-profile-api/errors#code-403-service-disabled` | `#google-business-profile-code-403-service-disabled` |
| Google Business Profile | `403 ACCESS_TOKEN_SCOPE_INSUFFICIENT` | Permission not granted | `non_retryable` | `/google-business-profile-api/errors#code-403-access-token-scope-insufficient` | `#google-business-profile-code-403-access-token-scope-insufficient` |
| Google Business Profile | `429 RATE_LIMIT_EXCEEDED` | Per-minute quota reached | `retryable` | `/google-business-profile-api/errors#code-429-rate-limit-exceeded` | `#google-business-profile-code-429-rate-limit-exceeded` |
| Google Business Profile | `400 FAILED_PRECONDITION` | Location not verified | `non_retryable` | `/google-business-profile-api/errors#code-400-failed-precondition` | `#google-business-profile-code-400-failed-precondition` |
| Google Business Profile | `400 INVALID_ARGUMENT (summary)` | A post field failed validation | `non_retryable` | `/google-business-profile-api/errors#code-400-invalid-argument-summary` | `#google-business-profile-code-400-invalid-argument-summary` |
| Google Business Profile | `400 INVALID_ARGUMENT (media)` | Photo unreadable or wrong size | `non_retryable` | `/google-business-profile-api/errors#code-400-invalid-argument-media` | `#google-business-profile-code-400-invalid-argument-media` |
| Google Business Profile | `404 NOT_FOUND` | Location or post not found | `non_retryable` | `/google-business-profile-api/errors#code-404-not-found` | `#google-business-profile-code-404-not-found` |
| Google Business Profile | `state REJECTED` | Post removed for policy | `non_retryable` | `/google-business-profile-api/errors#code-state-rejected` | `#google-business-profile-code-state-rejected` |
| Google Business Profile | `invalid_grant` | Refresh token expired or revoked | `non_retryable` | `/google-business-profile-api/errors#code-invalid-grant` | `#google-business-profile-code-invalid-grant` |
