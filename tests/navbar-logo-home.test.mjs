// Test de inspección del logo como enlace Home del navbar
// (feature 15 navbar-logo-home, REQ-15-01..07). Patrón de inspección por
// regex sobre Layout.astro y sobre los tests ajustados (precedente de
// remove-navbar-logo.test.mjs REQ-13-01..06 y restore-navbar-home-link.test.mjs
// REQ-12-01..05).
//
// Corrección del humano: «el Logo reemplazaba al Home, el home se va» — el
// ancla del logo ES el enlace Home del navbar (estado 686a7cc) y el enlace de
// texto Home no debe existir.
//
//   REQ-15-01 — el navbar enlaza la portada mediante el ancla del logo, sin
//               enlace de texto Home hacia /.
//   REQ-15-02 — el ancla del logo declara aria-current page para / con
//               degradado a undefined; ningún otro enlace marca la portada.
//   REQ-15-03 — el ancla contiene el img del asset mxvi_logo.webp con alt
//               descriptivo y width 72.
//   REQ-15-04 — el navbar conserva About, Arquitectura, @moibaldenegro y la
//               barra de búsqueda.
//   REQ-15-05 — el asset public/assets/mxvi_logo.webp existe y Layout.astro lo
//               referencia.
//   REQ-15-06 — Layout.astro no supera las 100 líneas.
//   REQ-15-07 — los tests de las features 12/13 y los REQ-08-04/08-05 ajustan
//               sus aserciones al contrato real con justificación documentada
//               (precedente REQ-43-06).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const LAYOUT_URL = new URL('../src/layouts/Layout.astro', import.meta.url);
const ASSET_URL = new URL('../public/assets/mxvi_logo.webp', import.meta.url);
const RESTORE_TEST_URL = new URL(
  '../tests/restore-navbar-home-link.test.mjs',
  import.meta.url,
);
const REMOVE_LOGO_TEST_URL = new URL(
  '../tests/remove-navbar-logo.test.mjs',
  import.meta.url,
);
const ARCH_NAV_TEST_URL = new URL(
  '../tests/architecture-nav-link.test.mjs',
  import.meta.url,
);
const LAYOUT_REFACTOR_TEST_URL = new URL(
  '../tests/layout-refactor.test.mjs',
  import.meta.url,
);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readLayout() {
  assert.ok(existsSync(LAYOUT_URL), 'src/layouts/Layout.astro no existe (REQ-15-01)');
  return readFileSync(LAYOUT_URL, 'utf8');
}

function readNav(layout) {
  return layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
}

function logoAnchor(nav) {
  return nav.match(/<a\b[^>]*href="\/"[^>]*>\s*<img\b[^>]*src="\/assets\/mxvi_logo\.webp"/)?.[0] ?? '';
}

test('REQ-15-01/03: el navbar enlaza la portada con el ancla del logo (img mxvi_logo.webp, alt, width 72) y sin Home de texto', () => {
  const layout = readLayout();
  const nav = readNav(layout);
  assert.ok(nav.length > 0, 'Layout.astro no declara <nav> (REQ-15-01)');
  const anchor = logoAnchor(nav);
  assert.ok(
    anchor.length > 0,
    'el navbar no incluye el ancla del logo hacia / (REQ-15-01)',
  );
  assert.match(
    nav,
    /<img\b[^>]*src="\/assets\/mxvi_logo\.webp"[^>]*alt="[^"]+"[^>]*width="72"/,
    'el ancla del logo no contiene el img del asset con alt descriptivo y width 72 (REQ-15-03)',
  );
  assert.doesNotMatch(
    nav,
    /<a\b[^>]*href="\/"[^>]*>\s*Home\s*<\/a>/,
    'el navbar conserva un enlace de texto Home hacia / (REQ-15-01)',
  );
});

test('REQ-15-02: el ancla del logo declara aria-current de la portada con degradado a undefined y es el único marcador', () => {
  const nav = readNav(readLayout());
  const anchor = logoAnchor(nav);
  assert.ok(anchor.length > 0, 'no se encuentra el ancla del logo (REQ-15-02)');
  assert.match(
    anchor,
    /aria-current=\{Astro\.url\.pathname\s*===\s*['"]\/['"]\s*\?\s*['"]page['"]\s*:\s*undefined\}/,
    'el ancla del logo no declara aria-current de la portada con degradado a undefined (REQ-15-02)',
  );
  const portadaMarkers = [
    ...nav.matchAll(/aria-current=\{Astro\.url\.pathname\s*===\s*['"]\/['"]/g),
  ];
  assert.equal(
    portadaMarkers.length,
    1,
    `ningún otro enlace del navbar debe marcar la portada (REQ-15-02): ${portadaMarkers.length} marcadores`,
  );
});

test('REQ-15-04: el navbar conserva About, Arquitectura, @moibaldenegro y la barra de búsqueda', () => {
  const layout = readLayout();
  const nav = readNav(layout);
  assert.match(
    nav,
    /<a\b[^>]*href="\/about"[^>]*>\s*About\s*<\/a>/,
    'se perdió el enlace About (REQ-15-04)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="\/arquitectura"[^>]*>\s*Arquitectura\s*<\/a>/,
    'se perdió el enlace Arquitectura (REQ-15-04)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="https:\/\/x\.com\/moibaldenegro"[^>]*>\s*@moibaldenegro\s*<\/a>/,
    'se perdió el enlace @moibaldenegro (REQ-15-04)',
  );
  assert.match(
    layout,
    /<SearchBar\s*\/?\s*>/,
    'se perdió la barra de búsqueda (REQ-15-04)',
  );
});

test('REQ-15-05: el asset public/assets/mxvi_logo.webp existe y Layout.astro lo referencia', () => {
  assert.ok(
    existsSync(ASSET_URL),
    'public/assets/mxvi_logo.webp no existe (REQ-15-05)',
  );
  assert.match(
    readLayout(),
    /\/assets\/mxvi_logo\.webp/,
    'Layout.astro no referencia el asset mxvi_logo.webp (REQ-15-05)',
  );
});

test('REQ-15-06: Layout.astro no supera las 100 líneas', () => {
  const lines = countLines(readLayout());
  assert.ok(
    lines <= 100,
    `Layout.astro supera las 100 líneas (${lines}) (REQ-15-06)`,
  );
});

test('REQ-15-07: los tests de las features 12/13 y REQ-08-04/05 ajustan las aserciones al contrato real con justificación', () => {
  const files = [
    [RESTORE_TEST_URL, 'restore-navbar-home-link.test.mjs (feature 12)'],
    [REMOVE_LOGO_TEST_URL, 'remove-navbar-logo.test.mjs (feature 13)'],
    [ARCH_NAV_TEST_URL, 'architecture-nav-link.test.mjs (REQ-08-04)'],
    [LAYOUT_REFACTOR_TEST_URL, 'layout-refactor.test.mjs (REQ-08-05)'],
  ];
  for (const [url, label] of files) {
    const content = readFileSync(url, 'utf8');
    assert.match(
      content,
      /feature 15 navbar-logo-home/,
      `${label} no documenta el ajuste de la feature 15 (REQ-15-07)`,
    );
    assert.match(
      content,
      /REQ-43-06/,
      `${label} no documenta el precedente REQ-43-06 (REQ-15-07)`,
    );
    assert.match(
      content,
      /mxvi_logo/,
      `${label} no aserciona el ancla del logo (REQ-15-07)`,
    );
  }
});