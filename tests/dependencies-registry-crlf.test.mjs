// Tests del registro de dependencias tolerante a CRLF (feature 28
// dependencies-registry-crlf), verificados contra
// specs/28_dependencies-registry-crlf/requirements.md:
//   REQ-28-01/02 — parseRegistry devuelve las mismas entradas con CRLF que con LF.
//   REQ-28-03    — el paquete y el valor de cada campo vienen sin \r.
//   REQ-28-04    — validateDependencies no reporta errores con los archivos reales.
//   REQ-28-05    — idem con registros temporales en CRLF y en LF.
//   REQ-28-07    — check-format.mjs termina sin errores del registro.
//   REQ-28-08    — el parser no exige finales de línea LF y el registro real conserva sus 4 entradas.
//   REQ-28-09    — el validador del registro no supera las 100 líneas.
// Los registros de prueba se escriben en directorios temporales: docs/dependencies.md no se modifica.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRegistry, validateDependencies } from '../scripts/validate-dependencies.mjs';

const REGISTRY_URL = new URL('../docs/dependencies.md', import.meta.url);
const VALIDATOR_URL = new URL('../scripts/validate-dependencies.mjs', import.meta.url);
const CHECK_FORMAT_URL = new URL('../scripts/check-format.mjs', import.meta.url);
const APPROVED = ['astro', '@astrojs/cloudflare', 'wrangler', '@cloudflare/workers-types'];

// Registro de muestra con dos entradas y los cuatro campos obligatorios.
const REGISTRY_LINES = [
  '# Registro de dependencias aprobadas',
  '### astro',
  '- version: ^7.2.0',
  '- scope: dependencies',
  '- approved: 2026-08-13',
  '- motivo: framework del proyecto (sitio Astro)',
  '### wrangler',
  '- version: ^4.121.0',
  '- scope: dependencies',
  '- approved: 2026-08-13',
  '- motivo: CLI de despliegue y generación de tipos',
];

const registry = (eol) => REGISTRY_LINES.join(eol);

// Crea un directorio temporal con package.json y el registro en el fin de línea
// indicado, y devuelve las rutas que consume el validador.
function fixture(eol) {
  const dir = mkdtempSync(join(tmpdir(), 'dependencies-crlf-'));
  const pkgPath = join(dir, 'package.json');
  const regPath = join(dir, 'dependencies.md');
  writeFileSync(pkgPath, JSON.stringify({ name: 'test', dependencies: { astro: '^7.2.0' } }), 'utf8');
  writeFileSync(regPath, registry(eol), 'utf8');
  return { pkgPath, regPath, dir };
}

test('REQ-28-01/02/03: con CRLF y con LF el parser devuelve las mismas entradas, sin \\r', () => {
  const lf = parseRegistry(registry('\n'));
  const crlf = parseRegistry(registry('\r\n'));
  assert.deepEqual([...crlf.keys()], ['astro', 'wrangler'], 'el registro en CRLF no devuelve las mismas entradas');
  assert.deepEqual([...crlf.values()], [...lf.values()], 'las entradas en CRLF difieren de las entradas en LF');
  for (const [name, entry] of crlf) {
    for (const [field, value] of Object.entries(entry.fields)) {
      assert.ok(!value.includes('\r'), `${name}.${field} arrastra un \\r: ${JSON.stringify(value)}`);
    }
  }
});

test('REQ-28-03/08: el docs/dependencies.md real se parsea entero, sin \\r y con sus 4 entradas', () => {
  const entries = parseRegistry(readFileSync(REGISTRY_URL, 'utf8'));
  assert.deepEqual(
    [...entries.keys()].sort(),
    [...APPROVED].sort(),
    `el parser no reconoce el registro real: ${[...entries.keys()]}`,
  );
  for (const [name, entry] of entries) {
    for (const [field, value] of Object.entries(entry.fields)) {
      assert.ok(!value.includes('\r'), `${name}.${field} arrastra un \\r en el registro real (REQ-28-03)`);
    }
  }
});

for (const [label, eol] of [['CRLF', '\r\n'], ['LF', '\n']]) {
  test(`REQ-28-05: validateDependencies no reporta errores con un registro temporal en ${label}`, () => {
    const { pkgPath, regPath, dir } = fixture(eol);
    try {
      assert.deepEqual(validateDependencies(pkgPath, regPath), [], `el validador falla con el registro en ${label}`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
}

test('REQ-28-04: validateDependencies no reporta errores con los archivos reales', () => {
  assert.deepEqual(validateDependencies(), []);
});

test('REQ-28-08: el parser separa líneas con un patrón que acepta LF y CRLF', () => {
  const source = readFileSync(VALIDATOR_URL, 'utf8');
  assert.match(source, /split\(\/\\r\?\\n\/\)/, 'el parser no separa líneas con split(/\\r?\\n/) (REQ-28-08)');
  assert.match(source, /\(\.\+\?\)\\s\*\$/, 'las regex del parser no absorben el resto con (.+?)\\s*$ (REQ-28-08)');
});

test('REQ-28-07: check-format.mjs termina sin errores del registro de dependencias', () => {
  const result = spawnSync(process.execPath, [fileURLToPath(CHECK_FORMAT_URL)], { encoding: 'utf8' });
  assert.equal(result.error, undefined, `check-format.mjs no se pudo ejecutar: ${result.error}`);
  const output = `${result.stdout ?? ''}${result.stderr ?? ''}`;
  assert.doesNotMatch(output, /no está aprobada en el registro/, `check-format reporta dependencias sin aprobar: ${output}`);
  assert.doesNotMatch(output, /no declara "(version|scope|approved|motivo)"/, `check-format reporta campos faltantes: ${output}`);
});

test('REQ-28-09: el validador del registro no supera las 100 líneas', () => {
  const lines = readFileSync(VALIDATOR_URL, 'utf8').split(/\r?\n/);
  assert.ok(lines.length <= 100, `scripts/validate-dependencies.mjs tiene ${lines.length} líneas (>100)`);
});
