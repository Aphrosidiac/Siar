# Analytics: how Siar counts visitors, crawlers, signups, revenue and search

Everything lands in Siar's own database and comes out of one report (`apps/api/src/domain/metrics.ts`). You can read
it in four places:

- **Dashboard → Staff → Metrics** (`/metrics`): staff accounts only.
- **`GET /api/internal/metrics?days=30`**: JSON, or `&format=md` for markdown. Staff session only, never an API key.
- **`scripts/metrics.sh report 7`** from the Mac (`json 30`, `ingest`, `search`, `sql "SELECT …"`). It runs
  `dist/metrics-cli.js` on the box over SSH. This is the route for an AI assistant.
- **SQL** on the tables below, read-only through `scripts/metrics.sh sql`.

Days are Malaysia days (UTC+8). Staff and internal accounts (role ADMIN, `@siaran.my`, `@ffdev.studio`) are left
out of signups and revenue.

## 1. Traffic: who asked for each page

nginx writes one JSON line per request to `/var/log/siar/traffic.log` (`deploy/nginx/siar.conf`, format
`siar_json`). The API reads new lines every 10 minutes (`cron.traffic-ingest`) from a saved position (inode and
byte offset), following logrotate's rename to `traffic.log.1`.

What is stored and what is only counted:

| Request | Stored per request (`TrafficHit`, 120 days) | Counted per day (`TrafficDaily`) |
|---|---|---|
| Pages, the beacon, robots/sitemaps/llms.txt on siaran.my | yes | yes |
| Anything non-human on app/api/media (crawlers, scanners, impostors) | yes | yes |
| Static assets; people and API clients on app/api/media | no | yes |

Each request gets exactly one class:

| Class | Meaning | How it is decided |
|---|---|---|
| `human` | A person, confirmed | A browser User-Agent whose page view was followed, within 30 minutes, by the page's beacon (`/_e`) from the same visitor, with `navigator.webdriver` false |
| `unconfirmed` | A browser that never ran the page's JavaScript | A browser User-Agent with no beacon. It could be a bounce under 3 seconds, a blocker, or a scraper using a browser User-Agent. Shown separately, never added to humans |
| `staff` | FF's own browsing | An IP a staff account signed in from in the last 30 days |
| `automation` | A browser that admits it is automated, or behaves like it | The beacon reported `webdriver`, or the visitor pulled more than 60 pages in 10 minutes |
| `search-bot`, `ai-bot`, `other-bot` | A named crawler | Its User-Agent matches the catalogue in `apps/api/src/domain/traffic/agents.ts` |
| `impostor` | Claims to be a crawler and isn't | A catalogue crawler whose IP is in neither its owner's published list nor its forward-confirmed reverse DNS |
| `datacenter` | A browser User-Agent from a cloud server | The IP is in AWS, Google Cloud, DigitalOcean or Oracle Cloud's published ranges |
| `tool` | An HTTP library, CLI or headless browser | curl, Python, Go, Node, HeadlessChrome, Lighthouse, Playwright, … |
| `monitor` | Uptime checks | UptimeRobot, Pingdom, … |
| `scanner` | Probing for vulnerabilities | A scanner User-Agent, a path no static site has (`.php`, `/.env`, `/wp-…`, dot-files, `vendor/`), or 10 or more 404s from one visitor in 10 minutes |
| `internal` | Siar itself | Loopback (health checks), Siar's own audit tools, and non-browser requests from a staff IP |

**Crawler verification.** The `verified` column is one of:

- `verified`: the IP is in the owner's published list, or reverse DNS gives the owner's domain and that name resolves
  back to the same IP.
- `failed`: the class becomes `impostor`.
- `unverifiable`: the owner publishes no list, or it can't be loaded right now.

Lists checked: Google (googlebot, special-crawlers, user-triggered-fetchers), Bing, OpenAI (GPTBot, OAI-SearchBot,
ChatGPT-User), Perplexity, DuckDuckGo. Reverse DNS: Google, Bing, Apple, Yandex, Baidu, Amazon, Petal, Seznam,
Naver. Anthropic, Meta, Common Crawl and ByteDance publish nothing to check against, so their crawlers are counted
under the name they give and marked `unverifiable`.

**Visitors.** A visitor is a hash of the IP and User-Agent with a salt that includes the date. The same person
on three days counts three times in a range ("visitors, daily, summed"). People's IPs are never stored; IPs are kept
only for non-human classes, so a claim can be audited.

**Known limits.**
- Azure, Hetzner and OVH publish no stable ranges, so a browser User-Agent from them passes as a browser. The beacon
  is the second check.
- A scraper that runs JavaScript, hides `webdriver` and pages slowly can pass as human. Expect that to be rare on
  this site.
- Visitors with JavaScript off, or a blocker that stops `/_e`, show as `unconfirmed`.

## 2. The beacon and the first-visit cookie

`apps/site/src/layouts/Base.astro`, inline, on every site page:

- **First visit:** sets `siar_ft` (domain `siaran.my`, 180 days, first-party) with the referrer host, UTM source,
  medium and campaign, the landing path and the time.
- **After the first interaction, or 3 s with the tab visible:** sends `/_e?p=<path>&r=<referrer host>&us/um/uc=<UTM>&w=<width>&wd=<webdriver>&e=<i|t>`.
  nginx logs it and answers 204, never cached.

At signup (email, Google, or accepting an invitation) the API copies `siar_ft` onto the user:
`signupChannel`, `signupRefHost`, `signupUtmSource`, `signupUtmMedium`, `signupUtmCampaign`, `signupLanding` and
`firstSeenAt` (`apps/api/src/domain/traffic/channel.ts`).

Channels:
- UTM tags decide first.
- Then the referrer: Google, Bing, AI assistant (ChatGPT, Perplexity, Claude, Gemini, Copilot, …), Other search,
  Social, Referral.
- No referrer is Direct. A signup with no cookie is Unknown.

The privacy policy describes all of this (`apps/site/src/pages/privacy.mdx`, Cookies).

## 3. Search

`cron.search-pull` runs at 02:20 and 14:20 UTC and fills `SearchDaily`:

| Row | Meaning |
|---|---|
| query `*`, page `*` | That day's total |
| query `*`, a page | That page |
| a query, page `*` | That query (Bing) |
| a query and a page | That pair (Google) |

Google hides rare queries in per-query rows, so totals always come from the total rows.

- **Google Search Console** needs `GSC_SERVICE_ACCOUNT_JSON` (raw JSON or base64) and `GSC_PROPERTY`
  (default `sc-domain:siaran.my`). Each run re-reads the last 16 days, because Google revises recent days.
- **Bing Webmaster** needs `BING_WEBMASTER_API_KEY`. It reads GetRankAndTrafficStats (daily totals), GetQueryStats
  and GetPageStats, which Bing updates weekly.

Setting up the keys (Fakhrul), then add them to `/srv/siar/shared/.env` and restart `siar-api`:

1. Google Cloud, project siar-prod:
   - IAM → Service accounts → Create, for example `siar-metrics`. It needs no roles.
   - Keys → Add key → JSON.
   - Search Console → siaran.my → Settings → Users and permissions → Add user → the service account's email,
     permission **Restricted**.
   - Put the JSON (one line, or base64) in `GSC_SERVICE_ACCOUNT_JSON`.
2. Bing Webmaster Tools → Settings → API access → Generate API key. Put it in `BING_WEBMASTER_API_KEY`.

Until a key is set, the report lists that collector as "not configured".

## 4. Signups and revenue

These are read live from the product tables:
- signups from `User`, minus staff and internal accounts;
- "connected an account": a `SocialAccount` in the organization;
- "published a post": a `Post` with status `POSTED`;
- paying and trial status from `Subscription`;
- MRR: active and past-due paid subscriptions, yearly divided by 12, per currency;
- collected: `BillingPayment` rows marked PAID.

## 5. Operations

- **Log file and rotation:** `/var/log/siar/` is owned by root with group siar and is readable by the API. It has its
  own logrotate rule, `/etc/logrotate.d/siar`: daily, 14 days kept, `create 0644 root siar`, and nginx is sent USR1.
  `deploy/deploy-shared.sh` installs both. nginx's own rule would recreate the file as 0640 www-data:adm, which the
  API can't read.
- **Collector status:** in the report's Sources section (`CollectorRun`).
- **Tests:** `pnpm --filter @siar/api exec vitest run tests/traffic.test.ts` covers User-Agents, IP ranges,
  verification, classification and channels, with the network stubbed.

Useful queries (`scripts/metrics.sh sql "…"`):

```sql
-- people vs everything else on the site, per day
SELECT date(at + interval '8 hours') d, class, count(*) FROM "TrafficHit" WHERE host = 'site' AND kind = 'page' GROUP BY 1, 2 ORDER BY 1, 3 DESC;
-- what GPTBot and OAI-SearchBot read this week
SELECT agent, path, count(*) FROM "TrafficHit" WHERE agent LIKE '%GPT%' OR agent LIKE 'OAI%' AND at > now() - interval '7 days' GROUP BY 1, 2 ORDER BY 3 DESC;
-- signups with their source
SELECT email, "createdAt", "signupChannel", "signupLanding", "signupRefHost" FROM "User" ORDER BY "createdAt" DESC LIMIT 20;
```

## 6. FF Analytics (FF Ops) reads Siar too

FF Ops (ops.ffdev.studio → Analytics) shows every FF property side by side. For Siar it uses two things:

- **Traffic:** the FF shipper on the box reads `/var/log/siar/traffic.log` with its own position (user `ff-ship`,
  timer every 10 minutes, installed by FF Ops' `install.sh … siar <key> @/var/log/siar/traffic.log`). It changes
  nothing here: Siar's own reader and this Metrics page keep working as before.
- **Business numbers:** `GET https://api.siaran.my/api/internal/ff-analytics?days=30&exclude=ffdev.studio` with
  `Authorization: Bearer <FF_ANALYTICS_TOKEN>` (`apps/api/src/domain/ff-analytics.ts`). It answers signups by
  channel, landing page and referrer, the funnel (signed up → connected an account → published a post → trial →
  paying), MRR and collected revenue per currency in cents, and the staff sign-in IPs. Same exclusions as §4 plus the
  `exclude` domains. Days are Malaysia calendar days, today included. Read-only; off (404) while
  `FF_ANALYTICS_TOKEN` is empty; a wrong token is 401. FF Ops pulls it hourly for 1, 7, 30 and 90 days.

