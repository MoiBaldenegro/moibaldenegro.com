# Review — feature 47

**Veredicto:** APPROVED

Revisión de nivel 1, **ronda 2**, de `search-index-lazy-load`. Se comprueban los cuatro cambios que pedí
en la ronda 1 (CHANGES_REQUESTED) frente a la sección «Ronda 2» de `progress/impl_47.md`. El líder hizo
de implementer con autorización humana y se revisa con el mismo rigor. Ejecutado: `./init.sh` → verde
(harness, formato, tests, build); `pnpm test` → 681/681, 0 fallos.

## Verificación punto por punto (ronda 1 → ronda 2)

1. **Carrera en la portada: resuelto.** `src/components/search-live/live-search.ts:16-28`: `liveShow`
   guarda `latest`, y los callbacks `run`/`fail` encolados solo actúan si `term === latest`. He
   reproducido de nuevo la carrera con mi DOM simulado (script temporal, fuera del repo):
   escribir → borrar → resolver deja `{panel: hidden, landing: visible}` y el estado `''`.
   Escribir → borrar → **rechazar** no muestra el error ni oculta la portada. Con «a» → «arquitectura»
   y un solo `resolve`, solo se anuncia el último término (`1 resultado para "arquitectura"`). El test
   nuevo «REQ-47-03 (carrera)» (`tests/search-index-lazy-load.test.mjs:118-129`) cubre el caso.
2. **Error silencioso en la portada: resuelto.** `showLoadError` (`live-search.ts:32-39`) muestra el
   panel, oculta la portada, la lista, el vacío y «ver todos», y llama a `announce.fail`.
   `LiveAnnouncer.fail` (`src/components/search-results/search-status.ts:33-38`) hace `clearTimeout`
   del anuncio pendiente y escribe al momento. En mi DOM simulado, con un anuncio vacío pendiente seguido
   de un fallo, el estado final es solo `[INDEX_ERROR_MESSAGE]`: el debounce no lo sobrescribe. Tras el
   error, al borrar se vuelve a la portada y el estado se limpia. Lo cubre el test «REQ-47-05 (portada)».
3. **Error genérico y sin validar: resuelto.** `SearchIndexLoadError extends Error` con `name` fijado
   (`index-loader.ts:14-19`). Se lanza cuando falla el HTTP (l.30) y cuando el cuerpo no es un array
   (l.32). Nada inválido se cachea (`pending = null` en el catch). Los tests usan
   `assert.rejects(..., SearchIndexLoadError)` (l.81-82 y l.141-145).
4. **Catch vacío en la precarga: resuelto.** `preloadOnFocus` usa la función con nombre
   `ignorePreloadFailure`, y un comentario explica por qué se ignora el fallo y dónde se informa
   (`live-search.ts:41-49`).

**Feature 36 (anuncios con debounce): sin regresión.** `announce(term, total)` mantiene el debounce de
300 ms y la limpieza con término vacío. Pasan en verde REQ-36-01/02, 03/04/05, 06, 07 («tres
search:change seguidos producen una sola escritura 300 ms después»), 08 y 10. El arranque con input
vacío sigue aplicando solo el modo portada, sin anuncio (`search-live.ts:89-90`).

**Test heredado** `tests/search-landing-live-transition.test.mjs` (REQ-05-04): solo cambia para seguir
la delegación (`liveShow(` en search-live.ts y `withSearchIndex(` en live-search.ts). El escape de
`</script` se sigue verificando contra la salida real de `searchIndexJson`. No se debilita.

## Checkpoints
- C1 (estilos en `src/styles/`, sin `<style>` en .astro): [x]
- C2 (sin lógica en la UI): [x]. La lógica nueva está en módulos `.ts`.
- C3 (ningún componente lee JSON directamente): [x]
- C4 (tokens, sin valores sueltos): [x]. No se tocó CSS.
- C5 (≤ 100 líneas): [x]. live-search 49, search-live 92, search-status 39, index-loader 62, controller 88.
- C6 (sin dependencias externas): [x]
- C7 (errores nombrados `*Error`, sin fallos silenciosos): [x]. Ver los puntos 2-4.
- C8 (`./init.sh` verde): [x]
- C9 (vista correcta en desktop/móvil sin errores de consola): [ ]. Razón: no se ha verificado en un
  navegador real (pendiente de inspección manual, como indica el informe). No bloquea la aprobación,
  igual que en las features anteriores.
- C10 (test-first, rojo documentado): [x]. Rojo de carga (`SearchIndexLoadError` no exportado) →
  rojo de comportamiento (2/10, carrera y portada) → 10/10, en `progress/impl_47.md`.
- C11 (dependencias en `done`): [x]. La 46 está aprobada.
- C12 (sin temporales ni debug): [x]

## Cambios requeridos
Ninguno.

## Observaciones (no bloqueantes)
- `index-loader.ts:31`: si el cuerpo es un JSON malformado, `response.json()` rechaza con `SyntaxError`
  y no con `SearchIndexLoadError`. El fallo no se cachea, y la UI lo muestra igual a través de `fail`.
  En la ronda 1 pedí como mínimo `Array.isArray`, así que no se exige, pero envolverlo unificaría el
  tipo de error.
- `withSearchIndex` (`index-loader.ts:51`): si `run` lanza, el error se queda como rechazo no
  gestionado (ya lo señalé en la ronda 1).
- Accesibilidad: el error se escribe en el `role="status"` en el mismo tick en que el panel deja de
  estar `hidden`. Algunos lectores de pantalla no anuncian un cambio en una región viva que acaba de
  hacerse visible. Conviene comprobarlo en la verificación manual (C9).
