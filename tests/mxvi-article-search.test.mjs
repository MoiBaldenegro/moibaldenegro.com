// Test de la feature 15 mxvi-article-search (REQ-15-01..12). Spec: specs/15_mxvi-article-search/.
// node:test, sin dependencias. Artículo, búsqueda y 404 usan los componentes .mx-* del design system.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { itemHtml } from '../src/components/search-results/item-html.ts';

const read = (path) => readFileSync(path, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const classesOf = (src) => new Set([...src.matchAll(/class(?:Name)?\s*=\s*["']([^"']+)["']/g)].flatMap((m) => m[1].split(/\s+/)));
const hasAll = (src, names, where) => {
  const classes = classesOf(src);
  for (const name of names) assert.ok(classes.has(name), `${where}: falta la clase ${name}`);
};
const POST = 'src/pages/posts/[id].astro';
const SR = 'src/components/search-results';

test('REQ-15-01/02/03: artículo con cabecera, prosa, siguiente y recomendados', () => {
  hasAll(read(POST), ['mx-page', 'mx-post-hero', 'mx-media', 'mx-post-hero__copy', 'mx-kicker', 'mx-post-hero__title', 'mx-meta',
    'mx-meta--pill', 'mx-prose', 'mx-post-next', 'mx-button', 'mx-button--surface', 'mx-post-related', 'mx-post-related__title',
    'mx-result-list', 'mx-result-row', 'mx-thumb', 'mx-result-row__body', 'mx-result-row__link', 'mx-result-row__meta'], POST);
});

test('REQ-15-04: copiar código envuelve en mx-code y crea mx-code__copy', () => {
  const ts = read('src/components/code-copy/code-copy.ts');
  assert.match(ts, /wrap\.className = 'mx-code'/);
  assert.match(ts, /button\.className = 'mx-code__copy'/);
});

test('REQ-15-05/06/08/09: páginas de búsqueda, avisos, lista y paginación', () => {
  for (const page of ['src/pages/search.astro', 'src/pages/[...term].astro']) hasAll(read(page), ['mx-page', 'mx-heading'], page);
  hasAll(read(`${SR}/search-results.astro`), ['mx-notice', 'mx-notice__title', 'mx-notice__text', 'mx-notice__text--lg', 'mx-notice__actions',
    'mx-button', 'mx-button--quiet', 'mx-result-list', 'mx-pagination', 'mx-button--surface', 'mx-pagination__label'], 'search-results');
  hasAll(read('src/components/search-live/search-live.astro'), ['mx-notice', 'mx-notice__text', 'mx-notice__text--lg', 'mx-result-list'], 'search-live');
});

test('REQ-15-07: cada resultado de búsqueda es una fila de resultado', () => {
  const html = itemHtml({ id: 'a', title: 'T', description: 'D', author: 'M', readtime: 3, img: 'a.webp', tags: ['x'] });
  hasAll(html, ['mx-result-row', 'mx-thumb', 'mx-result-row__body', 'mx-result-row__link', 'mx-result-row__title', 'mx-result-row__meta',
    'mx-result-row__description', 'mx-tag-list', 'mx-tag', 'mx-tag--sm'], 'itemHtml');
});

test('REQ-15-10: página no encontrada con aviso de página', () => {
  hasAll(read('src/components/not-found/not-found.astro'), ['mx-container', 'mx-notice', 'mx-notice--page', 'mx-notice__title',
    'mx-notice__title--lg', 'mx-notice__text', 'mx-notice__actions', 'mx-link'], 'not-found');
});

test('REQ-15-11: las siete hojas antiguas ya no existen', () => {
  for (const sheet of ['post', 'post-header', 'post-readability', 'post-next', 'code-copy', 'search-results', 'typography']) {
    assert.ok(!existsSync(`src/styles/${sheet}.css`), sheet);
  }
});

test('REQ-15-12: src no usa las clases antiguas de artículo, búsqueda y 404', () => {
  const old = /(?<![\w-])(post__[\w-]+|search-results__[\w-]+|search-page[\w-]*|not-found__[\w-]+|code-copy[\w-]*|code-block)(?![\w-])/;
  for (const file of walk('src').filter((p) => /\.(astro|ts|css)$/.test(p) && !p.includes('styles/mxvi'))) {
    const classes = [...classesOf(read(file))].join(' ');
    assert.doesNotMatch(classes, old, file);
    if (file.endsWith('.css')) assert.doesNotMatch(read(file), /\.(post__|search-results__|search-page|not-found__|code-copy|code-block)/, file);
  }
});
