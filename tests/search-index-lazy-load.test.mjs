// Test de la carga diferida del índice de búsqueda (feature 47
// search-index-lazy-load, REQ-47-01..08): loader con un único fetch por
// sesión, la portada lo pide en el primer focus, /search al inicializar, error
// explícito en el nodo de estado, páginas sin índice embebido y portada < 40 KB.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { loadSearchIndex, resetSearchIndexCache, INDEX_ERROR_MESSAGE, SearchIndexLoadError } from '../src/components/search-results/index-loader.ts';
import { initSearchResults } from '../src/components/search-results/search-results-controller.ts';
import { initSearchLive } from '../src/components/search-live/search-live.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const CATALOG = Array.from({ length: 3 }, (_, i) => ({ id: `p${i}`, title: `Post ${i}`, description: 'Arquitectura.',
  tags: ['arquitectura'], body: '', date: `${2020 + i}-01-01`, img: 'x.jpg', readtime: 1, author: 'A' }));
const flush = () => new Promise((resolve) => setImmediate(resolve));
globalThis.HTMLInputElement = class { constructor() { this.value = ''; this.listeners = {}; }
  addEventListener(type, fn) { this.listeners[type] = fn; } };

function fakeDocument() {
  const writes = { status: [], list: [] };
  const node = (sel) => ({ toggleAttribute() {}, setAttribute() {}, focus() {}, addEventListener() {},
    set textContent(v) { if (sel === '[data-search-status]') writes.status.push(v); },
    set innerHTML(v) { if (sel === '[data-search-list]') writes.list.push(v); } });
  const nodes = new Map();
  const get = (s) => { if (!nodes.has(s)) nodes.set(s, node(s)); return nodes.get(s); };
  const input = new HTMLInputElement();
  const doc = { title: '', listeners: {}, addEventListener(t, f) { this.listeners[t] = f; }, removeEventListener() {},
    getElementById: () => null,
    querySelector: (s) => (s === '[data-search-bar] input' ? input : s === '.search-results' || s === '[data-search-live]'
      ? { ...get(s), querySelector: get } : s.startsWith('[data-search-') ? get(s) : null) };
  return { doc, writes, input };
}
beforeEach(() => { resetSearchIndexCache(); delete globalThis.document; delete globalThis.window; });

test('REQ-47-02: tres llamadas al loader producen una sola petición', async () => {
  let calls = 0;
  const fetchFn = async (url) => { calls++; assert.equal(url, '/search-index.json'); return new Response(JSON.stringify(CATALOG)); };
  const results = await Promise.all([loadSearchIndex(fetchFn), loadSearchIndex(fetchFn), loadSearchIndex(fetchFn)]);
  assert.equal(calls, 1);
  assert.deepEqual(results[2], CATALOG);
});

test('REQ-47-03: la portada no pide el índice al iniciar y sí en el primer focus', async () => {
  const { doc, input } = fakeDocument();
  globalThis.document = doc;
  let loads = 0;
  const load = async () => { loads++; return CATALOG; };
  initSearchLive(doc.querySelector('[data-search-live]'), null, load);
  assert.equal(loads, 0, 'pidió el índice al inicializar');
  input.listeners.focus();
  assert.equal(loads, 1, 'no pidió el índice en el primer focus');
});

test('REQ-47-04: /search renderiza tras resolver el loader', async () => {
  const { doc, writes } = fakeDocument();
  globalThis.document = doc;
  globalThis.window = { location: { pathname: '/search', search: '?q=arquitectura', assign() {} }, history: { replaceState() {} } };
  initSearchResults(async () => CATALOG);
  await flush();
  assert.equal(writes.list.length, 1, 'no renderizó la lista');
  assert.match(writes.list[0], /\/posts\/p0/);
});

test('REQ-47-05: si el índice falla, el nodo de estado lo dice', async () => {
  const { doc, writes } = fakeDocument();
  globalThis.document = doc;
  globalThis.window = { location: { pathname: '/search', search: '?q=x', assign() {} }, history: { replaceState() {} } };
  initSearchResults(() => Promise.reject(new Error('HTTP 500')));
  await flush();
  assert.equal(INDEX_ERROR_MESSAGE, 'No se pudo cargar el índice de búsqueda');
  assert.deepEqual(writes.status, [INDEX_ERROR_MESSAGE]);
});

test('REQ-47-02 (error): un fetch fallido no queda cacheado', async () => {
  let calls = 0;
  const failing = async () => { calls++; return new Response('x', { status: 500 }); };
  await assert.rejects(loadSearchIndex(failing), SearchIndexLoadError);
  await assert.rejects(loadSearchIndex(failing), SearchIndexLoadError);
  assert.equal(calls, 2);
});

test('REQ-47-01/06 (build): sin índice embebido y portada < 40 000 bytes', () => {
  assert.doesNotMatch(read('src/pages/[...term].astro'), /id="search-index"/);
  const out = mkdtempSync(join(tmpdir(), 'lazy-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    for (const rel of ['index.html', join('search', 'index.html')]) {
      assert.doesNotMatch(readFileSync(join(out, 'client', rel), 'utf8'), /id="search-index"/, rel);
    }
    const size = statSync(join(out, 'client', 'index.html')).size;
    assert.ok(size < 40000, `index.html pesa ${size} bytes`);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

// --- Ronda 2 (review_47): carrera, error visible en la portada y error nombrado ---

function livePanel() {
  const hidden = { panel: true, landing: false };
  const status = [];
  const child = (sel) => ({ toggleAttribute() {}, setAttribute() {}, set innerHTML(_v) {},
    set textContent(v) { if (sel === '[data-search-status]') status.push(v); } });
  const kids = new Map();
  const panel = { toggleAttribute: (_n, force) => { hidden.panel = force; },
    querySelector: (s) => { if (!kids.has(s)) kids.set(s, child(s)); return kids.get(s); } };
  const landing = { toggleAttribute: (_n, force) => { hidden.landing = force; } };
  const doc = { listeners: {}, addEventListener(t, f) { this.listeners[t] = f; }, removeEventListener() {},
    querySelector: () => null, getElementById: () => null };
  return { hidden, status, panel, landing, doc, fire: (term) => doc.listeners['search:change']({ detail: { term } }) };
}

test('REQ-47-03 (carrera): borrar el término antes de que llegue el índice deja la portada visible', async () => {
  const ctx = livePanel();
  globalThis.document = ctx.doc;
  let resolve;
  const load = () => new Promise((r) => { resolve = r; });
  initSearchLive(ctx.panel, ctx.landing, load);
  ctx.fire('arquitectura');
  ctx.fire('');
  resolve(CATALOG);
  await flush();
  assert.deepEqual(ctx.hidden, { panel: true, landing: false }, 'un resultado obsoleto ocultó la portada');
});

test('REQ-47-05 (portada): si el índice falla, el panel se muestra con el error', async () => {
  const ctx = livePanel();
  globalThis.document = ctx.doc;
  initSearchLive(ctx.panel, ctx.landing, () => Promise.reject(new SearchIndexLoadError('HTTP 500')));
  ctx.fire('x');
  await flush();
  assert.equal(ctx.hidden.panel, false, 'el panel con el error sigue oculto');
  assert.equal(ctx.status.at(-1), INDEX_ERROR_MESSAGE);
});

test('REQ-47-05: el loader rechaza con SearchIndexLoadError (HTTP y cuerpo que no es array)', async () => {
  await assert.rejects(loadSearchIndex(async () => new Response('x', { status: 500 })), SearchIndexLoadError);
  resetSearchIndexCache();
  await assert.rejects(loadSearchIndex(async () => new Response('{"no":"array"}')), SearchIndexLoadError);
});

test('REQ-47-08: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of ['src/components/search-results/index-loader.ts', 'src/components/search-results/search-results-controller.ts',
    'src/components/search-live/search-live.ts', 'src/components/search-live/live-search.ts', 'src/components/search-results/search-status.ts',
    'src/pages/index.astro', 'src/pages/search.astro', 'src/pages/[...term].astro']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
