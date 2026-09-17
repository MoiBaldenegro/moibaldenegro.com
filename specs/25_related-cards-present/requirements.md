# Requisitos — Cards pequeñas de recomendados acordes al diseño (feature 25)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-25-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-25-01 WHEN el post declara related, la página de detalle SHALL mostrar una card por cada recomendado con su miniatura, su título enlazado y su meta de autor y tiempo de lectura.
REQ-25-02 La hoja post-next.css SHALL presentar las cards en rejilla de dos columnas con miniatura, hairline y resaltado al pasar el puntero, siguiendo el modo lista de search-results.css.
REQ-25-03 La hoja post-next.css SHALL estilar las cards solo con tokens de tokens.css.
REQ-25-04 La hoja post-next.css SHALL presentar las cards en una columna a ancho completo y ocultar la miniatura en 768 píxeles o menos.
REQ-25-05 La página de detalle SHALL resolver las cards en build sin JavaScript de runtime.
REQ-25-06 Cada archivo tocado por la feature SHALL respetar el límite de 100 líneas.
