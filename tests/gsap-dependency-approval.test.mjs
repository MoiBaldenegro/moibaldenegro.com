// Feature 70 (gsap-dependency-approval): alta de gsap (autorizada por el humano el 2026-10-09)
// para el scroll horizontal de las cards de la portada (feature 72). Licencia «Standard no
// charge» de Webflow, NO OSI. Spec: specs/70_gsap-dependency-approval/requirements.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseRegistry } from '../scripts/validate-dependencies.mjs';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const pkg = JSON.parse(read('package.json'));
const registry = read('docs/dependencies.md');
const gsapEntry = () => {
  const entry = parseRegistry(registry).get('gsap');
  assert.ok(entry, 'falta la entrada ### gsap en docs/dependencies.md');
  return entry.fields;
};

test('REQ-70-01/02: gsap en dependencies con versión exacta y el lockfile la resuelve igual', () => {
  const version = pkg.dependencies?.gsap;
  assert.match(version ?? '', /^[0-9]+[.][0-9]+[.][0-9]+$/, `versión no exacta: ${version}`);
  const lock = read('pnpm-lock.yaml');
  const importer = lock.slice(lock.indexOf('importers:'), lock.indexOf('packages:'));
  assert.match(importer, new RegExp(`gsap:[^]*?specifier: ${version.replace(/[.]/g, '[.]')}[^]*?version: ${version.replace(/[.]/g, '[.]')}`));
});

test('REQ-70-03: la entrada gsap del registro coincide con package.json', () => {
  const f = gsapEntry();
  assert.equal(f.version, pkg.dependencies.gsap);
  assert.equal(f.scope, 'dependencies');
  assert.equal(f.approved, '2026-10-09');
  assert.match(f.motivo ?? '', /portada/);
});

test('REQ-70-04/05: licencia NO OSI de Webflow y alcance limitado a la portada', () => {
  const f = gsapEntry();
  for (const s of ['Standard', 'no charge', 'Webflow', 'https://gsap.com/standard-license', 'NO OSI']) {
    assert.ok((f.licencia ?? '').includes(s), `licencia sin «${s}»`);
  }
  for (const s of ['portada', 'ScrollTrigger']) assert.ok((f.alcance ?? '').includes(s), `alcance sin «${s}»`);
});

test('REQ-70-06: nota de aprobación fechada 2026-10-09 y APLICADA en la feature 70', () => {
  const section = registry.slice(registry.indexOf('## Aprobaciones de cambio de versión'), registry.indexOf('### astro'));
  const note = section.split(/\r?\n[*] /).find((n) => n.startsWith('2026-10-09') && /GSAP/i.test(n));
  assert.ok(note, 'falta la nota del 2026-10-09 sobre GSAP');
  assert.match(note.replace(/\s+/g, ' '), /APLICADA en la feature 70/);
  assert.doesNotMatch(note, /PENDIENTE/);
});

test('REQ-70-07: sin .npmrc apuntando al registro privado de GreenSock', () => {
  const npmrc = new URL('.npmrc', root);
  assert.ok(!existsSync(npmrc) || !readFileSync(npmrc, 'utf8').includes('npm.greensock.com'));
});

// Ajuste feature 72 (precedente REQ-43-06): el primer y único uso de gsap es latest-horizontal.ts.
test('REQ-70-08/09: solo se añade gsap y solo latest-horizontal.ts lo importa', () => {
  assert.deepEqual(Object.keys(pkg.dependencies).sort(), ['@astrojs/cloudflare', 'astro', 'gsap', 'wrangler']);
  assert.deepEqual(Object.keys(pkg.devDependencies), ['@cloudflare/workers-types']);
  assert.equal(pkg.dependencies.astro, '^7.3.8');
  assert.equal(pkg.dependencies['@astrojs/cloudflare'], '^14.3.4');
  assert.equal(pkg.dependencies.wrangler, '^4.149.0');
  assert.equal(pkg.devDependencies['@cloudflare/workers-types'], '^5.20261009.1');
  const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
  for (const file of walk(fileURLToPath(new URL('src', root))).filter((f) => /[.](ts|astro|mjs|js)$/.test(f) && !f.endsWith('latest-horizontal.ts'))) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), /from ['"]gsap/, file);
  }
});
