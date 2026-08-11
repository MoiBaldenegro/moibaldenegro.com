// Test de integridad del kit del arnés (feature 1: REQ-01-01..06).
// ALCANCE ACOTADO (REQ-01-04/05): verifica únicamente los archivos del kit
// (OBLIGATORY_FILES + plantillas de templates/), nunca el resto del repo.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const KIT_ROOT = new URL('../', import.meta.url);

const OBLIGATORY_FILES = [
  'AGENTS.md', 'KICKOFF.md', 'CHECKPOINTS.md', 'README.md', 'init.sh',
  'docs/architecture.md', 'docs/conventions.md', 'docs/verification.md',
  '.opencode/agents/spec_author.md', '.opencode/agents/leader.md',
  '.opencode/agents/implementer.md', '.opencode/agents/reviewer.md',
  '.opencode/agents/explorer.md', '.claude/agents/spec_author.md',
  '.claude/agents/leader.md', '.claude/agents/implementer.md',
  '.claude/agents/reviewer.md', '.claude/agents/explorer.md',
  'scripts/check-format.mjs', 'scripts/validate-feature-list.mjs',
  'scripts/validate-progress.mjs', 'scripts/validate-specs.mjs',
  'specs/_template/requirements.md', 'specs/_template/design.md',
  'templates/feature_list.json', 'templates/current.md', 'templates/history.md',
];

const FORBIDDEN_TOKENS = ['tomatesoft', 'cards-data', 'og-image', 'hero'];
const OUT_OF_SCOPE_DIRS = ['node_modules/', 'dist/', '.astro/', 'src/'];

// Archivos del kit a escanear: obligatorios existentes + plantillas.
function getKitFiles() {
  const files = [];
  for (const fileRel of OBLIGATORY_FILES) {
    const fileUrl = new URL(fileRel, KIT_ROOT);
    if (existsSync(fileUrl)) files.push(fileUrl);
  }
  const templatesUrl = new URL('templates/', KIT_ROOT);
  if (existsSync(templatesUrl)) {
    for (const entry of readdirSync(templatesUrl, { withFileTypes: true })) {
      if (entry.isFile()) files.push(new URL(`templates/${entry.name}`, KIT_ROOT));
    }
  }
  return files;
}

test('REQ-01-01/02: los archivos obligatorios del kit existen en disco', () => {
  for (const fileRel of OBLIGATORY_FILES) {
    assert.ok(existsSync(new URL(fileRel, KIT_ROOT)), `harness-kit/${fileRel}: no existe`);
  }
});

test('REQ-01-04/05: el escaneo nunca lee node_modules, dist, .astro ni src', () => {
  for (const fileUrl of getKitFiles()) {
    const rel = fileUrl.pathname.slice(KIT_ROOT.pathname.length);
    for (const dir of OUT_OF_SCOPE_DIRS) {
      assert.ok(!rel.startsWith(dir), `harness-kit/${rel}: archivo fuera del kit en el escaneo`);
    }
  }
});

test('REQ-01-05: los tokens de la app no aparecen en los archivos del kit', () => {
  for (const fileUrl of getKitFiles()) {
    const content = readFileSync(fileUrl, 'utf8').toLowerCase();
    const rel = fileUrl.pathname.slice(KIT_ROOT.pathname.length);
    for (const token of FORBIDDEN_TOKENS) {
      assert.ok(!content.includes(token), `harness-kit/${rel}: fuga "${token}"`);
    }
  }
});

test('REQ-01-01: templates/feature_list.json contiene una única feature de ejemplo', () => {
  const data = JSON.parse(readFileSync(new URL('templates/feature_list.json', KIT_ROOT), 'utf8'));
  assert.ok(Array.isArray(data.features), 'templates/feature_list.json: falta "features"');
  assert.equal(data.features.length, 1, `templates/feature_list.json: se esperaban 1, hay ${data.features.length}`);
});

test('REQ-01-02: las plantillas de progreso reproducen la estructura de progress/', () => {
  const current = readFileSync(new URL('templates/current.md', KIT_ROOT), 'utf8');
  for (const section of ['### Feature en curso', '### Plan', '### Bitácora', '### Estado']) {
    assert.ok(current.includes(section), `templates/current.md: falta "${section}"`);
  }
  const history = readFileSync(new URL('templates/history.md', KIT_ROOT), 'utf8');
  assert.ok(history.includes('## Sesiones'), 'templates/history.md: falta "## Sesiones"');
});

test('REQ-01-03: package.json define el script test con node:test sobre tests/', () => {
  const pkg = JSON.parse(readFileSync(new URL('package.json', KIT_ROOT), 'utf8'));
  assert.ok(typeof pkg.scripts?.test === 'string', 'package.json: falta el script "test"');
  assert.ok(pkg.scripts.test.includes('node --test'), 'package.json: el script test no usa node --test');
  assert.ok(pkg.scripts.test.includes('tests'), 'package.json: el script test no apunta a tests/');
});

test('REQ-01-06: init.sh termina con estado distinto de cero ante fallos', () => {
  const init = readFileSync(new URL('init.sh', KIT_ROOT), 'utf8');
  assert.ok(init.includes('FAILURES'), 'init.sh: falta el contador de fallos');
  assert.ok(init.includes('exit 1'), 'init.sh: falta la salida con estado 1');
});
