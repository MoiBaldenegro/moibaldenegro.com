// Test de limpieza del manifest y de la meta generator (feature 58
// manifest-generator-cleanup, REQ-58-01..05): nombre real del sitio en
// site.webmanifest y sin <meta name="generator"> (huella de versión) en el
// Layout ni en el HTML del build (outDir temporal, helper de builds).
// Ajuste feature 66 (precedente REQ-43-06): el dominio del sitio pasa a moisesbaldenegro.com.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');

test('REQ-58-01: site.webmanifest declara el nombre real del sitio', () => {
  const manifest = JSON.parse(read('public/site.webmanifest'));
  assert.equal(manifest.name, 'moisesbaldenegro.com');
  assert.equal(manifest.short_name, 'moisesbaldenegro.com');
});

test('REQ-58-02: Layout.astro no emite la meta generator', () => {
  const layout = read('src/layouts/Layout.astro');
  assert.doesNotMatch(layout, /name="generator"/);
  assert.doesNotMatch(layout, /Astro\.generator/);
});

test('REQ-58-03 (build): ninguna página del build lleva meta generator', () => {
  const out = mkdtempSync(join(tmpdir(), 'generator-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const client = join(out, 'client');
    const pages = ['index.html', join('about', 'index.html'), join('search', 'index.html'), '404.html',
      ...readdirSync(join(client, 'posts')).map((slug) => join('posts', slug, 'index.html'))];
    for (const rel of pages) assert.doesNotMatch(readFileSync(join(client, rel), 'utf8'), /name="generator"/, rel);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-58-05: Layout.astro no supera 100 líneas', () => {
  assert.ok(read('src/layouts/Layout.astro').split('\n').length <= 100);
});
