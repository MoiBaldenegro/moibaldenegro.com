// Tests de la feature 23 related-titles-design-align (REQ-23-01..07,
// specs/23_related-titles-design-align/requirements.md + design.md).
//
// Capa de presentación del reporte (research
// progress/research/recomendados-next-design.md, base: feature 22 con hrefs
// íntegros a entry.id reales): la lista mostraba el href crudo como texto y
// el botón/lista estaban fuera del design system.
//   REQ-23-01 — WHEN el post declara related, el detalle SHALL mostrar el
//               título de cada recomendado como texto de su enlace.
//   REQ-23-02 — La resolución del título SHALL vivir en un módulo .ts nuevo
//               que la vista importa (frontmatter solo imports y paso de
//               datos).
//   REQ-23-03 — El botón SHALL presentar superficie con borde y texto claro
//               (no fondo de acento con texto oscuro).
//   REQ-23-04 — La lista SHALL presentar filas con hairline y resaltado en
//               hover (modo lista de search-results.css).
//   REQ-23-05 — post-next.css SHALL estilar solo con tokens de tokens.css.
//   REQ-23-06 — post-next.css SHALL presentar botón y lista a ancho completo
//               en 768 píxeles o menos.
//   REQ-23-07 — Cada archivo tocado SHALL respetar 100 líneas.
//
// Ajuste REQ-24-05 (feature 24 related-card-model, precedente REQ-43-06: el
// artefacto de test sigue a la presentación real): RelatedLink se extiende
// con img/author/readtime y la aserción exacta de abajo incluye las
// propiedades nuevas con el fake enriquecido; los destinos no cambian.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolveRelatedTitles } from '../src/domain/related-titles.ts';

const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const MODULE_PATH = new URL('../src/domain/related-titles.ts', import.meta.url);
const CSS_PATH = new URL('../src/styles/post-next.css', import.meta.url);
const POST_CSS_PATH = new URL('../src/styles/post.css', import.meta.url);
const REPO_PATH = new URL('../src/domain/repositories/posts-repository.ts', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-23-01)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readModule() {
  assert.ok(existsSync(MODULE_PATH), 'src/domain/related-titles.ts no existe (REQ-23-02)');
  return readFileSync(MODULE_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post-next.css no existe (REQ-23-03)');
  return readFileSync(CSS_PATH, 'utf8');
}

// Marcado de la página (tras el segundo ---): la zona donde rige la regla 8
// (lógica separada de la UI, frontmatter solo imports y paso de datos).
function readMarkup() {
  return readPage().split('---').slice(2).join('---');
}

function declaredTokens() {
  const tokens = readFileSync(TOKENS_PATH, 'utf8');
  return new Set([...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
}

// Posts mínimos para la resolución unitaria (shape de la entidad Post;
// fake enriquecido con img/author/readtime por el ajuste REQ-24-05).
function fakePosts() {
  return [
    { id: '00-agilismo', title: 'Agilismo y fragilidad', img: 'agilismo.jpg', author: 'Moisés Baldenegro', readtime: 5 },
    { id: '01-diseño_detallado', title: 'Diseño detallado', img: 'diseno.jpg', author: 'Moisés Baldenegro', readtime: 8 },
  ];
}

test('REQ-23-01: el detalle muestra el título de cada recomendado como texto de su enlace', () => {
  const markup = readMarkup();
  assert.match(
    markup,
    /relatedLinks\.map/,
    'la página no itera sobre los recomendados resueltos (REQ-23-01)',
  );
  assert.match(
    markup,
    /href=\{item\.href\}/,
    'el enlace no apunta al href del recomendado (REQ-23-01)',
  );
  assert.match(
    markup,
    />\{item\.title\}</,
    'el texto del enlace no es el título resuelto (REQ-23-01)',
  );
  assert.doesNotMatch(
    markup,
    />\{href\}</,
    'la lista sigue mostrando el href crudo como texto (REQ-23-01)',
  );
});

test('REQ-23-01 (unidad): el módulo resuelve cada href a su título', () => {
  const links = resolveRelatedTitles(fakePosts(), ['/posts/01-diseño_detallado']);
  assert.deepEqual(
    links,
    [{ href: '/posts/01-diseño_detallado', title: 'Diseño detallado', img: 'diseno.jpg', author: 'Moisés Baldenegro', readtime: 8 }],
    'el módulo no resuelve el href a su título (REQ-23-01)',
  );
  assert.deepEqual(
    resolveRelatedTitles(fakePosts(), null),
    [],
    'related nulo no resuelve a lista vacía (REQ-23-01)',
  );
});

test('REQ-23-02: la resolución vive en un módulo .ts nuevo que la vista importa', () => {
  const module = readModule();
  assert.match(
    module,
    /export function resolveRelatedTitles/,
    'el módulo no exporta la resolución del título (REQ-23-02)',
  );
  const page = readPage();
  assert.match(
    page,
    /related-titles\.ts/,
    'la página no importa el módulo de títulos (REQ-23-02)',
  );
  const markup = readMarkup();
  assert.doesNotMatch(
    markup,
    /getCollection|entry\.data/,
    'el marcado resuelve datos directo de la colección en lugar del módulo (REQ-23-02)',
  );
  assert.ok(
    page.includes('export const prerender = true'),
    'la página perdió el prerender estático (REQ-23-02)',
  );
  assert.doesNotMatch(page, /<script/i, 'la página añade JS de runtime (estático por defecto)');
});

test('REQ-23-03: el botón presenta superficie con borde y texto claro', () => {
  const css = readCss();
  assert.match(
    css,
    /\.post__next-link\s*\{[^}]*background:\s*var\(--color-surface\)/,
    'el botón no usa superficie como fondo (REQ-23-03)',
  );
  assert.match(
    css,
    /\.post__next-link\s*\{[^}]*border:\s*1px solid var\(--color-border\)/,
    'el botón no declara el borde del sistema (REQ-23-03)',
  );
  assert.match(
    css,
    /\.post__next-link\s*\{[^}]*color:\s*var\(--color-text\)/,
    'el botón no usa texto claro del sistema (REQ-23-03)',
  );
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    stripped,
    /\.post__next-link\s*\{[^}]*background:\s*var\(--color-accent\)/,
    'el botón conserva el fondo de acento (REQ-23-03)',
  );
});

test('REQ-23-04: la lista presenta filas con hairline y resaltado en hover', () => {
  const css = readCss();
  assert.match(
    css,
    /\.post__related-item\s*\{[^}]*border-bottom:\s*1px solid var\(--color-border\)/,
    'las filas no se separan con hairline --color-border (REQ-23-04)',
  );
  assert.match(
    css,
    /\.post__related-item:last-child\s*\{[^}]*border-bottom:\s*none/,
    'la última fila conserva el hairline inferior (REQ-23-04)',
  );
  assert.match(
    css,
    /\.post__related-item:hover\s*\{[^}]*background:\s*var\(--color-surface\)/,
    'la fila no resalta con wash en hover (REQ-23-04)',
  );
  assert.match(
    css,
    /\.post__related-link:hover\s*\{[^}]*text-decoration:\s*underline/,
    'el título no se subraya en hover (REQ-23-04)',
  );
});

test('REQ-23-05: post-next.css estila solo con tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'post-next.css contiene hex hardcodeado (REQ-23-05)');
  assert.doesNotMatch(css, /rgba?\(/, 'post-next.css contiene rgb()/rgba() hardcodeado (REQ-23-05)');
  const tokens = declaredTokens();
  for (const match of css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/g)) {
    assert.ok(tokens.has(match[1]), `post-next.css usa var(${match[1]}) no declarado en tokens.css (REQ-23-05)`);
  }
  for (const prop of ['color', 'background', 'background-color', 'border-radius']) {
    for (const decl of css.matchAll(new RegExp(`${prop}\\s*:\\s*([^;]+);`, 'g'))) {
      assert.match(decl[1], /var\(--/, `"${prop}" no usa var() de los tokens (REQ-23-05): ${decl[0].trim()}`);
    }
  }
});

test('REQ-23-06: botón y lista van a ancho completo en 768 píxeles o menos', () => {
  const css = readCss();
  const media = css.match(/@media\s*\(\s*max-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}\s*$/);
  assert.ok(media, 'post-next.css no declara @media (max-width: 768px) (REQ-23-06)');
  assert.match(media[1], /\.post__next/, 'la media query no cubre el botón (REQ-23-06)');
  assert.match(media[1], /\.post__related/, 'la media query no cubre la lista (REQ-23-06)');
  assert.match(media[1], /width\s*:\s*100%/, 'la media query no presenta a ancho completo (REQ-23-06)');
});

test('REQ-23-07: cada archivo tocado respeta 100 líneas', () => {
  const pageLines = countLines(readPage());
  assert.ok(pageLines <= 100, `[id].astro tiene ${pageLines} líneas (máximo 100, REQ-23-07)`);
  const cssLines = countLines(readCss());
  assert.ok(cssLines <= 100, `post-next.css tiene ${cssLines} líneas (máximo 100, REQ-23-07)`);
  const moduleLines = countLines(readModule());
  assert.ok(moduleLines <= 100, `related-titles.ts tiene ${moduleLines} líneas (máximo 100, REQ-23-07)`);
});

test('Convención: post.css intacto, repositorio sin extender y sin <style> en la página', () => {
  // Ajuste colección unificada posts 2026-09-18 (precedente REQ-43-06): el repo
  // pasa de 98 a ≤100 líneas por post.id = slug + comentarios de decisión.
  const postCssLines = countLines(readFileSync(POST_CSS_PATH, 'utf8'));
  assert.equal(postCssLines, 100, `post.css tiene ${postCssLines} líneas y debe conservar 100 intactas (D2 del design)`);
  const repoLines = countLines(readFileSync(REPO_PATH, 'utf8'));
  assert.ok(repoLines <= 100, `posts-repository.ts tiene ${repoLines} líneas (máximo 100)`);
  assert.doesNotMatch(readPage(), /<style/i, 'la página contiene un bloque <style> embebido (convención)');
});
