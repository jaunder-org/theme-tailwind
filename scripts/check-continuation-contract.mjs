import { readFileSync } from 'node:fs';

const css = readFileSync('src/theme.css', 'utf8');
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

const dark = css.match(/@media \(prefers-color-scheme: dark\) \{([\s\S]*)\n\}/)?.[1];
if (!dark) throw new Error('missing dark color-scheme contract');
requireRule(css, hook, ['color', 'background', 'border-color'], 'light');
requireRule(css, `${hook}:hover`, ['background', 'border-color'], 'light hover');
requireRule(css, `${hook}:focus-visible`, ['outline', 'outline-offset'], 'light focus-visible');
requireRule(dark, hook, ['color', 'background', 'border-color'], 'dark');
requireRule(dark, `${hook}:hover`, ['background', 'border-color'], 'dark hover');
requireRule(dark, `${hook}:focus-visible`, ['outline-color'], 'dark focus-visible');

console.log('continuation contract: explicit light/dark colors, hover, and focus-visible treatment');
