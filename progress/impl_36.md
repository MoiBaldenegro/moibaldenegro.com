# Informe de implementación — feature 36 search-status-announcements

- Fecha: 2026-10-08
- Implementa: el líder en rol de implementer (autorización humana explícita; el subagente
  `implementer` no está disponible en la sesión de Claude Code).
- Spec: `specs/36_search-status-announcements/requirements.md` + `design.md`. La carpeta
  `specs/36_posts-navigation-fix/` es de una feature histórica distinta.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/components/search-results/search-status.ts` (NUEVO, 31 líneas) | `statusMessage(total, term, page, totalPages)` (REQ-36-03/04/05), `writeStatus(root, msg)` y `liveAnnouncer(panel)` con debounce `ANNOUNCE_DELAY_MS = 300` que limpia el estado con término vacío (REQ-36-07). |
| `src/components/search-results/search-results.astro` | `<p class="visually-hidden" role="status" aria-live="polite" data-search-status></p>` dentro de `.search-results` (REQ-36-01). |
| `src/components/search-live/search-live.astro` | El mismo nodo dentro del panel `[data-search-live]` (REQ-36-02). |
| `src/components/search-results/search-results-controller.ts` (94 líneas) | `renderSearch` escribe `statusMessage(...)` en el nodo de `.search-results` en cada render y cambio de página (REQ-36-06). |
| `src/components/search-live/search-live.ts` (96 líneas) | `applyLive` devuelve el total (0 en modo portada); el handler de `search:change` llama a `announce(term, total)` del `liveAnnouncer`. Para no superar 100 líneas se compactó el encabezado y el literal de retorno de `livePage`, sin cambiar el comportamiento. |
| `src/styles/layout.css` | Utilidad `.visually-hidden` (position absolute, 1px, margin -1px, overflow hidden, clip, nowrap; sin display:none) (REQ-36-08). Sin `border: 0`: REQ-08-06 exige `var()` en `border` y el nodo `<p>` no tiene borde. |
| `tests/search-status-announcements.test.mjs` (NUEVO) | Marcado, unitarios, document simulado (controlador + clic en Siguiente) y `mock.timers` (3 eventos → 1 escritura a los 300 ms del último). |

## Ciclo rojo/verde (REQ-36-09)

Rojo — antes de tocar `src/`:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\components\search-results\search-status.ts'
ℹ pass 0 / ℹ fail 1
```

Tras implementar: 5/6 (search-live.ts en 101 líneas → compactado a 96) y luego 6/6. En la suite
saltó REQ-08-06 por `border: 0` en `.visually-hidden` → se quitó la declaración.
Verde — `pnpm test`: 603/603. `./init.sh`: formato ✔, tests ✔, build ✔. El HTML de `/` y `/search`
contiene el nodo de estado.
