// Paginación de los resultados de búsqueda (feature 32, REQ-32-01..06).
// La página actual vive en un estado único (Pager) que comparten ambos
// botones; cada botón recibe un solo listener por inicialización de la vista
// y, tras cada cambio de página, el foco va a la lista (tabindex="-1") para
// no caer en body cuando el botón pulsado queda deshabilitado.
export type Pager = { page: number; render: (page: number) => void };

export function wirePagination(pager: Pager): void {
  const step = (delta: number) => (): void => {
    pager.render(pager.page + delta);
    document.querySelector<HTMLElement>('[data-search-list]')?.focus();
  };
  document.querySelector('[data-search-prev]')?.addEventListener('click', step(-1));
  document.querySelector('[data-search-next]')?.addEventListener('click', step(1));
}
