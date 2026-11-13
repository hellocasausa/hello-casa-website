# Hello Casa — Homepage Rhythm & Proportion Pass v1

**Date:** 2026-11-12  
**Owner request:** Reduce excess whitespace in Services and Steps, eliminate the Services sidebar sentence, recalibrate Standards Atelier v4 to the page's typographic/visual hierarchy while preserving proportional overlap, and compact the desktop footer and newsletter.
**Status:** Implemented in draft PR #1, **awaiting visual signoff**. No merge, deployment, provider change, or checklist engine change.
**Rollback:** `checkpoint/pre-homepage-rhythm-v1-c978339` at `c978339aac7d2c31dd5a0b689e795e99b74f5992`.
**Initial rhythm implementation commit:** `ec0b31d85e7f256da0c2b8d75f0ba5dbc68dfdc5`.
**Desktop 32px typographic refinement commit:** `ee3c4aea102279a9558daa06157bfbcdc03cb125`.

## Changes and design rationale

1. **Shared rhythm and type** (`src/styles/tokens.css`). Introduced 8/16/24/32/48px spacing vocabulary, desktop section padding clamp(32px, 3.4vw, 48px), a fixed 32px desktop section heading, 27–32px editorial feature headings, and 15px editorial body type. Tokens constrain scale while component styles still own visual exceptions.
2. **Steps and boundary to Services** (`src/styles/steps.css`, `src/styles/services.css`). Desktop Steps height 144→128px; Services outer top padding 70→32–48px. Mobile Steps height remains auto.
3. **Services B** (`src/components/markup/services.html`, `src/styles/services.css`, generated `index.html`). Removed the text “Selected plan flows into the checklist at right.” and its decorative footer rules. Desktop tabs shrink 82→72px, gaps 3→2px, sidebar/header padding tightened. No changes to `src/components/services.ts`, plan records, task IDs, focus states, quote URL, or keyboard behavior. Button remains right-aligned with a 20px action-edge inset.
4. **Standards Atelier v4** (`src/styles/standards.css`). One `--st-story-scale: .86` multiplies desktop photo width/height/offsets, story grid-track widths and photo overlap translation consistently. Original crops, full six paragraphs, image ordering, and gradients are preserved. Headings and body align with shared hierarchy (15px / 1.63 on wide desktop), card padding and chapter gaps reduced; tablet/mobile maintain stacked semantic reading order and image/card intersection with smaller intentional reductions.
5. **Footer** (`src/styles/tokens.css`, `src/styles/footer.css`). Desktop logo 260→208px (20% smaller); top/bottom padding 36/30→26/18px; newsletter text-to-field gap 15→8px, heading-to-paragraph gap tightened, nav/legal line spacing reduced. Original sunset illustration and its independent crop are retained; do not scale or compress the image itself.

## Controlled implementation and verification

- All changes edit authoritative component owners; no extra override file or duplicate runtime.
- Baseline-specific tests have been updated *only* for intentional geometry changes: 1440px desktop photos now target approx. 276×355, 255×404, 303×366, preserving the second image as tallest; the desktop Steps strip is 16px shorter. Responsive functional, image loading, text fit, image/card overlap, keyboard behavior, Services tab structure, quote CTA alignment, and architecture checks remain enforced.
- Both read-only viewers now reference the **same immutable native source commit** `ee3c4aea102279a9558daa06157bfbcdc03cb125`. The viewer is a visual inspection aid; actual TypeScript interaction requires the Vite build.
- Owner acceptance still requires inspection of desktop, tablet and phone, especially CTA-to-checklist proximity in shorter plans, chapter overlaps, and sunset footer crop. Real Jotform submission remains separately untested.

## Non-goals and safeguards

No rewrite of the approved long-form Standards copy, no changes to original image files, no new typeface, no new CSS corrective sheet, no implementation of the disabled newsletter/placeholder links, and no merge or deployment.

## Verified guardrail cleanup

The previous newsletter heading margin used an allowlisted `!important` rule. The new more-specific component-owned selector safely removes that priority override, reducing the exception count from 17 to 16; the corresponding obsolete ledger row is removed. The responsive Services test records actual checklist-to-action whitespace for follow-up visual review.

## Final verification results

**Native QA:** 15/15 passing on [Approved Services and Standards Integration QA run 43330725914](https://github.com/hellocasausa/hello-casa-website/actions/runs/43330725914) (final rerun/attempt 2). The production build, type check and non-accretion architecture ledger also pass. The desktop CTA workflow passed on source commit ec0b31d8. A 320px Hero collision appeared once during an earlier run and did not reproduce in the successful rerun; Hero was outside this pass and remains a regression-watch item.

**Measured from real browser renderings:**

- 1440px: Services checklist-note to action-row gap 15px and quote button right inset 20px; all six plans retain original runtime/data.
- Standards desktop: three photo widths approximately 276/255/303px and heights 355/404/366px at 1440px; overlapping card geometry and text fitting confirmed at 901–1920px.
- Footer at 1440px: ~204px rendered height, 208px logo width and 8px description-to-newsletter-field gap.
- Footer at 820px: ~339px in intentional two-row responsive arrangement; at 390px: ~189px in compact mobile layout.
- Steps at 820px and 1440px: 128px high; mobile 390px height remains intrinsic (~135px).
- Screenshot artifacts for Services, Standards, Steps and Footer at the relevant widths were generated by the browser suite. No unintended horizontal overflow was reported.

**Owner visual acceptance:** still pending. Live Jotform submission remains untested; nothing was merged or deployed.

## Desktop typography update — section headings at 32px

The primary homepage **section-heading** role is now a fixed **32px**, not a fluid `clamp()` value, at desktop viewport widths of 901px and above. The shared token `--hc-heading-section: 32px` is consumed by:
- `A Fresh Start, In 3 steps` (both title lines)
- `Care starts at home.`
- `So, tell us about your home.`

Component and editorial **feature** headings remain separate roles; notably `No Long-Term Contracts` is not a primary section header. Tablet and phone heading overrides are retained unchanged. Implementation is in the existing CSS owners; no additional override stylesheet was introduced. A browser regression verifies exactly 32px and weight 400 at 901, 1000, 1100, 1440 and 1920px. Rollback branch: `checkpoint/pre-desktop-headings-32px-6fafd80`.

## Approved desktop typography and geometry batch

Desktop scope is 901px and above; tablet and mobile retain their existing styles.

- **Section and Standards editorial headings:** exactly 32px, weight 400, Libre Baskerville. All three Standards feature headings now share the exact section-heading size.
- **Hero descriptive paragraph, all six Standards narrative paragraphs, and Contact supporting copy:** 16px, 1.5 line-height (24px), without modifying wording.
- **Standards introductory capsule:** its right-hand text inset mirrors the actual left inset of “So, tell us about your home.” The introductory capsule retains its right flush placement and rounded shape; its width only expands as needed on extra-wide screens to prevent the mirrored gutter from crowding the contents.
- **Personalized Cleaning Profiles:** white card's right end uses 100px rounded corners, leaving its left corners, padding and photo stacking unchanged. On tablet and mobile, the existing 20px rounded corners remain.
- A desktop-and-tablet browser regression covers the full batch at seven desktop widths and four smaller widths.

All edits live in the existing source owners, without another corrective stylesheet. Previous committed implementation remains recoverable at the `checkpoint/pre-desktop-body-16px-c48a706` branch.

**Batch preview source pin:** `a6325a70d483abe388a8070ed80602c9484ff930` (one immutable snapshot for review, same native CSS as the batch).

## Approved Standards text-card re-proportioning and Guest Turnover cleanup

- The three desktop Standards stories preserve their original photography sizes and anchor sides, while the text-card track becomes approximately **25% narrower** at the 1440px desktop reference: maximum story widths now 895px / 872px / 924px. All copy remains intact, naturally increasing card heights; no independent artificial card height added.
- The Personalized Cleaning Profiles card has its expressive **rounded end on the LEFT** (100px left corners and 22px right corners), not the right. Left interior padding is raised so its copy stays inside the curved edge.
- Tablet and phone Standards story widths, 20px card radius, and layout remain as previously approved.
- The **Guest Turnover default checklist** no longer displays the conditional Outdoor Areas box. **Final Touches** moves into the fourth visible group position after Bathrooms. The four `vacation-out-*` task definitions and their conditional marker are **retained in `plans.json`**, so the canonical source inventory remains at 129 IDs and can support explicitly requested outdoor work later. Other plan checklists remain unchanged.
- Regression coverage verifies the responsive card proportions and the Guest group's display while auditing the full catalog inventory.

Rollback checkpoint: `checkpoint/pre-standards-narrow-card-guest-v1-7b14a9a`.
