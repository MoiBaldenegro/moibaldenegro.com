// Test de la feature 4 promo-tiles-section — página, componente, estilos y tokens (REQ-04-08..20).
// Spec: specs/04_promo-tiles-section/ (requirements.md + design.md). node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8');
const COMPONENT = 'src/components/promo-tiles/promo-tiles.astro';
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (css, selector) => {
  const m = css.match(new RegExp(`(?:^|[\\s,}])${esc(selector)}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `falta la regla ${selector}`);
  return m[1];
};
const TONES = ['youtube', 'mfinance', 'new-relic', 'tomatesoft'];

test('REQ-04-08: home.astro importa PromoTiles y lo renderiza justo tras <LatestHorizontal />', () => {
  const home = read('src/pages/home.astro');
  assert.match(home, /import PromoTiles from '\.\.\/components\/promo-tiles\/promo-tiles\.astro';/);
  const landing = home.match(/<div class="home__landing"[^>]*>([\s\S]*?)<\/div>/);
  assert.ok(landing, 'falta .home__landing');
  assert.match(landing[1], /<LatestHorizontal\s*\/>\s*<PromoTiles\s*\/>/);
});

test('REQ-04-09/10/14/19: estructura del componente, imagen y sin script ni style', () => {
  const c = read(COMPONENT);
  assert.match(c, /import ['"]\.\.\/\.\.\/styles\/promo-tiles\.css['"]/);
  assert.match(c, /PromoTilesRepository/, 'los datos llegan vía repositorio');
  assert.match(c, /linkAttrs/, 'la decisión externo/interno vive en el helper');
  const h2 = c.match(/<h2 id="([^"]+)" class="visually-hidden">Proyectos y contenido<\/h2>/);
  assert.ok(h2, 'falta el h2 visually-hidden');
  assert.match(c, new RegExp(`aria-labelledby="${esc(h2[1])}"`));
  const body = c.slice(c.lastIndexOf('---'));
  const orden = ['<h3', '<p', '<a', '<a', '<img'].reduce((desde, tag) => {
    const at = body.indexOf(tag, desde);
    assert.ok(at > desde, `falta ${tag} en orden`);
    return at + 1;
  }, 0);
  assert.ok(orden > 0);
  const img = body.match(/<img[^>]*>/)[0];
  for (const attr of [/alt=\{[^}]*imageAlt\}/, /width="1920"/, /height="1920"/, /loading="lazy"/, /decoding="async"/]) {
    assert.match(img, attr);
  }
  assert.doesNotMatch(c, /<script|<style/);
});

test('REQ-04-11/12/15/16/17: promo-tiles.css usa los tokens de la sección', () => {
  const css = read('src/styles/promo-tiles.css');
  for (const tone of TONES) {
    assert.match(rule(css, `.promo-tile[data-tone="${tone}"]`), new RegExp(`background:\\s*var\\(--color-promo-${tone}\\)`));
  }
  const primary = rule(css, '.promo-tile__link--primary');
  assert.match(primary, /background:\s*var\(--color-promo-cta\)/);
  assert.match(primary, /color:\s*var\(--color-text\)/);
  assert.match(primary, /border-radius:\s*var\(--radius-pill\)/);
  const secondary = rule(css, '.promo-tile__link--secondary');
  assert.match(secondary, /background:\s*transparent/);
  assert.match(secondary, /border:\s*1px solid var\(--color-promo-link\)/);
  assert.match(secondary, /color:\s*var\(--color-promo-link\)/);
  assert.match(secondary, /border-radius:\s*var\(--radius-pill\)/);
  const grid = rule(css, '.promo-tiles__grid');
  assert.match(grid, /grid-template-columns:\s*1fr 1fr/);
  assert.match(grid, /gap:\s*var\(--gap-promo\)/);
  assert.match(rule(css, '.promo-tile'), /border-radius:\s*0/);
  const media = css.slice(css.indexOf('@media (max-width: 768px)'));
  assert.ok(css.includes('@media (max-width: 768px)'), 'falta la media query de 768px');
  assert.match(rule(media, '.promo-tiles__grid'), /grid-template-columns:\s*1fr\s*;/);
});

test('REQ-04-15/18/20: tokens nuevos, audit de colores en verde y archivos <=100 líneas', () => {
  const tokens = read('src/styles/tokens.css');
  const valores = { 'color-promo-youtube': '#0e0e10', 'color-promo-mfinance': '#0d1a1d',
    'color-promo-new-relic': '#0e0b22', 'color-promo-tomatesoft': '#0b0909', 'color-promo-cta': '#0071e3',
    'color-promo-cta-hover': '#0077ed', 'color-promo-link': '#2997ff', 'gap-promo': '10px' };
  for (const [token, valor] of Object.entries(valores)) {
    assert.match(tokens, new RegExp(`--${token}:\\s*${valor};`), token);
  }
  const audit = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/audit-design-tokens.mjs', import.meta.url))]);
  assert.equal(audit.status, 0, String(audit.stderr));
  const archivos = ['src/data/promo-tiles.json', 'src/domain/entities/promo-tile.ts',
    'src/domain/repositories/promo-tiles-repository.ts', 'src/domain/repositories/promo-tiles-parse.ts',
    'src/domain/promo-tiles.ts', COMPONENT, 'src/styles/promo-tiles.css', 'src/styles/tokens.css',
    'src/pages/home.astro', 'tests/promo-tiles-section.test.mjs', 'tests/promo-tiles-section-ui.test.mjs'];
  for (const rel of archivos) assert.ok(read(rel).trimEnd().split('\n').length <= 100, rel);
});
