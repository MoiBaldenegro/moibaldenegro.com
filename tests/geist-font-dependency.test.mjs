// Feature 85 geist-font-base: alta de la dependencia geist 1.7.2 (REQ-85-01..05; REQ-85-06 en
// gsap-dependency-approval.test.mjs). Spec: specs/85_geist-font-base/requirements.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseRegistry } from '../scripts/validate-dependencies.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const pkg = JSON.parse(read('package.json'));

test('REQ-85-01/02/03: geist 1.7.2 exacta, override del peer next y lockfile sin next/react', () => {
  assert.equal(pkg.dependencies?.geist, '1.7.2');
  assert.deepEqual(pkg.pnpm?.overrides, { 'geist>next': '-' });
  const lock = read('pnpm-lock.yaml');
  assert.match(lock, /geist@1\.7\.2/);
  assert.doesNotMatch(lock, /^\s+(next|react|react-dom)@/m);
});

test('REQ-85-04: entrada ### geist en el registro de dependencias', () => {
  const f = parseRegistry(read('docs/dependencies.md')).get('geist')?.fields;
  assert.ok(f, 'falta la entrada ### geist');
  assert.equal(f.version, '1.7.2');
  assert.equal(f.scope, 'dependencies');
  assert.equal(f.approved, '2026-10-12');
  assert.ok((f.motivo ?? '').length > 0, 'falta motivo');
  assert.match(f.licencia ?? '', /SIL Open Font License 1\.1/);
  assert.ok((f.alcance ?? '').length > 0, 'falta alcance');
});

test('REQ-85-05: la nota de Geist del 2026-10-12 queda APLICADA en la feature 85 (Pixel en la 86)', () => {
  const reg = read('docs/dependencies.md');
  const section = reg.slice(reg.indexOf('## Aprobaciones de cambio de versión'), reg.indexOf('### astro'));
  const note = section.split(/\r?\n[*] /).find((n) => n.startsWith('2026-10-12') && /Geist/.test(n));
  assert.ok(note, 'falta la nota del 2026-10-12 sobre Geist');
  const flat = note.replace(/\s+/g, ' ');
  assert.match(flat, /APLICADA en la feature 85/);
  assert.match(flat, /feature 86/);
  assert.doesNotMatch(note, /PENDIENTE/);
});
