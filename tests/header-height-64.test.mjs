// Feature 77 (header-height-64): el header de escritorio baja de 74 a 64 px por petición humana
// («queda más bonito»). Móvil (<=768 px) sin cambios. Spec: specs/77_header-height-64/.
// Mediciones en navegador (REQ-77-04..10) en progress/impl_77.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const lines = (s) => s.split('\n').length - (s.endsWith('\n') ? 1 : 0);
const tokens = read('src/styles/tokens.css');
const layout = read('src/styles/layout.css');

test('REQ-77-01/02: --header-height vale 64px y tokens.css sigue en 97 líneas', () => {
  assert.match(tokens, /--header-height:[ ]*64px;/);
  assert.match(tokens, /--header-height-mobile:[ ]*170px;/);
  assert.equal(lines(tokens), 97);
});

test('REQ-77-03/08: el nav usa el token, centrado, y scroll-padding-top usa var(--header-height)', () => {
  const nav = layout.match(/[.]site-navbar nav[ ]*[{]([^}]*)[}]/)?.[1] ?? '';
  assert.match(nav, /min-height:[ ]*var[(]--header-height[)]/);
  assert.match(nav, /align-items:[ ]*center/);
  assert.doesNotMatch(layout, /height:[ ]*(64|74)px/);
  assert.match(layout, /html[ ]*[{][^}]*scroll-padding-top:[ ]*var[(]--header-height[)]/);
});

test('REQ-77-10: móvil conserva --header-height-mobile y padding-block del nav', () => {
  const mobile = layout.slice(layout.indexOf('@media (max-width: 768px)'));
  assert.match(mobile, /scroll-padding-top:[ ]*var[(]--header-height-mobile[)]/);
  assert.match(mobile, /padding-block:[ ]*var[(]--gap-card[)]/);
});

// Ronda 2 (review_77): la regla del logo (display: block) solo en escritorio, con test propio.
test('REQ-77-06: el logo es block solo dentro de @media (min-width: 769px), al final del archivo', () => {
  const at = layout.indexOf('@media (min-width: 769px)');
  assert.ok(at >= 0, 'falta @media (min-width: 769px)');
  const block = layout.slice(at, layout.indexOf('} }', at) + 3);
  assert.match(block, /[.]site-navbar a img[ ]*[{][ ]*display:[ ]*block;?[ ]*[}]/);
  assert.equal(layout.split('.site-navbar a img').length - 1, 1, 'la regla del logo aparece fuera del bloque de escritorio');
  const mobile = layout.slice(layout.indexOf('@media (max-width: 768px)'), layout.indexOf('}', layout.indexOf('.site-navbar a {', layout.indexOf('@media (max-width: 768px)'))) + 1);
  assert.ok(!mobile.includes('img'), 'la regla del logo está en el bloque móvil');
  assert.ok(at > layout.indexOf('@media (max-width: 768px)'), 'la media query debe ir con las demás, al final del archivo');
});

test('REQ-77-13: archivos tocados <= 100 líneas', () => {
  for (const rel of ['src/styles/tokens.css', 'src/styles/layout.css', 'tests/header-height-64.test.mjs', 'tests/header-mobile-reflow.test.mjs']) assert.ok(lines(read(rel)) <= 100, rel);
});
