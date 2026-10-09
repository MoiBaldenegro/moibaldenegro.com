// Test de contraste de la insignia de verificado y del kicker del artículo
// (feature 52 contrast-badge-kicker, REQ-52-01..07). Calcula la luminancia
// relativa de WCAG 2.2 con los valores reales de tokens.css.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const tokens = read('src/styles/tokens.css');
const token = (name) => {
  const value = tokens.match(new RegExp(`${name}:[ ]*(#[0-9a-fA-F]{6})`))?.[1];
  assert.ok(value, `${name} no es un hex de 6 dígitos en tokens.css`);
  return value;
};
const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

test('REQ-52-01: el ✓ es decorativo y el texto «Verificado» es accesible', () => {
  const hero = read('src/components/new-hero/new-hero.astro');
  assert.match(hero, /<span aria-hidden="true">✓<\/span>/);
  assert.match(hero, /<span class="visually-hidden">Verificado<\/span>/);
});

test('REQ-52-02: --color-verified frente a --color-text >= 4.5:1', () => {
  const ratio = contrast(token('--color-verified'), token('--color-text'));
  assert.ok(ratio >= 4.5, `contraste ${ratio.toFixed(2)}:1`);
});

test('REQ-52-03: --color-verified frente a --color-username-bg >= 3:1', () => {
  const ratio = contrast(token('--color-verified'), token('--color-username-bg'));
  assert.ok(ratio >= 3, `contraste ${ratio.toFixed(2)}:1`);
});

test('REQ-52-04: .post__kicker usa --color-accent-hover para el texto', () => {
  const css = read('src/styles/post-header.css');
  const at = css.indexOf('.post__kicker {');
  assert.match(css.slice(at, css.indexOf('}', at)), /(^|[^-])color:\s*var\(--color-accent-hover\)/m);
});

test('REQ-52-05: --color-accent-hover frente a --color-hero-top >= 4.5:1', () => {
  const ratio = contrast(token('--color-accent-hover'), token('--color-hero-top'));
  assert.ok(ratio >= 4.5, `contraste ${ratio.toFixed(2)}:1`);
});

test('REQ-52-07: los archivos tocados no superan 100 líneas', () => {
  for (const rel of ['src/components/new-hero/new-hero.astro', 'src/styles/tokens.css', 'src/styles/post-header.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
