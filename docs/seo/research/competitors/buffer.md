Verified 2026-11-12: 17 corrections

# Competitor teardown: Buffer (buffer.com)

Checked 2026-11-12. Every claim is labelled:

- **measured**: I fetched the page or file myself on 2026-11-12. That covers raw HTML, `buffer.com/pricing.md` (Buffer's machine-readable pricing), `developers.buffer.com/llms.txt` and the `.md` guide files it lists, the sitemaps listed in `buffer.com/robots.txt`, the GitHub and npm APIs, and Google autocomplete.
- **sourced**: from a third-party page, with its URL.
- **inferred**: my own reading, arithmetic or estimate.

Buffer facts come only from buffer.com and developers.buffer.com. Third-party claims are marked as third-party.

Builds on `docs/geo/plan.md` (P3 comparison pages), `docs/geo/offsite-plan.md`, `docs/pricing.md`, `docs/seo/research/siar-truth.md` (the only allowed source for Siar wording) and the sibling teardowns (`ayrshare.md`, `bundle-social.md`, `late.md`, `upload-post.md`).

---

## 0. The short version

- Buffer is a **social media management app** for creators, small businesses and agencies. It is not an API company. The API is a feature of the app. (measured: home, /api, /made-for/developers)
- **The API is public again.** Buffer shut new app registration on its old REST API in October 2019. It launched a GraphQL API on 2026-05-27, with a hosted MCP server, a CLI and OAuth "App Clients". The old REST API (`api.bufferapp.com/1/`) shuts down on **2027-02-01**, with brownouts on 2026-11-11 and 2026-12-09. (measured: https://buffer.com/resources/buffer-api-is-here/ dated 2026-05-27; https://buffer.com/resources/legacy-rest-api-retired/ dated 2026-07-27; checked 2026-11-12)
- **What the API is built for:** a person or a team automating *their own* Buffer account, plus apps that act for *other Buffer users*. Every end user of a third-party app needs a Buffer account. They connect their social channels inside Buffer, and they pay Buffer per channel. There is no API call to connect a social account. (measured: developers.buffer.com/guides/building-apps.md, guides/api-limits.md, reference.md)
- **Pricing: per channel.** Free gives 3 channels. Essentials starts at $6 per channel per month and Team at $12, with volume steps after 10 channels. (measured: https://buffer.com/pricing.md)
- **Where Siar differs honestly (inferred, using siar-truth.md wording):**
  - Siar's customers connect their own social accounts through your branded connect link. They need no third-party account.
  - Siar prices per organization, with unlimited social accounts.
  - Siar has 16 HMAC-signed webhooks and a comments API.
  - Buffer documents none of these three for developers.
- **Where Buffer clearly wins (inferred):**
  - Approved, live publishing to TikTok, YouTube Shorts, Pinterest, LinkedIn Pages, Google Business Profile and Substack.
  - A hosted MCP server that connects to Claude and ChatGPT over OAuth.
  - A CLI already on npm.
  - A generous free plan.
  - 16 years of brand.

---

## 1. Who they are

- Buffer describes itself in its own words as "independent since 2010 and profitable for most of that time", with no investor pushing for an exit. (measured: https://buffer.com/made-for/developers FAQ, checked 2026-11-12)
- It is an "open company". The home page publishes live numbers: **MAU 339,201**, **total customers 86,380**, **73 teammates across 15 countries**, **ARR $28.3M**. (measured: https://buffer.com/, checked 2026-11-12; their own self-reported numbers, which I cannot verify)
- Buyer segments in the "Made for" nav: Creators, Small Business, Agencies, Nonprofits, Higher Education, Developers. (measured: home nav)
- API history, in Buffer's own words (measured: https://buffer.com/resources/rebuilding-buffers-api/ dated 2025-07-28 and https://buffer.com/resources/legacy-rest-api-retired/ dated 2026-07-27):
  - They launched the REST API in 2012.
  - It reached "more than 47,000 clients" by 2019.
  - They closed registration for new legacy apps in October 2019, citing tighter platform terms after Cambridge Analytica and the cost of doing it well.
  - They announced the rebuild in July 2025.
  - The GraphQL API went public on 2026-05-27.
  - The legacy REST API is retired on 2027-02-01.

## 2. Home page and main landing pages (exact copy)

### Home: https://buffer.com/ (measured, checked 2026-11-12)

- `<title>`: **"Buffer: Social media management for everyone"**
- Meta description: "Use Buffer to manage your social media so that you can create and share your content everywhere, consistently. Try our forever free plan or upgrade for more."
- The `<h1>` element contains only the word "Buffer" plus images. The visible hero line is an H2: **"Your social media workspace"**
- Hero subhead: **"Works with every platform you post to, and plugs into your favorite tools"**
- Hero CTA: an email field with the button **"Get started for free"**. Footer CTA: "Get started for free", with "No credit card needed. Free forever."
- Section headings, in order:
  - H2 **"339,201 creators, brands, and agencies using Buffer"**, followed by a logo strip.
  - H2 **"Core features"**, with four H3s. Each H3 has its own tagline:
    - "Publish": "The most complete set of publishing integrations, ever"
    - "Create": "Turn any idea into the perfect post"
    - "Community": "Reply to comments in a flash"
    - "Insights": "Answers, not just analytics"
  - H2 **"… and so much more!"**, with H3s "Collaborate", "Mobile app" and "AI assistant".
  - H2 **"Connect your favorite accounts"**: 12 "Buffer × <network>" tiles, then the label "MCP · API · Agents".
  - H2 **"Plan and post from your AI assistant"**. Copy is built on Ask / Plan / Post, with a mock Claude chat ("Chat / Cowork").
  - H2 **"Customer Support"**, tagline "Human support, worldwide". The copy also says "no bots, just real people".
  - H2 **"Resources"**, tagline "Fuel your social media success". Its H3s are Free Marketing Tools, Social Media Glossary, Social Media Marketing 101, Best Time to Post and Social Media Resources.
  - H2 **"About us"**, tagline "We are an open company", followed by the open-dashboard numbers above.
  - H2 **"Grow your social presence with confidence"**
- Proof used on the home page:
  - Logos (alt text): Metallica, Benefit, Wired, Semrush, Crocs, ElevenLabs, Pizza Hut, Vice, Clash of Clans.
  - The 339,201 user count, and the open-company metrics.
  - No testimonials on the home page.

### Pricing: https://buffer.com/pricing (measured, checked 2026-11-12)

- `<title>`: "Pricing | Buffer". H1: **"Pricing"**. Meta description: "We've built simpler social media tools for busy people. Enjoy our free plan as you get started, or trial our full toolkit priced to make marketing your business on social affordable."
- H2s: "Plans", "Connect your favorite accounts", "What people are saying", "Feature comparison" and "FAQs".
- The page has a channel-count stepper and a monthly/yearly toggle.
- The server HTML defaults to yearly, showing "$5 /month, 1 channel · $60 billed yearly (save 2 months)".
- CTAs: "Let's go" (Free) and "Start 14-day free trial" (paid). There is also the link "See machine-readable pricing (for AI agents)", which goes to `/pricing.md`.
- Testimonial: one quote, from Alexandrea Bowman of Sapphire Social, praising per-channel pricing because she stops paying when a client leaves.

### API: https://buffer.com/api (measured, checked 2026-11-12)

- `<title>`: "Buffer API | Build with Buffer". H1: **"Build any automation for social"**
- Subhead: **"One API. Every major social platform. Connect Buffer to your agents, automation tools, or build something entirely new."** CTAs: "Get Started" and "Explore the API".
- H2s, in order:
  - "Automate the repetitive parts. Keep the creative ones." (Zapier, n8n, Make, IFTTT)
  - "Use your AI assistant to schedule posts"
  - **"One API. 11 social platforms."**, with the line "Official API partner with Meta, LinkedIn, X and more."
  - "How it works": four steps (Get your API key / Authenticate / Send your first query / Automate and scale), with code tabs for GraphQL, cURL, Node.js, Python and PHP.
  - "Buffer 🤝 { your favorite tool }" (the feature cards below sit under this H2)
  - "See what people are building"
  - "API metrics"
  - "FAQs"
- Feature cards: "GraphQL API", "MCP server", "AI-powered developer support", "No-code automations" and "API explorer".
- Proof:
  - Four case-study quotes:
    - Shivani Shah, creator
    - Ben Campbell, PostIQ
    - Orel Zilberman, WriteStack
    - Marin Nedelev, Atena: "77 channels in nine countries"
  - A live metrics block: **"3.6h Time to first API call", "445.2K Ideas created", "28.5M Posts created"**.
- FAQ, notable answers:
  - "With the current Buffer API, you can perform actions against your own Buffer account and organization."
  - Under "What's coming next?", Buffer says it plans analytics and community features "for personal use cases".
  - Only the organization owner can create keys and App Clients.

### Developers: https://buffer.com/made-for/developers (measured, checked 2026-11-12)

- `<title>`: **"Social Media API for Developers | Buffer"**. H1: **"Buffer for Developers"**, tagline **"The social layer for whatever you're building"**.
- Subhead: "Buffer's API powers social sharing inside your SaaS, your creator tool, your AI agent, or the script that posts your release notes."
- H3 benefits:
  - "Buffer handles the complexity"
  - "Make it feel native": "Your users connect their Buffer account … OAuth is fully managed."
  - "Ready for AI workflows"
  - "Free to start, fair to scale": "No surprise rate caps, no rug pulls."
- H2 sections, in order: "Benefits", "API", "Build", "MCP", "Automate", "Resources", "Start building with Buffer's API" and "FAQs".
- FAQ:
  - The API supports "Instagram, LinkedIn, Threads, Facebook, Bluesky, YouTube, TikTok, and X", described as "official API partner".
  - Multi-user apps are possible "OAuth lets your users connect their own Buffer accounts".
  - The "What happens if Buffer pivots or gets acquired?" answer leans on independence and transparency.

### MCP: https://buffer.com/mcp (measured, checked 2026-11-12)

- `<title>`: **"Buffer MCP Server: The Social Media MCP for AI Agents"**. H1: **"Buffer MCP"**, tagline "Manage social media using an AI agent".
- H2s: "How it works", "What you can do", "Integrations", "Benefits", "FAQs" and "Resources".
- Key claims:
  - "Free on every Buffer plan".
  - It works with Claude, ChatGPT, Cursor, Raycast, Perplexity, Notion, Zapier, n8n, Manus and Antigravity.
  - Posts land in the Buffer queue, so the user stays "the last step".

### Agencies: https://buffer.com/partners/agencies (measured, checked 2026-11-12)

- H1: **"Buffer for agencies"**, tagline "The platform agencies build their business on".
- H2s: "Buffer by the numbers" (339,201 users, **17,172,370 posts published last month**, **11 social platforms supported**), "Trusted by teams at" and "Built for how you work with clients".
- It sells per-channel pricing as a feature: "Pay for channels, not seats".

### Developer portal: https://developers.buffer.com/ (measured, checked 2026-11-12)

- `<title>`: "Buffer API". There is a banner for "Buffer Commit", their first build contest (2026-10-28 to 2026-11-13).
  - Up to 16 winners share 10% of August 2026 net profit, a $25,600 pool.
  - Entries must "connect through Buffer OAuth". (measured: https://buffer.com/api/commit)

## 3. Pricing (sourced: https://buffer.com/pricing and https://buffer.com/pricing.md, checked 2026-11-12)

**Billing unit: per connected channel.** Buffer's own definition: "A channel is one social account you connect to Buffer … You're billed per channel." Five brands with Instagram and Facebook each is 10 channels. Seats are free on Team.

| | Free | Essentials | Team |
|---|---|---|---|
| Price (monthly billing) | $0 | from $6 / channel / month | from $12 / channel / month |
| Price (yearly billing) | $0 | $5 / channel / month ($60 per channel per year) | $10 / channel / month ($120 per channel per year) |
| Channels | up to 3 | unlimited | unlimited |
| Scheduled posts | 10 per channel at a time; a slot frees when a post publishes | "Unlimited", with a fair-use cap of 5,000 posts per channel | same as Essentials |
| Ideas | 100 | unlimited | unlimited |
| Users | 1 | 1 | unlimited |
| Analytics | Insights, 30-day history | advanced, reports, UTM | + branded reports |
| Community inbox (reply to comments) | yes (5 AI reply suggestions a week, 1 saved reply) | yes | yes |
| First comment, hashtag manager, channel groups, custom video covers | no | yes | yes |
| Approvals, access levels | no | no | yes |
| API keys / App Clients | 1 / 1 | 3 / 3 | 5 / 5 |
| API limits: 15 min / 24 h | 150 / 600 | 450 / 1,800 | 1,500 / 6,000 |
| API limit: 30 days | 1,000 per channel, up to 3,000 | 3,000 per channel, up to 30,000 | 10,000 per channel, up to 100,000 |
| Trial | | 14 days | 14 days |
| Support | email | email | email |

**Volume steps, monthly per-channel rate** (measured: /pricing.md):

| Channels | Essentials | Team |
|---|---|---|
| 1–10 | $6 | $12 |
| 11–25 | $4 | $4 |
| 26–50 | $3 | $3 |
| 51+ | $1 | $2 |

Buffer's own worked examples, monthly billing:

| Channels | Essentials | Team |
|---|---|---|
| 1 | $6 | $12 |
| 10 | $60 | $120 |
| 25 | $120 | $180 |
| 50 | $195 | $255 |

**Other terms:**

- Payment is by card only: "we cannot accept PayPal, checks, or bank transfers".
- Nonprofits get 50% off.
- UK B2C customers pay VAT.
- Prices were "last updated in November 2025".
- Upgrading from Free means paying for every channel, including the 3 that were free.
- After a trial, the account drops to Free, and channels beyond 3 are locked.
- **No overage pricing:**
  - Posts: unlimited under fair use.
  - API: hard rate limits that return `429`.
  - Higher API limits: "reach out to developersupport@buffer.com".

**Inconsistencies on their own pages (measured):**

- **Yearly discount:**
  - The FAQ says yearly billing gives "a 20% discount".
  - The cards say "save 2 months", and $5 vs $6 is 16.7%.
- **Team rate at 11–25 channels:**
  - It is $4, the same as Essentials.
  - Buffer's $180 example at 25 channels confirms the table, so it is not a typo.
  - Agencies on Team pay $12 only for their first 10 channels.

### Siar against these numbers (inferred arithmetic; Siar figures from `siar-truth.md` §3)

These scenarios only compare the dashboard use case. Buffer gives unlimited posts (fair use), while Siar caps posts per month. Buffer also publishes to more networks today (see §4).

| Scenario | Buffer Essentials (monthly) | Buffer Team (monthly) | Siar |
|---|---|---|---|
| 1 brand, 10 accounts | $60 | $120 | Starter $19 / RM39 (300 posts/month) |
| 10 clients, 30 accounts | 10×6 + 15×4 + 5×3 = **$135** | 10×12 + 15×4 + 5×3 = **$195** | Pro $49 / RM99 (10 brands, 10,000 posts/month) |
| 40 clients, 100 accounts | 60 + 60 + 75 + 50 = **$245** | 120 + 60 + 75 + 100 = **$355** | Business $149 / RM399 (unlimited brands, 100,000 posts/month) |

- For a developer building a product, the comparison changes completely.
- With Buffer, each of your end users holds their own Buffer account and their own Buffer bill.
- Your app pays nothing to Buffer, but your users must accept Buffer's plan limits. For example, the Free plan has 3 channels and 10 queued posts per channel.
- With Siar, you hold one organization and your customers connect accounts under it.

## 4. Networks and API features

### Networks (measured, checked 2026-11-12)

- The home page "Publish" card lists 12: Facebook, Instagram, TikTok, LinkedIn, Threads, Bluesky, YouTube Shorts, Pinterest, Google Business, Mastodon, X and Substack.
- The /api page, the agencies page, the Commit contest and Buffer's own API roundup all say **"11"**.
- The GraphQL `Service` enum has 14 values: bluesky, facebook, googlebusiness, instagram, linkedin, mastodon, pinterest, **startPage** (Buffer's own link-in-bio), substack, threads, tiktok, twitter, **whatsapp**, youtube. (https://developers.buffer.com/types/Service.md)
- WhatsApp is in the schema, and the changelog added and then removed `WhatsAppWebhookState` in September 2026. But there is no WhatsApp page: https://buffer.com/whatsapp returns 404. **Inferred:** WhatsApp is in development, not public.
- **Per-profile limits** (pricing FAQ table):
  - Instagram personal profiles and Facebook groups get reminder-only "notification publishing".
  - YouTube is "YouTube (Shorts)": the /youtube page is titled "Schedule YouTube Shorts", and its FAQ says "Buffer currently only supports scheduling for YouTube Shorts" (1:1 or 9:16, 10 GB max).
  - Pinterest (business and personal) has no community engagement. Google Business Profile **does** have community engagement but no analytics (neither basic nor advanced).
  - TikTok is listed for "TikTok business profiles" only.
  - X free profiles get no basic analytics.
- **Missing networks** compared with the Siar codebase (`packages/networks/src/adapters/`): Discord, Slack, Reddit and Snapchat. (Siar has no Telegram adapter.) Of these, **Siar has Discord and Slack live**. Reddit and Snapchat are built but parked (siar-truth §2).
- **Buffer has live, Siar does not yet:** TikTok, public YouTube, Pinterest publishing, LinkedIn company pages and Google Business Profile (siar-truth §2). Buffer also has Substack, which Siar has no adapter for.

### API features (measured from developers.buffer.com, checked 2026-11-12)

| Feature | Buffer | Source |
|---|---|---|
| Protocol | GraphQL, one endpoint `https://api.buffer.com`. Always HTTP 200, with typed error unions in the body (except `429`) | guides/introduction.md, guides/error-handling.md, guides/rest-migration.md |
| Size | 24 queries, 25 mutations; 434 entries in the reference (queries, mutations, types) | reference.md |
| Auth (own account) | Personal API key, sent as a Bearer token. "Acts on behalf of your account only". "There is no per-organization scoping at this time" | guides/authentication.md |
| Auth (other users) | **App Clients**: OAuth 2.0 Authorization Code + PKCE. Access token lasts about 1 hour; rotating refresh tokens via `offline_access`. Scopes: account, posts, ideas, snippets, notes (read/write) | guides/building-apps.md, guides/authentication.md |
| Who connects social accounts | **The end user, inside Buffer.** App Client users are "Buffer account[s]". The reference has no mutation to connect a channel | guides/api-limits.md, reference.md (mutation list) |
| White-label connect | **None.** The consent screen is Buffer's, showing your app's name and logo | guides/building-apps.md |
| Posting | `createPost` per channel; modes `addToQueue`, `customScheduled`, `shareNow`; threads (X, Bluesky, Threads, Mastodon); drafts; first comment (LinkedIn, Facebook, Instagram); Instagram user tags. "Content Items" (`createContentItem`) create posts for many channels in one all-or-nothing call; the reference says "This API is an early preview and can change without a deprecation period" | guides/posts-and-scheduling.md, guides/content-items.md, reference.md |
| Media | **No upload endpoint.** You host files at public URLs that must stay reachable until the post publishes | guides/hosting-media.md |
| Analytics | Post metrics and aggregates exist, but **"Post metrics are only available with a personal API key. App Clients cannot read them."** There are no account-level insights in the API | guides/post-metrics.md |
| Comments / DMs | **None in the API.** The /api FAQ lists "community features for personal use cases" as planned | buffer.com/api FAQ |
| Webhooks | **None documented.** The changelog's only webhook mentions are WhatsApp internals (`WhatsAppWebhookState`) and one `AuthorizationStatus.notEnoughData` description ("missing scopes or webhook metadata"); none is a customer-facing webhook | llms.txt (71 pages), changelog.md |
| Rate limits (keys + MCP, shared) | 15 min / 24 h / 30 days: Free 150 / 600 / ≤3,000; Essentials 450 / 1,800 / ≤30,000; Team 1,500 / 6,000 / ≤100,000. IETF `RateLimit` headers | guides/api-limits.md |
| Rate limits (App Client) | Base 100 per 15 min, 500 per 24 h, 15,000 per 30 days, plus 10 / 25 / 100 per authorized user. Only the first 1,000 users count | guides/api-limits.md |
| SDKs | **No SDK.** "no SDK required"; a GraphQL code generator is suggested | buffer.com/api, buffer-api-is-here |
| CLI | `@bufferapp/cli` (Node 18+), generated from the schema, with skill files for Claude Code and Codex. npm: created 2026-04-21, latest 2.3.1, **3,872 downloads in the 30 days to 2026-11-10** | guides/cli.md; https://api.npmjs.org/downloads/point/last-month/@bufferapp/cli |
| MCP | Remote server at `https://mcp.buffer.com/mcp` with OAuth (no key). Tools cover account, channels, posts (list, get, create, edit, delete), aggregated metrics, ideas and post templates | guides/integrations/mcp.md |
| Agent-readiness | `developers.buffer.com/llms.txt` (71 pages), `.md` versions of every guide, `buffer.com/pricing.md`, an interactive API Explorer, and an AI docs helper | measured |
| Sample code | `bufferapp/buffer-sample-apps`: 1 star, created 2026-09-24 | https://api.github.com/repos/bufferapp/buffer-sample-apps |
| Status page | https://status.buffer.com (200) | measured |

**App Client limit arithmetic (inferred):**

- An app with 1,000 authorized users gets 100 + 10×1,000 = 10,100 requests per 15 minutes.
- Over 30 days it gets 15,000 + 100×1,000 = 115,000 requests, about 115 per user per month.
- Past 1,000 users the limit stops growing unless Buffer raises it by email.
- That is fine for a companion tool. It is tight for a SaaS product that polls post status.

## 5. SEO footprint

### Size (measured from the sitemaps in https://buffer.com/robots.txt, 2026-11-12)

| Sitemap | URLs |
|---|---|
| `buffer.com/sitemap.xml` (marketing) | 226 |
| `/resources/sitemap-posts.xml` (blog) | **2,425** |
| `/resources/sitemap-authors.xml` | 330 |
| `/resources/sitemap-tags.xml` | 68 |
| Localized marketing: es 69, fr 69, de 66, it 68, nl 66, pt 67 | 405 |
| **Total in sitemaps** | **about 3,454** |
| `developers.buffer.com` | No sitemap (`/sitemap.xml` and `/sitemap-index.xml` return 404). llms.txt lists 71 pages: 25 guides, 13 integration guides, 31 examples, plus the reference and changelog. The changelog links 274 distinct type pages |

Blog posts by `lastmod` year: 2020: 119, 2021: 7, 2022: 367, 2023: 159, 2024: 314, **2025: 1,000**, **2026: 459**. **Inferred:** a large refresh in 2025, and active publishing in 2026.

`robots.txt` disallows only `/add`, `/ajax`, `/button` and two docs assets. It blocks no AI crawlers (it blocks only `bitlybot`).

### Marketing URLs by type (measured, main sitemap)

| Type | Count | Notes |
|---|---|---|
| Glossary `/social-media-terms/*` | 103 + hub (104 URLs in all) | Title: "Social Media Terms: A Comprehensive Glossary by Buffer" |
| Free tools `/free-tools/*` | 26 + hub | Hashtag, username, bio and hook generators, UTM builder, plus a programmatic **image resizer per network** (hub + 11 network pages) |
| Integrations `/integrations/*` | 25 + hub | Canva, Zapier, Make, IFTTT, n8n, Claude, ChatGPT, Cursor, Grok, Raycast, Perplexity, WordPress, Bitly, plus partner apps (WriteStack, Nelio, Quuu…) |
| Channel pages | 12 | /instagram, /tiktok, /linkedin, /x, /youtube, /threads, /pinterest, /bluesky, /mastodon, /facebook, /google-business-profile, /substack. Their angle is "Schedule X posts", **not** API |
| Made for | 4 in sitemap (+ /made-for/startups linked from the home page) | creators, developers, higher-education, small-business |
| Benchmarks / research | /social-media-benchmarks + 3, /state-of-remote-work + 6 | Data PR assets |
| Comparison hub `/compare` | 1 hub, 10 cards | Agorapulse, eClincher, Hootsuite, Later, Loomly, Meta Business Suite, Metricool, Sked Social, Sprout Social, Tailwind |
| API / MCP / AI | /api, /mcp, /ai-assistant (+1), /integrations/openai-ai-assistant | |
| Open company | /open, /salaries, /transparent-pricing, /metrics, /shareholders, /journey, /books, /timeoff | Earned-link magnets (inferred) |

### Blog (`/resources/`) by type (measured from post slugs)

- **"Buffer vs X"**: 11 (hootsuite, later, loomly, agorapulse, metricool, sprout-social, meta-business-suite, tailwind, sked-social, eclincher, recurpost).
- **Alternatives**: hootsuite, later, metricool and sprout-social, plus off-topic ones (chatgpt, tiktok).
- **Best time to post**: 10 current posts: a hub (`best-time-to-post-social-media`) plus Facebook, Instagram (two slugs), TikTok, LinkedIn, Bluesky, YouTube, X and Threads. No Pinterest or Mastodon post. Another 5 slugs contain "best-time" but are old, unrelated posts (15 "best-time" slugs in all).
- **"Best …" lists**: 32 slugs start with `best-` or `the-…best`; about 20 of them are "best X" list posts once the best-time-to-post and old off-topic slugs are removed. The earlier count of 27 could not be reproduced (unverified). Includes "The 11 Best Social Media Management Tools in 2026 — Tried + Tested".
- **How-to**: 136 slugs contain "how-to".
- **Old API post on the exact slug:** https://buffer.com/resources/buffer-api/ is a 2012-08-02 post, "The Buffer API Is Ready: 15 Apps You Can Use to Share With Buffer". Buffer already owns the `/buffer-api/` URL with an aged page.
- **API and developer content**: about 10 recent posts. They are:
  - "The Best Social Media APIs for Developers + Vibe Coders in 2026" (2026-05-28)
  - "Which Social Media APIs Support Multi-Platform Posting? 6 Free + Paid Options" (2026-06-11)
  - "Buffer's API is Open for Building" (2026-05-27)
  - "Buffer's Legacy REST API is being fully retired on February 1, 2027" (2026-07-27)
  - "We're Rebuilding Buffer's API" (2025-07-28)
  - "The Best MCP Servers for Social Media"
  - "How to Post on Social Media from Claude"
  - three API case studies
  - an old GraphQL engineering post
- **No per-network API guides.** There is no "Instagram API", "TikTok API" or "LinkedIn API" how-to anywhere in the 2,425 slugs (the only `*-api` slug is the news post `twitter-api-changes`). **No head-to-head pages against API vendors.** Ayrshare and Zernio appear inside both roundups, Upload-Post only in "best-social-media-apis". **bundle.social is not mentioned in either roundup.**

### Keyword targets inferred from titles and H1s (inferred)

- **Head terms, product side:**
  - "social media management" (home title)
  - "social media scheduler & planner" (/publish)
  - "schedule Instagram posts, reels, and stories" (channel pages)
  - "social media management for small business / creators / agencies"
- **Top of funnel** (these carry the domain):
  - "best time to post on <network> 2026"
  - "social media terms / glossary"
  - "<network> hashtag generator"
  - "<network> image size / resizer"
  - "username generator"
  - "social media benchmarks"
- **Comparison terms:** "buffer vs <tool>", "<tool> alternatives", "best social media management tools 2026".
- **API terms, newer and few pages:**
  - "social media API for developers" (title of /made-for/developers)
  - "best social media APIs"
  - "social media API multi-platform posting"
  - "social media MCP server" (title of /mcp)
  - "Buffer API"
- Buffer lists itself first in both of its own API roundups. The "short answer" section (not the table) calls Buffer "the strongest free-tier option from an established brand", with "11 supported channels"; the same post's FAQ says "Buffer's API supports 10 channels". (measured: https://buffer.com/resources/best-social-media-apis/)

### Demand evidence (inferred from Google autocomplete, measured 2026-11-12, `gl=us`)

- **"buffer api"** gives: buffer api key, buffer api pricing, buffer api docs, buffer api token, **buffer api n8n**, buffer api access, buffer api instagram, buffer api access token.
  - **Inferred:** steady navigational demand from existing users, plus an automation (n8n) cohort.
- **"buffer alternative"** gives: buffer alternatives free, …open source, …github, …reddit, and **"buffer alternative with api"**.
  - **Inferred:** a real, if small, query that a Siar page can answer honestly.
- **"buffer mcp"** gives: buffer mcp claude, …server, …chatgpt, …url, …github, …pricing, …connector.
- **"buffer pricing"** gives: …plans, …for nonprofits, …india, …uk, …tiers, …per month, …reddit.
- **"does buffer have an api"** is itself a suggestion, and Ayrshare targets it (see `ayrshare.md` §5).
- Competitor pages built on the "Buffer API" query (all **third-party, self-interested**):
  - https://zernio.com/blog/buffer-api (published 2026-02-13, updated 2026-05-05)
  - https://zernio.com/blog/buffer-alternative-for-developers (published 2026-01-28, updated 2026-10-12)
  - https://postproxy.dev/blog/what-happened-to-buffer-api-alternatives-for-developers/ (2026-02-25)
  - https://www.postzen.dev/blog/buffer-api (2026-10-01)
  - https://blog.dohoo.ai/blog/buffer-api-alternatives/ (published 2026-08-24, updated 2026-09-08)
  - https://www.ayrshare.com/blog/what-happened-to-buffers-api/ ("What Happened to the Buffer API?", published 2022-11-15, updated 2026-10-27)
  - https://www.ayrshare.com/compare/buffer-api-alternative/ ("Buffer API Alternative: Ayrshare vs. Buffer", updated 2026-10-23; its meta description opens "Does Buffer have an API?")
  - **Inferred:** five or more vendors think this query is worth a page.
  - Some are already wrong on facts. Zernio's `/blog/buffer-api` (last updated 2026-05-05) and Postproxy say third-party OAuth is unavailable, which was true before 2026-05-27. Zernio's alternative-for-developers page, updated 2026-10-12, now says Buffer "added OAuth 2.0", so it is current. PostZen says daily caps "run 250 to 500 requests", which doesn't match Buffer's current docs (600 / 1,800 / 6,000 per 24 h).

### Backlink and authority signals

- **Product Hunt:** "Buffer API" launched 2026-05-28, tagline "One API to publish across every social platform". It has 218 points, 260 followers and 1 review (5.0). (sourced: https://www.producthunt.com/products/buffer-api, fetched 2026-11-12). Launch of the Day #5 per hunted.space (sourced, aggregator: https://hunted.space/dashboard/buffer-api).
- **G2:** 4.3/5 from about 1,039 reviews (sourced via search snippet only; https://www.g2.com/products/buffer/reviews returned 403, so this is **unverified** directly).
- **Capterra:** https://capterra.com/p/143492/Buffer/reviews/ returned 403, **unverified**.
- **Trustpilot:** 4.3, 157 reviews, 66 in the last 12 months. Distribution: 45% 5-star, 33% 1-star. (sourced: https://www.trustpilot.com/review/buffer.com, fetched 2026-11-12)
- **Wikipedia** has an article (https://en.wikipedia.org/wiki/Buffer_(application)), and an API Evangelist profile exists on GitHub (https://github.com/api-evangelist/buffer).
- **GitHub:** the `bufferapp` org has 199 public repos and 182 followers. The new sample-app repo has 1 star. **Inferred:** developer link equity comes from the brand, not from code.
- **Buffer Commit** contest: the prize is tied to entries using Buffer OAuth, so each public entry is a new integration and a likely link. (inferred)
- **Domain-level (inferred):**
  - 16 years of content.
  - Open salaries and transparency pages, cited widely.
  - IFTTT's founder is quoted in the launch post.
  - A domain with very high authority, so Buffer pages on new API terms will rank fast.
  - Siar can't out-rank Buffer on "Buffer API". It can target "Buffer API alternative" and "Buffer alternative with API", where Buffer has no page. But Ayrshare already has a dedicated `/compare/buffer-api-alternative/` page and Zernio a "Buffer alternative for developers" page, so Siar would be competing with those, not with an empty result.
  - **Unverified:** no live SERP was re-checked in the 2026-11-12 verification (the search budget was used up). Every "will rank" / "can rank" line here is inference, not an observed ranking.

## 6. Weaknesses: user complaints and gaps Siar can use honestly

### Complaints (sourced)

- **Trustpilot 1-star page** (https://www.trustpilot.com/review/buffer.com?stars=1, fetched 2026-11-12). Page 1 of 3 shows 20 reviews from 2024-10-24 to 2026-10-06. Themes (my own tally, **inferred**; a review can count in more than one theme, and a re-count gave 7 to 8 for failed posts):
  - **Posts failing or unreliable publishing: about 7–8.** Examples: 2026-02-21 (US), frequent failures mean the user must verify everything manually; 2026-07-02 (DE), scheduled posts fail for spurious reasons (paraphrase; the exact error wording was not re-confirmed).
  - Setup and UX friction: about 6.
  - Support responsiveness: about 4.
  - Account risk (bans, perceived reach penalty): about 4.
  - **Channel connections dropping: about 3.** Example: 2026-06-28 (MX).
  - Billing after cancellation: 1 (2024-10-24, AU).
- **Recent 2-star**, 2026-11-01 (CA): Pinterest posts repeatedly failed. Buffer replied asking for examples. (same source)
- **Per-channel cost at scale** is a repeated criticism in third-party reviews (**inferred** "most repeated"; not counted). These are **third-party and mostly vendor-written**. Counterpoint: NapoleonCat (below) found that Reddit comments about price usually name Buffer as the cheaper option.
  - https://www.usecarly.com/blog/buffer-alternatives/ ("Per-Channel Pricing Bites")
  - https://socialrails.com/blog/cheaper-than-buffer
  - https://howsociable.com/reviews/buffer
- A NapoleonCat analysis of 117 Reddit comments (**third-party, a competitor**: https://napoleoncat.com/blog/buffer-reviews-on-reddit/, 2026-08-27) found:
  - 12% of comments say users "outgrow" Buffer (reporting depth, client management, approvals).
  - Failed posts in only 2 of 117 Reddit comments, but in 8 of 54 Trustpilot 1-stars.
- **Reddit itself: not reachable.** reddit.com search and the JSON search endpoint returned 403 (re-checked 2026-11-12); the original pass also found no reddit.com threads in web search (not re-run). I have no direct Reddit thread links; treat the Reddit theme as **unverified** beyond NapoleonCat's digest.

### Developer-side gaps in Buffer's own docs (measured, checked 2026-11-12)

1. **Your users need Buffer.** App Client users are Buffer accounts. They connect channels in Buffer and are bound by Buffer's plan: Free is 3 channels and 10 queued posts per channel. No API exists to connect a social account, and there is no white-label connect.
2. **No webhooks.** You poll for post status. That polling counts against the App Client's request limit.
3. **No comments or DMs** in the API. Promised later, "for personal use cases".
4. **No analytics for apps.** Metrics need a personal key ("App Clients cannot read them").
5. **No media upload.** URLs must stay public until the post goes out. Signed S3 URLs "often … expire before the post publishes, causing it to fail silently".
6. **One channel per `createPost`.** Multi-channel "Content Items" are an "early preview" that "can change without a deprecation period".
7. **Keys are per account, not per organization.** Only the org owner can create keys or App Clients.
8. **App Client ceiling:** limits stop growing at 1,000 authorized users; above that, you email Buffer.
9. **Legacy REST shutdown, 2027-02-01**, with brownouts 2026-11-11 and 2026-12-09.
   - Migrators must move to GraphQL. The mapping is endpoint-by-endpoint, and there is no REST option.
   - The migration guide says `/links/shares.json`, the configuration endpoint, move-to-top/reorder/shuffle and per-profile posting schedules don't carry over. Note: the reference now has a `movePostInQueue` mutation, so queue reordering is partly back; the guide has not caught up.
10. **No official SDK.** GraphQL codegen is suggested instead.

### Gaps in their own pages (measured)

- **Platform count is inconsistent:**
  - 10 in the FAQ of "best-social-media-apis".
  - 11 on /api, /partners/agencies, the Commit page and both roundups' main text.
  - 12 on the home Publish card.
  - 14 values in the schema.
- **Yearly discount:** "20%" in the FAQ vs "save 2 months" (16.7%) on the cards.
- **API keys:** the roundup says "paid accounts get 5" API keys. The pricing page says Essentials gets 3.
- **User count:** the blog CTA says "200,000+ creators, small businesses, and marketers". The home page says 339,201.
- **Ayrshare MCP:** the roundup table marks Ayrshare "MCP server: No (as of May 2026)". Ayrshare's own site advertises a hosted MCP today (see `ayrshare.md` §1). **Inferred:** the table is stale.

### Gaps Siar can exploit honestly (inferred; Siar evidence and wording from `siar-truth.md`)

| Buffer gap | Siar fact (allowed wording) | Evidence |
|---|---|---|
| End users need a Buffer account and Buffer plan | "A branded connect link (your name, logo, colour). Customers sign in to each network themselves; you never touch a password or token." Never "white-label" | Portal.vue, accounts.ts |
| Per-channel billing | "Unlimited social accounts on every plan, from RM39 / $19 a month." | plans.ts |
| No webhooks | "16 HMAC-signed events, retried with backoff, with a delivery log you can inspect and resend." | events.ts, webhooks.ts |
| No comments API | Comments: publish, reply, import, and like/hide/delete where the network allows. Live for Facebook, Instagram, Threads, X, Bluesky, Mastodon, Slack and YouTube | content-comments.ts |
| Analytics only on personal keys | Account and post analytics in the API on paid plans (not Free) | content-analytics.ts |
| GraphQL only, REST retiring | One REST API, 270 operations, OpenAPI document at `/openapi.json`. Say "OpenAPI" or "OpenAPI 3.0", not 3.1 | siar-truth §1c |
| One channel per call | "A post sent to every connected network counts as one post." | pricing.md, posts.ts |
| Failed posts are the top review complaint | "Each network's limits are checked when you create the post, so a bad request fails with a 400 you can fix, not at 9 a.m." Plus "Never posts twice" and verbatim network errors. **These are design guarantees, not measured rates.** No reliability numbers | posts.ts, publisher.ts, errors.ts |
| Card only (Buffer: "we cannot accept PayPal, checks, or bank transfers"); prices shown in USD on /pricing and /pricing.md (whether Buffer bills other currencies: **unverified**) | Ringgit for Malaysian organizations; yearly paid once by FPX or DuitNow | plans.ts |
| No Discord or Slack | Discord and Slack are live in Siar | siar-truth §1a |

### Where Buffer is genuinely stronger (don't contest these)

- **Approved, live networks:** TikTok, YouTube (Shorts), Pinterest, LinkedIn Pages and Google Business Profile publish today. Siar's are pending or parked (siar-truth §2). Any Siar vs Buffer table must say so.
- **MCP and CLI that install today.**
  - Buffer: OAuth one-click into Claude, ChatGPT and others; CLI on npm with about 3.9k downloads a month.
  - Siar: SDK, CLI and MCP are **not on npm** (404), so no install claims.
- **Free plan:** 3 channels with a refilling queue, and the API included, versus Siar's 20 free posts to try (one-time).
- **Unlimited posts** on paid plans (5,000 per channel fair use), versus Siar's monthly post caps.
- **The full app:** AI assistant, mobile apps, approvals, branded reports, Substack.
- **Brand and proof:** 339,201 MAU, logos, Wikipedia, G2 volume, an open company. Siar has no customers, testimonials or usage numbers to show (siar-truth §5).

### Rules for any Siar page about Buffer

- Link every Buffer fact to `buffer.com/pricing.md` or the developers.buffer.com guide, dated.
- Use Buffer's own word "channel". Don't call Buffer "expensive". Show the arithmetic.
- Say "Buffer's API is public again since 2026-05-27, with OAuth App Clients". Don't repeat competitors' stale "Buffer has no third-party OAuth" line.
- Never claim REST compatibility with Buffer's legacy API. Siar is wire-compatible with **bundle.social** v1, not Buffer. A Buffer REST migrator would still rewrite their calls.

## 7. Positioning line

**Buffer's API connects your app to people who already use Buffer. Each of them needs a Buffer account and pays Buffer per channel. Siar is the API you build your own product on: your customers connect their social accounts through your branded link, you pay one price per organization with unlimited accounts, and you get REST, webhooks and comments.** Say it only alongside the network-status qualifiers in siar-truth §1a and §2.

---

## Sources (all checked 2026-11-12)

Buffer, own pages:

- https://buffer.com/
- https://buffer.com/pricing
- https://buffer.com/pricing.md
- https://buffer.com/api
- https://buffer.com/made-for/developers
- https://buffer.com/mcp
- https://buffer.com/partners/agencies
- https://buffer.com/api/commit
- https://buffer.com/compare
- https://buffer.com/youtube
- https://buffer.com/robots.txt
- https://buffer.com/sitemap.xml
- https://buffer.com/resources/sitemap.xml (posts, authors, tags)
- https://buffer.com/{es,fr,de,it,nl,pt}/sitemap.xml
- https://buffer.com/resources/buffer-api-is-here/
- https://buffer.com/resources/legacy-rest-api-retired/
- https://buffer.com/resources/rebuilding-buffers-api/
- https://buffer.com/resources/best-social-media-apis/
- https://buffer.com/resources/social-media-api-multi-platform-posting/
- https://developers.buffer.com/llms.txt and these `.md` files:
  - guides/introduction
  - getting-started
  - authentication
  - building-apps
  - api-limits
  - rest-migration
  - error-handling
  - content-items
  - posts-and-scheduling
  - data-model
  - hosting-media
  - post-metrics
  - api-standards
  - cli
  - integrations/mcp
  - reference
  - changelog
  - types/Service

Data: https://api.npmjs.org/downloads/point/last-month/@bufferapp/cli, https://registry.npmjs.org/@bufferapp/cli, https://api.github.com/repos/bufferapp/buffer-sample-apps, https://api.github.com/orgs/bufferapp, Google autocomplete (suggestqueries.google.com, `client=firefox`, `gl=us`).

Third-party (labelled where used):

- https://www.trustpilot.com/review/buffer.com
- https://www.producthunt.com/products/buffer-api
- https://hunted.space/dashboard/buffer-api
- https://napoleoncat.com/blog/buffer-reviews-on-reddit/
- https://zernio.com/blog/buffer-api
- https://zernio.com/blog/buffer-alternative-for-developers
- https://postproxy.dev/blog/what-happened-to-buffer-api-alternatives-for-developers/
- https://www.postzen.dev/blog/buffer-api
- https://blog.dohoo.ai/blog/buffer-api-alternatives/
- https://www.ayrshare.com/blog/what-happened-to-buffers-api/
- https://www.ayrshare.com/compare/buffer-api-alternative/
- https://www.usecarly.com/blog/buffer-alternatives/
- https://socialrails.com/blog/cheaper-than-buffer
- https://howsociable.com/reviews/buffer
- https://github.com/api-evangelist/buffer
- https://en.wikipedia.org/wiki/Buffer_(application)

Not reachable (403): g2.com, capterra.com, reddit.com search.

## Verification log (2026-11-12, adversarial re-check)

Re-fetched every Buffer page and file listed above, the npm and GitHub APIs, the sitemaps, Google autocomplete (6 queries), Trustpilot (1-star and 2-star filters), Product Hunt, hunted.space, NapoleonCat and the competitor "Buffer API" pages.

**Held:** all prices, volume steps, worked examples, plan limits, API key / App Client / rate-limit numbers, App Client limit arithmetic, the Siar-vs-Buffer scenario arithmetic, payment terms, nonprofit discount, trial terms, FAQ quotes, home/pricing/API/MCP/agencies/Commit copy and live numbers (339,201 MAU; 86,380 customers; 73 teammates, 15 countries; $28.3M ARR; 17,172,370 posts last month; 3.6h / 445.2K / 28.5M), API history dates (2012, 47,000 clients, October 2019, 2025-07-28, 2026-05-27, 2026-07-27, brownouts 2026-11-11 and 2026-12-09, retirement 2027-02-01), reference size (24 queries, 25 mutations, 434 entries), llms.txt (71 links: 25 guides, 13 integration guides, 31 examples, reference, changelog), 274 type pages in the changelog, sitemap totals (3,454), blog lastmod years, the 11 "buffer-vs" posts, the /compare hub's 10 cards, npm (3,872 downloads 2026-10-12 to 2026-11-10; 2.3.1; created 2026-04-21), GitHub (199 repos, 182 followers; sample repo 1 star), Product Hunt (218 points, 260 followers, 1 review, 5.0, #5 of the day 2026-05-28), Trustpilot (4.3, 157 reviews, 66 in 12 months, 45% / 33%), NapoleonCat figures, autocomplete suggestions, and every Siar claim against `siar-truth.md` and the code (16 webhook events in `apps/api/src/platform/events.ts` via `apps/site/src/lib/events.ts`; 270 operations; OpenAPI 3.0; npm 404).

**Corrected (17):**
1. Google Business Profile **has** community engagement on Buffer (pricing FAQ table); only Pinterest lacks it. GBP lacks analytics.
2. Siar has **no Telegram** adapter; "missing in Buffer" is Discord, Slack, Reddit, Snapchat.
3. Best-time-to-post posts: 10 current, not 15 (15 slugs contain "best-time"; 5 are old and unrelated).
4. Glossary: 103 term pages + hub, not 104 + hub. (Free tools and integrations counts restated as pages + hub.)
5. "Best …" list count of 27 could not be reproduced; replaced with the measured slug count and marked unverified.
6. Content Items are labelled "early preview" in the reference, not "Experimental"; llms.txt does not label them.
7. Only Zernio's `/blog/buffer-api` (updated 2026-05-05) and Postproxy still say no third-party OAuth; Zernio's alternative page (updated 2026-10-12) is current.
8. bundle.social is **not** mentioned in either Buffer roundup; Upload-Post is only in one.
9. The "strongest free-tier option" line is in the roundup's short answer, not its table; the same post's FAQ says "10 channels" (added to the platform-count inconsistencies).
10. Heading lists for /api (missing "Buffer 🤝 { your favorite tool }") and /made-for/developers (missing Benefits, Resources, Start building, FAQs) completed.
11. Ayrshare already has `/compare/buffer-api-alternative/` (and Zernio an alternative page), so "Buffer API alternative" is not an empty query.
12. Buffer already owns `/resources/buffer-api/` (a 2012 post); added.
13. The "who ranks" sample of 10 searches could not be re-run (WebSearch budget used up); ranking lines are now marked unverified/inferred.
14. Trustpilot theme tally relabelled as my own inferred count (7–8 failed-post reviews on re-count); the DE 2026-07-02 detail is paraphrased, not re-confirmed.
15. "USD only" downgraded: Buffer shows USD on its pricing pages; other billing currencies unverified.
16. `movePostInQueue` exists in the reference, so "reorder doesn't carry over" is qualified.
17. Changelog webhook mentions include an `AuthorizationStatus` description, not only WhatsApp internals.

**Still unverified:** G2 rating (403), Capterra (403), Reddit threads (403), live SERP positions for any query.
