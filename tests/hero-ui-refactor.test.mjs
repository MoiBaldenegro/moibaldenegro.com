import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Test de la UI del hero conectada a los repositorios (REQ-09-01..05, feature 9 hero-ui-refactor).
//
// Verifica contra specs/09_hero-ui-refactor/requirements.md y design.md:
//   REQ-09-01 — NewHero obtiene el perfil y las tarjetas desde HeroProfileRepository
//               y HeroCardsRepository (Decisión 1); no importa de src/data.
//   REQ-09-02 — HeroCard recibe la tarjeta como prop tipada con la entidad HeroCard.
//   REQ-09-03 — HeroCard aplica el fondo mediante data-color-token={card.colorToken}
//               sin estilos inline (Decisión 2 del design.md).
//   REQ-09-04 — el frontmatter de los componentes del hero se limita a imports y
//               paso de datos (sin lectura directa de archivos ni lógica).
//   REQ-09-05 — src/data/hero.data.ts ya no existe y nada lo importa (Decisión 3).

const NEW_HERO_PATH = new URL('../src/components/new-hero/new-hero.astro', import.meta.url);
const HERO_CARD_PATH = new URL('../src/components/hero-card.astro', import.meta.url);
const HERO_CARDS_JSON = new URL('../src/data/hero-cards.json', import.meta.url);
const HERO_CARD_CSS = new URL('../src/styles/hero-card.css', import.meta.url);
const HERO_DATA_TS = new URL('../src/data/hero.data.ts', import.meta.url);
const SRC_ROOT = new URL('../src/', import.meta.url);

function readAstro(url, label) {
  assert.ok(existsSync(url), `${label} no existe`);
  return readFileSync(url, 'utf8');
}

function filesUnder(dirPath) {
  const result = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      result.push(...filesUnder(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

test('REQ-09-01: NewHero obtiene perfil y tarjetas desde los repositorios del dominio', () => {
  const astro = readAstro(NEW_HERO_PATH, 'src/components/new-hero/new-hero.astro');
  // Importa ambos repositorios y los usa en el frontmatter.
  assert.match(
    astro,
    /hero-profile-repository/,
    'new-hero.astro no importa HeroProfileRepository (REQ-09-01)'
  );
  assert.match(
    astro,
    /hero-cards-repository/,
    'new-hero.astro no importa HeroCardsRepository (REQ-09-01)'
  );
  assert.match(
    astro,
    /getProfile\(\)/,
    'new-hero.astro no obtiene el perfil con getProfile() (REQ-09-01)'
  );
  assert.match(
    astro,
    /getCards\(\)/,
    'new-hero.astro no obtiene las tarjetas con getCards() (REQ-09-01)'
  );
  // No accede a los datos desde src/data y pasa la tarjeta como prop.
  assert.doesNotMatch(
    astro,
    /from\s+["'][^"']*\/data\//,
    'new-hero.astro importa datos desde src/data (REQ-09-01)'
  );
  assert.doesNotMatch(
    astro,
    /hero\.data/,
    'new-hero.astro sigue referenciando hero.data (REQ-09-01)'
  );
  assert.match(
    astro,
    /card=\{card\}/,
    'new-hero.astro no pasa la tarjeta como prop card={card} (REQ-09-01)'
  );
});

test('REQ-09-02: HeroCard recibe la tarjeta como prop tipada con la entidad HeroCard', () => {
  const astro = readAstro(HERO_CARD_PATH, 'src/components/hero-card.astro');
  assert.match(
    astro,
    /from\s+["'][^"']*domain\/entities\/hero-card\.ts["']/,
    'hero-card.astro no importa la entidad HeroCard del dominio (REQ-09-02)'
  );
  assert.doesNotMatch(
    astro,
    /hero\.data/,
    'hero-card.astro sigue importando de hero.data (REQ-09-02)'
  );
  assert.match(
    astro,
    /interface\s+Props\s*\{[\s\S]*?\bcard\s*:\s*HeroCard\b/,
    'la prop card de hero-card.astro no está tipada con la entidad HeroCard (REQ-09-02)'
  );
  assert.match(
    astro,
    /Astro\.props/,
    'hero-card.astro no lee las props desde Astro.props (REQ-09-02)'
  );
});

test('REQ-09-03: HeroCard aplica el fondo con data-color-token y sin estilos inline', () => {
  const astro = readAstro(HERO_CARD_PATH, 'src/components/hero-card.astro');
  assert.ok(
    astro.includes('data-color-token={card.colorToken}'),
    'hero-card.astro no aplica data-color-token={card.colorToken} (REQ-09-03)'
  );
  assert.doesNotMatch(
    astro,
    /\bstyle\s*=/,
    'hero-card.astro conserva el atributo style inline (REQ-09-03)'
  );
  assert.doesNotMatch(
    astro,
    /<style/i,
    'hero-card.astro contiene un bloque <style> embebido (REQ-09-03)'
  );
});

test('REQ-09-03 (integración): cada colorToken de hero-cards.json tiene su regla en hero-card.css', () => {
  const cards = JSON.parse(readFileSync(HERO_CARDS_JSON, 'utf8'));
  assert.ok(Array.isArray(cards) && cards.length === 12, 'hero-cards.json no entrega 12 tarjetas');
  const css = readFileSync(HERO_CARD_CSS, 'utf8');
  for (const card of cards) {
    assert.ok(card.colorToken, `la tarjeta ${card.id} no tiene colorToken`);
    assert.match(
      css,
      new RegExp(`\\[data-color-token="${card.colorToken}"\\]`),
      `hero-card.css no tiene regla para el colorToken "${card.colorToken}" (REQ-09-03)`
    );
  }
});

test('REQ-09-04: el frontmatter de los componentes del hero se limita a imports y paso de datos', () => {
  for (const [url, label] of [
    [NEW_HERO_PATH, 'new-hero.astro'],
    [HERO_CARD_PATH, 'hero-card.astro'],
  ]) {
    const content = readAstro(url, label);
    assert.doesNotMatch(
      content,
      /\breadFileSync\b/,
      `${label} lee archivos directamente (REQ-09-04)`
    );
    assert.doesNotMatch(
      content,
      /new\s+URL\(/,
      `${label} resuelve URLs de datos directamente (REQ-09-04)`
    );
    assert.doesNotMatch(
      content,
      /\bfunction\b|\bif\s*\(|\bfor\s*\(/,
      `${label} contiene lógica de negocio en el componente (REQ-09-04)`
    );
  }
});

test('REQ-09-05: src/data/hero.data.ts ya no existe y nada lo importa en src/', () => {
  assert.ok(
    !existsSync(HERO_DATA_TS),
    'src/data/hero.data.ts sigue existiendo (REQ-09-05)'
  );
  const offenders = [];
  for (const fullPath of filesUnder(fileURLToPath(SRC_ROOT))) {
    const content = readFileSync(fullPath, 'utf8');
    if (content.includes('hero.data')) {
      offenders.push(fullPath);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `todavía hay archivos en src/ que referencian hero.data: ${offenders.join(', ')}`
  );
});

test('Convención: los componentes del hero no superan las 100 líneas', () => {
  for (const [url, label] of [
    [NEW_HERO_PATH, 'new-hero.astro'],
    [HERO_CARD_PATH, 'hero-card.astro'],
  ]) {
    const lineCount = readAstro(url, label).split('\n').length;
    assert.ok(
      lineCount <= 100,
      `${label} tiene ${lineCount} líneas (máximo 100)`
    );
  }
});
