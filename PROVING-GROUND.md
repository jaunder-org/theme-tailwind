# Proving ground — jaunder-org/jaunder#1549

This log records only evidence for the current redesigned presentation candidate.
The historical proof and captures at commit `295c9a8d2d90318f52f94e1427fc86a9dfb0be1c`
were intentionally removed: they describe an earlier presentation and artifact,
and are not final proof for this candidate.

## 2026-09-19: semantic-hook redesign checkpoint

**Candidate Jaunder pin:**
`529fbefadee44e0edc1ed999b289586094a740e0`. This immutable `main` commit
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
This is a local checkpoint value, not a canonical workflow artifact and not a
release candidate hash.

## Final-evidence status

The complete final Studio/browser matrix is **pending**. No canonical workflow
run, canonical artifact SHA-256, Studio lifecycle result, route capture,
accessibility result, or manual approval is claimed for this redesigned
candidate.

A fresh dedicated evidence run must first push this checkpoint, download the
canonical workflow `theme-package.zip`, and use that exact ZIP as the only
import input. It must recreate a durable or source-recorded harness covering:

- Studio import, private preview, publish, explicit public selection, and Studio
  recovery, including package and owned-Media logo/header-pool bindings;
- Local, author, tag, and permalink routes; titled/untitled and
  summary-present/absent Posts; avatar, tags, attribution, continuation,
  pagination, structured Markdown, and a long unbroken token;
- package font, package logo, default header, and every explicit package and
  owned-Media header-pool entry;
- light/dark at 1440×900, 390×844, and true 320 CSS px; exact 200% browser
  page scale; reduced motion; keyboard focus and measured contrast; Axe WCAG
  2.2 A/AA scans; and retained screenshots/logs;
- Chromium, Firefox, and WebKit two-owned-Post trusted Actions isolation,
  scrolling, narrow placement, menu opening/use, and proof that no compiled
  Theme selector styles trusted controls.

Only after that run may `evidence/issue-1549/` contain final captures and this
log name a canonical run or artifact hash.
