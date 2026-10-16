# Implementación — feature 97 hero-cards-unique-tech

Estado (ronda 1): **blocked**. La implementación está completa en el árbol, sin commits. `./init.sh` está en rojo solo por 2 tests de otras features (95 y 96) que congelan `src/styles/tokens.css` frente a HEAD (ver "Bloqueo").

## Archivos tocados

- `src/data/hero-cards.json`: 5 entradas cambian id, title, colorToken e icon (twitch→rust, node-bottom→aws, github-bottom→claude-code, youtube-bottom→nestjs, twitch-bottom→cloudflare). gridColumn, gridRow, rotate, scale, iconWidth y el orden del array quedan intactos. htb no se toca.
- `src/styles/tokens.css`: salen twitch, twitch-bottom, node-bottom, github-bottom y youtube-bottom; entran rust, aws, claude-code, nestjs y cloudflare. Sigue en 99 líneas y no hay comentarios nuevos.
- `src/styles/hero-card.css`: las 5 reglas `[data-color-token]` se renombran conservando la misma `--card-column`/`--card-row`, el mismo `--icon-width` y el mismo `--icon-rotation`. Dentro de `@media (max-width: 1200px)` se añade `.card-header { left: 14px; right: 14px; }` y `.card-title { font-size: 0.8rem; letter-spacing: 0.04em; }` (Decisión 5), con una línea de comentario. Pasa de 85 a 88 líneas.
- Tests nuevos y ajustados con la nota «Ajuste feature 97 (REQ-97-13, ... precedente REQ-43-06)»: `tests/hero-cards-unique-tech.test.mjs` (nuevo, 100 líneas), `tests/hero-cards-repository.test.mjs` (EXPECTED_CARDS), `tests/hero-cards-styles.test.mjs` (CARD_TOKENS), `tests/design-tokens.test.mjs` (MARCA_TOKENS) y `tests/htb-hero-card.test.mjs` (REQ-92-01: htb va tras cloudflare).

## Tabla final celda → tecnología (valores finales, iguales en JSON y CSS)

| # | Celda (col x fila) | id | Título | Token / hex | iconWidth | rotate |
|---|---|---|---|---|---|---|
| 1 | 6 / span 5 x 1 / span 2 | react | REACT | #0E6C82 | 165px | -8 |
| 2 | 11 / span 2 x 1 / span 2 | html | HTML | #B74D05 | 115px | -7 |
| 3 | 6 / span 2 x 3 / span 2 | node | NODE JS | #08783A | 120px | -10 |
| 4 | 8 / span 5 x 3 / span 2 | github | GITHUB ACTIONS | #091223 | 190px | -12 |
| 5 | 6 / span 5 x 5 / span 2 | youtube | YOUTUBE | #B61111 | 170px | -8 |
| 6 | 11 / span 2 x 5 / span 2 | rust | RUST | #A33A16 | 115px | -8 |
| 7 | 1 / span 2 x 7 / span 2 | typescript | TYPESCRIPT | #215BC7 | 110px | -10 |
| 8 | 3 / span 2 x 7 / span 2 | css | CSS | #6E29C8 | 105px | -8 |
| 9 | 5 / span 2 x 7 / span 2 | aws | AWS | #232F3E | 120px | -6 |
| 10 | 7 / span 4 x 7 / span 2 | claude-code | CLAUDE CODE | #5C2A1C | 165px | 0 |
| 11 | 11 / span 2 x 7 / span 2 | nestjs | NESTJS | #A3132F | 120px | -5 |
| 12 | 1 / span 8 x 9 / span 2 | cloudflare | CLOUDFLARE | #A8470C | 170px | -6 |
| 13 | 9 / span 4 x 9 / span 2 | htb | HACK THE BOX | #1A2332 | — | — |

Se dejan iconWidth y rotate en los valores de partida de design.md (Decisión 4). Razones:
- Los iconos de sprite cuadrados (rust, aws, claude-code, nestjs) se dibujan a 32 px de alto x scale 5, así que iconWidth solo los desplaza unos píxeles; no cambia su tamaño.
- El wordmark de cloudflare (512x76) se ve con la nube y «CLOU» a 375, 1280 y 1600 px. A 800 y 1024 (card de 113 a 149 px) solo asoma «OU». Para que la nube se viera ahí haría falta iconWidth ≈ 36 px, fuera del rango 90-200, y además empeoraría la vista en ≥ 1280. Es el mismo recorte parcial que ya tienen TS y CSS en esa franja.

## Ciclo rojo / verde

Rojo, con el test nuevo escrito antes de tocar src/ (`node --test tests/hero-cards-unique-tech.test.mjs`):
```
✖ REQ-97-01/02: 12 tarjetas de icono con fragmento de sprite único y sin redes ni claude/bun
✖ REQ-97-03/04: cada entrada coincide con la tabla de design.md en datos, celda y orden   (posición 6: se esperaba rust, hay twitch)
✖ REQ-97-05/06: tokens.css declara los 5 tokens nuevos, retira los 5 viejos y no supera 100 líneas   (falta --color-marca-rust: #A33A16)
✖ REQ-97-07/08: hero-card.css tiene una regla por tarjeta nueva con su fondo y su celda   (falta [data-color-token="rust"])
✔ REQ-97-09: contraste >= 4,5:1 (cálculo sobre los hex de la spec; pasa por diseño)
✔ REQ-97-10: htb intacta (invariante; debe seguir verde)
ℹ pass 2  ℹ fail 4
```
Rojo de los 4 tests reapuntados, antes de tocar src/:
```
✖ REQ-02-03 (design-tokens)  ✖ REQ-06-01  ✖ REQ-31-02/05 (repository)
✖ REQ-04-02  ✖ design.md Decisión 2 (styles)  ✖ REQ-92-01 (htb tras cloudflare)
ℹ pass 29  ℹ fail 6
```
Verde tras implementar: `tests/hero-cards-unique-tech.test.mjs` 6/6 y los 4 reapuntados 35/35. Suite completa: `ℹ tests 1015 ℹ pass 1013 ℹ fail 2`. `./init.sh`: entorno, formato y build ✔; tests ✘ solo por los 2 fallos del bloqueo.

## Bloqueo

```
✖ REQ-95-08: archivos congelados sin cambios frente a HEAD        (tests/home-latest-articles-five.test.mjs:59-61)
✖ REQ-96-39/40/42: congelados, notas de ajuste y archivos <= 100 líneas   (tests/latest-cards-gsap-motion.test.mjs:96)
  AssertionError: congelados modificados
```
Las dos listas incluyen `src/styles/tokens.css`, y he comprobado que es el único archivo de esas listas que cambia. REQ-97-05/06 obliga a modificar tokens.css. Sin embargo, REQ-97-13 solo autoriza ajustar 4 tests (repository, styles, design-tokens, htb), y estos dos son de las features 95 y 96, ya cerradas. Tocarlos sería salir del alcance listado, así que paro y lo dejo en blocked. Opciones:
1. spec_author amplía REQ-97-13 (o añade un REQ) para quitar `'src/styles/tokens.css'` de esas dos listas de congelados con la nota «Ajuste feature 97 (precedente REQ-43-06)». Son 2 líneas y después la suite queda al 100%.
2. Que esas congelaciones comparen con el commit de cierre de la 96 (fbee915) en vez de con HEAD. También es un cambio de test de otra feature.

(Al hacer commit, `git diff HEAD` volvería a estar limpio, pero REQ-97-15 exige el verde antes del cierre.)

## Verificación visual (Chrome headless + CDP, pnpm build + pnpm preview :4397)

Script ad hoc en el scratchpad (`cdp97.mjs`), con la base medida sobre el build de antes del cambio. Capturas del grid en `progress/research/hero97/hero-grid-{375,800,1024,1280,1600}.png`.

| Ancho | Geometría de las 13 cards igual a la base (x, y, w, h, grid-column, grid-row) | Títulos dentro (right de cada palabra ≤ right de la card) | Palabras partidas | ids repetidos | scrollWidth / clientWidth | Errores de consola |
|---|---|---|---|---|---|---|
| 375 | 13/13 | 13/13 | 0 | 0 | 365 / 365 | 0 |
| 800 | 13/13 | 13/13 (base: TYPESCRIPT se salía, 142,7 > 133,2) | 0 | 0 | 838 / 790 (*) | 0 |
| 1024 | 13/13 | 13/13 | 0 | 0 | 1014 / 1014 | 0 |
| 1280 | 13/13 | 13/13 | 0 | 0 | 1270 / 1270 | 0 |
| 1600 | 13/13 | 13/13 | 0 | 0 | 1590 / 1590 | 0 |

- (*) A 800 px el scroll horizontal ya existía antes del cambio (838/790 en la base). Lo provoca `search.search-bar` del header (right 838), que es el desborde 769-849 px de la feature 93, blocked. El grid aporta 0 elementos fuera del viewport (gridOver 0 a los 5 anchos).
- Ejemplos de bordes derechos a 800 px (palabra más a la derecha / card): TYPESCRIPT 118,2 / 133,2 y CLOUDFLARE 755,2 / 770,2 (contenedor de 14 px). En ≤ 1200 px el título queda a 12,8 px y 0,04em; en ≤ 768 px, a 13,12 px (0,82rem, se conserva). En ≥ 1201 px no cambia: 15,2 px y 0,08em.
- Con `.card-header` a left/right 14 px, el `p.card-title` mide el ancho del header, así que su rect siempre acaba 14 px antes del borde de la card. Por eso la medida de verdad es el `getClientRects` de cada palabra (Range): todas dentro y en una sola línea.
- Iconos: todos visibles (svg display inline, intersección con la card > 0 a todos los anchos) y reconocibles en las capturas a 375, 1280 y 1600. A 800/1024 los iconos blancos de RUST y GITHUB ACTIONS tapan su título igual que TWITCH y GITHUB ACTIONS en la base: es preexistente (scale 5 en cards de 113 a 149 px) y la spec no lo cubre. CLOUDFLARE se recorta a «OU» en esa franja (ver arriba).
- Servidores: paré mi preview de :4397; el pnpm dev de :4321 (PID 34400) sigue sin tocar.

---

## Ronda 2 (2026-10-15, tras el desbloqueo: REQ-97-13 ampliado y REQ-97-16 a 23 nuevos)

Estado: **blocked**. Todo lo de ≤ 1200 px está hecho y medido, y `./init.sh` está en verde al 100 %. Queda **un único incumplimiento, que no se puede resolver dentro de la spec**: REQ-97-16 a 1280 y 1600 px (nube de CLOUDFLARE al 62,3 % dentro, y se exige ≥ 90 %). Ver «Bloqueo ronda 2».

### Archivos tocados en esta ronda

- `tests/home-latest-articles-five.test.mjs` (REQ-95-08) y `tests/latest-cards-gsap-motion.test.mjs` (REQ-96-39/40/42): sale `'src/styles/tokens.css'` de la lista de congelados, con la nota «Ajuste feature 97 (precedente REQ-43-06): sin tokens.css». En el segundo la nota va en la misma línea y el archivo se queda en 100 líneas.
- `tests/hero-cards-icon-fit.test.mjs` (nuevo, 88 líneas): cubre REQ-97-19/20/21 y Decisión 8. Comprueba que las reglas `[data-color-token]` dentro de `@media` solo declaran `--icon-width` (30-200px), `--icon-rotation` (-12deg a 0deg) o `--icon-scale` (2 a 5); que el bloque 1200 lleva los ajustes exactos (`EXPECTED_1200`) detrás de la primera regla `.hero-card`; que `iconWidth`/`rotate` del JSON coinciden con la regla base; que `hero-section.css` no cambia frente a HEAD; que la primera regla del bloque 1200 es exactamente `grid-column/grid-row: auto !important`; que ningún override toca `grid-*`, `min-height` ni `--card-*`; y que hero-card.css y el test tienen ≤ 100 líneas.
- `src/styles/hero-card.css` (88 → 94 líneas): dentro de `@media (max-width: 1200px)`, detrás de la primera regla y del ajuste de título, van 1 comentario y 5 reglas. No cambian ni la geometría, ni `hero-section.css`, ni el bloque 768, ni la regla base.

### Valores finales (en `@media (max-width: 1200px)`; también aplican en ≤ 768 px)

| Token | Override | Por defecto en design.md | Motivo del cambio |
|---|---|---|---|
| github | `--icon-width: 110px; --icon-scale: 2; --icon-rotation: 0deg` | scale 2.5, 0deg | Con 2.5 a 800 px GITHUB ACTIONS envuelve a 2 líneas y quedaba un solape de 76,8 px² (borde superior del logo a 51 px). Con 2 queda a 60 px. Con width 110px el logo se centra en la card (la caja de 190px lo dejaba al 66,8 % y cortado por la izquierda) |
| rust | `--icon-scale: 3` | = | — |
| aws | `--icon-scale: 3` | (solo si fallaba) | A 800 px y scale 5 solapaba 489,3 px² |
| claude-code | `--icon-scale: 2` | (solo si fallaba) | A 800 px y scale 5 solapaba 1501,3 px². Con 3 seguía en 361,1 px² (CLAUDE CODE envuelve a 2 líneas) |
| cloudflare | `--icon-width: 34px; --icon-rotation: 0deg` | 34px | Con -6deg, a 375 px la nube quedaba al 79,6 % (la rotación la saca por abajo). Con 0deg queda al 100 % a 375/800/1024 |

El bloque 768 se conserva tal cual (`.card-icon svg { width: 110px !important; }`). Las escalas y rotaciones del bloque 1200 también aplican a 375 px, así que a ese ancho los logos se ven algo más pequeños que en la ronda 1, todos dentro (95-100 %).

### Ciclo rojo / verde

Rojo del test estático (`node --test tests/hero-cards-icon-fit.test.mjs`, antes de editar hero-card.css):
```
✖ REQ-97-19: las reglas [data-color-token] de los @media solo declaran ... en rango   (no hay ajustes de icono por tramo)
✖ REQ-97-19 (design.md Decisión 4): ajustes por defecto en @media (max-width: 1200px) tras la primera regla   (cloudflare --icon-width: actual undefined, expected '34px')
✔ REQ-97-20  ✔ REQ-97-21  ✔ Decisión 8
ℹ pass 3  ℹ fail 2
```
Rojo CDP (REQ-97-23), sobre el build del árbol previo al ajuste, a 800 px: nube de CLOUDFLARE al **0 %** dentro (< 90), solape con el título en RUST **597,1 px²** y en GITHUB ACTIONS **1775,4 px²** (también AWS 489,3, CLAUDE CODE 1501,3 y CLOUDFLARE 1459,9). A 375 la nube estaba al 79,6 %, y a 1280/1600 al 62,3 %.

Al aplicar los valores finales, `EXPECTED_1200` del test se actualizó con lo que pedía la medida (se partió de los valores por defecto de design.md). Verde: `tests/hero-cards-icon-fit.test.mjs` 5/5. Los dos tests de congelados ajustados: 14/14. `pnpm test`: `ℹ tests 1020 ℹ pass 1020 ℹ fail 0`. `./init.sh`: entorno, formato, tests al 100 % y build ✔ («El entorno está perfecto»).

### Mediciones CDP finales (Decisión 7; build + `pnpm preview` en :4397, scripts `cdp97r2.mjs` + `fit97.js` en el scratchpad)

Columnas: % del logo dentro del article / centro dentro / solape con las palabras del título (px²). En CLOUDFLARE se añade el % de la nube.

| Card | 375 | 800 | 1024 | 1280 | 1600 |
|---|---|---|---|---|---|
| RUST | 95,2 / sí / 0 | 92,3 / sí / 0 | 95,2 / sí / 0 | 65,2 / sí / 0 | 65,2 / sí / 0 |
| AWS | 96,4 / sí / 0 | 92,5 / sí / 0 | 96,4 / sí / 0 | 67,7 / sí / 0 | 67,7 / sí / 0 |
| CLAUDE CODE | 100 / sí / 0 | 90,5 / sí / 0 | 100 / sí / 0 | 80,6 / sí / 0 | 80,6 / sí / 0 |
| NESTJS (exenta de REQ-97-18) | 65,3 / sí / 0 | 49,6 / sí / 871 | 65,0 / sí / 871 | 67,5 / sí / 0 | 67,5 / sí / 0 |
| GITHUB ACTIONS | 100 / sí / 0 | 100 / sí / 0 | 100 / sí / 0 | 75,8 / sí / 0 | 75,8 / sí / 0 |
| CLOUDFLARE: logo / nube / solape | 60,9 / **100** / 0 | 62,9 / **100** / 0 | 62,9 / **100** / 0 | 44,1 / **62,3 ✘** / 0 | 44,1 / **62,3 ✘** / 0 |

- REQ-97-17: centro dentro y ≥ 40 % en RUST, AWS, CLAUDE CODE y NESTJS a los 5 anchos ✔.
- REQ-97-18: solape 0 en RUST, AWS, CLAUDE CODE, CLOUDFLARE y GITHUB ACTIONS a los 5 anchos ✔. NESTJS queda exenta porque su único fill es #E0234E, que da 4,65:1 frente a #fff. Su solape de 871 px² a 800/1024 es tono sobre tono. Nota: el #D97757 de claude-code me sale 3,12:1, no 3,73 como dice design.md; en los dos casos no está exento.
- REQ-97-16: ✔ a 375/800/1024; **✘ a 1280/1600** (ver bloqueo).
- REQ-97-22: `article.right <= innerWidth` para las 13 cards a los 5 anchos ✔. gridOver 0 a los 5 anchos. El scrollWidth/clientWidth de 838/790 a 800 px lo provoca `search.search-bar` (feature 93), fuera de alcance. El resto de los elementos que pasan de `clientWidth` son el carrusel de últimos artículos (recortado, scrollWidth = clientWidth), igual que en la ronda 1.
- Sin regresiones respecto a la ronda 1: la geometría de las 13 cards es idéntica a la base y a la ronda 1 (13/13 a los 5 anchos); las palabras del título quedan dentro (13/13) y ninguna se parte; no hay ids repetidos (0) ni errores de consola (0).
- Observación (cards preexistentes que la spec deja fuera): a 800/1024 siguen tapando el título REACT 729,9, HTML 605,6, NODE JS 896, YOUTUBE 1028,5, TYPESCRIPT 1344,1 y CSS 456,3 px².
- Capturas finales sobrescritas en `progress/research/hero97/hero-grid-{375,800,1024,1280,1600}.png`. A 1280 se ve la nube de cloudflare cortada por abajo.
- Servidores: paré mi preview de :4397. El pnpm dev de :4321 (PID 34400) sigue sin tocar.

### Bloqueo ronda 2: REQ-97-16 a 1280/1600 no se puede cumplir dentro de la spec

A partir de 1201 px no hay ningún bloque `@media`, así que manda la regla base de cloudflare: `--icon-width: 170px; --icon-rotation: -6deg`, card de 204 px de alto y scale 5. La nube proyectada mide unos 126 px de alto con el centro a 156 px; la rotación de -6deg la baja hasta 44 px más en su lado izquierdo, y solo queda dentro el 62,3 %. Para corregirlo habría que hacer una de dos cosas, y ninguna está permitida:
- Cambiar la regla base, que está fijada por design.md Decisión 4 («mantiene el --icon-width / --icon-rotation de la tabla», 170px / -6), por REQ-97-20 (JSON = base) y por `tests/hero-cards-repository.test.mjs` (fila cloudflare: rotate -6, iconWidth '170px').
- Añadir un `@media (min-width: 1201px)`, que va contra REQ-97-19 («solo dentro de sus bloques @media existentes»).

Cálculo con el mismo método (card 799,7 / 995,3 x 204), % de la nube dentro según la base de cloudflare:

| iconWidth \ rotate | 0 | -2 | -3 | -6 |
|---|---|---|---|---|
| 170px | 88,0 | 78,0 | 73,5 | 61,6 |
| 160px | 90,4 | 80,2 | 75,6 | 63,6 |
| 150px | 93,1 | 82,7 | 78,0 | 65,8 |
| 140px | 96,2 | 85,6 | 80,8 | 68,3 |
| 130px | 99,7 | 88,9 | 84,0 | 71,2 |

Opciones para spec_author o el humano:
1. **(Recomendada)** Cambiar la fila cloudflare de la tabla de design.md a iconWidth **140px** y rotate **0** (96 %). Se ajustan a la vez el JSON, la regla base de hero-card.css y la fila de `tests/hero-cards-repository.test.mjs` (y `tests/hero-cards-unique-tech.test.mjs` si fija esos campos), con la nota de ajuste. Son 3-4 líneas; los overrides por tramo no cambian. 150px / 0 también cumple (93,1 %).
2. Relajar REQ-97-16 a ≥ 60 % a 1280/1600 (ya cumple con 62,3 %), aceptando que la nube se vea cortada por abajo como en la captura.
3. Permitir un `@media (min-width: 1201px)` nuevo solo para cloudflare (cambia REQ-97-19).

## Ronda 3 (2026-10-15, tras el ajuste de spec de la ronda 2: base de cloudflare 140px / 0)

Estado: **implementada; lista para revisión**. Los cambios de las rondas 1 y 2 siguen en el árbol tal cual. En esta ronda solo cambia la base de cloudflare (design.md, fila 12 y Decisión 4, «Base de cloudflare (ronda 2)»).

### Archivos tocados en esta ronda

- `tests/hero-cards-repository.test.mjs`: la fila cloudflare de `EXPECTED_CARDS` pasa a `rotate: 0, iconWidth: '140px'` (antes -6 / '170px'). Se añade la nota «// Ajuste feature 97 ronda 2: base de cloudflare 140px / 0 (REQ-97-16 a 1280/1600).».
- `src/data/hero-cards.json` (cloudflare): `"rotate": 0` y `"iconWidth": "140px"`.
- `src/styles/hero-card.css`: la regla base `[data-color-token="cloudflare"]` (fuera de `@media`) pasa a `--icon-width: 140px; --icon-rotation: 0deg;`. Sigue en 94 líneas. El override del bloque 1200 (`34px / 0deg`) no cambia.
- `tests/hero-cards-unique-tech.test.mjs` y `tests/hero-cards-icon-fit.test.mjs` no fijan esas cifras: el segundo compara JSON con la regla base, así que se mantiene verde.

### Ciclo rojo / verde

Rojo (`node --test tests/hero-cards-repository.test.mjs`, con el test ya cambiado y antes de tocar el JSON o el CSS):
```
✖ REQ-31-02/REQ-31-05: el loader por defecto entrega las 12 tarjetas de icono + 1 htb reales
  actual:   { id: 'cloudflare', ..., rotate: -6, scale: 5, iconWidth: '170px' }
  expected: { id: 'cloudflare', ..., rotate: 0, scale: 5, iconWidth: '140px' }
ℹ pass 10
ℹ fail 1
```
Verde:
- `node --test` de repository, icon-fit, unique-tech y styles: `ℹ tests 29 ℹ pass 29 ℹ fail 0`.
- `pnpm test`: `ℹ tests 1020 ℹ pass 1020 ℹ fail 0`.
- `./init.sh` (exit 0): «✔ tests al 100% (node:test)», «✔ build de producción (pnpm build)», «✔ El entorno está perfecto».

### Mediciones CDP (Decisión 7; pnpm build + pnpm preview :4397, scripts cdp97r2.mjs / sum97r2.mjs / cmp97r2.mjs del scratchpad)

Formato de cada celda: % del logo dentro del article / centro dentro / solape con las palabras del título (px²).

| Card | 375 | 800 | 1024 | 1280 | 1600 |
|---|---|---|---|---|---|
| RUST | 95,2 / sí / 0 | 92,3 / sí / 0 | 95,2 / sí / 0 | 65,2 / sí / 0 | 65,2 / sí / 0 |
| AWS | 96,4 / sí / 0 | 92,5 / sí / 0 | 96,4 / sí / 0 | 67,7 / sí / 0 | 67,7 / sí / 0 |
| CLAUDE CODE | 100 / sí / 0 | 90,5 / sí / 0 | 100 / sí / 0 | 80,6 / sí / 0 | 80,6 / sí / 0 |
| NESTJS (exenta de REQ-97-18) | 65,3 / sí / 0 | 49,6 / sí / 871 | 65,0 / sí / 871 | 67,5 / sí / 0 | 67,5 / sí / 0 |
| GITHUB ACTIONS | 100 / sí / 0 | 100 / sí / 0 | 100 / sí / 0 | 75,8 / sí / 0 | 75,8 / sí / 0 |
| CLOUDFLARE (logo / **nube** / solape) | 60,9 / **100** / 0 | 62,9 / **100** / 0 | 62,9 / **100** / 0 | 59,0 / **97,2** / 0 | 59,0 / **97,2** / 0 |

- REQ-97-16 ✔ a los 5 anchos. A 1280/1600 la nube pasa del 62,3 % (ronda 2) al **97,2 %** (la estimación de design.md era ~96 %). Con iconWidth 140 px y rotate 0 se calcula a partir de la caja del svg.
- REQ-97-17 ✔ (centro dentro y ≥ 40 % en RUST, AWS, CLAUDE CODE y NESTJS). REQ-97-18 ✔: solape 0 en las 5 cards no exentas a los 5 anchos.
- REQ-97-22 ✔: `article.right <= innerWidth` para las 13 cards a los 5 anchos, y gridOver 0. El 838/790 a 800 px lo provoca `search.search-bar` (feature 93), que queda fuera de alcance.
- Sin regresiones frente a la ronda 2 (`cmp97r2.mjs final.json r3.json`), a los 5 anchos:
  - Geometría: 13/13 idéntica (x, y, w, h, gridColumn, gridRow). También es idéntica frente a la base previa a la feature (`a.json`), con 0 diferencias.
  - Títulos: 13/13 palabras dentro de su card y 0 palabras partidas.
  - 0 ids duplicados y 0 errores de consola.
  - A ≤ 1200 px las cifras de las 12 cards coinciden exactamente con las de la ronda 2, porque el override del bloque 1200 manda.
- Capturas: se sobrescriben `progress/research/hero97/hero-grid-1280.png` y `hero-grid-1600.png`. Ahora la nube se ve entera seguida de «CLOU». Las de 375/800/1024 no cambian, porque a esos anchos el valor visible lo fija el override (son las de la ronda 2).
- Servidores: el preview de :4397 está parado. No he tocado el pnpm dev de :4321 (PID 34400).

### Tabla final celda → tecnología (valores base ≥ 1201 px, iguales en JSON y en la regla base de CSS)

| # | Celda (col x fila) | id | Título | Token / hex | iconWidth | rotate |
|---|---|---|---|---|---|---|
| 1 | 6 / span 5 x 1 / span 2 | react | REACT | #0E6C82 | 165px | -8 |
| 2 | 11 / span 2 x 1 / span 2 | html | HTML | #B74D05 | 115px | -7 |
| 3 | 6 / span 2 x 3 / span 2 | node | NODE JS | #08783A | 120px | -10 |
| 4 | 8 / span 5 x 3 / span 2 | github | GITHUB ACTIONS | #091223 | 190px | -12 |
| 5 | 6 / span 5 x 5 / span 2 | youtube | YOUTUBE | #B61111 | 170px | -8 |
| 6 | 11 / span 2 x 5 / span 2 | rust | RUST | #A33A16 | 115px | -8 |
| 7 | 1 / span 2 x 7 / span 2 | typescript | TYPESCRIPT | #215BC7 | 110px | -10 |
| 8 | 3 / span 2 x 7 / span 2 | css | CSS | #6E29C8 | 105px | -8 |
| 9 | 5 / span 2 x 7 / span 2 | aws | AWS | #232F3E | 120px | -6 |
| 10 | 7 / span 4 x 7 / span 2 | claude-code | CLAUDE CODE | #5C2A1C | 165px | 0 |
| 11 | 11 / span 2 x 7 / span 2 | nestjs | NESTJS | #A3132F | 120px | -5 |
| 12 | 1 / span 8 x 9 / span 2 | cloudflare | CLOUDFLARE | #A8470C | **140px** | **0** |
| 13 | 9 / span 4 x 9 / span 2 | htb | HACK THE BOX | #1A2332 | — | — |

Overrides en `@media (max-width: 1200px)` (sin cambios desde la ronda 2; también aplican en ≤ 768 px):
- github: `110px` / scale 2 / `0deg`
- rust: scale 3
- aws: scale 3
- claude-code: scale 2
- cloudflare: `34px` / `0deg`
