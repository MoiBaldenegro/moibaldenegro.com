# Requisitos — square-corners-sitewide (feature 9)

## Requisitos

REQ-09-01 El archivo src/styles/tokens.css SHALL definir un único token de radio --radius-square con valor 0.
REQ-09-02 El archivo src/styles/tokens.css SHALL omitir las definiciones de --radius-card y --radius-pill y --radius-thumb.
REQ-09-03 El directorio src/ SHALL omitir cualquier referencia a --radius-card y --radius-pill y --radius-thumb incluidos los comentarios.
REQ-09-04 Cada declaración de una propiedad terminada en -radius en las hojas .css de src/styles SHALL tener como valor exactamente var(--radius-square).
REQ-09-05 Las hojas .css de src/styles SHALL omitir valores de radio literales como porcentajes o px o rem o em o un 0 suelto en propiedades de radio.
REQ-09-06 La regla .hero-card::after de src/styles/hero-card.css SHALL dibujar el glow con esquinas rectas mediante var(--radius-square) y conservar su radial-gradient.
REQ-09-07 La regla .verified de src/styles/profile-card.css SHALL dibujar el badge verificado como un cuadrado mediante var(--radius-square).
REQ-09-08 La regla ::-webkit-scrollbar-thumb de src/styles/layout.css SHALL dibujar el pulgar de la barra de desplazamiento con esquinas rectas mediante var(--radius-square).
REQ-09-09 La regla .promo-tile de src/styles/promo-tiles.css SHALL sustituir su border-radius 0 literal por var(--radius-square).
REQ-09-10 Las reglas .about-philosophy__quote y .about-timeline__result SHALL usar un único valor var(--radius-square) para sus cuatro esquinas en lugar del radio asimétrico.
REQ-09-11 Cada hoja .css de src/styles SHALL conservar al menos el mismo número de declaraciones de radio que tenía antes de la feature para neutralizar el redondeo por defecto del navegador.
REQ-09-12 Los componentes .astro de src/ SHALL omitir atributos style y etiquetas style que declaren un radio.
REQ-09-13 El icono SVG de src/components/code-copy/code-copy.ts SHALL conservar su atributo rx sin cambios porque forma parte del dibujo del glifo y no de una esquina de caja.
REQ-09-14 Los tests tests/article-images.test.mjs y tests/promo-tiles-section-ui.test.mjs SHALL comprobar var(--radius-square) en lugar de --radius-card y --radius-pill y del 0 literal.
REQ-09-15 IF la revisión visual detecta un control nativo con redondeo por defecto del navegador, THEN la hoja de ese componente SHALL declarar border-radius var(--radius-square) en el selector del control.
REQ-09-16 WHEN se revisan la home y /about y /search y un post y /404 a 375 px y 768 px y 1280 px, el sitio SHALL mostrar todas las tarjetas y pills y botones e inputs y miniaturas y badges y la scrollbar con esquinas rectas sin errores en la consola del navegador.
REQ-09-17 Cada archivo nuevo o modificado por la feature SHALL tener como máximo 100 líneas.
