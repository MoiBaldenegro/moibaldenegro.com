// Huecos de la re-inicialización con astro:page-load (feature 10
// client-init-on-navigation, REQ-10-10 y REQ-10-11). Archivo aparte porque
// tests/client-init-on-navigation.test.mjs ya pasa de 100 líneas.
//
//   REQ-10-10 — sin el contenedor .search-results (p. ej. /about tras una
//               navegación suave) initSearchResults conserva document.title y
//               no pide el índice de búsqueda.
//   REQ-10-11 — sin panel en vivo, initSearchLive retira el manejador
//               search:change registrado en la visita anterior.

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';
import { initSearchLive } from '../src/components/search-live/search-live.ts';
import { resetSearchIndexCache } from '../src/components/search-results/index-loader.ts';
import { changeEventName } from '../src/components/search-bar/search-bar.ts';

globalThis.HTMLInputElement = class {};
const flush = () => new Promise((resolve) => setImmediate(resolve));

// Document simulado con listeners reales por tipo y un DOM configurable.
function fakeDoc(nodes = {}) {
  const listeners = new Map();
  const doc = {
    title: 'Sobre mí | Moisés',
    addEventListener(type, fn) { listeners.set(type, [...(listeners.get(type) ?? []), fn]); },
    removeEventListener(type, fn) { listeners.set(type, (listeners.get(type) ?? []).filter((f) => f !== fn)); },
    dispatch(type, detail) { for (const fn of listeners.get(type) ?? []) fn({ type, detail }); },
    querySelector: (selector) => nodes[selector] ?? null,
    getElementById: () => null,
  };
  return { doc, listeners };
}

const panelNode = () => ({ toggleAttribute() {}, setAttribute() {}, querySelector: () => null });

beforeEach(() => {
  resetSearchIndexCache();
  delete globalThis.document;
  delete globalThis.window;
});

test('REQ-10-10: en /about sin .search-results no cambia document.title ni pide el índice', async () => {
  const { doc } = fakeDoc();
  globalThis.document = doc;
  globalThis.window = { location: { pathname: '/about', search: '', assign() {} }, history: { replaceState() {} } };
  let loads = 0;
  initSearchResults(async () => { loads++; return []; });
  await flush();
  assert.equal(doc.title, 'Sobre mí | Moisés', 'reescribió document.title fuera de la página de resultados');
  assert.equal(loads, 0, 'pidió el índice en una página sin .search-results');
});

test('REQ-10-10: en /posts/<slug> sin .search-results no cambia document.title ni pide el índice', async () => {
  const { doc } = fakeDoc();
  globalThis.document = doc;
  globalThis.window = { location: { pathname: '/posts/mi-post', search: '?q=x', assign() {} }, history: { replaceState() {} } };
  let loads = 0;
  initSearchResults(async () => { loads++; return []; });
  await flush();
  assert.equal(doc.title, 'Sobre mí | Moisés');
  assert.equal(loads, 0);
});

test('REQ-10-10 (control): con .search-results el título sí pasa a «Búsqueda: <término>»', async () => {
  const node = { toggleAttribute() {}, querySelector: () => null };
  const { doc } = fakeDoc({ '.search-results': node, '[data-search-guide]': node });
  globalThis.document = doc;
  globalThis.window = { location: { pathname: '/arquitectura', search: '', assign() {} }, history: { replaceState() {} } };
  let loads = 0;
  initSearchResults(async () => { loads++; return []; });
  await flush();
  assert.equal(doc.title, 'Búsqueda: arquitectura');
  assert.equal(loads, 1);
});

test('REQ-10-11: initSearchLive sin panel tras una visita con panel retira el manejador search:change', async () => {
  const { doc, listeners } = fakeDoc({ '[data-search-live]': panelNode() });
  globalThis.document = doc;
  let loads = 0;
  const load = async () => { loads++; return []; };
  initSearchLive(doc.querySelector('[data-search-live]'), null, load);
  assert.equal((listeners.get(changeEventName()) ?? []).length, 1, 'la portada no registró el manejador');
  initSearchLive(null, null, load); // navegación suave a una página sin panel
  assert.equal((listeners.get(changeEventName()) ?? []).length, 0, 'el manejador anterior sigue escuchando');
  doc.dispatch(changeEventName(), { term: 'arquitectura' });
  await flush();
  assert.equal(loads, 0, 'el evento de cambio ejecutó el manejador de la visita anterior');
});
