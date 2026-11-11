// Test de la feature 11 mxvi-chrome (REQ-11-01..11). Spec: specs/11_mxvi-chrome/.
// node:test, sin dependencias. El chrome de Layout.astro usa los componentes .mx-* del design system.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const read = (path) => readFileSync(path, 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const classesOf = (src) => new Set([...src.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)));
const layout = () => read('src/layouts/Layout.astro');
const hasAll = (src, names) => {
  const classes = classesOf(src);
  for (const name of names) assert.ok(classes.has(name), `falta la clase ${name}`);
};

test('REQ-11-01: la copia sincronizada incluye base.css declarado en el manifiesto', () => {
  const { files } = JSON.parse(read('src/styles/mxvi/manifest.json'));
  assert.ok('base.css' in files);
  assert.ok(existsSync('src/styles/mxvi/base.css'));
});

test('REQ-11-02: Layout.astro importa mxvi/base.css y no layout.css', () => {
  assert.match(layout(), /import "\.\.\/styles\/mxvi\/base\.css";/);
  assert.doesNotMatch(layout(), /styles\/layout\.css/);
});

test('REQ-11-03/04: header y enlace de salto con clases mx-*', () => {
  hasAll(layout(), ['mx-skip-link', 'mx-navbar', 'mx-navbar__inner', 'mx-navbar__toggle', 'mx-navbar__menu', 'mx-logo', 'mx-nav-link']);
});

test('REQ-11-05: barra de búsqueda con clases mx-search', () => {
  hasAll(read('src/components/search-bar/search-bar.astro'), ['mx-search', 'mx-search__form', 'mx-search__icon', 'mx-search__input', 'mx-search__clear']);
});

test('REQ-11-06: footer con clases mx-footer', () => {
  hasAll(read('src/components/site-footer/site-footer.astro'), ['mx-footer', 'mx-footer__inner', 'mx-footer-brand', 'mx-footer__column', 'mx-label', 'mx-link-list', 'mx-link', 'mx-footer-bar']);
});

test('REQ-11-07/09: src no usa las clases antiguas del chrome sin prefijo', () => {
  const old = /(?<![\w-])(site-navbar|site-menu__|search-bar__|site-footer__|skip-link|visually-hidden)(?![\w-])/;
  for (const file of walk('src').filter((p) => /\.(astro|ts|css)$/.test(p) && !p.includes('styles/mxvi'))) {
    const classes = [...read(file).matchAll(/class(?:Name)?="([^"]+)"|['"`]\.([\w-]+)/g)].map((m) => m[1] ?? m[2]).join(' ');
    assert.doesNotMatch(classes, old, file);
  }
  for (const file of walk('src/styles').filter((p) => p.endsWith('.css') && !p.includes('styles/mxvi'))) {
    assert.doesNotMatch(read(file), /\.(site-navbar|site-menu|search-bar|site-footer|skip-link|visually-hidden)\b/, file);
  }
});

test('REQ-11-08: las hojas antiguas del chrome ya no existen', () => {
  for (const sheet of ['layout.css', 'site-menu.css', 'search-bar.css', 'search-bar-icon.css', 'site-footer.css']) {
    assert.ok(!existsSync(`src/styles/${sheet}`), sheet);
  }
});

test('REQ-11-10: el menú móvil localiza .mx-navbar y conserva los data-*', () => {
  const ts = read('src/components/site-menu/site-menu.ts');
  assert.match(ts, /querySelector\('\.mx-navbar'\)/);
  assert.match(ts, /\[data-site-menu-toggle\]/);
  assert.match(ts, /\[data-site-menu\]/);
  assert.match(layout(), /data-site-menu-toggle/);
  assert.match(layout(), /data-site-menu(?![-\w])/);
});

test('REQ-11-11: typography.css ya no declara la fuente del header ni del campo de búsqueda', () => {
  assert.doesNotMatch(read('src/styles/typography.css'), /site-navbar|search-bar/);
});
