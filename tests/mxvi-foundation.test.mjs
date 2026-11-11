// Test de la feature 10 mxvi-foundation (REQ-10-01..10). Spec: specs/10_mxvi-foundation/.
// node:test, sin dependencias. La copia de src/styles/mxvi/ no se edita a mano: manifest.json lo vigila.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';

const MXVI = 'src/styles/mxvi';
const read = (path) => readFileSync(path, 'utf8');
const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex');
const cssFiles = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? cssFiles(path) : name.endsWith('.css') ? [path] : [];
});
const manifest = () => JSON.parse(read(join(MXVI, 'manifest.json')));

test('REQ-10-01: copia de components.css, components/ y manifest.json', () => {
  for (const path of ['components.css', 'components', 'manifest.json']) assert.ok(existsSync(join(MXVI, path)), path);
});

test('REQ-10-03/04: el manifiesto declara el origen y cada sha256 coincide', () => {
  const { source, files } = manifest();
  assert.ok(source && source.length > 0, 'manifest.json sin origen');
  assert.ok(Object.keys(files).length > 1, 'manifest.json sin archivos');
  for (const [file, hash] of Object.entries(files)) {
    assert.equal(sha256(join(MXVI, file)), hash, `${file} no coincide con manifest.json: no se edita a mano`);
  }
});

test('REQ-10-05: la carpeta y el manifiesto declaran las mismas hojas', () => {
  const declared = Object.keys(manifest().files).sort();
  const onDisk = cssFiles(MXVI).map((path) => relative(MXVI, path)).sort();
  assert.deepEqual(onDisk, declared);
});

test('REQ-10-06/07: hojas de <=100 líneas y sin colores literales', () => {
  for (const path of cssFiles(MXVI)) {
    const css = read(path);
    assert.ok(css.trimEnd().split('\n').length <= 100, `${path} supera 100 líneas`);
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(/, `${path} tiene un color literal`);
  }
});

test('REQ-10-08: cada custom property leída existe en tokens.css o en las hojas', () => {
  const sheets = cssFiles(MXVI).map(read).join('\n');
  const defined = new Set([...(read('src/styles/tokens.css') + sheets).matchAll(/(--[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const used = new Set([...sheets.matchAll(/var\((--[a-z0-9-]+)/g)].map((m) => m[1]));
  for (const name of used) assert.ok(defined.has(name), `${name} no está definida`);
});

test('REQ-10-09: Layout.astro importa components.css después de tokens y base (REQ-11-02, REQ-15-11)', () => {
  const layout = read('src/layouts/Layout.astro');
  const at = (path) => layout.indexOf(`import "../styles/${path}";`);
  assert.ok(at('mxvi/components.css') > 0, 'falta el import de mxvi/components.css');
  for (const path of ['tokens.css', 'mxvi/base.css']) assert.ok(at(path) >= 0 && at(path) < at('mxvi/components.css'), path);
});

test('REQ-10-10: scripts/sync-mxvi.mjs solo importa módulos de node:', () => {
  const imports = [...read('scripts/sync-mxvi.mjs').matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]);
  assert.ok(imports.length > 0);
  for (const name of imports) assert.match(name, /^node:/, name);
});

test('REQ-10-02/03: el script copia una carpeta mxvi local y escribe el manifiesto', () => {
  const root = mkdtempSync(join(tmpdir(), 'mxvi-'));
  const source = join(root, 'mxvi');
  mkdirSync(join(source, 'components', 'atoms'), { recursive: true });
  writeFileSync(join(source, 'base.css'), 'body { margin: 0; }\n'); // REQ-11-01
  writeFileSync(join(source, 'components.css'), "@import './components/atoms/a.css';\n");
  writeFileSync(join(source, 'components', 'atoms', 'a.css'), '.mx-a { color: var(--color-text); }\n');
  const out = join(root, 'out');
  execFileSync(process.execPath, ['scripts/sync-mxvi.mjs', source, '--out', out]);
  const written = JSON.parse(read(join(out, 'manifest.json')));
  assert.deepEqual(Object.keys(written.files).sort(), ['base.css', 'components.css', 'components/atoms/a.css']);
  assert.equal(written.files['components/atoms/a.css'], sha256(join(out, 'components', 'atoms', 'a.css')));
});
