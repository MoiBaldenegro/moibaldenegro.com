// Test del dominio de búsqueda (feature 2 search-domain, REQ-02-01..09).
//
// Verifica contra specs/02_search-domain/requirements.md:
//   REQ-02-01 — normalización a minúsculas y sin diacríticos.
//   REQ-02-02 — coincidencia del término normalizado en título, descripción,
//               tags y cuerpo del artículo.
//   REQ-02-03 — el artículo que coincide se incluye en los resultados.
//   REQ-02-04 — orden descendente por fecha de publicación.
//   REQ-02-05 — conversión de la fecha española ('10 Agosto 2026') a YYYY-MM-DD.
//   REQ-02-06 — paginación con la página solicitada y tamaño fijo (PAGE_SIZE).
//   REQ-02-07 — el índice incorpora título, descripción, tags y cuerpo.
//   REQ-02-08 — un artículo sin algún campo evaluable no rompe la búsqueda
//               (campo ausente = texto vacío).
//   REQ-02-09 — cada archivo de src/domain/search/ no supera las 100 líneas.
//
// Nota de diseño: los módulos de src/domain/search/ son TS puro importable
// con node:test (mismo patrón que tests/posts-repository.test.mjs). La
// búsqueda recibe los cuerpos markdown por parámetro (bodies), porque el
// arnés no permite node:fs en runtime: getCollection entrega el cuerpo en
// build y el llamador lo provee.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeText } from '../src/domain/search/normalize.ts';
import { parseSpanishDate } from '../src/domain/search/parse-date.ts';
import { buildSearchIndex } from '../src/domain/search/index.ts';
import {
  searchIndex,
  searchPosts,
  PAGE_SIZE,
} from '../src/domain/search/search.ts';

// Tres artículos con fechas distintas en formato español (created es texto,
// no ISO). 'arquitectura' aparece en tags de A y B y en el cuerpo de C: es el
// término común para los tests de orden y paginación.
const POST_AGILISMO = {
  id: '00-agilismo',
  slug: '00-agilismo',
  title: 'Agilismo, diseño y fragilidad',
  author: 'Moises Baldenegro Melendez',
  img: 'arch00.jpg',
  readtime: 15,
  description: 'Conceptos fundamentales de la arquitectura de software.',
  tags: ['arquitectura', 'agilismo', 'software-design'],
  created: '10 Agosto 2026',
  updated: '10 Agosto 2026',
};

const POST_DISENO = {
  id: '01-diseno-detallado',
  slug: '01-diseno-detallado',
  title: 'Diseño detallado de componentes',
  author: 'Moises Baldenegro Melendez',
  img: 'arch01.jpg',
  readtime: 12,
  description: 'Patrones y estilos para componentes mantenibles.',
  tags: ['arquitectura', 'patrones'],
  created: '15 Mayo 2025',
  updated: '15 Mayo 2025',
};

const POST_TYPESCRIPT = {
  id: '02-typescript',
  slug: '02-typescript',
  title: 'TypeScript avanzado',
  author: 'Moises Baldenegro Melendez',
  img: 'arch02.jpg',
  readtime: 20,
  description: 'Tipos avanzados y utilidades de composición.',
  tags: ['typescript', 'patrones'],
  created: '3 Enero 2024',
  updated: '3 Enero 2024',
};

const BODIES = {
  '00-agilismo':
    'El manifiesto agil valora el software funcionando sobre la documentación extensiva.',
  '01-diseno-detallado':
    'Los patrones de diseño guían la implementación de cada componente.',
  '02-typescript':
    'La composición de tipos y la arquitectura de sistemas definen el modelo de dominio.',
};

function postsFixture() {
  return [POST_AGILISMO, POST_DISENO, POST_TYPESCRIPT];
}

test('REQ-02-01: "Agilismo" y "agilismo" se normalizan al mismo valor', () => {
  assert.equal(normalizeText('Agilismo'), normalizeText('agilismo'));
  assert.equal(normalizeText('Agilismo'), 'agilismo');
});

test('REQ-02-01: "diseño" y "diseno" se normalizan al mismo valor (sin diacríticos)', () => {
  assert.equal(normalizeText('diseño'), normalizeText('diseno'));
  assert.equal(normalizeText('DISEÑO'), 'diseno');
});

test('REQ-02-02/03: coincide cuando el término aparece en el título', () => {
  const page = searchPosts(postsFixture(), BODIES, 'fragilidad', 1);
  assert.equal(page.total, 1, 'solo el artículo con "fragilidad" en el título debe coincidir');
  assert.equal(page.results[0].id, '00-agilismo');
});

test('REQ-02-02/03: coincide cuando el término aparece en la descripción', () => {
  const page = searchPosts(postsFixture(), BODIES, 'mantenibles', 1);
  assert.equal(page.total, 1);
  assert.equal(page.results[0].id, '01-diseno-detallado');
});

test('REQ-02-02/03: coincide cuando el término aparece en un tag', () => {
  const page = searchPosts(postsFixture(), BODIES, 'software-design', 1);
  assert.equal(page.total, 1);
  assert.equal(page.results[0].id, '00-agilismo');
});

test('REQ-02-02/03: coincide cuando el término aparece en el cuerpo (con diacríticos)', () => {
  const page = searchPosts(postsFixture(), BODIES, 'implementacion', 1);
  assert.equal(page.total, 1);
  assert.equal(page.results[0].id, '01-diseno-detallado');
});

test('REQ-02-02/03: la coincidencia normaliza ambos lados (diseño/diseno)', () => {
  const page = searchPosts(postsFixture(), BODIES, 'diseno', 1);
  assert.equal(page.total, 2, '"diseño" y "diseno" deben coincidir en ambos artículos');
  const ids = page.results.map((result) => result.id).sort();
  assert.deepEqual(ids, ['00-agilismo', '01-diseno-detallado']);
});

test('REQ-02-04/05: resultados ordenados descendente por fecha YYYY-MM-DD', () => {
  const page = searchPosts(postsFixture(), BODIES, 'arquitectura', 1);
  assert.equal(page.total, 3);
  assert.deepEqual(
    page.results.map((result) => result.id),
    ['00-agilismo', '01-diseno-detallado', '02-typescript'],
    '10 Agosto 2026 > 15 Mayo 2025 > 3 Enero 2024',
  );
  assert.deepEqual(
    page.results.map((result) => result.date),
    ['2026-08-10', '2025-05-15', '2024-01-03'],
  );
});

test('REQ-02-05: parseSpanishDate convierte el formato español a YYYY-MM-DD', () => {
  assert.equal(parseSpanishDate('10 Agosto 2026'), '2026-08-10');
  assert.equal(parseSpanishDate('15 Mayo 2025'), '2025-05-15');
  assert.equal(parseSpanishDate('3 Enero 2024'), '2024-01-03');
  assert.equal(parseSpanishDate('1 Diciembre 2023'), '2023-12-01');
});

test('REQ-02-05: parseSpanishDate acepta el mes en minúsculas y rechaza formatos inválidos', () => {
  assert.equal(parseSpanishDate('10 agosto 2026'), '2026-08-10');
  assert.equal(parseSpanishDate('fecha inválida'), '');
  assert.equal(parseSpanishDate('10/08/2026'), '');
});

test('REQ-02-06: la paginación devuelve la página solicitada con tamaño fijo PAGE_SIZE', () => {
  const extras = [6, 7, 8, 9].map((n) => ({
    id: `p${n}`,
    slug: `p${n}`,
    title: `Extra ${n} de arquitectura`,
    author: 'Moises Baldenegro Melendez',
    img: `arch${n}.jpg`,
    readtime: 10,
    description: 'Artículo extra para paginación.',
    tags: ['arquitectura'],
    created: ['9 Julio 2026', '8 Junio 2026', '7 Abril 2026', '6 Febrero 2026'][n - 6],
    updated: ['9 Julio 2026', '8 Junio 2026', '7 Abril 2026', '6 Febrero 2026'][n - 6],
  }));
  const all = [...extras, ...postsFixture()];
  const page1 = searchPosts(all, BODIES, 'arquitectura', 1);
  assert.equal(PAGE_SIZE, 6, 'PAGE_SIZE debe estar exportado con el tamaño fijo');
  assert.equal(page1.results.length, PAGE_SIZE, 'la página 1 tiene PAGE_SIZE resultados');
  assert.equal(page1.total, 7);
  assert.equal(page1.totalPages, 2);
  const page2 = searchPosts(all, BODIES, 'arquitectura', 2);
  assert.equal(page2.results.length, 1);
  assert.equal(page2.results[0].id, '02-typescript', 'la última página trae el más antiguo');
  const page3 = searchPosts(all, BODIES, 'arquitectura', 3);
  assert.equal(page3.results.length, 0, 'una página más allá del final no inventa resultados');
  assert.equal(page3.total, 7);
});

test('REQ-02-07: el índice incorpora título, descripción, tags y cuerpo de cada artículo', () => {
  const index = buildSearchIndex(
    [POST_AGILISMO, POST_TYPESCRIPT],
    { '00-agilismo': 'Cuerpo del artículo agilismo.' },
  );
  assert.equal(index.length, 2);
  const entryA = index.find((entry) => entry.id === '00-agilismo');
  assert.equal(entryA.title, POST_AGILISMO.title);
  assert.equal(entryA.description, POST_AGILISMO.description);
  assert.deepEqual(entryA.tags, POST_AGILISMO.tags);
  assert.equal(entryA.body, 'Cuerpo del artículo agilismo.');
  assert.equal(entryA.date, '2026-08-10');
  const entryC = index.find((entry) => entry.id === '02-typescript');
  assert.equal(entryC.body, '', 'sin cuerpo provisto el índice lo trata como vacío (REQ-02-08)');
});

test('REQ-02-07: el índice incorpora los datos de tarjeta para la UI (img, readtime, author)', () => {
  const index = buildSearchIndex([POST_AGILISMO], BODIES);
  const entry = index[0];
  assert.equal(entry.img, POST_AGILISMO.img);
  assert.equal(entry.readtime, POST_AGILISMO.readtime);
  assert.equal(entry.author, POST_AGILISMO.author);
});

test('REQ-02-08: un artículo sin algún campo evaluable no rompe la coincidencia', () => {
  const incompleto = { id: 'x-incompleto', slug: 'x-incompleto', title: 'Solo con título' };
  const page = searchPosts([incompleto], {}, 'titulo', 1);
  assert.equal(page.total, 1, 'coincide por el título presente');
  assert.equal(page.results[0].id, 'x-incompleto');
  assert.equal(page.results[0].description, '', 'descripción ausente = texto vacío');
  assert.deepEqual(page.results[0].tags, [], 'tags ausentes = arreglo vacío');
  assert.equal(page.results[0].body, '', 'cuerpo ausente = texto vacío');
  assert.equal(page.results[0].date, '', 'fecha ausente = texto vacío');
  const none = searchPosts([incompleto], {}, 'inexistente', 1);
  assert.equal(none.total, 0);
  const entries = buildSearchIndex([incompleto], {});
  assert.equal(entries.length, 1);
  assert.equal(entries[0].body, '');
});

test('REQ-02-03: consulta vacía devuelve todo el catálogo ordenado (comportamiento documentado)', () => {
  const page = searchPosts(postsFixture(), BODIES, '', 1);
  assert.equal(page.total, 3);
  assert.deepEqual(
    page.results.map((result) => result.id),
    ['00-agilismo', '01-diseno-detallado', '02-typescript'],
  );
});

test('REQ-02-02..06: searchIndex filtra y pagina sobre un índice ya construido (cliente)', () => {
  const index = buildSearchIndex(postsFixture(), BODIES);
  const page = searchIndex(index, 'composicion', 1);
  assert.equal(page.total, 1);
  assert.equal(page.results[0].id, '02-typescript');
  const all = searchIndex(index, '', 1);
  assert.equal(all.results.length, 3);
});

test('REQ-02-09: cada archivo de src/domain/search/ mantiene un máximo de 100 líneas', () => {
  for (const file of ['normalize.ts', 'parse-date.ts', 'index.ts', 'search.ts']) {
    const url = new URL(`../src/domain/search/${file}`, import.meta.url);
    const lines = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lines <= 100, `${file} tiene ${lines} líneas (máximo 100, REQ-02-09)`);
  }
});
