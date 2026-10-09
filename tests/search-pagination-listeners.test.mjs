// Test de la paginación de /search (feature 32 search-pagination-listeners,
// REQ-32-01..09): un único listener por botón, página actual en un estado
// único, foco en la lista tras cambiar de página y orden propagado.
// Document simulado en globalThis (precedente term-search-oldest-first).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';
import { primeSearchIndex } from '../src/components/search-results/index-loader.ts';
// Feature 47 (precedente REQ-43-06): el índice ya no se embebe en el DOM; se precarga en el loader.

const read = (rel) => readFileSync(new URL(rel, import.meta.url), 'utf8');
const COMPONENT = '../src/components/search-results/search-results.astro';
const CONTROLLER = '../src/components/search-results/search-results-controller.ts';
// 13 coincidencias de «arquitectura» → 3 páginas de 6; fechas crecientes por id.
const CATALOG = Array.from({ length: 13 }, (_, i) => ({
  id: `p${String(i).padStart(2, '0')}`, title: `Post ${i}`, description: 'Arquitectura.',
  tags: ['arquitectura'], body: '', date: `${2010 + i}-01-01`, img: 'x.jpg', readtime: 1, author: 'A',
}));

function fakeDom() {
  const calls = { listeners: { prev: [], next: [] }, labels: [], lists: [], focus: [] };
  const node = (sel) => ({
    toggleAttribute: () => {},
    addEventListener: (ev, h) => {
      if (ev !== 'click') return;
      if (sel === '[data-search-prev]') calls.listeners.prev.push(h);
      if (sel === '[data-search-next]') calls.listeners.next.push(h);
    },
    focus: () => calls.focus.push(sel),
    set textContent(v) { if (sel === '[data-search-page-label]') calls.labels.push(v); },
    set innerHTML(v) { if (sel === '[data-search-list]') calls.lists.push(v); },
  });
  const nodes = new Map();
  const document = {
    title: 'Búsqueda',
    getElementById: (id) => (id === 'search-index' ? { textContent: JSON.stringify(CATALOG) } : null),
    querySelector: (s) => {
      if (!s.startsWith('[data-search-')) return null;
      if (!nodes.has(s)) nodes.set(s, node(s));
      return nodes.get(s);
    },
  };
  return { calls, document };
}

function setup(pathname, search = '') {
  const { calls, document } = fakeDom();
  globalThis.window = { location: { pathname, search, assign() {} }, history: { replaceState() {} } };
  globalThis.document = document;
  primeSearchIndex(CATALOG);
  initSearchResults();
  // Un clic dispara TODOS los listeners registrados (como el navegador).
  const click = (name) => calls.listeners[name].forEach((h) => h());
  return { calls, click };
}
function cleanup() { delete globalThis.window; delete globalThis.document; }
const idsOf = (html) => [...html.matchAll(/\/posts\/(p\d\d)/g)].map((m) => m[1]);

test('REQ-32-01: cada botón tiene exactamente un listener tras varias páginas', () => {
  const { calls, click } = setup('/search', '?q=arquitectura');
  try {
    click('next'); click('next'); click('prev');
    assert.equal(calls.listeners.prev.length, 1);
    assert.equal(calls.listeners.next.length, 1);
  } finally { cleanup(); }
});

test('REQ-32-02/03: Siguiente y Anterior producen un único render de la página contigua', () => {
  const { calls, click } = setup('/search', '?q=arquitectura');
  try {
    const before = calls.lists.length;
    click('next');
    assert.equal(calls.lists.length, before + 1, 'Siguiente debe renderizar una sola vez');
    assert.equal(calls.labels.at(-1), 'Página 2 de 3');
    click('prev');
    assert.equal(calls.lists.length, before + 2, 'Anterior debe renderizar una sola vez');
    assert.equal(calls.labels.at(-1), 'Página 1 de 3');
  } finally { cleanup(); }
});

test('REQ-32-04: clics alternos siguen el contador sin renders de páginas obsoletas', () => {
  const { calls, click } = setup('/search', '?q=arquitectura');
  try {
    const seq = [['next', 2], ['next', 3], ['prev', 2], ['next', 3], ['prev', 2], ['prev', 1]];
    for (const [name, page] of seq) {
      const before = calls.labels.length;
      click(name);
      assert.deepEqual(calls.labels.slice(before), [`Página ${page} de 3`]);
    }
  } finally { cleanup(); }
});

test('REQ-32-05: la lista lleva tabindex="-1" y recibe el foco al cambiar de página', () => {
  assert.match(read(COMPONENT), /<ul[^>]*data-search-list[^>]*tabindex="-1"|<ul[^>]*tabindex="-1"[^>]*data-search-list/);
  const { calls, click } = setup('/search', '?q=arquitectura');
  try {
    assert.deepEqual(calls.focus, [], 'el render inicial no debe mover el foco');
    click('next');
    assert.deepEqual(calls.focus, ['[data-search-list]']);
  } finally { cleanup(); }
});

test('REQ-32-06: al llegar a la última página el foco va a la lista', () => {
  const { calls, click } = setup('/search', '?q=arquitectura');
  try {
    click('next'); click('next');
    assert.equal(calls.labels.at(-1), 'Página 3 de 3');
    assert.equal(calls.focus.at(-1), '[data-search-list]');
  } finally { cleanup(); }
});

test('REQ-32-07: la página 2 conserva asc en /<término> y desc en ?q=', () => {
  let ctx = setup('/arquitectura');
  try {
    ctx.click('next');
    assert.deepEqual(idsOf(ctx.calls.lists.at(-1)), ['p06', 'p07', 'p08', 'p09', 'p10', 'p11']);
  } finally { cleanup(); }
  ctx = setup('/search', '?q=arquitectura');
  try {
    ctx.click('next');
    assert.deepEqual(idsOf(ctx.calls.lists.at(-1)), ['p06', 'p05', 'p04', 'p03', 'p02', 'p01']);
  } finally { cleanup(); }
});

test('REQ-32-09: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of [COMPONENT, CONTROLLER, '../src/components/search-results/search-pagination.ts']) {
    const lines = read(rel).split('\n').length;
    assert.ok(lines <= 100, `${rel} tiene ${lines} líneas`);
  }
});
