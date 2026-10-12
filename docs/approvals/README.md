# Platform approvals — the Track B pack

Everything a platform asks for, written in advance. Fakhrul's part is marked **[F]**: creating
developer accounts, identity/business verification uploads, paying, and clicking Submit. Every
answer, justification and screencast script is in the per-platform files and can be pasted as-is.

Values used everywhere (change in one place if the name/domain changes):

| Field | Value |
|---|---|
| App / product name | **Siar** |
| Legal entity | FF DEV STUDIO (SSM 202603234793), Malaysia |
| Website | https://siaran.my |
| Dashboard | https://app.siaran.my |
| API | https://api.siaran.my |
| Media domain (verify for TikTok URL pull) | https://media.siaran.my |
| Privacy policy | https://siaran.my/privacy |
| Terms of service | https://siaran.my/terms |
| Data deletion instructions | https://siaran.my/data-deletion |
| Support email | siaran@ffdev.studio (Workspace alias; also the developer-account login everywhere). hello@siaran.my forwards to it via Cloudflare Email Routing. Mail is sent from siar@ffdev.studio (MAIL_FROM in production) |
| OAuth callback pattern | `https://api.siaran.my/api/v1/social-account/callback/<NETWORK>` |
| Meta webhook | `https://api.siaran.my/api/v1/webhooks/meta` |
| App icon | 1024×1024 PNG from the site's brand kit |
| Reviewer login | a seeded organization (apps/api/prisma/seed-reviewer.ts) — email/password given only inside each platform's private reviewer field |

## Tracker

| # | Platform | Gate | Needs live app? | [F] steps | File |
|---|---|---|---|---|---|
| 1 | Meta (Facebook, Instagram, Threads, Messenger/IG DMs) | Business verification → App Review (Advanced Access) | Review: yes | Business portfolio, upload SSM + proof of address, create app, Submit | [meta.md](meta.md) |
| 2 | TikTok | Content Posting API audit | yes | Developer account, create app, verify domain, Submit audit | [tiktok.md](tiktok.md) |
| 3 | Google — YouTube | OAuth verification (sensitive scopes) + YouTube API quota audit | yes | Cloud project, Search Console domain verify, Submit both | [google.md](google.md) |
| 4 | Google — Business Profile | API access request | no (website must describe it) | Submit the access form from the GBP-owning account | [google.md](google.md) |
| 5 | LinkedIn | Community Management API (org pages), on a separate CM-only app | dev tier: no; standard: yes | Main app (OIDC + Share) + "Siar Pages" CM app, verify company page, Submit | [linkedin.md](linkedin.md) |
| 6 | X | none — pay-per-use credits | no | Developer account, create app, buy credits | [x.md](x.md) |
| 7 | Pinterest | Standard access | yes | Business account, create app, Submit | [pinterest.md](pinterest.md) |
| 8 | Reddit | Responsible Builder API access request | no | Submit request, create "web app" | [reddit.md](reddit.md) |
| 9 | Snapchat | Public Profile API allowlist (via a Snap partner contact) | yes | Snap Business account, OAuth app in Ads Manager → Business Details, email the client ID to Snap | [snapchat.md](snapchat.md) |
| 10 | Discord | none (<100 servers) | no | Create application + bot | [discord-slack-bluesky-mastodon.md](discord-slack-bluesky-mastodon.md) |
| 11 | Slack | none (Marketplace optional) | no | Create app, activate public distribution | same |
| 12 | Bluesky | none | no | nothing | same |
| 13 | Mastodon | none | no | nothing | same |

## Order of operations

1. **Day 1 (no live app needed):** domain + support mailbox; Meta business verification; Google
   Cloud project + domain verification; LinkedIn developer app + company page; X developer
   account; TikTok developer account; Pinterest business account; Reddit access request;
   Google Business Profile access request; Snapchat application; Discord + Slack apps.
2. **After deploy (live HTTPS app):** submit Meta App Review (posting set first, messaging set
   second), TikTok audit, Google OAuth verification + YouTube audit, LinkedIn standard tier,
   Pinterest standard access — all in the same week.
3. **When a review comes back:** I fix the exact point raised and it is resubmitted the same day.

## Credentials → server env

Each approval ends with app credentials. They go into the production `.env` as
`NETWORK_<TYPE>_<KEY>` (e.g. `NETWORK_FACEBOOK_CLIENT_ID`). A network turns on the moment its keys
are present; `/api/v1/` health lists which are available.
