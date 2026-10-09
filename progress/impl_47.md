# Informe de implementación — feature 47 search-index-lazy-load

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/47_search-index-lazy-load/requirements.md` (sin design.md). Paso 2 de 2 (el 1 es la 46).

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/search-results/index-loader.ts` (NUEVO, 51 líneas) | `loadSearchIndex(fetchFn?)`: un único `fetch('/search-index.json')` por sesión (promesa cacheada a nivel de módulo; un fallo **no** se cachea). Tras resolver, caché síncrona: `withSearchIndex(run, fail, load?)` ejecuta `run` al momento si ya está y, si no, tras `load()`; si falla, `fail`. `INDEX_ERROR_MESSAGE = 'No se pudo cargar el índice de búsqueda'`. Ganchos de test `primeSearchIndex` / `resetSearchIndexCache`. (REQ-47-02..05) |
| `search-results-controller.ts` (88 líneas) | `initSearchResults(load = loadSearchIndex)`: sin `readIndex`; el render y la paginación van dentro de `withSearchIndex`; si falla, escribe el error en el nodo de estado de `.search-results` (REQ-47-04/05). |
| `search-live.ts` (97 líneas) | `initSearchLive(panel, landing, load = loadSearchIndex)`: sin `readIndex`; registra siempre el listener de `search:change`; con término vacío solo aplica el modo portada (no necesita índice ni anuncia); con término usa `withSearchIndex` (error → nodo de estado del panel). El **primer focus** del input del header precarga el índice (`{ once: true }`) (REQ-47-03). |
| `index.astro`, `search.astro`, `[...term].astro` | Sin `<script id="search-index">`, sin `PostsRepository`/`getCollection`/`searchIndexJson`; `[...term]` ya no construye el índice en cada petición (REQ-47-01). |
| `tests/search-index-lazy-load.test.mjs` (NUEVO) | Loader con fetch simulado (3 llamadas → 1 petición; fallo no cacheado), portada sin petición al iniciar y con petición al primer focus, /search renderiza tras resolver, error en el nodo de estado, build sin índice embebido y portada < 40 000 B, ≤ 100 líneas. |
| Tests heredados | **Cableado** (root-term-search, term-search-oldest-first, search-clear-button-fix, search-pagination-listeners, search-status-announcements): `primeSearchIndex(CATALOG)` antes de inicializar (el DOM ya no trae el índice). **Contrato del embebido** (search-dedicated-view REQ-03-07, search-landing-live-transition REQ-05-04, root-term-search REQ-07-05, posts-unified-collection, search-index-endpoint REQ-46-02/03): ahora verifican que las páginas **no** embeben/construyen el índice y que los controladores usan el loader; el escape de `</script` se sigue verificando sobre la salida real de `searchIndexJson`; REQ-46-02/04 compara el índice publicado con los slugs reales. Todos con nota del ajuste (precedente REQ-43-06). |

## Resultado medido (dist/client y preview workerd)

| Recurso | Antes | Después |
|---|---|---|
| `index.html` (portada) | 72 477 B | **30 376 B** (REQ-47-06) |
| `search/index.html` | 49 355 B | **7 323 B** |
| `/<término>` (SSR) | índice embebido y reconstruido por petición | **3 846 B**, sin índice |
| `/search-index.json` | — | 39 048 B, `application/json` (cacheable) |

## Ciclo rojo/verde (REQ-47-07)

Rojo — antes de tocar `src/`: `ERR_MODULE_NOT_FOUND ... index-loader.ts`.
Durante la implementación: (1) un borrado con `indexOf('\n}\n')` sobre un archivo CRLF duplicó el
controlador; se reconstruyó el original de forma determinista (`s = (pos+2)/2`) y se borró la función
con un helper que respeta CRLF. (2) La primera versión de `initSearchLive` anunciaba (debounce) también
con término vacío al iniciar, un cambio de comportamiento que hacía fallar client-init-on-navigation;
se restauró el comportamiento previo (carga inicial vacía = solo modo portada).
Verde — test nuevo 7/7; `pnpm test` 678/678 en 3 corridas; `./init.sh` verde.

## Pendiente de verificación manual

El comportamiento en navegador real (fetch en el primer focus de la portada, render en /search tras
cargar) está cubierto con document/fetch simulados; conviene probarlo en un navegador cuando haya
dominio o con `pnpm dev`.

## Ronda 2 — cambios requeridos de progress/review_47.md

| Punto | Resolución |
|---|---|
| 1. Carrera en la portada (resultado obsoleto con el input vacío) | Nuevo `src/components/search-live/live-search.ts` (49 líneas): `liveShow(panel, landing, apply, load)` guarda el **último término recibido** y el `run`/`fail` encolados solo actúan si su término sigue siendo el último. Test nuevo «REQ-47-03 (carrera)»: escribe, borra antes de resolver, resuelve → portada visible y panel oculto. |
| 2. Error de carga silencioso en la portada | `showLoadError` muestra el panel (y oculta la portada, la lista, el vacío y «ver todos»), así el nodo `role="status"` sale de un contenedor `hidden` y se anuncia. `liveAnnouncer` devuelve ahora `LiveAnnouncer` con `fail(message)`, que **cancela el anuncio con debounce pendiente** y escribe el error al momento (no se puede sobrescribir). Test «REQ-47-05 (portada)». |
| 3. Error genérico y sin validar | `SearchIndexLoadError extends Error` (nombre fijado, mensaje en español) para HTTP fallido **y** para un cuerpo que no es array (`Array.isArray`); nada inválido se cachea. Los tests de error usan `assert.rejects(..., SearchIndexLoadError)`. |
| 4. Error tragado en la precarga | `preloadOnFocus` usa la función con nombre `ignorePreloadFailure`, con un comentario que explica por qué se ignora ahí (no se cachea; el primer término lo reintenta y `liveShow` lo muestra y anuncia). |

`search-live.ts` queda en 92 líneas (delegando en `liveShow` y `preloadOnFocus`); el test heredado
REQ-05-04 sigue el cambio (`liveShow(` en search-live.ts y `withSearchIndex(` en live-search.ts).

Ciclo rojo/verde de la ronda: primero los tests nuevos → rojo de carga (`SearchIndexLoadError` no
exportado); tras añadir la clase, rojo de comportamiento en «carrera» y «portada» (2/10); tras
`live-search.ts`, 10/10. `pnpm test` 681/681 en 3 corridas; `./init.sh` verde.
