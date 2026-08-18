// search-live.ts — Controlador de la transición dinámica de la portada
// (feature 5, REQ-05-01..07). JS de runtime justificado (design.md Decisión
// 4): live search en tiempo real, excepción a "estático por defecto" (regla
// 9) con precedentes 24/43/44 y features 3/4; sin frameworks ni dependencias
// (CustomEvent + DOM nativos). Lógica separada de la UI (regla 8): el
// <script> del componente solo importa y arranca. Reutiliza la presentación
// de la vista dedicada (feature 3): cardHtml y search-results.css.

import { searchIndex, PAGE_SIZE } from '../../domain/search/search.ts';
import type { SearchIndexEntry } from '../../domain/search/index.ts';
import { cardHtml } from '../search-results/search-results-controller.ts';
import { changeEventName } from '../search-bar/search-bar.ts';

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
  const grid = panel.querySelector('[data-search-grid]');
  const termNode = panel.querySelector('[data-search-term]');
  const allLink = panel.querySelector('[data-search-all]');
  if (data.total === 0) {
    if (termNode !== null) termNode.textContent = term;
    empty?.toggleAttribute('hidden', false);
    grid?.toggleAttribute('hidden', true);
  } else {
    if (grid !== null) {
      grid.innerHTML = data.results.map(cardHtml).join('');
      grid.toggleAttribute('hidden', false);
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
  document.addEventListener(changeEventName(), (event: Event) => {
    const term = (event as CustomEvent<{ term?: string }>).detail?.term ?? '';
    applyLive(term, index, panel, landing);
  });
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