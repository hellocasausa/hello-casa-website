# Performance verification protocol

The immutable approved checkpoint is `checkpoint/phase-b3-approved-e5953f2` (`e5953f2d0d4375daf5a8462c9343d71785e5f81b`). It is the Phase B.3 visual reference, derived from the B6.3.3 embedded website. Historical previews are excluded.

Measurements use production output, not Vite development responses. The local fixture server gzips HTML, CSS, JS and SVG; image/WOFF2 byte counts are their encoded response bodies. `raw` is file size on disk; `gzip` is a size estimate, not a claim about a future host. Actual local browser `encodedBodySize`/`transferSize` are recorded separately, including the navigation document. Headers are included only in transfer estimates/measurements. The local server sends `no-store` to exercise cold loading; production caching/CDN configuration is not changed by this work.

Reproduce the approved build in a temporary checkout of the checkpoint, `npm ci && npm run build`, then:

```sh
node scripts/perf/server.mjs /path/to/approved/dist 4174
node scripts/perf/capture.mjs http://127.0.0.1:4174 before /path/to/approved/dist
npm run build
node scripts/perf/server.mjs dist 4173
node scripts/perf/capture.mjs http://127.0.0.1:4173 after dist
node scripts/perf/compare.mjs
```

Run each server in a separate terminal. Capture writes PNGs into ignored `.artifacts/before` and `.artifacts/after`; the comparator records pixel differences and dimensions in `visual-comparison.json`. It tests 38 widths including 390, 820, 1440 and affected media-query boundaries. Additional plan/focus states are exercised at 390, 820 and 1440. Run each capture command again with `--extras` to include open-navigation, hover and keyboard-focus states; together these form 68 comparisons. The perceptual comparator uses threshold 0.1 and ignores anti-aliasing differences; it does not claim byte-identical PNGs. Lazy art is forced eager and fully decoded, with settled animation frames, for full-page screenshot comparison after initial network measurement. This avoids conflating deferred offscreen paint with a design change. The production footer keeps its original eager/default decoding behavior. The seven existing functional/layout tests remain independent checks.

Initial network measurements precede scrolling and use three cold contexts per viewport. Resource Timing and PerformanceObserver record first-party bodies, header estimates, FCP, LCP and CLS under local unthrottled conditions. They are lab samples, not field Core Web Vitals or reliable real-world speed predictions. INP needs representative interactions and field data; it is not inferred from an empty page-load sample.

External HTTPS traffic is blocked for stable comparisons and to avoid submissions. Jotform's remote bytes, field rendering and network variability are excluded from these first-party results. Its official integration remains unchanged; provider sizing is verified separately. No real form submissions are authorized by these tests.

A bounded mobile Lighthouse run uses the same fixture, pinned installed version/default mobile simulated throttling, with external traffic blocked:

```sh
CHROME_PATH=/path/to/playwright/chrome npx lighthouse http://127.0.0.1:4174 \
  --chrome-flags='--headless --no-sandbox' --output=json \
  --output-path=.artifacts/lighthouse-before.json --only-categories=performance \
  --blocked-url-patterns='https://*' --quiet
```

Repeat against port 4173 for the after sample. Single Lighthouse scores are directional; raw audit values, settings and limitations belong in the results, not a claim of a guaranteed production score. No live-site requests, deployment or provider configuration changes are needed.

The measured outcome is in [results.md](results.md), with [implementation notes and remaining opportunities](implementation-notes.md). `provider-sizing.json` records independent local Jotform-iframe fixture growth checks; it is not a real form submission test.
