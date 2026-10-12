// Feature 86 geist-pixel-display: Geist Pixel Circle en h1 y h2 con la Fonts API de Astro
// (REQ-86-01..07, 16). Spec: specs/86_geist-pixel-display/. Build (REQ-86-08/09): geist-font-build.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (rel) => (existsSync(new URL(rel, root)) ? readFileSync(new URL(rel, root), 'utf8') : '');
const lines = (src) => src.trimEnd().split(/\r?\n/).length;
const PIXEL = './node_modules/geist/dist/fonts/geist-pixel/GeistPixel-Circle.woff2';
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const rules = (css) => [...stripComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, sel, body]) => ({ sel: sel.trim(), body }));

const pixelFamily = async () => {
  const { default: config } = await import(new URL('astro.config.mjs', root).href);
  const fam = (config.fonts ?? []).find((f) => f.name === 'Geist Pixel');
  assert.ok(fam, 'astro.config.mjs no registra la familia Geist Pixel');
  return fam;
};

test('REQ-86-01: Geist Pixel con fontProviders.local(), --font-geist-pixel y solo GeistPixel-Circle.woff2 400 normal', async () => {
  const fam = await pixelFamily();
  assert.equal(fam.provider?.name, 'local', 'Geist Pixel no usa fontProviders.local()');
  assert.equal(fam.cssVariable, '--font-geist-pixel');
  const variants = fam.options?.variants ?? [];
  assert.equal(variants.length, 1, `variantes: ${variants.length}`);
  const [v] = variants;
  assert.deepEqual(v.src.map((s) => (typeof s === 'string' ? s : String(s.url ?? s))), [PIXEL]);
  assert.deepEqual([String(v.weight), v.style], ['400', 'normal']);
  assert.doesNotMatch(read('astro.config.mjs'), /GeistPixel-(Square|Grid|Triangle|Line)/);
});

test('REQ-86-02: Geist Pixel con display swap y fallbacks terminados en monospace', async () => {
  const fam = await pixelFamily();
  assert.equal(fam.display, 'swap');
  assert.ok(Array.isArray(fam.fallbacks) && fam.fallbacks.length > 0, 'sin fallbacks');
  assert.equal(fam.fallbacks.at(-1), 'monospace');
});

test('REQ-86-03: Layout.astro renderiza <Font> de --font-geist-pixel con preload en el head', () => {
  const layout = read('src/layouts/Layout.astro');
  assert.match(layout, /import\s*\{\s*Font\s*\}\s*from\s*['"]astro:assets['"]/);
  const head = layout.slice(layout.indexOf('<head>'), layout.indexOf('</head>'));
  assert.match(head, /<Font\s+cssVariable="--font-geist-pixel"\s+preload\b[^>]*\/>/);
});

test('REQ-86-04: tokens.css define --font-display sobre --font-geist-pixel y mide <= 100 líneas', () => {
  const tokens = read('src/styles/tokens.css');
  assert.match(tokens, /--font-display:\s*var\(--font-geist-pixel,\s*ui-monospace,\s*monospace\);/);
  assert.ok(lines(tokens) <= 100, `tokens.css: ${lines(tokens)} líneas`);
});

test('REQ-86-05/06: typography.css pone h1 y h2 en --font-display con font-synthesis: none', () => {
  const rule = rules(read('src/styles/typography.css')).find((r) => r.sel.split(',').map((s) => s.trim()).sort().join() === 'h1,h2');
  assert.ok(rule, 'typography.css no tiene una regla h1, h2');
  assert.match(rule.body, /font-family:\s*var\(--font-display\)\s*;?/);
  assert.match(rule.body, /font-synthesis:\s*none\s*;?/);
  assert.doesNotMatch(read('src/styles/typography.css'), /#[0-9a-f]{3,8}\b|rgba?\(/i);
});

test('REQ-86-07: ninguna otra hoja declara font-family sobre h1, h2 o sus clases', () => {
  const astro = walk(fileURLToPath(new URL('src/', root))).filter((f) => f.endsWith('.astro'));
  const classes = new Set(astro.flatMap((f) => [...readFileSync(f, 'utf8').matchAll(/<h[12]\b[^>]*\bclass="([^"]+)"/g)].flatMap(([, c]) => c.split(/\s+/))));
  assert.ok(classes.has('post__title') && classes.has('latest-articles__heading'), [...classes].join());
  const styles = fileURLToPath(new URL('src/styles/', root));
  const offenders = [];
  for (const file of readdirSync(styles).filter((f) => f.endsWith('.css') && f !== 'typography.css')) {
    for (const { sel, body } of rules(readFileSync(join(styles, file), 'utf8'))) {
      if (!/font-family\s*:/.test(body)) continue;
      for (const s of sel.split(',').map((x) => x.trim())) {
        const last = s.split(/[\s>+~]+/).at(-1).replace(/:{1,2}[\w-]+(\([^)]*\))?$/g, '');
        const cls = [...last.matchAll(/\.([\w-]+)/g)].map(([, c]) => c);
        if (/^h[12]\b/.test(last) || cls.some((c) => classes.has(c))) offenders.push(`${file}: ${s}`);
      }
    }
  }
  assert.deepEqual(offenders, []);
});

test('REQ-86-16: archivos de la feature con 100 líneas o menos', () => {
  const files = ['astro.config.mjs', 'src/layouts/Layout.astro', 'src/styles/tokens.css', 'src/styles/typography.css',
    'src/styles/profile-card.css', 'tests/geist-pixel-display.test.mjs', 'tests/geist-font-build.test.mjs'];
  for (const rel of files) assert.ok(lines(read(rel)) <= 100, `${rel}: ${lines(read(rel))} líneas`);
});
