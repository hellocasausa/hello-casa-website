# Native Contact → Airtable pilot (review branch only)

## What changed
The approved Contact section wrapper, photography, section text and responsive layout are preserved. The external Jotform **Contact** iframe is replaced by native HTML fields (name, email, optional phone, message, permission to reply) and a disabled-by-default submit button. The quote Jotform links are not in scope.

The frontend deliberately stays **preview-only** until the secure endpoint URL and public Turnstile site key are supplied at build time. It never stores an Airtable token.

## Record destination (verified November 13, 2026)
Airtable base: Cleaning Operations (appgT3oQS3MTiQtUV).
Leads table: tblCVGPxKGKCG4XDI.

The backend creates one new Lead record with:
- Record class: Test by default; Operational ONLY when CONTACT_MODE=production
- Company: Hello Casa
- Lead stage: New
- Full name, Email, optional Phone
- Intake notes: message + reply permission
- Source system: Other (existing enum currently lacks Website)
- Marketing source: Native website contact form
- Source record ID: generated contact UUID
- Source URL: form's allowed origin /#contact
- Data review: Unassessed; Admin review status: Pending review

This is a **contact inquiry**. It must not create a Client or a booked Job automatically. An eventual dedicated Contact inquiry type might be desirable, but is outside this pilot.

## Backend contract
File: integrations/contact-intake/worker.mjs
Endpoint: POST /api/contact
JSON: {name,email,phone,message,website,replyConsent,turnstileToken}

The Worker validates required fields and lengths, checks an explicit request-origin allowlist, verifies the Cloudflare Turnstile token server-side against the expected hostname, and writes directly to Airtable. Error responses never include credentials or a raw Airtable response. The honeypot filters trivial bots.

### Required backend configuration
Configure an isolated staging Cloudflare Worker (or compatible server runtime) with:
- AIRTABLE_PAT — **secret**, least-privilege Airtable record-write credential scoped only to the Cleaning Operations base
- TURNSTILE_SECRET — **secret**, paired with the site's Turnstile public key
- AIRTABLE_BASE_ID — appgT3oQS3MTiQtUV
- AIRTABLE_TABLE_ID — tblCVGPxKGKCG4XDI
- ALLOWED_ORIGINS — comma-separated, exact HTTPS browser origins used for the staging site (no wildcard)
- CONTACT_MODE — `test` while staging; only set `production` after approval

Do not put either secret in Git, Vite environment variables, Wix frontend settings, visible HTML, or browser JavaScript. Configure Turnstile allowed hostnames to match the exact preview/live domains. Avoid allowing production data creation from uncontrolled preview sites. The Cloudflare account already contains other Workers; this pilot does not modify any existing one.

### Required frontend build settings
- VITE_HC_CONTACT_API_URL — complete HTTPS URL ending in /api/contact on the staging Worker
- VITE_HC_CONTACT_TURNSTILE_SITE_KEY — public Turnstile site key (not secret)

Example names only (no real endpoint provided):
```text
VITE_HC_CONTACT_API_URL=https://<verified-staging-host>/api/contact
VITE_HC_CONTACT_TURNSTILE_SITE_KEY=<public-site-key>
```

Without both settings the submit button is disabled and the page explicitly says Preview only.

## Verification checklist
1. Run `node --test integrations/contact-intake/worker.test.mjs`, `npm run build` and the Playwright suite. CI and manual QA required; not yet executed/verified by this draft.
2. Use the staging site and a synthetic test person (never an actual customer).
3. Submit the form, confirm success only after the Worker returns an Airtable record ID.
4. In Airtable Leads, check: Test class, Hello Casa company, New stage, correct name/email/phone, complete message and source ID; check no Client/Job is created.
5. Retry invalid email, missing consent, filled bot trap, bad Turnstile, and blocked Origin. Confirm no real lead is written.
6. Test desktop, tablet and mobile labels, focus states, height, and responsive layout.
7. Confirm no contact-form iframe loads. The separate Quote Jotform is intentionally unchanged.
8. Before production, verify notifications/admin review, duplicate handling and abuse/rate limits, privacy disclosures, error handling and rollback. Do not turn on CONTACT_MODE=production without explicit owner approval.

## Rollback
Revert this feature branch or its eventual integration commit to restore the original Jotform Contact embed and its iframe handler. Do not delete the Jotform account or prior submissions until the new process has passed production acceptance.

## Scope / limitations
- Repository is the Wix-independent reconstruction/review build, **not** the live Wix site. No Wix production site, existing Cloudflare Worker, Airtable record or Jotform account was changed.
- This initial field set is a practical minimal Contact pilot. The old Jotform form's exact field schema could not be verified from its remote embed; owner acceptance of the field set is needed before rollout.
- Some historical iframe-only CSS remains for later scoped cleanup; it has no matching Jotform element in the new Contact template.
- Live end-to-end submission and browser fidelity remain unverified until staging credentials, Turnstile and hosting are wired.
