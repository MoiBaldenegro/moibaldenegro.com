# Revisión del HTML de producción para la CSP obligatoria (feature 64, REQ-64-07)

Fecha: 2026-10-09. Autor: líder. Dominio real: https://moisesbaldenegro.com. El humano
confirma que moibaldenegro.com no existe (NXDOMAIN) y desactivó el desafío anti-bots de
Cloudflare para permitir la revisión. Antes respondía 403 con `cf-mitigated: challenge`.

## Método

`curl` (sin JS) de `/`, `/about`, `/search` y `/posts/02-principios-del-diseno-de-software/`.
En cada página se extrajeron los `src`/`href` absolutos y los `<script>` (externos e inline).
Además se buscaron las huellas de inyección de Cloudflare: `cloudflareinsights`
(Web Analytics), `/cdn-cgi/` (email-decode, challenge-platform), `rocket-loader` y `beacon`.

## Resultado

- Las cuatro páginas responden 200 (`server: cloudflare`, `cf-cache-status: HIT`).
- **No hay ningún script ni recurso inyectado por Cloudflare**: cero coincidencias de
  cloudflareinsights, cdn-cgi, rocket-loader, email-decode, challenge-platform y beacon.
- Orígenes externos encontrados:
  - `https://www.youtube.com/embed/DyDfgMOUjCI` (iframe del post 02). Está permitido por
    `frame-src`. El código actual ya usa youtube-nocookie (feature 39), también permitido.
  - `https://x.com/moibaldenegro` (enlace `<a>`, navegación). No es un recurso: la CSP no lo afecta.
- Scripts: módulos `/_astro/*.js` (`'self'`), el cargador inline de server islands
  (`'unsafe-inline'`) y un `application/json` de datos (despliegue antiguo con el índice
  embebido, que no se ejecuta).

## Observaciones

- Producción sirve el **despliegue antiguo**: lleva el índice de búsqueda embebido
  (feature 46 aún no desplegada) y no lleva las cabeceras de seguridad (features 40/45). Las
  features 31-63 están en el working tree sin desplegar.
- Conclusión para REQ-64-07: ningún origen de producción queda fuera de la política
  `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline';
  script-src 'self' 'unsafe-inline'; frame-src https://www.youtube-nocookie.com
  https://www.youtube.com; ...`. La condición de bloqueo de la 64 desaparece. Si en el
  futuro se activa Cloudflare Web Analytics, habrá que añadir
  `script-src https://static.cloudflareinsights.com` y
  `connect-src https://cloudflareinsights.com`.
