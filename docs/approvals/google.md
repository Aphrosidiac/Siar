# Google — YouTube Data API + Business Profile APIs

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
