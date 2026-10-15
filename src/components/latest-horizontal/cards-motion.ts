// Entrada y salida laterales de las cards de «Últimos artículos» (feature 96): ScrollTrigger.batch /
// callbacks que lanzan tweens POR TIEMPO. Al bajar, la card entra por la derecha y sale por la izquierda.
// - xPercent (no x: la x en línea es del track y de las cards extremas, 73/76), equivalente a 72 / 60 px.
// - opacity y no autoAlpha (visibility: hidden sacaría las cards del tabulador); focusin las muestra.
// - Las consultas de media viven en latest-horizontal.ts; cada tween va con ctx.add de su
//   gsap.matchMedia, así que mm.revert() (astro:before-swap) lo mata y revierte aunque esté en curso.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CARDS_ENTER, CARDS_EXIT, CARDS_HORIZONTAL, CARDS_STACKED, cardPhase, offsetPercent, phaseState, type CardPhase } from '../../domain/latest-cards-motion.ts';

type Side = 1 | -1;
type Phases = Map<Element, CardPhase>;

// clamp(): al fondo de la página el punto de salida puede caer en el scroll máximo o pasarlo;
// clamp lo limita a él y el rango de 0 px se alcanza (onLeave al bajar, onEnterBack al subir).
const leave = `clamp(${CARDS_HORIZONTAL.leave})`;
/** xPercent por card equivalente a `px` píxeles (offsetWidth no incluye la escala). */
const pct = (px: number) => (_index: number, el: HTMLElement): number => offsetPercent(px, el.offsetWidth);
/** Estado de partida en línea (solo desde JS: sin JS las cards quedan completas y quietas). */
const hide = (cards: HTMLElement[]): gsap.core.Tween => gsap.set(cards, { xPercent: pct(CARDS_ENTER.offsetPx), scale: CARDS_ENTER.scale, opacity: CARDS_ENTER.opacity });

/** Tweens de entrada y salida; side 1 = lateral derecho, −1 = izquierdo. killTweensOf solo por
 *  xPercent/scale/opacity: overwrite true mataría también el fromTo de x de la 76 (REQ-96-22). */
function tweens(ctx: gsap.Context, phases: Phases = new Map()) {
  const mark = (els: Element[], phase: CardPhase): void => els.forEach((el) => phases.set(el, phase));
  const enter = (els: Element[], side: Side) => (mark(els, 'rest'), ctx.add(() => (gsap.killTweensOf(els, 'xPercent,scale,opacity'), gsap.fromTo(els,
    { xPercent: pct(side * CARDS_ENTER.offsetPx), scale: CARDS_ENTER.scale, opacity: CARDS_ENTER.opacity },
    { xPercent: 0, scale: 1, opacity: 1, duration: CARDS_ENTER.duration, ease: CARDS_ENTER.ease, stagger: CARDS_ENTER.stagger }))));
  const exit = (els: Element[], side: Side) => (mark(els, side > 0 ? 'before' : 'gone'), ctx.add(() => (gsap.killTweensOf(els, 'xPercent,scale,opacity'), gsap.to(els,
    { xPercent: pct(side * CARDS_EXIT.offsetPx), opacity: CARDS_EXIT.opacity, duration: CARDS_EXIT.duration, ease: CARDS_EXIT.ease, stagger: CARDS_EXIT.stagger }))));
  return { enter, exit };
}

/** Con teclado, la card enfocada que aún no ha entrado se muestra (REQ-96-36). */
function revealOnFocus(cards: HTMLElement[], ctx: gsap.Context): () => void {
  const parent = cards[0]?.parentElement;
  const onFocus = (event: FocusEvent): void => {
    const card = cards.find((item) => item.contains(event.target as Node));
    if (!card || Number(gsap.getProperty(card, 'opacity')) >= 1) return;
    ctx.add(() => (gsap.killTweensOf(card, 'xPercent,scale,opacity'), gsap.to(card, { xPercent: 0, scale: 1, opacity: 1, duration: CARDS_ENTER.duration, ease: CARDS_ENTER.ease })));
  };
  parent?.addEventListener('focusin', onFocus);
  return () => parent?.removeEventListener('focusin', onFocus);
}

/** Modo apilado (<=1200 px): un batch sobre las cards con los cuatro callbacks. */
export function stackedCardsMotion(cards: HTMLElement[], ctx: gsap.Context): () => void {
  const { enter, exit } = tweens(ctx);
  hide(cards);
  ScrollTrigger.batch(cards, {
    start: CARDS_STACKED.start, end: CARDS_STACKED.end,
    onEnter: (batch) => enter(batch, 1), onLeave: (batch) => exit(batch, -1),
    onEnterBack: (batch) => enter(batch, -1), onLeaveBack: (batch) => exit(batch, 1),
  });
  return revealOnFocus(cards, ctx);
}

/** Estado de la card en su fase, sin animar (REQ-96-51); x (73/76) no se toca. */
const place = (el: HTMLElement, phase: CardPhase): void => (gsap.killTweensOf(el, 'xPercent,scale,opacity'), gsap.set(el, phaseState(phase, el.offsetWidth)), undefined);

/** Modo horizontal (>=1201 px): llega el par inicial, se va el final tras el tramo y las que cruzan el borde usan la timeline como containerAnimation. */
export function horizontalCardsMotion(wrapper: HTMLElement, cards: HTMLElement[], timeline: gsap.core.Timeline, ctx: gsap.Context): () => void {
  const phases: Phases = new Map();
  const { enter, exit } = tweens(ctx, phases);
  const n = cards.length;
  const [first, last] = [cards.slice(0, 2), cards.slice(n - 2)];
  const arrive = ScrollTrigger.create({ trigger: wrapper, start: CARDS_HORIZONTAL.arrive, onEnter: () => enter(first, 1), onLeaveBack: () => exit(first, 1) });
  const away = ScrollTrigger.create({ trigger: wrapper, start: leave, end: leave, onLeave: () => exit(last, -1), onEnterBack: () => enter(last, -1) });
  const cross = (card: HTMLElement, vars: ScrollTrigger.Vars): ScrollTrigger => ScrollTrigger.create({
    trigger: card, containerAnimation: timeline, start: CARDS_HORIZONTAL.crossStart, end: CARDS_HORIZONTAL.crossEnd, ...vars,
  });
  // Entran por la derecha las que no están en el par inicial; salen por la izquierda las que no están en el final.
  const enters = cards.map((card, i) => [i >= 2 ? cross(card, { onEnter: () => enter([card], 1), onLeaveBack: () => exit([card], 1) }) : arrive]);
  const exits = cards.map((card, i) => [i <= n - 3 ? cross(card, { onLeave: () => exit([card], -1), onEnterBack: () => enter([card], -1) }) : away]);
  // Con containerAnimation, un trigger solo se actualiza en el onUpdate de la timeline, que al restaurar el
  // scroll se recoloca sin eventos: al crear y en cada refresh se fuerza su update (lanza los callbacks) y
  // la card toma la fase de su progress, solo si difiere de la pedida (no corta un tween en curso).
  const triggers = [...new Set([...enters, ...exits].flat())];
  const sync = (): void => { triggers.forEach((t) => t.update(false, false, true)); cards.forEach((card, i) => {
    const phase = cardPhase(enters[i], exits[i]);
    if (phases.get(card) !== phase) (phases.set(card, phase), place(card, phase));
  }); };
  sync();
  // invalidateOnRefresh revierte la timeline en cada refresh y las extremas pierden xPercent y scale
  // (76): se guardan antes y se reponen al acabar; después se sincroniza la fase.
  const edges = [cards[0], cards[n - 1]];
  let saved: gsap.TweenVars[] = [];
  const keep = (): void => { saved = edges.map((el) => ({ xPercent: gsap.getProperty(el, 'xPercent'), scale: gsap.getProperty(el, 'scale') })); };
  const restore = (): void => edges.forEach((el, i) => saved[i] && gsap.set(el, saved[i]));
  const onRefresh = (): void => { restore(); sync(); };
  ScrollTrigger.addEventListener('refreshInit', keep);
  ScrollTrigger.addEventListener('refresh', onRefresh);
  const stopFocus = revealOnFocus(cards, ctx);
  return () => {
    ScrollTrigger.removeEventListener('refreshInit', keep);
    ScrollTrigger.removeEventListener('refresh', onRefresh);
    stopFocus();
  };
}
