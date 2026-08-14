# Requisitos — Header de post como tarjeta horizontal (feature 42)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-42-<xx>.
# Keywords en mayúsculas. Sin verbos vagos. Sin comas en el sujeto.

## Requisitos

REQ-42-01 El header del post SHALL mostrar la tarjeta horizontal con la imagen destacada y la copia en dos columnas dentro del panel.
REQ-42-02 La tarjeta horizontal SHALL dividir el panel en dos columnas con la imagen en la primera y la copia en la segunda, WHERE el ancho de pantalla supera los 768px.
REQ-42-03 El header SHALL mostrar la primera etiqueta del artículo como píldora de apertura con el token de acento.
REQ-42-04 El título del header SHALL escalar con clamp entre 2.2rem y 3.6rem.
REQ-42-05 La imagen destacada del header SHALL mostrar la proporción 4:3 con resplandor del token de glow.
REQ-42-06 El panel del header SHALL mostrar un acento inferior con degradado del token de acento.
REQ-42-07 WHILE el ancho de pantalla es de 768px o menos, la tarjeta del header SHALL apilar la imagen sobre la copia en una sola columna.
REQ-42-08 El header SHALL conservar los pares de transición title-${entry.id} e img-${entry.id} en el primer h1 y el primer img de la página.
REQ-42-09 Los estilos de la tarjeta SHALL residir en la hoja post-header.css, WHERE la hoja no supera las 100 líneas y tokens.css permanece en 87 líneas.