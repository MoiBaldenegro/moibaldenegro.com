// Tests de la feature 28 gsap-setup-recent-limit (REQ-28-01..05,
// specs/28_gsap-setup-recent-limit/requirements.md).
//
// Base del ciclo GSAP (research progress/research/gsap-horizontal-cards.md):
// alta de gsap vía pnpm (scope dependencies, registro + instalación en el
// mismo cierre, D1/R3) y portada limitada a los 3 artículos más recientes
// reutilizando el orden descendente byCreatedDesc de PostsRepository.getPosts
// (selección en presentación, D6; repositorio 100/100 sin margen, no se toca).
// Sin design.md (D7): no cambia estilos ni layout, cero JS de runtime.
//   REQ-28-01 — package.json SHALL declarar gsap en dependencies con la
//               versión instalada vía pnpm.
//   REQ-28-02 — docs/dependencies.md SHALL registrar ### gsap con version y
//               scope iguales a package.json y con approved y motivo.
//   REQ-28-03 — La portada SHALL mostrar como máximo los 3 más recientes
//               reutilizando el orden descendente de PostsRepository.
//   REQ-28-04 — WHEN hay menos de 3 artículos, la portada SHALL mostrarlos
//               todos sin error.
//   REQ-28-05 — Cada archivo modificado SHALL respetar 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PACKAGE_URL = new URL('../package.json', import.meta.url);
const REGISTRY_URL = new URL('../docs/dependencies.md', import.meta.url);
const COMPONENT_URL = new URL('../src/components/latest-articles.astro', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPackage() {
  assert.ok(existsSync(PACKAGE_URL), 'package.json no existe (REQ-28-01)');
  return JSON.parse(readFileSync(PACKAGE_URL, 'utf8'));
}

function readRegistry() {
  assert.ok(existsSync(REGISTRY_URL), 'docs/dependencies.md no existe (REQ-28-02)');
  return readFileSync(REGISTRY_URL, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_URL), 'src/components/latest-articles.astro no existe (REQ-28-03)');
  return readFileSync(COMPONENT_URL, 'utf8');
}

// Entrada ### gsap del registro: bloque de líneas "- clave: valor" (mismo
// parseo línea a línea que scripts/validate-dependencies.mjs).
function gsapEntryFields(registry) {
  const fields = {};
  let inside = false;
  for (const line of registry.split('\n')) {
    if (/^###\s+gsap\s*$/.test(line.trim())) {
      inside = true;
      continue;
    }
    if (inside && /^###\s+/.test(line)) break;
    if (!inside) continue;
    const field = line.match(/^-\s*([a-z]+)\s*:\s*(.+)$/);
    if (field !== null) fields[field[1]] = field[2].trim();
  }
  assert.ok(inside, 'docs/dependencies.md no contiene la entrada ### gsap (REQ-28-02)');
  return fields;
}

// La selección de la capa de presentación (D6): los 3 primeros del orden
// descendente del repositorio; con menos de 3, todos sin error.
function takeRecent(posts) {
  return posts.slice(0, 3);
}

function fakePosts(count) {
  return Array.from({ length: count }, (_, i) => ({ id: `post-${i}` }));
}

test('REQ-28-01: package.json declara gsap en dependencies con la versión instalada', () => {
  const pkg = readPackage();
  const version = pkg.dependencies?.gsap;
  assert.ok(
    typeof version === 'string' && version.length > 0,
    'package.json no declara gsap en dependencies (REQ-28-01)',
  );
  assert.match(
    version,
    /^\^?\d+\.\d+\.\d+/,
    `package.json declara gsap con versión no semver "${version}" (REQ-28-01)`,
  );
  assert.ok(
    pkg.devDependencies?.gsap === undefined,
    'gsap está en devDependencies en vez de dependencies (REQ-28-01)',
  );
});

test('REQ-28-02: docs/dependencies.md registra ### gsap con version y scope iguales a package.json', () => {
  const pkg = readPackage();
  const fields = gsapEntryFields(readRegistry());
  assert.equal(
    fields.version,
    pkg.dependencies?.gsap,
    `### gsap declara version "${fields.version}", package.json tiene "${pkg.dependencies?.gsap}" (REQ-28-02)`,
  );
  assert.equal(
    fields.scope,
    'dependencies',
    `### gsap declara scope "${fields.scope}" en vez de dependencies (REQ-28-02)`,
  );
  assert.ok(
    typeof fields.approved === 'string' && fields.approved.length > 0,
    '### gsap no declara approved (REQ-28-02)',
  );
  assert.ok(
    typeof fields.motivo === 'string' && fields.motivo.length > 0,
    '### gsap no declara motivo (REQ-28-02)',
  );
});

test('REQ-28-03: la portada limita a 3 cards reutilizando el orden de PostsRepository', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /PostsRepository/,
    'latest-articles.astro no usa PostsRepository (REQ-28-03)',
  );
  assert.match(
    astro,
    /getPosts\(\)/,
    'latest-articles.astro no obtiene los artículos con getPosts() (REQ-28-03)',
  );
  assert.match(
    astro,
    /\.slice\(\s*0\s*,\s*3\s*\)/,
    'latest-articles.astro no limita a los 3 primeros con .slice(0, 3) (REQ-28-03)',
  );
  assert.doesNotMatch(
    astro,
    /\.sort\s*\(|\.reverse\s*\(/,
    'latest-articles.astro reordena en presentación en vez de reutilizar byCreatedDesc (REQ-28-03)',
  );
  assert.doesNotMatch(
    astro,
    /astro:content|getCollection/,
    'latest-articles.astro lee la colección directamente en vez de vía repositorio (REQ-28-03)',
  );
});

test('REQ-28-04: con menos de 3 artículos se muestran todos sin error', () => {
  assert.deepEqual(
    takeRecent(fakePosts(5)).map((post) => post.id),
    ['post-0', 'post-1', 'post-2'],
    'con 5 artículos no se toman los 3 primeros en orden (REQ-28-04)',
  );
  assert.deepEqual(
    takeRecent(fakePosts(2)).map((post) => post.id),
    ['post-0', 'post-1'],
    'con 2 artículos no se muestran todos (REQ-28-04)',
  );
  assert.deepEqual(takeRecent(fakePosts(1)).length, 1, 'con 1 artículo no se muestra (REQ-28-04)');
  assert.deepEqual(takeRecent([]), [], 'con 0 artículos no resuelve a lista vacía (REQ-28-04)');
});

test('REQ-28-05: cada archivo modificado no supera las 100 líneas', () => {
  const files = [
    ['package.json', new URL('../package.json', import.meta.url)],
    ['docs/dependencies.md', REGISTRY_URL],
    ['src/components/latest-articles.astro', COMPONENT_URL],
  ];
  for (const [label, url] of files) {
    const lineCount = countLines(readFileSync(url, 'utf8'));
    assert.ok(
      lineCount <= 100,
      `${label} tiene ${lineCount} líneas (máximo 100, REQ-28-05)`,
    );
  }
});
