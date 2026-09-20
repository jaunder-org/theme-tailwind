# Issue #1549 evidence status

## Pass 1 supersession notice

The font-face change after final-review pass 1 changes the canonical package
bytes. **Every retained presentation screenshot and every visual verdict below
is superseded historical evidence, not final approval.** They remain only as
machine and review history pending the deliberately deferred pass-2 visual,
optional-state, and trusted-controls reruns. The focused font lifecycle record
added for this pass is package/lifecycle evidence only and makes no visual
verdict.

This directory is reserved for evidence from the current semantic-hook redesign
candidate. The prior images were deliberately removed because they prove an
older presentation and artifact; they are not evidence for the current
candidate.

## Computed font lifecycle repair

Canonical workflow run
[`35534627075`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35534627075)
for `579b40a196d60be5c021f9eed9fed28e55f7d936` passed. Its only downloaded
`theme-package.zip` input was
`/tmp/theme-package-35534627075/theme-package.zip`, SHA-256
`c55b502a54851ef5ee0d6210c36a203eb73358b17b96fdea1c8d0b656a6c858c`.

The focused durable Chromium harness
[`harness/font-lifecycle-evidence.spec.ts`](harness/font-lifecycle-evidence.spec.ts)
was temporarily copied to Jaunder, run once, and removed. Its exact successful
command and execution record are in
[`logs/chromium-font-lifecycle-evidence-e2e-local.log`](logs/chromium-font-lifecycle-evidence-e2e-local.log);
the machine assertions are in
[`logs/canonical-font-lifecycle.json`](logs/canonical-font-lifecycle.json).
The record proves the immutable `/theme/8909904ab6c872eb994093482a88a28eca2cd95912d7b6fecd72103b0dc07edc`
WOFF2 route and matching bytes, one consistently namespaced `@font-face` and
all `font-family` references, a loaded namespaced face in `document.fonts`, and
computed use by both `main` and `navigation-rail`. Its matched-rule capture
shows Jaunder's `.j-root, .j-root *` base rule alongside the higher-specificity
semantic-boundary rule that wins. The trusted Actions mount had no button in
this lifecycle DOM, so no trusted-control font assertion was applicable.

The current visual evidence remains superseded pending pass 2; this focused
font lifecycle pass makes no new visual verdict.

The checkpoint's immutable Jaunder/workflow pin is
`bfb02febb81212258aff1c10bbdf5248fa864cc5`. Canonical workflow run
[`35480319754`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35480319754)
produced candidate ZIP SHA-256
`433ee5e18846f43baf794dbab6d522a9483940ffd9a83cde8f03c0a60c45d5ce`.
Its local and canonical generation, drift, package-validation, and thumbnail
commands are recorded in [`PROVING-GROUND.md`](../../PROVING-GROUND.md).

## 2026-09-20 final-evidence blocker

Canonical run
[35480413189](https://github.com/jaunder-org/theme-tailwind/actions/runs/35480413189)
for final head `50dec18f537d27898eed0810c18c474fc87aa99f` completed
successfully. The sole downloaded ZIP input was
`/tmp/theme-tailwind-pr1-final-artifact/theme-package.zip`, SHA-256
`433ee5e18846f43baf794dbab6d522a9483940ffd9a83cde8f03c0a60c45d5ce`.

The exact durable harness source is
[`harness/final-evidence.spec.ts`](harness/final-evidence.spec.ts). It is copied
temporarily into Jaunder `end2end/tests/`, run by `cargo xtask e2e-local`, then
removed; Jaunder is not committed or otherwise altered. Concise machine-readable
execution records are in `logs/`, including parked `devtool run` stdout/stderr
and OTEL capture identities.

The final Chromium attempt found a Jaunder blocker: after importing the ZIP into
the Site catalog, previewing, publishing, and explicitly selecting it,
signed-out Local is `data-theme="custom"` with an immutable stylesheet but lacks
`[data-jaunder-part="header-image"]`, despite the package's declared header
defaults. See
[`logs/chromium-attempt-3-jaunder-blocker.json`](logs/chromium-attempt-3-jaunder-blocker.json)
for the minimal reproduction. This stops the matrix rather than papering over
missing package-header proof. `final-pairs/local-studio-before-light-1440x900.png`
is a fresh baseline only, not an approved final pair.

Jaunder PR #1597 corrected that blocker at immutable pin
`bfb02febb81212258aff1c10bbdf5248fa864cc5`.

## Resumed partial evidence

Canonical run
[`35518923804`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35518923804)
for `6c12950cd16bb4b61d52673e86aa4ca167fcb714` passed. Its sole downloaded
input is `/tmp/theme-tailwind-pr1-final-artifact-after-1597/theme-package.zip`,
SHA-256 `433ee5e18846f43baf794dbab6d522a9483940ffd9a83cde8f03c0a60c45d5ce`.

The exact retained harness passes Chromium, Firefox, and WebKit lifecycle and
two-Post trusted-Actions isolation. Chromium additionally records Local
continuation, package logo/header, structured long-token rendering, Axe, and
narrow/reduced-motion checks. The repair history and concise machine-readable
results are in `logs/`; fresh Local Studio-Before and Theme-After captures are
in `final-pairs/`.

Visual verdict for the captured Local light pair: **pass** for slate header,
centered cards, typography, package logo, and narrow reflow. This remains
partial evidence, not final approval: author/tag/permalink, owned-Media/pools,
200% scale, focus contrast, and the complete approved visual matrix are not
recorded. PR #1 remains draft; no tag, release, merge, or issue closure
occurred.

## Dark contrast repair

The current Theme source changes presentation bytes to correct dark Local
contrast. The retained `final-pairs/` route screenshots above are therefore
superseded historical captures, not approval evidence for the repaired package.
See [`dark-contrast.md`](dark-contrast.md) and its focused lifecycle logs for
the red/green cascade evidence; a new canonical ZIP and its minimal lifecycle
run are still required before visual approval.

## Route/visual partition blocker after dark-contrast repair

Canonical workflow run `35523654193` supplied the sole tested ZIP at
`/tmp/theme-tailwind-dark-contrast-final/theme-package/theme-package.zip`
(SHA-256 `8e2e8024d480f5c6522ca770cf8984640eb13142f8286773b4068d4e41c6ffc3`).
The new durable Chromium harness is
[`harness/final-evidence.spec.ts`](harness/final-evidence.spec.ts). Its first
final-artifact run is blocked by a Theme accessibility defect, not a harness or
Jaunder defect: on light Local, Axe WCAG 2.2 reports `link-in-text-block` for
the known permalink Post body link. The link color `#0369a1` has 2.93:1
contrast against surrounding `#1a1a19` text (minimum 3:1), and the link has no
non-color distinction. The exact command, minimal reproduction, and parked
stdout/stderr/OTEL identities are retained in
[`logs/chromium-routes-visual-blocker.json`](logs/chromium-routes-visual-blocker.json).

Accordingly this route/visual partition is **not complete** and no final
screenshots were retained. The passing `dark-contrast.spec.ts` and its evidence
remain preserved. Owned-Media and explicit header-pool selection remain deferred
and were not attempted.

## Post-body link repair checkpoint

The blocker is retained above as the red reproduction. The Theme now gives only
`[data-jaunder-part="post-body"] a` a persistent underline with explicit
thickness and offset; title, navigation, tag, and trusted-control link
presentations are unchanged. The durable harness records the computed
underline, thickness, and offset for the known structured Post-body permalink
before running Axe. Its ZIP checksum is supplied as
`THEME_TAILWIND_ZIP_SHA256`, so the subsequent route/visual execution can bind
the test to the newly downloaded canonical artifact rather than this superseded
blocker ZIP.

This checkpoint was pending a new canonical workflow artifact and the bounded
Chromium route/visual run. The prior screenshots remain deliberately removed.

## Completed Chromium route/visual partition

Canonical workflow run
[`35527202327`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35527202327)
for final head `9c09e3c0f95c92189091769bfa760913aa035ed9` passed. Its sole downloaded
`theme-package.zip` input was
`/tmp/theme-package-35527202327-40pjxf/download/theme-package.zip`, SHA-256
`b6cdc828e2a14e3b4c59ba4baa3516d149d19ddc94d46c18a29dc38b7e8634b4`, matching
the presentation-source artifact after the link fix.

The durable harness was copied temporarily to Jaunder `end2end/tests/` and the
sole bounded Chromium run passed via `devtool run -- cargo xtask e2e-local
final-evidence.spec.ts --browser chromium`. Its concise machine result is
[`logs/chromium-routes-visual-final.json`](logs/chromium-routes-visual-final.json)
and its parked successful e2e-local output is
[`logs/chromium-routes-visual-final-e2e-local.log`](logs/chromium-routes-visual-final-e2e-local.log).
The harness correction uses native keyboard Enter on the focused 200%-scale link
with a one-shot prevented navigation; it replaces a scale-coordinate-sensitive
trial pointer click and retains the actual operability assertion.

The result records successful import/preview/publish/selection/recovery, all
Local/author/tag/permalink light-and-dark Axe checks, 390px and 320px reduced-motion
containment, focus geometry and calculated contrast (5.93:1 light, 8.77:1 dark),
and Chromium page scale 2 with readable and keyboard-operable permalink content.

All 25 successful captures were inspected. Visual verdicts: **pass** for the
Studio Before Local and permalink baselines in light/dark at desktop and 390px;
**pass** for the Theme After Local and permalink pairs (slate/purple hero,
centered bordered cards, readable blue links, and narrow reflow without clipping);
**pass** for the final 390px Local, author, tag, and permalink light/dark routes
(the expected route headers, cards, tags, logo, and hierarchy remain legible);
and **pass** for the 200% permalink viewport (intentionally magnified partial
viewport with readable content and visible focused permalink). Only these
successful screenshots are retained in `final-pairs/` and `final-routes/`.

PR #1 remains draft: owned-Media and explicit pool partition evidence remains
out of scope and unattempted.

## Completed Chromium Media bindings partition

The bounded Media bindings run used the same sole canonical workflow artifact
from run [`35527202327`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35527202327):
`/tmp/theme-package-35527202327-40pjxf/download/theme-package.zip`, SHA-256
`b6cdc828e2a14e3b4c59ba4baa3516d149d19ddc94d46c18a29dc38b7e8634b4`.

[`harness/media-bindings-evidence.spec.ts`](harness/media-bindings-evidence.spec.ts)
was temporarily copied into Jaunder and passed under `devtool run -- cargo xtask
e2e-local --browser chromium media-bindings-evidence.spec.ts`; the temporary
test was removed afterward. The final machine result is
[`logs/chromium-media-bindings-evidence.json`](logs/chromium-media-bindings-evidence.json)
and the parked command/OTEL record is
[`logs/chromium-media-bindings-evidence-e2e-local.log`](logs/chromium-media-bindings-evidence-e2e-local.log).

The evidence proves exact package logo, content-addressed font, and header
bytes; each one-entry package pool and a deterministic complete package pool;
owned logo and header bindings through the supported Media UI; and a mixed
package/owned pool that resolves both entry types after supported shuffle and
stays stable without mutation. The generated export ZIP is intentionally **not retained in source control**.
Its exact SHA-256, six-member list, manifest/style equality, and portability
facts are retained in
[`logs/chromium-media-bindings-evidence.json`](logs/chromium-media-bindings-evidence.json);
it contained no instance-local owned Media. Explicit Studio recovery and
restoration of the custom selection passed.

The four retained screenshots in `media-bindings/screenshots/` were inspected:
**pass** — package default slate/purple header and logo; owned red logo; owned
blue header; and mixed-pool presentation have no visual breakage. PR #1 remains
draft for final review; this completes only the Media bindings checklist item.

## Corrected final-review pass 2 — 2026-09-20

The corrected state-matrix spec from Jaunder PR #1605 is merged at
`4dce29b3eab6b2622401bafa06257f2936a72217`. This pass used only immutable
Jaunder pin `bfb02febb81212258aff1c10bbdf5248fa864cc5` and canonical workflow
ZIP `/tmp/theme-package-35534627075/theme-package.zip`, verified SHA-256
`c55b502a54851ef5ee0d6210c36a203eb73358b17b96fdea1c8d0b656a6c858c`.

The durable corrected harness is
[`harness/final-evidence.spec.ts`](harness/final-evidence.spec.ts); its fresh
machine result is
[`logs/chromium-routes-visual-final.json`](logs/chromium-routes-visual-final.json)
and parked `devtool` identity is
[`logs/chromium-routes-visual-corrected-e2e-local.log`](logs/chromium-routes-visual-corrected-e2e-local.log).
It passed real import, preview, publish, public selection, recovery, route/Axe,
reduced-motion, true-320, 390, and 200%-scale checks. It records the exact real
renderer-state JSON: Local and permalink prove present/absent title, summary,
and tags; Local records continuation before activation; author records its real
first-page state; tag and both permalinks prove absent continuation; avatar and
author handle are always present; source attribution is absent without synthetic
DOM mutation or storage backdoors.

Keyboard proof is native: from a blurred known starting point the harness sends
Tab and records `/`, `/`, the public Post title link, then the Post-body
permalink. The resulting public link has a 3px outline and calculated focus
contrast 4.10:1 light / 8.76:1 dark. At 200% it reaches the same link by Tab and
activates it using native Enter under a one-shot prevented click listener.

[`static-optional-hook-review.md`](static-optional-hook-review.md) records the
static CSS/layout review. It finds semantic defensive styling for avatar,
author-handle, and source-attribution and no structural dependency on any of
them; source attribution has appropriate muted styling. Verdict: **pass**.

The 25 captures in `final-pairs/` and `final-routes/` were replaced by this
successful run and inspected. Verdict: **pass** — package Inter renders across
public semantic boundaries; Studio/Theme Local and permalink pairs retain the
card/hero hierarchy and responsive reflow; Local, author, tag, and permalink
390px light/dark routes are legible; the 200% view visibly focuses the keyboard
link. The upstream reference artifacts are retained in [`upstream/`](upstream/)
(see exact provenance below). Comparison verdict: **pass for recognizable
composition, typography, spacing, palette, and responsive card treatment; not
pixel identity**, as permitted by the Style Contract.

### Immutable upstream comparison provenance

- Source repository/ref: `https://github.com/tomowang/hugo-theme-tailwind/tree/d6841f6c9d53155a3245d6472555860f7acb1cd0`
- README screenshot source: `https://raw.githubusercontent.com/tomowang/hugo-theme-tailwind/d6841f6c9d53155a3245d6472555860f7acb1cd0/images/screenshot.png`
  → `upstream/upstream-readme-screenshot.png`, SHA-256 `2acb7c1ceb5e80c78c9dc05a013e1f50823b3912a8e82489c37738e2659a2711`
- Rendered from a clean detached checkout of that ref with `hugo v0.166.0+extended`,
  then local Chromium 152 at 1440×900: `upstream/upstream-rendered-home-list-1440x900.png`
  SHA-256 `718378ccadc81c7b5c782a822178a1adba8fbaad73768887c0ea5661a692c1a4`; and
  `upstream/upstream-rendered-single-post-1440x900.png` SHA-256
  `ed6a60983398eaae118aa3c043d7b94e8b47e9d0da789fcdf94459392ad0f0b3`.

PR #1 remains draft. Pass 3/re-review still owns release-asset installation and
final review/approval; no presentation source was changed in this pass.
