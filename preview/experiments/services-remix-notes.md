# Hello Casa — Services Design Remix Studies

**Status:** Experimental art direction only. Not an approved production change.  
**Source:** Actual Services template, component CSS, fonts, tokens and six-plan checklist data from PR #1 at `b4749cafb4648938798875687eb52b7954beafba`.  
**Interactive gallery:** [services-remix-gallery.html](services-remix-gallery.html)

## Shared constraints

- Six original service plans, original icons, names, descriptions and 129 distinct task IDs.
- Essential / Kitchen+ / Bathrooms+ logic mirrors the original `src/components/services.ts` selected-group behavior.
- Desktop-only concept canvases at 1100px and 1440px.
- Quote CTA aligned to the checklist action row's right edge; link disabled in experiments.
- Fully isolated HTML artifact; no production markup, CSS, data, Jotform endpoint or GitHub deployment altered.
- Experiments use deliberate structural elements for the new visual concepts, not serialized HTML edits to production.

## A — The Layered Folio

**Composition:** A rounded white/ivory underlay physically encompasses both the left selector and the checklist; the blue checklist floats slightly above that plane. Six familiar tinted cards remain stacked inside the tray, with a restrained editorial caption and footer note.

**Visual strengths:** Least disruptive, welcoming, coherent depth and card hierarchy, modest typography improvement.

**Trade-off:** Familiar vertical layout; still closer to the current site than the other two, with some residual empty space possible when shorter checklists are active.

**Implementation approach:** An intentional `folio-underlay` visual layer owned by the Services wrapper plus an editorial heading. Can be built without changing the existing catalog schema.

**Complexity:** Low.

## B — The Integrated Tab Spine

**Composition:** A single left rail and pale-blue checklist share their border and vertical proportion. The selected plan becomes a physically attached tab, with the active background continuing into the checklist panel.

**Visual strengths:** Strongest immediate relationship between the selected service and its details; easiest to scan and understand as a single interface.

**Trade-off:** Less airy than A; tab attachment and narrow breakpoint behavior need deliberate geometry to avoid a dashboard-like aesthetic. Desktop-only scope is especially important.

**Implementation approach:** Dedicated `service-tab-rail` and `service-content-panel` owners with a shared selected-state token. A narrow intentional active seam is part of the tab design, not an accumulated CSS correction.

**Complexity:** Medium.

## C — The Editorial Collection

**Composition:** A Libre Baskerville editorial introduction and a 3×2 grid of six color-tinted plan tiles sit above a broad checklist. The checklist switches to a wider multi-column grouping to use the available space.

**Visual strengths:** Most distinctive brand presentation, very little purposeless space under selectors, stronger typography and editorial storytelling.

**Trade-off:** Taller section, greater vertical movement between selecting a service and reading its details, and more complex responsive adaptation.

**Implementation approach:** Data-driven `service-collection-grid` of six tiles followed by a full-width `service-detail-panel`, with stable source task and plan IDs. No duplicated checklists.

**Complexity:** Medium.

## Rendering and acceptance

GitHub Actions experimental workflow [services-remix-gallery.yml](../../.github/workflows/services-remix-gallery.yml) uses Chromium to verify all three concepts at 1100 and 1440px, original plan and focus interactions, no horizontal overflow, disabled quote navigation, 129 unique task IDs and the aligned quote control. It preserves six screenshots as a review artifact.

**Owner decision pending.** Do not promote any concept or design tokens to production until the owner selects and approves a direction. If approved, implement by editing the authoritative Services component and CSS owner, with production builds and responsive regressions. Keep the experiments as historical visual references rather than importing competing variation styles into the shipping website.
