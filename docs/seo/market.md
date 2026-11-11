# Siar market: segments, pains, jobs, triggers, objections, buyer vocabulary

Written 2026-11-12. This file brings together the research in `research/market/` (buyers-pains.md, malaysia-market.md),
the complaint and gap sections of every teardown in `research/competitors/`, and the keyword sweeps in `research/keywords/`.
It does not repeat their evidence tables; it ranks, decides and links. Every Siar fact follows `research/siar-truth.md`.
Where this file and the truth file disagree, the truth file wins.

## How to read this file

| Label | Meaning |
|---|---|
| **[measured]** | Seen or counted on 2026-11-12, by me or by the named research file |
| **[sourced]** | A vendor's own page, URL given, checked 2026-11-12 |
| **[third-party]** | A review, forum post or rival's page, quoted as said. Not proof of fact |
| **[code] / [doc]** | Siar's own code or owner records, via `siar-truth.md` or read directly in this checkout |
| **[inferred]** | My reading or arithmetic. Not proven |

**Evidence limits:**

- **No new web searches.** The run-wide WebSearch budget of 200 calls was used up before this file started; one attempt was refused [measured].
- **No direct buyer voice from Reddit, G2, Capterra, Indie Hackers or Malaysian forums** (Lowyat, FB groups). Fetches were refused or returned 403 in every sibling file.
- **Where the buyer quotes come from:** GitHub issues, the n8n forum, dev.to, Stack Overflow (API), Trustpilot and AppSumo.
- **Demand grades** come from Google autocomplete and from counting the pages competitors build. There is no volume data, so every demand grade is inferred.
- **Vendor prices:** the ones this file leans on were re-fetched today from the vendors' own pages (section 9): bundle.social, Ayrshare, Zernio, Upload-Post, Buffer and Duta. The others come from the sibling teardowns, which cite the vendor URL and the date.

---

## 1. The short version

1. **Siar wins today where three things are true at once:**
   - The buyer's networks are Meta (Facebook, Instagram, Threads), X, LinkedIn profiles, Bluesky, Mastodon, Discord or Slack.
   - They run many accounts or many brands.
   - They hate per-profile, per-account, per-channel or per-seat billing.

   Everything else in this file follows from that [inferred from siar-truth §1a, §3].
2. **Ranked by value × winnability now** (section 3):
   1. Developers leaving a per-profile or per-account API.
   2. SaaS builders adding publishing to their product on Meta-first networks.
   3. Developers forced off a dashboard tool's API (Buffer's REST shutdown on 2027-02-01; Hootsuite, Sprout, Publer and Metricool API seekers).
   4. Malaysian freelancers and small agencies.

   bundle.social users would be #1 by a distance, but naming bundle.social is Fakhrul's parked decision.
3. **The top pain across every segment is the gate in front of each network, not code.** That means Meta App Review, TikTok's audit and LinkedIn's vetted API. Siar has cleared Meta and can say so. It is rejected (TikTok), denied (LinkedIn Pages) or waiting (YouTube audit, Pinterest Standard) on the rest [doc]. So **"we cleared Meta for you"** is sellable; "we cleared every gate" is not.
4. **The second pain is the billing unit.** Ayrshare charges $149/month for one profile. Zernio charges per account. Buffer charges per channel. Hootsuite and Sprout charge per seat [sourced, section 9]. Siar's per-organization price is a real answer, with one honesty trap: **one live account per network per brand** [code: `schema.prisma` line 4, `accounts.ts` line 106]. See section 2.
5. **The third pain is silent failure:** expired tokens, dropped channels, duplicate posts and errors that point nowhere. Siar's design guarantees answer each one: validation at create time, never-posts-twice, verbatim errors and signed retried webhooks [code]. **They are design facts, not measured rates.**
6. **Siar's biggest objection is proof, not price.** It has no customers, reviews or uptime record, its SDK, CLI and MCP are not on npm, and the site over-claims networks today (siar-truth §6). An exactly true network-status table is both the honest answer and a differentiator, because almost every rival's own pages contradict themselves [measured in the teardowns].
7. **Time-boxed triggers worth content now:**
   - LinkedIn Marketing 202511 sunsets on 2026-11-16 (in 4 days).
   - bundle.social removes the `teams` field on 2026-11-15.
   - Buffer's REST brownout is on 2026-12-09, and the shutdown on 2027-02-01.
   - YouTube's 2026-11-02 quota change (section 5).

---

## 2. What Siar can sell today (the constraints every segment is judged against)

| Fact | Effect on the market | Source |
|---|---|---|
| Publishing open on 9 networks: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack | Meta-centric and developer-community buyers fit. TikTok-first, YouTube-first, Pinterest, LinkedIn-company-page, GBP and Reddit buyers do not | siar-truth §1a, §2 |
| YouTube uploads forced private (until the audit; per-network.md says YouTube changed this rule on 2026-11-02, which needs one public test upload before copy changes) | No creator or video-first segment | siar-truth §1b; keywords/per-network.md finding 1 |
| Per organization; "unlimited social accounts on every plan"; brands capped at Free/Starter 1, Pro 10, Business+ unlimited | Strong for multi-account buyers | siar-truth §3a |
| **One live account per network per brand** | Starter reaches at most one account per network: 9 on today's publishing-open networks (10 counting YouTube's private uploads; 15 when all are open). Pro reaches 90 (150) [inferred arithmetic]. "Unlimited accounts" is literally unbounded only on Business/Enterprise. A client with two Instagram accounts needs two brands. Duta (RM99) lets you connect each channel "as many times as you like" [sourced: getduta.com/pricing, checked 2026-11-12] | [code] `schema.prisma` line 4: "at most one live SocialAccount per network per team"; `accounts.ts` line 106 |
| Free = 20 free posts to try, one-time, no card; Starter RM39 / $19; Pro RM99 / $49 with 14-day trial; Business RM399 / $149 | Fills the $0–$100 gap bundle.social leaves; undercuts Ayrshare's $149 entry. Weaker than recurring free tiers (Zernio 2 accounts, Buffer 3 channels, Upload-Post 10 uploads/month) | siar-truth §3a; section 9 |
| Posts capped (300 / 10k / 100k a month); one post to many networks counts once | Loses to "unlimited posts" rivals (Zernio, Ayrshare, Upload-Post, Postiz, Duta) on high volume per account | siar-truth §3a |
| DMs and comment-to-DM: FB + IG only, beta per organization, off by default | Cannot court the Malaysian "comment HARGA" seller or inbox-led agencies yet | siar-truth §2 |
| Hosted connect is **branded, not white-label** ("Powered by Siar", app.siaran.my, English only) | Partial fit for SaaS and agencies that ask "white-label?" | siar-truth §1c, §4 |
| SDK, CLI and MCP built, **404 on npm**; MCP is local stdio only | AI-agent/MCP segment is blocked | siar-truth §2 |
| Ringgit, FPX/DuitNow pay-once for yearly, price lock, Malaysian company (SSM 202603234793) | Clean local wedge; global buyers see USD at the same shape | siar-truth §1d, §3b |
| bundle.social v1 wire compatibility (194/197 current operations) | The one switch no rival can offer. **Parked:** naming it publicly | siar-truth §4 |
| No customers, testimonials, usage or uptime numbers | Every segment's trust question is open | siar-truth §5 |

**Decision Fakhrul needs before agency or pricing pages go out (inferred):** keep "unlimited social accounts on every plan" and add "one account per network per brand" beside it, or change the model. Today's wording is accurate only as "no account count", not as "connect any number of Instagram accounts to one brand". The bundle-social, use-case-segments and others-dev-apis files all flagged this independently.

---

## 3. Segments, ranked

**Method [inferred].** Each segment gets three scores:

- **Value (V)**: the likely plan and how sticky the customer is.
- **Winnability now (W)**: product fit with today's claimable facts, plus search and AI competition, plus how much proof the buyer needs.
- **Reach (R)**: evidence of how many people search for or discuss it.

Rank = V × W, with R breaking ties. All scores are judgement on the evidence named, 1–5.

| Rank | Segment | Who | V | W | R | Why this rank |
|---|---|---|---|---|---|---|
| 1 | **Per-profile / per-account API switchers** | Developers and agencies paying Ayrshare ($149 for 1 profile; $599 for 30), Zernio ($6/$3/$1 per account), Upload-Post (per profile, 1 account per network), Blotato (account bands) | 5 | 3 | 3 | **Price:** the arithmetic is decisive at 10+ brands. 40 accounts in 10 brands cost $138 on Zernio vs $49 on Siar Pro; 100 Ayrshare profiles cost $1,228 vs Siar Business at $149 (`competitors/late.md`, `ayrshare.md`).<br>**Pain:** pricing churn complaints are recent (Zernio, 2026-05/06) [third-party].<br>**Demand:** "ayrshare alternatives" and "zernio alternative" autocomplete [measured].<br>**Against:** these buyers often already use TikTok or LinkedIn Pages, and "ayrshare alternatives" is crowded (directories, 13 of 16 rivals have pages) |
| 2 | **SaaS builders adding publishing** (new build) | Planner apps, CMSs, vertical SaaS (real estate, F&B, clinics), Malaysian dev teams | 5 | 3 | 3 | **For:** highest lifetime value (Business $149, sticky integration). Siar's real strengths fit them: one REST API, OpenAPI, signed webhooks retried for about 45 h, branded connect, Meta already approved.<br>**Against:** they compare network coverage cold and ask "white-label?" and "who else uses you?". They win only where their customers are Meta-first |
| 3 | **Developers forced off a dashboard tool's API** | Buffer legacy REST users (shutdown 2027-02-01, brownouts 2026-11-11 and 2026-12-09); people searching "hootsuite / sprout social / publer / metricool api pricing" | 3 | 4 | 3 | **Trigger:** a hard deadline.<br>**Competition:** few rival pages ("metricool api alternative" has 1 rival page, "publer api alternative" 3, `keywords/alternatives-vs.md`).<br>**Their gaps Siar fills:** Buffer's API needs every end user to hold a Buffer account; Sprout's API makes drafts only, from $399/seat; Publer has no connect API [sourced in teardowns].<br>**Against:** many are single-account automations (Starter value) |
| 4 | **Malaysian freelancers and small agencies** | Social admins with 2–10 clients; agencies with 5–30 | 3 | 4 | 2 | **Price:** Pro RM99 for 10 brands, against the RM800–2,500 a month they charge per client (third-party agency pages) and Zoho Agency at RM920.<br>**Fit:** no BM or DM gate needed; ringgit and FPX/DuitNow; a thin SERP (Duta #1 with 24 pages, the one measured SERP).<br>**Against:** almost no search demand for a tool ("social media scheduler malaysia" returns 0 completions). TikTok and LinkedIn Pages matter to them. Duta is RM99 flat with unlimited accounts and posts. Reach comes through GEO, directories and direct outreach, not head terms |
| 5 | **DIY integrators blocked by a network gate** | Developers who tried Meta's API directly and hit App Review, Business Verification or 60-day tokens; self-hosters of Postiz or Mixpost | 2 | 4 | 4 | **Reach:** the largest evidence base. Stack Overflow "Permanent Page Access Token?" has 208k views and "This app is in development mode" 189k; "meta app review" has 10 completions [measured].<br>**Fit:** long-tail error, token and gate pages are cheap wins, and Siar went through Meta review itself.<br>**Against:** low value per visitor, but it feeds ranks 1–2. The TikTok and LinkedIn Pages versions of this pain cannot be served |
| 6 | **Workflow builders (n8n, Make) on open networks** | Automation freelancers, "AI content" operators | 2 | 3 | 3 | **Fit:** n8n's HTTP Request node needs only the live API, and n8n.io has no Instagram/Threads integration page (`keywords/ai-agents-mcp.md`).<br>**Against:** verified partner nodes (Upload-Post, Blotato, Postiz, Zernio) own "n8n post to instagram"; buyers are Starter-sized |
| 7 | **Malaysian social-first micro sellers and store SMEs** | Sell through FB/IG posts, Lives and chat; "PM", "+1", "comment HARGA" | 1.5 | 2 now, 4 later | 3 | **Against today:** RM39 at best; their top jobs (comment-to-DM, TikTok) are gated; Meta Business Suite is free.<br>**Later:** rises sharply when the DM beta opens to all paid plans and TikTok approves. BM how-to demand ("cara schedule post …" 10 completions) is real and unowned |
| 8 | **Global agencies buying a dashboard** | Agencies comparing Hootsuite, Sprout, Buffer, Publer | 3 | 1 | 5 | **Reach:** huge demand.<br>**Against:** owned by incumbents with 1,000s of URLs; Siar lacks approvals, a client role, report export, white-label, LinkedIn Pages and TikTok [code, `keywords/use-case-segments.md`]. Win only the API-flavoured agency query (one page) |
| 9 | **AI-agent / MCP builders** | "social media mcp server", "instagram mcp", "claude mcp for social media" | 3 | 1 | 4 | **Reach:** real and growing.<br>**Blocked:** `@siar/mcp` returns 404 on npm, there is no hosted or remote MCP, and Siar is in no registry. Searchers want a URL or a connector. Rises to about W3 after the npm publish, W4 with a hosted endpoint |
| — | **bundle.social users (parked)** | Teams on bundle.social who want a tier between $0 and $100, ringgit, or webhooks in the API | 5 | **1 now / 5 if cleared** | 2 | **The case:** Siar is wire-compatible (194/197 operations) at less than half the price ($49 vs $100, $149 vs $400) [sourced, section 9].<br>**The obstacle:** blocked only by the naming decision. Even when cleared, say "change the base URL, then reconnect accounts" (tokens never move) |
| — | **Creators, TikTok/YouTube-first** | Video uploaders, MoneyPrinter-style pipelines | 2 | 0 | 4 | Hold: TikTok rejected, YouTube private |
| — | **Not buyers** | Scrapers and data readers, ads managers, social listening teams, WhatsApp-centred service SMEs, Facebook-group auto-posters | — | — | — | Out of product scope or against network rules. Malaysian group-posting tools automate personal accounts (Prism Reach's own page warns of restriction) |

**Malaysian developers** are part of rank 2 (same pages, plus ringgit). There are too few of them to rank on their own [inferred].

### Lead message per ranked segment (all within siar-truth wording) [inferred]

1. **Switchers:** "Pay per business, not per profile or account. Every social account is included, from $19 / RM39 a month. Your price never goes up while you stay subscribed." State the post caps and one-account-per-network-per-brand in the same table.
2. **SaaS builders:** "One REST API for Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack, through apps that have already passed Meta's review. Your customers connect through a branded link; you never touch a token."
3. **Dashboard-API leavers:** "Your customers connect their own accounts. They don't need a Buffer, Hootsuite or Sprout account. REST, signed webhooks and comments, on every plan."
4. **Malaysian freelancers and agencies:** "10 clients, RM99. Ringgit, FPX or DuitNow, a Malaysian company." Put the SSM number in the trust line.
5. **Gate-blocked builders:** "Facebook, Instagram and Threads through an app that already passed Meta's review." Never say "skip the review" for TikTok, YouTube, LinkedIn Pages or Pinterest.

---

## 4. Pains

Ranked by how widely the evidence repeats across segments. The "Siar answer" column uses only allowed wording.

| # | Pain | Strongest evidence | Segments | Siar answer today |
|---|---|---|---|---|
| P1 | **Network gates**: Meta App Review and Business Verification, the TikTok audit (private-only until audited, "internal company use … not eligible"), LinkedIn's vetted Community Management API, the YouTube audit, Pinterest Standard access | n8n: "spent over a month … waiting for approvals" (2025-08-30); Postiz #1329, #1563, #2297; dev.to "No company, no API" (2026-10-07); TikTok's own content-sharing guidelines [measured / sourced, buyers-pains.md P1] | All | **Meta:** "Facebook, Instagram and Threads connect through Siar's Meta app, which passed App Review on 2026-10-27, so you do not need your own."<br>**Other networks:** the status wording from siar-truth §1a. Siar is gated on the same networks |
| P2 | **The billing unit**: per profile, account, channel or seat, and prices that change under you | Zernio 1★: "moved from charging by profiles to charging by accounts" (2026-06-07). Hootsuite: "They charge 3k/year". Publer on G2: 16 "High Pricing" tags. AppSumo: "split into expensive monthly add-ons" [third-party] | 1, 2, 3, 4, 8 | "Per organization, never per connected account. Unlimited social accounts on every plan, from RM39 / $19 a month." Plus the price lock. State the caps and the one-per-network-per-brand rule |
| P3 | **Tokens expire, channels disconnect** | Instagram long-lived tokens last 60 days [sourced: Meta docs]. Postiz #623 "rinse and repeat", #1351 (re-auth YouTube "virtually every day"), #2299. Metricool: "randomly disconnects your accounts". Buffer 1★ [third-party] | 1, 2, 5, 8 | "Reconnect detection: revoked or expiring grants are flagged, with a `social-account.updated` webhook." Never "tokens never expire" |
| P4 | **Silent failures and duplicates** | Zernio: "posted the same video 4x", "swallows errors". Buffer: 7–8 of 20 1★ reviews about failed posts. Metricool: "said published but never showed up". Upload-Post returns `success:true` when TikTok turns a post into a draft. Sprout drops profiles with "No error is returned" [third-party / sourced] | 1, 2, 3, 5 | Validation at create time (a 400 with `issues`). "Each network target is claimed once." "If a network says no, you get its own code and message, plus a plain-English fix." 16 signed webhook events, retried about 45 h. All are design guarantees; no rates |
| P5 | **Webhooks you can't trust** | Upload-Post: one attempt, no retry. bundle.social: 3 attempts, no API routes. Mixpost: 3 tries in about 6 min, secret optional. Outstand: signing optional. Buffer and Sprout: none [sourced in teardowns] | 1, 2, 3 | "16 HMAC-signed events, retried with backoff, with a delivery log you can inspect and resend." |
| P6 | **API churn and forced migrations** | LinkedIn 202511 sunset 2026-11-16; Buffer REST shutdown 2027-02-01; Mixpost #166; Postiz #2005, #1807 [sourced / measured] | 3, 5 | "One REST API, with an OpenAPI document at `/openapi.json`." No promise to absorb every change instantly (no track record) |
| P7 | **My customers must connect their own accounts in my app** | Postiz #975: "each customer must connect their own accounts". Buffer needs a Buffer account for every user. Publer and Hootsuite have no connect API [measured / sourced] | 2, 3 | "A branded connect link (your name, logo, colour). Customers sign in to each network themselves; you never touch a password or token." Never "white-label" |
| P8 | **No plan for a small buyer; card-first trials** | bundle.social: "Hobbyist and need a smaller plan? Message us". Ayrshare has no free plan; its only trial is on the $299 Launch plan. Duta's trial needs a card. Mixpost's "Start free" CTAs lead to a trial that needs a card [sourced] | 1, 4, 6 | "20 free posts to try, no card", then RM39 / $19 |
| P9 | **Billing trust**: auto-renewal, cancellation, refunds | Hootsuite Trustpilot 1.3/5 (556 reviews), Sprout 1.8/5 (89), both dominated by renewal and cancel complaints. Metricool "blindsided by a $324 auto-renewal charge". Postiz and Zernio cancel complaints [third-party] | 1, 3, 4, 8 | Price lock; Malaysia yearly paid once by FPX/DuitNow, "renewed by a link". Do not promise refunds Siar's terms don't state |
| P10 | **X costs and credits** | X is pay-per-use: $0.015 a post, $0.20 with a URL [sourced: docs.x.com pricing]. "x api credits depleted" and "x api 402" autocomplete. Upload-Post strips links unless you buy a $19 bundle. Metricool charges $10 per X account; Outstand, SocialAPI and Postproxy make you bring your own X app [sourced] | 1, 2, 6 | "X usage is passed through at X's own USD prices from a prepaid credit; Siar adds no markup on X." Not "at cost" in ringgit. Don't attack rivals' X caps: Siar caps X at 15/day (5 on Free) [code]. X service-bureau clause: open legal question (section 7) |
| P11 | **USD billing and FX for Malaysians** | Duta and PostLa sell against it. Buffer, Hootsuite and ManyChat show USD from a Malaysian IP [measured] | 4, 7 | "Ringgit prices for Malaysian organizations; pay yearly once by FPX or DuitNow; paid to a Malaysian company." No "no FX fees" |
| P12 | **Too many inboxes; slow replies lose sales** | respond.io and SleekFlow content on Malaysian sellers: "'hi, still available?' at midnight" [sourced, vendor content] | 4, 7 | Comments in one inbox (live on 8 networks). DMs FB+IG in beta only |
| P13 | **Account bans from unofficial automation** | Metricool 1★: "FACEBOOK almost shut down my accounts". Postiz #832 (IG account disabled). Prism Reach's own warning [third-party / sourced] | 4, 7 | "Official APIs only. Pages and professional accounts, never your personal profile." |

**Counter-evidence to keep in view:** some buyers like per-channel billing because they "stop paying when a client leaves" (a Buffer testimonial, `competitors/buffer.md`). At 1–3 accounts, Zernio (free for 2 accounts), Post for Me ($10) and Publer's API ($10) are cheaper than Siar Starter at $19 [sourced in teardowns]. Siar's price story is about scale, not about the bottom end.

---

## 5. Jobs to be done

Written as the buyer would say them. "Siar today" uses truth-file claims only.

| # | When … I want to … so I can … | Segments | Siar today |
|---|---|---|---|
| J1 | When my customers ask for social posting inside my product, I want one integration instead of one per network, so I can ship this quarter | 2, 5 | Yes for the 9 open networks |
| J2 | When I need Meta permissions, I want to ride an app that is already approved, so I skip months of review and business verification | 2, 5, 6 | Meta yes. TikTok, YouTube public, LinkedIn Pages, Pinterest no |
| J3 | When my customer connects an account, I want a page with my brand on it, so they trust it and I never handle passwords | 2, 3, 4 | Branded link; not white-label |
| J4 | When I add a client, brand or location, I want my bill to stay flat, so growth does not punish me | 1, 2, 4 | Per organization; brands fenced at 1 / 10 / unlimited |
| J5 | When my provider changes price or retires its API, I want to move without a rewrite | 1, 3, bundle | bundle.social v1 compatible (parked); others need a rewrite to Siar's REST |
| J6 | When a token expires or a post fails, I want to know at once with the network's real error, so my customer doesn't find out first | 1, 2, 5 | Webhooks, reconnect flags, verbatim errors |
| J7 | When I retry or a worker restarts, I want a guarantee nothing posts twice | 1, 2 | Design guarantee |
| J8 | When I write one post, I want each network's version checked before it is sent, so it doesn't fail at 9 a.m. | 4, 6, 7 | Validation at create time; per-network text and media |
| J9 | When comments come in on every network, I want to read and answer them in one place | 4, 7, 8 | Comments live on FB, IG, Threads, X, Bluesky, Mastodon, Slack, YouTube |
| J10 | When someone comments "PM" or "HARGA", I want the price sent to them without watching my phone | 7 | Built; beta on request (FB + IG) |
| J11 | When my workflow or agent drafts a post, I want one HTTP call (or MCP tool) to publish it | 6, 9 | HTTP yes; MCP not installable |
| J12 | When I report to a client, I want normalised numbers across networks | 4, 8 | Analytics on paid plans; LinkedIn analytics not claimable |
| J13 | When I pay as a Malaysian business, I want ringgit, FPX/DuitNow and a local company, so there are no USD card surprises | 4, 7 | Yes |
| J14 | When I run 10 clients, I want them in one login at a cost per client that is a rounding error | 4 | Pro RM99 for 10 brands |

---

## 6. Buying triggers

The moments a buyer starts looking. The dated ones are the cheapest content to win, because the page meets the
reader at the exact moment of need [inferred].

| Trigger | Date / evidence | Segments | Content that meets it |
|---|---|---|---|
| **LinkedIn Marketing 202511 sunset** | 2026-11-16 [sourced: learn.microsoft.com community-management overview] | 5, 3 | A short "LinkedIn API version sunset: what breaks" note on /linkedin-api. Siar posts to profiles only, so it informs; it doesn't sell pages. Probably too late for a ranking page |
| **bundle.social removes the `teams` field on GET /organization** | 2026-11-15 [sourced: bundle.social docs, per `competitors/bundle-social.md`] | bundle | Only if the naming decision clears |
| **Buffer legacy REST brownout and shutdown** | Brownouts on 2026-11-11 and 2026-12-09; shutdown on 2027-02-01 [sourced: buffer.com/resources/legacy-rest-api-retired/] | 3 | "Buffer REST API shutdown: your options" page. Never claim Buffer REST compatibility |
| **YouTube upload rules changed** | 2026-11-02: uploads from unaudited projects no longer forced private, and `videos.insert` gets its own 100/day quota [sourced via `keywords/per-network.md`; Siar needs a public test upload before any copy change] | 5, creators | /youtube-api/quota and /youtube-api/audit (every page that ranks today predates the change) |
| **A rejection email** (Meta, TikTok, LinkedIn) | Postiz #2297 (TikTok reviewer note), n8n LinkedIn scope thread; "meta app review taking time", "tiktok content posting api audit" autocomplete [measured] | 5, 2, 6 | Per-network gate guides from Siar's own approval files. Meta: "already approved". Others: an honest guide only. Publishing Siar's own rejections is Fakhrul's call |
| **A price-model change at the current vendor** | Zernio's move to per-account around May 2026; Hootsuite and Sprout renewals [third-party] | 1, 8 | Dated, sourced /compare pages plus a per-account vs per-organization cost explainer |
| **Crossing a profile or seat tier** | Ayrshare Launch tops out at 10 profiles, then $599 [sourced] | 1, 2 | "What 10, 30, 100 customers cost on each API" (scenario arithmetic, dated) |
| **A customer asks for a network the tool lacks** | Ayrshare review: "let us add Facebook, which our previous tool couldn't do" [third-party] | 2 | Honest per-network status table. Discord, Slack and Mastodon are the gaps Siar fills that most rivals leave |
| **Tokens and disconnects become a support burden** | Postiz #623, #1351; Buffer and Metricool reviews | 1, 2, 4 | Per-network token-lifetime explainers plus the reconnect webhook |
| **X credits run out (402)** | Postiz #2231; "x api 402" autocomplete | 5, 6 | /x-api/errors exists. An /x-api/pricing page is held for the X-terms check |
| **Starting an n8n or agent project** | "can n8n post to instagram", "social media mcp server" autocomplete | 6, 9 | n8n HTTP-node recipes for Instagram and Threads now. MCP guides after npm |
| **Malaysia: taking on a 2nd or 3rd client, or Meta Business Suite misbehaving** | "freelance social media manager malaysia"; "meta business suite schedule post not working" autocomplete [measured] | 4, 7 | /malaysia page and BM how-to test set (`keywords/malaysia-bm.md`) |
| **Malaysia: a USD card statement or a foreign tool's price rise** | Only Duta's and PostLa's framing; no buyer quote found | 4, 7 | Ringgit trust line next to the price |

---

## 7. Objections and honest answers

| Objection (as the buyer says it) | Who / how common [inferred] | Honest answer (siar-truth wording) | What would close it | Owner |
|---|---|---|---|---|
| "Can I post to TikTok / YouTube / LinkedIn company pages / Pinterest?" | Everyone, first question | "Open today: Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord and Slack. YouTube uploads work but stay private until YouTube's audit completes. TikTok, Pinterest publishing, LinkedIn company pages, Reddit, Snapchat and Google Business Profile are built and open as each network approves Siar." | The approvals. Until then, lose these buyers honestly | Fakhrul (approvals) |
| "Your homepage shows TikTok and Google Business posts as Posted." | Anyone who reads the status table, then the home page | No honest answer. The site over-claims in 29 places (siar-truth §6) | Fix §6 before any comparison or status-honesty angle ships | Site fix |
| "You're new. Who uses you? What's your uptime?" | Segments 1, 2, bundle | No customers, testimonials, usage or uptime may be claimed. What can be shown: the public OpenAPI, the per-network error references, a dated status table, the price lock, 20 free posts to try | Real proof over time (a status-page history, a first case study), only once it exists | Time |
| "Is it white-label?" | 2, 4, 8 | "A branded connect link (your name, logo, colour)." The page says "Powered by Siar" and is English only | Removable footer, custom domain, use the stored `language` | Product decision |
| "Can I connect two Instagram accounts for one client?" | 4, 8 | One live account per network per brand; use a second brand (Pro has 10) | Clarify the wording (section 2) or change the model | Fakhrul |
| "Others give unlimited posts. You cap them." | 1, 4 | Starter 300, Pro 10,000, Business 100,000 posts a month. "A post sent to every connected network counts as one post." Drafts and retries don't count | None; state caps beside the price | — |
| "Zernio is free for 2 accounts; Buffer for 3 channels. Your free tier is 20 posts once." | 6, 7 | "20 free posts to try" (one-time, no card), then RM39 / $19 | Pricing decision, not copy | Fakhrul |
| "`npx -y @siar/mcp` fails." / "Where's the SDK?" | 6, 9, 2 | "TypeScript SDK, CLI and MCP server (version 0.1.0), built from the same OpenAPI contract." No install commands | Publish to npm, or remove the commands from the site now | Fakhrul (npm go) |
| "Is your X pass-through allowed? Ayrshare says one shared X app breaks X's terms." | Low now, rising if Ayrshare pushes it | The clause exists: X Developer Agreement III.A(e), "service bureau, rental or managed services basis" [sourced: docs.x.com/developer-terms/agreement, checked 2026-11-12]. Whether it covers Siar is **unverified** | A read of the agreement (and legal advice if needed) before any X pricing page or /compare/ayrshare | Fakhrul |
| "Can it do DMs / auto-DM people who comment HARGA?" | 7 (high), 4, 8 | "Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request (paid plans)." | Open the beta; fix the stale "opening after Meta approval" copy and the wrong "Upgrade to Pro" error | Fakhrul + code |
| "Meta Business Suite is free." | 7, 4 | It is, for Facebook and Instagram. Siar posts the same thing to Threads, X, LinkedIn and more at once, with comments in one inbox and an API | Target multi-network buyers | — |
| "Why not build it ourselves?" | 2, 5 | Point to the gates (P1), tokens (P3) and churn (P6) with sources; Siar's own approval records show the work | — | — |
| "Will a small Malaysian company still be here in a year?" | 1, 2 | The price lock and a public OpenAPI document. No SLA or data-export claims exist; do not invent them | Time; Enterprise "SLA by contract" only | — |
| "Is this a real company?" (Malaysia) | 4, 7 | FF DEV STUDIO, SSM 202603234793, Malaysia; phone number in the footer (a contact line, not a support promise) | One trust line beside the price | Site copy |
| "Do you have WhatsApp / BM support?" | 4, 7 | Email support on every plan. Dashboard in English. No WhatsApp | — | — |
| "Why not Duta? It's Malaysian and RM99 flat with unlimited accounts and posts." | 4, 7 | Siar starts at RM39 with 20 free posts to try and no card; it has comments, analytics, brands and a public API with webhooks. Duta wins on posts per month and multiple accounts per network. Never say "first" or "cheapest" | A dated /compare/duta page | — |

---

## 8. Buyer vocabulary

Verbatim phrases to reuse in headings, FAQ questions, meta descriptions and ads. Quotes are kept short.
**Buyer** = written by a user. **Query** = an autocomplete phrase (measured 2026-11-12). **Seller habit** = how Malaysian
buyers and sellers talk, from vendor pages. The "use in" column is a suggestion [inferred].

### 8a. Pain words (buyer)

| Phrase | Where | Use in |
|---|---|---|
| "waiting for approvals" | n8n forum, 2025-08-30 | Meta gate guide intro |
| "That's where I stopped." (business registration) | dev.to, 2026-06-19 | Meta Business Verification explainer |
| "No company, no API" | dev.to title, 2026-10-07 | Same; H2 framing |
| "keep rejecting the application" | Postiz #1329 (TikTok) | TikTok audit guide (honest status, no posting claim) |
| "personal use or internal company use are not eligible" | TikTok reviewer, via Postiz #2297 | TikTok audit guide |
| "extremely unintuitive" (the Facebook process) | Postiz #621 | Meta guide |
| "Permanent Page Access Token" / "long-lived token" | Stack Overflow (208k views), n8n | Token explainer titles |
| "keeps disconnecting" / "refresh needed" / "rinse and repeat" | Postiz #757, #2299, #623 | Reconnect-webhook section |
| "Could not add provider" | Postiz #918 (56 comments) | Connect troubleshooting |
| "swallows errors" | Zernio Trustpilot | Verbatim-errors section |
| "posted the same video 4x" | Zernio Trustpilot | Never-posts-twice section (no competitor named) |
| "Every scheduled post fails to send" | Buffer Trustpilot | Validation-at-create section |
| "said published but never showed up" | Metricool Trustpilot | Same |
| "credits depleted" / "402" | X's own error; Postiz #2231 | /x-api/errors |
| "moved from charging by profiles to charging by accounts" | Zernio Trustpilot | Pricing explainer |
| "charging per account makes it too expensive" | Zernio Trustpilot | Pricing explainer, /compare/zernio |
| "keep changing their pricing and plans without notice" | Zernio Trustpilot | Price-lock line |
| "split into expensive monthly add-ons" | AppSumo (Late) | Pricing explainer |
| "the pricing model scales up quite quickly as you add more social accounts" | Publer, G2 | Same |
| "blindsided by a … auto-renewal charge" | Metricool, G2 | Malaysia pay-once / price-lock copy |
| "each customer must connect their own accounts" | Postiz #975 | Hosted connect / multi-tenant page H1 or lead |

### 8b. Outcome words (buyer)

| Phrase | Where | Use in |
|---|---|---|
| "One API covers every network" (careful: Siar must say "every open network") | Ayrshare Trustpilot | Don't copy; shows the outcome buyers value |
| "build my own planner app on top of it" | Ayrshare Trustpilot | SaaS-builder use case |
| "publishes … directly to our clients' pages" | Ayrshare Trustpilot | Agency API page |
| "get live months in advance" | Ayrshare Trustpilot | Build-vs-buy section |
| "easy to integrate" / "most reliable" | Ayrshare Trustpilot | What buyers praise; earn it, don't claim it |

### 8c. Query words (people type these)

| Cluster | Phrases (measured autocomplete) | Note |
|---|---|---|
| Category | "unified social media api", "social media posting api", "social media api for ai agents", "social media api pricing" | Retitle home and /pricing H2s toward these |
| Per network | "instagram posting api", "instagram api error codes", "tiktok api error codes", "instagram comments api", "instagram dm api", "instagram messaging api", "facebook/youtube comments api" | Capability × network is where developer demand sits (`use-case-segments.md`) |
| Switching | "ayrshare alternatives", "ayrshare api alternatives", "ayrshare free plan", "zernio alternative", "zernio api alternative", "bundle social alternatives", "buffer alternative with api", "upload-post alternative", "mixpost alternative" | Not "getlate alternative" (doesn't autocomplete); "late alternative" is noise |
| Incumbent APIs | "hootsuite api pricing / access / key", "sprout social api pricing", "metricool api pricing", "publer api pricing", "buffer api key / pricing / docs" | Few rival pages; "buffer api" collides with Node's Buffer |
| Gates and errors | "meta app review taking time", "tiktok content posting api audit", "pinterest api trial access denied", "linkedin community management api development tier access form", "x api credits depleted", "x api 402", "x api pay per use" | First-hand gate guides |
| Workflow and agents | "can n8n post to instagram", "n8n post to social media", "social media mcp server", "social media mcp for claude", "instagram mcp", "linkedin mcp" | MCP rows blocked until npm |
| Malaysia (mixed BM-English) | "cara schedule post" (+ "tiktok", "di facebook", "di ig"), "cara nak schedule post di facebook", "cara auto post", "cara auto reply instagram", "cara buat link bio", "comment to dm automation", "social media management price / package malaysia", "freelance social media manager malaysia", "admin media sosial freelance", "meta business suite schedule post not working" | Write mixed BM-English. Formal Malay ("jadualkan", "hantaran", "serentak") returns 0 |
| Trust (Malaysia) | "peniaga online perlu daftar ssm", "report peniaga online penipu" | Put the SSM number in the trust line |

### 8d. Malaysian seller habits (seller habit, not searches)

| Phrase | Source | Use in |
|---|---|---|
| "PM" / "+1" / "Interested" (buyer comments that place an order) | EasyStore live-commerce page | Comment-to-DM copy, **only after the beta opens** |
| "Comment 'PRICE' and we'll send options" / "comment HARGA" | SleekFlow guide; owner's ad line in `docs/pricing.md` | Same; ads, not page titles ("comment harga" returns 0 completions) |
| "hi, still available?" | SleekFlow guide | Auto-reply use case (held) |
| "Post sekali, keluar kat semua platform." / "10 client, RM99." | Siar's planned ad voice (`docs/pricing.md`) | BM ads; the second one works today |

### 8e. Words to avoid (truth or SEO traps)

| Avoid | Why | Say instead |
|---|---|---|
| "white-label" | Connect page shows "Powered by Siar" | "branded connect link" |
| "15 networks" / "every network" / "all networks" | 9 open today | "built for 15 networks"; the open list |
| "20 posts" bare, "free plan", "free forever" | Free is one-time | "20 free posts to try" |
| "unlimited" for anything but accounts (and brands on Business+) | Posts, comments, uploads and brands are capped | "unlimited social accounts on every plan" plus the caps |
| "cheapest" | Not true at 1–10 brands (Post for Me, Zernio, SocialAPI, Upload-Post) | Scenario arithmetic, dated |
| "first" / "only Malaysian" | Duta's claim is dated 2026-08-11 | "a Malaysian company" |
| "at cost" in ringgit | 4.20 rate includes a buffer | "at X's own price, in USD" |
| "Meta partner", "approved by Meta" as a badge | App approval is not a partnership | "passed Meta's App Review on 2026-10-27" |
| "skip the review" (non-Meta) | Siar is gated on TikTok, LinkedIn Pages, YouTube and Pinterest too | Meta only |
| "open source", "free social media api", "embedded social media", "aggregator", "hosted oauth", "crosspost api" | Wrong intent (feeds, self-hosting, Facebook video crossposting) | Avoid as targets (`keywords/head-unified.md`) |
| "cross posting app", "shopify instagram integration", "comment moderation api", "unified messaging api", "social media login api" | Wrong intent (resellers, feed widgets, ML toxicity, telephony, sign-in) | Avoid (`keywords/use-case-segments.md`) |

### 8f. Vendor framing to know, not copy

These show how the category talks. Do not echo them:

- "Stop maintaining 14+ social media integrations" (Ayrshare home)
- "no $149 profile minimum" (bundle.social Ayrshare page)
- "Pay for channels, not seats" (Buffer /agencies)
- "Unlimited connected accounts" (bundle.social)
- "No developer app. No tokens. Two clicks." (Upload-Post)
- "Skip months of platform approvals and go live today." (Zernio)

Every rival leads with skipping approvals. Siar's honest version is narrower ("Meta already cleared") and backed by a dated record. That difference is worth making explicit [inferred].

---

## 9. Vendor facts this file relies on (re-fetched 2026-11-12)

| Vendor | Fact | URL | Checked |
|---|---|---|---|
| bundle.social | Free $0 (20 posts/month, 3 accounts); Pro $100 (10,000 posts, unlimited accounts, 14-day trial); Business $400 (100,000 posts); Enterprise custom; "Hobbyist and need a smaller plan? Message us and we will tailor it to your needs." | https://bundle.social/pricing | 2026-11-12 |
| Ayrshare | "We bill by social profile: one customer, brand, or location connected to any number of social networks." Premium $149/mo (1 profile, no trial); Launch $299/mo (up to 10, 28-day trial); Business $599/mo or $499/mo yearly (30 profiles; then $8.99, $3.49, $2.49 per profile monthly); no free plan | https://www.ayrshare.com/pricing/ | 2026-11-12 |
| Zernio (formerly Late) | "You pay per connected social account per month." Accounts 1–2 free, 3–10 $6 each, 11–100 $3, 101+ $1; posts unlimited | https://zernio.com/pricing | 2026-11-12 |
| Upload-Post | Free $0 (2 profiles, 10 uploads/month, no TikTok); Basic $24 ($16 yearly, 5 profiles); Professional $50 ($33, 25); Advanced $147 ($118, 75); Business $438 ($350, 225) | https://www.upload-post.com/pricing/ | 2026-11-12 |
| Buffer | Billed per channel; Free 3 channels (10 scheduled posts per channel at a time); Essentials from $6/channel/month ($5 yearly); Team from $12 ($10 yearly). Its own page says both "approximately 2 months" and "20%" for yearly | https://buffer.com/pricing.md | 2026-11-12 |
| Duta | RM99/month or RM990/year; 7-day trial, card required; unlimited connected accounts ("each channel as many times as you like"); X capped at 300 posts/month; FPX only on yearly | https://getduta.com/pricing | 2026-11-12 |

The other competitor facts come from the sibling teardowns, each with the vendor URL and "checked 2026-11-12":

- Hootsuite and Sprout: `competitors/hootsuite-sprout.md`
- Publer and Metricool: `competitors/publer-metricool.md`
- Outstand: `competitors/outstand.md`
- Postiz: `competitors/postiz.md`
- Mixpost: `competitors/mixpost.md`
- Blotato, Postproxy, Post for Me, SocialAPI.ai and WoopSocial: `competitors/others-dev-apis.md`
- Malaysian tools: `competitors/my-sea-schedulers.md`

The review-site figures (Trustpilot, AppSumo, G2) are third-party.

---

## 10. What this means for SEO and copy (inferred, not decided)

1. **Fix the over-claims first** (siar-truth §6, current-site.md): the hero demo, the scripted "Live" feed, "all 15 networks", the calculator default and the `npx @siar/mcp` lines. Every segment's first objection is network status. A status-honesty angle backfires while the site itself over-claims.
2. **Build for ranks 1–3 first, all English, all API-intent:**
   - /compare/ayrshare and /compare/zernio, with dated scenario tables that say where the rival wins.
   - A per-account vs per-organization cost explainer.
   - /compare/hootsuite-api, sprout-social-api, metricool-api, publer-api and buffer-api.
   - A Buffer REST shutdown page.
   - Retitle the home page and multi-tenant/hosted-connect pages for "unified social media API" and "social media OAuth API". These are already ranked P1/P2 in `keywords/head-unified.md` and `alternatives-vs.md`.
3. **Feed them from rank 5 (gate-blocked builders):**
   - Answer-first error pages with an /errors hub.
   - Meta App Review and token guides written from Siar's own approval records.
   - /instagram-api/publishing-limit, /instagram-api/comments, /youtube-api/quota.
4. **Malaysia (rank 4): one English /malaysia page plus the trust line beside the price, and directory and roundup listings.** Run the 6-page BM how-to set only as the kill-rule test in `keywords/malaysia-bm.md`. Hold every BM page that leans on TikTok or DMs.
5. **Unblock the next segments with owner decisions, not content:**
   - The bundle.social naming decision unlocks the most valuable segment.
   - The npm publish unlocks MCP/agent content.
   - The DM beta opening unlocks Malaysian sellers.
   - The wording on one account per network per brand unblocks the agency and pricing pages.
   - The X-terms read unblocks /x-api/pricing and /compare/ayrshare.

## 11. Research gaps to fill when the search budget resets

- **Reddit:** r/SaaS, r/n8n, r/socialmedia, r/webdev, r/malaysia and r/selfhosted. Look for verbatim complaints about per-account pricing, Meta review and TikTok audits. "ayrshare alternatives reddit" and "meta app review reddit" autocomplete, so the threads exist [measured].
- **Review sites and Malaysian forums:** G2 and Capterra reviews for Ayrshare, Zernio and Blotato (403 so far), plus Lowyat and FB-group voice on "PM for price" and freelancer rates.
- **SERPs:** the "who ranks" checks marked ▲ in `keywords/alternatives-vs.md` and `use-case-segments.md`, and People Also Ask for "ayrshare alternatives", "social media api pricing" and "cara schedule post".
- **AI answers:** the wave-0 sheet in `docs/geo/visibility/` is still empty, so it is not yet known which brands ChatGPT, Perplexity and AI Mode name for these segments.
