# Requisitos — Objeto de recomendados con propiedades en build (feature 24)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-24-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-24-01 El tipo RelatedLink de related-titles.ts SHALL exponer las propiedades readonly img, author y readtime junto a href y title.
REQ-24-02 WHEN el post declara related, la función resolveRelatedTitles SHALL resolver img, author y readtime de cada href desde los Posts recibidos.
REQ-24-03 IF un href no corresponde a ningún Post conocido, THEN la función SHALL degradar el item a su href y título actuales sin lanzar error.
REQ-24-04 El frontmatter related de la colección y el esquema de content.config.ts SHALL conservar el arreglo de texto de rutas internas /posts/<id>, WHERE la integridad REQ-22-06 queda intacta.
REQ-24-05 IF algún test REQ-23-01/02 aserciona la forma exacta de RelatedLink, THEN la feature SHALL ajustar la aserción a las propiedades nuevas con la justificación documentada en el encabezado.
REQ-24-06 El módulo related-titles.ts SHALL respetar el límite de 100 líneas tras el cambio.
