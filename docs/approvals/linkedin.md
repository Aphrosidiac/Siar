# LinkedIn — Share on LinkedIn (self-serve) + Community Management API

Personal-profile posting (`w_member_social`) works as soon as the app exists. Company **Pages**
need the Community Management API, which LinkedIn grants to registered legal entities.

## [F] Day 1
1. linkedin.com/company/setup → create the **FF DEV STUDIO** company page (or use the existing one),
   logo + website https://ffdev.studio.
2. linkedin.com/developers → Create app: name **Siar**, LinkedIn Page = FF DEV STUDIO, privacy
   https://siaran.my/privacy, logo. Then on the app's Settings tab → **Verify** the page (a page
   admin approves the verification URL).
3. Products tab: add **Sign In with LinkedIn using OpenID Connect** and **Share on LinkedIn**
   (instant). This app ("Siar") is the one in production:
   `NETWORK_LINKEDIN_CLIENT_ID` / `NETWORK_LINKEDIN_CLIENT_SECRET`. Redirect URL:
   https://api.siaran.my/api/v1/social-account/callback/LINKEDIN. Siar asks only for
   `openid profile email w_member_social` until step 5, so personal posting works immediately.
4. Community Management can only be requested on a **new app with no other products**
   (LinkedIn CM FAQ 4). Create a second app **"Siar Pages"** (same company page, verified), add only
   Community Management API, submit the request below. To demo/test it in Siar, point a staging
   env at it with `NETWORK_LINKEDIN_SCOPES="r_basicprofile w_member_social r_member_postAnalytics
   r_organization_social w_organization_social rw_organization_admin"` (no openid on a CM-only app;
   Siar then identifies the member through /v2/me).
5. After Standard tier is granted, request Community Management on the main "Siar" app, entering
   the "Siar Pages" client ID (CM FAQ 1/5), then set `NETWORK_LINKEDIN_COMMUNITY_MANAGEMENT=true`
   in production. "Siar Pages" can be discarded.

## Community Management API request (paste)
- Company: FF DEV STUDIO, Malaysia, SSM 202603234793; business email siaran@ffdev.studio.
- Use case: *"Siar is a social media management API and dashboard. Organizations connect the
  LinkedIn Pages they administer to publish and schedule posts (text, images, video, documents,
  articles), reply to and moderate comments, and see page and post analytics. Members can also
  post to their own profile."*
- Scopes Siar uses: w_organization_social, r_organization_social, rw_organization_admin (posting, comments, follower counts and page statistics), r_member_postAnalytics (member post analytics), w_member_social. Plus openid, profile, email from Sign In with LinkedIn.
- Development tier is granted first; **Standard tier** requires a screencast: connect LinkedIn →
  pick an organization → publish a post with an image → reply to a comment on the **organization's** post
  (member comment reads need r_member_social, which is closed) → analytics.
- API version: Siar pins `Linkedin-Version: 202609` (linkedin.ts `LINKEDIN_VERSION`). Versions sunset
  after ~12 months: bump before **Sep 2027**.

Risk: LinkedIn may question a sole-proprietor registration. If refused, the fallback is applying
again once a Sdn Bhd exists; personal posting keeps working meanwhile.
