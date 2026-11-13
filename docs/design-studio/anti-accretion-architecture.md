# Design Studio 2.0: architecture that prevents accretion

Status: implementation contract for the future editor; this phase does not implement it. The customer website remains independent of the editing system. Hello Casa's approved visual reference is the reconstruction checkpoint `e5953f2d0d4375daf5a8462c9343d71785e5f81b`, derived from the B6.3.3 embedded website. Historical standalone previews have no authority to change it.

## Central invariant

**An editing operation changes the canonical representation of a design. It must not append a correction to the rendered result.**

After 100 font-size edits, the saved model contains one final value for that property at that scope. Export contains one authoritative declaration for that property/scope. An undo log may contain bounded history, but neither that history nor previous values become CSS, HTML or production JavaScript.

The number of edits is not an input to rendering or export. Two models with identical current state must produce byte-identical exports, regardless of the operations used to reach them.

## Separate five systems

| System | Owns | Must not own |
| --- | --- | --- |
| Canonical design model | Component tree, persistent IDs, typed properties, constraints, responsive variants, semantic roles, asset references, interaction contracts, schema version | DOM nodes, transient selection state, CSS patches, executable imported strings |
| Asset library | Immutable original bytes, hashes, dimensions, alpha/color profiles, font metrics/licenses, crop/focal metadata, versioned delivery derivatives | Arbitrary layout rules or mutable URL-only identities |
| Production renderer | Accessible DOM and interactions generated from the current model | Editor overlays, mutation observers that reverse-engineer edits, saved edit history |
| Visual editor | Selection, handles, canvas transforms, previews, validated commands, undo/redo | A second source of layout truth or independent CSS injection as persistence |
| Export/build pipeline | Validated model-to-code transformation, deterministic assets/CSS/HTML/JS, manifests and reproducibility checks | Editor runtime dependencies, network recovery scripts, obsolete states or experiments |

Use shared pure layout/property resolution code between preview and export. The production renderer accepts the resolved model; it does not import the editor store, command bus, inspector panels or canvas controls. Keep these as distinct packages with dependency direction enforced by import-boundary checks. The asset optimizer and exporter run at build time, not on every customer page view.

## One authoritative model

Persist a versioned, schema-validated document. A small illustrative shape is:

```ts
type Scope = 'base' | 'tablet' | 'mobile';
type Length = { value: number; unit: 'px' | 'rem' | '%' | 'vw' };
interface Component {
  id: string;                  // UUID/ULID; never derived from a DOM position
  type: string;                // registered component schema and renderer
  children: string[];          // order is data, identity is stable
  props: Record<string, unknown>; // validated by the registered schema
  styles: {
    base: Record<string, unknown>;
    tablet?: Record<string, unknown>;
    mobile?: Record<string, unknown>;
  };
  assetBindings: Record<string, { assetId: string; cropId?: string }>;
}
interface DesignDocument {
  schemaVersion: number;
  rootId: string;
  components: Record<string, Component>;
  tokens: Record<string, unknown>;
  breakpoints: { tabletMax: number; mobileMax: number };
}
```

In implementation, replace the open `unknown` maps with component-specific discriminated unions and property registries: lengths, colors, typography, grid tracks, constraints, visibility, image fit and focal point. Represent fluid expressions with validated expression nodes, not arbitrary CSS fragments. Separate content from presentation and interaction state. Model distinct semantic states (selected tab, open navigation, focus and hover) explicitly. Responsive visibility must not require duplicating interactive content.

The DOM is an output. A `MutationObserver` is not the persistence layer. Imports must be normalized once into the model, with unsupported semantics reported; they must not retain an opaque legacy runtime alongside the new one. Preserve source IDs and hashes in provenance metadata when useful, not as the new identity system.

## Property and cascade ownership

Each component type registers one owner for structure, styles, behavior and state. A property registry defines which owner may write each property family. For example, a layout owner controls grid tracks and gaps; a typography owner controls a text role; an image owner controls its fit/crop. Inspector controls dispatch commands to those owners. Plugins cannot directly attach competing render-time styles.

Use a finite specificity budget: component classes plus named states, no ID escalation, no repeated ancestor chains and no per-edit selectors. Prefer longhand properties in the canonical model so `margin` and `margin-left` cannot become competing sources of truth. The exporter may choose a shorthand only when its values are unambiguous. Shared design tokens resolve from one registry. Token overrides must have an explicit scope and ownership record.

`setStyle(id, scope, property, value)` replaces one stored value. It must not create a new style block, append a selector, add an inline correction, increment specificity, or add `!important`. Repeating an identical command is a no-op. Deleting/resetting the property removes the scoped entry. Do not store both a shorthand and a conflicting longhand for the same scope/state.

Use `!important` only for a reviewed, documented boundary such as an external provider's inline iframe styles, accessibility enforcement, or an imported contract that cannot yet be normalized. Maintain an allowlist keyed by component/property/reason, not an unlimited permission. A warning budget alone is insufficient: CI rejects new unapproved uses. Any measured legacy exceptions belong to a migration ledger, not a pattern for new editor output.

## Explicit responsive inheritance

Default policy: **desktop is the base; tablet and mobile are sibling overrides of that base.** Tablet-only edits do not implicitly alter mobile. A shared edit writes base. Register breakpoint intervals once, with deterministic inclusive/exclusive boundaries; test fractional widths as well as integer edges. If a future component needs a different inheritance graph, require a versioned explicit graph and inspector explanation rather than implicitly changing the global policy.

The inspector displays the active scope, the resolved value, its origin (token, base or override) and the affected widths before committing. “Reset mobile” deletes the mobile key and reveals base. It is different from CSS `inherit`, `initial` or `unset`, which have their own typed meanings. An empty override map is removed during normalization. A breakpoint toggle changes the viewport being inspected; it does not copy values into a new override map.

Example: base font size 24, mobile override 18. Editing base to 26 leaves mobile at 18. Resetting mobile yields 26 and removes the mobile declaration. Save/reload and export/import must preserve that behavior. Importing B6.3.3 must explicitly map its effective per-range layouts; the new inheritance policy must not silently change approved rendering.

## Stable identity and references

Generate a persistent semantic component ID at creation. Reordering changes only the parent's child list. Save, reload, export and import preserve IDs. Duplicating a subtree creates new IDs for the entire copy, then remaps internal references (labels, controls, headings, links, interaction targets) atomically; external references remain explicit. Asset IDs can be shared because assets are immutable.

Use IDs as model keys and stable rendering keys. Do not use array indices, CSS nth-child positions, temporary Wix identifiers or editor-selection handles as identity. Templates may render repeated content with stable data keys, such as a service task ID, without conflating the task's identity with its component instance ID. Validation rejects duplicate IDs, dangling references, cyclic trees and inconsistent parent/child relationships.

## Structured operations and undo/redo

All writes pass through a validated command layer. Commands include `SetProperty`, `ResetOverride`, `MoveComponent`, `ResizeConstraint`, `SetTypography`, `SetSpacing`, `BindAsset` and `DuplicateSubtree`. Each carries a target ID, explicit scope/state, expected model revision and typed payload.

A transaction validates first, applies atomically, records its inverse, and publishes a new immutable revision. Failed validation leaves state unchanged. Coalesce pointer-move previews into one committed drag transaction; keep transient drag guides outside the document. A drag updates layout intent (grid area, docking, offset or constraint), not incidental browser coordinates. Resize updates the existing size/constraint property. Image replacement updates an asset binding and intentional crop metadata, not nested wrappers. Text changes update content and typography roles, not generated span patches.

Undo applies the inverse model transaction; redo reapplies the validated command. Both run normalization and invariants. Undoing a property that did not previously exist deletes it, rather than recording a synthetic override. History is bounded, revision-aware and excluded from the export hash. For future concurrent editing, specify conflict policy per property and revision before introducing synchronization; last DOM mutation wins is not a conflict model.

## Deterministic production export

Build steps: validate schema/references → normalize current state → resolve tokens/variants → allocate stable semantic output hooks → generate component HTML/CSS/behavior → derive assets → validate output → emit an ordered manifest.

The same canonical input, asset hashes and pinned tool versions must produce identical bytes. Sort unordered maps deterministically; preserve intentional child/order semantics. Exclude timestamps, random IDs, browser-specific serialization and machine paths. Separate editor project export (versioned design data) from production export (deployable website). Importing a project export is lossless; importing arbitrary production HTML requires an explicit supported subset and diagnostics, not a claim of universal reversibility.

Export only reachable components and applicable declarations. No hidden duplicate site trees, selected-element overlays, edit history, old experiments, corrective CSS, bridge scripts, saved inspector state, unused asset recovery probes or editor dependencies may leak into production. Validate headings, ARIA references, keyboard behavior, lazy-loading/priority policy and provider integrations. Original assets remain in the source library; production receives only referenced delivery files. Font subsets and responsive images must preserve approved metrics, alpha, crops and visible quality.

A clean DOM-transform stage with explicit selectors and assertions is acceptable during website reconstruction. It is not the canonical editing API. Regex replacements of serialized HTML and build-time migration scripts must not become an editor's normal update path.

## Tests that prove non-accretion

| Test | Required invariant |
| --- | --- |
| Change one font size 100 times | One final scoped property; one final declaration; export size independent of edit count |
| Set the same value repeatedly | No new revision/output change after the first effective update |
| Change, undo and redo 100 times | Model and export hashes match their expected initial/final states |
| Add mobile override, change base, reset mobile | Explicit inheritance restored; no orphan override or selector remains |
| Toggle breakpoints repeatedly | No property writes, duplicates or code growth |
| Drag/resize 1,000 preview frames | One committed transaction per gesture; no new wrappers or style tags |
| Duplicate, reorder, save and reload subtree | Stable IDs except intentionally duplicated IDs; references remain valid |
| Save/reload repeatedly | Canonical serialization and exported bytes remain stable |
| Project export/import repeatedly | Model equivalence and deterministic production exports |
| Replace an image repeatedly | One current binding; original assets retained by library policy; unused derivatives excluded from production |
| Select every plan/state at breakpoint boundaries | Correct accessibility and interactions; no duplicate event handlers or DOM relocation |
| Modify a component property | Its owner changes; unrelated component output remains byte-identical |

Implement unit tests for property resolution, normalization, migrations, commands and inverse operations. Use property-based tests for randomized edit/revert sequences and invariants. Add export snapshots, dependency-boundary tests, duplicate-style checks and pixel/layout regressions at approved widths, states, reduced motion, keyboard focus and provider failure. Test real integrations separately with authorized test records; never submit customer forms as a side effect of screenshot tests.

## Prevention gates and rollout

- Validate schema on every committed command, project load, migration and export; reject unknown property ownership and unsafe executable content.
- Make normalization idempotent: `normalize(normalize(model)) === normalize(model)`.
- Centralize property serialization and responsive resolution. Ban editor code from calling `style.append`, writing new `<style>` blocks or mutating export templates as a persistence mechanism.
- Enforce a single component/property/scope/state owner. Flag duplicate declarations, overlapping responsive ownership, specificity growth and unexplained `!important` at review and CI.
- Compare byte sizes, selector counts, component counts and export hashes across long edit sequences. Set growth budgets against model complexity, not against number of edits.
- Keep immutable source assets and provenance hashes; require explicit approval for visual changes. Derivative pipelines verify decoded pixels/quality and font coverage before promotion.
- Fail closed on nondeterministic exports, missing assets, unsupported migrations or visual regressions. Keep a versioned checkpoint and migrate in small reversible steps.
- Require production smoke tests to run without editor packages, storage or messaging bridges. Audit bundles for editor strings/imports and unused dependencies.

Architecture review should ask “which canonical value changed, and which owner serialized it?” If the answer is “we appended an override to fix the preview,” the operation is incomplete. Fix the model or its renderer before accepting the edit path. Cleanup tooling is a migration aid; invariant-enforcing APIs, deterministic builds and regression gates prevent the debt from recurring.
