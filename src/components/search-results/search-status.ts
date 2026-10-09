// Región de estado de la búsqueda (feature 36, REQ-36-03..07). El mensaje se
// escribe en un único nodo role="status" aria-live="polite" (visually-hidden)
// para que los lectores de pantalla anuncien el resultado sin leer la lista.
export const ANNOUNCE_DELAY_MS = 300;

// «N resultados para "t"» / «1 resultado…» / «Sin resultados…», más «Página X
// de Y» cuando hay más de una página (REQ-36-03/04/05).
export function statusMessage(total: number, term: string, page: number, totalPages: number): string {
  if (total === 0) return `Sin resultados para "${term}"`;
  const base = `${total} ${total === 1 ? 'resultado' : 'resultados'} para "${term}"`;
  return totalPages > 1 ? `${base}. Página ${page} de ${totalPages}` : base;
}

export function writeStatus(root: ParentNode | null, message: string): void {
  const node = root?.querySelector('[data-search-status]');
  if (node) node.textContent = message;
}

// Panel en vivo de la portada: un solo anuncio 300 ms después de la última
// pulsación (REQ-36-07); con término vacío (portada) se limpia el estado.
// `fail` (feature 47) cancela el anuncio pendiente y escribe el error al momento.
export type LiveAnnouncer = ((term: string, total: number) => void) & { fail: (message: string) => void };
export function liveAnnouncer(panel: ParentNode): LiveAnnouncer {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const announce = (term: string, total: number): void => {
    clearTimeout(timer);
    const clean = term.trim();
    timer = setTimeout(
      () => writeStatus(panel, clean === '' ? '' : statusMessage(total, clean, 1, 1)),
      ANNOUNCE_DELAY_MS,
    );
  };
  return Object.assign(announce, {
    fail: (message: string): void => {
      clearTimeout(timer);
      writeStatus(panel, message);
    },
  });
}
