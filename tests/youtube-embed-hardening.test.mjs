// Test del endurecimiento de los iframes de YouTube (feature 50
// youtube-embed-hardening, REQ-50-01..06): youtube-nocookie, carga diferida,
// referrerpolicy, sin autoplay y con title. Recorre todos los posts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const posts = readdirSync(new URL('src/content/posts/', root), { recursive: true })
  .filter((f) => f.endsWith('.md'))
  .map((f) => [f, readFileSync(new URL(`src/content/posts/${f.split(String.fromCharCode(92)).join('/')}`, root), 'utf8')]);
const iframes = posts.flatMap(([file, md]) => [...md.matchAll(/<iframe\b[\s\S]*?>/g)].map((m) => [file, m[0]]));
// Valor de un atributo (espacio en blanco antes del nombre; sin barras invertidas en el fuente).
const WS = String.fromCharCode(32, 9, 10, 13);
const attr = (tag, name) => tag.match(new RegExp(`[${WS}]${name}="([^"]*)"`))?.[1];

test('hay al menos un iframe que verificar', () => {
  assert.ok(iframes.length > 0);
});

test('REQ-50-01: todos los iframes usan youtube-nocookie.com/embed', () => {
  for (const [, md] of posts) assert.doesNotMatch(md, /www\.youtube\.com\/embed/);
  for (const [file, tag] of iframes) assert.match(attr(tag, 'src') ?? '', /^https:\/\/www\.youtube-nocookie\.com\/embed\//, file);
});

test('REQ-50-02: loading="lazy" y referrerpolicy estricta', () => {
  for (const [file, tag] of iframes) {
    assert.equal(attr(tag, 'loading'), 'lazy', file);
    assert.equal(attr(tag, 'referrerpolicy'), 'strict-origin-when-cross-origin', file);
  }
});

test('REQ-50-03: allow sin autoplay', () => {
  for (const [file, tag] of iframes) assert.doesNotMatch(attr(tag, 'allow') ?? '', /autoplay/, file);
});

test('REQ-50-04: title no vacío', () => {
  for (const [file, tag] of iframes) assert.ok((attr(tag, 'title') ?? '').trim().length > 0, file);
});

test('REQ-50-06: el bloque del iframe sigue siendo compacto (como máximo 8 líneas)', () => {
  // La etiqueta <iframe> de 02-principios.md pasó de 6 a 8 líneas al añadir
  // loading y referrerpolicy. El límite de 100 líneas de docs/architecture.md
  // se aplica al código, no al contenido markdown (precedente: features 39 y 45);
  // aquí solo se vigila que el bloque no crezca más allá de lo necesario.
  for (const [file, tag] of iframes) assert.ok(tag.split(String.fromCharCode(10)).length <= 8, file);
});
