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

## Repository layout

`theme.json`, generated root `style.css`, and declared `assets/` are the only
package inputs. `src/`, docs, and workflow files are maintenance support files.
`style.css` is committed portable source-of-truth output.

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
The local check is Jaunder's canonical validator, not a copied validator. See
[PROVING-GROUND.md](PROVING-GROUND.md) for observed validation evidence.

## Install a release

Download the release's `theme-package.zip`, then in Jaunder open **Themes**:
import ZIP → preview the private draft → publish → explicitly select the
published Theme. Importing does not alter public pages; only explicit selection
does. Do not use repository support files as import input.

## Automation

The caller workflow runs clean install, generation, and drift checking before it
calls Jaunder's pinned canonical reusable workflow. That workflow validates,
creates the canonical `preview.png`, and packages the deterministic ZIP; the ZIP
is generated/uploaded and is never committed.
