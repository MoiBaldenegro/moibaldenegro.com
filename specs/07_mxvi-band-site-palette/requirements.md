# Requisitos — mxvi-band-site-palette (feature 7)

## Requisitos

REQ-07-01 La regla .mxvi-logos de src/styles/mxvi-logos-banner.css SHALL pintar su degradado lineal con var(--color-hero-mid) en los extremos y var(--color-hero-top) en el centro.
REQ-07-02 La regla .mxvi-logos SHALL pintar sobre el degradado lineal un resplandor radial centrado con var(--color-glow) que se desvanece a transparent.
REQ-07-03 La hoja src/styles/mxvi-logos-banner.css SHALL omitir cualquier referencia a --color-mxvi-band-edge, --color-mxvi-band-center y --color-mxvi-band-glow.
REQ-07-04 El archivo src/styles/tokens.css SHALL omitir las definiciones de --color-mxvi-band-edge, --color-mxvi-band-center y --color-mxvi-band-glow.
REQ-07-05 El archivo src/styles/tokens.css SHALL conservar las definiciones de --space-mxvi-band, --opacity-logo-band y --opacity-logo-band-hover.
REQ-07-06 La regla .mxvi-logos SHALL dibujar un borde superior e inferior de 1px solid var(--color-border).
REQ-07-07 WHEN el puntero pasa sobre un enlace de logo, el logo SHALL añadir a su filtro blanco un drop-shadow con var(--color-accent) y un radio derivado de var(--gap-card).
REQ-07-08 WHEN un enlace de logo recibe foco de teclado, el logo SHALL mostrar el mismo drop-shadow con var(--color-accent) del hover junto al contorno de :focus-visible.
REQ-07-09 La transición del logo SHALL animar filter además de opacity y transform con var(--transition-default).
REQ-07-10 WHILE el usuario prefiere movimiento reducido, el logo SHALL omitir transición y transformación y conservar el cambio de opacidad y el resplandor.
REQ-07-11 La hoja src/styles/mxvi-logos-banner.css SHALL tomar todos sus colores de custom properties de tokens.css sin valores hexadecimales ni rgb ni rgba.
REQ-07-12 La cinta SHALL conservar el ancho de borde a borde sin desplazamiento horizontal con 4 columnas por encima de 768 px y 2 columnas en 768 px o menos.
REQ-07-13 El componente src/components/mxvi-logos-banner.astro SHALL conservar los 4 enlaces de logo vía MxviLogosRepository sin texto visible ni etiquetas script ni style.
REQ-07-14 Cada archivo nuevo o modificado por la feature SHALL tener como máximo 100 líneas.
REQ-07-15 WHEN se revisa la home a 375 px o 768 px o 1280 px de ancho, la cinta SHALL verse morada oscura de borde a borde con los 4 logos completos sin desbordamiento horizontal ni errores en la consola del navegador.
