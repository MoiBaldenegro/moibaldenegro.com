// Test de rendimiento del fondo GOL (REQ-16-01..10, feature 16 gol-performance).
//
// Verifica contra specs/16_gol-performance/requirements.md y design.md
// (Decisiones 1-8). Tests de estructura/contrato sobre el fuente, sin
// navegador (patrón de tests/game-of-life-background.test.mjs):
//   REQ-16-01 — shouldTick es una función pura exportada: true solo al
//               alcanzar el intervalo, sin mutar argumentos (verificación
//               estructural + funcional evaluando el cuerpo extraído).
//   REQ-16-02 — el bucle solo avanza generación cuando shouldTick lo permite
//               con TICK_INTERVAL_MS en [66.67, 100] ms (10-15 gen/seg).
//   REQ-16-03 — una única llamada putImageData por frame sobre un ImageData;
//               sin fillRect en el driver ni en sus módulos de dibujo.
//   REQ-16-04 — RENDER_SCALE = 2 (media resolución); el escalado al viewport
//               queda en la hoja (width/height 100% en game-of-life.css).
//   REQ-16-05 — .hero-background promovido con will-change: opacity y
//               conservando opacity: var(--opacity-hero).
//   REQ-16-06 — .hero-noise deja de ser capa propia; su patrón se integra
//               como primer background con alfa derivado del token
//               --color-text (color-mix), conservando el gradiente del hero
//               como segundo layer (regresión de la Ronda 2 de la feature 15).
//   REQ-16-07 — tokens de aspecto intactos: --opacity-hero 0.80,
//               --opacity-gol 0.15 y --size-gol-cell 6px.
//   REQ-16-08 — accesibilidad de la feature 15 conservada: prefers-reduced-
//               motion (fotograma estático), document.hidden (pausa) y
//               pointer-events: none en el lienzo.
//   REQ-16-09 — imports relativos del driver (incluye el motor feature 14);
//               el motor no se modifica (regresión ligera de exports).
//   REQ-16-10 — game-of-life-canvas.ts, sus imports relativos y
//               hero-section.css no superan las 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const DRIVER_PATH = new URL('../src/utils/game-of-life-canvas.ts', import.meta.url);
const ENGINE_PATH = new URL('../src/utils/game-of-life.ts', import.meta.url);
const HERO_CSS_PATH = new URL('../src/styles/hero-section.css', import.meta.url);
const GOL_CSS_PATH = new URL('../src/styles/game-of-life.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

function read(path, label) {
  assert.ok(existsSync(path), `${label} no existe`);
  return readFileSync(path, 'utf8');
}

// Los escaneos de contrato miran el CÓDIGO, no la prosa de los comentarios
// (patrón de REQ-03-05 y REQ-15-12: quitan los comentarios antes de buscar
// literales). Un comentario que documenta qué se sustituyó no es código.
function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

// Driver + sus imports relativos (módulos de dibujo incluidos): el scope que
// REQ-16-03 y REQ-16-10 exigen escanear.
function readDriverScope() {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  const imports = [...driver.matchAll(/^\s*import\b[^;]*?\bfrom\s+['"](\.[^'"]+)['"]/gm)].map(
    (m) => m[1],
  );
  const scope = new Map();
  scope.set('game-of-life-canvas.ts', stripComments(driver));
  for (const specifier of imports) {
    const resolved = new URL(`../src/utils/${specifier}`, import.meta.url);
    const label = specifier.replace(/^\.\//, '');
    scope.set(label, stripComments(read(resolved, `import relativo ${specifier} del driver`)));
  }
  return scope;
}

test('REQ-16-01: el driver exporta shouldTick como función pura (no muta sus argumentos)', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  const fn = driver.match(/export function shouldTick\(([^)]*)\): boolean \{\s*([\s\S]*?)\n\}/);
  assert.ok(fn, 'el driver no exporta shouldTick con firma (timestamp, lastTick, interval) (REQ-16-01)');
  const params = fn[1].split(',').map((p) => p.trim().split(':')[0].trim());
  assert.deepEqual(params, ['timestamp', 'lastTick', 'interval'], 'firma de shouldTick inesperada (REQ-16-01)');
  const body = fn[2];
  assert.doesNotMatch(
    body,
    /\b(timestamp|lastTick|interval)\s*=[^=>]/,
    'shouldTick reasigna sus argumentos (no es pura) (REQ-16-01)'
  );
  // Contrato funcional evaluando el cuerpo puro extraído (sin navegador).
  const shouldTick = new Function(...params, body);
  assert.equal(shouldTick(100, 0, 80), true, 'debe devolver true al superar el intervalo (REQ-16-01)');
  assert.equal(shouldTick(80, 0, 80), true, 'debe devolver true al alcanzar el intervalo (REQ-16-01)');
  assert.equal(shouldTick(79, 0, 80), false, 'debe devolver false antes del intervalo (REQ-16-01)');
  const args = [100, 0, 80];
  shouldTick(...args);
  assert.deepEqual(args, [100, 0, 80], 'shouldTick muta sus argumentos (REQ-16-01)');
});

test('REQ-16-02: el bucle avanza generación solo cuando shouldTick lo permite (TICK_INTERVAL_MS 66.67-100)', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  const tick = driver.match(/TICK_INTERVAL_MS\s*=\s*([0-9.]+)/);
  assert.ok(tick, 'el driver no declara TICK_INTERVAL_MS (REQ-16-02)');
  const ms = Number.parseFloat(tick[1]);
  assert.ok(
    ms >= 66.67 && ms <= 100,
    `TICK_INTERVAL_MS (${ms}) fuera del rango 66.67-100 ms (10-15 gen/seg, REQ-16-02)`
  );
  const animate = driver.match(/const animate = \(timestamp: number\) => \{([\s\S]*?)\n  \};/);
  assert.ok(animate, 'no se encontró el bucle animate(timestamp) (REQ-16-02)');
  assert.match(
    animate[1],
    /shouldTick\([^)]*TICK_INTERVAL_MS/,
    'el bucle no gatea la generación con shouldTick+TICK_INTERVAL_MS (REQ-16-02)'
  );
  assert.match(
    animate[1],
    /stepGrid\(/,
    'stepGrid no avanza dentro del tick de shouldTick (REQ-16-02)'
  );
  assert.match(
    animate[1],
    /lastTick\s*=\s*timestamp/,
    'lastTick no avanza al producirse el tick (REQ-16-02)'
  );
});

test('REQ-16-03: una única putImageData por frame sobre ImageData y sin fillRect en el scope', () => {
  const scope = readDriverScope();
  for (const [label, content] of scope) {
    assert.doesNotMatch(content, /fillRect/, `${label} usa fillRect (REQ-16-03)`);
  }
  const putCount = [...scope.values()].reduce(
    (n, content) => n + (content.match(/putImageData/g) ?? []).length,
    0,
  );
  assert.equal(
    putCount,
    1,
    `putImageData aparece ${putCount} veces en driver+módulos de dibujo (debe ser exactamente 1 por frame, REQ-16-03)`
  );
  const paintModules = [...scope.entries()].filter(([label]) => label.includes('gol-render'));
  assert.ok(paintModules.length === 1, 'el driver no importa el módulo de dibujo gol-render.ts (Decisión 7)');
  assert.match(
    paintModules[0][1],
    /ImageData/,
    'el módulo de dibujo no construye el fotograma desde un ImageData (REQ-16-03)'
  );
  assert.match(
    paintModules[0][1],
    /renderFrame\(/,
    'el módulo de dibujo no expone renderFrame (Decisión 7)'
  );
});

test('REQ-16-04: RENDER_SCALE 2 — media resolución y escalado CSS en la hoja', () => {
  const scope = readDriverScope();
  const source = [...scope.values()].join('\n');
  assert.match(source, /RENDER_SCALE\s*=\s*2\s*;/, 'RENDER_SCALE no vale 2 (REQ-16-04)');
  const driver = scope.get('game-of-life-canvas.ts');
  assert.match(
    driver,
    /canvas\.(width|height)\s*=\s*[^;]*RENDER_SCALE/,
    'el dimensionado del canvas no divide por RENDER_SCALE (REQ-16-04)'
  );
  assert.match(
    driver,
    /Math\.floor\(window\.innerWidth \/ cellSize\)/,
    'la cuadrícula del autómata ya no se dimensiona con el viewport (REQ-16-04)'
  );
  const css = read(GOL_CSS_PATH, 'src/styles/game-of-life.css');
  assert.match(
    css,
    /\.gol-canvas\s*\{[^}]*width\s*:\s*100%/s,
    'el escalado al viewport no queda declarado en la hoja (width: 100%, REQ-16-04)'
  );
  assert.match(
    css,
    /\.gol-canvas\s*\{[^}]*height\s*:\s*100%/s,
    'el escalado al viewport no queda declarado en la hoja (height: 100%, REQ-16-04)'
  );
});

test('REQ-16-05: .hero-background es capa promovida con will-change opacity y conserva var(--opacity-hero)', () => {
  const css = read(HERO_CSS_PATH, 'src/styles/hero-section.css');
  const block = css.match(/\.hero-background\s*\{[^}]*\}/s)?.[0] ?? '';
  assert.ok(block, 'hero-section.css no contiene el selector .hero-background (REQ-16-05)');
  assert.match(
    block,
    /will-change\s*:\s*opacity/,
    '.hero-background no se promueve con will-change: opacity (REQ-16-05)'
  );
  assert.match(
    block,
    /opacity\s*:\s*var\(--opacity-hero\)/,
    '.hero-background no conserva opacity: var(--opacity-hero) (REQ-16-05)'
  );
});

test('REQ-16-06: .hero-noise ya no es capa propia y su patrón se integra como primer fondo con alfa de --color-text', () => {
  const css = read(HERO_CSS_PATH, 'src/styles/hero-section.css');
  assert.doesNotMatch(
    stripComments(css),
    /\.hero-noise\b/,
    '.hero-noise sigue existiendo como capa propia (REQ-16-06)'
  );
  const block = css.match(/\.hero-background\s*\{[^}]*\}/s)?.[0] ?? '';
  assert.match(
    block,
    /color-mix\(in srgb, var\(--color-text\) 3%, transparent\)/,
    'el grano integrado no usa color-mix sobre el token --color-text (REQ-16-06)'
  );
  assert.match(
    block,
    /background\s*:\s*radial-gradient\(\s*color-mix\(in srgb, var\(--color-text\)/,
    'el patrón de puntos no es el primer background del shorthand (REQ-16-06)'
  );
  const gradients = (block.match(/radial-gradient\(/g) ?? []).length;
  assert.ok(
    gradients >= 2,
    `el fondo integrado tiene ${gradients} radial-gradient (debe conservar 2: grano + gradiente del hero, REQ-16-06)`
  );
  assert.match(
    block,
    /var\(--color-hero-(top|mid|bottom)\)/,
    'el gradiente del hero ya no sale de los tokens --color-hero-* (REQ-16-06, regresión Ronda 2)'
  );
});

test('REQ-16-07: los tokens de aspecto del fondo permanecen sin cambios', () => {
  const tokens = read(TOKENS_PATH, 'src/styles/tokens.css');
  assert.match(tokens, /--opacity-hero\s*:\s*0\.80\s*;/, '--opacity-hero no vale 0.80 (REQ-16-07)');
  assert.match(tokens, /--opacity-gol\s*:\s*0\.15\s*;/, '--opacity-gol no vale 0.15 (REQ-16-07)');
  assert.match(tokens, /--size-gol-cell\s*:\s*6px\s*;/, '--size-gol-cell no vale 6px (REQ-16-07)');
});

test('REQ-16-08: se conserva la accesibilidad de la feature 15 (reduced-motion, document.hidden, pointer-events none)', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  assert.match(
    driver,
    /matchMedia\(\s*['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/,
    'el driver ya no escucha prefers-reduced-motion (REQ-16-08)'
  );
  assert.match(
    driver,
    /reducedMotion\.matches/,
    'el driver ya no consulta reducedMotion.matches (fotograma estático, REQ-16-08)'
  );
  assert.match(driver, /document\.hidden/, 'el driver ya no consulta document.hidden (REQ-16-08)');
  assert.match(driver, /visibilitychange/, 'el driver ya no escucha visibilitychange (REQ-16-08)');
  assert.match(driver, /cancelAnimationFrame/, 'el driver ya no cancela el bucle al pausar (REQ-16-08)');
  const css = read(GOL_CSS_PATH, 'src/styles/game-of-life.css');
  assert.match(
    css,
    /\.gol-canvas\s*\{[^}]*pointer-events\s*:\s*none/s,
    'game-of-life.css ya no declara pointer-events: none para el lienzo (REQ-16-08)'
  );
});

test('REQ-16-09: el driver solo usa imports relativos, incluye el motor y no lo modifica', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  const imports = [...driver.matchAll(/^\s*import\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/gm)].map(
    (m) => m[1],
  );
  assert.ok(imports.length > 0, 'el driver no tiene imports (REQ-16-09)');
  for (const specifier of imports) {
    assert.ok(
      specifier.startsWith('./'),
      `el driver declara una dependencia externa: ${specifier} (REQ-16-09)`
    );
  }
  assert.ok(
    imports.some((specifier) => specifier.includes('game-of-life')),
    'el driver no importa el motor src/utils/game-of-life.ts (REQ-16-09)'
  );
  const engine = read(ENGINE_PATH, 'src/utils/game-of-life.ts');
  for (const symbol of ['createGrid', 'randomizeGrid', 'stepGrid', 'GameOfLifeError']) {
    assert.match(
      engine,
      new RegExp(`export\\s+(function|class)\\s+${symbol}\\b`),
      `el motor de la feature 14 ya no exporta ${symbol} (REQ-16-09, no se modifica)`
    );
  }
});

test('REQ-16-10: game-of-life-canvas.ts, sus imports relativos y hero-section.css no superan 100 líneas', () => {
  const scope = readDriverScope();
  const targets = [[DRIVER_PATH, 'game-of-life-canvas.ts'], [HERO_CSS_PATH, 'hero-section.css']];
  for (const specifier of scope.keys()) {
    if (specifier === 'game-of-life-canvas.ts') continue;
    targets.push([new URL(`../src/utils/${specifier}`, import.meta.url), specifier]);
  }
  for (const [path, label] of targets) {
    const lineCount = read(path, label).split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-16-10)`);
  }
});
