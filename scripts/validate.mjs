import { readdir, readFile, stat } from 'node:fs/promises';
import { dirname, extname, join, resolve } from 'node:path';

const root = process.cwd();
const targetRoot = resolve(root, process.argv[2] || '.');
const ignored = new Set(['.git', 'node_modules', 'dist']);
const htmlFiles = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes:true })) {
    if (ignored.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) await walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}
await walk(targetRoot);
const missing = [];
for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  for (const match of html.matchAll(/(?:src|href)=["']([^"'#?]+)["']/g)) {
    const value = match[1];
    if (/^(?:https?:|mailto:|tel:|data:)/.test(value)) continue;
    const target = value.startsWith('/') ? resolve(targetRoot,value.slice(1)) : resolve(dirname(file), value);
    try { await stat(target); } catch (_) { missing.push(`${file}: ${value}`); }
  }
}
if (missing.length) {
  console.error(`Broken local references (${missing.length}):\n${missing.join('\n')}`);
  process.exitCode = 1;
} else console.log(`Validated ${htmlFiles.length} HTML files: no broken local asset references.`);
