# Building the SEO pages: the brief every builder follows

Branch `feat/seo-landing` in the worktree `/Users/fakhrul/Desktop/dev/Siar-seo-research`. Site: `apps/site` (Astro).

## Read first

- `docs/seo/messaging.md` §1 (line, canonical paragraph), §3 (pillars, allowed wording), §6 (voice, banned words,
  numbers, CTAs), §8 (page furniture), §9 (status lines), §10 (never claim), §11 (naming competitors).
- `docs/seo/strike-plan.md` §5.0 (rules for every page) and the rows for your pages.
- Your pages' finished copy in `docs/seo/landing-copy/` when it exists. Use it; fix anything that breaks the rules
  below. Where no copy file exists, write the copy yourself from `strike-plan.md`, `messaging.md`,
  `competitors.md`, `keyword-map.md` and `research/siar-truth.md`.

## Building blocks

- Layout for every new long-form page: `apps/site/src/layouts/Article.astro` (metaTitle, h1, description, kicker,
  updated, crumbs, lead, faq, jsonLd, actions). It renders the one H1, the visible "Updated" date, BreadcrumbList,
  TechArticle and FAQPage (only for the `faq` it renders).
- Network status: `apps/site/src/lib/status.ts` only (`NETWORK_STATUS`, `OPEN_LIST`, `CANONICAL`, `DM_LINE`,
  `TOOLING_LINE`, `OPENAPI_LINE`, `STATUS_CHECKED`). Never type a network's status by hand.
- Prices and caps: `apps/site/src/lib/plans.ts` (`PLANS`, `money`, `priceOf`, `formatPrice`, `PRICE_LOCK`,
  `RESOURCE_LIMITS`). Never type a Siar price by hand.
- Networks: `apps/site/src/lib/networks.ts` (`NETWORKS`, `bySlug`, errors per adapter).
- Other components: `CodeBlock`, `CodeTabs`, `NetIcon`, `Faq`, `Cta`. CSS classes: `.table-wrap` around tables,
  `.small`, `.muted`. Tokens only: `var(--text)`, `var(--text-subtle)`, `var(--border)`, `var(--bg-elevated)`,
  `var(--fs-11…38)`. No raw colours, so dark mode works.
- Links: `SIGNUP_URL` from `apps/site/src/config.ts` for "Start with 20 free posts" / "Get an API key".

## Rules

1. Answer first: the first 40–60 words answer the page's question and name "Siar, a unified social media API".
2. Titles carry the category; never "Siar" alone. ≤ 60 characters where possible. Unique titles and descriptions
   (descriptions 120–160 characters).
3. Every rival fact: a link to the vendor's own page and "checked 12 November 2026", kept in
   `apps/site/src/data/rivals.ts` (value, url, checked) when it appears on more than one page.
4. Schema only for what is visible. No AggregateRating, Review, testimonials, customer counts, speed or uptime.
5. Look: no numbered eyebrows, no stat rows, no mono-caps decoration, no arrow glyphs in CTAs, no chips everywhere.
   Real data (tables, requests, responses) leads. Examples are labelled "Example" and use open networks only.
6. Headings in sentence case. US spelling. Short sentences.
7. Link every new page to its parents and siblings as `strike-plan.md` §6 says, with descriptive anchors. The exact
   anchor "unified social media API" points only to `/`.

## Working together

Several builders share this worktree. Create or edit only the files your brief names. Do not commit, do not run
`git` commands that change state, and build into your own folder:
`pnpm --filter @siar/site exec astro build --outDir /private/tmp/siar-build-<you>`.

## Acceptance rules (docs/seo/ACCEPTANCE.md, added 12 Nov): these decide "done"

- **No FAQPage, HowTo or QAPage JSON-LD anywhere.** Keep visible FAQs as question headings. Article.astro no longer
  emits FAQPage; don't call `faqLd` in new code.
- `<title>` 25–60 characters; meta description 120–160 characters; both unique site-wide.
- Exactly one `<h1>`; no heading level skipped inside `<main>` (h1 → h2 → h3, never h1 → h3).
- Every page except `/` has a BreadcrumbList whose last item is the canonical URL.
- Links: canonical form (no trailing slash, no `.html`, lowercase); every `#fragment` exists on the target page;
  descriptive anchor text (never "click here", "learn more", empty). Only link to pages that exist.
- Images: `alt` (or `alt=""` if decorative), `width` and `height`.
- Banned words (messaging.md §6) outside rival tables: e.g. "every network", "all networks", "free plan",
  "seamless", "powerful", "reliable", "only", "cheapest", "fast", "in minutes", "unlimited accounts".
- No `{{`, TODO, TBD, lorem, `undefined`, `NaN` in output. Raw HTML under 1 MB per page.
- Colour contrast must pass WCAG AA (Lighthouse accessibility 100): don't put `--text-subtle`/`--text-faint` text
  on tinted backgrounds or below 14px without checking.
