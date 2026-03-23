# Plan: Fix GitHub Project Metadata Display

## Objective

Correct the homepage GitHub project cards so the displayed activity date reflects code activity rather than repository metadata edits, and remove the inline instruction text about the `portfolio` topic from the section header to keep the UI cleaner.

## Changes

- Update `src/lib/github-projects.ts` to read `pushed_at` from GitHub, normalize it safely, and use it as the card activity date.
- Update `src/components/GitHubProjectsSection.astro` to remove the topic-instructions sentence and render the new last-push label/date.
- Update `AGENTS.md` to document that the GitHub project cards show last push time rather than repository metadata update time.
- Update `docs/CLAUDE.md/testing-checklist.md` with a manual check that confirms the card date matches the repository’s last push time.

## Dependencies

- The GitHub API payload must include `pushed_at`; if it is missing or invalid, the implementation should fall back safely rather than crashing the build.
- The UI change depends on the existing build-time GitHub projects section and its current topic-based filtering behavior.

## Risks / Open Questions

- GitHub’s `pushed_at` is a better representation of code activity, but it can still differ from the timestamp shown in other GitHub views if those views emphasize releases, commits on non-default branches, or other repo events.
- Removing the instructional copy makes the section cleaner, but the only remaining in-page hint about the `portfolio` topic will be the empty-state message and the project docs.
