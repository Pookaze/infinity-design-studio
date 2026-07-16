import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { build } from 'esbuild';
import vm from 'node:vm';

const root = process.cwd();
const out = join(root, 'dist');
const excluded = new Set(['.git', '.github', '.agents', '.codex', '.vercel', 'dist', 'node_modules', 'scripts', 'supabase']);
const rootFiles = new Set(['index.html', 'style.css', 'script.js', 'translations.js', 'translations-final.js', 'work-data.js', 'case-study-data.js', 'work-page.js', 'work.css', 'project.css', 'project.js', 'cms-site.js', 'cms-visual-schema.js', 'CMS-README.md', 'robots.txt', 'sitemap.xml']);
const rootDirs = new Set(['assets', 'services', 'work', 'projects', 'project', 'privacy-policy', 'terms-of-service', 'admin']);

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const entry of await readdir(root, { withFileTypes: true })) {
  if (excluded.has(entry.name)) continue;
  if (entry.isFile() && rootFiles.has(entry.name)) await cp(join(root, entry.name), join(out, entry.name));
  if (entry.isDirectory() && rootDirs.has(entry.name)) await cp(join(root, entry.name), join(out, entry.name), { recursive: true });
}

await build({
  absWorkingDir: root,
  entryPoints: [join(root, 'admin', 'admin.js')],
  outfile: join(out, 'admin', 'admin.js'),
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  format: 'esm'
});

await build({
  absWorkingDir: root,
  entryPoints: [join(root, 'admin', 'setup', 'setup.js')],
  outfile: join(out, 'admin', 'setup', 'setup.js'),
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  format: 'esm'
});

await build({
  absWorkingDir: root,
  entryPoints: [join(root, 'admin', 'reset-owner', 'reset.js')],
  outfile: join(out, 'admin', 'reset-owner', 'reset.js'),
  bundle: true,
  minify: true,
  sourcemap: false,
  target: ['es2020'],
  format: 'esm'
});

const manifestContext = { window:{} };
vm.createContext(manifestContext);
vm.runInContext(await readFile(join(root, 'work-data.js'), 'utf8'), manifestContext);
vm.runInContext(await readFile(join(root, 'case-study-data.js'), 'utf8'), manifestContext);
await writeFile(join(out, 'cms-import-manifest.json'), JSON.stringify({
  version:1,
  studies:manifestContext.window.infinityCaseStudies || {}
}));

const config = {
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  publicSiteUrl: process.env.PUBLIC_SITE_URL || ''
};
await writeFile(join(out, 'cms-config.js'), `window.INFINITY_CMS_CONFIG = Object.freeze(${JSON.stringify(config)});\n`);

let htmlCount = 0;
async function countHtml(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) await countHtml(full);
    else if (extname(entry.name) === '.html') htmlCount += 1;
  }
}
await countHtml(out);
console.log(`Production build complete: ${htmlCount} HTML routes copied to dist/.`);
