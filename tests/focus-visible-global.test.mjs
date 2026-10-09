// Test del foco visible global y del × del buscador (feature 37
// focus-visible-global, REQ-37-01..08). Inspección de las hojas de src/styles.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const styles = new URL('../src/styles/', import.meta.url);
const read = (name) => readFileSync(new URL(name, styles), 'utf8');
// Cuerpo de la regla de primer nivel cuyo selector es exactamente `selector`.
const rule = (css, selector) => {
  const flat = css.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const block of flat.split('}')) {
    const [head, body = ''] = block.split('{');
    if (head.trim() === selector) return body;
  }
  return '';
};
const FOCUS = ':where(a, button, input, select, textarea, [tabindex]):focus-visible';
const NO_OUTLINE = /outline\s*:\s*(none|0)\b/;

test('REQ-37-01: regla de foco global con :where y tokens', () => {
  const body = rule(read('layout.css'), FOCUS);
  assert.match(body, /outline:\s*2px solid var\(--color-accent\)/, 'falta la regla global de foco');
  assert.match(body, /outline-offset:\s*2px/);
});

test('REQ-37-02: search-bar.css no anula el outline', () => {
  assert.doesNotMatch(read('search-bar.css'), NO_OUTLINE);
});

test('REQ-37-03: ninguna regla :focus/:focus-visible anula el outline', () => {
  for (const name of readdirSync(styles).filter((n) => n.endsWith('.css'))) {
    for (const [, selector, body] of read(name).matchAll(/([^{}]*:focus[^{}]*)\{([^}]*)\}/g)) {
      assert.doesNotMatch(body, NO_OUTLINE, `${name}: ${selector.trim()}`);
    }
  }
});

test('REQ-37-04: × de 32x32 con el glifo centrado', () => {
  const body = rule(read('search-bar.css'), '.search-bar__clear');
  assert.match(body, /width:\s*32px/);
  assert.match(body, /height:\s*32px/);
  assert.match(body, /display:\s*(grid|flex)/);
  assert.match(body, /(place-items|align-items):\s*center/);
});

test('REQ-37-05: el input reserva >= 40px a la derecha', () => {
  const body = rule(read('search-bar.css'), '.search-bar__input');
  const right = body.match(/padding-right:\s*(\d+)px/)?.[1]
    ?? body.match(/padding:\s*\d+px\s+(\d+)px/)?.[1];
  assert.ok(Number(right) >= 40, `padding derecho ${right}`);
});

test('REQ-37-06: reglas nuevas sin colores sueltos', () => {
  for (const body of [rule(read('layout.css'), FOCUS), rule(read('search-bar.css'), '.search-bar__clear')]) {
    assert.doesNotMatch(body, /#[0-9a-f]{3,8}\b|rgba?\(/i);
  }
});

test('REQ-37-08: layout.css y search-bar.css no superan 100 líneas', () => {
  for (const name of ['layout.css', 'search-bar.css']) assert.ok(read(name).split('\n').length <= 100, name);
});
