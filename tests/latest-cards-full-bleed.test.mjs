// Feature 76 (latest-cards-full-bleed): las cards entran y salen cruzando los bordes de la VENTANA,
// no los del par (sin clip-path lateral). Opción B del humano: en reposo los márgenes quedan limpios,
// porque la primera y la última card llevan una x propia de ±Δ, con Δ = max(0, inset − gap).
// Spec: specs/76_latest-cards-full-bleed/. Mediciones en navegador en progress/impl_76.md.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (rel) => { assert.ok(existsSync(new URL(rel, root)), `falta ${rel}`); return readFileSync(new URL(rel, root), 'utf8'); };
const geo = () => import(new URL('src/domain/latest-horizontal.ts', root).href);
const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 1e-9, `${msg}: ${a} != ${b}`);
const MOD = 'src/components/latest-horizontal/latest-horizontal.ts';

test('REQ-76-06..09: restMargin y edgeOffsets', async () => {
  const g = await geo();
  for (const fn of ['restMargin', 'edgeOffsets']) assert.equal(typeof g[fn], 'function', fn);
  for (const w of ['gsap', 'window', 'document']) assert.ok(!read('src/domain/latest-horizontal.ts').includes(w), w);
  assert.equal(g.restMargin(31.75, 14), 17.75); assert.equal(g.restMargin(35.75, 14), 21.75);
  near(g.restMargin(340.89, 14), 326.89, 'restMargin 1600'); assert.equal(g.restMargin(10, 14), 0);
  for (const bad of [NaN, Infinity, -5]) assert.equal(g.restMargin(bad, 14), 0, `inset ${bad}`);
  for (const bad of [NaN, -1]) assert.equal(g.restMargin(31.75, bad), 0, `gap ${bad}`);
  assert.deepEqual(g.edgeOffsets(0, 3, 31.75, 14), [0, 0, 17.75]);
  assert.deepEqual(g.edgeOffsets(1, 3, 31.75, 14), [-17.75, 0, 0]);
  assert.deepEqual(g.edgeOffsets(0.5, 3, 31.75, 14), [-8.875, 0, 8.875]);
  assert.deepEqual(g.edgeOffsets(0.5, 4, 31.75, 14), [-8.875, 0, 0, 8.875]);
  assert.deepEqual(g.edgeOffsets(1.7, 3, 31.75, 14), g.edgeOffsets(1, 3, 31.75, 14));
  for (const p of [-1, NaN]) assert.deepEqual(g.edgeOffsets(p, 3, 31.75, 14), g.edgeOffsets(0, 3, 31.75, 14));
  for (const n of [2, 2.5, NaN]) assert.deepEqual(g.edgeOffsets(0.5, n, 31.75, 14), [], `count ${n}`);
  assert.ok(Object.is(g.edgeOffsets(0, 3, 31.75, 14)[0], 0)); assert.ok(Object.is(g.edgeOffsets(1, 3, 31.75, 14)[2], 0));
  let first = Infinity, last = Infinity;
  for (let i = 0; i <= 100; i++) { const o = g.edgeOffsets(i / 100, 3, 31.75, 14); assert.ok(o[0] <= first && o[2] <= last, `p ${i / 100}`); first = o[0]; last = o[2]; }
  assert.equal(g.cardLeftX(2, 1270, 596.25, 14, 0) + 17.75, 1270);
  assert.equal(g.cardLeftX(0, 1270, 596.25, 14, -610.25) + 596.25 - 17.75, 0);
  assert.equal(g.cardLeftX(2, 1430, 672.25, 14, 0) + 21.75, 1430);
  const V = 1590, W = 447.11, G = 14, inset = g.pairInset(V, W, G), d = g.restMargin(inset, G);
  near(g.cardLeftX(2, V, W, G, 0) + d, 1590, 'card 3 a 1600×700');
  near(g.cardLeftX(0, V, W, G, g.trackOffset(1, W, G, 3)) + W - d, 0, 'card 1 a 1600×700');
});

test('REQ-76-01..04/11/25: hoja sin clip-path, overflow clip y transición sin transform', () => {
  const css = read('src/styles/latest-horizontal.css').replace(/[/][*][^]*?[*][/]/g, '');
  assert.doesNotMatch(css, /clip-path/);
  const rule = (sel) => [...css.matchAll(/([^{}]+)[{]([^{}]*)[}]/g)].filter(([, s]) => s.trim() === sel).map(([, , b]) => b).join(';');
  const section = rule('.latest-articles--horizontal');
  assert.match(section, /width:[ ]*100%/); assert.match(section, /overflow:[ ]*clip/);
  const entering = rule('.latest-articles--horizontal.latest-articles--entering');
  assert.match(entering, /overflow-y:[ ]*visible/); assert.doesNotMatch(entering, /overflow-x|overflow:[ ]*visible/);
  const heading = rule('.latest-articles--horizontal.latest-articles--entering .latest-articles__heading');
  assert.match(heading, /position:[ ]*relative/); assert.match(heading, /z-index:[ ]*1/);
  assert.match(rule('.latest-articles--horizontal .latest-articles__card'), /transition-property:[ ]*border-color,[ ]*box-shadow/);
  for (const [, sel] of css.matchAll(/([^{}]+)[{][^{}]*[}]/g)) for (const s of sel.split(',')) assert.ok(s.includes('.latest-articles--horizontal'), s.trim());
  const latest = read('src/styles/latest-articles.css');
  assert.equal(latest.split('\n').length - (latest.endsWith('\n') ? 1 : 0), 98);
});

// Ronda 2 (review_76): el test ata la x de las cards al bloque de la línea de tiempo del horizontal y
// exige la limpieza real de las cards en clearTrack (no basta con que aparezcan las cadenas).
test('REQ-76-10/12/13: x de las cards extremas en el mismo ScrollTrigger y limpieza de las cards', () => {
  const mod = read(MOD);
  assert.match(mod, /import [{][^}]*edgeOffsets[^}]*[}] from ['"][.][.][/][.][.][/]domain[/]latest-horizontal[.]ts['"]/);
  assert.ok(mod.includes('pairInset') || mod.includes('restMargin'));
  const from = mod.indexOf('gsap.timeline('), to = mod.indexOf('gsap.fromTo(track');
  assert.ok(from >= 0 && to > from, 'falta la línea de tiempo antes de la entrada');
  const block = mod.slice(from, to);
  for (const s of ["start: 'top top'", 'pinScrollLength', 'scrub: true', 'invalidateOnRefresh: true', "ease: 'none'", 'edgeOffsets(0,', 'edgeOffsets(1,', 'cards[']) assert.ok(block.includes(s), `línea de tiempo sin ${s}`);
  const outside = mod.slice(0, from) + mod.slice(to);
  assert.doesNotMatch(outside, /[.](to|from|fromTo|set)[(][ ]*cards/, 'animación de cards fuera de la línea de tiempo del horizontal');
  assert.equal(mod.split("start: 'top top'").length - 1, 1, "un único start: 'top top'");
  assert.ok(!mod.includes("addEventListener('scroll'"));
  assert.doesNotMatch(mod, /gsap[.](to|fromTo|from)[(][^)]*latest-articles__card/);
  const dom = read('src/components/latest-horizontal/track-dom.ts').replace(/[/][/].*$/gm, '');
  const clear = dom.slice(dom.indexOf('export function clearTrack'), dom.indexOf('}', dom.indexOf('export function clearTrack')));
  assert.match(clear, /querySelectorAll[^)]*latest-articles__card/, 'clearTrack no recorre las cards');
  const helper = clear.match(/[ ]([a-zA-Z]+)[(]el[)];/)?.[1];
  assert.ok(helper, 'clearTrack no aplica una utilidad a cada elemento');
  const util = dom.slice(dom.indexOf(`function ${helper}`), dom.indexOf(String.fromCharCode(10) + '}', dom.indexOf(`function ${helper}`)));
  for (const s of ["removeProperty('transform')", "removeProperty('translate')", "removeAttribute('style')"]) assert.ok(util.includes(s), `${helper} sin ${s}`);
});

test('REQ-76-25: archivos tocados <= 100 líneas', () => {
  for (const rel of ['src/domain/latest-horizontal.ts', MOD, 'src/components/latest-horizontal/track-dom.ts', 'src/styles/latest-horizontal.css', 'tests/latest-cards-full-bleed.test.mjs']) {
    const s = read(rel); assert.ok(s.split('\n').length - (s.endsWith('\n') ? 1 : 0) <= 100, rel);
  }
});
