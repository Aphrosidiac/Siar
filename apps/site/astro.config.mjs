import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { updatedAt } from './src/lib/updated.mjs';

const domain = process.env.SITE_DOMAIN || 'siaran.my';

export default defineConfig({
  site: `https://${domain}`,
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !/\/(404|og-card)\/?$/.test(page),
      serialize: (item) => {
        const d = updatedAt(new URL(item.url).pathname);
        return d ? { ...item, lastmod: d } : item;
      },
    }),
  ],
  markdown: {
    shikiConfig: { themes: { light: 'github-light', dark: 'github-dark' }, defaultColor: false, wrap: false },
  },
  server: { port: 4290 },
  vite: { server: { fs: { allow: ['../..'] } } },
});
