# Implementación — feature 101 hero-cards-polish (implementer, 2026-10-19)

Spec: specs/101_hero-cards-polish/requirements.md (REQ-101-01..21) y design.md. Análisis: progress/research/hero-cards-polish.md.
Estado: `in_progress`, implementada. Falta el reviewer externo. No hay commits ni subagentes.

## Avisos para el reviewer (leer primero)

1. **La premisa de REQ-101-14 era incorrecta.** El análisis y el reviewer de la 99 dicen que `--card-column`/`--card-row` están «sin definir desde la 98 (inocuo)». No es así: `src/styles/hero-section.css:46-50` las define (`[data-col-span="N"] { --card-column: span N; }`, REQ-98-18), y las líneas 13-14 de `hero-card.css` eran las que aplicaban los spans del mosaico. Si se borran sin más, todas las cards pasan a 1x1 y se rompe REQ-101-18. La solución cumple las dos cosas: `hero-card.css` queda sin ninguna referencia (REQ-101-14) y `grid-column`/`grid-row` pasan a `hero-section.css`, junto a las reglas de span, como `.hero-grid > .hero-card { grid-column: var(--card-column); grid-row: var(--card-row); }`. A 1280/1600 la geometría es idéntica a la base (ver Medida). El `auto !important` de `hero-card.css` en <= 1200 px sigue ganando.
2. **`--icon-width` no agranda el logo.** El `<svg>` de `hero-card.astro` mide 32px de alto (atributo) y el viewBox se ajusta por altura («meet»), así que el ancho solo desplaza el centro del logo. Con 240/230/220 px y scale 5, las grandes daban 1,11-1,25x la mediana de las 2x2 (no cumple REQ-101-05). design.md permite calibrar: subí `--icon-scale` a 7 en la regla base de las tres (los anchos de la tabla se mantienen). Tabla de design.md actualizada con el valor medido.
3. **Guardas de la 93 ajustadas.** Con los cambios de la 101 sin commitear, REQ-93-13 (media queries de `src/styles` frente a HEAD) y REQ-93-37 (`tokens.css` frente a HEAD) daban rojo en `./init.sh`, porque la 101 cambia `tokens.css` (REQ-101-01) y añade `@media` a las hojas HTB (REQ-101-11/12). Siguiendo el precedente de la 102 con REQ-93-04/21/22, ahora comprueban los commits de la 93 (`268e9ad` ronda 1 y `6b75e45` ronda 3): ninguno toca `tokens.css`, `package.json` ni `pnpm-lock.yaml`, ni cambia `@media` de hojas ajenas al header. `nav-label.css` la crea y la borra la propia 93 y se salta, como antes se saltaban los archivos que no estaban en HEAD. Si los commits no existen, el test se salta. Cada línea lleva la nota.
4. **Fila 2 en tablet: 149 → 140 px.** Antes, el aviso de HTB (padding superior ×4, texto que se desbordaba) estiraba la fila por encima de `minmax(140px, auto)`. Ahora cabe en 140 y la fila vuelve al mínimo. Columna, fila y span de cada article son idénticos a la base en los 7 anchos; solo cambia el alto de esa fila. REQ-101-18 (1280/1600) no cambia.

## Cambios

| Archivo | Cambio |
|---|---|
| `src/styles/tokens.css` | `--color-marca-nestjs: #3A0D18` (antes #A3132F); sigue en 99 líneas |
| `src/styles/hero-card.css` (99 líneas) | fuera `grid-column/grid-row: var(--card-*)`; base: node 240px, nestjs 230px, typescript 220px, las tres con `--icon-scale: 7`; `@media (max-width: 1200px)`: node 165px/3, nestjs 160px/3, typescript 150px/2, css 105px/3, html 115px/3 |
| `src/styles/hero-section.css` (65) | `.hero-grid > .hero-card { grid-column: var(--card-column); grid-row: var(--card-row); }` |
| `src/styles/htb-card.css` (30) | `@media (max-width: 1200px)`: cuerpo con `padding: calc(var(--gap-card) * 4.5) calc(var(--gap-card) / 2) calc(var(--gap-card) / 2)` |
| `src/styles/htb-stadistics.css` (63) | `@media (max-width: 1200px)`: `.htb-stadistics__empty` con `padding: calc(var(--gap-card) / 2)`, `font-size: 0.75rem`, `overflow-wrap: normal` |
| `specs/101_hero-cards-polish/design.md` | tabla con scale 7 medido y padding HTB ×4,5 medido (lo prevé la propia spec) |

No se crea `hero-card-icons.css`, porque `hero-card.css` se queda en 99 líneas (REQ-101-16 no se activa). No cambian el dominio (`hero-grid-layout.ts`, `hero-grid-template.ts`), `hero-cards.json`, los `.astro`, los archivos de la 93 (layout.css, site-menu.css, search-bar.css, site-menu.ts) ni los archivos ajenos (sprite.svg, posts de systems-design, hack-the-box-sprite.test.mjs).

Valores calibrados (los demás son los de partida de design.md):
- Escala de las grandes en escritorio: scale 5 daba 1,11/1,13/1,17x (node/nestjs/typescript); 6 daba 1,50/1,57/1,70x (NODE JS justo en el límite); **7 da 1,96/2,00/2,09x**; 8 daba 2,39/2,36/2,48x. Elegí 7.
- Padding superior de HTB en <= 1200 px: con ×3,5 (valor de partida) el aviso tocaba el título de 2 líneas a 769/800 (79,0 px²); **×4,5** deja 0 px² y el aviso cabe en la fila de 140 px.

## Tests

- Nuevo: `tests/hero-cards-polish.test.mjs` (100 líneas). Cubre REQ-101-01/02/03 (hex, contraste ≥ 4,5 frente a `--color-text` y ≥ 3 frente al `#E0234E` del símbolo nestjs del sprite), 04 (ancho de escritorio + scale 7), 07 (tablet), 11/12/13 (`@media` HTB con `--gap-card`; `htb-card.astro` y `htb-stadistics.astro` sin diff frente a `0c786e4`), 14 (sin `--card-*` en hero-card.css; celda en hero-section.css), 15/16 (≤ 100 líneas y sin colores sueltos; importación si se parte), 17 (dominio y JSON sin diff frente a `0c786e4`, el commit de la 99), 19 (sin `style`, mismo número de `<script>` que en `0c786e4`) y 21 (capturas).
- Ajustados con «Ajuste feature 101 (precedente REQ-43-06)» (REQ-101-20):
  - `tests/design-tokens.test.mjs`: hex de NestJS.
  - `tests/hero-cards-unique-tech.test.mjs`: hex de NestJS y ancho base de nestjs 230px.
  - `tests/hero-cards-icon-fit.test.mjs`: valores de tablet; REQ-97-20 compara el `iconWidth` del JSON de las featured con su ancho de tablet, porque el JSON no cambia (REQ-101-17).
  - `tests/hero-cards-styles.test.mjs`: grid-column/grid-row se buscan en hero-section.css.
  - `tests/system-design-nav-link.test.mjs`: REQ-93-13/37 (aviso 3).

### Rojo (antes del código; solo tests escritos)

`node --test tests/hero-cards-polish.test.mjs tests/design-tokens.test.mjs tests/hero-cards-unique-tech.test.mjs tests/hero-cards-icon-fit.test.mjs tests/hero-cards-styles.test.mjs`:

```
✖ REQ-02-03: los tokens de marca usan los colores de la paleta de hero.data.ts
✖ REQ-97-19 (design.md Decisión 4): ajustes por defecto en @media (max-width: 1200px) tras la primera regla
✖ REQ-97-20 / REQ-98-35: iconWidth y rotate del JSON coinciden con la regla base fuera de @media
✖ REQ-101-01/02/03: --color-marca-nestjs #3A0D18 con >= 4,5:1 frente al título y >= 3:1 frente al logo
✖ REQ-101-04: las reglas base de node, nestjs y typescript declaran el --icon-width de escritorio
✖ REQ-101-07: el @media (max-width: 1200px) fija ancho y escala de tablet de node, nestjs, typescript, css y html
✖ REQ-101-11/12/13: HTB reduce paddings y aviso en <= 1200 px solo en sus dos hojas y con tokens
✖ REQ-101-14: hero-card.css sin --card-column/--card-row y la celda sigue saliendo de hero-section.css
✖ REQ-101-21: capturas del grid del hero de la verificación
✖ design.md Decisión 2 / REQ-98-18/19: sin style inline, spans en hero-section.css y sin celda por token
✖ REQ-97-05/06 y REQ-98-24/26: tokens de marca nuevos, sin los retirados y tokens.css <= 100 líneas
✖ REQ-97-07/08 y REQ-98-27: hero-card.css tiene una regla por token con su fondo e icono base
ℹ tests 32  ℹ pass 20  ℹ fail 12
```

REQ-101-15/16, 17 y 19 son guardas: pasan antes y después. Las guardas REQ-93-13/37 dieron rojo en la primera ejecución completa tras el código (`ℹ tests 1064 ℹ pass 1062 ℹ fail 2`: `✖ REQ-93-13 …` y `✖ REQ-93-37 …`) y pasaron a verde con el ajuste del aviso 3.

### Verde

- `pnpm test`: `ℹ tests 1064 ℹ pass 1064 ℹ fail 0 ℹ skipped 0`.
- `./init.sh`: exit 0, «✔ formato…», «✔ tests al 100% (node:test)», «✔ build de producción (pnpm build)», «✔ El entorno está perfecto».

## Medida CDP (Chrome headless, `pnpm build` + `pnpm preview --port 4401`, 900/1000 px de alto, DPR 1)

Script: `scratchpad/cdp101/measure.mjs` (derivado del medidor del reviewer de la 99: rects de cada palabra del título ∩ bbox visible del logo, proyectado con su matriz de transform en reposo y recortado al article; viewBox leído del sprite) y `scratchpad/cdp101/sum.mjs` (evalúa los REQ). JSON: `scratchpad/cdp101/base.json` y `final.json`. El scratchpad es `C:/Users/Moises/AppData/Local/Temp/claude/C--Users-Moises-Desktop-moibaldenegro-com/5a16f5af-f87c-46b3-b4a6-91a79cca298f/scratchpad`. Resultado de `sum.mjs final.json`: **TODO OK**, 0 errores de consola.

| Ancho | Solape título/logo (14 cards) | Logo visible mín. (centro dentro: 14/14) | Títulos (15) | Aviso HTB: palabras / rect / ∩ título | Scroll horiz. |
|---|---|---|---|---|---|
| 375 | 0 px² | react 94,6 % | dentro, 1 caja por palabra | 3/3 en 1 caja / dentro / 0 | no (365 ≤ 375) |
| 769 | 0 (antes CSS 456,3, HTML 605,6) | node 67,5 % | ok | 3/3 (antes «Estadísticas», «disponibles» fuera) / dentro / 0 | no |
| 800 | 0 (antes 456,3 / 605,6) | node 72,2 % | ok | 3/3 (antes 2 fuera) / dentro / 0 | no |
| 1024 | 0 (antes 456,3 / 605,6) | react 94,6 % | ok | 3/3 / dentro / 0 | no |
| 1200 | 0 (antes 220,1 / 257,5) | react 94,6 % | ok | 3/3 / dentro / 0 | no |
| 1280 | 0 | youtube 57 % | ok | 3/3 / dentro / 0 | no |
| 1600 | 0 | youtube 57 % | ok | 3/3 / dentro / 0 | no |

REQ-101-05/06 (1280 y 1600 dan lo mismo, porque las grandes conservan el alto de 204 px):

| Card | Área visible | / mediana 2x2 (20 952,8 px², 11 cards 2x2) | Logo visible | Centro |
|---|---|---|---|---|
| NODE JS (495/617x204) | 40 965,4 px² (antes 23 223,7) | **1,96x** (antes 1,11x) | 69,2 % | dentro |
| NESTJS (393/491x204) | 41 861,4 (antes 23 713,4) | **2,00x** (antes 1,13x) | 68,7 % | dentro |
| TYPESCRIPT (393/491x204) | 43 747,8 (antes 24 464,2) | **2,09x** (antes 1,17x) | 65,0 % | dentro |

- REQ-101-18: a 1280/1600, grid de 12x10 con 0 solapes y 0 celdas vacías; los 16 items (perfil + 15) coinciden con el mapa de specs/99_hero-os-panel-mosaic/design.md, y x/y/w/h de cada article son idénticos a la base. Los spans de `data-col-span`/`data-row-span` coinciden.
- REQ-101-19: 0 elementos con atributo `style` en `.new-hero`/`.hero-grid` (contados antes de medir), 1 `<script>` en el grid (el de la server island de HTB, igual que en la base) y 0 errores de consola en los 7 anchos.
- Tablet (769-1200): el medidor da «6x4, 3 celdas vacías». Es la última fila del auto-placement de 15 cards en 6 columnas (6+6+3) y es idéntico en la base y en la 99 (rv99/m.json); queda fuera de REQ-101-18.
- NESTJS: el fondo calculado es `rgb(58, 13, 24)` = #3A0D18; contraste con el logo #E0234E de 3,61:1 y con el título blanco de 16,79:1 (el test lo calcula).
- Hover (×1,12) no se mide; el criterio es en reposo, como en la 97/99.

Capturas: «antes» en `progress/research/hero101/before/hero-grid-{375,800,1024,1280,1600}.png`, «después» en `progress/research/hero101/hero-grid-{375,800,1024,1280,1600}.png` (REQ-101-21).

## Servidores

Arranqué y paré mis `pnpm preview --port 4401` (uno por build; el preview bloquea `dist/` y el test de build REQ-92-10 falla con él levantado, como en la 98/99). No toqué el `pnpm dev` de :4321 (PID 34400).

## Pendientes para el humano (valores revisables, no bloquean)

- `--color-marca-nestjs` #3A0D18 (alternativas medidas en design.md).
- Escala 7 de las grandes en escritorio (design.md; 6 deja NODE JS justo en 1,50x).
- Padding HTB ×4,5 / ½ y aviso a 0,75rem en <= 1200 px.
- El punto 5 (menos alineación en las columnas 9-12) queda fuera, como fija la spec.
