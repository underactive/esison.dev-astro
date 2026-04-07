# Plans Index

Plans are first-class artifacts in this project. Complex work gets an execution
plan checked into the repo. Small changes use ephemeral plans (inline in the
PR description or a task tool).

## Active plans

| Plan | Goal | Owner | Started |
|------|------|-------|---------|
| (none) | — | — | — |

See [exec-plans/active/](exec-plans/active/) for full plan documents.

## Completed plans

| Plan | Goal | Completed |
|------|------|-----------|
| [sync-github-projects](exec-plans/completed/sync-github-projects.md) | Build-time GitHub repo sync on homepage | 2026-04-07 |
| [fix-github-project-metadata](exec-plans/completed/fix-github-project-metadata.md) | Display push date instead of metadata date | 2026-04-07 |

See [exec-plans/completed/](exec-plans/completed/) for full plan documents.

## Creating a plan

Use an execution plan when the work:
- Touches 3+ domains or files
- Requires multiple sequential steps with dependencies
- Involves a non-obvious architectural decision
- Will take more than one session to complete

### Plan template

```markdown
# Plan: <title>

**Goal:** One sentence.
**Status:** Active | Blocked | Completed
**Started:** YYYY-MM-DD

## Context
Why this work is needed.

## Steps
- [ ] Step 1
- [ ] Step 2

## Decisions
- YYYY-MM-DD: Decided X because Y.

## Open questions
- Question?
```

Save to `docs/exec-plans/active/<slug>.md`. Move to `completed/` when done.

### Post-implementation

After completing a plan, append the following sections to the plan document
before moving it to `completed/`:

- **Files changed** — list of all files created, modified, or deleted
- **Summary** — what was actually implemented (noting deviations from the plan)
- **Verification** — steps taken to verify correctness
- **Follow-ups** — remaining work or future improvements identified

### Post-implementation audit

After implementation, run parallel audit subagents scoped to changed files
and their immediate dependents. Write a consolidated audit section in the
plan document covering:

1. **QA** — functional correctness, edge cases, infinite loops, performance
2. **Security** — injection, overflows, memory leaks, hard crashes
3. **Interface contracts** — data shape mismatches, error handling, auth flows
4. **State management** — mutation discipline, reactivity pitfalls, data flow
5. **Resource & concurrency** — data races, resource lifecycle, timing
6. **Testing coverage** — missing tests, test quality, integration gaps
7. **DX & maintainability** — readability, dead code, naming, documentation

Mark fixed findings with `[FIXED]`. Leave unresolved items unmarked with
a note explaining why they were deferred.
