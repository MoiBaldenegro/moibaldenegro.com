// Test de los estilos del iframe de video en la página de detalle de artículo
// (REQ-11-01..09, feature 11 article-iframe-styles).
//
// Verifica contra specs/11_article-iframe-styles/requirements.md y design.md:
//   REQ-11-01 — src/pages/posts/[id].astro importa la hoja article.css del
//               contenido embebido (el cuerpo markdown puede contener
//               iframes de video, p. ej. 02-principios.md).
//   REQ-11-02 — el contenedor declara width 100%, aspect-ratio 16/9,
//               overflow hidden y border-radius con var(--radius-card).
//   REQ-11-03 — el iframe declara display block, width 100% y height 100%.
//   REQ-11-04 — los estilos del video quedan scoping bajo .post__content.
//   REQ-11-05 — radio y espaciado solo desde tokens; margen con
//               var(--gap-card) (precedente REQ-17-05).
//   REQ-11-06 — el iframe omite min-height (la proporción del contenedor
//               gobierna la altura; design.md Decisión 3).
//   REQ-11-07 — article.css elimina las clases muertas .article y .prose
//               (la página usa BEM .post).
//   REQ-11-08 — src/pages/index.astro deja de importar article.css (la
//               portada no renderiza cuerpos de artículo; import muerto).
//   REQ-11-09 — article.css respeta el máximo de 100 líneas del arnés.
//   Convención — sin hex ni rgb()/rgba() sueltos, sin border-radius numérico
//               en el iframe (el contenedor con overflow hidden recorta).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const POST_PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const INDEX_PATH = new URL('../src/pages/index.astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/article.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPostPage() {
  assert.ok(existsSync(POST_PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-11-01)');
  return readFileSync(POST_PAGE_PATH, 'utf8');
}

function readIndex() {
  assert.ok(existsSync(INDEX_PATH), 'src/pages/index.astro no existe (REQ-11-08)');
  return readFileSync(INDEX_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/article.css no existe (REQ-11-01)');
  return readFileSync(CSS_PATH, 'utf8');
}

// Extrae el bloque de declaraciones de la regla .post__content .video-container.
function containerRule(css) {
  const match = css.match(/\.post__content\s+\.video-container\s*\{([\s\S]*?)\}/);
  assert.ok(match, 'article.css no declara la regla .post__content .video-container (REQ-11-02/04)');
  return match[1];
}

// Extrae el bloque de declaraciones de la regla .post__content .video-container iframe.
function iframeRule(css) {
  const match = css.match(/\.post__content\s+\.video-container\s+iframe\s*\{([\s\S]*?)\}/);
  assert.ok(match, 'article.css no declara la regla .post__content .video-container iframe (REQ-11-03)');
  return match[1];
}

test('REQ-11-01: la página de detalle de artículo importa la hoja article.css', () => {
  const page = readPostPage();
  assert.ok(
    page.includes('../../styles/article.css'),
    'src/pages/posts/[id].astro no importa ../../styles/article.css (REQ-11-01)'
  );
  assert.ok(
    existsSync(CSS_PATH),
    'src/styles/article.css no existe (REQ-11-01)'
  );
});

test('REQ-11-08: la portada deja de importar la hoja article.css', () => {
  const index = readIndex();
  assert.doesNotMatch(
    index,
    /import\s+["'][^"']*article\.css["']/,
    'src/pages/index.astro todavía importa article.css (REQ-11-08)'
  );
});

test('REQ-11-02/04: el contenedor del video va scoping bajo .post__content con ratio 16/9 y radio token', () => {
  const rule = containerRule(readCss());
  assert.match(rule, /width\s*:\s*100%/, 'el contenedor no declara width 100% (REQ-11-02)');
  assert.match(rule, /aspect-ratio\s*:\s*16\s*\/\s*9/, 'el contenedor no fija aspect-ratio 16/9 (REQ-11-02)');
  assert.match(rule, /overflow\s*:\s*hidden/, 'el contenedor no usa overflow hidden (REQ-11-02)');
  assert.match(rule, /border-radius\s*:\s*var\(--radius-card\)/, 'el contenedor no usa var(--radius-card) (REQ-11-02)');
  assert.match(rule, /margin\s*:\s*var\(--gap-card\)/, 'el margen del contenedor no usa var(--gap-card) (REQ-11-05, precedente REQ-17-05)');
});

test('REQ-11-03: el iframe declara display block, width 100% y height 100%', () => {
  const rule = iframeRule(readCss());
  assert.match(rule, /display\s*:\s*block/, 'el iframe no usa display block (REQ-11-03)');
  assert.match(rule, /width\s*:\s*100%/, 'el iframe no declara width 100% (REQ-11-03)');
  assert.match(rule, /height\s*:\s*100%/, 'el iframe no declara height 100% (REQ-11-03)');
});

test('REQ-11-06: el iframe omite min-height y border-radius numérico', () => {
  const rule = iframeRule(readCss());
  assert.doesNotMatch(rule, /min-height/, 'el iframe conserva min-height forzado (REQ-11-06)');
  assert.doesNotMatch(
    rule,
    /border-radius\s*:\s*\d/,
    'el iframe conserva border-radius numérico (REQ-11-06, design.md Decisión 3: el contenedor con overflow hidden recorta las esquinas)'
  );
});

test('REQ-11-05/convención: article.css no contiene hex, rgb()/rgba() ni radios sueltos', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    content,
    /#[0-9a-fA-F]{3,8}\b/,
    'article.css contiene un color hex hardcodeado (REQ-11-05, convención)'
  );
  assert.doesNotMatch(
    content,
    /rgba?\(/,
    'article.css contiene rgb()/rgba() hardcodeado (REQ-11-05, convención)'
  );
  const radiusDecls = content.match(/border-radius\s*:\s*([^;]+);/g) ?? [];
  assert.ok(radiusDecls.length > 0, 'article.css no declara border-radius');
  for (const decl of radiusDecls) {
    assert.match(
      decl,
      /var\(--/,
      `article.css declara un radio sin var() de los tokens (REQ-11-05, convención): ${decl}`
    );
  }
});

test('REQ-11-07: article.css elimina las clases muertas .article y .prose', () => {
  const css = readCss();
  assert.doesNotMatch(css, /\.article\b/, 'article.css conserva la clase muerta .article (REQ-11-07)');
  assert.doesNotMatch(css, /\.prose\b/, 'article.css conserva la clase muerta .prose (REQ-11-07)');
});

test('REQ-11-09: article.css no supera las 100 líneas', () => {
  const lineCount = countLines(readCss());
  assert.ok(
    lineCount <= 100,
    `article.css tiene ${lineCount} líneas (máximo 100, REQ-11-09)`
  );
});

test('Convención: la página de detalle conserva ≤100 líneas, sin estilos embebidos y con los imports de post.css', () => {
  const page = readPostPage();
  const lineCount = countLines(page);
  assert.ok(
    lineCount <= 100,
    `[id].astro tiene ${lineCount} líneas (máximo 100)`
  );
  assert.doesNotMatch(page, /<style/i, 'la página contiene un bloque <style> embebido (convención)');
  assert.doesNotMatch(page, /\bstyle\s*=/, 'la página conserva el atributo style inline (convención)');
  // El import de article.css es aditivo: los imports de post.css y las
  // aserciones REQ-26-02 de tests/post-page-styles.test.mjs no cambian.
  assert.ok(page.includes('../../styles/post.css'), 'la página perdió el import de post.css (REQ-26-02)');
});