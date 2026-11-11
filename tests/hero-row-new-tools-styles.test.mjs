// Test de estilos de la feature 2 hero-row-new-tools (REQ-02-08..11). Spec: specs/02_hero-row-new-tools/
// (requirements.md + design.md, Decisiones 4-6). node:test, sin dependencias.
// Feature 12 (REQ-12-03): fondos y geometría por [data-brand] en la copia del design system MXVI.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const MARCAS = ['bash', 'webassembly', 'astro', 'opencode', 'tauri'];
const PEQUENAS = MARCAS.filter((m) => m !== 'astro');
// Regla CSS: el bloque de declaraciones que sigue al selector (null si el selector no existe).
const regla = (css, selector) => { const i = css.indexOf(selector); if (i === -1) return null; const a = css.indexOf('{', i); return css.slice(a + 1, css.indexOf('}', a)); };
// Bloque @media: desde su llave hasta la llave que lo cierra (null si no existe).
const media = (css, query) => { const i = css.indexOf(`@media (${query})`); if (i === -1) return null; const a = css.indexOf('{', i); let n = 0; for (let j = a; j < css.length; j += 1) { if (css[j] === '{') n += 1; else if (css[j] === '}') { n -= 1; if (n === 0) return css.slice(a + 1, j); } } return null; };
const numero = (texto, prop) => { const m = texto.match(new RegExp(`${prop}:\\s*([0-9.]+)`)); return m ? Number(m[1]) : null; };
test('REQ-02-08: tokens.css define los cinco --color-marca-* nuevos', () => {
  const tokens = read('src/styles/tokens.css');
  for (const marca of MARCAS) {
    assert.match(tokens, new RegExp(`--color-marca-${marca}:\\s*#[0-9a-fA-F]{3,8}\\b`), `falta el token de ${marca}`);
  }
});
const COLORS = 'src/styles/mxvi/components/molecules/brand-colors.css';
const GEOMETRY = 'src/styles/mxvi/components/molecules/brand-geometry.css';
test('REQ-02-09: cada marca nueva tiene su regla [data-brand] con el fondo de su token', () => {
  const brands = read(COLORS);
  for (const marca of MARCAS) {
    const bloque = regla(brands, `[data-brand="${marca}"]`);
    assert.ok(bloque, `falta la regla de ${marca}`);
    assert.match(bloque, new RegExp(`--tile-bg:\\s*var\\(--color-marca-${marca}\\)`), `fondo de ${marca}`);
  }
});
test('REQ-02-10: la regla de astro declara un icono mayor que el de las cuatro pequeñas de su fila', () => {
  const brands = read(GEOMETRY);
  const astro = regla(brands, '[data-brand="astro"]');
  const anchoAstro = numero(astro, '--icon-width');
  const escalaAstro = numero(astro, '--icon-scale');
  assert.ok(anchoAstro !== null && escalaAstro !== null, 'astro debe declarar --icon-width y --icon-scale');
  for (const marca of PEQUENAS) {
    const bloque = regla(brands, `[data-brand="${marca}"]`);
    const ancho = numero(bloque, '--icon-width');
    const escala = numero(bloque, '--icon-scale');
    assert.ok(ancho !== null && escala !== null, `${marca} debe declarar --icon-width y --icon-scale`);
    assert.ok(anchoAstro > ancho, `${marca}: el ancho de astro (${anchoAstro}) debe superar ${ancho}`);
    assert.ok(escalaAstro > escala, `${marca}: la escala de astro (${escalaAstro}) debe superar ${escala}`);
  }
});
test('REQ-02-11: a 1200 px las cinco tarjetas nuevas bajan la escala del icono', () => {
  const brands = read(GEOMETRY);
  const tablet = media(brands, 'max-width: 1200px');
  assert.ok(tablet, 'falta el bloque @media (max-width: 1200px)');
  for (const marca of MARCAS) {
    const escritorio = regla(brands, `[data-brand="${marca}"]`);
    const ajuste = regla(tablet, `[data-brand="${marca}"]`);
    assert.ok(ajuste, `falta el ajuste de ${marca} a 1200 px`);
    const escala = numero(ajuste, '--icon-scale');
    const base = numero(escritorio, '--icon-scale');
    assert.ok(escala !== null && base !== null, `${marca} debe declarar la escala`);
    assert.ok(escala < base, `${marca}: la escala a 1200 px (${escala}) debe ser menor que en escritorio (${base})`);
  }
});
