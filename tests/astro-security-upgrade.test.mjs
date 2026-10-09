// Test de la actualización de seguridad de astro (feature 41
// astro-security-upgrade, REQ-41-01..03 y 08): rango y versión resuelta
// >= 7.2.8 (CVE crítica GHSA-26w7-cxv4-gfx2) y registro de dependencias con
// la versión nueva y la fecha de aprobación humana de los tres paquetes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const pkg = JSON.parse(read('package.json'));
const APPROVED = '2026-10-08';
const PACKAGES = ['astro', '@astrojs/cloudflare', 'wrangler'];

const parse = (v) => v.replace(/^[\^~>=\s]+/, '').split('.').map(Number);
const atLeast = (v, min) => {
  const [a, b] = [parse(v), parse(min)];
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return true;
};

// Versión resuelta del importer raíz en pnpm-lock.yaml (lectura por líneas:
// «      <paquete>:» → «        specifier: …» → «        version: X.Y.Z(…)»).
function lockedVersion(name) {
  const lines = read('pnpm-lock.yaml').split(/\r?\n/);
  const key = name.startsWith('@') ? `'${name}':` : `${name}:`;
  const at = lines.findIndex((line) => line === `      ${key}`);
  if (at < 0) return undefined;
  const versionLine = lines.slice(at + 1, at + 3).find((line) => line.trim().startsWith('version: '));
  return versionLine?.trim().slice('version: '.length).split('(')[0];
}

// Entrada ### <paquete> del registro: { version, approved }.
function registry(name) {
  const doc = read('docs/dependencies.md').replace(/\r\n/g, '\n');
  const block = doc.split('\n### ').find((b) => b.startsWith(`${name}\n`)) ?? '';
  return {
    version: block.match(/- version: (.+)/)?.[1]?.trim(),
    approved: block.match(/- approved: (.+)/)?.[1]?.trim(),
  };
}

test('REQ-41-01: package.json pide astro >= 7.2.8', () => {
  assert.ok(atLeast(pkg.dependencies.astro, '7.2.8'), `astro ${pkg.dependencies.astro}`);
});

test('REQ-41-02: pnpm-lock.yaml resuelve astro >= 7.2.8', () => {
  const version = lockedVersion('astro');
  assert.ok(version, 'no se encontró astro en el importer raíz del lockfile');
  assert.ok(atLeast(version, '7.2.8'), `astro resuelto a ${version}`);
});

test('REQ-41-03: el registro refleja versión y fecha de aprobación de los 3 paquetes', () => {
  for (const name of PACKAGES) {
    const entry = registry(name);
    assert.equal(entry.version, pkg.dependencies[name], `${name}: versión del registro`);
    assert.equal(entry.approved, APPROVED, `${name}: fecha de aprobación`);
  }
  assert.ok(atLeast(pkg.dependencies['@astrojs/cloudflare'], '14.3.0'), 'adapter sin subir de menor');
  assert.ok(atLeast(pkg.dependencies.wrangler, '4.122.0'), 'wrangler sin subir');
});
