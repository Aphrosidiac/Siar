# Launch: the SEO landing build, live on siaran.my

Deployed 12 November 2026, release `f11510f` (`deploy/deploy-shared.sh`). This records what was checked on the live
site and what was sent to the search engines. The acceptance standard is [ACCEPTANCE.md](ACCEPTANCE.md), and gate D is
the live part.

## Gate D on the live site (12 Nov, read-only GETs)

| Check | Result |
|---|---|
| Sitemap | `sitemap-index.xml` → `sitemap-0.xml`, 141 URLs, `lastmod` on each, no `priority`/`changefreq`. Googlebot UA gets 200 `text/xml` |
| Every sitemap URL | 200, self-canonical, indexable, no duplicate titles or descriptions |
| Clean URLs | `/pricing/`, `/pricing/index.html`, `/pricing.html`, `/docs/`, `/index.html`: **one 301** to the clean URL (nginx, this release) |
| http and www | `http://` → https in one hop (Cloudflare). `https://www.` → apex in one hop. `http://www.` takes two (Cloudflare to https, then nginx to the apex) |
| Unknown URL | 404 with `noindex` |
| Tracking parameters | `/?utm_source=…&gclid=…` keeps the clean canonical |
| Crawlers | Googlebot, Bingbot, GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Applebot, CCBot: 200, no challenge |
| Files | `robots.txt` (`Allow: /` and the sitemap index), `favicon.ico`, the IndexNow key file, `llms.txt`, `pricing.md`: all 200 |

## Search engines

- **Google Search Console.** siaran.my is a Domain property, verified twice by DNS TXT:
  - by hello@ffdev.studio in October, for the Google sign-in approval;
  - by rikaidrawings@gmail.com on 12 Nov, with its own TXT record added through the Cloudflare API (record comment
    says so).

  Keep both records. The property already held 53 indexed pages from the old site.
  - Submitted `https://siaran.my/sitemap-index.xml` (12 Nov). It showed "Couldn't fetch" straight after submitting, the
    usual placeholder before Google's first read. The live sitemap returns 200 to Googlebot, and new pages already
    list it as their discovery source.
  - Requested indexing (priority crawl queue) for `/`, `/pricing`, `/platforms`, `/how-publishing-works`, `/compare`,
    `/malaysia` and `/for-agencies`. The other pages come from the sitemap. Request a few more a day, newest money
    pages first (`/guides/social-media-api-pricing`, `/features`, the compare pages); the daily quota is about 10.
- **IndexNow** (Bing, Yandex, Seznam, Naver; Bing also feeds ChatGPT search and Copilot):
  `node apps/site/scripts/indexnow.mjs` sent all 141 URLs and got 200. Run it after every site deploy.
- **Bing Webmaster Tools:** not set up yet. It needs Fakhrul's sign-in (Google, rikaidrawings). Then import
  siaran.my from Search Console, submit the sitemap, and turn on the AI Performance report.

## Still open

1. **Cloudflare Email Obfuscation is on.** It turns the contact email into a `/cdn-cgi/l/email-protection` link that
   crawlers get as a 404, and AI fetchers read `[email protected]`. Turn it off for siaran.my (Scrape Shield). It
   protects nothing here, because the address is public.
2. **`http://www.siaran.my`** takes two hops. To make it one, add a Cloudflare redirect rule that sends `www` straight
   to `https://siaran.my` with the path. This is low priority: nothing links to www.
3. **Uppercase paths** (`/Pricing`) return a 404 instead of a 301. nginx can't lowercase without a module. It's
   harmless while nothing links to them.
4. Re-read the Search Console sitemap and Pages reports in a few days. Expect the 141 URLs to be discovered and
   indexing to grow over 1–4 weeks.
