// Test del buscador como formulario con mejora progresiva (feature 57
// search-form-progressive, REQ-57-01..08): <search><form GET /search>, input
// type=search name=q, submit con navigate, precarga de q en /search, Escape
// solo con el foco en la búsqueda y × nativo oculto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initSearchBar } from '../src/components/search-bar/search-bar.ts';
import { initSearchEscape } from '../src/components/search-escape/search-escape.ts';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';
import { primeSearchIndex } from '../src/components/search-results/index-loader.ts';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const COMPONENT = 'src/components/search-bar/search-bar.astro';

function fakeBar(value = '') {
  const listeners = {};
  const input = { value, addEventListener: (t, f) => { listeners[`input:${t}`] = f; }, focus() {} };
  const form = { addEventListener: (t, f) => { listeners[`form:${t}`] = f; } };
  const toggles = [];
  const root = {
    classList: { toggle: (n, f) => toggles.push([n, f]) },
    querySelector: (s) => (s === 'input' ? input : s === 'form' ? form : null),
  };
  return { root, input, listeners, toggles };
}

test('REQ-57-01: <search> con <form action="/search" method="get">', () => {
  const astro = read(COMPONENT);
  assert.match(astro, /<search\b[^>]*data-search-bar[^>]*>[\s\S]*<form\b[^>]*action="\/search"[^>]*method="get"[\s\S]*<\/form>[\s\S]*<\/search>/);
});

test('REQ-57-02: input type="search", name="q" y enterkeyhint="search"', () => {
  const input = read(COMPONENT).match(/<input\b[\s\S]*?\/>/)?.[0] ?? '';
  for (const attr of ['type="search"', 'name="q"', 'enterkeyhint="search"']) assert.ok(input.includes(attr), attr);
});

test('REQ-57-03: el submit se cancela y navega con navigate', () => {
  const { root, listeners } = fakeBar('docker');
  const calls = [];
  initSearchBar((url) => calls.push(url), root, undefined);
  let prevented = false;
  listeners['form:submit']({ preventDefault: () => { prevented = true; } });
  assert.ok(prevented, 'no canceló el envío nativo');
  assert.deepEqual(calls, ['/search?q=docker']);
});

test('REQ-57-04: en /search?q=docker el input se precarga con docker', () => {
  const { root, input, toggles } = fakeBar('');
  initSearchBar(() => {}, root, { pathname: '/search', search: '?q=docker' });
  assert.equal(input.value, 'docker');
  assert.ok(toggles.some(([n, f]) => n === 'is-filled' && f === true), 'el × no se muestra con el término precargado');
  const other = fakeBar('');
  initSearchBar(() => {}, other.root, { pathname: '/about', search: '?q=docker' });
  assert.equal(other.input.value, '', 'solo precarga en /search');
});

test('REQ-57-05: Escape con el foco en body no limpia el input', () => {
  const listeners = {};
  const root = {
    querySelector: (s) => (s === '[data-search-live]' ? { toggleAttribute() {} } : null),
    addEventListener: (t, f) => { listeners[t] = f; }, removeEventListener() {},
  };
  const input = { value: 'agilismo', focus() {} };
  const barRoot = { querySelector: (s) => (s === 'input' ? input : null), classList: { toggle() {} } };
  globalThis.document = { dispatchEvent() {} };
  try {
    initSearchEscape(root, barRoot, 'T');
    let stopped = false;
    const body = { closest: () => null };
    listeners.keydown({ key: 'Escape', target: body, stopPropagation: () => { stopped = true; } });
    assert.equal(input.value, 'agilismo', 'Escape con el foco fuera limpió el buscador');
    assert.equal(stopped, false, 'Escape con el foco fuera no debe tocar la propagación');
  } finally { delete globalThis.document; }
});

test('REQ-57-06: el × nativo del input search está oculto', () => {
  const css = read('src/styles/search-bar.css');
  const at = css.indexOf('::-webkit-search-cancel-button');
  assert.ok(at >= 0, 'falta la regla ::-webkit-search-cancel-button');
  assert.match(css.slice(at, css.indexOf('}', at)), /appearance:\s*none|display:\s*none/);
});

// --- Ronda 2 (review_57): limpiar la consulta en /search también vacía la barra ---

function barFake(value) {
  const toggles = [];
  const input = { value, focus() {} };
  return { toggles, input, root: { querySelector: (s) => (s === 'input' ? input : null), classList: { toggle: (n, f) => toggles.push([n, f]) } } };
}
function searchDocument(bar) {
  return {
    title: 'Búsqueda: docker', dispatchEvent() {},
    querySelector: (s) => (s === '[data-search-bar]' ? bar.root : s.startsWith('[data-search-') ? { toggleAttribute() {}, addEventListener() {} } : null),
  };
}

test('REQ-57-04 (ronda 2): Escape en /search vacía también la barra precargada', () => {
  const bar = barFake('docker');
  const listeners = {};
  const root = { querySelector: (s) => (s === '[data-search-guide]' ? {} : null), addEventListener: (t, f) => { listeners[t] = f; }, removeEventListener() {} };
  globalThis.window = { location: { pathname: '/search', search: '?q=docker' }, history: { replaceState() {} } };
  globalThis.document = searchDocument(bar);
  try {
    initSearchEscape(root, bar.root, 'Búsqueda');
    listeners.keydown({ key: 'Escape', target: { closest: () => ({}) }, stopPropagation() {} });
    assert.equal(bar.input.value, '', 'la barra conserva el término tras limpiar la vista');
    assert.deepEqual(bar.toggles.at(-1), ['is-filled', false]);
  } finally { delete globalThis.window; delete globalThis.document; }
});

test('REQ-57-04 (ronda 2): «Limpiar búsqueda» en /search vacía también la barra', () => {
  const bar = barFake('zzz');
  let clearClick = null;
  const doc = searchDocument(bar);
  const resultsClear = { addEventListener: (t, f) => { if (t === 'click') clearClick = f; } };
  const base = doc.querySelector;
  doc.querySelector = (s) => (s === '.search-results' ? { querySelector: (x) => (x === '[data-search-results-clear]' ? resultsClear : null) } : base(s));
  globalThis.window = { location: { pathname: '/search', search: '?q=zzz', assign() {} }, history: { replaceState() {} } };
  globalThis.document = doc;
  try {
    primeSearchIndex([]);
    initSearchResults();
    clearClick();
    assert.equal(bar.input.value, '', 'la barra conserva el término tras «Limpiar búsqueda»');
  } finally { delete globalThis.window; delete globalThis.document; }
});

test('REQ-57-08: los archivos tocados no superan 100 líneas', () => {
  for (const rel of [COMPONENT, 'src/components/search-bar/search-bar.ts', 'src/components/search-escape/search-escape.ts', 'src/styles/search-bar.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
