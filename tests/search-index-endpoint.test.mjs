// Test del índice de búsqueda como asset estático (feature 46
// search-index-endpoint, REQ-46-01..06): endpoint prerenderizado, función de
// dominio única compartida con las páginas y build real (outDir temporal).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { searchIndexJson } from '../src/domain/search/index-json.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const ENDPOINT = 'src/pages/search-index.json.ts';
const CONSUMERS = ['src/pages/index.astro', 'src/pages/search.astro', 'src/pages/[...term].astro', ENDPOINT];

test('REQ-46-01: endpoint prerenderizado con application/json', () => {
  assert.ok(existsSync(new URL(ENDPOINT, root)), `falta ${ENDPOINT}`);
  const src = read(ENDPOINT);
  assert.match(src, /export const prerender = true/);
  assert.match(src, /'Content-Type': 'application\/json/);
});

test('REQ-46-03: una sola función de dominio, sin mapeo de bodies repetido', () => {
  // Ajuste feature 47 (precedente REQ-43-06): las páginas ya no consumen el
  // índice en build; solo el endpoint usa searchIndexJson.
  assert.match(read(ENDPOINT), /searchIndexJson\(/, 'el endpoint no usa searchIndexJson');
  for (const rel of CONSUMERS) {
    const src = read(rel);
    assert.doesNotMatch(src, /entry\.data\.slug, entry\.body/, `${rel} repite el mapeo de bodies`);
    assert.doesNotMatch(src, /buildSearchIndex\(/, `${rel} construye el índice por su cuenta`);
  }
});

test('REQ-46-02/03: searchIndexJson mapea bodies por slug y escapa </script', () => {
  const post = { id: 'a', slug: 'a', title: 'T </script>', author: 'A', img: 'x', readtime: 1, description: 'd',
    tags: [], created: '1 Enero 2026', updated: '1 Enero 2026', next: null, related: null };
  const json = searchIndexJson([post], [{ data: { slug: 'a' }, body: 'cuerpo' }]);
  assert.ok(!/<\/script/i.test(json), 'no escapa </script');
  const [entry] = JSON.parse(json);
  assert.equal(entry.body, 'cuerpo');
  assert.equal(entry.title, 'T </script>');
});

test('REQ-46-02/04 (build): /search-index.json existe y cubre todos los posts', () => {
  // Ajuste feature 47 (precedente REQ-43-06): ya no hay índice embebido con el
  // que comparar; el índice publicado debe cubrir exactamente los slugs de los posts.
  const slugs = readdirSync(new URL('src/content/posts/', root), { recursive: true })
    .filter((f) => f.endsWith('.md'))
    .map((f) => read(`src/content/posts/${f.split('\u005c').join('/')}`).split(/\r?\n/).find((l) => l.startsWith('slug:')).slice(5).trim())
    .sort();
  const out = mkdtempSync(join(tmpdir(), 'index-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const file = join(out, 'client', 'search-index.json');
    assert.ok(existsSync(file), 'el build no emitió client/search-index.json');
    const published = JSON.parse(readFileSync(file, 'utf8'));
    assert.ok(Array.isArray(published), 'el índice publicado no es un array');
    assert.deepEqual(published.map((entry) => entry.id).sort(), slugs);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-46-06: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of [...CONSUMERS, 'src/domain/search/index-json.ts']) {
    assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`);
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
