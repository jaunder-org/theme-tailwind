# Versioning

Tailwind Theme releases use stable [Semantic Versioning](https://semver.org/) tags
of the form `vMAJOR.MINOR.PATCH`. The GitHub release at that tag is the authority
for the release version, and its attached `theme-package.zip` is the installable
artifact. Tags and published release assets are immutable: fixes ship under a
new version rather than by moving a tag or replacing an existing release.

- **Patch** increments fix presentation, accessibility, documentation, or
  packaging defects without intentionally changing the theme's design language.
- **Minor** increments add compatible styling coverage, assets, or presentation
  capabilities while retaining the established design language.
- **Major** increments intentionally redesign the theme or drop compatibility
  with a previously supported Jaunder Style Contract.

The `schema` and `style_contract` numbers in `theme.json` are Jaunder
compatibility versions, not this theme's release version. Theme Package schema 1
is closed and has no release-version field, so this repository does not smuggle
one into the manifest. The deterministic ZIP bytes identify the exact artifact;
the versioned release URL and its tag identify the distribution release.

If Jaunder later needs an installed Theme to expose its release version or to
participate in update discovery, that requires a separately designed Theme
Package schema revision. It is not implied by this repository's release tags and
must not weaken schema-1 validation.
