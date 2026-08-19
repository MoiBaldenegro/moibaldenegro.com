// Test de la vista dedicada de búsqueda (feature 3 search-dedicated-view,
// REQ-03-01..10). Patrón mixto: inspección por regex sobre la página, el
// componente, el controlador y la hoja de estilos + unitarios por import
// directo de las funciones puras del controlador (precedente de
// tests/search-domain.test.mjs y de los tests de inspección 21-44).
//
//   REQ-03-01 — la página /search declara prerender true.
//   REQ-03-02 — la vista lee q y lo aplica como filtro inicial (deep linking).
//   REQ-03-03 — sin q o con q vacío muestra el estado inicial (guía), no el
//               catálogo completo.
//   REQ-03-04 — con coincidencias presenta una lista de items.
//   REQ-03-05 — sin coincidencias muestra "No se encontraron resultados para
//               el término" con acción de limpiar.
//   REQ-03-06 — la paginación usa el dominio (searchIndex/PAGE_SIZE) sin
//               recargar el documento.
//   REQ-03-07 — la página serializa el índice de búsqueda en el documento con
//               escape de </script (<\/script).
//   REQ-03-08 — la acción de limpiar elimina el parámetro q y muestra el
//               estado inicial.
//   REQ-03-09 — cada item enlaza a /posts/[id].
//   REQ-03-10 — el título del documento declara el término consultado (prop
//               title de Layout + document.title en el cliente).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  itemHtml,
} from '../src/components/search-results/item-html.ts';
import {
  queryTerm,
  removeQueryParam,
  pageLabel,
} from '../src/components/search-results/search-results-controller.ts';

const PAGE_URL = new URL('../src/pages/search.astro', import.meta.url);
const COMPONENT_URL = new URL(
  '../src/components/search-results/search-results.astro',
  import.meta.url,
);
const CONTROLLER_URL = new URL(
  '../src/components/search-results/search-results-controller.ts',
  import.meta.url,
);
const ITEM_HTML_URL = new URL(
  '../src/components/search-results/item-html.ts',
  import.meta.url,
);
const CSS_URL = new URL('../src/styles/search-results.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPage() {
  assert.ok(existsSync(PAGE_URL), 'src/pages/search.astro no existe (REQ-03-01)');
  return readFileSync(PAGE_URL, 'utf8');
}

function readComponent() {
  assert.ok(
    existsSync(COMPONENT_URL),
    'src/components/search-results/search-results.astro no existe (REQ-03-04)',
  );
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readController() {
  assert.ok(
    existsSync(CONTROLLER_URL),
    'src/components/search-results/search-results-controller.ts no existe (REQ-03-02)',
  );
  return readFileSync(CONTROLLER_URL, 'utf8');
}

function readCss() {
  assert.ok(
    existsSync(CSS_URL),
    'src/styles/search-results.css no existe (REQ-03-04, design.md Decisión 3)',
  );
  return readFileSync(CSS_URL, 'utf8');
}

// Fixture de entrada para itemHtml (mismo shape que SearchIndexEntry).
const ENTRY = {
  id: '00-agilismo',
  title: 'Agilismo, diseño y fragilidad',
  description: 'Conceptos fundamentales de la arquitectura de software.',
  tags: ['arquitectura', 'agilismo'],
  body: '',
  date: '2026-08-10',
  img: 'arch00.jpg',
  readtime: 15,
  author: 'Moises Baldenegro Melendez',
};

// --- REQ-03-01 / REQ-03-07: prerender e índice embebido -------------------

test('REQ-03-01: src/pages/search.astro existe y declara prerender true', () => {
  const page = readPage();
  assert.match(page, /prerender\s*=\s*true/, 'la página no declara prerender = true (REQ-03-01)');
});

test('REQ-03-07: la página serializa el índice con un script application/json', () => {
  const page = readPage();
  assert.match(page, /type="application\/json"/, 'no hay script type=application/json (REQ-03-07)');
  assert.match(page, /id="search-index"/, 'el script del índice no tiene id="search-index"');
  assert.match(page, /set:html=\{[^}]+\}/, 'el índice no se inyecta con set:html');
  assert.match(page, /JSON\.stringify/, 'la serialización no usa JSON.stringify (REQ-03-07)');
  assert.match(page, /buildSearchIndex/, 'la página no construye el índice con el dominio');
  assert.match(page, /is:inline/, 'el script del índice debe ser is:inline (se emite tal cual)');
});

test('REQ-03-07: la serialización escapa </script como <\\/script', () => {
  const page = readPage();
  assert.match(
    page,
    /<\\\/script/,
    'el índice embebido no escapa </script como <\\/script (REQ-03-07)',
  );
});

// --- REQ-03-02 / REQ-03-10: deep linking y título --------------------------

test('REQ-03-02: el controlador lee el parámetro q de la URL con URLSearchParams', () => {
  const controller = readController();
  assert.match(controller, /URLSearchParams/, 'el controlador no usa URLSearchParams');
  assert.match(controller, /location\.search/, 'el controlador no lee location.search');
});

test('REQ-03-02: el controlador aplica q como filtro inicial con searchIndex del dominio', () => {
  const controller = readController();
  assert.match(
    controller,
    /domain\/search\/search\.ts/,
    'el controlador no importa searchIndex del dominio (REQ-03-06)',
  );
  assert.match(controller, /searchIndex\(/, 'el filtrado inicial no usa searchIndex (REQ-03-02)');
});

test('REQ-03-02: el controlador se arranca desde el componente de resultados', () => {
  const component = readComponent();
  assert.match(
    component,
    /search-results-controller/,
    'el componente no importa el controlador .ts (regla 8)',
  );
  assert.match(
    component,
    /document\.addEventListener\(['"]astro:page-load['"]/,
    'el componente no registra la init como listener de astro:page-load (feature 10)',
  );
  assert.match(
    component,
    /=>\s*initSearchResults\(\)/,
    'el listener no invoca initSearchResults (feature 10)',
  );
  assert.doesNotMatch(
    component,
    /^\s*initSearchResults\(\);?\s*$/m,
    'el componente conserva la llamada directa (feature 10 la sustituye)',
  );
});

test('REQ-03-10: la página declara el título del documento con la prop title de Layout', () => {
  const page = readPage();
  assert.match(page, /<Layout[^>]*title=/, 'la página no pasa la prop title a Layout.astro');
});

test('REQ-03-10: el controlador actualiza document.title con el término consultado', () => {
  const controller = readController();
  assert.match(controller, /document\.title\s*=/, 'el controlador no declara document.title');
  assert.match(
    controller,
    /Búsqueda: \$\{term\}/,
    'el título del documento no incluye el término (REQ-03-10)',
  );
});

// --- REQ-03-03: estado inicial sin q (guía, no catálogo) -------------------

test('REQ-03-03: el componente muestra la guía de búsqueda por defecto y oculta la lista', () => {
  const component = readComponent();
  const guide = component.match(/<div[^>]*data-search-guide[^>]*>/)?.[0] ?? '';
  assert.ok(guide.includes('data-search-guide'), 'falta el bloque de guía data-search-guide');
  assert.ok(!guide.includes('hidden'), 'la guía no es visible por defecto (estado inicial)');
  const list = component.match(/<ul[^>]*data-search-list[^>]*>/)?.[0] ?? '';
  assert.ok(list.includes('data-search-list'), 'falta la lista data-search-list');
  assert.ok(list.includes('hidden'), 'la lista no empieza oculta (no lista el catálogo)');
});

test('REQ-03-03: la página no lista el catálogo completo en el HTML', () => {
  const page = readPage();
  assert.doesNotMatch(
    page,
    /index\.map\(|searchIndex\(/,
    'la página filtra o lista el catálogo en build: REQ-03-03 exige que el estado inicial sea la guía',
  );
});

test('REQ-03-03: q ausente o vacío ⇒ guía (queryTerm normaliza el parámetro)', () => {
  assert.equal(queryTerm(''), '');
  assert.equal(queryTerm('?q='), '');
  assert.equal(queryTerm('?q=   '), '');
  assert.equal(queryTerm('?x=1'), '');
  assert.equal(queryTerm('?q=agilismo'), 'agilismo');
  assert.equal(queryTerm('?q=agilismo&x=1'), 'agilismo');
});

// --- REQ-03-04 / REQ-03-09: items de resultados ----------------------------

test('REQ-03-04: el componente declara la lista de items (data-search-list)', () => {
  const component = readComponent();
  assert.match(component, /data-search-list/, 'no hay contenedor de la lista (REQ-03-04)');
  assert.doesNotMatch(
    component,
    /data-search-grid/,
    'el contenedor viejo data-search-grid no debe persistir (feature 9, D5)',
  );
});

test('REQ-03-09: itemHtml genera el enlace /posts/[id] del item', () => {
  const html = itemHtml(ENTRY);
  assert.match(
    html,
    /href="\/posts\/00-agilismo"/,
    'el item no enlaza a /posts/[id] (REQ-03-09)',
  );
});

test('REQ-03-04: itemHtml pinta la vista previa (imagen, título, meta, descripción, tags)', () => {
  const html = itemHtml(ENTRY);
  assert.match(html, /<li class="search-results__item">/, 'el item no abre como li');
  assert.match(
    html,
    /src="\/assets\/content\/arch00\.jpg"/,
    'el item no incluye la imagen de vista previa',
  );
  assert.match(html, /Agilismo, diseño y fragilidad/, 'el item no incluye el título');
  assert.match(
    html,
    /Por Moises Baldenegro Melendez • 15 min de lectura/,
    'el item no incluye la meta (autor y lectura)',
  );
  assert.match(
    html,
    /Conceptos fundamentales de la arquitectura de software\./,
    'el item no incluye la descripción',
  );
  assert.match(html, /#arquitectura/, 'el item no incluye los tags');
  assert.match(html, /#agilismo/, 'el item no incluye todos los tags');
});

test('REQ-03-04: itemHtml escapa HTML del catálogo (no rompe el marcado)', () => {
  const html = itemHtml({ ...ENTRY, title: 'A <b>roto</b>', description: 'X & Y' });
  assert.match(html, /A &lt;b&gt;roto&lt;\/b&gt;/, 'el título no se escapa');
  assert.match(html, /X &amp; Y/, 'la descripción no se escapa');
});

// --- REQ-03-06: paginación sin recargar el documento -----------------------

test('REQ-03-06: el componente declara la paginación con botones (sin enlaces)', () => {
  const component = readComponent();
  assert.match(component, /<nav[^>]*data-search-pagination/, 'no hay navegación de paginación');
  assert.match(component, /data-search-prev/, 'falta el botón Anterior');
  assert.match(component, /data-search-next/, 'falta el botón Siguiente');
  assert.doesNotMatch(
    component,
    /<a[^>]*data-search-(prev|next)/,
    'la paginación no debe navegar con enlaces (REQ-03-06: sin recargar)',
  );
});

test('REQ-03-06: el controlador pagina con el dominio y sin recargar el documento', () => {
  const controller = readController();
  assert.match(controller, /searchIndex\(/, 'la paginación no usa searchIndex del dominio');
  assert.doesNotMatch(
    controller,
    /location\.reload|\.submit\(/,
    'la paginación recargaría el documento (REQ-03-06)',
  );
});

test('REQ-03-06: pageLabel describe la página actual de la paginación', () => {
  assert.equal(pageLabel(1, 2), 'Página 1 de 2');
  assert.equal(pageLabel(2, 2), 'Página 2 de 2');
  assert.equal(pageLabel(1, 1), 'Página 1 de 1');
});

// --- REQ-03-05 / REQ-03-08: empty state y acción de limpiar ----------------

test('REQ-03-05: el componente declara el mensaje exacto del empty state', () => {
  const component = readComponent();
  assert.match(
    component,
    /No se encontraron resultados para '<span data-search-term><\/span>'/,
    'falta el mensaje exacto del empty state con el término interpolado',
  );
});

test('REQ-03-05/08: el empty state incluye la acción de limpiar la búsqueda', () => {
  const component = readComponent();
  assert.match(
    component,
    /<button[^>]*data-search-clear[^>]*>Limpiar búsqueda<\/button>/,
    'falta el botón de limpiar (data-search-clear, REQ-03-05/08)',
  );
});

test('REQ-03-08: el controlador elimina el parámetro q de la URL al limpiar', () => {
  const controller = readController();
  assert.match(
    controller,
    /removeQueryParam|delete\(['"]q['"]\)/,
    'la acción de limpiar no elimina el parámetro q (REQ-03-08)',
  );
});

test('REQ-03-08: removeQueryParam elimina q y deja el resto de la query', () => {
  assert.equal(removeQueryParam('?q=agilismo&x=1', 'q'), 'x=1');
  assert.equal(removeQueryParam('?q=agilismo', 'q'), '');
  assert.equal(removeQueryParam('', 'q'), '');
});

// --- Restricciones del arnés ----------------------------------------------

test('REQ-03-00: ≤100 líneas en página, componente, controlador, generador y hoja', () => {
  for (const [name, url] of [
    ['src/pages/search.astro', PAGE_URL],
    ['src/components/search-results/search-results.astro', COMPONENT_URL],
    ['src/components/search-results/search-results-controller.ts', CONTROLLER_URL],
    ['src/components/search-results/item-html.ts', ITEM_HTML_URL],
    ['src/styles/search-results.css', CSS_URL],
  ]) {
    const lines = countLines(readFileSync(url, 'utf8'));
    assert.ok(lines <= 100, `${name} tiene ${lines} líneas (máximo 100)`);
  }
});

test('REQ-03-00: search-results.css usa solo tokens existentes y sin colores sueltos', () => {
  const css = readCss();
  const allowed = new Set([
    '--color-background',
    '--color-surface',
    '--color-border',
    '--color-text',
    '--color-text-secondary',
    '--color-accent',
    '--radius-card',
    '--radius-pill',
    '--radius-thumb',
    '--gap-card',
    '--transition-default',
    '--font-sans',
    '--container-max',
  ]);
  const vars = [...css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
  assert.ok(vars.length > 0, 'la hoja no usa ningún token');
  for (const token of vars) {
    assert.ok(allowed.has(token), `search-results.css usa el token ${token} fuera de la lista`);
  }
  assert.doesNotMatch(
    css,
    /#[0-9a-fA-F]{3,8}\b|rgba?\(/,
    'search-results.css contiene colores sueltos (deben salir de tokens.css)',
  );
});

test('REQ-03-00: el componente no lleva estilos ni lógica embebida', () => {
  const component = readComponent();
  assert.doesNotMatch(component, /<style/i, 'el componente contiene un bloque <style> embebido');
  assert.doesNotMatch(component, /\bstyle\s*=/, 'el componente conserva atributos style inline');
});
