# Informe de implementación — feature 57 search-form-progressive

- Fecha: 2026-10-08 (sesión 2)
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/57_search-form-progressive/requirements.md` + `design.md`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/search-bar/search-bar.astro` | `<search class="search-bar" data-search-bar>` (landmark nativo, sin role redundante) con `<form class="search-bar__form" action="/search" method="get">`; input `type="search" name="q" enterkeyhint="search"` con su `aria-label`; el × propio se conserva (REQ-57-01/02). Sin JS el formulario envía GET a /search. |
| `src/components/search-bar/search-bar.ts` (77 líneas) | El `keydown Enter` se sustituye por el `submit` del form: `preventDefault()` + `submitQuery(...)` con `navigate` (REQ-57-03). `preloadTerm`: en `/search` el input muestra `q` y la barra marca `is-filled` (REQ-57-04). `location` se inyecta (por defecto `globalThis.location`) para poder probarlo en node. |
| `src/components/search-escape/search-escape.ts` (86 líneas) | `isSearchFocus(event.target)`: Escape solo actúa (y solo detiene la propagación) si el foco está en `[data-search-bar]`, `[data-search-live]` o `.search-results` (REQ-57-05). |
| `src/styles/search-bar.css` (90 líneas) | `::-webkit-search-cancel-button` y `::-webkit-search-decoration` con `appearance: none` (REQ-57-06); `.search-bar__form { margin: 0; }`. |
| `tests/search-form-progressive.test.mjs` (NUEVO) | Marcado, submit con preventDefault + navigate, precarga solo en /search, Escape con foco fuera, × nativo oculto, ≤ 100 líneas. |
| Tests heredados | `search-bar-header`: REQ-04-05/06 dispara `submit` (antes `keydown Enter`) y el fake expone el `form`; REQ-04-08 exige `type="search"`. `search-keyboard-escape`: el Escape simulado lleva un `target` dentro de la búsqueda. Notas del ajuste (precedente REQ-43-06). |

## Verificación en Chrome headless (CDP contra astro preview)

| Prueba | Resultado |
|---|---|
| `/search?q=docker` | input = `docker`; existe `search form[action="/search"]` |
| Escape con el foco en `body` | el input sigue en `docker` (no se limpia) |
| Portada: escribir «arquitectura» + Enter | navega a `/search/?q=arquitectura` (view transition) |
| Sin JS: `GET /search?q=solid` | 307 → `/search/?q=solid` (barra final de Cloudflare assets; conserva la consulta) |

## Ciclo rojo/verde (REQ-57-07)

Rojo: ✖ 57-01 · ✖ 57-02 · ✖ 57-03 · ✖ 57-04 · ✖ 57-05 · ✖ 57-06 · ✔ 57-08 (`ℹ pass 1 / ℹ fail 6`).
Tras implementar fallaron 6 tests heredados (contrato del Enter, del tipo del input y del Escape) y se
ajustaron. Verde — `pnpm test` 741/741; `./init.sh` verde.

## Ronda 2 — cambios requeridos de progress/review_57.md

Con la precarga de `q` (REQ-57-04), limpiar la vista `/search` dejaba el término en la barra del header.

| Punto | Resolución |
|---|---|
| 1. Escape en /search | `clearSearchView(baseTitle, barRoot)` llama a `resetQuery(barRoot)`. |
| 2. Botón «Limpiar búsqueda» del estado vacío | La rama `fromQuery` de `wireClear` (search-results-controller.ts, 91 líneas) también llama a `resetQuery` sobre `[data-search-bar]`. |
| Nueva API | `resetQuery(root)` en search-bar.ts (83 líneas): vacía el input y quita `is-filled` **sin mover el foco**; `clearQuery` = `resetQuery` + `focus()` (comportamiento del × intacto). |
| 3. Tests | Dos tests nuevos en `search-form-progressive.test.mjs` (Escape en /search con foco en resultados y «Limpiar búsqueda»): primero en rojo por la razón esperada («la barra conserva el término…»; el fake del segundo necesitó `addEventListener` en sus nodos para llegar a esa aserción), luego en verde. El fake de `search-clear-button-fix.test.mjs` (REQ-31-03) añade una barra simulada sin input (nota del ajuste, precedente REQ-43-06). |
| 4. Límites | search-escape.ts 87, search-results-controller.ts 91, search-bar.ts 83 líneas. |

`pnpm test` 743/743 (×2); `./init.sh` verde.
