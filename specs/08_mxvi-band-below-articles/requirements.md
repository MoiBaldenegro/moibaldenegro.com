# Requisitos — mxvi-band-below-articles (feature 8)

## Requisitos

REQ-08-01 La página src/pages/home.astro SHALL renderizar dentro de .home__landing exactamente los componentes NewHero, LatestArticles, LatestHorizontal, MxviLogosBanner y PromoTiles en ese orden.
REQ-08-02 La página src/pages/home.astro SHALL renderizar MxviLogosBanner inmediatamente después de LatestHorizontal.
REQ-08-03 La página src/pages/home.astro SHALL renderizar PromoTiles inmediatamente después de MxviLogosBanner.
REQ-08-04 La página src/pages/home.astro SHALL renderizar LatestArticles inmediatamente después de NewHero.
REQ-08-05 La página src/pages/home.astro SHALL renderizar MxviLogosBanner una sola vez.
REQ-08-06 La página src/pages/home.astro SHALL conservar sus imports, su frontmatter y el componente SearchLive fuera de .home__landing sin otros cambios que la reubicación de MxviLogosBanner.
REQ-08-07 El componente src/components/mxvi-logos-banner.astro SHALL permanecer sin cambios respecto al estado de la feature 7.
REQ-08-08 IF el espaciado o los bordes de la cinta se ven mal en su nueva posición, THEN la hoja src/styles/mxvi-logos-banner.css SHALL corregirlos solo con custom properties de src/styles/tokens.css.
REQ-08-09 El test REQ-04-08 de tests/promo-tiles-section-ui.test.mjs SHALL comprobar que PromoTiles sigue a MxviLogosBanner dentro de .home__landing, WHERE el orden de REQ-08-01 sustituye la adyacencia LatestHorizontal-PromoTiles de REQ-04-08.
REQ-08-10 WHEN la home se visualiza a 375 px o 768 px o 1280 px, la cinta MXVI SHALL aparecer debajo del bloque horizontal de artículos y encima de PromoTiles de borde a borde sin scroll horizontal.
REQ-08-11 Los archivos tocados por la feature SHALL tener como máximo 100 líneas.
