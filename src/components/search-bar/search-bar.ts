// search-bar.ts — Control de la barra de búsqueda del header (feature 4,
// REQ-04-02..07). Lógica separada de la UI (regla 8): el <script> del .astro
// solo importa y arranca (design.md Decisión 1). Funciones puras exportadas
// para test unitario (isFilled, searchUrl, submitQuery, activeQuery) y wiring
// con DOM inyectado (initSearchBar, clearQuery) — precedente del controlador
// de search-results (feature 3). Navegación con navigate() de
// astro:transitions/client (view transitions, Decisión 3). La API expuesta
// (clearQuery, activeQuery, changeEventName) la reutiliza la feature 6.

const EVENT_NAME = 'search:change';
let active = '';

export function searchUrl(term: string): string {
  return `/search?${new URLSearchParams({ q: term.trim() }).toString()}`;
}

export function isFilled(term: string): boolean {
  return term.trim() !== '';
}

export function submitQuery(term: string, navigate: (url: string) => void): void {
  if (!isFilled(term)) return;
  navigate(searchUrl(term));
}

export function changeEventName(): string {
  return EVENT_NAME;
}

export function activeQuery(): string {
  return active;
}

export function emitChange(term: string): void {
  active = term.trim();
  document.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { term: active } }));
}

export function clearQuery(root: Element): void {
  const input = root.querySelector('input');
  if (input === null) return;
  input.value = '';
  syncBar(root, input);
  input.focus();
}

export function initSearchBar(
  navigate: (url: string) => void,
  root: Element | null = document.querySelector('[data-search-bar]'),
): void {
  if (root === null) return;
  const input = root.querySelector('input');
  if (input === null) return;
  input.addEventListener('input', () => syncBar(root, input));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') submitQuery(input.value, navigate);
  });
  root.querySelector('[data-search-clear]')?.addEventListener('click', () => clearQuery(root));
}

function syncBar(root: Element, input: HTMLInputElement): void {
  root.classList.toggle('is-filled', isFilled(input.value));
  emitChange(input.value);
}
