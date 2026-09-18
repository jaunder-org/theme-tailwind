import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const directory = mkdtempSync(join(tmpdir(), 'theme-tailwind-'));
const output = join(directory, 'style.css');
const result = spawnSync('./node_modules/.bin/tailwindcss', [
  '--input', 'src/theme.css', '--output', output, '--minify',
], { stdio: 'inherit' });
if (result.status !== 0) process.exit(result.status ?? 1);
const current = readFileSync('style.css');
const generated = readFileSync(output);
rmSync(directory, { recursive: true, force: true });
if (!current.equals(generated)) {
  console.error('style.css is stale; run npm run generate and commit the result.');
  process.exit(1);
}
