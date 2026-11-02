# Análisis — sección promocional tipo Apple tras los artículos (feature 4)

## Petición humana

"después de las cards de los artículos créame una sección inspirada en estas 4 grandes secciones de apple c:\Users\Moises\Desktop\section.PNG muy similar; en assets tienen las pic del 1 al 4 para ponerlas ahí en cada cuadro"

## Qué es

Una sección nueva estática en la home: cuadrícula 2x2 (1 columna en móvil) de
cuatro cuadros grandes, cada uno con título, subtítulo, dos botones píldora
(primario relleno azul, secundario contorneado) e imagen inferior
(`public/assets/pic01..04.webp`). Va dentro de `.home__landing`, justo después
de `<LatestHorizontal />` en `src/pages/home.astro`.

## Referencia (section.PNG)

Grid 2x2 de apple.com: gap ~10 px, sin radios, cuadros ~580 px de alto,
tablero claro `#f5f5f7` / negro, título ~40 px negrita, subtítulo ~20 px,
botones "Learn more" (relleno azul) y "Buy/Pre-order" (contorno azul),
imagen de producto centrada abajo.

## Imágenes (revisadas, 1920x1920, todas sobre fondo OSCURO)

| pic | Contenido | Fondo |
|-----|-----------|-------|
| 01 | Mockup de video de YouTube del autor: "Kernel de Linux #Rust #Linux #Kernel" | Degradado gris oscuro con luz arriba a la derecha |
| 02 | Landing de MFinance ("Tu dinero, claro como un cierre de mes", app Windows 100 % local) | Degradado verde-azulado oscuro |
| 03 | LinkedIn: post de New Relic for Students (con Platzi y GitHub Education) con Moisés Melendez entre los ganadores | Espacio violeta/negro |
| 04 | Landing de Tomatesoft ("Gestiona tu negocio de forma inteligente", punto de venta, mesas, roles, reportes) | Negro con tono cálido marrón |

Conclusión: el tablero claro/negro de Apple NO encaja (todas las imágenes son
oscuras). Se decide fondo oscuro por cuadro muestreado de su imagen y texto
claro; detalle y tokens en `specs/04_promo-tiles-section/design.md`.

## Qué toca

- Datos: `src/data/promo-tiles.json` (nuevo).
- Dominio: entidad `src/domain/entities/promo-tile.ts`, repositorio
  `src/domain/repositories/promo-tiles-repository.ts` (patrón de
  `hero-profile-repository.ts`: import con atributo + loader inyectable +
  error nombrado `PromoTilesDataError`), helper `src/domain/promo-tiles.ts`
  (atributos de enlace externo/interno).
- UI: `src/components/promo-tiles/promo-tiles.astro`,
  `src/styles/promo-tiles.css`, `src/pages/home.astro`.
- Tokens: `src/styles/tokens.css` (8 tokens nuevos).
- Tests: `tests/promo-tiles-section.test.mjs` (repositorio importado como TS,
  como `tests/hero-grid-explicit-rows.test.mjs`; componente/CSS por lectura de
  texto, como `tests/mxvi-logos-banner.test.mjs`).

## Enlaces verificados en el repo

- `/about` (src/pages/about.astro). No existe índice `/posts`, por eso no se usa.
- YouTube `https://www.youtube.com/@moibaldenegro`, LinkedIn
  `https://www.linkedin.com/in/moibaldenegro/`, GitHub
  `https://github.com/MoiBaldenegro` y `.../mfinance` (src/data/about.json,
  hero-cards.json).
- Tomatesoft: sin URL pública en el repo; no se inventa (primario a `/about`).

## Riesgos y trabas

- `tokens.css` está en 98 líneas: 8 tokens nuevos exigen 2 por línea y
  compactar un comentario para quedar en <=100.
- `scripts/audit-design-tokens.mjs` rechaza hex/rgb fuera de tokens.css:
  la máscara de la imagen debe usar la palabra clave `black`.
- Peso: 4 webp de 1920x1920; mitigado con `loading="lazy"` y
  `decoding="async"` (están bajo el pliegue). Redimensionar queda fuera de
  alcance.
- Textos propuestos por el spec_author (no dictados por el humano): el humano
  puede ajustarlos editando solo el JSON.
- Las imágenes `public/assets/pic0*.webp` están sin trackear en git: el
  implementer debe incluirlas en el commit de la feature.
