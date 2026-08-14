// Test del dominio de artículos (REQ-07-01..05, feature 7 posts-domain;
// extendido por la feature 36 posts-navigation-fix: REQ-36-01..03).
//
// Verifica contra specs/07_posts-domain/requirements.md:
//   REQ-07-01 — la entidad Post tipa los artículos de la colección architecture
//               en src/domain/entities/post.ts.
//   REQ-07-02 — PostsRepository entrega los artículos de la colección
//               architecture como entidades Post.
//   REQ-07-03 — un artículo que no cumple el esquema hace lanzar PostsDataError.
//   REQ-07-04 — el repositorio es la única vía de acceso a los artículos para la UI
//               (se materializa en la feature 10; no aplica test aquí).
//   REQ-07-05 — entidad y repositorio respetan el límite de 100 líneas cada uno.
//   REQ-36-01 — la entidad Post expone los campos readonly id y slug (los
//               campos se añaden al bucle de REQ-07-01).
//   REQ-36-02 — el repositorio entrega id desde el id de la entrada y slug
//               desde el campo slug de sus datos (REAL_ENTRY gana slug y
//               EXPECTED_POST gana id/slug).
//   REQ-36-03 — si una entrada no declara un slug de texto, el repositorio
//               lanza PostsDataError.
//
// Nota de diseño: el default del repositorio envuelve getCollection('architecture')
// de astro:content, un módulo virtual de Astro que solo existe dentro del build;
// por eso el constructor acepta un loader inyectable (patrón de los repositorios
// previos) y el test verifica por inspección que el default envuelve la colección.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  PostsRepository,
  PostsDataError,
} from '../src/domain/repositories/posts-repository.ts';

const ENTITY_URL = new URL('../src/domain/entities/post.ts', import.meta.url);
const REPOSITORY_URL = new URL(
  '../src/domain/repositories/posts-repository.ts',
  import.meta.url,
);

// La entrada que getCollection('architecture') entrega para el artículo real
// src/content/architecture/00-agilismo.md (schema de src/content.config.ts ya
// aplicado: tags es un arreglo tras el transform).
const REAL_ENTRY = {
  id: '00-agilismo',
  data: {
    slug: '00-agilismo',
    title: 'Agilismo, diseño y fragilidad',
    author: 'Moises Baldenegro Melendez',
    img: 'arch00.jpg',
    readtime: 15,
    description:
      'En este capitulo aprenderemos los conceptos fundamentales de la arquitectura de software.',
    tags: ['arquitectura', 'agilismo', 'software-design'],
    created: '10 Agosto 2026',
    updated: '10 Agosto 2026',
  },
};

const EXPECTED_POST = {
  id: '00-agilismo',
  slug: '00-agilismo',
  title: 'Agilismo, diseño y fragilidad',
  author: 'Moises Baldenegro Melendez',
  img: 'arch00.jpg',
  readtime: 15,
  description:
    'En este capitulo aprenderemos los conceptos fundamentales de la arquitectura de software.',
  tags: ['arquitectura', 'agilismo', 'software-design'],
  created: '10 Agosto 2026',
  updated: '10 Agosto 2026',
};

// Repositorio con un loader inyectado (simula la colección architecture).
function repositoryWith(entries) {
  return new PostsRepository(async () => entries);
}

test('REQ-07-01: la entidad Post tipa los artículos con campos readonly', () => {
  assert.ok(existsSync(ENTITY_URL), 'src/domain/entities/post.ts no existe (REQ-07-01)');
  const content = readFileSync(ENTITY_URL, 'utf8');
  assert.match(content, /interface\s+Post\s*\{/, 'falta interface Post (REQ-07-01)');
  for (const field of ['id', 'slug', 'title', 'author', 'img', 'readtime', 'description', 'tags', 'created', 'updated']) {
    assert.match(
      content,
      new RegExp(`readonly\\s+${field}\\s*:`),
      `falta "readonly ${field}" en Post (REQ-07-01)`,
    );
  }
});

test('REQ-07-02: PostsRepository entrega los artículos de la colección como Post[]', async () => {
  const repository = repositoryWith([REAL_ENTRY]);
  const posts = await repository.getPosts();
  assert.ok(Array.isArray(posts), 'getPosts() no devuelve un arreglo (REQ-07-02)');
  assert.equal(posts.length, 1, `se esperaba 1 artículo, hay ${posts.length} (REQ-07-02)`);
  assert.deepEqual(posts[0], EXPECTED_POST, 'el Post entregado no coincide con el artículo real');
});

test('REQ-07-02: el default del repositorio envuelve getCollection("architecture") de astro:content', () => {
  const content = readFileSync(REPOSITORY_URL, 'utf8');
  assert.match(content, /astro:content/, 'el repositorio no usa astro:content (REQ-07-02)');
  assert.match(content, /getCollection/, 'el repositorio no usa getCollection (REQ-07-02)');
  assert.match(content, /architecture/, 'el repositorio no apunta a la colección architecture (REQ-07-02)');
});

test('REQ-36-03: una entrada sin slug de texto lanza PostsDataError', async () => {
  const { slug, ...dataWithoutSlug } = REAL_ENTRY.data;
  const broken = { id: '00-agilismo', data: dataWithoutSlug };
  const repository = repositoryWith([broken]);
  await assert.rejects(repository.getPosts(), PostsDataError);
});

test('REQ-07-03: un artículo sin un campo obligatorio lanza PostsDataError', async () => {
  const broken = { id: '00-agilismo', data: { author: 'Sin título' } };
  const repository = repositoryWith([broken]);
  await assert.rejects(repository.getPosts(), PostsDataError);
});

test('REQ-07-03: un artículo con un campo de tipo incorrecto lanza PostsDataError', async () => {
  const broken = {
    id: '00-agilismo',
    data: { ...REAL_ENTRY.data, readtime: 'quince minutos' },
  };
  const repository = repositoryWith([broken]);
  await assert.rejects(repository.getPosts(), PostsDataError);
});

test('REQ-07-03: una entrada sin data de objeto lanza PostsDataError', async () => {
  const repository = repositoryWith([{ id: '00-agilismo', data: 'no es un objeto' }]);
  await assert.rejects(repository.getPosts(), PostsDataError);
});

test('REQ-07-03: si la lectura de la colección falla, lanza PostsDataError', async () => {
  const repository = new PostsRepository(async () => {
    throw new Error('colección no disponible');
  });
  await assert.rejects(repository.getPosts(), PostsDataError);
});

test('REQ-07-05: entidad y repositorio no superan las 100 líneas', () => {
  for (const [url, label] of [
    [ENTITY_URL, 'post.ts'],
    [REPOSITORY_URL, 'posts-repository.ts'],
  ]) {
    const lineCount = readFileSync(url, 'utf8').split('\n').length;
    assert.ok(lineCount <= 100, `${label} tiene ${lineCount} líneas (máximo 100, REQ-07-05)`);
  }
});
