// Test del registro de dependencias aprobadas (REQ-29-01..06, feature 29
// dependencies-registry). Verifica contra
// specs/29_dependencies-registry/requirements.md:
//   REQ-29-01 — docs/dependencies.md registra cada dependencia aprobada con
//               paquete, versión, ámbito, fecha y motivo.
//   REQ-29-02 — scripts/validate-dependencies.mjs falla cuando una dependencia
//               de package.json no tiene su entrada aprobada en el registro.
//   REQ-29-03 — el validador falla cuando una entrada no declara todos los
//               campos obligatorios.
//   REQ-29-04 — el arnés prohíbe la aprobación de dependencias por agentes
//               (aprobación exclusiva del humano; los agentes solo marcan
//               la feature blocked).
//   REQ-29-05 — AGENTS.md, docs/architecture.md, docs/conventions.md y
//               docs/verification.md documentan la política y el registro.
//   REQ-29-06 — scripts/check-format.mjs integra la validación del registro.
//
// Formato del registro fijado por este test: bloques `### package` seguidos
// de líneas `- clave: valor` (precedente de formato: specs/_template).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateDependencies, parseRegistry } from '../scripts/validate-dependencies.mjs';

const REGISTRY_URL = new URL('../docs/dependencies.md', import.meta.url);
const PACKAGE_URL = new URL('../package.json', import.meta.url);
const CHECK_FORMAT_URL = new URL('../scripts/check-format.mjs', import.meta.url);
const VALIDATOR_URL = new URL('../scripts/validate-dependencies.mjs', import.meta.url);

const REQUIRED_FIELDS = ['version', 'scope', 'approved', 'motivo'];

const HARNESS_DOCS = [
  ['AGENTS.md', new URL('../AGENTS.md', import.meta.url)],
  ['docs/architecture.md', new URL('../docs/architecture.md', import.meta.url)],
  ['docs/conventions.md', new URL('../docs/conventions.md', import.meta.url)],
  ['docs/verification.md', new URL('../docs/verification.md', import.meta.url)],
];

// Crea un directorio temporal con package.json y registro de prueba y devuelve
// las rutas para el validador (fixtures temporales, REQ-29-02/03).
function fixture(packageJson, registry) {
  const dir = mkdtempSync(join(tmpdir(), 'dependencies-registry-'));
  const pkgPath = join(dir, 'package.json');
  const regPath = join(dir, 'dependencies.md');
  writeFileSync(pkgPath, JSON.stringify(packageJson, null, 2), 'utf8');
  writeFileSync(regPath, registry, 'utf8');
  return { pkgPath, regPath, dir };
}

test('REQ-29-01: docs/dependencies.md existe y registra las 4 aprobadas con todos los campos', () => {
  assert.ok(existsSync(REGISTRY_URL), 'docs/dependencies.md no existe (REQ-29-01)');
  const entries = parseRegistry(readFileSync(REGISTRY_URL, 'utf8'));
  for (const name of ['astro', '@astrojs/cloudflare', 'wrangler', '@cloudflare/workers-types']) {
    assert.ok(entries.has(name), `docs/dependencies.md: falta la entrada aprobada "${name}" (REQ-29-01)`);
    for (const field of REQUIRED_FIELDS) {
      assert.ok(
        entries.get(name).fields[field] !== undefined,
        `docs/dependencies.md: la entrada "${name}" no declara "${field}" (REQ-29-01)`,
      );
    }
  }
});

test('REQ-29-01: versión y ámbito del registro cubren package.json (dependencies + devDependencies)', () => {
  const pkg = JSON.parse(readFileSync(PACKAGE_URL, 'utf8'));
  const entries = parseRegistry(readFileSync(REGISTRY_URL, 'utf8'));
  const scopes = ['dependencies', 'devDependencies'];
  for (const scope of scopes) {
    for (const [name, version] of Object.entries(pkg[scope] ?? {})) {
      const entry = entries.get(name);
      assert.ok(entry, `docs/dependencies.md: "${name}" (${scope}) sin entrada aprobada (REQ-29-01/02)`);
      assert.equal(entry.fields.version, version, `docs/dependencies.md: "${name}" version distinta de package.json (REQ-29-01)`);
      assert.equal(entry.fields.scope, scope, `docs/dependencies.md: "${name}" ámbito distinto de package.json (REQ-29-01)`);
    }
  }
});

test('REQ-29-02: el validador falla con una dependencia de package.json sin registro', () => {
  const { pkgPath, regPath, dir } = fixture(
    { name: 'test', dependencies: { astro: '^7.2.0', 'sin-registro': '^1.0.0' } },
    '### astro\n\n- version: ^7.2.0\n- scope: dependencies\n- approved: 2026-08-13\n- motivo: test\n',
  );
  try {
    const errors = validateDependencies(pkgPath, regPath);
    assert.ok(
      errors.some((error) => error.includes('sin-registro')),
      `el validador no señaló "sin-registro": ${JSON.stringify(errors)} (REQ-29-02)`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('REQ-29-03: el validador falla con una entrada del registro sin campos obligatorios', () => {
  const { pkgPath, regPath, dir } = fixture(
    { name: 'test', dependencies: { incompleta: '^2.0.0' } },
    '### incompleta\n\n- version: ^2.0.0\n- scope: dependencies\n- approved: 2026-08-13\n',
  );
  try {
    const errors = validateDependencies(pkgPath, regPath);
    assert.ok(
      errors.some((error) => error.includes('incompleta') && error.includes('motivo')),
      `el validador no señaló el campo faltante "motivo": ${JSON.stringify(errors)} (REQ-29-03)`,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('REQ-29-02/03: el validador no falla con el registro y package.json reales', () => {
  const errors = validateDependencies();
  assert.deepEqual(errors, [], `el validador falla con los archivos reales: ${JSON.stringify(errors)}`);
});

test('REQ-29-04/05: los documentos del arnés documentan la política de aprobación exclusiva del humano', () => {
  for (const [label, url] of HARNESS_DOCS) {
    const content = readFileSync(url, 'utf8');
    assert.ok(content.includes('docs/dependencies.md'), `${label}: no menciona docs/dependencies.md (REQ-29-05)`);
    assert.match(
      content,
      /decisi[oó]n exclusiva del humano/,
      `${label}: no documenta que la aprobación es decisión exclusiva del humano (REQ-29-04)`,
    );
    assert.match(content, /blocked/, `${label}: no menciona el estado blocked (REQ-29-04)`);
  }
});

test('REQ-29-06: check-format.mjs integra la validación del registro', () => {
  const checkFormat = readFileSync(CHECK_FORMAT_URL, 'utf8');
  assert.ok(checkFormat.includes('validate-dependencies'), 'check-format.mjs no importa el validador del registro (REQ-29-06)');
  assert.ok(checkFormat.includes('validateDependencies('), 'check-format.mjs no ejecuta validateDependencies (REQ-29-06)');
});

test('REQ-29-01..06: el validador del registro existe y no supera las 100 líneas', () => {
  assert.ok(existsSync(VALIDATOR_URL), 'scripts/validate-dependencies.mjs no existe');
  const lines = readFileSync(VALIDATOR_URL, 'utf8').split('\n');
  assert.ok(lines.length <= 100, `scripts/validate-dependencies.mjs tiene ${lines.length} líneas (>100)`);
});