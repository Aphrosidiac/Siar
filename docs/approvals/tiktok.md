# TikTok — Login Kit + Content Posting API (Direct Post)

Before the audit an app can post, but every post is forced to **private (SELF_ONLY)** and at most
5 users can post per day. Siar surfaces TikTok's error verbatim until the audit passes.

## [F] Day 1
1. developers.tiktok.com → sign up with the business email → create organization "FF DEV STUDIO".
2. Create app **Siar**. I fill the rest.
3. URL properties → verify `siaran.my` (DNS TXT) and the media prefix `https://media.siaran.my/` —
   required for `PULL_FROM_URL` video posting.

## App details (paste)
| Field | Value |
|---|---|
| App name | Siar |
| Category | Business / Productivity |
| Description | Siar lets businesses and developers publish and schedule videos and photo posts to their own TikTok accounts from one dashboard and API. Users connect their account with Login Kit, choose privacy and interaction settings for every post, and see the post status. |
| Terms / Privacy | https://siaran.my/terms · https://siaran.my/privacy |
| Platforms | Web — https://app.siaran.my |
| Redirect URI | https://api.siaran.my/api/v1/social-account/callback/TIKTOK |
| Products | Login Kit, Content Posting API (enable **Direct Post**) |
| Scopes | user.info.basic, user.info.profile, user.info.stats, video.publish, video.upload, video.list |

## Audit application (after deploy)
Expected usage (initial, honest): ~50 creators/day, ~150 posts/day — these set the daily cap and
can be raised later.

**Demo video script (record in Siar's composer, every point visible):**
1. Social accounts → Connect TikTok → TikTok consent screen → back in Siar, account shown.
2. New post → TikTok tab: the **creator's nickname/avatar** from creator_info is shown.
3. Upload a video; show the duration check against the creator's max duration.
4. **Privacy dropdown has no default**; the user picks "Public to everyone" from the options
   creator_info returned.
5. Interaction toggles (Comment / Duet / Stitch) — disabled ones greyed per creator_info.
6. **Commercial content disclosure** toggle → "Your brand" and "Branded content"; show the label
   preview ("Promotional content" / "Paid partnership").
7. Consent line visible above the button: "By posting, you agree to TikTok's Music Usage
   Confirmation" (+ Branded Content Policy when branded content is on).
8. Publish → status "processing" → "Posted" with the link; open it on TikTok.

Rejections usually cite one of 2/4/5/6/7. Each is built into the composer.
