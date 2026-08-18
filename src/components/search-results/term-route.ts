// Utilidades puras de la ruta por término (feature 7 root-term-search,
// REQ-07-03/04/10). Lógica separada de la UI (regla 8): funciones sin
// document/window en ámbito de módulo, testeables por import directo.

// REQ-07-03: extrae el término de /<término> cuando no hay ?q=. Decodifica
// (decodeURIComponent), quita slashes iniciales/finales y normaliza
// multi-segmento (slashes → espacios, p. ej. '/search/foo' → 'search foo').
// '/search' (vista dedicada sin q) devuelve '' → guía (REQ-03-03).
export function termFromPathname(pathname: string): string {
  const raw = decodeURIComponentSafe(pathname)
    .replace(/^\/+|\/+$/g, '')
    .replace(/\/+/g, ' ')
    .trim();
  return raw === 'search' ? '' : raw;
}

// REQ-07-10: en /<término> no hay parámetro q que quitar; limpiar navega a
// la raíz del sitio. En /search (sin término) no hay nada que limpiar y se
// devuelve el propio path (no-op defensivo, nunca visible en la UI).
export function clearDestination(pathname: string): string {
  return termFromPathname(pathname) === '' ? pathname : '/';
}

// decodeURIComponent lanza URIError con UTF-8 malformado (p. ej.
// '/%E0%A4%A'): se degrada al pathname crudo sin decodificar — la página de
// resultados nunca rompe por la URL (errores explícitos solo en el dominio).
function decodeURIComponentSafe(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}