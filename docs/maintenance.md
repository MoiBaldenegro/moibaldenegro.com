# Modo mantenimiento en producción

Guía para activar y desactivar el modo mantenimiento del sitio sin recompilar ni
volver a desplegar código. El comportamiento lo define
`src/domain/http/maintenance.ts` y lo conecta `src/middleware.ts`.

## Cómo funciona

- El flag es `IN_MAINTENANCE`. En `astro.config.mjs` está declarado como variable
  pública con `default: false`, así que el build y `./init.sh` funcionan sin
  definirla.
- `src/middleware.ts` (`maintenanceFlag`) lee **primero** el binding de runtime
  `env.IN_MAINTENANCE` (de `cloudflare:workers`) y, si no existe, cae a
  `import.meta.env.IN_MAINTENANCE` (valor compilado en build).
- `parseMaintenanceFlag` considera activo cualquier valor `true`, `1`, `on` o
  `yes` (sin distinguir mayúsculas). Cualquier otro valor —o la ausencia de la
  variable— lo desactiva.
- Con el flag activo, `shouldServeMaintenance` devuelve `true` para toda ruta que
  no sea un asset estático y el middleware responde `maintenanceResponse()`:
  estado `503`, cuerpo `MAINTENANCE_HTML`, `Cache-Control: no-store`,
  `Retry-After: 3600` y las cabeceras de seguridad de `withSecurityHeaders`.

## Activar / desactivar sin rebuild

La variable se lee en runtime, así que cambiarla no exige `pnpm build` ni subir
código nuevo. La vía recomendada es el panel de Cloudflare:

1. Entra en **Workers & Pages → `moibaldenegro-web` → Settings → Variables and
   Secrets** (variables de texto, no secretos).
2. Crea o edita `IN_MAINTENANCE` con valor `true` para activar y `false` para
   desactivar.
3. Guarda y despliega la nueva versión del Worker. Cloudflare reutiliza el código
   ya publicado: solo cambia el binding, no se recompila el sitio.

Alternativa con Wrangler (requiere desplegar, pero no recompilar): añade
`"vars": { "IN_MAINTENANCE": "true" }` a `wrangler.jsonc` y ejecuta
`pnpm exec wrangler deploy`, o pasa la variable en el despliegue con
`pnpm exec wrangler deploy --var IN_MAINTENANCE:true`.

## Qué responde 503

Toda petición de navegación que llega al Worker y no es un asset estático:

- `/`, `/home`, `/whoami`, `/search` y `/posts/<slug>`.
- El catch-all `[...term].astro`, incluidas las rutas que responderían `404`.
- En general, cualquier pathname que no encaje en la lista de assets de abajo.

Solo las rutas con `prerender = false` pasan por el middleware. Por eso `/home`,
`/whoami`, `/search`, `/posts/[id]` y el catch-all son runtime: un HTML
prerenderizado se serviría como asset de Cloudflare y esquivaría el Worker.

## Qué sigue disponible

Los assets necesarios para pintar la página de mantenimiento y los estáticos que
Cloudflare sirve directamente (sin pasar por el middleware):

- Archivos de `public/`: `/maintenance.css`, `/favicon.ico`,
  `/favicon-96x96.png`, `/site.webmanifest`, `/apple-touch-icon.png`.
- Assets hasheados del build: `/_astro/*` (CSS, JS, fuentes), `/assets/*`
  (imágenes) y `/cdn-cgi/*`.
- Endpoints prerenderizados: `/robots.txt`, `/sitemap.xml`, `/cv.pdf`,
  `/search-index.json`.
- Cualquier pathname con extensión de asset (`css`, `js`, `mjs`, `woff2`, `ttf`,
  `otf`, `eot`, `png`, `jpg`, `jpeg`, `webp`, `avif`, `gif`, `svg`, `ico`,
  `webmanifest`).

La clasificación vive en `isStaticAssetPath` (`ASSET_PREFIXES` y `ASSET_PATH` en
`src/domain/http/maintenance.ts`); si añades una ruta que la página necesita,
actualiza esa lista y esta guía.

## Cómo comprobarlo

Local (tras `pnpm build`):

```bash
pnpm exec wrangler dev --var IN_MAINTENANCE:true
curl -sI http://127.0.0.1:8787/                 # 503 + retry-after
curl -sI http://127.0.0.1:8787/whoami           # 503
curl -sI http://127.0.0.1:8787/maintenance.css  # 200
curl -sI http://127.0.0.1:8787/favicon.ico      # 200
```

Producción (con el flag activo):

```bash
curl -sI https://moisesbaldenegro.com/                 # 503
curl -sI https://moisesbaldenegro.com/posts/<slug>     # 503
curl -sI https://moisesbaldenegro.com/maintenance.css  # 200
curl -sI https://moisesbaldenegro.com/favicon.ico      # 200
curl -sI https://moisesbaldenegro.com/robots.txt       # 200
```

La respuesta `503` debe incluir `Cache-Control: no-store` y `Retry-After`. En el
navegador, una ventana privada debe mostrar la página «Sitio en mantenimiento»
con su CSS cargado (200 en la pestaña Network).

Para desactivarlo, pon `IN_MAINTENANCE` en `false` (o elimínala) y comprueba que
`/` vuelve a responder `301` hacia `/whoami` y que las páginas responden `200`.

## Comprobación automática (smoke)

`scripts/check-maintenance-smoke.mjs` automatiza las comprobaciones anteriores
contra una URL base configurable. Usa solo la librería estándar de Node, no forma
parte del build y sale con código `0` si todo cuadra y distinto de `0` si algo
falla (útil en CI o antes de cerrar un despliegue).

Con el flag activo (`--mode on`, por defecto):

```bash
node scripts/check-maintenance-smoke.mjs --base-url http://127.0.0.1:8787 --mode on
# exige 503 + Cache-Control: no-store en / y /whoami,
# y 200 en /maintenance.css y /favicon.ico
```

Con el flag desactivado (`--mode off`):

```bash
node scripts/check-maintenance-smoke.mjs --base-url http://127.0.0.1:8787 --mode off
# exige que / responda 301
```

La URL base por defecto es `http://127.0.0.1:8787` (el `wrangler dev` local). El
test del script vive en `tests/maintenance-smoke.test.mjs`.

## Referencias

- `scripts/check-maintenance-smoke.mjs` — check de humo del toggle (issue #7).
- `src/domain/http/maintenance.ts` — flag, clasificación de assets y respuesta 503.
- `src/middleware.ts` — lectura del binding de runtime y conexión con el middleware.
- `astro.config.mjs` — `IN_MAINTENANCE` en el env schema (`default: false`).
- `tests/maintenance-mode.test.mjs`, `tests/maintenance-env.test.mjs` y `tests/maintenance-smoke.test.mjs` — tests del modo y del check de humo.
