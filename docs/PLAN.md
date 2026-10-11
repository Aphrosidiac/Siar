# Siar: build plan

> A unified social media API, built to match bundle.social's API, sold by FF DEV STUDIO (202603234793).
> One REST API publishes, schedules, comments, reads analytics and imports history across 15
> networks. Unlimited connected accounts, billed per organization. FF's own brands use it as an
> ordinary customer organization.
>
> Working name **Siar** (Malay: *broadcast*). Lock it before the first platform app is registered
> (B1 below), because the name appears on every OAuth consent screen and app-review record.
>
> Written 2026-10-11. Evidence: `docs/reference/2026-10-11/` (bundle.social OpenAPI with 194
> operations, llms.txt, llms-full.txt, pricing.md, sitemap). Claims are marked **[measured]**
> (read from their published spec or rate card), **[observed]** (seen on their site) or
> **[inferred]** (our reasoning; may be wrong).

---

## 0. How this plan is shaped

Fakhrul asked for one build with no unnecessary phases. That means:

- **One build, one finish line.** No MVP, no "v1 then v2". Every feature in §4 ships in the same
  release. The order in §8 is dependency order inside a single continuous build, not a set of
  releases.
- **Two tracks run at the same time from day one.**
  - **Track A, the build:** me, continuous, in the order in §8.
  - **Track B, the approvals:** paperwork, developer accounts and verifications that take
    calendar time. Starting it on day one, alongside the build, is what removes the delay
    that has stalled this so far. See §9.
- **Only two hard stops**, both mandatory:
  1. Track B steps that only Fakhrul can do (creating accounts, uploading IDs/SSM, paying,
     clicking Submit).
  2. Deploy. Approval to build is not approval to deploy.
- **Self-review gates instead of pauses.** The reference-clone gates (spec review, first-screen
  review) are logged in `docs/qa-log.md`. They are not check-ins with Fakhrul.

**Honest size.** Siar has 194 API operations, 15 network adapters, a dashboard, a hosted connect
portal, billing, an SDK, a CLI, an MCP server, docs and a marketing site. That is a multi-week
build. For a human team it would be months. For me it is a long series of continuous sessions,
roughly 2–3 weeks of working time. Wall-clock time is dominated by the platform reviews anyway
(2–6 weeks each), and those run in parallel with the build.

---

## 1. Decisions taken in this plan (change any of them now; they are cheap today)

| # | Decision | Why |
|---|---|---|
| D1 | **Wire-compatible with bundle.social's v1 API**: same paths under `/api/v1`, same `x-api-key` header, same field names and enums, same `{statusCode,message,issues}` error envelope, same `{items,total}` + `offset/limit` pagination. **[measured]** shapes come from their OpenAPI. | Their spec becomes our spec, so there is zero API-design time. Parity can be counted (one row per operation). Their customers can switch by changing the base URL. We reuse the API's shape, not their code or their prose. |
| D2 | **Stack = FF Ops' stack**: pnpm monorepo, Fastify 5 + Prisma 7 + Postgres + pg-boss, Vue 3 + Vite dashboard, Astro for site and docs, Redis for rate limiting and per-network throttles, ffmpeg in the worker, Cloudflare R2 for media. | Already proven at FF (FF Ops, Indahnya). Self-hosted, per Fakhrul's preference. |
| D3 | **Billing on Stripe in USD**, behind a `billing` interface like FF Ops' `platform/chip.ts`. | A global developer product priced in USD needs international cards, USD invoices and tax handling. **[inferred]** CHIP is built for MYR and local payments. CHIP stays available for MY customers later through the same interface. |
| D4 | **Pricing mirrors bundle's structure** (Free / Pro / Business / Enterprise, per organization, unlimited accounts on paid plans). The numbers live in one constants file. | Fakhrul sets the final numbers. The defaults copy bundle's **[measured]** quotas so every gate gets built and tested. |
| D5 | **Own brand "Siar", shown as "by FF Dev Studio"**, with a **neutral, general-purpose product theme**: not FF's Bone/Ink palette and **no lime green** (Fakhrul, 2026-10-11). *Revised 2026-10-12:* the FF Ops house structure on cream and ink, still no lime (CLAUDE.md "Look"). No bundle.social identity ships either: no wordmark, copy, imagery or the B mark. | Third-party reference: we take the structure and leave the identity. Siar is sold to everyone, so it should look like a common developer tool, not like FF. |
| D6 | **Hosting: a dedicated VPS** for Siar (4 vCPU / 8 GB to start), not a shared box. | ffmpeg transcoding and publish workers are bursty and must not starve FF Ops or Indahnya. Fakhrul picks the provider at deploy time. |
| D7 | **Tenancy = bundle's model exactly**: Organization → Team ("social set") → at most one SocialAccount per network per Team. API keys and quotas belong to the Organization. **[measured]** | It is the product's main selling point (unlimited teams means unlimited accounts), so it goes in the schema on day one. |

**Open (Fakhrul decides; nothing blocks until the step named):**
- ~~Final name and domain~~ Decided 2026-10-12: the name is Siar, the domain siaran.my (siar.dev was unavailable).
- Final prices. Blocks the deploy.
- VPS provider. Blocks the deploy.

---

## 2. What bundle.social is (the reference, summarised)

From `docs/reference/2026-10-11/` **[measured]** unless marked otherwise:

- **15 networks:** TikTok, YouTube, Instagram (via Facebook Login *and* Instagram Login, called
  `/instagram-direct`), Facebook, X, Threads, LinkedIn, Pinterest, Reddit, Mastodon, Discord,
  Slack, Bluesky, Google Business Profile, Snapchat.
- **Resource groups:** post, social-account, upload, comment, analytics, organization, team,
  user, webhook, api-key, post-history-import, post-csv-import, bio / bio-item / bio-analytics,
  notification, billing, credit, conversations, automations, misc (per-network extras such as
  YouTube playlists, the Google Business location editor and reviews, LinkedIn mentions, Facebook
  recommendations, Reddit flairs and the TikTok Commercial Music Library).
- **One post fans out:** `data` is keyed by network, with per-network fields (Pinterest
  `boardName`, Reddit `sr`, Discord/Slack `channelId`, TikTok privacy and interaction flags,
  YouTube `madeForKids`, and so on). There is an optional `firstComment` per network.
- **Statuses:** a post is `DRAFT | SCHEDULED | PROCESSING | POSTED | ERROR | RETRYING | REVIEW |
  DELETED`. Imports are `PENDING | FETCHING_* | COMPLETED | FAILED | RATE_LIMITED`.
- **Limits:** 3 rate-limit windows (100/s, 500/10s, 2,000/min), bucketed per endpoint per API
  key. Monthly quotas (posts, comments, uploads) are counted at creation. Per-account daily caps
  apply per network per UTC day. There are at most 6 manual retries. Media is kept for 14 days
  after last use.
- **X is pass-through billed** from a prepaid credit balance: $0.015 per post, $0.20 per post
  with a link, plus read and delete charges. When credit runs out, X fails and every other
  network still publishes.
- **Webhooks:** at most 5 per organization, 16 event types (`post.published`, `comment.*`,
  `team.*`, `social-account.*`, `credit.*`, `conversation.*`).
- **Developer surface:** a TypeScript SDK (`bundlesocial`, v2.66, generated from OpenAPI), a
  JSON-first CLI that ships a SKILL.md, an MCP server, and a hosted white-label connect portal
  (`create-portal-link`).
- **Site:** home, features, pricing, about 60 SEO landing pages (one per network, one per
  network API, one per use case), a browsable error reference per network, docs, a blog,
  comparison pages, and `llms.txt`/`pricing.md` generated from the enforced constants.
- **Not visible to us:** their dashboard, which is behind login. **[inferred]** from the API:
  calendar, composer, post list, accounts per team, analytics, comment inbox, DM inbox,
  automations builder, bio pages, imports, usage, billing, API keys, webhooks and members.
  Optional: Fakhrul signs up for their free plan in Chrome and I map the real screens
  (5 minutes of his time, an hour saved of mine).

---

## 3. Architecture

```
Siar/
  apps/api        Fastify 5. Public REST API (/api/v1, x-api-key) and dashboard API (session cookie).
                  OAuth callbacks, hosted portal backend, Stripe webhooks, webhook signing.
  apps/worker     Same codebase, worker entry. pg-boss queues: publish, poll-status, refresh-token,
                  connection-check, analytics, comment-import, history-import, csv-import,
                  media-process, webhook-deliver, retention-sweep, automations.
  apps/web        Vue 3 + Vite dashboard, plus the hosted connect portal (white-label route).
  apps/site       Astro: marketing pages, platform pages, error references, docs (API reference
                  rendered from our OpenAPI), blog, legal, llms.txt / llms-full.txt / pricing.md.
  packages/networks   One adapter per network (pure: request building, response parsing, error
                  mapping, media specs, validation). No DB access. Unit-tested on fixtures.
  packages/contract   zod schemas = the single source of the OpenAPI document, the SDK types and
                  request validation.
  packages/sdk    TypeScript SDK generated from the OpenAPI document, plus a webhook
                  constructEvent() helper.
  packages/cli    JSON-first CLI (stdout = JSON, stderr = status, exit codes), ships SKILL.md.
  packages/mcp    MCP server over the SDK (create_post, schedule_post, list_social_accounts,
                  upload_media, get_analytics, reply_comment, ...).
  mocks/          One mock server per network, built from the official docs, so every adapter
                  runs end to end without real credentials.
  deploy/         nginx, pm2, deploy.sh (FF Ops pattern).
```

**Load-bearing rules** (each enforced in code, not by convention):

1. **Tokens encrypted at rest.** AES-256-GCM with a key from env, rotatable. They are never
   logged and never returned by the API.
2. **Token refresh is single-flight per account.** A Postgres advisory lock wraps every refresh.
   X and TikTok rotate refresh tokens, so two concurrent refreshes would lose the account
   **[inferred]**, which is the classic trap.
3. **Publishing never posts twice.** A target moves to `PROCESSING` under `FOR UPDATE SKIP
   LOCKED` with an attempt id. The external id is saved the moment the network returns it. A
   crash between the network call and the save is reconciled by reading the account's recent
   posts and matching on a content hash before any retry.
4. **Quotas are atomic.** Each one is a counter row with
   `UPDATE … SET used = used + 1 WHERE used < limit RETURNING`. They are checked at creation
   only, as bundle does **[measured]**.
5. **X credits are a ledger.** Append-only `CreditLedger` in integer micro-USD, a stored
   balance, and a test asserting `SUM(ledger) == balance`. A charge is a reservation before the
   call and is settled or refunded after.
6. **Network errors pass through verbatim.** Each one is stored as `{code, message, raw}` and
   mapped to our error-reference pages.
7. **Upload-from-URL is SSRF-safe.** DNS-resolve, block private ranges, limit redirects, cap the
   size, sniff the type.
8. **Media URLs for pull-based networks** (Instagram, Threads, TikTok PULL_FROM_URL) are served
   from our own verified media domain with short-lived signed URLs.
9. **Every mutation is audited.** API-key and user actions are written to `AuditLog` by a hook,
   not by hand.

---

## 4. Full feature scope (everything ships)

Each line becomes rows in `docs/parity.json`. API operation IDs come straight from
`operations.tsv`.

### 4.1 API (194 operations, wire-compatible)
- **Organization:** get, usage (posts / comments / uploads / daily-limits / imports).
- **Team:** CRUD (free plan max 3).
- **Social account:** connect (OAuth URL or hosted portal), disconnect, set/unset/refresh channel
  (Facebook Page, LinkedIn org, Pinterest board, YouTube channel, Google Business location,
  Discord/Slack channel, subreddit), portal link, connection check, profile refresh, by-type,
  copy between teams, to-delete list, messaging enable/disable.
- **Upload:** multipart, from-URL, large init/finalize, S3 multipart (init / sign / complete /
  abort), list, get, delete, bulk delete. ffprobe validation against each network's media specs,
  transcode when needed, thumbnails, 14-day retention after last use.
- **Post:** create (fan-out, per-network data, firstComment, referenceKey), get, get by
  reference key, list, update, delete, retry (max 6), reconnect-social-account candidates and
  apply.
- **Comment:** create, get, list, update, delete, retry. Comment import: start, list, comments,
  actions (DELETE / HIDE / UNHIDE / LIKE / UNLIKE / APPROVE / REJECT).
- **Analytics:** account and post (normalized and raw), bulk post, force refresh (X manual only,
  5 refreshes per 24h).
- **Post history import** and **CSV import** (with row-level results).
- **Conversations (DMs)** and **automations** for Meta: list, messages, send, react, read,
  archive/open, private reply to a comment, flows CRUD / publish / pause / activate / test /
  executions, provider settings (persistent menu, ice breakers).
- **Misc per network:** YouTube (thumbnail, playlists, video edit/delete, categories, regions,
  comment edit/delete). LinkedIn (mention tags and builder, reshare, edit/delete post and
  comment). Google Business (media, location profile, hours, attributes, categories, service
  list, food menus, place action links, search keywords, reviews import / list / reply). Facebook
  (page search, text presets, token debug, recommendations import and reply, edit/delete post
  and comment). Instagram (user tags, locations, audio, delete comment). Reddit (post
  requirements, flairs, edit/delete). Pinterest (delete). Mastodon, Slack, Bluesky, X, Discord
  (edit/delete, X repost). TikTok (Commercial Music Library trending, delete comment).
- **Billing:** credit balance, quote a metered X action.
- **Dashboard-side groups** (in their llms.txt, not in the public spec): webhook, api-key, user
  and invitations, notification, bio / bio-item / bio-analytics.

### 4.2 Network adapters (15 + Instagram Login variant)
Each adapter implements: `connect` (OAuth or app password), `refresh`, `listChannels`,
`validate(postData, media)`, `publish`, `pollStatus` (for async networks such as IG containers,
TikTok publish status, YouTube processing and Snapchat), `edit`, `delete`, `comment`,
`importComments`, `commentAction`, `accountAnalytics`, `postAnalytics`, `importHistory`,
`checkConnection`, and `mapError`. Each one also declares its post types, media specs, text
limits, comment limits and daily caps.

### 4.3 Dashboard (apps/web)
Sign up / login / verify / reset. Organization switcher. Teams (social sets) list → team page with
the 15 network slots and a connect button each. Composer: per-network tabs, live validation
against adapter limits, previews per network, media library, first comment, schedule, and the
**TikTok UX requirements** (creator info, privacy picker with no default, interaction toggles,
commercial-content disclosure, music consent line; these are mandatory for the TikTok audit).
Calendar (month/week, drag to reschedule). Post list with per-network status and verbatim errors,
plus retry. Analytics (account and post, charts). Comment inbox. DM inbox. Automations builder.
Imports (history, CSV with a row report). Link-in-bio editor and its analytics. Usage and
quotas. Billing (plan, invoices, X credit top-up). API keys (max 50, shown once, roll).
Webhooks (max 5, events, delivery log, resend). Members and invites (roles: owner / admin /
member). Notifications. Audit log. Empty, loading and error states for every list.

### 4.4 Hosted connect portal
A white-label page a customer sends their end user to (`create-portal-link`): choose a network,
OAuth, pick a channel, return to `redirectUrl` with success or error parameters. Carries the
customer's name and logo, not ours.

### 4.5 Developer surface
OpenAPI document (served at `/swagger-json`, UI at `/swagger`), TS SDK on npm, CLI on npm
(SKILL.md included), MCP server on npm, webhook signature helper, `/.well-known/api-catalog`.

### 4.6 Site and docs (apps/site), built last
Home, features, pricing (rendered from the quota constants), 15 network pages, 15 network-API
pages, use-case pages (SaaS, agencies, AI agents, MCP, CLI, white-label, multi-tenant, OAuth,
uploads, analytics, comments, scheduling, bulk, history), an error reference per network, docs
(quickstart, guides, platform parameters, limits, webhooks, the API reference), changelog,
about, contact, brand kit, content guidelines, terms, privacy, data-deletion page,
`llms.txt` / `llms-full.txt` / `pricing.md` generated from the same constants, sitemap and
robots. Blog infrastructure ships with the first posts: our own platform-approval write-ups
(real experience, good SEO).

### 4.7 Explicitly NOT building
- Ads APIs (waitlist-only at bundle too **[measured]**).
- Python/Go SDKs (the OpenAPI is published; generate on request, as bundle does).
- Competitor comparison pages. Claims about named competitors need sourcing we don't have yet.
- Partner pages and third-party review badges (we have no reviews).
- A status-page vendor. Uptime Kuma runs on the box instead.

---

## 5. Data model (Prisma, abridged)

IDs are uuid v7 text. Times are `timestamptz` in UTC. Money is integers (USD cents for
subscriptions, micro-USD for X credits). Soft delete is a `deletedAt` column where bundle
exposes "to-delete" lists.

```
Organization   id, name, planCode, stripeCustomerId, quotaOverrides(json), trialEndsAt, deletedAt
User           id, email(unique), name, passwordHash, emailVerifiedAt
Membership     orgId, userId, role(OWNER|ADMIN|MEMBER)               @@unique(orgId,userId)
Invitation     orgId, email, role, tokenHash, expiresAt, acceptedAt
ApiKey         orgId, name, prefix, hash, lastUsedAt, revokedAt      (≤50 per org)
Team           orgId, name, avatarUrl, deletedAt                     (free plan ≤3)
SocialAccount  teamId, type(15 enum), externalId, username, displayName, avatarUrl,
               channels(json), channelId, tokenEnc, refreshEnc, expiresAt, scopes[],
               status(CONNECTED|NEEDS_RECONNECT|DISCONNECTED), messagingEnabled, deleteAfter
               @@unique(teamId,type)
PortalLink     orgId, teamId, tokenHash, branding(json), allowedTypes[], redirectUrl, expiresAt
Upload         orgId, teamId?, mime, kind(image|video|document), bytes, width, height,
               durationMs, storageKey, status, lastUsedAt, deletedAt
Post           orgId, teamId, title, referenceKey, postDate, status(8 enum), data(json),
               firstComment(json), retryCount, createdVia(API|DASHBOARD|CSV|MCP)
               @@unique(orgId,referenceKey)
PostTarget     postId, socialAccountId, type, status, attemptId, externalId, permalink,
               error(json{code,message,raw}), attempts, publishedAt      ← one per network
Comment        orgId, postTargetId?, socialAccountId, externalId, parentExternalId, text,
               status, error(json)
CommentImport / ImportedComment, PostHistoryImport / ImportedPost, CsvImport / CsvImportRow
AccountAnalytics  socialAccountId, day, metrics(json), raw(json)
PostAnalytics     postTargetId|importedPostId, capturedAt, metrics(json), raw(json)
Conversation / Message / AutomationFlow / AutomationExecution / AutomationProviderSettings
GbpReviewImport / GbpReview, FbRecommendationImport / FbRecommendation
BioPage / BioItem / BioClick
Webhook        orgId, url, secretEnc, events[], active                (≤5 per org)
WebhookDelivery webhookId, eventId, event, payload, attempt, status, responseCode,
               responseBody(trunc), nextAttemptAt
UsageCounter   orgId, period(YYYY-MM), metric, used, limit          @@unique(orgId,period,metric)
DailyCounter   accountKey, day, metric, used, limit                 @@unique(accountKey,day,metric)
CreditLedger   orgId, deltaMicroUsd, reason, action, refType, refId, createdAt  (append-only)
CreditBalance  orgId, balanceMicroUsd, lowBalanceThreshold
Subscription / Invoice   (Stripe mirror)
Notification, AuditLog
```

`accountKey` for daily caps is network + externalId, so reconnecting or duplicating an account
shares the same cap **[measured]**: "keyed so that reconnecting or duplicating an account shares
the same cap".

---

## 6. State machines

**PostTarget** (one per network):
`DRAFT → SCHEDULED → PROCESSING → POSTED`. From `PROCESSING` it can go to `REVIEW` (the network
holds the post, e.g. TikTok moderation, then `POSTED`) or to `ERROR`. `ERROR` goes to
`RETRYING` and back to `PROCESSING`, at most 6 manual retries. From `POSTED` it can go to
`DELETED` (delete call succeeded). Editing is allowed in `DRAFT` and `SCHEDULED`. After
`POSTED`, edits go through the network's edit endpoint where one exists.

**Post** status is derived from its targets: all `POSTED` → `POSTED`; any `PROCESSING` →
`PROCESSING`; any `ERROR` and none in flight → `ERROR`.

**Imports:** `PENDING → FETCHING_* → COMPLETED | COMPLETED_WITH_ERRORS | FAILED`, with
`RATE_LIMITED` resuming on a backoff.

**SocialAccount:** `CONNECTED ↔ NEEDS_RECONNECT` (refresh failed or scope revoked; the
`social-account.updated` webhook fires) `→ DISCONNECTED` (`deleteAfter` set; purged by the sweeper).

**Subscription:** Stripe's statuses mirrored **[measured]** (`trialing | active | past_due | …`).
Downgrading to Free over 3 teams locks creation but deletes nothing.

Illegal transitions are refused server-side with a 400 or 403 in the bundle envelope. They are
never a 500.

---

## 7. Permission matrix

| Action | Owner | Admin | Member | API key |
|---|---|---|---|---|
| Billing, plan, delete org | ✓ | ✗ | ✗ | ✗ |
| API keys, webhooks | ✓ | ✓ | ✗ | ✗ |
| Members, invites | ✓ | ✓ | ✗ | ✗ |
| Teams create/delete | ✓ | ✓ | ✗ | ✓ |
| Connect/disconnect accounts | ✓ | ✓ | ✓ | ✓ (via connect URL) |
| Posts, uploads, comments, DMs | ✓ | ✓ | ✓ | ✓ |
| Analytics, imports | ✓ | ✓ | ✓ | ✓ |
| X credit top-up | ✓ | ✗ | ✗ | ✗ |

Every query is scoped by `orgId` from the session or key, and a cross-org id returns 404, as
bundle does **[measured]**. The role-matrix test pass covers every cell, including the denied ones.

---

## 8. Track A: the build (one continuous run, dependency order)

Each step finishes with its tests green and a commit. There are no releases in between.

1. **Spine.** Monorepo, config, Prisma schema (§5) with migrations from the first commit, auth
   (sessions + API keys), orgs/teams/members/invites, error envelope, pagination, 3-window rate
   limiter (Redis, per endpoint per key), audit hook, zod contract → OpenAPI at `/swagger-json`.
2. **Media pipeline.** All upload routes, R2 storage, SSRF-safe fetch, ffprobe + transcode +
   thumbnails, signed media URLs on our media domain, retention sweeper.
3. **Adapter contract + mocks.** The `packages/networks` interface, one mock server per network,
   and fixtures from the official docs.
4. **All 15 adapters.** Connect / refresh / channels / validate / publish / poll / edit / delete
   first, then comments, analytics and history for each. Order: Bluesky, Mastodon, Discord,
   Slack, X, LinkedIn, Facebook, Instagram (both logins), Threads, TikTok, YouTube, Pinterest,
   Google Business, Reddit, Snapchat.
5. **Publishing engine.** Post/target state machine, scheduler, publish/poll workers, retries,
   firstComment, monthly quotas and daily caps, X credit ledger with reserve/settle, verbatim
   errors.
6. **Webhooks.** Signed delivery, retries with backoff, delivery log, resend, all 16 events.
7. **Comments, analytics, imports.** Comment import and actions, analytics jobs (X manual-only),
   post-history import, CSV import, Google Business reviews, Facebook recommendations, every
   misc endpoint.
8. **DMs and automations** (Meta).
9. **Billing.** Stripe products from the constants file, 14-day trial, plan changes, invoices,
   dunning, X credit top-ups, the quota gates wired to the plan.
10. **Dashboard**, every screen in §4.3, built on the FF Ops UI conventions (component library,
    tokens, the 1x-monitor type scale).
11. **Hosted connect portal.**
12. **SDK, CLI, MCP**, generated and wrapped from the contract and published to npm (publishing
    waits for Fakhrul's go, since it is public).
13. **Site and docs** (§4.6), including the legal pages and the data-deletion page the reviewers
    require.
14. **Verification** (§10) and the parity ledger.
15. **Deploy**, only with Fakhrul's go: push to GitHub (private repo), provision the VPS, deploy
    to the production domain. This is the moment the Track B app reviews can be submitted,
    because reviewers need a live HTTPS app.

**FF internal use works before any approval** **[inferred from platform rules]**:
- Meta apps in Development mode work for accounts that have a role on the app, so FF, Lewix and
  Ascend pages are added as testers.
- TikTok unaudited allows up to 5 users, with posts private.
- Google OAuth in "testing" allows up to 100 test users.
- Bluesky, Mastodon, Discord, Slack, X and LinkedIn personal need no review at all.

---

## 9. Track B: approvals (starts day one, in parallel)

**Rule: everything a reviewer needs is produced by Track A.** That includes the live app, the
privacy policy, terms, the data-deletion page, the demo screencasts and the reviewer test login.
I write every form answer, permission justification and screencast script. Fakhrul does only
the identity, payment and Submit steps.

### B0. Paperwork pack (day 1, mostly me)
- **Fakhrul:** SSM certificate (PDF), IC, business address, a business phone, and the
  domain purchase.
- **Me:** privacy policy, terms, data-deletion instructions page, app icon (1024px), a
  one-paragraph app description per platform, a reviewer test account (seeded org with demo
  data).

### B1. Accounts and verification that need no app (start day 1, take the longest)
| Platform | Fakhrul does | I do | Wait **[inferred]** |
|---|---|---|---|
| Meta | Create the Business Portfolio, submit **Business Verification** (SSM, address, domain email), create the app | Fill app settings, add FF pages as testers for internal use | Verification 2–14 days |
| Google | Create the Cloud project, verify the domain in Search Console | OAuth consent screen, scopes, branding | Domain verification is instant |
| LinkedIn | Create the developer app, link the FF DEV STUDIO company page, verify the page | Request **Community Management API** access (form) | Days to weeks. **Risk:** they want a registered legal entity, and an SSM enterprise may get questions |
| X | Create the developer account, buy initial credits | App settings, callback URLs | Instant |
| TikTok | Create the developer account and app, verify the domain | App config, scopes, redirect | Instant (audit comes later) |
| Pinterest | Business account + developer app | App config | Trial access instant |
| Reddit | Submit a Responsible Builder **API access request** | Write the business justification | Weeks, may be refused |
| Google Business | Submit the **GBP API access request** form | Write the request text | 1–4 weeks |
| Snapchat | Apply for **Public Profile API** partner access | Write the application | Unknown, the hardest to get |
| Discord / Slack | Create the apps | Config, scopes, bot settings | Instant |
| Bluesky / Mastodon | Nothing | Host the Bluesky OAuth client metadata; Mastodon registers per instance at runtime | None |

### B2. Reviews that need the live app (submit together, right after A15)
| Platform | Submission | Content |
|---|---|---|
| Meta App Review (Facebook, Instagram, Threads) | Advanced Access for publishing, comments and insights permissions (`pages_manage_posts`, `pages_read_engagement`, `pages_manage_engagement`, `read_insights`, `instagram_content_publish`, `instagram_manage_comments`, `instagram_manage_insights`, the `instagram_business_*` set for Instagram Login, and `threads_*`) | One screencast per permission, showing the real UI doing exactly that action. Reviewer login. |
| Meta, second submission | Messaging (`pages_messaging`, `instagram_manage_messages`) | Kept separate so DM scrutiny cannot delay posting approval |
| TikTok | Content Posting API **audit** (`video.publish`) | Screencast showing every UX requirement in the composer, plus usage estimates (these set our daily creator cap) |
| Google | OAuth verification for `youtube.upload` and related scopes, then the **YouTube API quota extension / audit** | Demo video, privacy URL, scope justification |
| LinkedIn | Community Management API, standard tier | Screencast of the org posting flow |
| Pinterest | Standard access | Demo video |

Waits are 2–6 weeks each **[inferred]**. They overlap, so the whole set lands in about 4–6 weeks
after deploy, not the 6 months it would take serially. Rejections are expected on TikTok and
Meta. Each one comes back to me, I fix the exact point, and it is resubmitted the same day.

### B3. What reviewers reject most, so we build it right first
- A screencast that doesn't match the permission, or uses the platform's own UI instead of ours.
- Missing privacy policy, data-deletion URL or app icon, or a website that doesn't describe the
  product.
- **TikTok:** a privacy dropdown with a default value, no creator nickname shown, no
  commercial-content toggle, no music-usage consent line.
- **Google:** the homepage doesn't link the privacy policy, or the domain isn't verified.
- A test login that doesn't work. The seeded reviewer org is checked the day before each
  submission.

---

## 10. Verification (before deploy)

- **Contract pass:** every one of the 194 operations is called against our API with bundle's
  request shapes, and responses are validated against their schemas (from the saved
  `swagger.json`).
- **Adapter pass:** every adapter end to end against its mock. Live publishing goes only to
  private or test targets (TikTok `SELF_ONLY`, YouTube private, test Discord/Slack channels, test
  Bluesky/Mastodon accounts, Meta test pages). **Any public post on a real account waits for
  Fakhrul's yes.**
- **Role matrix, state machine, concurrency** (two workers on one target, the double-submit
  race on the last quota slot, two simultaneous refreshes), **data shapes** (emoji, max-length
  text, 0/1/many media, huge files), **money** (credit ledger sums, Stripe test-mode invoices),
  **jobs** (each fired manually once).
- **Dashboard:** every screen at desktop and mobile (390px), every empty/one/many state, checked
  at DPR 1 for the W270 monitor.
- **Security:** API key hashing, token encryption, SSRF on upload-from-URL, webhook signatures,
  cross-org access by id (must 404).
- **Ledger:** `docs/parity.json` has one row per operation, adapter capability, dashboard screen
  and site page. `scripts/parity.py` fails any `done` row without evidence.

---

## 11. Risks, stated plainly

| Risk | Impact | Mitigation |
|---|---|---|
| Reddit or Snapchat never approve us | Those 2 of 15 networks stay "coming soon" | Adapters are built and mock-tested regardless. Each network is switched on by credentials only, the SmoothSail pattern. |
| LinkedIn rejects an SSM enterprise for Community Management | No LinkedIn **Pages** (personal still works) | Ask early (B1). Fallback is registering a Sdn Bhd later. |
| TikTok audit rejected repeatedly | TikTok posts stay private | Build every UX requirement exactly. Resubmit the same day. |
| Platform API changes mid-build | Adapter breakage | Adapters are isolated. Error references and mocks are versioned per network. |
| X link-post cost ($0.20) surprises customers | Support load | `billable-usage/quote` endpoint, a low-balance webhook, and a visible price in the composer |
| Account bans from aggressive posting | Customer harm, platform trust | Daily caps per network (bundle's values as defaults), per-network throttles in Redis |
| Size of the build | Time | Strict dependency order. Parity ledger keeps "done" honest. No scope added mid-build without a line here. |

---

## 12. Definition of done

- All 194 operations behave as specified, and every row in the parity ledger has evidence.
- All 15 adapters pass against mocks. The 7 networks that need no review, plus the Meta, TikTok
  and YouTube networks in dev/test mode, pass live against FF's own accounts.
- Dashboard, portal, SDK, CLI, MCP, docs and site are complete.
- Deployed on the production domain (with Fakhrul's go). Every Track B review is submitted.
- FF's own brands are connected and posting through Siar as an ordinary organization.
