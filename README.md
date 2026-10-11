# Siar

Unified social media API by FF DEV STUDIO: one REST API to publish, schedule, comment and read
analytics across 15 networks, with unlimited connected accounts billed per organization.

- Plan: [docs/PLAN.md](docs/PLAN.md)
- Brief: [docs/brief.md](docs/brief.md)
- Reference evidence (bundle.social, 2026-10-11): [docs/reference/2026-10-11/](docs/reference/2026-10-11/)

Status (2026-10-12): built end to end against mock networks, NOT deployed.
- API: 259/259 operations (`pnpm --filter @siar/api exec tsx --env-file=.env scripts/coverage.ts`), e2e 38/38
- 15 network adapters with mocks: 52 tests · SDK 31 tests · CLI + MCP smoke-tested
- Dashboard (apps/web) and site + docs (apps/site, 88 pages) build clean
- Next: Fakhrul's Track B steps (docs/approvals), domain, VPS, then deploy on his go
