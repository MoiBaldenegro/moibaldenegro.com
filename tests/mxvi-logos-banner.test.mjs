import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('el componente entre hero y artículos muestra los cuatro logos MXVI', () => {
  const component = read('src/components/mxvi-logos-banner.astro');
  for (const id of ['mxvi-m', 'mxvi-x', 'mxvi-v', 'mxvi-i']) {
    assert.match(component, new RegExp(`id: "${id}"`), id);
  }
  assert.match(component, /aria-hidden="true"/);
  assert.match(component, /import "\.\.\/styles\/mxvi-logos-banner\.css"/);
});

test('la franja de logos aplica tratamiento blanco atenuado y responsive', () => {
  const styles = read('src/styles/mxvi-logos-banner.css');
  assert.match(styles, /filter:\s*grayscale\(1\)\s+brightness\(0\)\s+invert\(1\)/);
  assert.match(styles, /opacity:\s*var\(--opacity-logo-muted\)/);
  assert.match(styles, /@media\s*\(max-width:\s*768px\)/);
});
