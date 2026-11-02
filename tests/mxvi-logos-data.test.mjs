// Test de la feature 5 mxvi-logos-links-data — datos y repositorio (REQ-05-01..14).
// Spec: specs/05_mxvi-logos-links-data/requirements.md. node:test, sin dependencias.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MxviLogosRepository, MxviLogosDataError } from '../src/domain/repositories/mxvi-logos-repository.ts';

const GITHUB = 'https://github.com/MoiBaldenegro';
const ESPERADO = [
  ['mxvi-m', 'M', '0 0 717 716'],
  ['mxvi-x', 'X', '0 0 805 716'],
  ['mxvi-v', 'V', '0 0 795 716'],
  ['mxvi-i', 'I', '0 0 190 716'],
].map(([id, letter, viewBox]) => ({ id, letter, viewBox, href: GITHUB, label: `MXVI ${letter} — GitHub` }));

const fixture = (n = 4) => ({ logos: Array.from({ length: n }, (_, i) => ({ ...ESPERADO[i % 4] })) });
const repo = (data) => new MxviLogosRepository(() => (typeof data === 'string' ? data : JSON.stringify(data)));
const conLogo = (i, cambio) => { const d = fixture(); cambio(d.logos[i]); return d; };
const lanza = (fn, ...patrones) => assert.throws(fn, (err) => {
  assert.ok(err instanceof MxviLogosDataError, `esperaba MxviLogosDataError, llegó ${err}`);
  assert.equal(err.name, 'MxviLogosDataError');
  for (const p of [/mxvi-logos\.json/, ...patrones]) assert.match(err.message, p);
  return true;
});

test('REQ-05-01/03/04/05/07: getLogos() devuelve los cuatro logos exactos en orden', () => {
  assert.deepEqual(new MxviLogosRepository().getLogos(), ESPERADO);
});

test('REQ-05-01/02: src/data/mxvi-logos.json declara 4 logos con los 5 campos de texto', () => {
  const data = JSON.parse(readFileSync(new URL('../src/data/mxvi-logos.json', import.meta.url), 'utf8'));
  assert.deepEqual(data.logos.map((l) => l.id), ['mxvi-m', 'mxvi-x', 'mxvi-v', 'mxvi-i']);
  for (const l of data.logos) {
    assert.deepEqual(Object.keys(l).sort(), ['href', 'id', 'label', 'letter', 'viewBox']);
    for (const v of Object.values(l)) assert.ok(typeof v === 'string' && v.trim() !== '');
  }
});

test('REQ-05-02/06/08: con un loader inyectado entrega entidades con 5 campos en el orden del JSON', () => {
  const d = fixture();
  d.logos.reverse()[0].href = 'https://example.com/i';
  const logos = repo(d).getLogos();
  assert.deepEqual(logos.map((l) => l.id), ['mxvi-i', 'mxvi-v', 'mxvi-x', 'mxvi-m']);
  assert.equal(logos[0].href, 'https://example.com/i');
  for (const l of logos) assert.deepEqual(Object.keys(l).sort(), ['href', 'id', 'label', 'letter', 'viewBox']);
});

test('REQ-05-06: la entidad MxviLogo expone campos readonly id, letter, viewBox, href y label', () => {
  const src = readFileSync(new URL('../src/domain/entities/mxvi-logo.ts', import.meta.url), 'utf8');
  assert.match(src, /export interface MxviLogo\b/);
  for (const f of ['id', 'letter', 'viewBox', 'href', 'label']) {
    assert.match(src, new RegExp(`readonly ${f}: string;`));
  }
});

test('REQ-05-09: un loader que lanza o un texto no JSON lanzan MxviLogosDataError', () => {
  lanza(() => new MxviLogosRepository(() => { throw new Error('io'); }).getLogos());
  lanza(() => repo('esto no es json').getLogos());
});

test('REQ-05-10: sin array logos o con 3 o 5 logos lanza MxviLogosDataError', () => {
  lanza(() => repo({}).getLogos());
  lanza(() => repo({ logos: 'x' }).getLogos());
  lanza(() => repo([]).getLogos());
  lanza(() => repo(fixture(3)).getLogos());
  lanza(() => repo(fixture(5)).getLogos());
});

test('REQ-05-11: campo ausente, vacío o no texto lanza error con índice y campo', () => {
  lanza(() => repo(conLogo(2, (l) => { delete l.label; })).getLogos(), /logos\[2\]/, /label/);
  lanza(() => repo(conLogo(1, (l) => { l.href = ''; })).getLogos(), /logos\[1\]/, /href/);
  lanza(() => repo(conLogo(3, (l) => { l.letter = 7; })).getLogos(), /logos\[3\]/, /letter/);
  lanza(() => repo(conLogo(0, (l) => { l.id = '   '; })).getLogos(), /logos\[0\]/, /id/);
  lanza(() => repo(conLogo(0, (l) => { delete l.viewBox; })).getLogos(), /logos\[0\]/, /viewBox/);
  const d = fixture();
  d.logos[1] = 'no-objeto';
  lanza(() => repo(d).getLogos(), /logos\[1\]/);
});

test('REQ-05-12: un href que no empieza por https:// lanza error con el índice', () => {
  for (const href of ['http://x.com', '/about', 'www.x.com']) {
    lanza(() => repo(conLogo(2, (l) => { l.href = href; })).getLogos(), /logos\[2\]/, /href/);
  }
});

test('REQ-05-13: un viewBox sin la forma "0 0 <ancho> <alto>" lanza error con el índice', () => {
  for (const vb of ['0 0 abc 716', '717 716', '0 0 0 716', '0 0 -5 716', '0 0 7.5 716', '1 0 717 716']) {
    lanza(() => repo(conLogo(1, (l) => { l.viewBox = vb; })).getLogos(), /logos\[1\]/, /viewBox/);
  }
});

test('REQ-05-14: los archivos nuevos de la feature tienen como máximo 100 líneas', () => {
  for (const f of ['../src/data/mxvi-logos.json', '../src/domain/entities/mxvi-logo.ts',
    '../src/domain/repositories/mxvi-logos-parse.ts', '../src/domain/repositories/mxvi-logos-repository.ts',
    './mxvi-logos-data.test.mjs']) {
    const lineas = readFileSync(new URL(f, import.meta.url), 'utf8').split('\n').length;
    assert.ok(lineas <= 100, `${f} tiene ${lineas} líneas`);
  }
});
