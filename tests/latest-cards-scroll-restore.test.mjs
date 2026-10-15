// Feature 96, revisión 4 (REQ-96-51): con el scroll restaurado (recarga o history.back), cada card queda
// en el estado de sus triggers (progress) tras crearlos y en cada refresh, sin hide() incondicional.
// La medida en navegador (REQ-96-52) va con Chrome headless + CDP en progress/impl_latest-cards-gsap-motion.md.
// Los triggers con containerAnimation solo se actualizan desde el onUpdate de la timeline; al restaurar el
// scroll la timeline se recoloca sin eventos y su progress queda en 0: sync fuerza update(false, false, true)
// (lanza los callbacks reales) y decide con progress; isActive, tras un refresh, no es coherente (medido).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const url = (rel) => new URL(`../${rel}`, import.meta.url);
const code = (rel) => readFileSync(url(rel), 'utf8').replace(/\r/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const DOMAIN = 'src/domain/latest-cards-motion.ts', MOTION = 'src/components/latest-horizontal/cards-motion.ts';
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
  const src = code(MOTION);
  const hm = cut(src, 'export function horizontalCardsMotion', '\n}\n');
  assert.ok(!hm.includes('hide('), 'sin hide() incondicional en el modo horizontal');
  assert.match(src, /cardPhase\(/, 'la fase sale de cardPhase (progress)');
  assert.match(src, /gsap\.killTweensOf\([^,()]+, 'xPercent,scale,opacity'\), gsap\.set\([^,()]+, phaseState\(/, 'killTweensOf por propiedades antes de fijar la fase');
  const body = cut(hm, 'const sync', '\n  sync();'); assert.ok(body.indexOf('.update(false, false, true)') >= 0 && body.indexOf('.update(false, false, true)') < body.indexOf('cardPhase('), 'sync fuerza update de los triggers antes de leer progress');
  const sync = hm.indexOf('sync();'); assert.ok(sync > hm.lastIndexOf('cross(card'), 'sync tras crear los triggers');
  const onRefresh = cut(hm, 'const onRefresh', ';\n'); assert.ok(onRefresh.indexOf('restore()') < onRefresh.indexOf('sync()') && onRefresh.indexOf('restore()') >= 0, 'en refresh, sync después de restore');
  for (const s of ["addEventListener('refresh', onRefresh)", "removeEventListener('refresh', onRefresh)"]) assert.ok(hm.includes(s), s);
  assert.doesNotMatch(src, /\bx\s*:|'x'/, 'x nunca se toca');
  assert.ok(code(MOTION).includes('ScrollTrigger.batch(cards'), 'el apilado sigue con batch');
});
