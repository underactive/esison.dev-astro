// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	// TODO: Update site URL to production domain (e.g., https://esison.dev) for correct canonical URLs and sitemap generation.
	site: 'https://example.com',
	integrations: [mdx(), sitemap(), vue()],
	vite: {
		plugins: [tailwindcss()],
	},
});
