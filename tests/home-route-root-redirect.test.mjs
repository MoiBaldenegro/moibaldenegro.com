// Feature 116 (home-route-root-redirect): la portada pasa a /home (src/pages/home.astro,
// prerender) y la raíz / responde siempre 301 a /about desde el middleware con la función
// pura rootRedirect. Spec: specs/116_home-route-root-redirect/requirements.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { astroBuild } from './helpers/astro-build.mjs';
import { SECURITY_HEADERS } from '../src/domain/http/security-headers.ts';
import { onRequest } from '../src/middleware.ts';
import { buildSitemap, robotsTxt } from '../src/domain/seo/sitemap.ts';
import { clearDestination } from '../src/components/search-results/term-route.ts';
import { footerColumns } from '../src/domain/site-footer.ts';

const root = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, root), 'utf8');
const has = (rel) => existsSync(new URL(rel, root));
const MODULE = new URL('src/domain/http/root-redirect.ts', root);
const SITE = 'https://moisesbaldenegro.com';
const headersOk = (res) => { for (const [n, v] of Object.entries(SECURITY_HEADERS)) assert.equal(res.headers.get(n), v, n); };

test('REQ-116-01/03: home.astro prerender con la portada completa y sin index.astro', () => {
  assert.ok(has('src/pages/home.astro'), 'falta src/pages/home.astro');
  const page = read('src/pages/home.astro');
  assert.match(page, /export const prerender = true/);
  for (const c of ['NewHero', 'LatestArticles', 'LatestHorizontal', 'SearchLive']) assert.match(page, new RegExp(`<${c}\\s*/>`), c);
  assert.equal(has('src/pages/index.astro'), false, 'src/pages/index.astro debe desaparecer');
});

test('REQ-116-04: rootRedirect solo redirige la raíz a /about', async () => {
  assert.ok(existsSync(MODULE), 'falta src/domain/http/root-redirect.ts');
  const { rootRedirect } = await import(MODULE.href);
  assert.equal(rootRedirect('/'), '/about');
  for (const p of ['/home', '/home/', '/about', '/arquitectura', '/posts/03-principios solid', '']) assert.equal(rootRedirect(p), null, p);
});

test('REQ-116-05: el middleware responde 301 de / a /about con query y cabeceras sin llamar a next', async () => {
  for (const [url, loc] of [['https://x/', '/about'], ['https://x/?x=1', '/about?x=1']]) {
    let called = false;
    const res = await onRequest({ url: new URL(url) }, async () => { called = true; return new Response('no'); });
    assert.equal(res.status, 301, url); assert.equal(res.headers.get('Location'), loc, url); headersOk(res);
    assert.equal(called, false, `${url}: next no debe llamarse`);
  }
});

test('REQ-116-06/18: slugs antiguos siguen con su 301 y /home delega en next', async () => {
  const legacy = await onRequest({ url: new URL('https://x/posts/03-principios%20solid') }, async () => new Response('no'));
  assert.equal(legacy.status, 301); assert.equal(legacy.headers.get('Location'), '/posts/03-principios-solid');
  const home = await onRequest({ url: new URL('https://x/home') }, async () => new Response('ok', { status: 200 }));
  assert.equal(home.status, 200); assert.equal(await home.text(), 'ok'); headersOk(home);
});

test('REQ-116-07: sin redirects en astro.config.mjs ni public/_redirects', () => {
  assert.doesNotMatch(read('astro.config.mjs'), /redirects[ ]*:/);
  assert.equal(has('public/_redirects'), false);
});

test('REQ-116-08..12: logo del header y del footer, Inicio, «Volver al inicio» y blog apuntan a /home', () => {
  const layout = read('src/layouts/Layout.astro');
  assert.match(layout, /<a aria-current=\{[^}]*'\/home'[^}]*'\/home\/'[^}]*\} href="\/home"><img src="\/assets\/mxvi_logo\.webp"/);
  const about = JSON.parse(read('src/data/about.json'));
  const nav = footerColumns(about).find((c) => c.title === 'Navegación').links;
  assert.equal(nav.find((l) => l.label === 'Inicio')?.href, '/home');
  assert.match(read('src/components/site-footer/site-footer.astro'), /<a class="site-footer__logo" href="\/home">/);
  assert.match(read('src/components/not-found/not-found.astro'), /href="\/home">Volver al inicio<\/a>/);
  const blog = about.content.find((p) => /^Blog de/.test(p.title));
  assert.equal(blog?.href, '/home');
});

test('REQ-116-14/22: src/ sin href a / exacto y archivos tocados <= 100 líneas', () => {
  const files = readdirSync(new URL('src/', root), { recursive: true }).filter((f) => /\.(astro|ts|json|mjs)$/.test(f));
  for (const f of files) assert.doesNotMatch(read(`src/${f}`), /href="\/"|href: '\/'|"href": "\/"/, f);
  for (const f of ['src/domain/http/root-redirect.ts', 'src/middleware.ts', 'src/pages/home.astro', 'src/layouts/Layout.astro',
    'src/domain/site-footer.ts', 'src/components/search-results/term-route.ts', 'src/domain/seo/sitemap.ts',
    'src/components/site-footer/site-footer.astro', 'src/components/not-found/not-found.astro']) {
    assert.ok(read(f).split('\n').length <= 100, f);
  }
});

test('REQ-116-13: clearDestination en /<término> navega a /home', () => {
  assert.equal(clearDestination('/arquitectura'), '/home');
  assert.equal(clearDestination('/foo/bar'), '/home');
  assert.equal(clearDestination('/search'), '/search');
});

test('REQ-116-15/16: sitemap con /home/ y sin la raíz; robots sin cambios', () => {
  const locs = [...buildSitemap([], SITE).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, [`${SITE}/home/`, `${SITE}/about/`]);
  assert.equal(robotsTxt(SITE), `User-agent: *\nAllow: /\n\nSitemap: ${SITE}/sitemap.xml\n`);
});

test('REQ-116-02/07/17 (build): dist/client/home/index.html con portada y canonical, sin dist/client/index.html', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
  assert.equal(has('dist/client/index.html'), false, 'no debe emitirse dist/client/index.html');
  const html = read('dist/client/home/index.html');
  for (const m of ['class="hero-grid', 'class="latest-articles"', 'class="site-footer"']) assert.ok(html.includes(m), m);
  assert.ok(html.includes(`<link rel="canonical" href="${SITE}/home/">`), 'canonical /home/');
  assert.ok(!html.includes('name="robots"'), '/home no lleva meta robots');
  if (has('dist/client/_redirects')) assert.doesNotMatch(read('dist/client/_redirects'), /^\/\s/m);
  assert.ok(read('dist/client/sitemap.xml').includes(`<loc>${SITE}/home/</loc>`));
});
