# /{network}-api/errors: final copy (template for all 15 error pages)

Status: publish-ready copy for Wave 1 (strike plan §3 strike 2, §5.5; keyword map C72, C81, C84, C88, C92, C95, C102,
C104, C108, C109). Written 2026-11-12. LIVE-FIX: replaces the copy produced by
`apps/site/src/pages/[api]/errors.astro` and the `errorReference` data in `packages/networks/src/adapters/*.ts`.

This file has two jobs:
1. The shared pattern every one of the 15 pages renders (meta, hero, per-code entry, closing sections, FAQ, schema).
2. The finished per-network and per-code copy the pattern needs: 15 titles, descriptions and intros, a plain name and a
   developer-first fix for all 147 codes, 12 fully written priority entries, and a filled Mastodon page.

**Sources.** Siar facts: `docs/seo/research/siar-truth.md` (checked 2026-11-12) as corrected by `docs/seo/strike-plan.md`
§2. Voice, hierarchy, status lines and CTAs: `docs/seo/messaging.md` §2, §6, §9. Codes, messages and Siar's behaviour:
this checkout (release 878b698), files named per claim. Network facts: each network's own page, fetched by me today and
marked "checked 2026-11-12".

**Labels in editor notes.** [code] read in this checkout · [doc] Siar's own records · [sourced] the network's own page,
URL given, checked 2026-11-12 · [measured] seen by me today · [inferred] judgement · [unverified] not checked.

**Search limit.** The shared WebSearch budget for this run was spent before this file was written, so no new SERP,
autocomplete or People Also Ask data was gathered here. Demand grades come from `keyword-map.md` and
`research/keywords/per-network.md` (sibling measurements, used as [inferred]). Network facts were checked with WebFetch.

---

## 0. What changes, in one list

| Today (live) | After this file |
|---|---|
| H1 renders "Instagram API errorsand how to fix them." (glued spans) [measured, `current-site.md` §2] | One-line H1 "Instagram API error codes and how to fix them", no split span |
| Intro explains how Siar relays errors | Intro answers the query: the network's error format and the codes on the page, in under 60 words |
| H2 is a bare code: "190", "2207042" | H2 = code · the network's message · plain name: "190 · Error validating access token · the token expired" |
| Anchor ids are the raw code ("190", "403-duplicate") | `#code-190`, `#code-403-duplicate`; the old id stays as an empty span so existing links still land |
| "How to fix it" often says what Siar does ("Siar retries automatically") | The fix is for any developer; Siar's part is one separate line, "What Siar does with it" |
| No date | Visible "Updated 12 November 2026" and `dateModified` in JSON-LD |
| 2 in-links each, both from the network hub; no `/errors` hub | Links to and from the hub, `/errors`, `/docs/errors`, `/platforms` and topic pages, with query wording |
| Mastodon page: 203 words, no entries | Filled with HTTP-status guidance (section 9). Indexed, not noindex |
| YouTube "locked private": "Videos uploaded by an API project that has not passed the YouTube API compliance audit are locked private." | Rewritten to Google's 2 November 2026 change (section 6.10) |
| TikTok page reads like a live integration | Reference framing with the status line under the intro |
| No URL per code (keep) | Still none. 147 one-code pages would be thin near-duplicates; anchors do the job (strike plan §5.5) |

---

## 1. Meta

| Field | Rule |
|---|---|
| URL | `https://siaran.my/{network}-api/errors` (unchanged; already indexed for some networks) |
| Meta title | `{Name} API error codes and how to fix them`. The layout appends " \| Siar" (`Base.astro` line 18). If the full title would pass 60 characters, use `{Name} API error codes and fixes` instead. Only Google Business Profile needs the short form |
| Meta description | Per network, table 1a. Each one is under 155 characters and names real codes from that page |
| H1 | `{Name} API error codes and how to fix them` on one line (Mastodon: section 9) |
| Visible date line | `Updated {12 November 2026}. Generated from the code Siar uses to read {Name}'s errors.` |
| Canonical | Self |
| Robots | index, follow (all 15, Mastodon included) |

Editor note: the visible date and `dateModified` come from the last git commit that touched the network's adapter
`errorReference` (or its shared Meta list), formatted "12 November 2026" in prose and `2026-11-12` in JSON-LD. Never
the build date: a rebuild with no change must not move the date [inferred: engines discount dates that change on every
deploy].

### 1a. Titles and descriptions, per network

| Network | Meta title (with " \| Siar") | Chars | Meta description | Chars |
|---|---|---|---|---|
| Facebook | Facebook API error codes and how to fix them \| Siar | 51 | Facebook Graph API error codes with Meta's message and the fix: 190 expired token, 4 and 17 rate limits, 10 and 200 permissions, 506 duplicate post. | 148 |
| Instagram | Instagram API error codes and how to fix them \| Siar | 52 | Instagram Graph API error codes with Meta's message and the fix: 190, 4, 10, 100, 9004, 36003, 9007 and 2207042, the 24-hour publishing limit. | 142 |
| Threads | Threads API error codes and how to fix them \| Siar | 50 | Threads API error codes with Meta's message, what each means and the fix: 190, 4, 10, 100, 368, 9004, 9007 and the five-link limit. | 131 |
| X (Twitter) | X (Twitter) API error codes and how to fix them \| Siar | 54 | X API v2 errors with X's message and the fix: 402 CreditsDepleted, 403 duplicate content, reply and length limits, 401, 429 rate limits and more. | 145 |
| LinkedIn | LinkedIn API error codes and how to fix them \| Siar | 51 | LinkedIn API error codes and fixes: 426 NONEXISTENT_VERSION (202511 retires 16 November 2026), 422 duplicate post, 403 ACCESS_DENIED, 401 revoked token. | 152 |
| TikTok | TikTok API error codes and how to fix them \| Siar | 49 | TikTok Content Posting API error codes and fixes: spam_risk_too_many_posts, unaudited_client_can_only_post_to_private_accounts, reached_active_user_cap. | 152 |
| YouTube | YouTube API error codes and how to fix them \| Siar | 50 | YouTube Data API errors and fixes: quotaExceeded, uploadLimitExceeded, invalidTitle, authError, and private uploads after Google's 2 November 2026 change. | 154 |
| Pinterest | Pinterest API error codes and how to fix them \| Siar | 52 | Pinterest API v5 errors and fixes: 401 token, 403 Trial access and missing scopes, 404 board not found, 400 image and video errors, 429 rate limits. | 148 |
| Reddit | Reddit API error codes and how to fix them \| Siar | 49 | Reddit API errors and fixes: SUBREDDIT_NOTALLOWED, SUBMIT_VALIDATION_FLAIR_REQUIRED, RATELIMIT, NO_LINKS, TOO_LONG, invalid_grant and HTTP 401, 403, 429. | 153 |
| Mastodon | Mastodon API errors by HTTP status, with fixes \| Siar | 53 | Mastodon has no numeric error codes. What 400, 401, 403, 404, 422, 429 and 503 mean, the default rate limits, and how to fix each one. | 134 |
| Discord | Discord API error codes and how to fix them \| Siar | 50 | Discord API error codes and fixes: 50013 Missing Permissions, 50001 Missing Access, 10003 Unknown Channel, 50035 Invalid Form Body, 40005, 429. | 143 |
| Slack | Slack API error codes and how to fix them \| Siar | 48 | Slack API errors and fixes: not_in_channel, channel_not_found, invalid_auth, token_revoked, missing_scope, msg_too_long, ratelimited and more. | 142 |
| Bluesky | Bluesky API error codes and how to fix them \| Siar | 50 | Bluesky API errors and fixes: ExpiredToken, AuthenticationRequired, InvalidRequest (300 graphemes), BlobTooLarge, RateLimitExceeded, use_dpop_nonce. | 148 |
| Google Business Profile | Google Business Profile API error codes and fixes \| Siar | 56 | Google Business Profile API errors and fixes: SERVICE_DISABLED, FAILED_PRECONDITION (unverified location), RATE_LIMIT_EXCEEDED, invalid_grant. | 142 |
| Snapchat | Snapchat API error codes and how to fix them \| Siar | 51 | Snapchat Public Profile API errors and fixes: AUTHORIZATION_PERMISSION_DENIED, media_invalid, MEDIA_EXPIRED, spotlight_rejected, 401, 429. | 138 |

Editor note: character counts were measured with a script on 2026-11-12 [measured]; re-count after any edit. The X title keeps "(Twitter)"
because the network's `name` is "X (Twitter)" and searchers still type "twitter api error".

---

## 2. Hero

**H1:** `{Name} API error codes and how to fix them`

**Date line (small, under the H1):** `Updated 12 November 2026. Generated from the code Siar uses to read {Name}'s errors.`

**Subhead (the answer, per network, table 2a).** Every subhead says, in under 60 words: the shape of the network's errors,
the codes on the page with plain names, and that each entry has the fix.

**Status line (only for networks not open today, directly under the subhead, exact wording from messaging §9):**

| Network | Status line |
|---|---|
| LinkedIn | LinkedIn: personal profiles today; company pages open after LinkedIn grants page access. |
| TikTok | TikTok: built, opening after TikTok approves Siar. This page is a reference for any developer using TikTok's Content Posting API. |
| YouTube | YouTube: connect and upload now; public uploads not yet confirmed. |
| Pinterest | Pinterest: connect your account today; publishing Pins opens after Pinterest grants Standard access. |
| Reddit | Reddit: built, not open yet. This page is a reference for any developer using Reddit's API. |
| Snapchat | Snapchat: built, not open yet. This page is a reference for any developer using Snap's Public Profile API. |
| Google Business Profile | Google Business Profile: built, not open yet. This page is a reference for any developer using the Business Profile APIs. |

Open networks (Facebook, Instagram, Threads, X, Bluesky, Mastodon, Discord, Slack) get no status line in the hero.

**Jump line (plain text link list under the subhead, not chips):** `Jump to a code:` followed by every code on the page,
comma-separated, each linking to its anchor. Example (Instagram): Jump to a code: 190, 4, 10, 100, 9004, 36003, 9007,
2207042, 2018278, 551.

**Primary CTA:** none in the hero. The visitor is mid-debug; the first thing under the H1 is the answer.
**CTA band at the foot of the page (section 5):** primary "Start with 20 free posts", secondary "Read how Siar reports
errors" (links `/docs/errors`).

Editor note: drop the kicker "{Name} API" and its side note "errors" (messaging §8: no decorative kicker). The H1
already says it. If the layout needs a kicker, use the network name alone with no side note.

### 2a. Subheads (final), per network

Word counts are mine, counted with a script (whitespace-separated tokens) [measured].

**Facebook (56 words)**
> Facebook Graph API errors arrive as a JSON `error` object with a numeric `code`, often an `error_subcode`, and a
> `message`. 190 means the token is no longer valid, 4, 17, 32 and 613 are rate limits, 10 and 200 missing
> permissions, 368 a policy block and 506 a duplicate post. Each entry below has the fix.

**Instagram (57 words)**
> Instagram API errors use Meta's Graph API format: an `error` object with a `code`, an `error_subcode` and a `message`.
> 190 is an invalid token, 4 a rate limit, 10 a missing permission, 9004 media Meta could not fetch, 36003 a bad aspect
> ratio, and 2207042 the account's 24-hour publishing limit. Find your code below, with the fix.

**Threads (56 words)**
> Threads API errors use Meta's Graph API format: an `error` object with a `code` and a `message`. 190 is an invalid
> token, 4 a rate limit, 10 a missing permission, 9004 media Threads could not fetch, 9007 a container published too
> early, and `THREADS_API__LINK_LIMIT_EXCEEDED` more than five links in a post. Each entry has the fix.

**X (Twitter) (58 words)**
> X API v2 errors come as an HTTP status plus a JSON body with a `title` and `detail`, or an `errors` array. 401 is an
> invalid token, 402 `CreditsDepleted` an empty pay-per-use balance, 403 covers duplicate text, reply rules, length and
> access tier, and 429 is a rate limit. Each of the 13 cases below has the fix.

**LinkedIn (51 words)**
> LinkedIn API errors return an HTTP status and a JSON body with `status`, `serviceErrorCode`, `code` and `message`. 401
> means the member's token is gone, 403 `ACCESS_DENIED` a missing scope or product, 422 a duplicate or empty post, and
> 426 `NONEXISTENT_VERSION` a retired `Linkedin-Version` header. Version 202511 retires on 16 November 2026.

**TikTok (45 words)**
> TikTok's Content Posting API returns an `error.code` string, such as `spam_risk_too_many_posts` (the creator's daily
> post cap) or `unaudited_client_can_only_post_to_private_accounts` (an app TikTok has not audited). The Business API uses
> numbers such as 40001. This page explains 15 codes: what each means and how to fix it.

**YouTube (53 words)**
> YouTube Data API errors return a Google error object: an HTTP status, a `message` and a `reason` such as
> `quotaExceeded`, `uploadLimitExceeded` or `invalidTitle`. Quota resets at midnight Pacific time. Since 2 November 2026,
> uploads from unaudited API projects are no longer forced to private. Each of the 11 cases below has the fix.

**Pinterest (58 words)**
> Pinterest API v5 errors return an HTTP status with a JSON `code` and `message`; the status tells you the category. 401
> is an invalid token, 403 a missing scope or Trial access (which cannot create public Pins), 404 a board or Pin that
> doesn't exist, and 429 a rate limit. Each of the 10 cases has the fix.

**Reddit (46 words)**
> Reddit API errors come two ways: HTTP statuses (401, 403, 429), and for submissions an HTTP 200 whose `json.errors`
> holds a code such as `SUBREDDIT_NOTALLOWED`, `SUBMIT_VALIDATION_FLAIR_REQUIRED` or `RATELIMIT`. Check both on every
> call. This page explains 10 codes: what each means and how to fix it.

**Mastodon:** section 9.

**Discord (58 words)**
> Discord API errors return an HTTP status and a JSON body with a numeric `code` and a `message`. 50013 is a missing
> permission, 50001 missing access, 10003 an unknown channel, 50035 an invalid form body (often text over 2,000
> characters), 40005 a file that is too large, and 429 a rate limit with `retry_after`. Each has the fix.

**Slack (48 words)**
> Slack Web API errors usually arrive as HTTP 200 with `"ok": false` and an `error` string such as `not_in_channel`,
> `channel_not_found`, `invalid_auth` or `missing_scope`. Rate limits come as HTTP 429 with a `Retry-After` header. So
> check `ok` on every response. This page explains 10 errors, each with the fix.

**Bluesky (51 words)**
> Bluesky errors return a JSON body with an `error` name and a `message`. `ExpiredToken` means the session token expired
> and was not refreshed, `AuthenticationRequired` a wrong handle or app password, `InvalidRequest` usually text over 300
> graphemes, `BlobTooLarge` an image over 1,000,000 bytes. Each of the 10 errors below has the fix.

**Google Business Profile (52 words)**
> Google Business Profile API errors return a Google error object with an HTTP status, a `status` name and a `message`.
> 403 `SERVICE_DISABLED` means the API is not enabled for your Cloud project, 400 `FAILED_PRECONDITION` an unverified
> location, and 429 a strict per-minute quota. Each of the 10 cases below has the fix.

**Snapchat (51 words)**
> Snapchat Public Profile API errors return an HTTP status and an `error_code` with a display or debug message. 401 is a
> 60-minute token that could not be refreshed, `AUTHORIZATION_PERMISSION_DENIED` an app missing from Snap's allowlist,
> `media_invalid` a video outside Snap's limits, `MEDIA_EXPIRED` media over 24 hours old. Each has the fix.

Editor notes:
- The error-format sentence for each network is taken from the comment above that adapter's `mapError` [code:
  `meta-common.ts` 60, `twitter.ts` 73, `linkedin.ts` 97, `tiktok.ts` 41, `youtube.ts` 52, `pinterest.ts` 35, `reddit.ts`
  38 and 83, `discord.ts` 41, `slack.ts` 39 and 73, `bluesky.ts` 49, `google-business.ts` 56, `snapchat.ts` 67].
- LinkedIn 202511 retirement on 16 November 2026: "The Marketing Version 202511 (Marketing November 2025) will be
  sunset on November 16, 2026" [sourced: https://learn.microsoft.com/en-us/linkedin/marketing/versioning, checked
  2026-11-12]. After 16 November 2026, change the last sentence to "Version 202511 retired on 16 November 2026."
- YouTube's 2 November change: section 6.10.
- Generate the counts ("13 cases", "10 codes") from `errors.length`. Never type them.

---

## 3. The per-code entry (repeats for every code)

### 3a. Pattern

```
<section id="code-{slug}">                      ← slug: code lower-cased, runs of non-alphanumerics → "-", trimmed
  <span id="{old-id}"></span>                   ← today's id, so existing links still land
  <h2>{code} · {short message} · {plain name}</h2>
  <p>{meaning}. {fix}.</p>                      ← the answer: ≤50 words, for any developer, no Siar
  <p><strong>What Siar does with it:</strong> {siar line}</p>
  <p class="msg">{Name}'s message: {full message, verbatim}</p>
  <p>Related: <a href="{topic page}">{query-worded anchor}</a></p>   ← only when the page exists
</section>
```

Rules:
1. **H2.** Three parts joined by " · ": the code exactly as the network sends it, the network's message abridged to at
   most about 60 characters at a word boundary with "…", and a plain name in sentence case that says what happened.
   The plain names and short messages for all 147 codes are in section 7.
2. **The answer paragraph** is the meaning and the fix, written for someone calling the network directly. It never
   mentions Siar. 50 words at most. Section 7 gives a replacement fix wherever today's `fix` talks about Siar.
3. **"What Siar does with it"** is one line, chosen by the error's class (3b) unless section 6 or 7 gives a custom
   line.
4. **The full message box** keeps today's verbatim message. Its label changes from "Message" (mono caps) to plain text
   "{Name}'s message:".
5. **Related link** renders only when the target page is live. The build checks the route exists; a missing page
   renders nothing, never a dead link.
6. **Order on the page:** keep today's order (it follows the adapter list), except that LinkedIn 426, X 402, X 403
   duplicate, Instagram 2207042, YouTube "locked private" and Bluesky `ExpiredToken` move to first place on their pages
   while they are the codes engines are asked about (strike plan §5.5). Revisit in 2027.

### 3b. "What Siar does with it": the standard lines (final wording)

Each code gets one class. The class must match the category the adapter actually assigns when it throws
(`NetworkError` code in `packages/networks/src/adapters/*.ts`), because the line describes runtime behaviour. Section 7
gives my class per code; the engineer confirms each against the adapter's mapping before shipping.

**R (reconnect).** Category `TOKEN_INVALID`.
> **What Siar does with it:** Siar refreshes the token itself where {Name} allows it. If that fails, Siar marks the
> account as needing reconnection and keeps this error on the post. Later posts to the account stop with "Reconnect
> this account, then retry the post." until your customer reconnects through the same connect link.

Evidence: `publisher.ts` line 166 (`markNeedsReconnect` on `TOKEN_INVALID`) and line 106 (the message for later
posts) [code]; refresh per adapter [code].

**W (wait, retried automatically).** Category `RATE_LIMITED` or `NETWORK_UNAVAILABLE`.
> **What Siar does with it:** Siar treats it as temporary and tries again on its own, up to three attempts in all. It
> waits for {Name}'s reset time when Siar can read one from the response, otherwise 30 seconds, then 60. These attempts
> don't use the post's manual retries. If the last attempt fails too, the error stays on the post.

Evidence: `publisher.ts` lines 26 (`AUTO_ATTEMPTS = 3`), 167–172 (delay from `rateLimitResetAt`, else 30 s × 2^n;
comment "they do not use up the 6 manual retries") [code].

**F (fix and retry).** Every other category (`VALIDATION`, `CONTENT_REJECTED`, `DUPLICATE`, `PERMISSION`,
`MEDIA_INVALID`, `NOT_FOUND`, `NOT_SUPPORTED`, `UNKNOWN`).
> **What Siar does with it:** Siar keeps {Name}'s code and message on the post, word for word, marks it "don't retry"
> or "unknown", and still publishes to the other networks in the post. Fix the cause, then call
> `POST /post/{id}/retry`: only the failed networks are sent again, and the retry doesn't count as another post.

Evidence: `errors.ts` `retryability` and `toVerbose()`; `posts.ts` `post.retry` resets only `ERROR` targets; quota rule
"retries do not count against your quota" (`docs/posting.mdx` line 66) [code].

**C (checked before sending).** Only where the adapter's `validate` enforces the same rule at create time.
> **What Siar does with it:** Siar checks this rule when you create the post. A request that breaks it gets a `400` with
> an `issues` entry pointing at the field, before {Name} sees it, so you fix it at create time, not when the post is due.

Verified C codes only: Bluesky `InvalidRequest` (300 graphemes, `bluesky.ts` 539), Threads
`THREADS_API__LINK_LIMIT_EXCEEDED` (`threads.ts` 169), YouTube `400 invalidTitle` (`youtube.ts` 312) and
`400 invalidDescription` (`youtube.ts` 314–315), Slack `msg_too_long` (`slack.ts` 246), Discord `50035` for the
2,000-character text part (`discord.ts` 239), Mastodon 422 for text over 500 characters (`mastodon.ts` 160) [code]. Do
not add C to any other code without reading its adapter's `validate`.

**A (handled automatically)** and **G (a gate on Siar's side)** have custom lines per code in sections 6 and 7.

### 3c. Rule for the abridged message in the H2

Use the network's own message, not Siar's paraphrase. Where today's `message` is a paraphrase or differs from the
network's documented text, section 7 gives the documented text with its source. Placeholders stay as the network
writes them ("{uri}", "urn:li:share:…").

---

## 4. Closing sections (same on every page, after the last code)

### H2: Where to see a {Name} error in Siar

> Read a failed post with `GET /post/{id}`. The `error` field sums it up, `errors` lists the result per network, and
> `errorsVerbose` keeps {Name}'s own code, message and HTTP status, a plain-English message, and a retry verdict:
> `retryable`, `non_retryable` or `unknown`. A signed `post.published` webhook fires when the post has published or
> failed, with each network's result. Fix the cause and retry with `POST /post/{id}/retry`.

Evidence: `errors.ts` `toVerbose()` (`code`, `errorMessage`, `isTransient`, `retryability`, `httpStatus`, `meta`,
`userFacingMessage`); `publisher.ts` lines 227–260 (`post.published` on a final state) [code]. Do not write "fires once
per network": the strike plan §2 row 10 correction applies.

### H2: How Siar handles {Name} errors (the three-line box, messaging §2)

> - **Checked before sending.** A post that breaks a {Name} rule Siar knows fails with a `400` and an `issues` entry, before {Name} sees it.
> - **The network's own words.** If {Name} says no, you get its code and message, the fix on this page, and a verdict: retry, don't retry, or unknown.
> - **Told, not guessed.** A signed `post.published` webhook reports each network's result, retried for about 45 hours if your server doesn't answer.

Then one plain line:
> Siar, a unified social media API, publishes to Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon,
> Discord and Slack today. [See every network's status](/platforms).

Editor note: the open list is the allowed count wording (siar-truth §1a), from the status constant once Wave 0 ships it.

### H2: Error codes for other networks

> The same pattern, for every network Siar is built for: [social media API error codes, by network](/errors). For
> errors from Siar's own API (a `401` for a missing key, a `429` rate limit), see [Siar API errors and status
> codes](/docs/errors).

Until `/errors` ships (C114, W1), render a plain list of the other 14 error pages with anchors "{Name} API error codes"
and keep the `/docs/errors` sentence.

---

## 5. CTA band (replaces the default `Cta` props on these pages)

**Heading:** Write it once. Siar it everywhere.
**Text:** Siar keeps every network's error on the post, in that network's words, with the fix. Try it with 20 free posts. No card.
**Primary CTA:** Start with 20 free posts (sign-up URL)
**Secondary CTA:** Read how Siar reports errors (links `/docs/errors`)

Editor notes:
- Remove the arrow glyph from the primary button (messaging §6: CTAs in words, no arrows).
- The default `Cta` text says "gives you 20 posts"; on these pages the text above replaces it. The component default
  should also change to "20 free posts to try" (siar-truth §3b rule 1), but that is a Wave 0 site-wide fix.

---

## 6. Priority entries, fully written

These are final. They replace the generated entry for the code named. Word counts are for the answer paragraph.

### 6.1 Facebook 190

**H2:** 190 · Error validating access token · the token is no longer valid

> Meta returns code 190 when the access token has expired, been revoked, or was invalidated by a password change or a
> security reset. Read `error_subcode`: 463 is expired, 460 a password change, 458 the app removed. Fix: send the user
> through Facebook Login again and use the new token. (49 words)

**What Siar does with it:** line R.
**Message box:** today's verbatim message.
**Related:** [How long a Facebook Page access token lasts](/facebook-api/page-access-token) (C77, when live).

Source: Meta lists 190 as "Access token has expired" with the action "Get a new access token", and subcodes 458 "The
User has not logged into your app", 460 Password Changed, 463 "Login status or access token has expired, been revoked,
or is otherwise invalid" [sourced: https://developers.facebook.com/docs/graph-api/guides/error-handling/, checked
2026-11-12]. Siar maps 190 to `TOKEN_INVALID` [code: `meta-common.ts` line 71]. Use the same entry on Instagram and
Threads, with "Facebook Login" changed to "Facebook Login or Instagram Login" on Instagram and "Threads login" on
Threads.

### 6.2 Instagram 2207042

**H2:** 2207042 · You reached maximum number of posts… · the 24-hour publishing limit

> Error 2207042 (code 9) means the Instagram account has used its 24-hour publishing allowance. Meta's page says 100
> API-published posts in a moving 24-hour window; carousels count as one. Fix: check `GET /{ig-user-id}/content_publishing_limit`
> before publishing, and post again once the oldest post in the window is 24 hours old. (49 words)

**What Siar does with it:**
> Siar treats it as a rate limit and tries again on its own, up to three attempts in all, then keeps the error on the
> post. Siar also caps posts per Instagram account per day by plan (50 on Starter and Pro, 100 on Business), but posts
> from other tools on the same account count toward Meta's limit too.

**Related:** [Instagram API publishing limit: 100 posts in 24 hours](/instagram-api/publishing-limit) (C68, when live).

Sources: "Instagram accounts are limited to 100 API-published posts within a 24-hour moving period"; "Carousels count as
a single post"; query "`GET /<IG_ID>/content_publishing_limit`". The same page's carousel section says "Accounts are
limited to 50 published posts within a 24-hour period", which contradicts the 100 figure [sourced:
https://developers.facebook.com/docs/instagram-platform/content-publishing/, checked 2026-11-12]. Meta's error-code page
lists 2207042 as code 9, HTTP 400, "You reached maximum number of posts that is allowed to be published by Content
Publishing API", solution "Advise the app's user to try again the following day" [sourced:
https://developers.facebook.com/documentation/instagram-platform/instagram-graph-api/reference/error-codes, checked
2026-11-12]. Siar: `code === 9 && sub === 2207042` → `RATE_LIMITED` [code: `meta-common.ts` line 72]; daily caps
Instagram 10 / 50 / 100 for Free / Pro / Business, Starter uses Pro's caps [code: `plans.ts` lines 81, 90]. Editor: if
the page has room, add one sentence after the answer: "Meta's own page also says 50 in one place; plan for the lower
number if you post carousels heavily." [inferred advice]. Keep it out if the answer would pass 50 words.

### 6.3 X 402 CreditsDepleted

**H2:** 402 CreditsDepleted · Your enrolled account does not have any credits… · the X credit balance is empty

> X returns 402 `CreditsDepleted` when the pay-per-use credit balance behind your developer account is used up. Fix: add credits in the X developer console, then retry. Auto-recharge does not run while the
> balance is zero or below, so the first top-up after that must be manual. (46 words)

**What Siar does with it:**
> With Siar, X usage is paid from your prepaid Siar X credit at X's own USD prices. Siar holds the cost before each X
> call. If your credit is short, the post stops before X is called, with "Not enough X credit. Top up in Billing →
> Credits, then retry." A `credit.exhausted` webhook fires at zero; other networks keep publishing.

**Related:** [X API pricing per post](/x-api) (the hub's credit table, until C87 `/x-api/pricing` is released).

Sources: X's pricing page says "API requests will be blocked until you add credits to cover the negative balance" and
"Auto-recharge does not run while your account balance is zero or negative" [sourced:
https://docs.x.com/x-api/getting-started/pricing, checked 2026-11-12]. X's response-codes page has no 402 row and does
not name `CreditsDepleted` [sourced: https://docs.x.com/x-api/fundamentals/response-codes-and-errors, checked
2026-11-12]; the name and message are what Siar's adapter reads [code: `twitter.ts` line 77]. Siar: hold before the
call, `publisher.ts` line 114 message; `credit.exhausted` description "X actions stop until you top up; other networks
keep publishing" [code: `site/lib/events.ts` line 35]. Wording "at X's own USD prices" per messaging §6 (never "at cost"
in ringgit).

### 6.4 X 403 duplicate content

**H2:** 403 duplicate · You are not allowed to create a Tweet with duplicate content · the same text was just posted

> X rejects a post with 403 when the account has recently posted the same text. X does not publish the time window.
> Fix: change the text, for example add the date, a different link or a line of context, and post again. Don't
> retry the same request unchanged. (48 words)

**What Siar does with it:** line F.
**Related:** [How Siar avoids posting twice](/how-publishing-works#sent-once) (N1, when live).

Sources: the message and the 403 mapping are what Siar's adapter reads (`/duplicate content/i` → `DUPLICATE`) [code:
`twitter.ts` line 81]. X's response-codes page describes 403 only as "Valid auth but no permission for this resource or
action" and has no duplicate rule or window [sourced: https://docs.x.com/x-api/fundamentals/response-codes-and-errors,
checked 2026-11-12]. "X does not publish the time window" is therefore a statement about that page [sourced absence].
The related link helps the reader who hit this from a retry loop; Siar's own guarantee is about not re-sending, and the
page it links to concedes there is no client idempotency key (messaging §3).

### 6.5 LinkedIn 426 NONEXISTENT_VERSION

**H2:** 426 NONEXISTENT_VERSION · Requested version … is not active · the API version you sent is retired

> LinkedIn answers HTTP 426 `NONEXISTENT_VERSION` when the `Linkedin-Version` header names a version it has retired.
> Fix: send a supported `YYYYMM` version; the latest is 202610. Version 202511 retires on 16 November 2026, and each
> version lasts at least one year. A missing header returns 400 `VERSION_MISSING` instead. (47 words)

**What Siar does with it:**
> Siar sends version 202609, so posts through Siar are not affected by the 202511 retirement. If Siar's version ever
> retires, the post says "Siar is using a LinkedIn API version that LinkedIn has retired. This needs a Siar update."
> There is nothing to change per post.

**Related:** [LinkedIn API changes, dated](/network-changes) (N2, when live) and [Post to LinkedIn via API](/linkedin-api).

Sources: "The Marketing Version 202511 (Marketing November 2025) will be sunset on November 16, 2026"; latest version
"October 2026 | 202610"; "supported for a minimum of one (1) year"; "An error response is returned when the version
header is deprecated" [sourced: https://learn.microsoft.com/en-us/linkedin/marketing/versioning, checked 2026-11-12].
The 426 body `{"status": 426, "code": "NONEXISTENT_VERSION", "message": "Requested version yyyymmdd is not active"}` and
400 `VERSION_MISSING` [sourced: learn.microsoft.com/en-us/linkedin/marketing/error-responses, checked 2026-11-12 by the
strike plan §2 row 6]. Siar `LINKEDIN_VERSION = '202609'` [code: `linkedin.ts` line 38]; the user-facing message
[code: line 103]. After 16 November 2026 change "retires on" to "retired on". Today's message example "Requested version
20230101 is not active" stays in the message box. Change the meaning text from "The LinkedIn-Version Siar sends has
been retired" (Siar-centred) to the answer above.

### 6.6 LinkedIn 422 duplicate

**H2:** 422 duplicate · Content is a duplicate of urn:li:share:… · the same post text was just used

> LinkedIn returns 422 when the same author has recently posted the same commentary; the message names the earlier
> share's URN. Fix: change the text and post again. If that URN is the post you meant to publish, it is already live,
> so don't post it again. (46 words)

**What Siar does with it:** line F.

Source: Siar's adapter maps 409, and 422 with "duplicate" in the message, to `DUPLICATE` [code: `linkedin.ts` line 106].
LinkedIn's own description of this 422 was not re-read today [unverified]; the meaning is Siar's reading of the
message. Targets prompt p041.

### 6.7 TikTok spam_risk_too_many_posts

**H2:** spam_risk_too_many_posts · The daily post cap from the API is reached… · the creator hit the daily post cap

> TikTok returns 403 `spam_risk_too_many_posts` when a creator account has reached its daily cap for posts made through
> the API. TikTok says the cap varies by creator, typically around 15 posts a day. Fix: stop posting to that account for
> the day and spread posts out. Retrying sooner fails again. (49 words)

**What Siar does with it:**
> Reference only: TikTok: built, opening after TikTok approves Siar. Siar's TikTok adapter treats this code as a rate
> limit and applies Siar's own daily cap per TikTok account, listed on [pricing](/pricing).

Sources: "The daily post cap from the API is reached for the current user", HTTP 403 [sourced:
https://developers.tiktok.com/doc/content-posting-api-reference-direct-post, checked 2026-11-12]; "The upper limit may
vary among creators (typically around 15 posts per day/ creator account)" [sourced:
https://developers.tiktok.com/doc/content-sharing-guidelines, checked 2026-11-12]. Siar maps it to `RATE_LIMITED`
[code: `tiktok.ts` line 46]; TikTok daily caps by plan [code: `plans.ts` line 81]. Replace today's paraphrased message
"The daily post cap for this creator was reached." with TikTok's text. Targets prompt p039.

### 6.8 TikTok unaudited_client_can_only_post_to_private_accounts

**H2:** unaudited_client_can_only_post_to_private_accounts · Unaudited clients can only post to a private account · the app hasn't passed TikTok's audit

> TikTok blocks the post at `/publish/video/init/` because the app has not passed TikTok's audit. Until it does, posts
> must use `SELF_ONLY` privacy, the creator's account must be private, and at most 5 users can post in 24 hours. Fix:
> post `SELF_ONLY` to a private account, and apply for TikTok's audit. (50 words)

**What Siar does with it:**
> This is the reason TikTok is not open in Siar yet. TikTok rejected Siar's audit on 20 October 2026, so Siar runs on
> sandbox keys. TikTok: built, opening after TikTok approves Siar.

**Related:** [Every network's status, with dates](/platforms) (later `/platforms/approvals`, C04).

Sources: "Unaudited clients can only post to a private account. The publish attempt will be blocked when calling
/publish/video/init/." HTTP 403 [sourced: developers.tiktok.com/doc/content-posting-api-reference-direct-post, checked
2026-11-12]; "Unaudited API Clients can allow up to 5 users to post in a 24 hour window", accounts "must be set to
private", "only post contents in `SELF_ONLY` viewership" [sourced: developers.tiktok.com/doc/content-sharing-guidelines,
checked 2026-11-12]. Audit rejected 2026-10-20, sandbox keys [doc: `docs/approvals/tiktok.md`, siar-truth §2]. Editor:
the "rejected" date is a Siar fact the strike plan allows on `/platforms/approvals` with Fakhrul's TikTok-row wording
(strike plan §5.3, gate "TikTok row"). If Fakhrul has not cleared that wording when this ships, use only the second
sentence's status line: "TikTok: built, opening after TikTok approves Siar." Today's `message` "Please review our
integration guidelines…" may be the live API text; keep it in the message box and use TikTok's documented description
in the H2.

### 6.9 Bluesky ExpiredToken

**H2:** ExpiredToken · Token has expired · the session token expired

> `ExpiredToken` means the short-lived access token for the Bluesky session has expired. Fix: call
> `com.atproto.server.refreshSession` with the refresh token, then repeat the request with the new access token. If the
> refresh also fails (the refresh token expired or the app password was revoked), sign in again with
> `createSession` or OAuth. (50 words)

**What Siar does with it:** line R.
**Related:** [Post to Bluesky via API](/bluesky-api/how-to-post) (C107, when live), else [Bluesky API](/bluesky-api).

Sources: "Most requests should be authenticated using an access JWT, but the validity lifetime for these tokens is short";
a new access JWT "can be requested by hitting the `com.atproto.server.refreshSession` endpoint" with the refresh JWT
[sourced: https://atproto.com/specs/xrpc, checked 2026-11-12]. The spec does not name `ExpiredToken`; the name and
message are what the PDS returns and Siar's adapter reads [code: `bluesky.ts` lines 49, 60]. Today's meaning text
("The session could not be refreshed…") describes the case Siar shows after its own refresh failed; the answer above
covers both cases for a developer calling Bluesky directly. Targets prompt p040.

### 6.10 YouTube "locked private" (rewritten for Google's 2 November 2026 change)

**H2:** privacyStatus private · privacyStatus came back private although public was requested · the video was set to private

New anchor `#code-privacystatus-private`; keep `#locked-private` as the old id.

> Until 2 November 2026, YouTube forced every upload from an API project that had not passed its audit to private.
> Google lifted that rule: such uploads are no longer restricted to private. If a new upload still comes back private,
> check the channel's default upload settings and set `status.privacyStatus` explicitly. (50 words)

**What Siar does with it:**
> Siar sends the visibility you ask for. If YouTube returns private anyway, Siar adds a warning to the post instead of
> reporting it as public. YouTube: connect and upload now; public uploads not yet confirmed.

**Related:** [YouTube API audit: what changed on 2 November 2026](/youtube-api/audit) (C98, when live).

Sources: "Videos uploaded through the videos.insert method from unverified API projects are no longer restricted to
private viewing mode"; if `status.privacyStatus` is not specified the video "defaults to public"; "Certain uploads
might default to private based on creator account settings" [sourced:
https://developers.google.com/youtube/v3/revision_history, entry of 2 November 2026, checked 2026-11-12]. Siar's
behaviour: `lockedPrivate` warning only when public or unlisted was requested and private came back [code:
`youtube.ts` lines 382–384]. Status line per strike plan §2 row 7 and messaging §9.

Code changes that go with this entry (engineer, not copy):
- `youtube.ts` line 264: replace the entry with code `privacyStatus private`, message unchanged, meaning "Until 2
  November 2026 YouTube forced uploads from unaudited API projects to private. Google lifted that rule. A private result
  now usually comes from the channel's own default settings.", fix "Check the channel's default upload settings and
  set status.privacyStatus explicitly."
- `youtube.ts` line 384 warning: replace "Uploads from an API project that has not passed YouTube's compliance audit
  are locked private." with "Check the channel's default upload visibility in YouTube Studio."
- Do not tell readers whether videos uploaded before 2 November can now be made public: Google's entry does not say
  [sourced absence]. If asked, the honest line is "Google's 2 November entry covers new uploads; it does not say
  whether earlier uploads can be switched to public."

### 6.11 YouTube 403 quotaExceeded

**H2:** 403 quotaExceeded · The request cannot be completed because you have exceeded your quota · the project's daily quota is spent

> The Google Cloud project behind the app has spent its daily YouTube Data API quota. Uploads draw on their own
> `videos.insert` bucket; most other calls share 10,000 units a day. Fix: wait for the reset at midnight Pacific time,
> or apply for a quota extension for the project. (48 words)

**What Siar does with it:**
> Siar waits until the quota resets at midnight Pacific time and then tries again on its own, up to three attempts in
> all. The post shows "The YouTube API quota for this project is used up for today. It resets at midnight Pacific time."

**Related:** [YouTube Data API quota, explained](/youtube-api/quota) (C97, when live).

Sources: 10,000 units a day and a separate `videos.insert` bucket [sourced: developers.google.com/youtube/v3/getting-started
and /docs/videos/insert, via `per-network.md` §1, checked 2026-11-12]. Siar: `quotaExceeded` → `RATE_LIMITED` with
`rateLimitResetAt: next8amUtc()` and the user-facing message [code: `youtube.ts` lines 65–66]. Never print "100 uploads
a day" here (strike plan §2 row 7).

### 6.12 Facebook 506

**H2:** 506 · (#506) Duplicate status message · the same text was just posted to this Page

> Meta returns 506 when the Page has just published the same text. Fix: change the text, or wait before posting it
> again. If you hit it while retrying, check the Page first: the earlier attempt may already be live. (39 words)

**What Siar does with it:** line F.

Source: Siar maps 506 to `DUPLICATE` [code: `meta-common.ts` line 74]. Meta's error-handling page does not list 506
[sourced absence: developers.facebook.com/docs/graph-api/guides/error-handling, checked 2026-11-12]; the meaning is
Siar's reading of the message.

---

## 7. All 147 codes: H2 text, developer fix, class, related page

How to read the tables:
- **H2 tail** is what follows the code in the H2: "{short message} · {plain name}".
- **Fix (generic)** replaces today's `fix` only where today's text talks about Siar or is Siar-specific. "keep" means
  today's `fix` already works for any developer.
- **Class** picks the "What Siar does with it" line (3b). Custom lines are written out.
- **Related** is the topic page to link once it is live; "—" means none.
- A **message note** gives the network's documented text where it differs from today's `message`.

The class column is my reading of each adapter's mapping. I verified the mappings I cite in sections 3b and 6; the rest
are [inferred] from the meaning text and must be checked against the adapter before shipping.

### Facebook (12)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 190 | Error validating access token · the token is no longer valid | Section 6.1 | R | /facebook-api/page-access-token |
| 4 | (#4) Application request limit reached · the app hit its rate limit | Wait for the window to reset, then retry. Check `X-App-Usage` and lower your call volume. | W | — |
| 17 | (#17) User request limit reached · this user made too many calls | keep | W | — |
| 32 | (#32) Page request limit reached · the Page hit its rate limit | keep | W | — |
| 613 | (#613) Calls to this api have exceeded the rate limit · an endpoint rate limit was hit | keep | W | — |
| 10 | (#10) Application does not have permission for this action · a permission is missing | Ask the user to log in again and grant every requested permission; check the app has Advanced Access for it. | F | /facebook-api/meta-app-review |
| 200 | (#200) Requires … publish_pages as an admin · the user can't post to this Page | keep | F | /facebook-api/meta-app-review |
| 100 | (#100) Invalid parameter · a field is missing or wrong | keep | F | — |
| 368 | The action attempted has been deemed abusive… · Meta has blocked this action for now | keep | F | — |
| 506 | (#506) Duplicate status message · the same text was just posted to this Page | Section 6.12 | F | — |
| 2018278 | (#10) This message is sent outside of allowed window · the 24-hour reply window has closed | keep | F | — |
| 551 | This person isn't available right now · the person can't receive messages | "Nothing to fix on your side: the person blocked the Page or turned off messages." | F | — |

Message note, 4 and 17: Meta's page names them "API Too Many Calls" and "API User Too Many Calls" with "Temporary issue
due to throttling. Wait and retry the operation, or examine your API request volume." [sourced: Graph API
error-handling page, checked 2026-11-12]. `X-App-Usage` in the fix for 4 is [unverified] on that page today; drop it
if not confirmed when shipping.

### Instagram (10)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 190 | Error validating access token · the token is no longer valid | Section 6.1 (Instagram wording) | R | — |
| 4 | (#4) Application request limit reached · the app hit its rate limit | As Facebook 4 | W | — |
| 10 | (#10) Application does not have permission for this action · a permission is missing | As Facebook 10 | F | /facebook-api/meta-app-review |
| 100 | (#100) Invalid parameter · a field is missing or wrong | keep | F | — |
| 9004 | The media could not be fetched from this uri · Meta couldn't download the media | Make sure the media URL is public, returns the file directly (no redirect to a login page) and is a JPEG/PNG image or MP4/MOV video. | F | — |
| 36003 | The submitted image with aspect ratio … cannot be published · the image shape isn't allowed | Crop the image to between 4:5 and 1.91:1. | F | — |
| 9007 | The media is not ready for publishing, please wait for a moment · the container isn't finished | Poll the container's `status_code` and publish only when it is `FINISHED`. | A | — |
| 2207042 | You reached maximum number of posts… · the 24-hour publishing limit | Section 6.2 | W (custom, 6.2) | /instagram-api/publishing-limit |
| 2018278 | (#10) This message is sent outside of allowed window · the 24-hour reply window has closed | keep | F | — |
| 551 | This person isn't available right now · the person can't receive messages | As Facebook 551 | F | — |

Message notes [sourced: Instagram error-codes page, checked 2026-11-12]: 9004 (subcode 2207052) "The media could not
be fetched from this uri: {uri}"; 36003 (subcode 2207009) "The submitted image with aspect ratio {submitted-ratio} cannot
be published."; 9007 "The media is not ready for publishing, please wait for a moment". Today's `message` values for
these three ("Only photo or video can be accepted as media type.", "The aspect ratio is not supported.", "Media ID is
not available") should move to the documented text in the shared Meta list (`meta-common.ts` lines 98 onward), keeping
the old text in the message box only if it is what the API returned in Siar's tests [unverified which].

Custom line for 9007 (A):
> **What Siar does with it:** Siar waits for the container to reach `FINISHED` before publishing and retries if Meta
> still answers 9007, so you should not see this one in Siar.

### Threads (8)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 190 | Error validating access token · the token is no longer valid | Section 6.1 (Threads wording) | R | — |
| 4 | (#4) Application request limit reached · the app hit its rate limit | As Facebook 4 | W | — |
| 10 | (#10) Application does not have permission for this action · a permission is missing | As Facebook 10 | F | /facebook-api/meta-app-review |
| 100 | (#100) Invalid parameter · a field is missing or wrong | keep | F | — |
| 368 | The action attempted has been deemed abusive… · Meta has blocked this action for now | keep | F | — |
| 9004 | Only photo or video can be accepted as media type · Threads couldn't read the media | As Instagram 9004 | F | — |
| 9007 | Media ID is not available · the container isn't finished | As Instagram 9007 | A (as Instagram) | — |
| THREADS_API__LINK_LIMIT_EXCEEDED | THREADS_API__LINK_LIMIT_EXCEEDED · more than five links in one post | keep | C | /threads-api/how-to-post |

Threads messages were not re-checked against a Threads page today [unverified]; keep today's text.

### X (Twitter) (13)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 401 | Unauthorized · the token is invalid or revoked | Refresh the OAuth 2.0 token with the refresh token; if that fails, have the user authorize the app again. | R | — |
| 402 CreditsDepleted | Your enrolled account does not have any credits… · the X credit balance is empty | Section 6.3 | custom, 6.3 | /x-api |
| 403 duplicate | You are not allowed to create a Tweet with duplicate content · the same text was just posted | Section 6.4 | F | /how-publishing-works#sent-once |
| 403 reply | Reply to this Tweet is not allowed… · replies are limited to conversations you're part of | keep | F | — |
| 403 video | This user is not allowed to post a video longer than 20 minutes · the video is too long for this account | keep | F | — |
| 403 too long | Your Tweet text is too long · the text is over 280 characters | Shorten it to 280 weighted characters (links count 23, emoji 2), or split it into a thread. | F | — |
| 403 client-not-enrolled | Client Forbidden · the app isn't attached to a project | keep | G | — |
| 403 quote | Quoting is not available on this access tier · your access level can't quote | keep | F | — |
| 400 invalid-request | One or more parameters to your request was invalid · a field failed X's checks | keep | F | — |
| 400 media | Your media IDs are invalid · the media id expired or failed | Upload the media again and use the new id within 24 hours. | F | — |
| 404 | Could not find tweet with id · the post doesn't exist or is protected | keep | F | — |
| 429 | Too Many Requests · a rate-limit window is used up | Wait until the `x-rate-limit-reset` time (a Unix timestamp), then retry. | W | — |
| 503 | Service Unavailable · X is overloaded | Retry with backoff. | W | — |

`x-rate-limit-reset` is "Unix timestamp when window resets" [sourced: docs.x.com response-codes page, checked
2026-11-12]. Siar reads it [code: `http.ts` `resetFrom`].

Custom line for 403 client-not-enrolled (G):
> **What Siar does with it:** with Siar, X calls run through Siar's own X app, so this error would mean a problem on
> Siar's side, not yours. The post keeps the message so you can report it.

The 403 too long fix: Siar has `tweetStorm` to split text into a thread [code: `twitter.ts` line 171]. Add as a custom
F line: "Siar keeps the error on the post. To have Siar split long text into a numbered thread, set `tweetStorm: true`."

### LinkedIn (10)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 401 65601 | The token used in the request has been revoked by the user · the member's token is gone | Send the member through LinkedIn sign-in again. Access tokens last 60 days; refresh tokens only exist for apps LinkedIn has approved for them. | R | — |
| 403 ACCESS_DENIED | Not enough permissions to access: partnerApiPostsExternal.CREATE · a scope or API product is missing | Ask the member to sign in again and accept every scope. Posting as a company page needs the Community Management API on your app. | F | /linkedin-api/community-management-api |
| 422 duplicate | Content is a duplicate of urn:li:share:… · the same post text was just used | Section 6.6 | F | — |
| 422 empty | Content cannot be empty · the post has no text | keep | F | — |
| 429 | Resource level throttle APPLICATION DAY limit… · the app's daily quota is used up | Wait for the reset at midnight UTC, then retry. | W | — |
| 426 NONEXISTENT_VERSION | Requested version … is not active · the API version you sent is retired | Section 6.5 | custom, 6.5 | /network-changes |
| 400 media | Media asset urn:li:image:… is not available · the uploaded file isn't ready or is gone | Wait until the asset's status is `AVAILABLE`; if it never gets there, upload it again. | F | — |
| 400 commentary | Unpermitted fields present in REQUEST_BODY · a field combination isn't allowed | keep | F | — |
| 404 | Not Found · the post doesn't exist or isn't yours | keep | F | — |
| truncated text | (no error; the post is cut off at the first unescaped ( or [) · reserved characters weren't escaped | Escape LinkedIn's reserved characters in `commentary` (for example `(`, `)`, `[`, `]`) with a backslash. | A | — |

Custom line for "truncated text" (A):
> **What Siar does with it:** Siar escapes reserved characters for you. For @mentions, use Siar's mentions builder so
> the mention isn't escaped as text.

Editor: the 60-day token life and "refresh tokens only for approved apps" are Siar's adapter reading [code:
`linkedin.ts` errorReference line 356]; LinkedIn's own OAuth page was not re-read today [unverified]. The list of
reserved characters in the "truncated text" fix is partial on purpose; LinkedIn's full list was not re-read today
[unverified]. Do not add "LinkedIn company pages" claims here: the Related link is to the guide page (C91), which
carries the status "company pages open after LinkedIn grants page access".

### TikTok (15) — reference page

Every TikTok Siar line starts with the status sentence "TikTok: built, opening after TikTok approves Siar." The class
lines in 3b are not used on this page, because no Siar customer can post to TikTok today.

| Code | H2 tail | Fix (generic) | Related |
|---|---|---|---|
| unaudited_client_can_only_post_to_private_accounts | Unaudited clients can only post to a private account · the app hasn't passed TikTok's audit | Section 6.8 | /platforms |
| privacy_level_option_mismatch | privacy_level is not one of the creator's privacy_level_options · that privacy level isn't allowed for this creator | Call `creator_info` first and use one of the `privacy_level_options` it returns. | — |
| spam_risk_too_many_posts | The daily post cap from the API is reached… · the creator hit the daily post cap | Section 6.7 | — |
| spam_risk_too_many_pending_share | Too many pending shares in the inbox · too many drafts are waiting | keep ("Have the creator post or delete pending drafts in the TikTok app.") | — |
| spam_risk_user_banned_from_posting | The user is banned from posting · TikTok has blocked this creator | keep | — |
| access_token_invalid | The access token is invalid or not found in the request · the token expired or was revoked | Refresh the token with the refresh token; if that fails, have the creator authorize the app again. | — |
| scope_not_authorized | The user did not authorize the scope required… · a permission wasn't granted | Have the creator authorize again and approve `video.publish` or `video.upload`. | — |
| url_ownership_unverified | The URL prefix is not verified for this app · the media domain isn't verified | keep | — |
| rate_limit_exceeded | API rate limit exceeded · too many requests for this token | Each user token allows 6 requests a minute on these endpoints; wait a minute, then retry. | — |
| duration_check_failed | Video duration exceeds the creator's max_video_post_duration_sec · the video is too long for this creator | Read `max_video_post_duration_sec` from `creator_info` and trim the video to fit. | — |
| file_format_check_failed | Unsupported media format · TikTok can't use this file | keep | — |
| picture_size_check_failed | Picture size check failed · the photo is too large | keep | — |
| reached_active_user_cap | The daily quota for active publishing users from your client is reached · the app hit its daily cap on posting users | Wait for the next day. The cap rises after the app passes TikTok's audit. | /platforms |
| 40001 | No permission to operate this business account · the Business API token lacks access | Authorize again with the business scopes, on a TikTok business account. | — |
| 40105 | Access token is invalid or expired · the Business API token expired | Refresh the token; if that fails, authorize again. | — |

Sources: rate limit "Each user access_token is limited to 6 requests per minute"; `reached_active_user_cap` HTTP 403
"The daily quota for active publishing users from your client is reached" [sourced:
developers.tiktok.com/doc/content-posting-api-reference-direct-post, checked 2026-11-12]. Today's `rate_limit_exceeded`
meaning says "6/min for init"; the sourced line applies per user token. Do not mention TikTok comments anywhere on this
page (siar-truth §2): 40001's fix must not say "approve comment scopes" as today's text does.

Siar line for every TikTok code (one sentence, final):
> **What Siar does with it:** TikTok: built, opening after TikTok approves Siar. Siar's TikTok adapter keeps this code
> and message verbatim, so the code you'd see in Siar is the one on this page.

Use the custom lines in 6.7 and 6.8 for those two codes.

### YouTube (11)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 401 authError | Invalid Credentials · the token expired or access was revoked | Refresh the token with the refresh token; if that fails, have the user sign in with Google again. | R | — |
| 403 quotaExceeded | …you have exceeded your quota · the project's daily quota is spent | Section 6.11 | custom, 6.11 | /youtube-api/quota |
| 400 uploadLimitExceeded | The user has exceeded the number of videos they may upload · the channel hit its daily upload limit | keep | W | /youtube-api/quota |
| 403 forbidden (thumbnails) | …doesn't have permissions to upload and set custom video thumbnails · custom thumbnails need a verified channel | keep | F | — |
| 401 youtubeSignupRequired | Unauthorized · the Google account has no YouTube channel | Create a channel at youtube.com, then sign in again. | R | — |
| 400 invalidTitle | …invalid or empty video title · the title is empty, too long or has < > | keep | C | — |
| 400 invalidDescription | …invalid video description · the description is too long or has < > | keep | C | — |
| 409 videoAlreadyInPlaylist | Video already in playlist · it's already there | keep | F | — |
| 403 commentsDisabled | …has disabled comments · comments are off on this video | keep | F | — |
| uploadStatus rejected | rejectionReason: duplicate \| copyright \| claim \| length \| termsOfUse … · YouTube refused the video after processing | Read `status.rejectionReason`; fix the content and upload again. | F | — |
| privacyStatus private | privacyStatus came back private although public was requested · the video was set to private | Section 6.10 | custom, 6.10 | /youtube-api/audit |

Status line under the YouTube intro (section 2) covers the page. `uploadLimitExceeded` maps to `RATE_LIMITED` [code:
`youtube.ts` line 68], so W is correct, though a daily limit will usually outlast Siar's three attempts; the W line's
last sentence covers that.

### Pinterest (10)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 401 | Authentication failed · the token expired or the app was removed | Refresh the token; if that fails, have the user authorize the app again. | R | — |
| 403 trial | Your application consumer type is not supported / Trial access · the app only has Trial access | keep | G | /pinterest-api/access |
| 403 scope | Not authorized to access this resource · a scope is missing | Have the user authorize again and accept every scope (for example `boards:write`, `pins:write`). | F | — |
| 404 board | Board not found · no board with that name | Use an existing board's id or exact name, or create the board first. | F | — |
| 404 pin | Pin not found · the Pin was deleted or isn't yours | keep | F | — |
| 400 image | Invalid image URL / the image could not be fetched · Pinterest couldn't download the image | Use a public JPEG or PNG URL under 20 MB. | F | — |
| 400 params | Invalid parameters · a field failed Pinterest's checks | keep | F | — |
| 400 video | The media is not ready / cover image is required · the video isn't processed or has no cover | Wait until the media status is `succeeded` before creating the Pin, and send a cover image. | F | — |
| 429 | You have exceeded your rate limit · the rate limit is used up | Wait for the reset, then retry; spread Pin creation out. | W | — |
| 5xx | Internal Server Error · Pinterest is having trouble | Retry with backoff. | W | — |

Custom line for 403 trial (G):
> **What Siar does with it:** this is why Pinterest publishing isn't open in Siar yet. Pinterest: connect your account
> today; publishing Pins opens after Pinterest grants Standard access.

Evidence: adapter message "The Pinterest app only has Trial access, so it cannot create public pins yet" [code:
`pinterest.ts` line 42]; trial since 2026-10-21 [doc: `docs/approvals/pinterest.md`]. `pins:write` in the 403 scope fix
is [inferred] from Pinterest's scope naming; today's text names `boards:write` and `user_accounts:read`. Keep only
today's two if not confirmed. Do not add "Pinterest API method not found" (C104's primary) as a code unless the adapter
or Pinterest's docs show it [unverified]; the page can still rank for it through the 404 entries' text only if the
phrase is true.

### Reddit (10) — reference page (built, not open yet)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 401 | Unauthorized · the token expired or was revoked | Refresh the token; if that fails, have the user authorize the app again. | R | — |
| 403 private | Forbidden · the subreddit is private, quarantined or banned for this account | keep | F | — |
| 429 / RATELIMIT | you are doing that too much. try again in 9 minutes. · the account is posting too often | Wait the time named in the message. New and low-karma accounts get longer waits. | W | — |
| SUBREDDIT_NOEXIST | that subreddit doesn't exist · there's no subreddit by that name | keep | F | — |
| SUBREDDIT_NOTALLOWED | you aren't allowed to post there. · the subreddit doesn't accept posts from this account | keep | F | — |
| SUBMIT_VALIDATION_FLAIR_REQUIRED | Your post must contain post flair. · the subreddit requires a flair | Get the subreddit's flair templates and send a `flair_id`. | F | — |
| BAD_FLAIR_TEMPLATE_ID | invalid flair template id · that flair doesn't belong to this subreddit | Use a flair template id from this subreddit that isn't mod-only. | F | — |
| NO_LINKS / NO_SELFS | this subreddit only allows text posts · the subreddit doesn't allow this post type | keep | F | — |
| TOO_LONG | this is too long (max: 300) · the title or text is too long | keep | F | — |
| invalid_grant | invalid_grant · the refresh token is no longer valid | keep ("Have the user authorize the app again.") | R | — |

Siar line on this page: the class lines, each prefixed "Reference only: Reddit: built, not open yet." Siar's flair
endpoint (`GET /misc/reddit/subreddit-flairs`) goes in the Siar line of the two flair codes, not in the fix.

### Discord (9)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 50013 | Missing Permissions · the bot lacks a permission in that channel | Give the bot's role View Channel, Send Messages and Attach Files in the channel (and Manage Webhooks if it posts through webhooks). | F | — |
| 50001 | Missing Access · the bot can't see the channel or server | keep | F | — |
| 10003 | Unknown Channel · the channel was deleted | keep ("Choose another channel.") | F | — |
| 10015 | Unknown Webhook · the webhook was deleted | Create a new webhook for the channel and retry. | A | — |
| 10008 | Unknown Message · the message is already deleted | keep | F | — |
| 50035 | Invalid Form Body · a field was rejected | keep | C (text) / F | — |
| 40005 | Request entity too large · the file is over the upload limit | keep | F | — |
| 429 | You are being rate limited. · the rate limit is used up | Wait `retry_after` seconds, then retry. | W | /discord-api/schedule-messages |
| 401 | 401: Unauthorized · the bot token is wrong or was reset | Check the bot token in the Discord developer portal and update it where your app stores it. | G | — |

Custom lines:
- 10015 (A): "**What Siar does with it:** Siar creates a new webhook in the channel and retries once, so you should not need to do anything."
- 50013 (F + note): append "For Siar, grant these to the Siar bot's role." to the F line.
- 401 (G): "**What Siar does with it:** with Siar, posts go through Siar's own Discord bot, so this error would mean a problem on Siar's side, not yours. The post keeps the message so you can report it."

### Slack (10)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| not_in_channel | not_in_channel · the app isn't in the channel | Invite the app to the channel (`/invite @YourApp`), or add `chat:write.public` for public channels. | F | — |
| channel_not_found | channel_not_found · the channel doesn't exist or the app can't see it | keep | F | — |
| is_archived | is_archived · the channel is archived | keep | F | — |
| invalid_auth | invalid_auth · the token is invalid | Reinstall the app to the workspace for a new token. | R | — |
| token_revoked | token_revoked · an admin removed the app | Reinstall the app to the workspace. | R | — |
| missing_scope | missing_scope (needs chat:write.customize) · the install lacks a scope | Reinstall the app with the scope the error names. | F | — |
| msg_too_long | msg_too_long · the text is over 40,000 characters | keep | C | — |
| cant_delete_message | cant_delete_message · the app can't delete this message | keep | F | — |
| edit_window_closed | edit_window_closed · the edit window has passed | keep | F | — |
| ratelimited | ratelimited · too many messages too fast | Wait for the `Retry-After` seconds, then retry. `chat.postMessage` allows about one message per second per channel. | W | /slack-api/rate-limits |

For Siar, the not_in_channel F line ends "In Slack, type `/invite @Siar` in the channel." [code: today's fix text].

### Bluesky (10)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| AuthenticationRequired | Invalid identifier or password · the handle or app password is wrong | Create a new app password in Bluesky (Settings, Privacy and security, App passwords) and sign in again. | R | — |
| ExpiredToken | Token has expired · the session token expired | Section 6.9 | R | /bluesky-api/how-to-post |
| AccountTakedown | Account has been taken down · moderation took the account down | keep | F | — |
| InvalidRequest | Record/text must not be longer than 300 graphemes · the text is too long | keep | C | — |
| BlobTooLarge | This file is too large · the image or video is over the limit | Keep images under 1,000,000 bytes; compress or resize. | F | — |
| InvalidMimeType | Unsupported or mismatched media type · the file type is wrong | keep | F | — |
| RateLimitExceeded | Rate Limit Exceeded · a PDS limit was hit | Wait until the reset time in the response headers, then retry. | W | — |
| use_dpop_nonce | Authorization server requires nonce in DPoP proof · send the server's new nonce | Repeat the request once with the nonce from the `DPoP-Nonce` header. | A | — |
| invalid_grant | refresh token is invalid, expired or revoked · the OAuth grant is gone | Run the OAuth flow again. | R | — |
| InvalidSwap | Record already exists · the record was already written | Nothing to fix: the record exists. | A | — |

Custom lines:
- use_dpop_nonce (A): "**What Siar does with it:** Siar retries once with the new nonce automatically."
- InvalidSwap (A): "**What Siar does with it:** Siar uses this to detect a publish that already happened and treats the post as sent, so it isn't posted twice."
Editor: Bluesky rate-limit numbers in today's meaning (1,666 an hour, 11,666 a day) come from `per-network.md` §1
[sourced there]; the rate-limit page now redirects to bsky.network [measured, 308] and was not re-read today.

### Google Business Profile (10) — reference page (built, not open yet)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 401 UNAUTHENTICATED | Request had invalid authentication credentials · the token expired or was revoked | Refresh the token; if that fails, have the user sign in with Google again. | R | — |
| 403 SERVICE_DISABLED | …has not been used in project … before or it is disabled · the API isn't enabled for your project | keep | G | /google-business-profile-api/access |
| 403 ACCESS_TOKEN_SCOPE_INSUFFICIENT | Request had insufficient authentication scopes · `business.manage` wasn't granted | keep | F | — |
| 429 RATE_LIMIT_EXCEEDED | Quota exceeded for quota metric 'Requests'… · a per-minute quota is used up | Wait a minute and retry; cache account and location lists instead of fetching them again. | W | — |
| 400 FAILED_PRECONDITION | Location is not verified · the location needs verifying | keep | F | — |
| 400 INVALID_ARGUMENT (summary) | Request contains an invalid argument · a post field failed Google's checks | keep | F | — |
| 400 INVALID_ARGUMENT (media) | The photo could not be fetched or is too small · Google couldn't use the photo | keep | F | — |
| 404 NOT_FOUND | Requested entity was not found · the location or post is gone | Check the location still exists and the user still manages it. | F | — |
| state REJECTED | LocalPost.state = REJECTED · Google removed the post for policy | keep | F | — |
| invalid_grant | Token has been expired or revoked · the refresh token is no longer valid | keep ("Have the user sign in with Google again.") | R | — |

Siar line on this page: class lines prefixed "Reference only: Google Business Profile: built, not open yet." For 403
SERVICE_DISABLED (G): "**What Siar does with it:** Reference only: Google Business Profile: built, not open yet.
This is the error Siar's own project gets today, which is why it isn't open."
Evidence: "the v4 API refuses to enable" [doc: `google.md`, siar-truth §2]. Editor: if Fakhrul prefers not to show this
first-hand line, drop the second sentence.

### Snapchat (9) — reference page (built, not open yet)

| Code | H2 tail | Fix (generic) | Class | Related |
|---|---|---|---|---|
| 401 | Unauthorized / invalid_token · the token expired and couldn't be refreshed | Refresh the 60-minute token; if that fails, have the user authorize again. | R | — |
| AUTHORIZATION_PERMISSION_DENIED | The caller does not have access to this public profile · the app isn't allowlisted, or the user can't post to this profile | keep | G | — |
| 429 | Rate limit exceeded · too many calls | keep | W | — |
| media_invalid | Media does not meet requirements · the video is outside Snap's limits | keep | F | — |
| MEDIA_EXPIRED | The media is more than 24 hours old · the uploaded media expired | Upload the media again and post within 24 hours. | A | — |
| MEDIA_POSTING_ALREADY_IN_PROGRESS | This media is already being posted · an earlier request is still running | Don't retry; the first request finishes on its own. | A | — |
| spotlight_rejected | Spotlight status REJECTED · moderation refused the Spotlight | keep | F | — |
| invalid_grant | invalid_grant · the authorization code or redirect URI is wrong | keep | R | — |
| spotlight_requires_one_video | Spotlight needs exactly one video · Spotlight takes a single video | keep | F | — |

Siar line on this page: class lines prefixed "Reference only: Snapchat: built, not open yet." Custom A lines:
MEDIA_EXPIRED "Siar uploads fresh media on every attempt, so a retry works."; MEDIA_POSTING_ALREADY_IN_PROGRESS "Siar
treats the post as sent and does not retry." AUTHORIZATION_PERMISSION_DENIED (G): "This is the step Siar is waiting on:
allowlisting needs a Snap partner contact." [doc: siar-truth §2, Snapchat row].

Count check: 12 + 10 + 8 + 13 + 10 + 15 + 11 + 10 + 10 + 9 + 10 + 10 + 10 + 9 = 147 [measured: dump of
`NETWORKS[].errors` on 2026-11-12], plus Mastodon's new entries (section 9), which are HTTP statuses, not codes.

---

## 8. FAQ (same four questions on every page, then one per network where it earns a place)

**Should I retry a failed {Name} API request?**
> Only if the error is temporary. Rate limits (429 and {Name}'s own rate-limit codes) and 5xx errors can be retried
> after the reset time. Token, permission, duplicate and content errors fail the same way every time, so fix the cause
> first. Each entry on this page says which kind it is. (51 words)

**Why does the {Name} API reject a request that looks right?**
> Usually because of something outside the request body: an expired token, a permission the user didn't grant, the
> account's daily limit, or text the account posted recently. Read the code and message first, then match it to an
> entry on this page. Validating length and media before sending catches most of the rest. (53 words)

**Does Siar retry failed {Name} posts automatically?**
> For temporary errors, yes: Siar tries up to three times in all, waiting for the network's reset time when it can
> read one. Other errors stay on the post with {Name}'s own code and message. Fix the cause and retry: only the failed
> networks are sent again, and the retry doesn't count as another post. (55 words)

**Will retrying a failed post publish it twice?**
> Not through Siar's retry. Each network in a post is claimed once, and only the networks that failed are sent again.
> An interrupted send is checked against the account before anything is re-sent. But calling the create endpoint again
> makes a new post: Siar has no client idempotency key, so check your own records first. (55 words)

Network-specific question (one per page, final):

| Network | Question | Answer |
|---|---|---|
| Instagram | How many posts can the Instagram API publish in 24 hours? | Meta's content publishing page says 100 API-published posts per Instagram account in a moving 24-hour window, and carousels count as one. The same page says 50 in its carousel section. Check the account's current usage with `GET /{ig-user-id}/content_publishing_limit` before publishing, and expect error 2207042 when the limit is reached. (49 words) |
| X (Twitter) | What does X API error 402 CreditsDepleted mean? | Your X developer account's pay-per-use credit balance is empty or below zero, so X blocks API requests until you add credits. Auto-recharge doesn't run at a zero or negative balance, so top up manually first. With Siar, X usage comes from your prepaid Siar X credit, checked before every X call. (51 words) |
| LinkedIn | What happens when LinkedIn retires API version 202511? | From 16 November 2026, requests that send `Linkedin-Version: 202511` get HTTP 426 `NONEXISTENT_VERSION`. Change the header to a supported version; the latest is 202610, and LinkedIn supports each version for at least a year. Siar sends 202609, so posting through Siar is not affected by this retirement. (47 words) |
| YouTube | Are YouTube API uploads still forced to private? | No, not since 2 November 2026. Google's revision history says videos uploaded through `videos.insert` from unverified API projects are no longer restricted to private, and default to public when no privacy is set. Some uploads can still default to private because of the creator's own account settings. (47 words) |
| TikTok | Why can my TikTok app only post private videos? | Because it hasn't passed TikTok's audit. Until it does, TikTok allows only `SELF_ONLY` posts to private accounts, from at most 5 users in 24 hours, and returns `unaudited_client_can_only_post_to_private_accounts` otherwise. Apply for the audit in the TikTok developer portal. Siar's own TikTok integration is waiting on the same audit. (48 words) |
| Bluesky | How do I fix Bluesky ExpiredToken? | Refresh the session. Call `com.atproto.server.refreshSession` with the refresh token, then repeat the request with the new access token. Access tokens are short-lived by design, so expect this regularly. If the refresh fails too, the refresh token has expired or the app password was revoked: sign in again. (47 words) |
| Mastodon | Does Mastodon have API error codes? | No numeric ones. Mastodon uses HTTP status codes, and the JSON body has an `error` string with a human-readable message, plus `error_description` on OAuth errors. Read the status first: 401 is the token, 422 the content, 429 the rate limit. The rest of this page covers each status. (48 words) |

Other networks: the four shared questions only.

Sources for FAQ facts: as in sections 6 and 9. "No client idempotency key" [code: strike plan §2 row 11; messaging §5
"Do you support idempotency keys?"]. Crash check before re-sending [code: `publisher.ts` 262–289].

---

## 9. Mastodon page (filled; index it)

Decision: fill, don't noindex. Mastodon is open today, "mastodon api rate limit" is a target (C109, per-network #111),
and Siar's adapter maps statuses in a way worth explaining [code: `mastodon.ts` lines 25–31]. The page goes from 203
words to about 700.

**Meta title:** Mastodon API errors by HTTP status, with fixes (+ " | Siar" = 53 characters)
**Meta description:** in table 1a.
**H1:** Mastodon API errors and how to fix them, by HTTP status
**Date line:** Updated 12 November 2026. Generated from the code Siar uses to read Mastodon's errors.

**Subhead (55 words):**
> Mastodon has no numeric error codes. Read the HTTP status, then the JSON `error` string: 401 is a bad or revoked
> token, 403 an action the account may not take, 404 a missing record, 422 a status the server refused, 429 a rate limit
> (300 requests per 5 minutes by default), 503 a temporary problem.

**Jump to a status:** 400, 401, 403, 404, 422, 429, 503, media processing.

**H2: 400 · ParameterMissing · a required parameter is missing**
> The server rejected the call because a required parameter is missing. Fix: compare the request with the method's
> parameters in Mastodon's docs and add the missing one. Don't retry unchanged.
> **What Siar does with it:** line F.

**H2: 401 · This API requires an authenticated user · the token is missing, invalid or revoked**
> The access token is missing, expired or revoked, or the user removed the app from their account. OAuth failures come
> as `"error": "invalid_grant"` with an `error_description`. Fix: run the OAuth flow on that server again for a new token.
> **What Siar does with it:** line R. (Mastodon tokens are per server; reconnecting uses the same server URL.)

**H2: 403 · This action is not allowed · the account may not do this**
> The token is valid, but the account can't take this action: the login is disabled, the email is unconfirmed, the
> account is waiting for approval, or the action isn't permitted. Fix: resolve the account state on the server, or ask
> its moderators.
> **What Siar does with it:** line F.

**H2: 404 · RecordNotFound · the status or account doesn't exist for you**
> The record doesn't exist, or the account isn't in its audience (a private status). Fix: check the id and that the
> connected account can see it. Deleted statuses stay gone.
> **What Siar does with it:** line F.

**H2: 422 · Validation failed · the server refused the status**
> The server could not create the status, for example text over the server's character limit (500 by default),
> unsupported media, or a duplicate. Fix: read the `error` message, which names the problem, and correct it. Servers can
> raise the 500-character limit, so check `/api/v2/instance` for the real one.
> **What Siar does with it:** Siar checks text against 500 characters when you create the post, so an over-long status
> gets a `400` with an `issues` entry before Mastodon sees it. A duplicate is marked as a duplicate; anything else keeps
> Mastodon's message on the post.

**H2: 429 · Too many requests · the rate limit is used up**
> The account or IP has used its allowance. By default every endpoint allows 300 calls per 5 minutes per account and per
> IP, media uploads 30 per 30 minutes, and deletes 30 per 30 minutes. Fix: read `X-RateLimit-Remaining` and wait for
> `X-RateLimit-Reset` before retrying.
> **What Siar does with it:** Siar treats it as temporary and tries again on its own, up to three attempts in all, 30
> seconds and then 60 seconds apart. These attempts don't use the post's manual retries.

**H2: 503 · There was a temporary problem serving your request · the server or a remote server failed**
> The server, or a remote server it was contacting, failed temporarily (`UnexpectedResponseError`, `NetworkingError`
> and similar). Fix: retry with backoff.
> **What Siar does with it:** line W.

**H2: Media processing · Mastodon did not finish processing the media in time · the upload is still processing**
> Mastodon processes large media after upload and answers 202 until it is ready. This message is Siar's, not
> Mastodon's: Siar polled for about two minutes and the file was still processing. Fix: retry the post; large videos on
> busy servers can take longer.
> **What Siar does with it:** marked retryable; retry the post and Siar uploads again.

Then the shared closing sections (section 4), FAQ (section 8 shared + the Mastodon question) and CTA (section 5).

Sources: Error entity "error … The error message", "error_description (optional) … mainly provided with the OAuth API";
"The most important part of an error response is the HTTP status code"; 400 `ParameterMissing`; 401 "This API requires
an authenticated user."; 403 `NotPermitted` "This action is not allowed.", disabled login, unconfirmed email, pending
approval; 404 `RecordNotFound`; 422 `RecordInvalid`, `RecordNotUnique`; 429; 503 `UnexpectedResponseError`,
`SSLError`, `NetworkingError`, `RaceConditionError`, "There was a temporary problem serving your request, please try
again." [sourced: https://docs.joinmastodon.org/entities/Error/, checked 2026-11-12]. Rate limits: "All endpoints and
methods can be called 300 times within 5 minutes" (per account and per IP); media "30 times within 30 minutes"; status
deletion "30 times within 30 minutes"; headers `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
[sourced: https://docs.joinmastodon.org/api/rate-limits/, checked 2026-11-12].
Siar: 401 or `invalid_grant` → `TOKEN_INVALID`; 422 with "already/duplicate" → `DUPLICATE`, other 422 →
`CONTENT_REJECTED` [code: `mastodon.ts` 25–31]; 500-character check [code: line 160]; media poll 60 × 2 s [code: lines
46–51]; 429 → `RATE_LIMITED` via `codeForStatus` [code: `errors.ts`]. Siar's `resetFrom` reads only numeric reset
headers [code: `http.ts` lines 34–39]; Mastodon's `X-RateLimit-Reset` is a timestamp [sourced: "the timestamp when the
limit resets"], so Siar falls back to 30 s then 60 s. That is why the 429 Siar line names the delays instead of the
generic W line. The 422 title "Validation failed" is the usual start of Mastodon's 422 messages [inferred]; Mastodon's
Error page names the case `RecordInvalid`. If in doubt, use "422 · RecordInvalid · the server refused the status".
"`/api/v2/instance` for the real limit" is [inferred] from Mastodon's instance entity (`configuration.statuses.max_characters`),
not re-read today; drop the sentence if not confirmed.

Engineering: add a `statusReference` list to `mastodon.ts` (same shape as `errorReference`) so the page is generated,
or add these 8 entries to `errorReference` with the status as the code. The error-page template's "no code table"
branch is then removed.

---

## 10. Objection handling (what a reader on this page doubts, and where the page answers it)

| The reader thinks | The answer on the page | Where |
|---|---|---|
| "This is a vendor page; it will push me to buy before helping." | The answer to the code sits in the first 50 words under its H2, with no Siar in it. Siar appears once per code, labelled, after the fix. | 3a rule 2 |
| "Is this current?" | A visible "Updated" date tied to the code change, sources linked inline in the fixes, and dated network changes (LinkedIn 202511, YouTube 2 November). | 1, 6.5, 6.10 |
| "Does Siar hide the network's error behind its own?" | "You get its code and message, the fix on this page, and a verdict." The `errorsVerbose` fields are named. | 4 |
| "Will Siar post twice if I retry?" | The FAQ answers it, with the concession that a second create call makes a second post. | 8 |
| "Can I even use Siar for TikTok/Pinterest/YouTube?" | The status line under the intro, in the exact wording. TikTok, Reddit, Snapchat and Google Business Profile pages are labelled reference pages. | 2 |
| "Why should I trust a page that isn't the network's own docs?" | The FAQ-adjacent line in the closing box: each meaning and fix is checked against the network's docs where it documents the code, and the network's docs win where they differ. Add this sentence under the jump line on every page: "Codes and messages are what {Name} returns. Where {Name} documents a code, this page follows its docs." | 2 (add) |

No comparison table on these pages. A developer looking up a code wants the fix, not a vendor grid, and naming rival
error pages would send them away. Rival error-page families (bundle.social, Zernio, PostPeer, Ayrshare) are discussed in
`strategy-developer-api.md` G4 and `strike-plan.md` U5, not on the page.

---

## 11. Internal links

**From each error page (out):**

| To | Anchor text | Where on the page |
|---|---|---|
| `/{network}-api` | "Post to {Name} via API" (TikTok: "TikTok Content Posting API guide"; Reddit, Snapchat, GBP: "{Name} API in Siar") | Closing box line, and the breadcrumb |
| `/errors` | "social media API error codes, by network" | "Error codes for other networks" section |
| `/docs/errors` | "Siar API errors and status codes" | Same section and CTA secondary |
| `/platforms` | "See every network's status" | Closing box line |
| `/how-publishing-works#errors` | "how Siar handles a failed post" | Replace the `/platforms` sentence's tail once N1 is live |
| Topic pages | Query-worded anchors in section 6 and 7 tables | Per code, only when live |

**Into each error page (in):**

| From | Anchor text | Change |
|---|---|---|
| `/{network}-api` hub | "{Name} API error codes and how to fix them" | Replace "Errors" or the current link text; place it in the body near the limits section, not only in a footer list |
| `/errors` (new, C114) | "{Name} API error codes" plus each code anchor (`/{network}-api/errors#code-190`) | The hub lists every code with its plain name |
| `/docs/errors` | "{Name} API error codes" | Today's table shows "{Name} errors"; change the anchor text |
| `/docs/posting` "Update, retry, delete" | "the network's error reference" linking `/errors` | Add one sentence |
| Topic pages (C68, C77, C97, C98, C103, C107, C111, C91) | The specific code: "error 2207042", "error 190", "quotaExceeded" with `#code-…` | Each topic page links back to its code |
| `/network-changes` entries (N2) | The code the change produces ("426 NONEXISTENT_VERSION") | LinkedIn and YouTube entries |
| Footer | "Error codes" linking `/errors` | Strike plan §6 spine |

---

## 12. Schema notes

- **TechArticle** per page: `headline` = the H1; `description` = meta description; `datePublished` = first publish of
  the page; `dateModified` = the adapter change date (section 1); `about` = `{"@type": "Thing", "name": "{Name} API"}`;
  `author` and `publisher` = the Organization node already on the site (Siar by FF Dev Studio). No `reviewedBy`, no
  ratings.
- **BreadcrumbList**: {Name} API › Error codes, as today's `breadcrumbLd` call builds it; change the last item's name
  from "Errors" to "Error codes".
- **FAQPage** with the questions in section 8 for that page. Answers in JSON-LD match the visible text word for word.
- **Per-code markup:** no separate schema per code, no `DefinedTermSet` for now [inferred: low value, more surface to
  keep true]. Each `<section>` has its `id`, and the H2 text carries the code, which is what engines quote.
- **Never** `Review`, `AggregateRating`, `HowTo` (Google dropped HowTo rich results) or `SoftwareApplication` offers on
  these pages.
- `llms.txt`: add one line per error page under a "Network error references" heading:
  "- [{Name} API error codes](https://siaran.my/{network}-api/errors): {N} codes with {Name}'s message, meaning and fix."

---

## 13. Why this wins

**Keywords targeted** (demand and rankers from `keyword-map.md` and `per-network.md`, all [inferred] demand; no new SERP
data today):
- Primary per page: "{network} api error codes": Instagram (AC 4), TikTok (AC 6) measured as autocomplete in
  `current-site.md` §3; others low.
- Exact codes in H2s: "instagram api error 2207042" (p038), "x api 402 creditsdepleted" / "x api error 402 payment
  required" (C88, AC 5), "x api 403 duplicate content" (p042), "linkedin api error 426" / "nonexistent_version" (C92,
  AC 4, dated trigger 16 November 2026), "linkedin api 422 duplicate" (p041), "tiktok spam_risk_too_many_posts" (p039),
  "unaudited_client_can_only_post_to_private_accounts" / "tiktok api private" (AC 3), "bluesky expiredtoken" (p040),
  "youtube api quota exceeded", "youtube api upload private" (Google's 2 November change makes most ranking pages out of
  date [inferred, `per-network.md` #89]), "facebook api error 190" / "oauthexception 190", "mastodon api rate limit"
  (C109).
- Fix intent: "{network} api errors how to fix", answered by the first 50 words under every H2.

**AI prompts targeted** (the prompts sheet, `keyword-map.md` §5): p038 "Instagram error 2207042", p039 "TikTok
spam_risk_too_many_posts", p040 "Bluesky ExpiredToken", p041 "LinkedIn 422 duplicate", p042 "X 403 duplicate content",
plus "what does LinkedIn 426 NONEXISTENT_VERSION mean", "are YouTube API uploads still private in 2026", "why does the X
API return 402", "does Mastodon have error codes". All five p-codes are already on Siar's pages [measured,
`keyword-map.md` §5]; the change is making each answer quotable: code and message in the H2, the answer in the first
sentence under it, and a date.

**Why it can rank:**
- Siar has 147 codes generated from the code that reads them [measured]. Rival families are smaller: bundle.social 14
  pages plus a hub, Ayrshare 30, Zernio 12, PostPeer 10 [measured by siblings, `strike-plan.md` U5].
- A small vendor (postpeer.dev) already ranks on DuckDuckGo for "instagram api errors how to fix" with this page type
  [measured once, `current-site.md`], so the page type works for a new domain.
- Two codes have dated news hooks no older page covers: LinkedIn 202511 (16 November 2026) and YouTube's 2 November 2026
  reversal [sourced].
- The pages are honest where rivals' pages are generic: they say which networks Siar can't post to yet, and the TikTok,
  Reddit, Snapchat and Google Business Profile pages are labelled as references.

**What kills it:** shipping before Wave 0 (a reader who sees TikTok "Posted" on the home page won't trust this page);
intros that explain Siar first; bare-number H2s; a date that changes on every build.

**Measure:** Search Console impressions per error URL and per code query (filter by "error" and each code), and the
wave-0 AI prompt sheet rows p038–p042, re-run 4 and 8 weeks after shipping.
