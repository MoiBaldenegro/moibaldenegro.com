// Test del header en móvil y viewports bajos (feature 51 header-mobile-reflow,
// REQ-51-01..07): token --header-height, altura mínima en lugar de fija,
// scroll-padding-top para las anclas y header estático con poca altura.
// REQ-51-05 (320 px y zoom 400 %) se verifica a mano: ver progress/impl_51.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const css = (rel) => read(rel).replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (text, selector) => {
  for (const block of text.split('}')) {
    const [head, body = ''] = block.split('{');
    if (head.trim() === selector) return body;
  }
  return '';
};

test('REQ-51-01: tokens.css declara --header-height: 74px', () => {
  assert.match(read('src/styles/tokens.css'), /--header-height:\s*74px;/);
});

test('REQ-51-02: la barra usa altura mínima con el token, no una altura fija', () => {
  const layout = css('src/styles/layout.css');
  assert.doesNotMatch(layout, /height:\s*74px/);
  const nav = rule(layout, '.site-navbar nav');
  assert.match(nav, /min-height:\s*var\(--header-height\)/);
  assert.doesNotMatch(nav, /(^|[^-])height:\s*(?!auto)[0-9]/, 'la barra conserva una altura fija');
});

test('REQ-51-03: html con scroll-padding-top del token', () => {
  assert.match(rule(css('src/styles/layout.css'), 'html'), /scroll-padding-top:\s*var\(--header-height\)/);
});

test('REQ-51-04: header estático con 500px de alto o menos', () => {
  const layout = css('src/styles/layout.css');
  const at = layout.indexOf('@media (max-height: 500px)');
  assert.ok(at >= 0, 'falta @media (max-height: 500px)');
  assert.match(layout.slice(at, layout.indexOf('}', layout.indexOf('}', at) + 1) + 1), /\.site-navbar\s*\{\s*position:\s*static;?\s*\}/);
});

test('REQ-51-07: tokens.css y layout.css no superan 100 líneas', () => {
  for (const rel of ['src/styles/tokens.css', 'src/styles/layout.css']) assert.ok(read(rel).split('\n').length <= 100, rel);
});
