# Issue #1549 retained presentation and accessibility evidence

This directory retains reviewable evidence for the external Tailwind-authored
Jaunder Theme Package. The package under review pins Jaunder commit
`45703226a23b66c89683c3ddc88b1cb10a3584fb`.

## Pinned upstream references

The independent port used these views from upstream commit
[`d6841f6c9d53155a3245d6472555860f7acb1cd0`](https://github.com/tomowang/hugo-theme-tailwind/tree/d6841f6c9d53155a3245d6472555860f7acb1cd0):

- [`upstream/screenshot.png`](upstream/screenshot.png) — upstream rendered-site screenshot ([source](https://github.com/tomowang/hugo-theme-tailwind/blob/d6841f6c9d53155a3245d6472555860f7acb1cd0/images/screenshot.png));
- [`upstream/prototype.png`](upstream/prototype.png) — upstream prototype/reference composition ([source](https://github.com/tomowang/hugo-theme-tailwind/blob/d6841f6c9d53155a3245d6472555860f7acb1cd0/images/prototype.png)).

These are fidelity references, not compatibility fixtures. Jaunder's Style
Contract remains authoritative.

## Before/after evidence

[`final-pairs/`](final-pairs/) contains Studio-Before and Theme-After captures
for Local and permalink routes at 1440×900 and 390×844, each in light and dark
modes. [`final-routes/`](final-routes/) contains the final Local, author, tag,
and permalink routes at 390×844 in both modes.

Manual visual review approved the following named outcomes:

- **Card composition:** retained the reference's centered, bounded content cards,
  rounded surfaces, masthead, image band, and clear post hierarchy while mapping
  them only to Jaunder semantic parts.
- **Typography:** package-local TailwindInter is readable and consistently
  applied; headings, metadata, prose, quotations, lists, and code retain a clear
  hierarchy without external fonts.
- **Spacing:** desktop whitespace is deliberate; narrow cards, metadata, controls,
  and content remain separated without collisions or clipping.
- **Color:** light and dark palettes remain coherent across masthead, cards,
  links, tags, code, and image treatments; no custom presentation leaks into
  trusted application chrome.
- **Responsiveness:** the 390px evidence preserves card and shell hierarchy; the
  focused 320px proof has no document overflow and no painted text outside its
  semantic boundary, including the long-token fixture.
- **Light/dark treatment:** both modes preserve hierarchy and readable contrast;
  dark mode uses system preference rather than a JavaScript toggle.

## Accessibility evidence

The final installed-artifact proof exercises Local, author, tag, and permalink
routes with plain, structured, titled, untitled, summary, avatar, tag,
attribution, continuation, and long-content states.

- **Keyboard:** sequential Tab navigation reached Theme links and controls with no
  trap; the focused element had a visible 3px outline. Chromium, Firefox, and
  WebKit also opened the second owned Post's narrow native Actions menu,
  transferred focus into it, and retained viewport placement.
- **Automated accessibility:** each route passed Axe WCAG 2.2 A/AA scans in light
  and dark modes with zero violations.
- **Text contrast measurements:** representative normal-text combinations are
  `#475569`/white 7.58:1, `#334155`/white 10.35:1,
  `#cbd5e1`/`#374151` 6.94:1, and `#7dd3fc`/`#374151` 6.18:1,
  exceeding 4.5:1. Large headings also exceed their 3:1 threshold, including
  `#f1f5f9`/`#374151` at 9.41:1.
- **UI/focus contrast measurements:** light focus `#0284c7` is 4.10:1 on white
  and 3.91:1 on `#f8fafc`; dark focus `#7dd3fc` is 6.18:1 on
  `#374151`, 8.80:1 on `#1f2937`, 5.47:1 on `#164e63`, and
  10.71:1 on `#0f172a`. Tag text `#bae6fd` on `#164e63` is
  6.87:1. All exceed the 3:1 UI/focus threshold.
- **320px reflow:** document width and every painted post-body text range stayed
  within its viewport/semantic boundary; emergency heading wrapping is limited
  to widths through 24rem.
- **200% zoom:** Chromium's browser-engine page scale was set to exactly 2.0
  through the DevTools protocol; permalink content remained visible, readable,
  and operable at the resulting 720px visual viewport. The separate 320px
  reflow proof verifies horizontal containment.
- **Reduced motion:** with `prefers-reduced-motion: reduce`, Theme descendants
  reported no non-zero animation or transition durations.

The authoritative workflow run, package SHA-256, exact commands, and installed
lifecycle result are recorded in [`PROVING-GROUND.md`](../../PROVING-GROUND.md).
