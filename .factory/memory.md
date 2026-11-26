# Memoria de moibaldenegro.com

Decisiones, convenciones y aprendizajes que cualquier agente futuro debe conocer.
Agrega entradas cortas y fechadas; no borres las de otros salvo que ya no sean ciertas.

## 2026-11-26

- Los proyectos destacados de `/whoami` viven en `src/data/about.json` (`projects[]`) y los renderiza `src/components/about/about-projects.astro` vía `AboutRepository`. Para añadir/quitar proyectos se edita solo ese JSON (test: `tests/about-projects.test.mjs`).
- `IN_MAINTENANCE` es un flag público (env schema de Astro) con `default: false` desde el issue #3, así que `pnpm build` y `./init.sh` corren sin definirla a mano. El entorno/.env puede sobrescribirlo. Test: `tests/maintenance-env.test.mjs`. No es secreto.
- `tests/mxvi-foundation.test.mjs` fallaba en Windows: el manifiesto MXVI guarda hashes LF y rutas POSIX, pero el checkout trae CRLF y `\`. Ya normaliza ambos antes de comparar; no tocar la copia `src/styles/mxvi/` a mano.

- 2026-11-26: Guía de operación del mantenimiento (issue #5) en `docs/maintenance.md` (enlazada desde el README). Canon: activar/desactivar `IN_MAINTENANCE` en el dashboard de Cloudflare no requiere rebuild porque `src/middleware.ts` lee el binding de runtime `env.IN_MAINTENANCE`; los assets estáticos (`/maintenance.css`, favicons, `/_astro/`, `/assets/`, `/cdn-cgi/` y endpoints prerenderizados) los sirve Cloudflare sin pasar por el middleware. Test de coherencia: `tests/maintenance-docs.test.mjs`.
- 2026-11-26: Modo mantenimiento real (issue #4). `src/domain/http/maintenance.ts` decide con `parseMaintenanceFlag`/`shouldServeMaintenance` (503 para navegación, assets de render permitidos: `/_astro/`, `/assets/`, `/cdn-cgi/` y extensiones css/js/fuentes/imágenes/ico/webmanifest). `src/middleware.ts` lee primero el binding runtime `env.IN_MAINTENANCE` de `cloudflare:workers` (string) y cae a `import.meta.env.IN_MAINTENANCE` (build). La respuesta 503 usa el HTML de mantenimiento y pasa por `withSecurityHeaders`. Para que el middleware intercepte de verdad, `/home`, `/whoami`, `/search` y `/posts/[id]` dejaron de ser `prerender` (un HTML prerenderizado se sirve como asset de Cloudflare y esquiva el middleware); `404` y los endpoints (`robots`, `sitemap`, `cv.pdf`, `search-index.json`) siguen estáticos. Test: `tests/maintenance-mode.test.mjs`. Verificado con `wrangler dev --var IN_MAINTENANCE:true` (503) y sin var (200/301).
