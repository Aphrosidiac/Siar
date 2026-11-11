# Competitor teardown: Mixpost (mixpost.app)

Verified 2026-11-12: 15 corrections

> Adversarial re-check 2026-11-12: every Mixpost price, limit, plan, network list, page title/H1, release date, docs count, OpenAPI count, webhook detail, GitHub/Docker/Packagist/npm figure, GitHub issue quote and third-party quote below was re-fetched from its source. Fixes: Cloud launch date (unverified), REST API age, UI languages (16, not 17), page titles carry a "| Mixpost" suffix, network-page H2 list, MCP tools (31 in the docs table, 30 on /agents), YouTube private-upload source, sitemap lastmod, docs services breakdown, issue #60 title, "mixpost alternative" vendors and ranking, webhook comparison fairness, TikTok draft wording, directory list, and Upload-Post's "mixpost alternative" page is also API-first (Siar is not the only API angle). **Ranking searches could not be re-run** (the shared WebSearch budget was exhausted), so every "who ranks" statement is now marked unverified; the 8 Google autocomplete queries were re-run and match.

Checked 2026-11-12. Every claim is labelled:

- **measured**: I fetched the page, file or API myself on 2026-11-12 (raw HTML of mixpost.app, its sitemap and robots.txt, docs.mixpost.app pages and sitemap, the OpenAPI file linked from the docs, the GitHub, Docker Hub, Packagist and npm APIs, Google autocomplete).
- **sourced**: from a third-party page, with its URL. Third-party claims are not Mixpost's own and are marked as such.
- **inferred**: my own reading, arithmetic or estimate.

Mixpost facts come only from mixpost.app and docs.mixpost.app. Siar facts come from `docs/seo/research/siar-truth.md`, `docs/pricing.md` and `apps/api/src/domain/plans.ts`. Builds on `docs/geo/brief.md` (Mixpost is on the competitor hypothesis list) and `docs/geo/plan.md` P3 (comparison pages). Sibling teardowns: `upload-post.md`, `bundle-social.md`, `late.md`, `ayrshare.md`.

**Short version.** Mixpost is no longer just "self-hosted, pay once". It now sells two products (when Cloud launched is unverified): a self-hosted Laravel licence (Lite free, Pro $299, Enterprise $1,199, one-time) and **Mixpost Cloud** (Spark $29, Momentum $49, Business $79, Agency $149 a month, priced per workspace and per channel). It has had a REST API and webhooks since v2 (blog, April 2024; the current OpenAPI file has 75 operations) and added an MCP server (Pro v6.0.0, June 2026), OAuth 2.1 and a Go CLI (repo created 2026-09-10). It is a **scheduler you or they host**, not an API platform for embedding social posting in someone else's product. That is where Siar differs.

---

## 1. Who they are

- Operator: **INOVECTOR DIGITAL S.R.L.**, registered in the Republic of Moldova, number 1019600028867; contact ask@inovector.com. (measured: https://mixpost.app/terms-of-use)
- Footer: "Built and backed by Inovector". (measured, home)
- Open-source repo `inovector/mixpost` (this is the Lite edition), created 2022-07-22, MIT licence, **3,927 stars, 590 forks**, last push 2026-03-16. Repo description: "Schedule, publish, and manage your social media content on your server. No subscriptions, no limits. (Buffer alternative)". (measured: https://api.github.com/repos/inovector/mixpost)
- Stack: PHP 8.3+, MySQL, Redis, Nginx/Apache; installed with Docker, by hand, or as a Laravel package. (measured: pricing FAQ, https://docs.mixpost.app/pro/)
- Release cadence: Pro v7.5.0 on 2026-11-09, Enterprise v8.8.0 on 2026-11-10 (several releases a week in Oct–Nov 2026). Lite v2.6.0 on 2026-03-13 and nothing since. (measured: https://mixpost.app/releases/pro, /releases/enterprise, /releases/lite)
- Main angle: **own your social media tool**. Data on your server, one payment, no per-seat or per-account fees. Cloud is now pushed as the default way in. (inferred from home, pricing and cloud pages)

## 2. Positioning and copy

### Home page (measured: https://mixpost.app/, 2026-11-12)

- `<title>`: "Mixpost: Open Source, Self-Hosted Social Media Management"
- Meta description: "Manage & schedule posts across 10+ social networks from your own server. Open-source, privacy-first. Free Lite edition available."
- **H1:** "Open source social media management you own"
- **Subhead:** "Schedule posts, track your analytics, and manage all your social accounts from one place." Then: "Mixpost is open source, self-hosted social media management for agencies, businesses, and creators who want full control of their data."
- Hero CTAs: **"Start free trial"** (goes to https://cloud.mixpost.app/start, the Cloud subscription) and **"Self-host it"**. Line under them: "Start growing your social accounts in minutes, or self-host it on your own server."
- Rotating stat counter (an Alpine.js array that cycles every 2 s): "1,000+ Businesses Worldwide", "40+ Countries", "x2 More Affordable".
- Section headings in page order (H2, with H3s):
  - "Why choose self-hosted social media management?" ("Your data, your servers", "Extend & modify freely", "Scale without limits", "Deploy in minutes", "Agencies & enterprises"). Body: "No monthly subscriptions, no artificial limits, no vendor lock-in. Your data stays on your servers, forever."
  - "Built for power users who demand control" (screenshot tabs: Home Dashboard, Compose Post, AI Compose Post, Monthly/Weekly Calendar, Queue, Posts overview, Media Library, Analytics, Engagement, Connected Accounts, Templates; CTAs "See it with your own accounts", "See self-hosted pricing")
  - "Multi-Platform Support" ("12 supported platforms", "Unlimited accounts per platform", "More coming soon")
  - "Powerful features that are easy to use" ("Scheduling", "Analytics", "Engagement", "Teams")
  - "Experience Mixpost in your native language" (16 languages listed, from English and Arabic to Basque and Slovak)
  - "Easily publish content to all of your social media accounts with just one click" ("Customize posts", "Preview post", "Post versions", "Hashtag groups")
  - "Embrace video as a key part of your content strategy" ("Higher engagement", "Better retention")
  - Closing: "Own your social media, your way". Subtext: "Start free on Mixpost Cloud, or self-host with a one-time license for unlimited accounts and full control of your data." CTAs "Start free trial", "Buy self-hosted license". Fine print: "7-day free trial on Cloud, or self-host with a one-time payment and no monthly fees."

### Proof they use (measured; all are Mixpost's own claims, none independently verified)

| Proof | Where |
|---|---|
| "1,000+ Businesses Worldwide", "40+ Countries", "x2 More Affordable" (no basis given for "x2") | home stat counter |
| "1,000+ Businesses Trust Us" | /pricing |
| "The same tools used by thousands of businesses" | /cloud |
| "used by thousands" | /career meta description |
| Docker, Composer, Laravel package; "Regular Updates: new features monthly"; public changelogs | home, /pricing, /releases/* |
| Open-source repo on GitHub | footer link |

No customer logos, no named testimonials, no case studies, no review badges, no ratings, no review schema. JSON-LD on home is only `Organization`, `WebSite`, `WebPage`. (measured)

### Main landing pages: `<title>` and H1 (measured 2026-11-12; /pricing and /cloud titles have no "| Mixpost" suffix, the others do)

| URL | `<title>` | H1 | Hero CTA |
|---|---|---|---|
| /pricing | "Mixpost Pricing: One-Time Payment, No Monthly Fees" | "Mixpost Pricing" | "Deploy now" (Lite), "Buy now" (Pro, Enterprise), "See Cloud plans" |
| /cloud | "Mixpost Cloud: Hosted Social Media Management" | "All your social media, scheduled and managed in one place" | "Start free trial", "See plans" |
| /features | "30+ Features: AI, Analytics, Scheduling & More \| Mixpost" | "Complete Social Media Management for Teams and Creators" | "Start free trial", "See self-hosted pricing" |
| /agents | "AI Agents for Social Media: Claude, ChatGPT & MCP \| Mixpost" | "Put AI agents to work on your social media" | "Start free trial", "Connect your agent" |
| /mcp | "MCP Server: Schedule Social Media with Your AI \| Mixpost" | "Control social media with your AI" | "Start free trial", "See how it works" (stats "12 Networks from one assistant", "1 min To connect your assistant") |
| /social-media-automation | "Social Media Automation Software, Self-Hosted \| Mixpost" | "Social media automation on your own terms" | "Start free trial", "See self-hosted pricing" |
| /instagram (template used by all 12 network pages) | "Instagram Scheduler: Reels, Stories & Posts \| Mixpost" | "Schedule and publish to Instagram" | "Start scheduling Instagram, free", "See self-hosted pricing" |
| /x | "X Scheduler: Schedule Posts & Threads \| Mixpost" | "Schedule and publish to X" | "Start scheduling X, free" |
| /tools/social-media-image-resizer | "Free Social Media Image Resizer for All Platforms \| Mixpost" | "Free social media image resizer" | "You resized it. Now let Mixpost post it." |

Subheads quoted:
- /cloud: "The simple way to schedule posts, track your analytics, and manage every social account from one dashboard. It runs entirely in the cloud, so you can start in minutes with nothing to install. Built on Mixpost, the popular open source social media tool." Under it: "Your data is stored on secure servers in Germany with daily backups. No long-term contracts."
- /agents: "Connect Claude, ChatGPT, Cursor, Codex, n8n, or any agent to Mixpost. It drafts, schedules, and reports on posts across every network, and you approve what goes out."
- /mcp: "Connect Claude and other AI assistants to Mixpost through MCP. Draft, schedule, and publish across every network just by chatting."
- /social-media-automation: "Schedule once and let Mixpost publish for you. Build posting queues, automate approval workflows, and connect your own tools, all from one dashboard."

Every network page uses the same H2 skeleton: "The complete <Network> scheduler", "Built-in <Network> analytics", "Connect your <Network> account in about two minutes", "One tool for every network", "Multi-Platform Support", "<Network> scheduling FAQ", "Start scheduling your <Network> content". (measured on /instagram; /x shares the template)

### Messages they repeat (inferred from the pages above)

1. You own it: your server, your data, source code included.
2. Pay once: "No monthly fees, no per-user charges" (self-hosted only).
3. Unlimited accounts and team members (self-hosted only; Cloud is capped).
4. Agencies and multi-brand teams: workspaces, approvals, client review.
5. New in 2026: AI assistant, MCP server, AI agents.
6. Cloud as the easy door: nearly every CTA on the site now goes to the Cloud trial first, self-hosting second.

## 3. Pricing (sourced: https://mixpost.app/pricing and https://mixpost.app/cloud, checked 2026-11-12)

### Self-hosted licence (https://mixpost.app/pricing, checked 2026-11-12)

| | Lite | Pro | Enterprise |
|---|---|---|---|
| Price | Free (MIT, GitHub) | **$299 one-time** | **$1,199 one-time** |
| Pitched at | "For individuals who need essential social media management." | "Perfect for teams and agencies to manage social media and collaborate efficiently." | "Ideal for launching a SaaS business and managing customer subscriptions seamlessly." |
| Domains | | 1 domain or subdomain | 1 domain or subdomain |
| Updates | "Lifetime access to updates" | 1 year free updates | 1 year free updates |
| Support | Community | Standard | Standard |
| Networks | Facebook Pages, X, Mastodon | All 12 | All 12 |
| Features | Basic analytics, calendar, media library, post versions, post labels | Everything in Lite + multi-tenant workspaces, "White Label Basic" (replace the Mixpost logo), advanced analytics, Engagement Inbox, AI Assistant, queue, approval flow, first comment and threads, variables, hashtag manager, templates, multilingual, post activity, **API, MCP, Webhooks** | Everything in Pro + "White Label Branding" (logo and theme colours), subscription management, customer dashboard, automated billing and invoicing, coupons |
| Accounts / users | | Unlimited social accounts, unlimited team members, unlimited workspaces | same |

Other terms on the page (measured):
- "All prices exclude the legal value-added tax (VAT)."
- **Perpetual fallback licence**: you keep the version you bought if you do not renew. After year one, renewal is "optional"; **the renewal price is not stated** on the pricing page or the docs I read (unverified).
- 14-day money-back guarantee on Pro and Enterprise.
- Non-profits and NGOs: 30% off Pro.
- Licence restrictions: paid code is "source-available"; "You may not resell or redistribute the code, and building a SaaS requires an Enterprise license, not Pro."
- A paid installation service exists; no price shown. (measured: https://docs.mixpost.app/pro/)

Hidden costs of the self-hosted route (from Mixpost's own docs, measured):
- You register and get approved your **own developer app on every network** (Meta App Review, TikTok Direct Post audit, LinkedIn Community Management API, YouTube quota). Their docs say this "can take weeks per network and has to be maintained as their policies change". (https://docs.mixpost.app/cloud/vs-self-hosted)
- **X**: you open your own pay-as-you-go X developer account and pay X directly; Mixpost adds settings to cap what it spends. (https://docs.mixpost.app/services/social/x/)
- AI: bring your own provider key (OpenAI, Anthropic, Gemini, Mistral, Groq, DeepSeek, xAI, OpenRouter, Ollama). (docs sitemap, /services/ai/*)
- Hosting, backups, queue workers, PHP security patches. (inferred; see issue #214 in section 6)

### Mixpost Cloud (https://mixpost.app/cloud, checked 2026-11-12)

| | Spark | Momentum | Business | Agency |
|---|---|---|---|---|
| Monthly | $29 | $49 | $79 | $149 |
| Yearly | $249 ($20.75/mo) | $419 ($34.92/mo) | $679 ($56.58/mo) | $1,299 ($108.25/mo) |
| Pitched at | "For solo creators getting started." | "For anyone building with API, MCP, and webhooks." | "For local businesses and SMBs." ("Best value") | "For agencies managing many clients." |
| Team members | 1 | 1 | 5 | Unlimited |
| Social channels | "Manage 1 brand" (tooltip: "Maximum 1 channel per supported network.") | 24 | 48 | 180 |
| Scheduled posts | 100 | 500 | 1,000 | 5,000 |
| AI credits / month | 1,300 | 2,300 | 3,800 | 7,300 |
| API, MCP, webhooks | **No** | Yes | Yes | Yes |
| Engagement Inbox | No | No | "Coming soon" | "Coming soon" |
| Client Portal | No | No | No | "Coming soon" |

Terms (measured: /cloud and https://docs.mixpost.app/cloud/plans, /cloud/billing, /terms-of-use):
- **No free plan.** A 7-day trial on every plan, **card required**. Paid fees are non-refundable except where law requires.
- "Each connected social account counts as one channel" (tooltip). So Cloud is **priced per channel**, unlike the self-hosted licence.
- **Per workspace**: "A subscription belongs to a workspace… each workspace you create carries its own subscription." An agency that keeps each client in its own workspace pays once per client. (docs /cloud/billing)
- "Scheduled posts" is a **standing count** (posts waiting on the calendar at one time), not a monthly quota. Drafts and published posts do not count. (docs /cloud/plans)
- No overage billing: hitting a limit blocks the next action, and the API returns `422` with a `limit` object. (docs /cloud/plans)
- AI credits: "An AI-written post uses about 1 credit, an AI image about 40." (tooltip)
- "Yearly saves up to 28%"; VAT excluded; data on servers in Germany with daily backups; "provided without an uptime guarantee" (terms Part III §6).
- NGOs: 30% off Spark, Momentum and Business.
- The docs page still names the plans "Dreamer, Hacker, Business and Agency", which does not match the pricing page (measured, stale docs).

### Mixpost vs Siar on price (inferred arithmetic; Siar USD list prices from `docs/pricing.md`)

| Need | Mixpost | Siar |
|---|---|---|
| Try it free | Lite (3 networks, self-hosted) or a 7-day Cloud trial with a card | 20 free posts to try, no card, unlimited social accounts |
| Hosted, with the API | Momentum $49/mo: 1 user, 24 channels, 500 posts queued at once | Starter $19/mo: 1 brand, 300 posts/month, unlimited accounts. Pro $49/mo: 10 brands, 10,000 posts/month, unlimited accounts |
| 10 clients, hosted | 10 workspaces, each with its own subscription (inferred from the billing docs), or one Agency workspace at $149 capped at 180 channels | Pro $49/mo covers 10 brands |
| Own the server | Pro $299 once + hosting + your own network apps + X billed by X | Not offered. Siar is hosted only |
| X | Self-host: your own X pay-as-you-go account. Cloud: see the X contradiction in section 6 | Passed through at X's own USD prices from a prepaid credit, no markup |
| Currency | USD, VAT excluded | Ringgit for Malaysian organizations (FPX or DuitNow for yearly), USD elsewhere; price lock |

The units differ: Mixpost counts *queued* posts and *channels*; Siar counts posts *per month* and never counts accounts. A fair comparison page must say so.

## 4. Networks and API features

### Networks (measured: home, /pricing FAQ, /cloud, network pages)

| Edition | Networks |
|---|---|
| Lite (free) | Facebook Pages, X, Mastodon |
| Pro / Enterprise (self-hosted) | Facebook Pages, Instagram (posts, reels, stories), X, LinkedIn (profiles and company pages), YouTube (videos and Shorts), TikTok, Pinterest, Threads, Bluesky, Mastodon, Pixelfed, Google Business Profile = **12** |
| Cloud | "11 platforms": the Pro list **without X** |

Not supported anywhere on the site (measured: none named): **Discord, Slack, Reddit, Snapchat, Telegram, WhatsApp**. Home says "More coming soon" with no list.

On self-hosted Pro, "supports TikTok / LinkedIn company pages / YouTube" means the code can do it once *you* pass each network's review. TikTok: Mixpost's docs say TikTok uploads go up as drafts by default and auto-publishing needs the Direct Post option, with a separate guide for passing TikTok's Direct Post audit (measured: https://docs.mixpost.app/services/social/tik-tok/direct-post-audit). YouTube: the Mixpost docs I read (/services/social/google/youtube, /youtube-quota, /troubleshooting) do **not** mention private-locked uploads; that comes from issue #75 ("Youtube Post Being 'locked as private'", section 6) and from Google's own rule for unaudited API projects (inferred to apply, same as Siar today).

### API, MCP, webhooks, CLI (measured from docs.mixpost.app and the OpenAPI file)

| Feature | What Mixpost has |
|---|---|
| REST API | OpenAPI **3.1.0**, "Mixpost API" v1.0.0, **75 operations on 42 paths**. 43 are for any Pro workspace (ping, workspaces, accounts, posts, media incl. chunked and URL upload, tags, mentions, analytics, best times); **32 are Enterprise-only** (workspaces, users, subscriptions, receipts under `/panel/*`). File: https://docs.mixpost.app/assets/files/mixpost-2835c6937c8fde2142b94e940790a14c.yaml |
| Connecting social accounts by API | **None.** `accounts` has only `GET` list and `GET` one. There is no endpoint to start a network connection and no hosted connect link for an end customer. Accounts are connected in the Mixpost dashboard |
| Comments / inbox by API | **None** in the OpenAPI file. The Engagement Inbox (mentions and comments, reply and like) is dashboard-only and Pro/Enterprise-only; Cloud lists it as "Coming soon". DMs are not mentioned anywhere I read (inferred: not offered) |
| Analytics by API | Summary, per account, per post, best posting times |
| Auth | Personal key as `Authorization: Bearer`. "Personal keys have no scopes": a key carries the full authority of the user who made it. Expiry 7 days to never |
| OAuth 2.1 | Each instance is its own OAuth 2.1 server (PKCE, dynamic client registration, client ID metadata documents) so ChatGPT, Claude or your own app can sign in **as a Mixpost user**. This is login to Mixpost, not a white-label way for your customers to connect their social accounts |
| MCP server | Built in since Pro v6.0.0 (2026-06-25). Streamable HTTP at `/mcp`. **31 tools** in the docs' "Tools at a glance" table (https://docs.mixpost.app/mcp/tools; the /agents page says "See all 30 tools"): workspaces, accounts, posts and versions, schedule/queue, tags, mentions, media, analytics, best times. OAuth or personal key |
| Webhooks | Per workspace, admin-only. **8 events**: `post.scheduled`, `post.published`, `post.published_all`, `post.publishing_failed`, `post.deleted`, `account.added`, `account.updated`, `account.deleted`. Optional HMAC-SHA256 `X-Signature` (secret is optional). **Max 3 attempts**: retries after 2 and 4 minutes. Delivery log, resend, test |
| CLI | Go binary `mixpost` via Homebrew (`inovector/tap/mixpost`), Scoop, `go install`, Docker. JSON output when piped. Repo `inovector/mixpost-cli`: 0 stars, created 2026-09-10 |
| SDKs | None found. They point to the OpenAPI file "to import into Postman, Insomnia, or generate a client" |
| Automation | n8n community node `n8n-nodes-mixpost` (293 npm downloads 2026-10-12 to 2026-11-10); ClawHub/OpenClaw skill (blog, 2026-02-03) |
| White-label | Pro: replace the logo. Enterprise: logo, theme colours, subscriptions and billing through Stripe, Paddle or Paystack, so you can **resell Mixpost as your own SaaS** |
| Other | SSO (OIDC: Authentik, Keycloak, Okta), 2FA, 16 UI languages (home), AI assistant and image generation, URL shorteners (Bitly, Shlink, YOURLS), media from Giphy, Pexels, Tenor, Adobe Express |

### Against Siar (Siar column from `siar-truth.md`; claim only what is listed there)

| | Mixpost | Siar |
|---|---|---|
| Product shape | Scheduler app you host, or rent per workspace | Hosted REST API; the dashboard is a client of the same API |
| API size | 75 operations (43 outside Enterprise) | 270 operations in `/openapi.json` (OpenAPI 3.0) |
| Connect accounts for your customers | No API, no hosted link | Hosted connect link with your name, logo and colour (on app.siaran.my, "Powered by Siar"; branded, not white-label) |
| Comments by API | No | Publish, import, reply, like/hide/delete where the network allows |
| Webhooks | 8 events, 3 attempts over ~6 minutes, secret optional; also has a delivery log, resend, test and "Change secret" | 16 HMAC-signed events, retried over about 45 hours, delivery log, resend, secret rotation |
| Errors | Per-account `errors` on the post payload (measured: OpenAPI `PostAccount` schema) | Network's own code and message kept verbatim, plus a plain-English fix and a public error page per network |
| MCP / CLI / SDK | MCP (31 tools in the docs), CLI on Homebrew, no SDK | MCP (19 tools), CLI and TypeScript SDK built, **not on npm yet** (Mixpost is ahead here) |
| Network apps | Self-host: yours to get approved. Cloud: theirs | Siar's own, for the networks open today |
| Open today | Pro: 12 claimed (self-host needs your approvals); Cloud: 11, no X | Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack. YouTube uploads stay private until YouTube's audit. TikTok, Pinterest publishing, LinkedIn pages, Reddit, Snapchat, Google Business Profile built, opening as each network approves |
| Discord, Slack | No | Yes |
| Pixelfed, Google Business Profile, TikTok, LinkedIn pages | Yes (self-host, with your approvals) | Pixelfed no; the others not open yet |
| AI assistant, approvals, 16 UI languages, SSO | Yes | Not claimable in `siar-truth.md`; do not compare on these |

## 5. SEO footprint

### Size (measured: https://mixpost.app/sitemap.xml, one file, `lastmod` only on the 25 blog posts; https://docs.mixpost.app/sitemap.xml)

mixpost.app: **54 unique URLs**.

| Type | Count | URLs |
|---|---|---|
| Home | 1 | / |
| Product pages | 6 | /features, /cloud, /pricing, /mcp, /agents, /social-media-automation |
| Per-network "scheduler" pages | 12 | /facebook, /instagram, /x, /linkedin, /threads, /youtube, /tiktok, /pinterest, /mastodon, /bluesky, /pixelfed, /google-business |
| Blog | 26 | /blog + 25 posts (2024-04 to 2026-06; newest by publish date: 2026-06-20) |
| Changelogs | 3 | /releases/lite, /pro, /enterprise |
| Free tools | 2 | /tools/social-media-image-resizer, /tools/encryption-key-generator (APP_KEY for installs) |
| Company / legal | 4 | /career, /brand-guidelines, /privacy-policy, /terms-of-use |

docs.mixpost.app: **213 URLs**: 89 API reference, 52 "services" (25 social-network pages covering setup, app review and troubleshooting; 11 AI pages covering 9 providers; payment, SSO, URL shorteners, media), 22 Enterprise, 14 Pro, 8 Lite, 5 CLI, 4 Cloud, 4 AI assist, 3 MCP, plus guides. Roadmap lives on roadmap.mixpost.app.

What does **not** exist (measured: absent from both sitemaps):
- No `/compare/*`, `*-alternative` or `vs` pages. Comparisons live only inside two blog posts: "Social Media Management Tools Compared (2026)" (H2 "Mixpost vs Buffer vs Hootsuite vs Metricool") and "Best Open Source Social Media Tools 2026: Top 3 Compared" (Mixpost, Postiz, Socioboard, with FAQ "Mixpost vs Postiz: which open source scheduler should I choose?").
- No per-network **API** pages ("Instagram API", "TikTok API"). Network pages target "<network> scheduler", not developers.
- No glossary, no programmatic pages, no error-code pages.
- No `llms.txt` on either host (404). No hreflang, although the app ships in 16 languages.
- JSON-LD: `SoftwareApplication` with an `AggregateOffer` ($29–$149) and `FAQPage` on /cloud; `Organization` (Inovector) and `WebSite` on home.
- Bing Webmaster verification tag present; Matomo analytics self-hosted at analytics.inovector.com.

### Top keyword targets inferred from titles and H1s (inferred)

1. "open source / self-hosted social media management" (home title, H1, blog posts on self-hosted vs SaaS).
2. "<network> scheduler" × 12 (Instagram, X, TikTok, LinkedIn, Facebook, YouTube, Threads, Pinterest, Bluesky, Mastodon, Pixelfed, Google Business).
3. "social media automation software" (/social-media-automation, blog guide updated 2026-10-17).
4. "social media MCP server", "AI agents for social media" (/mcp, /agents).
5. "Mixpost pricing / one-time payment" (/pricing title).
6. Agency workflow terms: "social media approval workflow for clients", "manage multiple social media clients".
7. Long-tail utilities: "social media image resizer", "best times to post on social media 2026".

They do **not** target "social media API", "<network> API", "unified social media API" or "<competitor> alternative". Those are Siar's terms, so overlap on keywords is small (inferred).

### Demand around the brand (measured: Google autocomplete, en-US, 2026-11-12; volumes inferred)

- "mixpost" → mixpost github, **mixpost vs postiz**, mixpost pro, mixpost lite, mixpost open source, **mixpost reddit**, mixpost enterprise, **mixpost mcp**, **mixpost alternative**, mixpost app.
- "mixpost a" → mixpost alternative, mixpost app, **mixpost api**, mixpost alternative open source, mixpost analytics, mixpost ai, mixpost free alternative.
- "mixpost v" → mixpost vs postiz, mixpost vs buffer, mixpost vs postiz reddit, mixpost lite vs pro.
- "mixpost pro" → mixpost pro free, **mixpost pro free download**, mixpost pro github. (inferred: people look for a free or pirated Pro, a sign the $299 entry price is a real barrier for part of the audience)
- "postiz vs" → postiz vs buffer, postiz vs blotato, postiz vs mixpost, postiz vs zernio …
- Generic: "self hosted social media scheduler / manager / management tool / automation / poster", "open source social media scheduler" (Postiz appears in those suggestions, Mixpost does not).

Inferred: a small, developer-and-self-hoster brand with a full set of suggestions, which points to steady low volume (hundreds to low thousands of searches a month, not tens of thousands). "mixpost alternative" and "mixpost vs postiz" are the comparison intents worth noting.

### Who links to them / visibility signals

| Signal | Value |
|---|---|
| GitHub | 3,927 stars, 590 forks (measured). For scale: Postiz `gitroomhq/postiz-app` has 41,381 stars, pushed 2026-11-11 (measured) |
| Docker Hub pulls | `inovector/mixpost` 249,875; `mixpost-pro-team` 150,535; `mixpost-enterprise` 29,764 (measured: https://hub.docker.com/v2/repositories/inovector/) |
| Packagist | `inovector/mixpost` 7,564 installs total, 592 in the last month (measured) |
| awesome-selfhosted | **Not listed**; Postiz is (measured: awesome-selfhosted README) |
| Directories | Confirmed by fetch: OpenAlternative (https://openalternative.co/alternatives/mixpost), selfhost.directory (https://selfhost.directory/project/mixpostapp), BetaList (https://betalist.com/startups/mixpost). AlternativeTo (403), selfhostedworld.com, openapps.pro, SaaSHub, opensourcetools.org: from an earlier search, not re-checked, **unverified** |
| Press (sourced) | GIGAZINE hands-on, 2024-03-09: https://gigazine.net/gsc_news/en/20240309-mixpost |
| Review pages (third party, often written by competitors) | kompozy.io/reviews/mixpost (verified 2026-08-05, Kompozy sells a rival tool), bestsocialmediascheduler.com/reviews/mixpost |
| Competitors' "Mixpost alternative" pages | Confirmed by fetch (200, page targets the term): Postiz, Blotato, FeedHive, socialk.it, BulkPublish, PostNext, Upload-Post (/mixpost-alternative, see `upload-post.md`) = **7 vendors**, plus OpenAlternative (directory). StartupHub, Fulin Labs, noobclaw: named without URL, **unverified**. Where these pages rank: **unverified** (searches not re-run) |
| Product Hunt, G2, Capterra, Trustpilot | Direct fetches returned 403 and searches found no Mixpost listing: **unverified** |
| Social | X @getmixpost, Facebook page and group, Instagram, Threads, LinkedIn showcase, YouTube, Bluesky, Mastodon (phpc.social), Discord (measured: home links) |

## 6. Weaknesses

### Real user complaints (sourced; mostly GitHub issues, because Reddit could not be reached)

Reddit: WebSearch refuses reddit.com and Reddit's JSON and old.reddit endpoints returned 403/302 on 2026-11-12, so **no Reddit thread is quoted here (unverified)**. Autocomplete shows people search "mixpost reddit" and "mixpost vs postiz reddit" (measured), so threads probably exist.

GitHub `inovector/mixpost`: 145 issues in total (measured). The most-discussed themes:

| Theme | Evidence |
|---|---|
| Install and login failures on self-host | #50 "Mixpost Container doesn't work", #56, #60 "Getting 'Internal Server Error 500' after deploying Mixpost via docker compose", #83, #104 "Unable to login after fresh install", #124 "Blank page when logging in": https://github.com/inovector/mixpost/issues/104 |
| Network breakage the self-hoster has to wait out | #197 "Instagram publishing broken" (opened 2026-03-13; users stuck until early May; the maintainer: "It's most likely from Meta"): https://github.com/inovector/mixpost/issues/197 |
| YouTube uploads locked private | #75: a paying user: "also just payed for this and I'm not able to use it"; maintainer: "we cannot help you because the YouTube video processor decides": https://github.com/inovector/mixpost/issues/75 |
| Posts cut short | #169 "Scheduled posts truncated on LinkedIn and X" (fixed in v4 after 5 days): https://github.com/inovector/mixpost/issues/169 |
| Security patching is on you | #214 (2026-10-21): users asked for Docker images patched for two critical PHP CVEs; one user on the arm64 Enterprise image: "No reaction to a mail I sent 24h ago… Quite disappointing"; another: the Lite container "is 7 months old by now". Patched images shipped the next day: https://github.com/inovector/mixpost/issues/214 |
| Docs | #84 "Is there additional documentation available?" (12 comments) |

Third-party reviews (labelled; written by a competitor):
- Kompozy (rival vendor), "last verified 2026-08-05": "You run the infrastructure: server, SSL, queue workers, token reconnections, and upgrades are all on you"; analytics and inbox "lighter than dedicated analytics or social-inbox suites"; "The sticker price isn't the total cost". https://kompozy.io/reviews/mixpost
- Blotato (rival vendor) frames its list as alternatives "When You Stop Self-Hosting". https://www.blotato.com/blog/mixpost-alternatives

### Inconsistencies on their own site (measured 2026-11-12)

1. **Network count**: meta description "10+", home "12 supported platforms", Cloud "11 platforms".
2. **X on Cloud**: /cloud lists 11 platforms without X, and its FAQ names the 11 without X. But /x says "Do I need an X API key? On Mixpost Cloud, no. Just connect your X account", and its "Start scheduling X, free" CTA goes to the Cloud trial. One of the two is wrong (which one is unverified).
3. **"Start free"** CTAs on every page lead to a 7-day trial that needs a card. Cloud has no free plan.
4. **"No monthly subscriptions"** (home) next to a primary CTA for a monthly subscription.
5. Docs name the Cloud plans "Dreamer, Hacker, Business and Agency"; the pricing page says Spark, Momentum, Business, Agency. The same docs page says "Every plan is the full Mixpost Pro feature set", yet /cloud gives Spark no API, MCP or webhooks.
6. "x2 More Affordable" has no stated basis.
7. Lite says "Lifetime access to updates", yet its last release was 2026-03-13 and a user calls its Docker image "7 months old" (#214). The Lite image (tag v2.6.0) was rebuilt with patched PHP on 2026-10-22, but the Lite code itself has not changed since March.

### Gaps Siar can use honestly

1. **Siar is an API to build on; Mixpost is an app to use.** Mixpost's API cannot connect a social account and has no hosted connect link, so a SaaS cannot let its own customers link Instagram through Mixpost. Siar has a branded connect link and 270 operations. (measured both sides)
2. **Comments over the API.** Mixpost has none in its OpenAPI file; its inbox is dashboard-only, and "Coming soon" on Cloud. Siar has comment publish, import and reply endpoints.
3. **Webhooks you can rely on.** Mixpost: 8 events, 3 tries within about 6 minutes, secret optional. Siar: 16 signed events retried over about 45 hours with a delivery log and resend.
4. **No network approvals to chase.** Self-hosted Mixpost needs your own app per network; Mixpost's docs say that can take weeks per network. Siar holds its own approved apps. Say this only for the networks open today.
5. **Pricing that does not count accounts or workspaces.** Mixpost Cloud charges per workspace and caps channels (24/48/180, Spark one per network). Siar charges per organization with unlimited social accounts; Pro covers 10 brands for $49.
6. **X without your own developer account.** Self-hosted Mixpost needs your own X pay-as-you-go account; Cloud's X support is contradictory. Siar passes X through at X's USD prices from a prepaid credit.
7. **Discord and Slack.** Mixpost has neither; both are live on Siar.
8. **Nothing to patch.** Self-hosters patch PHP CVEs and wait for Docker rebuilds (#214). Siar is hosted.
9. **Malaysia.** Ringgit prices, FPX or DuitNow for yearly, a Malaysian company. Mixpost is USD, VAT extra, run from Moldova.
10. **Try before paying.** Siar: 20 free posts to try, no card. Mixpost Cloud: card first.

### Where Siar should not compete (inferred)

- **Data on your own server / source code / one-time price.** Mixpost wins outright. Say so on any comparison page.
- **Network breadth for a self-hoster with approvals**: TikTok, YouTube public uploads, LinkedIn company pages, Pinterest, Google Business Profile, Pixelfed are all closed or missing on Siar today.
- **Agency workflow features** (approvals, client review, AI assistant, 16 UI languages, SSO). None is claimable for Siar in `siar-truth.md`.
- **White-label resale** (Mixpost Enterprise). Siar's connect link is branded, not white-label.
- **CLI install today**: Mixpost's is on Homebrew; Siar's is not on npm yet.

### SEO moves this suggests for Siar (inferred; feeds `docs/geo/plan.md` P3)

1. A `/compare/mixpost` page aimed at "mixpost alternative" and "mixpost api", for the buyer who wanted Mixpost's API: a sourced, dated table (this file's section 4), honest that Mixpost wins on self-hosting. At least 7 vendors publish pages targeting "mixpost alternative" (section 5; where they rank is unverified). Upload-Post's page is also API-first ("Hosted API vs Self-Hosted"), so Siar is not the only API angle; differentiate on the connect link, comments over the API and per-organization pricing.
2. A "self-hosted vs hosted social media API" explainer that counts the hidden costs from Mixpost's own docs: per-network app reviews, X billing, patching. Cite the docs, not opinion.
3. Per-network **API** pages (Siar's network pages) already sit where Mixpost has only "scheduler" pages. Keep them developer-shaped and open with a 40–60 word answer.
4. Do not mirror Mixpost's 12 "<network> scheduler" pages; that is their keyword and not Siar's buyer.

## 7. One line: how Siar should position against Mixpost

**Mixpost is a social media scheduler you install or rent per workspace; Siar is the hosted social media API you build on: your customers connect their own accounts through your branded link, comments and signed webhooks come over the API, and you pay per organization, not per channel or workspace. If you must own the server, Mixpost is the better buy, and Siar should say so.**

---

### Sources (all checked 2026-11-12)

Vendor (measured): https://mixpost.app/ · /pricing · /cloud · /features · /agents · /mcp · /social-media-automation · /x · /instagram · /tiktok · the 12 network pages · /releases/lite · /releases/pro · /releases/enterprise · /terms-of-use · /career · /tools/social-media-image-resizer · /robots.txt · /sitemap.xml · /llms.txt (404) · all 25 blog posts (titles, H1s, dates) · https://docs.mixpost.app/sitemap.xml · /robots.txt · /llms.txt (404) · /api/ · /webhooks/ · /oauth/ · /mcp/ · /mcp/tools · /cli/ · /cloud/ · /cloud/plans · /cloud/billing · /cloud/vs-self-hosted · /pro/ · /using/ · /api/reference/accounts · /api/reference/mentions · /services/social/x/ · /services/social/tik-tok/direct-post-audit · /enterprise/configuration/dedicated-twitter-api · OpenAPI file https://docs.mixpost.app/assets/files/mixpost-2835c6937c8fde2142b94e940790a14c.yaml

Registries (measured): https://api.github.com/repos/inovector/mixpost · /repos/inovector/mixpost-cli · /repos/inovector/n8n-nodes-mixpost · GitHub issues #75, #169, #197, #214 and the issue search sorted by comments · https://api.github.com/repos/gitroomhq/postiz-app · https://hub.docker.com/v2/repositories/inovector/ · https://packagist.org/packages/inovector/mixpost/stats.json · https://api.npmjs.org/downloads/point/last-month/n8n-nodes-mixpost · awesome-selfhosted README · Google autocomplete (suggestqueries.google.com)

Third party (sourced, via search; not Mixpost's own claims): https://kompozy.io/reviews/mixpost · https://bestsocialmediascheduler.com/reviews/mixpost · https://www.blotato.com/blog/mixpost-alternatives · https://postiz.com/blog/mixpost-alternative · https://www.feedhive.com/alternatives/mixpost · https://socialk.it/en/alternatives/mixpost · https://www.bulkpublish.com/blog/mixpost-alternatives/ · https://postnext.io/alternatives/mixpost-alternative · https://openalternative.co/alternatives/mixpost · https://openalternative.co/compare/mixpost/vs/postiz · https://gigazine.net/gsc_news/en/20240309-mixpost · https://betalist.com/startups/mixpost · https://selfhost.directory/project/mixpostapp · https://www.alternativeto.net/software/mixpost/ (403 on direct fetch)

Not reachable: reddit.com (search tool blocks it; JSON and old.reddit 403/302), producthunt.com, g2.com, capterra.com, trustpilot.com (403).
