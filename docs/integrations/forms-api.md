# CURRENT CONTACT FORM — Atlas v3 (Nov 13, 2026)

The official [Hello Cleaning Brand Atlas](https://docs.google.com/document/d/1H-BNGFRfPuw9y6kiwJSaaVVh27jiq3sebereRF8-K78/edit) supersedes earlier ZIP-focused Jotform mockup requirements.

**All five fields are required:** Your name; Email address; Phone number; What can we help you with?; Tell us a little more. NO ZIP/postal code field on the public Contact form.

**Approved topic choices in exact order:** I have a question; Help me choose a cleaning service; My space needs something different; Something else. Avoid existing-client service/booking support options: those use a separate monitored support workflow.

**Contextual message hints** (the Atlas labels the precise wording as working, not separately approved final copy):
- I have a question: "Is there something you'd like to know before getting started?"
- Help me choose a cleaning service: "Tell us what you're hoping to accomplish. We can help you explore your options."
- My space needs something different: "A unique property or a special request? Tell us a little about it."
- Something else: "Whatever's on your mind, we're listening."

**Responsive layout:** two questions per row on desktop, tablet and mobile, with the message box alone taking the full width. On small screens use tighter gaps and field type scale without converting to single column. Keep the approved peach/blush/blue visual system, quiet privacy microcopy, and "Send a Note →" button. Success confirmation: "Thank you for reaching out. We've received your note."

**Spam protection:** use Turnstile Managed mode with `appearance: "interaction-only"`; it stays out of the visual design for most visitors but can appear when interaction is genuinely required. Server must validate Turnstile hostname and one-time response token.

**Brand identity routing:** one shared Worker with exact origin mappings `hello-casa.com`/`www.hello-casa.com` → Airtable Company `Hello Casa`, website market `Florida`; `confidentcleanings.com`/`www.confidentcleanings.com` → Company `Confident Cleanings`, website market `California`. A visitor's true residential location must **not** be inferred from the brand site. Source URL and website market are saved in Lead's metadata/notes. Both domains are authorized for the single Turnstile widget. **Only Hello Casa has the native Contact form deployed at present; enabling domain routing does NOT install a form on the separately editor-built Confident Cleanings site.**

The Contacts registry is in Airtable `Cleaning Operations → Forms Registry` and each question in `Form Fields`. Editing registry records alone does not redeploy website/source changes. Cloudflare Worker code uses its internal explicit origin map; old `ALLOWED_ORIGINS` variable is historical and not consulted in this version.

Any older Jotform-specific/ZIP guidance below is archived context, not the current requirements.

---

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

## Contact form visual/editing reference (November 13, 2026)

Airtable catalog: **Cleaning Operations → Forms Registry → Hello Casa — Contact**; related fields live in the **Form Fields** table. This metadata is a specification and inventory, not an automatic live editor.

The Contact form is published with the owner-provided Jotform-inspired appearance: peach card (#ffd3c2), centered Libre Baskerville heading, muted blue text, rounded blush inputs, two-column ZIP/phone then name/topic, full-width message, reply-only privacy notice and right-aligned rounded peach `Send a Note →` button. Mobile stacks fields. The existing Contact section outside the form is preserved.

Current fields: `zipcode` (required, US 5-digit or ZIP+4 → Leads.Postal code), `phone` (required → Leads.Phone), `name` (required → Leads.Full name), `topic` (required → Leads.Intake notes, prefix Reason), `message` (required → Leads.Intake notes). Email is not asked in the new layout; the Worker accepts older email-based submissions during transition. Turnstile is still required, and the reply-only permission is communicated in the privacy notice.

**Dropdown choices pending:** the image shows `General Question`, kept as a single interim option; other options should be added only after the owner supplies the approved wording. Update Form Fields and the HTML select together. Native source changes do not propagate automatically from Airtable.

Production uses a content-only Cloudflare Worker update (`PUT /accounts/{accountId}/workers/scripts/hc-forms-api/content`) so existing secret bindings survive. Website changes use Wix's targeted static-file patch on the existing site ID, preserving other site files.

Previous original Contact submission was confirmed in Airtable. The newly changed ZIP/phone/topic submission format has not been verified by a real website submission; don't claim otherwise.
