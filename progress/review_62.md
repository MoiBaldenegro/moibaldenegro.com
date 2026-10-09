# Review — feature 62

**Veredicto:** CHANGES_REQUESTED

Feature 62 `code-copy-fixed-corner` (sin `depends_on`). Revisión de nivel 1 sobre
`src/components/code-copy/code-copy.ts`, `src/styles/code-copy.css`,
`tests/code-copy-fixed-corner.test.mjs` (nuevo), `tests/code-copy-button.test.mjs` y
`tests/code-copy-status.test.mjs` (fakes ampliados).

## Pregunta de revisión (test-first y suite verde)

- Rojo previo: `progress/impl_62.md` registra `pass 1 / fail 4` del test nuevo antes de
  tocar producción (REQ-62-01/02, 03, 04 y 06 en rojo; solo 08 verde). Evidencia aceptada.
- Verde: 5/5 en el test nuevo, suite 761/761. `./init.sh` ejecutado por el reviewer:
  entorno, formato, tests al 100% y build en verde.
- Dependencias: la feature 62 no tiene `depends_on`; no se salta ninguna.

## Verificación por requisito

- REQ-62-01/02: `code-copy.ts:43-49` (`wrapBlock`) inserta `div.code-block` con
  `parentNode.insertBefore` y mueve el pre dentro; el botón se cuelga del envoltorio
  (`code-copy.ts:36`). Test `code-copy-fixed-corner.test.mjs:39-52` con fakes que mueven
  nodos como el DOM real. OK.
- REQ-62-03: la marca `dataset.copyReady` (`code-copy.ts:28-29`) sale antes de envolver;
  test `:54-62` comprueba un único envoltorio, un único botón y que no hay anidamiento. OK.
- REQ-62-04: `code-copy.css:5-7` declara `position: relative` en
  `.post__content .code-block` y ya no en `pre.astro-code`; test `:73-76`. OK.
- REQ-62-05: verificación con CDP registrada en `impl_62.md` (dos posts a 375 px con
  desbordamiento de 170 y 119 px; botón con el mismo rect antes y después, a 8 px del
  right/top). El criterio pide `scrollLeft = 200`; se usó `scrollWidth`, que el navegador
  limita al máximo (< 200 en ambos casos), por lo que es equivalente. OK.
- REQ-62-06: `copyBlock` sin cambios (copia el `code` del pre); test `:64-71`. OK.
- REQ-62-07: ver arriba. OK.
- REQ-62-08: NO se cumple (ver C5 y cambio requerido 1).
- REQ-62-09: `./init.sh` verde. OK.

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x]
- C2 (sin lógica en UI; frontmatter solo imports): [x] (la lógica vive en `code-copy.ts`)
- C3 (sin lectura directa de JSON): [x] (no aplica)
- C4 (solo tokens, sin valores hardcodeados): [x] (no se añaden colores ni tokens; `top/right: 8px` ya existían)
- C5 (ningún archivo modificado supera 100 líneas o hay discusión `blocked`): [ ]  ← Razón: `tests/code-copy-button.test.mjs` tiene 140 líneas y la feature 62 lo modifica (`:48-49`, «Ajuste feature 62»). REQ-62-08 dice «Cada archivo creado o modificado por la feature SHALL respetar el límite de 100 líneas» y el criterio 7 de `feature_list.json` exige que «los tests modificados no superan las 100 líneas». Además, el test de REQ-62-08 (`code-copy-fixed-corner.test.mjs:78-83`) solo comprueba `code-copy.ts`, `code-copy.css` y el test nuevo, no los dos tests modificados. (`code-copy-status.test.mjs` tiene 100 líneas: cumple.)
- C6 (sin dependencias externas nuevas): [x]
- C7 (`./init.sh` verde: entorno, formato, tests al 100%, build): [x]
- C8 (aspecto correcto en desktop y móvil sin errores en consola): [x] según la verificación CDP de `impl_62.md` (375 y 1280 px, `margin-top` del pre sin cambios)
- C9 (`feature_list.json` con la tarea en `done` y ninguna otra a medias): [ ]  ← la feature 62 sigue `in_progress`; se cierra tras la aprobación
- C10 (sin temporales, debug ni TODOs sin contexto): [x]

## Cambios requeridos
1. Dejar `tests/code-copy-button.test.mjs` en ≤100 líneas (ahora 140), como piden REQ-62-08
   y el criterio 7. Por ejemplo, compactar la cabecera de comentarios (`:1-19`) y los fakes
   de `installDom` (`:40-76`) sin cambiar las aserciones de REQ-CC-01..05. Si se considera
   imprescindible superar el límite, la vía es la de `docs/architecture.md` §12: discutirlo
   primero (estado `blocked`) y modificar REQ-62-08 en la spec. No basta con dejarlo así.
2. Ampliar el test de REQ-62-08 (`tests/code-copy-fixed-corner.test.mjs:78-83`) para que
   compruebe también `tests/code-copy-button.test.mjs` y `tests/code-copy-status.test.mjs`,
   como pide el criterio 7 («los tests modificados»).
3. (Menor, coherencia con design.md) `design.md` dice que las aserciones de REQ-CC-02/03
   «pasan al envoltorio», pero `impl_62.md` indica que no cambian. Los fakes de pre de
   `code-copy-button.test.mjs:95` y `:111` siguen guardando `appended`, que ahora siempre queda
   vacío (código de fake muerto). Hay que quitar ese `appended` muerto, lo que también ayuda
   con el punto 1, o anotar en `impl_62.md` que la ubicación del botón la cubre
   `code-copy-fixed-corner.test.mjs` y no REQ-CC-02/03.
