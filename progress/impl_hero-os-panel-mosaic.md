# Implementación — feature 99 hero-os-panel-mosaic

Fecha: 2026-10-16. Autor: implementer. Spec: `specs/99_hero-os-panel-mosaic/requirements.md` (REQ-99-01..34) y `design.md`. Análisis: `progress/research/hero-os-panel-mosaic.md`. Estado: `in_progress` (pendiente del reviewer).

## Qué cambia

- `src/data/hero-cards.json` (17 líneas): orden del array según la tabla de design.md (htb, rust, aws, cloudflare, node, nestjs, css, react, html, claude-code, bun, claude, typescript, youtube, github). `"featured": true` solo en node, nestjs y typescript; el resto lo omite (REQ-99-01). iconWidth finales en «Valores de icono».
- `src/domain/entities/hero-card.ts` (43): `readonly featured: boolean` en `HeroCard` (REQ-99-02).
- `src/domain/repositories/hero-cards-parse.ts` (94): `featured` ausente → `false`; si no es booleano → `HeroCardsDataError` con el índice y el campo (REQ-99-03/04). Para no pasar de 100 líneas, `expectString`/`expectNumber` pasan a usar un solo `expectType` (los mensajes «debe ser texto»/«debe ser número» no cambian; se añade «debe ser booleano»).
- `src/domain/hero-grid-template.ts` (nuevo, 31): huecos `{colSpan, rowSpan, large}`. Zona superior `5x4, 2x2, 2x2, 2x2, 5x2*`; filas inferiores `4*-2-2-2-2` (índice par) / `2-2-4*-2-2` (índice impar); `*` = hueco grande. `buildSlots(count)` (REQ-99-05/06).
- `src/domain/hero-grid-layout.ts` (95): recorre los huecos; las personalizadas van a los primeros, las tech `featured` a los grandes y la cola pequeña (tech sin featured y después social) a los pequeños, en el orden del JSON (REQ-99-07..09). Errores, en este orden: exceso de personalizadas (98-13), filas incompletas (98-12), red con featured, con su id (99-11), red fuera de la última fila (98-14) y número de featured distinto de huecos grandes libres, con los dos números (99-10). El auto-placement disperso de la 98 no cambia (98-11). No usa `Math.random` ni `Date`.
- `src/styles/hero-card.css` (98): bases de icono y ajustes por tramo (ver más abajo). Las reglas de span de `hero-section.css` no se tocan. Los componentes `.astro` tampoco (ya emitían `data-col-span`/`data-row-span` sin `style` ni script, REQ-99-18).

## Tests (REQ-99-32/33)

- `tests/hero-mosaic-layout.test.mjs` (99, reescrito): plantilla 99 (05/06), colas (07..09), errores 99-10/11 y 98-12..14 (12), auto-placement sin huecos ni solapes (98-11), mapa real de design.md + determinismo + sin `Math.random`/`Date` (13/14), invariantes con la nota «Ajuste feature 99 (precedente REQ-43-06)» (15..17: grandes = node/nestjs/typescript sin columnas compartidas en filas contiguas, patrón de anchos de cada par de filas distinto del siguiente, no featured en 2x2, redes en la última fila, personalizadas arriba) y marcado (18).
- `tests/hero-cards-unique-tech.test.mjs` (99): tabla 98 → tabla 99 con la nota; test nuevo REQ-99-01 (featured solo en node/nestjs/typescript).
- `tests/hero-card-kinds-domain.test.mjs` (127 → 126): test nuevo REQ-99-02/03/04; el fixture `ICON` gana `featured: false` con la nota. Ya pasaba de 100 en HEAD; baja una línea (precedente C5 de la review 97).
- `tests/hero-cards-repository.test.mjs` (+1 línea, la nota): el resultado esperado de `getCards()` incluye `featured: false` por defecto. Ya pasaba de 100 en HEAD (precedente C5).
- `tests/hero-cards-icon-fit.test.mjs` (92): `EXPECTED_1200` pasa a los valores medidos, con la nota.

### Rojo (antes de tocar dominio, JSON y hojas)

`node --test` sobre los 5 archivos: `tests 42 · pass 27 · fail 15`. En `tests/hero-mosaic-layout.test.mjs` fallan 6 de 7 (solo pasa REQ-98-11, que no cambia):

```
✖ REQ-99-05/06: plantilla superior 5x4, 2x2, 2x2, 2x2, 5x2 y filas inferiores 4-2-2-2-2 / 2-2-4-2-2 de alto 2
✖ REQ-99-07/08/09: personalizadas primero, featured en los huecos grandes y pequeños con tech y después redes
✖ REQ-99-10/11/12: ... AssertionError: Missing expected exception.
✔ REQ-98-11 / REQ-99-12: columna y fila de inicio = auto-placement de CSS Grid, sin huecos ni solapes
✖ REQ-99-13/14: actual [htb 6,1,5,4], [html 11,1,2,2], [node 11,3,2,2], [react 6,5,5,2] ... expected [htb 6,1,5,4], [rust 11,1,2,2], [aws 11,3,2,2], [cloudflare 6,5,2,2], [node 8,5,5,2] ...
✖ REQ-99-15/16/17 (Ajuste feature 99, precedente REQ-43-06): invariantes del panel
✖ REQ-99-18: ... ENOENT src/domain/hero-grid-template.ts
ℹ tests 7 · pass 1 · fail 6
```

También en rojo: REQ-99-01, REQ-99-02/03/04, REQ-98-01/02/05 (tabla), REQ-97-07/08 (reglas base), REQ-90-04/05, REQ-90-04, REQ-98-06/07, REQ-31-02/05 y REQ-31-02 (todos por `featured`).

### Verde

- Los 5 archivos: `tests 42 · pass 42 · fail 0`.
- Suite completa (`node --test "tests/**/*.test.mjs"`): `tests 1030 · pass 1030 · fail 0`.
- `./init.sh`: todo en verde (formato, tests al 100 %, build). Nota: con mi preview de :4399 levantado, REQ-91-07 falla por `EPERM` en `dist/client` (el preview bloquea `dist/`, igual que en la 98). Con el preview parado, verde.

## Valores de icono (medidos con CDP)

Base (≥ 1201 px; JSON = regla base, REQ-99-31):

| Card | iconWidth | rotate | Nota |
|------|-----------|--------|------|
| cloudflare | 170px (inicial 28px) | 0 | `--icon-scale: 1` en su regla base |
| node | 165px | -10 | inicial, sin cambio |
| nestjs | 160px | -5 | inicial, sin cambio |
| typescript | 150px | -10 | inicial, sin cambio |
| react | 115px | -8 | inicial, sin cambio |
| claude-code | 115px | 0 | inicial, sin cambio |
| youtube | 115px | -8 | inicial, sin cambio |

`@media (max-width: 1200px)` (REQ-99-30, solo `--icon-*`): cloudflare `--icon-width: 34px → 100px`; youtube `--icon-scale: 3 → 2`; nuevas node 3, nestjs 3, react 3, typescript 2. Las demás (github, rust, aws, claude-code, claude, bun) no cambian.

Decisión CLOUDFLARE (REQ-99-26): el svg mide `--icon-width` x 32 px, va anclado con `right: 4px` y escala desde su centro. El borde derecho del logo queda en `ancho_card − 4 + iw·(k−1)/2`, así que con k = 5 solo cabría con iw ≤ 2 px y con k = 2 con iw ≤ 8 px. La única forma de que el símbolo completo (nube + texto) quede dentro es k = 1. Como el test de rango de REQ-97-19 limita `--icon-scale` a 2..5 dentro de `@media`, la escala 1 va en la regla base de cloudflare (vale en todos los tramos) y el `@media` solo cambia el ancho. **Valor por defecto revisable.**

## Medida CDP (Chrome headless, `pnpm build` + `pnpm preview --port 4399`)

Scripts en el scratchpad: `cdp99.mjs` (copia de `cdp98.mjs`, con un `EXTRA_CSS` opcional que usé para probar valores), `grid98.js` y `sum99.mjs`. Capturas en `progress/research/hero99/hero-grid-{375,800,1024,1280,1600}.png`.

### Mapa medido a 1280 y a 1600 (idéntico al de design.md; REQ-99-19..22)

Columna/span × fila/span, medidos sobre las pistas reales del grid (12 columnas, 10 filas, 0 solapes, 0 celdas vacías):

- Filas 1-6: perfil 1/5 × 1/6.
- Filas 1-4: HTB 6/5 × 1/4 · RUST 11/2 × 1/2 · AWS 11/2 × 3/2.
- Filas 5-6: CLOUDFLARE 6/2 × 5/2 · NODE JS 8/5 × 5/2 (grande).
- Filas 7-8: NESTJS 1/4 × 7/2 (grande) · CSS 5/2 · REACT 7/2 · HTML 9/2 · CLAUDE CODE 11/2.
- Filas 9-10: BUN 1/2 · CLAUDE 3/2 · TYPESCRIPT 5/4 × 9/2 (grande) · YOUTUBE 9/2 · GITHUB 11/2 (redes 2x2 en la última fila).
- Grandes: NODE JS cols 8-12 (filas 5-6), NESTJS cols 1-4 (filas 7-8), TYPESCRIPT cols 5-8 (filas 9-10): ninguna comparte columna con otra en filas contiguas.
- `data-col-span`/`data-row-span` de cada article = tamaño medido; ningún article con `style`.
- HTB (REQ-99-25): ningún descendiente se sale del article («Estadísticas no disponibles», el preview no tiene credenciales). `scrollH − clientH = 45` es el glow `::after`, igual que en la 98.

### Por ancho (REQ-99-23..29)

| Ancho | Grid | Títulos (REQ-99-23) | Article > viewport (24) | CLOUDFLARE dentro / sobre título (26/27) |
|-------|------|---------------------|-------------------------|-------------------------------------------|
| 375 | 1 col, 16 filas, 0 solapes | 15/15 dentro, 0 palabras partidas | ninguno; scrollWidth 365 = clientWidth | 100 % / 0 px² (110 x 16 px) |
| 800 | 6 col, 4 filas, 0 solapes, 3 celdas vacías al final (15 cards en 6 columnas, sin cambios de geometría, Decisión 5) | 15/15, 0 partidas | ninguno; scrollWidth 838/790 por `search-bar` del header (feature 93) | 100 % / 0 (100 x 15) |
| 1024 | 6 col, 4 filas, igual que a 800 | 15/15, 0 partidas | ninguno; 1014 = 1014 | 100 % / 0 (100 x 15) |
| 1280 | 12 col, 10 filas, 0 vacías | 15/15, 0 partidas | ninguno; 1270 = 1270 | 100 % / 0 (170 x 25) |
| 1600 | 12 col, 10 filas, 0 vacías | 15/15, 0 partidas | ninguno; 1590 = 1590 | 100 % / 0 (170 x 25) |

REQ-99-28 (centro dentro y ≥ 40 % del área): 14/14 cards de icono en los 5 anchos. El mínimo es CSS a 800 (48,4 %).

REQ-99-29 (RUST, AWS, CLAUDE CODE, NESTJS, GITHUB, CLAUDE, BUN no tapan su título): 0 px² en los 5 anchos. NESTJS tapaba su título a 800/1024 con los valores iniciales (871 px²); pasa a 0 con `--icon-scale: 3` en ≤ 1200 px.

Cards que crecen o encogen (criterios de la 97, a petición del líder): NODE JS, NESTJS, TYPESCRIPT, REACT, CLAUDE CODE y YOUTUBE tienen 0 px² sobre el título en los 5 anchos. Con los valores iniciales, a 800 px tapaban: node 896, nestjs 871, typescript 1344, react 730 y youtube 123 px². Logo dentro de la card: node 72-95 %, nestjs 74-97 %, typescript 71-100 %, react 63-95 %, claude-code 72-100 %, youtube 57-100 %.

Fuera de alcance (ya estaba en la observación (l) de la 97): CSS y HTML siguen tapando su título a 800/1024 (456 y 606 px²). No están en REQ-99-29 ni cambian de tamaño en esta feature.

Consola: 0 errores, 0 excepciones en los 5 anchos.

Servidores: paré mis preview de :4399 (dos arranques, uno por build). El `pnpm dev` de :4321 (PID 34400) no se tocó.

## Líneas (REQ-99-34)

Archivos de `src/` tocados: hero-grid-layout.ts 95, hero-grid-template.ts 31, hero-card.ts 43, hero-cards-parse.ts 94, hero-cards.json 17, hero-card.css 98. Tests: hero-mosaic-layout 99, hero-cards-unique-tech 99, hero-cards-icon-fit 92. Dos tests que ya pasaban de 100 en HEAD: kinds-domain baja a 126 y repository sube 1 línea por la nota (precedente C5).

## Pendientes humanos (valores por defecto revisables)

- (s)-(v) de progress/current.md, aplicados tal cual.
- CLOUDFLARE: escala 1 en la regla base (ver Decisión CLOUDFLARE); ancho 170px a ≥ 1201 px y 100px en ≤ 1200 px (110px en ≤ 768 px por la regla `!important` existente).
- Escalas nuevas en ≤ 1200 px: node 3, nestjs 3, react 3, typescript 2, youtube 3 → 2.
