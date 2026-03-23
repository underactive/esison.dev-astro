# Implementation: Sync GitHub Projects

## Files changed

- `.github/workflows/refresh-github-projects.yml`
- `AGENTS.md`
- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/consts.ts`
- `src/env.d.ts`
- `src/lib/github-projects.ts`
- `src/pages/index.astro`

## Summary

Implemented a build-time GitHub projects section on the homepage that pulls public repositories for `underactive` from the GitHub API, filters them through the `portfolio` topic, and renders them under the existing featured projects. Added a global `ENABLE_GITHUB_PROJECTS` toggle, optional `GITHUB_TOKEN` support for higher API limits, and an offline/error fallback so the site still builds when GitHub is unavailable.

Added a scheduled GitHub Actions workflow that can trigger Netlify rebuilds every 6 hours and on manual dispatch by using a `NETLIFY_BUILD_HOOK_URL` secret. Updated the repo documentation to describe the new subsystem, controls, and operational requirements.

## Verification

- Ran `npm run build` and confirmed the site built successfully with the GitHub section enabled while GitHub was unreachable; the build completed and the homepage rendered the fallback state.
- Ran `ENABLE_GITHUB_PROJECTS=false npm run build` and confirmed the site built successfully with the GitHub section disabled and no GitHub fetch attempted.
- Checked the generated `dist/index.html` output to confirm the GitHub section markup appears in the enabled build.

## Follow-ups

- Configure `GITHUB_TOKEN` in local development and Netlify if unauthenticated GitHub API limits become a problem.
- Add the `NETLIFY_BUILD_HOOK_URL` GitHub Actions secret so the scheduled refresh workflow can trigger automatic rebuilds.
- Tag the repositories you want shown with the `portfolio` topic so they appear in the new section after the next successful build.

## Audit Fixes

### Fixes applied

1. Restricted GitHub homepage links to `http:` and `https:` URLs, added safe `https://` fallback handling for bare-domain homepage values, and kept unsafe schemes out of rendered `Live Site` links. This addresses Security Audit §1, QA Audit §2, and Interface Contract Audit §1.
2. Increased the GitHub API fetch page size before filtering so the homepage can still fill up to the configured display limit when some tagged repos are forks, archived, or disabled. This addresses QA Audit §3.
3. Added status-specific operator guidance for GitHub auth and rate-limit failures. This addresses Interface Contract Audit §2.
4. Added workflow concurrency protection plus job and request timeouts for the scheduled Netlify refresh workflow. This addresses Resource & Concurrency Audit §1 and §2.
5. Expanded the manual testing checklist to cover data-normalization branches and refresh workflow behavior, and removed placeholder checklist rows. This addresses Testing Coverage Audit §1 and §2 plus DX & Maintainability Audit §1.
6. Replaced the boolean URL-normalization flag with an options object so the helper callsite is self-describing. This addresses DX & Maintainability Audit §2.

### Verification checklist

- [ ] Verify a tagged repository with `homepage=example.com` renders a working `https://example.com/` `Live Site` link.
- [ ] Verify a tagged repository with a non-HTTP homepage value such as `javascript:alert(1)` does not render a `Live Site` link.
- [ ] Verify the homepage still renders up to six eligible repos when some tagged repos are forks, archived, or disabled.
- [ ] Verify a 401/403/429 GitHub API response shows the token/rate-limit remediation message.
- [ ] Verify overlapping scheduled and manual runs of `.github/workflows/refresh-github-projects.yml` do not both trigger Netlify builds.
- [ ] Verify the workflow exits quickly when the Netlify build hook is missing, invalid, or stalls.

### Unresolved items

- Left QA Audit §1 unresolved. Preserving the last successful GitHub repo snapshot across failed static builds would require persisted state outside the current Astro + Netlify build pipeline, so the implementation still falls back to a visible empty/error state when GitHub is unavailable during a successful deploy.
