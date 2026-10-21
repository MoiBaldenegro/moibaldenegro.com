// Test de la feature 99 hero-os-panel-mosaic (REQ-99-05..18). Spec: specs/99_hero-os-panel-mosaic/ (mapa de design.md).
// Ajuste feature 99 (precedente REQ-43-06): la plantilla y el mapa de la 98 (REQ-98-09/10/15) pasan a las invariantes
// y al mapa de la 99; se conservan REQ-98-11..14. La medida en navegador (REQ-99-19..29) va con Chrome + CDP (impl).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { layoutHeroCards, HeroGridLayoutError } from '../src/domain/hero-grid-layout.ts';
import { HeroCardsRepository } from '../src/domain/repositories/hero-cards-repository.ts';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const icon = (id, category = 'tech', featured = false) => ({ id, kind: 'icon', title: id, colorToken: id, icon: `#${id}`, category, featured, rotate: 0, scale: 5, iconWidth: '100px' });
const big = (id) => icon(id, 'tech', true);
const rich = (id) => ({ id, kind: 'htb', title: id, colorToken: 'htb' });
const techs = (n, prefix = 't') => Array.from({ length: n }, (_, i) => icon(`${prefix}${i}`));
const real = () => layoutHeroCards(new HeroCardsRepository().getCards());
const size = (p) => `${p.colSpan}x${p.rowSpan}`;
const rejects = (cards, pattern) => assert.throws(() => layoutHeroCards(cards),
  (error) => error instanceof HeroGridLayoutError && error.name === 'HeroGridLayoutError' && pattern.test(error.message));

// Mapa del mosaico de design.md: [id, columna, fila, colSpan, rowSpan].
const MAP = [
  ['htb', 6, 1, 5, 4], ['rust', 11, 1, 2, 2], ['aws', 11, 3, 2, 2], ['cloudflare', 6, 5, 2, 2], ['node', 8, 5, 5, 2],
  ['nestjs', 1, 7, 4, 2], ['css', 5, 7, 2, 2], ['react', 7, 7, 2, 2], ['html', 9, 7, 2, 2], ['claude-code', 11, 7, 2, 2],
  ['bun', 1, 9, 2, 2], ['claude', 3, 9, 2, 2], ['typescript', 5, 9, 4, 2], ['youtube', 9, 9, 2, 2], ['github', 11, 9, 2, 2],
];

// Auto-placement disperso de CSS Grid (grid-auto-flow: row), 12 columnas, perfil en 1-5 x 1-6.
function simulate(spans) {
  const taken = new Set();
  const cells = (c, r, w, h) => Array.from({ length: w * h }, (_, i) => `${c + (i % w)},${r + Math.floor(i / w)}`);
  cells(1, 1, 5, 6).forEach((k) => taken.add(k));
  let col = 1; let row = 1;
  const starts = spans.map(([w, h]) => {
    for (;; row++, col = 1) for (; col + w - 1 <= 12; col++) {
      if (cells(col, row, w, h).every((k) => !taken.has(k))) { cells(col, row, w, h).forEach((k) => taken.add(k)); return [col, row]; }
    }
  });
  return { starts, taken };
}
test('REQ-99-05/06: plantilla superior 5x4, 2x2, 2x2, 2x2, 5x2 y filas inferiores 4-2-2-2-2 / 2-2-4-2-2 de alto 2', () => {
  const sizes = layoutHeroCards([rich('htb'), big('f0'), big('f1'), big('f2'), big('f3'), ...techs(15)]).map(size);
  const even = ['4x2', '2x2', '2x2', '2x2', '2x2']; const odd = ['2x2', '2x2', '4x2', '2x2', '2x2'];
  assert.deepEqual(sizes, ['5x4', '2x2', '2x2', '2x2', '5x2', ...even, ...odd, ...even]);
});
test('REQ-99-07/08/09: personalizadas primero, featured en los huecos grandes y pequeños con tech y después redes', () => {
  const input = [icon('yt', 'social'), big('f0'), ...techs(3), rich('htb'), big('f1'), icon('gh', 'social'), ...techs(6, 'u'), big('f2')];
  const ids = layoutHeroCards(input).map((p) => p.card.id);
  assert.deepEqual(ids, ['htb', 't0', 't1', 't2', 'f0', 'f1', 'u0', 'u1', 'u2', 'u3', 'u4', 'u5', 'f2', 'yt', 'gh']);
});
test('REQ-99-10/11/12: HeroGridLayoutError por featured que no cuadran, red featured y casos de REQ-98-12..14', () => {
  rejects([rich('htb'), ...techs(14)], /\b0\b[\s\S]*\b3\b|\b3\b[\s\S]*\b0\b/);
  rejects([rich('htb'), big('a'), big('b'), big('c'), big('d'), ...techs(10)], /\b4\b[\s\S]*\b3\b|\b3\b[\s\S]*\b4\b/);
  rejects([rich('htb'), big('a'), big('b'), big('c'), ...techs(9), icon('gh', 'social', true), icon('yt', 'social')], /\bgh\b/);
  rejects([rich('htb'), ...techs(13)], /\b14\b/);
  rejects([...['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(rich), ...techs(9)], /personalizadas|kind/);
  rejects([rich('htb'), big('a'), big('b'), big('c'), ...techs(2), ...techs(9, 's').map((card) => ({ ...card, category: 'social' }))], /\bs0\b/);
  rejects([rich('htb'), ...techs(2), icon('solo', 'social')], /\bsolo\b/);
});
test('REQ-98-11 / REQ-99-12: columna y fila de inicio = auto-placement de CSS Grid, sin huecos ni solapes', () => {
  for (const placed of [real(), layoutHeroCards([rich('htb'), big('f0'), big('f1'), big('f2'), big('f3'), ...techs(15)])]) {
    const { starts, taken } = simulate(placed.map((p) => [p.colSpan, p.rowSpan]));
    assert.deepEqual(placed.map((p) => [p.column, p.row]), starts);
    const cells = 5 * 6 + placed.reduce((sum, p) => sum + p.colSpan * p.rowSpan, 0);
    const rows = Math.max(...placed.map((p) => p.row + p.rowSpan - 1));
    assert.equal(taken.size, cells, 'hay solapes');
    assert.equal(cells, 12 * rows, `hay huecos en las filas 1-${rows}`);
  }
  assert.equal(Math.max(...real().map((p) => p.row + p.rowSpan - 1)), 10, 'el hero real no ocupa 10 filas');
});
test('REQ-99-13/14: salida real = mapa de design.md, determinista y sin Math.random ni Date', () => {
  assert.deepEqual(real().map((p) => [p.card.id, p.column, p.row, p.colSpan, p.rowSpan]), MAP);
  assert.deepEqual(real(), real());
  for (const rel of ['src/domain/hero-grid-layout.ts', 'src/domain/hero-grid-template.ts']) assert.doesNotMatch(read(rel), /Math\.random|\bDate\b/, rel);
});
test('REQ-99-15/16/17 (Ajuste feature 99, precedente REQ-43-06): invariantes del panel', () => {
  const placed = real(); const last = Math.max(...placed.map((p) => p.row));
  const featured = placed.filter((p) => p.card.kind === 'icon' && p.card.featured);
  assert.deepEqual(featured.map((p) => p.card.id), ['node', 'nestjs', 'typescript']);
  const span = (p, a, b) => [p[a], p[a] + p[b] - 1];
  for (const a of featured) for (const b of featured.filter((x) => x !== a)) {
    const [ra, rb] = [span(a, 'row', 'rowSpan'), span(b, 'row', 'rowSpan')]; const [ca, cb] = [span(a, 'column', 'colSpan'), span(b, 'column', 'colSpan')];
    if (rb[0] <= ra[1] + 1 && ra[0] <= rb[1] + 1) assert.ok(cb[0] > ca[1] || ca[0] > cb[1], `${a.card.id} y ${b.card.id} comparten columna`);
  }
  const widths = [1, 3, 5, 7, 9].map((r) => placed.filter((p) => p.row === r || p.row === r + 1).sort((x, y) => x.row - y.row || x.column - y.column).map((p) => p.colSpan).join('-'));
  widths.slice(1).forEach((w, i) => assert.notEqual(w, widths[i], `filas ${2 * i + 1}-${2 * i + 2} y siguientes con el mismo patrón ${w}`));
  for (const p of placed.filter((x) => x.card.kind === 'icon' && !x.card.featured)) assert.equal(size(p), '2x2', `${p.card.id} no es 2x2`);
  for (const p of placed.filter((x) => x.card.category === 'social')) assert.equal(p.row, last, `${p.card.id} fuera de la última fila`);
  for (const p of placed.filter((x) => x.card.kind !== 'icon')) assert.ok(p.column >= 6 && p.row + p.rowSpan <= 7, `${p.card.id} no va arriba`);
});
test('REQ-99-18: new-hero usa layoutHeroCards y los article emiten data-col-span/data-row-span sin style ni script', () => {
  const hero = read('src/components/new-hero/new-hero.astro');
  assert.match(hero, /layoutHeroCards\(\s*new HeroCardsRepository\(\)\.getCards\(\)\s*\)/);
  for (const rel of ['src/components/new-hero/new-hero.astro', 'src/components/hero-card.astro', 'src/components/hero-cards/htb-card.astro']) {
    assert.doesNotMatch(rel.endsWith('new-hero.astro') ? read(rel).replace(/<script>[^<]*hero-cards-motion\.ts[^<]*<\/script>/, '') : read(rel), /\sstyle=|<script\b/, `${rel} con style inline o script`); // Ajuste feature 115 (precedente REQ-43-06): salvo el <script> del runtime lego (REQ-115-06)
    if (rel !== 'src/components/new-hero/new-hero.astro') assert.match(read(rel).match(/<article\b[^>]*>/)?.[0] ?? '', /\sdata-col-span=\{colSpan\}\sdata-row-span=\{rowSpan\}\sdata-show-on-mobile=\{card\.showOnMobile \? 'true' : undefined\}>/, rel); // Ajuste feature 106 (precedente REQ-43-06): atributo condicional (REQ-106-08/18)
  }
  for (const rel of ['tests/hero-mosaic-layout.test.mjs', 'src/domain/hero-grid-layout.ts', 'src/domain/hero-grid-template.ts']) assert.ok(read(rel).split('\n').length <= 100, rel);
});
