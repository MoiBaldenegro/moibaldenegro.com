# Requisitos — Siguiente post en los datos (feature 18)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-18-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-18-01 El esquema architecture de content.config.ts SHALL declarar el campo opcional next como texto.
REQ-18-02 La entidad Post SHALL exponer el campo readonly next con texto o nulo.
REQ-18-03 WHEN un artículo declara next en su frontmatter, el repositorio PostsRepository SHALL entregar su valor en la entidad.
REQ-18-04 WHEN un artículo omite next en su frontmatter, el repositorio PostsRepository SHALL entregar nulo en la entidad.
REQ-18-05 IF un artículo declara un next que no es texto con formato de ruta interna /posts/<id>, THEN el repositorio SHALL lanzar PostsDataError.
REQ-18-06 La colección architecture SHALL declarar la cadena de recomendación 00-agilismo a 03-principios-solid en orden cronológico con el último artículo sin next.
REQ-18-07 La entidad Post y el repositorio PostsRepository SHALL respetar el límite de 100 líneas cada uno.
