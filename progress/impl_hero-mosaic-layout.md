# Implementación — feature 98 hero-mosaic-layout

Fecha: 2026-10-16. Autor: implementer. Estado: **implementada; lista para revisión** (sigue en `in_progress` hasta el APPROVED).
Spec: `specs/98_hero-mosaic-layout/requirements.md` (REQ-98-01..38) y `design.md`. Análisis: `progress/research/hero-mosaic-layout.md`.
No he tocado la 93 (blocked). No hay commits.

## Archivos

Código y datos:
- `src/domain/hero-grid-layout.ts` (nuevo, 89 líneas). Exporta `layoutHeroCards(cards) → { card, colSpan, rowSpan, column, row }[]` y `HeroGridLayoutError`.
  - Orden: kind ≠ icon, después category tech y al final category social. Es estable (filtros en el orden del JSON).
  - Tamaños: plantilla superior `[5x4, 2x2, 2x2, 5x2, 2x2]`; filas inferiores `[2, 2, 2, 4, 2]` de alto 2.
  - Posición: simula el auto-placement disperso (`grid-auto-flow: row`) en 12 columnas, con el perfil reservado (constante `PROFILE` 1-5 × 1-6, igual que en `profile-card.css`).
  - Errores, en este orden:
    - más de 5 personalizadas (REQ-98-13);
    - las tarjetas tras la zona superior no son múltiplo de 5. El mensaje da el total recibido y el resto (REQ-98-12);
    - una red social fuera de la última fila, con su id (REQ-98-14).
- `src/domain/entities/hero-card.ts` (38 → 41):
  - salen `gridColumn`/`gridRow` de `HeroCard` y `HeroRichCard`;
  - entra el catálogo cerrado `HERO_CARD_CATEGORIES = ['tech', 'social']`, el tipo `HeroCardCategory` y `readonly category` en `HeroCard`.
- `src/domain/repositories/hero-cards-parse.ts` (94 → 92):
  - salen `gridColumn`/`gridRow`;
  - `readKind` pasa a ser `readOption(card, field, options, index)`, un lector genérico de catálogo. Si el campo falta devuelve el primer valor (kind `icon`, category `tech`). Con un valor fuera del catálogo lanza `HeroCardsDataError` con el índice y el nombre del campo. Lo usan `kind` y `category` (REQ-98-06/07).
- `src/data/hero-cards.json` (142 → 17 líneas): las 15 cards en el orden del mapa (htb, html, node, react, rust, typescript, css, aws, claude-code, nestjs, cloudflare, claude, bun, youtube, github), con `category` explícito y sin celdas.
  - Formato: una tarjeta por línea, para que el archivo tocado no pase de 100 líneas (REQ-98-38). Es JSON válido y los tests lo parsean igual.
- `src/components/new-hero/new-hero.astro`: `const heroCards = layoutHeroCards(new HeroCardsRepository().getCards());`. El map desestructura `{ card, colSpan, rowSpan }` y monta `<HeroGridCard card={card} colSpan={colSpan} rowSpan={rowSpan} />`.
- `src/components/hero-cards/hero-grid-card.astro`: Props `colSpan`/`rowSpan`; los pasa al componente del registro.
- `src/components/hero-card.astro` y `src/components/hero-cards/htb-card.astro`: Props `colSpan`/`rowSpan`. El `<article>` emite `data-col-span={colSpan} data-row-span={rowSpan}`, sin `style`.

Estilos:
- `src/styles/hero-section.css` (55 → 63): reglas `[data-col-span="2|4|5"] { --card-column: span N; }` y `[data-row-span="2|4"] { --card-row: span N; }`, con 2 líneas de comentario y antes de `@keyframes`. La rejilla 12/6/1 no cambia.
- `src/styles/hero-card.css` (98 líneas):
  - Las reglas `[data-color-token]` quedan solo con `--card-bg`, `--icon-width` y `--icon-rotation`, sin celdas.
  - `htb` queda solo con el fondo.
  - Entran `claude` y `bun`.
  - Cambia la base de `cloudflare` (34px / 0) y la de `github` (115px / -8).
  - En `@media (max-width: 1200px)` se añade una línea con los ajustes de claude, bun y youtube (ver «Iconos»).
- `src/styles/tokens.css` (99 → 99): entran `--color-marca-claude: #B4532F` y `--color-marca-bun: #3D2B1F`. Salen `--color-overlay-strong` y `--color-overlay-soft`, que no se usaban en `src/` (lo comprueba el test). El comentario del grupo deja de decir «overlay».

Tests (todos con la nota «Ajuste feature 98 (precedente REQ-43-06)» donde se reapuntan):
- `tests/hero-mosaic-layout.test.mjs` (nuevo, 97 líneas):
  - REQ-98-08 a 12-14: orden con entrada desordenada (social, tech, htb, tech + 11 tech), plantilla con 20 cards, y los cuatro errores (14 cards; 6 personalizadas; 10 redes; una red en la zona superior).
  - REQ-98-11: simulación independiente del auto-placement, comparada con el real y con la entrada de 20; sin huecos ni solapes en 10 y 12 filas.
  - REQ-98-15: mapa real frente a design.md.
  - Invariantes: filas inferiores de 5 con una sola doble, redes en la última fila, personalizadas en la zona superior y fragmento del sprite único.
  - REQ-98-16/17 (fuente).
- `tests/hero-cards-unique-tech.test.mjs`: la tabla de la 97 pasa a la tabla de datos de la 98 (REQ-98-01..05, 24..27). Conserva los tokens, reglas y contraste de la 97, y la htb pasa a ser la primera y solo fondo.
- `tests/hero-cards-styles.test.mjs`: el test de la Decisión 2 pasa a REQ-98-18/19 (spans en hero-section.css; ninguna `[data-color-token]` con `--card-column/--card-row`). CARD_TOKENS gana claude y bun. Baja de 187 a 177 líneas.
- `tests/hero-cards-repository.test.mjs`: deja de fijar 13 y pasa a invariantes (ids únicos, 1 htb, `getCards()` fiel al JSON); la entidad pasa a tener `category`. Baja de 168 a 145.
- `tests/hero-card-kinds-domain.test.mjs`: gridColumn/gridRow pasan a category (REQ-98-05..07), sin recuento fijo. Baja de 132 a 127.
- `tests/htb-hero-card.test.mjs`: htb como primera entrada sin celda, regla solo de fondo y regex del `<article>` con los data-*-span.
- `tests/hero-card-registry.test.mjs`: regex del map de new-hero y del `<article>`, sin «12».
- `tests/hero-cards-icon-fit.test.mjs`:
  - deja de comparar hero-section.css con HEAD (REQ-97-21);
  - la rejilla la sigue fijando REQ-91-08;
  - REQ-97-20 / REQ-98-35 cubre todas las de icono;
  - `EXPECTED_1200` gana claude, bun y youtube.
- `tests/geist-pixel-extend.test.mjs`: sale `hero-card.astro` de los congelados.
- `tests/design-tokens.test.mjs`: MARCA_TOKENS gana claude y bun.
- `tests/hero-ui-refactor.test.mjs` (no está en la lista de design.md, pero fijaba 13 y lo cubre el enunciado general de REQ-98-36): REQ-09-03 sin recuento fijo. Mismo número de líneas.

Líneas: todos los archivos de `src/` tocados y los tests nuevos tienen ≤ 100 líneas. Algunos tests reapuntados ya pasaban de 100 en HEAD (precedente C5 de la review 97):
- Bajan: repository 168 → 145, styles 187 → 177, kinds 132 → 127, htb 146 → 144.
- Suben solo por nota o filas de datos: registry 103 → 106 (3 líneas de nota), design-tokens 104 → 107 (nota y 2 tokens).
- Se queda igual: hero-ui-refactor 197.

## Ciclo rojo / verde

Rojo (REQ-98-37). Escribí los tests y, **antes de crear `src/domain/hero-grid-layout.ts` y antes de tocar el JSON, las hojas o los componentes**, ejecuté `node --test` sobre los 10 archivos de la feature:
```
✖ tests\hero-mosaic-layout.test.mjs
  Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...\src\domain\hero-grid-layout.ts' imported from ...\tests\hero-mosaic-layout.test.mjs
✖ tests\hero-cards-styles.test.mjs            (mismo import del módulo)
✖ REQ-02-03 (claude/bun)  ✖ REQ-90-02 / REQ-98-05  ✖ REQ-90-04/05  ✖ REQ-90-04  ✖ REQ-90-06  ✖ REQ-90-07
✖ REQ-90-09  ✖ REQ-98-06/07  ✖ REQ-91-05  ✖ REQ-91-06  ✖ REQ-06-02  ✖ REQ-31-02/REQ-31-05  ✖ REQ-31-02
✖ REQ-98-01..04  ✖ REQ-98-01/02/05  ✖ REQ-97-05/06 y REQ-98-24/26  ✖ REQ-97-07/08 y REQ-98-27  ✖ REQ-97-10
✖ REQ-92-01  ✖ REQ-92-03  ✖ REQ-92-04
ℹ tests 72  ℹ pass 49  ℹ fail 23
```
Segundo rojo, el de los ajustes de icono medidos (ver «Iconos»). Cada vez actualicé `EXPECTED_1200` antes que el CSS:
- `✖ REQ-97-19 (design.md Decisión 4)` (faltaban `claude` y `youtube`; pass 4, fail 1);
- después `✖` por `bun` sin `--icon-rotation: 0deg` (pass 4, fail 1).

Verde:
- Los 10 archivos de la feature: `ℹ tests 84 ℹ pass 84 ℹ fail 0`.
- Primera suite completa: 1 fallo, `REQ-09-03 (integración)` de `tests/hero-ui-refactor.test.mjs`, que fijaba 13. Lo reapunté con la nota y quedó en verde.
- `pnpm test` final: `ℹ tests 1028 ℹ pass 1028 ℹ fail 0`.
- `./init.sh` (exit 0): «✔ formato», «✔ tests al 100% (node:test)», «✔ build de producción (pnpm build)», «✔ El entorno está perfecto».

## Mapa medido (CDP, 1280 y 1600 px, idéntico en los dos)

Columna y fila salen de la posición del article sobre las pistas resueltas del grid (`gridTemplateColumns/Rows` + gap), no del CSS. Notación: `inicio/span`.

| Filas | Cards |
|---|---|
| 1-6 | perfil 1/5 × 1/6 |
| 1-4 | HACK THE BOX 6/5 × 1/4 · HTML 11/2 × 1/2 · NODE JS 11/2 × 3/2 |
| 5-6 | REACT 6/5 × 5/2 · RUST 11/2 × 5/2 |
| 7-8 | TYPESCRIPT 1/2 · CSS 3/2 · AWS 5/2 · CLAUDE CODE 7/4 · NESTJS 11/2 (todas × 7/2) |
| 9-10 | CLOUDFLARE 1/2 · CLAUDE 3/2 · BUN 5/2 · YOUTUBE 7/4 · GITHUB 11/2 (todas × 9/2) |

- REQ-98-20: 15/15 coinciden con el mapa de design.md. `data-col-span`/`data-row-span` emitidos = tamaño medido, y ningún article tiene `style`.
- REQ-98-21: 12 columnas × 10 filas, 0 celdas vacías y 0 solapes, a 1280 y a 1600.
- REQ-98-22: fila 7 y fila 9 con 5 article cada una, 1 de 4 columnas y 4 de 2.
- REQ-98-23: YOUTUBE y GITHUB en la fila 9 (la última); HACK THE BOX en las columnas 6-10 y las filas 1-4, dentro de la zona 6-12 × 1-6.
- Tablet y móvil: no cambian (REQ-98 Decisión 4). A 800/1024 hay 6 columnas: el perfil va a ancho completo y debajo 15 cards de 1 columna (6 + 6 + 3; quedan 3 celdas libres al final, como ya pasaba). A 375 hay 1 columna y 16 filas.

## Iconos (valores finales)

Regla base (≥ 1201 px), igual en el JSON y en hero-card.css (REQ-98-35). Todas con los valores iniciales de design.md, sin cambios:
- cloudflare 34px / 0
- claude 110px / -8
- bun 115px / -8
- github 115px / -8
- youtube 170px / -8

El resto conserva los de la 97.

`@media (max-width: 1200px)`, que también aplica en ≤ 768 px. Se conservan los de la 97 (github 110px/2/0deg, rust 3, aws 3, claude-code 2, cloudflare 34px/0deg) y entran:

| Token | Override | Motivo (medida a 800 px con la base) |
|---|---|---|
| claude | `--icon-scale: 3` | Con scale 5 tapaba el título: 887,5 px² (fill #D97757, 3,12:1) |
| bun | `--icon-scale: 3; --icon-rotation: 0deg` | 456,3 px² con scale 5. Con scale 3 y -8deg seguía en 4,5 px² (2,8 a 1024). Con 0deg pasa a 0. Probé scale 2 (también 0), pero lo descarté porque deja el logo más pequeño |
| youtube | `--icon-scale: 3` | Solo el 33,7 % del logo quedaba dentro (< 40, REQ-98-32) |

## Mediciones CDP finales

Entorno: `pnpm build` + `pnpm preview --port 4398`, Chrome headless. Scripts en el scratchpad: `cdp98.mjs`, `grid98.js` y `sum98.mjs`; el FIT de la 97 se amplía con el viewBox de claude 24×24 y bun 80×70.

Formato de cada celda: % del logo dentro / centro dentro / solape con las palabras del título (px²).

| Card | 375 | 800 | 1024 | 1280 | 1600 |
|---|---|---|---|---|---|
| RUST | 95,2 / sí / 0 | 92,3 / sí / 0 | 95,2 / sí / 0 | 65,2 / sí / 0 | 65,2 / sí / 0 |
| AWS | 96,4 / sí / 0 | 92,5 / sí / 0 | 96,4 / sí / 0 | 67,7 / sí / 0 | 67,7 / sí / 0 |
| CLAUDE CODE | 100 / sí / 0 | 90,5 / sí / 0 | 100 / sí / 0 | 80,6 / sí / 0 | 80,6 / sí / 0 |
| NESTJS (exenta de 33, fill 4,65:1) | 65,3 / sí / 0 | 49,6 / sí / 871 | 65,1 / sí / 871 | 67,5 / sí / 0 | 67,5 / sí / 0 |
| CLAUDE | 95,2 / sí / 0 | 94,5 / sí / 0 | 95,2 / sí / 0 | 64,2 / sí / 0 | 64,2 / sí / 0 |
| BUN | 100 / sí / 0 | 96,4 / sí / 0 | 100 / sí / 0 | 61,9 / sí / 0 | 61,9 / sí / 0 |
| GITHUB | 100 / sí / 0 | 100 / sí / 0 | 100 / sí / 0 | 65,2 / sí / 0 | 65,2 / sí / 0 |
| YOUTUBE (no está en 33) | 84,0 / sí / 0 | 61,1 / sí / 123 | 83,3 / sí / 123 | 65,4 / sí / 0 | 65,4 / sí / 0 |
| CLOUDFLARE: logo / nube / solape | 60,9 / **100** / 0 | 62,9 / **100** / 0 | 62,9 / **100** / 0 | 62,9 / **100** / 0 | 62,9 / **100** / 0 |

Resultado por requisito:
- REQ-98-28: a los 5 anchos, las palabras de los 15 `p.card-title` quedan dentro de su card y ninguna se parte.
- REQ-98-29: `article.right ≤ innerWidth` en las 15 cards a los 5 anchos y `gridOver` 0. El scroll horizontal a 800 px (scrollWidth 838 / clientWidth 790) lo provoca `search.search-bar@838`, que es de la feature 93 y queda fuera de alcance. Lo que pasa de `clientWidth` en los demás anchos es `.hero-gradient` (decorativo, en un `.new-hero` con overflow hidden) y el carrusel de últimos artículos (recortado), igual que en la 97. scrollWidth = clientWidth a 375/1024/1280/1600.
- REQ-98-30: a 1280/1600, ningún descendiente del body ni del header de la card HACK THE BOX se sale de su article. Se pintó «Estadísticas no disponibles» porque el preview no tiene credenciales. `scrollHeight − clientHeight = 45` en todas las cards: es el glow `::after` (`right/bottom: -45px`), no contenido.
- REQ-98-31: la nube de cloudflare queda al 100 % a los 5 anchos.
- REQ-98-32: centro dentro y ≥ 40 % dentro en las 8 cards a los 5 anchos (el mínimo es NESTJS a 800, con 49,6).
- REQ-98-33: solape 0 en RUST, AWS, CLAUDE CODE, CLOUDFLARE, GITHUB, CLAUDE y BUN a los 5 anchos. NESTJS queda exenta (su único fill, #E0234E, da 4,65:1).
- Consola: 0 errores (exception, console.error y Log error) a los 5 anchos.
- Capturas: `progress/research/hero98/hero-grid-{375,800,1024,1280,1600}.png`.

Servidores: paré mis preview de :4398 (cada vez que recompilé, porque bloquean `dist/`). El `pnpm dev` de :4321 (PID 34400) sigue sin tocar.

## Observaciones fuera de alcance

- A 800/1024, las cards que la spec no lista siguen tapando su título igual que en la 97 (sin cambios): HTML 605,6, NODE JS 896, REACT 729,9, TYPESCRIPT 1344,1 y CSS 456,3 px².
- YOUTUBE queda en 123 px² con scale 3. YouTube no está en REQ-98-33, aunque su rojo #FF0000 da 4,0:1.
- En tablet (≤ 1200 px) la card HACK THE BOX ocupa 1 columna (~113 px a 800), así que «Estadísticas no disponibles» se recorta en horizontal. Ya pasaba antes de la 98 (el `auto !important` de ≤ 1200 px). REQ-98-30 solo pide 1280/1600.
- El override `cloudflare 34px / 0deg` del bloque 1200 ahora coincide con la base. Lo conservo porque lo pide design.md Decisión 4 y lo fija `EXPECTED_1200`.
