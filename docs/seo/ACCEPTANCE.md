# SEO acceptance: what "done" means for the landing pages

The landing pages go to Fakhrul only when every check below passes. The standard is BayangWeb's
`docs/SEO_BASELINE.md` (the "perfect SEO" baseline), adapted from a shop to a SaaS site. The SEO research in
this folder decides what the pages say; this file decides when they are finished.

There are four gates. A, B and C run on the branch before handover. D runs only after Fakhrul says deploy.

## Decisions taken from the baseline

- **No `FAQPage`, `HowTo` or `QAPage` markup.** Google stopped showing FAQ rich results (May 2026), so the
  markup buys nothing. A page can still have a visible FAQ section with question-shaped `<h2>`/`<h3>` headings.
  That visible text is what AI engines read.
- **No `AggregateRating`, `Review`, testimonials, customer counts, uptime or speed figures**, in markup or in copy.
- **Schema describes only what is visible.** Every price in an `Offer` appears on the page. Every `dateModified`
  appears as the visible "Updated" date.
- **`llms.txt` stays as it is.** It is already live and costs nothing, but no more work goes into it.
- **`lastmod` is the content date** (`src/lib/updated.mjs`), never the build time. Every sitemap URL has one.
- **Malay pages (`/ms/*`) are not translations.** They get `lang="ms"`, `og:locale` `ms_MY`, and no hreflang.

## Gate A: static checks on the built site (automatic)

Every built page, every sitemap URL. Zero failures.

| Rule | Check |
|---|---|
| Sitemap | Index plus children. Every `<loc>` is a built page on `https://siaran.my`, listed once, with a `lastmod`. No `priority` or `changefreq`. Every indexable page is in it. No sitemap page is `noindex` |
| Head | One `<title>` of 25–60 characters. One meta description of 120–160 characters. One absolute self-canonical. `lang`, viewport, `og:title`, `og:description`, `og:type`, `og:image` (built file), `og:url` = canonical, `twitter:card` |
| Unique | Titles, descriptions and canonicals are unique across the site |
| Headings | Exactly one non-empty `<h1>`. No level skipped inside `<main>`. This covers the `/docs/api/*` template, which jumps from h1 to h3 |
| JSON-LD | Parses. None of the banned types above. Every `url`/`item` on siaran.my resolves. The last breadcrumb is the canonical. Every top-level page except `/` has a BreadcrumbList |
| Links | Every internal `href`, `src` and `srcset` resolves to a built file. Links use canonical form: no trailing slash, no `.html`, lowercase. Every `#fragment` exists on its target. Anchor text is descriptive (never "click here", "learn more" or empty). The exact anchor "unified social media API" links only to `/` |
| Orphans | Every sitemap page has at least one internal link from another page |
| Images | `alt` present (`alt=""` when decorative), plus `width` and `height` |
| Copy | No banned word from `messaging.md` §6 outside legal pages and rival tables. No `{{`, TODO, TBD, lorem, `[OWNER`, `undefined`, `NaN`. Raw HTML under 1 MB per page (`/docs/api/automation` is 1.2 MB) |
| Files | `/robots.txt` has `Allow: /` and an absolute Sitemap line. `/favicon.ico` exists. `/404.html` is `noindex` |

## Gate B: Lighthouse 100 on every sitemap page (automatic)

Mobile and desktop. Performance, Accessibility, Best Practices and SEO are each **100**. Performance takes the
median of three runs. The site is served over HTTPS as `siaran.my`, so nothing local is counted against it.

## Gate C: what a reviewer reads (by hand, every new or changed page)

1. **Answer first.** The first 40–60 words answer the page's question and name Siar as a unified social media API.
2. **Every claim about Siar is true today.** It is checked against the code and `research/siar-truth.md`:
   network status comes from `status.ts`, prices from `plans.ts`, and nothing in `messaging.md` §10 is claimed.
3. **Every rival fact** links to the vendor's own page and says "checked 12 November 2026".
4. **No JavaScript:** `curl` each page and the full answer, tables and links are in the HTML.
5. **The browser at Fakhrul's sizes:** 1920 × 1080 at DPR 1, a phone at 390 × 844, and dark mode. Nothing
   overlaps, clips or scrolls sideways. The look follows the Siar house style, with no vibe-coded patterns
   (`messaging.md` §8 and the BUILD_BRIEF rules).
6. **Rich results:** each template type passes a schema.org validator with zero errors.

## Gate D: live, only after Fakhrul says deploy

- Hosts: `http://`, `www.` and the trailing-slash form each reach the clean `https://siaran.my/...` URL in **one 301**.
  Today nginx serves `/pricing/` with a 200 (the canonical points to the clean URL, but the baseline wants a 301).
- Fourteen crawler user-agents get a 200 with no challenge. HSTS is on.
- The live re-run of Gates A and B finds nothing new.
- Search Console: add the property, submit the sitemap, and run URL Inspection live tests on one page per template.
- IndexNow pings for the new URLs (`apps/site/scripts/indexnow.mjs`), and Bing Webmaster gets the sitemap.

## How to run A and B

```bash
node /private/tmp/claude-501/-Users-fakhrul--claude-spares-spare-Q7fCUZ/3dce9d9c-4257-4588-953b-b9506e880be7/scratchpad/siar-accept/accept.mjs
```

The script builds into its own folder, runs Gate A, then runs Gate B on every sitemap URL (about 30–40 minutes).
`--no-lh` runs Gate A only. `--only=/pricing,/platforms` limits Lighthouse to those pages. The report is
`report.md` next to the script. It exits 0 only when there are zero failures. Before handover, port it into
the repo as `apps/site/scripts/seo-gate.mjs` with its own dev dependencies (cheerio, lighthouse,
chrome-launcher), so the gate outlives this branch.
