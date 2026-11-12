# CSS ownership

`src/style.css` imports canonical sheets for fonts, shared tokens, foundation, Header, Hero, Steps, Services, Standards, Contact and Footer. Component-local custom properties stay in their component; shared tokens live in `tokens.css`.

Edit the authoritative rule at its intended scope. Do not restore historical source-authored, native-layout or parity/correction sheets; the approved checkpoint preserves them. Do not append corrective sheets or create style blocks per edit. Preserve rule order across overlapping media queries. Adjacent equivalent media blocks may be combined without reordering children.

The 17 remaining priority declarations are listed in `docs/performance/css-exceptions.json`. They preserve measured responsive/state behavior, hidden/focus handling and reduced motion. Changes require deliberate review and the same visual/functional gates. Run `npm run check:architecture` to check priority budgets, duplicate faces and deterministic HTML generation.

Original font bytes are unchanged. Repeated weight declarations were consolidated only after checking their actual variable-font axes. Normal-script Unicode ranges remain available. Unused italic faces remain in the source asset library. Add font registration through `fonts.css`, rather than introducing a component-specific duplicate.
