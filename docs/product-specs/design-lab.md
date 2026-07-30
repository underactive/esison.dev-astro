# Spec: Design Lab

## User story

As the site owner, I want to see all of my real content rendered in five distinct
designs side by side, so I can choose a direction before committing to a site-wide
overhaul.

## Acceptance criteria

- [x] All extracted site copy renders in every mock — no placeholder or missing sections
- [x] Five designs are reachable at `/design-lab/<slug>/`, each with Home, About and Blog index views (15 views total)
- [x] Each mock is visually independent: no style bleed between designs, and no
      styling from the live site (no purple gradients, parallax blobs, site header/footer)
- [x] The chooser at `/design-lab/` swaps design, page and preview width, and can
      show two designs side by side for A/B comparison
- [x] Chooser state is shareable and survives reload via the URL hash
- [x] Each mock view can be opened standalone in a new tab at full browser width
- [x] The live site (`/`, `/about`, `/blog/`, blog posts) renders identically to before
- [x] Mocks are excluded from `sitemap-index.xml` and marked `noindex, nofollow`
- [x] Mocks ship zero client-side JavaScript and fire zero analytics events

## Edge cases

| Scenario | Expected behavior |
|----------|-------------------|
| Unknown design slug in URL | Standard 404 — routes are explicit, so there is no dynamic fallback to handle |
| Fixture blog post with no `description` | Design omits the element entirely rather than rendering empty space |
| `Fill` preview width on a narrow window | Iframe matches its container width; no horizontal overflow in the chooser chrome |
| Iframe slow to load or blocked | Chooser shows a visible loading state rather than a blank panel |
| Malformed URL hash (unknown slug or page) | Falls back to the default design and Home page instead of erroring |
| Rapid design switching | Previous iframe document is torn down via a keyed remount, so CSS animation cost does not accumulate |
| Mock page visited with existing site theme in localStorage | Mock renders in its own canonical mode; it neither reads nor writes `design-theme` or `theme` |
| Very long post title | Wraps within its card without overflowing |
| Single-year career stint on the Dossier timeline | Bar keeps a minimum width and its label moves outside the bar so it stays legible |

## Not in scope

- Implementing the winning design site-wide — that is a separate follow-up plan
- Removing the existing `classic` / `modern` / `artdeco` styles
- Modal interiors (CV and Contact). Buttons render styled but inert; the copy is
  captured in `src/data/site-content.ts` for the follow-up
- Blog post detail views (`/blog/<slug>`) — only the blog index is mocked
- Interactive Vue islands inside mocks (typewriter, matrix rain, contact flow)
- Real GitHub API data — mocks use deterministic fixtures
- Device emulation. The chooser's width presets trigger real CSS media queries but
  do not emulate device pixel ratio, touch input, or mobile viewport quirks. The
  375px preset is not a device test
- Light/dark variants per design — each design ships in one canonical mode
