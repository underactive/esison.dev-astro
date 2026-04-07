# Reliability

Requirements and practices for keeping the site reliable.

## Failure modes to handle

| Failure | Likelihood | Mitigation |
|---------|------------|------------|
| GitHub API unreachable during build | Medium | Graceful fallback UI state; site still builds and deploys |
| GitHub API rate limited | Low | Optional `GITHUB_TOKEN` raises limits; status-specific error messages guide operator |
| Turnstile CAPTCHA service down | Low | Contact modal shows error state; no silent failures |
| Malformed GitHub API response | Low | Validate at boundary; reject gracefully with distinct error message |
| Missing env vars in production | Low | `reveal_contact.js` returns `missing-contact-info` with clear guidance |
| Netlify build hook stale/invalid | Medium | Workflow fails fast with clear error when secret is missing or invalid |

## Invariants

1. **Never crash on malformed external input.** GitHub API responses and
   Turnstile tokens are validated at the boundary. Malformed data is logged
   and rejected gracefully — never causes a build failure or unhandled exception.

2. **Guard all array-indexed lookups.** Any value used as an index must have a
   bounds check: `(val < COUNT) ? ARRAY[val] : fallback`. Defense-in-depth
   against corrupt or unvalidated values.

3. **Use symbolic constants, not magic numbers.** Never hardcode string literals
   or numeric constants — use `src/consts.ts` for site-wide values. When data
   structures are reordered, update both data and symbolic references together.

4. **Report errors, don't silently fail.** When input exceeds limits or
   operations fail, provide actionable error feedback. Never silently truncate,
   drop, or ignore errors.

5. **Static site always builds.** External service unavailability must not
   prevent a successful build. Degrade to fallback UI rather than failing the
   build pipeline.

## Testing strategy

- **Automated tests:** None configured yet. Target coverage: unit/integration
  tests for `src/lib/github-projects.ts` using fixtures (no live GitHub).
- **Manual smoke tests:** Checklist maintained in
  [docs/references/testing-checklist.md](references/testing-checklist.md).
- **E2E (future):** Optional browser smoke against production or preview build
  for layout and flows that are costly to cover in unit tests.
