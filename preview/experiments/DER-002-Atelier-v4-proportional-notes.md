# DER-002 / Refinement 03 — Proportional Atelier v4

**Status:** Isolated experimental design preview; **not approved** for production.  
**Date:** 2026-11-12  
**Source:** The approved Hello Casa Standards source/assets via Atelier v3, with owner-supplied photo properties.  
**Gallery:** [Open the interactive, immutable v4 study](https://raw.githack.com/hellocasausa/hello-casa-website/05aafe84488e93bb47727544297a5c455822321b/preview/experiments/standards-atelier-proportional-v4.html)  
**QA:** [Chromium workflow: success](https://github.com/hellocasausa/hello-casa-website/actions/runs/43319798783)

## Approved visual refinements in this *experiment only*

1. The right-aligned section banner uses a **flat** `#D8EAF7` background, not the earlier blue gradient.
2. The horizontal header rule is the **same flat color** (`#D8EAF7`), 6px thick, positioned above the banner, aligned with its right edge and measuring about 76.1% of the banner width. No line travels across the page.
3. Banner width is 720px (previously 785px), with smaller vertical padding. Rendered height: about 141px at 1440 and 138px at 1100.
4. Heading: "Care starts at home."
5. Supporting copy, **two explicit lines**:
   - Who comes through your door matters.
   - So do the little details, & the freedom to change your plans.
6. The editorial headings remain **outside** the translucent paragraph-only cards and face their respective images: left, right, left.
7. Original watercolor photos and complete approved paragraphs remain unchanged.

## Owner-supplied canonical photo placements

The user pasted the same 1440px configuration three times; these are the unique settings, now set as **the initial defaults** in the v4 experiment:

| Chapter | Width | Height | X | Y | Crop X | Crop Y | Zoom |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Thoroughly Vetted Professionals | 321px | 413px | −43px | −12px | 50% | 37% | 100% |
| Personalized Cleaning Profiles | 297px | 470px | +26px | +1px | 0% | 48% | 100% |
| No Long-Term Contracts | 352px | 426px | −21px | 0px | 52% | 59% | 100% |

The same arrangement scales at 1100px using the ratio `(1100−62)/1210 ≈ 0.85785`, based on the two desktop content-shell widths. **There are no independent 1100px image choices**: an adjustment in either preview updates the same canonical values.

| Chapter | 1100px rendered width × height | Rendered X, Y |
| --- | --- | --- |
| Professionals | 275 × 354px | −37, −10px |
| Profiles | 255 × 403px | +22, +1px |
| Contracts | 302 × 365px | −18, 0px |

Cropping and zoom remain consistent across both.

## Preserved layout relationships

- Translucent cards contain only the body copy, never the chapter headings.
- Original images physically overlap the text-card edges in each row.
- Intentional 1440px measured overlaps are 14px, 12px and 23px; at 1100px, 17px, 16px and 24px.
- The second photographic crop remains taller than both others.
- The desktop editorial grid tracks were adjusted alongside the image sizes to avoid breaking overlaps: the third 1440px column 350→336px; 1100px first/second/third tracks 253→245px, 255→241px, 298→284px.
- No horizontal overflow at either desktop width.
- The user can resize/reposition/drag images; **Copy CSS changes** includes both desktop width rules; **Copy full composition** includes the entire experimental component CSS and computed headings/cards/photos geometry.

## QA findings and engineering learnings

The first v4 QA run correctly caught the third image overlapping its paragraph by just 9px at 1440. Rather than altering the owner's saved image x/y, the grid track was adjusted, yielding a 23px intersection. Tests were rerun to success. This demonstrates why the export must preserve **structural layout relationships**, not just isolated image properties.

There are two successful screenshots at 1440 and 1100px. The owner has **not approved** implementing v4 on the live website, and this experimental design must remain separate from shipping Services/Standards code until explicitly authorized.

## Visual follow-up suggestions (not implemented)

The matched-color line intentionally has low contrast on the pale section background. If its visibility is insufficient, explore a subtly darker stroke or different placement—but preserve the owner's chosen same-color version as baseline.

The first photo is the currently selected image in the editor, so a dashed outline can appear in browser screenshots. That outline belongs to the editing tool, not the intended production design.
