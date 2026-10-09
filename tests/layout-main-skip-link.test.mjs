// Test del main único y del enlace «Saltar al contenido» (feature 38
// layout-main-skip-link, REQ-38-01..10). Inspección de Layout, páginas,
// componentes y layout.css + build real a un outDir temporal (no pisa dist/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { astroBuild } from './helpers/astro-build.mjs';
import { join } from 'node:path';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const LAYOUT = 'src/layouts/Layout.astro';
const files = (dir) => readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? files(`${dir}${e.name}/`) : e.name.endsWith('.astro') ? [`${dir}${e.name}`] : []);
const css = () => read('src/styles/layout.css').replace(/\/\*[\s\S]*?\*\//g, '');
const rule = (selector) => {
  for (const block of css().split('}')) {
    const [head, body = ''] = block.split('{');
    if (head.trim() === selector) return body;
  }
  return '';
};

test('REQ-38-01: el Layout envuelve el slot en <main id="contenido">', () => {
  assert.match(read(LAYOUT), /<main id="contenido"[^>]*>\s*<slot \/>\s*<\/main>/);
});

test('REQ-38-03: ninguna página ni componente declara <main', () => {
  for (const file of [...files('src/pages/'), ...files('src/components/')]) {
    assert.doesNotMatch(read(file), /<main\b/, file);
  }
});

test('REQ-38-05/06/07: .skip-link fuera de vista y visible al foco, solo tokens', () => {
  const base = rule('.skip-link');
  const focus = rule('.skip-link:focus');
  assert.match(base, /transform:\s*translateY\(-|top:\s*-/, 'el skip-link no sale de la vista');
  assert.doesNotMatch(base, /display:\s*none|visibility:\s*hidden/);
  assert.match(focus, /transform:\s*none|top:\s*\d/, 'el foco no devuelve el enlace a la vista');
  const z = Number(base.match(/z-index:\s*(\d+)/)?.[1] ?? focus.match(/z-index:\s*(\d+)/)?.[1]);
  const navZ = Number(css().match(/\.site-navbar\s*\{[^}]*z-index:\s*(\d+)/)?.[1]);
  assert.ok(z > navZ, `z-index ${z} no supera al navbar (${navZ})`);
  for (const body of [base, focus]) assert.doesNotMatch(body, /#[0-9a-f]{3,8}\b|rgba?\(/i);
  assert.match(base, /var\(--color-accent\)/);
  assert.match(base, /var\(--radius-pill\)/);
});

test('REQ-38-08: los tests de la página de post ya no exigen <main class="post">', () => {
  for (const rel of ['tests/post-header.test.mjs', 'tests/post-page-styles.test.mjs']) {
    const src = read(rel);
    assert.doesNotMatch(src, /<main class="post">/, rel);
    assert.match(src, /REQ-43-06/, `${rel} no documenta el ajuste`);
  }
});

test('REQ-38-02/04 (build): skip-link primero en body y un único main por página', () => {
  const out = mkdtempSync(join(tmpdir(), 'main-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const html = (rel) => readFileSync(join(out, 'client', rel), 'utf8');
    const posts = readdirSync(join(out, 'client', 'posts')).map((slug) => join('posts', slug, 'index.html'));
    for (const rel of ['index.html', 'about/index.html', 'search/index.html', '404.html', ...posts]) {
      const page = html(rel);
      assert.equal(page.match(/<main\b/g)?.length ?? 0, 1, `${rel}: número de <main>`);
      const firstInBody = page.match(/<body[^>]*>\s*(<[^>]+>)/)?.[1] ?? '';
      assert.match(firstInBody, /^<a class="skip-link" href="#contenido">/, `${rel}: primer hijo ${firstInBody}`);
      assert.ok(page.includes('>Saltar al contenido</a>'), `${rel}: falta el texto del skip-link`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-38-10: los archivos de src/ tocados no superan 100 líneas', () => {
  const touched = [LAYOUT, 'src/styles/layout.css', 'src/components/new-hero/new-hero.astro', 'src/components/not-found/not-found.astro',
    'src/pages/about.astro', 'src/pages/posts/[id].astro', 'src/pages/search.astro', 'src/pages/[...term].astro'];
  for (const rel of touched) if (existsSync(new URL(rel, root))) assert.ok(read(rel).split('\n').length <= 100, rel);
});
