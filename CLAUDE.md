# CLAUDE.md - esison.dev Project Context

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**esison.dev** is a personal portfolio and blog website for Eric Sison, built with Astro 5 as a static site with Vue 3 interactive islands, deployed on Netlify.

**Current Version:** 0.0.1
**Status:** Production-ready

---

## Architecture

### Core Files
Modular Astro static site with Vue 3 islands for interactivity.

- `src/pages/index.astro` - Entry point: homepage with hero, skills, featured projects, work history
- `src/consts.ts` - Global constants (`SITE_TITLE`, `SITE_DESCRIPTION`)
- `src/content.config.ts` - Content collection schema definitions (blog)
- `src/env.d.ts` - TypeScript environment variable declarations
- `astro.config.mjs` - Astro framework configuration and integrations
- `tailwind.config.js` - Tailwind CSS config with custom prose-purple typography theme
- `netlify.toml` - Netlify deployment and functions directory config

### Dependencies
- `astro@^5.13.5` - Static site generator framework
- `vue@^3.5.21` - Client-side interactive components
- `@astrojs/mdx` - MDX support for enhanced blog content
- `@astrojs/sitemap` - Automatic sitemap.xml generation
- `@astrojs/tailwind` - Tailwind CSS integration
- `@astrojs/rss` - RSS feed generation
- `@tailwindcss/typography` - Prose styling plugin (prose-purple theme)
- `sharp@^0.34.2` - Image optimization for Astro Image component

### Key Subsystems

#### 1. Content Collections (Blog)
- Blog posts live in `src/content/blog/` as `.md` or `.mdx` files
- Schema defined in `src/content.config.ts` using Zod: required `title` (string), `description` (string), `pubDate` (coerced date); optional `updatedDate` (date), `heroImage` (astro:assets image)
- Posts are fetched via `getCollection('blog')` from `astro:content` and sorted by `pubDate.valueOf()`
- Hero images use relative paths to `src/assets/` (e.g., `../../assets/blog-placeholder-1.jpg`)
- Dynamic routes generated in `src/pages/blog/[...slug].astro`

#### 2. Component Model (Astro + Vue Islands)
- **Astro components** (`src/components/*.astro`) — static/SSR rendering: `BaseHead`, `HeaderCustom`, `Footer`, `FormattedDate`, `Header`, `HeaderLink`, `Button`, `ColorPicker`
- **Vue components** (`src/components/*.vue`) — client-side interactivity: `TypewriterText`, `MatrixRain`, `ContactModal`, `CVModal`, `ImageModal`
- All Vue components use `client:load` directive for immediate hydration
- Do not mix — Astro components handle structure/SEO, Vue handles interactive behavior

#### 3. Layout System
- `MainLayout.astro` — Top-level wrapper used by all pages. Includes `BaseHead`, `HeaderCustom`, `Footer`, fixed parallax background elements, and theme toggle script. Default dark mode for first-time visitors, persisted in localStorage via MutationObserver on `<html>` class changes.
- `BlogPost.astro` — Extends MainLayout for blog posts. Adds hero image with gradient overlay, formatted publication/update dates, prose-purple typography, and back-to-blog navigation.

#### 4. Dark Mode / Theme Toggle
- Class-based strategy: `dark` class on `<html>` element
- Toggled via global `window.toggleTheme()` function (defined in MainLayout)
- Persisted to localStorage; defaults to dark for first-time visitors
- MutationObserver watches `<html>` class attribute changes and syncs to localStorage
- Tailwind's `darkMode: 'class'` config enables `dark:` variant utilities

#### 5. Contact Info Reveal (Serverless)
- `netlify/functions/reveal_contact.js` — Netlify serverless function
- Two-stage Turnstile CAPTCHA verification: primary for email, secondary for phone
- Anti-bot measures: honeypot field check, minimum response time validation (1200ms)
- Contact data stored in server-side env vars (`CONTACT_EMAIL`, `CONTACT_PHONE`)
- Called from `ContactModal.vue` on the client side

---

## Build Configuration

### Astro Configuration
- **`site`** — Set to `https://example.com` (needs updating for production canonical URLs)
- **Integrations** — MDX, Sitemap, Tailwind, Vue (order matters for Astro integration loading)
- **Output** — Static (default) — builds to `./dist/`

### Tailwind Configuration
- **`darkMode: 'class'`** — Class-based dark mode toggling on `<html>` element
- **`prose-purple`** — Custom typography theme with purple accent colors for blog content, including full invert variants for dark mode
- **`@tailwindcss/typography`** — Plugin for prose styling in blog posts

### Environment Variables

| Variable | Purpose | Values |
|----------|---------|--------|
| `TURNSTILE_SECRET` | Cloudflare Turnstile server-side secret key | String (server-only) |
| `CONTACT_EMAIL` | Email address for contact reveal | String (server-only) |
| `CONTACT_PHONE` | Phone number for contact reveal | String, optional (server-only) |
| `NODE_ENV` | Runtime environment | `development` \| `production` |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile client-side site key | String (public) |
| `PUBLIC_SITE_NAME` | Site display name | `esison.dev` (public) |
| `PUBLIC_SITE_URL` | Canonical site URL | URL string (public) |

Environment files / define sources:
- `.env` — Local development environment variables
- `src/env.d.ts` — TypeScript interface declarations for `ImportMetaEnv`
- Netlify dashboard — Production environment variables (server-side secrets)

---

## Code Style

- **Linter:** None configured
- **Formatter:** None configured
- **Indentation:** Tabs in Astro/config files, consistent within each file
- **TypeScript:** Strict mode (`astro/tsconfigs/strict` with `strictNullChecks: true`)
- **Component naming:** PascalCase for all components (e.g., `BaseHead.astro`, `TypewriterText.vue`)
- **Constants/utilities:** camelCase (e.g., `consts.ts`)

---

## External Integrations

### Cloudflare Turnstile
- **What:** CAPTCHA verification for contact info reveal
- **Loaded via:** Script tag in `BaseHead.astro` (`https://challenges.cloudflare.com/turnstile/v0/api.js`, async + defer)
- **Lifecycle:** Widget rendered in `ContactModal.vue`; tokens verified server-side in `netlify/functions/reveal_contact.js`
- **Key env vars:** `PUBLIC_TURNSTILE_SITE_KEY` (client), `TURNSTILE_SECRET` (server)
- **Gotchas:** Two-stage verification — primary token for email, secondary token for phone. Tokens are single-use; a new widget render is needed for each verification.

### Umami Analytics
- **What:** Privacy-focused website analytics
- **Loaded via:** Script tag in `BaseHead.astro` (`https://cloud.umami.is/script.js`)
- **Key env vars:** None — website ID hardcoded as `data-website-id` attribute in `BaseHead.astro`
- **Gotchas:** Loads on every page via BaseHead. No environment gating — runs in both dev and production.

### Google Fonts
- **What:** Righteous font for headings
- **Loaded via:** Preconnect + stylesheet link in `BaseHead.astro`
- **Gotchas:** Atkinson font is self-hosted (`public/fonts/`), but Righteous is externally loaded. Both are needed for the design.

### Gravatar
- **What:** Profile avatar displayed in the header
- **Loaded via:** Image URL in `HeaderCustom.astro`

---

## Known Issues / Limitations

1. **`site` in astro.config.mjs** — Set to `https://example.com` instead of the actual production URL. This affects canonical URLs, sitemap, and RSS feed links.
2. **No linter or formatter** — No ESLint, Prettier, or similar tooling configured.
3. **No test suite** — No unit, integration, or e2e tests.
4. **Umami analytics in dev** — Analytics script loads in development mode with no environment gating.

---

## Development Rules

### 1. Validate all external input at the boundary
Every value arriving from an external source (API, user input, Turnstile token) must be validated before use. The `reveal_contact.js` function demonstrates this pattern with honeypot checks, timing validation, and CAPTCHA verification.

### 2. Guard all array-indexed lookups
Any value used as an index into an array must have a bounds check before access: `(val < COUNT) ? ARRAY[val] : fallback`. This is defense-in-depth against corrupt or unvalidated values.

### 3. Use symbolic constants, not magic numbers
Never hardcode string literals or numeric constants — use `src/consts.ts` for site-wide values. When data structures are reordered, update both the data and all symbolic references together.

### 4. Report errors, don't silently fail
When input exceeds limits or operations fail, provide actionable error feedback to the caller. Never silently truncate, drop, or ignore errors.

---

## Plan Pre-Implementation

Before planning, check `docs/CLAUDE.md/plans/` for prior plans that touched the same areas. Scan the **Files changed** lists in both `implementation.md` and `audit.md` files to find relevant plans without reading every file — then read the full `plan.md` only for matches. This keeps context window usage low while preserving access to project history.

When a plan is finalized and about to be implemented, write the full plan to `docs/CLAUDE.md/plans/{epoch}-{plan_name}/plan.md`, where `{epoch}` is the Unix timestamp at the time of writing and `{plan_name}` is a short kebab-case description of the plan (e.g., `1709142000-add-user-auth/plan.md`).

The epoch prefix ensures chronological ordering — newer plans visibly supersede earlier ones at a glance based on directory name ordering.

The plan document should include:
- **Objective** — what is being implemented and why
- **Changes** — files to modify/create, with descriptions of each change
- **Dependencies** — any prerequisites or ordering constraints between changes
- **Risks / open questions** — anything flagged during planning that needs attention

---

## Plan Post-Implementation

After a plan has been fully implemented, write the completed implementation record to `docs/CLAUDE.md/plans/{epoch}-{plan_name}/implementation.md`, using the same directory as the corresponding `plan.md`.

The implementation document **must** include:
- **Files changed** — list of all files created, modified, or deleted. This section is **required** — it serves as a lightweight index for future planning, allowing prior plans to be found by scanning file lists without reading full plan contents.
- **Summary** — what was actually implemented (noting any deviations from the plan)
- **Verification** — steps taken to verify the implementation is correct (tests run, manual checks, build confirmation)
- **Follow-ups** — any remaining work, known limitations, or future improvements identified during implementation

If the implementation added or changed user-facing behavior (new settings, UI modes, protocol commands, or display changes), add corresponding `- [ ]` test items to `docs/CLAUDE.md/testing-checklist.md`. Each item should describe the expected observable behavior, not the implementation detail.

---

## Post-Implementation Audit

After finishing implementation of a plan, run the following subagents **in parallel** to audit all changed files.

> **Scope directive for all subagents:** Only flag issues in the changed code and its immediate dependents. Do not audit the entire codebase.

> **Output directive:** After all subagents complete, write a single consolidated audit report to `docs/CLAUDE.md/plans/{epoch}-{plan_name}/audit.md`, using the same directory as the corresponding `plan.md`. The audit report **must** include a **Files changed** section listing all files where findings were flagged. This section is **required** — it serves as a lightweight index for future planning, covering files affected by audit findings (including immediate dependents not in the original implementation).

### 1. QA Audit (subagent)
Review changes for:
- **Functional correctness**: broken workflows, missing error/loading states, unreachable code paths, logic that doesn't match spec
- **Edge cases**: empty/null/undefined inputs, zero-length collections, off-by-one errors, race conditions, boundary values (min/max/overflow)
- **Infinite loops**: unbounded `while`/recursive calls, callbacks triggering themselves, retry logic without max attempts or backoff
- **Performance**: unnecessary computation in hot paths, O(n²) or worse in loops over growing data, unthrottled event handlers, expensive operations blocking main thread or interrupt context

### 2. Security Audit (subagent)
Review changes for:
- **Injection / input trust**: unsanitized external input used in commands, queries, or output rendering; format string vulnerabilities; untrusted data used in control flow
- **Overflows**: unbounded buffer writes, unguarded index access, integer overflow/underflow in arithmetic, unchecked size parameters
- **Memory leaks**: allocated resources not freed on all exit paths, event/interrupt handlers not deregistered on cleanup, growing caches or buffers without eviction or bounds
- **Hard crashes**: null/undefined dereferences without guards, unhandled exceptions in async or interrupt context, uncaught error propagation across module boundaries

### 3. Interface Contract Audit (subagent)
Review changes for:
- **Data shape mismatches**: caller assumptions that diverge from actual API/protocol schema, missing fields treated as present, incorrect type coercion or endianness
- **Error handling**: no distinction between recoverable and fatal errors, swallowed failures, missing retry/backoff on transient faults, no timeout or watchdog configuration
- **Auth / privilege flows**: credential or token lifecycle issues, missing permission checks, race conditions during handshake or session refresh
- **Data consistency**: optimistic state updates without rollback on failure, stale cache served after mutation, sequence counters or cursors not invalidated after writes

### 4. State Management Audit (subagent)
Review changes for:
- **Mutation discipline**: shared state modified outside designated update paths, state transitions that skip validation, side effects hidden inside getters or read operations
- **Reactivity / observation pitfalls**: mutable updates that bypass change detection or notification mechanisms, deeply nested state triggering unnecessary cascading updates
- **Data flow**: excessive pass-through of context across layers where a shared store or service belongs, sibling modules communicating via parent state mutation, event/signal spaghetti without cleanup
- **Sync issues**: local copies shadowing canonical state, multiple sources of truth for the same entity, concurrent writers without arbitration (locks, atomics, or message ordering)

### 5. Resource & Concurrency Audit (subagent)
Review changes for:
- **Concurrency**: data races on shared memory, missing locks/mutexes/atomics around critical sections, deadlock potential from lock ordering, priority inversion in RTOS or threaded contexts
- **Resource lifecycle**: file handles, sockets, DMA channels, or peripherals not released on error paths; double-free or use-after-free; resource exhaustion under sustained load
- **Timing**: assumptions about execution order without synchronization, spin-waits without yield or timeout, interrupt latency not accounted for in real-time constraints

### 6. Testing Coverage Audit (subagent)
Review changes for:
- **Missing tests**: new public functions/modules without corresponding unit tests, modified branching logic without updated assertions, deleted tests not replaced
- **Test quality**: assertions on implementation details instead of behavior, tests coupled to internal structure, mocked so heavily the test proves nothing
- **Integration gaps**: cross-module flows tested only with mocks and never with integration or contract tests, initialization/shutdown sequences untested, error injection paths uncovered
- **Flakiness risks**: tests dependent on timing or sleep, shared mutable state between test cases, non-deterministic data (random IDs, timestamps)

### 7. DX & Maintainability Audit (subagent)
Review changes for:
- **Readability**: functions exceeding ~50 lines, boolean parameters without named constants, magic numbers/strings without explanation, nested ternaries or conditionals deeper than one level
- **Dead code**: unused includes/imports, unreachable branches behind stale feature flags, commented-out blocks with no context, exported symbols with zero consumers
- **Naming & structure**: inconsistent naming conventions, business/domain logic buried in UI or driver layers, utility functions duplicated across modules
- **Documentation**: public API changes without updated doc comments, non-obvious workarounds missing a `// WHY:` comment, breaking changes without migration notes

---

## Audit Post-Implementation

After audit findings have been addressed, update the `implementation.md` file in the corresponding `docs/CLAUDE.md/plans/{epoch}-{plan_name}/` directory:

1. **Flag fixed items** — In the audit report (`docs/CLAUDE.md/plans/{epoch}-{plan_name}/audit.md`), mark each finding that was fixed with a `[FIXED]` prefix so it is visually distinct from unresolved items.

2. **Append a fixes summary** — Add an `## Audit Fixes` section at the end of `implementation.md` containing:
   - **Fixes applied** — a numbered list of each fix, referencing the audit finding it addresses (e.g., "Fixed unchecked index access flagged by Security Audit §2")
   - **Verification checklist** — a `- [ ]` checkbox list of specific tests or manual checks to confirm each fix is correct (e.g., "Verify bounds check on `configIndex` with out-of-range input returns fallback")

3. **Leave unresolved items as-is** — Any audit findings intentionally deferred or accepted as-is should remain unmarked in the audit report. Add a brief note in the fixes summary explaining why they were not addressed.

4. **Update testing checklist** — If any audit fixes changed user-facing behavior, add corresponding `- [ ]` test items to `docs/CLAUDE.md/testing-checklist.md`. Each item should describe the expected observable behavior, not the implementation detail.

---

## Common Modifications

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

### Version bumps
Version string appears in 1 file:
1. `package.json` - `"version"` field

**Keep all version references in sync.** Always bump all files together during any version bump.

---

## File Inventory

| File / Directory | Purpose |
|------------------|---------|
| `src/pages/` | Route-based pages: `index.astro`, `about.astro`, `blog/`, `rss.xml.js` |
| `src/components/` | Astro (`.astro`) and Vue (`.vue`) components |
| `src/layouts/` | `MainLayout.astro` (base) and `BlogPost.astro` (blog posts) |
| `src/content/blog/` | Blog post markdown/MDX files |
| `src/content.config.ts` | Content collection schema definitions |
| `src/styles/global.css` | Tailwind directives and custom Atkinson font faces |
| `src/consts.ts` | Global constants (`SITE_TITLE`, `SITE_DESCRIPTION`) |
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
| `.gitattributes` | Git LFS tracking for `public/images/*` and `public/videos/*` |
| `CLAUDE.md` | This file |
| `docs/CLAUDE.md/plans/` | Plan, implementation, and audit records (epoch-prefixed directories) |

---

## Build Instructions

### Prerequisites
- Node.js v24+ (tested with v24.4.0)
- npm v11+ (tested with v11.4.2)

### Quick Start
```bash
npm install          # Install dependencies
npm run dev          # Dev server at localhost:4321
npm run build        # Production build to ./dist/
npm run preview      # Preview production build locally
```

### Troubleshooting Build
- **Git LFS errors on clone** — Run `git lfs pull` to fetch large media files in `public/images/` and `public/videos/`
- **Sharp installation issues** — `sharp` requires platform-specific binaries. Run `npm rebuild sharp` if switching OS/architecture.

---

## Testing

No automated test suite is configured. Manual testing required.

---

## Future Improvements

See `docs/CLAUDE.md/future-improvements.md` for the ideas backlog.

---

## Maintaining This File

### Keep CLAUDE.md in sync with the codebase
**Every plan that adds, removes, or changes a feature must include CLAUDE.md updates as part of the implementation.** Treat CLAUDE.md as a living spec -- if the code and this file disagree, this file is wrong and must be fixed before the work is considered complete. During plan post-implementation, verify that all sections affected by the change are accurate. If a feature is removed, delete its documentation here rather than leaving stale references.

### When to update CLAUDE.md
- **Adding a new subsystem or module** — add it to Architecture and File Inventory
- **Adding a new setting or config field** — update the Environment Variables table and Common Modifications
- **Discovering a new bug class** — add a Development Rule to prevent recurrence
- **Changing the build process** — update Build Instructions and/or Build Configuration
- **Adding/changing env vars or build defines** — update Build Configuration > Environment Variables
- **Changing linting or style rules** — update Code Style
- **Integrating a new third-party service or SDK** — add to External Integrations
- **Bumping the version** — update the version in Project Overview
- **Adding/removing files** — update File Inventory
- **Finding a new limitation** — add to Known Issues

### Supplementary docs
For sections that grow large (display layouts, testing checklists, changelogs), move them to separate files under `docs/` and link from here. This keeps the main CLAUDE.md scannable while preserving detail.

### Future improvements tracking
When a new feature is added and related enhancements or follow-up ideas are suggested but declined, add them as `- [ ]` items to `docs/CLAUDE.md/future-improvements.md`. This preserves good ideas for later without cluttering the current task.

### Version history maintenance
When making changes that are committed to the repository, add a row to the version history table in `docs/CLAUDE.md/version-history.md`. Each entry should include:

- **Ver** — A semantic version identifier (e.g., `v0.1.0`, `v0.2.0`). Follow semver: MAJOR.MINOR.PATCH. Use the most recent entry in the table to determine the next version number.
- **Changes** — A brief summary of what changed.

Append new rows to the bottom of the table. Do not remove or rewrite existing entries.

### Testing checklist maintenance
When adding or modifying user-facing behavior (new settings, UI modes, protocol commands, or display changes), add corresponding `- [ ]` test items to `docs/CLAUDE.md/testing-checklist.md`. Each item should describe the expected observable behavior, not the implementation detail.

### What belongs here vs. in code comments
- **Here:** Architecture decisions, cross-cutting concerns, "how things fit together," gotchas, recipes
- **In code:** Implementation details, function-level docs, inline explanations of tricky logic

---

## Origin

Created with Claude (Anthropic)
