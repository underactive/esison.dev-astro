# Testing Checklist

## Automation scope (target)

There is no automated test suite or CI test job in this repository yet. The intended coverage split:

- **Unit / integration:** `src/lib/github-projects.ts` and related build-time logic using fixtures (no live GitHub), including validation, URL handling, ordering, and fallbacks.
- **E2E (optional):** Browser smoke against a production or preview build for layout and flows that are costly to cover in unit tests.

When automated tests exist, run them in CI (for example `npm test` in GitHub Actions) and map or duplicate the highest-risk scenarios from the manual list below so the checklist does not drift from enforced behavior.

## Manual smoke

Use this section for release checks, visual verification, and behavior that depends on external services (Netlify hooks, live GitHub) where automation is impractical or not yet implemented.

- [ ] Homepage shows a "Public Repos on GitHub" section under Featured Projects when `ENABLE_GITHUB_PROJECTS` is unset or `true`.
- [ ] Homepage hides the GitHub repos section entirely when `ENABLE_GITHUB_PROJECTS=false`.
- [ ] The GitHub section header does not show the old `Add the portfolio topic...` instruction sentence.
- [ ] A public GitHub repository tagged with `spotlight` appears in the homepage GitHub section after the next successful site rebuild.
- [ ] Removing the `spotlight` topic from a previously visible repository removes it from the homepage after the next successful site rebuild.
- [ ] A tagged repository with a valid GitHub homepage URL shows both `View Repo` and `Live Site` links.
- [ ] A tagged repository with a bare-domain homepage value such as `example.com` still shows a working `Live Site` link that resolves over `https`.
- [ ] A tagged repository with a non-HTTP homepage value such as `javascript:alert(1)` does not render a `Live Site` link.
- [ ] Tagged forked, archived, or disabled repositories do not appear in the homepage GitHub section.
- [ ] A tagged repository without a description renders the fallback description text instead of leaving the card blank.
- [ ] A tagged repository card shows the repository's last push date rather than a metadata-only update date.
- [ ] When multiple tagged repositories are visible, the cards are ordered by last push date from newest to oldest.
- [ ] With a mocked or temporarily patched GitHub payload missing `pushed_at`, the build still succeeds and the card date falls back safely.
- [ ] If GitHub is unreachable during build, the homepage still builds successfully and shows the GitHub section fallback message instead of breaking the page.
- [ ] A manual run of `.github/workflows/refresh-github-projects.yml` triggers Netlify successfully when the `NETLIFY_BUILD_HOOK_URL` secret is configured.
- [ ] A manual run of `.github/workflows/refresh-github-projects.yml` fails quickly with a clear error when `NETLIFY_BUILD_HOOK_URL` is missing or invalid.

## Terminal design

**Verify against `npm run build` + `npm run preview`, not `npm run dev`.** The dev
server injects Astro's dev toolbar into every page, which looks like a floating
widget over the content. It is absent from production builds.

**Full-page screenshots show horizontal banding.** The scanline and vignette
overlays are `position: fixed`, so a stitched full-page capture repeats them at
viewport intervals and text appears unevenly dimmed. Judge uniformity from a
normal viewport-sized screenshot instead — this is a capture artifact, not a bug.

### No framework CSS

- [ ] `package.json` contains no `tailwind*` dependency and `node_modules/tailwindcss` is absent.
- [ ] `tailwind.config.js` and `src/styles/global.css` do not exist.
- [ ] The built stylesheet contains no `--tw-` custom properties.
- [ ] `dist/_astro/` contains exactly one CSS file for the whole site.
- [ ] No `.astro` or `.vue` file outside comments contains a `dark:` variant.

### Phosphor accent

- [ ] First visit with empty localStorage renders green (P1), with no flash of unstyled accents, and no `data-phosphor` attribute is set.
- [ ] Each of green / amber / cyan / white recolours the logo, nav, headings, borders, buttons and section labels.
- [ ] Switching phosphor also recolours the homepage matrix rain without a reload.
- [ ] The choice survives a reload and applies before first paint.
- [ ] Setting `localStorage.phosphor = 'banana'` and reloading renders green rather than unstyled accents, and the picker marks green as selected.
- [ ] With cookies/storage blocked, the picker still applies a phosphor for the session and does not throw.
- [ ] `Escape` closes the picker menu and returns focus to its toggle; clicking outside closes it.
- [ ] There is no light/dark toggle anywhere in the UI, and no `theme` key is written to localStorage.

### Layout and gutters

- [ ] At 375px, 768px and 1280px every section keeps its horizontal gutter — text never touches the viewport edge. (A `padding` shorthand on a section class silently kills `.term-shell`'s `padding-inline`; this is only visible at narrow widths.)
- [ ] The sticky header stays legible over scrolled content.
- [ ] Scanlines and vignette never intercept clicks — every link and button in the hero is clickable.
- [ ] The skip link becomes visible on first Tab and jumps to `#main`.
- [ ] Nav shows only `home` and `about` — blog is intentionally hidden while its posts are placeholders — and marks the current one with `aria-current="page"`.
- [ ] `/blog/`, blog posts and `/rss.xml` all still work despite the nav link being absent.

### Crawling and indexing

- [ ] `/robots.txt` returns 200 as `text/plain` and its `Sitemap:` line uses the production origin, not `example.com`.
- [ ] `robots.txt` contains no `Disallow: /blog/` — blocking crawling would stop crawlers seeing the `noindex` and make the pages harder to de-index.
- [ ] Blog index and every blog post emit `<meta name="robots" content="noindex, nofollow">`.
- [ ] Home and About emit no robots meta tag.
- [ ] `sitemap-index.xml` → `sitemap-0.xml` lists only `/` and `/about/`.

### Content

- [ ] Every section of [content-inventory.md](../content-inventory.md) appears on the site, with no placeholder or missing copy.
- [ ] The homepage bio reads as one sentence with a space before the parenthetical and a trailing period.
- [ ] The hero typewriter cycles all three taglines and honours their per-line durations.
- [ ] Both project videos autoplay muted and loop; the `underactive.net` card loads its external image.

### Blog and prose

- [ ] `/blog/markdown-style-guide/` renders headings, paragraphs, links, ordered/unordered/nested lists, blockquotes, tables, inline code, code blocks, images, `mark`, `kbd`, `abbr`, `sub`/`sup` and footnotes — all in Terminal styling with no unstyled defaults.
- [ ] Code blocks use the warm `vesper` palette, not slate blue, and scroll horizontally rather than breaking the layout.
- [ ] A wide markdown table scrolls horizontally within its container.
- [ ] `/blog/using-mdx/` renders and its imported `<Button>` component is Terminal-styled.
- [ ] The blog index marks the newest post `latest` and shows descriptions only where present.
- [ ] A post without `heroImage` renders its header with no empty gap.

### Interactive

- [ ] `View My CV` opens the CV modal; `reach out to me` inside it closes it and opens the Contact modal.
- [ ] `Contact Me` opens the Contact modal and renders the Turnstile widget when `PUBLIC_TURNSTILE_SITE_KEY` is set.
- [ ] With the site key missing, the Contact modal shows the Terminal-styled error panel and a working `Try again`.
- [ ] Completing the first CAPTCHA reveals the email; `Reveal Phone Number` triggers the second stage and reveals the phone.
- [ ] Revealed email and phone are click-to-contact (`mailto:` / `tel:`).
- [ ] `Escape` and clicking the backdrop close every modal, and page scroll is restored afterwards.
- [ ] Clicking an About-page photo opens the lightbox with its caption; `Escape` closes it.
- [ ] With `prefers-reduced-motion: reduce`, matrix rain stops and the typewriter shows the first tagline as static text.
- [ ] Switching to another browser tab pauses the matrix rain canvas.
- [ ] With JavaScript disabled, all pages remain readable and navigable.
