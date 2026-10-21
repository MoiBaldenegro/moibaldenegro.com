# Requisitos — hero-grid-explicit-rows

## Requisitos

REQ-01-01 La entidad de tarjeta de icono SHALL declarar un campo opcional "row" (número entero mayor o igual que 1) que identifica la fila del mosaico a la que pertenece la tarjeta.

REQ-01-02 IF una tarjeta declara un "row" que no es un número entero mayor o igual que 1 THEN el parseo de hero-cards.json SHALL lanzar HeroCardsDataError nombrando el archivo y el índice de la tarjeta.

REQ-01-03 Las tarjetas de icono que no declaran "row" SHALL ocupar los huecos de la zona superior del mosaico.

REQ-01-04 La única tarjeta de icono con "featured" de la zona superior SHALL ocupar el hueco grande de esa zona.

REQ-01-05 IF las tarjetas que no declaran "row" no completan la zona superior del mosaico THEN el motor del mosaico SHALL lanzar HeroGridLayoutError.

REQ-01-06 IF la zona superior del mosaico contiene más de una tarjeta de icono con "featured" THEN el motor del mosaico SHALL lanzar HeroGridLayoutError.

REQ-01-07 El motor del mosaico SHALL agrupar en una misma fila visual las tarjetas de icono que declaran el mismo valor de "row".

REQ-01-08 La tarjeta de icono con "featured" de cada fila SHALL ocupar el hueco grande de esa fila.

REQ-01-09 Las demás tarjetas de la fila SHALL ocupar los huecos pequeños de esa fila en el orden de hero-cards.json.

REQ-01-10 IF una fila declarada no contiene exactamente cinco tarjetas THEN el motor del mosaico SHALL lanzar HeroGridLayoutError.

REQ-01-11 IF una fila declarada no contiene exactamente una tarjeta de icono con "featured" THEN el motor del mosaico SHALL lanzar HeroGridLayoutError.

REQ-01-12 IF una tarjeta de categoría "social" queda en una fila que no es la última THEN el motor del mosaico SHALL lanzar HeroGridLayoutError.

REQ-01-13 IF una tarjeta de categoría "social" declara "featured" THEN el motor del mosaico SHALL lanzar HeroGridLayoutError.

REQ-01-14 La declaración de filas en hero-cards.json SHALL conservar la posición de cada tarjeta del mosaico.
