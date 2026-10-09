// Feature 75 (latest-cards-entrance): en el modo horizontal de escritorio, las cards entran desde
// arriba ligadas al scroll y se «clavan» justo al inicio del tramo fijado de la feature 73.
// Spec: specs/75_latest-cards-entrance/. Mediciones en navegador en progress/impl_75.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => { assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`); return readFileSync(new URL(rel, root), 'utf8'); };
const DOMAIN = 'src/domain/latest-entrance.ts';
const load = async () => { read(DOMAIN); return import(new URL(DOMAIN, root).href); };
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} != ${b}`);

test('REQ-75-01..07: ease, distancia, estado y progreso de la entrada', async () => {
  const m = await load();
  for (const fn of ['entranceEase', 'entranceDistance', 'entranceState', 'entranceProgress']) assert.equal(typeof m[fn], 'function', fn);
  for (const w of ['gsap', 'window', 'document']) assert.ok(!read(DOMAIN).includes(w), w);
  const { entranceEase: ease, entranceDistance: dist, entranceState: state, entranceProgress: prog } = m;
  assert.equal(ease(0), 0); assert.equal(ease(0.5), 0.875); assert.equal(ease(1), 1); assert.equal(ease(-1), 0); assert.equal(ease(2), 1);
  let last = 0;
  for (let i = 0; i <= 100; i++) { const v = ease(i / 100); assert.ok(v >= last && v >= 0 && v <= 1, `ease(${i / 100})`); last = v; }
  assert.equal(dist(800), 320); assert.equal(dist(900), 360);
  assert.deepEqual(state(0, 800), { y: -320, scale: 0.9, opacity: 0 });
  assert.equal(state(0.25, 800).y, -135);
  const half = state(0.5, 800);
  near(half.y, -40, 'y'); near(half.opacity, 0.875, 'opacity'); near(half.scale, 0.9875, 'scale');
  assert.equal(state(0.5, 900).y, -45);
  for (const p of [1, 3]) { const s = state(p, 800); assert.ok(Object.is(s.y, 0), `y en ${p}`); assert.equal(s.scale, 1); assert.equal(s.opacity, 1); }
  assert.equal(prog(415, 1215, 800), 0); assert.equal(prog(815, 1215, 800), 0.5); assert.equal(prog(1215, 1215, 800), 1);
  assert.equal(prog(0, 1215, 800), 0); assert.equal(prog(5000, 1215, 800), 1);
});

test('REQ-75-08: entradas inválidas devuelven el estado final sin lanzar', async () => {
  const { entranceEase, entranceDistance, entranceState, entranceProgress } = await load();
  for (const bad of [NaN, Infinity]) {
    assert.equal(entranceEase(bad), 1);
    assert.equal(entranceProgress(bad, 1215, 800), 1);
    assert.deepEqual(entranceState(bad, 800), { y: 0, scale: 1, opacity: 1 });
  }
  for (const vh of [0, -800, NaN, Infinity]) {
    assert.equal(entranceDistance(vh), 0, `distance ${vh}`);
    assert.deepEqual(entranceState(0.5, vh), { y: 0, scale: 1, opacity: 1 }, `state ${vh}`);
    assert.equal(entranceProgress(500, 1215, vh), 1, `progress ${vh}`);
  }
});

test('REQ-75-09/10/11: tween fromTo del track con scrub entre top bottom y top top', () => {
  const mod = read('src/components/latest-horizontal/latest-horizontal.ts');
  assert.match(mod, /import [{][^}]*entranceEase[^}]*[}] from ['"][.][.][/][.][.][/]domain[/]latest-entrance[.]ts['"]/);
  assert.ok(mod.includes('entranceState'));
  assert.match(mod, /gsap[.]fromTo[(]\s*track/);
  for (const s of ['scale', 'opacity', 'ease: entranceEase', "start: 'top bottom'", "end: 'top top'", 'toggleClass', 'latest-articles--entering']) assert.ok(mod.includes(s), s);
  const block = mod.slice(mod.indexOf('gsap.fromTo(track'), mod.indexOf('});', mod.indexOf('gsap.fromTo(track')));
  for (const s of ['scrub: true', 'invalidateOnRefresh: true', "start: 'top bottom'", "end: 'top top'", 'ease: entranceEase']) assert.ok(block.includes(s), `fromTo de la entrada sin ${s}`);
  assert.ok(!mod.includes('pin:'));
  assert.doesNotMatch(mod, /gsap[.](to|fromTo|from)[(][^)]*(latest-articles__card|latest-articles__heading)/);
});

test('REQ-75-14/15: recorte y encabezado durante la entrada', () => {
  const css = read('src/styles/latest-horizontal.css').replace(/[/][*][^]*?[*][/]/g, '');
  const rule = (sel) => [...css.matchAll(/([^{}]+)[{]([^{}]*)[}]/g)].filter(([, s]) => s.trim() === sel).map(([, , b]) => b).join(';');
  const entering = rule('.latest-articles--horizontal.latest-articles--entering');
  assert.match(entering, /overflow-y:[ ]*visible/);
  assert.doesNotMatch(entering, /clip-path/); // Ajuste REQ-76-03 (precedente REQ-43-06): sin recorte lateral
  const heading = rule('.latest-articles--horizontal.latest-articles--entering .latest-articles__heading');
  assert.match(heading, /position:[ ]*relative/); assert.match(heading, /z-index:[ ]*1/);
  for (const [, sel] of css.matchAll(/([^{}]+)[{][^{}]*[}]/g)) for (const s of sel.split(',')) assert.ok(s.includes('.latest-articles--horizontal'), s.trim());
});

test('REQ-75-27: archivos tocados <= 100 líneas', () => {
  for (const rel of [DOMAIN, 'src/components/latest-horizontal/latest-horizontal.ts', 'src/components/latest-horizontal/track-dom.ts', 'src/styles/latest-horizontal.css', 'tests/latest-cards-entrance.test.mjs']) {
    const s = read(rel); assert.ok(s.split('\n').length - (s.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
