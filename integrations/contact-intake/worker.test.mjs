import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";

const ORIGIN = "https://preview.example";
const env = {
  ALLOWED_ORIGINS: ORIGIN,
  AIRTABLE_PAT: "fake-testing-token",
  AIRTABLE_BASE_ID: "appgT3oQS3MTiQtUV",
  AIRTABLE_TABLE_ID: "tblCVGPxKGKCG4XDI",
  TURNSTILE_SECRET: "fake-test-secret",
  CONTACT_MODE: "test",
};
function request(input, origin = ORIGIN) {
  return new Request("https://intake.example/api/contact", {
    method: "POST",
    headers: { "Origin": origin, "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
const valid = {
  name: "Pilot Test", email: "pilot@example.com", phone: "",
  message: "Synthetic submission — never a real customer.",
  replyConsent: true, website: "", turnstileToken: "fake",
};

test("rejects origins not on the allowlist before any external fetch", async () => {
  let called = false;
  const original = globalThis.fetch;
  globalThis.fetch = async () => { called = true; throw new Error("unexpected"); };
  try {
    const response = await worker.fetch(request(valid, "https://unapproved.example"), env);
    assert.equal(response.status, 403);
    assert.equal(called, false);
  } finally { globalThis.fetch = original; }
});

test("requires valid input before verifying or writing", async () => {
  let called = false;
  const original = globalThis.fetch;
  globalThis.fetch = async () => { called = true; throw new Error("unexpected"); };
  try {
    const response = await worker.fetch(request({ ...valid, email: "invalid" }), env);
    assert.equal(response.status, 422);
    assert.equal(called, false);
  } finally { globalThis.fetch = original; }
});

test("valid synthetic contact becomes one Test lead with an Airtable reference", async () => {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({url: String(url), options});
    if (String(url).includes("/siteverify")) {
      return new Response(JSON.stringify({success: true, hostname: "preview.example"}), {
        status: 200, headers: {"Content-Type": "application/json"},
      });
    }
    return new Response(JSON.stringify({id: "recSynthetic00001"}), {
      status: 200, headers: {"Content-Type": "application/json"},
    });
  };
  try {
    const response = await worker.fetch(request(valid), env);
    assert.equal(response.status, 201);
    assert.equal((await response.json()).reference, "recSynthetic00001");
    assert.equal(calls.length, 2);
    assert.ok(calls[1].url.endsWith("/appgT3oQS3MTiQtUV/tblCVGPxKGKCG4XDI"));
    const fields = JSON.parse(calls[1].options.body).fields;
    assert.equal(fields.fldplRnoZciBVRIWY, "Hello Casa");
    assert.equal(fields.fldrRV6y8pfL73o74, "Test");
    assert.equal(fields.flddvq8kfgJ1C1o0l, "New");
    assert.equal(fields.fld0u1gwNFc15jmD2, "Pilot Test");
    assert.equal(fields.fldVAtEsUjUwVibjN, "pilot@example.com");
    assert.equal(fields.fldfir37pNdk9A3jJ.includes("Synthetic submission"), true);
  } finally { globalThis.fetch = original; }
});

test("preflight returns permitted origin with valid JSON response", async () => {
  const res = await worker.fetch(new Request("https://intake.example/api/contact", {
    method: "OPTIONS", headers: {Origin: ORIGIN},
  }), env);
  assert.equal(res.status, 200);
  assert.equal(res.headers.get("Access-Control-Allow-Origin"), ORIGIN);
});

test("never attempts external submission when secrets are missing", async () => {
  const res = await worker.fetch(request(valid), {...env, AIRTABLE_PAT: ""});
  assert.equal(res.status, 503);
});
