import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Test de la UI de artículos conectada al repositorio (REQ-10-01..04, feature 10 articles-ui-refactor).
//
// Verifica contra specs/10_articles-ui-refactor/requirements.md y design.md:
//   REQ-10-01 — LatestArticles obtiene los artículos desde PostsRepository
//               (Decisión 1: mapea las entidades Post a marcado semántico
//               article/h2/p/span con título, autor, tiempo, descripción y tags).
//   REQ-10-02 — el componente importa src/styles/latest-articles.css.
//   REQ-10-03 — la hoja consume únicamente los tokens del diseño (los 8 de la
//               tabla del design.md) y no supera 100 líneas.
//   REQ-10-04 — el test falla si el componente importa astro:content directamente.

const COMPONENT_PATH = new URL('../src/components/latest-articles.astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/latest-articles.css', import.meta.url);

// Propiedades cuyo valor debe salir de var() (colores, radios, transiciones).
const COLOR_PROPS = new Set([
  'color',
  'background',
  'background-image',
  'border',
  'border-bottom',
  'border-top',
  'border-left',
  'border-right',
  'border-color',
  'border-radius',
  'box-shadow',
  'transition',
]);

function readComponent() {
  assert.ok(existsSync(COMPONENT_PATH), 'src/components/latest-articles.astro no existe');
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/latest-articles.css no existe (REQ-10-02/03)');
  return readFileSync(CSS_PATH, 'utf8');
}

test('REQ-10-01: LatestArticles obtiene los artículos desde PostsRepository', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /posts-repository/,
    'latest-articles.astro no importa PostsRepository (REQ-10-01)'
  );
  assert.match(
    astro,
    /PostsRepository/,
    'latest-articles.astro no usa la clase PostsRepository (REQ-10-01)'
  );
  assert.match(
    astro,
    /getPosts\(\)/,
    'latest-articles.astro no obtiene los artículos con getPosts() (REQ-10-01)'
  );
});

test('REQ-10-04: el componente no importa astro:content directamente', () => {
  const astro = readComponent();
  assert.doesNotMatch(
    astro,
    /astro:content/,
    'latest-articles.astro importa astro:content directamente (REQ-10-04)'
  );
  assert.doesNotMatch(
    astro,
    /getCollection/,
    'latest-articles.astro usa getCollection directamente (REQ-10-04)'
  );
});

test('REQ-10-02: latest-articles.css existe y es importada por el componente', () => {
  const astro = readComponent();
  assert.ok(
    astro.includes('../styles/latest-articles.css'),
    'latest-articles.astro no importa ../styles/latest-articles.css (REQ-10-02)'
  );
  assert.ok(
    existsSync(CSS_PATH),
    'src/styles/latest-articles.css no existe (REQ-10-02)'
  );
});

test('REQ-10-01 (Decisión 1): mapea Post a marcado semántico con los cinco campos', () => {
  const astro = readComponent();
  for (const tag of ['<article', '<h2', '<p', '<span']) {
    assert.ok(
      astro.includes(tag),
      `el marcado no usa la etiqueta semántica "${tag}" (REQ-10-01)`
    );
  }
  for (const field of ['post.title', 'post.author', 'post.readtime', 'post.description', 'post.tags']) {
    assert.ok(
      astro.includes(field),
      `el marcado no interpola ${field} (REQ-10-01)`
    );
  }
  assert.ok(
    astro.includes('min de lectura'),
    'el marcado no muestra el tiempo de lectura (REQ-10-01)'
  );
});

test('REQ-10-03: latest-articles.css no supera 100 líneas', () => {
  const lineCount = readCss().split('\n').length;
  assert.ok(
    lineCount <= 100,
    `latest-articles.css tiene ${lineCount} líneas (máximo 100, REQ-10-03)`
  );
});

test('REQ-10-03: sin valores hex ni rgb()/rgba() hardcodeados', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    content,
    /#[0-9a-fA-F]{3,8}\b/,
    'latest-articles.css contiene un color hex hardcodeado (REQ-10-03)'
  );
  assert.doesNotMatch(
    content,
    /rgba?\(/,
    'latest-articles.css contiene rgb()/rgba() hardcodeado (REQ-10-03)'
  );
});

test('REQ-10-03: colores, radios y transiciones usan var() de los tokens', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = /^([a-z-]+)\s*:\s*(.+?);?$/;
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  assert.ok(lines.length > 0, 'latest-articles.css está vacío');

  let checked = 0;
  for (const line of lines) {
    const match = line.match(declaration);
    if (!match) continue; // selectores, @media, llaves
    const prop = match[1].toLowerCase();
    if (!COLOR_PROPS.has(prop)) continue;
    checked += 1;
    assert.match(
      match[2],
      /var\(--/,
      `"${prop}" no usa var() de los tokens (REQ-10-03): ${line}`
    );
  }
  assert.ok(checked > 0, 'no se encontró ninguna declaración de color/radio/transición');
});

test('REQ-10-03: la hoja consume los tokens de la tabla del design.md', () => {
  const css = readCss();
  for (const token of [
    '--color-surface',
    '--color-text',
    '--color-text-secondary',
    '--color-border',
    '--color-accent',
    '--radius-card',
    '--gap-card',
    '--transition-default',
  ]) {
    assert.ok(
      css.includes(`var(${token})`),
      `latest-articles.css no usa var(${token}) (design.md, REQ-10-03)`
    );
  }
});

test('Convención: el componente es ≤100 líneas, sin lógica y sin estilos embebidos', () => {
  const astro = readComponent();
  const lineCount = astro.split('\n').length;
  assert.ok(
    lineCount <= 100,
    `latest-articles.astro tiene ${lineCount} líneas (máximo 100)`
  );
  assert.doesNotMatch(
    astro,
    /\breadFileSync\b|new\s+URL\(/,
    'el componente lee archivos o URLs de datos directamente (convención)'
  );
  assert.doesNotMatch(
    astro,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(/,
    'el componente contiene lógica de negocio en el frontmatter (convención)'
  );
  assert.doesNotMatch(
    astro,
    /\bstyle\s*=/,
    'el componente conserva el atributo style inline (convención)'
  );
  assert.doesNotMatch(
    astro,
    /<style/i,
    'el componente contiene un bloque <style> embebido (convención)'
  );
});