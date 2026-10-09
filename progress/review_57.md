# Review — feature 57 (ronda 2)

**Veredicto:** APPROVED

## Comprobaciones previas

- Dependencias: `depends_on: [36]`, la 36 está en `done`. Cumple.
- Test-first, ronda 2: `progress/impl_57.md` § «Ronda 2» documenta que los dos tests nuevos
  fallaron primero por la razón esperada («la barra conserva el término…») y después pasaron.
  Ronda 1: rojo 6 fail / 1 pass y después verde. Cumple REQ-57-07.
- `./init.sh`: verde (entorno, formato, tests, build). `pnpm test`: 743/743, 0 fail
  (verificado por el reviewer).

## Cambios requeridos de la ronda 1, punto por punto

1. Escape en /search: resuelto. `clearSearchView(baseTitle, barRoot)`
   (`src/components/search-escape/search-escape.ts:69-76`) llama a `resetQuery(barRoot)` en la
   línea 70 antes de quitar `q`, restaurar el título y mostrar la guía. Cumple.
2. «Limpiar búsqueda» del estado vacío: resuelto. En la rama `fromQuery` de `wireClear`
   (`src/components/search-results/search-results-controller.ts:82-83`) se busca `[data-search-bar]`
   y se le aplica `resetQuery`. La rama `/<término>` (`location.assign`) no cambia, y es correcto
   porque recarga la página. El diff de la feature 57 en este archivo se limita al import (l.17)
   y a esas dos líneas. Cumple.
3. Tests: resuelto. En `tests/search-form-progressive.test.mjs:98-110` se simula Escape en
   `/search?q=docker` con el foco en la región de resultados (`closest` no nulo). Se comprueba
   que el input queda vacío y que el último toggle es `['is-filled', false]`. En las líneas
   112-127 se pulsa «Limpiar búsqueda» con `?q=zzz` y el input queda vacío. El ajuste del fake de
   `tests/search-clear-button-fix.test.mjs:31-34` (una barra simulada sin input, con nota que cita
   el precedente REQ-43-06) solo evita que `resetQuery` falle sobre un nodo genérico. No relaja
   ninguna aserción de REQ-31-xx.
4. Límites: `search-bar.ts` 83, `search-escape.ts` 87 y `search-results-controller.ts` 91 líneas.
   Cumple.

## Sin regresiones

- El botón × sigue devolviendo el foco: `clearQuery` = `resetQuery(root)` + `input.focus()`
  (`src/components/search-bar/search-bar.ts:39-42`), y el click de `[data-search-clear]` sigue
  llamando a `clearQuery` (l.71). Los tests de REQ-04-04 de `tests/search-bar-header.test.mjs`
  (`focusCalls === 1`, l.145/156) pasan.
- `resetQuery` no mueve el foco (`search-bar.ts:46-51`), así que limpiar desde los resultados no
  se lo quita a quien navega con teclado. Igual que `syncBar`, emite `search:change('')`, lo que
  deja la consulta activa coherente.
- `clearLanding` sigue usando `clearQuery` (vacía y enfoca) y no cambia.
- No hay ciclo de imports: `search-bar.ts` no importa nada del controlador ni de escape.

## Observación (no bloqueante)

- `tests/search-form-progressive.test.mjs` pasa de 86 a 133 líneas. En la práctica del repo los
  tests no se ajustan al límite de 100 (hay muchos de más de 300 líneas, como
  `search-bar-header.test.mjs` con 359, que esta feature modificó en la ronda 1). Además, el
  propio test de REQ-57-08 solo mide los archivos de `src/`. No bloquea. Si se quiere ajustar al
  máximo, los dos tests de la ronda 2 podrían moverse a un archivo aparte.

## Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x]
- C2 Sin lógica en archivos de UI: [x]
- C3 Sin lectura directa de JSON: [x]
- C4 Solo tokens: [x] (en esta ronda no cambia el CSS)
- C5 Ningún archivo de `src/` tocado supera 100 líneas: [x]
- C6 Sin dependencias externas: [x]
- C7 `./init.sh` verde: [x]
- C8 Se ve correcta en desktop y móvil sin errores de consola: [ ]  ← Razón: el reviewer no lo ha
  inspeccionado en navegador (las pruebas CDP del implementer están en `impl_57.md`). En esta
  ronda no hay cambios visuales.
- C9 Búsqueda sin regresiones: [x] (la regresión de la ronda 1 está corregida y cubierta por tests)

## Cambios requeridos
Ninguno.
