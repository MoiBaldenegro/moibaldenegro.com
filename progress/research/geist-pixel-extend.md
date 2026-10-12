# Análisis — Geist Pixel en header, títulos de cards y tags (feature 87 geist-pixel-extend)

Fecha: 2026-10-12. Autor: spec_author. Spec: `specs/87_geist-pixel-extend/` (requirements.md + design.md).

## Petición

- «en el header y en los pequeños títulos dentro de las cards también métele pixels, cards de los
  artículos y de las bento columns, ambas».
- Ampliación (misma feature): «los tags de los artículos también se van a ver bien bonitos con ese pixel».

Reafirmación: extender el token `--font-display` (Geist Pixel Circle, feature 86) del par h1/h2 a
(a) el texto del header, (b) los títulos de las cards de artículos y de las cards bento del hero,
(c) los tags de los artículos en todas sus apariciones. Sin cambiar tamaños, colores ni marcado.

## Inventario (qué toca)

| Zona | Dónde | Selector / marcado | Hoja actual | font-family hoy |
|------|-------|--------------------|-------------|-----------------|
| Header: enlaces | `src/layouts/Layout.astro` | `.site-navbar nav a` (About, Arquitectura, @moibaldenegro; el de inicio es el logo img) | layout.css (0.95rem, móvil 0.85rem), site-menu.css (menú abierto 1rem) | heredada de body |
| Header: buscador | `search-bar/search-bar.astro` | `.search-bar__input` (+ placeholder «Buscar artículos…») | search-bar.css | `var(--font-sans)` (0,1,0) |
| Header: iconos | Layout.astro / search-bar | `.site-menu__toggle` (☰/✕ en ::before), `.search-bar__clear` (×) | site-menu.css, search-bar.css | fuera de alcance |
| Bento | `hero-card.astro` (datos `src/data/hero-cards.json`, 12 tarjetas, títulos REACT…GITHUB ACTIONS) | `p.card-title` | hero-card.css (0.95rem/700/uppercase/+0.08em; móvil 0.82rem) | heredada |
| Card portada | `latest-articles.astro` | `h3.latest-articles__title` (dentro del enlace) | latest-articles.css (1.35rem, móvil 1.15rem) | heredada |
| Card Recomendados | `src/pages/posts/[id].astro` | `a.post__related-link` | post-next.css (1.05rem) | `var(--font-sans)` (0,1,0) |
| Resultados búsqueda | `search-results/item-html.ts` (/search, /<término>, panel en vivo) | `h2.search-results__title` | search-results.css | ya Pixel por la 86 (h2) |
| Tag portada | latest-articles.astro | `span.latest-articles__tag` | latest-articles.css (0.85rem) | heredada |
| Tag búsqueda/término | item-html.ts | `span.search-results__tag` | search-results.css (0.78rem) | heredada |
| Tag del post | `[id].astro` | `p.post__kicker` (`#{post.tags[0]}`) | post-header.css (0.8rem, móvil 0.75rem, 700, uppercase) | heredada de `.post` (Sans) |

Los tags NO son enlaces (span/p): no hay nombre accesible que preservar más allá del texto; la spec
exige que el marcado no cambie (REQ-87-07). Los títulos de card sí van en enlaces y no se tocan.

Cobertura de glifos de GeistPixel-Circle (cmap leído del woff2 con node:zlib brotli): `#`, `@`, `…`,
`×`, `•`, á é í ó ú ñ Á presentes; ☰ (U+2630) y ✕ (U+2715) ausentes → el botón hamburguesa queda fuera.

## Plan técnico

Todas las reglas nuevas en `src/styles/typography.css` (15 líneas hoy, importada por el único
layout después de layout.css, exenta del guard REQ-86-07), con selector con ancestro (0,2,0) para
ganar a `var(--font-sans)` de search-bar.css y post-next.css sin depender del orden del bundle, y
`font-synthesis: none` (cara única 400; card-title, kicker y h3 van a 700).

Por qué no en las hojas de componente (tests revisados):
- tests/search-bar-header.test.mjs: lista cerrada de tokens de search-bar.css (solo `--font-sans`).
- tests/related-*.test.mjs, post-page-styles, search-results-list-mode, articles-ui-refactor,
  hero-cards-styles: tokens/estructura de post-next.css, post.css, search-results.css,
  latest-articles.css, hero-card.css. Se dejan byte a byte (REQ-87-06).
- tests/geist-pixel-display.test.mjs REQ-86-05/06: exige una regla exacta `h1, h2` en
  typography.css (no fusionar) y prohíbe `/#[0-9a-f]{3,8}\b/i` en todo el archivo → no escribir
  `#` ni en comentarios.

## Riesgos y trabas

1. Legibilidad (el principal). Punto de Circle = 0,038 em. En los textos de esta feature el punto
   mide 0,46-0,82 px: en pantallas 1x la textura de puntos desaparece y se ve un trazo gris fino
   y más claro (menor contraste percibido). Peores casos: kicker del post a 12 px (0,46 px),
   tags de búsqueda a 12,5 px, tags de portada a 13,6 px y los enlaces de navegación a 13,6-15,2
   px, que son texto de navegación de uso constante. La 86 midió ya que a 22-28 px el efecto se
   pierde; aquí todo es igual o menor. Se aplica igualmente porque el humano lo pidió para todo
   el header y los tags; REQ-87-17/18 obligan a capturas DPR 1 y 2 para su juicio. Reversión
   barata: una regla en typography.css.
2. Desborde del header de escritorio: con Sans el nav ya va justo entre 769 y ~900 px (≈730 px
   de contenido en un contenedor del 95 %); Pixel tiene avances más anchos y puede envolver a
   dos líneas y romper `--header-height` (64 px) y el scroll-padding. REQ-87-13 compara la altura
   con la base medida antes del cambio. Si cambia, el implementer debe parar y reportarlo: el
   arreglo tocaría layout.css/search-bar.css (listas cerradas) y requiere decisión.
3. Menú móvil abierto (feature 79): enlaces a 1rem e input a ancho completo; riesgo bajo, cubierto
   por REQ-87-14. El header móvil sin JS (envuelto, 170 px) no se mide: queda como riesgo menor.
4. Títulos bento en tarjetas de 2 columnas («TYPESCRIPT» con +0.08em) y títulos de artículo de
   hasta 66 caracteres: REQ-87-12 comprueba que no salen de su card a 375/1000/1280.
5. Negrita perdida: con `font-synthesis: none` card-title, kicker y h3 dejan de verse en 700.
   Cambio visual aceptado (misma decisión que la 86).
6. Concurrencia: la 86 está in_progress y edita typography.css; la 87 depende de ella
   (`depends_on [86]`) y no puede empezar hasta que la 86 esté done.

## Descomposición

Complejidad media pero un solo archivo de código (typography.css) + un test nuevo: 1 feature (87),
`pending`, depends_on [86].
