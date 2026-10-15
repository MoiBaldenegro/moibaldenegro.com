// Feature 96, revisión 4 (REQ-96-51): con el scroll restaurado (recarga o history.back), cada card queda
// en el estado de sus triggers (progress) tras crearlos y en cada refresh, sin hide() incondicional.
// La medida en navegador (REQ-96-52) va con Chrome headless + CDP en progress/impl_latest-cards-gsap-motion.md.
// Los triggers con containerAnimation solo se actualizan desde el onUpdate de la timeline; al restaurar el
// scroll la timeline se recoloca sin eventos y su progress queda en 0: sync (cards-sync.ts) fuerza
// update(false, false, true) con los callbacks en silencio y decide con progress (isActive, tras un refresh,
// no es coherente; medido con CDP). killTweensOf por propiedades sobre un fromTo aún sin inicializar lo deja
// sin _initted y reaplicando su startAt en cada frame (gsap-core _initTween): stop() mata antes, enteros
// y solo para esas cards, los tweens propios (los que animan opacity; la x de la 76 no).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const url = (rel) => new URL(`../${rel}`, import.meta.url);
const code = (rel) => readFileSync(url(rel), 'utf8').replace(/\r/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const DOMAIN = 'src/domain/latest-cards-motion.ts', MOTION = 'src/components/latest-horizontal/cards-motion.ts', SYNC = 'src/components/latest-horizontal/cards-sync.ts';
const cut = (s, open, close) => { const at = s.indexOf(open); assert.notEqual(at, -1, `falta ${open}`); return s.slice(at, s.indexOf(close, at)); };
const st = (progress, isActive = progress > 0 && progress < 1) => ({ progress, isActive });

test('REQ-96-51: cardPhase decide la fase con progress de los triggers de entrada y salida', async () => {
  const { cardPhase } = await import(url(DOMAIN).href);
  assert.equal(cardPhase([st(0)], [st(0)]), 'before', 'entrada sin alcanzar');
  assert.equal(cardPhase([st(0, true)], [st(0)]), 'before', 'isActive incoherente tras refresh: manda progress');
  assert.equal(cardPhase([st(0.4)], [st(0)]), 'rest', 'entrada activa');
  assert.equal(cardPhase([st(1)], [st(0)]), 'rest', 'entrada superada, salida sin alcanzar');
  assert.equal(cardPhase([st(1)], [st(0.5)]), 'rest', 'salida activa: aún no ha salido');
  assert.equal(cardPhase([st(1)], [st(1, true)]), 'gone', 'isActive incoherente tras refresh: manda progress');
  assert.equal(cardPhase([st(0.3, false)], [st(0)]), 'rest');
  assert.equal(cardPhase([st(1)], [st(1)]), 'gone', 'salida superada');
  assert.equal(cardPhase([st(0)], [st(1)]), 'before', 'sin entrar manda la entrada');
  assert.equal(cardPhase([], []), 'rest');
});

test('REQ-96-51: phaseState da el estado de hide(), el reposo y el de la salida izquierda', async () => {
  const { phaseState, CARDS_ENTER, CARDS_EXIT } = await import(url(DOMAIN).href);
  assert.deepEqual(phaseState('before', 360), { xPercent: 20, scale: CARDS_ENTER.scale, opacity: CARDS_ENTER.opacity });
  assert.deepEqual(phaseState('rest', 360), { xPercent: 0, scale: 1, opacity: 1 });
  assert.deepEqual(phaseState('gone', 600), { xPercent: -10, scale: 1, opacity: CARDS_EXIT.opacity });
  assert.ok(Object.is(phaseState('before', 0).xPercent, 0));
  for (const w of ['gsap', 'window', 'document']) assert.ok(!code(DOMAIN).includes(w), w);
});

test('REQ-96-51: el modo horizontal sincroniza tras crear los triggers y en cada refresh, sin hide() incondicional', () => {
  const src = code(MOTION), sync = code(SYNC);
  const hm = cut(src, 'export function horizontalCardsMotion', '\n}\n');
  assert.ok(!hm.includes('hide('), 'sin hide() incondicional en el modo horizontal');
  assert.ok(src.includes("from './cards-sync.ts'"), 'cards-motion.ts usa el módulo hermano');
  assert.ok(hm.includes('sync = phaseSync(cards, enters, exits, phases, silently);'), 'sync con los triggers de entrada y salida de cada card');
  assert.ok(hm.indexOf('\n  sync();') > hm.lastIndexOf('cross(card'), 'sync tras crear los triggers');
  const onRefresh = cut(hm, 'const onRefresh', ';\n');
  assert.ok(onRefresh.indexOf('restore()') >= 0 && onRefresh.indexOf('restore()') < onRefresh.indexOf('sync()'), 'en refresh, sync después de restore');
  for (const s of ["addEventListener('refresh', onRefresh)", "removeEventListener('refresh', onRefresh)"]) assert.ok(hm.includes(s), s);
  const body = cut(sync, 'export function phaseSync', '\n}\n');
  const upd = body.indexOf('silently(() => triggers.forEach((t) => t.update(false, false, true)))');
  assert.ok(upd >= 0 && upd < body.indexOf('cardPhase(enters[i], exits[i])'), 'update forzado en silencio antes de leer progress');
  assert.ok(sync.includes("gsap.killTweensOf(stop([el]), 'xPercent,scale,opacity'); gsap.set(el, phaseState(phase, el.offsetWidth));"), 'place: stop + killTweensOf por propiedades + estado de la fase');
  assert.match(cut(src, 'function tweens', '\n}\n'), /const silently = /, 'tweens expone silently');
  for (const f of [src, sync]) assert.doesNotMatch(f, /\bx\s*:|'x'|overwrite/, 'x nunca se toca y sin overwrite');
});

test('REQ-96-22/51: stop() mata enteros solo los tweens propios (con opacity) de esas cards, antes de cada killTweensOf', () => {
  const src = code(MOTION), sync = code(SYNC);
  assert.ok(sync.includes("export const stop = (els: Element[]): Element[] => (gsap.getTweensOf(els).forEach((t) => 'opacity' in t.vars && t.kill(els)), els);"), 'stop');
  const kills = [...src.matchAll(/gsap\.killTweensOf\(([^']+), 'xPercent,scale,opacity'\)/g)].map((m) => m[1]);
  assert.ok(kills.length >= 3, 'enter, exit y focusin');
  for (const k of kills) assert.match(k, /^stop\(\[?\w+\]?\)$/, k);
});

test('REQ-96-51: tras una ráfaga de callbacks (salto de scroll) se resincroniza una vez, en un microtask', () => {
  const src = code(MOTION), sync = code(SYNC), hm = cut(src, 'export function horizontalCardsMotion', '\n}\n');
  assert.ok(sync.includes('export const coalesce = (fn: () => void): (() => void) => {') && /queueMicrotask\(/.test(cut(sync, 'export const coalesce', '\n};\n')), 'coalesce con queueMicrotask');
  assert.ok(hm.includes('tweens(ctx, phases, coalesce(() => sync()))'), 'cada callback del modo horizontal pide una resincronización');
  assert.match(cut(src, 'function tweens', '\n}\n'), /const mark = [^\n]*!muted && \(els\.forEach\(\(el\) => phases\.set\(el, phase\)\), after\(\), true\)/, 'mark avisa salvo en silencio (sin bucle)');
});

test('REQ-96-52: la salida termina siempre en scale 1 (un salto puede cortar la entrada a 0.96)', () => {
  assert.match(cut(code(MOTION), 'const exit', ';\n'), /\{ xPercent: pct\(side \* CARDS_EXIT\.offsetPx\), scale: 1, opacity: CARDS_EXIT\.opacity,/);
});
