// Test de la búsqueda por término en la raíz (feature 7 root-term-search,
// REQ-07-01..11). Patrón mixto del arnés (precedente search-dedicated-view y
// search-landing-live-transition): unitarios por import directo de las
// funciones puras nuevas (termFromPathname, clearDestination) + wiring con
// DOM fake de initSearchResults (deep linking, empty state, limpiar → raíz,
// coexistencia /search?q=) + inspección por regex sobre [...term].astro y el
// controlador compartido.
//
//   REQ-07-01/02 — src/pages/[...term].astro sirve /<término> on-demand
//                  (prerender = false; términos arbitrarios, sin
//                  getStaticPaths).
//   REQ-07-03 — al cargar /<término> el controlador deriva el término del
//               pathname y presenta los resultados prefiltrados.
//   REQ-07-04 — sin coincidencias: empty state con el término (nunca 404).
//   REQ-07-05 — la página obtiene artículos con PostsRepository + dominio.
//   REQ-07-06 — cada tarjeta enlaza a /posts/[id].
//   REQ-07-07 — el documento declara el título con el término.
//   REQ-07-08 — reutiliza Layout.astro y la presentación de /search.
//   REQ-07-09 — las rutas estáticas conservan sus archivos (la prioridad de
//               rutas de Astro las protege del catch-all).
//   REQ-07-10 — limpiar en /<término> navega a la raíz '/'.
//   REQ-07-11 — /search?q= queda intacta (el controlador sigue leyendo q).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  termFromPathname,
  clearDestination,
} from '../src/components/search-results/term-route.ts';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';

const PAGE_URL = new URL('../src/pages/[...term].astro', import.meta.url);
const CONTROLLER_URL = new URL(
  '../src/components/search-results/search-results-controller.ts',
  import.meta.url,
);
const TERM_ROUTE_URL = new URL(
  '../src/components/search-results/term-route.ts',
  import.meta.url,
);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPage() {
  assert.ok(existsSync(PAGE_URL), 'src/pages/[...term].astro no existe (REQ-07-01)');
  return readFileSync(PAGE_URL, 'utf8');
}

function readController() {
  assert.ok(existsSync(CONTROLLER_URL), 'search-results-controller.ts no existe');
  return readFileSync(CONTROLLER_URL, 'utf8');
}

// Fixture del índice (mismo shape que SearchIndexEntry).
const CATALOG = [
  {
    id: '00-agilismo',
    title: 'Agilismo, diseño y fragilidad',
    description: 'Conceptos fundamentales de la arquitectura de software.',
    tags: ['arquitectura', 'agilismo'],
    body: '',
    date: '2026-08-10',
    img: 'arch00.jpg',
    readtime: 15,
    author: 'Moises Baldenegro Melendez',
  },
  {
    id: '01-diseno',
    title: 'Diseño detallado',
    description: 'Un artículo sobre diseño de detalle.',
    tags: ['diseno'],
    body: '',
    date: '2026-08-11',
    img: 'arch01.jpg',
    readtime: 5,
    author: 'A',
  },
];

// DOM fake mínimo: initSearchResults usa document.getElementById,
// document.querySelector (toggleAttribute, textContent, innerHTML,
// addEventListener) y window.location/history.
function fakeDom(index) {
  const calls = {
    toggle: [],
    term: [],
    grid: [],
    label: [],
    title: [],
    assign: [],
    replaceState: [],
    clearClick: null,
  };
  const nodes = new Map();
  const selectors = [
    '[data-search-guide]',
    '[data-search-empty]',
    '[data-search-grid]',
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
        if (selector === '[data-search-clear]' && event === 'click') {
          calls.clearClick = handler;
        }
      },
      set textContent(value) {
        if (selector === '[data-search-term]') calls.term.push(value);
        if (selector === '[data-search-page-label]') calls.label.push(value);
      },
      set innerHTML(value) {
        if (selector === '[data-search-grid]') calls.grid.push(value);
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
    // El handler de limpiar referencia window al invocarse: se ejecuta con
    // los globals instalados y cleanup() los retira al terminar el test.
    fireClear() {
      calls.clearClick();
    },
    cleanup() {
      delete globalThis.window;
      delete globalThis.document;
    },
  };
}

// --- REQ-07-01 / REQ-07-02: página catch-all on-demand ----------------------

test('REQ-07-01/02: [...term].astro existe, sirve /<término> on-demand y no enumera rutas', () => {
  const page = readPage();
  assert.match(page, /prerender\s*=\s*false/, 'la página no declara prerender = false (REQ-07-02)');
  assert.doesNotMatch(page, /prerender\s*=\s*true/, 'la página no debe prerenderizarse');
  assert.doesNotMatch(page, /getStaticPaths/, 'el catch-all no debe enumerar términos (REQ-07-02)');
});

test('REQ-07-05: la página obtiene los artículos con PostsRepository y el índice del dominio', () => {
  const page = readPage();
  assert.match(page, /PostsRepository/, 'la página no usa PostsRepository (REQ-07-05)');
  assert.match(page, /getCollection/, 'la página no obtiene la colección architecture');
  assert.match(page, /buildSearchIndex/, 'la página no construye el índice con el dominio');
});

test('REQ-07-05: la página serializa el índice embebido con escape de </script', () => {
  const page = readPage();
  assert.match(page, /type="application\/json"/, 'no hay script type=application/json');
  assert.match(page, /id="search-index"/, 'el script del índice no tiene id="search-index"');
  assert.match(page, /set:html=\{indexJson\}/, 'el índice no se inyecta con set:html');
  assert.match(page, /JSON\.stringify/, 'la serialización no usa JSON.stringify');
  assert.match(page, /is:inline/, 'el script del índice debe ser is:inline');
  assert.match(
    page,
    /<\\\/script/,
    'el índice embebido no escapa </script como <\\/script (patrón REQ-03-07)',
  );
});

// --- REQ-07-07 / REQ-07-08: título con término y presentación reutilizada ----

test('REQ-07-07: el documento declara el título con el término consultado', () => {
  const page = readPage();
  assert.match(page, /Astro\.params/, 'la página no lee el término del parámetro de ruta');
  assert.match(
    page,
    /title=\{`Búsqueda: \$\{term\}`\}/,
    'la página no pasa el título con el término a Layout (REQ-07-07)',
  );
});

test('REQ-07-08: la página reutiliza Layout.astro y la presentación de /search', () => {
  const page = readPage();
  assert.match(page, /<Layout[^>]*title=/, 'la página no reutiliza Layout.astro (REQ-07-08)');
  assert.match(page, /<SearchResults\s*\/>/, 'la página no reutiliza la presentación de /search');
  assert.doesNotMatch(page, /<style/i, 'la página no debe llevar <style> embebido');
});

test('REQ-07-09: las rutas estáticas existentes conservan sus archivos (prioridad de Astro)', () => {
  for (const file of [
    'src/pages/index.astro',
    'src/pages/about.astro',
    'src/pages/search.astro',
    'src/pages/posts/[id].astro',
  ]) {
    assert.ok(existsSync(new URL(`../${file}`, import.meta.url)), `${file} no existe (REQ-07-09)`);
  }
});

// --- REQ-07-03: extracción del término del pathname (funciones puras) --------

test('REQ-07-03: termFromPathname extrae el término de /<término>', () => {
  assert.equal(termFromPathname('/arquitectura'), 'arquitectura');
  assert.equal(termFromPathname('/typescript'), 'typescript');
  assert.equal(termFromPathname('/agilismo/'), 'agilismo');
});

test('REQ-07-03: termFromPathname decodifica %20 y UTF-8 de la URL', () => {
  assert.equal(termFromPathname('/agilismo%20detallado'), 'agilismo detallado');
  assert.equal(termFromPathname('/dise%C3%B1o'), 'diseño');
});

test('REQ-07-03: termFromPathname normaliza multi-segmento a espacios', () => {
  assert.equal(termFromPathname('/foo/bar'), 'foo bar');
  assert.equal(termFromPathname('/search/foo'), 'search foo');
});

test('REQ-07-03: termFromPathname con encoding malformado no rompe (degradación)', () => {
  assert.equal(termFromPathname('/%E0%A4%A'), '%E0%A4%A');
});

test('REQ-07-03: termFromPathname en /search sin q devuelve vacío → guía (REQ-03-03)', () => {
  assert.equal(termFromPathname('/search'), '');
  assert.equal(termFromPathname('/search/'), '');
  assert.equal(termFromPathname('/'), '');
  assert.equal(termFromPathname(''), '');
});

// --- REQ-07-10: limpiar en la ruta dinámica navega a la raíz -----------------

test('REQ-07-10: clearDestination devuelve la raíz en /<término> y no-op en /search', () => {
  assert.equal(clearDestination('/arquitectura'), '/');
  assert.equal(clearDestination('/foo/bar'), '/');
  assert.equal(clearDestination('/search'), '/search');
});

// --- REQ-07-03/04/06/07 (wiring): deep linking con DOM fake ------------------

test('REQ-07-03 (wiring): init con pathname sin q presenta resultados prefiltrados', () => {
  const { calls, cleanup } = initWith('/arquitectura');
  try {
    assert.ok(calls.grid.length > 0, 'no se pintaron tarjetas al cargar /<término> (REQ-07-03)');
    assert.match(
      calls.grid[0],
      /href="\/posts\/00-agilismo"/,
      'la tarjeta no enlaza a /posts/[id] (REQ-07-06)',
    );
    assert.equal(
      calls.title.at(-1),
      'Búsqueda: arquitectura',
      'el título del documento no lleva el término (REQ-07-07)',
    );
    assert.deepEqual(
      calls.toggle.find(([s]) => s === '[data-search-guide]'),
      ['[data-search-guide]', 'hidden', true],
      'la guía no se oculta al presentar resultados',
    );
  } finally {
    cleanup();
  }
});

test('REQ-07-04 (wiring): sin coincidencias → empty state con el término (nunca 404)', () => {
  const { calls, cleanup } = initWith('/zzz-no-existe');
  try {
    assert.equal(
      calls.term.at(-1),
      'zzz-no-existe',
      'el empty state no muestra el término consultado (REQ-07-04)',
    );
    assert.deepEqual(
      calls.toggle.find(([s]) => s === '[data-search-empty]'),
      ['[data-search-empty]', 'hidden', false],
      'el empty state no se muestra (REQ-07-04)',
    );
    assert.equal(calls.grid.length, 0, 'sin coincidencias no se pintan tarjetas');
  } finally {
    cleanup();
  }
});

test('REQ-07-10 (wiring): limpiar en /<término> navega a la raíz', () => {
  const { calls, fireClear, cleanup } = initWith('/arquitectura');
  try {
    fireClear();
    assert.deepEqual(calls.assign, ['/'], 'limpiar en la ruta dinámica no navegó a la raíz');
    assert.equal(calls.replaceState.length, 0, 'en la ruta dinámica no debe reescribirse ?q=');
  } finally {
    cleanup();
  }
});

test('REQ-07-03 (wiring): /search sin q muestra la guía (no deriva "search" como término)', () => {
  const { calls, cleanup } = initWith('/search');
  try {
    assert.equal(calls.grid.length, 0, '/search sin q no debe listar resultados (REQ-03-03)');
    assert.deepEqual(
      calls.toggle.find(([s]) => s === '[data-search-guide]'),
      ['[data-search-guide]', 'hidden', false],
      'la guía no se muestra en /search sin q',
    );
  } finally {
    cleanup();
  }
});

// --- REQ-07-11: coexistencia con /search?q= (vista intacta) ------------------

test('REQ-07-11 (wiring): /search?q= sigue leyendo q y limpiar conserva la vista', () => {
  const { calls, fireClear, cleanup } = initWith('/search', '?q=agilismo');
  try {
    assert.ok(calls.grid.length > 0, 'con q no se presentan resultados (REQ-03-02)');
    assert.equal(calls.title.at(-1), 'Búsqueda: agilismo', 'el título no usa el término de q');
    fireClear();
    assert.equal(calls.assign.length, 0, 'REQ-07-11: /search?q= no debe navegar a la raíz');
    assert.equal(calls.replaceState[0][2], '/search', 'REQ-03-08: no se quitó q de la URL');
  } finally {
    cleanup();
  }
});

// --- Inspección del controlador compartido (REQ-07-03/10/11) -----------------

test('REQ-07-03/11: el controlador deriva el pathname solo cuando no hay q', () => {
  const controller = readController();
  assert.match(controller, /term-route\.ts/, 'el controlador no importa el módulo de ruta');
  assert.match(controller, /queryTerm\(window\.location\.search\)/, 'no lee el parámetro q');
  assert.match(
    controller,
    /q !== '' \? q : termFromPathname/,
    'q no gana sobre el pathname cuando existe (REQ-07-11)',
  );
  assert.match(
    controller,
    /termFromPathname\(window\.location\.pathname\)/,
    'no deriva el término del pathname (REQ-07-03)',
  );
  assert.match(controller, /wireClear\(document\.title, q !== ''\)/, 'no distingue el origen del término');
});

test('REQ-07-10: el controlador navega a la raíz al limpiar en la ruta dinámica', () => {
  const controller = readController();
  assert.match(
    controller,
    /window\.location\.assign\(clearDestination\(window\.location\.pathname\)\)/,
    'limpiar en la ruta dinámica no navega a la raíz (REQ-07-10)',
  );
  assert.match(controller, /clearDestination/, 'no usa la función pura de limpiar');
});

test('REQ-07-11: el controlador conserva la limpieza de ?q= (REQ-03-08)', () => {
  const controller = readController();
  assert.match(controller, /removeQueryParam/, 'se perdió la limpieza del parámetro q');
});

// --- Restricciones del arnés ------------------------------------------------

test('REQ-07-00: ≤100 líneas en página, controlador y módulo de ruta', () => {
  for (const [name, url] of [
    ['src/pages/[...term].astro', PAGE_URL],
    ['src/components/search-results/search-results-controller.ts', CONTROLLER_URL],
    ['src/components/search-results/term-route.ts', TERM_ROUTE_URL],
  ]) {
    const lines = countLines(readFileSync(url, 'utf8'));
    assert.ok(lines <= 100, `${name} tiene ${lines} líneas (máximo 100)`);
  }
});