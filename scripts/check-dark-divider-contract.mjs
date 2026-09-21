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

console.log("dark timeline divider contract: --line resolves to #6b7280");
