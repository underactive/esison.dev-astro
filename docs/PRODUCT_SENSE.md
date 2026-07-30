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

### 4. The terminal is the identity
The site is a terminal: green phosphor on black, monospace throughout, scanlines,
prompt-style navigation. This is a deliberate aesthetic commitment, not a theme
among themes — which is why there is no light mode and no design switcher. The
form states what the person does, so it carries argument rather than decoration.

The one concession to preference is the phosphor accent (green, amber, cyan,
white), and even that stays inside the metaphor: those are the phosphors real CRTs
used. Customization that would break the metaphor — the eight arbitrary accent
colors and sixteen background gradients of the old picker — was removed rather
than carried forward.

### 5. Freshness without complexity
GitHub project data refreshes on a schedule (every 6 hours) via build hook,
not through real-time APIs or webhooks. This keeps the architecture simple
while ensuring visitors see reasonably current work.
