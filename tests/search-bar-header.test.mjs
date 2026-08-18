// Test de la barra de búsqueda del header (feature 4 search-bar-header,
// REQ-04-01..08). Patrón mixto del arnés (precedente de
// search-dedicated-view.test.mjs): unitarios por import directo del control
// .ts puro (sin document/window en ámbito de módulo) + wiring con DOM fake +
// inspección por regex sobre Layout.astro, el componente, el controlador y la
// hoja.
//
//   REQ-04-01 — el header del layout incluye la barra con un input de texto.
//   REQ-04-02 — el control mantiene la consulta activa en memoria.
//   REQ-04-03 — el botón X se muestra solo con consulta no vacía
//               (clase is-filled sobre la barra, design.md Decisión 2).
//   REQ-04-04 — al activar el botón X vacía la consulta y devuelve el foco.
//   REQ-04-05 — Enter con consulta no vacía navega a /search?q=<consulta>.
//   REQ-04-06 — Enter con consulta vacía omite la navegación.
//   REQ-04-07 — el control emite un evento de cambio de consulta (search:change).
//   REQ-04-08 — el input declara aria-label.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  isFilled,
  searchUrl,
  submitQuery,
  changeEventName,
  activeQuery,
  emitChange,
  clearQuery,
  initSearchBar,
} from '../src/components/search-bar/search-bar.ts';

const LAYOUT_URL = new URL('../src/layouts/Layout.astro', import.meta.url);
const COMPONENT_URL = new URL('../src/components/search-bar/search-bar.astro', import.meta.url);
const CONTROLLER_URL = new URL('../src/components/search-bar/search-bar.ts', import.meta.url);
const CSS_URL = new URL('../src/styles/search-bar.css', import.meta.url);

// Stub de document para los tests de wiring (node:test no tiene DOM; el
// control solo usa document para despachar el CustomEvent, REQ-04-07).
const dispatched = [];
globalThis.document = { dispatchEvent: (event) => dispatched.push(event) };

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readLayout() {
  assert.ok(existsSync(LAYOUT_URL), 'src/layouts/Layout.astro no existe (REQ-04-01)');
  return readFileSync(LAYOUT_URL, 'utf8');
}

function readComponent() {
  assert.ok(
    existsSync(COMPONENT_URL),
    'src/components/search-bar/search-bar.astro no existe (REQ-04-01)',
  );
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readController() {
  assert.ok(
    existsSync(CONTROLLER_URL),
    'src/components/search-bar/search-bar.ts no existe (REQ-04-02)',
  );
  return readFileSync(CONTROLLER_URL, 'utf8');
}

function readCss() {
  assert.ok(
    existsSync(CSS_URL),
    'src/styles/search-bar.css no existe (design.md Decisión 1)',
  );
  return readFileSync(CSS_URL, 'utf8');
}

// DOM fake mínimo para el wiring del control (inyección de raíz/input/botón).
function fakeDom() {
  dispatched.length = 0;
  const listeners = {};
  const input = {
    value: '',
    focusCalls: 0,
    addEventListener: (type, fn) => {
      listeners[type] = fn;
    },
    focus: () => {
      input.focusCalls += 1;
    },
  };
  const clear = {
    clickFns: [],
    addEventListener: (type, fn) => {
      if (type === 'click') clear.clickFns.push(fn);
    },
  };
  const toggles = [];
  const root = {
    classList: {
      toggle: (name, force) => toggles.push([name, force]),
    },
    querySelector: (selector) => {
      if (selector === 'input') return input;
      if (selector === '[data-search-clear]') return clear;
      return null;
    },
  };
  return { listeners, input, clear, toggles, root };
}

function fire(fake, type, event = {}) {
  fake.listeners[type]?.(event);
}

// --- REQ-04-03 / REQ-04-04: botón X y limpieza con retorno de foco ---------

test('REQ-04-03: isFilled — el botón X solo con consulta no vacía', () => {
  assert.equal(isFilled(''), false);
  assert.equal(isFilled('   '), false);
  assert.equal(isFilled('agilismo'), true);
  assert.equal(isFilled(' agilismo '), true);
});

test('REQ-04-03/04 (wiring): el input marca is-filled y el botón X vacía y devuelve el foco', () => {
  const fake = fakeDom();
  initSearchBar(() => {}, fake.root);
  fake.input.value = 'agilismo';
  fire(fake, 'input');
  assert.ok(
    fake.toggles.some(([name, force]) => name === 'is-filled' && force === true),
    'con consulta la barra no pasa a is-filled (REQ-04-03)',
  );
  fake.input.value = '';
  fire(fake, 'input');
  assert.ok(
    fake.toggles.some(([name, force]) => name === 'is-filled' && force === false),
    'al vaciar la consulta la barra no sale de is-filled (REQ-04-03)',
  );
  fake.input.value = 'agilismo';
  fire(fake, 'input');
  fake.clear.clickFns[0]();
  assert.equal(fake.input.value, '', 'el botón X no vacía la consulta (REQ-04-04)');
  assert.equal(fake.input.focusCalls, 1, 'el botón X no devuelve el foco al input (REQ-04-04)');
  assert.ok(
    fake.toggles.some(([name, force]) => name === 'is-filled' && force === false),
    'al limpiar la barra no sale de is-filled (REQ-04-04)',
  );
});

test('REQ-04-04: clearQuery exporta la limpieza para la feature 6 (Escape)', () => {
  const fake = fakeDom();
  clearQuery(fake.root);
  assert.equal(fake.input.value, '', 'clearQuery no vacía la consulta');
  assert.equal(fake.input.focusCalls, 1, 'clearQuery no devuelve el foco');
});

// --- REQ-04-05 / REQ-04-06: Enter navega / no navega -----------------------

test('REQ-04-05: searchUrl construye /search?q= con URLSearchParams (escapando)', () => {
  assert.equal(searchUrl('agilismo'), '/search?q=agilismo');
  assert.equal(searchUrl('dos palabras'), '/search?q=dos+palabras');
  assert.equal(searchUrl('diseño'), '/search?q=dise%C3%B1o');
  assert.equal(searchUrl('a&b=c'), '/search?q=a%26b%3Dc');
  assert.equal(searchUrl('  agilismo  '), '/search?q=agilismo');
});

test('REQ-04-05/06: submitQuery navega solo con consulta no vacía', () => {
  const calls = [];
  submitQuery('agilismo', (url) => calls.push(url));
  assert.deepEqual(calls, ['/search?q=agilismo'], 'Enter con consulta no navegó (REQ-04-05)');
  submitQuery('', (url) => calls.push(url));
  submitQuery('   ', (url) => calls.push(url));
  assert.deepEqual(
    calls,
    ['/search?q=agilismo'],
    'Enter con consulta vacía no debe navegar (REQ-04-06)',
  );
});

test('REQ-04-05/06 (wiring): Enter navega con consulta y omite con vacía', () => {
  const fake = fakeDom();
  const calls = [];
  initSearchBar((url) => calls.push(url), fake.root);
  fake.input.value = 'agilismo';
  fire(fake, 'keydown', { key: 'Enter' });
  assert.deepEqual(calls, ['/search?q=agilismo'], 'Enter con consulta no navegó (REQ-04-05)');
  fake.input.value = '';
  fire(fake, 'keydown', { key: 'Enter' });
  fake.input.value = 'x';
  fire(fake, 'keydown', { key: 'a' });
  assert.deepEqual(
    calls,
    ['/search?q=agilismo'],
    'Enter con vacío u otra tecla no deben navegar (REQ-04-06)',
  );
});

// --- REQ-04-02 / REQ-04-07: consulta activa y evento de cambio --------------

test('REQ-04-02: activeQuery mantiene la consulta activa en memoria', () => {
  assert.equal(changeEventName(), 'search:change');
  emitChange('hola');
  assert.equal(activeQuery(), 'hola');
  emitChange('  ');
  assert.equal(activeQuery(), '');
});

test('REQ-04-07 (wiring): el input emite search:change con el término en detail', () => {
  const fake = fakeDom();
  initSearchBar(() => {}, fake.root);
  fake.input.value = 'agilismo';
  fire(fake, 'input');
  assert.equal(dispatched.length, 1, 'no se emitió el evento de cambio');
  assert.equal(dispatched[0].type, 'search:change');
  assert.deepEqual(dispatched[0].detail, { term: 'agilismo' });
  fake.clear.clickFns[0]();
  assert.equal(dispatched.length, 2, 'al limpiar no se emitió el evento');
  assert.deepEqual(dispatched[1].detail, { term: '' }, 'al limpiar se emite con término vacío');
});

// --- Inspección: layout, componente, control y hoja -------------------------

test('REQ-04-01: Layout.astro integra la barra en el nav del header', () => {
  const layout = readLayout();
  assert.match(
    layout,
    /import\s+SearchBar\s+from\s+['"][^'"]*search-bar\/search-bar\.astro['"]/,
    'el layout no importa el componente de la barra (REQ-04-01)',
  );
  const nav = layout.match(/<nav>[\s\S]*?<\/nav>/) ?? [];
  assert.ok(nav.length > 0, 'el layout no tiene <nav>');
  assert.match(nav[0], /<SearchBar\s*\/>/, 'la barra no está integrada en el nav (REQ-04-01)');
});

test('REQ-04-08: el input de la barra declara aria-label', () => {
  const component = readComponent();
  const input = component.match(/<input[\s\S]*?>/)?.[0] ?? '';
  assert.ok(input.length > 0, 'search-bar.astro no renderiza <input> (REQ-04-01)');
  assert.match(input, /aria-label=/, 'el input no declara aria-label (REQ-04-08)');
  assert.match(input, /type="text"/, 'el input no es de tipo texto (REQ-04-01)');
});

test('Decisión 4: el botón X declara su propósito accesible', () => {
  const component = readComponent();
  const button = component.match(/<button[\s\S]*?<\/button>/)?.[0] ?? '';
  assert.match(button, /aria-label=/, 'el botón X no declara aria-label (Decisión 4)');
  assert.match(button, /type="button"/, 'el botón X no es type="button"');
});

test('Decisión 1: el componente importa la hoja y arranca el control', () => {
  const component = readComponent();
  assert.match(component, /search-bar\.css/, 'el componente no importa src/styles/search-bar.css');
  assert.match(
    component,
    /import\s*\{[^}]*initSearchBar[^}]*\}\s*from\s*['"][^'"]*search-bar\.ts['"]/,
    'el <script> no importa el control (regla 8)',
  );
  assert.match(component, /initSearchBar\(/, 'el <script> no arranca el control');
});

test('REQ-04-05 (Decisión 3): el script navega con navigate de astro:transitions/client', () => {
  const component = readComponent();
  assert.match(
    component,
    /astro:transitions\/client/,
    'el script no importa el mecanismo de navegación del framework (view transitions)',
  );
  assert.match(component, /navigate/, 'el script no pasa navigate al control');
});

test('REQ-04-07: el control despacha el CustomEvent search:change con detail', () => {
  const controller = readController();
  assert.match(controller, /CustomEvent/, 'el control no usa CustomEvent (REQ-04-07)');
  assert.match(controller, /search:change/, 'el evento no se llama search:change');
  assert.match(controller, /dispatchEvent/, 'el control no despacha el evento');
  assert.match(controller, /detail/, 'el evento no lleva el término en detail');
});

test('REQ-04-04: clearQuery vacía el input y devuelve el foco', () => {
  const controller = readController();
  assert.match(controller, /\.value\s*=\s*['']/, 'clearQuery no vacía el input (REQ-04-04)');
  assert.match(controller, /\.focus\(\)/, 'clearQuery no devuelve el foco (REQ-04-04)');
});

test('Decisión 2/REQ-04-03: la hoja condiciona el botón X a .is-filled', () => {
  const css = readCss();
  assert.match(css, /\.search-bar\.is-filled/, 'la hoja no condiciona el botón X a .is-filled');
  assert.match(css, /\.search-bar__clear/, 'la hoja no estiliza el botón X');
});

test('Decisión 1: search-bar.css usa solo tokens existentes y sin colores sueltos', () => {
  const css = readCss();
  const allowed = new Set([
    '--color-navbar',
    '--color-surface',
    '--color-border',
    '--color-border-strong',
    '--color-text',
    '--color-text-secondary',
    '--color-accent',
    '--radius-pill',
    '--transition-default',
    '--font-sans',
  ]);
  const vars = [...css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
  assert.ok(vars.length > 0, 'la hoja no usa ningún token');
  for (const token of vars) {
    assert.ok(allowed.has(token), `search-bar.css usa el token ${token} fuera de la lista de design.md`);
  }
  assert.doesNotMatch(
    css,
    /#[0-9a-fA-F]{3,8}\b|rgba?\(/,
    'search-bar.css contiene colores sueltos (deben salir de tokens.css)',
  );
});

// --- Restricciones del arnés ------------------------------------------------

test('REQ-04-00: ≤100 líneas en layout, componente, control y hoja', () => {
  for (const [name, url] of [
    ['src/layouts/Layout.astro', LAYOUT_URL],
    ['src/components/search-bar/search-bar.astro', COMPONENT_URL],
    ['src/components/search-bar/search-bar.ts', CONTROLLER_URL],
    ['src/styles/search-bar.css', CSS_URL],
  ]) {
    const lines = countLines(readFileSync(url, 'utf8'));
    assert.ok(lines <= 100, `${name} tiene ${lines} líneas (máximo 100)`);
  }
});

test('REQ-04-00: el componente no lleva estilos ni lógica embebida', () => {
  const component = readComponent();
  assert.doesNotMatch(component, /<style/i, 'el componente contiene un bloque <style> embebido');
  assert.doesNotMatch(component, /\bstyle\s*=/, 'el componente conserva atributos style inline');
});

test('REQ-04-00: el layout conserva el mecanismo de view transitions', () => {
  const layout = readLayout();
  assert.match(layout, /ClientRouter/, 'el layout perdió ClientRouter (REQ-24-01, view transitions)');
});