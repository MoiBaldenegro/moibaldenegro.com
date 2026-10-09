// Feature 71 (latest-horizontal-geometry): geometría pura del scroll horizontal de las cards de
// la portada. Sin gsap, window ni document: testeable con node:test.
// Ajuste feature 73 (precedente REQ-43-06): la geometría pasa de «una card por viewport» a «un par
// de cards de ancho W y gap G»; las firmas cambian y estas aserciones conservan la intención de
// REQ-71 (pureza, recorrido, acotado del progreso, foco y entradas inválidas) con la semántica
// nueva. El detalle numérico de la 73 vive en tests/latest-horizontal-compact-sticky.test.mjs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const MODULE = new URL('../src/domain/latest-horizontal.ts', import.meta.url);
const load = async () => {
  assert.ok(existsSync(MODULE), 'falta src/domain/latest-horizontal.ts');
  return import(MODULE.href);
};

test('REQ-71-01: funciones puras sin gsap, window ni document', async () => {
  const m = await load();
  for (const name of ['trackTravel', 'pinScrollLength', 'trackOffset', 'focusScrollTarget']) assert.equal(typeof m[name], 'function', name);
  const src = readFileSync(MODULE, 'utf8');
  for (const word of ['gsap', 'window', 'document']) assert.ok(!src.includes(word), `contiene ${word}`);
});

test('REQ-71-02/03: recorrido horizontal y scroll del tramo fijado (1:1 desde la 73)', async () => {
  const { trackTravel, pinScrollLength } = await load();
  assert.equal(trackTravel(600, 14, 3), 614);
  assert.equal(trackTravel(600, 14, 5), 1842);
  assert.equal(pinScrollLength(600, 14, 3), trackTravel(600, 14, 3));
});

test('REQ-71-04/05: trackOffset interpola y acota el progreso', async () => {
  const { trackOffset } = await load();
  assert.equal(trackOffset(0, 600, 14, 3), 0);
  assert.equal(trackOffset(0.5, 600, 14, 3), -307);
  assert.equal(trackOffset(1, 600, 14, 3), -614);
  assert.equal(trackOffset(-0.3, 600, 14, 3), 0);
  assert.equal(trackOffset(1.7, 600, 14, 3), -614);
  assert.equal(trackOffset(NaN, 600, 14, 3), 0);
});

test('REQ-71-09/11: scroll objetivo para enfocar cada card', async () => {
  const { focusScrollTarget } = await load();
  assert.equal(focusScrollTarget(0, 3, 1000, 1614), 1000);
  assert.equal(focusScrollTarget(2, 3, 1000, 1614), 1614);
  assert.equal(focusScrollTarget(9, 3, 1000, 1614), 1614);
  assert.equal(focusScrollTarget(0, 1, 1000, 1614), 1000);
});

test('REQ-71-10: entradas inválidas devuelven 0 sin lanzar', async () => {
  const { trackTravel, pinScrollLength, trackOffset } = await load();
  for (const count of [0, 1, 2, 2.5, NaN]) {
    assert.equal(trackTravel(600, 14, count), 0, `count ${count}`);
    assert.equal(pinScrollLength(600, 14, count), 0, `count ${count}`);
    assert.equal(trackOffset(0.5, 600, 14, count), 0, `count ${count}`);
  }
  for (const size of [0, -100, NaN, Infinity]) assert.equal(trackTravel(size, 14, 3), 0, `ancho ${size}`);
});

test('REQ-71-13: módulo y test no superan 100 líneas', () => {
  for (const url of [MODULE, new URL(import.meta.url)]) {
    const s = readFileSync(url, 'utf8');
    assert.ok(s.split('\n').length - (s.endsWith('\n') ? 1 : 0) <= 100, String(url));
  }
});
