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

**Observed final route-level defect:** canonical run `35268445169` installed
artifact SHA-256 `42df7fb53f215ebbcfb645c5e78524fc78c63186b45d2eee9528634e19918341`
showed `.j-tag-here` inheriting Jaunder's muted-soft `#9a9a96` on the Theme's
white Post background at 2.82:1.

**Classification:** Theme integration/authoring defect. The first attempt used
the `tag` descendant hook, but `.j-tag-here` is a sibling of the
`[data-jaunder-part="tag"]` anchor inside the `tag-list`, so that selector could
not match the context link.

**Resolution:** set `[data-jaunder-part="tag-list"] a` to accessible `#075985`
in light mode and `#bae6fd` in the existing dark-mode media rule. This scopes
the fix through the tag-list descendant hook without targeting Jaunder classes.

## 2026-09-17: narrow application shell

**Observed platform failure:** at a 390px viewport Jaunder's fixed 232px sidebar
left roughly 150px for the Theme surface. The installed package could reflow its
own content, but could not repair application chrome outside the compiler-owned
Theme scope.

**Classification:** Jaunder application-shell defect demonstrated by the
installed package, not a Theme CSS or Style Contract defect.

**Resolution:** Jaunder PR
[`#1560`](https://github.com/jaunder-org/jaunder/pull/1560) landed in immutable
`main` commit `a231d9d6215a638ce8e860a95b39d87179159680`. Below 720px the shell now
stacks navigation above the main surface, and the obsolete Firefox-only narrow
Post Actions placement override was removed so the trusted disclosure remains
anchored to its trigger. Focused responsive-shell and cross-backend/browser
Post Actions coverage, updated Chromium and Firefox visual baselines, and the
full required CI matrix passed. The final pin advanced again after the selector
compiler blocker recorded below.

## 2026-09-18: descendant selector serialization

**Observed platform failure:** the installed artifact from canonical run
`35271159776` contained the intended semantic selector
`[data-jaunder-part="tag-list"] a`, but Jaunder compiled it as
`a [data-jaunder-part="tag-list"]`. The reversed selector could not match the
context link, so the route-level WCAG scan continued reporting 2.82:1 contrast.

**Classification:** Jaunder CSS compiler defect demonstrated by the real Theme
package, not a Style Contract expansion. Lightning CSS exposes selector
components in right-to-left match order, while Jaunder reconstructed them as if
they were already in serialization order.

**Resolution:** Jaunder PR
[`#1566`](https://github.com/jaunder-org/jaunder/pull/1566) landed in immutable
`main` commit `d2f9e457e647f5f9c9b64dee1577f2e346171afe`. The compiler now reverses
compound order while preserving component order within each compound. Regression
coverage includes this package's selector plus multi-component compounds and
mixed combinators; required validation and the full e2e matrix passed. This
repository pins both the reusable workflow and Jaunder binary to that commit.

## 2026-09-18: dark permalink contrast

**Observed final installed-artifact failure:** canonical run `35291517641`
installed artifact SHA-256
`232c8c6d37a5da7cfe6b4315159c0d123828fa345058bb08e99467cd32fb9783` into
Jaunder commit `d2f9e457`. Light Local, author, tag, and permalink proofs
passed, but dark permalink Axe found the masthead `h1` and post-body `p` at
1.68:1 on `#374151`, plus semantic `author-handle` and `published-time` at
2.01:1. Each missed the 4.5:1 normal-text AA target.

**Classification:** Theme-authoring defect. The installed artifact did not
supply explicit dark values for these Style Contract semantic hooks, allowing
lower-contrast inherited values on the dark card background; this is neither a
Jaunder compiler nor a Style Contract defect.

**Resolution:** in the existing dark media rule, assign masthead `h1` the
light-heading `#f1f5f9`; assign `author-handle` and `published-time` the
muted-light `#cbd5e1`; and explicitly assign post-body
`:is(p,ul,ol,blockquote)` `#d1d5db`. The selectors use only Style Contract
semantic hooks and no Jaunder classes.

## 2026-09-18: dark author masthead subtitle contrast

**Observed final installed-artifact failure:** canonical run `35292674686`
installed artifact SHA-256
`33fa5648b26a7b5bb040cadeabf76b14bef3a6924801b7ed83a06fe1b966e8af`
into Jaunder commit `d2f9e457`. All light routes and dark Local passed, but
dark author route `/~testoperator` left the masthead subtitle `.j-sub` at
`#6e6e6a` on `#374151`, a 2.01:1 contrast ratio below the 4.5:1 normal-text
AA target.

**Classification:** Theme-authoring defect. The subtitle lacked an explicit
dark value; this is not a Jaunder compiler or Style Contract defect.

**Resolution:** in the existing dark media rule, style ordinary `div`
descendants of the masthead semantic boundary
`[data-jaunder-part="masthead"]` with muted-light `#cbd5e1`. This does not
depend on sibling positions or target Jaunder classes; explicit control colors
remain independent.

## 2026-09-18: final installed-artifact proof

Canonical run `35293327375` produced `theme-package.zip` SHA-256
`136b28a941d475859804f6ea886fa8fa425f7d1454884332c1ce7f13e39fcd4f`.
Installed into Jaunder commit `d2f9e457e647f5f9c9b64dee1577f2e346171afe`,
the exact artifact completed the Studio Site catalog lifecycle: ZIP import,
private preview, publish, and explicit Public selection.

A fresh unauthenticated Chromium context at 390×844 then exercised Local,
author, tag, and permalink routes in both light and system-dark modes with
reduced motion. All eight route states loaded exactly one Theme stylesheet,
exposed the Theme surface, had no machine-checkable WCAG 2.2 A/AA violations,
stacked the sidebar above the main surface, remained within the viewport, and
had no horizontal overflow. Comparable screenshots live in the issue evidence
set under `tailwind-final-{local,author,tag,permalink}-390-{light,dark}.png`.
The authenticated permalink also retained visible trusted Post Actions, and no
selector from the compiled Theme stylesheet matched its trigger. The focused
`cargo xtask e2e-local --browser chromium theme-tailwind-final-proof.spec.ts`
proof passed; its temporary test file was removed after the run. Later
presentation changes and the avatar-hook blocker below require this proof to be
repeated against the final immutable pin before release.

## 2026-09-18: missing avatar semantic hook

**Observed platform failure:** expanded optional-state proof installed canonical
run `35295469290`, artifact SHA-256
`820b6853a3bc1094ed7979695b1565c9ec2d543bc601647690f1eb3fc789824e`,
into Jaunder commit `d2f9e457e647f5f9c9b64dee1577f2e346171afe`. Style
Contract 1 documented the optional `avatar` part and this Theme authored it, but
rendered initials avatars exposed no `data-jaunder-part="avatar"` hook in either
the server or reactive markup.

**Classification:** Jaunder Style Contract implementation defect demonstrated
by the real package, not a request for a new hook. The public contract and Theme
source already agreed on the semantic concept; the rendering twins omitted it.

**Resolution:** Jaunder PR
[`#1572`](https://github.com/jaunder-org/jaunder/pull/1572) landed in immutable
`main` commit `45703226a23b66c89683c3ddc88b1cb10a3584fb`. Both SSR and
CSR avatar twins now emit the documented hook, with exact renderer regression
coverage; required validation and the full e2e matrix passed. This repository
pins both the reusable workflow and Jaunder binary to that commit.

## 2026-09-18: dark structured-list contrast

**Observed Theme failure:** the final installed-artifact matrix added structured
Markdown and found list items at `#1a1a19` on the dark post surface `#374151`, a
1.68:1 contrast ratio. Paragraphs, list containers, quotations, and code were
already covered, but Jaunder's presentation reset assigns a foreground directly
to each `li`, so the list item did not inherit the authored list color.

**Classification:** Theme-authoring defect. The package had not covered the
ordinary list-item descendant within the documented `post-body` semantic
boundary.

**Resolution:** extend the existing dark `post-body` descendant group to
include `li`, retaining the accessible `#d1d5db` foreground. This remains
inside the semantic boundary and does not depend on Jaunder classes, wrapper
depth, or sibling positions. The final installed-artifact matrix must pass
again with this generated CSS before release.

## 2026-09-18: long unbroken post content

**Observed Theme failure:** final wide visual review showed the structured
fixture's deliberately long unbroken token painting beyond the post card. The
document did not gain horizontal scrolling because the application shell clips
overflow, but the content itself escaped its presentation boundary.

**Classification:** Theme-authoring defect. The Theme did not define a wrapping
policy for arbitrary authored post content.

**Resolution:** apply `overflow-wrap: anywhere` at the documented `post-body`
semantic boundary so direct text and arbitrary Markdown wrappers inherit the
policy. Semantic heading descendants restore `overflow-wrap: normal` at normal
viewports. Through 24rem, the Theme uses a 1.75rem `post-body h1` and permits
emergency wrapping: the 320px content box cannot contain the longest ordinary
fixture word even at that reduced scale. This keeps the 390px presentation's
whole heading words while guaranteeing true 320px reflow. The final artifact
and visual matrix must be regenerated and repeated.

## 2026-09-18: final immutable-pin installed-artifact proof

Canonical workflow run
[`35367633808`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35367633808)
for commit `fa7eb12` produced `theme-package.zip` SHA-256
`0d1d5f21e1a9e92f5c753518afe218b321cb1391c48ccbf8245ac9cc08b09955`.
The exact artifact was installed into Jaunder immutable `main` commit
`45703226a23b66c89683c3ddc88b1cb10a3584fb` through the Site catalog ZIP
import, isolated private preview, publish, and explicit Public selection flow.
Theme Studio remained on the trusted Studio presentation with no public Theme
stylesheet.

The final Chromium presentation matrix seeded 51 paginated Posts plus plain,
structured-Markdown, and explicit-summary states. It covered Local, author,
tag, and permalink routes; titled and untitled Posts; summary presence and
absence; avatars, tags, attribution, continuation, long unbroken content, and
structured headings, prose, links, lists, quotations, and code. Package logo,
font, header default, and both explicit header-pool entries were fetched from
rendered routes and matched the committed SHA-256 digests. The matrix verified
one public Theme stylesheet, the Theme surface, 320px document and painted-text
containment, 200%-zoom-equivalent layout, 3px keyboard focus, reduced-motion
absence of transitions/animations, and zero automated WCAG 2.2 A/AA
violations in light and dark modes. Manual review accepted the resulting visual
hierarchy, contrast, responsive placement, and long-content containment.

Retained Studio-Before/Theme-After screenshots cover Local and permalink at
1440×900 and 390×844 in light and dark under
`final-pairs/{studio-before,theme-after}-...png`. The eight final route images
remain `tailwind-final-{local,author,tag,permalink}-390-{light,dark}.png`.

Finally, the same artifact passed focused trusted Post Actions proofs in
Chromium, Firefox, and WebKit. Each browser used two owned Posts, scrolled the
second narrow trigger into view, opened and used the native menu, verified its
390px viewport placement, and proved that no compiled Theme selector matched
either trusted trigger. Temporary repository-local evidence specs were removed
after the successful runs.
