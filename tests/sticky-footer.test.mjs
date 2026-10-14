// Feature 94 (sticky-footer): footer pegado abajo en páginas cortas, solo CSS en layout.css.
// Spec: specs/94_sticky-footer/ (REQ-94-01..13). Medición de navegador en progress/impl_sticky-footer.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const cwd = new URL('..', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, cwd), 'utf8');
const lines = (s) => s.split('\n').length - (s.endsWith('\n') ? 1 : 0);
const strip = (css) => css.replace(/[/][*][^]*?[*][/]/g, '');
const LAYOUT = strip(read('src/styles/layout.css'));

/** Cuerpo de la regla de nivel superior cuyo selector es exactamente `selector`. */
const rule = (css, selector) => {
  for (const block of css.split('}')) {
    const [head, body] = block.split('{');
    if (body !== undefined && head.trim().replace(/\s+/g, ' ') === selector) return body;
  }
  return null;
};
const unchanged = (rel) => {
  try { execFileSync('git', ['diff', '--quiet', 'HEAD', '--', rel], { cwd, stdio: 'ignore' }); return true; } catch { return false; }
};

test('REQ-94-01: body es una columna flex', () => {
  const body = rule(LAYOUT, 'body');
  assert.ok(body, 'layout.css debe tener la regla body');
  assert.match(body, /display:\s*flex\s*;/);
  assert.match(body, /flex-direction:\s*column\s*;/);
});

test('REQ-94-02: body declara min-height 100vh seguido de 100dvh', () => {
  assert.match(rule(LAYOUT, 'body') ?? '', /min-height:\s*100vh\s*;\s*min-height:\s*100dvh\s*;/);
});

test('REQ-94-03: body > main crece con flex 1 0 auto', () => {
  const main = rule(LAYOUT, 'body > main');
  assert.ok(main, 'layout.css debe tener la regla body > main');
  assert.match(main, /flex:\s*1 0 auto\s*;/);
});

test('REQ-94-04: el reset html, body no declara height', () => {
  const reset = rule(LAYOUT, 'html, body');
  assert.ok(reset, 'layout.css debe conservar el reset html, body');
  assert.match(reset, /margin:\s*0/);
  assert.doesNotMatch(reset, /(^|[;\s])height\s*:/);
});

test('REQ-94-05: layout.css mide exactamente 99 líneas', () => {
  assert.equal(lines(read('src/styles/layout.css')), 99);
});

test('REQ-94-10: site-footer.css sin cambios y sin position fixed', () => {
  assert.ok(unchanged('src/styles/site-footer.css'), 'site-footer.css cambió frente a HEAD');
  assert.doesNotMatch(read('src/styles/site-footer.css'), /position:\s*fixed/);
});

test('REQ-94-11: site-menu.css sin cambios frente a HEAD', () => {
  assert.ok(unchanged('src/styles/site-menu.css'), 'site-menu.css cambió frente a HEAD');
});

test('REQ-94-01..05: layout.css sigue usando solo tokens para colores', () => {
  assert.doesNotMatch(LAYOUT, /#[0-9a-f]{3,8}\b|rgba?\(/i);
});
