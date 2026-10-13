# Google — YouTube Data API + Business Profile APIs

**Status: OAuth verification SUBMITTED 2026-10-14 ~00:05 MYT** (Verification Center, sensitive scopes
youtube.upload + youtube.force-ssl). Google answers by email to hello@ffdev.studio, usually within days, often with
questions first. Meanwhile the app is **In production, unverified**: users see the unverified-app screen (≤100 users);
API uploads stay **private** until the YouTube API audit passes.
- Branding verified + published (Siar name and logo on the consent screen).
- Demo: **https://youtu.be/vYfVcrmfVLA** (unlisted, FF's channel) = `review/out/Y0.mp4`.
- Questionnaire: personal use No, internal No, dev/testing No, Gmail SMTP plugin No; both acknowledgements ticked by
  Fakhrul. Additional info: recorded with a Workspace account of the owning org (so no unverified screen in the film),
  uploads private pending the YouTube audit, business.manage not sensitive.
- Keys live on api.siaran.my since release f0e6b6e (also carries the Past posts fix `ef19fae`).

**Next:** (1) answer Google's email if it asks (likely: show the unverified-app screen → re-film sign-in with a
non-org account, e.g. Fakhrul's gmail); (2) after verification, the YouTube API Services audit form (text below);
(3) Business Profile: **PARKED 2026-10-14** (see below).

## Identifiers

| | |
|---|---|
| Account | hello@ffdev.studio (Workspace org **ffdev.studio**) |
| Project | **Siar** — id `siar-prod`, org ffdev.studio. ("FF 1" / `ff-1-511514` was auto-created on first sign-in; unused.) |
| APIs on | YouTube Data API v3, YouTube Analytics, My Business Account Management, My Business Business Information, Business Profile Performance, My Business Place Actions |
| APIs gated | `mybusiness.googleapis.com` (Google My Business API v4: local posts, reviews) refuses to enable until Business Profile API access is approved |
| Consent screen | External; name Siar; support + developer contact hello@ffdev.studio (siaran@ isn't a Google Group, so Google doesn't offer it); logo `docs/approvals/assets/siar-icon-120.png`; home/privacy/terms siaran.my; authorized domain siaran.my |
| Scopes (4) | non-sensitive: `business.manage`, `yt-analytics.readonly` · sensitive: `youtube.upload`, `youtube.force-ssl` · restricted: none |
| OAuth client | "Siar web" (Web application), client id `764055308499-3ti99mkg4ja6tb5uefo8cguj0uvdsbbr.apps.googleusercontent.com`; redirect URIs …/callback/YOUTUBE and …/callback/GOOGLE_BUSINESS. One client serves both networks. |
| Keys | `Siar/.env.networks` → `NETWORK_YOUTUBE_CLIENT_ID/SECRET` and `NETWORK_GOOGLE_BUSINESS_CLIENT_ID/SECRET` (same values). Checked: token endpoint answers `invalid_grant` (client accepted). |
| Search Console | Domain property siaran.my, verified by DNS TXT `google-site-verification=iVAu…` (Cloudflare, added via API). Keep the record. |

## Traps

- The enable-APIs flow fails the whole batch when one API is gated (v4 mybusiness): enable the rest without it.
- The client secret is shown once in the "OAuth client created" dialog; Download JSON there. (A new secret can be added
  to the client later if lost.)
- Search Console's Cloudflare option asks to authorize Google into Cloudflare; choose "Any DNS provider" and add the
  TXT through the Cloudflare API instead.
- Testing status: only test users, refresh tokens expire after 7 days. Verification needs "In production".

## [F] Day 1
1. console.cloud.google.com → new project **siar-prod** (organization: none is fine).
2. search.google.com/search-console → add `siaran.my` (DNS) — Google requires the homepage
   domain to be verified by a project owner.
3. Enable APIs: YouTube Data API v3, YouTube Analytics API, My Business Account Management API,
   My Business Business Information API, Google My Business API (v4), Business Profile
   Performance API, My Business Place Actions API.

## OAuth consent screen (I fill)
| Field | Value |
|---|---|
| App name | Siar |
| Support email | siaran@ffdev.studio |
| Logo | 120×120 PNG |
| Home page / Privacy / Terms | https://siaran.my · /privacy · /terms |
| Authorized domains | siaran.my |
| Scopes | youtube.upload, youtube.force-ssl, yt-analytics.readonly, business.manage (exactly what Siar requests — add no others) |
| Redirect URIs | https://api.siaran.my/api/v1/social-account/callback/YOUTUBE · …/GOOGLE_BUSINESS |

**Scope justifications (paste):**
- `youtube.upload` — Upload videos and Shorts the user schedules in Siar to the channel they connected.
- `youtube.force-ssl` — Set thumbnails, edit video metadata, manage playlists, and read, reply to and moderate comments on the user's own videos from Siar.
- `yt-analytics.readonly` — Show views and watch time of the user's videos in Siar's analytics.
- `business.manage` — Publish posts, update the business profile, reply to reviews and read performance for the Google Business Profile locations the user manages.

**Demo video (YouTube, unlisted):** the full consent screen with the app name and scopes
visible, then each scope used in Siar (upload a Short, set a thumbnail, reply to a comment, show
analytics; publish a GBP post, reply to a review).

## YouTube API Services — audit and quota extension (after OAuth verification)
Form: support.google.com/youtube/contact/yt_api_form. Default quota is 10,000 units/day for
reads/writes; since 1 Jun 2026 `videos.insert` has its own quota bucket (an upload costs ~100
units since Dec 2025). The audit is needed anyway: until it passes, every API upload is locked
**private** (Siar flags this on the post).
- Use case: multi-tenant publishing tool; each user acts only on their own channel.
- Requested quota: `videos.insert` bucket for ~500 uploads/day at launch; 100,000 units/day for
  the shared bucket (thumbnails, comments, status polls and analytics for those uploads).
- Compliance: no API data shown to users other than the channel owner; analytics stored ≤30 days
  for refresh only; tokens deletable via disconnect and https://siaran.my/data-deletion; links to
  YouTube ToS and Google privacy policy on the connect screen (built in).

## Business Profile API access [F] — PARKED 2026-10-14

FF has no Business Profile (hello@ffdev.studio: 0 businesses) and can't make an honest one: Google only lists
businesses that meet customers in person (storefront or service area); online-only studios are not eligible. The
access form needs an account managing a verified profile ≥60 days old, so the only route is a client's verified
profile with hello@ffdev.studio added as Manager. Not planned. Meanwhile the GOOGLE_BUSINESS keys are commented out
on the server and in `.env.networks` (marked "parked 2026-10-14"), so the network reports `available: false` and shows
"Opening soon". To re-enable: uncomment both lines on /srv/siar/shared/.env, `pm2 restart siar-api --update-env`.
`business.manage` stays on the consent screen (not sensitive); the client and redirect URI stay configured.

Form: "Business Profile API contact form" → "Application for Basic API Access". Submit from the
Google account that manages a verified Business Profile (FF's own) that is 60+ days old, with the
project number of siar-prod. Use case text: *"Siar lets businesses publish posts, update
information, reply to reviews and read performance for the Business Profiles they own, from one
dashboard and API."*

## Demo film Y0 (2026-10-13)

`review/out/Y0.mp4` (2:17) = takes Y0 (opening, title card) + Y2 (connect) + Y1 (compose → analytics) + Y1b (delete),
joined by `edit.mjs` (`tail` may now be a list). Recorded with the address-bar strip on (`TOOLBAR=140:92 rec.sh start
<take> 708`) so the client_id is visible during sign-in, as Google asks.
1. Social accounts → YouTube + → Google account chooser (client_id in the URL) → consent screen with the 3 YouTube
   scopes → Allow → connected; channel picker (channels.list).
2. Composer → YouTube only → MP4 → title, type Short, privacy Private, description → Publish now.
3. Post drawer: Processing → Posted (status polling, `videos.list`); Refresh reads views/likes/comments.
4. Analytics → YouTube → Refresh now (`yt-analytics.readonly`).
5. Posts → Delete → "It is deleted from YouTube too" → Post deleted (checked in YouTube Studio off camera: the
   Shorts list is empty).
Not filmed: comment replies (no comments are possible on private videos; API uploads stay private until the YouTube
audit) and thumbnails (no dashboard control yet; API `misc.youtube.setThumbnail`). The YouTube Studio shots were cut:
the extension's glow and pointer showed there.

Recording traps learned here: inject the cursor/hider on **every** page load, Google's and YouTube's included (do the
navigation inside `@cut`); mark `@cut` *before* a click that redirects (the white flash comes ~0.3 s after); Chrome must
be in front of the Claude window on the laptop screen for the whole take, or the take records the Claude app. Check
every take with a contact sheet (`ffmpeg … fps=1/2,tile`) before using it.

**Scope justifications as filmed (paste):**
- `youtube.upload` — Upload the videos and Shorts the user writes or schedules in Siar to the YouTube channel they
  connected.
- `youtube.force-ssl` — Read the connected channel and the processing status and statistics of videos the user
  uploaded through Siar, list their uploads, edit or delete those videos when the user edits or deletes the post in
  Siar, and reply to and moderate comments on the user's own videos from Siar's Inbox.
- `yt-analytics.readonly` (not sensitive; for reference) — Show views, likes and watch time of the user's channel and
  videos in Siar's Analytics.

## Incidents

- 2026-10-13: the YouTube film was first recorded as `G1`, a name Meta's Instagram Login film already used.
  `rec.sh start` deleted Meta's raw G1 take and the render overwrote `review/out/G1.mp4`; no backup exists (Meta holds
  the uploaded copy). `rec.sh` now refuses an existing name unless `RETAKE=1`. If Meta asks for G1 again it must be
  re-recorded.
- The first Y2 take started while the Claude app covered Chrome: its first 18 s show another session's chat. Those
  frames were cut (never in Y0) and the review stills deleted; the raw `review/raw/Y2.mp4` still holds them (git-ignored).
