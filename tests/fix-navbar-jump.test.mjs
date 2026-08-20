// Test de la reserva del hueco del scrollbar (feature 14 fix-navbar-jump).
//
// Verifica contra specs/14_fix-navbar-jump/requirements.md y design.md:
//   REQ-14-01 — el html del sitio reserva el hueco del scrollbar vertical con
//               la propiedad scrollbar-gutter stable (páginas de alturas
//               distintas).
//   REQ-14-02 — el ancho del viewport permanece estable al navegar entre
//               páginas mediante el navbar (mecanismo: reserva del hueco).
//   REQ-14-03 — layout.css declara la reserva en el selector html, respetando
//               el límite de 100 líneas y el uso exclusivo de tokens
//               (REQ-08-06 ya cubre lo global; aquí se reafirma tras la regla).
//   REQ-14-04 — layout.css conserva las reglas ::-webkit-scrollbar existentes
//               (width 10px, thumb y track con tokens); navegadores sin
//               scrollbar-gutter conservan el comportamiento actual.
//   REQ-14-05 — la reserva se implementa solo con CSS en layout.css, sin
//               scripts ni módulos de cliente nuevos (estático por defecto).
//
// Decisión del design.md: D1 `html { scrollbar-gutter: stable; }`; alternativa
// descartada `html { overflow-y: scroll }` (regresión estética + no-op con
// overlay scrollbars de macOS) — el test la vigila.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const LAYOUT_CSS_PATH = new URL('../src/styles/layout.css', import.meta.url);
const SRC_PATH = new URL('../src/', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía de un
// archivo que termina en salto de línea).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readLayoutCss() {
  assert.ok(
    existsSync(LAYOUT_CSS_PATH),
    'src/styles/layout.css no existe (REQ-14-03)'
  );
  return readFileSync(LAYOUT_CSS_PATH, 'utf8');
}

// Extrae el bloque de declaraciones de la regla html { ... } (no confundir
// con `html, body { ... }` del reset global).
function htmlRule(css) {
  const match = css.match(/(?:^|\n)html\s*\{([\s\S]*?)\}/);
  assert.ok(match, 'layout.css no declara la regla html { } (REQ-14-01/03)');
  return match[1];
}

// Lista los archivos de src/ de forma recursiva (node stdlib).
function listFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    // dir siempre termina en "/" para que la resolución relativa sea correcta.
    const full = entry.isDirectory()
      ? new URL(`${entry.name}/`, dir)
      : new URL(entry.name, dir);
    if (entry.isDirectory()) {
      files.push(...listFiles(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

test('REQ-14-01/02: layout.css declara scrollbar-gutter stable en el selector html', () => {
  const rule = htmlRule(readLayoutCss());
  assert.match(
    rule,
    /scrollbar-gutter\s*:\s*stable/,
    'la regla html no declara scrollbar-gutter: stable (REQ-14-01/02)'
  );
});

test('REQ-14-01/design.md: la reserva no usa la alternativa descartada overflow-y: scroll', () => {
  const rule = htmlRule(readLayoutCss());
  assert.doesNotMatch(
    rule,
    /overflow-y\s*:\s*scroll/,
    'la regla html usa overflow-y: scroll, alternativa descartada en el design.md (D1)'
  );
});

test('REQ-14-03: layout.css no supera las 100 líneas tras la regla', () => {
  const lineCount = countLines(readLayoutCss());
  assert.ok(
    lineCount <= 100,
    `layout.css tiene ${lineCount} líneas (máximo 100, REQ-14-03/REQ-08-06)`
  );
});

test('REQ-14-03: layout.css conserva el uso exclusivo de tokens tras la regla', () => {
  const noComments = readLayoutCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    noComments,
    /#[0-9a-fA-F]{3,8}\b/,
    'layout.css contiene un color hex hardcodeado (REQ-14-03/REQ-08-06)'
  );
  assert.doesNotMatch(
    noComments,
    /rgba?\(/,
    'layout.css contiene rgb()/rgba() hardcodeado (REQ-14-03/REQ-08-06)'
  );
  // La reserva del hueco es propiedad de layout (no color/radio/transición):
  // no introduce valores sueltos de los grupos tokenizables.
  const rule = htmlRule(readLayoutCss());
  assert.doesNotMatch(
    rule,
    /(?:color|background|border|border-radius|box-shadow|transition)\s*:/,
    'la regla html introduce valores de color/radio/borde/transición sin token (REQ-14-03)'
  );
});

test('REQ-14-04: layout.css conserva las reglas ::-webkit-scrollbar existentes', () => {
  const css = readLayoutCss();
  assert.match(
    css,
    /::-webkit-scrollbar\s*\{[^}]*width\s*:\s*10px/,
    'se perdió la regla ::-webkit-scrollbar { width: 10px } (REQ-14-04)'
  );
  assert.match(
    css,
    /::-webkit-scrollbar-thumb\s*\{[^}]*var\(--color-scrollbar-thumb\)/,
    'se perdió el thumb del scrollbar con token (REQ-14-04)'
  );
  assert.match(
    css,
    /::-webkit-scrollbar-track\s*\{[^}]*var\(--color-scrollbar-track\)/,
    'se perdió el track del scrollbar con token (REQ-14-04)'
  );
});

test('REQ-14-05: la reserva del hueco vive solo en layout.css, sin scripts ni módulos de cliente', () => {
  const matches = [];
  for (const file of listFiles(SRC_PATH)) {
    const content = readFileSync(file, 'utf8');
    if (content.includes('scrollbar-gutter')) {
      matches.push(file.pathname.replace(SRC_PATH.pathname, 'src/'));
    }
  }
  assert.deepEqual(
    matches,
    ['src/styles/layout.css'],
    `scrollbar-gutter aparece en archivos fuera de layout.css (REQ-14-05): ${matches.join(', ')}`
  );
});