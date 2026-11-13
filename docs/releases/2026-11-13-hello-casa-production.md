# Hello Casa — production release record

**Release date:** 2026-11-13
**Status:** Published to existing Wix website and merged into GitHub main

## Source and verification
- GitHub repository: `hellocasausa/hello-casa-website`
- Approved PR: #1; merge commit: `063253a204c156b5eb6727252907652791415961`
- Tested source head: `b837c6d0ca1e7a6089c3b3ba6c73fbab6d162614`
- Browser QA: **53 of 53 passed** in Approved Services and Standards Integration QA (run `43459625305`).
- Previous main rollback branch: `checkpoint/pre-hello-casa-production-20261113` (commit `ce577135da8791c8de363853ca6e63d5686c7742`).
- Production package: ZIP of tested Vite static build's `index.html` and `assets/` only, 32 files, SHA-256 `13e8bcece13c59e0d85933435aa53856071f59110817b901ea2cadd232da4e43`.
- Release packaging changes only: drop experimental `review/`, `mobile-*` pages, and use `<meta name="robots" content="index,follow">` rather than the staging site's `noindex,nofollow`. The canonical remains `https://www.hello-casa.com`. This packaging step must be repeated for future production builds; do not publish staging's noindex tag directly.

## Wix destination
- Existing Wix site ID: `107600a7-fcb3-460e-b9a9-8a4c7452cfe6`; **no new Wix site was created**.
- Primary published custom-domain URL: https://www.hello-casa.com/
- Wix dashboard: https://manage.wix.com/dashboard/107600a7-fcb3-460e-b9a9-8a4c7452cfe6
- Before-release Wix static revision: `c4ee7124b1248ba1a7a3be0457cb0794fd955a84`, 204 files.
- After-release Wix static revision: `9e08eadf5348685f10c5792e6cc04d49dd002da3`, 32 files.
- Wix read-back confirmed canonical domain, indexable robots tag, simplified Standards headings, Jotform quote destination and compiled two-column checklist CSS.
- The Wix publishing tool returned the same site ID and confirmed a live deployment. The exact primary custom domain was independently confirmed by Wix's published-site-URLs API.
- Built preview/browser tests verify component behavior; a real external Jotform submission and payment test were **not** performed.

## Approved visible changes
- Mobile Services at widths 375–750px: two canonical checklist cards per row; single-column fallback below 375px; task text 11.5px, smaller checks/padding and preserved Available Additions. No checklist IDs, business logic or destinations changed.
- Mobile Contact: 4px accent line reaches the left edge.
- Mobile Standards: headings/kickers moved 10px toward their story numbers, with matching 39px peach decorative lines, retaining the Cascading Zigzag presentation.
- All previous desktop/tablet and approved responsive changes from PR #1 retained.

## Release discipline
For further changes, keep the GitHub source and Wix custom-domain site in sync. Build/test the source, create a production-only bundle, and use the existing site ID when uploading. Validate the Wix static files and custom-domain mapping after each release. Do not publish staging-only review pages or a `noindex` meta tag to the custom domain.
