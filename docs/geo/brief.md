# GEO / AEO brief: siaran.my

Inferred 2026-10-13 from the repo, the project state and the live site (no intake questions asked).

| Field | Value | Source |
|---|---|---|
| Target | https://siaran.my (Astro static site, `apps/site`) + this repo | repo |
| Business | Siar: one REST API + dashboard to publish, schedule, comment on and measure social media on 15 networks. Operated by FF DEV STUDIO (202603234793), Malaysia | `apps/site/src/config.ts` |
| Vertical | SaaS / B2B developer tool (API product) | inferred |
| Buyers | SaaS products adding social publishing, agencies, AI-agent builders, product/ops teams | home page audiences |
| Markets | Global, English. Malaysia is the home market, but the buyers are developers searching in English, so no BM version is planned now | inferred |
| Brand / aliases | Siar, siaran.my, "Siar by FF Dev Studio" | site |
| Competitors (hypothesis) | bundle.social, Ayrshare, Late (getlate.dev), Upload-Post, Postiz, Mixpost, Publer API | positioning guess, to be replaced by the wave-0 list of brands the engines actually cite |
| Stack / host | Astro 5 static build → nginx on the shared Tencent VPS, behind Cloudflare (SSL strict) | `deploy/deploy-shared.sh` |
| Measurement access | No GSC / BWT / GA4 access seen; no OpenAI / Gemini / Perplexity / SerpApi keys in env; server logs on the VPS (not pulled) | env, repo |

## Owner decisions not taken silently

- Training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended): robots.txt allows all today. Left as is.
- Cloudflare Email Obfuscation, HSTS, Search Console / Bing Webmaster verification: owner's call (`owner-todo.md`).
- Deploy: not done. The changes are committed locally only.
- The bundle.social compatibility FAQ and final plan prices stay parked (project state: undecided).
