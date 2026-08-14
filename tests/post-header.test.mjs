// Test del rediseño de la página de detalle de artículo (REQ-39-01..09,
// feature 39 post-page-redesign). Test-first: escrito contra
// specs/39_post-page-redesign/requirements.md y design.md ANTES de la
// implementación (ciclo rojo/verde).
//
//   REQ-39-01 — el contenido del artículo ocupa el ancho completo del
//               contenedor del sitio: .post__content pierde max-width.
//   REQ-39-02 — el header es un panel hero (header.post__hero) con la imagen
//               destacada (img.post__image) seguida de .post__hero-copy
//               (h1.post__title + p.post__meta), con degradado y resplandor
//               de los tokens del hero.
//   REQ-39-03 — el panel enmarca la imagen con radio, borde y sombra de tokens.
//   REQ-39-04 — la meta se muestra como píldora con var(--radius-pill).
//   REQ-39-05 — el primer h1 y el primer img conservan los pares
//               title-${entry.id} / img-${entry.id} (REQ-24-03/05).
//   REQ-39-06 — los estilos del panel residen en src/styles/post-header.css
//               (≤100 líneas); post.css se mantiene ≤100 líneas.
//   REQ-39-07 — media query 768px: el header (post-header.css) y la
//               tipografía del detalle (post.css) adaptan tamaños/espaciados.
//   REQ-39-08 — main.post y article.post__content siguen presentes.
//   REQ-39-09 — solo tokens existentes: tokens.css en 87 líneas, sin hex/rgba
//               sueltos y colores/radios/sombras solo con var().

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/post.css', import.meta.url);
const HEADER_CSS_PATH = new URL('../src/styles/post-header.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-39-02)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post.css no existe (REQ-39-01)');
  return readFileSync(CSS_PATH, 'utf8');
}

function readHeaderCss() {
  assert.ok(existsSync(HEADER_CSS_PATH), 'src/styles/post-header.css no existe (REQ-39-06)');
  return readFileSync(HEADER_CSS_PATH, 'utf8');
}

function readTokens() {
  assert.ok(existsSync(TOKENS_PATH), 'src/styles/tokens.css no existe (REQ-39-09)');
  return readFileSync(TOKENS_PATH, 'utf8');
}

// Extrae el bloque de declaraciones de una regla (primer match).
function ruleBlock(css, selector) {
  const match = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `no se declara la regla ${selector} (REQ-39)`);
  return match[1];
}

test('REQ-39-01: .post__content pierde max-width y el contenedor conserva el ancho del sitio', () => {
  const css = readCss();
  const content = ruleBlock(css, '\\.post__content');
  assert.doesNotMatch(
    content,
    /max-width/,
    '.post__content sigue declarando max-width (REQ-39-01): el contenido debe ocupar el ancho completo'
  );
  const post = ruleBlock(css, '\\.post');
  assert.match(
    post,
    /var\(--container-max\)/,
    'el contenedor .post no usa var(--container-max) (REQ-39-01, design Decisión 1)'
  );
});

test('REQ-39-02: el marcado declara header.post__hero con img y .post__hero-copy', () => {
  const page = readPage();
  const header = page.match(/<header class="post__hero">[\s\S]*?<\/header>/)?.[0] ?? '';
  assert.ok(header.length > 0, 'la página no declara <header class="post__hero"> (REQ-39-02)');
  assert.match(
    header,
    /<img[^>]*class="post__image"/,
    'el panel no contiene img.post__image (REQ-39-02)'
  );
  assert.ok(
    header.indexOf('class="post__image"') < header.indexOf('class="post__hero-copy"'),
    'la imagen debe ir antes que el bloque de copia (design.md, Decisión 2)'
  );
  const copy = page.match(/<div class="post__hero-copy">[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.ok(copy.length > 0, 'el panel no contiene div.post__hero-copy (REQ-39-02)');
  assert.match(
    copy,
    /<h1[^>]*class="post__title"/,
    '.post__hero-copy no contiene h1.post__title (REQ-39-02)'
  );
  assert.match(
    copy,
    /<p[^>]*class="post__meta"/,
    '.post__hero-copy no contiene p.post__meta (REQ-39-02)'
  );
});

test('REQ-39-02/03: el panel estiliza degradado, glow, radio, borde y sombra', () => {
  const css = readHeaderCss();
  const hero = ruleBlock(css, '\\.post__hero');
  assert.match(
    hero,
    /background:\s*(linear-gradient|radial-gradient)[^;]*var\(--color-hero-/,
    'el panel no usa un degradado de los tokens del hero (REQ-39-02)'
  );
  assert.match(hero, /border-radius:\s*var\(--radius-card\)/, 'el panel no usa var(--radius-card) (REQ-39-03)');
  assert.match(hero, /border:[^;]*var\(--color-border-strong\)/, 'el panel no usa var(--color-border-strong) (REQ-39-03)');
  assert.match(hero, /box-shadow:\s*var\(--shadow-card\)/, 'el panel no usa var(--shadow-card) (REQ-39-03)');
  const glow = ruleBlock(css, '\\.post__hero::before');
  assert.match(glow, /var\(--color-glow\)/, 'el panel no declara el resplandor con var(--color-glow) (REQ-39-02)');
});

test('REQ-39-04: .post__meta se muestra como píldora con tokens', () => {
  const meta = ruleBlock(readHeaderCss(), '\\.post__meta');
  assert.match(meta, /display:\s*inline-flex/, 'la meta no usa display inline-flex (REQ-39-04, design Decisión 5)');
  assert.match(meta, /border-radius:\s*var\(--radius-pill\)/, 'la meta no usa var(--radius-pill) (REQ-39-04)');
  assert.match(meta, /background:\s*color-mix\([^;]*var\(--color-surface\)/, 'la meta no usa color-mix con var(--color-surface) (REQ-39-04)');
  assert.match(meta, /border:[^;]*var\(--color-border-strong\)/, 'la meta no usa var(--color-border-strong) (REQ-39-04)');
});

test('REQ-39-05: el primer h1 y el primer img conservan los pares de transición', () => {
  const page = readPage();
  const h1 = page.match(/<h1[\s\S]*?>/)?.[0] ?? '';
  const img = page.match(/<img[\s\S]*?>/)?.[0] ?? '';
  assert.match(h1, /transition:name=\{`title-\$\{entry\.id\}`\}/, 'el título no conserva title-${entry.id} (REQ-39-05)');
  assert.match(img, /transition:name=\{`img-\$\{entry\.id\}`\}/, 'la imagen no conserva img-${entry.id} (REQ-39-05)');
});

test('REQ-39-06: la página importa post-header.css y ambas hojas no superan 100 líneas', () => {
  const page = readPage();
  assert.ok(
    page.includes('../../styles/post-header.css'),
    'src/pages/posts/[id].astro no importa ../../styles/post-header.css (REQ-39-06)'
  );
  const headerLines = countLines(readHeaderCss());
  assert.ok(headerLines <= 100, `post-header.css tiene ${headerLines} líneas (máximo 100, REQ-39-06)`);
  const cssLines = countLines(readCss());
  assert.ok(cssLines <= 100, `post.css tiene ${cssLines} líneas (máximo 100, REQ-39-06)`);
});

test('REQ-39-07: media query 768px para header y tipografía del detalle', () => {
  const headerCss = readHeaderCss();
  assert.match(
    headerCss,
    /@media\s*\(max-width:\s*768px\)[\s\S]*?\.post__hero/,
    'post-header.css no adapta el panel hero en 768px (REQ-39-07)'
  );
  const css = readCss();
  assert.match(
    css,
    /@media\s*\(max-width:\s*768px\)[\s\S]*?\.post__title/,
    'post.css no adapta la tipografía en 768px (REQ-39-07)'
  );
});

test('REQ-39-08: se conservan main.post y article.post__content', () => {
  const page = readPage();
  assert.match(page, /<main class="post">/, 'la página no conserva main.post (REQ-39-08)');
  assert.match(page, /<article class="post__content">/, 'la página no conserva article.post__content (REQ-39-08)');
});

test('REQ-39-09: tokens.css conserva 87 líneas sin tokens nuevos', () => {
  const tokens = readTokens();
  const lineCount = countLines(tokens);
  assert.equal(lineCount, 87, `tokens.css tiene ${lineCount} líneas y debe conservar 87 (REQ-39-09)`);
  assert.doesNotMatch(tokens, /--post-/, 'tokens.css define un token del grupo post (REQ-39-09, sin tokens nuevos)');
});

test('REQ-39-09: las hojas del detalle no contienen hex/rgba sueltos', () => {
  for (const css of [readCss(), readHeaderCss()]) {
    const content = css.replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(content, /#[0-9a-fA-F]{3,8}\b/, 'una hoja del detalle contiene un color hex hardcodeado (REQ-39-09)');
    assert.doesNotMatch(content, /rgba?\(/, 'una hoja del detalle contiene rgb()/rgba() hardcodeado (REQ-39-09)');
  }
});

test('REQ-39-09: colores, radios, bordes y sombras de post-header.css usan var()', () => {
  const content = readHeaderCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = /^([a-z-]+)\s*:\s*(.+?);?$/;
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  const props = new Set([
    'color',
    'background',
    'background-color',
    'border',
    'border-color',
    'border-radius',
    'box-shadow',
    'transition',
  ]);

  assert.ok(lines.length > 0, 'post-header.css está vacío');
  let checked = 0;
  for (const line of lines) {
    const match = line.match(declaration);
    if (!match) continue; // selectores, @media, llaves
    const prop = match[1].toLowerCase();
    if (!props.has(prop)) continue;
    checked += 1;
    assert.match(
      match[2],
      /var\(--/,
      `"${prop}" no usa var() de los tokens (REQ-39-09): ${line}`
    );
  }
  assert.ok(checked > 0, 'no se encontró ninguna declaración de color/radio/sombra en post-header.css');
});

test('Convención: [id].astro sigue ≤100 líneas y sin estilos embebidos', () => {
  const page = readPage();
  const lineCount = countLines(page);
  assert.ok(lineCount <= 100, `[id].astro tiene ${lineCount} líneas (máximo 100)`);
  assert.doesNotMatch(page, /<style/i, 'la página contiene un bloque <style> embebido (convención)');
  assert.doesNotMatch(page, /\bstyle\s*=/, 'la página conserva el atributo style inline (convención)');
});
