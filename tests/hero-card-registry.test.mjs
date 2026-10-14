// Test del registro de componentes por tipo de tarjeta del hero (REQ-91-01..08,
// feature 91 hero-card-registry). Spec: specs/91_hero-card-registry/
// (requirements.md + design.md). Análisis: progress/research/hero-extensible-cards.md.
//   REQ-91-01/02 — pickCardComponent devuelve la entrada del kind o lanza
//                  HeroCardKindError con el kind en el mensaje (objetos simples).
//   REQ-91-03/04 — hero-grid-card.astro: prop card: HeroGridCard, registro literal
//                  { icon: HeroCard } en el frontmatter, card={card}, sin estilos.
//   REQ-91-05/06 — new-hero.astro usa HeroGridCard sin condicionales por tipo;
//                  hero-card.astro conserva article.hero-card y card: HeroCard.
//   REQ-91-07/08 — el HTML de build de la portada pinta las 12 tarjetas de icono
//                  en el orden del JSON; la geometría de hero-section.css no cambia.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { pickCardComponent, HeroCardKindError } from '../src/domain/hero-card-registry.ts';
import { astroBuild } from './helpers/astro-build.mjs';

const REGISTRY_URL = new URL('../src/domain/hero-card-registry.ts', import.meta.url);
const DISPATCHER_URL = new URL('../src/components/hero-cards/hero-grid-card.astro', import.meta.url);
const NEW_HERO_URL = new URL('../src/components/new-hero/new-hero.astro', import.meta.url);
const HERO_CARD_URL = new URL('../src/components/hero-card.astro', import.meta.url);
const HERO_SECTION_CSS_URL = new URL('../src/styles/hero-section.css', import.meta.url);
const DATA_URL = new URL('../src/data/hero-cards.json', import.meta.url);
const DIST_HOME_URL = new URL('../dist/client/index.html', import.meta.url);

const read = (url) => readFileSync(url, 'utf8');
const frontmatter = (content) => content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
const lineCount = (url) => read(url).split('\n').length;

test('REQ-91-01: pickCardComponent devuelve la entrada del registro para el kind', () => {
  const icon = { name: 'icono' };
  const htb = { name: 'htb' };
  assert.equal(pickCardComponent({ icon, htb }, 'icon'), icon);
  assert.equal(pickCardComponent({ icon, htb }, 'htb'), htb);
});

test('REQ-91-02: un kind sin entrada lanza HeroCardKindError con el kind en el mensaje', () => {
  assert.throws(
    () => pickCardComponent({ icon: {} }, 'htb'),
    (error) => error instanceof HeroCardKindError && error instanceof Error && error.message.includes('htb'),
  );
  assert.throws(() => pickCardComponent({}, 'icon'), HeroCardKindError);
  assert.throws(() => pickCardComponent({ htb: undefined }, 'htb'), HeroCardKindError);
});

test('REQ-91-03: hero-grid-card.astro tipa card como HeroGridCard y pinta el componente elegido', () => {
  assert.ok(existsSync(DISPATCHER_URL), 'falta src/components/hero-cards/hero-grid-card.astro');
  const content = read(DISPATCHER_URL);
  const front = frontmatter(content);
  assert.match(front, /import\s+type\s*\{[^}]*\bHeroGridCard\b[^}]*\}\s*from\s*["'][^"']*entities\/hero-card\.ts["']/);
  assert.match(front, /interface\s+Props\s*\{[\s\S]*?\bcard\s*:\s*HeroGridCard\b/, 'card no tipada como HeroGridCard');
  assert.match(front, /import\s*\{[^}]*\bpickCardComponent\b[^}]*\}\s*from\s*["'][^"']*domain\/hero-card-registry\.ts["']/);
  assert.match(front, /pickCardComponent\(\s*\w+\s*,\s*card\.kind\s*\)/, 'no resuelve el componente por card.kind');
  assert.match(content.slice(content.lastIndexOf('---')), /card=\{card\}/, 'no pasa card={card}');
  assert.doesNotMatch(content, /<style\b/, 'hero-grid-card.astro contiene <style>');
  assert.doesNotMatch(content, /\sstyle=/, 'hero-grid-card.astro contiene style= inline');
  assert.ok(lineCount(DISPATCHER_URL) <= 100 && lineCount(REGISTRY_URL) <= 100, 'supera 100 líneas');
});

test('REQ-91-04: el registro es un único objeto literal que asocia icon con hero-card.astro', () => {
  const front = frontmatter(read(DISPATCHER_URL));
  const imported = front.match(/import\s+(\w+)\s+from\s*["']\.\.\/hero-card\.astro["']/)?.[1];
  assert.ok(imported, 'hero-grid-card.astro no importa ../hero-card.astro');
  const literals = front.match(/=\s*\{[^}]*\}/g) ?? [];
  assert.equal(literals.length, 1, 'el frontmatter no declara exactamente un objeto literal de registro');
  assert.match(literals[0], new RegExp(`\\bicon\\s*:\\s*${imported}\\b`), 'el registro no asocia icon con HeroCard');
});

test('REQ-91-05: new-hero.astro pinta cada tarjeta con HeroGridCard sin condicionales por tipo', () => {
  const content = read(NEW_HERO_URL);
  assert.match(content, /import\s+HeroGridCard\s+from\s*["']\.\.\/hero-cards\/hero-grid-card\.astro["']/);
  assert.match(content, /heroCards\.map\(\s*\(?\s*card\s*\)?\s*=>\s*\(?\s*<HeroGridCard\s+card=\{card\}\s*\/>/);
  assert.doesNotMatch(content, /<HeroCard\b/, 'new-hero.astro sigue montando HeroCard directamente');
  assert.doesNotMatch(content, /card\.kind|kind\s*===|===\s*['"]icon['"]/, 'new-hero.astro compara por tipo');
});

test('REQ-91-06: hero-card.astro conserva article.hero-card, data-color-token y card: HeroCard', () => {
  const content = read(HERO_CARD_URL);
  assert.match(content, /<article\s+class="hero-card"\s+data-color-token=\{card\.colorToken\}>/);
  assert.match(frontmatter(content), /interface\s+Props\s*\{[\s\S]*?\bcard\s*:\s*HeroCard\b/);
});

test('REQ-91-08: hero-section.css conserva la geometría del grid', () => {
  const css = read(HERO_SECTION_CSS_URL);
  assert.match(css, /grid-template-columns:\s*repeat\(12,\s*1fr\);\s*grid-auto-rows:\s*95px;/);
  assert.match(css, /grid-template-columns:\s*repeat\(6,\s*1fr\);\s*grid-auto-rows:\s*minmax\(140px,\s*auto\);/);
  assert.match(css, /grid-template-columns:\s*1fr;\s*grid-auto-rows:\s*minmax\(190px,\s*auto\);/);
});

test('REQ-91-07: el build de la portada contiene las 12 tarjetas de icono en el orden del JSON', () => {
  const build = astroBuild();
  assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read(DIST_HOME_URL);
  const grid = html.slice(html.indexOf('class="hero-grid"'));
  const tokens = [...grid.matchAll(/<article\b[^>]*\bclass="hero-card"[^>]*\bdata-color-token="([^"]+)"/g)]
    .map((match) => match[1]);
  // Ajuste feature 92 (REQ-92-14, precedente REQ-43-06): la tarjeta htb (hero-card--rich) se
  // excluye del recuento de icono; su presencia en el grid la cubre tests/htb-hero-card.test.mjs.
  const expected = JSON.parse(read(DATA_URL)).filter((card) => card.kind === undefined).map((card) => card.colorToken);
  assert.equal(expected.length, 12);
  assert.deepEqual(tokens, expected, 'las tarjetas del build no siguen el orden de hero-cards.json');
});
