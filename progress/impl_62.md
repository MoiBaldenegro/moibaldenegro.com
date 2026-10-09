# Informe de implementación — feature 62 code-copy-fixed-corner

Implementado por el líder en rol de implementer (autorización humana; subagente implementer
no disponible).

## Ciclo rojo/verde (REQ-62-07)

- Test nuevo `tests/code-copy-fixed-corner.test.mjs` escrito primero (fakes de DOM que mueven
  nodos como el DOM real: appendChild/insertBefore desenganchan del padre anterior).
- ROJO antes de tocar producción: `ℹ pass 1 / ℹ fail 4` (REQ-62-01/02, 03, 06 y 04 fallan;
  solo 08, límite de líneas, pasaba).
- VERDE tras el cambio: 5/5. Suite completa 761/761; `./init.sh` en verde.

## Cambios

- `src/components/code-copy/code-copy.ts` (95 líneas): función `wrapBlock(pre)` crea
  `div.code-block`, lo inserta en la posición del pre (`parentNode.insertBefore`) y mueve el
  pre dentro; el botón se añade al envoltorio. La idempotencia sigue en `dataset.copyReady`
  del pre (la segunda llamada sale antes de envolver). `copyBlock` sin cambios (copia el
  `code` del pre).
- `src/styles/code-copy.css` (64 líneas): `position: relative` pasa de
  `.post__content pre.astro-code` a `.post__content .code-block`; comentario de cabecera
  actualizado. Ninguna regla del sitio usa selectores de hijo directo sobre el pre
  (article.css y post.css usan descendientes), así que el aspecto no cambia; el envoltorio no
  tiene márgenes ni fondo.
- Fakes legacy ampliados (precedente REQ-43-06, nota «Ajuste feature 62»):
  `tests/code-copy-button.test.mjs` (createElement acepta 'div') y
  `tests/code-copy-status.test.mjs` (idem). Sus aserciones no cambian.

## Verificación real (REQ-62-05) — Chrome headless + CDP sobre `astro preview`

Bloque desplazado al máximo (`pre.scrollLeft = pre.scrollWidth`):

| post | ancho | desbordamiento | botón antes (left, top) | botón después | esquina |
|------|-------|----------------|-------------------------|---------------|---------|
| /posts/03-principios-solid/ | 375 | 170 px | 317.9, 58.7 | 317.9, 58.7 | 8 px de right y top del pre |
| /posts/02-principios-del-diseno-de-software/ | 375 | 119 px | 317.9, 360.5 | 317.9, 360.5 | 8 px / 8 px |
| /posts/03-principios-solid/ | 1280 | 0 | — | igual | 8 px / 8 px |

En las tres: todos los pre están envueltos en `.code-block`, un único botón por bloque,
`margin-top` del pre 0 (sin cambio de layout). Antes del cambio el botón se desplazaba con el
contenido (era hijo del pre con overflow-x: auto).

## Ronda 2 (CHANGES_REQUESTED en review_62.md)

1. `tests/code-copy-button.test.mjs` compactado de 140 a 98 líneas: cabecera de comentarios
   resumida (REQ-CC-01..05 siguen descritos), fake de botón en menos líneas, helpers
   `fakeClipboard`/`fakePre` y `countLines` en una línea. Las aserciones de REQ-CC-01..05 se
   conservan todas, sin cambiar sus mensajes.
2. REQ-62-08 en `tests/code-copy-fixed-corner.test.mjs` ahora comprueba también
   `code-copy-button.test.mjs` (98) y `code-copy-status.test.mjs` (100), con el mismo conteo
   que el resto del arnés (la línea final vacía no cuenta).
3. Coherencia con design.md: el fake `appended` muerto de los pre desaparece. El fake del
   envoltorio registra lo que recibe (`wraps`), y REQ-CC-02/03 afirman ahora que el botón
   cuelga del envoltorio y que no se duplican envoltorios (las aserciones «pasan al envoltorio»).
- Verificación: 17/17 en los tres archivos de code-copy; suite completa y `./init.sh` en verde.
