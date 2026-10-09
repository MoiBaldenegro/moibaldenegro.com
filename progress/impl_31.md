# Informe de implementación — feature 31 search-clear-button-fix

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita en esta sesión:
  el subagente `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/31_search-clear-button-fix/requirements.md` (sin design.md).

## Problema

`wireClear` (search-results-controller.ts) usaba `document.querySelector('[data-search-clear]')`,
que devuelve el primer elemento del documento: el × del header (`search-bar.astro:12`). El botón
«Limpiar búsqueda» del estado vacío quedaba sin manejador y el × del header recibía uno ajeno.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/search-results/search-results.astro` | El botón `.search-results__clear` pasa de `data-search-clear` a `data-search-results-clear` (REQ-31-01). El × del header conserva `data-search-clear` (REQ-31-05). |
| `src/components/search-results/search-results-controller.ts` | `wireClear` busca la raíz `.search-results` y dentro `[data-search-results-clear]` (REQ-31-02). 92 líneas (REQ-31-07). |
| `tests/search-clear-button-fix.test.mjs` | Test nuevo: inspección + document simulado con el × del header antes que el botón de resultados (REQ-31-01..05, 07). |
| `tests/search-dedicated-view.test.mjs`, `tests/search-results-list-mode.test.mjs` | La regex del botón de limpiar pasa a `data-search-results-clear` (el contrato cambia por REQ-31-01). |
| `tests/root-term-search.test.mjs` | El fake DOM expone la raíz `.search-results` y el nodo `[data-search-results-clear]`, para que los tests de wiring REQ-07-10/11 sigan ejercitando el clic real. |

## Ciclo rojo/verde (REQ-31-06)

Rojo — `node --test tests/search-clear-button-fix.test.mjs` antes de tocar `src/`:

```
✖ REQ-31-01: el botón del estado vacío usa data-search-results-clear y no data-search-clear
✖ REQ-31-02: el controlador busca el botón dentro de .search-results, sin consulta global
✖ REQ-31-03: en /search?q=zzz el clic quita q, restaura el título y muestra la guía
✖ REQ-31-04: en /zzz el clic navega a clearDestination (/)
✖ REQ-31-05: initSearchResults no registra listeners sobre el × del header
✔ REQ-31-07: los archivos de src/ tocados no superan 100 líneas
ℹ pass 1 / ℹ fail 5
```

Tras el fix, el test nuevo pasa 6/6. En la suite completa fallaron 4 tests previos que fijaban el
selector antiguo (REQ-03-05/08, REQ-07-10, REQ-07-11, REQ-09-11) y se actualizaron al nuevo contrato.

Verde — `pnpm test`: `ℹ pass 568 · ℹ fail 0`. `./init.sh`: formato ✔, tests ✔, build ✔
(«El entorno está perfecto»).

## Fuera de alcance

- `tests/term-search-oldest-first.test.mjs` mantiene `[data-search-clear]` en la lista de su fake
  DOM; no hace aserciones sobre limpiar, así que no se tocó.
- La acumulación de listeners de la paginación es la feature 32.
