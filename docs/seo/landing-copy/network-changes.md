# /network-changes: final copy (en)

Status: publish-ready copy, written 2026-11-12. Strike plan §5.2 row `/network-changes` (N2, NEW, **W1, then weekly**),
§5.12 ("one data file, anchored entries, latest 3 shown on hubs"), §6 (hubs link their latest 3 entries), §8 lever 4
("dated, first-hand content engines can cite for 'when' and 'why' questions"), O12 (RSS/JSON feed). Segment: developers
(`market.md` P6 "API churn and forced migrations"; `messaging.md` §4.4). There is no current page: `apps/site/src/pages/`
has `changelog.mdx` (Siar's own product changes) but no `network-changes` page, and `/network-changes` returned 404 on
2026-11-12 [measured, per `landing-copy/linkedin-api-errors.md`]. This is new copy. `/changelog` stays as it is, for
Siar's own releases, and gains one link to this page (section 11).

**Ship by 16 November 2026** if possible, so the LinkedIn entry is live on the sunset day and the LinkedIn hub and
`/linkedin-api/errors` can link it (they must not link a 404).

Sources for every network fact on this page, all fetched by me on 2026-11-12 [sourced]:

- **LinkedIn:**
  - Versioning, https://learn.microsoft.com/en-us/linkedin/marketing/versioning (updated 2026-10-14): "The Marketing
    Version 202511 (Marketing November 2025) will be sunset on November 16, 2026."; latest version "October 2026 |
    202610"; versions "supported for a minimum of one (1) year"; "the latest version is not applied by default".
  - Migrations, "API Migration Status", https://learn.microsoft.com/en-us/linkedin/marketing/integrations/migrations
    (updated 2026-10-14): 202511 sunset November 16, 2026; 202601 January 15, 2027; 202609 September 15, 2027; 202610
    October 15, 2027. No 202512 row.
  - Error responses, https://learn.microsoft.com/en-us/linkedin/marketing/error-responses, Example 5: `{"status": 426,
    "code": "NONEXISTENT_VERSION", "message": "Requested version yyyymmdd is not active"}`.
- **YouTube:**
  - Revision history, https://developers.google.com/youtube/v3/revision_history. 2026-11-03: `thumbnails.set` "now
    supports uploading custom thumbnails for YouTube Shorts after video processing is complete"; `shortsAspectRatio`
    added to the `thumbnails` resource. 2026-11-02: uploads through `videos.insert` "from unverified API projects are no
    longer restricted to private viewing" mode; "This change reverses the policy announced on July 28, 2020"; unset
    `status.privacyStatus` "defaults to public"; "Certain uploads might default to private based on creator account
    settings". 2026-06-01: `videos.insert` and `search.list` "charged to their own respective quota buckets"; limits in
    the Google Cloud Console, more through the Quota Extension Form.
  - `thumbnails.set`, https://developers.google.com/youtube/v3/docs/thumbnails/set: call it "only after the video has
    finished processing" (`processingDetails.processingStatus` = `succeeded`); max 50MB; `image/jpeg`, `image/png`,
    `application/octet-stream`; about 50 quota units. The page does not mention a verified-channel requirement.
  - `videos.insert`, https://developers.google.com/youtube/v3/docs/videos/insert: "Videos uploaded from unverified API
    projects are not restricted to private viewing mode."; "Quota impact: 100 calls per day. A call to this method has a
    quota cost of 1 unit in the Video Uploads quota bucket."
- **Slack:**
  - Changelog, https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps (re-checked as
    the brief asked): `conversations.history` and `conversations.replies` move from Tier 3 to Tier 1 for apps
    "commercially distributed outside of the Marketplace"; 1 request per minute; max and default `limit` 15; effective
    immediately for new unlisted apps and new installations on 2025-05-29; "The new rate limits will not be applied to
    existing installations"; "Internal customer-built applications are not impacted"; custom apps 50+ per minute, limit
    1,000. The page carries a note that it "has been updated to clarify the rate limits for existing internal
    customer-built apps" (no date given).
  - Method reference, https://docs.slack.dev/reference/methods/conversations.history: still lists "Tier 3: 50+ per
    minute", `limit` default 100, max 999, with **no mention** of the non-Marketplace limit [measured]. Used in the
    Slack entry as a trap worth naming.

Siar facts, from this checkout [code] and owner records [doc]:
- LinkedIn: `packages/networks/src/adapters/linkedin.ts` line 38 `LINKEDIN_VERSION = '202609'`, line 114 sends it on
  every `/rest` call. Profiles only in production (siar-truth §1a, §2).
- YouTube: `youtube.ts` line 340 sends `privacyStatus: PRIVACY[d.privacy ?? 'PUBLIC']` on every upload (never unset);
  lines 382-384 add `lockedPrivate: true` and a warning when YouTube returns private after public was requested;
  lines 349-356 call `thumbnails/set` **straight after the upload**, before processing ends, for videos and Shorts
  alike; line 375-379 marks the post POSTED only once YouTube reports `uploadStatus: processed`;
  `POST /api/v1/misc/youtube/thumbnail` (`misc.youtube.setThumbnail`, body `teamId`, `postId`, `url`) sets a thumbnail
  on an existing post (lines 487-497, `packages/contract/openapi.json`); lines 65-66 map `quotaExceeded` /
  `dailyLimitExceeded` to `RATE_LIMITED` with the reset time and the message "The YouTube API quota for this project
  is used up for today." Status line: `messaging.md` §9 ("YouTube: connect and upload now; public uploads not yet
  confirmed."), as corrected by strike plan §2 row 7.
- Slack: `slack.ts` lines 35 and 288-290 read replies with `conversations.replies`, at most 15 per page; 429s are
  retried by the engine (`RATE_LIMITED` with `Retry-After`, lines 40-43). Siar's Slack app uses public distribution,
  not the Marketplace [doc: `docs/approvals/discord-slack-bluesky-mastodon.md`]. Status line: `messaging.md` §9.

Not measured today: search demand. The shared web-search budget for this run was spent before this page started, so
autocomplete, People Also Ask and SERPs for "social media api changes" could not be checked. Demand notes in section 17
rest on sibling measurements and are labelled.

Labels in these editor notes (never on the page): **[sourced]** the network's own page with URL, checked 2026-11-12;
**[code]** this checkout; **[doc]** Siar's own records; **[measured]** seen by me today; **[inferred]** judgement.

---

## Meta

| Field | Value |
|---|---|
| URL | `https://siaran.my/network-changes` |
| Meta title (50 chars) | `Social media API changes, dated and sourced \| Siar` |
| Meta description (151 chars) | `Network API changes that break posting apps, newest first: LinkedIn's 202511 sunset, YouTube's private-upload reversal, Slack limits. Each one sourced.` |
| H1 | Social media API changes, newest first |
| Visible date line (under the H1) | Updated 12 November 2026. Every entry is checked on the network's own page; the date is on each one. |
| Canonical | `https://siaran.my/network-changes` |
| Kicker (one plain kicker, no side note) | Network changes |
| Feeds | `https://siaran.my/network-changes/rss.xml` (RSS 2.0), `https://siaran.my/network-changes/feed.json` (JSON Feed 1.1) |

Editor notes:
- Title: "| Siar" is fine here; the title leads with the query. Do not reuse "Changelog" in the title: `/changelog` is Siar's
  own release notes and must not compete with this page.
- The visible "Updated" date comes from the data file's latest `checked` value (section 13), so it moves only when an
  entry is added or re-checked.

---

## 1. Hero

**H1:** Social media API changes, newest first

**Date line:** Updated 12 November 2026. Every entry is checked on the network's own page; the date is on each one.

**Subhead (answer in the first 60 words; 53 words):**

> Siar, a [unified social media API](/), keeps a dated log of the network API changes that break posting apps. Next up:
> LinkedIn retires API version 202511 on 16 November 2026. Each entry says what changed, who it breaks, what to do and
> what Siar did, with a link to the network's own page.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Follow the RSS feed

Editor notes:
- The subhead's second sentence is date-bound. From 17 November 2026 it reads: "Latest: YouTube now accepts custom
  thumbnails for Shorts through the API (3 November 2026)." Better: generate it from the data file as "Next up: <title>
  on <date>" while an entry's effective date is in the future, else "Latest: <title> (<date>)".
- "unified social media API" is the only anchor for that phrase, pointing to `/` (strike plan §6 rule 1).
- Secondary CTA links `/network-changes/rss.xml`. The JSON feed link sits in section 5.

---

## 2. Latest changes at a glance

**H2:** Latest changes at a glance

**Lead:** One line per change. Click a row for the full entry and its source.

| Date | Network | What changed | Breaks you if |
|---|---|---|---|
| 2026-11-16 (upcoming) | LinkedIn | Marketing API version 202511 retires; calls get 426 `NONEXISTENT_VERSION` | You still send `Linkedin-Version: 202511` |
| 2026-11-03 | YouTube | `thumbnails.set` accepts custom thumbnails for Shorts, after processing | You set a Short's thumbnail before processing finishes |
| 2026-11-02 | YouTube | Uploads from unverified API projects are no longer forced private; unset privacy now means public | You leave `privacyStatus` unset and count on private |
| 2026-06-01 | YouTube | `videos.insert` gets its own quota bucket: 100 calls a day | You plan uploads from the general quota |
| 2025-05-29 | Slack | `conversations.history` and `.replies`: 1 request a minute, 15 messages, for unlisted apps | Your app reads history and is not on the Slack Marketplace |

Editor notes:
- Generated from the data file, sorted by `effective` date, newest first. Each "What changed" cell links its entry
  anchor. No status chips: an upcoming entry shows "(upcoming)" in plain text after the date until the day passes.
- The 2026-06-01 YouTube entry is one more than the brief's seed list. It is sourced on Google's own pages, it is the
  constraint that matters now that the private lock is gone (`keywords/per-network.md` finding 3), and it targets
  "youtube api upload limit" (`strategy-category-creator.md` row `/network-changes`). Drop it if Fakhrul wants exactly
  the seed four; nothing else depends on it.

---

## 3. The entries

Each entry is one block with a stable anchor, rendered from the data file. Layout per entry:
- H2 = entry title (sentence case, tense-neutral so the anchor and title never change).
- One date line in plain text: "Takes effect <date>" (or "Took effect"), "Published <date>", "Checked <date>".
- The network's monochrome glyph next to the H2 (`lib/glyphs.ts`). No chips, no mono-caps labels.
- Four short paragraphs, each opening with a bold lead-in: **What changed.** **Who it breaks.** **What to do.**
  **What Siar did.**
- A "Source" line linking the network's own pages, with "checked <date>".
- An "Affects" line linking the matching Siar pages.

Word counts below are for the four paragraphs including their bold lead-ins (the 80-150 rule), without the Source and Affects lines.

---

### Entry 1

**Anchor:** `#2026-11-16-linkedin-202511-sunset` (already referenced by `landing-copy/linkedin-api-errors.md` §11; keep it)
**Network:** LinkedIn · **Effective:** 2026-11-16 · **Published:** 2026-11-12 · **Checked:** 2026-11-12

**H2:** LinkedIn Marketing API version 202511 sunset

**Date line:** Takes effect 16 November 2026 · Published 12 November 2026 · Checked 12 November 2026

**Body (115 words):**

> **What changed.** On 16 November 2026 LinkedIn retires Marketing API version 202511. A request that sends
> `Linkedin-Version: 202511` gets HTTP 426 `NONEXISTENT_VERSION`, "Requested version yyyymmdd is not active". LinkedIn
> does not fall back to a newer version.
>
> **Who it breaks.** Any app that pins 202511 on calls under `https://api.linkedin.com/rest/`, including posts to
> member profiles and company pages.
>
> **What to do.** Send a supported version in YYYYMM form. The latest is 202610, supported until 15 October 2027. There
> is no 202512. The next version to retire is 202601, on 15 January 2027.
>
> **What Siar did.** Nothing was needed. Siar sends 202609, supported until 15 September 2027, so posts to LinkedIn
> profiles through Siar are not affected.

**Source:** LinkedIn, [Versioning](https://learn.microsoft.com/en-us/linkedin/marketing/versioning),
[API Migration Status](https://learn.microsoft.com/en-us/linkedin/marketing/integrations/migrations#api-migration-status)
and [Error responses, example 5](https://learn.microsoft.com/en-us/linkedin/marketing/error-responses), checked 12
November 2026.

**Affects:** [LinkedIn API errors: 426](/linkedin-api/errors#code-426) · [LinkedIn API](/linkedin-api)

**Hub summary (feeds and hub blocks, 21 words):** LinkedIn retires Marketing API version 202511 on 16 November 2026.
Calls that still send it get 426 NONEXISTENT_VERSION. Move to 202610.

Editor notes:
- Same facts as the seed entry in `linkedin-api-errors.md` §11, restructured into the four parts. If both files are
  edited later, this one wins for the log; that page links here.
- "Nothing was needed" is about the version header only. It is not a delivery promise (`messaging.md` §1).
- **Tense switch on 17 November 2026:** "On 16 November 2026 LinkedIn retires" becomes "On 16 November 2026 LinkedIn
  retired"; "Takes effect" becomes "Took effect"; hub summary "retires … on" becomes "retired … on". Title and anchor
  stay. Generate the verb from the date so nobody has to remember.

---

### Entry 2

**Anchor:** `#2026-11-03-youtube-shorts-custom-thumbnails`
**Network:** YouTube · **Effective:** 2026-11-03 · **Published:** 2026-11-12 · **Checked:** 2026-11-12

**H2:** YouTube API custom thumbnails for Shorts

**Date line:** Took effect 3 November 2026 · Published 12 November 2026 · Checked 12 November 2026

**Body (120 words):**

> **What changed.** Since 3 November 2026, `thumbnails.set` accepts a custom thumbnail for a YouTube Short once the
> video has finished processing. Google also added a `shortsAspectRatio` property to the `thumbnails` resource.
>
> **Who it breaks.** Nothing stops working. It matters to apps that set the thumbnail straight after upload: Google says
> a thumbnail set before processing completes may not be applied.
>
> **What to do.** Wait until `processingDetails.processingStatus` is `succeeded`, then call `thumbnails.set` with a JPEG
> or PNG of up to 50 MB. Each call costs about 50 quota units.
>
> **What Siar did.** Not yet changed. Siar sets a thumbnail right after upload, which can be too early for a Short. For
> Shorts, send it with `POST /api/v1/misc/youtube/thumbnail` after the `post.published` webhook.

**Source:** YouTube Data API, [Revision history, 3 November 2026](https://developers.google.com/youtube/v3/revision_history)
and [thumbnails.set](https://developers.google.com/youtube/v3/docs/thumbnails/set), checked 12 November 2026.

**Affects:** [YouTube API](/youtube-api) · [YouTube API errors](/youtube-api/errors)

**Hub summary (22 words):** YouTube's API now takes custom thumbnails for Shorts, set with thumbnails.set after the
video finishes processing. Setting one earlier may not apply.

Editor notes:
- "What Siar did" is true today [code: `youtube.ts` 349-356 set the thumbnail before processing; 375-379 mark POSTED
  only after `uploadStatus: processed`]. That `processed` lines up with Google's `processingStatus: succeeded` is
  [inferred]; it is why the webhook is the right trigger.
- **Engineering ask for Fakhrul (not copy):** for `type: SHORT` with a `thumbnail`, move the `setThumbnail` call from
  `publish()` into the pending poll, after `uploadStatus === 'processed'`. When that ships, replace the paragraph with:
  > **What Siar did.** On <date>, Siar moved the Shorts thumbnail call to after processing. Pass `thumbnail` when you
  > create the post; Siar sets it once YouTube has finished processing the Short.
  and add a line to `/changelog`.
- Do not say Siar has set a Shorts thumbnail on a real channel: no public upload is recorded (strike plan §2 row 7).
- The thumbnails page does not mention a verified-channel requirement. Siar's error reference does ("Custom thumbnails
  need a verified channel", `youtube.ts` line 257). Keep that out of this entry; it is Siar's reading, not Google's.

---

### Entry 3

**Anchor:** `#2026-11-02-youtube-unverified-uploads-not-private`
**Network:** YouTube · **Effective:** 2026-11-02 · **Published:** 2026-11-12 · **Checked:** 2026-11-12

**H2:** YouTube API uploads from unverified projects no longer forced private

**Date line:** Took effect 2 November 2026 · Published 12 November 2026 · Checked 12 November 2026

**Body (150 words):**

> **What changed.** On 2 November 2026 Google reversed its July 2020 rule. Videos uploaded with `videos.insert` from
> unverified API projects "are no longer restricted to private viewing" mode. If a request leaves
> `status.privacyStatus` unset, the video now defaults to public, though a creator's account settings can still make
> it private.
>
> **Who it breaks.** Apps that left privacy unset and relied on the private lock as a safety net. Test and draft uploads
> from those apps can now go out public.
>
> **What to do.** Set `status.privacyStatus` on every upload. Recheck any screen that tells users their videos will
> stay private.
>
> **What Siar did.** Siar always sends a privacy value (public unless you choose otherwise) and warns when YouTube
> returns private after you asked for public. Siar has not yet confirmed a
> public upload on its own project, so its YouTube status stays: connect and upload now; public uploads not yet
> confirmed.

**Source:** YouTube Data API, [Revision history, 2 November 2026](https://developers.google.com/youtube/v3/revision_history)
and [videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert), checked 12 November 2026.

**Affects:** [YouTube API](/youtube-api) · [YouTube API errors: locked private](/youtube-api/errors#code-locked-private) ·
[YouTube status](/platforms#youtube)

**Hub summary (26 words):** YouTube no longer forces uploads from unverified API projects to private. If you leave
privacyStatus unset, the video now goes public. Set it on every upload.

Editor notes:
- The status sentence is `messaging.md` §9 word for word, folded into prose. When a public upload is confirmed on
  production (Fakhrul's test, strike plan §0 item 7), replace the last sentence with "Siar confirmed a public upload on
  <date>; YouTube is open on Siar." and switch the status constant to "YouTube: open today."
- **Adapter text to change before or with this page** (so `/youtube-api/errors` matches):
  - `youtube.ts` line 264, entry `locked private`: meaning → "YouTube returned the video as private although public
    was requested. Since 2 November 2026 YouTube no longer locks uploads from unverified API projects, so the channel's
    own settings or YouTube kept it private." fix → "Check the video and the channel's upload defaults in YouTube
    Studio, then change the video's privacy." The "kept it private" cause is [inferred]: Google names only creator
    account settings, and only for unset privacy.
  - `youtube.ts` line 384, the `warning` string: drop "Uploads from an API project that has not passed YouTube's
    compliance audit are locked private." Keep the first sentence.
  - The anchor `#code-locked-private` must match what `[api]/errors.astro` generates for that code; check it on the
    built page (`errors-hub.md` notes how ids are made) before linking.
- Never write "Publish YouTube videos" or show a public YouTube post from Siar until the test passes.

---

### Entry 4

**Anchor:** `#2026-06-01-youtube-upload-quota-bucket`
**Network:** YouTube · **Effective:** 2026-06-01 · **Published:** 2026-11-12 · **Checked:** 2026-11-12

**H2:** YouTube API uploads get their own quota bucket

**Date line:** Took effect 1 June 2026 · Published 12 November 2026 · Checked 12 November 2026

**Body (120 words):**

> **What changed.** Since 1 June 2026 the YouTube Data API charges `videos.insert` and `search.list` to their own quota
> buckets. Every other method stays in the existing bucket. The `videos.insert` page lists 100 calls a day, at 1 unit
> each, in the Video Uploads bucket.
>
> **Who it breaks.** Upload-heavy apps that planned volume from the general quota. They can now run out of uploads while
> plenty of general quota is left.
>
> **What to do.** Check both buckets in the Google Cloud Console. Ask for more through Google's Quota Extension Form
> before you need it.
>
> **What Siar did.** Siar treats YouTube's `quotaExceeded` as a rate limit: the post keeps YouTube's own error, is
> marked retryable, and carries the time the quota resets.

**Source:** YouTube Data API, [Revision history, 1 June 2026](https://developers.google.com/youtube/v3/revision_history)
and [videos.insert](https://developers.google.com/youtube/v3/docs/videos/insert), checked 12 November 2026.

**Affects:** [YouTube API errors: quotaExceeded](/youtube-api/errors#code-403-quotaexceeded) · [YouTube API](/youtube-api)

**Hub summary (25 words):** YouTube uploads now draw on their own quota bucket, listed at 100 videos.insert calls a
day. Check it in the Cloud Console before you scale.

Editor notes:
- "What Siar did" [code: `youtube.ts` 65-66, `errors.ts` `RATE_LIMITED` is transient, so `retryable`]. Do not add
  "Siar retries it automatically at midnight": retry timing for this case is not verified.
- Do not write "100 uploads a day per Siar customer" or any Siar upload capacity. The bucket belongs to a Google Cloud
  project [inferred from Google's Console wording]; Siar's quota request is a private record [doc], not page copy.
- Do not print the 10,000-unit general quota here; it was not re-checked on Google's quota page today.
- Check the generated anchor for `403 quotaExceeded` on the built errors page before linking.

---

### Entry 5

**Anchor:** `#2025-05-29-slack-non-marketplace-rate-limits`
**Network:** Slack · **Effective:** 2025-05-29 · **Published:** 2026-11-12 · **Checked:** 2026-11-12

**H2:** Slack rate limits for apps outside the Marketplace

**Date line:** Took effect 29 May 2025 · Published 12 November 2026 · Checked 12 November 2026

**Body (149 words):**

> **What changed.** Since 29 May 2025, Slack apps distributed outside the Slack Marketplace get `conversations.history`
> and `conversations.replies` at 1 request a minute, with at most 15 messages per request. It applies to new apps and
> new installations. Existing installations keep their old limits, and internal customer-built apps are not affected.
>
> **Who it breaks.** Unlisted apps that read channel history or thread replies: archivers, comment importers, support
> bots. The method reference still lists 50+ requests a minute, so the changelog is the page to trust.
>
> **What to do.** List the app on the Slack Marketplace, or build it as an internal app for one workspace. Otherwise ask
> for 15 messages per page and honor `Retry-After`.
>
> **What Siar did.** Siar is not on the Slack Marketplace. It reads replies 15 at a time and waits out each limit, so
> replies arrive slowly. Posting to channels is not part of this change.

**Source:** Slack, [Rate limit changes for non-Marketplace apps](https://docs.slack.dev/changelog/2025/05/29/rate-limit-changes-for-non-marketplace-apps)
and [conversations.history](https://docs.slack.dev/reference/methods/conversations.history), checked 12 November 2026.

**Affects:** [Slack API](/slack-api) · [Slack status](/platforms#slack)

**Hub summary (22 words):** Slack apps outside its Marketplace can read conversations.history and conversations.replies
once a minute, 15 messages at a time. Posting is not affected.

Editor notes:
- Published 2026-11-12 for a 2025 change: the log starts now, and this change still shapes every new Slack app
  install. Its `published` date is honest; never back-date it.
- "The method reference still lists 50+ requests a minute" [measured today on the method page]. Re-check on each
  weekly pass; delete the sentence when Slack updates that page.
- "Posting to channels is not part of this change": the changelog names only the two read methods [sourced by
  absence]. Siar's own note says the same [doc].
- When `/slack-api/rate-limits` (C111, W1) ships, add it to "Affects".
- Siar line matches the status line "Slack: open today. Importing replies is slow, because Slack limits apps outside
  its Marketplace." (`messaging.md` §9).

---

## 4. How Siar handles a network change

**H2:** How Siar handles a network change

**Body (the three-line box, strike plan §6 rule 2):**

> Each network's rules live in one place in Siar's code, so a change there leaves your request the same.
> If a network turns a post down, you get [the network's own error](/how-publishing-works#errors), plus a plain-English fix.
> [Every network's status, with dates](/platforms), and what Siar did about each change, in the entry above.

Editor notes:
- Line 1 is a design fact [code: one adapter per network behind `packages/networks/src/types.ts`; your call is
  `POST /api/v1/post` either way]. It is not a promise to ship each change on day one (`market.md` P6: "No promise to
  absorb every change instantly"). The entries carry the proof, including the two where Siar's answer is "not yet" or
  "slow".
- Until `/how-publishing-works` is live, link `/docs/errors` with the same anchor text.

---

## 5. Get changes as they land

**H2:** Get changes as they land

**Body:**

> Follow the log in a feed reader or a script. The [RSS feed](/network-changes/rss.xml) and the
> [JSON feed](/network-changes/feed.json) carry every entry, newest first, with the same anchor link, dates and sources
> as this page. Each network's API page on Siar shows its three latest entries.
>
> Spotted a change we missed, or a date that moved? Email siaran@ffdev.studio and we'll check it on the network's own page.

Editor notes:
- No promise of a check cadence, reply time or "weekly" on the page. The weekly pass is the owner's routine (strike
  plan §5.2 "W1, then weekly"); the visible "Updated" date shows when it last happened.
- O12 (a short FF Dev Studio LinkedIn post per major change) is a channel, not page copy. Do not add "follow us on
  LinkedIn" until it is running.

---

## 6. What goes in this log

**H2:** What goes in this log

**Body:**

> An entry goes in when a network changes something that can break or change a posting app: API versions, auth and
> scopes, privacy defaults, media rules, rate limits and quotas. It covers the networks Siar is built for, whether or not
> each one is open on Siar today.
>
> Every entry links the network's own page and says when we checked it. A third-party report alone is not enough. If a
> network moves a date, the entry is updated and its checked date changes.
>
> This log covers the networks themselves. Changes to other social media tools' APIs are not logged here.

Editor notes:
- "built for" is the allowed way to refer to the 15 (siar-truth §1a). No "every network", no "15 networks" bare.
- The last paragraph is the brief's "no vendor entries" rule. Buffer's REST shutdown lives on `/compare/buffer-api`;
  do not name Buffer here.
- Corrections: when an entry changes after publishing, keep `published`, update `checked`, and add a one-line
  "Corrected <date>: <what>" under the body. Feeds bump `date_modified`.

---

## 7. Objection handling (where each answer sits on the page)

| Objection (developer's words) | Answer | Where |
|---|---|---|
| "Why trust a vendor's changelog?" | Every entry quotes and links the network's own page with the date checked. Siar's own part is a separate paragraph, and it includes the bad news (Shorts thumbnails "not yet changed", Slack replies "arrive slowly") | Each entry's Source line; section 6 |
| "This is marketing dressed as docs." | Four of the five "What to do" paragraphs work without Siar. The Siar paragraph is last and short. No sign-up wall, full text in the feed | Entry layout; section 5 |
| "Will Siar absorb these changes for me?" | For networks open on Siar, the change sits in Siar's code, not yours. Siar does not promise day-one fixes; each entry says what it did, including "nothing yet" | Section 4; each "What Siar did"; FAQ 7 |
| "You'll miss changes." | The page shows when it was last checked, takes reports by email, and dates corrections. No cadence promise | Hero date line; section 5; section 6 |
| "Is YouTube public on Siar now?" | Not confirmed yet. The status line says so, in the YouTube entry and FAQ 9 | Entry 3; FAQ 9 |
| "Does Siar post to LinkedIn company pages?" | Not today. Personal profiles only; company pages open after LinkedIn grants page access | FAQ 8 |

---

## 8. FAQ

**H2:** Questions about social media API changes

**1. When does LinkedIn API version 202511 stop working?**

> On 16 November 2026. From that day LinkedIn answers any request that sends `Linkedin-Version: 202511` with HTTP 426
> `NONEXISTENT_VERSION`. Move to a supported version such as 202610, the latest, which LinkedIn supports until
> 15 October 2027. There is no 202512. The next sunset is 202601, on 15 January 2027.

(49 words)

**2. Are YouTube API uploads from unverified projects still forced private?**

> No. On 2 November 2026 Google wrote that `videos.insert` uploads from unverified API projects "are no longer
> restricted to private viewing" mode, reversing its July 2020 rule. If you leave `status.privacyStatus` unset, the
> video now defaults to public, although a creator's account settings can still make it private.

(48 words)

**3. Can I set a custom thumbnail on a YouTube Short through the API?**

> Yes, since 3 November 2026. Call `thumbnails.set` after the Short has finished processing, when
> `processingDetails.processingStatus` is `succeeded`. Google says a thumbnail set earlier may not be applied. The image
> can be a JPEG or PNG of up to 50 MB, and each call costs about 50 quota units.

(48 words)

**4. What is the Slack conversations.history rate limit for non-Marketplace apps?**

> One request a minute, with at most 15 messages per request, for commercially distributed apps outside the Slack
> Marketplace. It covers new apps and new installations since 29 May 2025, and `conversations.replies` too. Marketplace
> apps and internal customer-built apps are not affected; Slack lists custom apps at 50+ requests a minute.

(51 words)

**5. How many videos can I upload a day with the YouTube Data API?**

> Google's `videos.insert` page lists 100 calls a day, at 1 unit each, in a separate Video Uploads quota bucket that
> started on 1 June 2026. Other methods share the main bucket, so uploads can run out first. You see the limits in the
> Google Cloud Console and ask for more through Google's Quota Extension Form.

(55 words)

**6. How do I keep track of social media API changes?**

> Watch each network's own changelog, and follow a log that collects the changes that break posting apps. Siar's log
> at siaran.my/network-changes lists them newest first, with an RSS and a JSON feed. Each entry says what changed, who it
> breaks and what to do, and links the network's own page with the date it was checked.

(56 words)

**7. Does Siar handle network API changes for me?**

> For the networks open on Siar, a change lands in Siar's code for that network, not in yours: you keep calling the same
> endpoint. Siar does not promise to ship every change on day one. Each entry in this log says what Siar did, including
> "not yet" when that is the truth.

(52 words)

**8. Is Siar affected by the LinkedIn 202511 sunset?**

> No. Siar sends `Linkedin-Version: 202609` on every LinkedIn call, and LinkedIn supports that version until
> 15 September 2027. Posts to LinkedIn personal profiles through Siar are not affected by the 202511 sunset. Company
> pages are not open on Siar today: they open after LinkedIn grants page access.

(47 words)

**9. Can Siar publish public YouTube videos now?**

> Not confirmed yet. Siar connects YouTube channels and uploads videos and Shorts today, and it asks YouTube for public
> unless you choose unlisted or private. Since Google's 2 November 2026 change those uploads may stay public, but Siar
> has not yet confirmed a public upload on its own project.

(49 words)

Editor notes:
- FAQ 1-5 [sourced, as in each entry]. FAQ 5 "so uploads can run out first" [inferred from separate buckets].
- FAQ 6 names the page, not "Siar, a unified social media API", because the question is generic; the H1 area already
  names the entity.
- FAQ 7 [code + `market.md` P6]. FAQ 8 [code, sourced; status line from `messaging.md` §9]. FAQ 9 [code; strike plan
  §2 row 7; status line].
- Tense switch on 17 November 2026: FAQ 1 question → "When did LinkedIn API version 202511 stop working?", answer
  "On 16 November 2026. Since then LinkedIn answers…"; FAQ 8 unchanged.

---

## 9. Closing CTA

**H2:** Write it once. Siar it everywhere.
**Dim line:** Everywhere that's open today.

**Body:**

> Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack, from one request. Start with
> 20 free posts to try. No card.

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart

Editor note: the same closing block as `/platforms`, `/features` and `/linkedin-api/errors` copy. The network list is
siar-truth §1a allowed wording. YouTube is left out on purpose until a public upload is confirmed.

---

## 10. Comparison table

None. This page logs networks, not vendors (brief: "No vendor entries"). Rival changelogs are not compared here:
`strategy-category-creator.md` G7 says no rival dated log of network API changes was seen in the teardowns, but that
was [inferred, not searched], so the page makes no "only log" or "first log" claim.

---

## 11. Internal links

**Out from this page (anchor text in quotes):**

| To | Anchor text | Where | Note |
|---|---|---|---|
| `/` | "unified social media API" | Hero subhead | The only anchor for this phrase |
| `/linkedin-api/errors#code-426` | "LinkedIn API errors: 426" | Entry 1, Affects | Exists (copy in `linkedin-api-errors.md`) |
| `/linkedin-api` | "LinkedIn API" | Entry 1, Affects | Hub |
| `/youtube-api` | "YouTube API" | Entries 2-4, Affects | Hub |
| `/youtube-api/errors#code-locked-private` | "YouTube API errors: locked private" | Entry 3 | Check the generated anchor; update the entry text first (entry 3 notes) |
| `/youtube-api/errors#code-403-quotaexceeded` | "YouTube API errors: quotaExceeded" | Entry 4 | Check the generated anchor |
| `/youtube-api/errors` | "YouTube API errors" | Entry 2 | Exists |
| `/slack-api` | "Slack API" | Entry 5 | Hub |
| `/platforms#youtube`, `/platforms#slack` | "YouTube status", "Slack status" | Entries 3 and 5 | Check the row ids on `/platforms` |
| `/platforms` | "Every network's status, with dates" | Section 4 | Mechanism anchor text from `how-publishing-works.md` |
| `/how-publishing-works#errors` | "the network's own error" | Section 4 | W1. Until live: `/docs/errors` |
| `/docs/webhooks` | "`post.published` webhook" | Entry 2 | Exists |
| `/docs/api` (YouTube misc tag) | "`POST /api/v1/misc/youtube/thumbnail`" | Entry 2 | Link the operation's reference page |
| `/docs/quickstart` | "Read the quickstart" | Section 9 | Exists |
| `/network-changes/rss.xml`, `/network-changes/feed.json` | "RSS feed", "JSON feed", "Follow the RSS feed" | Hero, section 5 | New, ship with the page |
| `/slack-api/rate-limits` | "Slack API rate limits" | Entry 5, Affects | C111, W1. Only when live |
| `/youtube-api/audit`, `/youtube-api/quota` | "YouTube API audit", "YouTube API quota" | Entries 3 and 4 | C98, C97. Only when live |

**In to this page (add on these pages):**

| From | What | Note |
|---|---|---|
| Every network hub `/<net>-api` | H2 "Latest <Network> changes": the three newest entries for that network (title, date, hub summary, "Read the entry" to the anchor), then "All network API changes" to `/network-changes` | Generated. Hide the block when a network has no entries; never an empty state |
| `/linkedin-api/errors` §11 | "Read the entry", "All network API changes" | Already written there; switch on when this page is live |
| `/youtube-api/errors` (`locked private`, `quotaExceeded` rows) | "What changed on 2 November 2026", "YouTube upload quota bucket" | One line under each entry |
| `/platforms` | Under the status table: "Network API changes, newest first" | One line |
| `/changelog` | Lead line: "Changes the networks make are logged in [network API changes](/network-changes)." | Keeps Siar's own changelog separate |
| `/docs/rate-limits` | "Network rate-limit changes" | One line near the network-limits part, if it has one |
| Footer (Product or Resources column) | "Network changes" | Site-wide, low weight |
| `/llms.txt` | `- [Social media API changes](https://siaran.my/network-changes): dated log of network API changes, newest first, sourced` | AI fetchers read it first |
| `/how-publishing-works#status` | "dated network changes" | W1 page |

---

## 12. Schema notes

- **`CollectionPage`** with `@id` `https://siaran.my/network-changes#page`, `name` = H1, `description` = meta
  description, `dateModified` = the latest `checked` date in the data file (also feeds the visible "Updated" line and
  sitemap `lastmod`; add `/network-changes` to `sources()` in `apps/site/src/lib/updated.mjs`, pointing at the data file
  and the page), `isPartOf` the WebSite, `publisher` `#org`, `inLanguage` `en`.
- **`mainEntity`: `ItemList`**, `itemListOrder` `Descending`, one `ListItem` per entry, `position` by order, `item` =
  a **`TechArticle`** with `@id` = the anchor URL, `headline` = entry H2, `datePublished` = `published`,
  `dateModified` = `checked`, `about` = `{"@type": "SoftwareApplication", "name": "LinkedIn Marketing API"}` (or the
  YouTube Data API, Slack Web API), `citation` = the source URLs, `isPartOf` = `#page`. No `author` person.
- **`FAQPage`**: the 9 Q&As in section 8, text identical to the visible answers.
- **`BreadcrumbList`**: Home › Network API changes.
- **No** `Event` (a sunset is not an event), `NewsArticle`, `Review`, `AggregateRating`, `Product` or offers.
- **Feeds in `<head>`:** `<link rel="alternate" type="application/rss+xml" title="Siar: social media API changes"
  href="/network-changes/rss.xml">` and `<link rel="alternate" type="application/feed+json" title="Siar: social
  media API changes" href="/network-changes/feed.json">`.
- **Each entry block** gets `id` = the anchor, so links and `@id`s resolve. Keep anchors forever, even after a
  correction.
- After each new entry: rebuild, IndexNow ping for `/network-changes` and the affected hubs (strike plan §8 lever 5).

---

## 13. The data file (one source for the page, the feeds and the hub blocks)

**File:** `apps/site/src/lib/network-changes.ts` (beside `events.ts` and `networks.ts`), exported as a typed array.

| Field | Type | Rule |
|---|---|---|
| `id` | string | The anchor: `<effective YYYY-MM-DD>-<network>-<slug>`. Never changes |
| `network` | `NetworkType` key from `networks.ts` | Drives the glyph and hub filtering |
| `title` | string | Tense-neutral sentence-case title (the H2) |
| `effective` | ISO date | When the change takes effect. Sort key, newest first |
| `published` | ISO date | First day on siaran.my. Never back-dated |
| `checked` | ISO date | Last day the source was re-read. Feeds "Updated" and `dateModified` |
| `summary` | string, at most 30 words | Hub blocks and feed `summary` |
| `changed`, `breaks`, `todo`, `siar` | Markdown strings | The four paragraphs; the build fails if the total is under 80 or over 150 words |
| `sources` | `{ label, url }[]` | Network's own pages only. The build fails if empty |
| `affects` | `{ label, href }[]` | Internal links; the build fails if a target is not a built page (no links to 404s) |
| `corrections` | `{ date, note }[]` | Optional, rendered under the body |

Build checks (cheap, and they keep the rules honest): word range per entry; at least one source; source hosts limited to
the network's own domains (learn.microsoft.com, developers.google.com, docs.slack.dev, developers.facebook.com,
developers.tiktok.com, docs.x.com and similar), so a third-party URL cannot slip in as a source; `published` ≥ 2026-11-12;
present-tense verbs only while `effective` is in the future (or generate the verb from the date).

**Feeds:**
- `/network-changes/rss.xml`: RSS 2.0. `<item>` per entry: `title`, `link` = anchor URL, `guid isPermaLink="true"` =
  anchor URL, `pubDate` = `published`, `category` = network name, `description` = full entry HTML (four paragraphs +
  Source line). Channel `title` "Siar: social media API changes", `link` the page.
- `/network-changes/feed.json`: JSON Feed 1.1. `id` = anchor URL, `url` = anchor URL, `external_url` = first source
  URL, `title`, `summary`, `content_html`, `date_published` = `published`, `date_modified` = `checked`, `tags` =
  [network].
- Both newest first by `effective`, all entries (the log is small), served with a short cache.

---

## 14. Hub block copy (generated on each network hub)

**H2:** Latest <Network> changes

Per entry (up to three, newest first by `effective`):

> **<effective date, prose form>:** <summary> [Read the entry](/network-changes#<id>)

Then: [All network API changes](/network-changes)

Rendered example for `/linkedin-api` (from the data above):

> **16 November 2026:** LinkedIn retires Marketing API version 202511 on 16 November 2026. Calls that still send it get
> 426 NONEXISTENT_VERSION. Move to 202610. [Read the entry](/network-changes#2026-11-16-linkedin-202511-sunset)
>
> [All network API changes](/network-changes)

Editor note: hubs for networks with no entries (today: Facebook, Instagram, Threads, X, Bluesky, Mastodon, Discord,
TikTok, Pinterest, Reddit, Snapchat, Google Business Profile) show no block at all. Strike plan §6 lists "latest 3
entries of /network-changes" under the network hubs.

---

## 15. Weekly pass (owner routine, not page copy)

1. Re-read the sources of every entry whose `effective` date is in the future or within the last 30 days; bump
   `checked` or add a correction.
2. Read the changelogs of the networks Siar is built for: LinkedIn migrations and recent changes, YouTube revision
   history, Meta's Graph API changelog, X developer changelog, TikTok developer changelog, Pinterest, Slack, Discord,
   Bluesky/atproto, Mastodon releases, Reddit, Snapchat, Google Business Profile.
3. Add an entry only when it can break or change a posting app (section 6), with the four paragraphs and a true Siar
   paragraph. If Siar changed code for it, add the `/changelog` line the same day.
4. Rebuild, ping IndexNow, check the feeds validate.

Candidates noticed today but not written (each needs its own check first):
- YouTube 2026-09-14: thumbnail and image uploads raised from 2MB to 50MB [sourced, revision history]. Siar already
  accepts 50 MB (`youtube.ts` line 334) [code]. Small; add if a slot is free.
- YouTube 2026-10-15 entry on fields "not overridden if omitted" [sourced, partial quote only]. Read the full entry
  before writing.
- Meta Graph API version expiries. `buyers-pains.md` quotes a third-party issue title about v20.0 expiring on
  2026-09-24 [third-party, not checked on Meta's changelog]. Check Meta's own changelog before any entry.

---

## 16. Tense switch on 17 November 2026

| Where | Before (ship now) | After |
|---|---|---|
| Hero subhead, 2nd sentence | "Next up: LinkedIn retires API version 202511 on 16 November 2026." | "Latest: LinkedIn retired API version 202511 on 16 November 2026." (or the newest entry, generated) |
| Glance table, 2026-11-16 row | "(upcoming)" after the date | Remove "(upcoming)" |
| Entry 1 date line | "Takes effect" | "Took effect" |
| Entry 1 body | "On 16 November 2026 LinkedIn retires" | "On 16 November 2026 LinkedIn retired" |
| Entry 1 hub summary | "retires … on 16 November 2026" | "retired … on 16 November 2026" |
| FAQ 1 | "When does … stop working?" / "From that day" | "When did … stop working?" / "Since then" |
| Meta description | "LinkedIn's 202511 sunset" | Unchanged (tense-neutral) |

---

## 17. Why this wins

**Primary keyword:** social media api changes.
**Secondary:** linkedin api version sunset; youtube api upload private rule change; youtube shorts custom thumbnails
api; slack conversations.history rate limit non-marketplace. Also caught by the entries: "linkedin 202511 sunset",
"linkedin api 426 NONEXISTENT_VERSION", "linkedin api 202512", "youtube api unverified project private",
"youtube videos.insert default privacy", "youtube api upload limit per day", "youtube videos.insert quota bucket",
"slack conversations.replies rate limit", "slack 15 messages per request".

**Demand (labelled):**
- Head term "social media api changes": not measured (search budget spent before this page; see the top notes). Likely
  low and mixed with news about single networks [inferred]. The page is not built to win the head term; it is built for
  the dated long tail and for AI answers to "what changed" questions.
- "youtube api upload private video / videos locked private": M, autocomplete child of "youtube api private"; "weeks"
  to rank because Google reversed the rule on 2026-11-02 and ranking pages still describe the 2020 rule
  [`per-network.md` #89; measured there; inferred ranking time].
- "youtube api upload shorts": M, autocomplete children of 3 seeds [`per-network.md` #82, measured there].
- "linkedin api error 426 / errors": autocomplete 4 [`per-network.md` #63, measured there]; dated trigger 16 November.
- "slack api rate limits non-marketplace apps": L, no autocomplete test [`per-network.md` #119].
- Real breakage seen in public trackers: Mixpost #166 ("Mixpost can no longer publish to LinkedIn as of July 22,
  2025"), Postiz #2005 (426 `NONEXISTENT_VERSION`) [third-party, measured in `buyers-pains.md`]. The searcher is a
  developer whose posts just started failing.

**Why Siar can win it:**
- Freshness with sources. The YouTube entries describe changes 10 days old that most ranking pages predate [inferred].
- One URL, anchored entries, no thin pages (strike plan §5.12). Hubs and feeds spread it without new URLs.
- Each entry answers the four questions a developer asks, in the network's own words, with the date. That is the shape
  engines quote for "when" and "what changed" prompts (strike plan §8 lever 4) [inferred].
- Candour is the credibility: two of five Siar paragraphs admit a limit ("not yet changed", "replies arrive slowly"),
  which a hostile reader can check against Siar's own docs.

**AI prompts it targets** (add to the citation tracker, `prompts_v2`):
- "what changed in the LinkedIn API in November 2026"
- "is LinkedIn API version 202511 still supported" / "is there a LinkedIn API version 202512"
- "are YouTube API uploads from unverified projects still private"
- "can I set a custom thumbnail for a YouTube Short via the API"
- "what is the YouTube Data API daily upload limit"
- "Slack conversations.history rate limit for non-Marketplace apps"
- "where can I track social media API changes" / "social media API deprecations 2026"
- "does Siar handle network API changes" (brand + mechanism)

**Measure:** check Bing and Google for "youtube api upload private", "youtube shorts thumbnail api", "linkedin api
version sunset" and "slack conversations.history rate limit" on 2026-11-19 and 2026-12-03; watch the feeds' fetch logs;
run the prompts above in the citation tracker. **Kill rule** (strike plan §2): an entry that explains Siar before the
change. Every entry here leads with what the network changed.
