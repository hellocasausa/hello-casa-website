# DER-002 — Hello Casa Standards Editorial Design Remixes

**Date:** 2026-11-12  
**State:** Exploratory visual studies; owner choice pending; no live or PR production changes.  
**Source authority:** Original Standards/Our Standards section in reconstructed Hello Casa PR #1, source snapshot `a204a3e78700346614a6c5955fa1495f85dd55f0`.  
**Design reference library:** [Branding → Design → Design Elements Reference Library](https://drive.google.com/drive/folders/1LEa-Ea_uB-NyR1BFaIWVuuoNZQi-cwGD)

## Source fidelity

- Three original optimally encoded Hello Casa watercolor images, using their same asset references from `src/components/markup/standards.html`.
- Actual source brand fonts `HC Libre` and `HC Nunito`, loaded from the production repository.
- Source gradient unchanged: `linear-gradient(180deg,#eaf5fa 0%,#f2f8f8 34%,#fff5e8 72%,#ffdfca 100%)`.
- The approved 2026-11-12 introduction and all six full paragraphs from the owner, unchanged.
- Desktop experimental canvases at 1100px and 1440px only. No production responsive modifications.
- All original images and text survive all three remixes.

## A — The Editorial Zigzag

**Composition:** Right-aligned introductory blue band, then alternating left/right/left compositions. Headline and original photograph function as an editorial unit; full copy rests on a solid ivory panel beside it.

**Surface:** Mostly solid warm white, slight border and restrained shadow, preserving the source gradient around the outside.

**Typography and spacing:** Libre Baskerville 34px display / Nunito Sans 16px paragraphs (15px at 1100px). About 76px between chapters.

**Strength:** Most reassuringly approachable, strongest separation of image and long-form body copy. **Implementation effort:** Low.

## B — The Translucent Atelier

**Composition:** Right-aligned minimal editorial introduction, alternating photographic vignettes with paragraph surfaces crossing over the image boundary. The headings move inside the frosted panels so text feels more integrated with the image.

**Surface:** Soft transparent white panels (`rgba(255,255,253,.79)`), subtle backdrop blur, muted border and very soft shadow. The real gradient shows through.

**Typography and spacing:** Libre Baskerville 34px / Nunito 16px, careful paragraph contrast and 54px scene spacing.

**Strength:** Airy and atmospheric; image and text feel genuinely layered. **Implementation effort:** Medium.

## C — The Illustrated Editorial Journey

**Composition:** Asymmetric chapter sequence in the opposite zigzag direction to A/B, emphasizing large chapter numbers, curvilinear image crops, and more expressive typography. The three treatments share a family resemblance but deliberately vary their geometry.

**Surface:** Mixed solid, semi-translucent, and warm-ivory text surfaces; curved/arched image masks.

**Typography and spacing:** Libre Baskerville 37px headings / 66px chapter numbers / Nunito 16px body, around 66px between chapters.

**Strength:** Most bespoke and distinctive; emphasizes visual storytelling. **Implementation effort:** Medium, with more intentional component variants.

## Architecture and implementation guidance

These concepts are produced in one isolated gallery with three explicitly scoped CSS variants. Their layouts are not imported into production; experiment HTML is not a new source of truth for the website. If the owner chooses one, translate the structure into a reusable semantic Standards component with one authoritative CSS owner and proper breakpoint inheritance. Do not simply paste the experimental CSS after the current `standards.css` rules.

## Review and validation

- Gallery: `preview/experiments/standards-editorial-gallery.html`.
- Chromium: `tests/experiments/standards-editorial.spec.ts`, 6 combinations across A/B/C × 1100/1440.
- Source tests check exact section introduction, every story heading, six paragraphs, three source images loaded, brand gradient, alternating positioning, no horizontal overflow, and no browser errors.
- Screenshot artifact: `hello-casa-standards-editorial-six-screenshots`.
- First QA iteration caught a 14px right-edge overhang in Concept A at 1100px, corrected in the experimental banner margin. Record this regression rather than losing it; no production fix was necessary.

**Approval gate:** Concept selection and implementation remain separate. No merge or deployment.
