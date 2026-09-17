# Proving ground — jaunder-org/jaunder#1549

## 2026-09-16: local package validation

**Result:** `jaunder theme check .` accepted the package after generated CSS
was limited to Style Contract 1 hooks and declared local URLs.

**Observed platform limitation:** Jaunder currently rejects the standard
`font-display: swap` descriptor in `@font-face` with `CSS is invalid:
custom-property token streams cannot hide global references`.

**Reproduction:** add `font-display: swap` to the sole `@font-face` in
`src/theme.css`, run `npm run generate`, then run
`/home/mdorman/src/jaunder/milestone-22-3/target/debug/jaunder theme check .`.

**Classification:** Jaunder CSS parser defect; not a package-limit change. The
standard descriptor does not carry a cross-surface global name, while its token
stream remains subject to Jaunder's URL visitor.

**Resolution in progress:** Jaunder commit `3967456a` admits `font-display`
without admitting arbitrary unknown `@font-face` descriptors and retains URL
rejection inside its value. Focused red/green proof covers both `swap` and an
external-URL rejection. This package now retains `font-display: swap` and passes
`jaunder theme check` against a binary built from that commit. Release readiness
still depends on the Jaunder fix landing and the workflow pin advancing to its
immutable `main` commit.
