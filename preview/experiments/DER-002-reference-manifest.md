# DER-002 — Hello Casa Standards: Three Editorial Design Remixes

**Reference ID:** DER-002  
**Date:** 2026-11-12  
**Source:** Hello Casa PR #1, optimized Standards section source  
**State:** Three exploratory alternatives; no final selection; no production code changes or deployment

## Archive contents

- `standards-editorial-gallery.html` — interactive concept selection, 1100/1440px canvases, large-view link, exact approved copy, original source artwork, gradient and brand fonts
- `standards-editorial-notes.md` — full rationale, layout differences, text and image relationships, surface treatments and future component implications
- `standards-a-1100.png` and `standards-a-1440.png` — **A: Editorial Zigzag** (solid warm-white copy cards)
- `standards-b-1100.png` and `standards-b-1440.png` — **B: Translucent Atelier** (soft frosted content surfaces over original photos)
- `standards-c-1100.png` and `standards-c-1440.png` — **C: Illustrated Editorial Journey** (asymmetric chapter numbers, expressive image crops and mixed surfaces)

## Design rules extracted for later reuse

- Build the relationship **heading ↔ image ↔ paragraph** as a component rather than positioning each independently.
- Let original background color progression participate in the composition, particularly through restrained translucent surfaces.
- Each editorial section uses a deliberate spacing scale for heading/image, card padding and distance between stories.
- Preserve semantic DOM reading order and full prose; do not sacrifice content to the visual composition.
- Creative asymmetry does not require brittle absolute positioning of content; stable CSS grid owners can produce the editorial zigzag.
- Complex image outlines, such as arches, may be CSS shape variants owned by the story image component.
- A concept is not a production design until the owner explicitly selects it.

## Workflow and QA

The isolated gallery is verified via Playwright in Chromium at 1100 and 1440px, with checks for all three original photographs loaded, six approved body paragraphs, exact intro, correct left/right alternation, and no clipping/overflow.

Initial QA uncovered a 14px banner overhang in A at 1100px; the issue was corrected in the experimental code. A subsequent test initially double-counted the eyebrow labels when they moved into cards in B/C; the test selector was corrected to target body paragraphs. These findings are retained as part of the archive history.

## Source links

[Interactive gallery](https://raw.githack.com/hellocasausa/hello-casa-website/94a432faa1fbcee08abd8bd923024d9e9c1d01a7/preview/experiments/standards-editorial-gallery.html)

[Gallery code](https://github.com/hellocasausa/hello-casa-website/blob/phase-b/homepage-reconstruction/preview/experiments/standards-editorial-gallery.html)

[Design notes](https://github.com/hellocasausa/hello-casa-website/blob/phase-b/homepage-reconstruction/preview/experiments/standards-editorial-notes.md)

[Design Elements Reference Library](https://drive.google.com/drive/folders/1LEa-Ea_uB-NyR1BFaIWVuuoNZQi-cwGD)

**No website implementation approval was given.**
