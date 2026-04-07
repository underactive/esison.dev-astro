// netlify/functions/reveal_contact.js

async function verifyTurnstileToken(token, ip) {
  if (!token) return { ok: false };
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET,
      response: token,
      remoteip: ip || ""
    }),
  }).then(r => r.json()).catch(() => null);

  return { ok: !!res?.success };
}

/**
 * Parses the request body and runs anti-bot validation checks.
 * Returns { fields } on success or { error } with a ready-to-return response on failure.
 */
function parseAndValidate(event) {
  const body = JSON.parse(event.body || "{}");
  const { token, honeypot, tNow, includePhone, phoneToken } = body;

  if (honeypot && honeypot.trim() !== "") {
    return { error: { statusCode: 400, body: JSON.stringify({ error: "bot-detected" }) } };
  }
  // Reject submissions faster than 1200ms — humans cannot realistically complete the form this quickly
  if (typeof tNow === "number" && tNow < 1200) {
    return { error: { statusCode: 400, body: JSON.stringify({ error: "too-fast" }) } };
  }

  const ip = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "";
  return { fields: { token, includePhone, phoneToken, ip } };
}

/**
 * Serverless function to reveal contact information securely.
 *
 * Expected JSON payload:
 * - token: string (Cloudflare Turnstile token for primary email reveal)
 * - honeypot: string (Anti-bot hidden field, must be empty)
 * - tNow: number (Client-side timing check, must be >= 1200ms to prevent instant bot submissions)
 * - includePhone: boolean (Flag indicating intent to reveal phone number)
 * - phoneToken: string (Secondary Turnstile token required for phone reveal)
 *
 * Security Protocol:
 * 1. Validates honeypot (must be empty) and tNow (must be >= 1200ms).
 * 2. Multi-stage reveal:
 *    - Stage 1: Requires `token` to reveal email.
 *    - Stage 2: Requires `phoneToken` (and `includePhone=true`) to reveal phone number.
 *    - Tokens are single-use and verified via Cloudflare Turnstile API.
 */
export async function handler(event) {
  try {
    const result = parseAndValidate(event);
    if (result.error) return result.error;
    const { token, includePhone, phoneToken, ip } = result.fields;

    // Phone-only request: the client already revealed email via a prior request and is now
    // submitting a second CAPTCHA (phoneToken) to unlock the phone number. Turnstile tokens
    // are single-use, so a fresh widget render is required for this second stage.
    if (includePhone && phoneToken && (!token || token === "")) {
      const secondary = await verifyTurnstileToken(phoneToken, ip);
      if (!secondary.ok) {
        return { statusCode: 400, body: JSON.stringify({ error: "captcha-invalid", stage: "secondary" }) };
      }

      const email = process.env.CONTACT_EMAIL;
      const phone = process.env.CONTACT_PHONE || null;
      if (!email || !phone) {
        return { statusCode: 500, body: JSON.stringify({ error: "missing-contact-info" }) };
      }

      return { statusCode: 200, body: JSON.stringify({ email, phone }) };
    }

    // Primary CAPTCHA verification (required for initial email reveal)
    const primary = await verifyTurnstileToken(token, ip);
    if (!primary.ok) {
      return { statusCode: 400, body: JSON.stringify({ error: "captcha-invalid", stage: "primary" }) };
    }

    const email = process.env.CONTACT_EMAIL;
    const phone = process.env.CONTACT_PHONE || null;
    if (!email) {
      return { statusCode: 500, body: JSON.stringify({ error: "missing-contact-info" }) };
    }

    let payload = { email, phone: null };

    if (includePhone && phone && phoneToken) {
      const secondary = await verifyTurnstileToken(phoneToken, ip);
      if (secondary.ok) {
        payload.phone = phone;
      } else {
        payload.meta = { phoneWithheld: true, reason: "secondary-verification-failed" };
      }
    }

    return { statusCode: 200, body: JSON.stringify(payload) };
  } catch (err) {
    console.error("reveal_contact error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "server-error" }) };
  }
}
