// Test de las mejoras de legibilidad del detalle de artículo (REQ-40-01..12,
// feature 40 post-readability; actualizado al ciclo 33 por la feature 41
// post-reading-width-restore, REQ-41-01..13). Test-first: escrito contra
// specs/40_post-readability/requirements.md y design.md ANTES de la
// implementación (ciclo rojo/verde). La actualización autorizada del ciclo
// 33 (specs/41_post-reading-width-restore/requirements.md y design.md,
// §Cambios de test autorizados) toca SOLO el test de la medida (REQ-40-02)
// y el refuerzo de REQ-40-12; el resto del contrato de la 40 se conserva.
//
//   REQ-40-01 — el render del Content se envuelve en una sección con la
//               clase post__body (y [id].astro importa post-readability.css
//               después de post.css y post-header.css: el orden de import
//               fija la cascada, design Decisión 7).
//   REQ-40-02 — (ciclo 33, REQ-41-01) la columna de lectura NO acota su
//               ancho: .post__body no declara max-width ni max-inline-size.
//               El humano rechazó la medida 70ch de la 40 ("muy angosto") y
//               el cuerpo vuelve al ancho completo del contenedor del sitio.
//   REQ-40-03 — el cuerpo declara font-size clamp() entre 1.0625rem y
//               1.1875rem (fluido 17→19px, design Decisión 2).
//   REQ-40-04 — los párrafos del contenido declaran text-wrap pretty.
//   REQ-40-05 — los párrafos declaran el espaciado final de bloque con 1lh
//               (ritmo vertical atado al line-height, design Decisión 4).
//   REQ-40-06 — los párrafos declaran letter-spacing 0.01em (confort de
//               tema oscuro, design Decisión 5).
//   REQ-40-07 — los encabezados del contenido declaran text-wrap balance.
//   REQ-40-08 — la jerarquía escala h2 a 1.75rem y h3 a 1.4rem (design
//               Decisión 6), con márgenes asimétricos en lh (Decisión 4).
//   REQ-40-09 — en 768px o menos, la tipografía adapta los tamaños de h2 y
//               h3 (media query de la hoja nueva; post.css conserva la suya
//               con .post__title, contrato REQ-39-07 intacto).
//   REQ-40-10 — los estilos residen en src/styles/post-readability.css,
//               ≤100 líneas y sin hex/rgba sueltos.
//   REQ-40-11 — solo tokens existentes: tokens.css permanece en 91 líneas
//               (87 + el token --radius-thumb aprobado en la feature 9)
//               sin tokens de los grupos post/reading/font-size.
//   REQ-40-12 — (ciclo 33, REQ-41-13) la regla .post__content de post.css
//               conserva el ancho completo (sin max-width, REQ-39-01
//               literal) y NINGUNA regla de post-readability.css declara
//               max-width ni max-inline-size (REQ-41-01, guard reforzado:
//               la medida ya no vive en ninguna capa).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const READING_CSS_PATH = new URL('../src/styles/post-readability.css', import.meta.url);
const CSS_PATH = new URL('../src/styles/post.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-40-01)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readReadingCss() {
  assert.ok(existsSync(READING_CSS_PATH), 'src/styles/post-readability.css no existe (REQ-40-10)');
  return readFileSync(READING_CSS_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post.css no existe (REQ-40-12)');
  return readFileSync(CSS_PATH, 'utf8');
}

function readTokens() {
  assert.ok(existsSync(TOKENS_PATH), 'src/styles/tokens.css no existe (REQ-40-11)');
  return readFileSync(TOKENS_PATH, 'utf8');
}

// Extrae el bloque de declaraciones de una regla del CSS.
//   exact = false (default): el primer bloque cuyo selector contiene el
//           selector buscado (tolera listas de selectores, p. ej. el grupo
//           `.post__content h1, h2, h3` de balance).
//   exact = true: el primer bloque cuya línea de selector es EXACTAMENTE el
//           buscado (evita que el grupo de balance o las reglas internas de
//           la media query contamine las reglas de tamaño de h2/h3).
function ruleBlock(css, selector, { exact = false } = {}) {
  const blocks = css.matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const match of blocks) {
    const selectorText = match[1];
    if (exact) {
      const line = selectorText
        .split('\n')
        .map((part) => part.trim())
        .filter(Boolean)
        .at(-1);
      if (line && new RegExp(`^${selector}\\s*$`).test(line)) return match[2];
    } else if (new RegExp(selector).test(selectorText)) {
      return match[2];
    }
  }
  assert.ok(false, `no se declara la regla con selector ${selector} (REQ-40)`);
}

test('REQ-40-01: el Content se envuelve en section.post__body', () => {
  const page = readPage();
  const section = page.match(/<section class="post__body">[\s\S]*?<\/section>/)?.[0] ?? '';
  assert.ok(section.length > 0, 'la página no declara <section class="post__body"> (REQ-40-01)');
  assert.ok(
    section.includes('<Content />'),
    'la sección post__body no envuelve el render del <Content /> (REQ-40-01)'
  );
  const article = page.match(/<article class="post__content">[\s\S]*?<\/article>/)?.[0] ?? '';
  assert.ok(
    article.includes('class="post__body"'),
    'section.post__body no vive dentro de article.post__content (REQ-40-01)'
  );
});

test('REQ-40-01: [id].astro importa post-readability.css después de post.css y post-header.css', () => {
  const page = readPage();
  assert.ok(
    page.includes('../../styles/post-readability.css'),
    'src/pages/posts/[id].astro no importa ../../styles/post-readability.css (REQ-40-01)'
  );
  const idxPost = page.indexOf('../../styles/post.css');
  const idxHeader = page.indexOf('../../styles/post-header.css');
  const idxReading = page.indexOf('../../styles/post-readability.css');
  assert.ok(
    idxReading > idxHeader && idxHeader > idxPost && idxPost >= 0,
    'el import de post-readability.css no va después de post.css y post-header.css (design, Decisión 7: el orden de import fija la cascada)'
  );
});

test('REQ-40-02/REQ-41-01: .post__body no acota el ancho (medida 70ch eliminada)', () => {
  const css = readReadingCss();
  const body = ruleBlock(css, '\\.post__body', { exact: true });
  assert.doesNotMatch(
    body,
    /max-width/,
    '.post__body declara max-width (REQ-41-01): la columna de lectura debe ocupar el ancho completo del contenedor'
  );
  assert.doesNotMatch(
    body,
    /max-inline-size/,
    '.post__body declara max-inline-size (REQ-41-01): la columna de lectura debe ocupar el ancho completo del contenedor'
  );
});

test('REQ-40-03: el cuerpo declara font-size clamp() entre 1.0625rem y 1.1875rem', () => {
  const css = readReadingCss();
  const body = ruleBlock(css, '\\.post__body', { exact: true });
  assert.match(
    body,
    /font-size:\s*clamp\([^;]*1\.0625rem[^;]*1\.1875rem/,
    '.post__body no declara font-size clamp() con límites 1.0625rem y 1.1875rem (REQ-40-03, design Decisión 2)'
  );
});

test('REQ-40-04/05/06: los párrafos declaran pretty, 1lh y letter-spacing 0.01em', () => {
  const css = readReadingCss();
  const p = ruleBlock(css, '\\.post__content\\s+p', { exact: true });
  assert.match(p, /text-wrap:\s*pretty/, 'los párrafos no declaran text-wrap pretty (REQ-40-04)');
  assert.match(p, /margin-block-end:\s*1lh/, 'los párrafos no declaran margin-block-end 1lh (REQ-40-05, design Decisión 4)');
  assert.match(p, /letter-spacing:\s*0\.01em/, 'los párrafos no declaran letter-spacing 0.01em (REQ-40-06, design Decisión 5)');
});

test('REQ-40-07: los encabezados declaran text-wrap balance', () => {
  const css = readReadingCss();
  for (const selector of ['\\.post__content\\s+h1', '\\.post__content\\s+h2', '\\.post__content\\s+h3']) {
    const block = ruleBlock(css, selector);
    assert.match(block, /text-wrap:\s*balance/, `el encabezado ${selector} no declara text-wrap balance (REQ-40-07, design Decisión 3)`);
  }
});

test('REQ-40-08: la jerarquía escala h2 a 1.75rem y h3 a 1.4rem con márgenes en lh', () => {
  const css = readReadingCss();
  const h2 = ruleBlock(css, '\\.post__content\\s+h2', { exact: true });
  assert.match(h2, /font-size:\s*1\.75rem/, 'h2 no escala a 1.75rem (REQ-40-08, design Decisión 6)');
  assert.match(h2, /margin-block:[^;]*lh/, 'h2 no usa márgenes en lh (design, Decisión 4)');
  const h3 = ruleBlock(css, '\\.post__content\\s+h3', { exact: true });
  assert.match(h3, /font-size:\s*1\.4rem/, 'h3 no escala a 1.4rem (REQ-40-08, design Decisión 6)');
  assert.match(h3, /margin-block:[^;]*lh/, 'h3 no usa márgenes en lh (design, Decisión 4)');
});

test('REQ-40-09: media query de 768px que adapta los tamaños de h2 y h3', () => {
  const css = readReadingCss();
  const mediaIndex = css.indexOf('@media (max-width: 768px)');
  assert.ok(mediaIndex >= 0, 'post-readability.css no declara @media (max-width: 768px) (REQ-40-09)');
  const media = css.slice(mediaIndex);
  assert.match(media, /\.post__content h2[^{]*\{\s*font-size:\s*1\.4rem/, 'la media query no adapta h2 a 1.4rem (REQ-40-09, design Decisión 6)');
  assert.match(media, /\.post__content h3[^{]*\{\s*font-size:\s*1\.2rem/, 'la media query no adapta h3 a 1.2rem (REQ-40-09, design Decisión 6)');
});

test('REQ-40-10: post-readability.css no supera las 100 líneas', () => {
  const lineCount = countLines(readReadingCss());
  assert.ok(lineCount <= 100, `post-readability.css tiene ${lineCount} líneas (máximo 100, REQ-40-10)`);
});

test('REQ-40-10: post-readability.css no contiene hex/rgba sueltos', () => {
  const content = readReadingCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(content, /#[0-9a-fA-F]{3,8}\b/, 'post-readability.css contiene un color hex hardcodeado (REQ-40-10)');
  assert.doesNotMatch(content, /rgba?\(/, 'post-readability.css contiene rgb()/rgba() hardcodeado (REQ-40-10)');
});

test('REQ-40-11: tokens.css conserva 91 líneas (87 + --radius-thumb de la feature 9) sin tokens de post/reading/font-size', () => {
  const tokens = readTokens();
  const lineCount = countLines(tokens);
  assert.equal(lineCount, 91, `tokens.css tiene ${lineCount} líneas y debe conservar 91 (REQ-40-11; 87 de REQ-26-07/39-09 + 4 del token --radius-thumb de la feature 9)`);
  assert.doesNotMatch(tokens, /--post-/, 'tokens.css define un token del grupo post (REQ-40-11)');
  assert.doesNotMatch(tokens, /--reading-/, 'tokens.css define un token del grupo reading (REQ-40-11)');
  assert.doesNotMatch(tokens, /--font-size-|--line-height-/, 'tokens.css define tokens de tipografía del artículo (REQ-40-11, REQ-26-07)');
});

test('REQ-40-12/REQ-41-13: .post__content conserva el ancho completo y ninguna regla de la hoja de lectura acota el ancho', () => {
  const css = readCss();
  const content = ruleBlock(css, '\\.post__content', { exact: true });
  assert.doesNotMatch(content, /max-width/, '.post__content sigue declarando max-width (REQ-40-12/41-13): el full-width de REQ-39-01 se conserva');
  const post = ruleBlock(css, '\\.post', { exact: true });
  assert.match(post, /var\(--container-max\)/, 'el contenedor .post no usa var(--container-max) (REQ-40-12)');
  // Guard reforzado (ciclo 33, REQ-41-01): la medida ya no vive en ninguna
  // capa — ninguna regla de post-readability.css acota el ancho. El patrón
  // detecta declaraciones de propiedad max-width/max-inline-size (no el
  // contexto `@media (max-width: 768px)` del contrato REQ-40-09) y NO
  // descarta comentarios: cualquier rastro de la acotación, incluso en
  // comentario, hace fallar el test (research ciclo 33 §8 riesgo 1).
  const reading = readReadingCss();
  const measureDeclaration = /(^|[\s{;])(max-width|max-inline-size)\s*:/gm;
  assert.doesNotMatch(reading, measureDeclaration, 'post-readability.css declara max-width o max-inline-size en alguna regla (REQ-41-01)');
});

test('Convención: [id].astro sigue ≤100 líneas y sin estilos embebidos', () => {
  const page = readPage();
  const lineCount = countLines(page);
  assert.ok(lineCount <= 100, `[id].astro tiene ${lineCount} líneas (máximo 100)`);
  assert.doesNotMatch(page, /<style/i, 'la página contiene un bloque <style> embebido (convención)');
  assert.doesNotMatch(page, /\bstyle\s*=/, 'la página conserva el atributo style inline (convención)');
});
