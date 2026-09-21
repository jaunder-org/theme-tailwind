import { readFileSync } from "node:fs";

const css = readFileSync("src/theme.css", "utf8");
const dark = css.match(
  /@media \(prefers-color-scheme: dark\) \{([\s\S]*)\n\}/,
)?.[1];
if (!dark) throw new Error("missing dark color-scheme contract");
if (!/--line:\s*#4b5563;/.test(dark)) {
  throw new Error(
    "dark contract must set --line to upstream gray-600 (#4b5563)",
  );
}

console.log("dark timeline divider contract: --line resolves to #4b5563");
