// Feature 89 (site-footer): footer del layout único con marca, navegación, últimos artículos,
// redes y barra inferior. Spec: specs/89_site-footer/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const url = (rel) => new URL(`../${rel}`, import.meta.url);
const read = (rel) => readFileSync(url(rel), 'utf8');
const lines = (text) => text.split(/\r?\n/).filter((l, i, all) => i < all.length - 1 || l !== '').length;
const strip = (css) => css.replace(/[/][*][^]*?[*][/]/g, '');

const DOMAIN = 'src/domain/site-footer.ts';
const COMPONENT = 'src/components/site-footer/site-footer.astro';
const CSS = 'src/styles/site-footer.css';
const ABOUT = JSON.parse(read('src/data/about.json'));
const load = async () => import(url(DOMAIN).href);

test('REQ-89-01: la columna Navegación enlaza las rutas principales', async () => {
  const { footerColumns } = await load();
  const nav = footerColumns(ABOUT).find((c) => c.title === 'Navegación');
  assert.ok(nav, 'falta la columna Navegación');
  assert.deepEqual(nav.links.map((l) => l.href), ['/home', '/about', '/arquitectura', '/search']); // Ajuste feature 116 (precedente REQ-43-06): Inicio a /home (REQ-116-09)
  assert.ok(nav.links.every((l) => !l.external));
});

test('REQ-89-02: la columna Conecta usa heroLinks más X', async () => {
  const { footerColumns } = await load();
  const social = footerColumns(ABOUT).find((c) => c.title === 'Conecta');
  assert.ok(social, 'falta la columna Conecta');
  assert.deepEqual(social.links.map((l) => l.icon), ['github', 'linkedin', 'youtube', 'x']);
  assert.equal(social.links.at(-1).href, 'https://x.com/moibaldenegro');
  for (const link of social.links) {
    assert.match(link.href, /^https:\/\//);
    assert.equal(link.external, true);
  }
  const github = ABOUT.links.find((l) => l.id === 'github');
  assert.equal(social.links[0].href, github.href);
});

test('REQ-89-03: copyrightLine usa el año de la fecha inyectada', async () => {
  const { copyrightLine } = await load();
  assert.equal(copyrightLine('Moisés', new Date('2031-05-02T12:00:00Z')), '© 2031 Moisés');
});

test('REQ-89-04: Layout.astro monta SiteFooter tras </main>', () => {
  const layout = read('src/layouts/Layout.astro');
  assert.match(layout, /import SiteFooter from '\.\.\/components\/site-footer\/site-footer\.astro';/);
  assert.match(layout, /<\/main>\s*<SiteFooter \/>/);
  assert.ok(lines(layout) <= 100);
});

test('REQ-89-05: el componente pinta footer, marca, CV, últimos artículos y Volver arriba', () => {
  assert.ok(existsSync(url(COMPONENT)), `${COMPONENT} no existe`);
  const astro = read(COMPONENT);
  assert.match(astro, /<footer class="site-footer"/);
  assert.match(astro, /href="\/cv\.pdf"/);
  assert.match(astro, /latestPosts\(/);
  assert.match(astro, /about\.headline/);
  assert.match(astro, /about\.location/);
  assert.match(astro, /href="#top"/);
  assert.doesNotMatch(astro, /<style/);
  assert.ok(lines(astro) <= 100);
});

test('REQ-89-06/07: enlaces externos anunciados e iconos del sprite ocultos', () => {
  const astro = read(COMPONENT);
  assert.match(astro, /<span class="visually-hidden"> \(sitio externo\)<\/span>/);
  assert.match(astro, /<svg[^>]*aria-hidden="true"[^>]*><use href=\{`\/assets\/svg\/sprite\.svg#\$\{/);
});

test('REQ-89-08/09/10: hoja solo con tokens y rejilla responsive', () => {
  assert.ok(existsSync(url(CSS)), `${CSS} no existe`);
  const css = strip(read(CSS));
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  assert.match(css, /@media \(min-width: 900px\)[^]*grid-template-columns:\s*[^;]*repeat\(3,/);
  assert.match(css, /@media \(max-width: 599px\)[^]*grid-template-columns:\s*1fr/);
  assert.match(css, /prefers-reduced-motion/);
  assert.ok(lines(read(CSS)) <= 100);
  assert.ok(lines(read(DOMAIN)) <= 100);
});
