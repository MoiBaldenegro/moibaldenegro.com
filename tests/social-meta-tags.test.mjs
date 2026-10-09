// Test de Open Graph y Twitter/X cards (feature 43 social-meta-tags,
// REQ-43-01..08): función pura socialMeta y HTML real del build (outDir
// temporal, serializado con el helper de builds).
// Ajuste feature 66 (precedente REQ-43-06): el dominio del sitio pasa a moisesbaldenegro.com.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { socialMeta } from '../src/domain/seo/social.ts';
import { canonicalUrl } from '../src/domain/seo/head.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const SITE = 'https://moisesbaldenegro.com';
const asMap = (tags) => Object.fromEntries(tags.map((t) => [t.property ?? t.name, t.content]));
const page = asMap(socialMeta({ title: 'About | moisesbaldenegro.com', description: 'Desc', pathname: '/about/', site: SITE }));
const post = asMap(socialMeta({
  title: 'Post | moisesbaldenegro.com', description: 'Post desc', pathname: '/posts/00-agilismo/', site: SITE,
  image: '/assets/content/arch00.webp', type: 'article', published: '19 Septiembre 2026', modified: '1 Octubre 2026',
}));

test('REQ-43-01: siete propiedades og no vacías, site_name y locale', () => {
  for (const key of ['og:title', 'og:description', 'og:url', 'og:image', 'og:type', 'og:site_name', 'og:locale']) {
    assert.ok(page[key], `${key} vacío`);
  }
  assert.equal(page['og:site_name'], 'moisesbaldenegro.com');
  assert.equal(page['og:locale'], 'es_MX');
  assert.equal(page['og:type'], 'website');
});

test('REQ-43-02: og:url = canonical y og:image absoluta', () => {
  assert.equal(page['og:url'], canonicalUrl('/about/', SITE));
  assert.ok(page['og:image'].startsWith(`${SITE}/`));
  assert.equal(post['og:image'], `${SITE}/assets/content/arch00.webp`);
});

test('REQ-43-03: twitter:card y twitter:site', () => {
  assert.equal(page['twitter:card'], 'summary_large_image');
  assert.equal(page['twitter:site'], '@moibaldenegro');
});

test('REQ-43-04: los posts son article con fechas YYYY-MM-DD', () => {
  assert.equal(post['og:type'], 'article');
  assert.equal(post['article:published_time'], '2026-09-19');
  assert.equal(post['article:modified_time'], '2026-10-01');
  assert.equal(page['article:published_time'], undefined);
});

test('REQ-43-05: imagen por defecto moises-hero.jpg', () => {
  assert.equal(page['og:image'], `${SITE}/assets/moises-hero.jpg`);
});

test('REQ-43-06 (build): metas og y twitter en / y en un post', () => {
  const out = mkdtempSync(join(tmpdir(), 'social-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const html = (rel) => readFileSync(join(out, 'client', rel), 'utf8');
    const home = html('index.html');
    const article = html(join('posts', '01-procesos-memoria', 'index.html'));
    for (const doc of [home, article]) {
      assert.match(doc, /<meta property="og:title" content="[^"]+">/);
      assert.match(doc, /<meta property="og:image" content="https:\/\/moibaldenegro\.com\/[^"]+">/);
      assert.match(doc, /<meta name="twitter:card" content="summary_large_image">/);
    }
    assert.match(home, /<meta property="og:type" content="website">/);
    assert.match(article, /<meta property="og:type" content="article">/);
    assert.match(article, /<meta property="article:published_time" content="\d{4}-\d{2}-\d{2}">/);
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-43-08: los archivos de src/ tocados no superan 100 líneas', () => {
  for (const rel of ['src/domain/seo/social.ts', 'src/layouts/Layout.astro', 'src/pages/posts/[id].astro']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
