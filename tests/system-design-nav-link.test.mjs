// Test del atajo «Diseño de sistemas» en el navbar (feature 93
// system-design-nav-link, REQ-93-01..06/08/10/11/15/16/17). Mismo patrón de
// inspección por regex sobre Layout.astro que tests/architecture-nav-link.test.mjs
// (feature 08). Las mediciones de navegador (REQ-93-07/09/12/13) se anotan en
// progress/impl_system-design-nav-link.md.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { statusForTermPath, termFromPathname } from '../src/components/search-results/term-route.ts';

const ROOT = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, ROOT), 'utf8');
const layout = () => read('src/layouts/Layout.astro');
const siteMenu = () => layout().match(/<div class="site-menu"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
const anchor = () => siteMenu().match(/<a\b[^>]*href="\/diseno-de-sistemas"[^>]*>[\s\S]*?<\/a>/)?.[0] ?? '';
const countLines = (s) => (s.endsWith('\n') ? s.split('\n').length - 1 : s.split('\n').length);
const POST = 'src/content/posts/architecture/05-diseno-arquitectonico-vs-diseno-detallado.md';
const NAV_CSS = 'src/styles/nav-label.css';
const tagsLine = (md) => md.match(/^tags:.*$/m)?.[0] ?? '';

test('REQ-93-01: .site-menu incluye el enlace a /diseno-de-sistemas con aria-label justo tras Arquitectura', () => {
  const anchors = siteMenu().match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
  const arch = anchors.findIndex((a) => /href="\/arquitectura"/.test(a));
  assert.ok(arch >= 0, 'no se encuentra el enlace Arquitectura (REQ-93-01)');
  const next = anchors[arch + 1] ?? '';
  assert.match(next, /href="\/diseno-de-sistemas"/, 'el enlace no va justo tras Arquitectura (REQ-93-01)');
  assert.match(next, /aria-label="Diseño de sistemas"/, 'falta aria-label="Diseño de sistemas" (REQ-93-01)');
});

test('REQ-93-02/03: aria-current compara con /diseno-de-sistemas y /diseno-de-sistemas/ y degrada a undefined', () => {
  assert.match(
    anchor(),
    /aria-current=\{Astro\.url\.pathname\s*===\s*['"]\/diseno-de-sistemas['"]\s*\|\|\s*Astro\.url\.pathname\s*===\s*['"]\/diseno-de-sistemas\/['"]\s*\?\s*['"]page['"]\s*:\s*undefined\}/,
    'aria-current no sigue el patrón page/undefined para /diseno-de-sistemas(/) (REQ-93-02/03)',
  );
});

test('REQ-93-05: se conservan el logo, About, Arquitectura, @moibaldenegro y la barra de búsqueda', () => {
  const nav = layout().match(/<nav>[\s\S]*?<\/nav>/)?.[0] ?? '';
  assert.match(nav, /<a\b[^>]*href="\/"[^>]*>\s*<img\b[^>]*src="\/assets\/mxvi_logo\.webp"/, 'falta el logo (REQ-93-05)');
  assert.match(nav, /<a\b[^>]*href="\/about"[^>]*>\s*About\s*<\/a>/, 'falta About (REQ-93-05)');
  assert.match(nav, /<a\b[^>]*href="\/arquitectura"[^>]*>\s*Arquitectura\s*<\/a>/, 'falta Arquitectura (REQ-93-05)');
  assert.match(nav, /href="https:\/\/x\.com\/moibaldenegro"[^>]*>\s*@moibaldenegro/, 'falta @moibaldenegro (REQ-93-05)');
  assert.match(siteMenu(), /<SearchBar\s*\/>/, 'falta <SearchBar /> (REQ-93-05)');
});

test('REQ-93-06/10: contenido Diseño + span .site-menu__label-rest « de sistemas» y nombre accesible estable', () => {
  const a = anchor();
  const inner = a.replace(/^<a\b[^>]*>/, '').replace(/<\/a>$/, '');
  assert.equal(inner, 'Diseño<span class="site-menu__label-rest"> de sistemas</span>', 'contenido del enlace (REQ-93-06)');
  assert.equal(a.match(/aria-label="([^"]*)"/)?.[1], 'Diseño de sistemas', 'nombre accesible (REQ-93-10)');
});

test('REQ-93-08/11: nav-label.css oculta .site-menu__label-rest a <= 969 px (breakpoint confirmado por medición: a 960 px se parte), sin JS y <= 100 líneas', () => {
  assert.ok(existsSync(new URL(NAV_CSS, ROOT)), `falta ${NAV_CSS} (REQ-93-11)`);
  const css = read(NAV_CSS);
  assert.ok(countLines(css) <= 100, `${NAV_CSS} supera 100 líneas (REQ-93-11)`);
  assert.match(css, /@media\s*\(max-width:\s*969px\)\s*\{\s*\.site-menu__label-rest\s*\{\s*display:\s*none;?\s*\}\s*\}/,
    'falta la regla @media (max-width: 969px) que oculta .site-menu__label-rest (REQ-93-08)');
  assert.match(layout(), /^import ["']\.\.\/styles\/nav-label\.css["'];$/m, 'Layout.astro no importa nav-label.css (REQ-93-11)');
});

test('REQ-93-11/17: Layout.astro sin <style> ni <script> y con 100 líneas o menos', () => {
  const content = layout();
  assert.doesNotMatch(content, /<style|<script/, 'Layout.astro contiene <style> o <script> (REQ-93-11)');
  assert.ok(countLines(content) <= 100, `Layout.astro tiene ${countLines(content)} líneas (REQ-93-17)`);
});

test('REQ-93-04/15: el artículo 05 lleva #diseno-de-sistemas y la ruta de término responde 200', () => {
  assert.match(tagsLine(read(POST)), /#diseno-de-sistemas\b/, `${POST} no lleva el tag (REQ-93-15)`);
  const dir = new URL('src/content/posts/', ROOT);
  const files = readdirSync(dir, { recursive: true }).filter((f) => String(f).endsWith('.md'));
  const tagged = files.filter((f) => /#diseno-de-sistemas\b/.test(tagsLine(readFileSync(new URL(String(f).replace(/\\/g, '/'), dir), 'utf8'))));
  assert.ok(tagged.length >= 1, 'ningún artículo lleva #diseno-de-sistemas (REQ-93-04)');
  assert.equal(statusForTermPath('/diseno-de-sistemas'), 200);
  assert.equal(statusForTermPath('/diseno-de-sistemas/'), 200);
  assert.equal(termFromPathname('/diseno-de-sistemas'), 'diseno-de-sistemas');
});

test('REQ-93-16: en src/content/posts solo cambia la línea tags del artículo 05 (se añade el tag)', () => {
  const git = (args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  const names = git(['diff', 'HEAD', '--name-only', '--', 'src/content/posts']).trim();
  assert.ok(names === '' || names === POST, `la feature toca otros artículos: ${names} (REQ-93-16)`);
  if (names === '') return; // ya commiteado: REQ-93-15 cubre la presencia del tag.
  const lines = git(['diff', 'HEAD', '-U0', '--', POST]).split('\n').filter((l) => /^[+-](?![+-])/.test(l));
  assert.equal(lines.length, 2, `cambian más líneas de las esperadas: ${lines.join(' | ')} (REQ-93-16)`);
  const [removed, added] = lines.map((l) => l.slice(1).replace(/\r$/, ''));
  assert.equal(added, removed.replace(/"(\s*)$/, ' #diseno-de-sistemas"$1'), 'la línea tags cambia algo más que el tag (REQ-93-16)');
});
