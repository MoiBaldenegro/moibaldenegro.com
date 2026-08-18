// Test del enlace Arquitectura en el navbar (feature 8 architecture-nav-link,
// REQ-08-01..05). Patrón de inspección por regex sobre Layout.astro
// (precedente de visual-polish-refactor.test.mjs REQ-37-03 y
// search-bar-header.test.mjs REQ-04-01).
//
//   REQ-08-01 — el navbar incluye un enlace de texto Arquitectura a /arquitectura.
//   REQ-08-02 — WHEN la ruta activa es /arquitectura o /arquitectura/, el enlace
//               declara aria-current="page" (misma condición que About).
//   REQ-08-03 — WHEN la ruta activa no es /arquitectura ni /arquitectura/, el
//               enlace omite aria-current (ternaria con degradado a undefined).
//   REQ-08-04 — la adición conserva Home, About, @moibaldenegro y la barra.
//   REQ-08-05 — el enlace no añade estilos propios: hereda .site-navbar a y
//               a[aria-current="page"] de layout.css (sin clase/style propios,
//               sin <style> en Layout.astro).

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
  assert.ok(existsSync(LAYOUT_URL), 'src/layouts/Layout.astro no existe (REQ-08-01)');
  return readFileSync(LAYOUT_URL, 'utf8');
}

function readLayoutCss() {
  assert.ok(existsSync(LAYOUT_CSS_URL), 'src/styles/layout.css no existe (REQ-08-05)');
  return readFileSync(LAYOUT_CSS_URL, 'utf8');
}

test('REQ-08-01: el navbar incluye un enlace de texto Arquitectura a /arquitectura', () => {
  const layout = readLayout();
  const nav = layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.ok(nav.length > 0, 'Layout.astro no declara <nav> (REQ-08-01)');
  assert.match(
    nav,
    /<a\b[^>]*href="\/arquitectura"[^>]*>\s*Arquitectura\s*<\/a>/,
    'el navbar no incluye el enlace Arquitectura hacia /arquitectura (REQ-08-01)',
  );
});

test('REQ-08-02/03: el enlace declara aria-current con la misma condición de ruta que About', () => {
  const layout = readLayout();
  const nav = layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
  const archAnchor = nav.match(/<a\b[^>]*href="\/arquitectura"[^>]*>/)?.[0] ?? '';
  assert.ok(archAnchor.length > 0, 'no se encuentra el enlace Arquitectura (REQ-08-02)');

  // Misma forma que About: condición ternaria con degradado a undefined
  // (pathname === ruta || pathname === ruta/ → 'page' : undefined).
  assert.match(
    archAnchor,
    /aria-current=\{Astro\.url\.pathname\s*===\s*['"]\/arquitectura['"]\s*\|\|\s*Astro\.url\.pathname\s*===\s*['"]\/arquitectura\/['"]\s*\?\s*['"]page['"]\s*:\s*undefined\}/,
    'el enlace Arquitectura no declara aria-current para /arquitectura y /arquitectura/ con degradado a undefined (REQ-08-02/03)',
  );

  // Mismo patrón estructural que About (ternaria ? 'page' : undefined).
  const aboutAnchor = nav.match(/<a\b[^>]*href="\/about"[^>]*>/)?.[0] ?? '';
  const archAria = archAnchor.match(/aria-current=\{([^}]+)\}/)?.[1] ?? '';
  const aboutAria = aboutAnchor.match(/aria-current=\{([^}]+)\}/)?.[1] ?? '';
  assert.ok(aboutAria.length > 0, 'el enlace About no declara aria-current (REQ-08-02)');
  assert.match(
    aboutAria,
    /\?\s*['"]page['"]\s*:\s*undefined$/,
    'el enlace About no usa el patrón de degradado ? page : undefined (REQ-08-02)',
  );
  assert.match(
    archAria,
    /\?\s*['"]page['"]\s*:\s*undefined$/,
    'el enlace Arquitectura no usa el mismo patrón de degradado que About (REQ-08-02)',
  );
});

test('REQ-08-04: se conservan Home, About, @moibaldenegro y la barra de búsqueda', () => {
  const layout = readLayout();
  const nav = layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(
    nav,
    /<a\b[^>]*href="\/"[^>]*>\s*Home\s*<\/a>/,
    'el enlace Home se perdió al añadir Arquitectura (REQ-08-04)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="\/about"[^>]*>\s*About\s*<\/a>/,
    'el enlace About se perdió al añadir Arquitectura (REQ-08-04)',
  );
  assert.match(
    nav,
    /<a\b[^>]*href="https:\/\/x\.com\/moibaldenegro"[^>]*>\s*@moibaldenegro\s*<\/a>/,
    'el enlace externo @moibaldenegro se perdió al añadir Arquitectura (REQ-08-04)',
  );
  assert.match(
    layout,
    /<SearchBar\s*\/?\s*>/,
    'la barra de búsqueda se perdió al añadir Arquitectura (REQ-08-04)',
  );
});

test('REQ-08-05: el enlace no añade estilos propios y hereda el navbar existente', () => {
  const layout = readLayout();
  const nav = layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
  const archAnchor = nav.match(/<a\b[^>]*href="\/arquitectura"[^>]*>/)?.[0] ?? '';
  assert.ok(archAnchor.length > 0, 'no se encuentra el enlace Arquitectura (REQ-08-05)');
  assert.doesNotMatch(
    archAnchor,
    /\bclass=/,
    'el enlace Arquitectura define una clase propia en lugar de heredar (REQ-08-05)',
  );
  assert.doesNotMatch(
    archAnchor,
    /\bstyle=/,
    'el enlace Arquitectura define estilos inline en lugar de heredar (REQ-08-05)',
  );
  assert.doesNotMatch(
    layout,
    /<style/,
    'Layout.astro contiene <style> nuevo en lugar de heredar layout.css (REQ-08-05)',
  );
  const css = readLayoutCss();
  assert.match(
    css,
    /a\[aria-current="page"\]/,
    'layout.css no estiliza el estado activo que el enlace debe heredar (REQ-08-05)',
  );
});

test('REQ-08 (design): Layout.astro no supera las 100 líneas', () => {
  const layout = readLayout();
  const lines = countLines(layout);
  assert.ok(
    lines <= 100,
    `Layout.astro supera las 100 líneas (${lines}) tras añadir el enlace (design.md, restricción ≤100 líneas)`,
  );
});
