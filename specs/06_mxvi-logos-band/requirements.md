# Requisitos — mxvi-logos-band (feature 6)

## Requisitos

REQ-06-01 El componente src/components/mxvi-logos-banner.astro SHALL obtener los logos de MxviLogosRepository sin leer JSON directamente.
REQ-06-02 El componente SHALL renderizar un enlace a por cada logo con el href del logo.
REQ-06-03 Cada enlace de logo SHALL llevar target="_blank" y rel="noopener noreferrer".
REQ-06-04 Cada enlace de logo SHALL llevar aria-label con el label del logo.
REQ-06-05 El svg de cada logo SHALL llevar aria-hidden="true" y focusable="false" dentro de su enlace.
REQ-06-06 La sección de logos SHALL omitir el atributo aria-hidden.
REQ-06-07 La sección de logos SHALL omitir títulos, párrafos, botones y cualquier texto visible.
REQ-06-08 La sección de logos SHALL ocupar el ancho completo de la ventana de borde a borde sin provocar desplazamiento horizontal.
REQ-06-09 La sección de logos SHALL pintar su fondo con un degradado lineal azul y un resplandor radial centrado tomados de los tokens --color-mxvi-band-edge, --color-mxvi-band-center y --color-mxvi-band-glow.
REQ-06-10 WHEN el puntero pasa sobre un enlace de logo, el logo SHALL subir su opacidad a var(--opacity-logo-band-hover) y elevarse con translateY negativo y scale mayor que 1.
REQ-06-11 WHEN un enlace de logo recibe foco de teclado, el enlace SHALL mostrar la opacidad y la elevación del hover más un contorno visible de :focus-visible.
REQ-06-12 El cambio de opacidad y transformación del logo SHALL animarse con var(--transition-default).
REQ-06-13 WHILE el usuario prefiere movimiento reducido, el logo SHALL omitir transición y transformación y conservar el cambio de opacidad.
REQ-06-14 La rejilla de logos SHALL mostrar 4 columnas, WHERE el ancho de la ventana es mayor que 768 px.
REQ-06-15 La rejilla de logos SHALL mostrar 2 columnas, WHERE el ancho de la ventana es 768 px o menor.
REQ-06-16 El archivo src/styles/tokens.css SHALL definir --color-mxvi-band-edge, --color-mxvi-band-center, --color-mxvi-band-glow, --opacity-logo-band, --opacity-logo-band-hover y --space-mxvi-band.
REQ-06-17 La hoja src/styles/mxvi-logos-banner.css SHALL tomar colores, opacidades y el padding vertical de la cinta solo de custom properties de tokens.css.
REQ-06-18 El componente SHALL importar ../styles/mxvi-logos-banner.css y omitir etiquetas script y style.
REQ-06-19 Cada archivo nuevo o modificado por la feature SHALL tener como máximo 100 líneas incluido src/styles/tokens.css.
REQ-06-20 WHEN se revisa la home a 375 px o 768 px o 1280 px de ancho, la cinta SHALL verse de borde a borde con los 4 logos completos sin desbordamiento horizontal ni errores en la consola del navegador.
