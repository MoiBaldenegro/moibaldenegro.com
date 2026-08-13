// Test de la eliminación del fondo del Juego de la Vida (REQ-25-01..08,
// feature 25 game-of-life-removal).
//
// Verifica contra specs/25_game-of-life-removal/requirements.md y design.md:
//   REQ-25-01 — el proyecto elimina el componente, el motor, el driver, el
//               módulo de dibujo y la hoja del fondo GOL.
//   REQ-25-02 — el proyecto elimina de la suite los tests del fondo GOL
//               (features 14-16).
//   REQ-25-03 — tokens.css ya no define --opacity-gol, --size-gol-cell ni
//               --opacity-hero (sin uso en src/ tras la eliminación).
//   REQ-25-04 — Layout.astro no importa el componente ni contiene la
//               referencia comentada.
//   REQ-25-05 — hero-section.css conserva el selector .hero-background sin
//               referencias a tokens de opacidad (el hero queda a opacidad
//               plena, aspecto actual aprobado).
//   REQ-25-06 — docs/architecture.md omite el componente GOL de sus ejemplos
//               y no introduce el token prohibido 'hero' del kit (REQ-01-05).
//   REQ-25-07 — el escaneo de src/ con las cadenas GOL devuelve 0 resultados
//               y en tests/ solo este archivo las menciona.
//   REQ-25-08 — suite completa, build e init.sh en verde (se ejecutan fuera
//               de este test, vía ./init.sh).
//
// Nota: este test contiene a propósito las cadenas GOL (rutas de los archivos
// cuya ausencia verifica, Decisión 6 del design); el acceptance acota el grep
// a src/ (0 resultados) y aclara que en tests/ solo este archivo las menciona.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url);
const SRC_ROOT = new URL('../src/', import.meta.url);
const TESTS_ROOT = new URL('../tests/', import.meta.url);

// Cadenas del fondo GOL (Decisión 6 del design: solo este test las menciona).
const GOL_CHAINS = [
  'game-of-life',
  'GameOfLife',
  'gol-canvas',
  'gol-render',
  'mountGameOfLife',
  '--opacity-gol',
  '--size-gol-cell',
  '--opacity-hero',
];

// Archivos de código GOL que deben haber desaparecido (REQ-25-01).
const REMOVED_SRC_FILES = [
  'src/components/GameOfLifeBackground.astro',
  'src/utils/game-of-life.ts',
  'src/utils/game-of-life-canvas.ts',
  'src/utils/gol-render.ts',
  'src/styles/game-of-life.css',
];

// Tests de las features 14-16 que deben haber desaparecido (REQ-25-02).
const REMOVED_TEST_FILES = [
  'tests/game-of-life-engine.test.mjs',
  'tests/game-of-life-background.test.mjs',
  'tests/gol-performance.test.mjs',
];

// Tokens GOL/hero que deben haber desaparecido de tokens.css (REQ-25-03).
const REMOVED_TOKENS = ['--opacity-gol', '--size-gol-cell', '--opacity-hero'];

// Tokens de opacidad prohibidos en hero-section.css (REQ-25-05).
const REMOVED_OPACITY_TOKENS = ['--opacity-gol', '--size-gol-cell', '--opacity-hero'];

function read(relPath, label) {
  const url = new URL(relPath, ROOT);
  assert.ok(existsSync(url), `${label} no existe`);
  return readFileSync(url, 'utf8');
}

function walkFiles(dirPath, acc = []) {
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const entryPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(entryPath, acc);
    } else {
      acc.push(entryPath);
    }
  }
  return acc;
}

function readAllIn(dirUrl) {
  const contents = [];
  for (const filePath of walkFiles(fileURLToPath(dirUrl))) {
    if (/node_modules|\.astro\//.test(filePath)) continue;
    contents.push({ rel: filePath, text: readFileSync(filePath, 'utf8') });
  }
  return contents;
}

test('REQ-25-01: los archivos de código del fondo GOL ya no existen', () => {
  for (const rel of REMOVED_SRC_FILES) {
    assert.ok(
      !existsSync(new URL(rel, ROOT)),
      `el archivo GOL ${rel} todavía existe (REQ-25-01)`
    );
  }
});

test('REQ-25-02: los tests de las features 14-16 ya no existen', () => {
  for (const rel of REMOVED_TEST_FILES) {
    assert.ok(
      !existsSync(new URL(rel, ROOT)),
      `el test GOL ${rel} todavía existe (REQ-25-02)`
    );
  }
});

test('REQ-25-03: tokens.css ya no define los tokens GOL ni --opacity-hero', () => {
  const tokens = read('src/styles/tokens.css', 'src/styles/tokens.css');
  for (const token of REMOVED_TOKENS) {
    assert.ok(
      !tokens.includes(token),
      `tokens.css todavía define ${token} (REQ-25-03)`
    );
  }
});

test('REQ-25-04: Layout.astro no importa el componente ni lo referencia comentado', () => {
  const layout = read('src/layouts/Layout.astro', 'src/layouts/Layout.astro');
  assert.doesNotMatch(
    layout,
    /GameOfLifeBackground/,
    'Layout.astro todavía menciona GameOfLifeBackground (REQ-25-04)'
  );
  assert.doesNotMatch(
    layout,
    /game-of-life/,
    'Layout.astro todavía menciona el fondo del Juego de la Vida (REQ-25-04)'
  );
});

test('REQ-25-05: hero-section.css conserva .hero-background sin tokens de opacidad', () => {
  const css = read('src/styles/hero-section.css', 'src/styles/hero-section.css');
  assert.ok(
    css.includes('.hero-background'),
    'hero-section.css perdió el selector .hero-background (REQ-25-05)'
  );
  for (const token of REMOVED_OPACITY_TOKENS) {
    assert.ok(
      !css.includes(token),
      `hero-section.css todavía menciona ${token} (REQ-25-05)`
    );
  }
});

test('REQ-25-06: docs/architecture.md omite el fondo GOL y no introduce el token hero', () => {
  const doc = read('docs/architecture.md', 'docs/architecture.md');
  assert.ok(
    !doc.includes('GameOfLifeBackground') && !doc.includes('game-of-life'),
    'docs/architecture.md todavía menciona el fondo del Juego de la Vida (REQ-25-06)'
  );
  assert.ok(
    !doc.toLowerCase().includes('hero'),
    'docs/architecture.md introdujo el token prohibido "hero" del kit (REQ-25-06, REQ-01-05)'
  );
});

test('REQ-25-07: el escaneo de src/ no encuentra cadenas GOL', () => {
  const offenders = [];
  for (const { rel, text } of readAllIn(SRC_ROOT)) {
    for (const chain of GOL_CHAINS) {
      if (text.includes(chain)) {
        offenders.push(`${rel} contiene "${chain}"`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `src/ todavía referencia el fondo GOL (REQ-25-07): ${offenders.join('; ')}`
  );
});

test('REQ-25-07: en tests/ solo este archivo menciona las cadenas GOL', () => {
  const offenders = [];
  for (const { rel, text } of readAllIn(TESTS_ROOT)) {
    if (rel.endsWith('game-of-life-removal.test.mjs')) continue;
    for (const chain of GOL_CHAINS) {
      if (text.includes(chain)) {
        offenders.push(`${rel} contiene "${chain}"`);
      }
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `tests heredados todavía referencia el fondo GOL (REQ-25-07): ${offenders.join('; ')}`
  );
});
