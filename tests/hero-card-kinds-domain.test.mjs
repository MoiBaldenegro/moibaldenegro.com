// Test de los tipos de tarjeta del grid del hero (REQ-90-01..10, feature 90
// hero-card-kinds-domain). Spec: specs/90_hero-card-kinds-domain/requirements.md.
//   REQ-90-01/02/03 — catálogo HERO_CARD_KINDS, HeroCardKind, HeroCard con kind
//                     icon y HeroRichCard en src/domain/entities/hero-card.ts.
//   REQ-90-04/05    — getCards() entrega la unión HeroGridCard en el orden del
//                     JSON; kind ausente = icon.
//   REQ-90-06/07    — kind desconocido o campo de texto ausente → HeroCardsDataError.
//   REQ-90-08/09    — parser extraído a hero-cards-parse.ts (<=100 líneas) y
//                     hero-cards.json con las 12 tarjetas de icono sin kind.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { HERO_CARD_KINDS } from '../src/domain/entities/hero-card.ts';
import {
  HeroCardsRepository,
  HeroCardsDataError,
} from '../src/domain/repositories/hero-cards-repository.ts';

const ENTITY_URL = new URL('../src/domain/entities/hero-card.ts', import.meta.url);
const PARSE_URL = new URL('../src/domain/repositories/hero-cards-parse.ts', import.meta.url);
const REPOSITORY_URL = new URL('../src/domain/repositories/hero-cards-repository.ts', import.meta.url);
const DATA_URL = new URL('../src/data/hero-cards.json', import.meta.url);

const ICON = {
  id: 'react', title: 'REACT', colorToken: 'react', icon: '/assets/svg/sprite.svg#react',
  gridColumn: '1 / span 2', gridRow: '1 / span 2', rotate: 0, scale: 5, iconWidth: '100px',
};
const RICH = {
  id: 'htb', kind: 'htb', title: 'HACK THE BOX', colorToken: 'htb',
  gridColumn: '9 / span 4', gridRow: '9 / span 2',
};
const repositoryWith = (cards) => new HeroCardsRepository(() => JSON.stringify(cards));
const lineCount = (url) => readFileSync(url, 'utf8').split('\n').length;

test('REQ-90-01: hero-card.ts exporta HERO_CARD_KINDS (icon, htb) y HeroCardKind', () => {
  assert.deepEqual([...HERO_CARD_KINDS], ['icon', 'htb'], 'HERO_CARD_KINDS no es [icon, htb]');
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(content, /export\s+const\s+HERO_CARD_KINDS\b/, 'falta export const HERO_CARD_KINDS');
  assert.match(
    content,
    /export\s+type\s+HeroCardKind\s*=\s*\(\s*typeof\s+HERO_CARD_KINDS\s*\)\s*\[\s*number\s*\]/,
    'HeroCardKind no se deriva de HERO_CARD_KINDS (REQ-90-01)',
  );
});

test('REQ-90-02: HeroCard conserva sus 9 campos readonly y añade readonly kind: icon', () => {
  const content = readFileSync(ENTITY_URL, 'utf8');
  const body = content.match(/interface\s+HeroCard\s*\{([^}]*)\}/)?.[1] ?? '';
  for (const field of ['id', 'title', 'colorToken', 'icon', 'gridColumn', 'gridRow', 'rotate', 'scale', 'iconWidth']) {
    assert.match(body, new RegExp(`readonly\\s+${field}\\s*:`), `HeroCard sin readonly ${field}`);
  }
  assert.match(body, /readonly\s+kind\s*:\s*['"]icon['"]/, 'HeroCard sin readonly kind: icon');
});

test('REQ-90-03: HeroRichCard declara sus 6 campos readonly con kind distinto de icon', () => {
  const content = readFileSync(ENTITY_URL, 'utf8');
  const body = content.match(/interface\s+HeroRichCard\s*\{([^}]*)\}/)?.[1] ?? '';
  for (const field of ['id', 'title', 'colorToken', 'gridColumn', 'gridRow']) {
    assert.match(body, new RegExp(`readonly\\s+${field}\\s*:\\s*string`), `HeroRichCard sin ${field}`);
  }
  assert.match(
    body,
    /readonly\s+kind\s*:\s*Exclude<\s*HeroCardKind\s*,\s*['"]icon['"]\s*>/,
    'HeroRichCard.kind no excluye icon de HeroCardKind (REQ-90-03)',
  );
  assert.match(
    content,
    /export\s+type\s+HeroGridCard\s*=\s*HeroCard\s*\|\s*HeroRichCard/,
    'falta la unión HeroGridCard (REQ-90-04)',
  );
});

test('REQ-90-04/05: getCards() respeta el orden del JSON; sin kind sale como icon', () => {
  const cards = repositoryWith([ICON, RICH, { ...ICON, id: 'html' }]).getCards();
  assert.deepEqual(cards, [
    { ...ICON, kind: 'icon' },
    RICH,
    { ...ICON, id: 'html', kind: 'icon' },
  ]);
});

test('REQ-90-04: una entrada con kind icon explícito sale como HeroCard', () => {
  assert.deepEqual(repositoryWith([{ ...ICON, kind: 'icon' }]).getCards(), [{ ...ICON, kind: 'icon' }]);
});

test('REQ-90-06: kind desconocido → HeroCardsDataError con índice y valor', () => {
  const repository = repositoryWith([ICON, { ...RICH, kind: 'marciano' }]);
  assert.throws(
    () => repository.getCards(),
    (error) => error instanceof HeroCardsDataError && /\b1\b/.test(error.message) && error.message.includes('marciano'),
  );
});

test('REQ-90-07: tarjeta htb sin gridRow → HeroCardsDataError con índice y campo', () => {
  const { gridRow, ...withoutRow } = RICH;
  const repository = repositoryWith([ICON, ICON, withoutRow]);
  assert.throws(
    () => repository.getCards(),
    (error) => error instanceof HeroCardsDataError && /\b2\b/.test(error.message) && error.message.includes('gridRow'),
  );
});

test('REQ-90-07: cada campo de texto de la tarjeta rica es obligatorio', () => {
  for (const field of ['id', 'title', 'colorToken', 'gridColumn', 'gridRow']) {
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

// Ajuste feature 92 (REQ-92-14, petición humana 2026-10-14, precedente REQ-43-06): el JSON gana
// la tarjeta rica htb (REQ-92-01); las 12 de icono siguen sin campo kind.
test('REQ-90-09: hero-cards.json conserva las 12 tarjetas de icono sin campo kind', () => {
  const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
  const icons = data.filter((card) => card.id !== 'htb');
  assert.equal(data.length, 13);
  assert.equal(icons.length, 12);
  for (const card of icons) assert.ok(!('kind' in card), `la tarjeta ${card.id} declara kind`);
});
