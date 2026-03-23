# Testing Checklist

- [ ] Homepage shows a "Public Repos on GitHub" section under Featured Projects when `ENABLE_GITHUB_PROJECTS` is unset or `true`.
- [ ] Homepage hides the GitHub repos section entirely when `ENABLE_GITHUB_PROJECTS=false`.
- [ ] The GitHub section header does not show the old `Add the portfolio topic...` instruction sentence.
- [ ] A public GitHub repository tagged with `portfolio` appears in the homepage GitHub section after the next successful site rebuild.
- [ ] Removing the `portfolio` topic from a previously visible repository removes it from the homepage after the next successful site rebuild.
- [ ] A tagged repository with a valid GitHub homepage URL shows both `View Repo` and `Live Site` links.
- [ ] A tagged repository with a bare-domain homepage value such as `example.com` still shows a working `Live Site` link that resolves over `https`.
- [ ] A tagged repository with a non-HTTP homepage value such as `javascript:alert(1)` does not render a `Live Site` link.
- [ ] Tagged forked, archived, or disabled repositories do not appear in the homepage GitHub section.
- [ ] A tagged repository without a description renders the fallback description text instead of leaving the card blank.
- [ ] A tagged repository card shows the repository's last push date rather than a metadata-only update date.
- [ ] When multiple tagged repositories are visible, the cards are ordered by last push date from newest to oldest.
- [ ] With a mocked or temporarily patched GitHub payload missing `pushed_at`, the build still succeeds and the card date falls back safely.
- [ ] If GitHub is unreachable during build, the homepage still builds successfully and shows the GitHub section fallback message instead of breaking the page.
- [ ] A manual run of `.github/workflows/refresh-github-projects.yml` triggers Netlify successfully when the `NETLIFY_BUILD_HOOK_URL` secret is configured.
- [ ] A manual run of `.github/workflows/refresh-github-projects.yml` fails quickly with a clear error when `NETLIFY_BUILD_HOOK_URL` is missing or invalid.
