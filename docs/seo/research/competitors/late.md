Verified 2026-11-12: 15 corrections

# Competitor teardown: Late, now Zernio (zernio.com)

Checked 2026-11-12. Adversarial re-check on 2026-11-12: every vendor page, OpenAPI count, sitemap count, npm/GitHub
number, Wayback snapshot and quoted review was re-fetched. Ranking/search-result claims could **not** be re-run (the
team's web-search budget was used up), so they are marked "not re-verified". The verification log is at the end. Builds on `docs/geo/brief.md` (which lists "Late (getlate.dev)" as a hypothesis competitor) and
prompt p025 "Late API vs Ayrshare" in `docs/geo/prompts_v1.csv`. Siar facts come only from
`docs/seo/research/siar-truth.md`.

Labels: **[measured]** = I fetched or counted it myself on 2026-11-12. **[sourced]** = vendor's own page, URL given,
checked 2026-11-12. **[third-party]** = someone else's page, URL given. **[inferred]** = my reading. **[unverified]** = could not confirm.

---

## 0. Name, domain, company

| Fact | Value | Label |
|---|---|---|
| Current name / domain | **Zernio**, https://zernio.com. `getlate.dev` returns **301 → https://zernio.com/**, and old deep links 301 page by page (e.g. `getlate.dev/blog/ayrshare-alternative` → `zernio.com/blog/ayrshare-alternative`) | measured (`curl -I`) |
| Rebrand page | https://zernio.com/rebrand, H1 "Late is now Zernio." Old → new: docs.getlate.dev → docs.zernio.com, `@getlatedev/node` → `@zernio/node`, `late-sdk` → `zernio-sdk`, `LATE_API_KEY` → `ZERNIO_API_KEY`, base URL `getlate.dev/api/v1` → `zernio.com/api/v1`. Old packages "work for 6+ months" | sourced |
| Their stated reason | "Try searching “Late API” and you'll understand: generic words make terrible brand names." (rebrand page) | sourced |
| Rebrand date | Between 2026-03-05 (getlate.dev still 200) and 2026-03-25 (first 301). zernio.com first captured 2026-03-17. No dated announcement found | measured (Wayback CDX) / inferred |
| Legal entity | ZERNIO SOFTWARE, S.L., Carrer Mallorca 2A, Palamós, Girona, Spain; `foundingDate: 2025` | sourced (home JSON-LD) |
| Team size | "seven-person bootstrapped team" / "1-10 people" | third-party (search summaries of findstack.com, lokeshkapoor.com), unverified |
| Direction | Was "Late - Unified Social Media API" (getlate.dev home `<title>`, Wayback 2026-03-02) [measured]. Now "Marketing infrastructure for agents": social + ads + WhatsApp/SMS/calls/iMessage/RCS + email/calendar/files + blogs + creator payouts | sourced (home, https://zernio.com/marketing-infrastructure) |

**Implication [inferred]:** "Late API" queries still exist (Google autocomplete for `social media api` suggests
"social media api late"; `late api` suggests "late api social media", "late api pricing" [measured, suggestqueries
2026-11-12]). Every old URL redirects, so Zernio kept that equity.

---

## 1. Positioning and on-page copy (quoted exactly)

### Home, https://zernio.com [measured]

- `<title>`: "Zernio - Marketing Infrastructure for Agents"
- Meta description: "Marketing infrastructure for agents: social, ads, inbox, WhatsApp, SMS and calls behind one API key. MCP server included, free up to 2 accounts."
- Announcement bar: "New: creator APIs to connect accounts, verify views and pay creators →"
- **H1:** "Marketing infrastructure for agents"
- **Subhead:** "Give your product or agent a way to reach customers anywhere. Skip months of platform approvals and go live today."
- CTAs: "Start for free", "Continue with Google", "Copy setup prompt", "See our live stats" (→ /open), "Talk to sales", closing "Ship your first channel today" + "No credit card, no sales call. Connect an account, publish, and see the webhook come back in minutes."
- "Works with": Claude Code, Cursor, Codex, Grok bot, OpenAI dots, Meta Muse, OpenClaw, Hermes.
- Section headings (H2 / H3), in order:
  - "Marketing infrastructure" / "One integration for every channel. Official APIs only" ("We've done the platform reviews, so you don't have to.")
  - "Unified Social Media API" / "Everything social, not just posting" (H4 per network, e.g. "Reels, stories, and DMs in one API", "Post as a person or a company page", "Submit and moderate across subreddits", "Spotlight and saved stories via API")
  - "Advertising API" / "Run campaigns without 9 ad managers"
  - "Communication API" / "Infrastructure for your voice agents and chatbots"
  - "Phone Numbers" / "Calls, SMS, and WhatsApp, all on one number"
  - "Customer stories" / "What teams build on top of Zernio"
  - "Built for enterprise scale"
  - "Integrate" / "Three ways in. Same API behind all of them" (H4s "Write it once, in your language", "Your agent posts, replies, and calls.", "The whole API, from your shell")
  - "200,000+ builders" / "What developers say after shipping"
  - "Frequently Asked Questions" / "Ship your first channel today"
- FAQ answers (from page data): "Custom integrations take 8-12 months. Zernio takes under an hour." · "We handle all developer apps, approvals, and quota limits." · "Is Zernio white-label friendly? Yes. Your users never see Zernio branding." · "Scales to unlimited accounts" · "MCP server with 496 tools" · "18 channels: Instagram, TikTok, X, LinkedIn, Facebook, YouTube, Threads, Pinterest, Bluesky, Google Business, Snapchat, WhatsApp, Telegram, Discord, Slack, iMessage, LINE, and WeChat."

### Proof they use [measured, home + pricing]

| Proof type | What is shown |
|---|---|
| Logos | Warner Music Group, Runable, ClickUp, MoFlo, RE/MAX, Readdy (home); ACT.agency, Vibiz, Plinng, HeyMark (customer stories); "Trusted by" Warner Music Group, ClickUp, Vibiz, Heymark (pricing) |
| Numbers | "Join 200,000+ of the world's most ambitious developers and builders"; live ticker "<n> Instagram accounts connected this week" (14,764 in the server-rendered HTML I fetched; the number changes); demo widget "Connected accounts 2,418" (illustrative); "Run 2,000+ connected accounts"; "99.97% uptime"; "Under 50ms response" (bundle page); "delivered over 2 million posts" (pricing FAQ) |
| Testimonials | Guillermo Rauch, CEO Vercel: "Zernio is great."; Danijel Dercksen (ACT.agency); 9 developer quotes, most first name only (e.g. Razvan Ghetiu, purplepalm.ai: "had everything up and running in less than an hour") |
| Case studies | 8 pages under /customers/ (act-agency, heymark, moflo, moving-monkey, plinng, readdy, runable, vibiz) |
| Badges | "SOC 2", "GDPR compliant" images; trust portal https://trust.zernio.com |
| Structured data | `SoftwareApplication` with `aggregateRating` 4.8 / `ratingCount` 50. No rating widget is visible on the page. Trustpilot shows 4.8 from 217 reviews, so the "50" matches nothing I could find [inferred] |
| Transparency page | https://zernio.com/open "Open Analytics", H1 "No vanity metrics. Just the real thing." Data loads client-side. On 2026-11-12 (browser, after load), last 30 days: 4,873,701 posts, 4,717,226 published, 156,475 failed, **96.8% success rate**, 648,261 accounts connected, 32,822,770 posts tracked [measured]. These are Zernio's own unaudited numbers |

**Inconsistencies on their own pages [measured]:** the home card says "Sixteen networks" while the home FAQ and
llms.txt say 18. The home page, /social-media-scheduler meta and /alternatives/bundle say "99.97% uptime", but the pricing
FAQ and the /social-media-api meta say "99.7%". The pricing FAQ says "delivered over 2 million posts" while /open shows
4.87 million in the last 30 days alone. The pricing.md FAQ says "$6/account for 1-10" while its own table says 1-2 free,
$6 for 3-10. The home FAQ says "Your users never see Zernio branding", yet their own OpenAPI note for `welcome=true` says "The platform's
authorization screen still names the Zernio app" unless you bring your own OAuth app.

### Main landing pages [measured]

| URL | Title | H1 / subhead |
|---|---|---|
| /social-media-api | "Social Media Posting API \| 18 Platforms, One Call \| Zernio" | "Social media posting API for developers" / "…publish, schedule, and manage content across 18 platforms. Replace months of integration work with a single endpoint." CTAs "Start building free", "View API docs" |
| /social-media-scheduler | "Social Media Scheduler API \| Support 18 Platforms \| Zernio" | "Social media scheduler API" |
| /use-cases/saas-platforms | "Social media API for SaaS platforms \| Zernio" | same H1 / "Add publishing, an inbox and analytics to your product in days. You build the feature, Zernio carries the platforms underneath." |
| /instagram-api | "Instagram API - Post Photos, Reels & Stories \| Zernio API" | "Instagram API" / "Instagram's Graph API requires Facebook app review… Zernio replaces all of that with one POST request…"; H2 "Live in three steps, no Instagram app review" |
| /tiktok-api | "TikTok API for Developers - Post Videos, Photos & Schedule Content \| Zernio" | "…No TikTok developer app needed." |
| /linkedin-api | "LinkedIn API - Post Updates & Media \| Zernio API" | "LinkedIn's Marketing API requires partner program approval… Zernio handles all of that with one POST…" |
| /alternatives/ayrshare | "Ayrshare Pricing 2026: $149-599/mo vs Zernio (free up to 2 accounts) \| Compare" | "The Ayrshare alternative at up to 82% less cost" |
| /alternatives/bundle | "The bundle.social Alternative for Developers \| Zernio" | "The bundle.social alternative for developers" |
| /compare | "Zernio vs Competitors \| Social Media API Comparisons" | "Zernio vs the alternatives" |
| /enterprise | "Enterprise - Zernio \| Custom Pricing for 2,000+ Social Accounts" | "Built for scale." |

Their core message is that the approvals are already done: "Skip months of platform approvals", "no Instagram app
review", "No TikTok developer app needed". Each network page opens by listing the native API's pain, then says "one POST".

---

## 2. Pricing (https://zernio.com/pricing and https://zernio.com/pricing.md, checked 2026-11-12) [sourced]

**Model: per connected social account, per month, graduated. No plans, no seats.** "One connected profile on one
platform counts as one account… Connect a customer's Instagram and TikTok and that's 2 accounts." Ad accounts count.
Connected WordPress/Shopify/Wix/Webflow sites count as accounts.

| Connected accounts | Price per account / month |
|---|---|
| 1-2 | Free (no card) |
| 3-10 | $6 |
| 11-100 | $3 |
| 101+ | $1 (no cap) |

Vendor examples: 10 accounts = $48; 20 = $78; 100 = $318; 1,000 = $1,218.

- **Included on every account:** unlimited posts, scheduling, queue, calendar, analytics, comments + reviews, webhooks, full API. "Nothing gated behind a plan."
- **Metered on top:** sent messages: first 10,000/month free, then $1 per 10,000 (received messages and comments free). Automation runs (new accounts): first 2,000/month free, then $2 per 1,000. Managed ads: "first 500 free", then metered per active ad (the rate table is not in pricing.md: unverified).
- **X:** "passes through their exact rates with zero markup": reads $0.005, user reads $0.010, posts & DM sends $0.015, posts with URL $0.200. Prepaid balance from $5, "never expires and is not refundable".
- **Other pay-per-use:** phone numbers from $3/month (55 countries; Malaysia is pre-order only: local $20, national $7), calls from $0.01/min, SMS from $0.008/segment (US), iMessage $200/month per sender, RCS $150 setup + $750 US approval + $160/month US, creator payouts 4% (min $0.50).
- **Free tier:** first 2 accounts, ongoing, "unlimited posts, analytics, and the full API", 10,000 messages a month. Rate limit 60 requests/min on free, 600/min paid, 1,200/min enterprise (llms.txt).
- **Enterprise:** "Available past 2,000 accounts": volume discounts, prepaid commitment, SCIM, dedicated Slack. SAML/OIDC SSO is on self-serve too.
- **Payment:** "all major credit cards (Visa, MasterCard, American Express)… through Stripe". Every price is shown in $; no other currency appears on pricing or pricing.md, so "USD only, no local currency" is [inferred]. VAT added where it applies. Refunds: none on balance; "credit your account" for billing errors or outages.
- **Annual:** no annual discount is shown on the current pricing.

**Pricing history (matters for the weaknesses in section 5):**

| When | Model | Source |
|---|---|---|
| Feb-Mar 2026 (as Late) | Free (2 "Social Sets", 20 posts/mo), Build $19 ($16 yearly, 10 sets, 120 posts/mo), Accelerate $49 ($41 yearly, 50 sets/unit, unlimited posts), Unlimited $999 ($833 yearly). Analytics and "Comments + DMs" were paid add-ons (+$10 / +$50 per unit / +$1000). A "Social Set" = one profile with one account per network | Wayback snapshot of https://getlate.dev/pricing, 2026-03-05 [measured] |
| AppSumo lifetime deal | Sold; now "sold out". Buyers say add-ons were not moved to the new model | https://appsumo.com/products/late/reviews/ [third-party] |
| From ~May 2026 | Per connected account, $6/$3/$1 | AppSumo reviews dated May 8-18 2026; Trustpilot 2026-06-07 [third-party]; current page [sourced] |

Their FAQ answers "Is there a setup fee?" with "no contracts", but there is no price-lock promise anywhere on pricing.md [measured: no such text].

---

## 3. Networks and API features

### Networks [sourced: https://zernio.com/llms.txt, https://zernio.com/openapi.json connect enum]

Connect enum: facebook, instagram, linkedin, twitter, tiktok, youtube, threads, reddit, pinterest, bluesky,
googlebusiness, telegram, snapchat, discord, slack, whatsapp, google, microsoft. Plus LINE, WeChat, iMessage (messaging),
WordPress/Shopify/Wix/Webflow (Blogs API), 9-10 ad networks (Meta, Google, TikTok, LinkedIn, Pinterest, X, OpenAI/ChatGPT,
Reddit, Microsoft).

Caveats they publish themselves:
- **Reddit: off.** "Reddit is temporarily unavailable… the Reddit endpoints below return 503 `PLATFORM_DISABLED`" (llms.txt). The home page still has "Submit and moderate across subreddits" [measured].
- **Snapchat: closed beta.** "`snapchat` is a closed beta with no public release date: it returns 403 `PLATFORM_BETA_RESTRICTED`" (OpenAPI `platform` param). The home page still says "Spotlight and saved stories via API" [measured].
- **Mastodon: not supported.** Zero mentions in openapi.json or llms.txt [measured]. Their own bundle.social page says "Choose bundle.social if you… Need Slack or Mastodon publishing specifically."
- TikTok, YouTube, LinkedIn company pages, Pinterest, Google Business are sold as live ("Post as a person or a company page", "Pins and boards straight from code") [sourced]. I did not test publishing [unverified as working].

### API surface [measured from https://zernio.com/openapi.json, fetched 2026-11-12]

- OpenAPI **3.1.0**, info.version 1.575.1, **857 paths / 1,262 operations**, **158 webhook event types**. The largest tags are Connect 90, Commerce 76, Ad Accounts 71, Ad Campaigns 70, Business Agent 55, WhatsApp 49, Analytics 44. Posts has only 13.
- Auth: `Authorization: Bearer` API key; restricted `zrk_` keys scoped by resource group.
- Webhooks: HMAC-SHA256 `secret`, up to 50 endpoints, delivery logs, redeliver, test event, auto-disable after 3 days of failures, filter by profile/account.
- Pre-flight validation: `POST /v1/tools/validate/post`, `/post-length`, `/media`, `GET /validate/subreddit`.
- **Connect / white-label:** hosted connect with `redirect_url`; **headless mode** (`headless=true`, you build the picker UI); **bring your own OAuth app** (`oauthAppId`, "the consent screen shows your app"); branded welcome screen (`brandName`, `logoUrl`, `primaryColor`, `welcomeTheme`); QR handoff to phone; `externalId` per profile for multi-tenant routing.
- **MCP:** hosted at `https://mcp.zernio.com/mcp` (Streamable HTTP, OAuth or key), "496 tools", listed in the official MCP registry as `com.zernio/zernio`; Claude Code plugin and Cursor plugin on GitHub.
- **SDKs:** 8 (Node, Python, Go, Ruby, Java, PHP, .NET, Rust). **CLI:** `npm install -g @zernio/cli`, "371 commands across 47 groups. JSON out by default".
- **npm last month (2026-10-12 → 11-10):** `@zernio/node` 234,269, `@getlatedev/node` 105,908, `@zernio/cli` 1,621 [measured, api.npmjs.org]. Raw download counts include CI installs [inferred].
- **Comments/DMs/analytics:** comments + reviews on IG, FB, Threads, X, YouTube, Bluesky, LinkedIn, Google Business; DMs on IG, FB, X, WhatsApp, iMessage, Bluesky, Reddit, Telegram, Slack; comment-to-DM automations; analytics included on every account.
- **Agent-readiness:** llms.txt (46 KB), `Accept: text/markdown` home, pricing.md, `/.well-known/api-catalog`, MCP server card, agent-skills index. robots.txt: `Content-Signal: search=yes, ai-train=no, ai-input=yes`.
- **Ayrshare drop-in:** GitHub `zernio-dev/social-media-api`, "Drop-in replacement for the Ayrshare social-media-api SDK". Vendor: "supports all 51 Ayrshare methods. 34 are fully implemented, the rest return clear 501 responses" (/alternatives/ayrshare). This is the same play as Siar's bundle.social wire compatibility.

---

## 4. SEO footprint

### Pages (https://zernio.com/sitemap.xml → sitemap-0.xml, 524 URLs; https://docs.zernio.com/sitemap.xml, 1,844 URLs) [measured]

| Type | Count | Examples |
|---|---|---|
| Blog posts | 239 (+4 category pages + /blog) | 97 slugs contain "api"; 23 "*-alternative"; 7 start "best-" (13 contain "best"); 8 "*-pricing" |
| Alternatives pages | 24 | /alternatives/ayrshare, bundle, postiz, uploadpost, postbridge, blotato, buffer, hootsuite, later, metricool, publer, sproutsocial, unipile, nylas, manychat… |
| Compare hub | 1 | /compare |
| "<x> API" pages | 26 | /social-media-api + 15 network pages (instagram, tiktok, linkedin, twitter, youtube, facebook, threads, pinterest, reddit, bluesky, whatsapp, telegram, discord, snapchat, google-business) + 6 ads-API pages + email/calendar/files/voice |
| Network root pages | 19 | /instagram, /tiktok, /x, /whatsapp… |
| Network error references | 12 | /x/errors ("X (Twitter) API Error Codes Reference"), /instagram/errors, /tiktok/errors… (same idea as Siar's `/<network>-api/errors`) |
| "<network> MCP" pages | 7 (+ blog post /blog/social-media-mcp) | linkedin-mcp, instagram-mcp, x-mcp, youtube-mcp, whatsapp-mcp, meta-ads-mcp, google-ads-mcp |
| Agent pages | 8 | /claude, /cursor, /codex, /openclaw, /hermes, /grok-bot, /dots, /muse |
| Programmatic: phone numbers by country | 67 + hub | /phone-numbers/<country> |
| Feature pages | ~15 | social-media-scheduler, -bulk-scheduling, -calendar, -inbox, -comments, -dms, comment-to-dm, schedule-first-comment, queue-posts |
| Calculators | 2 | /whatsapp-api-pricing, /twilio-pricing-calculator |
| Customers / changelog | 8 / 33 | |
| Partner credit pages | /yc ("$10,000 in credits"), /itnig ("$5,000") | |
| Glossary | none (/glossary 404) | |
| Docs | 1,844 | platforms 327, webhooks 176, whatsapp 84, connect 84, commerce 76… |

Freshness: 201 of 524 sitemap URLs carry a `lastmod` in Nov 2026, 56 in Oct, 106 in Mar 2026 (the rebrand) [measured].

### Top keyword targets, inferred from titles and H1s [inferred]

1. Head terms: "social media API", "social media posting API", "social media scheduler API", "unified social media API", "social media API for SaaS" (blog: `unified-social-media-api`, `social-media-api-free`, `multi-platform-social-media-api`).
2. "<network> API" ×15 social + 6 ads (title pattern "Instagram API - Post Photos, Reels & Stories").
3. "<competitor> alternative" / "<competitor> pricing" (24 pages + 23 posts; the Ayrshare page's title leads with "Ayrshare Pricing 2026").
4. "<network> API error codes" (12).
5. "<network> MCP", "social media MCP", "Claude/Cursor + social media".
6. Pricing-intent explainers: `twitter-api-pricing`, `linkedin-api-pricing`, `social-media-api-pricing`, `pay-per-account-pricing`, `whatsapp-business-api-pricing`.
7. Self-ranked listicles: `top-12-social-media-apis-for-developers` (the old `top-10-…` URL now 308-redirects to it [measured]), `best-social-media-analytics-tools`. Original claim that these rank in the "social media API for developers" results: **not re-verified 2026-11-12** (search budget used up) [unverified].
8. Non-social: WhatsApp API, SMS API, virtual phone numbers, Twilio alternatives.

Demand signals [measured: Google autocomplete, 2026-11-12; volume inferred]: `zernio` → pricing, tiktok, mcp, api, dashboard,
login, api key, alternative, docs. `zernio vs` → postiz, blotato, metricool. `zernio api` → whatsapp, social media, alternative.
Brand plus navigational suggestions point to real but modest branded demand [inferred]. Other vendors already target it:
https://bundle.social/getlate-alternative ("GetLate Alternative 2026: Now Called Zernio"),
https://opentweet.io/vs/zernio, https://posteverywhere.ai/blog/posteverywhere-vs-zernio [third-party].

### Who links to / cites them [measured unless marked]

- **Roundups that list Zernio** (I counted "zernio" mentions and links; "siaran" appears 0 times on each): Buffer, https://buffer.com/resources/best-social-media-apis/ (47 mentions, own H2, links zernio.com); Blotato, https://www.blotato.com/blog/best-social-media-api-tools (#5 "Best for developers who want pay-per-account usage pricing"); Ryan Doser, https://ryandoser.com/social-media-api/ (#4 "Best platform coverage, with a real free tier"); Social Champ, https://www.socialchamp.com/blog/best-social-media-apis/; DEV, https://dev.to/shreyvijayvargiya/social-media-posting-automation-free-tools-apis-2026-eh3. Also social-api.ai, woopsocial.com, invisibleapi.ai [third-party, not counted].
- **Product Hunt:** product page https://www.producthunt.com/products/zernio lists four launches: Zernio "Social API for AI agents and developers" (2026-03-18), Ads API (2026-04-22), WhatsApp API (2026-06-19, #2 of the day) and Zernio "Marketing infrastructure for products and agents" (2026-10-09, #2 of the day) [measured on PH, 2026-11-12]. Upvote counts: unverified (the page shows unlabelled numbers, 347 and 331 for the two #2 launches, which do not match the 323/336 previously cited from third-party summaries).
- **GitHub** (https://github.com/zernio-dev, 27 repos): zernflow 243★ ("Open-source ManyChat alternative"), latewiz 89★, zernio-node 45★, unified-inbox 40★, zernio-cli 29★ [measured, GitHub API]. The open-source side projects act as link bait [inferred].
- **Reviews:** Trustpilot https://www.trustpilot.com/review/getlate.dev: 4.8, 217 reviews, "No recent history of asking for reviews" [third-party]. AppSumo https://appsumo.com/products/late/reviews/: 4.0/5 from 84 (16 one-taco) [third-party]. Capterra/GetApp: "one review each (GetApp 1.0/5)" [unverified: both returned 403 on 2026-11-12]. **G2: no listing found [unverified; G2 returns 403]**. AlternativeTo /software/late [unverified, 403].
- **Affiliate program:** "Affiliates" in the nav; roundup links carry `?via=` parameters (e.g. `zernio.com/social-media-api?via=enrique` in search results). Some "best API" coverage is likely affiliate-driven [inferred].
- **Directories:** official MCP registry (`com.zernio/zernio`), n8n community node, Chat SDK adapter, Convex component [measured: MCP registry API lists `com.zernio/zernio`, active since 2026-05-25; the n8n node, Chat SDK adapter and Convex component are repos in github.com/zernio-dev. None of the three is in llms.txt].
- **Reddit:** original note "no threads surfaced in three searches" was not re-verified 2026-11-12 (search budget used up) [unverified]. Reddit presence looks thin [inferred, weak].

---

## 5. Weaknesses

### Real complaints (with links)

| Theme | Evidence | Label |
|---|---|---|
| **Per-account pricing hurts multi-account users** | "I was surprised to see that you moved from charging by profiles to charging by accounts." (1★, 2026-06-07); "charging per account makes it too expensive" (same review); "they changed their pricing recently which makes it less competitive" (3★, 2026-07-08). https://www.trustpilot.com/review/getlate.dev?stars=1&stars=2&stars=3 | third-party |
| **Pricing churn, lifetime-deal anger** | "Add-ons will not be adjusted to the new pricing model." (2026-05-18); "The promised free add-on was ripped away from early supporters" (2026-05-14). https://appsumo.com/products/late/reviews/; "keep changing their pricing and plans without notice" (Trustpilot 1★, 2026-06-23) | third-party |
| **Reliability / duplicates** | "At first it posted the same video 4x, then it wasn't posting at all." (4★, 2026-02-10, updated 2026-08-13, https://uk.trustpilot.com/review/zernio.com?page=8); "flags content as duplicate aggressively, swallows errors, and docs aren't up-to-date." (3★, 2026-05-07) | third-party |
| **Account safety** | "MY INSTAGRAM ACCOUNT HAS BEEN DELETED BECAUSE OF THIS SERVICE." (1★, 2026-05-18). Single claim, cause unknown | third-party, unverified |
| **Support / cancel / refund** | "nearly impossible to cancel your subscription" (1★, 2026-01-12); "waited more than a month for a reply" (2★, 2026-02-14); refund refusal over a phone number (1★, 2026-11-01). Zernio replied to each | third-party |
| **Video posting bugs** | "I cannot run API posting video on FB,Threads" (3★, 2025-10-08, Trustpilot); Capterra mention of YouTube video errors [unverified: Capterra 403] | third-party |

Balance: most reviews are positive (93% 5★ on Trustpilot) and praise the support and the docs. The complaints are a
minority, but they cluster on **pricing changes** and **per-account cost** [inferred].

### Gaps Siar can exploit honestly

1. **Per organization vs per account.** Zernio bills every connected account. Siar has unlimited accounts on every plan. Monthly USD, Zernio rate card vs Siar plans:
   - 5 accounts, 1 brand: Zernio $18; Siar Starter $19 (300 posts). Tie.
   - 40 accounts across 10 client brands: Zernio $138; Siar Pro $49 (10 brands, 10,000 posts).
   - 100 accounts across up to 100 brands: Zernio $318; Siar Business $149.
   - 1,000 accounts: Zernio $1,218; Siar Business $149 (100,000 posts/month cap).
   - **Where Zernio wins:** 1-2 accounts (free, unlimited posts, ongoing vs Siar's 20 free posts to try, one-time); very high post volume per account (Zernio never caps posts); and analytics and the inbox are included per account (sent messages free to 10,000/month; managed ads free to 500, then metered). Every comparison must say this.
2. **Price lock vs pricing churn.** Late moved from plans with "Social Sets" (Wayback 2026-03-05) to per-account pricing (~May 2026), one model change in about three months [measured]; reviewers say it "keep changing" [third-party], and buyers complained publicly. Siar: "Your price never goes up while you stay subscribed." Zernio publishes no such promise [measured].
3. **Malaysia.** Zernio is USD, card via Stripe only. Siar prices in ringgit and takes FPX/DuitNow for yearly plans from a Malaysian company. This is a clean win for MY buyers.
4. **Focus.** Zernio is now 1,262 operations across phones, iMessage, RCS, commerce, treasury and creator payouts; Posts is 13 of them. Siar is a social API (270 operations) whose dashboard runs on the same API. Some buyers want "just social" [inferred; make it a choice, not a jab].
5. **Status honesty.** Zernio's pages over-claim: subreddits and Snapchat are sold on the home page while their own docs say disabled/closed beta, the platform count is 16 vs 18, uptime 99.97% vs 99.7%, and "never see Zernio branding" contradicts their docs. A per-network status table that is exactly true would set Siar apart. **Siar's own site over-claims today** (siar-truth.md §6: TikTok/Google Business in the hero, "15 networks" with no status, `npx @siar/mcp` that 404s). Fix those first, or this angle backfires.
6. **Mastodon.** Siar publishes to Mastodon; Zernio does not. Niche, but true.
7. **bundle.social switchers.** Zernio runs /alternatives/bundle to pull them over. Siar speaks bundle.social's v1 API. This is the strongest wedge, but naming bundle.social is a parked owner decision (siar-truth.md §4).
8. **Duplicate posts.** Siar claims each network target once (publisher.ts). It is a design guarantee, not a measured rate, and the copy must say so.
9. **Published rate limit.** Siar: 2,000/min per key and endpoint. Zernio: 600/min paid. The units may differ (per key vs per endpoint), so state both exactly [inferred].

### Where Zernio is clearly ahead (do not pretend otherwise)

TikTok, YouTube public uploads, LinkedIn company pages, Pinterest publishing and Google Business are all sold as live.
Siar has none of those open (siar-truth.md §2). Zernio also has WhatsApp/Telegram/LINE/WeChat/iMessage, ads on 9+
networks, 8 published SDKs and a CLI, a hosted MCP in the official registry (Siar's packages are not on npm), headless
connect plus bring-your-own OAuth app (Siar's portal says "Powered by Siar"), SOC 2/GDPR paperwork, named customers,
inclusion in the Buffer and Blotato roundups, about 2,370 indexable URLs, and a rebrand that kept its link equity.

---

## 6. SEO moves for Siar from this teardown [inferred]

- Build `/compare/zernio` (titled for "Zernio alternative" and "Late API alternative"): a sourced table with the dated rate card and the worked cost math above, saying plainly where Zernio wins. Mention "formerly Late (getlate.dev)" once, because the legacy queries still exist.
- Build a "How much does a social media API cost? Per account vs per organization" explainer with a calculator. Zernio owns `pay-per-account-pricing`; Siar can own the other side.
- Do not chase 239 blog posts or self-ranked "top 10/12" lists (excluded in `docs/geo/offsite-plan.md`). Do pitch the roundup authors who list Zernio (Buffer, Blotato, Ryan Doser, Social Champ, the DEV author), using the per-organization fact and ringgit pricing.
- Parity items Zernio already has: MCP registry listing and npm packages (blocked on Fakhrul's go), `<network> MCP` pages after that, and Accept: text/markdown.
- Add prompt `zernio alternative` / `Zernio vs Ayrshare` to the next visibility wave. p025 uses the old name "Late API".

---

## One line

**Zernio charges for every account you connect; Siar charges for your organization: unlimited accounts from $19 (RM39 in Malaysia), with a price that never goes up, for teams that need social publishing and comments rather than phones and ads.** Never imply network parity until TikTok, YouTube, LinkedIn pages and Pinterest are open.

---

## Verification log (2026-11-12, adversarial re-check)

**Confirmed against the primary source [measured]:** getlate.dev 301 → zernio.com and deep-link 301s; rebrand page
quotes and old→new table; Wayback dates (getlate.dev 200 on 2026-03-05, 301 on 2026-03-25; zernio.com first capture
2026-03-17); JSON-LD legal entity, address, `foundingDate: 2025`, `aggregateRating` 4.8/50; home title, meta, H1-H4,
CTAs, "Works with" list, FAQ answers (8-12 months, 496 tools, 18 channels, white-label), "Sixteen networks", logos,
"200,000+", "2,418", "Run 2,000+ connected accounts", "99.97%"; "Under 50ms" on /alternatives/bundle; pricing.md in
full (ladder, examples, metering, X rates, phone/Malaysia pre-order, iMessage, RCS, enterprise, SSO on self-serve,
setup-fee FAQ, refund FAQ, "99.7%+", "2 million posts", no annual discount, no price-lock text); pricing logo strip;
llms.txt rate limits (60/600/1,200), Reddit 503 `PLATFORM_DISABLED`, MCP URL; openapi.json (3.1.0, v1.575.1, 857 paths,
1,262 operations, 158 webhooks, tag counts, Posts 13, connect enum, Snapchat closed-beta text, `oauthAppId` consent
text, "still names the Zernio app", 50 webhooks, 3-day auto-disable, HMAC-SHA256, validate endpoints, QR handoff, no
Mastodon); all 10 landing-page titles/H1s and quoted lines; Ayrshare "51 … 34 … 501" and "82% less"; bundle page
"Need Slack or Mastodon publishing specifically"; sitemap 524 URLs, 24 alternatives, 12 error pages, 19 network roots,
8 agent pages, 67 phone-country pages + hub, 8 customers, 33 changelog, /yc, /itnig, calculators, /glossary 404,
lastmod counts; docs sitemap 1,844 and section counts; robots.txt Content-Signal; `Accept: text/markdown` and
`/.well-known/api-catalog` both 200; npm counts (234,269 / 105,908 / 1,621); GitHub 27 repos, star counts, 8 SDK repos,
Ayrshare drop-in repo; MCP registry listing; Google autocomplete for all five queries; Wayback Late pricing
(2026-03-05) plans, prices and add-ons; Trustpilot 4.8 / 217 / 93% 5★ / "no recent history of asking for reviews" and
every quoted review with its stars and date; AppSumo 4.0/5 from 84 (16 one-taco), "sold out", both quoted reviews and
dates; roundups (Buffer 47 mentions and own H2, Blotato #5 quote, Ryan Doser #4 quote, Social Champ, DEV; 0 "siaran" on
each); bundle.social/opentweet/posteverywhere pages exist and name Zernio. Siar facts (270 operations, 2,000/min per key
and endpoint, Mastodon, "Powered by Siar", npm 404s, price-lock line, plan caps, FPX/DuitNow yearly) match
siar-truth.md and docs/pricing.md. Cost math (5/40/100/1,000 accounts = $18/$138/$318/$1,218) recomputed.

**Corrected (15):** (1) Late's old title was "Late - Unified Social Media API", not "social media scheduling API";
(2) Instagram ticker is a live number (14,764 on fetch), not a fixed 14,769; (3) /open does load data (4.87M posts,
96.8% success in 30 days), it did not show "Could not load data"; (4) blog posts 239 not 243, "api" slugs 97 not 98,
"best-" slugs 7 not 14; (5) network MCP pages 7 not 8; (6) `top-10-…` listicle now redirects to `top-12-…`; (7) 15
social "<network> API" pages, not 13; (8) Product Hunt upvote counts did not match PH (now unverified; dates and #2 ranks
confirmed on PH); (9) n8n/Chat SDK/Convex sourced from GitHub, not llms.txt; (10) ads are metered after 500 free, not
simply "included"; (11) "USD only" relabelled inferred; (12) "changed models twice" → one documented model change plus
reviewer reports; (13) "listicles rank for social media API for developers" downgraded to unverified; (14) Reddit
"no threads" note downgraded to unverified; (15) Capterra/GetApp/G2/AlternativeTo facts downgraded to unverified (403).

**Could not re-check:** any search-result ranking (search budget used up); team size (third-party, unverified);
Capterra, GetApp, G2, AlternativeTo (403); whether TikTok/YouTube/LinkedIn pages/Pinterest/Google Business publishing
actually works on Zernio (not tested).
