// Tests de la feature 19 next-post-button (REQ-19-01..06,
// specs/19_next-post-button/requirements.md + design.md).
//
// Capa de presentación de la recomendación editorial manual (base: feature 18
// next-post-data, Post.next con ruta interna /posts/<id> o nulo):
//   REQ-19-01 — WHEN el post declara siguiente, el detalle SHALL mostrar un
//               enlace con el texto Siguiente artículo hacia la ruta de next.
//   REQ-19-02 — WHEN el post omite el siguiente, el detalle SHALL omitir el
//               enlace.
//   REQ-19-03 — El enlace SHALL obtener su destino solo desde la entidad Post
//               entregada por PostsRepository (sin leer la colección).
//   REQ-19-04 — post-next.css SHALL estilar el enlace solo con tokens.
//   REQ-19-05 — post-next.css SHALL presentar el enlace a ancho completo en
//               768 píxeles o menos.
//   REQ-19-06 — La página y post-next.css SHALL respetar 100 líneas cada una.

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
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe (REQ-19-01)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/post-next.css no existe (REQ-19-04)');
  return readFileSync(CSS_PATH, 'utf8');
}

function declaredTokens() {
  const tokens = readFileSync(TOKENS_PATH, 'utf8');
  return new Set([...tokens.matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
}

test('REQ-19-01: el detalle muestra un enlace Siguiente artículo hacia la ruta de next', () => {
  const page = readPage();
  assert.ok(
    page.includes('Siguiente artículo'),
    'la página no muestra el texto Siguiente artículo (REQ-19-01)',
  );
  assert.match(
    page,
    /href=\{post\.next\}/,
    'el enlace no apunta a la ruta de next del post (REQ-19-01)',
  );
});

test('REQ-19-02: el detalle omite el enlace cuando next es nulo', () => {
  const page = readPage();
  assert.match(
    page,
    /\{post\.next\s*&&\s*\(/,
    'la página no renderiza el enlace condicionado a post.next (REQ-19-02)',
  );
});

test('REQ-19-03: el destino sale solo de la entidad Post vía PostsRepository', () => {
  const page = readPage();
  assert.ok(
    page.includes('PostsRepository'),
    'la página no obtiene el post vía PostsRepository (REQ-19-03)',
  );
  assert.match(
    page,
    /href=\{post\.next\}/,
    'el destino del enlace no sale de la entidad Post (REQ-19-03)',
  );
  assert.doesNotMatch(
    page,
    /entry\.data\.next|data\.next/,
    'el enlace lee next directo de la colección en lugar de la entidad (REQ-19-03)',
  );
});

test('REQ-19-04: post-next.css estila solo con tokens de tokens.css', () => {
  const css = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b/, 'post-next.css contiene hex hardcodeado (REQ-19-04)');
  assert.doesNotMatch(css, /rgba?\(/, 'post-next.css contiene rgb()/rgba() hardcodeado (REQ-19-04)');
  const tokens = declaredTokens();
  for (const match of css.matchAll(/var\(\s*(--[a-z0-9-]+)\s*\)/g)) {
    assert.ok(tokens.has(match[1]), `post-next.css usa var(${match[1]}) no declarado en tokens.css (REQ-19-04)`);
  }
  for (const prop of ['color', 'background', 'background-color', 'border-radius']) {
    for (const decl of css.matchAll(new RegExp(`${prop}\\s*:\\s*([^;]+);`, 'g'))) {
      assert.match(decl[1], /var\(--/, `"${prop}" no usa var() de los tokens (REQ-19-04): ${decl[0].trim()}`);
    }
  }
});

test('REQ-19-05: el enlace va a ancho completo en 768 píxeles o menos', () => {
  const css = readCss();
  const media = css.match(/@media\s*\(\s*max-width\s*:\s*768px\s*\)\s*\{([\s\S]*)\}\s*$/);
  assert.ok(media, 'post-next.css no declara @media (max-width: 768px) (REQ-19-05)');
  assert.match(media[1], /width\s*:\s*100%/, 'la media query no presenta el enlace a ancho completo (REQ-19-05)');
});

test('REQ-19-06: la página y post-next.css no superan las 100 líneas', () => {
  const pageLines = countLines(readPage());
  assert.ok(pageLines <= 100, `[id].astro tiene ${pageLines} líneas (máximo 100, REQ-19-06)`);
  const cssLines = countLines(readCss());
  assert.ok(cssLines <= 100, `post-next.css tiene ${cssLines} líneas (máximo 100, REQ-19-06)`);
});

test('Convención: la página importa post-next.css sin <style> y post.css queda intacto', () => {
  const page = readPage();
  assert.ok(page.includes('../../styles/post-next.css'), 'la página no importa post-next.css (convención)');
  assert.doesNotMatch(page, /<style/i, 'la página contiene un bloque <style> embebido (convención)');
  assert.doesNotMatch(page, /\bstyle\s*=/, 'la página usa style inline (convención)');
  assert.doesNotMatch(page, /<script/i, 'la página añade JS de runtime (estático por defecto)');
  const postCssLines = countLines(readFileSync(POST_CSS_PATH, 'utf8'));
  assert.equal(postCssLines, 100, `post.css tiene ${postCssLines} líneas y debe conservar 100 intactas (D4 del research)`);
});
