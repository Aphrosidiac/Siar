Verified 2026-11-12: 14 corrections

> Verification pass (2026-11-12): every Outstand price, limit, tier, network and capability-grid fact was re-checked against outstand.so (/pricing.md, /facts, /llms.txt, home HTML, media kit, sitemaps, /docs/llms-full.txt) and holds, except where corrected below. Third-party quotes were re-fetched at their URLs (Ayrshare, Buffer, WoopSocial, GitHub PR #483 and Pipedream #22027 via the GitHub API, SourceForge, Glama). Siar statements were checked against `siar-truth.md`. The planned re-run of 10+ web searches could not be done: the shared WebSearch budget for this run was exhausted. Google autocomplete was re-run directly; search-only claims (Reddit threads, Product Hunt, unopened roundups, G2) are now marked unverified.

# Competitor teardown: Outstand (outstand.so)

Checked 2026-11-12. Every claim is labelled:

- **measured**: I fetched the page or file myself on 2026-11-12. That includes raw HTML of outstand.so, its `/llms.txt`, `/pricing.md` and `/facts`, all four sitemaps, `/docs/llms-full.txt` (1.1 MB), the npm registry, the GitHub API, the Hacker News search API and Google autocomplete.
- **sourced**: from a third-party page, with its URL. Many of these are written by Outstand's competitors and say so.
- **inferred**: my own reading or estimate.

Outstand facts come only from outstand.so. Siar facts come from `docs/seo/research/siar-truth.md` (checked 2026-11-12) and `docs/pricing.md`; nothing about Siar here goes beyond that file. Sibling teardowns: `ayrshare.md`, `bundle-social.md`.

Domain: **https://www.outstand.so** (apex `outstand.so` 301s to `www`). API host `api.outstand.so`, MCP at `https://mcp.outstand.so/mcp`. (measured)

---

## 1. Who they are

- Two founders, both from ScheduleThreads (a Threads scheduler; the media kit says each "previously co-founded" it and that Outstand "spun out of ScheduleThreads in October 2025"; /facts calls it "a social media SaaS built on Outstand". Whether they still run it is unverified): **Kostas Livieratos** (founder, engineering, "Architected Outstand's globally-scalable Cloudflare-based stack") and **Stefanos Athanasoulias** (co-founder, frontend/design). The media kit section heading is "Two engineers building infrastructure for builders." (measured: https://www.outstand.so/media-kit, checked 2026-11-12)
- Public launch post "It's time for a change: our journey to Outstand.so" has `datePublished` **2025-10-14**. (measured: https://www.outstand.so/blog/our-journey-to-outstand)
- Network history, from their own corrected post: 9 networks on 2026-06-04 when Pinterest went live; 12 by 2026-08-27 (added Google Business Profile, Vimeo, Reddit). The post carries two dated editor's corrections, one admitting an earlier "managed keys" claim was "broader than the product". (measured: https://www.outstand.so/blog/a-new-era-for-outstand)
- MCP server "live since March 2026". (measured: /facts)
- Self-description: "Outstand is a unified social media API. One integration publishes, schedules, and reads analytics across 12 platforms, with an MCP server so AI agents can do the same." (measured: /llms.txt)
- Main angle (inferred from titles and copy): **the AI-agent social API, billed per post, not per profile**. Every page leans on three things: usage-based pricing vs per-profile tiers, a hosted 30-tool MCP server, and BYOK white-label. Their tone is deliberately candid ("Direct. Technical. Slightly weary of bullshit." is a media-kit heading), with "honest" comparison pages and a "What Outstand does not do" section.
- Buyer: developers building AI agents, schedulers, analytics dashboards, and agencies who build their own front end. They say plainly: "There's no Outstand branding to strip out, because there's no Outstand interface in front of your client. You ship the dashboard". (measured: /white-label-social-media-management)

## 2. Home page and main landing pages (exact copy)

### Home: https://www.outstand.so/ (measured 2026-11-12; sitemap lastmod 2026-11-05)

- `<title>`: **Outstand - Unified Social Media API for AI Agents**
- Meta description: "One API call posts to X, LinkedIn, Instagram, and 11 more platforms. Built for AI agents, schedulers, and analytics dashboards - ship in hours. $19/mo, 3,000 posts included. From $0.005/post at volume."
- Eyebrow: "12 platforms · 1 API · usage-based pricing"
- H1: **"Stop building 12 integrations. Build one."**
- Subhead: "The unified social media API for AI agents and the products around them. One call posts to X, LinkedIn, Instagram, and 11 more platforms - ship your AI agent, scheduler, or analytics dashboard in hours. 3,000 posts included, then from $0.005/post at volume. Managed Keys cover 8 of the 12 networks."
  - measured: "X, LinkedIn, Instagram, and 11 more" is 14, but they support 12. The media kit says "and 7 more platforms" (10). Their own counts disagree.
  - measured (verification pass): the media kit's fact sheet still lists the old pricing, "$5/month base (includes 1,000 posts) + $0.01 per post beyond", the same claim /facts labels "Outdated" (https://www.outstand.so/media-kit, checked 2026-11-12).
- Hero CTAs: **"Get your API key →"** (→ /app/signup) and **"Read the docs"**. Header CTAs: "Get API Key", "Sign In".
- Hero ticks: "5 minutes on 8 of 12 networks", "99.92% uptime", "12 platforms". Under them: "The other 4 - X (Twitter), Google Business Profile, Vimeo, Reddit - have no Outstand app, so you register your own with the platform first."
- Section headings, in order (they number them "01 / Features" etc.):
  - "Teams building on Outstand" (logo strip)
  - H2 "You handle the product." H3s: "Unified data model.", "Intelligent rate limiting." ("You never see a 429."), "Webhook events.", "Media processing.", "Advanced scheduling.", "Cross-platform analytics.", "Use our app credentials, or bring your own."
  - H2 "12 platforms. One integration." with a per-network capability grid (see section 4), then H3 "Two ways to connect. Know which one you need before you pay." with H4s "Managed Keys - included, nothing to register" and "Your own app - you register it first".
  - H2 "Two plans. One API." (pricing, a live cost calculator with presets Light 1,000 / Starter 3,000 / Growth 10,000 / Scale 50,000 posts, and a "Per-profile pricing · 10 accounts (~$6/account) $60.00/mo" comparison). Build-vs-buy block: "// Building it yourself": "6mo+", "$150k", "∞"; "// Or skip all that": "5min", "$19", "0".
  - H2 "Talk to your social media." (MCP demo chat)
  - H2 "One API. Many products." with tabs "// AI agent", "// Scheduler", "// Analytics dashboard", "// White-label agency".
  - H2 "Ship the interesting part." Final CTAs repeat "Get your API key →" / "Read the docs".
- Proof on the home page (measured; none of it verified by me):
  - **Logo strip of 27 names** (text, not images): Adit, AngelHack, Antino, Bacancy, Bathla Group, Binghamton University, ButcherBox, Crowd Helix, Fora Travel, George Washington University, Global, Globe Telecom, Halo Lab, Hogarth, HoneyBook, HUMAIN, Kelsus, Manus, Mapp, Mozilla, Novo Nordisk, Ocoya, Profil Software, Rayna Tours, SegmentStream, Warner Music Group, WeatherXM. No case studies, no quotes attached.
  - Numbers: "12.8M+ posts / month. Across 500+ companies. Real production traffic, not a demo number." "180ms avg response. p50 at 120ms. p99 under 350ms." "99.92% uptime ... Actual measured uptime, not 'up to.'" "30 tools exposed", "3min to set up".
  - **No testimonials anywhere on the home page.** The white-label page's "Trusted by leading agencies and SaaS platforms" shows one name, **ScheduleThreads**, which is the founders' own product (measured: /white-label-social-media-management and /media-kit).
  - /facts says "SOC 2 certification is in progress. Outstand is not yet SOC 2 certified."
- Footer tagline: "The unified social media API for builders. Ship what you would have built - without the integration tax." Links to X (@outstandso), LinkedIn, GitHub (outstand-so).

### Other main landing pages: `<title>` and H1 (all measured 2026-11-12)

| URL | `<title>` | H1 |
|---|---|---|
| /mcp | Social Media MCP Server - 30 Tools for AI Agents \| Outstand | Stop switching tabs to post on social media |
| /social-media-mcp-server | Social Media MCP Server - Publish to 12 Platforms \| Outstand | The social media MCP server that actually publishes |
| /social-media-api-for-ai-agents | Social Media API for AI Agents - Publish Across 12 Platforms \| Outstand | Give your agent one API for every social platform |
| /ai-agents | AI Social Media Manager - Give Your AI Agent a Social Presence \| Outstand | Give your AI agent a social media presence |
| /claude | Claude Social Media - Connect Claude to 12 Platforms \| Outstand | Claude writes the post. Now it can send it. |
| /chatgpt-social-media | ChatGPT Social Media - Post to Social From ChatGPT \| Outstand | Tell ChatGPT to post, and it actually posts |
| /cursor-social-media | Cursor Social Media - Post to Social From Cursor With MCP \| Outstand | Ship the code, then post about it - without leaving Cursor |
| /claude-code-social-media | Claude Code Social Media - Publish From Your Terminal \| Outstand | Publish to social media from the terminal |
| /grok-bot | Grok Bot Social Media - Post to 12 Platforms From Grok \| Outstand | Grok drafts on X. Now it can publish everywhere else. |
| /white-label-social-media-management | White Label Social Media Management Software for Agencies | White Label Social Media Management for Agencies |
| /solutions/comment-to-dm | Comment-to-DM Automation API \| Outstand | Comment-to-DM automation, as an API. |
| /solutions/exportable-social-media-reports | Social Media API with Exportable Reports \| Outstand | A social media API with exportable reports. |
| /ayrshare-alternative | The Ayrshare Alternative for Developers - Outstand | The Ayrshare alternative that bills per post, not per profile |
| /postiz-alternative | The Hosted Postiz Alternative for Developers - Outstand | The hosted Postiz alternative for AI agents and developers |
| /sprout-social-alternative | The Sprout Social Alternative for Developers - Outstand | The Sprout Social alternative that sells API calls, not seats |
| /buffer-api | The Buffer API: what it does, and where it stops - Outstand | The Buffer API, and where it stops |
| /hootsuite-api | The Hootsuite API: access, pricing and where it stops - Outstand | The Hootsuite API, and where it stops |
| /instagram | Instagram API: DM Automation, Publishing & Rate Limits \| Outstand | The Instagram API, explained - and made one call |
| /x | X (Twitter) API - Post, Schedule & Analyze \| Outstand | The X (Twitter) API built for developers |
| /linkedin | LinkedIn API - Access, Limits and How to Post \| Outstand | The LinkedIn API: what it does, how to get access, how to post |
| /facebook | Facebook API - Post, Schedule, DMs & Comment-to-DM \| Outstand | The Facebook API built for developers |
| /tiktok | TikTok Content Posting API: How to Get Access \| Outstand | TikTok Content Posting API access, in four stages |
| /threads | Threads API - Post, Schedule & Analyze \| Outstand | The Threads API built for developers |
| /bluesky | Bluesky API - Free, No App Review \| Outstand | The Bluesky API has no gatekeeper |
| /youtube | YouTube API - Upload Videos & Shorts \| Outstand | The YouTube API built for developers |
| /pinterest | Pinterest API - Create Pins & Schedule \| Outstand | The Pinterest API built for developers |
| /google-business | Google Business Profile API - Posts, Events & Offers \| Outstand | The Google Business Profile API built for developers |
| /facts | Outstand Facts: Pricing, MCP Server & Platform Support | Outstand, on the record. |

Recurring section patterns (measured): every comparison page has an "Outstand vs X" section; 4 of the 5 (/postiz-alternative, /sprout-social-alternative, /buffer-api, /hootsuite-api, not /ayrshare-alternative) have a "When X is the right choice" section (they concede ground on purpose); they also carry a worked cost example. FAQs across the site are written as the literal question ("Does Buffer have a public API?" on /buffer-api, "Is white labeling illegal?" on the white-label page, "Can Claude post to LinkedIn?" on /claude). Network pages follow "X's official API is powerful - and painful/priced for pain" → "Copy, paste, ship" code blocks → "Live in three steps" → "More than a X wrapper".

## 3. Pricing (sourced from their own pages, checked 2026-11-12)

Sources: https://www.outstand.so/pricing.md ("Last updated: November 2026 (2026-11-11)"), https://www.outstand.so/#pricing, https://www.outstand.so/facts. All measured 2026-11-12. USD only, monthly only.

| | Pay as you go | Business | Enterprise |
|---|---|---|---|
| Monthly fee | **$19** | **$129** | custom (contact@outstand.so) |
| Posts included | 3,000 | 50,000 | custom |
| Over the included posts | $0.007/post from 3,001 to 10,000, then $0.005 | $0.005/post flat | custom |
| DM conversations included | 500 per billing period, then $0.025 each | 10,000, then $0.015 each | custom |
| Connected accounts | unlimited, $0 | unlimited, $0 ("starts at 1,000 slots, raised free on request") | |
| Seats | unlimited, $0 | unlimited, $0 | |
| Platforms, API, MCP, Managed Keys, BYOK, analytics + exports | all included | all included | |
| Reselling | "Written permission required" | "Permitted" | |
| Extras | none | one 30-minute integration-planning call; "priority handling ... no guaranteed response time" | custom SLA |
| Uptime SLA | **None** | **None** | contractual SLA available |

Rules that matter, quoted from /pricing.md:

- **Billing unit is per delivery, not per post:** "The billing unit is one post delivered to one connected account. A post published to 3 connected accounts counts as 3 posts."
- "Drafts are not billed." "pending, published, and failed deliveries all count. Retries do not double-count."
- "Replies, reposts, media uploads, analytics reads, and every other API or MCP call are not billed."
- DMs are billed per conversation per billing period; inbound messages are free.
- "Included posts do not roll over between months." Plan fee charged up front; metered posts and DMs charged in arrears. Stripe, card only.
- **No free tier:** "Outstand is not free and has no permanently free tier. The $19 Pay as you go plan is the entry point."
- "No per-seat pricing, no setup fee, no annual contract." No yearly plan is offered.
- X, Google Business Profile, Vimeo and Reddit need your own app, and "Any platform fees those networks charge for their own API access are paid by you directly to the platform". So X API costs are on the customer's own X developer account.
- Their own worked examples: 500 to 3,000 posts = $19.00; 5,000 = $33.00; 10,000 = $68.00; 25,000 = $143 (PAYG) vs $129 (Business); 100,000 = $379 on Business. Break-even between plans: 22,200 posts/month.

Model: **per organization, usage-based, per delivered post**. Not per profile, not per seat. (measured)

Price history (sourced + measured): their /facts page lists as "Outdated" the third-party claim "Outstand costs $5/month for 1,000 posts, or $0.01 per post." Their own media kit still shows that $5 + $0.01 pricing (measured, /media-kit, 2026-11-12). Buffer's roundup (published 2026-05-28) still quotes "$0.01 per post" (sourced: https://buffer.com/resources/best-social-media-apis/). WoopSocial (2026-05-06) said managed-key pricing was "hidden and not publicly available" at that time (sourced, competitor: https://woopsocial.com/blog/outstand-alternatives). Inferred: Outstand moved from a $5 base + $0.01/post BYOK model to today's $19-with-3,000 model, with Managed Keys folded in, between May and November 2026.

### Same workloads on Outstand and Siar (inferred arithmetic from both price lists)

Siar counts "One post to many networks counts as one post" (siar-truth 1c). Outstand counts each account. So the gap depends on fan-out (accounts per post).

| Workload | Outstand deliveries | Outstand monthly | Siar plan | Siar monthly |
|---|---|---|---|---|
| 200 posts × 3 accounts | 600 | $19 | Starter (300 posts) | $19 |
| 1,000 posts × 5 accounts | 5,000 | $33 | Pro (10,000 posts) | $49 |
| 3,000 posts × 5 accounts | 15,000 | $93 | Pro | $49 |
| 10,000 posts × 5 accounts | 50,000 | $129 (Business) | Pro | $49 |
| 50,000 posts × 3 accounts | 150,000 | $629 (Business) | Business (100,000 posts) | $149 |

Honest read (inferred): Outstand is cheaper for a single brand doing a few hundred to a few thousand posts that fan out to several accounts (Siar Starter caps at 300 posts). Siar is cheaper once volume passes a few thousand multi-account posts, and it has a free start. Siar has a brand cap Outstand lacks: Pro allows 10 brands, so an agency with more clients needs Siar Business ($149). Siar's comment, upload, DM and daily per-network caps also apply (`docs/pricing.md`); Outstand bills only posts and DM conversations.

## 4. Networks and API features

### Networks: 12 (measured: home grid, /facts, /pricing.md)

Parsed from the home page capability grid (`cap-chip` vs `cap-chip off`), measured 2026-11-12:

| Network | Connect | post | schedule | analytics | media | comments | DMs |
|---|---|---|---|---|---|---|---|
| X (Twitter) | **your own app** | yes | yes | yes | yes | yes | yes |
| LinkedIn | Managed Keys | yes | yes | yes | yes | yes | no |
| Instagram | Managed Keys | yes | yes | yes | yes | yes | yes |
| TikTok | Managed Keys | yes | yes | yes | yes | no | no |
| Facebook | Managed Keys | yes | yes | yes | yes | yes | yes |
| Threads | Managed Keys | yes | yes | yes | yes | yes | no |
| Bluesky | app password | yes | yes | yes | yes | no | no |
| YouTube | Managed Keys | yes | yes | yes | yes | yes | no |
| Pinterest | Managed Keys | yes | yes | yes | yes | no | no |
| Google Business | **your own app** | yes | yes | yes | yes | yes | no |
| Vimeo | **your own app** | yes | yes | yes | yes | yes | no |
| Reddit | **your own app** | yes | yes | yes | **no** | yes | no |

- /linkedin claims "Publish to LinkedIn profiles and Company Pages with one API call." (measured, meta og:description)
- **Not supported** (measured: absent from the 12 and from the 1.1 MB docs): Mastodon, Discord, Slack, Snapchat, Telegram, WhatsApp. No ads, no social listening, no reviews management ("No social listening. No brand monitoring, sentiment analysis, or trend scraping." /llms.txt).
- Scheduling horizon: "Schedule up to 30 days ahead ... Past 30 days the API rejects the post outright" (measured: /white-label-social-media-management).

### API features (measured unless noted)

| Feature | Outstand |
|---|---|
| Auth | Bearer API key (docs). Code samples use the placeholder `ost_your_key`; whether real keys carry an `ost_` prefix is unverified (another docs sample uses `sk_live_...`) |
| Webhooks | Yes. `X-Outstand-Signature: sha256=...` HMAC-SHA256 "if signing secret is configured", so signing is **optional** (docs, /docs/webhooks). Events include `post.published`, `comment.received`, `conversation.started`, `message.sent/received/read/failed` |
| MCP | Hosted, remote, `https://mcp.outstand.so/mcp`, **30 tools**, OAuth one-click or API key; "same pricing as the REST API". Claude Code plugin with `/outstand:debug`, `/outstand:review` commands (docs). /claude says it is listed at claude.ai/directory/outstand (claim; the URL returned 403 to my fetch, so unverified) |
| SDKs | **No server SDK** on npm or PyPI. Only `@outstand-so/ui` 0.1.13, "React UI components" for the connect flow, **513 downloads** 2026-10-12 to 2026-11-10 (measured: npm registry + downloads API). Ayrshare claims Outstand has "generated TypeScript and Swift clients" (sourced, competitor: https://www.ayrshare.com/compare/outstand-api-alternative.md); I found no mention in the docs: unverified |
| CLI | None found (unverified). Docs only describe using the MCP from CLI clients |
| OpenAPI | Yes, e.g. `https://api.outstand.so/v1/conversations/openapi.json`; `/.well-known/api-catalog` |
| White-label OAuth | BYOK on any network puts your app name on the consent screen. Connect flow is **build-it-yourself**: your backend reads `/v1/social-accounts/pending/:sessionToken`, you render the page picker, then finalize (docs "White-labeling authentication flow"). No hosted, branded connect page found |
| Dashboard for end users | **None by design**: "there's no Outstand interface in front of your client" (/white-label...). Outstand has an account dashboard at /app for keys and connections |
| Analytics | Per-post and account metrics in one schema; CSV/BI export; "Analytics cover posts published through Outstand" |
| Comments | Read, reply, hide/unhide, delete, first comment; Threads pending-reply approval (docs sitemap) |
| DMs | Conversations API, 7 operations, "live" (/facts; they do not use the word GA); comment-to-DM on Instagram, Facebook Pages and X; IG quick replies (up to 13) and link buttons |
| Post import | `/docs/import-posts-from-a-social-account` exists (docs sitemap). Ayrshare's page says "No history endpoint documented" (sourced, competitor: https://www.ayrshare.com/compare/outstand-api-alternative.md), which this contradicts |
| Other | Idempotency keys, usage limits endpoint (`/docs/set-usage-limits`), account health check, video processing, "Known issues" pages (X token refresh, TikTok active-user cap, Facebook insights deprecation) |

## 5. SEO footprint (measured 2026-11-12)

### Pages, counted from sitemaps

robots.txt lists four sitemaps and declares `Content-Signal: search=yes, ai-input=yes, ai-train=no`; it explicitly allows GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended, and points to `/.well-known/ai-catalog.json` ("Agentmap").

| Sitemap | URLs | What's in it |
|---|---|---|
| /sitemap.xml | 42 | home, /mcp, /facts, /pricing.md, white-label, 5 comparison pages, 2 solution pages, 10 network pages, 9 `/mcp/<network>` pages, 8 AI-tool/MCP landing pages (the 7 AI-client pages + /social-media-mcp-server), privacy/dpa/terms |
| /blog/sitemap.xml | 63 | blog index + 62 posts (the /blog index links 50) |
| /docs/sitemap.xml | 99 | API reference, 12 network configuration guides, Conversations API, MCP setup/tools, known issues |
| /changelog/sitemap.xml | 121 | dated changelog entries (`/changelog/changelog-YYYY-MM-DD`), lastmod 2025-10-14 to 2026-11-11 |
| **Total** | **325** | |

By type:

- **Comparison / alternative pages: 5 standalone** (/ayrshare-alternative, /postiz-alternative, /sprout-social-alternative, /buffer-api, /hootsuite-api) **plus 15 blog posts**: outstand-vs-ayrshare, ayrshare-alternatives-for-developers, postiz-vs-outstand-ai-agent-posting, postiz-alternatives-self-hosted-vs-hosted-api, buffer-alternatives-2026, buffer-api-guide-2026, hootsuite-alternatives-2026, later-alternatives, loomly-alternatives, metricool-alternative, sprout-social-api-alternative, social-media-automation-tools-compared-2026, best-unified-social-media-apis-for-devs, best-mcp-servers-2026, best-social-media-mcp-servers-2026.
- **They do not mention bundle.social, Zernio/Late, Upload-Post, Post for Me or PostPeer anywhere** I could find (grep of all fetched pages and the full docs: zero hits for "bundle.social"; the word "bundles" appears only in its generic sense). Their own "10 Best Unified Social Media APIs" lists Outstand, Ayrshare, Buffer, Data365, Phyllo, Brandwatch, Hootsuite, Shortimize, Sprout Social, Nango.
- **Per-network API pages: 10** (no /vimeo or /reddit page), each an explainer of the native API ("how to get access", rate limits, error codes) plus Outstand's one-call version.
- **Per-network MCP pages: 9** (/mcp/linkedin, youtube, instagram, facebook, x-twitter, tiktok, pinterest, bluesky, threads), each "compares to scraper-based ... MCP servers".
- **AI-client pages: 7** (/ai-agents, /claude, /chatgpt-social-media, /cursor-social-media, /claude-code-social-media, /grok-bot, /social-media-api-for-ai-agents) plus /social-media-mcp-server.
- **Blog: 62 posts** heavy on native-API explainers: x-api-pricing, instagram-api-pricing, linkedin-api-pricing, youtube-api-pricing-quota, tiktok-content-posting-api, linkedin-api-restrictions, social-media-api-approval-by-platform, reddit-api-key-for-posting, facebook-instagram-long-lived-page-access-token, instagram-dm-api, x-dm-api, linkedin-mentions-api, threads-api, bluesky-api, pinterest-api, n8n / make.com automation, "post to LinkedIn and X from your Lovable app".
- **Glossary: none.** **Programmatic pages: light** (network × MCP only, ~19 templated pages). No locale/language versions.
- **GEO assets**: /llms.txt, /docs/llms-full.txt (1.1 MB), /pricing.md (machine-readable, with formulas and "Answers to common agent questions"), /facts (dated, "safe to quote", with a "Claims that are out of date" correction list), `.well-known/ai-catalog.json` with `representativeQueries`, MCP server card. Inferred: this is the most deliberate AI-answer-engine setup of any competitor reviewed so far; /facts exists to overwrite stale third-party roundups.
- Hygiene (measured): home links to two URLs that 301 (`/blog/single-api-multiple-social-media-dev-guide`, `/blog/best-apis-for-scheduling-posts-across-multiple-social-platforms`); `/docs/comparisons` 308s to /ayrshare-alternative. Blog sitemap lastmods are edit dates, not publish dates (founding post: lastmod 2026-08-27, published 2025-10-14).

### Top keyword targets (inferred from titles/H1s)

1. unified social media API / social media API for developers / social media API for AI agents
2. social media MCP server; LinkedIn / X / Instagram / YouTube / Facebook MCP server
3. Claude / ChatGPT / Cursor / Claude Code / Grok + "social media" ("can Claude post to LinkedIn")
4. Instagram API, Instagram DM automation, comment to DM automation API
5. X (Twitter) API, LinkedIn API, Facebook API, TikTok Content Posting API, YouTube upload API, Pinterest API, Google Business Profile API, Threads API, Bluesky API
6. X / Instagram / LinkedIn API pricing, YouTube API quota
7. white label social media management (software), social media analytics API, exportable social media reports
8. Ayrshare alternative, Postiz alternative, Sprout Social alternative, Buffer API, Hootsuite API, Buffer/Hootsuite/Later/Loomly/Metricool alternatives

### Branded demand (inferred)

Google autocomplete (measured 2026-11-12, MY locale; re-run in the verification pass): "outstand api", "outstand so api", "outstand social media api", "outstand social media", "outstand alternative", "outstand so reddit", "outstand so review", "outstand.so pricing". "outstand" alone completes to "outstanding ..." (the brand name is a common word, so generic brand search is noisy). Inferred: small but real branded and "alternative" demand.

### Who links to them / talks about them

- **Competitor "Outstand alternative" pages** (each is a backlink-free mention at best, but proves competitors see Outstand as worth targeting): Ayrshare https://www.ayrshare.com/compare/outstand-api-alternative/ (updated 2026-10-23), Zernio https://zernio.com/blog/outstand-alternative, PostPeer https://www.postpeer.dev/alternatives/outstand, SocialCrawl https://www.socialcrawl.dev/vs/outstand, WoopSocial https://woopsocial.com/blog/outstand-alternatives, SocialClaw https://getsocialclaw.com/outstand-alternatives. (each fetched 2026-11-12 and confirmed to be an Outstand comparison page.) Xquik's https://docs.xquik.com/alternatives/outstand now redirects to a generic page, "X (Twitter) API alternatives compared by price" (https://docs.xquik.com/twitter-api-alternatives), which mentions Outstand in one card; it is not an Outstand-alternative page (measured 2026-11-12).
- **Roundups**: Buffer's "Best Social Media APIs for Developers in 2026" includes Outstand (2026-05-28; says "No MCP server", which is stale) (sourced: https://buffer.com/resources/best-social-media-apis/); social-api.ai, ryandoser.com, dev.to, Stackademic and breakreach.com roundups also name it (from the original search results; not opened, and not re-checked in the verification pass because the search budget was spent: unverified).
- **Directories**: SourceForge listing "Outstand" with no ratings: "This software hasn't been reviewed yet" (https://sourceforge.net/software/product/Outstand.so, checked 2026-11-12; the Slashdot mirror was not checked: unverified); mcpservers.org (https://mcpservers.org/servers/outstand-mcp; returned 403 on 2026-11-12, so unverified); Claude connector directory (claimed by Outstand).
- **GitHub**: org `outstand-so` created 2025-10-28, 3 public repos (claude-code-marketplace, grok-bot-agent-plugin, outstand-agent), all 0 stars (measured: GitHub API). Founder-filed listing requests: Pipedream app request issue #22027, opened 2026-09-21 by koslib, still open, described on the page as filed by an automated agent (sourced: https://github.com/PipedreamHQ/pipedream/issues/22027); awesome-remote-mcp-servers PR #483 (see section 6).
- **Product Hunt**: no Outstand launch found (original search, 2026-11-12; producthunt.com returned 403 to direct fetch again in the verification pass, so this is unverified). **Hacker News**: 0 hits for "outstand.so" (measured: HN Algolia API). **G2**: a G2 "Outstand" listing exists but search results describe it as a different product (an email tool) (unverified).

## 6. Weaknesses

### Real user/third-party signals (thin; there is little independent discussion)

- **No independent reviews.** SourceForge/Slashdot shows 0 ratings. Ayrshare says "No customer reviews available." (competitor source). No Reddit threads found in the original search (WebSearch, extended, 2026-11-12), even though Google autocompletes "outstand so reddit". Not re-run in the verification pass (search budget spent), so treat "no Reddit threads" as unverified. No HN posts.
- **MCP connector reported unhealthy for weeks.** The founder's PR to add Outstand to awesome-remote-mcp-servers was closed unmerged on 2026-10-09 after the maintainer reported "Glama connector health is Unhealthy" on 2026-09-23 and repeated it through 2026-10-08: "we haven't seen any movement on making the connector Healthy." (sourced: https://github.com/punkpeye/awesome-remote-mcp-servers/pull/483). Glama's own connector page still shows "Unhealthy", last tested 2026-11-11 20:38, "The last two health checks of this connector failed" (sourced: https://glama.ai/mcp/connectors/so.outstand/outstand, checked 2026-11-12). Inferred: Glama's probe may fail on OAuth or auth rather than real downtime; this does not prove the server is down for customers.
- **Stale/conflicting facts everywhere.** Outstand itself keeps a "Claims that are out of date" list on /facts (no MCP; $5/1,000 posts; no DMs; BYOK-only). Inferred: their product and prices changed fast enough in 2026 that roundups describe a different product.
- Competitor criticisms (biased sources, labelled): no free tier and "always required to use their paid tier" (WoopSocial, 2026-05-06); per-action pricing; "Outstand meters posts, so publishing one update to several accounts uses multiple posts" (Ayrshare, 2026-10-23); "Review support options and response commitments with Outstand" and "Confirm current security and service commitments with Outstand" (Ayrshare, 2026-10-23).

### Gaps measured on their own site

1. **Every delivery is billed.** One post to 5 accounts = 5 billable posts (/pricing.md). Failed deliveries count too.
2. **No free tier, no trial, no yearly plan, card only, USD only** (/pricing.md).
3. **X needs your own X developer app** and you pay X directly; same for Google Business Profile, Vimeo, Reddit. That is "hours-to-days of platform paperwork" in their own words (home).
4. **No end-user UI.** No composer, calendar, inbox or hosted connect page. You build it all; the React components package has 513 monthly downloads.
5. **No SLA on any self-serve plan**, while the white-label page hero says "SLAs for availability & support." Contradiction on their own site (measured: /white-label-social-media-management vs /pricing.md).
6. **Thin proof.** Two-person team, not SOC 2, the only named "trusted by" logo with context is their own ScheduleThreads, 27 unexplained logo names, no testimonials, no case studies.
7. **Inconsistent platform count**: "X, LinkedIn, Instagram, and 11 more" (14) on home, "and 7 more" (10) in the media kit, 12 in fact.
8. **Coverage holes**: no comments on TikTok, Bluesky or Pinterest; Reddit has no media; DMs only on Instagram, Facebook, X; no Mastodon, Discord, Slack; 30-day scheduling limit.
9. **Webhook signing is optional** ("if signing secret is configured").
10. **Not localised**: English and USD only. Nothing for Malaysia or Southeast Asia (no ringgit, FPX, DuitNow, Bahasa Melayu).

### Gaps Siar can exploit honestly (each checked against siar-truth.md)

| Outstand gap | What Siar can say (allowed wording) |
|---|---|
| Per-delivery billing | "One post to many networks counts as one post." |
| No free tier | "20 free posts to try", no card |
| X needs your own developer app | Siar posts to X through Siar's own X app, "at X's own price, in USD" from a prepaid credit; no X developer account needed (siar-truth 1c) |
| No end-user UI | "A dashboard built on the same API (composer, calendar, posts, inbox, analytics, media, bulk CSV, teams, API keys, webhooks, billing)", plus link in bio |
| Build-your-own connect flow | "Hosted connect link: your brand name, logo and accent colour" (say "branded", never "fully white-label" or "on your domain") |
| No Mastodon / Discord / Slack | Siar publishes to Mastodon, Discord and Slack today |
| USD/card only | Ringgit for Malaysia, yearly by FPX/DuitNow, yearly = 10× monthly, price lock |
| Optional webhook signing | "16 HMAC-signed event types, retried with backoff", delivery log, resend, secret rotation |
| No bundle.social page | Siar is wire-compatible with bundle.social v1 (naming bundle.social publicly is parked, per siar-truth) |

**Where Outstand is ahead today, so do not compete there yet** (siar-truth section 2): live TikTok, public YouTube, Pinterest publishing, LinkedIn company pages, Google Business, Reddit, Vimeo; DMs that are live for every customer (Siar's are a per-organization beta, Facebook and Instagram only); a hosted MCP server that is live and promoted (Siar's MCP/SDK/CLI are not on npm yet); scale numbers (Siar has none to state); post-volume pricing below ~7,300 deliveries a month (Outstand stays at or under $49, Siar Pro's price, up to 7,285 deliveries; Siar Starter caps at 300 posts) (inferred arithmetic from /pricing.md). Copy on Siar's site must not claim network breadth or MCP parity against Outstand until those are true.

## 7. How Siar should position against them (one line)

**Outstand is a metered pipe you build your own app on; Siar is the API plus the app (dashboard, branded connect link, inbox, link in bio) priced per organization, where one post to every network counts once, X works without your own developer account, you start with 20 free posts to try, and Malaysians pay in ringgit.**

---

### Sources (all checked 2026-11-12)

Outstand (measured): https://www.outstand.so/ · /pricing.md · /facts · /llms.txt · /robots.txt · /sitemap.xml · /blog/sitemap.xml · /docs/sitemap.xml · /changelog/sitemap.xml · /docs/llms-full.txt · /.well-known/ai-catalog.json · /media-kit · /mcp · /white-label-social-media-management · /ayrshare-alternative · /postiz-alternative · /sprout-social-alternative · /buffer-api · /hootsuite-api · /instagram · /x · /linkedin · /facebook · /tiktok · /threads · /bluesky · /youtube · /pinterest · /google-business · /solutions/comment-to-dm · /solutions/exportable-social-media-reports · /social-media-mcp-server · /social-media-api-for-ai-agents · /ai-agents · /claude · /chatgpt-social-media · /cursor-social-media · /claude-code-social-media · /grok-bot · /blog · /blog/our-journey-to-outstand · /blog/a-new-era-for-outstand · /blog/best-unified-social-media-apis-for-devs

Registries (measured): https://registry.npmjs.org/-/v1/search?text=outstand · https://api.npmjs.org/downloads/point/last-month/@outstand-so/ui · https://api.github.com/orgs/outstand-so · https://hn.algolia.com/api/v1/search?query=outstand.so · Google autocomplete (suggestqueries.google.com)

Third party (sourced): https://glama.ai/mcp/connectors/so.outstand/outstand · https://www.ayrshare.com/compare/outstand-api-alternative.md · https://buffer.com/resources/best-social-media-apis/ · https://woopsocial.com/blog/outstand-alternatives · https://github.com/punkpeye/awesome-remote-mcp-servers/pull/483 · https://github.com/PipedreamHQ/pipedream/issues/22027 · https://sourceforge.net/software/product/Outstand.so · https://mcpservers.org/servers/outstand-mcp · https://zernio.com/blog/outstand-alternative · https://www.postpeer.dev/alternatives/outstand · https://www.socialcrawl.dev/vs/outstand · https://getsocialclaw.com/outstand-alternatives · https://docs.xquik.com/twitter-api-alternatives (redirect target of /alternatives/outstand)
