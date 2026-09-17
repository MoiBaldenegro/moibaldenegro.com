# Requisitos — Títulos en recomendados y alineación al design system (feature 23)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-23-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-23-01 WHEN el post declara related, la página de detalle SHALL mostrar el título de cada artículo recomendado como texto de su enlace.
REQ-23-02 La resolución del título de cada recomendado SHALL vivir en un módulo .ts nuevo que la vista importa, WHERE el frontmatter solo hace imports y paso de datos.
REQ-23-03 El botón Siguiente artículo SHALL presentar superficie con borde y texto claro del sistema en lugar de fondo de acento con texto oscuro.
REQ-23-04 La lista de recomendados SHALL presentar filas separadas por hairline con resaltado al pasar el puntero, siguiendo el modo lista de search-results.css.
REQ-23-05 La hoja post-next.css SHALL estilar el botón y la lista solo con tokens de tokens.css.
REQ-23-06 La hoja post-next.css SHALL presentar el botón y la lista a ancho completo en 768 píxeles o menos.
REQ-23-07 Cada archivo tocado por la feature SHALL respetar el límite de 100 líneas.
