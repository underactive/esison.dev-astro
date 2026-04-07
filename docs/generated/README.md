# Generated Schemas

This directory contains data contract schemas — either auto-generated from
code or hand-maintained to document the shape of key data types.

## Schemas

| Name | Source | Purpose |
|------|--------|---------|
| (none yet) | — | — |

Key data contracts to consider documenting:
- Blog post frontmatter schema (defined in `src/content.config.ts` via Zod)
- GitHub project normalized shape (defined in `src/lib/github-projects.ts`)
- Contact reveal request/response contract (defined in `netlify/functions/reveal_contact.js`)

## Keeping schemas in sync

When you add, rename, or change the shape of a data contract:
1. Update or regenerate the corresponding schema in this directory
2. Update this README table
3. Verify that consumers of the schema still work correctly
