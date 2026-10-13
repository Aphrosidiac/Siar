# Owner to-do: GEO / AEO for siaran.my

Things only Fakhrul can decide or do. Ordered by what unblocks the most.

## Decisions
- [ ] **Deploy** the 2026-10-13 GEO commits (`deploy/deploy-shared.sh`), then run `node apps/site/scripts/indexnow.mjs` once.
- [ ] **Cloudflare Email Obfuscation** (Scrape Shield) on siaran.my: turn it off, so live AI fetchers and visitors without JS see
      `siaran@ffdev.studio` instead of `[email protected]`. Alternative: I wrap each address in `<!--email_off-->` and leave the setting on.
- [ ] **HSTS** on the siaran.my nginx block: `Strict-Transport-Security: max-age=31536000; includeSubDomains`. Preload only if
      every subdomain will always be HTTPS (hard to undo).
- [ ] **Training crawlers** (GPTBot, ClaudeBot, CCBot, Google-Extended): allowed today. Keeping them allowed puts Siar into future
      model knowledge, which matters for a brand-new name; blocking them changes nothing for live search answers. Recommendation: keep.
- [ ] **Comparison pages** (`/compare/ayrshare` …): go or no-go. They need final prices and the parked bundle.social naming call.

## Access to set up
- [ ] Google Search Console: verify `siaran.my` (DNS TXT in Cloudflare), submit `sitemap-index.xml`, request indexing for /, /pricing, /platforms.
- [ ] Bing Webmaster Tools: import from GSC, submit the sitemap, turn on the **AI Performance** report (its grounding queries show
      what ChatGPT/Copilot searched when they cited you).
- [ ] Optional, for measurement: an OpenAI, Gemini or Perplexity API key in `~/Desktop/dev/Siar/.env.geo` (git-ignored) so waves
      run automatically instead of by hand.

## Wave 0 (by hand, about an hour)
- [ ] Fill `docs/geo/visibility/manual-2026-10-13/manual.csv`: logged-out ChatGPT, Perplexity, Gemini, Google AI Mode, a fresh chat
      per prompt, full answer text + cited URLs. Then:
      `python3 ~/.claude/skills/geo-aeo/scripts/ai_visibility.py --ingest-manual docs/geo/visibility/manual-2026-10-13/manual.csv`
      (or ask AP to drive it in Chrome).

## Needs a source before it can go on the site
- [ ] Final plan prices (the site and JSON-LD show the placeholders from `domain/plans.ts`).
- [ ] Any customer, usage or reliability figure ("X posts published", uptime). None exists yet; nothing is invented meanwhile.

## Off-site
See `offsite-plan.md`.
