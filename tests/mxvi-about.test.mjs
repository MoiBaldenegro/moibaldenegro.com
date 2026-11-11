// Test de la feature 13 mxvi-about (REQ-13-01..12). Spec: specs/13_mxvi-about/.
// node:test, sin dependencias. La página about usa los componentes .mx-* del design system.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const classesOf = (src) => new Set([...src.matchAll(/class="([^"]+)"/g)].flatMap((m) => m[1].split(/\s+/)));
const hasAll = (path, names) => {
  const classes = classesOf(read(path));
  for (const name of names) assert.ok(classes.has(name), `${path}: falta la clase ${name}`);
};
const A = 'src/components/about';

test('REQ-13-01: contenedor de la página con mx-container y mx-stack', () => {
  hasAll('src/pages/whoami.astro', ['mx-container', 'mx-stack', 'about']);
});

test('REQ-13-02/03/04: encabezado de perfil, redes y CV', () => {
  hasAll(`${A}/about-hero.astro`, ['mx-profile-hero', 'mx-profile-hero__media', 'mx-photo', 'mx-profile-hero__body', 'mx-profile-hero__handle',
    'mx-profile-hero__headline', 'mx-profile-hero__location', 'mx-profile-hero__summary', 'mx-profile-hero__focus',
    'mx-profile-hero__actions', 'mx-social-list--inline', 'mx-button', 'mx-button__icon', 'mx-button--accent']);
  hasAll('src/pages/whoami.astro', ['mx-profile-hero__name']);
});

test('REQ-13-05: cifras', () => {
  hasAll(`${A}/about-stats.astro`, ['mx-stats', 'mx-stat', 'mx-stat__value', 'mx-stat__label']);
});

test('REQ-13-06: cada sección con título usa mx-section y mx-heading--lg', () => {
  for (const name of ['timeline', 'skills', 'projects', 'content', 'credentials', 'philosophy']) {
    hasAll(`${A}/about-${name}.astro`, ['mx-section', 'mx-heading', 'mx-heading--lg']);
  }
});

test('REQ-13-07: experiencia en línea de tiempo', () => {
  hasAll(`${A}/about-timeline.astro`, ['mx-timeline', 'mx-timeline-item', 'mx-card', 'mx-timeline-item__head', 'mx-timeline-item__role',
    'mx-badge', 'mx-timeline-item__org', 'mx-timeline-item__highlights', 'mx-callout']);
});

test('REQ-13-08/09/10/11: stack, proyectos, contenido, formación y filosofía', () => {
  hasAll(`${A}/about-skills.astro`, ['mx-card-grid', 'mx-group-card', 'mx-group-card__title', 'mx-chip-list', 'mx-chip']);
  for (const name of ['projects', 'content']) {
    hasAll(`${A}/about-${name}.astro`, ['mx-card-grid', 'mx-project-card', 'mx-project-card__name', 'mx-project-card__link', 'mx-project-card__description']);
  }
  hasAll('src/pages/whoami.astro', ['mx-text--lead']);
  hasAll(`${A}/about-credentials.astro`, ['mx-group-card__title--accent', 'mx-entry-list', 'mx-entry-list__name', 'mx-entry-list__meta']);
  hasAll(`${A}/about-philosophy.astro`, ['mx-quote', 'mx-quote__text', 'mx-quote__caption']);
});

test('REQ-13-12: las seis hojas antiguas de about ya no existen', () => {
  for (const name of ['hero', 'stats', 'timeline', 'skills', 'projects', 'credentials']) {
    assert.ok(!existsSync(`src/styles/about-${name}.css`), name);
  }
});
