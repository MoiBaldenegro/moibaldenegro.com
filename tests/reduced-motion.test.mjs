// Test de movimiento reducido (feature 56 reduced-motion, REQ-56-01..06):
// la animación del hero solo con no-preference, red de seguridad global con
// reduce en layout.css y sin desplazamiento en hover de las tarjetas. Sin JS.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
// Contenido del primer bloque @media cuya condición contiene `query` (llaves equilibradas).
function mediaBlock(css, query) {
  const at = css.indexOf(`@media (${query})`);
  if (at < 0) return '';
  const open = css.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    if (css[i] === '}' && --depth === 0) return css.slice(open + 1, i);
  }
  return '';
}

test('REQ-56-01: la animación float solo existe con no-preference', () => {
  const css = strip(read('src/styles/hero-section.css'));
  const inside = mediaBlock(css, 'prefers-reduced-motion: no-preference');
  assert.match(inside, /animation:\s*float\b/, 'falta la animación dentro de no-preference');
  const outside = css.replace(inside, '');
  assert.doesNotMatch(outside, /animation:\s*float\b/, 'la animación sigue fuera del bloque no-preference');
});

test('REQ-56-02: layout.css reduce animaciones y transiciones en todos los elementos', () => {
  const block = mediaBlock(strip(read('src/styles/layout.css')), 'prefers-reduced-motion: reduce');
  assert.match(block, /\*,\s*\*::before,\s*\*::after\s*\{/);
  assert.match(block, /animation-duration:\s*0\.01ms/);
  assert.match(block, /transition-duration:\s*0\.01ms/);
});

test('REQ-56-03: sin desplazamiento en hover de .hero-card y .profile-card con reduce', () => {
  for (const [rel, selector] of [['src/styles/hero-card.css', '.hero-card:hover'], ['src/styles/profile-card.css', '.profile-card:hover']]) {
    const block = mediaBlock(strip(read(rel)), 'prefers-reduced-motion: reduce');
    assert.ok(block.includes(selector), `${rel}: el bloque reduce no anula ${selector}`);
    assert.match(block, /transform:\s*none/, `${rel}: no anula el transform`);
  }
});

test('REQ-56-04: ningún .ts de src/ consulta prefers-reduced-motion', () => {
  const files = readdirSync(new URL('src/', root), { recursive: true }).filter((f) => f.endsWith('.ts'));
  for (const file of files) {
    assert.doesNotMatch(read(`src/${file.split(String.fromCharCode(92)).join('/')}`), /prefers-reduced-motion/, file);
  }
});

test('REQ-56-06: las hojas tocadas no superan 100 líneas', () => {
  for (const rel of ['src/styles/hero-section.css', 'src/styles/layout.css', 'src/styles/hero-card.css', 'src/styles/profile-card.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
