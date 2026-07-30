export const NAV_PAGES = ['home', 'about', 'blog'] as const;
export type NavPage = (typeof NAV_PAGES)[number];

export interface NavItem {
	page: NavPage;
	label: string;
	href: string;
}

/**
 * Blog is deliberately absent while its posts are still Astro-starter placeholder
 * text. The routes, RSS feed and sitemap entries all still work — this only hides
 * the header link. Restore the entry once there is real writing; `NavPage` keeps
 * 'blog' so the blog pages can still mark themselves current.
 */
export const NAV_ITEMS: NavItem[] = [
	{ page: 'home', label: 'home', href: '/' },
	{ page: 'about', label: 'about', href: '/about/' },
];
