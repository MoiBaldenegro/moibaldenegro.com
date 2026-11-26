// Middleware de Astro.
// - Feature 40 (security-headers, REQ-40-03/04): cada respuesta generada por el Worker recibe
//   las cabeceras de seguridad, porque public/_headers solo se aplica a los assets estáticos.
// - Feature 68 (REQ-68-07..09): 301 de los slugs antiguos de posts (antes en `redirects` de
//   astro.config.mjs, que generaba un _redirects inválido para Cloudflare).
// - Feature 116 (REQ-116-05/06): 301 de la raíz '/' a la página de perfil (la portada vive en /home).
// - Feature 14 (REQ-14-07/08): la página de perfil es /whoami; /about responde 301 a /whoami.
// - Issue #4 (modo mantenimiento): con IN_MAINTENANCE activo, toda navegación responde 503 con
//   la página de mantenimiento (y sus assets siguen sirviéndose). Se lee primero el binding de
//   runtime de Cloudflare y, si no existe, el flag compilado en build.
import type { MiddlewareHandler } from 'astro';
import { env } from 'cloudflare:workers';
import { withSecurityHeaders } from './domain/http/security-headers.ts';
import { legacyRedirect } from './domain/http/legacy-redirects.ts';
import { rootRedirect } from './domain/http/root-redirect.ts';
import { maintenanceResponse, shouldServeMaintenance } from './domain/http/maintenance.ts';

function maintenanceFlag(): unknown {
  const runtime = (env as unknown as Record<string, unknown> | undefined)?.IN_MAINTENANCE;
  return runtime ?? import.meta.env.IN_MAINTENANCE;
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const url: URL | undefined = context?.url;
  if (url && shouldServeMaintenance(maintenanceFlag(), url.pathname)) {
    return withSecurityHeaders(maintenanceResponse());
  }
  const target = url ? (legacyRedirect(url.pathname) ?? rootRedirect(url.pathname)) : null;
  if (target !== null) {
    return withSecurityHeaders(new Response(null, { status: 301, headers: { Location: `${target}${url?.search ?? ''}` } }));
  }
  return withSecurityHeaders(await next());
};
