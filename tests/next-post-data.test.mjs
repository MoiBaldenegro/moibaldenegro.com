// Tests de la feature 18 next-post-data (REQ-18-01..07,
// specs/18_next-post-data/requirements.md).
//
// Capa de datos de la recomendación editorial manual: el esquema architecture
// declara next opcional, los 4 artículos declaran la cadena curada en orden
// cronológico, la entidad Post expone next con texto o nulo y PostsRepository
// lo entrega validando el formato de ruta interna /posts/<id>.
// Los ids de destino son los slugs del frontmatter (entry.id real verificado
// en .astro/data-store.json): el último artículo no declara next.

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

// Cadena curada en orden cronológico (created 10 → 19 → 20 → 21 Ago 2026).
const CHAIN = [
  { file: '00-agilismo.md', next: '/posts/01-diseño-detallado' },
  { file: '01-diseño_detallado.md', next: '/posts/02-principios-del-diseno-de-software' },
  { file: '02-principios.md', next: '/posts/03-principios solid' },
  { file: '03-principios_solid.md', next: null },
];

// Datos mínimos válidos de un artículo para el repositorio con loader inyectado.
function validData(overrides = {}) {
  return {
    slug: '00-agilismo',
    title: 'Agilismo, diseño y fragilidad',
    author: 'Moises Baldenegro Melendez',
    img: 'arch00.webp',
    readtime: 4,
    description: 'Conceptos fundamentales de la arquitectura de software.',
    tags: ['arquitectura'],
    created: '10 Agosto 2026',
    updated: '10 Agosto 2026',
    ...overrides,
  };
}

function repositoryWith(entries) {
  return new PostsRepository(async () => entries);
}

function nextOf(source) {
  const frontmatter = source.split('---')[1] ?? '';
  const line = frontmatter.split('\n').find((row) => row.startsWith('next:'));
  return line === undefined ? null : line.replace(/^next:\s*/, '').trim();
}

test('REQ-18-01: el esquema architecture declara next opcional como texto', () => {
  const content = readFileSync(CONFIG_URL, 'utf8');
  assert.match(
    content,
    /next:\s*z\.string\(\)\.optional\(\)/,
    'content.config.ts no declara next como texto opcional (REQ-18-01)',
  );
});

test('REQ-18-02: la entidad Post expone readonly next con texto o nulo', () => {
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(
    content,
    /readonly\s+next\s*:\s*string\s*\|\s*null/,
    'post.ts no expone "readonly next: string | null" (REQ-18-02)',
  );
});

test('REQ-18-03: el repositorio entrega next cuando el frontmatter lo declara', async () => {
  const repository = repositoryWith([
    { id: '00-agilismo', data: validData({ next: '/posts/01-diseño-detallado' }) },
  ]);
  const posts = await repository.getPosts();
  assert.equal(posts[0].next, '/posts/01-diseño-detallado', 'el Post no entrega el next declarado (REQ-18-03)');
});

test('REQ-18-04: el repositorio entrega nulo cuando el frontmatter omite next', async () => {
  const repository = repositoryWith([{ id: '00-agilismo', data: validData() }]);
  const posts = await repository.getPosts();
  assert.equal(posts[0].next, null, 'el Post sin next declarado no entrega nulo (REQ-18-04)');
});

test('REQ-18-05: next con formato inválido lanza PostsDataError', async () => {
  for (const next of [42, '01-diseño-detallado', 'posts/01-x', 'https://example.com/x', '/posts/', '/about', 'siguiente']) {
    const repository = repositoryWith([{ id: '00-agilismo', data: validData({ next }) }]);
    await assert.rejects(repository.getPosts(), PostsDataError, `next ${JSON.stringify(next)} no lanzó PostsDataError (REQ-18-05)`);
  }
});

test('REQ-18-06: los 4 artículos declaran la cadena curada con el último sin next', () => {
  for (const { file, next } of CHAIN) {
    const url = new URL(`../src/content/architecture/${file}`, import.meta.url);
    const declared = nextOf(readFileSync(url, 'utf8'));
    assert.equal(declared, next, `${file} declara next ${JSON.stringify(declared)} en lugar de ${JSON.stringify(next)} (REQ-18-06)`);
  }
});

test('REQ-18-07: entidad y repositorio no superan las 100 líneas', () => {
  for (const [url, label] of [[ENTITY_URL, 'post.ts'], [REPOSITORY_URL, 'posts-repository.ts']]) {
    const lineCount = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-18-07)`);
  }
});
