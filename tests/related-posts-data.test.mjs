// Tests de la feature 20 related-posts-data (REQ-20-01..07,
// specs/20_related-posts-data/requirements.md).
//
// Capa de datos de la lista de recomendados: el esquema architecture declara
// related opcional como arreglo de texto, el último artículo declara related
// con al menos dos rutas curadas, la entidad Post expone related con arreglo
// o nulo y PostsRepository lo entrega validando el formato de ruta interna
// /posts/<id> por item (convive con next de las features 18-19, sin UI).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  PostsRepository,
  PostsDataError,
} from '../src/domain/repositories/posts-repository.ts';

const CONFIG_URL = new URL('../src/content.config.ts', import.meta.url);
const ENTITY_URL = new URL('../src/domain/entities/post.ts', import.meta.url);
const REPOSITORY_URL = new URL(
  '../src/domain/repositories/posts-repository.ts',
  import.meta.url,
);

// Último artículo de la colección en orden cronológico (created 21 Ago 2026),
// el caso que motiva el requerimiento (sin next, con recomendados).
const LAST_FILE = '03-principios_solid.md';

// Datos mínimos válidos de un artículo para el repositorio con loader inyectado.
function validData(overrides = {}) {
  return {
    slug: '03-principios solid',
    title: 'Principios solid',
    author: 'Moises Baldenegro Melendez',
    img: 'arch03.webp',
    readtime: 4,
    description: 'Conceptos fundamentales de la arquitectura de software.',
    tags: ['arquitectura'],
    created: '21 Agosto 2026',
    updated: '21 Agosto 2026',
    ...overrides,
  };
}

function repositoryWith(entries) {
  return new PostsRepository(async () => entries);
}

// Extrae el arreglo related del frontmatter (estilo flow en una línea).
function relatedOf(source) {
  const frontmatter = source.split('---')[1] ?? '';
  const line = frontmatter.split('\n').find((row) => row.startsWith('related:'));
  if (line === undefined) return null;
  const raw = line.replace(/^related:\s*/, '').trim();
  if (!raw.startsWith('[') || !raw.endsWith(']')) return raw;
  return raw
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

test('REQ-20-01: el esquema architecture declara related opcional como arreglo de texto', () => {
  const content = readFileSync(CONFIG_URL, 'utf8');
  assert.match(
    content,
    /related:\s*z\.array\(z\.string\(\)\)\.optional\(\)/,
    'content.config.ts no declara related como arreglo de texto opcional (REQ-20-01)',
  );
});

test('REQ-20-02: la entidad Post expone readonly related con arreglo o nulo', () => {
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(
    content,
    /readonly\s+related\s*:\s*readonly\s+string\[\]\s*\|\s*null/,
    'post.ts no expone "readonly related: readonly string[] | null" (REQ-20-02)',
  );
});

test('REQ-20-03: el repositorio entrega related cuando el frontmatter lo declara', async () => {
  const related = ['/posts/00-agilismo', '/posts/01-diseño-detallado'];
  const repository = repositoryWith([
    { id: '03-principios_solid', data: validData({ related }) },
  ]);
  const posts = await repository.getPosts();
  assert.deepEqual(
    [...posts[0].related ?? []],
    related,
    'el Post no entrega el related declarado (REQ-20-03)',
  );
});

test('REQ-20-04: el repositorio entrega nulo cuando el frontmatter omite related', async () => {
  const repository = repositoryWith([
    { id: '03-principios_solid', data: validData() },
  ]);
  const posts = await repository.getPosts();
  assert.equal(posts[0].related, null, 'el Post sin related declarado no entrega nulo (REQ-20-04)');
});

test('REQ-20-05: related inválido lanza PostsDataError', async () => {
  const invalid = [
    42,
    '/posts/00-agilismo',
    'related',
    [],
    ['01-diseño-detallado'],
    ['posts/01-x'],
    ['https://example.com/x'],
    ['/posts/'],
    ['/about'],
    ['/posts/00-agilismo', 'siguiente'],
    ['/posts/00-agilismo', 42],
  ];
  for (const related of invalid) {
    const repository = repositoryWith([
      { id: '03-principios_solid', data: validData({ related }) },
    ]);
    await assert.rejects(
      repository.getPosts(),
      PostsDataError,
      `related ${JSON.stringify(related)} no lanzó PostsDataError (REQ-20-05)`,
    );
  }
});

test('REQ-20-06: el último artículo declara related con al menos dos rutas internas', () => {
  const url = new URL(`../src/content/posts/architecture/${LAST_FILE}`, import.meta.url);
  const declared = relatedOf(readFileSync(url, 'utf8'));
  assert.ok(
    Array.isArray(declared) && declared.length >= 2,
    `${LAST_FILE} no declara related con al menos dos rutas (REQ-20-06)`,
  );
  for (const route of declared) {
    assert.match(
      route,
      /^\/posts\/.+/,
      `${LAST_FILE} declara related con ruta inválida ${JSON.stringify(route)} (REQ-20-06)`,
    );
  }
});

test('REQ-20-07: entidad y repositorio no superan las 100 líneas', () => {
  for (const [url, label] of [[ENTITY_URL, 'post.ts'], [REPOSITORY_URL, 'posts-repository.ts']]) {
    const lineCount = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-20-07)`);
  }
});
