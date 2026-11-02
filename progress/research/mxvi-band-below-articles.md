# Análisis — la cinta MXVI debajo de los artículos (feature 8)

## Petición humana (vía líder, 2026-11-02)

"Pasa la cinta mejor abajo de los artículos." Reubicar `<MxviLogosBanner/>` en
`src/pages/home.astro`: hoy va justo tras `<NewHero/>`; el orden final exacto dentro de
`.home__landing` es NewHero, LatestArticles, LatestHorizontal, MxviLogosBanner, PromoTiles.
Nada más cambia (componente, estilos, datos) salvo que espaciado o bordes se vean mal en la
nueva posición, y entonces solo con tokens. Verificación visual a 375, 768 y 1280 px. TDD:
test de orden en rojo antes del cambio.

## Estado actual (revisado)

- `src/pages/home.astro` (28 líneas): `.home__landing` contiene
  `<NewHero/>`, `<MxviLogosBanner/>`, `<LatestArticles/>`, `<LatestHorizontal />`,
  `<PromoTiles />`; `<SearchLive />` va fuera. Imports ya presentes; no cambian.
- `src/styles/mxvi-logos-banner.css`: cinta full-bleed (`width: 100vw`,
  `margin-inline: calc(50% - 50vw)`), `padding-block: var(--space-mxvi-band)`,
  `border-block: 1px solid var(--color-border)`, degradado morado del hero (feature 7).
- `src/styles/latest-cards-motion.css`: `.home__landing { overflow-x: clip; }` evita scroll
  horizontal por el full-bleed en cualquier posición.
- `src/styles/latest-horizontal*.css`: en >=1201 px sin reduced motion, la sección es sticky
  con reserva `margin-bottom` (latest-horizontal-reserve.css). La cinta quedará tras esa
  reserva: hay que comprobar a 1280 px que no se solapa con las cards fijadas.
- `src/styles/promo-tiles.css`: `.promo-tiles` con `padding-block: var(--gap-promo)`; tras la
  cinta habrá separación propia de PromoTiles.

## Conflicto detectado (importante para el implementador)

- `tests/promo-tiles-section-ui.test.mjs` (87 líneas), test "REQ-04-08", exige
  `<LatestHorizontal\s*/>\s*<PromoTiles\s*/>` (adyacencia). Con el orden nuevo ese test se pone
  rojo. El orden pedido por el humano sustituye esa adyacencia: la feature 8 (REQ-08-09)
  ajusta solo esa aserción para que compruebe `<MxviLogosBanner\s*/>\s*<PromoTiles\s*/>`.
  La spec de la feature 4 (done) no se edita; la sustitución queda trazada en REQ-08-09.
- `tests/mxvi-logos-banner.test.mjs` (99 líneas) no comprueba la posición en home.astro: no
  se toca.

## Qué toca

- `src/pages/home.astro`: mover una línea.
- Test nuevo `tests/mxvi-band-below-articles.test.mjs`: extrae el contenido de
  `.home__landing`, lista las etiquetas de componente (`<Nombre` con mayúscula inicial) y
  compara con el orden exacto; además adyacencias y conteo único de MxviLogosBanner. Rojo hoy.
- `tests/promo-tiles-section-ui.test.mjs`: ajustar la aserción REQ-04-08.
- Opcional, solo si la revisión visual lo exige: `src/styles/mxvi-logos-banner.css` con tokens.

## Riesgos

- Escritorio: interacción con el sticky + reserva de LatestHorizontal (salto o solape).
- Bordes: el `border-block` superior podría quedar pegado al final de la reserva; valorar
  visualmente antes de tocar CSS.
- Búsqueda en vivo oculta `[data-landing-sections]`: la cinta sigue dentro, se oculta igual.

## Descomposición

Simple (una línea + tests): 1 feature, id 8 `mxvi-band-below-articles`, depends_on [7]
(la cinta y su estilo vienen de las features 6 y 7). Spec en
`specs/08_mxvi-band-below-articles/` (requirements.md + design.md, toca layout de la home).
