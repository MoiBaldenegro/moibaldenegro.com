# Review — feature 54 (ronda 2)

**Veredicto:** APPROVED

## Checkpoints
- C1 (estilos en `src/styles/*.css`, sin `<style>` en `.astro`): [x]
- C2 (sin lógica en UI; frontmatter solo imports): [x] (la lógica sigue en `code-copy.ts`)
- C3 (tokens, sin valores sueltos): [x] (`.code-copy.is-copied` usa `padding: 0 var(--gap-card)`; `--gap-card` existe en `tokens.css:74`)
- C4 (máx. 100 líneas): [x] (`code-copy.css` 63, `code-copy.ts` 84, `tests/code-copy-status.test.mjs` 98)
- C5 (sin dependencias nuevas): [x]
- C6 (`./init.sh` verde: entorno, formato, tests al 100 % y build): [x]
- C7 (test-first documentado): [x] (`progress/impl_54.md`, «Ronda 2»: el test «REQ-54-04 (ronda 2)» aparece primero en rojo, «el botón copiado conserva el ancho fijo de 30px», y después en verde; suite 723/723)
- C8 (dependencias en `done`): [x] (sin cambios respecto a la ronda 1)
- C9 (la UI se ve correcta en desktop y ≤768px): [x] (ver «Verificación ejecutada»)

## Resolución de la ronda 1
1. Desborde de «Copiado»: resuelto. `src/styles/code-copy.css:40-48` añade a `.code-copy.is-copied`
   `width: auto; padding: 0 var(--gap-card); white-space: nowrap;`. Como el botón está anclado con
   `right: 8px`, crece hacia la izquierda. El test `tests/code-copy-status.test.mjs:76-87` quita los
   comentarios antes de inspeccionar el bloque, así que no puede pasar por error con un comentario.
2. Comprobación visual: está documentada en `progress/impl_54.md` (1280×800 y 375×700).
3. Observación aplicada: `code-copy.ts:63-66` vacía la región antes de escribir, sin cambiar el
   contrato de REQ-54-02 y 03.

## Verificación ejecutada
- `./init.sh`: todo verde (tests al 100 % y build OK).
- Medición propia con Chrome headless, cargando `tokens.css` y `code-copy.css` con el marcado
  copiado que pone `code-copy.ts`:
  - 1280 px: el botón mide 95,7×30 y queda dentro del `pre` (x 1152–1248, el `pre` termina en 1256).
    `scrollWidth` (94) es igual a `clientWidth` (94), así que no hay desborde interno.
  - Viewport estrecho (500 px, el mínimo de la ventana headless; ≤768px): mide 95,7×30 y queda dentro
    del `pre` (x 388–484, el `pre` termina en 492). Tampoco hay desborde.
  - El proceso del navegador terminó con `--dump-dom`; no quedan navegador ni preview abiertos.

## Observaciones (no bloqueantes)
- Mi medición da unos 96 px de ancho y la del implementer da 68 px. La diferencia probablemente
  viene de la fuente efectiva o del contexto de la página real. En ambos casos el botón contiene
  el texto y no se sale del `pre`, que es lo que se pedía.

## Cambios requeridos
Ninguno.
