// Feature 79 (mobile-hamburger-menu): en <=768 px con JS el header se reduce a logo + botón ☰
// (64 px) y los enlaces y el buscador pasan a un panel desplegable. Escritorio y sin JS igual que
// antes. Spec: specs/79_mobile-hamburger-menu/. Verificación en navegador en progress/impl_79.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => { assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`); return readFileSync(new URL(rel, root), 'utf8'); };
const lines = (s) => s.split('\n').length - (s.endsWith('\n') ? 1 : 0);
const strip = (css) => css.replace(/[/][*][^]*?[*][/]/g, '');

test('REQ-79-01/02/03: nav sin atributos con logo, botón y panel en orden', () => {
  const layout = read('src/layouts/Layout.astro');
  const nav = layout.match(/<nav>([^]*?)<[/]nav>/)?.[1] ?? '';
  assert.ok(nav, 'falta <nav> sin atributos');
  const logo = nav.indexOf('mxvi_logo'), btn = nav.indexOf('<button'), panel = nav.indexOf('class="site-menu"');
  assert.ok(logo >= 0 && btn > logo && panel > btn, 'orden logo → botón → panel');
  const button = nav.slice(btn, nav.indexOf('</button>', btn));
  for (const a of ['type="button"', 'class="site-menu__toggle"', 'data-site-menu-toggle', 'aria-controls="site-menu"', 'aria-expanded="false"', 'aria-label="Abrir menú"']) assert.ok(button.includes(a), a);
  assert.match(button, /<button[^>]*>\s*$/, 'el botón no lleva texto');
  const div = nav.slice(panel);
  assert.match(div.slice(0, 80), /id="site-menu"/); assert.match(div.slice(0, 80), /data-site-menu/);
  const order = ['href="/about"', 'href="/arquitectura"', 'href="https://x.com/moibaldenegro"', '<SearchBar />'].map((s) => div.indexOf(s));
  assert.ok(order.every((v, i) => v >= 0 && (i === 0 || v > order[i - 1])), `orden del panel: ${order}`);
  assert.ok(div.includes('<span class="visually-hidden"> (X, sitio externo)</span>'));
  assert.equal((nav.match(/aria-current=/g) ?? []).length, 3);
});

test('REQ-79-04/05: componente con estilos y script de init', () => {
  const comp = read('src/components/site-menu/site-menu.astro');
  assert.match(comp, /import .[.][.][/][.][.][/]styles[/]site-menu[.]css./);
  assert.match(comp, /import [{][ ]*initSiteMenu[ ]*[}] from .[.][/]site-menu[.]ts./);
  assert.match(comp, /^[ ]*initSiteMenu[(][)];/m);
  assert.match(comp, /addEventListener[(].astro:after-swap.,/);
  assert.doesNotMatch(comp, /<style/);
  const layout = read('src/layouts/Layout.astro');
  assert.match(layout, /import SiteMenu from .[.][.][/]components[/]site-menu[/]site-menu[.]astro./);
  assert.ok(layout.indexOf('<SiteMenu />') > layout.indexOf('</header>'));
});

test('REQ-79-06/07/16/17/18: hoja con modo hamburguesa acotado a móvil con JS', () => {
  const css = strip(read('src/styles/site-menu.css'));
  const MQ = '@media (max-width: 768px) and (scripting: enabled)';
  const first = css.indexOf('@media');
  const base = css.slice(0, first);
  assert.match(base, /[.]site-menu[ ]*[{][^}]*display:[ ]*contents/);
  assert.match(base, /[.]site-menu__toggle[ ]*[{][^}]*display:[ ]*none/);
  for (const m of css.slice(first).matchAll(/@media[^{]+/g)) assert.ok(m[0].includes('(max-width: 768px)') && m[0].includes('(scripting: enabled)'), m[0]);
  assert.ok(css.includes(MQ));
  assert.match(css, /@media [(]max-width: 768px[)] and [(]max-height: 500px[)] and [(]scripting: enabled[)][ ]*[{][^}]*header[.]site-navbar[ ]*[{][^}]*position:[ ]*relative/);
  assert.match(css, /:root[ ]*[{][^}]*scroll-padding-top:[ ]*var[(]--header-height[)]/);
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}|rgba?[(]/);
  assert.doesNotMatch(css, /(padding|margin|gap|radius)[^:;{]*:[^;]*[0-9]px/);
  assert.doesNotMatch(css, /transition|animation/);
});

test('REQ-79-08/35/36: hojas compartidas sin cambios y archivos <= 100 líneas', () => {
  assert.equal(lines(read('src/styles/tokens.css')), 97);
  assert.equal(lines(read('src/styles/layout.css')), 99);
  assert.doesNotMatch(read('src/styles/search-bar.css'), /site-menu/);
  for (const rel of ['src/layouts/Layout.astro', 'src/components/site-menu/site-menu.astro', 'src/styles/site-menu.css', 'tests/mobile-hamburger-menu.test.mjs']) assert.ok(lines(read(rel)) <= 100, rel);
});
