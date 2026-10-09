# Review — feature 36

**Veredicto:** APPROVED

Feature: `search-status-announcements`. Spec: `specs/36_search-status-announcements/requirements.md` + `design.md`.
Implementa el líder en rol de implementer (autorización humana explícita, ver `progress/impl_36.md`); revisado con el mismo rigor.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x] — `.visually-hidden` en `src/styles/layout.css:77-88`; los `.astro` solo añaden el `<p>`.
- C2 (lógica fuera de la UI): [x] — `statusMessage`/`writeStatus`/`liveAnnouncer` en `src/components/search-results/search-status.ts` (módulo utilitario, precedente `item-html.ts`, `term-route.ts`; docs/architecture.md §8 admite "módulos utilitarios").
- C3 (datos vía repositorio): [x] — sin lecturas de JSON nuevas.
- C4 (tokens, sin valores hardcodeados): [x] — `design.md` declara "ningún token"; `1px`/`-1px`/`clip` son el patrón estándar de la utilidad, no valores de diseño. Se retiró `border: 0` para no chocar con REQ-08-06.
- C5 (≤100 líneas): [x] — search-status.ts 31, search-results-controller.ts 94, search-live.ts 96, layout.css 88, search-results.astro 29, search-live.astro 17, test 96.
- C6 (sin dependencias externas): [x] — solo `node:test` (`mock.timers`).
- C7 (`./init.sh` verde): [x] — ver nota de flakiness abajo.
- C8 (dependencias en done): [x] — `depends_on: [32]`, 32 en `done` (APPROVED en `progress/review_32.md`).
- C9 (evidencia rojo/verde): [x] — `progress/impl_36.md` documenta el rojo (`ERR_MODULE_NOT_FOUND` de `search-status.ts`, 0/1) antes de tocar `src/`, y el verde 603/603.
- C10 (sin temporales/debug/TODOs): [x].

## Trazabilidad REQ
- REQ-36-01/02: [x] `search-results.astro:6` y `search-live.astro:7`; build verificado: `dist/client/index.html` y `dist/client/search/index.html` contienen exactamente 1 `data-search-status` cada uno.
- REQ-36-03/04/05: [x] `search-status.ts:8-12`; test con los valores exactos de acceptance.
- REQ-36-06: [x] `search-results-controller.ts:59` escribe en cada `renderSearch` (incluido el caso vacío, antes del `return`); test simula init + clic en Siguiente.
- REQ-36-07: [x] `liveAnnouncer` con `clearTimeout` + `setTimeout(300)`; test con `mock.timers` (tick 299 → nada, tick 1 → una escritura).
- REQ-36-08: [x] sin `display: none`; test de inspección.
- REQ-36-09: [x] rojo documentado.
- REQ-36-10: [x] test de inspección de líneas.
- REQ-36-11: [x] `pnpm test` 603/603 (8 ejecuciones), `./init.sh` verde (formato, tests, build).

## Observaciones (no bloqueantes)
1. Flakiness: la primera ejecución de `./init.sh` en esta revisión marcó "tests al 100%" en rojo; no se reprodujo en 7 ejecuciones posteriores de `pnpm test` ni en un segundo `./init.sh` (verde). `init.sh` descarta la salida (`>/dev/null`), así que no se pudo identificar el test. No hay indicio de que sea de la 36 (el test resetea `mock.timers` y los globals en `finally`), pero conviene vigilarlo.
2. Ubicación: la `description` de feature_list.json proponía `src/domain/search/status-message.ts`; se implementó en `src/components/search-results/search-status.ts` junto con la escritura DOM y el debounce. Los REQ y acceptance no fijan la ruta y la arquitectura lo admite; solo anotar la desviación en el cierre.
3. El anuncio del panel en vivo siempre usa `statusMessage(total, term, 1, 1)` (sin "Página X de Y"), coherente porque el panel solo muestra la primera página con el enlace "ver todos".

## Cambios requeridos
Ninguno.
