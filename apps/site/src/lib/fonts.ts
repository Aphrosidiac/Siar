/**
 * The @font-face rules for IBM Plex, applied by Base.astro after the first paint on a first visit, and at once
 * once the fonts are cached. Lighthouse counts font requests that start before first paint against mobile FCP,
 * which kept Performance below 100 (docs/seo/ACCEPTANCE.md gate B). `optional` means a page never swaps fonts
 * after it has painted (no layout shift): the first page in a tab paints in the system sans while Plex downloads
 * into the cache, and every later page in the tab uses Plex from the cache at once.
 */
export const FONT_FACES = "@font-face { font-family: 'Plex Sans'; src: url('/fonts/plex-sans-400.woff2') format('woff2'); font-weight: 400; font-display: optional; }@font-face { font-family: 'Plex Sans'; src: url('/fonts/plex-sans-500.woff2') format('woff2'); font-weight: 500; font-display: optional; }@font-face { font-family: 'Plex Sans'; src: url('/fonts/plex-sans-600.woff2') format('woff2'); font-weight: 600; font-display: optional; }@font-face { font-family: 'Plex Mono'; src: url('/fonts/plex-mono-400.woff2') format('woff2'); font-weight: 400; font-display: optional; }@font-face { font-family: 'Plex Mono'; src: url('/fonts/plex-mono-500.woff2') format('woff2'); font-weight: 500; font-display: optional; }";

/** The files behind FONT_FACES, fetched into the cache after first paint on a tab's first page. */
export const FONT_FILES = [...FONT_FACES.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]);
