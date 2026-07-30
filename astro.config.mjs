// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: process.env.PUBLIC_SITE_URL || 'https://example.com',
	integrations: [mdx(), sitemap(), vue()],
	markdown: {
		// Shiki writes its theme background and token colours as inline styles, so
		// the theme choice — not CSS — decides how code blocks look. `vesper` is warm
		// amber on near-black, which sits inside the Terminal palette instead of
		// fighting it (the default `github-dark` is slate blue).
		shikiConfig: {
			theme: 'vesper',
		},
	},
});
