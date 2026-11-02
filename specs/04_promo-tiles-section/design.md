# Diseño — promo-tiles-section (feature 4)

## Contexto visual

- Pantalla: home (`src/pages/home.astro`), dentro de `.home__landing`, justo
  DESPUÉS de `<LatestHorizontal />` (tras las cards de los artículos).
- Estado actual: la landing termina en el carrusel horizontal de artículos.
- Estado deseado: cuadrícula promocional 2x2 inspirada en la de apple.com
  (referencia `c:\Users\Moises\Desktop\section.PNG`): cuatro cuadros grandes casi
  a ancho completo, separación estrecha (10 px), esquinas rectas, fondo plano
  por cuadro; arriba y centrados título grande en negrita, subtítulo de 1-2
  líneas y dos botones píldora (primario relleno azul, secundario contorneado
  azul); debajo, la imagen centrada ocupando la parte inferior del cuadro.
  En <=768 px, una sola columna.

## Contenido exacto (src/data/promo-tiles.json, en este orden)

| # | id | tone | image | title | subtitle | primary (label → href) | secondary (label → href) |
|---|----|------|-------|-------|----------|------------------------|--------------------------|
| 1 | youtube-kernel | youtube | /assets/pic01.webp | Rust en el kernel de Linux | Programación de sistemas explicada en video, de la memoria al kernel. | Ver en YouTube → https://www.youtube.com/@moibaldenegro | Sobre mí → /about |
| 2 | mfinance | mfinance | /assets/pic02.webp | MFinance | Tus finanzas personales, 100 % locales. Tauri, Rust y React. | Ver el código → https://github.com/MoiBaldenegro/mfinance | Más proyectos → /about |
| 3 | new-relic | new-relic | /assets/pic03.webp | New Relic for Students | Ganador del reto de New Relic con Platzi y GitHub Education. | Ver en LinkedIn → https://www.linkedin.com/in/moibaldenegro/ | Mi experiencia → /about |
| 4 | tomatesoft | tomatesoft | /assets/pic04.webp | Tomatesoft | Gestiona tu negocio de forma inteligente: punto de venta, mesas y reportes. | Mi experiencia → /about | Ver GitHub → https://github.com/MoiBaldenegro |

`imageAlt` exactos:

1. "Video de Moisés Baldenegro en YouTube sobre Rust en el kernel de Linux"
2. "Página de inicio de MFinance, app de escritorio de finanzas personales"
3. "Publicación de New Relic for Students con Moisés Melendez entre los ganadores"
4. "Página de inicio de Tomatesoft con sus funcionalidades de gestión de negocio"

Todos los destinos están verificados en el repo: `/about` existe
(`src/pages/about.astro`); YouTube, LinkedIn y GitHub salen de
`src/data/about.json` y `src/data/hero-cards.json`. No hay URL pública de
Tomatesoft en el repo: no se inventa, por eso su primario va a `/about`.

## Tokens usados

Nuevos en `tokens.css` (grupo "Color de la sección promocional", feature 4):

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-promo-youtube` | `#0e0e10` | Fondo del cuadro 1 (esquina oscura del degradado gris de pic01) |
| `--color-promo-mfinance` | `#0d1a1d` | Fondo del cuadro 2 (verde-azulado muy oscuro de pic02) |
| `--color-promo-new-relic` | `#0e0b22` | Fondo del cuadro 3 (violeta espacial oscuro de pic03) |
| `--color-promo-tomatesoft` | `#0b0909` | Fondo del cuadro 4 (negro cálido de pic04) |
| `--color-promo-cta` | `#0071e3` | Fondo del botón primario (azul Apple; blanco encima 4,6:1) |
| `--color-promo-cta-hover` | `#0077ed` | Hover del botón primario |
| `--color-promo-link` | `#2997ff` | Borde y texto del botón secundario sobre fondo oscuro (>= 6:1) |
| `--gap-promo` | `10px` | Separación entre cuadros y margen lateral de la cuadrícula |

Existentes: `--color-text` (título y texto del primario),
`--color-text-secondary` (subtítulo), `--radius-pill` (botones),
`--transition-default` (hover), `--font-sans`.

`tokens.css` está en 98 líneas: los 8 tokens van de dos en dos por línea
(patrón del bloque de marcas) y se compacta un comentario existente (p. ej. el
de `--radius-thumb`, 3 líneas → 1) para quedar en <= 100 líneas.

## Medidas

- Cuadrícula: `display: grid; grid-template-columns: 1fr 1fr; gap: var(--gap-promo);`
  `padding-inline: var(--gap-promo);` ancho completo de `.home__landing`.
- Cuadro: `display: flex; flex-direction: column; align-items: center;`
  `text-align: center; min-height: 580px; padding-top: 52px; overflow: hidden;`
  `border-radius: 0;` fondo `var(--color-promo-<tone>)` vía `[data-tone="<tone>"]`.
- Título h3: `font-size: clamp(28px, 3vw, 40px); font-weight: 600;` color `--color-text`.
- Subtítulo: `font-size: clamp(17px, 1.6vw, 21px); max-width: 32ch;` color `--color-text-secondary`.
- Botones: fila centrada con `gap: 14px; margin-top: 16px;` cada uno
  `padding: 8px 18px; font-size: 15px; border-radius: var(--radius-pill);`
  primario relleno, secundario transparente con borde 1 px.
- Imagen: `margin-top: auto; width: min(100%, 440px); aspect-ratio: 1;`
  `object-fit: contain;` con
  `mask-image: linear-gradient(to bottom, transparent, black 22%)` (palabra
  clave `black`, no hex, para no romper el audit de colores) que funde el
  borde superior del mockup con el fondo del cuadro.
- <=768 px: `grid-template-columns: 1fr; min-height: 500px; padding-top: 40px;`
  imagen `width: min(88%, 360px)`.

## Decisiones y constraints

- Decisión 1 — fondos por imagen, sin tablero claro/negro: las cuatro imágenes
  tienen fondo oscuro (gris oscuro, verde-azulado, violeta espacial, negro
  cálido). Un cuadro claro `#f5f5f7` junto a cualquiera de ellas dejaría un
  recorte duro y texto claro/oscuro incoherente con el sitio (fondo
  `#070716`). Cada cuadro toma un tono oscuro muestreado de su imagen y el
  texto es siempre claro.
- Decisión 2 — botones como `<a>`: todos los destinos son navegación; los
  externos (`https://`) abren en pestaña nueva con `rel="noopener noreferrer"`.
  La decisión externo/interno vive en un helper `.ts` (p. ej.
  `src/domain/promo-tiles.ts`, `linkAttrs(href)`), no en el frontmatter.
- Decisión 3 — `alt` descriptivo (no decorativo): las imágenes aportan
  contexto (mockups reales del autor).
- Constraints: estático (sin `<script>`), sin dependencias, CSS en
  `src/styles/promo-tiles.css` (no `<style>`), datos vía repositorio, <=100
  líneas por archivo, colores solo de `tokens.css` (`scripts/audit-design-tokens.mjs`).
- Archivos previstos: `src/data/promo-tiles.json`,
  `src/domain/entities/promo-tile.ts`,
  `src/domain/repositories/promo-tiles-repository.ts` (+ módulo de parseo
  hermano si supera 100 líneas), `src/domain/promo-tiles.ts`,
  `src/components/promo-tiles/promo-tiles.astro`,
  `src/styles/promo-tiles.css`, `src/styles/tokens.css`,
  `src/pages/home.astro`, `tests/promo-tiles-section.test.mjs`.

## Alternativa descartada

- Tablero alterno claro `#f5f5f7` / negro idéntico a Apple: descartado por la
  Decisión 1 (las imágenes son todas oscuras).
- Imagen como `background-image` a sangre con el texto encima: descartado por
  legibilidad del texto sobre las capturas (pic03 tiene la mitad superior
  clara) y porque el `alt` se perdería.
