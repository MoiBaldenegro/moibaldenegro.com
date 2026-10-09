// Feature 64 (csp-enforce): la CSP pasa de Report-Only a obligatoria. La revisión del HTML de
// producción (progress/research/csp_production_review.md) no encontró orígenes fuera de la
// política. Spec: specs/64_csp-enforce/requirements.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { astroBuild } from './helpers/astro-build.mjs';
import { SECURITY_HEADERS } from '../src/domain/http/security-headers.ts';
import { onRequest } from '../src/middleware.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const RO = ['Content-Security-Policy', 'Report-Only'].join('-');
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'";
const directive = (name) => CSP.split(';').map((d) => d.trim().split(/ +/)).find(([n]) => n === name)?.slice(1) ?? [];
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

test('REQ-64-01: SECURITY_HEADERS declara la CSP obligatoria y no la Report-Only', () => {
  assert.equal(SECURITY_HEADERS['Content-Security-Policy'], CSP);
  assert.ok(!(RO in SECURITY_HEADERS), `${RO} sigue en el módulo`);
});

test('REQ-64-02: la regla /* de public/_headers declara la misma CSP obligatoria', () => {
  const lines = read('public/_headers').split(/\r?\n/);
  const start = lines.indexOf('/*');
  assert.ok(start >= 0, 'falta la regla /*');
  const rule = [];
  for (const line of lines.slice(start + 1)) { if (!/^[ \t]+[^ ]/.test(line)) break; rule.push(line.trim()); }
  assert.ok(rule.includes(`Content-Security-Policy: ${CSP}`), 'CSP distinta o ausente en /*');
  assert.ok(!rule.some((l) => l.startsWith(`${RO}:`)), `${RO} sigue en /*`);
});

test('REQ-64-03: el middleware añade la CSP obligatoria a las respuestas del Worker', async () => {
  const res = await onRequest({}, async () => new Response('ok'));
  assert.equal(res.headers.get('Content-Security-Policy'), CSP);
  assert.equal(res.headers.get(RO), null);
});

test('REQ-64-04: ningún archivo de src/ ni public/ contiene la cabecera Report-Only', () => {
  for (const dir of ['src', 'public']) {
    for (const file of walk(fileURLToPath(new URL(dir, root)))) {
      if (/[.](png|ico|webp|jpe?g|gif|svg|woff2?)$/i.test(file)) continue;
      assert.ok(!readFileSync(file, 'utf8').includes(RO), `${file} contiene ${RO}`);
    }
  }
});

const allowed = (url, kind) => {
  if (url.startsWith('data:')) return kind === 'img';
  if (!/^(https?:)?[/][/]/.test(url)) return true; // relativo o del propio sitio
  const origin = new URL(url, 'https://self.invalid').origin;
  const sources = directive(kind === 'iframe' ? 'frame-src' : `${kind}-src`);
  return sources.includes(origin) || (sources.length === 0 && directive('default-src').includes(origin));
};

test('REQ-64-05/06 (build): recursos de los HTML permitidos y bundles sin eval', () => {
  const out = mkdtempSync(join(tmpdir(), 'csp-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const files = walk(join(out, 'client'));
    for (const file of files.filter((f) => f.endsWith('.html'))) {
      const html = readFileSync(file, 'utf8');
      const refs = [
        ...[...html.matchAll(/<script[^>]*[ ]src="([^"]+)"/g)].map((m) => ['script', m[1]]),
        ...[...html.matchAll(/<link[^>]*rel="(?:stylesheet|preload)"[^>]*href="([^"]+)"/g)].map((m) => ['style', m[1]]),
        ...[...html.matchAll(/<img[^>]*[ ]src="([^"]+)"/g)].map((m) => ['img', m[1]]),
        ...[...html.matchAll(/<iframe[^>]*[ ]src="([^"]+)"/g)].map((m) => ['iframe', m[1]]),
      ];
      for (const [kind, url] of refs) assert.ok(allowed(url, kind), `${file}: ${kind} ${url} no permitido por la CSP`);
    }
    for (const file of files.filter((f) => /[/\]_astro[/\].*[.]js$/.test(f))) {
      const js = readFileSync(file, 'utf8');
      assert.ok(!/[^.\w]eval[(]/.test(js) && !/new Function[(]/.test(js), `${file} usa eval/new Function`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-64-10: security-headers.ts, _headers y este test ≤100 líneas', () => {
  for (const rel of ['src/domain/http/security-headers.ts', 'public/_headers', 'tests/csp-enforce.test.mjs']) {
    const src = read(rel);
    assert.ok(src.split('\n').length - (src.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
