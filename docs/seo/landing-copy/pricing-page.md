# /pricing: final copy (en)

Written 2026-11-12 for the Wave 0 live fix (strike plan 0.13, row `/pricing`; keyword map C06).
Replaces the copy in `apps/site/src/pages/pricing.astro`, `PlanCards.astro`, `QuotaRules.astro` and the
`/pricing.md` generator. Every Siar fact below is from `research/siar-truth.md` (as corrected by `strike-plan.md` §2),
`messaging.md` or the code named beside it. No competitor is named on this page (truth rule 3b.12, messaging §11).

**Labels:** [code] read in this checkout · [doc] repo docs · [inferred] my judgement.
**Research limit:** the shared web-search budget for this run was spent before this page was written, so no new
SERP, autocomplete or People Also Ask data was gathered for it. Demand notes come from the sibling sweeps in
`keyword-map.md` and `research/keywords/ai-answers.md` and are **[inferred]**. The live page was fetched on
2026-11-12 to confirm the lines being replaced [measured].

---

## 1. Meta

| Field | Copy | Length |
|---|---|---|
| URL | `https://siaran.my/pricing` (canonical, no trailing slash; plain-text twin at `/pricing.md`) | |
| Meta title | `Siar pricing: social media API priced per organization` | 54 chars |
| Meta description | `Siar pricing: 20 free posts to try, then from $19 a month (RM39 in Malaysia). One price per organization, never per connected account. Price locked.` | 148 chars |
| Breadcrumb | Home / Pricing | |

Do not localise the meta tags by IP. Crawlers and AI fetchers must see one stable text with both currencies.

---

## 2. Hero

**Kicker:** Pricing
(Drop the side note "per organization". A claim never sits in a kicker; messaging §8.)

**H1:** One price per organization, never per connected account.

**Hero subhead (first 60 words answer "Siar pricing"):**

> Siar, a unified social media API and dashboard, is priced by the brands you run and the posts you create. No
> per-account fees. Each brand connects one account on every open network: Starter 1 brand, Pro 10, Business
> unlimited. Start with 20 free posts to try, then pay from RM39 a month in Malaysia or $19 elsewhere.

(54 words. Visitors outside Malaysia see the last sentence as "…then pay from $19 a month, or RM39 for organizations
billed in Malaysia." Both versions are in the static HTML; see section 12.)

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Start the 14-day Pro trial

Small line under the CTAs: "No card for the free start. A plain-text version of this page is at /pricing.md."

---

## 3. Plan cards

**Toggle:** Monthly · Yearly (badge: "2 months free")

**Currency rule for the cards.** The card shows the visitor's list first: ringgit when the visitor is in Malaysia,
US dollars everywhere else. The other list sits on the line under the price, so nobody is shown the wrong one alone.
The line under each paid price reads "$19 outside Malaysia" (ringgit view) or "RM39 if billed in Malaysia" (USD view).

### Free

- **Tagline:** Try Siar
- **Price:** Free
- **Line under price:** 20 free posts to try, once
- **Billing line:** No card, no time limit
- **Button:** Start with 20 free posts
- **Includes:**
  - 20 free posts to try, one-time
  - 50 comments and 60 uploads, one-time
  - 1 brand
  - No per-account fees
  - The REST API and signed webhooks
  - No analytics

### Starter

- **Tagline:** For one business
- **Price:** RM39 a month · $19 outside Malaysia
- **Yearly:** RM390 a year · $190 outside Malaysia · "2 months free, billed yearly"
- **Billing line (monthly):** Billed monthly by card
- **Button:** Choose Starter
- **Includes:**
  - 300 posts a month
  - 1,000 comments and 3,000 uploads a month
  - 1 brand
  - No per-account fees
  - Account and post analytics
  - The REST API and signed webhooks

### Pro (featured, label "Most popular")

- **Tagline:** For freelancers and agencies
- **Price:** RM99 a month · $49 outside Malaysia
- **Yearly:** RM990 a year · $490 outside Malaysia · "2 months free, billed yearly"
- **Billing line (monthly):** 14-day free trial, by card
- **Button:** Start the 14-day trial
- **Includes:**
  - 10,000 posts a month
  - 5,000 comments and 100,000 uploads a month
  - 10 brands, under RM10 each ($4.90 outside Malaysia)
  - No per-account fees
  - Account and post analytics
  - The REST API and signed webhooks

### Business

- **Tagline:** For apps built on Siar
- **Price:** RM399 a month · $149 outside Malaysia
- **Yearly:** RM3,990 a year · $1,490 outside Malaysia · "2 months free, billed yearly"
- **Billing line (monthly):** Billed monthly by card
- **Button:** Choose Business
- **Includes:**
  - 100,000 posts a month
  - 50,000 comments and 1,000,000 uploads a month
  - Unlimited brands
  - No per-account fees
  - Account and post analytics
  - The REST API and signed webhooks

### Enterprise

- **Tagline:** For large organizations
- **Price:** Custom
- **Line under price:** Custom. Talk to us.
- **Billing line:** Priced for your volume
- **Button:** Talk to us
- **Includes:**
  - Quotas, daily caps and rate limits set for your organization
  - Invoices
  - An SLA by contract

**Removed from every card** (truth §6 items 22–23): "Try every network", "All networks", "API, SDK, CLI, MCP".
SDK, CLI and MCP come back to the cards only when the packages are on npm.

### Lines directly under the cards (trust line beside the price)

Ringgit view:

> Paid to FF DEV STUDIO (SSM 202603234793), a Malaysian company. In ringgit, with a numbered receipt for every
> payment. Cancel any time; nothing is deleted.

USD view:

> Paid to FF DEV STUDIO (SSM 202603234793), Malaysia. In US dollars by card, with a numbered receipt for every
> payment. Cancel any time; nothing is deleted.

Then, on every view:

> Your price never goes up while you stay subscribed.

> Building on the API? Start the 14-day Pro trial. (link)

> Email support on every plan. Prices are final.

> Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on request (paid
> plans).

(The legal name in the trust line waits on owner decision 14 in `strike-plan.md` §10. If he says no, use "Paid to a
Malaysian company. In ringgit…" and keep the SSM number on `/about`.)

---

## 4. What your plan reaches today

**H2:** Which networks every plan reaches today

> Every plan, Free included, publishes to the same networks. Open today: Facebook Pages, Instagram professional
> accounts, Threads, X, LinkedIn personal profiles, Bluesky, Mastodon, Discord and Slack. YouTube: connect and
> upload now; public uploads not yet confirmed. TikTok, Pinterest publishing and LinkedIn company pages open after
> each network approves Siar. Reddit, Snapchat and Google Business Profile are built, not open yet.

> See the status of every network, with dates, on [/platforms](/platforms).

(Render from the single status constant, strike plan 0.2. Never from the health endpoint.)

---

## 5. Is there a free plan?

**H2:** Is there a free plan?

> Yes: 20 free posts to try, once. No card and no time limit. You get one brand, 50 comments and 60 uploads, and
> the same API and webhooks as every paid plan. Analytics are on paid plans only.
>
> The free start is one-time, not monthly. It never resets, and it is counted on each social account across
> organizations, so connecting the same account in a new organization does not start another 20. When it runs out,
> anything already scheduled still publishes, and you choose a plan to carry on.
>
> It is sized to answer one question: does "write it once, Siar it everywhere" work for you? Post to your own
> accounts, call the API, watch the webhook come back. Then decide.

**CTA:** Start with 20 free posts

---

## 6. Per organization, not per account

**H2:** Per organization, not per account

> You pay for your organization, fenced by brands and posts. No per-account fees. Each brand connects one account on
> every open network: Starter 1 brand, Pro 10, Business unlimited.
>
> A brand is one business or one client. In the API it is a team. Your Facebook Page, Instagram, Threads, X and
> LinkedIn profile for that brand sit in it, and adding a network to a brand never changes your plan price.
>
> So adding a client is a brand, not a line item per channel. On Pro, 10 clients cost RM99 a month, under RM10 a
> client ($49 outside Malaysia, $4.90 a client). Past 10, Business is RM399 ($149) for as many brands as you run.

**Small print under the section:**

> One account per network per brand. A client with two Instagram accounts uses two brands.

---

## 7. One post counts once

**H2:** One post counts once. Drafts and retries don't.

> A post sent to every network you've connected counts as one post on your plan, not one per network. Drafts are
> free; a post counts when it leaves draft, in the month you create or schedule it. If a network rejects it, retrying
> the post (up to 6 times) doesn't count again.
>
> If one network fails, the others still publish. The failed one keeps the network's own error and a plain-English
> fix, and a retry re-sends only the networks that failed.
>
> Posts are capped: 300 a month on Starter, 10,000 on Pro, 100,000 on Business. You can read your usage at any time from the API or the dashboard.
> At the limit, a new post gets a `403` that names the limit; posts already scheduled still go out.

---

## 8. Price lock

**H2:** Your price never goes up while you stay subscribed.

> Your subscription renews at the amount it started at. When the list price changes, running subscriptions keep
> theirs. Card plans and yearly plans paid once are both renewed at the price you locked in.
>
> Changing plan locks the new plan's price on the day you change. If you cancel and come back later, you start at
> that day's list price.

---

## 9. Pay in ringgit

**H2:** Pay in ringgit: card monthly, FPX or DuitNow yearly

> Organizations billed in Malaysia pay in ringgit. Monthly plans are paid by card and renew by themselves. Yearly
> plans can be paid by card, or once by FPX or DuitNow.
>
> A yearly plan paid once does not renew on its own. A renewal link opens 30 days before the end date, and we email
> it 7 days and 1 day before. If it is still unpaid, the plan stays on for 3 days' grace, then the organization
> moves to Free. Nothing is deleted, and no payment is taken unless you pay the link.
>
> Everywhere else pays in US dollars by card. Your first checkout sets the billing country from where you are; the
> owner can change it in Billing details for the next checkout. Prices are final.

---

## 10. Quota details (kept, tightened)

**H2:** How quotas work

Replace the `QuotaRules` list with:

- **Quotas count what your organization creates:** posts, comments and uploads. Paid plans reset every UTC calendar
  month. The free start is one-time and never resets.
- **A scheduled post counts when you create it** (or move it out of draft), not when it publishes, so you can
  schedule ahead as far as your quota allows.
- **Drafts are free.** A post starts counting when it leaves `DRAFT`.
- **Checked once.** Quotas and caps are checked when you create or schedule. A scheduled post is never refused
  later because of a quota.
- **Retries are free.** A failed post can be retried up to 6 times without counting again.
- **Daily caps** count posts and comments aimed at one connected account on one UTC day. They follow the account
  on the network, so disconnecting and reconnecting, or adding it to another brand, does not reset them.
- **Media** is kept for 14 days after its last use. Published posts on the networks are never affected.
- **Usage is readable any time** from `GET /organization/usage/posts`, `/comments`, `/uploads`, `/daily-limits`
  and `/imports`.

**H2:** Quotas and limits by plan

> Every figure below is read from the same constants the API enforces. The free start is one-time; paid plans count
> per month.

(Keep `PricingTables` `prices`, `quotas`, `imports`, `messaging`, `resources`. Table fixes:
- Row "All 15 networks, API, SDK, CLI, MCP, webhooks: Included" becomes **"REST API and signed webhooks: Included"**.
- Row "Connected social accounts: Unlimited" becomes **"Accounts per brand: One on every open network"**, plus a
  row **"Per-account fees: None"**.
- Messaging rows get the caption: "DMs and comment-to-DM: Facebook and Instagram, in beta, turned on per
  organization on request (paid plans)."
- Free column header: "Free (one-time)".)

**H2:** Per-network daily caps

> Networks throttle or flag accounts that post too often. Daily caps keep each account inside what its network
> tolerates. Starter and Pro share the same caps; Enterprise caps can be raised.

(Keep `PricingTables` `caps`, `comments`, `length`. Fix the TikTok comment length disagreement, truth §6 item 17,
before this table ships.)

---

## 11. X (Twitter)

**H2:** X (Twitter): prepaid credit at X's own prices

> X charges per API call, so X actions are paid from a prepaid credit at X's own USD prices: $0.015 to publish a
> post, $0.20 for a post that contains a link. A failed publish is never charged: the amount is held, then taken
> only on success. If the balance runs out, only X actions stop.
>
> Organizations billed in Malaysia buy credit in ringgit. The rate is shown before you pay.

(Keep the generated X price table and the `credit.low-balance` / `credit.exhausted` line. Do not write "at cost" or
"no markup" as a selling point until Fakhrul has read X's Developer Agreement III.A(e); strike plan §10 decision 9.)

---

## 12. Objection handling (on the page, in the sections named)

| Objection | Where it is answered | Line used |
|---|---|---|
| "20 posts is tiny. Others have free tiers that reset." | §5 | "It is sized to answer one question… Then decide." The page states one-time plainly, never hides it |
| "Unlimited accounts? What's the catch?" | §6 small print, FAQ | "One account per network per brand. A client with two Instagram accounts uses two brands." |
| "You cap posts." | §7 | The caps in one sentence, plus "one post counts once" and "drafts and retries don't" |
| "Prices go up after year one." | §8 | The price lock, with the plan-change and come-back rules stated |
| "Auto-renewal surprises." | §9, trust line | Yearly paid once by FPX or DuitNow, renewal by link, reminders 7 and 1 days, 3 days' grace |
| "USD on my card statement." | §9, trust line | Ringgit for organizations billed in Malaysia, paid to a Malaysian company |
| "Is SST added at checkout?" | Note under cards, FAQ | "Prices are final." No SST line |
| "You're new. Who uses you? Uptime?" | FAQ | Live since 12 October 2026; no case studies or uptime record yet; what you can check today |
| "Can I post to TikTok?" | §4 | The status block, "opening after TikTok approves Siar" |
| "Is the X pass-through marked up?" | §11 | "at X's own USD prices"; ringgit rate shown before you pay |

---

## 13. Comparison table

**None on this page.** Truth rule 3b.12 and messaging §11 keep competitor names off `/pricing`. The plan-against-plan
table in §10 is the comparison this page needs. The rival comparison (per profile vs per account vs per delivery vs
per organization, dated scenarios at 1, 10, 50 and 500 brands, with vendor URLs and "checked <date>") belongs on
`/guides/social-media-api-pricing` (C26), which links here. This page does not link out to any compare page
(strike plan §6).

---

## 14. FAQ

Answer first, 40–60 words each. Goes into `FAQPage` JSON-LD word for word.

**How much does Siar cost?**
Siar costs nothing to start: 20 free posts to try, once, with no card. Paid plans are Starter at RM39 a month ($19
outside Malaysia) for 1 brand, Pro at RM99 ($49) for 10 brands, and Business at RM399 ($149) for unlimited brands.
Yearly is 10 times monthly, so 2 months free. Enterprise is custom.

**Is there a free social media API?**
Siar's API is on every plan, Free included, but Siar has no free monthly plan. The free start is 20 free posts to
try, once, with no card and no time limit. Some other APIs offer free tiers that reset each month, usually limited by
accounts or uploads. Check which kind you are getting before you build on it.

**Does Siar charge per social account?**
No. Siar charges per organization, fenced by brands and posts, never per connected account. Each brand connects one
account on every open network: Starter has 1 brand, Pro 10, Business unlimited. Adding a network to a brand never
changes your plan price. Posts, comments and uploads have monthly caps on each plan.

**What is a brand?**
A brand is one business or one client you post for. In the API it is a team. Each brand holds one account on each
open network, so a brand can have a Facebook Page, an Instagram account, Threads, X and a LinkedIn profile. Starter
includes 1 brand, Pro 10, and Business and Enterprise unlimited.

**Can I connect two Instagram accounts for one client?**
Not in one brand. Each brand holds one account per network, so a second Instagram account goes in a second brand.
Pro includes 10 brands for RM99 a month ($49 outside Malaysia), and Business has unlimited brands. There are no
per-account fees on any plan, so the extra brand costs nothing on its own.

**What counts as a post?**
A post counts once, however many networks it goes to. It counts when it leaves draft, in the UTC month you create or
schedule it. Drafts are free, and retrying a failed post, up to 6 times, does not count again. On Free, posts come
from the one-time allowance of 20 free posts to try.

**What happens when I reach my limit?**
Creating or scheduling another post returns a 403 that names the limit. Posts already scheduled still publish,
because quotas are checked once, when a post is created. Paid quotas reset at the start of each UTC month. The free
start never resets, so when it is used up, choose a paid plan to carry on.

**Is there a free trial?**
Yes, 14 days on Pro. It is offered once per organization, on its first paid plan, and needs a card. Nothing is
charged while the trial runs, and if you cancel before it ends you are never charged. The free start is separate: 20
free posts to try, with no card and no time limit.

**Will my price go up?**
Not while you stay subscribed. Your subscription renews at the amount it started at, whatever happens to the list
price. Changing plan locks in the new plan's price on the day you change. If you cancel and subscribe again later,
you start at that day's list price. The lock covers card plans and yearly plans paid once.

**Can I pay with FPX or DuitNow?**
Yes, for yearly plans billed in Malaysia. Pay the year once by FPX or DuitNow, or by card. Monthly plans are paid by
card. A yearly plan paid once renews by a link that opens 30 days before the end date, with email reminders 7 days
and 1 day before and 3 days' grace after.

**Which currency will I pay in?**
Organizations billed in Malaysia pay in ringgit; everywhere else pays in US dollars by card. Your first checkout sets
the billing country from where you are, and the owner can change it in Billing details for the next checkout. A
running subscription keeps its currency and price. Ringgit prices are for organizations based in Malaysia.

**Is SST included?**
Prices are final. FF DEV STUDIO, the Malaysian company that runs Siar, is not registered for sales and service tax,
so no tax is added at checkout. If that changes, you will be told before it applies. Every payment gets a numbered
receipt from FF DEV STUDIO.

**How does X (Twitter) billing work?**
X charges per API call, so X actions are paid from a prepaid credit at X's own prices in US dollars: $0.015 to publish
a post and $0.20 for a post with a link. Organizations billed in Malaysia buy credit in ringgit at a rate shown before
paying. If the balance runs out, only X actions stop.

**Are DMs included?**
Facebook and Instagram DMs and comment-to-DM automations are in beta, turned on per organization on request, on paid
plans. Each paid plan has a monthly allowance per account: 500 DMs on Starter, 1,000 on Pro, 5,000 on Business.
Comments from every open network that supports them come into one inbox on every plan.

**Which networks can I post to?**
Every plan reaches the same networks. Open today: Facebook Pages, Instagram professional accounts, Threads, X,
LinkedIn personal profiles, Bluesky, Mastodon, Discord and Slack. YouTube uploads work; public uploads are not yet
confirmed. TikTok, Pinterest publishing and LinkedIn company pages open after each network approves Siar.

**Can I cancel, and do I get a refund?**
Cancel any time from Billing in the dashboard. Your plan runs to the end of the period you paid for, then the
organization moves to Free, and nothing is deleted. Fees already paid are not refunded, except where the law requires
it or we charged you in error. The refunds page has the details.

**Siar is new. Why trust it with billing?**
Siar has been live since 12 October 2026, so there are no case studies or uptime record yet. What you can check
today: the public OpenAPI file, the network and error references, the dated status of every network, and this price
list with its price lock. You pay FF DEV STUDIO, a Malaysian company, SSM 202603234793.

**What does Enterprise add?**
Higher quotas, plus daily caps and rate limits set for your organization, invoices, and an SLA by contract. There is
no list price: Enterprise is quoted per organization from your volumes. Talk to us with how many brands, posts and
networks you need, and we will send a quote.

---

## 15. Closing CTA

Use the `Cta` component with these props (and drop the arrow glyph from its button; messaging §6):

- **Title:** Write it once.
- **Dim:** Siar it everywhere.
- **Text:** Start with 20 free posts to try. No card, no time limit. When you're ready, plans start at RM39 a month in
  Malaysia or $19 elsewhere, and your price never goes up while you stay subscribed.
- **Primary button:** Start with 20 free posts
- **Secondary button:** Read the quickstart

(Replaces today's default text "The Free plan gives you 20 posts and 60 uploads to try", which drops "free" and
reads like a monthly allowance.)

---

## 16. Internal links

**Add on this page (body copy, descriptive anchors):**

| Anchor | Target | Where |
|---|---|---|
| "status of every network, with dates" | `/platforms` | §4 |
| "how a post is checked, sent once and reported" | `/how-publishing-works` (when live, W1) | §7, after "the others still publish" |
| "the network's own error and a plain-English fix" | `/errors` (when live) | §7 |
| "refunds page" | `/refunds` | FAQ "Can I cancel" |
| "Billing in the dashboard" | `https://app.siaran.my/billing` | FAQ "Can I cancel" |
| "API reference for credit" | `/docs/api/credit` | §11 (keep) |
| "quickstart" | `/docs/quickstart` | Closing CTA |
| "plain-text version" | `/pricing.md` | Hero small line |
| "Talk to us" | `/contact` | Enterprise card, FAQ |
| "agency pricing for 10 clients" | `/for-agencies` (when live) | §6 |
| "Malaysian pricing in ringgit" | `/malaysia` (when live) | §9 |

**Link to `/pricing` from:** every price mention site-wide (strike plan §6); `/guides/social-media-api-pricing`
(C26) with the anchor "Siar pricing"; `/for-agencies`, `/malaysia`, `/ms/harga`, every `/compare/*` page; the home
price line; `/llms.txt` and `/pricing.md` (absolute URL).

**Never link from `/pricing`:** any `/compare/*` page (strike plan §6, truth rule 12).

---

## 17. Schema notes

- Keep `softwareLd()` with **all** offers (geo plan P1): Free once, then for Starter, Pro and Business one ringgit
  `Offer` ("(Malaysia)") and one USD `Offer` ("(outside Malaysia)"), monthly. Both are visible on the page, so the
  markup states no price the reader can't see.
- Fix the Free `Offer.description`: `"20 posts to try"` becomes **`"20 free posts to try, one-time, no card"`**
  (`lib/seo.ts` line 65).
- Add `UnitPriceSpecification` to each paid `Offer` with `billingDuration: "P1M"` and `unitText: "organization"`,
  so the unit is machine-readable. Yearly offers can be added the same way with `billingDuration: "P1Y"`, since the
  toggle shows them.
- Enterprise: no `Offer` (no price).
- `FAQPage` from the section 14 list, word for word. Keep `BreadcrumbList`. Keep the `ContactPoint` as
  `customer support` (it is a contact line, not a support promise).
- No `AggregateRating`, `Review` or `review` fields anywhere.
- `/pricing.md`: same fixes as the page (truth §6 items 21–24; strike plan 0.16). Its first line becomes the hero
  subhead. Drop the row "All 15 networks, API, SDK, CLI, MCP, webhooks", replace "Unlimited" connected accounts with
  "One per open network, per brand; no per-account fees", replace `INBOX_NOTE` with the beta line, and change "passes
  the charge through at cost" to "at X's own prices in USD". Serve as `text/markdown; charset=utf-8`.

**Code to change with this copy:**
- `apps/api/src/domain/plans.ts`: `PLANS.FREE.tagline` "Try every network" → "Try Siar".
- `apps/site/src/lib/plans.ts`: `INBOX_NOTE` → "in beta, turned on per organization on request (paid plans)"
  (the full line in section 3 reads it as "Facebook and Instagram DMs and comment-to-DM automations: " + note).
- `PlanCards.astro`: Free "usd" line `${p.posts} posts to try` → "20 free posts to try, once"; Free button "Start
  free" → "Start with 20 free posts"; drop the "All networks, API, SDK, CLI, MCP, webhooks" bullet; "Unlimited social
  accounts" bullet → "No per-account fees".
- `pricing.astro`: hero, the three claim blocks (replaced by sections 5–9), notes, FAQ.

---

## 18. Why this wins

**Keywords:**
- **Siar pricing** (primary, p032): the brand plus "pricing" in the title, H1 area and first sentence. Today Bing
  Copilot repeats a wrong "RM399/month for up to 240 connected accounts" (`ai-answers.md` row 67, from
  `current-site.md`). A first line that states the unit, the caps and every price in one place gives engines one
  clean fact to quote [inferred].
- **social media api pricing** (C26 head, AC 7 per HU60): in the meta title ("social media API priced per
  organization") and the H2s. The explainer page C26 is the real target; this page is its destination link.
- **is there a free social media api** (p030, Med–high, HU21/HU59): an honest FAQ answer and the "Is there a free
  plan?" H2. Siar will not win "free API" as a head term (`ai-answers.md` row 63, "unlikely"), but an honest answer
  is what an AI engine can cite without misleading [inferred].
- **social media api priced per organization** (p006): the H1 and §6. Not claimed as unique; bundle.social, Outstand
  and Post for Me share the model (`ai-answers.md` row 57).
- **price lock** (row 65, very low demand): the exact `PRICE_LOCK` line as an H2, so AI answers can quote it.
- **pay in ringgit, FPX, DuitNow** (row 64, very low): the §9 H2 and the trust line. No rival API page was found
  offering it [inferred, `ai-answers.md` row 64].

**AI prompts it answers in the first 60 words or one FAQ:** p006 (priced per organization), p030 (free posting API),
p032 (Siar pricing), "does Siar charge per account", "Siar free trial", "Siar FPX DuitNow", "Siar SST", "Siar X
API cost", "can I connect two Instagram accounts to one brand".

**Why it converts:** it leads with the buyer's pain from `market.md` (P2, the billing unit; P9, renewal surprises;
P11, USD statements) and the outcome (adding a client is a brand, not a line item; the price does not move; ringgit
from a Malaysian company). Every limit sits next to its strength: one-time free start, one account per network per
brand, capped posts, TikTok not open. That is the "honest in the same breath" rule (messaging §6), and it removes
the over-claims a buyer would find in the dashboard ten minutes later.
