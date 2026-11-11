Verified 2026-11-12: 14 corrections

# Market research: Malaysia, for Siar

Checked 2026-11-12. Builds on `keywords/malaysia-bm.md` (Malaysian and BM search demand, measured autocomplete) and
`competitors/my-sea-schedulers.md` (local schedulers, inbox tools and global tools priced from a Malaysian IP). Those files
are not repeated here; this file covers the buyers: who they are, how they sell on social, what they already pay, how they
pay, what makes them trust a vendor, and the words they use. Every Siar fact follows `siar-truth.md`.

Labels used on every claim:

- **measured**: I fetched the page or data myself on 2026-11-12 (or a teammate did, in the files named above).
- **sourced**: a page with its URL. Vendor pages are the vendor's own claims about themselves. Pages by agencies, inbox
  vendors or other third parties are marked **third-party** with their commercial interest.
- **inferred**: my reading or arithmetic. Not proven.

## 0. Limits of this pass (read first)

- **The team's shared WebSearch budget (200 calls) was used up before this task started.** Every search I tried returned
  "budget used up". I did not work around it. All evidence here comes from direct fetches of known URLs, the autocomplete
  data a teammate measured earlier today, and pages already saved by the team.
- **Consequence: there are almost no verbatim quotes from real buyers on Reddit, Lowyat or Facebook groups in this file.**
  The verbatim phrases in section 9 come from (a) Google autocomplete (what people type, measured), (b) Malaysian vendors'
  own pages (how sellers and tools talk), and (c) third-party articles. Forum voice is the biggest gap. Section 11 lists
  the exact queries to run when the budget resets.
- Several official pages could not be read: SME Corp's MSME profile (HTTP 403), DOSM e-commerce release (database error),
  LHDN e-invoice timeline (404), bank card-fee pages for Maybank, CIMB and Hong Leong (timeouts, 404 and an error page).
  Facts that depend on them are marked **unverified**.
- **Verification pass (2026-11-12, adversarial).** Every vendor page cited here was re-opened: CHIP, Stripe MY, Bukku,
  Google Workspace MY, StoreHub, EasyStore (pricing + live commerce), SiteGiant, SleekFlow (blog, MY pricing, ms-my home),
  respond.io (blog + pricing), Duta (home + pricing), MarketOS (home, pricing, FAQ JSON-LD), PostLa (home + pricing),
  Prism Reach, Synova, ARTO, Shinjiru, DataReportal, PayNet, Fintech News, the e-Conomy PDF and siaran.my/privacy. Zoho
  Social, Canva, EasyStore and ManyChat were read in a browser on a Malaysian IP. Siar facts were checked against
  `siar-truth.md` and `apps/api/src/domain/plans.ts`. Google autocomplete (gl=my) was re-checked for the seeds this file
  quotes. **WebSearch was again unavailable (shared budget used up), so no SERP "who ranks" check could be run.** This
  file makes no ranking claims; any added later need a search re-run.

---

## 1. The market in numbers

| Fact | Figure | Source | Label |
|---|---|---|---|
| Internet users | 35.4 million, 98.0% of the population, late 2025 | DataReportal, Digital 2026 Malaysia, published 8 Nov 2025: https://datareportal.com/reports/digital-2026-malaysia | sourced (third-party, widely cited) |
| Social media user identities | 30.7 million, 85.0% of the population, Oct 2025 | same | sourced |
| Ad reach by platform | YouTube 23.6M, Facebook 23.0M, Instagram 16.1M, LinkedIn 10.0M members, X 4.81M, Threads 3.60M. TikTok 30.7M adults 18+ (the report itself flags this as above the adult population) | same | sourced. Ad reach is not active users |
| Digital economy GMV | US$48B in 2026 (US$40B in 2025), US$69B by 2030 on the chart | Google, Temasek, Bain, e-Conomy SEA 2026 Malaysia report, p.6: https://services.google.com/fh/files/misc/malaysia_e_conomy_sea_2026_report.pdf | sourced |
| E-commerce GMV | Chart labels read US$17B (2024), US$21B (2025), US$25B (2026), US$37B (2030) | same, p.6 (read from chart labels in the PDF text) | sourced; the year-to-value mapping is my reading of the chart: inferred |
| Social commerce | "Social commerce has firmly entered the mainstream" | same, p.3 | sourced (no figure given) |
| Language mix | Bahasa Melayu and other local languages are 41% of Malaysian AI conversations, "the most balanced mix in the region" | same, p.5 (Google/YouGov, n=9,006) | sourced |
| All PayNet transactions | 8.44 billion in 2025 | PayNet press release, 22 Apr 2026: https://www.paynet.my/about-us/media-centre/press-release/8-44-billion-transactions-processed-in-2025-as-digital-payments-become-malaysians-preferred-way-to-pay.html | sourced (operator of FPX and DuitNow) |
| DuitNow QR acceptance | 681,250 new acceptance points in 2025, 267,780 of them MSMEs; "more than three million" registered DuitNow QR touchpoints | same | sourced |
| DuitNow QR volume | "more than doubled in 2025 to three billion transactions" | Fintech News Malaysia, 4 May 2026: https://fintechnews.my/58266/payments-remittance-malaysia/qr-payments-malaysia/ (linked from paynet.my) | sourced |
| Number of SMEs | not fetched (SME Corp page returned 403) | https://www.smecorp.gov.my | **unverified** |

Inferred reading: almost every Malaysian is online and on social media;
DuitNow QR is spreading fast among MSMEs (card figures were not checked, so no comparison with cards). E-commerce GMV goes from about US$21B to US$25B between 2025 and 2026 on the chart, roughly 19% (inferred).

---

## 2. Segments

Sizes are not available per segment. Ordering is by fit with what Siar can truthfully sell **today** (publishing to
Facebook Pages, Instagram professional accounts, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack;
comments in a shared inbox; Facebook and Instagram DMs and comment-to-DM as a per-organization beta on request;
no TikTok publishing yet, YouTube uploads private, no WhatsApp, email support only, dashboard in English).

| # | Segment | How they sell / work today | What they already pay | Siar fit today | Gate |
|---|---|---|---|---|---|
| S1 | **Freelance social media admins** (manage 2–10 small clients) | Post for clients on Meta Business Suite and Canva; reply to comments and DMs by hand. "freelance social media manager malaysia" and "admin media sosial freelance" are real autocompletes (measured, `malaysia-bm.md`) | Charge clients RM800–2,500 a month each (section 4); pay Canva Pro RM250/year (measured, teardown §7) | **Strong**: Pro RM99 = 10 brands, unlimited accounts. Between about 0.4 and 1.25 months of a single client's fee pays for a year of Pro (inferred: RM990 yearly ÷ RM2,500 to RM800 a month per client) | none for publishing to FB/IG/Threads/X/LinkedIn profiles. Weak without TikTok |
| S2 | **Small agencies** (social retainers, 5–30 clients) | Retainers RM1,120–12,000 a month per client (section 4). Use Buffer / Hootsuite (named in one Malaysian agency roundup, xwork.my, third-party) or native tools; Zoho Social is the ringgit-priced peer but no roundup was found naming it (teardown §1a, inferred) | Zoho Agency RM920–1,280/month for 10 clients (measured, teardown §7) | **Strong**: Pro (10 brands) or Business RM399 (unlimited brands) | TikTok and LinkedIn company pages matter to agencies; both not available |
| S3 | **Social-first micro sellers** (fashion, food, beauty, kuih, pre-order; sell through FB/IG posts, Lives and chat) | Post, then close in DMs or WhatsApp; buyers comment "PM", "+1", "Interested" (EasyStore, sourced); pay by "e-wallets, QR payments, and payment links" (SleekFlow, sourced) | Mostly free tools (Meta Business Suite, TikTok Studio, WhatsApp Business app); Canva | **Medium today, strong later**: Starter RM39 for multi-network posting and comments. The real hook (comment-to-DM, "Comment HARGA") is beta | DM beta opening to all paid plans; TikTok approval; BM ads wait for both (`pricing.md`) |
| S4 | **Established SMEs with a store and marketplaces** (Shopee, Lazada, TikTok Shop; EasyStore/SiteGiant/StoreHub users) | Store platform runs orders and live selling; marketing posts done in-house or by a freelancer | EasyStore RM249–1,199/month, StoreHub RM122–471/month (measured, section 5) | **Medium**: Starter as the "post everywhere" layer next to their store | TikTok; they compare against all-in-one suites (MarketOS RM199+) |
| S5 | **Service SMEs that sell in chat** (F&B, clinics, beauty, property agents, car and motor dealers) | "Customers message on WhatsApp, Instagram or TikTok to ask about price, stock, financing or the nearest outlet" (respond.io, sourced) | SleekFlow RM399–1,399/month, respond.io US$79–349/month (measured, teardown §6) | **Weak**: their centre is WhatsApp, which Siar does not have | WhatsApp is a product gap, not an SEO target |
| S6 | **Malaysian developers and SaaS teams** adding social posting to their own product | Build on Meta/X APIs directly or pay a USD API (Ayrshare, bundle.social, Late) | USD prices by card (see other competitor files) | **Strong**: public API, SDK, webhooks on every plan; ringgit billing for MY organizations | none for the live networks |

Inferred priority: S1 and S2 now (they buy brands, Siar's Pro fence fits them, no BM or DM gate), S6 now (English, already
targeted by the site), S3 and S4 after DMs leave beta and TikTok is approved. S5 only if WhatsApp is ever built.

---

## 3. How Malaysian SMEs sell on social (the habits)

**3a. "PM for price" and comment keywords.**

- EasyStore's live-commerce page (measured: https://www.easystore.co/en-my/live-commerce, checked 2026-11-12) describes
  buyers ordering by commenting short replies: "PM", "+1" or "Interested". On Facebook Live "Your customers will receive a purchase link via
  Messenger"; the page also says every live comment "will trigger the system to send a purchase link to your customers'
  inbox" (corrected 2026-11-12: the earlier quote was not on the page). Label: sourced (vendor describing its own feature
  and its merchants' habit).
- SleekFlow's Malaysia social-commerce guide (https://sleekflow.io/blog/social-commerce-malaysia, modified 13 Apr 2026)
  tells sellers to pin a call to action like "Comment 'PRICE' and we'll send options" and to "Make chat the CTA".
  (Corrected 2026-11-12: the quote "drives most closes" is not on the page and was removed.) Label: sourced (third-party,
  inbox vendor).
- `docs/pricing.md` (owner's own record) already names "PM for price" and "comment HARGA" as how Malaysian online
  selling runs. Label: owner's view, consistent with the two sources above.
- Search check (measured, `malaysia-bm.md` row 90): "comment harga" 0 completions, "komen harga" only "harga komen buzzer",
  "pm harga" completes to Indonesian and time-of-day meanings. **The habit is real; it is not a search term.** It belongs
  in ads and in-product copy, not in page titles.
- Why sellers hide the price behind "PM" is not established by any source I could fetch. Commonly given reasons
  (avoid competitors copying prices, start a conversation that can be upsold, algorithm reach from comments) are
  **unverified** until forum threads are read (section 11).

**3b. Live selling.** EasyStore Standard (RM249/month) includes "Unlimited social & live orders", and the plan table ticks
"Live channels" (Facebook Live / Instagram Live) on all four plans; SiteGiant lists Facebook Live on its Webstore plans (both measured). Inferred: live
selling is common enough that two Malaysian commerce platforms build it into their base plans. "live selling malaysia"
gets 1 Malaysia-specific completion (itself, plus 3 generic "what is live selling" questions) and "sistem tempahan live" 0
(measured, re-checked 2026-11-12): sellers do not search for it as a tool.

**3c. Close in chat, pay by QR or transfer.** SleekFlow (sourced, third-party) names "e-wallets, QR payments, and payment
links" sent in chat, and says WhatsApp Pay is not used in Malaysia while TikTok Shop has in-app checkout. respond.io
(https://respond.io/blog/malaysian-b2c-teams-choose-respondio, 12 Oct 2026, sourced, third-party) says most teams answer
"from the WhatsApp Business App, each channel's own inbox and, often, salespeople's personal numbers".

**3d. TikTok Shop and marketplaces.** "tiktok shop seller center malaysia", "cara jual online di tiktok shop" and
"tiktok live agency malaysia" are real completions (measured, teardown and `malaysia-bm.md`). EasyStore syncs Shopee,
TikTok Shop, Lazada, PGMall and Zalora; SiteGiant syncs TikTok Shop on Webstore Pro (measured). Inferred: TikTok Shop is
now a default channel for product sellers. Siar cannot serve it yet (TikTok publishing not approved; no TikTok Shop API).

**3e. Facebook groups and grey automation.** "auto post facebook group(s)" leads its autocomplete (measured), and a
Malaysian desktop tool (Prism Reach, RM159/month) automates personal accounts in groups, warning of restriction on its
own page (measured, teardown §5). Siar posts to Pages through Meta's official API only. This demand is off-limits.

---

## 4. Agencies and freelancers: what managing social costs in Malaysia

All of these come from parties who sell the service or a rival tool. None is a survey.

| Who | Range (RM per month) | Source (checked 2026-11-12) | Label |
|---|---|---|---|
| Freelancer | 800–2,000 | ARTO, https://arto.com.my/social-media-agency-pricing-malaysia/ (2026, no exact date) | sourced, third-party agency |
| Freelancer | 800–2,500; "true" cost incl. hidden extras 2,005–5,950 | Shinjiru, https://www.shinjiru.com.my/blog/why-malaysian-brands-are-ditching-freelancers-for-social-media-management-agencies/ (18 Jun 2026) | sourced, third-party agency (argues against freelancers) |
| Small agency / SME retainer | 2,500–5,000 | ARTO | sourced, third-party |
| Agency packages | from 1,120 (12-month term); JustSimple entry 1,800; range 1,120–4,800 | Shinjiru | sourced, third-party |
| Full-service agency | 5,500–12,000; premium 10,000–20,000+ | ARTO | sourced, third-party |
| Agency, any kind | "roughly RM800 to RM15,000 a month" | Duta, https://getduta.com/ | sourced, competitor's claim |
| Agency | RM3,000–8,000 | MarketOS FAQ (teardown §1a) | sourced, competitor's claim |
| TikTok Ads management | 2,000–6,000 on top of ad spend | ARTO | sourced, third-party |
| KOL posts | nano 200–800, micro 800–3,000, mid-tier from 3,000 per post | ARTO | sourced, third-party |

Inferred: the floor for paying a person is about RM800 a month. Siar Starter (RM39) is under 5% of that floor; Pro
(RM99 for 10 brands) is about 12% of one freelancer client's minimum fee, and covers ten. For a freelancer the pitch is
cost per client, not cost per month.

Buyer pains these pages describe (quotes, sourced, both third-party agencies):

- "Most Malaysian agencies don't publish prices, so brand managers end up comparing quotes" (ARTO).
- "two quotes of the same headline number can differ by thousands of Ringgit" (ARTO).
- Freelancers are "Unavailable during weekends, public holidays, sick leave" and deliver "Canva templates with logo
  swapped in" (Shinjiru; wording corrected 2026-11-12 to match the page).
- Shinjiru claims an average freelancer tenure of 4.2 months (no source given: unverified).

---

## 5. What Malaysian SMEs already pay for software, in ringgit

| Product | Category | Price shown to Malaysia | Source (checked 2026-11-12) | Label |
|---|---|---|---|---|
| Bukku | Accounting (local) | Launch RM0 (firms under 6 months), Seed RM35, Grow RM65, Prime RM95, Elite RM135 per month; yearly = 10 months; **plus 8% SST**; LHDN e-Invoice on all plans; Elite 30-day trial "no credit card needed" | https://bukku.my/pricing | measured |
| Google Workspace | Email and docs | Starter RM14.60 intro / RM29.20 per user/month; Standard RM35.04 intro / RM58.40; Plus RM91.70; intro prices for the first 20 users, 25 Nov 2026 to 25 Nov 2027; excluding tax; "All prices MYR" | https://workspace.google.com/intl/en_my/pricing.html | measured |
| Canva | Design + social planner | Pro RM250/year; Business RM420/year per person | teardown §7 | measured |
| Zoho Social | Scheduler | Standard RM40 (per month billed yearly) / RM60 (monthly); Agency (10 clients) RM920 / RM1,280; also a Free plan (1 brand, 6 channels); "Local taxes (VAT, GST, etc.) will be charged in addition" | https://www.zoho.com/social/pricing.html (browser, MY IP) | measured |
| StoreHub | POS (local) | Starter from RM122, Advanced from RM235, Pro from RM471 per month | https://www.storehub.com/my/pricing/ | measured |
| EasyStore | Online store (local) | Pay monthly: Standard RM249, Business RM499, Growth RM899, Success RM1,199 ("Contact Us") per month. Pay yearly (the default view): RM199, RM249, RM449, RM999 per month under a "50% OFF First Year" label; "Always 0% transaction fees" | https://www.easystore.co/en-my/pricing | measured |
| SiteGiant | Store + marketplace ERP (local) | Prices are images, not readable text | https://sitegiant.my/pricing/ | measured: **price unverified** |
| SleekFlow | Chat inbox | Pro RM399 (yearly) / RM449; Premium RM1,199 / RM1,399 | https://sleekflow.io/en-my/pricing.md | measured |
| respond.io | Chat inbox (KL HQ) | US$79/month (Starter, billed yearly) to US$349/month (Advanced, billed monthly), USD only | https://respond.io/pricing | measured |
| ManyChat | Comment-to-DM | Free US$0; paid US$14–199 per month (US$14 yearly to US$199 monthly on the tiers shown), USD only | https://manychat.com/pricing (browser, MY IP) | measured |
| Duta / PostLa / MarketOS | Local schedulers | RM99 (RM990 yearly); RM97 (3 accounts) / RM197 (10 accounts); RM199–1,499 | https://getduta.com/pricing ; https://postla-page.pages.dev/pricing.html ; https://mymarketos.com/en/pricing | measured |

Inferred:

1. **The anchor band for a one-business SME tool is RM35–RM65 a month.** Bukku Seed (RM35), Zoho Standard (RM40–60) and
   Google Workspace for a few users sit there. Siar Starter at RM39 lands inside it, as `pricing.md` intended.
2. **Above RM100 a month, SMEs expect the tool to run sales**, not marketing: POS (StoreHub), store (EasyStore) or chat
   inbox (SleekFlow). A scheduler at RM99+ (Duta, PostLa Pro, MarketOS) has to justify itself against those.
3. **Local SaaS shows ringgit, yearly = 10 months, and states SST.** Bukku uses the same "pay for 10 months" yearly rule as
   Siar. Siar does not charge SST because FF DEV STUDIO is not registered (`pricing.md`); the page should say prices are
   final (it must not say "inclusive of SST").
4. **The e-invoice mandate pushes SMEs into paid accounting software** (Bukku leads with "LHDN e-Invoice"). Timeline and
   thresholds could not be fetched from LHDN: **unverified**. It is a trigger for software buying in general, not for Siar.

---

## 6. How they pay

**6a. Rails.** DuitNow QR doubled to about 3 billion transactions in 2025, with 3M+ touchpoints and 267,780 new MSME
acceptance points (section 1, sourced). Card figures from Bank Negara are only in downloadable tables I did not open
(https://www.bnm.gov.my/payment-statistics): **unverified**.

**6b. What each method costs the merchant (measured, vendor pages, 2026-11-12).**

| Method | CHIP (https://www.chip-in.asia/pricing) | Stripe Malaysia (https://stripe.com/en-my/pricing) |
|---|---|---|
| FPX (B2C) | RM1.00 flat | 3% + RM1.00 |
| FPX B2B | RM2.00 flat | not listed |
| DuitNow QR (online) | 1.0% | not listed |
| Local credit card | 2.0% | 3% + RM1.00 |
| Local debit card | 1.0% | 3% + RM1.00 |
| Foreign card | 3.0% | +1% for international cards, +2% if currency conversion is needed |
| E-wallets (TNG, GrabPay, ShopeePay) | 1.4% | GrabPay 3% |

Inferred, for Siar's own costs: a yearly Starter paid once by FPX (RM390) costs RM1 through CHIP and about RM12.70
through Stripe. This supports keeping FPX/DuitNow as the yearly pay-once route and routing ringgit to CHIP first, as
`pricing.md` already does.

**6c. Foreign transaction fees on the buyer's side.**

- Duta's home page states that with USD-billed tools "the card issuer adds a foreign transaction fee on top" (sourced,
  competitor's claim, https://getduta.com/; quote wording corrected 2026-11-12). PostLa's comparison row says "USD pricing, costly for SMEs" (measured).
- The size of Malaysian banks' foreign-currency markup could not be verified from any bank page (three attempts failed).
  **Unverified.** Do not put a percentage in copy until it is sourced from a bank's own fee page.
- What Siar may say (from `siar-truth.md` §4): "Ringgit prices for Malaysian organizations; pay yearly once by FPX or
  DuitNow; paid to a Malaysian company." Do not claim "no FX fees" for cards issued abroad.

**6d. What local rivals offer at checkout (measured, teardown and saved pages).** Duta: card, FPX on yearly. MarketOS:
"Pay with FPX", "Pay in RM". PostLa: "bank transfer, credit card, and PayNet". Prism Reach: "FPX or DuitNow QR (scan with
TNG or any banking app)" plus "Full refund within 7 days if unused". SleekFlow: cards through Stripe; bank transfer or cheque only for invoices over US$10,000.
Inferred: FPX is table stakes for a Malaysian SaaS checkout; DuitNow QR is the newer signal; Siar has both for yearly.

---

## 7. Trust signals that matter locally

**What local vendors put on the page to earn trust (measured from their own pages, 2026-11-12):**

| Signal | Who shows it |
|---|---|
| A "built in/for Malaysia" line | Duta ("Built in Malaysia"), PostLa ("Built for Malaysian businesses with Malaysian support", "Made with ❤️ in Malaysia"), MarketOS ("Built for Malaysia."), Prism Reach ("Built for Malaysian SME sellers") |
| Priced and billed in ringgit, "not dollars converted at whatever the rate is that morning" | Duta, MarketOS ("All prices in Ringgit Malaysia"), PostLa |
| Malaysian time by default (Asia/Kuala_Lumpur) | Duta |
| WhatsApp support; support in BM | PostLa ("WhatsApp support, BM available"), Prism Reach (WhatsApp +60). Synova shows neither: its site is bilingual EN/中文 and its paid tier says "Priority support" (corrected 2026-11-12) |
| FPX / DuitNow at checkout | MarketOS, Prism Reach, Duta (FPX) |
| "PDPA compliant" in the trust row | MarketOS |
| Refund promise | Prism Reach ("Full refund within 7 days if unused") |
| Physical location and a Malaysian phone number | Prism Reach (KL, +60), Synova ("Johor Bahru, Malaysia", no phone or street address shown) |
| Big-brand proof: logos, G2 badges, "Meta Business Partner"; ISO 42001 and SOC appear only as unlabelled footer images (an `iso-42001` file name and an AICPA link), so treat those two as inferred | SleekFlow (international player) |
| Named local testimonials | MarketOS (unverifiable; the teardown flags its "2,400+ SMEs" as unsourced) |

**What buyers search that shows the trust worry (measured autocomplete, gl=my, teammate's data):**
"peniaga online perlu daftar ssm", "ssm untuk peniaga online", "report peniaga online penipu", "aduan peniaga online
penipu". Inferred: SSM registration is the shorthand Malaysians use for "is this a real business", and scam fear is
strong enough that "how to report a scam seller" is a top completion. A Malaysian SME buying software carries the same
reflex: is there a registered company behind it?

**What Siar can show truthfully today** (`siar-truth.md` §1d, live site): operator FF DEV STUDIO with SSM number
202603234793; a Malaysian phone number in the footer of every page (a contact line, not a support promise); ringgit
prices; FPX and DuitNow for yearly; "Your price never goes up while you stay subscribed"; a privacy policy that names
Malaysia's Personal Data Protection Act (measured: https://siaran.my/privacy).

**What Siar must not show:** WhatsApp or BM support, reply times, customer counts, testimonials, "Meta partner" or any
badge from the app approvals, "first/only Malaysian scheduler" (Duta launched earlier).

Inferred recommendation: put the SSM number, "Malaysian company", ringgit and "FPX or DuitNow" together in one trust line
near the price, because local rivals already do and buyers check for it. A refund policy line, if Fakhrul has one, is the
missing piece rivals show (not checked here: Siar's refund terms are not in `siar-truth.md`).

---

## 8. Pains, jobs, triggers, objections

### 8a. Pains (with sources)

| Pain | Evidence | Label | Siar can answer today? |
|---|---|---|---|
| Too many inboxes and apps | "Agents switch between apps to follow one customer, and a chat left in an unchecked app goes unanswered" (respond.io); "Sebelum ni guna 4-5 apps berbeza" (MarketOS testimonial) | sourced (vendor content) | Partly: one composer for many networks, comments in one inbox; DMs FB+IG in beta |
| Late-night "still available?" questions and slow replies lose sales | Teams juggle DMs, comments, stock questions and "'hi, still available?' at midnight"; slow follow-up is "the biggest leak" (SleekFlow) | sourced, third-party | Only via DM beta (comment-to-DM, auto-reply). Not claimable as generally available |
| Buyers who say they will pay later and don't | "payment delay is one of the biggest silent killers" (SleekFlow) | sourced, third-party | No (Siar is not a checkout tool) |
| USD tools cost more and move with the exchange rate | Duta and PostLa copy (section 6c) | sourced, competitor claims | Yes: ringgit pricing, FPX/DuitNow yearly |
| Per-channel / per-account pricing grows with every account | PostLa 3 accounts for RM97; Zoho per brand and seat; Buffer per channel (teardown) | measured | Yes: unlimited accounts on every plan |
| Agency quotes are opaque and expensive | ARTO quotes above | sourced, third-party | Yes, as a cost comparison (tool vs person); never "replace your agency" |
| Freelancers churn and deliver template work | Shinjiru | sourced, third-party agency with an interest | Indirectly: a freelancer on Siar Pro keeps clients' accounts in one place |
| Staff sell from personal numbers; business loses the history when they leave | respond.io | sourced, vendor | Partly: team members and roles, accounts owned by the organization; not for WhatsApp |
| Account restrictions from breaking platform rules | SleekFlow ("wipe out months of growth"); Prism Reach's own warning | sourced | Yes: official APIs only; no group or personal-profile posting |

### 8b. Jobs to be done (inferred from the habits above)

1. **"Post once, have it show up on every account I run"**: the core job for S1–S4.
2. **"When someone comments PM or HARGA, send them the price without me watching the phone"**: S3's top job. Siar has it
   built (comment-to-DM, FB + IG) but in beta on request.
3. **"Run all my clients from one login, and keep my cost per client tiny"**: S1 and S2.
4. **"Prove to my client (or myself) that posting is working"**: analytics on paid plans.
5. **"Pay for it the way I pay for everything else, in ringgit, once a year by FPX or DuitNow"**: S1–S4.
6. **"Add social posting to my own app without building every network's API"**: S6.

### 8c. Triggers that start a search for a tool (inferred, each tied to evidence)

- **Adding a third or fourth platform** (Threads, TikTok, X) and running out of time to post natively on each. Evidence:
  "auto post instagram to threads", "cross post facebook instagram" autocompletes (measured).
- **Meta Business Suite breaking or limiting**: "meta business suite schedule post not working / not showing / time
  zone / bulk" are top completions (measured, `malaysia-bm.md` row 54).
- **Taking on a second or third client** (freelancer) or hiring the first admin (SME): "freelance social media manager
  malaysia", "admin media sosial freelance" (measured).
- **A sales campaign or Live** where comments pile up faster than one person can PM back (sources in 3a).
- **A card statement in USD** or a price rise on a foreign tool (Duta's and PostLa's framing; no buyer quote found).
- **Grant season**: "geran digital pmks madani" has 10 completions, including "… 2026" and "… 2026 registration"
  (measured; corrected 2026-11-12: the "2026" seed itself returns only 2), but no 2026 round was verified and Siar is not
  on MDEC's panel. Do not use.

### 8d. Objections and the honest answer

| Objection (inferred, phrased as a buyer would) | Honest answer within `siar-truth.md` |
|---|---|
| "Meta Business Suite is free." | It is, for Facebook and Instagram. Siar is for posting the same thing to Threads, X, LinkedIn and more at once, with unlimited accounts, from RM39. |
| "Can it post to TikTok?" | Not yet. TikTok has not approved Siar's posting app. Say so plainly; do not hide it. |
| "Can it post to my Facebook group / personal profile?" | No. Pages only, through Meta's official API. |
| "Can it auto-DM people who comment 'harga'?" | Facebook and Instagram DMs and comment-to-DM are in beta, turned on per organization on request (paid plans). |
| "Is there a free plan?" | 20 free posts to try, one-time, no card. Not monthly. |
| "Do you do WhatsApp?" | No. |
| "Can I WhatsApp you?" / "Is there BM support?" | Email support on every plan. The dashboard is in English. |
| "Is this a real company?" | FF DEV STUDIO, SSM 202603234793, Malaysia. Phone number in the footer. |
| "Will the price go up?" | "Your price never goes up while you stay subscribed." |
| "Why not Duta / Zoho?" | Compare on `/compare` pages only, with sourced dated prices: unlimited accounts per organization vs per-channel or per-brand pricing. Never "first" or "cheapest". |

---

## 9. The words buyers use (verbatim)

| Phrase | Where it appears | Label | Use for |
|---|---|---|---|
| "PM" / "+1" / "Interested" | Buyer comments that place an order (EasyStore live commerce) | sourced | Comment-to-DM copy, once out of beta |
| "Comment 'PRICE' and we'll send options" | Seller CTA (SleekFlow guide) | sourced | Same; the BM twin is "Comment HARGA" (owner's ad line) |
| "hi, still available?" | The late-night buyer question (SleekFlow) | sourced | Auto-reply use case |
| "boss, this one yours ah?" | Internal lead handoff (respond.io) | sourced | Tone reference only |
| "cara schedule post" (+ tiktok, di facebook, di ig) | Search | measured (AC 10) | BM how-to pages |
| "cara nak schedule post di facebook" | Search, colloquial Malaysian | measured | BM how-to |
| "cara auto post", "cara auto reply instagram", "auto reply dm instagram" | Search | measured | BM how-to; DM pages held |
| "cara buat link bio" | Search | measured | Link-in-bio page |
| "comment to dm automation instagram free" | Search | measured | Use-case page (held) |
| "social media management price / package malaysia" | Search (agency intent) | measured | Cost guide |
| "peniaga online perlu daftar ssm", "report peniaga online penipu" | Search | measured | Trust line (SSM number) |
| "harga" (as "price") vs "pakej", "jadualkan", "hantaran", "serentak" | "harga" is used; the formal words return 0 completions | measured | Write mixed BM-English, not dictionary Malay |
| "Mudah guna, harga berbaloi"; "Jimat masa dan duit!"; "Affordable for a small biz like mine" | Testimonials on MarketOS (unverifiable) | sourced, vendor | Tone reference only; never reuse as Siar proof |
| "RM-friendly, no hidden fees"; "USD pricing, costly for SMEs" | PostLa comparison table | measured | Shows the frame rivals use |
| "Billed in Malaysian Ringgit, not dollars converted at whatever the rate is that morning" | Duta | measured | Same frame; do not copy wording |
| "Post sekali, keluar kat semua platform." / "10 client, RM99." | Siar's own planned ad voice (`pricing.md`) | owner doc | Ad copy, colloquial BM |

Gap: no verbatim complaints from real sellers on Reddit, Lowyat, Facebook groups or TikTok comments in this pass.

---

## 10. What this means for Siar (inferred, not decided)

1. **Lead with freelancers and small agencies in Malaysia now.** They need nothing that is gated (no DMs, no BM), and
   the arithmetic is clear: RM99 for 10 brands against RM800+ per client per month.
2. **Put the trust line next to the price**: "FF DEV STUDIO (SSM 202603234793), Malaysia · ringgit · FPX or DuitNow for
   yearly · price lock." Every local rival shows a version of this.
3. **Hold the SME "Comment HARGA" story** until the DM beta opens to all paid plans and TikTok approves posting. When it
   opens, the words are "PM", "+1", "harga", "still available?", in mixed BM-English.
4. **Do not compete on WhatsApp** (S5). Name it as "not supported" in the FAQ.
5. **Keep ringgit costs low on Siar's side**: route FPX and DuitNow to CHIP (RM1 flat FPX vs about 3% + RM1 on Stripe).
6. **Fill the forum-voice gap before writing BM ads** (section 11).

---

## 11. Follow-up research (blocked by the search budget)

Run these when WebSearch is available (mode "extended"), save the thread URLs and quote under 15 words each:

- `"PM for price" malaysia reddit`, `"pm tepi" OR "pm harga" seller annoying`, `site:forum.lowyat.net "PM for price"`
- `"social media scheduler" site:reddit.com/r/malaysia`, `buffer OR hootsuite ringgit expensive reddit malaysia`
- `freelance social media admin rate malaysia reddit`, `"caj admin" facebook page freelance`
- `foreign transaction fee maybank credit card` (bank's own page), `bank negara DCC overseas merchant ringgit fee`
- `KPDN "electronic trade transactions" regulations 2012 price display online seller` (does "PM for price" break the rule?)
- `SME Corp MSME census number of MSMEs 2024`, `DOSM e-commerce income 2025`
- `tiktok shop malaysia seller requirements SSM`, `meta business suite comment automation malaysia`
- People Also Ask and related searches for "social media management price malaysia" and "cara schedule post"

## Sources (all fetched 2026-11-12 unless dated otherwise)

- DataReportal, Digital 2026 Malaysia: https://datareportal.com/reports/digital-2026-malaysia
- Google, Temasek, Bain, e-Conomy SEA 2026 Malaysia: https://services.google.com/fh/files/misc/malaysia_e_conomy_sea_2026_report.pdf (via https://economysea.withgoogle.com/)
- PayNet press release, 22 Apr 2026: https://www.paynet.my/about-us/media-centre/press-release/8-44-billion-transactions-processed-in-2025-as-digital-payments-become-malaysians-preferred-way-to-pay.html
- Fintech News Malaysia, 4 May 2026: https://fintechnews.my/58266/payments-remittance-malaysia/qr-payments-malaysia/
- CHIP pricing: https://www.chip-in.asia/pricing
- Stripe Malaysia pricing: https://stripe.com/en-my/pricing
- Bank Negara payment statistics (tables not opened): https://www.bnm.gov.my/payment-statistics
- Bukku: https://bukku.my/pricing
- Google Workspace MY: https://workspace.google.com/intl/en_my/pricing.html
- StoreHub: https://www.storehub.com/my/pricing/
- EasyStore pricing: https://www.easystore.co/en-my/pricing ; live commerce: https://www.easystore.co/en-my/live-commerce
- SiteGiant: https://sitegiant.my/pricing/
- SleekFlow, social commerce Malaysia: https://sleekflow.io/blog/social-commerce-malaysia ; ManyChat alternative: https://sleekflow.io/blog/malaysia-manychat-alternative
- respond.io, Malaysian B2C teams: https://respond.io/blog/malaysian-b2c-teams-choose-respondio
- ARTO agency pricing: https://arto.com.my/social-media-agency-pricing-malaysia/
- Shinjiru freelancers vs agencies: https://www.shinjiru.com.my/blog/why-malaysian-brands-are-ditching-freelancers-for-social-media-management-agencies/
- Duta: https://getduta.com/ , /faq , /llms.txt (saved by the team)
- MarketOS, PostLa, Prism Reach, Synova pages: saved by the team, URLs in `competitors/my-sea-schedulers.md`
- Re-opened in the verification pass: https://getduta.com/pricing , https://mymarketos.com/en/pricing , https://mymarketos.com/faq (FAQ JSON-LD), https://postla-page.pages.dev/pricing.html , https://prismxtech.com/reach , https://zynex-ai-v2.pages.dev/synova.html , https://www.zoho.com/social/pricing.html , https://www.canva.com/en_gb/pricing/ , https://manychat.com/pricing , https://respond.io/pricing , https://sleekflow.io/en-my/pricing.md , https://sleekflow.io/ms-my
- Siar privacy policy: https://siaran.my/privacy
- Google autocomplete (gl=my), 278 seeds: measured by the team, method in `keywords/malaysia-bm.md`
- Failed (not used as evidence): smecorp.gov.my (403), dosm.gov.my e-commerce release (error), hasil.gov.my e-invoice (404),
  Maybank/CIMB/Hong Leong card fee pages, upwork.com (403), my.jobstreet.com salary page (no national figure),
  semakmule.rmp.gov.my (no text), seller-my.tiktok.com (login page)
