// Tests de la feature 24 related-card-model (REQ-24-01..06,
// specs/24_related-card-model/requirements.md).
//
// Capa de dominio del reporte (research
// progress/research/recomendados-cards-objetos.md, base: feature 23 con
// RelatedLink {href,title}): la vista recibe strings con solo el título y no
// tiene propiedades con las que componer cards. Esta feature extiende
// RelatedLink con img/author/readtime resueltos en build desde los Posts.
//   REQ-24-01 — El tipo RelatedLink SHALL exponer las propiedades readonly
//               href, title, img, author y readtime.
//   REQ-24-02 — WHEN el post declara related, resolveRelatedTitles SHALL
//               resolver img, author y readtime de cada href desde los Posts.
//   REQ-24-03 — IF un href no corresponde a ningún Post conocido, THEN la
//               función SHALL degradar al href/título actuales sin lanzar.
//   REQ-24-04 — El frontmatter related y el esquema SHALL conservar el
//               arreglo de texto de rutas internas /posts/<id> (REQ-22-06).
//   REQ-24-05 — IF algún test REQ-23-01/02 aserciona la forma exacta, THEN la
//               feature SHALL ajustar la aserción con justificación
//               (precedente REQ-43-06).
//   REQ-24-06 — related-titles.ts SHALL respetar 100 líneas.
//
// Ajuste feature 25 related-cards-present (precedente REQ-43-06: el test
// sigue a la presentación real): la convención de abajo anticipaba que la
// vista pintaría las cards ("eso es feature 25"); con la 25 implementada la
// vista usa item.img/item.author/item.readtime y la aserción se invierte a
// assert.match. Sin JS y repositorio intacto no cambian.
//
// Ajuste feature 27 anchor-nunca-url (precedente REQ-43-06: el test sigue al
// contrato real): REQ-24-03 degradaba el href desconocido a título=ruta; la
// feature 27 cambia el degradado a filtrado (omitir el item) para que el texto
// del anchor nunca sea una URL. La aserción REQ-24-03 de abajo se invierte a
// lista vacía conservando el no-throw; los destinos conocidos no cambian.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolveRelatedTitles } from '../src/domain/related-titles.ts';

const MODULE_PATH = new URL('../src/domain/related-titles.ts', import.meta.url);
const CONFIG_PATH = new URL('../src/content.config.ts', import.meta.url);
const REPO_PATH = new URL('../src/domain/repositories/posts-repository.ts', import.meta.url);
const ENTITY_PATH = new URL('../src/domain/entities/post.ts', import.meta.url);
const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/post-next.css', import.meta.url);
const REQ23_TEST_PATH = new URL('./related-titles-design-align.test.mjs', import.meta.url);
const CONTENT_DIR = new URL('../src/content/architecture/', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readModule() {
  assert.ok(existsSync(MODULE_PATH), 'src/domain/related-titles.ts no existe (REQ-24-01)');
  return readFileSync(MODULE_PATH, 'utf8');
}

// Posts mínimos con el shape de la entidad Post relevante para cards.
function fakePosts() {
  return [
    {
      id: '00-agilismo',
      title: 'Agilismo y fragilidad',
      author: 'Moisés Baldenegro',
      img: 'agilismo.jpg',
      readtime: 5,
    },
    {
      id: '01-diseño_detallado',
      title: 'Diseño detallado',
      author: 'Moisés Baldenegro',
      img: 'diseno.jpg',
      readtime: 8,
    },
  ];
}

test('REQ-24-01: RelatedLink expone href, title, img, author y readtime readonly', () => {
  const module = readModule();
  const iface = module.match(/export interface RelatedLink\s*\{([\s\S]*?)\}/);
  assert.ok(iface, 'el módulo no declara export interface RelatedLink (REQ-24-01)');
  for (const prop of ['href', 'title', 'img', 'author', 'readtime']) {
    assert.match(
      iface[1],
      new RegExp(`readonly\\s+${prop}\\s*:`),
      `RelatedLink no expone la propiedad readonly ${prop} (REQ-24-01)`,
    );
  }
});

test('REQ-24-02: resolveRelatedTitles resuelve img, author y readtime desde los Posts', () => {
  const links = resolveRelatedTitles(fakePosts(), ['/posts/01-diseño_detallado']);
  assert.deepEqual(
    links,
    [
      {
        href: '/posts/01-diseño_detallado',
        title: 'Diseño detallado',
        img: 'diseno.jpg',
        author: 'Moisés Baldenegro',
        readtime: 8,
      },
    ],
    'el módulo no resuelve img/author/readtime del href (REQ-24-02)',
  );
  const both = resolveRelatedTitles(fakePosts(), ['/posts/00-agilismo', '/posts/01-diseño_detallado']);
  assert.equal(both.length, 2, 'no resuelve un item por cada href (REQ-24-02)');
  assert.equal(both[0].img, 'agilismo.jpg', 'el primer item no trae su img (REQ-24-02)');
  assert.equal(both[0].readtime, 5, 'el primer item no trae su readtime (REQ-24-02)');
  assert.deepEqual(
    resolveRelatedTitles(fakePosts(), null),
    [],
    'related nulo no resuelve a lista vacía (REQ-24-02)',
  );
});

test('REQ-24-03: un href sin Post conocido se omite sin lanzar (ajuste feature 27, REQ-43-06)', () => {
  let links;
  assert.doesNotThrow(
    () => {
      links = resolveRelatedTitles(fakePosts(), ['/posts/no-existe']);
    },
    'la resolución lanza con un href desconocido (REQ-24-03)',
  );
  assert.deepEqual(links, [], 'el href desconocido no se omite del resultado (REQ-24-03, filtrado feature 27)');
});

test('REQ-24-04: esquema y frontmatter related conservan el arreglo de texto', () => {
  assert.ok(existsSync(CONFIG_PATH), 'src/content.config.ts no existe (REQ-24-04)');
  const config = readFileSync(CONFIG_PATH, 'utf8');
  assert.match(
    config,
    /related:\s*z\.array\(z\.string\(\)\)\.optional\(\)/,
    'el esquema related no es arreglo de texto opcional (REQ-24-04)',
  );
  const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith('.md'));
  assert.ok(files.length > 0, 'la colección architecture no tiene artículos (REQ-24-04)');
  for (const file of files) {
    const raw = readFileSync(new URL(file, CONTENT_DIR), 'utf8');
    const frontmatter = raw.split('---')[1] ?? '';
    const relatedBlock = frontmatter.match(/related:\s*\n((?:\s*-\s*.+\n?)+)/);
    if (!relatedBlock) continue;
    for (const line of relatedBlock[1].split('\n')) {
      const item = line.match(/-\s*(.+)/);
      if (!item) continue;
      const value = item[1].trim().replace(/^["']|["']$/g, '');
      assert.match(value, /^\/posts\/[^ ]+$/, `${file}: related no es ruta interna /posts/<id> (REQ-24-04)`);
    }
  }
});

test('REQ-24-05: los tests REQ-23-01/02 ajustan la forma exacta con justificación', () => {
  assert.ok(existsSync(REQ23_TEST_PATH), 'tests/related-titles-design-align.test.mjs no existe (REQ-24-05)');
  const req23 = readFileSync(REQ23_TEST_PATH, 'utf8');
  const unit = req23.match(/resolveRelatedTitles\(fakePosts\(\), \['\/posts\/01-diseño_detallado'\]\)([\s\S]*?)\}\);/);
  assert.ok(unit, 'el test REQ-23-01 no conserva la llamada unitaria (REQ-24-05)');
  assert.match(unit[1], /img/, 'la aserción exacta no incluye las propiedades nuevas (REQ-24-05)');
  assert.match(req23, /REQ-43-06/, 'el ajuste no documenta la justificación REQ-43-06 en el encabezado (REQ-24-05)');
});

test('REQ-24-06: related-titles.ts no supera las 100 líneas', () => {
  const lines = countLines(readModule());
  assert.ok(lines <= 100, `related-titles.ts tiene ${lines} líneas (máximo 100, REQ-24-06)`);
});

test('Convención: esquema, entidad, repositorio, vista y CSS intactos de la feature 25', () => {
  const repoLines = countLines(readFileSync(REPO_PATH, 'utf8'));
  assert.equal(repoLines, 98, `posts-repository.ts tiene ${repoLines} líneas y no debe extenderse (REQ-24-04)`);
  const entity = readFileSync(ENTITY_PATH, 'utf8');
  assert.match(
    entity,
    /readonly related:\s*readonly string\[\] \| null/,
    'la entidad Post.related no conserva el arreglo de texto (REQ-24-04)',
  );
  const page = readFileSync(PAGE_PATH, 'utf8');
  assert.match(page, /item\.img/, 'la vista no pinta la miniatura de las cards (feature 25, REQ-24-04)');
  assert.match(page, /item\.author/, 'la vista no pinta el autor de las cards (feature 25, REQ-24-04)');
  assert.match(page, /item\.readtime/, 'la vista no pinta el readtime de las cards (feature 25, REQ-24-04)');
  assert.doesNotMatch(page, /<script/i, 'la página añade JS de runtime (estático por defecto)');
});
