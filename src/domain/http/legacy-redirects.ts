// Redirecciones 301 de los slugs antiguos de posts (feature 45 → feature 68). Antes vivían
// en `redirects` de astro.config.mjs, pero el adapter de Cloudflare las volcaba a
// dist/client/_redirects y el slug con espacio («03-principios solid») producía líneas de
// 4 tokens que Cloudflare rechaza, rompiendo el deploy. Ahora las resuelve el middleware.
// Función pura: decodifica el pathname, normaliza a NFC y tolera la barra final.

const LEGACY: Readonly<Record<string, string>> = Object.freeze({
  '/posts/03-principios solid': '/posts/03-principios-solid',
  '/posts/01-diseño-detallado': '/posts/01-diseno-detallado',
  '/posts/02-ciclo-de-vida-y-arquitectura': '/posts/04-ciclo-de-vida-y-arquitectura',
});

/** Destino del slug antiguo o null si el pathname no es uno de ellos (o no se puede decodificar). */
export function legacyRedirect(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const key = decoded.normalize('NFC').replace(/\/+$/, '');
  return Object.hasOwn(LEGACY, key) ? LEGACY[key] : null;
}
