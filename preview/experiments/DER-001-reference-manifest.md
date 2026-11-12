# Design Elements Reference Library — Reference 001

**Reference ID:** DER-001  
**Name:** Hello Casa — Service Selector & Checklist Compositions  
**Date:** 2026-11-12  
**Origin:** Hello Casa reconstructed website, PR #1  
**Primary domain:** Design systems → Composition → Navigation / Service selection → Content hierarchy  
**Status:** Archived exploration; none approved for production implementation  
**User preference:** Concept B currently favored; user also explicitly likes the colored tabs/tiles, especially in the alternate studies. No final design selection or approval to edit the website.

## Contents

- `services-remix-gallery.html` — interactive A/B/C comparison with real plan content, original icons, focus behavior and 1100/1440px canvases.
- `services-remix-notes.md` — individual composition rationale, type, trade-offs, and implementation complexity.
- `remix-a-1100.png`, `remix-a-1440.png` — Layered Folio, side-by-side ivory backing tray.
- `remix-b-1100.png`, `remix-b-1440.png` — Integrated Tabs, connected selector rail + checklist panel.
- `remix-c-1100.png`, `remix-c-1440.png` — Editorial Collection, 3×2 service tiles above full-width checklist.

## Design observations worth retaining

1. **Visual continuity**: Connecting the tab's selected background to the content surface makes the relationship between choice and content immediately legible.
2. **Negative space**: Purposeful backing planes or a new card/grid rhythm can reduce awkward unused space without artificially stretching every element.
3. **Typography**: Plan names should have sufficient type size and confidence; utility-style small type alone can make the section feel more like an admin dashboard than a brand experience.
4. **Color**: Original six tinted service surfaces communicate personality. They remain an appealing option even if Concept B's layout is eventually chosen.
5. **Architecture**: New visual structure should be represented as named layout components with stable ownership; don't pile new CSS correction rules onto existing components.

## Follow-up design direction

Explore a **B + color** hybrid as a future *proposal*: Concept B's unified tab spine and checklist, while retaining/reinterpreting the approachable tinted card backgrounds from A/C. This is a design lead, not authorization to build or deploy.

## Source and links

- [Interactive concept gallery](https://raw.githack.com/hellocasausa/hello-casa-website/fa0dc2b3820fb16496b4860a464c84287005f987/preview/experiments/services-remix-gallery.html)
- [Experiment design notes](https://github.com/hellocasausa/hello-casa-website/blob/phase-b/homepage-reconstruction/preview/experiments/services-remix-notes.md)
- [Experimental browser verification](https://github.com/hellocasausa/hello-casa-website/actions/runs/43302404838)
- [Design Elements Reference Library (Drive)](https://drive.google.com/drive/folders/1LEa-Ea_uB-NyR1BFaIWVuuoNZQi-cwGD)

## Library convention

Additional reference records should use a stable `DER-###` ID, short title, tags, source provenance, status (exploration / selected / approved / shipped / retired), visual artifact and implementation notes. Group by *design pattern*, not by project, so references stay reusable across brands. Preserve earlier options rather than overwriting them when a preferred direction emerges.
