// Entrada y salida tipo lego de un conjunto de cards del hero (feature 115). Un ScrollTrigger por card
// (rango de src/domain) marca la fase al instante; las entradas de un mismo intervalo forman un lote
// que se lanza en el orden de una permutación aleatoria (legoOrder) con retardos acotados (legoDelays).
// Solo se animan --hero-lego-* y opacity (hero-cards-motion.css las compone): el hover sigue intacto.
// Cada tween va con ctx.add de su gsap.matchMedia: mm.revert() (astro:before-swap) lo mata y lo revierte.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  LEGO_ENTER, LEGO_EXIT, LEGO_RANGE, legoDelays, legoFrom, legoLifted, legoOrder, legoPhaseAt, legoRest, legoTilt,
  type LegoPhase, type Rng,
} from '../../domain/hero-cards-motion.ts';

/** Registra la entrada y la salida de `cards` y devuelve la limpieza de listeners y temporizador. */
export function legoMotion(cards: HTMLElement[], ctx: gsap.Context, rng: Rng): () => void {
  if (!cards.length) return () => {};
  const phases = new Map<HTMLElement, LegoPhase>();
  let queue: HTMLElement[] = [];
  let timer = 0;
  let muted = true; // al crear y durante un refresh la fase la fija sync(), no los callbacks
  const forget = (card: HTMLElement, phase: LegoPhase): void => {
    phases.set(card, phase);
    queue = queue.filter((el) => el !== card);
    gsap.killTweensOf(card);
  };
  // Lote: cada pieza cae desde su giro aleatorio, en el orden de la permutación (no el del DOM).
  const flush = (): void => {
    window.clearTimeout(timer);
    timer = 0;
    const batch = queue;
    queue = [];
    const order = legoOrder(batch.length, rng);
    const delays = legoDelays(order, LEGO_ENTER.step, LEGO_ENTER.maxDelay);
    ctx.add(() => order.forEach((i) => {
      gsap.killTweensOf(batch[i]);
      gsap.fromTo(batch[i], legoFrom(legoTilt(rng, LEGO_ENTER.tiltDeg)), { ...legoRest(), duration: LEGO_ENTER.duration, ease: LEGO_ENTER.ease, delay: delays[i] });
    }));
  };
  const enter = (card: HTMLElement): void => {
    if (muted || phases.get(card) === 'rest') return;
    phases.set(card, 'rest');
    queue.push(card);
    if (!timer) timer = window.setTimeout(flush, LEGO_RANGE.batchMs);
  };
  const exit = (card: HTMLElement, phase: LegoPhase): void => {
    if (muted) return;
    forget(card, phase);
    ctx.add(() => gsap.to(card, { ...legoLifted(), duration: LEGO_EXIT.duration, ease: LEGO_EXIT.ease }));
  };
  // Estado de partida solo desde JS: sin JS (o fuera de la consulta) las cards quedan en reposo.
  gsap.set(cards, legoLifted());
  const triggers = cards.map((card) => ScrollTrigger.create({
    trigger: card, start: LEGO_RANGE.start, end: LEGO_RANGE.end,
    onEnter: () => enter(card), onEnterBack: () => enter(card),
    onLeave: () => exit(card, 'gone'), onLeaveBack: () => exit(card, 'before'),
  }));
  // Al crear y en cada refresh cada card toma la fase del scroll actual: en reposo si intersecta el
  // viewport. En lo alto de la página encajan con el lote; con el scroll restaurado (recarga o
  // history.back) se colocan sin animar, así quedan en reposo antes de 1.5 s (REQ-115-16).
  const sync = (): void => {
    muted = false;
    const animate = window.scrollY === 0;
    cards.forEach((card, i) => {
      const phase = legoPhaseAt(triggers[i], window.scrollY, window.innerHeight);
      if (phases.get(card) === phase) return;
      if (phase === 'rest' && animate) return enter(card);
      forget(card, phase);
      ctx.add(() => gsap.set(card, phase === 'rest' ? legoRest() : legoLifted()));
    });
    if (queue.length) flush(); // el lote del primer viewport encaja ya, sin esperar al intervalo
  };
  const mute = (): void => { muted = true; };
  sync();
  ScrollTrigger.addEventListener('refreshInit', mute);
  ScrollTrigger.addEventListener('refresh', sync);
  // Con teclado, la card enlazada enfocada que no está en reposo se encaja (REQ-115-17).
  const grid = cards[0].parentElement;
  const onFocus = (event: FocusEvent): void => {
    const card = cards.find((el) => el.contains(event.target as Node));
    if (!card || Number(gsap.getProperty(card, 'opacity')) >= 1) return;
    forget(card, 'rest');
    ctx.add(() => gsap.to(card, { ...legoRest(), duration: LEGO_ENTER.duration, ease: LEGO_ENTER.ease }));
  };
  grid?.addEventListener('focusin', onFocus);
  return () => {
    window.clearTimeout(timer);
    ScrollTrigger.removeEventListener('refreshInit', mute);
    ScrollTrigger.removeEventListener('refresh', sync);
    grid?.removeEventListener('focusin', onFocus);
  };
}
