# Informe de implementación — feature 3 hero-cards-swap-positions

Spec: `specs/03_hero-cards-swap-positions/requirements.md` (REQ-03-01..13) y `design.md`.
Análisis: `progress/research/hero-cards-swap-positions.md`.

## Qué se hizo

Cambio solo de datos en `src/data/hero-cards.json`: se intercambian tres pares de tarjetas en el array y en `row`,
moviendo la línea completa de cada objeto (todas sus propiedades viajan con él, `featured` incluido):

- css <-> tauri: tauri pasa al índice 6 con `"row": 1`; css al índice 14 con `"row": 2`.
- html <-> opencode: opencode pasa al índice 8 con `"row": 1`; html al índice 13 con `"row": 2`.
- node <-> nestjs: nestjs pasa al índice 4 sin `row` (zona superior); node al índice 5 con `"row": 1`.

Orden final: htb, rust, aws, cloudflare, nestjs, node, tauri, react, opencode, claude-code, bash, webassembly,
astro, html, css, bun, claude, typescript, youtube, github. No se tocan motor, componentes ni CSS.

## Tests (test-first)

- `tests/hero-cards-swap-positions.test.mjs` (nuevo, 63 líneas): REQ-03-01..06/08 (orden y `row`; nestjs sin
  campo `row`), REQ-03-07 (snapshot literal de title, colorToken, icon, category, featured, rotate, scale,
  iconWidth, showOnMobile y href de las 6 tarjetas), REQ-03-09/10 (huecos grandes de nestjs y node),
  REQ-03-11/12 (filas 1 y 2 ordenadas por columna y MAP completo de 20 tarjetas) e higiene de 100 líneas.
- `tests/hero-grid-explicit-rows.test.mjs`: MAP (REQ-01-14), lista `[id,row]` y zona superior (`node` -> `nestjs`);
  comentario del ajuste de la feature 3. Se mantiene en 100 líneas.
- `tests/hero-row-new-tools.test.mjs`: `FILA` por marca (opencode y tauri en fila 1), `FILA_2` = bash,
  webassembly, astro, html, css; fila 1 del repositorio = node, tauri, react, opencode, claude-code. Comentario
  que deja constancia de que REQ-02-02 y REQ-02-06 quedan superados por la feature 3. 74 líneas.

Nota: REQ-03-07 pasa también en rojo porque es una aserción de conservación (snapshot de los valores previos);
su objetivo es que siga verde tras mover los objetos.

## Evidencia ROJO (tests actualizados, datos sin cambiar)

`node --test tests/hero-cards-swap-positions.test.mjs tests/hero-grid-explicit-rows.test.mjs tests/hero-row-new-tools.test.mjs`

```
✖ REQ-03-01..06/08: el array de hero-cards.json queda en el orden final con su "row" (2.097ms)
✔ REQ-03-07: las seis tarjetas intercambiadas conservan sus propiedades no posicionales (0.4261ms)
✖ REQ-03-09/10: nestjs ocupa el hueco grande de la zona superior y node el de la fila 1 (1.7656ms)
✖ REQ-03-11/12: filas 1 y 2 de izquierda a derecha y colocación completa según el MAP (0.9897ms)
✔ higiene: el test y los datos de la feature 3 no superan las 100 líneas (0.6167ms)
✔ REQ-01-01/02: el parseo expone "row" y rechaza lo que no sea un entero >= 1 (1.2163ms)
✔ REQ-01-03/04: las tarjetas sin "row" llenan la zona superior y la featured toma el hueco grande (1.0288ms)
✔ REQ-01-05/06: zona superior incompleta o con dos "featured" -> HeroGridLayoutError (0.2334ms)
✔ REQ-01-07/08/09: un "row" es una franja de 5 tarjetas con la featured en el hueco grande (0.4871ms)
✔ REQ-01-10/11: una fila declarada con != 5 tarjetas o != 1 "featured" -> HeroGridLayoutError (0.2554ms)
✔ REQ-01-12/13: una "social" fuera de la última fila o con "featured" -> HeroGridLayoutError (0.2223ms)
✖ REQ-01-14: la colocación del mosaico es la esperada tras los ajustes de las features 2 y 3 (20 tarjetas) (1.7445ms)
✖ REQ-01-14: hero-cards.json declara "row" en las 15 tarjetas de las franjas inferiores (0.6362ms)
✔ higiene: los módulos del mosaico cumplen el límite de 100 líneas y no usan aleatoriedad ni fecha (1.2015ms)
✖ REQ-02-01/02/03/04: las cinco tarjetas de la fila nueva declaran sprite, colorToken, su row, featured solo en astro y showOnMobile false (1.8284ms)
✖ REQ-02-01: el repositorio expone la fila nueva y las redes sociales pasan a row 3 (0.6792ms)
✖ REQ-02-05/07 (06 superado por la feature 3): la fila 2 del mosaico es bash, webassembly, astro, html, css con astro en el hueco grande (1.262ms)
✔ REQ-02-12: el sprite no ha cambiado y contiene los cinco symbols nuevos (18.2373ms)
✔ higiene: hero-card.astro importa la hoja nueva y ningún archivo tocado pasa de 100 líneas (0.8699ms)
ℹ tests 19
ℹ suites 0
ℹ pass 11
ℹ fail 8
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 136.1277
✖ failing tests:
✖ REQ-03-01..06/08: el array de hero-cards.json queda en el orden final con su "row" (2.097ms)
✖ REQ-03-09/10: nestjs ocupa el hueco grande de la zona superior y node el de la fila 1 (1.7656ms)
✖ REQ-03-11/12: filas 1 y 2 de izquierda a derecha y colocación completa según el MAP (0.9897ms)
✖ REQ-01-14: la colocación del mosaico es la esperada tras los ajustes de las features 2 y 3 (20 tarjetas) (1.7445ms)
✖ REQ-01-14: hero-cards.json declara "row" en las 15 tarjetas de las franjas inferiores (0.6362ms)
✖ REQ-02-01/02/03/04: las cinco tarjetas de la fila nueva declaran sprite, colorToken, su row, featured solo en astro y showOnMobile false (1.8284ms)
✖ REQ-02-01: el repositorio expone la fila nueva y las redes sociales pasan a row 3 (0.6792ms)
✖ REQ-02-05/07 (06 superado por la feature 3): la fila 2 del mosaico es bash, webassembly, astro, html, css con astro en el hueco grande (1.262ms)
```

## Evidencia VERDE (tras el cambio de datos)

Mismos tres archivos: `ℹ tests 19 / ℹ pass 19 / ℹ fail 0`. Suite completa (`pnpm test`): `ℹ tests 25 / pass 25 / fail 0`.

`./init.sh` (EXIT=0):

```
=== init.sh: verificando entorno ===

--- Herramientas y dependencias ---
✔ node instalado
✔ pnpm instalado
✔ dependencias instaladas (node_modules)

--- Archivos del harness ---
✔ AGENTS.md existe
✔ feature_list.json existe
✔ progress/current.md existe

--- Formato ---
✔ formato de feature_list.json y progress/current.md

--- Tests ---
✔ tests al 100% (node:test)

--- Build ---
✔ build de producción (pnpm build)

✔ El entorno está perfecto. Podemos empezar a trabajar.
```

## Límite de 100 líneas

Ningún archivo tocado supera 100 líneas (hero-cards.json 22, tests 100/74/63). El único archivo >100 en
src/tests/scripts es `scripts/validate-feature-list.mjs` (138), preexistente y no tocado por esta feature.

## Pendiente para el reviewer / humano

- REQ-03-13 (regresión visual a 375, 768 y 1280 px): no ejecutada por el implementer (sin herramienta de navegador
  en esta sesión). Riesgo documentado en design.md: node (240px, escala 7) pasa a hueco 4x2 y nestjs (230px,
  escala 7) a hueco 5x2; la geometría viaja por `data-color-token` y no se reajusta en esta feature.

## Archivos cambiados

- `src/data/hero-cards.json`
- `tests/hero-grid-explicit-rows.test.mjs`
- `tests/hero-row-new-tools.test.mjs`
- `tests/hero-cards-swap-positions.test.mjs` (nuevo)
- `feature_list.json` (status 3 -> in_progress)
- `progress/current.md`
- `progress/impl_3.md` (este informe)

## Cierre

- `progress/review_3.md` verificado en disco: **Veredicto: APPROVED**.
- `feature_list.json`: feature 3 pasa a `status: "done"` (se conserva en el array).
- Resumen movido al final de `progress/history.md`; `progress/current.md` restaurado a la plantilla.
- `./init.sh` (exit 0) en verde:

```
✔ node instalado / ✔ pnpm instalado / ✔ dependencias instaladas (node_modules)
✔ AGENTS.md existe / ✔ feature_list.json existe / ✔ progress/current.md existe
✔ formato de feature_list.json y progress/current.md
✔ tests al 100% (node:test)
✔ build de producción (pnpm build)
✔ El entorno está perfecto. Podemos empezar a trabajar.
```
