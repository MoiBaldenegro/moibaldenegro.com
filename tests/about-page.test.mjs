import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

// Test de la página /about (REQ-11-01..05, feature 11 about-page).
//
// Verifica contra specs/11_about-page/requirements.md y design.md:
//   REQ-11-01 — src/pages/about.astro existe (la navbar enlaza /about y hoy da 404).
//   REQ-11-02 — la página usa el layout único del sitio con su propio título
//               (Decisión 2: "About — moibaldenegro.com").
//   REQ-11-03 — el perfil (name, username, description) se obtiene de
//               HeroProfileRepository sin leer datos ni lógica en la UI
//               (Decisión 1: sin inventar contenido).
//   REQ-11-04 — src/styles/about.css existe, la importa la página, no supera
//               100 líneas, no tiene hex/rgb()/rgba() sueltos, usa var() en
//               colores/radios/bordes y consume los 8 tokens de la tabla del
//               design.md.
//   REQ-11-05 — si el build no genera la ruta /about, este test falla: ejecuta
//               un build real y comprueba dist/about/index.html con los datos
//               reales del perfil (src/data/hero.json).

const PAGE_PATH = new URL('../src/pages/about.astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/about.css', import.meta.url);
const PROFILE_JSON = new URL('../src/data/hero.json', import.meta.url);
const DIST_ABOUT_PATH = new URL('../dist/about/index.html', import.meta.url);
const ASTRO_BIN = fileURLToPath(new URL('../node_modules/astro/bin/astro.mjs', import.meta.url));

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
  'border-color',
  'border-radius',
  'box-shadow',
  'transition',
]);

function readPage() {
  assert.ok(existsSync(PAGE_PATH), 'src/pages/about.astro no existe (REQ-11-01)');
  return readFileSync(PAGE_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/about.css no existe (REQ-11-04)');
  return readFileSync(CSS_PATH, 'utf8');
}

test('REQ-11-01: src/pages/about.astro existe', () => {
  assert.ok(
    existsSync(PAGE_PATH),
    'src/pages/about.astro no existe (REQ-11-01)'
  );
});

test('REQ-11-02: la página usa el layout único con título propio', () => {
  const page = readPage();
  assert.match(
    page,
    /layouts\/Layout\.astro/,
    'la página no importa el layout único (REQ-11-02)'
  );
  assert.ok(
    page.includes('<Layout'),
    'la página no usa el layout único en el marcado (REQ-11-02)'
  );
  assert.match(
    page,
    /<Layout[^>]*title=/,
    'la página no pasa la prop title al layout (REQ-11-02/Decisión 2)'
  );
  assert.ok(
    page.includes('About — moibaldenegro.com'),
    'la página no pasa el título "About — moibaldenegro.com" (Decisión 2)'
  );
});

test('REQ-11-03: el perfil se obtiene desde HeroProfileRepository', () => {
  const page = readPage();
  assert.match(
    page,
    /hero-profile-repository/,
    'la página no importa HeroProfileRepository (REQ-11-03)'
  );
  assert.match(
    page,
    /HeroProfileRepository/,
    'la página no usa la clase HeroProfileRepository (REQ-11-03)'
  );
  assert.match(
    page,
    /getProfile\(\)/,
    'la página no obtiene el perfil con getProfile() (REQ-11-03)'
  );
  // No accede a los datos ni hace lógica en la UI (convenciones del proyecto).
  assert.doesNotMatch(
    page,
    /\breadFileSync\b|new\s+URL\(/,
    'la página lee archivos o URLs de datos directamente (REQ-11-03)'
  );
  assert.doesNotMatch(
    page,
    /from\s+["'][^"']*\/data\//,
    'la página importa datos desde src/data (REQ-11-03)'
  );
});

test('REQ-11-03: muestra nombre, username y descripción del perfil real', () => {
  const page = readPage();
  for (const field of ['profile.name', 'profile.username', 'profile.description']) {
    assert.ok(
      page.includes(field),
      `la página no interpola ${field} (REQ-11-03)`
    );
  }
  // Decisión 1: el contenido se limita a los datos reales del perfil.
  assert.doesNotMatch(
    page,
    /profile\.verified/,
    'la página introduce contenido ajeno al mínimo name/username/description (Decisión 1)'
  );
});

test('REQ-11-04: about.css existe y es importada por la página', () => {
  const page = readPage();
  assert.ok(
    page.includes('../styles/about.css'),
    'la página no importa ../styles/about.css (REQ-11-04)'
  );
  assert.ok(
    existsSync(CSS_PATH),
    'src/styles/about.css no existe (REQ-11-04)'
  );
});

test('REQ-11-04: about.css no supera 100 líneas', () => {
  const lineCount = readCss().split('\n').length;
  assert.ok(
    lineCount <= 100,
    `about.css tiene ${lineCount} líneas (máximo 100, REQ-11-04)`
  );
});

test('REQ-11-04: sin valores hex ni rgb()/rgba() hardcodeados', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(
    content,
    /#[0-9a-fA-F]{3,8}\b/,
    'about.css contiene un color hex hardcodeado (REQ-11-04)'
  );
  assert.doesNotMatch(
    content,
    /rgba?\(/,
    'about.css contiene rgb()/rgba() hardcodeado (REQ-11-04)'
  );
});

test('REQ-11-04: colores, radios y transiciones usan var() de los tokens', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = /^([a-z-]+)\s*:\s*(.+?);?$/;
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  assert.ok(lines.length > 0, 'about.css está vacío');

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
      `"${prop}" no usa var() de los tokens (REQ-11-04): ${line}`
    );
  }
  assert.ok(checked > 0, 'no se encontró ninguna declaración de color/radio/transición');
});

test('REQ-11-04: la hoja consume los tokens de la tabla del design.md', () => {
  const css = readCss();
  for (const token of [
    '--color-background',
    '--color-text',
    '--color-text-secondary',
    '--color-border',
    '--color-surface',
    '--radius-card',
    '--gap-card',
    '--container-max',
  ]) {
    assert.ok(
      css.includes(`var(${token})`),
      `about.css no usa var(${token}) (design.md, REQ-11-04)`
    );
  }
});

test('REQ-11-05: el build genera la ruta /about con los datos reales del perfil', () => {
  assert.ok(
    existsSync(ASTRO_BIN),
    'node_modules/astro/bin/astro.mjs no existe (build no ejecutable)'
  );
  const build = spawnSync(process.execPath, [ASTRO_BIN, 'build'], {
    encoding: 'utf8',
    maxBuffer: 8 * 1024 * 1024,
  });
  assert.equal(
    build.status,
    0,
    `astro build falló (REQ-11-05):\n${build.stdout}\n${build.stderr}`
  );
  assert.ok(
    existsSync(DIST_ABOUT_PATH),
    'el build no generó dist/about/index.html (REQ-11-05)'
  );
  const html = readFileSync(DIST_ABOUT_PATH, 'utf8');
  assert.ok(
    html.includes('About — moibaldenegro.com'),
    'el <title> de /about no es "About — moibaldenegro.com" (Decisión 2)'
  );
  const profile = JSON.parse(readFileSync(PROFILE_JSON, 'utf8'));
  for (const field of ['name', 'username', 'description']) {
    assert.ok(
      html.includes(profile[field]),
      `el HTML de /about no muestra ${field} del perfil real (REQ-11-05/REQ-11-03)`
    );
  }
});

test('Convención: la página es ≤100 líneas, sin lógica y sin estilos embebidos', () => {
  const page = readPage();
  const lineCount = page.split('\n').length;
  assert.ok(
    lineCount <= 100,
    `about.astro tiene ${lineCount} líneas (máximo 100)`
  );
  assert.doesNotMatch(
    page,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(/,
    'la página contiene lógica de negocio en el frontmatter (convención)'
  );
  assert.doesNotMatch(
    page,
    /\bstyle\s*=/,
    'la página conserva el atributo style inline (convención)'
  );
  assert.doesNotMatch(
    page,
    /<style/i,
    'la página contiene un bloque <style> embebido (convención)'
  );
});
