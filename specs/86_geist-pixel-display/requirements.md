# Requisitos — Geist Pixel como fuente de títulos h1 y h2 (feature 86 geist-pixel-display)
# Origen: decisión humana 2026-10-12: Geist Pixel «específicamente» en títulos/display (referencia https://vercel.com/font?type=pixel). Análisis: progress/research/geist-font.md §5.
# Toca UI: ver design.md en esta carpeta. depends_on [85]: el paquete geist, typography.css y los tokens --font-sans/--font-mono ya existen.
# Variante elegida por el humano (2026-10-12): GeistPixel-Circle.woff2 (28 044 bytes, cara única, OS/2 peso 400, 420 caracteres, cubre á é í ó ú ñ ¿ ¡ Á É Í Ó Ú Ñ). Riesgo de legibilidad en h2 pequeños: ver design.md Decisión 1.
# Trazabilidad REQ → acceptance (índice en feature_list.json): REQ-86-01/02/03→1, REQ-86-04/05/06/07→2, REQ-86-08/09→3, REQ-86-10/11→4, REQ-86-12/13/14→5, REQ-86-15/16/17/18→6.

## Requisitos

REQ-86-01 El archivo astro.config.mjs SHALL registrar con fontProviders.local() la familia Geist Pixel con cssVariable --font-geist-pixel desde dist/fonts/geist-pixel/GeistPixel-Circle.woff2 del paquete geist con weight 400 y style normal.
REQ-86-02 La familia Geist Pixel SHALL declarar display swap y una lista fallbacks cuyo último elemento es monospace.
REQ-86-03 El layout src/layouts/Layout.astro SHALL renderizar en el head el componente Font de astro:assets para --font-geist-pixel con preload.
REQ-86-04 El archivo src/styles/tokens.css SHALL definir el token --font-display con el valor var(--font-geist-pixel, ui-monospace, monospace) y medir 100 líneas o menos.
REQ-86-05 La hoja src/styles/typography.css SHALL aplicar font-family: var(--font-display) a los selectores de elemento h1 y h2.
REQ-86-06 La hoja src/styles/typography.css SHALL aplicar font-synthesis: none a h1 y h2 para impedir negrita y cursiva sintéticas sobre la cara única de Geist Pixel.
REQ-86-07 Las hojas de src/styles SHALL estar libres de declaraciones font-family en reglas cuyo selector termina en h1, h2 o en una clase aplicada a un h1 o h2, WHERE la hoja es distinta de typography.css.
REQ-86-08 WHEN se ejecuta astro build, el HTML construido de / SHALL contener un link rel="preload" as="font" type="font/woff2" con crossorigin para Geist Pixel cuyo href empieza por /_astro/fonts/.
REQ-86-09 WHEN se ejecuta astro build, el directorio dist/client/_astro/fonts SHALL contener el woff2 de Geist Pixel y ningún otro archivo de las variantes Square, Grid, Triangle o Line.
REQ-86-10 WHEN se carga una página en Chrome headless, el font-family computado de cada h1 y h2 visible SHALL empezar por "Geist Pixel" en /, /about, /search, un artículo y la página 404.
REQ-86-11 WHEN se carga una página en Chrome headless, el font-family computado de body y de los elementos p y h3 SHALL empezar por "Geist" sin ser "Geist Pixel" ni "Geist Mono".
REQ-86-12 WHEN se carga una página en Chrome headless a 375×812 y a 1280×800, el documento SHALL cumplir scrollWidth === clientWidth en /, /about, /search, un artículo y la página 404.
REQ-86-13 WHEN se carga / en Chrome headless a 1280×800 con la caché vacía, el CLS acumulado medido con PerformanceObserver de layout-shift SHALL ser 0,1 o menos.
REQ-86-14 IF el h1 del hero desborda a 375 px, THEN el implementer SHALL ajustar su font-size o letter-spacing en src/styles/profile-card.css sin valores de color sueltos.
REQ-86-15 El implementer SHALL anotar el rojo en progress/impl_86.md antes de modificar astro.config.mjs, Layout.astro, tokens.css y typography.css y guardar capturas a 1280 y 375 de / y de un artículo en progress/research/geist86/.
REQ-86-16 Cada archivo creado o modificado por esta feature SHALL medir 100 líneas o menos, WHERE el archivo pertenece a src/, tests/ o es astro.config.mjs.
REQ-86-17 WHEN termina la feature, ./init.sh SHALL terminar en verde con tests/single-h1-headings.test.mjs y las listas cerradas de tokens de las hojas existentes sin cambios.
REQ-86-18 El implementer SHALL guardar en progress/research/geist86/ una captura a 1280×800 y a 375×812 del h2 más pequeño del sitio (1,35rem, .post__content h2 en móvil) para la revisión humana de la legibilidad de Circle.
