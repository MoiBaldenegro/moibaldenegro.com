// Test del soporte de teclado Escape de la búsqueda (feature 6
// search-keyboard-escape, REQ-06-01..04). Patrón mixto del arnés (precedente
// de search-landing-live-transition.test.mjs): unitarios por import directo
// del controlador .ts puro (sin document/window en ámbito de módulo) + wiring
// con DOM fake + inspección por regex sobre Layout.astro, el componente y el
// controlador.
//
//   REQ-06-01 — Escape con búsqueda activa en la portada: vacía la consulta
//               (clearQuery, feature 4) y restaura las secciones habituales
//               (applyLive, feature 5).
//   REQ-06-02 — Escape con consulta activa en la vista /search: limpia la
//               consulta (removeQueryParam, feature 3) y muestra el estado
//               inicial (guía visible, sin resultados).
//   REQ-06-03 — Escape con consulta vacía: ninguna acción (no-op).
//   REQ-06-04 — el manejador SIEMPRE detiene la propagación del evento.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  escapeContext,
  escapeAction,
  activeTerm,
  initSearchEscape,
} from '../src/components/search-escape/search-escape.ts';
import { emitChange } from '../src/components/search-bar/search-bar.ts';

const LAYOUT_URL = new URL('../src/layouts/Layout.astro', import.meta.url);
const COMPONENT_URL = new URL(
  '../src/components/search-escape/search-escape.astro',
  import.meta.url,
);
const CONTROLLER_URL = new URL(
  '../src/components/search-escape/search-escape.ts',
  import.meta.url,
);

// Stub global de document/window para los tests de wiring (precedente
// search-bar-header.test.mjs): el controlador solo toca document/window
// dentro de las funciones de wiring, nunca en ámbito de módulo.
const dispatched = [];
globalThis.document = { dispatchEvent: (event) => dispatched.push(event) };
globalThis.window = { location: { search: '' }, history: { replaceState: () => {} } };

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readLayout() {
  assert.ok(existsSync(LAYOUT_URL), 'src/layouts/Layout.astro no existe (REQ-06-01)');
  return readFileSync(LAYOUT_URL, 'utf8');
}

function readComponent() {
  assert.ok(
    existsSync(COMPONENT_URL),
    'src/components/search-escape/search-escape.astro no existe (REQ-06-01)',
  );
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readController() {
  assert.ok(
    existsSync(CONTROLLER_URL),
    'src/components/search-escape/search-escape.ts no existe (REQ-06-04)',
  );
  return readFileSync(CONTROLLER_URL, 'utf8');
}

// Raíz fake: detecta el contexto por data-* y registra keydown (inyección de
// DOM, patrón features 3/4/5).
function fakeRoot({ guide = false } = {}) {
  const calls = { stop: [], panelHidden: [], landingHidden: [] };
  const listeners = {};
  const panel = { toggleAttribute: (_name, force) => calls.panelHidden.push(force) };
  const landing = { toggleAttribute: (_name, force) => calls.landingHidden.push(force) };
  const root = {
    querySelector: (selector) => {
      if (selector === '[data-search-live]') return guide ? null : panel;
      if (selector === '[data-search-guide]') return guide ? {} : null;
      if (selector === '[data-landing-sections]') return guide ? null : landing;
      return null;
    },
    addEventListener: (type, fn) => {
      listeners[type] = fn;
    },
    removeEventListener: (type, fn) => {
      if (listeners[type] === fn) delete listeners[type];
    },
  };
  return { root, panel, landing, listeners, calls };
}

// Barra fake para clearQuery (feature 4): input con value/focus y clase.
function fakeBar() {
  const input = {
    value: 'agilismo',
    focusCalls: 0,
    focus() {
      this.focusCalls += 1;
    },
  };
  const toggles = [];
  const barRoot = {
    querySelector: (selector) => (selector === 'input' ? input : null),
    classList: { toggle: (name, force) => toggles.push([name, force]) },
  };
  return { input, barRoot };
}

// Document fake para la vista /search: título + toggles data-search-*.
function fakeDoc(titleValue) {
  const toggles = { guide: [], empty: [], list: [], pagination: [] };
  const doc = {
    title: titleValue,
    dispatchEvent: (event) => dispatched.push(event),
    querySelector: (selector) => {
      const match = selector.match(/data-search-(guide|empty|list|pagination)/);
      if (match === null) return null;
      const name = match[1];
      return { toggleAttribute: (_n, force) => toggles[name].push(force) };
    },
  };
  return { doc, toggles };
}

function fireEscape(listeners, calls) {
  listeners.keydown({ key: 'Escape', stopPropagation: () => calls.stop.push(1) });
}

// --- REQ-06-03 / REQ-06-01 / REQ-06-02: función de decisión pura ------------

test('REQ-06-03: escapeAction con consulta vacía → none (sin acción)', () => {
  assert.equal(escapeAction('', 'landing'), 'none');
  assert.equal(escapeAction('   ', 'search'), 'none');
  assert.equal(escapeAction('', 'none'), 'none');
});

test('REQ-06-01: escapeAction en la portada con consulta activa → clear-landing', () => {
  assert.equal(escapeAction('agilismo', 'landing'), 'clear-landing');
  assert.equal(escapeAction(' a ', 'landing'), 'clear-landing');
});

test('REQ-06-02: escapeAction en la vista /search con consulta activa → clear-search', () => {
  assert.equal(escapeAction('agilismo', 'search'), 'clear-search');
});

test('REQ-06-00: escapeAction fuera de portada y /search → none', () => {
  assert.equal(escapeAction('agilismo', 'none'), 'none');
});

test('REQ-06-01/02: escapeContext detecta la portada y la vista por data-*', () => {
  const landing = { querySelector: (s) => (s === '[data-search-live]' ? {} : null) };
  assert.equal(escapeContext(landing), 'landing');
  const search = {
    querySelector: (s) => (s === '[data-search-live]' ? null : s === '[data-search-guide]' ? {} : null),
  };
  assert.equal(escapeContext(search), 'search');
  assert.equal(escapeContext({ querySelector: () => null }), 'none');
});

test('REQ-06-02: activeTerm en /search lee q de la URL (deep linking, feature 3)', () => {
  assert.equal(activeTerm('search', '?q=agilismo'), 'agilismo');
  assert.equal(activeTerm('search', '?q=  x  '), 'x');
  assert.equal(activeTerm('search', ''), '');
});

test('REQ-06-01: activeTerm en la portada lee la consulta en memoria de la barra (feature 4)', () => {
  emitChange('hola');
  assert.equal(activeTerm('landing', '?q=otra'), 'hola');
  emitChange('   ');
  assert.equal(activeTerm('landing', '?q=otra'), '');
});

// --- REQ-06-01 (wiring): Escape en la portada --------------------------------

test('REQ-06-01 (wiring): Escape en la portada vacía la consulta y restaura las secciones', () => {
  globalThis.window = { location: { search: '' }, history: { replaceState: () => {} } };
  const { root, panel, landing, listeners, calls } = fakeRoot();
  const { input, barRoot } = fakeBar();
  emitChange('agilismo'); // consulta activa en memoria (REQ-04-02)
  initSearchEscape(root, barRoot, 'moibaldenegro.com');
  fireEscape(listeners, calls);
  assert.equal(input.value, '', 'Escape no vació la consulta de la barra (REQ-06-01)');
  assert.equal(input.focusCalls, 1, 'Escape no devolvió el foco a la barra (REQ-06-01)');
  assert.equal(calls.panelHidden.at(-1), true, 'Escape no ocultó el panel en vivo (REQ-06-01)');
  assert.equal(calls.landingHidden.at(-1), false, 'Escape no restauró las secciones (REQ-06-01)');
  assert.equal(calls.stop.length, 1, 'Escape no detuvo la propagación (REQ-06-04)');
});

test('REQ-06-01: la portada detecta el contexto por el panel en vivo (inspección)', () => {
  const controller = readController();
  assert.match(controller, /data-search-live/, 'el controlador no detecta la portada');
  assert.match(controller, /data-landing-sections/, 'el controlador no restaura las secciones');
});

// --- REQ-06-02 (wiring): Escape en la vista /search --------------------------

test('REQ-06-02 (wiring): Escape en /search limpia la consulta y muestra el estado inicial', () => {
  const replace = [];
  globalThis.window = {
    location: { search: '?q=agilismo', pathname: '/search' },
    history: { replaceState: (...args) => replace.push(args) },
  };
  const { doc, toggles } = fakeDoc('Búsqueda');
  globalThis.document = doc;
  const { root, listeners, calls } = fakeRoot({ guide: true });
  initSearchEscape(root, null, 'Búsqueda');
  fireEscape(listeners, calls);
  assert.deepEqual(replace, [[null, '', '/search']], 'Escape no eliminó q de la URL (REQ-06-02)');
  assert.equal(toggles.guide.at(-1), false, 'Escape no mostró la guía (estado inicial, REQ-06-02)');
  assert.equal(toggles.empty.at(-1), true, 'Escape no ocultó el empty state (REQ-06-02)');
  assert.equal(toggles.list.at(-1), true, 'Escape no ocultó la lista (REQ-06-02)');
  assert.equal(toggles.pagination.at(-1), true, 'Escape no ocultó la paginación (REQ-06-02)');
  assert.equal(doc.title, 'Búsqueda', 'Escape no restauró el título base');
  assert.equal(calls.stop.length, 1, 'Escape no detuvo la propagación (REQ-06-04)');
});

test('REQ-06-03 (wiring): Escape en /search sin q no ejecuta ninguna acción', () => {
  const replace = [];
  globalThis.window = {
    location: { search: '', pathname: '/search' },
    history: { replaceState: (...args) => replace.push(args) },
  };
  const { doc } = fakeDoc('Búsqueda');
  globalThis.document = doc;
  const { root, listeners, calls } = fakeRoot({ guide: true });
  initSearchEscape(root, null, 'Búsqueda');
  fireEscape(listeners, calls);
  assert.equal(replace.length, 0, 'Escape sin consulta no debe tocar la URL (REQ-06-03)');
  assert.equal(calls.stop.length, 1, 'Escape siempre detiene la propagación (REQ-06-04)');
});

test('REQ-06-02: la limpieza reutiliza removeQueryParam de la feature 3 (inspección)', () => {
  const controller = readController();
  assert.match(
    controller,
    /search-results-controller\.ts/,
    'el controlador no importa la vista dedicada (feature 3, REQ-06-02)',
  );
  assert.match(controller, /removeQueryParam/, 'no reutiliza removeQueryParam (REQ-06-02)');
});

// --- REQ-06-03 (wiring): consulta vacía = no-op ------------------------------

test('REQ-06-03 (wiring): Escape en la portada con consulta vacía no ejecuta ninguna acción', () => {
  globalThis.window = { location: { search: '' }, history: { replaceState: () => {} } };
  const { root, listeners, calls } = fakeRoot();
  const { input, barRoot } = fakeBar();
  emitChange('');
  initSearchEscape(root, barRoot, 't');
  fireEscape(listeners, calls);
  assert.equal(input.value, 'agilismo', 'Escape con consulta vacía no debe tocar el input (REQ-06-03)');
  assert.equal(calls.panelHidden.length, 0, 'Escape con consulta vacía no debe alternar el panel (REQ-06-03)');
  assert.equal(calls.stop.length, 1, 'Escape siempre detiene la propagación (REQ-06-04)');
});

// --- REQ-06-04: propagación y otras teclas -----------------------------------

test('REQ-06-04 (wiring): otra tecla no dispara acción ni detiene la propagación', () => {
  const replace = [];
  globalThis.window = {
    location: { search: '?q=x', pathname: '/search' },
    history: { replaceState: (...args) => replace.push(args) },
  };
  const { root, listeners, calls } = fakeRoot({ guide: true });
  initSearchEscape(root, null, 'Búsqueda');
  listeners.keydown({ key: 'Enter', stopPropagation: () => calls.stop.push(1) });
  listeners.keydown({ key: 'a', stopPropagation: () => calls.stop.push(1) });
  assert.equal(calls.stop.length, 0, 'otra tecla no debe detener la propagación (REQ-06-04)');
  assert.equal(replace.length, 0, 'otra tecla no debe ejecutar la limpieza');
});

test('REQ-06-04: el manejador detiene la propagación siempre (inspección)', () => {
  const controller = readController();
  assert.match(controller, /stopPropagation/, 'el manejador no detiene la propagación (REQ-06-04)');
  assert.match(controller, /addEventListener/, 'el controlador no registra el manejador');
  assert.match(controller, /keydown/, 'el manejador no se registra en keydown');
  assert.match(controller, /Escape/, 'el manejador no comprueba la tecla Escape');
});

test('REQ-06-00: la re-ejecución del arranque no duplica el manejador (view transitions)', () => {
  const { root, listeners } = fakeRoot();
  initSearchEscape(root, null, 't');
  initSearchEscape(root, null, 't');
  assert.equal(Object.keys(listeners).length, 1, 'el arranque duplicó el manejador keydown');
  assert.equal(typeof listeners.keydown, 'function');
});

// --- Inspección: arranque integrado y reutilización de APIs ------------------

test('REQ-06-01: Layout.astro integra el arranque junto a la barra y conserva ClientRouter', () => {
  const layout = readLayout();
  assert.match(
    layout,
    /import\s+SearchEscape\s+from\s+['"][^'"]*search-escape\/search-escape\.astro['"]/,
    'el layout no importa el componente de Escape',
  );
  assert.match(layout, /<SearchEscape\s*\/>/, 'el layout no integra el componente de Escape');
  assert.match(layout, /<SearchBar\s*\/>/, 'el layout perdió la barra de búsqueda (REQ-04-01)');
  assert.match(layout, /ClientRouter/, 'el layout perdió ClientRouter (REQ-24-01)');
});

test('REQ-06-00: el componente arranca el controlador desde su script (regla 8)', () => {
  const component = readComponent();
  assert.match(
    component,
    /import\s*\{[^}]*initSearchEscape[^}]*\}\s*from\s*['"][^'']*search-escape\.ts['"]/,
    'el <script> no importa el controlador (regla 8)',
  );
  assert.match(
    component,
    /document\.addEventListener\(['"]astro:page-load['"]/,
    'el <script> no registra la init como listener de astro:page-load (feature 10)',
  );
  assert.match(
    component,
    /=>\s*initSearchEscape\(\)/,
    'el listener no invoca initSearchEscape (feature 10)',
  );
  assert.doesNotMatch(
    component,
    /^\s*initSearchEscape\(\);?\s*$/m,
    'el <script> conserva la llamada directa (feature 10 la sustituye)',
  );
  assert.doesNotMatch(component, /<style/i, 'el componente contiene un bloque <style> embebido');
  assert.doesNotMatch(component, /\bstyle\s*=/, 'el componente conserva atributos style inline');
});

test('REQ-06-01/02: el controlador reutiliza las APIs de las features 3/4/5 por import', () => {
  const controller = readController();
  assert.match(controller, /search-bar\.ts/, 'no importa la barra (feature 4)');
  assert.match(controller, /clearQuery/, 'no reutiliza clearQuery (REQ-06-01)');
  assert.match(controller, /activeQuery/, 'no reutiliza activeQuery (feature 4)');
  assert.match(controller, /search-live\.ts/, 'no importa el panel en vivo (feature 5)');
  assert.match(controller, /applyLive/, 'no reutiliza applyLive (REQ-06-01)');
  assert.doesNotMatch(
    controller,
    /from ['"](react|vue|svelte|preact|solid|astro:transitions)/,
    'el controlador no debe depender de frameworks ni del router (sin dependencias)',
  );
});

// --- Restricciones del arnés -------------------------------------------------

test('REQ-06-00: ≤100 líneas en layout, componente y controlador', () => {
  for (const [name, url] of [
    ['src/layouts/Layout.astro', LAYOUT_URL],
    ['src/components/search-escape/search-escape.astro', COMPONENT_URL],
    ['src/components/search-escape/search-escape.ts', CONTROLLER_URL],
  ]) {
    const lines = countLines(readFileSync(url, 'utf8'));
    assert.ok(lines <= 100, `${name} tiene ${lines} líneas (máximo 100)`);
  }
});