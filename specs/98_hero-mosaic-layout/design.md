# Diseño — Mosaico del hero calculado en el dominio (feature 98 hero-mosaic-layout)

Análisis: `progress/research/hero-mosaic-layout.md`.

## Contexto visual

- Sección: grid del hero de la portada (`src/components/new-hero/new-hero.astro`), perfil + cards.
- Hoy: 13 cards colocadas a mano (celda fija por `[data-color-token]` en `hero-card.css`, duplicada en `gridColumn`/`gridRow` del JSON); la última fila es CLOUDFLARE span 8 + HACK THE BOX span 4; faltan claude y bun; GitHub figura como «GITHUB ACTIONS».
- Deseado: 15 cards (12 tecnologías + 2 redes + HTB), personalizadas arriba junto al perfil, redes en la última fila, cada fila inferior con 5 cards (4 de span 2 y 1 de span 4). La colocación la calcula el dominio a partir del orden y el tipo.

## Mapa del mosaico de escritorio (≥ 1201 px, 12 columnas, filas de 95 px)

Notación: columna `inicio / span N` × fila `inicio / span N`. Perfil (sin cambios): `1 / span 5` × `1 / span 6`.

Zona superior (columnas 6-12 × filas 1-6, 5 huecos):

| Hueco | Card | Columna | Fila | Tamaño |
|-------|------|---------|------|--------|
| 1 | HACK THE BOX (htb, personalizada) | 6 / span 5 | 1 / span 4 | 5x4 |
| 2 | HTML | 11 / span 2 | 1 / span 2 | 2x2 |
| 3 | NODE JS | 11 / span 2 | 3 / span 2 | 2x2 |
| 4 | REACT | 6 / span 5 | 5 / span 2 | 5x2 |
| 5 | RUST | 11 / span 2 | 5 / span 2 | 2x2 |

Fila inferior 1 (filas 7-8, tal cual hoy):

| Card | Columna | Tamaño |
|------|---------|--------|
| TYPESCRIPT | 1 / span 2 | 2x2 |
| CSS | 3 / span 2 | 2x2 |
| AWS | 5 / span 2 | 2x2 |
| CLAUDE CODE | 7 / span 4 | 4x2 (doble) |
| NESTJS | 11 / span 2 | 2x2 |

Fila inferior 2 (filas 9-10, última fila, redes al final):

| Card | Columna | Tamaño |
|------|---------|--------|
| CLOUDFLARE | 1 / span 2 | 2x2 |
| CLAUDE | 3 / span 2 | 2x2 |
| BUN | 5 / span 2 | 2x2 |
| YOUTUBE (social) | 7 / span 4 | 4x2 (doble) |
| GITHUB (social) | 11 / span 2 | 2x2 |

Comprobación: zona superior 20+4+4+10+4 = 42 = 7x6 celdas; filas inferiores 2+2+2+4+2 = 12 columnas. Sin huecos ni solapes; el hero sigue con 10 filas.

## Orden y datos de `src/data/hero-cards.json` (orden del array = orden del mapa)

| # | id | title | colorToken | icon | category | iconWidth | rotate |
|---|----|-------|------------|------|----------|-----------|--------|
| 1 | htb (kind htb) | HACK THE BOX | htb | — | — | — | — |
| 2 | html | HTML | html | #html | tech | 115px | -7 |
| 3 | node | NODE JS | node | #node | tech | 120px | -10 |
| 4 | react | REACT | react | #react | tech | 165px | -8 |
| 5 | rust | RUST | rust | #rust | tech | 115px | -8 |
| 6 | typescript | TYPESCRIPT | typescript | #typescript | tech | 110px | -10 |
| 7 | css | CSS | css | #css | tech | 105px | -8 |
| 8 | aws | AWS | aws | #aws | tech | 120px | -6 |
| 9 | claude-code | CLAUDE CODE | claude-code | #claude-code | tech | 165px | 0 |
| 10 | nestjs | NESTJS | nestjs | #nestjs | tech | 120px | -5 |
| 11 | cloudflare | CLOUDFLARE | cloudflare | #cloudflare | tech | 34px (inicial) | 0 |
| 12 | claude | CLAUDE | claude | #claude | tech | 110px (inicial) | -8 (inicial) |
| 13 | bun | BUN | bun | #bun | tech | 115px (inicial) | -8 (inicial) |
| 14 | youtube | YOUTUBE | youtube | #youtube | social | 170px | -8 |
| 15 | github | GITHUB | github | #github | social | 115px (inicial) | -8 (inicial) |

`icon` es `/assets/svg/sprite.svg#<id>`; `scale` 5 en todas. Los valores marcados «inicial» son el punto de partida de las cards que cambian de tamaño o son nuevas: el implementer los ajusta con la medida CDP (REQ-98-31..33) y deja JSON y regla base iguales (REQ-98-35). El resto conserva el valor de la 97.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-claude` (nuevo) | `#B4532F` | Fondo de CLAUDE; terracota derivada de `#D97757` (3,12:1, no AA). Contraste con `#ffffff`: 4,98:1 |
| `--color-marca-bun` (nuevo) | `#3D2B1F` | Fondo de BUN; marrón del contorno del logo, el bollo crema destaca. Contraste: 13,43:1 |
| `--color-overlay-strong`, `--color-overlay-soft` | (salen) | Sin uso en `src/` ni en tests: se quitan para dejar `tokens.css` en 99 líneas |
| Resto de `--color-marca-*` | sin cambios | `github` y `youtube` conservan su token |

## Decisiones y constraints

- Decisión 1 (dominio): `src/domain/hero-grid-layout.ts` exporta `layoutHeroCards(cards)` → `{ card, colSpan, rowSpan, column, row }[]` y `HeroGridLayoutError`. Ordena por grupo (kind ≠ icon → category tech → category social, estable), aplica la plantilla superior `[5x4, 2x2, 2x2, 5x2, 2x2]` y el patrón inferior `[2, 2, 2, 4, 2]` (alto 2), y calcula columna/fila de inicio simulando el auto-placement disperso (`grid-auto-flow: row`) con el perfil reservado (cols 1-5, filas 1-6). Valida y lanza errores (REQ-98-12..14). Las constantes del perfil reflejan `profile-card.css`.
- Decisión 2 (sin posiciones en el marcado): los componentes emiten solo `data-col-span` / `data-row-span`; el navegador coloca por auto-placement en el orden del DOM, que es el de `layoutHeroCards`. `style=` queda descartado (convención y REQ-09-03). `hero-grid-card.astro` recibe la card colocada y pasa `card`, `colSpan` y `rowSpan` al componente del registro.
- Decisión 3 (CSS): en `hero-section.css`, reglas `[data-col-span="2|4|5"] { --card-column: span N; }` y `[data-row-span="2|4"] { --card-row: span N; }`. `.hero-card { grid-column: var(--card-column); grid-row: var(--card-row); }` no cambia. Las reglas `[data-color-token]` de `hero-card.css` quedan con color e icono.
- Decisión 4 (tablet y móvil): sin cambios de geometría. En ≤ 1200 px la primera regla `.hero-card { grid-column: auto !important; grid-row: auto !important; }` sigue anulando los spans (6 columnas con perfil a ancho completo; 1 columna en ≤ 768 px). Se conservan los ajustes de la 97: título a 0,8rem con letter-spacing 0,04em y header a 14 px, y los ajustes de icono por tramo (GITHUB, RUST, AWS, CLAUDE CODE, CLOUDFLARE), revisados con la nueva colocación; CLAUDE y BUN pueden añadir los suyos dentro del mismo bloque.
- Decisión 5 (doble de cada fila inferior): siempre el 4.º hueco, como CLAUDE CODE hoy. En la última fila cae en YOUTUBE (antes span 5, su logo ancho encaja).
- Decisión 6 (category): campo opcional `category` en las cards de icono (`tech` por defecto, `social`). Catálogo cerrado en la entidad. Las cards ricas (kind ≠ icon) son siempre «personalizadas».
- Restricciones: ≤ 100 líneas por archivo (`hero-card.css` 94 → ~96; `hero-section.css` 55 → ~62; `tokens.css` 99 → 99; `hero-cards-parse.ts` 94: quitar gridColumn/gridRow compensa `category`); sin dependencias; estático; solo tokens.
- Tests a ajustar con nota «Ajuste feature 98 (precedente REQ-43-06)»: `hero-cards-repository` (13 → invariantes), `hero-cards-unique-tech` (tabla 97 → tabla de este design), `hero-cards-styles` (`--card-column` por token → reglas por span), `htb-hero-card` (celda 9/span 4), `hero-card-kinds-domain` (gridColumn/gridRow → category), `hero-card-registry` (regex del `<article>`), `hero-cards-icon-fit` (REQ-97-21 congela hero-section.css), `geist-pixel-extend` (congela hero-card.astro), `design-tokens` (lista de tokens). Test nuevo `tests/hero-mosaic-layout.test.mjs` con las invariantes: cada icon del sprite como mucho una vez; sin huecos ni solapes en escritorio; cada fila inferior con 5 cards y exactamente 1 de span 4; redes en la última fila; personalizadas en la zona superior.

## Alternativa descartada

- Zona superior opción A: filas [HTB 5 + 2], [2 + 5], [7]. Descartada por defecto: obliga a una card de 7 columnas (~800 px a 1280), ajena al resto del mosaico; B da a HTB espacio para sus estadísticas y mantiene todas las tecnologías en 2 o 5 columnas. Si el humano la prefiere, solo cambia la plantilla superior del dominio.
- Posiciones a mano en JSON o en `[data-color-token]`: descartada; añadir una card obligaría a recolocar todo.
- Estilos inline con la celda calculada: descartado por la convención (estilos separados de la UI) y REQ-09-03.
