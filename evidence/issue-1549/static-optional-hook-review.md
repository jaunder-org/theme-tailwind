# Optional-hook static CSS and layout review — corrected pass 2

Reviewed `src/theme.css` and generated `style.css` against the pinned Jaunder
renderer at `bfb02febb81212258aff1c10bbdf5248fa864cc5`.

| Hook                 | Selector and treatment                                                                  | Layout dependency verdict                                                                                                                                                                                     |
| -------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `avatar`             | `[data-jaunder-part="avatar"]` applies only `border-radius: 9999px`.                    | Optional: it establishes no sizing, display, grid/flex participation, margin, or positional relationship. Its absence cannot collapse or reflow Theme layout.                                                 |
| `author-handle`      | `[data-jaunder-part="author-handle"]` applies only color.                               | Optional: it establishes no sizing, display, grid/flex participation, margin, or positional relationship. Its absence cannot collapse or reflow Theme layout.                                                 |
| `source-attribution` | `[data-jaunder-part="source-attribution"]` applies muted semantic text color `#475569`. | Optional and defensively styled: it establishes no sizing, display, grid/flex participation, margin, or positional relationship. The pinned renderer does not emit it, so no synthetic DOM state was created. |

All three selectors are exact semantic Style Contract hooks. No selector relies on
wrapper depth, incidental class names, sibling order, `:has`, DOM mutation, or
storage. Structural layout is rooted in `main`, `post`, `post-list`, `tag-list`,
`hero`, and other documented semantic hooks, not any optional hook above.

**Verdict: pass.** Source attribution has defensible semantic styling; no product
defect or presentation-source change is required.
