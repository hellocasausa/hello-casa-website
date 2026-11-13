# AGENTS.md — Hello Casa native website reconstruction

## Mission

Reconstruct the *approved* Hello Casa homepage as a clean, maintainable, Wix-independent codebase. The outcome is faithful reproduction, **not** a redesign, a new editor or another audit. Preserve visual composition, image assets, responsive behavior and real website interactions. The project is not production-authorized.

## Authoritative references

- **Phase A website reconstruction blueprint (implementation specification):** https://drive.google.com/file/d/1wj_Yrx25v60r3ZwVWacm7iPcNqcZlqs7/view
- **Original source (B6.3.3 editor containing Wix-derived homepage and assets):** https://drive.google.com/file/d/1ZbRGgwxpn4_L7y700aM_7NlS7prCicxV/view
- **Source workspace and historical comparisons:** https://drive.google.com/drive/folders/18Qa1d6yQVT4x6dj9Ly03phGlRqmxK7kQ
- **Astra Phase 1 editor findings (context, not a work order):** https://drive.google.com/file/d/1ueydpO96huYGNnmke1KZm6Wxqz4YlFrs/view

The primary visual authority is **the website embedded in Design Studio B6.3.3**, the exact source investigated by Astra and used for the Phase A blueprint. Continue refining the existing native reconstruction against that embedded website's actual assets, CSS, positioning, artwork and responsive behavior. The separate v11.0 and v11.2 standalone previews are historical references only; do not apply their designs unless a specific newer approved change is explicitly identified and authorized. Do not restart the reconstruction, merge PR #1 or deploy. This source-priority clarification was supplied by the owner on 12 November 2026.

These external source files are not yet committed to this repository. If inaccessible in the coding environment, request their actual bytes or a connector-mediated export; do not invent missing code, images or fonts.

## Website scope and fidelity

- Homepage only: Header/Hero, Steps, Services, Standards, Contact, Footer.
- **Exact original assets:** preserve transparent artwork, illustrations, photographic images, logos, SVG paths, responsive crops and font metrics. Do not approximate original images with generated substitutes.
- Preserve gradients, colors, typography, spacing, decorative layers, responsive layouts and active interactions.
- Services contains **six plans and 129 unique task IDs**; preserve each source-derived plan, item, condition, tab and checklist behavior.
- Preserve the quote Jotform URL `https://form.jotform.com/262983802449064` and contact form ID `262930639373060`, with their documented opening/embedding behavior. Do not make real form submissions for testing.
- Hero Book Now has an *unverified* destination; do not invent one. Mobile footer full-resolution originals, mobile Contact seam, unpublished interior pages, some footer destinations and newsletter integration also remain unverified.
- Placeholder links and newsletter must not falsely appear functional; preserve the source's visible presentation and clearly report inactive features.

## Engineering

- Use semantic HTML, reusable components and comprehensible CSS/TypeScript; explicitly separate layout containers, image layers, decorative layers and interactive content.
- Reproduce **observed website behavior** using native components; remove unused Wix runtime, abandoned experiments and editor infrastructure after extracting effective behavior. Do not assume every hidden mobile variant is obsolete.
- Extract and package verified source asset bytes rather than relying on fragile base64/remote recovery scripts. Preserve image alpha and quality; record any unrecovered assets.
- Core features must work without Wix or Design Studio. Keep the original B6.3.3 source untouched. Do not add the old editor bridge or visual-selection overlays to the public build.
- Keep the repository free of credentials, secrets, customer submissions and confidential business records. **The repository is currently public.**
- No live deployment, route changes or provider configuration changes without explicit approval.

## Ongoing owner-directed design edits (before Design Studio 2.0)

Read and follow [`docs/design-editing-protocol.md`](docs/design-editing-protocol.md) when an approved request changes the reconstructed website's layout, styles, structure, artwork, components, responsive behavior or content. The assistant may implement ordinary approved changes directly in this repository; there is no requirement to route routine changes through Codex.

Distinguish **ideas** from **approved modifications**. Structural requests may require deliberate new elements or reusable components; do not attempt every new visual concept as an appended CSS override. Update the canonical owner, preserve clean responsive inheritance, record the change and verify fidelity. Owner-approved post-reconstruction edits supersede B6.3.3 **only in their explicitly changed scope**; protect all unrelated original design. Do not merge or deploy without separate authorization.

## Execution

Build the actual integrated homepage and source project; **do not initiate another broad forensic investigation**. Follow the blueprint, using section-by-section implementation internally as useful but deliver a cohesive site.

Run bounded automated engineering checks and visual comparisons where the environment supports them. The owner should not need to perform repetitive debugging tests. Report any unverified visual fidelity honestly; source analysis alone cannot prove pixel-perfect results. Do not burn time on browser-environment troubleshooting.

Provide a runnable preview, organized source/assets, a concise implementation report and a brief list of remaining approval questions. Prefer reviewable commits. Stop before production deployment.
