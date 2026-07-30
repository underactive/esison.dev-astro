# Plan: Promote the Terminal design site-wide

**Goal:** Make Terminal the site's only design — hand-rolled semantic CSS replacing every Tailwind utility, dark-only, with a phosphor accent picker — and remove Tailwind and the old override themes.
**Status:** Completed
**Completed:** 2026-07-29
**Started:** 2026-07-29

## Context

The [design lab](design-lab.md) built five candidate designs over the real site
content. The owner picked **Terminal**: amber phosphor on black, monospace
throughout, scanlines, prompt-style navigation.

This plan promotes it. The lab deliberately produced portable CSS for exactly this
moment — `src/mocks/terminal/terminal.css` is self-contained semantic CSS over a
reset, so it lifts into the real site rather than needing a rewrite.

Three things the lab never covered and must be built now:

1. **Markdown prose styling.** `src/layouts/BlogPost.astro:51-59` uses nine
   `prose-*` variants from `@tailwindcss/typography`. Terminal needs its own prose
   CSS for headings, paragraphs, links, code, `pre`, blockquotes, lists, tables and
   images. This is the largest piece of genuinely new work.
2. **The three modals.** `CVModal.vue`, `ContactModal.vue` and `ImageModal.vue` are
   Tailwind-heavy and were rendered inert in the mocks.
3. **`ColorPicker.astro`** — 539 lines of Design Style, 8 accent colors and 16
   background gradients.

### Scope decisions (confirmed with owner)

| Decision | Choice |
|---|---|
| Light mode | **Removed.** Dark only. Toggle button, `dark:` variants, `theme` localStorage key and the MutationObserver all go |
| ColorPicker | **Becomes a phosphor picker** — amber `#ffb000`, green `#33ff33`, cyan `#22d3ee`, white `#e8e8e8`. Drives `--term-fg*` variables, no `!important` |
| Vue islands | **`MatrixRain` and `TypewriterText` both kept**, recolored and rewritten Tailwind-free. Preserves cycling of all three taglines with their `durationSeconds` |
| Tailwind | **Removed, as the final slice** — after everything is converted, so a lingering dependency breaks the build before the removal lands |

### Why the `term-` prefix stays

The prefix existed so Tailwind's scanner could not mistake mock classes for utility
candidates. Once Tailwind is gone that reason expires, but renaming 77 selectors and
every markup reference is pure churn with real risk and no benefit. It also remains a
clear namespace. Keeping it.

## Steps

Each slice ends with a build and a visual check. The site stays shippable
throughout — Tailwind is only removed once nothing references it.

- [x] 1. Create this plan; add to `docs/PLANS.md`; write `docs/product-specs/terminal-design.md`
- [x] 2. **Design system.** Promote `terminal.css` → `src/styles/terminal.css`. Add phosphor variables on `:root`, prose CSS for markdown, and modal/form CSS. Keep the reset (fold `_shared/reset.css` in)
- [x] 3. **MainLayout.** Drop the dark toggle, parallax blobs and `data-design`; add the phosphor init script; import `terminal.css`
- [x] 4. **Header + Footer + phosphor picker.** Convert to `term-` classes; replace `ColorPicker.astro` with `PhosphorPicker.astro`; delete `theme-presets.ts`
- [x] 5. **Homepage.** Rewrite `index.astro` from the mock, wired to the real `GitHubProjectsSection`, `TypewriterText` and `MatrixRain`
- [x] 6. **GitHubProjectsSection.** Convert to `term-` classes, keeping the error and empty states
- [x] 7. **About page.** Rewrite from the mock, with the real CV/Contact/Image modals wired back in
- [x] 8. **Blog index.** Rewrite from the mock, reading the real content collection instead of fixtures
- [x] 9. **Blog post + prose.** Rewrite `BlogPost.astro`; verify against `markdown-style-guide.md`, which exercises every element
- [x] 10. **Vue islands.** `TypewriterText`, `MatrixRain` recolored; `LoadingSpinner`, `ErrorMessage`, `ContactInfo`, `VerificationSection`, `PhoneRevealButton`
- [x] 11. **Modals.** `CVModal`, `ContactModal`, `ImageModal`
- [x] 12. **Delete the old themes.** `design-modern.css`, `design-artdeco.css`, and every `dark:` variant left anywhere
- [x] 13. **Remove Tailwind.** Dependencies, `tailwind.config.js`, the Vite plugin, and the `@import`/`@config` lines in `global.css`
- [x] 14. **Retire the design lab.** Delete `src/mocks/`, `src/pages/design-lab/`, `public/images/blog/`; revert the sitemap filter and the `netlify.toml` header; move the lab plan to `completed/`
- [x] 15. Full verification pass and documentation closeout

**Ordering rationale.** Slice 2 first because everything downstream consumes those
tokens. Slice 9 (prose) is the riskiest new work and is deliberately placed after the
simpler pages, so the type scale and color roles are settled before styling markdown
against them. Slice 13 must follow 12: deleting Tailwind while a `dark:` variant
survives would fail the build in a confusing way. Slice 14 is last because the mocks
are the reference material for slices 5–8 — deleting them earlier would mean working
from git history.

## Decisions

- 2026-07-29: **Dark only; the light/dark toggle is removed entirely.** Terminal's
  identity is the lit phosphor screen, so a light variant is really a different
  design. Removing it deletes the toggle button, all `dark:` variants, the `theme`
  localStorage key and the MutationObserver in `MainLayout.astro`. The `theme` domain
  shrinks to just the phosphor choice.
- 2026-07-29: **The accent picker becomes a phosphor picker** with four CRT-authentic
  options. Cheap because Terminal's CSS is already variable-driven — it rewrites
  `--term-fg`, `--term-fg-dim` and `--term-fg-bright` on `<html>` instead of emitting
  `!important` overrides for Tailwind utility classes, which is what made the old
  ColorPicker fight the markup. The 16 background gradients are dropped: they fight a
  flat black screen.
- 2026-07-29: **`MatrixRain` and `TypewriterText` are kept, not replaced by the mock's
  CSS animation.** The CSS typewriter types only the first tagline; `TypewriterText`
  cycles all three with their per-line `durationSeconds`, which is real content in
  `site-content.ts`. Matrix rain is thematically native to Terminal. Both get
  Tailwind-free templates.
- 2026-07-29: **The `term-` prefix is retained** even though its original reason
  (Tailwind's content scanner) disappears with Tailwind. Renaming 77 selectors plus
  every markup reference is churn with risk and no benefit.
- 2026-07-29: **Tailwind is removed in the final slice, not the first.** Converting
  everything first means any missed dependency surfaces as a build failure before the
  removal commit, rather than as a silent visual regression after it.
- 2026-07-29: **`src/data/site-content.ts` becomes the real content source**, not just
  the lab's. Promoting it resolves the duplication tech-debt entry rather than leaving
  copy in two places: the pages now read from the typed module, and
  `docs/content-inventory.md` becomes its readable mirror.

## Open questions

- **Unresolved:** should the blog keep its five Astro-starter Lorem Ipsum posts, or be
  hidden until there is real writing? Blog is in the main nav, so visitors currently
  reach placeholder text. Logged in
  [tech-debt-tracker.md](../tech-debt-tracker.md). Note that
  `markdown-style-guide.md` is now the only coverage for `.term-prose`, so it should
  not be deleted without replacing that verification.

## Files changed

**New**
```
src/styles/terminal.css          The site's only stylesheet (reset, tokens,
                                 components, prose, modals, forms)
src/components/PhosphorPicker.astro
src/lib/phosphors.ts             Phosphor values + localStorage contract
src/lib/nav.ts                   Nav items and NavPage type
docs/product-specs/terminal-design.md
```

**Rewritten**
```
src/pages/index.astro            123 class attrs -> semantic term- classes
src/pages/about.astro            modals rewired via data-open-modal
src/pages/blog/index.astro       reads the real collection
src/layouts/MainLayout.astro     dark toggle, parallax, data-design all removed;
                                 pre-paint phosphor script added
src/layouts/BlogPost.astro       9 prose-* variants -> .term-prose
src/components/HeaderCustom.astro
src/components/Header.astro      forwards `page`
src/components/Footer.astro
src/components/GitHubProjectsSection.astro
src/components/Button.astro
src/components/TypewriterText.vue   Tailwind + light-mode detection removed;
                                    CRT green -> var(--term-fg)
src/components/MatrixRain.vue       purple -> phosphor via phosphor-changed
src/components/CVModal.vue
src/components/ContactModal.vue     template only; Turnstile logic untouched
src/components/ImageModal.vue
src/components/ContactInfo.vue      now click-to-contact
src/components/LoadingSpinner.vue
src/components/ErrorMessage.vue
src/components/VerificationSection.vue
src/components/PhoneRevealButton.vue
src/components/BaseHead.astro       one stylesheet; JetBrains Mono only
```

**Deleted**
```
src/styles/global.css            Tailwind entry + Atkinson @font-face
src/styles/design-modern.css     ~770-line !important override sheet
src/styles/design-artdeco.css    ~770-line !important override sheet
src/components/ColorPicker.astro 539 lines
src/components/HeaderLink.astro  unused
src/lib/theme-presets.ts         only ColorPicker used it
tailwind.config.js
public/fonts/atkinson-*.woff     only global.css referenced them
src/mocks/                       design lab (committed first: a6f2595)
src/pages/design-lab/            design lab
public/images/blog/              design lab placeholders
```

**Modified**
```
astro.config.mjs      Tailwind Vite plugin removed; shikiConfig.theme 'vesper';
                      sitemap filter reverted
package.json          tailwindcss, @tailwindcss/vite, @tailwindcss/typography removed
netlify.toml          design-lab X-Robots-Tag block removed
src/lib/github-projects.ts   JSDoc: `portfolio` -> `spotlight`
```

**Docs:** ARCHITECTURE.md, README.md, AGENTS.md, docs/DESIGN.md (rewritten),
docs/PRODUCT_SENSE.md, docs/PLANS.md, docs/QUALITY_SCORE.md,
docs/generated/README.md, docs/references/testing-checklist.md,
docs/exec-plans/tech-debt-tracker.md, docs/product-specs/index.md,
docs/exec-plans/completed/design-lab.md.

## Summary

All 15 slices landed. The site is now a single hand-rolled stylesheet with no CSS
framework, dark only, with a four-option CRT phosphor accent.

Deviations from the plan, all deliberate:

- **`TypewriterText` and `MatrixRain` were converted during slice 5, not slice 10.**
  The homepage hero depends on both, so deferring them would have meant shipping a
  broken hero for five slices.
- **`Button.astro` was deleted, then restored.** It looked unused because the search
  covered `.astro` and `.vue` only — it is imported by
  `src/content/blog/using-mdx.mdx`. The build caught it immediately
  (`Could not resolve "../../components/Button.astro"`). Restored, rewritten in
  Terminal CSS. **MDX files can import components; include them in usage searches.**
- **Code block styling was solved by configuration, not CSS.** Shiki writes its
  theme background and token colours as *inline styles*, so no stylesheet can
  restyle them. Switched the theme from `github-dark` (slate blue) to `vesper`
  (warm amber on near-black).
- **`src/data/site-content.ts` was promoted from lab fixture to the real copy
  layer**, resolving the content-duplication debt by removing the duplication
  rather than reconciling it. The fixture arrays are gone; live GitHub data and the
  real blog collection are used again.
- **The design lab was committed before deletion** (`a6f2595`), because it was never
  tracked and the four unpicked designs would otherwise have been unrecoverable.

## Verification

`npm run build` succeeds; 8 pages, one 20,514-byte stylesheet.

**Framework removal:** no `tailwind*` in `package.json`, no `node_modules/tailwindcss`,
no `tailwind.config.js`, no `global.css`, zero `--tw-` custom properties in the
built CSS, zero `dark:` variants anywhere in `src/`. **CSS payload dropped from
98,847 to 20,514 bytes (-79%)** — the old figure was one bundle containing Tailwind
plus both override sheets.

**Phosphor:** all four values verified in-browser, each recolouring logo, nav,
headings, borders, buttons, section labels *and* the matrix rain canvas. Three
`[data-phosphor=...]` rule sets present in the built CSS (amber being the `:root`
default). Pre-paint script present on all 8 pages. Zero `theme` / `design-theme` /
`toggleTheme` references remain.

**Pages:** all 8 routes return 200 (`/`, `/about/`, `/blog/`, three posts,
`/rss.xml`, `/sitemap-index.xml`). Sitemap has the same 8 entries as before with no
`design-lab` residue.

**Prose:** verified against `markdown-style-guide.md`, which exercises headings,
lists, nested lists, blockquotes, tables, code blocks, images, `mark`, `kbd`,
`abbr`, `sub`/`sup` and footnotes. `using-mdx.mdx` renders with its imported
`Button`.

**Interactive:** CV modal opens; its inline `reach out to me` correctly closes it
and chains to the Contact modal; the Contact modal renders the Terminal error panel
with a working `Try again` when `PUBLIC_TURNSTILE_SITE_KEY` is absent.

**Not verified locally:** the two-stage Turnstile CAPTCHA success path, which needs
a deploy with `PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET` set. The modal,
error and retry states were verified; the reveal path was not. This is the one
acceptance criterion in
[terminal-design.md](../../product-specs/terminal-design.md) left unchecked.

## Follow-ups

1. **Verify the contact reveal on a deploy preview** with Turnstile env vars set —
   the only unverified acceptance criterion.
2. **Decide the blog question.** Five Astro-starter placeholder posts are reachable
   from the main nav. Publish real writing or hide the section. Keep
   `markdown-style-guide.md` either way: it is the only coverage for `.term-prose`.
3. **Consider a second phosphor-aware Shiki theme.** Code blocks stay warm amber
   regardless of the selected phosphor, since Shiki inlines its colours. Fixing this
   properly means a custom theme per phosphor, or a CSS-variable-based theme.
4. **No visual regression testing.** The whole design is now one hand-written
   stylesheet with a documented footgun (`padding-block` on section classes).
   Screenshot tests would earn their keep here.
5. **`prefers-reduced-motion` was verified only by code inspection** for the
   scanlines and typewriter; exercise it in a browser with the OS setting enabled.
