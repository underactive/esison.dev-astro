# Core Beliefs

Development principles for the esison.dev project.

## 1. Validate at the boundary, trust the interior

Every value arriving from an external source (GitHub API, user input, Turnstile
token) must be validated before use. Interior code operates on typed, validated
objects and does not re-check. The `reveal_contact.js` function demonstrates
this pattern with honeypot checks, timing validation, and CAPTCHA verification.

## 2. Guard all indexed lookups

Any value used as an index into an array must have a bounds check before access:
`(val < COUNT) ? ARRAY[val] : fallback`. This is defense-in-depth against
corrupt or unvalidated values.

## 3. Use symbolic constants, not magic numbers

Never hardcode string literals or numeric constants — use `src/consts.ts` for
site-wide values. When data structures are reordered, update both the data and
all symbolic references together.

## 4. Report errors, don't silently fail

When input exceeds limits or operations fail, provide actionable error feedback
to the caller. Never silently truncate, drop, or ignore errors.

## 5. Repository is the system of record

Every decision, spec, and convention lives in the repo. If it's not
discoverable by an agent reading the repo, it doesn't exist.

## 6. Agents execute, humans steer

Optimize for leverage: invest human attention in system design, boundary
definitions, and feedback loops — not in writing boilerplate. When an agent
struggles, ask "what context is missing?" rather than doing it manually.

## 7. Progressive disclosure over front-loading

AGENTS.md is a map, not a manual. Agents start with a small entry point and
follow links to deeper context as needed. This respects context windows and
keeps agents focused on the task at hand.

## 8. Plans are artifacts, not conversations

Complex work is captured in execution plans checked into the repo with progress
logs and decision records. Plans are versioned, reviewable, and discoverable
by agents.

## 9. Prefer boring technology

Choose dependencies and patterns that are composable, stable, and
well-represented in agent training data. When a third-party package is opaque
or over-featured, prefer reimplementing the subset you need with full test
coverage.

## 10. Garbage-collect continuously

Technical debt compounds. Bad patterns replicate because agents copy what
exists. Capture taste as principles and enforce them. Small, targeted cleanup
is cheaper than periodic rewrites.
