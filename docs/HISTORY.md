# esison.dev — Project History

This document traces the project's development for agent context.

## Timeline at a glance

| Date       | Phase   | Milestone |
|------------|---------|-----------|
| 2026-04-07 | Phase 0 | Initial portfolio site with blog, GitHub project sync, contact reveal |

## Phases

### Phase 0: Foundation
**Date:** 2026-04-07
**Goal:** Ship a production-ready portfolio and blog site.

Built the core site with Astro 6 + Vue 3 islands architecture, deployed on
Netlify. Key features: static blog with MDX, build-time GitHub project sync
with `portfolio` topic filtering, serverless contact reveal with two-stage
Turnstile CAPTCHA, dark/light theme toggle.

## Version history

| Ver    | Changes |
|--------|---------|
| v0.1.0 | Added build-time GitHub project sync on the homepage, manual/scheduled Netlify refresh workflow support, and last-push metadata fixes for repo cards. |
