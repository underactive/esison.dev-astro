# Quality Score

Tracks the current quality grade of each domain and architectural layer.
Updated as domains are built. Agents and humans use this to prioritize
cleanup and investment.

## Grading scale

| Grade | Meaning                                                    |
|-------|-----------------------------------------------------------|
| A     | Well-tested, documented, agent-legible, no known debt      |
| B     | Functional and tested, minor gaps in docs or edge cases    |
| C     | Works but has known debt, missing tests, or unclear naming |
| D     | Fragile, undertested, or structurally problematic          |
| F     | Broken or placeholder only                                 |

## Domain grades

| Domain           | Grade | Notes                                          | Last reviewed |
|------------------|-------|-------------------------------------------------|---------------|
| `blog`           | C     | Works, no automated tests, schema is solid      | 2026-04-07    |
| `github-sync`    | B     | Validated, audited, fallbacks in place, no automated tests | 2026-04-07 |
| `contact-reveal` | B     | Two-stage CAPTCHA, rate limiting, no automated tests | 2026-04-07 |
| `theme`          | C+    | Works, persists, no tests or edge case handling  | 2026-04-07    |
| `layout`         | C     | Functional, no tests                             | 2026-04-07    |

## Cross-cutting grades

| Concern           | Grade | Notes                                          | Last reviewed |
|-------------------|-------|-------------------------------------------------|---------------|
| Testing           | D     | No automated test suite; manual checklist only  | 2026-04-07    |
| Linting           | F     | No linter or formatter configured               | 2026-04-07    |
| Documentation     | B     | Comprehensive AGENTS.md harness in place        | 2026-04-07    |
| Security          | B     | Input validation at boundaries, CAPTCHA, rate limiting | 2026-04-07 |

## Process

- Review and update grades when a domain ships or changes significantly.
- A domain at grade C or below should have an entry in
  [tech-debt-tracker.md](exec-plans/tech-debt-tracker.md).
- Background cleanup tasks target the lowest-graded domains first.
- Manual smoke tests are tracked in [docs/references/testing-checklist.md](references/testing-checklist.md).
