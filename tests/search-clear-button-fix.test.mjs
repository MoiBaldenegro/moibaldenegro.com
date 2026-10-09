// Test del botón «Limpiar búsqueda» del estado vacío (feature 31
// search-clear-button-fix, REQ-31-01..08). Inspección por regex del
// componente y del controlador + document simulado en globalThis
// (precedente tests/client-init-on-navigation.test.mjs).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';
import { primeSearchIndex } from '../src/components/search-results/index-loader.ts';
// Feature 47 (precedente REQ-43-06): el índice ya no se embebe en el DOM; se precarga en el loader.

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const COMPONENT = '../src/components/search-results/search-results.astro';
const CONTROLLER = '../src/components/search-results/search-results-controller.ts';
const INDEX = [{ id: 'a', title: 'Agilismo', description: 'd', tags: ['x'], body: 'b',
  date: '19 Septiembre 2026', img: 'a.webp', readtime: 5, author: 'A' }];

// DOM simulado: el × del header aparece ANTES en el documento con
// data-search-clear; el botón del estado vacío vive dentro de .search-results.
function fakeDom() {
  const calls = { header: [], results: null, title: [], replaceState: [], assign: [], toggle: [] };
  const node = (sel) => ({
    toggleAttribute: (name, force) => calls.toggle.push([sel, force]),
    addEventListener: () => {},
    set textContent(_v) {},
    set innerHTML(_v) {},
  });
  const header = { addEventListener: (ev, h) => calls.header.push([ev, h]) };
  const resultsClear = { addEventListener: (ev, h) => { if (ev === 'click') calls.results = h; } };
  const root = { querySelector: (s) => (s === '[data-search-results-clear]' ? resultsClear : null) };
  // Ajuste feature 57 (precedente REQ-43-06): limpiar en /search también vacía la barra
  // del header (resetQuery); la barra simulada no tiene input y se ignora.
  const bar = { querySelector: () => null };
  const nodes = new Map([['[data-search-clear]', header], ['.search-results', root], ['[data-search-bar]', bar]]);
  let title = 'Búsqueda';
  const document = {
    get title() { return title; },
    set title(v) { title = v; calls.title.push(v); },
    getElementById: (id) => (id === 'search-index' ? { textContent: JSON.stringify(INDEX) } : null),
    querySelector: (s) => nodes.get(s) ?? (s.startsWith('[data-search-') ? node(s) : null),
  };
  return { calls, document };
}

function initWith(pathname, search = '') {
  const { calls, document } = fakeDom();
  globalThis.window = {
    location: { pathname, search, assign: (u) => calls.assign.push(u) },
    history: { replaceState: (...a) => calls.replaceState.push(a) },
  };
  globalThis.document = document;
  primeSearchIndex(INDEX);
  try { initSearchResults(); } catch (error) { cleanup(); throw error; }
  return calls;
}
function cleanup() { delete globalThis.window; delete globalThis.document; }

test('REQ-31-01: el botón del estado vacío usa data-search-results-clear y no data-search-clear', () => {
  const component = read(COMPONENT);
  assert.match(component, /<button[^>]*class="search-results__clear"[^>]*data-search-results-clear[^>]*>Limpiar búsqueda<\/button>/);
  assert.doesNotMatch(component, /data-search-clear\b/);
});

test('REQ-31-02: el controlador busca el botón dentro de .search-results, sin consulta global', () => {
  const controller = read(CONTROLLER);
  assert.doesNotMatch(controller, /document\.querySelector\(\s*'\[data-search-clear\]'\s*\)/);
  assert.match(controller, /querySelector\(\s*'\.search-results'\s*\)/);
  assert.match(controller, /\[data-search-results-clear\]/);
});

test('REQ-31-03: en /search?q=zzz el clic quita q, restaura el título y muestra la guía', () => {
  const calls = initWith('/search', '?q=zzz');
  try {
    assert.equal(typeof calls.results, 'function', 'el botón del estado vacío no tiene manejador');
    calls.results();
    assert.deepEqual(calls.replaceState.at(-1), [null, '', '/search']);
    assert.equal(calls.title.at(-1), 'Búsqueda');
    assert.deepEqual(calls.toggle.at(-1), ['[data-search-guide]', false]);
    assert.ok(calls.toggle.some(([s, f]) => s === '[data-search-empty]' && f === true));
  } finally { cleanup(); }
});

test('REQ-31-04: en /zzz el clic navega a clearDestination (/)', () => {
  const calls = initWith('/zzz');
  try {
    assert.equal(typeof calls.results, 'function', 'el botón del estado vacío no tiene manejador');
    calls.results();
    assert.deepEqual(calls.assign, ['/']);
  } finally { cleanup(); }
});

test('REQ-31-05: initSearchResults no registra listeners sobre el × del header', () => {
  const calls = initWith('/search', '?q=zzz');
  try {
    assert.deepEqual(calls.header, []);
  } finally { cleanup(); }
});

test('REQ-31-07: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of [COMPONENT, CONTROLLER]) {
    const lines = read(rel).split('\n').length;
    assert.ok(lines <= 100, `${rel} tiene ${lines} líneas`);
  }
});
