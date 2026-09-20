# Tailwind

An independent MIT Jaunder Theme Package inspired by the visual language of
[`tomowang/hugo-theme-tailwind`](https://github.com/tomowang/hugo-theme-tailwind)
at `d6841f6c9d53155a3245d6472555860f7acb1cd0`. It is not a Hugo theme, fork, or
sync-compatible derivative. See [NOTICE](NOTICE) for the preserved upstream MIT
notice and [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md) for package asset licenses.

The theme uses only Jaunder Style Contract 1 semantic hooks. Its responsive
centered shell, slate/gray system-dark palette, cards, prose/code treatment,
navigation, and visible focus styling are generated from pinned Tailwind source.
It contains no templates, JavaScript, SVG, external runtime resource, wrapper
selector, or `anchor-name` declaration.

## Compatibility

Tailwind Theme v1 requires Jaunder 1.0.0 or later. Theme Package schema 1 and
Style Contract 1 were introduced in Jaunder 1.0.0; those manifest values are the
machine-readable compatibility markers. The Theme's SemVer tag identifies its
distribution release rather than a separate Jaunder compatibility axis.

## Repository layout

`theme.json`, generated root `style.css`, and declared `assets/` are the only
package inputs. `src/`, docs, and workflow files are maintenance support files.
`style.css` is committed portable source-of-truth output.

The editable `src/theme.css` is deliberately formatted rather than minified.
Its semantic-hook sections are ordered by `data-jaunder-part` name so authors
can find one contract concept without tracing generated CSS. Generation alone
minifies the committed `style.css` artifact.

The pinned Tailwind authoring dependency and `package-lock.json` are retained
intentionally as ADR-0197's preprocessor proving ground, even though this
package does not need Tailwind utilities today. The CLI is the reproducible,
locked authoring pipeline that turns the readable source into the portable CSS
artifact; it must not inject a generic reset or selectors outside the Theme
Package selector boundary.

## Versioning

Stable releases use immutable `vMAJOR.MINOR.PATCH` tags. The tag and GitHub
release identify the Theme release; `theme.json`'s `schema` and
`style_contract` identify Jaunder compatibility contracts instead. See
[VERSIONING.md](VERSIONING.md) for the SemVer policy and why schema 1 does not
carry a release-version field.

## Maintain

Use the locked dependency graph and repository-local binary; do not use `npx`:

```sh
npm ci --ignore-scripts
npm run generate
npm run check:drift
jaunder theme check .
```

`check:drift` regenerates to a temporary file and byte-compares it with the
committed `style.css`, failing without mutating the working tree when they differ.
The local check is Jaunder's canonical validator, not a copied validator.

Before releasing, import the generated ZIP through Theme Studio and check Local,
author, tag, and permalink routes in light and dark modes. Include wide, 390px,
and 320px layouts; keyboard focus; 200% zoom; reduced motion; long content; and
an authenticated Post Actions menu. This is presentation review, not another
package format or repository-specific test harness.

## Replace the packaged images

The package defaults use `assets/tailwind-logo.png`, `assets/header-slate.png`,
and `assets/header-dawn.png`. To publish different portable defaults, replace
those files at the same paths, update [ASSET-PROVENANCE.md](ASSET-PROVENANCE.md)
and any required notices, then regenerate the preview and validate the package.
Keeping the paths stable avoids an unnecessary manifest edit.

Per-site Media bindings are intentionally not package inputs: they belong to one
Jaunder installation and are excluded from exported ZIPs. Theme Studio can bind
an owned-Media logo and owned-Media entries in a header pool alongside package
assets. Use those presentation controls to personalize one installation; use
replaced package assets when the portable package defaults themselves must
change. Neither option changes Theme Package schema 1.

## Install a release

Download `theme-package.zip` from the desired versioned GitHub release, then in
Jaunder open **Themes**:
import ZIP → preview the private draft → publish → explicitly select the
published Theme. Importing does not alter public pages; only explicit selection
does. Do not use repository support files as import input.

## Automation

The caller workflow runs clean install, generation, and drift checking before it
calls Jaunder's pinned canonical reusable workflow. That workflow validates,
creates the canonical `preview.png`, and packages the deterministic ZIP; the ZIP
is generated/uploaded and is never committed.
