// latest-articles-scroll.ts — Pista horizontal gobernada por el scroll
// (feature 29 horizontal-scroll-gsap-cards, REQ-29-01..09).
// Corrección del humano: NO es carrusel (sin scroll-snap) ni animación de
// entrada; el scroll vertical conduce la traslación horizontal de la pista
// con gsap + ScrollTrigger (pin + scrub). ScrollTrigger vive dentro del
// paquete gsap de la feature 28: sin dependencia nueva. JS de runtime
// justificado (excepción a estático por defecto): sin JS las 3 cards quedan
// visibles en la disposición base de la hoja; con movimiento reducido el
// contenido queda estático. Re-init en astro:page-load (ClientRouter,
// feature 10) con limpieza de triggers previos y refresco al restaurar el
// modo landing tras el live-search (features 5/10).

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Modificador que la hoja estila como pista horizontal; solo se añade con
// JS activo, por eso sin JS la lista conserva la disposición estática.
export const SCROLL_READY_CLASS = 'latest-articles--scroll';

// Progreso vertical [0, 1] → desplazamiento horizontal de la pista.
export function trackShift(progress: number, maxShift: number): number {
  const clamped = Math.min(1, Math.max(0, progress));
  if (clamped === 0) return 0;
  return -clamped * maxShift;
}

// La animación solo se construye en modo landing y sin movimiento reducido;
// en modo resultados (landing oculta) la sección no rompe el panel.
export function shouldBuildTrigger(landingHidden: boolean, prefersReduced: boolean): boolean {
  return landingHidden === false && prefersReduced === false;
}

// El panel live-search oculta el ancestro data-landing-sections con la
// consulta activa (features 5/10); al vaciar lo restaura.
export function landingHidden(section: Element): boolean {
  const landing = section.closest('[data-landing-sections]');
  return landing !== null && landing.hasAttribute('hidden');
}

export function initLatestScroll(
  section: Element | null = document.querySelector('[data-latest-scroll]'),
  track: Element | null = document.querySelector('[data-latest-track]'),
): void {
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  if (section === null || track === null) return;
  if (typeof window === 'undefined') return;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (shouldBuildTrigger(landingHidden(section), prefersReduced) === false) return;
  section.classList.add(SCROLL_READY_CLASS);
  const distance = (): number => track.scrollWidth - section.clientWidth;
  gsap.to(track, {
    x: (): number => -distance(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top center',
      end: (): string => `+=${distance()}`,
      pin: true,
      scrub: true,
      invalidateOnRefresh: true,
    },
  });
  ScrollTrigger.refresh();
}
