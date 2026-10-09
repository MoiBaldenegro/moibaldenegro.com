// search-live.ts — Controlador de la transición dinámica de la portada (feature 5,
// REQ-05-01..07). JS de runtime justificado (design.md Decisión 4); sin frameworks
// (CustomEvent nativo). Lógica fuera de la UI; reutiliza itemHtml/search-results.css.

import { searchIndex, PAGE_SIZE } from '../../domain/search/search.ts';
import type { SearchIndexEntry } from '../../domain/search/index.ts';
import { itemHtml } from '../search-results/item-html.ts';
import { changeEventName } from '../search-bar/search-bar.ts';
import { loadSearchIndex, type IndexLoader } from '../search-results/index-loader.ts';
import { liveShow, preloadOnFocus } from './live-search.ts';

let changeHandler: ((event: Event) => void) | null = null; // guard de re-init (f10)

export type LayoutMode = 'landing' | 'results';

export interface LivePage {
  readonly results: readonly SearchIndexEntry[];
  readonly total: number;
  readonly pageSize: number;
  readonly showAllLink: boolean;
}

export function layoutMode(term: string): LayoutMode {
  return term.trim() === '' ? 'landing' : 'results';
}

export function livePage(
  index: readonly SearchIndexEntry[],
  term: string,
  pageSize: number = PAGE_SIZE,
): LivePage {
  const data = searchIndex(index, term, 1);
  return { results: data.results, total: data.total, pageSize, showAllLink: data.total > pageSize };
}

export function seeAllUrl(term: string): string {
  return `/search?${new URLSearchParams({ q: term.trim() }).toString()}`;
}

export function applyLive(
  term: string,
  index: readonly SearchIndexEntry[],
  panel: Element,
  landing: Element | null,
): number {
  const mode = layoutMode(term);
  panel.toggleAttribute('hidden', mode === 'landing');
  if (landing !== null) landing.toggleAttribute('hidden', mode === 'results');
  if (mode === 'landing') return 0;
  const data = livePage(index, term, PAGE_SIZE);
  const empty = panel.querySelector('[data-search-empty]');
  const list = panel.querySelector('[data-search-list]');
  const termNode = panel.querySelector('[data-search-term]');
  const allLink = panel.querySelector('[data-search-all]');
  if (data.total === 0) {
    if (termNode !== null) termNode.textContent = term;
    empty?.toggleAttribute('hidden', false);
    list?.toggleAttribute('hidden', true);
  } else {
    if (list !== null) {
      list.innerHTML = data.results.map(itemHtml).join('');
      list.toggleAttribute('hidden', false);
    }
    empty?.toggleAttribute('hidden', true);
  }
  if (allLink !== null) {
    allLink.setAttribute('href', seeAllUrl(term));
    allLink.toggleAttribute('hidden', !data.showAllLink);
  }
  return data.total;
}

// Feature 47: sin índice embebido. La portada no lo pide al cargar: lo pide al
// primer focus del buscador o al primer término (REQ-47-03); el modo portada
// (término vacío) no lo necesita. Si la carga falla, se anuncia el error.
export function initSearchLive(
  panel: Element | null = document.querySelector('[data-search-live]'),
  landing: Element | null = document.querySelector('[data-landing-sections]'),
  load: IndexLoader = loadSearchIndex,
): void {
  if (panel === null) return;
  if (changeHandler !== null) document.removeEventListener(changeEventName(), changeHandler);
  const show = liveShow(panel, landing, applyLive, load); // estado, carrera y errores: live-search.ts
  changeHandler = (event: Event): void => show((event as CustomEvent<{ term?: string }>).detail?.term ?? '');
  document.addEventListener(changeEventName(), changeHandler);
  const input = document.querySelector('[data-search-bar] input');
  if (input instanceof HTMLInputElement) preloadOnFocus(input, load);
  // Carga inicial: con término vacío solo se aplica el modo portada (sin anuncio).
  const initial = input instanceof HTMLInputElement ? input.value : '';
  if (initial.trim() === '') applyLive(initial, [], panel, landing);
  else show(initial);
}
