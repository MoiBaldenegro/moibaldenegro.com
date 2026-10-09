// Test del JSON-LD BlogPosting (feature 44 article-json-ld, REQ-44-01..08):
// funciones puras de src/domain/seo/json-ld.ts y HTML real del build (outDir
// temporal, serializado con el helper de builds).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { blogPostingJsonLd, serializeJsonLd } from '../src/domain/seo/json-ld.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const SITE = 'https://moibaldenegro.com';
const BACKSLASH = String.fromCharCode(92);
const POST = {
  id: '00-agilismo', slug: '00-agilismo', title: 'Agilismo', author: 'Moises Baldenegro', img: 'arch00.webp',
  readtime: 5, description: 'Desc', tags: ['arquitectura'], created: '19 Septiembre 2026', updated: '1 Octubre 2026',
  next: null, related: null,
};
const ld = blogPostingJsonLd(POST, SITE);

test('REQ-44-01: @context, @type BlogPosting y headline', () => {
  assert.equal(ld['@context'], 'https://schema.org');
  assert.equal(ld['@type'], 'BlogPosting');
  assert.equal(ld.headline, 'Agilismo');
});

test('REQ-44-02: fechas en YYYY-MM-DD desde el texto español', () => {
  assert.equal(ld.datePublished, '2026-09-19');
  assert.equal(ld.dateModified, '2026-10-01');
});

test('REQ-44-03: author Person con la URL de /about', () => {
  assert.deepEqual(ld.author, { '@type': 'Person', name: 'Moises Baldenegro', url: `${SITE}/about` });
});

test('REQ-44-04: image y mainEntityOfPage absolutas', () => {
  assert.equal(ld.image, `${SITE}/assets/content/arch00.webp`);
  assert.ok(ld.mainEntityOfPage.startsWith(`${SITE}/`), ld.mainEntityOfPage);
});

test('REQ-44-05: la serialización escapa </script', () => {
  const json = serializeJsonLd(blogPostingJsonLd({ ...POST, title: 'a </script> b' }, SITE));
  assert.ok(!/<\/script/i.test(json), json);
  assert.ok(json.includes(`<${BACKSLASH}/script`), json);
  assert.equal(JSON.parse(json).headline, 'a </script> b');
});

test('REQ-44-06 (build): un único ld+json BlogPosting por post', () => {
  const out = mkdtempSync(join(tmpdir(), 'jsonld-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const posts = join(out, 'client', 'posts');
    for (const slug of readdirSync(posts)) {
      const html = readFileSync(join(posts, slug, 'index.html'), 'utf8');
      const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
      assert.equal(scripts.length, 1, `${slug}: ${scripts.length} ld+json`);
      const data = JSON.parse(scripts[0][1]);
      assert.equal(data['@type'], 'BlogPosting', slug);
      assert.ok(data.headline && data.datePublished, slug);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-44-08: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of ['src/domain/seo/json-ld.ts', 'src/pages/posts/[id].astro']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
