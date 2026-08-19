// Test de la imagen de artículo en las cards de latest-articles
// (REQ-17-01..09, feature 17 article-card-images).
//
// Verifica contra specs/17_article-card-images/requirements.md y design.md:
//   REQ-17-01 — el <img> de cada card lleva la clase latest-articles__image
//               (BEM del bloque latest-articles) y referencia post.img.
//   REQ-17-02 — la imagen ocupa el 100% del ancho de la card (width: 100%).
//   REQ-17-03 — proporción fija 16:9 derivada del ancho (aspect-ratio,
//               valor propio del componente, NO token — design.md).
//   REQ-17-04 — recorte sin deformar (object-fit: cover).
//   REQ-17-05 — radio, borde y margen desde los tokens --radius-card,
//               --color-border y --gap-card.
//   REQ-17-06 — alt = título del artículo (alt={post.title}, sin tocar el
//               dominio — Decisión 5 del design.md).
//   REQ-17-07 — carga diferida (loading="lazy", atributo HTML nativo).
//   REQ-17-08 — la hoja conserva un máximo de 100 líneas y la regla nueva no
//               introduce colores sueltos (solo tokens).
//   REQ-17-09 — tokens.css no define tokens del grupo aspect ni --radius-image.
//               Nota (feature 25): tokens.css bajó de 96 a 87 líneas porque la
//               feature 25 eliminó los tokens de opacidad del fondo revocado
//               (REQ-25-03). La feature 9 añadió el token aprobado
//               --radius-thumb (10px, miniatura del modo lista de búsqueda,
//               design.md 09) y el estado canónico es 91 líneas; la aserción
//               de conteo refleja ese estado sin volver a añadir tokens.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENT_PATH = new URL('../src/components/latest-articles.astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/latest-articles.css', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_PATH), 'src/components/latest-articles.astro no existe');
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/latest-articles.css no existe (REQ-17-02..08)');
  return readFileSync(CSS_PATH, 'utf8');
}

function readTokens() {
  assert.ok(existsSync(TOKENS_PATH), 'src/styles/tokens.css no existe (REQ-17-09)');
  return readFileSync(TOKENS_PATH, 'utf8');
}

// Extrae la etiqueta <img> de la card (una sola por card en el map del
// componente). Fallar aquí es un fallo de REQ-17-01 (sin img no hay imagen).
function imgTag(astro) {
  const match = astro.match(/<img[^>]*>/);
  assert.ok(match, 'latest-articles.astro no renderiza ningún <img> (REQ-17-01)');
  return match[0];
}

// Extrae el bloque de declaraciones de la regla .latest-articles__image.
// Fallar aquí es un fallo de REQ-17-01 (la regla no existe todavía).
function imageRule(css) {
  const match = css.match(/\.latest-articles__image\s*\{([\s\S]*?)\}/);
  assert.ok(match, 'latest-articles.css no declara la regla .latest-articles__image (REQ-17-01/02)');
  return match[1];
}

test('REQ-17-01: el <img> de la card lleva la clase latest-articles__image y referencia post.img', () => {
  const img = imgTag(readComponent());
  assert.match(
    img,
    /class="latest-articles__image"/,
    'el <img> no lleva la clase latest-articles__image (REQ-17-01)'
  );
  assert.ok(
    img.includes('post.img'),
    'el <img> no referencia el campo img de la entidad Post (REQ-17-01)'
  );
});

test('REQ-17-06: el <img> declara alt interpolado con el título del artículo', () => {
  const img = imgTag(readComponent());
  assert.match(
    img,
    /alt=\{post\.title\}/,
    'el <img> no usa alt={post.title} (REQ-17-06)'
  );
});

test('REQ-17-07: el <img> declara loading="lazy" para diferir la carga', () => {
  const img = imgTag(readComponent());
  assert.match(
    img,
    /loading="lazy"/,
    'el <img> no declara loading="lazy" (REQ-17-07)'
  );
});

test('REQ-17-02/03/04: la regla limita al ancho, fija proporción 16:9 y recorta con cover', () => {
  const rule = imageRule(readCss());
  assert.match(
    rule,
    /width\s*:\s*100%/,
    'la regla no limita la imagen al 100% del ancho (REQ-17-02)'
  );
  assert.match(
    rule,
    /aspect-ratio\s*:\s*16\s*\/\s*9/,
    'la regla no fija aspect-ratio 16/9 (REQ-17-03)'
  );
  assert.match(
    rule,
    /object-fit\s*:\s*cover/,
    'la regla no usa object-fit cover (REQ-17-04)'
  );
});

test('REQ-17-05: radio, borde y margen de la imagen desde los tokens del diseño', () => {
  const rule = imageRule(readCss());
  assert.match(
    rule,
    /border-radius\s*:\s*var\(--radius-card\)/,
    'la regla no usa var(--radius-card) para el radio (REQ-17-05)'
  );
  assert.match(
    rule,
    /border\s*:\s*1px\s+solid\s+var\(--color-border\)/,
    'la regla no usa var(--color-border) para el borde (REQ-17-05)'
  );
  assert.match(
    rule,
    /margin\s*:\s*var\(--gap-card\)\s+0/,
    'la regla no usa var(--gap-card) para el margen vertical (REQ-17-05, Decisión 4)'
  );
});

test('Decisión 4 (design.md): la regla declara display block (sin hueco de línea base)', () => {
  const rule = imageRule(readCss());
  assert.match(
    rule,
    /display\s*:\s*block/,
    'la regla no usa display block (Decisión 4 del design.md)'
  );
});

test('REQ-17-08: la regla de la imagen no introduce colores sueltos (solo tokens)', () => {
  const rule = imageRule(readCss());
  assert.doesNotMatch(
    rule,
    /#[0-9a-fA-F]{3,8}\b/,
    'la regla de la imagen contiene un color hex hardcodeado (REQ-17-08)'
  );
  assert.doesNotMatch(
    rule,
    /rgba?\(/,
    'la regla de la imagen contiene rgb()/rgba() hardcodeado (REQ-17-08)'
  );
});

test('REQ-17-08: latest-articles.css no supera las 100 líneas', () => {
  const lineCount = countLines(readCss());
  assert.ok(
    lineCount <= 100,
    `latest-articles.css tiene ${lineCount} líneas (máximo 100, REQ-17-08)`
  );
});

test('REQ-17-09: tokens.css conserva 91 líneas (post-feature 25 + --radius-thumb de la feature 9, sin tokens nuevos de imagen)', () => {
  const lineCount = countLines(readTokens());
  assert.equal(
    lineCount,
    91,
    `tokens.css tiene ${lineCount} líneas y debe conservar 91 (REQ-17-09; 87 post-feature 25 + 4 del token --radius-thumb aprobado en la feature 9)`
  );
});

test('REQ-17-09: tokens.css no define tokens del grupo aspect ni --radius-image', () => {
  const tokens = readTokens();
  assert.doesNotMatch(
    tokens,
    /--aspect-/,
    'tokens.css define un token del grupo aspect (REQ-17-09)'
  );
  assert.doesNotMatch(
    tokens,
    /--ratio-/,
    'tokens.css define un token del grupo ratio (REQ-17-09)'
  );
  assert.doesNotMatch(
    tokens,
    /--radius-image/,
    'tokens.css define --radius-image (REQ-17-09, alternativa descartada del design.md)'
  );
});

test('Convención: el componente sigue ≤100 líneas, sin lógica y sin estilos embebidos', () => {
  const astro = readComponent();
  const lineCount = astro.split('\n').length;
  assert.ok(
    lineCount <= 100,
    `latest-articles.astro tiene ${lineCount} líneas (máximo 100)`
  );
  assert.doesNotMatch(
    astro,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(/,
    'el componente contiene lógica de negocio en el frontmatter (convención)'
  );
  assert.doesNotMatch(
    astro,
    /\bstyle\s*=/,
    'el componente conserva el atributo style inline (convención)'
  );
  assert.doesNotMatch(
    astro,
    /<style/i,
    'el componente contiene un bloque <style> embebido (convención)'
  );
});
