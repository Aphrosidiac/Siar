# Competitor teardown: Ayrshare (ayrshare.com)

Verified 2026-11-12: 20 corrections (adversarial re-check against ayrshare.com, its docs, the GitHub/npm/PyPI APIs, Google autocomplete, the third-party pages cited, and the Siar code and `docs/seo/research/siar-truth.md`). The "who ranks" list in section 5 could not be re-run because the shared web-search budget was used up; it is marked unverified.

Checked 2026-11-12. Every claim is labelled:

- **measured**: I fetched the page or file myself on 2026-11-12. That includes raw HTML, the `.md` mirror Ayrshare publishes for each page, sitemaps, the GitHub API, npm and PyPI download stats, and Google autocomplete.
- **sourced**: from a third-party page, with its URL.
- **inferred**: my own reading or estimate.

Ayrshare facts come only from ayrshare.com. Third-party claims are marked as such.

Builds on `docs/geo/plan.md` (P3 comparison pages), `docs/geo/offsite-plan.md` and `docs/pricing.md`. The pricing sources in `docs/pricing.md` were checked 2026-10-13. Nothing on Ayrshare's prices has changed since then, apart from the yearly prices and add-ons this file adds.

---

## 1. Who they are

- Founded in 2020 by Geoff Bourne and Boris Markovich. The company joined [saas.group](https://saas.group) in October 2025. The team is remote and the CEO is Marc Blinder. (measured: https://www.ayrshare.com/about-ayrshare/, checked 2026-11-12)
- Self-description: "We build the compliant, unified social media API that other products rely on." (measured: same page)
- Main competitive angle: **the incumbent**. They lean on scale numbers, "official social network partner" status, and compliance with platform policies (especially X). They have moved to an **AI-agent** story: hosted MCP, a Claude Code plugin, and an "Install with AI" prompt. (measured, home + /ai-agent/ + /install/)
- Buyer focus, in their words: "SaaS platforms, AI products, and agency software" (measured: /compare/bundle-social-api-alternative/). Their own 2021 post "When to Use (and Not Use) Ayrshare" tells individuals and small businesses with simple needs to look elsewhere. (measured: https://www.ayrshare.com/blog/why-you-shouldnt-use-ayrshare/, dated 2021-09-11)

## 2. Home page and main landing pages (exact copy)

### Home: https://www.ayrshare.com/ (measured, page lastModified 2026-10-12)

- `<title>`: **Unified Social Media API for 14+ Networks**
- H1/hero (the `.md` mirror's top H1 is "Ayrshare Social Media API"; the rendered H1 is): **"Unified Social Media API for Posting, Scheduling, Analytics, and AI Agents"**
- Subhead: "Ayrshare is a unified social media API that lets developers, product builders, and marketers post, schedule, and analyze content across 14+ social networks with one integration, plus an MCP server for AI agents. Stop maintaining 14+ social media integrations and ship in days, not quarters."
- Hero CTAs: **"Start building"** (→ /pricing/#plans) and **"Infrastructure for product builders"** (→ /business-plan-for-multiple-users/). Header CTAs are "Book A Demo", "Log in" and "Get started".
- Stat strip: ">99.99% — API uptime", "30M+ — API calls per day", "14+ — Social media networks", "AI-Native — Native MCP server for any AI agent".
- Section headings, in order:
  - H2 "A Complete Social Media API". Its H3s: "One API Across the Full Social Workflow", "Built for Multi-Tenant Products", "Compliance You Don't Have to Chase" and "Complete Loop for AI Agents".
  - H2 "Publish Across 14+ Social Networks with One API"
  - H2 "Create a Social Media Post with a Few Lines of Code". The tabs are Node.js, cURL, Python, Go, PHP, Ruby and C#. CTA: "Try Ayrshare free".
  - H2 "The Foundational Layer for AI Content Agents". Its H3s: "History API", "Publishing API", "Analytics API" and "Domain Guardrails". CTA: "See the AI builder Guide".
  - H2 "API First. More Than Publishing". Its cards: "Send Analytics and Metrics", "User History", "Reflect Management", "Analytics API", "Test History", "Inspection", "Webhooks", "One Brand From", "Packaging", "Comment Management" and "AI-Ready Messaging".
    - Measured: several of these card titles are broken copy. "Reflect Management", "Test History" and "One Brand From" don't match their body text, and "One Brand From" repeats the "Comment Management" body word for word. This looks like a sloppy edit, not a strategy.
  - H2 "10,000+ Teams Use Ayrshare". CTA: "See all customers".
  - H2 "Start Building in Minutes". CTAs: "Get started now" and "Book A Demo".
- Proof shown on the home page (measured):
  - Testimonials:
    - Jason G., "Advisory Consultant • Enterprise (> 1000 emp.)". This reads like a G2-style review quote.
    - Vedant Maheshwari, CEO of Quso.ai: "4M+ publish calls across seven platforms … since 2022".
    - Diaa N., "Senior Backend Developer • Computer Software".
    - "Digible, Agency · multi-property platform".
  - Logos: the logo strip has no names, only alt text "Ayrshare customer". There are "Official platform partner badges".
  - Case studies: /case-study/ has 2 detail pages (Curbfeed, vidyo.ai) and 6 category pages. (measured, sitemap)

### Pricing: https://www.ayrshare.com/pricing/ (measured, lastModified 2026-11-10)

- H1: **"Ayrshare Pricing"** with the line "Built for Products, Not Seats". `<title>`: "Ayrshare Pricing: Built for Products, Not Seats · Ayrshare"
- Subhead: "Embed the Ayrshare Social Media API into your product and pay for active social profiles, not users, seats, or internal team members. As your customers connect social accounts, your usage grows with them. When a customer churns, your costs go back down."
- CTAs: "View plans", "Estimate your cost", "Start free trial", "Get started", "Contact sales" and "Book A Demo".
- Headings:
  - "One Social Profile: As Many Social Networks as You Need"
  - "Start Where You Are Today. Scale When You Need To"
  - "Compare Every Plan Side by Side"
  - "Estimate Your Monthly Cost in Seconds"
  - "Add Extra Capacity When You Need It"
  - "Infrastructure You Don't Have to Build or Maintain"
  - "Ayrshare Pricing, Explained Plainly" (the FAQ)
  - "Ship Social Features in Days, Not Quarters"
- Stat strip: "30M+ Daily API calls · 99.99% API uptime · 14+ Social media networks · AI-Native".
- Body copy adds "Over 50,000 posts per day". The About page says "20K/day — Social posts published" and "4 years — Platform live in production" (measured). Their own figures don't agree with each other.
- The page links "See machine-readable pricing (for AI agents)" → https://www.ayrshare.com/pricing.md (measured).

### Other main landing pages: `<title>` and H1 (all measured 2026-11-12)

| URL | `<title>` | H1 |
|---|---|---|
| /social-media-publishing-api/ | Social Media Publishing API: Post to 14+ Networks in One Call | "The social media publishing API: one call, 14+ networks" |
| /ai-agent/ | Ayrshare for AI Agents: The Social Media API for AI Agents | "The full Social Loop, inside your AI Agents" (stats: "27 — MCP tools", "Every post — validated before it ships") |
| /connect/ | Ayrshare Connect: social account linking inside your app | "In-App Social Connections, Embedded in Your UI" |
| /business-plan-for-multiple-users/ | Business Plan: Integrate social media APIs into your platform | Integrate Social Media APIs Into Your Platform |
| /enterprise/ | Enterprise Social Media API: Compliant, Reliable, Proven at Scale \| Ayrshare (the brand is doubled in the live `<title>`) | Enterprise-Grade Social Infrastructure. |
| /use-cases/saas-platforms/ | Ayrshare for SaaS Platforms: Embedded Social Media API | Embedded Social Media API for SaaS Platforms |
| /use-cases/ai-startups/ | Ayrshare for AI Startups: The Social Media API for Content Agents | Social Media API for AI Agents and AI Startups |
| /use-cases/digital-agencies/ | Ayrshare for Digital Agencies: White-label Social Media API | White-Label Social Media API for Agencies |
| /history-api/ | History API: Retrieve Every Past Post in One Call | Every Past Post, One API Call |
| /social-media-analytics-api/ | Social Media Analytics API: real-time data across 14+ networks | Social Media Analytics API |
| /social-media-messenger-apis/ | Social Media Messenger APIs: FB, IG & X | Social Media Messaging API |
| /install/ | Install Ayrshare Using AI: One-Prompt Integration | Install Ayrshare using AI |
| /supported-networks/ | Supported Social Networks: 14+ Networks, One API (the `.md` mirror's title is "Supported Networks") | Supported Social Networks: One API for 14+ Networks |

The `/ai-agent/` section headings are:

- "Publishing is where your agents often break"
- "Four things an agent does, in one API" (Learn / Act / Observe / Stay Safe)
- "From a single agent to thousands of client accounts"
- "Connect Any MCP Client, or Call the REST API Directly"
- "Two Commands From Install to Published"

(measured)

## 3. Pricing (sourced: https://www.ayrshare.com/pricing/, checked 2026-11-12)

The billing unit is the **"social profile"**: one customer, brand or location, with any number of networks. Billing is **not** per seat or per post, but it is not per organization either. "A franchise with 10 locations posting independently counts as 10 different profiles." Billing uses "the peak number of active profiles in each monthly cycle."

| Plan | Monthly | Yearly (per month, from the page's yearly toggle data) | Profiles | Accounts | Notes |
|---|---|---|---|---|---|
| **Premium** | $149 | $129 | 1 | "Up to 14 social accounts across 14 networks" (comparison table: "Up to 13") | Single user. Basic analytics, comment moderation, 24/7 email support. No webhooks, no history. Max Pack "Not offered". The comparison table marks FB/IG/Google ads "Included" on Premium but "Not offered" on Launch |
| **Launch** | $299 | $249 | Up to 10 (hard cap) | Up to 140 (table: 130) | "For MVPs and beta testing". Multi-user posting, history, advanced analytics, expanded rate limits, "Custom branding options", webhooks, email + chat support. **28-day free trial**, the only trial |
| **Business** ("Most Popular") | $599 base (30 profiles) | $499 base | 30 included, tiered to 300 | Up to 420 (table: 390) | FB, Instagram and Google ads included |
| **Enterprise** | Custom | Custom | From 300 | "Up to thousands" | Dedicated AM, Max Pack included, private hotline, "advanced security & compliance". FAQ: X/Twitter real-time webhooks are Enterprise |

The page's yearly toggle says "Save 17%". The yearly figures come from the page's embedded plan data (`priceYearly`), so they are measured.

**Business profiles above the 30 included** (sourced, same page):

| Profiles | Monthly, per profile | Annual, per profile |
|---|---|---|
| 31–100 | $8.99 | $7.99 |
| 101–500 | $3.49 | $2.99 |
| 500+ | $2.49 | $1.99 |

The FAQ says Enterprise brings the rate to "approximately $1 per profile per month". The page's own calculator example is 100 profiles = **$1,228/month**, or "$12.28 per profile".

**Add-on: Max Pack, $300/month.** It is paid on Launch and Business and included on Enterprise. It "unlock[s] maximum posting limits and advanced features". The docs say it is also needed for full custom CSS, favicon, title and footer on the connect page (measured: /docs/multiple-users/business-plan-overview).

**Messaging API (DMs):** included with Business plans and "a paid add-on for Premium" (measured: /docs/apis/messages/overview). No add-on price is shown.

**Free tier: none.** In their own words: "Ayrshare does not have a free plan, but its Launch plan includes a 28-day free trial" (measured: /compare/). A vendor reply on Slashdot dated 2023-10-12 says "our Basic Free plan" (sourced: https://slashdot.org/software/p/Ayrshare/). My inference is that the free plan was dropped since then. Third-party roundups still repeat the old free tier: Buffer's 2026 roundup says "free tier is limited to image posts and 20 posts per month" (sourced: https://buffer.com/resources/best-social-media-apis/, dated 2026-05-28).

**Posts and overage:** "Every plan includes unlimited API calls and unlimited posts", "within API and platform limits". No per-post overage is listed. The only overage is per profile on Business.

**X (Twitter):** bring your own X developer app. The customer pays X directly ("you still bring your own X app and credits"). (measured: https://www.ayrshare.com/x-twitter-api/)

**Rate limit:** "300 requests per 5 minutes per user profile". Ayrshare states this about itself on its bundle.social comparison page (measured).

### Siar against these numbers (from `docs/pricing.md`, inferred arithmetic)

| Need | Ayrshare (monthly) | Siar (USD, monthly) |
|---|---|---|
| Try it | 28-day Launch trial (the trial link goes to a billing.ayrshare.com checkout; whether a card is required is **unverified**) | 20 free posts to try (one-time, no card), or the 14-day Pro trial (by card, once per organization) |
| 1 brand | $149 Premium | $19 Starter (300 posts/mo) |
| 10 brands | $299 Launch | $49 Pro (10k posts/mo) |
| 30 brands | $599 Business | $149 Business (unlimited brands, 100k posts/mo) |
| 100 brands | $1,228 (their calculator) | $149 Business |

Honest caveat: Siar caps posts per month and Ayrshare says posts are unlimited. A product that posts more than 100k times a month per organization is a different calculation, and it goes to Siar Enterprise. X costs sit outside the base price at both.

## 4. Networks and API features

### Networks (measured: https://www.ayrshare.com/supported-networks/, lastModified 2026-11-03)

"14+": Facebook (Pages only), Instagram (Business/Creator), X, LinkedIn (company pages **and** personal profiles), TikTok ("Posts go out public on Ayrshare's audited app"), YouTube, Pinterest, Reddit, Threads, Bluesky, Snapchat (Public Profiles), Telegram, Google Business Profile, and WhatsApp. WhatsApp is "Messaging only… Available in beta"; the docs call it "Private Beta". That makes 13 publishing networks plus one messaging channel.

**What they lack:**

- No Mastodon, Discord or Slack. Their own bundle.social page says: "Discord and Slack | Not supported" and "If your product needs Discord, Slack, or Mastodon, plan a separate integration" (measured).
- No Tumblr or Medium.

**Where Ayrshare is ahead of Siar today** (Siar status from `docs/approvals/README.md`, checked 2026-11-12). Ayrshare publishes live to:

- TikTok with an audited app (Siar's TikTok audit was rejected 2026-10-20)
- YouTube (Siar: in audit)
- Pinterest (Siar: trial, publishing needs Standard)
- LinkedIn company pages (Siar: CM API denied)
- Reddit, Snapchat and Google Business Profile (Siar: parked)
- Telegram and WhatsApp (Siar: not built)

Siar's live-network advantage is limited to Mastodon, Discord and Slack.

### API features

| Feature | Ayrshare | Source (all measured 2026-11-12 unless noted) |
|---|---|---|
| REST API | Yes. Docs on Mintlify with 311 pages per locale in 8 locales | /docs/sitemap-*.xml |
| SDKs | Official: Node.js (npm `social-media-api`), Python (`social-post-api`), Flutter. The home page also claims Go and a CLI. Code samples: Node, cURL, Python, Go, PHP, Ruby, C#. No-code: Bubble, Make, n8n, Airtable, Notion, FlutterFlow, Retool, WordPress | /docs/packages-guides/overview, home |
| MCP | **Hosted** "Action MCP" at `https://api.ayrshare.com/mcp` (Streamable HTTP, stateless). Landing page says "27 MCP tools"; docs say "33 tools". There is also a read-only docs MCP and an official Claude Code plugin (github.com/ayrshare/ayrshare-social-media-api-claude-plugin). Profiles and sub-profiles over MCP need Business | /docs/additional/mcp-action-server, /ai-agent/ |
| Webhooks | Per action, per profile, retried for about 16 hours with `hookId`. HMAC-SHA256 is **optional**, with one secret per profile. X real-time webhooks are Enterprise | /docs/apis/webhooks/overview, /pricing/ FAQ |
| White-label OAuth | Three surfaces: embedded "Connect" frames, your own button + popup, or a hosted linking page with your logo and colours (JWT URL). Full CSS, favicon and footer need Max Pack ($300/mo). Profiles only on Launch and above | /connect/, /docs/multiple-users/business-plan-overview |
| Analytics | Post- and account-level, "one schema". "Basic" on Premium, "Advanced" on Launch and above | /pricing/, /social-media-analytics-api/ |
| Comments | Read, reply, moderate; plus reviews (Facebook, GBP) | /supported-networks/, /docs/apis/comments |
| DMs | Facebook Messenger, Instagram, X DMs, WhatsApp (private beta). Paid add-on on Premium | /docs/apis/messages/overview |
| Other | History API (200–500 past posts per profile, including posts made outside Ayrshare), Validation API (banned hashtags, duplicates, limits), approval workflows, idempotency keys, auto-schedule, ads (30 doc pages under /docs/apis/ads), RSS feeds, link shortener, hashtags, "listen", GraphQL, AI generate | /social-media-publishing-api/, docs sitemap |

## 5. SEO footprint

### Size (measured from the sitemaps listed in https://www.ayrshare.com/robots.txt, 2026-11-12)

| Sitemap | URLs |
|---|---|
| /sitemap.xml (marketing + blog) | **273** |
| /sitemap-ai.xml (a `.md` mirror of each page, for AI crawlers) | 262 |
| /docs/sitemap-{en,ar,de,fr,ja,pt-BR,zh-Hans,zh-Hant}.xml | 311 × 8 = **2,488** |
| /llms.txt (30 KB) and /llms-full.txt (2.57 MB) | — |

### The 273 marketing URLs by type

| Type | Count | Notes |
|---|---|---|
| Blog posts `/blog/…` | 161 | Includes 4 category pages and the index. Lastmod dates are all 2026-06 to 2026-10 (none in November; corrected), which suggests a re-save or migration rather than new writing (inferred). Topics: per-network how-tos ("TikTok API: how to post…", "Instagram Reels API…"), roundups ("Top 14 Social Media APIs for Developers (2027)", "Best Social Media Posting and Scheduling APIs of 2027"), no-code tutorials, Firebase engineering posts, plus off-topic SEO filler (hashtag guides, "What is social media", demographics) |
| Comparison pages `/compare/…` | 26 | 1 hub + 25 head-to-heads. API rivals: **bundle.social**, Zernio (ex-Late), Upload-Post, Outstand, Mallary, Blotato, Postproxy, SocialAPI.ai, Postiz. Tools: Buffer, Hootsuite, Sprout, Later, Metricool, SocialPilot, Sendible, Loomly, Zoho, Publer, Cloud Campaign, SocialOomph. "Different job" APIs: Twilio, Phyllo, OneAll, Data365. There is no Siar page |
| Error-fix pages `/solutions/…` | 30 | Hub "Social Media API Error Fixes" + 29 pages such as "YouTube API 403 Quota Exceeded: Bypass the 10k Limit", "Instagram Graph API Error 9: the 25-post daily limit", "TikTok API error 10001", "LinkedIn API error 401 invalid grant", and v1→v2 migration guides. This is the same idea as Siar's `/[api]/errors` pages |
| Per-network API landing pages | 11 | /facebook-api/, /instagram-api/, /x-twitter-api/, /linkedin-api/, /tiktok-api/, /youtube-api/, /threads-api/, /bluesky-api/, /snapchat-api/, /telegram-api/, /google-business-profile-api/. No Pinterest, Reddit or WhatsApp landing page |
| Feature pages | 7 | /social-media-publishing-api/, /social-media-analytics-api/, /social-media-analytics-metrics/, /social-media-messenger-apis/, /history-api/, /creator-data-api/, /connect/ |
| Use cases / case studies | 5 / 9 | Case studies: hub + 6 category pages + 2 detail pages |
| Integrations | 7 | Bubble, Hurl, Notion, Oracle, PyPI, WordPress + hub |
| Free tools | 2–3 | /instagram-banned-hashtag-checker/, /video-probe/ ("the free video metadata inspector"), and a character-counter blog tool |
| Glossary | 0 | No glossary section |
| Programmatic pages | none at scale | /solutions/ is the closest: a template-like error-fix series |

### Keyword targets inferred from titles and H1s (inferred)

- **Per-network "API" heads with commercial modifiers.** Titles follow the pattern "<Network> API: Access, Pricing & Posting", for example "Instagram API: Access, Pricing & Publishing", "Twitter API (X API): Pricing, Access & Posting" and "YouTube API: Uploads, Quotas & Pricing". Targets: "instagram api", "instagram api pricing", "is the instagram api free", "how to get instagram api access". Each page ends with a FAQ of exactly those questions, for example "Is the Instagram API free?" and "Can I post Instagram Reels through an API?".
- **Category heads:**
  - "unified social media api" (home `<title>`)
  - "social media publishing api"
  - "social media analytics api"
  - "social media messaging api"
  - "social media api for AI agents"
  - "white-label social media api" (agencies)
  - "embedded social media api" (SaaS)
- **"<rival> alternative" and "<rival> API alternative"**, for example "Bundle.social Alternative for Developers", "Upload-Post Alternative: Ayrshare vs. Upload-Post", "Zernio Alternative". Also "does Buffer have an API" and "What happened to the Buffer API?".
- **Error-code long tail**: "youtube api 403 quota exceeded", "instagram api error 100", "tiktok 429".
- **Roundups with a bumped year**: "Top 14 Social Media APIs for Developers (2027)". The post was updated 2026-10-13 and first published 2025-02-20 (sourced: the post itself). It reviews network APIs, not rivals.
- **Brand-defence pages**: /blog/ayrshare-reviews/ and "When to Use Ayrshare (and When Not To)".

### Demand evidence (inferred from measured Google autocomplete, 2026-11-12)

- "ayrshare" suggests: api, pricing, **alternatives**, login, api key, ayrshare_api_key, **mcp**, plans, ayrshare-ig. (Re-measured 2026-11-12; "docs" and "github" did not appear.)
- "ayrshare p…" suggests: pricing, plans, profile, premium, api pricing, **free plan**, business plan, basic plan, **vs postiz**.
- "ayrshare alternative" suggests: alternatives, **alternatives reddit**, api alternatives, **open source alternative**.
- "ayrshare v…" suggests: vs, vs postiz, **zernio vs ayrshare** (plus two unrelated place queries).
- "ayrshare free" suggests: free plan, free, **free alternative**, free trial.
- "social media api" suggests: free, github, late, integration, for developers, open source, aggregator.

Reading of this:

- People search for Ayrshare by brand, and price and alternatives are the main modifiers.
- "free plan" and "basic plan" still show up, so people are looking for a cheap entry that no longer exists.
- At least 12 rival pages target "Ayrshare alternatives" (**unverified on re-check**: the verification pass could not re-run these searches because the shared search budget was used up; only the SocialAPI.ai page was re-opened and confirmed). Listed by the original pass: Zernio, Outstand, Upload-Post, SocialAPI.ai (2 pages), Data365, WoopSocial, getsocialclaw, posteverywhere.ai, ryandoser.com, zilfu.app, and a Medium post.
- So the term has real demand, but competition for it is crowded. That is inferred; no volume data is available.

### Backlink and authority signals

- **GitHub**: the ayrshare org has 15 repos. `social-media-api` (Node SDK) has 350★ and 51 forks; `social-post-api-python` has 47★; the Claude Code plugin has 21★, last pushed 2026-11-10. (measured: GitHub API)
- **npm** `social-media-api`: **30,286 downloads** from 2026-10-12 to 2026-11-10. (measured: api.npmjs.org)
- **PyPI** `social-post-api`: 6,591 downloads in the last month. (measured: pypistats.org)
- **pub.dev**: a verified publisher, ayrshare.com, for Flutter (sourced: search result https://pub.dev/publishers/ayrshare.com).
- **Roundups that list and link Ayrshare** (sourced, third-party):
  - Buffer: https://buffer.com/resources/best-social-media-apis/ calls it "the longest-running API-first player in this space" and links ayrshare.com.
  - Blotato: https://www.blotato.com/blog/best-social-media-api-tools
  - Upload-Post: https://www.upload-post.com/best-social-media-apis/
  - postplanify: https://postplanify.com/blog/best-social-media-apis-for-developers
  - apiscout: https://apiscout.dev/guides/best-social-media-apis-2026
  - dev.to: https://dev.to/perufitlife/9-social-media-posting-apis-compared-by-price-october-2026-read-from-each-pricing-page-509b
  - Nearly all of these are written by rivals, and most of them carry stale Ayrshare facts.
- **Review sites**:
  - Trustpilot: 4.1, from 5 reviews, all 5-star. Trustpilot notes "This company hasn't invited customers recently, so reviews may not be representative." (sourced: https://www.trustpilot.com/review/ayrshare.com)
  - Slashdot / SourceForge: 3.4/5 from 5 reviews (sourced: https://slashdot.org/software/p/Ayrshare/).
  - G2 "Ayrshare API": 3.9/5 from 7 reviews. This figure comes from a search snippet; the page returned 403 to me, so it is **unverified** (https://www.g2.com/products/ayrshare-api/reviews).
  - Capterra / GetApp: 5.0 from 4 reviews, also from a search snippet and **unverified**.
  - Profiles also exist on alternativeto.net, apitracker.io, stackreaction and softwarereview.com (sourced: search results).
- **Product Hunt**: I found no official Ayrshare launch page. Founder Geoff Bourne has a Product Hunt profile with one featured hunt (sourced: https://www.hunted.space/hunter/geoffbourne), so this is **unverified**.
- **AI-crawler stance** (measured: robots.txt): explicitly allows (`Allow: /`) GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bingbot, CCBot and meta-externalagent. It also points them at /sitemap-ai.xml, /llms.txt and /llms-full.txt. Ayrshare invests in GEO deliberately.

## 6. Weaknesses: user complaints and gaps Siar can use honestly

### Complaints (sourced)

The evidence is thin. Review volume is small (5–7 reviews per site) and most complaints are from 2023. Treat them as signals, not proof.

- **Price.** A 1★ review, 2023-10-11, Python developer: "Extremely expensive", "Very restrictive plans and incredibly high prices", "Very poor API design", and integration data removed after one late payment. A 2★ review, 2023-04-14, CTO: "Astonishingly bad customer experience", an account ban with "No explanation, no responses" (the reason is not stated; "over a post" was unverified and is removed), and reinstatement offered only at "over 6x higher price". (https://slashdot.org/software/p/Ayrshare/)
- **"Extremely expensive" / "very restrictive plans and incredibly high prices"** are quoted as recurring G2 and Capterra themes by a **rival** (SocialAPI.ai: https://social-api.ai/blog/best-ayrshare-alternative-agencies-2026, which says reviewers mention them "repeatedly"). Unverified on G2/Capterra (G2 returns 403). Both phrases appear word for word in the single 2023-10-11 Slashdot review above, so "recurring" may rest on one reviewer posting across sites (inferred).
- **Reddit**: a third-party summary says Reddit users mention a "too pushy permission policy, lack of tagging automation, and being too pricey" (sourced: https://medium.com/@frankheijdenrijk/i-tested-some-ayrshare-alternatives-heres-what-i-found-out-1fca00c104d3). **Unverified.** reddit.com, old.reddit and the PullPush archive all refused my requests, so I found no Reddit thread directly. "ayrshare alternatives reddit" is a live autocomplete, so the threads probably exist (inferred).
- **Positive themes to respect**: reliability, documentation, ease of integration, and 24/7 support (Trustpilot, Slashdot 4–5★, home-page quotes).

### Gaps in their own pages (measured)

- **Their own numbers disagree**:
  - Posts per day: "Over 50,000" on /pricing/ against "20K/day" on /about-ayrshare/.
  - MCP tools: 27 on /ai-agent/ against 33 in the docs.
  - Premium accounts: 14 against 13. Business accounts: 420 against 390.
  - Ads: "Included" on Premium but "Not offered" on Launch.
  - Broken H3 copy on the home page ("Reflect Management", "One Brand From").
- **"Minimum of 10 or 30 social profiles" FAQ answer**: this contradicts the "Up to 10" wording for Launch. The comparison table also gives Business "11 to 300 social profiles" while the plan card says "30 social profiles included".

### Gaps Siar can exploit honestly (inferred, each backed by the code or docs named)

1. **Entry price and the missing free plan.** Ayrshare starts at $149 for one profile, and its only trial is on Launch ("Premium, Business, and Enterprise are billed at signup (no free trial)", measured /pricing/); whether the trial needs a card is unverified. Siar has 20 free posts to try (one-time, no card), Starter at $19 (RM39), and Pro at $49 for 10 brands. "ayrshare free plan" and "basic plan" are live searches, so the demand exists. (`docs/pricing.md`)
2. **The billing unit.** Ayrshare bills per profile, which means per customer or location: 100 profiles is $1,228/mo by its own calculator. Siar bills per organization, with unlimited accounts on every plan and unlimited brands on Business at $149. That is the cleanest single line against Ayrshare. Siar's post caps must be stated next to it.
3. **Multi-tenant for less.** Ayrshare's Premium is single-user with one profile; multiple profiles start at $299 (Launch). Siar's Starter is 1 brand; multiple brands start at Pro, $49 (RM99) for 10, and Business is unlimited (`docs/pricing.md`). (Corrected: the earlier line said Siar has multiple brands from Starter.)
4. **Networks Ayrshare refuses**: Mastodon, Discord and Slack are live on Siar. Ayrshare's own page tells buyers who need them to "plan a separate integration".
5. **Branded connect link on every plan (weak point, use with care).** Siar's hosted connect link shows your brand name, logo and accent colour, but it is on app.siaran.my with a "Powered by Siar" footer, and the `language` field is stored but not used (English only) (`siar-truth.md`, `Portal.vue` line 96, `accounts.ts` line 235). So Siar is **branded, not white-label**. Ayrshare's base connect page already allows logo, custom headers, network choice, language and help links; Max Pack ($300/mo) adds full CSS, favicon, title and footer (measured: /docs/multiple-users/business-plan-overview). Do not claim Siar beats Ayrshare on white-label.
6. **Webhooks signed by default.** Siar has 16 event types, all HMAC-signed (`docs/geo/facts.md`). Ayrshare's HMAC is optional and uses one secret per profile.
7. **Rate limits.** Siar allows 100/s, 500/10 s and 2,000/min per key and endpoint. Ayrshare publishes 300 requests per 5 minutes per profile.
8. **Price lock.** The 2023 complaints name price increases. Siar's subscription "renews at the price it started at" (`billing-core.ts`).
9. **Malaysia.** Ringgit prices, FPX or DuitNow pay-once for yearly, and a Malaysian company. Ayrshare is USD-only (measured: no currency switch on /pricing/).
10. **bundle.social switchers.** Ayrshare's comparison page targets bundle.social's customers. Siar speaks bundle.social's v1 API as of October 2026, so a bundle app moves by changing its base URL. Caveats (`siar-truth.md` section 4): 3 operations in bundle.social's current spec are missing in Siar, so say "compatible with the v1 API as of October 2026", not "100%"; and naming bundle.social on the site is a parked owner decision. Ayrshare's own migration advice says the opposite: map calls and reconnect users.

### Where Ayrshare is genuinely stronger (don't contest these)

- Approved and live on TikTok, YouTube, Pinterest publishing, LinkedIn Pages, Reddit, Snapchat, Google Business Profile, Telegram and WhatsApp (beta).
- A hosted MCP server, 33 tools per its docs. Siar's `@siar/mcp` is a local stdio server with 19 tools (`packages/mcp/src/server.ts`), and it is not published on npm yet (404 on registry.npmjs.org, per `siar-truth.md`).
- History API (200–500 posts), Validation API, ads, Python and Flutter SDKs.
- Founded 2020 (their About page also says "4 years — Platform live in production"), 10,000+ teams (their claim), and saas.group backing.
- A content library about 30× larger than Siar's: 2,761 sitemap URLs against Siar's 87 (measured in the 2026-10-13 baseline).

### Risk to check before any Siar comparison page: X

Ayrshare's post "BYO X App Explained" (CEO Marc Blinder, 2026-05-15, https://www.ayrshare.com/blog/x-api-compliance-byo-app/) argues the following. Since 2026-03-31, X made bring-your-own-app "the only compliant way for a third-party social media API to reach X": its Developer Agreement bans use of the X API "on a service bureau, rental or managed services basis", and per the post "One app serving many tenants is a violation." (measured). The argument is about one shared app serving many customers, not about how X usage is billed.

- Siar today runs one "Siar" X app for all organizations and passes usage through from a prepaid credit (`docs/approvals/x.md`, `domain/credits.ts`). The shared app is the part the post attacks; the credit billing is secondary.
- Ayrshare's bundle.social page uses this against the same model: "Bundle.social bills X usage separately through credits. Ayrshare uses your own X developer app."
- I have not checked X's own terms; this is Ayrshare's reading. **Fakhrul should read X's current Developer Agreement and Policy before Siar markets its X pass-through.** Until then, a `/compare/ayrshare` page should not present X credits as an advantage.

## 7. Positioning line

**Siar is the social media API you pay for per business, not per customer profile. Every plan connects unlimited social accounts, from $19, or RM39 in Malaysia, with 20 free posts to try. Ayrshare starts at $149 for a single profile.** (Corrected: the earlier line said "15 networks in code" and "bundle.social apps switch by changing one URL"; the first over-claims networks on a public line and the second names bundle.social, which is a parked owner decision.) Network claims on public pages must stay limited to what is approved live (see `docs/approvals/README.md`).
