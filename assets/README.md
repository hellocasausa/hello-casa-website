# Original source library

`originals/` contains the byte-preserved image masters from the approved reconstruction. They are not copied wholesale into production. `original-roles.json` records their pre-optimization URL roles; `source-manifest.json` retains original hashes and URL identities. Public URL entries in those provenance files are historical, not current delivery paths.

`reference-fonts/` retains original faces excluded from delivery (for example unused italic subsets). Active original WOFF2 files remain in `public/assets/`; their bytes and approved font metrics are unchanged. The approved checkpoint also preserves the full original public layout.

`npm run generate` derives only referenced image delivery files through `scripts/prepare-assets.mjs` and writes `src/data/delivery.json`. A smaller encoding is used only when decoded alpha and every nontransparent pixel match the original; fully transparent RGB may be discarded. The original JPEG is retained when lossless WebP is larger. No lossy quality setting or resized rendition is silently substituted. Source metadata/crop and high-resolution originals remain available for later reviewed derivative work.
