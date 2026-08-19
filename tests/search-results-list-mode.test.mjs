// Test del modo lista en los resultados de búsqueda (feature 9
// search-results-list-mode, REQ-09-01..12). Patrón mixto del arnés
// (precedente search-dedicated-view.test.mjs): unitarios por import directo
// del generador item-html.ts + inspección por regex sobre el componente, el
// controlador, la hoja canónica, el panel en vivo y tokens.css.
//
//   REQ-09-01 — las coincidencias se presentan como lista de items en una
//               sola columna (ul.search-results__list, sin toggle: D1).
//   REQ-09-02 — el controlador pinta cada item con itemHtml de item-html.ts.
//   REQ-09-03 — itemHtml emite un item li con el título enlazado a
//               /posts/[id].
//   REQ-09-04 — el item incluye la miniatura de la imagen del artículo.
//   REQ-09-05 — el item incluye la meta y las etiquetas junto al título.
//   REQ-09-06/07 — hover: fondo de fila resaltado y título subrayado.
//   REQ-09-08 — separación entre items con var(--color-border) (hairline).
//   REQ-09-09 — ≤768px: miniatura oculta y espaciado del item reducido.
//   REQ-09-10 — el panel en vivo reutiliza la lista y el generador itemHtml.
//   REQ-09-11/12 — guía, empty state con limpiar, paginación sin recarga y
//                  enlaces /posts/[id] conservados.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { itemHtml } from '../src/components/search-results/item-html.ts';

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
const TOKENS_URL = new URL('../src/styles/tokens.css', import.meta.url);
const LIVE_URL = new URL('../src/components/search-live/search-live.ts', import.meta.url);
const LIVE_COMPONENT_URL = new URL(
  '../src/components/search-live/search-live.astro',
  import.meta.url,
);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readComponent() {
  assert.ok(
    existsSync(COMPONENT_URL),
    'src/components/search-results/search-results.astro no existe (REQ-09-01)',
  );
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readController() {
  assert.ok(
    existsSync(CONTROLLER_URL),
    'src/components/search-results/search-results-controller.ts no existe (REQ-09-02)',
  );
  return readFileSync(CONTROLLER_URL, 'utf8');
}

function readCss() {
  assert.ok(
    existsSync(CSS_URL),
    'src/styles/search-results.css no existe (REQ-09-06, design.md)',
  );
  return readFileSync(CSS_URL, 'utf8');
}

function readTokens() {
  assert.ok(existsSync(TOKENS_URL), 'src/styles/tokens.css no existe (design.md)');
  return readFileSync(TOKENS_URL, 'utf8');
}

function readLive() {
  assert.ok(
    existsSync(LIVE_URL),
    'src/components/search-live/search-live.ts no existe (REQ-09-10)',
  );
  return readFileSync(LIVE_URL, 'utf8');
}

function readLiveComponent() {
  assert.ok(
    existsSync(LIVE_COMPONENT_URL),
    'src/components/search-live/search-live.astro no existe (REQ-09-10)',
  );
  return readFileSync(LIVE_COMPONENT_URL, 'utf8');
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

// --- REQ-09-01 / REQ-09-02: contenedor de lista y controlador --------------

test('REQ-09-01: el componente declara el contenedor ul con data-search-list', () => {
  const component = readComponent();
  assert.match(
    component,
    /<ul[^>]*data-search-list[^>]*>/,
    'no hay contenedor ul de la lista (REQ-09-01)',
  );
  assert.doesNotMatch(
    component,
    /data-search-grid/,
    'persiste el contenedor viejo data-search-grid (D5)',
  );
});

test('REQ-09-02: el controlador importa itemHtml y pinta en [data-search-list]', () => {
  const controller = readController();
  assert.match(controller, /item-html\.ts/, 'el controlador no importa item-html.ts (REQ-09-02)');
  assert.match(controller, /itemHtml/, 'el controlador no usa el generador itemHtml');
  assert.match(
    controller,
    /data-search-list/,
    'el controlador no pinta en el contenedor data-search-list (D5)',
  );
  assert.match(controller, /toggle\(['"]list['"]/, 'el controlador no alterna el contenedor list');
});

// --- REQ-09-03 / REQ-09-04: item li con título enlazado y miniatura ---------

test('REQ-09-03/04: itemHtml emite un item li con el título enlazado a /posts/[id] y miniatura', () => {
  const html = itemHtml(ENTRY);
  assert.match(html, /^<li class="search-results__item">/, 'el item no abre como li (REQ-09-03)');
  assert.match(html, /href="\/posts\/00-agilismo"/, 'el item no enlaza a /posts/[id] (REQ-09-03)');
  assert.match(html, /Agilismo, diseño y fragilidad/, 'el item no incluye el título');
  assert.match(
    html,
    /<img class="search-results__thumb" src="\/assets\/content\/arch00\.jpg"/,
    'el item no incluye la miniatura de la imagen (REQ-09-04)',
  );
});

// --- REQ-09-05: meta y etiquetas junto al título ----------------------------

test('REQ-09-05: itemHtml incluye la meta y las etiquetas junto al título', () => {
  const html = itemHtml(ENTRY);
  const title = html.indexOf('Agilismo, diseño y fragilidad');
  const meta = html.indexOf('Por Moises Baldenegro Melendez • 15 min de lectura');
  const tags = html.indexOf('#arquitectura');
  assert.ok(meta > title, 'la meta no aparece junto al título (REQ-09-05)');
  assert.ok(tags > title, 'las etiquetas no aparecen junto al título (REQ-09-05)');
  assert.match(html, /#agilismo/, 'no se incluyen todas las etiquetas');
});

test('REQ-09-00: itemHtml escapa HTML del catálogo (no rompe el marcado)', () => {
  const html = itemHtml({ ...ENTRY, title: 'A <b>roto</b>', description: 'X & Y' });
  assert.match(html, /A &lt;b&gt;roto&lt;\/b&gt;/, 'el título no se escapa');
  assert.match(html, /X &amp; Y/, 'la descripción no se escapa');
});

// --- REQ-09-06 / REQ-09-07 / REQ-09-08: hover y separación hairline ---------

test('REQ-09-06/07: la hoja resalta el fondo de la fila y subraya el título al hover', () => {
  const css = readCss();
  assert.match(
    css,
    /\.search-results__item:hover\s*\{[^}]*background:\s*var\(--color-surface\)/,
    'el hover no resalta el fondo con --color-surface (REQ-09-06)',
  );
  assert.match(
    css,
    /\.search-results__link:hover\s*\{[^}]*text-decoration:\s*underline/,
    'el hover no subraya el título (REQ-09-07)',
  );
});

test('REQ-09-08: la hoja separa los items apilados con var(--color-border)', () => {
  const css = readCss();
  assert.match(
    css,
    /\.search-results__item\s*\{[^}]*border-bottom:\s*1px solid var\(--color-border\)/,
    'los items no se separan con --color-border (REQ-09-08)',
  );
  assert.match(
    css,
    /\.search-results__item:last-child\s*\{[^}]*border-bottom:\s*none/,
    'el último item conserva el borde inferior',
  );
});

// --- REQ-09-09: media query ≤768px -------------------------------------------

test('REQ-09-09: la media query ≤768px oculta la miniatura y reduce el espaciado', () => {
  const css = readCss();
  const media =
    css.match(/@media\s*\(max-width:\s*768px\)\s*\{([\s\S]*)\}\s*$/)?.[1] ?? '';
  assert.ok(media.length > 0, 'no hay media query de 768px o menos (REQ-09-09)');
  assert.match(
    media,
    /\.search-results__thumb\s*\{[^}]*display:\s*none/,
    'la miniatura no se oculta en ≤768px (REQ-09-09)',
  );
  assert.match(
    media,
    /\.search-results__item\s*\{[^}]*padding:\s*12px 6px/,
    'el espaciado del item no se reduce en ≤768px (REQ-09-09)',
  );
});

// --- REQ-09-10: panel en vivo de la portada ----------------------------------

test('REQ-09-10: el panel en vivo reutiliza la lista y el generador itemHtml', () => {
  const controller = readLive();
  assert.match(controller, /item-html\.ts/, 'search-live no importa item-html.ts (REQ-09-10)');
  assert.match(controller, /itemHtml/, 'search-live no reutiliza el generador itemHtml');
  assert.match(controller, /data-search-list/, 'search-live no pinta en data-search-list');
  const component = readLiveComponent();
  assert.match(
    component,
    /<ul[^>]*data-search-list[^>]*>/,
    'el panel no declara el contenedor ul de lista (REQ-09-10)',
  );
  assert.match(component, /search-results\.css/, 'el panel no importa la hoja canónica');
});

// --- REQ-09-11 / REQ-09-12: comportamiento conservado -----------------------

test('REQ-09-11: el modo lista conserva la guía y el empty state con limpiar', () => {
  const component = readComponent();
  assert.match(component, /data-search-guide/, 'se perdió la guía (REQ-09-11)');
  assert.match(
    component,
    /No se encontraron resultados para '<span data-search-term><\/span>'/,
    'se perdió el mensaje del empty state (REQ-09-11)',
  );
  assert.match(
    component,
    /<button[^>]*data-search-clear[^>]*>Limpiar búsqueda<\/button>/,
    'se perdió la acción de limpiar (REQ-09-11)',
  );
});

test('REQ-09-12: el modo lista conserva la paginación sin recarga y los enlaces /posts/[id]', () => {
  const component = readComponent();
  assert.match(component, /<nav[^>]*data-search-pagination/, 'se perdió la paginación');
  assert.doesNotMatch(
    component,
    /<a[^>]*data-search-(prev|next)/,
    'la paginación no debe navegar con enlaces (sin recarga, REQ-09-12)',
  );
  const controller = readController();
  assert.match(controller, /searchIndex\(/, 'la paginación no usa searchIndex del dominio');
  assert.doesNotMatch(
    controller,
    /location\.reload|\.submit\(/,
    'la paginación recargaría el documento (REQ-09-12)',
  );
  assert.match(
    itemHtml(ENTRY),
    /href="\/posts\/00-agilismo"/,
    'los items no enlazan a /posts/[id] (REQ-09-12)',
  );
});

// --- Restricciones del arnés --------------------------------------------------

test('REQ-09-00: item-html.ts no supera 100 líneas', () => {
  assert.ok(existsSync(ITEM_HTML_URL), 'item-html.ts no existe (REQ-09-02)');
  const lines = countLines(readFileSync(ITEM_HTML_URL, 'utf8'));
  assert.ok(lines <= 100, `item-html.ts tiene ${lines} líneas (máximo 100)`);
});

test('REQ-09-00: search-results.css usa solo tokens existentes o --radius-thumb, sin colores sueltos', () => {
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

test('REQ-09-00: tokens.css declara el token nuevo --radius-thumb (justificado en design.md)', () => {
  const tokens = readTokens();
  assert.match(tokens, /--radius-thumb:\s*10px;/, 'tokens.css no declara --radius-thumb: 10px');
});