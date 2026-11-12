# Phase B.3 measured results

Approved checkpoint: `e5953f2d0d4375daf5a8462c9343d71785e5f81b`. All sizes below are bytes; gzip is an encoded-size estimate for text, not source size.

| Production resource | Before raw | After raw | Before gzip | After gzip |
| --- | ---: | ---: | ---: | ---: |
| html | 16291 | 16966 | 4616 | 4721 |
| css | 129286 | 75107 | 16376 | 13879 |
| js | 14728 | 14728 | 4163 | 4163 |
| image | 6882155 | 4456491 | — | — |
| font | 536832 | 267692 | — | — |

Initial cold first-party measurements (no scrolling; median of three local samples):

| Width | Before response bodies | After response bodies | Before transfer incl. header estimate | After transfer | Before LCP ms | After LCP ms | Before CLS | After CLS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 390 | 4591655 | 3055073 | 4598255 | 3061673 | 152 | 116 | 0.001777 | 0.001777 |
| 820 | 5359196 | 3191721 | 5365796 | 3198321 | 148 | 120 | 0.003737 | 0.003737 |
| 1440 | 5322380 | 3154905 | 5328680 | 3161205 | 132 | 144 | 0.001164 | 0.001164 |

Lighthouse: one bounded mobile simulated-throttling run per version; external HTTPS/Jotform blocked. See `lighthouse.json` for exact version, settings and audit values. These are lab results, not field Core Web Vitals or INP. Native lazy loading can prefetch near-below-fold art; do not infer savings from a loading attribute alone.

Mobile Lighthouse lab sample (external provider excluded):

| Metric | Before | After |
| --- | ---: | ---: |
| Performance score | 75 | 76 |
| first-contentful-paint | 1381.7 | 1382.0 |
| largest-contentful-paint | 13578.3 | 7129.0 |
| cumulative-layout-shift | 0.000691 | 0.000691 |
| total-blocking-time | 0.0 | 0.0 |
| speed-index | 1381.7 | 1382.0 |

Times are milliseconds. LCP remains an optimization opportunity under simulated mobile conditions. Single-run score differences are not a production performance guarantee.
