# Output & UI Conventions

Conventions for the esison.dev portfolio site's user-facing output and interface design.

The site has one design: **Terminal** — green phosphor on black, monospace
throughout, scanlines, prompt-style navigation. It was chosen from five candidates
built in the [design lab](exec-plans/completed/design-lab.md) and promoted in
[promote-terminal-design](exec-plans/completed/promote-terminal-design.md).

## Output principles

1. **Dark only.** There is no light mode and no theme toggle. Terminal's identity
   is the lit phosphor screen; a light variant would be a different design.
2. **Static-first, interactive where needed.** Pages render as static HTML. Vue
   islands hydrate client-side only for features that require interactivity
   (typewriter, matrix rain, modals).
3. **Graceful degradation.** When external data is unavailable (GitHub API down),
   the page still renders with a fallback panel — never a broken layout.
4. **Progressive disclosure for contact.** Contact info is gated behind CAPTCHA
   verification to reduce bot harvesting while keeping the UX simple for humans.
5. **Copy lives in data, not markup.** All page copy comes from
   [`src/data/site-content.ts`](../src/data/site-content.ts), mirrored in readable
   form in [content-inventory.md](content-inventory.md). Pages read from it; they
   do not hardcode strings.

## Styling

- **One stylesheet:** [`src/styles/terminal.css`](../src/styles/terminal.css),
  imported by `BaseHead.astro`. It carries its own reset — there is no framework
  CSS underneath it.
- **No Tailwind.** It was removed when Terminal shipped. Do not reintroduce utility
  classes: the previous design system was override sheets fighting utilities baked
  into markup, which is what made a Tailwind v4 upgrade break a modal.
- **Semantic class names, `term-` prefixed.** The prefix originally kept Tailwind's
  scanner from matching mock classes; it is retained as a namespace.
- **Design tokens are CSS custom properties on `:root`** — `--term-bg`,
  `--term-fg`, `--term-rule`, `--term-text`, and so on. Style against the tokens,
  never against raw hex values.
- **Section classes must use `padding-block`, never the `padding` shorthand.**
  Elements carry both `.term-shell` (which sets `padding-inline` for the page
  gutter) and a section class; both are single-class selectors, so a `padding`
  shorthand silently destroys the gutter. This is only visible at narrow widths,
  because `max-width` centering supplies incidental margins on wide screens.

## Typography

- **Everything:** JetBrains Mono 400/700 (Google Fonts, `display=swap`)
- **Blog prose:** `.term-prose` in `terminal.css` styles headings, paragraphs,
  links, lists, blockquotes, tables, inline code, `mark`, `kbd`, `abbr` and images
- **Code blocks:** Shiki with the `vesper` theme, configured in `astro.config.mjs`.
  Shiki writes its background and token colours as *inline styles*, so the theme
  choice — not CSS — decides how code blocks look. `vesper` is warm amber on
  near-black and sits inside the Terminal palette.

## Phosphor accent

- Four CRT-authentic options: green (P1, **default**), amber (P3), cyan, white (P4)
- Switched by `data-phosphor` on `<html>`; picker in
  [`PhosphorPicker.astro`](../src/components/PhosphorPicker.astro), values in
  [`src/lib/phosphors.ts`](../src/lib/phosphors.ts)
- **The default is the absence of the attribute** — green's values are the `:root`
  defaults and the other three phosphors are attribute rules. A corrupt or unknown
  stored value therefore matches no rule and renders as green rather than leaving
  accents unstyled. To change the default, move its token block into `:root` and
  give the previous default its own `[data-phosphor='...']` rule.
- Applied pre-paint by an `is:inline` script in `MainLayout.astro` to avoid a flash
- Persisted to `localStorage` under `phosphor`, wrapped in try/catch because
  localStorage throws in some privacy modes
- Changing it dispatches a `phosphor-changed` event; `MatrixRain.vue` listens so
  the canvas recolours with the accent

## Component conventions

- **Astro components** handle structure, SEO, and static rendering
- **Vue components** handle client-side interactivity only, with `client:load`
- Vue templates must not contain utility classes or take class names as props —
  style them with scoped CSS or `term-` classes
- Edit `HeaderCustom.astro` (not `Header.astro`) for header UI changes
- `MainLayout.astro` is the top-level wrapper; pass `page` so the nav can mark the
  current item with `aria-current="page"`
- `BlogPost.astro` extends MainLayout with blog-specific chrome

## Motion

- Scanlines and vignette are fixed overlays on `body::before` / `body::after`,
  with `pointer-events: none` so they never intercept clicks
- `prefers-reduced-motion: reduce` is honoured globally in `terminal.css`, and
  individually by `MatrixRain` (stops the canvas) and `TypewriterText` (shows the
  first tagline as static text instead of cycling)
- `MatrixRain` also pauses on `visibilitychange` so a hidden tab does no work
