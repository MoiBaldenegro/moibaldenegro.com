// Test de inspección del enlace de la portada en el navbar
// (feature 12 restore-navbar-home-link, REQ-12-01..06). Patrón de inspección
// por regex sobre Layout.astro (precedente de architecture-nav-link.test.mjs
// REQ-08-04/05 y layout-refactor.test.mjs REQ-08-05).
//
//   REQ-12-01 — el navbar enlaza la portada mediante el ancla del logo con
//               destino /.
//   REQ-12-02 — el enlace de la portada hereda los estilos del navbar
//               existente: sin clase ni style propios, sin <style> en
//               Layout.astro.
//   REQ-12-03 — la restauración conserva About, Arquitectura, @moibaldenegro
//               y la barra de búsqueda.
//   REQ-12-04 — el ancla del logo declara aria-current="page" para la portada.
//   REQ-12-05 — Layout.astro no supera las 100 líneas tras la restauración.
//
// Ajustado por la feature 13 remove-navbar-logo (REQ-13-01/03): el ancla del
// logo quedó RETIRADA y la aserción pasó a exigir el Home de texto.
// Ajustado de nuevo por la feature 15 navbar-logo-home (REQ-15-01/02/03): la
// corrección del humano («el Logo reemplazaba al Home, el home se va»)
// invierte la dirección de la 13 — el enlace de la portada vuelve a ser el
// ancla del logo y el enlace de texto Home queda retirado del navbar.
// Justificación del ajuste: precedente REQ-43-06 (el test de inspección sigue
// a la presentación real confirmada por el humano).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const LAYOUT_URL = new URL('../src/layouts/Layout.astro', import.meta.url);
const LAYOUT_CSS_URL = new URL('../src/styles/layout.css', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readLayout() {
  assert.ok(existsSync(LAYOUT_URL), 'src/layouts/Layout.astro no existe (REQ-12-01)');
  return readFileSync(LAYOUT_URL, 'utf8');
}

function readLayoutCss() {
  assert.ok(existsSync(LAYOUT_CSS_URL), 'src/styles/layout.css no existe (REQ-12-02)');
  return readFileSync(LAYOUT_CSS_URL, 'utf8');
}

function readNav(layout) {
  return layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
}

function logoAnchor(nav) {
  return nav.match(/<a\b[^>]*href="\/"[^>]*>\s*<img\b[^>]*src="\/assets\/mxvi_logo\.webp"/)?.[0] ?? '';
}

test('REQ-12-01: el navbar enlaza la portada con el ancla del logo (destino /) antes de About', () => {
  const layout = readLayout();
  const nav = readNav(layout);
  assert.ok(nav.length > 0, 'Layout.astro no declara <nav> (REQ-12-01)');
  const anchor = logoAnchor(nav);
  assert.ok(
    anchor.length > 0,
    'el navbar no incluye el ancla del logo hacia / (REQ-12-01)',
  );
  // Orden del navbar (design.md Decisión 3): Home (logo) → About → Arquitectura.
  const homeIndex = nav.indexOf(anchor);
  const aboutIndex = nav.indexOf('href="/about"');
  assert.ok(
    homeIndex >= 0 && aboutIndex > homeIndex,
    'el ancla del logo no precede a About en el navbar (design.md D3)',
  );
});

test('REQ-12-02: el enlace de la portada no define clase ni estilo propios y hereda los estilos del navbar', () => {
  const layout = readLayout();
  const nav = readNav(layout);
  const anchor = logoAnchor(nav);
  assert.ok(anchor.length > 0, 'no se encuentra el ancla del logo (REQ-12-02)');
  assert.doesNotMatch(
    anchor,
    /\bclass=/,
    'el enlace de la portada define una clase propia en lugar de heredar (REQ-12-02)',
  );
  assert.doesNotMatch(
    anchor,
    /\bstyle=/,
    'el enlace de la portada define estilos inline en lugar de heredar (REQ-12-02)',
  );
  assert.doesNotMatch(
    layout,
    /<style/,
    'Layout.astro contiene <style> en lugar de heredar layout.css (REQ-12-02)',
  );
  const css = readLayoutCss();
  assert.match(
    css,
    /\.site-navbar/,
    'layout.css no estiliza la navbar que el enlace debe heredar (REQ-12-02)',
  );
  assert.match(
    css,
    /a\[aria-current="page"\]/,
    'layout.css no estiliza el estado activo que el enlace hereda (REQ-12-02)',
  );
});

test('REQ-12-03: la navbar conserva About, Arquitectura, @moibaldenegro y la barra con el ancla del logo', () => {
  const layout = readLayout();
  const nav = readNav(layout);
  assert.match(
    nav,
    /<img\b[^>]*src="\/assets\/mxvi_logo\.webp"/,
    'el navbar no conserva el ancla del logo (REQ-12-03)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="\/about"[^>]*>\s*About\s*<\/a>/,
    'se perdió el enlace About (REQ-12-03)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="\/arquitectura"[^>]*>\s*Arquitectura\s*<\/a>/,
    'se perdió el enlace Arquitectura (REQ-12-03)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="https:\/\/x\.com\/moibaldenegro"[^>]*>\s*@moibaldenegro\s*<\/a>/,
    'se perdió el enlace @moibaldenegro (REQ-12-03)',
  );
  assert.match(
    layout,
    /<SearchBar\s*\/?\s*>/,
    'se perdió la barra de búsqueda (REQ-12-03)',
  );
  assert.doesNotMatch(
    nav,
    /<a\b[^>]*href="\/"[^>]*>\s*Home\s*<\/a>/,
    'el navbar conserva el enlace de texto Home (REQ-12-03)',
  );
});

test('REQ-12-04: el ancla del logo declara aria-current de la portada; no existe enlace de texto Home', () => {
  const layout = readLayout();
  const nav = readNav(layout);
  const anchor = logoAnchor(nav);
  assert.ok(anchor.length > 0, 'no se encuentra el ancla del logo (REQ-12-04)');
  assert.match(
    anchor,
    /aria-current=\{Astro\.url\.pathname\s*===\s*['"]\/['"]\s*\?\s*['"]page['"]\s*:\s*undefined\}/,
    'el ancla del logo no declara el aria-current de la portada (REQ-12-04)',
  );
  assert.doesNotMatch(
    nav,
    /<a\b[^>]*href="\/"[^>]*>\s*Home\s*<\/a>/,
    'el navbar conserva el enlace de texto Home (REQ-12-04)',
  );
});

test('REQ-12-05: Layout.astro no supera las 100 líneas tras la restauración', () => {
  const layout = readLayout();
  const lines = countLines(layout);
  assert.ok(
    lines <= 100,
    `Layout.astro supera las 100 líneas (${lines}) tras restaurar el enlace (REQ-12-05)`,
  );
});