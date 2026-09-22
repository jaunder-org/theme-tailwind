import { readFileSync } from "node:fs";

const css = readFileSync("src/theme.css", "utf8");
const hook = '\\[data-jaunder-part="continuation"\\]';
const requireRule = (source, selector, properties, context) => {
  const rule = source.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`));
  if (!rule) throw new Error(`missing ${context} continuation rule`);
  for (const property of properties) {
    if (!new RegExp(`${property}\\s*:`).test(rule[1])) {
      throw new Error(`${context} continuation rule must set ${property}`);
    }
  }
};

const dark = css.match(
  /@media \(prefers-color-scheme: dark\) \{([\s\S]*)\n\}/,
)?.[1];
if (!dark) throw new Error("missing dark color-scheme contract");
requireRule(css, hook, ["color", "background", "border-color"], "light");
if (
  !new RegExp(
    `${hook}\\s*\\{[^}]*color\\s*:\\s*#334155;[^}]*background\\s*:\\s*#e2e8f0;[^}]*border-color\\s*:\\s*#cbd5e1;`,
    "s",
  ).test(css)
) {
  throw new Error(
    "light continuation must match upstream slate pagination colors",
  );
}
requireRule(
  css,
  `${hook}:hover`,
  ["background", "border-color"],
  "light hover",
);
requireRule(
  css,
  `${hook}:focus-visible`,
  ["outline", "outline-offset"],
  "light focus-visible",
);
requireRule(dark, hook, ["color", "background", "border-color"], "dark");
if (
  !new RegExp(
    `${hook}\\s*\\{[^}]*color\\s*:\\s*#cbd5e1;[^}]*background\\s*:\\s*#374151;[^}]*border-color\\s*:\\s*#4b5563;`,
    "s",
  ).test(dark)
) {
  throw new Error(
    "dark continuation must match upstream slate-on-gray pagination colors",
  );
}
requireRule(
  dark,
  `${hook}:hover`,
  ["background", "border-color"],
  "dark hover",
);
requireRule(
  dark,
  `${hook}:focus-visible`,
  ["outline-color"],
  "dark focus-visible",
);

console.log(
  "continuation contract: explicit light/dark colors, hover, and focus-visible treatment",
);
