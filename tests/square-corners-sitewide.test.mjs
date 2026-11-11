// Test de la feature 9 square-corners-sitewide — todas las esquinas rectas con un único token.
// Spec: specs/09_square-corners-sitewide/ (requirements.md + design.md). node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8');
const walk = (dir) => readdirSync(dir).flatMap((n) => {
  const p = join(dir, n);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const STYLES = 'src/styles';
const sheets = readdirSync(join(ROOT, STYLES)).filter((n) => n.endsWith('.css'));
const radii = (css) => [...css.matchAll(/[a-z-]*radius\s*:\s*([^;]+);/g)].map((m) => m[1].trim());
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const rule = (css, selector) => {
  const m = css.match(new RegExp(`(?:^|[\\s,}])${esc(selector)}\\s*\\{([^}]*)\\}`));
  assert.ok(m, `falta la regla ${selector}`);
  return m[1];
};
const OLD = /--radius-(card|pill|thumb)\b/;
const SQUARE = /border-radius:\s*var\(--radius-square\)\s*;/;

test('REQ-09-01/02: tokens.css define solo --radius-square: 0', () => {
  const tokens = read(`${STYLES}/tokens.css`);
  assert.equal((tokens.match(/--radius-square\s*:/g) ?? []).length, 1);
  assert.match(tokens, /--radius-square:\s*0\s*;/);
  for (const name of ['card', 'pill', 'thumb']) {
    assert.doesNotMatch(tokens, new RegExp(`--radius-${name}\\s*:`), `--radius-${name} sigue definido`);
  }
});

test('REQ-09-03: src/ no referencia los tokens antiguos (comentarios incluidos)', () => {
  const files = walk(join(ROOT, 'src')).filter((p) => /\.(css|astro|ts|json|md)$/.test(p));
  for (const file of files) {
    assert.doesNotMatch(readFileSync(file, 'utf8'), OLD, file);
  }
});

test('REQ-09-04/05: todo valor de radio en src/styles es exactamente var(--radius-square)', () => {
  for (const sheet of sheets) {
    for (const value of radii(read(`${STYLES}/${sheet}`))) {
      assert.equal(value, 'var(--radius-square)', `${sheet}: radio "${value}"`);
    }
  }
});

test('REQ-09-06..10: reglas concretas usan var(--radius-square)', () => {
  const glow = rule(read(`${STYLES}/hero-card.css`), '.hero-card::after');
  assert.match(glow, SQUARE);
  assert.match(glow, /radial-gradient\(/);
  assert.match(rule(read(`${STYLES}/profile-card.css`), '.verified'), SQUARE);
  assert.match(rule(read(`${STYLES}/mxvi/base.css`), '::-webkit-scrollbar-thumb'), SQUARE); // REQ-11-02
  assert.match(rule(read(`${STYLES}/promo-tiles.css`), '.promo-tile'), SQUARE);
  assert.match(rule(read(`${STYLES}/about-credentials.css`), '.about-philosophy__quote'), SQUARE);
  assert.match(rule(read(`${STYLES}/about-timeline.css`), '.about-timeline__result'), SQUARE);
});

test('REQ-09-11: ninguna hoja pierde declaraciones de radio (línea base 54 en 21 hojas, REQ-11-08)', () => {
  const baseline = {
    'about-credentials.css': 2, 'about-hero.css': 5, 'about-projects.css': 3, 'about-skills.css': 2,
    'about-stats.css': 1, 'about-timeline.css': 4, 'about.css': 1, 'article.css': 3, 'code-copy.css': 1,
    'hero-card-link.css': 2, 'hero-card.css': 2, 'hero-section.css': 1, 'htb-stadistics.css': 1,
    'latest-articles.css': 4, 'not-found.css': 1, 'post-header.css': 4, 'post-next.css': 2,
    'post.css': 2, 'profile-card.css': 3, 'promo-tiles.css': 4,
    'search-results.css': 6,
  };
  assert.equal(Object.values(baseline).reduce((a, b) => a + b, 0), 54);
  for (const [sheet, count] of Object.entries(baseline)) {
    const actual = radii(read(`${STYLES}/${sheet}`)).length;
    assert.ok(actual >= count, `${sheet}: ${actual} < ${count}`);
  }
});

test('REQ-09-12: los .astro no declaran radios en <style> ni style=', () => {
  for (const file of walk(join(ROOT, 'src')).filter((p) => p.endsWith('.astro'))) {
    const src = readFileSync(file, 'utf8');
    assert.doesNotMatch(src, /<style[\s>]/, file);
    assert.doesNotMatch(src, /style=["'{][^"'}]*radius/, file);
  }
});

test('REQ-09-13: el icono SVG de code-copy.ts conserva rx="1.5"', () => {
  assert.match(read('src/components/code-copy/code-copy.ts'), /<rect[^>]*rx="1\.5"/);
});

test('REQ-09-17: tokens.css, hojas con radio y tests tocados tienen <=100 líneas', () => {
  const files = [
    ...sheets.map((s) => `${STYLES}/${s}`),
    'tests/square-corners-sitewide.test.mjs', 'tests/article-images.test.mjs',
    'tests/promo-tiles-section-ui.test.mjs',
  ];
  for (const file of files) {
    const lines = read(file).split('\n').length - (read(file).endsWith('\n') ? 1 : 0);
    assert.ok(lines <= 100, `${file}: ${lines} líneas`);
  }
});
