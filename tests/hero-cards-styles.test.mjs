import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Test de estilos de tarjetas y perfil del hero (REQ-04-01..05, feature 4 hero-cards-styles).
//
// Verifica contra specs/04_hero-cards-styles/requirements.md y design.md:
//   REQ-04-01 — las hojas existen y se importan desde sus componentes.
//   REQ-04-02 — hero-card.css asigna el fondo por data-color-token para cada
//               token de marca de las tarjetas (Decisión 1 del design.md).
//   REQ-04-03 — ambas hojas consumen únicamente tokens (sin hex/rgba sueltos).
//   REQ-04-04 — ambas hojas respetan el límite de 100 líneas.
//   REQ-04-05 — src/styles/hero.css ya no existe (Decisión 3: eliminada).
//   design.md Decisión 2 — hero-card.astro no tiene atributo style y las
//               posiciones de grid salen de la hoja vía --card-column/--card-row.

const HERO_CARD_CSS = new URL('../src/styles/hero-card.css', import.meta.url);
const PROFILE_CARD_CSS = new URL('../src/styles/profile-card.css', import.meta.url);
const HERO_CSS = new URL('../src/styles/hero.css', import.meta.url);
const HERO_CARD_ASTRO = new URL('../src/components/hero-card.astro', import.meta.url);
const NEW_HERO_ASTRO = new URL('../src/components/new-hero/new-hero.astro', import.meta.url);

// Tokens de marca de las 12 tarjetas (REQ-04-02), en correspondencia con
// --color-marca-* de tokens.css (feature 2).
const CARD_TOKENS = [
  'react', 'html', 'node', 'github', 'youtube', 'twitch',
  'typescript', 'css',
  'node-bottom', 'github-bottom', 'youtube-bottom', 'twitch-bottom',
];

// Propiedades cuyo valor debe salir de var() (colores, radios, sombras y transiciones).
const COLOR_PROPS = new Set([
  'color',
  'background',
  'background-image',
  'border',
  'border-bottom',
  'border-radius',
  'box-shadow',
  'transition',
]);

function readCss(url, label) {
  assert.ok(existsSync(url), `${label} no existe (REQ-04-01)`);
  return readFileSync(url, 'utf8');
}

function declarationsOf(content) {
  const withoutComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...withoutComments.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)];
}

test('REQ-04-01: las hojas existen y se importan desde sus componentes', () => {
  readCss(HERO_CARD_CSS, 'src/styles/hero-card.css');
  readCss(PROFILE_CARD_CSS, 'src/styles/profile-card.css');
  const heroCardAstro = readFileSync(HERO_CARD_ASTRO, 'utf8');
  const newHeroAstro = readFileSync(NEW_HERO_ASTRO, 'utf8');
  assert.ok(
    heroCardAstro.includes('../styles/hero-card.css'),
    'hero-card.astro no importa ../styles/hero-card.css (REQ-04-01)'
  );
  assert.ok(
    newHeroAstro.includes('../../styles/profile-card.css'),
    'new-hero.astro no importa ../../styles/profile-card.css (REQ-04-01)'
  );
  assert.ok(
    !newHeroAstro.includes('../../styles/hero.css'),
    'new-hero.astro sigue importando hero.css (ya no debe existir)'
  );
});

test('REQ-04-04: ambas hojas no superan las 100 líneas', () => {
  for (const [url, label] of [
    [HERO_CARD_CSS, 'hero-card.css'],
    [PROFILE_CARD_CSS, 'profile-card.css'],
  ]) {
    const content = readCss(url, label);
    const lineCount = content.split('\n').length;
    assert.ok(
      lineCount <= 100,
      `${label} tiene ${lineCount} líneas (máximo 100, REQ-04-04)`
    );
  }
});

test('REQ-04-02: hero-card.css asigna el fondo por data-color-token (12 tarjetas)', () => {
  const content = readCss(HERO_CARD_CSS, 'src/styles/hero-card.css');
  for (const token of CARD_TOKENS) {
    const pattern = new RegExp(
      `\\[data-color-token="${token}"\\]\\s*\\{[^}]*--card-bg\\s*:\\s*var\\(--color-marca-${token}\\)`
    );
    assert.ok(
      pattern.test(content),
      `falta [data-color-token="${token}"] { --card-bg: var(--color-marca-${token}) } (REQ-04-02)`
    );
  }
});

test('REQ-04-03: colores, radios, sombras y transiciones usan var() de los tokens', () => {
  for (const [url, label] of [
    [HERO_CARD_CSS, 'hero-card.css'],
    [PROFILE_CARD_CSS, 'profile-card.css'],
  ]) {
    const content = readCss(url, label);
    const declarations = declarationsOf(content);
    assert.ok(declarations.length > 0, `${label} no contiene declaraciones`);
    let checked = 0;
    for (const [, prop, value] of declarations) {
      if (!COLOR_PROPS.has(prop)) continue;
      // border-radius: <porcentaje> es una forma (círculo), no un radio de diseño.
      if (prop === 'border-radius' && /^\d+(\.\d+)?%$/.test(value.trim())) continue;
      checked += 1;
      assert.match(
        value,
        /var\(--/,
        `"${prop}" no usa var() de los tokens (REQ-04-03) en ${label}: ${value}`
      );
    }
    assert.ok(
      checked > 0,
      `no se encontró ninguna declaración de color/radio/sombra/transición en ${label}`
    );
  }
});

test('REQ-04-03: sin valores hex ni rgb()/rgba() hardcodeados', () => {
  for (const [url, label] of [
    [HERO_CARD_CSS, 'hero-card.css'],
    [PROFILE_CARD_CSS, 'profile-card.css'],
  ]) {
    const content = readCss(url, label).replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(
      content,
      /#[0-9a-fA-F]{3,8}\b/,
      `${label} contiene un color hex hardcodeado (REQ-04-03)`
    );
    assert.doesNotMatch(
      content,
      /rgba?\(/,
      `${label} contiene rgb()/rgba() hardcodeado (REQ-04-03)`
    );
  }
});

test('REQ-04-05: src/styles/hero.css ya no existe (Decisión 3 del design.md)', () => {
  assert.ok(
    !existsSync(HERO_CSS),
    'src/styles/hero.css sigue existiendo (REQ-04-05)'
  );
});

test('design.md Decisión 2: hero-card.astro sin style inline y grid desde la hoja', () => {
  const astro = readFileSync(HERO_CARD_ASTRO, 'utf8');
  assert.doesNotMatch(
    astro,
    /\bstyle\s*=/,
    'hero-card.astro conserva el atributo style inline'
  );
  assert.ok(
    astro.includes('data-color-token={card.colorToken}'),
    'hero-card.astro no aplica data-color-token={card.colorToken}'
  );

  const css = readCss(HERO_CARD_CSS, 'src/styles/hero-card.css');
  assert.match(
    css,
    /\.hero-card\s*\{[^}]*grid-column\s*:\s*var\(--card-column\)/s,
    'grid-column no sale de --card-column en la hoja'
  );
  assert.match(
    css,
    /\.hero-card\s*\{[^}]*grid-row\s*:\s*var\(--card-row\)/s,
    'grid-row no sale de --card-row en la hoja'
  );
  for (const token of CARD_TOKENS) {
    assert.match(
      css,
      new RegExp(`\\[data-color-token="${token}"\\]\\s*\\{[^}]*--card-column\\s*:`),
      `falta --card-column para [data-color-token="${token}"]`
    );
    assert.match(
      css,
      new RegExp(`\\[data-color-token="${token}"\\]\\s*\\{[^}]*--card-row\\s*:`),
      `falta --card-row para [data-color-token="${token}"]`
    );
  }
});
