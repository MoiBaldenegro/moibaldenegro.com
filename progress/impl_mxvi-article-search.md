# Implementación — feature 15 `mxvi-article-search`

Quinta y última fase del refactor del sitio al design system MXVI: detalle de artículo, búsqueda,
resultados en vivo y página no encontrada usan las clases `.mx-*`. Spec:
`specs/15_mxvi-article-search/requirements.md` (REQ-15-01..13) y `design.md`. Fecha: 2026-11-11.

## 1. Archivos tocados

| Archivo | Cambio |
|---------|--------|
| `tests/mxvi-article-search.test.mjs` | Nuevo, escrito antes del código: 7 tests para REQ-15-01..12 |
| `tests/article-images`, `square-corners-sitewide`, `mxvi-chrome`, `mxvi-home`, `mxvi-foundation` | Contratos: imágenes desde `.mx-prose`, línea base de radios 1 en 1 hoja, typography.css eliminada |
| `src/pages/posts/[id].astro` | `mx-page`, `mx-post-hero` (`mx-media`, `mx-kicker`, `__title`, `mx-meta--pill`), `mx-prose`, `mx-post-next`, `mx-post-related` con filas `mx-result-row` |
| `src/components/code-copy/*` | Envoltorio `mx-code` y botón `mx-code__copy` |
| `src/pages/search.astro`, `[...term].astro` | `mx-page`, `mx-heading mx-heading--page` |
| `src/components/search-results/search-results.astro`, `item-html.ts` | `mx-notice` (guía y vacío), `mx-button--quiet`, `mx-result-list`, filas `mx-result-row` con `mx-tag--sm`, `mx-pagination` |
| `src/components/search-live/search-live.astro` | `mx-notice`, `mx-result-list` |
| `src/components/not-found/not-found.astro` | `mx-container`, `mx-notice mx-notice--page`, `mx-link` |
| `src/styles/article.css`, `not-found.css`, `search-live.css` | Solo ganchos propios del sitio (Decisión 1) |
| `src/layouts/Layout.astro` | Sin `typography.css` |
| 7 hojas | Eliminadas: post, post-header, post-readability, post-next, code-copy, search-results, typography |

## 2. Correcciones subidas al design system (`b8edcc7`)

Nueva hoja `post-related.css` (siguiente y recomendados); prosa con imágenes a ancho natural, h1
interno pequeño, cita y separador como los muestra el sitio y sin margen doble en bloques de
código envueltos; título de fila de resultado; aviso con texto grande, variante de página y
título grande; `.mx-heading--page`; texto compacto de 13.33px en los botones discretos y de
paginación; separación del texto «Copiado»; `[hidden]` siempre gana al display.

## 3. Rojo y verde

`node --test` antes del código: 7 fallos. Después: `./init.sh` en verde (125/125, build OK).

## 4. Regresión visual (REQ-15-13)

- 24 capturas contra la línea base de la feature 14: 0 % (about 0.002 %, ruido conocido).
- Estados interactivos frente al build anterior: búsqueda sin resultados, resultados en vivo,
  bloque de código antes y después de copiar (escritorio y móvil): 0 %, salvo el texto
  `whoami` del menú (feature 14).
- Artículo con h1 interno y bloque de código (`generacion-clave-privada-ed25519-nodejs`) a 1440 y
  390 px: igual salvo el texto `whoami` del header y del footer.
