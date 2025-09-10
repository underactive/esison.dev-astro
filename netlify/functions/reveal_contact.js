// netlify/functions/reveal-contact.js
import fetch from "node-fetch";

async function verifyTurnstileToken(token, ip) {
  if (!token) return { ok: false, details: "missing-token" };
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET,
      response: token,
      remoteip: ip || ""
    }),
  }).then(r => r.json()).catch(() => null);

  return { ok: !!res?.success, raw: res };
}

export async function handler(event) {
  try {
    const body = JSON.parse(event.body || "{}");
    const { token, honeypot, tNow, includePhone, phoneToken } = body;

    // Basic invisible checks
    if (honeypot && honeypot.trim() !== "") {
      return { statusCode: 400, body: JSON.stringify({ error: "bot-detected" }) };
    }
    if (typeof tNow === "number" && tNow < 1200) {
      return { statusCode: 400, body: JSON.stringify({ error: "too-fast" }) };
    }

    const ip = event.headers["x-forwarded-for"] || event.headers["client-ip"] || "";

    // If this is a phone-only request (includePhone=true with phoneToken but no fresh token)
    if (includePhone && phoneToken && (!token || token === "")) {
      // For phone reveal, only verify the phone token
      const secondary = await verifyTurnstileToken(phoneToken, ip);
      if (!secondary.ok) {
        return { statusCode: 400, body: JSON.stringify({ error: "captcha-invalid", stage: "secondary", details: secondary.raw || secondary.details }) };
      }

      // Pull contact secrets
      const email = process.env.CONTACT_EMAIL;
      const phone = process.env.CONTACT_PHONE || null;
      if (!email || !phone) {
        return { statusCode: 500, body: JSON.stringify({ error: "missing-contact-info" }) };
      }

      // Return both email and phone for phone reveal
      return { statusCode: 200, body: JSON.stringify({ email, phone }) };
    }

    // Primary CAPTCHA verification (required for initial email reveal)
    const primary = await verifyTurnstileToken(token, ip);
    if (!primary.ok) {
      return { statusCode: 400, body: JSON.stringify({ error: "captcha-invalid", stage: "primary", details: primary.raw || primary.details }) };
    }

    // Pull contact secrets
    const email = process.env.CONTACT_EMAIL;
    const phone = process.env.CONTACT_PHONE || null;
    if (!email) {
      return { statusCode: 500, body: JSON.stringify({ error: "missing-contact-info" }) };
    }

    // Default payload (email only)
    let payload = { email, phone: null };

    // Optional: second step to reveal phone (if both tokens provided)
    if (includePhone && phone && phoneToken) {
      const secondary = await verifyTurnstileToken(phoneToken, ip);
      if (secondary.ok) {
        payload.phone = phone;
      } else {
        // Keep email, with phone withheld
        payload.meta = { phoneWithheld: true, reason: "secondary-verification-failed" };
      }
    }

    return { statusCode: 200, body: JSON.stringify(payload) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "server-error", details: err.message }) };
  }
}
