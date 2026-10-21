// Feature 115 (hero-cards-lego-motion): entrada y salida aleatoria tipo lego de las cards del hero.
// Spec: specs/115_hero-cards-lego-motion/ (requirements.md + design.md). La medida en navegador
// (REQ-115-09/13..19) va con Chrome headless + CDP; evidencias en progress/research/hero115/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs'; import { createHash } from 'node:crypto';
import { astroBuild } from './helpers/astro-build.mjs';

const url = (rel) => new URL(`../${rel}`, import.meta.url);
const read = (rel) => { assert.ok(existsSync(url(rel)), `falta ${rel}`); return readFileSync(url(rel), 'utf8'); };
const code = (rel) => read(rel).replace(/\r/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const lines = (rel) => read(rel).split(/\r?\n/).filter((l, i, all) => i < all.length - 1 || l !== '').length;
const [DOMAIN, RUNTIME, LEGO, CSS, ASTRO] = ['src/domain/hero-cards-motion.ts', 'src/components/new-hero/hero-cards-motion.ts', 'src/components/new-hero/hero-cards-lego.ts', 'src/styles/hero-cards-motion.css', 'src/components/new-hero/new-hero.astro'];
const dom = () => import(url(DOMAIN).href); const SEED = 115; // semilla fija documentada para REQ-115-03
const decl = (css, sel) => { const at = css.indexOf(`${sel} {`); assert.notEqual(at, -1, `falta ${sel}`); return css.slice(at, css.indexOf('}', at)); };

test('REQ-115-01: constantes congeladas y dominio sin gsap ni DOM', async () => {
  const src = code(DOMAIN); for (const w of ['gsap', 'window', 'document']) assert.ok(!src.includes(w), w);
  const m = await dom();
  assert.deepEqual({ ...m.LEGO_ENTER }, { y: -32, scale: 1.04, opacity: 0, tiltDeg: 3, duration: 0.6, ease: 'back.out(1.7)', step: 0.05, maxDelay: 0.6 });
  assert.deepEqual({ ...m.LEGO_EXIT }, { y: -24, scale: 1.04, opacity: 0, duration: 0.35, ease: 'power2.in' });
  assert.equal(m.LEGO_RANGE.start, 'top 92%'); assert.equal(m.LEGO_RANGE.end, 'bottom 8%');
  for (const k of ['LEGO_ENTER', 'LEGO_EXIT', 'LEGO_RANGE', 'LEGO_VARS', 'LEGO_MEDIA']) assert.ok(Object.isFrozen(m[k]), k);
});
test('REQ-115-02: createRng es determinista por semilla y da valores en [0, 1)', async () => {
  const { createRng } = await dom(); const seq = (s) => { const r = createRng(s); return Array.from({ length: 50 }, r); };
  assert.deepEqual(seq(7), seq(7)); assert.notDeepEqual(seq(7), seq(8));
  for (const v of [...seq(0), ...seq(2 ** 32 - 1), ...seq(SEED)]) assert.ok(v >= 0 && v < 1, `${v}`);
});
test('REQ-115-03: legoOrder es una permutación de Fisher-Yates distinta de la identidad con la semilla 115', async () => {
  const { createRng, legoOrder } = await dom();
  for (const n of [0, 1, 2, 5, 15]) assert.deepEqual([...legoOrder(n, createRng(SEED))].sort((a, b) => a - b), Array.from({ length: n }, (_, i) => i));
  const order = legoOrder(15, createRng(SEED)); assert.notDeepEqual(order, Array.from({ length: 15 }, (_, i) => i));
  assert.deepEqual(legoOrder(15, createRng(SEED)), order);
  assert.deepEqual(legoOrder(3, () => 0), [1, 2, 0]); // Fisher-Yates de i = n-1 a 1 con j = floor(r * (i + 1))
});
test('REQ-115-04: legoDelays = posición x min(step, max / (n - 1)) sin superar max', async () => {
  const { createRng, legoOrder, legoDelays } = await dom(); for (const n of [1, 2, 5, 13, 15, 40]) {
    const order = legoOrder(n, createRng(n)); const delays = legoDelays(order, 0.05, 0.6); const s = n > 1 ? Math.min(0.05, 0.6 / (n - 1)) : 0;
    assert.equal(delays.length, n); order.forEach((card, pos) => assert.ok(Math.abs(delays[card] - pos * s) < 1e-9, `n ${n} pos ${pos}`)); for (const d of delays) assert.ok(d >= 0 && d <= 0.6, `${d}`); }
});
test('REQ-115-05: legoTilt queda en [-maxDeg, maxDeg]', async () => {
  const { createRng, legoTilt } = await dom(); const r = createRng(3); const all = Array.from({ length: 500 }, () => legoTilt(r, 3)); for (const t of all) assert.ok(t >= -3 && t <= 3, `${t}`);
  assert.ok(all.some((t) => t < 0) && all.some((t) => t > 0)); assert.equal(legoTilt(() => 0, 3), -3);
});
test('REQ-115-06/14/15/18: script en new-hero.astro, matchMedia por consulta y limpieza', async () => {
  const astro = read(ASTRO); assert.match(astro, /import "\.\.\/\.\.\/styles\/hero-cards-motion\.css";/);
  const script = astro.match(/<script>([\s\S]*?)<\/script>/)?.[1] ?? ''; assert.match(script, /from '\.\/hero-cards-motion\.ts'/);
  assert.match(script, /'astro:page-load', \(\) => init\(\)/); assert.match(script, /'astro:before-swap', \(\) => destroy\(\)/);
  const rt = code(RUNTIME); assert.match(rt, /gsap\.matchMedia\(\)/); assert.match(rt, /\.hero-grid/); assert.match(rt, /:scope > \.hero-card/);
  assert.match(rt, /data-show-on-mobile/); assert.match(rt, /mm\?\.revert\(\)/); assert.match(rt, /createRng\(/); assert.match(rt, /Math\.random\(\)/);
  const { LEGO_MEDIA } = await dom();
  assert.equal(LEGO_MEDIA.mobile, '(max-width: 768px) and (prefers-reduced-motion: no-preference)');
  assert.equal(LEGO_MEDIA.wide, '(min-width: 769px) and (prefers-reduced-motion: no-preference)');
  assert.equal((rt.match(/mm\.add\(/g) ?? []).length, 2); for (const k of ['mobile', 'wide']) assert.match(rt, new RegExp(`LEGO_MEDIA\\.${k}`));
});
test('REQ-115-07/08/09/10/17: tweens solo con --hero-lego-* y opacity, valores del dominio, orden por permutación y focusin', async () => {
  const lego = code(LEGO); const { legoFrom, legoRest, legoLifted } = await dom();
  for (const k of ['onEnter', 'onEnterBack', 'onLeave', 'onLeaveBack']) assert.match(lego, new RegExp(`${k}:`));
  for (const k of ['LEGO_ENTER.duration', 'LEGO_ENTER.ease', 'LEGO_EXIT.duration', 'LEGO_EXIT.ease', 'LEGO_RANGE.start', 'LEGO_RANGE.end', 'legoOrder(', 'legoDelays(', 'legoTilt(', 'legoFrom(', 'legoLifted()', 'legoRest()', "'focusin'"]) assert.ok(lego.includes(k), k);
  assert.doesNotMatch(lego, /\b(x|y|rotation|xPercent|yPercent|transform|scale|rotate)\s*:/, 'propiedad de transform en un tween');
  assert.doesNotMatch(lego.replace(/\[[^\]]*\]/g, ''), /\b(duration|delay|opacity)\s*:\s*-?[\d.]/, 'número suelto de animación');
  assert.deepEqual(legoFrom(2.5), { '--hero-lego-y': '-32px', '--hero-lego-rotate': '2.5deg', '--hero-lego-scale': '1.04', opacity: 0 });
  assert.deepEqual(legoRest(), { '--hero-lego-y': '0px', '--hero-lego-rotate': '0deg', '--hero-lego-scale': '1', opacity: 1 });
  assert.deepEqual(legoLifted(), { '--hero-lego-y': '-24px', '--hero-lego-rotate': '0deg', '--hero-lego-scale': '1.04', opacity: 0 });
});
test('REQ-115-16: fase por progress y reposo de toda card que intersecta el viewport (margen 8 % de top 92% / bottom 8%)', async () => {
  const { legoPhase, legoPhaseAt, LEGO_RANGE } = await dom(); assert.equal(LEGO_RANGE.edge, 0.08);
  assert.deepEqual([0, 0.4, 1].map(legoPhase), ['before', 'rest', 'gone']); assert.equal(legoPhase(-0.1), 'before'); assert.equal(legoPhase(1.2), 'gone');
  const t = (progress) => ({ start: 15, end: 891, progress }); // card con top 751 y bottom 955 en un viewport de 800 px
  assert.equal(legoPhaseAt(t(0), 0, 800), 'rest'); assert.equal(legoPhaseAt(t(0), -50, 800), 'before'); // asoma en el 8 % inferior: reposo
  assert.equal(legoPhaseAt(t(1), 940, 800), 'rest'); assert.equal(legoPhaseAt(t(1), 960, 800), 'gone'); assert.equal(legoPhaseAt(t(0.5), 400, 800), 'rest');
  const rt = code(LEGO); for (const k of ["'refreshInit'", "'refresh'", 'legoPhaseAt(', 'window.scrollY']) assert.ok(rt.includes(k), k);
});
test('REQ-115-11/12/13: la hoja compone translate/rotate/scale con respaldo y limita transition-property; sin estado oculto', () => {
  const css = code(CSS); const rule = decl(css, '.hero-grid > .hero-card');
  for (const d of ['translate: 0 var(--hero-lego-y, 0px);', 'rotate: var(--hero-lego-rotate, 0deg);', 'scale: var(--hero-lego-scale, 1);', 'transition-property: transform, box-shadow, filter;']) assert.ok(rule.includes(d), d);
  for (const f of readdirSync(url('src/styles/')).filter((f) => f.endsWith('.css'))) {
    const src = code(`src/styles/${f}`); assert.doesNotMatch(src, /--hero-lego-[a-z]+\s*:/, `${f} fija una --hero-lego-*`);
    for (const m of src.matchAll(/([^{}]*\.hero-card[^{}]*)\{([^}]*)\}/g)) assert.doesNotMatch(m[2], /(^|;|\s)opacity:\s*0\s*(;|$)/, `${f}: ${m[1].trim()}`);
  }
});
test('REQ-115-20/22: componentes de la card intactos, <= 100 líneas y sin dependencias nuevas', () => {
  const SNAP = { 'src/components/hero-card.astro': '0358a0816f46e339', 'src/components/hero-cards/htb-card.astro': '38f0644fc42a8f1b', 'src/components/hero-card-art.astro': 'cd4edadb47639555', 'src/styles/hero-card.css': '49ba74822a4a0b87' };
  for (const [rel, sha] of Object.entries(SNAP)) assert.equal(createHash('sha256').update(readFileSync(url(rel))).digest('hex').slice(0, 16), sha, `${rel} cambió`);
  for (const rel of [DOMAIN, RUNTIME, LEGO, CSS, ASTRO, 'tests/hero-cards-lego-motion.test.mjs']) assert.ok(lines(rel) <= 100, `${rel} > 100 líneas`);
  assert.deepEqual(Object.keys(JSON.parse(read('package.json')).dependencies), ['@astrojs/cloudflare', 'astro', 'geist', 'gsap', 'pdf-lib', 'wrangler']);
});
test('REQ-115-06/13/21 (build): una sola etiqueta de script del hero, cards sin style y portada < 42 000 B', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló: ${build.stderr}`);
  const html = read('dist/client/index.html'); const bytes = Buffer.byteLength(html); assert.ok(bytes < 42000, `index.html pesa ${bytes} bytes`);
  for (const m of html.matchAll(/<article class="hero-card[^"]*"[^>]*>/g)) assert.doesNotMatch(m[0], /\bstyle=/);
  assert.ok(!html.includes('legoOrder') && !html.includes('--hero-lego-y:'), 'runtime inline en el HTML');
});
test('REQ-115-19: evidencias de la CDP en progress/research/hero115/', () => {
  const m = JSON.parse(read('progress/research/hero115/measurements.json'));
  for (const w of [375, 800, 1024, 1280, 1600]) { const r = m.widths[w]; assert.ok(r, `sin ${w}`); assert.ok(r.clsLoad <= 0.1 && r.clsRestore <= 0.1, `CLS ${w}`); assert.equal(r.errors, 0, `errores ${w}`); }
  for (const f of ['enter-1280-0.png', 'enter-1280-1.png', 'exit-1280-0.png']) assert.ok(existsSync(url(`progress/research/hero115/${f}`)), f);
});
