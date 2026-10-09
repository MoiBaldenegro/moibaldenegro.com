// Scroll horizontal de las cards de últimos artículos (features 72 y 73). Solo en escritorio
// (>=1201 px) y sin reduced motion: se ve un par de cards; la sección queda fija con
// position: sticky dentro de un envoltorio y el scroll vertical desplaza el track en X (1:1)
// hasta que se ven las dos últimas. Sin JS o fuera de la consulta queda el layout apilado.
// Feature 73: sin el pin de ScrollTrigger (cambiaba a fixed un frame tarde con rueda real y el
// encabezado saltaba); ScrollTrigger solo hace el scrub de x. Cifras de src/domain (feature 71/73).
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { focusScrollTarget, pinScrollLength, trackOffset } from '../../domain/latest-horizontal.ts';

gsap.registerPlugin(ScrollTrigger);

const DESKTOP = '(min-width: 1201px) and (prefers-reduced-motion: no-preference)';
const HORIZONTAL = 'latest-articles--horizontal';
let mm: gsap.MatchMedia | null = null;

/** Revierte el efecto: desenvuelve la sección y quita estilos, clase y listeners. */
export function destroy(): void {
  mm?.revert();
  mm = null;
}

/** Inicializa el efecto de forma idempotente. */
export function init(): void {
  destroy();
  const section = document.querySelector<HTMLElement>('.latest-articles');
  const track = section?.querySelector<HTMLElement>('.latest-articles__list');
  if (!section || !track) return;
  const cards = [...track.querySelectorAll<HTMLElement>('.latest-articles__card')];
  if (cards.length < 3) return; // REQ-73-19/26: con 2 cards el par ya lo muestra todo
  mm = gsap.matchMedia();
  mm.add(DESKTOP, () => setup(section, track, cards));
}

function setup(section: HTMLElement, track: HTMLElement, cards: HTMLElement[]): () => void {
  const n = cards.length;
  const wrapper = document.createElement('div');
  wrapper.className = 'latest-articles--horizontal-pin';
  section.before(wrapper);
  wrapper.append(section);
  section.classList.add(HORIZONTAL);
  const cardWidth = (): number => cards[0].getBoundingClientRect().width;
  const gap = (): number => parseFloat(getComputedStyle(track).columnGap) || 0;
  const length = (): number => pinScrollLength(cardWidth(), gap(), n);
  // REQ-73-20: el envoltorio mide sección + recorrido; se fija antes de que ScrollTrigger mida.
  const sizeWrapper = (): void => { wrapper.style.height = `${section.offsetHeight + length()}px`; };
  sizeWrapper();
  ScrollTrigger.addEventListener('refreshInit', sizeWrapper);
  const tween = gsap.to(track, {
    x: () => trackOffset(1, cardWidth(), gap(), n),
    ease: 'none',
    scrollTrigger: { trigger: wrapper, start: 'top top', end: () => `+=${pinScrollLength(cardWidth(), gap(), n)}`, scrub: true, invalidateOnRefresh: true },
  });
  const trigger = tween.scrollTrigger;
  const onFocus = (event: FocusEvent): void => {
    const index = cards.findIndex((card) => card.contains(event.target as Node));
    if (index >= 0 && trigger) window.scrollTo({ top: focusScrollTarget(index, n, trigger.start, trigger.end), behavior: 'instant' });
  };
  track.addEventListener('focusin', onFocus);
  const landing = wrapper.closest('[data-landing-sections]');
  const observer = new MutationObserver(() => {
    if (!landing?.hasAttribute('hidden')) ScrollTrigger.refresh();
  });
  if (landing) observer.observe(landing, { attributes: true, attributeFilter: ['hidden'] });
  ScrollTrigger.refresh();
  restoreScroll();
  return () => {
    ScrollTrigger.removeEventListener('refreshInit', sizeWrapper);
    track.removeEventListener('focusin', onFocus);
    observer.disconnect();
    wrapper.replaceWith(section); // REQ-73-25: la sección vuelve a su sitio
    section.classList.remove(HORIZONTAL);
  };
}

// El envoltorio cambia el alto del documento después de que Astro restaure el scroll al volver
// atrás; se reaplica la posición guardada en history.state.
function restoreScroll(): void {
  const saved = (history.state as { scrollY?: unknown } | null)?.scrollY;
  if (typeof saved === 'number' && Math.abs(window.scrollY - saved) > 2) window.scrollTo(0, saved);
}
