// Test de la feature 12 mxvi-home (REQ-12-01..14). Spec: specs/12_mxvi-home/.
// node:test, sin dependencias. La home usa los componentes .mx-* del design system.

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
const hasAll = (path, names) => {
  const classes = classesOf(read(path));
  for (const name of names) assert.ok(classes.has(name), `${path}: falta la clase ${name}`);
};
const C = 'src/components';

test('REQ-12-01/02: hero Bento y tarjeta de perfil con clases mx-*', () => {
  hasAll(`${C}/new-hero/new-hero.astro`, ['mx-hero', 'mx-hero__background', 'mx-hero__glow', 'mx-bento',
    'mx-profile-card', 'mx-profile-card__image', 'mx-profile-card__content', 'mx-handle', 'mx-verified',
    'mx-profile-card__name', 'mx-profile-card__description']);
});

test('REQ-12-03/04/05: tarjeta de marca con data-brand, data-cols, data-rows y data-hide-mobile', () => {
  const card = read(`${C}/hero-card.astro`);
  hasAll(`${C}/hero-card.astro`, ['mx-brand-tile', 'mx-brand-tile__header', 'mx-brand-tile__title', 'mx-brand-tile__link', 'mx-brand-tile__arrow', 'mx-brand-tile__corner']);
  hasAll(`${C}/hero-card-art.astro`, ['mx-brand-tile__icon', 'mx-brand-tile__backdrop']);
  for (const attr of [/data-brand=\{card\.colorToken\}/, /data-cols=\{colSpan\}/, /data-rows=\{rowSpan\}/, /data-hide-mobile=\{card\.showOnMobile \? undefined : true\}/]) {
    assert.match(card, attr);
  }
});

test('REQ-12-06/07: tarjeta rica de HTB y sus estadísticas', () => {
  hasAll(`${C}/hero-cards/htb-card.astro`, ['mx-brand-tile', 'mx-brand-tile--rich', 'mx-brand-tile__body', 'mx-brand-tile__loading']);
  hasAll(`${C}/htb-stadistics.astro`, ['mx-tile-stats', 'mx-tile-stats__list', 'mx-tile-stats__item', 'mx-tile-stats__label', 'mx-tile-stats__value', 'mx-tile-stats__empty']);
});

test('REQ-12-08: últimos artículos con tarjetas de artículo', () => {
  hasAll(`${C}/latest-articles.astro`, ['mx-page', 'mx-heading', 'mx-article-list', 'mx-article-card', 'mx-article-card__link', 'mx-media',
    'mx-article-card__image', 'mx-article-card__title', 'mx-meta', 'mx-article-card__description', 'mx-tag-list', 'mx-tag']);
});

test('REQ-12-09/10: banda de logos y tarjetas promocionales', () => {
  hasAll(`${C}/mxvi-logos-banner.astro`, ['mx-logo-band', 'mx-logo-band__track', 'mx-logo-band__link']);
  assert.match(read(`${C}/mxvi-logos-banner.astro`), /class="mx-logo-band__logo"/);
  hasAll(`${C}/promo-tiles/promo-tiles.astro`, ['mx-promo-grid', 'mx-promo-tile', 'mx-promo-tile__title', 'mx-promo-tile__subtitle',
    'mx-promo-tile__actions', 'mx-button', 'mx-button--cta', 'mx-button--cta-outline', 'mx-promo-tile__image']);
});

test('REQ-12-11: los scripts de movimiento localizan las clases mx-*', () => {
  const hero = read(`${C}/new-hero/hero-cards-motion.ts`);
  assert.match(hero, /'\.mx-bento'/);
  assert.match(hero, /:scope > \.mx-brand-tile/);
  const horizontal = walk(`${C}/latest-horizontal`).filter((p) => p.endsWith('.ts')).map(read).join('\n');
  assert.match(horizontal, /'\.mx-article-list'/);
  assert.match(horizontal, /'\.mx-article-card'/);
  assert.doesNotMatch(horizontal, /latest-articles__/);
});

test('REQ-12-12: las once hojas antiguas de la home ya no existen', () => {
  for (const sheet of ['hero-section', 'profile-card', 'hero-card', 'hero-card-accents', 'hero-card-link', 'hero-card-brands',
    'htb-card', 'htb-stadistics', 'latest-articles', 'mxvi-logos-banner', 'promo-tiles']) {
    assert.ok(!existsSync(`src/styles/${sheet}.css`), sheet);
  }
});

test('REQ-12-13: src no usa los atributos antiguos de las tarjetas', () => {
  for (const file of walk('src').filter((p) => /\.(astro|ts|css)$/.test(p) && !p.includes('styles/mxvi'))) {
    assert.doesNotMatch(read(file), /data-(color-token|col-span|row-span|show-on-mobile)|\.dataset\.(colorToken|showOnMobile)/, file);
  }
});

test('REQ-12-14: typography.css ya no declara la fuente de las tarjetas del hero ni de los artículos', () => {
  // REQ-15-11: typography.css se elimina; mientras exista no declara estas reglas.
  if (existsSync('src/styles/typography.css')) assert.doesNotMatch(read('src/styles/typography.css'), /hero-card|card-title|latest-articles__/);
});
