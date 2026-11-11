# siaran.my: current site map for SEO

Checked 2026-11-12. Builds on `docs/geo/` (brief, facts, plan, baseline, owner-todo, offsite-plan); it does not redo the
2026-10-13 GEO audit, it re-measures the live site and adds the keyword, indexing and gap view.

Labels: **[measured]** = I saw it (live fetch, page source, search result page) · **[sourced]** = vendor or third-party URL ·
**[inferred]** = my judgement from evidence. No keyword-volume tool was available; demand notes are inferred from Google
autocomplete, SERP composition and competitor page targeting.

## 1. Summary

1. **The site is small, clean and technically sound, but ranks only for its own name.** 89 URLs in the sitemap, all 200,
   self-canonical, static HTML, AI bots allowed (2026-10-13 audit still holds). In Bing and DuckDuckGo top-10 checks for
   10 non-branded queries, siaran.my appeared for none [measured]. It ranks for "siar api" (DDG #3 and #4) and
   "Siar social media API" (Bing #2 and #3) [measured].
2. **Google has indexed about 32 of 89 URLs plus 3 dashboard URLs** [measured, `site:` operator, approximate]. The whole
   docs tree except 3 pages is missing, including `/docs/quickstart`, plus 3 of 8 use-case pages and at least 5 of 15 error pages.
3. **Two raw-HTML text bugs leak into search results:** every split headline renders as glued words ("Discord API
   errorsand how to fix them." is the snippet Google shows) [measured], and the home price calculator's server-rendered
   default (40 brands → "RM99 Pro", 240 connected accounts) contradicts the pricing. Bing Copilot now tells people
   "RM399/month for up to 240 connected accounts" [measured], which is wrong: every plan has unlimited accounts.
4. **The home page title targets no keyword** ("Siar | Write it once. Siar it everywhere."). Several hub titles are
   generic ("Product tour", "Supported platforms", "Use cases").
5. **Network pages present all 15 networks as working.** No page says that Reddit, Snapchat and Google Business Profile
   are parked, that the TikTok audit was rejected, that YouTube is waiting on an audit, that Pinterest publishing needs
   Standard access, or that LinkedIn company pages were denied. `/linkedin-api` promises company-page posting
   [measured against `docs/approvals/README.md`].
6. **Missing page types**, compared with what bundle.social's own sitemap targets (291 URLs, same URL scheme as Siar):
   alternatives/compare, migration, MCP server, agencies/white-label, an errors hub, network-specific feature pages,
   and how-to guides. The bundle.social comparison and migration pages need Fakhrul's naming decision first (parked in project state).
7. **Cannibalisation is mild but real:** three page families each have a use-case page, a docs guide and a docs/api page
   for the same topic (webhooks, analytics, comments, connect/OAuth, posting/scheduling), and their titles do not separate the intents.

## 2. Inventory

Source: https://siaran.my/sitemap-index.xml → https://siaran.my/sitemap-0.xml (89 `<loc>`), fetched 2026-11-12, every
URL downloaded and parsed [measured]. Source templates: `apps/site/src/pages/` (`[api]/index.astro` and
`[api]/errors.astro` generate the 30 network pages from `lib/networks.ts`; `use-cases/[slug].astro` from
`lib/usecases.ts`; `docs/api/[tag].astro` from the OpenAPI document).

| Group | URLs | Template | Notes |
|---|---|---|---|
| Home, about, pricing, features, platforms, changelog, contact | 7 | hand-written | |
| Legal and platform-review pages | 5 | mdx | privacy, terms, refunds, delivery, data-deletion |
| Use cases | 1 hub + 8 | `use-cases/[slug].astro` | 4 are in the footer; analytics, comments, webhooks and hosted-connect are not |
| Network pages `/<net>-api` | 15 | `[api]/index.astro` | title `"<Net> API: post, schedule and analyze \| Siar"` |
| Network error pages `/<net>-api/errors` | 15 | `[api]/errors.astro` | 8–15 errors each; Mastodon has none listed (203 words) |
| Docs guides | `/docs` + 11 | mdx, `Doc` layout | |
| API reference | `/docs/api` + 25 tags | `docs/api/[tag].astro` | automation page is 1.27 MB / ~40k words |
| Not in sitemap, served | `/llms.txt`, `/pricing.md`, `/openapi.json`, `/og-card` (noindex), 404 | | |

Sitemap `<lastmod>`: 36 URLs on 2026-11-12 (API reference regenerated, now "270 operations"), the rest
2026-10-12 to 10-15 [measured].

### Per-page table

\* Words = visible text outside `<header>`, `<footer>` and `<nav>` (includes the CTA band and code samples).
\*\* In = number of other sitemap pages linking to it from body content; "+site-wide" = also linked from the global
header or footer on every page. Out = distinct internal body links. [measured]

| URL | Title (chars) | Meta description (chars) | H1 (as crawled) | Words* | In / out** | Effective target | Answers in first 60 words |
|---|---|---|---|---|---|---|---|
| / | Siar \| Write it once. Siar it everywhere. (41) | Siar is one REST API to publish, schedule, comment on and measure social media across 1... (186) | Write it once.Siar it everywhere. | 1,631 | 0+site-wide / 23 | brand "Siar" (title); description implies "unified social media API" | Yes |
| /about | About Siar, the unified social media API (40) | Siar is a unified social media API built by FF Dev Studio, a software studio in Malaysia. (89) | About Siar | 260 | 0+site-wide / 2 | "about Siar" (brand) | Yes |
| /changelog | Changelog \| Siar (16) | What changed in the Siar API and SDKs, newest first. Version 1.0 is the first release. (86) | Changelog | 227 | 1+site-wide / 2 | "Siar changelog" | Yes |
| /contact | Contact Siar for support, sales and security (44) | How to reach the Siar team for support, sales, security and data requests. (74) | Contact | 192 | 2+site-wide / 9 | "contact Siar" | Yes |
| /data-deletion | Data deletion \| Siar (20) | How to delete the data Siar holds about a connected social account or your organization... (126) | Data deletion | 490 | 4+site-wide / 2 | none (platform-review page) | Yes |
| /delivery | Siar delivery, shipping and returns policy (42) | Siar is software delivered online. Nothing is shipped, so there are no shipping costs a... (101) | Delivery policy | 343 | 3+site-wide / 4 | none (payment-gateway page) | Yes |
| /features | Product tour \| Siar (19) | A tour of Siar: composer, calendar, inbox, analytics, hosted connect, link in bio, API ... (132) | One dashboard.15 networks. No tab juggling. | 646 | 1+site-wide / 8 | "product tour" (no search demand); should be dashboard/scheduler terms | Partial |
| /platforms | Supported platforms \| Siar (26) | The 15 social networks the Siar API publishes to: post types, connection method and wha... (103) | 15 networks.One integration. | 641 | 6+site-wide / 16 | "supported platforms" (generic) | Partial |
| /pricing | Pricing: pay by business, not by channel \| Siar (47) | Siar pricing: Free with 20 posts to try, paid plans from RM39 a month in Malaysia and $... (173) | One price per business.Every account included. | 1,888 | 28+site-wide / 19 | "Siar pricing"; secondary "social media API pricing" | Partial (model, no numbers in first 60) |
| /privacy | Privacy policy \| Siar (21) | What data Siar collects, why, how long it is kept, who processes it and how to exercise... (100) | Privacy policy | 1,492 | 3+site-wide / 3 | none (legal) | Yes |
| /refunds | Siar refund and cancellation policy (35) | How to cancel a Siar plan, what happens to a free trial, and when payments are refunded. (88) | Refunds and cancellation | 841 | 3+site-wide / 4 | none (legal) | Yes |
| /terms | Terms of service \| Siar (23) | The terms that apply to your use of the Siar API, dashboard and website. (72) | Terms of service | 1,215 | 2+site-wide / 8 | none (legal) | Yes |
| /use-cases | Use cases \| Siar (16) | What teams build with the Siar social media API: posting, scheduling, multi-tenant prod... (153) | What people buildwith Siar. | 318 | 0+site-wide / 9 | hub, no keyword | Yes |
| /use-cases/hosted-connect-oauth | Hosted social account connect \| Siar (36) | A hosted connect page for 15 networks: send a link, the user signs in with the network,... (157) | Let your users connect their accounts without building OAuth | 457 | 4 / 19 | "hosted social account connect" (low-demand phrasing) | Yes |
| /use-cases/multi-tenant-social-media-api | Multi-tenant social media API \| Siar (36) | Run social publishing for many customers from one organization: a team per customer, is... (174) | Social publishing for every customer of your product | 485 | 3+site-wide / 19 | "multi-tenant social media API" | Yes |
| /use-cases/social-media-analytics-api | Social media analytics API \| Siar (33) | Read post and account metrics from 15 networks through one API, with a normalised shape... (131) | Post and account analytics, normalised | 402 | 2 / 19 | "social media analytics API" | Yes |
| /use-cases/social-media-api-for-ai-agents | Social media API for AI agents \| Siar (37) | An MCP server, a JSON-first CLI and a typed SDK for AI agents that post, schedule and r... (165) | Give your agent the ability to publish | 447 | 3+site-wide / 19 | "social media API for AI agents" | Yes |
| /use-cases/social-media-comments-api | Social media comments API \| Siar (32) | Publish comments and replies, import the comments people leave on your posts and modera... (149) | Read, reply to and moderate comments | 388 | 2 / 19 | "social media comments API" | Yes |
| /use-cases/social-media-posting-api | Social media posting API \| Siar (31) | Publish text, images, video and carousels to 15 social networks with one REST request. ... (179) | A posting API for every network you need | 534 | 2+site-wide / 19 | "social media posting API" | Yes |
| /use-cases/social-media-scheduling-api | Social media scheduling API \| Siar (34) | Schedule posts to 15 social networks with a UTC timestamp. Siar publishes on time, neve... (145) | Schedule posts from your own code | 511 | 5+site-wide / 19 | "social media scheduling API" | Yes |
| /use-cases/social-media-webhooks | Social media webhooks \| Siar (28) | Subscribe to 16 signed event types: posts, comments, accounts, X credit and conversatio... (163) | Signed webhooks for everything that changes | 423 | 3 / 19 | "social media webhooks" | Yes |
| /bluesky-api | Bluesky API: post, schedule and analyze \| Siar (46) | Publish and schedule Bluesky posts through one REST API. 1 post type, limits, scopes, d... (124) | Bluesky APIthrough Siar. | 674 | 28+site-wide / 19 | "Bluesky API" (head term owned by the network's own docs); long tail "post/schedule to Bluesky via API" | Partial (what can be posted, not how) |
| /bluesky-api/errors | Bluesky API errors and how to fix them \| Siar (45) | 10 Bluesky API errors: what each rejection means and the fix, as relayed by Siar. (81) | Bluesky API errorsand how to fix them. | 559 | 2 / 2 | "Bluesky API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /discord-api | Discord API: post, schedule and analyze \| Siar (46) | Publish and schedule Discord posts through one REST API. 1 post type, limits, scopes, d... (124) | Discord APIthrough Siar. | 649 | 28+site-wide / 19 | "Discord API" (head term owned by the network's own docs); long tail "post/schedule to Discord via API" | Partial (what can be posted, not how) |
| /discord-api/errors | Discord API errors and how to fix them \| Siar (45) | 9 Discord API errors: what each rejection means and the fix, as relayed by Siar. (80) | Discord API errorsand how to fix them. | 467 | 2 / 2 | "Discord API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /facebook-api | Facebook API: post, schedule and analyze \| Siar (47) | Publish and schedule Facebook posts through one REST API. 3 post types, limits, scopes,... (126) | Facebook APIthrough Siar. | 795 | 28+site-wide / 19 | "Facebook API" (head term owned by the network's own docs); long tail "post/schedule to Facebook via API" | Partial (what can be posted, not how) |
| /facebook-api/errors | Facebook API errors and how to fix them \| Siar (46) | 12 Facebook API errors: what each rejection means and the fix, as relayed by Siar. (82) | Facebook API errorsand how to fix them. | 624 | 2 / 2 | "Facebook API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /google-business-profile-api | Google Business Profile API: post, schedule and analyze \| Siar (62) | Publish and schedule Google Business Profile posts through one REST API. 4 post types, ... (141) | Google Business Profile APIthrough Siar. | 974 | 28+site-wide / 19 | "Google Business Profile API" (head term owned by the network's own docs); long tail "post/schedule to Google Business Profile via API" | Partial (what can be posted, not how) |
| /google-business-profile-api/errors | Google Business Profile API errors and how to fix them \| Siar (61) | 10 Google Business Profile API errors: what each rejection means and the fix, as relaye... (97) | Google Business Profile API errorsand how to fix them. | 628 | 2 / 2 | "Google Business Profile API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /instagram-api | Instagram API: post, schedule and analyze \| Siar (48) | Publish and schedule Instagram posts through one REST API. 3 post types, limits, scopes... (127) | Instagram APIthrough Siar. | 855 | 28+site-wide / 19 | "Instagram API" (head term owned by the network's own docs); long tail "post/schedule to Instagram via API" | Partial (what can be posted, not how) |
| /instagram-api/errors | Instagram API errors and how to fix them \| Siar (47) | 10 Instagram API errors: what each rejection means and the fix, as relayed by Siar. (83) | Instagram API errorsand how to fix them. | 551 | 3 / 2 | "Instagram API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /linkedin-api | LinkedIn API: post, schedule and analyze \| Siar (47) | Publish and schedule LinkedIn posts through one REST API. 1 post type, limits, scopes, ... (125) | LinkedIn APIthrough Siar. | 732 | 28+site-wide / 19 | "LinkedIn API" (head term owned by the network's own docs); long tail "post/schedule to LinkedIn via API" | Partial (what can be posted, not how) |
| /linkedin-api/errors | LinkedIn API errors and how to fix them \| Siar (46) | 10 LinkedIn API errors: what each rejection means and the fix, as relayed by Siar. (82) | LinkedIn API errorsand how to fix them. | 557 | 2 / 2 | "LinkedIn API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /mastodon-api | Mastodon API: post, schedule and analyze \| Siar (47) | Publish and schedule Mastodon posts through one REST API. 1 post type, limits, scopes, ... (125) | Mastodon APIthrough Siar. | 685 | 28+site-wide / 19 | "Mastodon API" (head term owned by the network's own docs); long tail "post/schedule to Mastodon via API" | Partial (what can be posted, not how) |
| /mastodon-api/errors | Mastodon API errors and how to fix them \| Siar (46) | How Mastodon errors are reported: what each rejection means and the fix, as relayed by ... (92) | Mastodon API errorsand how to fix them. | 203 | 2 / 3 | "Mastodon API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /pinterest-api | Pinterest API: post, schedule and analyze \| Siar (48) | Publish and schedule Pinterest posts through one REST API. 1 post type, limits, scopes,... (126) | Pinterest APIthrough Siar. | 693 | 28+site-wide / 19 | "Pinterest API" (head term owned by the network's own docs); long tail "post/schedule to Pinterest via API" | Partial (what can be posted, not how) |
| /pinterest-api/errors | Pinterest API errors and how to fix them \| Siar (47) | 10 Pinterest API errors: what each rejection means and the fix, as relayed by Siar. (83) | Pinterest API errorsand how to fix them. | 553 | 2 / 2 | "Pinterest API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /reddit-api | Reddit API: post, schedule and analyze \| Siar (45) | Publish and schedule Reddit posts through one REST API. 4 post types, limits, scopes, d... (124) | Reddit APIthrough Siar. | 716 | 28+site-wide / 19 | "Reddit API" (head term owned by the network's own docs); long tail "post/schedule to Reddit via API" | Partial (what can be posted, not how) |
| /reddit-api/errors | Reddit API errors and how to fix them \| Siar (44) | 10 Reddit API errors: what each rejection means and the fix, as relayed by Siar. (80) | Reddit API errorsand how to fix them. | 521 | 2 / 2 | "Reddit API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /slack-api | Slack API: post, schedule and analyze \| Siar (44) | Publish and schedule Slack posts through one REST API. 1 post type, limits, scopes, dai... (122) | Slack APIthrough Siar. | 671 | 28+site-wide / 19 | "Slack API" (head term owned by the network's own docs); long tail "post/schedule to Slack via API" | Partial (what can be posted, not how) |
| /slack-api/errors | Slack API errors and how to fix them \| Siar (43) | 10 Slack API errors: what each rejection means and the fix, as relayed by Siar. (79) | Slack API errorsand how to fix them. | 460 | 2 / 2 | "Slack API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /snapchat-api | Snapchat API: post, schedule and analyze \| Siar (47) | Publish and schedule Snapchat posts through one REST API. 3 post types, limits, scopes,... (126) | Snapchat APIthrough Siar. | 639 | 28+site-wide / 18 | "Snapchat API" (head term owned by the network's own docs); long tail "post/schedule to Snapchat via API" | Partial (what can be posted, not how) |
| /snapchat-api/errors | Snapchat API errors and how to fix them \| Siar (46) | 9 Snapchat API errors: what each rejection means and the fix, as relayed by Siar. (81) | Snapchat API errorsand how to fix them. | 493 | 2 / 2 | "Snapchat API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /threads-api | Threads API: post, schedule and analyze \| Siar (46) | Publish and schedule Threads posts through one REST API. 1 post type, limits, scopes, d... (124) | Threads APIthrough Siar. | 684 | 28+site-wide / 18 | "Threads API" (head term owned by the network's own docs); long tail "post/schedule to Threads via API" | Partial (what can be posted, not how) |
| /threads-api/errors | Threads API errors and how to fix them \| Siar (45) | 8 Threads API errors: what each rejection means and the fix, as relayed by Siar. (80) | Threads API errorsand how to fix them. | 473 | 2 / 2 | "Threads API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /tiktok-api | TikTok API: post, schedule and analyze \| Siar (45) | Publish and schedule TikTok posts through one REST API. 2 post types, limits, scopes, d... (124) | TikTok APIthrough Siar. | 849 | 28+site-wide / 19 | "TikTok API" (head term owned by the network's own docs); long tail "post/schedule to TikTok via API" | Partial (what can be posted, not how) |
| /tiktok-api/errors | TikTok API errors and how to fix them \| Siar (44) | 15 TikTok API errors: what each rejection means and the fix, as relayed by Siar. (80) | TikTok API errorsand how to fix them. | 659 | 3 / 2 | "TikTok API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /x-api | X (Twitter) API: post, schedule and analyze \| Siar (50) | Publish and schedule X (Twitter) posts through one REST API. 2 post types, limits, scop... (129) | X (Twitter) APIthrough Siar. | 929 | 28+site-wide / 19 | "X (Twitter) API" (head term owned by the network's own docs); long tail "post/schedule to X (Twitter) via API" | Partial (what can be posted, not how) |
| /x-api/errors | X (Twitter) API errors and how to fix them \| Siar (49) | 13 X (Twitter) API errors: what each rejection means and the fix, as relayed by Siar. (85) | X (Twitter) API errorsand how to fix them. | 662 | 2 / 2 | "X (Twitter) API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /youtube-api | YouTube API: post, schedule and analyze \| Siar (46) | Publish and schedule YouTube posts through one REST API. 2 post types, limits, scopes, ... (125) | YouTube APIthrough Siar. | 799 | 28+site-wide / 19 | "YouTube API" (head term owned by the network's own docs); long tail "post/schedule to YouTube via API" | Partial (what can be posted, not how) |
| /youtube-api/errors | YouTube API errors and how to fix them \| Siar (45) | 11 YouTube API errors: what each rejection means and the fix, as relayed by Siar. (81) | YouTube API errorsand how to fix them. | 597 | 2 / 2 | "YouTube API errors"; long tail = individual codes | No (opens with how Siar relays errors) |
| /docs | Documentation \| Siar docs (25) | Guides and reference for the Siar API. Start with the quickstart, then read the guides ... (140) | Documentation | 222 | 1+site-wide / 10 | "Siar docs" | Yes |
| /docs/api | API reference \| Siar docs (25) | Every operation of the Siar REST API (270 in version 1.0.0), generated from the OpenAPI... (128) | API reference | 523 | 4+site-wide / 27 | "Siar API reference" | Yes |
| /docs/authentication | Authentication \| Siar docs (26) | Authenticate with an organization API key in the x-api-key header. What keys can and ca... (137) | Authentication | 363 | 2 / 3 | "Siar API authentication" | Yes |
| /docs/connecting-accounts | Connecting accounts \| Siar docs (31) | Connect social accounts from your own UI with one endpoint, or send customers a hosted ... (138) | Connecting accounts | 791 | 21 / 20 | "connect social accounts API" (generic title) | Yes |
| /docs/data-model | Data model \| Siar docs (22) | The objects in the Siar API and how they relate: organization, team, social account, up... (116) | Data model | 382 | 4 / 6 | navigational | Yes |
| /docs/errors | Errors \| Siar docs (18) | One error envelope for every failure, what each status code means, validation issues an... (121) | Errors | 451 | 6 / 18 | "Siar API errors" | Yes |
| /docs/media-uploads | Media uploads \| Siar docs (25) | Upload images, video and documents once and use them in any post: simple, from-URL, lar... (141) | Media uploads | 495 | 4 / 6 | navigational | Yes |
| /docs/pagination | Pagination \| Siar docs (22) | List endpoints use offset and limit and return items with a total. A few endpoints use ... (110) | Pagination | 212 | 3 / 3 | navigational | Yes |
| /docs/posting | Posting and statuses \| Siar docs (32) | Create, schedule, update, retry and delete posts: per-network payloads, first comments,... (122) | Posting and statuses | 1,067 | 7 / 21 | navigational ("posting and statuses") | Yes |
| /docs/quickstart | Quickstart \| Siar docs (22) | From zero to a published post: create an API key, a team, connect an account, upload me... (121) | Quickstart | 831 | 46+site-wide / 9 | "Siar quickstart" | Yes |
| /docs/rate-limits | Rate limits \| Siar docs (23) | Three request windows per API key (per second, per ten seconds, per minute), the header... (127) | Rate limits | 326 | 3 / 5 | "Siar rate limits" | Yes |
| /docs/sdk-cli-mcp | SDK, CLI and MCP \| Siar docs (28) | The TypeScript SDK, the JSON-first CLI and the MCP server: install, authenticate and th... (112) | SDK, CLI and MCP | 490 | 9+site-wide / 4 | "Siar SDK / CLI / MCP" | Yes |
| /docs/webhooks | Webhooks \| Siar docs (20) | Event types, delivery headers, signature verification with Node.js and Python code, ret... (108) | Webhooks | 970 | 9+site-wide / 3 | "Siar webhooks"; overlaps use-case page | Yes |
| /docs/api/analytics | Analytics API \| Siar docs (25) | Post and account metrics, normalised across networks, with the raw network payload kept... (98) | Analytics API | 5,136 | 2 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/api-key | API keys API \| Siar docs (24) | Create, roll and delete organization API keys. A new key is shown once. (71) | API keys API | 276 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/app | Health API \| Siar docs (22) | A health check that needs no key. (33) | Health API | 353 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/auth | Dashboard sessions API \| Siar docs (34) | Sign-up and session endpoints used by the dashboard. Integrations use API keys instead. (87) | Dashboard sessions API | 712 | 1 / 1 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/automation | Automations API \| Siar docs (27) | Flows that react to comments and messages, with executions you can inspect. (75) | Automations API | 40,109 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/billing | Billing API \| Siar docs (23) | Plan, checkout, invoices and X credit top-ups. (46) | Billing API | 1,162 | 1 / 1 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/bio | Bio pages API \| Siar docs (25) | Hosted link-in-bio pages. (25) | Bio pages API | 547 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/bio-analytics | Bio analytics API \| Siar docs (29) | Views and clicks of a bio page. (31) | Bio analytics API | 105 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/bio-item | Bio items API \| Siar docs (25) | Links and blocks on a bio page. (31) | Bio items API | 331 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/bot | Bots API \| Siar docs (20) | Display identities (name and avatar) used when Siar posts to Discord and Slack. (79) | Bots API | 283 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/comment | Comments API \| Siar docs (24) | Publish comments and replies, import the comments people left on your posts and moderat... (94) | Comments API | 6,328 | 2 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/conversation | Conversations API \| Siar docs (29) | Direct-message inboxes for networks that allow it through their API. (68) | Conversations API | 6,236 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/credit | X credit API \| Siar docs (24) | Read the prepaid balance that pays for X API usage and quote an X action before running... (91) | X credit API | 309 | 2 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/misc | Network-specific API \| Siar docs (32) | Operations that exist on one network only: playlists, boards, flairs, music libraries, ... (136) | Network-specific API | 11,414 | 14 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/notification | Notifications API \| Siar docs (29) | In-app notifications for the signed-in user. (44) | Notifications API | 180 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/organization | Organization API \| Siar docs (28) | The organization, its settings, its usage against plan quotas and its activity log. (83) | Organization API | 1,384 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/portal | Hosted portal API \| Siar docs (29) | Endpoints behind the hosted connect page. They authenticate with the portal token in th... (94) | Hosted portal API | 236 | 2 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/post | Posts API \| Siar docs (21) | Create, schedule, update, retry and delete posts. One post targets several networks at ... (121) | Posts API | 16,524 | 3 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/post-csv-import | CSV import API \| Siar docs (26) | Create many posts at once from a CSV file and follow the result row by row. (75) | CSV import API | 730 | 2 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/post-history-import | Post history import API \| Siar docs (35) | Backfill posts that were published outside Siar, optionally with their analytics. (81) | Post history import API | 1,105 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/social-account | Social accounts API \| Siar docs (31) | Connect, disconnect and inspect social accounts; pick channels; create hosted connect l... (111) | Social accounts API | 2,974 | 2 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/team | Teams API \| Siar docs (21) | Teams (social sets) group at most one account per network. Create one team per customer... (107) | Teams API | 1,658 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/upload | Uploads API \| Siar docs (23) | Store media once and reference the upload id from any number of posts. Simple, from-URL... (130) | Uploads API | 1,799 | 1 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/user | Users API \| Siar docs (21) | Your profile, organization members and invitations. (51) | Users API | 1,005 | 1 / 1 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |
| /docs/api/webhook | Webhooks API \| Siar docs (24) | Subscribe an HTTPS endpoint to events, inspect deliveries, resend and rotate the signin... (96) | Webhooks API | 795 | 3 / 0 | navigational ("Siar <area> API") | Yes (one-line summary, then operation table) |

### What the table shows

- **Titles.** Network and error titles are consistent and keyword-led. Hub titles are weak (section 6). Docs titles
  are `"<Topic> | Siar docs"`, which is fine for navigational searches but weak for topic searches ("Webhooks \| Siar docs").
- **Meta descriptions.** All present and unique [measured]. Six docs/api ones are under 50 characters ("Hosted
  link-in-bio pages.", "A health check that needs no key."), so Google will write its own.
- **H1s.** Exactly one per page [measured]. The split-line headlines (`PageHero` and the home/marketing heroes) put two
  `<span class="ln">` lines inside the H1 with no space, so the raw text is "Bluesky APIthrough Siar.", "Write it
  once.Siar it everywhere.", "Your first post isone request away." (the CTA H2 on 42 pages). Google's snippet for
  `/discord-api/errors` reads "Discord API errorsand how to fix them." [measured]. Fix: a real space or `<br>` between
  the line spans in the shared component.
- **Word count.** Home 1,631, pricing 1,888, features 646, use cases 390–530, network pages 640–970, error pages 460–660, Mastodon errors
  203. Thin is not the issue; the issue is that most of the text is generated reference rather than query answers.
- **Answer in the first 60 words.** Home, about, use cases and docs guides answer straight away. Pricing opens with the
  model ("per organization, unlimited accounts") but no price appears in the first 60 words. Network pages open with what can
  be posted, not how. Error pages open with how Siar relays errors, which does not answer the error-code query that
  brings someone there.
- **Internal links.** Network pages and `/docs/quickstart` (46 in-links) are well linked. Weak spots:
  - Each error page has 2 in-links, both from its own network page. No hub links them all.
  - The 25 `/docs/api/*` pages are linked only from `/docs/api` and a few guides. The docs sidebar lists guides, not tags.
  - 4 of 8 use cases (analytics, comments, webhooks, hosted connect) are not in the footer and have 2–4 in-links.
  - `/about` and `/use-cases` have no body in-links (footer only).
  - Use-case pages have 19 outlinks each, mostly a shared "Works with every supported network" list, so they pass little topical weight [inferred].

## 3. Network, error, use-case and docs pages in detail

**Network pages (`/instagram-api` …, 15).** Generated from the same adapter code that validates posts, so the data is
accurate about limits and scopes: post types, an "At a glance" facts table, capability yes/no table, curl sample,
per-network fields, daily caps by plan, scopes, misc operations, X credit prices, FAQPage (5 visible Qs) and
BreadcrumbList [measured]. Weaknesses:
- Head terms like "Instagram API" and "TikTok API" belong to the networks' own developer docs [inferred from the SERP shape].
  Reachable intent is "post to Instagram via API" / "schedule Instagram posts API": Google autocomplete returns "post to
  instagram via api", "publish to instagram via api", "can you post to instagram via api", "post instagram story via
  api" [measured, suggestqueries.google.com 2026-11-12]. No page answers that in its first lines.
- No availability state (see section 7).
- The H1 bug above. The kicker "Networks" plus the network name, then "Bluesky APIthrough Siar.", is the first text a crawler reads.

**Error pages (`/<net>-api/errors`, 15).** 147 network error codes in total, each with "what it means" and "how to fix it". This is
the most useful long-tail asset on the site: autocomplete shows "instagram api error codes", "instagram graph api error
codes", "tiktok api error codes", "tiktok api error 40002" [measured]. Competitors target the same thing:
bundle.social/instagram-api/errors, zernio.com/instagram/errors, postpeer.dev/errors/instagram all rank for Instagram error
queries [measured, WebSearch + DDG, third-party SERPs]. Weaknesses:
- H2s are bare codes ("190", "4", "9004", "2207042"; TikTok's are code strings). The message and plain-English name are not in
  the heading, so a search for "OAuthException 190 error validating access token" has nothing to match.
- No `/errors` hub (bundle.social has one: https://bundle.social/errors, in its sitemap).
- Intro not answer-first. Only 2 in-links each. 5 of 15 confirmed not indexed by Google, 4 confirmed indexed, 6 unknown (section 4).
- Mastodon errors page lists no errors (203 words): thin, and a candidate for noindex until it has content.

**Use cases (`/use-cases/*`, 8).** Good keyword-led titles, answer-first leads, visible FAQ + FAQPage, related links.
Five of them are indexed [measured]. Gaps: agencies, white-label, MCP server and migration (section 5). `/use-cases/hosted-connect-oauth`
targets "hosted social account connect", a phrase with no visible demand; the market term is "social media OAuth API"
(bundle.social's slug is `/social-media-oauth-api`, sourced: https://bundle.social/sitemap.xml checked 2026-11-12) or white-label connect.

**Docs (`/docs/*`, 12) and API reference (`/docs/api/*`, 26).** Strong reference, TechArticle + visible "Updated" date,
breadcrumbs. Only `/docs`, `/docs/api` and `/docs/sdk-cli-mcp` are in Google [measured]. `/docs/api/automation` is
1.27 MB and `/docs/api/post` 0.74 MB of HTML [measured], under Google's 2 MB cap but heavy. Low priority for SEO: these
pages answer navigational queries from people who already chose Siar.

## 4. Indexing and visibility (measured 2026-11-12)

Google `site:` checks were run in a logged-out browser until Google returned HTTP 429 (a CAPTCHA page, which I did not
attempt). `site:` is an approximation, so "not returned" means "not shown", not "proven not indexed". Search Console is still not
verified (`docs/geo/owner-todo.md`), so there is no query data.

| Status | URLs |
|---|---|
| **In Google (32)** | `/`, `/about`, `/pricing`, `/features`, `/platforms`, `/changelog`, `/terms`, `/privacy`, `/use-cases`, `/use-cases/{social-media-posting-api, social-media-scheduling-api, multi-tenant-social-media-api, social-media-api-for-ai-agents, hosted-connect-oauth}`, `/docs`, `/docs/api`, `/docs/sdk-cli-mcp`, network pages for instagram, tiktok, facebook, linkedin, pinterest, bluesky, threads, youtube, x, snapchat, google-business-profile, errors pages for discord, instagram, threads, slack |
| **Not returned (43)** | all 10 other docs guides incl. `/docs/quickstart`, `/docs/webhooks`, `/docs/posting`; all 25 `/docs/api/*` tags; `/use-cases/{social-media-analytics-api, social-media-comments-api, social-media-webhooks}`; errors pages for tiktok, facebook, linkedin, pinterest, bluesky |
| **Unknown (14, rate-limited)** | `/reddit-api`, `/mastodon-api`, `/discord-api`, `/slack-api` and the errors pages of reddit, mastodon, snapchat, x, youtube, google-business-profile; `/contact`, `/refunds`, `/delivery`, `/data-deletion` |
| **Dashboard in Google (3)** | `app.siaran.my/` ("Sign in · Siar"), `/signup`, `/forgot-password` |

Other measured facts:
- Google's snippet for `/docs/api` still says "265 in version 1.0.0" (live page: 270). `docs/geo/facts.md` and the
  research brief say 263. The operation count needs one source of truth, generated (`facts.md` is stale).
- **app.siaran.my** has no `robots.txt` (the SPA returns `index.html` with `text/html` for `/robots.txt`), no `noindex`,
  and the title is just "Siar". Same for api.siaran.my/robots.txt. Fix: send `X-Robots-Tag: noindex` on app. (except
  perhaps `/signup`), and serve a real robots.txt on app. and api.
- **Bing:** `site:siaran.my` returns unrelated results (Bing falls back when a site has almost nothing indexed);
  `"siaran.my"` returns `/` and `/pricing` [measured]. DuckDuckGo `site:siaran.my` returns 9 URLs (/, /pricing,
  /use-cases, two use cases, /x-api, /facebook-api, /google-business-profile-api, /terms). Bing feeds ChatGPT search
  and Copilot, so Bing Webmaster verification + IndexNow re-run is the cheapest lever [inferred; IndexNow was sent 2026-10-13].
- **Copilot (Bing) answer for "Siar social media API"** cites ffdev.studio/projects/siar and siaran.my, gets the product
  right, and gets pricing wrong ("RM399/month for up to 240 connected accounts"). The "240" comes from the home
  calculator's static default: `apps/site/src/components/home/PriceCalc.astro` lines 10–23 render brands=40, networks=6,
  accounts=240, "RM99 Pro" in HTML. Pro allows 10 brands, so that pairing is also wrong before JavaScript corrects it.
  Fix: compute the server-rendered output with the same plan function (40 brands → Business), or pick a default
  that fits Pro (for example 8 brands × 5 networks), and caption the number as "your accounts in this example".
- **Brand-name collisions** in results: SiAR (Spanish irrigation agency API, servicio.mapa.gob.es) outranks Siar for
  "siar api"; siar.my is a Malaysian film-streaming service ("SIAR" on Facebook, Unifi TV) [measured]. Always pair
  the name with "social media API" in titles and off-site mentions.
- Wave-0 AI-visibility sheet `docs/geo/visibility/manual-2026-10-13/manual.csv` is still empty (200 rows, no answers) [measured].

Non-branded ranking spot-checks (top 10, 2026-11-12) [measured]:

| Query | Engine | siaran.my? | Who ranks (top 3) |
|---|---|---|---|
| multi-tenant social media api | Bing, DDG | no | bundle.social/multi-tenant-social-media-api, bundle.social/blog/…, social-api.ai/blog/… |
| social media api for ai agents | Bing, DDG | no | social-api.ai, social-api.ai/solutions/…, postproxy.dev |
| social media api malaysia | Bing | no | muapi.ai, developer.data.gov.my, WhatsApp-API resellers (no real competitor) |
| bundle.social alternative | Bing | no | bundle.social/alternatives, alternativeto.net, g2.com |
| hosted connect social accounts oauth api | Bing | no | bundle.social/social-media-oauth-api, docs.social-api.ai, crevio.co |
| instagram api errors how to fix | DDG | no | upgrow.com, instagrapi.com, postpeer.dev/errors/instagram |
| x api 402 CreditsDepleted | DDG | no | opentweet.io, note.com, x.com |
| bluesky api post schedule | DDG | no | bsky.app, postfa.st (2) |
| social media api unlimited accounts per organization | DDG | no | bundle.social, bundle.social/social-media-api, publishlyapi.com |
| siar api | DDG | **#3 `/`, #4 `/use-cases/social-media-api-for-ai-agents`** | servicio.mapa.gob.es (SiAR) |
| Siar social media API | Bing | **#2 `/`, #3 `/use-cases/social-media-posting-api`** | #1 ffdev.studio/projects/siar |

Google non-branded checks could not be run (429).

## 5. Missing page types

Reference for what a direct competitor targets: bundle.social's own sitemap, https://bundle.social/sitemap.xml, checked
2026-11-12 [sourced]: 291 URLs, of which 100 `/blog`, 32 `/tools`, 17 `/templates`, 22 `/<brand>-alternative` pages plus
`/alternatives`, 15 `/<net>-api` and 14 `/<net>-api/errors` pages, and an `/errors` hub. Siar's network and errors URLs use the same slugs
(`/instagram-api`, `/instagram-api/errors`, `/multi-tenant-social-media-api` vs Siar's
`/use-cases/multi-tenant-social-media-api`), so Siar competes slug for slug with a site that has had months longer to build authority [inferred].

Demand evidence is Google autocomplete, measured 2026-11-12 via suggestqueries.google.com; volumes are not known.

| Missing page | Evidence of demand | Siar has the substance? | Priority [inferred] |
|---|---|---|---|
| **Alternatives / compare** (`/compare/ayrshare`, `/alternatives/bundle-social`, `/compare/zernio`, a "best social media APIs" methodology page) | autocomplete: "ayrshare alternatives", "ayrshare alternatives reddit", "ayrshare api alternatives", "bundle.social pricing", "bundle social reviews"; the "bundle.social alternative" SERP is all vendor comparison pages (postlake.dev, upload-post.com, postzen.dev, schedulenchill.com, woopsocial.com, blotato.com, postpeer.dev, zernio.com: third-party, seen via WebSearch/Bing) | Yes: per-organization pricing, unlimited accounts, ringgit, X at cost. Each competitor fact needs its vendor URL + date | High. Ayrshare/Zernio/Late pages can go now; bundle.social pages need the parked naming decision |
| **Migrate from bundle.social** (`/migrate/bundle-social`: change the base URL, same `x-api-key`, same paths) | autocomplete: "bundle social api", "bundle social docs", "bundle social status", "bundle social mcp". Third-party alternative pages note that switching normally needs auth + field rewrites (postlake.dev, postzen.dev; third-party) | Yes, and it is unique: wire compatibility | High once Fakhrul decides; needs legal check (project state: "legal review undecided") |
| **Social media MCP server** (`/mcp` or `/social-media-mcp-server`) and Claude/Cursor how-tos | autocomplete: "social media mcp server", "social media mcp for claude", "social media mcp github", "social media scheduler mcp", "bundle social mcp", "social media apis for agentic workflows". bundle.social has `/social-media-mcp-server`, `/social-media-cli`, `/claude-code-social-media`, `/cursor-social-media` (sitemap, sourced) | Yes: MCP server, JSON CLI (`/docs/sdk-cli-mcp`) | High. The AI-agents use case exists, but no page targets "MCP server" in its title |
| **Errors hub** `/errors` + per-error headings | autocomplete "instagram api error codes", "tiktok api error codes", "tiktok api error 40002" | Yes: 147 codes already written | High, cheap (template change) |
| **How-to guides per network** ("How to post to Instagram via API", "…TikTok", "…LinkedIn company page", "…YouTube Shorts") | autocomplete "post to instagram via api", "upload to instagram via api", "post instagram story via api", "post to twitter via api" | Yes for live networks; avoid networks that are not approved yet | Medium-high; could be a section at the top of each network page rather than new URLs |
| **Agencies** (`/use-cases/social-media-api-for-agencies`, plus a dashboard angle) | no autocomplete for "social media api for agencies" (inferred low API demand); fanout.digital/blog/social-media-api-for-agencies ranks for the multi-tenant query; GEO prompt p005 | Yes: brands = teams, per-org pricing, hosted connect, client inbox | Medium |
| **White-label connect / OAuth** (retitle hosted-connect page, or `/white-label-social-media-api`) | bundle.social has `/white-label-social-media-api` and `/social-media-oauth-api` (sourced); GEO prompts p016, p017 | Yes: hosted portal with logo/name/redirect | Medium (retitle first) |
| **Malaysia** (ringgit, FPX/DuitNow, local invoice) | autocomplete empty for "social media api malaysia" and "social media scheduler malaysia"; Bing SERP has no real competitor [measured] | Yes: MYR prices, FPX/DuitNow yearly | Low for the API; possibly medium for the dashboard (SME scheduler) in BM. Validate in GSC before building |
| **Feature APIs** with live substance: first comment, bulk/CSV posting, post history import, DMs/inbox (Meta approved incl. messaging), auto-reply automations, media upload, link-in-bio | bundle.social has a page for each (`/schedule-first-comment-api`, `/bulk-social-media-posting-api`, `/social-media-post-history-api`, `/social-media-dm-api`, `/instagram-dm-api`, `/social-media-auto-reply-api`, `/media-upload-api`; sourced) | Yes (docs/api tags: post-csv-import, post-history-import, conversation, automation, upload, bio) | Medium; one use-case page per feature |
| **Pricing explainer** ("how much does a social media API cost", per-account vs per-organization) | already in `docs/geo/plan.md` P3; autocomplete "social media api free", "bundle.social pricing" | Yes | Medium |
| Blog / tools / n8n-Zapier templates | bundle.social has 100 + 32 + 17 (sourced) | Integrations not built as far as I can see | Out of scope until there is something real to show |

Not recommended: ads-API pages (Siar has no ads endpoints), Reddit/Snapchat/Google Business "how to" pages while those networks are parked.

## 6. Weak titles

| Page | Now | Problem | Direction (draft, owner to approve) |
|---|---|---|---|
| `/` | Siar \| Write it once. Siar it everywhere. | no category keyword; SiAR/siar.my collide on the name | "Siar: unified social media API for 15 networks" (the slogan stays as the visual H1) |
| `/features` | Product tour \| Siar | "product tour" has no demand | target the dashboard buyer: "Social media scheduler and inbox dashboard \| Siar" |
| `/platforms` | Supported platforms \| Siar | generic | "Social media API: 15 supported networks compared \| Siar" |
| `/use-cases` | Use cases \| Siar | generic | "What you can build with a social media API \| Siar" |
| `/use-cases/hosted-connect-oauth` | Hosted social account connect \| Siar | low-demand phrasing | "Social media OAuth API: white-label connect link \| Siar" |
| `/docs` | Documentation \| Siar docs | | "Siar API docs: social media API quickstart and guides" |
| `/docs/webhooks`, `/docs/errors`, `/docs/posting`, `/docs/connecting-accounts` | "Webhooks \| Siar docs" etc. | no "social media"/"API" context, overlaps use cases | "Webhook signatures and retries \| Siar API docs" style |
| `/changelog` | Changelog \| Siar | fine, low value | "Siar API changelog" |
| Error pages | "<Net> API errors and how to fix them" | good title; headings are the weak part | keep; add codes to H2s |

## 7. Content accuracy that affects SEO and trust

Status from `docs/approvals/README.md` (checked 2026-11-12) against what the live pages say [measured]:

| Network | Approval state | What the site says |
|---|---|---|
| Reddit, Snapchat, Google Business Profile | parked, "Opening soon" in the dashboard | full pages: "Publish and schedule Reddit posts through one REST API" |
| TikTok | audit rejected 2026-10-20, sandbox only | full posting page; its own errors page lists `unaudited_client_can_only_post_to_private_accounts` |
| YouTube | OAuth verified; API audit pending | full page |
| Pinterest | trial access; publishing needs Standard | full page |
| LinkedIn | personal posting live; company pages (Community Management) denied | "Posts to a LinkedIn member profile or a company page" |
| Meta (FB, IG, Threads), X, Discord, Slack, Bluesky, Mastodon | live | accurate |

Keep the pages indexed, since they target real queries, but add a generated status line ("Live", "Waiting for <network>'s
approval", "Opening soon") from the same source the dashboard uses (the GET `/api/v1/` health network list). Otherwise
AI engines will repeat "15 networks" as fact, and sign-ups for parked networks will hit "Opening soon" [inferred].

## 8. Cannibalisation

| Topic | Competing URLs | Verdict [inferred] |
|---|---|---|
| Webhooks | `/use-cases/social-media-webhooks` · `/docs/webhooks` · `/docs/api/webhook` | Different intents (commercial / guide / reference) but titles do not show it; only `/docs/webhooks` is in the footer. Make the use case the "social media webhooks" target and title the docs pages as how-to/reference |
| Analytics | `/use-cases/social-media-analytics-api` · `/docs/api/analytics` | same; the use case is not indexed yet, the reference page is 5k words |
| Comments / inbox | `/use-cases/social-media-comments-api` · `/docs/api/comment` · `/docs/api/conversation` | same; no page targets "DM API" |
| Connect / OAuth | `/use-cases/hosted-connect-oauth` · `/docs/connecting-accounts` · `/docs/api/portal` · `/docs/api/social-account` | retitle the use case (section 6) |
| Posting vs scheduling | `/use-cases/social-media-posting-api` · `/use-cases/social-media-scheduling-api` · `/docs/posting` · `/docs/api/post` · home | the two use cases are distinct enough; home must own "unified social media API", not "posting API" |
| AI agents / MCP | `/use-cases/social-media-api-for-ai-agents` · `/docs/sdk-cli-mcp` | fine now; an MCP page would sit between them, so give it the "MCP server" keyword only |
| Product overview | `/` · `/features` · `/platforms` · `/about` | `/about`'s title "About Siar, the unified social media API" competes with home for the same phrase; make home own it and keep `/about` on the company |
| Errors | `/docs/errors` (Siar envelope) · 15 network errors pages | distinct; a `/errors` hub must not reuse "API errors" wording that collides with `/docs/errors` |

## 9. Technical leftovers (re-measured)

- Cloudflare Email Obfuscation still on: `/cdn-cgi/l/email-protection` links in every footer [measured]. Owner item in `docs/geo/owner-todo.md`.
- No `Strict-Transport-Security` header on https://siaran.my/ [measured]. Owner item.
- `/pricing.md` is served as `application/octet-stream`, so browsers download it and some fetchers skip it. Use
  `text/markdown; charset=utf-8` (or `text/plain`) [measured].
- Trailing-slash and `/index.html` variants return 200 (`/pricing/`, `/instagram-api/`, `/index.html`); canonical tags
  cover them, but a 301 to the slashless URL is cleaner [measured].
- Home canonical is `https://siaran.my` while the sitemap lists `https://siaran.my/` (harmless; Google treats them as one) [measured].
- Google Search Console and Bing Webmaster Tools are still unverified, so there is no query data; that blocks section 4 from being exact.

## 10. Order of work (proposal)

1. Fix the H1/H2 line-join space and the calculator default (one component each). Re-run IndexNow.
2. Network status line on network pages and `/platforms`; correct the LinkedIn company-page claim.
3. Home title; retitle `/features`, `/platforms`, `/use-cases`, hosted-connect.
4. Error pages: code + message in H2s, answer-first intro, `/errors` hub, footer link to the hub; noindex Mastodon errors until it has entries.
5. noindex on app.siaran.my; robots.txt on app. and api.; `pricing.md` content type.
6. New pages in this order: MCP server page → Ayrshare/Zernio/Late compare pages (vendor-sourced, dated) → agencies →
   white-label/OAuth → feature-API use cases. bundle.social alternative + migration pages only after Fakhrul's naming/legal call.
7. Owner: verify GSC + BWT (unblocks real query data), fill wave-0 sheet.

## Sources

- Live site: https://siaran.my/sitemap-0.xml and all 89 URLs, robots.txt, llms.txt, pricing.md (fetched 2026-11-12)
- Source: `apps/site/src/pages/[api]/index.astro`, `apps/site/src/lib/usecases.ts`, `apps/site/src/components/home/PriceCalc.astro`, `docs/approvals/README.md`, `docs/geo/*`
- Google `site:` result pages (logged-out browser, 2026-11-12, stopped at HTTP 429); Bing and DuckDuckGo result pages (2026-11-12)
- Google autocomplete: https://suggestqueries.google.com/complete/search?client=firefox (2026-11-12)
- bundle.social sitemap: https://bundle.social/sitemap.xml (checked 2026-11-12) [vendor's own page]
- Third-party SERP entries named above (postlake.dev, upload-post.com, postzen.dev, schedulenchill.com, woopsocial.com, postpeer.dev, zernio.com, social-api.ai): seen as search results only, claims not verified
