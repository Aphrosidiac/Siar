# /how-publishing-works: landing copy (en)

Checked 2026-11-12. Strike-plan row N1, NEW, W1 (`strike-plan.md` §5 and §6). The canonical page for "Every post
accounted for" (`messaging.md` §1, pillar 1) and the anchor target of every "How Siar handles this" box on the library
pages. There is no current page source (`apps/site/src/pages/` has no `how-publishing-works`), so this is new copy.

Facts follow `research/siar-truth.md` as corrected by `strike-plan.md` §2, and the wording rules in `messaging.md`.
Every mechanism below was re-read in the code today. Labels used in these notes (never on the page): **[code]** read in
this checkout (release 878b698), **[doc]** owner record, **[measured]** seen today, **[inferred]** judgement.

Segment: SaaS builders adding social publishing (`messaging.md` §4.1), read globally, so prices are "$ (RM in
Malaysia)". No competitor is named on this page: `messaging.md` §11 allows rival names only on `/compare/*`, the two
pricing explainers, the `/malaysia` table, the webhook table on C16 and `/compare/failure-handling`. The table below
compares building it yourself with Siar, not Siar with a rival.

---

## Before this page ships (blocking)

These are code and docs fixes. The page quotes the behaviour, so the code and docs must say the same thing first.

1. **`apps/site/src/lib/events.ts` line 25.** Today: "A post finished publishing on a network, or failed for good.
   Sent once per post per network." The code sends it once per post, when the whole post reaches `POSTED` or `ERROR`,
   and again if a retry ends in a new final state [code: `publisher.ts` `recomputePost`, lines 227–260]. Replace with:
   > "A post reached its final state: published on every network, or failed on at least one, with each network's
   > result. Sent once per final state, and again when a retry reaches a new one."
2. **`apps/site/src/pages/docs/errors.mdx`, "Errors from networks".** It says `errors` holds "the network's own code and
   message verbatim". In code, `errors` holds one message string per network; the code, message, HTTP status, raw
   network body and retry verdict are in `errorsVerbose` [code: `serialize.ts` `targetMaps`]. `errorsVerbose` is
   returned on API reads only when the organization's verbose-errors setting is on (`showVerboseErrors`, default
   `false` in `schema.prisma` line 157), and is always included in the `post.published` webhook (`verbose: true` in
   `recomputePost`). Fix the docs line to match. The copy below already does.
3. **`/errors` hub (C114, W1)** must be live before this page links it. Until then, link `/docs/errors` and the
   per-network `/<net>-api/errors` pages. The count "147" was measured today by summing the counts in the live error
   pages' meta descriptions (Facebook 12, Instagram 10, Threads 8, X 13, LinkedIn 10, Bluesky 10, Mastodon 0, Discord 9,
   Slack 10, YouTube 11, TikTok 15, Pinterest 10, Reddit 10, Snapchat 9, Google Business Profile 10) [measured]. The
   adapters in this checkout hold 152 entries (LinkedIn has 15 in code, 10 live) [code], so the next deploy changes the
   number. **Render the count from the same constant the error pages use; never hard-code 147.** Same for 16 events,
   5 endpoints, 6 retries, 3 attempts and the backoff list: import them from `events.ts`, `plans.ts`
   (`RESOURCE_LIMITS`) and `webhooks.ts` (`BACKOFF_MIN`).
4. **Examples.** Regenerate every JSON block on this page from a run against Siar's mock networks
   (`NETWORK_MODE=mock`, `mocks/`) before publishing, so the shapes are byte-accurate. The blocks below follow the code
   field by field, but were written by hand [code].

### Code gaps found while checking (not blocking, but they limit what the page may say)

These are why the copy says "claimed once" and "checked before re-sending", and never "cannot post twice".

- **A failed lookup re-sends.** In `staleClaims` (`publisher.ts` 262–289), if the network lookup itself throws, the
  error is only logged, nothing is found, and the target is re-sent (while attempts are under 3) [code]. Safer: treat a
  failed lookup like "cannot check" and end the target as "could not be confirmed".
- **Media-only posts cannot be matched.** The lookup matches on the first 60 characters of the text. With no text it
  never finds a match, so an interrupted media-only post is re-sent [code]. Same fix.
- **Timeouts re-send without a lookup.** A timeout or a network 5xx is `NETWORK_UNAVAILABLE`, which is transient, so
  the target is sent again after 30 s and 60 s (up to 3 attempts in all) with no check of the account first
  [code: `http.ts` line 66, `errors.ts` `TRANSIENT`, `publisher.ts` `fail`]. If the network saved the post before the
  timeout, a second copy is possible. The page concedes this in plain words (section "What Siar does not do").
- **Refresh failures send no webhook.** `markNeedsReconnect` (`platform/networks.ts` line 131) flags the account but
  emits nothing. `social-account.updated` fires only from the connection check (`accounts.ts` `checkOne`, every 6 hours
  when `disconnectCheckEnabled`, default `true`) [code]. The copy ties the webhook to the connection check only.
- **`referenceKey` already blocks a repeated create.** It is unique per organization (`schema.prisma` line 680;
  pre-check in `posts.ts` line 109 returns `409`; a race hits the unique index and `routes.ts` line 157 returns `409`)
  [code]. This is not an idempotency key (the second call gets a `409`, not the first response), but it means
  "resending a create call makes a second post" is true only when no `referenceKey` is sent. The copy says so. Update
  the matching objection in `messaging.md` §5 and the C24 guide.

---

## Meta

| Field | Copy | Length |
|---|---|---|
| Meta title | What happens when a social media API post fails \| Siar | 54 |
| Meta description | Siar checks each post before sending, sends it to each account once, keeps the network's own error and reports every result in a signed webhook. | 144 |
| URL | `https://siaran.my/how-publishing-works` | |
| OG title | Every post accounted for: what happens when a post fails | |
| OG description | Checked before it's sent, sent to each account once, the network's own error, and a signed webhook retried for about 45 hours. | |
| Breadcrumb | Home › How publishing works | |

Why this title and not the category-creator draft ("What happens to a post: validation, sending once, errors,
webhooks | Siar", 72 characters, cut in results): the 54-character title is the exact primary query, which is also
prompt 1 of `prompts_v2` (`strike-plan.md` line 891). The idea ("every post accounted for") goes in the H1 and OG
title, where length does not matter.

---

## Hero

**H1:** Every post accounted for: what happens when a post fails

**Subhead (the answer, first 60 words):**
When a post fails on one network, Siar, a unified social media API, still publishes it everywhere else. The failed
network keeps its own code, message and HTTP status. A signed `post.published` webhook tells your server each network's
result. When you retry, only the failed networks are sent again, and the retry uses no extra post from your plan.

(59 words.)

**Second paragraph (defines the idea):**
"Accounted for" means you know, not that every post gets through. Every network a post goes to ends in a recorded
state: posted, failed with the network's reason, or "could not be confirmed" when an interrupted send cannot be
checked. Networks still reject posts. Siar tells you which ones, and why.

**Primary CTA:** Start the 14-day Pro trial
**Secondary CTA:** Read the quickstart
**Text link under the buttons:** Or start with 20 free posts to try. No card.

**Jump links (plain text links in one line, no chips):**
Checked before it's sent · Sent to each account once · The network's own error · Signed webhooks · Broken
connections · What's open today

---

## Section: A post's life, in states (no anchor; sits under the hero)

**H2:** What your app sees at each step

**Body:**
A post is one request. Siar splits it into one target per network and tracks each target on its own. The post's
status comes from its targets, so you can read one field or all of them.

| Post status | What it means | What you do |
|---|---|---|
| `SCHEDULED` | Checked, stored and queued for `postDate`. | Nothing. |
| `PROCESSING` | At least one network is being sent to, or has the post and is still processing it (common for video). | Wait for the webhook. |
| `POSTED` | Every network published it. `postedDate` is set. | Nothing. |
| `ERROR` | At least one network failed for good. The others stay published. | Read `errors`, fix the cause, retry. |
| `RETRYING` | You retried; the failed networks are queued again. | Wait for the webhook. |

Each target inside the post has its own state, with the network's post id and link when it published, or the
network's error when it did not.

(Notes, not on the page: statuses and wording from `docs/posting.mdx` "Statuses" [code]. `REVIEW` is left out of the
table because no open network uses it today [inferred from the adapters]; it stays in the docs.)

---

## Section `#checked`

**H2:** Checked against each network's rules before it's sent

**Body:**
Siar checks a post against each network's rules when you create it, not when it is due. A bad request fails at once
with a `400` you can fix, instead of failing on schedule while nobody is watching.

What is checked, per network:

- that an account for that network is connected to the team, and a Page or channel is picked where the network needs
  one;
- text length, counted the way that network counts it;
- media type, file size, duration and aspect ratio, and the number of items;
- every upload exists, and the first comment is allowed and short enough;
- your plan's post quota and the account's daily cap for that day.

Every problem comes back in one response, in an `issues` list. Each issue has a `path` that points at the field, so
`["data", "THREADS", "text"]` means `data.THREADS.text`. A rejected request uses no post from your plan.

**Example** (shapes follow Siar's code; ids and text are made up; no real account was used):

```http
POST https://api.siaran.my/api/v1/post
x-api-key: YOUR_API_KEY
content-type: application/json

{
  "teamId": "TEAM_ID",
  "title": "November menu",
  "postDate": "2026-11-13T01:00:00.000Z",
  "status": "SCHEDULED",
  "socialAccountTypes": ["THREADS", "BLUESKY"],
  "data": {
    "THREADS": { "text": "(612 characters)" },
    "BLUESKY": { "text": "(342 characters)" }
  }
}
```

```json
{
  "statusCode": 400,
  "message": "Validation failed: Text is 612 characters (emoji count as their byte length); the limit is 500.",
  "issues": [
    {
      "code": "too_long",
      "message": "Text is 612 characters (emoji count as their byte length); the limit is 500.",
      "path": ["data", "THREADS", "text"]
    },
    {
      "code": "too_long",
      "message": "Text is 342 characters; the limit is 300.",
      "path": ["data", "BLUESKY", "text"]
    }
  ]
}
```

**Closing line:**
A check at create time cannot see everything. A network can still refuse a post later, for its own reasons. When it
does, you get its own error, as described under "The network's own error".

**Link line:** Each network's limits are on its page, for example [Threads API limits](/threads-api) and
[Bluesky API limits](/bluesky-api).

(Notes: `posts.ts` `checkDraft` lines 55–88; Threads message `threads.ts` line 155; Bluesky `checkText` with
`TEXT_MAX = 300` (`bluesky.ts` line 41, `validate.ts` line 13); quota and daily cap consumed inside the create
transaction after the check (`consumeForSchedule`), so a `400` consumes nothing [code]. Quota failures are a `403`,
not a `400`; the copy says "fails" for both, which is accurate.)

---

## Section `#sent-once`

**H2:** Each account gets your post once

**Body:**
Before Siar sends to a network, it claims that target with a conditional database update and a fresh attempt id. Only
the worker holding the claim sends. A second job, a restart or a double click finds nothing to claim. The moment the
network returns the new post's id, Siar saves it.

**H3:** If a send is interrupted

If a worker dies between sending and saving, the claim is left open. After 20 minutes, Siar reads the account's
recent posts and looks for yours before sending anything again:

- **Found:** the target is marked posted, with the network's id and link.
- **Not found:** it is sent again, up to 3 attempts in all.
- **No way to look:** some networks give Siar no way to read recent posts. Today that is Discord and Slack. There, Siar
  does not risk a second post. The target ends with this error, and you decide:

**Example:**

```json
"errorsVerbose": {
  "SLACK": {
    "code": "UNKNOWN",
    "errorMessage": "Publishing was interrupted and the result could not be confirmed. Check the account before retrying.",
    "isTransient": false,
    "retryability": "unknown",
    "httpStatus": null,
    "meta": null,
    "userFacingMessage": "Publishing was interrupted and the result could not be confirmed. Check the account before retrying."
  }
}
```

**H3:** Retrying re-sends only what failed

`POST /post/{id}/retry` sends the failed networks again and leaves the published ones alone. A retry uses no post from
your plan. Each post can be retried 6 times; after that, create a new post. A second retry call while the first is
running is refused with a `400` ("Only posts in ERROR can be retried"), so a double click cannot queue it twice.

**H3:** Sending the same create call twice

Siar has no idempotency-key header on post creation. If you send the same create call twice without a reference, you
create two posts. Give each post your own `referenceKey`: it is unique in your organization, so a second create with
the same key is refused with a `409`, and `GET /post/reference-key/{referenceKey}` finds the first one.

**Example:**

```json
{ "statusCode": 409, "message": "A post with referenceKey \"order-8841-promo\" already exists." }
```

**Link line:** The full pattern for retrying safely is in [how to avoid double posting when you retry](/guides/idempotent-social-media-posting).

(Notes: claim `publisher.ts` lines 87–93; external id saved in `settle`; `STALE_CLAIM_MS = 20 * 60_000` line 27;
`staleClaims` lines 262–289; adapters with `recentPosts`: Facebook, Instagram, Threads, X, LinkedIn, Bluesky,
Mastodon (open) plus non-open ones; Discord and Slack have none [code: grep of `packages/networks/src/adapters`].
Retry rules `posts.ts` lines 243–256, `RESOURCE_LIMITS.maxRetries: 6`. `referenceKey` see "Code gaps" above. The
C24 guide link only goes live with C24 in W1; drop the line if C24 slips.)

---

## Section `#errors`

**H2:** If a network says no, you get its own words

**Body:**
When a network refuses a post, Siar keeps what the network said: its HTTP status, its message word for word, and its
raw error body. On top, Siar adds a category (such as `DUPLICATE` or `TOKEN_INVALID`) and a verdict on what to do next.

| Verdict | What it means | What Siar does | What you do |
|---|---|---|---|
| `retryable` | A rate limit, a network outage or a timeout. | Tries again on its own, up to 3 attempts in all, waiting for the network's rate-limit reset where it gives one. These attempts do not use your 6 retries. | Usually nothing. |
| `non_retryable` | The post itself was refused: duplicate text, a policy block, missing permission, bad media. | Stops and marks that network failed. | Fix the cause, then retry or edit the post. |
| `unknown` | Siar cannot tell what happened. | Stops. Never re-sends on a guess. | Check the account, then decide. |

Every known code has a page: what it means and how to fix it, by network. Siar's error reference covers 147 codes
today, generated from the same code that relays them.

**Example** (one post to Threads, Bluesky and X; X refused it, the other two published):

```json
{
  "id": "POST_ID",
  "status": "ERROR",
  "error": "TWITTER: You are not allowed to create a Tweet with duplicate content.",
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
      "meta": {
        "detail": "You are not allowed to create a Tweet with duplicate content.",
        "type": "about:blank",
        "title": "Forbidden",
        "status": 403
      },
      "userFacingMessage": "You are not allowed to create a Tweet with duplicate content."
    }
  },
  "externalData": {
    "THREADS": { "id": "THREADS_POST_ID", "status": "POSTED", "publishedAt": "2026-11-13T01:00:06.000Z" },
    "BLUESKY": { "id": "at://BLUESKY_RECORD_URI", "status": "POSTED", "publishedAt": "2026-11-13T01:00:05.000Z" }
  }
}
```

The fix for this one, from the [X API error reference](/x-api/errors): change the text; X blocks identical
consecutive posts. Then retry. Only X is sent again.

**Small print under the example:**
`errors` is on every read. `errorsVerbose` comes with the `post.published` webhook, and on API reads when verbose errors
are turned on in your organization settings.

**Link line:** [Social media API error codes, by network](/errors) · [Siar's own error format](/docs/errors)

(Notes: `errors.ts` `NetworkError`, `toVerbose`, `Retryability`; `TRANSIENT` = `RATE_LIMITED`, `NETWORK_UNAVAILABLE`;
`AUTO_ATTEMPTS = 3`, delays 30 s then 60 s or the rate-limit reset (`publisher.ts` `fail`); "do not use up the 6
manual retries" is the code comment in `fail` [code]. X mapping `twitter.ts` line 81; reference entry line 300 [code].
The X `meta` body is the usual X API v2 problem shape [inferred; regenerate from the mock]. 147 [measured], see
"Before this page ships" item 3. `/errors` only after C114 is live; fall back to `/x-api/errors` and `/docs/errors`.)

---

## Section `#webhooks`

**H2:** A signed webhook tells your server how it went

**Body:**
Subscribe to `post.published` and your server hears about every post without polling. It fires once when a post
reaches its final state, published everywhere or failed on at least one network, with each network's result inside.
If you retry and the post reaches a new final state, it fires again.

How a delivery works:

- Each request carries `x-siar-event`, `x-siar-delivery`, `x-siar-timestamp` and `x-siar-signature`.
- The signature is a hex HMAC-SHA256 of `timestamp.rawBody` with your endpoint's secret. Check it on the raw bytes,
  and reject timestamps more than five minutes old.
- A `2xx` answer within 15 seconds counts as delivered. Anything else is retried after 1 minute, 5 minutes,
  30 minutes, 2 hours, 6 hours, 12 hours and 24 hours: 7 retries over about 45 hours. Then the delivery is marked
  failed.
- Automatic retries keep the same `x-siar-delivery` id, so your receiver can skip one it has already handled. A manual
  resend gets a new delivery id with the same event `id`; dedupe on the event `id` to skip those too.

Every delivery is logged with its response code and timing. Organization owners and admins can resend any delivery,
send a test event and rotate the secret from the dashboard. An organization can have 5 endpoints, each with its own
events and secret. There are 16 event types in all, including `social-account.updated` and `comment.received`.

**Example** (headers and body of one delivery):

```http
POST /webhooks/siar HTTP/1.1
content-type: application/json
user-agent: Siar-Webhooks/1.0
x-siar-event: post.published
x-siar-delivery: DELIVERY_ID
x-siar-timestamp: 1794445204
x-siar-signature: HEX_HMAC_SHA256
```

```json
{
  "id": "evt_EVENT_ID",
  "type": "post.published",
  "createdAt": "2026-11-12T01:00:04.000Z",
  "organizationId": "ORG_ID",
  "data": {
    "id": "POST_ID",
    "status": "ERROR",
    "errors": { "TWITTER": "You are not allowed to create a Tweet with duplicate content." },
    "errorsVerbose": { "TWITTER": { "code": "DUPLICATE", "retryability": "non_retryable", "httpStatus": 403 } },
    "externalData": {
      "THREADS": { "status": "POSTED" },
      "BLUESKY": { "status": "POSTED" }
    }
  }
}
```

(The page shows `errorsVerbose` and `externalData` shortened, with a note: "Shortened. The full post is in `data`.")

**Verify it (Node.js):**

```js
import { createHmac, timingSafeEqual } from 'node:crypto';

export function verifySiarWebhook(rawBody, headers, secret, toleranceSeconds = 300) {
  const timestamp = headers['x-siar-timestamp'];
  const signature = headers['x-siar-signature'];
  if (!timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > toleranceSeconds) return false;
  const expected = createHmac('sha256', secret).update(`${timestamp}.${rawBody}`).digest('hex');
  const a = Buffer.from(expected, 'hex');
  const b = Buffer.from(String(signature), 'hex');
  return a.length === b.length && timingSafeEqual(a, b);
}
```

**Link line:** [Social media webhooks API](/use-cases/social-media-webhooks) · [Webhook docs, with Python](/docs/webhooks)

(Notes: `webhooks.ts` lines 6–14 (headers, `BACKOFF_MIN = [1, 5, 30, 120, 360, 720, 1440]`, 15 s timeout, no
redirects), sum 2,676 min = 44.6 h; `events.ts` `emit` envelope; `system.ts` resend creates a new delivery row with
the same `eventId`, test, rotate-secret; `RESOURCE_LIMITS.webhooks: 5`; 16 events in `platform/events.ts`; snippet is
`verifyNode` in `apps/site/src/lib/snippets.ts` lines 51–63 [code]. Webhooks are managed by owners and admins from the
dashboard; API keys cannot create them (`docs/webhooks.mdx`, `snippets.ts` line 134) [code]. Do not write "manage
webhooks from the API". Timestamp 1794445204 = 2026-11-12T01:00:04Z [measured with `date`].)

---

## Section `#accounts`

**H2:** When a connection breaks, you hear about it

**Body:**
Tokens expire and people remove apps. Siar refreshes access tokens before they run out, on the networks that allow
refresh: shortly before each call, and in a background job for tokens due within the hour. Refreshes for one account
run one at a time, because some networks issue a new refresh token each time.

When a grant is revoked, or expires and cannot be refreshed, Siar marks the account as needing a reconnect and keeps
the network's reason. Siar also asks each network every 6 hours whether its connections still work. When that check
finds a broken one, it sends a `social-account.updated` webhook.

What happens next:

- Posts due on that account fail with "Reconnect this account, then retry the post." They are not sent.
- Your customer reconnects through the same branded connect link. Then you retry the failed posts.
- If nobody reconnects within your organization's grace period (72 hours unless you change it), Siar removes the
  account and sends `social-account.deleted`.

**Example** (`social-account.updated`, shortened):

```json
{
  "id": "evt_EVENT_ID",
  "type": "social-account.updated",
  "organizationId": "ORG_ID",
  "data": {
    "id": "SOCIAL_ACCOUNT_ID",
    "type": "FACEBOOK",
    "teamId": "TEAM_ID",
    "connectionState": "NEEDS_RECONNECT",
    "connectionStateReason": "Error validating access token: The session has been invalidated because the user changed their password or Facebook has changed the session for security reasons.",
    "deleteOn": "2026-11-15T07:00:00.000Z"
  }
}
```

**Link line:** [Connecting accounts](/docs/connecting-accounts) · [Hosted connect link](/use-cases/hosted-connect-oauth)

(Notes: `REFRESH_MARGIN_MS` 10 min and advisory lock in `platform/networks.ts` lines 95–129; `refreshTokens` job
(within the hour) and `connectionChecks` (every 6 h, `disconnectCheckEnabled` default `true`, owner can turn it off)
in `engine/maintenance.ts`; `checkOne` emits `social-account.updated` on CONNECTED → NEEDS_RECONNECT
(`accounts.ts` 340–366); publish guard message `publisher.ts` line 100; purge job and `deleteAccountAfter` default 72
(`schema.prisma` line 160), YouTube capped shorter [code]. Message text is Meta's 190 entry, `meta-common.ts` line 100
[code]. Never "flagged before your next post fails" (`messaging.md` §3). The page says the webhook fires from the
check, not from a failed refresh: see "Code gaps".)

---

## Section `#status`

**H2:** Which networks are open today

**Body:**
Siar is built for 15 networks. Publishing is open today on Facebook, Instagram, Threads, X, LinkedIn profiles,
Bluesky, Mastodon, Discord and Slack. YouTube: connect and upload now; public uploads not yet confirmed. TikTok,
Pinterest publishing and LinkedIn company pages open after each network approves Siar. Reddit, Snapchat and Google
Business Profile are built, not open yet.

Siar's Meta app passed App Review on 27 October 2026, so your customers connect Facebook, Instagram and Threads
through it.

**Link line:** [Every network's status, with dates](/platforms)

(Notes: render the network sentence from the one status constant (`messaging.md` §9), not by hand. Wording per §9 and
the canonical paragraph §1 [doc]. Link `/platforms/approvals` here as well once it is live.)

---

## Section: building it yourself, or through Siar

**H2:** What you would build for each network

**Body:**
You can call each network yourself. These are the parts this page is about, and who builds them.

| Part | Calling each network yourself | Through Siar |
|---|---|---|
| Rules check before sending | You write one per network and keep it current | Checked at create; a `400` with `issues` per field |
| One send per account | You build the claim, the crash recovery and the lookup | Claimed once; interrupted sends checked against the account first |
| Error handling | One error format per network, mapped by you | The network's own error kept, plus a category and a retry verdict |
| Telling your app the result | You build the event, signing and retries | `post.published`, HMAC-signed, retried 7 times over about 45 hours |
| Broken connections | You refresh tokens and check connections | Refresh before expiry; a check every 6 hours with `social-account.updated` |
| Network approvals | Your own app review on each network | Meta done (27 October 2026); others as listed on [/platforms](/platforms) |

(Notes: no rival names, per `messaging.md` §11. Each "Through Siar" cell repeats a mechanism sourced above [code].)

---

## Section: what Siar does not do

**H2:** What Siar does not do

**Body:**
- **It does not make networks say yes.** A post can pass every check and still be refused. You get the refusal in the
  network's words.
- **No idempotency-key header on create.** Send the same create call twice without a `referenceKey` and you get two
  posts.
- **A timeout is treated as not sent.** If a network times out or answers with a server error, Siar tries again, up to
  3 attempts in all. If the network saved the post before it failed, a second copy is possible.
- **No uptime figure and no success rate.** Siar has been live since 12 October 2026 and publishes none.
- **5 webhook endpoints per organization**, 16 event types.

---

## Objection handling

| The buyer says | Answer on the page or in sales replies (allowed wording) |
|---|---|
| "So Siar never fails?" | "No. Networks still reject posts. Siar tells you which ones and why, in the network's own words, and retries only the networks that failed." |
| "Do you support idempotency keys?" | "Not as a header. Each network target is claimed once, and an interrupted send is checked against the account before anything is re-sent. For the create call, send a `referenceKey`: a second create with the same key gets a `409`, and you can look the first one up." |
| "What if your worker crashes mid-send?" | "After 20 minutes Siar reads the account's recent posts. If yours is there, it is marked posted. Where a network gives no way to look (Discord and Slack today), the target stops as 'could not be confirmed' instead of risking a second post." |
| "Our webhook server goes down sometimes." | "Each delivery is retried 7 times over about 45 hours, and every delivery is in a log you can resend from." |
| "How do I trust the payload?" | "Every delivery is HMAC-SHA256 signed over the timestamp and raw body with your endpoint's secret. You can rotate the secret." |
| "Do retries cost us posts?" | "No. A retry re-sends only the failed networks and uses no post from your plan, up to 6 retries per post." |
| "Our customers' tokens keep expiring." | "Siar refreshes tokens before they expire where the network allows it, checks connections every 6 hours and sends `social-account.updated` when one breaks. Your customer reconnects through your branded link." |
| "Who uses this? What's your uptime?" | "Siar has been live since 12 October 2026, so there are no case studies or uptime record yet. You can check the public OpenAPI file, the error reference and every network's status. Try it with 20 free posts, no card." |
| "Can I post to TikTok?" | "Not yet. TikTok's audit of Siar's app has not passed. Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack." |

---

## FAQ

Headings are phrased the way people ask an assistant. Answers lead with the answer, 40–60 words each.

**What happens if a post fails on one network?**
The other networks still publish. The failed network keeps its own error code, message and HTTP status, plus a verdict:
retryable, non-retryable or unknown. The `post.published` webhook tells your server each network's result. Fix the
cause and retry: only the failed networks are sent again, and the retry uses no extra post. (52 words)

**How do I avoid double posting when I retry?**
Use Siar's retry call, not a second create. `POST /post/{id}/retry` re-sends only the networks that failed and leaves
published ones alone. Each network target is claimed once, so a second call or a restart cannot start another send.
If you must resend a create call, give it the same `referenceKey`: the copy is refused with a `409`. (57 words)

**How do I know a post was published?**
Subscribe to the `post.published` webhook. It fires once when a post reaches its final state, published everywhere
or failed somewhere, with each network's post id, link or error. Deliveries are HMAC-signed and retried 7 times over
about 45 hours. You can also read `GET /post/{id}`, or list failed posts by status. (51 words)

**What happens when a token expires?**
Siar refreshes tokens before they expire on networks that allow it. If a grant is revoked or cannot be refreshed, the
account is marked as needing a reconnect, and posts to it fail with "Reconnect this account, then retry the post."
Siar's 6-hourly connection check sends a `social-account.updated` webhook. Your customer reconnects through your
branded link. (56 words)

**Which networks are open today?**
Publishing is open on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack.
YouTube uploads work; public uploads are not yet confirmed. TikTok, Pinterest publishing and LinkedIn company pages
open after each network approves Siar. Reddit, Snapchat and Google Business Profile are built, not open yet. Each
network's status, with dates, is on /platforms. (56 words)

**What does "Publishing was interrupted and the result could not be confirmed" mean?**
A send to that network stopped before Siar could record the answer, and Siar had no way to check the account for the
post. Rather than risk a second copy, Siar stopped. Look at the account. If the post is not there, retry. If it is,
leave it: the rest of the post is unaffected. (55 words)

**Do failed posts and retries count against my plan?**
A request rejected at create, with a `400`, uses no post. A post counts once when it is scheduled, however many
networks it goes to. Retrying a failed post re-sends only the failed networks and does not count again, up to 6
retries per post. Drafts do not count either. (50 words)

**Does Siar support idempotency keys?**
Not as a request header on post creation. Instead, each network target is claimed once, and an interrupted send is
checked against the account before anything is re-sent. For create calls, set your own `referenceKey`. It is unique
in your organization, so a repeated create gets a `409`, and you can fetch the original by that key. (57 words)

**What happens if my webhook endpoint is down?**
Siar retries each delivery after 1 minute, 5 minutes, 30 minutes, 2 hours, 6 hours, 12 hours and 24 hours: about 45
hours in all. After that the delivery is marked failed and stays in your delivery log. Owners and admins can resend it
from the dashboard once your endpoint is back. (52 words)

**How do I verify a Siar webhook signature?**
Compute a hex HMAC-SHA256 over the `x-siar-timestamp` header, a dot, and the raw request body, using your endpoint's
secret. Compare it with `x-siar-signature` in constant time. Reject timestamps more than five minutes old to stop
replays. Parse the JSON only after the check passes. Node.js and Python code is in the webhook docs. (53 words)

---

## Closing section

**H2:** Write it once. Siar it everywhere.

**Body:**
Add publishing to your product and know what happened to every post. One price per organization, not per account:
from $19 a month (RM39 in Malaysia), with unlimited brands and 100,000 posts a month on Business for $149 (RM399). Your
price never goes up while you stay subscribed.

**Primary CTA:** Start the 14-day Pro trial
**Secondary CTA:** Start with 20 free posts

**Trust line (small, under the buttons):**
FF DEV STUDIO (SSM 202603234793), Malaysia. Meta App Review passed on 27 October 2026.

---

## Internal links

**Out of this page (in body copy, descriptive anchors):**

| Anchor text | Target | Where |
|---|---|---|
| Threads API limits / Bluesky API limits | `/threads-api`, `/bluesky-api` | `#checked` |
| how to avoid double posting when you retry | `/guides/idempotent-social-media-posting` (C24, W1) | `#sent-once` |
| X API error reference | `/x-api/errors` | `#errors` |
| Social media API error codes, by network | `/errors` (C114, W1; until live, `/docs/errors`) | `#errors` |
| Siar's own error format | `/docs/errors` | `#errors` |
| Social media webhooks API | `/use-cases/social-media-webhooks` (C16) | `#webhooks` |
| Webhook docs, with Python | `/docs/webhooks` | `#webhooks` |
| Connecting accounts | `/docs/connecting-accounts` | `#accounts` |
| Hosted connect link | `/use-cases/hosted-connect-oauth` | `#accounts` |
| Every network's status, with dates | `/platforms` (and `/platforms/approvals` once live) | `#status` |
| Read the quickstart | `/docs/quickstart` | hero CTA |
| Start the 14-day Pro trial / Start with 20 free posts | sign-up URL | hero, closing |

Do not use the exact anchor "unified social media API" here: it points only to `/` (`strike-plan.md` §6 rule 1). The
subhead names the category in plain text without linking it.

**Into this page (add at launch, minimum 3, `strike-plan.md` §6 rules 2, 9 and 10):**

| From | Anchor text | To |
|---|---|---|
| `/` (home, under the hero: the four mechanisms) | checked before it's sent · sent to each account once · the network's own error · a signed webhook | `#checked`, `#sent-once`, `#errors`, `#webhooks` |
| Footer, site-wide | How publishing works | `/how-publishing-works` |
| `/use-cases/multi-tenant-social-media-api` (C11) | your customers' posts, accounted for | `/how-publishing-works` |
| `/use-cases/social-media-webhooks` (C16) | what fires when a post fails | `#webhooks` |
| `/guides/idempotent-social-media-posting` (C24) | how Siar sends each post once | `#sent-once` |
| Every `/<net>-api/errors` page, "How Siar handles this" box | the network's own error, plus a retry verdict | `#errors` |
| Every network hub, "How Siar handles this" box | checked before it's sent | `#checked` |
| Token and reconnect guides (e.g. `/facebook-api/page-access-token`) | when a connection breaks | `#accounts` |
| `/docs/posting` "Know when it is done" and `/docs/webhooks` | how publishing works | `/how-publishing-works` |
| `/pricing` "How quotas work" | retries don't use your posts | `#sent-once` |

---

## Schema notes

- **`WebPage`** (or `TechArticle`) with `@id` `https://siaran.my/how-publishing-works#page`, `name` = H1,
  `description` = meta description, `inLanguage` `en`, `dateModified` set at build, `about` →
  the `SoftwareApplication` `@id` declared on `/`, `publisher` → the `Organization` `@id` (FF DEV STUDIO).
- **`FAQPage`** with the ten questions above, answers word for word. The status answer must be rendered from the same
  status constant as the page body, so the JSON-LD never drifts from the open list.
- **`BreadcrumbList`**: Home › How publishing works.
- **`hasPart`** / `WebPageElement` with `cssSelector` or `url` per anchor (`#checked`, `#sent-once`, `#errors`,
  `#webhooks`, `#accounts`, `#status`) is optional; it helps answer engines cite a section [inferred].
- **No** `AggregateRating`, `Review`, `HowTo` (this is not a step-by-step task), or any `Offer` with prices (prices
  live on `/pricing`).
- Code blocks are plain `<pre><code>`, server-rendered, so fetchers that skip JavaScript read them [inferred from
  `current-site.md` render notes].

---

## Why this wins

**Keywords it targets** (no keyword-volume API; demand is inferred):

| Keyword | Role | Evidence |
|---|---|---|
| what happens when a social media API post fails | Primary; exact meta title | Google autocomplete returned no completions for "social media api post failed", "social media api error", "social media api duplicate", "social media api webhook", "social media api token expired" and "what happens when a social media post fails" today [measured, one pass]. The category-creator pass measured autocomplete 0 for the idea too (`strategy-category-creator.md` line 259). Low search demand; the page exists for AI citation, conversion and as the link hub, as the brief says |
| how to avoid double posting when retrying a social media API (p045) | Secondary; FAQ 2, `#sent-once` | `prompts_v1.csv` row 46; no page seen targeting it (`ai-answers.md` line 374) [sourced in repo]. C24 owns the long answer; this page owns the mechanism |
| social media API with webhooks when a post is published (p018) | Secondary; `#webhooks`, FAQ 3 | `prompts_v1.csv` row 19; AC 2 (HU78); C16 owns the head term, this page holds the mechanism (`strategy-category-creator.md` line 439) |
| social media API error handling | Secondary; `#errors` | Supports `/errors` and the per-network error pages, which carry the code-level demand ("instagram api error codes", "tiktok api error codes" autocomplete, `market.md` §8c) |
| what happens when a token expires | Secondary; `#accounts`, FAQ 4 | Buyer pain P3 ("keeps disconnecting", "rinse and repeat", `market.md` §4, §8a) |

**AI prompts it is built to be cited for** (`prompts_v2`, `strike-plan.md` line 891, and the category-creator list):

- "what happens if a social media API post fails on one network" (hero, FAQ 1)
- "social media API that prevents duplicate posts when retrying" (`#sent-once`, FAQ 2, FAQ 8)
- "which social media API retries webhooks" (`#webhooks`, FAQ 9)
- "social media API with signed webhooks" (`#webhooks`, FAQ 10)
- "social media API that returns the platform's own error message" (`#errors`)
- "what happens when a social media API token expires" (`#accounts`, FAQ 4)
- "which networks does Siar support" (`#status`, FAQ 5)

**Why it can win** [inferred]: the answer sits in the first 59 words; each mechanism has its own anchor, a numbered
fact (20 minutes, 3 attempts, 6 retries, 7 retries over about 45 hours, 6-hour checks, 72-hour grace) and a code-shaped
example, which is what answer engines lift; and it concedes the limits (no idempotency header, timeouts, no uptime
record) that a hostile reader would look for first. No vendor home page in `competitors.md` §3 leads with failure
handling (`strike-plan.md` §3 item 6).

**Research limits today:** the web-search budget for this run was used up before any SERP or People Also Ask check
for this page, so no new third-party evidence was gathered here. The keyword evidence above comes from the repo's
earlier research and one autocomplete pass. No competitor fact is used on this page.
