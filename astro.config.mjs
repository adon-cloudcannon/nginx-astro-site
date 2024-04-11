import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import AutoImport from 'astro-auto-import';

// https://astro.build/config
export default defineConfig({
    compressHTML: false,
    integrations: [
        AutoImport({
            imports: [
                '@components/NXT_Hint.astro',
                '@components/Code_Block.astro',
                '@components/Test_Component.astro'
            ],
        }),
        mdx()
    ],

    markdown: {
        syntaxHighlight: 'prism',
      },
});