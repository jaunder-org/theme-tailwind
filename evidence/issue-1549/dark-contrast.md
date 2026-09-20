# Dark contrast regression — issue #1549

## Root cause

This was a Theme defect, not a dark-media emulation or Style Contract matching
failure. The compiled dark rules match: the lifecycle probe records the rail as
`rgb(15, 23, 42)` and the Post as `rgb(30, 41, 59)` at 390×844 under dark and
reduced-motion emulation.

Jaunder's structural stylesheet retains color tokens on descendants outside
separate Style Contract hooks. In particular, `.j-nav-item.is-active` uses
`background: var(--surface-alt)` and `.j-root, .j-root *` / `.j-post-body` use
`color: var(--ink)`. The Theme changed semantic element colors and backgrounds,
but did not set those two contract variables in its dark `:root` rule. They
therefore resolved to Jaunder's light defaults (`#f5f5f3` and `#1a1a19`),
producing a light active navigation surface and nearly-black Post-body text.

The smallest compatible repair sets `--surface-alt: #1e293b` and
`--ink: #e2e8f0` in the existing dark `:root` rule. `:root` is explicitly mapped
to the Style Contract surface; no incidental class, wrapper, position, or
trusted-control selector was added.

## Test-first evidence

`harness/dark-contrast.spec.ts` is the durable minimal Chromium lifecycle
harness. It imports a ZIP into the Site catalog, previews, publishes, selects,
and visits signed-out Local at 390×844 with dark/reduced-motion emulation. It
records CSSOM rule origins/specificities for the rail, active navigation item,
Post, Post body, heading, and relevant surface variables before asserting their
computed values and a clean Axe scan. It makes no screenshots.

Red run against the original canonical ZIP (`433ee5e18846f43baf794dbab6d522a9483940ffd9a83cde8f03c0a60c45d5ce`) is retained as
[`logs/dark-contrast-lifecycle-red.json`](logs/dark-contrast-lifecycle-red.json):
Post body and heading computed as `rgb(26, 26, 25)` while their background was
`rgb(30, 41, 59)`. The corresponding parked command failed at the new expected
foreground assertion; its Axe failure was already independently recorded at
`/home/mdorman/src/jaunder/milestone-22-9/.xtask/run/1789920852133-4154961.out`.

Green local-package run is
[`logs/dark-contrast-lifecycle-green-local.json`](logs/dark-contrast-lifecycle-green-local.json):
`--ink` resolves from the scoped dark Theme rule to `#e2e8f0`,
`--surface-alt` to `#1e293b`, active navigation resolves to the latter, Post
body/heading compute to `rgb(226, 232, 240)`, and the harness's Axe scan passes.
Its package input was `/tmp/theme-tailwind-dark-contrast-local.zip`, SHA-256
`8e2e8024d480f5c6522ca770cf8984640eb13142f8286773b4068d4e41c6ffc3`.

Canonical workflow run
[`35523357120`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35523357120)
passed generation, validation, thumbnail generation, and packaging for commit
`10db9e754d28e4dcf504f67a8587571ff6a16881`. Its downloaded artifact at
`/tmp/theme-tailwind-dark-contrast-canonical/theme-package/theme-package.zip`
has the same SHA-256. The exact canonical ZIP then passed the same lifecycle
harness; its machine record is
[`logs/dark-contrast-lifecycle-green-canonical.json`](logs/dark-contrast-lifecycle-green-canonical.json).

The pre-change route screenshots in `final-pairs/` are **superseded** by this
presentation-byte change. They are retained only as historical evidence; this
change does not claim the full visual matrix is complete.
