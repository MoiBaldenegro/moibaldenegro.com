# Requisitos — feature 10 `mxvi-foundation`

## Requisitos

REQ-10-01 El repositorio SHALL contener en src/styles/mxvi/ una copia de components.css y de la carpeta components/ del design system MXVI.
REQ-10-02 El script scripts/sync-mxvi.mjs SHALL copiar esos archivos desde la rama main del repositorio mxvi-design-system o desde la carpeta mxvi local que reciba como argumento.
REQ-10-03 WHEN el script termina la copia, el script SHALL escribir src/styles/mxvi/manifest.json con el origen y el sha256 de cada archivo copiado.
REQ-10-04 IF un archivo de src/styles/mxvi/ no coincide con el sha256 que declara el manifiesto, THEN la suite de tests SHALL fallar nombrando ese archivo.
REQ-10-05 IF el manifiesto declara un archivo ausente o la carpeta contiene una hoja no declarada, THEN la suite de tests SHALL fallar nombrando ese archivo.
REQ-10-06 Cada hoja de src/styles/mxvi/ SHALL tener como máximo 100 líneas.
REQ-10-07 Las hojas de src/styles/mxvi/ SHALL tomar los colores de custom properties sin hexadecimales, rgb( ni rgba( literales.
REQ-10-08 Cada custom property que lean las hojas de src/styles/mxvi/ SHALL estar definida en src/styles/tokens.css o en las propias hojas de src/styles/mxvi/.
REQ-10-09 src/layouts/Layout.astro SHALL importar ../styles/mxvi/components.css después de tokens.css, layout.css y typography.css.
REQ-10-10 El script scripts/sync-mxvi.mjs SHALL importar solo módulos de la biblioteca estándar de Node.
REQ-10-11 Cada página del sitio SHALL mostrar el mismo resultado visual que antes del cambio, WHERE la página es home, about, detalle de artículo, búsqueda o 404 a 390, 768 y 1440 px de ancho.
