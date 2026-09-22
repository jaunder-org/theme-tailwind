import { readFileSync } from "node:fs";

const css = readFileSync("src/theme.css", "utf8");
const dark = css.match(
  /@media \(prefers-color-scheme: dark\) \{([\s\S]*)\n\}/,
)?.[1];
if (!dark) throw new Error("missing dark color-scheme contract");
if (!/--line:\s*#6b7280;/.test(dark)) {
  throw new Error(
    "dark contract must set --line to upstream gray-500 (#6b7280) for 3:1 contrast",
  );
}
if (
  !/\[data-jaunder-part="post"\]\s*\{[^}]*border-color:\s*#6b7280;/s.test(dark)
) {
  throw new Error(
    "dark Post border must use upstream gray-500 (#6b7280) rather than override --line with lower contrast",
  );
}

console.log(
  "dark timeline divider contract: --line and Post border resolve to #6b7280",
);
