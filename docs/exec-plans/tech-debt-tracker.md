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

## Resolved debt

(none)

## Process

- When you discover tech debt during a task, add it here rather than fixing
  it inline (unless the fix is trivial and scoped to your current change).
- Cleanup tasks should reference the specific item they resolve.
- Move resolved items to the "Resolved" section with the date and PR/commit.
