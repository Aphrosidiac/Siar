import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

const domain = process.env.SITE_DOMAIN || 'siar.dev';

export default defineConfig({
  site: `https://${domain}`,
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/404') && !page.endsWith('/404/') })],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false, wrap: false },
  },
  server: { port: 4290 },
  vite: { server: { fs: { allow: ['../..'] } } },
});
