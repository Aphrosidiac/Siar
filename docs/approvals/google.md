# Google — YouTube Data API + Business Profile APIs

**Status (2026-10-13):** project, APIs, consent screen, scopes, OAuth client and Search Console done.
Next: publish to Production → keys on the server → connect FF's channel → film → submit verification.

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

## Business Profile API access [F]
Form: "Business Profile API contact form" → "Application for Basic API Access". Submit from the
Google account that manages a verified Business Profile (FF's own) that is 60+ days old, with the
project number of siar-prod. Use case text: *"Siar lets businesses publish posts, update
information, reply to reviews and read performance for the Business Profiles they own, from one
dashboard and API."*
