# esison.dev — Agent Map

Personal portfolio and blog website for Eric Sison, built with Astro 6 as a static site with Vue 3 interactive islands, deployed on Netlify.

**Version:** 0.1.0 — **Status:** Production-ready

## Quick orientation

| What you need              | Where to look                          |
|----------------------------|----------------------------------------|
| Domain model & layering    | [ARCHITECTURE.md](ARCHITECTURE.md)     |
| Design principles          | [docs/design-docs/core-beliefs.md](docs/design-docs/core-beliefs.md) |
| Product specs & user flows | [docs/product-specs/index.md](docs/product-specs/index.md) |
| Current execution plans    | [docs/exec-plans/active/](docs/exec-plans/active/) |
| Completed plans & history  | [docs/exec-plans/completed/](docs/exec-plans/completed/) |
| Known tech debt            | [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md) |
| Quality grades by domain   | [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md) |
| Output & UI conventions    | [docs/DESIGN.md](docs/DESIGN.md)       |
| Reliability requirements   | [docs/RELIABILITY.md](docs/RELIABILITY.md) |
| Security boundaries        | [docs/SECURITY.md](docs/SECURITY.md)   |
| Product sense & taste      | [docs/PRODUCT_SENSE.md](docs/PRODUCT_SENSE.md) |
| Plan index                 | [docs/PLANS.md](docs/PLANS.md)         |
| Reference material         | [docs/references/](docs/references/)   |

## Repo conventions

- **Language:** TypeScript (strict mode) + Astro 6 templates + Vue 3 SFCs
- **Boundaries:** Validate all external input at system edges (API responses, user input, Turnstile tokens). Interior code trusts typed interfaces.
- **Tests:** No automated test suite yet. Manual smoke checklist in [docs/references/testing-checklist.md](docs/references/testing-checklist.md).
- **Logging:** No structured logging. Build-time failures surface as actionable fallback UI states.
- **Naming:** PascalCase components (`BaseHead.astro`, `TypewriterText.vue`), camelCase utilities and constants (`consts.ts`), kebab-case config files.
- **File size:** Keep files focused. Split when a file serves multiple unrelated concerns.
- **Imports:** No circular imports. Astro components import Vue components (not vice versa). Vue components are client-side only.
- **Indentation:** Tabs in Astro/config files, consistent within each file.

## Agent workflow

1. Read this file first for orientation.
2. Check the relevant section in the table above for your task domain.
3. For complex work (3+ domains, sequential dependencies, non-obvious
   decisions, or multi-session scope), check
   [docs/exec-plans/active/](docs/exec-plans/active/) for an existing plan.
   If none exists, **create one** using the template in
   [docs/PLANS.md](docs/PLANS.md) before starting implementation.
   Update [docs/PLANS.md](docs/PLANS.md) index when adding or completing plans.
4. No automated test command or lint command configured yet.
5. If you add a new domain or package, update [ARCHITECTURE.md](ARCHITECTURE.md).
6. If you add or change a user-facing behavior, update the relevant spec in
   [docs/product-specs/](docs/product-specs/). If no spec exists for the
   feature, **create one** using the template at
   [docs/product-specs/_template.md](docs/product-specs/_template.md) and
   add it to the index in
   [docs/product-specs/index.md](docs/product-specs/index.md).
7. If you ship or significantly change a domain, update its grade in
   [docs/QUALITY_SCORE.md](docs/QUALITY_SCORE.md). Add new domains to the
   table. Downgrade if you introduced debt; upgrade if you added tests or
   hardened the module.
8. If you add, rename, or change the shape of a data contract, update the
   corresponding schema in [docs/generated/](docs/generated/) and its
   [README](docs/generated/README.md).
9. If you discover tech debt, log it in
   [docs/exec-plans/tech-debt-tracker.md](docs/exec-plans/tech-debt-tracker.md).
10. If you change user-facing interfaces, defaults, or configuration, update
    [README.md](README.md) to match.
11. Keep all documentation in sync with the codebase. If the code and a doc
    disagree, the doc is wrong — fix it as part of the implementation.

## What NOT to do

- Do not put long instructions in this file. Add them to the appropriate doc
  and link from here.
- Do not skip boundary validation because "it's just internal."
- Do not add dependencies that can't be reasoned about from their types alone.
- Do not leave undocumented magic strings or environment variables.
- Do not silently fail — report errors with actionable feedback.
