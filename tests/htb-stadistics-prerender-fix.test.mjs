// Test de la reversión del prerender de htb-stadistics (REQ-28-01..06, feature 28).
//
// Verifica contra specs/28_htb-stadistics-prerender-fix/requirements.md:
//   REQ-28-01 — el componente consume el token y el identificador exclusivamente
//               desde astro:env/server (el esquema los declara secret/server).
//   REQ-28-02 — el componente no importa el módulo cloudflare:workers: el
//               prerender del sitio corre en entorno node (prerenderEnvironment:
//               'node', feature 21) donde el módulo virtual no existe y el
//               default-prerenderer crashea ('reading setInternals').
//   REQ-28-03 — el frontmatter resuelve el perfil con getProfileOrNull
//               (degradación elegante de la feature 27 intacta).
//   REQ-28-04 — si la edición manual reintroduce cloudflare:workers o los
//               fallbacks de entorno (env.HTB_* o alias ENV_* con ||), este
//               test falla.
//   REQ-28-06 — el componente conserva el marcado canónico de la feature 27:
//               la sección se condiciona al perfil con {profile && ...}.
// El build de producción (REQ-28-05) lo verifica tests/about-page.test.mjs
// (REQ-11-05, build real) dentro de la suite: este test fija la condición
// estructural que permite que ese build corra en node.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENT_PATH = new URL('../src/components/htb-stadistics.astro', import.meta.url);

function readComponent() {
  assert.ok(
    existsSync(COMPONENT_PATH),
    'src/components/htb-stadistics.astro no existe (REQ-28-01)',
  );
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readFrontmatter() {
  return readComponent().split('---')[1] ?? '';
}

test('REQ-28-01: el token y el id se consumen exclusivamente desde astro:env/server', () => {
  assert.match(
    readFrontmatter(),
    /import\s*\{\s*HTB_API_TOKEN\s*,\s*HTB_USER_ID\s*\}\s*from\s*['"]astro:env\/server['"]/,
    'el frontmatter no importa HTB_API_TOKEN y HTB_USER_ID juntos desde astro:env/server sin alias (REQ-28-01)',
  );
});

test('REQ-28-02: el componente no importa el módulo cloudflare:workers', () => {
  assert.doesNotMatch(
    readComponent(),
    /cloudflare:workers/,
    'htb-stadistics.astro importa cloudflare:workers, módulo virtual inexistente en el prerender de node (REQ-28-02)',
  );
});

test('REQ-28-03: el frontmatter resuelve el perfil con getProfileOrNull', () => {
  assert.match(
    readComponent(),
    /getProfileOrNull\(\)/,
    'htb-stadistics.astro no obtiene el perfil con getProfileOrNull() (REQ-28-03)',
  );
  assert.match(
    readFrontmatter(),
    /new\s+HtbProfileRepository\(\s*HTB_API_TOKEN\s*,\s*HTB_USER_ID\s*\)/,
    'el constructor no recibe los valores directos de astro:env/server (REQ-28-01/03)',
  );
});

test('REQ-28-04: sin fallbacks de entorno en el frontmatter', () => {
  const frontmatter = readFrontmatter();
  assert.doesNotMatch(
    frontmatter,
    /env\.HTB_API_TOKEN|env\.HTB_USER_ID/,
    'el frontmatter reintroduce un fallback con env.HTB_* (REQ-28-04)',
  );
  assert.doesNotMatch(
    frontmatter,
    /ENV_TOKEN|ENV_ID/,
    'el frontmatter reintroduce los alias ENV_TOKEN/ENV_ID de la edición manual (REQ-28-04)',
  );
  assert.doesNotMatch(
    frontmatter,
    /\|\|/,
    'el frontmatter contiene el operador || (fallback de entorno, REQ-28-04)',
  );
});

test('REQ-28-06: conserva el marcado canónico con {profile && ...}', () => {
  assert.match(
    readComponent(),
    /\{profile\s*&&/,
    'el template no condiciona la sección al perfil con {profile && ...} (REQ-28-06)',
  );
});

test('Convención: el componente es <=100 líneas y el frontmatter solo importa y pasa datos', () => {
  const astro = readComponent();
  const lineCount = astro.split('\n').length;
  assert.ok(lineCount <= 100, `htb-stadistics.astro tiene ${lineCount} líneas (máximo 100)`);
  assert.doesNotMatch(
    astro,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(|\btry\s*\{/,
    'el componente contiene lógica de negocio en el frontmatter (convención)',
  );
});