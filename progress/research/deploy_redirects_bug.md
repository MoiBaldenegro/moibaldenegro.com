# Análisis — Bug de deploy por _redirects inválido (feature 68 legacy-redirects-middleware)

Fecha: 2026-10-09 · Autor: spec_author

## Qué es

Todos los deploys a Cloudflare fallan con `Invalid _redirects configuration ... Expected exactly 2 or 3
whitespace-separated tokens. Got 4 [code: 100324]`. El adapter `@astrojs/cloudflare` traduce la clave
`redirects` de `astro.config.mjs:11-15` (introducida por la feature 45, REQ-45-04) a `dist/client/_redirects`.
Contenido real (espacios colapsados):

```
/posts/03-principios solid/ /posts/03-principios-solid 301      <- 4 tokens (espacio crudo en el origen)
/posts/03-principios solid /posts/03-principios-solid 301       <- 4 tokens
/posts/02-ciclo-de-vida-y-arquitectura/ /posts/04-ciclo-de-vida-y-arquitectura 301
/posts/02-ciclo-de-vida-y-arquitectura /posts/04-ciclo-de-vida-y-arquitectura 301
/posts/01-diseño-detallado/ /posts/01-diseno-detallado 301      <- ñ cruda (UTF-8 sin codificar)
/posts/01-diseño-detallado /posts/01-diseno-detallado 301
```

Las líneas 1-2 rompen el parser de Cloudflare. Las de la ñ son válidas sintácticamente, pero la petición del
navegador llega como `%C3%B1` y no está garantizado que Cloudflare compare contra la forma decodificada.

## Decisión

Se adopta la propuesta del líder con un ajuste: se mueven **las tres** redirecciones (incluida la ASCII de 02→04)
al middleware, no solo las dos problemáticas, para tener una única fuente de verdad y no volver a generar
`_redirects`. Alternativa descartada: `public/_redirects` escrito a mano con `%20`/`%C3%B1` — depende de cómo
Cloudflare normaliza la ruta antes de comparar (no verificable sin deploy) y deja dos mecanismos.

- `src/domain/http/legacy-redirects.ts`: función pura `legacyRedirect(pathname)`; quita la barra final,
  `decodeURIComponent` en try/catch (escape inválido → null), `normalize('NFC')` (ñ descompuesta de macOS),
  y busca en un mapa de tres entradas.
- `src/middleware.ts`: si hay `context.url` y `legacyRedirect` devuelve destino → `new Response(null, 301,
  Location: destino + search)` pasada por `withSecurityHeaders`; si no, el flujo actual.
- Los posts son prerender: las URLs antiguas no son assets, así que Cloudflare las entrega al Worker.

## Qué toca

astro.config.mjs (quitar `redirects` y su comentario), src/middleware.ts, src/domain/http/legacy-redirects.ts
(nuevo), tests/legacy-redirects.test.mjs (nuevo), tests/ascii-post-slugs.test.mjs (REQ-45-04 pasa a verificar el
módulo; REQ-45-05 amplía su exclusión al test nuevo; notas con precedente REQ-43-06).

## Riesgos y trabas

- `tests/security-headers.test.mjs` llama `onRequest({}, next)`: el middleware debe tolerar contexto sin url (REQ-68-09).
- REQ-45-05 prohíbe citar slugs antiguos en otros tests: hay que ampliar su exclusión.
- `Response.redirect` exige URL absoluta: usar `new Response` con Location relativa.
- Verificación real: `astro preview` (workerd) + curl de las URLs codificadas (`%20`, `%C3%B1`) con y sin barra.
- No verificable en local: el deploy en sí; tras implementar, el humano relanza el deploy.

## Prioridad y dependencias

68 se implementa primero: sin deploy no se puede validar nada en producción. Se añade `depends_on: [68]` a
65 (alto de imágenes: verificación visual en producción), 66 (dominio: toca astro.config.mjs, mismo archivo que
68, y su validación es en producción) y 67 (por orden: evita que el arnés la elija antes que el arreglo del
deploy). 64 (csp-enforce) pasa de blocked a pending: el líder revisó el HTML de producción de
https://moisesbaldenegro.com sin encontrar orígenes no permitidos (progress/research/csp_production_review.md),
lo que satisface la condición de REQ-64-07; se elimina su `blocked_reason` (el validador no lo exige) y declara
`depends_on: [68]`, porque cambiar la CSP a obligatoria requiere poder desplegar y comprobarla en producción.
