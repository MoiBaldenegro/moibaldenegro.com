// Test del prerender en workerd con el fallback cloudflare:workers (REQ-32-01..07,
// feature 32 prerender-workerd). Esta reescritura SUPERA el test de la feature 28
// (que fijaba la AUSENCIA de cloudflare:workers, estado canónico de aquel ciclo):
// la feature 28 permanece done como historial (precedente feature 25) y la
// dirección del humano (ciclo 29) la revierte: el fallback ES NECESARIO con el
// adapter de Cloudflare (astro:env/server no entrega las envs del worker en
// runtime) y el prerender pasa a prerenderEnvironment: 'workerd', donde el
// módulo virtual cloudflare:workers resuelve de forma nativa.
//
// Verifica contra specs/32_prerender-workerd/requirements.md:
//   REQ-32-01 — astro.config.mjs declara prerenderEnvironment 'workerd' y el
//               resto del bloque vite (optimizeDeps.include, server.watch.ignored)
//               permanece sin cambios.
//   REQ-32-02 — el frontmatter define el token y el identificador con fallback
//               entre astro:env/server (alias ENV_TOKEN/ENV_ID) y cloudflare:workers
//               (env.HTB_API_TOKEN / env.HTB_USER_ID).
//   REQ-32-03 — este test fija la PRESENCIA del fallback cloudflare:workers.
//   REQ-32-04 — el componente conserva getProfileOrNull() y el marcado
//               condicionado con {profile && ...} (degradación de la 27 intacta),
//               sin lógica de negocio ni console.*.
//   REQ-32-05 — el build real en workerd lo verifica tests/about-page.test.mjs
//               (REQ-11-05) dentro de la suite.
//   REQ-32-06 — contingencia ECONNREFUSED: se documenta en progress/impl_32_*;
//               no es una aserción de código.
//   REQ-32-07 — wrangler.jsonc conserva los compatibility_flags nodejs_compat y
//               global_fetch_strictly_public sin cambios, verificado por test.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const COMPONENT_PATH = new URL('../src/components/htb-stadistics.astro', import.meta.url);
const CONFIG_PATH = new URL('../astro.config.mjs', import.meta.url);
const WRANGLER_PATH = new URL('../wrangler.jsonc', import.meta.url);

function readComponent() {
  assert.ok(
    existsSync(COMPONENT_PATH),
    'src/components/htb-stadistics.astro no existe (REQ-32-02)',
  );
  return readFileSync(COMPONENT_PATH, 'utf8');
}

function readFrontmatter() {
  return readComponent().split('---')[1] ?? '';
}

function readConfig() {
  assert.ok(existsSync(CONFIG_PATH), 'astro.config.mjs no existe (REQ-32-01)');
  return readFileSync(CONFIG_PATH, 'utf8');
}

function readWrangler() {
  assert.ok(existsSync(WRANGLER_PATH), 'wrangler.jsonc no existe (REQ-32-07)');
  return readFileSync(WRANGLER_PATH, 'utf8');
}

test('REQ-32-01: el adapter declara prerenderEnvironment workerd y conserva el bloque vite', () => {
  const config = readConfig();
  assert.match(
    config,
    /prerenderEnvironment\s*:\s*'workerd'/,
    'astro.config.mjs no declara prerenderEnvironment \'workerd\' (REQ-32-01)',
  );
  assert.doesNotMatch(
    config,
    /prerenderEnvironment\s*:\s*'node'/,
    'astro.config.mjs vuelve a prerenderEnvironment \'node\' (REQ-32-01)',
  );
  const optimizeDeps = config.match(/optimizeDeps\s*:\s*\{[^}]*\}/)?.[0] ?? '';
  assert.match(
    optimizeDeps,
    /include:\s*\[['"]astro\/assets\/services\/noop['"]\]/,
    'optimizeDeps.include cambió: debe conservar astro/assets/services/noop (REQ-32-01)',
  );
  assert.match(
    config,
    /watch\s*:\s*\{[\s\S]*?ignored:\s*\[['"]\*\*\/\.vite\/\*\*['"]\]/,
    'server.watch.ignored cambió: debe conservar **/.vite/** (REQ-32-01)',
  );
});

test('REQ-32-02: el frontmatter importa env desde cloudflare:workers y los alias de astro:env/server', () => {
  const frontmatter = readFrontmatter();
  assert.match(
    frontmatter,
    /import\s*\{\s*env\s*\}\s*from\s*['"]cloudflare:workers['"]/,
    'el frontmatter no importa env desde cloudflare:workers (REQ-32-02)',
  );
  assert.match(
    frontmatter,
    /import\s*\{\s*HTB_API_TOKEN\s+as\s+ENV_TOKEN\s*,\s*HTB_USER_ID\s+as\s+ENV_ID\s*\}\s*from\s*['"]astro:env\/server['"]/,
    'el frontmatter no importa HTB_API_TOKEN/HTB_USER_ID con alias ENV_TOKEN/ENV_ID desde astro:env/server (REQ-32-02)',
  );
});

test('REQ-32-02/03: el token y el identificador usan el fallback ENV_* || env.HTB_*', () => {
  const frontmatter = readFrontmatter();
  assert.match(
    frontmatter,
    /const\s+HTB_API_TOKEN\s*=\s*ENV_TOKEN\s*\|\|\s*env\.HTB_API_TOKEN\s*;/,
    'falta el fallback const HTB_API_TOKEN = ENV_TOKEN || env.HTB_API_TOKEN (REQ-32-02/03)',
  );
  assert.match(
    frontmatter,
    /const\s+HTB_USER_ID\s*=\s*ENV_ID\s*\|\|\s*env\.HTB_USER_ID\s*;/,
    'falta el fallback const HTB_USER_ID = ENV_ID || env.HTB_USER_ID (REQ-32-02/03)',
  );
});

test('REQ-32-04: conserva getProfileOrNull() con los valores resueltos y {profile && ...}', () => {
  const component = readComponent();
  assert.match(
    component,
    /getProfileOrNull\(\)/,
    'htb-stadistics.astro no obtiene el perfil con getProfileOrNull() (REQ-32-04)',
  );
  assert.match(
    readFrontmatter(),
    /new\s+HtbProfileRepository\(\s*HTB_API_TOKEN\s*,\s*HTB_USER_ID\s*\)/,
    'el constructor no recibe HTB_API_TOKEN y HTB_USER_ID (REQ-32-04)',
  );
  assert.match(
    component,
    /\{profile\s*&&/,
    'el template no condiciona la sección al perfil con {profile && ...} (REQ-32-04)',
  );
  assert.doesNotMatch(
    component,
    /console\.(log|error|warn|debug)/,
    'el componente registra en consola (REQ-22-06)',
  );
  assert.doesNotMatch(
    component,
    /\bfunction\b|\bif\s*\(|\bfor\s*\(|\btry\s*\{/,
    'el componente contiene lógica de negocio en el frontmatter (REQ-32-04)',
  );
});

test('REQ-32-07: wrangler.jsonc conserva nodejs_compat y global_fetch_strictly_public', () => {
  const wrangler = readWrangler();
  assert.match(
    wrangler,
    /"compatibility_flags"\s*:\s*\[[\s\S]*?"global_fetch_strictly_public"[\s\S]*?"nodejs_compat"[\s\S]*?\]/,
    'wrangler.jsonc no conserva global_fetch_strictly_public y nodejs_compat juntos (REQ-32-07)',
  );
});

test('Convención: el componente es <=100 líneas y el frontmatter solo importa, define consts y llama', () => {
  const astro = readComponent();
  const lineCount = astro.split('\n').length;
  assert.ok(lineCount <= 100, `htb-stadistics.astro tiene ${lineCount} líneas (máximo 100)`);
});