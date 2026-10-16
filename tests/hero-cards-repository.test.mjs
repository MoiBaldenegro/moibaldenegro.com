// Test del dominio de tarjetas del hero (REQ-31-01..08, feature 31 json-repositories-loader).
//
// Verifica contra specs/31_json-repositories-loader/requirements.md:
//   REQ-31-02 — HeroCardsRepository acepta un loader inyectable () => string y el
//               default materializa src/data/hero-cards.json con un import con atributo.
//   REQ-31-03 — el repositorio no importa módulos node ni usa el sufijo ?raw.
//   REQ-31-05 — el default entrega las entidades reales de src/data/hero-cards.json.
//   REQ-31-06 — loader que lanza, JSON inválido o forma inválida → HeroCardsDataError.
//   REQ-31-08 — el repositorio no supera las 100 líneas.
// Conserva los asserts de datos reales de la feature 6 (REQ-06-01/02/04) con node:fs:
// la restricción del humano es sobre src/, no sobre tests/ (informe
// progress/research/lectura-json-sin-nodefs.md, sección 2.4).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  HeroCardsRepository,
  HeroCardsDataError,
} from '../src/domain/repositories/hero-cards-repository.ts';

const DATA_URL = new URL('../src/data/hero-cards.json', import.meta.url);
const ENTITY_URL = new URL('../src/domain/entities/hero-card.ts', import.meta.url);
const REPOSITORY_URL = new URL(
  '../src/domain/repositories/hero-cards-repository.ts',
  import.meta.url,
);
const TOKENS_URL = new URL('../src/styles/tokens.css', import.meta.url);

// Ajuste feature 98 (precedente REQ-43-06; antes: 12 de icono + 1 htb fijas, features 6/90/92/97): el
// número y el orden salen de specs/98_hero-mosaic-layout/design.md (tests/hero-cards-unique-tech.test.mjs);
// aquí quedan invariantes: tarjetas de icono + ricas, ids únicos y getCards() fiel al JSON.
test('REQ-06-01: src/data/hero-cards.json almacena tarjetas de icono y ricas con ids únicos', () => {
  assert.ok(existsSync(DATA_URL), 'src/data/hero-cards.json no existe (REQ-06-01)');
  const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
  assert.ok(Array.isArray(data) && data.length > 0, 'src/data/hero-cards.json no es un arreglo con tarjetas (REQ-06-01)');
  assert.ok(data.some((card) => card.kind === undefined), 'no hay tarjetas de icono (REQ-06-01)');
  assert.equal(data.filter((card) => card.kind === 'htb').length, 1, 'se esperaba 1 tarjeta htb (REQ-92-01)');
  assert.equal(new Set(data.map((card) => card.id)).size, data.length, 'hay ids repetidos (REQ-06-01)');
});

test('REQ-06-02: la entidad HeroCard tipa las tarjetas con campos readonly', () => {
  assert.ok(existsSync(ENTITY_URL), 'src/domain/entities/hero-card.ts no existe (REQ-06-02)');
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(content, /interface\s+HeroCard\s*\{/, 'falta interface HeroCard (REQ-06-02)');
  // Ajuste feature 98 (precedente REQ-43-06): sin gridColumn/gridRow, con category (REQ-98-05/06).
  for (const field of ['id', 'title', 'colorToken', 'icon', 'category', 'rotate', 'scale', 'iconWidth']) {
    assert.match(
      content,
      new RegExp(`readonly\\s+${field}\\s*:`),
      `falta "readonly ${field}" en HeroCard (REQ-06-02)`,
    );
  }
});

test('REQ-31-02/REQ-31-05: el loader por defecto entrega las tarjetas reales del JSON', () => {
  const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
  // Ajuste feature 99 (precedente REQ-43-06): las de icono salen con featured (false por defecto, REQ-99-03).
  const expected = data.map((card) => (card.kind === undefined ? { kind: 'icon', category: 'tech', featured: false, ...card } : card));
  assert.deepEqual(new HeroCardsRepository().getCards(), expected, 'las tarjetas entregadas no coinciden');
});

test('REQ-31-02: el repositorio lee a través del loader inyectable, no del filesystem', () => {
  const injectedCard = {
    id: 'injected',
    title: 'INYECTADA',
    colorToken: 'react',
    icon: '/assets/svg/sprite.svg#react',
    category: 'social',
    rotate: 0,
    scale: 5,
    iconWidth: '100px',
  };
  const repository = new HeroCardsRepository(() => JSON.stringify([injectedCard]));
  assert.deepEqual(repository.getCards(), [{ ...injectedCard, kind: 'icon', featured: false }], 'el loader inyectado no se usa (REQ-31-02)');
});

test('REQ-06-04: los datos referencian el color por colorToken sin valores hex', () => {
  const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
  for (const card of data) {
    assert.ok(
      typeof card.colorToken === 'string' && card.colorToken.length > 0,
      `la tarjeta "${card.id}" no tiene un colorToken (REQ-06-04)`,
    );
    assert.ok(
      !('background' in card),
      `la tarjeta "${card.id}" conserva el campo background hex (REQ-06-04)`,
    );
  }
  const tokens = readFileSync(TOKENS_URL, 'utf8');
  for (const card of data) {
    assert.match(
      tokens,
      new RegExp(`--color-marca-${card.colorToken}\\s*:`),
      `no existe el token --color-marca-${card.colorToken} en tokens.css (REQ-06-04)`,
    );
  }
  const raw = readFileSync(DATA_URL, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    raw,
    /#[0-9a-fA-F]{3,8}\b/,
    'hero-cards.json contiene un valor hex hardcodeado (REQ-06-04)',
  );
});

test('REQ-31-06: loader que lanza (archivo ausente) → HeroCardsDataError', () => {
  const repository = new HeroCardsRepository(() => {
    throw new Error('ENOENT: no such file or directory');
  });
  assert.throws(() => repository.getCards(), HeroCardsDataError);
});

test('REQ-31-06: contenido malformado (JSON inválido) → HeroCardsDataError', () => {
  const repository = new HeroCardsRepository(() => '{ esto no es JSON');
  assert.throws(() => repository.getCards(), HeroCardsDataError);
});

test('REQ-31-06: forma inválida (no es un arreglo) → HeroCardsDataError', () => {
  const repository = new HeroCardsRepository(() => JSON.stringify({ cards: 'no es un arreglo' }));
  assert.throws(() => repository.getCards(), HeroCardsDataError);
});

test('REQ-31-06: con una tarjeta inválida el repositorio lanza HeroCardsDataError', () => {
  const badCard = JSON.stringify([{ id: 42, title: 'SIN TIPO' }]);
  const repository = new HeroCardsRepository(() => badCard);
  assert.throws(() => repository.getCards(), HeroCardsDataError);
});

test('REQ-31-03: el repositorio no importa módulos node ni usa el sufijo ?raw', () => {
  const content = readFileSync(REPOSITORY_URL, 'utf8');
  assert.doesNotMatch(
    content,
    /from\s*['"]node:/,
    'el repositorio importa un módulo node (REQ-31-03)',
  );
  assert.doesNotMatch(content, /\?raw/, 'el repositorio usa el sufijo ?raw (REQ-31-03)');
});

test('REQ-31-08: entidad y repositorio no superan las 100 líneas', () => {
  for (const [url, label] of [
    [ENTITY_URL, 'hero-card.ts'],
    [REPOSITORY_URL, 'hero-cards-repository.ts'],
  ]) {
    const lineCount = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-31-08)`);
  }
});