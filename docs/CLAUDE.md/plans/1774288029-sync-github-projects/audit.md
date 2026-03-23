# Audit: Sync GitHub Projects

## Files changed

- `.github/workflows/refresh-github-projects.yml`
- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/lib/github-projects.ts`

## QA Audit

1. Medium — `src/lib/github-projects.ts` and `.github/workflows/refresh-github-projects.yml`: transient GitHub outages during an auto-triggered rebuild can still replace previously rendered GitHub repo cards with the fallback state for the next deploy. This remains unresolved because preserving the last successful repo snapshot would require persisted state outside the current static build pipeline.
2. [FIXED] Medium — `src/lib/github-projects.ts`: bare-domain GitHub homepage values such as `example.com` were being dropped. The URL normalization now allows a safe `https://` fallback for bare domains.
3. [FIXED] Low — `src/lib/github-projects.ts`: the GitHub API request now fetches a full results page before filtering out forked, archived, or disabled repositories, so the section can still fill up to the configured display limit.

## Security Audit

1. [FIXED] Medium — `src/lib/github-projects.ts` and `src/components/GitHubProjectsSection.astro`: external GitHub homepage metadata is now restricted to `http:` and `https:` URLs before rendering, preventing `javascript:` or other unsafe schemes from being emitted as `Live Site` links.

## Interface Contract Audit

1. [FIXED] Medium — `src/lib/github-projects.ts`: bare-domain GitHub homepage values now normalize to `https://` links instead of being dropped.
2. [FIXED] Low — `src/lib/github-projects.ts` and `src/components/GitHubProjectsSection.astro`: auth and rate-limit failures now produce distinct operator guidance that points to `GITHUB_TOKEN` or GitHub API limits instead of generic connectivity advice.

## State Management Audit

No findings.

## Resource & Concurrency Audit

1. [FIXED] Medium — `.github/workflows/refresh-github-projects.yml`: the refresh workflow job now has a two-minute timeout and the `curl` request has a 30-second max time so a stalled build hook cannot consume a runner indefinitely.
2. [FIXED] Low — `.github/workflows/refresh-github-projects.yml`: the workflow now has a `concurrency` guard to prevent overlapping scheduled and manual refresh runs from triggering duplicate Netlify builds.

## Testing Coverage Audit

1. [FIXED] Medium — `docs/CLAUDE.md/testing-checklist.md`: the checklist now covers the data-normalization branches for bare-domain homepages, rejected non-HTTP links, fallback descriptions, and fork/archive/disabled filtering.
2. [FIXED] Medium — `docs/CLAUDE.md/testing-checklist.md`: the checklist now covers the scheduled/manual refresh workflow success path and the missing/invalid-secret failure path.

## DX & Maintainability Audit

1. [FIXED] Low — `docs/CLAUDE.md/testing-checklist.md`: placeholder checklist items were removed so the file now reads as a real verification surface.
2. [FIXED] Low — `src/lib/github-projects.ts`: the homepage URL normalization helper now uses an options object instead of a boolean flag parameter, making the call site self-describing.
