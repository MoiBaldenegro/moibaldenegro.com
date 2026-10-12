// Feature 85 geist-font-base: salida de astro build con Geist y Geist Mono autoalojadas
// (REQ-85-16/17/18) y Geist Pixel Circle de la feature 86 (REQ-86-08/09; REQ-85-17 pasa a 2 preloads).
// Specs: specs/85_geist-font-base/ y specs/86_geist-pixel-display/. Estáticas: geist-font-base / geist-pixel-display.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const PAGES = { '/': 'index.html', '/about': 'about/index.html', artículo: 'posts/00-agilismo/index.html' };
let out;
const page = (rel) => readFileSync(join(out, 'client', rel), 'utf8');
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w-]+)(?:="([^"]*)")?/g)].slice(1).map(([, k, v]) => [k, v ?? '']));
const fontPreloads = (html) => (html.match(/<link\b[^>]*>/g) ?? []).map(attrs).filter((a) => a.rel === 'preload' && a.as === 'font');
const fontFaces = (html) => html.match(/@font-face\s*\{[^}]*\}/g) ?? [];
const PIXEL_DIR = new URL('../node_modules/geist/dist/fonts/geist-pixel/', import.meta.url);
const pixel = (variant) => readFileSync(new URL(`GeistPixel-${variant}.woff2`, PIXEL_DIR));
const fontsDir = () => join(out, 'client', '_astro', 'fonts');
const pixelHrefs = (html) => fontFaces(html).filter((f) => /font-family:"Geist Pixel-[0-9a-f]+"/.test(f))
  .flatMap((f) => f.match(/\/_astro\/fonts\/[^)"']+\.woff2/g) ?? []);

before(() => {
  out = mkdtempSync(join(tmpdir(), 'geist85-build-'));
  const build = astroBuild(['--outDir', out]);
  assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
});
after(() => rmSync(out, { recursive: true, force: true }));

test('REQ-85-16: dist/client/_astro/fonts contiene los woff2 de Geist y Geist Mono', () => {
  const dir = join(out, 'client', '_astro', 'fonts');
  assert.ok(existsSync(dir), 'no existe _astro/fonts');
  const woff2 = readdirSync(dir).filter((f) => f.endsWith('.woff2'));
  assert.ok(woff2.length >= 2, `solo ${woff2.length} woff2 en _astro/fonts`);
  const faces = fontFaces(page('index.html')).join('\n');
  // Astro nombra cada familia con hash (font-family:Geist-<hash>) y la expone en :root con su variable.
  for (const name of ['Geist', 'Geist Mono']) assert.match(faces, new RegExp(`font-family:"?${name}-[0-9a-f]+[";]`), `sin @font-face de ${name}`);
  for (const v of ['--font-geist-sans', '--font-geist-mono']) assert.match(page('index.html'), new RegExp(`:root\\{${v}:`), v);
  for (const href of faces.match(/\/_astro\/fonts\/[^)"']+\.woff2/g) ?? []) {
    assert.ok(woff2.includes(href.split('/').pop()), `${href} no está en _astro/fonts`);
  }
});

test('REQ-85-17/REQ-86-08: / tiene 2 preloads woff2 crossorigin en /_astro/fonts/ (Geist y Geist Pixel)', () => {
  const html = page('index.html');
  const preloads = fontPreloads(html);
  assert.equal(preloads.length, 2, `preloads de fuente: ${JSON.stringify(preloads)}`);
  for (const p of preloads) {
    assert.equal(p.type, 'font/woff2');
    assert.ok('crossorigin' in p, 'preload sin crossorigin');
    assert.ok(p.href.startsWith('/_astro/fonts/'), p.href);
  }
  const hrefs = pixelHrefs(html);
  assert.ok(hrefs.length > 0, 'sin @font-face de Geist Pixel');
  assert.ok(preloads.some((p) => hrefs.includes(p.href)), `ningún preload es de Geist Pixel: ${hrefs}`);
  assert.match(html, /:root\{--font-geist-pixel:/);
});

test('REQ-86-09: _astro/fonts contiene el woff2 de Pixel Circle y ninguna otra variante Pixel', () => {
  const files = readdirSync(fontsDir()).map((f) => readFileSync(join(fontsDir(), f)));
  assert.ok(files.some((b) => b.equals(pixel('Circle'))), 'GeistPixel-Circle.woff2 no se emite');
  for (const v of ['Square', 'Grid', 'Triangle', 'Line']) assert.ok(!files.some((b) => b.equals(pixel(v))), `se emite ${v}`);
});

test('REQ-85-18: /, /about y un artículo sin URLs absolutas en @font-face ni en preloads de fuente', () => {
  for (const [name, rel] of Object.entries(PAGES)) {
    const html = page(rel);
    const faces = fontFaces(html);
    assert.ok(faces.length >= 3, `${name}: solo ${faces.length} @font-face`);
    for (const face of faces) assert.doesNotMatch(face, /https?:\/\//, `${name}: ${face}`);
    for (const p of fontPreloads(html)) assert.doesNotMatch(p.href, /^https?:\/\//, `${name}: ${p.href}`);
  }
});
