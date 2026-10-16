// Test de los tipos de tarjeta del grid del hero (REQ-90-01..10, feature 90 hero-card-kinds-domain).
//   REQ-90-01/02/03 catálogo y entidades · REQ-90-04/05 getCards() en orden, kind ausente = icon ·
//   REQ-90-06/07 errores · REQ-90-08/09 parser extraído y JSON · REQ-98-06/07 category · REQ-99-02..04 featured.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { HERO_CARD_KINDS } from '../src/domain/entities/hero-card.ts';
import { HeroCardsRepository, HeroCardsDataError } from '../src/domain/repositories/hero-cards-repository.ts';

const ENTITY_URL = new URL('../src/domain/entities/hero-card.ts', import.meta.url);
const PARSE_URL = new URL('../src/domain/repositories/hero-cards-parse.ts', import.meta.url);
const REPOSITORY_URL = new URL('../src/domain/repositories/hero-cards-repository.ts', import.meta.url);
const DATA_URL = new URL('../src/data/hero-cards.json', import.meta.url);

// Ajuste feature 98 (precedente REQ-43-06): sin gridColumn/gridRow (REQ-98-05), con category (REQ-98-06/07).
// Ajuste feature 99 (precedente REQ-43-06): el parseo entrega featured (false por defecto, REQ-99-03).
const ICON = {
  id: 'react', title: 'REACT', colorToken: 'react', icon: '/assets/svg/sprite.svg#react',
  category: 'tech', featured: false, rotate: 0, scale: 5, iconWidth: '100px',
};
const RICH = { id: 'htb', kind: 'htb', title: 'HACK THE BOX', colorToken: 'htb' };
const repositoryWith = (cards) => new HeroCardsRepository(() => JSON.stringify(cards));
const lineCount = (url) => readFileSync(url, 'utf8').split('\n').length;

test('REQ-90-01: hero-card.ts exporta HERO_CARD_KINDS (icon, htb) y HeroCardKind', () => {
  assert.deepEqual([...HERO_CARD_KINDS], ['icon', 'htb'], 'HERO_CARD_KINDS no es [icon, htb]');
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(content, /export\s+const\s+HERO_CARD_KINDS\b/, 'falta export const HERO_CARD_KINDS');
  assert.match(content, /export\s+type\s+HeroCardKind\s*=\s*\(\s*typeof\s+HERO_CARD_KINDS\s*\)\s*\[\s*number\s*\]/, 'HeroCardKind no se deriva de HERO_CARD_KINDS');
});

test('REQ-90-02 / REQ-98-05: HeroCard declara sus campos readonly con kind icon y category, sin celda', () => {
  const content = readFileSync(ENTITY_URL, 'utf8');
  const body = content.match(/interface\s+HeroCard\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.doesNotMatch(content, /gridColumn|gridRow/, 'la entidad sigue declarando gridColumn/gridRow (REQ-98-05)');
  assert.match(body, /readonly\s+category\s*:\s*HeroCardCategory\b/, 'HeroCard sin readonly category');
  for (const field of ['id', 'title', 'colorToken', 'icon', 'rotate', 'scale', 'iconWidth']) {
    assert.match(body, new RegExp(`readonly\\s+${field}\\s*:`), `HeroCard sin readonly ${field}`);
  }
  assert.match(body, /readonly\s+kind\s*:\s*['"]icon['"]/, 'HeroCard sin readonly kind: icon');
});

test('REQ-90-03: HeroRichCard declara sus campos readonly con kind distinto de icon', () => {
  const content = readFileSync(ENTITY_URL, 'utf8');
  const body = content.match(/interface\s+HeroRichCard\s*\{([^}]*)\}/)?.[1] ?? '';
  for (const field of ['id', 'title', 'colorToken']) {
    assert.match(body, new RegExp(`readonly\\s+${field}\\s*:\\s*string`), `HeroRichCard sin ${field}`);
  }
  assert.match(body, /readonly\s+kind\s*:\s*Exclude<\s*HeroCardKind\s*,\s*['"]icon['"]\s*>/, 'HeroRichCard.kind no excluye icon');
  assert.match(content, /export\s+type\s+HeroGridCard\s*=\s*HeroCard\s*\|\s*HeroRichCard/, 'falta la unión HeroGridCard (REQ-90-04)');
});

test('REQ-90-04/05: getCards() respeta el orden del JSON; sin kind sale como icon', () => {
  const cards = repositoryWith([ICON, RICH, { ...ICON, id: 'html' }]).getCards();
  assert.deepEqual(cards, [{ ...ICON, kind: 'icon' }, RICH, { ...ICON, id: 'html', kind: 'icon' }]);
});

test('REQ-90-04: una entrada con kind icon explícito sale como HeroCard', () => {
  assert.deepEqual(repositoryWith([{ ...ICON, kind: 'icon' }]).getCards(), [{ ...ICON, kind: 'icon' }]);
});

test('REQ-90-06: kind desconocido → HeroCardsDataError con índice y valor', () => {
  assert.throws(() => repositoryWith([ICON, { ...RICH, kind: 'marciano' }]).getCards(),
    (error) => error instanceof HeroCardsDataError && /\b1\b/.test(error.message) && error.message.includes('marciano'),
  );
});

test('REQ-90-07: tarjeta htb sin colorToken → HeroCardsDataError con índice y campo', () => {
  const { colorToken, ...withoutToken } = RICH;
  assert.throws(() => repositoryWith([ICON, ICON, withoutToken]).getCards(),
    (error) => error instanceof HeroCardsDataError && /\b2\b/.test(error.message) && error.message.includes('colorToken'),
  );
});

test('REQ-90-07: cada campo de texto de la tarjeta rica es obligatorio', () => {
  for (const field of ['id', 'title', 'colorToken']) {
    const repository = repositoryWith([{ ...RICH, [field]: 7 }]);
    assert.throws(
      () => repository.getCards(),
      (error) => error instanceof HeroCardsDataError && error.message.includes(field),
      `falta la validación del campo ${field}`,
    );
  }
});

test('REQ-90-08: hero-cards-parse.ts existe y parser y repositorio tienen <=100 líneas', () => {
  assert.ok(existsSync(PARSE_URL), 'falta src/domain/repositories/hero-cards-parse.ts');
  assert.match(readFileSync(PARSE_URL, 'utf8'), /HeroCardsDataError/, 'el parser no lanza HeroCardsDataError');
  assert.match(readFileSync(REPOSITORY_URL, 'utf8'), /from\s+['"]\.\/hero-cards-parse\.ts['"]/);
  for (const url of [PARSE_URL, REPOSITORY_URL]) {
    assert.ok(lineCount(url) <= 100, `${url.pathname} supera las 100 líneas`);
  }
});

// Ajuste feature 92 (REQ-92-14, precedente REQ-43-06): el JSON gana la tarjeta rica htb (REQ-92-01).
// Ajuste feature 98 (precedente REQ-43-06): sin recuento fijo; las de icono siguen sin campo kind.
test('REQ-90-09: las tarjetas de icono de hero-cards.json no declaran kind ni celda', () => {
  const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
  const icons = data.filter((card) => card.id !== 'htb');
  assert.equal(data.length, icons.length + 1);
  for (const card of icons) assert.ok(!('kind' in card), `la tarjeta ${card.id} declara kind`);
  for (const card of data) assert.ok(!('gridColumn' in card) && !('gridRow' in card), `${card.id} declara celda (REQ-98-05)`);
});

test('REQ-98-06/07: category ausente sale como tech; un valor fuera de tech/social lanza con índice y campo', () => {
  const { category, ...withoutCategory } = ICON;
  assert.deepEqual(repositoryWith([withoutCategory]).getCards(), [{ ...ICON, kind: 'icon' }]);
  assert.equal(repositoryWith([{ ...ICON, category: 'social' }]).getCards()[0].category, 'social');
  assert.throws(
    () => repositoryWith([ICON, { ...ICON, category: 'juego' }]).getCards(),
    (error) => error instanceof HeroCardsDataError && /\b1\b/.test(error.message) && error.message.includes('category'),
  );
});

test('REQ-99-02/03/04: HeroCard declara featured boolean; omitido = false; no booleano lanza con índice y campo', () => {
  const body = readFileSync(ENTITY_URL, 'utf8').match(/interface\s+HeroCard\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(body, /readonly\s+featured\s*:\s*boolean\s*;/, 'HeroCard sin readonly featured: boolean');
  const { featured, ...withoutFeatured } = ICON;
  assert.deepEqual(repositoryWith([withoutFeatured]).getCards(), [{ ...ICON, kind: 'icon', featured: false }]);
  assert.equal(repositoryWith([{ ...ICON, featured: true }]).getCards()[0].featured, true);
  for (const bad of ['true', 1, null]) {
    assert.throws(() => repositoryWith([ICON, { ...ICON, featured: bad }]).getCards(),
      (error) => error instanceof HeroCardsDataError && /\b1\b/.test(error.message) && error.message.includes('featured'), String(bad));
  }
});
