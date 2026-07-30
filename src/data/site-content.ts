import type { GitHubProject } from '../lib/github-projects';

// The live pages in src/pages/ remain the source of truth until a design-lab
// winner replaces them. Copy edited there must be mirrored here and in
// docs/content-inventory.md. See docs/exec-plans/tech-debt-tracker.md.

/**
 * A run of prose that carries meaning a design may want to style specially.
 * The homepage bio's `<sarcastic-quote>full-stack developer</sarcastic-quote>`
 * gag is stored as segments rather than an HTML string so each design decides
 * how to render it — fake tag syntax, italic small-caps, a boxed inline note —
 * without one design's markup leaking into the others.
 */
export type InlineSegment =
	| { kind: 'text'; value: string }
	| { kind: 'sarcasticQuote'; value: string }
	| { kind: 'aside'; value: string };

export interface RichParagraph {
	id: string;
	segments: InlineSegment[];
}

export interface Tagline {
	text: string;
	durationSeconds: number;
}

export interface CtaLink {
	label: string;
	href: string;
}

export interface SkillGroup {
	id: 'frontend' | 'backend' | 'serverless-ops';
	title: string;
	skills: string[];
}

export type ProjectMedia =
	| { kind: 'image'; src: string }
	| { kind: 'video'; src: string };

export interface FeaturedProject {
	id: string;
	name: string;
	summary: string;
	notes: string[];
	tags: string[];
	href: string;
	linkLabel: string;
	media: ProjectMedia;
}

export interface HistoryEntry {
	company: string;
	period: string;
	startYear: number;
	endYear: number | null;
}

export interface Photo {
	src: string;
	alt: string;
	caption: string;
}

export interface SocialLink {
	label: string;
	handle: string;
	href: string;
	network: 'mastodon' | 'twitter' | 'github';
}

export interface ModalCopy {
	id: 'cv' | 'contact';
	title: string;
	body: string[];
	primaryAction: string;
}

/**
 * Mirrors the `blog` collection schema in content.config.ts plus a slug.
 * Adding fields the real schema lacks would let a winning design depend on an
 * unplanned content migration, so this stays in lockstep with the collection.
 */
export interface MockBlogPost {
	slug: string;
	title: string;
	description?: string;
	pubDate: Date;
	updatedDate?: Date;
	heroImage?: string;
}

export interface HomeContent {
	heroName: string;
	taglines: Tagline[];
	heroCtas: CtaLink[];
	aboutHeading: string;
	aboutBio: RichParagraph;
	skillGroups: SkillGroup[];
	aboutCta: { blurb: string; link: CtaLink };
	projectsHeading: string;
	projectsSubhead: string;
	featuredProjects: FeaturedProject[];
	historyHeading: string;
	history: HistoryEntry[];
}

export interface AboutContent {
	heading: string;
	workStory: string[];
	personalStory: string[];
	collaborationCta: {
		heading: string;
		blurb: string;
		actions: CtaLink[];
	};
	photos: Photo[];
}

export interface BlogIndexContent {
	heading: string;
	subhead: string;
	readMoreLabel: string;
	emptyState: { heading: string; blurb: string };
}

export interface SharedContent {
	logo: string;
	copyright: (year: number) => string;
	socials: SocialLink[];
	github: {
		heading: string;
		profileUrl: string;
		profileLinkLabel: string;
		emptyState: string;
		repoLinkLabel: string;
		liveSiteLinkLabel: string;
		lastPushLabel: string;
	};
	modals: ModalCopy[];
}

export interface SiteContent {
	meta: { siteTitle: string; siteDescription: string; ownerName: string };
	home: HomeContent;
	about: AboutContent;
	blog: BlogIndexContent;
	shared: SharedContent;
	fixtures: {
		githubRepos: GitHubProject[];
		blogPosts: MockBlogPost[];
	};
}

export const siteContent: SiteContent = {
	meta: {
		siteTitle: 'esison.dev',
		siteDescription: 'Eric Sison: Full-Stack Developer',
		ownerName: 'Eric Sison',
	},

	home: {
		heroName: 'Eric Sison',
		taglines: [
			{ text: '// web developer', durationSeconds: 10 },
			{ text: '// making computers do cool things since 1983', durationSeconds: 3 },
			{ text: '// 改善 mindset', durationSeconds: 3 },
		],
		heroCtas: [
			{ label: 'About Me', href: '#about' },
			{ label: 'View My Work', href: '#portfolio' },
			{ label: 'My History', href: '#history' },
		],
		aboutHeading: 'About Me',
		aboutBio: {
			id: 'home-bio',
			segments: [
				{
					kind: 'text',
					value: 'I’m a seasoned interactive webdev veteran. For SEO purposes, I’m a ',
				},
				{ kind: 'sarcasticQuote', value: 'full-stack developer' },
				{ kind: 'text', value: ' ' },
				{ kind: 'aside', value: '(even though new tech gets constantly added to said stack)' },
				{ kind: 'text', value: '.' },
			],
		},
		skillGroups: [
			{
				id: 'frontend',
				title: 'Frontend Development',
				skills: ['Vue.js', 'TypeScript', 'Angular.js', 'Tailwind CSS'],
			},
			{
				id: 'backend',
				title: 'Backend Development',
				skills: ['Supabase', 'Node.js', 'Perl', 'Python', 'PostgreSQL'],
			},
			{
				id: 'serverless-ops',
				title: 'Serverless / Ops',
				skills: ['AWS', 'GCP', 'Netlify', 'Docker', 'CI/CD'],
			},
		],
		aboutCta: {
			blurb: 'My origin story, career path, contact info.',
			link: { label: 'More about me', href: '/about' },
		},
		projectsHeading: 'Featured Projects',
		projectsSubhead: 'Here are some projects that I’ve worked on.',
		featuredProjects: [
			{
				id: 'underactive',
				name: 'underactive.net',
				summary: 'My personal weblog that I’ve had since 1999',
				notes: [
					'The content has been lost to the sands of time, except for a SQL dump from b2 blog (precursor to Wordpress) from the early 2000s. I might restore it with some kind of cringe disclaimer. But then there\u2019s also the time when I used Livejournal and I know that stuff is gone. And then there\u2019s the time when microblogging was big and I suppose I can post my old Twitter posts but it\u2019s pretty noisy. We\u2019ll see.',
				],
				tags: ['Ghost'],
				href: 'https://underactive.net',
				linkLabel: 'Go to Site',
				media: {
					kind: 'image',
					src: 'https://underactive.net/content/images/size/w2000/2024/04/15771985113_98687dda36.jpg',
				},
			},
			{
				id: 'onlyfjs',
				name: 'OnlyFJs',
				summary:
					'I made a TikTok clone for a work project. This is a stripped down version utilizing the important bits of the project (intersection observers, web audio API, lazy loading, etc). I built this app without any AI assistance.',
				notes: [],
				tags: ['Vue.js', 'TypeScript'],
				href: 'https://onlyfjs.net',
				linkLabel: 'Go to Site',
				media: { kind: 'video', src: '/videos/onlyfjs_out.mp4' },
			},
			{
				id: 'amfm',
				name: 'AMFM.video',
				summary:
					'I didn’t want to fall behind the AI bandwagon, so I created this app from the ground up using Cursor. Inspired by PoolSuite, this app uses music and visuals to set the vibe and help me code.',
				notes: [
					'Note: As this was just a code-experiment, it’s only been tested on macOS Safari and Chromium-based browsers.',
					'Also: This app uses embeded YouTube videos, and Google is clamping down on downloader apps, you might see a "Sign in to confirm you\u2019re not a bot" prompt in place of the video. Disconnecting from your VPN usually fixes this.',
				],
				tags: ['Nuxt', 'TypeScript'],
				href: 'https://amfm.video/',
				linkLabel: 'Go to Site',
				media: { kind: 'video', src: '/videos/flowstack_out.mp4' },
			},
		],
		historyHeading: 'History | briefly',
		history: [
			{ company: 'Hypermedia Systems', period: '2005-Present', startYear: 2005, endYear: null },
			{ company: 'Sony Online Entertainment', period: '2002-2005', startYear: 2002, endYear: 2005 },
			{ company: 'Sony Computer Entertainment America', period: '2002', startYear: 2002, endYear: 2002 },
			{ company: 'OnAir Streaming Networks', period: '2000-2001', startYear: 2000, endYear: 2001 },
			{ company: 'Digital Entertainment Network', period: '1999-2000', startYear: 1999, endYear: 2000 },
			{ company: 'Learning Tree International', period: '1997-1999', startYear: 1997, endYear: 1999 },
		],
	},

	about: {
		heading: 'About Me',
		workStory: [
			'From a young age, I have always tinkered with computers—starting with learning BASIC on my Atari 400 and crafting "Mad Libs" programs as well as creating mini "Choose Your Own Adventure" stories. Over my lifetime, I\u2019ve held the firm belief that computers should be easy to use and fun. These two principles are deeply interwoven and continue to guide my approach to crafting experiences for people on the web.',
			'I am comfortable operating across various contexts, from startups to corporate organizations. I\u2019ve had the pleasure of riding the dot-com bubble and the equal displeasure of experiencing the bubble burst and crashing down to earth. I\u2019ve pursued roles I never expected, spanning technical support, software testing, and development. Drawing on these experiences, I\u2019ve acquired the institutional knowledge to design systems that simplify and enhance work for those in each stage of the software development lifecycle.',
			'I believe mistakes are some of the most valuable learning opportunities, leading to the greatest growth. I believe that things worth doing are hard. Throughout each stage of my career, I\u2019ve been fortunate to work with people who have served as mentors and guides. Their guidance has shaped not just my technical skills, but also my approach to collaboration and problem-solving. I strive to be that person for others.',
		],
		personalStory: [
			'Outside of work, I\u2019m a dog dad to the sweetest Frenchie, Jojo. In my free time, I like to work on my FJ Cruiser, whether it\u2019s wrenching or modifying it for overland adventures. I enjoy driving the less-traveled roads, exploring the backcountry, popping up the tent, and doing some late-night stargazing. It helps balance my work/life by providing some much-needed solitude and a chance for reflection.',
		],
		collaborationCta: {
			heading: 'Let’s Work Together',
			blurb:
				'I’m always interested in discussing new opportunities where I can help your product or brand shine.',
			actions: [
				{ label: 'View My CV', href: '#cv' },
				{ label: 'Contact Me', href: '#contact' },
			],
		},
		photos: [
			{ src: '/images/jojo.jpg', alt: 'Jojo the French Bulldog', caption: 'Introducing Jojo' },
			{
				src: '/images/fj_stars.jpg',
				alt: 'FJ Cruiser under starry night sky',
				caption: 'Late night stargazing',
			},
		],
	},

	blog: {
		heading: 'My Blog',
		subhead:
			'Thoughts on web development, technology trends, and insights from my coding journey',
		readMoreLabel: 'Read more',
		emptyState: { heading: 'No posts yet', blurb: 'Check back later for new content!' },
	},

	shared: {
		logo: 'esison.dev',
		copyright: (year) => `© ${year} Eric Sison. All rights reserved.`,
		socials: [
			{
				network: 'mastodon',
				handle: '@underactive',
				href: 'https://mastodon.social/@underactive',
				label: 'Follow me on Mastodon',
			},
			{
				network: 'twitter',
				handle: '@underactive',
				href: 'https://twitter.com/underactive',
				label: 'Follow me on Twitter',
			},
			{
				network: 'github',
				handle: 'underactive',
				href: 'https://github.com/underactive',
				label: 'Go to my GitHub repo',
			},
		],
		github: {
			heading: 'Public Repos on GitHub',
			profileUrl: 'https://github.com/underactive',
			profileLinkLabel: 'View all repositories on GitHub',
			emptyState: 'No public repositories are currently tagged with spotlight.',
			repoLinkLabel: 'View Repo',
			liveSiteLinkLabel: 'Live Site',
			lastPushLabel: 'Last push',
		},
		modals: [
			{
				id: 'cv',
				title: 'My Curriculum Vitae',
				body: [
					'I’m gainfully employed at my current company, so the urgency to update my CV is not yet there.',
					'That said, I’m always looking for new opportunities to grow and learn, so feel free to reach out to me if you think I’d be a good fit for your team!',
				],
				primaryAction: 'Close',
			},
			{
				id: 'contact',
				title: 'Contact Information',
				body: [
					'Please complete verification to view contact information:',
					'Additional verification required for phone access:',
				],
				primaryAction: 'Close',
			},
		],
	},

	fixtures: {
		// Deterministic stand-ins for build-time GitHub data. Typed with the real
		// GitHubProject interface so a shape change here fails to compile.
		githubRepos: [
			{
				name: 'astro-esison-dev',
				description: 'Personal portfolio and blog. Astro 6, Vue 3 islands, deployed on Netlify.',
				repoUrl: 'https://github.com/underactive/astro-esison-dev',
				homepageUrl: 'https://esison.dev',
				language: 'Astro',
				topics: ['spotlight', 'astro', 'vue'],
				stars: 12,
				pushedAt: new Date('2026-07-21T00:00:00Z'),
			},
			{
				name: 'onlyfjs',
				description:
					'Short-form video feed built on intersection observers and the Web Audio API. No AI assistance.',
				repoUrl: 'https://github.com/underactive/onlyfjs',
				homepageUrl: 'https://onlyfjs.net',
				language: 'Vue',
				topics: ['spotlight', 'web-audio'],
				stars: 3,
				pushedAt: new Date('2026-06-02T00:00:00Z'),
			},
			{
				name: 'amfm-video',
				description: 'Music and visuals to set the vibe while coding. Built with Cursor.',
				repoUrl: 'https://github.com/underactive/amfm-video',
				homepageUrl: 'https://amfm.video',
				language: 'TypeScript',
				topics: ['spotlight', 'nuxt'],
				stars: 1,
				pushedAt: new Date('2026-05-14T00:00:00Z'),
			},
			{
				name: 'perl-legacy-toolbelt',
				description: 'No description provided yet.',
				repoUrl: 'https://github.com/underactive/perl-legacy-toolbelt',
				language: 'Perl',
				topics: ['spotlight'],
				stars: 0,
				pushedAt: new Date('2026-02-08T00:00:00Z'),
			},
			{
				name: 'fj-overland-trip-planner',
				description:
					'Route and campsite planner for backcountry overland trips. Offline-first with map tile caching.',
				repoUrl: 'https://github.com/underactive/fj-overland-trip-planner',
				language: 'TypeScript',
				topics: ['spotlight', 'maps', 'offline-first', 'pwa'],
				stars: 47,
				pushedAt: new Date('2026-07-25T00:00:00Z'),
			},
			{
				name: 'kaizen-cli',
				description: 'Small daily-improvement tracker for the terminal.',
				repoUrl: 'https://github.com/underactive/kaizen-cli',
				homepageUrl: 'https://esison.dev',
				language: 'Python',
				topics: ['spotlight', 'cli'],
				stars: 1,
				pushedAt: new Date('2026-04-30T00:00:00Z'),
			},
		],

		// Stress cases on purpose: a very long title, a post with no description,
		// a post with an updatedDate, one without a heroImage, and 6 entries so
		// the featured-first-card treatment is exercised.
		blogPosts: [
			{
				slug: 'twenty-five-years-of-shipping',
				title: 'Twenty-Five Years of Shipping: What the Dot-Com Crash Taught Me About Building Software That Lasts',
				description:
					'The bubble burst two years into my career. Here is what survived the fall and what I stopped believing in.',
				pubDate: new Date('2026-07-18T00:00:00Z'),
				heroImage: '/images/blog/shipping.jpg',
			},
			{
				slug: 'kaizen-for-one',
				title: 'Kaizen for One',
				description:
					'Continuous improvement is usually pitched at factories and teams. It works just as well on a single developer.',
				pubDate: new Date('2026-06-27T00:00:00Z'),
				updatedDate: new Date('2026-07-04T00:00:00Z'),
				heroImage: '/images/blog/kaizen.jpg',
			},
			{
				slug: 'basic-on-an-atari-400',
				title: 'BASIC on an Atari 400',
				pubDate: new Date('2026-05-30T00:00:00Z'),
				heroImage: '/images/blog/atari.jpg',
			},
			{
				slug: 'building-onlyfjs-without-ai',
				title: 'Building OnlyFJs Without AI',
				description:
					'Intersection observers, the Web Audio API, and lazy loading — by hand, on purpose.',
				pubDate: new Date('2026-04-12T00:00:00Z'),
				heroImage: '/images/blog/onlyfjs.jpg',
			},
			{
				slug: 'the-content-lost-to-time',
				title: 'The Content Lost to Time',
				description:
					'A b2 blog SQL dump, a dead LiveJournal, and an archive of microblog noise. On deciding what to restore.',
				pubDate: new Date('2026-02-19T00:00:00Z'),
			},
			{
				slug: 'perl-is-still-here',
				title: 'Perl Is Still Here',
				description: 'It runs more of your infrastructure than you think.',
				pubDate: new Date('2026-01-08T00:00:00Z'),
				heroImage: '/images/blog/perl.jpg',
			},
		],
	},
};
