# Generated Schemas

This directory contains data contract schemas — either auto-generated from
code or hand-maintained to document the shape of key data types.

## Schemas

| Name | Source | Purpose |
|------|--------|---------|
| `SiteContent` | [`src/data/site-content.ts`](../../src/data/site-content.ts) — the TypeScript module is authoritative | **The site's copy layer.** Every page reads from it; nothing hardcodes strings. Human-readable mirror in [content-inventory.md](../content-inventory.md) |
| `Phosphor` | [`src/lib/phosphors.ts`](../../src/lib/phosphors.ts) | The four CRT accent options and the `phosphor` localStorage contract |
| `NavItem` | [`src/lib/nav.ts`](../../src/lib/nav.ts) | Main navigation items and the `NavPage` values `MainLayout` accepts |

### `SiteContent` notes

The interfaces are exported from the module itself rather than duplicated here,
so the compiler enforces the contract. Two things are not visible from the types:

- **`InlineSegment` exists so prose can carry meaning without carrying markup.**
  The homepage bio's `<sarcastic-quote>` gag is stored as tagged segments, not an
  HTML string, so presentation stays in CSS. Rendering it with `set:html` would
  put one design's markup into the content layer.
- **`copyright` is a function** (`(year: number) => string`) so the footer year is
  computed at build time rather than frozen into the data.

### `Phosphor` notes

**`DEFAULT_PHOSPHOR` (green) is represented by the absence of the `data-phosphor`
attribute** — its values are the `:root` defaults in `terminal.css`, and the other
three phosphors are attribute rules. This is load-bearing: an unknown or corrupt
stored value matches no attribute rule and renders as the default, so the pre-paint
script needs no validation branch.

Changing the default is therefore a two-part edit: move the new default's token
block into `:root`, and give the previous default its own `[data-phosphor='...']`
rule. `NON_DEFAULT_PHOSPHOR_IDS` exists so the id list stays derivable, but the
pre-paint script in `MainLayout.astro` hardcodes it — it must run before any module
loads, so it cannot import from here. Keep the two in sync.

Key data contracts still to document:
- Blog post frontmatter schema (defined in `src/content.config.ts` via Zod)
- GitHub project normalized shape (defined in `src/lib/github-projects.ts`)
- Contact reveal request/response contract (defined in `netlify/functions/reveal_contact.js`)

## Keeping schemas in sync

When you add, rename, or change the shape of a data contract:
1. Update or regenerate the corresponding schema in this directory
2. Update this README table
3. Verify that consumers of the schema still work correctly
