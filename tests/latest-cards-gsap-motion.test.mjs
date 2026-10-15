// Feature 96 (latest-cards-gsap-motion): la portada vuelve a 3 artículos y las cards entran y salen
// por los laterales con tweens por tiempo de GSAP (ScrollTrigger.batch / callbacks, sin scrub).
// Rama horizontal: H-integrado. Spec: specs/96_latest-cards-gsap-motion/ (requirements.md + design.md).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { astroBuild } from './helpers/astro-build.mjs';

const ROOT = fileURLToPath(new URL('../', import.meta.url));
const url = (rel) => new URL(`../${rel}`, import.meta.url);
const read = (rel) => { assert.ok(existsSync(url(rel)), `falta ${rel}`); return readFileSync(url(rel), 'utf8'); };
const lines = (t) => t.split(/\r?\n/).filter((l, i, all) => i < all.length - 1 || l !== '').length;
const [DOMAIN, MOTION, HZ, CSS, ASTRO] = ['src/domain/latest-cards-motion.ts', 'src/components/latest-horizontal/cards-motion.ts', 'src/components/latest-horizontal/latest-horizontal.ts', 'src/styles/latest-cards-motion.css', 'src/components/latest-horizontal/latest-horizontal.astro'];
const code = (rel) => read(rel).replace(/\r/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const srcFiles = () => readdirSync(url('src/'), { recursive: true }).map((f) => `src/${f.split('\\').join('/')}`).filter((f) => /[.](ts|astro|css|mjs)$/.test(f));
const fake = (n) => Array.from({ length: n }, (_, i) => ({ id: `p-${i}`, created: `${i + 1} Enero 2020` }));
const cut = (s, open, close) => { const at = s.indexOf(open); assert.notEqual(at, -1, `falta ${open}`); return s.slice(at, s.indexOf(close, at)); };
const has = (text, list, what) => { for (const s of list) assert.ok(text.includes(s), `${what} sin ${s}`); };
const unchanged = (...files) => spawnSync('git', ['diff', '--quiet', 'HEAD', '--', ...files], { cwd: ROOT }).status === 0;

test('REQ-96-01/02/03: límite 3 en portada, 3 explícito en el footer y corte sin mutar', async () => {
  has(read('src/domain/latest-posts.ts'), ['export const LATEST_POSTS_LIMIT = 3;', 'export const FOOTER_LATEST_POSTS_LIMIT = 3;'], 'latest-posts.ts');
  has(read('src/components/site-footer/site-footer.astro'), ['latestPosts(await new PostsRepository().getPosts(), FOOTER_LATEST_POSTS_LIMIT)'], 'footer');
  const { latestPosts } = await import(url('src/domain/latest-posts.ts').href);
  for (const n of [3, 4, 8, 20]) { const posts = fake(n), snap = structuredClone(posts); assert.deepEqual(latestPosts(posts).map((p) => p.id), ['p-0', 'p-1', 'p-2'], `con ${n}`); assert.deepEqual(posts, snap); }
  for (const n of [0, 1, 2]) assert.equal(latestPosts(fake(n)).length, n, `con ${n}`);
});
test('REQ-96-04/05: build real con 3 cards (transition:name) y footer con 3', () => {
  const build = astroBuild(); assert.equal(build.status, 0, `astro build falló:\n${build.stdout}\n${build.stderr}`);
  const html = read('dist/client/index.html'); const section = cut(html, '<section class="latest-articles"', '</section>');
  assert.deepEqual([...section.matchAll(/href="(\/posts\/[^"]+)"/g)].map((m) => m[1]), ['05-diseno-arquitectonico-vs-diseno-detallado', '04-ciclo-de-vida-y-arquitectura', '01-procesos-memoria'].map((s) => `/posts/${s}`));
  assert.equal((section.match(/class="latest-articles__card"/g) ?? []).length, 3); assert.equal((section.match(/data-astro-transition-scope=/g) ?? []).length, 6);
  assert.equal((cut(html, '<footer class="site-footer"', '</footer>').match(/\bsite-footer__post\b/g) ?? []).length, 3);
});
test('REQ-96-08..12: valores congelados y offsetPercent', async () => {
  for (const w of ['gsap', 'window', 'document']) assert.ok(!read(DOMAIN).includes(w), w);
  const m = await import(url(DOMAIN).href);
  const want = { CARDS_ENTER: { offsetPx: 72, scale: 0.96, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 },
    CARDS_EXIT: { offsetPx: 60, opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.08 }, CARDS_STACKED: { start: 'top 85%', end: 'bottom 20%' },
    CARDS_HORIZONTAL: { arrive: 'top 75%', leave: 'bottom 40%', crossStart: 'left 85%', crossEnd: 'right 15%' } };
  for (const [k, v] of Object.entries(want)) { assert.ok(Object.isFrozen(m[k]), `${k} sin congelar`); assert.deepEqual({ ...m[k] }, v, k); }
  assert.equal(m.offsetPercent(72, 360), 20); assert.equal(m.offsetPercent(-60, 600), -10);
  for (const w of [0, NaN, -5, Infinity]) assert.ok(Object.is(m.offsetPercent(72, w), 0), `width ${w}`);
});
test('REQ-96-13..17/22/23: tweens por tiempo solo con xPercent, scale y opacity, en el contexto', () => {
  const src = code(MOTION);
  has(src, ["import { gsap } from 'gsap';", "from 'gsap/ScrollTrigger'", "from '../../domain/latest-cards-motion.ts'"], 'cards-motion.ts');
  assert.doesNotMatch(src, /\b(x|y|autoAlpha|visibility|left|width|filter)\s*:|scrub|autoAlpha|\b(back|elastic|bounce)\.|ease: '/);
  assert.match(src, /offsetPercent\([^)]*offsetWidth\)/);
  const set = src.indexOf('gsap.set('); assert.ok(set >= 0, 'falta gsap.set del estado de partida'); for (const s of ['ScrollTrigger.batch(', 'ScrollTrigger.create(']) assert.ok(src.indexOf(s) > set, `${s} antes de gsap.set`);
  const tweens = (src.match(/gsap\.(to|fromTo)\(/g) ?? []).length; assert.ok(tweens >= 3); assert.doesNotMatch(src, /overwrite\s*:/, 'sin overwrite: true ni auto (REQ-96-22, revisión 3)');
  assert.equal((src.match(/ctx\.add\(\(\) => \(gsap\.killTweensOf\([^,()]+, 'xPercent,scale,opacity'\), gsap\.(to|fromTo)\(/g) ?? []).length, tweens, 'cada tween en el contexto y precedido de killTweensOf por propiedades'); assert.doesNotMatch(cut(src, 'const keep', 'const stopFocus'), /'x'|\bx\b/, 'keep/restore no reponen x');
  for (const f of srcFiles().filter((f) => f.endsWith('.ts') && f !== MOTION && f !== HZ)) assert.doesNotMatch(read(f), /from ['"]gsap/, f);
});
test('REQ-96-18..21/24/36: cuatro callbacks, batch apilado y focusin', () => {
  const src = code(MOTION);
  has(cut(src, 'const enter', ';\n'), ['gsap.fromTo(', 'xPercent: pct(side * CARDS_ENTER.offsetPx)', 'scale: CARDS_ENTER.scale', 'opacity: CARDS_ENTER.opacity', 'xPercent: 0, scale: 1, opacity: 1', 'CARDS_ENTER.duration', 'CARDS_ENTER.ease', 'CARDS_ENTER.stagger'], 'enter');
  has(cut(src, 'const exit', ';\n'), ['gsap.to(', 'xPercent: pct(side * CARDS_EXIT.offsetPx)', 'opacity: CARDS_EXIT.opacity', 'CARDS_EXIT.duration', 'CARDS_EXIT.ease', 'CARDS_EXIT.stagger'], 'exit');
  const want = { onEnter: 'enter 1', onLeave: 'exit -1', onEnterBack: 'enter -1', onLeaveBack: 'exit 1' };
  const calls = [...src.matchAll(/(onEnter|onLeave|onEnterBack|onLeaveBack): [^,]*?=> (enter|exit)\([^,]+, (-?1)\)/g)];
  for (const [, cb, fn, side] of calls) assert.equal(`${fn} ${side}`, want[cb], cb);
  assert.deepEqual([...new Set(calls.map((c) => c[1]))].sort(), Object.keys(want).sort());
  has(cut(src, 'ScrollTrigger.batch(cards', '})'), ['start: CARDS_STACKED.start', 'end: CARDS_STACKED.end', ...Object.keys(want).map((k) => `${k}:`)], 'batch');
  assert.match(src, /addEventListener\('focusin'/); assert.match(src, /gsap\.to\([^,]+, \{ xPercent: 0, scale: 1, opacity: 1, duration: CARDS_ENTER\.duration, ease: CARDS_ENTER\.ease/);
});
test('REQ-96-25..28/30 (H-integrado): llegada, salida, cruce con containerAnimation y timeline intacta', () => {
  assert.match(read('progress/impl_latest-cards-gsap-motion.md'), /\*\*H-integrado\.\*\*/);
  const st = code(MOTION).split('ScrollTrigger.create(').slice(1).map((s) => s.slice(0, s.indexOf('})')));
  const some = (list, what) => assert.ok(st.some((b) => list.every((x) => b.includes(x))), `falta ${what}`);
  some(['trigger: wrapper', 'start: CARDS_HORIZONTAL.arrive', 'onEnter:', 'onLeaveBack:'], 'la llegada');
  some(['trigger: wrapper', 'start: leave', 'end: leave', 'onLeave:', 'onEnterBack:'], 'la salida'); assert.ok(code(MOTION).includes('const leave = `clamp(${CARDS_HORIZONTAL.leave})`;'), 'leave con clamp (alcanzable al fondo)');
  some(['containerAnimation: timeline', 'start: CARDS_HORIZONTAL.crossStart', 'end: CARDS_HORIZONTAL.crossEnd'], 'el cruce'); has(code(MOTION), ["addEventListener('refreshInit', keep)", "addEventListener('refresh', onRefresh)", "removeEventListener('refreshInit', keep)", "removeEventListener('refresh', onRefresh)", 'const onRefresh = (): void => { restore(); sync(); };'], 'xPercent/scale de las extremas tras el refresh (revisión 4: sync tras restore, REQ-96-51 en latest-cards-scroll-restore.test.mjs)');
  const hz = code(HZ);
  for (const s of ['gsap.fromTo(track', 'entranceState', 'latest-entrance']) assert.ok(!hz.includes(s), s);
  has(hz, ["getBoundingClientRect().width / (Number(gsap.getProperty(cards[0], 'scale')) || 1)", 'trackOffset', 'edgeOffsets(0,', 'edgeOffsets(1,'], 'latest-horizontal.ts');
  assert.equal(hz.split("start: 'top top'").length - 1, 1);
});
test('REQ-96-31/32/34: dos consultas en un gsap.matchMedia, limpieza y reduced-motion sin ajuste', () => {
  const hz = code(HZ);
  has(hz, ["'(min-width: 1201px) and (prefers-reduced-motion: no-preference)'", "'(max-width: 1200px) and (prefers-reduced-motion: no-preference)'"], 'consultas');
  assert.equal(hz.split('gsap.matchMedia()').length - 1, 1); assert.match(hz, /mm\.add\(DESKTOP, \(ctx\)/); assert.match(hz, /^\s*mm\.add\(STACKED, \(ctx\)/m);
  const guard = hz.indexOf('length < 3) return'); assert.ok(guard < 0 || hz.indexOf('mm.add(STACKED') < guard, 'el apilado debe registrarse con cualquier n >= 1');
  has(cut(hz, 'export function destroy', 'export function init'), ['mm?.revert()', 'clearTrack('], 'destroy');
  assert.ok(unchanged('tests/reduced-motion.test.mjs'), 'reduced-motion.test.mjs modificado');
});
test('REQ-96-35/37/38: hoja mínima sin estado oculto y un solo sistema', () => {
  assert.equal(code(CSS).replace(/\s+/g, ' ').trim(), '.home__landing { overflow-x: clip; }');
  for (const f of srcFiles().filter((f) => f.endsWith('.css'))) for (const [, sel, body] of code(f).matchAll(/([^{}]+)\{([^{}]*)\}/g)) { if (sel.includes('latest-articles__card') && !/:hover|:focus/.test(sel)) assert.doesNotMatch(body, /opacity:\s*0\s*;|transform:/, `${f} ${sel.trim()}`); }
  for (const gone of ['src/styles/latest-cards-slide.css', 'src/domain/latest-entrance.ts']) assert.ok(!existsSync(url(gone)), gone);
  for (const f of srcFiles()) assert.doesNotMatch(read(f), /latest-cards-slide|latest-entrance/, f);
  has(read(ASTRO), ["import '../../styles/latest-horizontal.css';", "import '../../styles/latest-cards-motion.css';"], 'latest-horizontal.astro'); assert.equal((read(ASTRO).match(/<script>/g) ?? []).length, 1);
});
test('REQ-96-39/40/42: congelados, notas de ajuste y archivos <= 100 líneas', () => {
  assert.ok(unchanged('src/styles/latest-articles.css', 'src/styles/latest-horizontal.css', 'src/components/latest-articles.astro', 'src/domain/latest-horizontal.ts', 'src/styles/tokens.css'), 'congelados modificados');
  const adjusted = ['home-latest-articles-five', 'home-latest-articles-limit', 'latest-horizontal-compact-sticky', 'search-index-lazy-load', 'gsap-dependency-approval', 'latest-cards-entrance', 'latest-cards-full-bleed'];
  for (const t of adjusted) assert.ok(read(`tests/${t}.test.mjs`).includes('Ajuste feature 96 (precedente REQ-43-06)'), t);
  for (const rel of [DOMAIN, MOTION, HZ, CSS, ASTRO, 'src/components/latest-horizontal/track-dom.ts', 'src/domain/latest-posts.ts', 'tests/latest-cards-gsap-motion.test.mjs']) assert.ok(lines(read(rel)) <= 100, rel);
});
