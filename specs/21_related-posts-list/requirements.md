# Requisitos — Lista de recomendados en el detalle (feature 21)

## Patrones EARS

# Una línea = un requerimiento = exactamente un SHALL. IDs REQ-21-<xx>.
# Keywords en mayúsculas. Sin verbos vagos.

## Requisitos

REQ-21-01 WHEN el post declara related, la página de detalle SHALL mostrar una lista de enlaces con el encabezado Recomendados hacia las rutas de related.
REQ-21-02 WHEN el post omite related, la página de detalle SHALL omitir la lista.
REQ-21-03 WHEN el post declara next y related, la página de detalle SHALL mostrar el botón de siguiente junto a la lista.
REQ-21-04 Los enlaces de la lista SHALL obtener sus destinos solo desde la entidad Post entregada por PostsRepository.
REQ-21-05 La hoja post-next.css SHALL estilar la lista solo con tokens de tokens.css.
REQ-21-06 La hoja post-next.css SHALL presentar la lista a ancho completo en 768 píxeles o menos.
REQ-21-07 La página de detalle y la hoja post-next.css SHALL respetar el límite de 100 líneas cada una.
