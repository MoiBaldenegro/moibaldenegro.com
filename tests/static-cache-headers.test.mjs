// Test de las políticas de caché (feature 49 static-cache-headers,
// REQ-49-01..07): /assets/* con caché de una semana en public/_headers, la
// isla de HTB con una hora desde una constante de dominio, el HTML sin caché
// larga y el build con las tres reglas (outDir temporal, helper de builds).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { ASSETS_CACHE_CONTROL, HTB_ISLAND_CACHE_CONTROL } from '../src/domain/http/cache-policy.ts';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

function parseHeaders(text) {
  const rules = {};
  let current = null;
  for (const line of text.split(/\r?\n/)) {
    if (line.trim() === '' || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) { current = line.trim(); rules[current] = {}; continue; }
    const at = line.indexOf(':');
    rules[current][line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return rules;
}

test('REQ-49-02: constantes de política de caché', () => {
  assert.equal(ASSETS_CACHE_CONTROL, 'public, max-age=604800');
  assert.equal(HTB_ISLAND_CACHE_CONTROL, 'public, max-age=3600');
});

test('REQ-49-01: public/_headers cachea /assets/* una semana', () => {
  assert.equal(parseHeaders(read('public/_headers'))['/assets/*']?.['Cache-Control'], ASSETS_CACHE_CONTROL);
});

test('REQ-49-03: la isla de HTB fija Cache-Control con la constante', () => {
  const island = read('src/components/htb-stadistics.astro');
  assert.match(island, /import \{ HTB_ISLAND_CACHE_CONTROL \} from '\.\.\/domain\/http\/cache-policy\.ts'/);
  assert.match(island, /Astro\.response\.headers\.set\('Cache-Control', HTB_ISLAND_CACHE_CONTROL\)/);
});

test('REQ-49-04: ninguna regla da caché larga a /* ni a rutas HTML', () => {
  for (const [path, headers] of Object.entries(parseHeaders(read('public/_headers')))) {
    const maxAge = Number(headers['Cache-Control']?.match(/max-age=(\d+)/)?.[1] ?? 0);
    const htmlLike = path === '/*' || !/\.[a-z0-9]+$|\/\*$/i.test(path) || path.endsWith('.html');
    if (htmlLike) assert.equal(maxAge, 0, `${path} con max-age ${maxAge}`);
  }
});

test('REQ-49-05 (build): dist/client/_headers con /*, /_astro/* y /assets/*', () => {
  const out = mkdtempSync(join(tmpdir(), 'cache-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const rules = parseHeaders(readFileSync(join(out, 'client', '_headers'), 'utf8'));
    assert.equal(rules['/*']?.['X-Content-Type-Options'], 'nosniff');
    assert.equal(rules['/_astro/*']?.['Cache-Control'], 'public, max-age=31536000, immutable');
    assert.equal(rules['/assets/*']?.['Cache-Control'], ASSETS_CACHE_CONTROL);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-49-07: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of ['src/domain/http/cache-policy.ts', 'src/components/htb-stadistics.astro']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
