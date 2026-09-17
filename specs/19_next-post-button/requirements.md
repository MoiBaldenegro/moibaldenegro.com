# Requisitos — Botón de siguiente post en el detalle (feature 19)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-19-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-19-01 WHEN el post declara un siguiente, la página de detalle SHALL mostrar un enlace con el texto Siguiente artículo hacia la ruta de next.
REQ-19-02 WHEN el post omite el siguiente, la página de detalle SHALL omitir el enlace.
REQ-19-03 El enlace SHALL obtener su destino solo desde la entidad Post entregada por PostsRepository.
REQ-19-04 La hoja post-next.css SHALL estilar el enlace solo con tokens de tokens.css.
REQ-19-05 La hoja post-next.css SHALL presentar el enlace a ancho completo en 768 píxeles o menos.
REQ-19-06 La página de detalle y la hoja post-next.css SHALL respetar el límite de 100 líneas cada una.
