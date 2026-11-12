# Hello Casa — Direct Design Editing Protocol
Version 1.0 · 2026-11-12

## Purpose

The owner will frequently request visual and structural changes to Hello Casa **before Design Studio 2.0 exists**. These changes can be implemented directly in the native website repository by the assistant; routine design edits do **not** require a separate Codex run. Use Codex for exceptional engineering tasks only when it adds value.

This protocol governs both hand-coded revisions and the future visual editor. It complements the B6.3.3 reconstruction source rules in `AGENTS.md`.

## Core principle: edit the design, not a pile of patches

A new request may require a new **structural element**—a wrapper, card, grid, decorative layer, caption, component or data-driven collection—not simply CSS appended to an old selector.

- **New structure:** create an intentional semantic component/layer with clear ownership.
- **Existing structure:** update the canonical component and its owned style rules.
- **New visual property:** add it to the appropriate existing component style or shared design token.
- **Responsive variant:** put the exception in its proper breakpoint owner, with a documented inheritance/reset rule.
- **Repeated instances:** use reusable components or data-driven instances, not pasted markup and selectors.
- **Removal or reversal:** delete obsolete nodes, states and declarations; do not hide historical patches indefinitely.
- **No design accretion:** don't append override blocks simply because they are expedient. Repeated edits must converge on one current representation, leaving undo/history in Git, not in production CSS/DOM.

Avoid unnecessary wrappers as strongly as missing wrappers. A component should exist because it has a visual, semantic, behavioral or reusable responsibility.

## Future edit workflow

1. **Interpret the request.** Decide whether it is a property change, structural change, new component, content/data change, interaction change, or multi-breakpoint change. Specify which sections it affects.
2. **Preserve the baseline.** Record the PR commit / checkpoint; preserve the B6.3.3 reconstruction as a recoverable baseline. Approved new modifications are allowed to deviate from B6.3.3 **only for their named scope**.
3. **Create a miniature design spec.** Identify component role, hierarchy, visual layers, repeated instances, responsive behavior, interaction, and what remains unchanged. Ask only for a genuinely indispensable design decision; otherwise use the owner's stated art direction and sensible defaults.
4. **Edit the authoritative implementation.** Update the source component and its owned CSS/data; don't add an after-the-fact visual patch stylesheet for routine changes. Keep IDs stable and selectors local.
5. **Check effects.** Build/type-check, run relevant interaction and breakpoint tests, and visually inspect the affected sections when available. Compare unrelated sections with the approved checkpoint to catch regressions.
6. **Deliver a reviewable change.** Commit to a review branch/PR, give a preview and a compact change summary, including any unverified behavior. Never merge, deploy or alter the live Wix site without explicit authorization.
7. **Maintain the record.** Update the change register below: proposal, approved, implemented, visually reviewed, or deployed. Don't describe a proposal as shipped.

## Component ownership map (current PR #1)

- Header/Hero/Steps: `scripts/build-page.ts` together with `src/components/native-layout.css`, `hero-fonts.css` and `b633-parity.css` for source matching. When editing, **consolidate** affected rules into their intended owner instead of adding another parity layer.
- Services: `src/generated/services.html`, `src/components/services.ts`, `src/components/services.css`, `src/data/plans.json`; preserve all six plans, 129 source task IDs and accessibility.
- Standards: `src/generated/standards.html` and owned layout styling; use separate reusable editorial/card primitives for deliberate new cards.
- Contact: `src/generated/contact.html`, owned CSS and Jotform boundary; do not submit actual inquiries during visual tests.
- Footer: `src/generated/footer.html`, `src/components/footer.css`; retain honest inactive destinations until connected.
- Shared: `src/style.css`, `src/fonts.css`, `src/data/assets.json`, `public/assets/`.

The current reconstruction still has inherited rules in `source-authored.css`, `native-layout.css` and `b633-parity.css`. Those need gradual **regression-tested consolidation**; do not add even more competing ownership merely to make a requested change appear.

## Design requests under discussion — NOT approved implementations

| ID | Area | Concept | Status | Design/engineering note |
|---|---|---|---|---|
| HC-D-001 | Services | Introduce a white card/background plane behind the service cards | Idea only | Decide whether the plane wraps the entire Services catalog, the plan tabs/cards, or the active checklist. Add one intentional layout element and corresponding owned style instead of simulating a card with layered CSS pseudo-patches. |
| HC-D-002 | Standards | Introduce additional cards in the Standards area | Idea only | Confirm the kinds of cards/content and their visual relationships. Implement as repeatable components/data entries, preserving intentional desktop/tablet/mobile hierarchy. |

These rows record ideas, not approval to edit the site.

## Review checklist for every design revision

- [ ] New required elements are real, named and owned; no gratuitous wrappers.
- [ ] No competing orphan selectors, corrective `!important` or unused decorative layers added.
- [ ] Semantics and accessibility remain appropriate (headings, focus order, labels, hidden decorative elements).
- [ ] Mobile/tablet/desktop behavior intentional, including intermediate widths.
- [ ] Original assets and brand typography preserved unless changes explicitly requested.
- [ ] Services tasks, Jotform destinations and unrelated behavior unaffected.
- [ ] Git commit identifies the exact approved change; preview provided before merge/deploy.
- [ ] Change register reflects actual status and superseded rules are removed.

## Later Design Studio 2.0 requirements

Model each component and design property canonically (not as accumulated DOM/CSS patches). Editing an existing property replaces its current value; inserting a new card creates a structured component instance with stable identity. The editor needs explicit responsive inheritance, undo/redo kept separate from exported code, predictable serialization, clean asset references and deterministic production export. It must support the same structural additions and reductions as direct hand editing.

**Anti-accretion acceptance test:** Perform many edit/revert/save/export cycles on a component. Final source/output complexity should remain proportional to the *current* design—not to the number of edits that produced it.
