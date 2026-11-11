# /about: final copy (en)

Written 2026-11-12 for Wave 1 (strike plan §5.1 row `/about`, LIVE-RETITLE; keyword map C07).
Replaces `apps/site/src/pages/about.mdx` in full. The generated facts block in section 4 replaces the proposed `/facts`
page (strike plan §1, "Dropped or changed").

Every Siar fact below comes from `research/siar-truth.md` as corrected by `strike-plan.md` §2, from `messaging.md`, or
from the code named beside it. No competitor is named on this page: it is a company page, not a compare page
(messaging §11).

**Labels:** [code] read in this checkout · [doc] owner records in this repo · [live] fetched from siaran.my today ·
[measured] I checked it today · [inferred] my judgement.

**Research limit.** The shared web-search budget for this run was spent before this page was written, so no new SERP,
autocomplete or People Also Ask data was gathered here. Demand notes come from `keyword-map.md` (C07, §5b) and
`research/keywords/ai-answers.md`, and are **[inferred]**. The name collisions (SiAR, siar.my) were measured by the
sibling sweep in `research/current-site.md` §4 on 2026-11-12 and were not re-run. What I did check today
[measured]: the live `/about` title is "About Siar, the unified social media API" and its meta description is "Siar is
a unified social media API built by FF Dev Studio, a software studio in Malaysia."; `https://ffdev.studio/projects/siar`
and `https://github.com/Aphrosidiac/Siar` both return 200; the GitHub repo description still reads "…on 15 social
networks" (fix under strike plan O1 before it is linked from this page).

---

## 1. Meta

| Field | Copy | Length |
|---|---|---|
| URL | `https://siaran.my/about` (canonical, no trailing slash) | |
| Meta title | `About Siar (siaran.my) and FF Dev Studio` | 40 chars |
| Meta description | `Siar (siaran.my) is a social media API and dashboard made by FF DEV STUDIO, SSM 202603234793, in Setiu, Terengganu, Malaysia. Live since 12 October 2026.` | 153 chars |
| Breadcrumb | Home / About | |
| Kicker | About | |
| Visible date | "Facts updated <build date>" beside the kicker (`updated` set from the build, not `false`) | |

Why this title: the plan's "About Siar and FF Dev Studio" drops "unified social media API" so `/about` stops competing
with home for that phrase (strike plan §6 rule 1). "(siaran.my)" is added because the name never travels alone in a
title (strike plan §5.0 rule 6): SiAR and siar.my share it.

---

## 2. Hero

**Kicker:** About

**H1:** Siar is made by FF Dev Studio, in Malaysia

**Hero subhead (answers "who makes Siar" in the first 60 words):**

> Siar (siaran.my), a social media API and dashboard, is made and run by FF Dev Studio, a software studio in Setiu,
> Terengganu, Malaysia. The business is registered with SSM as FF DEV STUDIO, number 202603234793. Siar has been live
> since 12 October 2026. The facts on this page are generated from the code that runs Siar.

(56 words; the maker, the registration and the location sit in the first 40.)

**Primary CTA:** Start with 20 free posts
**Secondary CTA:** Read the quickstart (`/docs/quickstart`)

Small line under the CTAs: "No card for the free start. Questions first? Write to siaran@ffdev.studio."

**Layout note.** `Page.astro` prints `description` as the lead. Add an optional `lead` frontmatter field so the subhead
above can run under the H1 while the meta description stays at 153 characters.

---

## 3. Section: Who makes Siar

**Heading:** Who makes Siar

> Siar is built and operated by FF Dev Studio, a software studio in Malaysia. The same studio builds web and mobile
> software for clients at [ffdev.studio](https://ffdev.studio). When you pay for Siar, you pay FF DEV STUDIO, and every
> payment gets a numbered receipt.
>
> The studio is in Setiu, Terengganu. Email reaches the people who build Siar directly:
> [siaran@ffdev.studio](mailto:siaran@ffdev.studio). Support is by email on every plan.

---

## 4. Section: Siar facts (generated block)

**Heading:** Siar facts

**Intro line:** "One list for anyone checking Siar, people and AI engines alike. Each line is generated from the constant that runs
the site, so it is never out of step with the product."

### 4a. The canonical paragraph (verbatim, generated)

> Siar is a unified social media API and dashboard by FF Dev Studio, a software studio in Malaysia. It checks each post
> against each network's rules before sending, sends it to each connected account once, returns the network's own
> error with a plain-English fix, and reports the result through signed webhooks that are retried for about 45 hours.
> It is priced per organization, not per connected account: 20 free posts to try, then from $19 a month (RM39 in
> Malaysia). Publishing is open today on Facebook, Instagram, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord
> and Slack. YouTube uploads work, and public visibility is not yet confirmed. TikTok, Pinterest publishing and
> LinkedIn company pages are waiting on those networks' approval. Reddit, Snapchat and Google Business Profile are built
> but not open yet.

(Word for word from `messaging.md` §1. Render it from the plan and status constants so it changes the day a network
opens. Do not hand-edit it on this page.)

### 4b. The facts table

Two columns, plain table, no icons or chips. Left column is the fact name, right column the value. Values in `code`
font only where they are code.

| Fact | Value (final wording) | Generated from |
|---|---|---|
| Product | Siar: one REST API to publish, schedule, reply to and measure social media posts, with a dashboard built on the same API | `config.ts` `DESCRIPTION` (rewrite it to this; today it says "across 15 networks") |
| Website | siaran.my (dashboard at app.siaran.my, API at api.siaran.my) | `config.ts` `DOMAIN`, `DASHBOARD_URL`, `API_ORIGIN` |
| Made and operated by | FF DEV STUDIO (FF Dev Studio) | `LEGAL_NAME` |
| Registration | SSM (Companies Commission of Malaysia) registration number 202603234793 | `LEGAL_REG` |
| Address | No 15982 B, Kampung Selamat, Sungai Tong, 21500 Setiu, Terengganu, Malaysia | `ADDRESS` |
| Contact | siaran@ffdev.studio · +60 13 907 8719 | `CONTACT_EMAIL`, `CONTACT_PHONE` |
| Support | Email support on every plan | `docs/pricing.md` [doc] |
| Live since | 12 October 2026 (siaran.my, app., api. and media.) | new constant `LIVE_SINCE = '2026-10-12'` |
| Meta App Review | Siar's Meta app passed App Review on 27 October 2026, with all 27 permissions it asked for | new constant from `docs/approvals/meta.md` |
| Google OAuth verification | Approved for Siar's YouTube connection on 15 October 2026 | new constant from `docs/approvals/google.md` |
| Open today | Facebook Pages, Instagram professional accounts, Threads, X, LinkedIn personal profiles, Bluesky, Mastodon, Discord, Slack | status constant (strike plan 0.2) |
| YouTube | Connect and upload now; public uploads not yet confirmed | status constant |
| Waiting on approval | TikTok (opening after TikTok approves Siar) · Pinterest (connect today; publishing Pins opens after Pinterest grants Standard access) · LinkedIn company pages (open after LinkedIn grants page access) | status constant |
| Built, not open yet | Reddit, Snapchat, Google Business Profile | status constant |
| Pricing unit | Per organization, never per connected account. No per-account fees: each brand connects one account on every open network | `plans.ts` |
| Free start | 20 free posts to try, one-time, no card | `PLANS.FREE` |
| Plans, outside Malaysia | Starter $19 a month (1 brand, 300 posts a month) · Pro $49 (10 brands, 10,000 posts, 14-day trial) · Business $149 (unlimited brands, 100,000 posts) · Enterprise custom | `money(tier, 'MONTHLY', 'usd')`, `PLANS` |
| Plans, in Malaysia | Starter RM39 a month · Pro RM99 · Business RM399 · Enterprise custom. Billed in ringgit for organizations billed in Malaysia | `money(tier, 'MONTHLY', 'myr')` |
| Yearly | 10 times the monthly price (2 months free). In Malaysia, a year can be paid once by FPX or DuitNow | `monthsFree()`, `ONCE_METHODS` |
| Price lock | Your price never goes up while you stay subscribed. | `PRICE_LOCK` |
| X usage | Billed from a prepaid credit at X's own USD prices | `X_PRICES`, `X_CREDIT_NOTE` |
| API | One REST API, described by a public OpenAPI 3.0 file (270 operations) at `/openapi.json` | `OP_COUNT()`, `SPEC.openapi` |
| Authentication | Organization API key in the `x-api-key` header | docs/authentication |
| Webhooks | 16 HMAC-signed event types, retried 7 times over about 45 hours, with a delivery log and resend | `WEBHOOK_EVENTS.length`, `webhooks.ts` schedule |
| SDK, CLI, MCP | TypeScript SDK, CLI and MCP server (version 0.1.0), built from the same OpenAPI contract. Not on npm yet | status constant |
| Tokens | Encrypted at rest and never returned by the API | README [doc] |
| Affiliation | Network names are trademarks of their owners. Siar is not affiliated with or endorsed by any of them | footer text |
| Not to be confused with | siar.my (a film-streaming service) or SiAR (an irrigation API) | static |

**Line under the table:** "Something here disagrees with another page? Tell us at siaran@ffdev.studio and we fix the
source, not just the page."

Notes on the table:
- **"Contact" is a contact line.** The number is printed exactly as in the footer. Never label it "phone support",
  "call us" or "WhatsApp" (truth §1d, messaging §10).
- **No plan-cap rows beyond posts and brands.** Comments, uploads and daily caps live on `/pricing`; repeating them here
  is a stat dump.
- **No "unlimited accounts"** on its own. The brief for this task says "unlimited accounts on every plan"; messaging §3
  pillar 3 overrules it with "No per-account fees: each brand connects one account on every open network".

---

## 5. Section: Why Siar exists

**Heading:** Why Siar exists

> Every product that posts to social media ends up building the same layer. OAuth for each network, token refresh,
> media that one network accepts and the next rejects, retries that must not post twice, and a way for customers to
> connect their own accounts. None of it is the product you are selling.
>
> Then come the gates. Siar's Meta app review ran from 14 to 27 October 2026. LinkedIn denied page access without
> giving a reason, and TikTok's audit has not passed yet. Siar takes that work on once, so your team doesn't repeat it
> for every network.

---

## 6. Section: How Siar is built

**Heading:** How Siar is built

> **One contract.** The OpenAPI document is the source of truth. The server mounts its routes from it and checks every
> request against it. The SDK, CLI, MCP server and the API reference on this site are generated from it.
>
> **Every post accounted for.** Each post is checked against each network's rules when you create it, so a bad request
> fails with a `400` you can fix. Each account gets the post once. If a network says no, you get its own code and
> message, plus a plain-English fix. A signed webhook tells your server how it went.
>
> **Real network behavior.** Each network adapter is tested against a mock server written from that network's own
> documentation. The limits and error references on this site are generated from the code that enforces them.
>
> **One price for the organization.** Plans are fenced by brands and posts, not by the accounts you connect. Your price
> never goes up while you stay subscribed.

Link "Every post accounted for" to `/how-publishing-works` once that page is live (strike plan §3.6 and §5.2, W1); until then,
link to `/docs/posting`.

---

## 7. Section: Is Siar legit?

**Heading:** What you can check before you trust Siar

> Siar is new: it has been live since 12 October 2026. So there are no case studies, reviews or uptime record to show
> yet, and this page will not invent any. Here is what you can check today.
>
> - **Who you pay.** FF DEV STUDIO, SSM registration number 202603234793, with a street address in Setiu, Terengganu.
> - **The network reviews Siar has passed.** Meta's App Review on 27 October 2026, and Google's OAuth verification for
>   YouTube on 15 October 2026. Where a network has not approved Siar, the [networks page](/platforms) says so.
> - **The whole API.** The [OpenAPI file](/openapi.json) is public, and so is each network's error reference, for
>   example the [Facebook API error codes](/facebook-api/errors).
> - **The price list.** Every plan, in ringgit and US dollars, on [pricing](/pricing), with a price lock.
> - **The rules.** [Terms](/terms), [privacy](/privacy), [refunds and cancellation](/refunds) and
>   [data deletion](/data-deletion).
>
> Then try it with 20 free posts, no card. You can cancel a paid plan any time from the dashboard. Nothing is deleted.

---

## 8. Section: The name

**Heading:** The name

> *siar* /ˈsi.ar/ is Malay for "to broadcast". Write it once. Siar it everywhere.
>
> Siar (siaran.my) is not siar.my, a film-streaming service, or SiAR, an irrigation API.

(The disambiguation is the one line the task asks for. Keep it plain: no links to either service.)

---

## 9. Section: Contact

**Heading:** Talk to the people who build it

> Questions, partnerships or press: [siaran@ffdev.studio](mailto:siaran@ffdev.studio). For support, include your
> organization name and the request or post id; the [contact page](/contact) lists what helps. Enterprise plans with
> higher limits, invoices and an SLA by contract: Talk to us.

("Talk to us" links to `mailto:siaran@ffdev.studio?subject=Enterprise`. It is the only Enterprise CTA label allowed.)

---

## 10. Closing CTA

**Heading:** Try Siar with 20 free posts

> No card, no time limit. Paid plans start at $19 a month (RM39 in Malaysia), with no per-account fees.

**Primary:** Start with 20 free posts
**Secondary:** Read the quickstart

---

## 11. Objection handling (on the page, in the sections named)

| The buyer thinks | Where the page answers it | Answer used |
|---|---|---|
| "Is this a real company?" | Hero, §3, §4 | "FF DEV STUDIO, SSM registration number 202603234793, Setiu, Terengganu, Malaysia." Street address and contact in the facts table |
| "Who uses you? What's your uptime?" | §7 | "Siar is new… no case studies, reviews or uptime record to show yet." Then the checkable list |
| "Will a small Malaysian studio still be here in a year?" | §6, §7, FAQ | Price lock; public OpenAPI file; cancel any time, nothing deleted; Enterprise SLA by contract. No promise about the future |
| "Is Siar a Meta partner?" | §4 Affiliation row, FAQ | "Siar's Meta app passed App Review on 27 October 2026. That is a review of Siar's app, not a partnership." |
| "Can it post to TikTok?" | §4 status rows | "TikTok: built, opening after TikTok approves Siar." |
| "Is there phone or WhatsApp support?" | §3, §4 | "Email support on every plan." The phone number is shown only as a contact line |
| "Is this the same as siar.my or SiAR?" | §8, FAQ | The disambiguation line |
| "Why should I believe your network list?" | §4, §7 | The list comes from one status constant, and `/platforms` shows each network's status |

---

## 12. Comparison table

None. `/about` is a company page; rivals are named only on `/compare/*`, the pricing explainers, the `/malaysia`
table and the webhook table (messaging §11). The facts table in section 4 is the page's table.

---

## 13. FAQ

Answer first, 40–60 words each. Goes into `FAQPage` JSON-LD word for word, and is visible on the page.

**Who makes Siar?**
Siar is made and run by FF Dev Studio, a software studio in Setiu, Terengganu, Malaysia. The business is registered
with SSM as FF DEV STUDIO, number 202603234793. The same studio builds web and mobile software for clients. You reach
the team that builds Siar at siaran@ffdev.studio.

**Is Siar legit?**
Siar is a live product of FF DEV STUDIO, SSM 202603234793, a registered Malaysian business. It launched on 12 October
2026, so there are no reviews or case studies yet. You can check its passed Meta App Review, its public OpenAPI file,
its network status page and its price list, then try 20 free posts with no card.

**What is Siar?**
Siar (siaran.my) is a social media API and dashboard. One REST API publishes, schedules, replies to and measures posts,
and the dashboard runs on the same API. It is priced per organization, not per connected account: 20 free posts to
try, then from $19 a month (RM39 in Malaysia).

**When did Siar launch?**
Siar went live on 12 October 2026 at siaran.my, with the dashboard at app.siaran.my and the API at api.siaran.my.
Siar's Meta app passed App Review on 27 October 2026, and Google approved its OAuth verification for YouTube on
15 October 2026. What changed since launch is listed in the changelog.

**Is Siar affiliated with Meta, Google or TikTok?**
No. Siar is not affiliated with or endorsed by any social network. Siar's Meta app passed Meta's App Review on 27
October 2026, and Google approved its OAuth verification on 15 October 2026. Those are reviews of Siar's own apps,
not partnerships. TikTok has not approved Siar yet.

**Which networks can Siar post to today?**
Facebook Pages, Instagram professional accounts, Threads, X, LinkedIn personal profiles, Bluesky, Mastodon, Discord
and Slack are open today. YouTube uploads work; public uploads are not yet confirmed. TikTok, Pinterest publishing and
LinkedIn company pages wait on those networks' approval. Reddit, Snapchat and Google Business Profile are built, not
open yet.

**How much does Siar cost?**
Siar starts with 20 free posts to try, once, with no card. Then Starter is $19 a month (RM39 in Malaysia) for 1 brand,
Pro $49 (RM99) for 10 brands, and Business $149 (RM399) for unlimited brands. Yearly is 10 times monthly. There are no
per-account fees, and your price never goes up while you stay subscribed.

**How do I contact Siar?**
Email siaran@ffdev.studio for support, sales, partnerships, security reports or data requests. Support is by email on
every plan. The contact number +60 13 907 8719 and the street address in Setiu, Terengganu are in the footer of every
page. Include your organization name and any post or request id.

**Is Siar the same as siar.my or the SiAR API?**
No. Siar (siaran.my) is a social media API and dashboard made by FF Dev Studio in Malaysia. siar.my is a separate
film-streaming service, and SiAR is an unrelated irrigation API. They share a name and nothing else. Look for the
siaran.my domain to be sure you have the right Siar.

**What does the name Siar mean?**
Siar is Malay for "to broadcast", and siaran, the word in the domain siaran.my, means a broadcast. The idea is in the line
"Write it once. Siar it everywhere.": you write a post once, and Siar sends it to each connected account on every open
network, then tells you how it went.

---

## 14. Internal links

**Out from `/about`** (descriptive anchors, one per target):

| Anchor | Target | Section |
|---|---|---|
| Read the quickstart | `/docs/quickstart` | Hero, closing CTA |
| networks page | `/platforms` | §7 (and the status rows in §4 link `/platforms` once) |
| OpenAPI file | `/openapi.json` | §7, facts table "API" row |
| Facebook API error codes | `/facebook-api/errors`; when `/errors` ships (W1), add "social media API error codes" → `/errors` | §7 |
| pricing | `/pricing` | §7, facts table plan rows link once |
| Every post accounted for | `/docs/posting` now, `/how-publishing-works` when live | §6 |
| terms, privacy, refunds and cancellation, data deletion | the four legal pages | §7 |
| contact page | `/contact` | §9 |
| changelog | `/changelog` | FAQ "When did Siar launch?" |
| ffdev.studio | `https://ffdev.studio` | §3 |
| Meta App Review row | `/platforms/approvals#meta` once C91 is live; no link before | §4 |
| Siar (home) | `/` with anchor "Siar home", never "unified social media API" (that exact anchor points to `/` from network hubs only, strike plan §6 rule 1) | breadcrumb |

**Into `/about`** (add):
- `/malaysia` (W1): "who makes Siar" in its trust paragraph.
- `/pricing` trust line under the cards: "FF DEV STUDIO (SSM 202603234793)" links `/about#facts`.
- `/llms.txt`: move About from "Optional" to the main list, with the line "Company and entity facts: <url>/about".
- `/contact`: "About Siar and FF Dev Studio" link in the operator line.
- Footer: keep the existing "About" link.

Give the facts block the id `facts` so other pages and directory listings can link `/about#facts`.

---

## 15. Schema notes

- Page type: `AboutPage` with `mainEntity: { "@id": ORG_ID }`, `isPartOf: { "@id": WEBSITE_ID }`, `dateModified` = the
  build date shown beside the kicker, and `BreadcrumbList` (Home › About).
- Reuse `orgLd()` (one Organization `#org` with `parentOrganization` `#ffdevstudio`). Changes in `lib/seo.ts`:
  - `description`: the new `DESCRIPTION` (no "across 15 networks").
  - Add `alternateName: ["Siar social media API", "siaran.my"]` and
    `disambiguatingDescription: "Siar (siaran.my) is a social media API and dashboard by FF Dev Studio in Malaysia. Not siar.my or the SiAR irrigation API."`
  - Add `sameAs: ["https://ffdev.studio/projects/siar"]` (200 today [measured]). Add `https://github.com/Aphrosidiac/Siar`
    only after its description stops saying "on 15 social networks" (strike plan O1), and only if Fakhrul wants the repo
    pointed at (it is public with no license [measured via the GitHub API]).
  - `ContactPoint`: drop `'ms'` from `availableLanguage` (the dashboard and support are in English; "BM support" is on
    the never-claim list, messaging §10). Keep `contactType: "customer support"` with email; it is a contact line, not
    a phone-support promise.
  - On the parent `#ffdevstudio`: keep `identifier` but make it a `PropertyValue`
    (`{ "@type": "PropertyValue", "propertyID": "SSM", "value": "202603234793" }`) so engines know which register it is.
    Add `address` (already there) and `areaServed` is not needed.
- Product launch date: add `datePublished: "2026-10-12"` to the `SoftwareApplication` node (`softwareLd`) rather than
  `foundingDate` on the Organization; 12 October is when the product went live, not when the business was founded.
- `FAQPage` from section 13, word for word.
- No `AggregateRating`, `Review` or `award` fields. The Meta and Google approvals stay in text, never as `award` or a
  badge.

---

## 16. Code to change with this copy

- `apps/site/src/pages/about.mdx`: replace in full. Frontmatter: `title: Siar is made by FF Dev Studio, in Malaysia`,
  `metaTitle: About Siar (siaran.my) and FF Dev Studio`, `description:` the meta description, new `lead:` the hero
  subhead, `eyebrow: About`, `updated:` build date.
- `apps/site/src/layouts/Page.astro`: accept an optional `lead` (fall back to `description`).
- New `apps/site/src/components/FactsBlock.astro` rendering section 4 from `config.ts`, `lib/plans.ts`,
  `lib/openapi.ts` (`OP_COUNT`), `lib/events.ts` and the status constant (strike plan 0.2). Reuse it in `/llms.txt`
  and `/pricing.md` so all three agree.
- `apps/site/src/config.ts`: rewrite `DESCRIPTION` (section 4 "Product" row); add `LIVE_SINCE = '2026-10-12'` and an
  `APPROVALS` constant (Meta 2026-10-27, 27 permissions; Google OAuth 2026-10-15).
- `apps/site/src/lib/seo.ts`: the schema changes in section 15.

---

## 17. Owner decisions this page depends on

1. **FF's legal name on `/about`** (strike plan §10 decision 14). House style keeps FF to "Siar by FF Dev Studio" in
   the footer and legal pages; the plan already proposes allowing the legal name on price pages and `/about`. This
   page needs that yes.
2. **Business type wording.** The registration number 202603234793 has the "03" type code that, in SSM's 12-digit
   format, usually marks a business registered under the Registration of Businesses Act rather than a Sdn Bhd
   [inferred]. The copy therefore says "registered with SSM" and "registered Malaysian business", never "Sdn Bhd" or
   "company number". Fakhrul to confirm, and to change "company" in the messaging trust line if needed.
3. **A named person.** Engines and evaluators trust a page with a named founder more [inferred]. No name is in the
   truth file, so none is on the page. If Fakhrul wants his name here, add it to `siar-truth.md` §1d first.
4. **Meta business verification.** `docs/approvals/meta.md` records "business FF Dev Studio verified" [doc]. It is not
   in `siar-truth.md`, so it is left out. Add it there (with a date) if it should appear in the facts table.

---

## 18. Why this wins

**Keywords** (demand is very low for all of them [inferred, keyword map C07]; this page is for the people and engines
who already know the name):
- Primary: "who makes Siar" (p035). Answered in the H1 and the first sentence of the subhead.
- "is Siar legit" (p034). Answered by §7 and the FAQ with checkable facts, not reviews. Full credit still needs
  third-party confirmation (directory listings, strike plan O4), which this page cannot supply.
- "Siar social media API company", "FF Dev Studio", "Siar siaran.my": in the title, the subhead and the facts table.

**AI prompts it targets** (`docs/geo/prompts_v1.csv`): p035 who makes Siar API, p034 is Siar legit, p031 what is Siar
social media API, p033 which networks does Siar support, p032 Siar siaran.my pricing (backup to `/pricing`). From
`prompts_my_v1`: "Is there a Malaysian social media scheduling tool?" (supporting `/malaysia`).

**Why it should win them:**
- It is the only page that answers the entity question in one place, and the answer is in the first 60 words.
- The canonical paragraph and the facts table are generated from the same constants as `/`, `/llms.txt` and
  `/pricing.md`. Engines repeat what agrees across sources [inferred, strike plan §8]; today Siar's own surfaces
  disagree (Bing Copilot quotes a wrong price, `current-site.md` §4).
- It fixes the two most likely wrong answers about the entity: the network count (open list, not "15 networks") and
  the name collision (siar.my, SiAR).
- It stops competing with home: "unified social media API" leaves the title, and no anchor here uses that phrase.
- It is honest about being new. A buyer who asks "is Siar legit" gets the registration, the address, the dated network
  reviews and the public API file, plus a plain line that there are no reviews yet. That answer survives a fact check.
