# Implementación — feature 105 hero-backdrop-subtle-bottom

Spec: `specs/105_hero-backdrop-subtle-bottom/requirements.md` (REQ-105-01..17) y `design.md`.
Análisis: `progress/research/hero-backdrop-subtle-bottom.md`. Petición humana (2026-10-20):
fondo más grande y desbordado, más sutil y por debajo del icono principal.

## Archivos tocados

| Archivo | Cambio | Líneas |
|---|---|---|
| `src/styles/hero-card-accents.css` | `.card-backdrop`: `--card-backdrop-opacity: 0.06`, `left/right: -16px`, `bottom: 0`, `z-index: 0`, sin `height`; en `@media (max-width: 1200px)` solo `left/right: -10px` (sin z-index ni height). `.card-backdrop svg`: `display: block; width: 100%; height: auto; aspect-ratio: 4 / 1`. Reglas por logo: `.card-backdrop:has(use[href$="#anthropic-wordmark"]) svg { aspect-ratio: 182 / 24; margin-bottom: calc(-100% * 2 / 182); }` y `.card-backdrop:has(use[href$="#github-wordmark"]) svg { aspect-ratio: 249.1 / 67.5; }`. Esquina y header reservado sin cambios. | 41 → 49 |
| `tests/hero-backdrop-subtle-bottom.test.mjs` | Test nuevo (solo `node:test`, `node:assert`, `node:fs`): REQ-105-01/02/03/04/05/06/14/15 y capturas + líneas (12/16/17). REQ-105-06 lee el viewBox del symbol del sprite (solo lectura) y compara con el aspect-ratio (±0,01). | 93 |
| `tests/hero-cards-extra-logos.test.mjs` | Ajuste «Ajuste feature 105 (precedente REQ-43-06)»: el test REQ-103-19/20/21/22 pasa a REQ-103-21/22 + REQ-105-02/04/05 (-16px/0/sin height, -10px, svg 100%/auto, opacidad 0.06); el de REQ-103-31 pasa a REQ-105-01 (z-index `0`, esquina `3`, icono sin z-index, sin z-index en @media). Se sustituyeron aserciones, no se añadieron líneas. | 100 → 100 |
| `progress/research/hero105/*.png` | 10 capturas (claude-code y github a 375/800/1024/1280/1600). | — |

Sin cambios (sha256 antes y después idénticos): `public/assets/svg/sprite.svg`,
`src/content/posts/systems-design/*.md`, `tests/hack-the-box-sprite.test.mjs`, `src/styles/hero-card.css`,
`src/styles/tokens.css`, `src/data/hero-cards.json`, `src/domain/hero-grid-layout.ts`,
`src/domain/hero-grid-template.ts`, `src/components/hero-card.astro` (REQ-105-17).

## Desviación respecto al design.md (para el reviewer)

El design suponía que con el aspect-ratio exacto del viewBox «el glifo llena el svg». Es así en
`github-wordmark`, pero en `anthropic-wordmark` el trazo ocupa y = 2..22 de un viewBox de 24 de alto
(leído del path del sprite, sin tocarlo). Con solo el aspect-ratio, la primera medida CDP dio el borde
inferior del `use` de CLAUDE CODE a 5,0 / 2,4 / 2,8 / 3,4 / 3,9 px del de la card (375/800/1024/1280/1600):
REQ-105-07 (≤ 2 px) fallaba. Arreglo mínimo en la misma regla por logo: `margin-bottom: calc(-100% * 2 / 182)`
(el % del margen se resuelve sobre el ancho de `.card-backdrop`, que es el del svg, así que baja exactamente
2 unidades del viewBox a cualquier ancho; lo que sobresale lo recorta el `overflow: hidden` de `.hero-card`).
No cambia ningún valor de REQ-105-04/05/06 (`bottom: 0`, sin height, aspect-ratio 182 / 24). Valor revisable.

## Ciclo rojo / verde

Rojo (tests escritos, CSS de la 103 sin tocar):
`node --test tests/hero-backdrop-subtle-bottom.test.mjs tests/hero-cards-extra-logos.test.mjs`

```
✖ REQ-105-01: .card-backdrop en z-index 0 fuera de @media, sin redefinirlo dentro, y antes de .card-icon en el DOM
    actual: '2', expected: '0'
✖ REQ-105-02: --card-backdrop-opacity 0.06 y opacity var(--card-backdrop-opacity)
    actual: [ '0.1', ... ]  expected: [ '0.06', ... ]
✔ REQ-105-03: la hoja no declara transform, transition ni :hover para el fondo
✖ REQ-105-04: left/right -16px y bottom 0 fuera de @media, -10px en <= 1200 px, sin height en ningún rango
    actual: [ 'absolute', '22px', '22px', 'var(--gap-card)', '40px' ]  expected: [ 'absolute', '-16px', '-16px', '0', undefined ]
✖ REQ-105-05: .card-backdrop svg con display block, width 100%, height auto y aspect-ratio 4 / 1
    actual: [ 'block', '100%', '100%', undefined ]  expected: [ 'block', '100%', 'auto', '4 / 1' ]
✖ REQ-105-06: ... AssertionError: falta .card-backdrop:has(use[href$="#anthropic-wordmark"]) svg { aspect-ratio }
✔ REQ-105-14: la esquina y el header reservado conservan 22px/16px/46px y 18px/14px/40px
✔ REQ-105-15: tests/hero-cards-extra-logos.test.mjs lleva la nota del ajuste y ya no exige la franja de la 103
✖ REQ-105-12/16/17: ... AssertionError: falta hero105/claude-code-375.png
✖ REQ-103-21/22 + REQ-105-02/04/05 (Ajuste feature 105 (precedente REQ-43-06)): ... (22px / var(--gap-card) / 40px)
✖ REQ-105-01 (antes REQ-103-31): ... actual: [ '2', '3', false, undefined ]  expected: [ '0', '3', false, undefined ]
ℹ tests 20
ℹ pass 12
ℹ fail 8
```

Verde (CSS nuevo + capturas):

```
✔ REQ-105-01 ... ✔ REQ-105-02 ... ✔ REQ-105-03 ... ✔ REQ-105-04 ... ✔ REQ-105-05 ... ✔ REQ-105-06 ...
✔ REQ-105-14 ... ✔ REQ-105-15 ... ✔ REQ-105-12/16/17 ...
✔ REQ-103-01 ... ✔ REQ-103-09/10/11 (build) ... ✔ REQ-103-16/17/18 ...
✔ REQ-103-21/22 + REQ-105-02/04/05 (Ajuste feature 105 (precedente REQ-43-06)) ...
✔ REQ-105-01 (antes REQ-103-31) ... ✔ REQ-103-26/27/30 ...
ℹ tests 20
ℹ pass 20
ℹ fail 0
```

Suite completa (`pnpm test`): `ℹ tests 1098 · ℹ pass 1098 · ℹ fail 0`.
`./init.sh`: código 0, «✔ tests al 100% (node:test)», «✔ build de producción (pnpm build)»,
«✔ El entorno está perfecto».

## Medida CDP (Chrome headless; `pnpm build` + `pnpm preview --port 4415`, ya parado; alto 1000 px, DPR 1)

Medidor: `<scratchpad>/cdp105/m105.mjs` (base `cdp103/m-r1.mjs`). Línea base con el CSS de la 103 en
`cdp105/base.json`; final en `cdp105/final.json`. Rejilla 20 x 5 sobre el rect del `use` recortado a la
card, con `pointer-events: auto !important` inyectado solo para medir en los tres svg; por punto se mira el
índice en `elementsFromPoint` del svg de `.card-backdrop` y del svg de `.card-icon`.

Línea base (103, z-index 2): «fondo antes que icono» 100/100 a 800-1600 px y 50/100 a 375 en las dos cards:
el defecto que pidió corregir el humano.

Final (CC = CLAUDE CODE, GH = GITHUB):

| Ancho | Card | borde inf. use → card (px) | ancho use / interior | fondo antes que icono | icono antes que fondo / solo fondo / ninguno | opacity · z | solape título-fondo / título-esquina | contraste título (compuesto · solo fondo de marca) |
|---|---|---|---|---|---|---|---|---|
| 375 | CC | 1 | 356,7 / 345 | **0** | 30 / 68 / 2 | 0.06 · 0 | 0 / 0 | 12,27 · 11,65 |
| 375 | GH | 1 | 364,7 / 345 | **0** | 30 / 70 / 0 | 0.06 · 0 | 0 / — | 18,88 · 18,71 |
| 800 | CC | 1 | 128,5 / 111 | **0** | 0 / 87 / 13 | 0.06 · 0 | 0 / 0 | 12,27 · 11,65 |
| 800 | GH | 1 | 131,4 / 111 | **0** | 60 / 34 / 6 | 0.06 · 0 | 0 / — | 18,88 · 18,71 |
| 1024 | CC | 1 | 163,2 / 147 | **0** | 20 / 72 / 8 | 0.06 · 0 | 0 / 0 | 12,27 · 11,65 |
| 1024 | GH | 1 | 166,9 / 147 | **0** | 60 / 38 / 2 | 0.06 · 0 | 0 / — | 18,88 · 18,71 |
| 1280 | CC | 1 | 214,5 / 187 | **0** | 96 / 0 / 4 | 0.06 · 0 | 0 / 0 | 12,27 · 11,65 |
| 1280 | GH | 1 | 219,4 / 187 | **0** | 98 / 0 / 2 | 0.06 · 0 | 0 / — | 18,88 · 18,71 |
| 1600 | CC | 1 | 262,4 / 236 | **0** | 98 / 0 / 2 | 0.06 · 0 | 0 / 0 | 12,27 · 11,65 |
| 1600 | GH | 1 | 268,3 / 236 | **0** | 99 / 0 / 1 | 0.06 · 0 | 0 / — | 18,88 · 18,71 |

- El 1 px restante del borde inferior es el borde de la card (`getBoundingClientRect` incluye el borde;
  `bottom: 0` ancla al borde de relleno). El svg exterior también queda a 1 px.
- «Solo fondo» son puntos donde el svg del icono principal no está (no cubre esa zona de la card); en
  ningún punto el fondo queda delante del icono (REQ-105-08).
- REQ-105-12: los 15 `article.hero-card` con delta máximo 0 px (x, y, w, h) frente a la línea base a los
  cinco anchos; `.new-hero` scrollWidth/clientWidth 365/365, 790/790, 1014/1014, 1270/1270, 1590/1590
  (documento igual al viewport); 0 errores de consola, de excepción, de log y de red (incl. respuestas >= 400).
- REQ-105-13: hijos de cada card iguales a la línea base; 12 cards con exactamente
  `header.card-header+div.card-icon`; CLAUDE CODE `header+card-backdrop+card-icon+card-corner`, GITHUB
  `header+card-backdrop+card-icon`. `dist/client/index.html` idéntico al de la línea base salvo el hash
  del CSS y el token cifrado del server island de HTB (cambia en cada build).
- REQ-105-03 / hover: con el puntero encima, `.card-backdrop` sigue con `transform: none`, sin
  transición propia; card, icono y esquina con los mismos estilos de hover que la línea base (la única
  diferencia es la opacidad 0.1 → 0.06). BUN (sin extras) idéntica antes y después.
- Capturas: `progress/research/hero105/{claude-code,github}-{375,800,1024,1280,1600}.png`.

## Servidores

Arranqué y paré `pnpm preview --port 4415` (línea base y final, dos veces la final por el ajuste del
margen). No toqué el `pnpm dev` de :4321 (PID 34400, sigue escuchando). Sin commits.

## Pendiente humano (ak, ampliado)

Valores por defecto revisables: z-index 0 (alternativa -1), opacidad 0.06, left/right -16px / -10px,
bottom 0, alto por aspect-ratio y, nuevo, el `margin-bottom: calc(-100% * 2 / 182)` de anthropic-wordmark
para compensar el margen interno de 2 unidades de su viewBox.
