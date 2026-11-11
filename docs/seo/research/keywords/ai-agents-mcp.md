Verified 2026-11-12: 17 corrections

> Adversarial re-check, 2026-11-12. Re-checked against primary sources: every Siar fact (`packages/mcp/src/server.ts`
> 19 tools + `StdioServerTransport`; npm 404 for `@siar/sdk|cli|mcp`; no MCP OAuth/DCR route in `apps/api/src`; the only
> "Zapier" string is `apps/api/prisma/seed.ts` line 258; sitemap 89 URLs; `docs/approvals/README.md`; `siar-truth.md`);
> the official MCP registry API (all 15 listed namespaces confirmed, none for the "not found" vendors); PulseMCP, both
> Glama pages, mcp.so, mcpmarket, mcpservers.org, both awesome lists; the Claude connector directory; every n8n and
> Zapier status code; Buffer, Ayrshare, Postiz, Outstand, Metricool, Hootsuite, Blotato and Zernio pages; OpenAI's Agents
> SDK and ChatGPT connect docs; the page counts from Upload-Post, Blotato, Zernio and Postiz sitemaps.
> **Not re-checked:** "who ranks" (the B and W columns) and autocomplete (AC). The shared WebSearch budget was used up
> before this pass's first search, so the 10-query SERP sample could not run, and querying search engines or the
> autocomplete endpoint from a script would work around that limit. Every "Top 5 now" entry is therefore
> **unverified** in this pass; AC counts stand as the original author's measurement, not re-measured.
> Corrections are marked "(corrected 2026-11-12)".

# Keyword sweep: AI agents, MCP and no-code automation terms

Checked 2026-11-12. This sweep extends section J ("AI agents and MCP") and rows 72–73 (n8n, Zapier) of
`head-unified.md`. It does not repeat them; where a row overlaps, it cites that sweep's SERP data. Siar wording follows
`docs/seo/research/siar-truth.md`. Competitor facts come from the teardowns in `docs/seo/research/competitors/`
(each one checked on the vendor's own pages 2026-11-12, URLs in those files) or from pages fetched for this sweep.

## Method, labels and limits

There is no keyword-volume tool. Every demand grade is **inferred** from the evidence named in the row.

| Code | What it is | Label |
|---|---|---|
| **AC n** | Google autocomplete (`suggestqueries.google.com`, `client=firefox`, `hl=en`, `gl=us`), fetched 2026-11-12 for 205 seeds. n = completions returned (max 10). "own" = the seed comes back as its own completion, which means it is a real query. 0 = no completions, little or no volume. Some completions are noise (for example "facebook mcpherson ks"); the row says so | measured |
| **B** | Brave Search, organic results in order, fetched 2026-11-12. **Only 3 queries** (rows 1–3) | measured by the original author; **unverified** in the re-check (could not be re-run) |
| **W** | WebSearch results recorded in `head-unified.md` earlier today. Order indicative | measured earlier today; **unverified** in the re-check |
| **T** | Pages that target the term, found in competitor sitemaps (`competitors/*.md`). This is **targeting, not ranking** | measured |
| **Dir** | MCP directory and integration-marketplace pages, fetched directly (section 2) | measured |

**Limit, stated plainly:** the shared WebSearch budget for this run was used up before this sweep's first search, so
the tool returned no results. I also stopped a scripted Brave collection after it had saved 3 SERPs, because querying
search engines from a script is a workaround of that limit. So most rows say "SERP not checked". Where a SERP is
missing, the row gives **T** (who targets it) instead, and the winnability grade leans on that. To fill the "top 5"
column properly, rerun the "SERP not checked" rows when search budget is available (about 60 queries).

**Winnability scale** (same as `head-unified.md`, inferred): *weeks* = an exact-match page can reach the Bing/DDG top 10
within weeks of being indexed (2026 domains such as postwire.io and social-api.ai did this, measured in that sweep);
*months* = 2–6 months, needs internal links and a few off-site mentions or directory listings; *long-term* = 6–12+
months, needs authority Siar does not have; *unlikely* = the intent does not match what Siar can truthfully offer
today, or a brand owner/platform always wins.

**Page types:** landing = commercial product page · H2 = a section on an existing page, not a new URL · guide =
how-to with working code · compare = sourced, dated comparison page · FAQ = one question and answer on an existing
page · offsite = directory listing, template gallery or repo, not a siaran.my page · skip = do not target.

**Siar facts that decide most rows** [code + live, see `siar-truth.md`]:

- `@siar/mcp` exists in `packages/mcp`: 19 tools (teams, accounts, connect URL, upload, create/schedule/list/get/retry/
  delete posts, comments and replies, post and account analytics, usage, X credit balance, `quote_x_cost`, and a
  generic `call_operation`). It is a **local stdio server only** (`StdioServerTransport` in `packages/mcp/src/server.ts`)
  and returns **404 on npm** (re-checked 2026-11-12, as are `@siar/sdk` and `@siar/cli`). No install command may be
  printed until it is published.
- There is **no hosted (remote) MCP endpoint and no OAuth server for MCP clients** (no authorization or
  dynamic-client-registration route in `apps/api/src`) [measured: code search]. Claude connectors, ChatGPT connectors
  and "MCP server URL" searches all assume a remote URL.
- There is **no n8n node, Make app or Zapier app** (the only "Zapier" string in the repo is an API-key name in
  `apps/api/prisma/seed.ts`) [measured].
- Publishing is live for Facebook, Instagram, Threads, X, LinkedIn **member profiles**, Bluesky, Mastodon, Discord and
  Slack. TikTok (audit rejected, sandbox), YouTube (uploads locked private), Pinterest (trial: cannot create Pins),
  LinkedIn company pages (access denied), Reddit, Snapchat and Google Business are **not** claimable
  [`docs/approvals/README.md`, status 2026-11-12]. Rows for those networks are graded *unlikely* for that reason.

## 1. Keyword table

Siar page = an existing URL from `https://siaran.my/sitemap-0.xml` (89 URLs, fetched 2026-11-12) or **NEW** `/slug`.
`/guides/*` and `/compare/*` do not exist yet; `head-unified.md` already proposed those folders.

### A. Generic "social media MCP" terms

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 1 | social media mcp server | Commercial/nav | **Med, rising** | AC 3 (own + "what is mcp server"); parent "social media mcp" AC 10 | B: mcpmarket.com/categories/social-media-management, github.com/TensorBlock/awesome-mcp-servers, outstand.so/mcp, brightdata.com/ai/mcp-server/social-media, sociality.io/mcp. W (head sweep): planable.io/blog, lobehub.com, mcpservers.org, speakeasy.com, glama.ai | months, and only after npm publish. 3 of the B top 5 are directories or lists, so listings move faster than a page | landing + offsite listings | **NEW** `/social-media-mcp-server` (blocked: npm) |
| 2 | social media mcp | Commercial/nav | Med, rising | AC 10 (server, for claude, github, buffer…, later…, management, scraping, scheduler) | B: mcpmarket.com, mcpservers.org/topics/social-media-mcp, sociality.io/mcp, TensorBlock list, opentweet.io/blog | months | landing | **NEW** `/social-media-mcp-server` |
| 3 | best mcp server for social media / best mcp for social media | Commercial (list) | Low–med | AC: both under "mcp for social media" (AC 8) | B: blotato.com/blog, socialync.io/blog, opentweet.io/blog, sociality.io/blog, eden.so/blog (glama.ai/mcp/best/social-media is #6) | long-term for an own list (every top-5 list is by a vendor that ranks itself); months to be **included** in those lists | offsite (ask list owners); skip own listicle | — |
| 4 | mcp for social media / mcp server for social media | Commercial | Low–med | AC 8 (own; "claude mcp for social media", "best mcp server for social media content") | SERP not checked | months | landing | **NEW** `/social-media-mcp-server` |
| 5 | social media mcp for claude / claude mcp for social media | Commercial | Low–med | AC (2nd completion of "social media mcp"; "claude mcp social media" AC 1) | SERP not checked. T: postiz.com/claude, outstand.so/claude, zernio.com/claude, blotato.com/claude | months for an MCP how-to; the "connector" slice is unlikely (no remote MCP) | H2 | **NEW** `/social-media-mcp-server` (H2 "Use it in Claude") |
| 6 | social media scheduler mcp / mcp social media scheduler | Commercial | Low | AC 3 (own) / AC 5 (not own) | W (head sweep): lobehub.com, glama.ai tool pages | weeks–months | H2 | **NEW** `/social-media-mcp-server` |
| 7 | social media management mcp | Commercial | Low | AC 3 (own) | SERP not checked | months | H2 | **NEW** `/social-media-mcp-server` |
| 8 | mcp server for social media posting / mcp social media posting | Commercial | Low | AC 0 for both | SERP not checked | weeks (little competition expected) | H2 + title wording | **NEW** `/social-media-mcp-server` |
| 9 | social media mcp github | Navigational (repos) | Low | AC 1 (own only) | SERP not checked | unlikely while `packages/mcp` has no public repo | offsite (public repo for the MCP package, if Fakhrul wants one) | — |
| 10 | remote mcp server social media | Commercial | Low | AC 0 | SERP not checked | unlikely: Siar's MCP is stdio only | skip | — |
| 11 | agentic social media scheduler / agentic social media manager | Commercial | Low | AC (1st and 2nd completions of "agentic social media"; rest is "agency social media" noise) | SERP not checked. T: postiz.com ("the agentic social media scheduling platform", meta description) | months | H2 | `/use-cases/social-media-api-for-ai-agents` |
| 12 | social media api for ai agents | Commercial | Med, rising | AC 6 (own; "the social media and messaging api for developers and ai agents" reads like a vendor tagline, but which vendor was not identified: unverified, corrected 2026-11-12) | W (head row 53): blotato.com/social-media-api, ayrshare.com/use-cases/ai-startups, ayrshare.com/index.md, ayrshare.com/ai-agent.md, postpeer.dev | months | use-case | `/use-cases/social-media-api-for-ai-agents` (exists) |
| 13 | social media api for llm | Commercial | Low | AC 0 | SERP not checked | weeks | H2 | `/use-cases/social-media-api-for-ai-agents` |

### B. Per-network MCP terms

Autocomplete is stronger here than for the generic term: most networks return 10 completions, and the modifiers are
the same each time: "claude", "url", "connector", "github", "free", "official", "chatgpt" [measured]. That points to
two intents: a remote URL to paste into Claude or ChatGPT, and a GitHub repo to run locally [inferred].

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 14 | instagram mcp / instagram mcp server / mcp server instagram | Commercial/nav | **Med–high** | AC 10 / AC 10 / AC 6, all own: claude, github, server url, free, connector, "ig mcp server", "instagram api mcp server", "instagram post mcp server", "instagram dm mcp server" | SERP not checked. T: upload-post.com/mcp/instagram, outstand.so/mcp/instagram, zernio.com/instagram-mcp, blotato.com/mcp/instagram. Dir: drashrafsaiyed-cyber/instagram-mcp (punkpeye list) | months, after npm publish. Angle: publishing through Meta's approved API, not a scraper (Outstand already contrasts itself with scrapers on all 9 of its `/mcp/<network>` pages, e.g. /mcp/linkedin: "the main practical difference from the scraper-based servers you will find on GitHub" [sourced: https://www.outstand.so/mcp/linkedin, checked 2026-11-12]; the earlier quoted phrase "compares to scraper-based" is not on the pages, corrected 2026-11-12) | H2 now, landing later | `/instagram-api` (H2 "Instagram MCP"); **NEW** `/mcp/instagram` after npm |
| 15 | instagram mcp server url / instagram mcp url / instagram mcp link | Navigational (remote URL) | Low–med | AC (3 separate completions) | SERP not checked | unlikely: Siar has no remote MCP URL | skip | — |
| 16 | instagram mcp claude / claude instagram connector / instagram mcp connector for claude / does claude have instagram connector | Nav/commercial | Med | AC 10 for "claude instagram" (agent skill, connector, skill, mcp, github, carousel, reels); "claude instagram connector" AC 8 | SERP not checked | unlikely for "connector" (needs remote MCP + OAuth + directory listing); months for "skill" | H2 | `/instagram-api` (H2) |
| 17 | instagram post mcp server / mcp instagram post | Commercial | Low | AC (in "instagram mcp server" list; "mcp instagram post" AC 2) | SERP not checked | weeks–months | H2 | `/instagram-api` |
| 18 | instagram dm mcp server / ai agent instagram dm | Commercial | Low–med | AC (in "instagram mcp server"; "ai agent instagram dm" is the 1st completion of "ai agent instagram") | SERP not checked | months. Meta approved Siar's IG messaging permissions 2026-10-27, but in Siar DMs are a **beta switch per organization, off by default** (FB + IG only, paid plans) [code: `messaging-shared.ts`, `siar-truth.md`; corrected 2026-11-12], and the 19 MCP tools have no DM tool; DMs are reachable only through `call_operation` [code] | H2 | `/use-cases/social-media-comments-api` (H2 "DMs from an agent") |
| 19 | linkedin mcp / linkedin mcp server | Commercial/nav | **Med–high** | AC 10 / AC 10 (server, for claude, connector, url, official, github, chatgpt, reddit) | SERP not checked. Dir: Glama's #1 social MCP is stickerdaniel's LinkedIn MCP (local, signed-in browser session) and #10 is another LinkedIn one. T: zernio.com/linkedin-mcp, outstand.so/mcp/linkedin, upload-post.com/mcp/linkedin | months, after npm. Siar can only claim member profiles, not company pages | H2 now, landing later | `/linkedin-api` (H2); **NEW** `/mcp/linkedin` after npm |
| 20 | linkedin mcp server official / facebook official mcp server | Navigational (platform's own) | Low–med | AC (both) | SERP not checked | unlikely: the searcher wants the platform's own server (whether one exists is unverified) | skip | — |
| 21 | claude linkedin mcp / claude linkedin connector / linkedin mcp for claude | Nav/commercial | Med | AC 10 for "claude linkedin" and for "claude linkedin mcp" (connector, server, code, cowork, "does claude have linkedin mcp", "connect claude to linkedin mcp") | SERP not checked | months for an MCP how-to after npm; unlikely for "connector" | guide | **NEW** `/guides/post-to-linkedin-from-claude` (blocked: npm) |
| 22 | mcp server linkedin post / mcp linkedin post | Commercial | Low | AC 5 for "mcp linkedin post" ("mcp server linkedin post", "mcp market linkedin post writer") | SERP not checked | weeks–months | H2 | `/linkedin-api` |
| 23 | facebook mcp / facebook mcp server | Mixed (ads, marketplace, pages) | Med | AC 10 / AC 10; most completions are ads, marketplace, messenger | SERP not checked. Dir: Glama #9, #14, #18 are Facebook Ads MCPs, #19 HagaiHen/facebook-mcp-server | months for "facebook page mcp"; the head term is split towards ads | H2 | `/facebook-api` |
| 24 | twitter mcp / x mcp server / x twitter mcp server | Mixed (scraping vs posting) | Med–high | AC 10 / AC 10 (github, free, claude, "x api mcp server") | SERP not checked. Dir: Glama #3 Xquik X scraper (hosted), #11 EnesCinr Twitter MCP, #15 6551Team, #17 XActions; 7 X/Twitter entries in punkpeye's Social Media section | months. Angle: the agent can quote X's cost before posting (`quote_x_cost`) [code]; that no rival states this is **inferred** (not checked across every rival; corrected 2026-11-12) | H2 | `/x-api` (H2 "X MCP") |
| 25 | claude twitter mcp / claude x post / claude twitter connector | Nav/commercial | Med | AC 10 for "claude twitter" (connector, skill, mcp); "claude x post" AC 10 (skills, code, cowork) | SERP not checked | months (MCP how-to); unlikely ("connector") | H2 | `/x-api` |
| 26 | threads mcp / threads mcp server / claude threads mcp | Commercial | Low–med | AC 10 for "threads mcp" (server, github, claude, "threads api mcp", "meta threads mcp"; half noise) | SERP not checked. T: outstand.so/mcp/threads, upload-post.com/mcp/threads | **weeks–months**: fewer dedicated pages than IG/LinkedIn/X [inferred from T] | H2 now, landing later | `/threads-api` (H2); **NEW** `/mcp/threads` after npm |
| 27 | bluesky mcp / bluesky mcp server | Commercial | Low | AC 10 but mostly noise; "bluesky mcp server" is the 1st completion | SERP not checked. Dir: gwbischof/bluesky-social-mcp (punkpeye). T: outstand.so/mcp/bluesky | weeks | H2 | `/bluesky-api` (H2) |
| 28 | tiktok mcp / tiktok mcp server | Commercial | Med | AC 10 / AC 6 (claude, github, connector, url, ads, chatgpt) | SERP not checked. Dir: Glama #16 Seym0n TikTok MCP. T: upload-post.com/mcp/tiktok, outstand.so/mcp/tiktok | unlikely: TikTok audit rejected 2026-10-20 | skip until TikTok approves | — |
| 29 | pinterest mcp | Commercial | Med | AC 10 (claude, server, connector, github, codex, chatgpt, url) | SERP not checked | unlikely: Siar cannot create Pins (trial access) | skip until Standard access | — |
| 30 | youtube mcp server | Mixed (mostly transcripts/data) | Med–high | AC 10 (claude, url, github, official, python, **transcript**, explained) | SERP not checked | unlikely: uploads locked private; intent leans to transcripts | skip | — |
| 31 | reddit mcp server | Informational/research | Med | AC 10 (claude, github, official, "reddit best mcp servers") | SERP not checked. Dir: 4 Reddit MCPs in Glama's top 12 | unlikely: Reddit parked; intent is research | skip | — |

### C. AI agent terms

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 32 | ai agent post to social media / ai agent to post on social media | Commercial/info | Low–med | AC 6, not own; "ai agent to post on social media" and "can ai agents post on social media" are the top completions | SERP not checked | months | use-case | `/use-cases/social-media-api-for-ai-agents` (add the phrase to H1/intro) |
| 33 | can ai agents post on social media | Informational | Low | AC (completion of rows 32 and 34) | SERP not checked | weeks | FAQ | `/use-cases/social-media-api-for-ai-agents` |
| 34 | ai agents for posting on social media / ai agents posting on social media | Commercial | Med | AC 10 for the seed (not own): "ai agents for posting on social media", "ai agents on social media", "ai agents social media reddit" | SERP not checked | months | use-case | `/use-cases/social-media-api-for-ai-agents` |
| 35 | ai agent social media posting / ai agent for social media posting | Commercial | Low–med | AC: "ai agent social media posting" under "ai agent social media"; "ai agent for social media posting" AC 5 (own) | SERP not checked | months | use-case | `/use-cases/social-media-api-for-ai-agents` |
| 36 | ai agent social media | Mixed (mostly "social network for AI agents") | Med | AC 10: platform, site, network, moltbook, website, app; "manager" and "posting" are the minority | SERP not checked | unlikely: dominant intent is a social network of agents, not posting | skip | — |
| 37 | ai social media agent / best ai social media agent / free ai social media agent | Commercial (consumer tools) | Med | AC 10 (github, langchain, manager agent, marketing agent, claude, free, best) | SERP not checked | long-term: consumer AI-scheduler market | skip | — |
| 38 | ai social media agent github / social media ai agent github / social media agent github | Navigational (repos) | Low–med | AC ("social media agent github" AC 7) | SERP not checked | unlikely as a page; possible as a public example repo | offsite | — |
| 39 | langchain social media agent | Developer | Low | AC 8 for "langchain social media" ("langchain social media agent", "langchain-ai/deep agents@social-media") | SERP not checked | months | guide (low priority; Siar has no Python SDK) | — |
| 40 | ai agent linkedin post / build ai agent to post on linkedin / ai agent to post on linkedin | Developer/commercial | Med | "ai agent linkedin" AC 10 (post is 2nd); "ai agent to post on linkedin" AC 6 own, incl. "build ai agent to post on linkedin" | SERP not checked | months | guide | **NEW** `/guides/ai-agent-linkedin-posting` (REST works today; MCP/SDK snippets wait for npm) |
| 41 | ai agent instagram post / ai agent to post on instagram | Developer/commercial | Low–med | "ai agent instagram" AC 10 (dm, post, account, github); "ai agent to post on instagram" AC 2 | SERP not checked | months | H2 | `/instagram-api` (H2 "Post from an AI agent") |
| 42 | ai agent for twitter posting / ai agent for x twitter / ai agent that posts on twitter and instagram | Developer/commercial | Low–med | "ai agent twitter" AC 10 (bot, for twitter posting, for x twitter, github, "posts on twitter and instagram") | SERP not checked | months | H2 | `/x-api` |
| 43 | ai agent tiktok / ai agent youtube | Mixed (shop, video creation) | Med | AC 10 each; completions are TikTok Shop, video generation, YouTube automation | SERP not checked | unlikely (networks not live; intent is video creation) | skip | — |
| 44 | ai agent api | Generic | High | AC 10 (api key free, call, standard, gateway) | SERP not checked | unlikely (not about social) | skip | — |

### D. Claude, ChatGPT and OpenAI terms

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 45 | claude post to linkedin / can claude post to linkedin / claude post linkedin | Informational question | Low–med | AC 4, not own; "can claude post to linkedin" is the 1st completion | SERP not checked. T: postiz.com/claude ("How to Post to Social Media from Claude"), outstand.so/claude | months. Siar can truthfully answer yes for **member profiles** via its MCP, once installable | guide | **NEW** `/guides/post-to-linkedin-from-claude` (blocked: npm) |
| 46 | claude linkedin (skill / plugin / integration / prompts) | Mixed | Med | AC 10: connector, skill, mcp, agent skill, skill github, plugin, prompts, optimization | SERP not checked | months for skill/MCP; long-term for prompts (writing intent) | guide | **NEW** `/guides/post-to-linkedin-from-claude` |
| 47 | claude social media / claude social media manager | Mixed (prompts, skills, connector) | Med | AC 10 (manager, skills, manager skills, prompts, connector, planner) | SERP not checked | long-term: mostly prompt/skill content | H2 | `/use-cases/social-media-api-for-ai-agents` |
| 48 | claude skills social media / claude skill social media post | Developer | Med | AC 10 (manager, marketing, content, github, design, post, strategy, audit) | SERP not checked. T: upload-post.com `/skills/claude-code/<network>` (21 network pages plus the `/skills/claude-code/` hub [measured: sitemap-0.xml, 2026-11-12; was "22 pages", corrected]) | months, and needs a Siar Claude Code skill (none in repo) [measured] | guide + offsite (skill repo) | **NEW** `/guides/claude-code-social-media` |
| 49 | claude code social media / claude code social media automation / claude code social media post | Developer | Med | AC 10 (manager, skill, agent, automation, "social media dashboard claude code", post) | SERP not checked. T: postiz.com/claude-code, postiz.com/claude-code/instagram, outstand.so/claude-code-social-media (all 200). zernio.com/claude-code returns 404; Zernio's page is zernio.com/claude [measured 2026-11-12, corrected] | months. The JSON-first CLI fits Claude Code, but `@siar/cli` is not on npm either | guide | **NEW** `/guides/claude-code-social-media` (blocked: npm) |
| 50 | can claude schedule instagram posts / claude schedule posts | Informational | Low | "claude schedule posts" AC 1 → "can claude schedule instagram posts" | SERP not checked | weeks | FAQ | `/instagram-api` (FAQ) |
| 51 | claude facebook / claude facebook mcp | Mixed (ads, marketplace) | Med | AC 10, mostly marketplace and ads | SERP not checked | unlikely (ads intent) | skip | — |
| 52 | claude tiktok / claude youtube | Mixed | Med | AC 10 each (skill, mcp, connector, transcript) | SERP not checked | unlikely (networks not live) | skip | — |
| 53 | claude connectors / claude connectors directory | Navigational | High | AC 10 (list, directory, vs mcp, marketplace) | SERP not checked | unlikely (Anthropic's page) | offsite (a remote MCP + OAuth is the common route, but the directory also carries 132 entries typed `local` [measured: claude.com/marketplace/connectors-plugins page data, 2026-11-12]; Anthropic's listing requirements for a local server are unverified; corrected 2026-11-12) | — |
| 54 | chatgpt post to linkedin / can chatgpt post to linkedin | Informational question | Low–med | AC 4, not own; "can chatgpt post to linkedin" 1st | SERP not checked | unlikely for now: ChatGPT needs "a public HTTPS endpoint or Secure MCP Tunnel"; the tunnel "can reach its configured stdio or HTTP MCP server", but plugin submission requires a public HTTPS endpoint [sourced: https://developers.openai.com/apps-sdk/deploy/connect-chatgpt, checked 2026-11-12; was "inferred, not sourced", corrected]. So a developer could test Siar's stdio server through the tunnel; ordinary users cannot add it | FAQ (honest: "not from ChatGPT yet; from Claude Code, Cursor or your own agent") | `/use-cases/social-media-api-for-ai-agents` |
| 55 | chatgpt linkedin connector / chatgpt instagram connector / chatgpt connectors mcp | Navigational | Low–med | "chatgpt linkedin" AC 10 (plugin, connector, integration); "chatgpt instagram connector" AC 1; "chatgpt connectors" AC 10 (mcp, vs mcp, mcp server) | SERP not checked | unlikely (no remote MCP) | skip | — |
| 56 | can chatgpt post to instagram | Informational | Low | AC 4 | SERP not checked | unlikely (same reason as 54) | skip | — |
| 57 | chatgpt developer mode mcp | Developer | Med | AC 10 (access, support, server, **local mcp**, "chatgpt mcp without developer mode") | SERP not checked | unlikely (generic, OpenAI owns it) | skip | — |
| 58 | openai agents social media / openai agents sdk social media | Developer | Low | AC 0 for "openai agents social media" | SERP not checked | **weeks** (no autocomplete, few targeting pages expected) | guide | **NEW** `/guides/openai-agents-sdk-social-media` (blocked: npm) |
| 59 | openai agents sdk mcp / openai agents sdk mcp server | Developer | Med | AC 10 (server, example, tool, client, **mcpserverstdio**, mcpserverstreamablehttp) | SERP not checked | unlikely for the head (OpenAI's docs); the guide in row 58 can rank on the long tail. The SDK runs local stdio servers via `MCPServerStdio` [sourced: https://openai.github.io/openai-agents-python/mcp/, checked 2026-11-12], so Siar's server fits without a remote endpoint | H2 in guide | **NEW** `/guides/openai-agents-sdk-social-media` |
| 60 | openai agent builder / agentkit social media | Developer | Med (head) / Low | "openai agent builder" AC 10 (replacement, deprecation, vs n8n, pricing); "agentkit social media" AC 0 | SERP not checked | unlikely (generic; completions suggest the product is being replaced) | skip | — |
| 61 | manus social media / lindy ai social media / gumloop social media | Commercial (other agent tools) | Low | "manus social media" AC 4 (manus ai social media manager); "lindy social media" AC 6 (lindy ai social media); "gumloop social media" AC 3 (noise) | SERP not checked | unlikely (brand-owned) | skip | — |

### E. n8n terms

n8n.io has **no integration page** at `/integrations/instagram/`, `/tiktok/`, `/threads/`, `/bluesky/` (all 404), while
`/linkedin/`, `/facebook-graph-api/`, `/youtube/`, `/pinterest/` and `/reddit/` exist [measured 2026-11-12]. The gap is
filled by partner nodes "verified by n8n": Upload-Post (IG and TikTok upload operations, workflow templates such as
"Schedule & auto-post videos to Instagram, LinkedIn & TikTok with Google Sheets"), Blotato, Postiz and Zernio
[sourced: https://n8n.io/integrations/upload-post/, /blotato/, /postiz/, /zernio/, checked 2026-11-12]. Siar has no
node; a guide using n8n's HTTP Request node needs only the live REST API, so this cluster is **not blocked by npm**.

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 62 | n8n social media posting | Info/commercial | Med | AC 6 (own; automation, workflow) | W (head row 72, "n8n post to social media"): growwstacks.com, skool.com, ayrshare.com/docs, getlate.dev/blog, buldrr.com | months | guide (hub) | **NEW** `/guides/n8n-social-media-posting` |
| 63 | n8n social media automation (+ template / workflow / tutorial / reddit) | Info | **Med–high** | AC 10 (template, workflow, github, template free, tutorial, reddit, "n8n ai social media automation") | SERP not checked | long-term for the head (n8n.io gallery, YouTube creators, Skool communities) [inferred]; months for "via API" long tail | guide (hub) | **NEW** `/guides/n8n-social-media-posting` |
| 64 | n8n social media automation template (free / github) | Info | Med | AC 6 for "n8n social media template" | SERP not checked | unlikely on siaran.my; the template gallery is the place | offsite (submit a Siar workflow to n8n.io/workflows) | — |
| 65 | n8n post to instagram (reels / story / image / video) / n8n upload to instagram / n8n publish to instagram | Info/how-to | **Med–high** | AC 10 (reels, upload to, publish to, "can n8n post to instagram", image, story, upload video, "use n8n to post to instagram", "n8n workflow to post on instagram"); "n8n instagram" AC 10 (automation, post, comment automation, node) | SERP not checked. T: upload-post.com `/n8n/*` (60 English URLs under `/n8n/` in sitemap-0.xml [measured 2026-11-12]; the teardown's 62 also counts a templates hub and a guide; corrected), its largest programmatic set | months | guide | **NEW** `/guides/n8n-instagram-posting` |
| 66 | can n8n post to instagram | Informational | Low–med | AC (completion of row 65) | SERP not checked | weeks | FAQ | **NEW** `/guides/n8n-instagram-posting` (first H2) |
| 67 | n8n instagram comment automation / n8n instagram chatbot | Commercial | Med | AC (in "n8n instagram") | SERP not checked | months: Siar has IG comments live and webhooks to trigger n8n; IG DMs are Meta-approved but a per-organization beta, off by default (corrected 2026-11-12) | guide (H2) | **NEW** `/guides/n8n-instagram-posting` (H2) or `/use-cases/social-media-webhooks` (H2) |
| 68 | n8n threads (post / automation / api / node) / n8n auto post threads | How-to | Med | AC 10 (automation, api, post, node, workflow, auto post threads; also Chinese-language completions) | SERP not checked | **weeks–months**: no n8n Threads integration page, fewer guides than Instagram [inferred] | guide | **NEW** `/guides/n8n-threads-posting` |
| 69 | n8n bluesky / n8n post to bluesky | How-to | Low | AC 6 (node, post to bluesky) | SERP not checked | weeks | H2 | **NEW** `/guides/n8n-social-media-posting` (H2) |
| 70 | n8n post to facebook (page / group) | How-to | Med | AC 10 (page, group, publish, upload, video, image, "can n8n post to facebook", auto post) | SERP not checked | long-term: n8n has a built-in Facebook Graph API node | H2 | **NEW** `/guides/n8n-social-media-posting` (H2) |
| 71 | n8n post to linkedin / n8n linkedin post automation template | How-to | Low–med | AC 3 (own); "n8n linkedin" AC 10 is mostly job search/scraping | SERP not checked | long-term: built-in LinkedIn node exists | H2 | **NEW** `/guides/n8n-social-media-posting` (H2) |
| 72 | n8n post to x / post media to x n8n | How-to | Low | AC 2 | SERP not checked | months | H2 | **NEW** `/guides/n8n-social-media-posting` (H2) |
| 73 | n8n post to tiktok / n8n upload to tiktok / n8n tiktok automation | How-to | Med | AC 8 / AC 10 | SERP not checked | unlikely (TikTok not live) | skip | — |
| 74 | n8n youtube upload / n8n youtube shorts automation | How-to | Med–high | AC 10 each | SERP not checked | unlikely (uploads private) | skip | — |
| 75 | n8n pinterest / n8n reddit | How-to | Med | AC 10 each | SERP not checked | unlikely (Pins blocked, Reddit parked) | skip | — |
| 76 | n8n social media api | Commercial | Low | AC 2 | SERP not checked | weeks | H2 | **NEW** `/guides/n8n-social-media-posting` |
| 77 | automated social media posting n8n / social media automation n8n (+ workflow) | Info | Med | AC (in "automate social media posting"; "social media automation n8n" AC 10) | SERP not checked | months | guide | **NEW** `/guides/n8n-social-media-posting` |
| 78 | n8n buffer (node / integration / api) | Navigational (Buffer) | Low–med | AC 10, but half is "buffer memory" (LLM memory node) noise | SERP not checked | unlikely | skip | — |
| 79 | n8n upload post node / n8n blotato / n8n postiz / ayrshare n8n | Navigational (competitor nodes) | Low | AC 4 / 6 / 4 / 1 | SERP not checked | unlikely | skip | — |
| 80 | n8n mcp / n8n mcp server | Developer (n8n as MCP) | High | AC 10 each (trigger, url, claude, cursor, node) | SERP not checked | unlikely (about n8n itself) | skip | — |

### F. Make.com terms

Make's integration pages returned a Cloudflare challenge (HTTP 403) to every fetch, so which social APIs have a Make
app is **unverified** here; the teardowns record Make modules for bundle.social, Upload-Post and Postiz from their own
pages [sourced in `competitors/*.md`].

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 81 | make.com social media automation (+ template) | Info | Low–med | "make.com social media" AC 5, not own ("make com social media automation", "…template") | SERP not checked | months | guide | **NEW** `/guides/make-social-media-posting` (HTTP module) |
| 82 | make com instagram post / carousel / reels / story | How-to | Med | "make.com instagram" AC 10 (automation, post, story, carousel, reels) | SERP not checked | months | H2 | **NEW** `/guides/make-social-media-posting` |
| 83 | make com linkedin post automation / make.com linkedin api | How-to | Med | "make.com linkedin" AC 10 (automation, post automation, post, integration, api) | SERP not checked | months | H2 | **NEW** `/guides/make-social-media-posting` |
| 84 | make com facebook post / page | How-to | Med | "make.com facebook" AC 10 (mostly ads, marketplace) | SERP not checked | months | H2 | **NEW** `/guides/make-social-media-posting` |
| 85 | make com threads post | How-to | Low | AC 4 | SERP not checked | weeks | H2 | **NEW** `/guides/make-social-media-posting` |
| 86 | make com tiktok post | How-to | Med | AC 9 | SERP not checked | unlikely (TikTok) | skip | — |
| 87 | make social media api / make mcp | Developer | Low / Med | AC 0 / AC 10 (make mcp is about Make itself) | SERP not checked | unlikely | skip | — |

### G. Zapier terms

Zapier app pages exist (HTTP 200) for Buffer, Upload-Post, Zernio, bundle.social (`/apps/bundlesocial/`), Metricool and
Hootsuite, and return 404 at `/apps/<name>/integrations` for Ayrshare, Blotato, Postiz, Outstand and Mixpost
[measured 2026-11-12; a 404 means "not at that slug", not proof of absence].

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 88 | zapier alternative / zapier alternatives | Commercial (automation platforms) | **High** | AC 10 (free, open source, reddit, lifetime deal, make, self hosted, n8n, 2026) | SERP not checked | unlikely: the searcher wants another automation platform; Siar is not one | skip | — |
| 89 | zapier alternative for social media (posting) | Commercial | Low | AC 0 | SERP not checked | months, low value | H2 | **NEW** `/guides/n8n-social-media-posting` (H2 "Without Zapier") |
| 90 | zapier social media (automation / scheduling / post) / can zapier automate social media posts | Info | Med | AC 7 (own) | SERP not checked | unlikely (zapier.com owns it) [inferred] | skip | — |
| 91 | zapier post to instagram / can zapier post to instagram | Info | Low | AC 3 | SERP not checked | unlikely | skip | — |
| 92 | zapier post to tiktok / zapier linkedin post / zapier linkedin mcp | Info | Med | "zapier tiktok" AC 10; "zapier linkedin" AC 10 (incl. "zapier linkedin mcp") | SERP not checked | unlikely | skip | — |
| 93 | zapier mcp (pricing / claude / free) | Navigational | High | AC 10 | SERP not checked | unlikely (Zapier's product) | skip | — |

### H. "Automate social media with AI" (consumer and SMB intent)

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 94 | automate social media posting with ai / how to automate social media posting with ai | Informational | Med | AC 6, not own ("how to…", "…using ai", "…free"); also the 1st completion of "automate social media posting" | SERP not checked | long-term: schedulers' blogs target it [inferred]; Siar's dashboard has no AI writer to point to | skip (or one H2) | `/use-cases/social-media-api-for-ai-agents` (H2, developer framing only) |
| 95 | automate social media posting (free / tool / github / app / platform) | Commercial | **High** | AC 10 (own) | SERP not checked | long-term | skip head | — |
| 96 | ai social media automation (tools / github) | Commercial | Med–high | AC 10 (tools, github, content, posting, agent, free, n8n workflow) | SERP not checked | long-term | skip | — |
| 97 | ai social media posting (tool / app / generator and scheduler) | Commercial | Med–high | AC 10, mostly "post generator" | SERP not checked | unlikely (generator intent) | skip | — |
| 98 | ai auto post social media / auto social media post ai agent | Commercial | Med | AC 9 ("generate & auto post ai videos to social media with veo3 and blotato" is a completion: Blotato's tutorial content reaches autocomplete) | SERP not checked | long-term | skip | — |
| 99 | automate linkedin posts with ai (free) / how to auto post on linkedin | Info | Med | AC 6 (own) | SERP not checked | long-term (head); months for the developer version (row 40) | skip head | — |
| 100 | automate instagram posts with ai / schedule instagram posts ai | Info | Low–med | AC 4 (own) | SERP not checked | long-term | skip | — |
| 101 | schedule social media posts with ai | Commercial | Med | AC 10, not own | SERP not checked | long-term | skip | — |
| 102 | ai social media manager (free / agent / app / github) | Commercial | **High** | AC 10 (own) | SERP not checked | unlikely (consumer AI tools) | skip | — |
| 103 | ai social media manager open source / social media manager ai agent open source | Commercial | Low | AC 4, not own | SERP not checked | unlikely (Siar is not open source) | skip | — |
| 104 | ai that posts on social media for you / can ai post on social media for you | Informational | Low | AC 5 (own) | SERP not checked | long-term | skip | — |

### I. Competitor MCP brand terms (navigational)

| # | Keyword | Intent | Demand (inferred) | Evidence | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|---|
| 105 | buffer mcp (claude / server / chatgpt / url / pricing / connector) | Navigational | Med | AC 10 | T: buffer.com/mcp, title "Buffer MCP Server: The Social Media MCP for AI Agents"; remote at mcp.buffer.com with OAuth [sourced in `buffer.md`] | unlikely | H2 in a compare page | **NEW** `/compare/buffer-api` (proposed in head sweep) |
| 106 | metricool mcp | Navigational | Med | AC 10 (claude, link, server, connector, url, codex, chatgpt) | T: metricool.com/metricool-mcp-claude/ [sourced in `publer-metricool.md`] | unlikely | skip | — |
| 107 | hootsuite mcp / sprout social mcp | Navigational | Low–med | AC 4 / AC 6 | T: hootsuite.com/integrations/mcp; Sprout MCP "TikTok data only", read-only [sourced in `hootsuite-sprout.md`] | unlikely; usable as a compare point (draft-only and read-only MCPs vs one that publishes) | H2 in compare | — |
| 108 | ayrshare mcp / ayrshare mcp server | Navigational | Low | AC 2 | T: ayrshare.com/ai-agent/ (hosted MCP at api.ayrshare.com/mcp) [sourced in `ayrshare.md`] | unlikely | H2 in compare | **NEW** `/compare/ayrshare` (head sweep) |
| 109 | zernio mcp / late mcp server / postiz mcp / publer mcp / outstand mcp | Navigational | Low | AC 2 / 10 (mostly noise) / 1 / 6 / 1 | T: each vendor's /mcp page | unlikely | skip | — |
| 110 | blotato mcp / blotato api / blotato alternatives (reddit / open source / api / free) | Nav + commercial | Med | "blotato" AC 10 (ai, pricing, reviews, mcp, alternatives, api, vs metricool); "blotato alternative" AC 5, not own | T: blotato.com/blotato-alternatives plus 42 `blotato-vs-*` posts [measured: blotato.com sitemap-0.xml, 2026-11-12; was "~45", corrected] [sourced in `others-dev-apis.md`] | months for "blotato api alternative": Blotato's API needs a paid plan from the first key, while Siar gives 20 free posts to try with the API [sourced in `others-dev-apis.md`, https://www.blotato.com/pricing] | compare | **NEW** `/compare/blotato` |

## 2. Which MCP directories and automation marketplaces list the competitors

All fetched directly on 2026-11-12 [measured]. "Yes" = listed under the vendor's own name or namespace.

| Directory | How checked | Listed | Not found | Siar |
|---|---|---|---|---|
| **Official MCP Registry** (registry.modelcontextprotocol.io) | `/v0/servers?search=` per vendor | Zernio `com.zernio/zernio`, Upload-Post `com.upload-post/mcp`, Outstand `so.outstand/outstand`, Blotato `com.blotato/mcp`, Postproxy `dev.postproxy/postproxy`, SocialAPI.ai `ai.social-api/socialapi`, WoopSocial `com.woopsocial/mcp`, PostEverywhere `ai.posteverywhere/mcp`, Publora `com.publora/mcp-server`, Mallary `ai.mallary/mallary`, Sociality `io.sociality/sociality-mcp`, Nuelink `com.nuelink/mcp`, Uplika `com.uplika/uplika`, PostSyncer and SocialClaw (GitHub namespaces) | Ayrshare, bundle.social, Postiz, Buffer, Mixpost, Publer, Metricool, Hootsuite (only a third-party `io.github.asklokesh/hootsuite-mcp-server`), Later | Not listed |
| **PulseMCP** (`/servers?q=social media`, 119 results, first 42 read) | search page | Zernio (official, plus a community copy), Upload Post (official), Postproxy (official), Sociality.io, PostFast, Pendpost, eClincher | the rest of the watchlist in the first 42 | Not listed |
| **Glama** "20 Best Social Media MCP Servers" (updated 2026-11-09) | glama.ai/mcp/best/social-media | none of the watchlist; the list is LinkedIn, Reddit and X servers (several scrapers), ads tools, Apify, 2 TikTok servers, a Facebook Page server (HagaiHen, #19) and mcp-openshorts (corrected 2026-11-12) | all | Not listed |
| **Glama** search "social media posting" (first 40) | glama.ai/mcp/servers?query= | PostEverywhere (official), a community Zernio server (mrgoonie), a community Postiz server (solomonneas); Postproxy appears in matching tools | Ayrshare, bundle.social, Upload-Post, Outstand, Blotato, Buffer, Mixpost, Publer, Metricool, Hootsuite | Not listed |
| **mcp.so** (search "social media", 178 results, first 50 read) | search page | none of the watchlist (PostPlanify, post bridge, Socialync, Genviral, PostNitro appear) | all | Not listed |
| **mcpmarket.com** category "Social Media Management" (1,299 servers claimed at first read; 1,300 on re-check 2026-11-12; first 20 read) | category page | none of the watchlist in the first 20 (Douyin, Xiaohongshu, LinkedIn scraper, Openpost, Reddit Buddy…) | all | Not listed |
| **mcpservers.org** topic "social media mcp" (12 shown) | topic page | PostEverywhere (tagged "official") | the rest | Not listed |
| **punkpeye/awesome-mcp-servers** (GitHub README, Social Media section) | raw README | Upload-Post, PostEverywhere, Publora (each with a Glama score badge) | Ayrshare, bundle.social, Zernio, Postiz, Outstand, Blotato, Buffer, Mixpost, Publer, Metricool, Hootsuite, Postproxy | Not listed |
| **TensorBlock/awesome-mcp-servers** social media doc (ranks #2 on Brave for row 1) | raw markdown | Blotato, Upload-Post, PostEverywhere, Publora | the rest | Not listed |
| **Smithery** | `/search`, `/servers?q=` and the registry API | not checked: pages returned 404 or no social results, API returned 500 | — | unverified |
| **LobeHub** | `/mcp?q=` | not checked: redirects to market.lobehub.com | — | unverified |
| **Claude connector directory** (https://claude.com/marketplace/connectors-plugins, "1115 connectors"; `/marketplace/connectors` itself returns 404 on re-check) | page data (1,108 entries parsed) and `/marketplace/connectors/<slug>` | **Metricool** (`metricool-social-media-management`, type remote, `ai.metricool.com/mcp`), plus Typefully, Taplio, Windsor.ai for Social Media and Canva. Postiz, Outstand and Upload-Post **claim** a Claude directory listing on their own sites [sourced in teardowns] but none appears in the page data; Buffer, Blotato, Hootsuite, Zernio, Publer also absent [measured 2026-11-12; was "Canva only… Metricool 404", corrected] | Postiz, Outstand, Upload-Post (claims unverified), Buffer, Blotato, Hootsuite, Zernio, Publer | Not listed. 132 entries are typed `local`, so a remote MCP is not strictly required to be listed; requirements unverified (corrected 2026-11-12) |
| **n8n.io integrations** | `/integrations/<slug>/` | verified partner nodes: Upload-Post, Blotato, Postiz, Zernio, LATE, Buffer | Ayrshare, bundle.social, Mixpost, Publer, Metricool, Outstand (404 at that slug) | No node |
| **Zapier apps** | `/apps/<slug>/integrations` | Buffer, Upload-Post, Zernio, bundle.social, Metricool, Hootsuite | Ayrshare, Blotato, Postiz, Outstand, Mixpost (404 at that slug) | No app |

The listing step itself is already in `docs/geo/offsite-plan.md` item 2. This table adds who is where today. Every
listing needs `@siar/mcp` on npm first, and the official registry also needs a namespace Siar controls (for a package,
`io.github.<owner>/…` or a reverse-DNS name such as `my.siaran/…` verified on the domain) [inferred from the names
listed above].

## 3. What this sweep tells us

1. **Demand sits in the per-network and per-client long tail, not in the generic term.** "instagram mcp", "linkedin
   mcp", "twitter mcp", "facebook mcp", "pinterest mcp" and "tiktok mcp" each return 10 completions, while "mcp server
   for social media posting" returns 0 and "social media mcp server" returns 3 [measured AC]. Competitors already build
   for this: Upload-Post has 22 `/mcp/<network>` pages plus an `/mcp/` hub, Outstand 9, Blotato 9, Zernio 7
   `<network>-mcp` pages (2 of them ads), and Postiz 225 agent × network pages [measured in sitemaps 2026-11-12; was
   "Upload-Post 23, Zernio 8", corrected].
2. **Most of that demand asks for a remote URL that Siar does not have.** The repeated modifiers are "url",
   "connector", "claude", "chatgpt" [measured]. Siar's MCP is local stdio only, not on npm, and there is no OAuth flow
   for MCP clients [code]. Rows 15, 16, 21, 25, 53–57 are graded *unlikely* for that reason alone. Hosted MCP endpoints
   are standard among rivals: Ayrshare, Buffer, Zernio, Upload-Post, Outstand, Postiz, Blotato, Mixpost and Duta
   [sourced in teardowns]. Whether Siar builds one is Fakhrul's product call; this sweep only shows what it gates.
3. **The generic "social media MCP" SERP is a directory SERP.** 3 of Brave's top 5 for "social media mcp server" are
   directories or awesome-lists [measured B by the original author; not re-run, unverified]. Fifteen rival publishers
   are in the official MCP registry (the namespaces in section 2; was "Ten", corrected 2026-11-12) and Siar is in none
   of the directories checked. Getting listed (after npm) is likely to move faster than the `/social-media-mcp-server`
   page alone [inferred].
4. **Many per-network MCP searchers want scraping, not publishing.** Glama's top 20 social MCPs are mostly LinkedIn, Reddit
   and X servers (several scrapers), ads tools and Apify; none is a multi-network publisher. The few that post are
   single-network (X, Reddit, a Facebook Page) [measured: https://glama.ai/mcp/best/social-media, updated 2026-11-09,
   checked 2026-11-12; was "none publishes through an approved API", which overstated it, corrected]. Siar's per-network MCP
   copy should say "publishes through the official API" (the angle Outstand already uses) and should not chase
   transcript, scraping or ads terms (rows 23, 30, 31).
5. **n8n is the one cluster that is open today.** n8n.io has no Instagram, TikTok, Threads or Bluesky integration page,
   so verified partner nodes (Upload-Post, Blotato, Postiz, Zernio, also LATE and Buffer) fill that gap [measured:
   n8n.io pages]; that they "own" the "n8n post to instagram" SERP is **inferred** (SERP not checked; corrected
   2026-11-12). Siar has
   no node, but an HTTP Request guide needs only the live API, not npm. The best targets are rows 62, 65–68: Instagram
   and Threads, where Siar is approved and n8n has no built-in node. A Siar workflow submitted to the n8n template
   gallery is the off-site version (Upload-Post credits "50+ n8n workflow templates" for its reach [sourced in
   `upload-post.md`]).
6. **Zapier and Make terms are mostly the wrong market.** "zapier alternative" is high demand but means "another
   automation platform" (n8n, Make, open source) [measured AC]. Skip it. Make's long tail (Instagram, LinkedIn post
   automation) is worth one HTTP-module guide.
7. **Claude Code, Cursor and the OpenAI Agents SDK all run local stdio servers** (OpenAI sourced; Claude Code from the
   README's `claude mcp add` command), so the developer-agent guides (rows 45, 48–49, 58–59) fit Siar's current design.
   They wait only on the npm publish.
8. **Stay inside the live networks.** Skip every TikTok, YouTube, Pinterest and Reddit variant in this cluster until
   their approvals change (rows 28–31, 43, 52, 73–75, 86).

### Pages this sweep maps to (new slugs added by this sweep in bold)

| Page | Rows | Blocked on |
|---|---|---|
| `/use-cases/social-media-api-for-ai-agents` (exists): add "AI agent post to social media" wording, FAQ rows 33 and 54 | 11–13, 32–35, 47, 54, 94 | nothing |
| H2 "<Network> MCP" on `/instagram-api`, `/linkedin-api`, `/x-api`, `/threads-api`, `/bluesky-api`, `/facebook-api` (exist) | 14, 16–19, 22–27, 41–42, 50 | install lines wait for npm; the H2 can describe the tools now |
| `/use-cases/social-media-comments-api` (exists): H2 on DMs and comments from an agent | 18 | nothing |
| **`/guides/n8n-instagram-posting`**, **`/guides/n8n-threads-posting`**, hub `/guides/n8n-social-media-posting` (head sweep) | 62–72, 76–77, 89 | nothing |
| **`/guides/make-social-media-posting`** | 81–85 | nothing |
| **`/guides/ai-agent-linkedin-posting`** | 40 | nothing for REST; npm for MCP/SDK snippets |
| `/social-media-mcp-server` (head sweep), then **`/mcp/instagram`**, **`/mcp/linkedin`**, **`/mcp/threads`** | 1–8, 14, 19, 26 | npm publish |
| **`/guides/post-to-linkedin-from-claude`**, **`/guides/claude-code-social-media`**, **`/guides/openai-agents-sdk-social-media`** | 21, 45–46, 48–49, 58–59 | npm publish |
| **`/compare/blotato`** | 110 | nothing |
| Off-site: official MCP registry, PulseMCP, Glama, mcp.so, awesome-mcp-servers PR, n8n template gallery | 1–3, 64 | npm publish (except the n8n template) |

Every new page needs Fakhrul's go before deploy.

## Sources

Fetched 2026-11-12: Google autocomplete (205 seeds); Brave Search (3 queries); https://registry.modelcontextprotocol.io/v0/servers;
https://www.pulsemcp.com/servers?q=social+media; https://glama.ai/mcp/best/social-media; https://glama.ai/mcp/servers?query=social%20media%20posting;
https://mcp.so/search?q=social+media; https://mcpmarket.com/categories/social-media-management; https://mcpservers.org/topics/social-media-mcp;
https://raw.githubusercontent.com/punkpeye/awesome-mcp-servers/main/README.md;
https://raw.githubusercontent.com/TensorBlock/awesome-mcp-servers/main/docs/social-media--content-platforms.md; https://claude.com/marketplace/connectors-plugins (the earlier `/marketplace/connectors` URL returns 404);
https://n8n.io/integrations/{upload-post,blotato,postiz,zernio,instagram,tiktok,threads,bluesky,linkedin,facebook-graph-api,youtube,pinterest,reddit}/;
https://zapier.com/apps/{vendor}/integrations; https://openai.github.io/openai-agents-python/mcp/; https://registry.npmjs.org/@siar%2F{sdk,cli,mcp}.
Competitor page facts: the teardowns in `docs/seo/research/competitors/` (vendor URLs listed in each file, checked 2026-11-12).
Added in the re-check (2026-11-12): https://developers.openai.com/apps-sdk/deploy/connect-chatgpt; https://developers.buffer.com/guides/integrations/mcp
(`https://mcp.buffer.com/mcp`); https://www.blotato.com/pricing (trial excludes "the API and MCP server"); sitemaps of upload-post.com,
blotato.com (sitemap-index.xml), zernio.com (sitemap-0.xml) and postiz.com (sitemap-0.xml); https://www.outstand.so/mcp/{9 networks}.
