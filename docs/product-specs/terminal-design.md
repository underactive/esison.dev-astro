# Spec: Terminal design

## User story

As a visitor, I want the site to present Eric's work as a coherent, characterful
terminal session, so that the design itself signals what he does — rather than
looking like a generic template with a color picker bolted on.

## Acceptance criteria

- [x] Every page renders in the Terminal design: amber-on-black, monospace, scanlines, prompt-style navigation
- [x] No page uses a Tailwind utility class, and Tailwind is not a project dependency
- [x] The site is dark only — there is no light/dark toggle and no `theme` localStorage key
- [x] A phosphor picker offers amber, green, cyan and white; the choice persists across reloads and applies before first paint
- [x] Changing phosphor recolors every accent on the page via CSS custom properties, with no `!important` rules
- [x] The hero typewriter cycles all three taglines using their configured per-line durations
- [x] Matrix rain renders behind the hero in the active phosphor color
- [x] Blog post markdown renders with Terminal prose styling for headings, paragraphs, links, inline code, code blocks, blockquotes, lists, tables and images
- [x] The CV, Contact and Image modals are fully functional and Terminal-styled
- [ ] The contact reveal flow still works end to end, including both Turnstile stages
      — *modal, error and retry states verified locally; the CAPTCHA path needs a
      deploy with `PUBLIC_TURNSTILE_SITE_KEY` set*
- [x] All page copy comes from `src/data/site-content.ts` — no copy is duplicated in markup

## Edge cases

| Scenario | Expected behavior |
|----------|-------------------|
| First-time visitor, no stored phosphor | Amber, applied before first paint with no flash |
| Corrupt or unknown phosphor value in localStorage | Falls back to amber rather than rendering unstyled accents |
| JavaScript disabled | Page is fully readable and navigable; typewriter shows the first tagline as static text, matrix rain is absent, modals are unreachable but their trigger buttons do not appear broken |
| `prefers-reduced-motion: reduce` | Scanlines stay static, matrix rain and typewriter animation are suppressed |
| GitHub unreachable at build time | Repo section renders the Terminal-styled error panel, not a broken grid |
| No repos tagged `spotlight` | Terminal-styled empty state |
| Blog collection is empty | Terminal-styled empty state ("No posts yet") |
| Blog post with no `heroImage` | Header renders without a hero region rather than leaving a gap |
| Very long blog post title | Wraps without overflowing the header |
| Markdown containing a wide table or long code block | Scrolls horizontally within its container instead of breaking the page layout |

## Not in scope

- A light or "paper" variant of Terminal
- Background gradient presets (dropped with the old ColorPicker)
- The other four candidate designs and the design lab — deleted once this ships
- Replacing the five Astro-starter Lorem Ipsum blog posts with real writing
- Adding automated tests (the project still has none)
