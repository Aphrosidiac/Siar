# Build brief: Siar

## Identity
- **Product name:** Siar (working name; lock before the first platform app registration, PLAN B1)
- **Owner / brand:** FF DEV STUDIO (202603234793). Shown as "Siar by FF Dev Studio"
- **Reference owner:** third party (bundle.social, BUNDLE SP. Z O.O.). We take the structure and API
  shape; no identity, copy, imagery or mark ships
- **Look:** the FF Ops house structure (ink sidebar, "/ SECTION" heads, pills) on cream paper `#f3efe4` with ink `#0b0b0a`, light by default, Siar's own mark, **no lime green** (Fakhrul, 2026-10-12; replaces the 2026-10-11 neutral/indigo direction). Details: CLAUDE.md "Look". FF appears only as "by FF Dev Studio" in footers/legal.
- **Voice:** terse and technical, developer-first

## Reference
- **URL:** https://bundle.social (API: https://api.bundle.social/api/v1, docs: https://info.bundle.social)
- **Wanted:** the whole product: API, dashboard, hosted connect portal, SDK/CLI/MCP, site and docs
- **Access:** public surface only (OpenAPI spec, llms files, rate card, site). The dashboard is behind
  login; optionally Fakhrul signs up for the free plan so it can be mapped
- **Snapshot:** 2026-10-11 → `docs/reference/2026-10-11/`

## Mode
- **Fidelity:** translate (own identity), with the API **wire-compatible** (PLAN D1)
- **Mode:** SYSTEM + SITE, one repo; the site is built last
- **Questions:** gates are logged self-reviews; the hard stops are the human-only Track B steps and deploy

## Scope line
- **In:** everything in PLAN §4, in one build ("one shot", no MVP phases)
- **Not building:** ads APIs, Python/Go SDKs, competitor comparison pages, partner pages, third-party status vendor
- **Parity target:** feature parity with bundle.social's public API and inferred dashboard

## Technical
- **Repo:** ~/Desktop/dev/Siar, private GitHub repo to be created at deploy time
- **Stack:** FF Ops stack: pnpm monorepo, Fastify 5, Prisma 7, Postgres, pg-boss, Redis, Vue 3 + Vite, Astro, R2, ffmpeg
- **Auth:** email + password sessions (dashboard), org-scoped `x-api-key` (API)
- **Tenancy:** Organization → Team → one SocialAccount per network per Team
- **Integrations:** 15 social networks, Stripe (USD), R2, SMTP
- **Hosting:** dedicated self-hosted VPS (provider decided at deploy)
- **Domain:** siaran.my (siar.dev was unavailable; Fakhrul 2026-10-12). Subdomains `app`, `api`, `media`, `www`.

## Safety
- Free testing against mocks and private/test targets. A public post on a real account,
  real email to customers, npm publish, live payments and every deploy wait for Fakhrul's yes.
