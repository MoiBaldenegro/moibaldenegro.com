# Handoff

Estado en que quedó la última corrida. Cada corrida lo reescribe al terminar.

- Estado: issue #4 (aplicar `IN_MAINTENANCE` en runtime) resuelto.
- Cambios:
  - `src/domain/http/maintenance.ts`: interpretación del flag, clasificación de assets y respuesta 503 HTML (`Cache-Control: no-store`, `Retry-After`).
  - `src/middleware.ts`: con el flag activo responde mantenimiento (con `withSecurityHeaders`) antes de las redirecciones; lee `env.IN_MAINTENANCE` de `cloudflare:workers` y cae a `import.meta.env.IN_MAINTENANCE`.
  - `public/maintenance.css`: hoja estática de la página (colores del sistema, sin hash).
  - `tests/maintenance-mode.test.mjs`: cubre flag false (nada se bloquea), flag true (páginas 503), assets permitidos, 503 HTML y cabeceras de seguridad.
  - `/home`, `/whoami`, `/search` y `/posts/[id]` pasaron a `prerender = false` para que el middleware pueda interceptarlos en runtime (si son assets estáticos, Cloudflare los sirve antes del Worker).
- Verificación: `pnpm test` 139/139 y `./init.sh` en verde. Con `wrangler dev --var IN_MAINTENANCE:true` (build de producción): `/`, `/home`, `/whoami`, `/posts/*`, `/search` → 503 con el HTML; `/maintenance.css` y `/favicon.ico` → 200. Sin la variable: `/` → 301, páginas → 200.
- Siguiente paso: documentar el toggle de mantenimiento en producción (variable `IN_MAINTENANCE` en Cloudflare/Wrangler) y revisar visualmente la página 503.
