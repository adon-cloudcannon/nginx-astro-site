import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import AutoImport from 'astro-auto-import';

// https://astro.build/config
export default defineConfig({
    integrations: [
        AutoImport({
            imports: [
            '@components/NXT_Hint.astro',
            ],
        }),
        mdx()
    ],

    markdown: {
        syntaxHighlight: 'prism',
      },
});