// Test de la canalización de View Transitions (REQ-24-01..05, feature 24).
//
// Verifica contra specs/24_view-transitions/requirements.md y design.md:
//   REQ-24-01 — el layout único habilita las transiciones de vista: importa
//               ClientRouter de astro:transitions y lo renderiza en la
//               cabecera (<head>).
//   REQ-24-02 — el mecanismo queda canalizado por esta feature (ninguna
//               edición manual fuera del arnés lo modifica); el estado final
//               se verifica aquí por inspección (REQ-24-05).
//   REQ-24-03 — las cards de LatestArticles llevan los pares transition:name
//               del design (Decisión 2): img-${post.id} en la imagen y
//               title-${post.id} en el título. Actualizado por la feature 37
//               (visual-polish-refactor, Decisión 3): el primer h2 del archivo
//               es ahora el encabezado de sección, la aserción localiza la
//               card por h2.latest-articles__title.
//   REQ-24-04 — el design documenta la excepción a "Estático por defecto".
//   REQ-24-05 — el test verifica el estado final por inspección, incluida la
//               resolución de src/pages/posts/[id].astro (adaptada a
//               PostsRepository): la página de detalle declara los mismos
//               pares title-<id>/img-<id> contra el id real de la ruta
//               (entry.id), coherentes por artículo con las cards.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const LAYOUT_PATH = new URL('../src/layouts/Layout.astro', import.meta.url);
const COMPONENT_PATH = new URL('../src/components/latest-articles.astro', import.meta.url);
const PAGE_PATH = new URL('../src/pages/posts/[id].astro', import.meta.url);
const DESIGN_PATH = new URL('../specs/24_view-transitions/design.md', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function readLayout() {
  assert.ok(existsSync(LAYOUT_PATH), 'src/layouts/Layout.astro no existe (REQ-24-01)');
  return readFileSync(LAYOUT_PATH, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_PATH), 'src/components/latest-articles.astro no existe (REQ-24-03)');
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/posts/[id].astro no existe');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readDesign() {
  assert.ok(existsSync(DESIGN_PATH), 'specs/24_view-transitions/design.md no existe (REQ-24-04)');
  return readFileSync(DESIGN_PATH, 'utf8');
}

test('REQ-24-01: el layout importa ClientRouter de astro:transitions', () => {
  const layout = readLayout();
  assert.match(
    layout,
    /import\s*\{[^}]*ClientRouter[^}]*\}\s*from\s*['"]astro:transitions['"]/,
    'Layout.astro no importa ClientRouter de astro:transitions (REQ-24-01)'
  );
});

test('REQ-24-01: ClientRouter se renderiza en la cabecera del layout', () => {
  const layout = readLayout();
  const head = layout.match(/<head>[\s\S]*?<\/head>/) ?? [];
  assert.ok(head.length > 0, 'Layout.astro no tiene cabecera <head> (REQ-24-01)');
  assert.match(head[0], /<ClientRouter\s*\/>/, 'la cabecera no renderiza <ClientRouter /> (REQ-24-01)');
});

test('REQ-24-03: la imagen de la card lleva el par img-${post.id}', () => {
  const astro = readComponent();
  const img = astro.match(/<img[\s\S]*?>/)?.[0] ?? '';
  assert.ok(img.length > 0, 'latest-articles.astro no renderiza <img> (REQ-24-03)');
  assert.match(
    img,
    /transition:name=\{`img-\$\{post\.id\}`\}/,
    'la imagen no lleva transition:name={`img-${post.id}`} (REQ-24-03, design Decisión 2)'
  );
});

test('REQ-24-03: el título de la card lleva el par title-${post.id}', () => {
  const astro = readComponent();
  // Selector preciso (feature 37 visual-polish-refactor, design Decisión 3):
  // el primer <h2> del archivo es ahora el encabezado de sección
  // (h2.latest-articles__heading), así que la aserción localiza la card con
  // su clase latest-articles__title (mismo contrato, selector más preciso).
  const h2 = astro.match(/<h2[^>]*class="latest-articles__title"[^>]*>/)?.[0] ?? '';
  assert.ok(h2.length > 0, 'latest-articles.astro no renderiza <h2 class="latest-articles__title"> (REQ-24-03, feature 37)');
  assert.match(
    h2,
    /transition:name=\{`title-\$\{post\.id\}`\}/,
    'el título no lleva transition:name={`title-${post.id}`} (REQ-24-03, design Decisión 2)'
  );
});

test('REQ-24-04: el design documenta la excepción de JavaScript de runtime', () => {
  const design = readDesign();
  assert.ok(
    design.includes('Estático por defecto'),
    'el design no menciona la regla "Estático por defecto" (REQ-24-04)'
  );
  assert.match(
    design,
    /declarativa|sin escribir JavaScript manual/i,
    'el design no documenta la justificación de la excepción (REQ-24-04)'
  );
});

test('REQ-24-05/Resolución: [id].astro usa PostsRepository y no markdownPostRepository', () => {
  const page = readPage();
  assert.doesNotMatch(
    page,
    /markdownPostRepository/,
    '[id].astro importa la API eliminada markdownPostRepository (REQ-18-05, build roto)'
  );
  assert.match(
    page,
    /posts-repository/,
    '[id].astro no importa el módulo posts-repository'
  );
  assert.match(
    page,
    /PostsRepository/,
    '[id].astro no usa la clase PostsRepository'
  );
});

test('REQ-24-05/Resolución: getStaticPaths genera params con el id real de la ruta', () => {
  const page = readPage();
  assert.match(
    page,
    /getStaticPaths/,
    '[id].astro no declara getStaticPaths'
  );
  assert.match(
    page,
    /params:\s*\{\s*id:\s*entry\.id\s*\}/,
    'los params de la ruta no usan el id real de la colección (entry.id)'
  );
});

test('REQ-24-05/Resolución: la página de detalle declara los pares coherentes con las cards', () => {
  const page = readPage();
  const h1 = page.match(/<h1[\s\S]*?>/)?.[0] ?? '';
  const img = page.match(/<img[\s\S]*?>/)?.[0] ?? '';
  assert.match(
    h1,
    /transition:name=\{`title-\$\{entry\.id\}`\}/,
    'el título de detalle no lleva transition:name={`title-${entry.id}`}'
  );
  assert.match(
    img,
    /transition:name=\{`img-\$\{entry\.id\}`\}/,
    'la imagen de detalle no lleva transition:name={`img-${entry.id}`}'
  );
});

test('REQ-24-05: la página de detalle respeta convenciones (layout, prerender, ≤100 líneas)', () => {
  const page = readPage();
  assert.match(
    page,
    /layouts\/Layout\.astro/,
    'la página no importa el layout único'
  );
  assert.ok(page.includes('<Layout'), 'la página no usa el layout único');
  assert.match(
    page,
    /prerender\s*=\s*true/,
    'la página no declara prerender = true'
  );
  assert.ok(
    countLines(page) <= 100,
    `[id].astro tiene ${countLines(page)} líneas (máximo 100)`
  );
  assert.doesNotMatch(page, /<style/i, 'la página contiene un bloque <style> embebido');
  assert.doesNotMatch(page, /\bstyle\s*=/, 'la página conserva el atributo style inline');
  assert.doesNotMatch(
    page,
    /\breadFileSync\b|new\s+URL\(/,
    'la página lee archivos o URLs de datos directamente'
  );
});
