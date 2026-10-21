// Test de la feature 1 hero-grid-explicit-rows (REQ-01-01..14). Spec: specs/01_hero-grid-explicit-rows/
// (requirements.md + design.md). node:test, sin dependencias.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutHeroCards, HeroGridLayoutError } from '../src/domain/hero-grid-layout.ts';
import { HeroCardsRepository } from '../src/domain/repositories/hero-cards-repository.ts';
import { parseHeroCards, HeroCardsDataError } from '../src/domain/repositories/hero-cards-parse.ts';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const icon = (id, { category = 'tech', featured = false, row } = {}) => ({ id, kind: 'icon', title: id, colorToken: id, icon: `#${id}`, category, featured, rotate: 0, scale: 5, iconWidth: '100px', showOnMobile: false, href: null, ...(row === undefined ? {} : { row }) });
const rich = (id = 'htb') => ({ id, kind: 'htb', title: id, colorToken: 'htb', showOnMobile: true, href: null });
const zone = () => [icon('z0'), icon('z1'), icon('z2'), icon('zf', { featured: true })];
const fila = (n, prefix, social = false) => [icon(`${prefix}0`, { row: n }), icon(`${prefix}1`, { row: n }), icon(`${prefix}2`, { row: n, featured: true, category: social ? 'social' : 'tech' }), icon(`${prefix}3`, { row: n }), icon(`${prefix}4`, { row: n })];
const real = () => layoutHeroCards(new HeroCardsRepository().getCards());
const rejects = (cards, pattern) => assert.throws(() => layoutHeroCards(cards), (error) => error instanceof HeroGridLayoutError && error.name === 'HeroGridLayoutError' && pattern.test(error.message), `esperaba un HeroGridLayoutError con ${pattern}`);

// Línea base de la colocación actual (capturada con el motor previo a la feature 1): [id, columna, fila, colSpan, rowSpan].
// Ajuste feature 2 (spec: specs/02_hero-row-new-tools/requirements.md): la fila nueva de herramientas (bash,
// webassembly, astro, opencode, tauri) entra como fila 2 y las redes sociales pasan a la fila 3, así que las
// franjas inferiores cambian de forma legítima (no es una regresión): fila 2 = [bash, webassembly, astro GRANDE,
// opencode, tauri] y fila 3 = [typescript GRANDE, bun, claude, youtube, github] (el patrón alterno mueve typescript al 1.º hueco).
const MAP = [
  ['htb', 6, 1, 5, 4], ['rust', 11, 1, 2, 2], ['aws', 11, 3, 2, 2], ['cloudflare', 6, 5, 2, 2], ['node', 8, 5, 5, 2],
  ['nestjs', 1, 7, 4, 2], ['css', 5, 7, 2, 2], ['react', 7, 7, 2, 2], ['html', 9, 7, 2, 2], ['claude-code', 11, 7, 2, 2],
  ['bash', 1, 9, 2, 2], ['webassembly', 3, 9, 2, 2], ['astro', 5, 9, 4, 2], ['opencode', 9, 9, 2, 2], ['tauri', 11, 9, 2, 2],
  ['typescript', 1, 11, 4, 2], ['bun', 5, 11, 2, 2], ['claude', 7, 11, 2, 2], ['youtube', 9, 11, 2, 2], ['github', 11, 11, 2, 2],
];

test('REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1', () => {
  const base = { id: 'x', title: 'X', colorToken: 'x', icon: '#x', category: 'tech', rotate: 0, scale: 5, iconWidth: '100px' };
  assert.equal(parseHeroCards([{ ...base, row: 3 }])[0].row, 3);
  assert.equal(parseHeroCards([base])[0].row, undefined);
  for (const valor of [0, -1, 1.5, '2', null, true]) {
    assert.throws(() => parseHeroCards([{ ...base, row: valor }]), (error) => error instanceof HeroCardsDataError && error.name === 'HeroCardsDataError' && /hero-cards\.json/.test(error.message) && /\b0\b/.test(error.message), `row=${String(valor)}`);
  }
});
test('REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande', () => {
  const placed = layoutHeroCards([rich(), ...zone()]);
  const byId = Object.fromEntries(placed.map((p) => [p.card.id, p]));
  assert.deepEqual(placed.map((p) => p.card.id), ['htb', 'z0', 'z1', 'z2', 'zf']);
  assert.deepEqual([byId.htb.colSpan, byId.htb.rowSpan], [5, 4]);
  assert.deepEqual([byId.zf.colSpan, byId.zf.rowSpan], [5, 2]);
  for (const id of ['z0', 'z1', 'z2']) assert.deepEqual([byId[id].colSpan, byId[id].rowSpan], [2, 2]);
});
test('REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError', () => {
  rejects([rich(), icon('z0'), icon('z1'), icon('zf', { featured: true })], /zona superior/);
  rejects([rich(), icon('z0'), icon('z1'), icon('zf', { featured: true }), icon('zg', { featured: true })], /featured/);
  rejects([rich(), icon('z0'), icon('z1'), icon('z2'), icon('z3')], /featured/);
});
test('REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande', () => {
  const placed = layoutHeroCards([rich(), ...zone(), ...fila(1, 'a'), ...fila(2, 'b')]);
  const a = placed.filter((p) => p.card.row === 1);
  const b = placed.filter((p) => p.card.row === 2);
  assert.equal(a.length, 5); assert.equal(b.length, 5);
  assert.equal(new Set(a.map((p) => p.row)).size, 1, 'la fila 1 no cae en una sola franja');
  assert.equal(new Set(b.map((p) => p.row)).size, 1, 'la fila 2 no cae en una sola franja');
  assert.deepEqual(a.map((p) => p.card.id), ['a2', 'a0', 'a1', 'a3', 'a4']); // fila impar: el hueco grande primero
  assert.deepEqual(b.map((p) => p.card.id), ['b0', 'b1', 'b2', 'b3', 'b4']); // fila par: el hueco grande en tercera posición
  for (const p of [...a, ...b]) {
    const grande = p.card.id.endsWith('2');
    assert.deepEqual([p.colSpan, p.rowSpan], grande ? [4, 2] : [2, 2], p.card.id);
  }
});
test('REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError', () => {
  rejects([rich(), ...zone(), ...fila(1, 'a').slice(0, 4)], /fila 1/);
  rejects([rich(), ...zone(), ...fila(1, 'a'), icon('x5', { row: 1 })], /fila 1/);
  rejects([rich(), ...zone(), ...fila(1, 'a').map((c) => (c.id === 'a2' ? { ...c, featured: false } : c))], /featured/);
  rejects([rich(), ...zone(), ...fila(1, 'a').map((c) => (c.id === 'a3' ? { ...c, featured: true } : c))], /featured/);
});
test('REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError', () => {
  rejects([rich(), ...zone(), icon('s0', { category: 'social', row: 1 }), ...fila(1, 'a').slice(1), ...fila(2, 'b')], /s0/);
  rejects([rich(), ...zone(), ...fila(1, 'a'), ...fila(2, 'b', true)], /s0|b2/);
});
test('REQ-01-14: la colocación del mosaico es la esperada tras el ajuste de la feature 2 (20 tarjetas)', () => {
  const placed = real();
  assert.deepEqual(placed.map((p) => [p.card.id, p.column, p.row, p.colSpan, p.rowSpan]), MAP);
  // H3 (review): comprobación con contenido en lugar de la aserción tautológica real() vs real().
  assert.equal(placed.length, 20, 'el mosaico debe colocar exactamente 20 tarjetas');
  assert.equal(new Set(placed.map((p) => p.card.id)).size, 20, 'los id de las tarjetas deben ser únicos');
  assert.deepEqual(placed.map((p) => p.card.id), MAP.map(([id]) => id), 'el orden de salida debe ser el del JSON');
});
test('REQ-01-14: hero-cards.json declara "row" en las 15 tarjetas de las franjas inferiores', () => {
  const data = JSON.parse(read('src/data/hero-cards.json'));
  assert.deepEqual(data.filter((c) => c.row !== undefined).map((c) => [c.id, c.row]), [
    ['nestjs', 1], ['css', 1], ['react', 1], ['html', 1], ['claude-code', 1],
    ['bash', 2], ['webassembly', 2], ['astro', 2], ['opencode', 2], ['tauri', 2],
    ['bun', 3], ['claude', 3], ['typescript', 3], ['youtube', 3], ['github', 3],
  ]);
  assert.deepEqual(data.filter((c) => c.row === undefined).map((c) => c.id), ['htb', 'rust', 'aws', 'cloudflare', 'node']);
});
test('higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha', () => {
  const modulos = ['src/domain/hero-grid-layout.ts', 'src/domain/hero-grid-rows.ts', 'src/domain/hero-grid-template.ts', 'src/domain/hero-grid-error.ts', 'src/domain/entities/hero-card.ts', 'src/domain/repositories/hero-cards-parse.ts', 'src/domain/repositories/hero-cards-fields-parse.ts'];
  for (const rel of modulos) {
    assert.ok(read(rel).trimEnd().split('\n').length <= 100, rel);
    assert.doesNotMatch(read(rel), /Math\.random|\bDate\b/, rel);
  }
  assert.match(read('src/components/new-hero/new-hero.astro'), /layoutHeroCards\(\s*new HeroCardsRepository\(\)\.getCards\(\)\s*\)/);
});
