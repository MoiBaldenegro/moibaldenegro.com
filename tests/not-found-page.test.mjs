// Test de la página 404 y del noindex (feature 34 not-found-page,
// REQ-34-01..10). Unitarios de statusForTermPath por import directo,
// inspección de las páginas/componente/hoja y un build real a un outDir
// temporal (no pisa dist/ de los demás tests de build que corren en paralelo).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { statusForTermPath } from '../src/components/search-results/term-route.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const PAGE_404 = 'src/pages/404.astro';
const TERM = 'src/pages/[...term].astro';
const SEARCH = 'src/pages/search.astro';
const COMPONENT = 'src/components/not-found/not-found.astro';
const CSS = 'src/styles/not-found.css';
const LAYOUT = 'src/layouts/Layout.astro';
const frontmatter = (src) => src.split('---')[1] ?? '';

test('REQ-34-01: 404.astro prerenderizada con Layout y not-found; h1 y enlaces', () => {
  assert.ok(existsSync(new URL(PAGE_404, root)), 'falta src/pages/404.astro');
  const page = read(PAGE_404);
  assert.match(page, /export const prerender = true/);
  assert.match(page, /import Layout from '\.\.\/layouts\/Layout\.astro'/);
  assert.match(page, /not-found\/not-found\.astro'/);
  const component = read(COMPONENT);
  assert.match(component, /<h1[^>]*>Página no encontrada<\/h1>/);
  assert.match(component, /href="\/"/);
  assert.match(component, /href="\/search"/);
});

test('REQ-34-02: statusForTermPath devuelve 404 para archivos y /posts/*', () => {
  for (const path of ['/favicon.svg', '/robots.txt', '/wp-login.php', '/posts/no-existe', '/posts/no-existe/']) {
    assert.equal(statusForTermPath(path), 404, path);
  }
});

test('REQ-34-03: statusForTermPath devuelve 200 para términos válidos', () => {
  for (const path of ['/arquitectura', '/docker%20compose', '/search/foo']) {
    assert.equal(statusForTermPath(path), 200, path);
  }
});

test('REQ-34-04/07: [...term] fija el status con statusForTermPath, sin if, y alterna NotFound/SearchResults', () => {
  const page = read(TERM);
  assert.match(page, /Astro\.response\.status = status/);
  assert.match(page, /statusForTermPath\(/);
  assert.doesNotMatch(frontmatter(page), /\bif\s*\(/);
  assert.match(page, /status === 404 \?[\s\S]*<NotFound \/>[\s\S]*<SearchResults \/>/);
});

test('REQ-34-05: Layout emite meta robots noindex solo con la prop noindex', () => {
  assert.match(read(LAYOUT), /\{noindex && <meta name="robots" content="noindex" \/>\}/);
});

test('REQ-34-06: 404, search y [...term] pasan noindex al Layout', () => {
  for (const rel of [PAGE_404, SEARCH, TERM]) assert.match(read(rel), /<Layout[^>]*\bnoindex\b/, rel);
});

test('REQ-34-08: not-found.astro sin <style>, importa not-found.css y la hoja solo usa tokens', () => {
  const component = read(COMPONENT);
  assert.doesNotMatch(component, /<style/);
  assert.match(component, /import '\.\.\/\.\.\/styles\/not-found\.css'/);
  const css = read(CSS);
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(/i);
  for (const token of ['--color-text', '--color-text-secondary', '--color-accent', '--color-surface', '--radius-card']) {
    assert.ok(css.includes(`var(${token})`), `not-found.css no usa var(${token})`);
  }
});

test('REQ-34-05 (build): /404 y /search llevan noindex; / y los posts no', () => {
  const out = mkdtempSync(join(tmpdir(), 'nf-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const html = (rel) => readFileSync(join(out, 'client', rel), 'utf8');
    const NOINDEX = '<meta name="robots" content="noindex">';
    assert.ok(html('404.html').includes(NOINDEX), '/404 sin noindex');
    assert.ok(html('search/index.html').includes(NOINDEX), '/search sin noindex');
    assert.ok(!html('index.html').includes('name="robots"'), '/ no debe llevar noindex');
    assert.ok(!html('posts/01-procesos-memoria/index.html').includes('name="robots"'), 'un post no debe llevar noindex');
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-34-10: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of [PAGE_404, TERM, SEARCH, COMPONENT, CSS, LAYOUT, 'src/components/search-results/term-route.ts']) {
    if (existsSync(new URL(rel, root))) assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
