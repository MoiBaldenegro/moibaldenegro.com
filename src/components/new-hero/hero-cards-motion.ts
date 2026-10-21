// Entrada y salida tipo lego de las cards del hero (feature 115): mejora progresiva de .hero-grid sin
// marcado propio. JS de runtime justificado: el humano autorizó GSAP para animar cards (features 70/96).
// Un gsap.matchMedia con una consulta por caso: en <= 768 px solo las cards con data-show-on-mobile
// (las demás tienen display none, feature 106); con prefers-reduced-motion reduce ninguna consulta
// casa y no se crean tweens ni ScrollTriggers. La semilla del orden aleatorio sale de Math.random.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createRng, LEGO_MEDIA, LEGO_VARS } from '../../domain/hero-cards-motion.ts';
import { legoMotion } from './hero-cards-lego.ts';

gsap.registerPlugin(ScrollTrigger);

let mm: gsap.MatchMedia | null = null;
let cards: HTMLElement[] = [];

/** Quita los estilos en línea que haya dejado la animación (el revert ya restaura los originales). */
function clearInline(el: HTMLElement): void {
  for (const prop of [...Object.values(LEGO_VARS), 'opacity']) el.style.removeProperty(prop);
  if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
}

/** Revierte el efecto: mata tweens y triggers y deja las cards sin estilos en línea. */
export function destroy(): void {
  mm?.revert();
  mm = null;
  cards.forEach(clearInline);
  cards = [];
}

/** Inicializa el efecto de forma idempotente. */
export function init(): void {
  destroy();
  const grid = document.querySelector<HTMLElement>('.hero-grid');
  if (!grid) return;
  cards = [...grid.querySelectorAll<HTMLElement>(':scope > .hero-card')];
  if (!cards.length) return;
  const rng = createRng(Math.floor(Math.random() * 2 ** 32));
  const all = cards;
  mm = gsap.matchMedia();
  mm.add(LEGO_MEDIA.mobile, (ctx) => legoMotion(all.filter((card) => card.hasAttribute('data-show-on-mobile')), ctx, rng));
  mm.add(LEGO_MEDIA.wide, (ctx) => legoMotion(all, ctx, rng));
}
