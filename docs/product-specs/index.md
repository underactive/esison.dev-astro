# Product Specs Index

Product specs define user-facing behavior and acceptance criteria. Agents
reference these to understand what the product should do, not just how the
code is structured.

## Core user flow

1. Visitor lands on homepage — sees hero, skills, featured projects
2. Visitor scrolls to GitHub projects section — sees live repo cards
3. Visitor clicks "Contact" — modal opens with Turnstile CAPTCHA
4. Visitor completes CAPTCHA — email is revealed
5. Visitor optionally requests phone — second CAPTCHA, phone revealed
6. Visitor navigates to blog — reads posts sorted by date

## Specs

| Spec | Status | Description |
|------|--------|-------------|
| (none yet) | — | — |

## Writing specs

Each spec should define:
- **User story:** Who wants what and why
- **Acceptance criteria:** Observable behaviors that must be true
- **Edge cases:** What happens when input is invalid, services fail, or timeouts occur
- **Not in scope:** Explicitly state what this spec does NOT cover
