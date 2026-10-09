// Test de la feature 30 home-latest-articles-limit (REQ-30-01..16,
// specs/30_home-latest-articles-limit/requirements.md; sin design.md porque la
// feature no toca UI).
//
// Petición: «En la pagina principal queremos que se muestren solo los 3
// articulos mas recientes». Análisis en
// progress/research/home-3-articulos-recientes.md.
//
//   REQ-30-01 — con tres o más artículos, la portada pinta exactamente tres
//               cards (corte exacto del módulo de dominio).
//   REQ-30-02 — los tres pintados son los más recientes por created, en orden
//               descendente, con el orden que fija byCreatedDesc del repositorio.
//   REQ-30-03 — la función devuelve los artículos en el orden recibido, sin
//               reordenar y sin mutar el arreglo de entrada.
//   REQ-30-04 — con menos de tres artículos devuelve todas las entradas, sin
//               lanzar.
//   REQ-30-05 — con un límite que no es entero positivo devuelve [].
//   REQ-30-06 — el frontmatter de latest-articles.astro obtiene la lista con la
//               función de dominio aplicada a getPosts() y sin la lógica del
//               recorte (tampoco slice, if ( o for ().
//   REQ-30-07 — el encabezado «Últimos artículos», una card por artículo y el
//               enlace /posts/${post.id} se conservan (REQ-20-03..06, REQ-37-06).
//   REQ-30-08 — latest-articles.css 98 líneas (97 + margen del título, feature 55), rejilla
//               .latest-articles__list sin número de columnas y tokens.
//   REQ-30-09/10 — los tests de inspección existentes de latest-articles.astro
//               siguen verdes sin modificar sus aserciones; ninguno documenta un
//               ajuste por esta feature.
//   REQ-30-13 — sobre el HTML de la portada emitido por un build real hay
//               exactamente tres cards y sus enlaces son los tres artículos más
//               recientes (el build se ejecuta desde el test, precedente
//               tests/about-page.test.mjs:212-236).
//   REQ-30-14 — posts-repository.ts conserva sus 100 líneas y el recorte vive en
//               un módulo nuevo de src/domain/.
//   REQ-30-15 — la sección se resuelve en build: sin scripts de cliente ni
//               directivas de hidratación.
//   REQ-30-16 — el módulo nuevo y latest-articles.astro respetan 100 líneas.
//
// Ajuste feature 45 (precedente REQ-43-06): los slugs pasan a ASCII
// (03-principios-solid, 01-diseno-detallado, 04-ciclo-de-vida-y-arquitectura);
// las URLs antiguas redirigen con 301 desde astro.config.mjs.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { latestPosts } from '../src/domain/latest-posts.ts';
import { astroBuild } from './helpers/astro-build.mjs';
import { PostsRepository } from '../src/domain/repositories/posts-repository.ts';

const COMPONENT_PATH = new URL('../src/components/latest-articles.astro', import.meta.url);
const MODULE_PATH = new URL('../src/domain/latest-posts.ts', import.meta.url);
const CSS_PATH = new URL('../src/styles/latest-articles.css', import.meta.url);
const REPOSITORY_PATH = new URL('../src/domain/repositories/posts-repository.ts', import.meta.url);
const DIST_HOME_PATH = new URL('../dist/client/index.html', import.meta.url);
const ASTRO_BIN = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));

// Tests de inspección existentes de latest-articles.astro (REQ-30-09/10).
const EXISTING_INSPECTION_TESTS = [
  'latest-articles-restore',
  'articles-ui-refactor',
  'article-card-images',
  'view-transitions',
  'visual-polish-refactor',
];

// Los 8 artículos reales con su created real (verificados en el frontmatter de
// src/content/posts/*/*.md). Los tres más recientes van primero.
const REAL_SLUGS_BY_NEWEST = [
  '05-diseno-arquitectonico-vs-diseno-detallado',
  '04-ciclo-de-vida-y-arquitectura',
  '01-procesos-memoria',
  '00-prueba-os',
  '03-principios-solid',
  '02-principios-del-diseno-de-software',
  '01-diseno-detallado',
  '00-agilismo',
];
const REAL_CREATED = {
  '05-diseno-arquitectonico-vs-diseno-detallado': '28 Septiembre 2026',
  '04-ciclo-de-vida-y-arquitectura': '24 Septiembre 2026',
  '01-procesos-memoria': '19 Septiembre 2026',
  '00-prueba-os': '18 Septiembre 2026',
  '03-principios-solid': '21 Agosto 2026',
  '02-principios-del-diseno-de-software': '20 Agosto 2026',
  '01-diseno-detallado': '19 Agosto 2026',
  '00-agilismo': '10 Agosto 2026',
};

function fakePost(id, created = `1 Enero ${2020 + Number(id.replace(/\D/g, ''))}`) {
  return {
    id,
    slug: id,
    title: `Artículo ${id}`,
    author: 'Autor',
    img: 'entry.webp',
    readtime: 4,
    description: `Descripción de ${id}`,
    tags: ['#tag'],
    created,
    updated: created,
    next: null,
    related: null,
  };
}

function fakePosts(count) {
  return Array.from({ length: count }, (_, index) => fakePost(`p-${index}`));
}

function entryFor(slug) {
  return {
    id: slug,
    data: {
      slug,
      title: `Artículo ${slug}`,
      author: 'Autor',
      img: 'entry.webp',
      readtime: 4,
      description: `Descripción de ${slug}`,
      tags: ['#tag'],
      created: REAL_CREATED[slug],
      updated: REAL_CREATED[slug],
    },
  };
}

function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_PATH), 'src/components/latest-articles.astro no existe');
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/latest-articles.css no existe (REQ-30-08)');
  return readFileSync(CSS_PATH, 'utf8');
}

// Sección «Últimos artículos» del HTML emitido: desde <section
// class="latest-articles"> hasta su </section> (sin secciones anidadas).
function latestArticlesSection(html) {
  const start = html.indexOf('<section class="latest-articles"');
  assert.notEqual(start, -1, 'la portada no contiene la sección latest-articles (REQ-30-13)');
  const end = html.indexOf('</section>', start);
  assert.notEqual(end, -1, 'la sección latest-articles no se cierra (REQ-30-13)');
  return html.slice(start, end);
}

test('REQ-30-01: con ocho artículos la función de dominio devuelve exactamente tres', () => {
  const posts = fakePosts(8);
  const result = latestPosts(posts);
  assert.equal(result.length, 3, `latestPosts devolvió ${result.length} artículos en vez de 3 (REQ-30-01)`);
  assert.deepEqual(result.map((post) => post.id), ['p-0', 'p-1', 'p-2'], 'el corte no toma los tres primeros (REQ-30-01)');
  for (const total of [3, 4, 5, 8, 20]) {
    assert.equal(latestPosts(fakePosts(total)).length, 3, `con ${total} artículos no devuelve 3 (REQ-30-01)`);
  }
});

test('REQ-30-02: los tres son los más recientes por created, en orden descendente', async () => {
  const repository = new PostsRepository(async () => REAL_SLUGS_BY_NEWEST.map(entryFor));
  const posts = await repository.getPosts();
  const result = latestPosts(posts);
  assert.deepEqual(
    result.map((post) => post.id),
    REAL_SLUGS_BY_NEWEST.slice(0, 3),
    `la portada no muestra los tres más recientes: ${result.map((post) => post.id).join(', ')} (REQ-30-02)`
  );
  assert.deepEqual(
    result.map((post) => post.created),
    ['28 Septiembre 2026', '24 Septiembre 2026', '19 Septiembre 2026'],
    'los tres pintados no van en orden descendente de created (REQ-30-02)'
  );
});

test('REQ-30-03: devuelve el orden recibido sin reordenar ni mutar la entrada', () => {
  // Orden deliberadamente ascendente por created: la función no debe reordenar.
  const oldestFirst = [
    fakePost('a', '1 Enero 2020'),
    fakePost('b', '2 Enero 2021'),
    fakePost('c', '3 Enero 2022'),
    fakePost('d', '4 Enero 2023'),
  ];
  const snapshot = JSON.parse(JSON.stringify(oldestFirst));
  const result = latestPosts(oldestFirst);
  assert.deepEqual(
    result.map((post) => post.id),
    ['a', 'b', 'c'],
    `la función reordenó la entrada: ${result.map((post) => post.id).join(', ')} (REQ-30-03)`
  );
  assert.equal(oldestFirst.length, 4, 'la función mutó el arreglo de entrada (REQ-30-03)');
  assert.deepEqual(oldestFirst, snapshot, 'la función mutó el contenido de la entrada (REQ-30-03)');
  assert.notEqual(result, oldestFirst, 'la función devuelve la misma referencia de la entrada (REQ-30-03)');
});

test('REQ-30-04: con menos de tres artículos devuelve todas las entradas sin lanzar', () => {
  for (const total of [0, 1, 2]) {
    const posts = fakePosts(total);
    let result;
    assert.doesNotThrow(() => {
      result = latestPosts(posts);
    }, `latestPosts lanzó con ${total} artículos (REQ-30-04)`);
    assert.equal(result.length, total, `con ${total} artículos no devuelve todas las entradas (REQ-30-04)`);
  }
});

test('REQ-30-05: un límite no entero positivo devuelve un arreglo vacío sin lanzar', () => {
  for (const limit of [0, -1, -3, 2.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    let result;
    assert.doesNotThrow(() => {
      result = latestPosts(fakePosts(8), limit);
    }, `latestPosts lanzó con el límite ${limit} (REQ-30-05)`);
    assert.ok(Array.isArray(result), `el límite ${limit} no devuelve un arreglo (REQ-30-05)`);
    assert.equal(result.length, 0, `el límite ${limit} no devuelve un arreglo vacío (REQ-30-05)`);
  }
});

test('REQ-30-06: el frontmatter recorta con la función de dominio, sin lógica ni slice', () => {
  const astro = readComponent();
  assert.match(astro, /latest-posts/, 'latest-articles.astro no importa el módulo de dominio del recorte (REQ-30-06)');
  assert.match(astro, /latestPosts\(/, 'latest-articles.astro no usa latestPosts() (REQ-30-06)');
  assert.match(
    astro,
    /latestPosts\(\s*await new PostsRepository\(\)\.getPosts\(\)/,
    'latest-articles.astro no aplica latestPosts() al resultado de getPosts() (REQ-30-06)'
  );
  assert.match(astro, /getPosts\(\)/, 'latest-articles.astro deja de obtener los artículos con getPosts() (REQ-30-06)');
  assert.doesNotMatch(
    astro,
    /latest-posts\.ts[\s\S]*?const\s+posts[\s\S]*?slice/,
    'la lógica del recorte quedó en el frontmatter (REQ-30-06)'
  );
  assert.doesNotMatch(astro, /\bslice\b|\bif\s*\(|\bfor\s*\(/, 'el frontmatter contiene la lógica del recorte (REQ-30-06)');
});

test('REQ-30-07: conserva encabezado, card por artículo y enlace /posts/${post.id}', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /<h2\s+class="latest-articles__heading"\s*>\s*Últimos artículos\s*<\/h2>/,
    'se perdió el encabezado «Últimos artículos» (REQ-30-07, REQ-37-06)'
  );
  assert.ok(astro.indexOf('latest-articles__heading') < astro.indexOf('<article'), 'el encabezado ya no precede a las cards (REQ-30-07)');
  assert.match(astro, /<article class="latest-articles__card">/, 'se perdió la card por artículo (REQ-30-07, REQ-20-03)');
  assert.match(astro, /href=\{`\/posts\/\$\{post\.id\}`\}/, 'se perdió el enlace /posts/${post.id} (REQ-30-07, REQ-36-04)');
  assert.match(astro, /\{posts\.map\(/, 'el marcado ya no itera una card por artículo de la lista (REQ-30-07)');
});

test('REQ-30-08: latest-articles.css: 98 líneas (97 + el margen explícito del título de la feature 55), rejilla sin columnas y tokens', () => {
  const css = readCss();
  // Ajuste feature 55 (precedente REQ-43-06): .latest-articles__title declara su
  // margen (0.83em 0) para no depender del nivel del encabezado al pasar a h3.
  assert.equal(countLines(css), 98, `latest-articles.css tiene ${countLines(css)} líneas y debe tener 98 (REQ-30-08 + feature 55)`);
  const rule = css.match(/\.latest-articles__list\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.ok(rule.length > 0, 'latest-articles.css no declara .latest-articles__list (REQ-30-08)');
  assert.doesNotMatch(rule, /grid-template-columns/, '.latest-articles__list declara un número de columnas (REQ-30-08)');
  assert.match(rule, /display\s*:\s*grid/, '.latest-articles__list deja de ser una rejilla (REQ-30-08)');
  assert.match(rule, /gap\s*:\s*var\(--gap-card\)/, '.latest-articles__list deja de usar el token --gap-card (REQ-30-08)');
  assert.match(css, /\.latest-articles__card\s*\{[\s\S]*?background\s*:\s*var\(--color-surface\)/, 'la card deja de usar tokens (REQ-30-08)');
  assert.doesNotMatch(css.replace(/\/\*[\s\S]*?\*\//g, ''), /#[0-9a-fA-F]{3,8}\b|rgba?\(/, 'latest-articles.css tiene colores sueltos (REQ-30-08)');
});

test('REQ-30-09/10: los tests de inspección existentes no documentan ajuste por esta feature', () => {
  for (const name of EXISTING_INSPECTION_TESTS) {
    const path = new URL(`../tests/${name}.test.mjs`, import.meta.url);
    assert.ok(existsSync(path), `tests/${name}.test.mjs no existe (REQ-30-09)`);
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(
      source,
      /REQ-30-\d\d/,
      `tests/${name}.test.mjs cita REQ-30-xx: el recorte de la portada no obliga a ajustar sus aserciones (REQ-30-09/10)`
    );
  }
});

test('REQ-30-13: el build real de la portada emite exactamente tres cards con los tres más recientes', () => {
  assert.ok(existsSync(ASTRO_BIN), 'node_modules/astro/bin/astro.mjs no existe (build no ejecutable)');
  const build = astroBuild();
  assert.equal(build.status, 0, `astro build falló (REQ-30-13):\n${build.stdout}\n${build.stderr}`);
  assert.ok(existsSync(DIST_HOME_PATH), 'el build no generó dist/client/index.html (REQ-30-13)');
  const section = latestArticlesSection(readFileSync(DIST_HOME_PATH, 'utf8'));
  const cards = section.match(/class="latest-articles__card"/g) ?? [];
  assert.equal(cards.length, 3, `la portada pinta ${cards.length} cards en vez de 3 (REQ-30-13)`);
  const hrefs = [...section.matchAll(/href="(\/posts\/[^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(
    hrefs,
    REAL_SLUGS_BY_NEWEST.slice(0, 3).map((slug) => `/posts/${slug}`),
    `la portada enlaza ${hrefs.join(', ')} en vez de los tres artículos más recientes (REQ-30-13)`
  );
});

test('REQ-30-14: posts-repository.ts conserva sus 100 líneas y el recorte vive en un módulo nuevo', () => {
  const repository = readFileSync(REPOSITORY_PATH, 'utf8');
  assert.equal(countLines(repository), 100, `posts-repository.ts tiene ${countLines(repository)} líneas y debe conservar 100 (REQ-30-14)`);
  assert.doesNotMatch(repository, /latest-posts|latestPosts/, 'posts-repository.ts crece con la lógica del recorte (REQ-30-14)');
  assert.doesNotMatch(repository, /\bLatestPost/, 'posts-repository.ts declara un método de últimos artículos (REQ-30-14)');
  assert.ok(existsSync(MODULE_PATH), 'src/domain/latest-posts.ts no existe (REQ-30-14)');
  assert.match(
    readFileSync(MODULE_PATH, 'utf8'),
    /export function latestPosts\(/,
    'src/domain/latest-posts.ts no exporta latestPosts() (REQ-30-14)'
  );
});

test('REQ-30-15: la sección se resuelve en build, sin scripts de cliente ni hidratación', () => {
  const astro = readComponent();
  assert.doesNotMatch(astro, /<script/, 'latest-articles.astro introduce un script de cliente (REQ-30-15)');
  assert.doesNotMatch(astro, /\bclient:/, 'latest-articles.astro introduce una directiva de hidratación (REQ-30-15)');
  assert.doesNotMatch(astro, /set:html|is:inline/, 'latest-articles.astro introduce marcado inyectado en cliente (REQ-30-15)');
});

test('REQ-30-16: el módulo nuevo y latest-articles.astro respetan 100 líneas', () => {
  const moduleLines = countLines(readFileSync(MODULE_PATH, 'utf8'));
  const componentLines = countLines(readComponent());
  const cssLines = countLines(readCss());
  assert.ok(moduleLines <= 100, `src/domain/latest-posts.ts tiene ${moduleLines} líneas (máximo 100, REQ-30-16)`);
  assert.ok(componentLines <= 100, `latest-articles.astro tiene ${componentLines} líneas (máximo 100, REQ-30-16)`);
  assert.ok(cssLines <= 100, `latest-articles.css tiene ${cssLines} líneas (máximo 100, REQ-30-16)`);
});