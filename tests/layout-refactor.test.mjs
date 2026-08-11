import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

// Test del layout único (REQ-08-01..06, feature 8 layout-refactor).
//
// Verifica contra specs/08_layout-refactor/requirements.md y design.md:
//   REQ-08-01 — Layout.astro declara lang="es".
//   REQ-08-02 — el layout muestra el título por defecto moibaldenegro.com.
//   REQ-08-03 — el layout acepta un título por página (prop title) con valor
//               por defecto del sitio.
//   REQ-08-04 — sin <style> embebido; los estilos viven en src/styles/layout.css
//               importada desde el layout.
//   REQ-08-05 — la navbar compartida (Home, About, @moibaldenegro) vive en el
//               layout único; new-hero.astro ya no la renderiza y hero-section.css
//               no conserva sus estilos.
//   REQ-08-06 — layout.css respeta el límite de 100 líneas y consume únicamente
//               tokens (sin hex ni rgb()/rgba() hardcodeados).

const LAYOUT_PATH = new URL('../src/layouts/Layout.astro', import.meta.url);
const LAYOUT_CSS_PATH = new URL('../src/styles/layout.css', import.meta.url);
const NEW_HERO_PATH = new URL('../src/components/new-hero/new-hero.astro', import.meta.url);
const HERO_SECTION_CSS_PATH = new URL('../src/styles/hero-section.css', import.meta.url);

// Propiedades cuyo valor debe salir de var() (colores, radios, transiciones).
const COLOR_PROPS = new Set([
  'color',
  'background',
  'background-image',
  'border',
  'border-bottom',
  'border-top',
  'border-left',
  'border-right',
  'border-radius',
  'box-shadow',
  'transition',
]);

function readLayout() {
  assert.ok(
    existsSync(LAYOUT_PATH),
    'src/layouts/Layout.astro no existe'
  );
  return readFileSync(LAYOUT_PATH, 'utf8');
}

function readLayoutCss() {
  assert.ok(
    existsSync(LAYOUT_CSS_PATH),
    'src/styles/layout.css no existe (REQ-08-04/06)'
  );
  return readFileSync(LAYOUT_CSS_PATH, 'utf8');
}

test('REQ-08-01: Layout.astro declara lang="es"', () => {
  assert.match(
    readLayout(),
    /<html\s+lang="es"/,
    'el layout no declara lang="es" (REQ-08-01)'
  );
});

test('REQ-08-02: el layout muestra el título por defecto moibaldenegro.com', () => {
  assert.match(
    readLayout(),
    /<title>\s*\{title\s*\?\?\s*['"]moibaldenegro\.com['"]\}\s*<\/title>/,
    'el <title> no usa el valor por defecto moibaldenegro.com (REQ-08-02)'
  );
});

test('REQ-08-03: el layout acepta un título por página con default del sitio', () => {
  const layout = readLayout();
  assert.match(
    layout,
    /\btitle\??\s*:\s*string/,
    'el layout no declara la prop title (REQ-08-03)'
  );
  assert.ok(
    layout.includes('Astro.props'),
    'el layout no lee las props desde Astro.props (REQ-08-03)'
  );
});

test('REQ-08-04: sin <style> embebido y con layout.css importada', () => {
  const layout = readLayout();
  assert.ok(
    existsSync(LAYOUT_CSS_PATH),
    'src/styles/layout.css no existe (REQ-08-04)'
  );
  assert.match(
    layout,
    /import\s+["'][^"']*layout\.css["']/,
    'el layout no importa src/styles/layout.css (REQ-08-04)'
  );
  assert.doesNotMatch(
    layout,
    /<style/i,
    'el layout contiene un bloque <style> embebido (REQ-08-04)'
  );
});

test('REQ-08-05: la navbar compartida vive en el layout único', () => {
  const layout = readLayout();
  const newHero = readFileSync(NEW_HERO_PATH, 'utf8');
  const heroSectionCss = readFileSync(HERO_SECTION_CSS_PATH, 'utf8');

  // La navbar con sus enlaces se renderiza desde el layout.
  assert.match(
    layout,
    /class="site-navbar"/,
    'el layout no contiene la navbar compartida (REQ-08-05)'
  );
  assert.match(
    layout,
    /href="\/"\s*>Home/,
    'falta el enlace Home en la navbar del layout (REQ-08-05)'
  );
  assert.match(
    layout,
    /href="\/about"\s*>About/,
    'falta el enlace About en la navbar del layout (REQ-08-05)'
  );
  assert.match(
    layout,
    /href="https:\/\/x\.com\/moibaldenegro"\s*>@moibaldenegro/,
    'falta el enlace @moibaldenegro en la navbar del layout (REQ-08-05)'
  );

  // new-hero.astro ya no renderiza la navbar (chrome movido al layout).
  assert.doesNotMatch(
    newHero,
    /x\.com\/moibaldenegro/,
    'new-hero.astro aún renderiza la navbar duplicada (REQ-08-05)'
  );
  assert.doesNotMatch(
    newHero,
    /site-navbar|hero-navbar/,
    'new-hero.astro aún contiene la navbar (REQ-08-05)'
  );

  // Los estilos de la navbar viven en layout.css, no en la hoja del hero.
  assert.match(
    readLayoutCss(),
    /\.site-navbar/,
    'layout.css no contiene los estilos de la navbar (REQ-08-05)'
  );
  assert.doesNotMatch(
    heroSectionCss,
    /\.hero-navbar/,
    'hero-section.css conserva los estilos de la navbar migrada (REQ-08-05)'
  );
});

test('REQ-08-06: layout.css no supera 100 líneas y usa solo tokens', () => {
  const content = readLayoutCss();
  const lineCount = content.split('\n').length;
  assert.ok(
    lineCount <= 100,
    `layout.css tiene ${lineCount} líneas (máximo 100, REQ-08-06)`
  );

  const noComments = content.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    noComments,
    /#[0-9a-fA-F]{3,8}\b/,
    'layout.css contiene un color hex hardcodeado (REQ-08-06)'
  );
  assert.doesNotMatch(
    noComments,
    /rgba?\(/,
    'layout.css contiene rgb()/rgba() hardcodeado (REQ-08-06)'
  );

  // Colores, radios y transiciones salen de var(--...) de los tokens.
  const declaration = /^([a-z-]+)\s*:\s*(.+?);?$/;
  const lines = noComments
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  let checked = 0;
  for (const line of lines) {
    const match = line.match(declaration);
    if (!match) continue; // selectores, @media, llaves
    const prop = match[1].toLowerCase();
    if (!COLOR_PROPS.has(prop)) continue;
    checked += 1;
    assert.match(
      match[2],
      /var\(--/,
      `"${prop}" no usa var() de los tokens (REQ-08-06): ${line}`
    );
  }
  assert.ok(checked > 0, 'no se encontró ninguna declaración de color/radio/transición en layout.css');
});
