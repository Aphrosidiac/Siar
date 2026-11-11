# Siar competitor teardown: synthesis

Checked 2026-11-12. This file pulls together the 12 teardowns in `docs/seo/research/competitors/` (about 25 vendors) and
the keyword and market sweeps next to them. It does not redo them. Siar facts come only from
`docs/seo/research/siar-truth.md` and the code paths it names.

**Labels.** Every claim carries one:

- **[measured]**: a researcher fetched the page, file, sitemap or API on 2026-11-12 (in the teardowns, or in this pass).
- **[sourced]**: the vendor's own page, with URL, checked 2026-11-12.
- **[third-party]**: someone else's page (often a rival vendor). Treat it as a claim.
- **[inferred]**: our reading or arithmetic. Not proven.
- **[unverified]**: could not be confirmed.

**Re-checked in this pass (2026-11-12):** the machine-readable price lists of bundle.social, Zernio, Outstand and Ayrshare
were fetched again while writing this file. All four matched the teardowns [measured].

**Limits that apply to the whole file:**

1. **Rankings are mostly not measured.** The team's shared web-search budget ran out early on 2026-11-12. Only 17
   DuckDuckGo result lists and a few WebSearch lists were captured (`keywords/head-unified.md`), each once. So "keywords they
   own" below means **pages they target** (from their own titles and sitemaps), plus a ranking only where one was measured.
2. **Reddit, G2 and Capterra were unreachable** (403 or blocked). Complaints come from Trustpilot, AppSumo, GitHub
   issues and vendor docs. Reddit sentiment is unverified for every vendor.
3. **There is no keyword-volume data.** Demand notes come from Google autocomplete and from how many vendors build pages
   for a term [inferred].
4. **Vendor proof numbers** (customers, uptime, posts per day) are the vendors' own claims. None was verified.

Source files: `research/competitors/{bundle-social, ayrshare, late, upload-post, outstand, postiz, mixpost, buffer,
hootsuite-sprout, publer-metricool, others-dev-apis, my-sea-schedulers}.md`, `research/siar-truth.md`,
`research/current-site.md`, `research/keywords/*.md`, `research/market/*.md`.

---

## 0. The short version

1. **The field splits four ways** [inferred from titles and pricing]:
   - **Embeddable developer APIs:** bundle.social, Ayrshare, Zernio (formerly Late), Outstand, Upload-Post, Postproxy,
     Post for Me, SocialAPI.ai, WoopSocial. These sell what Siar sells.
   - **Agent and creator tools with an API:** Blotato, Postiz, Mixpost. Most of their users post to their own accounts.
   - **Dashboards with an API bolted on:** Buffer, Hootsuite, Sprout Social, Publer, Metricool. Their APIs act on the
     customer's own account. None lets your customers connect accounts inside your product.
   - **Malaysian and ringgit-priced tools:** Duta, Zoho Social, MarketOS, PostLa, Synova. Duta is a direct analogue and
     launched first.
2. **Siar's one structural edge is the billing unit.** Most rivals charge per account, per channel, per profile, per seat
   or per delivered post. Siar charges per organization, fenced by brands and posts. That wins clearly from about 10 brands
   with several accounts each, against Ayrshare, Zernio, Buffer, Publer, Hootsuite, Sprout and Blotato [inferred
   arithmetic, section 2c]. **It is not unique:** bundle.social, SocialAPI.ai and Postproxy bill per organization or per
   brand too, and Outstand counts no accounts at all [sourced].
3. **Siar is not the cheapest at the bottom.** For one brand: Zernio is free for 1–2 accounts, Post for Me is $10, Publer's
   API is $10 and WoopSocial's free plan has unlimited posts [sourced]. For 2–75 clients, Upload-Post is cheaper
   [sourced + inferred]. At 10 brands, SocialAPI.ai is $29 against Siar Pro $49 [sourced]. Never use "cheapest".
4. **Network coverage is Siar's biggest weakness.** Siar publishes to 9 networks today. Every serious rival sells live
   TikTok, public YouTube, Pinterest, LinkedIn company pages and usually Google Business [sourced; their approvals not
   independently verified]. Siar must not contest network breadth in any comparison.
5. **Siar's live network edge is narrow and real:** Discord, Slack and Mastodon. Only bundle.social, Upload-Post and
   Postiz list all three [sourced]. Ayrshare, Zernio (no Mastodon), Outstand, Blotato, Postproxy, Post for Me,
   SocialAPI.ai, WoopSocial, Buffer and Publer (Mastodon only), Mixpost (Mastodon only), Hootsuite, Sprout and Metricool
   do not.
6. **Siar's honest technical edges** (all in code, siar-truth §4): signed webhooks retried over about 45 hours with a
   delivery log and resend; verbatim network errors with public per-network error pages; validation at create time;
   never-post-twice claiming; API on every plan, Free included; one post to many networks counts once; X at X's own USD
   price without the customer's own X developer app; a branded connect link on every plan; ringgit with FPX/DuitNow
   pay-once yearly; a price lock.
7. **Where Siar is behind on developer tooling:** its SDK, CLI and MCP are not on npm (404). Ayrshare, Zernio, Upload-Post,
   Outstand, Postiz, Buffer, Publer, Metricool, Blotato, Postproxy, SocialAPI.ai, WoopSocial and Duta all run a **hosted** MCP
   server today [sourced]. Siar's is local stdio and unpublished. Every MCP comparison is blocked until npm publish.
8. **SEO: everyone else already has the page types Siar lacks.** Comparison and alternatives pages (Postiz 676, Blotato
   ~90, Zernio 47, Ayrshare 26, Upload-Post 26, bundle.social 32), per-network MCP pages, and agent-client pages. Siar has
   0 comparison pages and 0 MCP pages [measured]. Siar's error-reference set (15 pages, 147 codes) is the one family where
   it is level or ahead: only bundle.social (14), Ayrshare (30) and Zernio (12) have one [measured].
9. **Nobody has written about Siar.** "siaran" appears 0 times in every roundup and rival comparison page checked
   [measured]. Siar is in no MCP directory and no review directory [measured].
10. **The best openings are thin, specific terms** [inferred from autocomplete + rival page counts]: "[dashboard brand]
    api pricing / alternative" (Hootsuite, Sprout, Metricool, Publer, Buffer), "Postiz API rate limit", a
    per-organization pricing explainer, Discord/Slack/Mastodon posting APIs, and "switch from bundle.social" (parked).
11. **Fix Siar's own site before publishing any comparison.** The live site over-claims in 29 places (siar-truth §6),
    including TikTok, LinkedIn company pages and Google Business shown as "Posted" on the home page. A comparison that
    calls out rivals for selling Reddit while it returns 503 cannot run next to a home page that shows a Google Business
    post that cannot happen.

---

## 1. Who is in the field

| Tier | Vendor | Domain | HQ / entity | Founded | Billing unit | Teardown |
|---|---|---|---|---|---|---|
| Embeddable API | bundle.social | bundle.social | BUNDLE SP. Z O.O., Poland [measured] | PH launch Dec 2024 [sourced] | per organization | `bundle-social.md` |
| Embeddable API | Ayrshare | ayrshare.com | saas.group since Oct 2025 [sourced] | 2020 [sourced] | per social profile | `ayrshare.md` |
| Embeddable API | Zernio (was Late, getlate.dev) | zernio.com | ZERNIO SOFTWARE S.L., Girona, Spain [sourced] | 2025 [sourced] | per connected account | `late.md` |
| Embeddable API | Upload-Post | upload-post.com | TONVI TECH SL, Málaga, Spain [sourced] | Jan 2025 [sourced] | per profile | `upload-post.md` |
| Embeddable API | Outstand | outstand.so | two founders from ScheduleThreads [sourced] | Oct 2025 [sourced] | per delivered post | `outstand.md` |
| Embeddable API | Postproxy | postproxy.dev | Berlin [measured] | 2026 [measured] | per profile / profile group | `others-dev-apis.md` §3 |
| Embeddable API | Post for Me | postforme.dev | Day Moon Development [measured] | 2024 [measured] | per successful post | `others-dev-apis.md` §4 |
| Embeddable API | SocialAPI.ai | social-api.ai | EP ENTREPRISE, France, solo founder [sourced] | 2026 [measured] | per brand | `others-dev-apis.md` §5 |
| Embeddable API | WoopSocial | woopsocial.com | WoopSocial LTD [measured] | 2026 (repos) [measured] | per account band | `others-dev-apis.md` §6 |
| Agent/creator tool | Blotato | blotato.com | Blotato Inc., Salt Lake City [measured] | 2024 [measured] | per account band | `others-dev-apis.md` §2 |
| Agent/creator tool | Postiz | postiz.com | Gitroom Ltd (HK) / Gitroom LLC (DE) [sourced] | repo 2023 [measured] | per org, capped by channels | `postiz.md` |
| Agent/creator tool | Mixpost | mixpost.app | INOVECTOR DIGITAL S.R.L., Moldova [sourced] | repo 2022 [measured] | licence once, or Cloud per workspace + channels | `mixpost.md` |
| Dashboard + API | Buffer | buffer.com | open company, since 2010 [sourced] | 2010 | per channel | `buffer.md` |
| Dashboard + API | Hootsuite | hootsuite.com | — | "18 years" [sourced] | per user seat | `hootsuite-sprout.md` |
| Dashboard + API | Sprout Social | sproutsocial.com | public company [sourced] | — | per seat | `hootsuite-sprout.md` |
| Dashboard + API | Publer | publer.com | Kalemi, Tirana [measured] | "14+ years" [sourced] | per account + member | `publer-metricool.md` |
| Dashboard + API | Metricool | metricool.com | METRICOOL SOFTWARE [measured] | — | per brand | `publer-metricool.md` |
| Malaysia | Duta | getduta.com | Baloot MY Digital Agency, Kota Bharu [measured] | public by Aug 2026 [inferred] | one plan per user | `my-sea-schedulers.md` §2 |
| Malaysia (ringgit) | Zoho Social | zoho.com/social | Zoho | — | per brand + member | `my-sea-schedulers.md` §7 |
| Malaysia | MarketOS, PostLa, Synova, Prism Reach | various | KL / JB | 2025–26 | per channel / account | `my-sea-schedulers.md` §3–5 |

**Seen ranking but not torn down** [measured once on DuckDuckGo, `keywords/head-unified.md`; unverified on re-check]:
PostPeer (postpeer.dev, #2 on 9 of 17 head terms), Publora (#1 for "social media publishing api" and "social media
scheduling api"), postwire.io (#1 "post to multiple social networks api", first captured 2026-10-03) and crosspostapi.com.
They are new domains that rank on Bing/DDG within weeks. **Gap: tear these four down next.**

**Not competitors** (named in the brief, checked): Kommu (driving assist), RecomN (home services), Oyen (pet insurance),
Sendbird (chat API) [sourced/measured, `my-sea-schedulers.md` §1d]. Data and scraping APIs (Data365, Phyllo, Social
Fetch, EnsembleData) share the keyword "social media API" but do not publish [sourced, `others-dev-apis.md` §1].

---

## 2. Comparison tables (all cells checked 2026-11-12)

Each cell links the vendor page it came from. Siar cells cite the code or doc named in `siar-truth.md`. "Listed" means
the vendor's own page lists a network; whether that vendor has passed the network's own review was not verified.

### 2a. Pricing

**Scenario used for the "10 brands / 50 accounts" column** [inferred workload]: 10 client brands, 5 connected accounts
each on 5 different networks (50 accounts), 1,000 posts a month, each post sent to its brand's 5 accounts (5,000
deliveries), API access needed, billed monthly in USD unless noted. Siar fits this on Pro because each brand holds at most
one account per network (`apps/api/prisma/schema.prisma` header).

| Vendor | Pricing model | Entry paid price | 10 brands / 50 accounts | Free tier |
|---|---|---|---|---|
| **Siar** | Per organization; fenced by brands and posts; no account count, but one account per network per brand ([plans.ts](https://siaran.my/pricing), `schema.prisma`) | Starter $19 / RM39, 1 brand, 300 posts ([pricing](https://siaran.my/pricing)) | **Pro $49 / RM99** (10 brands, 10,000 posts) ([pricing](https://siaran.my/pricing)) | 20 free posts to try, one-time, no card, 1 brand, no analytics ([pricing](https://siaran.my/pricing)) |
| bundle.social | Per organization; a team holds one account per network; unlimited teams on paid ([pricing.md](https://bundle.social/pricing.md)) | Pro $100 ($90 yearly), 10,000 posts, 14-day trial ([pricing.md](https://bundle.social/pricing.md)) | Pro $100 ([pricing.md](https://bundle.social/pricing.md)) | $0, 20 posts **per month**, 3 teams, no analytics ([pricing.md](https://bundle.social/pricing.md)) |
| Ayrshare | Per social profile (customer, brand or location) ([pricing](https://www.ayrshare.com/pricing/)) | Premium $149 ($129 yearly), 1 profile ([pricing](https://www.ayrshare.com/pricing/)) | Launch $299 (up to 10 profiles) ([pricing](https://www.ayrshare.com/pricing/)) | None; 28-day trial on Launch only ([pricing.md](https://www.ayrshare.com/pricing.md)) |
| Zernio | Per connected account, graduated: 1–2 free, 3–10 $6, 11–100 $3, 101+ $1 ([pricing.md](https://zernio.com/pricing.md)) | $6 per account from the 3rd ([pricing.md](https://zernio.com/pricing.md)) | $168 = 8×$6 + 40×$3 [inferred from the ladder] ([pricing.md](https://zernio.com/pricing.md)) | First 2 accounts, ongoing, unlimited posts, full API ([pricing.md](https://zernio.com/pricing.md)) |
| Upload-Post | Per profile; one account per network per profile ([pricing](https://www.upload-post.com/pricing/)) | Basic $24 ($16 yearly), 5 profiles ([pricing](https://www.upload-post.com/pricing/)) | $39 = Basic + 5-profile pack $15; $50 Professional with white-label ([pricing](https://www.upload-post.com/pricing/)) | 10 uploads a month, recurring, 2 profiles, no TikTok ([pricing](https://www.upload-post.com/pricing/)) |
| Outstand | Per delivered post (one post to 3 accounts = 3) ([pricing.md](https://www.outstand.so/pricing.md)) | $19, 3,000 deliveries ([pricing.md](https://www.outstand.so/pricing.md)) | $33 (vendor's own example for 5,000) ([pricing.md](https://www.outstand.so/pricing.md)) | None: "not free and has no permanently free tier" ([pricing.md](https://www.outstand.so/pricing.md)) |
| Postproxy | Per profile (Agentic) or per profile group (Business) ([pricing](https://postproxy.dev/pricing/)) | Agentic $17, 5 profiles ([pricing](https://postproxy.dev/pricing/)) | Business $49 (20 groups) ([pricing](https://postproxy.dev/pricing/)) | 10 posts a month, no card ([pricing FAQ](https://postproxy.dev/pricing/)) |
| Post for Me | Per successful post; unlimited accounts ([pricing](https://www.postforme.dev/pricing)) | $10 for 1,000 posts ([pricing](https://www.postforme.dev/pricing)) | $10 if a post counts once, $50 if each account counts [unverified unit] ([pricing](https://www.postforme.dev/pricing)) | None ([pricing](https://www.postforme.dev/pricing)) |
| SocialAPI.ai | Per brand; one account per platform per brand ([pricing](https://social-api.ai/pricing)) | Side Hustle $29, 10 brands ([pricing](https://social-api.ai/pricing)) | $29 ([pricing](https://social-api.ai/pricing)) | Hobby: 2 brands, 10 posts a month ([pricing](https://social-api.ai/pricing)) |
| WoopSocial | Per account, stackable bands ([pricing](https://woopsocial.com/pricing)) | Pro $19, 20 accounts ([pricing](https://woopsocial.com/pricing)) | Business $49 (100 accounts) ([pricing](https://woopsocial.com/pricing)) | 2 accounts, unlimited posts, API + MCP ([pricing](https://woopsocial.com/pricing)) |
| Blotato | Per account band 20/40/100 ([pricing](https://www.blotato.com/pricing)) | Starter $29, 20 accounts ([pricing](https://www.blotato.com/pricing)) | Agency $499 (Creator stops at 40) ([pricing](https://www.blotato.com/pricing)) | None; trial excludes the API ([pricing](https://www.blotato.com/pricing)) |
| Postiz | Per org, capped by channels (each account = 1) ([pricing](https://postiz.com/pricing)) | Standard $29, 5 channels ([pricing](https://postiz.com/pricing)) | Ultimate $99 (100 channels; Pro stops at 30) ([pricing](https://postiz.com/pricing)) | None on cloud; 7-day trial; self-host free (AGPL) ([plans](https://docs.postiz.com/cloud/plans)) |
| Mixpost | Licence once (self-host) or Cloud per workspace + channel cap ([pricing](https://mixpost.app/pricing), [cloud](https://mixpost.app/cloud)) | Cloud Spark $29 (no API); API from Momentum $49; Pro licence $299 once ([cloud](https://mixpost.app/cloud)) | Cloud Agency $149 (180 channels; Business stops at 48) ([cloud](https://mixpost.app/cloud)) | Lite self-host (FB Pages, X, Mastodon); Cloud trial needs a card ([pricing](https://mixpost.app/pricing)) |
| Buffer | Per channel ([pricing.md](https://buffer.com/pricing.md)) | Essentials $6/channel ($5 yearly) ([pricing.md](https://buffer.com/pricing.md)) | Essentials $195, Team $255 (vendor's 50-channel example) ([pricing.md](https://buffer.com/pricing.md)) | 3 channels, 10 queued posts each, API included ([pricing.md](https://buffer.com/pricing.md)) |
| Hootsuite | Per user seat; Standard capped at 10 accounts ([plans](https://www.hootsuite.com/plans)) | Standard $99/user, annual ([plans](https://www.hootsuite.com/plans)) | Professional $199/user, annual, 1 seat; monthly price script-rendered [unverified] ([plans](https://www.hootsuite.com/plans)) | None; 14-day trial ([plans](https://www.hootsuite.com/plans)) |
| Sprout Social | Per seat; 5 profiles on the two lowest tiers ([pricing](https://sproutsocial.com/pricing/)) | Essentials $79/seat annual, $99 monthly ([pricing](https://sproutsocial.com/pricing/)) | API needs Advanced: $499/seat monthly, $399 annual ([pricing](https://sproutsocial.com/pricing/)) | None; 30-day trial, no card ([pricing](https://sproutsocial.com/pricing/)) |
| Publer | Per account + per member; every 10th free ([plans](https://publer.com/plans)) | Professional $5 (no API); API from Business $10 ([plans](https://publer.com/plans)) | Business $252/mo billed yearly [measured]; about $315 monthly [inferred from its formula] ([plans](https://publer.com/plans)) | 3 accounts, no X, no API ([plans](https://publer.com/plans)) |
| Metricool | Per brand; one profile per network per brand ([pricing](https://metricool.com/pricing/)) | Starter $25 (5 brands, no API); API from Advanced $67 ([pricing](https://metricool.com/pricing/)) | Advanced $67 monthly / $53 yearly, + $10 per X account ([pricing](https://metricool.com/pricing/)) | 1 brand, 20 posts a month, no LinkedIn or X ([pricing](https://metricool.com/pricing/)) |
| Duta | One plan, every channel ([pricing](https://getduta.com/pricing)) | RM99 / RM990 yearly; X capped at 300 a month ([pricing](https://getduta.com/pricing)) | RM99, but no brands or teams at all ([pricing](https://getduta.com/pricing)) | None; 7-day trial, card required ([pricing](https://getduta.com/pricing)) |
| Zoho Social | Per brand + per member, ringgit in MY ([pricing](https://www.zoho.com/social/pricing.html)) | Standard RM60 monthly / RM40 yearly, 1 brand ([pricing](https://www.zoho.com/social/pricing.html)) | Agency RM1,280 monthly / RM920 yearly (10 clients) ([pricing](https://www.zoho.com/social/pricing.html)) | 1 brand, 6 channels ([pricing](https://www.zoho.com/social/pricing.html)) |

### 2b. Capabilities

| Vendor | Networks | MCP | White-label / hosted connect | Webhooks | Comments / DMs (API) | Analytics | Self-host |
|---|---|---|---|---|---|---|---|
| **Siar** | Publishes to 9 today: FB, IG, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack. YouTube uploads stay private until audit. Built for 15 (siar-truth §1a, §2) | Local stdio, 19 tools, **not on npm** (`packages/mcp`) | Branded link (name, logo, colour) on app.siaran.my, "Powered by Siar", English only. **Not white-label** (`Portal.vue` line 96) | 16 HMAC events, 7 retries over ~45 h, log, resend, managed in the API; max 5/org (`engine/webhooks.ts`) | Comments on 8 networks; FB + IG DMs in beta, off by default (`messaging-shared.ts`) | Paid plans (`content-analytics.ts`) | No |
| bundle.social | 15 listed, same list as Siar ([home](https://bundle.social/)) | Local stdio only; hosted "on the roadmap" ([docs](https://info.bundle.social/llms.txt)) | `create-portal-link` with `hidePoweredBy`, `logoUrl` ([OpenAPI](https://api.bundle.social/swagger-json)) | HMAC, 3 attempts, 5/org, dashboard only ([docs](https://info.bundle.social/llms.txt)) | Comments yes; IG + Messenger DMs on request ([pricing.md](https://bundle.social/pricing.md)) | Paid plans, 24 h refresh ([home](https://bundle.social/)) | No |
| Ayrshare | 13 publishing + WhatsApp beta; no Mastodon, Discord, Slack ([networks](https://www.ayrshare.com/supported-networks/)) | Hosted, 27 or 33 tools (pages disagree) ([ai-agent](https://www.ayrshare.com/ai-agent/)) | Hosted linking page with logo/colours; full CSS needs Max Pack $300/mo ([connect](https://www.ayrshare.com/connect/)) | HMAC optional, retried ~16 h ([docs](https://www.ayrshare.com/docs/apis/webhooks/overview)) | Comments yes; DMs FB, IG, X ([docs](https://www.ayrshare.com/docs/apis/messages/overview)) | Basic / advanced by plan ([pricing](https://www.ayrshare.com/pricing/)) | No |
| Zernio | 18 claimed; Reddit returns 503, Snapchat closed beta; no Mastodon ([llms.txt](https://zernio.com/llms.txt)) | Hosted, 496 tools, official registry ([llms.txt](https://zernio.com/llms.txt)) | Hosted, headless, BYO OAuth app, branded welcome ([OpenAPI](https://zernio.com/openapi.json)) | HMAC, 158 events, 50 endpoints, redeliver ([OpenAPI](https://zernio.com/openapi.json)) | Comments on 8; DMs on 9 incl. WhatsApp ([llms.txt](https://zernio.com/llms.txt)) | Every account ([pricing.md](https://zernio.com/pricing.md)) | No |
| Upload-Post | 22 listed; Reddit returns 503 ([llms.txt](https://www.upload-post.com/llms.txt)) | Hosted, OAuth, 40 or 50 tools ([mcp](https://www.upload-post.com/mcp/)) | Hosted on their domain, their button colour, a fixed privacy box ([whitelabel](https://www.upload-post.com/whitelabel/)) | HMAC, 6 events, **one attempt, no retry** ([docs](https://docs.upload-post.com/api/webhooks)) | Comments on 8; DMs Instagram ([llms.txt](https://docs.upload-post.com/llms.txt)) | 11 networks ([docs](https://docs.upload-post.com/llms.txt)) | MCP only |
| Outstand | 12; X, GBP, Vimeo, Reddit need your own app ([facts](https://www.outstand.so/facts)) | Hosted, 30 tools ([mcp](https://www.outstand.so/mcp)) | Build-it-yourself flow; BYOK puts your name on consent ([white-label](https://www.outstand.so/white-label-social-media-management)) | HMAC only if a secret is set ([llms.txt](https://www.outstand.so/llms.txt)) | Comments most networks; DMs IG, FB, X ([home](https://www.outstand.so/)) | Yes ([llms.txt](https://www.outstand.so/llms.txt)) | No |
| Postproxy | 12 incl. Telegram, WhatsApp; no Mastodon, Discord, Slack ([llms.txt](https://postproxy.dev/llms.txt)) | Hosted ([llms.txt](https://postproxy.dev/llms.txt)) | Neutral "Social Media Linker" app, or BYO keys ([white-label](https://postproxy.dev/white-label/)) | HMAC ([llms.txt](https://postproxy.dev/llms.txt)) | Comments IG, FB, Threads, Bluesky; DMs on 5 ([llms.txt](https://postproxy.dev/llms.txt)) | Yes | No |
| Post for Me | 9; claims TikTok audit, LinkedIn pages, Pinterest, YouTube review ([access](https://www.postforme.dev/resources/quickstart-api-access-level)) | Local, 2 tools ([docs](https://www.postforme.dev/resources/ai-integration-using-the-mcp-server)) | Quickstart shows "Post for Me"; White Label uses your own credentials ([home](https://www.postforme.dev/)) | Yes, connections + post status ([home](https://www.postforme.dev/)) | None | Post metrics ([pricing](https://www.postforme.dev/pricing)) | Yes, AGPL |
| SocialAPI.ai | 13; X needs your own X app ([docs](https://docs.social-api.ai/llms.txt)) | Hosted, 75+ tools ([home](https://social-api.ai/)) | Not found | Signed, retried, on every plan ([pricing](https://social-api.ai/pricing)) | Comments, DMs, mentions, reviews ([home](https://social-api.ai/)) | Yes | No |
| WoopSocial | 9 ([llms.txt](https://woopsocial.com/llms.txt)) | Hosted ([server card](https://woopsocial.com/.well-known/mcp/server-card.json)) | Unbranded OAuth URL from the API ([llms.txt](https://woopsocial.com/llms.txt)) | Register/list/delete; signing not stated [unverified] | None | Partial; none for X or LinkedIn profiles ([llms.txt](https://woopsocial.com/llms.txt)) | No |
| Blotato | 9 ([llms.txt](https://www.blotato.com/llms.txt)) | Hosted ([mcp](https://www.blotato.com/mcp)) | None; built for own accounts ([home](https://www.blotato.com/)) | Mentioned, no event list [unverified] | IG + FB only ([llms.txt](https://www.blotato.com/llms.txt)) | 8 networks, none for LinkedIn ([llms.txt](https://www.blotato.com/llms.txt)) | No |
| Postiz | 30+ (35 rows in docs) ([docs](https://docs.postiz.com/general/platforms/overview)) | Hosted, OAuth ([docs](https://docs.postiz.com/mcp/introduction)) | Invite links into your org; white-label Enterprise "not accepting new applications" ([enterprise](https://postiz.com/enterprise)) | Publish only; no signature or retry documented ([docs](https://docs.postiz.com/general/automations/webhooks)) | No comment reading, no DMs ([docs](https://docs.postiz.com/general/agents)) | 11 platforms ([docs](https://docs.postiz.com/general/analytics)) | Yes, AGPL-3.0 |
| Mixpost | Pro 12 (your own approvals); Cloud 11, no X; no Discord, Slack ([cloud](https://mixpost.app/cloud)) | Built in, 31 tools, Momentum+ ([docs](https://docs.mixpost.app/mcp/tools)) | No connect API; Enterprise licence resells as your own SaaS ([pricing](https://mixpost.app/pricing)) | 8 events, 3 attempts, secret optional ([docs](https://docs.mixpost.app/webhooks/)) | Inbox in dashboard only; none in API | Yes | Yes |
| Buffer | 11–12 incl. TikTok, YouTube Shorts, Pinterest, LinkedIn Pages, GBP, Mastodon ([home](https://buffer.com/)) | Hosted, OAuth ([docs](https://developers.buffer.com/llms.txt)) | None: your users need Buffer accounts ([docs](https://developers.buffer.com/llms.txt)) | None documented ([docs](https://developers.buffer.com/llms.txt)) | None in the API ([api](https://buffer.com/api)) | Personal keys only ([docs](https://developers.buffer.com/llms.txt)) | No |
| Hootsuite | 9 in the app; API publishing excludes TikTok, YouTube, Bluesky ([docs](https://developer.hootsuite.com/llms.txt)) | Perch drafts only, Nest no replies ([mcp](https://www.hootsuite.com/integrations/mcp)) | None | 4 types, no documented signing ([docs](https://developer.hootsuite.com/llms.txt)) | Comment approvals; care-desk inbox APIs | Analytics API needs an Enterprise add-on | No |
| Sprout Social | 11 + Messenger, WhatsApp ([integrations](https://sproutsocial.com/integrations/)) | ChatGPT only, TikTok data only, read-only ([help](https://support.sproutsocial.com/hc/en-us/articles/41236268336653)) | None | None documented ([docs](https://api.sproutsocial.com/docs/)) | Read-only messages; publishing is drafts only ([docs](https://api.sproutsocial.com/docs/)) | Yes, the API's purpose | No |
| Publer | 13 incl. Mastodon, Telegram, WordPress; no Discord, Slack ([plans](https://publer.com/plans)) | Hosted, Business+ ([help](https://publer.com/help/en/article/how-to-set-up-and-use-publers-mcp-server-14orlq0/)) | None; accounts read-only in the API ([docs](https://publer.com/docs/llms.txt)) | None documented ([docs](https://publer.com/docs/llms.txt)) | None in the API | Business plan | No |
| Metricool | ~11 + ads; no Mastodon, Discord, Slack ([pricing](https://metricool.com/pricing/)) | Hosted, every plan incl. Free ([mcp](https://metricool.com/metricool-mcp-claude/)) | Connect-link API for Integrators (Custom), on mtr.cool ([help](https://help.metricool.com/wli-brand-connections-panel-for-end-clients-through-api-4m5b3)) | None outbound ([swagger](https://app.metricool.com/api/swagger.json)) | Comments of the 50 latest posts; inbox routes | Deep, 79 stats operations | No |
| Duta | 7 live; TikTok, Pinterest, YouTube, GBP shown "waiting for approval" ([llms.txt](https://getduta.com/llms.txt)) | Hosted connector ([how-to-use](https://getduta.com/how-to-use)) | None | None | None | None | No |
| Zoho Social | Not checked in the teardown | Not checked | Not checked | Not checked | Inbox on Premium ([pricing](https://www.zoho.com/social/pricing.html)) | Yes | No |

### 2c. What the tables say [inferred]

- **Siar Pro at $49 is the cheapest listed price in the 10 brands / 50 accounts scenario among vendors that let your
  customers connect inside your product, except** Upload-Post ($39), SocialAPI.ai ($29), Outstand ($33 at this volume) and
  Post for Me ($10–50). It ties Postproxy and WoopSocial ($49). It is well under bundle.social ($100), Zernio ($168),
  Ayrshare ($299) and Blotato ($499).
- **Against dashboards with APIs the gap is large:** Buffer $195, Publer about $315, Hootsuite $199 per seat, Sprout $499
  per seat for the API tier, Zoho RM1,280. But those products include analytics depth, listening, approvals and ads that
  Siar does not have. Compare API to API, not app to app.
- **Siar wins at SaaS scale.** At 500 customer brands and 20,000 posts a month, Siar Business is $149, tied with Post for
  Me ($150), against Postproxy about $734 and WoopSocial $799 (`others-dev-apis.md` §8). At 1,000 accounts Zernio is
  $1,218 by its own example [sourced].
- **Siar loses on post volume.** Ayrshare, Zernio, Upload-Post, Postiz, Postproxy, SocialAPI.ai paid plans and WoopSocial
  sell unlimited posts. Siar caps posts per month (300 / 10,000 / 100,000). Every comparison must say so.
- **The hidden cap on Siar.** One account per network per brand means Free and Starter reach at most 15 accounts and Pro
  150. "Unlimited accounts on every plan" is literally true only on Business and Enterprise (section 7, decision 1).

---

## 3. Positioning lines and hero copy

All copy quoted from the vendor's own home page, checked 2026-11-12 [measured]. "Positioning" is our one-line reading
[inferred].

| Vendor | Home `<title>` | Hero H1 / subhead (quoted) | Proof they show (their claims, unverified) | Positioning [inferred] |
|---|---|---|---|---|
| bundle.social | "Unified Social Media API, Unlimited Social Accounts" | "One unified social media API. No account limits." / "Publish, schedule, manage comments, and track analytics across 15 platforms…" | "16,454+ customers · 838k+ connected accounts · 99.881% uptime · 4.7/5 on Trustpilot"; 3 Trustpilot quotes; no logos | Per-org, unlimited accounts, for SaaS and agents; tells solo makers to go elsewhere |
| Ayrshare | "Unified Social Media API for 14+ Networks" | "Unified Social Media API for Posting, Scheduling, Analytics, and AI Agents" / "…ship in days, not quarters." | ">99.99% uptime", "30M+ API calls per day", "10,000+ Teams", Quso.ai and Digible quotes | The compliant incumbent, now leaning on AI agents |
| Zernio | "Zernio - Marketing Infrastructure for Agents" | "Marketing infrastructure for agents" / "Give your product or agent a way to reach customers anywhere. Skip months of platform approvals and go live today." | "200,000+ builders", Warner Music, ClickUp, RE/MAX logos, Guillermo Rauch quote, SOC 2 badge, "99.97% uptime" | Approvals already done; social plus ads, WhatsApp, SMS, calls |
| Upload-Post | "Social Media API - Post Everywhere Easily \| Upload-Post" | "Social Media API / One Call, Every Platform" / "No developer app. No tokens. Two clicks." | "13,190,556+" posts, "111,142+" users, "4.9/5" from 112 self-hosted reviews, Buffer's "one of the strongest newcomers" | Cheap flat-price uploader for creators and n8n builders |
| Outstand | "Outstand - Unified Social Media API for AI Agents" | "Stop building 12 integrations. Build one." | 27 logo names, "12.8M+ posts / month", "99.92% uptime", no testimonials | A metered pipe for agents; candid tone |
| Postproxy | "Postproxy — Social Media API for Agencies, SaaS & AI Agents" | "Social media API and MCP for agents and apps" | "SOC 2 Type II certified" (its own llms.txt says audit in progress), 20 small logos, "99.97% uptime" | Embed the full social workflow in your SaaS, Europe-hosted |
| Post for Me | "Post for Me – Unified Social Media Posting API" | "Ship social media integrations for your [product…] in hours, not weeks." | None visible; JSON-LD carries a 4.8/127 rating with no reviews on the page | Cheap, open-source, per-post |
| SocialAPI.ai | "Unified Social Media API for AI Agents & Developers \| SocialAPI.ai" | "The unified social media API to publish and reply." | None; the founder's GitHub | Inbox-first API, per brand |
| WoopSocial | "WoopSocial - Unified Social Media API & MCP for AI Agents" | "Build any integration or automation for social posting for AI agents" | 4 first-name quotes; "Guaranteed lowest per-profile pricing in the world" | Cheapest per account |
| Blotato | "Blotato \| #1 Social Media APIs for AI Agents, ChatGPT, & Claude" | "Social Media Automation Inside ChatGPT & Claude" | "667K+ posts published last month", Trustpilot 4.8 (384), founder's audience | Creator tool with an API, sold through the founder |
| Postiz | "Postiz: The Agentic Social Media Scheduling Platform" | "Run your social media on autopilot with AI agents" (agent name rotates) | 17 X posts, Product Hunt badge; no numbers | Open-source scheduler that agents drive |
| Mixpost | "Mixpost: Open Source, Self-Hosted Social Media Management" | "Open source social media management you own" | "1,000+ Businesses Worldwide", "x2 More Affordable" | Own it: your server, pay once (Cloud now the main CTA) |
| Buffer | "Buffer: Social media management for everyone" | (visible H2) "Your social media workspace"; /api: "Build any automation for social" | 339,201 MAU, 86,380 customers, $28.3M ARR, Metallica/Wired logos | The friendly app; API for people who already use Buffer |
| Hootsuite | "Social Media Marketing and Management Tool \| Hootsuite" | "Social can be chaotic… Hootsuite keeps you calm." | "18 years and 25 million users", "G2's #1", Fortune-1000 counts (600+ vs 800+) | Enterprise dashboard, going "headless" via MCP |
| Sprout Social | "Sprout Social: Social Media Management Tool" | "Powerful tools for social media management" | "30,000+ brands", G2 badge, ScottsMiracle-Gro quote | Enterprise dashboard; API is a reporting feed |
| Publer | "Powerful Social Media Management & Scheduling Tools \| Publer" | "Streamline Your Social Media & Get Real Results" | "500K+ happy users", 6 named testimonials | SMB scheduler; API for your own workspace on Business |
| Metricool | "METRICOOL ▷ Social Media Management Tool" | "Everything flows better when your content, data, and team are all in the same tab" | "4 million professionals", G2 badges | Analytics-led scheduler with a free MCP |
| Duta | "Duta: the social media scheduler built in Malaysia · Duta" | "write a post once." / "yes, once. not six times." | None; honesty is the proof ("Built, waiting for approval") | "The first social media scheduling tool built in Malaysia", billed in ringgit |
| **Siar (today)** | "Siar \| Write it once…" (no category keyword, `current-site.md`) | "Write it once. Siar it everywhere." | None allowed (siar-truth §5) | Per-organization API + dashboard, ringgit option |

**Patterns** [inferred]:

- Almost every API vendor's title now says "for AI agents". The phrase no longer differentiates.
- "Skip the app review" is the most repeated promise (Zernio, Upload-Post, Outstand, bundle.social's
  `/meta-app-review-rejected`). Siar can say it only for Meta, X, LinkedIn profiles and the review-free networks.
- Proof is almost all self-reported (counts, uptime, SOC 2) and often self-contradicting: Ayrshare (50K vs 20K posts a
  day), Zernio (16 vs 18 networks; 99.97% vs 99.7%), Outstand (12 vs 14 vs 10 networks), Postproxy (SOC 2 certified vs in
  progress), Upload-Post (40 vs 50 MCP tools), Buffer (10/11/12/14 networks). Siar has no proof numbers and must not
  invent any. Its proof is checkable artefacts: the OpenAPI document, the generated network and error pages, the webhook
  event list and the price list.

---

## 4. SEO footprint and keywords

### 4a. Size and page types [measured from sitemaps, 2026-11-12]

| Vendor | Indexable URLs (site + docs) | Compare / alternatives | Per-network API pages | Error-code pages | MCP / agent pages | Other programmatic | llms.txt / AI bots |
|---|---|---|---|---|---|---|---|
| **Siar** | 89 (about 32 in Google) | **0** | 15 | 15 (147 codes) | **0** | 25 API-reference tags | llms.txt, pricing.md |
| bundle.social | 291 + 303 | 22 alt + 10 vs | 15 API + 15 scheduler | 14 + hub | MCP, CLI, Claude Code, Cursor pages | ~60 feature-API pages, 31 tools, 44-term glossary | yes |
| Ayrshare | 273 + 2,488 (8 languages) | 26 | 11 | 30 (`/solutions/`) | /ai-agent, Claude Code plugin | `.md` copy of every page | yes, AI bots allowed by name |
| Zernio | 524 + 1,844 | 24 + 23 posts | 26 | 12 | 7 network MCP + 8 agent pages | 67 phone-number countries | yes |
| Upload-Post | 3,146 (298 English, 14 locales) + 94 | 26 + 9 pricing | 12 guides + 23 upload pages | 0 on the site | 23 MCP + 22 Claude skill + 21 assistant | 62 n8n pages, 34 how-tos | yes |
| Outstand | 325 | 5 + ~15 posts | 10 | 0 (known-issues docs) | 9 MCP + 7 AI-client | /facts page, ai-catalog.json | yes, strongest GEO setup |
| Postiz | 1,215 + ~400 blog + 173 docs | 631 compare + 45 alt | 0 (30 scheduler pages) | 0 | 225 agent × network | 249 free tools | yes |
| Mixpost | 54 + 213 | 0 | 0 (12 scheduler pages) | 0 | /mcp, /agents | — | no |
| Buffer | ~3,454 | 10 cards + 11 vs posts | 0 (12 scheduler pages) | 0 | /mcp | 104 glossary, 27 tools, 2,425 posts | dev portal only |
| Hootsuite | 4,048 + 1,948 blog | 8 vs | 9 (scheduler) | 0 | /integrations/mcp | 274 glossary, 37 tools | yes |
| Sprout Social | 113 (incomplete) + 1,339 blog | 26 alt + 19 vs | 0 | 0 | — | 129 glossary, 53 influencer pages | yes |
| Publer | 8,740 (7 languages) | 7 vs + 7 alt | 0, no API landing page | 0 | MCP + Claude pages | 201 free tools | — |
| Metricool | ~6,013 (7 languages) | 7 vs + 17 alt | 0 | 0 | 11 MCP posts | 44 studies | AI bots allowed by name |
| Blotato | 362 | 42 vs + 48 alt | 9 | 0 | 9 MCP + 11 agent | 6 research studies with data | yes |
| Postproxy | 225 | 9 | 12 | 0 | 5 agent + automation | 37 how-tos | yes |
| Post for Me | 94 | 8 | 9 | 0 | 0 | 44 resources | yes |
| SocialAPI.ai | 132 | 10 | 13 | error posts in blog | AI-agent solution page | 39 Spanish | yes |
| WoopSocial | 114 | 7 alt posts | 10 | 0 | 9 MCP + agent pages | 38 tools | blocks AI bots from one page |
| Duta | 23 | 0 | 7 | 0 | how-to-use (MCP guide) | — | yes, with citation notes |

Sources: each vendor's `sitemap.xml` as listed in its teardown. Siar: `current-site.md`.

**Read** [inferred]: Siar has the same per-network API and error layer as the leaders, but none of the comparison,
MCP, agent or how-to layers that every API rival now runs. Content volume is not the gap to close (Upload-Post, Postiz
and Publer win volume with tools and translations). The gap is the five or six page *types* that answer buyer
questions.

### 4b. Keywords each one owns

"Targets" = exact-match pages in their sitemap, from titles and H1s [measured pages, inferred intent]. "Ranks" = measured
once on DuckDuckGo (Bing-backed) or the WebSearch tool on 2026-11-12, `keywords/head-unified.md` and `alternatives-vs.md`;
unverified on re-check.

| Vendor | Targets | Measured ranks | Brand demand (Google autocomplete, measured) |
|---|---|---|---|
| bundle.social | social media API, unified social media API, <network> API ×15, <network> scheduler ×15, <network> API errors, white label / multi-tenant / for SaaS, MCP, Meta app review rejected, X API alternative, 22 "<rival> alternative" | DDG top 5 for "social media apis", "unified social api", "social media scheduling api" | pricing, status, mcp, docs, reddit |
| Ayrshare | unified social media API, <network> API: access, pricing & posting, social media publishing / analytics / messaging API, white-label for agencies, error-code fixes, "<rival> alternative", "does Buffer have an API" | DDG top 5 for "unified social media api", "unified api for social media", "social media posting api" (via GitHub repo), "social media publishing api", "post to multiple social networks api"; W #1 for "unified social media api" | api, pricing, **alternatives**, mcp, free plan, vs postiz |
| Zernio | social media posting API, scheduler API, <network> API ×15, ads APIs, WhatsApp/SMS API, "<rival> alternative / pricing", <network> MCP, error codes, pay-per-account pricing | DDG #5 "social media posting api"; getlate.dev blog in several W lists | pricing, mcp, api, alternative; vs postiz, blotato, metricool; "late api pricing" |
| Upload-Post | social media API (home title), social media MCP server, <network> upload API, n8n <network>, "post to social with <assistant>", <rival> alternative / pricing, X API pricing, consumer how-tos | DDG #4 "social media posting api"; #1 "schedule social media posts with an api" (how-to) | api, login, pricing, n8n, alternative, "upload post vs blotato" |
| Outstand | social media API for AI agents, social media MCP server, Claude/ChatGPT/Cursor social media, <network> API, <network> API pricing, Hootsuite API, Buffer API, Ayrshare/Postiz/Sprout alternative | none measured | outstand api, alternative, reddit, pricing (brand word is noisy) |
| Postiz | open-source social media scheduler, self-hosted, <tool> vs <tool> (613 pairs), <agent> + <network>, creator free tools, <network> scheduler | not measured (autocomplete offers "postiz open source social media scheduler") | api rate limit, api pricing, alternative self hosted, vs buffer/mixpost/zernio |
| Mixpost | self-hosted / open-source social media management, <network> scheduler, social media automation, MCP | not measured | vs postiz, alternative, api, mcp, "pro free download" |
| Buffer | social media management, best time to post, glossary, free tools, "Buffer vs", best social media APIs (self-ranked) | DDG #1 "post to multiple social platforms api" (buffer.com/resources) | buffer api key/pricing/n8n, "buffer alternative with api", buffer mcp |
| Hootsuite / Sprout | social media management tools, <network> scheduler, alternatives, glossaries; **no developer pages** | hootsuite.com newsroom #4 for "hootsuite api" (W) | "hootsuite api pricing/access/key", "sprout social api pricing/public api", "sprout social cheaper alternative" |
| Publer / Metricool | free tools, best time to post, alternatives, <brand> MCP | not measured | "publer api pricing", "metricool api pricing", "cheaper alternative to metricool", nine "metricool mcp" variants |
| Blotato | social media API for AI agents, <network> API pricing, MCP, 42 vs + 48 alternatives, research studies | W #2 "ayrshare alternatives" (its blog) | blotato api, mcp, alternatives, vs metricool |
| Post for Me | social media posting API, open-source social media API | DDG #1 "social media posting api"; top 5 "unified social api" | weak (name collides with "postformed laminate") |
| SocialAPI.ai | unified social media API, unified inbox API, social media API pricing | DDG #1 "unified social media api", "unified social api", "unified api for social media"; top 5 "social media api", "social media publishing api", "social media management api" | almost none |
| Postproxy | social media API, <network> posting API guide, how-to tasks | DDG top 5 "social media publishing api", "post to multiple social networks api", "cross-posting api" | api, pricing, mcp |
| Duta | social media scheduler Malaysia, scheduler priced in ringgit | Brave #1 "social media scheduler malaysia" (`keywords/malaysia-bm.md`); first in one extended search for the ringgit question [unverified on re-check] | none |
| **Siar** | home title has no category keyword | in no DDG/Bing top 10 for 9 non-branded checks; DDG #3/#4 "siar api" only (`current-site.md`) | none |

Third-party pages that hold the result list: for "ayrshare alternatives" the measured W top 5 is AlternativeTo, Blotato's
blog, Capterra (CA, IN) and GetApp, with G2 and SourceForge below [measured once]. Review directories, not vendors, own
brand-alternative terms on Google.

### 4c. Who writes about whom [measured]

- Rival comparison pages naming Ayrshare: 13 of 16 sitemaps checked. Naming bundle.social: Ayrshare, Zernio, Upload-Post,
  Postproxy, Blotato, WoopSocial, Schedule & Chill. Naming Siar: **none**.
- Roundups: across 17 fetched "best API / alternatives" articles, Buffer 17, Ayrshare 17, Postiz 16, Zernio 14, Blotato
  12, Outstand 12, Publer 9, Upload-Post 7, Post for Me 6, bundle.social 4, **Siar 0** (`others-dev-apis.md` §1). Almost
  all are written by a vendor that ranks itself first.
- MCP registry (official) lists Zernio, Upload-Post, Outstand, Blotato, Postproxy, SocialAPI.ai, WoopSocial and others;
  not Ayrshare, bundle.social, Postiz, Buffer, Mixpost, Publer, Metricool or Siar (`keywords/ai-agents-mcp.md`).
- Developer distribution signals (npm, last 30 days): Zernio `@zernio/node` 234,269 + `@getlatedev/node` 105,908;
  bundle.social SDK 32,201; Ayrshare SDK 30,286; Postiz CLI 25,196; Upload-Post Python 24,780 (PyPI); Buffer CLI 3,872;
  Siar 0 (not published). GitHub stars: Postiz 41,377; Mixpost 3,927; Ayrshare SDK 350; Post for Me 86.

---

## 5. Each competitor: weaknesses, and where Siar can beat it honestly

Format: **weaknesses** (sourced or measured), **Siar wins** (each true in code or docs per siar-truth), **Siar loses**
(do not contest), **one line**. Positioning lines are the teardowns' recommendations, corrected for the honesty traps.

### 5.1 bundle.social

- **Weaknesses:** nothing between $0 and $100, and its FAQ calls a solo maker "Probably not" a fit [measured]. DMs and
  automations only by emailing support [measured]. Webhooks: 3 attempts, no API routes, 5 per org [measured]. MCP local
  only [measured]. USD only, 10% yearly discount [measured]. Analytics refresh every 24 h; media kept 14 days, webhook
  events 7 [sourced]. Its own pages disagree on DMs and on free-plan accounts [measured]. One 4-hour outage on 31 Aug 2026
  [sourced: status page]. Thin review base: 35 Trustpilot reviews, all 5-star [sourced].
- **Siar wins:** $49 vs $100 at 10,000 posts and $149 vs $400 at 100,000 [sourced both]; a $19 / RM39 plan for one
  business; ringgit, FPX/DuitNow, price lock; webhooks managed in the API, retried 7 times over about 45 h. Same v1 API:
  194 of 197 operations match by method and path [measured].
- **Siar loses:** all 15 networks are sold as live on bundle.social; Siar has 9 open [sourced]. Scale proof and about 590
  URLs against 89. Pro has unlimited teams; Siar Pro has 10 brands [sourced + code]. Webhooks cap at 5 per org on both, so
  do not claim more. DMs are on-request on both.
- **Open before any page:** close the 3 missing operations (`/misc/tiktok/locations`, `/misc/tiktok/post-settings`,
  `/organization/usage/messages`) and the `post.externally-deleted` event, and decide on the `teams` field removal due
  2026-11-15 [measured]. Say "change the base URL, then reconnect accounts": OAuth tokens never move between vendors
  (bundle.social's own migration guide) [sourced].
- **One line:** the bundle.social-compatible API at half the price or less, with a plan for one business, ringgit
  billing and webhooks you manage from code. **Parked:** naming bundle.social is Fakhrul's decision.

### 5.2 Ayrshare

- **Weaknesses:** $149 for one profile, no free plan, only Launch has a trial [sourced]; 100 profiles cost $1,228 by its
  own calculator [sourced]; no Mastodon, Discord or Slack, and its own page says to "plan a separate integration"
  [measured]; HMAC optional; 300 requests per 5 minutes per profile [measured]; its own figures disagree (posts per day,
  MCP tools, accounts per plan) and some home headings are broken copy [measured]. Complaints are thin and mostly 2023:
  "Extremely expensive", price rises, data removed after a late payment [sourced: Slashdot]. Demand for its free plan
  still shows in autocomplete ("ayrshare free plan", "basic plan") [measured].
- **Siar wins:** pay per business, not per customer profile: $19 for 1 brand, $49 for 10, $149 for unlimited brands,
  against $149 / $299 / $599+ [sourced both]; 20 free posts to try with no card; Discord, Slack and Mastodon; webhooks
  signed by default; 100 requests a second; price lock; ringgit.
- **Siar loses:** live TikTok (audited), YouTube, Pinterest, LinkedIn Pages, Reddit, Snapchat, GBP, Telegram, WhatsApp
  beta; hosted MCP and a Claude Code plugin; History and Validation APIs; ads; Python and Flutter SDKs; unlimited posts;
  white-label depth (Max Pack) [sourced].
- **Risk to clear first:** Ayrshare's CEO argues that one shared X app serving many tenants breaks X's "service bureau"
  clause (2026-05-15) [sourced, Ayrshare's reading]. That is Siar's X model. Do not present X credits as an advantage on
  `/compare/ayrshare` until Fakhrul has read X's Developer Agreement.
- **One line:** the social media API you pay for per business, not per customer profile: every plan connects your
  accounts from $19 (RM39 in Malaysia), with 20 free posts to try. Ayrshare starts at $149 for one profile.

### 5.3 Zernio (formerly Late)

- **Weaknesses:** per-account bills grow with every connection; reviewers object to the switch to per-account pricing and
  to repeated plan changes [third-party: Trustpilot, AppSumo]; reports of a video posted 4 times, swallowed errors, hard
  cancellation [third-party]; Reddit sold on the home page but returning 503, Snapchat sold but closed beta [measured];
  "users never see Zernio branding" contradicts its own OpenAPI note [measured]; no Mastodon; no price-lock promise; USD
  by card only [measured]. The product now spans 1,262 operations across phones, iMessage and payouts; posts are 13 of
  them [measured].
- **Siar wins:** at 40 accounts in 10 brands, $49 against $138; at 100 accounts, $149 against $318; at 1,000, $149 against
  $1,218 [sourced + arithmetic]; price lock; ringgit with FPX/DuitNow; Mastodon; a focused social API.
- **Siar loses:** Zernio is free for 1–2 accounts with unlimited posts, forever; it never caps posts; analytics and inbox
  are included per account; live TikTok, YouTube, LinkedIn pages, Pinterest, GBP; 8 SDKs, a CLI, a hosted MCP in the
  official registry; headless connect and bring-your-own OAuth app; named customers and SOC 2 paperwork [sourced].
- **One line:** Zernio charges for every account you connect; Siar charges for your organization, from $19 (RM39), with a
  price that never goes up, for teams that need social publishing and comments rather than phones and ads.

### 5.4 Upload-Post

- **Weaknesses:** webhooks are a single attempt with no retry [measured: its docs]; when TikTok's per-app cap is hit a
  direct post becomes an inbox draft without its caption while the API returns `success: true` (flagged by
  `fallback_to_inbox`) [measured]; Reddit sold but returning 503 [measured]; one account per network per profile; X links
  stripped unless you buy a $19 pack of 50 [measured]; its white-label stays on its domain with its button colour and a
  fixed privacy box [measured: its own page]; contradicting refund and discount labels; fields silently dropped in its SDK
  and MCP (GitHub issues) [sourced]; OpenAPI covers 52 operations and leaves out documented endpoints [measured].
- **Siar wins:** retried, signed webhooks with a log and resend; verbatim network errors instead of per-platform flags
  inside a 200; never-post-twice; X links at X's own price; above 75 brands, $149 against $212–$438 [sourced +
  arithmetic]; ringgit.
- **Siar loses:** price for 2–75 clients (Upload-Post $24–$147, Siar $49–$149); 22 networks with TikTok, public YouTube,
  Pinterest, LinkedIn pages, GBP and Telegram live; unlimited uploads; a recurring free plan; media processing (FFmpeg,
  auto-transcode); hosted MCP and huge AI-agent distribution (MoneyPrinterTurbo ships a module) [sourced/measured].
  **Correction to an earlier claim:** "unlimited accounts per brand" is false for Siar (one per network per brand), so do
  not use the "brand with 3 Instagram accounts" line.
- **One line:** Upload-Post is the cheap uploader for creators and n8n builders; Siar is the per-organization API for
  products that need every post accounted for: retried, signed webhooks, verbatim errors and no double posts.

### 5.5 Outstand

- **Weaknesses:** every delivery is billed, failed ones too [sourced]; no free tier, no yearly plan, card and USD only
  [sourced]; X, GBP, Vimeo and Reddit need your own developer app and you pay X directly [sourced]; no end-user UI, no hosted
  connect page, no server SDK (only React components, 513 downloads a month) [measured]; webhook signing optional; no SLA
  on self-serve plans while its white-label page promises "SLAs" [measured]; MCP flagged "Unhealthy" on Glama for weeks and
  its awesome-list PR closed [sourced]; platform counts disagree; not SOC 2 yet (its own /facts) [measured].
- **Siar wins:** one post to many networks counts once; 20 free posts to try; X without your own developer account; a
  dashboard and a branded connect link; Discord, Slack and Mastodon; signed webhooks by default; ringgit; cheaper above
  about 7,300 deliveries a month ($49 vs $68 at 10,000) [sourced + arithmetic].
- **Siar loses:** cheaper below about 7,300 deliveries; live TikTok, public YouTube, Pinterest, LinkedIn pages, GBP,
  Reddit, Vimeo; DMs open to everyone; hosted MCP; the most deliberate GEO setup in the field (/facts, pricing.md,
  ai-catalog) [measured].
- **One line:** Outstand is a metered pipe you build your own app on; Siar is the API plus the app, priced per
  organization, where one post to every network counts once and X works without your own developer account.

### 5.6 Postiz

- **Weaknesses:** a scheduler, not a backend: cloud plans cap channels at 5/10/30/100 [sourced]; create-post limited to
  90–100 requests per hour on every plan (its own OpenAPI says 30) [sourced]; webhooks fire only on publish, with no
  documented signature or retry [measured]; no comment-reading API and no DMs, and its MCP "can't read or reply to
  comments" [sourced]; white-label Enterprise "not accepting new applications" [measured]; Trustpilot 3.4 from 17 with
  41% one-star (billing, cancellation, AI-only support) [sourced]; GitHub #918 "could not add provider" open with 56
  comments; #832 Instagram repost loop got an account disabled [sourced]; self-host support "not guaranteed" [sourced].
- **Siar wins:** no channel cap; 100 requests a second against about 100 an hour; 16 signed webhooks; comments over the
  API; a branded connect link; a free start without a card; nothing to host.
- **Siar loses:** 30+ networks with approvals already held; open source and free self-hosting; unlimited posts; AI image,
  video and clipping; a published CLI, SDK and hosted MCP with marketplace connectors; 41k stars [sourced/measured].
- **SEO opening:** Postiz has no "social media API", "<network> API" or error pages, and no bundle.social or Siar page
  [measured]. Autocomplete shows "postiz api rate limit", "postiz api pricing", "postiz alternative self hosted"
  [measured].
- **One line:** Postiz is a scheduler AI agents drive; Siar is the hosted API a product builds on to publish for its own
  customers: no channel cap, 100 requests a second instead of about 100 an hour, signed webhooks and a comments API.

### 5.7 Mixpost

- **Weaknesses:** its API cannot connect a social account and has no hosted connect link [measured: OpenAPI]; no comments in
  the API (inbox is dashboard-only, "Coming soon" on Cloud) [measured]; webhooks 3 attempts in about 6 minutes, secret
  optional [measured]; self-hosters get their own app approved on every network ("weeks per network", its docs) and pay X
  directly [sourced]; Cloud bills per workspace and caps channels; Cloud trial needs a card [measured]; the site
  contradicts itself on X for Cloud and on "no monthly subscriptions" [measured]; self-host install failures, a 7-week
  Instagram breakage, patched images chased by users (GitHub) [sourced].
- **Siar wins:** an API to build on, not an app to use; comments in the API; webhooks retried over about 45 h; Siar's own
  approved apps on the open networks; per-organization pricing; X without your own account; Discord and Slack; nothing to
  patch; 20 free posts to try without a card.
- **Siar loses:** self-hosting, source code and a one-time price; wider claimed networks (with your own approvals); agency
  features (approvals, 16 UI languages, SSO, white-label resale); a CLI on Homebrew today.
- **One line:** Mixpost is a scheduler you install or rent per workspace; Siar is the hosted API you build on. If you must
  own the server, Mixpost is the better buy, and the page should say so.

### 5.8 Buffer

- **Weaknesses for developers:** App Client users must be Buffer accounts who connect channels inside Buffer and pay
  Buffer per channel [measured: its docs]; no connect API, no white-label; no webhooks; no comments or DMs in the API; no
  media upload endpoint; post metrics only on personal keys; App Client limits stop growing at 1,000 users; legacy REST
  API retired 2027-02-01 with brownouts on 2026-11-11 and 2026-12-09 [measured]. Trustpilot 4.3 from 157 with 33% one-star,
  failed posts the top theme [sourced]. Its yearly discount is stated two ways (20% vs 16.7%) [measured].
- **Siar wins:** your customers connect through your branded link, with no third-party account; one price per
  organization (30 channels: $135–$195 on Buffer vs $49) [sourced + arithmetic]; REST with 270 operations; webhooks;
  comments; Discord and Slack.
- **Siar loses:** live TikTok, YouTube Shorts, Pinterest, LinkedIn Pages, GBP, Substack; hosted MCP and a CLI on npm; a
  real free plan (3 channels, refilling); unlimited posts; 16 years of brand and open metrics.
- **Timing:** the REST shutdown is a live trigger for migrators. Siar is not REST-compatible with Buffer's legacy API, so
  never imply a drop-in; a migrator rewrites either way.
- **One line:** Buffer's API connects your app to people who already use Buffer; Siar is the API you build your own
  product on, with your customers connecting through your branded link, one price per organization, webhooks and
  comments.

### 5.9 Hootsuite and Sprout Social

- **Weaknesses:** seat pricing; the API acts on the customer's own account, so it cannot embed posting for your customers
  [measured]. Hootsuite: API publishing excludes TikTok, YouTube and Bluesky; Pinterest cannot be bundled; webhooks 4
  types, unsigned; MCP Perch "saves drafts but does not publish", Nest "cannot send replies"; its marketing prompt
  "Cross-post simultaneously" contradicts its docs [measured]. Sprout: API only on Advanced ($399–$499 per seat);
  publishing "currently only supports posts in Draft status"; messages read-only; no webhooks; unsupported media drops a
  profile with "No error is returned"; MCP ChatGPT-only, TikTok data only, no writes [measured]. Trustpilot: Hootsuite 1.3
  (556), Sprout 1.8 (89), mostly billing and renewal [sourced].
- **Siar wins:** an API that publishes, on every plan; signed webhooks; a branded connect link; Mastodon, Discord, Slack;
  Siar Pro $490 a year for the organization against $2,388 (Hootsuite Professional, one seat) or $4,788 (Sprout Advanced,
  one seat) [sourced + arithmetic]; ringgit.
- **Siar loses:** listening, ads, influencer tools, approvals, SSO, enterprise proof; TikTok, Pinterest, LinkedIn pages
  in the apps. Do not compare app to app.
- **Watch:** Hootsuite announced going "headless" through MCP (2026-05-15). If Perch gains publishing, update the
  "drafts only" line that week.
- **One line:** Hootsuite and Sprout sell seats for a dashboard and give you an API that drafts (Sprout and both MCPs);
  Siar is the API: it publishes, signs its webhooks and is priced per organization from RM39 / $19.

### 5.10 Publer and Metricool

- **Weaknesses:** API only on upper tiers (Publer Business, "does not offer a public API that is available to everyone";
  Metricool Advanced) [sourced]; no outbound webhooks on either [measured]; Publer cannot connect accounts through the API
  [measured]; Metricool's swagger is the app's internal API (712 operations, payment webhooks, "use the browser inspector")
  and its connect link is Custom-plan only on mtr.cool [measured]; Metricool charges $10 per X account [sourced];
  complaints: Publer price creep and refund disputes, Metricool auto-renewal and posts "published" that never appeared
  [sourced: G2, Trustpilot].
- **Siar wins:** API on every plan; signed webhooks; published, higher rate limits; a branded connect link; comments in
  the API; Discord, Slack (both lack), Mastodon (Metricool lacks); 50 accounts in 10 brands at $49 against Publer $252
  yearly [sourced + arithmetic].
- **Siar loses:** Publer's API costs $10 for one account against Siar's $19; hosted MCP on both (Metricool's free on every
  plan); live TikTok, YouTube, Pinterest, LinkedIn pages, GBP, Telegram/WordPress (Publer), ads and analytics depth
  (Metricool); scale and reviews.
- **Fix:** `docs/pricing.md` sources Metricool's price from socialpilot.co; replace with https://metricool.com/pricing/.
- **One line:** Publer and Metricool unlock an API for your own accounts on upper tiers; Siar is the API itself, on every
  plan from 20 free posts to try, with signed webhooks and a branded connect link for your customers.

### 5.11 Newer developer APIs: Blotato, Postproxy, Post for Me, SocialAPI.ai, WoopSocial

| Vendor | Weaknesses [sourced/measured] | Siar wins | Siar loses |
|---|---|---|---|
| Blotato | No free plan, trial excludes the API; account bands (20/40/100); comments and DMs IG/FB only; no white-label connect; third-party reports of duplicate posts and silent failures [unverified: Capterra 403]; its G2 "4.6/5" vs 1 review on G2 [unverified] | Branded connect for your customers; never-post-twice; verbatim errors; API on the free plan; 50 accounts at $49 vs $499 | Hosted MCP, huge content and affiliate machine (42 vs + 48 alternatives), 12/17 roundups |
| Postproxy | SOC 2 "certified" on the site, "audit in progress" in its llms.txt; founded 2026; SDKs at 0 stars | Bill stops growing at Business ($149 unlimited brands vs ~$734 at 500 groups); X without BYOK; Discord, Slack, Mastodon | Cheaper at 10–20 brands ($49 for 20 groups); 12 networks incl. TikTok, LinkedIn pages, GBP, Telegram, WhatsApp; neutral-name white-label app. **Do not** attack its X cap (Siar's is lower: 15/day vs 20) or one-account-per-network (Siar has the same rule) |
| Post for Me | JSON-LD rating 4.8/127 with no visible reviews; no comments, DMs or hosted MCP; Quickstart shows "Post for Me" on OAuth | Comments, dashboard, link in bio, 16-event webhooks; cheaper per post from about 5,000 a month ($49 for 10,000 vs $75); free start | $10 entry; claims passed TikTok audit, LinkedIn CM API, Pinterest beyond trial and YouTube review, all of which Siar lacks |
| SocialAPI.ai | Solo founder, no proof; BYO X app required | X without your own X app; Discord, Slack, Mastodon | $29 for 10 brands with unlimited posts; recurring free tier; WhatsApp, Telegram, reviews; hosted MCP. Do not fight on price at 10 brands |
| WoopSocial | Publishing only; no inbox; unbranded connect; "Guaranteed lowest… in the world" unverifiable | Comments, branded connect link, signed webhooks | Free plan with unlimited posts on 2 accounts; $19 for 20 accounts. Do not claim the better free plan |

### 5.12 Malaysia: Duta, Zoho Social and the local field

- **Duta:** one RM99 plan, card for the trial, no comments, inbox, analytics, teams or webhooks, API docs behind a login
  [measured]. **Ahead of Siar:** launched first and claims "the first social media scheduling tool built in Malaysia";
  hosted MCP for Claude and ChatGPT; Telegram; no post cap except X; already answers the AI-search questions Siar wants
  (its llms.txt and FAQ) [measured]. **Siar wins:** RM39 instead of RM99; 20 free posts to try, no card; comments, webhooks
  and public API docs; 10 brands on Pro. **Never say "first" or "only".**
- **Zoho Social:** the real ringgit price peer: Standard RM40 yearly / RM60 monthly for 1 brand; Agency RM920–1,280 for 10
  clients [measured from a Malaysian IP]. Siar Starter RM39 is close at entry (RM390 a year vs RM480), so not "half the
  price". Siar's edge is per organization: 10 brands for RM99 against RM920+.
- **MarketOS, PostLa, Synova:** all ringgit, all capped by account or channel, no public API [measured]. MarketOS's visible
  prices (RM199/599/1,499) contradict its own JSON-LD (RM99/349/899) and it advertises a grant third parties say closed
  [measured + sourced]. PostLa offers WhatsApp support in BM, which Siar deliberately does not [measured].
- **Inbox tools (SleekFlow RM399+, respond.io USD, ManyChat USD):** not head-to-head while Siar's DMs are in beta.
- **Grey tools (Prism Reach):** automates personal Facebook accounts. Siar's answer: official APIs only, Pages and
  professional accounts, never groups or personal profiles.
- **One line:** one price per business in ringgit, from RM39, with every open network's accounts in one organization;
  one post counts once; the same API, webhooks and comments behind the dashboard.

---

## 6. Where Siar can win, across the field

### 6a. Lanes nobody owns [measured absence + inferred value]

| Lane | Who is already there | Why Siar can take it honestly | Blocked by |
|---|---|---|---|
| "[dashboard brand] API pricing / alternative" (Hootsuite, Sprout, Metricool, Publer, Buffer) | 1–6 rival pages each (Outstand `/hootsuite-api`, `/buffer-api`; Ayrshare `/compare/*-api-alternative`) | Measured, quotable gaps: seats, gated tiers, drafts only, no webhooks | Fakhrul's go on comparison pages |
| Per-organization pricing explainer with scenarios | Zernio owns "pay-per-account pricing"; nobody writes the other side | Scenario tables from vendors' own price lists (section 2a) | Decision 1 (accounts wording) |
| Discord / Slack / Mastodon posting API | Only bundle.social, Upload-Post and Postiz list all three; none makes it a page [inferred from their sitemaps] | Live on Siar today | — |
| Webhook reliability for social APIs | Postproxy has "webhooks vs polling"; Upload-Post's docs admit no retry | 16 signed events, 7 retries, replay, all in code | — |
| Error codes per network, answer-first | bundle.social 14, Ayrshare 30, Zernio 12 | 147 codes on 15 pages already; needs indexing and an `/errors` hub | Indexing (43 Siar URLs not in Google) |
| Link-in-bio API | No API vendor has a link-in-bio API page; Linktree has only an interest form (`keywords/use-case-segments.md`) | Full CRUD + click analytics in `bio.ts` | — |
| "Switch from bundle.social" | Nobody can answer it truthfully except Siar | v1 wire compatibility (194 of 197) | Decision 2 (naming) |
| Postiz API limits ("postiz api rate limit") | Outstand's Postiz page only | 100/s vs ~100/h, measured in both docs | — |
| Malaysia answers (ringgit, FPX/DuitNow, cost guides) | Duta (23 URLs) | Real local payment and pricing facts | Must not say "first" |
| BM per-network how-tos ("cara schedule post instagram") | Nobody with a tool attached | Small test set, `keywords/malaysia-bm.md` | TikTok and DM pages held |

### 6b. Things to never contest (true across the field)

- Network breadth or any of TikTok, public YouTube, Pinterest publishing, LinkedIn company pages, Reddit, Snapchat, GBP.
- MCP, SDK or CLI installs until npm publish; hosted MCP at all (Siar's is local).
- Unlimited posts (Siar caps posts).
- Cheapest at one brand or at 10 brands.
- DMs or comment-to-DM as generally available.
- White-label (Siar's connect page says "Powered by Siar" and is English only).
- Proof: customers, uptime, SOC 2, reviews.
- "First" or "only" in Malaysia.

---

## 7. Before any comparison page ships

### 7a. Fix Siar's own over-claims (siar-truth §6; code locations there)

A comparison page that points at rivals' over-claims needs a clean home site. The main ones:

1. Home hero demo shows TikTok, LinkedIn company page and Google Business as "Posted" with made-up millisecond timings
   (`ApiPanel.astro`).
2. Home event feed labelled "Live" is scripted, with Pinterest, Google Business and a fake handle (`EventLog.astro`).
3. "One request. 15 networks.", "All networks", "across all 15 networks", "Try every network" (home, pricing, `plans.ts`).
4. Calculator's server-rendered default: 40 brands on Pro for RM99 (`PriceCalc.astro`). Bing Copilot already repeats
   "RM399/month for up to 240 connected accounts" [measured, `current-site.md`].
5. `npx -y @siar/mcp` on the home page and docs fails (404).
6. TikTok page claims comments; LinkedIn page offers company pages; YouTube page offers PUBLIC with no private-upload note.
7. DM line "opening after Meta approval" is stale; the DM error says "Upgrade to Pro" though Starter includes DMs.
8. Glued H1/H2 text ("Bluesky APIthrough Siar.") on 42 pages.
9. FAQ JSON-LD lists all 15 networks with no status.

### 7b. Decisions for Fakhrul (blocking)

1. **"Unlimited accounts on every plan" wording.** Code allows one live account per network per brand
   (`schema.prisma`, `accounts.ts` line 106). Free and Starter reach at most 15 accounts, Pro 150. A comparison next to
   bundle.social's or Postproxy's tables would not survive a careful reader. Suggested: "No per-account fees: each brand
   connects one account on every open network; Starter 1 brand, Pro 10, Business unlimited." [inferred wording]
2. **Naming bundle.social** (parked). Unlocks `/compare/bundle-social` and "switch from bundle.social".
3. **X pass-through and the "service bureau" clause.** Read X's Developer Agreement before marketing X credits or
   publishing `/compare/ayrshare` with an X row [Ayrshare's argument, unverified against X].
4. **npm publish of SDK, CLI and MCP.** Unlocks MCP comparisons, MCP registry listings and agent pages. A hosted MCP would
   close the biggest feature gap (Duta proves a small team can run one).
5. **Go on comparison pages and directory listings** (AlternativeTo, Capterra/GetApp, G2, SourceForge): directories hold
   Google's top 5 for "ayrshare alternatives". Factual listings only, no ratings.
6. **Opening the DM beta.** Until then, no DM comparisons and no "comment HARGA" pages.
7. **YouTube rule change (2026-11-02).** `keywords/per-network.md` reports YouTube no longer forces unverified uploads
   private [sourced: YouTube revision history]. Test one public upload before changing any copy; siar-truth still says
   private.

### 7c. Rules for every comparison page

- Every competitor price, limit or network list links the vendor's own page with "checked <date>". Re-check before
  publishing; prices here moved within months (Zernio, Outstand, Postproxy all changed models in 2026).
- Say where the competitor wins in the same table (section 5 "Siar loses").
- State Siar's post caps beside any account-count comparison.
- No competitor names on `/pricing` (siar-truth §3b rule 12).
- No ratings, review counts or uptime for Siar. No rival complaints quoted unless the URL was opened by hand.

---

## 8. Suggested page order (from this teardown plus the keyword files)

| Priority | Page | Target terms | Lead with | Concede |
|---|---|---|---|---|
| P1 | `/guides/social-media-api-pricing` | social media api pricing, cost, per account vs per organization | Section 2a scenarios from vendors' own price lists | Siar is not cheapest at 1 or 10 brands |
| P1 | `/compare/ayrshare` | ayrshare alternative(s), ayrshare pricing, ayrshare free plan | Per business vs per profile; Discord/Slack/Mastodon | Networks, hosted MCP, unlimited posts; no X row until decision 3 |
| P1 | `/compare/hootsuite-api`, `/compare/sprout-social-api` | hootsuite api pricing/access, sprout social api pricing | Drafts-only and seat-gated APIs, quoted from their docs | Listening, ads, approvals |
| P2 | `/compare/buffer-api`, `/compare/metricool-api`, `/compare/publer-api` | buffer alternative with api, metricool api pricing, publer api pricing | No connect API, no webhooks, gated tiers | Free plans, hosted MCP, networks; Publer $10 for one account |
| P2 | `/compare/zernio` (mention "formerly Late" once) | zernio alternative, late api alternative | Per-account vs per-org arithmetic; price lock | Free for 1–2 accounts; networks; SDKs |
| P2 | `/compare/upload-post`, `/compare/outstand`, `/compare/postiz`, `/compare/mixpost` | <brand> alternative, postiz api rate limit, mixpost api | Webhook reliability, connect link, per-org billing | Price below 75 brands (Upload-Post), volume below ~7k (Outstand), self-hosting (Postiz, Mixpost) |
| P2 | `/discord-slack-mastodon-api` (or one H2 on each network page) | discord/slack/mastodon posting api | Live today | — |
| P3 | `/compare/post-for-me`, `/compare/postproxy`, `/compare/blotato` | <brand> alternative | Comments, webhooks, bill at scale | Their approvals; Postproxy at 10–20 brands |
| P3 | `/compare/zoho-social`, `/compare/duta`, `/malaysia` | ringgit scheduler, social media management cost malaysia | RM39 entry, 10 brands RM99, FPX/DuitNow | Duta first; Zoho close at entry |
| Held | `/compare/bundle-social`, `/switch-from-bundle-social` | bundle.social alternative | v1 wire compatibility, then reconnect | Networks |
| Held | MCP and agent pages | social media mcp server, <network> mcp | After npm publish | Hosted MCPs everywhere else |

Next research: tear down PostPeer, Publora, postwire.io and crosspostapi.com (they hold Bing/DDG positions with 2026
domains); re-run the ▲ SERP checks in `keywords/alternatives-vs.md`; a Reddit pass once access works.

---

## 9. Sources

Vendor pages are linked in each table cell above and listed in full at the end of each teardown in
`docs/seo/research/competitors/`. Price lists re-fetched in this pass, 2026-11-12:

- https://bundle.social/pricing.md ("Last updated 2026-07-30")
- https://zernio.com/pricing.md
- https://www.outstand.so/pricing.md ("2026-11-11")
- https://www.ayrshare.com/pricing.md

Siar facts: `docs/seo/research/siar-truth.md` (plans, network status, code paths). Site and indexing:
`docs/seo/research/current-site.md`. Rankings and demand: `docs/seo/research/keywords/head-unified.md`,
`alternatives-vs.md`, `ai-agents-mcp.md`, `malaysia-bm.md`, `per-network.md`, `use-case-segments.md`, `ai-answers.md`.
Buyer evidence: `docs/seo/research/market/buyers-pains.md`, `malaysia-market.md`.
