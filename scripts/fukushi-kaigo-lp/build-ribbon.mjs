import { build } from 'esbuild';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Bundles the hero ribbon scene (tree-shaken three.js) into the LP's public assets
// and stamps a content hash into the page's script tag.
const assets = new URL('../../public/fukushi-kaigo-lp/assets/', import.meta.url);
await build({
  absWorkingDir: fileURLToPath(new URL('.', import.meta.url)),
  entryPoints: ['ribbon/src/ribbon-hero.js'],
  outfile: fileURLToPath(new URL('ribbon-hero.js', assets)),
  bundle: true,
  minify: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  legalComments: 'eof',
  logLevel: 'info',
});
await copyFile(new URL('node_modules/three/LICENSE', import.meta.url), new URL('THREE-LICENSE.txt', assets));
const revision = createHash('sha256')
  .update(await readFile(new URL('ribbon-hero.js', assets)))
  .digest('hex')
  .slice(0, 12);
const page = new URL('../../src/app/fukushi-kaigo-lp/index.html', import.meta.url);
const html = await readFile(page, 'utf8');
await writeFile(page, html.replace(/ribbon-hero\.js\?rev=[^"\s]+/, `ribbon-hero.js?rev=${revision}`));
