// Feature 85 geist-font-base: Geist Sans y Geist Mono autoalojadas con la Fonts API de Astro
// (REQ-85-07..15, 19, 20, 22). Spec: specs/85_geist-font-base/. Build: geist-font-build.test.mjs; dependencia: geist-font-dependency.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const read = (rel) => (existsSync(new URL(rel, root)) ? readFileSync(new URL(rel, root), 'utf8') : '');
const lines = (src) => src.trimEnd().split(/\r?\n/).length;
const SANS = './node_modules/geist/dist/fonts/geist-sans/';
const MONO = './node_modules/geist/dist/fonts/geist-mono/';
const family = async (name) => {
  const { default: config } = await import(new URL('astro.config.mjs', root).href);
  const fam = (config.fonts ?? []).find((f) => f.name === name);
  assert.ok(fam, `astro.config.mjs no registra la familia ${name}`);
  assert.equal(fam.provider?.name, 'local', `${name} no usa fontProviders.local()`);
  return fam;
};
const srcOf = (v) => v.src.map((s) => (typeof s === 'string' ? s : String(s.url ?? s)));

test('REQ-85-07/08: familia Geist (normal + cursiva, 100 900) con --font-geist-sans', async () => {
  assert.match(read('astro.config.mjs'), /fontProviders\.local\(\)/);
  const fam = await family('Geist');
  assert.equal(fam.cssVariable, '--font-geist-sans');
  const [normal, italic] = fam.options.variants;
  assert.deepEqual(srcOf(normal), [`${SANS}Geist-Variable.woff2`]);
  assert.deepEqual([normal.weight, normal.style], ['100 900', 'normal']);
  assert.deepEqual(srcOf(italic), [`${SANS}Geist-Italic[wght].woff2`]);
  assert.deepEqual([italic.weight, italic.style], ['100 900', 'italic']);
});

test('REQ-85-09: familia Geist Mono con --font-geist-mono', async () => {
  const fam = await family('Geist Mono');
  assert.equal(fam.cssVariable, '--font-geist-mono');
  const [normal] = fam.options.variants;
  assert.deepEqual(srcOf(normal), [`${MONO}GeistMono-Variable.woff2`]);
  assert.deepEqual([normal.weight, normal.style], ['100 900', 'normal']);
});

test('REQ-85-10: display swap y fallbacks terminados en familia genérica', async () => {
  for (const [name, generic] of [['Geist', 'sans-serif'], ['Geist Mono', 'monospace']]) {
    const fam = await family(name);
    assert.equal(fam.display, 'swap', name);
    assert.equal(fam.fallbacks?.at(-1), generic, name);
  }
});

const layout = read('src/layouts/Layout.astro');
test('REQ-85-11: <Font> de astro:assets en el head (preload solo de Geist normal)', () => {
  assert.match(layout, /import\s*\{\s*Font\s*\}\s*from\s*['"]astro:assets['"]/);
  const head = layout.slice(layout.indexOf('<head>'), layout.indexOf('</head>'));
  const sans = head.match(/<Font\s+cssVariable="--font-geist-sans"[^>]*\/>/)?.[0] ?? '';
  assert.match(sans, /preload=\{\[\{\s*style:\s*['"]normal['"]\s*\}\]\}/, 'Geist sin preload filtrado a normal');
  const mono = head.match(/<Font\s+cssVariable="--font-geist-mono"[^>]*\/>/)?.[0] ?? '';
  assert.ok(mono, 'falta <Font cssVariable="--font-geist-mono" /> en el head');
  assert.doesNotMatch(mono, /preload/);
});

test('REQ-85-12/13: tokens --font-sans y --font-mono sobre las variables de Astro', () => {
  const tokens = read('src/styles/tokens.css');
  assert.match(tokens, /--font-sans:\s*var\(--font-geist-sans, ui-sans-serif, system-ui, sans-serif\);/);
  assert.match(tokens, /--font-mono:\s*var\(--font-geist-mono, ui-monospace, monospace\);/);
  assert.doesNotMatch(tokens, /Inter/);
  assert.ok(lines(tokens) <= 100, `tokens.css mide ${lines(tokens)} líneas`);
});

test('REQ-85-14/15: typography.css pone code/pre/kbd/samp en --font-mono y el layout la importa', () => {
  const css = read('src/styles/typography.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const rule = css.match(/([^{}]+)\{([^}]*font-family:\s*var\(--font-mono\)[^}]*)\}/);
  assert.ok(rule, 'falta la regla font-family: var(--font-mono)');
  const sels = rule[1].split(',').map((s) => s.trim());
  for (const s of ['code', 'pre', 'kbd', 'samp']) assert.ok(sels.includes(s), `falta el selector ${s}`);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(/i);
  for (const v of css.match(/var\(--[\w-]+/g) ?? []) assert.match(read('src/styles/tokens.css'), new RegExp(`${v.slice(4)}:`));
  const iLayout = layout.indexOf('"../styles/layout.css"'), iTypo = layout.indexOf('"../styles/typography.css"');
  assert.ok(iLayout >= 0 && iTypo > iLayout, 'typography.css debe importarse después de layout.css');
});

const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
test('REQ-85-19/20: CSP sin font-src externo y ningún import JS del paquete geist en src/', () => {
  for (const csp of [read('public/_headers'), read('src/domain/http/security-headers.ts')]) {
    assert.match(csp, /default-src 'self'/);
    assert.doesNotMatch(csp, /font-src/);
  }
  for (const file of walk(fileURLToPath(new URL('src', root)))) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /(from|import\(?)\s*['"]geist(\/[^'"]*)?['"]/, file);
  }
});

test('REQ-85-22: archivos de la feature con 100 líneas o menos', () => {
  const files = ['astro.config.mjs', 'src/layouts/Layout.astro', 'src/styles/tokens.css', 'src/styles/typography.css',
    'tests/geist-font-base.test.mjs', 'tests/geist-font-build.test.mjs', 'tests/geist-font-dependency.test.mjs', 'tests/gsap-dependency-approval.test.mjs'];
  for (const f of files) assert.ok(lines(read(f)) <= 100, `${f} mide ${lines(read(f))} líneas`);
});
