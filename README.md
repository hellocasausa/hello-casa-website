# Hello Casa homepage

Native reconstruction of the B6.3.3 homepage using semantic HTML, CSS and TypeScript. No Wix runtime or editor is shipped. This project is a review preview, not a live deployment.

## Open the preview

Requires Node 24+.

```sh
npm ci
npm run dev
```

Open http://localhost:5173 after starting the development server.

```sh
npm run build        # regenerate initial HTML, type-check, produce dist/
npm run preview      # inspect the production build on port 4173
npx playwright install chromium
npm test             # functional/responsive browser checks
```

`index.html` contains the initial Essential checklist, so the default view and quote/contact links remain usable without the application script. `scripts/build-page.ts` composes approved native section templates in `src/components/markup/` through explicit DOM operations; `src/components/services.ts` owns catalog rendering and state. Source-derived plan records and task identities live in `src/data/`; source asset hashes live in `assets/source-manifest.json`. Image masters are preserved in `assets/originals/`, with source hashes and roles in `assets/`. Optimized delivery copies and active original fonts/icons are in `public/assets/`. Each component owns its CSS in `src/styles/`; the historical override stack is no longer a runtime input.

## Functionality

Header anchors and compact disclosure; three steps; six service plans with 129 unique task IDs, exact tasks/notes/additions, conditional Guest outdoor work and three Essential focus states; keyboard-operated tabs with persistent focus/state; responsive Standards collage; original Jotform Contact embed with a direct fallback; responsive illustrated footer. Newsletter is explicitly a non-submitting preview.

## Source and verification

Authority: [Phase A blueprint](https://drive.google.com/file/d/1wj_Yrx25v60r3ZwVWacm7iPcNqcZlqs7/view) and [B6.3.3](https://drive.google.com/file/d/1ZbRGgwxpn4_L7y700aM_7NlS7prCicxV/view). Original source remains untouched outside this public repository. Decoded homepage SHA-256: `fa13b63fb8c8cf8b829cc6f3ba532ea2ce55b7b1a7d6793a3c302c31c14ba62b`.

The primary visual authority is the website embedded in Design Studio B6.3.3, as clarified by the owner on 12 November 2026. Its embedded desktop footer, Contact card and selling-point copy are retained. The separate v11.0 and v11.2 standalone previews are historical references only; no design changes from them are authorized or imported. The approved checkpoint retains the extraction provenance and retired reconstruction tools. Normal builds use only the native templates, catalog and source asset library; no Drive connection or recovery scripts are required.

Compared local screenshots against the extracted baseline at 350, 390, 430, 750, 751, 900, 901, 1100 and 1440px. Automated checks cover 37 boundary widths, all plan data, keyboard controls, focus retention, resizing, links, image loading, newsletter behavior and the default view without JavaScript. The real Jotform Contact document loaded and sized with its fields; no form was submitted.

## Remaining discrepancies and unavailable references

- Hero tracking and the embedded desktop Nunito variant, Steps grid/type/badges, phone Services invitation and Standards caption weight have been refined against B6.3.3. Steps headings and the Services start match the measured embedded page at the checked representative widths. Artwork optical offsets and phone/footer details still have small differences; pixel-perfect parity is not claimed.
- Both full-resolution mobile footer originals were recovered from the exact source CDN paths (2172×724 panorama; 1254×1254 square logo). The tiny embedded fallbacks are preserved locally. The blueprint calls the square image a star mark; its exact source image includes the Hello Casa wordmark and star, which is preserved.
- Hero Book Now has no verified destination. It remains visibly present with `aria-disabled`, without invented navigation. FAQ, Help Center, Jobs and legal placeholders remain inactive. Newsletter has no provider and sends no data.
- Original favicon `assets/embedded/33c1436f8c40ca2582d0.ico` and the phone wordmark's missing 148w candidate were absent from the resolver. The verified full-resolution original wordmark is used. No replacement favicon was invented.
- Phone Contact uses the supplied zero-gap default. Provider-side submission, notification routing and confirmation are untested. Jotform remains the only external runtime dependency.
- Unpublished interior-page sources remain unavailable. Historical standalone previews are not required for acceptance against B6.3.3. No live website, provider configuration or deployment was changed.

## Phase B.3 optimization and editor architecture

The owner-approved reconstruction is frozen at branch `checkpoint/phase-b3-approved-e5953f2`. Performance, visual-regression methodology and measured results are in [docs/performance](docs/performance/README.md). The future editor's implementation contract is [anti-accretion architecture](docs/design-studio/anti-accretion-architecture.md). No editor is implemented here. Run `npm run check:architecture` for deterministic generation, font registration and cascade guards. See [measured results](docs/performance/results.md) and [remaining opportunities](docs/performance/implementation-notes.md).
