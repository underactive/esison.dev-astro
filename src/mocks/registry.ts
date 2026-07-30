// Data only — no component imports. Astro collects CSS by import graph, so a
// registry that imported the 5 mock layouts would inject all 5 stylesheets into
// every design-lab page. Routes under src/pages/design-lab/<slug>/ import their
// own design's components directly. See docs/exec-plans/active/design-lab.md.

export const DESIGN_SLUGS = ['terminal', 'editorial', 'retro80s', 'dossier', 'aurora'] as const;
export type DesignSlug = (typeof DESIGN_SLUGS)[number];

export const MOCK_PAGES = ['home', 'about', 'blog'] as const;
export type MockPage = (typeof MOCK_PAGES)[number];

export interface DesignEntry {
	slug: DesignSlug;
	label: string;
	blurb: string;
	/** [background, accent] — drives the chooser's swatch chip. */
	swatch: [string, string];
	fonts: string[];
	mode: 'light' | 'dark';
}

export const DESIGN_REGISTRY: Record<DesignSlug, DesignEntry> = {
	terminal: {
		slug: 'terminal',
		label: 'Terminal',
		blurb: 'Monospace, scanlines, amber phosphor. Reads like a VT100 session.',
		swatch: ['#0b0b0b', '#ffb000'],
		fonts: ['JetBrains Mono'],
		mode: 'dark',
	},
	editorial: {
		slug: 'editorial',
		label: 'Editorial',
		blurb: 'Serif headlines, asymmetric grid, drop caps. Print magazine on the web.',
		swatch: ['#faf7f2', '#1a1a1a'],
		fonts: ['Fraunces', 'Newsreader'],
		mode: 'light',
	},
	retro80s: {
		slug: 'retro80s',
		label: 'Retro 80s',
		blurb: 'Atari-era sunset magenta and cyan, pixel type, CRT bezel, chrome headlines.',
		swatch: ['#2b0f3a', '#ff2e97'],
		fonts: ['VT323', 'Orbitron'],
		mode: 'dark',
	},
	dossier: {
		slug: 'dossier',
		label: 'Dossier',
		blurb: 'Near-monochrome, hairline accent, dense info design, career timeline as spine.',
		swatch: ['#ffffff', '#c8102e'],
		fonts: ['IBM Plex Sans', 'IBM Plex Mono'],
		mode: 'light',
	},
	aurora: {
		slug: 'aurora',
		label: 'Aurora',
		blurb: 'Dark base, animated gradient mesh, frosted glass cards. Modern SaaS.',
		swatch: ['#0a0a14', '#7c5cff'],
		fonts: ['Space Grotesk', 'Inter'],
		mode: 'dark',
	},
};

export const PAGE_LABELS: Record<MockPage, string> = {
	home: 'Home',
	about: 'About',
	blog: 'Blog',
};

export function mockPageUrl(slug: DesignSlug, page: MockPage): string {
	return page === 'home' ? `/design-lab/${slug}/` : `/design-lab/${slug}/${page}/`;
}

export function isDesignSlug(value: string): value is DesignSlug {
	return (DESIGN_SLUGS as readonly string[]).includes(value);
}

export function isMockPage(value: string): value is MockPage {
	return (MOCK_PAGES as readonly string[]).includes(value);
}
