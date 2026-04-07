# esison.dev

Personal portfolio and blog for Eric Sison, built with [Astro 6](https://astro.build/) and [Vue 3](https://vuejs.org/) interactive islands. Deployed on [Netlify](https://www.netlify.com/).

## Prerequisites

- Node.js v24+ (tested with v24.4.0)
- npm v11+ (tested with v11.4.2)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/) (optional, for testing serverless functions locally)

## Setup

```bash
git clone <repo-url>
cd esison.dev-astro
git lfs pull            # fetch large media files in public/images/ and public/videos/
npm install
```

Create a `.env` file in the project root with the following variables:

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `TURNSTILE_SECRET` | Cloudflare Turnstile server-side secret key (used by the contact reveal function) |
| `CONTACT_EMAIL` | Email address returned by the contact reveal function |
| `PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile client-side site key |

### Optional Environment Variables

| Variable | Description |
|----------|-------------|
| `CONTACT_PHONE` | Phone number returned by the contact reveal function (second CAPTCHA stage) |
| `ENABLE_GITHUB_PROJECTS` | Set to `'false'` to hide the homepage GitHub projects section (enabled by default) |
| `GITHUB_TOKEN` | GitHub personal access token for build-time repo API requests (raises rate limits) |
| `PUBLIC_SITE_NAME` | Site display name (defaults to `esison.dev`) |
| `PUBLIC_SITE_URL` | Canonical site URL |

## Development

```bash
npm run dev             # Dev server at localhost:4321
npm run build           # Production build to ./dist/
npm run preview         # Preview production build locally
```

The contact modal relies on the `reveal_contact` Netlify serverless function in `netlify/functions/`. To test it locally, use `netlify dev` instead of `npm run dev`.

## Key Features

- **Blog** -- Markdown/MDX content collections in `src/content/blog/`, with RSS and sitemap generation
- **Contact reveal** -- Two-stage Cloudflare Turnstile CAPTCHA protecting contact info, served via a Netlify serverless function with anti-bot measures
- **GitHub projects sync** -- Public repos tagged with the `portfolio` topic appear on the homepage at build time. A [scheduled GitHub Action](.github/workflows/refresh-github-projects.yml) triggers Netlify rebuilds every 6 hours to keep them current
- **Dark mode** -- Class-based theme toggle, defaults to dark, persisted in localStorage

## Deployment

The site is deployed on Netlify as a static build.

For the GitHub projects scheduled refresh to work, add a `NETLIFY_BUILD_HOOK_URL` secret to the GitHub repository's Actions settings. This allows the scheduled workflow to trigger Netlify rebuilds so that repository changes propagate to the homepage automatically.

All server-side secrets (`TURNSTILE_SECRET`, `CONTACT_EMAIL`, `CONTACT_PHONE`) must be configured in the Netlify dashboard under site environment variables.

## Architecture

See [CLAUDE.md](CLAUDE.md) for detailed architecture documentation, development rules, and file inventory.
