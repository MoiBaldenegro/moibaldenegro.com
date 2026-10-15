// Valores de la entrada y salida laterales de las cards de «Últimos artículos» (feature 96).
// Constantes congeladas y una función pura, sin GSAP ni acceso al DOM: el runtime
// (src/components/latest-horizontal/cards-motion.ts) y los tests usan los mismos números.
// Valores por defecto revisables por el humano (patrón clásico de GSAP: tweens por tiempo).

/** Entrada: desde 72 px de lado, scale 0.96 y opacity 0 hasta el reposo, con frenada. */
export const CARDS_ENTER = Object.freeze({ offsetPx: 72, scale: 0.96, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 });

/** Salida: 60 px hacia el lateral contrario y opacity 0, acelerando. */
export const CARDS_EXIT = Object.freeze({ offsetPx: 60, opacity: 0, duration: 0.5, ease: 'power2.in', stagger: 0.08 });

/** Rango de cada card en el modo apilado (<=1200 px). */
export const CARDS_STACKED = Object.freeze({ start: 'top 85%', end: 'bottom 20%' });

/** Modo horizontal: llegada y salida del envoltorio y cruce del borde durante el recorrido del track. */
export const CARDS_HORIZONTAL = Object.freeze({ arrive: 'top 75%', leave: 'bottom 40%', crossStart: 'left 85%', crossEnd: 'right 15%' });

/** Desplazamiento de `px` píxeles como xPercent de una card de ancho `width`; 0 si el ancho no es válido. */
export function offsetPercent(px: number, width: number): number {
  return Number.isFinite(width) && width > 0 ? (px * 100) / width : 0;
}

/** Fase de una card con el scroll actual (REQ-96-51): sin entrar, en reposo o ya salida por la izquierda. */
export type CardPhase = 'before' | 'rest' | 'gone';

/** Lo que se lee de un ScrollTrigger: progress (0 antes del start, 1 pasado el end). isActive no se usa:
 *  tras un refresh, en los triggers con containerAnimation no es coherente con progress (medido con CDP). */
export interface TriggerState { readonly progress: number }

/** 'before' si algún trigger de entrada no se ha alcanzado; 'gone' si algún trigger de salida se ha superado. */
export function cardPhase(enters: readonly TriggerState[], exits: readonly TriggerState[]): CardPhase {
  if (enters.some((t) => !(t.progress > 0))) return 'before';
  return exits.some((t) => t.progress >= 1) ? 'gone' : 'rest';
}

/** Estado en línea de cada fase para una card de ancho `width` (xPercent equivalente a los px). */
export function phaseState(phase: CardPhase, width: number): { xPercent: number; scale: number; opacity: number } {
  if (phase === 'before') return { xPercent: offsetPercent(CARDS_ENTER.offsetPx, width), scale: CARDS_ENTER.scale, opacity: CARDS_ENTER.opacity };
  if (phase === 'gone') return { xPercent: offsetPercent(-CARDS_EXIT.offsetPx, width), scale: 1, opacity: CARDS_EXIT.opacity };
  return { xPercent: 0, scale: 1, opacity: 1 };
}
