// Feature 111 hero-cards-data-rebaseline (REQ-111-01..15; specs/111_*). Los tests heredados se re-basan en sus archivos
// con la nota «Ajuste feature 111 (precedente REQ-43-06)»; este archivo fija el CSS de cloudflare, las notas, los límites
// de líneas, las capturas y los archivos ajenos. La medida CDP (REQ-111-11/12) va en progress/impl_hero-cards-data-rebaseline.md.
import { test } from 'node:test'; import assert from 'node:assert/strict'; import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { HeroCardsRepository } from '../src/domain/repositories/hero-cards-repository.ts';
const ROOT = new URL('../', import.meta.url);
const read = (rel) => readFileSync(new URL(rel, ROOT), 'utf8');
const lines = (rel) => read(rel).split('\n').filter((l, i, a) => i < a.length - 1 || l !== '').length;
const NOTE = 'Ajuste feature 111 (precedente REQ-43-06)'; const SPRITE = '/assets/svg/sprite.svg#';
const REBASED = ['tests/hero-backdrop-size.test.mjs', 'tests/hero-cards-extra-logos.test.mjs', 'tests/hero-cards-links-xlink.test.mjs',
  'tests/hero-cards-polish.test.mjs', 'tests/hero-cards-unique-tech.test.mjs'];
const baseRule = (token) => {
  const css = read('src/styles/hero-card.css').replace(/\/\*[\s\S]*?\*\//g, '').split('@media')[0];
  const body = css.match(new RegExp(`\\[data-color-token="${token}"\\]\\s*\\{([^}]*)\\}`))?.[1] ?? '';
  return Object.fromEntries(body.split(';').map((d) => d.trim()).filter(Boolean).map((d) => d.split(':').map((s) => s.trim())));
};

test('REQ-111-02: el repositorio entrega las 15 tarjetas del JSON del humano sin HeroCardsDataError', () => {
  const cards = new HeroCardsRepository(() => read('src/data/hero-cards.json')).getCards();
  assert.equal(cards.length, 15);
  const cf = cards.find((c) => c.colorToken === 'cloudflare');
  assert.deepEqual([cf.icon, cf.cornerIcon, cf.backgroundIcon, 'backgroundIconSize' in cf],
    [`${SPRITE}cloudflare-cloud`, `${SPRITE}cloudflare-cloud`, `${SPRITE}cloudflare`, false]);
});

test('REQ-111-09: la regla base de cloudflare declara --icon-width 270px y --icon-rotation 0deg fuera de @media', () => {
  const cf = baseRule('cloudflare');
  assert.deepEqual([cf['--icon-width'], cf['--icon-rotation']], ['270px', '0deg']);
  assert.ok(Number(cf['--icon-scale']) >= 1, `--icon-scale ${cf['--icon-scale']}`);
  assert.ok(lines('src/styles/hero-card.css') <= 100, 'hero-card.css > 100 líneas');
});

test('REQ-111-03..08/15: cada test re-basado lleva la nota, <= 100 líneas y el de repositorio no crece', () => {
  for (const rel of REBASED) {
    assert.ok(read(rel).includes(NOTE), `${rel} sin la nota`);
    assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
  }
  // 146 líneas según wc -l (sin salto final): 147 con el contador de este test, que cuenta la última línea.
  assert.ok(lines('tests/hero-cards-repository.test.mjs') <= 147, 'tests/hero-cards-repository.test.mjs creció');
  assert.ok(lines('tests/hero-cards-data-rebaseline.test.mjs') <= 100, 'este test > 100 líneas');
});

test('REQ-111-13: capturas CDP de la card CLOUDFLARE a 5 anchos en progress/research/hero111/', () => {
  for (const w of [375, 800, 1024, 1280, 1600]) {
    assert.ok(existsSync(new URL(`progress/research/hero111/cloudflare-${w}.png`, ROOT)), `falta cloudflare-${w}.png`);
  }
});

test('REQ-111-11/12: el informe registra la medida CDP en rojo y en verde a los 5 anchos', () => {
  const rel = 'progress/impl_hero-cards-data-rebaseline.md';
  assert.ok(existsSync(new URL(rel, ROOT)), `falta ${rel}`);
  const report = read(rel);
  for (const word of ['Rojo', 'Verde', 'getBoundingClientRect', '375', '800', '1024', '1280', '1600']) assert.ok(report.includes(word), `informe sin ${word}`);
});

test('REQ-111-14: sprite.svg y tests/hack-the-box-sprite.test.mjs sin cambios frente a HEAD', () => {
  const paths = ['public/assets/svg/sprite.svg', 'tests/hack-the-box-sprite.test.mjs'];
  const touched = execFileSync('git', ['diff', '--name-only', 'HEAD', '--', ...paths], { cwd: ROOT, encoding: 'utf8' }).trim();
  assert.equal(touched, '', `tocados: ${touched}`);
});
