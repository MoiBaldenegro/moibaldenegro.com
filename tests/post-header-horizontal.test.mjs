// Test de la tarjeta horizontal del header de artículo (REQ-42-01..09,
// feature 42 post-header-horizontal-card). Test-first: escrito contra
// specs/42_post-header-horizontal-card/requirements.md y design.md ANTES de
// la implementación (ciclo rojo/verde).
//
//   REQ-42-01 — el header muestra la tarjeta horizontal: imagen destacada y
//               copia en dos columnas dentro del panel.
//   REQ-42-02 — en desktop (>768px) el panel se divide en dos columnas con la
//               imagen en la primera y la copia en la segunda.
//   REQ-42-03 — la primera etiqueta del artículo se muestra como píldora de
//               apertura con el token de acento (p.post__kicker con
//               {post.tags[0]} antes de h1.post__title).
//   REQ-42-04 — el título escala con clamp entre 2.2rem y 3.6rem.
//   REQ-42-05 — la imagen destacada muestra la proporción 4:3 con el glow del
//               token; la regla base .post__image de post.css permanece
//               intacta (REQ-26-04).
//   REQ-42-06 — el panel muestra un acento inferior degradado con el token de
//               acento (.post__hero::after).
//   REQ-42-07 — en 768px o menos la tarjeta apila la imagen sobre la copia.
//   REQ-42-08 — el primer h1 y el primer img conservan los pares
//               title-${entry.id} / img-${entry.id} (REQ-24-03/05).
//   REQ-42-09 — los estilos residen en post-header.css (≤100 líneas),
//               tokens.css permanece en 91 líneas (87 + el token
//               --radius-thumb aprobado en la feature 9), la página sigue ≤100
//               líneas sin estilos embebidos y toda declaración de
//               color/borde/sombra de la hoja usa var() (REQ-39-09).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const HEADER_CSS_PATH = new URL('../src/styles/post-header.css', import.meta.url);
const CSS_PATH = new URL('../src/styles/post.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-42-01)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readHeaderCss() {
  assert.ok(existsSync(HEADER_CSS_PATH), 'src/styles/post-header.css no existe (REQ-42-09)');
  return readFileSync(HEADER_CSS_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post.css no existe (REQ-42-05)');
  return readFileSync(CSS_PATH, 'utf8');
}

function readTokens() {
  assert.ok(existsSync(TOKENS_PATH), 'src/styles/tokens.css no existe (REQ-42-09)');
  return readFileSync(TOKENS_PATH, 'utf8');
}

// Extrae el bloque de declaraciones de una regla (primer match).
function ruleBlock(css, selector) {
  const match = css.match(new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\}`));
  assert.ok(match, `no se declara la regla ${selector} (REQ-42)`);
  return match[1];
}

test('REQ-42-01/03: el marcado declara la tarjeta horizontal con kicker antes del título', () => {
  const page = readPage();
  const header = page.match(/<header class="post__hero">[\s\S]*?<\/header>/)?.[0] ?? '';
  assert.ok(header.length > 0, 'la página no declara <header class="post__hero"> (REQ-42-01)');
  assert.match(
    header,
    /<img[^>]*class="post__image"/,
    'el panel no contiene img.post__image (REQ-42-01)'
  );
  assert.ok(
    header.indexOf('class="post__image"') < header.indexOf('class="post__hero-copy"'),
    'la imagen debe ir antes que el bloque de copia (REQ-42-01, design Decisión 1)'
  );
  const copy = page.match(/<div class="post__hero-copy">[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.ok(copy.length > 0, 'el panel no contiene div.post__hero-copy (REQ-42-01)');
  assert.match(
    copy,
    /<p[^>]*class="post__kicker"[^>]*>\s*#\{post\.tags\[0\]\}/,
    '.post__hero-copy no declara p.post__kicker con {post.tags[0]} (REQ-42-03, design Decisión 2)'
  );
  assert.ok(
    copy.indexOf('post__kicker') < copy.indexOf('post__title'),
    'el kicker debe ir antes de h1.post__title dentro de la copia (REQ-42-03)'
  );
});

test('REQ-42-08: el primer h1 y el primer img conservan los pares de transición', () => {
  const page = readPage();
  const h1 = page.match(/<h1[\s\S]*?>/)?.[0] ?? '';
  const img = page.match(/<img[\s\S]*?>/)?.[0] ?? '';
  assert.match(h1, /transition:name=\{`title-\$\{entry\.id\}`\}/, 'el título no conserva title-${entry.id} (REQ-42-08)');
  assert.match(img, /transition:name=\{`img-\$\{entry\.id\}`\}/, 'la imagen no conserva img-${entry.id} (REQ-42-08)');
});

test('REQ-42-01/02: .post__hero declara grid de dos columnas con gap conservando el contrato del panel', () => {
  const css = readHeaderCss();
  const hero = ruleBlock(css, '\\.post__hero');
  assert.match(hero, /display:\s*grid/, 'el panel no usa display grid (REQ-42-02, design Decisión 1)');
  assert.match(
    hero,
    /grid-template-columns:\s*1fr\s+1fr/,
    'el panel no declara dos columnas en grid-template-columns (REQ-42-02, design Decisión 1)'
  );
  assert.match(hero, /gap:\s*32px/, 'el panel no declara el gap entre columnas (REQ-42-02, design Decisión 1)');
  assert.match(
    hero,
    /background:\s*(linear-gradient|radial-gradient)[^;]*var\(--color-hero-/,
    'el panel no conserva el degradado con var(--color-hero-*) (REQ-42-01, contrato REQ-39-02/03)'
  );
  assert.match(hero, /border-radius:\s*var\(--radius-card\)/, 'el panel no usa var(--radius-card) (REQ-42-01)');
  assert.match(hero, /border:[^;]*var\(--color-border-strong\)/, 'el panel no usa var(--color-border-strong) (REQ-42-01)');
  assert.match(hero, /box-shadow:\s*var\(--shadow-card\)/, 'el panel no usa var(--shadow-card) (REQ-42-01)');
  const glow = ruleBlock(css, '\\.post__hero::before');
  assert.match(glow, /var\(--color-glow\)/, 'el panel no conserva el resplandor con var(--color-glow) (REQ-42-01, REQ-39-02)');
});

test('REQ-42-06: .post__hero::after declara el acento inferior con var(--color-accent)', () => {
  const after = ruleBlock(readHeaderCss(), '\\.post__hero::after');
  assert.match(
    after,
    /background:\s*(linear-gradient|radial-gradient)[^;]*var\(--color-accent\)/,
    'el acento inferior no usa un degradado con var(--color-accent) (REQ-42-06, design Decisión 5)'
  );
});

test('REQ-42-05: .post__hero .post__image declara 4:3, margin 0 y glow; la regla base de post.css permanece intacta', () => {
  const heroImage = ruleBlock(readHeaderCss(), '\\.post__hero\\s+\\.post__image');
  assert.match(heroImage, /margin:\s*0/, 'la imagen del hero no declara margin 0 (REQ-42-05, design Decisión 4)');
  assert.match(heroImage, /aspect-ratio:\s*4\s*\/\s*3/, 'la imagen del hero no declara aspect-ratio 4/3 (REQ-42-05, design Decisión 4)');
  assert.match(
    heroImage,
    /box-shadow:[^;]*var\(--color-glow\)/,
    'la imagen del hero no declara box-shadow con var(--color-glow) (REQ-42-05, design Decisión 4)'
  );
  const baseImage = ruleBlock(readCss(), '\\.post__image');
  assert.match(baseImage, /width\s*:\s*100%/, 'la regla base .post__image de post.css perdió width 100% (REQ-26-04, REQ-42-05)');
  assert.match(baseImage, /aspect-ratio\s*:\s*16\s*\/\s*9/, 'la regla base .post__image de post.css perdió 16/9 (REQ-26-04, REQ-42-05)');
});

test('REQ-42-03: .post__kicker usa var(--color-accent) en color y borde con fondo color-mix', () => {
  const kicker = ruleBlock(readHeaderCss(), '\\.post__kicker');
  assert.match(kicker, /color:\s*var\(--color-accent\)/, 'el kicker no usa color var(--color-accent) (REQ-42-03, design Decisión 2)');
  assert.match(kicker, /border:[^;]*var\(--color-accent\)/, 'el kicker no usa border var(--color-accent) (REQ-42-03)');
  assert.match(
    kicker,
    /background:\s*color-mix\([^;]*var\(--color-accent\)/,
    'el kicker no usa background color-mix con var(--color-accent) (REQ-42-03)'
  );
});

test('REQ-42-04: .post__hero .post__title escala con clamp(2.2rem, 4.5vw, 3.6rem)', () => {
  const title = ruleBlock(readHeaderCss(), '\\.post__hero\\s+\\.post__title');
  assert.match(
    title,
    /font-size:\s*clamp\(\s*2\.2rem\s*,\s*4\.5vw\s*,\s*3\.6rem\s*\)/,
    'el título del hero no declara font-size clamp(2.2rem, 4.5vw, 3.6rem) (REQ-42-04, design Decisión 3)'
  );
});

test('REQ-42-07: la media query de 768px apila la tarjeta en una columna', () => {
  const css = readHeaderCss();
  const mediaIndex = css.indexOf('@media (max-width: 768px)');
  assert.ok(mediaIndex >= 0, 'post-header.css no declara @media (max-width: 768px) (REQ-42-07)');
  const media = css.slice(mediaIndex);
  assert.match(
    media,
    /\.post__hero\s*\{[^}]*grid-template-columns:\s*1fr/,
    'la media query no apila .post__hero con grid-template-columns 1fr (REQ-42-07, design Decisión 6)'
  );
  assert.match(
    media,
    /\.post__hero\s+\.post__image[^{]*\{\s*aspect-ratio:\s*16\s*\/\s*9/,
    'la media query no devuelve la imagen del hero a 16/9 (REQ-42-07, design Decisión 6)'
  );
});

test('REQ-42-09: post-header.css ≤100 líneas y sin hex/rgba sueltos', () => {
  const headerLines = countLines(readHeaderCss());
  assert.ok(headerLines <= 100, `post-header.css tiene ${headerLines} líneas (máximo 100, REQ-42-09)`);
  const content = readHeaderCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(content, /#[0-9a-fA-F]{3,8}\b/, 'post-header.css contiene un color hex hardcodeado (REQ-42-09)');
  assert.doesNotMatch(content, /rgba?\(/, 'post-header.css contiene rgb()/rgba() hardcodeado (REQ-42-09)');
});

test('REQ-42-09: tokens.css conserva 91 líneas (87 + --radius-thumb de la feature 9) sin tokens nuevos', () => {
  const tokens = readTokens();
  const lineCount = countLines(tokens);
  assert.equal(lineCount, 91, `tokens.css tiene ${lineCount} líneas y debe conservar 91 (REQ-42-09; 87 + 4 del token --radius-thumb aprobado en la feature 9)`);
  assert.doesNotMatch(tokens, /--post-/, 'tokens.css define un token del grupo post (REQ-42-09, sin tokens nuevos)');
});

test('REQ-42-09/REQ-39-09: toda declaración de color/borde/sombra de post-header.css usa var()', () => {
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
      `"${prop}" no usa var() de los tokens (REQ-42-09, guard REQ-39-09): ${line}`
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
