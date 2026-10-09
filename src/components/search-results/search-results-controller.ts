// Controlador client-side de la búsqueda (features 3/7: /search?q= y
// /<término>). Lógica separada de la UI (regla 8): obtiene el índice del
// loader (feature 47), filtra con searchIndex del dominio (feature 2) y pinta
// items de la lista (itemHtml, feature 9), empty state, guía y paginación
// sin recargar (JS justificado, término de ?q= o del pathname — REQ-07-03).
// El orden por fecha lo decide el origen del término (feature 17): ?q= → desc
// (REQ-17-03), pathname /<término> → asc (REQ-17-02), propagado a la paginación
// (REQ-17-05). La paginación (estado único y foco) vive en search-pagination.ts
// (feature 32).
import { searchIndex, type SearchOrder } from '../../domain/search/search.ts';
import type { SearchIndexEntry } from '../../domain/search/index.ts';
import { itemHtml } from './item-html.ts';
import { clearDestination, termFromPathname } from './term-route.ts';
import { wirePagination, type Pager } from './search-pagination.ts';
import { statusMessage, writeStatus } from './search-status.ts';
import { INDEX_ERROR_MESSAGE, loadSearchIndex, withSearchIndex, type IndexLoader } from './index-loader.ts';
import { resetQuery } from '../search-bar/search-bar.ts';
export function queryTerm(search: string): string {
  return new URLSearchParams(search).get('q')?.trim() ?? '';
}
export function removeQueryParam(search: string, name: string): string {
  const params = new URLSearchParams(search);
  params.delete(name);
  return params.toString();
}
export function pageLabel(page: number, totalPages: number): string {
  return `Página ${page} de ${totalPages}`;
}
// Feature 47: el índice llega del loader (fetch de /search-index.json, una vez
// por sesión) en lugar del script embebido; si falla, se anuncia el error.
export function initSearchResults(load: IndexLoader = loadSearchIndex): void {
  const q = queryTerm(window.location.search);
  const term = q !== '' ? q : termFromPathname(window.location.pathname);
  wireClear(document.title, q !== '');
  if (term === '') return void toggle('guide', true);
  document.title = `Búsqueda: ${term}`;
  const order: SearchOrder = q !== '' ? 'desc' : 'asc';
  withSearchIndex((index) => {
    // Estado único de la página actual compartido por ambos botones (REQ-32-04).
    const pager: Pager = { page: 1, render: (page) => { pager.page = renderSearch(term, index, page, order); } };
    wirePagination(pager);
    pager.render(1);
  }, () => writeStatus(document.querySelector('.search-results'), INDEX_ERROR_MESSAGE), load);
}
function renderSearch(
  term: string,
  index: SearchIndexEntry[],
  page: number,
  order: SearchOrder,
): number {
  const data = searchIndex(index, term, page, order);
  toggle('guide', false);
  // REQ-36-06: el estado se anuncia en cada render y cambio de página.
  writeStatus(document.querySelector('.search-results'), statusMessage(data.total, term, data.page, data.totalPages));
  if (data.total === 0) {
    const termNode = document.querySelector('[data-search-term]');
    if (termNode !== null) termNode.textContent = term;
    toggle('empty', true);
    return data.page;
  }
  toggle('empty', false);
  const list = document.querySelector('[data-search-list]');
  if (list !== null) {
    list.innerHTML = data.results.map(itemHtml).join('');
    toggle('list', true);
  }
  const label = document.querySelector('[data-search-page-label]');
  if (label !== null) label.textContent = pageLabel(data.page, data.totalPages);
  toggle('pagination', data.totalPages > 1);
  document.querySelector('[data-search-prev]')?.toggleAttribute('disabled', data.page <= 1);
  document.querySelector('[data-search-next]')?.toggleAttribute('disabled', data.page >= data.totalPages);
  return data.page;
}
function wireClear(baseTitle: string, fromQuery: boolean): void {
  const root = document.querySelector('.search-results');
  const clear = root?.querySelector('[data-search-results-clear]') ?? null;
  if (clear === null) return;
  clear.addEventListener('click', () => {
    if (fromQuery) {
      const rest = removeQueryParam(window.location.search, 'q');
      window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
      const bar = document.querySelector('[data-search-bar]');
      if (bar !== null) resetQuery(bar); // feature 57: vacía la barra precargada
      document.title = baseTitle; toggle('empty', false); toggle('list', false); toggle('pagination', false); toggle('guide', true);
    } else {
      window.location.assign(clearDestination(window.location.pathname));
    }
  });
}
function toggle(name: string, visible: boolean): void {
  document.querySelector(`[data-search-${name}]`)?.toggleAttribute('hidden', !visible);
}