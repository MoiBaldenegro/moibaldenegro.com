// Feature 88 (hero-profile-mask): la foto del hero se desvanece con una máscara (sin overlay),
// el handle va en mono y la descripción del perfil se alinea al CV (about.json).
// Spec: specs/88_hero-profile-mask/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const strip = (css) => css.replace(/[/][*][^]*?[*][/]/g, '');
const rule = (css, selector) => [...css.matchAll(/([^{}]+)[{]([^{}]*)[}]/g)]
  .filter(([, sel]) => sel.split(',').some((s) => s.trim() === selector)).map(([, , body]) => body).join(';');

const CSS = strip(read('src/styles/profile-card.css'));
const BASE = CSS.split('@media')[0];
const TABLET = CSS.split('@media (max-width: 1200px)')[1].split('@media')[0];

test('REQ-88-01: .profile-image img se desvanece hacia abajo con mask-image', () => {
  const mask = rule(CSS, '.profile-image img').match(/mask-image:\s*([^;]+)/);
  assert.ok(mask, '.profile-image img sin mask-image');
  assert.match(mask[1], /^linear-gradient\(\s*to bottom/);
  assert.match(mask[1], /transparent[^,]*\)\s*$/);
});

test('REQ-88-02: la máscara solo usa tokens como color', () => {
  const mask = rule(CSS, '.profile-image img').match(/mask-image:\s*([^;]+)/)?.[1] ?? '';
  assert.match(mask, /var\(--color-[\w-]+\)/);
  assert.doesNotMatch(mask, /#[0-9a-f]{3,8}|rgba?\(|hsla?\(|\bblack\b|\bwhite\b/i);
});

test('REQ-88-03: sin .profile-overlay en marcado ni estilos', () => {
  assert.doesNotMatch(read('src/components/new-hero/new-hero.astro'), /profile-overlay/);
  assert.doesNotMatch(CSS, /profile-overlay/);
});

test('REQ-88-04: la píldora del handle usa var(--font-mono)', () => {
  assert.match(rule(CSS, '.profile-username'), /font-family:\s*var\(--font-mono\)/);
});

test('REQ-88-05: cada segmento de la descripción del hero sale del CV', () => {
  const hero = JSON.parse(read('src/data/hero.json'));
  const about = JSON.parse(read('src/data/about.json'));
  const cv = new Set([
    ...about.headline.split('|').map((s) => s.trim()),
    ...about.skills.flatMap((group) => group.items),
  ]);
  for (const segment of hero.description.split(' • ')) {
    assert.ok(cv.has(segment), `«${segment}» no está en headline ni skills de about.json`);
  }
});

test('REQ-88-09: la foto se ve completa (proporción real, sin zoom)', () => {
  const img = rule(BASE, '.profile-image img');
  assert.match(img, /aspect-ratio:\s*952\s*\/\s*960/);
  assert.doesNotMatch(img, /transform/);
});

test('REQ-88-10: en escritorio la foto va detrás del texto; en <=1200 px vuelve al flujo', () => {
  assert.match(rule(BASE, '.profile-image'), /position:\s*absolute/);
  assert.match(rule(TABLET, '.profile-image'), /position:\s*relative/);
});

test('REQ-88-11: la píldora del handle está en .profile-content antes del h1', () => {
  const astro = read('src/components/new-hero/new-hero.astro');
  const content = astro.slice(astro.indexOf('class="profile-content"'));
  assert.ok(content.indexOf('profile-username') > 0 && content.indexOf('profile-username') < content.indexOf('<h1'));
});

test('REQ-88-12: el nombre escala con el ancho de la tarjeta (una línea en escritorio)', () => {
  assert.match(rule(BASE, '.profile-content'), /container-type:\s*inline-size/);
  assert.match(rule(BASE, '.profile-content h1'), /font-size:\s*min\([^;]*cqi/);
});

test('REQ-88-13: la tarjeta de perfil no reacciona al hover', () => {
  assert.doesNotMatch(CSS, /\.profile-card:hover/);
  assert.doesNotMatch(rule(BASE, '.profile-card'), /transition/);
});
