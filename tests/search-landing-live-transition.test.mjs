// Test de la transición dinámica del layout en la portada (feature 5
// search-landing-live-transition, REQ-05-01..07). Patrón mixto del arnés
// (precedente de search-bar-header.test.mjs y search-dedicated-view.test.mjs):
// unitarios por import directo del controlador .ts puro (sin document/window
// en ámbito de módulo) + wiring con DOM fake + inspección por regex sobre
// index.astro, el componente del panel, el controlador y la hoja.
//
//   REQ-05-01 — consulta vacía → secciones habituales de la portada.
//   REQ-05-02 — consulta ≥1 carácter → ocultar secciones y mostrar el panel
//               de resultados en vivo.
//   REQ-05-03 — al volver a vacío, restaura las secciones de inmediato.
//   REQ-05-04 — el panel en vivo usa la misma presentación que /search
//               (reutiliza itemHtml y search-results.css de la feature 3).
//   REQ-05-05 — sin coincidencias, estado vacío con el término actual
//               (Decisión 3: sin acción de limpiar duplicada).
//   REQ-05-06 — más coincidencias que PAGE_SIZE → primeros PAGE_SIZE + enlace
//               a la vista dedicada /search?q=<término>.
//   REQ-05-07 — comportamiento con JS de runtime en el cliente (excepción
//               documentada, CustomEvent + DOM nativos, sin frameworks).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  layoutMode,
  livePage,
  seeAllUrl,
  applyLive,
} from '../src/components/search-live/search-live.ts';
import { PAGE_SIZE } from '../src/domain/search/search.ts';

const INDEX_URL = new URL('../src/pages/index.astro', import.meta.url);
const COMPONENT_URL = new URL(
  '../src/components/search-live/search-live.astro',
  import.meta.url,
);
const CONTROLLER_URL = new URL(
  '../src/components/search-live/search-live.ts',
  import.meta.url,
);
const CSS_URL = new URL('../src/styles/search-live.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readIndex() {
  assert.ok(existsSync(INDEX_URL), 'src/pages/index.astro no existe (REQ-05-01)');
  return readFileSync(INDEX_URL, 'utf8');
}

function readComponent() {
  assert.ok(
    existsSync(COMPONENT_URL),
    'src/components/search-live/search-live.astro no existe (REQ-05-02)',
  );
  return readFileSync(COMPONENT_URL, 'utf8');
}

function readController() {
  assert.ok(
    existsSync(CONTROLLER_URL),
    'src/components/search-live/search-live.ts no existe (REQ-05-07)',
  );
  return readFileSync(CONTROLLER_URL, 'utf8');
}

function readCss() {
  assert.ok(
    existsSync(CSS_URL),
    'src/styles/search-live.css no existe (design.md Restricciones)',
  );
  return readFileSync(CSS_URL, 'utf8');
}

// Fixture de entradas del índice (mismo shape que SearchIndexEntry).
function entry(id, date = '2026-01-01') {
  return {
    id,
    title: id,
    description: '',
    tags: [],
    body: '',
    date,
    img: '',
    readtime: 1,
    author: 'A',
  };
}

// 9 entradas que coinciden con el término 'p' (p00..p08, fechas asc).
const NINE = Array.from({ length: 9 }, (_, i) =>
  entry(`p${String(i).padStart(2, '0')}`, `2026-01-${String(i + 1).padStart(2, '0')}`),
);

// DOM fake mínimo para el wiring de applyLive (node:test no tiene DOM; el
// controlador alterna atributos hidden y pinta nodos vía querySelector).
function fakePanel() {
  const calls = {
    panelHidden: [],
    landingHidden: [],
    emptyHidden: [],
    listHidden: [],
    listHtml: [],
    term: [],
    href: [],
    allHidden: [],
  };
  const empty = { toggleAttribute: (_name, force) => calls.emptyHidden.push(force) };
  const list = {
    toggleAttribute: (_name, force) => calls.listHidden.push(force),
    set innerHTML(value) {
      calls.listHtml.push(value);
    },
  };
  const termNode = {
    set textContent(value) {
      calls.term.push(value);
    },
  };
  const allLink = {
    setAttribute: (_name, value) => calls.href.push(value),
    toggleAttribute: (_name, force) => calls.allHidden.push(force),
  };
  const panel = {
    toggleAttribute: (_name, force) => calls.panelHidden.push(force),
    querySelector: (selector) =>
      ({
        '[data-search-empty]': empty,
        '[data-search-list]': list,
        '[data-search-term]': termNode,
        '[data-search-all]': allLink,
      })[selector] ?? null,
  };
  const landing = { toggleAttribute: (_name, force) => calls.landingHidden.push(force) };
  return { calls, panel, landing };
}

// --- REQ-05-01 / REQ-05-02 / REQ-05-03: función de estado del layout -------

test('REQ-05-01/02/03: layoutMode — consulta no vacía → results; vacía → landing', () => {
  assert.equal(layoutMode(''), 'landing');
  assert.equal(layoutMode('   '), 'landing');
  assert.equal(layoutMode('a'), 'results');
  assert.equal(layoutMode(' agilismo '), 'results');
});

test('REQ-05-01/02/03 (wiring): applyLive oculta secciones con consulta y restaura al vacío', () => {
  const { calls, panel, landing } = fakePanel();
  applyLive('p', NINE, panel, landing);
  assert.equal(calls.panelHidden.at(-1), false, 'con consulta el panel no se muestra (REQ-05-02)');
  assert.equal(calls.landingHidden.at(-1), true, 'con consulta las secciones no se ocultan (REQ-05-02)');
  assert.ok(calls.listHtml.length > 0, 'con coincidencias no se pinta la lista');
  applyLive('', NINE, panel, landing);
  assert.equal(calls.panelHidden.at(-1), true, 'al vaciar el panel no se oculta (REQ-05-03)');
  assert.equal(calls.landingHidden.at(-1), false, 'al vaciar las secciones no se restauran (REQ-05-03)');
});

test('REQ-05-01/02/03: la portada escucha el evento de la barra (inspección)', () => {
  const index = readIndex();
  assert.match(index, /data-landing-sections/, 'la portada no envuelve las secciones habituales');
  assert.match(index, /<SearchLive/, 'la portada no integra el panel en vivo');
  const controller = readController();
  assert.match(controller, /addEventListener/, 'el controlador no se suscribe a ningún evento');
  assert.match(
    controller,
    /changeEventName\(\)/,
    'el controlador no reutiliza la API del evento de la barra (feature 4, REQ-04-07)',
  );
  assert.match(controller, /detail/, 'el controlador no lee el término de detail del evento');
});

test('REQ-05-01/02/03: el controlador alterna panel y secciones sin recarga (inspección)', () => {
  const controller = readController();
  assert.match(controller, /data-search-live/, 'el controlador no alterna el panel en vivo');
  assert.match(controller, /data-landing-sections/, 'el controlador no alterna las secciones');
  assert.match(controller, /toggleAttribute/, 'la alternancia no usa toggleAttribute/hidden');
  assert.doesNotMatch(
    controller,
    /location\.reload|fetch\(/,
    'la transición no debe recargar ni consultar el servidor (Decisión 5)',
  );
});

// --- REQ-05-04: presentación reutilizada de la vista dedicada ---------------

test('REQ-05-04: la portada serializa el índice embebido con escape (inspección)', () => {
  const index = readIndex();
  assert.match(index, /id="search-index"/, 'falta el script del índice (REQ-03-07)');
  assert.match(index, /type="application\/json"/, 'el índice no es application/json');
  assert.match(index, /set:html=\{indexJson\}/, 'el índice no se inyecta con set:html');
  assert.match(index, /JSON\.stringify/, 'la serialización no usa JSON.stringify');
  assert.match(index, /buildSearchIndex/, 'la portada no construye el índice con el dominio');
  assert.match(index, /is:inline/, 'el script del índice debe ser is:inline');
  assert.match(
    index,
    /<\\\/script/,
    'el índice embebido no escapa </script como <\\/script (REQ-03-07)',
  );
});

test('REQ-05-04: el panel reutiliza la presentación de la vista dedicada (inspección)', () => {
  const controller = readController();
  assert.match(
    controller,
    /item-html\.ts/,
    'el controlador no importa el generador de la feature 3 (REQ-05-04)',
  );
  assert.match(controller, /itemHtml/, 'el controlador no reutiliza itemHtml de la feature 3');
  const component = readComponent();
  assert.match(
    component,
    /search-results\.css/,
    'el panel no importa la hoja canónica de la vista dedicada (REQ-05-04)',
  );
  assert.match(component, /search-results__empty/, 'el panel no reutiliza el bloque empty canónico');
  assert.match(component, /search-results__list/, 'el panel no reutiliza el bloque list canónico');
});

// --- REQ-05-05: estado vacío con el término actual --------------------------

test('REQ-05-05: el empty state muestra el mensaje exacto con el término (inspección)', () => {
  const component = readComponent();
  assert.match(
    component,
    /No se encontraron resultados para '<span data-search-term><\/span>'/,
    'falta el mensaje exacto del empty state con el término interpolado (REQ-05-05)',
  );
  assert.doesNotMatch(
    component,
    /data-search-clear/,
    'Decisión 3: sin acción de limpiar duplicada (el X de la barra y Escape la cubren)',
  );
});

test('REQ-05-05 (wiring): sin coincidencias el panel muestra el término actual', () => {
  const { calls, panel, landing } = fakePanel();
  applyLive('zzz-no-existe', NINE, panel, landing);
  assert.equal(calls.term.at(-1), 'zzz-no-existe', 'el empty state no muestra el término actual');
  assert.equal(calls.emptyHidden.at(-1), false, 'el empty state no se muestra (REQ-05-05)');
  assert.equal(calls.listHidden.at(-1), true, 'la lista no se oculta sin coincidencias');
  assert.equal(calls.allHidden.at(-1), true, 'sin coincidencias no debe haber enlace ver todos');
});

// --- REQ-05-06: primeros PAGE_SIZE + enlace a la vista dedicada -------------

test('REQ-05-06: livePage limita a PAGE_SIZE y activa el enlace solo si sobran', () => {
  const three = livePage(NINE.slice(0, 3), 'p', PAGE_SIZE);
  assert.equal(three.total, 3, 'total erróneo con 3 coincidencias');
  assert.equal(three.results.length, 3, 'con 3 coincidencias no se devuelven las 3');
  assert.equal(three.showAllLink, false, 'con 3 coincidencias no debe haber enlace');
  const six = livePage(NINE.slice(0, 6), 'p', PAGE_SIZE);
  assert.equal(six.results.length, 6);
  assert.equal(six.showAllLink, false, 'con exactamente PAGE_SIZE no debe haber enlace');
  const nine = livePage(NINE, 'p', PAGE_SIZE);
  assert.equal(nine.total, 9, 'total erróneo con 9 coincidencias');
  assert.equal(nine.results.length, PAGE_SIZE, 'el panel no limita a PAGE_SIZE (REQ-05-06)');
  assert.equal(nine.showAllLink, true, 'con más coincidencias no se activa el enlace');
  assert.equal(nine.results[0].id, 'p08', 'los primeros resultados no respetan el orden por fecha');
  assert.ok(
    !nine.results.some((r) => r.id === 'p02'),
    'el séptimo resultado no debe aparecer en el panel',
  );
});

test('REQ-05-06: seeAllUrl construye el enlace a la vista dedicada con el término', () => {
  assert.equal(seeAllUrl('agilismo'), '/search?q=agilismo');
  assert.equal(seeAllUrl('dos palabras'), '/search?q=dos+palabras');
  assert.equal(seeAllUrl('  x  '), '/search?q=x');
});

test('REQ-05-06 (wiring): con más coincidencias se muestra el enlace /search?q=', () => {
  const { calls, panel, landing } = fakePanel();
  applyLive('p', NINE, panel, landing);
  assert.equal(calls.href.at(-1), '/search?q=p', 'el enlace no apunta a la vista dedicada');
  assert.equal(calls.allHidden.at(-1), false, 'con más coincidencias el enlace no se muestra');
});

test('REQ-05-06: el panel declara el enlace ver todos y el control lo actualiza (inspección)', () => {
  const component = readComponent();
  assert.match(component, /data-search-all/, 'el panel no declara el enlace a la vista dedicada');
  const controller = readController();
  assert.match(controller, /seeAllUrl/, 'el controlador no construye el enlace con seeAllUrl');
  assert.match(controller, /\/search\?/, 'el enlace no apunta a la vista dedicada /search?q=');
});

// --- REQ-05-07: JS de runtime justificado -----------------------------------

test('REQ-05-07: el controlador es un módulo .ts de cliente con excepción documentada', () => {
  const controller = readController();
  assert.match(
    controller,
    /justificad|excepción/i,
    'la excepción a "estático por defecto" no está documentada (REQ-05-07)',
  );
  assert.match(controller, /CustomEvent/, 'no usa CustomEvent nativo (Decisión 4)');
  assert.doesNotMatch(
    controller,
    /from ['"](react|vue|svelte|preact|solid|astro:transitions)/,
    'el controlador no debe depender de frameworks ni del router (sin dependencias)',
  );
});

test('REQ-05-07: el componente arranca el controlador desde su script (inspección)', () => {
  const component = readComponent();
  assert.match(
    component,
    /import\s*\{[^}]*initSearchLive[^}]*\}\s*from\s*['"][^'"]*search-live\.ts['"]/,
    'el <script> no importa el controlador (regla 8)',
  );
  assert.match(
    component,
    /document\.addEventListener\(['"]astro:page-load['"]/,
    'el <script> no registra la init como listener de astro:page-load (feature 10)',
  );
  assert.match(
    component,
    /=>\s*initSearchLive\(\)/,
    'el listener no invoca initSearchLive (feature 10)',
  );
  assert.doesNotMatch(
    component,
    /^\s*initSearchLive\(\);?\s*$/m,
    'el <script> conserva la llamada directa (feature 10 la sustituye)',
  );
});

test('REQ-05-01: el panel empieza oculto (modo landing por defecto)', () => {
  const component = readComponent();
  assert.match(component, /data-search-live[^>]*hidden/, 'el panel no empieza oculto');
});

// --- Restricciones del arnés ------------------------------------------------

test('REQ-05-00: ≤100 líneas en portada, componente, controlador y hoja', () => {
  for (const [name, url] of [
    ['src/pages/index.astro', INDEX_URL],
    ['src/components/search-live/search-live.astro', COMPONENT_URL],
    ['src/components/search-live/search-live.ts', CONTROLLER_URL],
    ['src/styles/search-live.css', CSS_URL],
  ]) {
    const lines = countLines(readFileSync(url, 'utf8'));
    assert.ok(lines <= 100, `${name} tiene ${lines} líneas (máximo 100)`);
  }
});

test('REQ-05-00: search-live.css usa solo tokens existentes y sin colores sueltos', () => {
  const css = readCss();
  const allowed = new Set([
    '--color-background',
    '--color-surface',
    '--color-border',
    '--color-text',
    '--color-text-secondary',
    '--color-accent',
    '--radius-card',
    '--gap-card',
    '--transition-default',
    '--font-sans',
    '--container-max',
  ]);
  const vars = [...css.matchAll(/var\((--[a-z0-9-]+)\)/g)].map((m) => m[1]);
  assert.ok(vars.length > 0, 'la hoja no usa ningún token');
  for (const token of vars) {
    assert.ok(allowed.has(token), `search-live.css usa el token ${token} fuera de la lista`);
  }
  assert.doesNotMatch(
    css,
    /#[0-9a-fA-F]{3,8}\b|rgba?\(/,
    'search-live.css contiene colores sueltos (deben salir de tokens.css)',
  );
});

test('REQ-05-00: la hoja fuerza display:none con [hidden] para la transición', () => {
  const css = readCss();
  assert.match(css, /\[hidden\]/, 'la hoja no contempla el atributo hidden de la transición');
  assert.match(css, /home__landing/, 'la hoja no oculta las secciones habituales');
  assert.match(css, /search-live__all/, 'la hoja no estiliza el enlace ver todos');
});

test('REQ-05-00: el componente no lleva estilos ni lógica embebida', () => {
  const component = readComponent();
  assert.doesNotMatch(component, /<style/i, 'el componente contiene un bloque <style> embebido');
  assert.doesNotMatch(component, /\bstyle\s*=/, 'el componente conserva atributos style inline');
});

test('REQ-05-00: index.astro conserva la sección HTB con server:defer (REQ-22-01)', () => {
  const index = readIndex();
  assert.match(index, /<HtbStadistics[^>]*server:defer/, 'index.astro perdió server:defer');
  assert.match(index, /slot="fallback"/, 'index.astro perdió el slot de fallback');
  assert.match(index, /Cargando estadísticas de HTB\.\.\./, 'index.astro perdió el fallback');
});