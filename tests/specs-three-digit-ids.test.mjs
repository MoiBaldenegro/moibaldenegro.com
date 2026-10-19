// El validador de specs acepta ids de feature de 2 o más dígitos (feature 100
// specs-three-digit-ids, REQ-100-01..12, specs/100_specs-three-digit-ids/requirements.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateRequirements, validateSpecs } from '../scripts/validate-specs.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const validator = read('scripts/validate-specs.mjs');
const SENTENCE = 'El sitio SHALL mostrar un mensaje de confirmación.';
const NO_PREFIX = 'línea 1: falta el prefijo REQ-<NN>-<xx>';

test('REQ-100-01: REQ_PREFIX acepta 2 o más dígitos en el primer grupo y 2 en el segundo', () => {
  assert.ok(validator.includes(String.raw`const REQ_PREFIX = /^REQ-(\d{2,})-(\d{2})\s+(.+)$/;`));
});

test('REQ-100-07: EARS, SHALL_COUNT y VAGUE no cambian', () => {
  const lines = [
    String.raw`const EARS = /^(?:(?:WHEN\s+[^,]+,|WHILE\s+[^,]+,|IF\s+[^,]+, THEN)\s*)?[^,]+?\s+SHALL\s+.+?(?:,\s*WHERE\s+.+)?$/i;`,
    String.raw`const SHALL_COUNT = /\bSHALL\b/gi;`,
    String.raw`const VAGUE = /\b(soportar|mejorar|debe ser)\b/i;`,
    "if (existsSync(designPath) && statSync(designPath).size === 0) {",
  ];
  for (const line of lines) assert.ok(validator.includes(line), line);
});

test('REQ-100-02: REQ-100-01 válido con expectedNn "100" no da errores', () => {
  assert.deepEqual(validateRequirements(`REQ-100-01 ${SENTENCE}`, '100'), []);
});

test('REQ-100-03: REQ-07-01 válido con expectedNn "07" no da errores', () => {
  assert.deepEqual(validateRequirements(`REQ-07-01 ${SENTENCE}`, '07'), []);
});

test('REQ-100-04: id de feature distinto de expectedNn da el error de prefijo', () => {
  assert.deepEqual(validateRequirements(`REQ-10-01 ${SENTENCE}`, '100'),
    ['línea 1: prefijo REQ-10-01 no coincide con la feature 100']);
  assert.deepEqual(validateRequirements(`REQ-100-01 ${SENTENCE}`, '10'),
    ['línea 1: prefijo REQ-100-01 no coincide con la feature 10']);
});

test('REQ-100-05: id de 1 dígito o secuencial de 3 dígitos no tienen prefijo válido', () => {
  assert.deepEqual(validateRequirements(`REQ-7-01 ${SENTENCE}`, '07'), [NO_PREFIX]);
  assert.deepEqual(validateRequirements(`REQ-07-001 ${SENTENCE}`, '07'), [NO_PREFIX]);
});

test('REQ-100-06: validateSpecs resuelve specs/07_<slug> y specs/100_<slug>', () => {
  const dir = mkdtempSync(join(tmpdir(), 'specs-three-digit-'));
  try {
    const featureListPath = join(dir, 'feature_list.json');
    const specsRoot = join(dir, 'specs');
    writeFileSync(featureListPath, JSON.stringify({ features: [
      { id: 7, name: 'seven-feature', status: 'pending' },
      { id: 100, name: 'hundred-feature', status: 'pending' },
    ] }));
    for (const [nn, slug] of [['07', 'seven-feature'], ['100', 'hundred-feature']]) {
      mkdirSync(join(specsRoot, `${nn}_${slug}`), { recursive: true });
      writeFileSync(join(specsRoot, `${nn}_${slug}`, 'requirements.md'),
        `# Requisitos\n\nREQ-${nn}-01 ${SENTENCE}\n`);
    }
    assert.deepEqual(validateSpecs({ featureListPath, specsRoot }), []);
    rmSync(join(specsRoot, '100_hundred-feature', 'requirements.md'));
    assert.deepEqual(validateSpecs({ featureListPath, specsRoot }),
      ['feature 100 hundred-feature: falta specs/100_hundred-feature/requirements.md']);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('REQ-100-10: check-format termina con código 0 con las features 100 y 101 en el backlog', () => {
  const ids = JSON.parse(read('feature_list.json')).features.map((f) => f.id);
  assert.ok(ids.includes(100) && ids.includes(101));
  const run = spawnSync(process.execPath, ['scripts/check-format.mjs'],
    { cwd: fileURLToPath(root), encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
});

test('REQ-100-11: <NN> es padding mínimo a 2 dígitos con 3 o más desde el id 100', () => {
  for (const rel of ['docs/conventions.md', 'specs/_template/requirements.md']) {
    const text = read(rel).replace(/\s+/g, ' ');
    assert.ok(text.includes('padding mínimo a 2 dígitos'), rel);
    assert.ok(text.includes('3 o más dígitos desde el id 100'), rel);
  }
});
