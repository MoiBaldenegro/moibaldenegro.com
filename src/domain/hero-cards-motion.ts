// Entrada y salida tipo lego de las cards del hero (feature 115). Constantes congeladas y funciones
// puras, sin GSAP ni acceso al DOM: el runtime (src/components/new-hero/hero-cards-lego.ts) y los
// tests usan los mismos números. Valores por defecto revisables por el humano (design.md).

/** Entrada: cae desde -32 px, girada al azar en [-3, 3] deg y a escala 1.04, y encaja con rebote corto.
 *  Retardo de cada pieza: su posición aleatoria x min(step, maxDelay / (n - 1)). */
export const LEGO_ENTER = Object.freeze({ y: -32, scale: 1.04, opacity: 0, tiltDeg: 3, duration: 0.6, ease: 'back.out(1.7)', step: 0.05, maxDelay: 0.6 });

/** Salida por arriba o por abajo: la pieza se levanta y se desvanece. */
export const LEGO_EXIT = Object.freeze({ y: -24, scale: 1.04, opacity: 0, duration: 0.35, ease: 'power2.in' });

/** Rango de entrada de cada card; las que entran en el mismo intervalo (batchMs) forman un lote. edge es
 *  el margen (fracción del viewport) que dejan start y end: 'top 92%' y 'bottom 8%'. La salida usa su
 *  propio rango (exitStart/exitEnd = start/end ampliados en edge): solo se levanta al dejar de intersectar. */
export const LEGO_RANGE = Object.freeze({ start: 'top 92%', end: 'bottom 8%', exitStart: 'top bottom', exitEnd: 'bottom top', batchMs: 100, edge: 0.08 });

/** Custom properties que anima GSAP; src/styles/hero-cards-motion.css las compone en translate/rotate/scale. */
export const LEGO_VARS = Object.freeze({ y: '--hero-lego-y', rotate: '--hero-lego-rotate', scale: '--hero-lego-scale' });

/** Consultas del gsap.matchMedia: en <= 768 px solo las cards con data-show-on-mobile (feature 106). */
export const LEGO_MEDIA = Object.freeze({
  mobile: '(max-width: 768px) and (prefers-reduced-motion: no-preference)',
  wide: '(min-width: 769px) and (prefers-reduced-motion: no-preference)',
});

/** Generador pseudoaleatorio en [0, 1). */
export type Rng = () => number;

/** mulberry32: misma semilla, misma secuencia. */
export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Permutación de 0..count-1 por Fisher-Yates: order[posición] = índice de la card. */
export function legoOrder(count: number, rng: Rng): number[] {
  const order = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

/** Retardo por card (indexado por card): su posición en `order` x min(step, max / (n - 1)), nunca > max. */
export function legoDelays(order: readonly number[], step: number, max: number): number[] {
  const each = order.length > 1 ? Math.min(step, max / (order.length - 1)) : 0;
  const delays = new Array<number>(order.length).fill(0);
  order.forEach((card, pos) => { delays[card] = Math.min(max, pos * each); });
  return delays;
}

/** Giro inicial en grados dentro de [-maxDeg, maxDeg]. */
export function legoTilt(rng: Rng, maxDeg: number): number {
  return (rng() * 2 - 1) * maxDeg;
}

/** Fase de una card según el progress de su trigger: sin entrar, en reposo o ya salida por arriba. */
export type LegoPhase = 'before' | 'rest' | 'gone';

export function legoPhase(progress: number): LegoPhase {
  if (!(progress > 0)) return 'before';
  return progress >= 1 ? 'gone' : 'rest';
}

/** start, end (px de scroll) y progress de un ScrollTrigger. */
export interface LegoTrigger { readonly start: number; readonly end: number; readonly progress: number }

/** Fase con el scroll actual (REQ-115-16): en reposo toda card que intersecta el viewport, aunque solo
 *  asome en el margen edge del rango; si no, la del progress de su trigger. */
export function legoPhaseAt(t: LegoTrigger, scroll: number, viewport: number): LegoPhase {
  const edge = LEGO_RANGE.edge * viewport;
  return scroll > t.start - edge && scroll < t.end + edge ? 'rest' : legoPhase(t.progress);
}

type LegoState = Record<string, string | number>;
const state = (y: number, rotate: number, scale: number, opacity: number): LegoState => ({
  [LEGO_VARS.y]: `${y}px`, [LEGO_VARS.rotate]: `${rotate}deg`, [LEGO_VARS.scale]: `${scale}`, opacity,
});

/** Estado de partida de la entrada con el giro `tilt`. */
export const legoFrom = (tilt: number): LegoState => state(LEGO_ENTER.y, tilt, LEGO_ENTER.scale, LEGO_ENTER.opacity);

/** Reposo: la pieza encajada. */
export const legoRest = (): LegoState => state(0, 0, 1, 1);

/** Pieza levantada (fuera del viewport o aún sin entrar). */
export const legoLifted = (): LegoState => state(LEGO_EXIT.y, 0, LEGO_EXIT.scale, LEGO_EXIT.opacity);
