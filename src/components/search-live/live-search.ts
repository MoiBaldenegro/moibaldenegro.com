// Búsqueda en vivo de la portada con índice diferido (feature 47,
// REQ-47-03/05). Separado de search-live.ts (al límite de líneas).
//  - Solo se pinta el último término recibido: si el usuario borra o cambia
//    el término antes de que llegue el índice, el resultado obsoleto se
//    descarta (sin carreras que oculten la portada con el input vacío).
//  - Si el índice no carga, el panel se muestra con el error en el nodo de
//    estado (role="status"): fuera de un contenedor hidden, sí se anuncia.
import type { SearchIndexEntry } from '../../domain/search/index.ts';
import { liveAnnouncer, type LiveAnnouncer } from '../search-results/search-status.ts';
import { INDEX_ERROR_MESSAGE, withSearchIndex, type IndexLoader } from '../search-results/index-loader.ts';

type Apply = (term: string, index: readonly SearchIndexEntry[], panel: Element, landing: Element | null) => number;

export function liveShow(panel: Element, landing: Element | null, apply: Apply, load: IndexLoader): (term: string) => void {
  const announce = liveAnnouncer(panel); // REQ-36-07: estado con debounce de 300 ms
  let latest = '';
  return (term) => {
    latest = term;
    if (term.trim() === '') return void announce(term, apply(term, [], panel, landing));
    withSearchIndex(
      (index) => {
        if (term === latest) announce(term, apply(term, index, panel, landing));
      },
      () => {
        if (term === latest) showLoadError(panel, landing, announce);
      },
      load,
    );
  };
}

function showLoadError(panel: Element, landing: Element | null, announce: LiveAnnouncer): void {
  panel.toggleAttribute('hidden', false);
  landing?.toggleAttribute('hidden', true);
  for (const selector of ['[data-search-empty]', '[data-search-list]', '[data-search-all]']) {
    panel.querySelector(selector)?.toggleAttribute('hidden', true);
  }
  announce.fail(INDEX_ERROR_MESSAGE);
}

// Precarga oportunista en el primer focus del buscador (REQ-47-03).
export function preloadOnFocus(input: HTMLInputElement, load: IndexLoader): void {
  input.addEventListener('focus', () => void load().catch(ignorePreloadFailure), { once: true });
}

// El fallo de la precarga se ignora AQUÍ a propósito: no se cachea, así que el
// primer término vuelve a pedir el índice y, si falla, liveShow muestra y
// anuncia el error (showLoadError). Avisar en el focus sería prematuro.
function ignorePreloadFailure(): void {}
