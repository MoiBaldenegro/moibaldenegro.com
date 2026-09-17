// Tests de la feature 27 anchor-nunca-url (REQ-27-01..04,
// specs/27_anchor-nunca-url/requirements.md).
//
// Endurecimiento del view-model (research progress/research/anchor-sin-url.md):
// el fallback de resolveRelatedTitles titulaba un href sin Post conocido con
// la propia ruta y la vista pintaba {item.title} como texto del anchor, de modo
// que cualquier typo futuro mostraba la URL y enlazaba a un 404. Esta feature
// filtra (omite) los hrefs sin Post en vez de titularlos: mata ambos síntomas
// y conserva el no-throw de REQ-24-03.
//   REQ-27-01 — IF un href no corresponde a ningún Post conocido, THEN
//               resolveRelatedTitles SHALL omitirlo del resultado.
//   REQ-27-02 — WHEN todos los hrefs corresponden a Posts conocidos,
//               resolveRelatedTitles SHALL devolver un item por href con el
//               título del Post destino.
//   REQ-27-03 — El texto de cada anchor de recomendados SHALL mostrar el título
//               del destino sin contener el prefijo /posts/.
//   REQ-27-04 — related-titles.ts SHALL respetar 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolveRelatedTitles } from '../src/domain/related-titles.ts';

const MODULE_PATH = new URL('../src/domain/related-titles.ts', import.meta.url);
const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readModule() {
  assert.ok(existsSync(MODULE_PATH), 'src/domain/related-titles.ts no existe (REQ-27-01)');
  return readFileSync(MODULE_PATH, 'utf8');
}

// Posts mínimos con el shape de la entidad Post relevante para el view-model.
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
      id: '01-diseño-detallado',
      title: 'Diseño detallado',
      author: 'Moisés Baldenegro',
      img: 'diseno.jpg',
      readtime: 8,
    },
  ];
}

// Marcado de la página (tras el segundo ---): la zona donde rige la regla 8.
function readMarkup() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-27-03)');
  return readFileSync(PAGE_PATH, 'utf8').split('---').slice(2).join('---');
}

test('REQ-27-01: resolveRelatedTitles omite un href sin Post conocido sin lanzar', () => {
  let links;
  assert.doesNotThrow(
    () => {
      links = resolveRelatedTitles(fakePosts(), ['/posts/00-agilismo', '/posts/no-existe']);
    },
    'la resolución lanza con un href desconocido (REQ-27-01)',
  );
  assert.equal(links.length, 1, 'el href desconocido no se omite del resultado (REQ-27-01)');
  assert.equal(links[0].href, '/posts/00-agilismo', 'el filtrado pierde el href conocido (REQ-27-01)');
  assert.equal(links[0].title, 'Agilismo y fragilidad', 'el item conocido pierde su título (REQ-27-01)');
  for (const item of links) {
    assert.ok(!item.title.includes('/posts/'), `el título filtrado contiene la ruta ${item.title} (REQ-27-01)`);
  }
  assert.doesNotThrow(
    () => {
      links = resolveRelatedTitles(fakePosts(), ['/posts/no-existe']);
    },
    'la resolución lanza con solo hrefs desconocidos (REQ-27-01)',
  );
  assert.deepEqual(links, [], 'todos los hrefs desconocidos no resuelven a lista vacía (REQ-27-01)');
});

test('REQ-27-02: con todos los hrefs conocidos devuelve un item por href con el título del Post', () => {
  const links = resolveRelatedTitles(fakePosts(), ['/posts/00-agilismo', '/posts/01-diseño-detallado']);
  assert.equal(links.length, 2, 'no devuelve un item por cada href conocido (REQ-27-02)');
  assert.equal(links[0].title, 'Agilismo y fragilidad', 'el primer item no trae el título del Post (REQ-27-02)');
  assert.equal(links[1].title, 'Diseño detallado', 'el segundo item no trae el título del Post (REQ-27-02)');
  assert.deepEqual(
    resolveRelatedTitles(fakePosts(), null),
    [],
    'related nulo no resuelve a lista vacía (REQ-27-02)',
  );
});

test('REQ-27-03: el texto de cada anchor muestra el título sin el prefijo /posts/', () => {
  const markup = readMarkup();
  assert.match(
    markup,
    /href=\{item\.href\}/,
    'el enlace no apunta al href del recomendado (REQ-27-03)',
  );
  assert.match(
    markup,
    />\{item\.title\}</,
    'el texto del enlace no es el título resuelto (REQ-27-03)',
  );
  assert.doesNotMatch(
    markup,
    />\{href\}</,
    'la lista muestra el href crudo como texto (REQ-27-03)',
  );
  assert.doesNotMatch(
    markup,
    />\{\s*item\.href\s*\}</,
    'el texto del anchor deriva del href en vez del título (REQ-27-03)',
  );
  // Barrido funcional: ningún título resuelto contiene el prefijo /posts/.
  const links = resolveRelatedTitles(fakePosts(), ['/posts/00-agilismo', '/posts/no-existe', '/posts/01-diseño-detallado']);
  for (const item of links) {
    assert.ok(!item.title.includes('/posts/'), `el texto del anchor contiene la ruta ${item.title} (REQ-27-03)`);
  }
});

test('REQ-27-04: related-titles.ts no supera las 100 líneas', () => {
  const lines = countLines(readModule());
  assert.ok(lines <= 100, `related-titles.ts tiene ${lines} líneas (máximo 100, REQ-27-04)`);
});
