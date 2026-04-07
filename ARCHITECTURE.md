# esison.dev Architecture

## System overview

```
┌──────────────────────────────────────────────────┐
│               Astro 6 (Static SSG)               │
│  ┌───────────────┐  ┌────────────────────────┐   │
│  │  .astro pages  │  │ .md/.mdx blog posts    │   │
│  │  & components  │  │ (Content Collections)  │   │
│  └───────┬───────┘  └───────────┬────────────┘   │
│          │                      │                │
│          ▼                      ▼                │
│  ┌───────────────┐  ┌────────────────────────┐   │
│  │   Vue 3 SFC   │  │  Build-time GitHub     │   │
│  │   Islands     │  │  API Fetcher           │   │
│  │  (client:load)│  │  (src/lib/)            │   │
│  └───────────────┘  └────────────────────────┘   │
└───────────────────────┬──────────────────────────┘
                        │ npm run build
                        ▼
                   ┌──────────┐
                   │  ./dist/  │ ──▶ Netlify CDN
                   └──────────┘
                        │
                        │ /.netlify/functions/
                        ▼
               ┌──────────────────┐
               │ reveal_contact.js │ ◀── Turnstile CAPTCHA
               └──────────────────┘
```

Data flows: Astro builds static HTML from `.astro` pages and `.md` blog posts.
Vue components hydrate client-side for interactivity. GitHub API data is fetched
at build time only. The contact reveal function runs as a Netlify serverless
function with Turnstile verification.

## Domain layers

| Layer          | Responsibility                                       | May depend on       |
|----------------|------------------------------------------------------|---------------------|
| **Types**      | TypeScript interfaces, Zod schemas, env declarations | Nothing             |
| **Config**     | `consts.ts`, `astro.config.mjs`, `tailwind.config.js`, env vars | Types   |
| **Data**       | Content collections, GitHub API fetcher, blog posts  | Types, Config       |
| **Components** | Astro (static) and Vue (interactive) components      | Types, Config, Data |
| **Layouts**    | `MainLayout.astro`, `BlogPost.astro`                 | All above           |
| **Pages**      | Route-based pages in `src/pages/`                    | All above           |
| **Functions**  | Netlify serverless functions                         | Types, Config       |

## Domains

| Domain           | Purpose                                            | Status      |
|------------------|----------------------------------------------------|-------------|
| `blog`           | Content collection-based blog with MDX support     | Implemented |
| `github-sync`    | Build-time GitHub repo cards on homepage            | Implemented |
| `contact-reveal` | Serverless contact info reveal with CAPTCHA         | Implemented |
| `theme`          | Dark/light mode toggle with localStorage persistence | Implemented |
| `layout`         | Page layout system with parallax backgrounds        | Implemented |

## Key design decisions

1. **Static-first with Vue islands.** The site is fully static (Astro SSG) with
   Vue 3 components hydrated client-side via `client:load` for interactive
   features (typewriter, matrix rain, modals). This keeps the site fast and
   SEO-friendly while enabling rich interactivity where needed.

2. **Build-time GitHub integration.** GitHub repos are fetched at build time,
   not runtime. This avoids client-side API calls, rate limits, and loading
   states — but means data only updates on rebuild. A scheduled GitHub Actions
   workflow triggers Netlify rebuilds every 6 hours to keep data fresh.

3. **Topic-based repo visibility.** Public repos appear on the homepage only
   when tagged with the `portfolio` topic. This gives per-repo control without
   configuration files or hardcoded lists.

4. **Two-stage CAPTCHA for contact reveal.** Email requires one Turnstile
   verification, phone requires a second. This balances accessibility (email is
   easy to get) with privacy (phone requires extra intent).

5. **Class-based dark mode.** Theme toggling uses a `dark` class on `<html>`
   with localStorage persistence and MutationObserver sync. Default is dark mode
   for first-time visitors.

---

## Subsystems

### Content Collections (Blog)
- Blog posts live in `src/content/blog/` as `.md` or `.mdx` files
- Schema defined in `src/content.config.ts` using Zod: required `title` (string), `description` (string), `pubDate` (coerced date); optional `updatedDate` (date), `heroImage` (astro:assets image)
- Posts are fetched via `getCollection('blog')` from `astro:content` and sorted by `pubDate.valueOf()`
- Hero images use relative paths to `src/assets/` (e.g., `../../assets/blog-placeholder-1.jpg`)
- Dynamic routes generated in `src/pages/blog/[...slug].astro`

### Component Model (Astro + Vue Islands)
- **Astro components** (`src/components/*.astro`) — static/SSR rendering: `BaseHead`, `Header` (wraps `HeaderCustom`; edit `HeaderCustom.astro` for header UI), `Footer`, `FormattedDate`, `HeaderLink`, `Button`, `ColorPicker`
- **Vue components** (`src/components/*.vue`) — client-side interactivity: `TypewriterText`, `MatrixRain`, `ContactModal`, `CVModal`, `ImageModal`
- All Vue components use `client:load` directive for immediate hydration
- Do not mix — Astro components handle structure/SEO, Vue handles interactive behavior

### Layout System
- `MainLayout.astro` — Top-level wrapper used by all pages. Includes `BaseHead`, `Header`, `Footer`, fixed parallax background elements, and theme toggle script. Default dark mode for first-time visitors, persisted in localStorage via MutationObserver on `<html>` class changes.
- `BlogPost.astro` — Extends MainLayout for blog posts. Adds hero image with gradient overlay, formatted publication/update dates, prose-purple typography, and back-to-blog navigation.

### Dark Mode / Theme Toggle
- Class-based strategy: `dark` class on `<html>` element
- Toggled via global `window.toggleTheme()` function (defined in MainLayout)
- Persisted to localStorage; defaults to dark for first-time visitors
- MutationObserver watches `<html>` class attribute changes and syncs to localStorage
- Tailwind's `darkMode: 'class'` config enables `dark:` variant utilities

### Contact Info Reveal (Serverless)
- `netlify/functions/reveal_contact.js` — Netlify serverless function
- Two-stage Turnstile CAPTCHA verification: primary for email, secondary for phone
- Anti-bot measures: honeypot field check, minimum response time validation (1200ms)
- Contact data stored in server-side env vars (`CONTACT_EMAIL`, `CONTACT_PHONE`)
- Called from `ContactModal.vue` on the client side
- **HTTP/JSON contract:** `POST /.netlify/functions/reveal_contact` with JSON body (`token`, `honeypot`, `tNow`, `includePhone`, `phoneToken`). Responses are JSON.
  - **`200`:** `{ email, phone }` — `phone` is a string when revealed, otherwise `null`. Phone-only follow-up returns `{ phone }` only.
  - **`400`:** `{ error }` — `bot-detected`, `too-fast`, or `captcha-invalid` with `stage` and optional `details`.
  - **`429`:** `{ error: "rate-limited" }` — 10 requests per 15-minute window per IP.
  - **`500`:** `missing-contact-info` or `server-error` with optional `details`.

### GitHub Projects Sync
- `GitHubProjectsSection.astro` renders a second homepage projects grid from build-time GitHub data
- `src/lib/github-projects.ts` calls the GitHub repositories API during the Astro build, paginates over public repos sorted by push time, validates external input, and normalizes repo metadata before rendering
- Public repositories appear only when they include the `portfolio` topic; removing that topic hides the repo from the homepage
- Project cards display the repository `pushed_at` time so the visible date reflects last code push activity rather than metadata-only repo edits
- The whole GitHub-driven section is controlled by the optional `ENABLE_GITHUB_PROJECTS` server-side environment variable
- `GITHUB_TOKEN` is optional but recommended to raise API limits for build-time fetches
- `.github/workflows/refresh-github-projects.yml` triggers a Netlify rebuild every 6 hours and on manual dispatch so GitHub repo changes can propagate to the static site

---

## Build configuration

### Astro
- **`site`** — Set to `https://example.com` (needs updating for production canonical URLs)
- **Integrations** — MDX, Sitemap, Vue; Tailwind is connected through the Vite plugin in `astro.config.mjs`
- **Output** — Static (default) — builds to `./dist/`

### Tailwind CSS
- **`darkMode: 'class'`** — Class-based dark mode toggling on `<html>` element
- **`prose-purple`** — Custom typography theme with purple accent colors for blog content, including full invert variants for dark mode
- **`@tailwindcss/typography`** — Plugin for prose styling in blog posts

### Dependencies
- `astro@^6.0.1` — Static site generator framework
- `vue@^3.5.24` — Client-side interactive components
- `@astrojs/mdx@^5.0.0` — MDX support for enhanced blog content
- `@astrojs/sitemap@^3.7.1` — Automatic sitemap.xml generation
- `@astrojs/vue@^6.0.0` — Vue island integration
- `@astrojs/rss@^4.0.12` — RSS feed generation
- `@tailwindcss/vite@^4.0.0` — Tailwind CSS Vite integration
- `@tailwindcss/typography@^0.5.16` — Prose styling plugin (prose-purple theme)
- `tailwindcss@^4.0.0` — Utility-first CSS framework
- `sharp@^0.34.2` — Image optimization for Astro Image component

### Prerequisites
- Node.js v24+ (tested with v24.4.0)
- npm v11+ (tested with v11.4.2)

### Quick start
```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:4321
npm run build        # Production build to ./dist/
npm run preview      # Preview production build locally
```

### Troubleshooting
- **Git LFS errors on clone** — Run `git lfs pull` to fetch large media files in `public/images/` and `public/videos/`
- **Sharp installation issues** — `sharp` requires platform-specific binaries. Run `npm rebuild sharp` if switching OS/architecture.
- **GitHub projects unavailable during build** — Configure `GITHUB_TOKEN` for higher API limits, verify outbound network access, and trigger another build after connectivity is restored.
- **Scheduled GitHub refresh not running** — Add the `NETLIFY_BUILD_HOOK_URL` GitHub Actions secret so the workflow can trigger Netlify builds.

---

## Environment variables

| Variable | Purpose | Values |
|----------|---------|--------|
| `TURNSTILE_SECRET` | Cloudflare Turnstile server-side secret key | String (server-only) |
| `CONTACT_EMAIL` | Email address for contact reveal | String (server-only) |
| `CONTACT_PHONE` | Phone number for contact reveal | String, optional (server-only) |
| `NODE_ENV` | Runtime environment | `development` \| `production` |
| `ENABLE_GITHUB_PROJECTS` | Enable/disable homepage GitHub repos section | `'true'` \| `'false'`, optional (server-only, defaults to enabled) |
| `GITHUB_TOKEN` | Optional GitHub token for build-time repo API requests | String, optional (server-only) |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile client-side site key | String (public) |
| `PUBLIC_SITE_NAME` | Site display name | `esison.dev` (public) |
| `PUBLIC_SITE_URL` | Canonical site URL | URL string (public) |

Environment file sources:
- `.env` — Local development environment variables
- `src/env.d.ts` — TypeScript interface declarations for `ImportMetaEnv`
- Netlify dashboard — Production environment variables (server-side secrets)
- GitHub Actions secrets — `NETLIFY_BUILD_HOOK_URL` for scheduled refresh workflow

---

## External integrations

### Cloudflare Turnstile
- **What:** CAPTCHA verification for contact info reveal
- **Loaded via:** Script tag in `BaseHead.astro` (async + defer)
- **Lifecycle:** Widget rendered in `ContactModal.vue`; tokens verified server-side in `netlify/functions/reveal_contact.js`
- **Key env vars:** `PUBLIC_TURNSTILE_SITE_KEY` (client), `TURNSTILE_SECRET` (server)
- **Gotchas:** Two-stage verification — primary token for email, secondary for phone. Tokens are single-use; a new widget render is needed for each verification.

### Umami Analytics
- **What:** Privacy-focused website analytics
- **Loaded via:** Script tag in `BaseHead.astro` (`https://cloud.umami.is/script.js`)
- **Gotchas:** Loads on every page via BaseHead. No environment gating — runs in both dev and production.

### Google Fonts
- **What:** Righteous font for headings
- **Loaded via:** Preconnect + stylesheet link in `BaseHead.astro`
- **Gotchas:** Atkinson font is self-hosted (`public/fonts/`), but Righteous is externally loaded.

### Gravatar
- **What:** Profile avatar displayed in the header
- **Loaded via:** Image URL in `HeaderCustom.astro`

### GitHub REST API
- **What:** Build-time source of public repository metadata for the homepage
- **Loaded via:** `src/lib/github-projects.ts` during Astro page generation
- **Key env vars:** `ENABLE_GITHUB_PROJECTS`, `GITHUB_TOKEN`
- **Gotchas:** Repos only appear when public and tagged with `portfolio`; cards display last push time; builds fall back to visible error state if GitHub is unreachable.

### Netlify Build Hook
- **What:** Scheduled rebuild trigger for GitHub data freshness
- **Loaded via:** `.github/workflows/refresh-github-projects.yml`
- **Key config:** `NETLIFY_BUILD_HOOK_URL` GitHub Actions secret
- **Gotchas:** Without the secret the workflow cannot trigger Netlify.

### Netlify Functions
- **Endpoint:** `POST /.netlify/functions/reveal_contact` (JSON body/response)
- **Errors:** Structured `{ error, ... }` payloads. See Contact Info Reveal subsystem above for full HTTP contract.

---

## File inventory

| File / Directory | Purpose |
|------------------|---------|
| `src/pages/` | Route-based pages: `index.astro`, `about.astro`, `blog/`, `rss.xml.js` |
| `src/components/` | Astro (`.astro`) and Vue (`.vue`) components |
| `src/lib/github-projects.ts` | Build-time GitHub repo fetching, validation, normalization |
| `src/layouts/` | `MainLayout.astro` (base) and `BlogPost.astro` (blog posts) |
| `src/content/blog/` | Blog post markdown/MDX files |
| `src/content.config.ts` | Content collection schema definitions |
| `src/styles/global.css` | Tailwind directives and custom Atkinson font faces |
| `src/consts.ts` | Global constants and GitHub sync settings |
| `src/env.d.ts` | TypeScript env var type declarations |
| `src/assets/` | Blog placeholder images (optimized by Astro) |
| `public/fonts/` | Self-hosted Atkinson font files (woff) |
| `public/images/` | Static images (Git LFS tracked) |
| `public/videos/` | Video assets (Git LFS tracked) |
| `public/favicons` | Favicon variants and PWA manifest |
| `netlify/functions/` | Serverless functions (`reveal_contact.js`) |
| `astro.config.mjs` | Astro framework and integration config |
| `tailwind.config.js` | Tailwind CSS + prose-purple typography config |
| `netlify.toml` | Netlify deployment config |
| `.github/workflows/` | Scheduled Netlify rebuild workflow |
| `.gitattributes` | Git LFS tracking rules |

---

## Common modifications

### Adding a new blog post
1. Create a new `.md` or `.mdx` file in `src/content/blog/`
2. Include required frontmatter: `title`, `description`, `pubDate`
3. Optionally add `heroImage` (import from `src/assets/`) and `updatedDate`
4. The post automatically appears on `/blog` and gets its own `/blog/{slug}` route

### Adding a new page
1. Create a new `.astro` file in `src/pages/`
2. Import and wrap content with `MainLayout` from `src/layouts/MainLayout.astro`
3. Pass required `title` and `description` props to the layout
4. Add navigation link in `HeaderCustom.astro` if needed

### Adding a new Vue interactive component
1. Create `.vue` file in `src/components/`
2. Use `client:load` directive when embedding in Astro templates for immediate hydration
3. Access public env vars via `import.meta.env.PUBLIC_*` if needed

### Showing or hiding a GitHub repo on the homepage
1. Add the `portfolio` topic to a public GitHub repository to show it
2. Remove the `portfolio` topic to hide it
3. Set `ENABLE_GITHUB_PROJECTS=false` to hide the entire section
4. Set `GITHUB_TOKEN` if build-time requests hit rate limits
5. Configure `NETLIFY_BUILD_HOOK_URL` secret for scheduled refreshes

### Version bumps
Version string appears in `package.json` `"version"` field only.
