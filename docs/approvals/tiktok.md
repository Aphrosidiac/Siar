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

## Status (2026-10-13)
- Developer account hello@ffdev.studio; org **FF DEV STUDIO** 7696076379615659029; app **Siar** 7696085856649693236.
- **Production draft is NOT saved**: TikTok refuses to save it until a demo video is uploaded. Everything was
  entered once (icon, Business, description, terms/privacy, Web https://siaran.my, Login Kit + redirect,
  Content Posting + Direct Post, 6 scopes, the scope explanation) — re-create it with **Import → from Sandbox**
  and paste the explanation below, then upload the demo video.
- **Sandbox "Siar review"** 7696050807262955540 saved with the same config. Domain siaran.my verified for
  Production and Sandbox (two TXT records on the siaran.my zone, one per environment; keep both).
- Sandbox keys go in Siar/.env.networks as NETWORK_TIKTOK_CLIENT_KEY / NETWORK_TIKTOK_CLIENT_SECRET
  (pasted by Fakhrul). Target user: the FF TikTok account (Sandbox settings → Add account).
- Description (≤120): "Publish and schedule videos and photo posts to your own TikTok account from one dashboard and API."

Scope explanation (pasted, 904 chars):
> Siar (siaran.my) is a social media publishing dashboard and API. Creators connect their own TikTok account and post to it.
> Login Kit + user.info.basic: the creator signs in with TikTok; we show their avatar and display name on the connected account and in the composer.
> user.info.profile: profile link and verified badge on the account card.
> user.info.stats: follower, likes and video counts in Siar analytics.
> video.publish (Direct Post): the composer reads creator_info, shows the creator's nickname, a privacy dropdown with no default, Comment/Duet/Stitch toggles, commercial content disclosure and the Music Usage Confirmation, then publishes the video or photo post and shows its status.
> video.upload: alternatively sends the video to the creator's TikTok inbox as a draft to finish in the app.
> video.list: lists the creator's posts so Siar can show the link and view counts of what they published.
