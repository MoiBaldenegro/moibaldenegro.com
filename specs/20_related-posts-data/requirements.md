# Requisitos — Array related en los datos (feature 20)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-20-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-20-01 El esquema architecture de content.config.ts SHALL declarar el campo opcional related como arreglo de texto.
REQ-20-02 La entidad Post SHALL exponer el campo readonly related con arreglo de texto o nulo.
REQ-20-03 WHEN un artículo declara related en su frontmatter, el repositorio PostsRepository SHALL entregar sus valores en la entidad.
REQ-20-04 WHEN un artículo omite related en su frontmatter, el repositorio PostsRepository SHALL entregar nulo en la entidad.
REQ-20-05 IF un artículo declara un related que no es un arreglo de rutas internas /posts/<id>, THEN el repositorio SHALL lanzar PostsDataError.
REQ-20-06 El último artículo de la colección architecture SHALL declarar related con al menos dos rutas internas /posts/<id>.
REQ-20-07 La entidad Post y el repositorio PostsRepository SHALL respetar el límite de 100 líneas cada uno.
