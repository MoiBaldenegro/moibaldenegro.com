// Cabeceras de seguridad (feature 40 security-headers, REQ-40-01/04/06).
// Única fuente de verdad: public/_headers replica estos valores para los
// assets estáticos (páginas prerenderizadas) y src/middleware.ts los añade a
// las respuestas que genera el Worker ([...term], server islands, 404).
// CSP obligatoria (feature 64, tras revisar producción: progress/research/
// csp_production_review.md; antes solo-reporte, feature 40). 'unsafe-inline' lo
// exigen los scripts inline de las server islands y code-copy y los estilos
// inline de Shiki; la CSP nativa de Astro no admite <ClientRouter /> ni Shiki.
// Cloudflare Web Analytics (feature 64, REQ-64-11, decisión humana): el beacon se inyecta en el
// borde desde static.cloudflareinsights.com y reporta a /cdn-cgi/rum ('self') o cloudflareinsights.com.
export const SECURITY_HEADERS: Readonly<Record<string, string>> = Object.freeze({
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'X-Frame-Options': 'DENY',
  'Content-Security-Policy':
    "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; " +
    "script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; " +
    "frame-src https://www.youtube-nocookie.com https://www.youtube.com; " +
    "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
});

// Añade las cabeceras que falten sin pisar las que ya trae la respuesta
// (REQ-40-04). Si las cabeceras son inmutables (p. ej. Response.redirect),
// se copia la respuesta conservando estado, cuerpo y cabeceras.
export function withSecurityHeaders(response: Response): Response {
  const missing = Object.entries(SECURITY_HEADERS).filter(([name]) => !response.headers.has(name));
  if (missing.length === 0) return response;
  let target = response;
  try {
    for (const [name, value] of missing) target.headers.set(name, value);
  } catch {
    target = new Response(response.body, response);
    for (const [name, value] of missing) target.headers.set(name, value);
  }
  return target;
}
