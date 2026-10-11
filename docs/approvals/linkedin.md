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
   (instant). Request **Community Management API** — this must be the only other product on the app;
   if LinkedIn insists, create a second app "Siar Pages" just for it.

## Community Management API request (paste)
- Company: FF DEV STUDIO, Malaysia, SSM 202603234793; business email hello@siaran.my.
- Use case: *"Siar is a social media management API and dashboard. Organizations connect the
  LinkedIn Pages they administer to publish and schedule posts (text, images, video, documents,
  articles), reply to and moderate comments, and see page and post analytics. Members can also
  post to their own profile."*
- Scopes: w_organization_social, r_organization_social, rw_organization_admin, r_organization_followers, w_member_social, openid, profile, email.
- Development tier is granted first; **Standard tier** requires a screencast: connect LinkedIn →
  pick an organization → publish a post with an image → reply to a comment → analytics.

Risk: LinkedIn may question a sole-proprietor registration. If refused, the fallback is applying
again once a Sdn Bhd exists; personal posting keeps working meanwhile.
