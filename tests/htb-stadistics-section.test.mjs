// Test de la sección de estadísticas de HTB (REQ-22-01..08, feature 22 htb-stadistics-section).
//
// Verifica contra specs/22_htb-stadistics-section/requirements.md y design.md:
//   REQ-22-01 — la portada renderiza htb-stadistics.astro con server:defer y un
//               slot de fallback (Decisión 3: el fallback "Cargando..." se
//               muestra mientras resuelve la isla de servidor diferida).
//   REQ-22-05 — el componente importa src/styles/htb-stadistics.css; la hoja
//               consume únicamente los tokens de la tabla del design.md (8),
//               no supera 100 líneas y no tiene hex ni rgb()/rgba() sueltos.
//   REQ-22-06 — el componente no expone secretos: sin fetch, sin console.* y
//               sin interpolar el token ni el id en la salida.
//   REQ-22-07 — HTB_API_TOKEN y HTB_USER_ID son opcionales en el esquema env.
//   REQ-22-08 — el esquema declara HTB_API_TOKEN como secreta de contexto server.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const INDEX_PATH = new URL('../src/pages/index.astro', import.meta.url);
const COMPONENT_PATH = new URL('../src/components/htb-stadistics.astro', import.meta.url);
const CSS_PATH = new URL('../src/styles/htb-stadistics.css', import.meta.url);
const CONFIG_PATH = new URL('../astro.config.mjs', import.meta.url);
const TOKENS_PATH = new URL('../src/styles/tokens.css', import.meta.url);

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

function readIndex() {
  assert.ok(existsSync(INDEX_PATH), 'src/pages/index.astro no existe (REQ-22-01)');
  return readFileSync(INDEX_PATH, 'utf8');
}

function readComponent() {
  assert.ok(existsSync(COMPONENT_PATH), 'src/components/htb-stadistics.astro no existe (REQ-22-01)');
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readCss() {
  assert.ok(existsSync(CSS_PATH), 'src/styles/htb-stadistics.css no existe (REQ-22-05)');
  return readFileSync(CSS_PATH, 'utf8');
}

test('REQ-22-01: la portada renderiza la sección con server:defer y slot de fallback', () => {
  const index = readIndex();
  assert.match(
    index,
    /<HtbStadistics[^>]*server:defer/,
    'index.astro no renderiza la sección con server:defer (REQ-22-01)',
  );
  assert.match(
    index,
    /slot="fallback"/,
    'index.astro no declara un slot de fallback (REQ-22-01)',
  );
  assert.match(
    index,
    /Cargando estadísticas de HTB\.\.\./,
    'index.astro no muestra el texto de fallback Cargando (REQ-22-01/Decisión 3)',
  );
});

test('REQ-22-01: el componente importa el repositorio de dominio (no hace fetch)', () => {
  const astro = readComponent();
  assert.match(
    astro,
    /htb-profile-repository/,
    'htb-stadistics.astro no importa HtbProfileRepository (REQ-22-01/02)',
  );
  assert.match(
    astro,
    /HtbProfileRepository/,
    'htb-stadistics.astro no usa la clase HtbProfileRepository (REQ-22-01/02)',
  );
  assert.match(
    astro,
    /getProfile\(\)/,
    'htb-stadistics.astro no obtiene el perfil con getProfile() (REQ-22-02)',
  );
  assert.doesNotMatch(
    astro,
    /\bfetch\s*\(/,
    'htb-stadistics.astro contiene fetch directamente (REQ-22-06)',
  );
});

test('REQ-22-06: el componente no tiene console.* y no interpola secretos en la salida', () => {
  const astro = readComponent();
  assert.doesNotMatch(
    astro,
    /console\.(log|error|warn|debug)/,
    'htb-stadistics.astro registra en consola (REQ-22-06)',
  );
  const template = astro.split('---')[2] ?? '';
  assert.doesNotMatch(
    template,
    /HTB_API_TOKEN|HTB_USER_ID/,
    'el marcado interpola el token o el id del usuario (REQ-22-06)',
  );
});

test('REQ-22-05: htb-stadistics.css existe y es importada por el componente', () => {
  const astro = readComponent();
  assert.ok(
    astro.includes('../styles/htb-stadistics.css'),
    'htb-stadistics.astro no importa ../styles/htb-stadistics.css (REQ-22-05)',
  );
  assert.ok(
    existsSync(CSS_PATH),
    'src/styles/htb-stadistics.css no existe (REQ-22-05)',
  );
});

test('REQ-22-05: la hoja no supera 100 líneas', () => {
  const lineCount = readCss().split('\n').length;
  assert.ok(lineCount <= 100, `htb-stadistics.css tiene ${lineCount} líneas (máximo 100)`);
});

test('REQ-22-05: sin valores hex ni rgb()/rgba() hardcodeados', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(content, /#[0-9a-fA-F]{3,8}\b/, 'htb-stadistics.css tiene un hex hardcodeado');
  assert.doesNotMatch(content, /rgba?\(/, 'htb-stadistics.css tiene rgb()/rgba() hardcodeado');
});

test('REQ-22-05: colores, radios y transiciones usan var() de los tokens', () => {
  const content = readCss().replace(/\/\*[\s\S]*?\*\//g, '');
  const declaration = /^([a-z-]+)\s*:\s*(.+?);?$/;
  const lines = content
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  assert.ok(lines.length > 0, 'htb-stadistics.css está vacío');

  let checked = 0;
  for (const line of lines) {
    const match = line.match(declaration);
    if (!match) continue; // selectores, @media, llaves
    const prop = match[1].toLowerCase();
    if (!COLOR_PROPS.has(prop)) continue;
    checked += 1;
    assert.match(match[2], /var\(--/, `"${prop}" no usa var() de los tokens (REQ-22-05): ${line}`);
  }
  assert.ok(checked > 0, 'no se encontró ninguna declaración de color/radio/transición');
});

test('REQ-22-05: la hoja consume los tokens de la tabla del design.md', () => {
  const css = readCss();
  for (const token of [
    '--color-surface',
    '--color-text',
    '--color-text-secondary',
    '--color-border',
    '--color-accent',
    '--radius-card',
    '--gap-card',
    '--container-max',
  ]) {
    assert.ok(
      css.includes(`var(${token})`),
      `htb-stadistics.css no usa var(${token}) (design.md, REQ-22-05)`,
    );
  }
});

test('REQ-22-07/08: el esquema env declara ambas variables secret/server/optional', () => {
  const config = readFileSync(CONFIG_PATH, 'utf8');
  for (const name of ['HTB_API_TOKEN', 'HTB_USER_ID']) {
    assert.match(
      config,
      new RegExp(`${name}:\\s*envField\\.string\\(`),
      `astro.config.mjs no declara ${name} (REQ-22-08)`,
    );
  }
  const tokenBlock = config.match(/HTB_API_TOKEN:[\s\S]*?optional:\s*true/);
  const idBlock = config.match(/HTB_USER_ID:[\s\S]*?optional:\s*true/);
  assert.ok(tokenBlock, 'HTB_API_TOKEN no es optional (REQ-22-07)');
  assert.ok(idBlock, 'HTB_USER_ID no es optional (REQ-22-07)');
  const secretCount = (config.match(/access:\s*'secret'/g) ?? []).length;
  assert.ok(secretCount >= 2, 'faltan access secret en el esquema env (REQ-22-08)');
  const serverCount = (config.match(/context:\s*'server'/g) ?? []).length;
  assert.ok(serverCount >= 2, 'faltan context server en el esquema env (REQ-22-08)');
});

test('REQ-22-05: tokens.css no añade tokens nuevos (sigue en 96/100 líneas)', () => {
  const lineCount = readFileSync(TOKENS_PATH, 'utf8').split('\n').length;
  assert.ok(
    lineCount <= 100,
    `tokens.css tiene ${lineCount} líneas: la feature 22 no añade tokens (límite 100)`,
  );
});

test('Convención: el componente es ≤100 líneas, sin lógica y sin estilos embebidos', () => {
  const astro = readComponent();
  const lineCount = astro.split('\n').length;
  assert.ok(lineCount <= 100, `htb-stadistics.astro tiene ${lineCount} líneas (máximo 100)`);
  assert.doesNotMatch(
    astro,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(|\btry\s*\{/,
    'el componente contiene lógica de negocio en el frontmatter (convención)',
  );
  assert.doesNotMatch(astro, /\bstyle\s*=/, 'el componente conserva el atributo style inline');
  assert.doesNotMatch(astro, /<style/i, 'el componente contiene un bloque <style> embebido');
});