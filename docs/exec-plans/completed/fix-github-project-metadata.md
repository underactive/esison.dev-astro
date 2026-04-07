# Plan: Fix GitHub Project Metadata Display

**Goal:** Display code activity date (`pushed_at`) instead of metadata edit time, and remove inline instruction text from section header.
**Status:** Completed
**Started:** 2026-04-07

## Context

Homepage GitHub project cards were showing repository metadata update times (which change on topic edits, description changes, etc.) rather than actual code push dates. The section header also contained instructional text about the `portfolio` topic that cluttered the UI.

## Steps

- [x] Update `src/lib/github-projects.ts` to read and normalize `pushed_at`
- [x] Update `src/components/GitHubProjectsSection.astro` to remove topic-instructions sentence and render last-push date
- [x] Update documentation to reflect push date display
- [x] Add manual testing checklist item for push date accuracy

## Decisions

- 2026-04-07: Using `pushed_at` over `updated_at` — better represents code activity even though it may differ from other GitHub views.
- 2026-04-07: Changed fetch order to sort by push time — aligns displayed date with actual selection ordering.

## Open questions

(resolved)

---

## Implementation

### Files changed

- `AGENTS.md`
- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/lib/github-projects.ts`

### Summary

Updated homepage GitHub project cards to use `pushed_at` timestamp for code activity. Removed instructional sentence from section header. Adjusted GitHub fetcher to page through repos sorted by push time so visible ordering matches the "Last push" label.

### Verification

- Build succeeds after date-source and fetch-order changes
- Header instruction sentence removed from component output
- Card label reads "Last push" with normalized `pushedAt` field

### Follow-ups

- Verify a tagged repo with recent metadata edit but older code push shows the older push date.

---

## Audit

### Files audited

- `docs/CLAUDE.md/testing-checklist.md`
- `src/components/GitHubProjectsSection.astro`
- `src/lib/github-projects.ts`

### QA

1. [FIXED] Low — Card set originally came from a search sorted by `updated` and was only locally re-sorted by `pushedAt`. Fetcher now pages through repos sorted by push time.

### Security

No findings.

### Interface contracts

1. [FIXED] Medium — Payload-shape failures were reported as if GitHub were unreachable. Now produces distinct "unexpected repository data" message.

### State management

No findings.

### Resource & concurrency

No findings.

### Testing coverage

1. [FIXED] Medium — Checklist covers last-push ordering, `pushed_at` fallback branch, and removed topic-instructions sentence.

### DX & maintainability

No findings.

---

## Audit fixes

1. Separated payload/schema failures from network failures with distinct messaging. (Interface §1)
2. Changed repo selection to page by push time, aligning displayed date with ordering. (QA §1)
3. Expanded testing checklist for ordering, fallback, and removed copy. (Testing §1)

### Unresolved

None.
