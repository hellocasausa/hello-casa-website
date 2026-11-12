# Hello Casa — Approved Design Promotion: Services B + Standards Atelier v4

**Date:** 2026-11-12  
**Authorization:** Owner explicitly approved both concepts and instructed native integration into the reconstructed website.  
**Status:** Implemented in **draft PR #1** on `phase-b/homepage-reconstruction`; **no merge or deployment**; awaiting owner review of the combined site.  
**Recovery point:** `checkpoint/pre-services-standards-design-e20d6b5` (`e20d6b51478213ae848f5cd7b0badf590e0f150d`).  
**Intermediate Services checkpoint:** `checkpoint/approved-services-b-native-8f76dba`.  
**Design sources:** [DER-001 Services concept B](../../preview/experiments/services-remix-notes.md) and [DER-002 Proportional Atelier v4](../../preview/experiments/DER-002-Atelier-v4-proportional-notes.md).

## A — Services: native integrated-tab interface

Promoted the **Concept B / Integrated Tabs** composition into the existing Services template and authoritative stylesheet:

- `src/components/markup/services.html`: named tab-rail heading and caption; existing original tabs, icon refs, panel and CTA remain single instances
- `src/styles/services.css`: one desktop-integrated rail/panel background/border owner; selected plan blends into the panel; desktop plan labels remain one line; quote CTA remains 20px from the right action edge
- Preserved `src/components/services.ts`, `src/data/plans.json`, original plan icons, and Jotform quote destination—no experimental dummy event handler or duplicate checklist runtime was imported
- Kept the already approved tablet and mobile Services presentation below 901px
- Removed the obsolete desktop grid geometry block instead of adding competing overlaid rules

Acceptance: six plans and 129 unique task IDs, Essential+ kitchen/bathroom swaps, keyboard navigation, authentic quote URL; geometry at 901, 1000, 1100, 1440 and 1920px; mobile/tablet at 350, 390, 750, 751, 820, 900px.

## B — Standards: native Atelier v4 editorial stories

Replaced the previous fixed-height, absolutely positioned three-feature visual with an intentional three-chapter editorial component:

- `src/components/markup/standards.html`: exact owner-approved headline, two-line subtitle, all three named selling points and six full prose paragraphs, descriptive alt text and original master-photo references
- `src/styles/standards.css`: new self-owned banner, 6px flat `#D8EAF7` header rule, heading/card/photo compositions, consistent interparagraph rhythm, translucent paragraph-only surfaces, source color gradient
- Chapter headers face photographs (left/right/left) and sit outside prose cards; the second original image remains the tallest; each image physically intersects its paragraph card
- One canonical desktop set of owner image placements, expressed as percentages of the 1210px content container using `cqw` units, scales across desktop widths. No separate image-setting profiles or editor controls ship with the website
- Tablet/phone use natural stacked reading flow, full copy, deliberate photo/card overlap and no fixed clipping; original imagery retained

Canonical 1440px photo settings:

| Chapter | Size | X,Y | Crop X,Y |
| --- | --- | --- | --- |
| Professionals | 321×413px | −43, −12px | 50%, 37% |
| Profiles | 297×470px | +26, +1px | 0%, 48% |
| Contracts | 352×426px | −21, 0px | 52%, 59% |

At 1100px, rendered photo sizes are approximately 275×354, 254×402, and 301×365px. Browser geometry confirms the intended image-to-card intersections at 901–1920px. The experiment's drag-to-edit controls, screenshot selection outlines, and remote artifact dependencies are not included in site output.

## Non-accretion assessment

The entire old Standards CSS owner was **replaced**, not patched. Its source stylesheet shrank from approximately 15.4 KB to 8.2 KB. The Services source stylesheet grew from approximately 31.8 KB to 34.2 KB to house the new integrated navigation; together these two component stylesheet sources decreased approximately 4.8 KB (about 10%) compared to the pre-change baseline. These are **source-file sizes**, not a claim about measured network transfer.

Shared fonts and all other page sections remain under their existing owners. No experimental gallery CSS or viewer JavaScript is bundled with the site. The original master-image delivery system still chooses lossless WebP automatically.

## Investigated failures and fixes (preserved history)

1. **Source image delivery not generated (initial full-site test failure):** Standards template initially pointed directly at derived `.webp` files. `scripts/prepare-assets.mjs` only generates delivery files whose **original PNG path** appears in source markup. Fix: keep original `.png` references in the template; let existing build emit/rewrite optimized WebP. No new bundling mechanism.
2. **Long-form editorial spacing collapsed in browser screenshots:** A high-specificity `#standards p,h2...` CSS reset overruled intended margins on headings and between the two full paragraphs. Fix: use zero-specificity `:where(#standards) :where(...)` reset so component typography owns margins. No corrective stylesheet added.
3. **Preview snapshot was stale after source updates:** viewer tools read the committed GitHub `index.html`, whereas CI regenerates it on build without committing. Fix: refresh the committed generated HTML snapshot with the promoted native sections and their optimized asset references; update read-only preview tools to pin to that specific source version.
4. **False screenshot overlay:** Playwright's tall element screenshots can capture the global fixed, keyboard-accessible `Skip to services` link while scrolling/stitching. The actual live site's skip-link remains untouched; it is a screenshot artifact/verification detail, not an edit to Standards itself.

## Verification and sign-off gate

[Full native build, architecture and browser regression workflow](https://github.com/hellocasausa/hello-casa-website/actions/runs/43323403062) completed successfully, with 12 passing tests covering previous functional behavior, desktop composition, and mobile/tablet flow.

The visual and Element Explorer viewers are pinned to the integrated source snapshot. These viewers are read-only and are not substitutes for the production TypeScript or real Jotform submission verification.

**Before release:** obtain owner approval of the combined website, inspect preview screenshots for visual nuances, confirm Jotform/provider interactions in a permitted staging environment, and only then separately authorize merging and deployment. Neither action is part of this work.
