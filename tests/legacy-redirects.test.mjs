// Feature 68 (deploy-redirects): el `redirects` de astro.config.mjs generaba un
// dist/client/_redirects inválido para Cloudflare (slug con espacio = 4 tokens, ñ sin
// codificar) y rompía todos los deploys. Las 301 de los slugs antiguos (feature 45) pasan
// al middleware vía legacyRedirect. Spec: specs/68_*/requirements.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { SECURITY_HEADERS } from '../src/domain/http/security-headers.ts';
import { onRequest } from '../src/middleware.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const MODULE = new URL('src/domain/http/legacy-redirects.ts', root);
const legacy = async () => {
  assert.ok(existsSync(MODULE), 'falta src/domain/http/legacy-redirects.ts (REQ-68-02)');
  return (await import(MODULE.href)).legacyRedirect;
};
const CASES = [
  ['/posts/03-principios%20solid', '/posts/03-principios-solid'],
  ['/posts/03-principios solid', '/posts/03-principios-solid'],
  ['/posts/01-dise%C3%B1o-detallado', '/posts/01-diseno-detallado'],
  ['/posts/01-diseño-detallado', '/posts/01-diseno-detallado'],
  ['/posts/02-ciclo-de-vida-y-arquitectura', '/posts/04-ciclo-de-vida-y-arquitectura'],
];

test('REQ-68-01: astro.config.mjs no declara redirects', () => {
  assert.doesNotMatch(read('astro.config.mjs'), /redirects[ ]*:/);
});

test('REQ-68-02/03: legacyRedirect mapea los slugs antiguos codificados y decodificados', async () => {
  const fn = await legacy();
  for (const [from, to] of CASES) assert.equal(fn(from), to, from);
});

test('REQ-68-04/05: barra final y ñ descompuesta dan el mismo destino', async () => {
  const fn = await legacy();
  for (const [from, to] of CASES) assert.equal(fn(`${from}/`), to, `${from}/`);
  assert.equal(fn('/posts/01-disen%CC%83o-detallado'), '/posts/01-diseno-detallado');
});

test('REQ-68-06: escapes inválidos y rutas ajenas devuelven null sin lanzar', async () => {
  const fn = await legacy();
  for (const path of ['/posts/%E0%A4%A', '/', '/posts/03-principios-solid', '/posts/otro']) assert.equal(fn(path), null, path);
});

test('REQ-68-07/08: el middleware responde 301 con query y cabeceras de seguridad sin llamar a next', async () => {
  let called = false;
  const res = await onRequest({ url: new URL('https://x/posts/03-principios%20solid/?a=1') }, async () => { called = true; return new Response('no'); });
  assert.equal(res.status, 301);
  assert.equal(res.headers.get('Location'), '/posts/03-principios-solid?a=1');
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) assert.equal(res.headers.get(name), value, name);
  assert.equal(called, false, 'next no debe llamarse');
});

test('REQ-68-09: sin url o sin slug antiguo delega en next con cabeceras de seguridad', async () => {
  for (const ctx of [{}, { url: new URL('https://x/posts/otro/') }]) {
    const res = await onRequest(ctx, async () => new Response('ok', { status: 200 }));
    assert.equal(res.status, 200);
    assert.equal(await res.text(), 'ok');
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) assert.equal(res.headers.get(name), value, name);
  }
});

test('REQ-68-10 (build): _redirects ausente o con líneas de 2-3 tokens ASCII', () => {
  const out = mkdtempSync(join(tmpdir(), 'redirects-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const file = join(out, 'client', '_redirects');
    if (!existsSync(file)) return;
    for (const line of readFileSync(file, 'utf8').split(/\r?\n/).filter((l) => l.trim())) {
      const tokens = line.trim().split(/[ \t]+/);
      assert.ok(tokens.length === 2 || tokens.length === 3, `línea con ${tokens.length} tokens: ${line}`);
      assert.match(line, /^[\x20-\x7e]*$/, `línea no ASCII: ${line}`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-68-14: legacy-redirects.ts, middleware.ts, astro.config.mjs y este test ≤100 líneas', () => {
  for (const rel of ['src/domain/http/legacy-redirects.ts', 'src/middleware.ts', 'astro.config.mjs', 'tests/legacy-redirects.test.mjs']) {
    assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`);
    const src = read(rel);
    assert.ok(src.split('\n').length - (src.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
