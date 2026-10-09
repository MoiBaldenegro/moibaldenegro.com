// Test de la subida de @cloudflare/workers-types (feature 60
// workers-types-upgrade, REQ-60-01..04): devDependency >= 5.20261006.1 (peer
// de wrangler 4.149.0), lockfile resuelto en consecuencia y registro de
// dependencias con la versión nueva, la fecha de aprobación humana y la nota
// marcada como APLICADA.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const NAME = '@cloudflare/workers-types';
const MIN = '5.20261006.1';
const pkg = JSON.parse(read('package.json'));

const parse = (v) => v.replace(/^[~^>=\s]+/, '').split('.').map(Number);
const atLeast = (v, min) => {
  const [a, b] = [parse(v), parse(min)];
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return true;
};

// Versión del importer raíz del lockfile (lectura por líneas, sin regex).
function lockedVersion() {
  const lines = read('pnpm-lock.yaml').split(/\r?\n/);
  const at = lines.findIndex((line) => line === `      '${NAME}':`);
  if (at < 0) return undefined;
  const versionLine = lines.slice(at + 1, at + 3).find((line) => line.trim().startsWith('version: '));
  return versionLine?.trim().slice('version: '.length).split('(')[0];
}

function registryBlock() {
  const doc = read('docs/dependencies.md').replace(/\r\n/g, '\n');
  return doc.split('\n### ').find((block) => block.startsWith(`${NAME}\n`)) ?? '';
}

test('REQ-60-01: package.json pide workers-types >= 5.20261006.1 en devDependencies', () => {
  const range = pkg.devDependencies?.[NAME];
  assert.ok(range, `${NAME} no está en devDependencies`);
  assert.ok(atLeast(range, MIN), `rango ${range}`);
});

test('REQ-60-02: el lockfile resuelve una 5.x >= 5.20261006.1', () => {
  const version = lockedVersion();
  assert.ok(version, 'no se encontró el paquete en el importer raíz');
  assert.equal(parse(version)[0], 5, `major distinta de 5: ${version}`);
  assert.ok(atLeast(version, MIN), `resuelto a ${version}`);
});

test('REQ-60-03: el registro muestra la versión de package.json y approved: 2026-10-08', () => {
  const block = registryBlock();
  const field = (key) => block.split('\n').find((line) => line.startsWith(`- ${key}: `))?.slice(key.length + 4).trim();
  assert.equal(field('version'), pkg.devDependencies[NAME]);
  assert.equal(field('approved'), '2026-10-08');
});

test('REQ-60-04: la nota de aprobación queda APLICADA en la feature 60', () => {
  const doc = read('docs/dependencies.md').replace(/\s+/g, ' ');
  const at = doc.indexOf('subir @cloudflare/workers-types');
  assert.ok(at >= 0, 'no se encuentra la nota de aprobación');
  const note = doc.slice(at, doc.indexOf('###', at));
  assert.match(note, /APLICADA en la feature 60/);
  assert.doesNotMatch(note, /PENDIENTE/);
});
