// Test de la card de Hack The Box en el grid del hero (REQ-92-01..13, feature 92
// htb-hero-card). Spec: specs/92_htb-hero-card/ (requirements.md + design.md).
// Análisis: progress/research/hero-extensible-cards.md.
//   REQ-92-01/02/03 — entrada htb del JSON tras twitch-bottom, tokens de marca HTB
//                     y regla [data-color-token="htb"] con fondo y celda.
//   REQ-92-04/05/06 — htb-card.astro (article.hero-card.hero-card--rich) monta la
//                     isla con server:defer y fallback; registro htb en el despachador.
//   REQ-92-07/08/09 — la isla conserva credenciales, getProfileOrNull y caché; lista
//                     compacta Nivel/Puntos/Owns y texto degradado.
//   REQ-92-10       — la portada ya no monta la sección suelta; el build pinta el
//                     fallback una sola vez dentro de la card del grid.
//   REQ-92-11/12/13 — herencia de .hero-card, contenido en flujo, solo tokens, ≤100 líneas.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { astroBuild } from './helpers/astro-build.mjs';

const url = (rel) => new URL(`../${rel}`, import.meta.url);
const read = (rel) => {
  assert.ok(existsSync(url(rel)), `falta ${rel}`);
  return readFileSync(url(rel), 'utf8');
};
const frontmatter = (content) => content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
const noComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const CARD = 'src/components/hero-cards/htb-card.astro';
const CARD_CSS = 'src/styles/htb-card.css';
const ISLAND = 'src/components/htb-stadistics.astro';
const ISLAND_CSS = 'src/styles/htb-stadistics.css';
const COLOR_PROPS = /^(color|background|background-color|border|border-bottom|border-top|border-color)$/;

// Ajuste feature 97 (REQ-97-13, precedente REQ-43-06): la celda twitch-bottom pasa a cloudflare.
// Ajuste feature 98 (precedente REQ-43-06): htb es la primera entrada y sin celda (la calcula el dominio).
test('REQ-92-01: hero-cards.json incluye la tarjeta htb como primera entrada', () => {
  const data = JSON.parse(read('src/data/hero-cards.json'));
  assert.deepEqual(data[0], { id: 'htb', kind: 'htb', title: 'HACK THE BOX', colorToken: 'htb' });
});

test('REQ-92-02: tokens.css declara los tokens de marca HTB sin superar 100 líneas', () => {
  const tokens = read('src/styles/tokens.css');
  assert.match(tokens, /--color-marca-htb:\s*#1A2332;/i);
  assert.match(tokens, /--color-marca-htb-accent:\s*#9FEF00;/i);
  assert.ok(tokens.split('\n').length <= 100, 'tokens.css supera 100 líneas');
});

// Ajuste feature 98 (precedente REQ-43-06): la regla solo da el fondo; el tamaño 5x4 llega por data-*-span.
test('REQ-92-03: hero-card.css fija el fondo de la card htb sin celda', () => {
  const rule = read('src/styles/hero-card.css').match(/\[data-color-token="htb"\]\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(rule, /--card-bg:\s*var\(--color-marca-htb\)/);
  assert.doesNotMatch(rule, /--card-(column|row)/);
});

test('REQ-92-04: htb-card.astro pinta article.hero-card.hero-card--rich con p.card-title', () => {
  const content = read(CARD);
  assert.match(frontmatter(content), /interface\s+Props\s*\{[\s\S]*?\bcard\s*:\s*HeroRichCard\b/);
  assert.match(frontmatter(content), /import\s+["']\.\.\/\.\.\/styles\/htb-card\.css["']/);
  // Ajuste feature 98 (precedente REQ-43-06): el article gana data-col-span/data-row-span (REQ-98-17).
  assert.match(content, /<article\s+class="hero-card hero-card--rich"\s+data-color-token=\{card\.colorToken\}\s+data-col-span=\{colSpan\}\s+data-row-span=\{rowSpan\}>/);
  assert.match(content, /<p\s+class="card-title">\{card\.title\}<\/p>/);
});

test('REQ-92-05: htb-card.astro monta la isla con server:defer y fallback dentro del article', () => {
  const content = read(CARD);
  assert.match(frontmatter(content), /import\s+HtbStadistics\s+from\s*["']\.\.\/htb-stadistics\.astro["']/);
  const article = content.slice(content.indexOf('<article'), content.indexOf('</article>'));
  assert.match(article, /<HtbStadistics\s+server:defer>/);
  assert.match(article, /<p\s+[^>]*slot="fallback"[^>]*>Cargando estadísticas de HTB\.\.\.<\/p>/);
});

test('REQ-92-06: el registro de hero-grid-card.astro asocia htb con htb-card.astro', () => {
  const front = frontmatter(read('src/components/hero-cards/hero-grid-card.astro'));
  const imported = front.match(/import\s+(\w+)\s+from\s*["']\.\/htb-card\.astro["']/)?.[1];
  assert.ok(imported, 'hero-grid-card.astro no importa ./htb-card.astro');
  const literals = front.match(/=\s*\{[^}]*\}/g) ?? [];
  assert.equal(literals.length, 1, 'el registro no es un único objeto literal');
  assert.match(literals[0], new RegExp(`\\bhtb\\s*:\\s*${imported}\\b`));
});

test('REQ-92-07: la isla conserva credenciales, getProfileOrNull, caché y ausencia de lógica', () => {
  const island = read(ISLAND);
  assert.match(island, /const\s+HTB_API_TOKEN\s*=\s*ENV_TOKEN\s*\|\|\s*env\.HTB_API_TOKEN\s*;/);
  assert.match(island, /const\s+HTB_USER_ID\s*=\s*ENV_ID\s*\|\|\s*env\.HTB_USER_ID\s*;/);
  assert.match(island, /getProfileOrNull\(\)/);
  assert.match(island, /Astro\.response\.headers\.set\('Cache-Control', HTB_ISLAND_CACHE_CONTROL\)/);
  assert.doesNotMatch(island, /\bfunction\b|\bif\s*\(|\bfor\s*\(|\btry\s*\{/);
});

test('REQ-92-08: con perfil la isla pinta Nivel, Puntos y Owns (user / root) con N/D', () => {
  const island = read(ISLAND);
  assert.match(island, /\{profile\s*&&\s*\(\s*<ul class="htb-stadistics__list">/);
  for (const label of ['Nivel', 'Puntos', 'Owns']) {
    assert.match(island, new RegExp(`htb-stadistics__label">${label}</span>`));
  }
  assert.match(island, /\{profile\.rank \?\? 'N\/D'\}/);
  assert.match(island, /\{profile\.points \?\? 'N\/D'\}/);
  assert.match(island, /\{profile\.userOwns \?\? 'N\/D'\} user \/ \{profile\.systemOwns \?\? 'N\/D'\} root/);
  assert.match(island, /<div class="htb-stadistics">/);
  assert.doesNotMatch(island, /<h2|<section|País|Miembro desde/);
});

test('REQ-92-09: sin perfil la isla pinta Estadísticas no disponibles', () => {
  assert.match(read(ISLAND), /\{!profile\s*&&\s*<p class="htb-stadistics__empty">Estadísticas no disponibles<\/p>\}/);
});

test('REQ-92-10: index.astro deja de importar y renderizar la sección HTB', () => {
  assert.doesNotMatch(read('src/pages/index.astro'), /HtbStadistics|htb-stadistics/);
});

test('REQ-92-11/12: la card hereda .hero-card y su contenido va en flujo sobre los pseudo-elementos', () => {
  const css = noComments(read(CARD_CSS));
  assert.doesNotMatch(css, /border-radius|box-shadow|transform|transition|position:\s*absolute/);
  assert.doesNotMatch(css, /(^|[;{\s])height\s*:/, 'la card fija un alto que recortaría el contenido');
  assert.match(css, /position:\s*relative;[\s\S]*?z-index:/);
  const heroCss = read('src/styles/hero-card.css');
  assert.match(heroCss, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.hero-card:hover \{ transform: none; \}/);
  assert.match(heroCss, /@media \(max-width: 1200px\)\s*\{\s*\.hero-card \{ grid-column: auto !important;/);
});

test('REQ-92-13: hojas de la card e isla solo con tokens y archivos tocados ≤100 líneas', () => {
  for (const rel of [CARD_CSS, ISLAND_CSS]) {
    const css = noComments(read(rel));
    assert.doesNotMatch(css, /#[0-9a-fA-F]{3,8}\b|rgba?\(/, `${rel} tiene colores sueltos`);
    for (const [, prop, value] of css.matchAll(/([a-z-]+)\s*:\s*([^;{}]+);/g)) {
      if (COLOR_PROPS.test(prop) || /^(gap|padding|margin)/.test(prop)) {
        assert.match(value, /var\(--|^0$/, `${rel}: ${prop} no usa var() de tokens`);
      }
    }
  }
  assert.match(read(ISLAND_CSS), /color:\s*var\(--color-marca-htb-accent[,)]/, 'los valores no usan el verde de marca HTB');
  for (const rel of [CARD, CARD_CSS, ISLAND, ISLAND_CSS, 'src/styles/hero-card.css', 'src/styles/tokens.css',
    'src/components/hero-cards/hero-grid-card.astro', 'src/pages/index.astro']) {
    assert.ok(read(rel).split('\n').length <= 100, `${rel} supera 100 líneas`);
  }
});

test('REQ-92-10 (build): el fallback aparece una sola vez dentro de la card htb del grid', () => {
  const build = astroBuild();
  assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/index.html');
  assert.equal(html.split('Cargando estadísticas de HTB...').length - 1, 1, 'el fallback no aparece exactamente una vez');
  const grid = html.slice(html.indexOf('class="hero-grid"'));
  const card = grid.match(/<article\b[^>]*data-color-token="htb"[^>]*>([\s\S]*?)<\/article>/)?.[1] ?? '';
  assert.match(card, /Cargando estadísticas de HTB\.\.\./, 'el fallback no está dentro de la card htb del grid');
});
