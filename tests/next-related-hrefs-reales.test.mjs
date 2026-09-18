// Tests de la feature 26 next-related-hrefs-reales (REQ-26-01..05,
// specs/26_next-related-hrefs-reales/requirements.md).
//
// La feature 22 asumió entry.id = nombre de fichero y movió los hrefs a
// valores que no resuelven (6 de 8 hrefs next/related sin post.id real: el
// anchor de recomendados degrada al href como texto visible y el botón
// Siguiente apunta a 404). Verdad de terreno
// (progress/research/anchor-sin-url.md, verificada contra el build emitido
// en dist/client/posts/): post.id = entry.id = segmento de ruta = valor del
// campo slug — 00-agilismo, 01-diseño-detallado (guion), 02-principios-
// del-diseno-de-software (largo), 03-principios solid (espacio) — NO el
// nombre de fichero (difieren en 3 de 4 artículos).
//   REQ-26-01 — El frontmatter de 00-agilismo SHALL declarar next
//               /posts/01-diseño-detallado y related
//               /posts/02-principios-del-diseno-de-software.
//   REQ-26-02 — El frontmatter de 01-diseño_detallado SHALL declarar next
//               /posts/02-principios-del-diseno-de-software y related
//               /posts/03-principios solid.
//   REQ-26-03 — El frontmatter de 02-principios SHALL declarar next
//               /posts/03-principios solid y related /posts/00-agilismo.
//   REQ-26-04 — El frontmatter de 03-principios_solid SHALL declarar related
//               /posts/00-agilismo y /posts/01-diseño-detallado.
//   REQ-26-05 — Cada ruta de next/related SHALL corresponder a un post.id
//               entregado por PostsRepository, WHERE la verificación usa el
//               repositorio y no el nombre de fichero.
// Solo frontmatter *.md: sin tocar esquema, entidad, repositorio, vista ni
// CSS (sin design.md).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PostsRepository } from '../src/domain/repositories/posts-repository.ts';

const ARCH_DIR = new URL('../src/content/posts/architecture/', import.meta.url);
const REPO_PATH = new URL('../src/domain/repositories/posts-repository.ts', import.meta.url);

// Ficheros de la colección (nombres en disco; NUNCA se usan como ids: solo
// localizan el frontmatter cuyo campo slug dicta el post.id real).
const FILES = ['00-agilismo.md', '01-diseño_detallado.md', '02-principios.md', '03-principios_solid.md'];

function readArticle(file) {
  return readFileSync(new URL(file, ARCH_DIR), 'utf8');
}

function frontmatterOf(source) {
  return source.split('---')[1] ?? '';
}

// Valor de un campo de una sola línea (slug, next).
function fieldOf(source, field) {
  const line = frontmatterOf(source)
    .split('\n')
    .find((row) => row.startsWith(`${field}:`));
  return line === undefined ? null : line.replace(new RegExp(`^${field}:\\s*`), '').trim();
}

// Arreglo related del frontmatter: forma inline `related: [a, b]` (la que
// usan los 4 artículos) o forma de bloque con items `- ` (robustez).
function relatedOf(source) {
  const rows = frontmatterOf(source).split('\n');
  const index = rows.findIndex((row) => row.startsWith('related:'));
  if (index === -1) return null;
  const raw = rows[index].replace(/^related:\s*/, '').trim();
  if (raw.startsWith('[') && raw.endsWith(']')) {
    return raw
      .slice(1, -1)
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (raw !== '') return raw;
  const items = [];
  for (const row of rows.slice(index + 1)) {
    const item = row.match(/^\s*-\s*(.+)\s*$/);
    if (!item) break;
    items.push(item[1].trim().replace(/^["']|["']$/g, ''));
  }
  return items;
}

// post.id reales = valores del campo slug (verdad de terreno del research:
// entry.id = slug = segmento de ruta; el nombre de fichero NO interviene).
function postIds() {
  return new Set(FILES.map((file) => fieldOf(readArticle(file), 'slug')));
}

// Datos mínimos válidos para el repositorio con loader inyectado (el schema
// ya aplicado entrega tags como arreglo): el id es el slug real.
function entryFor(slug, next, related) {
  return {
    id: slug,
    data: {
      slug,
      title: `Título de ${slug}`,
      author: 'Moises Baldenegro Melendez',
      img: 'arch00.webp',
      readtime: 4,
      description: 'Descripción del artículo.',
      tags: ['arquitectura'],
      created: '10 Agosto 2026',
      updated: '10 Agosto 2026',
      ...(next === null ? {} : { next }),
      ...(related === null ? {} : { related }),
    },
  };
}

function declaredRoutes() {
  const routes = [];
  for (const file of FILES) {
    const source = readArticle(file);
    const next = fieldOf(source, 'next');
    if (next !== null) routes.push({ file, kind: 'next', route: next });
    const related = relatedOf(source);
    if (Array.isArray(related)) {
      for (const route of related) routes.push({ file, kind: 'related', route });
    }
  }
  return routes;
}

test('REQ-26-01: 00-agilismo declara next y related reales', () => {
  const source = readArticle('00-agilismo.md');
  assert.equal(
    fieldOf(source, 'next'),
    '/posts/01-diseño-detallado',
    `00-agilismo declara next ${JSON.stringify(fieldOf(source, 'next'))} en lugar de "/posts/01-diseño-detallado" (REQ-26-01)`,
  );
  assert.deepEqual(
    relatedOf(source),
    ['/posts/02-principios-del-diseno-de-software'],
    `00-agilismo declara related ${JSON.stringify(relatedOf(source))} (REQ-26-01)`,
  );
});

test('REQ-26-02: 01-diseño_detallado declara next y related reales', () => {
  const source = readArticle('01-diseño_detallado.md');
  assert.equal(
    fieldOf(source, 'next'),
    '/posts/02-principios-del-diseno-de-software',
    `01-diseño_detallado declara next ${JSON.stringify(fieldOf(source, 'next'))} en lugar de "/posts/02-principios-del-diseno-de-software" (REQ-26-02)`,
  );
  assert.deepEqual(
    relatedOf(source),
    ['/posts/03-principios solid'],
    `01-diseño_detallado declara related ${JSON.stringify(relatedOf(source))} (REQ-26-02)`,
  );
});

test('REQ-26-03: 02-principios declara next real y conserva related 00-agilismo', () => {
  const source = readArticle('02-principios.md');
  assert.equal(
    fieldOf(source, 'next'),
    '/posts/03-principios solid',
    `02-principios declara next ${JSON.stringify(fieldOf(source, 'next'))} en lugar de "/posts/03-principios solid" (REQ-26-03)`,
  );
  assert.deepEqual(
    relatedOf(source),
    ['/posts/00-agilismo'],
    `02-principios declara related ${JSON.stringify(relatedOf(source))} (REQ-26-03)`,
  );
});

test('REQ-26-04: 03-principios_solid declara related con los dos slugs reales', () => {
  const declared = relatedOf(readArticle('03-principios_solid.md'));
  assert.deepEqual(
    declared,
    ['/posts/00-agilismo', '/posts/01-diseño-detallado'],
    `03-principios_solid declara related ${JSON.stringify(declared)} (REQ-26-04)`,
  );
});

test('REQ-26-05: cada ruta de next/related corresponde a un post.id de PostsRepository', async () => {
  const ids = postIds();
  assert.equal(ids.size, 4, `se esperaban 4 post.id (slugs), hay ${ids.size} (REQ-26-05)`);
  // Ajuste colección unificada posts 2026-09-18 (precedente REQ-43-06: el test
  // sigue al contrato real): post.id = data.slug (no entry.id, que incluye la
  // subcarpeta architecture/ u os/). El repositorio valida next/related igual.
  const repo = readFileSync(REPO_PATH, 'utf8');
  assert.match(
    repo,
    /const slug = expectString\(data, 'slug'/,
    'PostsRepository no entrega post.id desde data.slug (REQ-26-05)',
  );
  const repository = new PostsRepository(async () =>
    [...ids].map((slug) => entryFor(slug, '/posts/00-agilismo', ['/posts/00-agilismo'])),
  );
  const posts = await repository.getPosts();
  const known = new Set(posts.map((post) => `/posts/${post.id}`));
  assert.equal(known.size, 4, `el repositorio no entrega 4 post.id (REQ-26-05)`);
  for (const { file, kind, route } of declaredRoutes()) {
    assert.ok(
      known.has(route),
      `${file} declara ${kind} ${JSON.stringify(route)} sin post.id entregado por PostsRepository (REQ-26-05)`,
    );
  }
});
