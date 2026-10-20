// Test de la feature 97 hero-cards-unique-tech, ronda 2 (REQ-97-19..21). Spec:
// specs/97_hero-cards-unique-tech/ (design.md Decisiones 4 y 8).
//   REQ-97-19 ajustes de icono por tramo solo dentro de los @media existentes ·
//   REQ-97-20 iconWidth/rotate del JSON = regla base · REQ-97-21 geometría intacta.
// La medida visual (REQ-97-16/17/18/22/23) se hace con Chrome headless + CDP (impl).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const CSS_PATH = 'src/styles/hero-card.css';
const css = () => read(CSS_PATH).replace(/\/\*[\s\S]*?\*\//g, '');

// Bloques de nivel superior: { head, body } con llaves equilibradas.
function blocks(src) {
  const out = []; let depth = 0; let start = 0; let head = '';
  for (let i = 0; i < src.length; i++) {
    if (src[i] === '{') { if (depth === 0) { head = src.slice(start, i).trim(); start = i + 1; } depth++; }
    if (src[i] === '}') { depth--; if (depth === 0) { out.push({ head, body: src.slice(start, i) }); start = i + 1; } }
  }
  return out;
}
const decls = (body) => Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean)
  .map((d) => [d.slice(0, d.indexOf(':')).trim(), d.slice(d.indexOf(':') + 1).trim()]));
const media = (q) => blocks(css()).find((b) => b.head === `@media (${q})`);
const tokenRules = (body) => blocks(body).filter((b) => /^\[data-color-token="[a-z-]+"\]$/.test(b.head))
  .map((b) => ({ token: b.head.match(/"([a-z-]+)"/)[1], decl: decls(b.body) }));

test('REQ-97-19: las reglas [data-color-token] de los @media solo declaran --icon-width, --icon-rotation o --icon-scale en rango', () => {
  const ALLOWED = new Set(['--icon-width', '--icon-rotation', '--icon-scale']);
  const inMedia = blocks(css()).filter((b) => b.head.startsWith('@media')).flatMap((b) => tokenRules(b.body));
  assert.ok(inMedia.length > 0, 'no hay ajustes de icono por tramo');
  for (const { token, decl } of inMedia) {
    for (const [prop, value] of Object.entries(decl)) {
      assert.ok(ALLOWED.has(prop), `${token} declara ${prop} dentro de @media`);
      if (prop === '--icon-width') { const n = parseFloat(value); assert.match(value, /^\d+(\.\d+)?px$/); assert.ok(n >= 30 && n <= 200, `${token} --icon-width ${value}`); }
      if (prop === '--icon-rotation') { const n = parseFloat(value); assert.match(value, /^-?\d+(\.\d+)?deg$/); assert.ok(n >= -12 && n <= 0, `${token} --icon-rotation ${value}`); }
      if (prop === '--icon-scale') { const n = Number(value); assert.ok(n >= 2 && n <= 5, `${token} --icon-scale ${value}`); }
    }
  }
});

// Valores por defecto de design.md Decisión 4 ajustados por la medida CDP (ver impl, Ronda 2).
const EXPECTED_1200 = {
  github: { '--icon-width': '110px', '--icon-scale': '2', '--icon-rotation': '0deg' },
  rust: { '--icon-scale': '3' }, aws: { '--icon-scale': '3' }, 'claude-code': { '--icon-scale': '2' },
  cloudflare: { '--icon-width': '100px', '--icon-rotation': '0deg' },
  // Ajuste feature 98 (precedente REQ-43-06): CLAUDE y BUN tapaban su título (BUN aún 4,5 px² con -8deg) y YOUTUBE quedaba al 33,7 % a 800 px.
  claude: { '--icon-scale': '3' }, bun: { '--icon-scale': '3', '--icon-rotation': '0deg' }, youtube: { '--icon-scale': '2' },
  // Ajuste feature 99 (precedente REQ-43-06): CLOUDFLARE completo a 100px (REQ-99-26/27), YOUTUBE a 2 y las cards que
  // cambian de tamaño sin tapar el título a 800/1024 (medida CDP en progress/impl_hero-os-panel-mosaic.md).
  // Ajuste feature 101 (precedente REQ-43-06): las grandes fijan en tablet su ancho previo (crecen solo en escritorio)
  // y CSS/HTML pasan a escala 3 para no tapar su título a 769-1200 px (REQ-101-07, tabla de specs/101_hero-cards-polish/design.md).
  node: { '--icon-width': '165px', '--icon-scale': '3' }, nestjs: { '--icon-width': '160px', '--icon-scale': '3' }, react: { '--icon-scale': '3' },
  typescript: { '--icon-width': '150px', '--icon-scale': '2' }, css: { '--icon-width': '105px', '--icon-scale': '3' }, html: { '--icon-width': '115px', '--icon-scale': '3' },
};

test('REQ-97-19 (design.md Decisión 4): ajustes por defecto en @media (max-width: 1200px) tras la primera regla', () => {
  const block = media('max-width: 1200px'); assert.ok(block, 'falta @media (max-width: 1200px)');
  const rules = Object.fromEntries(tokenRules(block.body).map((r) => [r.token, r.decl]));
  assert.deepEqual(rules, EXPECTED_1200);
  assert.equal(blocks(block.body)[0].head, '.hero-card', 'los ajustes deben ir tras la primera regla .hero-card');
});

// Ajuste feature 98 (precedente REQ-43-06): todas las tarjetas de icono, sin recuento fijo (REQ-98-35).
test('REQ-97-20 / REQ-98-35: iconWidth y rotate del JSON coinciden con la regla base fuera de @media', () => {
  const base = Object.fromEntries(tokenRules(css()).map((r) => [r.token, r.decl]));
  const all = JSON.parse(read('src/data/hero-cards.json'));
  const cards = all.filter((c) => c.iconWidth !== undefined);
  assert.equal(cards.length, all.filter((c) => c.kind === undefined).length);
  // Ajuste feature 101 (precedente REQ-43-06): el JSON no cambia (REQ-101-17); el iconWidth de las featured es ahora
  // su ancho de tablet (@media 1200) y la regla base lleva el de escritorio de design.md (REQ-101-04).
  const tablet = Object.fromEntries(tokenRules(media('max-width: 1200px').body).map((r) => [r.token, r.decl]));
  for (const c of cards) {
    const width = c.featured ? tablet[c.colorToken]?.['--icon-width'] : base[c.colorToken]?.['--icon-width'];
    assert.equal(width, c.iconWidth, `${c.id} --icon-width ${c.featured ? 'tablet' : 'base'}`);
    assert.equal(base[c.colorToken]?.['--icon-rotation'], `${c.rotate}deg`, `${c.id} --icon-rotation base`);
  }
});

// Ajuste feature 98 (precedente REQ-43-06): hero-section.css gana las reglas de span (REQ-98-18) y
// deja de congelarse frente a HEAD; su rejilla 12/6/1 columnas la sigue fijando REQ-91-08.
test('REQ-97-21: primera regla del bloque 1200 intacta y sin geometría en los ajustes por tramo', () => {
  const first = blocks(media('max-width: 1200px').body)[0];
  assert.equal(first.head, '.hero-card');
  assert.deepEqual(decls(first.body), { 'grid-column': 'auto !important', 'grid-row': 'auto !important' });
  for (const b of blocks(css()).filter((x) => x.head.startsWith('@media'))) {
    for (const { token, decl } of tokenRules(b.body)) {
      for (const p of ['grid-column', 'grid-row', 'min-height', '--card-column', '--card-row']) assert.ok(!(p in decl), `${token} toca ${p}`);
    }
  }
});

test('Decisión 8: hero-card.css y este test no superan 100 líneas', () => {
  for (const rel of [CSS_PATH, 'tests/hero-cards-icon-fit.test.mjs']) {
    assert.ok(read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length <= 100, `${rel} > 100 líneas`);
  }
});
