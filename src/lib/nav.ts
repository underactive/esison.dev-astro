export const NAV_PAGES = ['home', 'about', 'blog'] as const;
export type NavPage = (typeof NAV_PAGES)[number];

export interface NavItem {
	page: NavPage;
	label: string;
	href: string;
}

export const NAV_ITEMS: NavItem[] = [
	{ page: 'home', label: 'home', href: '/' },
	{ page: 'about', label: 'about', href: '/about/' },
	{ page: 'blog', label: 'blog', href: '/blog/' },
];
