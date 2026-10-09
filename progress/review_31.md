# Review — feature 31

**Veredicto:** APPROVED

Revisión nivel 1 de `search-clear-button-fix` (spec `specs/31_search-clear-button-fix/requirements.md`,
informe `progress/impl_31.md`; el líder implementó por autorización humana explícita, revisado con el
mismo rigor). `depends_on: []`: no hay dependencias que saltar.

## Trazabilidad REQ

- REQ-31-01 [x] `search-results.astro:15` usa `data-search-results-clear`; el componente ya no contiene `data-search-clear`.
- REQ-31-02 [x] `search-results-controller.ts:78-79`: `document.querySelector('.search-results')` y `root?.querySelector('[data-search-results-clear]')`; la consulta global desaparece. La raíz `<section class="search-results">` existe (`search-results.astro:5`).
- REQ-31-03 [x] Rama `fromQuery` sin cambios de comportamiento (replaceState sin q, título base, guía visible, vacío/lista/paginación ocultos); el test la ejercita con el × del header delante en el DOM.
- REQ-31-04 [x] Rama `location.assign(clearDestination(...))`; test `/zzz` -> `['/']`.
- REQ-31-05 [x] `search-bar.astro:12` conserva `data-search-clear`, consumido solo por `search-bar.ts:58` dentro de su raíz; el test verifica `calls.header` vacío.
- REQ-31-06 [x] `impl_31.md` documenta el rojo previo (5 fail / 1 pass; el de 100 líneas pasa trivialmente, aceptable) y el verde posterior.
- REQ-31-07 [x] Controlador 92 líneas, componente 28. Test nuevo 98 líneas.
- REQ-31-08 [x] `./init.sh` ejecutado por el reviewer: entorno, formato, tests al 100% y build en verde.

Ajustes de tests previos (`search-dedicated-view`, `search-results-list-mode`, `root-term-search`) son consecuencia directa del cambio de contrato de REQ-31-01/02 y mantienen la cobertura del clic real (REQ-07-10/11). Sin lógica añadida en `.astro`, sin `<style>`, sin dependencias.

## Checkpoints
- Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x]
- Sin lógica JS en UI: [x]
- Datos vía repositorios: [x] (no aplica, sin cambios)
- Tokens, sin valores hardcodeados: [x] (sin cambios CSS)
- Ningún archivo de `src/` tocado supera 100 líneas: [x]
- Sin dependencias externas nuevas: [x]
- `src/data/*.json` válido y tipado: [x] (sin cambios)
- Repositorios con errores nombrados: [x] (sin cambios)
- `./init.sh` en verde: [x]
- Página correcta en desktop y móvil sin errores de consola: [ ]  <- Razón: inspección visual en navegador no realizada por el reviewer; la feature no cambia presentación.
- `feature_list.json` con la tarea en `done`: [ ]  <- Razón: la 31 sigue `in_progress`; el cierre a `done` corresponde al líder tras este APPROVED.
- `progress/current.md` documenta la sesión: [x]
- Sin temporales, debug ni TODOs sin contexto: [x]

## Cambios requeridos (si aplica)
Ninguno.

Observación no bloqueante: `tests/term-search-oldest-first.test.mjs` mantiene `[data-search-clear]` en su fake DOM (sin aserciones sobre limpiar); puede alinearse en una feature futura.
