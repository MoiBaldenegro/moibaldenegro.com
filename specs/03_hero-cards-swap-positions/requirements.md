# Requisitos — hero-cards-swap-positions

## Requisitos

REQ-03-01 La fuente hero-cards.json SHALL colocar la tarjeta "css" en la posición del array y con el "row" que tenía la tarjeta "tauri" (fila 2 tras "html").

REQ-03-02 La fuente hero-cards.json SHALL colocar la tarjeta "tauri" en la posición del array y con el "row" que tenía la tarjeta "css" (fila 1 tras "node").

REQ-03-03 La fuente hero-cards.json SHALL colocar la tarjeta "html" en la posición del array y con el "row" que tenía la tarjeta "opencode" (fila 2 tras "astro").

REQ-03-04 La fuente hero-cards.json SHALL colocar la tarjeta "opencode" en la posición del array y con el "row" que tenía la tarjeta "html" (fila 1 tras "react").

REQ-03-05 La fuente hero-cards.json SHALL colocar la tarjeta "nestjs" en la posición del array de la zona superior sin el campo "row".

REQ-03-06 La fuente hero-cards.json SHALL colocar la tarjeta "node" en la posición del array de la fila 1 con el valor "row" 1.

REQ-03-07 Las seis tarjetas intercambiadas SHALL conservar sus propiedades propias distintas de la posición (title colorToken icon category featured rotate scale iconWidth showOnMobile y href).

REQ-03-08 Las tarjetas no intercambiadas SHALL conservar su posición en el array y su valor "row".

REQ-03-09 La tarjeta "nestjs" SHALL ocupar el hueco grande de la zona superior del mosaico.

REQ-03-10 La tarjeta "node" SHALL ocupar el hueco grande de la fila 1 del mosaico.

REQ-03-11 La fila 1 del mosaico SHALL mostrar "node" "tauri" "react" "opencode" y "claude-code" en ese orden de izquierda a derecha.

REQ-03-12 La fila 2 del mosaico SHALL mostrar "bash" "webassembly" "astro" "html" y "css" en ese orden de izquierda a derecha.

REQ-03-13 La regresión visual del hero SHALL mostrar el mosaico completo sin huecos ni solapamientos a 375 px 768 px y 1280 px.
