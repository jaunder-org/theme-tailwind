# Issue #1549 evidence status

This directory is reserved for evidence from the current semantic-hook redesign
candidate. The prior images were deliberately removed because they prove an
older presentation and artifact; they are not evidence for the current
candidate.

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

No final lifecycle verdict, route matrix, accessibility verdict, browser matrix,
or visual approval is claimed. The PR remains draft; no tag, release, merge, or
issue closure occurred.
