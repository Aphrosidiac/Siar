Verified 2026-11-12: 13 corrections

# Competitor teardown: Upload-Post (upload-post.com)

> **Verification note (2026-11-12, adversarial pass).** I re-fetched every vendor page and doc cited here (pricing, pricing.md, pricing-comparison, home, llms.txt, legal notice, whitelabel, reviews, robots, sitemap, docs limits/webhooks/TikTok-cap/rate-limits/openapi), the GitHub API (stars, repos, all 11 issues/PRs), npm and PyPI stats, Google autocomplete, the MCP Registry, Buffer, Ayrshare, bundle.social, AlternativeTo and Slashdot, and the Siar code and `siar-truth.md`. Prices, plan limits, caps, rate limits, webhooks, OpenAPI counts, titles/H1s, sitemap counts and quotes all matched. **I could not re-run web searches** (the session's search budget was used up), so every "who ranks" / "what search shows" claim below is now marked **unverified**. Corrections are tagged *[corrected 2026-11-12]*.

Checked 2026-11-12. Every claim is labelled:

- **measured**: I fetched the page or file myself on 2026-11-12. That covers raw HTML, the sitemap, `llms.txt`, `pricing.md`, the docs' `.md` pages and `openapi.json`, the GitHub API, npm and PyPI download stats, and Google autocomplete.
- **sourced**: from a third-party page, with its URL.
- **inferred**: my own reading, arithmetic or estimate.

Upload-Post facts come only from upload-post.com and docs.upload-post.com. Third-party claims are marked as such. Siar facts come from `docs/seo/research/siar-truth.md` and `docs/pricing.md`.

Builds on `docs/geo/plan.md` (P3 comparison pages), `docs/geo/brief.md` (Upload-Post is on the competitor list) and `docs/pricing.md`. `pricing.md` cites https://www.upload-post.com/pricing-comparison as "$16–147", checked 2026-10-13. That range is now out of date: the top plan is $438/month (see section 3).

---

## 1. Who they are

- Legal entity: **TONVI TECH SL**, Calle Puerta del Mar 18, 5th floor, 29005 Málaga, Spain. (measured: https://www.upload-post.com/legal-notice/)
- "Founded: January 2025". Founder: Víctor Cavero (@vcaverog). "Upload-Post has no X/Twitter account of its own." (measured: https://www.upload-post.com/llms.txt) Testimonials also name Manuel Gracia as a founder and Juan Carlos as staff (measured, home page).
- Product Hunt launch: 12 May 2025. The maker's comment says Ayrshare was too expensive for a solopreneur. (sourced, via search summary of https://www.producthunt.com/products/upload-post/launches. Product Hunt returned 403 to a direct fetch, so this is unverified)
- Autocomplete offers "upload post malaga" (measured), which fits the Spanish entity.
- Main angle: **cheap, flat-price uploads for creators and automation builders** (n8n, Make, AI agents), with a "you never create a developer app" pitch. The API is the product, and a scheduler dashboard sits on top. (inferred from home, pricing and llms.txt)

## 2. Positioning and copy

### Home page (measured: https://www.upload-post.com/, 2026-11-12)

- `<title>`: "Social Media API - Post Everywhere Easily | Upload-Post"
- Meta description: "Social Media API to post on TikTok, Instagram, YouTube & 19 more platforms. One API call, all networks. Free tier, Python & JS SDKs. Used by 100k+ users."
- Eyebrow above the hero: "Join +111,142 creators already growing with us!"
- **H1:** "Social Media API" / "One Call, Every Platform"
- **Subhead:** "Social Media Posting API for TikTok, Instagram, YouTube & 19 more platforms. One API call, all networks. Free tier, Python & JS SDKs. Use it as a tool for Claude, ChatGPT or any AI agent."
- Primary CTA: "Create your free account". Under it: "Compatible with any AI agent" and "No credit card required · 15-day money-back guarantee · Cancel anytime". The nav CTAs are "Try for free" and "Add to your SaaS".
- The hero shows a terminal with a `curl` call to `api.upload-post.com/api/upload` that posts to TikTok, Instagram and YouTube, and a `200 OK` JSON response.
- Section headings, in page order (H2 with their H3s):
  - "Scaling with You"
  - "Sharing should be easy" ("Manual uploads are slow", "Too expensive", "Social media APIs are a pain", "Hard to use")
  - "No developer app. No tokens. Two clicks." ("Click Connect", "Accept in the popup", "Post through the API")
  - "Trusted by Creators and Businesses"
  - "Key Features" ("One-Click Upload", "API Integration + Analytics", "ChatGPT Ads", "Secure and Private")
  - "How it works" ("Create Account", "Connect Social Media", "Start Uploading", "Go Multi-Platform")
  - "Easy Integration with Automation Tools" ("N8N Integration", "Make Integration", "MCP Server", "Claude Code Skill", "Trusted across the builder ecosystem")
  - "Share Across All Platforms"
  - "Real Growth, Real Results"
  - "Predictable pricing"
  - "The Community Trusts Upload-Post"
  - "Use Cases" (agencies, creators, e-commerce, education)
  - "Your Views Stay Strong"
  - "Built for Platform Compliance" ("What can get you banned", "How we keep you safe")
  - "Frequently Asked Questions"
  - "Supported Platforms" (22 cards)
  - "Get in Touch"
- Other CTAs on the page: "Connect your first account", "Post everywhere for free", "Start Posting for Free", "Create Free Account", "Start for Free", "Start Growing for Free", "Try It Free", "See all reviews", "Leave a review", "View Integration Guide", "Explore Our API Documentation", "Watch All Tutorials".

**Proof they use (all measured on the home page. These are their own claims, and none is independently verified):**

| Proof | What the page shows |
|---|---|
| Counters | "Total Posts Uploaded 13,190,556+", "Active Users 111,142+", "Supported Platforms 22", "112 reviews 4.9/5" |
| Customer names (logo strip) | Prof Quiz, Diario Financiero, REC3, Carter Wells, Digitalkin AI, Daniel Hanson, dr.painkill, Estoicismo.net. Each links to a case study under /customers/ (8 stories) |
| Testimonials | Named quotes from founders and CEOs (Teknoviar, Flockly, Weathered Bell Press, PickaPoint, FoodIntake, Referpulse and others), plus 3 video testimonials. Most praise the founders' personal support and the price |
| Builder-ecosystem stats ("Figures from n8n.io and GitHub, November 2026") | "1M+ views on the 50+ n8n workflow templates built with Upload-Post", "Verified node", "168K ★ GitHub stars on the open-source projects that ship with Upload-Post built in" (MoneyPrinterTurbo 140.7K, video-shotcraft 17.6K, autoclip 10.1K) |
| Directories | "Listed in ChatGPT's app directory and in Claude's connector directory", "Also on the official MCP Registry". The MCP Registry listing is real: `com.upload-post/mcp`, remote `https://mcp.upload-post.com/mcp` (measured: https://registry.modelcontextprotocol.io/v0/servers?search=upload-post, 2026-11-12). The ChatGPT and Claude directory listings are unverified |
| Press quote | "Upload-Post is one of the strongest newcomers." attributed to Buffer's roundup. That quote is real (sourced: https://buffer.com/resources/best-social-media-apis/, published 2026-05-28) |
| YouTube creators | Six embedded tutorials by third-party channels (Chase AI 183K subscribers, Calvin Hia and others) showing n8n + Upload-Post builds |
| Anonymous growth | "Real Growth, Real Results": follower gains "from real accounts" kept anonymous, plus a public /leaderboard/ |

I checked the MoneyPrinterTurbo claim myself. The repository harry0703/MoneyPrinterTurbo has 142,537 stars and ships `app/services/upload_post.py`. Its `config.example.toml` says "Upload-Post can publish generated videos to TikTok, Instagram, and YouTube." (measured: GitHub API and raw file, 2026-11-12)

### Main landing pages: `<title>` and H1 (all measured 2026-11-12)

| URL | `<title>` | H1 |
|---|---|---|
| /social-media-api/ | Unified Social Media API for Developers: 22 Platforms | Unified Social Media API for Developers |
| /pricing/ | Upload-Post Pricing: Free Plan, Then $24/month (2026) | Upload-Post pricing |
| /pricing-comparison/ | Upload-Post Pricing vs Ayrshare, Blotato & More (2026) | Upload-Post pricing vs Ayrshare, Blotato & alternatives |
| /mcp/ | Social Media MCP Server for Claude, ChatGPT & Agents | Social Media MCP Server Connect ChatGPT, Claude & any AI agent |
| /ai-agents/ | AI Social Media Agent: MCP, Skills & API | Give Your AI Agent Social Media Superpowers |
| /whitelabel/ | White Label Social Media Management for Agencies | White Label Social Media Management for Agencies and SaaS |
| /social-media-analytics-api/ | Social Media Analytics API for Instagram, TikTok, YouTube | Social media analytics API Instagram, TikTok, YouTube and 8 more |
| /social-media-scheduler/ | Social Media Scheduler: Free Plan, 22 Networks | Social Media Scheduler One calendar, 22 networks, every account you run |
| /platforms/tiktok/ | TikTok Upload API: Post & Schedule Videos, No App Review | TikTok Upload API Upload & Schedule Videos, Photos and Carousels |
| /tiktok-api/ | TikTok API Guide (2026): Content Posting API & Keys | TikTok API Content Posting API, keys, audit and limits in 2026 |
| /instagram-api/ | Instagram API in 2026: The Complete Developer Guide | The Instagram API in 2026 Setup, tokens, publishing Reels and carousels, limits and errors |
| /best-social-media-apis/ | Best Social Media APIs for Developers (2026 Comparison) | The Best Social Media APIs for Developers in 2026 |
| /bundle-social-alternative/ | Bundle.social Alternative: Flat $24/mo Plans | The Flat-Price bundle.social Alternative $24/month instead of a $100 first step |
| /ayrshare-alternative/ | Ayrshare Alternative - The Smart Choice | The Smart Ayrshare Alternative $24/mo vs $149/mo. White Label from $50/mo |
| /customers/ | Customer Stories: How Teams Publish at Scale with Upload-Post | What people actually build on the API |
| /reviews/ | Upload-Post Reviews: Rated 4.9/5 by Creators | Loved by 110,000+ creators and businesses |

Selected section headings:

- /social-media-api/: "Don't Waste Months on Integrations", "Simple API Integration", "22 Platforms Supported", "What the unified API covers", "SDKs, MCP and no-code", "Transparent Pricing", "Compare Unified Social Media APIs", "Infrastructure for Social Products".
- /whitelabel/: "What Your Clients See", "Every Branding Option", "What Is Not White-Labeled", "Why Not Build the Integrations Yourself?", "One API Key, One Profile per Client".
- /mcp/: "What is a social media MCP server?", "Configure your client", "What the agent can do", "Social media MCP server vs. traditional automation".

### Messages they repeat (inferred from the pages above)

1. **No developer app, no app review, no tokens.** "You never create an app on TikTok, Meta or LinkedIn. You never wait for an app review…" (home). Titles push the same line: "No App Review", "No Partner Program", "Skip the app review and the audit".
2. **Flat price, unlimited uploads.** "One flat price per plan, never per user, per channel or per post." (pricing)
3. **22 networks**, including a long tail (Nostr, Lemmy, Dev.to, Hashnode, WordPress, Whop, Listmonk).
4. **AI-agent native.** Hosted MCP, Claude Code skills, ChatGPT app, and 21 "post to social media with <assistant>" pages.
5. **Compliance.** "Official APIs. OAuth security. No workarounds." and "We don't use rotating IPs, scraping, or workarounds."

## 3. Pricing (sourced: https://www.upload-post.com/pricing/, checked 2026-11-12. Same figures in https://www.upload-post.com/pricing.md, which says "Prices checked 30 October 2026"; the page says "Last updated: October 2026")

**Billing unit: the "profile".** "A profile is one person or client, not one social account. Each profile connects one account per platform." So 5 profiles = up to 5 TikTok + 5 Instagram + 5 YouTube accounts. That is per-client billing with **one account per network per profile**. It is not per organization, and it is not unlimited accounts.

| Plan | Monthly | Yearly (per month / billed) | Profiles | Seats | Uploads | TikTok | White-label | FFmpeg min/mo | AI Shorts/mo |
|---|---|---|---|---|---|---|---|---|---|
| **Free** | $0 | — | 2 | 1 | 10 a month | **No** | No | 30 | 10 |
| **Basic** | $24 (€19) | $16 / $192 | 5 | 1 (owner) | Unlimited | Yes | No | 300 | 100 |
| **Professional** ("Most popular") | $50 (€42) | $33 / $400 | 25 | 2 | Unlimited | Yes | Yes | 1,000 | 300 |
| **Advanced** | $147 (€126) | $118 / $1,411 | 75 | 5 | Unlimited | Yes | Yes + priority support | 3,000 | 600 |
| **Business** | $438 (€378) | $350 / $4,205 | 225 | 10 | Unlimited | Yes | Yes + priority support | 10,000 | 1,000 |

There is no Enterprise tier on the page.

**Add-ons (monthly, one pack per plan, packs "don't stack"):**

| Plan | Pack options |
|---|---|
| Basic | +5 profiles $15, or +10 profiles $25 |
| Professional | +15 profiles $35, or +25 profiles $55 |
| Advanced | +25 profiles $65, or +50 profiles $115 |
| Business | +$1/month per extra profile |
| Any paid plan | **"Post links on X": $19/month, up to 50 link posts a month** |

**Free tier:** recurring, "10 uploads a month, forever", 2 profiles, no card, API + MCP + scheduling + analytics, **no TikTok**. Free covers Instagram, YouTube, LinkedIn, Facebook, X, Threads, Pinterest, Reddit and Bluesky. (sourced: /pricing/ FAQ and /pricing-comparison/ FAQ)

**Overage and limits:**

- No per-post overage, and paid uploads are "unlimited". But the docs enforce per-account **daily hard caps** on a rolling 24-hour window: Instagram 50, TikTok 15, LinkedIn 150, YouTube 30, Facebook 25, Threads 50, Pinterest 20, Bluesky "25 videos / 10 GB". **X is capped per plan: 10 posts/day per profile on Free and Basic, 20 on Professional, 30 on Advanced and Business.** Over the cap, the API answers `429` with a `violations` array. A verifier also blocks duplicate or similar content within 48 hours. (measured: https://docs.upload-post.com/guides/limit-of-uploads)
- API rate limits per plan: 60 requests/min on Free and Basic, 100 on Professional, 200 on Advanced, 500 on Business, plus 2/min per profile, with a ceiling of 1,000/min. (measured: docs llms-full.txt, "Rate Limits & Polling Best Practices")
- **X links are stripped by default.** Upload-Post "strips URLs from X (Twitter) posts by default to avoid X's 13x per-post URL fee". Keeping links costs $19/month for 50 link posts. (measured: https://docs.upload-post.com/guides/x-links-addon summary in docs llms.txt)

**Refund: the pages contradict each other.** /pricing/ says "Paid plans come with a 15-day money-back guarantee". /pricing-comparison/ says "subscriptions are generally non-refundable… we'll review your case individually". (both measured)

**Annual discount is mislabelled.** The home pricing toggle shows "-40%". The real discounts are 33% (Basic), 34% (Professional) and 20% (Advanced, Business). /pricing-comparison/ itself says "About a third on Basic and Professional, 20% on Advanced and Business". (measured, inferred arithmetic)

**Currency:** USD, with EUR shown in the app for European customers. Payments go through Stripe. (sourced: /pricing/, /pricing-comparison/)

### Upload-Post vs Siar on price (inferred arithmetic. Siar USD list prices from `docs/pricing.md`)

| Need | Upload-Post (monthly list) | Siar (USD, monthly) | Who is cheaper |
|---|---|---|---|
| Try it | Free: 10 uploads **every month**, no TikTok | 20 free posts to try (one-time), or the 14-day Pro trial | Upload-Post for long-term free use |
| 1 brand | $24 Basic (5 profiles, unlimited uploads, TikTok live) | $19 Starter (1 brand, 300 posts/mo) | Siar on list price. Yearly is a tie ($192 vs $190) |
| 2–5 brands | $24 Basic (5 profiles) | $49 Pro (Starter is 1 brand) | **Upload-Post, about half the price** *[corrected 2026-11-12: row added]* |
| 10 brands | $39 (Basic + 5 pack), or $50 Professional with white-label | $49 Pro | Upload-Post ($39 vs $49, about 20% cheaper) *[corrected 2026-11-12: was "About equal"]* |
| 25 brands | $50 Professional | $149 Business (Pro stops at 10 brands) | **Upload-Post, by a lot** |
| 75 brands | $147 Advanced | $149 Business | Equal |
| 100 brands | $212 (Advanced + 25 pack) | $149 Business | Siar |
| 225 brands | $438 Business | $149 Business | **Siar, by a lot** |
| A brand with 3 Instagram accounts | 3 profiles (one Instagram slot per profile) | 1 brand (unlimited accounts) | Siar |
| X posts with links | $19/mo for 50 link posts (about $0.38 each when fully used); plain posts included but capped 10–30/day | X's own price from prepaid credit: $0.20 per post with a URL, $0.015 plain | Siar for links; Upload-Post for high-volume plain X posts |

Honest summary: **Siar does not win on list price against Upload-Post anywhere between 2 and 75 clients** *[corrected 2026-11-12: was "between about 11 and 75"; Upload-Post's $24 Basic covers 5 profiles and Basic + 5 pack covers 10 for $39, against Siar Pro at $49]*. Siar is cheaper for exactly 1 brand on monthly list price ($19 vs $24) and above 75 brands, when one brand runs several accounts on the same network, and for Malaysian buyers who pay in ringgit. Upload-Post's paid plans never meter posts. Siar caps posts per month (300 / 10k / 100k).

## 4. Networks and API features

### Networks (measured: home "Supported Platforms", /platforms/, llms.txt)

They list 22: TikTok, Instagram, YouTube, LinkedIn (profiles **and** company pages), Facebook, Threads, X, Pinterest, Reddit, Bluesky, Google Business, Discord, Telegram, Slack, Mastodon, Nostr, Lemmy, Dev.to, Hashnode, WordPress, Whop and Listmonk. They also have Twitch as a read-only analytics source in the docs.

**What the "22" hides (measured: docs):**

- **Reddit is down.** "Reddit posting is currently unavailable. Uploads with `platform[]=reddit` return HTTP 503 `error_code: "reddit_unavailable"`." The same applies to Reddit OAuth and comments. The home page, /platforms/reddit/ ("Reddit API: Post Images, Text & Links to Subreddits") and /pricing/ (Reddit on the Free plan) still sell it. Their MCP repo changelog says "Reddit off as a state" (PR #23, 2026-10-27). In practice that leaves **21 working networks**. (measured: docs llms-full.txt; https://github.com/Upload-Post/upload-post-mcp/pull/23)
- The 9 credential-based channels (Slack, Mastodon, Nostr, Lemmy, Dev.to, Hashnode, WordPress, Whop, Listmonk), plus Discord and Telegram, connect "by pasting their own key" and have **no analytics**. (measured: home + docs)
- **TikTok runs into TikTok's daily-active-user cap on their app.** The docs say "the daily limit of active users allowed by TikTok for our application has been reached". Since June 2026, a direct post that hits the cap is **automatically turned into an inbox draft**, and the API still says `success: true`. It is flagged, not silent: the result carries `fallback_to_inbox: true` (also persisted on status/history since August 2026) and the account owner gets a notification email *[corrected 2026-11-12: was "silently"]*. "Your caption does not travel with a video draft." Business-plan accounts get the error instead, and any account can opt out per upload with `disable_inbox_fallback=true`. The fix is to reconnect to a "new publishing route". (measured: https://docs.upload-post.com/guides/reached-active-user-cap-error)
- Their llms.txt also tells developers to prefer TikTok drafts (`MEDIA_UPLOAD`) over direct posting, on reach grounds. (measured)

**What they lack (inferred from their own lists):** WhatsApp, Snapchat, Tumblr, Medium, Twitch publishing, Kick. Ads only for ChatGPT Ads (no Meta or Google ads).

**Where Upload-Post is ahead of Siar today** (Siar status from `docs/approvals/README.md`, checked 2026-11-12): live **TikTok** publishing (Siar's audit was rejected), public **YouTube** uploads with their own quota (Siar: audit pending, uploads private), **Pinterest** pins (Siar: Trial), **LinkedIn company pages** (Siar: CM API denied; they have a page titled "Post to a LinkedIn Company Page via API (No Partner Program)"), **Google Business Profile** (Siar: parked), **Telegram**, plus the long tail. **Among the networks Siar has live, none is missing from Upload-Post.** Siar's code has one network Upload-Post does not list, Snapchat (`packages/networks/src/adapters/snapchat.ts`), but it is parked and cannot be claimed *[corrected 2026-11-12: was "Siar has no network that Upload-Post lacks"]*. Discord, Slack, Mastodon and Bluesky are live on both.

### API features

| Feature | Upload-Post | Source (measured 2026-11-12 unless noted) |
|---|---|---|
| REST API | `Authorization: Apikey <key>`; multipart `POST /api/upload`, `/upload_photos`, `/upload_text`, `/upload_document`; async uploads with `request_id`; sync uploads "timeout after 59 seconds". Published `openapi.json` is **OpenAPI 3.0.1 with 45 paths / 52 operations**. It leaves out endpoints the docs describe (AutoDM monitors, edit, repost, ChatGPT Ads), so the spec is incomplete (inferred) | https://docs.upload-post.com/openapi.json |
| SDKs and tools | Python `upload-post` (PyPI: 24,780 downloads last month), npm `upload-post` (6,237 last month), CLI `@upload-post/cli` (67), Vercel AI SDK `@upload-post/ai-sdk` (51), LangChain toolkit, GitHub Action, official verified n8n node, Make module, Zapier guide, WordPress plugin | pypistats, npm API (2026-10-12 to 11-10), docs |
| MCP | Hosted at `https://mcp.upload-post.com/mcp` with API-key **or OAuth 2.1 + PKCE + DCR** auth; open source (MIT, `@upload-post/mcp`, 1,135 npm downloads last month); self-host with Docker. Tool count is stated as **"50 tools"** (home, /mcp/) and **"40 tools"** (llms.txt). Claims a listing in ChatGPT's app directory and Claude's connector directory | home, llms.txt, GitHub PR #5/#6 |
| Webhooks | 6 events (`upload_completed`, `social_account_connected`, `_disconnected`, `_reauth_required`, plus opt-in `dm_received` and `comment_received`). HMAC-SHA256 over `timestamp.body`, rotatable secret. **"Single delivery attempt (no redelivery)… that event is not retried or queued for later."** 10-second timeout. Comment webhooks only for Instagram, TikTok and LinkedIn Company Pages | https://docs.upload-post.com/api/webhooks |
| White-label OAuth | Per-profile JWT connect link on a hosted page (logo, titles, labels, light/dark), from Professional ($50). Their own "What Is Not White-Labeled" section: hosted on `app.upload-post.com/connect` with "no custom domain or CNAME option"; network consent screens show Upload-Post's app; a "How your data is used" box with links to Upload-Post's privacy policy and info@upload-post.com always shows (it names TONVI TECH SL by default; the wording can be rewritten with `ui_labels`, the box and links cannot be removed) *[corrected 2026-11-12]*; "buttons keep Upload-Post's indigo"; tab title and icon are Upload-Post's. A server-side **Connect API** lets you build your own page | https://www.upload-post.com/whitelabel/, docs Connect API |
| Analytics | Account and per-post metrics for Instagram, TikTok, YouTube, LinkedIn, X, Facebook, Threads, Pinterest, Google Business, Reddit and Twitch (read-only). Live per-post reads are limited to 100 requests / 5 min, so a cached endpoint replays stored values. Audience insights endpoint | docs Analytics API, /social-media-analytics-api/ |
| Comments | Unified list/create/delete/hide across Instagram, Facebook, YouTube, LinkedIn (company pages), TikTok (reconnect needed), X (mentions), Threads, Bluesky. Reddit is 503 | docs Comments API |
| DMs | Instagram (send by user id, list conversations, 24-hour window). "Instagram only" is inferred: the page is `/api/instagram-dms` and every example uses Instagram, but the docs do not say "only" *[label corrected 2026-11-12]* | docs Direct Messages |
| Automation | AutoDM monitors: private DM on Instagram, public auto-reply on TikTok, YouTube, Facebook, Threads and Bluesky | docs AutoDM |
| Other | FFmpeg editor API (run your own FFmpeg command), AI Shorts captioning, auto-transcode to each network's specs, queue/time slots, retry failed upload, unpublish, edit (FB/LinkedIn/X/YouTube/GBP), repost, TikTok music/location search, hashtag suggestions, Idempotency-Key, AI-content labelling flag, Google Business reviews and location info, ChatGPT Ads, `POST /api/uploadposts/feedback` for AI agents to report bugs | docs llms.txt |

### Against Siar (Siar column from `siar-truth.md`)

| | Upload-Post | Siar |
|---|---|---|
| Webhook delivery | One attempt, no retry, 10 s timeout, 6 events | 16 HMAC-signed events, retried with backoff over about 45 h, delivery log, manual resend, test event, secret rotation [code] |
| Accounts per client | 1 per network per profile | Unlimited per brand, every plan |
| Connect page | Hosted on their domain; their consent screens; their colour | Hosted on app.siaran.my with "Powered by Siar"; brand name, logo **and accent colour** [code]. Neither offers a custom domain |
| Pre-send validation | Daily caps, duplicate check (48 h), mention limits; media is **auto-converted** | Per-network limits checked at create time with a 400 `issues` array; no auto-transcode (inferred: Upload-Post is stronger on media) |
| Network errors | Per-platform `success` flags inside an HTTP 200 (docs "Error Handling") | Network code, message and HTTP status kept verbatim, plus a plain-English fix and public error pages |
| Duplicate safety | Idempotency-Key header + duplicate detection. Their legal notice says users accept "content delivered to wrong accounts, content mixed between users, duplicated publications" | Each network target is claimed once; crashed claims are reconciled before any re-send [code] |
| MCP | Hosted, OAuth, 40–50 tools, on npm | 19 tools, **not on npm yet** [doc] |
| OpenAPI | 3.0.1, 52 operations, incomplete | 3.0.2, 270 operations [live] |
| Drop-in compatibility | Own API shape | bundle.social v1 wire-compatible (naming bundle.social publicly is parked) |

## 5. SEO footprint

### Size (measured from https://www.upload-post.com/sitemap.xml → `sitemap-0.xml`, lastmod 2026-11-09)

- **3,146 URLs** in total. Of those, **298 are English** and about 2,848 are translations in **14 locales** (de, br, fr, id, ar, es, hi, it, ja, ko, nl, th, tr, vi), 203–206 pages each. Lastmod dates run from 2026-04 to 2026-11.
- robots.txt allows all crawlers (`User-agent: *`) and also names 12 bots explicitly (GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, Claude-Web, anthropic-ai, Google-Extended, Googlebot, Bingbot, Applebot, Bytespider) under the comment "Explicitly allow AI search engine bots (GEO optimization)". It also declares `Content-Signal: ai-train=yes, search=yes, ai-input=yes`, commented "allow AI training, search indexing, and AI input (GEO)" *[corrected 2026-11-12: the "(GEO optimization)" comment belongs to the bot list]*.
- `/llms.txt` (12 KB) and `/llms-full.txt` (17 KB) on the marketing site, plus `/pricing.md`. The docs site has its own `llms.txt` (23 KB) and `llms-full.txt` (899 KB), with an "If you are an AI agent…" feedback endpoint.
- Docs: https://docs.upload-post.com/sitemap.xml has **94 URLs**.

### The 298 English URLs by type (measured, my classification)

| Type | Count | Notes |
|---|---|---|
| n8n pages `/n8n/…` + templates hub + guide | 62 | One page per n8n.io template ("n8n TikTok Upload: Upload Video with HTTP Request", AI-video recipes with Veo3, Sora2, HeyGen, Flux) and one `<network>-upload` page per network. **Their biggest programmatic set** |
| How-to guides `/how-to/…` | 34 | Long tail: "How to Schedule a Post on TikTok (Desktop, Phone & API)", "How to See Scheduled Posts on Instagram", "How to Post to a LinkedIn Company Page via API (No Partner Program)", "How to Add an MCP Server to Codex" |
| Alternative pages `*-alternative` | 26 | Agorapulse, Ayrshare, Blotato, Buffer, **bundle.social**, Hootsuite, Later, Loomly, ManyChat, Metricool, Mixpost, Outstand, Post Bridge, Post for Me, Postiz, PostSyncer, Publer, Sendible, SocialBee, SocialPilot, Sprout Social, Typefully, Unipile, Vista Social, Zernio, Zoho Social. **No Siar page** (grep of all fetched pages for "siar"/"siaran": 0 hits) |
| Per-network MCP pages `/mcp/<network>` | 23 | "TikTok MCP Server to Post Videos from Claude & ChatGPT", and so on for each network |
| Per-network upload pages `/platforms/<network>` | 23 | "<Network> Upload API" pages, for example "Instagram Reels API: Publish Reels, Stories & Carousels" |
| Claude Code skill pages `/skills/claude-code/<network>` | 22 | One per network |
| "Post to social media with <assistant>" | 21 | ChatGPT, Claude, Gemini, Cursor, Copilot, Grok Bot, Manus, Perplexity Computer, Meta Muse, Lindy, Poke, Microsoft Scout, Vellum… |
| Network API guides (`/<network>-api/`) | 12 | Instagram, TikTok, YouTube, LinkedIn, Threads, Pinterest, Bluesky, Telegram, Facebook Graph, Google Business Profile, plus /social-media-api/ and /social-media-analytics-api/. No `/<network>-api/` guide for X, Reddit, Discord, Mastodon or Slack, but X is covered by /x-api-pricing/ ("X API pricing in 2026") and every one of these has a `/platforms/<network>/` upload page *[corrected 2026-11-12]* |
| Free tools `/tools/…` | 12 | Bold text generator, font generator, character counter, TikTok and YouTube money calculators, engagement rate calculator, safe-zone checker, Instagram grid maker, LinkedIn formatter, UTM builder, holiday calendar |
| Competitor pricing explainers `*-pricing` | 9 | Ayrshare, Blotato, Buffer, Hootsuite, Later, Metricool, Sprout Social, **LinkedIn API pricing, X API pricing** |
| Customer stories | 9 | Hub + 8 |
| Integration guides | 8 | Make, Zapier, Airtable, FFmpeg, viaSocket, OpenClaw, OpenStory, Make templates |
| Scheduler pages | 6 | /social-media-scheduler/ + Instagram, LinkedIn, TikTok, YouTube + "for agencies" |
| Roundups and vs | 5 | Best social media APIs (18 compared), best MCP servers (12), best schedulers (9), best cross-posting tools, "Ayrshare vs Zernio vs Blotato" |
| Blog | 3 | Effectively unused (2 posts). Their content lives in how-to and programmatic pages instead |
| Other | 23 | Home, pricing, pricing-comparison, whitelabel, reviews, leaderboard, status, legal… |
| Glossary | 0 | None |

### Top keyword targets inferred from titles and H1s (inferred)

- **Category heads:** "social media api" (home title), "unified social media api", "social media posting api", "social media mcp server", "social media scheduler", "social media analytics api", "white label social media management".
- **Per-network "<network> API" guides** with a year and commercial modifiers, for example "TikTok API Guide (2026): Content Posting API & Keys" and "YouTube API Guide (2026): Data API v3, Keys & Uploads". Each guide ends with "The shortcut: … one Upload-Post call" and "Skip the app review and the audit".
- **Per-network "<network> upload API"** (`/platforms/`), **"<network> MCP server"** (`/mcp/`) and **"n8n <network> upload"** (`/n8n/`). These are three programmatic families across the same 22 networks.
- **Pricing queries:** "<competitor> pricing", "x api pricing" ("Cost Calculator + Post Without Credits"), "linkedin api pricing".
- **"<competitor> alternative(s)"**, 26 pages. The H1 usually puts a price contrast in the headline ("$24/mo vs $149/mo", "$24/month instead of a $100 first step").
- **AI-assistant intents:** "post to instagram with chatgpt/claude", "schedule social media posts with claude code", "add mcp server to codex".
- **Consumer how-to long tail:** "how to schedule a post on tiktok", "how to see scheduled posts on facebook", "how to schedule instagram stories", plus free tools ("tiktok money calculator", "bold text generator") that pull traffic far from the buyer (inferred).

### Demand around the brand (measured: Google autocomplete, 2026-11-12. Volumes inferred)

- "upload-post" → api, login, pricing, alternative, n8n, tiktok.
- "upload post api" → documentation, pricing, n8n, tiktok, **reddit**, alternative.
- "upload-post alternative" → "upload post free alternative", "upload post api alternative".
- "upload post vs" → **"upload post vs blotato"**.
- Inference: "login" in autocomplete means a real returning user base. "alternative" and "free alternative" show switching intent that an honest `/compare/upload-post` page could catch. At least two pages already target it: bundle.social's blog and Ayrshare's /compare/upload-post-api-alternative/ (both measured: fetched 2026-11-12). The first pass also named woopsocial.com, heytasky.com and noobclaw.com from search results, with no URLs; **unverified** (I could not re-run the search). Rankings for these pages are unverified. That points to moderate competition on a small-to-moderate query (inferred).

### Who links to them / visibility signals

| Signal | Detail | Label |
|---|---|---|
| GitHub (own org) | 23 public repos: skill-autoshorts 159★, avatar-mix 138★, viraloop 85★, upload-post-larry-marketing-skill 43★, upload-post-skill 39★, n8n-nodes-upload-post 32★, upload-post-comment-funnel 23★, upload-post-mcp 17★ *[corrected 2026-11-12: comment-funnel was missing from the top list]* | measured: GitHub API |
| GitHub (third party) | MoneyPrinterTurbo (142.5K★) ships an Upload-Post publisher module and config. Home also cites video-shotcraft and autoclip | measured (MoneyPrinterTurbo); the rest is their claim |
| n8n | Official verified node; "50+ n8n workflow templates", "1M+ views" | their claim, unverified |
| Roundups | Buffer "Best Social Media APIs for Developers in 2026" (2026-05-28): "one of the strongest newcomers", 10 platforms, 30,000+ users, 40 MCP tools | sourced: https://buffer.com/resources/best-social-media-apis/ |
| Competitor pages naming them | Ayrshare /compare/upload-post-api-alternative/ ("Upload-Post has a lower entry price than Ayrshare", updated 2026-10-23); bundle.social blog "Upload-Post Alternatives: Flat Pricing, Verbose Errors, and Reliability" (2026-08-04) *[corrected 2026-11-12: title was missing "Verbose"]* | sourced: https://www.ayrshare.com/compare/upload-post-api-alternative/, https://bundle.social/blog/upload-post-alternative |
| Product Hunt | Launched 2025-05-12 | sourced via search; page returned 403 |
| G2 | Profile with 0 reviews, marked inactive (first-pass search summary) | **unverified**: https://www.g2.com/products/upload-post/reviews returned 403 again on 2026-11-12 |
| Trustpilot | No page | measured: https://www.trustpilot.com/review/upload-post.com returned 404, 2026-11-12 |
| AlternativeTo | 3 likes, no reviews, "$8 to $126" price range (stale) | sourced: https://alternativeto.net/software/upload-post/about |
| Slashdot | "No User Reviews" | sourced: https://slashdot.org/software/p/Upload-Post/ |
| YouTube | Third-party n8n tutorials (Chase AI 183K subs and others) embedded on the home page | measured on their page |
| Directories | MCP Registry (`com.upload-post/mcp`); ChatGPT app directory, Claude connector directory | MCP Registry measured via registry API 2026-11-12; ChatGPT/Claude listings their claim, unverified |

Inference: their links come mostly from **developer and automation distribution**: GitHub projects, the n8n template gallery, YouTube tutorials and agent directories. Review sites and press contribute little. Their 4.9/5 rating comes from 112 reviews hosted on their own /reviews/ page.

## 6. Weaknesses

### Real user complaints (sourced)

The first pass found **no Reddit threads** about Upload-Post. Searches tried: "upload-post reddit", site:reddit.com with n8n/TikTok, `"upload-post.com" reddit`. Reddit's search JSON refused unauthenticated requests. **Unverified on re-check**: I could not re-run these searches on 2026-11-12. Trustpilot has no page (404, measured); G2's 0 reviews is unverified (403). The public complaints that do exist are on GitHub and on their own reviews page:

| Complaint | Link | Date |
|---|---|---|
| "app.upload-post.com returning 403, can't connect Instagram" (open; the reporter says email support had not replied) | https://github.com/Upload-Post/upload-post-mcp/issues/21 | 2026-10-24 |
| "MCP silently drops youtubePublishAt" (open) | https://github.com/Upload-Post/upload-post-mcp/issues/22 | 2026-10-27 |
| "MCP endpoint returning HTTP 503 `no available server`" (closed) | https://github.com/Upload-Post/upload-post-mcp/issues/14 | 2026-08-12 |
| "outputSchema emitted as JSON Schema draft-07 — all tools rejected by strict MCP clients" (closed) | https://github.com/Upload-Post/upload-post-mcp/issues/15 | 2026-08-13 |
| "TikTok: tiktok_original_sound_volume is accepted but never reaches TikTok" (open) | https://github.com/Upload-Post/upload-post-npm/issues/37 | 2026-09-10 |
| "The facebookMediaType is missing in uploadPhotos" (open) | https://github.com/Upload-Post/upload-post-npm/issues/38 | 2026-09-16 |
| "privacy_level, is_aigc, post_mode silently dropped for TikTok photo uploads" (closed) | https://github.com/Upload-Post/upload-post-pip/issues/24 | 2026-03-18 |
| n8n node install/update failures (closed) | https://github.com/Upload-Post/n8n-nodes-upload-post/issues/43, /62, /63 | 2025-12 to 2026-02 |
| A reviewer on their own page: "there is some bugs with a colors and buttons that looks not very professional for our clients" on the white-label connect page | https://www.upload-post.com/reviews/ | undated |
| Another review there: "at beginning i had some troubles" | https://www.upload-post.com/reviews/ | undated |

Pattern (inferred): fields that are **silently dropped** between the SDK/MCP and the networks, and short outages of the dashboard or MCP host while the REST API stays up.

### Gaps in their own documentation (measured)

1. **Webhooks are fire-and-forget.** There is one attempt and no redelivery, so their own docs tell you to poll as a fallback.
2. **TikTok success can mean "draft in inbox".** When TikTok's per-app daily active-user cap is hit, a direct post becomes an inbox draft without its caption, and the API still reports `success: true`. A `fallback_to_inbox: true` flag and an owner email mark it, and `disable_inbox_fallback=true` turns it off, but a developer who only checks `success` will believe the post went live.
3. **Reddit is sold but returns 503.** It appears on the home page, /platforms/reddit/, the pricing FAQ and llms.txt.
4. **One account per network per profile.** A client with two Instagram accounts uses two profiles.
5. **X links stripped by default**, with a $19/month add-on capped at 50 link posts, and per-profile X caps of 10–30 posts a day.
6. **White-label is partial** (their words): their domain, their indigo buttons, their tab title, a privacy box that cannot be removed (names TONVI TECH SL by default, wording editable), and no custom domain.
7. **Inconsistent numbers:** 50 vs 40 MCP tools; "100,000+ registered users" (llms.txt) vs "111,142 Active Users" (home) vs Buffer's "30,000+ users" in May 2026; a "-40%" annual badge vs real 20–34%; refund "15-day money-back guarantee" vs "generally non-refundable".
8. **The OpenAPI spec covers 52 operations** and leaves out documented endpoints, so code generation from it is incomplete (inferred).
9. **Free plan excludes TikTok**, which is the network most of their marketing leads with.
10. **The legal notice disclaims misdelivery**, including "content delivered to wrong accounts, content mixed between users, duplicated publications" (boilerplate, but it is on the page).
11. **Data claim:** the FAQ says "Upload-Post does not store any personal data", yet the service stores OAuth tokens and profile data to work (inferred contradiction).

### Gaps Siar can exploit honestly

- **Delivery you can rely on:** retried, signed webhooks with a log and resend, against their single attempt. Verbatim network errors, against per-platform flags inside a 200. Never-twice publishing. All three are true in Siar's code (`siar-truth.md` section 4).
- **Unlimited accounts per brand** for clients who run several accounts on one network.
- **Price above 75 brands**: $149 for unlimited brands, against $212–$438+.
- **X links at X's own price**, with no monthly link bundle and no link stripping.
- **Malaysia:** ringgit prices, yearly paid once by FPX or DuitNow, a Malaysian company, and a price lock. Upload-Post bills in USD/EUR through Stripe only.
- **bundle.social v1 drop-in** for teams leaving bundle.social. Upload-Post is courting exactly these teams on /bundle-social-alternative/. Naming bundle.social on Siar's site is still a parked owner decision.
- **Honest status pages:** Siar can publish which networks are live and which are pending, as `siar-truth.md` requires. That contrasts with selling Reddit while it returns 503. Siar must hold itself to the same rule: TikTok, YouTube public uploads, Pinterest publishing and LinkedIn pages are **not** claimable yet.

### What Siar should not try to beat them on (inferred)

- Network count, TikTok/YouTube/Pinterest/LinkedIn-pages availability, and Google Business. Upload-Post is ahead on all of these today.
- Price for 2–75 clients *[corrected 2026-11-12: was 11–75]*.
- Media processing (FFmpeg API, auto-transcode, AI captions).
- AI-agent distribution: hosted OAuth MCP on npm, 21 assistant pages, Claude Code skills, a ChatGPT app. Siar's MCP is not on npm yet.
- Programmatic volume: about 200 English pages per network family plus 14 locales.

### SEO moves this suggests for Siar (inferred; feeds `docs/geo/plan.md` P3)

1. A sourced, dated `/compare/upload-post` page. Lead with delivery guarantees, per-brand billing and the price crossover at 75 brands. State plainly where Upload-Post is cheaper or covers more networks.
2. Siar already has `/[api]/errors` pages. Upload-Post has **no per-network error-reference pages on its marketing site** (sitemap: 0 URLs containing "error"); its docs have one general https://docs.upload-post.com/resources/common-errors page, an error-handling guide and a TikTok cap-error guide *[corrected 2026-11-12: was "no error-reference family"]*. It has no `/<network>-api/` guide for X, Reddit, Discord, Mastodon or Slack (X has /x-api-pricing/ only). Siar's network pages can own "<network> API error <code>" queries, and Mastodon/Discord/Slack posting-API queries, where both are live.
3. A webhook-reliability explainer ("social media API webhooks: retries and signatures"). Their own docs admit the gap.

---

## One line: how Siar should position against Upload-Post

**Upload-Post is the cheap uploader for creators and n8n builders. Siar is the per-organization API for products and agencies that need every post accounted for: retried, signed webhooks, verbatim errors, no double posts, unlimited accounts per brand, and one flat price once you pass 75 brands. Siar does not claim networks it hasn't been approved for.**

---

### Sources (all checked 2026-11-12)

Vendor (measured): https://www.upload-post.com/ · /pricing/ · /pricing.md · /pricing-comparison/ · /llms.txt · /llms-full.txt · /robots.txt · /sitemap.xml + /sitemap-0.xml · /social-media-api/ · /whitelabel/ · /mcp/ · /ai-agents/ · /bundle-social-alternative/ · /ayrshare-alternative/ · /zernio-alternative/ · /best-social-media-apis/ · /best-social-media-mcp-servers/ · /reviews/ · /customers/ · /legal-notice/ · /x-api-pricing/ · /platforms/tiktok/ · /platforms/reddit/ · /tiktok-api/ · /instagram-api/ · 107 further pages for titles/H1s · https://docs.upload-post.com/llms.txt · /llms-full.txt · /openapi.json · /sitemap.xml · /api/webhooks.md · /guides/limit-of-uploads.md · /guides/reached-active-user-cap-error.md

GitHub/npm/PyPI (measured): https://api.github.com/orgs/Upload-Post/repos · issues on upload-post-mcp, upload-post-npm, upload-post-pip, n8n-nodes-upload-post · https://github.com/harry0703/MoneyPrinterTurbo · api.npmjs.org downloads · pypistats.org

Registries and review sites (measured on re-check): https://registry.modelcontextprotocol.io/v0/servers?search=upload-post · https://www.trustpilot.com/review/upload-post.com (404)

Third party (sourced): https://buffer.com/resources/best-social-media-apis/ · https://www.ayrshare.com/compare/upload-post-api-alternative/ · https://bundle.social/blog/upload-post-alternative · https://alternativeto.net/software/upload-post/about · https://slashdot.org/software/p/Upload-Post/ · https://www.producthunt.com/products/upload-post/launches (403, via search) · https://www.g2.com/products/upload-post/reviews (403, via search)
