# Review — feature 105

**Veredicto:** APPROVED

## Revisión 1 (nivel 1), 2026-10-20

Alcance: solo la 105 (`src/styles/hero-card-accents.css`, `tests/hero-backdrop-subtle-bottom.test.mjs`, `tests/hero-cards-extra-logos.test.mjs`). No evalúo los cambios sin commitear de features cerradas ni los del humano (`public/assets/svg/sprite.svg`, `src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`).

### Checkpoints
- C1 Estilos en `src/styles/*.css`, sin `<style>` en `.astro`: [x] (único cambio de código: `hero-card-accents.css:24-41,48`; `hero-card.astro` no se toca)
- C2 Sin lógica en la UI, sin JS: [x] (solo CSS; no hay transform, transition ni `:hover` en la hoja, lo cubre REQ-105-03)
- C3 Datos vía repositorio: [x] (no cambia; `hero-cards.json` sin tocar)
- C4 Tokens, sin valores sueltos: [x] (la opacidad va en `--card-backdrop-opacity: 0.06`; -16px/-10px, los aspect-ratio y el `margin-bottom` son geometría del logo, el mismo criterio que `.card-icon svg`, como dice design.md)
- C5 ≤ 100 líneas: [x] (`hero-card-accents.css` 49, `hero-backdrop-subtle-bottom.test.mjs` 93, `hero-cards-extra-logos.test.mjs` 100)
- C6 Sin dependencias nuevas: [x] (el test usa solo `node:test`, `node:assert` y `node:fs`)
- C7 TDD documentado: [x] (en `progress/impl_hero-backdrop-subtle-bottom.md` está el rojo con el CSS de la 103: 8 fallos, entre ellos z-index `'2'` frente a `'0'`, opacidad `0.1` frente a `0.06` y la franja 22px/40px; después el verde con 20/20 y la suite con 1098/1098. Los tres tests en verde que había en el rojo, REQ-105-03/14/15, son invariantes o ya estaban ajustados, así que es correcto que pasaran.)
- C8 `depends_on`: [x] (la 105 no tiene `depends_on`)
- C9 `./init.sh` en verde: [x] (terminó con código 0: tests al 100 %, build de producción y «El entorno está perfecto»)
- C10 Verificación visual sin errores: [x] (mi propia medición CDP, abajo)

### Verificación independiente (Chrome headless + CDP; build de init.sh, `pnpm preview --port 4425`, ya parado; :4321 sin tocar)

Medidor propio `scratchpad/rev105/r.mjs`, separado de `cdp105/m105.mjs`. Resultado en `scratchpad/rev105/out.json`. Anchos 375/800/1024/1280/1600, viewport de 1000 px de alto, DPR 1.

| Comprobación | CLAUDE CODE | GITHUB |
|---|---|---|
| Borde inferior del `use` al borde de la card (REQ-105-07) | 1,0 px en los 5 anchos | 1,0 px en los 5 anchos |
| Ancho del `use` frente al ancho interior | 356,7/345 · 128,5/111 · 163,2/147 · 214,5/187 · 262,4/236 | 364,7/345 · 131,4/111 · 166,9/147 · 219,4/187 · 268,3/236 |
| Rejilla 20x5: puntos donde el fondo va antes que el icono (REQ-105-08) | 0 (de 30/0/20/96/98 puntos compartidos) | 0 (de 30/60/60/98/99) |
| opacity / z-index calculados (REQ-105-09) | 0.06 / 0 | 0.06 / 0 |
| Solape título-fondo / título-esquina (REQ-105-10) | 0 / 0 | 0 / — |
| Contraste del título sobre el color compuesto (REQ-105-11) | 12,27:1 | 18,88:1 |

- REQ-105-12: delta máximo de 0 px en los 15 `article.hero-card` frente a `cdp105/base.json` (la línea base de la 103) en los cinco anchos. `.new-hero` tiene scrollWidth = clientWidth (365, 790, 1014, 1270, 1590) y el documento no supera esos anchos. 0 errores de consola, 0 excepciones y 0 errores de red.
- REQ-105-13: 12 cards con exactamente `header.card-header + div.card-icon` en los cinco anchos.
- Hover y esquina: la hoja no declara transform, transition ni `:hover` para el fondo (`hero-card-accents.css` completo). Los valores de `.card-corner` y del header reservado (22/16/46 y 18/14/40) no cambian, lo cubre REQ-105-14 en verde. Las medidas de hover del implementer coinciden con la línea base salvo la opacidad.
- Capturas `progress/research/hero105/`: miré claude-code-375/1280 y github-375/1600. El wordmark se ve muy tenue, ocupa el borde inferior, desborda por los lados y queda claramente detrás del icono principal. El cuerpo blanco del Octocat lo tapa y solo se ve por los huecos recortados del glifo, que es lo esperable. El título se lee limpio. El resultado es sutil y cumple la petición humana.

### Valoración de la desviación (`margin-bottom: calc(-100% * 2 / 182)` en anthropic-wordmark, línea 48)

Se acepta.
- Hacía falta: sin ella, el implementer midió de 2,4 a 5,0 px de hueco y REQ-105-07 fallaba.
- Es correcta: el margen en % se resuelve sobre el ancho del bloque contenedor (`.card-backdrop`), que es el ancho del svg. Con el ratio exacto 182/24 y el meet del symbol, desplaza exactamente 2 unidades del viewBox a cualquier ancho. Lo que sobresale lo recorta el `overflow: hidden` de `.hero-card`. Lo confirmé: el svg exterior de CLAUDE CODE sobresale entre 0,4 y 3 px por debajo de la card y el glifo queda a 1 px, que es el borde.
- No contradice ningún literal de REQ-105-04/05/06 (sigue `bottom: 0`, sin height y con aspect-ratio 182 / 24).
- Está en la regla por logo, con su comentario (líneas 43-46).

Observaciones que no bloquean (para el humano o un ajuste futuro):
1. Ningún test fija el valor y su relación con el path del sprite (y = 2..22 de 24). Si cambia `anthropic-wordmark` en `sprite.svg`, el margen quedaría desfasado sin que nada falle, salvo que se repita la CDP.
2. `design.md` sigue diciendo que «el glifo llena el svg» para los dos logos. La desviación solo está documentada en el impl.
3. El impl dice que «el svg exterior también queda a 1 px». En CLAUDE CODE no es así: el svg exterior sobresale por abajo (entre -0,4 y -3 px) y lo recorta la card. No cambia el resultado.

## Cambios requeridos
Ninguno.
