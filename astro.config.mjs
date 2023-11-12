import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { rehypeHeadingIds } from '@astrojs/markdown-remark';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import preact from '@astrojs/preact';

// https://astro.build/config
export default defineConfig({
  site: 'https://blog.petar-cv.com',
  markdown: {
    rehypePlugins: [
      rehypeHeadingIds,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'wrap',
        },
      ],
    ],
  },
  integrations: [mdx(), sitemap(), tailwind(), preact()],
});
