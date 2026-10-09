// Feature 61 (header-anchor-offset-mobile): a 320 px el nav se envuelve y el header
// sticky mide más que --header-height; las anclas quedaban tapadas y el logo tocaba el
// borde superior. Spec: specs/61_header-anchor-offset-mobile/requirements.md.
// Altura del header a 320 px medida con Chrome headless + CDP: ver progress/impl_61.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const tokens = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../src/styles/layout.css', import.meta.url), 'utf8');
const MEASURED_HEADER_320 = 165; // px medidos a 320 px con el padding nuevo (impl_61.md)

/** Cuerpo del bloque @media (max-width: 768px) de layout.css (llaves balanceadas). */
function mobileBlock(css) {
  const start = css.indexOf('@media (max-width: 768px)');
  assert.ok(start >= 0, 'layout.css debe tener @media (max-width: 768px)');
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(start, i + 1);
  }
  return '';
}

/** Declaraciones de un selector dentro de un fragmento CSS. */
function rule(css, selector) {
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]]/g, (c) => String.fromCharCode(92) + c) + '[ ]*[{]([^}]*)[}]');
  return (css.match(re) || [])[1] || '';
}

test('REQ-61-01: tokens.css declara --header-height-mobile >= la altura medida del header a 320 px', () => {
  const m = tokens.match(/--header-height-mobile:[ ]*([0-9]+)px;/);
  assert.ok(m, 'falta el token --header-height-mobile en px');
  assert.ok(Number(m[1]) >= MEASURED_HEADER_320, `--header-height-mobile (${m[1]}px) < ${MEASURED_HEADER_320}px medidos`);
});

test('REQ-61-02: en <=768px html usa scroll-padding-top: var(--header-height-mobile)', () => {
  assert.match(rule(mobileBlock(layout), 'html'), /scroll-padding-top:[ ]*var[(]--header-height-mobile[)]/);
});

test('REQ-61-03: la regla html global conserva scroll-padding-top: var(--header-height)', () => {
  const outside = layout.replace(mobileBlock(layout), '');
  assert.match(outside, /html[ ]*[{][^}]*scroll-padding-top:[ ]*var[(]--header-height[)]/);
});

test('REQ-61-04: en <=768px .site-navbar nav declara padding-block: var(--gap-card)', () => {
  assert.match(rule(mobileBlock(layout), '.site-navbar nav'), /padding-block:[ ]*var[(]--gap-card[)]/);
});

test('REQ-61-08: tokens.css, layout.css y este test no superan 100 líneas', () => {
  const self = readFileSync(new URL(import.meta.url), 'utf8');
  for (const [name, src] of [['tokens.css', tokens], ['layout.css', layout], ['test', self]]) {
    assert.ok(src.split('\n').length <= 100, `${name} supera 100 líneas`);
  }
});
