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

## Addendum (2026-10-09, tras el deploy con la CSP obligatoria): la revisión con curl era insuficiente

Con Chrome headless + CDP sobre producción (las 7 páginas de REQ-64-08), **todas** las
páginas cargan `https://static.cloudflareinsights.com/beacon.min.js/...` (Cloudflare Web
Analytics, inyectado en el borde) y la CSP obligatoria lo bloquea:
`Loading the script '...beacon.min.js...' violates ... "script-src 'self' 'unsafe-inline'"`.
Cloudflare solo lo inyecta a navegadores, no a curl, y por eso la revisión anterior no lo vio.
Por lo demás producción funciona igual: la isla HTB da 200, el buscador da resultados, el
botón Copiar funciona y el iframe de youtube-nocookie da 200. Sin violaciones de recursos propios.
La condición de parada de REQ-64-07 se cumple, así que la feature 64 queda en blocked a la
espera de la decisión humana:
(a) permitir Web Analytics: `script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com`
    y `connect-src 'self' https://cloudflareinsights.com`; o
(b) desactivar Web Analytics en el panel de Cloudflare y mantener la política actual.

## Enmienda (2026-10-09, spec_author): se permite Cloudflare Web Analytics (opción (a))

**Decisión humana explícita:** «permite las web analitics». Se descarta la opción (b).

### Qué requiere Cloudflare (fuente oficial)

FAQ oficial de Web Analytics, «What do I need to add to my Content Security Policy (CSP)?»
(https://developers.cloudflare.com/web-analytics/faq/):

- `script-src [...] https://static.cloudflareinsights.com/beacon.min.js` para descargar el beacon.
- `connect-src [...] 'self'` con **inyección automática** (sitio proxied): el beacon reporta al
  `/cdn-cgi/rum` del propio dominio (misma FAQ: «automatic setup will report stats back to your
  own domain's /cdn-cgi/rum endpoint»).
- `connect-src [...] cloudflareinsights.com` solo con el **snippet manual**.

Comprobado en producción (curl con User-Agent de Chrome, que sí recibe la inyección):
`<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js/v4bc70e2c01a94c73b74392e4234840661791215815920" integrity="sha512-..." data-cf-beacon='{"version":"2024.11.0","token":"...","r":1,"spa":2}' crossorigin="anonymous">`.
No lleva clave `send` → inyección automática → los datos van a `'self'`/cdn-cgi/rum.

### Decisiones y justificación

1. **script-src con el origen, no con la ruta.** La ruta real está versionada
   (`/beacon.min.js/v...`). En CSP una ruta sin `/` final exige coincidencia exacta, así que la
   fuente `https://static.cloudflareinsights.com/beacon.min.js` de la FAQ **no** casaría y el
   beacon se seguiría bloqueando. Se usa `https://static.cloudflareinsights.com` (lo que propuso
   el líder). Riesgo acotado: el host solo sirve scripts de Cloudflare y la inyección lleva SRI.
2. **connect-src 'self' https://cloudflareinsights.com.** `'self'` es imprescindible por dos
   motivos: es el destino real de la inyección automática y, al declarar `connect-src`, esta deja
   de heredar `default-src 'self'` (lo usan server islands, ClientRouter y el índice de búsqueda).
   `https://cloudflareinsights.com` cubre el modo manual (petición del líder); hoy no se usa,
   pero es inocuo y evita romper la telemetría si Cloudflare cambia el modo.
3. **No hace falta ningún otro origen.** `beacon.min.js` no carga imágenes, estilos ni iframes;
   `cloudflareinsights.com` sin subdominio basta para el POST del modo manual. No se añade
   `img-src` ni `style-src`.
4. Política vigente (REQ-64-11, sustituye a REQ-40-06; REQ-40 está done y no se reescribe su
   spec, la sustitución queda registrada en la cabecera de specs/64_csp-enforce/requirements.md):
   `default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; connect-src 'self' https://cloudflareinsights.com; frame-src https://www.youtube-nocookie.com https://www.youtube.com; frame-ancestors 'none'; base-uri 'self'; object-src 'none'`

### REQ-64-07 resuelto

El único origen no permitido hallado con Chrome (static.cloudflareinsights.com) queda permitido
por la decisión humana. REQ-64-07 se reformula contra la política de REQ-64-11: si aparece otro
origen, la feature vuelve a pararse.

### Tests afectados (precedente REQ-43-06)

- `tests/csp-enforce.test.mjs`: constante `CSP` → valor de REQ-64-11 (REQ-64-01/02/03/11/13).
  El test de build (REQ-64-05) parsea las directivas de `CSP`, así que sigue válido; pero el build
  **no contiene** el beacon (se inyecta en el borde), de ahí REQ-64-12: el test aplica `allowed()`
  a la URL real versionada como `script` (aceptada) y a un origen ajeno (rechazado).
- `tests/security-headers.test.mjs`: constante `CSP` de REQ-40 → valor de REQ-64-11 con nota.

### Verificación real (REQ-64-14/15)

- Local (implementer): `astro preview` + Chrome headless + CDP en las 7 páginas de REQ-64-08,
  cero violaciones. En local no hay inyección, así que esto no prueba el beacon.
- Producción (humano, tras el deploy): Chrome headless + CDP sobre https://moisesbaldenegro.com,
  cero violaciones, beacon con 200 y POST a /cdn-cgi/rum sin bloqueo de connect-src.

### Backlog

Feature 64: `blocked` → `pending`; `blocked_reason` eliminado (el validador no lo exige y ya no
hay bloqueo); description y acceptance enmendados (15 criterios, REQ-64-01..15). Sigue con
`depends_on: [68]`.
