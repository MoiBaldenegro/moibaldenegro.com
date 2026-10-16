# Análisis — Mosaico del hero calculado en el dominio (feature 98 hero-mosaic-layout)

Fecha: 2026-10-16. Autor: spec_author.

## Petición humana (literal, 2026-10-16)

«hay que meter todas las que tenemos en los sprites, y las redes sociales llévatelas hasta el final, y ahí solo meter youtube y github, si te fijas en las últimas hay 5 cards y al final está solo cloudflare y hack the box tiene que haber siempre 5 de esas 5 solo 1 que ocupe dos espacios como dejaste claude code tal cual y las demás pequeñas, otra cosa las personalizadas siempre van arriba como la de hack the box»

## Qué pide, en mis palabras

1. Entran todas las tecnologías del sprite, una card por símbolo: react, node, typescript, html, css, nestjs, aws, cloudflare, rust, claude, bun, claude-code (12). Claude y Claude Code son cards distintas.
2. Redes sociales: solo YOUTUBE y GITHUB (GitHub deja de ser «GITHUB ACTIONS»), las dos en la última fila. Quedan fuera twitch, instagram, x, linkedin y strava. `verified`, `htb` y `htb-wordmark` del sprite no son cards de icono (el símbolo htb lo usa la card personalizada).
3. Las cards personalizadas (kind distinto de `icon`, hoy solo `htb`) van siempre arriba, junto al perfil (columnas 6-12, filas 1-6).
4. Cada fila bajo el perfil tiene siempre 5 cards: 4 pequeñas (span 2) y 1 doble (span 4), como hoy la fila TS/CSS/AWS/CLAUDE CODE/NESTJS, que se queda tal cual.

Total: 12 tecnologías + 2 redes + 1 personalizada = 15 cards (hoy 13).

## Estado actual (lo que toca)

- `src/data/hero-cards.json`: 13 cards con `gridColumn`/`gridRow` a mano.
- La geometría real NO sale del JSON: `hero-card.astro` y `htb-card.astro` solo emiten `data-color-token`; cada regla `[data-color-token]` de `src/styles/hero-card.css` fija `--card-column`/`--card-row`, que `.hero-card` consume con `grid-column: var(--card-column)`. El JSON y la hoja duplican la misma celda (los tests 97 lo comprueban).
- Perfil: `src/styles/profile-card.css` lo fija en `1 / span 5` × `1 / span 6` (≤ 1200 px: `1 / span 6`, fila auto; ≤ 768 px: auto).
- `src/styles/hero-section.css`: 12 columnas, `grid-auto-rows: 95px`; ≤ 1200 px 6 columnas; ≤ 768 px 1 columna. En ≤ 1200 px `hero-card.css` anula todo con `grid-column: auto !important; grid-row: auto !important`.
- Entidad `src/domain/entities/hero-card.ts` y parseo `hero-cards-parse.ts` (94 líneas) exigen `gridColumn`/`gridRow`.
- Líneas: `hero-card.css` 94, `hero-section.css` 55, `tokens.css` 99, `hero-cards-parse.ts` 94.

## Por qué hoy hay 13 (sin tope en el código)

El mosaico está colocado a mano sin celdas libres (perfil 5×6 + 6 cards en la zona superior + 5 + 2 abajo) y lo fijan dos tests: `tests/hero-cards-repository.test.mjs` (13, REQ-06-01/REQ-92-14) y `tests/hero-cards-unique-tech.test.mjs` (13 y tabla de celdas de la 97).

## Decisión de diseño: posición calculada en el dominio

Encaja. Propuesta (detalle en `specs/98_hero-mosaic-layout/design.md`):

- Módulo nuevo `src/domain/hero-grid-layout.ts`: ordena las cards por grupo (personalizadas → tecnologías → redes, estable por orden del JSON), asigna tamaño por plantilla (zona superior de 5 huecos; filas inferiores 2-2-2-4-2) y calcula la celda de inicio simulando el auto-placement de CSS Grid con el perfil reservado. Lanza `HeroGridLayoutError` si las cards no completan filas de 5, si hay más de 5 personalizadas o si una red no cae en la última fila (nunca falla en silencio, precedente `HeroCardKindError`).
- Los componentes emiten solo el tamaño (`data-col-span`, `data-row-span`), nunca la posición; el navegador coloca por auto-placement en el orden del DOM, que coincide con el calculado. Así añadir 5 cards no obliga a recolocar a mano.
- Las reglas `[data-col-span]`/`[data-row-span]` (4 líneas) van en `hero-section.css` (geometría del grid); las `[data-color-token]` de `hero-card.css` pierden `--card-column`/`--card-row` y quedan solo con color e icono.
- Estilos inline (`style=`) descartados: los prohíben la convención y `tests/hero-ui-refactor.test.mjs` (REQ-09-03).
- Tablet (6 col) y móvil (1 col) no cambian: el `auto !important` de ≤ 1200 px sigue anulando los spans.
- Campo nuevo `category` en las cards de icono (`tech` por defecto, `social` para youtube y github); `gridColumn`/`gridRow` salen del JSON, de la entidad y del parseo.

## Zona superior (columnas 6-12 × filas 1-6 = 7 × 6 celdas)

7 columnas es impar: con solo spans 2 y 4 no se llena. Con 15 cards y filas inferiores de 5, la zona superior aloja 5 cards (15 − 5 = 10 = 2 filas). Dos opciones válidas:

- **B (elegida por defecto):** HTB 5×4 (cols 6-10, filas 1-4), dos de 2×2 a su derecha, y en las filas 5-6 una de 5×2 + una de 2×2. Todas las cards de tecnología conservan los tamaños de hoy (2 o 5 de ancho, 2 filas) y la card con estadísticas gana sitio.
- A (alternativa): filas de 2: [HTB 5 + 2], [2 + 5], [7]. Obliga a una card de 7 columnas (~800 px), rara en el mosaico.

## Riesgos y trabas

- `tokens.css` en 99 líneas: hay que añadir `--color-marca-claude` y `--color-marca-bun`. `--color-overlay-strong` y `--color-overlay-soft` no se usan en `src/` ni en tests (verificado con grep): salen y queda en 99. `--color-marca-htb-accent` sí se usa (htb-stadistics.css) y se queda.
- Contraste AA: `#D97757` (Claude) da 3,12:1; se propone `#B4532F` (4,98:1). Bun: `#3D2B1F` (13,43:1).
- Cards que cambian de tamaño en escritorio: CLOUDFLARE 8→2, GITHUB 5→2, YOUTUBE 5→4, HTB 4×2→5×4; nuevas CLAUDE y BUN (2). Hay que reajustar sus iconos (criterios de la 97: logo dentro de la card, sin tapar el título si algún fill tiene contraste < 4,5:1; aplica a claude #D97757 y bun crema).
- Tests congelados o con geometría que hay que ajustar con nota (precedente REQ-43-06): hero-cards-repository, hero-cards-unique-tech, hero-cards-styles, htb-hero-card, hero-card-kinds-domain, hero-card-registry (regex exacta del `<article>`), hero-cards-icon-fit (REQ-97-21 congela hero-section.css), geist-pixel-extend (congela hero-card.astro), design-tokens.
- `hero-cards-parse.ts` en 94 líneas: quitar gridColumn/gridRow (−4) compensa leer `category`.
- El scroll horizontal a 800 px del header es de la 93 (blocked): fuera de alcance.

## Descomposición

Una sola feature (98): datos, dominio de colocación, CSS y tests están acoplados (un cambio parcial deja el mosaico con huecos o tests en rojo). Ningún archivo supera 100 líneas; sin dependencias externas.
