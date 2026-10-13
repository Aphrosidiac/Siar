# Pricing: Siar, decided 2026-10-13

Fakhrul's brief: stop copying bundle.social's prices and make Siar the best option for Malaysians.
The numbers live in `apps/api/src/domain/plans.ts`; everything else (API, dashboard, site, `pricing.md`,
`llms.txt`, JSON-LD) reads them from there. This file is the reasoning, so the numbers can be changed
later without losing why they are what they are.

## The model

Siar sells to three buyers, and each paid tier is fenced by what that buyer grows into:

| Buyer | Grows by | Tier | Fence |
|---|---|---|---|
| A shop or business owner | nothing: one business, wants "post once, everywhere" | Starter | volume |
| A freelancer or agency | clients | Pro | brands (teams) |
| A developer / SaaS on the API | API volume, DMs, automation | Business | volume |

"Per organization, never per connected account" stays: every plan, Free included, connects unlimited
social accounts. A **brand** is a team in the dashboard: one business or one client.

## The plans

| | Free | Starter | Pro | Business | Enterprise |
|---|---|---|---|---|---|
| Malaysia, monthly | RM0 | **RM39** | **RM99** | **RM399** | custom |
| Malaysia, yearly (10×) | | RM390 | RM990 | RM3,990 | |
| Elsewhere, monthly | $0 | **$19** | **$49** | **$149** | custom |
| Elsewhere, yearly | | $190 | $490 | $1,490 | |
| Brands | 1 | 1 | 10 | unlimited | unlimited |
| Posts | 20 **one-time** | 300 / mo | 10,000 / mo | 100,000 / mo | 1,000,000 / mo |
| Comments | 50 one-time | 1,000 / mo | 5,000 / mo | 50,000 / mo | 500,000 / mo |
| Uploads | 60 one-time | 3,000 / mo | 100,000 / mo | 1,000,000 / mo | 10,000,000 / mo |
| Analytics | no | yes | yes | yes | yes |
| Inbox DMs (FB + IG), per account / mo | 0 | 500 | 1,000 | 5,000 | 10,000 |
| Comment-to-DM runs, per account / mo | 0 | 200 | 1,000 | 5,000 | 10,000 |
| History import, per account | 5 one-time | 50 / mo | 100 / mo | 500 / mo | 5,000 / mo |
| Review import, per account | 5 one-time | 50 / mo | 200 / mo | 1,000 / mo | 1,000 / mo |
| Daily per-network caps | Free caps | Pro caps | Pro caps | Business caps | Business caps |
| Free trial | | | 14 days | | |

Support is ordinary email support on every plan (no WhatsApp line, no "priority support" tier).
No SST: FF DEV STUDIO is not required to register yet, so every price is final.

### Why each one

- **Free: a trial with no clock.** 20 posts are enough to feel "post once, it appears everywhere" and to
  see the API work, but a shop posting daily runs out within weeks. It is a one-time allowance, not monthly,
  because a monthly free plan lets a small shop that posts 15 times a month stay free forever.
  One brand, so agencies cannot run their clients on it. The wording is always explicit, "20 free posts
  to try", never a bare "20 posts": nearly every competitor's free plan is monthly, so a bare number reads
  as monthly and the user feels tricked when it does not reset (and AI answers would repeat the wrong fact).
  Free posts are also counted **per social account across organizations**, so a new organization that
  reconnects the same Instagram does not get a fresh 20. Downgrading back to Free does not refill it.
- **Starter RM39: for one business.** The Malaysia-first tier. 300 posts is ten a day. Analytics answers
  "is this working?". The inbox and comment-to-DM automation are the real hook: Malaysian online selling
  runs on "PM for price" and "comment HARGA". RM39 sits next to what SMEs already pay for software
  (Bukku Seed RM35) and below every per-channel scheduler.
- **Pro RM99: freelancers and agencies, "Most popular".** 10 brands at RM99 is under RM10 a client; a
  freelancer charges RM800–1,500 per client, so one client pays for the year. The 10-brand cap is the
  deliberate change from bundle's unlimited teams: without it every agency and developer stops at RM99
  forever. Under RM100 matters psychologically. The 14-day trial is here (agencies need time to connect
  clients before they trust it); it is offered once, on an organization's first paid plan, by card.
- **Business RM399: apps built on Siar and large agencies.** Real volume. Developers compare in USD:
  $149 against bundle Business $400 and Ayrshare Launch $299. It also anchors Pro on the pricing page.
- **Enterprise: custom.** Above Business volume, invoices, custom limits and an SLA. "Talk to us", no number.

### Why ringgit and USD are different lists

Malaysians get roughly half the overseas price; that is the "priced for Malaysia" story. Overseas
prices match the market the API competes in: Late $19 / $49, Upload-Post $16–147, Ayrshare from $149
for one profile, bundle.social $100 / $400 (sources below, checked 2026-10-13). Siar still undercuts all
of them per organization.

## Rules the code enforces

- **Billing country decides the list** (`Organization.billingCountry`). The first checkout fixes it from
  Cloudflare's `CF-IPCountry` (MY when unknown); the owner can change it in Billing details. A change
  applies to the next checkout; a running subscription keeps its currency and price.
- **Card country is recorded, never refused.** A ringgit payment made with a card issued abroad writes a
  `billing.cardCountry` audit row. The terms reserve the right to move such an organization to USD at
  its next renewal, with notice. Nothing is automatic.
- **Price lock.** A subscription renews at `Subscription.unitAmountCents`, set when it starts or changes
  plan. A list-price change never touches a running subscription (Stripe: new prices get new lookup keys
  `siar_<tier>_<interval>_<currency>_<amount>`; CHIP and link renewals: our cron charges the stored price).
- **Payments.** Monthly: card, renewed automatically. Yearly: card, or **paid once** (renewal `LINK`):
  Stripe FPX / GrabPay today, CHIP (FPX, DuitNow) once CHIP opens those methods for the brand. A link plan
  gets reminders 7 days and 1 day before its end date, then 3 days' grace (`past_due`), then moves to Free.
  The renewal link (`billing.checkout` with `renew: true`) opens 30 days before the end and charges the
  locked price.
- **Routing.** Ringgit goes to CHIP when CHIP reports that kind of method open for the brand
  (`/payment_methods/`, cached 30 min), else Stripe in ringgit. USD always goes to Stripe.
- **X credit** stays USD (X's own prices). Organizations billed in Malaysia buy it in ringgit at
  `USD_MYR_RATE` (default 4.20: the mid rate was ~4.08 on 2026-10-06, plus a buffer for card and FX costs).
- **Brand caps** block creating a team over the cap. Teams already over it (after a downgrade) keep working.

## Marketing

Three claims, all true in the code today:

1. **Pay by business, not by channel.** Unlimited social accounts on every plan. (Buffer charges per
   channel: 5 channels is about RM120 a month; Siar Starter covers every account for RM39.)
2. **One post counts once.** A post to every connected network counts as one (`posts.ts` consumes 1 per post).
3. **Priced for Malaysia.** Ringgit, card or FPX/GrabPay, paid to a Malaysian company: no foreign
   transaction fee or FX spread on the customer's statement.

Pricing page: monthly by default, yearly toggle "2 months free", Pro in the middle and featured, the
USD price visible under each ringgit price, "Your price never goes up while you stay subscribed", and
"Building on the API? Start the 14-day Pro trial." No competitor names on the pricing page; comparisons
belong on `/compare` pages with sources.

Social ads are colloquial Malaysian BM (English trade words are fine), never bahasa baku:

- "Post sekali, keluar kat semua platform. RM39 sebulan."
- "Comment HARGA, terus dapat DM." (only after Meta approves messaging)
- "10 client, RM99. Kurang RM10 satu client."
- "Harga Malaysia. Bayar dalam ringgit, kad atau FPX."

### What not to claim yet

- Inbox and comment-to-DM: say "Facebook and Instagram, opening after Meta approval" until App Review passes.
- TikTok, YouTube, Google Business Profile, Pinterest, Reddit, Snapchat: not until their apps are approved.
- DuitNow: not until CHIP opens it for the brand. The customer-facing method list is one constant,
  `ONCE_METHODS` in `plans.ts` ("FPX or GrabPay"); change it there and on the site when CHIP is live.
- Timing: agencies and developers can be pitched as soon as this is live. The Malaysian SME ads (BM)
  wait for Meta (inbox, automation) and TikTok approval, because Starter's strongest pitch needs them.

## Operations

- Stripe: the FF Dev Studio account is Malaysian (country MY, default currency MYR, card + FPX + GrabPay on;
  checked read-only 2026-10-13). Add `checkout.session.async_payment_succeeded` and
  `checkout.session.async_payment_failed` to the webhook for FPX. The old USD placeholder prices can be
  archived; no subscriber was on them.
- CHIP: set `CHIP_SECRET_KEY` and `CHIP_BRAND_ID` on the server when ready; routing switches by itself
  once the methods are approved. Test first with CHIP's test-mode keys.
- Env: `USD_MYR_RATE` replaces `CHIP_USD_MYR`.

## Sources (checked 2026-10-13)

- Ayrshare: https://www.ayrshare.com/pricing
- Late: https://docs.getlate.dev/pricing
- Upload-Post: https://www.upload-post.com/pricing-comparison
- Metricool: https://www.socialpilot.co/insights/metricool-pricing
- Buffer: https://buffer.com/resources/buffer-vs-metricool/
- Bukku: https://bukku.my/pricing
- SleekFlow (MY): https://sleekflow.io/en-my/pricing
- Agency and freelancer rates: https://www.shinjiru.com.my/blog/why-malaysian-brands-are-ditching-freelancers-for-social-media-management-agencies/
- USD/MYR: https://www.businesstoday.com.my/2026/10/06/foreign-exchange-rates-oct-6-2026/
