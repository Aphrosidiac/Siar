Verified 2026-11-12: 21 corrections

Re-check scope: pricing.md, /pricing, home, 34 landing-page titles, both sitemaps, OpenAPI, docs (webhooks, SDK, CLI, MCP,
glossary, llms.txt), npm, GitHub, Trustpilot, status page, Product Hunt and the four competitor pages were re-opened and compared
on 2026-11-12. Pricing, quotas, caps, X rates, network list, OpenAPI counts and the 3-operation gap all matched. The web-search
budget was exhausted before any search could be re-run, so the autocomplete, Reddit and roundup claims are marked unverified.

# Competitor teardown: bundle.social

Checked 2026-11-12. Scope: bundle.social (marketing site), info.bundle.social (Mintlify docs), api.bundle.social (OpenAPI).
Labels: **[measured]** = I fetched it and read it on 2026-11-12, **[sourced]** = vendor or third-party URL given,
**[inferred]** = my reading of the evidence, **[third-party]** = someone other than bundle.social says it,
**[unverified]** = could not confirm on the vendor's own page.

Raw captures used for this file (not committed): home and pricing HTML, `bundle.social/pricing.md`, both sitemaps,
`api.bundle.social/swagger-json` (1.6 MB), the docs pages for webhooks, SDK, CLI, MCP. The 2026-10-11 copies already
in `docs/reference/2026-10-11/` are the earlier baseline.

---

## 1. Who they are

| Fact | Value | Label / source |
|---|---|---|
| Legal entity | BUNDLE SP. Z O.O. (footer "© 2026 BUNDLE SP. Z O.O.") | [measured] https://bundle.social/ |
| Country | Poland | [inferred] from the "Sp. z o.o." legal form; [third-party] SourceForge also says Poland, founded 2024 |
| People named | Kacper Kurteczka, Marcel Czuryszkiewicz (blog author pages); both are listed as makers on Product Hunt (maker comment signed "Marcel & Kacper") | [measured] sitemap `/blog/author/*`; [sourced] https://www.producthunt.com/products/bundle-social (checked 2026-11-12) |
| Launch | Product Hunt: "Launched on December 3rd, 2024", plus a second launch labelled "Launched this week" (leaderboard link points to 11 Nov 2026) | [sourced] https://www.producthunt.com/products/bundle-social (checked 2026-11-12) |
| GitHub org | `bundleglobal` (repos: bundlesocial-node 3★, bundlesocial-examples 2★, cli 0★, mcp 0★, n8n, zapier, docs) | [measured] GitHub API 2026-11-12 |
| npm, last 30 days (12 Oct – 10 Nov 2026) | `bundlesocial` SDK 32,201 downloads (v2.70.0); `bundlesocial-mcp` 1,033; `bundlesocial-cli` 511 | [measured] api.npmjs.org |

The SDK download count is the best public signal of real API usage. 32k/month on a generated SDK is a real
installed base [inferred]; CI installs inflate it, so it is not a customer count.

---

## 2. Positioning, headlines, CTAs, proof

### Home page, https://bundle.social/ [measured, checked 2026-11-12]

- `<title>`: "Unified Social Media API, Unlimited Social Accounts"
- Meta description: "One social media API for publishing, analytics, and comments, plus Instagram and Facebook DMs and TikTok comment automation. Unlimited accounts on paid plans."
- Eyebrow: "For SaaS products, agencies, and AI agents"
- H1: "One unified social media API. No account limits." (prefixed in the markup by the wordmark "bundle.social")
- Subhead: "Publish, schedule, manage comments, and track analytics across 15 platforms. The same API also handles Instagram and Facebook DMs and TikTok comment automation. Paid plans include unlimited connected social accounts with no per-account fees."
- CTAs: "Start free trial" (primary), "Watch demo", "14-day free trial · read the docs", "Check out the demo", "Start for free" (each plan card + closing band), "Contact us" (Enterprise), "Explore all features", "Explore the Social Media API", "Tell us what you are building", "View messaging and automation features", "Compare bundle.social with every alternative".
- Section headings (H2, in order), with H3s:
  1. "The 15 social platforms bundle.social supports" — sub-line "Ship one post flow and publish across every major channel without custom per-platform handling."
  2. "What teams say after switching"
  3. "Transparent pricing for every growth stage"
  4. "What you can build with one social media API" — H3: Scheduling Posts & Comments · Analytics · Post History · Direct messages · Reply automation
  5. "Social media API infrastructure for developers, startups, and SaaS teams" — H3: Unified social media API · Publishing and media workflows · Unlimited connected accounts · One social media API instead of 15 separate integrations · Built for SaaS products with unlimited connected accounts
  6. Eyebrow "For developers & AI agents", H2 "The social media API your AI agent already knows how to use" — H3: MCP server, CLI & SDK · Social media API product · API reference
  7. "Instagram and Facebook messaging, plus TikTok comment automation" — H3: Instagram DM API · Facebook Messenger API · Comment to DM · TikTok comment automation
  8. Eyebrow "Roadmap", H2 "Planned API workflows" — H3: Social Media Ads API ("Ads API workflows are on the roadmap and not available yet.")
  9. "What teams ask before switching to a social media API" — 13 FAQ H3s, including "Does bundle.social charge per user, seat, or connected account?", "Is API access limited to paid plans?", "Is bundle.social white-label friendly?", "What is the difference between bundle.social, Ayrshare, and Zernio?", "Is bundle.social a good fit for a solo maker with two accounts?" (answer: "Probably not."), "Does bundle.social have an MCP server?"
  10. "Start building on the social media API"
- Line under the infra section: "Platform coverage and plan details last verified October 26, 2026."

**Proof used** [measured]:
- Stats strip: "16,454+ customers · 838k+ connected accounts · 99.881% uptime · 4.7 / 5 on Trustpilot", then "Official platform APIs · Multi-tenant by design · Proven at scale".
- Three Trustpilot quotes, first name + country + month only: Phil (US, July 2026: "I assessed three products: Ayrshare, OneAll, and Bundle Social…"), Kiran (GB, July 2026: "…far better than alternatives such as Ayrshare…"), Tucker (US, March 2026: unlimited profiles without per-account fees). Caption: "Published reviews on Trustpilot, quoted verbatim. Collected September 2026."
  Re-check 2026-11-12: Phil's (Phil Pataky, 11 Jul 2026) and Tucker's (Tucker Eighmy, 23 Mar 2026) reviews are on Trustpilot with the quoted text. **Kiran's review was not found** on Trustpilot pages 1 and 2 of the listing; it exists only as quoted on bundle.social's home page [unverified on Trustpilot].
- No customer logos on the home page.
- Cross-checks: Trustpilot shows 35 reviews, TrustScore 4.8, all 5-star, no company replies, and Trustpilot's own note that the company has no recent history of asking for reviews [sourced] https://www.trustpilot.com/review/bundle.social (fetched 2026-11-12). The status page shows api.bundle.social at 100% / 100% / 99.812% for its unlabelled periods and one incident, 31 Aug 2026, "Elevated API errors and delayed publishing", 4 h 3 min [sourced] https://bundlesocial.betteruptime.com/. The 16,454 customers and 838k accounts cannot be checked [unverified].

### Main landing pages (title / H1) [measured, checked 2026-11-12]

| URL | `<title>` | H1 |
|---|---|---|
| /pricing | Social Media API Pricing & Messaging Plans \| bundle.social | Transparent pricing for every growth stage |
| /social-media-api | Social Media API for Posting and Scheduling \| bundle.social | One social media API for posting, scheduling, analytics, and comments |
| /features | Social Media API Features & Automations \| bundle.social | Social media API features for publishing, messaging, and automation |
| /social-media-api-for-saas | Social Media API for SaaS \| bundle.social | Social media API for SaaS products adding publishing workflows |
| /white-label-social-media-api | White Label Social Media API for Branded Dashboards | White-label social media API for branded dashboards, client portals, and embedded schedulers |
| /social-media-oauth-api | Social media OAuth API for connecting customer accounts | (same as title) |
| /social-media-mcp-server | Social Media MCP Server for Claude & Cursor \| bundle.social | Social media MCP server for AI clients, posting, and scheduling |
| /instagram-api | (og) Instagram API for Posts and Reels | Instagram API for scheduling posts, Reels, Stories, and carousels |
| /tiktok-api/errors | (og) TikTok API Errors for Social Media API Publishing | TikTok API errors and troubleshooting |
| /alternatives | Social Media API Alternatives & Comparisons \| bundle.social | Social Media API Alternatives & Comparisons |
| /ayrshare-alternative | Ayrshare Alternative for Social Media API Publishing | Ayrshare Alternative & Pricing Comparison |
| /blog | bundle.social Blog \| bundle.social | bundle.social Blog: Social Media and Social Media APIs |
| /about | About \| bundle.social | About |

Landing pages share one template: problem H2 ("Building every native integration yourself", "Building OAuth per platform"…),
"What bundle.social handles", a three-step "How it works" (Create an API key → Connect accounts → Create or schedule posts),
then a long-form section that repeats the target phrase in H3s. The Ayrshare page attacks Ayrshare's per-profile model
directly ("An Ayrshare alternative without a $599 profile commitment"; meta: "no $149 profile minimum").

**Positioning in one line** [inferred]: "the per-organization, unlimited-accounts social API for SaaS and agents",
sold against Ayrshare's per-profile pricing and Zernio's per-account pricing. They also tell solo makers to go elsewhere.

---

## 3. Pricing (vendor's own page)

Sources: https://bundle.social/pricing and the machine-readable https://bundle.social/pricing.md ("Last updated: 2026-07-30"),
both checked 2026-11-12. The HTML cards and the markdown agree on every number below; the yearly prices appear only in
`pricing.md` (the static HTML renders monthly; the toggle is client-side) [measured].

**Billing model**: "Every plan is priced **per organization** - not per seat, not per connected social account, not per
workspace." A "social set" is a team; "Each team holds at most one connected account per network". Unlimited accounts
come from unlimited teams on paid plans. USD only.

| | Free | Pro | Business | Enterprise |
|---|---|---|---|---|
| Monthly | $0 | $100 | $400 | Custom |
| Yearly (effective per month) | – | $90 | $360 | Custom |
| Trial | – | 14-day trial | – | – |
| Posts / month | 20 (monthly, recurring) | 10,000 | 100,000 | Custom |
| Comments / month | 50 | 5,000 | 50,000 | Custom |
| Media uploads / month | 200 | 100,000 | 1,000,000 | Custom |
| Social sets (teams) | 3 (card says "Social accounts 3") | Unlimited | Unlimited | Custom |
| API access | Yes | Yes | Yes | Custom |
| Analytics | No | Yes | Yes | Custom |
| Post history import / account / month | 5 | 100 | 500 | Custom |
| Comments stored per post import | 25 | 200 | 1,000 | Custom |
| Review import / account / month | 5 | 200 | 200 | Custom |
| Sent DMs / connected account / month | Not included | 200 | 1,000 | Custom |
| Automation runs / account / month | Not included | 200 | 1,000 | Custom |

- **Same on every plan**: 50 API keys, **5 webhooks** per organization, 50 bots per team; rate limits 100/s, 500/10 s, 2,000/min (per endpoint with `x-api-key`).
- **Daily per-network publishing caps** per account (Free / Pro / Business), e.g. TikTok 5/10/15, Instagram 10/50/100, X 5/15/15, LinkedIn 10/18/24, Threads 10/200/250. Full table in `pricing.md`.
- **Overage**: none. "If you exceed the limits, you can upgrade or talk to us about an Enterprise plan" (pricing FAQ). Quotas are enforced at creation.
- **X pass-through**: prepaid credit; post $0.015, post with link $0.20, comment/reply same, delete $0.01, analytics/comment import/post import $0.005 per result. "X's own charges … passed through at cost." Prepaid X billing live since 16 Aug 2026.
- **DMs and automations are not self-serve**: "turned on per organization on request: email contact@bundle.social with your organization ID." Third parties describe this as "allowlist only" [third-party] Ayrshare compare page (confirmed 2026-11-12: "DMs on Instagram and Facebook, allowlist only, paid plans"); social-api.ai [unverified, not re-opened].
- **Smaller plan**: "Hobbyist and need a smaller plan? Message us and we will tailor it to your needs." There is no tier between $0 and $100.
- **Retention**: media kept 14 days after last use; DMs and automation logs 30 days; webhook events 7 days; analytics 30 days [sourced] https://info.bundle.social/llms.txt (Data Retention entry).

### Against Siar (Siar figures from `docs/pricing.md` and `apps/api/src/domain/plans.ts`)

| | bundle.social | Siar |
|---|---|---|
| Free | $0, 20 posts **per month**, 3 teams, no analytics | $0, **20 free posts to try** (one-time), 1 brand, no analytics |
| Entry paid | Pro $100/mo (yearly $1,080) | Starter $19 / RM39 per month, 1 brand, 300 posts |
| 10k posts | Pro $100/mo, unlimited teams | Pro $49 / RM99, **10 brands**, 14-day trial |
| 100k posts | Business $400/mo | Business $149 / RM399, unlimited brands |
| Yearly | 10% off (12 × $90) | 2 months free (10× monthly) |
| Currency | USD only | MYR in Malaysia (card, or pay once by FPX/DuitNow for yearly), USD elsewhere |
| Price lock | not stated | yes |
| DMs | on request, Pro 200 / Business 1,000 per account | Starter 500, Pro 1,000, Business 5,000 per account (plans.ts); beta, turned on per organization on request, like bundle.social |

**Honesty trap for Siar** [measured in Siar's own code]: Siar's schema comment says "Organization → Team ('social set') →
at most one live SocialAccount per network per team", the same rule as bundle.social. With 1 brand on Free and Starter and
10 on Pro, Siar connects at most 15 / 15 / 150 accounts on those plans. "Unlimited social accounts on every plan" (Siar
`facts.md`) is only literally true on Business and Enterprise. bundle.social avoids this by making teams unlimited on every
paid plan, and its Free card says "Social accounts 3". This conflicts with `docs/seo/research/siar-truth.md` §1c, which still allows "Unlimited connected social accounts on every
plan, Free included"; the per-team rule is confirmed in code (`SocialAccount_team_type_live` partial unique index, init
migration line 1408). Fakhrul should decide the wording before any comparison page
ships; a comparison page that says "unlimited accounts on every plan" next to bundle's table would not survive a
careful reader.

---

## 4. Networks and API features

### Networks [measured, home + `pricing.md` + OpenAPI enum]

15, same list as Siar: Facebook, Instagram, X (Twitter), TikTok, LinkedIn, Pinterest, Reddit, Discord, Slack, Mastodon,
Threads, YouTube, Bluesky, Google Business Profile, Snapchat. API enum: `TIKTOK, YOUTUBE, INSTAGRAM, FACEBOOK, TWITTER,
THREADS, LINKEDIN, PINTEREST, REDDIT, MASTODON, DISCORD, SLACK, BLUESKY, GOOGLE_BUSINESS, SNAPCHAT`.

Missing: WhatsApp, Telegram, Tumblr, any ads network ("Ads APIs are not generally available. They are on the roadmap").
Comments are not supported on Pinterest, Snapchat and Google Business Profile (all three are absent from the comment-length table, which says "Networks absent from this table do not support comments through bundle.social"), although `pricing.md` still lists daily comment caps for all 15. DMs:
Instagram and Facebook Messenger only. Competitors use Telegram and ads against them [third-party] Ayrshare:
https://www.ayrshare.com/compare/bundle-social-api-alternative/ (updated 23 Oct 2026).

bundle.social presents all 15 as live. Siar cannot match that today: TikTok rejected (sandbox), YouTube audit pending,
LinkedIn Pages denied, Pinterest trial (no publishing), Reddit/Snapchat/GBP parked (`docs/approvals/README.md`, 2026-11-12).
**Network coverage is bundle.social's clearest real advantage over Siar.**

### API features [measured from OpenAPI + docs]

| Feature | bundle.social | Siar |
|---|---|---|
| OpenAPI | 3.0 spec at `https://api.bundle.social/swagger-json`, **197 operations, 148 paths** (194 on 2026-10-11) | OpenAPI 3.0.2 contract with 270 operations on 207 paths; the live site also says 270 (the "263" in `docs/geo/facts.md` is stale) |
| Auth | `x-api-key` header (`ApiKeyAuth`) | same |
| Server | `https://api.bundle.social` | `https://api.siaran.my` |
| SDK | TypeScript/Node only: npm `bundlesocial` (v2.70.0, generated from OpenAPI); "Need Python or Go? … just ask" | TypeScript SDK (not on npm yet: `@siar/sdk` 404 per `siar-truth.md`) |
| CLI | `bundlesocial-cli`, JSON to stdout, env `BUNDLESOCIAL_API_KEY`, `BUNDLESOCIAL_API_URL` | JSON-first CLI (not on npm yet) |
| MCP | `bundlesocial-mcp`, **local stdio only**; "A hosted remote server at `mcp.bundle.social` is on the roadmap" | MCP server (not on npm yet) |
| Webhooks | HMAC-SHA256 in `x-signature`, `User-Agent: bundlesocial`; **3 attempts** (initial + 2), exponential from 30 s, 15 s timeout; auto-disable after 7 days without a success; max 5 per org; **no webhook routes in the public API** (OpenAPI has none; their Zernio migration guide says "Dashboard only - no public API endpoint"). Note: their webhook docs say you can re-enable or resend "from the dashboard or API", so their own docs disagree | 16 HMAC event types; 7 retries at 1 m, 5 m, 30 m, 2 h, 6 h, 12 h, 24 h (about 45 h in total, `engine/webhooks.ts`); full webhook CRUD + deliveries + resend + rotate-secret + test in the API (9 ops); also max 5 webhooks per org (`RESOURCE_LIMITS.webhooks`) |
| Webhook events | `post.published`, `post.externally-deleted`, `comment.published`, `social-account.created/updated/deleted`, `team.created/updated/deleted`, plus DM/automation: `comment.received`, `conversation.created`, `conversation.updated`, `conversation.message.created`, `conversation.message.updated`, `conversation.read.updated` (15) | same names minus `post.externally-deleted`, plus `credit.low-balance`, `credit.exhausted` (16) |
| White-label OAuth | `POST /api/v1/social-account/create-portal-link` with branding fields `logoUrl, userLogoUrl, userName, goBackButtonText, hidePoweredBy, hideGoBackButton, hideUserLogo, hideUserName, hideLanguageSwitcher, language, showModalOnConnectSuccess, maxSocialAccountsConnected, expiresIn` | hosted connect portal (`/api/v1/portal/{token}` etc.) with brand name, logo and accent colour; it runs on app.siaran.my and shows "Powered by Siar" (`Portal.vue` line 96), so it is branded, not white-label |
| Analytics | normalized + raw, bulk, forced refresh; 24 h refresh cycle, 5 forced refreshes per team per day; paid plans only | analytics on Starter and up |
| Comments | create/update/delete/retry + comment import and moderation actions | same tags |
| DMs / automations | 10 conversation ops, 17 automation ops; IG + Messenger; enabled on request | same API surface; Meta approved 2026-10-27, but Siar DMs are a beta switch per organization, off by default ("Contact support to turn them on", `messaging-shared.ts` line 25) |
| Idempotency | no Idempotency-Key header; `referenceKey` + `GET /post/reference-key/{referenceKey}` (their own migration guide) | same `referenceKey` (unique per org in schema) |
| Other | CSV import, post-history import, multipart uploads up to and above 5 GiB, n8n/Make/Zapier integrations + 14 templates | link-in-bio, bots, API-key management in the API |

### Exact API naming for Siar's "drop-in replacement" pages [measured, OpenAPI 2026-11-12]

Base path `/api/v1/`. Tags (operationId prefixes): `app, organization, team, socialAccount, upload, post, credit,
analytics, comment, conversation, automation, postImport, postCSV, misc`.

Core paths (method, path, operationId):

```
GET    /api/v1/                                   app.getHealth
GET    /api/v1/organization/                      organization.getOrganization
GET    /api/v1/organization/usage/{posts|comments|uploads|daily-limits|imports|messages}
GET|POST /api/v1/team/            GET|PATCH|DELETE /api/v1/team/{id}
POST   /api/v1/social-account/connect             socialAccount.connect
DELETE /api/v1/social-account/disconnect          socialAccount.disconnect
POST   /api/v1/social-account/{set-channel|unset-channel|refresh-channels|create-portal-link|connection-check|profile-refresh|copy}
POST   /api/v1/social-account/messaging/{enable|disable}
GET    /api/v1/social-account/{by-type|to-delete}
GET|POST|DELETE /api/v1/upload/   GET|DELETE /api/v1/upload/{id}
POST   /api/v1/upload/{from-url|init|finalize}
POST   /api/v1/upload/multipart/{init|sign|complete|abort}
GET|POST /api/v1/post/            GET|PATCH|DELETE /api/v1/post/{id}    POST /api/v1/post/{id}/retry
GET    /api/v1/post/reference-key/{referenceKey}
GET|POST /api/v1/post/reconnect-social-account[/candidates]
GET    /api/v1/billing/credits/balance            POST /api/v1/billing/billable-usage/quote
GET    /api/v1/analytics/{social-account|post}[/raw]   GET /api/v1/analytics/post/bulk
POST   /api/v1/analytics/{social-account|post}/force
GET|POST /api/v1/comment/  GET|PATCH|DELETE /api/v1/comment/{id}  POST /api/v1/comment/{id}/retry
POST|GET /api/v1/comment/import   GET /api/v1/comment/import/{importId}   GET /api/v1/comment/import/comments
POST   /api/v1/comment/import/comments/{commentId}/action
GET    /api/v1/conversations/ ...  POST /api/v1/conversations/private-reply  (10 ops)
GET|POST /api/v1/automations ... /api/v1/automation-executions/{id}, /api/v1/automation-provider-settings, /api/v1/automation-rich-messages/conversations/{conversationId}
POST|GET /api/v1/post-history-import/ ...   POST|GET /api/v1/post-csv-import/ ...
/api/v1/misc/<network>/...  (92 ops on 64 paths; ops: google-business 27, facebook 15, youtube 14, linkedin 7, reddit 6, instagram 4, mastodon 4, twitter 4, tiktok 4, pinterest 2, slack 2, bluesky 2, discord 1)
```

`post.create` body: required `teamId, title, postDate, status, socialAccountTypes, data`; optional `referenceKey,
firstComment`. `status` enum `DRAFT | SCHEDULED`. `data` has one key per network (`TWITTER, PINTEREST, FACEBOOK,
INSTAGRAM, THREADS, TIKTOK, LINKEDIN, YOUTUBE, REDDIT, DISCORD, SLACK, MASTODON, BLUESKY, GOOGLE_BUSINESS, SNAPCHAT`).
`postDate` is one ISO-8601 UTC string; there is no timezone field (their own Zernio guide).
SDK: `import { BundleSocial } from 'bundlesocial'; new BundleSocial('<key>')`; the constructor signature is
`constructor(apiKey: string, options?: OpenAPIConfig)` and `OpenAPIConfig` has a `BASE` field, so pointing the SDK at
another host looks possible [inferred from `dist/index.d.ts` of v2.70.0; not tested]. The CLI and MCP read
`BUNDLESOCIAL_API_URL` [measured, docs].

**Wire-compatibility gaps found today** [measured: diff of live OpenAPI vs `packages/contract/openapi.json`]:
1. `GET /api/v1/misc/tiktok/locations` — new since 2026-10-11, not in Siar.
2. `GET /api/v1/misc/tiktok/post-settings` — new, not in Siar.
3. `GET /api/v1/organization/usage/messages` (operationId `organization.getMessagesUsage`) — new, not in Siar.
4. Webhook event `post.externally-deleted` — documented by bundle.social, not in Siar's event list.
5. Docs say the `teams` field on `GET /organization` "is deprecated and will be removed on 2026-11-15" — Siar should
   decide whether to mirror the removal.
Every other bundle.social operation (194 of 197) exists in Siar's contract at the same method and path.

**What a drop-in page must say honestly** [sourced: bundle.social's own guide
https://bundle.social/blog/migrate-from-zernio]: "OAuth tokens do not migrate". Tokens are bound to the vendor's
registered apps, so moving from bundle.social to Siar is a base-URL change for the code, but **every end user must
reconnect their social accounts**, and stored platform user IDs can change. The page should say "change the base URL,
then have users reconnect", not "switch in one line".

---

## 5. SEO footprint

### Page inventory [measured from sitemaps, 2026-11-12]

`bundle.social/robots.txt` allows everything except `/dashboard/ /api/ /auth/ /connect/ /tmp/`; it lists `llms.txt`,
`llms-full.txt` and `pricing.md`. `https://bundle.social/sitemap.xml`: **291 URLs**. `https://info.bundle.social/sitemap.xml`: **303 URLs**.

| Group | Count | Examples |
|---|---|---|
| Blog | 97 posts + index + 2 author pages | 86 of them last modified Aug 2026, 1 in Oct 2026, 10 in Nov 2026 |
| Free tools | 31 + index | 11 character counters (10 per network + 1 general), image resizer, engagement-rate calculator, social-media-api-cost-calculator, safe-zone checker, video-specs checker |
| Automation templates | 14 + 3 index pages | n8n (11), Make (1), Zapier (2) |
| Integrations | 3 + index | n8n, Make, Zapier |
| "X alternative" pages | 22 + /alternatives hub | zernio, getlate, ayrshare, upload-post, postiz, buffer, hootsuite, metricool, publer, socialpilot, blotato, postbridge, storrito, apitwitter, later, sprout-social, loomly, coschedule, planoly, tailwind, socioboard, manychat |
| Per-network API pages | 15 | /instagram-api … /snapchat-api, /x-api |
| Per-network error pages | 14 + /errors hub | /tiktok-api/errors … (no Snapchat) |
| Per-network "Scheduler" pages | 15 | /instagram ("Instagram Scheduler"), /threads ("Threads Scheduler for Text-First Posting"), /google-business-dashboard |
| Capability / sub-feature API pages | ~60 | posting, scheduling, comments, analytics, post-history, media-upload, bulk, first-comment, OAuth, webhooks, DM, comment-to-DM, auto-reply ×4, music ×3, audience demographics ×3, GBP sub-APIs ×8, ads ×7 (roadmap), for-SaaS, multi-tenant, white-label, for-AI-agents, MCP, CLI, claude-code, cursor, meta-app-review-rejected |
| Docs: API reference | 263 | one page per endpoint plus guides |
| Docs: knowledge base | 22 | per-network connect guides |
| Docs: "vs" comparisons | 10 + hub | /comparison/ayrshare, buffer, hootsuite, later, planoly, publer, socialbee, socialpilot, sproutsocial, zohosocial |
| Docs: glossary | 1 page, 44 terms | https://info.bundle.social/glossary |

That is about 590 indexable URLs across the two hosts, against Siar's 87 submitted to IndexNow in October [inferred count
from `docs/geo/plan.md`]. Both bundle.social hosts also ship `llms.txt` (info: 73 KB, main: 21 KB) and a markdown rate card.

### Keyword targets [inferred from page `<title>`s; the sitemap has 159 non-blog, non-tool URLs, the original pass fetched 145, the re-check sampled 34]

1. Head terms: "social media API", "unified social media API", "social media posting API", "social media scheduling API".
2. "<network> API" for all 15 networks; 11 of the 15 are titled "<Network> API for Posting and Scheduling" (Instagram "for Posts and Reels",
   LinkedIn "for Posts and Scheduling", Snapchat "for Public Profile Workflows", X "Alternative for…") [measured 2026-11-12], plus long-tail sub-APIs:
   "Instagram DM & Messaging API with Webhooks", "TikTok Content Posting API", "YouTube Upload API", "LinkedIn Company
   Page API", "Google Business Profile Reviews API" (8 GBP sub-API pages: hours, food menu, attributes, media…),
   "TikTok Commercial Music Library API", "Instagram Audience Demographics API".
3. "<Network> Scheduler" (15 pages): they also chase the end-user scheduler query, not only the developer one.
4. Pain-point pages: "X / Twitter API Alternative for Posting and Scheduling" (/x-api, aimed at X's pricing), "Meta App
   Review Rejected? Ship Facebook & Instagram Publishing" (/meta-app-review-rejected).
5. "<network> API errors" troubleshooting pages (14).
6. Buyer modifiers: "for SaaS", "white label", "multi-tenant", "for AI agents", "MCP server", "Claude Code", "Cursor",
   "n8n / Make / Zapier social media".
7. "<competitor> alternative" (22) and "bundle.social vs <tool>" (10).
8. Roadmap pages that still rank-bait: 7 ads-API pages (a hub plus Meta, Google, TikTok, LinkedIn, Pinterest, X) for a product
   that is "not available yet".
9. Free-tool traffic: "<network> character counter", "image resizer", "webp to png".
10. Blog: rate limits, permissions, approval and pricing per network ("x-api-pricing-2026-costs-limits",
   "youtube-api-quota-exceeded-limits-fixes", "meta-app-review-20-days", "tiktok-api-approval").

### Brand demand [inferred from Google autocomplete, 2026-11-12; **unverified in the re-check**: the search budget ran out before autocomplete could be re-run]

"bundle.social" suggests: pricing, social media, social api, app, reviews, **status**, club, **mcp**, docs. "bundle social"
also suggests **reddit**. "bundle.social alternative" returns "bundle social alternatives". Status, MCP and docs
suggestions point to an active developer user base searching for the product by name. There is no volume API here, so
no numbers.

### Who links to / talks about them [sourced unless marked]

- Review sites: Trustpilot (35 reviews, 4.8; re-confirmed 2026-11-12), G2 https://www.g2.com/products/bundle-social/reviews (11 reviews per a
  search snippet; page returned 403 again on 2026-11-12, [unverified]), Capterra/GetApp/Software Advice (1–2 reviews per search
  snippets, pages 403, [unverified]), SaaSworthy, SourceForge, AlternativeTo, StackShare.
- Product Hunt listing (launch Dec 2024).
- GitHub `bundleglobal` (low stars), npm (3 packages), n8n/Zapier/Make integrations.
- Competitor pages that target bundle.social's brand (all four re-opened 2026-11-12 and confirmed; WoopSocial's is dated 7 May 2026,
  Schedule & Chill's title is "Bundle.social API 2026: Free Plan Limits vs Schedule & Chill"): Ayrshare "Ayrshare vs. Bundle.social"
  (https://www.ayrshare.com/compare/bundle-social-api-alternative/, updated 23 Oct 2026), Zernio
  (https://zernio.com/alternatives/bundle), WoopSocial "The 8 Best Bundle.Social Alternatives"
  (https://woopsocial.com/blog/bundle-social-alternatives), Schedule & Chill
  (https://schedulenchill.com/bundle-social-vs-schedule-and-chill).
- Roundups that include it: outstand.so, buffer.com/resources, zernio.com blog, ryandoser.com, social-api.ai,
  postoria.io, dev.to (titles from search results, not each opened) [unverified: not re-run in the re-check].
- Reddit / Indie Hackers / Hacker News: **no threads found** across three searches in the original pass [unverified in the re-check:
  the searches could not be re-run]. Note autocomplete above suggested "bundle social reddit", so treat "no threads" as weak.

---

## 6. Weaknesses and complaints

Real user complaints are scarce. What exists:

| Weakness | Evidence | Label |
|---|---|---|
| Nothing between $0 and $100 | No tier between Free and Pro; their own FAQ says a solo maker with two accounts is "Probably not" a fit; "Hobbyist… Message us" | [measured] home, pricing |
| DMs and automations not self-serve | "turned on per organization on request: email…" | [measured] pricing |
| Webhooks: no API routes, 5 per org, 3 delivery attempts | OpenAPI has no webhook paths (their docs still say re-enable/resend "from the dashboard or API"); docs table "Max attempts 3"; `pricing.md` "Webhooks per organization 5" (Siar has the same 5 cap) | [measured] |
| MCP is local stdio only; hosted MCP on roadmap | MCP docs | [measured] |
| TypeScript-only SDK | SDK docs ("Need Python or Go? … just ask") | [measured] |
| No ads API, no WhatsApp/Telegram | `pricing.md` "Do not assume"; Ayrshare compare page | [measured] / [third-party] |
| USD only, 10% yearly discount | `pricing.md` | [measured] |
| Analytics refresh once per 24 h, 5 forced refreshes per team per day; no analytics on Free | home page analytics block | [measured] |
| Short retention: media 14 days, DMs and logs 30, webhook events 7 | docs llms.txt Data Retention | [sourced] |
| Self-contradicting content | Migration guide says "bundle.social does not ship direct messaging or ads"; the home page sells IG/FB DMs. Home: "Unlimited connected accounts are included on every plan"; Free card: "Social accounts 3". Home "4.7 / 5" vs Trustpilot 4.8. Zernio's page still says bundle.social has no DM API and 14 networks | [measured] |
| Outage | 31 Aug 2026, elevated API errors and delayed publishing, 4 h 3 min | [sourced] status page |
| Migration friction | "a few minor hiccups during the initial setup and migration" (Capterra review, per search snippet) | [third-party, unverified] |
| Review base is thin | 35 Trustpilot reviews, all 5-star, no replies; Trustpilot notes no recent history of asking for reviews | [sourced] |
| Third-party "polish and security" criticism | scoutforge.net review (search snippet only) | [third-party, unverified] |

### Gaps Siar can use honestly

1. **Price at the same quotas**: 10k posts for $49 vs $100; 100k posts for $149 vs $400 [measured both sides]. Caveat:
   Siar Pro caps brands at 10; bundle Pro does not (see §3 honesty trap).
2. **A plan for one business**: Starter $19 / RM39 fills the $0–$100 gap bundle.social sends to "message us".
3. **Ringgit, FPX/DuitNow, Malaysian invoice, price lock**: bundle.social is USD only with no price-lock promise.
4. **Webhooks in the API**: create, test, resend, rotate secret over the API; bundle.social's OpenAPI has no webhook routes and
   retries 3 times. Siar retries 7 times over about 45 hours [code: `engine/webhooks.ts`]. Do not claim more webhooks: both cap
   at 5 per organization.
5. ~~DMs without an email request~~ **Not a gap today**: Siar's DMs are also a per-organization beta switch, off by default,
   turned on by contacting support [code: `messaging-shared.ts`, `schema.prisma` `messagingEnabled @default(false)`]. The
   only honest DM difference is the per-account allowance (Siar Starter 500 vs no bundle.social plan below $100).
6. **Same API, so no rewrite**: 194 of 197 operations match by method and path today. Close the 3 gaps + `post.externally-deleted`
   before publishing a "drop-in" page, and state the reconnect step.
7. **Stale and contradicting competitor content**: bundle.social pages disagree with each other. A dated, sourced Siar
   comparison table can be the clean version AI engines quote. This is where Siar beats it on GEO, not on volume.

Where Siar must not compete today: network coverage (bundle.social has all 15 live; Siar does not), scale proof
(they show customer and account numbers; Siar has none and must not invent any), content volume (~590 URLs vs 87).

---

## 7. One line

Siar is the same bundle.social-compatible API at half the price or less, with a plan for a single business, ringgit
billing and webhooks you manage from code; say "change the base URL, then reconnect your accounts", and never claim
network parity until the approvals land.
