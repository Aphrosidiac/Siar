Verified 2026-11-12: 25 corrections

# Competitor teardown: Postiz

> **Verification pass, 2026-11-12.** Every Postiz page, docs page, GitHub/npm number, review-site figure and Siar
> claim below was re-fetched or re-checked against the source. Corrected lines say "(corrected 2026-11-12)".
> Not re-checkable in this pass: the WebSearch budget for the run was used up before I could re-run searches, so every
> "who ranks for X" line is marked **unverified (search not re-run)**. Google autocomplete was re-run directly and
> matched.

Checked 2026-11-12. Scope: postiz.com (marketing site), docs.postiz.com (Mintlify docs), the GitHub org `gitroomhq`,
npm, and third-party review sites.

Labels:

- **[measured]**: I fetched it and read it on 2026-11-12.
- **[sourced]**: a URL is given.
- **[inferred]**: my reading of the evidence.
- **[third-party]**: someone other than Postiz says it.
- **[unverified]**: I could not confirm it on Postiz's own page.

Raw captures used for this file are not committed (the verification pass re-fetched them on 2026-11-12). They are: the home and pricing HTML, `robots.txt`, `llms.txt`,
`sitemap.xml` and `sitemap-0.xml`, the docs `sitemap.xml`, `llms.txt` and `llms-full.txt` (518 KB), 16 docs pages as
`.md`, 20 landing pages, the GitHub API and the npm downloads API.

Siar facts in this file come from `docs/seo/research/siar-truth.md`. Siar's wording rules in that file apply to every
line below that would end up in copy.

---

## 0. Summary

Postiz is not mainly a social media API. It is an **open-source (AGPL-3.0) social media scheduler**. In 2026 it
repositioned as "the agentic social media scheduling platform": AI agents (Claude, ChatGPT, OpenClaw, Grok Bot…) drive
it through a hosted MCP server, a CLI and a public API.

Its moats are real:

- 41k GitHub stars.
- 30+ channels, including long-tail ones Siar does not have (Telegram, Reddit, Medium, WordPress, Nostr…).
- Unlimited posts on every paid plan.
- A free self-hosted edition.
- A very large programmatic SEO footprint (1,215 URLs in `sitemap-0.xml`, plus 398 blog URLs in `sitemap-posts.xml`).

As a backend for **a product that connects its own customers' accounts**, it is weak:

- Cloud plans cap **channels** at 5, 10, 30 or 100 [sourced].
- The public API is limited to **90–100 requests per hour on create-post** [sourced].
- Webhooks fire only on publish, and the docs describe no signature [measured].
- There is no comment inbox or DM API [measured].
- The white-label, multi-tenant Enterprise offer shows "We are not accepting new applications at the moment" [measured].

---

## 1. Who they are

| Fact | Value | Label / source |
|---|---|---|
| Founder | Nevo David, "a developer and marketer" | [sourced] https://postiz.com/about, checked 2026-11-12 |
| Contracting entity | Gitroom Limited, Central, Hong Kong | [sourced] https://postiz.com/about |
| US entity | Gitroom LLC, Dover, DE. The about page says it "holds the developer approvals for the social platforms" | [sourced] https://postiz.com/about |
| Main repo | `gitroomhq/postiz-app`. **41,377 stars, 7,889 forks**, 208 open issues, AGPL-3.0, created 2023-07-08, last push 2026-11-11. Repo description: "The ultimate agentic social media scheduling tool" | [measured] GitHub API, 2026-11-12 |
| Release cadence | v2.25.1 (2026-10-11), v2.25.2 (2026-10-23), v2.25.3 (2026-10-24) | [measured] GitHub releases API |
| Other repos | `postiz-agent` (CLI + skill) 567★; `agent-media` 83★; `postiz-docker-compose` 79★; `postiz-n8n` 68★; `postiz-helmchart` 34★; `postiz-mobile` 18★; `postiz-aws` 15★ | [measured] GitHub API |
| npm, 2026-10-12 to 2026-11-10 | `postiz` (CLI, v2.0.27) **25,196**; `n8n-nodes-postiz` 662; `@postiz/node` (SDK) **444**; `postiz-mcp` 176 (**third-party**: npm maintainer `solomonneas`, repo github.com/solomonneas/postiz-mcp; corrected 2026-11-12) | [measured] api.npmjs.org |
| Product Hunt | 4 launches: 2024-11-20 (#1 day/week/month), 2025-05-01 "Postiz v2" (#2 day), 2025-10-31 (#1 day), 2026-05-01 (#1 day). 4.2/5 from 10 reviews, 4.4K followers | [third-party] https://www.producthunt.com/products/postiz, fetched 2026-11-12 |

Reading [inferred]:

- The CLI's downloads are 57 times the SDK's. People use Postiz from agents and scripts, not by embedding it as a
  library in a product.
- Compare bundle.social's SDK at 32k downloads a month and Ayrshare's at 30k a month (from the sibling teardowns).
- On the developer-SDK axis, Postiz is small. On the agent and self-host axis, it is large.

---

## 2. Positioning, headlines, CTAs, proof

### Home page, https://postiz.com/ [measured, checked 2026-11-12]

- `<title>`: "Postiz: The Agentic Social Media Scheduling Platform"
- Meta description: "Postiz is the agentic social media scheduling platform. Claude, ChatGPT, Cursor or OpenClaw plan, schedule and publish to 30+ channels from one calendar."
- H1: "Run your social media on autopilot with AI agents". The last words rotate through ChatGPT, Claude, Claude Code, Grok Bot, Muse, OpenAI dots, OpenClaw and Hermes Agent.
- Subhead: "Postiz is the agentic social media scheduler: AI agents plan, generate and schedule posts to 30+ networks, and you review everything in one visual calendar."
- Hero CTAs: "Start a 7-day trial for $0", "I need agentic scheduling", "I need classic scheduling", "Discord Support". The nav has "Log In" and "Start for $0".
- Section headings (H2, in order):
  1. "Who is Postiz for?". H3s, with their lines:
     - "AI-first marketers"
     - "Developers": "Build your own posting app on top of Postiz. With OAuth2, an SDK, and a public API, your users connect once and publish everywhere."
     - "Automation teams": n8n or Make.com.
  2. "See Postiz in action"
  3. "Power Your Content with AI and Automation". H3s: Via ChatGPT · Via Claude · Via Claude Code · Via Grok Bot · Via Hermes / OpenClaw · Via Muse · Automate everything
  4. "All the tools you need for social media growth in one place". Features:
     - schedule everywhere
     - work with AI agents
     - design with AI (a Canva-like editor)
     - built for teams
     - auto actions (milestone-triggered repost, like or comment)
     - analytics
  5. "Publish to 30+ social media channels"
  6. "Wall of love"
  7. "Frequently asked questions". There are 15 FAQ H3s, including:
     - "Does Postiz have a public API and webhooks?"
     - "If I connect 3 Facebook pages, does that count as 1 channel or 3?" (answer: 3)
     - "Is Postiz free?"
     - "Is Postiz open-source?"
  8. "Ready to get started?" (this is an H3, not an H2; corrected 2026-11-12)

**Proof used** [measured]:

- A "Trusted by customers all over the world" line with **no customer logos** under it in the served HTML. The hero
  above it shows the 30+ **social-network logos** and a Product Hunt badge linking to the launch page
  (aria-label "Product of the day, week and month") (corrected 2026-11-12: the badge is in the hero, not the strip).
- No GitHub star count on the home page, even though it is their strongest number.
- No customer count, rating or uptime figure.
- "Wall of love": 17 X/Twitter posts with names and handles. Examples: Elie Steinbock (@elie2222), Matthew Berman
  (@TheMattBerman), Justin Brooke (@IMJustinBrooke, a self-host user: "I'm a user myself, self-hosted"), Jo McKee (@McKeeCreative1, who
  first planned to self-host and then decided "it's just easier to subscribe"). (corrected 2026-11-12: the earlier
  "chose a subscription over self-hosting" was a paraphrase in quote marks.)
- The about page claims "Thousands of creators, brands and agencies publish through Postiz today", with no number, and
  "#1 of the day, week and month" on Product Hunt [sourced] https://postiz.com/about.

### Main landing pages (title / H1) [measured, checked 2026-11-12]

| URL | `<title>` | H1 |
|---|---|---|
| /pricing | Postiz Pricing: Plans from $29/month with AI Agents, MCP and API | Postiz Pricing: Agentic Scheduling from $29/month |
| /mcp | Social Media MCP Server for AI Agents \| Postiz MCP | The social media MCP server for AI agents |
| /agent | AI Agent Social Media Posting: Connect Any Agent \| Postiz | AI Agent Social Media Posting with Postiz |
| /claude | How to Post to Social Media from Claude (Connector + MCP) \| Postiz | Post to Social Media from Claude |
| /claude-code | Schedule Social Media Posts with Claude Code \| Postiz MCP | Schedule Social Media Posts with Claude Code |
| /claude-code/instagram | Post to Instagram from Claude Code \| Postiz MCP Guide | Post to Instagram from Claude Code |
| /enterprise | Add Postiz to Your SaaS - White-Label Social Media Scheduling | Add Postiz to Your SaaS |
| /channels/instagram | Instagram Post Scheduler for Reels, Posts & Stories \| Postiz | Instagram Post Scheduler to Schedule Instagram Posts, Reels & Stories |
| /channels/x | X (Twitter) Post Scheduler \| Schedule X Posts with Ease | Tweet Scheduler to Schedule Tweets, Threads & X Posts |
| /alternatives/ayrshare | 7 Best Ayrshare Alternatives in 2026 (Tested & Compared) \| Postiz | Best Ayrshare Alternatives in 2026 |
| /compare/postiz/ayrshare | Postiz vs. Ayrshare (2026): Features, Pricing and Channels \| Postiz | Postiz vs. Ayrshare comparison |
| /compare/ayrshare/zernio | Ayrshare vs. Zernio (2026): Features, Pricing and Channels \| Postiz | Ayrshare vs. Zernio comparison |
| /tools/instagram-font-generator | Instagram Font Generator (𝓬𝓸𝓹𝔂 𝕒𝕟𝕕 𝓅𝒶𝓈𝓉𝑒) – 100+ Fonts | Instagram Font Generator (𝓬𝓸𝓹𝔂 𝕒𝕟𝕕 𝓅𝒶𝓈𝓉𝑒) |
| /about | About Postiz: The Agentic Social Media Scheduling Platform | About Postiz |
| /blog | Postiz Blog: Social Media Scheduling, AI Agents and Growth | The Postiz blog: social media scheduling, AI agents, and growth |

**Enterprise page**, https://postiz.com/enterprise [measured, checked 2026-11-12]:

- Hero subhead: "Integrate powerful social media scheduling capabilities into your platform."
- Benefit headings:
  - "Skip App Approvals"
  - "Multi-Tenant Architecture"
  - "Headless API"
  - "White-Label Ready" ("No Postiz branding. Present the scheduling capabilities as your own product to your customers.")
  - "Fixed Package Pricing"
  - "Full OAuth Support"
- Tiers, monthly. Each includes "unlimited posts, users and API calls", embedded components, and private Discord/Slack support.

  | Tier | Price | Channels |
  |---|---|---|
  | Starter | $200/mo | 200 |
  | Growth | $400/mo | 500 |
  | Business | $1,200/mo | 2,000 |
  | Enterprise | $2,500/mo | 5,000 |
  | Scale | $8,000/mo | 20,000 |

- Every "Contact Sales" button carries the tooltip **"We are not accepting new applications at the moment"**. It is in
  the served HTML.
- **This is the closest Postiz offer to what Siar sells, and it is closed.**

---

## 3. Pricing

Source: https://postiz.com/pricing, checked 2026-11-12 [measured].

**Billing model:** per organization (workspace), but **tiered by connected channel count**. "Each connected account
counts as one channel toward your plan limit" and, answering "If I connect 3 Facebook pages, does that count as 1
channel or 3?": "Each connected social account is one channel. So three Facebook pages = three channels, not one."
[measured, home FAQ, https://postiz.com/, checked 2026-11-12] (corrected 2026-11-12: both quotes were misworded; the
second was not the page's text). In practice the cap works per account, even though the bill goes to the
organization.

| | Standard | Team | Pro ("Popular") | Ultimate |
|---|---|---|---|---|
| Monthly | $29 | $39 | $49 | $99 |
| Yearly (pricing FAQ, per month) | $23 | $31 | $39 | $79 |
| Yearly (docs, per year) | $278 | $374 | $470 | $950 |
| Tagline | "Best for content creators" | "Best for small brands" | "Best for large businesses" | "Best for agencies" |
| Channels | **5** | **10** | **30** | **100** |
| Posts per month | Unlimited | Unlimited | Unlimited | Unlimited |
| Team members | none ("No team support") | Unlimited | Unlimited | Unlimited |
| AI images / month | none on pricing page; **20 in docs** | 100 | 300 | 500 |
| AI videos / month | 3 | 10 | 30 | 60 |
| AI video clipping, min / month | 60 | 120 | 300 | 600 |
| Webhooks (docs) | 2 | 10 | 30 | 10,000 |
| API, MCP, CLI | Yes | Yes | Yes | Yes |

On every tier the pricing page also lists:

- Advanced Picture Editor, AI copilot, Custom Integrations
- API, Webhooks, Post comments, Repeated posts, Post delays
- Any channel, Smart Agent, Cross posting
- Internal Plugs, Global Plugs
- Analytics, Customer groups, Calendar views
- RSS auto-post, Posting sets, Signatures

Docs sources: https://docs.postiz.com/cloud/plans and https://docs.postiz.com/cloud/limits, checked 2026-11-12 [measured].

**Free tier:** none on cloud. "There is no free plan. An organisation without a subscription cannot use the app"
[sourced] https://docs.postiz.com/cloud/plans.

- There is a 7-day trial, marketed as "Start for $0".
- A Trustpilot reviewer (Jayden, 2026-10-23) writes "Free trial requires a credit card", asked after personal
  details are entered [third-party, https://www.trustpilot.com/review/postiz.com, checked 2026-11-12].
- The self-hosted edition is free under AGPL-3.0. "You handle installation with Docker, updates, backups, and the
  developer-app approvals on each social network yourself" [measured, home FAQ, https://postiz.com/, checked
  2026-11-12] (corrected 2026-11-12: quote was misworded).

**Overage:** none. A hard cap applies, and "Anything you do that exceeds a plan limit fails with a message naming the
limit". Posts are "effectively unlimited". The channel cap is the lever: "the channel cap cannot [be worked around]"
[sourced] https://docs.postiz.com/cloud/plans.

**Other money terms** [sourced, docs, checked 2026-11-12]:

- **Refunds:** up to one month of fees if the last charge was within 120 days. "Annual plans are not refundable"
  [measured, pricing FAQ, https://postiz.com/pricing; the 120-day rule is on the pricing page, not in the docs].
- **Lifetime codes:** AppSumo-style codes exist. The first code gives Standard for life; each extra code moves the
  account to Pro and adds 5 channels. https://docs.postiz.com/cloud/codes-and-offers
- **Retention offer:** 50% off for 3 months when a monthly customer starts to cancel.
- **Promo codes:** monthly plans only.
- **App-approval service:** an optional paid service for self-hosters, in which Postiz gets the self-hoster's own
  developer apps approved. "Facebook, Instagram, Threads and YouTube… usually take more than a month". The pricing
  page names the service but shows no price [measured].
- **Affiliate programme:** affiliate.postiz.com.
- **Agent Media:** the UGC video product is a separate subscription.

**Inconsistencies on their own pages** [measured]:

- Standard AI images: none on the pricing page, 20 in the docs.
- RSS on Standard: listed on the pricing page, "No" in the docs.
- Yearly price: $23/mo (= $276) in the pricing FAQ, $278 in the docs. The docs say the pricing page wins if the two
  disagree.
- Docs table, Standard: "AI image credits 20" but "Image generator: No" in the same table.

---

## 4. Networks and API features

### Networks [measured, checked 2026-11-12]

Postiz states its platform count four ways:

| Count | Where |
|---|---|
| "30+" | Marketing site |
| "34 platforms" | https://docs.postiz.com/general/platforms/overview |
| "32 total" | https://docs.postiz.com/public-api/introduction |
| "27" | The OpenAPI spec embedded in the docs |

The docs table lists these 35 rows:

- **Main social:** X, LinkedIn, LinkedIn Page, Instagram (Facebook Business), Instagram Standalone, Facebook Page,
  Threads, YouTube, TikTok, TikTok Business, Pinterest
- **Business:** Google My Business
- **Federated and decentralized:** Bluesky, Mastodon, Lemmy, Farcaster/Warpcast, Nostr
- **Regional and niche social:** Reddit, VK, MeWe, Tumblr, Dribbble
- **Chat and streaming:** Discord, Slack, Telegram, Twitch, Kick
- **Blogging and email:** Medium, Dev.to, Hashnode, WordPress, Listmonk (email)
- **Communities:** Moltbook, Whop, Skool (Skool connects through a browser extension)

**What Postiz lacks** [measured, against Siar's code]:

- **Snapchat.** No Postiz channel. Siar has an adapter (parked, "built, not open yet").
- No WhatsApp, no LINE, no Xiaohongshu. **Siar has none of these either** (its 15 adapters in
  `packages/networks/src/adapters/` do not include them), so this is not a Siar advantage (corrected 2026-11-12).

**What Siar lacks** [measured]: Telegram, Reddit (Siar has an adapter but it is parked), Medium, Dev.to, Hashnode,
WordPress, Lemmy, Farcaster, Nostr, VK, MeWe, Tumblr, Twitch, Kick, Dribbble, Listmonk, Whop, Skool and Moltbook. Postiz
wins on breadth, by a wide margin.

**Cloud has its own developer apps on every network** ("On Postiz Cloud this is already done for every platform")
[sourced] https://docs.postiz.com/general/platforms/overview; the about page says Gitroom LLC "holds the developer
approvals". That approval status is Postiz's own claim; I did not verify it with each network. Siar today publishes to
9 networks. TikTok, YouTube public uploads, Pinterest publishing and LinkedIn pages are waiting on network approval;
Reddit, Snapchat and Google Business Profile are **parked** ("built, not open yet"), not pending (siar-truth §1–2)
(corrected 2026-11-12).
**Postiz is ahead here, and Siar must not claim parity.**

### API and developer surface [measured, docs checked 2026-11-12]

| Capability | Postiz | Siar (from siar-truth.md) |
|---|---|---|
| REST API size | About 30 documented operations: integrations ×9, posts ×8, uploads ×4, analytics ×2, clipping ×3, video ×2, notifications ×1, connect. Count from the docs sitemap | 270 operations, OpenAPI 3.0 |
| Auth | API key in `Authorization` header; OAuth2 tokens `pos_…` for "apps for other Postiz users" | `x-api-key`, org keys, up to 50 |
| Rate limit | "**90 requests per hour** (100 for the cloud)" on create-post, "not something that scales with your plan". Batching several posts in one request is allowed. The embedded OpenAPI spec says "**30 requests per hour**", a self-contradiction ([docs](https://docs.postiz.com/public-api/introduction), [limits](https://docs.postiz.com/cloud/limits)) | 100 req/s, 500 per 10 s, 2,000/min per key and endpoint |
| Webhooks | "an HTTP callback Postiz fires when a post publishes". (The home FAQ says webhooks "fire on post events"; the docs describe publish only.) Scoped by channel. 2/10/30/10,000 per plan. **No signature, secret, event list or retry policy documented**: I searched llms-full.txt for HMAC, signature and retry and found nothing for webhooks ([source](https://docs.postiz.com/general/automations/webhooks)) | 16 HMAC-signed events, 7-step retry backoff, delivery log, resend |
| Failed posts | "Postiz does not silently retry a rejected post: fix the cause and reschedule" | Up to 6 retries, not double-counted; never-post-twice claim logic |
| SDK | Node SDK `@postiz/node` (444 downloads/mo); n8n node; Make.com | TS SDK built, **not on npm yet** |
| CLI | `postiz` on npm, 25k downloads/mo | Built, not on npm |
| MCP | Hosted at `mcp.postiz.com` with OAuth, no API key. Official connectors in the Claude directory, ChatGPT, Cursor Marketplace, Gemini CLI extensions, Manus, Grok. Tools: list integrations/groups, schedule post, list posts, upload, generate image/video, clipping. "**Can MCP read or reply to comments? Not today**" ([source](https://docs.postiz.com/mcp/introduction); corrected 2026-11-12, the quote is on the MCP introduction page, not /mcp/tools) | 19-tool MCP server, **not on npm yet** |
| Connect flow for your users | (a) `GET /social/{integration}` returns the network's OAuth URL; OAuth networks only ("integrations that require an external URL, such as Mastodon, are not available via this endpoint", https://docs.postiz.com/public-api/integrations/connect). That each new channel counts against the plan's cap is [inferred] from the plans page's definition of a channel. (b) "Invite links": one platform per link, the client authorises on the network's screen and the channel lands in **your** Postiz org. No branding options are documented ([source](https://docs.postiz.com/general/channels/customers)) | Hosted branded connect link (name, logo, colour; "Powered by Siar" footer) |
| White-label | Enterprise only: "No Postiz branding", multi-tenant. **Closed to new applications** | Branded, not white-label |
| Analytics | Account-level analytics for 11 platforms (the docs say "Only 10 of the 34"): Facebook Page, IG ×2, LinkedIn **Page only**, TikTok ×2, YouTube, GMB, Pinterest, Threads, X. Per-post stats on **12** (the 11 above plus Dribbble). API endpoints: `GET /analytics/{integration}`, `GET /analytics/post/{postId}` ([source](https://docs.postiz.com/general/analytics); corrected 2026-11-12: was "8" and doc-page slugs instead of paths) | Normalised account + post metrics, paid plans |
| Comments | Can **schedule** follow-up comments and threads. Can reply to an Instagram comment "via an explicit user action" (https://docs.postiz.com/self-host/providers/instagram). **No comment-reading endpoint** in the public API; the built-in agent's "What it cannot do" list starts "Read or reply to comments on your posts" (https://docs.postiz.com/general/agents) | Import, reply, hide, delete, like where the network allows |
| DMs / inbox | None found in docs or marketing [measured: searched llms-full.txt and the site] | FB + IG DMs and comment-to-DM: beta, per org on request |
| Extras Siar does not have | AI image and video generation, YouTube clipping, Canva-like editor, RSS auto-post, repeat posts, "Plugs" (auto-repost or comment at engagement thresholds), approval preview links, Chrome extension, mobile app repo | Link in bio (Postiz has none found) |

---

## 5. SEO footprint

### Sitemap [measured, https://postiz.com/sitemap.xml, checked 2026-11-12]

The sitemap index has two children:

- `sitemap-0.xml`: **1,215 URLs**.
- `sitemap-posts.xml`: the first pass got 504 then 503. My re-fetch on 2026-11-12 returned **200 with 398 blog
  URLs** [measured]. The blog is in the sitemap; the earlier "weakness" was a transient error and is withdrawn
  (corrected 2026-11-12).

| Section | URLs | What it is |
|---|---|---|
| `/compare/...` | **631** | 1 hub, 17 single-tool pages (`/compare/hootsuite`), **613 pairwise pages** `/compare/{a}/{b}`. 63 are "Postiz vs X". The other ~550 compare two **other** tools (e.g. `/compare/ayrshare/zernio`, `/compare/ayrshare/mixpost`), each with an H2 "Postiz is an agentic social media scheduler". Pure programmatic |
| `/tools/...` | **249** | Free tools: 12 tool types × ~20 networks. Font generator, bold text, character counter, hashtag tool, bio/comment/post/name/logo generators, photo resizer… These target consumer creator queries |
| `/{agent}/{network}` | **9 × 25 = 225**, plus the 9 hubs | Agent × network pages: `/claude-code/instagram`, `/openclaw/tiktok`, and so on, for Claude Code, Claude Cowork, Codex, OpenClaw, Hermes Agent, Grok Bot, NanoClaw, Paperclip, Perplexity Computer |
| Single agent pages | 12 | /claude, /chatgpt, /cursor, /gemini, /dots, /deepseek, /kimi, /muse, /manus, /cue, /grok-build, /hermes |
| `/alternatives/...` | **45** | 1 hub + 44, including /alternatives/ayrshare, /buffer, /hootsuite, /later, /mixpost, /upload-post, /publer, /typefully |
| `/channels/...` | 30 | Per-network **scheduler** pages ("Instagram Post Scheduler…"). These are not API guides |
| Core | ~15 | /, /pricing, /mcp, /agent, /enterprise, /about, /news, /blog, legal |

**Comparison targets** [measured]:

- API rivals: Ayrshare, Zernio, Upload-Post, Blotato, Mixpost, PostSyncer, Post-Bridge.
- Mainstream tools: Buffer, Hootsuite, Sprout Social, Later, Metricool, SocialPilot and others.
- Missing: there is **no page for bundle.social, Outstand, SocialAPI.ai or Siar** (0 URL matches).

**Blog** [measured]:

- `/blog` paginates to page 46, at 9–10 posts per page, which suggests 420–460 posts [inferred]. `sitemap-posts.xml`
  lists **398** blog URLs [measured 2026-11-12]. Use "about 400" (corrected 2026-11-12).
- Recent posts are agent-growth stories: "grok-bot-3-x-accounts-69m-impressions…", "ai-ugc-tiktok-slideshows-26m-views…",
  "how-one-founder-automated-social-media-posting-with-ai-agents-notion-and-postiz-to-hit-1300-mrr".
- Old posts are generic SEO filler ("bots-following-me-on-twitter…", "top-10-linkedin-scheduling-tools-in-2024").
- It also runs listicles such as https://postiz.com/blog/open-source-social-media-scheduler (the URL is in
  `sitemap-posts.xml` [measured]; the title "Top 12 Open Source Social Media Scheduler Tools" came from a search
  result and is unverified).

**Docs** [measured, https://docs.postiz.com/sitemap.xml]: 173 URLs.

| Docs section | URLs |
|---|---|
| public-api | 64, 34 of them provider pages (corrected 2026-11-12 from "about 33") |
| self-host | 47 |
| general | 39 |
| cloud | 8 |
| cli | 8 |
| mcp | 4 |

There are no per-network API guides in the "Instagram API" sense, no error-code pages and no glossary.

**GEO stance** [measured]:

- `robots.txt` explicitly allows GPTBot, ChatGPT-User, OAI-SearchBot, PerplexityBot, ClaudeBot, anthropic-ai,
  Google-Extended and Bingbot.
- `llms.txt` and `llms-full.txt` exist on both the site and the docs.
- `llms.txt` opens with an answer-engine pitch: "Postiz is the agentic social media scheduling platform…"
- Postiz invests in AI-answer visibility deliberately, as Ayrshare does.

### Keyword targets inferred from titles and H1s [inferred]

1. **"social media MCP server"** and "post to social media from Claude / ChatGPT / Claude Code / Cursor": the /mcp and agent hub pages.
2. **"<agent> + <network>"** long tail: "post to Instagram from Claude Code", "OpenClaw TikTok".
3. **"<network> post scheduler" / "schedule <network> posts"**: the /channels pages. These are consumer scheduler terms, not API terms.
4. **"<tool> alternatives"** and **"<tool A> vs <tool B>"** at scale, including rivals' own head-to-heads.
5. **Creator utility queries**: "instagram font generator", "tiktok character counter", "youtube title generator".
6. **"open source social media scheduler"** and **"self-hosted"**: the GitHub repo topics ("open-source-social-media-scheduling-tool") and blog listicles.
7. **"white-label social media scheduling"** and "add social media scheduling to your SaaS": the /enterprise title.

What they do **not** target [inferred from the sitemap]:

- "social media API", "unified social media API", "<network> API pricing" or "<network> API errors".
- **That is the lane Siar's `/[api]` and `/[api]/errors` pages are built for.**

### Demand evidence [measured: Google autocomplete, en-US, 2026-11-12; conclusions inferred]

| Query typed | Suggestions |
|---|---|
| "postiz " | github, login, **self hosted**, **reviews**, open source, **reddit**, **alternative**, app github, **vs buffer** |
| "postiz a" | **alternative**, app github, account, ai agent, ai, **api**, **api key**, agent, **alternative open source** |
| "postiz api" | api key, **api pricing**, api docs, api documentation, api url, **api rate limit**, public api, instagram api, self hosted api |
| "postiz v" | vs buffer, vs blotato, vs mixpost, vs zernio, vs metricool, vs postbridge |
| "postiz self" | self hosted, …features, …docs, …requirements, **…tiktok**, …reddit, …docker, …github, …api, **…alternative** |
| "postiz alternative" | alternative open source, alternative reddit, **alternative self hosted** |
| "social media scheduler open source" | …github, free open source…, **postiz open source social media scheduler**, best open source… |

Reading:

- "postiz api rate limit" and "postiz api pricing" are autocomplete-level queries. Developers hit the hourly cap and
  search for it.
- "postiz alternative" is a crowded term. Rival pages reported in the first pass's search: postfa.st, Blotato
  ("…When You're Done Self-Hosting"), Outstand, posteverywhere.ai, ryandoser.com, maevesocial, postjay, Zernio,
  postplanify, mallary.ai and socialk.it. **Unverified (search not re-run 2026-11-12).** Only Outstand's page is
  confirmed to exist: https://www.outstand.so/postiz-alternative, title "The Hosted Postiz Alternative for Developers -
  Outstand" [measured 2026-11-12]. Whether any of these rank, and in what order, is unconfirmed.
- Postiz probably owns the "open source social media scheduler" head term by brand [inferred: autocomplete offers
  "postiz open source social media scheduler" and "postiz free open source social media scheduler"; rankings not
  re-run].

### Backlink and authority signals [sourced / measured]

- **GitHub**: 41.4k stars and 7.9k forks [measured]. This is the dominant authority signal. Forks and mirrors link back
  (e.g. github.com/whluf/postiz-app).
- **Directories**: https://openalternative.co/postiz exists and carries the "open-source-social-media-scheduling-tool"
  tag [measured 2026-11-12]; the "social-media-scheduler" tag was not found on the page (unverified). FitGap "open
  source social media management tools", Slashdot "on-premises social media schedulers" and creatorstackclub:
  unverified (search results only, not opened).
- **Product Hunt**: 4 launches with #1-of-day finishes [third-party, above].
- **Marketplaces**: the Claude directory connector, ChatGPT connectors, Cursor Marketplace, the Gemini CLI extensions
  gallery and the Manus connectors [sourced: postiz.com/llms.txt, not verified on each marketplace].
- **AWS Marketplace**: a listing URL (`prodview-h2unlxvkfmihs`) returns 200, but the page renders client-side and I
  could not read "Postiz" in it [unverified].
- **Review sites**:

  | Site | Rating | Status |
  |---|---|---|
  | G2 | 4.8 from about 51 reviews | [unverified: search snippet; https://www.g2.com/products/postiz/reviews returned 403 on 2026-11-12] |
  | Capterra | listing exists | [unverified] |
  | Trustpilot | **3.4 from 17 reviews, 59% 5-star, 41% 1-star**; Postiz replied to all 7 one-star reviews (the profile also says it "typically takes over 1 month to reply") | [sourced] https://www.trustpilot.com/review/postiz.com, fetched 2026-11-12 |
  | AppSumo | 2.2 from 4 reviews | [sourced] https://appsumo.com/products/postiz/reviews/promising-but-needs-better-support-and-381141/, checked 2026-11-12 |

- **Rival roundups**: they get links from rivals' "alternatives" pages (above), which is negative-intent coverage.

---

## 6. Weaknesses

### Real user complaints (sourced)

**Trustpilot**, https://www.trustpilot.com/review/postiz.com, fetched 2026-11-12. Seven 1-star reviews (dates are the
review headers; two review bodies give earlier experience dates, Erico Maz April 16 and Rick R. June 15):

| Date | Complaint |
|---|---|
| 2026-11-07 | Trial signup failed after seven attempts; cancellation emails unanswered; several charge attempts |
| 2026-10-29 | Payment declined on both cards; "no option to delete my account or to delete my bank details" |
| 2026-10-23 | Weak UX and onboarding; card required at signup; AI media generation leaves empty attachments; outdated self-hosting docs |
| 2026-09-16 | Support felt fully automated: "They literally delegated all support to AI." |
| 2026-07-26 | Cancellation ignored, billed for three months |
| 2026-07-15 | LinkedIn page not detected; a deleted connection came back |
| 2026-06-20 | "I paid for the highest plan and my openclaw agent can't post." (corrected 2026-11-12: earlier "doesn't work" was not the reviewer's words) |

**AppSumo** (2026-04-30, 3 stars):

- Two support tickets, by email and on Discord, got no answer.
- Posts fail fairly often, with vague error messages.

**GitHub issues** [sourced]:

| Issue | Opened | State | What it says |
|---|---|---|---|
| [#918](https://github.com/gitroomhq/postiz-app/issues/918) "Cannot add channels - 'Could not add provider'" | 2025-08-03 | Open, **56 comments**, the most-commented issue | Channels cannot be added |
| [#2299](https://github.com/gitroomhq/postiz-app/issues/2299) | 2026-10-21 | Open | Facebook/Instagram channels flagged "refresh needed" after 59 days, although Page tokens do not expire |
| [#832](https://github.com/gitroomhq/postiz-app/issues/832) | 2025-06-21 | Closed "not planned" | Instagram Standalone reposted in a loop, and the account was "flagged… and disabled permanently" |
| [#1004](https://github.com/gitroomhq/postiz-app/issues/1004) | 2025-09-29 | Closed "not planned" | "Media fetch failed" posting to Instagram from Docker |
| [#1174](https://github.com/gitroomhq/postiz-app/issues/1174) | 2026-01-17 | Closed "not planned" | 502 on a fresh docker-compose signup, 37 comments |
| [#825](https://github.com/gitroomhq/postiz-app/issues/825) | 2025-06-19 | Closed "not planned" | GIFs posted to LinkedIn arrive as static PNGs |

Issue search counts [measured, GitHub search API, re-run 2026-11-12]. These are **unquoted word searches** (all words
anywhere in the issue). As exact phrases the counts are lower: "refresh needed" 2, "rate limit" 13, "self-hosted" 200.

| Search | Issues |
|---|---|
| "self-hosted" | 202 |
| "linkedin" | 121 |
| "instagram" | 120 |
| "tiktok" | 54 |
| "refresh needed" | 19 |
| "rate limit" | 14 |

**Their own Known Issues page** [sourced] https://docs.postiz.com/general/troubleshooting/known-issues:

- The TikTok connect page crashes for some accounts.
- The X connect page crashes after redirect.
- `DELETE /public/v1/posts/:id` returns 500 for a missing ID.
- AI image generation fails with 400 against newer OpenAI API versions.

**Maintainer and community friction**:

- Sergio Visinoni's "Postiz has a slop problem" (2026-03-11) argues the maintainer built and promoted an AI-content
  "slop machine" and then complained about AI-generated PRs flooding the repo. It cites the
  maintainer's r/selfhosted post "I don't think I can maintain PRs anymore at Postiz"
  (https://www.reddit.com/r/selfhosted/comments/1ropohy/i_dont_think_i_can_maintain_prs_anymore_at_postiz/), and
  says some of the maintainer's Reddit posts were removed as spam [third-party, opinion]
  https://makemeacto.cc/p/postiz-has-a-slop-problem.
- I could not open Reddit directly (blocked from this environment). Reddit thread counts are **unverified**.

**Self-host support** [sourced] https://docs.postiz.com/general/support: "Support for self-hosted installs is **not
guaranteed**… no response time". The pricing FAQ also says: "Self-hosting is a secondary option; the hosted platform
is where the agent features ship first."

### Gaps Siar can exploit honestly

1. **Accounts, not channels.**

   | Accounts to connect | Postiz plan needed | Siar |
   |---|---|---|
   | 31 | Ultimate, $99 | Starter, $19 / RM39 |
   | 101 or more | No public cloud plan; Enterprise is closed | Unlimited accounts on every plan |

   Postiz bills by connected account count: 5, 10, 30 or 100. Siar is fenced by brands and posts instead (Starter: 1
   brand, 300 posts/mo). Say both sides: Postiz has unlimited posts and Siar does not.

2. **API throughput.** Postiz is 90–100 create-post requests per hour on every plan. Siar is 100 requests per second
   per key and endpoint. Postiz lets one request carry many posts, so compare requests, not posts. Cite their docs
   URL and date.

3. **Webhooks you can trust.** Postiz documents a publish-only callback with no signature, no event list and no retry
   policy, capped at 2 on Standard. Siar has 16 HMAC-signed events, backoff retries, a delivery log and resend.

4. **Comments and DMs.** Postiz has no comment-reading API, its MCP "can't read or reply to comments", and it has no
   DMs. Siar has comment import and reply on live networks, and Facebook and Instagram DMs as a beta on request. Use
   siar-truth wording for the beta.

5. **Built for products that connect their customers' accounts.**
   - Siar has a branded hosted connect link with your name, logo and colour.
   - Postiz's invite links drop channels into your own org's channel cap, with no branding documented.
   - Postiz's white-label Enterprise ($200–$8,000/mo) is "not accepting new applications".
   - Siar must still say "branded", not "white-label".

6. **A free start without a card.** Postiz cloud has "no free plan" and its trial needs a card [third-party]. Siar
   offers "20 free posts to try" with no card and no time limit.

7. **Errors as content.** Siar has per-network error reference pages, verbatim network errors and validation before
   send. Postiz's own docs list unresolved 500s and connect-page crashes, and "Postiz does not silently retry a
   rejected post". Siar's never-post-twice design answers the GitHub #832 class of failure. State it as a design
   guarantee, not a measured rate.

8. **No servers, no app reviews, for the self-host-curious.** The "postiz self hosted" and "postiz alternative self
   hosted" queries come from people weighing Docker, Postgres, Redis and Temporal, plus their own Meta/TikTok/YouTube
   app reviews ("usually take more than a month", Postiz's words). Siar is hosted and carries its own approvals.
   **Caveat:** only claim the networks Siar is approved on today.

9. **Malaysia.** Ringgit pricing, FPX/DuitNow for yearly plans, and a Malaysian contracting entity. Postiz contracts
   from Hong Kong in USD.

10. **SEO gap to take.** Postiz has no pages for "social media API", "<network> API", "<network> API errors", or
    bundle.social or Siar comparisons. Siar's `/[api]` and `/[api]/errors` pages face no Postiz competition. A
    "Postiz alternative for developers" or "Postiz API alternative" page can target the autocomplete terms "postiz api
    rate limit", "postiz api pricing" and "postiz alternative self hosted".

**Where Postiz is genuinely stronger** (do not contest it):

- Network breadth: 30+ channels, against 9 live on Siar.
- Approvals already granted on TikTok, YouTube, Pinterest and LinkedIn Pages (Postiz's own claim, not verified with the networks).
- Open source and self-hostable.
- Unlimited posts.
- AI generation and clipping.
- A published CLI, SDK and MCP, with marketplace connectors.
- 41k stars of social proof.

Siar's SDK, CLI and MCP are not on npm yet, so Siar cannot compete on "install in one line" today.

---

## 7. How Siar should position against Postiz (one line)

Postiz is a scheduler that AI agents drive. Siar is the hosted API a product builds on to publish for its own
customers: unlimited connected accounts on every plan instead of a 5–100 channel cap, 100 requests a second instead of
about 100 an hour, signed webhooks, a comments API and a branded connect link, and no servers or app reviews to run.
