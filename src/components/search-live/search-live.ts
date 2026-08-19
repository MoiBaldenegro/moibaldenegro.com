// search-live.ts — Controlador de la transición dinámica de la portada
// (feature 5, REQ-05-01..07). JS de runtime justificado (design.md Decisión
// 4): live search, excepción a "estático por defecto" (precedentes 24/43/44);
// sin frameworks (CustomEvent nativo). Lógica separada de la UI (regla 8):
// <script> solo importa y arranca; reutiliza itemHtml/search-results.css (f3).

import { searchIndex, PAGE_SIZE } from '../../domain/search/search.ts';
import type { SearchIndexEntry } from '../../domain/search/index.ts';
import { itemHtml } from '../search-results/item-html.ts';
import { changeEventName } from '../search-bar/search-bar.ts';

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
  return {
    results: data.results,
    total: data.total,
    pageSize,
    showAllLink: data.total > pageSize,
  };
}

export function seeAllUrl(term: string): string {
  return `/search?${new URLSearchParams({ q: term.trim() }).toString()}`;
}

export function applyLive(
  term: string,
  index: readonly SearchIndexEntry[],
  panel: Element,
  landing: Element | null,
): void {
  const mode = layoutMode(term);
  panel.toggleAttribute('hidden', mode === 'landing');
  if (landing !== null) landing.toggleAttribute('hidden', mode === 'results');
  if (mode === 'landing') return;
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
}

export function initSearchLive(
  panel: Element | null = document.querySelector('[data-search-live]'),
  landing: Element | null = document.querySelector('[data-landing-sections]'),
): void {
  if (panel === null) return;
  const index = readIndex();
  if (index === null) return;
  if (changeHandler !== null) document.removeEventListener(changeEventName(), changeHandler);
  changeHandler = (event: Event): void => {
    applyLive((event as CustomEvent<{ term?: string }>).detail?.term ?? '', index, panel, landing);
  };
  document.addEventListener(changeEventName(), changeHandler);
  const input = document.querySelector('[data-search-bar] input');
  applyLive(input instanceof HTMLInputElement ? input.value : '', index, panel, landing);
}

function readIndex(): SearchIndexEntry[] | null {
  const text = document.getElementById('search-index')?.textContent ?? '';
  try {
    return JSON.parse(text) as SearchIndexEntry[];
  } catch {
    return null;
  }
}