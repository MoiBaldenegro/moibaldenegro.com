// Feature 74 (csp-router-inline-script): con la CSP obligatoria (REQ-64-11), el router de Astro
// insertaba <script type="module" src="data:application/javascript,"> al navegar hacia una página
// cuyo último script module era inline (code-copy en los posts) y la CSP lo bloqueaba. Se evita
// sin tocar la CSP: los scripts de componentes Astro nunca se incrustan (assetsInlineLimit).
// Spec: specs/74_csp-router-inline-script/requirements.md. Navegación real en impl_74.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { SECURITY_HEADERS } from '../src/domain/http/security-headers.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const CSP = "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'";
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));

test('REQ-74-01: assetsInlineLimit es una función que no incrusta los scripts de componentes', async () => {
  const config = read('astro.config.mjs');
  assert.match(config, /assetsInlineLimit:[^\n]*=>/);
  assert.ok(config.includes('astro_type_script'));
  const { default: cfg } = await import(new URL('astro.config.mjs', root).href);
  const fn = cfg.vite?.build?.assetsInlineLimit;
  assert.equal(typeof fn, 'function');
  assert.equal(fn('/src/components/code-copy/code-copy.astro?astro&type=script&index=0&lang.ts', 'x'), false);
  assert.equal(fn('C:/x/code-copy.astro_astro_type_script_index_0_lang.ts', 'x'), false);
  assert.equal(fn('/src/assets/logo.svg', 'x'), undefined);
});

test('REQ-74-03: la CSP sigue siendo la de REQ-64-11', () => {
  assert.equal(SECURITY_HEADERS['Content-Security-Policy'], CSP);
  assert.ok(read('public/_headers').includes(`  Content-Security-Policy: ${CSP}`));
});

test('REQ-74-02/04 (build): el último script module de cada HTML es externo y code-copy es un chunk', () => {
  const out = mkdtempSync(join(tmpdir(), 'router-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const htmls = walk(join(out, 'client')).filter((f) => f.endsWith('.html'));
    assert.ok(htmls.length > 5);
    for (const file of htmls) {
      const modules = [...readFileSync(file, 'utf8').matchAll(/<script\b[^>]*type="module"[^>]*>/g)].map((m) => m[0]);
      if (modules.length === 0) continue;
      assert.match(modules.at(-1), /[ ]src="/, `${file}: el último script module es inline`);
    }
    const post = readFileSync(join(out, 'client', 'posts', '03-principios-solid', 'index.html'), 'utf8');
    assert.match(post, /<script[^>]*type="module"[^>]*src="[/]_astro[/][^"]*code-copy[^"]*[.]js"/);
    assert.doesNotMatch(post, /<script type="module">[^<]*(initCodeCopy|code-copy|astro:page-load)/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-74-09: astro.config.mjs y este test no superan 100 líneas', () => {
  for (const rel of ['astro.config.mjs', 'tests/csp-router-inline-script.test.mjs']) {
    const s = read(rel);
    assert.ok(s.split('\n').length - (s.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
