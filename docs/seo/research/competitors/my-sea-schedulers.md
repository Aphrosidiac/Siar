Verified 2026-11-12: 18 corrections

# Competitor teardown: Malaysia and Southeast Asia schedulers and social tools

Checked 2026-11-12. Every claim is labelled:

- **measured**: I fetched the page, its raw HTML, robots.txt or sitemap myself on 2026-11-12. Prices shown "from Malaysia" were read in a real browser on a Malaysian IP (TM, Petaling Jaya) so the geo-priced page rendered as a Malaysian buyer sees it.
- **sourced**: a third-party page, with its URL. Treated as a claim, not a fact.
- **inferred**: my own reading, arithmetic or estimate.

Vendor facts come only from the vendor's own pages. Siar wording follows `docs/seo/research/siar-truth.md` (the only allowed source for Siar claims) and `docs/pricing.md`. Builds on `docs/geo/plan.md`, `docs/geo/offsite-plan.md`, `docs/seo/research/current-site.md` (its section on Malaysia demand) and the sibling teardowns in this folder (`buffer.md` covers Buffer in depth, so Buffer is only touched here for its Malaysian price).

---

## 0. The short version

1. **There is now a Malaysian-built scheduler that got there first: Duta (getduta.com).** It was public by August 2026, about two months before Siar (live 2026-10-12): its earliest blog posts are dated 5 August 2026 and llms.txt says "Last verified: 2026-08-11" (inferred; the site states no launch date). It claims to be "the first social media scheduling tool built in Malaysia". It costs RM99 a month for every channel, with a 7-day trial, card required. It already answers the exact AI-search questions Siar would want ("Is there a Malaysian social media scheduling tool?", "Which social media scheduler is priced in Malaysian Ringgit?"). And it has a hosted MCP connector at `mcp.getduta.com` that works with Claude and ChatGPT. (measured: https://getduta.com/, /pricing, /llms.txt, /how-to-use) `current-site.md` says the Malaysian SERP has "no real competitor". That is no longer true. **Siar must never claim "first" or "only" Malaysian scheduler.**
2. **The other local schedulers are small and new:**
   - **PostLa**: RM97 / RM197, capped by number of social accounts, support on WhatsApp in BM.
   - **Synova by Zynex AI** (Johor Bahru): RM99 / RM299 / RM799, priced per account per platform, includes Xiaohongshu.
   - **MarketOS**: an AI "marketing OS" at RM199 / RM599 / RM1,499. Scheduling is only one part of it.
   - **Prism Reach**: a desktop auto-poster for Facebook groups, RM159 a month.

   All four price in ringgit. All four cap accounts or channels. None of them publishes API docs without a login. (measured, sections 2–5)
3. **What Malaysian SMEs actually pay for falls into four buckets (inferred from the evidence in section 1):**
   - Free native tools: Meta Business Suite and TikTok Studio.
   - Canva Pro, which they already own: RM250 a year, and it includes a Social Content Planner.
   - Messaging/CRM platforms: SleekFlow from RM399 a month; respond.io from US$79 a month.
   - Agencies: RM800–15,000 a month (the range on the sites below).

   Global schedulers are bought less often. Of those checked from a Malaysian IP, **only Zoho Social and Canva show ringgit**. Buffer, Hootsuite and ManyChat show USD. (measured)
4. **Zoho Social is the real ringgit price peer, not the local start-ups.** Standard is RM40 a month billed yearly (RM60 billed monthly), for 1 brand and 14 channels. Its Agency plan is RM1,280 a month for 10 clients. (measured from MY) Siar Starter costs RM39 a month (RM390 a year), with unlimited accounts. Siar Pro covers 10 brands for RM99. The honest edge is per organization against Zoho's per brand and per seat. It is not "cheapest scheduler in Malaysia".
5. **Demand for "a Malaysian scheduler" is thin. Demand for "how do I schedule on X" and "comment to DM" is real.**
   - Google autocomplete (gl=my) returns nothing for "social media scheduler malaysia" or "social media tool malaysia".
   - It returns 9–10 suggestions for "cara schedule post …" (TikTok, Facebook, Instagram, X, YouTube Shorts; the exact set varies between runs) and 10 for "comment to dm …".
   - "social media management malaysia" completes to agency price and package queries.

   (measured, section 8) Inferred: Malaysian buyers search for the job ("schedule TikTok post", "auto DM comments") and for agency prices, not for a local tool.
6. **Names in the brief that are not competitors**, so the team does not chase them:
   - **Kommu** makes KommuAssist, a driving-assist kit.
   - **RecomN** runs Recommend.my, a home-services marketplace.
   - **Oyen** sells pet insurance.
   - **Sendbird** sells a chat API and an AI customer-experience platform, with no social publishing.

   (sourced and measured, section 1d)

**One line for Siar against the local field (inferred):** "One price per business in ringgit, from RM39, with every social account included. One post counts once. The same API, webhooks and comments behind the dashboard."

---

## 1. The market map

### 1a. What Malaysian SMEs and agencies use and pay for (evidence, not survey data)

| Bucket | Products | Evidence | Label |
|---|---|---|---|
| Free native schedulers | Meta Business Suite (Facebook + Instagram), TikTok Studio scheduler | Meta help: https://www.facebook.com/business/help/1252240869631062. TikTok Creator Academy says Studio Web schedules up to 30 days ahead (via search snippet, page not opened). Malaysian guides tell SMEs to "start with Meta Business Suite + Canva" (https://duplex-ventures.com/?p=21349, third-party) | sourced |
| Design tool with a planner | Canva Pro RM250/year, Business RM420/year per person; "Social Content Planner" included on Pro, Business, Enterprise, not Free | https://www.canva.com/pricing/ from MY | measured |
| Messaging / social commerce inbox | SleekFlow (RM399–1,199/mo), respond.io (US$79–279/mo yearly), WATI, Omnichat, ManyChat | SleekFlow and respond.io pricing pages (section 6). "sleekflow vs wati / omnichat / manychat / respond io" all appear in MY autocomplete | measured |
| Global schedulers | Buffer, Hootsuite (plus Zoho Social, Later, Metricool in some roundups) | https://www.xwork.my/ai-marketing-tools-malaysia-2026/ (2026-07-27, agency blog, third-party) names Buffer and Hootsuite (not Zoho, Later or Metricool), with converted prices "Buffer Essentials (RM 26/channel/month)" and "Hootsuite Pro (RM 398/month)". https://duplex-ventures.com/?p=21349 (third-party) names Meta Business Suite, Buffer, Hootsuite, Sprout Social, SocialPilot, Canva Content Planner, SocialBee, Loomly. "Named in every roundup" was not shown; unverified | sourced |
| Local ringgit schedulers | Duta, PostLa, Synova, MarketOS, Prism Reach | Their own pages (sections 2–5) | measured |
| Agencies (the main paid alternative) | Freelancers RM800–2,000/mo, small agencies RM2,500–5,000, full service RM5,500–12,000 (one agency's ranges); Duta says "roughly RM800 to RM15,000"; MarketOS says "RM3,000–RM8,000" | https://arto.com.my/social-media-agency-pricing-malaysia/ (third-party agency), getduta.com, mymarketos.com/faq | sourced |
| Grey automation | Facebook *group* auto-posters (desktop apps, Chrome extensions, one-off "robot" licences RM59–249 on marketplaces) | https://prismxtech.com/reach (measured), https://my.biggo.com/s/auto+post+facebook/ (third-party, May 2024). Autocomplete "auto post facebook group free / extension / fewfeed" | measured + sourced |

Inferred reading: a typical Malaysian shop's software budget sits next to Canva and Meta's free tools. For a scheduler, the comparison is "free Meta Business Suite" against "pay an agency". That fits Siar's own Starter reasoning in `docs/pricing.md`. Duta and MarketOS also frame themselves against agencies.

### 1b. Government money that shapes buying

- **Geran Digital PMKS MADANI** paid "50% atau maksimum RM 5,000 daripada jumlah invois". The software had to come from MDEC's panel. "Pemasaran Digital / Jualan" is one of nine scopes. (sourced: BSN, https://www.bsn.com.my/page/MSMEMadani?lang=ms-MY, checked 2026-11-12; the page shows no open or close date)
- Third parties say the 2025 round closed to new applications in early September 2025, and no new round was announced as of October 2026. (sourced: https://www.o2o.my/blog/geran-digital-pmks-madani-guide/, https://einvoicingmalaysia.com/e-invoice-grant-malaysia; unverified against MDEC)
- MarketOS still says "Qualifying Malaysian SMEs can claim up to 50% subsidy (maximum RM5,000) on MarketOS through the MDEC SME Digitalization Grant". (measured: FAQPage JSON-LD on https://mymarketos.com/faq)
- Inferred: if a new round opens, being on the MDEC panel is a real sales channel for the Starter/Pro tiers. Today Siar should not mention the grant.

### 1c. The SEA picture (Indonesia, the one market with clear local schedulers)

- **AutoPost.id**: hero "Platform Auto Posting Sosmed #1 di Indonesia", "Jadwalkan Sekali, Posting ke …". It covers Instagram, Facebook, TikTok, Twitter, LinkedIn and YouTube. (measured: https://autopost.id/)
  - Free: Rp0, 1 social account, 10 posts a month.
  - Growth: Rp99.000 a month, 5 accounts, 150 posts.
  - Business: Rp299.000 a month, 15 accounts, 600 posts.
  - Capped **by account count** per tier (re-checked in a browser 2026-11-12).
- **MaticPost**: Free / Rp75rb / Rp145rb, according to search snippets. The site returned a Cloudflare 525 error when I fetched it. **Unverified.**
- **AgxSocial**: "mulai dari Rp65.000 / bulan" with QRIS, according to search snippets. The site did not resolve. **Unverified.**
- **SleekFlow** runs a large Bahasa Indonesia site: 539 id-id blog URLs, plus "alternatif-barantum" and "alternatif-ivosights" pages. (measured: SleekFlow sitemap) Inferred: in SEA the money and SEO effort sit in WhatsApp/inbox tools, not in schedulers.

### 1d. Names checked and ruled out

| Name | What it is | Source |
|---|---|---|
| Kommu | Malaysian maker of KommuAssist (driving assist). Autocomplete (gl=my) for "kommu" gives "kommu assist", "kommu ai", "kommu assist 2" | measured: autocomplete; https://sgpgrid.com/company/kommu-sdn-bhd-ID0000 returned HTTP 403 on 2026-11-12, so the company record is unverified |
| RecomN | RecomN Technologies Sdn Bhd, runs the Recommend.my home-services apps | sourced: https://apps.apple.com/my/developer/recomn/id1141029259 |
| Oyen | Digital pet insurance (oyen.my title: "Oyen Pet Insurance Malaysia"; travel insurance unverified) | sourced: https://digitalnewsasia.com/startups/malaysian-digital-first-pet-insurance-startup-oyen-raises-us420k-seed-funding |
| Sendbird | "The AI customer experience platform", chat/calls API. No social post publishing | measured: https://sendbird.com/ |
| Kuasa, ChatDaddy, WATI, Omnichat | WhatsApp CRMs and inboxes sold in Malaysia. Not schedulers. Not torn down here | sourced (search snippets only); unverified |

---

## 2. Duta (getduta.com): the direct analogue

### Who

- **Operator** (measured: https://getduta.com/terms and /privacy): "Duta is made and operated by Baloot MY Digital Agency (NS0322595-U), a digital agency registered in Malaysia at Lot 8115, … 16150 Kota Bharu, Kelantan".
- Inferred: the NS…-U number format is a Negeri Sembilan-style business registration, not an Sdn Bhd. Unverified.
- llms.txt says "Last verified: 2026-08-11". The blog post "What Duta is…" is dated 9 August 2026. (measured)

### Home page (measured: https://getduta.com/, checked 2026-11-12)

- `<title>`: **"Duta: the social media scheduler built in Malaysia · Duta"**
- Meta description: "Write a post once. Duta publishes it to every account you choose, on time. Built in Malaysia, billed in ringgit."
- Hero kicker: **"it posts so you don't have to"**. The H1 is **"write a post once."**, then "yes, once. not six times." Subhead: **"Duta sends it to every account you choose, at the minute you choose, even with the laptop shut."**
- CTAs: "See how it works", "Start free", "Sign in". Closing H2: **"Duta is open. The first seven days are free."**
- Section headings, in order:
  - H2 "Built in Malaysia"
    - H3 "One price, in MYR"
    - H3 "Malaysian time by default"
    - H3 "Software, not an agency"
  - H2 "Three steps, and only the middle one needs you"
    - H3 "Connect your accounts"
    - H3 "Write the post"
    - H3 "Close the laptop"
  - H2 "Platforms Duta publishes to" ("Seven work today"), with H3 "Built, waiting for approval"
  - H2 "What Duta does" ("Eight things, stated plainly. Nothing here is a plan.")
    - H3 "One post, every account"
    - H3 "Scheduled to the minute"
    - H3 "Photos, carousels and video"
    - H3 "Files checked before you schedule"
    - H3 "Character limits per platform"
    - H3 "It tells you when something fails"
    - H3 "Your connections stay encrypted"
    - H3 "A record of what went out"
  - H2 "Questions"
- Key positioning lines:
  - "Duta is the first social media scheduling tool built in Malaysia."
  - "Buffer, Hootsuite and Later are all built elsewhere and billed in US dollars, so what you pay moves with the exchange rate and your bank adds its own fee on top."
  - "A social media agency here charges roughly RM800 to RM15,000 a month."
- **Proof:** none. There are no logos, testimonials or customer counts. Its proof device is honesty: "all seven tested with real posts", and a "Built, waiting for approval" list. llms.txt explains how it backs the "first" claim ("8 searches in all, and none was found").

### Pricing (measured: https://getduta.com/pricing, checked 2026-11-12)

| | Price | Notes |
|---|---|---|
| Monthly | **RM99 a month** | "One plan. Every channel Duta supports, connected as many times as you like." |
| Yearly | **RM990 a year** | "RM198 less than paying monthly, which is two months free" |
| Trial | 7 days | Card collected at sign-up; "The first charge lands on day 8" |
| Founding offer | "The first 1000 people keep RM99 a month for as long as they stay" | a price lock, like Siar's |
| Limits | X capped at "300 a month (20 during the trial)"; a post with a link counts as two on X | No other post cap. Terms: "the only one there is" |
| Payment | "Both plans take a card. The yearly plan also takes FPX." Stripe | No DuitNow. SST not mentioned |
| Unit | per account (user) | no per-channel or per-seat charge; teams not mentioned anywhere |

### Networks and features (measured: home, /llms.txt, /how-to-use)

- **Live (7):** X, Instagram, Facebook Pages, LinkedIn, Threads, Telegram (channel via your own bot), Discord (channel webhook).
- **"Built, waiting for approval" (4):** TikTok, Pinterest, YouTube, Google Business Profile. Each has its own honest note. For example, llms.txt says that until TikTok audits the app it "forces every post made through the API to private".
- **Lacks:** Bluesky, Mastodon, Slack, Reddit, Snapchat.
- **Features it has:**
  - Pre-flight media and character checks per network.
  - Three retries, then a plain-language failure reason.
  - A send log.
  - Short-link click counting.
  - An in-app AI agent that drafts posts.
  - **"a public API and an MCP connector"**. The MCP server is hosted at `https://mcp.getduta.com`, with step-by-step guides for Claude and ChatGPT "custom connectors". `/docs`, `/api` and `/developers` redirect to login, so the API is not publicly documented.
- **Does not have:**
  - Analytics ("Duta is a scheduling tool, not an analytics or engagement tool").
  - Inbox, comments or DMs. The privacy page says it "does not read your feed, your followers, your messages".
  - Teams or brands.
  - Webhooks for customers.
  - A white-label connect link.
  - Ringgit pricing for X usage (X is a capped quota instead).
  - BM pages. `<html lang="en">`; I found no Malay copy.

### SEO footprint (measured: https://getduta.com/sitemap.xml, robots.txt)

- **23 URLs** (re-counted 2026-11-12):
  - home, how-to-use, faq, pricing, contact, status, privacy, terms, data-deletion
  - /platforms plus 7 per-network pages (x, linkedin, facebook, threads, instagram, telegram, discord)
  - /blog plus 5 posts: "How to post to all your social accounts at once", "What Duta is, and what it can actually post today", "Why your Facebook Page posts are invisible to everyone but you", "The Instagram publishing rules that have nothing to do with file size", "What it actually costs to post to X through the API in 2026"
- No compare, alternatives, glossary or programmatic pages.
- robots.txt has explicit GPTBot / OAI-SearchBot blocks (allow the site, disallow the app paths). There is an llms.txt with "Notes for citation".
- Inferred keyword targets:
  - "social media scheduler Malaysia"
  - "Malaysian social media scheduling tool"
  - "scheduler priced in ringgit"
  - "how much does it cost to schedule social media posts in Malaysia"
  - "post to all social accounts at once"
- Duta's blog topics are the same developer pain points Siar's network error pages cover: Facebook dev-mode invisibility, Instagram API rules, the cost of X's API.
- **Backlinks:** none found in the original pass (searches for "getduta" returned only getduta.com; no Product Hunt, G2 or roundup mention), and an extended web search for "Is there a Malaysian social media scheduling tool priced in ringgit?" returned getduta.com first. **Unverified on re-check:** the verification pass on 2026-11-12 could not re-run these searches (search budget exhausted). Google autocomplete (gl=my) for "duta social" returns nothing (measured). "Its GEO is working" is inferred from one unrepeated search.

### Weaknesses (inferred unless noted)

- One plan at RM99 is 2.5× Siar Starter. No free tier, and a card is needed even for the trial.
- No inbox, comments, analytics or teams. The "PM for price" / comment-to-DM behaviour that Malaysian selling runs on is out of scope for Duta.
- No client separation, so it is weak for agencies with many clients.
- API docs sit behind a login, and it has no webhooks. Developers cannot evaluate it before signing up.
- Operated by a small Kelantan digital agency (the legal entity is visible on the terms page).
- No user reviews exist anywhere I could find. That is also true of Siar.

### Where Duta is ahead of Siar today (honest)

- It launched first, with a defensible "first built in Malaysia" claim already cited by AI search.
- Telegram is live. Siar has no Telegram adapter (measured: `packages/networks/src/adapters/`).
- It has a hosted, OAuth-connected MCP endpoint that works in Claude and ChatGPT today. Siar's MCP package is not on npm (`siar-truth.md` section 2).
- No post cap except X. Siar Starter allows 300 posts a month.

**Siar vs Duta in one line:** "From RM39 instead of RM99, with 20 free posts to try and no card. Comments, webhooks and public API docs on every plan, analytics on paid plans, and 10 brands on Pro." (Siar's Free plan has no analytics and 1 brand: `plans.ts`.)

---

## 3. MarketOS (mymarketos.com / marketos.my): an AI marketing suite with a scheduler

### Who

- JSON-LD Organization: "MarketOS", Kuala Lumpur, areaServed MY. No legal entity or SSM number on any page fetched.
- About page: "MarketOS started as an internal tool. Our founders were running a digital marketing agency serving Malaysian SMEs…"
- Footer: "© 2025 MarketOS. Built for Malaysia." (measured: https://mymarketos.com/en, /en/about, /faq)

### Home page (measured: https://mymarketos.com/en, checked 2026-11-12)

- `<title>`: **"MarketOS — AI Marketing Platform for Malaysian SMEs"**
- Eyebrow: "AI-Powered Marketing for Malaysian SMEs". H1: **"One platform. All your marketing."**
- Subhead: **"Social media, marketplaces, ads, SEO, CRM — managed from a single dashboard. Generate content with AI in English, BM & Chinese. Built for Malaysian businesses."**
- CTAs: "Start 7-Day Free Trial", "See how it works". Trust row: "7-day free trial · Setup in 2 minutes · PDPA compliant · Pay with FPX".
- Sections, in order:
  - H2 "Everything you need to grow" ("Stop juggling 10 tools.")
    - H3 AI Content Engine ("Powered by Claude AI")
    - H3 Smart Scheduler
    - H3 Ads Manager
    - H3 SEO Suite
    - H3 CRM
    - H3 Analytics
    - H3 Competitor Intel
    - H3 GEO Optimization
  - H2 "Built for every Malaysian industry": F&B ("From mamak stalls…"), E-Commerce, Beauty, Property, Education, Professional Services
  - H2 "Real results, real businesses"
  - H2 "Ready to grow your business?"
- **Proof:** "2,400+ SMEs onboard", "4.8 ★ Average rating", "3.2× Avg. ROAS boost", "18 hrs Saved per month".
  - Testimonials use first names, a role and a city only. One is in BM: "Sebelum ni guna 4-5 apps berbeza. Sekarang semua dalam satu dashboard. Jimat masa dan duit!" (Nurul Ain, Bakery owner, Kuala Lumpur). One is in Chinese.
  - The rating has no named source, and the About page CTA says "Be among the first Malaysian SMEs to grow with MarketOS". Inferred: the numbers are unverifiable and sit oddly with a "be among the first" CTA.
- "Competitor Intel" is pitched as "Scrape competitor Facebook pages and posts. AI identifies prospects from their comments and generates personalised Messenger outreach scripts." Inferred: this is a Meta-terms risk, and Siar should not copy it.

### Pricing (measured: https://mymarketos.com/en/pricing, checked 2026-11-12)

"Simple, transparent pricing. Start free. Upgrade when you're ready. All prices in Ringgit Malaysia." Billing can be monthly, quarterly (−5%) or annual (−15%).

| | Free | Starter | Growth ("Most popular") | Pro | Enterprise |
|---|---|---|---|---|---|
| Visible price | RM0 | **RM199/mo** | **RM599/mo** | **RM1,499/mo** | Custom |
| Social channels | 1 | 3 | All | All | Unlimited |
| Posts / month | 5 | 30 | 150 | 500 | Unlimited |
| AI tokens / month | 10K | 300K | 1.5M | 5M | Custom |
| Workspaces | 1 | 1 | 3 | 5 | Unlimited |
| CRM contacts | — | — | 2,000 | Unlimited | Unlimited |
| API access | — | — | ✓ (icon) | ✓ | ✓ |
| White-label | — | — | — | ✓ (icon) | ✓ |
| Support | Community | Email | Priority | Dedicated | Dedicated |

- **The price list contradicts itself.** The visible cards and the FAQ say RM199 / RM599 / RM1,499. The page's own Offer JSON-LD and its blog (https://mymarketos.com/en/resources/best-ai-marketing-tools-malaysian-smes-2026, dated 5 Aug 2026) still say **RM99 / RM349 / RM899**. (measured) Inferred: AI answers will quote the old numbers.
- Unit: capped by channels and workspaces, with no per-seat line.
- Payment: "Pay with FPX" and "Pay in RM". Card is not stated. SST is not stated.
- Grant claim: see 1b.

### Networks and features

- FAQ: "MarketOS supports Facebook, Instagram, TikTok, WhatsApp Business, Shopee, and Lazada." (measured, JSON-LD FAQPage)
- No X, LinkedIn, Threads, YouTube, Pinterest, Bluesky etc.
- "Comment fetches/month" exists only on Growth (50) and Pro (100).
- No public API docs, webhooks or MCP that I could find.
- The interface is English only ("The platform interface is currently in English").
- `/ms` serves `lang="en"` with the same content. (measured)

### SEO footprint (measured: https://mymarketos.com/sitemap.xml)

- **65 URLs** (re-counted 2026-11-12):
  - 12 core pages
  - 7 resources: "best AI marketing tools for Malaysian SMEs 2026", AI marketing for Malaysian SMEs, social media strategy, Meta ads, WhatsApp marketing, SEO basics, Shopee/Lazada
  - **24 glossary terms** (ROAS, CTR, CPM, FPX, PDPA, WhatsApp Business API, content calendar…)
  - 22 help articles
- It has a self-ranked "7 Best AI Marketing Tools" listicle that puts itself first.
- robots.txt has a full GPTBot / OAI-SearchBot section. There are FAQPage, SoftwareApplication and Offer JSON-LD blocks.
- Search also surfaced MarketOS-branded pages on relxlife.com (a terms page and "Best AI Marketing Tool for Malaysian SME 2026"). (sourced via WebSearch in the original pass) **Unverified on re-check:** relxlife.com returned an empty response on 2026-11-12 and the search could not be re-run. Inferred: a related or mirrored domain; its independence is doubtful.
- Inferred targets: "AI marketing platform Malaysia", "AI marketing tools Malaysian SMEs", glossary terms in a Malaysian context.

### Weaknesses (inferred)

- 30 posts for RM199 against Siar Starter's 300 posts for RM39.
- 3 channels on Starter.
- The price contradiction.
- Unverifiable proof.
- No X, LinkedIn or Threads.
- A grant claim the third-party sources say is closed.
- It is a suite: a shop that only wants "post once, everywhere" pays for ads, SEO and scraper features it does not use.

**Siar vs MarketOS in one line:** "If you only need to publish and answer comments, Siar is RM39 for 300 posts on every account, not RM199 for 30 posts on three channels."

---

## 4. PostLa (postla-page.pages.dev / postla.my) and Synova by Zynex AI

### PostLa (measured: https://postla-page.pages.dev/, /features.html, /pricing.html, /contact.html, checked 2026-11-12)

- Title: **"PostLa — Manage All Your Social Media From One Dashboard"**. Hero: **"Social media, one dashboard."** Subhead: **"Manage TikTok, Instagram, Facebook & LinkedIn from a single place — with Malaysian support and setup done for you in under 24 hours."**
- CTAs: "Start Free Trial", "View Pricing". Badge: "Available now — free trial".
- The features page lists "WhatsApp Support — in BM": "Unlike other platforms that only offer email or chat in English, PostLa gives you direct WhatsApp support in Bahasa Malaysia." Plus "Reply within hours, not days" and "Time zone support for Malaysia".
- Contact: admin@postla.my, a WhatsApp number, "Kuala Lumpur, Malaysia", "Made with ❤️ in Malaysia". No legal entity is shown.
- **Pricing** ("Start free with a 14-day trial. No credit card required."):

  | Plan | Price | Limits |
  |---|---|---|
  | Starter | **RM97/month** | 3 social accounts, 30 scheduled posts/month, basic analytics, email + WhatsApp support |
  | Professional | **RM197/month** | 10 social accounts, unlimited posts, advanced analytics, 5 users |
  | Enterprise | Custom | unlimited accounts and users, "24/7 priority support" |

  Capped **by social accounts** per plan. The pricing FAQ says "Annual plans save you 20%" (no yearly figure shown) and "We accept bank transfer, credit card, and PayNet for Malaysian businesses." The home page claims "Join Malaysian businesses already using PostLa" with no figure.
- Networks named: TikTok, Instagram, Facebook, LinkedIn, Twitter/X, YouTube. No approval status is stated. Inferred: claiming TikTok and YouTube publishing needs those platforms' audits, which cannot be checked from outside.
- No proof, no API, no docs. The site runs on a `pages.dev` subdomain.
- Inferred: a new, low-authority launch, but its "BM WhatsApp support" promise is the one local differentiator Siar deliberately does not offer (`docs/pricing.md`: "no WhatsApp line").

### Synova by Zynex AI (measured: https://zynex-ai-v2.pages.dev/synova.html and /blog/social-media-automation-sea.html, checked 2026-11-12)

- Title: **"Synova — Post Once. Reach 7 Platforms. | SEA Social Media Sync | Zynex AI"**. Hero: **"Post once. Reach everywhere."** Subhead: "Synova syncs your content to Facebook, Instagram, TikTok, 小红书, Threads & X". "Built for KOLs, brands & MCN agencies across Southeast Asia."
- Sections: "Three steps to everywhere", "Everything creators need", "Simple, honest pricing", "Creators love Synova", "Ready to go everywhere?"
- Operator: Zynex AI / Zynex Technologies, an IT services company in Johor Bahru. The site is bilingual English/Chinese.
- **Pricing (monthly, MYR):**

  | Plan | Price | Limits |
  |---|---|---|
  | Starter | **RM99/mo** | 1 account per platform, 3 platforms, 30 posts/month |
  | Pro | **RM299/mo** | 5 accounts per platform, all 7 platforms incl. 小红书, unlimited posts, AI copy, 3 team members |
  | Business | **RM799/mo** | 20 accounts per platform, **API access**, **white-label option** |

  Priced per account per platform.
- Trial: "First 14 days free." Badge: "Now live — Southeast Asia's #1 multi-platform sync tool"; feature line: "The only tool in SEA with first-class 小红书 support." (measured)
- Proof: three testimonials (a Fashion KOL "280K followers", "Ahmad Fariz, MCN Agency Director, Kuala Lumpur", a Singapore creator). "Join thousands of KOLs and brands" is given with no figure.
- Posting method: **not disclosed**. Inferred: Xiaohongshu has no public third-party publishing API that I know of, so Xiaohongshu sync probably relies on non-API automation. Unverified.
- The blog claims Synova is "Southeast Asia's first multi-platform social media sync tool". (measured)

**Siar against both (inferred):**

- PostLa and Synova charge by account. Siar charges by business.
- A shop with 5 accounts pays PostLa RM197 or Synova RM299. Siar Starter is RM39.
- An MCN running 20 creators needs Synova Business at RM799. Siar Pro covers 10 brands for RM99, and Business covers unlimited brands for RM399.
- Siar has no Xiaohongshu and should not pretend otherwise.

---

## 5. Prism Reach (prismxtech.com/reach): the grey-automation alternative

(measured: https://prismxtech.com/reach, checked 2026-11-12)

- Title: **"Prism Reach — Facebook Group Auto Post Software for Malaysia"**. Hero: **"Stop chasing leads. Let the system work for you."** Subhead: "More than just posting — exposure, outreach, AI content & account protection, all in one. Built for Malaysian SME sellers. Priced in RM. No add-ons, no surprises."
- It is a Windows/Mac desktop app ("Local Run + Cloud License"; Mac is Apple silicon only). CTA: "WhatsApp Us". Site languages: English plus a 中文 switch, with Chinese plan names on the page; no hreflang tags were found in the HTML.
- **Pricing** ("Priced in RM · No hidden fees · Quarterly 8% off · Annual 25% off"):

  | Plan | Monthly | Yearly | Limits |
  |---|---|---|---|
  | Free | RM0 | | 1 FB account, 200 posts lifetime, 7-day scheduling trial |
  | Starter | RM159 | RM119/mo (RM1,431 upfront) | 3 FB accounts, unlimited posts, auto-join groups |
  | Pro | RM299 | RM224/mo (RM2,691 upfront) | 20 FB accounts, Marketplace posting |
  | Team | RM699 | RM524/mo (RM6,291 upfront) | 60 FB accounts |

  It also sells prepaid credits: 300 credits RM49 (RM0.16 per group post) up to 5,000 credits RM549 (RM0.11 per group post). (measured on the page)
- Features: "Account Warming", "Auto Join Groups", "Spin Text", "AI Group Discovery".
- Its own disclaimer: "No tool can guarantee an account will never be restricted. Users must follow platform policies."
- Inferred: this works by automating personal Facebook accounts, which Meta's API does not allow. Facebook groups cannot be posted to through Meta's API (third-party claim, https://marketingtoolsprohub.com/blogs/facebook-auto-poster/best-facebook-auto-poster-software-2026.html). The demand is real: autocomplete includes "auto post facebook group free", "… extension", "… fewfeed".

**Siar position (inferred):** do not chase this. Say plainly that Siar posts through each network's official API to Pages and professional accounts, and does not post to Facebook groups or personal profiles. That is also what Meta approved (`siar-truth.md` 1a).

---

## 6. Messaging and inbox platforms (where SMEs spend on "social")

### SleekFlow (sleekflow.io): HK-founded, sells in Malaysia in ringgit

- **BM home page** (measured: https://sleekflow.io/ms-my):
  - Title: "Platform pemesejan AI omnichannel untuk perniagaan | SleekFlow"
  - Hero: **"Suite AI untuk perbualan yang memacu hasil"**. Subhead: "Setiap sembang, e-mel dan panggilan adalah peluang pendapatan."
  - CTAs: "Mulakan percubaan percuma", "Tempah Demo"
  - H2s: "Sistem operasi perbualan AI dipercayai oleh jenama B2C", "Tenaga kerja AI untuk anda keseluruhan perjalanan pelanggan", "Dari klik pertama untuk mengulangi pembelian, suite AI yang lengkap", "Penyedia Penyelesaian Perniagaan WhatsApp #1", "Sambungkan alatan anda, biarkan AI mengambilnya dari sana", "Berkembang dengan SleekFlow hari ini"
  - Inferred: this reads as machine-translated BM ("untuk anda keseluruhan perjalanan pelanggan" is word-for-word English order).
- **Global home** (measured: https://sleekflow.io/):
  - Hero: **"The AI suite for revenue-driving conversations"**. Subhead: "Never miss a sale, leave an inquiry unanswered, or lose a deal to a slow reply".
  - Proof: "7,000+ businesses in 70 countries", "1M conversations powered every day", G2 Leader / High Performer badges, and logos including L'Occitane, Gleneagles, Monash University, Hilton, Christian Louboutin.
  - Named testimonials include Edward Toh of Jom Charge (a Malaysian EV-charging brand) with "response time improved by over 95%".
  - Footer badges: ISO 42001, SOC, Meta Business Partner.
- **No social post scheduling.** Instagram and Facebook are messaging channels only. A product update covers "Instagram/Facebook auto-reply comment" (blog URL `/ms-my/blog/product-update-instagram-facebook-auto-reply-comment`).

**Pricing in ringgit** (measured: https://sleekflow.io/en-my/pricing.md, dateModified 2026-11-04, checked 2026-11-12):

| | Pro | Premium | Enterprise |
|---|---|---|---|
| Yearly (per month) | **RM399** (RM4,788/yr) | **RM1,199** (RM14,388/yr) | Custom |
| Monthly | **RM449** | **RM1,399** | |
| Monthly active contacts | 1,000 | 3,000 | Custom |
| User seats | 3 | 10 | Custom |
| Channels | 3 | 10 | Unlimited |
| API access, HTTP/webhook automations | — | ✓ | ✓ |
| AI credits | 3,000/mo | 15,000/mo | Custom; add-on US$20 / 5,000 |

- Overage: "SleekFlow automatically adds 100 MACs at a time".
- Payment: "all major credit and debit cards through … Stripe". FPX and DuitNow are not mentioned.
- Trial: "7-day Pro plan trial, no credit card required".
- WhatsApp, SMS and voice fees are charged on top, per the rate card.
- Note: the same page says "All messaging, email and calls channels — included on every plan" while its table caps channels at 3 and 10.

**SEO footprint** (measured: sitemap index, 12 child sitemaps):

- About 7,800 URLs, including **4,993 blog URLs**:
  - en-sg 739
  - en-gb 590
  - en-us 570
  - id-id 539
  - pt-br 482
  - zh-hk 349
  - and others
  - **ms-my only 16** (6 posts plus category pages)
- 539 channel/integration pages, 222 solution pages, 630 customer-story URLs.
- `/alternatives/best-wati-alternative`, plus Indonesian "alternatif-barantum" and "alternatif-ivosights".
- Inferred: SleekFlow wins SEA search on WhatsApp/inbox terms and barely invests in BM.

**Complaints** (sourced, third-party):

- eesel.ai (a competitor, last edited 2026-10-14, https://www.eesel.ai/blog/sleekflow-pricing):
  - the MAC overage rate is unpublished
  - extra seat cost is unpublished
  - AI credits are used "regardless of outcome"
  - a G2 reviewer: "The price is too high, especially considering the 24-hour closed window"
  - a Reddit user: "their pricing structure is really weird"
- Search summaries of G2 (https://www.g2.com/products/sleekflow/reviews?qs=pros-and-cons; 403 to my fetcher) say the top con is pricing "too steep for smaller teams and solopreneurs". Unverified directly.

### respond.io: headquartered in Kuala Lumpur, priced in USD

- HQ: Kuala Lumpur. Founded as Rocketbots in Hong Kong in 2017, moved its headquarters to Kuala Lumpur in 2019, renamed respond.io in 2020. (measured: https://respond.io/about, the vendor's own page)
- **Pricing** (measured: https://respond.io/pricing, checked 2026-11-12; "*Prices are in USD"):

  | Plan | Monthly | Yearly (per month) | Users | Extra user |
  |---|---|---|---|---|
  | Starter | $99 | $79 | 5 | $12 |
  | Growth | $199 | $159 | 10 | $20 |
  | Advanced | $349 | $279 | 10 | $24 |
  | Enterprise | custom | custom | | |

  - No free plan. A 7-day trial without a card.
  - Developer API from Growth; webhooks on Advanced.
  - No MYR anywhere on the page.
- No post scheduling.
- SEO (measured, re-counted 2026-11-12): **14,768 sitemap URLs** across 8 child sitemaps (3,380 pages, 4,654 blog, 3,601 help articles, 1,326 tags, 1,001 video tutorials, 520 help categories, 182 authors, 104 categories). It has `/alternatives/*` pages (intercom, manychat, sleekflow, trengo, wati) and blog posts "whatsapp-api-pricing-malaysia", "malaysian-b2c-teams-choose-respondio" and "facebook-comment-auto-reply". **There is no Malay locale** (12 other locales: ar, de, es, fr, id, it, pt, ru, th, tw, vi, zh).

### ManyChat (comment-to-DM leader, global)

- Measured from a Malaysian IP (https://manychat.com/pricing, checked 2026-11-12), **in USD**:

  | Plan | Monthly | Yearly (per month) | Active contacts |
  |---|---|---|---|
  | Free | $0 | | 25 |
  | Essential | $17 | $14 | 250 |
  | Pro | $39 | $29 | 2,500 |
  | Business | $99 | $69 | 7,500 |
  | Advanced | $199 | $139 | 25,000 |

- "The price is determined by the user's billing country."
- Inferred: ManyChat sets the reference price for the "Comment HARGA, terus dapat DM" use case Siar wants to sell on Starter.

**Siar position against the inbox tools (inferred, within `siar-truth.md` limits):**

- Siar is a publisher with comments and a beta DM inbox for Facebook and Instagram. It is not a WhatsApp CRM.
- Do not compare Siar to SleekFlow or respond.io on messaging until DMs leave beta.
- The honest line today: "Publish, schedule and answer comments for RM39. Facebook and Instagram DMs and comment-to-DM are in beta on request."

---

## 7. Global tools as Malaysians see them (prices read from a Malaysian IP)

| Tool | Currency shown in MY | Entry price | Unit | Source (checked 2026-11-12) |
|---|---|---|---|---|
| **Zoho Social** | **MYR** ("Looks like Malaysia is your location") | Free RM0 (1 brand, 6 channels); **Standard RM40/mo yearly, RM60 monthly** (1 brand, 14 channels, 1 member); Professional RM120 yearly / RM160 monthly; Premium RM160 yearly / RM260 monthly (16 channels, 3 members, Inbox); extra brand RM58–92/mo, extra member RM40–48/mo; **Agency RM920 yearly / RM1,280 monthly (10 clients, 160 channels, 5 members)**; Agency Plus RM1,320 / RM1,840 (20 clients) | per brand + per member | https://www.zoho.com/social/pricing.html (browser, MY IP). "Local taxes … will be charged in addition" |
| **Canva** | **MYR** | Pro **RM250/year** for one person; Business **RM420/year per person**. Social Content Planner ("Create, plan, and schedule social content across platforms") on Pro and up | per person | https://www.canva.com/pricing/ (browser, MY IP). Canva's planner network list not checked: unverified |
| Buffer | USD | Free 3 channels; Essentials **$5/mo per channel** billed yearly ($60/yr); Team $10/mo per channel yearly | per channel | https://buffer.com/pricing (browser, MY IP); full teardown in `buffer.md` |
| Hootsuite | USD ("Prices displayed in USD") | Standard **$99 per user/month** billed annually (10 accounts); Professional $199; Advanced $399 | per user | https://www.hootsuite.com/plans (browser, MY IP). A "FALL SALE … 50% off the Standard plan" banner was showing |
| ManyChat | USD | see section 6 | per contacts | measured |
| Meta Business Suite | free | Facebook + Instagram only | n/a | https://www.facebook.com/business/help/1252240869631062 (sourced) |
| Simplified | USD (not checked) | runs programmatic **BM** landing pages, e.g. `simplified.com/ms/social-media-scheduler/facebook-pages`, title "App Facebook Facebook Percuma \| Catatan Facebook automatik", H1 "Catatan Auto ke Halaman Facebook Awam dengan Perancang Media Sosial" | | measured. Inferred: machine-translated ("Catatan" for "post"), built on a Webflow multi-language collection |

Inferred takeaways:

- Zoho is the only big scheduler that already sells in ringgit at a Siar-like entry price.
- Zoho's single-brand plans cap channels (14–16) and charge per extra brand and seat. Siar charges per organization with unlimited accounts.
- For an agency, Zoho Agency at RM920–1,280 a month is the honest comparison against Siar Pro at RM99 (10 brands).

---

## 8. Demand evidence (Google autocomplete, gl=my, 2026-11-12, measured)

| Seed | Suggestions | Reading (inferred) |
|---|---|---|
| social media scheduler malaysia | **none** | Almost no one searches for a local tool by name |
| social media tool malaysia | **none** | same |
| social media management malaysia | "… agency malaysia", "… price malaysia", "… package malaysia", "social media manager malaysia salary" (plus "social media in malaysia" statistics queries) | People search for agencies and agency prices |
| cara schedule post | re-run 2026-11-12: tiktok, di facebook, x, instagram, instagram di pc, di instagram, story instagram, youtube short, tiktok di hp (an earlier run also showed "di ig", "twitter") | **The real BM demand: how-to per network** |
| schedule post tiktok (hl=ms) | "… tidak muncul", "… hilang", "… studio", "… reddit" | BM speakers hit TikTok scheduling problems |
| schedule post facebook | "… personal account", "… group", "… business page", "… where to find" | Groups and personal profiles are asked for (Siar cannot do them) |
| auto post facebook | "… group free", "… groups fewfeed", "… extension", "… n8n", "… github", "… to instagram" | Grey-tool and automation demand |
| comment to dm | "… automation instagram free", "… tiktok", "… meta business suite", "… facebook", "… linkedin" | Strong; matches the Starter "comment HARGA" pitch |
| auto dm instagram | "… free", "… free unlimited", "… comments", "… tool" | same |
| sleekflow | "… pricing", "… malaysia", "… malaysia office", "… api", "… whatsapp pricing" | SleekFlow has brand demand in MY |
| sleekflow vs | respond io, wati, omnichat, manychat | the inbox shortlist Malaysians compare |
| buffer malaysia / duta social / marketos malaysia | none relevant | No local brand demand for any scheduler, Duta included |
| jadual post | "jadual post tiktok 2026", "jadual posting di media sosial" | "jadual" here means a posting timetable (best times), not a tool |

No keyword-volume tool was used. Every reading above is inferred from autocomplete presence, not from volume. Reddit could not be searched (WebSearch refuses reddit.com). A Lowyat search found no scheduler threads, only old general marketing threads, e.g. https://forum.lowyat.net/topic/4789254/all.

---

## 9. BM-language marketing observed

| Brand | BM on site? | Example (quoted) | Label |
|---|---|---|---|
| Duta | No (English only, but the name is Malay and the copy is Malaysian-specific: ringgit, "Malaysian time by default") | "Duta is a Malay and Sanskrit word meaning envoy" | measured |
| MarketOS | Content generation in BM; site English; one BM testimonial | "Sebelum ni guna 4-5 apps berbeza. Sekarang semua dalam satu dashboard. Jimat masa dan duit!" | measured |
| PostLa | BM support promised, site English | "direct WhatsApp support in Bahasa Malaysia" | measured |
| SleekFlow | Full BM home, 16 BM blog URLs; formal, machine-like | "Suite AI untuk perbualan yang memacu hasil" | measured |
| Simplified | Programmatic BM pages, machine-translated | "Catatan Auto ke Halaman Facebook Awam…" | measured |
| FastSocial.ai (US, Raleigh NC) | Templated BM page, one of "109 bahasa" | "Kandungan Media Sosial Berbulan-bulan.", "Mula Secara Percuma" | sourced: https://fastsocial.ai/languages/malay (via WebFetch) |
| Prism Reach | English + Chinese, no BM | | measured |

Inferred:

- Nobody in this set writes natural, colloquial Malaysian BM on the web. The BM that exists is formal or machine-translated.
- Siar's planned ad voice ("Post sekali, keluar kat semua platform. RM39 sebulan.", `docs/pricing.md`) would stand out. Social ads in BM were not checked; the Meta Ad Library needs a login. **Not verified.**
- The demand data (section 8) says any BM web content should be per-network how-to pages ("cara schedule post TikTok/Facebook/IG"), not brand pages.

---

## 10. SEO footprint summary

| Site | Sitemap URLs | Compare / alternatives | Per-network pages | Blog | Glossary | llms.txt / AI bots | Backlink signals found |
|---|---|---|---|---|---|---|---|
| getduta.com | 23 | none | 7 (/platforms/x …) | 5 | none | llms.txt with citation notes; GPTBot/OAI-SearchBot rules | none (no PH, G2, roundups) |
| mymarketos.com | 65 | none (one self-ranked listicle) | none | 7 | 24 | AI-bot rules; FAQPage + Offer JSON-LD (stale prices) | relxlife.com mirror pages (unverified on re-check) |
| postla-page.pages.dev | not checked (4 pages seen) | none | none | none | none | | none |
| zynex-ai-v2.pages.dev (Synova) | not checked | none | none | SEA guide post | none | | none |
| prismxtech.com | not checked | none | FB groups only | | | | GitHub releases for the installer (named on the page) |
| sleekflow.io | ≈7,800 (blog 4,993) | /alternatives/* (WATI, Barantum, Ivosights) | 539 channel/integration | yes, 15 locales | | | G2 badges, Meta Business Partner |
| respond.io | 14,768 | /alternatives/* | yes | 4,654 | | | G2 (not fetched) |
| siaran.my (for reference) | see `current-site.md` | none yet | 15 network pages + 15 error pages | | | llms.txt | none yet (`offsite-plan.md`) |

Inferred:

- In the "Malaysian scheduler" niche, the incumbent's whole site is 23 sitemap URLs. Siar's 15 network pages and 15 error-reference pages already outnumber Duta's per-network pages.
- The fight is GEO answers, not rankings. Duta already owns the answer to "Is there a Malaysian scheduler priced in ringgit?".

---

## 11. Weaknesses and complaints (with links)

| Competitor | Complaint / gap | Source | Label |
|---|---|---|---|
| Duta | No free tier, card needed for the trial; one RM99 plan; no inbox, comments, analytics or teams; API docs behind login | getduta.com/pricing, /llms.txt | measured |
| Duta | No reviews found | WebSearch for "getduta" (original pass only; not re-run 2026-11-12) | measured once (absence); unverified on re-check |
| MarketOS | Visible prices (RM199/599/1,499) contradict its own JSON-LD and blog (RM99/349/899); 30 posts on Starter; unsourced "4.8 ★", "2,400+ SMEs" | mymarketos.com/en/pricing, /en | measured |
| MarketOS | Advertises a grant that third parties say closed in Sept 2025 | /faq, o2o.my | measured + sourced |
| PostLa | Account caps: 3 accounts for RM97; no legal entity shown; pages.dev host | postla-page.pages.dev | measured |
| Synova | Per-account-per-platform; posting method undisclosed; API only at RM799 | zynex-ai-v2.pages.dev/synova.html | measured |
| Prism Reach | Automates personal FB accounts; its own page warns of restriction | prismxtech.com/reach | measured |
| SleekFlow | Unpublished MAC overage rate; "The price is too high, especially considering the 24-hour closed window" (G2 reviewer quoted by eesel); "pricing structure is really weird" (Reddit user quoted by eesel). "Too steep for smaller teams" comes only from search summaries of G2 (403 to fetch): unverified | https://www.eesel.ai/blog/sleekflow-pricing; https://www.g2.com/products/sleekflow/reviews?qs=pros-and-cons | sourced (third-party, competitor-written) |
| Meta Business Suite | Scheduled link posts lose their preview image at publish time (open developer-community thread) | https://developers.facebook.com/community/threads/2615949408864549/ | sourced |
| Buffer / Hootsuite | Billed in USD to Malaysians (FX and card fees) | measured from MY IP | measured |
| Zoho Social | Ringgit, but per brand and per seat; "Local taxes … in addition"; channel caps 6–16 per brand | zoho.com/social/pricing.html | measured |

---

## 12. Gaps Siar can use honestly (and lines it must not cross)

**Usable now (all true per `siar-truth.md`):**

1. **Per business, not per account, in ringgit.**
   - Every local rival caps accounts or channels: PostLa 3/10, Synova per platform, MarketOS 3 channels.
   - Zoho Social caps channels per brand and charges per seat.
   - Siar: "Unlimited social accounts on every plan, from RM39 a month."
2. **Cheapest paid entry among the ringgit-priced schedulers checked.** Starter RM39 compares with Zoho Standard RM60 monthly (RM40 billed yearly), PostLa RM97, Duta RM99, Synova RM99 and MarketOS RM199. (measured, 2026-11-12)
   - Zoho's yearly RM480 against Siar's yearly RM390 is close, so do not say "half the price of everyone".
3. **A free start with no card:** "20 free posts to try". Duta needs a card. PostLa, Synova and MarketOS offer trials or capped free plans.
4. **Agencies:** Siar Pro covers 10 brands for RM99. Zoho Agency is RM920–1,280 a month, Synova Business RM799, MarketOS Pro RM1,499.
5. **Comments and analytics on paid plans, plus public API docs and webhooks on every plan.**
   - No local scheduler has public API docs.
   - Duta has no webhooks. MarketOS and Synova gate the API to RM599+ and RM799.
   - Siar's API has no plan gate in `plans.ts` [code].
6. **Pay once yearly by FPX or DuitNow.** Duta's yearly plan takes card or FPX (no DuitNow mentioned). MarketOS mentions FPX. PostLa lists "bank transfer, credit card, and PayNet". SleekFlow lists cards through Stripe (bank transfer only for invoices over US$10,000).
7. **Content gap: per-network BM how-to pages.** Nobody owns "cara schedule post TikTok / di Facebook / di IG" with a tool attached. Siar's network pages exist in English. Their BM versions are a candidate (validate in GSC first, as `geo/plan.md` says).
8. **Official API only.** Use this as the honest answer to the "auto post facebook group" demand. Siar does not post to groups or personal profiles.

**Do not claim:**

- "First", "only" or "the Malaysian scheduler". Duta's claim is dated 2026-08-11. Siar went live 2026-10-12.
- TikTok, YouTube (public), Pinterest publishing or LinkedIn Pages. Duta is already being careful and honest about the same approvals, and readers will compare.
- DMs or comment-to-DM as generally available. They are in beta on request (`siar-truth.md` section 2).
- "White-label" connect. It is branded, on app.siaran.my, with "Powered by Siar".
- An MCP install line. Siar's MCP is not on npm. Duta's hosted connector works today; that is a real gap (section 13).
- WhatsApp or BM support. Siar offers email support only.

---

## 13. What this means for the backlog (inferred, not decided)

These are notes for Fakhrul, not commitments.

- **GEO answer pages:** the questions Duta answers in its FAQ ("Is there a Malaysian social media scheduling tool?", "Which scheduler is priced in Malaysian Ringgit?", "How much does it cost to schedule social media posts in Malaysia?") need Siar answers too. They must be factual and dated, must not say "first", and should be free to name the ringgit alternatives. This fits the `/compare` pattern already planned in `docs/geo/plan.md`.
- **Hosted MCP:** Duta proves a remote MCP connector (OAuth, no install) is achievable for a small Malaysian team. Siar's MCP is local and unpublished.
- **Telegram:** Duta's only network Siar lacks among the live seven.
- **Comparison pages that are safe to build now** (all facts above are vendor-sourced and dated): Siar vs Zoho Social (ringgit), Siar vs Duta, Siar vs PostLa / Synova (per account vs per business).

---

## 14. Positioning in one line each

| Competitor | How Siar should position (inferred) |
|---|---|
| Duta | "From RM39, not RM99, with 20 free posts to try and no card, and with comments, analytics, brands and a public API." |
| MarketOS | "Just publishing and comments: 300 posts on every account for RM39, not 30 posts on three channels for RM199." |
| PostLa / Synova | "One price per business. Add your fifth account or twentieth creator without changing plan." |
| Prism Reach | "Official APIs only. Pages and professional accounts, never your personal profile." |
| SleekFlow / respond.io | Not a head-to-head. "Publish and answer comments in one place. Keep your WhatsApp CRM for chat." |
| Zoho Social | "Every account in one organization price. No per-brand or per-seat add-ons on the way to 10 clients." |
| Buffer / Hootsuite | "Priced in ringgit, paid to a Malaysian company, not per channel or per user in USD." |
| Meta Business Suite | "Facebook and Instagram plus Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack from one post." |

---

## Sources (all checked 2026-11-12 unless dated otherwise)

Vendor pages (measured):

- Duta: https://getduta.com/ , https://getduta.com/pricing , https://getduta.com/llms.txt , https://getduta.com/how-to-use , https://getduta.com/terms , https://getduta.com/privacy , https://getduta.com/sitemap.xml , https://getduta.com/robots.txt , https://getduta.com/blog
- MarketOS: https://mymarketos.com/en , https://mymarketos.com/en/pricing , https://mymarketos.com/en/about , https://mymarketos.com/faq , https://mymarketos.com/sitemap.xml , https://mymarketos.com/en/resources/best-ai-marketing-tools-malaysian-smes-2026
- PostLa: https://postla-page.pages.dev/ , /features.html , /pricing.html , /contact.html
- Synova / Zynex AI: https://zynex-ai-v2.pages.dev/synova.html , https://zynex-ai-v2.pages.dev/blog/social-media-automation-sea.html
- Prism Reach: https://prismxtech.com/reach
- SleekFlow: https://sleekflow.io/en-my/pricing.md , https://sleekflow.io/ms-my , https://sleekflow.io/ , https://sleekflow.io/sitemap-index.xml
- respond.io: https://respond.io/pricing , https://respond.io/sitemap-index.xml
- Zoho Social: https://www.zoho.com/social/pricing.html (browser, Malaysian IP)
- Canva: https://www.canva.com/pricing/ (browser, Malaysian IP)
- Buffer: https://buffer.com/pricing (browser, Malaysian IP)
- Hootsuite: https://www.hootsuite.com/plans (browser, Malaysian IP)
- ManyChat: https://manychat.com/pricing (browser, Malaysian IP)
- AutoPost.id: https://autopost.id/
- Simplified BM page: https://simplified.com/ms/social-media-scheduler/facebook-pages
- Sendbird: https://sendbird.com/
- Google autocomplete: suggestqueries.google.com, gl=my, hl=en and hl=ms

Third-party (sourced):

- BSN grant page: https://www.bsn.com.my/page/MSMEMadani?lang=ms-MY
- Grant status: https://www.o2o.my/blog/geran-digital-pmks-madani-guide/ , https://einvoicingmalaysia.com/e-invoice-grant-malaysia
- Xwork roundup (2026-07-27): https://www.xwork.my/ai-marketing-tools-malaysia-2026/
- Agency price ranges: https://arto.com.my/social-media-agency-pricing-malaysia/
- SleekFlow pricing critique (eesel.ai, edited 2026-10-14): https://www.eesel.ai/blog/sleekflow-pricing
- respond.io HQ: https://respond.io/about (vendor page). A Wikipedia URL cited earlier (https://en.wikipedia.org/wiki/Gerardo_Salandra) returned 404 on 2026-11-12 and was removed.
- Meta scheduled-post bug thread: https://developers.facebook.com/community/threads/2615949408864549/
- FB group posting outside the API: https://marketingtoolsprohub.com/blogs/facebook-auto-poster/best-facebook-auto-poster-software-2026.html
- RecomN: https://apps.apple.com/my/developer/recomn/id1141029259 ; Oyen: https://digitalnewsasia.com/startups/malaysian-digital-first-pet-insurance-startup-oyen-raises-us420k-seed-funding ; Kommu: https://sgpgrid.com/company/kommu-sdn-bhd-ID0000
- FastSocial.ai BM page: https://fastsocial.ai/languages/malay

Unverified (fetch failed): MaticPost (https://maticpost.com/, HTTP 525 again on 2026-11-12), AgxSocial (https://agxsocial.agenx.id/, did not resolve again), G2 SleekFlow reviews (HTTP 403), Reddit (blocked for search), sgpgrid.com Kommu record (HTTP 403), relxlife.com (empty response).

**Verification pass, 2026-11-12.** Re-fetched every vendor page above (Zoho, Canva, Buffer, Hootsuite and ManyChat in a browser on a Malaysian IP), re-counted the Duta, MarketOS, SleekFlow and respond.io sitemaps, re-checked every quote at its URL, and re-ran 16 Google autocomplete seeds (gl=my). The web-search "who ranks" claims (Duta first for the ringgit question, no Duta backlinks, relxlife mirror pages) could **not** be re-run because the search budget for this pass was exhausted; they are marked unverified above. Siar claims were checked against `siar-truth.md`, `docs/pricing.md` and `apps/api/src/domain/plans.ts`.
