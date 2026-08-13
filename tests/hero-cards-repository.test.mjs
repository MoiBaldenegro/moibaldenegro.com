// Test del dominio de tarjetas del hero (REQ-31-01..08, feature 31 json-repositories-loader).
//
// Verifica contra specs/31_json-repositories-loader/requirements.md:
//   REQ-31-02 — HeroCardsRepository acepta un loader inyectable () => string y el
//               default materializa src/data/hero-cards.json con un import con atributo.
//   REQ-31-03 — el repositorio no importa módulos node ni usa el sufijo ?raw.
//   REQ-31-05 — el default entrega las 12 entidades reales de src/data/hero-cards.json.
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

// Las 12 tarjetas reales actuales (src/data/hero-cards.json, feature 6).
const EXPECTED_CARDS = [
  { id: 'react', title: 'REACT', colorToken: 'react', icon: '/assets/svg/sprite.svg#react', gridColumn: '6 / span 5', gridRow: '1 / span 2', rotate: -8, scale: 5, iconWidth: '165px' },
  { id: 'html', title: 'HTML', colorToken: 'html', icon: '/assets/svg/sprite.svg#html', gridColumn: '11 / span 2', gridRow: '1 / span 2', rotate: -7, scale: 5, iconWidth: '115px' },
  { id: 'node', title: 'NODE JS', colorToken: 'node', icon: '/assets/svg/sprite.svg#node', gridColumn: '6 / span 2', gridRow: '3 / span 2', rotate: -10, scale: 5, iconWidth: '120px' },
  { id: 'github', title: 'GITHUB ACTIONS', colorToken: 'github', icon: '/assets/svg/sprite.svg#github', gridColumn: '8 / span 5', gridRow: '3 / span 2', rotate: -12, scale: 5, iconWidth: '190px' },
  { id: 'youtube', title: 'YOUTUBE', colorToken: 'youtube', icon: '/assets/svg/sprite.svg#youtube', gridColumn: '6 / span 5', gridRow: '5 / span 2', rotate: -8, scale: 5, iconWidth: '170px' },
  { id: 'twitch', title: 'TWITCH', colorToken: 'twitch', icon: '/assets/svg/sprite.svg#twitch', gridColumn: '11 / span 2', gridRow: '5 / span 2', rotate: -8, scale: 5, iconWidth: '115px' },
  { id: 'typescript', title: 'TYPESCRIPT', colorToken: 'typescript', icon: '/assets/svg/sprite.svg#typescript', gridColumn: '1 / span 2', gridRow: '7 / span 2', rotate: -10, scale: 5, iconWidth: '110px' },
  { id: 'css', title: 'CSS', colorToken: 'css', icon: '/assets/svg/sprite.svg#css', gridColumn: '3 / span 2', gridRow: '7 / span 2', rotate: -8, scale: 5, iconWidth: '105px' },
  { id: 'node-bottom', title: 'NODE JS', colorToken: 'node-bottom', icon: '/assets/svg/sprite.svg#node', gridColumn: '5 / span 2', gridRow: '7 / span 2', rotate: -6, scale: 5, iconWidth: '120px' },
  { id: 'github-bottom', title: 'GITHUB ACTIONS', colorToken: 'github-bottom', icon: '/assets/svg/sprite.svg#github', gridColumn: '7 / span 4', gridRow: '7 / span 2', rotate: 0, scale: 5, iconWidth: '165px' },
  { id: 'youtube-bottom', title: 'YOUTUBE', colorToken: 'youtube-bottom', icon: '/assets/svg/sprite.svg#youtube', gridColumn: '11 / span 2', gridRow: '7 / span 2', rotate: -5, scale: 5, iconWidth: '120px' },
  { id: 'twitch-bottom', title: 'TWITCH', colorToken: 'twitch-bottom', icon: '/assets/svg/sprite.svg#twitch', gridColumn: '1 / span 8', gridRow: '9 / span 2', rotate: -6, scale: 5, iconWidth: '170px' },
];

test('REQ-06-01: src/data/hero-cards.json almacena las 12 tarjetas actuales', () => {
  assert.ok(existsSync(DATA_URL), 'src/data/hero-cards.json no existe (REQ-06-01)');
  const data = JSON.parse(readFileSync(DATA_URL, 'utf8'));
  assert.ok(Array.isArray(data), 'src/data/hero-cards.json no es un arreglo (REQ-06-01)');
  assert.equal(data.length, 12, `se esperaban 12 tarjetas, hay ${data.length} (REQ-06-01)`);
  const ids = data.map((card) => card.id).sort();
  assert.deepEqual(
    ids,
    EXPECTED_CARDS.map((card) => card.id).sort(),
    'los ids de las tarjetas no coinciden con los actuales (REQ-06-01)',
  );
});

test('REQ-06-02: la entidad HeroCard tipa las tarjetas con campos readonly', () => {
  assert.ok(existsSync(ENTITY_URL), 'src/domain/entities/hero-card.ts no existe (REQ-06-02)');
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(content, /interface\s+HeroCard\s*\{/, 'falta interface HeroCard (REQ-06-02)');
  for (const field of ['id', 'title', 'colorToken', 'icon', 'gridColumn', 'gridRow', 'rotate', 'scale', 'iconWidth']) {
    assert.match(
      content,
      new RegExp(`readonly\\s+${field}\\s*:`),
      `falta "readonly ${field}" en HeroCard (REQ-06-02)`,
    );
  }
});

test('REQ-31-02/REQ-31-05: el loader por defecto entrega las 12 tarjetas reales', () => {
  const repository = new HeroCardsRepository();
  assert.deepEqual(repository.getCards(), EXPECTED_CARDS, 'las tarjetas entregadas no coinciden');
});

test('REQ-31-02: el repositorio lee a través del loader inyectable, no del filesystem', () => {
  const injectedCard = {
    id: 'injected',
    title: 'INYECTADA',
    colorToken: 'react',
    icon: '/assets/svg/sprite.svg#react',
    gridColumn: '1 / span 1',
    gridRow: '1 / span 1',
    rotate: 0,
    scale: 5,
    iconWidth: '100px',
  };
  const repository = new HeroCardsRepository(() => JSON.stringify([injectedCard]));
  assert.deepEqual(repository.getCards(), [injectedCard], 'el loader inyectado no se usa (REQ-31-02)');
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