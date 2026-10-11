# bundle.social pricing

> Machine-readable rate card for the bundle.social unified social media API: plan prices, every included
> quota, per-network daily caps, and the X pass-through rate. Rendered from the same constants the API
> enforces at runtime, so these numbers cannot drift from what you are actually billed and limited on.

Canonical page: https://bundle.social/pricing
Last updated: 2026-07-30. Currency: USD. Language: en-US.

## Billing model

Every plan is priced **per organization** - not per seat, not per connected social account, not per
workspace. You scale by publishing volume, not by how many accounts your customers connect.

A **social set** is a team inside your organization. Each team holds at most one connected account per network, so one team is one "set" of up to 15 accounts - one per supported network. To manage several accounts on the same network (multiple Instagram profiles, multiple Google Business locations, one workspace per customer of your SaaS), create one team per account. Paid plans place no cap on teams, which is why connected accounts are unlimited on every paid plan.

## Plans

| Plan | Monthly billing | Yearly billing | For |
|---|---|---|---|
| Free | $0/month | $0/month | For trying out |
| Pro | $100/month | $90/month | For power users |
| Business | $400/month | $360/month | For growing businesses |
| Enterprise | Custom | Custom | For large organizations |

Yearly billing is shown as its effective monthly rate. The free plan needs no payment details.

## Included quotas

| Per month, per organization | Free | Pro | Business | Enterprise |
|---|---|---|---|---|
| Posts created | 20 | 10,000 | 100,000 | Custom |
| Comments created | 50 | 5,000 | 50,000 | Custom |
| Media uploads | 200 | 100,000 | 1,000,000 | Custom |
| Social sets (teams) | 3 | Unlimited | Unlimited | Custom |
| API access | Yes | Yes | Yes | Custom |
| Analytics | No | Yes | Yes | Custom |

## Import quotas

| Import | Free | Pro | Business | Enterprise |
|---|---|---|---|---|
| Historical posts per account per month | 5 | 100 | 500 | Custom |
| Comments stored per post import | 25 | 200 | 1,000 | Custom |
| Reviews/recommendations per account per month | 5 | 200 | 200 | Custom |

## DMs and automations (beta)

| Per month, per connected social account | Free | Pro | Business | Enterprise |
|---|---|---|---|---|
| DMs sent | Not included | 200 | 1,000 | Custom |
| Automation runs | Not included | 200 | 1,000 | Custom |

Instagram DMs, Facebook Messenger, comment-to-DM private replies, and automations are in beta. They are
included on the Pro and Business plans and turned on per organization while the beta runs. Conversations,
messages, and automation run history are kept for 30 days.

Hard per-request caps, identical on every plan and not raisable: 100 posts per
post-history import call, 250 entries per review import call.

## What is never capped or metered

- **Connected social accounts** - no limit and no per-account fee on any paid plan. This is the core
  difference from tools that bill per connected account: onboarding a customer with 40 Instagram profiles
  or 200 Google Business locations changes your bill by nothing.
- **Teams (social sets)** - unlimited on every paid plan, which is what makes accounts unlimited. The free
  plan is the only tier with a cap: 3 social sets.

## Resource limits (identical on every plan)

| Resource | Scope | Limit |
|---|---|---|
| API keys | per organization | 50 |
| Webhooks | per organization | 5 |
| Bots | per team | 50 |

## Request rate limits

Three windows run at once; a request must pass all three. Returns `429` when exceeded.

| Window | Max requests | Purpose |
|---|---|---|
| 1 second | 100 | Absorbs concurrency spikes |
| 10 seconds | 500 | Blocks aggressive polling |
| 1 minute | 2,000 | Effective sustained ceiling |

Bucket scope depends on how you authenticate, and the difference matters when sizing a client:

- Requests with a verified `x-api-key` are bucketed **per endpoint**, so heavy traffic on one route does
  not drain another.
- Bearer tokens and the unauthenticated IP fallback share **one whole-app bucket** per credential.

Any window can be raised per organization on an Enterprise plan. Full detail:
[https://info.bundle.social/api-reference/rate-limits](https://info.bundle.social/api-reference/rate-limits).

## Daily publishing caps per network

These are flood-protection caps applied per connected social account per UTC day, on top of the monthly
quota. They exist because the networks themselves throttle or ban accounts that publish too often.

| Network | Free | Pro | Business |
|---|---|---|---|
| TikTok | 5 | 10 | 15 |
| YouTube | 10 | 10 | 15 |
| Instagram | 10 | 50 | 100 |
| Facebook | 10 | 50 | 100 |
| X (Twitter) | 5 | 15 | 15 |
| Threads | 10 | 200 | 250 |
| LinkedIn | 10 | 18 | 24 |
| Pinterest | 10 | 24 | 36 |
| Reddit | 10 | 24 | 36 |
| Mastodon | 10 | 50 | 100 |
| Discord | 10 | 100 | 200 |
| Slack | 10 | 100 | 200 |
| Bluesky | 10 | 50 | 100 |
| Google Business Profile | 10 | 20 | 40 |
| Snapchat | 5 | 20 | 40 |

## Daily commenting caps per network

| Network | Free | Pro | Business |
|---|---|---|---|
| TikTok | 3 | 10 | 15 |
| YouTube | 3 | 10 | 15 |
| Instagram | 3 | 50 | 100 |
| Facebook | 3 | 50 | 100 |
| X (Twitter) | 3 | 15 | 15 |
| Threads | 3 | 200 | 250 |
| LinkedIn | 3 | 18 | 24 |
| Pinterest | 3 | 24 | 36 |
| Reddit | 3 | 24 | 36 |
| Mastodon | 3 | 50 | 100 |
| Discord | 3 | 100 | 200 |
| Slack | 3 | 100 | 200 |
| Bluesky | 3 | 50 | 100 |
| Google Business Profile | 3 | 20 | 40 |
| Snapchat | 3 | 24 | 36 |

## Comment length caps per network

Applies to both standalone comments and a post's `firstComment`.

| Network | Max characters |
|---|---|
| TikTok | 1,200 |
| YouTube | 10,000 |
| Instagram | 2,200 |
| Facebook | 8,000 |
| X (Twitter) | 25,000 |
| Threads | 500 |
| LinkedIn | 1,250 |
| Reddit | 10,000 |
| Mastodon | 500 |
| Discord | 2,000 |
| Slack | 30,000 |
| Bluesky | 300 |

Networks absent from this table do not support comments through bundle.social.

## X (Twitter) pass-through pricing

X charges for its API usage, so the X features listed below are billed per use from a prepaid credit
balance rather than included in the plan quota. Anything not on the table is free. These are X's charges passed through at cost, not a bundle.social margin.
Writes are billed per request; reads are billed per resource X returns.

| Action | Cost per publish |
|---|---|
| X post write | $0.015 |
| X post write with link | $0.200 |

| Action | Cost per resource returned |
|---|---|
| X post read | $0.005 |
| X account read | $0.010 |

| Action | Cost per request |
|---|---|
| X content update | $0.005 |
| X delete | $0.010 |
| X repost | $0.015 |

Notes on X reads:

- X analytics are manual only: nothing is refreshed on a schedule, so an X read is charged only when
  someone asks for one, capped at 5 refreshes per post and per account in any rolling 24 hours.
- Refreshing an account's own metrics (followers, following, post count) is free: X does not meter
  that call, so the account-read price above only applies to looking up other accounts.
- X only serves detailed (organic/non-public) metrics for your own posts under 30 days old; older posts
  fall back to public metrics automatically.
- Comment import uses X search, which only reaches replies from the last 7 days.
- Deleting a tweet or reply is an X-charged action too ($0.010) and requires available credit - keep a small buffer if you rely on deletes.

Prepaid X billing goes live August 16, 2026; before that date X actions are free and never
blocked. If the balance runs out, X post analytics refreshes are refused and X posts, comments, and imports
fail with instructions to top up while every other selected network in the same post continues
publishing.

## How quotas are counted

- **Monthly quotas** count rows created in the calendar month (UTC), per organization. Forward-scheduling
  is allowed up to the month's limit, whatever the target publish date. A post's clock starts when it
  leaves `DRAFT`.
- **Daily quotas** count rows targeting one social account on one `postDate` calendar day (UTC), keyed so
  that reconnecting or duplicating an account shares the same cap.
- Quotas are enforced at creation only. Nothing is re-checked at publish time.
- A failed post can be retried manually up to 6 times.
- Media is kept for 14 days after its last use — counted from the upload, or
  from the last time a post using it finished publishing, whichever is later. Media attached to a draft or a
  scheduled post is kept until that post reaches a terminal state. Posts already live on the social networks are
  unaffected;
  only our copy of the file is removed. Soft-deleted uploads keep their files a further
  2 days.

## Enterprise

Enterprise plans are quoted per customer, with per-organization overrides for monthly quotas, per-network
daily caps, and per-account import limits. Ask about higher limits, SLAs, white-label setup, or specific
billing terms via https://bundle.social/contact.

## Source of truth

- Endpoint behaviour, request and response shapes: the [OpenAPI spec](https://api.bundle.social/swagger-json) and the [API reference](https://info.bundle.social/api-reference)
- Prices, quotas, and per-network caps: this file and [https://bundle.social/pricing](https://bundle.social/pricing) - both rendered from the constants the API enforces
- Network and post-type support: the relevant platform page and the API reference
- Uptime and incidents: the [status page](https://bundlesocial.betteruptime.com/)
- Legal commitments: the [terms](https://bundle.social/terms) and [privacy policy](https://bundle.social/privacy)

## Do not assume

- Do not invent endpoints, request fields, response fields, or enum values that are absent from the OpenAPI spec.
- Do not claim support for a network, post type, or feature unless a public page or the API reference states it.
- Ads and DM APIs are not generally available. They are waitlist-only, so do not present them as shippable capabilities today.
- Do not treat `/dashboard`, `/auth`, `/connect`, or `/api` as public documentation. They are application routes and are not indexable.
