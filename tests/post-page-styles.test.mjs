// Test de los estilos de la página de detalle de artículo
// (REQ-26-01..08, feature 26 post-page-styles).
//
// Verifica contra specs/26_post-page-styles/requirements.md y design.md:
//   REQ-26-01 — el test se escribe antes de la implementación de la hoja y
//               verifica estructura y contrato sin navegador.
//   REQ-26-02 — src/pages/posts/[id].astro importa ../styles/post.css.
//   REQ-26-03 — post.css estiliza contenedor (post), título (post__title),
//               meta (post__meta), imagen (post__image) y la tipografía del
//               contenido markdown con scoping bajo .post__content
//               (h2/h3, p, ul/ol/li, a, code/pre — Decisión 2 del design.md),
//               sin tocar el marcado de la página ni del <Content />.
//   REQ-26-04 — la imagen declara width 100%, aspect-ratio 16/9,
//               object-fit cover, var(--radius-card), var(--color-border)
//               y margen con token (precedente REQ-17-02..05).
//   REQ-26-05 — colores, radios, bordes y transiciones solo desde var();
//               tipografía/layout literales del componente (design.md).
//   REQ-26-06 — post.css respeta el máximo de 100 líneas sin hex/rgba sueltos.
//   REQ-26-07 — tokens.css permanece sin cambios (93 líneas, estado canónico
//               post-feature 25 + token --radius-thumb aprobado en la feature
//               9 + token --video-max-width aprobado en la feature 16 — ajuste
//               REQ-43-06; sin tokens nuevos del grupo post/text).
//   REQ-26-08 — la suite completa y el build del proyecto siguen en verde
//               (se verifica ejecutando pnpm test y ./init.sh, no desde un
//               subtest: lanzar la suite dentro de la suite sería recursivo).
//
// Nota de alineación: el acceptance original de la feature 26 decía
// "tokens.css conserva 96 líneas" porque se escribió antes de la feature 25;
// REQ-25-03 eliminó los tokens GOL y el estado canónico fue 87 líneas,
// fijado por tests/article-card-images.test.mjs (REQ-17-09). La feature 9
// (search-results-list-mode) añadió el token aprobado --radius-thumb y el
// estado canónico fue 91 líneas. La feature 16 (video-desktop-width) añadió
// el token aprobado --video-max-width (640px) y el estado canónico actual es
// 93 líneas (ajuste REQ-43-06). El espíritu del REQ-26-07 es "sin
// cambios y sin tokens nuevos".

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/post.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

// Propiedades cuyo valor debe salir de var() (colores, radios, bordes y
// transiciones; el resto de valores tipográficos y de layout son literales
// del componente — design.md Decisión sobre tokens, REQ-26-05).
const TOKEN_PROPS = new Set([
  'color',
  'background',
  'background-color',
  'border',
  'border-color',
  'border-radius',
  'box-shadow',
  'transition',
]);

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-26-02)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post.css no existe (REQ-26-02)');
  return readFileSync(CSS_PATH, 'utf8');
}

function readTokens() {
  assert.ok(existsSync(TOKENS_PATH), 'src/styles/tokens.css no existe (REQ-26-07)');
  return readFileSync(TOKENS_PATH, 'utf8');
}

// Extrae el bloque de declaraciones de la regla .post__image.
function imageRule(css) {
  const match = css.match(/\.post__image\s*\{([\s\S]*?)\}/);
  assert.ok(match, 'post.css no declara la regla .post__image (REQ-26-03/04)');
  return match[1];
}

test('REQ-26-02: la página de artículo importa la hoja post.css', () => {
  const page = readPage();
  assert.ok(
    page.includes('../../styles/post.css'),
    'src/pages/posts/[id].astro no importa ../../styles/post.css (REQ-26-02)'
  );
  assert.ok(
    existsSync(CSS_PATH),
    'src/styles/post.css no existe (REQ-26-02)'
  );
});

test('REQ-26-03: la página declara las clases del bloque post (BEM actual)', () => {
  const page = readPage();
  assert.match(page, /<main class="post">/, 'la página no declara main.post (REQ-26-03)');
  assert.match(page, /<article class="post__content">/, 'la página no declara article.post__content (REQ-26-03)');
  assert.match(page, /class="post__title"/, 'la página no declara h1.post__title (REQ-26-03)');
  assert.match(page, /class="post__meta"/, 'la página no declara p.post__meta (REQ-26-03)');
  assert.match(page, /class="post__image"/, 'la página no declara img.post__image (REQ-26-03)');
});

test('REQ-26-03: la hoja estiliza contenedor, título, meta e imagen', () => {
  const css = readCss();
  assert.ok(
    css.includes('.post {') && !/\.post__/.test(css.match(/\.post\s*\{/)?.[0] ?? ''),
    'post.css no declara la regla del contenedor .post (REQ-26-03)'
  );
  assert.match(css, /\.post__title\s*\{/, 'post.css no estiliza .post__title (REQ-26-03)');
  assert.match(css, /\.post__meta\s*\{/, 'post.css no estiliza .post__meta (REQ-26-03)');
  assert.match(css, /\.post__image\s*\{/, 'post.css no estiliza .post__image (REQ-26-03)');
});

test('REQ-26-03: la tipografía del contenido markdown va scoping bajo .post__content', () => {
  const css = readCss();
  for (const selector of ['h2', 'h3', 'p', 'ul', 'ol', 'li', 'a', 'code', 'pre']) {
    assert.match(
      css,
      new RegExp(`\\.post__content\\s+${selector}(\\s|\\{|,)`),
      `post.css no estiliza el selector .post__content ${selector} (REQ-26-03, Decisión 2)`
    );
  }
});

test('REQ-26-04: la imagen mantiene la proporción 16:9 y el recorte cover', () => {
  const rule = imageRule(readCss());
  assert.match(rule, /width\s*:\s*100%/, 'la regla no limita la imagen al 100% del ancho (REQ-26-04)');
  assert.match(rule, /aspect-ratio\s*:\s*16\s*\/\s*9/, 'la regla no fija aspect-ratio 16/9 (REQ-26-04, precedente REQ-17-03)');
  assert.match(rule, /object-fit\s*:\s*cover/, 'la regla no usa object-fit cover (REQ-26-04, precedente REQ-17-04)');
  assert.match(rule, /border-radius\s*:\s*var\(--radius-card\)/, 'la regla no usa var(--radius-card) (REQ-26-04)');
  assert.match(rule, /border\s*:\s*1px\s+solid\s+var\(--color-border\)/, 'la regla no usa var(--color-border) (REQ-26-04)');
  assert.match(rule, /margin\s*:\s*var\(--gap-card\)/, 'el margen de la regla no usa el token (REQ-26-04, precedente REQ-17-05)');
  assert.match(rule, /display\s*:\s*block/, 'la regla no usa display block (design.md, precedente Decisión 4 de la feature 17)');
});

test('REQ-26-05: colores, radios, bordes y transiciones usan var() de los tokens', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = /^([a-z-]+)\s*:\s*(.+?);?$/;
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  assert.ok(lines.length > 0, 'post.css está vacío');

  let checked = 0;
  for (const line of lines) {
    const match = line.match(declaration);
    if (!match) continue; // selectores, @media, llaves
    const prop = match[1].toLowerCase();
    if (!TOKEN_PROPS.has(prop)) continue;
    checked += 1;
    assert.match(
      match[2],
      /var\(--/,
      `"${prop}" no usa var() de los tokens (REQ-26-05): ${line}`
    );
  }
  assert.ok(checked > 0, 'no se encontró ninguna declaración de color/radio/borde/transición');
});

test('REQ-26-05/design.md: la hoja consume los tokens de la tabla del design', () => {
  const css = readCss();
  for (const token of [
    '--color-text',
    '--color-text-secondary',
    '--color-border',
    '--color-accent',
    '--color-surface',
    '--radius-card',
    '--gap-card',
    '--container-max',
    '--font-sans',
    '--transition-default',
  ]) {
    assert.ok(
      css.includes(`var(${token})`),
      `post.css no usa var(${token}) (tabla del design.md, REQ-26-05)`
    );
  }
});

test('REQ-26-06: post.css no supera las 100 líneas', () => {
  const lineCount = countLines(readCss());
  assert.ok(
    lineCount <= 100,
    `post.css tiene ${lineCount} líneas (máximo 100, REQ-26-06)`
  );
});

test('REQ-26-06: sin valores hex ni rgb()/rgba() hardcodeados', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    content,
    /#[0-9a-fA-F]{3,8}\b/,
    'post.css contiene un color hex hardcodeado (REQ-26-06)'
  );
  assert.doesNotMatch(
    content,
    /rgba?\(/,
    'post.css contiene rgb()/rgba() hardcodeado (REQ-26-06)'
  );
});

test('REQ-26-07: tokens.css conserva 93 líneas (87 + --radius-thumb de la feature 9 + --video-max-width de la feature 16) sin tokens nuevos de post', () => {
  const tokens = readTokens();
  const lineCount = countLines(tokens);
  assert.equal(
    lineCount,
    93,
    `tokens.css tiene ${lineCount} líneas y debe conservar 93 (REQ-26-07; 87 tras REQ-25-03 + 4 del token --radius-thumb de la feature 9 + 2 del token --video-max-width de la feature 16; ajuste REQ-43-06)`
  );
  assert.doesNotMatch(
    tokens,
    /--post-/,
    'tokens.css define un token del grupo post (REQ-26-07, sin tokens nuevos)'
  );
  assert.doesNotMatch(
    tokens,
    /--text-/,
    'tokens.css define un token del grupo text (REQ-26-07, alternativa descartada del design.md)'
  );
  assert.doesNotMatch(
    tokens,
    /--font-size-|--line-height-|--reading-/,
    'tokens.css define tokens de tipografía del artículo (REQ-26-07, sin tokens nuevos)'
  );
});

test('Convención: la página sigue ≤100 líneas, sin estilos embebidos y sin datos directos', () => {
  const page = readPage();
  const lineCount = countLines(page);
  assert.ok(
    lineCount <= 100,
    `[id].astro tiene ${lineCount} líneas (máximo 100)`
  );
  assert.doesNotMatch(
    page,
    /<style/i,
    'la página contiene un bloque <style> embebido (convención)'
  );
  assert.doesNotMatch(
    page,
    /\bstyle\s*=/,
    'la página conserva el atributo style inline (convención)'
  );
  assert.doesNotMatch(
    page,
    /from\s+["'][^"']*\/data\//,
    'la página importa datos desde src/data (convención)'
  );
  // Nota: el `if` de consistencia de getStaticPaths es lógica de resolución
  // de la feature 24 (validada por tests/view-transitions.test.mjs) y se
  // conserva: esta feature solo añade el import de la hoja.
});