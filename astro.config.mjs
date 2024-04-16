import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import AutoImport from 'astro-auto-import';

// https://astro.build/config
export default defineConfig({
    compressHTML: false,
    integrations: [
        AutoImport({
            imports: [
                '@components/Code_Block.astro',
                '@components/Note.astro'
            ],
        }),
        mdx()
    ],

    markdown: {
        syntaxHighlight: 'prism',
      },
});