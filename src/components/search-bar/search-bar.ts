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
  resetQuery(root);
  root.querySelector('input')?.focus();
}

// Vacía la barra y quita is-filled sin mover el foco (feature 57: al limpiar
// la vista /search, la barra precargada con q no debe conservar el término).
export function resetQuery(root: Element): void {
  const input = root.querySelector('input');
  if (input === null) return;
  input.value = '';
  syncBar(root, input);
}

// Feature 57: el buscador es un <form> GET a /search (funciona sin JS). Con JS
// se cancela el envío nativo y se navega con view transitions (REQ-57-03); en
// /search el input muestra el término activo (REQ-57-04). `location` se inyecta
// para los tests (en el navegador es window.location).
export function initSearchBar(
  navigate: (url: string) => void,
  root: Element | null = document.querySelector('[data-search-bar]'),
  location: Pick<Location, 'pathname' | 'search'> | undefined = globalThis.location,
): void {
  if (root === null) return;
  const input = root.querySelector('input');
  if (input === null) return;
  preloadTerm(root, input, location);
  input.addEventListener('input', () => syncBar(root, input));
  root.querySelector('form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    submitQuery(input.value, navigate);
  });
  root.querySelector('[data-search-clear]')?.addEventListener('click', () => clearQuery(root));
}

function preloadTerm(root: Element, input: HTMLInputElement, location?: Pick<Location, 'pathname' | 'search'>): void {
  if (location === undefined || location.pathname.replace(/\/+$/, '') !== '/search') return;
  input.value = new URLSearchParams(location.search).get('q')?.trim() ?? '';
  root.classList.toggle('is-filled', isFilled(input.value));
}

function syncBar(root: Element, input: HTMLInputElement): void {
  root.classList.toggle('is-filled', isFilled(input.value));
  emitChange(input.value);
}
