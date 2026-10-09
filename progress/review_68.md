# Review — feature 68

**Veredicto:** APPROVED

Feature 68 `legacy-redirects-middleware`, revisión de nivel 1. `depends_on` está vacío, así que
no se salta ninguna dependencia. Alcance: `astro.config.mjs` (46 líneas), `src/domain/http/legacy-redirects.ts`
(23, nuevo), `src/middleware.ts` (17), `tests/legacy-redirects.test.mjs` (90, nuevo) y
`tests/ascii-post-slugs.test.mjs` (61). No he contado el diff de `src/domain/search/normalize.ts`:
es un cambio manual del humano que pertenece a la feature 67.

## Trazabilidad REQ → evidencia

- REQ-68-01: en el diff de `astro.config.mjs` desaparece la clave `redirects` y queda un comentario que apunta al middleware. Lo cubre el test `legacy-redirects.test.mjs:26-28`.
- REQ-68-02/03/04/05/06: `legacy-redirects.ts:14-23` es una función pura. Hace `decodeURIComponent` dentro de try/catch (devuelve null), aplica NFC, quita la barra final y busca en un mapa congelado con `Object.hasOwn`, lo que evita colisiones con claves del prototipo. Los tests `:30-44` cubren los 5 casos, las versiones con barra final, la ñ descompuesta `%CC%83` y los casos que deben dar null (`%E0%A4%A`, `/`, el slug nuevo y `/posts/otro`).
- REQ-68-07/08: `middleware.ts:10-15` responde 301 con Location relativa más `url.search` y pasa por `withSecurityHeaders` sin llamar a `next`. Lo cubre el test `:46-53`, que comprueba todas las `SECURITY_HEADERS`.
- REQ-68-09: el middleware usa `context?.url` y delega en next. El test `:55-62` cubre `{}` y una URL ajena.
- REQ-68-10: el test `:64-79` hace un build real en un outDir temporal. Además he comprobado a mano que, tras `./init.sh`, `dist/client/_redirects` no existe.
- REQ-68-11: la tabla de `progress/impl_68.md` registra `astro preview` y curl. Las 3 URLs, con y sin barra final, dan 301 hacia el slug nuevo y el destino responde 200. También se comprobó la query `?a=1` y las cabeceras de seguridad en la 301.
- REQ-68-12: `ascii-post-slugs.test.mjs:41-56` lleva las notas «Ajuste feature 68 (precedente REQ-43-06)». REQ-45-04 verifica ahora `legacyRedirect` con los slugs codificados, y REQ-45-05 excluye también `legacy-redirects.test.mjs`.
- REQ-68-13: `impl_68.md` registra el rojo (pass 1 / fail 7; REQ-68-10 reproduce exactamente el error de 4 tokens del deploy) y después el verde (8/8; suite 774/774).
- REQ-68-14: ningún archivo tocado pasa de 100 líneas (lo comprueba además el test `:81-87`).
- REQ-68-15: `./init.sh` termina en verde (entorno, formato, tests al 100% y build), con EXIT=0.

## Arquitectura y convenciones

- La lógica está en `src/domain/http/` como módulo `.ts` puro, junto a `security-headers.ts`. El middleware solo orquesta.
- No hay dependencias externas, no hay UI y no se necesita `design.md`.

## Checkpoints
- Estilos en src/styles, sin `<style>` en .astro: [x] (no se toca UI)
- Sin lógica en UI: [x]
- Datos vía repositorios: [x] (no aplica)
- Tokens: [x] (no aplica)
- ≤100 líneas: [x]
- Sin dependencias externas: [x]
- JSON de datos válido y tipado: [x] (sin cambios)
- Repositorios con errores nombrados: [x] (sin cambios)
- ./init.sh en verde: [x]
- Visual desktop/móvil: [x] (no aplica: no hay cambios de UI)
- feature_list.json: [ ]  ← La 68 sigue `in_progress`. El líder la pasará a `done` al cerrar tras esta aprobación. No hay ninguna otra a medias por esta feature.
- progress/current.md documenta la sesión: [x] (líneas 7-23)
- Sin temporales, debug ni TODOs: [x]

## Observaciones (no bloqueantes)

1. El hallazgo fuera de alcance de `impl_68.md` es real y conviene convertirlo en feature: los builds de la suite en un outDir temporal dejan `.wrangler/deploy/config.json` apuntando a un directorio borrado. Si el CI ejecuta los tests entre el build y el deploy, el deploy podría romperse.

## Cambios requeridos (si aplica)

Ninguno.
