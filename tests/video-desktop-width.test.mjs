// Test del ancho acotado y centrado del video embebido en desktop
// (REQ-16-01..09, feature 16 video-desktop-width).
//
// Verifica contra specs/16_video-desktop-width/requirements.md y design.md:
//   REQ-16-01 — article.css declara una media query de escritorio
//               @media (min-width: 769px), complementaria del breakpoint
//               móvil existente de 768px (layout.css, post.css,
//               search-results.css): sin solapamiento ni hueco.
//   REQ-16-02 — dentro de la MQ, el contenedor .post__content
//               .video-container limita max-width a var(--video-max-width)
//               y se centra horizontalmente con margin var(--gap-card) auto.
//   REQ-16-03 — la regla base conserva width 100%, max-width 100% y
//               margin var(--gap-card): en 768px o menos el video conserva
//               el ancho completo actual (REQ-11-02/05 intactos).
//   REQ-16-04 — tokens.css declara el token --video-max-width con 640px.
//   REQ-16-05 — la MQ usa exclusivamente tokens para max-width y margin
//               (sin valores sueltos de ancho/espaciado).
//   REQ-16-06 — la regla base del contenedor no cambia y la MQ va DESPUÉS
//               de ella (el regex de REQ-11 captura la primera ocurrencia;
//               design.md Decisión 1/3).
//   REQ-16-07 — article.css respeta el máximo de 100 líneas del arnés.
//   REQ-16-08 — este test de inspección verifica la MQ de escritorio, la
//               conservación del full-width en móvil, el token nuevo y el
//               límite de líneas.
//   REQ-16-09 — los 5 tests que fijan tokens.css en 91 líneas (REQ-17-09,
//               REQ-26-07, REQ-39-09, REQ-40-11, REQ-42-09) actualizan su
//               aserción al estado canónico 93 (91 + comentario justificativo
//               + token --video-max-width de la feature 16) con la
//               justificación del ajuste documentada en el encabezado
//               (precedente REQ-43-06: el artefacto de test sigue al estado
//               real de tokens.css; mismo procedimiento que la feature 9 usó
//               para --radius-thumb 87→91).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const CSS_PATH = new URL('../src/styles/article.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Los 5 tests que fijan el conteo exacto de líneas de tokens.css (REQ-16-09).
const TOKEN_COUNT_TESTS = [
  { file: 'tests/article-card-images.test.mjs', req: 'REQ-17-09' },
  { file: 'tests/post-page-styles.test.mjs', req: 'REQ-26-07' },
  { file: 'tests/post-header.test.mjs', req: 'REQ-39-09' },
  { file: 'tests/post-readability.test.mjs', req: 'REQ-40-11' },
  { file: 'tests/post-header-horizontal.test.mjs', req: 'REQ-42-09' },
];

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/article.css no existe (REQ-16-01)');
  return readFileSync(CSS_PATH, 'utf8');
}

function readTokens() {
  assert.ok(existsSync(TOKENS_PATH), 'src/styles/tokens.css no existe (REQ-16-04)');
  return readFileSync(TOKENS_PATH, 'utf8');
}

// Extrae la regla base .post__content .video-container (primera ocurrencia:
// la MQ de escritorio va después, design.md Decisión 1/3).
function baseContainerRule(css) {
  const match = css.match(/\.post__content\s+\.video-container\s*\{([\s\S]*?)\}/);
  assert.ok(match, 'article.css no declara la regla base .post__content .video-container (REQ-16-03)');
  return match[1];
}

// Extrae el bloque interior de la media query de escritorio.
function desktopMediaQueryBlock(css) {
  const match = css.match(/@media\s*\(min-width:\s*769px\)\s*\{([\s\S]*?)\}/);
  assert.ok(match, 'article.css no declara @media (min-width: 769px) (REQ-16-01)');
  return match[1];
}

test('REQ-16-01: article.css declara la media query de escritorio con ancho mínimo 769px', () => {
  const css = readCss();
  assert.match(
    css,
    /@media\s*\(min-width:\s*769px\)/,
    'article.css no declara @media (min-width: 769px) (REQ-16-01): el breakpoint móvil existente es 768px y el desktop es el rango complementario ≥769px'
  );
});

test('REQ-16-02/05: en la MQ de escritorio el contenedor acota con el token y se centra con var(--gap-card) auto', () => {
  const mq = desktopMediaQueryBlock(readCss());
  assert.match(
    mq,
    /\.post__content\s+\.video-container/,
    'la MQ de escritorio no incluye el selector del contenedor del video (REQ-16-02)'
  );
  assert.match(
    mq,
    /max-width\s*:\s*var\(--video-max-width\)/,
    'la MQ no limita max-width con var(--video-max-width) (REQ-16-02)'
  );
  assert.match(
    mq,
    /margin\s*:\s*var\(--gap-card\)\s+auto/,
    'la MQ no centra con margin var(--gap-card) auto (REQ-16-02)'
  );
  assert.doesNotMatch(
    mq,
    /max-width\s*:\s*\d+(\.\d+)?(px|rem|em|%)/,
    'la MQ fija un max-width con valor suelto en lugar del token (REQ-16-05)'
  );
  assert.doesNotMatch(
    mq,
    /margin\s*:\s*\d+(\.\d+)?(px|rem|em|%)/,
    'la MQ fija un margin con valor suelto en lugar del token (REQ-16-05)'
  );
});

test('REQ-16-03/06: la regla base conserva width 100%, max-width 100% y margin var(--gap-card)', () => {
  const rule = baseContainerRule(readCss());
  assert.match(rule, /width\s*:\s*100%/, 'la regla base perdió width 100% (REQ-16-03/06)');
  assert.match(rule, /max-width\s*:\s*100%/, 'la regla base perdió max-width 100% (REQ-16-03/06)');
  assert.match(
    rule,
    /margin\s*:\s*var\(--gap-card\)/,
    'la regla base perdió margin var(--gap-card) (REQ-16-03/06, REQ-11-05)'
  );
});

test('REQ-16-01/06: la media query de escritorio va después de la regla base', () => {
  const css = readCss();
  const baseIndex = css.indexOf('.post__content .video-container');
  const mqIndex = css.indexOf('@media (min-width: 769px)');
  assert.ok(baseIndex !== -1, 'no se encuentra la regla base del contenedor (REQ-16-06)');
  assert.ok(mqIndex !== -1, 'no se encuentra la media query de escritorio (REQ-16-01)');
  assert.ok(
    mqIndex > baseIndex,
    'la media query debe ir después de la regla base (design.md Decisión 1/3: el regex REQ-11 captura la primera ocurrencia y la regla base no cambia)'
  );
});

test('REQ-16-04: tokens.css declara el token --video-max-width con 640px', () => {
  const tokens = readTokens();
  assert.match(
    tokens,
    /--video-max-width\s*:\s*640px/,
    'tokens.css no declara --video-max-width: 640px (REQ-16-04, design.md Decisión 2)'
  );
});

test('REQ-16-07: article.css no supera las 100 líneas', () => {
  const lineCount = countLines(readCss());
  assert.ok(
    lineCount <= 100,
    `article.css tiene ${lineCount} líneas (máximo 100, REQ-16-07)`
  );
});

test('REQ-16-09: los 5 tests de conteo de tokens.css actualizan la aserción a 93 con justificación en el encabezado (REQ-43-06)', () => {
  for (const { file, req } of TOKEN_COUNT_TESTS) {
    const path = new URL(`../${file}`, import.meta.url);
    assert.ok(existsSync(path), `${file} no existe (REQ-16-09)`);
    const content = readFileSync(path, 'utf8');
    assert.match(
      content,
      /assert\.equal\(\s*lineCount,\s*93/,
      `${file} no actualiza la aserción de líneas de tokens.css a 93 (REQ-16-09; ${req}, precedente REQ-43-06)`
    );
    assert.match(
      content,
      /--video-max-width/,
      `${file} no documenta el token --video-max-width en la justificación del ajuste (REQ-16-09; ${req}, precedente REQ-43-06)`
    );
  }
});