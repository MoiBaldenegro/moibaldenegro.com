// Fase de las cards de «Últimos artículos» con el scroll restaurado (feature 96, REQ-96-51/52), separada de
// cards-motion.ts por el límite de 100 líneas (REQ-96-42). x (features 73/76) nunca se toca.
import { gsap } from 'gsap';
import type { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cardPhase, phaseState, type CardPhase } from '../../domain/latest-cards-motion.ts';

export type Phases = Map<Element, CardPhase>;

/** killTweensOf por propiedades no basta con un fromTo aún sin inicializar: si le quita todas, gsap no lo
 *  marca _initted y reaplica su startAt en cada frame (gsap-core, _initTween). Por eso los tweens propios
 *  (los que animan opacity; la x de la timeline de la 76 no) se matan enteros, solo para esas cards. */
export const stop = (els: Element[]): Element[] => (gsap.getTweensOf(els).forEach((t) => 'opacity' in t.vars && t.kill(els)), els);

/** Agrupa las llamadas de un mismo tick (p. ej. la ráfaga de callbacks de un salto de scroll) en una sola,
 *  en un microtask: se ejecuta cuando ScrollTrigger ya ha actualizado todos los triggers. */
export const coalesce = (fn: () => void): (() => void) => {
  let queued = false;
  return () => { if (!queued) { queued = true; queueMicrotask(() => { queued = false; fn(); }); } };
};

/** Estado de la card en su fase, sin animar. */
const place = (el: HTMLElement, phase: CardPhase): void => {
  gsap.killTweensOf(stop([el]), 'xPercent,scale,opacity'); gsap.set(el, phaseState(phase, el.offsetWidth));
};

/**
 * Con containerAnimation un trigger solo se actualiza en el onUpdate de la timeline, que al restaurar el
 * scroll (recarga o history.back) se recoloca sin eventos: su progress se queda en 0 y no lanza callbacks.
 * La función devuelta fuerza el update de todos los triggers con los callbacks en silencio y deja cada card
 * en la fase de su progress (isActive no se usa: tras un refresh no es coherente con progress), solo si
 * difiere de la última pedida por un callback, para no cortar un tween en curso hacia esa misma fase.
 */
export function phaseSync(cards: HTMLElement[], enters: ScrollTrigger[][], exits: ScrollTrigger[][], phases: Phases, silently: (fn: () => void) => void): () => void {
  const triggers = [...new Set([...enters, ...exits].flat())];
  return () => {
    silently(() => triggers.forEach((t) => t.update(false, false, true)));
    cards.forEach((card, i) => {
      const phase = cardPhase(enters[i], exits[i]);
      if (phases.get(card) !== phase) (phases.set(card, phase), place(card, phase));
    });
  };
}
