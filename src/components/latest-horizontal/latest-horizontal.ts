// Scroll horizontal de las cards de últimos artículos (features 72 y 73). Solo en escritorio
// (>=1201 px) y sin reduced motion: se ve un par de cards; la sección queda fija con
// position: sticky dentro de un envoltorio y el scroll vertical desplaza el track en X (1:1)
// hasta que se ven las dos últimas. Sin JS o fuera de la consulta queda el layout apilado.
// Feature 73: sin el pin de ScrollTrigger (cambiaba a fixed un frame tarde con rueda real y el
// encabezado saltaba); ScrollTrigger solo hace el scrub de x. Cifras de src/domain (feature 71/73).
// Feature 96: la entrada y la salida laterales de las cards (cards-motion.ts) se registran en el
// mismo gsap.matchMedia, en el horizontal y en el apilado (<=1200 px); sustituyen a la 75.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { edgeOffsets, focusScrollTarget, pairInset, pinScrollLength, trackOffset } from '../../domain/latest-horizontal.ts';
import { horizontalCardsMotion, stackedCardsMotion } from './cards-motion.ts';
import { clearTrack, refreshWhenShown, restoreScroll } from './track-dom.ts';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = '(min-width: 1201px) and (prefers-reduced-motion: no-preference)';
const STACKED = '(max-width: 1200px) and (prefers-reduced-motion: no-preference)';
const HORIZONTAL = 'latest-articles--horizontal';
let mm: gsap.MatchMedia | null = null;

/** Revierte el efecto: desenvuelve la sección y quita estilos, clase y listeners. */
export function destroy(): void {
  mm?.revert();
  mm = null;
  const track = document.querySelector<HTMLElement>('.latest-articles__list');
  if (track) clearTrack(track);
}

/** Inicializa el efecto de forma idempotente. */
export function init(): void {
  destroy();
  const section = document.querySelector<HTMLElement>('.latest-articles');
  const track = section?.querySelector<HTMLElement>('.latest-articles__list');
  if (!section || !track) return;
  const cards = [...track.querySelectorAll<HTMLElement>('.latest-articles__card')];
  if (!cards.length) return;
  mm = gsap.matchMedia();
  mm.add(STACKED, (ctx) => {
    const stopCards = stackedCardsMotion(cards, ctx);
    const stopRefresh = refreshWhenShown(section, () => ScrollTrigger.refresh());
    return () => { stopCards(); stopRefresh(); };
  });
  if (cards.length < 3) return; // REQ-73-19/26: con 2 cards el par ya lo muestra todo
  mm.add(DESKTOP, (ctx) => setup(section, track, cards, ctx));
}

function setup(section: HTMLElement, track: HTMLElement, cards: HTMLElement[], ctx: gsap.Context): () => void {
  const n = cards.length;
  const wrapper = document.createElement('div');
  wrapper.className = 'latest-articles--horizontal-pin';
  section.before(wrapper);
  wrapper.append(section);
  section.classList.add(HORIZONTAL);
  // Feature 96: la card puede estar escalada por su entrada; el ancho real es el medido / su escala.
  const cardWidth = (): number => cards[0].getBoundingClientRect().width / (Number(gsap.getProperty(cards[0], 'scale')) || 1);
  const gap = (): number => parseFloat(getComputedStyle(track).columnGap) || 0;
  const length = (): number => pinScrollLength(cardWidth(), gap(), n);
  // REQ-73-20: el envoltorio mide sección + recorrido; se fija antes de que ScrollTrigger mida.
  const sizeWrapper = (): void => { wrapper.style.height = `${section.offsetHeight + length()}px`; };
  sizeWrapper();
  ScrollTrigger.addEventListener('refreshInit', sizeWrapper);
  // Feature 76: misma línea de tiempo (mismo ScrollTrigger y scrub) para el track y la x propia de
  // la primera y la última card: las cards cruzan los bordes de la ventana y en reposo no asoman.
  const inset = (): number => pairInset(section.clientWidth, cardWidth(), gap());
  const tween = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: wrapper, start: 'top top', end: () => `+=${pinScrollLength(cardWidth(), gap(), n)}`, scrub: true, invalidateOnRefresh: true },
  });
  tween.to(track, { x: () => trackOffset(1, cardWidth(), gap(), n), ease: 'none' }, 0);
  for (const i of [0, n - 1]) tween.fromTo(cards[i], { x: () => edgeOffsets(0, n, inset(), gap())[i] }, { x: () => edgeOffsets(1, n, inset(), gap())[i] }, 0);
  // Feature 96: entrada y salida laterales por tiempo (llegada, cruce del borde y salida).
  const stopCards = horizontalCardsMotion(wrapper, cards, tween, ctx);
  const trigger = tween.scrollTrigger;
  const onFocus = (event: FocusEvent): void => {
    const index = cards.findIndex((card) => card.contains(event.target as Node));
    if (index >= 0 && trigger) window.scrollTo({ top: focusScrollTarget(index, n, trigger.start, trigger.end), behavior: 'instant' });
  };
  track.addEventListener('focusin', onFocus);
  const stopRefresh = refreshWhenShown(wrapper, () => ScrollTrigger.refresh());
  ScrollTrigger.refresh();
  restoreScroll();
  return () => {
    ScrollTrigger.removeEventListener('refreshInit', sizeWrapper);
    track.removeEventListener('focusin', onFocus);
    stopCards();
    stopRefresh();
    wrapper.replaceWith(section); // REQ-73-25: la sección vuelve a su sitio
    queueMicrotask(() => clearTrack(track)); // REQ-75-20: tras revertir los tweens de x y de las cards
    section.classList.remove(HORIZONTAL);
  };
}
