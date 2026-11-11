# Strategy: Malaysia first (agencies, freelancers, SMEs)

Checked 2026-11-12. One of three strategy angles. This one: own the home market, where the global players are weak.
It builds on `competitors.md`, `keyword-map.md`, `market.md`, `research/siar-truth.md`, `research/current-site.md`,
`research/competitors/my-sea-schedulers.md`, `research/keywords/malaysia-bm.md` and `research/market/malaysia-market.md`.
It does not repeat them. Cluster IDs (C01–C127) are the keyword map's. IDs starting with M are new in this file.

**Labels.** **measured** = I or a teammate saw it on 2026-11-12 (page fetched, code read, autocomplete run). **sourced** =
a page with its URL. Vendor facts come from the vendor's own page, checked 2026-11-12. **inferred** = my reading, my
arithmetic or my estimate. **unverified** = I could not check it.

**Limits of this pass.**
- WebSearch was refused: the run-wide budget of 200 calls was already spent. I did not work around it.
- WebFetch worked. I re-fetched Duta's pricing, llms.txt and sitemap, Zoho Social's pricing page and the xwork.my roundup.
- Siar facts were re-read in code: `schema.prisma`, `plans.ts`, `refunds.mdx`, `config.ts`, `billing-core.ts`. I also
  read the live `/llms.txt` and `/pricing`.
- No ranking in this file is newly measured. Demand grades come from the teammates' autocomplete runs (gl=my) and are
  inferred.

---

## 0. The short version

1. **Nobody in Malaysia searches for "a Malaysian tool".** "social media scheduler malaysia", "social media tool
   malaysia" and every BM price phrase return 0 autocomplete completions [measured, `malaysia-bm.md` rows 1–3, 26].
   The money is in four places, and only one of them is a SERP:
   - **AI answers.** Duta answers "Is there a Malaysian scheduler?" today with "the first". That answer is contestable
     with a fuller, fairer page [sourced: https://getduta.com/llms.txt, checked 2026-11-12].
   - **BM how-to searches,** per network, in mixed BM-English ("cara schedule post instagram", AC 10) [measured].
   - **Agency price searches** ("social media management price malaysia") [measured].
   - **Direct reach:** roundups, Malaysian tech press, groups, outreach.
2. **Siar's real unfair advantage in Malaysia is the agency unit price.** Pro is RM99 for 10 brands, RM9.90 a brand
   [code: `plans.ts`]. Against it:
   - Zoho Social Agency: RM920 a month billed yearly, RM1,280 billed monthly, for 10 clients.
   - Synova Business: RM799. MarketOS Pro: RM1,499.
   - Duta: RM99, but it has no brands or teams at all.

   All four prices are from the vendors' own pages (section 3). This is the strike point: freelancers and small
   agencies doing Facebook, Instagram, Threads and LinkedIn-profile work.
3. **Three gates decide how big Malaysia gets.** Each is an owner call or an external approval:
   - **The DM beta.** Comment-to-DM ("Comment HARGA") at RM39 is the strongest SME hook in the market. ManyChat bills
     in USD per contact and SleekFlow starts at RM399.
   - **TikTok approval.** TikTok is the channel Malaysian sellers live on.
   - **The "unlimited accounts" wording.** The code allows one live account per network per brand.

   Until they clear, write for agencies and freelancers. Do not write for sellers.
4. **Never say "first", "only", "cheapest" or "the Malaysian scheduler".** Duta was public by August 2026. Siar went
   live on 2026-10-12. Zoho's yearly Standard plan (RM480 a year) is close to Siar Starter (RM390 a year).
5. **The local trust kit is already true; put it in one line beside every price.** "FF DEV STUDIO (SSM 202603234793),
   Malaysia · ringgit · yearly paid once by FPX or DuitNow · your price never goes up while you stay subscribed."
   Every local rival shows a version of this [measured, `malaysia-market.md` §7].
6. **Content to build for this angle: 17 URLs, plus 5 held** (section 6):
   - an English `/malaysia` answer page;
   - a `/for-agencies` page;
   - an agency cost guide;
   - three ringgit comparison pages: Zoho Social, Duta, Meta Business Suite;
   - a Meta Business Suite troubleshooting guide;
   - the 7-page BM test;
   - a `/compare` hub entry;
   - the existing `/pricing` and `/about`, upgraded;
   - five pages written now and held until the DM beta and TikTok clear.
7. **Off-site matters more than pages here.** The pages that answer Malaysian questions are about six small agency
   blogs and Duta [measured once, unverified on re-check, `malaysia-bm.md` row 1]. Getting into those, plus Malaysian
   tech press and real participation in local groups, moves AI answers faster than ranking does.

---

## 1. Where to strike: gaps competitors leave open

Each gap: who leaves it open (vendor's own page, checked 2026-11-12), the evidence of demand, and how Siar takes it.

| # | Gap | Who leaves it open | Demand evidence | How Siar takes it | Gate |
|---|---|---|---|---|---|
| G1 | **Per-client price for agencies.** Separate client brands, cheap, in ringgit | Duta: no teams or brands; "connected as many times as you like" in one workspace [https://getduta.com/pricing]. Zoho Agency RM920–1,280 for 10 clients [https://www.zoho.com/social/pricing.html, MY browser, teardown]. Synova Business RM799 [https://zynex-ai-v2.pages.dev/synova.html]. MarketOS Growth RM599 has 3 workspaces; Pro RM1,499 has 5 [https://mymarketos.com/en/pricing]. PostLa Professional RM197 caps at 10 social accounts [https://postla-page.pages.dev/pricing.html] | "freelance social media manager malaysia", "admin media sosial freelance" (AC, measured). Agency fees of RM800–15,000 a month per client (third-party agency pages, `malaysia-market.md` §4) | Pro RM99 = 10 brands. `/for-agencies` + cost guide + outreach to freelancers | "Unlimited accounts" wording (section 2, caveat A) |
| G2 | **Comments in one inbox at SME price** | Duta: "a scheduling tool, not an analytics or engagement tool" [https://getduta.com/llms.txt]. MarketOS: "Comment fetches" only on Growth (50) and Pro (100). Zoho: inbox on Premium RM160–260 [Zoho pricing, teardown] | "Too many inboxes and apps" (`malaysia-market.md` §8a, sourced from vendor content) | Comments on FB, IG, Threads, X, Bluesky, Mastodon, Slack: Starter has 1,000 a month [code] | None |
| G3 | **Comment-to-DM in ringgit** | ManyChat: USD, priced per active contact [https://manychat.com/pricing, MY IP]. SleekFlow: from RM399 [https://sleekflow.io/en-my/pricing.md]. Duta has none | "comment to dm" AC-my 10; "auto reply dm instagram" 8; "cara auto reply instagram" 10; "manychat alternative" 10 [measured]. The "PM" / "+1" habit is sourced (EasyStore, SleekFlow) | Starter RM39 includes 200 comment-to-DM runs and 500 DMs per account [code]. **The largest Malaysian SME prize** [inferred] | **DM beta** (off by default, on request) |
| G4 | **BM how-tos written the way Malaysians type** | SleekFlow has 16 ms-my URLs, formal and machine-like. Simplified runs machine-translated programmatic BM ("Catatan Auto…"). Duta, MarketOS and PostLa sites are English [measured, teardown §9] | "cara schedule post" AC 10, "cara schedule post instagram" 10, "cara auto post" 9, "cara buat link bio" 10 [measured]. Formal BM ("jadualkan", "hantaran") returns 0 | 7 BM pages in colloquial mixed BM-English (section 6c) | None (TikTok and DM pages held) |
| G5 | **The free tool's failures.** Meta Business Suite troubleshooting | Meta's own help; no tool vendor owns the Malaysian long tail [inferred, not measured] | "meta business suite schedule post" AC 10: not working, not showing, time zone, limit, bulk, can't schedule [measured] | C119 guide; Siar CSV bulk import is true [code: `content-csv.ts`] | None |
| G6 | **The "is there a Malaysian tool?" AI answer** | Duta's llms.txt answers "Yes. Duta is the first social media scheduling tool built in Malaysia." It answers the ringgit question with its own price only [https://getduta.com/llms.txt, re-fetched] | GEO prompts p046–p048 (`prompts_v1.csv`); Siar is cited for 0 of them | A fuller answer: "Yes, several", with a dated table of every ringgit-priced tool. Engines prefer sources that list options [inferred] | Comparison go |
| G7 | **Pay once a year by FPX or DuitNow** | Duta: yearly takes FPX, no DuitNow. SleekFlow: cards through Stripe. respond.io and ManyChat: USD only [vendor pages, teardown §6] | DuitNow QR doubled to about 3 billion transactions in 2025 [sourced: Fintech News MY, `malaysia-market.md` §1] | True today [code: `ONCE_METHODS`] | None |
| G8 | **A public API from a Malaysian vendor** | Duta, MarketOS, PostLa, Synova: none publish API docs without a login. MarketOS gates the API to RM599+, Synova to RM799 [teardown §2–4] | "social media api malaysia": AC 0, but the Bing SERP has no real competitor (muapi.ai, data.gov.my, WhatsApp resellers) [measured, `current-site.md`] | API on every plan, Free included [code]. An H2 on `/malaysia` and `/for-agencies` | None |
| G9 | **Official-API safety** | Prism Reach automates personal Facebook accounts and warns of restriction on its own page [https://prismxtech.com/reach] | "auto post facebook group(s) / fewfeed / extension" AC high [measured] | One FAQ line on every relevant page. Siar's Meta app passed App Review on 2026-10-27; it posts to Pages and professional accounts only. **Not a page target** | None |
| G10 | **Link in bio per client, included** | Duta, PostLa, Synova and MarketOS list no link-in-bio feature on their pages [inferred from teardown feature lists] | "cara buat link bio" AC 10 [measured] | A bio page per team, with views and clicks per link [code: `bio.ts`]. C126 in BM, plus an H2 on `/for-agencies` | None |

**Where Siar loses in Malaysia (say it, never hide it):**

- **TikTok.** It is sandbox only. TikTok's ad reach in Malaysia is listed at 30.7M adults, a figure the DataReportal
  report itself flags as above the adult population [sourced, `malaysia-market.md` §1].
- **LinkedIn company pages.** Access was denied.
- **WhatsApp.** Siar has none, and service SMEs live on it.
- **Language.** The dashboard and the connect page are English only.
- **Support.** No BM or WhatsApp support (PostLa offers both).
- **Telegram and a hosted MCP.** Duta has both.
- **Xiaohongshu.** Synova has it.
- **More than one account per network per brand.** Duta: "as many times as you like."
- **Going first.** Duta was first.

The pages concede these in their own tables.

---

## 2. Siar's unfair advantages that are true today

Every row is checked against `siar-truth.md` and the code on 2026-11-12. Wording is the allowed wording.

| # | Advantage | Allowed wording | Evidence |
|---|---|---|---|
| A1 | Agency unit price | "10 brands on Pro for RM99 a month. Under RM10 a client." | `plans.ts` PRO `teams: 10`, `myr: 9_900` [code] |
| A2 | One price per business, no per-account fee | "No per-account fees." See caveat A below for "unlimited" | `plans.ts` has no account limit field [code] |
| A3 | Your client never shares a password | "Send your client a branded connect link. They sign in to each network themselves; you never see a password or token." | `Portal.vue`, `socialAccount.createPortalLink` [code]. It shows "Powered by Siar", runs on app.siaran.my and is in English |
| A4 | Comments from every open network in one inbox | "Answer comments from Facebook, Instagram, Threads, X, Bluesky and Mastodon in one place." | siar-truth §1c [code] |
| A5 | Analytics on every paid plan | "Account and post analytics on every paid plan." | `plans.ts` `analytics: true` from Starter [code] |
| A6 | A bio page per brand, included | "Each brand gets a link-in-bio page with views and clicks per link, at no extra cost." | `bio.ts`, `Bio.vue` [code] |
| A7 | Plan a month in a spreadsheet | "Upload a CSV and schedule a month of posts at once." | `content-csv.ts` [code] |
| A8 | Ringgit, FPX or DuitNow, a Malaysian company, numbered receipts | "Ringgit prices for Malaysian organizations. Pay yearly once by FPX or DuitNow. Paid to FF DEV STUDIO (SSM 202603234793). A numbered receipt for every payment." | `ONCE_METHODS`; `billing-core.ts` "SIAR-YYYY-NNNNN, receipt emailed" [code] |
| A9 | Price lock | "Your price never goes up while you stay subscribed." | `PRICE_LOCK` [code] |
| A10 | Start without a card | "20 free posts to try. No card." | `plans.ts` `oneTime` [code] |
| A11 | One post counts once | "A post sent to every connected network counts as one post." | `posts.ts` [code] |
| A12 | Official APIs, with Meta's review passed | "Siar's Meta app passed Meta's App Review (all 27 permissions requested, 27 Oct 2026). Siar posts to Pages and professional accounts, never to groups or personal profiles." | `docs/approvals/meta.md` [doc]. A fact, never a badge |
| A13 | A real, reachable company | "FF DEV STUDIO, SSM 202603234793, Setiu, Terengganu. Phone in the footer of every page." | `config.ts` [code]; live `/contact` [measured]. A contact line, not phone support |
| A14 | Public API on every plan | "The same API the dashboard uses, on every plan, with public docs." | siar-truth §1c |
| A15 | Clear cancellation | "Cancel any time from Billing. The plan runs to the end of the paid period; nothing is deleted." | `refunds.mdx` [code] |

**Caveat A (blocks the agency pages): "unlimited accounts".**
- `schema.prisma` line 4 allows "at most one live SocialAccount per network per team" [code, re-read today].
- So one brand holds at most one Instagram, one Facebook Page, and so on.
- An agency client with two Facebook Pages needs two brands.
- Duta has no such limit [https://getduta.com/pricing].
- Until Fakhrul rules, the agency pages say: **"No per-account fees. Each brand connects one account on every open
  network. Starter 1 brand, Pro 10, Business unlimited."** [inferred wording, matches the code]
- Never "unlimited Instagram accounts" and never "unlimited clients" below Business.

**Caveat B: the X cost in a ringgit pitch.**
- X usage is extra, from a prepaid credit, at X's USD price: $0.015 a post, $0.20 a post with a URL
  [sourced: https://docs.x.com/x-api/getting-started/pricing].
- Malaysians buy the credit in ringgit at a 4.20 rate that includes a buffer [doc: `pricing.md`].
- Any ringgit cost table that includes X must show this line.

**Not true, so never implied** (checked in code today):
- Per-client logins. `OrganizationMember` is organization-wide; there is no team-scoped role.
- Client approval workflows. No approval model exists.
- PDF or exported client reports. `Analytics.vue` has no export.
- LHDN e-Invoice / MyInvois. Nothing in the code.
- A BM dashboard.
- WhatsApp, TikTok and LinkedIn company pages.

Agencies will ask about the first three. Answer "not today" in the FAQ, not with silence.

---

## 3. Price arithmetic the pages may print

All rival prices are from the vendor's own page, checked 2026-11-12. Zoho, Buffer, ManyChat and Canva were read in a
browser on a Malaysian IP by the teardown (`my-sea-schedulers.md`). My own server fetch of Zoho today rendered no prices,
because Zoho prices by region. Duta was re-fetched by me today. Arithmetic is **inferred**.

**Scenario 1: a freelancer or small agency.** 8 clients, each with a Facebook Page, an Instagram professional account and
Threads (24 accounts), about 60 posts per client a month (480 posts).

| Tool | What it costs for this | Source |
|---|---|---|
| **Siar Pro** | **RM99 a month (RM990 a year)**. 8 of 10 brands; 480 of 10,000 posts | `plans.ts` |
| Duta | RM99 a month (RM990 a year). All clients in one workspace: no brands, comments or analytics | https://getduta.com/pricing |
| Zoho Social Agency | RM1,280 a month, or RM920 a month billed yearly (10 clients, 5 members) | https://www.zoho.com/social/pricing.html (MY browser) |
| Synova | Pro RM299 allows 5 accounts per platform, so 8 Instagram accounts need Business at RM799 | https://zynex-ai-v2.pages.dev/synova.html |
| PostLa | Professional RM197 caps at 10 social accounts, so 24 accounts need Enterprise (custom) | https://postla-page.pages.dev/pricing.html |
| MarketOS | Growth RM599 has 3 workspaces and Pro RM1,499 has 5, so 8 clients need Enterprise (custom) | https://mymarketos.com/en/pricing |
| Buffer | Essentials is $5 per channel a month billed yearly, so 24 channels cost $120 a month, in USD | https://buffer.com/pricing (MY browser) |

**Scenario 2: one business.** Facebook, Instagram, Threads and X, about 40 posts a month.

| Tool | Cost | Source |
|---|---|---|
| **Siar Starter** | **RM39 a month (RM390 a year)**, plus X usage from the prepaid credit (caveat B) | `plans.ts` |
| Meta Business Suite | Free, Facebook and Instagram only | https://www.facebook.com/business/help/1252240869631062 |
| Zoho Social Standard | RM60 monthly, or RM40 a month billed yearly (RM480 a year), 1 brand | Zoho pricing (MY browser) |
| Duta | RM99; X capped at 300 a month | https://getduta.com/pricing |
| PostLa Starter | RM97 for 3 accounts and 30 posts, so 4 accounts need RM197 | PostLa pricing |
| Synova Starter | RM99 for 1 account per platform on 3 platforms with 30 posts, so 4 platforms need Pro RM299 | Synova page |
| MarketOS Starter | RM199 for 3 channels and 30 posts | MarketOS pricing |

Rules for printing these:
- Every row carries its link and "checked <date>".
- Re-check every row on the day a page ships.
- Siar's limits (posts, brands, one account per network per brand) sit in the same table.
- MarketOS's visible prices contradict its own JSON-LD (RM99/349/899) [measured, teardown §3]. Quote the visible page
  and note the contradiction in a footnote, since engines may quote the old numbers.

---

## 4. Who to win, in order

Ranked by fit today × reach (inferred, from `market.md` §3 and `malaysia-market.md` §2):

1. **Freelance social media admins (2–10 clients) and small agencies (5–30 clients).** Nothing they need is gated.
   The arithmetic is decisive (section 3). They talk to each other, which suits off-site reach.
   - Lead message: "10 clients, RM99. Your clients connect their own accounts; you never ask for a password."
2. **Malaysian dev shops and agencies that build for clients** (the "S6" segment).
   - What they get: the public API on every plan, webhooks, ringgit billing.
   - Reached through: `/malaysia` (developer H2), `/for-agencies` (API H2), and the global developer pages the other
     strategies build.
3. **Facebook- and Instagram-first SMEs that also want Threads and X** (one business).
   - Lead message: "Post once to Facebook, Instagram, Threads and X. RM39."
   - Reached through: the BM how-tos and the Meta Business Suite guide.
   - Weak until TikTok opens.
4. **Social sellers ("PM for price", Lives).** Hold all seller-facing pages and ads until the DM beta is open to every
   paid organization and TikTok approves posting (`pricing.md` "Timing").
5. **WhatsApp-centred service SMEs.** Do not target. Say "No WhatsApp" in the FAQ.

**SEA beyond Malaysia:**
- Singapore searches the global English terms; local-modifier queries return 0 [measured, AC-sg]. The English pages
  and USD prices serve it. No Singapore page.
- Indonesia has real how-to demand ("cara menjadwalkan postingan"), but Siar has no rupiah price and no Indonesian copy.
  Local rivals price in rupiah (AutoPost.id, https://autopost.id/). Out of scope.
- BM pages will pull Indonesian impressions anyway (`hl=ms` returns Indonesian completions). Ignore them in reporting.

---

## 5. The site changes this angle needs first (MY-specific Wave 0)

These sit on top of the keyword map's Wave 0 (0.1–0.9). The Malaysian items matter more here, because ringgit numbers
are what AI answers repeat.

| # | Fix | Why | Where |
|---|---|---|---|
| MY0.1 | **Fix the home calculator's server-rendered default.** It shows 40 brands on Pro for RM99, 240 accounts. | Bing Copilot already says "RM399/month for up to 240 connected accounts" [measured, `current-site.md`] | `PriceCalc.astro` lines 10–24 |
| MY0.2 | **Add the trust line beside the price** on `/pricing`, `/malaysia`, `/for-agencies` and `/ms/harga`: "FF DEV STUDIO (SSM 202603234793), Malaysia · ringgit · yearly paid once by FPX or DuitNow · your price never goes up while you stay subscribed · cancel any time, nothing is deleted" | Every local rival shows a version of it [measured]. Buyers check for SSM ("peniaga online perlu daftar ssm" is an autocomplete) [measured] | Pricing component |
| MY0.3 | **Replace the stale DM line** "opening after Meta approval" with the beta wording, or open the beta | Meta approved on 2026-10-27; the line is now wrong the other way | `INBOX_NOTE`, `Billing.vue` line 303 |
| MY0.4 | **Add Malaysian answers to `/llms.txt`**: "Is there a Malaysian social media tool?", "Which tools are priced in ringgit?", "What does it cost to manage social media in Malaysia?", each answered factually, naming Duta, Zoho Social, PostLa, Synova and MarketOS with prices and dates, never "first" | Duta's llms.txt already answers these with itself only [measured]. Siar's live llms.txt has no Malaysia section [measured] | `llms.txt.ts` |
| MY0.5 | **Rule on "unlimited accounts"** (caveat A) | Agency pages cannot ship without it | Owner decision |
| MY0.6 | **Brand disambiguation.** Always "Siar social media API" or "Siar (siaran.my)", never "Siar" alone in titles | siar.my is a Malaysian film-streaming service [measured, `current-site.md` §4] | Titles, `/about`, off-site profiles |
| MY0.7 | **Footer link "Malaysia"** to `/malaysia`, site-wide | Gives the hub site-wide internal links from day one | `Footer.astro` |

---

## 6. Page and content architecture

Slugs, target cluster, purpose. "Wave" here is the order of winnability, not product phasing. "Go" means the owner's go
on comparison pages, which `owner-todo.md` still has open.

### 6a. English Malaysia hub and money pages

| Slug | Cluster | Primary keyword (secondaries) | Purpose and content | Gate | Wave |
|---|---|---|---|---|---|
| **`/malaysia`** (NEW) | C115 | social media scheduler malaysia (social media management tools malaysia; social media api malaysia; scheduler priced in ringgit; p046–p048) | **The GEO answer page.**<br>Title: "Social media scheduler and API for Malaysia, priced in ringgit \| Siar".<br>First 60 words: what Siar is, RM39/RM99/RM399, FPX or DuitNow yearly, FF DEV STUDIO SSM number, and which networks are open today.<br>H2s:<br>"Is there a Malaysian social media scheduling tool?" Yes, several, with a dated table of Duta, Zoho Social, PostLa, Synova, MarketOS and Siar: price, unit, networks, comments, API, payment methods. Every cell sourced. Siar is not ranked first; the table is alphabetical.<br>"Which networks work today" (the open/opening split).<br>"For freelancers and agencies" → `/for-agencies`.<br>"For developers in Malaysia" (API on every plan, ringgit billing).<br>"How you pay" (card monthly; FPX or DuitNow yearly; receipts).<br>"What Siar does not do" (TikTok yet, WhatsApp, groups, BM dashboard).<br>FAQPage JSON-LD only for the visible Q&A | Go (the table names rivals) | 1 |
| **`/for-agencies`** (NEW) | M1 (new cluster; social media tool for agencies, freelance social media manager malaysia (MY22), social media scheduler for agencies (MY6), manage multiple clients social media) | social media tool for agencies | **The conversion page for segment 1.** It works in Malaysia and abroad (ringgit for MY, USD elsewhere).<br>H1: "One login for every client. RM99 for 10 brands."<br>Sections: a brand per client; the branded connect link (no passwords; client signs in themselves); comments inbox; CSV month planning; a bio page per brand; analytics; the API for agencies that build their own portal → C17.<br>The section 3 scenario table, sourced.<br>FAQ: "Can my client log in?" (not today: members see the whole organization). "Two Facebook Pages for one client?" (two brands). "Client reports?" (in the dashboard; no export today). "TikTok?" (opening after approval).<br>Kept apart from C17 by intent: C17 = API, M1 = dashboard. They link to each other | Caveat A wording | 1 |
| **`/guides/social-media-management-cost-malaysia`** (NEW) | C116 | social media management price malaysia (package malaysia; social media marketing malaysia price; agency vs tool) | **The link magnet.**<br>Agency and freelancer ranges, each sourced to the agency's own page and labelled as that agency's claim: ARTO, Shinjiru, Duta's "RM800 to RM15,000", MarketOS FAQ.<br>Then what tools cost (section 3), then "what a tool replaces and what it does not" (writing, design, strategy stay human).<br>Never "replace your agency".<br>Agencies may cite it as a neutral price reference, which earns links [inferred] | None (sourced third-party ranges; vendor tool prices) | 1 |
| **`/compare/zoho-social`** | C62 (pulled up from W3) | zoho social pricing (zoho social alternative; zoho social agency pricing) | The only real ringgit price peer. "zoho social pricing" AC-my 9 [measured].<br>Lead: 10 brands RM99 vs Agency RM920–1,280.<br>Concede: Zoho's 14–16 channels per brand, listening and approvals depth (checked on Zoho's page before printing), Zoho's maturity, and Starter vs Standard being close (RM390 vs RM480 a year) | Go | 1 |
| **`/compare/duta`** (NEW) | M2 (duta alternative; getduta) | Duta vs Siar | AC 0 for "duta social" [measured]. The value is GEO only: the page an engine finds when asked about Duta or the Malaysian field.<br>Lead: RM39 entry, 20 free posts to try with no card, comments, analytics, brands, public API docs, webhooks, DuitNow.<br>Concede: Duta launched first; Telegram; a hosted MCP; no post cap except X; channels connect "as many times as you like".<br>Tone: respectful. Duta is honest about approvals and so must Siar be | Go | 1 |
| **`/compare/meta-business-suite`** | C61 | meta business suite alternative (free) | The real competitor for SMEs is free.<br>Lead: "Meta Business Suite is free for Facebook and Instagram. Use Siar when the same post also goes to Threads, X, LinkedIn and more, or when you run several businesses."<br>Concede: free, native, Meta's own tool. Facts from Meta's help pages | Go | 2 |
| **`/guides/meta-business-suite-scheduling`** | C119 (long tail pulled from W3 to W2) | meta business suite schedule post not working (time zone; bulk schedule posts; limit; can't schedule; not showing) | Troubleshooting first. Fix the native tool's problem with steps from Meta's help.<br>Then an H2 "When to use a scheduler instead", covering CSV bulk and several networks.<br>Gets the EN twin of the BM Instagram and Facebook guides | None | 2 |
| `/pricing` (existing) | C06 | Siar pricing | Add the MY0.2 trust line.<br>Add H2 "Pay in ringgit: card monthly, FPX or DuitNow yearly".<br>Add H2 "Is there a free plan?" (20 free posts to try).<br>**No competitor names** (siar-truth rule 12) | MY0.5 for the accounts H2 | 1 |
| `/about` (existing) | C07 | who makes Siar / is Siar legit | Company, SSM number, Terengganu address, the Meta App Review date (fact, not badge), "built for 15 networks" with the open list | None | 1 |

### 6b. Held English pages (write now, publish when the gate clears)

| Slug | Cluster | Purpose | Gate |
|---|---|---|---|
| `/use-cases/comment-to-dm` | C20 / MY73 | "Comment HARGA, they get the price in DM", for Facebook and Instagram. Starter's 200 runs and 500 DMs per account. Native Meta vs ManyChat vs Siar | DM beta open to every paid organization |
| `/compare/manychat` | C63 | ManyChat bills in USD per active contact (Free $0 for 25; Essential $14 a month billed yearly for 250; Pro $29 for 2,500) [https://manychat.com/pricing, MY IP]. Siar is RM39 with runs counted per account | DM beta |
| `/guides/schedule-tiktok-posts` + BM twin `/ms/cara-schedule-post-tiktok` | MY41, MY57 | The biggest BM how-to topic (AC 10) | TikTok audit passed and production keys live |

### 6c. BM test set (`/ms/`, `lang="ms"`)

This agrees with keyword-map §6 (C121–C127), with these rules from this angle:

- **Voice.** Colloquial Malaysian BM with English trade words ("schedule post", "auto post", "link bio", "client"),
  the way people type it. Fakhrul writes or edits the final text himself. Machine BM is the competitors' weakness
  (SleekFlow, Simplified), not a model.
- **Order on each page.** The free native way first (Meta Business Suite, the Instagram app). Then "post serentak ke
  banyak platform" with Siar. Then price.
- **Honesty lines on every page.**
  - "Dashboard Siar dalam Bahasa Inggeris."
  - "TikTok: belum dibuka lagi."
  - "Siar post ke Page dan akaun profesional sahaja, bukan group atau profil peribadi."
- **hreflang** only between true equivalents. Until the English twins (C117–C119) exist, no hreflang. Do not point it
  at a non-equivalent page.

| Slug | Cluster | Primary | Purpose |
|---|---|---|---|
| `/ms/cara-schedule-post` | C121 | cara schedule post | Hub. One H2 per network that is open (Facebook, Instagram, Threads, X with its credit note, LinkedIn profiles). TikTok and YouTube: one honest "belum dibuka" line, no how-to |
| `/ms/cara-schedule-post-instagram` | C122 | cara schedule post instagram | Steps on PC, laptop and phone, story, reels; "tidak muncul" troubleshooting; then Siar |
| `/ms/cara-schedule-post-facebook` | C123 | cara schedule post di facebook | Pages only, said in the first paragraph; "cara nak…", "cara melihat schedule post" |
| `/ms/cara-schedule-post-threads` | C124 | cara schedule post threads | Weeks-winnable [inferred]; Threads is live in Siar |
| `/ms/cara-auto-post-facebook-instagram` | C125 | cara auto post | Native cross-posting first; the official API only; the groups line |
| `/ms/cara-buat-link-bio` | C126 | cara buat link bio | The native bio link, then Siar's bio page per brand (views and clicks). It must not imply the bio page itself is in BM |
| `/ms/harga` | C127 | harga Siar (berapa kos urus media sosial) | RM39 / RM99 / RM399, yearly by FPX or DuitNow, "20 post percuma untuk cuba" (one-time, said plainly), price lock, the trust line, H2 on agency costs linking to the EN cost guide |
| HOLD `/ms/cara-auto-reply-instagram` | MY79 | cara auto reply instagram | Native first, then Siar automations. DM beta |

**Kill rule (from the keyword map, kept):** verify GSC first; drop the set if it earns no impressions within 8–12 weeks
of indexing. **Add one measure:** count sign-ups whose first page was a `/ms/` URL. The English-only dashboard may
waste BM traffic even if impressions come.

### 6d. Pages this angle says not to build

- A translated home page, translated network or docs pages, or a full `/ms/` site.
- "Best time to post Malaysia" or "waktu terbaik post". The demand is high, but Siar has no posting data of its own.
- Grant pages (Geran Digital PMKS MADANI). Siar is not on MDEC's panel.
- WhatsApp pages.
- "Auto post Facebook group" pages.
- A "Malaysian agency directory". Off-mission, and it ranks Siar against its own buyers.
- Singapore or Indonesia pages.
- "Cheapest social media tool Malaysia". Not true against Meta Business Suite (free) or Zoho Free.
- Self-ranked "best Malaysian social media tools" listicles. MarketOS does this and it reads as vendor spam.

---

## 7. Internal linking

**Hub and spokes.**

```
Footer (site-wide) ── "Malaysia" ──► /malaysia ◄── /pricing (trust line link) ◄── /about
                                       │
     ┌───────────────┬─────────────────┼──────────────────┬───────────────────────┐
     ▼               ▼                 ▼                  ▼                       ▼
/for-agencies   /guides/social-   /compare/zoho-social  /compare/duta     /compare/meta-business-suite
  │  ▲           media-mgmt-cost-       │                   │                    │
  │  └──────────── malaysia ◄───────────┴───────────────────┴────────────────────┘
  ├──► /use-cases/social-media-api-for-agencies (C17) ──► /use-cases/hosted-connect-oauth (C12)
  ├──► /use-cases/link-in-bio-api (C18)
  └──► /pricing (#pro)

/ms/cara-schedule-post (hub) ◄──► each /ms/cara-* page ──► /ms/harga ──► /pricing
                         └──► /malaysia ("Baca dalam English")
/guides/meta-business-suite-scheduling ◄──► /compare/meta-business-suite ◄──► /ms/cara-schedule-post-facebook
```

**Rules.**

1. Every MY page links to `/malaysia` once in the body, and `/malaysia` links to every MY page.
2. Every price mention links to `/pricing` (EN) or `/ms/harga` (BM). Nothing else carries price detail, so engines
   learn one source of truth.
3. Every compare page links to the `/compare` hub (C46) and to the cost guide. The cost guide links to every compare page
   in its tools table.
4. The network status line on each page (open / opening after approval) links to `/platforms`.
5. Network pages (`/facebook-api`, `/instagram-api`, `/threads-api`) get one body link each to the matching BM how-to,
   with BM anchor text and `hreflang` left off (they are not equivalents).
6. Anchor text names the thing: "social media tool for agencies", "kos urus media sosial di Malaysia",
   "Zoho Social pricing compared". Never "click here" or "learn more".
7. `/for-agencies` and C17 must not share a title keyword. M1 = "social media tool for agencies". C17 = "social media
   API for agencies".
8. Held pages are not linked from anywhere until they publish. No "coming soon" stubs indexed.

---

## 8. Off-site plan (Malaysia)

Ordered by expected effect on AI answers and buyers (inferred). Everything is under the real name and discloses the
affiliation: no astroturfing, no paid listicle placements, no review swaps (`geo/offsite-plan.md`). Items marked
**unverified** depend on a submission process I could not check this pass.

| # | Action | Target | Why | Owner |
|---|---|---|---|---|
| O1 | **Pitch inclusion in the Malaysian pages that already answer "social media scheduler malaysia"** with a 3-line factual note: price, unit and payment methods, plus the `/malaysia` link | The Brave top 10 (measured once, unverified on re-check): nineten.ai, planable.io/blog, shinjiru.com.my/blog, newnormz.com.my, neeko.my, flowdigital.my, justsimple.com.my, zenweb.my. Also xwork.my's "AI marketing tools Malaysia 2026" (published 2026-07-27; lists Buffer RM26/channel, Hootsuite RM398, RADAAR from RM130 and Canva; contact form on page) [sourced: https://www.xwork.my/ai-marketing-tools-malaysia-2026/, fetched today; its RM figures are the agency's conversions, not vendor prices] | These pages are what engines can find for Malaysian prompts. Being in them beats ranking against them [inferred] | Fakhrul sends |
| O2 | **Malaysian tech press, with one true story:** "A Terengganu studio's social media API passes Meta's App Review for 27 permissions, priced in ringgit". No "first", no "partner" | Vulcan Post, Digital News Asia, SoyaCincau, Lowyat.NET, The Edge (Digital Edge), e27, Tech in Asia. Submission routes **unverified** | Press articles are the third-party mentions engines weight; Siar has 0 [measured, `competitors.md`] | Fakhrul |
| O3 | **Real participation in freelancer and SME groups** (Facebook groups for social media admins and online sellers, Lowyat forum, r/malaysia and similar). Answer scheduling and Meta Business Suite questions first; disclose; link a BM how-to only when it is the answer. A few genuine answers a week | Group names and rules **unverified**; check each group's self-promotion rules before posting | The forum-voice gap is also a research gap (`malaysia-market.md` §11): read before posting | Fakhrul's own account |
| O4 | **Siar's own social accounts, posted through Siar,** in colloquial BM and English: the BM how-tos as carousels, the agency price arithmetic, the "official API only" line | FF Dev Studio and Siar profiles (which Siar profiles exist is **unverified**) | Dogfooding is a true demo. Every post is evidence the product works | Fakhrul |
| O5 | **Directory listings with a Malaysia field**: AlternativeTo, Capterra/GetApp, G2, SourceForge (from keyword map Wave 1). Set the location to Malaysia and the currency to MYR where the form allows | Listing forms **unverified** for MYR fields | They hold Google's top 5 for "ayrshare alternatives" [measured, AV1]. A Malaysia field helps local prompts [inferred] | Fakhrul's go |
| O6 | **Partner listings with Malaysian commerce platforms**: an app or integration listing on EasyStore, SiteGiant or StoreHub (their merchants already sell on FB/IG Live) and Bukku (accounting SMEs) | Whether each runs a public app marketplace that accepts third parties is **unverified** | A listing is a backlink and a distribution channel to the exact SME base [inferred]. Needs a real integration, which Fakhrul builds | Fakhrul |
| O7 | **CHIP**: ask whether CHIP features merchants or partners | **unverified** | A Malaysian payments brand linking to Siar is a local trust signal [inferred] | Fakhrul |
| O8 | **MDEC digital grant panel**: apply when a new round opens (none verified for 2026) | BSN grant page: "50% atau maksimum RM 5,000"; software must be on MDEC's panel [sourced: https://www.bsn.com.my/page/MSMEMadani?lang=ms-MY] | MarketOS already uses the grant in its FAQ. Being on the panel is a real SME sales channel [inferred]. Do not mention the grant until listed | Fakhrul |
| O9 | **Google Business Profile for FF DEV STUDIO**: skip | `docs/approvals/google.md`: FF is not eligible for a profile | n/a | — |

**Do not:**
- Seed testimonials. No customers exist (siar-truth §5).
- Pay Malaysian "best tools" blogs for inclusion.
- Post in Facebook groups from personal accounts as a fake buyer.
- Use any FF-owned brand as a "customer". If FF's own brands post through Siar, say so only as "FF's own brands", same owner.

---

## 9. What to say and what never to say

### 9a. Say (all true today)

**English, agencies:**
- "10 brands on Pro for RM99 a month. Under RM10 a client."
- "Your clients connect their own accounts through a link with your name and logo. You never ask for a password."
- "No per-account fees. Each brand connects one account on every open network." (until caveat A is ruled)
- "Answer comments from Facebook, Instagram, Threads, X, Bluesky and Mastodon in one inbox."
- "Plan a month for a client in a CSV and schedule it at once."
- "Each brand gets a link-in-bio page with views and clicks."

**English, Malaysia:**
- "Ringgit prices for Malaysian organizations. Card monthly, or pay a year once by FPX or DuitNow."
- "Paid to FF DEV STUDIO (SSM 202603234793), a Malaysian company. A numbered receipt for every payment."
- "Your price never goes up while you stay subscribed."
- "20 free posts to try. No card."
- "Siar posts through each network's official API, to Pages and professional accounts, never to groups or personal
  profiles. Siar's Meta app passed Meta's App Review on 27 October 2026."
- "Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack. TikTok,
  Pinterest publishing and LinkedIn company pages open as each network approves Siar."

**BM (colloquial; Fakhrul edits for voice).** Allowed now:
- "Post sekali, keluar kat Facebook, Instagram, Threads dan X. RM39 sebulan."
- "10 client, RM99. Kurang RM10 satu client."
- "Harga Malaysia. Bayar dalam ringgit, kad atau FPX/DuitNow untuk setahun."
- "20 post percuma untuk cuba. Tak perlu kad."
- "Client sambung akaun sendiri. Tak payah minta password."

Held until the gate clears:
- "Comment HARGA, terus dapat DM." (DM beta open to all)
- "Schedule TikTok pun boleh." (TikTok)

### 9b. Never say

| Never | Why |
|---|---|
| "First", "only", "#1", "the Malaysian scheduler" | Duta was public by August 2026 and claims "first" [measured] |
| "Cheapest" / "half the price of everyone" | Meta Business Suite is free; Zoho Free exists; Zoho Standard yearly is close (RM480 vs RM390) |
| "Unlimited accounts" without the per-brand rule; "unlimited clients" below Business | One live account per network per brand [code] |
| "Post to TikTok", "TikTok scheduling", TikTok in any demo | Sandbox only |
| "LinkedIn company pages", "LinkedIn Pages for your clients" | Access denied |
| "Comment-to-DM / auto DM" as available to everyone; "DMs from every network" | Beta, FB + IG only, on request |
| "White-label", "your domain", "in your client's language" | Connect page says "Powered by Siar", is on app.siaran.my and is in English |
| "Client login", "client approval", "client reports / PDF reports" | Not in the code |
| "BM support", "WhatsApp support", "reply within X hours", "phone support" | Email support only; the phone number is a contact line |
| "e-Invoice ready", "MyInvois", "LHDN compliant" | Not in the code |
| "Inclusive of SST", "plus SST" | No SST line at all (siar-truth rule 9); "prices are final" only |
| "Meta partner", "Meta verified", "official partner" | App Review is a fact about Siar's app, not a badge |
| "Grant eligible", "claim 50% back" | Not on MDEC's panel |
| "No FX fees" | Not true for cards issued abroad |
| "20 posts" bare, "free forever", "free monthly posts" | Free is a one-time allowance |
| Customer counts, "trusted by Malaysian businesses", testimonials, ratings | None exist |
| "Built for 15 networks" without the open/opening split beside it | siar-truth §1a |
| "Siar" alone in a title | Collides with siar.my (film streaming) |
| Machine-translated or formal BM ("jadualkan hantaran serentak") | 0 completions [measured]; reads like the competitors' machine BM |

---

## 10. Owner decisions this angle depends on (ordered by Malaysian impact)

1. **Open the DM / comment-to-DM beta to every paid organization.**
   - Unlocks G3, the SME ads, the C20, C63 and MY79 pages, and "Comment HARGA".
   - The single largest Malaysian lever [inferred: highest-demand BM and MY terms, rivals in USD or at RM399+].
2. **"Unlimited accounts" wording or model** (caveat A). Blocks `/for-agencies`, the cost-guide tables and the `/pricing`
   H2.
3. **Go on comparison pages** (rivals named). Blocks the `/malaysia` table, `/compare/zoho-social`, `/compare/duta` and
   `/compare/meta-business-suite`.
4. **TikTok resubmission** (hand-recorded films, `approvals/README.md`). Unblocks segments 3 and 4 and the TikTok how-tos.
5. **The BM test.** It contradicts `geo/plan.md` ("no BM version"). This angle says run it, with the kill rule.
6. **Off-site sends** (O1, O2, O5, O6). All need Fakhrul's go and his own accounts.

---

## 11. Measurement

- **Prerequisites:** GSC and Bing Webmaster Tools verified (keyword map 0.1). Without them none of the kill rules can
  run.
- **AI answers.** Add a Malaysian prompt set, frozen as `prompts_my_v1`, run every 4 weeks by hand in ChatGPT,
  Perplexity, Gemini and Copilot:
  - "Is there a Malaysian social media scheduling tool?"
  - "Social media scheduler priced in ringgit"
  - "Cheapest way for a freelancer in Malaysia to manage 10 clients' social media"
  - "Zoho Social alternative Malaysia"
  - "Cara schedule post Instagram dan Facebook serentak"
  - "Social media API Malaysia"

  The win condition is Siar named, with the right price, in the same answer as Duta.
- **Search.** GSC impressions and clicks for `/malaysia`, `/for-agencies`, the cost guide, the three comparisons and the
  `/ms/` set, filtered to country = Malaysia.
- **Business.** Sign-ups and Pro trials by first landing page; organizations whose billing country is MY.
- **Kill rules.**
  - The BM set: no impressions within 8–12 weeks of indexing → drop it.
  - `/compare/duta`: no AI citation and no impressions in 12 weeks → merge it into `/malaysia`.

---

## Sources

Re-fetched by me on 2026-11-12:
- https://getduta.com/pricing
- https://getduta.com/llms.txt
- https://getduta.com/sitemap.xml (23 URLs)
- https://www.zoho.com/social/pricing.html (no prices render in a server fetch; prices from the teardown's MY-browser read
  the same day)
- https://www.xwork.my/ai-marketing-tools-malaysia-2026/
- https://siaran.my/llms.txt, https://siaran.my/pricing, https://siaran.my/contact

Vendor pages measured by the teardown on 2026-11-12 (`research/competitors/my-sea-schedulers.md`):
- MarketOS: https://mymarketos.com/en/pricing
- PostLa: https://postla-page.pages.dev/pricing.html
- Synova: https://zynex-ai-v2.pages.dev/synova.html
- Prism Reach: https://prismxtech.com/reach
- SleekFlow: https://sleekflow.io/en-my/pricing.md
- ManyChat: https://manychat.com/pricing
- Buffer: https://buffer.com/pricing
- AutoPost.id: https://autopost.id/
- Meta help: https://www.facebook.com/business/help/1252240869631062
- BSN grant page: https://www.bsn.com.my/page/MSMEMadani?lang=ms-MY

Siar code read on 2026-11-12:
- `apps/api/prisma/schema.prisma` (line 4; `OrganizationMember`; no approval or team-member model)
- `apps/api/src/domain/plans.ts`
- `apps/api/src/modules/accounts.ts` line 106
- `apps/api/src/modules/billing-core.ts` (receipts)
- `apps/site/src/pages/refunds.mdx`
- `apps/site/src/config.ts`
- `apps/web/src/views/` (no analytics export)

Demand: Google autocomplete gl=my, measured by teammates (`research/keywords/malaysia-bm.md`). Market figures:
`research/market/malaysia-market.md`.

Not done: no WebSearch (budget exhausted), so there are no new SERP or ranking checks. The Malaysian forum-voice gap
and the off-site submission routes (O2–O7) remain unverified.
