# Implementation: Fix GitHub Project Metadata Display

## Files changed

- `AGENTS.md`
- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/lib/github-projects.ts`

## Summary

Updated the homepage GitHub project cards to use GitHub's `pushed_at` timestamp so the visible date reflects last code push activity instead of repository metadata edits such as topic changes. Also removed the instructional sentence about adding or removing the `portfolio` topic from the section header, leaving the header cleaner while preserving the existing empty-state guidance.

Adjusted the GitHub fetcher to page through public repositories ordered by push time, so the set of repos shown now matches the visible “Last push” ordering instead of depending on a search window sorted by `updated`.

## Verification

- Ran `npm run build` and confirmed the site still builds successfully after the date-source and fetch-order changes.
- Reviewed the updated component and generated output to confirm the header instruction sentence was removed.
- Confirmed the GitHub project card label now reads `Last push` in the component source and uses the normalized `pushedAt` field.

## Follow-ups

- Manually verify a tagged repo whose metadata was edited recently but whose last code push is older now shows the older push date on the homepage.

## Audit Fixes

### Fixes applied

1. Separated GitHub payload/schema failures from network failures so unexpected repository data now produces the correct remediation message. This addresses Interface Contract Audit §1.
2. Changed the GitHub repo selection flow to page through public repos sorted by push time, which aligns the displayed `Last push` date with the actual ordering used to choose visible cards. This addresses QA Audit §1.
3. Expanded the testing checklist to cover the removed header copy, last-push ordering, and the `pushed_at` fallback path. This addresses Testing Coverage Audit §1.

### Verification checklist

- [ ] Verify a repository whose topics were edited recently but whose last code push is older shows the older push date on its card.
- [ ] Verify multiple visible GitHub cards are ordered by last push date from newest to oldest.
- [ ] Verify a mocked or temporarily patched payload without `pushed_at` still renders safely using the fallback date.
- [ ] Verify the old `Add the portfolio topic...` sentence does not appear in the GitHub section header.

### Unresolved items

- None.
