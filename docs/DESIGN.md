# Output & UI Conventions

Conventions for the esison.dev portfolio site's user-facing output and interface design.

## Output principles

1. **Dark by default.** First-time visitors see dark mode. Theme preference is
   persisted to localStorage on subsequent visits.
2. **Static-first, interactive where needed.** Pages render as static HTML.
   Vue islands hydrate client-side only for features that require interactivity
   (typewriter effect, modals, matrix rain).
3. **Graceful degradation.** When external data is unavailable (GitHub API down),
   the page still renders with a fallback message — never a broken layout.
4. **Progressive disclosure for contact.** Contact info is gated behind CAPTCHA
   verification to reduce bot harvesting while keeping the UX simple for humans.

## Typography

- **Headings:** Righteous font (Google Fonts, externally loaded)
- **Body:** Atkinson Hyperlegible (self-hosted from `public/fonts/`)
- **Blog prose:** `prose-purple` custom Tailwind typography theme with purple
  accent colors, including full dark mode invert variants

## Component conventions

- **Astro components** handle structure, SEO, and static rendering
- **Vue components** handle client-side interactivity only
- All Vue components use `client:load` for immediate hydration
- Edit `HeaderCustom.astro` (not `Header.astro`) for header UI changes
- `MainLayout.astro` is the top-level wrapper for all pages
- `BlogPost.astro` extends MainLayout with blog-specific chrome

## Theme toggle

- Class-based: `dark` class on `<html>` element
- Global `window.toggleTheme()` function (defined in MainLayout)
- MutationObserver syncs class changes to localStorage
- Tailwind `dark:` variants handle all dark mode styling
