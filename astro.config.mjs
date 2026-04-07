// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: process.env.PUBLIC_SITE_URL || 'https://example.com',
	integrations: [mdx(), sitemap(), vue()],
	vite: {
		plugins: [tailwindcss()],
	},
});
