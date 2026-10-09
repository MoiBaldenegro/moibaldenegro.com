// Test de recursos rotos (feature 33 broken-resources-fix, REQ-33-01..07):
// el Layout no enlaza archivos inexistentes ni duplica favicons/manifest, y
// cada portada img de los posts existe en public/assets/content/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const LAYOUT = 'src/layouts/Layout.astro';
const POSTS = 'src/content/posts/';
const imgOf = (md) => md.match(/^img:\s*(.+?)\s*$/m)?.[1];

function postFiles(dir = POSTS) {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? postFiles(`${dir}${entry.name}/`) : entry.name.endsWith('.md') ? [`${dir}${entry.name}`] : []);
}

test('REQ-33-01: Layout.astro no referencia /favicon.svg', () => {
  assert.doesNotMatch(read(LAYOUT), /favicon\.svg/);
});

test('REQ-33-02: cada favicon y el manifest se declaran una sola vez', () => {
  const links = [...read(LAYOUT).matchAll(/<link[^>]*rel="(?:icon|shortcut icon|apple-touch-icon|manifest)"[^>]*>/g)];
  const hrefs = links.map((m) => m[0].match(/href="([^"]+)"/)?.[1]);
  assert.ok(hrefs.length > 0, 'no hay links de favicon/manifest');
  assert.deepEqual(hrefs, [...new Set(hrefs)], `hrefs duplicados: ${hrefs.join(', ')}`);
});

test('REQ-33-03: cada ruta local de href/src del Layout existe en public/', () => {
  const paths = [...read(LAYOUT).matchAll(/(?:href|src)="(\/[^"/][^"]*\.[a-z0-9]+)"/gi)].map((m) => m[1]);
  assert.ok(paths.length > 0, 'no se encontraron rutas locales a archivos');
  for (const path of paths) assert.ok(existsSync(new URL(`public${path}`, root)), `falta public${path}`);
});

test('REQ-33-04: el post de SOLID usa arch00.webp, que existe', () => {
  const img = imgOf(read(`${POSTS}architecture/03-principios_solid.md`));
  assert.equal(img, 'arch00.webp');
  assert.ok(existsSync(new URL(`public/assets/content/${img}`, root)));
});

test('REQ-33-05: el img de cada post existe en public/assets/content/', () => {
  const files = postFiles();
  assert.ok(files.length > 0, 'no se encontraron posts');
  for (const file of files) {
    const img = imgOf(read(file));
    assert.ok(img, `${file} no declara img`);
    assert.ok(existsSync(new URL(`public/assets/content/${img}`, root)), `${file}: falta ${img}`);
  }
});

test('REQ-33-07: Layout.astro no supera 100 líneas', () => {
  assert.ok(read(LAYOUT).split('\n').length <= 100);
});
