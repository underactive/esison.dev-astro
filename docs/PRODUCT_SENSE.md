# esison.dev — Product Sense

This doc captures taste and product judgment for the portfolio site.

## Who is the user?

Visitors are recruiters, hiring managers, collaborators, and peers reviewing
Eric Sison's work. They want to quickly assess skills, see real projects, and
find contact information. They are not interested in clutter, slow load times,
or barriers to basic information.

## Product principles

### 1. Show, don't tell
The portfolio should demonstrate capability through real projects, live code,
and working features — not just text descriptions. The GitHub project sync
exists so visitors see actual, maintained repositories.

### 2. Zero friction for contact
Contact info is protected from bots (Turnstile CAPTCHA) but trivial for
humans. One click to start, one challenge to complete. Phone requires a second
verification to signal extra intent.

### 3. Fast and static by default
The site is pre-built static HTML. No loading spinners, no client-side data
fetching for content, no JavaScript required for core navigation. Vue islands
add polish, not gates.

### 4. Dark mode is the identity
The site defaults to dark mode as a deliberate aesthetic choice, not just a
preference toggle. The purple accent palette and matrix rain effect are part
of the brand identity.

### 5. Freshness without complexity
GitHub project data refreshes on a schedule (every 6 hours) via build hook,
not through real-time APIs or webhooks. This keeps the architecture simple
while ensuring visitors see reasonably current work.
