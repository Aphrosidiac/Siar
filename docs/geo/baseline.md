# Baseline: siaran.my, 2026-10-13

Each line says how it is known: **measured** (tool, date), **sourced** (skill research) or **inferred**.

## Scores (measured: audit.py, 60 of 87 sitemap URLs, live site)

| Area | Before | After (local build, same 59 URLs) |
|---|---|---|
| AI crawler access | 100 | 100 |
| Rendering (raw HTML) | 100 | 100 |
| Indexability & canonicals | 92 | n/a on localhost (canonicals point at siaran.my) |
| Structured data & entity | 90 | lows only |
| Content extractability | 99 | lows only |
| **Findings** | 0 critical · 16 high · 2 medium | 0 high · 0 medium apart from localhost artefacts (plain http, live sitemap host) |

Full report: `audit/audit.md`. Re-run on the live site after deploy for the real "after" score.

## Access matrix (measured: bot_access.py on /, /pricing, /docs)

All 14 agents (Googlebot ×2, Bingbot, OAI-SearchBot, ChatGPT-User, GPTBot, Claude-SearchBot, Claude-User, ClaudeBot,
PerplexityBot, Perplexity-User, Applebot, meta-webindexer, mobile browser) get 200 with byte-identical HTML. No
Cloudflare challenge or block. robots.txt: `Allow: /` for everyone.

## What was wrong (measured)

| Severity | Finding | Pages |
|---|---|---|
| high | FAQPage JSON-LD on error pages asked questions ("Bluesky error X: what does it mean?") that appear nowhere on the page | 14 |
| high | Home SoftwareApplication offered Pro $100 and Business $400; the home page shows only $0 and the yearly $90 | 1 |
| high | `/docs/api/automation` was 2.04 MB of HTML, past Googlebot's 2 MB read limit (39k scoped-style attributes from the nested schema tree) | 1 |
| medium | Sitemap had no `<lastmod>` | all |
| medium | "Letter-split text" on /platforms: a false positive, really a run of `-` cells in the comparison table (still ambiguous to an extractor) | 1 |
| low | TechArticle `dateModified` was one global constant for every doc page, and no date was shown on the page | 38 docs |
| low | No WebSite entity; Organization had no description or contactPoint; entities not linked by `@id` | all |
| low | FAQ questions were plain `<summary>` text, so no page had question-shaped headings | ~30 |
| low | Short titles: About, Contact, Pricing | 3 |
| low | Contact email hidden by Cloudflare Email Obfuscation (live AI fetchers see `[email protected]`) | all |
| low | No HSTS header | all |

## Off-site presence (measured: presence.py)

- Common Crawl: 0 captures in the last 3 indexes (expected: the site went live 2026-10-12).
- Wayback: first capture 2017-04-20, a ~1.4 KB placeholder page from a previous owner, returning 403 by 2018-11. No earlier brand on the domain.
- No third-party mentions checked yet (no portfolio, press or directory pages exist).

## AI visibility: **not measured**

No OpenAI / Gemini / Perplexity / SerpApi keys in this environment, and logged-out engine sessions were not run, so
there is no visibility rate yet. Wave 0 is ready to collect by hand: `visibility/manual-2026-10-13/manual.csv`
(50 prompts × ChatGPT, Perplexity, Gemini, AI Mode), scored with `ai_visibility.py --ingest-manual`. Inferred
expectation: close to 0% unbranded mention, since the site is 1 day old and not yet in any crawl.

## Not measured here

Core Web Vitals field data (no CrUX history yet), GSC / Bing Webmaster data (not verified, or no access), server logs
for AI-bot hits (on the VPS, not pulled), and the engines' own fan-out queries.
