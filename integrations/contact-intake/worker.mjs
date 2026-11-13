/**
 * Hello Casa contact intake pilot. No secrets belong in the website bundle.
 * Fails closed until all environment bindings are configured.
 * Deploy only to a staging Worker until an owner-approved end-to-end test passes.
 */
const LIMIT_BYTES = 8192;
const AIRTABLE_URL = "https://api.airtable.com/v0/";
const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

function respond(status, payload, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "Vary": "Origin",
    "X-Content-Type-Options": "nosniff",
  };
  if (origin) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return new Response(JSON.stringify(payload), { status, headers });
}

function clean(value, maximum) {
  return typeof value === "string" ? value.trim().slice(0, maximum + 1) : "";
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowed = (env.ALLOWED_ORIGINS || "")
      .split(",").map((value) => value.trim()).filter(Boolean);
    if (!origin || !allowed.includes(origin)) return respond(403, { ok: false }, "");

    const path = new URL(request.url).pathname;
    if (path !== "/api/contact") return respond(404, { ok: false }, origin);
    if (request.method === "OPTIONS") return respond(204, {}, origin);
    if (request.method !== "POST") return respond(405, { ok: false }, origin);

    if (!env.AIRTABLE_PAT || !env.TURNSTILE_SECRET ||
        !env.AIRTABLE_BASE_ID || !env.AIRTABLE_TABLE_ID) {
      return respond(503, { ok: false, message: "Contact form is not available." }, origin);
    }

    if (!(request.headers.get("Content-Type") || "").startsWith("application/json")) {
      return respond(415, { ok: false }, origin);
    }

    const bodySize = Number(request.headers.get("Content-Length") || 0);
    if (bodySize > LIMIT_BYTES) return respond(413, { ok: false }, origin);

    let input;
    try {
      const raw = await request.text();
      if (new TextEncoder().encode(raw).length > LIMIT_BYTES) {
        return respond(413, { ok: false }, origin);
      }
      input = JSON.parse(raw);
    } catch {
      return respond(400, { ok: false, message: "Invalid submission." }, origin);
    }
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return respond(400, { ok: false }, origin);
    }

    // Quietly discard automated submissions that fill the hidden honeypot field.
    if (input.website) return respond(200, { ok: true }, origin);

    const name = clean(input.name, 120);
    const email = clean(input.email, 254);
    const phone = clean(input.phone, 40);
    const message = clean(input.message, 3000);
    const token = clean(input.turnstileToken, 3000);
    if (!name || name.length > 120 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 ||
        phone.length > 40 || !message || message.length > 3000 ||
        input.replyConsent !== true || !token) {
      return respond(422, { ok: false, message: "Please check the required fields." }, origin);
    }

    try {
      const verify = await fetch(VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET,
          response: token,
          remoteip: request.headers.get("CF-Connecting-IP") || "",
        }),
      });
      if (!verify.ok) throw new Error("Turnstile unavailable");
      const verdict = await verify.json();
      if (!verdict.success || verdict.hostname !== new URL(origin).hostname) {
        return respond(403, { ok: false, message: "Please retry the verification." }, origin);
      }
    } catch {
      return respond(503, { ok: false, message: "Verification unavailable. Please retry." }, origin);
    }

    const fields = {
      "fldrRV6y8pfL73o74": env.CONTACT_MODE === "production" ? "Operational" : "Test",
      "fldplRnoZciBVRIWY": "Hello Casa",
      "flddvq8kfgJ1C1o0l": "New",
      "fldkp0pu9U6E3Nrw7": "Other",
      "fld0u1gwNFc15jmD2": name,
      "fldVAtEsUjUwVibjN": email,
      "fldEV99earNSeBe61": phone || undefined,
      "fldfir37pNdk9A3jJ": "Contact form inquiry. Message:\n" + message + "\nReply permission: yes",
      "fld6htuvrRQs5VVyY": "Native website contact form",
      "fld6PAAK8pC8YMmLj": "contact-" + crypto.randomUUID(),
      "fldKSw0W3p1KEssJe": origin + "/#contact",
      "fldHtsbACuw7GMFMu": "Unassessed",
      "fldMy3TDNUkldo0Q4": "Pending review",
    };
    try {
      const result = await fetch(
        AIRTABLE_URL + encodeURIComponent(env.AIRTABLE_BASE_ID) + "/" +
          encodeURIComponent(env.AIRTABLE_TABLE_ID),
        {
          method: "POST",
          headers: {
            Authorization: "Bearer " + env.AIRTABLE_PAT,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields, typecast: false }),
        },
      );
      if (!result.ok) throw new Error("Airtable write rejected");
      const record = await result.json();
      if (!record.id) throw new Error("Airtable response missing id");
      return respond(201, { ok: true, reference: record.id }, origin);
    } catch {
      // Never expose private Airtable details, credentials, or request content.
      return respond(502, {
        ok: false,
        message: "We could not confirm your message. Please try again later.",
      }, origin);
    }
  },
};
