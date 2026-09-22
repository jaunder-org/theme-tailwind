import { readFileSync } from "node:fs";

const css = readFileSync("src/theme.css", "utf8");
const dark = css.match(
  /@media \(prefers-color-scheme: dark\) \{([\s\S]*)\n\}/,
)?.[1];
if (!dark) throw new Error("missing dark color-scheme contract");

const requireDeclaration = (source, selector, property, value, context) => {
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const rule = source.match(new RegExp(`${escapedSelector}\\s*\\{([^}]*)\\}`));
  if (!rule) throw new Error(`missing ${context} rule`);
  const escapedValue = value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  if (!new RegExp(`${property}\\s*:\\s*${escapedValue};`).test(rule[1])) {
    throw new Error(`${context} must set ${property}: ${value}`);
  }
};

// Pinned upstream uses bg-slate-50 for the light page, dark:bg-gray-800
// for its shell, and dark:bg-gray-700 for cards. Its list titles are
// slate-800/slate-200 rather than accent-blue links.
requireDeclaration(css, ":root", "background", "#f8fafc", "light page");
requireDeclaration(
  css,
  '[data-jaunder-part="post"]',
  "background",
  "#fff",
  "light post",
);
requireDeclaration(
  css,
  '[data-jaunder-part="post"] a',
  "color",
  "#1e293b",
  "light post link",
);
requireDeclaration(dark, ":root", "background", "#1f2937", "dark page");
requireDeclaration(
  dark,
  '[data-jaunder-part="navigation-rail"]',
  "background",
  "#1f2937",
  "dark navigation",
);
requireDeclaration(
  dark,
  '[data-jaunder-part="post"]',
  "background",
  "#374151",
  "dark post",
);
requireDeclaration(
  dark,
  '[data-jaunder-part="post"] a',
  "color",
  "#e2e8f0",
  "dark post link",
);

console.log(
  "upstream palette contract: slate-50, gray-800/700, and slate post links",
);
