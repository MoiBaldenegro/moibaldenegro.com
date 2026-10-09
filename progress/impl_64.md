# Informe de implementación — feature 64 csp-enforce

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible). Spec enmendada el 2026-10-09 (REQ-64-11..15) por decisión humana: «permite las
web analitics».

## Revisión de producción (REQ-64-07)

- Ronda 1 (curl, sin JS): cero orígenes no permitidos. Era insuficiente.
- Tras el deploy con la CSP obligatoria, Chrome real + CDP sobre las 7 páginas de
  https://moisesbaldenegro.com mostró un único origen bloqueado:
  `https://static.cloudflareinsights.com/beacon.min.js/v4bc70e...`. Es Cloudflare Web Analytics,
  inyectado en el borde solo a navegadores. La feature se detuvo (blocked) y se registró en
  progress/current.md y progress/research/csp_production_review.md.
- Decisión humana: permitirlo (REQ-64-11). Ningún otro origen externo: la isla HTB es del mismo
  origen y el iframe de youtube-nocookie ya estaba permitido.

## Ciclo rojo/verde (REQ-64-09, REQ-64-13)

- Paso 1 (Report-Only → obligatoria): `tests/csp-enforce.test.mjs` escrito primero.
  ROJO 2/6 pass, 4 fail (REQ-64-01..04); VERDE 6/6.
- Paso 2 (política de REQ-64-11): constantes CSP de csp-enforce.test.mjs y
  security-headers.test.mjs actualizadas y tests REQ-64-11/12 añadidos. Con la política
  anterior en el módulo: ROJO 8 pass / 7 fail (REQ-40-01/02/03/05 y REQ-64-01/02/03).
  VERDE 15/15.
- Suite completa 786/786; `./init.sh` en verde.

## Cambios

- `src/domain/http/security-headers.ts` (37 líneas): clave `Content-Security-Policy` (antes la
  Report-Only) con la política de REQ-64-11:
  `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`
  Comentarios actualizados (modo obligatorio y motivo de Web Analytics).
- `public/_headers`: misma CSP obligatoria en la regla `/*`.
- `tests/csp-enforce.test.mjs` (nuevo, 100 líneas): REQ-64-01..06 y 10..12. El test de build
  valida los src/href de script, link, img e iframe de todos los HTML contra su directiva, y que
  no haya eval/new Function en _astro/*.js.
- `tests/security-headers.test.mjs` (precedente REQ-43-06): EXPECTED usa la clave obligatoria
  y la política de REQ-64-11.

## Verificación real

### Local, astro preview + Chrome headless + CDP (REQ-64-08, REQ-64-14)

Cabecera servida: la política de REQ-64-11 (comprobada con curl -I).

| página | violaciones | errores CSP en consola | extra |
|--------|-------------|------------------------|-------|
| / | 0 | 0 | isla HTB `/_server-islands/...` → 200 |
| /about/ | 0 | 0 | |
| /search?q=solid | 0 | 0 | 2 resultados |
| /architecture/ (término) | 0 | 0 | |
| /posts/03-principios-solid/ | 0 | 0 | botón Copiar → «Código copiado» (con foco emulado) |
| /posts/02-principios-del-diseno-de-software/ | 0 | 0 | iframe youtube-nocookie → 200 |
| /posts/no-existe/ (404) | 0 | 0 | |

Simulación de la inyección de Cloudflare sobre / y un post: se insertó el
`<script src="https://static.cloudflareinsights.com/beacon.min.js/v4bc70e...">` real → `loaded`,
y un POST no-cors a `https://cloudflareinsights.com/cdn-cgi/rum` → `sent`, con 0 violaciones.
El único fallo de red, `net::ERR_ABORTED`, no es de CSP: lo provoca la telemetría del beacon
contra un endpoint que en local no existe.

### Producción (REQ-64-15)

Pendiente del deploy humano de esta versión. Después se repite el script CDP contra
https://moisesbaldenegro.com y se espera: 0 violaciones y beacon 200.
