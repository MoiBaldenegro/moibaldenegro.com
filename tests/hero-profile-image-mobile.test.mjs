// Feature 69 (hero-profile-image-mobile): en <=768 px la foto del hero medía 0 px (la tarjeta
// de perfil cabía en una fila de 190 px y .profile-image usaba height: 68%) y entre 769 y
// 1200 px las hero-cards se pintaban encima (fila de 140 px para una tarjeta de 650 px).
// Spec: specs/69_hero-profile-image-mobile/. Mediciones en navegador en progress/impl_69.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const strip = (css) => css.replace(/[/][*][^]*?[*][/]/g, '');

/** Cuerpo del bloque @media (max-width: Npx) (llaves balanceadas). */
function media(css, px) {
  const start = css.indexOf(`@media (max-width: ${px}px)`);
  assert.ok(start >= 0, `falta @media (max-width: ${px}px)`);
  let depth = 0;
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(css.indexOf('{', start) + 1, i);
  }
  return '';
}
const rule = (block, selector) => [...block.matchAll(/([^{}]+)[{]([^{}]*)[}]/g)]
  .filter(([, sel]) => sel.split(',').some((s) => s.trim() === selector)).map(([, , body]) => body).join(';');

const PROFILE = strip(read('src/styles/profile-card.css'));
const HERO = strip(read('src/styles/hero-section.css'));

test('REQ-69-01: en <=1200 px .profile-image no depende de un porcentaje del alto de la tarjeta', () => {
  const body = rule(media(PROFILE, 1200), '.profile-image');
  const fixed = /(^|[;\s])(min-)?height:[ ]*([0-9]+px|var[(])/.test(body);
  const ratio = /(^|[;\s])height:[ ]*auto/.test(body) && /aspect-ratio:/.test(body);
  assert.ok(fixed || ratio, `.profile-image en <=1200 px: ${body.trim() || '(sin regla)'}`);
  assert.doesNotMatch(body, /(^|[;\s])height:[ ]*[0-9.]+%/, 'alto en porcentaje');
});

test('REQ-69-01: la fila de la tarjeta de perfil crece con su contenido en <=1200 y <=768 px', () => {
  for (const px of [1200, 768]) {
    const rows = rule(media(HERO, px), '.hero-grid').match(/grid-auto-rows:[ ]*([^;]+)/)?.[1].trim() ?? '';
    assert.match(rows, /^(auto|minmax[(][^,]+,[ ]*auto[)])$/, `grid-auto-rows en <=${px} px: ${rows}`);
  }
});

test('REQ-69-10: las reglas tocadas no usan colores sueltos ni px de espaciado/radio/sombra', () => {
  for (const [css, px, sel] of [[PROFILE, 1200, '.profile-image'], [PROFILE, 768, '.profile-image'], [HERO, 1200, '.hero-grid'], [HERO, 768, '.hero-grid']]) {
    const body = rule(media(css, px), sel);
    assert.doesNotMatch(body, /#[0-9a-fA-F]{3,8}|rgba?[(]/, `${sel} <=${px}: color suelto`);
    assert.doesNotMatch(body, /(padding|margin|gap|radius|shadow)[^:]*:[^;]*[0-9]px/, `${sel} <=${px}: px suelto`);
  }
});

test('REQ-69-13: profile-card.css, hero-section.css y este test no superan 100 líneas', () => {
  for (const rel of ['src/styles/profile-card.css', 'src/styles/hero-section.css', 'tests/hero-profile-image-mobile.test.mjs']) {
    const src = read(rel);
    assert.ok(src.split('\n').length - (src.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
