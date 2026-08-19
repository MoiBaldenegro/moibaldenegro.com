// Controlador client-side de la búsqueda (features 3/7: /search?q= y
// /<término>). Lógica separada de la UI (regla 8): lee el índice embebido
// (#search-index), filtra con searchIndex del dominio (feature 2) y pinta
// items de la lista (itemHtml, feature 9), empty state, guía y paginación
// sin recargar (JS justificado, término de ?q= o del pathname — REQ-07-03).
import { searchIndex } from '../../domain/search/search.ts';
import type { SearchIndexEntry } from '../../domain/search/index.ts';
import { itemHtml } from './item-html.ts';
import { clearDestination, termFromPathname } from './term-route.ts';
const INDEX_ID = 'search-index';
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
export function initSearchResults(): void {
  const index = readIndex();
  if (index === null) return;
  const q = queryTerm(window.location.search);
  const term = q !== '' ? q : termFromPathname(window.location.pathname);
  wireClear(document.title, q !== '');
  if (term === '') return void toggle('guide', true);
  document.title = `Búsqueda: ${term}`;
  renderSearch(term, index, 1);
}
function readIndex(): SearchIndexEntry[] | null {
  const text = document.getElementById(INDEX_ID)?.textContent ?? '';
  try {
    return JSON.parse(text) as SearchIndexEntry[];
  } catch {
    return null;
  }
}
function renderSearch(term: string, index: SearchIndexEntry[], page: number): void {
  const data = searchIndex(index, term, page);
  toggle('guide', false);
  if (data.total === 0) {
    const termNode = document.querySelector('[data-search-term]');
    if (termNode !== null) termNode.textContent = term;
    toggle('empty', true);
    return;
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
  const prev = document.querySelector('[data-search-prev]');
  const next = document.querySelector('[data-search-next]');
  if (prev !== null) {
    prev.toggleAttribute('disabled', data.page <= 1);
    prev.addEventListener('click', () => renderSearch(term, index, data.page - 1));
  }
  if (next !== null) {
    next.toggleAttribute('disabled', data.page >= data.totalPages);
    next.addEventListener('click', () => renderSearch(term, index, data.page + 1));
  }
}
function wireClear(baseTitle: string, fromQuery: boolean): void {
  const clear = document.querySelector('[data-search-clear]');
  if (clear === null) return;
  clear.addEventListener('click', () => {
    if (fromQuery) {
      const rest = removeQueryParam(window.location.search, 'q');
      window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
      document.title = baseTitle; toggle('empty', false); toggle('list', false); toggle('pagination', false); toggle('guide', true);
    } else {
      window.location.assign(clearDestination(window.location.pathname));
    }
  });
}
function toggle(name: string, visible: boolean): void {
  document.querySelector(`[data-search-${name}]`)?.toggleAttribute('hidden', !visible);
}