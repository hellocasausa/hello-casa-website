# Hello Casa Forms API — canonical integration

**Shared Cloudflare Worker:** `hc-forms-api`  
**Base URL:** `https://hc-forms-api.hello-casa-usa.workers.dev`  
**First route:** `POST /api/contact`  
**Source:** `integrations/forms-api/worker.mjs`  
**Frontend:** `src/components/contact-form.ts`

## Purpose
Use one server-side API for native forms. Additional forms receive their own routes, validation and Airtable mappings, without creating new Workers or credentials per form. **Only Contact is implemented today.**

## Current Contact route
- Fields: full name, email, optional phone, message, permission to reply.
- Security: allowed origins `hello-casa.com` and `www.hello-casa.com`, Cloudflare Turnstile verified server-side, validation, honeypot. No credentials in website code.
- Turnstile widget: `Hello Casa — Forms API`, public site key `0x4AAAAAAGAOHqI8iezJxq7F`; hostnames restricted to the Hello Casa domain.
- Writes to Airtable `Cleaning Operations` → `Leads` (`appgT3oQS3MTiQtUV` / `tblCVGPxKGKCG4XDI`), Company `Hello Casa`, Lead stage `New`, Record class `Operational`. No automatic Client or Job creation.

## Connection status
- `hc-forms-api` Worker exists and its workers.dev endpoint is enabled.
- Native website reconstruction source now points to it.
- **Not yet connected to Airtable:** add a restricted Airtable personal access token as Cloudflare Worker secret `AIRTABLE_PAT`. Scope: `data.records:write` on `Cleaning Operations`. Without it, the API refuses submissions (503).
- **Not yet published on www.hello-casa.com:** the actual Wix deployment is separate from this GitHub reconstruction. Do not overwrite unrelated live website content.
- No actual production Contact submission has been verified.

## Future form routes
Use routes such as `POST /api/quote` and `POST /api/cleaner-application` on the same Worker, each with its own field schema, validations, approved-company origin, record routing, and permissions. Other business domains must be explicitly allowed.

## One-time account connection
Create an Airtable PAT at https://airtable.com/create/tokens. In Cloudflare → Workers & Pages → `hc-forms-api` → Settings → Variables and Secrets, add a **Secret** named `AIRTABLE_PAT`. Do not paste secrets into GitHub, website HTML, or chat.

The old `hc-contact-intake` name and former staging infrastructure are retired. This is the canonical integration reference.
