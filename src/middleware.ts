// Middleware de Astro.
// - Feature 40 (security-headers, REQ-40-03/04): cada respuesta generada por el Worker recibe
//   las cabeceras de seguridad, porque public/_headers solo se aplica a los assets estáticos.
// - Feature 68 (REQ-68-07..09): 301 de los slugs antiguos de posts (antes en `redirects` de
//   astro.config.mjs, que generaba un _redirects inválido para Cloudflare).
// - Feature 116 (REQ-116-05/06): 301 de la raíz '/' a '/about' (la portada vive en /home).
import type { MiddlewareHandler } from 'astro';
import { withSecurityHeaders } from './domain/http/security-headers.ts';
import { legacyRedirect } from './domain/http/legacy-redirects.ts';
import { rootRedirect } from './domain/http/root-redirect.ts';

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url: URL | undefined = context?.url;
  const target = url ? (legacyRedirect(url.pathname) ?? rootRedirect(url.pathname)) : null;
  if (target !== null) {
    return withSecurityHeaders(new Response(null, { status: 301, headers: { Location: `${target}${url?.search ?? ''}` } }));
  }
  return withSecurityHeaders(await next());
};
