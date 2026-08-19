// Test de la re-inicialización de los controladores de búsqueda en cada
// navegación suave (feature 10 client-init-on-navigation, REQ-10-01..09).
// Patrón mixto del arnés: unitarios por import directo del controlador
// (guard de initSearchLive con document fake contable) + inspección por
// regex sobre los 4 <script> de componentes (listener astro:page-load en
// lugar de llamada directa) y sobre los comentarios de search-escape.ts.
//
//   REQ-10-01..05 — los 4 <script> registran la init como listener del
//                   evento astro:page-load (carga inicial + cada navegación).
//   REQ-10-06 — una segunda llamada a initSearchLive sustituye el listener
//               del evento de cambio sin acumular manejadores.
//   REQ-10-07 — la re-inicialización es un no-op seguro sin el DOM del control.
//   REQ-10-08 — los tests de arranque de las features 3/4/5/6 asercionan el
//               patrón astro:page-load (justificación en research D6).
//   REQ-10-09 — el comentario de cabecera de search-escape.ts declara la
//               ejecución única de los módulos empaquetados y el re-init vía
//               astro:page-load.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { initSearchLive } from '../src/components/search-live/search-live.ts';

const RESULTS_URL = new URL(
  '../src/components/search-results/search-results.astro',
  import.meta.url,
);
const BAR_URL = new URL('../src/components/search-bar/search-bar.astro', import.meta.url);
const LIVE_URL = new URL('../src/components/search-live/search-live.astro', import.meta.url);
const ESCAPE_URL = new URL(
  '../src/components/search-escape/search-escape.astro',
  import.meta.url,
);
const LIVE_TS_URL = new URL('../src/components/search-live/search-live.ts', import.meta.url);
const ESCAPE_TS_URL = new URL(
  '../src/components/search-escape/search-escape.ts',
  import.meta.url,
);
const RESEARCH_URL = new URL(
  '../progress/research/client-init-on-navigation.md',
  import.meta.url,
);

// Stub global de HTMLInputElement para el wiring de initSearchLive (node:test
// no tiene DOM; el controlador comprueba el input con instanceof, REQ-10-07).
globalThis.HTMLInputElement = class {};

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function read(url) {
  assert.ok(existsSync(url), `${url} no existe`);
  return readFileSync(url, 'utf8');
}

// Document fake contable: registra add/removeEventListener y devuelve el DOM
// del panel en vivo (patrón de wiring con DOM fake de las features 3/4/5).
function fakeDoc({ panel = { toggleAttribute: () => {} } } = {}) {
  const calls = { add: [], remove: [], listeners: new Map() };
  const doc = {
    addEventListener: (type, fn) => {
      calls.add.push([type, fn]);
      const list = calls.listeners.get(type) ?? [];
      list.push(fn);
      calls.listeners.set(type, list);
    },
    removeEventListener: (type, fn) => {
      calls.remove.push([type, fn]);
      const list = calls.listeners.get(type) ?? [];
      calls.listeners.set(
        type,
        list.filter((f) => f !== fn),
      );
    },
    querySelector: (selector) => (selector === '[data-search-live]' ? panel : null),
    getElementById: (id) => (id === 'search-index' ? { textContent: '[]' } : null),
  };
  return { calls, doc };
}

// --- REQ-10-06 / REQ-10-07: guard de idempotencia de initSearchLive --------

test('REQ-10-06: dos llamadas a initSearchLive dejan UN solo listener del evento de cambio', () => {
  const { calls, doc } = fakeDoc();
  globalThis.document = doc;
  try {
    initSearchLive();
    initSearchLive();
    const active = calls.listeners.get('search:change') ?? [];
    assert.equal(active.length, 1, 'la re-init acumuló listeners del evento de cambio');
    assert.equal(calls.add.length, 2, 'la segunda llamada no volvió a registrar el listener');
    assert.equal(calls.remove.length, 1, 'la segunda llamada no sustituyó el listener previo');
    assert.equal(calls.remove[0][0], 'search:change', 'se eliminó un listener de otro evento');
    assert.equal(active[0], calls.add[1][1], 'el listener activo no es el de la última llamada');
  } finally {
    delete globalThis.document;
  }
});

test('REQ-10-07: sin el DOM del panel la re-inicialización es un no-op seguro', () => {
  const { calls, doc } = fakeDoc({ panel: null });
  globalThis.document = doc;
  try {
    initSearchLive();
    assert.equal(calls.add.length, 0, 'sin panel no debe registrar listeners');
    assert.equal(calls.listeners.size, 0, 'sin panel no debe quedar ningún listener');
  } finally {
    delete globalThis.document;
  }
});

// --- REQ-10-01..05: arranque con listener astro:page-load -------------------

test('REQ-10-01/05: search-results.astro arranca con listener astro:page-load', () => {
  const component = read(RESULTS_URL);
  assert.match(
    component,
    /import\s*\{[^}]*initSearchResults[^}]*\}\s*from\s*['"][^'"]*search-results-controller\.ts['"]/,
    'el <script> no importa el controlador (regla 8)',
  );
  assert.match(
    component,
    /document\.addEventListener\(['"]astro:page-load['"]/,
    'el <script> no registra la init como listener de astro:page-load (REQ-10-01)',
  );
  assert.match(component, /=>\s*initSearchResults\(\)/, 'el listener no invoca initSearchResults');
  assert.doesNotMatch(
    component,
    /^\s*initSearchResults\(\);?\s*$/m,
    'el <script> conserva la llamada directa (REQ-10-05)',
  );
});

test('REQ-10-02/05: search-bar.astro arranca con listener y conserva navigate', () => {
  const component = read(BAR_URL);
  assert.match(
    component,
    /import\s*\{[^}]*initSearchBar[^}]*\}\s*from\s*['"][^'"]*search-bar\.ts['"]/,
    'el <script> no importa el control (regla 8)',
  );
  assert.match(
    component,
    /import\s*\{[^}]*navigate[^}]*\}\s*from\s*['"][^'"]*astro:transitions\/client['"]/,
    'el <script> perdió el import de navigate (REQ-04-05)',
  );
  assert.match(
    component,
    /document\.addEventListener\(['"]astro:page-load['"]/,
    'el <script> no registra la init como listener de astro:page-load (REQ-10-02)',
  );
  assert.match(component, /=>\s*initSearchBar\(navigate\)/, 'el listener no invoca initSearchBar');
  assert.doesNotMatch(
    component,
    /^\s*initSearchBar\([^;]*\);?\s*$/m,
    'el <script> conserva la llamada directa (REQ-10-05)',
  );
});

test('REQ-10-03/05: search-live.astro arranca con listener astro:page-load', () => {
  const component = read(LIVE_URL);
  assert.match(
    component,
    /import\s*\{[^}]*initSearchLive[^}]*\}\s*from\s*['"][^'"]*search-live\.ts['"]/,
    'el <script> no importa el controlador (regla 8)',
  );
  assert.match(
    component,
    /document\.addEventListener\(['"]astro:page-load['"]/,
    'el <script> no registra la init como listener de astro:page-load (REQ-10-03)',
  );
  assert.match(component, /=>\s*initSearchLive\(\)/, 'el listener no invoca initSearchLive');
  assert.doesNotMatch(
    component,
    /^\s*initSearchLive\(\);?\s*$/m,
    'el <script> conserva la llamada directa (REQ-10-05)',
  );
});

test('REQ-10-04/05: search-escape.astro arranca con listener astro:page-load', () => {
  const component = read(ESCAPE_URL);
  assert.match(
    component,
    /import\s*\{[^}]*initSearchEscape[^}]*\}\s*from\s*['"][^'']*search-escape\.ts['"]/,
    'el <script> no importa el controlador (regla 8)',
  );
  assert.match(
    component,
    /document\.addEventListener\(['"]astro:page-load['"]/,
    'el <script> no registra la init como listener de astro:page-load (REQ-10-04)',
  );
  assert.match(component, /=>\s*initSearchEscape\(\)/, 'el listener no invoca initSearchEscape');
  assert.doesNotMatch(
    component,
    /^\s*initSearchEscape\(\);?\s*$/m,
    'el <script> conserva la llamada directa (REQ-10-05)',
  );
});

// --- REQ-10-08: tests de arranque de features 3/4/5/6 ajustados -------------

test('REQ-10-08: los tests de arranque de las features 3/4/5/6 asercionan astro:page-load', () => {
  for (const file of [
    'tests/search-dedicated-view.test.mjs',
    'tests/search-bar-header.test.mjs',
    'tests/search-landing-live-transition.test.mjs',
    'tests/search-keyboard-escape.test.mjs',
  ]) {
    const content = read(new URL(`../${file}`, import.meta.url));
    assert.match(content, /astro:page-load/, `${file} no aserciona el listener astro:page-load`);
  }
});

test('REQ-10-08: la justificación de cada ajuste queda en el research (D6)', () => {
  const research = read(RESEARCH_URL);
  assert.match(research, /D6/, 'el research no documenta el ajuste de tests (D6)');
  assert.match(research, /astro:page-load/, 'el research no declara el patrón astro:page-load');
  assert.match(
    research,
    /search-dedicated-view\.test\.mjs/,
    'el research no lista el ajuste de search-dedicated-view',
  );
  assert.match(
    research,
    /search-keyboard-escape\.test\.mjs/,
    'el research no lista el ajuste de search-keyboard-escape',
  );
});

// --- REQ-10-09: comentario de cabecera de search-escape.ts ------------------

test('REQ-10-09: search-escape.ts declara ejecución única y re-init con astro:page-load', () => {
  const controller = read(ESCAPE_TS_URL);
  assert.match(
    controller,
    /una única vez por sesión|una sola vez por sesión|una vez por sesión/,
    'el comentario no declara la ejecución única de los módulos empaquetados (REQ-10-09)',
  );
  assert.match(
    controller,
    /astro:page-load/,
    'el comentario no declara la re-inicialización con astro:page-load (REQ-10-09)',
  );
  assert.match(
    controller,
    /removeEventListener/,
    'se perdió el guard de re-init (removeEventListener antes de add)',
  );
});

// --- Restricciones del arnés ------------------------------------------------

test('REQ-10-00: ≤100 líneas en los 4 scripts y los 2 controladores tocados', () => {
  for (const [name, url] of [
    ['search-results.astro', RESULTS_URL],
    ['search-bar.astro', BAR_URL],
    ['search-live.astro', LIVE_URL],
    ['search-escape.astro', ESCAPE_URL],
    ['search-live.ts', LIVE_TS_URL],
    ['search-escape.ts', ESCAPE_TS_URL],
  ]) {
    const lines = countLines(read(url));
    assert.ok(lines <= 100, `${name} tiene ${lines} líneas (máximo 100)`);
  }
});