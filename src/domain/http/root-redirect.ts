// Redirección de la raíz (feature 116, REQ-116-04): la portada vive en /home y la raíz '/'
// responde siempre 301 a '/about'. Función pura; la invoca src/middleware.ts junto a
// legacyRedirect. Solo el pathname '/' exacto redirige; cualquier otro devuelve null.

const ROOT_TARGET = '/about';

/** Destino de la raíz o null si el pathname no es '/'. */
export function rootRedirect(pathname: string): string | null {
  return pathname === '/' ? ROOT_TARGET : null;
}
