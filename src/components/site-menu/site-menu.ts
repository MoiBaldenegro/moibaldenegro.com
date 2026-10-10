// Wiring del menú hamburguesa móvil (feature 78). Conecta el estado puro de src/domain/site-menu.ts
// al header: el botón [data-site-menu-toggle] abre y cierra el panel [data-site-menu]; data-menu
// en el header gobierna el CSS (feature 79). Cierra con Escape (si la búsqueda no lo consume),
// clic fuera, clic en un enlace, foco fuera del header o paso a escritorio. Idempotente: el layout
// se re-renderiza en cada navegación y el listener de documento y de la consulta es único.
import { nextMenuState, menuAttributes, menuEscapeAction, type MenuEvent, type MenuState } from '../../domain/site-menu.ts';
import { activeTerm, escapeAction, escapeContext, isSearchFocus } from '../search-escape/search-escape.ts';

type Root = { querySelector(selector: string): unknown; addEventListener(type: string, fn: (e: Event) => void): void };
type Media = { matches?: boolean; addEventListener(type: string, fn: (e: { matches: boolean }) => void): void };
type Header = HTMLElement & { dataset: DOMStringMap };

let current: ((event: MenuEvent, focusButton?: boolean) => void) | null = null;
let currentHeader: Header | null = null;
const wiredRoots = new WeakSet<object>();
const wiredMedia = new WeakSet<object>();
const wiredHeaders = new WeakSet<object>();

/** Por defecto la búsqueda consume Escape si el foco está en ella y hay un término que limpiar. */
function defaultSearchWillHandle(event: Event): boolean {
  if (!isSearchFocus(event.target)) return false;
  const context = escapeContext(document);
  return escapeAction(activeTerm(context, location.search), context) !== 'none';
}

export function initSiteMenu(
  root: Root = document,
  media: Media = window.matchMedia('(max-width: 768px)'),
  searchWillHandle: (event: Event) => boolean = defaultSearchWillHandle,
): void {
  const header = root.querySelector('.site-navbar') as Header | null;
  const button = header?.querySelector('[data-site-menu-toggle]') as HTMLElement | null;
  const panel = header?.querySelector('[data-site-menu]') as HTMLElement | null;
  if (!header || !button || !panel) return;
  // El estado vive en data-menu del header: un re-init sobre el mismo header comparte el estado.
  const read = (): MenuState => (header.getAttribute('data-menu') === 'open' ? 'open' : 'closed');
  const apply = (state: MenuState): void => {
    const attrs = menuAttributes(state);
    header.setAttribute('data-menu', state);
    button.setAttribute('aria-expanded', attrs.expanded);
    button.setAttribute('aria-label', attrs.label);
  };
  const send = (event: MenuEvent, focusButton = false): void => {
    const wasOpen = read() === 'open';
    apply(nextMenuState(read(), event));
    if (read() === 'open' && !wasOpen) (panel.querySelector('a, input, button') as HTMLElement | null)?.focus();
    if (focusButton) button.focus();
  };
  apply('closed');
  current = (event, focusButton) => { if (read() === 'open') send(event, focusButton); };
  currentHeader = header;
  if (!wiredHeaders.has(header)) {
    wiredHeaders.add(header);
    button.addEventListener('click', () => send('toggle'));
    header.addEventListener('keydown', (e: Event) => {
      if ((e as KeyboardEvent).key !== 'Escape') return;
      if (menuEscapeAction(read(), searchWillHandle(e)) === 'close') send('escape', true);
    });
    header.addEventListener('focusout', (e: Event) => {
      const next = (e as FocusEvent).relatedTarget as Node | null;
      if (next && !header.contains(next) && read() === 'open') send('focus-out');
    });
    panel.addEventListener('click', (e: Event) => {
      const target = e.target as Element | null;
      if (target && typeof target.closest === 'function' && target.closest('a') && read() === 'open') send('link');
    });
  }
  if (!wiredRoots.has(root)) {
    wiredRoots.add(root);
    root.addEventListener('click', (e: Event) => {
      if (currentHeader && !currentHeader.contains(e.target as Node)) current?.('outside');
    });
  }
  if (!wiredMedia.has(media)) {
    wiredMedia.add(media);
    media.addEventListener('change', (e) => { if (!e.matches) current?.('desktop'); });
  }
}
