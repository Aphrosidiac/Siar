Verified 2026-11-12: 12 corrections

# Keyword sweep: Malaysia, Bahasa Melayu and SEA

Checked 2026-11-12. Builds on `head-unified.md` (English head and API terms, which this file does not repeat),
`competitors/my-sea-schedulers.md` (the Malaysian and SEA teardown: Duta, PostLa, Synova, MarketOS, Zoho Social, SleekFlow,
ManyChat, its section 8 autocomplete), `current-site.md` and `docs/geo/plan.md` (which parked "a BM version of the site"
until GSC shows Malaysian SME demand). Siar wording follows `siar-truth.md`.

## Method, labels and one hard limit

There is no keyword-volume tool. Every demand grade is **inferred** from the evidence named in its row.

| Code | What it is | Label |
|---|---|---|
| **AC-my** | Google autocomplete, `suggestqueries.google.com`, `client=firefox`, `hl=ms`, `gl=my`, run 2026-11-12 for 232 seeds. "AC n" = completions returned (max 10). The completions themselves are listed where they change the reading | measured |
| **AC-id** | same, `hl=id`, `gl=id` (32 seeds) | measured |
| **AC-sg** | same, `hl=en`, `gl=sg` (14 seeds) | measured |
| **Brave** | One Brave Search results page for "social media scheduler malaysia" (Malaysia country cookie), fetched 2026-11-12 | measured |
| **T** | Fact taken from the teardown `competitors/my-sea-schedulers.md` (itself measured on vendor pages, 2026-11-12) | sourced (repo) |

**What could not be measured.** The session's shared WebSearch budget (200 calls, used by the whole research team) was
exhausted before this sweep's SERP checks started, and the tool forbids working around that by scraping engines from the
shell. A DuckDuckGo request was blocked ("anomaly" page) and Brave returned HTTP 429 after one query. So **top-5 rankings are
measured for one keyword only**. Every other "Top 5" cell says "not measured" and, where useful, gives the SERP I expect,
labelled **inferred**. Running those checks is the first follow-up (list at the end).

**Two traps the autocomplete exposed (measured):**

1. `hl=ms gl=my` returns Indonesian completions alongside Malaysian ones ("cara melihat", "cek", "di hp", "gratis", "jasa",
   "jogja", "jakarta"). Any BM page competes with Indonesian content for the same strings.
2. In Indonesian, "api" means fire. "api tiktok" completes to "api tiktok mati berapa hari" (TikTok streak flame). "API media
   sosial" is not a developer query in Indonesia.

**Winnability scale (inferred), as in `head-unified.md`:** *weeks* = thin or off-topic SERP, an exact-match page can enter the
top 10 within weeks of indexing; *months* = 2–6 months with internal links and a few mentions; *long-term* = 6–12+ months and
authority Siar does not have; *unlikely* = intent Siar cannot truthfully serve, or the brand owner always wins. Siar context:
about 32 of 89 URLs indexed by Google, no backlinks, no GSC access (`current-site.md`). The whole site is English
(`apps/site/src/layouts/Base.astro`: `<html lang="en">`), so every BM page is a new build, including `lang`/`hreflang`.

**Product facts that decide many rows (`siar-truth.md`):** publishing is open for Facebook Pages, Instagram professional
accounts, Threads, X, LinkedIn profiles, Bluesky, Mastodon, Discord, Slack. TikTok is sandbox only, YouTube uploads stay
private, Pinterest cannot publish, LinkedIn company pages are denied. Siar does not post to Facebook groups or personal
profiles. DMs, comment-to-DM and auto-replies (`apps/api/src/modules/messaging-automations.ts`: triggers `COMMENT_CREATED`,
`DM_RECEIVED`; steps `SEND_PRIVATE_REPLY`, `SEND_PUBLIC_COMMENT_REPLY`, `LIKE_COMMENT`) are a **per-organization beta, FB + IG only,
paid plans, off by default**. Free is **20 free posts to try** (one-time), no DMs, no analytics.

**Page column:** existing URL from `https://siaran.my/sitemap-0.xml` (89 URLs, fetched 2026-11-12) or **NEW** `/slug`.
BM pages are proposed under `/ms/`. **HOLD** = do not publish until the named gate clears.

---

## A. "Malaysian tool" terms (English, commercial)

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 1 | social media scheduler malaysia | Commercial | **Low**. AC-my 0 (same in T §8) | **Brave (measured by the original sweep; not re-verified 2026-11-12, search budget exhausted):** getduta.com, nineten.ai, planable.io/blog, shinjiru.com.my/blog, newnormz.com.my. Below: Reddit threads, neeko.my, shinjiru.com.my, flowdigital.my, justsimple.com.my, zenweb.my | **weeks** (thin SERP: a 23-URL site, public since August 2026, is #1; the rest are agency blogs) | landing (EN), answer-first, dated, names ringgit peers honestly, never "first" | **NEW** `/malaysia` |
| 2 | social media management tools malaysia / tool malaysia / social media tool malaysia | Commercial | **Low**. AC-my 0 for all three | not measured; expected (inferred): agency service pages and roundup blogs, as in row 1 | weeks–months | H2 | **NEW** `/malaysia` |
| 3 | social media api malaysia | Commercial | **Very low**. AC-my 0; GEO prompt p046 | not measured | weeks | H2 | **NEW** `/malaysia` (H2 "For developers") |
| 4 | social media scheduler (gl=my) | Commercial | **High**. AC-my 10 (free, tools, app, for small business, open source) | not measured; expected (inferred): Buffer, Hootsuite, Sprout, Later, review sites | long-term | landing | `/features` (retitle; see `head-unified.md` row 25) |
| 5 | social media scheduler free / free social media scheduler / best social media scheduler free | Transactional | **High**. AC-my 10, 10, 7 (re-run 2026-11-12; "recurpost" appears in the first two) | not measured | **unlikely**: Free is 20 free posts to try, one-time; recurring free tiers win (e.g. Buffer Free "Free forever", up to 3 channels, https://buffer.com/pricing; Zoho Social Free RM0, 1 brand, 6 channels, https://www.zoho.com/social/pricing.html; both checked 2026-11-12) | H2 (honest answer) | `/pricing` H2 "Is there a free plan?" |
| 6 | best social media scheduler (for small business / for multiple accounts / for agencies) | Commercial | **High**. AC-my 10 incl. all three modifiers | not measured; expected (inferred): vendor listicles | long-term head; months for "for multiple accounts" | listicle head skip; H2 for "multiple accounts" (unlimited accounts per organization) | `/pricing` H2 + `/features` |
| 7 | social media management tools / software / app | Commercial | **High**. AC-my 10 each (for small business, for agencies, free, list, comparison) | not measured | long-term | landing | `/features` |
| 8 | social media management tools for small business | Commercial | Med. AC-my 3 | not measured | long-term | H2 | `/features` |
| 9 | social media posting tool / auto posting tools / apps to schedule posts | Commercial | **High**. AC-my 10, 10, 8 (apps to schedule posts on instagram / tiktok / facebook) | not measured | long-term | H2 | `/features` |
| 10 | meta business suite alternative | Commercial | Low–med. AC-my 6 (free, reddit, best alternative to) | not measured | months | compare (sourced, dated; Meta's own help pages for what it does) | **NEW** `/compare/meta-business-suite` |
| 11 | hootsuite alternative(s) / buffer alternative(s) / later alternatives | Commercial | **High** for Hootsuite and Buffer: AC-my 10 each ("… recurpost" in several: RecurPost targets them). "later alternatives" also returns 10, but 8 are not about the tool ("see you later", "pay later", "rnalater"); only "later alternative recurpost" and "later social media alternatives" fit | not measured | long-term | compare with a ringgit angle | **NEW** `/compare/hootsuite`, `/compare/buffer` (Buffer: USD per channel, Essentials "$5 /month, 1 channel · $60 billed yearly", https://buffer.com/pricing; Hootsuite: "per user/month", https://www.hootsuite.com/plans; both checked 2026-11-12) |
| 12 | zoho social pricing (incl. "agency pricing") | Navigational | Med. AC-my 9 | not measured | unlikely for the head; months for "zoho social alternative" | compare | **NEW** `/compare/zoho-social` (Zoho shows ringgit to a Malaysian visitor, "Looks like Malaysia is your location": Standard RM40/month billed annually or RM60 billed monthly; Agency RM920/month billed annually or RM1,280 monthly; "Local taxes … will be charged in addition". https://www.zoho.com/social/pricing.html, MY browser, checked 2026-11-12) |
| 13 | hootsuite malaysia / buffer malaysia | Navigational | **None**. AC-my 1 (itself) / 7, all off-topic (buffer tank, buffer zone) | not measured | — | skip | — |
| 14 | duta social media / getduta | Navigational | **None**. AC-my 0 | not measured | — | skip (no brand demand for any local scheduler) | — |
| 15 | sleekflow / sleekflow pricing / sleekflow vs | Navigational | Med. AC-my 10 / 4 (sleekflow technologies sdn bhd, api, indonesia) | not measured | unlikely | skip until DMs leave beta (T §6) | — |

## B. Agency and "harga" (price) terms

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 16 | social media management malaysia | Commercial (buying a service) | Med. AC-my 4: agency, price, package | not measured; Brave row 1 shows agency service pages (neeko.my, shinjiru.com.my, flowdigital.my, justsimple.com.my) for the neighbouring query (measured by the original sweep, not re-verified). storyarc-media.com was listed here but is not in row 1's results: **unverified** | unlikely as a service; months for a cost guide | guide: "agency or tool: what managing social media costs in Malaysia", agency ranges sourced to agencies' own pages (T §1a) | **NEW** `/guides/social-media-management-cost-malaysia` |
| 17 | social media management price malaysia / package malaysia | Commercial | Low–med. AC-my 1 / 2 | not measured | months | same guide | **NEW** `/guides/social-media-management-cost-malaysia` |
| 18 | social media marketing malaysia (price / packages) | Commercial (service) | Med. AC-my 9 incl. "price", "packages", "course", "salary" | not measured | unlikely (service intent) | H2 of the cost guide | **NEW** `/guides/social-media-management-cost-malaysia` |
| 19 | social media agency malaysia (top / best / boutique) | Navigational/commercial (agencies) | Med. AC-my 6 | not measured | unlikely | skip (agencies are buyers of Pro, reached off-site, not by ranking against them) | — |
| 20 | digital marketing agency malaysia | Navigational | **High**. AC-my 10 incl. named agencies (2stallions, emperikal, brandify, digievo) | not measured | unlikely | skip | — |
| 21 | tiktok agency malaysia | Navigational | Med. AC-my 9 (live, affiliate, KOL) | not measured | unlikely | skip | — |
| 22 | freelance social media manager malaysia | Mixed (hiring + career) | Low. AC-my 1 | not measured | months | H2: "10 brands for RM99" for freelancers | `/pricing` (Pro) |
| 23 | social media manager malaysia salary | Informational (career) | Med. AC-my 1, also under rows 16 and 18 | not measured | — | skip | — |
| 24 | agensi media sosial / jasa agensi sosial media | Commercial (service) | Low for MY. AC-my 7, mostly Indonesian (jogja, jakarta, jasa) | not measured | unlikely | skip | — |
| 25 | harga agensi sosial media / harga social media management | Commercial | Low for MY. AC-my 1 / 3; all completions Indonesian ("jasa", "paket") | not measured | months | H2 in a BM cost page | **NEW** `/ms/harga` (H2 "Berapa kos urus media sosial?") |
| 26 | harga pengurusan media sosial / pakej pengurusan media sosial / pakej social media / pakej digital marketing / harga social media marketing | Commercial | **None**. AC-my 0 for all five | not measured | — | do not target | — |
| 27 | pengurusan media sosial | Informational | Low. AC-my 3 (kursus, jasa) | not measured | — | skip | — |
| 28 | admin media sosial | Jobs | AC-my 10, Indonesian job terms (loker, gaji, wfh) | not measured | — | skip | — |
| 29 | upah admin facebook / berapa caj admin facebook / caj social media manager | Commercial | **None**. AC-my 0 | — | — | skip | — |

## C. BM scheduling how-tos (the real BM demand)

Siar's honest answer on every one of these pages: the network's own free tool does it for one network (Meta Business Suite
for Facebook + Instagram); Siar does it for several networks from one post, from RM39 a month, with 20 free posts to try.

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 30 | cara schedule post | Informational | **High** (for BM). AC-my 10: tiktok, di facebook, di ig, twitter, instagram, tiktok di hp, instagram di pc, x | not measured; expected (inferred): Meta and TikTok help pages, YouTube tutorials, Indonesian tech media | months | BM hub guide linking to per-network guides | **NEW** `/ms/cara-schedule-post` |
| 31 | cara schedule post instagram | Informational | **Med–high**. AC-my 10: di pc, di laptop, di hp, story, web, di meta, reels, check, melihat | not measured | months | BM how-to (Meta Business Suite steps, then multi-network with Siar; stories and reels are supported by Siar's Instagram adapter) | **NEW** `/ms/cara-schedule-post-instagram` |
| 32 | cara schedule post instagram di pc / di laptop / web | Informational | Med. In row 31's AC | not measured | months | H2 | **NEW** `/ms/cara-schedule-post-instagram` |
| 33 | cara schedule post instagram story / reels | Informational | Low–med. In row 31's AC; "cara schedule story instagram" AC-my 2, "cara schedule reels" AC-my 1 | not measured | months | H2 | **NEW** `/ms/cara-schedule-post-instagram` |
| 34 | cara check / melihat / cek schedule post instagram / di ig | Informational (support) | Low–med. In rows 31 and "cara schedule post di ig" (AC-my 3) | not measured | weeks–months | H2 | **NEW** `/ms/cara-schedule-post-instagram` |
| 35 | schedule post instagram tidak muncul / fitur schedule post instagram tidak muncul | Informational (troubleshooting) | Low–med. AC-my 2; also a completion of "schedule post instagram" (EN) | not measured | weeks–months | H2 (troubleshooting) | **NEW** `/ms/cara-schedule-post-instagram` |
| 36 | cara schedule post di facebook / facebook / cara nak schedule post di facebook | Informational | Med. AC-my 5 (incl. Malaysian "cara nak …") | not measured | months | BM how-to (Facebook Pages only; say plainly that groups and personal profiles are not supported by Siar) | **NEW** `/ms/cara-schedule-post-facebook` |
| 37 | cara melihat schedule post facebook | Informational (support) | Low. In row 36's AC | not measured | weeks–months | H2 | **NEW** `/ms/cara-schedule-post-facebook` |
| 38 | cara schedule post threads / di threads | Informational | Low–med. AC-my 3 + 1 | not measured; expected (inferred): few dedicated BM pages | **weeks** | BM how-to (Threads is live in Siar) | **NEW** `/ms/cara-schedule-post-threads` |
| 39 | cara schedule post twitter / x / cara schedule tweet | Informational | Low. In row 30's AC; "cara schedule tweet" AC-my 2 | not measured | weeks–months | H2 of hub (mention X usage is billed from a prepaid credit at X's own USD price) | **NEW** `/ms/cara-schedule-post` |
| 40 | cara schedule post linkedin | Informational | Low. AC-my 4 (melihat, cek) | not measured | weeks | H2 of hub (LinkedIn **profiles** only) | **NEW** `/ms/cara-schedule-post` |
| 41 | cara schedule post tiktok / di hp / setting | Informational | Med. AC-my 4; also top completion of row 30 | not measured | months | **HOLD** until TikTok approves Siar (sandbox keys only) | — |
| 42 | schedule post tiktok tidak muncul / hilang | Informational (troubleshooting) | Low. AC-my 1; completions of "schedule post tiktok" | not measured | — | **HOLD** (TikTok) | — |
| 43 | cara schedule post youtube / youtube short | Informational | Low. AC-my 3 | not measured | — | **HOLD** until YouTube's audit (uploads stay private) | — |
| 44 | aplikasi schedule post (instagram / tiktok) | Commercial | Low. AC-my 2 | not measured | weeks–months | H2 of hub | **NEW** `/ms/cara-schedule-post` |
| 45 | cara jadualkan post / jadualkan post / jadualkan hantaran / jadual post facebook / aplikasi jadual post | Informational | **None**. AC-my 0 for all | — | — | do not use formal BM; Malaysians type "schedule post" in English inside BM | — |
| 46 | jadual post / jadual posting / jadual post tiktok 2026 | Informational (best posting times) | Med–low. AC-my 10 / 3, but 5 of the 10 "jadual post" completions are off-topic ("jadual postgraduate uum / utm / um", "jadual postage raya 2026", "jadual poster"); "jadual" in the rest means a posting timetable, not a tool (T §8) | not measured | — | skip: Siar has no posting-time data of its own and must not invent it | — |
| 47 | waktu terbaik post tiktok (malaysia) / waktu terbaik post | Informational | **Med–high**. "waktu terbaik post tiktok" AC-my 10 (per weekday, much of it Indonesian: "hari jumat", "indonesia", "agar fyp"); "… tiktok malaysia" AC-my 1 (itself only); "waktu terbaik post" AC-my 8 | not measured | — | skip (same reason as row 46) | — |
| 48 | best time to post malaysia / on instagram / on tiktok / on facebook malaysia | Informational | **High**. AC-my 10, 10, 10, 2 (per weekday) | not measured; Brave row 1 also surfaced zenweb.my/blog/best-time-to-post-malaysia (measured by the original sweep, not re-verified) | — | skip (no own data) | — |
| 49 | cara post serentak / post serentak facebook instagram / cara post ke semua media sosial / satu post semua platform / auto post semua media sosial | Informational | **None**. AC-my 0 for all five | — | — | the core pitch has no BM query; use it as ad copy only | — |

## D. English scheduling how-tos searched from Malaysia

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 50 | schedule post instagram | Informational | **High**. AC-my 10: not showing, desktop, story, web, not working, edit, business account, tidak muncul | not measured | long-term | guide | **NEW** `/guides/schedule-instagram-posts` |
| 51 | schedule post facebook | Informational | **High**. AC-my 10: personal, group, where to find, business page, app, mobile | not measured | long-term head; months for "business page" | guide (Pages only; say so) | **NEW** `/guides/schedule-facebook-posts` |
| 52 | schedule post facebook personal / group | Informational | Med. Completions of row 51 | not measured | **unlikely** (Siar cannot post to personal profiles or groups) | one honest FAQ line | `/facebook-api` FAQ |
| 53 | schedule post threads / can you schedule threads post | Informational | Low–med. AC-my 5 | not measured | weeks–months | guide | **NEW** `/guides/schedule-threads-posts` (or an H2 on `/threads-api`) |
| 54 | meta business suite schedule post | Informational (often troubleshooting) | **High**. AC-my 10: not working, not showing, time zone, limit, bulk, can't schedule | not measured | long-term head; months for the long tail | guide | **NEW** `/guides/meta-business-suite-scheduling` |
| 55 | meta business suite bulk schedule posts | Commercial | Low. Completion of row 54 | not measured | months | H2 (Siar has CSV bulk import, `siar-truth.md` §1c) | **NEW** `/guides/meta-business-suite-scheduling` |
| 56 | meta business suite schedule post time zone | Informational | Low. Completion of row 54 | not measured | months | H2 | **NEW** `/guides/meta-business-suite-scheduling` |
| 57 | tiktok studio schedule post (not working, reddit, time) | Informational | **High**. AC-my 8 on re-run 2026-11-12 (first run recorded 10) | not measured | — | **HOLD** (TikTok) | — |
| 58 | canva schedule posts / canva content planner | Navigational (Canva) | Med. AC-my 6 on re-run for "canva schedule posts" (first run 8) / 10 | not measured | unlikely | skip (Canva Pro owners are a channel, not a SERP) | — |
| 59 | social media planner / content calendar (template, google sheets, notion) | Informational (templates) | **High**. AC-my 10 each | not measured | long-term | skip (template intent) | — |
| 60 | kalendar kandungan / content planner malaysia | Informational | None–very low. AC-my 1 / 0 | — | — | skip | — |

## E. Auto-post terms

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 61 | auto post facebook | Mixed, mostly grey tools | **High**. AC-my 10: groups (×3), group extension, marketplace, github, fewfeed, to instagram, n8n | not measured; expected (inferred): Chrome extensions, desktop group posters, GitHub repos | **unlikely** (group posting is out of scope and against Meta's rules for personal accounts) | skip head | — |
| 62 | auto post facebook group(s) (free / extension / fewfeed) / aplikasi auto post grup facebook gratis | Transactional (grey) | **High**. In rows 61 and 66 | not measured | **unlikely** | one FAQ line: "Siar posts to Pages through Meta's official API, not to groups" | `/facebook-api` FAQ |
| 63 | auto post facebook page (n8n, wordpress plugin, from telegram) | Commercial | Med. AC-my 8 | not measured | months | guide (dashboard + API) | **NEW** `/guides/auto-post-to-facebook-page` |
| 64 | auto post facebook instagram / auto cross post from facebook to instagram | Commercial | Med. AC-my 7 (does facebook auto post to instagram, auto post instagram reels to facebook) | not measured; expected (inferred): Meta help (native cross-posting) | months | guide (EN), then BM twin | **NEW** `/guides/auto-post-facebook-instagram` |
| 65 | cross post facebook instagram | Informational | **Med–high**. AC-my 10 (not working, reels, story, business page) | not measured | long-term | H2 | **NEW** `/guides/auto-post-facebook-instagram` |
| 66 | auto post instagram (to threads / to facebook / story / n8n / to discord) | Commercial | **High**. AC-my 10 | not measured | long-term head; **weeks–months** for "to threads" and "to discord" (Siar publishes to both) | H2s | `/instagram-api` + **NEW** `/guides/auto-post-facebook-instagram` |
| 67 | auto posting / auto posting social media (free) / ai auto posting | Commercial | **High**. AC-my 10 | not measured | long-term | H2 | `/features` |
| 68 | aplikasi auto post (facebook / instagram) | Commercial | Low–med. AC-my 5 and AC-id 5, identical lists dominated by "grup facebook gratis" and "instagram gratis" (Indonesian) | not measured | months | BM H2 | **NEW** `/ms/cara-auto-post-facebook-instagram` |
| 69 | cara auto post (instagram / story instagram / tiktok / grup fb di hp) | Informational | Med. AC-my 9 | not measured | months | BM how-to | **NEW** `/ms/cara-auto-post-facebook-instagram` |
| 70 | cara buat auto post di facebook | Informational | Low. AC-my 1 | not measured | weeks–months | H2 | **NEW** `/ms/cara-auto-post-facebook-instagram` |
| 71 | auto post tiktok (api, n8n, free) | Commercial | **High**. AC-my 10 | not measured | — | **HOLD** (TikTok) | — |
| 72 | apps auto post / apps that auto post to instagram | Commercial | Low. AC-my 3 | not measured | months | H2 | `/features` |

## F. Comment-to-DM, auto-reply and "harga" hooks

All rows below depend on the DM beta. Until Fakhrul opens DMs and comment-to-DM to every paid organization, pages may
describe the feature only as "Facebook and Instagram DMs and comment-to-DM automations: in beta, turned on per organization on
request (paid plans)" (`siar-truth.md` §2). Publishing a comment-to-DM landing page earlier invites sign-ups for a feature
they cannot turn on.

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 73 | comment to dm | Commercial | **High**. AC-my 10: automation instagram free, tiktok, meta business suite, facebook, linkedin, tool. Same in AC-id and AC-sg | not measured; expected (inferred): ManyChat and other automation vendors | long-term | use-case | **NEW** `/use-cases/comment-to-dm` — **HOLD** (DM beta) |
| 74 | comment to dm automation instagram (free) | Commercial/transactional | **High**. In row 73 | not measured | **unlikely** for "free": Siar Free has 0 comment-to-DM runs | H2 | **NEW** `/use-cases/comment-to-dm` — HOLD |
| 75 | comment to dm automation meta business suite | Informational | Med. In row 73 (suggests Meta offers a native version; not verified on Meta's page: unverified) | not measured | months | H2: native vs Siar | **NEW** `/use-cases/comment-to-dm` — HOLD |
| 76 | comment to dm facebook | Commercial | Low. AC-my 2 | not measured | months | H2 | **NEW** `/use-cases/comment-to-dm` — HOLD |
| 77 | comment to dm tiktok / linkedin | Commercial | Med. In row 73 | not measured | **unlikely** (DMs are FB + IG only) | skip | — |
| 78 | auto reply dm instagram (incl. "cara auto reply dm instagram", "cara setting auto reply dm instagram") | Commercial/informational | Med. AC-my 8, three of them BM | not measured | months | use-case + BM H2 | **NEW** `/use-cases/instagram-auto-reply` — HOLD |
| 79 | cara auto reply instagram (buat, edit, setting, mematikan) | Informational | Med. AC-my 10 | not measured | months | BM how-to (native settings first, Siar automations second) | **NEW** `/ms/cara-auto-reply-instagram` — HOLD for the Siar part |
| 80 | auto reply instagram comment (free) / auto reply comment instagram | Commercial | Med. In "auto reply instagram" AC-my 10; own seed AC-my 4 on re-run (first run 3) | not measured | months | H2 (Siar steps: public comment reply, like, private reply) | **NEW** `/use-cases/instagram-auto-reply` — HOLD |
| 81 | auto reply facebook page (sample, messenger, comment) | Mixed (templates + tools) | **High**. AC-my 10; "auto reply message facebook page sample" is template intent | not measured | months for the comment variant | use-case | **NEW** `/use-cases/facebook-auto-reply` — HOLD |
| 82 | auto reply comment facebook (page, free, n8n, bot) | Commercial | Med. AC-my 9 | not measured | months | H2 | **NEW** `/use-cases/facebook-auto-reply` — HOLD |
| 83 | auto reply messenger / facebook automated responses | Informational | **High**. AC-my 10 each ("not working", "examples") | not measured; expected (inferred): Meta help | long-term | H2 | **NEW** `/use-cases/facebook-auto-reply` — HOLD |
| 84 | auto dm instagram (free, free unlimited, comments) | Transactional | **High**. AC-my 10 | not measured | **unlikely** ("free unlimited") | skip head | — |
| 85 | instagram dm automation / dm automation / instagram automation | Commercial | **High**. AC-my 10 each (manychat, n8n, open source, free) | not measured | long-term | use-case | **NEW** `/use-cases/instagram-auto-reply` — HOLD |
| 86 | manychat alternative (for instagram, free, for facebook) | Commercial | **Med–high**. AC-my 10 | not measured | months | compare: ManyChat prices in USD by monthly active contacts (Free $0 for 25; Essential $14/mo billed yearly for 250; Pro $29/mo for 2,500; overage per extra contact; https://manychat.com/pricing, checked 2026-11-12) vs Siar Starter RM39 incl. 200 comment-to-DM runs per account | **NEW** `/compare/manychat` — HOLD (DM beta) |
| 87 | manychat pricing / manychat malaysia | Navigational | Med / low. AC-my 10 / 1 | not measured | unlikely | skip head | — |
| 88 | auto reply tiktok (dm, comment, shop, live) | Commercial | **High**. AC-my 10 | not measured | **unlikely** (no TikTok DMs or comments in Siar) | skip | — |
| 89 | auto reply whatsapp / whatsapp chatbot malaysia | Commercial | **High** / med. AC-my 10 / 6 | not measured | **unlikely** (Siar has no WhatsApp) | skip | — |
| 90 | comment harga / komen harga / pm harga / facebook live comment harga | — | **None as a Malaysian search**. AC-my 0 / 1 ("harga komen buzzer") / 10 but Indonesian and time-of-day meanings ("pm harga artinya", "harga 15 pm") / 0 | — | — | "Comment HARGA" is an ad and in-product hook, not a keyword | — |
| 91 | harga (alone) | Navigational/other | AC-my 10, all gold, fuel and iPhone prices | — | — | skip | — |
| 92 | live selling malaysia / sistem tempahan live | Commercial | Low / none. AC-my 1 / 0 | — | — | skip | — |

## G. Link in bio

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 93 | cara buat link bio (di tiktok, di ig, di canva, wa, shopee) | Informational | **Med–high**. AC-my 10 | not measured; expected (inferred): Linktree-type tools, Indonesian blogs, YouTube | months | BM how-to (Siar includes a link-in-bio page per team with views and clicks per link, `siar-truth.md` §1c; the BM page must not imply the page itself is in BM) | **NEW** `/ms/cara-buat-link-bio` |
| 94 | cara buat link whatsapp di bio ig / tiktok | Informational | Low. AC-my 3 | not measured | weeks–months | H2 | **NEW** `/ms/cara-buat-link-bio` |
| 95 | cara letak link di bio instagram | Informational | Low. AC-my 2 | not measured | weeks–months | H2 | **NEW** `/ms/cara-buat-link-bio` |
| 96 | linktree alternative(s) (free) | Commercial | **High**. AC-my 10 | not measured | long-term | landing | **NEW** `/link-in-bio` |
| 97 | link in bio malaysia / linktree malaysia | — | None / low. AC-my 0 / 2 | — | — | skip | — |
| 98 | link bio (tiktok, site) | Mixed, much of it spam ("viral video") | AC-my 10 | — | — | skip | — |

## H. API terms in Malay and Indonesian

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 99 | api media sosial / api sosial media | Ambiguous | **Very low**. AC-my 1, AC-id 1 (only the phrase itself) | not measured | — | skip; "api" means fire in Indonesian | — |
| 100 | api posting instagram (ID) | Commercial (dev) | Very low. AC-id 1 | not measured | — | skip; developers search in English | `/instagram-api` already covers it |
| 101 | api tiktok (ID) | Not developer | AC-id 10, all TikTok streak ("api tiktok mati berapa hari") | — | — | trap, skip | — |
| 102 | api instagram (gl=my) | Commercial (dev) | **High**. AC-my 10 (post, price, free, graph, python) | not measured; expected (inferred): Meta developer docs first | long-term | network page | `/instagram-api` |
| 103 | api facebook (page, post, graph) | Commercial (dev) | **High**. AC-my 10 | not measured | long-term | network page | `/facebook-api` |
| 104 | facebook graph api malaysia | — | None. AC-my 0 | — | — | skip | — |
| 105 | whatsapp api malaysia (price, provider, cost per message) | Commercial | **High**. AC-my 10 | not measured | unlikely (no WhatsApp in Siar) | skip; note as a product gap, not an SEO target | — |

## I. Singapore

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 106 | social media scheduler singapore | Commercial | **None**. AC-sg 0 | not measured | — | skip | — |
| 107 | social media management tools singapore | Commercial | **None**. AC-sg 0 | — | — | skip | — |
| 108 | social media api singapore | Commercial | **None**. AC-sg 0 | — | — | skip | — |
| 109 | social media management singapore | Commercial (service) | Med. AC-sg 7 (agency, salary, freelance, cost) | not measured | unlikely | skip | — |
| 110 | social media agency singapore / social media marketing singapore | Commercial (service) | **High**. AC-sg 10 each | not measured | unlikely | skip | — |
| 111 | social media management package / price singapore | Commercial | Low / none. AC-sg 2 / 0 | — | — | skip | — |
| 112 | psg grant social media | Informational | Low. AC-sg 2 | not measured | — | skip (Siar is not a PSG-listed vendor; inferred, not checked) | — |
| 113 | best time to post singapore | Informational | **High**. AC-sg 10 | not measured | — | skip (no own data) | — |

Singapore buyers type the global English terms (AC-sg returns the same "social media scheduling tools", "comment to dm" and
"auto reply instagram" lists as AC-my). The English pages above serve them; USD prices apply. No Singapore page.

## J. Indonesia

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 114 | cara menjadwalkan postingan (tiktok, di facebook, di fb pro, ig, youtube, shopee video) | Informational | **High** (ID). AC-id 10 | not measured | long-term | out of scope: no rupiah price, no Indonesian copy, local rivals (AutoPost.id, T §1c) | — |
| 115 | cara menjadwalkan postingan instagram / facebook / tiktok | Informational | Med–high (ID). AC-id 8 / 7 / 6 | not measured | long-term | out of scope | — |
| 116 | jadwal posting (tiktok, fb pro, instagram) | Informational (best times) | **High** (ID). AC-id 10 | — | — | skip | — |
| 117 | aplikasi penjadwal postingan / social media scheduler indonesia | Commercial | **None**. AC-id 0 / 0 | — | — | skip | — |
| 118 | aplikasi manajemen media sosial / social media management tools indonesia / auto posting sosmed | Commercial | Very low. AC-id 1 each | — | — | skip | — |
| 119 | jasa social media management (harga) | Commercial (service) | Med (ID). AC-id 7 | — | unlikely | skip | — |
| 120 | autopost.id | Navigational | Very low. AC-id 1 | — | — | skip | — |

## K. Grants

| # | Keyword | Intent | Demand (evidence) | Top 5 now | Win | Page type | Siar page |
|---|---|---|---|---|---|---|---|
| 121 | geran digital pmks madani (2026) / geran digital madani / mdec digital grant 2026 | Informational | **High**. AC-my 10 each, "2026" variants present | not measured | unlikely, and off-limits: Siar is not on MDEC's panel and must not mention the grant (T §1b) | skip; revisit if a 2026 round opens and Siar is listed | — |

---

## What this sweep tells us

1. **Malaysians do not search for a Malaysian tool.** "social media scheduler malaysia", "social media management tools
   malaysia", "social media api malaysia" and every BM tool or price phrase ("pakej / harga pengurusan media sosial", "aplikasi
   jadual post") return zero completions (measured). The one SERP measured is thin: Duta (public since August 2026, 23 URLs in its sitemap) is #1,
   and the rest are agency blogs (Brave, measured by the original sweep; not re-verified 2026-11-12). So a single English `/malaysia` page can likely rank within weeks (inferred). Its value is
   GEO (being the cited answer to "Malaysian scheduler priced in ringgit") more than traffic. It must not say "first" or "only".
2. **BM demand is how-to demand, per network, written in mixed BM-English.** "cara schedule post" (10), "cara schedule post
   instagram" (10), "cara auto post" (9), "cara auto reply instagram" (10), "cara buat link bio" (10) are real. Formal BM
   ("jadualkan", "hantaran", "serentak") returns nothing. Pages must use the words people type ("schedule post", "auto reply",
   "link bio"), not dictionary Malay.
3. **The biggest BM topics are ones Siar cannot serve yet.** TikTok scheduling (TikTok is sandbox only) and every comment-to-DM
   or auto-reply term (DMs are a beta, off by default) lead the autocomplete. "Comment HARGA" and "PM harga" are not searches at
   all; they are ad and product hooks.
4. **Price searches are about agencies, not software.** "social media management price / package malaysia" completes to agency
   packages. The honest way in is a cost guide (agency ranges against tool prices, all sourced), not a "cheapest scheduler" claim.
5. **Grey demand is large and off-limits.** "auto post facebook" is mostly groups, extensions and fewfeed. Siar answers it with
   one FAQ line (Pages through Meta's official API) and does not chase it.
6. **Singapore and Indonesia: no separate pages.** Singapore searches the global English terms; local-modifier queries return
   nothing. Indonesia has strong how-to demand ("cara menjadwalkan postingan"), but Siar has no rupiah pricing or Indonesian
   copy, and "API media sosial" is not a developer query there ("api" means fire).
7. **Content Siar must not write:** best-time-to-post pages (high demand in MY and SG, but Siar has no posting data and must not
   invent it), WhatsApp pages, grant pages.

### Is a BM page set worth it?

**Yes, but small, and as a test, not a BM site.** Inferred from the evidence above:

- **Build now (6 pages, under `/ms/`, `lang="ms"`, `hreflang` to the English twin where one exists):**
  `/ms/cara-schedule-post` (hub), `/ms/cara-schedule-post-instagram`, `/ms/cara-schedule-post-facebook`,
  `/ms/cara-schedule-post-threads`, `/ms/cara-auto-post-facebook-instagram`, `/ms/cara-buat-link-bio`. Each opens with the
  native free answer (Meta Business Suite, Instagram), then shows the Siar way for several networks at once, and links to
  `/ms/harga`.
- **`/ms/harga`:** a BM pricing summary (RM39 / RM99 / RM399, yearly once by FPX or DuitNow, 20 free posts to try, unlimited
  accounts, price lock) with an H2 on what an agency costs. Low search demand; it exists so BM how-to readers land on a page they
  can read.
- **Hold:** `/ms/cara-auto-reply-instagram`, `/use-cases/comment-to-dm`, `/use-cases/instagram-auto-reply`,
  `/use-cases/facebook-auto-reply`, `/compare/manychat` until the DM beta opens to every paid organization. TikTok and YouTube
  how-tos until those approvals land.
- **Not worth it:** a translated home page, translated network or docs pages, BM agency or "pakej" pages, Indonesian pages.
- **Cost of the test:** the dashboard and connect page are English only, so a BM reader who signs up lands in English. Say so
  on the page or accept the drop-off.
- **Kill rule:** this contradicts `geo/plan.md` ("buyers search in English; revisit if GSC shows demand"). Resolve it with
  data: verify GSC first, publish the 6 pages, and drop the set if they earn no impressions within 8–12 weeks of indexing.

### English pages this sweep adds (beyond `head-unified.md`)

`/malaysia`, `/guides/social-media-management-cost-malaysia`, `/compare/meta-business-suite`, `/compare/zoho-social`,
`/guides/schedule-instagram-posts`, `/guides/schedule-facebook-posts`, `/guides/meta-business-suite-scheduling`,
`/guides/auto-post-facebook-instagram`, `/guides/auto-post-to-facebook-page`, `/link-in-bio`, and the held DM set above.

### Follow-up measurements (not done here: the search budget ran out)

Top-5 checks on a Malaysian SERP (Google `gl=my` through GSC once verified, or Brave with the MY cookie) for rows 1, 10, 16,
30, 31, 36, 38, 50, 54, 63, 64, 73, 86, 93, 96. These decide whether the "weeks" and "months" estimates above hold.

## Sources

- Google autocomplete, `https://suggestqueries.google.com/complete/search?client=firefox&hl=ms&gl=my&q=…` (also `hl=id&gl=id`,
  `hl=en&gl=sg`), 278 seeds, fetched 2026-11-12. Raw output kept in this session's scratchpad only.
- Brave Search, "social media scheduler malaysia", fetched 2026-11-12.
- Siar sitemap, https://siaran.my/sitemap-0.xml, fetched 2026-11-12 (89 URLs).
- Vendor facts (Duta, Zoho Social, ManyChat, SleekFlow, Buffer, Hootsuite, AutoPost.id): `competitors/my-sea-schedulers.md`,
  each measured on the vendor's own page, checked 2026-11-12. Re-fetched in the verification pass below: Zoho Social, Buffer,
  Hootsuite, ManyChat, AutoPost.id, getduta.com (/pricing, /sitemap.xml, /llms.txt).
- Siar facts: `siar-truth.md`, `docs/pricing.md`, `apps/api/src/modules/messaging-automations.ts`,
  `apps/site/src/layouts/Base.astro`.

## Verification log (2026-11-12, adversarial re-check)

**Who ranks: not re-checked.** The shared WebSearch budget was already spent when this pass started (every query returned
"budget is used up"), and the rule forbids scraping engines another way. So the one SERP claim (Brave, row 1, reused in rows 16
and 48 and in finding 1) is still the original sweep's single measurement and is now labelled "not re-verified". The 15
follow-up SERP checks above remain open, plus row 1 itself.

**Autocomplete re-run [measured]:** 98 seeds re-queried at the same endpoint (90 `hl=ms gl=my`, 4 `hl=id gl=id`, 4
`hl=en gl=sg`). These held exactly or within one completion: rows 1–4, 10, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 25, 26, 28,
29, 30, 31, 36, 38, 40, 41, 43, 44, 45, 48, 49, 50, 51, 53, 54, 61, 63, 65, 66, 68, 69, 72, 73, 76, 79, 86, 87, 89, 90, 91,
93, 96, 97, 99, 101, 102, 104, 105, 106, 109, 112, 113, 114, 117, 121. Autocomplete moves between runs; small count differences
(rows 57, 58, 80) were recorded as re-run values, not treated as errors in the original.

**Vendor pages re-opened [measured, checked 2026-11-12]:**
- Zoho Social, https://www.zoho.com/social/pricing.html, from a Malaysian browser: Free RM0; Standard RM40 billed annually /
  RM60 monthly; Professional RM120 / RM160; Premium RM160 / RM260; Agency RM920 / RM1,280 (10 clients, 160 channels, 5 members);
  Agency Plus RM1,320 / RM1,840. Matches the teardown. A plain server fetch shows no prices (they load by region).
- Duta: https://getduta.com/pricing "RM99 a month", 7 days free, card required, no free plan (matches). https://getduta.com/sitemap.xml
  lists **23** URLs (teardown said 24). https://getduta.com/llms.txt gives no launch date, only "Last verified: 2026-08-11"; a
  blog post is dated 9 August 2026. "Launched August 2026" is therefore inferred; "public since August 2026" is what the evidence supports.
- Buffer, https://buffer.com/pricing: USD, per channel, Free "Free forever" up to 3 channels, Essentials $5/month per channel billed yearly (matches).
- Hootsuite, https://www.hootsuite.com/plans: priced "per user/month", Standard up to 10 accounts, Fall Sale banner (matches); dollar
  amounts did not render in my fetch, so the teardown's $99 figure is not re-confirmed here.
- ManyChat, https://manychat.com/pricing: USD, tiers by monthly active contacts, Free $0 (25), Essential $14/mo yearly (250), Pro $29
  (2,500), Business $69 (7,500), Advanced $139 (25,000), per-contact overage (matches "USD per-contact"; detail added to row 86).
- AutoPost.id, https://autopost.id/: "Platform Auto Posting Sosmed #1 di Indonesia", rupiah prices (Free Rp 0, Growth Rp 99.000,
  Business Rp 299.000 per month) (matches the teardown's network list).
- Not re-opened: SleekFlow (row 15 only cites autocomplete), MDEC panel (row 121 rests on the teardown's BSN source), Meta's native
  comment-to-DM (row 75 stays **unverified**).

**Siar facts re-checked [code/live]:** `apps/site/src/layouts/Base.astro` line 24 `<html lang="en">`; live sitemap has 89 `<loc>`
and no `/ms/`, `/malaysia`, `/compare/`, `/guides/` or `/link-in-bio` URL (so every NEW slug is genuinely new);
`messaging-automations.ts` has the triggers and steps named in the method section (also `QUICK_REPLY_CLICKED`, `BUTTON_CLICKED`,
`MANUAL_TEST`, not needed here); the Instagram adapter handles `STORY` and `REEL`; `content-csv.ts` and `bio.ts` exist; plan
numbers (RM39/99/399, 20 free posts to try, 200 comment-to-DM runs on Starter, no DMs or analytics on Free) match `siar-truth.md` §3a.
All held. No quotes attributed to third parties appear in this file, so there were none to remove.
