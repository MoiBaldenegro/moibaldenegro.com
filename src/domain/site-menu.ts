// Estado puro del menú hamburguesa móvil (feature 78). Sin DOM ni globales del navegador: el
// wiring (src/components/site-menu/site-menu.ts) solo aplica lo que deciden estas funciones.

export type MenuState = 'open' | 'closed';
export type MenuEvent = 'toggle' | 'escape' | 'outside' | 'link' | 'focus-out' | 'desktop';

const STATES: readonly string[] = ['open', 'closed'];
const CLOSERS: readonly string[] = ['escape', 'outside', 'link', 'focus-out', 'desktop'];

/** Error de un estado o evento fuera de los valores definidos. */
export class MenuStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MenuStateError';
  }
}

/** Siguiente estado: toggle alterna; el resto de eventos cierra. */
export function nextMenuState(state: MenuState, event: MenuEvent): MenuState {
  if (!STATES.includes(state)) throw new MenuStateError(`Estado de menú desconocido: «${String(state)}»`);
  if (event === 'toggle') return state === 'open' ? 'closed' : 'open';
  if (CLOSERS.includes(event)) return 'closed';
  throw new MenuStateError(`Evento de menú desconocido: «${String(event)}»`);
}

/** aria-expanded y aria-label del botón para cada estado. */
export function menuAttributes(state: MenuState): { expanded: 'true' | 'false'; label: string } {
  return state === 'open' ? { expanded: 'true', label: 'Cerrar menú' } : { expanded: 'false', label: 'Abrir menú' };
}

/** Escape cierra el menú abierto salvo que la búsqueda vaya a consumirlo (limpiar un término activo). */
export function menuEscapeAction(state: MenuState, searchWillHandle: boolean): 'close' | 'none' {
  return state === 'open' && !searchWillHandle ? 'close' : 'none';
}
