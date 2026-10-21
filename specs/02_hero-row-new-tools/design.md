# Diseño — hero-row-new-tools

> Feature 2 del ciclo 2026-10-21. Petición humana (2026-10-21): «En las cards
> del hero pon una nueva fila con los los sprites de bash, web assembly, astro,
> opencode, y tauri, la card grande sera la de astro.»
> Análisis completo y alternativas: `progress/research/hero-fila-nueva-tools.md`.

## Contexto visual

- **Qué se ve afectado**: el mosaico de tarjetas del hero
  (`src/components/new-hero/new-hero.astro`). Se añade **una franja horizontal
  nueva** con cinco tarjetas: `bash`, `webassembly`, `astro` (grande),
  `opencode` y `tauri`.
- **Estado actual**: 15 tarjetas (1 rica + 14 de icono) en dos franjas
  inferiores: `[nestjs grande, css, react, html, claude-code]` y
  `[bun, claude, typescript grande, youtube, github]`.
- **Estado deseado**: tres franjas inferiores, con la nueva en el medio:
  1. `row: 1` → `[nestjs grande, css, react, html, claude-code]` (sin cambios)
  2. `row: 2` → `[bash, webassembly, astro grande, opencode, tauri]` (**nueva**)
  3. `row: 3` → `[typescript grande, bun, claude, youtube, github]`
- La franja 2 usa el patrón `[2×2, 2×2, 4×2, 2×2, 2×2]`: el hueco grande queda
  en **tercera posición**, que es donde el humano sitúa a `astro`
  (`bash, web assembly, astro, opencode, tauri`).
- La franja 3 conserva a las redes sociales en las dos últimas columnas
  (esquina inferior derecha): el invariante "social en la última fila" se
  mantiene. Como consecuencia del patrón alterno, la tarjeta grande
  `typescript` pasa del 3.º al 1.º hueco de su franja.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-bash` | `#252A31` (propuesto) | fondo de la card bash |
| `--color-marca-webassembly` | `#241A5C` (propuesto) | fondo de la card webassembly (violeta #654FF0 de marca) |
| `--color-marca-astro` | `#2E1039` (propuesto) | fondo de la card astro (degradado de marca #D83333 → #F041FF) |
| `--color-marca-opencode` | `#101114` (propuesto) | fondo de la card opencode (glifo `currentColor`) |
| `--color-marca-tauri` | `#0F2C36` (propuesto) | fondo de la card tauri (ámbar #FFC131 / cian #24C8DB) |
| `--card-bg` | por token | fondo real de la tarjeta (`--card-bg: var(--color-marca-<marca>)`) |
| `--icon-width` `--icon-rotation` `--icon-scale` | por token | geometría del icono de cada tarjeta |
| `--gap-card` `--radius-card` `--color-border` `--color-text` | los actuales | no cambian |

Los cinco colores son **propuestos** (bash, opencode y tauri no tienen color
oficial cerrado en el repo): se ajustan en la regresión visual sin tocar el
resto del diseño. Ningún hex nuevo fuera de `tokens.css`
(`scripts/audit-design-tokens.mjs`).

## Decisiones y constraints

- **Decisión 1 — la fila nueva es la fila 2, no la última.** La última franja
  la ocupan las redes sociales (invariante establecido); insertar la fila nueva
  antes mantiene la esquina inferior derecha y hace que el hueco grande de
  `astro` caiga en tercera posición, como en la petición.
- **Decisión 2 — las redes sociales pasan de `row: 2` a `row: 3`** al insertar
  la fila nueva. Es la única renumeración que provoca la inserción.
- **Decisión 3 — los datos declaran `featured` solo en `astro`.** Cada fila
  admite exactamente una tarjeta `featured` (hueco grande de 4 columnas); el
  motor falla si una fila declara dos o ninguna.
- **Decisión 4 — hoja de estilos nueva** `src/styles/hero-card-brands.css`:
  `hero-card.css` está en 99 líneas y no caben cinco reglas
  `[data-color-token]` ni los ajustes de ≤1200 px. La hoja nueva la importa
  `src/components/hero-card.astro` (junto a `hero-card.css`,
  `hero-card-accents.css` y `hero-card-link.css`). Precedente:
  `hero-card-accents.css` (hoja hermana de `hero-card.css`).
- **Decisión 5 — `tokens.css` se compacta, no se divide.** Los tokens de marca
  viven en `tokens.css` (regla del repo); para que quepan los cinco nuevos se
  agrupan las marcas de dos en dos líneas (o se recortan comentarios del
  bloque) manteniendo el archivo en ≤ 100 líneas. No se crea un segundo
  archivo de tokens.
- **Decisión 6 — geometría del icono**: el alto del `<svg>` (28 px) manda sobre
  la escala, igual que en las tarjetas grandes existentes; `astro` (symbol
  85×107) y `tauri` (256×289) son altos, `bash`/`webassembly`/`opencode` son
  cuadrados. Valores propuestos:
  - `astro` (grande): `--icon-width: 200px; --icon-rotation: -8deg; --icon-scale: 6`
  - `bash`: `--icon-width: 115px; --icon-rotation: -8deg;`
  - `webassembly`: `--icon-width: 110px; --icon-rotation: -8deg;`
  - `opencode`: `--icon-width: 110px; --icon-rotation: 0deg;`
  - `tauri`: `--icon-width: 115px; --icon-rotation: -8deg;`
  - a ≤1200 px: las cuatro pequeñas bajan a `--icon-scale: 3` y `astro` a
    `--icon-width: 150px; --icon-scale: 3` (como `node`, `nestjs` y
    `typescript`).
- **Decisión 7 — el sprite no se toca.** Los symbols `bash`, `webassembly`,
  `astro`, `opencode` y `tauri` ya existen en
  `public/assets/svg/sprite.svg`; la regla del repo prohíbe modificarlo.
- **Decisión 8 — `showOnMobile: false`** en las cinco tarjetas: en ≤768 px el
  mosaico solo muestra la tarjeta rica y el perfil (como el resto de
  tecnologías).
- **Restricciones del proyecto**: ≤ 100 líneas por archivo; estilos fuera del
  `.astro`; tokens, nunca colores sueltos; datos solo por repositorio; sin
  dependencias nuevas; estático por defecto; una URL por página (no se crean
  páginas); errores explícitos.

## Trazabilidad REQ → acceptance → test

| REQ | Acceptance (en `feature_list.json`) | Test (en `tests/`) |
|-----|----------------------------------------|---------------------|
| REQ-02-01, REQ-02-02, REQ-02-03, REQ-02-04 | A1 | test de datos: las 5 tarjetas existen con sprite, `colorToken`, `row: 2`, `featured` en astro y `showOnMobile: false` |
| REQ-02-05, REQ-02-06, REQ-02-07 | A2 | test de colocación: la fila 2 contiene las 5 marcas con `astro` en el hueco grande (span 4) y las otras en orden |
| REQ-02-08 | A3 | test de tokens: los 5 `--color-marca-*` existen en `tokens.css` |
| REQ-02-09 | A4 | test de estilos: cada `colorToken` nuevo tiene su regla `[data-color-token]` con `--card-bg: var(--color-marca-…)` |
| REQ-02-10 | A5 | test de estilos: la regla de `astro` define `--icon-width` y `--icon-scale` mayores que los de las pequeñas |
| REQ-02-11 | A6 | test de estilos: existe el bloque ≤1200 px con la escala reducida de las 5 marcas |
| REQ-02-12 | A7 | `git diff` del sprite vacío + los 5 symbols presentes en el fichero |
| REQ-02-13 | A8 | regresión visual manual a 375/768/1280 px (`docs/verification.md`) |

## Alternativa descartada

- **Alternativa**: añadir las 5 tarjetas al final de `hero-cards.json` sin más
  (o reordenarlas para que caigan juntas) y relajar el invariante de las redes
  sociales para que la fila nueva sea la última.
- **Motivo del descarte**: (a) con el reparto actual las 5 tarjetas **no**
  caen juntas — la simulación deja `bash` y `webassembly` en la franja
  anterior y mezcla la fila nueva con `youtube` y `github` en la última; (b)
  declarar la fila en los datos (feature 1) la hace reproducible y verificable;
  (c) relajar el invariante de las redes sociales rompe un requisito ya
  establecido y no lo pide la petición humana.
