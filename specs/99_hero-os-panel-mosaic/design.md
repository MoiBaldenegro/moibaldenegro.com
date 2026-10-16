# Diseño — Mosaico del hero estilo panel de sistema operativo (feature 99 hero-os-panel-mosaic)

Análisis: `progress/research/hero-os-panel-mosaic.md`. Captura de partida: `C:/Users/Moises/Desktop/acomodo.PNG`.

## Contexto visual

- Sección: grid del hero de la portada (`src/components/new-hero/new-hero.astro`), perfil + 15 cards.
- Hoy (feature 98): la doble de cada fila inferior cae siempre en el 4.º hueco, así que CLAUDE CODE (filas 7-8) y YOUTUBE (filas 9-10) quedan una encima de otra en las columnas 7-10 y las columnas del mosaico se ven alineadas. Las grandes son REACT, CLAUDE CODE y YOUTUBE, que no son lo más relevante del perfil. El logo de CLOUDFLARE se ve cortado («CLOU»).
- Deseado: panel tipo menú de inicio de un sistema operativo, con un patrón distinto en cada par de filas y las grandes en escalera (derecha → izquierda → centro), nunca en la misma columna en filas contiguas. Las grandes son NODE JS, NESTJS y TYPESCRIPT; redes y tecnologías de apoyo, pequeñas.

## Mapa del mosaico de escritorio (≥ 1201 px, 12 columnas, filas de 95 px)

Notación: columna `inicio / span N` × fila `inicio / span N`. Perfil sin cambios: `1 / span 5` × `1 / span 6`. «Grande» = hueco grande de la plantilla (card con `featured: true`).

Zona superior (columnas 6-12 × filas 1-6). Plantilla `[5x4, 2x2, 2x2, 2x2, 5x2]`:

| Hueco | Card | Columna | Fila | Tamaño |
|-------|------|---------|------|--------|
| 1 | HACK THE BOX (htb, personalizada) | 6 / span 5 | 1 / span 4 | 5x4 |
| 2 | RUST | 11 / span 2 | 1 / span 2 | 2x2 |
| 3 | AWS | 11 / span 2 | 3 / span 2 | 2x2 |
| 4 | CLOUDFLARE | 6 / span 2 | 5 / span 2 | 2x2 |
| 5 | NODE JS (grande) | 8 / span 5 | 5 / span 2 | 5x2 |

Fila inferior 1 (filas 7-8, índice 0, patrón `4-2-2-2-2`):

| Card | Columna | Tamaño |
|------|---------|--------|
| NESTJS (grande) | 1 / span 4 | 4x2 |
| CSS | 5 / span 2 | 2x2 |
| REACT | 7 / span 2 | 2x2 |
| HTML | 9 / span 2 | 2x2 |
| CLAUDE CODE | 11 / span 2 | 2x2 |

Fila inferior 2 (filas 9-10, índice 1, última fila, patrón `2-2-4-2-2`, redes al final):

| Card | Columna | Tamaño |
|------|---------|--------|
| BUN | 1 / span 2 | 2x2 |
| CLAUDE | 3 / span 2 | 2x2 |
| TYPESCRIPT (grande) | 5 / span 4 | 4x2 |
| YOUTUBE (social) | 9 / span 2 | 2x2 |
| GITHUB (social) | 11 / span 2 | 2x2 |

Comprobación: zona superior 20+4+4+4+10 = 42 = 7x6 celdas; filas inferiores 4+2+2+2+2 = 2+2+4+2+2 = 12 columnas. Sin huecos ni solapes; el hero sigue con 10 filas.

Anchos de las cards que empiezan en cada par de filas (REQ-99-16): 1-2 `[5, 2]`, 3-4 `[2]`, 5-6 `[2, 5]`, 7-8 `[4, 2, 2, 2, 2]`, 9-10 `[2, 2, 4, 2, 2]`: todos distintos del siguiente.

Grandes (REQ-99-15): NODE JS columnas 8-12 (filas 5-6), NESTJS 1-4 (filas 7-8), TYPESCRIPT 5-8 (filas 9-10). Entre filas contiguas no comparten columna; NODE JS y TYPESCRIPT comparten la columna 8 pero no son contiguas (filas 5-6 frente a 9-10). HACK THE BOX es personalizada y queda fuera de la regla.

## Orden y datos de `src/data/hero-cards.json` (orden del array = orden del mapa)

| # | id | featured | category | iconWidth | rotate |
|---|----|----------|----------|-----------|--------|
| 1 | htb (kind htb) | — | — | — | — |
| 2 | rust | false (omitido) | tech | 115px | -8 |
| 3 | aws | false | tech | 120px | -6 |
| 4 | cloudflare | false | tech | 28px (inicial) | 0 |
| 5 | node | **true** | tech | 165px (inicial) | -10 |
| 6 | nestjs | **true** | tech | 160px (inicial) | -5 |
| 7 | css | false | tech | 105px | -8 |
| 8 | react | false | tech | 115px (inicial) | -8 |
| 9 | html | false | tech | 115px | -7 |
| 10 | claude-code | false | tech | 115px (inicial) | 0 |
| 11 | bun | false | tech | 115px | -8 |
| 12 | claude | false | tech | 110px | -8 |
| 13 | typescript | **true** | tech | 150px (inicial) | -10 |
| 14 | youtube | false | social | 115px (inicial) | -8 |
| 15 | github | false | social | 115px | -8 |

`title`, `colorToken`, `icon` y `scale` no cambian respecto a la 98. `featured` se puede omitir cuando es `false`. Los valores «inicial» son el punto de partida de las cards que cambian de tamaño (NODE JS, NESTJS y TYPESCRIPT crecen; REACT, CLAUDE CODE y YOUTUBE encogen) y de CLOUDFLARE: el implementer los ajusta con la medida CDP (REQ-99-26..29) y deja JSON y regla base iguales (REQ-99-31). Los ajustes por tramo de la 97/98 en `@media` se revisan para las cards que cambian.

## Tokens usados

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-marca-*` | sin cambios | Fondo de cada card (ningún token nuevo) |
| `--gap-card` | sin cambios | Separación del grid |

## Decisiones y constraints

- Decisión 1 (relevancia en el dato): campo booleano opcional `featured` en las cards de icono (`false` por defecto). Por defecto `true` en node, nestjs y typescript: son las tres primeras tecnologías del subtítulo del perfil (`Node.js • NestJS • TypeScript`, de `src/data/about.json`). AWS, Cloudflare (Workers) y Rust también son núcleo del perfil, pero el mosaico de 10 filas tiene 3 huecos grandes; quedan pequeñas y arriba, junto al perfil. Cambiar cuál es grande es mover un `featured`; añadir una grande exige un hueco grande más en la plantilla o el build falla (REQ-99-10), nunca un mosaico roto en silencio.
- Decisión 2 (dominio): `layoutHeroCards` recorre una secuencia de huecos (zona superior + filas inferiores alternando `4-2-2-2-2` / `2-2-4-2-2`), cada uno marcado grande o pequeño; llena los primeros con las personalizadas, los grandes con la cola de `featured` y los pequeños con la cola tech sin `featured` seguida de las redes (orden del JSON en cada cola). La celda de inicio se sigue calculando con el auto-placement disperso de la 98. Si `hero-grid-layout.ts` pasa de 100 líneas, las plantillas pueden ir a un módulo hermano `src/domain/hero-grid-template.ts`.
- Decisión 3 (5 por fila con 1 doble, se mantiene): la regla de la 98 no está revocada y basta con alternar la posición de la doble para romper la alineación. Se descartan por defecto las cards de 2 filas de alto (ver alternativa).
- Decisión 4 (CSS y marcado): sin reglas nuevas de span: `hero-section.css` ya traduce `data-col-span` 2/4/5 y `data-row-span` 2/4. Sin `style=`, sin JS de cliente nuevo, cálculo en build y determinista (sin `Math.random` ni `Date`).
- Decisión 5 (tablet y móvil): sin cambios de geometría; en ≤ 1200 px `grid-column: auto !important` sigue anulando los spans (6 columnas; 1 columna en ≤ 768 px) y las cards se ven en el nuevo orden del DOM. Se revisan los ajustes de icono por tramo de las cards que cambian.
- Decisión 6 (CLOUDFLARE): el símbolo `#cloudflare` (viewBox 0 0 512 76) es nube + texto; hoy el texto se sale por la derecha. Se ajustan `--icon-width` (y si hace falta `--icon-scale` por tramo) para que el símbolo completo quede dentro de la card y lejos del título (REQ-99-26/27).
- Restricciones: ≤ 100 líneas por archivo (`hero-card.css` está en 98: los ajustes nuevos sustituyen o comparten línea con los existentes; `hero-cards-parse.ts` 92; `hero-grid-layout.ts` 89); sin dependencias; estático; solo tokens.
- Tests a ajustar con nota «Ajuste feature 99 (precedente REQ-43-06)»: `hero-mosaic-layout` (plantilla y mapa 98 → invariantes de esta spec: sin huecos ni solapes, pares de filas con anchos distintos, grandes = `featured`, grandes sin columna compartida en filas contiguas, redes 2x2 en la última fila, personalizadas en la zona superior, determinismo), `hero-cards-unique-tech` (tabla 98 → tabla de este design), `hero-cards-icon-fit` (valores por tramo que cambien), `hero-card-kinds-domain` (campo `featured`), `htb-hero-card` y `hero-cards-repository` si fijan orden o celdas.

## Alternativa descartada

- Panel con una card de 2 filas de alto (p. ej. NODE JS 2x4 en columnas 11-12 × filas 1-4): da más aire de «tiles», pero con 15 cards obliga a una fila inferior de 6 cards sin doble (rompe la regla de la 98 no revocada) o a una card de 3 columnas; solo cambiaría la plantilla del dominio si el humano la prefiere.
- Doble en una columna fija por fila con desplazamiento aleatorio: descartada, el patrón debe ser determinista en build.
- Lista ordenada de relevancia en el dominio en vez de `featured` en el JSON: descartada por defecto; el dato vive con la card y se cambia sin tocar código.
