# Plan: Sync GitHub Projects

**Goal:** Automatically show selected public GitHub repositories on the homepage without hardcoding, with simple per-repo visibility control via `portfolio` topic filtering.
**Status:** Completed
**Started:** 2026-04-07

## Context

The portfolio homepage needed a way to showcase GitHub repositories without manually updating the site for each new project. The implementation keeps the site static, fast, and resilient when GitHub is temporarily unavailable.

## Steps

- [x] Modify `src/pages/index.astro` to render a new GitHub-backed projects section
- [x] Add `src/components/GitHubProjectsSection.astro` for GitHub projects UI and error states
- [x] Add `src/lib/github-projects.ts` for build-time GitHub API fetch, validation, normalization
- [x] Update `src/consts.ts` with symbolic constants for GitHub username, topic, repo count
- [x] Update `src/env.d.ts` with new build-time config variables
- [x] Add `.github/workflows/refresh-github-projects.yml` for scheduled/manual Netlify rebuilds
- [x] Update documentation with new subsystem details
- [x] Add manual testing checklist items

## Decisions

- 2026-04-07: Using `portfolio` topic for visibility control — cleanest per-repo mechanism without config files.
- 2026-04-07: Build-time only (no client-side API calls) — keeps site static and avoids rate limits.
- 2026-04-07: Scheduled 6-hour rebuilds via GitHub Actions → Netlify build hook — acceptable freshness without complexity.

## Open questions

(resolved)

---

## Implementation

### Files changed

- `.github/workflows/refresh-github-projects.yml`
- `AGENTS.md`
- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/consts.ts`
- `src/env.d.ts`
- `src/lib/github-projects.ts`
- `src/pages/index.astro`

### Summary

Implemented a build-time GitHub projects section on the homepage that pulls public repositories from the GitHub API, filters through the `portfolio` topic, and renders them under the existing featured projects. Added `ENABLE_GITHUB_PROJECTS` toggle, optional `GITHUB_TOKEN` support, and offline/error fallback. Added a scheduled GitHub Actions workflow for Netlify rebuilds every 6 hours and on manual dispatch.

### Verification

- Build succeeds with GitHub unreachable (fallback rendered)
- `ENABLE_GITHUB_PROJECTS=false` disables section completely
- Generated `dist/index.html` contains GitHub section markup

### Follow-ups

- Configure `GITHUB_TOKEN` if unauthenticated API limits become a problem
- Add `NETLIFY_BUILD_HOOK_URL` GitHub Actions secret for scheduled refreshes
- Tag repositories with `portfolio` topic

---

## Audit

### Files audited

- `.github/workflows/refresh-github-projects.yml`
- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/lib/github-projects.ts`

### QA

1. Medium — Transient GitHub outages during rebuild can replace rendered cards with fallback state. Unresolved: preserving last snapshot requires persisted state outside the static build pipeline.
2. [FIXED] Medium — Bare-domain homepage values were being dropped. URL normalization now allows safe `https://` fallback.
3. [FIXED] Low — API fetch page size increased before filtering so display limit can be reached.

### Security

1. [FIXED] Medium — GitHub homepage metadata restricted to `http:`/`https:` URLs. Unsafe schemes blocked from rendered links.

### Interface contracts

1. [FIXED] Medium — Bare-domain homepage values normalize to `https://` instead of being dropped.
2. [FIXED] Low — Auth and rate-limit failures produce distinct operator guidance.

### State management

No findings.

### Resource & concurrency

1. [FIXED] Medium — Workflow job has 2-minute timeout; `curl` has 30-second max time.
2. [FIXED] Low — Workflow has `concurrency` guard preventing duplicate Netlify builds.

### Testing coverage

1. [FIXED] Medium — Checklist covers data-normalization branches (bare-domain, non-HTTP, fallback descriptions, fork/archive/disabled filtering).
2. [FIXED] Medium — Checklist covers refresh workflow success and missing-secret failure paths.

### DX & maintainability

1. [FIXED] Low — Placeholder checklist items removed.
2. [FIXED] Low — URL normalization helper uses options object instead of boolean flag.

---

## Audit fixes

1. Restricted GitHub homepage links to safe schemes, added `https://` fallback for bare domains. (Security §1, QA §2, Interface §1)
2. Increased API fetch page size before filtering. (QA §3)
3. Added status-specific guidance for auth/rate-limit failures. (Interface §2)
4. Added workflow concurrency protection and timeouts. (Resource §1, §2)
5. Expanded testing checklist; removed placeholders. (Testing §1, §2, DX §1)
6. Replaced boolean URL-normalization flag with options object. (DX §2)

### Unresolved

- QA §1: Preserving last successful GitHub snapshot across failed builds requires persisted state outside the current pipeline. Accepted as-is.
