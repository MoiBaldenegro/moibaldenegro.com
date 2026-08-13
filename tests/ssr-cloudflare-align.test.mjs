import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

// Test de la feature 21 ssr-cloudflare-align (REQ-21-01..06).
//
// Canaliza al arnés la decisión SSR + adapter Cloudflare que el usuario
// configuró manualmente (cadena de commits de deploy, .wrangler/deploy/,
// script generate-types). Las dependencias @astrojs/cloudflare y wrangler
// son la excepción documentada a la regla 2 (sin dependencias externas):
// el deploy a Cloudflare Workers es objetivo declarado del usuario y la
// regla 9 (estático por defecto) se cumple porque las páginas siguen
// prerender (prerender: true) y solo el componente server:defer de la
// feature 22 renderiza en runtime.

const ROOT = new URL('../', import.meta.url);

function readRel(relPath) {
  const url = new URL(relPath, ROOT);
  assert.ok(existsSync(url), `${relPath}: no existe`);
  return readFileSync(url, 'utf8');
}

test('REQ-21-01: astro.config.mjs declara output server y el adapter cloudflare', () => {
  const config = readRel('astro.config.mjs');
  assert.match(
    config,
    /output\s*:\s*['"]server['"]/,
    'astro.config.mjs no declara output: server (REQ-21-01)'
  );
  assert.match(
    config,
    /@astrojs\/cloudflare/,
    'astro.config.mjs no importa el adapter @astrojs/cloudflare (REQ-21-01)'
  );
  assert.match(
    config,
    /cloudflare\s*\(/,
    'astro.config.mjs no usa cloudflare() como adapter (REQ-21-01)'
  );
});

test('REQ-21-01: el esquema env declara las variables de entorno', () => {
  const config = readRel('astro.config.mjs');
  assert.match(config, /\benvField\b/, 'el esquema env no usa envField (REQ-21-01)');
  for (const variable of ['IN_MAINTENANCE', 'HTB_API_TOKEN', 'HTB_USER_ID']) {
    assert.ok(
      config.includes(variable),
      `el esquema env no declara ${variable} (REQ-21-01)`
    );
  }
});

test('REQ-21-02: package.json define generate-types con wrangler types', () => {
  const pkg = JSON.parse(readRel('package.json'));
  assert.ok(
    typeof pkg.scripts?.['generate-types'] === 'string',
    'package.json no define el script generate-types (REQ-21-02)'
  );
  assert.ok(
    pkg.scripts['generate-types'].includes('wrangler types'),
    `generate-types debe usar "wrangler types", actual: ${pkg.scripts['generate-types']} (REQ-21-02)`
  );
  assert.ok(
    pkg.dependencies?.['@astrojs/cloudflare'] || pkg.devDependencies?.['@astrojs/cloudflare'],
    'package.json no declara @astrojs/cloudflare (REQ-21-01/06)'
  );
  assert.ok(
    pkg.dependencies?.wrangler || pkg.devDependencies?.wrangler,
    'package.json no declara wrangler (REQ-21-06)'
  );
});

test('REQ-21-03: .gitignore excluye .wrangler/', () => {
  const gitignore = readRel('.gitignore');
  assert.ok(
    gitignore.includes('.wrangler/'),
    '.gitignore no excluye .wrangler/ (REQ-21-03)'
  );
});

test('REQ-21-03: git ls-files no lista archivos de .wrangler', () => {
  const ls = spawnSync('git', ['ls-files'], { encoding: 'utf8' });
  assert.equal(ls.status, 0, 'git ls-files falló');
  const tracked = ls.stdout.split('\n');
  const leaked = tracked.filter((file) => file.startsWith('.wrangler/'));
  assert.deepEqual(
    leaked,
    [],
    `git sigue trackeando estado de .wrangler/ (REQ-21-03): ${leaked.join(', ')}`
  );
});

test('REQ-21-04: tests/about-page.test.mjs verifica el output real del adapter', () => {
  const aboutTest = readRel('tests/about-page.test.mjs');
  assert.ok(
    aboutTest.includes('dist/client/about/index.html'),
    'about-page.test.mjs no verifica dist/client/about/index.html (REQ-21-04)'
  );
  assert.ok(
    !aboutTest.includes('dist/about/index.html'),
    'about-page.test.mjs conserva la ruta estática antigua dist/about/index.html (REQ-21-04)'
  );
});

test('REQ-21-06: la excepción de dependencias externas queda documentada', () => {
  const spec = readRel('specs/21_ssr-cloudflare-align/requirements.md');
  assert.ok(
    spec.includes('REQ-21-06'),
    'la spec 21 no declara REQ-21-06 (justificación de dependencias)'
  );
  const description = JSON.parse(readRel('feature_list.json')).features.find(
    (feature) => feature.id === 21
  );
  assert.ok(description, 'feature 21 no existe en feature_list.json');
  assert.ok(
    description.description.includes('Cloudflare Workers'),
    'la descripción de la feature 21 no documenta la excepción a la regla de dependencias (REQ-21-06)'
  );
});