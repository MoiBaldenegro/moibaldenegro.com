// Test de la feature 3 hero-cards-swap-positions (REQ-03-01..12). Spec: specs/03_hero-cards-swap-positions/
// (requirements.md + design.md). Análisis y MAP: progress/research/hero-cards-swap-positions.md. node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutHeroCards } from '../src/domain/hero-grid-layout.ts';
import { HeroCardsRepository } from '../src/domain/repositories/hero-cards-repository.ts';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const data = () => JSON.parse(read('src/data/hero-cards.json'));
const placed = () => layoutHeroCards(new HeroCardsRepository().getCards());
const ORDEN = ['htb', 'rust', 'aws', 'cloudflare', 'nestjs', 'node', 'tauri', 'react', 'opencode', 'claude-code',
  'bash', 'webassembly', 'astro', 'html', 'css', 'bun', 'claude', 'typescript', 'youtube', 'github'];
const ROWS = { htb: undefined, rust: undefined, aws: undefined, cloudflare: undefined, nestjs: undefined,
  node: 1, tauri: 1, react: 1, opencode: 1, 'claude-code': 1, bash: 2, webassembly: 2, astro: 2, html: 2, css: 2,
  bun: 3, claude: 3, typescript: 3, youtube: 3, github: 3 };
// Snapshot literal de las propiedades no posicionales de las seis tarjetas intercambiadas (antes del cambio).
const SNAPSHOT = {
  css: { title: 'CSS', colorToken: 'css', icon: '/assets/svg/sprite.svg#css', category: 'tech', featured: undefined, rotate: -8, scale: 5, iconWidth: '105px', showOnMobile: false, href: null },
  tauri: { title: 'TAURI', colorToken: 'tauri', icon: '/assets/svg/sprite.svg#tauri', category: 'tech', featured: undefined, rotate: -8, scale: 5, iconWidth: '115px', showOnMobile: false, href: null },
  html: { title: 'HTML', colorToken: 'html', icon: '/assets/svg/sprite.svg#html', category: 'tech', featured: undefined, rotate: -7, scale: 5, iconWidth: '115px', showOnMobile: false, href: null },
  opencode: { title: 'OPENCODE', colorToken: 'opencode', icon: '/assets/svg/sprite.svg#opencode', category: 'tech', featured: undefined, rotate: 0, scale: 5, iconWidth: '110px', showOnMobile: false, href: null },
  node: { title: 'NODE JS', colorToken: 'node', icon: '/assets/svg/sprite.svg#node', category: 'tech', featured: true, rotate: -10, scale: 5, iconWidth: '165px', showOnMobile: false, href: null },
  nestjs: { title: 'NESTJS', colorToken: 'nestjs', icon: '/assets/svg/sprite.svg#nestjs', category: 'tech', featured: true, rotate: -5, scale: 5, iconWidth: '160px', showOnMobile: false, href: null },
};
const CAMPOS = Object.keys(SNAPSHOT.css);
const MAP = [
  ['htb', 6, 1, 5, 4], ['rust', 11, 1, 2, 2], ['aws', 11, 3, 2, 2], ['cloudflare', 6, 5, 2, 2], ['nestjs', 8, 5, 5, 2],
  ['node', 1, 7, 4, 2], ['tauri', 5, 7, 2, 2], ['react', 7, 7, 2, 2], ['opencode', 9, 7, 2, 2], ['claude-code', 11, 7, 2, 2],
  ['bash', 1, 9, 2, 2], ['webassembly', 3, 9, 2, 2], ['astro', 5, 9, 4, 2], ['html', 9, 9, 2, 2], ['css', 11, 9, 2, 2],
  ['typescript', 1, 11, 4, 2], ['bun', 5, 11, 2, 2], ['claude', 7, 11, 2, 2], ['youtube', 9, 11, 2, 2], ['github', 11, 11, 2, 2],
];
const filaOrdenada = (n) => placed().filter((p) => p.card.row === n).sort((a, b) => a.column - b.column).map((p) => p.card.id);

test('REQ-03-01..06/08: el array de hero-cards.json queda en el orden final con su "row"', () => {
  const cards = data();
  assert.deepEqual(cards.map((c) => c.id), ORDEN);
  for (const card of cards) assert.equal(card.row, ROWS[card.id], card.id);
  assert.equal(Object.hasOwn(cards.find((c) => c.id === 'nestjs'), 'row'), false, 'nestjs no declara "row"');
});
test('REQ-03-07: las seis tarjetas intercambiadas conservan sus propiedades no posicionales', () => {
  const porId = Object.fromEntries(data().map((c) => [c.id, c]));
  for (const [id, esperado] of Object.entries(SNAPSHOT)) {
    const actual = Object.fromEntries(CAMPOS.map((k) => [k, porId[id][k]]));
    assert.deepEqual(actual, esperado, id);
  }
});
test('REQ-03-09/10: nestjs ocupa el hueco grande de la zona superior y node el de la fila 1', () => {
  const porId = Object.fromEntries(placed().map((p) => [p.card.id, p]));
  assert.deepEqual([porId.nestjs.column, porId.nestjs.row, porId.nestjs.colSpan, porId.nestjs.rowSpan], [8, 5, 5, 2]);
  assert.deepEqual([porId.node.column, porId.node.row, porId.node.colSpan, porId.node.rowSpan], [1, 7, 4, 2]);
});
test('REQ-03-11/12: filas 1 y 2 de izquierda a derecha y colocación completa según el MAP', () => {
  assert.deepEqual(filaOrdenada(1), ['node', 'tauri', 'react', 'opencode', 'claude-code']);
  assert.deepEqual(filaOrdenada(2), ['bash', 'webassembly', 'astro', 'html', 'css']);
  assert.deepEqual(placed().map((p) => [p.card.id, p.column, p.row, p.colSpan, p.rowSpan]), MAP);
});
test('higiene: el test y los datos de la feature 3 no superan las 100 líneas', () => {
  for (const rel of ['src/data/hero-cards.json', 'tests/hero-cards-swap-positions.test.mjs']) {
    assert.ok(read(rel).trimEnd().split('\n').length <= 100, rel);
  }
});
