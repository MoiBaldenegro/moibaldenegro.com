// Metadatos SEO del head (feature 35 seo-head-base, REQ-35-02/03/07/08).
// Funciones puras: el Layout solo pasa datos (lógica fuera de la UI).
export const BRAND = 'moisesbaldenegro.com';

// Texto de presentación del sitio (el mismo que muestra /about): descripción
// de la portada y de /about (REQ-35-07).
export const SITE_DESCRIPTION =
  'Articulos dedicados a la ingeniería de software aplicada, ejemplos, arquitectura, implementaciones y proyectos mas cercanos a proyectos reales.';

// Texto de la guía de la vista de búsqueda (descripción de /search).
export const SEARCH_DESCRIPTION =
  'Escribe un término en la barra de búsqueda o visita /search?q=término para encontrar artículos por título, descripción, etiquetas o contenido.';

export const NOT_FOUND_DESCRIPTION = 'La página que buscas no existe o cambió de dirección.';

// «<título> | moisesbaldenegro.com»; sin título, la marca; si el título ya la
// contiene (p. ej. «About — moisesbaldenegro.com»), no la repite.
export function composeTitle(title?: string): string {
  const clean = title?.trim() ?? '';
  if (clean === '') return BRAND;
  return clean.includes(BRAND) ? clean : `${clean} | ${BRAND}`;
}

// URL absoluta del pathname sobre el site configurado (new URL codifica
// espacios y caracteres no ASCII).
export function canonicalUrl(pathname: string, site: string | URL): string {
  return new URL(pathname, site).href;
}
