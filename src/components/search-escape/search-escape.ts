// search-escape.ts — Soporte de teclado Escape de la búsqueda (feature 6,
// REQ-06-01..04). JS de runtime justificado (precedente features 3/4/5):
// interacción de teclado nativa, sin frameworks ni dependencias. Lógica
// separada de la UI (regla 8): el <script> del componente solo importa y
// arranca. Funciones puras (escapeContext, escapeAction, activeTerm) +
// wiring con DOM inyectado (initSearchEscape). Reutiliza por import las APIs
// de la barra (clearQuery/activeQuery, feature 4), de la vista dedicada
// (removeQueryParam/queryTerm, feature 3) y del panel en vivo (applyLive,
// feature 5). El contexto se detecta por DOM: [data-search-live] → portada;
// [data-search-guide] → vista /search.

import { activeQuery, clearQuery } from '../search-bar/search-bar.ts';
import { queryTerm, removeQueryParam } from '../search-results/search-results-controller.ts';
import { applyLive } from '../search-live/search-live.ts';

export type EscapeContext = 'landing' | 'search' | 'none';
export type EscapeAction = 'clear-landing' | 'clear-search' | 'none';

let escapeHandler: ((event: KeyboardEvent) => void) | null = null;

export function escapeContext(root: { querySelector(selector: string): unknown }): EscapeContext {
  if (root.querySelector('[data-search-live]') !== null) return 'landing';
  if (root.querySelector('[data-search-guide]') !== null) return 'search';
  return 'none';
}

export function escapeAction(term: string, context: EscapeContext): EscapeAction {
  if (term.trim() === '') return 'none';
  if (context === 'landing') return 'clear-landing';
  if (context === 'search') return 'clear-search';
  return 'none';
}

export function activeTerm(context: EscapeContext, search: string): string {
  return context === 'search' ? queryTerm(search) : activeQuery();
}

export function initSearchEscape(
  root: Element = document,
  barRoot: Element | null = document.querySelector('[data-search-bar]'),
  baseTitle: string = document.title,
): void {
  // View transitions re-ejecutan los scripts del layout en cada navegación:
  // guard a nivel de módulo para no acumular manejadores en el documento.
  if (escapeHandler !== null) root.removeEventListener('keydown', escapeHandler);
  escapeHandler = (event: KeyboardEvent): void => {
    if (event.key !== 'Escape') return;
    event.stopPropagation(); // REQ-06-04: nunca propaga al resto de la página
    const context = escapeContext(root);
    const action = escapeAction(activeTerm(context, window.location.search), context);
    if (action === 'clear-landing') clearLanding(root, barRoot);
    if (action === 'clear-search') clearSearchView(baseTitle);
  };
  root.addEventListener('keydown', escapeHandler);
}

function clearLanding(root: Element, barRoot: Element | null): void {
  if (barRoot !== null) clearQuery(barRoot); // vacía, sincroniza y enfoca (f4)
  const panel = root.querySelector('[data-search-live]');
  const landing = root.querySelector('[data-landing-sections]');
  // applyLive('') restaura las secciones habituales (f5); con modo landing el
  // índice no se usa (retorno temprano), por eso se pasa vacío.
  if (panel !== null) applyLive('', [], panel, landing);
}

function clearSearchView(baseTitle: string): void {
  const rest = removeQueryParam(window.location.search, 'q');
  window.history.replaceState(null, '', `${window.location.pathname}${rest ? `?${rest}` : ''}`);
  document.title = baseTitle;
  toggle('guide', true);
  for (const name of ['empty', 'grid', 'pagination']) toggle(name, false);
}

function toggle(name: string, visible: boolean): void {
  document.querySelector(`[data-search-${name}]`)?.toggleAttribute('hidden', !visible);
}