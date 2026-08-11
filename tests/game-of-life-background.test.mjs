// Test del fondo del Juego de la Vida (REQ-15-01..12, feature 15 game-of-life-background).
//
// Verifica contra specs/15_game-of-life-background/requirements.md y design.md:
//   REQ-15-01 — GameOfLifeBackground renderiza un canvas fijo de fondo con un
//               índice z inferior al contenido.
//   REQ-15-02 — el driver src/utils/game-of-life-canvas.ts anima el canvas con
//               JS vanilla (requestAnimationFrame), importa el engine de la
//               feature 14 y no declara dependencias externas.
//   REQ-15-03 — el driver dibuja con el color del token --color-accent leído
//               vía getComputedStyle.
//   REQ-15-04 — opacidad del lienzo inferior a 0.25 aplicada desde --opacity-gol.
//   REQ-15-05 — prefers-reduced-motion → fotograma estático sin animación.
//   REQ-15-06 — document.hidden → animación pausada (visibilitychange).
//   REQ-15-07 — siembra inicial con densidad ≤ 0.15.
//   REQ-15-08 — cuadrícula ajustada al viewport con celdas de --size-gol-cell.
//   REQ-15-09 — el layout único incluye el componente exactamente una vez.
//   REQ-15-10 — el canvas no captura eventos de puntero (pointer-events: none).
//   REQ-15-11 — tokens.css define --opacity-gol y --size-gol-cell (--grupo-nombre).
//   REQ-15-12 — el componente importa src/styles/game-of-life.css y la hoja
//               solo consume tokens (sin hex ni rgb()/rgba() sueltos).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENT_PATH = new URL('../src/components/GameOfLifeBackground.astro', import.meta.url);
const DRIVER_PATH = new URL('../src/utils/game-of-life-canvas.ts', import.meta.url);
const CSS_PATH = new URL('../src/styles/game-of-life.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);
const LAYOUT_PATH = new URL('../src/layouts/Layout.astro', import.meta.url);

function read(path, label) {
  assert.ok(existsSync(path), `${label} no existe`);
  return readFileSync(path, 'utf8');
}

test('REQ-15-01: el componente existe y renderiza un canvas fijo de fondo con z-index inferior', () => {
  const component = read(COMPONENT_PATH, 'src/components/GameOfLifeBackground.astro');
  assert.match(
    component,
    /<canvas/,
    'el componente no renderiza un lienzo canvas (REQ-15-01)'
  );
  assert.match(
    component,
    /class="gol-canvas"/,
    'el canvas no tiene la clase gol-canvas (REQ-15-01)'
  );
  const css = read(CSS_PATH, 'src/styles/game-of-life.css');
  assert.match(
    css,
    /\.gol-canvas\s*\{[^}]*position\s*:\s*fixed/s,
    'el canvas no está fijado al fondo (REQ-15-01)'
  );
  const zIndex = css.match(/\.gol-canvas\s*\{[^}]*z-index\s*:\s*(-?\d+)/s);
  assert.ok(zIndex, 'game-of-life.css no declara z-index para el canvas (REQ-15-01)');
  assert.ok(
    Number(zIndex[1]) < 0,
    `el z-index del canvas (${zIndex[1]}) no es inferior al contenido (REQ-15-01)`
  );
});

test('REQ-15-02: el driver importa el engine de la feature 14 y no tiene dependencias externas', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  const imports = [...driver.matchAll(/^\s*import\b[^;]*?\bfrom\s+['"]([^'"]+)['"]/gm)].map(
    (m) => m[1],
  );
  assert.ok(imports.length > 0, 'el driver no importa el engine de la feature 14 (REQ-15-02)');
  for (const specifier of imports) {
    assert.ok(
      specifier.startsWith('./'),
      `el driver declara una dependencia externa: ${specifier} (REQ-15-02)`
    );
  }
  assert.ok(
    imports.some((specifier) => specifier.includes('game-of-life')),
    'el driver no importa src/utils/game-of-life.ts (REQ-15-02)'
  );
  assert.match(
    driver,
    /\b(createGrid|randomizeGrid|stepGrid)\b/,
    'el driver no consume las funciones del engine (REQ-15-02)'
  );
  assert.match(
    driver,
    /requestAnimationFrame/,
    'el driver no anima con requestAnimationFrame (REQ-15-02)'
  );
});

test('REQ-15-03: el driver lee el color de --color-accent vía getComputedStyle', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  assert.match(
    driver,
    /getComputedStyle/,
    'el driver no usa getComputedStyle para leer el color (REQ-15-03)'
  );
  assert.match(
    driver,
    /getPropertyValue\(\s*['"]--color-accent['"]/,
    'el driver no lee el token --color-accent (REQ-15-03)'
  );
});

test('REQ-15-04: la opacidad del lienzo es inferior a 0.25 y sale del token --opacity-gol', () => {
  const tokens = read(TOKENS_PATH, 'src/styles/tokens.css');
  const opacity = tokens.match(/--opacity-gol\s*:\s*([^;]+);/);
  assert.ok(opacity, 'tokens.css no define --opacity-gol (REQ-15-04)');
  assert.ok(
    Number.parseFloat(opacity[1]) < 0.25,
    `--opacity-gol (${opacity[1]}) no es inferior a 0.25 (REQ-15-04)`
  );
  const css = read(CSS_PATH, 'src/styles/game-of-life.css');
  assert.match(
    css,
    /\.gol-canvas\s*\{[^}]*opacity\s*:\s*var\(--opacity-gol\)/s,
    'la opacidad del canvas no sale de var(--opacity-gol) (REQ-15-04)'
  );
});

test('REQ-15-05: prefers-reduced-motion dibuja un fotograma estático sin animación', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  assert.match(
    driver,
    /matchMedia\(\s*['"]\(prefers-reduced-motion:\s*reduce\)['"]\)/,
    'el driver no escucha prefers-reduced-motion (REQ-15-05)'
  );
  assert.match(
    driver,
    /reducedMotion\.matches/,
    'el driver no consulta reducedMotion.matches para el fotograma estático (REQ-15-05)'
  );
});

test('REQ-15-06: el driver pausa la animación mientras el documento está oculto', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  assert.match(
    driver,
    /document\.hidden/,
    'el driver no consulta document.hidden (REQ-15-06)'
  );
  assert.match(
    driver,
    /visibilitychange/,
    'el driver no escucha el evento visibilitychange (REQ-15-06)'
  );
  assert.match(
    driver,
    /cancelAnimationFrame/,
    'el driver no cancela el bucle al pausar (REQ-15-06)'
  );
});

test('REQ-15-07: la siembra inicial usa densidad no superior a 0.15', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  const density = driver.match(/SEED_DENSITY\s*=\s*([0-9.]+)/);
  assert.ok(density, 'el driver no declara la densidad de siembra SEED_DENSITY (REQ-15-07)');
  assert.ok(
    Number.parseFloat(density[1]) <= 0.15,
    `la densidad de siembra (${density[1]}) supera 0.15 (REQ-15-07)`
  );
  assert.match(
    driver,
    /randomizeGrid\s*\([^)]*SEED_DENSITY/,
    'la siembra no usa SEED_DENSITY con randomizeGrid (REQ-15-07)'
  );
});

test('REQ-15-08: la cuadrícula se ajusta al viewport con celdas de --size-gol-cell', () => {
  const driver = read(DRIVER_PATH, 'src/utils/game-of-life-canvas.ts');
  assert.match(
    driver,
    /window\.innerWidth/,
    'el driver no dimensiona según el ancho del viewport (REQ-15-08)'
  );
  assert.match(
    driver,
    /window\.innerHeight/,
    'el driver no dimensiona según el alto del viewport (REQ-15-08)'
  );
  assert.match(
    driver,
    /getPropertyValue\(\s*['"]--size-gol-cell['"]/,
    'el driver no lee el token --size-gol-cell (REQ-15-08)'
  );
  assert.match(
    driver,
    /canvas\.(width|height)\s*=\s*[^;]*cellSize/,
    'el tamaño del canvas no se calcula con el tamaño de celda (REQ-15-08)'
  );
});

test('REQ-15-09: el layout único incluye GameOfLifeBackground exactamente una vez', () => {
  const layout = read(LAYOUT_PATH, 'src/layouts/Layout.astro');
  assert.match(
    layout,
    /import\s+GameOfLifeBackground\s+from\s+['"][^'"]*GameOfLifeBackground\.astro['"]/,
    'el layout no importa GameOfLifeBackground (REQ-15-09)'
  );
  const uses = (layout.match(/<GameOfLifeBackground\s*\/>/g) ?? []).length;
  assert.equal(uses, 1, `el layout incluye el componente ${uses} veces (debe ser 1, REQ-15-09)`);
});

test('REQ-15-10: el canvas no captura eventos de puntero', () => {
  const css = read(CSS_PATH, 'src/styles/game-of-life.css');
  assert.match(
    css,
    /\.gol-canvas\s*\{[^}]*pointer-events\s*:\s*none/s,
    'game-of-life.css no declara pointer-events: none para el canvas (REQ-15-10)'
  );
});

test('REQ-15-11: tokens.css define --opacity-gol y --size-gol-cell con patrón --grupo-nombre', () => {
  const tokens = read(TOKENS_PATH, 'src/styles/tokens.css');
  for (const token of ['--opacity-gol', '--size-gol-cell']) {
    assert.match(
      tokens,
      new RegExp(`${token}\\s*:`),
      `tokens.css no define ${token} (REQ-15-11)`
    );
    assert.match(
      token,
      /^--[a-z]+-[a-z0-9-]+$/,
      `"${token}" no cumple el patrón --grupo-nombre (REQ-15-11)`
    );
  }
});

test('REQ-15-12: el componente importa game-of-life.css y la hoja solo consume tokens', () => {
  const component = read(COMPONENT_PATH, 'src/components/GameOfLifeBackground.astro');
  assert.match(
    component,
    /import\s+['"][^'"]*game-of-life\.css['"]/,
    'el componente no importa src/styles/game-of-life.css (REQ-15-12)'
  );
  const css = read(CSS_PATH, 'src/styles/game-of-life.css');
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    noComments,
    /#[0-9a-fA-F]{3,8}\b/,
    'game-of-life.css contiene un color hex hardcodeado (REQ-15-12)'
  );
  assert.doesNotMatch(
    noComments,
    /rgba?\(/,
    'game-of-life.css contiene rgb()/rgba() hardcodeado (REQ-15-12)'
  );
});

test('REQ-15-08: game-of-life.css aplica var() de --size-gol-cell', () => {
  const css = read(CSS_PATH, 'src/styles/game-of-life.css');
  assert.match(
    css,
    /var\(--size-gol-cell\)/,
    'game-of-life.css no aplica var(--size-gol-cell) (REQ-15-08/acceptance)'
  );
});

test('Convención: los archivos de la feature no superan las 100 líneas', () => {
  for (const [path, label] of [
    [COMPONENT_PATH, 'GameOfLifeBackground.astro'],
    [DRIVER_PATH, 'game-of-life-canvas.ts'],
    [CSS_PATH, 'game-of-life.css'],
  ]) {
    const lineCount = read(path, label).split('\n').length;
    assert.ok(
      lineCount <= 100,
      `${label} tiene ${lineCount} líneas (máximo 100)`
    );
  }
});

test('Convención: el componente no tiene estilos embebidos ni lógica en el script', () => {
  const component = read(COMPONENT_PATH, 'src/components/GameOfLifeBackground.astro');
  assert.doesNotMatch(component, /<style/i, 'el componente contiene un bloque <style> embebido');
  assert.doesNotMatch(component, /\bstyle\s*=/, 'el componente conserva el atributo style inline');
  assert.match(
    component,
    /<script/,
    'el componente no tiene un <script> de arranque (Decisión 3 del design.md)'
  );
  assert.match(
    component,
    /game-of-life-canvas\.ts/,
    'el <script> no importa el driver src/utils/game-of-life-canvas.ts (Decisión 3)'
  );
  assert.match(
    component,
    /mountGameOfLife/,
    'el <script> no llama a mountGameOfLife (Decisión 3)'
  );
  assert.doesNotMatch(
    component,
    /\bfor\s*\(|\bwhile\s*\(|\bif\s*\(/,
    'el <script> contiene lógica (solo imports y arranque, Decisión 3)'
  );
});

// === Ronda 2 (CHANGES_REQUESTED del reviewer) ===
//
// Decisión de diseño (specs/15_game-of-life-background/design.md, Decisión 6):
// el fondo del hero se vuelve translúcido para que el GOL se vea tras él.
// La opacidad se aplica SOLO al elemento del fondo (.hero-background) vía el
// token --opacity-hero, nunca al contenedor .new-hero: así el contenido del
// hero (texto y tarjetas) mantiene el 100% de contraste (respuesta a la
// observación del reviewer sobre el literal opacity: 0.85 en .new-hero).

const HERO_SECTION_CSS_PATH = new URL('../src/styles/hero-section.css', import.meta.url);

test('Ronda 2: .new-hero no declara opacity (el contenido del hero no se atenúa)', () => {
  const css = read(HERO_SECTION_CSS_PATH, 'src/styles/hero-section.css');
  const block = css.match(/\.new-hero\s*\{[^}]*\}/s)?.[0] ?? '';
  assert.ok(block, 'hero-section.css no contiene el selector .new-hero');
  assert.doesNotMatch(
    block,
    /opacity\s*:/,
    '.new-hero declara opacity (atenúa el contenido; el fondo translúcido vive en .hero-background, Decisión 6)'
  );
});

test('Ronda 2: el fondo del hero es translúcido vía var(--opacity-hero) y queda detrás del contenido', () => {
  const css = read(HERO_SECTION_CSS_PATH, 'src/styles/hero-section.css');
  const block = css.match(/\.hero-background\s*\{[^}]*\}/s)?.[0] ?? '';
  assert.ok(block, 'hero-section.css no contiene el selector .hero-background');
  assert.match(
    block,
    /opacity\s*:\s*var\(--opacity-hero\)/,
    'el fondo del hero no usa var(--opacity-hero) (Decisión 6)'
  );
  assert.match(
    block,
    /z-index\s*:\s*-1/,
    'el fondo del hero no tiene z-index -1 (detrás del contenido, encima del canvas GOL global)'
  );
  assert.match(
    block,
    /background\s*:\s*radial-gradient\([^}]*var\(--color-hero-(top|mid|bottom)\)/,
    'el gradiente del fondo del hero no sale de los tokens --color-hero-* (Decisión 6)'
  );
});

test('Ronda 2: hero-section.css no conserva el literal opacity: 0.85 ni opacidades sueltas en .new-hero', () => {
  const css = read(HERO_SECTION_CSS_PATH, 'src/styles/hero-section.css');
  assert.doesNotMatch(
    css,
    /opacity\s*:\s*0\.85/,
    'hero-section.css conserva el literal opacity: 0.85 (debe salir de un token)'
  );
});

test('Ronda 2: tokens.css define --opacity-hero con patrón --grupo-nombre y valor sutil', () => {
  const tokens = read(TOKENS_PATH, 'src/styles/tokens.css');
  const hero = tokens.match(/--opacity-hero\s*:\s*([^;]+);/);
  assert.ok(hero, 'tokens.css no define --opacity-hero (Decisión 6)');
  const value = Number.parseFloat(hero[1]);
  assert.ok(
    value > 0 && value < 1,
    `--opacity-hero (${hero[1]}) debe estar entre 0 y 1 (Decisión 6)`
  );
  assert.match(
    '--opacity-hero',
    /^--[a-z]+-[a-z0-9-]+$/,
    '"--opacity-hero" no cumple el patrón --grupo-nombre'
  );
});
