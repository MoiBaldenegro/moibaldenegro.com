// Tests de la feature 21 related-posts-list (REQ-21-01..07,
// specs/21_related-posts-list/requirements.md + design.md).
//
// Capa de presentación de la lista de recomendados (base: feature 19
// next-post-button, botón Siguiente artículo; feature 20 related-posts-data,
// Post.related con rutas internas /posts/<id> o nulo):
//   REQ-21-01 — WHEN el post declara related, el detalle SHALL mostrar una
//               lista de enlaces con el encabezado Recomendados hacia las
//               rutas de related.
//   REQ-21-02 — WHEN el post omite related, el detalle SHALL omitir la lista.
//   REQ-21-03 — WHEN el post declara next y related, el detalle SHALL mostrar
//               el botón de siguiente junto a la lista.
//   REQ-21-04 — Los enlaces SHALL obtener sus destinos solo desde la entidad
//               Post entregada por PostsRepository (sin leer la colección).
//   REQ-21-05 — post-next.css SHALL estilar la lista solo con tokens.
//   REQ-21-06 — post-next.css SHALL presentar la lista a ancho completo en
//               768 píxeles o menos.
//   REQ-21-07 — La página y post-next.css SHALL respetar 100 líneas cada una.

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
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-21-01)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post-next.css no existe (REQ-21-05)');
  return readFileSync(CSS_PATH, 'utf8');
}

function declaredTokens() {
  const tokens = readFileSync(TOKENS_PATH, 'utf8');
  return new Set([...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
}

test('REQ-21-01: el detalle muestra una lista de enlaces con el encabezado Recomendados hacia related', () => {
  const page = readPage();
  assert.ok(
    page.includes('Recomendados'),
    'la página no muestra el encabezado Recomendados (REQ-21-01)',
  );
  assert.match(
    page,
    /post\.related\.map/,
    'la página no itera sobre post.related para la lista (REQ-21-01)',
  );
  assert.match(
    page,
    /<ul/,
    'la página no renderiza la lista como <ul> (REQ-21-01)',
  );
});

test('REQ-21-02: el detalle omite la lista cuando related es nulo', () => {
  const page = readPage();
  assert.match(
    page,
    /\{post\.related\s*&&\s*\(/,
    'la página no renderiza la lista condicionada a post.related (REQ-21-02)',
  );
});

test('REQ-21-03: el detalle muestra el botón de siguiente junto a la lista cuando hay next y related', () => {
  const page = readPage();
  assert.ok(
    page.includes('Siguiente artículo'),
    'la página perdió el botón Siguiente artículo al añadir la lista (REQ-21-03)',
  );
  assert.ok(
    page.includes('Recomendados'),
    'la página no muestra la lista de Recomendados junto al botón (REQ-21-03)',
  );
  assert.match(
    page,
    /\{post\.next\s*&&\s*\(/,
    'el botón de siguiente ya no se renderiza condicionado a post.next (REQ-21-03)',
  );
  assert.match(
    page,
    /\{post\.related\s*&&\s*\(/,
    'la lista ya no se renderiza condicionada a post.related (REQ-21-03)',
  );
});

test('REQ-21-04: los destinos salen solo de la entidad Post vía PostsRepository', () => {
  const page = readPage();
  assert.ok(
    page.includes('PostsRepository'),
    'la página no obtiene el post vía PostsRepository (REQ-21-04)',
  );
  assert.match(
    page,
    /post\.related\.map/,
    'los destinos de la lista no salen de la entidad Post (REQ-21-04)',
  );
  assert.doesNotMatch(
    page,
    /entry\.data\.related|data\.related/,
    'la lista lee related directo de la colección en lugar de la entidad (REQ-21-04)',
  );
});

test('REQ-21-05: post-next.css estila la lista solo con tokens de tokens.css', () => {
  const css = readCss();
  assert.match(
    css,
    /\.post__related/,
    'post-next.css no declara reglas para la lista (.post__related) (REQ-21-05)',
  );
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(stripped, /#[0-9a-fA-F]{3,8}\b/, 'post-next.css contiene hex hardcodeado (REQ-21-05)');
  assert.doesNotMatch(stripped, /rgba?\(/, 'post-next.css contiene rgb()/rgba() hardcodeado (REQ-21-05)');
  const tokens = declaredTokens();
  for (const match of stripped.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/g)) {
    assert.ok(tokens.has(match[1]), `post-next.css usa var(${match[1]}) no declarado en tokens.css (REQ-21-05)`);
  }
  for (const prop of ['color', 'background', 'background-color', 'border-radius']) {
    for (const decl of stripped.matchAll(new RegExp(`${prop}\\s*:\\s*([^;]+);`, 'g'))) {
      assert.match(decl[1], /var\(--/, `"${prop}" no usa var() de los tokens (REQ-21-05): ${decl[0].trim()}`);
    }
  }
});

test('REQ-21-06: la lista va a ancho completo en 768 píxeles o menos', () => {
  const css = readCss();
  const media = css.match(/@media\s*\(\s*max-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}\s*$/);
  assert.ok(media, 'post-next.css no declara @media (max-width: 768px) (REQ-21-06)');
  assert.match(media[1], /\.post__related/, 'la media query no cubre la lista de recomendados (REQ-21-06)');
  assert.match(media[1], /width\s*:\s*100%/, 'la media query no presenta la lista a ancho completo (REQ-21-06)');
});

test('REQ-21-07: la página y post-next.css no superan las 100 líneas', () => {
  const pageLines = countLines(readPage());
  assert.ok(pageLines <= 100, `[id].astro tiene ${pageLines} líneas (máximo 100, REQ-21-07)`);
  const cssLines = countLines(readCss());
  assert.ok(cssLines <= 100, `post-next.css tiene ${cssLines} líneas (máximo 100, REQ-21-07)`);
});

test('Convención: la página importa post-next.css sin <style> ni JS y post.css queda intacto', () => {
  const page = readPage();
  assert.ok(page.includes('../../styles/post-next.css'), 'la página no importa post-next.css (convención)');
  assert.doesNotMatch(page, /<style/i, 'la página contiene un bloque <style> embebido (convención)');
  assert.doesNotMatch(page, /\bstyle\s*=/, 'la página usa style inline (convención)');
  assert.doesNotMatch(page, /<script/i, 'la página añade JS de runtime (estático por defecto)');
  const postCssLines = countLines(readFileSync(POST_CSS_PATH, 'utf8'));
  assert.equal(postCssLines, 100, `post.css tiene ${postCssLines} líneas y debe conservar 100 intactas (D2 del design)`);
});
