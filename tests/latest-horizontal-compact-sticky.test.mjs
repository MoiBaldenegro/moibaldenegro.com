// Feature 73 (latest-horizontal-compact-sticky): el modo horizontal de la portada muestra un PAR
// de cards que llena el contenedor (1 y 2 al inicio, n-1 y n al final), scroll 1:1 con el
// recorrido y fijado con position: sticky en un envoltorio (sin el pin de ScrollTrigger, que daba
// un salto con rueda real). Spec: specs/73_latest-horizontal-compact-sticky/. CDP en impl_73.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => { assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`); return readFileSync(new URL(rel, root), 'utf8'); };
const geo = () => import(new URL('src/domain/latest-horizontal.ts', root).href);
const MOD = 'src/components/latest-horizontal/latest-horizontal.ts';
const CSS = 'src/styles/latest-horizontal.css';

test('REQ-73-01..08: geometría del par de cards', async () => {
  const g = await geo();
  for (const fn of ['pairCardWidth', 'pairInset', 'trackTravel', 'pinScrollLength', 'trackOffset', 'cardLeftX', 'focusScrollTarget']) assert.equal(typeof g[fn], 'function', fn);
  const src = read('src/domain/latest-horizontal.ts');
  for (const w of ['gsap', 'window', 'document']) assert.ok(!src.includes(w), w);
  assert.equal(g.pairCardWidth(1206.5, 14, 625), 596.25);
  assert.equal(g.pairCardWidth(1500, 14, 433.75), 433.75);
  assert.equal(g.pairInset(1270, 596.25, 14), 31.75);
  assert.equal(g.pairInset(1910, 743, 14), 205);
  assert.equal(g.pairInset(1000, 600, 14), 0);
  assert.equal(g.trackTravel(596.25, 14, 3), 610.25);
  assert.equal(g.trackTravel(596.25, 14, 4), 1220.5);
  assert.equal(g.trackTravel(596.25, 14, 2), 0);
  assert.equal(g.pinScrollLength(596.25, 14, 3), 610.25);
  assert.equal(g.trackOffset(0, 596.25, 14, 3), 0);
  assert.equal(g.trackOffset(0.5, 596.25, 14, 3), -305.125);
  assert.equal(g.trackOffset(1.7, 596.25, 14, 3), -610.25);
  assert.equal(g.cardLeftX(0, 1270, 596.25, 14, 0), 31.75);
  assert.equal(g.cardLeftX(2, 1270, 596.25, 14, 0), 1252.25);
  assert.equal(g.cardLeftX(1, 1270, 596.25, 14, -610.25), 31.75);
  assert.equal(g.cardLeftX(2, 1270, 596.25, 14, -610.25), 642);
  for (const [i, n] of [[0, 3], [1, 3], [-1, 3], [0, 2]]) assert.equal(g.focusScrollTarget(i, n, 1000, 1610), 1000, `${i},${n}`);
  for (const [i, n] of [[2, 3], [5, 3]]) assert.equal(g.focusScrollTarget(i, n, 1000, 1610), 1610, `${i},${n}`);
  assert.equal(g.focusScrollTarget(1, 4, 1000, 2220), 1000);
  assert.equal(g.focusScrollTarget(2, 4, 1000, 2220), 1610);
  assert.equal(g.focusScrollTarget(3, 4, 1000, 2220), 2220);
});

test('REQ-73-09: entradas inválidas devuelven 0 sin lanzar', async () => {
  const g = await geo();
  for (const n of [0, 1, 2, 2.5, NaN]) for (const fn of ['trackTravel', 'pinScrollLength']) assert.equal(g[fn](596.25, 14, n), 0, `${fn} n=${n}`);
  for (const n of [0, 1, 2, 2.5, NaN]) assert.equal(g.trackOffset(0.5, 596.25, 14, n), 0, `trackOffset n=${n}`);
  for (const w of [0, -100, NaN, Infinity]) {
    assert.equal(g.pairCardWidth(w, 14, 625), 0, `pairCardWidth ${w}`);
    assert.equal(g.pairInset(w, 596.25, 14), 0, `pairInset ${w}`);
    assert.equal(g.trackTravel(w, 14, 3), 0, `trackTravel ${w}`);
  }
  assert.equal(g.pairCardWidth(1206.5, -1, 625), 0);
  assert.equal(g.pairInset(1270, 596.25, -1), 0);
  assert.equal(g.trackTravel(596.25, -1, 3), 0);
});

test('REQ-73-10/11/15/16/21: hoja con par, gap, recorte y sticky', () => {
  const css = read(CSS).replace(/[/][*][^]*?[*][/]/g, '');
  const width = css.match(/--latest-card-width:([^;]+);/)?.[1] ?? '';
  for (const s of ['var(--container-max)', '95%', 'var(--gap-card)', '/ 2']) assert.ok(width.includes(s), `--latest-card-width sin ${s}`);
  assert.match(css, /--latest-pair-inset:/);
  const rule = (sel) => [...css.matchAll(/([^{}]+)[{]([^{}]*)[}]/g)].filter(([, s]) => s.trim() === sel).map(([, , b]) => b).join(';');
  const track = rule('.latest-articles--horizontal .latest-articles__list');
  assert.match(track, /gap:[ ]*var[(]--gap-card[)]/);
  assert.doesNotMatch(track, /padding-inline/);
  assert.doesNotMatch(rule('.latest-articles--horizontal .latest-articles__card'), /margin-inline/);
  assert.match(rule('.latest-articles--horizontal .latest-articles__card:first-child'), /margin-inline-start:[ ]*var[(]--latest-pair-inset[)]/);
  const section = rule('.latest-articles--horizontal');
  // Ajuste REQ-76-01 (precedente REQ-43-06): sin clip-path lateral; las cards cruzan los bordes de la ventana.
  assert.doesNotMatch(section, /clip-path/);
  for (const re of [/position:[ ]*sticky/, /top:[ ]*0/, /min-height:[ ]*100vh/, /overflow:[ ]*clip/]) assert.match(section, re);
  assert.match(rule('.latest-articles--horizontal .latest-articles__heading'), /2 [*] var[(]--latest-card-width[)] [+] var[(]--gap-card[)]/);
  for (const [, sel] of css.matchAll(/([^{}]+)[{][^{}]*[}]/g)) for (const s of sel.split(',')) assert.ok(s.includes('.latest-articles--horizontal'), s.trim());
});

test('REQ-73-18/19/20/22: efecto con envoltorio sticky, sin pin', () => {
  const mod = read(MOD);
  for (const s of ['pin:', 'anticipatePin']) assert.ok(!mod.includes(s), s);
  assert.match(mod, /length < 3/);
  assert.ok(mod.includes('latest-articles--horizontal-pin'));
  assert.ok(mod.includes('getBoundingClientRect'));
  assert.match(mod, /import [{][^}]*pinScrollLength[^}]*[}] from ['"][.][.][/][.][.][/]domain[/]latest-horizontal[.]ts['"]/);
  assert.match(mod, /import [{][^}]*trackOffset[^}]*[}]/);
  assert.doesNotMatch(mod, /onRefresh/);
  for (const s of ['scrub: true', "ease: 'none'", 'invalidateOnRefresh: true', "start: 'top top'"]) assert.ok(mod.includes(s), s);
  assert.match(mod, /end: [(][)] =>[^\n]*pinScrollLength/);
});

test('REQ-73-33/34: LATEST_POSTS_LIMIT sigue en 3 y archivos <= 100 líneas', () => {
  assert.match(read('src/domain/latest-posts.ts'), /export const LATEST_POSTS_LIMIT = 3;/);
  for (const rel of ['src/domain/latest-horizontal.ts', MOD, CSS, 'tests/latest-horizontal-compact-sticky.test.mjs']) {
    const s = read(rel); assert.ok(s.split('\n').length - (s.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
