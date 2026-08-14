import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Test del pulido estético y refactor de presentación (REQ-37-01..08,
// feature 37 visual-polish-refactor).
//
// Verifica contra specs/37_visual-polish-refactor/requirements.md y design.md:
//   REQ-37-01 — el marcado del hero elimina los contenedores sin estilos
//               (.hero-noise y .hero-flower, hallazgo A1 del ciclo 30).
//   REQ-37-02 — la tarjeta del hero no renderiza un enlace con href vacío
//               (el icono queda como div, design Decisión 2).
//   REQ-37-03 — la navbar del layout marca la página actual con
//               aria-current="page" comparando Astro.url.pathname (Decisión 1);
//               el viewport declara initial-scale=1 (design item 3).
//   REQ-37-04 — layout.css declara :focus-visible con tokens (Decisión 2).
//   REQ-37-05 — ningún .astro del sitio usa tabs de indentación.
//   REQ-37-06 — la sección de artículos muestra el encabezado «Últimos
//               artículos» (h2.latest-articles__heading, Decisión 3) estilado
//               con tokens.
//   REQ-37-07 — la sección de estadísticas conserva espaciado vertical con
//               token (margin-block).
//   REQ-37-08 — los archivos modificados no superan 100 líneas ni contienen
//               valores de color sueltos.

const NEW_HERO_PATH = new URL('../src/components/new-hero/new-hero.astro', import.meta.url);
const HERO_CARD_PATH = new URL('../src/components/hero-card.astro', import.meta.url);
const LAYOUT_PATH = new URL('../src/layouts/Layout.astro', import.meta.url);
const LAYOUT_CSS_PATH = new URL('../src/styles/layout.css', import.meta.url);
const HTB_ASTRO_PATH = new URL('../src/components/htb-stadistics.astro', import.meta.url);
const HTB_CSS_PATH = new URL('../src/styles/htb-stadistics.css', import.meta.url);
const ARTICLES_PATH = new URL('../src/components/latest-articles.astro', import.meta.url);
const ARTICLES_CSS_PATH = new URL('../src/styles/latest-articles.css', import.meta.url);
const SRC_ROOT = new URL('../src/', import.meta.url);

// Número de líneas al estilo wc -l (sin contar la última línea vacía).
function countLines(content) {
  const lines = content.split('\n');
  return content.endsWith('\n') ? lines.length - 1 : lines.length;
}

function read(url, label) {
  assert.ok(existsSync(url), `${label} no existe`);
  return readFileSync(url, 'utf8');
}

function filesUnder(dirPath) {
  const result = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      result.push(...filesUnder(fullPath));
    } else if (entry.isFile()) {
      result.push(fullPath);
    }
  }
  return result;
}

test('REQ-37-01: new-hero.astro no contiene los contenedores muertos del fondo', () => {
  const astro = read(NEW_HERO_PATH, 'src/components/new-hero/new-hero.astro');
  assert.doesNotMatch(
    astro,
    /hero-noise/,
    'new-hero.astro sigue renderizando el contenedor .hero-noise (REQ-37-01)'
  );
  assert.doesNotMatch(
    astro,
    /hero-flower/,
    'new-hero.astro sigue renderizando el contenedor .hero-flower (REQ-37-01)'
  );
});

test('REQ-37-02: hero-card.astro no renderiza un enlace con href vacío', () => {
  const astro = read(HERO_CARD_PATH, 'src/components/hero-card.astro');
  assert.doesNotMatch(
    astro,
    /<a\s+href=["']\s*["']/,
    'hero-card.astro conserva un <a href=""> vacío (REQ-37-02)'
  );
  assert.doesNotMatch(
    astro,
    /<a\b/,
    'hero-card.astro conserva un ancla sin destino (REQ-37-02, design: el icono queda como div)'
  );
});

test('REQ-37-03: la navbar marca con aria-current el enlace de la página actual', () => {
  const layout = read(LAYOUT_PATH, 'src/layouts/Layout.astro');
  const nav = layout.match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.ok(nav.length > 0, 'Layout.astro no declara <nav> (REQ-37-03)');
  const paths = [...nav.matchAll(/Astro\.url\.pathname\s*===\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
  assert.ok(
    paths.includes('/') && paths.includes('/about'),
    `la navbar no compara la ruta actual con las de Home y About (REQ-37-03, Decisión 1): ${paths.join(', ')}`
  );
  const aria = [...nav.matchAll(/aria-current=\{Astro\.url\.pathname[^}]*\}/g)];
  assert.ok(
    aria.length >= 2,
    `la navbar no aplica aria-current a los enlaces internos (REQ-37-03): ${aria.length} encontrados`
  );
  assert.match(
    nav,
    /['"]page['"]\s*:\s*undefined/,
    'aria-current no degrada a undefined fuera de la página actual (REQ-37-03)'
  );
});

test('REQ-37-03 (design): el viewport declara initial-scale=1', () => {
  const layout = read(LAYOUT_PATH, 'src/layouts/Layout.astro');
  assert.match(
    layout,
    /<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1"\s*\/?>/,
    'el viewport no declara initial-scale=1 (REQ-37-03, design item 3)'
  );
});

test('REQ-37-04: layout.css declara estados de foco visible con tokens', () => {
  const css = read(LAYOUT_CSS_PATH, 'src/styles/layout.css');
  assert.match(
    css,
    /:focus-visible\s*\{/,
    'layout.css no declara estados :focus-visible (REQ-37-04)'
  );
  assert.match(
    css,
    /outline\s*:\s*2px\s+solid\s+var\(--color-accent\)/,
    'el anillo de foco no usa 2px solid var(--color-accent) (REQ-37-04, Decisión 2)'
  );
  assert.match(
    css,
    /outline-offset\s*:\s*2px/,
    'el foco visible no declara outline-offset (REQ-37-04, Decisión 2)'
  );
});

test('REQ-37-05: ningún .astro del sitio contiene tabs de indentación', () => {
  const offenders = [];
  for (const fullPath of filesUnder(fileURLToPath(SRC_ROOT))) {
    if (!fullPath.endsWith('.astro')) continue;
    const content = readFileSync(fullPath, 'utf8');
    if (/\t/.test(content)) {
      offenders.push(fullPath.replace(/\\/g, '/').replace(/^.*?src\//, 'src/'));
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `hay archivos .astro con tabs de indentación (REQ-37-05): ${offenders.join(', ')}`
  );
});

test('REQ-37-06: la sección de artículos muestra el encabezado «Últimos artículos»', () => {
  const astro = read(ARTICLES_PATH, 'src/components/latest-articles.astro');
  const heading = astro.match(/<h2\s+class="latest-articles__heading"\s*>\s*Últimos artículos\s*<\/h2>/);
  assert.ok(
    heading,
    'latest-articles.astro no renderiza <h2 class="latest-articles__heading">Últimos artículos</h2> (REQ-37-06)'
  );
  const headingPos = astro.indexOf('latest-articles__heading');
  const firstCardPos = astro.indexOf('<article');
  assert.ok(
    headingPos !== -1 && firstCardPos !== -1 && headingPos < firstCardPos,
    'el encabezado de sección no precede a las cards (REQ-37-06, Decisión 3)'
  );
});

test('REQ-37-06: latest-articles.css estila el encabezado con tokens', () => {
  const css = read(ARTICLES_CSS_PATH, 'src/styles/latest-articles.css');
  const rule = css.match(/\.latest-articles__heading\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.ok(rule.length > 0, 'latest-articles.css no declara .latest-articles__heading (REQ-37-06)');
  assert.match(
    rule,
    /color\s*:\s*var\(--color-text\)/,
    'el color del encabezado no sale de --color-text (REQ-37-06)'
  );
  assert.match(
    rule,
    /var\(--gap-card\)/,
    'el espaciado del encabezado no usa --gap-card (REQ-37-06)'
  );
});

test('REQ-37-07: la sección de estadísticas conserva espaciado vertical con token', () => {
  const css = read(HTB_CSS_PATH, 'src/styles/htb-stadistics.css');
  const rule = css.match(/\.htb-stadistics\s*\{([\s\S]*?)\}/)?.[1] ?? '';
  assert.ok(rule.length > 0, 'htb-stadistics.css no declara .htb-stadistics (REQ-37-07)');
  assert.match(
    rule,
    /margin-block\s*:\s*var\(--gap-card\)/,
    'la tarjeta HTB no tiene margen vertical con token (REQ-37-07)'
  );
});

test('REQ-37-08: los archivos modificados no superan las 100 líneas', () => {
  const files = [
    [NEW_HERO_PATH, 'new-hero.astro'],
    [HERO_CARD_PATH, 'hero-card.astro'],
    [LAYOUT_PATH, 'Layout.astro'],
    [LAYOUT_CSS_PATH, 'layout.css'],
    [HTB_ASTRO_PATH, 'htb-stadistics.astro'],
    [HTB_CSS_PATH, 'htb-stadistics.css'],
    [ARTICLES_PATH, 'latest-articles.astro'],
    [ARTICLES_CSS_PATH, 'latest-articles.css'],
  ];
  for (const [url, label] of files) {
    const lineCount = countLines(read(url, label));
    assert.ok(
      lineCount <= 100,
      `${label} tiene ${lineCount} líneas (máximo 100, REQ-37-08)`
    );
  }
});

test('REQ-37-08: las hojas modificadas no contienen valores de color sueltos', () => {
  const hojas = [
    [LAYOUT_CSS_PATH, 'layout.css'],
    [HTB_CSS_PATH, 'htb-stadistics.css'],
    [ARTICLES_CSS_PATH, 'latest-articles.css'],
  ];
  for (const [url, label] of hojas) {
    const content = read(url, label).replace(/\/\*[\s\S]*?\*\//g, '');
    assert.doesNotMatch(
      content,
      /#[0-9a-fA-F]{3,8}\b/,
      `${label} contiene un color hex hardcodeado (REQ-37-08)`
    );
    assert.doesNotMatch(
      content,
      /rgba?\(/,
      `${label} contiene rgb()/rgba() hardcodeado (REQ-37-08)`
    );
  }
});
