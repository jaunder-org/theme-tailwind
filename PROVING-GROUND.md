# Proving ground — jaunder-org/jaunder#1549

This log records only evidence for the current redesigned presentation candidate.
The historical proof and captures at commit `295c9a8d2d90318f52f94e1427fc86a9dfb0be1c`
were intentionally removed: they describe an earlier presentation and artifact,
and are not final proof for this candidate.

## 2026-09-19: semantic-hook redesign checkpoint

**Candidate Jaunder pin:**
`bfb02febb81212258aff1c10bbdf5248fa864cc5`. This immutable `main` commit
contains the required public `hero`, `navigation-rail`, `site-brand`, and
`navigation-search` Style Contract hooks (PR #1573), and Theme Studio's
owned-Media presentation controls (PR #1580). Both `jaunder-revision` and the
reusable workflow revision in `.github/workflows/theme.yml` pin this exact
commit.

**Selector boundary:** `src/theme.css` no longer imports Tailwind preflight.
Tailwind's complete import emitted generic reset selectors, which are not Theme
Package semantic-hook selectors. The locked Tailwind CLI remains the
ADR-0197 authoring pipeline, but now minifies only `:root` and selectors rooted
at `data-jaunder-part` hooks. In particular, all authored focus rules are
scoped beneath `masthead`, `post`, `primary-navigation`, or `tag-list`; no
unscoped `a:focus-visible` or `button:focus-visible` remains.

**Commands run from this checkout:**

```sh
./node_modules/.bin/tailwindcss --input src/theme.css --output style.css --minify
node scripts/check-drift.mjs
/nix/store/2r386dinsp2xndsfg1x8vx49vhfdmg8n-jaunder-0.1.0/bin/jaunder theme check .
nix develop /home/mdorman/src/jaunder/milestone-22-9#theme-thumbnail --accept-flake-config -c bash -euo pipefail -c '/nix/store/2r386dinsp2xndsfg1x8vx49vhfdmg8n-jaunder-0.1.0/bin/jaunder theme thumbnail "$1" --browser "$JAUNDER_THEME_THUMBNAIL_BROWSER" --output "$1/preview.png"' bash "$PWD"
/nix/store/2r386dinsp2xndsfg1x8vx49vhfdmg8n-jaunder-0.1.0/bin/jaunder theme package . --output /tmp/theme-tailwind-current.zip
sha256sum /tmp/theme-tailwind-current.zip
```

Generation, drift checking, local package validation, and thumbnail generation
passed. The local package SHA-256 was
`433ee5e18846f43baf794dbab6d522a9483940ffd9a83cde8f03c0a60c45d5ce`.

Canonical workflow run
[`35480319754`](https://github.com/jaunder-org/theme-tailwind/actions/runs/35480319754)
for checkpoint `e14833d20b2c51c6b00667801a967eeb134c68de` passed generation,
canonical validation, thumbnail comparison, and package creation. Downloading
its `theme-package.zip` and running `sha256sum` produced the same SHA-256:
`433ee5e18846f43baf794dbab6d522a9483940ffd9a83cde8f03c0a60c45d5ce`.
This is a workflow-built candidate artifact, not a release artifact and not
final presentation proof.

## Final-evidence blocker — 2026-09-20

**Canonical final-head run:**
[35480413189](https://github.com/jaunder-org/theme-tailwind/actions/runs/35480413189)
for `50dec18f537d27898eed0810c18c474fc87aa99f` completed successfully. Its
sole downloaded import input is
`/tmp/theme-tailwind-pr1-final-artifact/theme-package.zip`, SHA-256
`433ee5e18846f43baf794dbab6d522a9483940ffd9a83cde8f03c0a60c45d5ce`.

The durable source is
[`evidence/issue-1549/harness/final-evidence.spec.ts`](evidence/issue-1549/harness/final-evidence.spec.ts).
It was copied temporarily into Jaunder `end2end/tests/` and invoked exactly as:

```sh
THEME_TAILWIND_ZIP=/tmp/theme-tailwind-pr1-final-artifact/theme-package.zip \
THEME_TAILWIND_EVIDENCE_DIR="$PWD/evidence/issue-1549" \
devtool run -- cargo xtask e2e-local theme-tailwind-final-evidence.spec.ts
```

The first two harness attempts corrected harness-only errors (author catalog
rather than Site catalog, then Local's intentional 50-Post first page) and are
recorded in `evidence/issue-1549/logs/chromium-attempt-{1,2}-failure.json`.

The third attempt is a **Jaunder blocker**, not a Theme CSS defect. With the
canonical ZIP imported into the Site catalog, previewed, published, and
explicitly selected, signed-out Local loads `data-theme="custom"` and an
immutable stylesheet but contains no
`[data-jaunder-part="header-image"]`. The package declares two `defaults.header`
assets. This prevents proof of the required packaged-header default/pool matrix.
The exact minimal reproduction, parked OTEL capture identity, and devtool
stdout/stderr identities are retained in
[`evidence/issue-1549/logs/chromium-attempt-3-jaunder-blocker.json`](evidence/issue-1549/logs/chromium-attempt-3-jaunder-blocker.json).

Per the approved outline, final proof stops here. No final visual approval,
accessibility verdict, Firefox/WebKit matrix, PR-ready transition, tag, release,
or issue closure is claimed. The PR remains draft. The one retained image,
`final-pairs/local-studio-before-light-1440x900.png`, is only the fresh Studio
baseline captured before the blocker and is not a completed visual pair.
