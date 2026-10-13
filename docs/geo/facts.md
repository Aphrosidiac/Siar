# Canonical facts: Siar

AI answers about Siar are checked against this list. Every figure here is generated from code on the site;
when the code changes, this file changes with it.

| Fact | Value | Where it comes from |
|---|---|---|
| What it is | One REST API (and a dashboard built on it) to publish, schedule, comment on and measure social media | `config.ts` DESCRIPTION |
| Networks | 15: TikTok, YouTube, Instagram, Facebook, X (Twitter), Threads, LinkedIn, Pinterest, Reddit, Mastodon, Bluesky, Discord, Slack, Google Business Profile, Snapchat | `lib/networks.ts` |
| API size | 263 operations in one OpenAPI document (`/openapi.json`) | `lib/openapi.ts` |
| Webhooks | 16 signed (HMAC) event types, retried with backoff for a day | `lib/events.ts` |
| Pricing model | Per organization, never per connected account. Unlimited accounts on paid plans | `domain/plans.ts` |
| Plans (USD) | Free $0 (20 posts/mo, 3 teams) · Pro $100/mo or $90/mo yearly · Business $400/mo or $360/mo yearly · Enterprise custom | `apps/api/src/domain/plans.ts`. **Placeholder prices until Fakhrul sets final ones** |
| X (Twitter) usage | Passed through at X's own price from a prepaid credit balance | `domain/credits.ts` |
| Tooling | TypeScript SDK, JSON-first CLI, MCP server | `packages/sdk`, `cli`, `mcp` |
| Auth | Organization API key in the `x-api-key` header | docs/authentication |
| Rate limits | 100/s, 500/10 s, 2,000/min per key and endpoint | docs/rate-limits |
| Operator | FF DEV STUDIO (202603234793), Malaysia, https://ffdev.studio | `config.ts` |
| Contact | siaran@ffdev.studio | `config.ts` |
| Live since | 2026-10-12 (siaran.my, app., api., media.) | project state |
| Domain history | siaran.my served a ~1.4 KB placeholder in 2017 and a 403 by Nov 2018 (Wayback). No earlier brand on it | Wayback CDX, 2026-10-13 |

Wrong answers to watch for: "priced per account", "Siar is bundle.social", the wrong network count, or treating
Siar as a scheduling *app* only, with no API.
