// Test del workaround del dev config en astro.config.mjs (resolución del
// CHANGES_REQUESTED de la feature 27, 2026-08-13).
//
// Contexto: tras el error de re-optimización de rolldown-vite en Windows
// ("rolldown-runtime > file does not exist ... optimizeDeps"), el humano
// estabilizó el dev server editando astro.config.mjs: el bloque
// vite.optimizeDeps pasó de `exclude: ['@astrojs/internal-helpers']` a
// `include: ['astro/assets/services/noop']` + `disabled: false` (sugerencia
// del propio Vite: "Try adding it to optimizeDeps"), se retiró
// `ssr.noExternal: ['astro']` y se añadió `server.watch.ignored:
// ['**/.vite/**']` (evitar loops de recarga en Windows). El humano decidió
// DOCUMENTAR Y CONSERVAR el workaround: este test fija su estado canónico y
// verifica que el esquema env de REQ-22-07/08 no sufre regresión.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);

function readRel(relPath) {
  const url = new URL(relPath, ROOT);
  assert.ok(existsSync(url), `${relPath}: no existe`);
  return readFileSync(url, 'utf8');
}

test('workaround: optimizeDeps.include fija astro/assets/services/noop con disabled false', () => {
  const config = readRel('astro.config.mjs');
  assert.ok(
    config.includes('optimizeDeps'),
    'astro.config.mjs ya no declara el bloque vite.optimizeDeps (workaround perdido)',
  );
  const optimizeDeps = config.match(/optimizeDeps\s*:\s*\{[^}]*\}/)?.[0] ?? '';
  assert.match(
    optimizeDeps,
    /include:\s*\[['"]astro\/assets\/services\/noop['"]\]/,
    'optimizeDeps.include no fija astro/assets/services/noop (workaround)',
  );
  assert.match(
    optimizeDeps,
    /disabled:\s*false/,
    'optimizeDeps.disabled no es false (workaround)',
  );
});

test('workaround: server.watch.ignored excluye la caché .vite (loops de recarga)', () => {
  const config = readRel('astro.config.mjs');
  assert.ok(
    config.includes('server') && config.includes('watch'),
    'astro.config.mjs ya no declara vite.server.watch',
  );
  assert.match(
    config,
    /watch\s*:\s*\{[\s\S]*?ignored:\s*\[['"]\*\*\/\.vite\/\*\*['"]\]/,
    'server.watch.ignored no incluye **/.vite/** (workaround)',
  );
});

test('workaround: las entradas retiradas no vuelven (exclude/noExternal)', () => {
  const config = readRel('astro.config.mjs');
  assert.doesNotMatch(
    config,
    /@astrojs\/internal-helpers/,
    'exclude: [\'@astrojs/internal-helpers\'] retirado por el humano ha vuelto',
  );
  assert.doesNotMatch(
    config,
    /noExternal/,
    'ssr.noExternal retirado por el humano ha vuelto',
  );
});

test('REQ-22-07/08 sin regresión: el esquema env conserva public/client y secret/server/optional', () => {
  const config = readRel('astro.config.mjs');
  const maintenance = config.match(/IN_MAINTENANCE:\s*envField\.boolean\([\s\S]*?\)/)?.[0];
  assert.ok(maintenance, 'IN_MAINTENANCE ya no se declara con envField.boolean (regresión)');
  assert.match(maintenance, /access:\s*'public'/, 'IN_MAINTENANCE perdió access public (REQ-21-01)');
  assert.match(maintenance, /context:\s*'client'/, 'IN_MAINTENANCE perdió context client (REQ-21-01)');
  for (const name of ['HTB_API_TOKEN', 'HTB_USER_ID']) {
    const block = config.match(new RegExp(`${name}:\\s*envField\\.string\\([\\s\\S]*?\\)`))?.[0];
    assert.ok(block, `${name} ya no se declara con envField.string (regresión)`);
    assert.match(block, /access:\s*'secret'/, `${name} perdió access secret (REQ-22-08)`);
    assert.match(block, /context:\s*'server'/, `${name} perdió context server (REQ-22-08)`);
    assert.match(block, /optional:\s*true/, `${name} perdió optional true (REQ-22-07)`);
  }
});