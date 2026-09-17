# Requisitos — Corrección de hrefs next/related a entry.id reales (feature 22)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-22-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-22-01 El campo next del artículo 00-agilismo SHALL declarar la ruta /posts/01-diseño_detallado.
REQ-22-02 El campo next del artículo 01-diseño_detallado SHALL declarar la ruta /posts/02-principios.
REQ-22-03 El campo next del artículo 02-principios SHALL declarar la ruta /posts/03-principios_solid.
REQ-22-04 El campo related del artículo 03-principios_solid SHALL declarar las rutas /posts/00-agilismo y /posts/01-diseño_detallado.
REQ-22-05 Todo artículo de la cadena con siguiente SHALL declarar related con al menos una ruta interna /posts/<id>.
REQ-22-06 Cada ruta declarada en next o related SHALL corresponder a un entry.id existente de la colección architecture.
REQ-22-07 Ningún valor de next o related SHALL contener espacios.
