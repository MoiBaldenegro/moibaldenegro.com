import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const styles = read('src/styles/mxvi/components/organisms/logo-band.css') // REQ-12-09: estilos del design system;
const tokens = read('src/styles/tokens.css');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (selector) => {
  const m = styles.match(new RegExp(`(^|\\n)${esc(selector)}\\s*\\{([^}]*)\\}`));
  return m ? m[2] : '';
};
const blue = ['--color-mxvi-band-edge', '--color-mxvi-band-center', '--color-mxvi-band-glow'];

test('REQ-07-01/02: degradado lineal morado del hero y resplandor radial con --color-glow', () => {
  const band = rule('.mx-logo-band');
  assert.match(band,
    /linear-gradient\(90deg,\s*var\(--color-hero-mid\),\s*var\(--color-hero-top\),\s*var\(--color-hero-mid\)\)/);
  assert.match(band, /radial-gradient\([^;]*at center[^;]*var\(--color-glow\),\s*transparent[^;)]*\)/);
});

test('REQ-07-03/04: sin tokens azules en la hoja ni en tokens.css', () => {
  for (const t of blue) {
    assert.ok(!styles.includes(t), `logo-band.css usa ${t}`);
    assert.ok(!tokens.includes(t), `tokens.css define ${t}`);
  }
});

test('REQ-07-05: tokens.css conserva padding y opacidades de la cinta', () => {
  for (const t of ['space-mxvi-band', 'opacity-logo-band', 'opacity-logo-band-hover']) {
    assert.match(tokens, new RegExp(`--${t}:`), t);
  }
});

test('REQ-07-06: borde fino superior e inferior con --color-border', () => {
  assert.match(rule('.mx-logo-band'), /border-block:\s*1px solid var\(--color-border\)/);
});

test('REQ-07-07/08: hover y focus-visible añaden halo accent al filtro blanco', () => {
  const m = styles.match(/\.mx-logo-band__link:hover \.mx-logo-band__logo,\s*\.mx-logo-band__link:focus-visible \.mx-logo-band__logo\s*\{([^}]*)\}/);
  assert.ok(m, 'falta la regla hover/focus-visible del logo');
  const filter = m[1].match(/filter:\s*([^;]*);/);
  assert.ok(filter, 'falta filter en hover/focus-visible');
  const f = filter[1];
  assert.match(f, /grayscale\(1\)\s+brightness\(0\)\s+invert\(1\)\s+drop-shadow\(/);
  const shadow = f.slice(f.indexOf('drop-shadow('));
  assert.match(shadow, /var\(--gap-card\)/);
  assert.match(shadow, /var\(--color-accent\)/);
  assert.match(m[1], /opacity:\s*var\(--opacity-logo-band-hover\)/);
  const t = m[1].match(/transform:\s*translateY\((-[\d.]+)px\)\s*scale\(([\d.]+)\)/);
  assert.ok(t, 'falta transform con translateY y scale');
  assert.ok(Number(t[1]) < 0 && Number(t[2]) > 1);
  assert.match(rule('.mx-logo-band__link:focus-visible'), /outline:\s*2px solid var\(--color-text\)/);
});

test('REQ-07-09: la transición del logo anima opacity, transform y filter', () => {
  const tr = rule('.mx-logo-band__logo').match(/transition:\s*([^;]*);/);
  assert.ok(tr, 'falta transition en .mx-logo-band__logo');
  for (const p of ['opacity', 'transform', 'filter']) {
    assert.match(tr[1], new RegExp(`(^|,\\s*)${p} var\\(--transition-default\\)`), p);
  }
});

test('REQ-07-10: reduced-motion anula transición y transform, no opacidad ni halo', () => {
  const m = styles.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(m, 'falta @media prefers-reduced-motion');
  assert.match(m[1], /transition:\s*none/);
  assert.match(m[1], /transform:\s*none/);
  assert.doesNotMatch(m[1], /opacity/);
  assert.doesNotMatch(m[1], /filter/);
});

test('REQ-07-11: la hoja no contiene hexadecimales, rgb( ni rgba(', () => {
  assert.doesNotMatch(styles, /#[0-9a-fA-F]{3,8}\b/);
  assert.doesNotMatch(styles, /rgba?\(/);
});

test('REQ-07-14: archivos tocados con <=100 líneas', () => {
  for (const path of ['src/styles/mxvi/components/organisms/logo-band.css', 'src/styles/tokens.css',
    'tests/mxvi-logos-banner.test.mjs', 'tests/mxvi-band-site-palette.test.mjs']) {
    assert.ok(read(path).trimEnd().split('\n').length <= 100, `${path} supera 100 líneas`);
  }
});
