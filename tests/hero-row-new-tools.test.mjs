// Test de la feature 2 hero-row-new-tools (REQ-02-01..07 y REQ-02-12). Spec: specs/02_hero-row-new-tools/
// (requirements.md + design.md). node:test, sin dependencias. La parte de estilos (REQ-02-08..11) vive en
// tests/hero-row-new-tools-styles.test.mjs: el límite de 100 líneas por archivo no cabía en un solo test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { layoutHeroCards } from '../src/domain/hero-grid-layout.ts';
import { HeroCardsRepository } from '../src/domain/repositories/hero-cards-repository.ts';
const ROOT = fileURLToPath(new URL('..', import.meta.url));
const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const lineas = (rel) => read(rel).trimEnd().split('\n');
const MARCAS = ['bash', 'webassembly', 'astro', 'opencode', 'tauri'];
const PEQUENAS = MARCAS.filter((m) => m !== 'astro');
const data = () => JSON.parse(read('src/data/hero-cards.json'));
const placed = () => layoutHeroCards(new HeroCardsRepository().getCards());
test('REQ-02-01/02/03/04: las cinco tarjetas de la fila nueva declaran sprite, colorToken, row 2, featured solo en astro y showOnMobile false', () => {
  const nuevas = data().filter((c) => MARCAS.includes(c.id));
  assert.deepEqual(nuevas.map((c) => c.id), MARCAS);
  for (const card of nuevas) {
    assert.equal(card.icon, `/assets/svg/sprite.svg#${card.id}`);
    assert.equal(card.colorToken, card.id);
    assert.equal(card.row, 2);
    assert.equal(card.category, 'tech');
    assert.equal(card.showOnMobile, false);
    assert.equal(card.href, null);
    assert.equal(typeof card.rotate, 'number');
    assert.equal(typeof card.scale, 'number');
    assert.equal(typeof card.iconWidth, 'string');
  }
  assert.deepEqual(nuevas.filter((c) => c.featured).map((c) => c.id), ['astro']);
});
test('REQ-02-01: el repositorio expone la fila nueva y las redes sociales pasan a row 3', () => {
  const porId = Object.fromEntries(new HeroCardsRepository().getCards().map((c) => [c.id, c]));
  for (const marca of MARCAS) {
    assert.equal(porId[marca].row, 2);
    assert.equal(porId[marca].featured, marca === 'astro');
    assert.equal(porId[marca].showOnMobile, false);
    assert.equal(porId[marca].icon, `/assets/svg/sprite.svg#${marca}`);
  }
  const porFila = (n) => data().filter((c) => c.row === n).map((c) => c.id);
  assert.deepEqual(porFila(1), ['nestjs', 'css', 'react', 'html', 'claude-code']);
  assert.deepEqual(porFila(3), ['bun', 'claude', 'typescript', 'youtube', 'github']);
});
test('REQ-02-05/06/07: la fila 2 del mosaico contiene las cinco marcas con astro en el hueco grande', () => {
  const fila = placed().filter((p) => p.card.row === 2);
  assert.deepEqual(fila.map((p) => p.card.id), MARCAS);
  const porId = Object.fromEntries(fila.map((p) => [p.card.id, p]));
  assert.deepEqual([porId.astro.colSpan, porId.astro.rowSpan], [4, 2]);
  for (const marca of PEQUENAS) assert.deepEqual([porId[marca].colSpan, porId[marca].rowSpan], [2, 2], marca);
  assert.equal(new Set(fila.map((p) => p.row)).size, 1, 'la fila 2 debe caer en una sola franja');
  const columnas = [...fila].sort((a, b) => a.column - b.column);
  assert.equal(columnas[0].column, 1, 'la franja empieza en la columna 1');
  assert.equal(columnas.at(-1).column + columnas.at(-1).colSpan - 1, 12, 'la franja llega a la columna 12');
  assert.equal(columnas.reduce((suma, p) => suma + p.colSpan, 0), 12, 'la franja ocupa las 12 columnas');
});
test('REQ-02-12: el sprite no ha cambiado y contiene los cinco symbols nuevos', (t) => {
  const sprite = read('public/assets/svg/sprite.svg');
  for (const marca of MARCAS) assert.match(sprite, new RegExp(`<symbol id="${marca}"`), marca);
  const git = spawnSync('git', ['diff', '--quiet', 'HEAD', '--', 'public/assets/svg/sprite.svg'], { cwd: ROOT });
  if (git.error) { t.skip('git no disponible en este entorno'); return; }
  assert.equal(git.status, 0, 'public/assets/svg/sprite.svg no debe cambiar');
});
test('higiene: hero-card.astro importa la hoja nueva y ningún archivo tocado pasa de 100 líneas', () => {
  assert.match(read('src/components/hero-card.astro'), /import "\.\.\/styles\/hero-card-brands\.css"/);
  for (const rel of ['src/styles/tokens.css', 'src/styles/hero-card.css', 'src/styles/hero-card-brands.css', 'src/components/hero-card.astro', 'src/data/hero-cards.json', 'tests/hero-row-new-tools.test.mjs', 'tests/hero-row-new-tools-styles.test.mjs']) {
    assert.ok(lineas(rel).length <= 100, rel);
  }
});
