# Requisitos — hero-row-new-tools

## Requisitos

REQ-02-01 La fuente hero-cards.json SHALL declarar las tarjetas "bash" "webassembly" "astro" "opencode" y "tauri" con el icono del sprite y el colorToken de su marca.

REQ-02-02 Las cinco tarjetas de la fila nueva SHALL declarar el valor "row" 2.

REQ-02-03 La tarjeta "astro" SHALL declarar "featured".

REQ-02-04 Las cinco tarjetas de la fila nueva SHALL declarar "showOnMobile" en false.

REQ-02-05 La tarjeta "astro" SHALL ocupar el hueco grande de la fila 2.

REQ-02-06 Las tarjetas "bash" "webassembly" "opencode" y "tauri" SHALL ocupar los huecos pequeños de la fila 2 en ese orden de izquierda a derecha.

REQ-02-07 La fila nueva SHALL ocupar una franja horizontal completa del mosaico de doce columnas.

REQ-02-08 La hoja de tokens SHALL definir los tokens --color-marca-bash --color-marca-webassembly --color-marca-astro --color-marca-opencode y --color-marca-tauri.

REQ-02-09 La hoja de estilos del mosaico SHALL asignar a cada tarjeta nueva el color de fondo de su token de marca mediante el atributo data-color-token.

REQ-02-10 La tarjeta grande "astro" SHALL definir un ancho de icono y una escala mayores que los de las tarjetas pequeñas de su fila.

REQ-02-11 IF el viewport mide 1200 px o menos THEN la hoja de estilos del mosaico SHALL reducir la escala del icono de las cinco tarjetas nuevas.

REQ-02-12 El sprite public/assets/svg/sprite.svg SHALL permanecer sin cambios.

REQ-02-13 La regresión visual del hero SHALL mostrar la fila nueva completa sin huecos ni solapamientos a 375 px 768 px y 1280 px.
