# Requisitos — Arreglo de la navegación a los detalles de los artículos (feature 36)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-36-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-36-01 La entidad Post SHALL exponer los campos readonly id y slug, WHERE id identifica la entrada de la colección y slug proviene del frontmatter.
REQ-36-02 El repositorio PostsRepository SHALL entregar id desde el id de la entrada y slug desde el campo slug de sus datos.
REQ-36-03 IF una entrada no declara un slug de texto, THEN el repositorio SHALL lanzar PostsDataError.
REQ-36-04 Las cards de latest-articles SHALL enlazar cada artículo a /posts/{id} con el id real de la entidad Post.
REQ-36-05 La página posts/[id] SHALL emparejar cada entrada con su post por id, WHERE ambos provienen de la colección architecture.
REQ-36-06 IF un post de la colección no tiene su entrada correspondiente, THEN la página SHALL fallar con un error nombrado.
REQ-36-07 Los pares transition:name de las cards SHALL coincidir con los de la página de detalle para cada artículo.
REQ-36-08 El enlace de la card SHALL estilarse con tokens del diseño, incluidos los estados hover y focus.
