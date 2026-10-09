// Test de la jerarquía de encabezados de la portada (feature 55
// home-heading-hierarchy, REQ-55-01..07): tarjetas del hero sin encabezado,
// títulos de las cards en h3, svg decorativos y secuencia h1→h6 sin saltos en
// el HTML real del build (outDir temporal, serializado con el helper).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { astroBuild } from './helpers/astro-build.mjs';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const noColors = (body) => assert.doesNotMatch(body, /#[0-9a-f]{3,8}\b|rgba?\(/i);
const rule = (rel, selector) => {
  const css = read(rel).replace(/\/\*[\s\S]*?\*\//g, '');
  const at = css.indexOf(`${selector} {`);
  return at < 0 ? '' : css.slice(at, css.indexOf('}', at));
};

test('REQ-55-01: el título de la tarjeta del hero es un párrafo, no un encabezado', () => {
  const card = read('src/components/hero-card.astro');
  assert.match(card, /<p class="card-title">\{card\.title\}<\/p>/);
  assert.doesNotMatch(card, /<h[1-6]\b/);
});

test('REQ-55-02: el título de cada card de artículo es h3 con su clase y transition:name', () => {
  assert.match(read('src/components/latest-articles.astro'),
    /<h3 transition:name=\{`title-\$\{post\.id\}`\} class="latest-articles__title">\{post\.title\}<\/h3>/);
});

test('REQ-55-03: el svg de la tarjeta es decorativo', () => {
  const svg = read('src/components/hero-card.astro').match(/<svg\b[^>]*>/)?.[0] ?? '';
  assert.match(svg, /aria-hidden="true"/);
  assert.match(svg, /focusable="false"/);
});

test('REQ-55-05: estilos con los selectores nuevos y sin colores sueltos', () => {
  const cardTitle = rule('src/styles/hero-card.css', '.card-title');
  assert.match(cardTitle, /font-size:\s*0\.95rem/, 'la tarjeta perdió su tipografía');
  assert.match(cardTitle, /text-transform:\s*uppercase/);
  assert.match(cardTitle, /margin:\s*0/);
  noColors(cardTitle);
  assert.doesNotMatch(read('src/styles/hero-card.css'), /\.card-header h3/, 'quedan reglas del h3 antiguo');
  const title = rule('src/styles/latest-articles.css', '.latest-articles__title');
  assert.ok(title, 'falta .latest-articles__title');
  // Ronda 2 (review_55): el margen se declara en la clase con el valor que daba
  // el navegador al h2 (0.83em), para que no dependa del nivel del encabezado.
  assert.match(title, /margin:\s*0\.83em 0|margin-block:\s*0\.83em/, 'el margen del título depende del nivel del encabezado');
  noColors(title);
});

test('REQ-55-04 (build): la portada no salta niveles de encabezado', () => {
  const out = mkdtempSync(join(tmpdir(), 'headings-build-'));
  try {
    const build = astroBuild(['--outDir', out]);
    assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
    const html = readFileSync(join(out, 'client', 'index.html'), 'utf8');
    const levels = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
    assert.equal(levels[0], 1, `la portada no empieza por h1: ${levels.join(',')}`);
    for (let i = 1; i < levels.length; i++) {
      assert.ok(levels[i] <= levels[i - 1] + 1, `salto de h${levels[i - 1]} a h${levels[i]} (secuencia ${levels.join(',')})`);
    }
  } finally {
    rmSync(out, { recursive: true, force: true });
  }
});

test('REQ-55-07: los archivos tocados no superan 100 líneas', () => {
  for (const rel of ['src/components/hero-card.astro', 'src/components/latest-articles.astro', 'src/styles/hero-card.css', 'src/styles/latest-articles.css']) {
    assert.ok(read(rel).split('\n').length <= 100, rel);
  }
});
