// Utilidades de DOM del scroll horizontal de la portada (features 73 y 75), separadas de
// latest-horizontal.ts para respetar el límite de 100 líneas.

// Los tweens revertidos dejan un transform neutro en línea; sin efecto el track no lleva estilos.
export function clearTrack(track: HTMLElement): void {
  if (track.closest('.latest-articles--horizontal')) return; // el efecto se recreó entretanto
  // Feature 76: también las cards (x propia de la primera y la última).
  for (const el of [track, ...track.querySelectorAll<HTMLElement>('.latest-articles__card')]) clearInline(el);
}

function clearInline(el: HTMLElement): void {
  el.style.removeProperty('transform');
  el.style.removeProperty('translate');
  el.style.removeProperty('rotate');
  el.style.removeProperty('scale');
  el.style.removeProperty('opacity');
  if (!el.getAttribute('style')?.trim()) el.removeAttribute('style');
}

// El envoltorio cambia el alto del documento después de que Astro restaure el scroll al volver
// atrás; se reaplica la posición guardada en history.state.
export function restoreScroll(): void {
  const saved = (history.state as { scrollY?: unknown } | null)?.scrollY;
  if (typeof saved === 'number' && Math.abs(window.scrollY - saved) > 2) window.scrollTo(0, saved);
}
