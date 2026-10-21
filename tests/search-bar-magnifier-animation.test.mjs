// Test de la lupa animada de la search bar (feature 114
// search-bar-magnifier-animation, REQ-114-01..12). Inspección por regex del
// componente y de las hojas. REQ-114-09 (65 px, sin scroll) se verifica con
// Chrome headless + CDP (progress/research/search114/); REQ-114-10 (portada
// < 42 000 B) lo cubre tests/search-index-lazy-load.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';

const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const COMPONENT = 'src/components/search-bar/search-bar.astro';
const ICON_CSS = 'src/styles/search-bar-icon.css';
const BAR_CSS = 'src/styles/search-bar.css';
const flat = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const icon = () => (assert.ok(existsSync(new URL(ICON_CSS, ROOT)), 'falta search-bar-icon.css'), flat(read(ICON_CSS)));
// Reglas [selector, cuerpo] de primer nivel y dentro de @media.
const rules = (css) => [...css.matchAll(/([^{}@]+)\{([^{}]*)\}/g)].map(([, s, b]) => [s.trim(), b]);
const svg = () => read(COMPONENT).match(/<svg[\s\S]*?<\/svg>/)?.[0] ?? '';
test('REQ-114-01: SVG decorativo dentro del form y antes del input', () => {
  const html = read(COMPONENT);
  const form = html.slice(html.indexOf('<form'), html.indexOf('</form>'));
  const at = form.indexOf('<svg');
  assert.ok(at >= 0, 'no hay <svg> dentro de .search-bar__form');
  assert.ok(at < form.indexOf('<input'), 'la lupa debe ir antes del input');
  const tag = form.slice(at, form.indexOf('>', at));
  for (const a of [/class="search-bar__icon"/, /aria-hidden="true"/, /focusable="false"/]) assert.match(tag, a);
  assert.match(html, /import\s+['"][^'"]*search-bar-icon\.css['"]/, 'el componente no importa la hoja');
});
test('REQ-114-02: stroke currentColor y reposo en --color-text-secondary', () => {
  assert.match(svg(), /stroke="currentColor"/);
  const base = rules(icon()).find(([s]) => s === '.search-bar__icon') ?? assert.fail('falta .search-bar__icon');
  assert.match(base[1], /(^|[^-])color:\s*var\(--color-text-secondary\)/);
  assert.match(base[1], /pointer-events:\s*none/);
});
test('REQ-114-03: foco pinta lupa y borde en accent sin anular el outline', () => {
  const focus = rules(icon()).filter(([s]) => s.includes('.search-bar:focus-within'));
  const iconRule = focus.find(([s]) => /\.search-bar__icon$/.test(s) && !s.includes(':has(')) ?? assert.fail('falta lupa con foco');
  const inputRule = focus.find(([s]) => /\.search-bar__input$/.test(s)) ?? assert.fail('falta input con foco');
  assert.match(iconRule[1], /color:\s*var\(--color-accent\)/);
  assert.match(iconRule[1], /scale\(1\.12\)/);
  assert.match(inputRule[1], /border-color:\s*var\(--color-accent\)/);
  assert.match(inputRule[1], /box-shadow:\s*0 0 0 4px var\(--color-glow\)/);
  for (const css of [icon(), flat(read(BAR_CSS))]) assert.doesNotMatch(css, /outline\s*:\s*(none|0)\b/);
});
test('REQ-114-04: keyframes search-bar-scan solo con foco y texto', () => {
  const css = icon();
  assert.match(css, /@keyframes\s+search-bar-scan\s*\{/);
  const animated = rules(css).filter(([, b]) => /animation:[^;]*search-bar-scan/.test(b));
  assert.ok(animated.length > 0, 'nadie aplica search-bar-scan');
  for (const [s, b] of animated) {
    assert.match(s, /\.search-bar:focus-within/, s);
    assert.match(s, /:has\(\.search-bar__input:not\(:placeholder-shown\)\)/, s);
    assert.match(b, /1\.6s[^;]*infinite/);
  }
  const frames = css.slice(css.indexOf('@keyframes search-bar-scan'));
  for (const v of ['3px', '-2px', '-10deg', '10deg']) assert.ok(frames.includes(v), v);
});
test('REQ-114-05: con texto sin foco, accent y sin animación', () => {
  const r = rules(icon()).find(([s]) => s.includes(':has(.search-bar__input:not(:placeholder-shown))')
    && !s.includes(':focus-within') && s.endsWith('.search-bar__icon')) ?? assert.fail('falta :has(...) sin foco');
  assert.match(r[1], /color:\s*var\(--color-accent\)/);
  assert.doesNotMatch(r[1], /animation:\s*search-bar-scan/);
});
test('REQ-114-06: reduced-motion anula animación y transición', () => {
  const css = icon();
  const at = css.indexOf('@media (prefers-reduced-motion: reduce)');
  const block = at >= 0 ? css.slice(at) : assert.fail('falta @media (prefers-reduced-motion: reduce)');
  assert.match(block, /\.search-bar__icon[^{]*\{[^}]*animation:\s*none/);
  assert.match(block, /\.search-bar__icon[^{]*\{[^}]*transition:\s*none/);
});
test('REQ-114-07: el input reserva 42px a la izquierda (y >= 40 a la derecha)', () => {
  const body = rules(flat(read(BAR_CSS))).find(([s]) => s === '.search-bar__input')?.[1] ?? '';
  const pad = body.match(/padding:\s*(\d+)px\s+(\d+)px\s+(\d+)px\s+(\d+)px/);
  assert.ok(pad, 'padding de 4 valores no encontrado');
  assert.equal(pad[4], '42');
  assert.ok(Number(pad[2]) >= 40);
});
test('REQ-114-08: controladores intactos y wiring de astro:page-load', () => {
  assert.match(read(COMPONENT), /astro:page-load[^\n]*initSearchBar\(navigate\)/);
  const files = ['src/components/search-bar/search-bar.ts',
    ...['search-live', 'search-escape'].flatMap((d) => readdirSync(new URL(`src/components/${d}/`, ROOT)).map((f) => `src/components/${d}/${f}`))];
  for (const f of files) assert.doesNotMatch(read(f), /search-bar__icon|search-bar-scan/, f);
});
test('REQ-114-11: solo tokens existentes, sin colores sueltos ni dependencias', () => {
  const css = icon();
  const tokens = read('src/styles/tokens.css');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(/i);
  for (const [, name] of css.matchAll(/var\((--[\w-]+)\)/g)) assert.ok(tokens.includes(`${name}:`), name);
  assert.doesNotMatch(css, /^\s*--[\w-]+\s*:/m, 'no se declaran custom properties nuevas');
  assert.doesNotMatch(css + svg(), /@import|url\(|https?:/);
});
test('REQ-114-12: archivos de la feature <= 100 líneas', () => {
  for (const rel of [COMPONENT, BAR_CSS, ICON_CSS, 'tests/search-bar-magnifier-animation.test.mjs']) {
    assert.ok(existsSync(new URL(rel, ROOT)), rel);
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
