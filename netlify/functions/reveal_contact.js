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
    signal: AbortSignal.timeout(5000)
  }).then(r => r.json()).catch((err) => {
    if (err.name === "TimeoutError" || err.name === "AbortError") {
      console.error(JSON.stringify({ event: "turnstile_verification_failed", reason: "upstream-timeout", ts: Date.now() }));
    }
    return null;
  });

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
    console.warn(JSON.stringify({ event: "contact_reveal_rejected", reason: "bot-detected", ts: Date.now() }));
    return { error: { statusCode: 400, body: JSON.stringify({ error: "bot-detected" }) } };
  }
  // Reject submissions faster than 1200ms — humans cannot realistically complete the form this quickly
  if (typeof tNow === "number" && tNow < 1200) {
    console.warn(JSON.stringify({ event: "contact_reveal_rejected", reason: "too-fast", ts: Date.now() }));
    return { error: { statusCode: 400, body: JSON.stringify({ error: "too-fast" }) } };
  }

  const ip = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "";
  return { fields: { token, includePhone, phoneToken, ip } };
}

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = new Map();

function getClientIp(event) {
  const headers = event.headers;
  if (headers["x-nf-client-connection-ip"]) return headers["x-nf-client-connection-ip"];
  const xff = headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0].trim();
  return headers["client-ip"] || "";
}

function isRateLimited(ip) {
  if (!ip) return false;

  const now = Date.now();
  const timestamps = rateLimitStore.get(ip) || [];
  const valid = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (valid.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(ip, valid);
    return true;
  }

  valid.push(now);
  rateLimitStore.set(ip, valid);

  if (rateLimitStore.size > 1000) {
    for (const [key, vals] of rateLimitStore) {
      const active = vals.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
      if (active.length === 0) rateLimitStore.delete(key);
      else rateLimitStore.set(key, active);
    }
  }

  return false;
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
    const clientIp = getClientIp(event);
    if (isRateLimited(clientIp)) {
      console.warn(JSON.stringify({ event: "contact_reveal_rejected", reason: "rate-limited", ts: Date.now() }));
      return { statusCode: 429, body: JSON.stringify({ error: "rate-limited" }) };
    }

    const result = parseAndValidate(event);
    if (result.error) return result.error;
    const { token, includePhone, phoneToken, ip } = result.fields;

    // Phone-only request: the client already revealed email via a prior request and is now
    // submitting a second CAPTCHA (phoneToken) to unlock the phone number. Turnstile tokens
    // are single-use, so a fresh widget render is required for this second stage.
    if (includePhone && phoneToken && (!token || token === "")) {
      const secondary = await verifyTurnstileToken(phoneToken, ip);
      if (!secondary.ok) {
        console.warn(JSON.stringify({ event: "contact_reveal_rejected", reason: "captcha-invalid", stage: "secondary", ts: Date.now() }));
        return { statusCode: 400, body: JSON.stringify({ error: "captcha-invalid", stage: "secondary" }) };
      }

      const email = process.env.CONTACT_EMAIL;
      const phone = process.env.CONTACT_PHONE || null;
      if (!email || !phone) {
        console.error(JSON.stringify({ event: "contact_reveal_error", reason: "missing-contact-info", ts: Date.now() }));
        return { statusCode: 500, body: JSON.stringify({ error: "missing-contact-info" }) };
      }

      console.log(JSON.stringify({ event: "contact_revealed", includesPhone: true, ts: Date.now() }));
      return { statusCode: 200, body: JSON.stringify({ email, phone }) };
    }

    // Primary CAPTCHA verification (required for initial email reveal)
    const primary = await verifyTurnstileToken(token, ip);
    if (!primary.ok) {
      console.warn(JSON.stringify({ event: "contact_reveal_rejected", reason: "captcha-invalid", stage: "primary", ts: Date.now() }));
      return { statusCode: 400, body: JSON.stringify({ error: "captcha-invalid", stage: "primary" }) };
    }

    const email = process.env.CONTACT_EMAIL;
    const phone = process.env.CONTACT_PHONE || null;
    if (!email) {
      console.error(JSON.stringify({ event: "contact_reveal_error", reason: "missing-contact-info", ts: Date.now() }));
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

    console.log(JSON.stringify({ event: "contact_revealed", includesPhone: Boolean(payload.phone), ts: Date.now() }));
    return { statusCode: 200, body: JSON.stringify(payload) };
  } catch (err) {
    console.error(JSON.stringify({ event: "contact_reveal_error", reason: "server-error", details: err instanceof Error ? err.message : "Unknown error", ts: Date.now() }));
    return { statusCode: 500, body: JSON.stringify({ error: "server-error" }) };
  }
}
