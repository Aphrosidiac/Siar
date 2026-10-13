# GEO / AEO / SEO plan: siaran.my, 2026-10-13

Business: Siar, a unified social media API + dashboard (15 networks), by FF DEV STUDIO, Malaysia. Vertical: SaaS / developer tool.
Stack: Astro static → nginx (shared VPS) behind Cloudflare. Market: global English developers. Brief: `brief.md`.
Owner decisions open: Cloudflare Email Obfuscation, HSTS, Search Console + Bing verification, deploy, comparison pages.

## Baseline (`baseline.md`)
- audit.py: 79/100 (capped by highs). 0 critical, 16 high, 2 medium.
- bot_access.py: every AI and search agent gets 200 with identical HTML. No blocks.
- Rendering: 100. Static Astro, all content and head tags in the server HTML.
- AI visibility: **not measured** (no keys). Manual wave-0 sheet is ready.

The site was already in good shape (honest robots.txt, per-page canonicals, OG, an llms.txt generated from code, a
markdown pricing page, network and error pages generated from the enforcing code). The work was surgical.

## Done in this pass (deployed 2026-10-13, release 14da916; live audit 99/100)

| Tier | What | Why | Verify |
|---|---|---|---|
| P0 | `/docs/api/*` schema tree: global `sf-` prefixed styles instead of scoped ones. automation 2.09 → 1.27 MB, post 1.22 → 0.74 MB | Googlebot reads only the first 2 MB of HTML [sourced: seo-foundations] | `ls -la dist/docs/api/*/index.html`; computed styles checked in the browser |
| P1 | Removed the invented FAQPage from 14 error pages | Markup must mirror visible content (spam policy) [proven] | audit: 0 FAQ-visibility findings |
| P1 | Home SoftwareApplication offers only the Free plan; /pricing keeps every offer (all visible there) | Same rule: no price in markup that the reader can't see | audit: 0 price findings |
| P1 | One entity graph: Organization (+description, contactPoint, parent FF DEV STUDIO with legalName and `@id`), WebSite on home, SoftwareApplication `@id`, TechArticle → author/publisher/about by `@id` | Entity clarity; Google site name [sourced: structured-data §3–6] | JSON-LD in dist |
| P2 | FAQ questions are now `<h3>` inside `<summary>` (no visual change) | Engines match sub-queries to headings [sourced: content §2] | outline in dist; screenshot |
| P2 | Home: hero lead starts "Siar is one API and one dashboard…"; FAQ "How is Siar priced?"; new FAQ "Which social networks does Siar support?" listing all 15 | Answer-first, the entity named rather than "it", the most common fan-out question answered in one passage | dist/index.html |
| P2 | Docs: per-page "Updated <date>" shown on the page, the same date in `dateModified` | Dates must be visible and honest, not one global constant [proven] | dist/docs/quickstart |
| P4 | Sitemap `<lastmod>` per URL from git (`src/lib/updated.mjs`: last commit touching that page's own sources) | Bing/Google schedule recrawls on accurate lastmod | dist/sitemap-0.xml |
| P4 | Titles: About, Contact, Pricing made descriptive (`metaTitle` in Page layout, h1 unchanged) | Short titles waste the strongest on-page signal | dist |
| P4 | /platforms comparison table: `No` instead of `-` | A dash is ambiguous in an extracted table | dist |
| P4 | IndexNow key + `scripts/indexnow.mjs` (not run) | Bing (feeds ChatGPT search, Copilot) recrawls within hours instead of weeks | run once after deploy, expect 200/202 |

## Next, in order

### P0 / P1: owner (see `owner-todo.md`)
- Turn off Cloudflare Email Obfuscation for siaran.my, or let me wrap addresses in `<!--email_off-->`.
- HSTS on the siaran.my nginx server block.
- Verify siaran.my in Google Search Console and Bing Webmaster Tools; submit the sitemap; turn on the BWT AI Performance report.

### P3: coverage gaps (agent, after owner sign-off)
The fan-out for "best social media API" and "<competitor> alternatives" is answered by comparison pages, and Siar has none.
- `/compare/ayrshare` and similar: a sourced, dated feature/pricing table with methodology, honest about where the
  competitor wins. Every competitor fact links to the competitor's own pricing/docs page. **Blocked on:** final Siar
  prices (placeholders today) and the parked bundle.social naming decision.
- A "how much does a social media API cost" explainer: per-account vs per-organization pricing, X pass-through costs.
  Uses X's published price list and Siar's own plans.
- Per-network "How to post to <network> via API" sections exist on the network pages. Check they open with a 40–60
  word answer once wave-0 fan-out queries are in.

### P4: polish (agent, low)
- Heading skips (h1 → h3) on /platforms, /pricing and `/docs/api/*`: card grids sit directly under the hero.
- BreadcrumbList on /about, /contact, /changelog (top-level pages, low value).
- `/docs/api/automation` is still 1.27 MB: render deep nested schemas lazily, or cap depth with a link to `/openapi.json`.

### P5: agent readiness
Already strong: `/llms.txt` (generated), `/openapi.json`, `/pricing.md`, MCP server, CLI. Optional: markdown
negotiation (`Accept: text/markdown`) for the docs.

### P6: off-site (`offsite-plan.md`)

### P7: measurement
Wave 0 by hand (`visibility/manual-2026-10-13/manual.csv`), then every 4 weeks on the frozen `prompts_v1.csv`. Once
API keys exist: `ai_visibility.py --runs 3`. Treatment = home, pricing, network pages; control = error pages.
Expected lag: Bing/Perplexity days to weeks, Google AI surfaces 2–8 weeks, model memory months.

## Deliberately NOT doing
- llms-full.txt or more llms.txt work as a lever: no engine has said it uses them [myth as a ranking lever]. The existing one stays (cheap, accurate).
- FAQ schema for rich results: Google limits them to gov/health sites. FAQPage stays only where the Q&A is visible.
- AggregateRating / Review schema: there are no real reviews yet. Never invent them.
- Rewriting the display headlines ("Write it once. Siar it everywhere.") as questions: they are the brand voice.
  The FAQ and answer-first lead carry the extractable answers.
- A BM version of the site: the buyers search in English. Revisit if Malaysian SME demand shows up in GSC.
- Changing robots.txt for training crawlers: currently allowed, which is the owner's call.

## Intervention log
| Date | Change | Commit |
|---|---|---|
| 2026-10-13 | Plumbing: schema graph, error FAQ removal, home offer, sitemap lastmod, docs dates, page weight, titles, IndexNow | see git log `geo:` |
| 2026-10-13 | Content: home lead + 2 FAQ edits, FAQ question headings | see git log `geo:` |
| 2026-10-13 | Deployed 14da916; IndexNow 202 for 87 URLs | deploy/deploy-shared.sh |
