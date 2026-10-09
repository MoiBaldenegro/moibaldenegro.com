# Review — feature 71

**Veredicto:** APPROVED

Alcance revisado: `src/domain/latest-horizontal.ts` (nuevo, 37 líneas) y
`tests/latest-horizontal-geometry.test.mjs` (nuevo, 80 líneas), contra
`specs/71_latest-horizontal-geometry/requirements.md`, los 8 criterios de
`feature_list.json` (id 71), `docs/architecture.md`, `docs/conventions.md` y
`CHECKPOINTS.md`.

## Pregunta de revisión

- Test-first: `progress/impl_71.md` documenta el rojo previo (`pass 0 / fail 7`,
  módulo inexistente; el helper `load()` del test falla con
  `falta src/domain/latest-horizontal.ts`, coherente con ese rojo) y el verde
  posterior (7/7, suite completa en verde). REQ-71-12 cumplido según la evidencia.
- Dependencias: `depends_on: []`; no salta ninguna dependencia pendiente.
- `./init.sh` ejecutado por el reviewer: verde (entorno, formato, tests al 100%,
  build). `node --test tests/latest-horizontal-geometry.test.mjs`: 7/7.

## Trazabilidad REQ

- REQ-71-01: exporta las cinco funciones; el archivo no contiene `gsap`, `window`
  ni `document` (verificado por inspección en el test, líneas 14-21).
- REQ-71-02/03: `trackTravel` y `pinScrollLength` = (count - 1) x tamaño (módulo
  líneas 13-20).
- REQ-71-04/05: `trackOffset` = `0 - clamp01(progress) * trackTravel(...)`
  (línea 24); el `0 -` evita `-0` con `assert.strict` (Object.is), bien razonado.
- REQ-71-06/07/08: `cardCenterX` (línea 29), casos inicio/mitad/final cubiertos.
- REQ-71-09/11: `focusScrollTarget` acota el índice y devuelve `start` con
  count < 2 (líneas 33-37).
- REQ-71-10: guardas `validCount`/`validSize` (líneas 8-9); test cubre count
  0, 1, 2.5, NaN; viewport 0, -100, NaN, Infinity; progress NaN.
- REQ-71-13: ambos archivos por debajo de 100 líneas, con test de inspección.

## Arquitectura y convenciones

- Módulo puro en `src/domain/`, junto a precedentes `latest-posts.ts` y
  `related-titles.ts`; nombre en minúsculas/kebab coherente con ellos. Sin
  dependencias, sin UI, sin JSON, sin DOM: respeta la separación lógica/UI.
- Comentarios en español, JSDoc breve por función; sin TODOs ni debug.

## Checkpoints
- Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (no aplica, sin UI)
- Sin lógica JS en archivos de UI: [x] (lógica en módulo `.ts` de dominio)
- Ningún componente lee JSON directamente: [x] (no aplica)
- Tokens, sin valores hardcodeados: [x] (no aplica, sin CSS)
- Ningún archivo supera 100 líneas: [x] (37 y 80)
- Sin dependencias externas nuevas: [x] (no importa gsap ni nada externo)
- `src/data/*.json` válido y tipado: [x] (no tocado)
- Repositorios con errores nombrados: [x] (no tocado)
- `./init.sh` en verde: [x] (ejecutado por el reviewer en esta revisión)
- Página correcta en desktop y móvil: [ ]  ← Razón: no aplica a esta feature (sin UI); no verificado visualmente.
- `feature_list.json` con la tarea en `done`: [ ]  ← Razón: la feature 71 sigue en `in_progress`; el cierre lo hace el líder tras este APPROVED.
- `progress/current.md` documenta la sesión: [ ]  ← Razón: ver observación 2.
- Sin temporales, debug ni TODOs: [x]

## Observaciones (no bloqueantes, a corregir en el cierre)
1. `progress/impl_71.md` declara 92 líneas para el test y 41 para el módulo; los
   archivos en disco tienen 80 y 37 (`wc -l`). Corregir las cifras del informe.
2. `progress/current.md` sigue con "Feature en curso: (ninguna...)" y no anota la
   feature 71 (AGENTS.md §3 "Documenta lo que haces... mientras trabajas" y §4
   paso 7). Registrar la feature 71 en la bitácora antes de mover el resumen a
   `progress/history.md` al cerrar.

## Cambios requeridos (si aplica)
- Ninguno bloqueante.
