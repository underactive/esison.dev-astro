# Plan: Sync GitHub Projects

## Objective

Automatically show selected public GitHub repositories on the homepage without hardcoding each repo into the page, while preserving a simple way to hide the entire GitHub-driven section or opt individual repositories in and out. The implementation should keep the site static, fast, and resilient when GitHub is temporarily unavailable.

## Changes

- Modify `src/pages/index.astro` to render a new GitHub-backed projects section alongside the existing hand-curated featured projects.
- Add `src/components/GitHubProjectsSection.astro` to encapsulate the GitHub projects UI and empty/error states.
- Add `src/lib/github-projects.ts` to fetch public repositories from GitHub at build time, validate the API response, normalize project metadata, and surface actionable failures without breaking the build.
- Update `src/consts.ts` with symbolic constants for the GitHub username, required repository topic, and repo count limit used by the homepage.
- Update `src/env.d.ts` with the new build-time configuration variables used by the GitHub project sync.
- Add `.github/workflows/refresh-github-projects.yml` to trigger a Netlify rebuild on a schedule and on manual dispatch so repo changes on GitHub can propagate to the static site automatically.
- Update `AGENTS.md` to document the new GitHub projects subsystem, its configuration, the scheduled refresh workflow, and the per-repo visibility rule.
- Update `docs/CLAUDE.md/testing-checklist.md` with manual checks for the new GitHub-driven homepage behavior.

## Dependencies

- The homepage section depends on GitHub repository metadata being reachable at build time; the build must degrade gracefully when the API is unavailable or rate limited.
- Automatic refresh depends on a `NETLIFY_BUILD_HOOK_URL` GitHub Actions secret being configured in the repository settings.
- Optional higher GitHub API rate limits depend on a `GITHUB_TOKEN` server-side environment variable being configured in local development and Netlify.

## Risks / Open Questions

- Repository topics are the cleanest per-repo visibility control, but the repos to show must be tagged with the required topic before they appear.
- Because the site is static, GitHub data only changes when a new build runs; the scheduled workflow reduces that delay but does not make updates instant.
- Some repositories may have sparse descriptions or no homepage URL, so the card design needs to remain useful with partial metadata.
