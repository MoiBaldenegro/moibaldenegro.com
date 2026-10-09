// Test de la región de estado de la búsqueda (feature 36
// search-status-announcements, REQ-36-01..10): marcado role="status",
// statusMessage puro, escritura del controlador de /search y debounce de
// 300 ms del panel en vivo (mock.timers de node:test).
import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { statusMessage } from '../src/components/search-results/search-status.ts';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';
import { initSearchLive } from '../src/components/search-live/search-live.ts';
import { primeSearchIndex } from '../src/components/search-results/index-loader.ts';
// Feature 47 (precedente REQ-43-06): el índice ya no se embebe en el DOM; se precarga en el loader.

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const RESULTS = '../src/components/search-results/search-results.astro';
const LIVE = '../src/components/search-live/search-live.astro';
const STATUS_NODE = /<p[^>]*class="visually-hidden"[^>]*role="status"[^>]*aria-live="polite"[^>]*data-search-status[^>]*><\/p>/g;
const CATALOG = Array.from({ length: 8 }, (_, i) => ({
  id: `p${i}`, title: `Post ${i}`, description: 'Arquitectura.', tags: ['arquitectura'], body: '',
  date: `${2010 + i}-01-01`, img: 'x.jpg', readtime: 1, author: 'A',
}));
globalThis.HTMLInputElement ??= class {};

function node(sel, calls) {
  return {
    toggleAttribute() {}, setAttribute() {}, focus() {},
    addEventListener: (ev, h) => { if (ev === 'click') calls.clicks.set(sel, h); },
    set innerHTML(_v) {},
    set textContent(v) { if (sel === '[data-search-status]') calls.status.push(v); },
  };
}
function fakeDocument(calls) {
  const nodes = new Map();
  const get = (s) => { if (!nodes.has(s)) nodes.set(s, node(s, calls)); return nodes.get(s); };
  const panel = { ...get('[data-search-live]'), querySelector: (s) => get(s) };
  return {
    title: '', listeners: new Map(),
    getElementById: (id) => (id === 'search-index' ? { textContent: JSON.stringify(CATALOG) } : null),
    querySelector: (s) => (s === '[data-search-live]' ? panel : s === '.search-results' ? { querySelector: get } : s.startsWith('[data-search-') ? get(s) : null),
    addEventListener(type, fn) { this.listeners.set(type, fn); },
    removeEventListener() {},
  };
}
const cleanup = () => { delete globalThis.window; delete globalThis.document; };

test('REQ-36-01/02: un único nodo de estado en resultados y en el panel en vivo', () => {
  for (const rel of [RESULTS, LIVE]) assert.equal(read(rel).match(STATUS_NODE)?.length ?? 0, 1, rel);
});

test('REQ-36-03/04/05: statusMessage', () => {
  assert.equal(statusMessage(5, 'docker', 1, 1), '5 resultados para "docker"');
  assert.equal(statusMessage(1, 'docker', 1, 1), '1 resultado para "docker"');
  assert.equal(statusMessage(0, 'zzz', 1, 0), 'Sin resultados para "zzz"');
  const paged = statusMessage(8, 'a', 2, 2);
  assert.ok(paged.includes('8 resultados para "a"') && paged.includes('Página 2 de 2'), paged);
});

test('REQ-36-06: el controlador escribe el estado al renderizar y al cambiar de página', () => {
  const calls = { status: [], clicks: new Map() };
  globalThis.window = { location: { pathname: '/search', search: '?q=arquitectura', assign() {} }, history: { replaceState() {} } };
  globalThis.document = fakeDocument(calls);
  try {
    primeSearchIndex(CATALOG);
    initSearchResults();
    assert.deepEqual(calls.status, [statusMessage(8, 'arquitectura', 1, 2)]);
    calls.clicks.get('[data-search-next]')();
    assert.equal(calls.status.at(-1), statusMessage(8, 'arquitectura', 2, 2));
  } finally { cleanup(); }
});

test('REQ-36-07: tres search:change seguidos producen una sola escritura 300 ms después', () => {
  mock.timers.enable({ apis: ['setTimeout'] });
  const calls = { status: [], clicks: new Map() };
  globalThis.document = fakeDocument(calls);
  try {
    primeSearchIndex(CATALOG);
    initSearchLive();
    const fire = (term) => globalThis.document.listeners.get('search:change')({ detail: { term } });
    fire('a'); mock.timers.tick(100); fire('ar'); mock.timers.tick(100); fire('arquitectura');
    mock.timers.tick(299);
    assert.deepEqual(calls.status, [], 'escribió antes de 300 ms sin pulsaciones');
    mock.timers.tick(1);
    assert.deepEqual(calls.status, [statusMessage(8, 'arquitectura', 1, 1)]);
  } finally { mock.timers.reset(); cleanup(); }
});

test('REQ-36-08: .visually-hidden en layout.css', () => {
  const rule = read('../src/styles/layout.css').match(/\.visually-hidden\s*\{([^}]*)\}/)?.[1] ?? '';
  for (const decl of [/position:\s*absolute/, /width:\s*1px/, /height:\s*1px/, /overflow:\s*hidden/, /clip:/, /white-space:\s*nowrap/]) {
    assert.match(rule, decl);
  }
  assert.doesNotMatch(rule, /display:\s*none/);
});

test('REQ-36-10: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of [RESULTS, LIVE, '../src/components/search-results/search-status.ts', '../src/components/search-live/search-live.ts',
    '../src/components/search-results/search-results-controller.ts', '../src/styles/layout.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
