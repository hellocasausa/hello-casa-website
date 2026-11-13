# Phase B.3 implementation and trade-offs

## Protected reference and delivery gates

The approved reconstruction is preserved on remote branch `checkpoint/phase-b3-approved-e5953f2`, commit `e5953f2d0d4375daf5a8462c9343d71785e5f81b`. This phase preserves that rendering and the B6.3.3 embedded website's authority; it introduces no designs from historical standalone previews. No editor, merge or deployment is part of this change.

The final production build/type-check, seven functional/layout tests and architecture guards pass. All six plans and 129 unique task identities remain unchanged. There are 68 successful full-page perceptual screenshot comparisons at 38 widths, including 390/820/1440, breakpoint boundaries, all plan/focus states and open-menu/hover/keyboard-focus states. The comparator uses threshold 0.1 with anti-aliasing ignored; this is not a claim of byte-identical screenshot PNGs or universal cross-browser equivalence. `visual-comparison.json` records every result. A separate provider fixture compares Contact card/iframe geometry at 513px and 800px provider heights at the three reference widths, without sending real submissions.

## CSS and component ownership

The 917 original source `!important` declarations are reduced to 17 explicitly documented exceptions, without adding a corrective layer. Exact-scope shadowed declarations were consolidated, redundant priorities removed through candidate comparison, and adjacent identical media contexts merged without reordering their children. Resolved-style comparisons sampled responsive and interaction states; final acceptance depended on the independent pixel and functional gates, not on textual equality of minified CSS tokens.

Canonical files in `src/styles/` now own foundation, tokens, fonts and individual components. Retired source-authored, native-layout and parity sheets, extraction scripts and duplicate source templates are removed from the current branch; the approved checkpoint preserves their provenance. Future changes edit the existing rule rather than append another override. The remaining priority contracts are listed in `css-exceptions.json`. Architecture checks reject an unreviewed priority declaration/scope, duplicate font registration, nondeterministic generated HTML and obsolete source hooks.

The builder composes stable native templates through explicit selectors and assertions. Catalog data owns initial checklist content; the same render helper supplies later client state. No regex replacements of serialized HTML, Wix host relocation, duplicate renderers or editor framework are required. `linkedom`, image tooling and performance tools are development/build dependencies; none enter the customer JS bundle.

## Assets and font delivery

Original high-resolution image bytes are retained in `assets/originals/`. Source hashes/roles and verified variable-font metadata are in `assets/`. Only referenced delivery copies are packaged. Smaller lossless WebP is accepted only when alpha and every nontransparent decoded pixel match the master; differences in fully transparent RGB do not change appearance. If conversion is larger or changes visible pixels, the original encoding remains. The large mobile footer JPEG stays JPEG because lossless WebP did not improve its size.

The Hero remains eager, high priority and at its original default decoding behavior. Standards and Contact artwork use native lazy loading and asynchronous decoding with intrinsic dimensions; the footer retains eager/default decoding. An experimental lazy/async footer caused intermittent offscreen-paint omissions during verification, so that change was rejected rather than masked by CSS. Native lazy loading may still prefetch artwork early; measured transfer savings come predominantly from smaller lossless encodings, not an assumed loading-attribute benefit.

Font bytes and normal-script Unicode coverage are unchanged. Metadata checks confirmed variable `wght` axes before repeated weight registrations were merged. This consolidated 153 face declarations; 15 registrations remain across the required families, aliases and normal-script subsets. Unused italic subsets are retained in `assets/reference-fonts/` instead of shipped. Initial browser font requests were already a subset of packaged files, so halving packaged font bytes does not imply halving each visitor's font transfer.

Production HTML grows slightly to carry intrinsic dimensions and delivery attributes. JS remains the same size. The CSS raw reduction is larger than its gzip reduction; [results.md](results.md) distinguishes both. Original-reference assets increase repository storage compared with shipping delivery copies alone; they are intentionally excluded from production output.

## Remaining opportunities for a separate phase

- Downscaled responsive `srcset` derivatives could save substantially more for small wordmarks and artwork. They were investigated but not introduced: browser downsampling versus pre-resizing can alter edge/crop pixels. Review those renditions against the approved references before adopting them. Existing mobile/desktop footer sources and crops remain intact.
- Lossy WebP/AVIF could further reduce watercolor sizes, but requires a separate visual-quality decision. This phase deliberately uses lossless delivery.
- Deeper semantic selector/property normalization could remove the remaining 17 priorities and shorten overlapping responsive rules. It must preserve the same approved state matrix and integration behavior. Do not introduce specificity escalations to meet a numerical target.
- CDN caching, Brotli, cache invalidation and deployment headers need a separately authorized hosting phase. The local gzip fixture is a measurement setup, not a deployed configuration change.
- Real Jotform network cost, provider-side rendering, submission/notification flows and field Core Web Vitals remain separate. External traffic was excluded for reproducible measurements; no form submissions occurred. INP needs representative interactions/field data. Local timing variance and a single simulated Lighthouse sample do not establish a guaranteed production speed.
- Design Studio 2.0 is specified in [the anti-accretion architecture document](../design-studio/anti-accretion-architecture.md). The editor/model/export systems must be built separately; this website optimization does not implement them.
