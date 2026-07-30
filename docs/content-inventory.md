# Content Inventory

> Extracted 2026-07-29 from `src/pages/`, `src/components/` and `src/consts.ts`.
> Mirrored as typed data in [`src/data/site-content.ts`](../src/data/site-content.ts).
>
> **The live pages remain the source of truth** until a design-lab winner replaces
> them. If you edit copy in `src/pages/index.astro` or `about.astro`, mirror it here
> and in `site-content.ts`. See the drift entry in
> [tech-debt-tracker.md](exec-plans/tech-debt-tracker.md).

---

## Site meta

| Key | Value | Source |
|---|---|---|
| `SITE_TITLE` | `esison.dev` | `src/consts.ts` |
| `SITE_DESCRIPTION` | `Eric Sison: Full-Stack Developer` | `src/consts.ts` |
| Owner name | `Eric Sison` | footer, hero |
| About page meta title | `About Me` | `src/pages/about.astro` |
| About page meta description | `Learn more about my journey as a developer and the experiences that shape my work.` | `src/pages/about.astro` |
| Blog page meta title | `Blog - esison.dev` | `src/pages/blog/index.astro` |

---

## Homepage — `src/pages/index.astro`

### Hero

**Name:** `Eric Sison`

**Typewriter taglines** (cycled, with per-line duration in seconds):

| Text | Duration |
|---|---|
| `// web developer` | 10 |
| `// making computers do cool things since 1983` | 3 |
| `// 改善 mindset` | 3 |

**CTA buttons** (in-page anchors):

| Label | Href |
|---|---|
| `About Me` | `#about` |
| `View My Work` | `#portfolio` |
| `My History` | `#history` |

### About section

**Heading:** `About Me`

**Bio** — a single paragraph containing inline markup. Rendered today as
`<span class="terminal-code">` with nested `<span class="tag">` elements around
literal `<` `>` characters plus a `.glow-text` span. Structurally it is three parts:

1. plain text — `I'm a seasoned interactive webdev veteran. For SEO purposes, I'm a `
2. **sarcastic quote** — `full-stack developer` (currently drawn as a fake HTML tag,
   `<sarcastic-quote>full-stack developer</sarcastic-quote>`, in a terminal chip)
3. **aside**, smaller type — `(even though new tech gets constantly added to said stack)`

The tag-syntax rendering is *one design's interpretation* of the joke, not the
content. Stored as segments so each design can render it differently — literal tag
syntax, italic small-caps, a hairline-boxed inline note, and so on.

**Skill cards** (3, each with a heading and tag chips):

| Group | Heading | Skills |
|---|---|---|
| frontend | `Frontend Development` | Vue.js, TypeScript, Angular.js, Tailwind CSS |
| backend | `Backend Development` | Supabase, Node.js, Perl, Python, PostgreSQL |
| serverless-ops | `Serverless / Ops` | AWS, GCP, Netlify, Docker, CI/CD |

**CTA box:**
- Blurb — `My origin story, career path, contact info.`
- Link — `More about me` → `/about`

### Featured Projects section

**Heading:** `Featured Projects`
**Subhead:** `Here are some projects that I've worked on.`

All three link labels are `Go to Site`.

#### 1. underactive.net
- **Href:** `https://underactive.net`
- **Summary:** `My personal weblog that I've had since 1999*`
- **Note (footnote, marked `*`):** `The content has been lost to the sands of time,
  except for a SQL dump from b2 blog (precursor to Wordpress) from the early 2000s. I
  might restore it with some kind of cringe disclaimer. But then there's also the time
  when I used Livejournal and I know that stuff is gone. And then there's the time when
  microblogging was big and I suppose I can post my old Twitter posts but it's pretty
  noisy. We'll see.`
- **Tags:** Ghost
- **Media:** image — `https://underactive.net/content/images/size/w2000/2024/04/15771985113_98687dda36.jpg` (external)

#### 2. OnlyFJs
- **Href:** `https://onlyfjs.net`
- **Summary:** `I made a TikTok clone for a work project. This is a stripped down
  version utilizing the important bits of the project (intersection observers, web
  audio API, lazy loading, etc). I built this app without any AI assistance.`
- **Notes:** none
- **Tags:** Vue.js, TypeScript
- **Media:** video — `/videos/onlyfjs_out.mp4` (Git LFS)

#### 3. AMFM.video
- **Href:** `https://amfm.video/`
- **Summary:** `I didn't want to fall behind the AI bandwagon, so I created this app
  from the ground up using Cursor. Inspired by PoolSuite, this app uses music and
  visuals to set the vibe and help me code.`
- **Notes** (2, both small type):
  1. `Note: As this was just a code-experiment, it's only been tested on macOS Safari
     and Chromium-based browsers.`
  2. `Also: This app uses embeded YouTube videos, and Google is clamping down on
     downloader apps, you might see a "Sign in to confirm you're not a bot" prompt in
     place of the video. Disconnecting from your VPN usually fixes this.`
- **Tags:** Nuxt, TypeScript
- **Media:** video — `/videos/flowstack_out.mp4` (Git LFS)

> `embeded` is a typo in the live copy. Preserved verbatim — fixing it is a content
> decision, not part of this extraction.

### History section

**Heading:** `History | briefly`

| Company | Period |
|---|---|
| Hypermedia Systems | 2005-Present |
| Sony Online Entertainment | 2002-2005 |
| Sony Computer Entertainment America | 2002 |
| OnAir Streaming Networks | 2000-2001 |
| Digital Entertainment Network | 1999-2000 |
| Learning Tree International | 1997-1999 |

Start and end years are also stored numerically so a design can position entries on a
proportional time axis. `Hypermedia Systems` has no end year.

---

## About page — `src/pages/about.astro`

**Heading:** `About Me` (followed by a short decorative rule)

### Work story — 3 paragraphs

1. `From a young age, I have always tinkered with computers—starting with learning
   BASIC on my Atari 400 and crafting "Mad Libs" programs as well as creating mini
   "Choose Your Own Adventure" stories. Over my lifetime, I've held the firm belief
   that computers should be easy to use and fun. These two principles are deeply
   interwoven and continue to guide my approach to crafting experiences for people on
   the web.`

2. `I am comfortable operating across various contexts, from startups to corporate
   organizations. I've had the pleasure of riding the dot-com bubble and the equal
   displeasure of experiencing the bubble burst and crashing down to earth. I've
   pursued roles I never expected, spanning technical support, software testing, and
   development. Drawing on these experiences, I've acquired the institutional
   knowledge to design systems that simplify and enhance work for those in each stage
   of the software development lifecycle.`

3. `I believe mistakes are some of the most valuable learning opportunities, leading
   to the greatest growth. I believe that things worth doing are hard. Throughout each
   stage of my career, I've been fortunate to work with people who have served as
   mentors and guides. Their guidance has shaped not just my technical skills, but
   also my approach to collaboration and problem-solving. I strive to be that person
   for others.`

> The live copy mixes apostrophe characters — paragraph 2 uses a typographic `’`
> while paragraphs 1 and 3 use a straight `'`. **`site-content.ts` normalizes all
> prose to typographic apostrophes (`’`)**, since several of the candidate designs are
> typography-led and mixed quote characters read as a defect. Flagged here so the
> difference is not mistaken for altered content.

### Collaboration CTA

- **Heading:** `Let's Work Together`
- **Blurb:** `I'm always interested in discussing new opportunities where I can help
  your product or brand shine.`
- **Actions:** `View My CV` (opens CV modal), `Contact Me` (opens contact modal)

### Personal story — 1 paragraph

`Outside of work, I'm a dog dad to the sweetest Frenchie, Jojo. In my free time, I
like to work on my FJ Cruiser, whether it's wrenching or modifying it for overland
adventures. I enjoy driving the less-traveled roads, exploring the backcountry,
popping up the tent, and doing some late-night stargazing. It helps balance my
work/life by providing some much-needed solitude and a chance for reflection.`

### Photos

| Src | Alt | Caption |
|---|---|---|
| `/images/jojo.jpg` | `Jojo the French Bulldog` | `Introducing Jojo` |
| `/images/fj_stars.jpg` | `FJ Cruiser under starry night sky` | `Late night stargazing` |

Both are Git LFS objects. Run `git lfs pull` before reviewing, or they render broken.

---

## Blog index — `src/pages/blog/index.astro`

- **Heading:** `My Blog`
- **Subhead:** `Thoughts on web development, technology trends, and insights from my
  coding journey`
- **Card CTA:** `Read more`
- **Empty state heading:** `No posts yet`
- **Empty state blurb:** `Check back later for new content!`

The live grid gives the **most recent post a full-width featured card** (`index === 0`
spans all columns) and shows `pubDate`, `title`, and `description` when present. Mock
fixtures include 6 posts so this treatment is exercised.

---

## Shared chrome

### Header — `src/components/HeaderCustom.astro`

- Logo text: `esison.dev` (`SITE_TITLE`), linking to `/`
- Gravatar avatar keyed to hash `bd76701a5b015803844801dafec0401c`, alt
  `Eric Sison's gravatar`
- **Navigation links are commented out** with a TODO: "Add navigation links when
  content is done and mobile hamburger added". The intended set was Home, About,
  Portfolio.

> Because the live header has no working nav, each design mock supplies its own
> navigation between Home / About / Blog. That is a design decision per mock, not
> extracted content — which is why `SharedContent` has no `nav` field. Mock layouts
> build their own links via `mockPageUrl()` in `src/mocks/registry.ts`.

### Footer — `src/components/Footer.astro`

- Copyright: `© {current year} Eric Sison. All rights reserved.`
- Social links (icon-only, with screen-reader labels):

| Network | Href | SR label |
|---|---|---|
| Mastodon | `https://mastodon.social/@underactive` | `Follow me on Mastodon` |
| Twitter | `https://twitter.com/underactive` | `Follow me on Twitter` |
| GitHub | `https://github.com/underactive` | `Go to my GitHub repo` |

### GitHub projects section — `src/components/GitHubProjectsSection.astro`

| Element | Copy |
|---|---|
| Heading | `Public Repos on GitHub` |
| Profile link | `View all repositories on GitHub` → `https://github.com/underactive` |
| Empty state | `No public repositories are currently tagged with `spotlight`.` |
| Partial-load notice | `Some projects may not be shown due to a temporary issue during the build.` |
| Error recovery hint | `Trigger a new build after GitHub connectivity is restored to refresh this section.` |
| Repo link | `View Repo` |
| Homepage link | `Live Site` |
| Date label | `Last push {date}` |
| Star badge | `{n} star` / `{n} stars` |

Per-repo fields available (`GitHubProject` in `src/lib/github-projects.ts`): `name`,
`description`, `repoUrl`, `homepageUrl?`, `language?`, `topics`, `stars`, `pushedAt`.
Missing descriptions fall back to `No description provided yet.`

### Modal copy

**CV modal** — `src/components/CVModal.vue`
- Title: `My Curriculum Vitae`
- Body 1: `I'm gainfully employed at my current company, so the urgency to update my
  CV is not yet there.` (`yet` is italicized)
- Body 2: `That said, I'm always looking for new opportunities to grow and learn, so
  feel free to reach out to me if you think I'd be a good fit for your team!`
  (`reach out to me` is an inline button that opens the contact modal)
- Close button: `Close`

**Contact modal** — `src/components/ContactModal.vue`
- Title: `Contact Information`
- Email verification prompt: `Please complete verification to view contact information:`
- Phone verification prompt: `Additional verification required for phone access:`
- Phone reveal prompt: `Want my phone number too?` / `Reveal Phone Number`
  (`src/components/PhoneRevealButton.vue`)
- Field labels: `Email`, `Phone`
- Close button: `Close`
- Retry action: `Try again` (`src/components/ErrorMessage.vue`)

### Misc labels

| Copy | Source |
|---|---|
| `Last updated on {date}` | `src/layouts/BlogPost.astro` |
| `Back to Blog` | `src/layouts/BlogPost.astro` |
| `Loading...` | `src/components/LoadingSpinner.vue` (default prop) |
| `Design Style` / `Classic` / `Modern` / `Art Deco` | `src/components/ColorPicker.astro` |
| `Theme Colors` / `Backgrounds` | `src/components/ColorPicker.astro` |
| `Background changes with light/dark mode` | `src/components/ColorPicker.astro` |

---

## Not extracted — deliberately

- **Blog post bodies.** All 5 entries in `src/content/blog/` are unmodified Astro
  starter-kit content: `first-post.md`, `second-post.md` and `third-post.md` are
  literal Lorem Ipsum; `using-mdx.mdx` and `markdown-style-guide.md` are the stock
  demo docs. There is no real published writing to extract. Mocks use fixture post
  metadata instead — see `fixtures.blogPosts` in `site-content.ts`.
- **Contact email and phone.** These are never in the repo. They live in the
  `CONTACT_EMAIL` / `CONTACT_PHONE` Netlify environment variables and are returned by
  `netlify/functions/reveal_contact.js` only after Turnstile CAPTCHA, honeypot,
  minimum-elapsed-time and rate-limit checks pass. Mocks render the contact buttons
  inert.
- **ColorPicker preset names** (8 theme colors, 8 light and 8 dark background
  gradients). These belong to the existing theme system, which the overhaul replaces;
  carrying them forward would presuppose the winner keeps a color picker.
- **Icon SVG paths.** Presentation, not content. Each design supplies its own icons.
- **Live GitHub repo data.** Fetched at build time. Mocks use deterministic fixtures
  so all five designs render identical repo cards and the comparison stays valid.
