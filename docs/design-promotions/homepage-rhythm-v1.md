# Hello Casa — Homepage Rhythm & Proportion Pass v1

**Date:** 2026-11-12  
**Owner request:** Reduce excess whitespace in Services and Steps, eliminate the Services sidebar sentence, recalibrate Standards Atelier v4 to the page's typographic/visual hierarchy while preserving proportional overlap, and compact the desktop footer and newsletter.
**Status:** Implemented in draft PR #1, **awaiting visual signoff**. No merge, deployment, provider change, or checklist engine change.
**Rollback:** `checkpoint/pre-homepage-rhythm-v1-c978339` at `c978339aac7d2c31dd5a0b689e795e99b74f5992`.
**Native implementation commit:** `ec0b31d85e7f256da0c2b8d75f0ba5dbc68dfdc5`.

## Changes and design rationale

1. **Shared rhythm and type** (`src/styles/tokens.css`). Introduced 8/16/24/32/48px spacing vocabulary, desktop section padding clamp(32px, 3.4vw, 48px), a 30–35px shared section heading, 27–32px editorial feature headings, and 15px editorial body type. Tokens constrain scale while component styles still own visual exceptions.
2. **Steps and boundary to Services** (`src/styles/steps.css`, `src/styles/services.css`). Desktop Steps height 144→128px; Services outer top padding 70→32–48px. Mobile Steps height remains auto.
3. **Services B** (`src/components/markup/services.html`, `src/styles/services.css`, generated `index.html`). Removed the text “Selected plan flows into the checklist at right.” and its decorative footer rules. Desktop tabs shrink 82→72px, gaps 3→2px, sidebar/header padding tightened. No changes to `src/components/services.ts`, plan records, task IDs, focus states, quote URL, or keyboard behavior. Button remains right-aligned with a 20px action-edge inset.
4. **Standards Atelier v4** (`src/styles/standards.css`). One `--st-story-scale: .86` multiplies desktop photo width/height/offsets, story grid-track widths and photo overlap translation consistently. Original crops, full six paragraphs, image ordering, and gradients are preserved. Headings and body align with shared hierarchy (15px / 1.63 on wide desktop), card padding and chapter gaps reduced; tablet/mobile maintain stacked semantic reading order and image/card intersection with smaller intentional reductions.
5. **Footer** (`src/styles/tokens.css`, `src/styles/footer.css`). Desktop logo 260→208px (20% smaller); top/bottom padding 36/30→26/18px; newsletter text-to-field gap 15→8px, heading-to-paragraph gap tightened, nav/legal line spacing reduced. Original sunset illustration and its independent crop are retained; do not scale or compress the image itself.

## Controlled implementation and verification

- All changes edit authoritative component owners; no extra override file or duplicate runtime.
- Baseline-specific tests have been updated *only* for intentional geometry changes: 1440px desktop photos now target approx. 276×355, 255×404, 303×366, preserving the second image as tallest; the desktop Steps strip is 16px shorter. Responsive functional, image loading, text fit, image/card overlap, keyboard behavior, Services tab structure, quote CTA alignment, and architecture checks remain enforced.
- Both read-only viewers now reference the **same immutable native source commit** `ec0b31d85e7f256da0c2b8d75f0ba5dbc68dfdc5`. The viewer is a visual inspection aid; actual TypeScript interaction requires the Vite build.
- Owner acceptance still requires inspection of desktop, tablet and phone, especially CTA-to-checklist proximity in shorter plans, chapter overlaps, and sunset footer crop. Real Jotform submission remains separately untested.

## Non-goals and safeguards

No rewrite of the approved long-form Standards copy, no changes to original image files, no new typeface, no new CSS corrective sheet, no implementation of the disabled newsletter/placeholder links, and no merge or deployment.

## Verified guardrail cleanup

The previous newsletter heading margin used an allowlisted `!important` rule. The new more-specific component-owned selector safely removes that priority override, reducing the exception count from 17 to 16; the corresponding obsolete ledger row is removed. The responsive Services test records actual checklist-to-action whitespace for follow-up visual review.
