// Test de la feature 17 term-search-oldest-first (REQ-17-01..07): los más
// antiguos primero en la ruta /<término>.
//
//   REQ-17-01 — searchIndex/searchPosts aceptan orden ascendente o
//               descendente por fecha de publicación, con descendente por
//               defecto.
//   REQ-17-02 — cuando el término proviene del pathname (/<término>) el
//               controlador solicita el orden ascendente.
//   REQ-17-03 — cuando el término proviene de ?q= el controlador conserva el
//               orden descendente.
//   REQ-17-04 — con orden ascendente los más antiguos van primero según la
//               fecha YYYY-MM-DD y los empates de fecha conservan el orden
//               estable del índice.
//   REQ-17-05 — la paginación de /<término> conserva el orden ascendente.
//   REQ-17-06 — search-live.ts conserva la llamada a searchIndex sin
//               parámetro de orden (panel en vivo descendente).
//   REQ-17-07 — search.ts y search-results-controller.ts ≤ 100 líneas.
//
// Patrón mixto del arnés (precedente search-domain y root-term-search):
// unitarios por import directo del dominio + wiring con DOM fake de
// initSearchResults + inspección por regex del controlador y search-live.ts.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { buildSearchIndex } from '../src/domain/search/index.ts';
import {
  searchIndex,
  searchPosts,
  PAGE_SIZE,
} from '../src/domain/search/search.ts';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';

const SEARCH_URL = new URL('../src/domain/search/search.ts', import.meta.url);
const CONTROLLER_URL = new URL(
  '../src/components/search-results/search-results-controller.ts',
  import.meta.url,
);
const LIVE_URL = new URL('../src/components/search-live/search-live.ts', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readController() {
  assert.ok(
    existsSync(CONTROLLER_URL),
    'search-results-controller.ts no existe',
  );
  return readFileSync(CONTROLLER_URL, 'utf8');
}

function readLive() {
  assert.ok(existsSync(LIVE_URL), 'search-live.ts no existe');
  return readFileSync(LIVE_URL, 'utf8');
}

// Fixture del índice (mismo shape que SearchIndexEntry). Siete artículos que
// coinciden con 'arquitectura' con fechas distintas: 6 entran en la página 1
// y 1 queda para la página 2 (PAGE_SIZE = 6).
const CATALOG = [
  { id: '00-agilismo', title: 'Agilismo', description: 'Arquitectura de software.', tags: ['arquitectura'], body: '', date: '2026-08-10', img: 'a.jpg', readtime: 1, author: 'A' },
  { id: '01-diseno', title: 'Diseño', description: 'Arquitectura de componentes.', tags: ['arquitectura'], body: '', date: '2026-02-15', img: 'b.jpg', readtime: 1, author: 'A' },
  { id: '02-typescript', title: 'TypeScript', description: 'Arquitectura de tipos.', tags: ['arquitectura'], body: '', date: '2025-11-03', img: 'c.jpg', readtime: 1, author: 'A' },
  { id: '03-dom', title: 'DOM', description: 'Arquitectura del navegador.', tags: ['arquitectura'], body: '', date: '2025-06-20', img: 'd.jpg', readtime: 1, author: 'A' },
  { id: '04-css', title: 'CSS', description: 'Arquitectura de estilos.', tags: ['arquitectura'], body: '', date: '2025-01-08', img: 'e.jpg', readtime: 1, author: 'A' },
  { id: '05-http', title: 'HTTP', description: 'Arquitectura de red.', tags: ['arquitectura'], body: '', date: '2024-09-12', img: 'f.jpg', readtime: 1, author: 'A' },
  { id: '06-git', title: 'Git', description: 'Arquitectura de versiones.', tags: ['arquitectura'], body: '', date: '2024-03-01', img: 'g.jpg', readtime: 1, author: 'A' },
];

// Posts equivalentes (mismo shape que Post) para los tests de searchPosts:
// created en formato español, idéntico a las fechas del CATALOG.
const POSTS = [
  { id: '00-agilismo', slug: '00-agilismo', title: 'Agilismo', author: 'A', img: 'a.jpg', readtime: 1, description: 'Arquitectura de software.', tags: ['arquitectura'], created: '10 Agosto 2026', updated: '10 Agosto 2026' },
  { id: '01-diseno', slug: '01-diseno', title: 'Diseño', author: 'A', img: 'b.jpg', readtime: 1, description: 'Arquitectura de componentes.', tags: ['arquitectura'], created: '15 Febrero 2026', updated: '15 Febrero 2026' },
  { id: '02-typescript', slug: '02-typescript', title: 'TypeScript', author: 'A', img: 'c.jpg', readtime: 1, description: 'Arquitectura de tipos.', tags: ['arquitectura'], created: '3 Noviembre 2025', updated: '3 Noviembre 2025' },
  { id: '03-dom', slug: '03-dom', title: 'DOM', author: 'A', img: 'd.jpg', readtime: 1, description: 'Arquitectura del navegador.', tags: ['arquitectura'], created: '20 Junio 2025', updated: '20 Junio 2025' },
  { id: '04-css', slug: '04-css', title: 'CSS', author: 'A', img: 'e.jpg', readtime: 1, description: 'Arquitectura de estilos.', tags: ['arquitectura'], created: '8 Enero 2025', updated: '8 Enero 2025' },
  { id: '05-http', slug: '05-http', title: 'HTTP', author: 'A', img: 'f.jpg', readtime: 1, description: 'Arquitectura de red.', tags: ['arquitectura'], created: '12 Septiembre 2024', updated: '12 Septiembre 2024' },
  { id: '06-git', slug: '06-git', title: 'Git', author: 'A', img: 'g.jpg', readtime: 1, description: 'Arquitectura de versiones.', tags: ['arquitectura'], created: '1 Marzo 2024', updated: '1 Marzo 2024' },
];

// DOM fake mínimo (patrón root-term-search): document.getElementById,
// document.querySelector (toggleAttribute, textContent, innerHTML,
// addEventListener) y window.location/history. Captura además los handlers
// de los botones de paginación para disparar el cambio de página.
function fakeDom(index) {
  const calls = {
    toggle: [],
    term: [],
    list: [],
    label: [],
    title: [],
    assign: [],
    replaceState: [],
    prevClick: null,
    nextClick: null,
  };
  const nodes = new Map();
  const selectors = [
    '[data-search-guide]',
    '[data-search-empty]',
    '[data-search-list]',
    '[data-search-pagination]',
    '[data-search-term]',
    '[data-search-page-label]',
    '[data-search-clear]',
    '[data-search-prev]',
    '[data-search-next]',
  ];
  for (const selector of selectors) {
    nodes.set(selector, {
      toggleAttribute: (name, force) => calls.toggle.push([selector, name, force]),
      addEventListener: (event, handler) => {
        if (selector === '[data-search-prev]' && event === 'click') calls.prevClick = handler;
        if (selector === '[data-search-next]' && event === 'click') calls.nextClick = handler;
      },
      set textContent(value) {
        if (selector === '[data-search-term]') calls.term.push(value);
        if (selector === '[data-search-page-label]') calls.label.push(value);
      },
      set innerHTML(value) {
        if (selector === '[data-search-list]') calls.list.push(value);
      },
    });
  }
  let title = 'Búsqueda';
  const document = {
    get title() {
      return title;
    },
    set title(value) {
      title = value;
      calls.title.push(value);
    },
    getElementById: (id) =>
      id === 'search-index' ? { textContent: JSON.stringify(index) } : null,
    querySelector: (selector) => nodes.get(selector) ?? null,
  };
  return { calls, document };
}

function initWith(pathname, search = '') {
  const { calls, document } = fakeDom(CATALOG);
  globalThis.window = {
    location: { pathname, search },
    history: { replaceState: (...args) => calls.replaceState.push(args) },
  };
  globalThis.window.location.assign = (url) => calls.assign.push(url);
  globalThis.document = document;
  initSearchResults();
  return {
    calls,
    firePrev() {
      calls.prevClick();
    },
    fireNext() {
      calls.nextClick();
    },
    cleanup() {
      delete globalThis.window;
      delete globalThis.document;
    },
  };
}

// --- REQ-17-01 / REQ-17-04: orden ascendente del dominio ----------------------

test('REQ-17-01/04: searchIndex con orden asc coloca los más antiguos primero (YYYY-MM-DD)', () => {
  const asc = searchIndex(CATALOG, 'arquitectura', 1, 'asc');
  assert.equal(asc.total, 7);
  assert.deepEqual(
    asc.results.map((result) => result.id),
    ['06-git', '05-http', '04-css', '03-dom', '02-typescript', '01-diseno'],
    '2024-03-01 < 2024-09-12 < 2025-01-08 < 2025-06-20 < 2025-11-03 < 2026-02-15',
  );
  assert.deepEqual(
    asc.results.map((result) => result.date),
    ['2024-03-01', '2024-09-12', '2025-01-08', '2025-06-20', '2025-11-03', '2026-02-15'],
  );
  const page2 = searchIndex(CATALOG, 'arquitectura', 2, 'asc');
  assert.equal(page2.results.length, 1);
  assert.equal(page2.results[0].id, '00-agilismo', 'la última página en asc trae el más reciente');
});

test('REQ-17-04: los empates de fecha conservan el orden estable del índice', () => {
  const ties = [
    { ...CATALOG[0], date: '2024-01-03' },
    { ...CATALOG[1], date: '2026-08-10' },
    { ...CATALOG[2], date: '2024-01-03' },
    { ...CATALOG[3], date: '2025-05-15' },
    { ...CATALOG[4], date: '2024-01-03' },
  ];
  const asc = searchIndex(ties, 'arquitectura', 1, 'asc');
  assert.deepEqual(
    asc.results.map((result) => result.id),
    ['00-agilismo', '02-typescript', '04-css', '03-dom', '01-diseno'],
    'los empates 2024-01-03 conservan el orden de aparición del índice',
  );
  const desc = searchIndex(ties, 'arquitectura', 1, 'desc');
  assert.deepEqual(
    desc.results.map((result) => result.id),
    ['01-diseno', '03-dom', '00-agilismo', '02-typescript', '04-css'],
    'los empates en desc también conservan el orden estable del índice',
  );
});

test('REQ-17-01/03: searchIndex sin orden (default) y con orden desc conservan el descendente', () => {
  const expected = ['00-agilismo', '01-diseno', '02-typescript', '03-dom', '04-css', '05-http'];
  const def = searchIndex(CATALOG, 'arquitectura', 1);
  assert.deepEqual(
    def.results.map((result) => result.id),
    expected,
    'el default debe ser descendente (REQ-02-04/05)',
  );
  const desc = searchIndex(CATALOG, 'arquitectura', 1, 'desc');
  assert.deepEqual(
    desc.results.map((result) => result.id),
    expected,
    'el orden explícito desc debe coincidir con el default',
  );
});

test('REQ-17-01/03: searchPosts sin orden (default) y con orden desc conservan el descendente', () => {
  const index = buildSearchIndex(POSTS, {});
  const expected = ['00-agilismo', '01-diseno', '02-typescript', '03-dom', '04-css', '05-http'];
  const def = searchPosts(POSTS, {}, 'arquitectura', 1);
  assert.deepEqual(
    def.results.map((result) => result.id),
    expected,
    'searchPosts default descendente (REQ-02-04/05)',
  );
  const desc = searchPosts(POSTS, {}, 'arquitectura', 1, 'desc');
  assert.deepEqual(
    desc.results.map((result) => result.id),
    expected,
    'searchPosts con desc explícito',
  );
  const asc = searchPosts(POSTS, {}, 'arquitectura', 1, 'asc');
  assert.equal(asc.results[0].id, '06-git', 'searchPosts con asc trae el más antiguo primero');
});

// --- REQ-17-02 / REQ-17-05 (wiring): /<término> con DOM fake ------------------

test('REQ-17-02 (wiring): al cargar /<término> el primer item pintado es el más antiguo', () => {
  const { calls, cleanup } = initWith('/arquitectura');
  try {
    assert.ok(calls.list.length > 0, 'no se pintaron items al cargar /<término>');
    assert.match(
      calls.list[0],
      /href="\/posts\/06-git"/,
      'el primer item no es el más antiguo (2024-03-01)',
    );
    assert.doesNotMatch(
      calls.list[0],
      /href="\/posts\/00-agilismo"/,
      'el más reciente (2026-08-10) no debe ir primero en la ruta por término',
    );
  } finally {
    cleanup();
  }
});

test('REQ-17-05 (wiring): la paginación de /<término> conserva el orden ascendente', () => {
  const { calls, fireNext, cleanup } = initWith('/arquitectura');
  try {
    assert.equal(calls.list.length, 1, 'la página 1 se pintó una vez');
    assert.doesNotMatch(
      calls.list[0],
      /href="\/posts\/00-agilismo"/,
      'con asc el más reciente queda fuera de la página 1',
    );
    fireNext();
    assert.ok(calls.list.length >= 2, 'el botón siguiente no re-renderizó la página');
    assert.match(
      calls.list[1],
      /href="\/posts\/00-agilismo"/,
      'la página 2 no conserva el orden ascendente (REQ-17-05)',
    );
    assert.equal(PAGE_SIZE, 6, 'PAGE_SIZE debe seguir exportado (REQ-02-06)');
  } finally {
    cleanup();
  }
});

test('REQ-17-03 (wiring): /search?q= conserva el orden descendente (el más reciente primero)', () => {
  const { calls, cleanup } = initWith('/search', '?q=arquitectura');
  try {
    assert.ok(calls.list.length > 0, 'con q no se presentan resultados');
    assert.match(
      calls.list[0],
      /href="\/posts\/00-agilismo"/,
      'el primer item de /search?q= no es el más reciente (REQ-17-03)',
    );
  } finally {
    cleanup();
  }
});

// --- Inspección del controlador (REQ-17-02/03/05) ------------------------------

test('REQ-17-02/03: el controlador deriva el orden por el origen del término', () => {
  const controller = readController();
  assert.match(
    controller,
    /renderSearch\(term, index, 1, q !== '' \? 'desc' : 'asc'\)/,
    'la primera render no pasa desc con q y asc con pathname (REQ-17-02/03)',
  );
  assert.match(
    controller,
    /searchIndex\(index, term, page, order\)/,
    'renderSearch no propaga el orden a searchIndex',
  );
});

test('REQ-17-05: la paginación re-renderiza con el mismo orden', () => {
  const controller = readController();
  assert.match(
    controller,
    /renderSearch\(term, index, data\.page - 1, order\)/,
    'el botón anterior no conserva el orden (REQ-17-05)',
  );
  assert.match(
    controller,
    /renderSearch\(term, index, data\.page \+ 1, order\)/,
    'el botón siguiente no conserva el orden (REQ-17-05)',
  );
});

// --- REQ-17-06: el panel en vivo conserva el orden predeterminado --------------

test('REQ-17-06: search-live.ts llama a searchIndex sin el parámetro de orden', () => {
  const live = readLive();
  assert.match(
    live,
    /searchIndex\(index, term, 1\)/,
    'search-live no conserva la llamada sin orden (panel en vivo descendente, REQ-17-06)',
  );
  assert.doesNotMatch(
    live,
    /searchIndex\(index, term, 1,\s*['"]asc['"]\)/,
    'search-live no debe pedir orden ascendente',
  );
});

// --- Restricciones del arnés ----------------------------------------------------

test('REQ-17-07: search.ts y search-results-controller.ts no superan 100 líneas', () => {
  for (const [name, url] of [
    ['src/domain/search/search.ts', SEARCH_URL],
    ['src/components/search-results/search-results-controller.ts', CONTROLLER_URL],
  ]) {
    assert.ok(existsSync(url), `${name} no existe`);
    const lines = countLines(readFileSync(url, 'utf8'));
    assert.ok(lines <= 100, `${name} tiene ${lines} líneas (máximo 100, REQ-17-07)`);
  }
});