# Hello Casa — Seven Mobile Standards Concept Previews

**Status:** Isolated design exploration for visual comparison only.

**Public responsive preview:** https://hellocasausa.github.io/hello-casa-website/mobile-standards/

**Scope and content:** Exactly the **first existing paragraph** per selling point. All three original illustrated watercolors, approved eyebrows and headings, and the current Standards blue-to-peach gradient. Each image is taken from src/components/markup/standards.html and resolved through the approved delivery manifest. The build-time source generator is scripts/build-mobile-standards.ts and its generated public/mobile-standards/data.json. Existing source Standards copy remains unchanged (still two paragraphs per story).

## Compositions

| # | Design | Photo/copy relationship | What to evaluate |
|---|---|---|---|
| 01 | Editorial Postcard | Small portrait beside heading; full-width paragraph below, left/right/left | Reader recognition and typography |
| 02 | Illustrated Chapters | Shallow wide photo then joined heading and text, repeated | Image cropping versus space economy |
| 03 | Three-Story Gallery | Three tabs and a single photograph/copy per selected story | Browse speed versus discovery of hidden content |
| 04 | Illustrated Accordion | Three image+title rows with one open paragraph | Clear navigation and interaction affordance |
| 05 | Interlocking Postcards | Portrait image and paragraph card overlap on alternating sides | Desktop-inspired layered editorial identity |
| 06 | Puzzle Corners | Picture tucked into alternating upper text-card corners | Compact interlocking relationship at 320px |
| 07 | Cascading Zigzag | Large left-right-left image/card steps joined by subtle accent line | Continuous story flow and visual cohesion |

All concepts include the same compact introduction banner, so the comparison isolates the story composition rather than confusing the change with new marketing copy.

## Testing and safety

The browser suite checks 320px, 375px and 390px widths, three actual original watercolors, text fidelity for each first paragraph, overflow, image loading, alternating image sides for zigzag variants and interaction accessibility for Gallery and Accordion. Visual screenshots are generated for all seven concepts.

No changes have been made to the production homepage Standards markup, Styles, mobile/tablet/desktop responsive rules, original second paragraphs, or any other existing component. The study lives only at public/mobile-standards/. A user review and explicit approval are required before selecting any composition for integration.

The previously noted mobile Hero trust-row spacing and mobile Services page rhythm remain separate pending design feedback; this study does not modify them.

## Approved mobile homepage integration — Cascading Zigzag

The owner selected **Concept 07 (Cascading Zigzag)** for the real mobile Standards section. Mobile ≤750px now uses three alternating image/white-card compositions with a subtle connecting vertical line and small sequence markers, and displays only the first existing paragraph of each of the three selling points. The second paragraphs remain in the canonical HTML and continue to display at tablet/desktop widths. The mobile 'Care starts at home.' capsule is shallower, and the complete sentence 'So do the little details, & the freedom to change your plans.' is intended to occupy a single line across the full phone width. Original images, typography families, headlines, colors and approved text are retained. Tablet and desktop Standards rules remain unchanged. This is a GitHub draft-branch responsive review candidate, not a production release.
