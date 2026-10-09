// Utilidades de DOM del scroll horizontal de la portada (features 73 y 75), separadas de
// latest-horizontal.ts para respetar el límite de 100 líneas.

// Los tweens revertidos dejan un transform neutro en línea; sin efecto el track no lleva estilos.
export function clearTrack(track: HTMLElement): void {
  if (track.closest('.latest-articles--horizontal')) return; // el efecto se recreó entretanto
  track.style.removeProperty('transform');
  track.style.removeProperty('translate');
  track.style.removeProperty('rotate');
  track.style.removeProperty('scale');
  track.style.removeProperty('opacity');
  if (!track.getAttribute('style')?.trim()) track.removeAttribute('style');
}

// El envoltorio cambia el alto del documento después de que Astro restaure el scroll al volver
// atrás; se reaplica la posición guardada en history.state.
export function restoreScroll(): void {
  const saved = (history.state as { scrollY?: unknown } | null)?.scrollY;
  if (typeof saved === 'number' && Math.abs(window.scrollY - saved) > 2) window.scrollTo(0, saved);
}
