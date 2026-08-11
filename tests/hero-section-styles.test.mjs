import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Test de estilos de la sección hero (REQ-03-01..05, feature 3 hero-section-styles).
//
// Verifica contra specs/03_hero-section-styles/requirements.md y design.md:
//   REQ-03-01 — new-hero.astro importa src/styles/hero-section.css.
//   REQ-03-02 — la hoja contiene los selectores de fondo y cuadrícula.
//   REQ-03-03 — colores, radios y transiciones salen de var(--...).
//   REQ-03-04 — hero-section.css no supera 100 líneas.
//   REQ-03-05 — el test falla si supera 100 líneas o contiene hex/rgb()/rgba()
//               hardcodeados.
//
// Nota (feature 8 layout-refactor): el selector .hero-navbar dejó de exigirse
// aquí porque la navbar compartida pasó a vivir en el layout único
// (src/styles/layout.css, REQ-08-05/06 de la feature 8).

const SECTION_PATH = new URL('../src/styles/hero-section.css', import.meta.url);
const ASTRO_PATH = new URL('../src/components/new-hero/new-hero.astro', import.meta.url);

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
  'border-radius',
  'box-shadow',
  'transition',
]);

function readSectionCss() {
  assert.ok(
    existsSync(SECTION_PATH),
    'src/styles/hero-section.css no existe (REQ-03-01)'
  );
  return readFileSync(SECTION_PATH, 'utf8');
}

test('REQ-03-01: new-hero.astro importa src/styles/hero-section.css', () => {
  assert.ok(existsSync(ASTRO_PATH), 'src/components/new-hero/new-hero.astro no existe');
  const astro = readFileSync(ASTRO_PATH, 'utf8');
  assert.ok(
    astro.includes('../../styles/hero-section.css'),
    'new-hero.astro no importa ../../styles/hero-section.css (REQ-03-01)'
  );
});

test('REQ-03-04: hero-section.css existe y no supera 100 líneas', () => {
  const content = readSectionCss();
  const lineCount = content.split('\n').length;
  assert.ok(
    lineCount <= 100,
    `hero-section.css tiene ${lineCount} líneas (máximo 100, REQ-03-04)`
  );
});

test('REQ-03-02: los selectores cubren fondo y cuadrícula del hero', () => {
  const content = readSectionCss();
  for (const selector of [
    '.new-hero',
    '.hero-background',
    '.hero-gradient',
    '.hero-grid',
  ]) {
    assert.ok(
      content.includes(selector),
      `falta el selector "${selector}" de la sección (REQ-03-02)`
    );
  }
});

test('REQ-03-03: colores, radios y transiciones usan var() de los tokens', () => {
  const content = readSectionCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = /^([a-z-]+)\s*:\s*(.+?);?$/;
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  assert.ok(lines.length > 0, 'hero-section.css está vacío');

  let checked = 0;
  for (const line of lines) {
    const match = line.match(declaration);
    if (!match) continue; // selectores, keyframes, @media, llaves
    const prop = match[1].toLowerCase();
    if (!COLOR_PROPS.has(prop)) continue;
    checked += 1;
    assert.match(
      match[2],
      /var\(--/,
      `"${prop}" no usa var() de los tokens (REQ-03-03): ${line}`
    );
  }
  assert.ok(checked > 0, 'no se encontró ninguna declaración de color/radio/transición');
});

test('REQ-03-05: sin valores hex ni rgb()/rgba() hardcodeados', () => {
  const content = readSectionCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    content,
    /#[0-9a-fA-F]{3,8}\b/,
    'hero-section.css contiene un color hex hardcodeado (REQ-03-05)'
  );
  assert.doesNotMatch(
    content,
    /rgba?\(/,
    'hero-section.css contiene rgb()/rgba() hardcodeado (REQ-03-05)'
  );
});
