// Test del fixture del guardián de tokens fuera de src/ (feature 59
// tokens-audit-tmp-fixture, REQ-59-01..08). El script audita el directorio
// que recibe como argumento (o src/styles sin él) y ningún test escribe en
// src/: el antiguo tmp-audit.css provocaba ENOENT en los tests que recorren
// src/ en paralelo bajo node --test.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { writesIntoSrc } from './helpers/src-write-guard.mjs';

const SCRIPT = fileURLToPath(new URL('../scripts/audit-design-tokens.mjs', import.meta.url));
const TESTS_DIR = fileURLToPath(new URL('./', import.meta.url));
const audit = (...args) => spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });

function withDir(files, fn) {
  const dir = mkdtempSync(join(tmpdir(), 'tokens-audit-'));
  try {
    for (const [name, css] of Object.entries(files)) writeFileSync(join(dir, name), css);
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test('REQ-59-01/03: con un directorio con hex suelto el script falla', () => {
  const run = withDir({ 'tokens.css': ':root { --c: #fff; }\n', 'sucia.css': '.x { color: #ab12cd; }\n' }, (dir) => audit(dir));
  assert.notEqual(run.status, 0, `debía fallar:\n${run.stdout}${run.stderr}`);
  assert.match(run.stderr, /sucia\.css:1/);
});

test('REQ-59-01: con tokens.css y una hoja limpia el script pasa', () => {
  const run = withDir({ 'tokens.css': ':root { --c: #fff; }\n', 'limpia.css': '.x { color: var(--c); }\n' }, (dir) => audit(dir));
  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
});

test('REQ-59-02: sin argumentos audita src/styles real con exit 0 y AUDIT', () => {
  const run = audit();
  assert.equal(run.status, 0, `${run.stdout}${run.stderr}`);
  assert.match(run.stdout, /AUDIT ✔ ningún color fuera de tokens\.css en src\/styles/);
});

test('REQ-59-04/05: REQ-12-06 usa un directorio temporal y lo borra en finally', () => {
  const src = readFileSync(join(TESTS_DIR, 'cleanup-dead-code.test.mjs'), 'utf8');
  assert.doesNotMatch(src, /tmp-audit\.css/);
  assert.match(src, /mkdtempSync\(join\(tmpdir\(\)/);
  assert.match(src, /finally\s*\{[^}]*rmSync\(/);
});

test('REQ-59-06: ningún test escribe ni borra dentro de src/', () => {
  const files = readdirSync(TESTS_DIR, { recursive: true }).filter((f) => f.endsWith('.mjs') && !f.endsWith('tokens-audit-tmp-fixture.test.mjs'));
  assert.ok(files.length > 50);
  for (const file of files) assert.deepEqual(writesIntoSrc(readFileSync(join(TESTS_DIR, file), 'utf8')), [], file);
});

// Autoverificación de la guarda (cambios requeridos de review_59.md, ronda 1):
// casos positivos (deben marcarse) y negativos (no deben marcarse).
const POSITIVE = {
  'URL derivada': "const h = new URL('src/styles/x.css', ROOT);\nconst r = fileURLToPath(h);\nunlinkSync(r);",
  'join con literal src/': "writeFileSync(join(ROOT, 'src/styles/a.css'), 'x');",
  "segmento suelto 'src'": "const p = resolve(ROOT, 'src', 'styles');\nmkdirSync(p, { recursive: true });",
  'asignación multilínea': "const target = join(\n  ROOT,\n  'src',\n  'x.css',\n);\nwriteFileSync(target, 'y');",
  'destino de renameSync': "renameSync(tmpFile, join(ROOT, 'src/x.css'));",
  'node:fs/promises': "await fs.writeFile(new URL('../src/a.css', import.meta.url), 'x');",
  copyFileSync: "copyFileSync(origen, join(ROOT, 'src', 'b.css'));",
  'salto de línea tras el =': "const p =\n  join(ROOT, 'src/x');\nwriteFileSync(p, 'x');",
  'reasignación sin declaración': "let p;\np = join(ROOT, 'src/x');\nwriteFileSync(p, 'x');",
};
const NEGATIVE = {
  'directorio temporal': "const dir = mkdtempSync(join(tmpdir(), 'x-'));\nwriteFileSync(join(dir, 'a.css'), 'src/ content');\nrmSync(dir, { recursive: true });",
  'comparación y flecha no son asignaciones': "const ok = a === 'src/x';\nconst f = (x) => x;\nwriteFileSync(f, 'y');",
  'solo lectura de src/': "const LAYOUT = new URL('../src/layouts/Layout.astro', import.meta.url);\nreadFileSync(LAYOUT, 'utf8');",
};

test('REQ-59-06 (autoverificación): la guarda detecta los casos positivos y no los negativos', () => {
  for (const [name, code] of Object.entries(POSITIVE)) assert.notDeepEqual(writesIntoSrc(code), [], `no detecta: ${name}`);
  for (const [name, code] of Object.entries(NEGATIVE)) assert.deepEqual(writesIntoSrc(code), [], `falso positivo: ${name}`);
});

test('REQ-59-08: el script no supera 100 líneas y solo importa node:', () => {
  const script = readFileSync(SCRIPT, 'utf8');
  assert.ok(script.split('\n').length <= 100);
  for (const [, mod] of script.matchAll(/from\s+'([^']+)'/g)) assert.match(mod, /^node:/, mod);
});
