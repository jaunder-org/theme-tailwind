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

**Resolution in progress:** Jaunder commit `76bc21bb` admits `font-display`
without admitting arbitrary unknown `@font-face` descriptors and retains URL
rejection inside its value. Focused red/green proof covers both `swap` and an
external-URL rejection. This package now retains `font-display: swap` and passes
`jaunder theme check` against a binary built from that commit. Release readiness
still depends on the Jaunder fix landing and the workflow pin advancing to its
immutable `main` commit.

## 2026-09-16: canonical thumbnail smoke

**Observed authoring failure:** the first stylesheet repeated Jaunder's Theme
surface selector in every authored selector. Jaunder correctly scoped those
selectors again, producing an unreachable surface-descendant-of-surface shape;
`theme check` passed because the CSS was safe and syntactically valid, but the
thumbnail showed that none of the intended rules applied.

**Classification:** Theme author error, not a Jaunder validator defect. The
Style Contract documents that Jaunder adds the scope and instructs authors to
use `:root` plus semantic part hooks. Whether a safe selector matches useful
content is presentation behavior owned by preview and visual review, not the
package security validator.

**Resolution:** author root declarations through `:root` and descendants through
`data-jaunder-part` hooks only. Regenerate `style.css`, rerun `theme check`, and
regenerate the thumbnail; the resulting preview visibly applies the intended
shell, cards, typography, assets, and color treatment.
