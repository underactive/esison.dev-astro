# Security

Security boundaries for the esison.dev portfolio site.

## Threat model

1. **External input is untrusted.** Data from the GitHub API, Turnstile tokens,
   and user-submitted form fields (honeypot, timing) may be malformed,
   unexpected, or adversarial. All external data is validated before use.

2. **Contact info is sensitive.** Email and phone are stored in server-side env
   vars and revealed only after CAPTCHA verification. The serverless function
   never returns contact data without a verified Turnstile token.

3. **Credentials are environment-managed.** API keys (`GITHUB_TOKEN`,
   `TURNSTILE_SECRET`) live in environment variables or Netlify/GitHub secrets.
   They are never committed to the repository or exposed to the client.

4. **GitHub homepage URLs are untrusted.** Repository homepage metadata from
   GitHub is restricted to `http:` and `https:` schemes before rendering as
   links. Bare domains get a safe `https://` prefix. Unsafe schemes
   (`javascript:`, `data:`, etc.) are blocked.

## Rules

- **No eval or dynamic code execution on external input.** Ever.
- **No shell interpolation of external data.** The serverless function and
  build-time fetcher use structured APIs, not string concatenation.
- **GitHub homepage links are scheme-validated.** Only `http:` and `https:`
  URLs are rendered. Non-HTTP schemes are silently dropped.
- **Turnstile tokens are single-use.** Each verification consumes the token.
  `captcha-invalid` responses require a fresh widget render.
- **Rate limiting on contact reveal.** 10 requests per 15-minute window per
  IP. In-memory per-container store; resets on cold start.
- **Honeypot and timing checks.** Bot detection via hidden field and minimum
  response time (1200ms) before CAPTCHA is even evaluated.

## Sensitive files

The system should warn (not block) if operations touch:
- `.env`, `.env.*`
- Files matching `*secret*`, `*credential*`, `*token*`
- `netlify/functions/reveal_contact.js` (contains security logic)
- `.github/workflows/` (CI/CD configuration)
- Package lockfiles (flag for human review)
