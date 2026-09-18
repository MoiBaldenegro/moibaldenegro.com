// Tests de la feature 22 next-related-hrefs-fix (REQ-22-01..07,
// specs/22_next-related-hrefs-fix/requirements.md).
//
// Curaduría de hrefs next/related a los entry.id reales (nombre de fichero
// sin extensión, la ruta es /posts/[id] con params id = entry.id): 4 de 5
// hrefs apuntaban a 404 (guion vs guion-bajo, slug vs id, espacio literal) y
// solo 03 declaraba related. Solo frontmatter *.md: sin tocar src/domain,
// src/pages, src/styles ni repositorio.
//
// Ajuste feature 26 next-related-hrefs-reales (precedente REQ-43-06: el test
// sigue al dato real): la 22 asumió entry.id = nombre de fichero y la verdad
// de terreno (progress/research/anchor-sin-url.md, build emitido en
// dist/client/posts/) es entry.id = post.id = slug = segmento de ruta —
// 00-agilismo, 01-diseño-detallado (guion), 02-principios-del-diseno-de-
// software (largo), 03-principios solid (espacio) — NO el nombre de fichero.
// Se actualizan REQ-22-01..04 a los slugs reales, REQ-22-06 deriva los ids
// del campo slug (no de readdir) y REQ-22-07 deja de prohibir el espacio
// interior (el slug canónico lo contiene) y pasa a prohibir espacios
// perimetrales.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const ARCH_DIR = new URL('../src/content/posts/architecture/', import.meta.url);

// post.id reales: valores del campo slug del frontmatter (verdad de terreno
// de la feature 26: entry.id = slug = segmento de ruta, no el fichero).
function entryIds() {
  const ids = new Set();
  for (const file of ['00-agilismo.md', '01-diseño_detallado.md', '02-principios.md', '03-principios_solid.md']) {
    const frontmatter = readArticle(file).split('---')[1] ?? '';
    const line = frontmatter.split('\n').find((row) => row.startsWith('slug:'));
    ids.add((line ?? '').replace(/^slug:\s*/, '').trim());
  }
  return ids;
}

function readArticle(file) {
  return readFileSync(new URL(file, ARCH_DIR), 'utf8');
}

function frontmatterOf(source) {
  return source.split('---')[1] ?? '';
}

// Extrae el valor de next del frontmatter (nulo si la línea no existe).
function nextOf(source) {
  const line = frontmatterOf(source)
    .split('\n')
    .find((row) => row.startsWith('next:'));
  return line === undefined ? null : line.replace(/^next:\s*/, '').trim();
}

// Extrae el arreglo related del frontmatter (nulo si la línea no existe).
function relatedOf(source) {
  const line = frontmatterOf(source)
    .split('\n')
    .find((row) => row.startsWith('related:'));
  if (line === undefined) return null;
  const raw = line.replace(/^related:\s*/, '').trim();
  if (!raw.startsWith('[') || !raw.endsWith(']')) return raw;
  return raw
    .slice(1, -1)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

test('REQ-22-01: 00-agilismo declara next /posts/01-diseño-detallado', () => {
  const declared = nextOf(readArticle('00-agilismo.md'));
  assert.equal(
    declared,
    '/posts/01-diseño-detallado',
    `00-agilismo declara next ${JSON.stringify(declared)} en lugar de "/posts/01-diseño-detallado" (REQ-22-01)`,
  );
});

test('REQ-22-02: 01-diseño_detallado declara next /posts/02-principios-del-diseno-de-software', () => {
  const declared = nextOf(readArticle('01-diseño_detallado.md'));
  assert.equal(
    declared,
    '/posts/02-principios-del-diseno-de-software',
    `01-diseño_detallado declara next ${JSON.stringify(declared)} en lugar de "/posts/02-principios-del-diseno-de-software" (REQ-22-02)`,
  );
});

test('REQ-22-03: 02-principios declara next /posts/03-principios solid', () => {
  const declared = nextOf(readArticle('02-principios.md'));
  assert.equal(
    declared,
    '/posts/03-principios solid',
    `02-principios declara next ${JSON.stringify(declared)} en lugar de "/posts/03-principios solid" (REQ-22-03)`,
  );
});

test('REQ-22-04: 03-principios_solid declara related con 00-agilismo y 01-diseño-detallado', () => {
  const declared = relatedOf(readArticle('03-principios_solid.md'));
  assert.deepEqual(
    declared,
    ['/posts/00-agilismo', '/posts/01-diseño-detallado'],
    `03-principios_solid declara related ${JSON.stringify(declared)} (REQ-22-04)`,
  );
});

test('REQ-22-05: cada artículo 00/01/02 declara related con al menos una ruta interna', () => {
  for (const file of ['00-agilismo.md', '01-diseño_detallado.md', '02-principios.md']) {
    const declared = relatedOf(readArticle(file));
    assert.ok(
      Array.isArray(declared) && declared.length >= 1,
      `${file} no declara related con al menos una ruta (REQ-22-05)`,
    );
    for (const route of declared) {
      assert.match(
        route,
        /^\/posts\/.+/,
        `${file} declara related con ruta inválida ${JSON.stringify(route)} (REQ-22-05)`,
      );
    }
  }
});

test('REQ-22-06: toda ruta de next/related corresponde a un entry.id existente', () => {
  const ids = entryIds();
  const files = ['00-agilismo.md', '01-diseño_detallado.md', '02-principios.md', '03-principios_solid.md'];
  for (const file of files) {
    const source = readArticle(file);
    const routes = [
      ...(nextOf(source) === null ? [] : [nextOf(source)]),
      ...((() => {
        const related = relatedOf(source);
        return Array.isArray(related) ? related : [];
      })()),
    ];
    for (const route of routes) {
      const id = route.replace(/^\/posts\//, '');
      assert.ok(
        ids.has(id),
        `${file} declara la ruta ${JSON.stringify(route)} sin entry.id existente (REQ-22-06)`,
      );
    }
  }
});

test('REQ-22-07: ningún valor de next o related tiene espacios perimetrales', () => {
  const files = ['00-agilismo.md', '01-diseño_detallado.md', '02-principios.md', '03-principios_solid.md'];
  for (const file of files) {
    const source = readArticle(file);
    const values = [
      ...(nextOf(source) === null ? [] : [nextOf(source)]),
      ...((() => {
        const related = relatedOf(source);
        return Array.isArray(related) ? related : [];
      })()),
    ];
    for (const value of values) {
      assert.ok(
        value === value.trim() && value.length > '/posts/'.length,
        `${file} declara el valor ${JSON.stringify(value)} con espacios perimetrales o vacío (REQ-22-07)`,
      );
    }
  }
});
