# Hello Casa Mobile Services — Four-Concept Design Exploration

**Status:** Interactive design study, not approved production implementation.

**Working branch:** phase-b/homepage-reconstruction  
**Preview:** https://hellocasausa.github.io/hello-casa-website/mobile-concepts/  
**Responsive widths:** 320px, 375px, 390px

The comparison is isolated under public/mobile-concepts/. No production Services CSS, markup, business logic, plan data or Task IDs are modified. The published review can be opened without downloading files. Desktop and tablet layouts are untouched. Only this review is added to the draft GitHub Pages site; the live Hello Casa production website remains unaffected.

## Architecture and provenance

A build-time exporter (scripts/build-mobile-concepts.ts) imports the actual src/data/plans.json catalog and the canonical src/components/services.ts checklist/focusControls functions. Approved plan icons and colors and the exact quote URL are read from src/components/markup/services.html. The exporter writes **untracked/generated** public/mobile-concepts/services-data.json, consumed by all four UI concepts.

The browser-side prototype only switches among the pre-rendered, canonically generated views, not a rewritten pricing, task-filtering or checklist renderer. The Guest Turnover Outdoor Areas group remains in the canonical catalog and intentionally absent from the displayed preview, matching approved current behavior. All 129 unique source task IDs remain intact.

**Test and deployment:** The GitHub Pages workflow runs the generator, verifies six plans and 129 unique catalog task IDs, and copies the isolated viewer into dist/mobile-concepts/. The browser CI checks widths, keyboard/touch navigation, actual groups and task IDs, Essential Kitchen+/Bathrooms+ behavior, approved CTA destination and absence of overflow. Do not merge these experiments as the final mobile layout without explicit design approval.

## Comparison

| Concept | Navigation | Strength | Limitation |
| --- | --- | --- | --- |
| 01 Compact Atlas | Six visible pastel 2×3 tile options, integrated checklist | Immediate visibility; friendly familiarity | Taller selection block |
| 02 Editorial Index | Six vertically stacked service menu rows, checklist directly under selected row | Elegant long-form browsing; room for meaningful names | Scroll repositioning when switching distant plans |
| 03 Service Ribbon | Three-column, two-row integrated compact tabs | Maximum space efficiency and clear connection to content | Long names require small labels at 320px |
| 04 Featured Service | Selected service hero + compact six-plan switcher + checklist | Strongest emphasis on the selected plan | Adds height before the task details |

All four use the original icons, palette, typography, checklists and quote destination. The complete tasks remain visible, not replaced with placeholder lines or permanently collapsed.

## Possible refinement directions (not implementation decisions)

- Compact Atlas: consider a lighter active-state outline and more concise tab labels while retaining actual accessible names.
- Editorial Index: refine selected-row-to-panel seam and scroll anchoring on plan change.
- Service Ribbon: test at 320px with maximum font sizes possible; evaluate a slim tinted active indicator versus inset border.
- Featured Service: experiment with icon size and spacing between the featured header and compact switcher.

The following are **documented, not implemented**: (1) keep Custom checklists on one line in the **mobile Hero** benefit row while preserving all three checkmarks; (2) compress the **tablet** blue “Care starts at home” capsule approximately 25% while keeping its right edge anchored and text aligned.

**Next step:** Review all four options in the live comparison, select elements to combine or a direction to refine, and explicitly approve any integration into the actual homepage.

## Featured Service — owner-reviewed refinement

Concept 04 was selected for refinement. The owner clarified that the six **small original 3×2 service cards must remain visible at all times**. The illustrated header says **SELECT YOUR PLAN**, and the original six cards immediately beneath it are the actual controls. The duplicate "YOUR CLEANING CHECKLIST / [Plan name] / [Description]" panel header, generic "OUR SERVICES / Cleaning, your way" introduction, and "EXPLORE OTHER PLANS" label remain absent. Full checklist tasks, additions and original quote CTA remain intact.

For Essential Clean within this concept only, the redundant select dropdown is removed from the preview presentation and the three existing Kitchen+/Bathrooms+ focus buttons remain. The canonical focus-controls markup, data, and original homepage are not modified.

Keyboard behavior: the six visible cards are ordinary accessible tabs with their existing active state and keyboard arrow/Home/End selection. No hidden navigation menu is used. The source-generated Essential+ explanatory footnote is suppressed **only in Concept 04's rendered Essential Clean checklist**; the canonical note and all other concepts remain unchanged.

Concepts 01–03 remain unchanged as comparison references. No production mobile integration or Hero/tablet follow-up was authorized.

## Featured Service exact-white surfaces and explanation cleanup

Owner clarified the color request with a screenshot. Concept 04 only: the previously cream/yellow outer service shell, selector background and `Optional: Partial deep clean` focus card now match the canonical white checklist cards exactly (`#fff`). The illustrated `SELECT YOUR PLAN` card **retains** its softly colored left-to-right gradient, but its pale cream end color is replaced by the same white (`#fff`) for a seamless blend. The six pastel service cards and their selected states are not recolored. Remove the short `Selected rooms receive the Essential+ checklist; all other rooms remain Essential.` supporting line under the focus buttons, exclusively in the featured prototype. The canonical focus markup, note, tasks, other concepts, and approved mobile homepage remain unchanged.

## Featured Service integrated into native mobile homepage (review candidate)

The owner approved a three-part responsive integration: use Concept 04 as the actual mobile Services layout at ≤750px, keep the native desktop/tablet Services renderer and canonical plans, remove the older exterior 'Select your plan:' heading, keep the six pastel 3×2 cards, remove the repeated mobile checklist title/subtitle, retain only Essential/Kitchen+/Bathrooms+ buttons, suppress the redundant Essential notes on mobile, and preserve the quote destination and full task content. The selected-plan header now lives inside the canonical service shell and updates using the same `bindServices()` state—not a separate JS runtime. The panel white surfaces and gradient ending in white match the reviewed concept. Separately, mobile Hero trust labels have a one-line layout, and the tablet Standards intro capsule is 25% narrower with its right edge fixed. Draft GitHub preview only; production deployment remains unapproved until whole-page review.
