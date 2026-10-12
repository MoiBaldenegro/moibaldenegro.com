# Requisitos — Geist Pixel en el header, títulos de cards y tags de artículos (feature 87 geist-pixel-extend)
# Origen: petición humana 2026-10-12: «en el header y en los pequeños títulos dentro de las cards también métele pixels, cards de los artículos y de las bento columns, ambas»; ampliación del mismo día: «los tags de los artículos también se van a ver bien bonitos con ese pixel».
# Análisis: progress/research/geist-pixel-extend.md. Toca UI: ver design.md en esta carpeta. depends_on [86]: el token --font-display y la carga de GeistPixel-Circle.woff2 los crea la feature 86.
# Elementos (inventario del análisis): header = enlaces de .site-navbar (About, Arquitectura, @moibaldenegro) y el input .search-bar__input con su placeholder; bento = .hero-card .card-title (12 tarjetas del hero de la portada); cards de artículos = .latest-articles__title (portada) y .post__related-link (Recomendados del post); tags = .latest-articles__tag (portada), .search-results__tag (/search, /<término> y panel en vivo) y .post__kicker (tag del hero del post). Los títulos de resultados de búsqueda son h2 y ya están en Pixel por la feature 86.
# Fuera de alcance: el logo (imagen), el botón hamburguesa (☰/✕ no existen en GeistPixel-Circle, verificado en su cmap), el botón × de limpiar búsqueda (icono) y el texto de meta/descripción de las cards.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-87-01/02/03/04/05→1, REQ-87-06/07/08→2, REQ-87-09/10→3, REQ-87-11/12/13→4, REQ-87-14/15→5, REQ-87-16/17/18/19→6.

## Requisitos

REQ-87-01 La hoja src/styles/typography.css SHALL aplicar font-family: var(--font-display) a los enlaces de .site-navbar y a .site-navbar .search-bar__input.
REQ-87-02 La hoja src/styles/typography.css SHALL aplicar font-family: var(--font-display) a .hero-card .card-title, .latest-articles__title y .post__related .post__related-link.
REQ-87-03 La hoja src/styles/typography.css SHALL aplicar font-family: var(--font-display) a .latest-articles__tag, .search-results__tag y .post__hero .post__kicker.
REQ-87-04 La hoja src/styles/typography.css SHALL aplicar font-synthesis: none a cada selector de REQ-87-01, REQ-87-02 y REQ-87-03.
REQ-87-05 Las reglas nuevas de src/styles/typography.css SHALL usar solo el token var(--font-display) como valor de font-family sin colores sueltos ni el carácter almohadilla, WHERE la regla h1, h2 de la feature 86 queda intacta.
REQ-87-06 Esta feature SHALL dejar sin cambios byte a byte las hojas layout.css, site-menu.css, search-bar.css, hero-card.css, latest-articles.css, latest-horizontal.css, post-next.css, post-header.css y search-results.css.
REQ-87-07 Esta feature SHALL dejar sin cambios el marcado de Layout.astro, hero-card.astro, latest-articles.astro, src/pages/posts/[id].astro e item-html.ts, WHERE los tags siguen siendo span o p sin enlace y los títulos de card conservan su enlace y su nombre accesible.
REQ-87-08 Los botones .site-menu__toggle y .search-bar__clear SHALL conservar un font-family computado distinto de Geist Pixel.
REQ-87-09 WHEN se carga en Chrome headless la portada o un artículo con related o /search?q= con resultados, el font-family computado de cada elemento presente de REQ-87-01 a REQ-87-03 SHALL empezar por "Geist Pixel".
REQ-87-10 WHEN se carga en Chrome headless la portada o un artículo con related o /search?q= con resultados, el font-family computado de cada meta y descripción de card SHALL empezar por "Geist" sin ser "Geist Pixel", WHERE las clases son .latest-articles__meta, .latest-articles__description, .post__related-meta y .search-results__description.
REQ-87-11 WHEN se carga en Chrome headless la portada o un artículo con related o /search?q= con resultados o /about a 375×812 y 1000×800 y 1280×800, el documento SHALL cumplir scrollWidth === clientWidth.
REQ-87-12 WHEN se carga / en Chrome headless a 375×812 y 1000×800 y 1280×800, el borde derecho de cada .card-title y .latest-articles__title y .latest-articles__tag SHALL quedar dentro del borde derecho de su card con 1 px de tolerancia.
REQ-87-13 WHEN se carga una página en Chrome headless a 800×800 y 1000×800 y 1280×800, la altura de header.site-navbar SHALL igualar la medida anotada antes del cambio en progress/impl_87.md.
REQ-87-14 WHEN se abre el menú hamburguesa en Chrome headless a 375×812, el panel .site-menu SHALL cumplir scrollWidth === clientWidth con cada enlace y el input dentro del ancho del viewport.
REQ-87-15 WHEN se carga / en Chrome headless a 1280×800 con la caché vacía, el CLS acumulado medido con PerformanceObserver de layout-shift SHALL ser 0.1 o menos.
REQ-87-16 El implementer SHALL anotar en progress/impl_87.md el rojo de los tests nuevos y las alturas base de REQ-87-13 antes de modificar src/styles/typography.css.
REQ-87-17 El implementer SHALL guardar en progress/research/geist87/ capturas a 1280×800 y 375×812 (DPR 1 y DPR 2) del header con el menú móvil abierto, de las cards bento, de una card de últimos artículos con sus tags, de los Recomendados y el kicker de un artículo y de una lista de /search con tags.
REQ-87-18 El implementer SHALL anotar en progress/impl_87.md el tamaño en px de .post__kicker a 375 px y de .search-results__tag como los textos Pixel más pequeños para la revisión humana de su legibilidad.
REQ-87-19 WHEN termina la feature, ./init.sh SHALL terminar en verde con src/styles/typography.css de 100 líneas o menos y tests/geist-pixel-display.test.mjs sin cambios.
