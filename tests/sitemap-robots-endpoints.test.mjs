// Test de sitemap.xml y robots.txt (feature 42 sitemap-robots-endpoints,
// REQ-42-01..10): funciones puras de src/domain/seo/sitemap.ts, inspección de
// los endpoints y build real (outDir temporal, serializado con el helper).
//
// Ajuste feature 45 (precedente REQ-43-06): los slugs pasan a ASCII
// (03-principios-solid, 01-diseno-detallado, 04-ciclo-de-vida-y-arquitectura);
// las URLs antiguas redirigen con 301 desde astro.config.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';
import { buildSitemap, robotsTxt } from '../src/domain/seo/sitemap.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const SITE = 'https://moibaldenegro.com';
const post = (id, created, updated) => ({
  id, slug: id, title: id, author: 'A', img: 'x.webp', readtime: 1, description: 'd', tags: [],
  created, updated, next: null, related: null,
});
const POSTS = [
  post('00-agilismo', '1 Agosto 2026', '19 Septiembre 2026'),
  post('slug con espacio', '2 Agosto 2026', ''),
  post('a&b', '3 Agosto 2026', '3 Agosto 2026'),
];
const xml = buildSitemap(POSTS, SITE);
const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const entry = (loc) => xml.split('<url>').find((block) => block.includes(`<loc>${loc}</loc>`)) ?? '';

test('REQ-42-01: sitemap.xml.ts prerenderizado con application/xml', () => {
  const page = read('src/pages/sitemap.xml.ts');
  assert.match(page, /export const prerender = true/);
  assert.match(page, /'Content-Type': 'application\/xml/);
});

test('REQ-42-02: un <url> con <loc> absoluto para /, /about y cada post', () => {
  assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
  assert.match(xml, /<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  assert.equal(locs.length, 2 + POSTS.length);
  assert.ok(locs.includes(`${SITE}/`) && locs.includes(`${SITE}/about/`), locs.join(' '));
  for (const loc of locs) assert.ok(loc.startsWith(`${SITE}/`), loc);
});

test('REQ-42-03: sin /search, /404 ni rutas de término', () => {
  assert.doesNotMatch(xml, /\/search|\/404/);
  for (const loc of locs.slice(2)) assert.ok(loc.startsWith(`${SITE}/posts/`), loc);
});

test('REQ-42-04/05: lastmod desde updated, o created si falta', () => {
  assert.match(entry(`${SITE}/posts/00-agilismo/`), /<lastmod>2026-09-19<\/lastmod>/);
  assert.match(entry(`${SITE}/posts/slug%20con%20espacio/`), /<lastmod>2026-08-02<\/lastmod>/);
});

test('REQ-42-06: slugs codificados y XML escapado', () => {
  assert.ok(locs.includes(`${SITE}/posts/slug%20con%20espacio/`));
  assert.ok(locs.includes(`${SITE}/posts/a%26b/`), 'encodeURIComponent aplica a &');
  assert.doesNotMatch(xml.replace(/&amp;|&lt;|&gt;|&quot;|&apos;/g, ''), /&/);
});

test('REQ-42-07: robotsTxt con User-agent, Allow y Sitemap absoluto', () => {
  assert.equal(robotsTxt(SITE), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
  const page = read('src/pages/robots.txt.ts');
  assert.match(page, /export const prerender = true/);
  assert.match(page, /'Content-Type': 'text\/plain/);
});

test('REQ-42-08: sin dependencias nuevas', () => {
  const pkg = JSON.parse(read('package.json'));
  const deps = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).sort();
  assert.deepEqual(deps, ['@astrojs/cloudflare', '@cloudflare/workers-types', 'astro', 'wrangler']);
});

test('REQ-42-01/07 (build): dist/client/sitemap.xml y robots.txt', () => {
  const out = mkdtempSync(join(tmpdir(), 'sitemap-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const sitemap = readFileSync(join(out, 'client', 'sitemap.xml'), 'utf8');
    assert.match(sitemap, /<loc>https:\/\/moibaldenegro\.com\/posts\/01-procesos-memoria\/<\/loc>/);
    assert.match(sitemap, /<loc>https:\/\/moibaldenegro\.com\/posts\/03-principios-solid\/<\/loc>/);
    const robots = readFileSync(join(out, 'client', 'robots.txt'), 'utf8');
    assert.equal(robots, robotsTxt(SITE));
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-42-10: los archivos de src/ creados no superan 100 líneas', () => {
  for (const rel of ['src/domain/seo/sitemap.ts', 'src/pages/sitemap.xml.ts', 'src/pages/robots.txt.ts']) {
    assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`);
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
