# Plan: Design Lab — extract content, build 5 design mocks, pick a winner

**Goal:** Extract all site copy into a typed content layer and build 5 self-contained design mocks with a side-by-side chooser, so a direction can be picked before committing to a site-wide overhaul.
**Status:** Completed
**Completed:** 2026-07-29
**Started:** 2026-07-29

## Context

The site is getting a complete design overhaul. Two coupled problems block it today:

1. **Content is entangled with presentation.** In `src/pages/index.astro` the bio
   prose sits inside `<span class="terminal-code">` wrappers interleaved with
   `text-gray-600 dark:text-gray-300`. There was no content layer, so every new
   design meant retyping the copy by hand.
2. **The existing "design styles" are not designs.** `src/styles/design-artdeco.css`
   is ~770 lines of `[data-design="artdeco"] .text-purple-600 { color: gold !important }`
   — an override sheet fighting Tailwind utilities hardcoded in markup. That
   coupling caused the black-modal bug on the Tailwind v4 upgrade (commit `27a6836`).
   The approach can express a recolor, not a different layout.

This plan produces a **decision**, not a shipped redesign: a readable content
inventory plus a typed module, 5 design mocks across 3 pages each (15 views), and
a chooser page to compare them. Implementing the winner site-wide is a separate
follow-up plan. The live site is untouched apart from one line in `astro.config.mjs`.

### Scope decisions (confirmed with owner)

| Decision | Choice |
|---|---|
| Designs | `terminal`, `editorial`, `retro80s`, `dossier`, `aurora` |
| Content source | `docs/content-inventory.md` (readable) + `src/data/site-content.ts` (typed) |
| Scope per design | Home + About + Blog index = 15 views |
| Mock CSS | Hand-rolled semantic CSS over a shared reset. No Tailwind, no `global.css` |
| Color modes | One canonical mode per design |
| Existing themes | Untouched; removal belongs to the follow-up plan |

### Design directions

| Slug | Mode | Fonts | Swatch | Direction |
|---|---|---|---|---|
| `terminal` | dark | JetBrains Mono | `#0b0b0b` / `#ffb000` | Scanlines, amber phosphor, prompt nav, block cursor |
| `editorial` | light | Fraunces, Newsreader | `#faf7f2` / `#1a1a1a` | Serif headlines, asymmetric grid, drop caps, no motion |
| `retro80s` | dark | VT323, Orbitron | `#2b0f3a` / `#ff2e97` | Sunset magenta/cyan, CRT bezel, chrome shimmer |
| `dossier` | light | IBM Plex Sans/Mono | `#ffffff` / `#c8102e` | Near-monochrome, hairline accent, timeline as spine |
| `aurora` | dark | Space Grotesk, Inter | `#0a0a14` / `#7c5cff` | Animated gradient mesh, frosted glass cards |

## Steps

- [x] 1. Create this exec plan; add row to `docs/PLANS.md` active table
- [x] 2. Create `docs/product-specs/design-lab.md`; add to product-specs index
- [x] 3. Extract all site copy → `docs/content-inventory.md`
- [x] 4. Build `src/data/site-content.ts` (interfaces + `siteContent` + fixtures)
- [x] 5. Build `src/mocks/registry.ts` (data-only manifest)
- [x] 6. Build `src/mocks/_shared/reset.css` + `MockHead.astro`
- [x] 7. Add sitemap `filter` to `astro.config.mjs`
- [x] 8. Build `terminal` end-to-end (layout, 3 pages, CSS, 3 routes)
- [x] 9. **GATE — verify CSS isolation** before any further design work
- [x] 10. Build `editorial` end-to-end
- [x] 11. Build chooser (`chooser.css`, `DesignLabChooser.vue`, `index.astro`)
- [x] 12. Build `retro80s`, `dossier`, `aurora` end-to-end
- [x] 13. Full verification pass (build + manual + live-site regression)
- [x] 14. Documentation closeout
- [x] 15. **Owner picks a winning design** — Terminal, 2026-07-29. Promoted in
       [promote-terminal-design](../completed/promote-terminal-design.md); the lab
       was removed after being committed for the record (`a6f2595`).

**Ordering rationale.** Step 9 was a hard gate: it tested the CSS-isolation
assumption the entire 15-route architecture rests on, while only one design
existed. Failing there would have cost one rewrite instead of five. Step 10
preceded the chooser because A/B mode is untestable with a single design, and
`editorial` is the furthest from `terminal` typographically — the pattern
surviving monospace-CRT → serif-magazine predicted it would survive the rest.
Step 3 preceded step 4 so the content's real structure shaped the interfaces
rather than type convenience distorting the content.

## Decisions

- 2026-07-29: **Explicit 15 route files instead of dynamic routes plus a component
  registry.** Astro collects CSS by import graph, not render path — verified by the
  live site's own behavior, where `src/components/BaseHead.astro` imports
  `global.css`, `design-modern.css` and `design-artdeco.css` and all three ship on
  every page. A registry statically importing 5 mock layouts would inject 5
  stylesheets into all 15 pages, and recovering isolation would force a return to
  `[data-design="x"]` scoping — the exact pattern this work exists to escape.
  Document-global `@keyframes` and `@font-face` would collide silently on top.
  Cost is 15 files of ~6 lines each. **Confirmed at step 9:** each mock page emits
  exactly one stylesheet, its own design's bundle.
- 2026-07-29: **Mocks load a hand-rolled reset, not `global.css`.** `global.css`
  sets `html { font-family: "Atkinson" }` in `@layer base` (every design would open
  by overriding it) and pulls `@config "../../tailwind.config.js"`, dragging in
  `@tailwindcss/typography` and the `prose-purple` theme. Deciding factor is
  portability: the winner gets promoted, and self-contained semantic CSS lifts into
  the real site nearly as-is, where a mix of utilities and overrides would need
  untangling. Optimize for the handoff.
- 2026-07-29: **All mock class names and `@keyframes` are design-prefixed**
  (`term-`, `ed-`, `r80-`, `dos-`, `aur-`). Tailwind v4 scans all of `src/`, so an
  unprefixed name matching a utility candidate would emit dead CSS into the live
  production bundle. **Verified:** building with `src/mocks/` removed produces a
  byte-identical `MainLayout` stylesheet with the same content hash, so the mocks
  add zero bytes to the live bundle.
- 2026-07-29: **Section classes must use `padding-block`, never the `padding`
  shorthand.** Elements carry both `.<prefix>-shell` (which sets `padding-inline`
  for the page gutter) and a section class. Because both are single-class selectors,
  a later `padding` shorthand silently wins and kills the gutter. This was a real
  bug in `terminal` and `editorial`, invisible at 1280px because `max-width`
  centering supplied incidental margins — it only appeared inside the chooser's
  narrower iframe. Worth remembering when promoting the winner.
- 2026-07-29: **GitHub repos and blog posts are fixtures, not live data.**
  `GitHubProjectsSection.astro` awaits at module scope, so live data would mean 15
  paginated fetch sequences per build. More importantly, if GitHub is unreachable
  mid-build some mocks would render repo cards and others the amber fallback panel,
  invalidating the side-by-side comparison — determinism is a correctness
  requirement here, not an optimization. Scaffolding must also not be able to fail a
  deploy. Fixtures are typed with `GitHubProject` imported from
  `src/lib/github-projects.ts`, giving type-level coupling with runtime isolation.
- 2026-07-29: **No Vue islands in mocks.** `TypewriterText.vue` hardcodes
  `mb-8 leading-relaxed animate-fade-in-delay font-mono` in its own template and
  takes utility strings as props, so it cannot render in a Tailwind-free page.
  `MatrixRain.vue` is bound to the current purple palette. Beyond that, each design
  needs its own motion language — a shared typewriter would force four designs to
  wear a fifth's animation. Terminal's typewriter is a `steps()` + `ch`-width CSS
  animation. All 15 mock pages ship zero `<script>` tags.
- 2026-07-29: **Blog fixtures may only carry fields the real content schema already
  has** (`title`, `description?`, `pubDate`, `updatedDate?`, `heroImage?`, `slug`).
  No invented `tags`, `readingMinutes` or `author`, however much a design would like
  them — otherwise the winning design arrives depending on an unplanned
  content-schema migration. This is the most likely way the lab produces a design
  that cannot ship.
- 2026-07-29: **The chooser lives in `src/mocks/_shared/` rather than
  `src/components/`**, deviating from repo convention, so the entire lab deletes as
  two directories plus one config revert.
- 2026-07-29: **Chooser previews via one swapping iframe plus a two-frame A/B mode;
  no 5-up scaled grid.** At the ~20% scale needed to fit five across, typography is
  illegible — and typography is most of what distinguishes these designs, so a
  thumbnail grid cannot answer the question it exists to answer. Five concurrent
  documents running scanlines, gradient mesh and CRT curvature is also a heavy
  continuous paint load. Pairwise comparison matches how the decision actually gets
  made. The iframe is keyed on design+page so switching remounts a fresh element,
  tearing down the old document and stopping its animations.
- 2026-07-29: **Blog card images are copies in `public/images/blog/`.** Fixture
  `heroImage` values are plain strings so mocks need no `astro:assets` plumbing, and
  no such public paths existed. Five `src/assets/blog-placeholder-*.jpg` files were
  copied to stable public paths (~170 KB, deleted with the lab).
- 2026-07-29: **Dossier's career timeline is proportional, not evenly spaced**
  (resolving an open question). Bars map onto the 1997→present span, with a 6px
  minimum width and labels moving outside the bar below a 22% width threshold so
  the single-year 2002 stint stays legible.

## Files changed

**New — content layer**
```
docs/content-inventory.md            All site copy, human-readable
src/data/site-content.ts             Same copy as typed data + fixtures
```

**New — mock infrastructure**
```
src/mocks/registry.ts                Data-only design manifest
src/mocks/_shared/reset.css          ~30-line reset, no Tailwind
src/mocks/_shared/MockHead.astro     Minimal head, noindex
src/mocks/_shared/DesignLabChooser.vue   Chooser island
```

**New — per design (×5: terminal, editorial, retro80s, dossier, aurora)**
```
src/mocks/<slug>/<Slug>Layout.astro
src/mocks/<slug>/Home.astro
src/mocks/<slug>/About.astro
src/mocks/<slug>/Blog.astro
src/mocks/<slug>/<slug>.css
```

**New — routes**
```
src/pages/design-lab/index.astro                  Chooser
src/pages/design-lab/chooser.css                  Neutral chooser chrome
src/pages/design-lab/<slug>/{index,about,blog}.astro   ×5 = 15 mock routes
```

**New — assets**
```
public/images/blog/{shipping,kaizen,atari,onlyfjs,perl}.jpg + README.txt
```

**Modified — source (2 files)**
```
astro.config.mjs     sitemap({ filter }) excluding /design-lab
netlify.toml         X-Robots-Tag header for /design-lab/*
```

**Modified — docs**
```
docs/PLANS.md                          active plan row
docs/product-specs/index.md            spec row
docs/product-specs/design-lab.md       new spec
docs/QUALITY_SCORE.md                  design-lab domain row
docs/exec-plans/tech-debt-tracker.md   6 entries (2 design-lab, 4 discovered)
docs/generated/README.md               SiteContent data contract
docs/references/testing-checklist.md   design-lab section; portfolio→spotlight
ARCHITECTURE.md                        domain row, subsystem section, file
                                       inventory, sitemap note; portfolio→spotlight
README.md                              Design lab section; portfolio→spotlight
```

**Untouched, deliberately:** `src/components/`, `src/layouts/`, `src/styles/`,
`src/pages/index.astro`, `src/pages/about.astro`, `src/pages/blog/**`, `src/consts.ts`.

## Summary

All 14 build steps landed as planned; no architectural deviations. 16 new routes
(15 mocks + chooser), 24 pages total in the build versus 8 before.

Deviations from the written plan, all additive:

- **`public/images/blog/` was not in the original file manifest.** Fixture
  `heroImage` paths pointed at a directory that did not exist, so blog cards
  rendered broken images. Resolved by copying existing placeholders to stable
  public paths rather than adding `astro:assets` plumbing to the mocks.
- **`SharedContent.nav` was dropped from the type.** The inventory correctly notes
  that navigation is a per-design decision rather than extracted content, and
  relative hrefs would not have resolved from nested mock routes. Layouts build
  their own nav from `mockPageUrl()`.
- **Apostrophes normalized to typographic (`’`)** across all prose. The live copy
  mixes straight and curly; mixed quote characters read as a defect in
  typography-led designs. Recorded in the inventory so it is not mistaken for
  altered content.
- **Four pre-existing doc/code disagreements were found and logged** (see below).
  ARCHITECTURE.md, README.md and testing-checklist.md were corrected from
  `portfolio` to `spotlight` per AGENTS.md rule 11, since the constant changed in
  commit `1667c7a`. The stale JSDoc in `src/lib/github-projects.ts:43` was left
  alone to keep this change set out of `src/lib/`.

Bugs found and fixed during implementation:

- Section classes clobbering the page gutter via `padding` shorthand (terminal,
  editorial) — only visible inside the chooser's narrow iframe.
- `box-sizing: border-box` from the shared reset making the terminal typewriter's
  caret border eat into its `ch` width and clip the final glyph.
- Videos rendering blank without `autoplay` in a JS-free page.
- Empty grid cells showing the container's border colour where the gap-as-border
  trick left unfilled tracks.
- Missing space and trailing period around the `sarcastic-quote` segments —
  fixed once in the data, correcting all five designs.
- Dossier's outside timeline label offsetting by its own width rather than sitting
  adjacent to its bar.

## Verification

**Style isolation — all 15 mock pages pass:** exactly one `/_astro/*.css` link
each and it is that design's own bundle; zero `<script>` tags; zero `--tw-`,
`data-design` or `@layer` in any mock stylesheet; zero cross-design prefix
contamination (terminal 77 `term-` rules and 0 `ed-`/`r80-`/`dos-`/`aur-`, and so
on for each).

**No Tailwind inflation:** building with `src/mocks/`, `src/data/` and
`src/pages/design-lab/` moved aside produces `MainLayout.B42m3ejS.css` at 98,847
bytes — byte-identical, same content hash, empty rule-level diff against the build
that includes them. The mocks add nothing to the live bundle.

**Content completeness:** an automated string check confirms all 15 pages carry
every section from the inventory — hero, taglines including `改善`, all three skill
groups, all three projects with their footnotes, the GitHub section including the
`No description provided yet.` fallback, all six employers, the full About
narrative with Atari 400 and Jojo, and all six blog fixtures.

**Live site regression:** `git status` shows exactly one modified source file
(`astro.config.mjs`, one line) plus `netlify.toml`; everything else is additive.
`/`, `/about/`, `/blog/` and blog posts all still link only `MainLayout.*.css`.
`sitemap-0.xml` contains the same 8 live URLs as the pre-change baseline and zero
`design-lab` entries. All 16 lab pages emit `noindex, nofollow`; zero live pages do.

**Manual, in a browser:** all five designs verified at full page height plus the
chooser exercised across designs, pages, all four width presets, and compare mode
with hash restore (`#aurora+dossier/blog`). The 375px preset correctly triggers
each design's own media queries.

**Note for future runs:** verify against `npm run build` + `npm run preview`. The
dev server injects Astro's dev toolbar into every page, including inside the
chooser's iframes, where it looks like a floating widget over the mock content.

## Follow-ups

1. ~~Owner picks a design.~~ **Done: Terminal**, 2026-07-29. Promoted in
   [promote-terminal-design](../completed/promote-terminal-design.md), which also
   removed the old override themes, `ColorPicker.astro` and Tailwind itself.
2. ~~Delete the lab once promotion lands.~~ **Done.** The lab was committed first
   (`a6f2595`) so the four unpicked designs stay recoverable, then removed.
3. **Blog content is still Astro-starter Lorem Ipsum.** The lab's six fixture posts
   are illustrative. Whatever design wins, the blog needs real posts or the section
   should be hidden.
4. **Tech debt logged** in
   [tech-debt-tracker.md](../tech-debt-tracker.md): content duplication between the
   live pages and `site-content.ts`; mocks shipping to production; the
   ColorPicker/MainLayout design-default mismatch (`artdeco` vs `classic`); the
   stale `portfolio` JSDoc; and AGENTS.md claiming no test command exists when
   `package.json` defines `vitest run`.

## Open questions

- ~~`dossier` timeline spine: proportional or evenly spaced?~~ Resolved 2026-07-29:
  proportional, with a minimum bar width and outside labels for short stints.
- Optional chooser notes field (localStorage-backed textarea per design) to record
  reactions while comparing — cheap, but it is tool-building rather than design
  work. Not built.
