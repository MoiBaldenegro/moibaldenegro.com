// Test de las cabeceras de seguridad (feature 40 security-headers,
// REQ-40-01..08): módulo único de valores, public/_headers idéntico, el
// middleware las añade sin pisar las existentes y el build conserva la regla
// /_astro/* del adapter (outDir temporal, serializado con el helper).
// Ajuste feature 64 (precedente REQ-43-06): la CSP pasa de solo-reporte a obligatoria;
// EXPECTED usa la clave Content-Security-Policy; su valor es la política de REQ-64-11
// (sustituye a REQ-40-06: añade Cloudflare Web Analytics, ajuste REQ-64-13).
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
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'";
const EXPECTED = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy': CSP,
};

// Reglas de un archivo _headers de Cloudflare: { '/ruta': { Cabecera: valor } }.
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

test('REQ-40-01/06: el módulo exporta las cinco cabeceras exactas y congeladas', () => {
  assert.deepEqual({ ...SECURITY_HEADERS }, EXPECTED);
  assert.ok(Object.isFrozen(SECURITY_HEADERS));
  assert.equal(SECURITY_HEADERS['Content-Security-Policy'], CSP);
});

test('REQ-40-02: public/_headers replica el módulo en la regla /*', () => {
  assert.ok(existsSync(new URL('public/_headers', root)), 'falta public/_headers');
  assert.deepEqual(parseHeaders(read('public/_headers'))['/*'], EXPECTED);
});

test('REQ-40-03: el middleware añade las cinco cabeceras a la respuesta del Worker', async () => {
  const response = await onRequest({}, async () => new Response('ok'));
  for (const [name, value] of Object.entries(EXPECTED)) assert.equal(response.headers.get(name), value, name);
});

test('REQ-40-04: el middleware conserva un valor existente sin duplicarlo', async () => {
  const response = await onRequest({}, async () => new Response('ok', { headers: { 'Referrer-Policy': 'no-referrer' } }));
  assert.equal(response.headers.get('Referrer-Policy'), 'no-referrer');
  assert.equal(response.headers.get('X-Frame-Options'), 'DENY');
});

test('REQ-40-03: una respuesta con cabeceras inmutables (Response.redirect) también las recibe', async () => {
  const response = await onRequest({}, async () => Response.redirect('https://moibaldenegro.com/', 302));
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), 'https://moibaldenegro.com/');
  assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
});

test('REQ-40-05 (build): dist/client/_headers con la regla /* y la de /_astro/*', () => {
  const out = mkdtempSync(join(tmpdir(), 'headers-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const rules = parseHeaders(readFileSync(join(out, 'client', '_headers'), 'utf8'));
    assert.deepEqual(rules['/*'], EXPECTED);
    assert.equal(rules['/_astro/*']?.['Cache-Control'], 'public, max-age=31536000, immutable');
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-40-08: los archivos de src/ creados no superan 100 líneas', () => {
  for (const rel of ['src/domain/http/security-headers.ts', 'src/middleware.ts']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
