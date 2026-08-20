// Test de inspección del ancla del logo como enlace de la portada
// (feature 13 remove-navbar-logo, REQ-13-01..06; aserciones invertidas por la
// feature 15 navbar-logo-home). Patrón de inspección por regex sobre
// Layout.astro y sobre tests/restore-navbar-home-link.test.mjs (precedente de
// restore-navbar-home-link.test.mjs REQ-12-01..05 y de
// client-init-on-navigation.test.mjs REQ-10-08).
//
// Corrección del humano tras la feature 13: «el Logo reemplazaba al Home, el
// home se va» — el ancla del logo ES el enlace Home del navbar (estado
// 686a7cc) y el enlace de texto Home no debe existir. La feature 15
// navbar-logo-home invierte la dirección de la 13; estas aserciones se
// actualizan al contrato real (precedente REQ-43-06: los tests siguen a la
// presentación real confirmada por el humano).
//
//   REQ-13-01 (invertido por REQ-15-01/03) — el navbar enlaza la portada
//               mediante el ancla del logo (img del asset) y no contiene el
//               enlace de texto Home.
//   REQ-13-02 (invertido por REQ-15-02) — el ancla del logo declara
//               aria-current de la portada con degradado a undefined; ningún
//               otro enlace marca la portada.
//   REQ-13-03 — la retirada conserva About, Arquitectura, @moibaldenegro y
//               la barra de búsqueda.
//   REQ-13-04 — Layout.astro no supera las 100 líneas tras el cambio.
//   REQ-13-05 — restore-navbar-home-link.test.mjs ajusta REQ-12-03/04 al
//               contrato real (logo como portada; sin Home de texto) con la
//               justificación del ajuste en el encabezado (precedente
//               REQ-43-06).
//   REQ-13-06 (invertido por REQ-15-05) — Layout.astro referencia el asset
//               mxvi_logo.webp; el asset público se conserva.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const LAYOUT_URL = new URL('../src/layouts/Layout.astro', import.meta.url);
const RESTORE_TEST_URL = new URL(
  '../tests/restore-navbar-home-link.test.mjs',
  import.meta.url,
);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function read(url) {
  assert.ok(existsSync(url), `${url} no existe`);
  return readFileSync(url, 'utf8');
}

function readNav(layout) {
  return layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
}

function logoAnchor(nav) {
  return nav.match(/<a\b[^>]*href="\/"[^>]*>\s*<img\b[^>]*src="\/assets\/mxvi_logo\.webp"/)?.[0] ?? '';
}

test('REQ-13-01/03: el navbar conserva el ancla del logo (portada), About, Arquitectura, @moibaldenegro y la barra sin Home de texto', () => {
  const layout = read(LAYOUT_URL);
  const nav = readNav(layout);
  assert.ok(nav.length > 0, 'Layout.astro no declara <nav> (REQ-13-01)');
  const anchor = logoAnchor(nav);
  assert.ok(
    anchor.length > 0,
    'el navbar no incluye el ancla del logo hacia / (REQ-13-01)',
  );
  assert.doesNotMatch(
    nav,
    /<a\b[^>]*href="\/"[^>]*>\s*Home\s*<\/a>/,
    'el navbar conserva el enlace de texto Home (REQ-13-01)',
  );
  const homeIndex = nav.indexOf(anchor);
  const aboutIndex = nav.indexOf('href="/about"');
  assert.ok(
    homeIndex >= 0 && aboutIndex > homeIndex,
    'el ancla del logo no precede a About en el navbar (REQ-13-03)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="\/about"[^>]*>\s*About\s*<\/a>/,
    'se perdió el enlace About (REQ-13-03)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="\/arquitectura"[^>]*>\s*Arquitectura\s*<\/a>/,
    'se perdió el enlace Arquitectura (REQ-13-03)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="https:\/\/x\.com\/moibaldenegro"[^>]*>\s*@moibaldenegro\s*<\/a>/,
    'se perdió el enlace @moibaldenegro (REQ-13-03)',
  );
  assert.match(
    layout,
    /<SearchBar\s*\/?\s*>/,
    'se perdió la barra de búsqueda (REQ-13-03)',
  );
});

test('REQ-13-02: el ancla del logo declara el aria-current de la portada; ningún otro enlace la marca', () => {
  const nav = readNav(read(LAYOUT_URL));
  const anchor = logoAnchor(nav);
  assert.ok(anchor.length > 0, 'no se encuentra el ancla del logo (REQ-13-02)');
  assert.match(
    anchor,
    /aria-current=\{Astro\.url\.pathname\s*===\s*['"]\/['"]\s*\?\s*['"]page['"]\s*:\s*undefined\}/,
    'el ancla del logo no declara aria-current de la portada con degradado a undefined (REQ-13-02)',
  );
  const portadaMarkers = [
    ...nav.matchAll(/aria-current=\{Astro\.url\.pathname\s*===\s*['"]\/['"]/g),
  ];
  assert.equal(
    portadaMarkers.length,
    1,
    `ningún otro enlace del navbar debe marcar la portada (REQ-13-02): ${portadaMarkers.length} marcadores`,
  );
});

test('REQ-13-04: Layout.astro no supera las 100 líneas tras el cambio', () => {
  const layout = read(LAYOUT_URL);
  const lines = countLines(layout);
  assert.ok(
    lines <= 100,
    `Layout.astro supera las 100 líneas (${lines}) (REQ-13-04)`,
  );
});

test('REQ-13-05: restore-navbar-home-link.test.mjs ajusta REQ-12-03/04 con justificación en el encabezado', () => {
  const content = read(RESTORE_TEST_URL);
  assert.match(
    content,
    /feature 15 navbar-logo-home/,
    'el encabezado no documenta el ajuste de la feature 15 (REQ-13-05)',
  );
  assert.match(
    content,
    /REQ-43-06/,
    'el encabezado no documenta el precedente REQ-43-06 (REQ-13-05)',
  );
  assert.match(
    content,
    /con el ancla del logo/,
    'REQ-12-03 no aserciona la presencia del ancla del logo (REQ-13-05)',
  );
  assert.match(
    content,
    /aria-current de la portada; no existe enlace de texto Home/,
    'REQ-12-04 no aserciona el aria-current de la portada en el ancla del logo (REQ-13-05)',
  );
  assert.doesNotMatch(
    content,
    /el navbar conserva el ancla del logo tras la retirada/,
    'REQ-12-03 conserva la aserción de la retirada del logo (REQ-13-05)',
  );
});

test('REQ-13-06 (invertido por REQ-15-05): Layout.astro referencia el asset mxvi_logo.webp', () => {
  assert.match(
    read(LAYOUT_URL),
    /\/assets\/mxvi_logo\.webp/,
    'Layout.astro no referencia el asset mxvi_logo.webp (REQ-13-06 invertido)',
  );
});