# /linkedin-api/errors: final copy

Status: publish-ready copy, LIVE-FIX, **ship by 2026-11-16** (strike plan §0 item 5, §2 strike 2, §5.2 "LinkedIn first:
the 426 section by 2026-11-16"; keyword map C92). Written 2026-11-12.
Replaces the generated copy of the live page `https://siaran.my/linkedin-api/errors` (template
`apps/site/src/pages/[api]/errors.astro`, entries from `errorReference` in `packages/networks/src/adapters/linkedin.ts`
lines 355-366). The live page returns 200 today [measured]; `/network-changes` returns 404 today [measured].

Sources for every fact on this page:

- **LinkedIn, sourced, checked 2026-11-12** (all fetched today):
  - Versioning: https://learn.microsoft.com/en-us/linkedin/marketing/versioning (updated 2026-10-14). Quotes used:
    "The Marketing Version 202511 (Marketing November 2025) will be sunset on November 16, 2026."; latest version
    "October 2026 | 202610"; "supported for a minimum of one (1) year"; "the latest version is not applied by default";
    header format "Linkedin-Version" + "YYYYMM"; migrate by updating "the older version's `YYYYMM` formatted value in
    the header"; "the behavior of the individual API methods can change".
  - Error responses: https://learn.microsoft.com/en-us/linkedin/marketing/error-responses, Example 4 (400
    `VERSION_MISSING`, "A version must be present. Please specify a version by adding the Linkedin-Version header.")
    and Example 5 (426 `NONEXISTENT_VERSION`, "Requested version yyyymmdd is not active").
  - Migrations, "API Migration Status" table: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/migrations
    (updated 2026-10-14). Sunset dates in section 3 are copied from it. The table has no 202512 row and no 202412 row.
  - Posts API: https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api (updated
    2026-05-13): "All APIs require the request header Linkedin-Version: {Version in YYYYMM format}" and
    `X-Restli-Protocol-Version: 2.0.0`; "The Posts API replaces the ugcPosts API"; its error table lists
    "422 | UNPROCESSABLE_ENTITY" with no duplicate-specific text.
- **Siar, code** (this checkout): `linkedin.ts` line 38 `LINKEDIN_VERSION = '202609'`; line 114 sends it on every
  `/rest` call with `x-restli-protocol-version: 2.0.0`; line 103 maps 426 to `NOT_CONFIGURED` with the user-facing
  message quoted in section 4; line 106 maps 409 and 422 "duplicate" to `DUPLICATE`; lines 355-366 the error
  reference; line 382 the refresh-token rule. `packages/networks/src/lib/errors.ts`: only `RATE_LIMITED` and
  `NETWORK_UNAVAILABLE` are retryable; `toVerbose()` gives `errorsVerbose.<TYPE>.retryability`.
  `apps/api/src/modules/posts.ts` `post.retry` re-sends only failed targets, up to 6 retries.
- **Third party, measured 2026-11-12:** Postiz issue #2005, opened 2026-09-01, still open:
  https://github.com/gitroomhq/postiz-app/issues/2005. It shows a header of `202501` answered with
  `{"status":426,"code":"NONEXISTENT_VERSION","message":"Requested version 20250101 is not active"}`. Used only as
  evidence for the "LinkedIn adds a day" and "check your dependencies" lines. Postiz is not named on the page.
- **Status line:** `messaging.md` §9, word for word.

Labels in editor notes: **[sourced]** LinkedIn's own page above, **[code]** this checkout, **[measured]** seen today,
**[third-party]** someone else's page, **[inferred]** judgement.

---

## Meta

| Field | Value |
|---|---|
| URL | `https://siaran.my/linkedin-api/errors` (unchanged, already live) |
| Meta title (58 chars) | `LinkedIn API error 426 NONEXISTENT_VERSION: the fix \| Siar` |
| Meta description (151 chars) | `LinkedIn retires API version 202511 on 16 Nov 2026 and answers with 426 NONEXISTENT_VERSION. Send Linkedin-Version 202610. Every LinkedIn error, fixed.` |
| H1 | LinkedIn API error 426 NONEXISTENT_VERSION, and how to fix every LinkedIn error |
| Visible date line (under the H1) | Updated 12 November 2026. LinkedIn facts checked on LinkedIn's own documentation on 12 November 2026. |
| Canonical | `https://siaran.my/linkedin-api/errors` |
| Kicker (one plain kicker, no side note) | LinkedIn API |

Editor notes:
- Title: "| Siar" is allowed because the title already carries a network name and "API" (strike plan §5.0 rule 6). The
  title must not echo `/docs/errors` or the future `/errors` hub title.
- After 16 November 2026 the date-sensitive lines switch tense. Every switch is listed in section 12. Ship the
  pre-sunset wording now; flip on 17 November.

---

## 1. Hero

**H1:** LinkedIn API error 426 NONEXISTENT_VERSION, and how to fix every LinkedIn error

**Date line:** Updated 12 November 2026. LinkedIn facts checked on LinkedIn's own documentation on 12 November 2026.

**Subhead (the answer, 59 words):**

> LinkedIn returns HTTP 426 `NONEXISTENT_VERSION`, "Requested version yyyymmdd is not active", when the
> `Linkedin-Version` header names a version LinkedIn has retired. Version 202511 retires on 16 November 2026. The fix
> is one header: send a current version in YYYYMM form, such as 202610, the latest. Siar, a
> [unified social media API](/), sends 202609, so Siar users are not affected.

**Hero links (text links, no buttons; the answer leads):**
- Jump to the fix (`#fix-426`)
- See every LinkedIn error (`#all-errors`)

Editor notes: the 202511 date and the 202610 "latest" are [sourced, versioning page]. "Siar sends 202609" is [code,
`linkedin.ts` line 38]. The category anchor "unified social media API" points to `/` (strike plan §6 rule 1).

---

## 2. Fix 426 NONEXISTENT_VERSION before 16 November 2026

Anchor: `#fix-426` (also keep `#code-426` on the entry in section 6).

**H2:** Fix 426 NONEXISTENT_VERSION before 16 November 2026

**Body:**

> Every call to `https://api.linkedin.com/rest/` must carry a `Linkedin-Version` header in YYYYMM form. LinkedIn does
> not fall back to the latest version when yours is missing or retired. It refuses the call. A post your scheduler
> sends at 9 a.m. on 16 November with `Linkedin-Version: 202511` fails with 426, and so does every retry with the same
> header.
>
> The fix takes four steps:
>
> 1. **Find every place the header is set.** Search your code and your dependencies, not only your own files. SDKs and
>    open-source integrations often hardcode it. Headers are case-insensitive, so search for `linkedin-version` in any
>    case, and for constants such as `LINKEDIN_VERSION`.
> 2. **Set it to 202610.** That is the latest version and LinkedIn supports it until 15 October 2027. Any version that
>    has not been sunset works, but an older one brings the next deadline closer.
> 3. **Read LinkedIn's changelog between your version and 202610.** LinkedIn says the paths may stay the same while
>    "the behavior of the individual API methods can change". Run one test post per content type you use.
> 4. **Ship it before 16 November 2026**, then check that a real post returns `201` with a post URN in the
>    `x-restli-id` header.

**Code block, labelled "Example: the header change"**

```bash
# Before: fails from 16 November 2026 with 426 NONEXISTENT_VERSION
-H 'Linkedin-Version: 202511'

# After: supported until 15 October 2027
-H 'Linkedin-Version: 202610'
```

**Code block, labelled "Example: a text post to your own profile with the new header"**

```bash
curl -X POST 'https://api.linkedin.com/rest/posts' \
  -H 'Authorization: Bearer YOUR_MEMBER_TOKEN' \
  -H 'Linkedin-Version: 202610' \
  -H 'X-Restli-Protocol-Version: 2.0.0' \
  -H 'Content-Type: application/json' \
  --data '{
    "author": "urn:li:person:YOUR_PERSON_ID",
    "commentary": "Release notes for version 2.4 are out.",
    "visibility": "PUBLIC",
    "distribution": { "feedDistribution": "MAIN_FEED", "targetEntities": [], "thirdPartyDistributionChannels": [] },
    "lifecycleState": "PUBLISHED",
    "isReshareDisabledByAuthor": false
  }'
```

**Code block, labelled "LinkedIn's documented response for a retired version"**

```json
{
  "status": 426,
  "code": "NONEXISTENT_VERSION",
  "message": "Requested version yyyymmdd is not active"
}
```

**Small print under the block:**

> LinkedIn writes the version back with a day added. In one public report, a header of `202501` came back as
> "Requested version 20250101 is not active". So "20251101" in your logs means you sent 202511.

Editor notes:
- "Does not fall back to the latest": [sourced] "the latest version is not applied by default". The 9 a.m. scheduler
  line is an illustration of that rule, not a measured event [inferred].
- 202610 supported "until 15 October 2027": [sourced, migrations table "October 15, 2027"].
- "SDKs and open-source integrations often hardcode it": [third-party] Postiz #2005 shows one case; "often" is
  [inferred]. Do not name Postiz on the page.
- "201 with a post URN in `x-restli-id`": [sourced, Posts API page].
- The day-added line: [third-party, Postiz #2005]. The "20251101" reading is [inferred] from that pattern.
- The post example uses `urn:li:person`, not `urn:li:organization`, because Siar cannot post to company pages and the
  page should not model that flow next to Siar's name.

---

## 3. When each LinkedIn API version retires

Anchor: `#sunset-dates`

**H2:** When each LinkedIn API version retires

**Lead:**

> LinkedIn ships a new Marketing API version most months and supports each one "for a minimum of one (1) year". These
> are the versions that still work on 12 November 2026, with LinkedIn's own sunset dates.

**Table (real data leads; one row per version):**

| Version header | Sunset date | Note |
|---|---|---|
| 202511 | 2026-11-16 | Retires in days. Move off it now |
| 202601 | 2027-01-15 | The next one to go after 202511 |
| 202602 | 2027-02-15 | |
| 202603 | 2027-03-16 | |
| 202604 | 2027-04-15 | |
| 202605 | 2027-05-15 | |
| 202606 | 2027-06-15 | |
| 202607 | 2027-07-15 | |
| 202608 | 2027-08-17 | |
| 202609 | 2027-09-15 | The version Siar sends |
| 202610 | 2027-10-15 | Latest |

**Caption:** Source: LinkedIn, [API Migration Status](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/migrations#api-migration-status), checked 12 November 2026.

**Below the table:**

> There is no 202512. LinkedIn's table goes from 202511 straight to 202601, and it skipped December in 2024 too. If you
> bump to 202601, you will be back on this page on 15 January 2027. Bump to 202610 and you have until October 2027.

Editor notes:
- Every date in the table is [sourced, migrations table]. Re-fetch on 2026-11-16 and drop the 202511 row on 17 November
  (section 12).
- "No 202512 / skipped December in 2024": [sourced] by absence: the table has no 202512 or 202412 row. What LinkedIn
  returns for a 202512 header was not tested. Do not claim it returns 426.
- "Most months": the table shows monthly versions except December [sourced]; LinkedIn's page says "monthly cycle".

---

## 4. How Siar handles this

Anchor: `#siar` (a boxed aside, at most three lines, as every library page has; strike plan §6 rule 2)

**H2 (box title):** How Siar handles this

**Box body:**

> Siar sends `Linkedin-Version: 202609` on every LinkedIn call, so the 16 November sunset does not touch Siar posts.
> The version is one constant in Siar's code, and LinkedIn supports 202609 until 15 September 2027. If LinkedIn ever
> refuses it, the post fails with LinkedIn's own 426, marked [don't retry](/how-publishing-works#errors), and the
> message "Siar is using a LinkedIn API version that LinkedIn has retired. This needs a Siar update."

**Link under the box:** [How Siar reports a failed post](/how-publishing-works#errors)

Editor notes:
- [code] `linkedin.ts` lines 38, 103, 114; `errors.ts` (`NOT_CONFIGURED` is non-retryable). Sunset date [sourced].
- No promise of when Siar bumps the version, and no reply time (messaging §10). Strike plan §2 row 6 keeps an internal
  calendar reminder before September 2027; that stays off the page.
- `/how-publishing-works` is a W1 page. Until it is live, point both links at `/docs/errors`.

---

## 5. 400 VERSION_MISSING: the header is not there

Anchor: `#code-400-version-missing`

**H2:** 400 VERSION_MISSING · A version must be present · no Linkedin-Version header

**Body:**

> **What it means.** The call reached a versioned LinkedIn endpoint with no `Linkedin-Version` header. LinkedIn's
> message is "A version must be present. Please specify a version by adding the Linkedin-Version header." This often
> shows up after moving from the old `ugcPosts` API to `/rest/posts`, which LinkedIn says replaces it.
>
> **How to fix it.** Add `Linkedin-Version: 202610` and `X-Restli-Protocol-Version: 2.0.0` to every request to
> `https://api.linkedin.com/rest/`. LinkedIn's Posts API page says all of its APIs require both headers.
>
> **Through Siar.** You will not see this code. Siar sets both headers on every call.

**Code block, labelled "LinkedIn's documented response for a missing header"**

```json
{
  "status": 400,
  "code": "VERSION_MISSING",
  "message": "A version must be present. Please specify a version by adding the Linkedin-Version header."
}
```

Editor notes: response and both header rules [sourced]. "Often shows up after moving from ugcPosts" is [inferred].
"Siar sets both headers" [code, line 114]. This entry is page copy, not an adapter entry: Siar cannot produce it, and
the generated list in section 6 is "as relayed by Siar".

---

## 6. Every LinkedIn error Siar relays

Anchor: `#all-errors`

**H2:** Every LinkedIn error Siar relays, and the fix

**Lead:**

> When LinkedIn rejects a request, Siar keeps LinkedIn's own code and message on the post and returns them unchanged,
> with a plain-English fix and a verdict: retry, don't retry, or unknown. The codes below are the ones Siar's LinkedIn
> integration handles. Messages are LinkedIn's wording, shortened where marked "…".

**Entry format (template change):** `H2 = code · LinkedIn's message · plain name`, then "What it means", "How to fix
it", "Siar's verdict". Each entry has an `id` of `code-<slug>` (list below). Keep the old generated `id` as a second,
empty anchor so existing links still land.

### 6.1 `#code-426`

**H2:** 426 NONEXISTENT_VERSION · Requested version yyyymmdd is not active · retired API version

- **What it means.** The `Linkedin-Version` header names a version LinkedIn no longer serves. Version 202511 retires on
  16 November 2026.
- **How to fix it.** Send a supported version, such as 202610, on every `/rest/` call, including calls made by SDKs.
  The full steps are [above](#fix-426).
- **Siar's verdict.** Don't retry. Retrying with the same version fails the same way. Siar sends 202609, supported
  until 15 September 2027.

### 6.2 `#code-422-duplicate`

**H2:** 422 duplicate · Content is a duplicate of urn:li:share:… · same post twice

- **What it means.** The same author already posted the same text recently, and LinkedIn refuses the copy. It often
  happens when a timeout makes a client send a create call twice, or when a scheduled post repeats last week's text.
- **How to fix it.** Change the text. Retrying unchanged text fails again. If the first attempt timed out, check the
  profile before sending again: the post may already be there.
- **Siar's verdict.** Don't retry. Siar claims each network target once, so its own retries and restarts don't send
  the same post twice. Siar has no idempotency key on post creation, so if your code calls create twice, that is two
  posts, and LinkedIn may refuse the second with this code.

### 6.3 `#code-422-empty`

**H2:** 422 empty · Content cannot be empty · post with no text

- **What it means.** LinkedIn needs commentary on a post, even when the post carries an image, video or document.
- **How to fix it.** Add text to the post.
- **Siar's verdict.** Don't retry until the text is added.

### 6.4 `#code-401-65601`

**H2:** 401 65601 · The token used in the request has been revoked by the user · expired or revoked token

- **What it means.** The member removed your app, or the 60-day access token expired.
- **How to fix it.** Ask the member to connect again. LinkedIn issues refresh tokens only to apps it has approved for
  them, so most apps cannot renew a member token without the member.
- **Siar's verdict.** Don't retry. Siar marks the account as needing a reconnect and sends a `social-account.updated`
  webhook.

### 6.5 `#code-403-access-denied`

**H2:** 403 ACCESS_DENIED · Not enough permissions to access: partnerApiPostsExternal.CREATE · missing permission

- **What it means.** The token is missing a scope, or the call needs a LinkedIn product your app was not granted.
  Posting as a company page needs the Community Management API, which LinkedIn vets by hand.
- **How to fix it.** For a personal profile, reconnect and accept every permission (`w_member_social`). For a company
  page, your app needs Community Management access.
- **Siar's verdict.** Don't retry. Siar posts to personal profiles only. LinkedIn has not granted Siar page access.

### 6.6 `#code-429`

**H2:** 429 · Resource level throttle APPLICATION DAY limit for calls to this resource is reached · daily quota used

- **What it means.** The app used its daily quota for this endpoint. LinkedIn resets it at midnight UTC.
- **How to fix it.** Wait for the reset, then send again. Spread scheduled posts across the day if you hit it often.
- **Siar's verdict.** Retry. Siar records when the quota resets and sends again after it.

### 6.7 `#code-400-media`

**H2:** 400 media · Media asset urn:li:image:… is not available · media not ready or missing

- **What it means.** An uploaded image, video or document was not found, expired, or is still processing.
- **How to fix it.** Wait until the asset's status is `AVAILABLE` before creating the post. Upload the image again if
  the error repeats.
- **Siar's verdict.** Don't retry as is. Siar already waits for videos and documents to become `AVAILABLE` before it
  posts.

### 6.8 `#code-400-fields`

**H2:** 400 fields · Unpermitted fields present in REQUEST_BODY · field combination LinkedIn refuses

- **What it means.** The request has a field, or a combination of fields, LinkedIn does not allow. One example:
  `CONTAINER` visibility on a post that is not inside a container.
- **How to fix it.** Use `PUBLIC`, `CONNECTIONS` or `LOGGED_IN` visibility unless the post belongs to a container,
  and remove fields the Posts API does not list.
- **Siar's verdict.** Don't retry until the request is changed.

### 6.9 `#code-404`

**H2:** 404 · Not Found · post or comment is gone

- **What it means.** The post or comment was deleted, or belongs to another author.
- **How to fix it.** Check that it still exists on LinkedIn and that the token belongs to its author.
- **Siar's verdict.** Don't retry.

### 6.10 `#truncated-text`

**H2:** No error · the post is cut off · unescaped characters

- **What it means.** LinkedIn's commentary uses its "little" text format. An unescaped `(`, `[` or similar reserved
  character cuts the post off there, and LinkedIn returns success anyway.
- **How to fix it.** Backslash-escape these characters in commentary: `| { } @ [ ] ( ) < > * _ ~` and `\`. Write
  mentions as `@[Name](urn:li:person:…)`.
- **Siar's verdict.** Nothing to retry. Siar escapes the text for you.

Editor notes for section 6:
- Every code, message and fix comes from `linkedin.ts` lines 355-366 [code]; verdicts from `mapError` (lines 100-110)
  plus `errors.ts` (only `RATE_LIMITED` and `NETWORK_UNAVAILABLE` retryable) [code].
- 6.2: LinkedIn's own Posts API page lists only a generic "422 | UNPROCESSABLE_ENTITY" [sourced]; the "Content is a
  duplicate of …" text is the message Siar's integration matches on [code, line 106]. The two causes ("timeout makes a
  client send twice", "repeats last week's text") are [inferred]. How long LinkedIn's duplicate window is was not
  verified: do not state one. "Siar claims each network target once" and "no idempotency key" are messaging pillar 1
  wording, word for word in substance.
- 6.4: "60-day" and "refresh tokens only for approved apps" [code, header comment and line 382]. The
  `social-account.updated` webhook [code, `events.ts` line 32; messaging pillar 1 allowed line].
- 6.5: no "Siar's request was denied" detail here; the status lives on the hub and `/platforms/approvals`.
- 6.6: "resets at midnight UTC" and "Siar retries after the reset" are Siar's existing reference text [code, line 360,
  `nextMidnightUtc()` line 102]. Midnight UTC is not re-checked on LinkedIn's rate-limit page today [unverified].
- 6.10: the character list is the adapter's header comment [code, line 19]. "Returns success anyway" restates the
  adapter's "(no error — the post is cut off…)" [code].

### Adapter text to change (so the generated page matches this copy)

In `packages/networks/src/adapters/linkedin.ts` `errorReference`:

| Entry | Field | Today | Change to |
|---|---|---|---|
| 426 | `message` | `Requested version 20230101 is not active` | `Requested version yyyymmdd is not active` |
| 426 | `meaning` | `The LinkedIn-Version Siar sends has been retired.` | `The Linkedin-Version header names a version LinkedIn no longer serves. Version 202511 retires on 16 November 2026.` |
| 426 | `fix` | `Update Siar; this is not something you can change per post.` | `Send a supported version, such as 202610, on every /rest/ call, including calls made by SDKs.` |

The other entries keep their facts; the new "plain name" part of each H2 and the "Siar's verdict" lines can live in
two new optional fields (`name`, `verdict`) or in a page-level map keyed by code. Engineering's choice.

---

## 7. Where to see a LinkedIn error in Siar

Anchor: `#where`

**H2:** Where to see a LinkedIn error in Siar

**Body:**

> Read a failed post with `GET /post/{id}`. The `error` field sums it up, `errors` lists it per network, and
> `errorsVerbose.LINKEDIN` keeps LinkedIn's message, the HTTP status and a `retryability` of `retryable`,
> `non_retryable` or `unknown`. A `post.published` webhook fires when the post reaches its final state, with each
> network's result.
>
> If one network fails, the others still publish. Fix the cause and call `POST /post/{id}/retry`: only the networks
> that failed are sent again, and the retry doesn't use another post from your plan. Limits Siar checks before
> sending are on the [LinkedIn API page](/linkedin-api).

Editor notes: field names [code, `errors.ts` `toVerbose()`; live template]. `post.published` wording follows messaging
§10 (never "sent once per post per network"). Retry behavior and "doesn't use another post" [messaging pillar 1 and
§5 objection row, from `posts.ts` and `plans.ts`].

---

## 8. Keep your own LinkedIn integration, or post through Siar

Anchor: `#choose`

**H2:** Keep your own LinkedIn integration, or post through Siar

**Body:**

> If LinkedIn is your only network and you post to company pages, keep your own integration. Bump the header, put a
> reminder in your calendar a month before your version's sunset date, and you are done until next year. Siar cannot
> post to company pages: LinkedIn has not granted Siar page access.
>
> If LinkedIn is one of several networks, the header is one of many things that can stop a post: Meta's token rules,
> X's credits, LinkedIn's text escaping. Siar handles them behind one REST API. Your users connect their own LinkedIn
> profiles through Siar's live LinkedIn app, and you get each network's own error back, with a fix.
>
> One price for your organization, not per account: 20 free posts to try, then from $19 a month (RM39 in Malaysia).

**Status line (from the status constant, word for word):**

> LinkedIn: personal profiles today; company pages open after LinkedIn grants page access.

**CTA row (one primary, one secondary, in words, no arrows):**
- Primary: **Start with 20 free posts**
- Secondary: **Read the quickstart** (`/docs/quickstart`)

Editor notes:
- "Where they win" honesty: doing it yourself wins for company pages and for LinkedIn-only apps (messaging §6 rule 7,
  §4.4 concede line).
- "Meta's token rules, X's credits, LinkedIn's text escaping": each is a code path in this checkout (Meta tokens in the
  Facebook/Instagram adapters, X prepaid credit in `plans.ts` `X_CREDIT_NOTE`, LinkedIn escaping in `linkedin.ts`)
  [code]. No claim that Siar absorbs every network change instantly (market.md P6 rule).
- "Siar's live LinkedIn app": [doc, `docs/approvals/linkedin.md`, "Siar" app live in production]. Do not write
  "white-label"; this page does not need the connect-link wording at all.
- Price line: messaging §2 level 3 and §8 one-liner. "20 free posts to try" with "to try" always.

---

## 9. Objection handling (where each answer sits on the page)

| Objection a developer brings | Answer on the page | Where |
|---|---|---|
| "I only need to fix my header. Why is a vendor page telling me?" | The fix is the first thing on the page and needs no Siar account. Siar appears in one box after the fix | Hero, §2, §4 |
| "Will bumping the version break something else?" | LinkedIn says behavior "can change" between versions; read the changelog and run one test post per content type | §2 step 3, FAQ 7 |
| "Can't I just always send the latest version?" | LinkedIn never applies the latest by default, and each month's version is a new header value. Pick one, test it, set a reminder before its sunset | §2, FAQ 3 |
| "What if Siar falls behind on LinkedIn's versions?" | Siar's version is one constant; 202609 is supported until 15 September 2027; if it were refused, the post fails with LinkedIn's 426 and says it needs a Siar update. No promise of a date or response time | §4, FAQ 10 |
| "Can Siar post to my company page?" | No. Personal profiles only; LinkedIn has not granted Siar page access | §6.5, §8, FAQ 11 |
| "Does Siar give me LinkedIn analytics and comments?" | Not claimed. Leave it out of the page; if asked in support, "not confirmed on personal profiles yet" (siar-truth §2) | Not on the page |
| "Who uses Siar? Uptime?" | Not on this page. If a section ever needs it, messaging §5: live since 12 October 2026, no case studies or uptime record yet; check the OpenAPI file and the error references | — |

---

## 10. FAQ

Visible on the page, in this order, and mirrored exactly in FAQPage JSON-LD. Each answer leads with the answer and is
40-60 words.

**1. What does LinkedIn API error 426 NONEXISTENT_VERSION mean?**

> It means the `Linkedin-Version` header on your request names a version LinkedIn has retired. LinkedIn answers with
> HTTP 426 and "Requested version yyyymmdd is not active". It never falls back to a newer version. Set the header to a
> supported version in YYYYMM form, such as 202610, on every call to `https://api.linkedin.com/rest/`.

**2. When does LinkedIn API version 202511 stop working?**

> LinkedIn retires Marketing Version 202511 on 16 November 2026. From then on, any call that sends
> `Linkedin-Version: 202511` fails with HTTP 426 `NONEXISTENT_VERSION`. The next version to retire is 202601, on
> 15 January 2027. LinkedIn lists every sunset date on its API Migration Status page, and supports each version for
> at least one year.

**3. Which Linkedin-Version header should I use?**

> Use 202610, the latest version on 12 November 2026, which LinkedIn supports until 15 October 2027. Any version that
> has not been sunset works, but an older one brings your next migration closer. Write it as six digits, year then
> month, and send it with `X-Restli-Protocol-Version: 2.0.0`.

**4. What is LinkedIn API error 400 VERSION_MISSING?**

> LinkedIn returns 400 `VERSION_MISSING` when a request to a versioned endpoint has no `Linkedin-Version` header. The
> message reads "A version must be present. Please specify a version by adding the Linkedin-Version header." Add the
> header, for example `Linkedin-Version: 202610`, to every request under `https://api.linkedin.com/rest/`.

**5. Why does the error say 20251101 when I sent 202511?**

> LinkedIn writes the version back with a day added. A header of 202511 is the November 2025 version, so the message
> shows it as 20251101. In one public report, a header of 202501 came back as "Requested version 20250101 is not
> active". The fix is the same: send a supported YYYYMM version.

**6. Is there a LinkedIn API version 202512?**

> No. LinkedIn's migration table lists 202511 and then 202601, with no December 2025 version, and it skipped December
> 2024 as well. If you are leaving 202511, choose a version from LinkedIn's table. 202610 is the latest and gives you
> until 15 October 2027.

**7. Will changing the LinkedIn API version break my integration?**

> It can. LinkedIn says resource paths often stay the same across versions, but "the behavior of the individual API
> methods can change". Read LinkedIn's changelog for every version between yours and the new one, then send one test
> post for each content type you use, such as text, image, video and document.

**8. Why does LinkedIn return 422 "Content is a duplicate"?**

> LinkedIn refused the post because the same author already published the same text recently. Change the text before
> sending again; a retry with identical text fails the same way. If the first attempt timed out, check the profile
> first, because that post may already be live and a second create call would be the duplicate.

**9. Do I need the Linkedin-Version header on every LinkedIn call?**

> Yes, on every call under `https://api.linkedin.com/rest/`, where LinkedIn's versioned APIs live. LinkedIn's Posts API
> page says all its APIs require `Linkedin-Version` and `X-Restli-Protocol-Version: 2.0.0`. Sign-in calls such as
> `/v2/userinfo` sit outside that base path; Siar's own integration calls it without the version header.

**10. Are Siar users affected by the LinkedIn 202511 sunset?**

> No. Siar, a unified social media API, sends `Linkedin-Version: 202609` on every LinkedIn call, and LinkedIn supports
> 202609 until 15 September 2027. Posts to LinkedIn personal profiles through Siar keep working after 16 November 2026.
> You don't set or change the version yourself; it is part of Siar.

**11. Can Siar post to LinkedIn company pages?**

> Not today. Siar posts to LinkedIn personal profiles: text, images, video, documents and links. Company pages need
> LinkedIn's Community Management API, and LinkedIn has not granted Siar page access. Company pages open after LinkedIn
> grants it. Until then, post from a personal profile, or keep your own integration for pages.

Editor notes:
- FAQ 1-4, 6, 7, 9 (first two sentences) [sourced]. FAQ 5 [third-party + inferred], as in §2. FAQ 6's "skipped
  December 2024" is [sourced] by absence in the table.
- FAQ 9 last sentence: Siar's adapter calls `/v2/userinfo` through a path that does not add the header [code, lines
  197 and 114]. Do not write "LinkedIn does not require it there": not on LinkedIn's pages [unverified].
- FAQ 10: "keep working" is limited to the version question. It is not a delivery promise (messaging §1): posts can
  still fail for other reasons, which the rest of the page covers.
- FAQ 11: allowed wording from siar-truth §2 row "LinkedIn company pages" and messaging §5. Content types [code / truth §1a].

---

## 11. Latest LinkedIn changes (block on this page and on the `/linkedin-api` hub)

**H2:** Latest LinkedIn changes

> **16 November 2026: LinkedIn retires API version 202511.** Calls that still send it fail with 426
> NONEXISTENT_VERSION. [Read the entry](/network-changes#2026-11-16-linkedin-202511-sunset)

**Link:** [All network API changes](/network-changes)

### The `/network-changes` entry (new page, seed entry)

Anchor: `#2026-11-16-linkedin-202511-sunset`
Network tag: LinkedIn. Date: 2026-11-16 (the effective date; listed newest first by this date). Published: 2026-11-12.

**Entry title:** LinkedIn retires Marketing API version 202511

**Entry body (116 words):**

> LinkedIn retires Marketing API version 202511 on 16 November 2026. From that day, any request with
> `Linkedin-Version: 202511` fails with HTTP 426 `NONEXISTENT_VERSION` and the message "Requested version yyyymmdd is
> not active". LinkedIn does not fall back to a newer version.
>
> What to do: set the header to a supported version in YYYYMM form. The latest is 202610, supported until 15 October
> 2027. There is no 202512. The next version to retire is 202601, on 15 January 2027.
>
> Siar sends 202609, supported until 15 September 2027, so posts to LinkedIn profiles through Siar are not affected.
>
> Sources: LinkedIn, [Versioning](https://learn.microsoft.com/en-us/linkedin/marketing/versioning) and
> [API Migration Status](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/migrations#api-migration-status),
> checked 12 November 2026.
>
> Affects: [LinkedIn API errors](/linkedin-api/errors#code-426) · [LinkedIn API](/linkedin-api)

Editor notes:
- Strike plan §5.2 row `/network-changes`: one data file, anchored entries, newest first, 80-150 words, each sourced;
  hubs show the latest 3. This entry fits (116 words, counted with the sources and links lines).
- If `/network-changes` cannot ship by 16 November, ship this page without the block and add it the day the log goes
  live. Never link to a 404.

---

## 12. Tense switch on 17 November 2026

| Where | Before (ship now) | After (from 17 November 2026) |
|---|---|---|
| Meta description | `LinkedIn retires API version 202511 on 16 Nov 2026 and answers with 426 NONEXISTENT_VERSION. Send Linkedin-Version 202610. Every LinkedIn error, fixed.` | `LinkedIn retired API version 202511 on 16 Nov 2026 and answers with 426 NONEXISTENT_VERSION. Send Linkedin-Version 202610. Every LinkedIn error, fixed.` (151) |
| Subhead | "Version 202511 retires on 16 November 2026." | "Version 202511 retired on 16 November 2026." |
| §2 H2 | "Fix 426 NONEXISTENT_VERSION before 16 November 2026" | "Fix 426 NONEXISTENT_VERSION" |
| §2 body | "A post your scheduler sends at 9 a.m. on 16 November with `Linkedin-Version: 202511` fails with 426…" | "Since 16 November 2026, a post sent with `Linkedin-Version: 202511` fails with 426…" |
| §2 step 4 | "Ship it before 16 November 2026, then check…" | "Ship it, then check…" |
| §2 code comment | "fails from 16 November 2026" | "fails since 16 November 2026" |
| §3 table | 202511 row present | Drop the 202511 row; 202601 note becomes "Next to retire" |
| §3 lead | "still work on 12 November 2026" | "still work on <re-check date>" after re-fetching the migrations table |
| §6.1, FAQ 2, FAQ 10 | "retires on 16 November 2026" / "after 16 November 2026" | "retired on 16 November 2026" / "since 16 November 2026" |
| Date line | Updated 12 November 2026 | Updated 17 November 2026 (and the TechArticle `dateModified`) |

If LinkedIn publishes 202611 before 17 November, "202610, the latest" changes everywhere to the new latest, with its
sunset date from the migrations table. Re-fetch the versioning page on 16 November.

---

## 13. Closing CTA

**H2:** Write it once. Siar it everywhere.
**Dim line:** Everywhere that's open today.

**Body:**

> Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack, from one request. Start with
> 20 free posts to try. No card.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart

Editor note: same closing block as `/platforms` and `/features` copy. The network list is messaging §1a allowed wording.

---

## 14. Internal links

**Out from this page (anchor text in quotes):**

| To | Anchor text | Where | Note |
|---|---|---|---|
| `/` | "unified social media API" | Hero subhead | The only anchor for this phrase (strike plan §6 rule 1) |
| `/linkedin-api` | "LinkedIn API page", "LinkedIn API" | §7, §11 entry | Hub, up-link |
| `/errors` | "Social media API error codes, by network" | Under §6 lead, once | W1 hub. Add when live; until then omit |
| `/docs/errors` | "Siar's own error envelope" | Under §7 | Exists today |
| `/how-publishing-works#errors` | "don't retry", "How Siar reports a failed post" | §4 box | W1 page. Until live, use `/docs/errors` |
| `/network-changes#2026-11-16-linkedin-202511-sunset` | "Read the entry" | §11 | New. Only when live |
| `/network-changes` | "All network API changes" | §11 | New. Only when live |
| `/platforms#linkedin` | "LinkedIn status" | Status line in §8 | Exists |
| `/platforms/approvals#linkedin` | "LinkedIn approval record" | §6.5 | W1. Add when live |
| `/x-api/errors#code-403-duplicate` | "X API 403 duplicate content" | Under FAQ 8, one line: "X refuses duplicate posts too:" | Sibling error page (C88, p042) |
| `/docs/quickstart` | "Read the quickstart" | §8, §13 | Exists |
| `/docs/webhooks` | "`post.published` webhook" | §7 | Exists |

**In to this page (add on these pages):**

| From | Anchor text | Note |
|---|---|---|
| `/linkedin-api` hub | "LinkedIn API error codes" (query wording, strike plan §6 rule 4) | In the hub's link row |
| `/linkedin-api` hub | "LinkedIn API 426 NONEXISTENT_VERSION" | In the hub's "Latest LinkedIn changes" block, via the §11 entry |
| `/network-changes` entry | "LinkedIn API errors" to `#code-426` | Entry "Affects" line |
| `/errors` hub (W1) | Each LinkedIn code to its `#code-…` anchor | Generated |
| `/platforms` LinkedIn row | "LinkedIn API errors" | Optional, in the row's links |
| `/changelog` (if the version bump to 202609 is listed) | "LinkedIn version sunset" | Only if the changelog has a LinkedIn entry; do not invent one |

---

## 15. Schema notes

- **TechArticle** (keep the site's pattern): `headline` = the H1; `datePublished` = first publish date of the page;
  `dateModified` = 2026-11-12, then 2026-11-17 after the tense switch (fed by `apps/site/src/lib/updated.mjs`, which
  already feeds the sitemap `lastmod` and TechArticle `dateModified`); `about` = `{"@type": "Thing", "name":
  "LinkedIn API"}`; `mentions` = `{"@type": "Thing", "name": "HTTP 426 NONEXISTENT_VERSION"}`; `isPartOf` = the
  `/linkedin-api` page; `publisher` = `#org`. No `author` person (none is shown on the page).
- **BreadcrumbList:** exists. Keep "LinkedIn API" then "LinkedIn API errors" (rename the second item from "Errors" so
  the crumb matches the query wording).
- **FAQPage:** the 11 Q&As in §10, text identical to the visible answers. No FAQ item that is not visible.
- **No HowTo, Review, AggregateRating, SoftwareApplication offers or Product schema** on this page (strike plan §5.0
  rule 5).
- **Organization JSON-LD in the shared layout:** the live `description` says "across 15 networks". That is a
  site-wide fix in Wave 0 (siar-truth §6, "15" only as "built for 15 networks"); flag it, don't fix it per page.
- Code blocks: plain `<pre><code>` with a visible "Example" label; no `Code` schema needed.

---

## 16. Why this wins

**Primary keyword:** linkedin api error 426 NONEXISTENT_VERSION.
**Secondary:** linkedin api version sunset 202511; linkedin-version header; linkedin api VERSION_MISSING; linkedin api
422 duplicate post (p041). Also caught on the page: "linkedin api 202512", "requested version is not active linkedin",
"linkedin api version 202610", "linkedin api errors".

**Demand (all [inferred] from sibling measurements):** "linkedin api error 426 / linkedin api errors" showed
autocomplete 4 (keyword map C92, per-network #63). The search engines could not be re-queried for this file: the
shared web-search budget for this run was spent before this page started, so autocomplete, People Also Ask and SERPs
were not measured again today. The demand case is the date, not the volume: every app still on 202511 starts failing
on 16 November 2026, and developers search the exact error text when it happens. A public tracker issue for the same
426 (Postiz #2005, opened 2026-09-01, still open) shows the error reaches real integrations [third-party, measured].

**Why Siar can win it:**
- Exact-code page type already ranks for small vendors (postpeer.dev, measured once, strike plan §2).
- LinkedIn's own pages give the rule but not the dates and the fix in one place. This page has the answer in 59
  words, the full sunset table, the "no 202512" trap and the day-added message quirk, each sourced [inferred value].
- Siar's own answer is a plain fact from code (202609), so the vendor part costs one box and no credibility.
- It feeds `/network-changes` and `/errors`, the two freshness hubs in the strike plan.

**AI prompts it targets** (`prompts_v2` and the error set in keyword map §5):
- p041 "LinkedIn API 422 duplicate post" (Siar already has the code).
- "what changed in the LinkedIn API in November 2026" (prompts_v2).
- "LinkedIn API error 426 NONEXISTENT_VERSION how to fix".
- "which Linkedin-Version header should I use" / "is there a LinkedIn API version 202512".
- "social media API that returns the platform's own error message" (prompts_v2; answered by §6 lead and §7).
- "does Siar work after LinkedIn's version sunset" (brand + mechanism).

**Measure:** add the five prompts above to the citation tracker; check Bing and Google for "linkedin api error 426"
and "NONEXISTENT_VERSION" on 2026-11-19 and 2026-12-03. Kill rule from strike plan §2: an intro that explains Siar
before the error. This page puts the answer first.
