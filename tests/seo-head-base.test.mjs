// Test del SEO base del head (feature 35 seo-head-base, REQ-35-01..10).
// Unitarios de src/domain/seo/head.ts por import directo, inspección del
// Layout y de la config, y un build real a un outDir temporal (no pisa dist/).
//
// Ajuste feature 45 (precedente REQ-43-06): los slugs pasan a ASCII
// (03-principios-solid, 01-diseno-detallado, 04-ciclo-de-vida-y-arquitectura);
// las URLs antiguas redirigen con 301 desde astro.config.mjs.
// Ajuste feature 66 (precedente REQ-43-06): el dominio del sitio pasa a moisesbaldenegro.com.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { composeTitle, canonicalUrl } from '../src/domain/seo/head.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const LAYOUT = 'src/layouts/Layout.astro';
const SITE = 'https://moisesbaldenegro.com';
const ABOUT_TEXT = 'Articulos dedicados a la ingeniería de software aplicada, ejemplos, arquitectura, implementaciones y proyectos mas cercanos a proyectos reales.';
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const descriptions = (html) => [...html.matchAll(/<meta name="description" content="([^"]*)">/g)].map((m) => decode(m[1]));
const canonicals = (html) => [...html.matchAll(/<link rel="canonical" href="([^"]*)">/g)].map((m) => m[1]);

function posts(dir = 'src/content/posts/') {
  return readdirSync(new URL(dir, root), { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? posts(`${dir}${e.name}/`) : e.name.endsWith('.md') ? [read(`${dir}${e.name}`)] : []);
}
const field = (md, name) => md.match(new RegExp(`^${name}:[ \t]*(.+?)[ \t\r]*$`, 'm'))?.[1];

test('REQ-35-01: astro.config.mjs declara site', () => {
  assert.match(read('astro.config.mjs'), /site: 'https:\/\/moisesbaldenegro\.com'/);
});

test('REQ-35-02: composeTitle añade la marca sin duplicarla', () => {
  assert.equal(composeTitle('Principios solid'), 'Principios solid | moisesbaldenegro.com');
  assert.equal(composeTitle('About — moisesbaldenegro.com'), 'About — moisesbaldenegro.com');
  assert.equal(composeTitle(undefined), 'moisesbaldenegro.com');
});

test('REQ-35-03: canonicalUrl es absoluta y codifica el path', () => {
  assert.equal(canonicalUrl('/about', SITE), `${SITE}/about`);
  assert.equal(canonicalUrl('/posts/slug con espacio/', SITE), `${SITE}/posts/slug%20con%20espacio/`);
});

test('REQ-35-06: meta charset es el primer hijo de head y viewport el segundo', () => {
  const head = read(LAYOUT).match(/<head>([\s\S]*?)<\/head>/)[1];
  const tags = [...head.matchAll(/<(?!!--)[^>]+>/g)].map((m) => m[0]);
  assert.match(tags[0], /^<meta charset="utf-8"/);
  assert.match(tags[1], /^<meta name="viewport"/);
});

test('REQ-35-08: Layout usa composeTitle y canonicalUrl sin concatenar la marca', () => {
  const layout = read(LAYOUT);
  const imports = layout.match(/import \{([^}]*)\} from '\.\.\/domain\/seo\/head\.ts'/)?.[1] ?? '';
  assert.match(imports, /\bcomposeTitle\b/);
  assert.match(imports, /\bcanonicalUrl\b/);
  assert.doesNotMatch(layout.split('---')[1], /moisesbaldenegro\.com/);
});

test('REQ-35-04/05/07 (build): description, canonical y título por página', () => {
  const out = mkdtempSync(join(tmpdir(), 'seo-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const html = (rel) => readFileSync(join(out, 'client', rel), 'utf8');
    for (const rel of ['index.html', 'about/index.html', 'search/index.html']) {
      const d = descriptions(html(rel));
      assert.equal(d.length, 1, `${rel}: ${d.length} meta description`);
      assert.ok(d[0].length > 0, `${rel}: description vacía`);
    }
    for (const rel of ['index.html', 'about/index.html']) {
      const c = canonicals(html(rel));
      assert.equal(c.length, 1, `${rel}: ${c.length} canonical`);
      assert.ok(c[0].startsWith(`${SITE}/`), `${rel}: canonical ${c[0]}`);
    }
    const home = html('index.html');
    assert.match(home, /<title>Moisés Baldenegro Melendez \| moisesbaldenegro\.com<\/title>/);
    assert.deepEqual(descriptions(home), [ABOUT_TEXT]);
    assert.ok(read('src/domain/seo/head.ts').includes(ABOUT_TEXT) || read('src/pages/about.astro').includes(ABOUT_TEXT));
    for (const md of posts()) {
      const slug = field(md, 'slug');
      const page = join('posts', slug, 'index.html');
      assert.ok(existsSync(join(out, 'client', page)), `no se generó ${page}`);
      assert.deepEqual(descriptions(html(page)), [field(md, 'description')], `${slug}: description`);
      const c = canonicals(html(page));
      assert.equal(c.length, 1, `${slug}: ${c.length} canonical`);
      assert.ok(c[0].startsWith(`${SITE}/posts/`), `${slug}: canonical ${c[0]}`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-35-10: los archivos de src/ tocados no superan 100 líneas', () => {
  const files = [LAYOUT, 'src/domain/seo/head.ts', 'src/pages/index.astro', 'src/pages/about.astro',
    'src/pages/search.astro', 'src/pages/404.astro', 'src/pages/[...term].astro', 'src/pages/posts/[id].astro'];
  for (const rel of files) if (existsSync(new URL(rel, root))) assert.ok(read(rel).split('\n').length <= 100, rel);
});
