# Tech Debt Tracker

Known technical debt, tracked as inventory. Items here should be addressed
by targeted cleanup tasks on a regular cadence — not accumulated for a
"big refactor."

## Format

```
### <short title>
- **Domain:** which domain is affected
- **Grade impact:** what quality grade this drags down
- **Severity:** low | medium | high
- **Added:** YYYY-MM-DD
- **Notes:** context for why this exists and what fixing looks like
```

## Active debt

### `site` URL is placeholder
- **Domain:** config
- **Grade impact:** SEO, sitemap, RSS feeds all use wrong canonical URL
- **Severity:** medium
- **Added:** 2026-04-07
- **Notes:** `astro.config.mjs` has `site` set to `https://example.com` instead of the actual production URL. Affects canonical URLs, sitemap.xml, and RSS feed links.

### No linter or formatter
- **Domain:** cross-cutting
- **Grade impact:** Linting grade is F
- **Severity:** medium
- **Added:** 2026-04-07
- **Notes:** No ESLint, Prettier, or similar tooling configured. Style is enforced by convention only.

### No automated test suite
- **Domain:** cross-cutting
- **Grade impact:** Testing grade is D
- **Severity:** high
- **Added:** 2026-04-07
- **Notes:** No unit, integration, or e2e tests. Target: unit tests for `src/lib/github-projects.ts` with fixtures. Manual smoke checklist exists in `docs/references/testing-checklist.md`.

### Umami analytics loads in dev
- **Domain:** config
- **Grade impact:** Minor — no user impact, but adds noise in dev
- **Severity:** low
- **Added:** 2026-04-07
- **Notes:** Analytics script loads in development mode with no environment gating.

### GitHub project sync is build-time only
- **Domain:** github-sync
- **Grade impact:** Data freshness limited to rebuild frequency
- **Severity:** low
- **Added:** 2026-04-07
- **Notes:** Repository visibility changes appear on the homepage only after the next successful site rebuild. Mitigated by 6-hour scheduled rebuilds.

### Terminal prose has no visual regression coverage
- **Domain:** design-system
- **Grade impact:** design-system B-
- **Severity:** low
- **Added:** 2026-07-29
- **Notes:** `.term-prose` in `src/styles/terminal.css` replaced nine
  `@tailwindcss/typography` variants by hand. It was verified against
  `src/content/blog/markdown-style-guide.md`, which exercises every element, but
  nothing prevents a regression. That file is effectively the only test for prose
  styling — do not delete it without replacing the coverage.

### Blog content is still Astro starter placeholder text
- **Domain:** blog
- **Grade impact:** blog C
- **Severity:** medium
- **Added:** 2026-07-29
- **Notes:** All five entries in `src/content/blog/` are unmodified Astro
  starter content — three are literal Lorem Ipsum, two are stock demo docs. The
  blog is linked from the main nav, so visitors reach placeholder text. Either
  publish real posts or hide the blog until there is writing. Note
  `markdown-style-guide.md` doubles as the prose regression fixture (above).

## Resolved debt

### Content duplicated between live pages and `site-content.ts`
- **Resolved:** 2026-07-29 (promote-terminal-design)
- **Notes:** Resolved by promotion rather than reconciliation. The live pages now
  read from `src/data/site-content.ts`, so it is the single source and
  `docs/content-inventory.md` is its readable mirror.

### Design-lab mocks ship to production
- **Resolved:** 2026-07-29 (promote-terminal-design)
- **Notes:** Terminal was chosen; the lab was committed for the record (`a6f2595`)
  and then removed, along with the sitemap `filter` and the `netlify.toml`
  `X-Robots-Tag` block. Build is back to 8 pages.

### Design-style default disagrees between ColorPicker and MainLayout
- **Resolved:** 2026-07-29 (promote-terminal-design)
- **Notes:** Resolved by deletion. `ColorPicker.astro` and the whole `design-theme`
  mechanism are gone; there is one design and the only stored preference is
  `phosphor`, which falls back to amber on any unrecognized value.

### Docs still name the GitHub topic `portfolio`
- **Resolved:** 2026-07-29 (promote-terminal-design)
- **Notes:** ARCHITECTURE.md, README.md, testing-checklist.md and the JSDoc on
  `getGitHubProjects` in `src/lib/github-projects.ts` now all say `spotlight`,
  matching `GITHUB_PROJECTS_REQUIRED_TOPIC` as changed in `1667c7a`.

### AGENTS.md claims no test command exists
- **Resolved:** 2026-07-29 (promote-terminal-design)
- **Notes:** AGENTS.md now states that `npm run test` runs Vitest but has no test
  files yet. The underlying gap (no tests) is tracked separately.

## Process

- When you discover tech debt during a task, add it here rather than fixing
  it inline (unless the fix is trivial and scoped to your current change).
- Cleanup tasks should reference the specific item they resolve.
- Move resolved items to the "Resolved" section with the date and PR/commit.
