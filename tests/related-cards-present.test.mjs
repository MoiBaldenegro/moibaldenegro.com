// Tests de la feature 25 related-cards-present (REQ-25-01..06,
// specs/25_related-cards-present/requirements.md + design.md).
//
// Capa de presentación del reporte (research
// progress/research/recomendados-cards-objetos.md, base: feature 24 con
// RelatedLink {href,title,img,author,readtime} resuelto en build): la lista
// simple de títulos se convierte en cards pequeñas en rejilla de dos
// columnas (miniatura canónica 112×63 + título enlazado + meta
// Por X • N min) con el lenguaje del modo lista de la feature 9.
//   REQ-25-01 — WHEN el post declara related, el detalle SHALL mostrar una
//               card por cada recomendado con miniatura, título enlazado y
//               meta de autor y tiempo de lectura.
//   REQ-25-02 — post-next.css SHALL presentar las cards en rejilla de dos
//               columnas con miniatura, hairline y resaltado en hover.
//   REQ-25-03 — post-next.css SHALL estilar las cards solo con tokens.
//   REQ-25-04 — post-next.css SHALL presentar una columna a ancho completo y
//               ocultar la miniatura en 768 píxeles o menos.
//   REQ-25-05 — La página SHALL resolver las cards en build sin JS runtime.
//   REQ-25-06 — La página y post-next.css SHALL respetar 100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/post-next.css', import.meta.url);
const POST_CSS_PATH = new URL('../src/styles/post.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-25-01)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post-next.css no existe (REQ-25-02)');
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

test('REQ-25-01: el detalle muestra una card por recomendado con miniatura, título enlazado y meta', () => {
  const markup = readMarkup();
  assert.match(
    markup,
    /relatedLinks\.map/,
    'la página no itera sobre los recomendados resueltos (REQ-25-01)',
  );
  assert.match(
    markup,
    /<img[^>]*class="post__related-thumb"/,
    'la card no pinta la miniatura del recomendado (REQ-25-01)',
  );
  assert.match(
    markup,
    /item\.img/,
    'la miniatura no sale del view-model (item.img) (REQ-25-01)',
  );
  assert.match(
    markup,
    /\/assets\/content\//,
    'la miniatura no usa la ruta canónica /assets/content/<img> (REQ-25-01)',
  );
  assert.match(
    markup,
    /href=\{item\.href\}/,
    'el título no enlaza al href del recomendado (REQ-25-01)',
  );
  assert.match(
    markup,
    />\{item\.title\}</,
    'el texto del enlace no es el título del recomendado (REQ-25-01)',
  );
  assert.match(
    markup,
    /Por \{item\.author\}/,
    'la card no muestra el autor del recomendado (REQ-25-01)',
  );
  assert.match(
    markup,
    /\{item\.readtime\} min/,
    'la card no muestra el tiempo de lectura del recomendado (REQ-25-01)',
  );
});

test('REQ-25-02: post-next.css presenta las cards en rejilla de dos columnas con hairline y wash', () => {
  const css = readCss();
  assert.match(
    css,
    /\.post__related-list\s*\{[^}]*display:\s*grid/,
    'la lista no usa rejilla grid (REQ-25-02)',
  );
  assert.match(
    css,
    /\.post__related-list\s*\{[^}]*grid-template-columns:\s*1fr 1fr/,
    'la rejilla no es de dos columnas (REQ-25-02)',
  );
  assert.match(
    css,
    /\.post__related-thumb\s*\{[^}]*width:\s*112px/,
    'la miniatura no usa el canónico 112×63 (REQ-25-02)',
  );
  assert.match(
    css,
    /\.post__related-item\s*\{[^}]*border-bottom:\s*1px solid var\(--color-border\)/,
    'las cards no se separan con hairline --color-border (REQ-25-02)',
  );
  assert.match(
    css,
    /\.post__related-item:hover\s*\{[^}]*background:\s*var\(--color-surface\)/,
    'la card no resalta con wash en hover (REQ-25-02)',
  );
  assert.match(
    css,
    /\.post__related-link:hover\s*\{[^}]*text-decoration:\s*underline/,
    'el título no se subraya en hover (REQ-25-02)',
  );
});

test('REQ-25-03: post-next.css estila las cards solo con tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'post-next.css contiene hex hardcodeado (REQ-25-03)');
  assert.doesNotMatch(css, /rgba?\(/, 'post-next.css contiene rgb()/rgba() hardcodeado (REQ-25-03)');
  const tokens = declaredTokens();
  for (const match of css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/g)) {
    assert.ok(tokens.has(match[1]), `post-next.css usa var(${match[1]}) no declarado en tokens.css (REQ-25-03)`);
  }
  for (const prop of ['color', 'background', 'background-color', 'border-radius']) {
    for (const decl of css.matchAll(new RegExp(`${prop}\\s*:\\s*([^;]+);`, 'g'))) {
      assert.match(decl[1], /var\(--/, `"${prop}" no usa var() de los tokens (REQ-25-03): ${decl[0].trim()}`);
    }
  }
});

test('REQ-25-04: las cards van en una columna a ancho completo con miniatura oculta en 768px o menos', () => {
  const css = readCss();
  const media = css.match(/@media\s*\(\s*max-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}\s*$/);
  assert.ok(media, 'post-next.css no declara @media (max-width: 768px) (REQ-25-04)');
  assert.match(
    media[1],
    /\.post__related-list\s*\{[^}]*grid-template-columns:\s*1fr\s*;/,
    'la media query no colapsa la rejilla a una columna (REQ-25-04)',
  );
  assert.match(media[1], /width\s*:\s*100%/, 'la media query no presenta a ancho completo (REQ-25-04)');
  assert.match(
    media[1],
    /\.post__related-thumb\s*\{[^}]*display:\s*none/,
    'la media query no oculta la miniatura (REQ-25-04, precedente REQ-09-09)',
  );
});

test('REQ-25-05: la página resuelve las cards en build sin JS de runtime', () => {
  const page = readPage();
  assert.match(
    page,
    /related-titles\.ts/,
    'la página no importa el view-model de recomendados (REQ-25-05)',
  );
  assert.match(
    page,
    /relatedLinks:\s*resolveRelatedTitles\(posts, post\.related\)/,
    'las cards no se resuelven en build desde la entidad Post (REQ-25-05)',
  );
  assert.ok(
    page.includes('export const prerender = true'),
    'la página perdió el prerender estático (REQ-25-05)',
  );
  const markup = readMarkup();
  assert.doesNotMatch(
    markup,
    /getCollection|entry\.data/,
    'el marcado resuelve datos directo de la colección (REQ-25-05, regla 8)',
  );
  assert.doesNotMatch(page, /<script/i, 'la página añade JS de runtime (REQ-25-05, estático por defecto)');
  assert.doesNotMatch(page, /client:/, 'la página usa hidratación de cliente (REQ-25-05, estático por defecto)');
});

test('REQ-25-06: la página de detalle y post-next.css no superan las 100 líneas', () => {
  const pageLines = countLines(readPage());
  assert.ok(pageLines <= 100, `[id].astro tiene ${pageLines} líneas (máximo 100, REQ-25-06)`);
  const cssLines = countLines(readCss());
  assert.ok(cssLines <= 100, `post-next.css tiene ${cssLines} líneas (máximo 100, REQ-25-06)`);
});

test('Convención: post-next.css convive con el botón, sin <style> ni JS y post.css intacto', () => {
  const page = readPage();
  assert.ok(page.includes('Siguiente artículo'), 'la página perdió el botón Siguiente artículo (convención)');
  assert.ok(page.includes('../../styles/post-next.css'), 'la página no importa post-next.css (convención)');
  assert.doesNotMatch(page, /<style/i, 'la página contiene un bloque <style> embebido (convención)');
  assert.doesNotMatch(page, /\bstyle\s*=/, 'la página usa style inline (convención)');
  const postCssLines = countLines(readFileSync(POST_CSS_PATH, 'utf8'));
  assert.equal(postCssLines, 100, `post.css tiene ${postCssLines} líneas y debe conservar 100 intactas (REQ-25-06)`);
});
