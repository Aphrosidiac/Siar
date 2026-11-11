Verified 2026-11-12: 11 corrections

> Adversarial check, 2026-11-12. Re-checked against the vendors' own pages: Publer plans (the free-plan list, the paid-plan lists, the X rule, the Pinterest rule, the payments line, trial lengths from the page's JS), Publer's per-account price formula (its own pricing endpoint `app.publer.com/api/v1/billing/subscription?visitor=true` returns rates of $4 and $7 per account and $2 and $3 per member, and `plans-*.js` sets the 1-account price to $5 and $10 and the 2-account price to $9 and $17), Publer docs (45 operations, rate limits, daily caps, auth headers, no webhooks), Publer help and blog quotes, Publer home copy, Metricool pricing (every price, add-on and inclusion), 10 Metricool help articles, Metricool's swagger counts, both sitemap sets, robots.txt, Google autocomplete (all 9 queries matched), GitHub stars, PyPI downloads, G2 (in a browser) and Trustpilot. Siar claims were checked against `siar-truth.md`, `docs/pricing.md` and `apps/api/src/domain/plans.ts`. **Not re-run:** the "who ranks" searches. The web-search budget for this run ran out before they could be repeated, so every ranking claim in 5c is now marked unverified. The cited URLs were opened and do exist. Corrections are marked "(corrected 2026-11-12)".

# Competitor teardown: Publer (publer.com) and Metricool (metricool.com)

Checked 2026-11-12. These two are **schedulers that also sell API access**, not API-first companies. Each claim is labelled:

- **measured**: I fetched the page, file, sitemap, spec or autocomplete myself on 2026-11-12. JS-rendered prices were read in a real browser.
- **sourced**: from a third-party page, with its URL.
- **inferred**: my own reading or estimate.

All Publer and Metricool facts come from their own domains (publer.com, metricool.com, help.metricool.com, app.metricool.com). Third-party claims are marked as such.

Prices below are the USD figures both sites showed to a Malaysian connection (egress country `MY`, measured via ipinfo.io). Neither site offered ringgit.

This file builds on:

- `docs/geo/plan.md` P3 (comparison pages)
- `docs/geo/offsite-plan.md`
- `docs/pricing.md`
- `docs/seo/research/siar-truth.md` (every Siar claim here must match it)
- the other teardowns in this folder

**Fix needed in `docs/pricing.md`:** it sources Metricool's pricing from a third party (socialpilot.co, checked 2026-10-13). Replace that line with https://metricool.com/pricing/ and the figures in section 3b.

---

## 1. Who they are

| | Publer | Metricool |
|---|---|---|
| Company | Kalemi. The footer reads "© 2026 Kalemi". Its Trustpilot profile gives an address in Tirana, Albania. (measured) | METRICOOL SOFTWARE (named in its Fair Use Policy). White-label support runs "12:00 to 20:00 – Madrid time zone". (measured, help.metricool.com) |
| Self-description | "The ultimate hub for social media management" (footer). Its own claims: "14+ years of expertise in the industry" and "500K+ happy users worldwide". (measured, home) | "Join over 4 million professionals who use Metricool" (measured, home) |
| What the API is | A Business-plan feature for automating your **own** workspace. A 2025-09-03 blog post pitches it at "teams creating marketing automation tools" and says "building a white-label scheduler" is possible. (measured: https://publer.com/blog/publer-api-for-marketers-and-developers/) | An Advanced-plan feature for exporting data and automating tasks with "Zapier, Make". Embedding Metricool in another product is a separate sales-led product, "White Label for Integrators", on the Custom plan only. (measured, help.metricool.com) |
| Languages | 7: en, fr, de, it, es, sq, pt (measured, sitemaps) | 7: en, es, fr, de, it, pt, nl (measured, sitemaps) |
| Event presence | Home page banner: "Web Summit: Meet us at Booth E368, Pavilion 3!" (measured) | — |

Neither competes with Siar head-on as "a social media API". They compete for two other buyers:

- the agency or small business that wants a scheduler and might later want an API
- the person searching "<brand> api" or "<brand> mcp" who wants to automate their own accounts

(inferred)

---

## 2. Home pages and main landing pages (exact copy)

### 2a. Publer home: https://publer.com/ (measured)

- `<title>`: **"Powerful Social Media Management & Scheduling Tools | Publer"**
- Meta description: "Boost your social media strategy with Publer's suite of tools. Manage multiple accounts, schedule posts, collaborate with your team, and analyze performance—all in one place."
- Visual headline. It is an `<h2>`, not the H1: **"Streamline Your Social Media & Get Real Results"**
- `<h1>`, set as the subhead: **"Manage, automate, and track your social media success"**
- Hero CTA: **"Get Started For Free"**, with "No credit card required." Header CTAs: "Log in", "Get started now". The hero tabs are Plan, Schedule, Explore, Collaborate and Analyze.
- Section headings, in order:
  - H3 "Results that speak for themselves". The stat cards:
    - "+300% increase in engagement across social platforms"
    - "2x faster content creation and scheduling"
    - "Save 5+ hours weekly on social media tasks"
  - H3 "Everything you need to succeed in one platform." with the line "Close all tabs. You only need Publer." CTA: "Start Free Trial". The feature tabs:
    - "🗓️ Schedule & save time"
    - "📊 Maximize results with analytics"
    - "✍️ Create engaging content in minutes"
    - "🤝 Streamline collaboration & approvals"
    - "🔍 Explore the latest trends & industry news"
  - H3 "Grow big with a platform that just works!". The stat cards:
    - "14+ years of expertise in the industry"
    - "500K+ happy users worldwide trusting our platform"
    - "1.5M+ posts currently scheduled with Publer"
  - H3 "More features you will love": Link In Bio, Recycling, Browser Extension. CTA: "Explore Features".
  - H3 "Why choose Publer?":
    - "Customizable plans"
    - "24/5 expert support via live chat"
    - "Publer Mobile App"
    - "New features loading"
  - Footer band: "Maximize Your Social Media Impact with Publer". CTA: "Try for free".
- Proof on the home page:
  - Six named testimonial cards, each with a star image:
    - Ryan Cecli, "Founder and realtor at Homepage Realty"
    - Yago Taguchi Ruksenas, "Software Developer"
    - Gilbeli Girodier González, "Founder of Girodier Company"
    - Peter Gillan, "Director at Qualis"
    - Alvin Nurse, "Reboot Fitness Coaching"
    - Jonathan B., "Marketing Director"
  - No customer logo wall. The headline numbers are the ones above. There is a /customers page and "Case Studies" in the nav.
- The footer links to 9 comparison posts, all in /blog/: "Publer vs." Hootsuite, Sprout Social, Later, Buffer, Planable, SocialPilot, Metricool, ContentStudio and Agorapulse.
- **There is no API landing page.** https://publer.com/api redirects to the home page. The API appears only as "API Docs: Explore developer docs and tools" under Resources. (measured)

### 2b. Publer MCP and AI pages (measured)

**https://publer.com/integrations/mcp**

- `<title>`: "Manage Social Media with AI | Publer MCP"
- H2 eyebrow: "The complete Social Media MCP, built on Publer."
- H1: "Connect Publer to ChatGPT, Claude or any other AI tool and manage your social media with AI from the chat you already use. Simply give it a prompt."
- H3s:
  - "Connect once & start talking."
  - "Turn your AI into a social media agent that gets things done."
  - "What makes Publer the complete Social Media MCP?"
  - "AI social media management via chat"
  - "Use Publer with the AI you already use"
  - "Building something custom?"
  - "Your next social media task is a prompt away."
  - "Hear it straight from our users!"

The page has several `<h1>` elements.

**https://publer.com/integrations/claude**

- `<title>`: "Manage Social Media with Claude | Publer MCP"
- H2: "Manage your social media with Claude"
- Sister pages: /integrations/chatgpt, and help articles for Cursor and Grok.

### 2c. Publer plans page: https://publer.com/plans (measured)

https://publer.com/pricing redirects here.

- `<title>`: "Social Media Management Plans for All Needs | Publer Pricing"
- H1: **"Pick the Perfect Plan for Your Socials"**
- Subhead: "Or start scheduling your posts – for FREE!"
- Headings:
  - "All Major Platforms and Posts Supported"
  - "What They Say About Publer"
  - "Frequently Asked Questions"
  - "Maximize Your Social Media Impact with Publer"
- CTAs:
  - "Sign up for free"
  - "Start a free 7-day trial" (Professional)
  - "Start a free 14-day trial" (Business)
  - "Get a quote" (Enterprise)

### 2d. Metricool home: https://metricool.com/ (measured)

- `<title>`: **"METRICOOL ▷ Social Media Management Tool"**
- Meta description: "Save time scheduling, analyzing, and managing your social media and ad content. Create your FREE account and grow your business presence."
- Visual headline. It is a `<p>` styled as a heading, not the H1: **"Everything flows better when your content, data, and team are all in the same tab"**
- `<h1>`, set as the subhead: **"Plan, measure, and manage it all in one tool that saves time and gives you full control over your social media."**
- CTAs: "Create your free account" (twice), "Sign up here", "Login" and "Get started with your FREE account". Per-product CTAs: "Explore the Planner", "Explore Analytics", "Explore Reporting", "Explore the Inbox", "Explore Flows", "Explore Smartlinks" and "Explore Ads". App banner: "Download it now".
- Section headings, in order:
  - H2 "Every week, thousands of Social Media Managers get 12 hours of their life back"
  - H2 "By trading the chaos of endless tabs and windows for a clean, organized workspace"
  - H2 "Plan smarter"
  - H2 "Automate the boring stuff"
  - H2 "Analyze with clear data"
  - H2 "“ A social media manager's best friend for 3 years already” (Linda. L.)"
  - H2 "Recognized on G2 by the social media professionals that use Metricool every day"
  - H2 "A management tool as human as you are"
  - H3 "Planner, assistant, and calendar"
  - H3 "Analytics (without the headache)"
  - H3 "Reporting (for when the data doesn't speak for itself)"
  - H3 "Inbox (that lets you breathe)"
  - H2 "Flows turns interactions on your content into customers"
  - H3 "Smartlinks (to turn likes into customers)"
  - H3 "Unified Ads Campaigns"
  - "Backed by the big names"
  - H2 "Everything you need in one dashboard"
  - "Metricool's best-kept secret"
  - "FREQUENTLY ASKED QUESTIONS"
  - H2 "Your social media partner, always by your side"
- Proof on the home page:
  - "Join over 4 million professionals who use Metricool"
  - "thousands of Social Media Managers get 12 hours of their life back" every week
  - One testimonial: Linda L.
  - G2 badges
  - The partner line "Google, Pinterest, Meta, LinkedIn and X partner"
  - A logo wall under "Trusted by teams at". The logos are images with no readable text. The brand names come from their filenames, as read by a fetch tool: Adidas, Aldi, 7-Eleven, BMW, AliExpress, Burger King, Havas, Spotify, Costco, Forbes, McDonald's, Starbucks, UNICEF, Xiaomi and others. **Unverified**: these are filenames, not confirmed customers.
- The nav's "Social Media" menu has one page per network: Instagram, TikTok, YouTube, Threads, Twitter, Twitch, Google Business Profile, Bluesky, Facebook, Pinterest and LinkedIn. The Product menu includes "Metricool MCP".

### 2e. Metricool pricing: https://metricool.com/pricing/ (measured in a browser)

- `<title>`: "Metricool Pricing ▷ Find The Best Plan"
- H1: **"Plans designed to give you peace of mind"**
- Subhead (an H2): "Start for free, scale up as your networks grow, and never pay a penny more than you need to."
- H3 sections:
  - Social Media
  - Planner
  - Analytics
  - Reporting
  - Flows
  - Inbox
  - Smartlinks
  - Team and integrations
  - Add-ons
  - Hashtag Tracker
- CTAs: "Start now", "Sign up now", "Contact us", "Start for free", "Sign-up to Starter", "Sign-up to Advanced", "Sign-up to Custom".

### 2f. Metricool API, MCP, agency and white-label pages (measured)

| URL | `<title>` | H1 | Notes |
|---|---|---|---|
| /metricool-api/ | Metricool API Guide \| Metricool | "Metricool API Guide: Connect Your Tools and Automate Your Workflow" | H3s: "Conversational AI Models (Claude and ChatGPT via MCP)", "No-Code Automation Suites (Make and Zapier)", "Custom Reporting Dashboards (Looker Studio, Power BI, Google Sheets)", "Setting Up the Metricool API in 3 Steps" |
| /metricool-api-guide/ (modified 2026-10-09) | Metricool API: The Complete Guide [Free Download] | "Metricool API: Pull your data, schedule posts, and build your own integrations" | **Gated behind an email form**. CTA: "Get the guide and make your first call today." Bonus: "Includes a promo code to try all Metricool plans and add-ons free for 15 days." One bullet: "Build your own app on top of your Metricool data" |
| /metricool-mcp/ → /metricool-mcp-claude/ | Metricool's MCP for Claude Code and Claude Desktop \| Metricool | (H2) "Using Metricool within Claude Code" | Lines: "Metricool is available as an official Claude connector", "Ten networks, one conversation.", "Over 20 tools, each one explained." |
| /social-media-management-tool-for-agencies/ | Social Media Management Tools for Marketing Agencies | "The All-in-One Social Media Tool for Agencies" | H2 "One tool, hundreds of clients" |
| /white-label-metricool/ | White Label \| Metricool | "Put Your Brand in the Spotlight (ours stays behind the scenes)" | "White Label is available in our CUSTOM plan". No price shown |

Two SEO observations (inferred):

- Both brands put their real headline outside the `<h1>`: Publer uses an `<h2>`, Metricool a `<p>`.
- Both use `<h1>` for a long sentence.

Siar's pages should not copy either habit.

---

## 3. Pricing (vendor pages, checked 2026-11-12)

### 3a. Publer: https://publer.com/plans

**Billing unit: per social account, plus per extra team member.** In Publer's words: "2 Facebook pages and 2 Instagram accounts count as 4 social accounts. For every 9 social accounts, the 10th one is free." The plan owner is included, and "For every 9 additional members, the 10th one is free." (measured)

The prices are rendered by JavaScript. I read them in a browser by setting the accounts and members inputs (measured):

| Social accounts (0 extra members) | Professional, monthly | Professional, yearly (per month) | Business, monthly | Business, yearly (per month) |
|---|---|---|---|---|
| 1 | $5 | $4 | $10 | $8 |
| 2 | $9 | $7.20 | $17 | $13.60 |
| 3 | $12 | $9.60 | $21 | $16.80 |
| 10 (10th free) | $36 (list $40) | $28.80 | $63 (list $70) | $50.40 |
| 11 | $40 (list $44) | $32 | $70 (list $77) | $56 |
| 25 | — | $73.60 | — | $128.80 |
| 50 | — | $144 | — | $252 |
| 100 | — | $288 | — | $504 |

- Each extra member adds **$2/month on Professional** and **$3/month on Business**. Measured with 1 account: 1 member gives $7 and $13; 9 members give $23 and $37.
- The yearly toggle is labelled "2 months free". The yearly per-month price works out to 80% of the monthly price (measured arithmetic).

| Plan | What's included (quoted) |
|---|---|
| **Free** ("Free forever", $0) | "1 user", "1 workspace", "3 social accounts (except 𝕏)", "10 scheduled posts per account" (the slot frees up once a post publishes), "25 saved drafts", "24-hour post history", "Free trials on paid features", "Linkie integration". Pinterest on Free only for accounts with "at least 100 followers or a claimed website" |
| **Professional** ("Best for solopreneurs and creators") | "Unlimited scheduling & drafts", "Schedule 1st comments & threads", "Unlimited media storage", "Unlimited workspaces", "Unlimited RSS automations", "Eternal posts history", "Trending posts & news", "Twitter / X integration". 7-day trial |
| **Business** ("Best for SME and agencies") | "All in Professional", "Unlimited AI prompts", "Analytics insights & reports", "Best times to post", "Competitor analysis", "Hashtag suggestions & analytics", "Spintax-powered post recycling", **"Access to Publer API & MCP"**. 14-day trial |
| **Enterprise** ("Billed yearly", "Get a quote") | "Higher volume discounts", "1:1 onboarding", "Prioritized support", "Unlimited daily posting", "Early access to new features", "Expedited feature requests", "Bank/wire transfer payments" |

Other terms (measured):

- **X is paid-only**: "Due to the Twitter / X Enterprise API cost, we can only support Twitter / X accounts on a paid subscription basis."
- **Payments and refunds**: "Payments handled securely by PayPro Global and Paddle. VAT not included. 14 days money back guarantee!" The refund help article says you have 14 days for a full refund, then a pro-rated refund with the yearly discount waived. (https://publer.com/help/en/article/what-is-the-refund-policy-lflgew/)
- **Daily post caps**: "While we offer unlimited scheduling in the paid plans, we enforce daily posting limits to prevent spamming and abuse." This sentence is a tooltip on https://publer.com/plans, not in the rate-limits doc (corrected 2026-11-12). The caps are per profile on a rolling 24 hours, UTC. Enterprise is "Unlimited daily posting". (caps table: https://publer.com/docs/getting-started/rate-limits, and the same numbers on the plans page)

| Network | Free | Professional | Business |
|---|---|---|---|
| Facebook posts & reels | 12/day | 24 | 36 |
| Instagram posts & reels / stories | 15 | 20 | 25 |
| Threads | 150 | 200 | 250 |
| TikTok | 15 | 20 | 25 |
| X / Mastodon / Bluesky | 25 | 50 | 100 |
| LinkedIn profile / page | 10 / 12 | 12 / 18 | 14 / 24 |
| Pinterest | 12 | 24 | 36 |
| Google Business / YouTube / Telegram | 5 | 10 | 15 |
| WordPress | 12 | 18 | 24 |

- **Cheapest API access**: Business with 1 social account, at **$10/month** or $8/month billed yearly. Publer's own blog says "Get access to Publer API starting at $10/month" (measured).
- **No overage**: there is no per-post overage. Growth is paid per account and per member.

### 3b. Metricool: https://metricool.com/pricing/

**Billing unit: per brand.** A brand is "a business, brand, or customer. Under each brand, you can manage 1 profile for each social network or ad platform." Each Google Business Profile location needs its own brand. (measured, pricing FAQ)

The brand count is sold in fixed steps. The table below shows USD, measured; the EUR figures are in brackets.

| Plan | Brands | Annual (per month) | Monthly |
|---|---|---|---|
| **Free** | 1 | $0 | $0 |
| **Starter** | up to 5 | $20 (€16) | $25 (€20) |
| Starter | up to 10 | $36 (€29) | $45 (€37) |
| **Advanced** | up to 15 | $53 (€43) | $67 (€54) |
| Advanced | up to 25 | $85 (€69) | $107 (€87) |
| Advanced | up to 50 | $159 (€130) | $210 (€172) |
| **Custom** | custom ("starting at 50+", per the help center) | "Let's talk!" | — |

The annual toggle reads "Annual (save up to 24%)".

**Inclusions by plan (quoted):**

- **Free**:
  - "Manage all your brands' social networks (except LinkedIn and Twitter)"
  - "Schedule up to 20 posts per month"
  - "Analyze 5 competitor profiles"
  - "Access 30 days of analytics"
  - "AI social media assistant" (5 credits per brand per month)
  - "Metricool MCP"
- **Starter**:
  - "Unlimited content publishing*"
  - "Analyze up to 100 competitors"
  - "LinkedIn connection"
  - "PDF and PPT reports"
  - "Multiple link-in-bio"
  - "Analytics with unlimited history"
  - access to the X, Advanced Analytics and Flows add-ons
  - 20 AI credits per brand per month
- **Advanced**:
  - "Team and client management"
  - "Role management"
  - "Post approval system"
  - "Complete Twitter/X analytics"
  - "Customizable report templates"
  - "Data Studio connector"
  - **"Metricool API (Zapier, Make)"**
  - "Team Members: Unlimited"
  - 35 AI credits per brand per month
- **Custom**:
  - "Custom number of brands"
  - "Metricool integration in your business"
  - **"White Label"**
  - "Dedicated account manager"
  - "Custom AI assistant credits"

**Connections per network** (comparison table): 1, 10, 50 and "+50" across Free, Starter, Advanced and Custom. In other words, one profile per network per brand. (measured)

**Add-ons** (measured, pricing table):

| Add-on | Price |
|---|---|
| Twitter/X | **$10/month per connected account** |
| Advanced Analytics | "Starting at 10 €/12 $ per month" on Starter; "Starting at 30 €/36 $" on Advanced and Custom |
| Flows | "$12/€10 for 2,500 monthly executions", or "$0.01/€0.01 per additional execution" |
| Hashtag Tracker | "$25/day" |

**Other terms:**

- "The prices indicated do not include any applicable VAT." (measured)
- "Unlimited scheduling may be limited by our Fair Use Policy." The policy sets "a base activity threshold per Brand per month". Above it, Metricool checks manually, and "During the time of the manual check, the Administrator will not be able to make any postings." (measured: https://help.metricool.com/fair-use-policy-for-social-media-scheduling-e3tnm)
- **Per-network daily caps, rolling 24 hours**: Instagram 50 posts, Facebook 30 Reels, Threads 250 posts and 1,000 replies, YouTube 10 on Free and 20 on paid plans. "Automatic or manual retries might still count as posts". (measured: https://help.metricool.com/daily-posting-limits-on-social-media-sh58j)
- **Trial**: none on the pricing page. The gated API guide offers a promo code for a 15-day free try. (measured)
- **Billing**: it renews automatically. Downgrades take effect at the end of the period. Cancelling keeps access until the period ends. (measured: https://help.metricool.com/plans-add-ons-and-api-access-explained-xux1u)
- **Cheapest API access**: Advanced with 15 brands, at **$53/month billed yearly ($636/year) or $67 monthly**. (measured arithmetic)

### 3c. Siar against these numbers (Siar figures from `docs/pricing.md` and `siar-truth.md`; comparison is inferred arithmetic)

| Need | Publer (monthly) | Metricool (monthly) | Siar (USD monthly) |
|---|---|---|---|
| Try the API without paying | Not possible. The API is Business-only, with a 14-day trial | Not possible. The API is Advanced-only, with no trial on the pricing page | **20 free posts to try** (one-time, no card), API included; or the 14-day Pro trial |
| API, 1 business, 1 account | **$10** (Business) | $67 (Advanced, 15 brands) | $19 (Starter, 300 posts/mo) |
| API, 1 business, 6 accounts (FB, IG, Threads, X, LinkedIn, Bluesky) | **$42** (Business, 6 × $7; $33.60/mo billed yearly). Computed from Publer's own formula in `plans-*.js` and its pricing endpoint (corrected 2026-11-12; was "about $45") | $67 + **$10 for the X add-on** = $77 | $19 + X usage at X's own prices from a prepaid credit |
| 10 client brands × 5 accounts each (50 accounts), with API | $252/mo billed yearly (Business, 50 accounts) | $67 (Advanced, 15 brands) + X add-ons | $49 (Pro, 10 brands, 10k posts/mo) |
| 50 brands | $504/mo billed yearly (100 accounts) | $210 monthly / $159 yearly | $149 (Business, unlimited brands, 100k posts/mo) |

Honest caveats:

- **For one account at low volume, Publer's API is cheaper than Siar** ($10 against $19).
- Publer and Metricool both say "unlimited" posting on paid plans, within daily caps and fair use. Siar has monthly post quotas. Say so next to any comparison.
- Siar sells in ringgit to Malaysia: RM39, RM99 and RM399. Neither competitor does.

---

## 4. Networks and API features

### 4a. Networks (measured: Publer plans page and FAQ; Metricool pricing "Connect up to…" table)

| Network | Publer | Metricool | Siar today (from `siar-truth.md`) |
|---|---|---|---|
| Facebook | Pages, profiles, locations, groups. Groups and personal profiles go "via push notifications / reminders" | Yes | Live |
| Instagram | Business and creator | Yes | Live |
| Threads | Yes | Yes | Live |
| X | Paid plans only | Paid add-on, $10 per account | Live, X usage from a prepaid credit |
| LinkedIn | Profiles and pages | Starter and up | Profiles only (pages denied) |
| Bluesky | Yes | Yes | Live |
| Mastodon | Yes | **No** | Live |
| TikTok | Personal and business | Yes | Not open (audit rejected) |
| YouTube | Videos and Shorts | Yes | Uploads stay private until the audit passes |
| Pinterest | Yes (100-follower rule on Free) | Yes | Connect only; publishing needs Standard access |
| Google Business Profile | Yes | Yes (one location per brand) | Parked |
| Telegram | Groups and channels | **No** | **No** |
| WordPress | Hosted and self-hosted | Web/blog analytics plus a plugin | No |
| Twitch | No | Yes (analytics) | No |
| Discord | **No** | **No** | Live |
| Slack | **No** | Only as a notification destination (Slack connections in the spec), not a network to post to (inferred) | Live |
| Reddit, Snapchat | No | No | Built, parked |
| Ads (FB, Google, TikTok) | No | **Yes** | No |

### 4b. API features

| Feature | Publer | Metricool | Siar |
|---|---|---|---|
| Plan required | Business or Enterprise, "in good standing, with no failed or locked subscriptions". "Publer does not offer a public API that is available to everyone." (https://publer.com/help/en/article/does-publer-have-a-public-api-194nknf/) | Advanced or Custom. "Free and Starter plans do not include API access." (https://help.metricool.com/basic-guide-for-api-integration-r97af) | Every plan, Free included [code] |
| Base and auth | `https://app.publer.com/api/v1`, header `Authorization: Bearer-API <key>`, plus `Publer-Workspace-Id`. Keys are scoped (workspaces, accounts, posts, media, analytics) | `https://app.metricool.com/api`. Token in the `X-Mc-Auth` header, plus `userId` and `blogId` **as query parameters on every call** | `x-api-key` organization key, up to 50 keys |
| Size | **45 operations**, which I counted from the OpenAPI 3.1.1 fragments inside 59 GitBook doc pages (`/docs/llms.txt`) | **712 operations (713 counting one HEAD), 597 paths** in https://app.metricool.com/api/swagger.json (OpenAPI 3.0.1, "Metricool API 2.0.0"). The spec includes internal and billing routes (`/stripewebhook`, `/braintreewebhook`, "Coupons API", "Feature Toggle Service"). The help center tells users to "Use the browser inspector to view the calls Metricool makes". **Inferred**: this is the app's internal API, published as-is, not a designed public API | 270 operations at `/openapi.json` (OpenAPI 3.0) [live, per siar-truth] |
| Rate limits | **100 requests per 2-minute fixed window, per user across all keys**, with `X-RateLimit-*` headers and 429 on excess. Higher limits by email | **Not published.** Nothing in the spec or the help articles I read. Third-party figures exist but don't match Metricool's plan names (sourced, unverified: https://www.aidelly.ai/alternatives/metricool) | 100/s, 500 per 10 s and 2,000/min per key and endpoint [code] |
| Async jobs | `GET /job_status/{job_id}`. Scheduling returns a job to poll | — | — |
| Outbound webhooks | **None documented.** The settings tab is named "API & Webhooks", but no webhook events appear in the 59 doc pages (measured: grep found none) | **None for customers.** Every `/webhooks/*` path in the spec is inbound (Slack, X, provider catch-alls) | 16 HMAC-signed event types, retries over about 45 h, delivery log, resend [code] |
| SDKs and CLI | None official. Community: `alexkess/publer-mcp-server` (22 GitHub stars) and `n8n-nodes-publer` (3 stars) (measured, GitHub API) | None official. Swagger JSON/YAML and a PDF guide. Community CLIs on GitHub, 1 star each | TypeScript SDK, CLI and MCP, built from the contract; **not on npm yet** |
| MCP | **Hosted**: `https://mcp.publer.com`, OAuth or API key. "MCP is available on the Business and Enterprise plans." (https://publer.com/help/en/article/how-to-set-up-and-use-publers-mcp-server-14orlq0/) | **Hosted, on every plan including Free**: "MCP access does not require a paid Metricool plan." It is an official Claude connector with "Over 20 tools". The PyPI package `mcp-metricool` 1.1.9 had 1,621 downloads in the last month (measured, pypistats) | Local stdio server, 19 tools, not on npm. **Both competitors are ahead here** |
| Connecting end-customers' accounts | **No API for it.** The Accounts API is `GET /accounts` and `GET /accounts/{id}` only, so accounts are connected inside Publer's UI. Clients can be invited to a workspace by email, on Publer's own site | `POST /v2/settings/brands/connections/anonymous-link` "creates a shareable link that lets whoever holds it connect social accounts to a specific brand", "without that person ever needing a Metricool account" (quote corrected 2026-11-12; the earlier wording was a paraphrase). The article says both "This feature is available for Integrators only" (White Label for Integrators is Custom-only) and "This endpoint requires the Advanced plan or higher". **Inferred**: in practice the API route is for Custom-plan integrators. The link is on `mtr.cool` unless a white-label domain is set. "Only one link is active per brand at a time" (https://help.metricool.com/wli-brand-connections-panel-for-end-clients-through-api-4m5b3) | Hosted connect link with your name, logo and colour, on every plan. It shows "Powered by Siar" on app.siaran.my, so it is not white-label [code] |
| Embedding / white label | None | "White Label for Integrators": an iframe/API embed, "exclusively available for Custom plans". Live chat for White Label "from 12:00 to 20:00 - Madrid time zone" (https://help.metricool.com/metricool-white-label-for-integrators-u4jhq). The CNAME + SMTP requirement and "Zapier, Data Studio, n8n, and Make are not included" are in a different article: https://help.metricool.com/white-label-for-agencies-vs-white-label-for-integrators-learn-the-difference-xo5mv (attribution corrected 2026-11-12) | The API is the product |
| Analytics via API | Yes: charts, post insights, hashtag analysis, best times, members, competitor analysis, export | Yes, and broad: 79 "Stats Service" operations; also ads and Looker Studio connector routes | Account and post metrics, normalised, paid plans [code] |
| Comments and DMs via API | **No inbox API.** Comments only as scheduled "follow-up comments" (post callbacks). In the app, comments are read per post from the calendar; there is no DM inbox (measured, help) | Inbox routes exist: `/v2/inbox/conversations`, `/v2/inbox/post-comments`, reviews. Help: "you get the comments of the 50 most recent posts of each network" | Comments API live on 8 networks. FB/IG DMs are a per-organization beta [code] |
| Bulk | "Schedule up to 500 posts in a single request" (blog) | Bulk "send to review" | CSV bulk import |
| Machine-readable docs | `/docs/llms.txt`, a `.md` copy of every page, and a GitBook "ask" endpoint | Swagger JSON/YAML; help articles have a `.md` mirror | `/llms.txt`, `/openapi.json`, `/pricing.md` |

**Inconsistencies on their own pages (measured):**

- **Publer, where API keys live.** The docs say keys are under "Settings → Access & Login → API Keys". The help article says "Settings > API & Webhooks".
- **Metricool, whether MCP needs a paid plan.** Its current MCP pages say any plan, including Free. Third-party summaries cite an older help article saying Free and Starter lack MCP (sourced via search). I did not open that article.

---

## 5. SEO footprint

### 5a. Publer: sitemaps from https://publer.com/robots.txt (measured)

Total: **8,740 unique URLs**.

| Sitemap | URLs | Notes |
|---|---|---|
| Main site sitemap_{en,fr,de,it,es,sq,pt}.xml | 70 × 7 | Marketing pages per language |
| vercel.publer.com/sitemap.xml | 197 | Tools and integrations, served from publer.com |
| blog.publer.com sitemap index (served at publer.com/blog/) | 4,597 unique URLs in total | That total covers all three parts below, so the parts do not add to it again (corrected 2026-11-12) |
| Blog posts (post-sitemap 1–5) | **4,450 unique posts** (4,456 `<loc>` entries) | About 643 English; 633 to 635 in each of de, es, fr, it, pt and sq (corrected 2026-11-12; was "4,597 posts, 665 English, about 655 each") |
| Blog categories | 145 | |
| Blog misc | 2 | /blog/ and /blog/sitemap.html |
| Help center | 3,397 | 564 English articles × 6 languages |
| /docs (GitBook) | 59 | |

English marketing URLs by type (measured):

| Type | Count | Examples |
|---|---|---|
| **Free tools, programmatic** `/tools/…` | **201** | A network × tool-type grid. Tool types: bio generator, bold/italic, character counter, hashtag counter, hashtag generator, meta tags, photo/video downloader, photo/video editor, post generator, post preview, username generator. Plus 12 monthly holiday calendars, a feed planner and competitor analysis. Covers Facebook, Instagram, TikTok, X, LinkedIn, YouTube, Pinterest, Threads, Bluesky, Mastodon, Telegram, Google Business and Snapchat (downloaders only) |
| Feature pages `/features/…` | 14 | ai-assist, analytics, bulk-scheduling, calendar-view, link-in-bio, recycling, rss-feed, threads, workspaces… |
| Integration pages `/integrations/…` | 18 | One per network, plus chatgpt, claude, mcp, zapier, linkie |
| Comparison posts (blog) | 7 "X vs Publer" + 7 "alternatives" | vs: agorapulse, buffer, contentstudio, metricool, socialbee, socialpilot, later. Alternatives: hootsuite, later, planable, sprout-social, hypefury, tweetdeck, linktree. No comparison against an API-first product |
| API / MCP content | 3 | Blog: publer-api-for-marketers-and-developers, publer-mcp, publer-zapier-automation-guide. **No per-network API guides and no API landing page** |
| Topic blog | about 640 | 79 "how-to-…", 10 "best-time-to-post…", 13 hashtag posts, 12 monthly holiday-calendar posts |
| Glossary | 0 | |
| Plans | 3 | /plans, /plans/professional, /plans/business |

**Inferred keyword targets** (from titles, H1s and URL patterns):

- "social media management tools", "social media scheduling tools" (home title)
- "<network> video downloader", "<network> bio generator", "<network> character counter" and similar free-tool long tails
- "best time to post on <network>"
- "<competitor> alternatives", "<competitor> vs publer"
- "publer mcp", "manage social media with claude/chatgpt"

**Demand evidence (Google autocomplete, measured 2026-11-12, US English):**

- `publer` → "publer video downloader", "publer download", "publer login", "publer youtube", "publer download youtube", "publer youtube video download", "publer pricing", "publer app", "publer facebook story download".
  - **Inferred:** the free downloader tools drive a large share of branded searches.
- `publer api` → "publer api key", "publer api docs", "publer api pricing", "publer api documentation", "publer io api".
  - There is real but narrow API demand, and Publer has no landing page to catch "publer api pricing".
- `publer vs` → buffer, metricool, later, recurpost, hootsuite, "publer vs buffer reddit", socialbee, blotato.
- `publer alternative` → "publer alternative recurpost", "publer alternative free", "publer alternatives 2026".
- `publer mcp` → "publer mcp server".

### 5b. Metricool: sitemaps from https://metricool.com/sitemap_index.xml (measured)

Total: **6,013 `<loc>` entries** across 12 sitemaps. The table below sums to 6,009; a 4-URL `post_tag` sitemap was left out before (corrected 2026-11-12; the earlier total of 5,994 matched neither figure).

By language (from the earlier count; **unverified**, as it sums to 5,994 and was not redone):

| Language | URLs |
|---|---|
| en | 1,637 |
| es | 1,420 |
| fr | 1,313 |
| de | 714 |
| it | 440 |
| pt | 243 |
| nl | 227 |

| Sitemap | URLs |
|---|---|
| Posts (6 files) | 5,202 |
| Pages (2 files) | 599 |
| Categories | 144 |
| Authors | 45 |
| News | 19 |
| Tags | 4 |

The help center (help.metricool.com) has its own sitemap. I used it to find articles but did not count it.

English URLs by type (measured):

| Type | Count | Examples |
|---|---|---|
| "Metricool vs X" pages | 7 + hub + 2 affiliate comparisons | metricool-vs-{hootsuite, buffer, planoly, sproutsocial, agorapulse, later, loomly}, /metricool-vs/, /compare-metricool/, /compare-competitors-metricool/ |
| "X alternatives" (tools) | 17 | buffer, later, hootsuite, sprout-social, agorapulse, planoly, **publer**, vista-social, sendible, socialpilot, planable, loomly, recurpost, heyorca, dashthis, manychat, linktree |
| MCP content | 11 | what-is-mcp-for-social-media, metricool-claude-mcp-guide, metricool-chatgpt-mcp-guide, metricool-mcp-competitor-analysis-claude, weekly-social-media-routine-mcp, claude-ai-carousel-generator-metricool-mcp… |
| API content | 2 core + 3 related | /metricool-api/, /metricool-api-guide/ (gated), threads-api, twitter-new-api, zapier pages |
| Studies / research | 44 | instagram-research-study-2021…2024, facebook-ads-study, linkedin-trends-study-2024, 2025-us-podcast-study |
| Localized holiday calendars | 16 | social-media-calendar-{uk,au,can}-{2024,2025,2026} |
| "what-is-…" explainers | 48 | what-is-a-kpi, what-is-ctr, what-is-a-cms… |
| Network topic posts | 252 Instagram, 140 TikTok, 79 LinkedIn | |
| Report / template pages | 32 / 11 | per-network custom-report landers, social-media-reporting-template |
| Glossary | /social-media-dictionary | robots.txt **disallows** `/dictionary/` and `/es/diccionario/` |

robots.txt names and allows the AI crawlers explicitly, in one `User-agent` group with `Allow: /`: GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, Claude-SearchBot, Claude-User, PerplexityBot, Google-Extended, Gemini-Deep-Research, Applebot-Extended, Meta-ExternalAgent, Bytespider and others. A search result also surfaced https://metricool.com/llm-register-all-in-one/, a copy of the home page. Inferred: a landing page for AI-referred sign-ups.

**Inferred keyword targets:**

- "social media management tool" (home title)
- "<network> analytics/reports"
- "best time to post on <network>"
- "<competitor> alternatives", "metricool vs <competitor>"
- "social media calendar <country> <year>"
- "<network> research study <year>"
- "metricool mcp", "mcp for social media"

**Demand evidence (Google autocomplete, measured 2026-11-12):**

- `metricool api` → "metricool api key", "api documentation", "api pricing", "api docs", "api endpoints", "api n8n", "api claude", "api access", "api token". That is nine API long tails, more than Publer's five.
- `metricool mcp` → claude, link, server, connector, github, url, codex, "for claude code", chatgpt. **Strong MCP demand** (inferred from autocomplete depth).
- `metricool alternative` → "metricool alternatives", "alternative free", "alternative recurpost", "alternatives reddit", "alternativen", **"cheaper alternative to metricool"**, "metricool best alternative", **"metricool open source alternative"**.
- `metricool pricing` → "pricing uk", "pricing india", "pricing australia", "nonprofit pricing", **"metricool api pricing"**, "ai pricing", "monthly pricing".

### 5c. Who links to or talks about them (visible signals)

| Signal | Publer | Metricool |
|---|---|---|
| G2 (https://www.g2.com/compare/publer-vs-metricool, measured) | **4.7/5 (549)** in the header, 4.7/5 (547) in the table. Top cons tags: "High Pricing (16)", "Lack of Analytics (16)". G2 lists Publer from "$12.00 · Professional" and "$21.00 · Business", which does not match Publer's own $5 and $10 base prices | **4.4/5 (111)** in the header, 4.5/5 (108) in the table. Cons: "Expensive (4)", "Missing Features (4)" |
| Trustpilot (measured) | **4.9 (1,059 reviews)**, labelled "No recent history of asking for reviews"; "Replied to 100% of negative reviews" | **4.1 (694 reviews)** |
| Product Hunt | Several launches, per a third-party tracker: Publer AI 208 upvotes (#9), Workspaces 166, Publer for Mastodon 161, Personal Branding 166 (sourced: https://hunted.space/product/publer/launches/publer-ai) | None found |
| GitHub | No official repo. Community MCP server (22 stars) and n8n node (measured) | Org `metricool` exists (2 small repos). The MCP ships on PyPI (`mcp-metricool`) |
| AI-client listings | Publer's own Claude, ChatGPT, Cursor and Grok guides | "official Claude connector" (their claim, measured on /metricool-mcp-claude/) |
| API competitors targeting them | Alternatives pages at bundle.social, Postiz, Upload-Post and Late (see the teardowns in this folder; not re-checked here); a Zernio comparison (unverified); SocialClaw "Best Publer Alternatives in 2026 — AI Agents, API & Scheduling" (measured: page exists; the old `/blog/best-publer-alternatives-for-ai-agent-workflows` URL now redirects to https://getsocialclaw.com/publer-alternatives) | Ayrshare "Metricool API Alternative: Ayrshare vs. Metricool" (measured: https://www.ayrshare.com/compare/metricool-api-alternative/ exists); Zernio https://zernio.com/blog/metricool-alternative (measured: exists); Blotato "6 Best Metricool Alternatives With Cheaper API Access" (**unverified**: no URL recorded) |
| Head-to-head third-party pages | socialk.it, postplanify, postozo, heytasky and noobclaw were said to rank "metricool vs publer" pages. **Unverified**: the search was not re-run on 2026-11-12, and no URLs were recorded | same |

Ranking positions in this table are **unverified** (searches not re-run, see the note at the top). That a page exists does not mean it ranks.

**Inferred (unverified ranking):** "metricool api alternative" and "cheaper alternative to metricool api" look contested by Ayrshare and Blotato. "publer api alternative" seems to have fewer API-first pages aimed at it. Re-run these searches before relying on this.

---

## 6. Weaknesses and gaps

### 6a. Real complaints (with links)

**Publer**

- **Pricing climbs with every account.** G2: "the pricing model scales up quite quickly as you add more social acco[unts]" and "they raised their prices and lowered their free tier allowances funneling me into a purchase decision." G2 counts 16 "High Pricing" tags. (https://www.g2.com/products/publer/reviews?qs=pros-and-cons, measured)
- **Analytics only on Business.** G2: "I do wish the lower level of the program allowed analytics, even if it was limited analytics." 16 "Lack of Analytics" tags. (same page)
- **Cancellation and refunds.** Trustpilot, Geoffrey Moffett, 2025-10-15 (date corrected 2026-11-12): the cancel flow "requires you to click twice to confirm, which wasn't clear at all", and a refund of 4 months was refused. Publer replied: "I notice you contacted support 4 days before the next payment, and that feels very suspicious". (https://www.trustpilot.com/review/publer.com?stars=1&stars=2, measured)
- **Support.** Trustpilot, Carl Blevins, 2026-07-22: TikTok analytics not pulling; support "dismissed it on top of being rude." (same page)
- **Free plan media.** Trustpilot, Lucas, 2026-01-12, complained about media uploads on Free. Publer replied that media hosting is paid-only. (same page)
- **X paywall.** Trustpilot, 2023: "I paid a pile of money in advance… then they strip away access to Twitter unless I pay even more." Publer replied: "we're paying Twitter $42,000/month for API access." (same page)

**Metricool**

- **Auto-renewal and no refunds.**
  - G2, a review titled "Disappointing support experience and rigid billing policies": "blindsided by a $324 auto-renewal charge". The page does not show the reviewer's name. Keith A. wrote a different review: "Auto-renew charged my card on October 14, 2025 even though I was not actively using the product." (https://www.g2.com/products/metricool/reviews?qs=pros-and-cons, measured; attribution corrected 2026-11-12)
  - Trustpilot, Brandon, 2026-05-15: "renews without approval… they pointed me to their return policy where they do not provide refunds." (https://www.trustpilot.com/review/metricool.com?stars=1&stars=2, measured)
- **Posts marked published that never appeared, and a support bot loop.** Trustpilot, Stuart, 2026-10-11: "said published but never showed up on social media… got Bruno their AI support team, who kept going round in circles". (same page)
  - Metricool's help center has a whole article on "Why a post appears as published but is not visible on the social network". (https://help.metricool.com/why-a-post-appears-as-published-but-is-not-visible-on-the-social-network-cnxh3, measured: the old `/en/article/…-18zi7kq/` URL redirects here; URL corrected 2026-11-12)
- **Platform-flagged automation.** Trustpilot, Ulys, 2026-09-22: "FACEBOOK almost shut down my accounts with 15+ pages due to unauthorized automation." (same page)
- **X add-on surprise.** Trustpilot, Kaka koko, 2026-06-11 (date corrected 2026-11-12): "They ask for 54$ but you can't even add a twitter account". Metricool replied: "X (Twitter) isn't included by default in any plan — it's a paid add-on". (same page)
- **Disconnects and lost data.**
  - G2, Mark B.: "accounts… getting disconnected very frequently".
  - Trustpilot, Bright Sky Studios, 2026-06-09: "randomly disconnects your accounts after you have scheduled weeks in advance".
  - Trustpilot, Beata, 2026-08-14: "lost website analytics data, and ongoing publishing failures".
- **One profile per network per brand.** G2, Keith A.: "Cannot connect two Instagram accounts at the same [brand]". This matches the pricing FAQ (measured).

**Reddit**: I could not read Reddit directly. reddit.com returned 403 to curl, WebFetch refused it, and the browser pane blocks it. Web search returned no thread URLs for either brand. Autocomplete shows "publer vs buffer reddit" and "metricool alternatives reddit", so the threads exist (measured). **Their content is unverified**: a Reddit pass is still open.

### 6b. Gaps Siar can exploit honestly (inferred; each is backed by the named evidence)

1. **The API is the product, on every plan.** Publer gates its API to Business ("does not offer a public API that is available to everyone"). Metricool gates it to Advanced ($53/mo yearly or $67 monthly). Siar's API works on Free with **20 free posts to try** and on every paid plan. Target queries: "metricool api pricing", "publer api pricing", "metricool api access" (all in autocomplete).
2. **Your customers connect their own accounts.**
   - Publer has no API to connect accounts at all (Accounts API = list/get).
   - Metricool's connect-link API is documented under White Label for Integrators ("available for Integrators only", a Custom-plan product). The endpoint itself requires Advanced or higher. The link lives on `mtr.cool` unless you buy Custom white label.
   - Siar's hosted connect link (your name, logo, colour) is on every plan. It is **not white-label**: it says "Powered by Siar". Never call it white-label.
3. **Webhooks.** Neither competitor documents outbound webhooks. Siar sends 16 HMAC-signed events, with retries, a delivery log and resend. This is the cleanest technical gap for anyone building a product.
4. **Published, higher rate limits.** Publer allows 100 requests per 2 minutes per user. Metricool publishes none. Siar publishes 100/s, 500/10 s and 2,000/min per key and endpoint.
5. **A designed API, not an exposed app API.** Metricool authenticates with userId and blogId query parameters, its spec includes payment-processor webhooks, and it tells users to copy calls from the browser inspector. Siar has one contract, 270 operations at `/openapi.json`, validation with field-level `issues`, and verbatim network errors with per-network error pages.
6. **Billing unit.**
   - Publer bills per social account and per member: 50 accounts cost $252/mo on Business billed yearly.
   - Metricool bills per brand with one profile per network, so two Instagram accounts need two brands, and X is $10 per account.
   - Siar bills per organization with unlimited accounts, from $19 (RM39). State Siar's monthly post quotas in the same sentence.
7. **Comments by API.** Publer has no comments or inbox API. Metricool's API exports comments from only the 50 most recent posts per network. Siar has a comments API live on 8 networks. **Do not claim DMs**: they are a per-organization beta, off by default.
8. **Networks they lack.** Discord and Slack (both lack them). Mastodon (Metricool lacks it). Siar has all three live.
   - Siar lacks things too: Telegram and WordPress (Publer has both), Twitch analytics and ads (Metricool has both), and the networks Siar has not yet been approved on.
9. **Billing trust.**
   - Both draw auto-renewal and refund complaints (6a).
   - Publer users report price rises.
   - Siar's price lock: "Your price never goes up while you stay subscribed."
   - Malaysia gets ringgit, with yearly plans paid once by FPX or DuitNow; both competitors charge USD/EUR plus VAT.
   - Do not promise refunds Siar's terms don't state.
10. **Content gaps they leave open.**
    - Neither has per-network API guides ("how to post to Threads via API"), an API pricing explainer, or error-reference pages.
    - Publer has no API landing page, so "publer api" searches land on GitBook.
    - Metricool's best API guide is gated behind an email form.

### 6c. Where they are clearly stronger (don't contest)

- **Live network coverage.**
  - Publer publishes live to TikTok, YouTube (public), Pinterest, LinkedIn pages, Google Business Profile, Telegram and WordPress.
  - Metricool covers TikTok, YouTube, Pinterest, LinkedIn pages, Google Business Profile, Twitch and three ad platforms.
  - Siar is blocked or parked on most of these (`docs/approvals/README.md`).
- **Hosted MCP with OAuth.** Both have one; Metricool's is free on every plan and listed as an official Claude connector. Siar's MCP is local and not yet on npm.
- **Scale and proof.** Publer claims 500K+ users, Metricool 4M+ (their claims). G2: 549 and 111 reviews. Trustpilot: 1,059 and 694. Siar has none, and must not invent any.
- **Content volume and languages.** Publer has 8,740 sitemap URLs in 7 languages and 201 programmatic free tools. Metricool has about 6,000 URLs (6,013 sitemap entries) in 7 languages and 44 research studies.
- **Analytics depth.** Metricool's 79 stats operations, ads reporting, a Looker Studio connector and competitor tracking.
- **Low-end price.** Publer's API costs $10/month for one account, under Siar Starter's $19.

---

## 7. Recommended Siar pages from this teardown (inferred, for P3 in `docs/geo/plan.md`)

- `/compare/metricool-api`: aim at "metricool api pricing", "cheaper alternative to metricool" and "metricool api alternative". Lead with API-on-every-plan, webhooks, the connect link and per-org pricing. Concede analytics, ads and MCP.
- `/compare/publer-api`: aim at "publer api", "publer api pricing" and "publer alternative". Lead with the connect-your-customers gap, webhooks and rate limits. Concede that Publer is $10 for one account and has wider live network coverage.
- Every competitor figure on those pages links to the vendor URL in this file, with "checked 2026-11-12". No competitor names on /pricing (`siar-truth.md` 3b rule 12).

---

## 8. Positioning line

**Publer and Metricool are schedulers that unlock an API for your own accounts on their upper tiers. Siar is the API itself, on every plan from 20 free posts to try. It has signed webhooks, a branded connect link so your customers connect their own accounts, and one price per business with unlimited accounts, from $19 (RM39).**

Network claims must stay within what is approved live (see `docs/approvals/README.md` and `siar-truth.md` section 1a).

---

## Sources (all checked 2026-11-12)

Publer:

- https://publer.com/
- https://publer.com/plans (prices read in a browser)
- https://publer.com/integrations/mcp
- https://publer.com/integrations/claude
- https://publer.com/docs/llms.txt and its 59 linked `.md` pages, including /docs/getting-started/rate-limits.md, /docs/getting-started/authentication.md and /docs/api-reference/accounts.md
- https://publer.com/help/en/article/does-publer-have-a-public-api-194nknf/
- https://publer.com/help/en/article/how-to-access-the-publer-api-1w08edo/
- https://publer.com/help/en/article/how-to-set-up-and-use-publers-mcp-server-14orlq0/
- https://publer.com/help/en/article/how-to-add-a-client-to-my-publer-workspace-y76c4k/
- https://publer.com/help/en/article/what-is-the-refund-policy-lflgew/
- https://publer.com/help/en/article/how-to-respond-to-comments-with-ai-assist-auf23w/
- https://publer.com/blog/publer-api-for-marketers-and-developers/
- https://publer.com/blog/metricool-vs-publer/
- https://publer.com/robots.txt and the five sitemaps it lists

Metricool:

- https://metricool.com/
- https://metricool.com/pricing/ (read in a browser)
- https://metricool.com/metricool-api/
- https://metricool.com/metricool-api-guide/
- https://metricool.com/metricool-mcp-claude/
- https://metricool.com/white-label-metricool/
- https://metricool.com/social-media-management-tool-for-agencies/
- https://metricool.com/publer-alternatives/
- https://app.metricool.com/resources/apidocs/index.html
- https://app.metricool.com/api/swagger.json
- help.metricool.com articles:
  - mcp-limits-and-plan-requirements-h72jg
  - mcp-vs-api-access-what-is-the-difference-5y3ib
  - plans-add-ons-and-api-access-explained-xux1u
  - basic-guide-for-api-integration-r97af
  - api-access-export-your-metricool-data-to-other-tools-and-automate-tasks-x8ln5
  - fair-use-policy-for-social-media-scheduling-e3tnm
  - daily-posting-limits-on-social-media-sh58j
  - metricool-white-label-for-integrators-u4jhq
  - white-label-for-agencies-vs-white-label-for-integrators-learn-the-difference-xo5mv
  - wli-brand-connections-panel-for-end-clients-through-api-4m5b3
- https://metricool.com/robots.txt and https://metricool.com/sitemap_index.xml

Third party:

- https://www.g2.com/compare/publer-vs-metricool
- https://www.g2.com/products/publer/reviews?qs=pros-and-cons
- https://www.g2.com/products/metricool/reviews?qs=pros-and-cons
- https://www.trustpilot.com/review/publer.com
- https://www.trustpilot.com/review/metricool.com
- https://hunted.space/product/publer/launches/publer-ai
- https://pypistats.org/api/packages/mcp-metricool/recent
- GitHub search API
- Google autocomplete (suggestqueries.google.com, hl=en, gl=us)
