import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const component = read('src/components/mxvi-logos-banner.astro');
const styles = read('src/styles/mxvi/components/organisms/logo-band.css') // REQ-12-09: estilos del design system;
const tokens = read('src/styles/tokens.css');
const [, frontmatter = '', markup = ''] = component.split('---');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (selector) => {
  const m = styles.match(new RegExp(`(^|\\n)${esc(selector)}\\s*\\{([^}]*)\\}`));
  return m ? m[2] : '';
};

test('REQ-06-01/18: datos vía repositorio, import del CSS y sin script ni style', () => {
  assert.match(frontmatter, /import \{ MxviLogosRepository \} from "\.\.\/domain\/repositories\/mxvi-logos-repository\.ts"/);
  assert.match(frontmatter, /new MxviLogosRepository\(\)\.getLogos\(\)/);
  assert.doesNotMatch(frontmatter, /\.json/);
  assert.doesNotMatch(frontmatter, /mxvi-[mxvi]"/);
  assert.doesNotMatch(frontmatter, /import ".*\.css"/); // REQ-12-12: sin hoja propia
  assert.doesNotMatch(component, /<script|<style/);
});

test('REQ-06-02/03/04/05: cada logo es un enlace con svg decorativo dentro', () => {
  const link = markup.match(/<a\s[^>]*>[\s\S]*?<\/a>/);
  assert.ok(link, 'falta el <a> del logo');
  const [a] = link;
  const open = a.match(/<a\s[^>]*>/)[0];
  assert.match(open, /class="mx-logo-band__link"/);
  assert.match(open, /href=\{href\}/);
  assert.match(open, /aria-label=\{label\}/);
  assert.match(open, /target="_blank"/);
  assert.match(open, /rel="noopener noreferrer"/);
  const svg = a.match(/<svg\s[^>]*>/)[0];
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /focusable="false"/);
  assert.match(a, /<use href=\{`\/assets\/svg\/sprite\.svg#\$\{id\}`\} \/>/);
  assert.match(markup, /logos\.map\(/);
});

test('REQ-06-06/07: sección sin aria-hidden y sin texto, títulos, párrafos ni botones', () => {
  const section = markup.match(/<section\s[^>]*>/)[0];
  assert.match(section, /class="mx-logo-band mx-logo-band--bleed"/);
  assert.doesNotMatch(section, /aria-hidden/);
  assert.doesNotMatch(markup, /<h[1-6]|<p[\s>]|<button/);
  const text = markup.replace(/\{logos\.map\([\s\S]*\)\)\}/, '').replace(/<[^>]*>/g, '').trim();
  assert.equal(text, '', `texto visible: ${text}`);
});

test('REQ-06-08/09: cinta full-bleed con degradado lineal y resplandor radial', () => {
  const band = rule('.mx-logo-band');
  const bleed = rule('.mx-logo-band--bleed'); // REQ-12-09: modificador a sangre del design system
  assert.match(bleed, /width:\s*100vw/);
  assert.match(bleed, /margin-inline:\s*calc\(50% - 50vw\)/);
  assert.match(band, /padding-block:\s*var\(--space-mxvi-band\)/);
  assert.doesNotMatch(styles, /overflow:\s*hidden/);
  assert.match(band, /radial-gradient\(/);
  assert.match(band, /linear-gradient\(/);
});

test('REQ-06-10/11/12: reposo, hover y focus-visible con elevación y transición', () => {
  const logo = rule('.mx-logo-band__logo');
  assert.match(logo, /opacity:\s*var\(--opacity-logo-band\)/);
  assert.match(logo, /transition:[^;]*var\(--transition-default\)/);
  const m = styles.match(/\.mx-logo-band__link:hover \.mx-logo-band__logo,\s*\.mx-logo-band__link:focus-visible \.mx-logo-band__logo\s*\{([^}]*)\}/);
  assert.ok(m, 'falta la regla hover/focus-visible del logo');
  assert.match(m[1], /opacity:\s*var\(--opacity-logo-band-hover\)/);
  const t = m[1].match(/transform:\s*translateY\((-[\d.]+)px\)\s*scale\(([\d.]+)\)/);
  assert.ok(t, 'falta transform con translateY y scale');
  assert.ok(Number(t[1]) < 0 && Number(t[2]) > 1);
  assert.match(rule('.mx-logo-band__link:focus-visible'), /outline:\s*2px solid var\(--color-text\)/);
});

test('REQ-06-13: prefers-reduced-motion anula transición y transformación', () => {
  const m = styles.match(/@media \(prefers-reduced-motion: reduce\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(m, 'falta @media prefers-reduced-motion');
  assert.match(m[1], /transition:\s*none/);
  assert.match(m[1], /transform:\s*none/);
  assert.doesNotMatch(m[1], /opacity/);
});

test('REQ-06-14/15: 4 columnas por defecto y 2 en <=768 px', () => {
  assert.match(rule('.mx-logo-band__track'), /grid-template-columns:\s*repeat\(4,/);
  const m = styles.match(/@media \(max-width: 768px\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(m, 'falta @media (max-width: 768px)');
  assert.match(m[1], /grid-template-columns:\s*repeat\(2,/);
});

test('REQ-06-16/17/19: tokens de la cinta, sin colores sueltos y <=100 líneas', () => {
  for (const t of ['opacity-logo-band', 'opacity-logo-band-hover', 'space-mxvi-band']) {
    assert.match(tokens, new RegExp(`--${t}:`), t);
  }
  assert.doesNotMatch(tokens, /--opacity-logo-muted/);
  assert.doesNotMatch(styles, /#[0-9a-fA-F]{3,8}\b|rgba?\(/);
  assert.doesNotMatch(styles, /opacity:\s*[\d.]/);
  for (const [name, src] of [['astro', component], ['css', styles], ['tokens', tokens]]) {
    assert.ok(src.trimEnd().split('\n').length <= 100, `${name} supera 100 líneas`);
  }
});
