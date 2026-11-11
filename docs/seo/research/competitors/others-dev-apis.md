Verified 2026-11-12: 20 corrections

# Competitor teardown: the other developer social APIs

> **Verification note (adversarial re-check, 2026-11-12).** Every vendor page cited below was re-fetched (raw HTML via
> curl, sitemaps walked, GitHub REST API, Google autocomplete re-run) and compared line by line. Siar claims were checked
> against `apps/api/src/domain/plans.ts`, `apps/api/prisma/schema.prisma`, `apps/api/src/modules/accounts.ts`,
> `packages/mcp/src/server.ts` and `siar-truth.md`. The two biggest fixes are about **Siar**, not the rivals:
> (1) a Siar brand (team) holds **at most one account per network** (`schema.prisma` header: "at most one live
> SocialAccount per network per team"; `accounts.ts` line 106 replaces the existing account of that type), so the
> earlier "unlimited accounts inside a brand / two Instagram accounts in one brand" advantage was false;
> (2) Siar caps X at **15 posts per account per day** on Starter, Pro and Business and 5 on Free (`plans.ts` line 81
> `TWITTER: caps(5, 15, 15)`), which is *lower* than Postproxy's 20, so the X-cap attack on Postproxy was removed.
> The web-search budget for this session was used up before the "who ranks" SERP sample could be re-run; instead the
> 17 roundup pages were re-fetched and every vendor mention recounted (results match except bundle.social, 4 not 3),
> and autocomplete was re-run for 11 queries (all match). No SERP-position claim in this file is re-verified: treat
> any "ranks" wording as unverified. Full change list in section 11.

Checked 2026-11-12. This file covers the unified social media / posting APIs **not** already torn down in this
folder (`ayrshare.md`, `buffer.md`, `bundle-social.md`, `late.md` (Zernio), `mixpost.md`, `outstand.md`,
`postiz.md`, `upload-post.md`). It finds every other one a developer comparing options would meet in 2026, then
profiles the six that matter most.

Labels:

- **[measured]**: I fetched the page, file, sitemap or API myself on 2026-11-12 (raw HTML via curl, sitemaps walked
  to the leaf, GitHub REST API, Google autocomplete).
- **[sourced]**: the vendor's own page, URL given, checked 2026-11-12.
- **[third-party]**: someone else's page (often a rival vendor), URL given.
- **[inferred]**: my reading or estimate.
- **[unverified]**: I could not confirm it.

Siar facts come from `docs/seo/research/siar-truth.md` (checked 2026-11-12), `docs/pricing.md` and, since the
verification pass, the code files named in the note above. Note for the owner of `siar-truth.md`: its line "Unlimited
connected social accounts on every plan" is true only as "no account count"; each brand holds one account per network
(`schema.prisma`), so Starter and Free reach at most one account on each network. There is no keyword-volume API: demand notes are inferred from autocomplete and
from how often a name shows up in roundups.

---

## 1. The field: every other developer social API found

### How I found them

1. Web searches (standard and extended) for "unified social media API", "Ayrshare alternatives", "social media
   posting API", "social media MCP", Product Hunt and GitHub variants.
2. I fetched **17 roundup / "alternatives" articles** that rank social APIs and counted which names each one mentions
   [measured]: Buffer x2, Zernio x2, Blotato x2, PostPlanify, dev.to (haneem), SocialClaw x2, FeedHive, WoopSocial,
   Data365, PostEverywhere, Social Champ, SocialAPI.ai, Mallary (URLs in section 10). Almost all are written by a
   vendor with a stake. The count is a proxy for "how often a buyer meets this name", not for quality.
3. Competitor pages that list rivals: Blotato's blog alone has 90+ "X vs Blotato" / "X alternatives" posts
   (sitemap, measured), Postproxy has 9 `/compare/*` pages, SocialAPI.ai 10 `/alternatives/*`, Post for Me 8
   `/compare/*`. Those lists added names I would not have found by search (Bolta, Supapush, Uplika, RobinReach,
   Postqued, PlanVortex).

### Mentions across the 17 roundups [measured]

Already covered in sibling files: Buffer 17/17, Ayrshare 17, Postiz 16, Zernio/Late 14, Outstand 12,
Upload-Post 7, bundle.social 4 (Zernio top-12, dev.to haneem, WoopSocial, PostEverywhere; corrected from 3 on re-count),
Mixpost 3.

New names: **Blotato 12**, Hootsuite 12, **Publer 9**, Metricool 9, Sprout 9, Zapier/Make 9, **Post for Me 6**,
Agorapulse 6, SocialBee 4, **SocialAPI.ai 3**, **Unipile 3**, PostPlanify 3, Sendible 3, Brandwatch 3,
**WoopSocial 2**, Vista Social 2, SocialPilot 2, SocialClaw 2, PostEverywhere 2, Planable 2, Phyllo 2, Data365 2,
ContentStudio 2, Ocoya 1, Mallary 1, FeedHive 1, Social Champ 1, Typefully 1, Hypefury 1, Postly 1.
**Postproxy 0** in these 17, but it has its own Product Hunt launches and is named in Blotato's
"Zernio alternatives" post [third-party: https://www.blotato.com/blog/zernio-alternatives].
**Siar: 0** mentions.

### The full list (one line each, from each vendor's own `<title>` / meta description, fetched 2026-11-12)

| Vendor | URL | What it says it is (own words, trimmed) | Type | Relevant to Siar? |
|---|---|---|---|---|
| **Blotato** | blotato.com | "#1 Social Media APIs for AI Agents, ChatGPT, & Claude" | Creator app + API + hosted MCP | Yes, profiled |
| **Postproxy** | postproxy.dev | "Social Media API for Agencies, SaaS & AI Agents" | Dev API + MCP | Yes, profiled |
| **Post for Me** | postforme.dev | "Unified Social Media Posting API" | Dev API, open source (AGPL) | Yes, profiled |
| **SocialAPI.ai** | social-api.ai | "Unified Social Media API for AI Agents & Developers" | Dev API, inbox-first + MCP | Yes, profiled |
| **WoopSocial** | woopsocial.com | "Unified Social Media API & MCP for AI Agents" | Scheduler + API + MCP | Yes, profiled |
| **Publer (API)** | publer.com | "Powerful Social Media Management & Scheduling Tools" | Scheduler; API on Business plan | Yes, profiled |
| Unipile | unipile.com | "One API for Multi-Channel Messaging in your app" | LinkedIn/WhatsApp/IG/Telegram DMs + email + calendar. LinkedIn, WhatsApp, Instagram "by reverse engineering" (its own llms.txt) | Inbox-adjacent only. Not a posting API |
| Data365 | data365.co | "Social Media APIs for Developers" | Read/search data API | No (read-only data) |
| Phyllo | getphyllo.com | "APIs for accessing social data" | Creator data (public + consented), 25+ platforms | No (data) |
| Social Fetch | socialfetch.dev | "Social Media Scraping API — 884 Endpoints" | Scraper | No |
| EnsembleData | ensembledata.com | "Social Media Data Scraper APIs" | Scraper | No |
| Publora | publora.com | "Social Media Scheduler & Publishing API for AI Agents", 10 platforms, "Pay per connected account" (home H2) | Scheduler + API + MCP | Minor |
| Mallary.ai | mallary.ai | "The Best Social Media Posting API for Developers & AI Agents", 10 networks | Scheduler + API + MCP | Minor |
| posterly | poster.ly | "Social Media Scheduling for 18 Platforms"; REST API, MCP, CLI | Scheduler + API | Minor |
| SocialClaw | getsocialclaw.com | "Social Media Scheduling for AI Agents (OpenClaw, Claude & more)" | Agent scheduler + API | Minor |
| PostEverywhere | posteverywhere.ai | "Social Media Scheduling Tool for AI Agents"; "API, SDK, MCP, and CLI" (H2) | Scheduler + API | Minor |
| PostSyncer | postsyncer.com | "Social Media Scheduler for 11+ Platforms" with "an MCP and REST API for agents" | Scheduler + API | Minor |
| Postqued | postqued.com | "Agentic Social Media Scheduling Tool", "10 networks, from $19/month" | Agent scheduler | Minor |
| RobinReach | robinreach.com | "Let Claude, ChatGPT & Codex Post For You Everywhere", 13 platforms | Agent scheduler | Minor |
| Uplika | uplika.com | "Social media MCP server and API for AI agents" (Threads, IG, YouTube, FB, Telegram, Naver Blog) | MCP | Minor (Korea angle) |
| PlanVortex | planvortex.com | Spanish-language: "Panel, API y servidor MCP. 2 cuentas gratis" | Scheduler + API | Minor (ES market) |
| Repliz | repliz.com | "Social Media Comment Automation"; API at api.repliz.com via third-party skill pages only | Comment automation | Minor; official API docs not found [unverified] |
| Nuelink | nuelink.com | "Social Media Scheduling and Automation for 12 Platforms"; "let Claude or ChatGPT post for you" | Scheduler + agent | No (app) |
| Sociality.io | sociality.io | "Social Media Management Tools and MCP" | SMM + MCP (data) | No (app) |
| Vista Social | vistasocial.com | "The #1 AI social media management tool" | SMM app | No (app) |
| Ocoya | ocoya.com | "Your marketing copilot" | AI SMM app | No (app) |
| PostPlanify, Metricool, ContentStudio, Social Champ, SocialBu, FeedHive, Post Bridge, PostFast, OnlySocial, Bolta, Supapush, Crosspost, Hookle | various | All position as schedulers / AI social managers; some sell API access on higher plans | SMM apps | No (they appear in API roundups, but a developer embedding social into a product would not pick them) |

[inferred] The market split in 2026 is clear from the titles: (a) **dev APIs for embedding** (Postproxy, Post for Me,
SocialAPI.ai, plus the eight sibling files), (b) **"post from your AI agent" tools** that sell an MCP server to
operators (Blotato, WoopSocial, Publora, Mallary, SocialClaw, Postqued, RobinReach, Uplika), (c) **schedulers with an
API bolted on** (Publer, Metricool, posterly, PostEverywhere), (d) **data/scraping APIs** that share the keyword
"social media API" but do not publish (Data365, Phyllo, Social Fetch, EnsembleData), (e) **messaging APIs**
(Unipile). Siar competes in (a) and partly (b).

### Why these six

Blotato (most-mentioned new name, 12/17, and the biggest SEO machine), Publer (9/17, the scheduler developers
keep meeting), Post for Me (6/17, closest pricing model to Siar: unlimited accounts), Postproxy (closest product to
Siar: API + comments + DMs + white-label, aimed at SaaS), SocialAPI.ai (inbox-first, prices per brand, the cheapest
multi-brand offer), WoopSocial (the loudest "cheapest per profile" claim, free API tier). Unipile is the only other
candidate, but it does messaging through reverse engineering and does not publish; it gets the row above, not a profile.

---

## 2. Blotato (blotato.com)

### Who
- Blotato Inc., 50 W Broadway Ste 333, Salt Lake City, UT; `foundingDate` 2024 [measured: home JSON-LD].
- Founder Sabrina Ramonov writes the research pages [sourced: https://www.blotato.com/llms.txt]. The pricing FAQ
  sells the founder story: "built and used by an operator who actually grew the audience (3M+ followers, 500M+ views)"
  [sourced: https://www.blotato.com/pricing].
- Self-description: "Agent infrastructure for social media marketing. One API and MCP server, 9 platforms." (footer)
  [sourced].

### Home page copy (https://www.blotato.com/, measured 2026-11-12)
- `<title>`: **Blotato | #1 Social Media APIs for AI Agents, ChatGPT, & Claude**
- Meta description: "The social media API and MCP server for AI agents, ChatGPT, and Claude. Publish to 9 platforms,
  read analytics, run Instagram and Facebook DMs."
- Eyebrow: "SOCIAL MEDIA API FOR AI AGENTS"
- H1: **"Social Media Automation Inside ChatGPT & Claude"**
- Subhead: "Unified API + MCP to post, schedule, reply to comments, manage DMs, and track analytics across 9+ social
  platforms - no code required."
- CTAs: **"Start free"** (twice), **"Read the docs"**. Under: "Flat pricing, unlimited posts, 20 accounts to start".
- H2s in order: "Everything your agent can do." / "Make video anywhere. Publish everywhere." / "I built Blotato
  because I needed it." / "10,000+ operators, all shipping more ." / "Point your agent at Blotato." / "Real
  questions. Straight answers." / "Make a week of content in the next 60 seconds."
- H3s: "One call. Nine platforms." / "Queue it, or find the next open slot." / "Read the inbox. Reply from the
  agent." / "Comment a keyword, get the link." / "Ask which post actually worked." / "Infographics, carousels,
  slideshows, video." / "Point it at anything, get a post." / "Works inside the agent you already use."
- Proof (none verified by me): "667K+ posts published last month", "1,800 requests per hour", "Thousands of paying
  teams", "10,000+ Business owners on the platform", "500M+ Views generated by the founder". Pricing page: "4.8/5 on
  Trustpilot, 383 reviews" and "4.6/5 on G2"; 8 customer videos and 13 named case studies ("How Calvin Hia Got 3,000
  Leads From Instagram DMs in 30 Days", etc.) [sourced: /pricing].
  - Trustpilot: TrustScore 4.8, **384 reviews**, 89% five-star, 4% one-star [third-party: https://www.trustpilot.com/review/blotato.com, fetched 2026-11-12].
  - G2: a search summary says Blotato's G2 page shows **1 review** and "not enough reviews ... to provide buying
    insight", which conflicts with "4.6/5 on G2" [third-party: https://www.g2.com/products/blotato-ai/reviews_and_filters; unverified, G2 returned 403 on re-check].
    Blotato's own ratings page gives G2 "4.6 / 5" with **no review count**, and says G2 blocks its automated re-check
    [sourced: https://www.blotato.com/blog/blotato-ratings-trustpilot-g2-capterra, checked 2026-11-12].
  - Capterra: 4.8 (132) [third-party search summary; unverified]. Blotato's own ratings page says 4.8 from **128**
    reviews as of 6 October 2026 [sourced: same URL].

### Other landing pages (titles/H1s, measured)
| URL | `<title>` | H1 |
|---|---|---|
| /social-media-api | Social Media API for AI Agents: 9 Platforms, One Key \| Blotato | Social media API for AI agents: nine platforms, one key |
| /mcp | Social Media MCP Server: Publish to 9 Platforms With Any AI Agent | Social media MCP server for any AI agent |
| /api/instagram | Instagram Posting API for AI Agents \| Blotato Social Media API | Instagram posting API: feed, Reels, Stories, social media agents |
| /blotato-alternatives | Blotato Alternatives: Comparing Social Media Tools in 2026 | Blotato Alternatives : Comparing Social Media Tools in 2026 |

### Pricing (https://www.blotato.com/pricing, checked 2026-11-12) [sourced]
| Plan | Price | Accounts | AI credits / mo | DM + comment-reply "active contacts" / mo |
|---|---|---|---|---|
| Starter | $29/mo | 20 social media accounts | 1,250 | 1,000 |
| Creator | $97/mo | 40 | 5,000 | 6,000 |
| Agency | $499/mo | 100 (llms.txt; pricing card says "Everything in Creator") | 28,000 | 15,000 |

- Billing unit: **per account, in plan bands** (20/40/100). Posts unlimited ("No per-post fees"). Starter: "Up to
  900 TikTok posts/month".
- **No free plan.** 7-day trial needs a card, and "The trial covers the web app, but not the API or the MCP server.
  Generating an API key in Settings > API ends the trial right away and starts your paid subscription".
- Yearly: "pay for 10 months and get 12". Refund: email within 14 days "if something genuinely doesn't work".

### Networks and API [sourced: https://www.blotato.com/llms.txt]
- Publish/schedule: X, LinkedIn (profile or company Page), Facebook, Instagram, Pinterest, TikTok, Threads, Bluesky,
  YouTube (9). **No** Reddit, Mastodon, Discord, Slack, Google Business, Telegram, WhatsApp.
- Analytics: 8 platforms, "LinkedIn returns no metrics yet". Comments and DMs: **Instagram and Facebook only**. DM
  automations (comment keyword → DM) shipped 2026-08-06, IG/FB only.
- REST at `https://backend.blotato.com/v2`, header `blotato-api-key`. Hosted MCP `https://mcp.blotato.com/mcp`
  (OAuth or key), listed in Claude's connector directory and the ChatGPT plugin directory (listed 2026-11-04).
  Official n8n and Make nodes. Webhook appears in the home "plays nicely" strip [measured]; no webhook event list
  found [unverified].
- **White-label OAuth: none found.** The pitch is the opposite: "No per-platform SDKs, no OAuth apps to get
  approved" (home). It is built for operators posting to their own accounts [inferred].
- Self-imposed caps: Instagram 50 posts/account/24h, LinkedIn 50, Facebook 25 per Page, YouTube 10 uploads/channel on
  Starter [sourced: llms.txt].

### SEO footprint [measured: https://www.blotato.com/sitemap-index.xml]
- **362 URLs**: 278 blog, 24 free tools, 11 `/ai-agent/*` (one page per agent client: Antigravity, Claude Code,
  Cline, Cowork, Gemini, Copilot, Replit, Windsurf...), 9 `/api/<network>`, 9 `/mcp/<network>`, 6 `/research/*`, plus
  client pages (/claude, /chatgpt, /codex, /cursor, /grok-bot, /hermes, /openclaw, /meta-muse, /chatgpt-dots).
- Programmatic comparison machine: 42 `*-vs-*` posts naming Blotato (re-counted in `sitemap-0.xml`; was "~45") (Ayrshare, bundle.social, Zernio, Post for Me, Postiz,
  Upload-Post, Publer, SocialClaw, PostFast, Vista Social, Ocoya...), 48 URLs containing `alternatives` (including
  `postproxy-alternatives`, `socialapi-alternatives`, `woopsocial-alternatives`, `post-for-me-alternatives`,
  `bundle-social-alternatives`), plus `<network>-api-pricing` posts for 8 networks and roundups
  (`best-social-media-api-tools`, `best-social-media-mcp-servers`, `best-social-media-scheduling-apis`).
- Link bait: 6 "research" studies with downloadable CSV/JSON ("Social Media API Breaking Changes Report 2026",
  "MCP Servers for Social Media Automation: 2026 Statistics" (891 servers), "Social Media Tools for AI Agents: 2026
  API and MCP Pricing" (58 tools)). Each says "Free to quote, cite and reuse with a link to the study".
- llms.txt is 57 KB and very detailed; robots.txt sets `Content-Signal: search=yes, ai-input=yes, ai-train=yes`.
- Keyword targets [inferred from titles/H1s]: "social media API for AI agents", "social media MCP server",
  "<network> posting API", "<network> API pricing", "<competitor> alternatives", "<competitor> vs".
- Backlink signals: named in 12 of the 17 roundups [measured]; Ryan Doser's "10 Best Social Media APIs" ranks it
  first [third-party: https://ryandoser.com/social-media-api/, fetched 2026-11-12] and Ryan Doser also appears as a
  Blotato case study [sourced: /pricing]. The roundup itself discloses Blotato affiliate links, a comped account and
  that Blotato is the author's client, so it is not independent [third-party, fetched; previously only inferred]. YouTube creators' reviews (Nate Herk, Ryan Doser,
  Duncan Rogoff) are linked from the pricing page [sourced]. Autocomplete for "blotato" returns 10 suggestions,
  including "blotato api", "blotato mcp", "blotato alternatives", "blotato vs metricool"; "blotato api" returns
  "blotato api key free", "blotato api pricing", "blotato api n8n" [measured].

### Weaknesses and complaints
- Third-party reports of failed posts (Capterra, via search summary, **not fetched**: Capterra returned 403):
  vague errors on failed LinkedIn posts, internal retries that "were creating live duplicate posts while reporting the
  post as failed" for about a week, a pipeline that "failed silently for eight days", no bulk retry
  [third-party: https://www.capterra.com/p/10053855/Blotato/reviews/?page=2; unverified].
- Trustpilot 1-star, 2026-08-29: "Can not cancel subscription. Cant close pop up" [third-party: Trustpilot].
- Blotato's own ratings page says: "In March, Blotato had 12 reviews on Trustpilot and a TrustScore of 2.0."
  [sourced: https://www.blotato.com/blog/blotato-ratings-trustpilot-g2-capterra, fetched 2026-11-12; was unverified].
- Product gaps [sourced]: no free plan, API not in the trial, comments/DMs only on IG/FB, no LinkedIn analytics,
  account caps per band, no white-label connect, 9 networks.
- Zernio calls it "a creator tool with an API attached, not infrastructure" [third-party:
  https://zernio.com/blog/unified-social-media-api, fetched 2026-11-12; wording confirmed on the page].

### Gaps Siar can use honestly
- **Never posts twice** is a code guarantee in Siar (`publisher.ts`), against public duplicate-post complaints.
  Say the guarantee; do not name Blotato on that point (complaint is unverified).
- **Branded connect link** for your own customers; Blotato has none.
- **Verbatim network errors + public per-network error pages**, against "vague errors" complaints.
- **20 free posts to try, no card, API included**; Blotato's API needs a paid plan from the first key.
- **No account count on any plan** vs Blotato's 20/40/100 bands. Precise form: Siar counts brands, and each brand holds
  one account per network (`schema.prisma`, `accounts.ts` line 106). So Starter (1 brand) reaches at most one account
  on each open network; account volume grows with brands (Pro 10, Business unlimited) [code; corrected from
  "unlimited accounts on every plan" with no qualifier].

**Siar vs Blotato, one line:** Blotato is a content tool for operators posting to their own accounts; Siar is the API
you build your product on: your customers connect through your branded link, every post is claimed once, and every
failure comes back verbatim.

---

## 3. Postproxy (postproxy.dev)

### Who
- Berlin, Kolonnenstr. 8; `foundingDate` 2026 [measured: home JSON-LD]. Blog author Denis Baranov [measured: sitemap
  `/blog/author/denis-baranov/`]. Impressum page exists [measured].
- Product Hunt: tagline "Publish, reply, and analyze social media via API"; launches 2026-02-04 ("Postproxy") and
  2026-06-25 ("Postproxy - Engagement API"); 337 followers; 1 review (5.0) asking for "a sandbox to test with"
  [third-party: https://www.producthunt.com/products/postproxy, fetched 2026-11-12]. Sandbox mode now exists
  [sourced: llms.txt].
- GitHub org `postproxy`: 14 repos, SDKs in Python, Node, Go, Ruby, PHP, .NET, Java (all 0 stars), MCP server
  (4 stars), n8n node, Claude plugin [measured: GitHub API].

### Home page copy (https://postproxy.dev/, measured)
- `<title>`: **Postproxy — Social Media API for Agencies, SaaS & AI Agents**
- Meta description: "Unified social media API for agencies, SaaS, and AI agents. Publish, manage comments, DMs, and
  reviews across Instagram, TikTok, LinkedIn, X, YouTube, Facebook, Threads, Bluesky, and more."
- Badge: "SOC 2 Type II certified"
- H1: **"Social media API and MCP for agents and apps"**
- Subhead: "It takes two minutes from here to start managing messages, publishing, engagement, and analytics."
- CTAs: **"Get Started"**, **"See Pricing"**; footer CTA "Get It Started" / "View Documentation" under "Start with
  our free plan and scale as your needs grow. No credit card required."
- H2s: "Trusted by Teams AT" / "Everything you need to ship social" / "Supported platforms" / "Why teams choose
  Postproxy" / "Serious about where your data lives." / "SaaS products, automation pipelines, agencies" / "What
  customers say" / "Ready to get started?"
- H3s: "One API for the whole social stack" / "The full engagement flow" / "Know what happened" / "Built for agents"
  / "Plugs into your automations" / "Reviews and Google Business" / "Easy to start — tooling is already there" /
  "Official APIs and verified integrations" / "Support from people who read the logs" / "Fast, secure production
  infrastructure" / "Security at core" / "Europe hosted" / "Compliant by design"
- Proof: logo strip of 20 small names (alt text: Pro Software, Atelier Mesure, Silver Ponies, Chainboard, Authentic
  Commerce, Doglish, Nestmetrics, Nordic Leads, Illumina, Kerberos, Crabtree...) with "Read Case Study" links;
  3 case studies (/customers/clout, /customers/miingl, /customers/rabe-marketing); 6 named testimonials (Vendedor
  Global, Rabe Marketing, miingl, Seresa.io, Needle, one developer). One testimonial: "Claude AI gave us the
  recommendation." Numbers: "35ms avg response", "150ms p95 latency", "99.97% uptime", "processed millions of API
  requests" [measured; none verified].

### Other landing pages (measured)
| URL | `<title>` | H1 |
|---|---|---|
| /social-media-api/ | Social Media API — One Integration for 12 Platforms \| Postproxy | The social media API |
| /solutions/saas/ | SaaS Social Workflow Infrastructure \| Postproxy | Embed the full social workflow in your SaaS |
| /white-label/ | (fetched) | White label where users actually look |
| /compare/blotato/ | Blotato vs Postproxy: Social Media API Comparison | The Blotato Alternative for Publishing |
| /platforms/tiktok/ | TikTok API — Video & Photo Publishing Integration \| Postproxy | TikTok API for video & photo posts |

### Pricing (https://postproxy.dev/pricing/, checked 2026-11-12) [sourced]
Free start: "Start free with 10 posts" (llms.txt: "10 posts free, no credit card required"). The pricing FAQ is more
precise: "You can publish up to **10 posts per month** using our API or dashboard ... No credit card required", so the
free allowance recurs monthly [sourced: /pricing/ FAQ 06; corrected from a one-off "10 posts"]. Annual billing "is not
yet available" for Agentic and Business [sourced: FAQ 03]. Then two billing models:

| Plan | Base | Included | Volume pricing beyond |
|---|---|---|---|
| **Agentic** ("For AI agents and automations ... Billed per connected profile") | $17/mo | 5 profiles | 6–10: $4/profile; 11–25: $3; 26–50: $2; 51–100: $1.50; 101+: $1 |
| **Business** ("For SaaS products and agencies ... Billed per connected profile group") | $49/mo | 20 profile groups | 21–50: $2/group; 51–100: $1.75; 101–250: $1.50; 251+: $1.25 |
| Enterprise | Talk to us | SSO, SLAs, custom pricing, dedicated infrastructure | |

- Both: "Unlimited posts and engagements". "A cross-post counts as a single post." "Every paid plan includes all
  features. Plans differ by billing unit and volume".
- A profile group = "one brand, client, or publishing setup", up to 12 profiles, **one account per network**:
  "two Instagram accounts means two groups". Placements (Pages, boards, locations) are free.
- **"Twitter/X is capped at 20 posts per 24h per account."** Higher X throughput needs pay-as-you-go or BYOK.
- Blog post `new-pricing-may-2026` [measured: sitemap] means pricing changed in May 2026 [inferred].

### Networks and API [sourced: https://postproxy.dev/llms.txt, /pricing/, /white-label/]
- 12: Instagram, Facebook, Threads, X, YouTube, TikTok, Pinterest, Bluesky, LinkedIn (profiles and pages), Google
  Business, Telegram, WhatsApp. **No** Reddit, Mastodon, Discord, Slack.
- Comments: Instagram, Facebook, Threads, Bluesky ("YouTube and LinkedIn coming soon"). DMs: Messenger, Instagram,
  Telegram, Bluesky (+ WhatsApp chats/templates on the pricing nav). Private replies (comment → DM), Instagram ice
  breakers, ig.me/m.me referral webhooks. Google reviews synced "twice daily (06:00 and 18:00 UTC)".
- HMAC-signed webhooks (comment.*, message.*, profile_comment.*, reaction.received, referral.received...), queues
  with timeslots and "jitter", sandbox mode on all plans, zero-auth `/api/calendar` try-it endpoint, 7 SDKs, MCP,
  Claude connector, ChatGPT plugin, n8n/Make/Zapier.
- **White-label:** shared apps registered as **"Social Media Linker"** on every platform except TikTok (shows
  Postproxy); BYO keys for TikTok, YouTube, Google Business, Pinterest, Facebook, Instagram, LinkedIn, Threads, X; the
  browser briefly shows an app.postproxy.dev URL [sourced: https://postproxy.dev/white-label/].

### SEO footprint [measured: https://postproxy.dev/sitemap.xml]
- **225 URLs**: 88 blog, 37 `/how-to/*`, 25 `/reference/*` (docs on the main domain), 12 `/platforms/*`, 9
  `/compare/*` (ayrshare, blotato, bundle-social, outstand, post-for-me, postiz, publer, socialbee, zernio), 7
  `/automation/*` (make, mcp, mcp-server, n8n, n8n-guide, openclaw, zapier), 6 `/getting-started/*`, 5 `/agentic/*`
  (chatgpt, claude, codex, cursor, hermes), 4 `/product/*`, 3 `/customers/*`, 3 `/solutions/*`, `/white-label/`,
  `/enterprise/`, `/calendar/`.
- `/how-to/` is a programmatic task layer: "schedule-tiktok-posts", "reply-google-business-reviews-api",
  "send-instagram-dms-api", "instagram-comment-to-dm-private-reply", "update-google-business-hours-api"...
- Blog targets [inferred]: "<network> posting API guide" (Facebook, Instagram Reels, Threads, TikTok, X, YouTube,
  Pinterest, LinkedIn company page), "x-api-pricing-2026", "idempotent-publishing-avoid-duplicate-social-media-posts",
  "webhooks-vs-polling", "white-label-social-media-oauth", "what-happened-to-buffer-api-alternatives-for-developers",
  "postproxy-is-stripe-for-social-media".
- llms.txt 29 KB with full endpoint tables; robots `Content-Signal: ai-train=yes, search=yes, ai-input=yes`.
- Backlink signals: 0 of 17 roundups; Product Hunt x2; alternativeto, hunted.space, toolradar, peerpush,
  webcatalog listings (search results); Blotato writes `postproxy-alternatives` [measured/third-party]. Autocomplete
  "postproxy" → "postproxy api", "postproxy pricing", "postproxy mcp" [measured]: small but real branded demand.

### Weaknesses
- **SOC 2 claim contradicts itself [measured]:** home and pricing say "SOC 2 Type II certified"; their own llms.txt
  says "SOC 2 Type II audit in progress — certification expected in 2026".
- X capped at 20 posts/day/account on shared keys; one account per network per profile group; comments not yet on
  YouTube/LinkedIn; reviews sync only twice a day [sourced]. (The first two are not usable against Postproxy: Siar caps
  X lower, at 15/day, and has the same one-account-per-network-per-brand rule [code].)
- Very young (founded 2026), thin third-party footprint, SDKs with 0 stars [measured].

### Gaps Siar can use honestly
- **X at X's own USD price from a prepaid credit** on Siar's own X app; Postproxy needs pay-as-you-go or BYOK for X
  beyond its shared-key cap. **Do not attack Postproxy's X cap:** Siar's own X cap is lower, 15 posts per account per
  day on Starter, Pro and Business and 5 on Free (`apps/api/src/domain/plans.ts` line 81, `TWITTER: caps(5, 15, 15)`;
  Starter shares Pro's caps, line 90) vs Postproxy's 20 [code; corrected: the earlier draft used the 20/day cap as a
  Siar advantage].
- **Not a difference: one account per network per brand.** Siar has the same structure as Postproxy's profile group:
  "at most one live SocialAccount per network per team" (`apps/api/prisma/schema.prisma` header comment), and connecting
  a second account of the same network to a team replaces the first (`apps/api/src/modules/accounts.ts` line 106)
  [code; corrected: the earlier "two Instagram accounts in one brand is fine" was false].
- **Bill at scale:** Siar Business is a flat $149 for unlimited brands (100,000 posts); Postproxy Business at 500
  groups is about $734 on its own progressive tiers [inferred arithmetic, see section 8]. At 10–20 brands Postproxy is
  better value: $49 covers 20 groups, where Siar's $49 Pro covers 10 brands.
- Discord, Slack, Mastodon publishing (Postproxy has none).
- Do **not** attack on compliance: Siar has no SOC 2 either. Do not use uptime/latency numbers (Siar has none).

**Siar vs Postproxy, one line:** same job (embed social in your SaaS) and the same one-account-per-network-per-brand
shape; Siar charges one organization price that stops growing at Business (unlimited brands for $149) and passes X
through at X's own price, where Postproxy's bill grows with every profile group.

---

## 4. Post for Me (postforme.dev)

### Who
- Day Moon Development, contact postforme@daymoon.dev; `foundingDate` 2024 [measured: llms.txt, JSON-LD].
- Open source: `DayMoonDevelopment/post-for-me`, **AGPL-3.0, 86 stars, 26 forks**, created 2025-08-12, pushed
  2026-11-11 [measured: GitHub API].
- Self-reported "$13k MRR" on X [third-party search summary of https://x.com/postforme_dev; unverified].

### Home page copy (https://www.postforme.dev/, measured)
- `<title>`: **Post for Me – Unified Social Media Posting API**
- Meta description: "Unified developer API to post and schedule content across TikTok, Instagram, Facebook, X,
  LinkedIn, YouTube, Threads, Pinterest, and Bluesky. Plans start at just $10/month with unlimited accounts and
  analytics."
- H1 (rotating word): **"Ship social media integrations for your [product / ai content generator / marketing team /
  social media scheduler / game / saas] in hours, not weeks."**
- Subhead: "Quickly integrate social media platforms directly into your product with the unified social media posting
  API . Power posting , feeds , analytics , and more through a single, simple endpoint."
- CTA: **"Get Started"** (and "🚀 Start Coding Today", "Star on GitHub").
- H2s: "Integrate your product into the biggest social media platforms" / "Building native social media integrations
  shouldn't drain dev resources." / "Two ways to get started" / "Flexible tools to fit your unique product" /
  "Frequently Asked Questions" / "Built in the open, so you can trust what your product runs on." / "Start coding today"
- H3s: "REST API" / "SDK's" / "Webhooks" / "Quickstart Project" / "White Label Project" / use cases (Social Media
  Schedulers, AI Content Generation, Marketing Teams, Games, SaaS products).
- Feature blocks: "9 platforms. 1 tool.", "Your users. Your brand.", "Social Media Posts / Feeds / Post Analytics".
- **Proof: no logos, no testimonials, no numbers on the page** [measured]. But the JSON-LD carries
  `AggregateRating 4.8, reviewCount 127` with no reviews visible on the page [measured: text search for "4.8",
  "127", "review" found nothing visible].

### Other landing pages (measured)
| URL | `<title>` | H1 |
|---|---|---|
| /social-media/posting | Social Media Posting API — Post to 9 Platforms with One Endpoint \| Post for Me | The Social Media Posting API for every major platform |
| /open-source-social-media-api | Open Source Social Media API \| Post for Me | The best social media API and open source |
| /developers | Social Media API for Developers \| Post for Me Documentation | Build social media integrations in minutes, not months |
| /integrations/tiktok | TikTok API Integration — Post for Me | Use Post for Me to quickly integrate your app with TikTok |
| /compare/post-for-me-vs-ayrshare | Post for Me vs Ayrshare: A Developer's Guide \| Post for Me | Post for Me vs Ayrshare |

### Pricing (https://www.postforme.dev/pricing, checked 2026-11-12) [sourced; tiers read from the page's own data]
Headline: "Predictable pricing without surprises." "Usage-based pricing ... Pick a tier by monthly post volume —
every plan ships with unlimited social accounts, projects, and team members."

| Monthly price | Successful posts / month |
|---|---|
| $10 | 1,000 |
| $25 | 2,500 |
| $50 | 5,000 |
| $75 | 10,000 |
| $150 | 20,000 |
| $300 | 40,000 |
| $500 | 100,000 |
| $1,000 | 200,000 |
| Enterprise | "Contact us for a tailored plan" |

- Every tier: unlimited social accounts, read account feeds, post analytics, BYO or Post for Me credentials,
  unlimited API keys and team members.
- **Billing unit: successful posts, not accounts or brands.** Closest model to Siar's of all six.
- Overage: "we won't shut you down or charge you extra automatically. If your usage is consistently exceeding the
  limits, we'll reach out about upgrading your account."
- **No free tier or trial** found on the pricing page or the approvals resource [measured/sourced].

### Networks and API [sourced]
- 9: TikTok, Facebook, Instagram, X, LinkedIn, Pinterest, Bluesky, Threads, YouTube. **No** Reddit, Mastodon,
  Discord, Slack, Google Business, Telegram.
- Approvals claimed on https://www.postforme.dev/resources/quickstart-api-access-level: "officially verified Meta
  Business Tech Provider with Advanced Access for Instagram", "approved access to LinkedIn's Community Management
  API" (profiles **and company pages**), "passed Google's official compliance review" (YouTube), "officially passed
  TikTok's content audit", Pinterest "approved beyond trial access" [sourced; not independently verified].
- Two project types: **Quickstart** (their credentials, "Users see 'Post for Me' during OAuth") and **White Label**
  ("Use your own developer credentials so users see your app name in OAuth", "Requires platform developer approval").
- REST, SDKs (JavaScript, TypeScript, Python, Ruby, Go), webhooks ("Real-time account connections and post status"),
  feeds, analytics. **No comments or DMs** found anywhere.
- MCP: **local only**, `npx -y post-for-me-mcp@latest`, exposing **two tools** (docs search + sandboxed code
  execution) [sourced: /resources/ai-integration-using-the-mcp-server].

### SEO footprint [measured: https://www.postforme.dev/sitemap.xml, 6 child sitemaps (corrected from 7)]
- **94 unique URLs** (95 entries; `/compare` is listed twice): 44 `/resources/*` (docs-style: "getting-started-with-the-<network>-api" x9,
  "intercepting-the-oauth-flow", "quickstart-vs-white-label-project", "tiktok-vs-tiktok-business-api",
  "understanding-linkedin-connection-types"...), 11 `/solutions/*` (games, CRM, DAM, e-commerce, influencer
  management, news, events...), 9 `/integrations/<network>`, 8 `/compare/*` (Ayrshare, Buffer, Hootsuite, Late,
  Outstand, PostPlanify, Upload-Post, Zernio), 3 `/social-media/*` (posting, feeds, analytics), only 3 blog posts.
- Keyword targets [inferred]: "unified social media posting API", "social media posting API", "open source social
  media API", "<network> API integration", "post for me vs <competitor>".
- Backlinks: in Buffer's two API roundups, Zernio's top-12, Blotato's best-of, Social Champ's list, SocialAPI's
  agencies list (6/17) [measured]. Domain Rating 48 ("+2 / 30d") [third-party: https://rating.so/website/postforme-dev,
  fetched 2026-11-12; corrected from 43; a third-party estimate, not a vendor figure]. Rivals write about it: Upload-Post (/postforme-alternative/), Blotato (vs + alternatives), Postproxy
  (/compare/post-for-me/) [measured/third-party].
- Weak branded demand: autocomplete "postforme" returns countertop terms ("postformed laminate"); "post for me api"
  returns generic programming queries [measured]. The generic name works against them [inferred].

### Weaknesses
- **AggregateRating in JSON-LD with no visible reviews** [measured]. That is against Google's review-snippet rules
  and the same risk Siar's own plan removed (`geo/plan.md`, "invented FAQPage") [inferred].
- No comments, no DMs, no hosted MCP, 9 networks, no free tier; Quickstart shows "Post for Me" on every OAuth screen.
- AGPL licence: anyone self-hosting it as a network service must publish their changes [inferred from licence].
- No independent reviews found anywhere (Reddit, Product Hunt) [third-party search, 2026-11-12].

### Gaps Siar can use honestly
- Siar price per post is **lower from mid volume up**: Pro $49 = 10,000 posts (Post for Me: $75); Business
  $149 = 100,000 posts (Post for Me: $500). At the bottom Post for Me is cheaper: $10 for 1,000 posts vs Siar
  Starter $19 for 300 [inferred arithmetic from both price lists].
- Comments, imported comments, link in bio, dashboard and 16-event webhooks with replay come with Siar; Post for Me
  is posting + feeds + metrics only.
- Siar has **20 free posts to try** with no card; Post for Me has none.
- **Honest gap the other way:** Post for Me claims a passed TikTok content audit, LinkedIn Community Management
  (pages), Pinterest access "beyond trial", and "passed Google's official compliance review" with increased quota for
  YouTube. Siar has none of those four yet: TikTok audit rejected, LinkedIn pages denied, Pinterest trial only, YouTube
  uploads locked private until the audit passes (`siar-truth.md` sections 1b and 2) [corrected: YouTube was missing
  from this list]. Any Siar vs Post for Me page must say so.
- Account structure differs: Post for Me has no brand or per-network limit ("unlimited social accounts, projects");
  Siar has one account per network per brand, with brands capped by plan (1 / 1 / 10 / unlimited) [code].

**Siar vs Post for Me, one line:** neither counts accounts; Post for Me bills purely by posts, Siar by brands and
posts. Siar adds comments, a dashboard, link in bio and signed webhooks with replay, and is cheaper per post from
about 5,000 a month up, while Post for Me today claims the TikTok, Pinterest, LinkedIn-pages and YouTube approvals
that Siar is still waiting on.

---

## 5. SocialAPI.ai (social-api.ai)

### Who
- Solo founder **Erwan Prost**, French engineer; legal entity "EP ENTREPRISE", SIREN 102198884; "Made in France";
  previously ran CapitalSync (trade copier) 2023–2025 [sourced: https://social-api.ai/about]. `foundingDate` 2026
  [measured: JSON-LD].
- About page H1: "One API for social media. Built by an engineer who ships infrastructure."

### Home page copy (https://social-api.ai/, measured)
- `<title>`: **Unified Social Media API for AI Agents & Developers | SocialAPI.ai**
- Meta description: "Publish posts and reply to every comment, DM, mention and review on 13 platforms with one REST
  API. Native MCP server for AI agents. Free tier, no credit card."
- Badge: "Native MCP server, listed on the official registry"
- H1: **"The unified social media API to publish and reply."**
- Subhead: "Publish and reply to every comment, DM, mention and review across 13 platforms. One REST API and a native
  MCP server for developers, AI agents and agencies."
- CTAs: **"Start for free"**, **"Sign in with Google"**. Shows "Updated October 7, 2026".
- H2s: "Brand management : One social media API for your brand" / "Webhooks : Get notified in real time, by webhook"
  / "One API for all social networks" / "MCP : Hands for your agent, on every platform" / "Agents and developers :
  Ask your agent, or make the call yourself" / "Transparent pricing." / "Frequently asked questions." / "Ready to
  unify your social interactions?"
- H3s include "Signed", "Retried and logged", "One envelope", plan names, "$109/mo covers 50 client profiles. About
  $2.18 per client.", FAQ "Who built SocialAPI.ai?".
- **Proof: none** (no logos, no testimonials, no usage numbers) [measured]. The proof is the founder's GitHub
  (azuretls-client "461 stars") on /about [sourced].

### Other landing pages (measured)
| URL | `<title>` | H1 |
|---|---|---|
| /solutions/unified-inbox-api | Unified Inbox API \| One API for Comments, DMs & Reviews | The unified social inbox API for developers |
| /solutions/social-media-api-for-ai-agents | Social Media API for AI Agents \| MCP Server, Free Tier | Social media API for AI agents that publish and reply |
| /alternatives/zernio | Best Zernio Alternative 2026: Same Features, 4x Cheaper | The Best Zernio Alternative That Bills Per Brand |
| /platforms/tiktok | TikTok API: Publishing, Comments & Mentions in One API \| SocialAPI.ai | The TikTok API for publishing, comments and mentions |

### Pricing (https://social-api.ai/pricing, checked 2026-11-12; page shows "Updated November 5, 2026") [sourced]
| Plan | Price | Social profiles (brands) | Posts | Interactions | Support / extras |
|---|---|---|---|---|---|
| Hobby | $0 | 2 | 10/month | 50/month | Community; MCP; webhooks; event retention 1 day; 100 MB media |
| Side Hustle | $29/mo | 10 | Unlimited | Unlimited | Email; event retention 7 days |
| Full Send | $109/mo | 50 | Unlimited | Unlimited | Priority |
| Empire | $349/mo | 200 | Unlimited | Unlimited | Dedicated + custom SLA |
| Enterprise | Custom | Unlimited | | | SAML SSO, SCIM, dedicated Slack, dedicated infra |

- **Billing unit: the brand.** "A social profile groups the social accounts for one business, client, or location.
  Connect Instagram, TikTok, LinkedIn and more, it still counts as one social profile" ... "holding at most one
  account on each platform" ... "within a per-plan allowance of active pages per platform".
- Webhooks are "Included" on every plan, Hobby too, in the page's own comparison table; the Side Hustle card lists
  "Webhooks" but Hobby has them as well [sourced; corrected: the earlier row put webhooks on paid plans only].
- Reads always free and unlimited. Annual: 20% off ("pay for 10 months and get 12"). USD or EUR (€26–€311).
- Hobby over limit: HTTP 429 `billing.post_limit` until the next period; `X-Posts-Remaining` headers.
- Velocity caps: "25 posts per hour per account", 45 per Instagram account and 18 per TikTok account per 24h.
- API rate limit by connected accounts: 60/min (≤2 accounts), 600 (3–2,000), 1,200 above.
- Affiliate: 30% for 12 months, referred customers get 50% off month one [sourced: llms.txt].

### Networks and API [sourced: llms.txt, https://docs.social-api.ai/llms.txt]
- 13: Instagram, Facebook, Threads, TikTok, YouTube, X, Bluesky, LinkedIn (profiles and pages), Pinterest, Google
  Business Profile (reviews), WhatsApp (DMs, templates), Telegram (bot DMs), Zalo; plus App Store Connect reviews in
  the docs. **No** Reddit, Mastodon, Discord, Slack.
- Inbox-first: comments, DMs, mentions, reviews, moderation, signed webhooks with retries, analytics.
- **X needs your own X app** ("Connect X accounts through your own X app"); Telegram your own bot; Bluesky an app
  password. Other networks use "SocialAPI's own apps" [sourced: https://docs.social-api.ai/llms.txt]. No
  white-label/custom-OAuth option found for Meta, TikTok, YouTube, LinkedIn [inferred from the same index].
- MCP: hosted `https://api.social-api.ai/mcp`, "75+ typed tools", OAuth or key, on the official MCP registry. SDKs:
  the pricing page names only "The official Python SDK (pip install socialapi), plus cURL, n8n and any language from
  the OpenAPI spec"; the /about page shows a `SocialAPI-AI/SDKs` repo labelled "5 languages, 5 SDKs" [sourced].

### SEO footprint [measured: https://social-api.ai/sitemap.xml]
- **132 URLs**: 48 blog, 39 Spanish (`/es/*`), 13 `/platforms/*`, 10 `/alternatives/*` (Ayrshare, Buffer,
  Hootsuite, OnlySocial, Outstand, Postiz, Sprout Social, Unipile, Upload-Post, Zernio), 9 `/solutions/*`.
- Blog targets [inferred]: "best-social-media-apis-2026", "free-social-media-api-2026",
  "social-media-api-pricing-2026", "x-api-pricing-2026-pay-per-use", "youtube-api-quota-2026-upload-limit",
  "instagram-facebook-api-without-meta-app-review", "does-linkedin-have-an-api", "unipile-pricing-2026",
  "ayrshare-pricing-social-media-api-2026", plus error-message posts ("threads-api-empty-500-missing-permission",
  "instagram-media-publish-error-but-post-is-live").
- robots.txt explicitly allows GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot, CCBot and others
  [measured].
- Backlinks: 3/17 roundups, and all three are Blotato's or its own [measured]. Blotato writes
  `socialapi-alternatives` and recommends it for agencies in its Zernio-alternatives post [third-party]. Autocomplete
  for "socialapi.ai" returns only itself [measured]: almost no branded demand yet.

### Weaknesses
- One person, founded 2026, no customers shown, no reviews found [sourced/measured].
- BYO X app is required (extra setup for every customer who wants X) [sourced].
- Brand = one account per network; extra pages per platform are capped by an unstated "per-plan allowance"
  [sourced, fine print]. (Siar has the same one-account-per-network-per-brand rule, so this is not a weakness Siar can
  use [code: `schema.prisma`, `accounts.ts` line 106].)

### Gaps Siar can use honestly
- **X without your own X app**: Siar runs X on its app and passes usage through at X's own USD price from a prepaid
  credit (Siar caps X at 15 posts per account per day on paid plans, 5 on Free [code: `plans.ts` line 81]).
- (Removed on verification: "unlimited accounts per brand vs one per network per brand". Siar also allows one account
  per network per brand [code].)
- Discord, Slack, Mastodon publishing.
- **Honest gap the other way:** at 10 brands SocialAPI is $29 with unlimited posts; Siar Pro is $49 with 10,000
  posts. SocialAPI also has Google reviews, WhatsApp, Telegram and a recurring free tier (10 posts/month) where
  Siar's Free is 20 posts one-time. Siar should not pick a price fight at the 10-brand point.

**Siar vs SocialAPI.ai, one line:** SocialAPI is an inbox API with publishing; Siar is a publishing API with an inbox,
X included without your own X app, and Discord, Slack and Mastodon publishing that SocialAPI does not list.

---

## 6. WoopSocial (woopsocial.com)

### Who
- Co-founders Frank Heijdenrijk (CMO) and Attila Kun (technical co-founder) [sourced: https://woopsocial.com/llms.txt].
  Home JSON-LD has an `Organization` node (name, logo, sameAs: X, LinkedIn, Facebook, YouTube) but no founding date or
  address [measured; corrected from "no JSON-LD organization data"]. Footer: "WoopSocial LTD".
- GitHub org: docs, TypeScript SDK, n8n node, MCP (2 stars), a Threads Go client [measured: GitHub API; repos
  created March–May 2026].

### Home page copy (https://woopsocial.com/, measured)
- `<title>`: **WoopSocial - Unified Social Media API & MCP for AI Agents**
- Meta description: "Build any integration or automation for social posting. One unified API to publish to Facebook,
  Instagram, Threads, LinkedIn, Bluesky, X/Twitter, Pinterest, TikTok, YouTube. API & MCP included on every plan."
- H1: **"Build any integration or automation for social posting for AI agents"**
- H2s: "One API. 9 platforms." / "Build anything with social posting with a single API endpoint in hours and without
  the maintenance tax" / "Trusted by builders who ship with the API" / "One REST API to publish across every major
  platform" / "Native MCP support for Claude, ChatGPT, and Cursor" / "Connect accounts once, post from anywhere" /
  "Schedule hundreds of posts with a single API call" / "One upload, correct format on every platform" / "Built for
  the integrations people actually ship" / "Get AI to publish for you, from"
- H3s: "From API key to first post in minutes" / "Let AI agents post for you" / "Run publishing on autopilot" / "Skip
  the OAuth and token headache"
- CTAs: "Post For Free" (nav), "Get your API key", "View API docs", "Get your free API key", "Set up WoopSocial".
- Proof: 4 "Verified Review" quotes with first names only (Mazlum, Joe, Chris, Orkhan of isfujivisible.com);
  numbers "70s To your first live post", "FFmpeg Video handled for you" [measured].

### Pricing (https://woopsocial.com/pricing, checked 2026-11-12) [sourced]
Headline: "Start free right now. Upgrade when you need to scale". Claim: **"Guaranteed lowest per-profile pricing in
the world"** ("you're guaranteed to pay the lowest per-profile pricing of any similar provider in the entire world").

| Plan | Price | Social accounts | Per account | Credits / mo | Seats | Storage |
|---|---|---|---|---|---|---|
| Free | $0 ("forever, no trials") | 2 | $0 | 30 | 1 | 1 GB |
| Pro | $19/mo, stackable | 20 | $0.95 | 1,000 | 1 | 10 GB |
| Business | $49/mo, stackable | 100 | $0.49 | 5,000 | 3 | 25 GB |
| Max | $799/mo | 2,500 | $0.32 | 42,000 | 43 | 420 GB |

- "Unlimited posts*" on every plan; "* X/Twitter: first posts free, then credit-based." API and MCP on every plan,
  Free included. "Stacked pricing": each +1 unit repeats the plan price and adds its accounts.
- On-page calculator compares against Zernio ($78 at 20 accounts), Buffer ($100) and Ayrshare ($599).

### Networks and API [sourced: llms.txt]
- 9 (+ LinkedIn Pages): Facebook, Instagram, Threads, Bluesky, LinkedIn, Pinterest, X, TikTok, YouTube. **No**
  Reddit, Mastodon, Discord, Slack, Google Business, Telegram.
- Publishing, scheduling, media (FFmpeg per-platform), webhooks (register/list/delete), analytics: account + post for
  Facebook, Instagram, LinkedIn Pages, YouTube, Pinterest; post-only for TikTok, Threads, Bluesky; **none for LinkedIn
  profiles or X**. **No comments, no DMs, no white-label connect** found. It does have an API connect step:
  `POST /social-accounts/authorization-url` (MCP `oauth_create_authorization`) returns an OAuth URL for the person to
  open, so a developer's customers can connect from a product, but through WoopSocial's own apps ("You do not bring your
  own Meta/TikTok/etc. developer apps") with no branding option found [sourced: llms.txt; added on verification].
- Hosted MCP: streamable HTTP at `https://api.woopsocial.com/mcp`, OAuth or `?api_key=` [sourced:
  https://woopsocial.com/.well-known/mcp/server-card.json].

### SEO footprint [measured: https://woopsocial.com/sitemap.xml + /blog/sitemap.xml]
- **114 URLs**: 38 free tools, 24 blog, 10 network pages (/facebook, /tiktok...), 9 `/social-media-mcp/<network>-mcp`,
  agent pages per client and network (/grok/* x8, /muse/* x5, /hermes/* x4, /claude, /agents).
- Blog targets: "<network>-api-alternative-for-developers-2026" (Facebook, Instagram, LinkedIn, TikTok, YouTube),
  "<competitor>-alternatives" (Ayrshare, Blotato, bundle.social, Outstand, Postiz, Upload-Post, Zernio),
  "unified-social-media-API-2026", "meta-app-review-rejected-2026-fix-guide".
- **Odd robots.txt [measured]:** GPTBot, ClaudeBot, PerplexityBot, Google-Extended, OAI-SearchBot and others are
  `Disallow: /unified-social-media-api` (and /black-friday). That page exists ("Publish to 9 platforms with a single
  API endpoint") and is not in the sitemap, so it is likely an ad landing page they keep out of AI answers [inferred].
- Backlinks: 2/17 roundups (Blotato's and its own); Blotato writes `woopsocial-alternatives`; autocomplete
  "woopsocial" returns only "transcode woopsocial" [measured]. Little demand yet.

### Weaknesses
- Publishing only; no inbox, no white-label, X is credit-based, no analytics for X or LinkedIn profiles [sourced].
- "Guaranteed lowest ... in the world" is an unverifiable superlative [inferred].
- Testimonials are first names only [measured].

### Gaps Siar can use honestly
- Comments in the API and dashboard, a branded connect link for customers (WoopSocial's connect URL is unbranded),
  16 signed webhook events with replay.
- Siar has no account count on any plan, only brands (one account per network per brand); WoopSocial's Free plan stops
  at 2 accounts, Siar's Free at one brand, i.e. up to one account on each open network [code].
- **Honest gap:** WoopSocial's Free plan is "Unlimited posts" on 2 accounts with API, forever; Siar's Free is 20 posts
  one-time. Do not claim Siar has the better free plan.

**Siar vs WoopSocial, one line:** WoopSocial sells cheap per-account publishing; Siar counts brands, not accounts,
and adds comments, a branded connect link and signed webhooks, for one organization price.

---

## 7. Publer API (publer.com)

### Who / positioning
- A mainstream scheduler. Home `<title>`: **Powerful Social Media Management & Scheduling Tools | Publer**; H1
  **"Manage, automate, and track your social media success"**; H2 "Streamline Your Social Media & Get Real Results";
  H3s "Results that speak for themselves", "Everything you need to succeed in one platform.", "Grow big with a
  platform that just works!", "More features you will love", "Why choose Publer?" [measured].
- CTAs: "Get Started For Free", "Start Free Trial", "Start Scheduling". Proof: "500K+ happy users worldwide trusting
  our platform", testimonial cards [measured, not verified].
- **There is no API landing page:** `/features/api` returns the home page [measured]. The API lives only at
  `/docs` (58 doc URLs in the sitemap).

### Pricing (https://publer.com/plans + help article, checked 2026-11-12) [sourced]
- Prices render client-side, so the plan cards show no static numbers [measured]. Publer's help article states:
  "The Professional Plan starts at $5/month with 1 social account", "The Business Plan starts at $10/month with 1
  social account", "For every 9 social accounts or additional members, the 10th one is free", "The Free Plan is free
  forever and includes up to 3 social accounts, excluding X/Twitter" with "10 scheduled posts at a time per social
  account" [sourced: https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh/].
- **Billing unit: per social account** ("5 Facebook Pages, 2 LinkedIn Pages, and 3 Instagram accounts count as 10
  social accounts") plus per member. Yearly: the plans page toggle says "2 months free" [measured], but the help article
  says "Yearly billing includes a 20% discount compared to paying monthly" [sourced]; the two Publer pages disagree
  [added on verification]. Exact per-account price above the first account:
  [unverified] (third parties disagree: $4/$7 vs $5/$10 per account [third-party: socialk.it, costbench.com]).
- **API: Business and Enterprise only.** "Publer does not offer a public API that is available to everyone. API
  access is limited to eligible Business and Enterprise customers." Business card: "Access to Publer API & MCP"
  [sourced]. The help article adds "Access to Publer's MCP Server for eligible customers"; whether that server is
  hosted or local is not stated on the pages fetched [unverified].

### Networks and API [sourced: https://publer.com/docs, /docs/api-reference/*]
- 13: Facebook, Instagram, X, LinkedIn, Pinterest, YouTube, TikTok, Google Business Profile, WordPress, Telegram,
  Mastodon, Threads, Bluesky.
- Auth `Authorization: Bearer-API <key>` + `Publer-Workspace-Id`; rate limit "2-minute fixed, 100 requests"
  [sourced: https://publer.com/docs/getting-started/rate-limits; the "per user" scope was not re-confirmed].
- **Accounts are read-only in the API** (`GET /accounts`, `GET /accounts/{id}`; no connect/OAuth endpoint). Accounts
  must be connected inside the Publer app. So you cannot let your own customers connect accounts from your product
  [sourced; the read-only point also made by Blotato, https://www.blotato.com/blog/publer-pricing].
- Analytics endpoints (charts, post insights, hashtags, best times, competitors). No webhooks, comments or DMs
  mentioned in the API docs pages fetched [sourced/unverified beyond those pages].

### SEO footprint [measured]
- English main-site sitemap `sitemap_en.xml`: 70 URLs (19 integrations, 14 features, 14 about, 13 tools); the API docs
  are in a separate `docs/sitemap-pages.xml` with 59 URLs; together 129 [measured; corrected wording: the docs are not
  in the English sitemap]. blog.publer.com sitemap: **about 4,600 URLs** (4,603 `<loc>` entries on re-count, including
  145 category pages). **Seven** language sitemaps on the main site: en, fr, de, it, es, sq, pt [measured; corrected
  from "five"].
- Keyword targets [inferred]: "<network> scheduler", free tools, not "API". Autocomplete "publer api" returns
  "publer api key", "publer api docs", "publer api pricing", "publer api documentation" [measured]: developers do
  search for it.

### Weaknesses
- API only on Business, no account-connect API, per-account billing, no API page [sourced/measured].
- Reviews blame failures on platform limits ("Instagram direct posting can be inconsistent due to API restrictions");
  a reviewer of reviews says some Reddit threads mention double-posting [third-party summaries of Capterra/TrustRadius
  and https://postplanify.com/publer-reviews; unverified].

### Gaps Siar can use honestly
- Siar's API is on every plan (Free included) and the dashboard is a client of the same API.
- Hosted connect link so your customers connect their own accounts; Publer's API cannot.
- Per organization vs per account + per member.

**Siar vs Publer, one line:** Publer is a scheduler that lets Business customers script their own workspace; Siar is
an API first, on every plan, built so your customers connect their accounts inside your product.

---

## 8. Side by side (all checked 2026-11-12)

### Model and features

| | **Siar** | Blotato | Postproxy | Post for Me | SocialAPI.ai | WoopSocial | Publer |
|---|---|---|---|---|---|---|---|
| Bills by | Organization (brands + volume) | Account bands | Profile or profile group | Successful posts | Brand ("social profile") | Accounts | Accounts + members |
| Accounts | No account count; 1 per network per brand, brands 1 / 1 / 10 / unlimited (corrected) | 20 / 40 / 100 | 1 per network per group | Unlimited | 1 per network per brand | 2 / 20 / 100 / 2,500 | Per account |
| Free | 20 free posts to try, one-time, no card | None (7-day trial, no API) | 10 posts/month (corrected) | None | 2 brands, 10 posts/mo | 2 accounts, unlimited posts | 3 accounts, no X, no API |
| Entry paid | RM39 / $19 | $29 | $17 | $10 | $29 | $19 | $5 (Professional, 1 account, no API); API from $10 (Business, 1 account) (corrected) |
| API on every plan | Yes | Paid only | Yes | Yes | Yes | Yes | Business+ only |
| Comments | Yes (FB, IG, Threads, X, Bluesky, Mastodon, Slack, YouTube; Discord replies without import) | IG, FB | IG, FB, Threads, Bluesky | No | Yes (comments, DMs, mentions, reviews; per-network coverage not checked, not all 13 have comments) (corrected) | No | Not in API docs |
| DMs | Beta, per org, FB + IG, paid plans | IG, FB | Messenger, IG, Telegram, Bluesky, WhatsApp | No | Yes | No | No |
| Branded/white-label connect | Branded link on app.siaran.my, "Powered by Siar" | No | Neutral "Social Media Linker" or BYO keys | Quickstart shows "Post for Me", or BYO keys | Not found | Unbranded OAuth URL from the API, no branding | No (no connect endpoint) |
| Hosted MCP | **No**: local stdio server, 19 tools, not on npm yet (corrected) | Yes | Yes | No: local, 2 tools | Yes, 75+ tools | Yes | MCP server for eligible Business+; hosting unverified (corrected) |
| SDKs | TypeScript (not on npm yet) | n8n/Make nodes | 7 languages | 5 languages | Python + 5 | TypeScript | Not found |
| X handling | At X's USD price from prepaid credit; cap 15 posts/account/day (5 on Free) (corrected) | No Blotato cap | 20 posts/day/account | [unverified] | Your own X app | First posts free, then credits | Not on Free |
| Discord / Slack / Mastodon | Yes / Yes / Yes | No | No | No | No | No | Mastodon only |
| TikTok | **No** (audit rejected, re-filing) | Listed | Listed | Listed (audit passed, claimed) | Listed | Listed | Listed |
| LinkedIn pages | **No** (access denied) | Listed | Listed | Listed (CM API, claimed) | Listed | Listed | Listed |
| YouTube public uploads | **No** (locked private until audit) | Listed | Listed | Listed (compliance review passed, claimed) | Listed | Listed | Listed |
| Google Business | **No** (parked) | No | Yes | No | Yes | No | Yes |

Siar row from `siar-truth.md` sections 1–4 plus code checked on verification (`plans.ts`, `schema.prisma`,
`accounts.ts`, `packages/mcp/src/server.ts`). Competitor rows from sections 2–7 above. "Listed" means the vendor's own
page lists the network; whether that vendor has passed the network's own review was not verified (only Post for Me
makes an explicit approval claim).

### Monthly cost in three scenarios [inferred arithmetic from the sourced price lists; USD; monthly billing]

| Scenario | Siar | Blotato | Postproxy | Post for Me | SocialAPI.ai | WoopSocial |
|---|---|---|---|---|---|---|
| A. 1 brand, 9 accounts, 300 posts/mo | $19 (Starter; only if the 9 accounts are on 9 different networks, i.e. exactly Siar's 9 open ones) | $29 | $33 (Agentic: $17 + 4×$4) | $10 | $29 (Hobby's 10 posts too few) | $19 (Pro) |
| B. Agency, 10 brands × 6 accounts (60), 3,000 posts/mo | $49 (Pro) | $499 (Agency; Creator stops at 40) | $49 (Business, 10 of 20 groups) | $50 | $29 (Side Hustle, 10 brands) | $49 (Business) |
| C. SaaS, 500 customer brands, 2,000 accounts, 20,000 posts/mo | $149 (Business) | not offered (max 100 accounts) | ~$734 (Business, 500 groups on the progressive tiers) | $150 | Enterprise, custom (Empire stops at 200) | $799 (Max) |

All Siar figures assume one account per network per brand (code rule); a customer with two accounts on the same
network needs a second brand. Postproxy and SocialAPI.ai have the same rule.

Read: Siar is not the cheapest at one brand (Post for Me) or at ten brands (SocialAPI.ai). Siar is the cheapest
listed price at SaaS scale with hundreds of customer brands, tied with Post for Me, and Post for Me has no comments or
inbox. Those are the honest comparison pages to write first.

---

## 9. What this means for Siar's SEO (inferred)

1. **Every rival targets the same three page types**: `<network> API` pages, `<competitor> alternatives/vs` pages and
   "social media API for AI agents / MCP" pages. Siar already has 15 network pages and 15 error pages generated from
   code (`siar-truth.md`), which none of the six has in that form (Postproxy's `/platforms/*` and Blotato's
   `/api/<network>` are the closest). The missing layer is comparison pages, which `geo/plan.md` already calls P3.
2. **Demand evidence [measured, autocomplete 2026-11-12]:** "social media posting api" → "...free", "best social
   media posting api", "social media publishing api", "social media post scheduler api"; "social media mcp" →
   "...server", "...for claude", "...github", "social media scheduler mcp"; "unipile" and "blotato" each return 10
   brand suggestions ("blotato alternatives", "unipile alternative" singular) [re-run 2026-11-12, matches]; "postproxy" returns 3; "woopsocial", "socialapi.ai", "postforme" return
   ~nothing. So "Blotato alternatives" has real search demand; the others are low-volume brand names (inferred).
3. **Pages worth writing**, each with sourced, dated competitor facts (pricing page rule 12 in `siar-truth.md`):
   - "Post for Me alternative" / "Siar vs Post for Me": neither counts accounts; Siar adds comments, dashboard,
     webhooks with replay; state Siar's TikTok/Pinterest/LinkedIn-pages/YouTube-public gap plainly.
   - "Postproxy alternative": flat organization price that stops growing at Business (unlimited brands, $149) vs a
     bill per profile group; X at X's own USD price. Do **not** use X daily caps (Siar's 15/day is below Postproxy's
     20/day) or "accounts per brand" (both allow one per network per brand) [corrected on verification].
   - "Blotato alternative for developers": branded connect for your customers, never-post-twice, API on the free plan.
   - "Social media API with Discord, Slack and Mastodon": no rival among these six publishes to Discord or Slack
     [measured from their network lists]. A niche, but an honest, uncontested one.
   - "Social media API pricing for SaaS (per organization)": scenario C table.
4. **Do not copy their proof style.** Rivals use logo strips, "10,000+", "99.97% uptime", "SOC 2". Siar has none and
   must not invent any (`siar-truth.md` section 5). Siar's proof is checkable: the public OpenAPI document, generated
   network and error pages, the webhook event list, the price list.
5. **Agent-client pages** (`/claude`, `/cursor`, `/codex`, per-network MCP pages) are a pattern in Blotato, Postproxy,
   WoopSocial and SocialAPI. Siar's MCP is not on npm yet, so those pages wait until it is (`siar-truth.md` section 2).
6. Blotato's research says Reddit "stops accepting new requests for public API access on 31 October 2026, and
   existing access starts to close on 12 January 2027" [third-party: https://www.blotato.com/llms.txt; the sentence is
   on that page (confirmed 2026-11-12), but Reddit's own announcement was not checked: unverified as a Reddit fact]. Relevant to Siar's parked Reddit approval: check
   Reddit's own page before planning anything.

## 10. Sources (all fetched or searched 2026-11-12)

Vendor pages: https://www.blotato.com/ · /pricing · /llms.txt · /sitemap-index.xml · /social-media-api · /mcp ·
/api/instagram · /blotato-alternatives — https://postproxy.dev/ · /pricing/ · /llms.txt · /sitemap.xml · /white-label/ ·
/social-media-api/ · /solutions/saas/ · /compare/blotato/ · /platforms/tiktok/ — https://www.postforme.dev/ · /pricing ·
/llms.txt · /sitemap.xml · /resources/quickstart-api-access-level · /resources/ai-integration-using-the-mcp-server ·
/social-media/posting · /open-source-social-media-api · /developers · /integrations/tiktok ·
/compare/post-for-me-vs-ayrshare — https://social-api.ai/ · /pricing · /about · /llms.txt · /sitemap.xml ·
/solutions/unified-inbox-api · /solutions/social-media-api-for-ai-agents · /alternatives/zernio · /platforms/tiktok ·
https://docs.social-api.ai/llms.txt — https://woopsocial.com/ · /pricing · /llms.txt · /robots.txt · /sitemap.xml ·
/blog/sitemap.xml · /social-media-mcp · /tiktok · /unified-social-media-api — https://publer.com/ · /plans · /docs ·
/docs/api-reference/accounts · /docs/api-reference/introduction ·
https://publer.com/help/en/article/what-are-publers-plans-and-pricing-15h4yqh/ — https://www.unipile.com/llms.txt —
home pages of every vendor in the section 1 table.

Roundups counted (section 1): https://buffer.com/resources/best-social-media-apis/ ·
https://buffer.com/resources/social-media-api-multi-platform-posting/ ·
https://zernio.com/blog/top-12-social-media-apis-for-developers · https://zernio.com/blog/social-media-posting-api ·
https://www.blotato.com/blog/best-social-media-api-tools · https://www.blotato.com/blog/ayrshare-alternatives ·
https://postplanify.com/blog/best-social-media-apis-for-developers ·
https://dev.to/haneem/best-7-social-media-scheduler-apis-for-agents-developers-21p3 ·
https://getsocialclaw.com/ayrshare-alternatives · https://getsocialclaw.com/blog/cheapest-social-media-api ·
https://www.feedhive.com/alternatives/ayrshare · https://woopsocial.com/blog/ayrshare-alternatives ·
https://data365.co/blog/best-ayrshare-alternative · https://posteverywhere.ai/blog/ayrshare-alternatives ·
https://www.socialchamp.com/blog/best-social-media-apis/ ·
https://social-api.ai/blog/best-ayrshare-alternative-agencies-2026 ·
https://www.mallary.ai/blog/social-media-scheduling-api

Third-party signals: https://www.trustpilot.com/review/blotato.com · https://www.producthunt.com/products/postproxy ·
https://www.capterra.com/p/10053855/Blotato/reviews/ (403, search summary only) ·
https://www.g2.com/products/blotato-ai/reviews_and_filters (search summary only) · https://rating.so/website/postforme-dev ·
https://ryandoser.com/social-media-api/ · https://postplanify.com/publer-reviews · https://socialk.it/en/pricing/publer ·
https://www.costbench.com/software/social-media-management/publer/ · GitHub REST API (repos of DayMoonDevelopment,
postproxy, WoopSocial) · Google autocomplete (suggestqueries.google.com, hl=en, gl=us).

## 11. Verification log (2026-11-12, adversarial re-check)

Re-fetched every vendor page, llms.txt, robots.txt and sitemap cited above, the 17 roundups, GitHub repos, Trustpilot,
Product Hunt, rating.so, Ryan Doser, Zernio and Blotato's ratings page; re-ran Google autocomplete for 11 queries.
Held unchanged: all six price lists (Blotato, Postproxy, Post for Me tiers from the page's own JSON-LD, SocialAPI.ai,
WoopSocial, Publer help article), network lists, home titles/meta/H1s, the 18 landing-page titles/H1s, Postproxy's SOC 2
contradiction, Post for Me's AggregateRating 4.8/127 with no visible reviews, GitHub stars/forks, Trustpilot 4.8 / 384,
Product Hunt 337 followers / 1 review, roundup mention counts (except bundle.social), autocomplete results.

Not re-verifiable this session: SERP positions ("who ranks"), because the shared web-search budget was exhausted before
the 10-query sample could run; G2 and Capterra (403); Post for Me's "$13k MRR" on X. These stay unverified.

Corrected (20):
1. **Siar: one account per network per brand** (`schema.prisma` header, `accounts.ts` line 106). Removed "unlimited
   accounts inside a brand / two Instagram accounts in one brand" from sections 2, 3, 5, 6, 8, 9.
2. **Siar X cap is 15 posts/account/day (5 on Free)** (`plans.ts` line 81), below Postproxy's 20; removed the X-cap
   attack on Postproxy.
3. **Siar MCP is a local stdio server** (`packages/mcp/src/server.ts`), not hosted; table row fixed.
4. Postproxy Free is **10 posts per month** (pricing FAQ), not a one-off 10.
5. bundle.social roundup mentions: 4/17, not 3.
6. Blotato sitemap: 42 vs-posts and 48 alternatives URLs, not "~45" each.
7. Post for Me sitemap index has 6 child sitemaps, not 7 (94 unique URLs held).
8. Post for Me Domain Rating on rating.so: 48, not 43.
9. Post for Me honest gap: added its claimed YouTube compliance review, which Siar has not passed.
10. SocialAPI.ai webhooks are included on Hobby too, not paid-only.
11. SocialAPI.ai "Comments: Yes, 13 networks" overstated; not all 13 platforms take comments.
12. SocialAPI.ai SDKs: the pricing page names Python only; "5 SDKs" is the /about repo label.
13. WoopSocial home does have Organization JSON-LD.
14. WoopSocial has an unbranded API connect URL (`POST /social-accounts/authorization-url`); connect row clarified.
15. Publer yearly: plans page "2 months free" vs help article "20% discount"; disagreement recorded.
16. Publer entry paid plan is Professional $5 (no API); API from Business $10.
17. Publer sitemaps: docs are a separate sitemap (70 + 59 = 129), seven language sitemaps not five, blog about 4,600.
18. Publer MCP: "hosted" downgraded to unverified.
19. TikTok / LinkedIn pages "Yes" for rivals downgraded to "Listed" (approval not verified); YouTube public row added.
20. Publer rate limit "per user" scope downgraded to not re-confirmed.

Upgraded from unverified (now confirmed at the cited URL): Blotato's "12 reviews ... TrustScore of 2.0" in March
(Blotato's own ratings page); Ryan Doser's roundup discloses Blotato affiliate links and client status; Zernio's
"creator tool with an API attached" wording; Blotato's Reddit sentence exists on its llms.txt (Reddit's own page still
unchecked).
