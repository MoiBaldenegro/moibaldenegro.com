# Informe de implementación — feature 32 search-pagination-listeners

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita en esta sesión;
  el subagente `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/32_search-pagination-listeners/requirements.md` (sin design.md).

## Problema

`renderSearch` añadía un `addEventListener('click')` nuevo a Anterior/Siguiente en cada render, sin
quitar los anteriores: un clic disparaba varios renders con páginas obsoletas capturadas en cierres
(`data.page`). Al llegar al límite el botón enfocado pasaba a `disabled` y el foco caía a `body`.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/search-results/search-pagination.ts` (NUEVO, 15 líneas) | `Pager` (estado único `{ page, render }`) y `wirePagination`: un listener por botón por inicialización; `step(±1)` renderiza `pager.page ± 1` y enfoca `[data-search-list]` (REQ-32-01..06). |
| `src/components/search-results/search-results-controller.ts` (91 líneas) | `initSearchResults` calcula `order` una vez, crea el `pager` y llama `wirePagination` + `pager.render(1)`; `renderSearch` ya no registra listeners, solo alterna `disabled` y devuelve `data.page` (página normalizada por el dominio) que se guarda en el estado (REQ-32-04/07). |
| `src/components/search-results/search-results.astro` | `ul[data-search-list]` con `tabindex="-1"` para poder recibir el foco programático (REQ-32-05). |
| `tests/search-pagination-listeners.test.mjs` (NUEVO) | REQ-32-01..07 y 09 con document simulado: el clic dispara todos los listeners registrados (como el navegador), con 13 coincidencias / 3 páginas. |
| `tests/term-search-oldest-first.test.mjs` | Contrato actualizado: REQ-17-02/03 comprueba `const order = q !== '' ? 'desc' : 'asc'`; REQ-17-05 comprueba `pager.page = renderSearch(term, index, page, order)` y `step(-1)`/`step(1)` en el módulo nuevo; el fake DOM añade `focus()`. |

El foco no se mueve en el render inicial, solo al cambiar de página.

## Ciclo rojo/verde (REQ-32-08)

Rojo — `node --test tests/search-pagination-listeners.test.mjs` antes de tocar `src/`:

```
✖ REQ-32-01: cada botón tiene exactamente un listener tras varias páginas
✖ REQ-32-02/03: Siguiente y Anterior producen un único render de la página contigua
✖ REQ-32-04: clics alternos siguen el contador sin renders de páginas obsoletas
✖ REQ-32-05: la lista lleva tabindex="-1" y recibe el foco al cambiar de página
✖ REQ-32-06: al llegar a la última página el foco va a la lista
✔ REQ-32-07: la página 2 conserva asc en /<término> y desc en ?q=
✔ REQ-32-09: los archivos de src/ tocados no superan 100 líneas
ℹ pass 2 / ℹ fail 5
```

REQ-32-07 y 32-09 ya se cumplían antes (un primer clic sí conserva el orden): quedan como guardas
de regresión. Un primer intento dejó el controlador en 100 líneas físicas (101 con el criterio
`split('\n')` de los tests de longitud), así que la paginación se extrajo a `search-pagination.ts`.

Verde — `pnpm test`: `ℹ pass 575 · ℹ fail 0`. `./init.sh`: formato ✔, tests ✔, build ✔.
