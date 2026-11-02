// Test de la feature 4 promo-tiles-section — datos, repositorio y helper (REQ-04-01..07, 13).
// Spec: specs/04_promo-tiles-section/ (requirements.md + design.md). node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PromoTilesRepository, PromoTilesDataError } from '../src/domain/repositories/promo-tiles-repository.ts';
import { linkAttrs } from '../src/domain/promo-tiles.ts';

const ESPERADO = [
  ['youtube-kernel', 'youtube', '/assets/pic01.webp', 'Rust en el kernel de Linux',
    'Programación de sistemas explicada en video, de la memoria al kernel.',
    'Video de Moisés Baldenegro en YouTube sobre Rust en el kernel de Linux',
    ['Ver en YouTube', 'https://www.youtube.com/@moibaldenegro'], ['Sobre mí', '/about']],
  ['mfinance', 'mfinance', '/assets/pic02.webp', 'MFinance',
    'Tus finanzas personales, 100 % locales. Tauri, Rust y React.',
    'Página de inicio de MFinance, app de escritorio de finanzas personales',
    ['Ver el código', 'https://github.com/MoiBaldenegro/mfinance'], ['Más proyectos', '/about']],
  ['new-relic', 'new-relic', '/assets/pic03.webp', 'New Relic for Students',
    'Ganador del reto de New Relic con Platzi y GitHub Education.',
    'Publicación de New Relic for Students con Moisés Melendez entre los ganadores',
    ['Ver en LinkedIn', 'https://www.linkedin.com/in/moibaldenegro/'], ['Mi experiencia', '/about']],
  ['tomatesoft', 'tomatesoft', '/assets/pic04.webp', 'Tomatesoft',
    'Gestiona tu negocio de forma inteligente: punto de venta, mesas y reportes.',
    'Página de inicio de Tomatesoft con sus funcionalidades de gestión de negocio',
    ['Mi experiencia', '/about'], ['Ver GitHub', 'https://github.com/MoiBaldenegro']],
];
const toTile = ([id, tone, image, title, subtitle, imageAlt, [pl, ph], [sl, sh]]) =>
  ({ id, title, subtitle, image, imageAlt, tone, primary: { label: pl, href: ph }, secondary: { label: sl, href: sh } });
const fixture = (n = 4) => ({ tiles: Array.from({ length: n }, (_, i) => toTile(ESPERADO[i % 4])) });
const repo = (data) => new PromoTilesRepository(() => (typeof data === 'string' ? data : JSON.stringify(data)));
const conCuadro = (i, cambio) => { const d = fixture(); cambio(d.tiles[i]); return d; };
const lanza = (fn, ...patrones) => assert.throws(fn, (err) => {
  assert.ok(err instanceof PromoTilesDataError, `esperaba PromoTilesDataError, llegó ${err}`);
  assert.equal(err.name, 'PromoTilesDataError');
  for (const p of [/promo-tiles\.json/, ...patrones]) assert.match(err.message, p);
  return true;
});

test('REQ-04-01/02: getTiles() devuelve los cuatro cuadros exactos de design.md en orden', () => {
  assert.deepEqual(new PromoTilesRepository().getTiles(), ESPERADO.map(toTile));
});

test('REQ-04-03/04: con un loader inyectado entrega las entidades en el orden del JSON', () => {
  const d = fixture();
  d.tiles.reverse();
  const tiles = repo(d).getTiles();
  assert.deepEqual(tiles.map((t) => t.id), ['tomatesoft', 'new-relic', 'mfinance', 'youtube-kernel']);
  for (const t of tiles) {
    assert.deepEqual(Object.keys(t).sort(),
      ['id', 'image', 'imageAlt', 'primary', 'secondary', 'subtitle', 'title', 'tone']);
    assert.deepEqual(Object.keys(t.primary).sort(), ['href', 'label']);
    assert.deepEqual(Object.keys(t.secondary).sort(), ['href', 'label']);
  }
  assert.deepEqual(tiles, d.tiles);
});

test('REQ-04-05: loader que lanza, texto no JSON, sin tiles o con 3/5 cuadros → PromoTilesDataError', () => {
  lanza(() => new PromoTilesRepository(() => { throw new Error('io'); }).getTiles());
  lanza(() => repo('esto no es json').getTiles());
  lanza(() => repo({}).getTiles());
  lanza(() => repo({ tiles: 'x' }).getTiles());
  lanza(() => repo(fixture(3)).getTiles());
  lanza(() => repo(fixture(5)).getTiles());
});

test('REQ-04-06: campo ausente o con tipo no texto nombra el índice y el campo', () => {
  lanza(() => repo(conCuadro(1, (t) => { delete t.title; })).getTiles(), /\b1\b/, /title/);
  lanza(() => repo(conCuadro(2, (t) => { t.subtitle = 42; })).getTiles(), /\b2\b/, /subtitle/);
  lanza(() => repo(conCuadro(0, (t) => { delete t.primary.href; })).getTiles(), /\b0\b/, /primary\.href/);
  lanza(() => repo(conCuadro(3, (t) => { delete t.secondary; })).getTiles(), /\b3\b/, /secondary/);
  lanza(() => repo(conCuadro(0, (t) => { t.imageAlt = ''; })).getTiles(), /\b0\b/, /imageAlt/);
});

test('REQ-04-07: un href que no empieza por "/" ni por "https://" nombra el índice', () => {
  lanza(() => repo(conCuadro(2, (t) => { t.primary.href = 'ftp://x'; })).getTiles(), /\b2\b/);
  lanza(() => repo(conCuadro(1, (t) => { t.secondary.href = 'www.x.com'; })).getTiles(), /\b1\b/);
  lanza(() => repo(conCuadro(3, (t) => { t.primary.href = 'http://x.com'; })).getTiles(), /\b3\b/);
});

test('REQ-04-13: linkAttrs abre en pestaña nueva solo los https://', () => {
  assert.deepEqual(linkAttrs('https://github.com/MoiBaldenegro'), { target: '_blank', rel: 'noopener noreferrer' });
  assert.deepEqual(linkAttrs('/about'), {});
});
