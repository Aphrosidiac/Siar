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

## Status (2026-10-13) — ready to submit (checked against TikTok's Content Sharing Guidelines §1–11)
- Developer account hello@ffdev.studio; org **FF DEV STUDIO** 7696076379615659029; app **Siar** 7696085856649693236.
- **Sandbox "Siar review"** 7696050807262955540: full config; its keys are on production (`NETWORK_TIKTOK_CLIENT_KEY/SECRET`,
  server env backup .env.bak-20261013-191607). Target user: ffdev.studio. siaran.my verified for both environments
  (two TXT records on the zone, keep both).
- **Production draft saved**: imported from the sandbox + scope explanation + demo films `review/out/K1.mp4` (3:36, end to end) and `K2.mp4` (0:58, the post form up close: preview,
  disclosure blocks Publish, labels, Branded Content Policy, Only me disabled) (K1
  recorded with `scripts/meta-review/rec.sh`, edited by `edit.mjs K1`, tail take K1b). Only Submit is left (Fakhrul).
- Unaudited apps can only post to a **private** TikTok account: @ffdev.studio was switched to private for the film.
  Switch it back to public when done; until the audit passes, Siar's TikTok posts fail on public accounts.
- After approval: put the **production** client key/secret in .env.networks and on the server (replace the sandbox
  keys), restart siar-api, and re-run a public test post.
- Rehearsal left two private "No templates" videos and one draft in @ffdev.studio's inbox — delete them in the TikTok app.

Scope explanation (submitted text, 864 chars):
> Siar (siaran.my) is a social media publishing dashboard and API. Creators connect their own TikTok account and post to it. Demo: Siar sandbox, FF Dev Studio's account (private, as required before audit).
> Login Kit + user.info.basic: sign-in; avatar and nickname shown in the composer.
> user.info.profile: the @username on the connected account.
> user.info.stats: followers and likes in Analytics.
> video.publish: the composer reads creator_info, shows the creator, offers only their privacy levels with no default, greys out interactions they turned off, checks max duration, handles commercial disclosure and labels, shows the Music Usage Confirmation, then direct-posts and shows the status.
> video.upload: "Send to TikTok drafts" uploads to the creator's inbox to finish in TikTok.
> video.list: Analytics → Past posts lists the creator's videos with views and likes.
