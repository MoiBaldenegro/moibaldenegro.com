// Middleware de Astro (feature 40 security-headers, REQ-40-03/04): cada
// respuesta generada por el Worker recibe las cabeceras de seguridad, porque
// public/_headers solo se aplica a los assets estáticos.
import type { MiddlewareHandler } from 'astro';
import { withSecurityHeaders } from './domain/http/security-headers.ts';

export const onRequest: MiddlewareHandler = async (_context, next) => withSecurityHeaders(await next());
