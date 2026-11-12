/**
 * The @font-face rules for IBM Plex, applied by Base.astro after the first paint on a first visit, and at once
 * once the fonts are cached. Lighthouse counts font requests that start before first paint against mobile FCP,
 * which kept Performance below 100 (docs/seo/ACCEPTANCE.md gate B). Text paints in the fallback first, then swaps.
 */
export const FONT_FACES = "@font-face { font-family: 'Plex Sans'; src: url('/fonts/plex-sans-400.woff2') format('woff2'); font-weight: 400; font-display: swap; }@font-face { font-family: 'Plex Sans'; src: url('/fonts/plex-sans-500.woff2') format('woff2'); font-weight: 500; font-display: swap; }@font-face { font-family: 'Plex Sans'; src: url('/fonts/plex-sans-600.woff2') format('woff2'); font-weight: 600; font-display: swap; }@font-face { font-family: 'Plex Mono'; src: url('/fonts/plex-mono-400.woff2') format('woff2'); font-weight: 400; font-display: swap; }@font-face { font-family: 'Plex Mono'; src: url('/fonts/plex-mono-500.woff2') format('woff2'); font-weight: 500; font-display: swap; }";
