# Informe de implementación — feature 40 security-headers

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/40_security-headers/requirements.md` (sin design.md). La carpeta
  `specs/40_post-readability/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/domain/http/security-headers.ts` (NUEVO, 34 líneas) | `SECURITY_HEADERS` (`Object.freeze`) con las 5 cabeceras y la CSP Report-Only exacta de REQ-40-06; `withSecurityHeaders(response)` añade solo las que faltan (REQ-40-04) y, si las cabeceras son inmutables (p. ej. `Response.redirect`), copia la respuesta con `new Response(body, response)` conservando estado y cabeceras. |
| `src/middleware.ts` (NUEVO, 7 líneas) | `onRequest: MiddlewareHandler` → `withSecurityHeaders(await next())` (REQ-40-03). Sin `astro:middleware` (módulo virtual) para que sea testeable por import directo; el tipo es `import type`. |
| `public/_headers` (NUEVO) | Regla `/*` con las mismas 5 cabeceras y valores (REQ-40-02). |
| `tests/security-headers.test.mjs` (NUEVO) | Valores exactos y objeto congelado; `public/_headers` parseado = módulo; middleware con `next()` simulado (añade, conserva `Referrer-Policy: no-referrer`, y cubre una redirección con cabeceras inmutables); build a outDir temporal (helper `astro-build.mjs`): `_headers` con `/*` y `/_astro/*` inmutable (REQ-40-05). |

## Verificación del build

`dist/client/_headers`: el adapter añade su regla `/_astro/*` (Cache-Control inmutable) y conserva la
regla `/*` de `public/_headers`. El middleware entra en el bundle del Worker
(`dist/server/virtual_astro_middleware.mjs` contiene los valores).

## Ciclo rojo/verde (REQ-40-07)

Rojo — antes de crear `src/`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\http\security-headers.ts'
ℹ pass 0 / ℹ fail 1
```

Verde — el test nuevo pasa 7/7; `./init.sh`: formato ✔, tests ✔ (628/628), build ✔.

## Pendiente (operativo, fuera del código)

- HSTS y «Always Use HTTPS» se activan en la zona de Cloudflare al conectar el dominio (NXDOMAIN
  hoy). Las cabeceras reales en producción quedan por verificar con `curl -I` cuando resuelva.
- Pasar la CSP de Report-Only a enforcement es una decisión posterior, tras revisar los reportes.
