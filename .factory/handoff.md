# Handoff

Estado en que quedó la última corrida. Cada corrida lo reescribe al terminar.

- Estado: issue #5 (documentar el toggle de mantenimiento en producción) resuelto.
- Cambios:
  - `docs/maintenance.md`: guía nueva con el flag `IN_MAINTENANCE` (runtime
    `env.IN_MAINTENANCE` → fallback `import.meta.env.IN_MAINTENANCE`), cómo
    activarlo/desactivarlo en Cloudflare sin recompilar (dashboard o
    `wrangler deploy --var`), qué rutas responden 503 (navegación runtime),
    qué assets siguen disponibles (`/maintenance.css`, favicons, `/_astro/`,
    `/assets/`, `/cdn-cgi/` y endpoints prerenderizados) y cómo comprobarlo con
    `wrangler dev`/`curl`.
  - `README.md`: sección «Operación» que enlaza la guía.
  - `tests/maintenance-docs.test.mjs`: verifica que la guía existe y es
    coherente con `src/domain/http/maintenance.ts` (estado 503 y prefijos de
    assets) y `src/middleware.ts`.
- Verificación: `./init.sh` en verde (tests + build).
- Siguiente paso: revisar visualmente la página 503 en producción y, si se
  quiere, añadir una comprobación de humo (`curl -I`) al pipeline de despliegue.
