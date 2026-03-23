# Audit: Fix GitHub Project Metadata Display

## Files changed

- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/lib/github-projects.ts`

## QA Audit

1. [FIXED] Low — `src/lib/github-projects.ts`: the card set originally came from a GitHub search window sorted by `updated` and was only locally re-sorted by `pushedAt`, which could drift from the visible “Last push” contract. The fetcher now pages through public repos sorted by push time and collects tagged repos in that order.

## Security Audit

No findings.

## Interface Contract Audit

1. [FIXED] Medium — `src/lib/github-projects.ts`: unexpected GitHub payload-shape failures were previously reported as if GitHub were unreachable. Payload parsing errors now produce a distinct “unexpected repository data” message.

## State Management Audit

No findings.

## Resource & Concurrency Audit

No findings.

## Testing Coverage Audit

1. [FIXED] Medium — `docs/CLAUDE.md/testing-checklist.md`: the checklist now covers the new last-push ordering behavior, the `pushed_at` fallback branch, and the user-visible removal of the old topic-instructions sentence.

## DX & Maintainability Audit

No findings.
