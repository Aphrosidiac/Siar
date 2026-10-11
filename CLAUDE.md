# Siar — unified social media API (FF DEV STUDIO)

One REST API to publish, schedule, comment on and measure social media across 15 networks.
Wire-compatible with bundle.social's v1 API. Plan: `docs/PLAN.md`. Brief: `docs/brief.md`.

## Layout

```
packages/contract   OpenAPI document (built from docs/reference/<date>/swagger.json + overlay/) and
                    generated TS types. `pnpm --filter @siar/contract build` after any overlay edit.
packages/networks   One adapter per network (src/adapters/*.ts) behind src/types.ts. Pure: no DB.
                    tests/harness.ts runs adapters against an in-process mock server.
mocks/              Mock network servers (src/networks/*.ts), one per network, per the network's docs.
apps/api            Fastify 5 + Prisma 7 + Postgres + pg-boss + Redis. Port 3290.
  src/platform      config, db, crypto, auth, ratelimit, storage, media, queue, events (webhooks),
                    networks (adapter bridge), routes (OpenAPI-driven registrar), errors, mail, audit
  src/domain        plans (quotas/caps/prices), quota (atomic counters), credits (X ledger), serialize
  src/modules       handlers by operationId: define({ 'post.create': async ctx => … })
  src/engine        publisher, webhooks, maintenance jobs, worker; jobs self-register (registerJob)
  scripts/e2e.ts    end-to-end checks against a live dev API + mocks — must stay green
apps/web            Vue 3 + Vite dashboard + hosted connect portal. Port 5290.
apps/site           Astro marketing site + docs. Port 4290.
packages/sdk|cli|mcp  TypeScript SDK, JSON-first CLI, MCP server.
```

## Rules that hold the system together

- **The OpenAPI document is the contract.** Routes are mounted from it; handlers register by
  `operationId`. Request bodies/queries are validated by Ajv before a handler runs. An operation
  with no handler answers 501. Never add a public route outside the spec (raw routes are only for
  OAuth callbacks, media, provider webhooks).
- **Wire shapes come from `domain/serialize.ts`.** Field names follow the reference spec.
- **Errors:** throw `AppError` helpers from `platform/errors.ts` → `{ statusCode, message, issues? }`.
  Network failures: adapters throw `NetworkError` (code + the network's own message, verbatim).
- **Tenancy:** every query filters by `actor.organizationId`. Foreign ids are 404, never 403.
  Permission matrix: `platform/auth.ts` (`requirePermission`).
- **Quotas are atomic** (`domain/quota.ts`): consume inside the same transaction as the write.
- **X credit** is a ledger (`domain/credits.ts`): hold → capture | release. Never write balances directly.
- **Never post twice:** publishing claims a target with a conditional UPDATE (engine/publisher.ts).
- **Tokens are encrypted** (`platform/crypto.ts`); never log or return them.
- **Adapters** use the network's real URLs through `ctx.fetch`; mock mode rewrites them. Follow
  `src/adapters/mastodon.ts` (the reference adapter) for shape and style.
- Money: integer cents (subscriptions) / micro-USD (X credit). Time: UTC, timestamptz.

## Look

The house standard is FF Ops (`~/Desktop/dev/FFOps/docs/UI.md`, run it with `ff-ops-web` to compare):
its structure, components and motion, with **no lime** and Siar's own mark (Fakhrul 2026-10-12).
Tokens live in `apps/web/src/styles.css`; the site mirrors them.
- Light is the default (dark is opt-in). Cream paper `#f3efe4`, panels `#fbfaf6`, ink `#0b0b0a`.
  Where FF Ops uses lime (active marker, counts, signal button) Siar uses ink or cream.
- Shell: always-ink sidebar (`lib/nav.ts`) with a sliding active marker; top bar with the team
  switcher, ⌘K palette, "New post", bell. Pages: `PageHead` = "/ SECTION" mono eyebrow + display
  title + context line + pill actions, ruled off.
- Pill buttons (ink primary, outlined secondary), pill status chips (soft tints), pill segmented
  filters (`<Tabs variant="pill">`), underline tabs for sections. Tables: mono caps heads over an
  ink rule, soft row rules. Figures are panels with a mono label (`.stat`).
- IBM Plex Sans 400/500/600 + Plex Mono labels. Whole-pixel scale ≥11px (`scripts/check-type.sh`);
  antialiasing on Retina only (Fakhrul reads on a 1x monitor).
- Network marks are the real glyphs (`lib/glyphs.ts`), monochrome — never initials.
- FF appears only as "Siar by FF Dev Studio" in footers and legal pages.
- Marketing pages (home, product tour, pricing, networks, use cases) add `apps/site/src/styles/marketing.css`:
  display type, pill buttons, framed product shots, ink bands, `data-reveal`/`data-lines` rise-ins
  (`src/scripts/reveal.ts`). The home walkthrough is a click/auto-advance demo player, never scroll-linked
  or zooming (Fakhrul found the sticky scroll version confusing). The one extra colour is the on-air red, used only for "live". Docs keep the
  plain layer. Never name a scoped class `.in`: the reveal script adds `in` to revealed elements.
- Product screenshots in `apps/site/public/shots/` come from the real dashboard: reseed, then
  `node apps/site/scripts/shots.mjs [scene…]` (dashboard :5290 + API :3290). The `flow` scene schedules a
  real post in the demo org, so reseed again afterwards if the demo must be clean.

## Running

```
pnpm --filter @siar/mocks dev          # mock networks :3299
pnpm --filter @siar/api dev            # API :3290 (jobs in-process in dev)
pnpm --filter @siar/api e2e            # end-to-end checks
pnpm --filter @siar/networks test      # adapter tests (self-contained)
pnpm --filter @siar/web dev            # dashboard :5290 (proxies /api to :3290)
```

To run a private API instance (parallel work), give it its own database, Redis db and port:
`createdb siar_<name> && (cd apps/api && DATABASE_URL=postgresql://fakhrul@localhost:5432/siar_<name> npx prisma migrate deploy)` then
`DATABASE_URL=postgresql://fakhrul@localhost:5432/siar_<name> REDIS_URL=redis://127.0.0.1:6379/<n> PORT=<port> MOCK_NETWORKS_URL=http://127.0.0.1:<mockport> pnpm --filter @siar/api exec tsx --env-file=.env src/index.ts`
(env vars given on the command line win over .env) and mocks with `MOCK_PORT=<mockport> pnpm --filter @siar/mocks start`.

## Safety

Mock networks for development and tests. A public post on a real account, real email to customers,
npm publish, live payments and any deploy wait for Fakhrul's explicit yes.
