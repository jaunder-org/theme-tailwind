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

**Resolved:** Jaunder PR
[`#1555`](https://github.com/jaunder-org/jaunder/pull/1555) landed in immutable
`main` commit `98b53ef0f6456f1f35f638a4dca898c633dcdaa8`. It admits only the five
standard `font-display` keywords, continues rejecting arbitrary unknown
`@font-face` descriptors, and retains URL rejection inside descriptor values.
Focused red/green proof covers accepted keywords plus unknown, functional,
multi-token, and external-URL rejection. This package retains
`font-display: swap` and passes `jaunder theme check` against the landed binary.
The final reusable-workflow pin advanced again after the permission blocker
recorded below.

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

## 2026-09-17: reusable-workflow permission inheritance

**Observed platform failure:** the first real pull-request run failed before any
job started. The read-only package caller invoked Jaunder's reusable workflow,
but GitHub rejected it because the skipped nested release job explicitly
requested `contents: write`. GitHub validates nested permission requests before
job conditions, so a reusable workflow containing that request cannot also
serve a least-privilege read-only caller.

**Classification:** Jaunder reusable-workflow defect demonstrated by the real
external repository, not an Actions outage and not a reason to grant write
permission to pull-request packaging.

**Resolution:** Jaunder PR
[`#1558`](https://github.com/jaunder-org/jaunder/pull/1558) landed in immutable
`main` commit `ddceffae8cf66039c04fa18d100586520900b4f3`. The nested release job now
inherits caller permissions; branch and pull-request callers grant only
`contents: read`, while tag release callers grant `contents: write`. This
repository pins both the reusable workflow and Jaunder binary to that commit.

## 2026-09-17: public-control contrast

**Observed Theme failure:** the first installed workflow artifact passed package
validation but failed the route-level WCAG scan. Its broad authored `a` rule
recolored Jaunder's Register control while retaining the control's dark
background, producing a measured 2.93:1 ratio instead of the required 4.5:1.

**Classification:** Theme authoring defect, not a Style Contract or compiler
failure. The public surface intentionally includes Jaunder-owned navigation as
well as Post content, so safe generic selectors can still create inaccessible
combinations.

**Resolution:** limit Theme link colors to links inside the semantic
`primary-navigation` and `post` parts, regenerate `style.css` and `preview.png`,
and repeat package, installation, and accessibility proof. This preserves the
recognizable Tailwind link treatment without styling unrelated controls.
