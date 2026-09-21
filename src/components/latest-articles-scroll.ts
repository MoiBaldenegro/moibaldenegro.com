// latest-articles-scroll.ts — Pista horizontal gobernada por el scroll
// (features 29-34: pin + scrub de ScrollTrigger dentro del paquete gsap
// de la 28, sin dependencia nueva). Sin JS las 3 cards quedan visibles en
// la disposición base; con movimiento reducido el contenido queda
// estático. Re-init en astro:page-load (ClientRouter, feature 10) con
// limpieza de triggers previos. Feature 34: nunca un pin de longitud cero
// (medir tras asentar, diferir ante el 0, re-medir vigilado al asentar y
// exponer la distancia como observable + marca en consola).

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Modificador que la hoja estila como pista horizontal; solo se añade con
// JS activo, por eso sin JS la lista conserva la disposición estática.
export const SCROLL_READY_CLASS = 'latest-articles--scroll';
// Atributo observable con la distancia medida (feature 34, REQ-34-11).
export const PIN_DISTANCE_ATTR = 'data-pin-distance';

// Progreso vertical [0, 1] → desplazamiento horizontal de la pista.
export function trackShift(progress: number, maxShift: number): number {
  if (maxShift <= 0) return 0;
  const clamped = Math.min(1, Math.max(0, progress));
  if (clamped === 0) return 0;
  return -clamped * maxShift;
}

// Recorrido full-bleed (feature 30): contra el viewport, de lado a lado.
export function viewportDistance(trackScrollWidth: number, viewportWidth: number): number {
  return Math.max(0, trackScrollWidth - viewportWidth);
}

// Espaciado acotado del pin (feature 32): tope al recorrido real.
export function clampPinDistance(trackScrollWidth: number, viewportWidth: number, maxViewports = 3): number {
  const raw = viewportDistance(trackScrollWidth, viewportWidth);
  return Math.min(raw, Math.max(0, maxViewports * viewportWidth));
}
// Pin listo solo con recorrido real (feature 34, REQ-34-01/04): con 0 el
// pin quedaría de longitud cero (sin spacer y sin movimiento).
export function isPinReady(distance: number): boolean {
  return distance > 0;
}

// Solo se construye en modo landing y sin movimiento reducido.
export function shouldBuildTrigger(landingHidden: boolean, prefersReduced: boolean): boolean {
  return landingHidden === false && prefersReduced === false;
}

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
  const measure = (): number => clampPinDistance(track.scrollWidth, window.innerWidth);
  // x y end comparten la distancia medida (sincronizados, REQ-34-03/04).
  const build = (distance: number): void => {
    section.setAttribute(PIN_DISTANCE_ATTR, String(distance));
    console.log(`[latest-scroll] pin distance: ${distance}`);
    gsap.to(track, {
      x: -distance,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        // Enganche visible (feature 33): el pin se activa con la sección
        // llenando el viewport y el recorrido se ve entero.
        start: 'top top',
        end: `+=${distance}`,
        pin: true,
        scrub: true,
      },
    });
  };
  // Re-medición vigilada al asentar el layout (REQ-34-02): reconstruye con
  // el valor asentado; refresco acotado, sin invalidateOnRefresh (32).
  const settle = (built: number): void => {
    const next = measure();
    if (next !== built && isPinReady(next)) { ScrollTrigger.getAll().forEach((t) => t.kill()); build(next); } ScrollTrigger.refresh();
  };
  const first = measure();
  // Nunca un pin de longitud cero (REQ-34-01): con 0 se difiere al asentar.
  if (isPinReady(first) === false) {
    if (document.readyState === 'complete') settle(first);
    else window.addEventListener('load', () => settle(first), { once: true });
    return;
  }
  build(first);
  if (document.readyState === 'complete') settle(first);
  else window.addEventListener('load', () => settle(first), { once: true });
}
