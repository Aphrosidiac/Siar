Verified 2026-11-12: 9 corrections

> Adversarial re-check, 2026-11-12. Re-fetched and confirmed against the vendors' own pages: every Hootsuite and Sprout price, limit, tier and trial in sections 3a and 4a (plans JSON-LD and comparison JSON, Sprout Contentful JSON and FAQ); the network lists; all developer-doc quotes (Hootsuite `.md` mirrors, Sprout API docs, Last-Modified 2026-11-09); both MCP pages (the Sprout article read in a browser); the home, enterprise, MCP and vs-page copy; the sitemap counts for www.hootsuite.com and blog.hootsuite.com; the Trustpilot scores and titles; the NapoleonCat and Outstand pages; the G-Cloud PDF (it also lists Employee Advocacy and Influencer Marketing at $3,000 per month); GitHub; and 13 autocomplete queries. Siar facts were checked against `apps/api/src/domain/plans.ts`, `platform/ratelimit.ts`, `platform/events.ts` (16 events) and `packages/contract/openapi.json` (3.0.2, 270 operations). **Not re-checked:** live SERP rankings. The shared web-search budget ran out before the 10-query SERP sample could run, so every "who ranks" statement below is marked unverified. Corrections are marked "(corrected 2026-11-12)".

# Competitor teardown: Hootsuite and Sprout Social

Checked 2026-11-12. Every claim is labelled:

- **measured**: I fetched the page, file, sitemap or API myself on 2026-11-12, either the raw HTML (including the JSON the page ships) or the vendor's `.md`/`llms.txt` mirror.
- **sourced**: from a third-party page, with its URL. Third-party claims are marked as such.
- **inferred**: my own reading or estimate. Not proven.

Hootsuite facts come only from hootsuite.com, blog.hootsuite.com, developer.hootsuite.com and help pages on those domains. Sprout facts come only from sproutsocial.com, api.sproutsocial.com and support.sproutsocial.com.

This builds on `docs/geo/plan.md` (P3: comparison pages; "Siar has none"), `docs/seo/research/siar-truth.md` (what Siar may claim) and the other teardowns in this folder. Siar facts below follow `siar-truth.md`. That means OpenAPI 3.0 with 270 operations, not "3.1 / 263" as the brief says.

---

## 0. The short version

- **Neither company sells a developer product.** Both are seat-priced dashboards for social media teams. Each has an API, but it sits behind their own login, plan and approval process, and it is built so a customer can automate *their own* Hootsuite or Sprout account. Neither offers a multi-tenant API that lets you embed social publishing in your own product. (measured, sections 3 and 4)
- **Sprout's API cannot publish.** It creates **drafts only**. It needs the Advanced plan ($399 per seat per month, billed annually), has about 20 operations, and documents no webhooks and no SDK. Its MCP connector is ChatGPT-only, TikTok data only, and read-only. (measured)
- **Hootsuite's API can schedule, but not to every network.** The Publishing API "currently" does not support TikTok, YouTube or Bluesky. Pinterest cannot be bundled with other profiles. The API is free, but you need a Hootsuite account plus approved developer access. Its MCP servers **cannot publish** (Perch saves drafts) and **cannot send replies** (Nest). The marketing page's sample prompt "Cross-post simultaneously" contradicts its own developer docs. (measured)
- **Price gap.** Sprout's cheapest plan that includes the API costs **$4,788 per seat per year**. Hootsuite's cheapest plan with unlimited accounts costs **$2,388 per seat per year**. Siar Pro is **$490 per year** for the whole organization, with unlimited accounts. (measured / Siar `plans.ts`)
- **SEO weight.** Hootsuite has about 4,000 URLs on www and about 1,950 blog posts. Sprout has about 1,340 blog posts. Both run "X alternatives" and "vs" pages, free tools and glossaries. **Neither targets developer queries.** Both have one blog post titled "social media API", and those posts are explainers, not product pages. (measured)
- **Weakness Siar can use honestly:** "you pay per seat for a dashboard, then find the API won't publish." Add billing and renewal complaints (Trustpilot: Hootsuite 1.3/5, Sprout 1.8/5; sourced). Siar answers with per-organization pricing, an API that publishes, and published prices. It cannot answer listening, ads, or enterprise proof.

---

## 1. Who they are and how they position

### Hootsuite

- Self-description: "Hootsuite is a social media management tool that brings scheduling, content creation, analytics, and social listening to one place." (measured, home `<meta description>`)
- They now brand the product **"Hootsuite Social OS"** (when the rebrand happened is **unverified**; corrected 2026-11-12, the earlier text said "in 2026" without a source), with bird-named modules: **Perch** (publishing), **Nest** (inbox), **Lumen** (listening, "powered by Talkwalker"), **Wisdom** (AI) and **Parliament** (employee advocacy). (measured: nav, plans JSON-LD)
- Proof they lead with: "18 years and 25 million users", "Hootsuite is G2's #1 best software product for 2026", "Connect over 100 integrations … more than any other social media management platform (by far)", and "600+ of the Fortune 1000 brands use Hootsuite" (on the enterprise page). The developer docs say "more than 100K Hootsuite customers worldwide (including 800+ of the Fortune 1000 companies)" (measured: https://developer.hootsuite.com/docs/app-submission-process). The two Fortune-1000 numbers on their own properties disagree (600+ vs 800+).
- **Going headless (May 2026).** Co-founder and returning CEO Ryan Holmes wrote that Hootsuite will expose "publishing, inbox, and analytics as composable primitives" through MCP. He also wrote, "The dashboard becomes one of many surfaces, not the only one." (measured: https://blog.hootsuite.com/social-media-management-api/, published 2026-05-15). This is the incumbent moving toward the "API for agents" ground, so watch it. As of 2026-11-12 the shipped MCP servers still cannot publish or reply (section 3).

### Sprout Social

- Self-description: "Maximize your social ROI with Sprout Social, trusted by 30k+ brands. Power everything from publishing and engagement to analytics and influencer marketing. Try 30 days free." (measured, home `<meta description>`)
- Public company. Since 2025 it pushes its AI agent **Trellis** (100 credits per seat per month on every plan; "Trellis Plus" is extra). It sells add-ons: **Influencer Marketing**, **NewsWhip** (media monitoring), Premium Analytics, Listening and Employee Advocacy. (measured, pricing page)
- Proof: "Trusted by 30,000+ world-class brands" (enterprise page); a "G2 Best Software 2026 Top 100" badge; one stat, "381% increase in action rate"; and a ScottsMiracle-Gro testimonial. (measured)
- Sprout's own comparison page casts Sprout as the leader in "ease of use", listening and support ("Sprout offers customer support 24/5 through in-app chat and email"). (measured: https://sproutsocial.com/insights/sprout-social-vs-hootsuite/, modified 2026-10-02)

### Who they sell to (inferred)

Both sell to marketing and customer-care **teams** at mid-market and enterprise brands and agencies. Each pricing ladder is fenced by seats and by collaboration and governance features (approvals, routing, SSO). Developers are a side audience: an app directory for Hootsuite and a reporting/BI API for Sprout.

---

## 2. Home page and main landing pages (exact copy)

### Hootsuite home: https://www.hootsuite.com/ (measured)

- `<title>`: **Social Media Marketing and Management Tool | Hootsuite**
- Eyebrow: **"Rated #1 in social media management"**
- H1 (animated word swap): **"Social can be chaotic. / complicated. / risky. / sloppy. / noisy. Hootsuite keeps you calm. / confident. / compliant. / human. / focused. Social moves fast. Hootsuite keeps you ahead."**
- Hero CTAs: **"Start your free trial"** and **"Request a demo"**. Header: "Pricing", "Enterprise", "Sign in", "Start your free trial".
- Logo strip: Adobe, Clorox, Adidas, Longchamp, McCormick, Nestlé.
- H2s in order:
  1. "Strategize, organize, and simplify social media marketing". Three points: "See what matters." / "Know what to do next." / "Take action faster."
  2. "Make better decisions, faster". Stats: "46%" (Barceló Hotel Group follower growth), "$1.5m" (DaVita, "equivalent of $1.5 million in ad value" via Parliament), "31%" (Mapfre interactions).
  3. "One suite. Every social workflow."
  4. "Plan, schedule, and publish — all in one place"
  5. "Boost engagement, reach, and follower count with less effort"
  6. "Respond to social media messages and comments from one inbox" (mentions "automated Instagram DMs")
  7. "Stay ahead of the latest trends and boost your chances of going viral"
  8. "Beat your competitors to the next big thing"
  9. "Automate the busywork and focus on what matters". Body: "use Hootsuite MCP connectors to manage your social media workflows right from your favorite AI tools, including ChatGPT, Claude, Copilot, and Gemini."
  10. "Hootsuite is G2's #1 best software product for 2026"
  11. "Why Hootsuite?". H3s: "18 years and 25 million users", "The ultimate AI for social media", "The largest library of integrations".
  12. G2 review carousel (Courtney W., Hannah S. / VAZZO Creative, Aurora N., Chantelle D., Jose V. / Chauvet Lighting), dated Nov 2024 to Apr 2025.
  13. "Stay ahead of what's next with Social OS". Subhead: "Get started in minutes with a risk-free trial or demo of Hootsuite. No commitment."
- The home page has **no mention of an API or developers.** "Docs" sits under Resources in the nav. (measured)

### Hootsuite plans: https://www.hootsuite.com/plans (measured)

- H1: **"Pick your plan and try it for free"**
- Plan taglines: Standard "Manage up to 10 social media accounts from one calendar." / Professional "Manage unlimited social accounts and automate repetitive work." / Advanced "Streamline approvals and co-work across teams." / Enterprise "Govern across your org and grow faster with advanced tools."
- Banner: "Every plan runs on Wisdom, your AI teammate"
- H2: "Compare Hootsuite Social OS features side-by-side", then FAQ.

### Hootsuite enterprise: https://www.hootsuite.com/enterprise (measured)

- H1: **"Get more engagement, leads, and sales with Hootsuite Enterprise"**. Subhead: "Save your team 3,000 hours this year with Hootsuite Enterprise — the no. 1 social media management tool." CTA: "Request a demo".
- H2: "600+ of the Fortune 1000 brands use Hootsuite". Case-study numbers on the page include "250+ accounts", "$42.7m" and "$24.8m".

### Hootsuite MCP page: https://www.hootsuite.com/integrations/mcp (measured)

- `<title>`: "Hootsuite MCP Servers for ChatGPT, Claude, Gemini & Copilot". H1: **"Use Hootsuite from your favorite AI tools"**. Subhead: "Save time and enhance your workflow by linking Perch, Nest, Parliament, and Lumen to ChatGPT, Claude, Copilot, and more."
- One H2 per server per client ("Perch MCP server in Claude", …), then "Try these sample prompts", including **"Cross-post simultaneously"** and "Schedule at best times". The developer docs say Perch "does not provide tools to publish or schedule posts directly" (section 3). Measured contradiction.

### Hootsuite vs Sprout: https://www.hootsuite.com/hootsuite-vs-sprout-social (measured)

- H1: "Hootsuite vs. Sprout Social: Get ahead with the best social media tool". Subhead: "Lower prices, better publishing tools, and smarter analytics…"
- H2: **"Spoiler alert: There is no Hootsuite alternative. Here's why."** Numbers: "nearly 4,000 five-star reviews on G2", "150,000,000" websites monitored, "100+" integrations ("three times as many integrations as Sprout").
- Table: "Price: Starts at $99 vs Starts at $199"; "Total customers 25 million vs 30,000"; "Integrations 100+ vs 33".

### Sprout home: https://sproutsocial.com/ (measured)

- `<title>`: **Sprout Social: Social Media Management Tool**
- H1: **"Powerful tools for social media management"**. No subhead. Hero is an email field plus **"Try free for 30 days"**.
- H2s in order:
  1. "Own every social media touchpoint". Tabs: "Plan & schedule content", "Engage with customers", "Analyze your performance", "Discover trends & insights". CTA "Tour the product".
  2. "Trusted partnerships and integrations across leading platforms". Logos: TikTok, Instagram, Zendesk, Slack, Threads, Salesforce, Optimizely, WhatsApp, Reddit, Yelp, LinkedIn, Adobe Express, Bluesky, Shopify.
  3. Inline price cards: "Try free for 30 days - no credit card required". Standard "$199 per seat/month", Professional "$299 per seat/month", Advanced "$399 per seat/month", and "Need a custom plan for your enterprise business? Book my demo".
  4. "Launch, run & scale creator campaigns" (influencer marketing)
  5. H3 "See why best-in-class brands scale their social media with Sprout". Stat "381% increase in action rate", quote from Sara Smith (ScottsMiracle-Gro), "G2 Best Software 2026 Top 100".
  6. Logos: Cadillac F1, Canva, Cintas, Atlassian, HP, Campbell's, Rackspace, Equifax, Trip.com, The Parkinson's Foundation.
  7. H2 "Drive more impact with your social media management tool, now." CTA "Try free for 30 days".
- **No API or developer link on the home page.** The footer has no "API" or "Developers" item. It does have "Sprout alternatives" and "Social media glossary". (measured)

### Sprout pricing: https://sproutsocial.com/pricing/ (measured)

- H1: **"Try Sprout free for 30 days"**. Subhead: "No credit card required. Annual billing."
- H2s: "Plans", "Compare plans", "Every plan comes with Trellis. Plus gives it room to run", "Unlock more possibilities on social media", "Reach beyond traditional marketing", "Questions regarding any of our plans?" (phone "1-866-878-3231").

### Sprout enterprise: https://sproutsocial.com/enterprise/ (measured)

- H1: **"Enterprise Social Media Management"**. H2: "Transform social insights into business intelligence". CTA: "Request a demo". Line: "Trusted by 30,000+ world-class brands and organizations of all sizes". Then "Capture real-time audience insights", "Demonstrate the impact and ROI of social" and "Get more support & more ROI with Premier Success".

---

## 3. Hootsuite: pricing, networks, API

### 3a. Pricing (measured: https://www.hootsuite.com/plans, JSON-LD + comparison-table JSON, checked 2026-11-12)

| | Standard | Professional | Advanced | Enterprise |
|---|---|---|---|---|
| Price (USD, per user per month, **billed annually**) | **$99** | **$199** | **$399** | Custom ("Request a demo") |
| Price billed monthly | Not in the served HTML (filled in by script). FAQ: "Annual billing provides a lower per-user monthly rate". **Unverified** | same | same | |
| Social accounts | **10** | Unlimited | Unlimited | Unlimited |
| User seats | "1+" (buy as many as needed) | 1+ | 1+ | Custom |
| Posts | "Unlimited" | Unlimited | Unlimited | Unlimited |
| AI credits | 100 / month | 100 / month | 100 / month | Custom |
| Free trial | 14 days | 14 days | 14 days | demo |
| Approvals, assignment, skill routing | no | no | yes | yes |
| DM automations, auto-replies | no | yes | yes | yes |
| SSO, compliance integrations, Salesforce, Lumen (Talkwalker), **Lumen MCP connector**, Parliament, advanced analytics | no | no | no | **Enterprise only** |

- Billing unit: **per user (seat)**, with social accounts capped on Standard. FAQ: "Hootsuite plans are sold per user (or 'seat')". (measured)
- **No free plan.** Trial limits: "Trial accounts have daily posting limits (10-20 posts per organization, depending on plan). Bulk scheduling is not available during trial." Billing starts automatically when the trial ends. (measured)
- Overage: none stated, since posts are "Unlimited". Growth costs come from seats and the Standard→Professional jump for more than 10 accounts. (measured / inferred)
- Taxes are extra ("do not include applicable taxes"). Payment by card (Visa, Mastercard, Discover, JCB) or PayPal; the annual Enterprise plan can be invoiced. (measured)
- Currency: the JSON-LD is USD. `/en-sg/plans` and `/en-hk/plans` redirect to the same page. `/en-my/plans` returns 404. **No ringgit pricing found.** (measured)
- Nonprofit discount "on some plans", by application. (measured)

### 3b. Networks (measured)

- Dashboard: "Facebook, TikTok, Instagram, X, LinkedIn, YouTube, Threads, Bluesky, and Pinterest" (https://www.hootsuite.com/plans/standard). The FAQ adds **WhatsApp** (inbox: "Receive and respond to WhatsApp messages in Hootsuite Inbox", /products/mobile-apps). Reddit is listening only, via an app ("install the Reddit app for Hootsuite", /faq). The help center has a "Connect a Google Business Profile account" article (sourced via search; details **unverified**).
- **Not listed:** Mastodon, Discord, Slack (as a destination), Snapchat publishing. (measured: absent from /faq and /plans/standard)

### 3c. API and developer offer (measured: https://developer.hootsuite.com, `llms.txt` and the `.md` mirrors; most pages updated 2026-06 to 2026-09)

- **What it is for.** "Our APIs enable **Hootsuite users to access their Hootsuite account**, publish posts, manage customer service DMs, and automate Hootsuite Amplify." Auth is OAuth 2.0 with custom grants `member_app` and `organization_app`. You build *on* Hootsuite: embedded iFrame apps in their dashboard, App Directory listings, or external apps acting for Hootsuite members. Every end user needs a Hootsuite account with the social profiles already connected inside Hootsuite. (measured: /docs/the-hootsuite-platform)
- **Access.** "Access to the Hootsuite REST APIs is free." You "request for Developer access" with "a detailed description of how you intend to use" it. App Directory review takes "2-4 weeks". Developers can now edit redirect URIs themselves in the developer portal, but "Apps that are In Review or Launched still need to contact Hootsuite Developer Support" to change them. Technical calls go only through an assigned Customer Success Manager: "We cannot set up technical calls through the support ticket channel". (measured: "free" and redirect URIs from /docs/faq; "request for Developer access", "detailed description" and "2-4 weeks" from /docs/app-submission-process; the technical-calls quote from /docs/the-hootsuite-platform. Corrected 2026-11-12: source pages fixed and the redirect-URI line made precise)
- **Surface.** About 77 reference endpoints across the REST API and Apps API: me, members, organizations, teams, SCIM 2.0, social profiles, messages (schedule, retrieve, delete, approve/reject), comments (approve/reject only), media upload, analytics (4), inbox metrics and proactive messaging, CRM. Separate APIs exist for Amplify, Sparkcentral (inbox/CRM) and Ow.ly ("Available to Enterprise Users *only*"). (measured: llms.txt)
- **Publishing gaps.** "The following networks are currently not supported by the publishing API: **Tiktok, Youtube, Bluesky**." Schedule message: "on one or more social profiles (**except Pinterest**) … Scheduling a message to Pinterest can not be bundled with any other social profiles." Two FAQ pages disagree on Instagram Business: one says "posting to Instagram Business profiles is not supported through the REST API's"; the other says "now supported as of 2024". (measured: /docs/api-overview, /reference/schedulemessage-1, /docs/faq, /docs/rest-api-faq)
- **Analytics API** ("New for April 2026"): the user "must have purchased the **Advanced Analytics** add-on" (an Enterprise item on the plans table). Organic data covers FACEBOOKPAGE, TWITTER, INSTAGRAMBUSINESS, TIKTOKBUSINESS, YOUTUBECHANNEL, PINTEREST and THREADS. Paid data covers Facebook and X. "**Linkedin** does not permit export of social media and Ad data." (measured: /docs/analytics-overview, /docs/networks-reference)
- **Webhooks.** Four event types: `ping`, `comments`, `messages`, `apps`. The page documents **no signature or HMAC** (0 matches for signature/HMAC/secret) and no retry schedule. The changelog's last webhook entry is dated 2019. (measured: /docs/webhooks, /changelog/webhooks)
- **Rate limits.** "20 requests / second to a maximum daily quota of 100,000 calls per day." (measured: /docs/api-rate-limits)
- **SDKs.** Only the iFrame SDK, which is for apps embedded in their dashboard. Hootsuite publishes no server SDK. On npm, the only package named as a plain REST client is a 2018 third-party package (`hootsuite-rest`). Third-party integration connectors that wrap the API do exist and are current: `@pipedream/hootsuite` (2026-09), `@activepieces/piece-hootsuite` (2026-11), `@slates-integrations/hootsuite` (2026-10) and others. (measured: docs; npm registry search 2026-11-12. Corrected 2026-11-12: the earlier text implied `hootsuite-rest` was the only npm option)
- **MCP** (endpoints `mcp.hootsuite.com/perch`, `/nest`, plus Parliament and Lumen):
  - Perch: 16 tools. "**Perch saves drafts but does not publish** … This server does not provide tools to publish or schedule posts directly."
  - Nest: 17 tools. "**Nest cannot send replies** … It cannot post an outbound message or comment to a contact."
  - The Lumen MCP connector is Enterprise-only on the plans table.
  - Sources: /docs/perch-mcp-server and /docs/nest-mcp-server (updated 2026-09-16); /plans.
- **White-label OAuth / hosted connect for your customers:** none. Social profiles are connected inside Hootsuite by Hootsuite members. (inferred from the auth model above; no such feature found in docs)
- **Comments/DMs via API:** comment *approval* endpoints, plus inbox APIs (Inbox 2.0 / Sparkcentral) for CRM, virtual agents and proactive messaging. These are care-desk integrations, not a general "reply to this comment" endpoint. (measured: llms.txt)

---

## 4. Sprout Social: pricing, networks, API

### 4a. Pricing (measured: https://sproutsocial.com/pricing/, page HTML + Contentful JSON, checked 2026-11-12)

| | Essentials | Standard | Professional | Advanced | Enterprise |
|---|---|---|---|---|---|
| Per seat / month, **billed annually** | **$79** | **$199** | **$299** | **$399** | Custom |
| Per seat / month, **billed monthly** | **$99** | **$249** | **$399** | **$499** | |
| Social profiles | 5 | 5 | Unlimited | Unlimited | Unlimited |
| "Sprout Queue (message per day)" | 10 | 10 | 20 | 30 | Custom |
| AI agent credits (Trellis) | 100 / seat / mo | 100 | 100 | 100 | Custom |
| **Sprout API** ("Automate workflows with integrations (Sprout API)") | no | no | no | **yes** | yes |
| Message approval workflow | no | no | yes | yes | yes |
| Chatbots, macros, spike alerts, BI integration, HubSpot | no | no | no | yes | yes |
| Free trial | 30 days, "No credit card required" | | | | demo |

- Billing unit: **per seat**, plus a social-profile cap on the two lowest tiers. **No free plan.** (measured)
- Monthly vs annual (FAQ): "Annual billing requires a one-time upfront payment for the entire subscription term". Monthly costs more but offers "flexibility with shorter commitments". (measured)
- Add-ons (no prices on the page): Premium Analytics, Listening, Employee Advocacy, Professional Services. Influencer Marketing and NewsWhip ("No Sprout plan required"). **Trellis Plus: $28 per seat per month annual / $35 monthly** for 1,000 credits, "no overage charges". (measured)
- A Nov 2025 Sprout pricing PDF on the UK G-Cloud marketplace listed the Premium Analytics and Listening add-ons at **$3,000 per month each**. "Harness our public API to extend publishing and analytics workflows beyond Sprout" appears in that add-on block. (sourced: https://assets.applytosupply.digitalmarketplace.service.gov.uk/g-cloud-14/documents/716058/814210267520570-pricing-document-2025-11-10-1618.pdf. One year old; the current page prints no add-on prices. Treat as historical.)
- Nonprofit pricing: "on our Professional and Advanced plans for nonprofit organizations **in the US**". (measured)
- Payment: "major credit cards and Paypal". Prepayment by arrangement through sales@. USD only on the page; **no ringgit**. (measured)

### 4b. Networks (measured: https://sproutsocial.com/integrations/)

- Publishing and engagement: **Bluesky, Facebook, Instagram, LinkedIn (Company Pages; the API docs also list Personal), Pinterest, Reddit ("your owned subreddit"), Snapchat, Threads, TikTok, X, YouTube**. Messaging: **Facebook Messenger, WhatsApp**. The API docs also list **Google My Business**. Review sites (Yelp, Trustpilot, TripAdvisor, Glassdoor) are in the app but "we cannot provide their data via our Public API".
- **Not listed:** Mastodon, Discord, Slack (as a destination). Slack is a workflow integration.

### 4c. API and developer offer (measured: https://api.sproutsocial.com/docs/, Last-Modified 2026-11-09)

- **Purpose**, in their words: "access your owned social profile data so you can use that data to power dashboards and automate your reporting."
- **Gate.** "Your account needs to be on the appropriate plan which enables API access." The pricing table gives that as **Advanced and Enterprise**. You must accept "Sprout's Analytics API Terms of Service" in-app. X data needs a separate EULA. (measured)
- **Auth.** OAuth 2.0 machine-to-machine (`client_credentials`) or user-based, or long-lived API tokens made in Settings. (measured)
- **Surface, about 20 operations** (counted from the endpoint overview): 8 metadata, 2 analytics, 2 listening, 1 messages (read), 2 publishing, 4 media upload, 1 cases. (measured)
- **Publishing is drafts only.** "Create a Publishing Post (**currently only supports posts in Draft status**)". "Currently all posts require `"is_draft": true`". A retrieved post "will always have a delivery_status: PENDING, even if it has already been published". Unsupported media on one profile means the profile is "dropped. **No error is returned**". (measured)
- **Messages are read-only.** The messages endpoint returns inbox messages and metadata, but there is no reply or send endpoint. DM media URLs "are nonfunctional". Google My Business data is limited "to the last 30 days". (measured)
- **Does not include:** "Paid (Ad Account) data", "Listening data from X", and "Listening message-level data from Reddit". (measured)
- **Rate limits:** "60 requests per minute" and "250,000 requests per month". (measured)
- **Webhooks, SDK, sandbox:** none documented (0 matches for webhook/sdk/sandbox in the full docs page). Sprout's npm packages (`@sproutsocial/racine`, `seeds-*`) are its design system, not an API client. (measured)
- **MCP:** `https://mcp.sproutsocial.com/mcp`, set up as a ChatGPT connector. "Due to social network data-sharing policies, this integration currently provides **TikTok data only** … **Write actions (e.g., creating posts from ChatGPT) are also not supported**." It requires ChatGPT Plus, Pro or Enterprise. (measured: https://support.sproutsocial.com/hc/en-us/articles/41236268336653, read in a browser; curl gets a 403 challenge)
- **Hosted connect or white-label OAuth for your customers:** none. (inferred: API scope is "your owned social profile data")
- Sprout's own blog sums up the API story: "How brands and partners use the Sprout Social API", with Tableau, Datorama and Chattermill for reporting and Slate, Opal and Optimizely for publishing. All are enterprise-tool partnerships. (measured: https://sproutsocial.com/insights/sprout-social-api/, 2025-07-28)

---

## 5. Side by side with Siar (for a future /compare page)

Competitor columns: vendor pages, checked 2026-11-12. Siar column: `siar-truth.md`.

| | Hootsuite | Sprout Social | Siar |
|---|---|---|---|
| Billing unit | Per user (seat); Standard capped at 10 accounts | Per seat; 5 profiles on Essentials/Standard | Per organization; unlimited social accounts on every plan |
| Free | 14-day trial; no free plan | 30-day trial, no card; no free plan | 20 free posts to try (one-time), no card |
| Entry price | $99 per user per month (annual) | $79 per seat per month (annual) / $99 (monthly) | RM39 / $19 per month (Starter) |
| Cheapest plan with API access | Any account + approved developer access (API free). Analytics API needs the Advanced Analytics add-on | **Advanced: $399 per seat per month annual / $499 monthly** | Every plan, Free included |
| API publishes posts? | Yes (scheduling), **except TikTok, YouTube, Bluesky**; Pinterest separately | **No: drafts only** | Yes, on the open networks (see `siar-truth.md` 1a) |
| API replies to comments/DMs? | Comment approvals; care-desk inbox APIs | **No** (read-only messages) | Comments yes; FB/IG DMs in beta |
| Webhooks | 4 event types, no documented signing | None documented | 16 HMAC-signed events, retries, delivery log, resend |
| SDK / CLI | iFrame SDK only | None | TypeScript SDK and CLI (built; **not on npm yet**, so no install commands) |
| MCP | Perch (drafts only), Nest (no replies), Lumen (Enterprise), Parliament | ChatGPT only, TikTok data only, read-only | 19-tool MCP server (built; **not on npm yet**) |
| Hosted/branded connect for your customers | No | No | Branded connect link (shows "Powered by Siar"; **not** white-label) |
| Rate limits | 20 rps, 100k calls/day | 60/min, 250k/month | 100/s, 500/10 s, 2,000/min per key and endpoint |
| Listening, ads, influencer, employee advocacy | Yes | Yes | **No** |
| Ringgit pricing / FPX / DuitNow | No | No | Yes |

Worked costs (inferred arithmetic from the prices above):

- Sprout, 1 seat on Advanced (the API tier), annual: 12 × $399 = **$4,788 per year**. Monthly billing: 12 × $499 = $5,988.
- Hootsuite, 1 seat on Professional (unlimited accounts), annual: 12 × $199 = **$2,388 per year**. Standard ($1,188 per year) caps you at 10 accounts.
- Siar Pro, yearly: **$490** (RM990), 10 brands and unlimited accounts. Siar Business yearly: $1,490.

Do not print "Siar is X% cheaper" without stating the comparison (seats, accounts, features). Hootsuite and Sprout include listening, ads and approvals that Siar does not have.

---

## 6. SEO footprint

### 6a. Hootsuite (measured: https://www.hootsuite.com/sitemap.xml and https://blog.hootsuite.com/sitemap_index.xml, both checked 2026-11-12)

**www.hootsuite.com sitemap: 4,048 URLs.**

| Group | Count | Notes |
|---|---|---|
| Localized pages (de, fr, es, it, pt) | 2,143 | |
| `/whats-new/*` product updates | 925 | |
| `/newsroom/*` | 295 | |
| `/resources/*` | 273 | |
| `/webinars/*` | 133 | |
| `/social-media-tools/*` free tools | 37 | Caption, hashtag, bio and username generators; engagement-rate, ROI and salary calculators; "tiktok-seo-tool", "instagram-seo-tool" |
| `/platform/*` feature pages | 33 | publishing, inbox, analytics, listening, link-in-bio, AI chatbot, … |
| `/industries/*` | 15 | |
| Network landing pages | 9 | /facebook /instagram /linkedin /threads /tiktok /twitter /youtube /pinterest /bluesky |
| Comparison pages `hootsuite-vs-*` | 8 (+1 `/lp/` variant) | brandwatch, buffer, hubspot, later, loomly, metricool, sprinklr, sprout-social |
| Developer-related on www | 2 | /docs ("Hootsuite Documentation, API & MCP Resources") and /integrations/mcp |

**blog.hootsuite.com:** 1,948 posts (987 + 961), **274 glossary terms**, 353 "social media update" posts and 55 network tag pages.

- Alternatives posts: 5 (later, brandwatch, meltwater, chatgpt, chatgpt-fr).
- API posts: "social-media-api" ("Social media APIs explained (in simple terms)", modified 2026-10-14), "social-media-management-api" (the headless post), "facebook-conversion-api", and the glossary entry "application-programming-interface-api".

**developer.hootsuite.com:** `llms.txt` lists 58 guide pages, 5 changelog entries, 1 support page and 77 reference endpoints (corrected 2026-11-12: "about 64 guide entries" counted the changelog and support links as guides). Every page has a `.md` mirror.

**GEO:** `llms.txt` on www (21 KB) and on the blog (47 KB). robots.txt explicitly allows GPTBot, ClaudeBot, Claude-User, PerplexityBot and Perplexity-User with `Content-Signal: search=yes, ai-input=yes, ai-train=yes`. The plans page has a FAQPage block with id `faqLLMData`. (measured)

**Inferred keyword targets** (from titles and H1s):
- "social media management tool"
- "social media scheduler / calendar"
- "[network] scheduler" ("Automate and Schedule Instagram Posts", "TikTok Scheduler and Analytics", "Schedule Bluesky Posts")
- "social media analytics tools"
- "social media inbox"
- "hootsuite vs [x]"
- "free [AI generator]" tools
- "hootsuite mcp" (autocomplete shows "hootsuite mcp server", "hootsuite mcp connectors", "hootsuite mcp claude")
- Developer intent: only "hootsuite api *" brand queries (below).

### 6b. Sprout Social (measured: https://sproutsocial.com/nextsitemap.xml → nextsitemap-0.xml and https://sproutsocial.com/insights/sitemap_index.xml, checked 2026-11-12)

**Main-site sitemap: only 113 URLs, and it is incomplete.** /integrations/tiktok/ returns 200 but is not listed. 53 of the 113 are programmatic "find influencers" pages (`/influencer-marketing/find-influencers/{niche}-influencers/`).

**/insights/ (WordPress) sitemaps:**

| Group | Count |
|---|---|
| Posts | 1,339 (re-counted 2026-11-12 across post-sitemap.xml and post-sitemap2.xml; the first pass said 1,343) |
| Glossary terms | 129 |
| Press | 96 |
| Webinars | 95 |
| Videos | 77 |
| Case studies | 67 |
| Templates | 65 |
| Hubs | 42 |
| Data reports | 34 |
| Guides | 29 |
| Holiday pages | 25 |
| Podcasts | 24 |

- **"Alternatives" posts: 26.** Hootsuite, Buffer, Later, Agorapulse, Sprinklr, Khoros, SocialPilot, Loomly, Emplifi, Meltwater, Brandwatch, CrowdTangle, Zoho Social, Planable, Dash Social, and influencer tools (GRIN, CreatorIQ, Upfluence, Modash, …), plus "sprout-social-alternatives" (defensive).
- **"vs" posts: 19.** Brand head-to-heads: sprout-social-vs-hootsuite, -buffer, -sprinklr, -khoros, -meltwater, plus "native-posting-vs-sprout-social-essentials".
- API posts: "sprout-social-api" ("How brands and partners use the Sprout Social API") and "what-is-an-api" ("What is an API & why does it matter for social media?").
- Scheduling how-tos per network: schedule-linkedin-posts, schedule-bluesky-posts, how-to-schedule-instagram-posts, tiktok-schedule, how-to-schedule-tweets, …

**GEO:** `llms.txt` (15 KB) introducing Sprout as "Global leader in social media management and analytics". (measured)

**Inferred keyword targets:**
- "[competitor] alternatives" at scale
- "social media management/scheduling/analytics/listening tools"
- "[network] marketing / analytics"
- "find [niche] influencers" (programmatic)
- Research and statistics content (Sprout Social Index)
- Developer intent: brand-only ("sprout social api *").

### 6c. Demand signals (measured: Google autocomplete, `gl=us` unless noted, 2026-11-12; volumes not available, so ranking is **inferred**)

| Query | Suggestions |
|---|---|
| "hootsuite api" | api pricing, api documentation, api key, api access, api docs, api integrations, analytics api, rest api, developer api |
| "sprout social api" | api documentation, api key, api pricing, api integration, api access, api token, public api, analytics api |
| "hootsuite alternative" | alternatives free, alternatives reddit, for small business, open source, for nonprofits, 2026 (several are "… recurpost", a competitor buying presence) |
| "sprout social alternative" | free, reddit, best, **cheaper alternative**, open source |
| "hootsuite vs" | sprout social, buffer, hubspot, metricool, later, meta business suite, sprinklr, emplifi, vista social |
| "hootsuite pricing" | per month, reddit, free, tiers, uk, india, australia |
| "sprout social pricing" | for nonprofits, reddit, per month, tiers, uk, india |
| "hootsuite mcp" | server, connectors, claude |
| "sprout social mcp" | server, claude (no "connectors"; corrected 2026-11-12) |
| "hootsuite for developers", "hootsuite api alternative" | **no suggestions** |
| `gl=my`: "hootsuite malaysia" | itself only |
| `gl=my`: "social media management malaysia" | agency, price malaysia, package malaysia |

What this suggests (inferred):

1. **"[brand] api pricing / access / key"** is real intent from people who expect a self-serve API and find a seat plan. This is the cleanest wedge for Siar.
2. "Alternatives" demand is large, but heavily contested by SMB schedulers (the SERP make-up is **unverified**: not re-run on 2026-11-12 because the search budget ran out; the "recurpost" autocomplete suggestions are the only measured sign). API vendors also contest it, and they already own pages for exactly these terms: Outstand `/hootsuite-api` and `/sprout-social-alternative`; Zernio/Late, bundle.social, Ayrshare, Upload-Post and Postiz all run hootsuite and sproutsocial alternative or compare pages (see the sibling teardowns in this folder).
3. Malaysian demand for these brands by name is thin. The Malaysian angle is "social media management price/package Malaysia", which favours Starter-tier copy.

### 6d. Backlink and authority signals

- **G2:** both use G2 as primary proof. Hootsuite: "G2's #1 best software product for 2026" and "nearly 4,000 five-star reviews". Sprout: "G2 Best Software 2026 Top 100". These are vendor claims (measured on their pages). G2 itself blocked fetching (403), so counts are **unverified**. G2 has a Hootsuite-vs-Sprout compare page at https://www.g2.com/compare/hootsuite-vs-sprout-social (seen in search results on the first pass, not fetched; **unverified**, and "many" pages is not supported).
- **GitHub:**
  - `hootsuite` org: 42 public repos. Top repos are infrastructure tools (atlantis 607★, nachos 448★). None is an API SDK.
  - `sproutsocial` org: 68 repos. Top is walltime-js 120★. None is an API SDK.
  - Measured via the GitHub API.
- **Roundups:** every unified-API vendor teardown in this folder (Ayrshare, bundle.social, Late/Zernio, Outstand, Upload-Post, Postiz) links to or names Hootsuite and Sprout on comparison pages. Sprout links to Hootsuite in its own "Top 15 Hootsuite alternatives". Both are the default reference point. (measured in sibling files)
- **Product Hunt:** a Sprout listing exists (sourced: https://www.producthunt.com/products/sproutsocial). No Hootsuite listing found. Low signal for both.
- **App ecosystem:** Hootsuite's App Directory ("100+ integrations") produces partner backlinks. (inferred)

---

## 7. Weaknesses: real complaints and honest gaps

### 7a. User complaints (sourced; third-party, labelled)

- **Trustpilot, Hootsuite:** TrustScore **1.3/5 from 556 reviews**, 69% one-star (sourced: https://www.trustpilot.com/review/hootsuite.com, read via WebFetch 2026-11-12). Recent titles include:
  - "The company fraudulently billed my…" (2026-09-29)
  - "Extremely Disappointing Customer…" (2026-08-31; all connected accounts lost overnight)
  - "Scammers" (2026-03-31; charged yearly after closing the account)
  - "Absolutely the worst software service I…" (2026-03-14; charged after cancelling the trial)
  - Dominant themes: billing after cancellation, auto-renewal, support.
- **Trustpilot, Sprout:** TrustScore **1.8/5 from 89 reviews**, 70% one-star (sourced: https://www.trustpilot.com/review/sproutsocial.com, 2026-11-12). Recent titles include:
  - "Test out their customer service before signing a yearly contract" (2026-10-28; two weeks to get a price for extra social accounts)
  - "THE WORST" (2026-09-30; monthly plan said to be locked into an annual contract)
  - "Horrible customer service" (2026-08-05; auto-renewed despite cancellation emails)
  - "Predatory Contract Renewal Practices" (2026-04-21)
  - "Sprout Social sells out to AI chat bots for Support…" (2026-04-14)
- **Reddit (secondhand):** reddit.com blocked direct fetching (403 to the JSON API; the browser pane refuses reddit.com). NapoleonCat, a competitor, analysed 148 Reddit opinions on Hootsuite. Its counts: price, per-seat cost and renewal quotes were the largest theme (37 of 148, 25%). It cites r/HootSuite threads "They charged me a full year with out authorization" (Aug 2024) and "Hootsuite charged me after confirmed cancellation, looking for advice" (Apr 2026), plus an r/SocialMediaManagers comment that pricing has "gone bananas" (Feb 2026). (sourced, competitor-authored, threads not linked: https://napoleoncat.com/blog/hootsuite-reviews-reddit/). NapoleonCat's Sprout analysis gives per-seat cost as the main complaint (sourced: https://napoleoncat.com/blog/sprout-social-reviews-reddit/). **I could not verify the threads directly.** Before quoting any on a public page, open each thread by hand.
- **Developer-specific complaints:** no Reddit or forum threads found about either API (several query variants). Developers do not seem to evaluate these as APIs at all. Third-party API vendors write that content instead, e.g. Outstand's "The Hootsuite API: access, pricing and where it stops" (sourced: https://www.outstand.so/hootsuite-api). (inferred: low developer mindshare)

### 7b. Why developers do not use them (measured facts → inferred conclusion)

1. **The API is an add-on to a seat licence.** Sprout's API starts at Advanced, $399 per seat per month annual. Hootsuite needs a Hootsuite account, developer approval and, for analytics, an Enterprise add-on. There is no usage-based or per-organization developer tier.
2. **They are not multi-tenant.** Both APIs act on the customer's *own* Hootsuite or Sprout account (member/org grants, "owned social profile data"). There is no hosted connect flow for *your* users' social accounts. A SaaS cannot embed posting for its own customers without making each one a Hootsuite or Sprout customer.
3. **Write paths are missing or partial.**
   - Sprout: drafts only, and no reply endpoint.
   - Hootsuite: no TikTok, YouTube or Bluesky publishing via API, and Pinterest separately.
   - Both MCP offerings are read-only or draft-only for publishing and replies.
4. **Thin developer tooling.**
   - No server SDKs.
   - Hootsuite webhooks: 4 events, no documented signing.
   - Sprout: no webhooks at all.
   - Contradictory Instagram FAQs at Hootsuite.
   - Sprout silently drops profiles when media is unsupported ("No error is returned").
5. **Support is gated behind account managers.** Hootsuite: "If you need to schedule a technical meeting, please contact your assigned Customer Success Manager". Sprout: "contact your sales representative" for API plan access.
6. **Annual-contract friction.** The Trustpilot themes above (renewals, cancellation, contract lock-in) are the opposite of what a developer trying an API wants.

### 7c. Gaps Siar can exploit honestly

| Gap | Siar's true counter (from `siar-truth.md`) |
|---|---|
| API behind a $399-per-seat plan | API on every plan, Free included (20 free posts to try); from $19 / RM39 per month per organization |
| Per-seat and per-profile pricing | Unlimited social accounts on every plan; billed per organization |
| Draft-only publishing (Sprout, both MCPs) | The API publishes and schedules on the open networks; each network target is claimed once |
| No webhooks / unsigned webhooks | 16 HMAC-signed events, retries for about 45 hours, delivery log, manual resend |
| No hosted connect | Branded connect link (your name, logo, colour). Say "branded", never "white-label" |
| Silent failures (Sprout drops profiles) | Validation at create time with a 400 and an `issues` array; verbatim network errors plus a plain-English fix |
| USD-only, annual contracts | Ringgit prices, yearly paid once by FPX/DuitNow, "Your price never goes up while you stay subscribed." |
| Mastodon, Discord, Slack absent from both | Siar publishes to Mastodon, Discord and Slack today |

**Do not claim** (Siar cannot match these, and saying otherwise breaks `siar-truth.md`):
- Social listening, ads management, influencer tools, employee advocacy, approvals and governance, SSO.
- Customer counts, G2 badges, uptime.
- TikTok, Pinterest publishing, LinkedIn company pages, Reddit, Snapchat, Google Business (Siar does not have these yet). Sprout lists all six (Google My Business via its API docs). Hootsuite's dashboard lists TikTok, Pinterest and LinkedIn; Reddit is listening only, Snapchat is not listed, and Google Business is unverified (section 3b). (Corrected 2026-11-12: the earlier text said both vendors have all six live.)
- SDK/CLI/MCP install commands until they are on npm.

---

## 8. Recommendations for Siar's SEO (inferred, for P3 in `docs/geo/plan.md`)

1. **One page per incumbent API, aimed at the "[brand] api pricing/access" intent:** `/compare/hootsuite-api` and `/compare/sprout-social-api`. Lead with the measured facts: "Sprout's API creates drafts only and starts on the $399 per seat Advanced plan (sproutsocial.com/pricing, checked 2026-11-12)". Then show the Siar equivalent request and the per-organization price. Outstand already holds `/hootsuite-api`, so Siar's version must be more specific: exact doc quotes, the network gaps table, the worked costs.
2. **Not a generic "Hootsuite alternatives" listicle.** That SERP appears to belong to SMB schedulers and to Sprout itself (inferred; SERP **unverified** on 2026-11-12, re-run before acting). Frame it for builders instead: "Hootsuite alternative for developers / for SaaS" plus the Malaysian angle ("social media management price Malaysia" → ringgit, FPX, Starter at RM39).
3. **Methodology box on each page:** the URL and "checked <date>" for every competitor fact, and the "Do not claim" list above enforced in review. Re-check prices before each publish. Hootsuite's monthly-billing price is script-rendered and still unverified.
4. **Watch Hootsuite's headless push.** If the Perch MCP gains publishing, the "draft-only" line must be updated the same week.

---

## 9. One line: how Siar should position against them

**"Hootsuite and Sprout sell seats for a dashboard and give you an API that drafts. Siar is the API: it publishes, it signs its webhooks, it connects unlimited accounts, and it is priced per organization from RM39 / $19."** (Every clause maps to a measured fact above. Keep "drafts" tied to Sprout's API and both MCPs, not Hootsuite's REST scheduling.)

---

## Sources (all checked 2026-11-12)

Hootsuite (measured):
- https://www.hootsuite.com/
- https://www.hootsuite.com/plans and /plans/standard, /plans/professional, /plans/advanced, /plans/enterprise
- https://www.hootsuite.com/enterprise
- https://www.hootsuite.com/faq
- https://www.hootsuite.com/products/mobile-apps
- https://www.hootsuite.com/integrations/mcp
- https://www.hootsuite.com/hootsuite-vs-sprout-social
- https://www.hootsuite.com/sitemap.xml
- https://www.hootsuite.com/robots.txt
- https://www.hootsuite.com/llms.txt
- https://blog.hootsuite.com/sitemap_index.xml
- https://blog.hootsuite.com/social-media-management-api/
- https://blog.hootsuite.com/social-media-api/
- https://developer.hootsuite.com/llms.txt
- developer docs `.md` pages: the-hootsuite-platform, api-overview, faq, rest-api-faq, api-rate-limits, webhooks, app-submission-process, analytics-overview, networks-reference, perch-mcp-server, nest-mcp-server, reference/schedulemessage-1, changelog/webhooks

Sprout Social (measured):
- https://sproutsocial.com/
- https://sproutsocial.com/pricing/
- https://sproutsocial.com/enterprise/
- https://sproutsocial.com/integrations/
- https://sproutsocial.com/insights/sprout-social-vs-hootsuite/
- https://sproutsocial.com/insights/sprout-social-api/
- https://sproutsocial.com/insights/hootsuite-alternatives/
- https://sproutsocial.com/nextsitemap.xml
- https://sproutsocial.com/insights/sitemap_index.xml and child sitemaps
- https://sproutsocial.com/llms.txt
- https://api.sproutsocial.com/docs/
- https://support.sproutsocial.com/hc/en-us/articles/41236268336653

Other:
- Google autocomplete (suggestqueries.google.com)
- GitHub API (orgs hootsuite, sproutsocial)
- npm registry search

Third-party (sourced):
- https://www.trustpilot.com/review/hootsuite.com
- https://www.trustpilot.com/review/sproutsocial.com
- https://napoleoncat.com/blog/hootsuite-reviews-reddit/ (competitor-authored)
- https://napoleoncat.com/blog/sprout-social-reviews-reddit/ (competitor-authored)
- https://www.outstand.so/hootsuite-api (competitor)
- https://www.g2.com/compare/hootsuite-vs-sprout-social (not fetched; 403)
- https://www.producthunt.com/products/sproutsocial
- UK G-Cloud pricing PDF (Nov 2025, historical)
