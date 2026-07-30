import type { APIContext } from 'astro';

// Generated rather than kept in public/ so the Sitemap directive can use the
// real site URL, which comes from PUBLIC_SITE_URL at build time.
export async function GET(context: APIContext) {
	const sitemapURL = new URL('sitemap-index.xml', context.site);

	const body = `# esison.dev

User-agent: *
Allow: /

# Blog posts are still Astro-starter placeholder text. They are kept out of
# search results by a "noindex, nofollow" meta tag on the pages themselves
# (src/pages/blog/index.astro and src/layouts/BlogPost.astro), and by excluding
# /blog from the sitemap in astro.config.mjs.
#
# Deliberately NOT "Disallow: /blog/". A disallowed URL is never fetched, so a
# crawler would never see the noindex, and Google can still index a blocked URL
# it discovers linked elsewhere. Blocking here would make the pages harder to
# de-index, not easier. Drop the noindex tags when real posts ship.

Sitemap: ${sitemapURL.href}
`;

	return new Response(body, {
		headers: { 'Content-Type': 'text/plain; charset=utf-8' },
	});
}
